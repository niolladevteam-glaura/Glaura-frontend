"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ThemeToggle } from "@/components/theme-toggle";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/TimePicker";
import {
  ArrowLeft,
  Fuel,
  Anchor,
  Search,
  Plus,
  Ship,
  MapPin,
  Table2,
  LayoutGrid,
  Edit,
  Eye,
  Trash2,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BunkerOperation {
  id: string;
  agencyRef: string;
  vesselName: string;
  imoNo: string;
  voyageNo: string;
  port: string;
  status: "Pending" | "Completed";
  createdAt?: string;
  updatedAt?: string;
}

// Dummy data for initial layout
const DUMMY_OPERATIONS: BunkerOperation[] = [
  {
    id: "1",
    agencyRef: "AG-2026-001",
    vesselName: "NORD VOYAGER",
    imoNo: "9123456",
    voyageNo: "V-120",
    port: "COLOMBO",
    status: "Pending",
  },
  {
    id: "2",
    agencyRef: "AG-2026-002",
    vesselName: "EVER GIVEN",
    imoNo: "9001234",
    voyageNo: "V-99",
    port: "HAMBANTOTA",
    status: "Completed",
  },
];

export default function BunkerOperations() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [operations, setOperations] = useState<BunkerOperation[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<BunkerOperation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewType, setViewType] = useState<"card" | "table">("card");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const initialFormState = {
    agency_ref_no: "",
    SLPAPaymentRef: "",
    documetRefNo: "",
    vessel_name: "",
    imo_number: "",
    voyage_no: "",
    port: "",
    berth_location: "",
    etaDate: "",
    etaTime: "",
    etdDate: "",
    etdTime: "",
    etbDate: "",
    etbTime: "",
    ataDate: "",
    ataTime: "",
    atdDate: "",
    atdTime: "",
    atbDate: "",
    atbTime: "",
    Estimate_port_stay: 0,
    greekLankaPIC: "",
    bordingOfficer: "",
    comments: "",
    areas_for_improvement: "",
    consignees: [
      { ConsigneeName: "", description: "" }
    ]
  };

  const [newOps, setNewOps] = useState(initialFormState);
  const [userOptions, setUserOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/user`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const formatted = json.data.map((u: any) => {
            const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;
            return {
              value: fullName,
              label: fullName
            };
          });
          setUserOptions(formatted);
        }
      } catch (e) {
        console.error("Failed to fetch users");
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchOperations() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/bunkerOps`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const mapped = json.data.map((op: any) => ({
            id: op.ops_id,
            agencyRef: op.agency_ref_no,
            vesselName: op.vessel_name,
            imoNo: op.imo_number,
            voyageNo: op.voyage_no,
            port: op.port,
            status: op.status,
            createdAt: op.createdAt,
            updatedAt: op.updatedAt
          }));
          setOperations(mapped);
          setFilteredOperations(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch bunkering operations");
      } finally {
        setPageLoading(false);
      }
    }
    fetchOperations();
  }, []);

  const router = useRouter();

  useEffect(() => {
    if (isDialogOpen && !newOps.agency_ref_no) {
      setNewOps((prev) => ({
        ...prev,
        agency_ref_no: `AG-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}`,
        SLPAPaymentRef: `SLPA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        documetRefNo: `DOC-${Math.floor(100000 + Math.random() * 900000)}`
      }));
    }
  }, [isDialogOpen, newOps.agency_ref_no]);

  // Auto-calculate Estimate Port Stay (Hrs) from ETD - ETB
  useEffect(() => {
    if (newOps.etdDate && newOps.etbDate) {
      try {
        const d_etd = new Date(newOps.etdDate);
        if (newOps.etdTime && typeof newOps.etdTime === 'string') {
          const [h, m] = newOps.etdTime.split(':');
          d_etd.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
        } else {
          d_etd.setHours(0, 0, 0, 0);
        }

        const d_etb = new Date(newOps.etbDate);
        if (newOps.etbTime && typeof newOps.etbTime === 'string') {
          const [h, m] = newOps.etbTime.split(':');
          d_etb.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
        } else {
          d_etb.setHours(0, 0, 0, 0);
        }

        const diffMs = d_etd.getTime() - d_etb.getTime();
        const diffHrs = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
        
        if (diffHrs !== newOps.Estimate_port_stay && !isNaN(diffHrs)) {
          setNewOps(prev => ({ ...prev, Estimate_port_stay: diffHrs }));
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }, [newOps.etdDate, newOps.etdTime, newOps.etbDate, newOps.etbTime, newOps.Estimate_port_stay]);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    try {
      setCurrentUser(JSON.parse(userData));
    } catch (err) {
      setCurrentUser({ name: "Demo User", accessLevel: "A" });
    }
  }, [router]);

  useEffect(() => {
    let filtered = operations;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.vesselName.toLowerCase().includes(term) ||
          op.agencyRef.toLowerCase().includes(term) ||
          op.imoNo.includes(term)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((op) => op.status.toLowerCase() === statusFilter);
    }
    setFilteredOperations(filtered);
  }, [searchTerm, statusFilter, operations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const formatDisplayDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleAddConsignee = () => {
    if (newOps.consignees.length >= 3) {
      toast.warning("Maximum of 3 consignees allowed.");
      return;
    }
    setNewOps({
      ...newOps,
      consignees: [...newOps.consignees, { ConsigneeName: "", description: "" }]
    });
  };

  const handleRemoveConsignee = (index: number) => {
    const updated = [...newOps.consignees];
    updated.splice(index, 1);
    setNewOps({ ...newOps, consignees: updated });
  };

  const handleConsigneeChange = (index: number, field: string, value: string) => {
    const updated = [...newOps.consignees];
    updated[index] = { ...updated[index], [field]: value };
    setNewOps({ ...newOps, consignees: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formatDateTime = (dateVal: any, timeVal: any) => {
        if (!dateVal) return null;
        try {
          const d = new Date(dateVal);
          if (timeVal && typeof timeVal === 'string') {
            const [hours, minutes] = timeVal.split(':');
            d.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);
          }
          return d.toISOString();
        } catch {
          return null;
        }
      };

      const agencyRef = newOps.agency_ref_no || `AG-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}`;
      const slpaRef = newOps.SLPAPaymentRef || `SLPA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const docRef = newOps.documetRefNo || `DOC-${Math.floor(100000 + Math.random() * 900000)}`;

      // Map consignees
      const payloadConsignees = newOps.consignees.filter(c => c.ConsigneeName.trim() !== "").map((c, index) => {
        const types = ["ConsigneeOne", "ConsigneeTwo", "ConsigneeThree"];
        return {
          ConsigneeID: `CON-${String(Math.floor(100 + Math.random() * 900)).padStart(3, '0')}`,
          ConsigneeType: types[index] || `Consignee${index + 1}`,
          ConsigneeName: c.ConsigneeName,
          description: c.description || "N/A"
        };
      });

      const reqBody = {
        agency_ref_no: agencyRef,
        vessel_name: newOps.vessel_name,
        imo_number: newOps.imo_number,
        voyage_no: newOps.voyage_no,
        port: newOps.port,
        berth_location: newOps.berth_location,
        ETA: formatDateTime(newOps.etaDate, newOps.etaTime),
        ETD: formatDateTime(newOps.etdDate, newOps.etdTime),
        ETB: formatDateTime(newOps.etbDate, newOps.etbTime),
        ATA: formatDateTime(newOps.ataDate, newOps.ataTime),
        ATD: formatDateTime(newOps.atdDate, newOps.atdTime),
        ATB: formatDateTime(newOps.atbDate, newOps.atbTime),
        Estimate_port_stay: Number(newOps.Estimate_port_stay),
        ConsigneeOneID: payloadConsignees[0]?.ConsigneeID || null,
        ConsigneeTwoID: payloadConsignees[1]?.ConsigneeID || null,
        ConsigneeThreeID: payloadConsignees[2]?.ConsigneeID || null,
        greekLankaPIC: newOps.greekLankaPIC,
        bordingOfficer: newOps.bordingOfficer,
        SLPAPaymentRef: slpaRef,
        DCReferenceNo: `DC-${Math.floor(100000 + Math.random() * 900000)}`,
        documetRefNo: docRef,
        comments: newOps.comments || "N/A",
        areas_for_improvement: newOps.areas_for_improvement || "N/A",
        consignees: payloadConsignees,
        user: currentUser?.name || "ops_admin"
      };

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/bunkerOps`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(reqBody)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Failed to create Bunkering Operation");
      }

      toast.success(result.message || "Bunkering operation created successfully");
      setIsDialogOpen(false);
      setNewOps(initialFormState);

      // Append dummy item conceptually so it shows on screen
      setOperations([{
        id: result.data?.ops_id || Date.now().toString(),
        agencyRef: agencyRef,
        vesselName: newOps.vessel_name,
        imoNo: newOps.imo_number,
        voyageNo: newOps.voyage_no,
        port: newOps.port,
        status: "Pending"
      }, ...operations]);

    } catch (err: any) {
      toast.error("Error creating Bunkering Ops", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userName = currentUser?.name || "sathira";

      const res = await fetch(`${API_BASE_URL}/bunkerOps/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ user: userName })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete operation");

      toast.success(result.message || "Operation deleted successfully");
      
      // Update local state
      setOperations(prev => prev.filter(op => op.id !== id));
      setFilteredOperations(prev => prev.filter(op => op.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete operation");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setOperationToDelete(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading bunkering operations...</p>
      </div>
    );
  }

  if (!currentUser) return null;

  const TableView = () => (
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900 border">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Agency Ref</th>
            <th className="px-4 py-3 text-left font-semibold">Vessel Name</th>
            <th className="px-4 py-3 text-left font-semibold">IMO No</th>
            <th className="px-4 py-3 text-left font-semibold">Voyage No</th>
            <th className="px-4 py-3 text-left font-semibold">Port</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOperations.map((op) => (
            <tr key={op.id} className="border-b dark:border-gray-700">
              <td className="px-4 py-3">
                <Badge variant="outline" className={getStatusColor(op.status)}>
                  {op.status}
                </Badge>
              </td>
              <td className="px-4 py-3 font-medium">{op.agencyRef}</td>
              <td className="px-4 py-3">
                <span className="font-semibold">{op.vesselName}</span>
              </td>
              <td className="px-4 py-3">{op.imoNo}</td>
              <td className="px-4 py-3">{op.voyageNo}</td>
              <td className="px-4 py-3">{op.port}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link href={`/bunkering-operations/${op.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      {op.status === "Completed" ? (
                        <>
                          <Eye className="h-4 w-4" /> View Operation
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" /> Edit
                        </>
                      )}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => {
                      setOperationToDelete(op.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filteredOperations.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8">
                <Fuel className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No operations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - fully responsive */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
          {/* Left Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto">
            <Link href="/dashboard" className="flex-shrink-0">
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
                <Fuel className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Bunkering Operations
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Tanker Specific Workflows
                </p>
              </div>
            </div>
          </div>
          {/* Right Section - responsive */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 mt-3 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser?.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser?.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Bunkering Operations Management</span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Open Bunkering Operation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-semibold">
                      Create Bunkering Operation
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                      Fill in the operation details to generate a new Reference Number and initialize the workflow.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    {/* Reference Numbers Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
                      <div className="space-y-2">
                        <Label>Agency Ref No</Label>
                        <Input className="uppercase" value={newOps.agency_ref_no} onChange={e => setNewOps({ ...newOps, agency_ref_no: e.target.value.toUpperCase() })} />
                      </div>
                      <div className="space-y-2">
                        <Label>SLPA Payment Ref</Label>
                        <Input className="uppercase" value={newOps.SLPAPaymentRef} onChange={e => setNewOps({ ...newOps, SLPAPaymentRef: e.target.value.toUpperCase() })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Document Ref No</Label>
                        <Input className="uppercase" value={newOps.documetRefNo} onChange={e => setNewOps({ ...newOps, documetRefNo: e.target.value.toUpperCase() })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Vessel Name</Label>
                          <Input className="uppercase" placeholder="e.g. MT Ocean Titan" value={newOps.vessel_name} onChange={e => setNewOps({ ...newOps, vessel_name: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                          <Label>IMO Number</Label>
                          <Input className="uppercase" placeholder="e.g. 9234567" value={newOps.imo_number} onChange={e => setNewOps({ ...newOps, imo_number: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Voyage No</Label>
                          <Input className="uppercase" placeholder="e.g. VOY-7788" value={newOps.voyage_no} onChange={e => setNewOps({ ...newOps, voyage_no: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Port</Label>
                          <Input className="uppercase" placeholder="e.g. Colombo" value={newOps.port} onChange={e => setNewOps({ ...newOps, port: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Berth Location</Label>
                          <Input className="uppercase" placeholder="e.g. Oil Jetty 02" value={newOps.berth_location} onChange={e => setNewOps({ ...newOps, berth_location: e.target.value.toUpperCase() })} />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ETA Date</Label>
                            <DatePicker value={newOps.etaDate} onChange={val => setNewOps({ ...newOps, etaDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ETA Time</Label>
                            <TimePicker value={newOps.etaTime} onChange={val => setNewOps({ ...newOps, etaTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ETB Date</Label>
                            <DatePicker value={newOps.etbDate} onChange={val => setNewOps({ ...newOps, etbDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ETB Time</Label>
                            <TimePicker value={newOps.etbTime} onChange={val => setNewOps({ ...newOps, etbTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ETD Date</Label>
                            <DatePicker value={newOps.etdDate} onChange={val => setNewOps({ ...newOps, etdDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ETD Time</Label>
                            <TimePicker value={newOps.etdTime} onChange={val => setNewOps({ ...newOps, etdTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ATA Date</Label>
                            <DatePicker value={newOps.ataDate} onChange={val => setNewOps({ ...newOps, ataDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ATA Time</Label>
                            <TimePicker value={newOps.ataTime} onChange={val => setNewOps({ ...newOps, ataTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ATB Date</Label>
                            <DatePicker value={newOps.atbDate} onChange={val => setNewOps({ ...newOps, atbDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ATB Time</Label>
                            <TimePicker value={newOps.atbTime} onChange={val => setNewOps({ ...newOps, atbTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>ATD Date</Label>
                            <DatePicker value={newOps.atdDate} onChange={val => setNewOps({ ...newOps, atdDate: val })} className="w-full h-[40px]" />
                          </div>
                          <div className="space-y-2">
                            <Label>ATD Time</Label>
                            <TimePicker value={newOps.atdTime} onChange={val => setNewOps({ ...newOps, atdTime: val })} className="h-[40px]" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Estimate Port Stay (Hrs)</Label>
                          <Input type="number" min="0" placeholder="60" value={newOps.Estimate_port_stay} onChange={e => setNewOps({ ...newOps, Estimate_port_stay: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Greek Lanka PIC</Label>
                          <Select value={newOps.greekLankaPIC} onValueChange={val => setNewOps({ ...newOps, greekLankaPIC: val })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select PIC" />
                            </SelectTrigger>
                            <SelectContent>
                              {userOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Boarding Officer</Label>
                          <Select value={newOps.bordingOfficer} onValueChange={val => setNewOps({ ...newOps, bordingOfficer: val })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Officer" />
                            </SelectTrigger>
                            <SelectContent>
                              {userOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-md p-4 bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold">Consignees</Label>
                        {newOps.consignees.length < 3 && (
                          <Button type="button" variant="outline" size="sm" onClick={handleAddConsignee}>
                            <Plus className="w-4 h-4 mr-2" /> Add Consignee
                          </Button>
                        )}
                      </div>
                      {newOps.consignees.map((c, idx) => (
                        <div key={idx} className="flex gap-2 items-start relative bg-white dark:bg-gray-900 p-3 rounded-md border shadow-sm">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label className="text-xs">Consignee Name</Label>
                              <Input className="uppercase" placeholder="e.g. Ceylon Petroleum Corporation" value={c.ConsigneeName} onChange={e => handleConsigneeChange(idx, "ConsigneeName", e.target.value.toUpperCase())} />
                            </div>
                            <div>
                              <Label className="text-xs">Description</Label>
                              <Input className="uppercase" placeholder="e.g. Main cargo receiver" value={c.description} onChange={e => handleConsigneeChange(idx, "description", e.target.value.toUpperCase())} />
                            </div>
                          </div>
                          {newOps.consignees.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 mt-5" onClick={() => handleRemoveConsignee(idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <DialogFooter className="pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Operation"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 mt-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Vessel Name, Agency Ref, IMO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Type Toggles */}
            <div className="flex gap-2">
              <Button
                variant={viewType === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("table")}
                className="flex items-center gap-2"
              >
                <Table2 className="h-4 w-4" />
                Table View
              </Button>
              <Button
                variant={viewType === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("card")}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Card View
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {viewType === "table" ? (
            <TableView />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOperations.map((op) => (
                <Card key={op.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-primary flex flex-col h-full relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 z-10"
                    onClick={(e) => {
                      e.preventDefault();
                      setOperationToDelete(op.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-3 border-b flex-shrink-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                          {op.agencyRef}
                        </Badge>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Ship className="h-5 w-5 text-gray-500" />
                          {op.vesselName}
                        </CardTitle>
                      </div>
                      <Badge className={getStatusColor(op.status)}>
                        {op.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-y-4 text-sm flex-grow">
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold uppercase">IMO No</p>
                      <p className="font-medium mt-1">{op.imoNo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold uppercase">Voyage No</p>
                      <p className="font-medium mt-1">{op.voyageNo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs font-semibold uppercase">Port</p>
                      <p className="font-medium mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {op.port}
                      </p>
                    </div>
                    <div className="col-span-2 pt-2 border-t mt-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground italic">
                        <span>Created: {formatDisplayDateTime(op.createdAt)}</span>
                        <span>Updated: {formatDisplayDateTime(op.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 border-t mt-auto">
                    <Link href={`/bunkering-operations/${op.id}`} className="w-full">
                      <Button variant="default" className="w-full flex items-center gap-2">
                        {op.status === "Completed" ? (
                          <>
                            <Eye className="h-4 w-4" /> View Operation
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" /> Update Operation
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
              {filteredOperations.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed">
                  <Fuel className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No operations found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bunkering operation
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
              onClick={(e) => {
                e.preventDefault();
                if (operationToDelete) handleDelete(operationToDelete);
              }}
            >
              {isLoading ? "Deleting..." : "Delete Operation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
