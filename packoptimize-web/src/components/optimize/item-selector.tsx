"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm rounded-full bg-[#F5F6F8] border-gray-200"
        />
        <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground flex-wrap">
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">{selected.length} items</span>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">{totalUnits} units</span>
          <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">~{(totalWeight / 1000).toFixed(2)} kg</span>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto rounded-md border">
        {filtered.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const sel = selected.find((s) => s.id === item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-2 sm:gap-4 border-b px-3 sm:px-4 py-3 last:border-b-0 ${
                isSelected ? "bg-[#E8F5EE]/50" : ""
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItem(item.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {item.sku} &middot; {item.width}x{item.height}x{item.depth}mm &middot; {item.weight}g
                  {item.isFragile && " \u26A0 Fragile"}
                </p>
              </div>
              {isSelected && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:inline">Qty:</span>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={sel?.quantity ?? 1}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-14 sm:w-16 h-8 text-center text-sm"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300"
          onClick={onNext}
          disabled={selected.length === 0}
        >
          Next: Configure Options
        </Button>
      </div>
    </div>
  );
}
