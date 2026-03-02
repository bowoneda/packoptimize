"use client";

import { useState } from "react";
import { useBoxes, useCreateBox, useUpdateBox, useDeleteBox } from "@/hooks/use-boxes";
import { BoxesTable } from "@/components/boxes/boxes-table";
import { BoxFormDialog } from "@/components/boxes/box-form-dialog";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { BoxType } from "@/types/api";

export default function BoxesPage() {
  const { data: boxes, isLoading } = useBoxes();
  const createBox = useCreateBox();
  const updateBox = useUpdateBox();
  const deleteBox = useDeleteBox();

  const [formOpen, setFormOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<BoxType | null>(null);
  const [deletingBox, setDeletingBox] = useState<BoxType | null>(null);

  const handleEdit = (box: BoxType) => {
    setEditingBox(box);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: Partial<BoxType>) => {
    try {
      if (editingBox) {
        await updateBox.mutateAsync({ id: editingBox.id, ...data });
        toast.success("Box type updated");
      } else {
        await createBox.mutateAsync(data);
        toast.success("Box type created");
      }
      setEditingBox(null);
    } catch {
      toast.error("Failed to save box type");
      throw new Error("Failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingBox) return;
    try {
      await deleteBox.mutateAsync(deletingBox.id);
      toast.success("Box type deleted");
    } catch {
      toast.error("Failed to delete box type");
    }
    setDeletingBox(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Box Inventory</h2>
          <p className="text-sm text-muted-foreground">
            Manage your box types with inner/outer dimensions and pricing
          </p>
        </div>
        <Button
          className="bg-[#0B4228] hover:bg-[#115C3A] rounded-full shadow-md active:scale-95 transition-all duration-300 min-h-[44px] px-5 sm:px-6"
          onClick={() => {
            setEditingBox(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-2" />
          Add Box Type
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <BoxesTable
          boxes={boxes ?? []}
          onEdit={handleEdit}
          onDelete={setDeletingBox}
        />
      )}

      <BoxFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingBox(null);
        }}
        box={editingBox}
        onSubmit={handleFormSubmit}
        isPending={createBox.isPending || updateBox.isPending}
      />

      <AlertDialog open={!!deletingBox} onOpenChange={() => setDeletingBox(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete box type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingBox?.name}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
