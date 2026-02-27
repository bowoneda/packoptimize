import { CompatibilityRule, PackableItem } from './types';

// Union-Find data structure for MUST_SHIP_TOGETHER grouping
class UnionFind {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  makeSet(id: string): void {
    if (!this.parent.has(id)) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  find(id: string): string {
    const p = this.parent.get(id);
    if (p === undefined) return id;
    if (p !== id) {
      const root = this.find(p);
      this.parent.set(id, root); // path compression
      return root;
    }
    return id;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return;

    const rankA = this.rank.get(rootA) ?? 0;
    const rankB = this.rank.get(rootB) ?? 0;

    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
  }
}

/**
 * Groups items based on compatibility rules BEFORE packing.
 *
 * Algorithm:
 * 1. Build Union-Find with MUST_SHIP_TOGETHER relationships
 * 2. Check for conflicts (MUST_SHIP_TOGETHER + INCOMPATIBLE between same pair)
 * 3. Group must-ship-together items
 * 4. Assign unaffiliated items to the largest compatible group
 * 5. Ensure INCOMPATIBLE items are in separate groups
 */
export function resolveCompatibilityGroups(
  items: PackableItem[],
  rules: CompatibilityRule[],
): {
  groups: PackableItem[][];
  warnings: string[];
} {
  const warnings: string[] = [];

  if (items.length === 0) {
    return { groups: [], warnings };
  }

  if (rules.length === 0) {
    return { groups: [items], warnings };
  }

  const itemMap = new Map<string, PackableItem>();
  for (const item of items) {
    itemMap.set(item.id, item);
  }

  const uf = new UnionFind();
  for (const item of items) {
    uf.makeSet(item.id);
  }

  // Collect incompatible pairs
  const incompatiblePairs: Array<[string, string]> = [];

  // Process rules
  for (const rule of rules) {
    const hasA = itemMap.has(rule.itemIdA);
    const hasB = itemMap.has(rule.itemIdB);
    if (!hasA || !hasB) continue; // Skip rules for items not in this batch

    if (rule.rule === 'MUST_SHIP_TOGETHER') {
      // Check for conflict: is there also an INCOMPATIBLE rule?
      const hasConflict = rules.some(
        (r) =>
          r.rule === 'INCOMPATIBLE' &&
          ((r.itemIdA === rule.itemIdA && r.itemIdB === rule.itemIdB) ||
            (r.itemIdA === rule.itemIdB && r.itemIdB === rule.itemIdA)),
      );
      if (hasConflict) {
        const itemA = itemMap.get(rule.itemIdA)!;
        const itemB = itemMap.get(rule.itemIdB)!;
        warnings.push(
          `Conflict: ${itemA.name} and ${itemB.name} have both MUST_SHIP_TOGETHER and INCOMPATIBLE rules. MUST_SHIP_TOGETHER takes priority.`,
        );
      }
      uf.union(rule.itemIdA, rule.itemIdB);
    } else if (rule.rule === 'INCOMPATIBLE') {
      incompatiblePairs.push([rule.itemIdA, rule.itemIdB]);
    }
  }

  // Build initial groups from Union-Find
  const groupMap = new Map<string, PackableItem[]>();
  for (const item of items) {
    const root = uf.find(item.id);
    if (!groupMap.has(root)) {
      groupMap.set(root, []);
    }
    groupMap.get(root)!.push(item);
  }

  // Convert to array of groups
  let groups = Array.from(groupMap.values());

  // For items in single-item groups (unaffiliated), try to merge with largest compatible group
  const mustShipIds = new Set<string>();
  for (const rule of rules) {
    if (rule.rule === 'MUST_SHIP_TOGETHER') {
      mustShipIds.add(rule.itemIdA);
      mustShipIds.add(rule.itemIdB);
    }
  }

  // Separate must-ship groups from flexible (single unaffiliated) items
  const mustShipGroups: PackableItem[][] = [];
  const flexibleItems: PackableItem[] = [];

  for (const group of groups) {
    if (group.length > 1 || mustShipIds.has(group[0].id)) {
      mustShipGroups.push(group);
    } else {
      flexibleItems.push(group[0]);
    }
  }

  // Build incompatibility lookup
  const isIncompatible = (idA: string, idB: string): boolean => {
    return incompatiblePairs.some(
      ([a, b]) => (a === idA && b === idB) || (a === idB && b === idA),
    );
  };

  const canJoinGroup = (item: PackableItem, group: PackableItem[]): boolean => {
    return !group.some((g) => isIncompatible(item.id, g.id));
  };

  // Assign flexible items to the largest compatible group
  const finalGroups: PackableItem[][] = [...mustShipGroups];

  // If no must-ship groups exist, start with one empty group
  if (finalGroups.length === 0 && flexibleItems.length > 0) {
    finalGroups.push([]);
  }

  for (const item of flexibleItems) {
    // Find the largest group this item is compatible with
    let bestGroup: PackableItem[] | null = null;
    let bestSize = -1;

    for (const group of finalGroups) {
      if (canJoinGroup(item, group) && group.length > bestSize) {
        bestGroup = group;
        bestSize = group.length;
      }
    }

    if (bestGroup) {
      bestGroup.push(item);
    } else {
      // No compatible group found - create a new one
      const newGroup = [item];
      finalGroups.push(newGroup);
    }
  }

  // Remove any empty groups
  const result = finalGroups.filter((g) => g.length > 0);

  return { groups: result, warnings };
}
