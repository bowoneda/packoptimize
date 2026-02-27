import { calculateDimWeight, calculateBillableWeight } from '../dim-weight-calculator';

describe('DimWeightCalculator', () => {
  // Test 23: FedEx 12x12x12 inch box
  it('should calculate FedEx 12x12x12 correctly', () => {
    // 304.8mm = 12 inches exactly
    const result = calculateDimWeight(304.8, 304.8, 304.8, 'FEDEX', 139);
    expect(result.roundedDims).toEqual({ length: 12, width: 12, height: 12 });
    expect(result.cubicInches).toBe(1728);
    expect(result.dimWeightLbs).toBe(Math.ceil(1728 / 139)); // ceil(12.43) = 13
    expect(result.dimWeightLbs).toBe(13);
    expect(result.isExempt).toBe(false);
  });

  // Test 24: UPS 11.1x8.5x6.2 inch box - ceil rounds
  it('should calculate UPS with ceil rounding correctly', () => {
    // 11.1" = 281.94mm, 8.5" = 215.9mm, 6.2" = 157.48mm
    const result = calculateDimWeight(281.94, 215.9, 157.48, 'UPS', 139);
    // ceil(11.1)=12, ceil(8.5)=9, ceil(6.2)=7, sorted: 12>=9>=7
    expect(result.roundedDims).toEqual({ length: 12, width: 9, height: 7 });
    expect(result.cubicInches).toBe(756);
    expect(result.dimWeightLbs).toBe(Math.ceil(756 / 139)); // ceil(5.44) = 6
    expect(result.dimWeightLbs).toBe(6);
  });

  // Test 25: Same box via USPS - round() not ceil(), exempt < 1728
  it('should calculate USPS with round and apply exemption', () => {
    const result = calculateDimWeight(281.94, 215.9, 157.48, 'USPS', 166);
    // round(11.1)=11, round(8.5)=9, round(6.2)=6 (note: Math.round(8.5)=9 in JS)
    expect(result.roundedDims).toEqual({ length: 11, width: 9, height: 6 });
    expect(result.cubicInches).toBe(594);
    expect(result.isExempt).toBe(true);
    expect(result.dimWeightLbs).toBe(0);
    expect(result.dimWeightGrams).toBe(0);
  });

  // Test 26: USPS box > 1728 cubic inches
  it('should calculate USPS DIM weight when > 1728 cu in', () => {
    // 330.2mm = 13 inches exactly
    const result = calculateDimWeight(330.2, 330.2, 330.2, 'USPS', 166);
    expect(result.roundedDims).toEqual({ length: 13, width: 13, height: 13 });
    expect(result.cubicInches).toBe(2197);
    expect(result.isExempt).toBe(false);
    expect(result.dimWeightLbs).toBe(Math.ceil(2197 / 166)); // ceil(13.23) = 14
    expect(result.dimWeightLbs).toBe(14);
  });

  // Test 27: Billable weight - actual > DIM
  it('should use actual weight when > DIM weight', () => {
    // 20 lbs = 9072g, DIM = 13 lbs = 5896.696g
    const result = calculateBillableWeight(9072, 13 * 453.592);
    expect(result.billableWeightGrams).toBe(9072);
    expect(result.isDimWeightBillable).toBe(false);
  });

  // Test 28: Billable weight - DIM > actual
  it('should use DIM weight when > actual weight', () => {
    // 5 lbs = 2268g, DIM = 13 lbs = 5896.696g
    const dimGrams = 13 * 453.592;
    const result = calculateBillableWeight(2268, dimGrams);
    expect(result.billableWeightGrams).toBe(dimGrams);
    expect(result.isDimWeightBillable).toBe(true);
  });

  // Test 29: Dimensions sorted L >= W >= H
  it('should sort dimensions so length >= width >= height', () => {
    // Give dimensions in scrambled order
    const result = calculateDimWeight(200, 500, 300, 'FEDEX', 139);
    expect(result.roundedDims.length).toBeGreaterThanOrEqual(result.roundedDims.width);
    expect(result.roundedDims.width).toBeGreaterThanOrEqual(result.roundedDims.height);
  });

  // Test 30: USPS exactly 1728 cu in -> exempt (threshold is <= 1728)
  it('should exempt USPS at exactly 1728 cubic inches', () => {
    // 12x12x12 = 1728
    const result = calculateDimWeight(304.8, 304.8, 304.8, 'USPS', 166);
    expect(result.cubicInches).toBe(1728);
    expect(result.isExempt).toBe(true);
    expect(result.dimWeightLbs).toBe(0);
  });
});
