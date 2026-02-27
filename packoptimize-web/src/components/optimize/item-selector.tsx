"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Item } from "@/types/api";

interface SelectedItem {
  id: string;
  quantity: number;
}

interface ItemSelectorProps {
  items: Item[];
  selected: SelectedItem[];
  onChange: (selected: SelectedItem[]) => void;
  onNext: () => void;
}

export function ItemSelector({ items, selected, onChange, onNext }: ItemSelectorProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = new Set(selected.map((s) => s.id));

  const toggleItem = (itemId: string) => {
    if (selectedIds.has(itemId)) {
      onChange(selected.filter((s) => s.id !== itemId));
    } else {
      onChange([...selected, { id: itemId, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    onChange(
      selected.map((s) => (s.id === itemId ? { ...s, quantity: Math.max(1, Math.min(100, quantity)) } : s))
    );
  };

  const totalUnits = selected.reduce((sum, s) => sum + s.quantity, 0);
  const totalWeight = selected.reduce((sum, s) => {
    const item = items.find((i) => i.id === s.id);
    return sum + (item?.weight ?? 0) * s.quantity;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{selected.length} items</Badge>
          <Badge variant="secondary">{totalUnits} units</Badge>
          <Badge variant="secondary">~{(totalWeight / 1000).toFixed(2)} kg</Badge>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        {filtered.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const sel = selected.find((s) => s.id === item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 border-b px-4 py-3 last:border-b-0 ${
                isSelected ? "bg-blue-50/50" : ""
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku} &middot; {item.width}x{item.height}x{item.depth}mm &middot; {item.weight}g
                  {item.isFragile && " \u26A0 Fragile"}
                </p>
              </div>
              {isSelected && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Qty:</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={sel?.quantity ?? 1}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 h-8 text-center"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onNext}
          disabled={selected.length === 0}
        >
          Next: Configure Options
        </Button>
      </div>
    </div>
  );
}
