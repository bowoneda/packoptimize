import {
  AvailableBox,
  CarrierRules,
  FillMaterial,
  OptimizationOptions,
  PackableItem,
  PackedBox,
  UnpackedItem,
} from './types';
import { packItems } from './packing-engine';
import { calculateDimWeight, calculateBillableWeight } from './dim-weight-calculator';
import { validateCarrierConstraints } from './carrier-validator';
import { calculateVoidFill } from './void-fill-calculator';
import { generatePackInstructions } from './pack-instructor';
import { resolveCompatibilityGroups } from './compatibility-resolver';

/**
 * Expand items by quantity: an item with quantity=3 becomes 3 individual items.
 */
function expandItems(items: PackableItem[]): PackableItem[] {
  const expanded: PackableItem[] = [];
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      expanded.push({ ...item, quantity: 1 });
    }
  }
  return expanded;
}

/**
 * Build a complete PackedBox with all calculated fields.
 */
function buildPackedBox(
  box: AvailableBox,
  result: ReturnType<typeof packItems>,
  carrierRules: CarrierRules,
  fillMaterial: FillMaterial,
  boxIndex: number,
): PackedBox {
  const itemsWeight = result.packed.reduce((s, p) => s + p.weight, 0);

  // Calculate void fill
  const voidFill = calculateVoidFill(
    box.innerWidth,
    box.innerHeight,
    box.innerDepth,
    result.packed,
    fillMaterial,
  );

  const fillWeight = voidFill.fillWeightGrams;
  const totalWeight = itemsWeight + box.boxWeight + fillWeight;

  // Calculate DIM weight
  const dimResult = calculateDimWeight(
    box.outerWidth,
    box.outerHeight,
    box.outerDepth,
    carrierRules.carrier,
    carrierRules.dimDivisor,
  );

  const billableResult = calculateBillableWeight(totalWeight, dimResult.dimWeightGrams);

  // Validate carrier constraints
  const validation = validateCarrierConstraints(
    {
      outerWidthMm: box.outerWidth,
      outerHeightMm: box.outerHeight,
      outerDepthMm: box.outerDepth,
      totalWeightGrams: totalWeight,
    },
    carrierRules,
  );

  // Adjust billable weight if AHS minimum applies
  let billableWeightGrams = billableResult.billableWeightGrams;
  if (validation.adjustedBillableWeight !== null) {
    billableWeightGrams = Math.max(
      billableWeightGrams,
      validation.adjustedBillableWeight,
    );
  }

  // Generate pack instructions
  const packInstructions = generatePackInstructions(
    result.packed,
    box.name,
    voidFill,
    fillMaterial,
  );

  // Calculate surcharge total
  const surchargeTotal = validation.surcharges.reduce((s, sc) => s + sc.amount, 0);

  const totalCost = box.cost + surchargeTotal + voidFill.fillCostUsd;

  return {
    boxId: box.id,
    boxName: box.name,
    boxIndex,
    box,
    placements: result.packed,
    utilization: result.utilization,
    itemsWeight,
    boxWeight: box.boxWeight,
    fillWeight,
    totalWeight,
    dimWeightGrams: dimResult.dimWeightGrams,
    billableWeightGrams,
    roundedOuterDims: dimResult.roundedDims,
    boxMaterialCost: box.cost,
    estimatedShippingCost: 0, // No rate table available
    surcharges: validation.surcharges,
    totalCost,
    voidFill,
    packInstructions,
  };
}

/**
 * Calculate naive cost: pack each item individually in the smallest box that fits.
 */
function calculateNaiveCost(
  items: PackableItem[],
  availableBoxes: AvailableBox[],
): number {
  let totalCost = 0;
  const sortedBoxes = [...availableBoxes].sort(
    (a, b) =>
      a.innerWidth * a.innerHeight * a.innerDepth -
      b.innerWidth * b.innerHeight * b.innerDepth,
  );

  for (const item of items) {
    let boxCost = 0;
    for (const box of sortedBoxes) {
      // Check if item fits in any rotation
      const dims = [
        [item.width, item.height, item.depth],
        [item.height, item.width, item.depth],
        [item.height, item.depth, item.width],
        [item.depth, item.height, item.width],
        [item.depth, item.width, item.height],
        [item.width, item.depth, item.height],
      ];

      const fits = dims.some(
        ([w, h, d]) =>
          w <= box.innerWidth &&
          h <= box.innerHeight &&
          d <= box.innerDepth &&
          item.weight <= box.maxWeight,
      );

      if (fits) {
        boxCost = box.cost;
        break;
      }
    }

    // If no box fits, use the largest box cost as fallback
    if (boxCost === 0 && sortedBoxes.length > 0) {
      boxCost = sortedBoxes[sortedBoxes.length - 1].cost;
    }

    totalCost += boxCost;
  }

  return totalCost;
}

/**
 * Orchestrates multi-box selection to minimize total cost.
 *
 * 1. Expand items by quantity
 * 2. Add insert materials as packable items
 * 3. Resolve compatibility groups
 * 4. For each group, find optimal single-box or multi-box solution
 * 5. Compare costs and pick cheapest
 * 6. Calculate naive cost for savings comparison
 */
export function selectOptimalBoxes(
  items: PackableItem[],
  availableBoxes: AvailableBox[],
  carrierRules: CarrierRules,
  options: OptimizationOptions,
): {
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];
  naiveCost: number;
} {
  if (items.length === 0 || availableBoxes.length === 0) {
    return { packedBoxes: [], unpackedItems: [], naiveCost: 0 };
  }

  // 1. Expand items by quantity
  const expandedItems = expandItems(items);

  // 2. Add insert materials as packable items
  const insertItems: PackableItem[] = options.insertMaterials.map((ins) => ({
    id: ins.id,
    sku: `INSERT-${ins.id}`,
    name: ins.name,
    width: ins.width,
    height: ins.height,
    depth: ins.depth,
    weight: ins.weight,
    isFragile: false,
    canRotate: true,
    maxStackWeight: null,
    quantity: 1,
  }));

  const allItems = [...expandedItems, ...insertItems];

  // 3. Resolve compatibility groups
  const { groups } = resolveCompatibilityGroups(allItems, options.compatibilityRules);

  // Sort boxes by inner volume ASC
  const sortedBoxes = [...availableBoxes].sort(
    (a, b) =>
      a.innerWidth * a.innerHeight * a.innerDepth -
      b.innerWidth * b.innerHeight * b.innerDepth,
  );

  const allPackedBoxes: PackedBox[] = [];
  const allUnpackedItems: UnpackedItem[] = [];
  let boxIndex = 1;

  // 4. Process each compatibility group
  for (const group of groups) {
    // Try single-box solutions first
    let bestSingleBox: PackedBox | null = null;
    let bestSingleCost = Infinity;

    for (const box of sortedBoxes) {
      const result = packItems(group, box);

      if (result.unpacked.length === 0) {
        // All items fit in one box
        const packedBox = buildPackedBox(
          box,
          result,
          carrierRules,
          options.fillMaterial,
          boxIndex,
        );

        if (packedBox.totalCost < bestSingleCost) {
          bestSingleCost = packedBox.totalCost;
          bestSingleBox = packedBox;
        }
      }
    }

    // Try multi-box solution
    const multiBoxResult = packMultiBox(
      group,
      sortedBoxes,
      carrierRules,
      options.fillMaterial,
      boxIndex,
      options.maxBoxes - allPackedBoxes.length,
    );

    const multiBoxCost = multiBoxResult.packedBoxes.reduce(
      (s, b) => s + b.totalCost,
      0,
    );

    // Pick cheapest option
    if (bestSingleBox && bestSingleCost <= multiBoxCost) {
      bestSingleBox.boxIndex = boxIndex;
      allPackedBoxes.push(bestSingleBox);
      boxIndex++;
    } else if (multiBoxResult.packedBoxes.length > 0) {
      for (const pb of multiBoxResult.packedBoxes) {
        pb.boxIndex = boxIndex;
        allPackedBoxes.push(pb);
        boxIndex++;
      }
      for (const ui of multiBoxResult.unpackedItems) {
        allUnpackedItems.push(ui);
      }
    } else {
      // Nothing fits - add all items as unpacked
      for (const item of group) {
        allUnpackedItems.push({
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          reason: 'NO_COMPATIBLE_BOX',
        });
      }
    }
  }

  // 6. Calculate naive cost
  const naiveCost = calculateNaiveCost(expandedItems, availableBoxes);

  return {
    packedBoxes: allPackedBoxes,
    unpackedItems: allUnpackedItems,
    naiveCost,
  };
}

/**
 * Greedy first-fit multi-box packing with box downsizing.
 */
function greedyFirstFitAssign(
  items: PackableItem[],
  sortedBoxes: AvailableBox[],
  maxBoxes: number,
): {
  openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }>;
  unpackedItems: UnpackedItem[];
} {
  // Sort items by volume DESC for greedy assignment
  const remaining = [...items].sort((a, b) => {
    const volA = a.width * a.height * a.depth;
    const volB = b.width * b.height * b.depth;
    return volB - volA;
  });

  const openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }> = [];
  const unpackedItems: UnpackedItem[] = [];

  for (const item of remaining) {
    let assigned = false;

    // Try to fit in an existing open box
    for (const openBox of openBoxes) {
      const testItems = [...openBox.items, item];
      const result = packItems(testItems, openBox.box);

      if (result.unpacked.length === 0) {
        openBox.items.push(item);
        assigned = true;
        break;
      }
    }

    // If not, open a new box (if allowed)
    if (!assigned && openBoxes.length < maxBoxes) {
      // Find smallest box that fits this item
      for (const box of sortedBoxes) {
        const result = packItems([item], box);
        if (result.unpacked.length === 0) {
          openBoxes.push({ box, items: [item] });
          assigned = true;
          break;
        }
      }
    }

    if (!assigned) {
      unpackedItems.push({
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        reason: 'EXCEEDS_ALL_BOX_DIMENSIONS',
      });
    }
  }

  return { openBoxes, unpackedItems };
}

/**
 * Downsize each open box to the cheapest box type that still fits all its items.
 */
function downsizeBoxes(
  openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }>,
  sortedBoxes: AvailableBox[],
): void {
  for (const openBox of openBoxes) {
    let bestBox = openBox.box;
    let bestCost = openBox.box.cost;

    for (const candidate of sortedBoxes) {
      if (candidate.cost >= bestCost) continue;
      const result = packItems(openBox.items, candidate);
      if (result.unpacked.length === 0) {
        bestBox = candidate;
        bestCost = candidate.cost;
      }
    }

    openBox.box = bestBox;
  }
}

/**
 * Individual boxing strategy: each item in its own cheapest box.
 */
function individualBoxAssign(
  items: PackableItem[],
  sortedBoxes: AvailableBox[],
  maxBoxes: number,
): {
  openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }>;
  unpackedItems: UnpackedItem[];
} {
  const openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }> = [];
  const unpackedItems: UnpackedItem[] = [];

  for (const item of items) {
    if (openBoxes.length >= maxBoxes) {
      unpackedItems.push({
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        reason: 'EXCEEDS_MAX_BOXES',
      });
      continue;
    }

    let bestBox: AvailableBox | null = null;
    let bestCost = Infinity;

    for (const box of sortedBoxes) {
      if (box.cost >= bestCost) continue;
      const result = packItems([item], box);
      if (result.unpacked.length === 0) {
        bestBox = box;
        bestCost = box.cost;
      }
    }

    if (bestBox) {
      openBoxes.push({ box: bestBox, items: [item] });
    } else {
      unpackedItems.push({
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        reason: 'EXCEEDS_ALL_BOX_DIMENSIONS',
      });
    }
  }

  return { openBoxes, unpackedItems };
}

/**
 * Calculate total box material + surcharge + fill cost for a set of open boxes.
 */
function estimateOpenBoxCost(
  openBoxes: Array<{ box: AvailableBox; items: PackableItem[] }>,
  carrierRules: CarrierRules,
  fillMaterial: FillMaterial,
  startIndex: number,
): PackedBox[] {
  const result: PackedBox[] = [];
  let idx = startIndex;
  for (const openBox of openBoxes) {
    const packResult = packItems(openBox.items, openBox.box);
    const packedBox = buildPackedBox(
      openBox.box,
      packResult,
      carrierRules,
      fillMaterial,
      idx,
    );
    result.push(packedBox);
    idx++;
  }
  return result;
}

/**
 * Multi-box packing: tries multiple strategies and picks cheapest.
 *
 * Strategy 1: Greedy first-fit + box downsizing
 * Strategy 2: Individual boxing (each item in cheapest box)
 */
function packMultiBox(
  items: PackableItem[],
  sortedBoxes: AvailableBox[],
  carrierRules: CarrierRules,
  fillMaterial: FillMaterial,
  startIndex: number,
  maxBoxes: number,
): {
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];
} {
  // Strategy 1: Greedy first-fit with box downsizing
  const greedy = greedyFirstFitAssign(items, sortedBoxes, maxBoxes);
  downsizeBoxes(greedy.openBoxes, sortedBoxes);
  const greedyBoxes = estimateOpenBoxCost(
    greedy.openBoxes,
    carrierRules,
    fillMaterial,
    startIndex,
  );
  const greedyCost = greedyBoxes.reduce((s, b) => s + b.totalCost, 0);

  // Strategy 2: Individual boxing (each item in cheapest box)
  const individual = individualBoxAssign(items, sortedBoxes, maxBoxes);
  const individualBoxes = estimateOpenBoxCost(
    individual.openBoxes,
    carrierRules,
    fillMaterial,
    startIndex,
  );
  const individualCost = individualBoxes.reduce((s, b) => s + b.totalCost, 0);

  // Pick cheapest strategy
  if (greedyCost <= individualCost && greedy.unpackedItems.length <= individual.unpackedItems.length) {
    return { packedBoxes: greedyBoxes, unpackedItems: greedy.unpackedItems };
  }

  return { packedBoxes: individualBoxes, unpackedItems: individual.unpackedItems };
}
