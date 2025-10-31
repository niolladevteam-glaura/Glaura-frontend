"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Plus, Search, Edit, Trash2, ArrowLeft, Anchor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/TimePicker";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Inquiry {
  id: number;
  vessel_name: string;
  client_name: string;
  port_of_call: string;
  eta_date: string; // "yyyy-MM-dd"
  eta_time: string; // "HH:mm"
  services: string;
  additional_info: string;
  reminder: string;
  latest_status: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to format DD.MM.YYYY HH:mm from date + time strings
function formatDateTime(dateString: string, timeString: string) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T${timeString || "00:00"}:00Z`);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function InquiryManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInquiry, setCurrentInquiry] = useState<Inquiry | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    accessLevel: string;
  } | null>(null);
  const [newInquiry, setNewInquiry] = useState({
    vessel_name: "",
    client_name: "",
    port_of_call: "",
    eta_date: "",
    eta_time: "",
    services: "",
    additional_info: "",
    reminder: "",
    latest_status: "",
  });

  // Dummy fetch
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setInquiries([
        {
          id: 1,
          vessel_name: "MV Demo",
          client_name: "ABC Shipping",
          port_of_call: "Colombo",
          eta_date: "2025-11-15",
          eta_time: "09:00",
          services: "Bunkering, Pilot",
          additional_info: "Urgent call",
          reminder: "Send docs 2 days before ETA",
          latest_status: "Pending",
          created_by: "Demo User",
          createdAt: "2025-10-30T10:00:00Z",
          updatedAt: "2025-10-30T10:00:00Z",
        },
      ]);
      setIsLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    let user = null;
    try {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        user = JSON.parse(userData);
      }
    } catch (err) {}
    setCurrentUser(
      user && user.name && user.accessLevel
        ? { name: user.name, accessLevel: user.accessLevel }
        : { name: "Demo User", accessLevel: "A" }
    );
  }, []);

  const filteredInquiries = inquiries.filter(Boolean).filter((inq) => {
    return (
      (inq.vessel_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (inq.client_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (inq.port_of_call || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (inq.services || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateInquiry = async () => {
    if (!newInquiry.vessel_name || !newInquiry.client_name) {
      toast({
        title: "Validation Error",
        description: "Vessel name and client name are required.",
        variant: "destructive",
      });
      return;
    }
    if (!newInquiry.eta_date || !newInquiry.eta_time) {
      toast({
        title: "Validation Error",
        description: "ETA date and time are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      const created_by = currentUser?.name || "Demo User";
      const id = Math.floor(Math.random() * 10000) + 2;
      setTimeout(() => {
        setInquiries((prev) =>
          [
            ...prev,
            {
              ...newInquiry,
              id,
              created_by,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Inquiry,
          ].filter(Boolean)
        );
        setIsCreating(false);
        setNewInquiry({
          vessel_name: "",
          client_name: "",
          port_of_call: "",
          eta_date: "",
          eta_time: "",
          services: "",
          additional_info: "",
          reminder: "",
          latest_status: "",
        });
        toast({
          title: "Inquiry Added",
          description: "Inquiry has been added successfully.",
        });
        setIsLoading(false);
      }, 700);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add inquiry",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleEditInquiry = async () => {
    if (!currentInquiry?.vessel_name || !currentInquiry?.client_name) {
      toast({
        title: "Validation Error",
        description: "Vessel name and client name are required.",
        variant: "destructive",
      });
      return;
    }
    if (!currentInquiry?.eta_date || !currentInquiry?.eta_time) {
      toast({
        title: "Validation Error",
        description: "ETA date and time are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsLoading(true);
      setTimeout(() => {
        setInquiries((prev) =>
          prev
            .filter(Boolean)
            .map((inq) =>
              inq && currentInquiry && inq.id === currentInquiry.id
                ? { ...currentInquiry }
                : inq
            )
        );
        setIsEditing(false);
        setCurrentInquiry(null);
        toast({
          title: "Inquiry Updated",
          description: "Inquiry updated successfully.",
        });
        setIsLoading(false);
      }, 700);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update inquiry",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleDeleteInquiry = async (id: number) => {
    try {
      setIsLoading(true);
      setTimeout(() => {
        setInquiries((prev) => prev.filter((inq) => inq && inq.id !== id));
        toast({
          title: "Inquiry Deleted",
          description: "Inquiry deleted successfully.",
        });
        setIsLoading(false);
      }, 700);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete inquiry",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
                  Vessel Inquiry Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Create, view, and manage vessel inquiries
                </p>
              </div>
            </div>
          </div>
          {/* Right Section */}
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
        {/* Page Title and Search/Add */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Inquiry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Inquiry</DialogTitle>
                  <DialogDescription>
                    Enter vessel inquiry details below
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {[
                    { id: "vessel_name", label: "Vessel Name", required: true },
                    { id: "client_name", label: "Client Name", required: true },
                    { id: "port_of_call", label: "Port of Call" },
                    { id: "services", label: "Services" },
                    { id: "additional_info", label: "Additional Info" },
                    { id: "reminder", label: "Reminder" },
                    { id: "latest_status", label: "Latest Status" },
                  ].map((field) => (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                      key={field.id}
                    >
                      <Label htmlFor={field.id} className="text-right">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Input
                        id={field.id}
                        className="sm:col-span-3"
                        placeholder={field.label}
                        value={(newInquiry as any)[field.id] ?? ""}
                        onChange={(e) =>
                          setNewInquiry((prev) => ({
                            ...prev,
                            [field.id]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="eta_date" className="text-right">
                      ETA Date<span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                      id="eta_date"
                      value={newInquiry.eta_date}
                      onChange={(val) =>
                        setNewInquiry((prev) => ({
                          ...prev,
                          eta_date: val,
                        }))
                      }
                      required
                      placeholder="DD.MM.YYYY"
                      className="sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="eta_time" className="text-right">
                      ETA Time<span className="text-red-500">*</span>
                    </Label>
                    <TimePicker
                      id="eta_time"
                      value={newInquiry.eta_time}
                      onChange={(val) =>
                        setNewInquiry((prev) => ({
                          ...prev,
                          eta_time: val,
                        }))
                      }
                      className="sm:col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateInquiry}
                    disabled={isLoading}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Creating..." : "Create Inquiry"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Inquiries Table */}
        <Card className="border rounded-xl overflow-x-auto">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">All Inquiries</CardTitle>
            <CardDescription>
              {filteredInquiries.length} inquiries found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <Table className="min-w-[900px]">
                <TableHeader className="bg-gray-50 dark:bg-gray-800">
                  <TableRow>
                    <TableHead>Vessel Name</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Port of Call</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Additional Info</TableHead>
                    <TableHead>Reminder</TableHead>
                    <TableHead>Latest Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                        <p className="mt-2 text-muted-foreground">
                          Loading inquiries...
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : filteredInquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-4 mb-4">
                            <Search className="h-8 w-8 text-gray-500" />
                          </div>
                          <p className="text-lg font-medium">
                            No inquiries found
                          </p>
                          <p className="text-muted-foreground mt-2">
                            Try adjusting your search or create a new inquiry
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInquiries.map((inq) =>
                      inq ? (
                        <TableRow
                          key={inq.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {inq.vessel_name}
                          </TableCell>
                          <TableCell>{inq.client_name}</TableCell>
                          <TableCell>{inq.port_of_call}</TableCell>
                          <TableCell>
                            {formatDateTime(inq.eta_date, inq.eta_time)}
                          </TableCell>
                          <TableCell>{inq.services}</TableCell>
                          <TableCell>{inq.additional_info}</TableCell>
                          <TableCell>{inq.reminder}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {inq.latest_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {/* Edit Dialog */}
                              <Dialog
                                open={
                                  isEditing && currentInquiry?.id === inq.id
                                }
                                onOpenChange={(open) => {
                                  if (open) {
                                    setCurrentInquiry(inq);
                                    setIsEditing(true);
                                  } else {
                                    setIsEditing(false);
                                    setCurrentInquiry(null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Inquiry</DialogTitle>
                                    <DialogDescription>
                                      Update vessel inquiry details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    {[
                                      {
                                        id: "vessel_name",
                                        label: "Vessel Name",
                                        required: true,
                                      },
                                      {
                                        id: "client_name",
                                        label: "Client Name",
                                        required: true,
                                      },
                                      {
                                        id: "port_of_call",
                                        label: "Port of Call",
                                      },
                                      { id: "services", label: "Services" },
                                      {
                                        id: "additional_info",
                                        label: "Additional Info",
                                      },
                                      { id: "reminder", label: "Reminder" },
                                      {
                                        id: "latest_status",
                                        label: "Latest Status",
                                      },
                                    ].map((field) => (
                                      <div
                                        className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                                        key={field.id}
                                      >
                                        <Label
                                          htmlFor={field.id}
                                          className="text-right"
                                        >
                                          {field.label}
                                          {field.required && (
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          )}
                                        </Label>
                                        <Input
                                          id={field.id}
                                          className="sm:col-span-3"
                                          placeholder={field.label}
                                          value={
                                            currentInquiry
                                              ? (currentInquiry as any)[
                                                  field.id
                                                ]
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setCurrentInquiry((prev: any) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    [field.id]: e.target.value,
                                                  }
                                                : null
                                            )
                                          }
                                        />
                                      </div>
                                    ))}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="eta_date"
                                        className="text-right"
                                      >
                                        ETA Date
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <DatePicker
                                        id="eta_date"
                                        value={currentInquiry?.eta_date || ""}
                                        onChange={(val) =>
                                          setCurrentInquiry((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  eta_date: val,
                                                }
                                              : null
                                          )
                                        }
                                        placeholder="DD.MM.YYYY"
                                        className="sm:col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="eta_time"
                                        className="text-right"
                                      >
                                        ETA Time
                                        <span className="text-red-500">*</span>
                                      </Label>
                                      <TimePicker
                                        id="eta_time"
                                        value={currentInquiry?.eta_time || ""}
                                        onChange={(val) =>
                                          setCurrentInquiry((prev) =>
                                            prev
                                              ? {
                                                  ...prev,
                                                  eta_time: val,
                                                }
                                              : null
                                          )
                                        }
                                        className="sm:col-span-3"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setIsEditing(false)}
                                      disabled={isLoading}
                                      className="w-full sm:w-auto"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleEditInquiry}
                                      disabled={isLoading}
                                      className="w-full sm:w-auto"
                                    >
                                      {isLoading ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              {/* Delete Dialog */}
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
                                      permanently delete the inquiry for vessel
                                      "{inq.vessel_name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteInquiry(inq.id)
                                      }
                                      disabled={isLoading}
                                      className="w-full sm:w-auto"
                                    >
                                      {isLoading
                                        ? "Deleting..."
                                        : "Delete Inquiry"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {filteredInquiries.length} of {inquiries.length} inquiries
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
