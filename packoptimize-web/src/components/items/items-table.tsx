"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree, Pencil, Trash, ArrowsDownUp, MagnifyingGlass, Package } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import type { Item } from "@/types/api";

interface ItemsTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

function MobileItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0B4228] truncate">{item.name}</p>
          <p className="text-[11px] font-mono text-[#8B95A5]">{item.sku}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <DotsThree size={16} weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil size={16} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
              <Trash size={16} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8B95A5]">
        <span>{item.width} × {item.height} × {item.depth} mm</span>
        <span>{item.weight}g</span>
      </div>
      <div className="flex gap-1.5 mt-2">
        {item.isFragile && (
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">Fragile</span>
        )}
        {item.canRotate && (
          <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-[10px] font-bold">Rotate</span>
        )}
      </div>
    </div>
  );
}

export function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SKU
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm text-[#0B4228]">{row.getValue("sku")}</span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-[#0B4228]">{row.getValue("name")}</span>
        ),
      },
      {
        id: "dimensions",
        header: "Dimensions (mm)",
        cell: ({ row }) => {
          const item = row.original;
          return <span className="text-[#8B95A5]">{item.width} × {item.height} × {item.depth}</span>;
        },
      },
      {
        accessorKey: "weight",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Weight (g)
            <ArrowsDownUp size={12} className="ml-1" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-[#8B95A5]">{row.getValue<number>("weight").toLocaleString()}</span>
        ),
      },
      {
        accessorKey: "isFragile",
        header: "Fragile",
        cell: ({ row }) =>
          row.getValue("isFragile") ? (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Fragile</span>
          ) : null,
      },
      {
        accessorKey: "canRotate",
        header: "Rotate",
        cell: ({ row }) =>
          row.getValue("canRotate") ? (
            <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">Yes</span>
          ) : (
            <Badge variant="outline" className="rounded-full">No</Badge>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThree size={16} weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Pencil size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-sm">
        <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A5]" />
        <Input
          placeholder="Search items..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
        />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <MobileItemCard
              key={row.id}
              item={row.original}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyState
            icon={Package}
            title="No items in your catalog"
            description="Add your first item to start optimizing shipments."
          />
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-[#8B95A5] text-sm font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[#F5F6F8] transition-colors border-b border-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <EmptyState
                      icon={Package}
                      title="No items in your catalog"
                      description="Add your first item to start optimizing shipments."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
