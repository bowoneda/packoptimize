import { generatePackInstructions } from '../pack-instructor';
import { Placement, Rotation, VoidFillResult } from '../types';

function makePlacement(overrides: Partial<Placement> = {}): Placement {
  return {
    itemId: 'item-1',
    sku: 'TEST-001',
    name: 'Test Item',
    x: 0,
    y: 0,
    z: 0,
    width: 100,
    height: 50,
    depth: 30,
    originalWidth: 100,
    originalHeight: 50,
    originalDepth: 30,
    weight: 500,
    rotation: Rotation.WHD,
    isFragile: false,
    ...overrides,
  };
}

function makeVoidFill(overrides: Partial<VoidFillResult> = {}): VoidFillResult {
  return {
    voidVolumeCubicMm: 5000000,
    voidVolumeCubicIn: 305,
    fillWeightGrams: 50,
    fillCostUsd: 0.15,
    materialUsed: 'AIR_PILLOWS',
    ...overrides,
  };
}

describe('PackInstructor', () => {
  // Test 44: Instructions array has at least as many entries as placements
  it('should generate at least as many instructions as placements', () => {
    const placements = [
      makePlacement({ itemId: '1', name: 'Item A', x: 0, y: 0, z: 0 }),
      makePlacement({ itemId: '2', name: 'Item B', x: 100, y: 0, z: 0 }),
    ];
    const voidFill = makeVoidFill();

    const instructions = generatePackInstructions(placements, 'Test Box', voidFill, 'AIR_PILLOWS');

    // At least 2 placement steps + closing step
    expect(instructions.length).toBeGreaterThanOrEqual(placements.length);
  });

  // Test 45: Fragile items have "FRAGILE" in instruction
  it('should include FRAGILE warning for fragile items', () => {
    const placements = [
      makePlacement({ isFragile: true, name: 'Fragile Vase' }),
    ];
    const voidFill = makeVoidFill();

    const instructions = generatePackInstructions(placements, 'Test Box', voidFill, 'AIR_PILLOWS');

    const fragileInstruction = instructions.find((i) =>
      i.toLowerCase().includes('fragile'),
    );
    expect(fragileInstruction).toBeDefined();
  });

  // Test 46: Void fill instruction when void > 10%
  it('should include void fill instruction when void > 10% of box volume', () => {
    const placements = [
      makePlacement({ width: 50, height: 50, depth: 50 }), // Small item, lots of void
    ];
    // Void is much more than 10% of total
    const voidFill = makeVoidFill({
      voidVolumeCubicMm: 20000000,
      voidVolumeCubicIn: 1220,
    });

    const instructions = generatePackInstructions(placements, 'Test Box', voidFill, 'KRAFT_PAPER');

    const fillInstruction = instructions.find(
      (i) => i.includes('void') || i.includes('Fill') || i.includes('kraft paper'),
    );
    expect(fillInstruction).toBeDefined();
  });

  // Test 47: Final instruction mentions closing/sealing
  it('should have a final instruction about closing and sealing', () => {
    const placements = [makePlacement()];
    const voidFill = makeVoidFill();

    const instructions = generatePackInstructions(placements, 'Test Box', voidFill, 'AIR_PILLOWS');

    const lastInstruction = instructions[instructions.length - 1];
    expect(lastInstruction.toLowerCase()).toMatch(/close|seal/);
  });
});
