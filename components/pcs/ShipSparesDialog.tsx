"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";

const itemSchema = z.object({
  itemName: z.string().min(1, "Required"),
  awbNumber: z.string().min(1, "Required"),
  pcs: z.coerce.number().int().positive("Must be > 0"),
  weight: z.coerce.number().positive("Must be > 0"),
  airlineFlight: z.string().min(1, "Required"),
  remarks: z.string().optional(),
});

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

export type ShipSpareItem = z.infer<typeof itemSchema>;
export type ShipSparesForm = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<ShipSparesForm>;
  onSave: (data: ShipSparesForm) => Promise<void> | void;
  serviceName?: string;
}

export default function ShipSparesDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
  serviceName,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShipSparesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: initialValues?.items ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Optional UX: when opened with no rows, start with one empty row
  useEffect(() => {
    if (open && fields.length === 0) {
      append({
        itemName: "",
        awbNumber: "",
        pcs: 1,
        weight: 0,
        airlineFlight: "",
        remarks: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[98vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl
             max-h-[85vh] p-0 overflow-hidden rounded-2xl flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur px-6 py-4">
          <DialogHeader>
            <DialogTitle>Ship Spares Details</DialogTitle>
            <DialogDescription>
              {serviceName ?? "Enter details for ship spares"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body (scrolls) */}
        <ScrollArea className="flex-1 px-6 py-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Items</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                append({
                  itemName: "",
                  awbNumber: "",
                  pcs: 1,
                  weight: 0,
                  airlineFlight: "",
                  remarks: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add item
            </Button>
          </div>

          {/* Desktop/tablet table */}
          <div className="overflow-x-auto hidden md:block">
            <Table className="min-w-[1000px]">
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead className="w-[220px]">Item Name</TableHead>
                  <TableHead className="w-[180px]">AWB Number</TableHead>
                  <TableHead className="w-[110px]">No. of Pcs</TableHead>
                  <TableHead className="w-[120px]">Weight</TableHead>
                  <TableHead className="w-[180px]">
                    Arrival Airline/Flight
                  </TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="w-[44px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f, idx) => (
                  <TableRow key={f.id} className="align-middle">
                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g. Fuel Pump"
                        {...register(`items.${idx}.itemName` as const)}
                        className="h-9"
                      />
                      {errors.items?.[idx]?.itemName && (
                        <p className="text-[10px] text-destructive mt-1">
                          {errors.items[idx]?.itemName?.message}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g. 176-12345678"
                        {...register(`items.${idx}.awbNumber` as const)}
                        className="h-9"
                      />
                      {errors.items?.[idx]?.awbNumber && (
                        <p className="text-[10px] text-destructive mt-1">
                          {errors.items[idx]?.awbNumber?.message}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number"
                        inputMode="numeric"
                        step={1}
                        min={1}
                        placeholder="1"
                        {...register(`items.${idx}.pcs` as const, {
                          valueAsNumber: true,
                        })}
                        className="h-9 text-center"
                      />
                      {errors.items?.[idx]?.pcs && (
                        <p className="text-[10px] text-destructive mt-1">
                          {errors.items[idx]?.pcs?.message}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="any"
                        min={0}
                        placeholder="45.5"
                        {...register(`items.${idx}.weight` as const, {
                          valueAsNumber: true,
                        })}
                        className="h-9 text-center"
                      />
                      {errors.items?.[idx]?.weight && (
                        <p className="text-[10px] text-destructive mt-1">
                          {errors.items[idx]?.weight?.message}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="e.g. QR 654"
                        {...register(`items.${idx}.airlineFlight` as const)}
                        className="h-9"
                      />
                      {errors.items?.[idx]?.airlineFlight && (
                        <p className="text-[10px] text-destructive mt-1">
                          {errors.items[idx]?.airlineFlight?.message}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      <Input
                        placeholder="Optional notes…"
                        {...register(`items.${idx}.remarks` as const)}
                        className="h-9"
                      />
                    </TableCell>

                    <TableCell className="py-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(idx)}
                        aria-label={`Remove item ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {fields.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-6"
                    >
                      No items added yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {fields.map((f, idx) => (
              <div key={f.id} className="rounded-lg border p-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Item Name"
                    {...register(`items.${idx}.itemName` as const)}
                  />
                  <Input
                    placeholder="AWB Number"
                    {...register(`items.${idx}.awbNumber` as const)}
                  />
                  <Input
                    type="number"
                    inputMode="numeric"
                    step={1}
                    min={1}
                    placeholder="Pcs"
                    {...register(`items.${idx}.pcs` as const, {
                      valueAsNumber: true,
                    })}
                  />
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min={0}
                    placeholder="Weight"
                    {...register(`items.${idx}.weight` as const, {
                      valueAsNumber: true,
                    })}
                  />
                  <Input
                    className="col-span-2"
                    placeholder="Arrival Airline/Flight"
                    {...register(`items.${idx}.airlineFlight` as const)}
                  />
                  <Input
                    className="col-span-2"
                    placeholder="Remarks"
                    {...register(`items.${idx}.remarks` as const)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {errors.items && typeof errors.items?.message === "string" && (
            <p className="text-sm text-destructive mt-4">
              {errors.items.message}
            </p>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t bg-background px-6 py-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(async (data) => {
              await onSave(data);
              onOpenChange(false);
            })}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
