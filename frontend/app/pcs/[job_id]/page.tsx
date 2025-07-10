"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Check, Loader2, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Anchor } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye } from "lucide-react"; // or wherever your icons are from

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api";

interface Service {
  id: string;
  job_id: string;
  service_id: string;
  service_name: string;
  vendor_id: string;
  vendor_name: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: number;
  vendor_id: string;
  name: string;
  vendorServices: { id: number; vendor_id: string; service_name: string }[];
}

interface ServiceRef {
  id: number;
  service_id: string;
  service_name: string;
}

export default function PortCallServicesPage() {
  const { job_id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  // Add dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [allServiceRefs, setAllServiceRefs] = useState<ServiceRef[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [adding, setAdding] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // For dropdown search
  const [serviceSearch, setServiceSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const res = await fetch(`${API_BASE_URL}/pcs/job/${job_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/");
          throw new Error("Session expired. Please login again.");
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          toast({
            title: "Error",
            description: "Services not found",
            variant: "destructive",
          });
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    fetchData();
  }, [job_id, router]);

  // Fetch vendors and service refs for add dialog
  useEffect(() => {
    if (!addDialogOpen) return;
    const fetchDropdownData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        // Vendors
        const vRes = await fetch(`${API_BASE_URL}/vendor`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const vJson = await vRes.json();
        if (vJson.success) setVendors(vJson.data);

        // Services
        const sRes = await fetch(`${API_BASE_URL}/service`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const sJson = await sRes.json();
        if (sJson.success) setAllServiceRefs(sJson.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load dropdown data",
          variant: "destructive",
        });
      }
    };
    fetchDropdownData();
  }, [addDialogOpen]);

  // === Service Add Dialog Logic ===

  // Find selected vendor and service objects
  const vendorObj = useMemo(
    () => vendors.find((v) => v.vendor_id === selectedVendor),
    [vendors, selectedVendor]
  );
  const serviceObj = useMemo(
    () => allServiceRefs.find((s) => s.service_id === selectedService),
    [allServiceRefs, selectedService]
  );

  // Generate new ID format:
  // id = <job_id>-<service_id>
  const newPortCallServiceId = useMemo(
    () => (job_id && selectedService ? `${job_id}-${selectedService}` : ""),
    [job_id, selectedService]
  );

  // On add submit
  const handleAddPortCallService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !selectedService || !vendorObj || !serviceObj) {
      toast({
        title: "Error",
        description: "Please select both vendor and service",
        variant: "destructive",
      });
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const now = new Date().toISOString();
      const body = {
        id: newPortCallServiceId,
        job_id,
        service_id: selectedService,
        service_name: serviceObj.service_name,
        vendor_id: vendorObj.vendor_id,
        vendor_name: vendorObj.name,
        status: true,
        createdAt: now,
        updatedAt: now,
      };
      const response = await fetch(`${API_BASE_URL}/pcs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.success) {
        // Use the returned data if it has createdAt/updatedAt, else fallback to our body
        setServices((prev) => [
          ...prev,
          data.data && data.data.createdAt ? data.data : body,
        ]);
        toast({
          title: "Added",
          description: "Service added successfully",
          variant: "default",
        });
        setAddDialogOpen(false);
        setSelectedVendor("");
        setSelectedService("");
        setServiceSearch("");
        setVendorSearch("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add service",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  // === Existing handlers for status and delete ===

  const handleStatusChange = async (serviceId: string) => {
    try {
      setUpdating((prev) => ({ ...prev, [serviceId]: true }));
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/pcs/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: false }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      const data = await response.json();
      if (data.success) {
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.id === serviceId ? { ...service, status: false } : service
          )
        );
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update service status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setUpdating((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  const openDeleteDialog = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    const serviceId = serviceToDelete.id;
    try {
      setDeleting((prev) => ({ ...prev, [serviceId]: true }));
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/pcs/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      const data = await response.json();
      if (data.success) {
        setServices((prevServices) =>
          prevServices.filter((service) => service.id !== serviceId)
        );
        toast({
          title: "Deleted",
          description: "Service deleted successfully.",
          variant: "default",
        });
        setDeleteDialogOpen(false);
        setServiceToDelete(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [serviceId]: false }));
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">No services found</h2>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const completedServices = services.filter((s) => s.status === false).length;
  const totalServices = services.length;

  // Filter/search vendors and services
  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const filteredServices = allServiceRefs.filter((s) =>
    s.service_name.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/port-calls">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Active Port Calls
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Port Call Services
                </h1>
                <p className="text-sm text-muted-foreground">
                  Greek Lanka PCMS
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Port Call Service
          </Button>
        </div>
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Port Call Services</CardTitle>
            <CardDescription>
              {completedServices} of {totalServices} services completed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow
                    key={service.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {service.service_name}
                    </TableCell>
                    <TableCell>{service.vendor_name}</TableCell>
                    <TableCell>
                      <Badge variant={service.status ? "default" : "secondary"}>
                        {service.status ? "Pending" : "Completed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View service"
                          title="View service"
                          className="bg-blue-100 hover:bg-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </Button>
                        {/* Delete Button */}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(service)}
                          disabled={deleting[service.id]}
                          title="Delete service"
                        >
                          {deleting[service.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {services.length} services
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* ADD PORT CALL SERVICE DIALOG */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Port Call Service</DialogTitle>
            <DialogDescription>
              Assign a new service to this Port Call Job.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPortCallService} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Readonly generated IDs */}
              <div>
                <Label>Job ID</Label>
                <Input value={job_id as string} readOnly />
              </div>
              <div>
                <Label>Service ID</Label>
                <Input value={selectedService} readOnly />
              </div>
              <div className="sm:col-span-2">
                <Label>New Port Call Service ID</Label>
                <Input value={newPortCallServiceId} readOnly />
              </div>
            </div>
            <div>
              <Label>Service</Label>

              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search service..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="mb-2"
                      autoFocus
                    />
                  </div>
                  {filteredServices.length === 0 ? (
                    <div className="px-2 py-2 text-muted-foreground text-sm">
                      No results
                    </div>
                  ) : (
                    filteredServices.map((s) => (
                      <SelectItem key={s.service_id} value={s.service_id}>
                        {s.service_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendor</Label>

              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search vendor..."
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                      className="mb-2"
                      autoFocus
                    />
                  </div>
                  {filteredVendors.length === 0 ? (
                    <div className="px-2 py-2 text-muted-foreground text-sm">
                      No results
                    </div>
                  ) : (
                    filteredVendors.map((v) => (
                      <SelectItem key={v.vendor_id} value={v.vendor_id}>
                        {v.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  adding ||
                  !selectedVendor ||
                  !selectedService ||
                  !newPortCallServiceId
                }
              >
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-destructive">
                {serviceToDelete?.service_name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting[serviceToDelete?.id ?? ""]}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteService}
              disabled={deleting[serviceToDelete?.id ?? ""]}
            >
              {deleting[serviceToDelete?.id ?? ""] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
