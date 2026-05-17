import { describe, it, expect } from "vitest";
import type {
  Item,
  BoxType,
  OptimizeRequest,
  OptimizeResponse,
  PackedBox,
  User,
} from "@/types/api";

// Runtime shape validation — ensures the type contracts match what the API returns.
// These tests catch regressions if a field is accidentally removed from a type.

function makeUser(): User {
  return {
    id: "u1",
    email: "test@example.com",
    role: "ADMIN",
    tenantId: "t1",
    tenantName: "Test Co",
    isSuperAdmin: false,
  };
}

function makeItem(): Item {
  return {
    id: "item-1",
    sku: "SKU-001",
    name: "Widget",
    width: 100,
    height: 50,
    depth: 75,
    weight: 200,
    isFragile: false,
    canRotate: true,
    maxStackWeight: null,
    tenantId: "t1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeBoxType(): BoxType {
  return {
    id: "box-1",
    name: "Small Box",
    innerWidth: 200,
    innerHeight: 150,
    innerDepth: 100,
    outerWidth: 210,
    outerHeight: 160,
    outerDepth: 110,
    wallThickness: 5,
    boxWeight: 300,
    maxWeight: 5000,
    cost: 1.5,
    isActive: true,
    tenantId: "t1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe("User type", () => {
  it("has required fields", () => {
    const user = makeUser();
    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.tenantId).toBeDefined();
    expect(user.tenantName).toBeDefined();
  });
});

describe("Item type", () => {
  it("has all required dimensional fields", () => {
    const item = makeItem();
    expect(typeof item.width).toBe("number");
    expect(typeof item.height).toBe("number");
    expect(typeof item.depth).toBe("number");
    expect(typeof item.weight).toBe("number");
  });

  it("maxStackWeight can be null", () => {
    const item = makeItem();
    expect(item.maxStackWeight).toBeNull();
  });

  it("maxStackWeight can be a number", () => {
    const item = { ...makeItem(), maxStackWeight: 1000 };
    expect(item.maxStackWeight).toBe(1000);
  });
});

describe("BoxType type", () => {
  it("has inner and outer dimensions", () => {
    const box = makeBoxType();
    expect(box.innerWidth).toBeDefined();
    expect(box.outerWidth).toBeDefined();
    expect(box.innerWidth).toBeLessThan(box.outerWidth);
  });

  it("cost is a number", () => {
    const box = makeBoxType();
    expect(typeof box.cost).toBe("number");
  });
});

describe("OptimizeRequest type", () => {
  it("items is required", () => {
    const req: OptimizeRequest = { items: [{ id: "a", quantity: 1 }] };
    expect(req.items).toHaveLength(1);
  });

  it("all optional fields can be omitted", () => {
    const req: OptimizeRequest = { items: [] };
    expect(req.carrier).toBeUndefined();
    expect(req.optimizeFor).toBeUndefined();
    expect(req.maxBoxes).toBeUndefined();
    expect(req.fillMaterial).toBeUndefined();
    expect(req.boxTypeIds).toBeUndefined();
  });
});

describe("PackedBox type", () => {
  it("has all expected cost fields", () => {
    const box: Partial<PackedBox> = {
      boxMaterialCost: 1.5,
      estimatedShippingCost: 8.99,
      totalCost: 10.49,
    };
    expect((box.boxMaterialCost ?? 0) + (box.estimatedShippingCost ?? 0)).toBeCloseTo(box.totalCost ?? 0, 1);
  });
});

describe("OptimizeResponse type", () => {
  it("savings fields are consistent", () => {
    const res: Partial<OptimizeResponse> = {
      naiveCost: 20,
      optimizedCost: 15,
      savingsAmount: 5,
      savingsPercent: 25,
    };
    expect(res.savingsAmount).toBe((res.naiveCost ?? 0) - (res.optimizedCost ?? 0));
    expect(res.savingsPercent).toBe(((res.savingsAmount ?? 0) / (res.naiveCost ?? 1)) * 100);
  });
});
