"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Trash2,
  Plus,
  ArrowLeft,
  Anchor,
  Loader2,
  Pencil,
  House,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const DatePicker = dynamic(() => import("@/components/ui/date-picker"), {
  ssr: false,
});

import CrewChangesDialog, {
  type CrewChangesPayload,
  type ExistingCrewRecord,
} from "@/components/pcs/CrewChangesDialog";

import ShipSparesDialog, {
  type ShipSparesForm,
} from "@/components/pcs/ShipSparesDialog";

interface PCS {
  id: string;
  job_id: string;
  service_id: string;
  service_name: string;
  vendor_id: string;
  vendor_name: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}
interface Vendor {
  vendor_id: string;
  name: string;
}
interface Service {
  service_id: string;
  service_name: string;
}

interface ServiceTaskHeader {
  header_id: string;
  job_id: string;
  service_id: string;
  header_name: string;
  status: boolean | string;
  created_by: string;
  compleated_time?: string | null;
  compleated_date?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface CrewMember {
  name: string;
  nationality: string;
  rank: string;
  passportNo: string;
  eTicketNo: string;
}
interface FlightDetail {
  flightNumber: string;
  flightName: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  from: string;
  to: string;
}

interface PortCall {
  job_id: string;
  vessel_name: string;
  vessel_imo: string;
  port: string;
  client_company: string;
  eta: string;
  etd?: string;
  assigned_pic: string;
  priority: string;
  created: string;
  updatedAt: string;
}

export default function PortCallServicesPage() {
  const params = useParams();
  const router = useRouter();
  const job_id = params.job_id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { theme } = useTheme();

  const [pcsList, setPCSList] = useState<PCS[]>([]);
  const [vendors, setVendors] = useState<(Vendor | null)[]>([]);
  const [services, setServices] = useState<(Service | null)[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [loading, setLoading] = useState(false);

  // map: serviceId -> deleting flag (so we can show spinner on the exact row)
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});

  // ——— New generic confirm state for deleting a service
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<PCS | null>(null);

  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [crewDialogPCS, setCrewDialogPCS] = useState<PCS | null>(null);

  const [crewName, setCrewName] = useState("");
  const [airline, setAirline] = useState("");
  const [onBoardDate, setOnBoardDate] = useState<string>("");
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  const [flights, setFlights] = useState<FlightDetail[]>([]);

  const [existingCrewRecords, setExistingCrewRecords] = useState<
    ExistingCrewRecord[]
  >([]);

  const [portCall, setPortCall] = useState<PortCall | null>(null);

  const SHIP_SPARES_NAMES = [
    "ship spares clearance and delivery",
    "ship spares off-landing and re-forwarding",
    "ship spares off-landing and connect to another vessel",
  ] as const;

  const isShipSparesService = (name: string) =>
    SHIP_SPARES_NAMES.includes(
      name.trim().toLowerCase() as (typeof SHIP_SPARES_NAMES)[number]
    );

  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [shipDialogPCS, setShipDialogPCS] = useState<PCS | null>(null);
  const [shipInitial, setShipInitial] = useState<ShipSparesForm | undefined>(
    undefined
  );

  // ───────────────── open dialog + preload existing ─────────────────
  const openShipSparesDialog = async (pcs: PCS) => {
    setShipDialogPCS(pcs);
    setShipInitial(undefined);

    const token = getTokenOrRedirect();
    if (!token || !portCall) {
      setShipDialogOpen(true);
      return;
    }

    try {
      // Fetch all, filter by vessel & imo (API doesn't expose a filter endpoint)
      const res = await fetch(`${API_BASE_URL}/spares`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) {
        const relevant = (json.data as ApiSpare[]).filter(
          (s) =>
            s.vessel === portCall.vessel_name &&
            String(s.imo) === String(portCall.vessel_imo)
        );
        setShipInitial(fromApiToForm(relevant));
      }
    } catch {
      // ignore
    } finally {
      setShipDialogOpen(true);
    }
  };

  const closeShipSparesDialog = () => {
    setShipDialogOpen(false);
    setShipDialogPCS(null);
    setShipInitial(undefined);
  };

  // ───────────────── save (create + update) ─────────────────
  const handleShipSparesSave = async (form: ShipSparesForm) => {
    const token = getTokenOrRedirect();
    if (!token || !portCall) return;

    const vessel = portCall.vessel_name;
    const imo = portCall.vessel_imo;

    const toCreate = form.items.filter((i) => !i.id);
    const toUpdate = form.items.filter((i) => !!i.id);

    try {
      // POST new rows (if any)
      if (toCreate.length > 0) {
        const body = toApiCreateBody(toCreate, vessel, imo);
        const resp = await fetch(`${API_BASE_URL}/spares`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.success === false) {
          throw new Error(
            data?.message || `Create failed (HTTP ${resp.status})`
          );
        }
      }

      // PUT updates (if any) — API expects an array
      if (toUpdate.length > 0) {
        const body = toApiUpdateBody(toUpdate, vessel, imo);
        const resp = await fetch(`${API_BASE_URL}/spares`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok || data?.success === false) {
          throw new Error(
            data?.message || `Update failed (HTTP ${resp.status})`
          );
        }
      }

      toast({
        title: "Saved",
        description:
          toCreate.length && toUpdate.length
            ? "Created and updated ship spares."
            : toCreate.length
            ? "Ship spares created."
            : "Ship spares updated.",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save ship spares",
        variant: "destructive",
      });
    }
  };

  // ───────────────── delete a single spare row ─────────────────
  const handleShipSpareDelete = async (id: string): Promise<boolean> => {
    const token = getTokenOrRedirect();
    if (!token) return false;
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid spare id",
        variant: "destructive",
      });
      return false;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/spares/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.success === false) {
        toast({
          title: "Error",
          description: data?.message || `Delete failed (HTTP ${resp.status})`,
          variant: "destructive",
        });
        return false;
      }
      toast({ title: "Deleted", description: "Ship spare deleted." });
      return true;
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to delete ship spare",
        variant: "destructive",
      });
      return false;
    }
  };

  const [headersStats, setHeadersStats] = useState<
    Record<string, { total: number; completed: number }>
  >({});

  type ApiSpare = {
    id: string;
    iteamName: string; // (sic) from API
    vessel: string;
    imo: string;
    awbNumber: string;
    qty: number;
    Weight: number;
    arraival: string;
    remarks?: string | null;
  };

  function fromApiToForm(items: ApiSpare[]): ShipSparesForm {
    return {
      items: items.map((s) => ({
        id: s.id,
        itemName: s.iteamName ?? "",
        awbNumber: s.awbNumber ?? "",
        pcs: Number(s.qty ?? 0),
        weight: Number(s.Weight ?? 0),
        airlineFlight: s.arraival ?? "",
        remarks: s.remarks ?? "",
      })),
    };
  }

  function toApiCreateBody(
    items: ShipSparesForm["items"],
    vessel: string,
    imo: string
  ) {
    return items.map((i) => ({
      iteamName: i.itemName, // API field name is intentionally misspelled
      vessel,
      imo,
      awbNumber: i.awbNumber,
      qty: i.pcs,
      Weight: i.weight,
      arraival: i.airlineFlight, // UI uses airline/flight; API uses 'arraival'
      remarks: i.remarks ?? "",
    }));
  }

  function toApiUpdateBody(
    items: ShipSparesForm["items"],
    vessel: string,
    imo: string
  ) {
    return items.map((i) => ({
      id: i.id,
      iteamName: i.itemName,
      vessel,
      imo,
      awbNumber: i.awbNumber,
      qty: i.pcs,
      Weight: i.weight,
      arraival: i.airlineFlight,
      remarks: i.remarks ?? "",
    }));
  }

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
  }, [router]);

  function getTokenOrRedirect() {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return null;
    }
    return token;
  }

  useEffect(() => {
    if (!job_id) return;
    const token = getTokenOrRedirect();
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/pcs/job/${job_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPCSList(data.data || []))
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [job_id, openDialog]);

  useEffect(() => {
    if (!job_id) return;
    const token = getTokenOrRedirect();
    if (!token) return;
    fetch(`${API_BASE_URL}/portcall?job_id=${job_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Ensure you select the port call with job_id === params.job_id
        const correctPortCall = Array.isArray(data.data)
          ? data.data.find((pc: PortCall) => pc.job_id === job_id)
          : null;
        if (correctPortCall) setPortCall(correctPortCall);
        else setPortCall(null);
      })
      .catch(() => setPortCall(null));
  }, [job_id]);

  useEffect(() => {
    const token = getTokenOrRedirect();
    if (!token) return;
    fetch(`${API_BASE_URL}/service`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setServices(data.data || []));
  }, []);
  useEffect(() => {
    const token = getTokenOrRedirect();
    if (!token) return;
    fetch(`${API_BASE_URL}/vendor`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVendors(data.data || []));
  }, []);

  useEffect(() => {
    async function fetchStats() {
      const token = getTokenOrRedirect();
      if (!token || pcsList.length === 0) return;
      const stats: Record<string, { total: number; completed: number }> = {};
      for (const pcs of pcsList) {
        const headersRes = await fetch(
          `${API_BASE_URL}/servicetask/headers/service/${pcs.service_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const headersData = await headersRes.json();
        const headers: ServiceTaskHeader[] = Array.isArray(headersData.data)
          ? headersData.data
          : [];
        const completed = headers.filter(
          (h: any) => h.status === true || h.status === "true"
        ).length;
        stats[pcs.id] = { total: headers.length, completed };

        if (headers.length > 0 && completed === headers.length && !pcs.status) {
          await fetch(`${API_BASE_URL}/pcs/${pcs.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: true }),
          });
          setPCSList((oldList) =>
            oldList.map((item) =>
              item.id === pcs.id ? { ...item, status: true } : item
            )
          );
        }
      }
      setHeadersStats(stats);
    }
    fetchStats();
  }, [pcsList]);

  // NULL-SAFE filters
  const filteredServices = (services ?? []).filter(
    (s): s is Service =>
      !!s &&
      typeof s.service_name === "string" &&
      s.service_name.toLowerCase().includes((searchService ?? "").toLowerCase())
  );
  const filteredVendors = (vendors ?? []).filter(
    (v): v is Vendor =>
      !!v &&
      typeof v.name === "string" &&
      v.name.toLowerCase().includes((searchVendor ?? "").toLowerCase())
  );

  const handleAddService = async () => {
    const token = getTokenOrRedirect();
    if (!token) return;

    if (!selectedServiceId || !selectedVendorId) {
      toast({
        title: "Error",
        description: "Please select both service and vendor",
        variant: "destructive",
      });
      return;
    }

    const selectedService = (services as Service[]).find(
      (s) => s?.service_id === selectedServiceId
    );
    const selectedVendor = (vendors as Vendor[]).find(
      (v) => v?.vendor_id === selectedVendorId
    );
    if (!selectedService || !selectedVendor) {
      toast({
        title: "Error",
        description: "Selected service or vendor not found",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      job_id,
      service_id: selectedService.service_id,
      service_name: selectedService.service_name,
      vendor_id: selectedVendor.vendor_id,
      vendor_name: selectedVendor.name,
      status: false,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pcs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(responseData?.message || "Failed to add service");

      toast({ title: "Success", description: "Service added successfully" });
      setOpenDialog(false);
      setSelectedServiceId("");
      setSelectedVendorId("");
      setSearchService("");
      setSearchVendor("");

      const refetchResponse = await fetch(`${API_BASE_URL}/pcs/job/${job_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const refetchData = await refetchResponse.json();
      setPCSList(refetchData.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open confirm dialog
  const openDeleteDialog = (service: PCS) => {
    setServiceToDelete(service);
    setConfirmDeleteOpen(true);
  };

  // Do the deletion (called by confirm dialog)
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    const token = getTokenOrRedirect();
    if (!token) return;

    setDeleting((prev) => ({ ...prev, [serviceToDelete.id]: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/pcs/${serviceToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete service");

      setPCSList((list) => list.filter((svc) => svc.id !== serviceToDelete.id));
      toast({ title: "Success", description: "Service deleted successfully" });
      setConfirmDeleteOpen(false);
      setServiceToDelete(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleting((prev) => ({
        ...prev,
        [serviceToDelete?.id || ""]: false,
      }));
    }
  };

  // Crew Change Service logic: always send job_id for GET and POST/PUT
  const openCrewChangeDialog = async (pcs: PCS) => {
    setCrewDialogPCS(pcs);
    setCrewName("");
    setAirline("");
    setOnBoardDate("");
    setCrewList([]);
    setFlights([]);
    setExistingCrewRecords([]);

    const token = getTokenOrRedirect();
    if (!token || !portCall || !job_id) {
      setCrewDialogOpen(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/crew?job_id=${job_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();

      if (json?.success && Array.isArray(json?.data)) {
        // Redundant, but safe: only records for the current job_id
        const matches = json.data
          .filter((c: any) => c.job_id === job_id)
          .map((c: any) => ({
            id: c.Crw_Chg_Serv_id || c.id,
            crewName: c.crewName,
            type: c.type,
            onBoardDate: c.onBoardDate,
            airline: c.airline,
            crewList: c.crewList,
            crewFlights: c.crewFlights,
            createdAt: c.createdAt,
          }));
        setExistingCrewRecords(matches);
      }
    } catch {
      // ignore
    } finally {
      setCrewDialogOpen(true);
    }
  };

  const closeCrewChangeDialog = () => {
    setCrewDialogOpen(false);
    setCrewDialogPCS(null);
    setExistingCrewRecords([]);
  };

  // CREATE / UPDATE
  const handleCrewChangeSave = async (
    data: CrewChangesPayload,
    meta: { id?: string | null }
  ): Promise<boolean> => {
    const token = getTokenOrRedirect();
    if (!token) return false;

    const flights = Array.isArray(data.flights) ? data.flights : [];

    const body = {
      VesselName: portCall?.vessel_name || "",
      imo: portCall?.vessel_imo || "",
      port: portCall?.port || "",
      crewName: data.crewName,
      job_id,
      onBoardDate: data.onBoardDate,
      airline: data.airline,
      type: data.type === "on" ? "signon" : "signoff",
      crewList: data.crewList.map((c) => ({
        personName: c.name,
        nationality: c.nationality,
        eTicketNo: c.eTicketNo,
        passportNumber: c.passportNo,
        rank: c.rank,
      })),
      crewFlights: flights.map((f) => ({
        flightName: f.flightName,
        flightNumber: f.flightNumber,
        depatureTime: f.departureTime,
        depatureDate: f.departureDate,
        arriveTime: f.arrivalTime,
        arriveDate: f.arrivalDate,
        destination: f.destination,
      })),
    };

    console.log("body:", body);
    console.log("Crew Change API will use portCall:", portCall);

    try {
      const doingEdit = !!(meta.id && meta.id !== "new");
      const id = doingEdit ? String(meta.id).trim() : "";

      let url = doingEdit
        ? `${API_BASE_URL}/crew/${id}`
        : `${API_BASE_URL}/crew`;
      let method = doingEdit ? "PUT" : "POST";

      let resp = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const respData = await resp.json().catch(() => ({} as any));

      if (!resp.ok || respData?.success === false) {
        toast({
          title: "Error",
          description:
            respData?.message ||
            `Failed to ${doingEdit ? "update" : "create"} (HTTP ${
              resp.status
            })`,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: doingEdit ? "Updated" : "Created",
        description: doingEdit
          ? "Crew change updated successfully."
          : "Crew change created successfully.",
      });

      setCrewDialogOpen(false);
      setExistingCrewRecords([]);
      return true;
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save Crew Change Service",
        variant: "destructive",
      });
      return false;
    }
  };

  // DELETE a crew record (the confirm should now be inside CrewChangesDialog using the same ConfirmDialog)
  const handleCrewDelete = async (id: string): Promise<boolean> => {
    const token = getTokenOrRedirect();
    if (!token) return false;
    if (!id || id === "new") {
      toast({
        title: "Error",
        description: "Invalid record id",
        variant: "destructive",
      });
      return false;
    }

    try {
      let url = `${API_BASE_URL}/crew/${id}`;
      let resp = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await resp.json().catch(() => ({} as any));
      if (!resp.ok || json?.success === false) {
        toast({
          title: "Error",
          description:
            json?.message || `Failed to delete (HTTP ${resp.status})`,
          variant: "destructive",
        });
        return false;
      }

      toast({ title: "Deleted", description: "Crew change record deleted." });
      setExistingCrewRecords((list) => list.filter((r) => r.id !== id));
      return true;
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to delete Crew Change record",
        variant: "destructive",
      });
      return false;
    }
  };

  const completedServices = pcsList.filter((pcs) => pcs.status).length;
  const totalServices = pcsList.length;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/port-calls" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Port Call Services
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  GLAURA
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser?.name ?? "User"}</span>
              <span className="hidden xs:inline">
                {currentUser?.accessLevel != null
                  ? ` - Level ${currentUser.accessLevel}`
                  : ""}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Port Call Services</h2>
            <p className="text-sm text-muted-foreground">
              {completedServices} of {totalServices} services completed
            </p>
          </div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </div>

        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Services</CardTitle>
            <CardDescription>
              Services assigned to this port call
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pcsList.map((pcs) => {
                    const svcName = (pcs?.service_name ?? "").trim();
                    const nameLc = svcName.toLowerCase();
                    const isCrewChanges = nameLc === "crew changes (on/off)";
                    const isShipSpares = isShipSparesService(svcName);
                    const canEdit = isCrewChanges || isShipSpares;

                    const editOnClick = isCrewChanges
                      ? () => openCrewChangeDialog(pcs)
                      : isShipSpares
                      ? () => openShipSparesDialog(pcs)
                      : undefined;

                    const editClass = isCrewChanges
                      ? "bg-green-100 hover:bg-green-200"
                      : isShipSpares
                      ? "bg-amber-100 hover:bg-amber-200"
                      : "bg-gray-200 cursor-not-allowed";
                    const editTitle = isCrewChanges
                      ? "Edit Crew Changes"
                      : isShipSpares
                      ? "Enter Ship Spares details"
                      : "Edit not available";
                    const editIconClass = isCrewChanges
                      ? "text-green-700"
                      : isShipSpares
                      ? "text-amber-700"
                      : "text-gray-400";

                    return (
                      <TableRow
                        key={pcs.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <TableCell className="font-medium">
                          {svcName || "-"}
                        </TableCell>
                        <TableCell>{pcs?.vendor_name ?? "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-blue-100 hover:bg-gray-100"
                              asChild
                            >
                              <Link
                                href={`/pcs/${job_id}/services/${pcs.id}/headers`}
                              >
                                <Eye className="h-4 w-4 text-gray-700" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={editOnClick}
                              disabled={!canEdit}
                              className={editClass}
                              title={editTitle}
                            >
                              <Pencil className={`h-4 w-4 ${editIconClass}`} />
                            </Button>

                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(pcs)}
                              disabled={deleting[pcs.id]}
                            >
                              {deleting[pcs.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {pcsList.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No services found for this port call
                      </TableCell>
                    </TableRow>
                  )}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {pcsList.length} services
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add Service Dialog (unchanged) */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Port Call Service</DialogTitle>
            <DialogDescription>
              Assign a new service to this port call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Service</Label>
              <Input
                placeholder="Search service..."
                value={searchService}
                onChange={(e) => setSearchService(e.target.value)}
                className="mb-2"
              />
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {filteredServices.map((s) => (
                    <SelectItem key={s.service_id} value={s.service_id}>
                      {s.service_name}
                    </SelectItem>
                  ))}
                  {filteredServices.length === 0 && (
                    <SelectItem value="no-services" disabled>
                      No services found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>
              <Input
                placeholder="Search vendor..."
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                className="mb-2"
              />
              <Select
                value={selectedVendorId}
                onValueChange={setSelectedVendorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVendors.map((v) => (
                    <SelectItem key={v.vendor_id} value={v.vendor_id}>
                      {v.name}
                    </SelectItem>
                  ))}
                  {filteredVendors.length === 0 && (
                    <SelectItem value="no-vendors" disabled>
                      No vendors found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddService}
              disabled={loading || !selectedServiceId || !selectedVendorId}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Service"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reusable Confirm for delete (replaces window.confirm & ad-hoc dialog) */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(o) => {
          setConfirmDeleteOpen(o);
          if (!o) setServiceToDelete(null);
        }}
        title="Delete Service"
        description={
          serviceToDelete ? (
            <>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-destructive">
                {serviceToDelete.service_name}
              </span>
              ? This action cannot be undone.
            </>
          ) : (
            "No service selected."
          )
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={!!deleting[serviceToDelete?.id || ""]}
        onConfirm={handleDeleteService}
      />

      {/* Crew Changes Dialog */}
      <CrewChangesDialog
        open={crewDialogOpen}
        onOpenChange={closeCrewChangeDialog}
        initialValues={{ crewName, airline, onBoardDate, crewList, flights }}
        existingRecords={existingCrewRecords}
        onSave={handleCrewChangeSave}
        onDelete={handleCrewDelete}
      />

      {/* Ship Spares Dialog */}
      <ShipSparesDialog
        open={shipDialogOpen}
        onOpenChange={closeShipSparesDialog}
        serviceName={shipDialogPCS?.service_name}
        initialValues={shipInitial}
        onSave={handleShipSparesSave}
        onDelete={handleShipSpareDelete}
      />
    </div>
  );
}
