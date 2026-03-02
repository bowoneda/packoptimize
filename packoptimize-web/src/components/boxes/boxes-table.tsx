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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree, Pencil, Trash, ArrowsDownUp, MagnifyingGlass, Cube } from "@phosphor-icons/react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { BoxType } from "@/types/api";

interface BoxesTableProps {
  boxes: BoxType[];
  onEdit: (box: BoxType) => void;
  onDelete: (box: BoxType) => void;
}

function MobileBoxCard({
  box,
  onEdit,
  onDelete,
}: {
  box: BoxType;
  onEdit: (box: BoxType) => void;
  onDelete: (box: BoxType) => void;
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-gray-100 p-4 shadow-sm",
      !box.isActive && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#E8EAED] flex items-center justify-center text-[#8B95A5] shrink-0">
            <Cube size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B4228] truncate">{box.name}</p>
            <p className="text-[11px] text-[#8B95A5]">${box.cost.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {box.isActive ? (
            <span className="bg-[#91E440] text-[#0B4228] px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
          ) : (
            <span className="bg-[#D1D5DB] text-[#8B95A5] px-2 py-0.5 rounded-full text-[10px] font-bold">Inactive</span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <DotsThree size={16} weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl">
              <DropdownMenuItem onClick={() => onEdit(box)}>
                <Pencil size={16} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(box)}>
                <Trash size={16} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex gap-4 text-[11px] text-[#8B95A5] mt-1">
        <span>Inner: {box.innerWidth}×{box.innerHeight}×{box.innerDepth}</span>
        <span>Max: {(box.maxWeight / 1000).toFixed(1)}kg</span>
      </div>
    </div>
  );
}

export function BoxesTable({ boxes, onEdit, onDelete }: BoxesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<BoxType>[]>(
    () => [
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EAED] flex items-center justify-center text-[#8B95A5]">
              <Cube size={18} />
            </div>
            <span className="font-semibold text-[#0B4228]">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        id: "innerDims",
        header: "Inner (mm)",
        cell: ({ row }) => {
          const b = row.original;
          return `${b.innerWidth} x ${b.innerHeight} x ${b.innerDepth}`;
        },
      },
      {
        id: "outerDims",
        header: "Outer (mm)",
        cell: ({ row }) => {
          const b = row.original;
          return `${b.outerWidth} x ${b.outerHeight} x ${b.outerDepth}`;
        },
      },
      {
        accessorKey: "wallThickness",
        header: "Wall (mm)",
      },
      {
        accessorKey: "boxWeight",
        header: "Weight (g)",
      },
      {
        accessorKey: "maxWeight",
        header: "Max Weight (g)",
      },
      {
        accessorKey: "cost",
        header: "Cost ($)",
        cell: ({ row }) => `$${(row.getValue("cost") as number).toFixed(2)}`,
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.getValue("isActive") ? (
            <span className="bg-[#91E440] text-[#0B4228] px-3 py-1 rounded-full text-xs font-bold">Active</span>
          ) : (
            <span className="bg-[#D1D5DB] text-[#8B95A5] px-3 py-1 rounded-full text-xs font-bold">Inactive</span>
          ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const box = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThree size={16} weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl">
                <DropdownMenuItem onClick={() => onEdit(box)}>
                  <Pencil size={16} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(box)}
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
    data: boxes,
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
      <div className="relative max-w-sm">
        <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A5]" />
        <Input
          placeholder="Search boxes..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 rounded-full bg-[#F5F6F8] border-gray-200 focus:ring-[#0B4228]/20 focus:border-[#0B4228]"
        />
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => (
            <MobileBoxCard
              key={row.id}
              box={row.original}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <EmptyState
            icon={Cube}
            title="No box types defined"
            description="Add your box inventory with dimensions and costs to start optimizing."
          />
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block rounded-2xl sm:rounded-3xl border border-gray-100 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[650px]">
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
                  <TableRow key={row.id} className={cn("hover:bg-[#F5F6F8] transition-colors border-b border-gray-50", !row.original.isActive && "opacity-60")}>
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
                      icon={Cube}
                      title="No box types defined"
                      description="Add your box inventory with dimensions and costs to start optimizing."
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
