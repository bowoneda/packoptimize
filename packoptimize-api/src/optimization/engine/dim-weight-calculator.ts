import { CarrierType } from './types';

const MM_PER_INCH = 25.4;
const GRAMS_PER_LB = 453.592;
const USPS_EXEMPT_CUBIC_INCHES = 1728; // 1 cubic foot

export interface DimWeightResult {
  roundedDims: { length: number; width: number; height: number }; // inches, sorted L >= W >= H
  cubicInches: number;
  dimWeightLbs: number;
  dimWeightGrams: number;
  isExempt: boolean; // USPS < 1728 cu in
}

export interface BillableWeightResult {
  billableWeightGrams: number;
  billableWeightLbs: number;
  isDimWeightBillable: boolean; // true if DIM > actual
}

/**
 * Calculate DIM weight for a package.
 *
 * Rules:
 * - FedEx/UPS: ceil() each dimension to next whole inch BEFORE multiplying
 * - USPS: round() each dimension to nearest inch
 * - USPS exemption: if cubic inches <= 1728 (1 cubic foot), DIM weight = 0
 * - DIM weight (lbs) = ceil(cubic inches / dimDivisor)
 * - Dimensions are sorted so length >= width >= height
 */
export function calculateDimWeight(
  outerWidthMm: number,
  outerHeightMm: number,
  outerDepthMm: number,
  carrier: CarrierType,
  dimDivisor: number,
): DimWeightResult {
  // Convert mm to inches, rounding to 4 decimal places to avoid floating point errors
  // (e.g., 304.8 / 25.4 = 12.000000000000002 without rounding)
  const widthIn = parseFloat((outerWidthMm / MM_PER_INCH).toFixed(4));
  const heightIn = parseFloat((outerHeightMm / MM_PER_INCH).toFixed(4));
  const depthIn = parseFloat((outerDepthMm / MM_PER_INCH).toFixed(4));

  // Round per carrier rules
  const roundFn = carrier === 'USPS' ? Math.round : Math.ceil;
  const roundedW = roundFn(widthIn);
  const roundedH = roundFn(heightIn);
  const roundedD = roundFn(depthIn);

  // Sort so length >= width >= height
  const sorted = [roundedW, roundedH, roundedD].sort((a, b) => b - a);
  const roundedDims = {
    length: sorted[0],
    width: sorted[1],
    height: sorted[2],
  };

  const cubicInches = roundedDims.length * roundedDims.width * roundedDims.height;

  // USPS exemption: if cubic inches <= 1728, DIM weight = 0
  const isExempt = carrier === 'USPS' && cubicInches <= USPS_EXEMPT_CUBIC_INCHES;

  let dimWeightLbs = 0;
  let dimWeightGrams = 0;

  if (!isExempt) {
    dimWeightLbs = Math.ceil(cubicInches / dimDivisor);
    dimWeightGrams = dimWeightLbs * GRAMS_PER_LB;
  }

  return {
    roundedDims,
    cubicInches,
    dimWeightLbs,
    dimWeightGrams,
    isExempt,
  };
}

/**
 * Calculate billable weight = max(actual weight, DIM weight)
 */
export function calculateBillableWeight(
  totalWeightGrams: number,
  dimWeightGrams: number,
): BillableWeightResult {
  const billableWeightGrams = Math.max(totalWeightGrams, dimWeightGrams);
  const billableWeightLbs = billableWeightGrams / GRAMS_PER_LB;
  const isDimWeightBillable = dimWeightGrams > totalWeightGrams;

  return {
    billableWeightGrams,
    billableWeightLbs,
    isDimWeightBillable,
  };
}
