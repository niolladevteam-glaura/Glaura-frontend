"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext"; // Import auth context

interface Service {
  id: number;
  service_id: string;
  service_name: string;
  created_by: string;
  updatedAt: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ServicesManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user from context
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    service_name: "",
  });

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/service`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle non-JSON responses
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Invalid response: ${text.substring(0, 100)}...`);
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch services");
        }

        const data = await response.json();
        setServices(data.data);
      } catch (error: any) {
        console.error("Failed to fetch services:", error);
        toast({
          title: "API Error",
          description: error.message || "Failed to load services",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const filteredServices = services.filter((service) => {
    const serviceName = service.service_name || "";
    const serviceId = service.service_id || "";
    const createdBy = service.created_by || "";

    return (
      serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateService = async () => {
    if (!newService.service_name) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create services",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      // Log request details for debugging
      console.log("Creating service with:", {
        service_name: newService.service_name,
        created_by: user.id,
      });

      const response = await fetch(`${API_URL}/service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_name: newService.service_name,
          created_by: user.id, // Use the authenticated user's ID
        }),
      });

      // Log raw response for debugging
      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      try {
        // Try to parse JSON only if response is not empty
        const result = responseText ? JSON.parse(responseText) : null;

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Server error: ${response.status} ${response.statusText}`
          );
        }

        // Success case
        setServices((prevServices) => [...prevServices, result.data]);
        setIsCreating(false);
        setNewService({ service_name: "" });

        toast({
          title: "Service Created",
          description: `${newService.service_name} has been added successfully`,
        });
      } catch (jsonError) {
        throw new Error(
          `Invalid JSON response: ${responseText.substring(0, 100)}`
        );
      }
    } catch (error: any) {
      console.error("Create service error:", error);
      toast({
        title: "API Error",
        description: error.message || "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = async () => {
    if (!currentService?.service_name) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const endpoint = `${API_URL}/service/${currentService.service_id}`;
      const payload = { service_name: currentService.service_name };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message.includes("no changes made")) {
          toast({
            title: "No Changes",
            description: "Service information was not modified",
          });
          setIsEditing(false);
          setCurrentService(null);
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update service");
      }

      // Refetch the updated service
      const fetchUpdatedService = async () => {
        const response = await fetch(
          `${API_URL}/service/${currentService.service_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        return data.data;
      };

      const updatedService = await fetchUpdatedService();

      // Update state with fresh data
      setServices((prevServices) =>
        prevServices.map((s) =>
          s.service_id === currentService.service_id ? updatedService : s
        )
      );

      setIsEditing(false);
      setCurrentService(null);
      toast({
        title: "Service Updated",
        description: `${currentService.service_name} updated successfully`,
      });
    } catch (error: any) {
      console.error("Service update failed:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  ///////////////////////////////////////

  const handleDeleteService = async (serviceId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_URL}/service/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        } catch (jsonError) {
          const text = await response.text();
          throw new Error(`Delete failed: ${text.substring(0, 100)}`);
        }
      }

      // Remove by service_id instead of numeric id
      setServices((prevServices) =>
        prevServices.filter((s) => s.service_id !== serviceId)
      );

      toast({
        title: "Service Deleted",
        description: "Service has been removed successfully",
      });
    } catch (error: any) {
      console.error("Delete service error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Services Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create, view, and manage port services
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Service</DialogTitle>
                  <DialogDescription>
                    Add a new service to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="serviceName" className="text-right">
                      Service Name
                    </Label>
                    <Input
                      id="serviceName"
                      placeholder="Container Unloading"
                      className="col-span-3"
                      value={newService.service_name}
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          service_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateService} disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Service"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services Table */}
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">All Services</CardTitle>
            <CardDescription>
              {filteredServices.length} services found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-[120px]">Service ID</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Loading services...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-4 mb-4">
                          <Search className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-lg font-medium">No services found</p>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your search or create a new service
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow
                      key={service.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {service.service_id}
                      </TableCell>
                      <TableCell>{service.service_name}</TableCell>
                      <TableCell>{service.created_by}</TableCell>
                      <TableCell>{formatDateTime(service.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {formatDateTime(service.updatedAt)}
                          {service.createdAt !== service.updatedAt && (
                            <Badge variant="secondary" className="ml-2">
                              Edited
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={
                              isEditing && currentService?.id === service.id
                            }
                            onOpenChange={(open) => {
                              if (open) {
                                setCurrentService(service);
                                setIsEditing(true);
                              } else {
                                setIsEditing(false);
                                setCurrentService(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Edit Service</DialogTitle>
                                <DialogDescription>
                                  Update service details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="serviceId"
                                    className="text-right"
                                  >
                                    Service ID
                                  </Label>
                                  <Input
                                    id="serviceId"
                                    value={currentService?.service_id || ""}
                                    className="col-span-3"
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="serviceName"
                                    className="text-right"
                                  >
                                    Service Name
                                  </Label>
                                  <Input
                                    id="serviceName"
                                    placeholder="Container Unloading"
                                    className="col-span-3"
                                    value={currentService?.service_name || ""}
                                    onChange={(e) =>
                                      currentService &&
                                      setCurrentService({
                                        ...currentService,
                                        service_name: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setIsEditing(false)}
                                  disabled={isLoading}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleEditService}
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the "{service.service_name}
                                  " service.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteService(service.service_id)
                                  }
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Deleting..." : "Delete Service"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {filteredServices.length} of {services.length} services
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
