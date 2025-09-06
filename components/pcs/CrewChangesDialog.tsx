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
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ConfirmDialog from "@/components/ui/confirm-dialog";

/* ---------------- Schema ---------------- */

const time24 = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use 24h time HH:MM");

const flightInputSchema = z.object({
  flightNumber: z.string().min(1, "Required"),
  flightName: z.string().min(1, "Required"),
  departureDate: z.string().min(1, "Required"),
  departureTime: time24,
  arrivalDate: z.string().min(1, "Required"),
  arrivalTime: time24,
  from: z.string().min(1, "Required"),
  to: z.string().min(1, "Required"),
});

const flightSchema = flightInputSchema.transform(({ from, to, ...rest }) => ({
  ...rest,
  destination: `${from.trim().toUpperCase()} - ${to.trim().toUpperCase()}`,
}));

const crewMemberSchema = z.object({
  name: z.string().min(1, "Required"),
  nationality: z.string().min(1, "Required"),
  rank: z.string().min(1, "Required"),
  passportNo: z.string().min(1, "Required"),
  eTicketNo: z.string().min(1, "Required"),
});

const formSchema = z.object({
  type: z.enum(["on", "off"], { errorMap: () => ({ message: "Select type" }) }),
  crewName: z.string().min(1, "Required"),
  airline: z.string().min(1, "Required"),
  onBoardDate: z.string().min(1, "Required"),
  crewList: z.array(crewMemberSchema).min(1, "Add at least one crew member"),
  flights: z.array(flightSchema).min(1, "Add at least one flight"),
});

export type CrewChangesFormInput = z.input<typeof formSchema>;
export type CrewChangesPayload = z.output<typeof formSchema>;

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

/* ---------- media query ---------- */
function useIsMdUp() {
  const [isMdUp, setIsMdUp] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsMdUp(mq.matches);
    update();
    if ((mq as any).addEventListener) {
      (mq as any).addEventListener("change", update);
      return () => (mq as any).removeEventListener("change", update);
    } else {
      (mq as any).addListener(update);
      return () => (mq as any).removeListener(update);
    }
  }, []);
  return isMdUp;
}

/* ---------- date picker ---------- */
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

/* ---------- normalize helpers ---------- */
function splitDestination(dest?: string): { from: string; to: string } {
  if (!dest || typeof dest !== "string") return { from: "", to: "" };
  const [a = "", b = ""] = dest.split("-").map((s) => s.trim());
  return { from: a, to: b };
}

function normalizeFlights(
  flights?: any[]
): z.infer<typeof flightInputSchema>[] {
  return (flights ?? []).map((f) => {
    let from = typeof f?.from === "string" ? f.from : "";
    let to = typeof f?.to === "string" ? f.to : "";
    if ((!from || !to) && typeof f?.destination === "string") {
      const split = splitDestination(f.destination);
      from = split.from;
      to = split.to;
    }
    return {
      flightNumber: typeof f?.flightNumber === "string" ? f.flightNumber : "",
      flightName: typeof f?.flightName === "string" ? f.flightName : "",
      departureDate:
        typeof f?.departureDate === "string" ? f.departureDate : "",
      departureTime:
        typeof f?.departureTime === "string" ? f.departureTime : "",
      arrivalDate: typeof f?.arrivalDate === "string" ? f.arrivalDate : "",
      arrivalTime: typeof f?.arrivalTime === "string" ? f.arrivalTime : "",
      from,
      to,
    };
  });
}

/* --------------- Props --------------- */
export type ExistingCrewRecord = {
  id: string; // Crw_Chg_Serv_id
  crewName: string;
  type: "signon" | "signoff";
  onBoardDate?: string;
  airline?: string;
  crewList?: any[];
  crewFlights?: any[];
  createdAt?: string;
};

interface CrewChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Partial<CrewChangesFormInput>;
  existingRecords?: ExistingCrewRecord[];

  // delete handler
  onDelete?: (id: string) => boolean | Promise<boolean>;

  onSave: (
    data: CrewChangesPayload,
    meta: { id?: string | null }
  ) => boolean | Promise<boolean>;
}

/* --------------- Component --------------- */
export default function CrewChangesDialog({
  open,
  onOpenChange,
  initialValues,
  existingRecords = [],
  onSave,
  onDelete,
}: CrewChangesDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<CrewChangesFormInput>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: {
      type: initialValues?.type || "on",
      crewName: initialValues?.crewName || "",
      airline: initialValues?.airline || "",
      onBoardDate: initialValues?.onBoardDate || "",
      crewList: initialValues?.crewList || [],
      flights: normalizeFlights(initialValues?.flights),
    },
  });

  const crewFields = useFieldArray({ control, name: "crewList" });
  const flightFields = useFieldArray({ control, name: "flights" });

  const isMdUp = useIsMdUp();
  const [selectedId, setSelectedId] = React.useState<string>("new");

  // delete dialog state
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    if (open) setSelectedId("new");
  }, [open]);

  React.useEffect(() => {
    if (selectedId === "new") {
      reset({
        type: initialValues?.type || "on",
        crewName: initialValues?.crewName || "",
        airline: initialValues?.airline || "",
        onBoardDate: initialValues?.onBoardDate || "",
        crewList: initialValues?.crewList || [],
        flights: normalizeFlights(initialValues?.flights),
      });
      return;
    }
    const rec = existingRecords.find((r) => r.id === selectedId);
    if (!rec) return;

    reset({
      type: rec.type === "signon" ? "on" : "off",
      crewName: rec.crewName ?? "",
      airline: rec.airline ?? "",
      onBoardDate: rec.onBoardDate ?? "",
      crewList: Array.isArray(rec.crewList)
        ? rec.crewList.map((p: any) => ({
            name: p.personName ?? "",
            nationality: p.nationality ?? "",
            rank: p.rank ?? "",
            passportNo: p.passportNumber ?? "",
            eTicketNo: p.eTicketNo ?? "",
          }))
        : [],
      flights: normalizeFlights(
        Array.isArray(rec.crewFlights)
          ? rec.crewFlights.map((f: any) => ({
              flightName: f.flightName ?? "",
              flightNumber: f.flightNumber ?? "",
              departureDate: f.depatureDate ?? "",
              departureTime: f.depatureTime ?? "",
              arrivalDate: f.arriveDate ?? "",
              arrivalTime: f.arriveTime ?? "",
              destination: f.destination ?? "",
            }))
          : []
      ),
    });
  }, [selectedId, existingRecords, initialValues, reset]);

  const onSubmit = async (values: CrewChangesFormInput) => {
    const payload = values as unknown as CrewChangesPayload;
    const ok = await onSave(payload, { id: selectedId ?? undefined });
    if (ok) onOpenChange(false);
  };

  const selectedRec = React.useMemo(
    () => existingRecords.find((r) => r.id === selectedId),
    [existingRecords, selectedId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] sm:max-w-4xl md:max-w-6xl lg:max-w-7xl xl:max-w-[90rem] max-h-[90vh] p-0 overflow-hidden rounded-2xl flex flex-col">
        <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 pt-5 pb-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl">Edit Crew Changes</DialogTitle>
            <DialogDescription>
              Provide all details for on/off signing. Use the selector to edit
              an existing record or create a new one.
            </DialogDescription>

            {existingRecords.length > 0 && (
              <div className="grid grid-cols-12 gap-3 pt-2">
                <div className="col-span-12 md:col-span-6">
                  <Label className="mb-1 block">Record</Label>
                  <Select
                    value={selectedId}
                    onValueChange={(v) => setSelectedId(v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose record to edit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">➕ Create new…</SelectItem>
                      {existingRecords.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.crewName || "(no crew name)"} • {r.type}{" "}
                          {r.onBoardDate ? `• ${toDisplay(r.onBoardDate)}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogHeader>
        </div>

        {/* REAL FORM SUBMIT */}
        <form
          id="crew-changes-form"
          onSubmit={handleSubmit(onSubmit)}
          className="contents"
        >
          <ScrollArea className="flex-1 px-6 py-5 overflow-y-auto">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4">
                <Label htmlFor="type">Sign Type</Label>
                <select
                  id="type"
                  {...register("type")}
                  className="form-input h-10"
                >
                  <option value="on">Sign On</option>
                  <option value="off">Sign Off</option>
                </select>
                {errors.type && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

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
                <Label>Sign On/Off Date</Label>
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
                          ? `${toDisplay(field.value)} (${weekday(
                              field.value
                            )})`
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
                        type="button"
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
                      <TableHead className="w-10"></TableHead>
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
                            <p className="text[10px] text-destructive mt-1">
                              {errors.crewList[idx]?.name?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Nationality"
                            {...register(
                              `crewList.${idx}.nationality` as const
                            )}
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
                            type="button"
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
                  type="button"
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

              {isMdUp ? (
                <div className="overflow-x-auto">
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
                              {...register(
                                `flights.${idx}.flightNumber` as const
                              )}
                              className="h-9"
                            />
                          </TableCell>

                          <TableCell className="py-2">
                            <Input
                              placeholder="Flight name"
                              {...register(
                                `flights.${idx}.flightName` as const
                              )}
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
                              {...register(
                                `flights.${idx}.departureTime` as const
                              )}
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
                              {...register(
                                `flights.${idx}.arrivalTime` as const
                              )}
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
                              {...register(`flights.${idx}.from` as const, {
                                setValueAs: (v) =>
                                  typeof v === "string" ? v.trim() : "",
                              })}
                              className="h-9"
                            />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              placeholder="To"
                              {...register(`flights.${idx}.to` as const, {
                                setValueAs: (v) =>
                                  typeof v === "string" ? v.trim() : "",
                              })}
                              className="h-9"
                            />
                          </TableCell>

                          <TableCell className="py-2 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
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
              ) : (
                <div className="space-y-3">
                  {flightFields.fields.length === 0 && (
                    <div className="text-muted-foreground text-sm text-center py-4">
                      No flights added yet
                    </div>
                  )}

                  {flightFields.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="rounded-lg border p-3 space-y-3"
                    >
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
                          {...register(`flights.${idx}.arrivalTime` as const)}
                          className="h-10 text-center"
                        />
                        <Input
                          placeholder="From"
                          {...register(`flights.${idx}.from` as const, {
                            setValueAs: (v) =>
                              typeof v === "string" ? v.trim() : "",
                          })}
                          className="h-10"
                        />
                        <Input
                          placeholder="To"
                          {...register(`flights.${idx}.to` as const, {
                            setValueAs: (v) =>
                              typeof v === "string" ? v.trim() : "",
                          })}
                          className="h-10"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          onClick={() => flightFields.remove(idx)}
                          aria-label={`Remove flight row ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simple top-level array error helper after a failed submit */}
            {submitCount > 0 &&
              (errors.flights?.root || (errors as any).flights?.message) && (
                <p className="mt-3 text-sm text-destructive">
                  Add at least one valid flight with dates and times.
                </p>
              )}
          </ScrollArea>

          {/* Footer */}
          <div className="border-t bg-background px-6 py-4 flex items-center justify-end gap-2">
            {/* Delete (with ConfirmDialog) when editing an existing record */}
            {onDelete && selectedId !== "new" && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                  disabled={isDeleting || isSubmitting}
                >
                  Delete
                </Button>

                <ConfirmDialog
                  open={deleteOpen}
                  onOpenChange={(o) => {
                    setDeleteOpen(o);
                  }}
                  title="Delete crew change record?"
                  description={
                    <span>
                      This will permanently delete{" "}
                      <span className="font-semibold">
                        {selectedRec?.crewName || "this record"}
                      </span>
                      {selectedRec?.onBoardDate
                        ? ` • ${toDisplay(selectedRec.onBoardDate)}`
                        : ""}
                      . This action cannot be undone.
                    </span>
                  }
                  confirmText="Delete"
                  cancelText="Cancel"
                  destructive
                  loading={isDeleting}
                  onConfirm={async () => {
                    if (!onDelete || !selectedId || selectedId === "new")
                      return;
                    try {
                      setIsDeleting(true);
                      const ok = await onDelete(selectedId);
                      if (ok) {
                        setDeleteOpen(false);
                        onOpenChange(false);
                      }
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                />
              </>
            )}

            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(async (values) => {
                const payload = values as unknown as CrewChangesPayload;
                const ok = await onSave(payload, {
                  id: selectedId ?? undefined,
                });
                if (ok) onOpenChange(false);
              })}
              disabled={isSubmitting || isDeleting}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
