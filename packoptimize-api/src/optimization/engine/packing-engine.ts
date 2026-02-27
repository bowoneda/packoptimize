import { AvailableBox, PackableItem, Placement, Rotation } from './types';

interface Space {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

/**
 * Get the rotated dimensions [width, height, depth] for a given rotation.
 */
export function getRotatedDimensions(
  w: number,
  h: number,
  d: number,
  rotation: Rotation,
): [number, number, number] {
  switch (rotation) {
    case Rotation.WHD:
      return [w, h, d];
    case Rotation.HWD:
      return [h, w, d];
    case Rotation.HDW:
      return [h, d, w];
    case Rotation.DHW:
      return [d, h, w];
    case Rotation.DWH:
      return [d, w, h];
    case Rotation.WDH:
      return [w, d, h];
  }
}

/**
 * Get allowed rotations for an item based on its properties.
 * - canRotate && !isFragile: all 6 rotations
 * - canRotate && isFragile (this-side-up): rotations 0 and 3 only (height stays on Y)
 * - !canRotate: rotation 0 only
 */
function getAllowedRotations(item: PackableItem): Rotation[] {
  if (!item.canRotate) {
    return [Rotation.WHD];
  }
  if (item.isFragile) {
    // Only rotations that keep original height on Y axis
    return [Rotation.WHD, Rotation.DHW];
  }
  return [
    Rotation.WHD,
    Rotation.HWD,
    Rotation.HDW,
    Rotation.DHW,
    Rotation.DWH,
    Rotation.WDH,
  ];
}

/**
 * Sort items for packing:
 * 1. isFragile ASC (non-fragile first = bottom layers)
 * 2. volume DESC (biggest items first)
 * 3. weight DESC (heaviest items first among same-volume)
 */
function sortItemsForPacking(items: PackableItem[]): PackableItem[] {
  return [...items].sort((a, b) => {
    // Non-fragile first
    if (a.isFragile !== b.isFragile) {
      return a.isFragile ? 1 : -1;
    }
    // Bigger items first
    const volA = a.width * a.height * a.depth;
    const volB = b.width * b.height * b.depth;
    if (volA !== volB) return volB - volA;
    // Heavier items first
    return b.weight - a.weight;
  });
}

/**
 * Check if placing an item at a position would cause stacking weight violations.
 * An item placed above another item must not exceed that item's maxStackWeight.
 */
function checkStackingConstraint(
  placements: PlacementWithStack[],
  newItemWeight: number,
  newItemY: number,
): boolean {
  for (const existing of placements) {
    // Check if the new item is directly above the existing item
    if (
      existing.maxStackWeight !== undefined &&
      existing.maxStackWeight !== null
    ) {
      const existingTop = existing.y + existing.height;
      // The new item is "on top of" the existing item if its Y equals the existing top
      if (Math.abs(newItemY - existingTop) < 1) {
        // Calculate total weight already stacked above this item
        const weightAbove = placements
          .filter(
            (p) =>
              p !== existing &&
              p.y >= existingTop &&
              overlapsHorizontally(existing, p),
          )
          .reduce((sum, p) => sum + p.weight, 0);

        if (
          weightAbove + newItemWeight >
          (existing as PlacementWithStack).maxStackWeight!
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

interface PlacementWithStack extends Placement {
  maxStackWeight?: number | null;
}

function overlapsHorizontally(a: Placement, b: Placement): boolean {
  const axEnd = a.x + a.width;
  const azEnd = a.z + a.depth;
  const bxEnd = b.x + b.width;
  const bzEnd = b.z + b.depth;

  return a.x < bxEnd && axEnd > b.x && a.z < bzEnd && azEnd > b.z;
}

/**
 * Core 3D bin-packing algorithm using a layer-based best fit approach.
 *
 * The box is treated as a 3D space:
 * - X: width (left to right)
 * - Y: height (bottom to top)
 * - Z: depth (back to front)
 *
 * Maintains a list of available spaces. For each item, tries to find the
 * best-fitting space considering all allowed rotations.
 */
export function packItems(
  items: PackableItem[],
  box: AvailableBox,
): {
  packed: Placement[];
  unpacked: PackableItem[];
  utilization: number;
} {
  if (items.length === 0) {
    return { packed: [], unpacked: [], utilization: 0 };
  }

  const sorted = sortItemsForPacking(items);

  const spaces: Space[] = [
    {
      x: 0,
      y: 0,
      z: 0,
      width: box.innerWidth,
      height: box.innerHeight,
      depth: box.innerDepth,
    },
  ];

  const packed: PlacementWithStack[] = [];
  const unpacked: PackableItem[] = [];
  let currentWeight = 0;

  for (const item of sorted) {
    let placed = false;

    const rotations = getAllowedRotations(item);

    // Sort spaces: prefer bottom (Y ASC), then left (X ASC), then back (Z ASC)
    spaces.sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      if (a.x !== b.x) return a.x - b.x;
      return a.z - b.z;
    });

    for (const rotation of rotations) {
      if (placed) break;

      const [rw, rh, rd] = getRotatedDimensions(
        item.width,
        item.height,
        item.depth,
        rotation,
      );

      for (let si = 0; si < spaces.length; si++) {
        const space = spaces[si];

        // Check if item fits in this space
        if (rw > space.width || rh > space.height || rd > space.depth) {
          continue;
        }

        // Check weight constraint
        if (currentWeight + item.weight > box.maxWeight) {
          continue;
        }

        // Check stacking constraint
        if (
          !checkStackingConstraint(packed, item.weight, space.y)
        ) {
          continue;
        }

        // Place the item
        const placement: PlacementWithStack = {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          x: space.x,
          y: space.y,
          z: space.z,
          width: rw,
          height: rh,
          depth: rd,
          originalWidth: item.width,
          originalHeight: item.height,
          originalDepth: item.depth,
          weight: item.weight,
          rotation,
          isFragile: item.isFragile,
          maxStackWeight: item.maxStackWeight,
        };

        packed.push(placement);
        currentWeight += item.weight;

        // Split the space into up to 3 remaining spaces
        const newSpaces: Space[] = [];

        // Right space
        const rightW = space.width - rw;
        if (rightW > 0) {
          newSpaces.push({
            x: space.x + rw,
            y: space.y,
            z: space.z,
            width: rightW,
            height: space.height,
            depth: space.depth,
          });
        }

        // Top space
        const topH = space.height - rh;
        if (topH > 0) {
          newSpaces.push({
            x: space.x,
            y: space.y + rh,
            z: space.z,
            width: rw,
            height: topH,
            depth: space.depth,
          });
        }

        // Front space
        const frontD = space.depth - rd;
        if (frontD > 0) {
          newSpaces.push({
            x: space.x,
            y: space.y,
            z: space.z + rd,
            width: rw,
            height: rh,
            depth: frontD,
          });
        }

        // Remove the used space and add new ones
        spaces.splice(si, 1, ...newSpaces);

        placed = true;
        break;
      }
    }

    if (!placed) {
      unpacked.push(item);
    }
  }

  // Calculate utilization
  const boxVolume = box.innerWidth * box.innerHeight * box.innerDepth;
  const itemsVolume = packed.reduce(
    (sum, p) => sum + p.width * p.height * p.depth,
    0,
  );
  const utilization = boxVolume > 0 ? itemsVolume / boxVolume : 0;

  // Strip maxStackWeight from the returned placements (not part of Placement interface)
  const cleanPacked: Placement[] = packed.map(
    ({ maxStackWeight: _, ...rest }) => rest,
  );

  return { packed: cleanPacked, unpacked, utilization };
}
