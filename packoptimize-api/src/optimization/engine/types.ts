// === INPUT TYPES ===

export interface PackableItem {
  id: string;
  sku: string;
  name: string;
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  weight: number; // grams
  isFragile: boolean;
  canRotate: boolean;
  maxStackWeight: number | null; // grams - max weight this item can support on top
  quantity: number; // how many of this item to pack
}

export interface AvailableBox {
  id: string;
  name: string;
  innerWidth: number; // mm
  innerHeight: number; // mm
  innerDepth: number; // mm
  outerWidth: number; // mm
  outerHeight: number; // mm
  outerDepth: number; // mm
  boxWeight: number; // grams
  maxWeight: number; // grams (max content weight)
  cost: number; // USD material cost
}

export interface InsertItem {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  depth: number; // mm
  weight: number; // grams
}

export interface CompatibilityRule {
  itemIdA: string;
  itemIdB: string;
  rule: 'INCOMPATIBLE' | 'MUST_SHIP_TOGETHER';
}

export type CarrierType = 'FEDEX' | 'UPS' | 'USPS';
export type FillMaterial =
  | 'AIR_PILLOWS'
  | 'KRAFT_PAPER'
  | 'BUBBLE_WRAP'
  | 'PACKING_PEANUTS'
  | 'FOAM_IN_PLACE';
export type OptimizeTarget = 'COST' | 'SPACE' | 'FEWEST_BOXES';

export interface OptimizationOptions {
  carrier: CarrierType;
  optimizeFor: OptimizeTarget;
  maxBoxes: number; // default 10
  includeFlatRate: boolean; // default true
  fillMaterial: FillMaterial; // default AIR_PILLOWS
  insertMaterials: InsertItem[];
  compatibilityRules: CompatibilityRule[];
}

export interface CarrierRules {
  carrier: CarrierType;
  maxLengthInches: number;
  maxGirthInches: number; // L + 2*(W+H)
  maxWeightLbs: number;
  dimDivisor: number;
  ahsCubicThreshold: number | null; // cubic inches
  oversizeCubicThreshold: number | null;
  ahsLengthThreshold: number | null; // inches
  ahsWidthThreshold: number | null; // inches
  ahsMinBillableWeight: number | null; // lbs
  surchargeRates: {
    ahsDimension?: number; // USD
    ahsWeight?: number; // USD
    oversize?: number; // USD
    unauthorized?: number; // USD
  };
}

// === OUTPUT TYPES ===

// 6 possible rotations for a rectangular item
export enum Rotation {
  WHD = 0, // Original: width, height, depth
  HWD = 1, // Rotated: height, width, depth
  HDW = 2, // Rotated: height, depth, width
  DHW = 3, // Rotated: depth, height, width
  DWH = 4, // Rotated: depth, width, height
  WDH = 5, // Rotated: width, depth, height
}

export interface Placement {
  itemId: string;
  sku: string;
  name: string;
  // Position (bottom-left-back corner of item in the box)
  x: number; // mm from left wall
  y: number; // mm from bottom
  z: number; // mm from back wall
  // Dimensions as placed (after rotation)
  width: number; // mm (x-axis extent)
  height: number; // mm (y-axis extent)
  depth: number; // mm (z-axis extent)
  // Original dimensions
  originalWidth: number;
  originalHeight: number;
  originalDepth: number;
  weight: number; // grams
  rotation: Rotation;
  isFragile: boolean;
}

export interface Surcharge {
  type: string; // 'AHS_DIMENSION' | 'AHS_WEIGHT' | 'OVERSIZE' | 'UNAUTHORIZED'
  amount: number; // USD
  reason: string; // Human-readable explanation
}

export interface VoidFillResult {
  voidVolumeCubicMm: number;
  voidVolumeCubicIn: number;
  fillWeightGrams: number;
  fillCostUsd: number;
  materialUsed: FillMaterial;
}

export interface PackedBox {
  boxId: string;
  boxName: string;
  boxIndex: number; // 1-based
  box: AvailableBox; // The box type used
  placements: Placement[]; // Items placed in this box
  utilization: number; // 0-1 (volume used / box inner volume)

  // Weight breakdown
  itemsWeight: number; // grams - total weight of items
  boxWeight: number; // grams - weight of the box itself
  fillWeight: number; // grams - estimated void fill weight
  totalWeight: number; // grams - items + box + fill

  // DIM weight
  dimWeightGrams: number; // DIM weight in grams
  billableWeightGrams: number; // max(totalWeight, dimWeight)
  roundedOuterDims: {
    // Dimensions after carrier rounding (inches)
    length: number;
    width: number;
    height: number;
  };

  // Cost breakdown
  boxMaterialCost: number; // USD
  estimatedShippingCost: number; // USD (0 if no rate table available)
  surcharges: Surcharge[]; // Array of triggered surcharges
  totalCost: number; // USD (box + shipping + surcharges)

  // Void fill
  voidFill: VoidFillResult;

  // Pack instructions
  packInstructions: string[];
}

export interface FlatRateOption {
  carrier: CarrierType;
  boxName: string;
  boxDimensions: { width: number; height: number; depth: number }; // inches
  price: number; // USD
  maxWeight: number; // lbs
  itemsFit: boolean; // Whether all items fit
  totalWeight: number; // lbs (items + fill)
  savings: number; // USD compared to standard optimization
}

export interface UnpackedItem {
  itemId: string;
  sku: string;
  name: string;
  reason: string; // 'EXCEEDS_ALL_BOX_DIMENSIONS' | 'EXCEEDS_ALL_BOX_WEIGHT' | 'NO_COMPATIBLE_BOX'
}

export interface OptimizationResult {
  success: boolean;
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];

  // Summary
  totalBoxes: number;
  totalCost: number; // USD sum of all box costs
  totalWeight: number; // grams
  totalBillableWeight: number; // grams
  averageUtilization: number; // 0-1 average across all boxes

  // Savings comparison
  naiveCost: number; // USD - what smallest-box-per-item would cost
  optimizedCost: number; // USD - what our algorithm recommends
  savingsAmount: number; // USD
  savingsPercent: number; // 0-100

  // Flat rate comparison (if requested)
  flatRateOptions: FlatRateOption[];

  // Metadata
  algorithm: string;
  executionTimeMs: number;
  carrier: CarrierType;
}
