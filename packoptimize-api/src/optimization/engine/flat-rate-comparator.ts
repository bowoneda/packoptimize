import { AvailableBox, CarrierType, FlatRateOption, PackableItem } from './types';
import { packItems } from './packing-engine';

const MM_PER_INCH = 25.4;
const GRAMS_PER_LB = 453.592;

interface FlatRateBoxDef {
  carrier: CarrierType;
  name: string;
  width: number; // inches
  height: number; // inches
  depth: number; // inches
  price: number; // USD
  maxWeightLbs: number;
}

const FLAT_RATE_BOXES: FlatRateBoxDef[] = [
  // USPS
  {
    carrier: 'USPS',
    name: 'USPS Small Flat Rate Box',
    width: 8.625,
    height: 5.375,
    depth: 1.625,
    price: 10.2,
    maxWeightLbs: 70,
  },
  {
    carrier: 'USPS',
    name: 'USPS Medium Flat Rate Box (1)',
    width: 11.25,
    height: 8.75,
    depth: 6,
    price: 17.1,
    maxWeightLbs: 70,
  },
  {
    carrier: 'USPS',
    name: 'USPS Medium Flat Rate Box (2)',
    width: 14,
    height: 12,
    depth: 3.5,
    price: 17.1,
    maxWeightLbs: 70,
  },
  {
    carrier: 'USPS',
    name: 'USPS Large Flat Rate Box',
    width: 12.25,
    height: 12.25,
    depth: 6,
    price: 22.8,
    maxWeightLbs: 70,
  },
  {
    carrier: 'USPS',
    name: 'USPS APO/FPO Large Flat Rate Box',
    width: 12.25,
    height: 12.25,
    depth: 6,
    price: 22.8,
    maxWeightLbs: 70,
  },
];

/**
 * Compare flat-rate box options against standard optimization cost.
 *
 * 1. Filter flat-rate boxes for the selected carrier
 * 2. For each box: convert to mm, run packItems to check fit
 * 3. Calculate weight and check against maxWeight
 * 4. Calculate savings vs standard cost
 * 5. Return sorted by price ASC
 */
export function compareFlatRateOptions(
  items: PackableItem[],
  standardCost: number,
  carrier: CarrierType,
): FlatRateOption[] {
  const carrierBoxes = FLAT_RATE_BOXES.filter((b) => b.carrier === carrier);

  if (carrierBoxes.length === 0) {
    return [];
  }

  const results: FlatRateOption[] = [];

  for (const frBox of carrierBoxes) {
    // Convert inches to mm for the packing engine
    const innerWidthMm = frBox.width * MM_PER_INCH;
    const innerHeightMm = frBox.height * MM_PER_INCH;
    const innerDepthMm = frBox.depth * MM_PER_INCH;

    // Create an AvailableBox for the packing engine
    const box: AvailableBox = {
      id: `flat-rate-${frBox.name}`,
      name: frBox.name,
      innerWidth: innerWidthMm,
      innerHeight: innerHeightMm,
      innerDepth: innerDepthMm,
      outerWidth: innerWidthMm, // Flat rate boxes: use inner dims as outer (doesn't matter for cost)
      outerHeight: innerHeightMm,
      outerDepth: innerDepthMm,
      boxWeight: 0, // Flat rate box weight doesn't affect price
      maxWeight: frBox.maxWeightLbs * GRAMS_PER_LB,
      cost: frBox.price,
    };

    const result = packItems(items, box);
    const itemsFit = result.unpacked.length === 0;

    const itemsWeightGrams = items.reduce((s, i) => s + i.weight * i.quantity, 0);
    // Rough fill estimate: 10% of box volume
    const estimatedFillWeightGrams = 50; // Minimal for flat rate
    const totalWeightLbs =
      (itemsWeightGrams + estimatedFillWeightGrams) / GRAMS_PER_LB;

    const weightOk = totalWeightLbs <= frBox.maxWeightLbs;
    const actuallyFits = itemsFit && weightOk;

    const savings = actuallyFits ? standardCost - frBox.price : 0;

    results.push({
      carrier: frBox.carrier,
      boxName: frBox.name,
      boxDimensions: {
        width: frBox.width,
        height: frBox.height,
        depth: frBox.depth,
      },
      price: frBox.price,
      maxWeight: frBox.maxWeightLbs,
      itemsFit: actuallyFits,
      totalWeight: totalWeightLbs,
      savings,
    });
  }

  // Sort by price ASC
  results.sort((a, b) => a.price - b.price);

  return results;
}
