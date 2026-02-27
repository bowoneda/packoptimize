import { resolveCompatibilityGroups } from '../compatibility-resolver';
import { CompatibilityRule, PackableItem } from '../types';

function makeItem(id: string, name: string): PackableItem {
  return {
    id,
    sku: `SKU-${id}`,
    name,
    width: 100,
    height: 50,
    depth: 30,
    weight: 500,
    isFragile: false,
    canRotate: true,
    maxStackWeight: null,
    quantity: 1,
  };
}

describe('CompatibilityResolver', () => {
  // Test 48: Incompatible items in different groups
  it('should place INCOMPATIBLE items in different groups', () => {
    const items = [makeItem('A', 'Item A'), makeItem('B', 'Item B')];
    const rules: CompatibilityRule[] = [
      { itemIdA: 'A', itemIdB: 'B', rule: 'INCOMPATIBLE' },
    ];

    const { groups } = resolveCompatibilityGroups(items, rules);

    // A and B should be in different groups
    const groupOfA = groups.find((g) => g.some((i) => i.id === 'A'));
    const groupOfB = groups.find((g) => g.some((i) => i.id === 'B'));
    expect(groupOfA).toBeDefined();
    expect(groupOfB).toBeDefined();
    expect(groupOfA).not.toBe(groupOfB);
  });

  // Test 49: MUST_SHIP_TOGETHER items in same group
  it('should place MUST_SHIP_TOGETHER items in the same group', () => {
    const items = [makeItem('A', 'Item A'), makeItem('B', 'Item B')];
    const rules: CompatibilityRule[] = [
      { itemIdA: 'A', itemIdB: 'B', rule: 'MUST_SHIP_TOGETHER' },
    ];

    const { groups } = resolveCompatibilityGroups(items, rules);

    const groupOfA = groups.find((g) => g.some((i) => i.id === 'A'));
    expect(groupOfA).toBeDefined();
    expect(groupOfA!.some((i) => i.id === 'B')).toBe(true);
  });

  // Test 50: Conflict - MUST_SHIP + INCOMPATIBLE -> warning
  it('should generate warning for conflicting rules', () => {
    const items = [makeItem('A', 'Item A'), makeItem('B', 'Item B')];
    const rules: CompatibilityRule[] = [
      { itemIdA: 'A', itemIdB: 'B', rule: 'MUST_SHIP_TOGETHER' },
      { itemIdA: 'A', itemIdB: 'B', rule: 'INCOMPATIBLE' },
    ];

    const { warnings } = resolveCompatibilityGroups(items, rules);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0].toLowerCase()).toContain('conflict');
  });

  // Test 51: Items with no rules in default group
  it('should place items with no rules in a default group', () => {
    const items = [
      makeItem('A', 'Item A'),
      makeItem('B', 'Item B'),
      makeItem('C', 'Item C'),
    ];
    const rules: CompatibilityRule[] = [];

    const { groups } = resolveCompatibilityGroups(items, rules);

    // All items should be in one group
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(3);
  });
});
