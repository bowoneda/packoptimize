import { validateCarrierConstraints } from '../carrier-validator';
import { CarrierRules } from '../types';

const MM_PER_INCH = 25.4;
const GRAMS_PER_LB = 453.592;

function makeFedExRules(overrides: Partial<CarrierRules> = {}): CarrierRules {
  return {
    carrier: 'FEDEX',
    maxLengthInches: 108,
    maxGirthInches: 165,
    maxWeightLbs: 150,
    dimDivisor: 139,
    ahsCubicThreshold: 10368,
    oversizeCubicThreshold: 17280,
    ahsLengthThreshold: 48,
    ahsWidthThreshold: 30,
    ahsMinBillableWeight: 40,
    surchargeRates: {
      ahsDimension: 31.45,
      oversize: 110.0,
    },
    ...overrides,
  };
}

describe('CarrierValidator', () => {
  // Test 31: Box with longest side 49" -> AHS surcharge
  it('should trigger AHS-Dimension surcharge for 49" longest side', () => {
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 49 * MM_PER_INCH,
        outerHeightMm: 20 * MM_PER_INCH,
        outerDepthMm: 20 * MM_PER_INCH,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    expect(result.isValid).toBe(true);
    const ahsSurcharge = result.surcharges.find((s) => s.type === 'AHS_DIMENSION');
    expect(ahsSurcharge).toBeDefined();
    expect(ahsSurcharge!.amount).toBeGreaterThan(0);
  });

  // Test 32: Box with longest side 47" -> No AHS (keep cubic below threshold too)
  it('should NOT trigger AHS for 47" longest side', () => {
    // Use small W/H so cubic stays below 10368 threshold: 47 * 10 * 10 = 4700 < 10368
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 47 * MM_PER_INCH,
        outerHeightMm: 10 * MM_PER_INCH,
        outerDepthMm: 10 * MM_PER_INCH,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    expect(result.isValid).toBe(true);
    const ahsSurcharge = result.surcharges.find((s) => s.type === 'AHS_DIMENSION');
    expect(ahsSurcharge).toBeUndefined();
  });

  // Test 33: Exactly 48" -> No AHS (threshold is > 48, not >=). Keep cubic below threshold too.
  it('should NOT trigger AHS at exactly 48" (threshold is strictly >)', () => {
    // 48 * 10 * 10 = 4800 < 10368, and widthIn=10 < 30 threshold
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 48 * MM_PER_INCH,
        outerHeightMm: 10 * MM_PER_INCH,
        outerDepthMm: 10 * MM_PER_INCH,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    const ahsSurcharge = result.surcharges.find((s) => s.type === 'AHS_DIMENSION');
    expect(ahsSurcharge).toBeUndefined();
  });

  // Test 34: Cubic volume 10,369 -> AHS cubic surcharge
  it('should trigger AHS cubic surcharge at 10369 cu in', () => {
    // Need cubic inches > 10368
    // 21.8 x 21.8 x 21.8 = ~10360 (close), use exact dims
    // 10369 = L * W * H. Use 49 * 15 * 14.12 ≈ 10368.2 -> too imprecise
    // Let's use: 22 x 22 x 21.43 = 10369.56
    const l = 22 * MM_PER_INCH;
    const w = 22 * MM_PER_INCH;
    const h = 21.44 * MM_PER_INCH; // 22*22*21.44 = 10376.32 > 10368
    const result = validateCarrierConstraints(
      {
        outerWidthMm: l,
        outerHeightMm: w,
        outerDepthMm: h,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    const ahsSurcharge = result.surcharges.find((s) => s.type === 'AHS_DIMENSION');
    expect(ahsSurcharge).toBeDefined();
  });

  // Test 35: Cubic volume 10,368 -> No AHS cubic
  it('should NOT trigger AHS cubic at exactly 10368 cu in', () => {
    // 10368 = 24 * 18 * 24
    const l = 24 * MM_PER_INCH;
    const w = 24 * MM_PER_INCH;
    const h = 18 * MM_PER_INCH;
    const result = validateCarrierConstraints(
      {
        outerWidthMm: l,
        outerHeightMm: w,
        outerDepthMm: h,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    // 24*24*18 = 10368, which is NOT > 10368
    const ahsCubic = result.surcharges.find(
      (s) => s.type === 'AHS_DIMENSION' && s.reason.includes('Cubic'),
    );
    expect(ahsCubic).toBeUndefined();
  });

  // Test 36: Cubic volume 17,281 -> Oversize surcharge
  it('should trigger Oversize surcharge at 17281 cu in', () => {
    // 26 * 26 * 25.58 = 17293 > 17280
    const l = 26 * MM_PER_INCH;
    const w = 26 * MM_PER_INCH;
    const h = 25.6 * MM_PER_INCH;
    const result = validateCarrierConstraints(
      {
        outerWidthMm: l,
        outerHeightMm: w,
        outerDepthMm: h,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    const oversizeSurcharge = result.surcharges.find((s) => s.type === 'OVERSIZE');
    expect(oversizeSurcharge).toBeDefined();
  });

  // Test 37: Exceeding 108" length for UPS -> invalid
  it('should mark as invalid when exceeding max length', () => {
    const upsRules = makeFedExRules({ carrier: 'UPS' });
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 110 * MM_PER_INCH,
        outerHeightMm: 20 * MM_PER_INCH,
        outerDepthMm: 20 * MM_PER_INCH,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      upsRules,
    );

    expect(result.isValid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
  });

  // Test 38: FedEx AHS -> adjusted billable weight = max(current, 40lbs)
  it('should set adjustedBillableWeight to 40lbs when AHS triggers', () => {
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 49 * MM_PER_INCH,
        outerHeightMm: 20 * MM_PER_INCH,
        outerDepthMm: 20 * MM_PER_INCH,
        totalWeightGrams: 10 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    expect(result.adjustedBillableWeight).not.toBeNull();
    expect(result.adjustedBillableWeight).toBeCloseTo(40 * GRAMS_PER_LB, 0);
  });

  // Test 39: Box within ALL limits -> valid, no surcharges
  it('should pass validation for a box within all limits', () => {
    const result = validateCarrierConstraints(
      {
        outerWidthMm: 12 * MM_PER_INCH,
        outerHeightMm: 12 * MM_PER_INCH,
        outerDepthMm: 12 * MM_PER_INCH,
        totalWeightGrams: 5 * GRAMS_PER_LB,
      },
      makeFedExRules(),
    );

    expect(result.isValid).toBe(true);
    expect(result.surcharges).toHaveLength(0);
    expect(result.violations).toHaveLength(0);
  });
});
