"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Ship,
  Search,
  Plus,
  Edit,
  Eye,
  Anchor,
  AlertTriangle,
  Calendar,
  Flag,
  Building,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Vessel {
  id: string;
  name: string;
  imo: string;
  flag: string;
  vesselType: string;
  grt: number;
  nrt: number;
  dwt: number;
  loa: number;
  builtYear: number;
  callSign: string;
  sscecExpiry: string; // Now always DD.MM.YYYY
  sscecIssued?: string; // YYYY-MM-DD (for state only)
  sscecStatus:
    | "valid"
    | "expiring"
    | "expired"
    | "Valid"
    | "Expiring"
    | "Expired";
  owner: string;
  manager: string;
  piClub: string;
  lastPortCall: string;
  totalPortCalls: number;
  createdAt: string;
  lastUpdated: string;
}

export default function VesselManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [vesselToEdit, setVesselToEdit] = useState<Vessel | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState<Vessel | null>(null);
  // New Vessel initial state
  const [newVessel, setNewVessel] = useState<{
    name: string;
    imo: string;
    flag: string;
    vesselType: string;
    grt: number;
    nrt: number;
    dwt: number;
    loa: number;
    builtYear: number;
    callSign: string;
    sscecIssued: string; // YYYY-MM-DD
    owner: string;
    piClub: string;
  }>({
    name: "",
    imo: "",
    flag: "",
    vesselType: "Container Ship",
    grt: 0,
    nrt: 0,
    dwt: 0,
    loa: 0,
    builtYear: new Date().getFullYear(),
    callSign: "",
    sscecIssued: "",
    owner: "",
    piClub: "",
  });

  const router = useRouter();

  // Helper functions:
  function toDateObj(val: string) {
    if (!val) return null;
    const [yyyy, mm, dd] = val.split("-");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  function fromDateObj(date: Date | null) {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatSSCECExpiry(expiry: string) {
    if (!expiry) return "";

    // If already in DD.MM.YYYY format
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(expiry)) return expiry;

    // If ISO string or contains T/time info
    const onlyDate = expiry.split("T")[0]; // "2026-03-02"
    if (/^\d{4}-\d{2}-\d{2}$/.test(onlyDate)) {
      const [yyyy, mm, dd] = onlyDate.split("-");
      return `${dd}.${mm}.${yyyy}`;
    }

    // If string like "02.03.2026" (already DD.MM.YYYY)
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(expiry)) return expiry;

    // If string like "03.2026" (missing day)
    if (/^\d{2}\.\d{4}$/.test(expiry)) return "??." + expiry;

    // If string like "2026-03-02T18:30:00.000Z"
    const date = new Date(expiry);
    if (!isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    }

    // Fallback: try to extract numbers
    const nums = expiry.match(/\d{4}|\d{2}/g);
    if (nums && nums.length >= 3) {
      const [yyyy, mm, dd] = nums.slice(-3);
      return `${dd}.${mm}.${yyyy}`;
    }

    return expiry; // fallback: show as is
  }

  function calcSSCECExpiry(issued: string): string {
    // For DISPLAY: returns DD.MM.YYYY
    if (!issued) return "";
    const [yyyy, mm, dd] = issued.split("-");
    const issuedDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    issuedDate.setMonth(issuedDate.getMonth() + 6);
    // Handle month overflow
    const expDD = String(issuedDate.getDate()).padStart(2, "0");
    const expMM = String(issuedDate.getMonth() + 1).padStart(2, "0");
    const expYYYY = issuedDate.getFullYear();
    return `${expDD}.${expMM}.${expYYYY}`;
  }

  function calcSSCECExpiryISO(issued: string): string {
    // For API: returns YYYY-MM-DD
    if (!issued) return "";
    const [yyyy, mm, dd] = issued.split("-");
    const issuedDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    issuedDate.setMonth(issuedDate.getMonth() + 6);
    const expYYYY = issuedDate.getFullYear();
    const expMM = String(issuedDate.getMonth() + 1).padStart(2, "0");
    const expDD = String(issuedDate.getDate()).padStart(2, "0");
    return `${expYYYY}-${expMM}-${expDD}`;
  }

  function getIssuedFromExpiry(expiry: string): string {
    if (!expiry) return "";
    const [dd, mm, yyyy] = expiry.split(".");
    if (!dd || !mm || !yyyy) return "";
    const expDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    expDate.setMonth(expDate.getMonth() - 6);
    const issuedYYYY = expDate.getFullYear();
    const issuedMM = String(expDate.getMonth() + 1).padStart(2, "0");
    const issuedDD = String(expDate.getDate()).padStart(2, "0");
    return `${issuedYYYY}-${issuedMM}-${issuedDD}`;
  }

  // API Utility Function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = localStorage.getItem("currentUser");

      if (!token || !currentUser) {
        throw new Error("Authentication required");
      }

      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        window.location.href = "/";
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(response.statusText || "Request failed");
        }
        if (response.status === 400 && errorData.message?.includes("IMO")) {
          throw new Error(errorData.message);
        }
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      return await response.json();
    } catch (error: any) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const fetchVessels = async (): Promise<Vessel[]> => {
    const response = await apiCall(`${API_BASE_URL}/vessel`);
    if (response && response.success && Array.isArray(response.data)) {
      return response.data.map((vessel: any) => {
        let sscecExpiry: string =
          vessel.SSCEC_expires || vessel.sscecExpiry || "";
        let sscecIssued: string =
          vessel.SSCEC_issued ||
          vessel.sscecIssued ||
          (sscecExpiry ? getIssuedFromExpiry(sscecExpiry) : "");
        // Ensure expiry is always DD.MM.YYYY for display
        if (sscecExpiry.includes("-")) {
          // If it's in YYYY-MM-DD, convert
          const [yyyy, mm, dd] = sscecExpiry.split("-");
          sscecExpiry = `${dd}.${mm}.${yyyy}`;
        }
        return {
          id: vessel.vessel_id || vessel.id,
          name: vessel.vessel_name || vessel.name,
          imo: vessel.imo_number || vessel.imo,
          flag: vessel.flag,
          vesselType: vessel.vessel_type || vessel.vesselType,
          grt: vessel.grt || 0,
          nrt: vessel.nrt || 0,
          dwt: vessel.dwt || 0,
          loa: vessel.loa || 0,
          builtYear: vessel.build_year || vessel.builtYear,
          callSign: vessel.call_sign || vessel.callSign,
          sscecExpiry,
          sscecIssued,
          sscecStatus: vessel.sscec_status || calculateSSCECStatus(sscecExpiry),
          owner: vessel.company || vessel.owner,
          manager: vessel.manager || vessel.company || vessel.owner,
          piClub: vessel.p_and_i_club || vessel.piClub,
          lastPortCall:
            vessel.lastPortCall || new Date().toISOString().split("T")[0],
          totalPortCalls: vessel.totalPortCalls || 0,
          createdAt: vessel.createdAt || new Date().toISOString(),
          lastUpdated:
            vessel.updatedAt || vessel.lastUpdated || new Date().toISOString(),
        };
      });
    }
    console.error("Unexpected API response format:", response);
    throw new Error("Invalid vessels data format received from server");
  };

  const createVessel = async (vesselData: any) => {
    return await apiCall(`${API_BASE_URL}/vessel`, {
      method: "POST",
      body: JSON.stringify(vesselData),
    });
  };

  const updateVessel = async (id: string, vesselData: any) => {
    return await apiCall(`${API_BASE_URL}/vessel/${id}`, {
      method: "PUT",
      body: JSON.stringify(vesselData),
    });
  };

  const deleteVessel = async (id: string) => {
    return await apiCall(`${API_BASE_URL}/vessel/${id}`, {
      method: "DELETE",
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    let user = null;
    try {
      if (userData) user = JSON.parse(userData);
    } catch (err) {}
    setCurrentUser(
      user && user.name && user.accessLevel
        ? { name: user.name, accessLevel: user.accessLevel }
        : { name: "Demo User", accessLevel: "A" }
    );

    const loadVessels = async () => {
      try {
        const data = await fetchVessels();
        setVessels(data);
        setFilteredVessels(data);
      } catch (error) {
        console.error("Failed to load vessels:", error);
        toast.error("Failed to load vessel data", {
          description:
            "Please check your internet connection or try again later.",
          action: {
            label: "Retry",
            onClick: loadVessels,
          },
        });
      }
    };

    loadVessels();
  }, [router]);

  // Helper function to calculate SSCEC status
  const calculateSSCECStatus = (
    expiryDate: string
  ): "Valid" | "Expiring" | "Expired" => {
    // Parse DD.MM.YYYY
    let [dd, mm, yyyy] = expiryDate.split(".");
    if (!dd || !mm || !yyyy) return "Expired";
    const expiry = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    const today = new Date();
    const daysUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry < 0
      ? "Expired"
      : daysUntilExpiry <= 30
      ? "Expiring"
      : "Valid";
  };

  const handleAddVessel = async () => {
    try {
      if (!newVessel.sscecIssued) {
        toast.error("Validation Error", {
          description: "Please enter the SSCEC Issued Date.",
        });
        return;
      }
      const imoExists = vessels.some((v) => v.imo === newVessel.imo);
      if (imoExists) {
        toast.error("Duplicate IMO", {
          description: "A vessel with this IMO number already exists.",
          icon: <AlertTriangle />,
        });
        return;
      }
      const expiryISO = calcSSCECExpiryISO(newVessel.sscecIssued); // <-- ISO for backend
      const expiryDisplay = calcSSCECExpiry(newVessel.sscecIssued); // <-- For display

      const vesselData = {
        vessel_name: newVessel.name,
        imo_number: newVessel.imo,
        SSCEC_issued: newVessel.sscecIssued,
        SSCEC_expires: expiryISO,
        company: newVessel.owner,
        vessel_type: newVessel.vesselType,
        flag: newVessel.flag,
        call_sign: newVessel.callSign,
        build_year: newVessel.builtYear,
        grt: newVessel.grt,
        dwt: newVessel.dwt,
        loa: newVessel.loa,
        nrt: newVessel.nrt,
        p_and_i_club: newVessel.piClub,
      };
      const response = await createVessel(vesselData);

      const vesselWithId: Vessel = {
        ...newVessel,
        id: response.vessel_id,
        sscecExpiry: expiryDisplay,
        sscecIssued: newVessel.sscecIssued,
        sscecStatus: calculateSSCECStatus(expiryDisplay),
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        lastPortCall: new Date().toISOString().split("T")[0],
        totalPortCalls: 0,
        manager: newVessel.owner,
      };
      setVessels((prevVessels) => [...prevVessels, vesselWithId]);
      setNewVessel({
        name: "",
        imo: "",
        flag: "",
        vesselType: "Container Ship",
        grt: 0,
        nrt: 0,
        dwt: 0,
        loa: 0,
        builtYear: new Date().getFullYear(),
        callSign: "",
        sscecIssued: "",
        owner: "",
        piClub: "",
      });
      setIsDialogOpen(false);
      toast.success("Vessel created successfully", {
        icon: <Ship />,
        description: "The Vessel creation has been successfully completed.",
      });
      setSearchTerm("");
      setTypeFilter("all");
      setStatusFilter("all");
    } catch (error: any) {
      if (
        error.message.includes("IMO") ||
        error.message.includes("duplicate")
      ) {
        toast.error("Duplicate IMO", {
          description: "A vessel with this IMO number already exists.",
          icon: <AlertTriangle />,
        });
      } else {
        toast.error("Error", {
          description: error.message || "Failed to add vessel",
          icon: <AlertTriangle />,
        });
      }
    }
  };

  useEffect(() => {
    let filtered = vessels;
    if (searchTerm) {
      filtered = filtered.filter(
        (vessel) =>
          vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vessel.imo.includes(searchTerm) ||
          vessel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vessel.flag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((vessel) =>
        vessel.vesselType.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (vessel) =>
          vessel.sscecStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (selectedTab !== "all") {
      switch (selectedTab) {
        case "Valid":
          filtered = filtered.filter(
            (vessel) => vessel.sscecStatus === "Valid"
          );
          break;
        case "Expiring":
          filtered = filtered.filter(
            (vessel) => vessel.sscecStatus === "Expiring"
          );
          break;
        case "Expired":
          filtered = filtered.filter(
            (vessel) => vessel.sscecStatus === "Expired"
          );
          break;
      }
    }
    setFilteredVessels(filtered);
  }, [searchTerm, typeFilter, statusFilter, selectedTab, vessels]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getSSCECStatusColor = (status: string) => {
    switch (status) {
      case "Valid":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "Expiring":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
    }
  };

  const getSSCECIcon = (status: string) => {
    switch (status) {
      case "Expired":
      case "Expiring":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  function handleViewVessel(vessel: Vessel): void {
    setSelectedVessel(vessel);
    setViewDialogOpen(true);
  }
  function handleEditClick(vessel: Vessel): void {
    setVesselToEdit({
      ...vessel,
      // For edit dialog, always provide sscecIssued for the input
      sscecIssued:
        vessel.sscecIssued || getIssuedFromExpiry(vessel.sscecExpiry),
    });
    setEditDialogOpen(true);
  }

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
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Vessel Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Vessel Details and SSCEC Status
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
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          {/* Add Vessel Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 w-full">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vessel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                  <DialogTitle className="text-xl font-semibold">
                    Add New Vessel
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Enter the vessel details below. Required fields are marked
                    with *
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-medium">
                          Vessel Name *
                        </Label>
                        <Input
                          id="name"
                          placeholder="e.g. Ever Given"
                          value={newVessel.name}
                          onChange={(e) =>
                            setNewVessel({ ...newVessel, name: e.target.value })
                          }
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="imo">IMO Number *</Label>
                        <Input
                          id="imo"
                          placeholder="7-digit IMO number"
                          value={newVessel.imo}
                          onChange={(e) =>
                            setNewVessel({ ...newVessel, imo: e.target.value })
                          }
                          required
                          pattern="\d{7}"
                          title="7-digit IMO number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vesselType">Vessel Type *</Label>
                        <Select
                          value={newVessel.vesselType}
                          onValueChange={(value) =>
                            setNewVessel({ ...newVessel, vesselType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vessel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Container Ship">
                              Container Ship
                            </SelectItem>
                            <SelectItem value="Bulk Carrier">
                              Bulk Carrier
                            </SelectItem>
                            <SelectItem value="Tanker">Tanker</SelectItem>
                            <SelectItem value="General Cargo">
                              General Cargo
                            </SelectItem>
                            <SelectItem value="RoRo">RoRo</SelectItem>
                            <SelectItem value="Cruise Ship">
                              Cruise Ship
                            </SelectItem>
                            <SelectItem value="Ferry">Ferry</SelectItem>
                            <SelectItem value="Offshore Vessel">
                              Offshore Vessel
                            </SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner">Company (Owner) *</Label>
                        <Input
                          id="owner"
                          placeholder="Owner company name"
                          value={newVessel.owner}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              owner: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="flag">Flag *</Label>
                        <Input
                          id="flag"
                          placeholder="Vessel flag state"
                          value={newVessel.flag}
                          onChange={(e) =>
                            setNewVessel({ ...newVessel, flag: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="callSign" className="font-medium">
                          Call Sign
                        </Label>
                        <Input
                          id="callSign"
                          placeholder="Vessel call sign"
                          value={newVessel.callSign}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              callSign: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="builtYear">Built Year *</Label>
                        <Input
                          id="builtYear"
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={newVessel.builtYear}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              builtYear: Number(e.target.value),
                            })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grt">GRT</Label>
                        <Input
                          id="grt"
                          type="number"
                          min="0"
                          placeholder="Gross tonnage"
                          value={newVessel.grt || ""}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              grt: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nrt">NRT</Label>
                        <Input
                          id="nrt"
                          type="number"
                          min="0"
                          placeholder="Net tonnage"
                          value={newVessel.nrt || ""}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              nrt: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="loa">LOA (m)</Label>
                        <Input
                          id="loa"
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="Length overall"
                          value={newVessel.loa || ""}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              loa: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dwt">DWT</Label>
                        <Input
                          id="dwt"
                          type="number"
                          min="0"
                          placeholder="Deadweight tonnage"
                          value={newVessel.dwt || ""}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              dwt: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      {/* SSCEC Issued */}
                      <div className="space-y-2">
                        <Label htmlFor="sscecIssued">SSCEC Issued Date *</Label>
                        <DatePicker
                          id="sscecIssued"
                          selected={toDateObj(newVessel.sscecIssued)}
                          dateFormat="dd.MM.yyyy"
                          onChange={(date) =>
                            setNewVessel({
                              ...newVessel,
                              sscecIssued: fromDateObj(date),
                            })
                          }
                          placeholderText="dd.mm.yyyy"
                          className="form-input w-full"
                          showPopperArrow={false}
                          wrapperClassName="w-full"
                        />
                        {newVessel.sscecIssued && (
                          <div className="text-xs text-muted-foreground mt-1">
                            SSCEC will expire on{" "}
                            <span className="font-semibold">
                              {calcSSCECExpiry(newVessel.sscecIssued)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="piClub">P&I Club</Label>
                        <Input
                          id="piClub"
                          placeholder="Protection & Indemnity club"
                          value={newVessel.piClub}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              piClub: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleAddVessel}
                    className="w-full sm:w-auto"
                  >
                    Save Vessel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* View Dialog & Edit Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedVessel && (
                <>
                  <DialogHeader>
                    <DialogTitle>{selectedVessel.name} Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>IMO Number</Label>
                          <Input value={selectedVessel.imo} readOnly />
                        </div>
                        <div>
                          <Label>Vessel Type</Label>
                          <Input value={selectedVessel.vesselType} readOnly />
                        </div>
                        <div>
                          <Label>Flag</Label>
                          <Input value={selectedVessel.flag} readOnly />
                        </div>
                        <div>
                          <Label>Call Sign</Label>
                          <Input value={selectedVessel.callSign} readOnly />
                        </div>
                        <div>
                          <Label>Built Year</Label>
                          <Input value={selectedVessel.builtYear} readOnly />
                        </div>
                        <div>
                          <Label>Owner</Label>
                          <Input value={selectedVessel.owner} readOnly />
                        </div>
                      </div>
                    </div>
                    {/* Technical Specifications Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>GRT</Label>
                          <Input
                            value={selectedVessel.grt.toLocaleString()}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>NRT</Label>
                          <Input
                            value={selectedVessel.nrt.toLocaleString()}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>DWT</Label>
                          <Input
                            value={selectedVessel.dwt.toLocaleString()}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>LOA (m)</Label>
                          <Input value={selectedVessel.loa} readOnly />
                        </div>
                      </div>
                    </div>
                    {/* Certification Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Certifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>SSCEC Status</Label>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getSSCECStatusColor(
                                selectedVessel.sscecStatus
                              )}
                            >
                              {selectedVessel.sscecStatus}
                            </Badge>
                            <Input
                              value={formatSSCECExpiry(
                                selectedVessel.sscecExpiry
                              )}
                              readOnly
                            />
                          </div>
                        </div>
                        <div>
                          <Label>P&I Club</Label>
                          <Input value={selectedVessel.piClub} readOnly />
                        </div>
                      </div>
                    </div>
                    {/* Activity Section */}
                    {/* <div className="space-y-4">
                      <h3 className="text-lg font-medium">Activity</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Last Port Call</Label>
                          <Input
                            value={new Date(
                              selectedVessel.lastPortCall
                            ).toLocaleDateString()}
                            readOnly
                          />
                        </div>
                        <div>
                          <Label>Total Port Calls</Label>
                          <Input
                            value={selectedVessel.totalPortCalls}
                            readOnly
                          />
                        </div>
                      </div>
                    </div> */}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setViewDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Vessel Dialog - Responsive grid */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {vesselToEdit && (
                <>
                  <DialogHeader>
                    <DialogTitle>Edit Vessel: {vesselToEdit.name}</DialogTitle>
                    <DialogDescription>
                      IMO: {vesselToEdit.imo} | Last updated:{" "}
                      {new Date(vesselToEdit.lastUpdated).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Vessel Name</Label>
                          <Input
                            value={vesselToEdit.name}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>IMO Number</Label>
                          <Input
                            value={vesselToEdit.imo}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                imo: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Vessel Type</Label>
                          <Select
                            value={vesselToEdit.vesselType}
                            onValueChange={(value) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                vesselType: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select vessel type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Container Ship">
                                Container Ship
                              </SelectItem>
                              <SelectItem value="Bulk Carrier">
                                Bulk Carrier
                              </SelectItem>
                              <SelectItem value="Tanker">Tanker</SelectItem>
                              <SelectItem value="General Cargo">
                                General Cargo
                              </SelectItem>
                              <SelectItem value="RoRo">RoRo</SelectItem>
                              <SelectItem value="Cruise Ship">
                                Cruise Ship
                              </SelectItem>
                              <SelectItem value="Ferry">Ferry</SelectItem>
                              <SelectItem value="Offshore Vessel">
                                Offshore Vessel
                              </SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Flag</Label>
                          <Input
                            value={vesselToEdit.flag}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                flag: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Call Sign</Label>
                          <Input
                            value={vesselToEdit.callSign}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                callSign: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Built Year</Label>
                          <Input
                            type="number"
                            value={vesselToEdit.builtYear}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                builtYear: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>Owner</Label>
                          <Input
                            value={vesselToEdit.owner}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                owner: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {/* Technical Specifications Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Technical Specifications
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>GRT</Label>
                          <Input
                            type="number"
                            value={vesselToEdit.grt}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                grt: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>NRT</Label>
                          <Input
                            type="number"
                            value={vesselToEdit.nrt}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                nrt: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>DWT</Label>
                          <Input
                            type="number"
                            value={vesselToEdit.dwt}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                dwt: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label>LOA (m)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={vesselToEdit.loa}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                loa: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    {/* Certification Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Certifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>SSCEC Issued Date *</Label>
                          <DatePicker
                            selected={toDateObj(
                              vesselToEdit.sscecIssued ??
                                getIssuedFromExpiry(vesselToEdit.sscecExpiry)
                            )}
                            dateFormat="dd.MM.yyyy"
                            onChange={(date) => {
                              const issued = fromDateObj(date);
                              const expiry = calcSSCECExpiry(issued);
                              setVesselToEdit({
                                ...vesselToEdit,
                                sscecIssued: issued,
                                sscecExpiry: expiry,
                                sscecStatus: calculateSSCECStatus(expiry),
                                lastUpdated: new Date().toISOString(),
                              });
                            }}
                            placeholderText="dd.mm.yyyy"
                            className="form-input w-full"
                            showPopperArrow={false}
                            wrapperClassName="w-full"
                          />
                          {vesselToEdit.sscecIssued && (
                            <div className="text-xs text-muted-foreground mt-1">
                              SSCEC will expire on{" "}
                              <span className="font-semibold">
                                {calcSSCECExpiry(vesselToEdit.sscecIssued)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <Label>P&I Club</Label>
                          <Input
                            value={vesselToEdit.piClub}
                            onChange={(e) =>
                              setVesselToEdit({
                                ...vesselToEdit,
                                piClub: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          if (vesselToEdit) {
                            const vesselData = {
                              vessel_name: vesselToEdit.name,
                              imo_number: vesselToEdit.imo,
                              SSCEC_issued: vesselToEdit.sscecIssued,
                              SSCEC_expires: vesselToEdit.sscecExpiry,
                              company: vesselToEdit.owner,
                              vessel_type: vesselToEdit.vesselType,
                              flag: vesselToEdit.flag,
                              call_sign: vesselToEdit.callSign,
                              build_year: vesselToEdit.builtYear,
                              grt: vesselToEdit.grt,
                              dwt: vesselToEdit.dwt,
                              loa: vesselToEdit.loa,
                              nrt: vesselToEdit.nrt,
                              p_and_i_club: vesselToEdit.piClub,
                            };
                            await updateVessel(vesselToEdit.id, vesselData);
                            setVessels(
                              vessels.map((v) =>
                                v.id === vesselToEdit.id
                                  ? {
                                      ...vesselToEdit,
                                      sscecExpiry: vesselToEdit.sscecExpiry,
                                      sscecIssued: vesselToEdit.sscecIssued,
                                      sscecStatus: calculateSSCECStatus(
                                        vesselToEdit.sscecExpiry
                                      ),
                                    }
                                  : v
                              )
                            );
                            setEditDialogOpen(false);
                            toast.success("Vessel updated successfully", {
                              icon: <Ship />,
                              description:
                                "The vessel details have been updated.",
                            });
                          }
                        } catch (error) {
                          console.error("Failed to update vessel:", error);
                        }
                      }}
                      className="w-full sm:w-auto"
                    >
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {vesselToDelete?.name} (IMO:{" "}
                  {vesselToDelete?.imo})? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-sm text-red-600 dark:text-red-400">
                Warning: All vessel data including port call history will be
                permanently removed.
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      if (vesselToDelete) {
                        await deleteVessel(vesselToDelete.id);
                        setVessels(
                          vessels.filter((v) => v.id !== vesselToDelete.id)
                        );
                        setFilteredVessels(
                          filteredVessels.filter(
                            (v) => v.id !== vesselToDelete.id
                          )
                        );
                        setDeleteDialogOpen(false);
                        toast.success("Vessel deleted successfully", {
                          icon: <Trash2 />,
                          description:
                            "The vessel has been removed from your database.",
                        });
                      }
                    } catch (error) {
                      console.error("Failed to delete vessel:", error);
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Vessel Database</CardTitle>
                <CardDescription>
                  Manage vessel information and track SSCEC expiry dates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by vessel name, IMO, owner, or flag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Vessel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="container">
                          Container Ship
                        </SelectItem>
                        <SelectItem value="bulk">Bulk Carrier</SelectItem>
                        <SelectItem value="tanker">Tanker</SelectItem>
                        <SelectItem value="general">General Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="SSCEC Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Valid">Valid</SelectItem>
                        <SelectItem value="Expiring">Expiring</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Vessels List */}
            <div className="space-y-4">
              {filteredVessels.map((vessel) => (
                <Card
                  key={vessel.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg flex-shrink-0">
                          <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {vessel.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            IMO: {vessel.imo}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline">{vessel.vesselType}</Badge>
                            <Badge
                              className={getSSCECStatusColor(
                                vessel.sscecStatus
                              )}
                            >
                              {getSSCECIcon(vessel.sscecStatus)}
                              <span className="ml-1">{vessel.sscecStatus}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVessel(vessel)}
                          className="flex-1 sm:flex-none min-w-[90px]"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          <span className="hidden xs:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(vessel)}
                          className="flex-1 sm:flex-none min-w-[90px]"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          <span className="hidden xs:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none min-w-[50px] text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setVesselToDelete(vessel);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Flag
                          </p>
                          <p className="font-medium">{vessel.flag}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Owner
                          </p>
                          <p className="font-medium text-sm">{vessel.owner}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Call Sign
                        </p>
                        <p className="font-medium">{vessel.callSign}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Built Year
                        </p>
                        <p className="font-medium">{vessel.builtYear}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          GRT
                        </p>
                        <p className="font-medium">
                          {vessel.grt.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          DWT
                        </p>
                        <p className="font-medium">
                          {vessel.dwt.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          LOA
                        </p>
                        <p className="font-medium">{vessel.loa}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Port Calls
                        </p>
                        <p className="font-medium">{vessel.totalPortCalls}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            SSCEC Expires:{" "}
                            {formatSSCECExpiry(vessel.sscecExpiry)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Ship className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Last Port Call:{" "}
                            {new Date(vessel.lastPortCall).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Updated:{" "}
                        {new Date(vessel.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredVessels.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Ship className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No vessels found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm ||
                      typeFilter !== "all" ||
                      statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No vessels registered yet"}
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Vessel
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
