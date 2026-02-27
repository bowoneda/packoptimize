import { FillMaterial, Placement, VoidFillResult } from './types';

const CUBIC_MM_PER_CUBIC_FT = 28316846.6;
const CUBIC_MM_PER_CUBIC_IN = 16387.064;
const GRAMS_PER_LB = 453.592;

// Fill material density factors (lbs per cubic foot) and cost per cubic foot
const FILL_DENSITIES: Record<FillMaterial, { density: number; costPerCuFt: number }> = {
  AIR_PILLOWS: { density: 0.2, costPerCuFt: 0.035 },
  KRAFT_PAPER: { density: 1.0, costPerCuFt: 0.055 },
  BUBBLE_WRAP: { density: 0.6, costPerCuFt: 0.115 },
  PACKING_PEANUTS: { density: 0.45, costPerCuFt: 0.07 },
  FOAM_IN_PLACE: { density: 1.5, costPerCuFt: 0.225 },
};

/**
 * Calculate void fill volume, weight, and cost.
 *
 * 1. Box inner volume = W x H x D (cubic mm)
 * 2. Total item volume = sum of each placement's width x height x depth (cubic mm)
 * 3. Void volume = box inner volume - total item volume (cubic mm)
 * 4. Convert void volume to cubic feet (divide by 28316846.6)
 * 5. Fill weight = void volume (cu ft) x density (lbs/cu ft) -> convert to grams
 * 6. Fill cost = void volume (cu ft) x costPerCuFt
 */
export function calculateVoidFill(
  boxInnerWidthMm: number,
  boxInnerHeightMm: number,
  boxInnerDepthMm: number,
  placements: Placement[],
  fillMaterial: FillMaterial,
): VoidFillResult {
  const boxVolume = boxInnerWidthMm * boxInnerHeightMm * boxInnerDepthMm;

  const itemsVolume = placements.reduce(
    (sum, p) => sum + p.width * p.height * p.depth,
    0,
  );

  const voidVolumeCubicMm = Math.max(0, boxVolume - itemsVolume);
  const voidVolumeCubicIn = voidVolumeCubicMm / CUBIC_MM_PER_CUBIC_IN;
  const voidVolumeCuFt = voidVolumeCubicMm / CUBIC_MM_PER_CUBIC_FT;

  const fillProps = FILL_DENSITIES[fillMaterial];
  const fillWeightLbs = voidVolumeCuFt * fillProps.density;
  const fillWeightGrams = fillWeightLbs * GRAMS_PER_LB;
  const fillCostUsd = voidVolumeCuFt * fillProps.costPerCuFt;

  return {
    voidVolumeCubicMm,
    voidVolumeCubicIn,
    fillWeightGrams,
    fillCostUsd,
    materialUsed: fillMaterial,
  };
}
