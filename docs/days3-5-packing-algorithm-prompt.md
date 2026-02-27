# PackOptimize — Days 3-5: Packing Algorithm + Optimization Engine

## Context

Phase 1 is complete. We have a working NestJS backend with:
- JWT + API Key authentication
- Multi-tenant isolation via PostgreSQL RLS
- CRUD endpoints for items, box-types, api-keys, carrier-rules
- Prisma schema with all models
- Docker Compose with PostgreSQL (dev + test) and Redis
- Seed data for SwiftShip and TechDirect tenants + carrier constraints
- Swagger docs at /api/docs

## What We're Building Now

The 3D bin-packing optimization engine — the technical centerpiece of the entire application. This is a standalone service module that:
1. Takes items + available boxes + configuration options as input
2. Runs a 3D bin-packing algorithm to determine optimal item placement
3. Calculates DIM weight using carrier-specific rules
4. Validates against carrier dimension limits and surcharge thresholds
5. Calculates void fill volume and weight
6. Generates human-readable pack station instructions
7. Compares against flat-rate box options
8. Returns a complete optimization result with cost analysis

## Architecture

The optimization engine is a set of pure, testable services that do NOT depend on the database directly. They receive data as function arguments and return results. The API controller and service layer handle the database interaction and pass data into the engine.

```
src/
├── optimization/
│   ├── optimization.module.ts
│   ├── optimization.controller.ts       // POST /v1/optimize endpoint
│   ├── optimization.service.ts          // Orchestrator: loads data, calls engine, saves results
│   ├── engine/
│   │   ├── packing-engine.ts            // Core 3D bin-packing algorithm
│   │   ├── box-selector.ts             // Cost-aware box selection and multi-box splitting
│   │   ├── dim-weight-calculator.ts     // DIM weight math per carrier
│   │   ├── carrier-validator.ts         // Surcharge detection and carrier limit checking
│   │   ├── void-fill-calculator.ts      // Void space and fill material estimation
│   │   ├── pack-instructor.ts           // Human-readable packing instructions
│   │   ├── flat-rate-comparator.ts      // Flat-rate box comparison engine
│   │   ├── compatibility-resolver.ts    // Item grouping based on compatibility rules
│   │   └── types.ts                     // All TypeScript interfaces
│   └── dto/
│       ├── optimize-request.dto.ts
│       └── optimize-response.dto.ts
```

## Step 1: Type Definitions (engine/types.ts)

Define all interfaces used by the engine. These are pure TypeScript types, NOT Prisma models.

```typescript
// === INPUT TYPES ===

export interface PackableItem {
  id: string;
  sku: string;
  name: string;
  width: number;   // mm
  height: number;  // mm
  depth: number;   // mm
  weight: number;  // grams
  isFragile: boolean;
  canRotate: boolean;
  maxStackWeight: number | null; // grams - max weight this item can support on top
  quantity: number; // how many of this item to pack
}

export interface AvailableBox {
  id: string;
  name: string;
  innerWidth: number;   // mm
  innerHeight: number;  // mm
  innerDepth: number;   // mm
  outerWidth: number;   // mm
  outerHeight: number;  // mm
  outerDepth: number;   // mm
  boxWeight: number;    // grams
  maxWeight: number;    // grams (max content weight)
  cost: number;         // USD material cost
}

export interface InsertItem {
  id: string;
  name: string;
  width: number;   // mm
  height: number;  // mm
  depth: number;   // mm
  weight: number;  // grams
}

export interface CompatibilityRule {
  itemIdA: string;
  itemIdB: string;
  rule: 'INCOMPATIBLE' | 'MUST_SHIP_TOGETHER';
}

export type CarrierType = 'FEDEX' | 'UPS' | 'USPS';
export type FillMaterial = 'AIR_PILLOWS' | 'KRAFT_PAPER' | 'BUBBLE_WRAP' | 'PACKING_PEANUTS' | 'FOAM_IN_PLACE';
export type OptimizeTarget = 'COST' | 'SPACE' | 'FEWEST_BOXES';

export interface OptimizationOptions {
  carrier: CarrierType;
  optimizeFor: OptimizeTarget;
  maxBoxes: number;          // default 10
  includeFlatRate: boolean;  // default true
  fillMaterial: FillMaterial; // default AIR_PILLOWS
  insertMaterials: InsertItem[];
  compatibilityRules: CompatibilityRule[];
}

export interface CarrierRules {
  carrier: CarrierType;
  maxLengthInches: number;
  maxGirthInches: number;     // L + 2*(W+H)
  maxWeightLbs: number;
  dimDivisor: number;
  ahsCubicThreshold: number | null;     // cubic inches
  oversizeCubicThreshold: number | null;
  ahsLengthThreshold: number | null;    // inches
  ahsWidthThreshold: number | null;     // inches
  ahsMinBillableWeight: number | null;  // lbs
  surchargeRates: {
    ahsDimension?: number;    // USD
    ahsWeight?: number;       // USD
    oversize?: number;        // USD
    unauthorized?: number;    // USD
  };
}

// === OUTPUT TYPES ===

// 6 possible rotations for a rectangular item
export enum Rotation {
  WHD = 0,  // Original: width, height, depth
  HWD = 1,  // Rotated: height, width, depth
  HDW = 2,  // Rotated: height, depth, width
  DHW = 3,  // Rotated: depth, height, width
  DWH = 4,  // Rotated: depth, width, height
  WDH = 5,  // Rotated: width, depth, height
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
  width: number;   // mm (x-axis extent)
  height: number;  // mm (y-axis extent)
  depth: number;   // mm (z-axis extent)
  // Original dimensions
  originalWidth: number;
  originalHeight: number;
  originalDepth: number;
  weight: number;  // grams
  rotation: Rotation;
  isFragile: boolean;
}

export interface Surcharge {
  type: string;       // 'AHS_DIMENSION' | 'AHS_WEIGHT' | 'OVERSIZE' | 'UNAUTHORIZED'
  amount: number;     // USD
  reason: string;     // Human-readable explanation
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
  boxIndex: number;         // 1-based
  box: AvailableBox;        // The box type used
  placements: Placement[];  // Items placed in this box
  utilization: number;      // 0-1 (volume used / box inner volume)
  
  // Weight breakdown
  itemsWeight: number;      // grams - total weight of items
  boxWeight: number;        // grams - weight of the box itself
  fillWeight: number;       // grams - estimated void fill weight
  totalWeight: number;      // grams - items + box + fill
  
  // DIM weight
  dimWeightGrams: number;   // DIM weight in grams
  billableWeightGrams: number; // max(totalWeight, dimWeight)
  roundedOuterDims: {       // Dimensions after carrier rounding (inches)
    length: number;
    width: number;
    height: number;
  };
  
  // Cost breakdown
  boxMaterialCost: number;  // USD
  estimatedShippingCost: number; // USD (0 if no rate table available)
  surcharges: Surcharge[];  // Array of triggered surcharges
  totalCost: number;        // USD (box + shipping + surcharges)
  
  // Void fill
  voidFill: VoidFillResult;
  
  // Pack instructions
  packInstructions: string[];
}

export interface FlatRateOption {
  carrier: CarrierType;
  boxName: string;
  boxDimensions: { width: number; height: number; depth: number }; // inches
  price: number;            // USD
  maxWeight: number;        // lbs
  itemsFit: boolean;        // Whether all items fit
  totalWeight: number;      // lbs (items + fill)
  savings: number;          // USD compared to standard optimization
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
  totalCost: number;         // USD sum of all box costs
  totalWeight: number;       // grams
  totalBillableWeight: number; // grams
  averageUtilization: number;  // 0-1 average across all boxes
  
  // Savings comparison
  naiveCost: number;         // USD - what smallest-box-per-item would cost
  optimizedCost: number;     // USD - what our algorithm recommends
  savingsAmount: number;     // USD
  savingsPercent: number;    // 0-100
  
  // Flat rate comparison (if requested)
  flatRateOptions: FlatRateOption[];
  
  // Metadata
  algorithm: string;
  executionTimeMs: number;
  carrier: CarrierType;
}
```

## Step 2: DIM Weight Calculator (engine/dim-weight-calculator.ts)

This MUST be exact. Carriers audit packages and charge correction fees.

```
Rules:
- Convert outer dimensions from mm to inches (divide by 25.4)
- FedEx/UPS: ceil() each dimension to next whole inch BEFORE multiplying
- USPS: round() each dimension to nearest inch
- Calculate cubic inches: L × W × H (using rounded dims)
- USPS exemption: if cubic inches <= 1728 (1 cubic foot), DIM weight = 0
- DIM weight (lbs) = ceil(cubic inches / dimDivisor)
- Convert DIM weight to grams for comparison (1 lb = 453.592g)
- Billable weight = max(totalWeightGrams, dimWeightGrams)
```

Functions to implement:
```typescript
export function calculateDimWeight(
  outerWidthMm: number,
  outerHeightMm: number,
  outerDepthMm: number,
  carrier: CarrierType,
  dimDivisor: number
): {
  roundedDims: { length: number; width: number; height: number }; // inches, sorted L >= W >= H
  cubicInches: number;
  dimWeightLbs: number;
  dimWeightGrams: number;
  isExempt: boolean; // USPS < 1728 cu in
}

export function calculateBillableWeight(
  totalWeightGrams: number,
  dimWeightGrams: number
): {
  billableWeightGrams: number;
  billableWeightLbs: number;
  isDimWeightBillable: boolean; // true if DIM > actual
}
```

CRITICAL DETAILS:
- Always sort dimensions so Length >= Width >= Height before girth calculation
- Girth = Length + 2*(Width + Height)
- The ceil() rounding is per-dimension BEFORE multiplying: ceil(11.1) = 12, ceil(8.0) = 8
- USPS uses round() not ceil(): round(11.1) = 11, round(11.5) = 12, round(11.6) = 12
- FedEx AHS minimum billable: if AHS-Dimension triggers, billable weight is max(billable, 40lbs)

## Step 3: Carrier Validator (engine/carrier-validator.ts)

Validates a packed box against carrier constraints and calculates surcharges.

```typescript
export function validateCarrierConstraints(
  packedBox: {
    outerWidthMm: number;
    outerHeightMm: number;
    outerDepthMm: number;
    totalWeightGrams: number;
  },
  carrierRules: CarrierRules
): {
  isValid: boolean;           // false if package exceeds hard limits
  violations: string[];       // Human-readable violation messages
  surcharges: Surcharge[];    // Triggered surcharges with amounts
  adjustedBillableWeight: number | null; // If AHS min billable weight applies
}
```

Validation checks (in order):
1. **Max length**: Convert longest dimension to inches. If > maxLengthInches → INVALID (cannot ship).
2. **Max girth**: Calculate L + 2*(W+H) in inches. If > maxGirthInches → INVALID.
3. **Max weight**: Convert total weight to lbs. If > maxWeightLbs → INVALID.
4. **AHS-Dimension (Length)**: If longest side > ahsLengthThreshold → AHS surcharge.
5. **AHS-Dimension (Width)**: If second-longest side > ahsWidthThreshold → AHS surcharge.
6. **AHS-Dimension (Cubic)**: Calculate cubic inches. If > ahsCubicThreshold → AHS surcharge.
7. **Oversize (Cubic)**: If cubic inches > oversizeCubicThreshold → Oversize surcharge.
8. **AHS minimum billable weight**: If any AHS triggers and carrier has ahsMinBillableWeight, set minimum.

Note: Multiple surcharges can stack. AHS-Dimension and Oversize can both apply.
Note: Only apply the HIGHEST AHS surcharge if multiple AHS conditions trigger (don't stack AHS).

## Step 4: Void Fill Calculator (engine/void-fill-calculator.ts)

```typescript
// Fill material density factors (lbs per cubic foot)
const FILL_DENSITIES: Record<FillMaterial, { density: number; costPerCuFt: number }> = {
  AIR_PILLOWS:      { density: 0.2,  costPerCuFt: 0.035 },
  KRAFT_PAPER:      { density: 1.0,  costPerCuFt: 0.055 },
  BUBBLE_WRAP:      { density: 0.6,  costPerCuFt: 0.115 },
  PACKING_PEANUTS:  { density: 0.45, costPerCuFt: 0.070 },
  FOAM_IN_PLACE:    { density: 1.5,  costPerCuFt: 0.225 },
};

export function calculateVoidFill(
  boxInnerWidthMm: number,
  boxInnerHeightMm: number,
  boxInnerDepthMm: number,
  placements: Placement[],
  fillMaterial: FillMaterial
): VoidFillResult
```

Calculation:
1. Box inner volume = W × H × D (cubic mm)
2. Total item volume = sum of each placement's width × height × depth (cubic mm)
3. Void volume = box inner volume - total item volume (cubic mm)
4. Convert void volume to cubic feet (divide by 28316846.6)
5. Fill weight = void volume (cu ft) × density (lbs/cu ft) → convert to grams
6. Fill cost = void volume (cu ft) × costPerCuFt

## Step 5: Pack Instructor (engine/pack-instructor.ts)

Generates human-readable packing instructions from placements.

```typescript
export function generatePackInstructions(
  placements: Placement[],
  boxName: string,
  voidFill: VoidFillResult,
  fillMaterial: FillMaterial
): string[]
```

Logic:
1. Sort placements by Y position (bottom to top), then X (left to right), then Z (back to front)
2. For each placement, generate an instruction like:
   - "Step 1: Place [name] (SKU: [sku]) flat on the bottom, positioned at the left-back corner."
   - "Step 2: Place [name] (SKU: [sku]) next to [previous item name], flush against the right side."
   - If item is fragile: append " ⚠ FRAGILE — handle with care, ensure adequate cushioning."
   - If item is rotated: mention orientation, e.g., "Place on its side (rotated 90°)."
3. After all items, if void fill > 10% of box volume:
   - "Step N: Fill remaining void space (~X cubic inches) with [fill material]."
4. Final step: "Step N+1: Close box and seal with tape. Ensure no items shift when shaken gently."

Keep instructions practical and clear — a warehouse worker with no technical knowledge should understand them.

## Step 6: Compatibility Resolver (engine/compatibility-resolver.ts)

Groups items based on compatibility rules BEFORE packing.

```typescript
export function resolveCompatibilityGroups(
  items: PackableItem[],
  rules: CompatibilityRule[]
): {
  groups: PackableItem[][];  // Each group can be packed together in the same box(es)
  warnings: string[];        // Any issues like conflicting rules
}
```

Algorithm:
1. Build a graph of MUST_SHIP_TOGETHER relationships. Use Union-Find to merge connected items into groups.
2. For each INCOMPATIBLE pair, check if they're in the same MUST_SHIP_TOGETHER group (conflict → warning).
3. For items not in any MUST_SHIP_TOGETHER group, assign each to its own "flexible" group.
4. Post-process: merge flexible groups together UNLESS an INCOMPATIBLE rule prevents it.
5. Result: each group is a set of items that CAN share boxes. Different groups MUST go in separate boxes.

Example:
- Items: A, B, C, D, E
- MUST_SHIP_TOGETHER: (A, B)
- INCOMPATIBLE: (A, C)
- Result: Group 1: [A, B, D, E], Group 2: [C] (C can't be with A, so separate)
- Wait — D and E have no incompatibility with C, so: Group 1: [A, B], Group 2: [C, D, E]
- Actually, D and E can go with either group. The resolver should put them where they fit best.

Simplified approach for MVP: 
1. Group MUST_SHIP_TOGETHER items.
2. For each INCOMPATIBLE pair, ensure they're in separate groups.
3. Unaffiliated items go into the largest group they're compatible with.

## Step 7: Core Packing Engine (engine/packing-engine.ts)

This is the main 3D bin-packing algorithm. Implement a layer-based approach inspired by EB-AFIT.

```typescript
export function packItems(
  items: PackableItem[],    // Items to pack (already expanded by quantity)
  box: AvailableBox         // Single box to try packing into
): {
  packed: Placement[];
  unpacked: PackableItem[];
  utilization: number;      // 0-1
}
```

### Algorithm: Layer-Based Best Fit

The box is treated as a 3D space with axes:
- X: width (left to right)
- Y: height (bottom to top)  
- Z: depth (back to front)

**Core approach:**

1. **Sort items**: 
   - Primary: isFragile ASC (non-fragile first = bottom layers)
   - Secondary: volume DESC (biggest items first)
   - Tertiary: weight DESC (heaviest items first among same-volume)

2. **Maintain a list of available spaces** (initially one space = entire box interior):
   - Each space is defined by: { x, y, z, width, height, depth }
   - Start with one space: { x: 0, y: 0, z: 0, width: box.innerWidth, height: box.innerHeight, depth: box.innerDepth }

3. **For each item** (in sorted order):
   a. Generate rotations:
      - If canRotate && !isFragile: all 6 rotations
      - If canRotate && isFragile (this-side-up): rotations 0 and 3 only (keeps original height axis vertical)
      - If !canRotate: rotation 0 only
   b. For each rotation, get the item's rotated dimensions
   c. For each available space (sorted by Y ASC, then X ASC, then Z ASC = prefer bottom-left-back):
      - Check if item fits: rotatedW <= space.width && rotatedH <= space.height && rotatedD <= space.depth
      - Check weight: if maxWeight constraint, ensure remaining capacity allows this item
      - Check stacking: if items below have maxStackWeight, ensure adding this item doesn't exceed it
      - If fits: PLACE IT and break
   d. When an item is placed in a space, split that space into up to 3 remaining spaces:
      - **Right space**: { x: x + itemW, y, z, width: spaceW - itemW, height: spaceH, depth: spaceD }
      - **Top space**: { x, y: y + itemH, z, width: itemW, height: spaceH - itemH, depth: spaceD }
      - **Front space**: { x, y, z: z + itemD, width: itemW, height: itemH, depth: spaceD - itemD }
      - Only create spaces with volume > 0
      - Remove the original space from the list
   e. If item doesn't fit in any space with any rotation: add to unpacked list

4. **Calculate utilization**: sum of placed item volumes / box inner volume

**Rotation dimension mapping:**
```typescript
function getRotatedDimensions(w: number, h: number, d: number, rotation: Rotation): [number, number, number] {
  switch (rotation) {
    case Rotation.WHD: return [w, h, d];
    case Rotation.HWD: return [h, w, d];
    case Rotation.HDW: return [h, d, w];
    case Rotation.DHW: return [d, h, w];
    case Rotation.DWH: return [d, w, h];
    case Rotation.WDH: return [w, d, h];
  }
}
```

**This-side-up (fragile + canRotate) restriction:**
- Only allow rotations where the original HEIGHT dimension stays on the Y axis
- Rotation 0 (WHD): Y-axis = H ✓
- Rotation 3 (DHW): Y-axis = H ✓  
- All others change the Y-axis dimension, so they're not allowed

## Step 8: Box Selector (engine/box-selector.ts)

Orchestrates multi-box selection to minimize total cost.

```typescript
export function selectOptimalBoxes(
  items: PackableItem[],
  availableBoxes: AvailableBox[],
  carrierRules: CarrierRules,
  options: OptimizationOptions
): {
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];
  naiveCost: number;
}
```

### Algorithm:

1. **Expand items by quantity**: Item with quantity=3 becomes 3 individual items.

2. **Add insert materials**: Append insertMaterials as items (isFragile=false, canRotate=true, high sort priority to place first at bottom).

3. **Resolve compatibility**: Run compatibility resolver to get item groups.

4. **For each compatibility group**:
   a. Sort available boxes by inner volume ASC (try smallest boxes first)
   b. For each box type:
      - Run packItems(groupItems, box)
      - If all items pack → calculate full cost (box material + DIM weight + surcharges + void fill)
      - Track the cheapest single-box solution
   c. If no single box fits all items → multi-box splitting:
      - Sort items by volume DESC
      - Greedy assignment: for each item, try to fit it in an existing open box
      - If it doesn't fit in any open box, open a new box (try each box type, pick cheapest that fits)
      - After assignment, run packItems for each box to get placements
   d. Calculate total cost for the multi-box solution

5. **Compare single-box vs multi-box costs**: Sometimes 1 large box (even with DIM surcharge) is cheaper than 2 small boxes. Sometimes 2 small boxes avoid surcharges and are cheaper. Pick the cheapest.

6. **Calculate naive cost**: For comparison, calculate what it would cost to pack each item individually in the smallest box that fits it. This is the "no optimization" baseline for savings reporting.

7. **For each final packed box**: Run carrier validator, void fill calculator, and pack instructor.

## Step 9: Flat Rate Comparator (engine/flat-rate-comparator.ts)

```typescript
// Flat rate box definitions (hardcoded, updated periodically)
const FLAT_RATE_BOXES: FlatRateBoxDef[] = [
  // USPS
  { carrier: 'USPS', name: 'USPS Small Flat Rate Box', width: 8.625, height: 5.375, depth: 1.625, price: 10.20, maxWeightLbs: 70 },
  { carrier: 'USPS', name: 'USPS Medium Flat Rate Box (1)', width: 11.25, height: 8.75, depth: 6, price: 17.10, maxWeightLbs: 70 },
  { carrier: 'USPS', name: 'USPS Medium Flat Rate Box (2)', width: 14, height: 12, depth: 3.5, price: 17.10, maxWeightLbs: 70 },
  { carrier: 'USPS', name: 'USPS Large Flat Rate Box', width: 12.25, height: 12.25, depth: 6, price: 22.80, maxWeightLbs: 70 },
  { carrier: 'USPS', name: 'USPS APO/FPO Large Flat Rate Box', width: 12.25, height: 12.25, depth: 6, price: 22.80, maxWeightLbs: 70 },
];

export function compareFlatRateOptions(
  items: PackableItem[],
  standardCost: number,         // Cost from standard optimization
  carrier: CarrierType
): FlatRateOption[]
```

Logic:
1. Filter flat-rate boxes for the selected carrier
2. For each flat-rate box: convert dimensions to mm, run packItems to check if all items fit
3. Calculate total weight (items + estimated fill) and check against maxWeight
4. Calculate savings = standardCost - flatRatePrice
5. Return all options sorted by price ASC, with itemsFit and savings fields

## Step 10: Optimization Service (optimization.service.ts)

The orchestrator that connects the engine to the NestJS ecosystem.

```typescript
@Injectable()
export class OptimizationService {
  async optimize(
    tenantId: string,
    userId: string | null,
    request: OptimizeRequestDto
  ): Promise<OptimizationResult> {
    // 1. Start timing
    // 2. Load tenant's box types from DB (only active ones)
    // 3. Load carrier rules from DB
    // 4. Load insert materials for tenant (where alwaysInclude = true)
    // 5. Load compatibility rules for the items in the request
    // 6. Map request items + DB data to engine types
    // 7. Call selectOptimalBoxes()
    // 8. If includeFlatRate, call compareFlatRateOptions()
    // 9. Save OptimizationRun to DB
    // 10. Save OptimizationResult(s) to DB
    // 11. Save SavingsLog to DB
    // 12. Increment UsageRecord for billing
    // 13. Return complete OptimizationResult
  }
}
```

## Step 11: Optimization Controller + DTOs

### OptimizeRequestDto:
```typescript
class OptimizeItemDto {
  @ApiProperty({ example: 'item-uuid-here', description: 'Item ID from your catalog' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 2, description: 'Quantity of this item to pack' })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity: number;
}

class OptimizeRequestDto {
  @ApiProperty({ type: [OptimizeItemDto], description: 'Items to optimize packing for' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => OptimizeItemDto)
  items: OptimizeItemDto[];

  @ApiPropertyOptional({ enum: ['FEDEX', 'UPS', 'USPS'], default: 'FEDEX' })
  @IsOptional()
  @IsEnum(CarrierType)
  carrier?: CarrierType;

  @ApiPropertyOptional({ enum: ['COST', 'SPACE', 'FEWEST_BOXES'], default: 'COST' })
  @IsOptional()
  @IsEnum(OptimizeTarget)
  optimizeFor?: OptimizeTarget;

  @ApiPropertyOptional({ default: 10, description: 'Maximum number of boxes to use' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxBoxes?: number;

  @ApiPropertyOptional({ default: true, description: 'Include flat-rate box comparison' })
  @IsOptional()
  @IsBoolean()
  includeFlatRate?: boolean;

  @ApiPropertyOptional({ enum: FillMaterial, default: 'AIR_PILLOWS' })
  @IsOptional()
  @IsEnum(FillMaterial)
  fillMaterial?: FillMaterial;

  @ApiPropertyOptional({ type: [String], description: 'Additional box type IDs to consider (besides tenant defaults)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  boxTypeIds?: string[];
}
```

### Response:
The endpoint returns the full OptimizationResult type. Add Swagger decorators for the response schema.

### Endpoint:
```
POST /v1/optimize
Authorization: Bearer <jwt> OR X-API-Key: <key>
Content-Type: application/json

Response headers:
  X-Optimization-Duration-Ms: <milliseconds>
```

## Step 12: Seed Demo Data

Add to the existing seed script (or create a separate demo seed):

### SwiftShip Logistics — 25 Items:
```
Electronics:
- Laptop (380x260x25mm, 2200g, fragile, canRotate: true, maxStackWeight: 5000)
- Tablet (250x175x8mm, 480g, fragile, canRotate: true, maxStackWeight: 3000)
- Phone (150x72x8mm, 185g, fragile, canRotate: true, maxStackWeight: 2000)
- USB-C Cable (150x100x30mm, 45g, not fragile, canRotate: true)
- Wireless Mouse (115x63x38mm, 95g, not fragile, canRotate: true)
- Bluetooth Speaker (180x65x65mm, 540g, not fragile, canRotate: true)
- Power Bank (140x70x16mm, 320g, not fragile, canRotate: true)
- Webcam (90x65x50mm, 165g, fragile, canRotate: true, maxStackWeight: 3000)

Apparel:
- T-Shirt (folded: 300x250x30mm, 200g, not fragile, canRotate: true)
- Jeans (folded: 350x300x50mm, 850g, not fragile, canRotate: true)
- Running Shoes (330x210x120mm, 650g, not fragile, canRotate: true)
- Winter Jacket (folded: 400x350x80mm, 1200g, not fragile, canRotate: true)
- Socks 3-Pack (200x150x40mm, 180g, not fragile, canRotate: true)

Home Goods:
- Ceramic Mug (120x100x100mm, 380g, fragile, canRotate: false, maxStackWeight: 1000)
- Scented Candle (80x80x100mm, 350g, fragile, canRotate: false, maxStackWeight: 2000)
- Picture Frame (350x280x25mm, 650g, fragile, canRotate: true, maxStackWeight: 2000)
- Cutting Board (400x250x20mm, 900g, not fragile, canRotate: true)
- Set of 4 Coasters (110x110x25mm, 200g, not fragile, canRotate: true)

Supplements:
- Vitamin Bottle (70x70x130mm, 250g, not fragile, canRotate: false)
- Protein Powder Tub (150x150x200mm, 1100g, not fragile, canRotate: false)
- Fish Oil Bottle (60x60x110mm, 200g, not fragile, canRotate: false)

Misc:
- Book (hardcover: 240x170x25mm, 450g, not fragile, canRotate: true)
- Board Game (box: 300x300x80mm, 1200g, not fragile, canRotate: true)
- Yoga Mat (rolled: 650x150x150mm, 1800g, not fragile, canRotate: true)
- Water Bottle (75x75x260mm, 350g, not fragile, canRotate: false)
```

### SwiftShip Logistics — 8 Box Types:
```
- Mini Box:      inner 200x150x100mm, wall 3mm, boxWeight 120g, maxWeight 5000g, cost $0.45
- Small Box:     inner 300x250x150mm, wall 3mm, boxWeight 200g, maxWeight 10000g, cost $0.65
- Medium Box:    inner 400x300x200mm, wall 3.5mm, boxWeight 350g, maxWeight 15000g, cost $0.95
- Large Box:     inner 500x400x300mm, wall 4mm, boxWeight 550g, maxWeight 20000g, cost $1.45
- XL Box:        inner 600x450x350mm, wall 4mm, boxWeight 750g, maxWeight 25000g, cost $1.85
- Flat Box:      inner 450x350x80mm, wall 3mm, boxWeight 250g, maxWeight 10000g, cost $0.75
- Long Box:      inner 700x200x200mm, wall 4mm, boxWeight 400g, maxWeight 15000g, cost $1.15
- Laptop Box:    inner 420x310x80mm, wall 5mm, boxWeight 300g, maxWeight 8000g, cost $1.05
```
(Calculate outer dims automatically: outer = inner + 2*wallThickness for each dimension)

### SwiftShip — Compatibility Rules:
- Power Bank INCOMPATIBLE with Scented Candle (lithium battery + heat source)
- Phone + USB-C Cable MUST_SHIP_TOGETHER (sold as kit)

### SwiftShip — Insert Materials:
- Branded Packing Slip: 210x297x0.5mm (A4), 15g, alwaysInclude: true
- Thank You Card: 152x102x1mm, 8g, alwaysInclude: true

### TechDirect — 15 Electronics Items (all fragile, use realistic dimensions from real products)
### TechDirect — 5 Box Types (all with extra padding, higher wall thickness)

## TESTING REQUIREMENTS

After building everything above, create and run comprehensive tests. Create a test file at:
`src/optimization/engine/__tests__/packing-engine.spec.ts`
`src/optimization/engine/__tests__/dim-weight-calculator.spec.ts`
`src/optimization/engine/__tests__/carrier-validator.spec.ts`
`src/optimization/engine/__tests__/void-fill-calculator.spec.ts`
`src/optimization/engine/__tests__/pack-instructor.spec.ts`
`src/optimization/engine/__tests__/compatibility-resolver.spec.ts`
`src/optimization/__tests__/optimization.e2e-spec.ts`

### Gate 2 Tests — ALL MUST PASS:

**Packing Engine (packing-engine.spec.ts):**
1. Single item fits in a single box. Placement coordinates are (0, 0, 0). Utilization > 0.
2. Two items fit side by side in one box. No overlapping coordinates (verify no item's bounding box intersects another).
3. Item exactly matching box inner dimensions has utilization between 0.99 and 1.0.
4. Item larger than the available box in ALL dimensions returns it in the unpacked array.
5. 10 assorted items pack into boxes. Total packed item count equals input count minus unpacked count.
6. Item 100x50x30mm can be placed in a box 60x110x40mm inner dims (requires rotation). Rotation index is NOT 0.
7. Item with canRotate=false is only placed in rotation 0. Test with an item that ONLY fits if rotated — it should go to unpacked.
8. Fragile item with canRotate=true only uses rotations 0 and 3. Test by verifying rotation is 0 or 3 for every fragile canRotate item.
9. Given a mix of fragile and non-fragile items: all fragile items have Y position >= all non-fragile items Y positions.
10. Item with maxStackWeight=3000g. Place a 5000g item on top of it. The 5000g item should NOT be directly above it (or the engine should repack).
11. 5 items sorted correctly by the algorithm: verify placement order matches expected (heavy non-fragile bottom, light fragile top).
12. 20 items that don't fit in any single box correctly split across multiple packed boxes. Sum of items in all boxes = 20.
13. No box in the result is empty (every packedBox has at least 1 placement).
14. Zero items input returns empty packedBoxes array.
15. Performance: 10 items pack in < 50ms.
16. Performance: 30 items pack in < 200ms.
17. Performance: 50 items pack in < 500ms.
18. 50 identical items (same SKU) pack without infinite loop (completes < 2 seconds).
19. Item with weight=0 (a sticker) packs correctly without errors.
20. Item with one very thin dimension (0.5mm depth, like a label) packs correctly.
21. No placement has negative coordinates.
22. No placement extends beyond box inner dimensions (x + width <= boxInnerWidth for all).

**DIM Weight Calculator (dim-weight-calculator.spec.ts):**
23. Box 304.8x304.8x304.8mm (12x12x12 inches) via FedEx: roundedDims = {12, 12, 12}, cubicInches = 1728, DIM = ceil(1728/139) = ceil(12.43) = 13 lbs.
24. Box 281.94x215.9x157.48mm (11.1x8.5x6.2in) via UPS: rounds to 12x9x7, cubic = 756, DIM = ceil(756/139) = ceil(5.44) = 6 lbs.
25. Same box via USPS: rounds to 11x9x6 (round, not ceil), cubic = 594, < 1728, DIM = 0 (exempt).
26. Box 330.2x330.2x330.2mm (13x13x13in) via USPS: cubic = 2197 > 1728, DIM = ceil(2197/166) = ceil(13.23) = 14 lbs.
27. Billable weight: item 9072g (20lbs) in DIM 13lbs box → billable = 20 lbs.
28. Billable weight: item 2268g (5lbs) in DIM 13lbs box → billable = 13 lbs.
29. Dimensions are sorted so length >= width >= height before output.
30. Box exactly 1728 cubic inches via USPS: DIM = 0 (threshold is > 1728, not >=).

**Carrier Validator (carrier-validator.spec.ts):**
31. Box with longest side 49 inches → FedEx AHS-Dimension surcharge triggered. Amount > 0.
32. Box with longest side 47 inches → No AHS surcharge.
33. Box with longest side exactly 48.0 inches → No AHS (threshold is > 48, not >=).
34. Box with cubic volume 10,369 cu in → AHS cubic surcharge.
35. Box with cubic volume 10,368 cu in → No AHS cubic surcharge.
36. Box with cubic volume 17,281 cu in → Oversize surcharge.
37. Box exceeding 108 inches length for UPS → isValid = false, violation message present.
38. FedEx AHS triggered → adjustedBillableWeight = max(current, 40lbs in grams).
39. Box within ALL limits → isValid = true, no surcharges, no violations.

**Void Fill Calculator (void-fill-calculator.spec.ts):**
40. Box 304.8mm (12in) cube with item 152.4mm (6in) cube: void = boxVol - itemVol. Verify cubic mm value.
41. Void fill weight uses correct density for AIR_PILLOWS.
42. Void fill weight uses correct density for KRAFT_PAPER (should be higher than air pillows).
43. Fill cost calculated correctly based on volume and cost per cubic foot.

**Pack Instructor (pack-instructor.spec.ts):**
44. Instructions array has at least as many entries as placements.
45. Fragile items have "FRAGILE" or "fragile" in their instruction text.
46. Void fill instruction present when void > 10% of box volume.
47. Final instruction mentions closing/sealing the box.

**Compatibility Resolver (compatibility-resolver.spec.ts):**
48. Two INCOMPATIBLE items end up in different groups.
49. Two MUST_SHIP_TOGETHER items end up in the same group.
50. Conflict: A must-ship-with B, but A incompatible-with B → warning generated.
51. Items with no rules go into a default group.

**E2E Optimization Endpoint (optimization.e2e-spec.ts):**
52. POST /v1/optimize with valid auth and items returns 200 with complete OptimizationResult.
53. Response has X-Optimization-Duration-Ms header with value > 0.
54. Response includes packedBoxes with placements, utilization, dimWeight, billableWeight, surcharges.
55. Response includes voidFill data in each packed box.
56. Response includes packInstructions array in each packed box.
57. Response includes savingsAmount (naiveCost - optimizedCost).
58. POST /v1/optimize with empty items returns 400.
59. POST /v1/optimize without auth returns 401.
60. After optimization, UsageRecord count increased for the tenant.
61. After optimization, SavingsLog entry exists for the run.
62. Two INCOMPATIBLE items are in separate boxes in the response.
63. Two MUST_SHIP_TOGETHER items are in the same box in the response.

Run all tests:
```bash
npm run test -- --testPathPattern="optimization" --verbose
```

EVERY test must pass. If any test fails, fix the code and re-run ALL tests to ensure no regressions.

After all tests pass, do a manual verification:
```bash
# Login as SwiftShip admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@swiftship.com","password":"password123","tenantSlug":"swiftship"}'

# Use the JWT to run an optimization with 3-4 items
# Verify the response includes placements, DIM weight, surcharges, void fill, and pack instructions
```
