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
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "@/components/ui/use-toast";

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
  id: string;
  job_id: string;
  service_id: string;
  header_name: string;
  status: boolean | string;
  tasks: { status: boolean | string }[];
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
    fetch(`http://localhost:3080/api/pcs/job/${job_id}`, {
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
    fetch("http://localhost:3080/api/service", {
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
    fetch("http://localhost:3080/api/vendor", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setVendors(data.data || []));
  }, []);

  // Fetch headers stats for all services
  useEffect(() => {
    async function fetchStats() {
      const token = getTokenOrRedirect();
      if (!token || pcsList.length === 0) return;

      const stats: Record<string, { total: number; completed: number }> = {};
      await Promise.all(
        pcsList.map(async (pcs) => {
          // get all headers for this service
          const res = await fetch(
            `http://localhost:3080/api/servicetask/headers?job_id=${pcs.job_id}&service_id=${pcs.service_id}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          const headers: ServiceTaskHeader[] = Array.isArray(data.data)
            ? data.data
            : [];
          const total = headers.length;
          const completed = headers.filter(
            (h) =>
              h.tasks &&
              h.tasks.length > 0 &&
              h.tasks.every(
                (task: any) => task.status === true || task.status === "true"
              )
          ).length;
          stats[pcs.id] = { total, completed };

          // Update PCS status if all headers completed
          if (total > 0 && completed === total && !pcs.status) {
            // Optionally, update status in backend here (only if you want auto status update)
            await fetch(`http://localhost:3080/api/pcs/${pcs.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: true }),
            });
            // Update status in local state
            setPCSList((oldList) =>
              oldList.map((item) =>
                item.id === pcs.id ? { ...item, status: true } : item
              )
            );
          }
        })
      );
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
      const response = await fetch("http://localhost:3080/api/pcs", {
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
      const refetchResponse = await fetch(
        `http://localhost:3080/api/pcs/job/${job_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
        `http://localhost:3080/api/pcs/${serviceToDelete.id}`,
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
                  <TableHead>Status</TableHead>
                  <TableHead>Headers</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pcsList.map((pcs) => {
                  const stats = headersStats[pcs.id] || {
                    total: 0,
                    completed: 0,
                  };
                  return (
                    <TableRow
                      key={pcs.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {pcs.service_name}
                      </TableCell>
                      <TableCell>{pcs.vendor_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={pcs.status ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {pcs.status ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {pcs.status ? "Completed" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-sm">
                          {stats.completed}/{stats.total}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          headers completed
                        </span>
                      </TableCell>
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
    </div>
  );
}
