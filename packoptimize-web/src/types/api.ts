// Auth
export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantName: string;
  };
}

export interface RegisterRequest {
  tenantName: string;
  tenantSlug: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    tenantId: string;
    tenantName: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
}

// Items
export interface Item {
  id: string;
  sku: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  isFragile: boolean;
  canRotate: boolean;
  maxStackWeight: number | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// Box Types
export interface BoxType {
  id: string;
  name: string;
  innerWidth: number;
  innerHeight: number;
  innerDepth: number;
  outerWidth: number;
  outerHeight: number;
  outerDepth: number;
  wallThickness: number;
  boxWeight: number;
  maxWeight: number;
  cost: number;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// API Keys
export interface ApiKey {
  id: string;
  keyPrefix: string;
  name: string | null;
  permissions: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  keyPrefix: string;
  name: string | null;
  permissions: string[];
  expiresAt: string | null;
}

// Carrier Rules
export interface CarrierConstraint {
  id: string;
  carrier: string;
  maxLengthInches: number;
  maxGirthInches: number;
  maxWeightLbs: number;
  dimDivisor: number;
  ahsCubicThreshold: number;
  oversizeCubicThreshold: number;
  ahsLengthThreshold: number;
  ahsWidthThreshold: number;
  ahsMinBillableWeight: number;
  surchargeRates: Record<string, number>;
}

// Optimization
export interface OptimizeItemInput {
  id: string;
  quantity: number;
}

export interface OptimizeRequest {
  items: OptimizeItemInput[];
  carrier?: string;
  optimizeFor?: string;
  maxBoxes?: number;
  includeFlatRate?: boolean;
  fillMaterial?: string;
  boxTypeIds?: string[];
}

export interface Placement {
  itemId: string;
  sku: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  originalWidth: number;
  originalHeight: number;
  originalDepth: number;
  weight: number;
  rotation: number;
  isFragile: boolean;
}

export interface Surcharge {
  type: string;
  amount: number;
  reason: string;
}

export interface VoidFillResult {
  voidVolumeCubicMm: number;
  voidVolumeCubicIn: number;
  fillWeightGrams: number;
  fillCostUsd: number;
  materialUsed: string;
}

export interface PackedBox {
  boxId: string;
  boxName: string;
  boxIndex: number;
  box: {
    id: string;
    name: string;
    innerWidth: number;
    innerHeight: number;
    innerDepth: number;
    outerWidth: number;
    outerHeight: number;
    outerDepth: number;
    boxWeight: number;
    maxWeight: number;
    cost: number;
  };
  placements: Placement[];
  utilization: number;
  itemsWeight: number;
  boxWeight: number;
  fillWeight: number;
  totalWeight: number;
  dimWeightGrams: number;
  billableWeightGrams: number;
  roundedOuterDims: { length: number; width: number; height: number };
  boxMaterialCost: number;
  estimatedShippingCost: number;
  surcharges: Surcharge[];
  totalCost: number;
  voidFill: VoidFillResult;
  packInstructions: string[];
}

export interface FlatRateOption {
  name: string;
  carrier: string;
  cost: number;
  fits: boolean;
  dimensions: { length: number; width: number; height: number };
}

export interface UnpackedItem {
  itemId: string;
  sku: string;
  name: string;
  reason: string;
}

export interface OptimizeResponse {
  success: boolean;
  packedBoxes: PackedBox[];
  unpackedItems: UnpackedItem[];
  totalBoxes: number;
  totalCost: number;
  totalWeight: number;
  totalBillableWeight: number;
  averageUtilization: number;
  naiveCost: number;
  optimizedCost: number;
  savingsAmount: number;
  savingsPercent: number;
  flatRateOptions: FlatRateOption[];
  algorithm: string;
  executionTimeMs: number;
  carrier: string;
}

// Optimization Run (for dashboard history)
export interface OptimizationRun {
  id: string;
  itemCount: number;
  boxCount: number;
  totalCost: number;
  savingsAmount: number;
  carrier: string;
  status: string;
  createdAt: string;
}

// Savings / Analytics
export interface SavingsSummary {
  totalSavings: number;
  totalRuns: number;
  averageSavingsPercent: number;
  history: { period: string; savings: number; runs: number }[];
}

// Usage
export interface UsageStats {
  billingPeriod: string;
  optimizationRuns: number;
  itemsCreated: number;
  apiCalls: number;
}

// Tenant
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: string;
}

// Billing
export interface BillingUsage {
  plan: string;
  includedOptimizations: number;
  usedOptimizations: number;
  billingPeriod: string;
  overageCount: number;
  overageCost: number;
}

// Insert Material
export interface InsertMaterial {
  id: string;
  name: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  alwaysInclude: boolean;
}
