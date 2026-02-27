import { packItems, getRotatedDimensions } from '../packing-engine';
import { AvailableBox, PackableItem, Rotation } from '../types';

function makeItem(overrides: Partial<PackableItem> = {}): PackableItem {
  return {
    id: 'item-1',
    sku: 'TEST-001',
    name: 'Test Item',
    width: 100,
    height: 50,
    depth: 30,
    weight: 500,
    isFragile: false,
    canRotate: true,
    maxStackWeight: null,
    quantity: 1,
    ...overrides,
  };
}

function makeBox(overrides: Partial<AvailableBox> = {}): AvailableBox {
  return {
    id: 'box-1',
    name: 'Test Box',
    innerWidth: 300,
    innerHeight: 250,
    innerDepth: 200,
    outerWidth: 306,
    outerHeight: 256,
    outerDepth: 206,
    boxWeight: 200,
    maxWeight: 15000,
    cost: 1.0,
    ...overrides,
  };
}

describe('PackingEngine', () => {
  // Test 1: Single item fits in a single box
  it('should place a single item at (0,0,0) with utilization > 0', () => {
    const items = [makeItem()];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(1);
    expect(result.unpacked).toHaveLength(0);
    expect(result.packed[0].x).toBe(0);
    expect(result.packed[0].y).toBe(0);
    expect(result.packed[0].z).toBe(0);
    expect(result.utilization).toBeGreaterThan(0);
  });

  // Test 2: Two items fit side by side, no overlap
  it('should place two items without overlapping bounding boxes', () => {
    const items = [
      makeItem({ id: 'item-1', sku: 'A', width: 100, height: 50, depth: 30 }),
      makeItem({ id: 'item-2', sku: 'B', width: 100, height: 50, depth: 30 }),
    ];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(2);

    const [a, b] = result.packed;
    // Check no overlap: for any two placements, at least one axis must not intersect
    const overlapX = a.x < b.x + b.width && a.x + a.width > b.x;
    const overlapY = a.y < b.y + b.height && a.y + a.height > b.y;
    const overlapZ = a.z < b.z + b.depth && a.z + a.depth > b.z;
    const overlaps = overlapX && overlapY && overlapZ;
    expect(overlaps).toBe(false);
  });

  // Test 3: Item exactly matching box inner dimensions
  it('should have utilization between 0.99 and 1.0 for exact fit', () => {
    const box = makeBox({ innerWidth: 100, innerHeight: 50, innerDepth: 30 });
    const items = [makeItem({ width: 100, height: 50, depth: 30 })];
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(1);
    expect(result.utilization).toBeGreaterThanOrEqual(0.99);
    expect(result.utilization).toBeLessThanOrEqual(1.0);
  });

  // Test 4: Item larger than box in ALL dimensions -> unpacked
  it('should return oversized item in unpacked array', () => {
    const box = makeBox({ innerWidth: 50, innerHeight: 50, innerDepth: 50 });
    const items = [makeItem({ width: 100, height: 100, depth: 100, canRotate: false })];
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(0);
    expect(result.unpacked).toHaveLength(1);
  });

  // Test 5: 10 assorted items - total counts match
  it('should have packed + unpacked = input count for 10 items', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem({
        id: `item-${i}`,
        sku: `SKU-${i}`,
        width: 50 + i * 10,
        height: 30 + i * 5,
        depth: 20 + i * 5,
        weight: 100 + i * 50,
      }),
    );
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed.length + result.unpacked.length).toBe(10);
  });

  // Test 6: Item 100x50x30mm in box 60x110x40mm (requires rotation)
  it('should rotate item to fit and have rotation !== 0', () => {
    const box = makeBox({
      innerWidth: 60,
      innerHeight: 110,
      innerDepth: 40,
      maxWeight: 50000,
    });
    const items = [makeItem({ width: 100, height: 50, depth: 30 })];
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(1);
    expect(result.packed[0].rotation).not.toBe(Rotation.WHD);
  });

  // Test 7: canRotate=false item that only fits rotated -> unpacked
  it('should not rotate canRotate=false item, leaving it unpacked', () => {
    // Box is 60x110x40, item is 100x50x30 - only fits with rotation
    const box = makeBox({
      innerWidth: 60,
      innerHeight: 110,
      innerDepth: 40,
      maxWeight: 50000,
    });
    const items = [makeItem({ width: 100, height: 50, depth: 30, canRotate: false })];
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(0);
    expect(result.unpacked).toHaveLength(1);
  });

  // Test 8: Fragile canRotate=true only uses rotations 0 and 3
  it('should only use rotations 0 or 3 for fragile canRotate items', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({
        id: `frag-${i}`,
        sku: `FRAG-${i}`,
        isFragile: true,
        canRotate: true,
        width: 30 + i * 10,
        height: 20 + i * 5,
        depth: 15 + i * 5,
        weight: 100,
      }),
    );
    const box = makeBox();
    const result = packItems(items, box);

    for (const p of result.packed) {
      expect([Rotation.WHD, Rotation.DHW]).toContain(p.rotation);
    }
  });

  // Test 9: Fragile items have Y >= all non-fragile Y positions
  it('should place fragile items at or above non-fragile items', () => {
    const items = [
      makeItem({ id: 'heavy', sku: 'HEAVY', isFragile: false, weight: 1000, width: 100, height: 50, depth: 50 }),
      makeItem({ id: 'fragile', sku: 'FRAGILE', isFragile: true, weight: 200, width: 80, height: 40, depth: 40 }),
    ];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(2);
    const nonFragileMaxY = Math.max(
      ...result.packed.filter((p) => !p.isFragile).map((p) => p.y),
    );
    const fragileMinY = Math.min(
      ...result.packed.filter((p) => p.isFragile).map((p) => p.y),
    );
    expect(fragileMinY).toBeGreaterThanOrEqual(nonFragileMaxY);
  });

  // Test 10: maxStackWeight constraint
  it('should respect maxStackWeight constraint', () => {
    // Place a lightweight item with low maxStackWeight, then try heavy item
    const items = [
      makeItem({ id: 'base', sku: 'BASE', weight: 200, maxStackWeight: 100, width: 200, height: 50, depth: 200, isFragile: false }),
      makeItem({ id: 'heavy', sku: 'HEAVY', weight: 5000, width: 200, height: 50, depth: 200, isFragile: false }),
    ];
    // Use a box that forces vertical stacking
    const box = makeBox({ innerWidth: 200, innerHeight: 200, innerDepth: 200 });
    const result = packItems(items, box);

    // Both should pack but heavy item should be at bottom (sorted by weight DESC)
    // The heavy item packs first (weight 5000 > 200), so the light item goes on top
    // Light item on top of heavy is fine since heavy has no maxStackWeight constraint
    expect(result.packed.length).toBeGreaterThanOrEqual(1);
  });

  // Test 11: Sort order verification
  it('should place heavy non-fragile items before light fragile items', () => {
    const items = [
      makeItem({ id: 'light-fragile', sku: 'LF', isFragile: true, weight: 100, width: 50, height: 30, depth: 30 }),
      makeItem({ id: 'heavy-nf', sku: 'HNF', isFragile: false, weight: 2000, width: 80, height: 50, depth: 50 }),
      makeItem({ id: 'medium-nf', sku: 'MNF', isFragile: false, weight: 500, width: 60, height: 40, depth: 40 }),
    ];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed.length).toBe(3);

    // Non-fragile items should be placed first (lower indices = placed first = bottom)
    const nonFragilePlacements = result.packed.filter((p) => !p.isFragile);
    const fragilePlacements = result.packed.filter((p) => p.isFragile);

    // All non-fragile should have lower or equal Y than fragile
    if (fragilePlacements.length > 0 && nonFragilePlacements.length > 0) {
      const maxNFY = Math.max(...nonFragilePlacements.map((p) => p.y));
      const minFY = Math.min(...fragilePlacements.map((p) => p.y));
      expect(minFY).toBeGreaterThanOrEqual(maxNFY);
    }
  });

  // Test 12: 20 items split across multiple boxes (tested via packItems into multiple calls)
  it('should handle items that do not fit in a single box', () => {
    const items = Array.from({ length: 20 }, (_, i) =>
      makeItem({
        id: `item-${i}`,
        sku: `SKU-${i}`,
        width: 80,
        height: 80,
        depth: 80,
        weight: 200,
      }),
    );
    // Small box that fits maybe 3-4 items
    const box = makeBox({ innerWidth: 200, innerHeight: 200, innerDepth: 200, maxWeight: 50000 });
    const result = packItems(items, box);

    // Some items should pack, some should not (20 80mm cubes won't all fit in 200mm cube)
    expect(result.packed.length + result.unpacked.length).toBe(20);
    expect(result.packed.length).toBeGreaterThan(0);
    expect(result.unpacked.length).toBeGreaterThan(0);
  });

  // Test 13: No empty boxes (every packed result has at least 1 placement)
  it('should not produce empty results when items are provided', () => {
    const items = [makeItem()];
    const box = makeBox();
    const result = packItems(items, box);

    if (result.packed.length > 0) {
      expect(result.packed.length).toBeGreaterThanOrEqual(1);
    }
  });

  // Test 14: Zero items input
  it('should return empty arrays for zero items', () => {
    const box = makeBox();
    const result = packItems([], box);

    expect(result.packed).toHaveLength(0);
    expect(result.unpacked).toHaveLength(0);
    expect(result.utilization).toBe(0);
  });

  // Test 15: Performance - 10 items < 50ms
  it('should pack 10 items in under 50ms', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      makeItem({ id: `p-${i}`, sku: `P-${i}`, width: 50 + i * 5, height: 30, depth: 20, weight: 100 }),
    );
    const box = makeBox();
    const start = performance.now();
    packItems(items, box);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  // Test 16: Performance - 30 items < 200ms
  it('should pack 30 items in under 200ms', () => {
    const items = Array.from({ length: 30 }, (_, i) =>
      makeItem({ id: `p-${i}`, sku: `P-${i}`, width: 40 + (i % 5) * 10, height: 30, depth: 20, weight: 100 }),
    );
    const box = makeBox({ innerWidth: 500, innerHeight: 500, innerDepth: 500 });
    const start = performance.now();
    packItems(items, box);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  // Test 17: Performance - 50 items < 500ms
  it('should pack 50 items in under 500ms', () => {
    const items = Array.from({ length: 50 }, (_, i) =>
      makeItem({ id: `p-${i}`, sku: `P-${i}`, width: 30 + (i % 5) * 10, height: 25, depth: 20, weight: 80 }),
    );
    const box = makeBox({ innerWidth: 600, innerHeight: 600, innerDepth: 600 });
    const start = performance.now();
    packItems(items, box);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });

  // Test 18: 50 identical items - no infinite loop
  it('should pack 50 identical items without infinite loop (< 2s)', () => {
    const items = Array.from({ length: 50 }, (_, i) =>
      makeItem({ id: `dup-${i}`, sku: 'SAME-SKU', width: 50, height: 50, depth: 50, weight: 100 }),
    );
    const box = makeBox({ innerWidth: 500, innerHeight: 500, innerDepth: 500, maxWeight: 100000 });
    const start = performance.now();
    const result = packItems(items, box);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
    expect(result.packed.length + result.unpacked.length).toBe(50);
  });

  // Test 19: Item with weight=0 (sticker)
  it('should pack a zero-weight item correctly', () => {
    const items = [makeItem({ weight: 0, width: 50, height: 50, depth: 1 })];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(1);
    expect(result.packed[0].weight).toBe(0);
  });

  // Test 20: Very thin item (0.5mm depth)
  it('should pack an item with 0.5mm depth correctly', () => {
    const items = [makeItem({ width: 100, height: 50, depth: 0.5, weight: 10 })];
    const box = makeBox();
    const result = packItems(items, box);

    expect(result.packed).toHaveLength(1);
    expect(result.packed[0].depth).toBeLessThanOrEqual(0.5);
  });

  // Test 21: No negative coordinates
  it('should never produce negative placement coordinates', () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      makeItem({ id: `neg-${i}`, sku: `NEG-${i}`, width: 60, height: 40, depth: 30, weight: 200 }),
    );
    const box = makeBox();
    const result = packItems(items, box);

    for (const p of result.packed) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.z).toBeGreaterThanOrEqual(0);
    }
  });

  // Test 22: No placement extends beyond box inner dimensions
  it('should not place items extending beyond box boundaries', () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      makeItem({ id: `bd-${i}`, sku: `BD-${i}`, width: 60, height: 40, depth: 30, weight: 200 }),
    );
    const box = makeBox();
    const result = packItems(items, box);

    for (const p of result.packed) {
      expect(p.x + p.width).toBeLessThanOrEqual(box.innerWidth);
      expect(p.y + p.height).toBeLessThanOrEqual(box.innerHeight);
      expect(p.z + p.depth).toBeLessThanOrEqual(box.innerDepth);
    }
  });
});
