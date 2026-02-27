"use client";

import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { BoxType } from "@/types/api";

const positiveNum = z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive());

const boxSchema = z.object({
  name: z.string().min(1, "Name is required"),
  innerWidth: positiveNum,
  innerHeight: positiveNum,
  innerDepth: positiveNum,
  wallThickness: positiveNum,
  boxWeight: positiveNum,
  maxWeight: positiveNum,
  cost: positiveNum,
  isActive: z.boolean(),
});

type BoxFormValues = z.infer<typeof boxSchema>;

interface BoxFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box?: BoxType | null;
  onSubmit: (data: BoxFormValues & { outerWidth: number; outerHeight: number; outerDepth: number }) => Promise<void>;
  isPending: boolean;
}

export function BoxFormDialog({
  open,
  onOpenChange,
  box,
  onSubmit,
  isPending,
}: BoxFormDialogProps) {
  const form = useForm<BoxFormValues>({
    resolver: zodResolver(boxSchema) as Resolver<BoxFormValues>,
    defaultValues: {
      name: "",
      innerWidth: 0,
      innerHeight: 0,
      innerDepth: 0,
      wallThickness: 3,
      boxWeight: 0,
      maxWeight: 0,
      cost: 0,
      isActive: true,
    },
  });

  const innerWidth = useWatch({ control: form.control, name: "innerWidth" });
  const innerHeight = useWatch({ control: form.control, name: "innerHeight" });
  const innerDepth = useWatch({ control: form.control, name: "innerDepth" });
  const wallThickness = useWatch({ control: form.control, name: "wallThickness" });

  const outerWidth = (innerWidth || 0) + 2 * (wallThickness || 0);
  const outerHeight = (innerHeight || 0) + 2 * (wallThickness || 0);
  const outerDepth = (innerDepth || 0) + 2 * (wallThickness || 0);

  useEffect(() => {
    if (box) {
      form.reset({
        name: box.name,
        innerWidth: box.innerWidth,
        innerHeight: box.innerHeight,
        innerDepth: box.innerDepth,
        wallThickness: box.wallThickness,
        boxWeight: box.boxWeight,
        maxWeight: box.maxWeight,
        cost: box.cost,
        isActive: box.isActive,
      });
    } else {
      form.reset({
        name: "",
        innerWidth: 0,
        innerHeight: 0,
        innerDepth: 0,
        wallThickness: 3,
        boxWeight: 0,
        maxWeight: 0,
        cost: 0,
        isActive: true,
      });
    }
  }, [box, form]);

  const handleSubmit = async (data: BoxFormValues) => {
    await onSubmit({
      ...data,
      outerWidth: data.innerWidth + 2 * data.wallThickness,
      outerHeight: data.innerHeight + 2 * data.wallThickness,
      outerDepth: data.innerDepth + 2 * data.wallThickness,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{box ? "Edit Box Type" : "Add Box Type"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Medium Box" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="innerWidth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner W (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="innerHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner H (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="innerDepth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inner D (mm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="wallThickness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wall Thickness (mm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium text-muted-foreground">Calculated Outer Dims</p>
              <p className="text-sm">{outerWidth} x {outerHeight} x {outerDepth} mm</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="boxWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Box Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Weight (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="mt-0">Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {box ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
