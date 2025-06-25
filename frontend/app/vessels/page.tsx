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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Ship,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  Anchor,
  AlertTriangle,
  Calendar,
  Flag,
  Building,
  Trash2,
} from "lucide-react";
import Link from "next/link";

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
  sscecExpiry: string;
  sscecStatus: "Valid" | "Expiring" | "Expired";
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
  const [newVessel, setNewVessel] = useState<
    Omit<
      Vessel,
      | "id"
      | "createdAt"
      | "lastUpdated"
      | "sscecStatus"
      | "lastPortCall"
      | "totalPortCalls"
      | "manager"
    >
  >({
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
    sscecExpiry: new Date().toISOString().split("T")[0],
    owner: "",
    piClub: "",
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Mock vessel data
    const mockVessels: Vessel[] = [
      {
        id: "1",
        name: "MSC Oscar",
        imo: "9876543",
        flag: "Panama",
        vesselType: "Container Ship",
        grt: 195000,
        nrt: 58500,
        dwt: 199400,
        loa: 395,
        builtYear: 2015,
        callSign: "3EJK2",
        sscecExpiry: "2024-03-15",
        sscecStatus: "Expiring",
        owner: "Mediterranean Shipping Company",
        manager: "MSC Ship Management",
        piClub: "Britannia P&I Club",
        lastPortCall: "2024-01-15",
        totalPortCalls: 45,
        createdAt: "2023-01-15T10:00:00Z",
        lastUpdated: "2024-01-15T14:30:00Z",
      },
      {
        id: "2",
        name: "Maersk Gibraltar",
        imo: "9654321",
        flag: "Denmark",
        vesselType: "Container Ship",
        grt: 165000,
        nrt: 49500,
        dwt: 180000,
        loa: 380,
        builtYear: 2018,
        callSign: "OZJM2",
        sscecExpiry: "2024-08-20",
        sscecStatus: "Valid",
        owner: "Maersk Line",
        manager: "Maersk Ship Management",
        piClub: "Gard P&I Club",
        lastPortCall: "2024-01-16",
        totalPortCalls: 32,
        createdAt: "2023-02-20T09:00:00Z",
        lastUpdated: "2024-01-16T11:15:00Z",
      },
      {
        id: "3",
        name: "COSCO Shipping",
        imo: "9543210",
        flag: "China",
        vesselType: "Container Ship",
        grt: 140000,
        nrt: 42000,
        dwt: 155000,
        loa: 350,
        builtYear: 2020,
        callSign: "BQXM8",
        sscecExpiry: "2023-12-10",
        sscecStatus: "Expired",
        owner: "COSCO Shipping Lines",
        manager: "COSCO Ship Management",
        piClub: "China P&I Club",
        lastPortCall: "2024-01-17",
        totalPortCalls: 28,
        createdAt: "2023-03-10T16:00:00Z",
        lastUpdated: "2024-01-17T18:00:00Z",
      },
      {
        id: "4",
        name: "Ever Given",
        imo: "9811000",
        flag: "Panama",
        vesselType: "Container Ship",
        grt: 220000,
        nrt: 66000,
        dwt: 224000,
        loa: 400,
        builtYear: 2018,
        callSign: "H3RC",
        sscecExpiry: "2024-06-30",
        sscecStatus: "Valid",
        owner: "Evergreen Marine",
        manager: "Evergreen Ship Management",
        piClub: "UK P&I Club",
        lastPortCall: "2024-01-18",
        totalPortCalls: 38,
        createdAt: "2023-04-05T12:00:00Z",
        lastUpdated: "2024-01-18T10:15:00Z",
      },
      {
        id: "5",
        name: "Hapag Express",
        imo: "9765432",
        flag: "Germany",
        vesselType: "Container Ship",
        grt: 175000,
        nrt: 52500,
        dwt: 190000,
        loa: 385,
        builtYear: 2019,
        callSign: "DKBM4",
        sscecExpiry: "2024-02-28",
        sscecStatus: "Expiring",
        owner: "Hapag-Lloyd",
        manager: "Hapag-Lloyd Ship Management",
        piClub: "Skuld P&I Club",
        lastPortCall: "2024-01-19",
        totalPortCalls: 25,
        createdAt: "2023-05-12T14:00:00Z",
        lastUpdated: "2024-01-19T16:30:00Z",
      },
    ];

    setVessels(mockVessels);
    setFilteredVessels(mockVessels);
  }, [router]);

  const handleAddVessel = () => {
    // Calculate days until SSCEC expiry
    const today = new Date();
    const expiryDate = new Date(newVessel.sscecExpiry);
    const daysUntilExpiry = Math.floor(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    const handleViewVessel = (vessel: Vessel) => {
      setSelectedVessel(vessel);
      setViewDialogOpen(true);
    };

    const handleEditClick = (vessel: Vessel) => {
      setVesselToEdit(vessel);
      setEditDialogOpen(true);
    };

    // Determine status based on days until expiry
    const sscecStatus =
      daysUntilExpiry < 0
        ? "Expired"
        : daysUntilExpiry <= 30
        ? "Expiring"
        : "Valid";

    const vesselWithId: Vessel = {
      ...newVessel,
      id: Math.random().toString(36).substring(2, 9), // Generate random ID
      sscecStatus, // Use calculated status
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      // Set default values for DB-managed fields
      lastPortCall: new Date().toISOString().split("T")[0], // Current date as default
      totalPortCalls: 0, // Start with 0 port calls
      manager: newVessel.owner, // Default manager same as owner
    };

    // Add new vessel to state
    setVessels([...vessels, vesselWithId]);
    setIsDialogOpen(false);

    // Reset form to initial state
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
      sscecExpiry: new Date().toISOString().split("T")[0],
      owner: "",
      piClub: "",
    });
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
        (vessel) => vessel.sscecStatus.toLowerCase() === statusFilter
      );
    }

    if (selectedTab !== "all") {
      switch (selectedTab) {
        case "valid":
          filtered = filtered.filter(
            (vessel) => vessel.sscecStatus === "Valid"
          );
          break;
        case "expiring":
          filtered = filtered.filter(
            (vessel) => vessel.sscecStatus === "Expiring"
          );
          break;
        case "expired":
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
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
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
    setVesselToEdit(vessel);
    setEditDialogOpen(true);
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Vessel Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage vessel details and SSCEC status
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">
                All Vessels ({vessels.length})
              </TabsTrigger>
              <TabsTrigger value="valid">
                Valid SSCEC (
                {vessels.filter((v) => v.sscecStatus === "Valid").length})
              </TabsTrigger>
              <TabsTrigger value="expiring">
                Expiring (
                {vessels.filter((v) => v.sscecStatus === "Expiring").length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired (
                {vessels.filter((v) => v.sscecStatus === "Expired").length})
              </TabsTrigger>
            </TabsList>

            {/*Add new vessel dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="ml-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="sscecExpiry">SSCEC Expiry Date</Label>
                        <Input
                          id="sscecExpiry"
                          type="date"
                          value={newVessel.sscecExpiry}
                          onChange={(e) =>
                            setNewVessel({
                              ...newVessel,
                              sscecExpiry: e.target.value,
                            })
                          }
                        />
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
                <DialogFooter className="border-t pt-4 gap-2 sm:gap-0">
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

          {/* Detailed View Dialog */}
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
                              value={new Date(
                                selectedVessel.sscecExpiry
                              ).toLocaleDateString()}
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
                    <div className="space-y-4">
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
                    </div>
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

          {/* Edit Vessel Dialog */}
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
                          <Label>SSCEC Expiry Date</Label>
                          <Input
                            type="date"
                            value={vesselToEdit.sscecExpiry.split("T")[0]}
                            onChange={(e) => {
                              const today = new Date();
                              const expiryDate = new Date(e.target.value);
                              const daysUntilExpiry = Math.floor(
                                (expiryDate.getTime() - today.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );

                              const sscecStatus =
                                daysUntilExpiry < 0
                                  ? "Expired"
                                  : daysUntilExpiry <= 30
                                  ? "Expiring"
                                  : "Valid";

                              setVesselToEdit({
                                ...vesselToEdit,
                                sscecExpiry: e.target.value,
                                sscecStatus,
                                lastUpdated: new Date().toISOString(),
                              });
                            }}
                          />
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

                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setEditDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        // Update the vessel in the state
                        setVessels(
                          vessels.map((v) =>
                            v.id === vesselToEdit.id ? vesselToEdit : v
                          )
                        );
                        setEditDialogOpen(false);
                      }}
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
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (vesselToDelete) {
                      setVessels(
                        vessels.filter((v) => v.id !== vesselToDelete.id)
                      );
                      setFilteredVessels(
                        filteredVessels.filter(
                          (v) => v.id !== vesselToDelete.id
                        )
                      );
                      setDeleteDialogOpen(false);
                    }
                  }}
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
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48">
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
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="SSCEC Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
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
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {vessel.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            IMO: {vessel.imo}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
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
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewVessel(vessel)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(vessel)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            setVesselToDelete(vessel);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            SSCEC Expires:{" "}
                            {new Date(vessel.sscecExpiry).toLocaleDateString()}
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
                    <Button>
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
