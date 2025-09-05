"use client";

import React, { useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray, Controller, Path } from "react-hook-form";
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

/* ───────────── schemas ───────────── */
const itemSchema = z.object({
  id: z.string().uuid().optional(),
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
  onDelete?: (id: string) => Promise<boolean> | boolean;
  serviceName?: string;
}

export default function ShipSparesDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
  onDelete,
  serviceName,
}: Props) {
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShipSparesForm>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      items: initialValues?.items ?? [
        {
          itemName: "",
          awbNumber: "",
          pcs: 1,
          weight: 0.0, // must be positive
          airlineFlight: "",
          remarks: "",
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  // Reset form when dialog opens / initial values change
  useEffect(() => {
    if (!open) return;
    const src = Array.isArray(initialValues?.items) ? initialValues!.items : [];

    const items: ShipSpareItem[] =
      src.length > 0
        ? src.map((r) => ({
            id: r.id,
            itemName: r.itemName ?? "",
            awbNumber: r.awbNumber ?? "",
            pcs:
              typeof r.pcs === "number"
                ? r.pcs
                : Number.isFinite(Number(r.pcs))
                ? Number(r.pcs)
                : 1,
            weight:
              typeof r.weight === "number"
                ? r.weight
                : Number.isFinite(Number(r.weight))
                ? Number(r.weight)
                : 0.0,
            airlineFlight: r.airlineFlight ?? "",
            remarks: r.remarks ?? "",
          }))
        : [
            {
              itemName: "",
              awbNumber: "",
              pcs: 1,
              weight: 0.0,
              airlineFlight: "",
              remarks: "",
            },
          ];

    reset({ items });
    replace(items);
  }, [open, initialValues, reset, replace]);

  const submit = async (data: ShipSparesForm) => {
    await onSave(data);
    onOpenChange(false);
  };

  const removeRow = async (idx: number) => {
    const row = getValues(`items.${idx}` as Path<ShipSparesForm>);
    if ((row as any)?.id && onDelete) {
      const sure = window.confirm("Delete this item? This cannot be undone.");
      if (!sure) return;
      const ok = await onDelete((row as any).id);
      if (!ok) return;
    }
    remove(idx);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl max-h-[85vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur px-6 py-4">
          <DialogHeader>
            <DialogTitle>Ship Spares Details</DialogTitle>
            <DialogDescription>
              {serviceName ?? "Enter details for ship spares"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Real form */}
        <form
          id="ship-spares-form"
          onSubmit={handleSubmit(submit)}
          className="contents"
          autoComplete="off"
        >
          {/* Body */}
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
                    weight: 0.0,
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
                    <TableHead className="w-[120px]">Weight (kg)</TableHead>
                    <TableHead className="w-[180px]">
                      Arrival Airline/Flight
                    </TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead className="w-[44px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((f, idx) => {
                    const base = `items.${idx}` as const;
                    const err = errors.items?.[idx];

                    return (
                      <TableRow key={f.id} className="align-middle">
                        {/* itemName */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.itemName`}
                            render={({ field }) => (
                              <Input
                                placeholder="e.g. Fuel Pump"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9"
                              />
                            )}
                          />
                          {err?.itemName && (
                            <p className="text-[10px] text-destructive mt-1">
                              {err.itemName.message}
                            </p>
                          )}
                        </TableCell>

                        {/* awbNumber */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.awbNumber`}
                            render={({ field }) => (
                              <Input
                                placeholder="e.g. 176-12345678"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9"
                              />
                            )}
                          />
                          {err?.awbNumber && (
                            <p className="text-[10px] text-destructive mt-1">
                              {err.awbNumber.message}
                            </p>
                          )}
                        </TableCell>

                        {/* pcs */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.pcs`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                inputMode="numeric"
                                step={1}
                                min={1}
                                placeholder="1"
                                value={
                                  field.value === undefined
                                    ? ""
                                    : String(field.value)
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9 text-center"
                              />
                            )}
                          />
                          {err?.pcs && (
                            <p className="text-[10px] text-destructive mt-1">
                              {err.pcs.message}
                            </p>
                          )}
                        </TableCell>

                        {/* weight */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.weight`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                inputMode="decimal"
                                step="any"
                                min={0.0}
                                placeholder="45.5"
                                value={
                                  field.value === undefined
                                    ? ""
                                    : String(field.value)
                                }
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9 text-center"
                              />
                            )}
                          />
                          {err?.weight && (
                            <p className="text-[10px] text-destructive mt-1">
                              {err.weight.message}
                            </p>
                          )}
                        </TableCell>

                        {/* airlineFlight */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.airlineFlight`}
                            render={({ field }) => (
                              <Input
                                placeholder="e.g. QR 654"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9"
                              />
                            )}
                          />
                          {err?.airlineFlight && (
                            <p className="text-[10px] text-destructive mt-1">
                              {err.airlineFlight.message}
                            </p>
                          )}
                        </TableCell>

                        {/* remarks */}
                        <TableCell className="py-2">
                          <Controller
                            control={control}
                            name={`${base}.remarks`}
                            render={({ field }) => (
                              <Input
                                placeholder="Optional notes…"
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                ref={field.ref}
                                className="h-9"
                              />
                            )}
                          />
                        </TableCell>

                        {/* delete */}
                        <TableCell className="py-2 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(idx)}
                            aria-label={`Remove item ${idx + 1}`}
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              {fields.map((f, idx) => {
                const base = `items.${idx}` as const;
                const err = errors.items?.[idx];
                return (
                  <div key={f.id} className="rounded-lg border p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Controller
                        control={control}
                        name={`${base}.itemName`}
                        render={({ field }) => (
                          <Input
                            placeholder="Item Name"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${base}.awbNumber`}
                        render={({ field }) => (
                          <Input
                            placeholder="AWB Number"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${base}.pcs`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            inputMode="numeric"
                            step={1}
                            min={1}
                            placeholder="Pcs"
                            value={
                              field.value === undefined
                                ? ""
                                : String(field.value)
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${base}.weight`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            inputMode="decimal"
                            step="any"
                            min={0.0}
                            placeholder="Weight"
                            value={
                              field.value === undefined
                                ? ""
                                : String(field.value)
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${base}.airlineFlight`}
                        render={({ field }) => (
                          <Input
                            className="col-span-2"
                            placeholder="Arrival Airline/Flight"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`${base}.remarks`}
                        render={({ field }) => (
                          <Input
                            className="col-span-2"
                            placeholder="Remarks"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(idx)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    {/* minimal mobile error hints */}
                    <div className="space-y-1">
                      {err?.itemName && (
                        <p className="text-[10px] text-destructive">
                          {err.itemName.message}
                        </p>
                      )}
                      {err?.awbNumber && (
                        <p className="text-[10px] text-destructive">
                          {err.awbNumber.message}
                        </p>
                      )}
                      {err?.pcs && (
                        <p className="text-[10px] text-destructive">
                          {err.pcs.message}
                        </p>
                      )}
                      {err?.weight && (
                        <p className="text-[10px] text-destructive">
                          {err.weight.message}
                        </p>
                      )}
                      {err?.airlineFlight && (
                        <p className="text-[10px] text-destructive">
                          {err.airlineFlight.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {typeof errors.items?.message === "string" && (
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
              type="submit"
              form="ship-spares-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
