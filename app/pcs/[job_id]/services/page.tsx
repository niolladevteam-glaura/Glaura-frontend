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
  Check,
  X,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

// Crew and Flight details interfaces
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
  departureDate: string; // DD.MM.YYYY
  departureTime: string; // HH:mm
  arrivalDate: string; // DD.MM.YYYY
  arrivalTime: string; // HH:mm
  from: string;
  to: string;
}

export default function PortCallServicesPage() {
  const params = useParams();
  const router = useRouter();
  const job_id = params.job_id as string;
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [pcsList, setPCSList] = useState<PCS[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [searchService, setSearchService] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<PCS | null>(null);

  // Crew Change Dialog state
  const [crewDialogOpen, setCrewDialogOpen] = useState(false);
  const [crewDialogPCS, setCrewDialogPCS] = useState<PCS | null>(null);
  // Crew Change Form state
  const [crewName, setCrewName] = useState("");
  const [airline, setAirline] = useState("");
  const [onBoardDate, setOnBoardDate] = useState("");
  const [crewList, setCrewList] = useState<CrewMember[]>([]);
  const [flights, setFlights] = useState<FlightDetail[]>([]);
  // Add row states
  const [newCrew, setNewCrew] = useState<CrewMember>({
    name: "",
    nationality: "",
    rank: "",
    passportNo: "",
    eTicketNo: "",
  });
  const [newFlight, setNewFlight] = useState<FlightDetail>({
    flightNumber: "",
    flightName: "",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    from: "",
    to: "",
  });

  // Header stats for each PCS (service)
  const [headersStats, setHeadersStats] = useState<
    Record<string, { total: number; completed: number }>
  >({});

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

  // Fetch all port call services for this job
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
      .then((data) => {
        setPCSList(data.data || []);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to fetch services",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [job_id, openDialog]);

  // Fetch all services
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

  // Fetch all vendors
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

  // Fetch headers stats for all services (using correct endpoint and logic)
  useEffect(() => {
    async function fetchStats() {
      const token = getTokenOrRedirect();
      if (!token || pcsList.length === 0) return;

      const stats: Record<string, { total: number; completed: number }> = {};

      for (const pcs of pcsList) {
        // Use the correct endpoint and service_id!
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

        // Update PCS status if all headers completed
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
    // eslint-disable-next-line
  }, [pcsList]);

  const filteredServices = services.filter((s) =>
    s.service_name.toLowerCase().includes(searchService.toLowerCase())
  );
  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchVendor.toLowerCase())
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

    const selectedService = services.find(
      (s) => s.service_id === selectedServiceId
    );
    const selectedVendor = vendors.find(
      (v) => v.vendor_id === selectedVendorId
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

      if (!response.ok) {
        throw new Error(responseData?.message || "Failed to add service");
      }

      toast({
        title: "Success",
        description: "Service added successfully",
      });

      setOpenDialog(false);
      setSelectedServiceId("");
      setSelectedVendorId("");
      setSearchService("");
      setSearchVendor("");

      // Refetch services
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

  const openDeleteDialog = (service: PCS) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

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

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      setPCSList((list) => list.filter((svc) => svc.id !== serviceToDelete.id));
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [serviceToDelete.id]: false }));
    }
  };

  // Crew Change Dialog logic
  const openCrewChangeDialog = (pcs: PCS) => {
    setCrewDialogPCS(pcs);
    setCrewDialogOpen(true);
    // Optionally fetch existing Crew Change data here
  };

  const closeCrewChangeDialog = () => {
    setCrewDialogOpen(false);
    setCrewDialogPCS(null);
    setCrewName("");
    setAirline("");
    setOnBoardDate("");
    setCrewList([]);
    setFlights([]);
    setNewCrew({
      name: "",
      nationality: "",
      rank: "",
      passportNo: "",
      eTicketNo: "",
    });
    setNewFlight({
      flightNumber: "",
      flightName: "",
      departureDate: "",
      departureTime: "",
      arrivalDate: "",
      arrivalTime: "",
      from: "",
      to: "",
    });
  };

  // Add Crew/Flight rows
  const addCrewRow = () => {
    if (
      newCrew.name &&
      newCrew.nationality &&
      newCrew.rank &&
      newCrew.passportNo &&
      newCrew.eTicketNo
    ) {
      setCrewList((list) => [...list, newCrew]);
      setNewCrew({
        name: "",
        nationality: "",
        rank: "",
        passportNo: "",
        eTicketNo: "",
      });
    }
  };
  const removeCrewRow = (idx: number) =>
    setCrewList((list) => list.filter((_, i) => i !== idx));

  const addFlightRow = () => {
    if (
      newFlight.flightNumber &&
      newFlight.flightName &&
      newFlight.departureDate &&
      newFlight.departureTime &&
      newFlight.arrivalDate &&
      newFlight.arrivalTime &&
      newFlight.from &&
      newFlight.to
    ) {
      setFlights((list) => [...list, newFlight]);
      setNewFlight({
        flightNumber: "",
        flightName: "",
        departureDate: "",
        departureTime: "",
        arrivalDate: "",
        arrivalTime: "",
        from: "",
        to: "",
      });
    }
  };
  const removeFlightRow = (idx: number) =>
    setFlights((list) => list.filter((_, i) => i !== idx));

  // Format date/time helpers
  const dateInputToDDMMYYYY = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`;
  };
  const ddmmyyyyToDateInput = (ddmm: string) => {
    const [day, month, year] = ddmm.split(".");
    return `${year}-${month}-${day}`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const completedServices = pcsList.filter((pcs) => pcs.status).length;
  const totalServices = pcsList.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Back Button */}
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

            {/* Page Title & Icon */}
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

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser.accessLevel}
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
                  const stats = headersStats[pcs.id] || {
                    total: 0,
                    completed: 0,
                  };
                  const isCrewChanges =
                    pcs.service_name.trim().toLowerCase() ===
                    "crew changes (on/off)";
                  return (
                    <TableRow
                      key={pcs.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {pcs.service_name}
                      </TableCell>
                      <TableCell>{pcs.vendor_name}</TableCell>
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
                          {/* Crew Changes Pencil Icon */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={
                              isCrewChanges
                                ? () => openCrewChangeDialog(pcs)
                                : undefined
                            }
                            disabled={!isCrewChanges}
                            className={
                              isCrewChanges
                                ? "bg-green-100 hover:bg-green-200"
                                : "bg-gray-200 cursor-not-allowed"
                            }
                            title={
                              isCrewChanges
                                ? "Edit Crew Changes"
                                : "Edit only available for Crew Changes (On/Off)"
                            }
                          >
                            <Pencil
                              className={
                                isCrewChanges
                                  ? "h-4 w-4 text-green-700"
                                  : "h-4 w-4 text-gray-400"
                              }
                            />
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
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {pcsList.length} services
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add Service Dialog */}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setServiceToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              {serviceToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-destructive">
                    {serviceToDelete.service_name}
                  </span>
                  ? This action cannot be undone.
                </>
              ) : (
                <span className="text-destructive">No service selected</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={deleting[serviceToDelete?.id || ""]}
            >
              {deleting[serviceToDelete?.id || ""] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crew Changes Dialog */}
      <Dialog open={crewDialogOpen} onOpenChange={closeCrewChangeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Crew Changes Details</DialogTitle>
            <DialogDescription>
              Fill crew change details below. Dates: DD.MM.YYYY. Times: 24hr
              format.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: handle save to API
              closeCrewChangeDialog();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Crew Name</Label>
                <Input
                  value={crewName}
                  onChange={(e) => setCrewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Airline</Label>
                <Input
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>On Board Date</Label>
                <Input
                  type="date"
                  value={onBoardDate ? ddmmyyyyToDateInput(onBoardDate) : ""}
                  onChange={(e) =>
                    setOnBoardDate(dateInputToDDMMYYYY(e.target.value))
                  }
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Format: DD.MM.YYYY
                </div>
              </div>
            </div>
            <div>
              <Label>Crew List</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Passport No.</TableHead>
                    <TableHead>eTicket No.</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crewList.map((crew, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{crew.name}</TableCell>
                      <TableCell>{crew.nationality}</TableCell>
                      <TableCell>{crew.rank}</TableCell>
                      <TableCell>{crew.passportNo}</TableCell>
                      <TableCell>{crew.eTicketNo}</TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeCrewRow(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Input
                        value={newCrew.name}
                        onChange={(e) =>
                          setNewCrew((c) => ({ ...c, name: e.target.value }))
                        }
                        placeholder="Name"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newCrew.nationality}
                        onChange={(e) =>
                          setNewCrew((c) => ({
                            ...c,
                            nationality: e.target.value,
                          }))
                        }
                        placeholder="Nationality"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newCrew.rank}
                        onChange={(e) =>
                          setNewCrew((c) => ({ ...c, rank: e.target.value }))
                        }
                        placeholder="Rank"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newCrew.passportNo}
                        onChange={(e) =>
                          setNewCrew((c) => ({
                            ...c,
                            passportNo: e.target.value,
                          }))
                        }
                        placeholder="Passport No."
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newCrew.eTicketNo}
                        onChange={(e) =>
                          setNewCrew((c) => ({
                            ...c,
                            eTicketNo: e.target.value,
                          }))
                        }
                        placeholder="eTicket No."
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="secondary"
                        type="button"
                        onClick={addCrewRow}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <Label>Flights</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight Number</TableHead>
                    <TableHead>Flight Name</TableHead>
                    <TableHead>Departure Date</TableHead>
                    <TableHead>Departure Time</TableHead>
                    <TableHead>Arrival Date</TableHead>
                    <TableHead>Arrival Time</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flights.map((flight, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{flight.flightNumber}</TableCell>
                      <TableCell>{flight.flightName}</TableCell>
                      <TableCell>{flight.departureDate}</TableCell>
                      <TableCell>{flight.departureTime}</TableCell>
                      <TableCell>{flight.arrivalDate}</TableCell>
                      <TableCell>{flight.arrivalTime}</TableCell>
                      <TableCell>{flight.from}</TableCell>
                      <TableCell>{flight.to}</TableCell>
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFlightRow(idx)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      <Input
                        value={newFlight.flightNumber}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            flightNumber: e.target.value,
                          }))
                        }
                        placeholder="Flight Number"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newFlight.flightName}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            flightName: e.target.value,
                          }))
                        }
                        placeholder="Flight Name"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={
                          newFlight.departureDate
                            ? ddmmyyyyToDateInput(newFlight.departureDate)
                            : ""
                        }
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            departureDate: dateInputToDDMMYYYY(e.target.value),
                          }))
                        }
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        DD.MM.YYYY
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={newFlight.departureTime}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            departureTime: e.target.value,
                          }))
                        }
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={
                          newFlight.arrivalDate
                            ? ddmmyyyyToDateInput(newFlight.arrivalDate)
                            : ""
                        }
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            arrivalDate: dateInputToDDMMYYYY(e.target.value),
                          }))
                        }
                        required
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        DD.MM.YYYY
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="time"
                        value={newFlight.arrivalTime}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            arrivalTime: e.target.value,
                          }))
                        }
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newFlight.from}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            from: e.target.value,
                          }))
                        }
                        placeholder="From"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={newFlight.to}
                        onChange={(e) =>
                          setNewFlight((f) => ({
                            ...f,
                            to: e.target.value,
                          }))
                        }
                        placeholder="To"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="secondary"
                        type="button"
                        onClick={addFlightRow}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={closeCrewChangeDialog}
              >
                Cancel
              </Button>
              <Button type="submit" className="ml-2">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
