import { CarrierRules, Surcharge } from './types';

const MM_PER_INCH = 25.4;
const GRAMS_PER_LB = 453.592;

export interface CarrierValidationResult {
  isValid: boolean; // false if package exceeds hard limits
  violations: string[]; // Human-readable violation messages
  surcharges: Surcharge[]; // Triggered surcharges with amounts
  adjustedBillableWeight: number | null; // If AHS min billable weight applies (grams)
}

/**
 * Validate a packed box against carrier constraints and calculate surcharges.
 *
 * Checks (in order):
 * 1. Max length - INVALID if exceeded
 * 2. Max girth (L + 2*(W+H)) - INVALID if exceeded
 * 3. Max weight - INVALID if exceeded
 * 4. AHS-Dimension (length) - surcharge if longest > threshold
 * 5. AHS-Dimension (width) - surcharge if second-longest > threshold
 * 6. AHS-Dimension (cubic) - surcharge if cubic inches > threshold
 * 7. Oversize (cubic) - surcharge if cubic inches > threshold
 * 8. AHS minimum billable weight
 *
 * Only the HIGHEST AHS surcharge applies (don't stack AHS).
 * AHS and Oversize CAN both apply.
 */
export function validateCarrierConstraints(
  packedBox: {
    outerWidthMm: number;
    outerHeightMm: number;
    outerDepthMm: number;
    totalWeightGrams: number;
  },
  carrierRules: CarrierRules,
): CarrierValidationResult {
  const violations: string[] = [];
  const ahsSurcharges: Surcharge[] = [];
  let oversizeSurcharge: Surcharge | null = null;
  let isValid = true;

  // Convert to inches and sort: length >= width >= height
  const dims = [
    packedBox.outerWidthMm / MM_PER_INCH,
    packedBox.outerHeightMm / MM_PER_INCH,
    packedBox.outerDepthMm / MM_PER_INCH,
  ].sort((a, b) => b - a);

  const lengthIn = dims[0];
  const widthIn = dims[1];
  const heightIn = dims[2];
  const girthIn = lengthIn + 2 * (widthIn + heightIn);
  const cubicInches = lengthIn * widthIn * heightIn;
  const totalWeightLbs = packedBox.totalWeightGrams / GRAMS_PER_LB;

  // 1. Max length check
  if (lengthIn > carrierRules.maxLengthInches) {
    isValid = false;
    violations.push(
      `Package length ${lengthIn.toFixed(1)}" exceeds ${carrierRules.carrier} maximum of ${carrierRules.maxLengthInches}".`,
    );
  }

  // 2. Max girth check
  if (girthIn > carrierRules.maxGirthInches) {
    isValid = false;
    violations.push(
      `Package girth ${girthIn.toFixed(1)}" exceeds ${carrierRules.carrier} maximum of ${carrierRules.maxGirthInches}".`,
    );
  }

  // 3. Max weight check
  if (totalWeightLbs > carrierRules.maxWeightLbs) {
    isValid = false;
    violations.push(
      `Package weight ${totalWeightLbs.toFixed(1)} lbs exceeds ${carrierRules.carrier} maximum of ${carrierRules.maxWeightLbs} lbs.`,
    );
  }

  // 4. AHS-Dimension (length threshold)
  if (
    carrierRules.ahsLengthThreshold !== null &&
    lengthIn > carrierRules.ahsLengthThreshold &&
    carrierRules.surchargeRates.ahsDimension
  ) {
    ahsSurcharges.push({
      type: 'AHS_DIMENSION',
      amount: carrierRules.surchargeRates.ahsDimension,
      reason: `Longest side ${lengthIn.toFixed(1)}" exceeds AHS length threshold of ${carrierRules.ahsLengthThreshold}".`,
    });
  }

  // 5. AHS-Dimension (width threshold)
  if (
    carrierRules.ahsWidthThreshold !== null &&
    widthIn > carrierRules.ahsWidthThreshold &&
    carrierRules.surchargeRates.ahsDimension
  ) {
    ahsSurcharges.push({
      type: 'AHS_DIMENSION',
      amount: carrierRules.surchargeRates.ahsDimension,
      reason: `Second-longest side ${widthIn.toFixed(1)}" exceeds AHS width threshold of ${carrierRules.ahsWidthThreshold}".`,
    });
  }

  // 6. AHS-Dimension (cubic threshold)
  if (
    carrierRules.ahsCubicThreshold !== null &&
    cubicInches > carrierRules.ahsCubicThreshold &&
    carrierRules.surchargeRates.ahsDimension
  ) {
    ahsSurcharges.push({
      type: 'AHS_DIMENSION',
      amount: carrierRules.surchargeRates.ahsDimension,
      reason: `Cubic volume ${cubicInches.toFixed(0)} cu in exceeds AHS threshold of ${carrierRules.ahsCubicThreshold} cu in.`,
    });
  }

  // 7. Oversize (cubic threshold)
  if (
    carrierRules.oversizeCubicThreshold !== null &&
    cubicInches > carrierRules.oversizeCubicThreshold &&
    carrierRules.surchargeRates.oversize
  ) {
    oversizeSurcharge = {
      type: 'OVERSIZE',
      amount: carrierRules.surchargeRates.oversize,
      reason: `Cubic volume ${cubicInches.toFixed(0)} cu in exceeds oversize threshold of ${carrierRules.oversizeCubicThreshold} cu in.`,
    };
  }

  // Combine surcharges: only highest AHS + oversize (if applicable)
  const finalSurcharges: Surcharge[] = [];

  if (ahsSurcharges.length > 0) {
    // Pick the highest AHS surcharge
    const highestAhs = ahsSurcharges.reduce((max, s) =>
      s.amount > max.amount ? s : max,
    );
    finalSurcharges.push(highestAhs);
  }

  if (oversizeSurcharge) {
    finalSurcharges.push(oversizeSurcharge);
  }

  // 8. AHS minimum billable weight
  let adjustedBillableWeight: number | null = null;
  if (
    ahsSurcharges.length > 0 &&
    carrierRules.ahsMinBillableWeight !== null
  ) {
    adjustedBillableWeight = carrierRules.ahsMinBillableWeight * GRAMS_PER_LB;
  }

  return {
    isValid,
    violations,
    surcharges: finalSurcharges,
    adjustedBillableWeight,
  };
}
