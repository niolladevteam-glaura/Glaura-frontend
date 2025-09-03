"use client";

import React from "react";
import { z } from "zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";

/* ---------------- Schema ---------------- */
const crewMemberSchema = z.object({
  name: z.string().min(1, "Required"),
  nationality: z.string().min(1, "Required"),
  rank: z.string().min(1, "Required"),
  passportNo: z.string().min(1, "Required"),
  eTicketNo: z.string().min(1, "Required"),
});

const time24 = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/g, "Use 24h time HH:MM");

const flightSchema = z.object({
  flightNumber: z.string().min(1, "Required"),
  flightName: z.string().min(1, "Required"),
  departureDate: z.string().min(1, "Required"),
  departureTime: time24,
  arrivalDate: z.string().min(1, "Required"),
  arrivalTime: time24,
  from: z.string().min(1, "Required"),
  to: z.string().min(1, "Required"),
});

const formSchema = z.object({
  crewName: z.string().min(1, "Required"),
  airline: z.string().min(1, "Required"),
  onBoardDate: z.string().min(1, "Required"),
  crewList: z.array(crewMemberSchema).min(1, "Add at least one crew member"),
  flights: z.array(flightSchema).min(1, "Add at least one flight"),
});

export type CrewChangesForm = z.infer<typeof formSchema>;

/* ---------------- Date helpers ---------------- */
function toIsoDate(d?: Date | null) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function toDisplay(val?: string) {
  if (!val) return "";
  try {
    return format(parseISO(val), "dd.MM.yyyy");
  } catch {
    return "";
  }
}
function weekday(val?: string) {
  if (!val) return "";
  try {
    return format(parseISO(val), "EEE");
  } catch {
    return "";
  }
}

/* ---------- Portal-safe, styled calendar popover ---------- */
type InlineDatePickerProps = {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  side?: "top" | "bottom" | "left" | "right";
};
function InlineDatePicker({
  value,
  onChange,
  placeholder = "dd.mm.yyyy",
  side = "bottom",
}: InlineDatePickerProps) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <Input
          readOnly
          value={value ? toDisplay(value) : ""}
          placeholder={placeholder}
          className="cursor-pointer h-10"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={side}
        sideOffset={6}
        className="z-[1000] p-0"
        collisionPadding={8}
      >
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => onChange(toIsoDate(d))}
          showOutsideDays
          className="p-2"
          classNames={{
            months:
              "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-2",
            caption: "flex justify-between items-center px-2 pt-2",
            caption_label: "text-sm font-medium",
            nav: "flex items-center gap-1",
            button_previous:
              "h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent",
            button_next:
              "h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent",
            table: "w-full border-collapse",
            head_row: "grid grid-cols-7",
            head_cell:
              "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "grid grid-cols-7",
            cell: "relative h-9 w-9",
            day: "h-9 w-9 p-0 text-sm rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:bg-primary aria-selected:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            day_today: "bg-accent/40",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
          }}
          components={{
            Chevron: ({ orientation, className, size }) => {
              const icons = {
                left: ChevronLeft,
                right: ChevronRight,
                up: ChevronLeft,
                down: ChevronRight,
              } as const;
              const Icon =
                icons[orientation as keyof typeof icons] ?? ChevronRight;
              return <Icon className={className} size={size ?? 16} />;
            },
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* --------------- Component --------------- */
interface CrewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CrewChangesForm>;
  onSave: (data: CrewChangesForm) => Promise<void> | void;
}

export default function CrewChangesDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: CrewChangesDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrewChangesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crewName: initialValues?.crewName || "",
      airline: initialValues?.airline || "",
      onBoardDate: initialValues?.onBoardDate || "",
      crewList: initialValues?.crewList || [],
      flights: initialValues?.flights || [],
    },
  });

  const crewFields = useFieldArray({ control, name: "crewList" });
  const flightFields = useFieldArray({ control, name: "flights" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* UPDATED: overflow-hidden so the inner area can scroll */}
      <DialogContent className="w-[98vw] sm:max-w-4xl md:max-w-6xl lg:max-w-7xl xl:max-w-[90rem] max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 pt-5 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl">Edit Crew Changes</DialogTitle>
            <DialogDescription>
              Provide all details for on/off signing.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* UPDATED: make the body the scrollable region */}
        <ScrollArea className="flex-1 px-6 py-5 overflow-y-auto">
          {/* Top fields */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 md:col-span-4">
              <Label htmlFor="crewName">Crew Name</Label>
              <Input
                id="crewName"
                placeholder="e.g. On-signers Batch A"
                {...register("crewName")}
                className="h-10"
              />
              {errors.crewName && (
                <p className="text-xs text-destructive mt-1">
                  {errors.crewName.message}
                </p>
              )}
            </div>
            <div className="col-span-12 md:col-span-4">
              <Label htmlFor="airline">Airline</Label>
              <Input
                id="airline"
                placeholder="e.g. Qatar Airways"
                {...register("airline")}
                className="h-10"
              />
              {errors.airline && (
                <p className="text-xs text-destructive mt-1">
                  {errors.airline.message}
                </p>
              )}
            </div>
            <div className="col-span-12 md:col-span-4">
              <Label>On Board Date</Label>
              <Controller
                control={control}
                name="onBoardDate"
                render={({ field }) => (
                  <>
                    <InlineDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Format: DD.MM.YYYY
                    </div>
                    <div className="mt-0.5 text-[11px]">
                      {field.value
                        ? `${toDisplay(field.value)} (${weekday(field.value)})`
                        : ""}
                    </div>
                  </>
                )}
              />
              {errors.onBoardDate && (
                <p className="text-xs text-destructive mt-1">
                  {errors.onBoardDate.message}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Crew List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Crew List</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        crewFields.append({
                          name: "",
                          nationality: "",
                          rank: "",
                          passportNo: "",
                          eTicketNo: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add row
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add an empty crew row</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Passport No.</TableHead>
                    <TableHead>eTicket No.</TableHead>
                    <TableHead className="w-10"> </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crewFields.fields.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground text-center"
                      >
                        No crew added yet
                      </TableCell>
                    </TableRow>
                  )}
                  {crewFields.fields.map((field, idx) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input
                          placeholder="Name"
                          {...register(`crewList.${idx}.name` as const)}
                          className="h-10"
                        />
                        {errors.crewList?.[idx]?.name && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.crewList[idx]?.name?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Nationality"
                          {...register(`crewList.${idx}.nationality` as const)}
                          className="h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Rank"
                          {...register(`crewList.${idx}.rank` as const)}
                          className="h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Passport No."
                          {...register(`crewList.${idx}.passportNo` as const)}
                          className="h-10"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="eTicket No."
                          {...register(`crewList.${idx}.eTicketNo` as const)}
                          className="h-10"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => crewFields.remove(idx)}
                          aria-label={`Remove crew row ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Flights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">Flights</Label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  flightFields.append({
                    flightNumber: "",
                    flightName: "",
                    departureDate: "",
                    departureTime: "",
                    arrivalDate: "",
                    arrivalTime: "",
                    from: "",
                    to: "",
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add row
              </Button>
            </div>

            {/* Desktop/tablet (md+) */}
            <div className="overflow-x-auto hidden md:block">
              <Table className="min-w-[1180px]">
                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-[120px]">Number</TableHead>
                    <TableHead className="w-[200px]">Name</TableHead>
                    <TableHead className="w-[140px]">Dep. Date</TableHead>
                    <TableHead className="w-[120px]">Dep. Time</TableHead>
                    <TableHead className="w-[140px]">Arr. Date</TableHead>
                    <TableHead className="w-[120px]">Arr. Time</TableHead>
                    <TableHead className="w-[140px]">From</TableHead>
                    <TableHead className="w-[140px]">To</TableHead>
                    <TableHead className="w-[44px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flightFields.fields.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-muted-foreground text-center py-6"
                      >
                        No flights added yet
                      </TableCell>
                    </TableRow>
                  )}

                  {flightFields.fields.map((field, idx) => (
                    <TableRow key={field.id} className="align-middle">
                      <TableCell className="py-2">
                        <Input
                          placeholder="e.g. QR654"
                          {...register(`flights.${idx}.flightNumber` as const)}
                          className="h-9"
                        />
                      </TableCell>

                      <TableCell className="py-2">
                        <Input
                          placeholder="Flight name"
                          {...register(`flights.${idx}.flightName` as const)}
                          className="h-9"
                        />
                      </TableCell>

                      <TableCell className="py-2">
                        <Controller
                          control={control}
                          name={`flights.${idx}.departureDate` as const}
                          render={({ field }) => (
                            <InlineDatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell className="py-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="HH:MM"
                          pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                          {...register(`flights.${idx}.departureTime` as const)}
                          className="h-9 text-center"
                        />
                        {errors.flights?.[idx]?.departureTime && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.flights[idx]?.departureTime?.message}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="py-2">
                        <Controller
                          control={control}
                          name={`flights.${idx}.arrivalDate` as const}
                          render={({ field }) => (
                            <InlineDatePicker
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </TableCell>

                      <TableCell className="py-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="HH:MM"
                          pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                          {...register(`flights.${idx}.arrivalTime` as const)}
                          className="h-9 text-center"
                        />
                        {errors.flights?.[idx]?.arrivalTime && (
                          <p className="text-[10px] text-destructive mt-1">
                            {errors.flights[idx]?.arrivalTime?.message}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="py-2">
                        <Input
                          placeholder="From"
                          {...register(`flights.${idx}.from` as const)}
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="py-2">
                        <Input
                          placeholder="To"
                          {...register(`flights.${idx}.to` as const)}
                          className="h-9"
                        />
                      </TableCell>

                      <TableCell className="py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => flightFields.remove(idx)}
                          aria-label={`Remove flight row ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile (stacked cards) */}
            <div className="md:hidden space-y-3">
              {flightFields.fields.length === 0 && (
                <div className="text-muted-foreground text-sm text-center py-4">
                  No flights added yet
                </div>
              )}

              {flightFields.fields.map((field, idx) => (
                <div key={field.id} className="rounded-lg border p-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Number"
                      {...register(`flights.${idx}.flightNumber` as const)}
                      className="h-10"
                    />
                    <Input
                      placeholder="Name"
                      {...register(`flights.${idx}.flightName` as const)}
                      className="h-10"
                    />
                    <Controller
                      control={control}
                      name={`flights.${idx}.departureDate` as const}
                      render={({ field }) => (
                        <InlineDatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                      {...register(`flights.${idx}.departureTime` as const)}
                      className="h-10 text-center"
                    />
                    <Controller
                      control={control}
                      name={`flights.${idx}.arrivalDate` as const}
                      render={({ field }) => (
                        <InlineDatePicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="HH:MM"
                      pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                      {...register(`flights.${idx}.arrivalTime` as const)}
                      className="h-10 text-center"
                    />
                    <Input
                      placeholder="From"
                      {...register(`flights.${idx}.from` as const)}
                      className="h-10"
                    />
                    <Input
                      placeholder="To"
                      {...register(`flights.${idx}.to` as const)}
                      className="h-10"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => flightFields.remove(idx)}
                      aria-label={`Remove flight row ${idx + 1}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helper */}
        </ScrollArea>

        {/* Footer pinned to bottom */}
        <div className="border-t bg-background px-6 py-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            type="button"
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
