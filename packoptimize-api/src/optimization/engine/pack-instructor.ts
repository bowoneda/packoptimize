import { FillMaterial, Placement, Rotation, VoidFillResult } from './types';

const CUBIC_MM_PER_CUBIC_IN = 16387.064;

const FILL_MATERIAL_NAMES: Record<FillMaterial, string> = {
  AIR_PILLOWS: 'air pillows',
  KRAFT_PAPER: 'kraft paper',
  BUBBLE_WRAP: 'bubble wrap',
  PACKING_PEANUTS: 'packing peanuts',
  FOAM_IN_PLACE: 'foam-in-place',
};

function describePosition(placement: Placement, index: number, sorted: Placement[]): string {
  const isBottom = placement.y === 0;
  const isLeftBack = placement.x === 0 && placement.z === 0;

  if (isBottom && isLeftBack) {
    return 'flat on the bottom, positioned at the left-back corner';
  }
  if (isBottom) {
    // Find the previous item at the same Y level
    const prev = sorted[index - 1];
    if (prev) {
      return `on the bottom, next to ${prev.name}`;
    }
    return 'flat on the bottom';
  }
  // Stacked on top
  const below = sorted
    .slice(0, index)
    .filter((p) => p.y + p.height <= placement.y)
    .pop();
  if (below) {
    return `on top of ${below.name}`;
  }
  return `at position (${placement.x}mm, ${placement.y}mm, ${placement.z}mm)`;
}

function describeRotation(rotation: Rotation): string | null {
  switch (rotation) {
    case Rotation.WHD:
      return null; // Original orientation
    case Rotation.HWD:
      return 'rotated 90° (height and width swapped)';
    case Rotation.HDW:
      return 'placed on its side (height-depth-width orientation)';
    case Rotation.DHW:
      return 'placed on its end (depth-height-width orientation)';
    case Rotation.DWH:
      return 'rotated (depth-width-height orientation)';
    case Rotation.WDH:
      return 'placed on its side (width-depth-height orientation)';
  }
}

/**
 * Generate human-readable packing instructions from placements.
 *
 * 1. Sort placements by Y (bottom to top), then X (left to right), then Z (back to front)
 * 2. Generate step-by-step instructions
 * 3. Add void fill instruction if > 10% void
 * 4. Final step: close and seal
 */
export function generatePackInstructions(
  placements: Placement[],
  boxName: string,
  voidFill: VoidFillResult,
  fillMaterial: FillMaterial,
): string[] {
  const instructions: string[] = [];

  // Sort placements: Y ASC, X ASC, Z ASC
  const sorted = [...placements].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.z - b.z;
  });

  let step = 1;

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const position = describePosition(p, i, sorted);
    const rotationDesc = describeRotation(p.rotation);

    let instruction = `Step ${step}: Place ${p.name} (SKU: ${p.sku}) ${position}.`;

    if (rotationDesc) {
      instruction += ` ${rotationDesc[0].toUpperCase() + rotationDesc.slice(1)}.`;
    }

    if (p.isFragile) {
      instruction += ' ⚠ FRAGILE — handle with care, ensure adequate cushioning.';
    }

    instructions.push(instruction);
    step++;
  }

  // Void fill instruction if void > 10% of box volume
  // We check by comparing void volume to total box volume
  const totalItemVolume = placements.reduce((s, p) => s + p.width * p.height * p.depth, 0);
  const totalVolume = voidFill.voidVolumeCubicMm + totalItemVolume;
  const voidPercent = totalVolume > 0 ? voidFill.voidVolumeCubicMm / totalVolume : 0;

  if (voidPercent > 0.1) {
    const voidCubicIn = Math.round(voidFill.voidVolumeCubicIn);
    const materialName = FILL_MATERIAL_NAMES[fillMaterial];
    instructions.push(
      `Step ${step}: Fill remaining void space (~${voidCubicIn} cubic inches) with ${materialName}.`,
    );
    step++;
  }

  // Final step
  instructions.push(
    `Step ${step}: Close box and seal with tape. Ensure no items shift when shaken gently.`,
  );

  return instructions;
}
