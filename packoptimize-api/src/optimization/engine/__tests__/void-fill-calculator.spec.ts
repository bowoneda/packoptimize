import { calculateVoidFill } from '../void-fill-calculator';
import { Placement, Rotation } from '../types';

function makePlacement(overrides: Partial<Placement> = {}): Placement {
  return {
    itemId: 'item-1',
    sku: 'TEST',
    name: 'Test',
    x: 0,
    y: 0,
    z: 0,
    width: 152.4,
    height: 152.4,
    depth: 152.4,
    originalWidth: 152.4,
    originalHeight: 152.4,
    originalDepth: 152.4,
    weight: 500,
    rotation: Rotation.WHD,
    isFragile: false,
    ...overrides,
  };
}

const CUBIC_MM_PER_CUBIC_FT = 28316846.6;
const GRAMS_PER_LB = 453.592;

describe('VoidFillCalculator', () => {
  // Test 40: Box 12" cube with item 6" cube - verify void volume
  it('should calculate correct void volume for 12" box with 6" item', () => {
    const boxMm = 304.8; // 12 inches
    const itemMm = 152.4; // 6 inches

    const result = calculateVoidFill(
      boxMm,
      boxMm,
      boxMm,
      [makePlacement({ width: itemMm, height: itemMm, depth: itemMm })],
      'AIR_PILLOWS',
    );

    const boxVol = boxMm * boxMm * boxMm;
    const itemVol = itemMm * itemMm * itemMm;
    const expectedVoid = boxVol - itemVol;

    expect(result.voidVolumeCubicMm).toBeCloseTo(expectedVoid, 0);
  });

  // Test 41: AIR_PILLOWS density correct
  it('should use correct density for AIR_PILLOWS', () => {
    const boxMm = 304.8;
    const itemMm = 152.4;

    const result = calculateVoidFill(
      boxMm,
      boxMm,
      boxMm,
      [makePlacement({ width: itemMm, height: itemMm, depth: itemMm })],
      'AIR_PILLOWS',
    );

    const voidCuFt = result.voidVolumeCubicMm / CUBIC_MM_PER_CUBIC_FT;
    const expectedWeight = voidCuFt * 0.2 * GRAMS_PER_LB; // 0.2 lbs/cu ft density

    expect(result.fillWeightGrams).toBeCloseTo(expectedWeight, 1);
  });

  // Test 42: KRAFT_PAPER density > AIR_PILLOWS
  it('should calculate higher fill weight for KRAFT_PAPER than AIR_PILLOWS', () => {
    const boxMm = 304.8;
    const itemMm = 152.4;
    const placements = [makePlacement({ width: itemMm, height: itemMm, depth: itemMm })];

    const airResult = calculateVoidFill(boxMm, boxMm, boxMm, placements, 'AIR_PILLOWS');
    const kraftResult = calculateVoidFill(boxMm, boxMm, boxMm, placements, 'KRAFT_PAPER');

    expect(kraftResult.fillWeightGrams).toBeGreaterThan(airResult.fillWeightGrams);
  });

  // Test 43: Fill cost calculation
  it('should calculate fill cost correctly', () => {
    const boxMm = 304.8;
    const itemMm = 152.4;

    const result = calculateVoidFill(
      boxMm,
      boxMm,
      boxMm,
      [makePlacement({ width: itemMm, height: itemMm, depth: itemMm })],
      'AIR_PILLOWS',
    );

    const voidCuFt = result.voidVolumeCubicMm / CUBIC_MM_PER_CUBIC_FT;
    const expectedCost = voidCuFt * 0.035; // $0.035 per cu ft for air pillows

    expect(result.fillCostUsd).toBeCloseTo(expectedCost, 4);
  });
});
