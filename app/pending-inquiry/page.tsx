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

// API base
const API_URL = "http://localhost:3080/api/vessel-inquiries";

interface Inquiry {
  inquiry_id: string;
  vessel_name: string;
  client_name: string;
  port_of_call: string;
  eta: string; // ISO string
  additional_info?: string;
  reminder_date?: string; // ISO string
  reminder_email?: string;
  latest_update?: string;
  services: { id?: number; service_name: string }[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

function formatDateTime(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getDate())}.${pad(
    date.getMonth() + 1
  )}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Helper: combine date and time into ISO string (UTC)
function combineDateTime(date: string, time: string): string {
  if (!date && !time) return "";
  if (!date) return "";
  // assume date = yyyy-MM-dd, time = HH:mm
  // Build date in UTC
  const [y, m, d] = date.split("-");
  const [hh = "00", mm = "00"] = (time || "00:00").split(":");
  // The backend expects UTC - so build date object in UTC
  const dt = new Date(
    Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), 0)
  );
  return dt.toISOString();
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

  // Form state for new/edit
  const [newInquiry, setNewInquiry] = useState({
    vessel_name: "",
    client_name: "",
    port_of_call: "",
    eta_date: "",
    eta_time: "",
    services: "",
    additional_info: "",
    reminder_date: "",
    reminder_time: "",
    reminder_email: "",
    latest_update: "",
  });

  // JWT token
  const [token, setToken] = useState<string>("");

  // Fetch token and user
  useEffect(() => {
    let user = null;
    let jwt = "";
    try {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        user = JSON.parse(userData);
      }
      jwt = localStorage.getItem("token") || "";
    } catch (err) {}
    setCurrentUser(
      user && user.name && user.accessLevel
        ? { name: user.name, accessLevel: user.accessLevel }
        : { name: "Demo User", accessLevel: "A" }
    );
    setToken(jwt);
  }, []);

  // Fetch all inquiries
  async function fetchInquiries() {
    setIsLoading(true);
    try {
      const resp = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (json.success) {
        setInquiries(json.data || []);
      } else {
        toast({
          title: "API Error",
          description: json.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "API Error",
        description: "Failed to fetch inquiries",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (token) fetchInquiries();
  }, [token]);

  // --- CREATE ---
  const handleCreateInquiry = async () => {
    // Validate
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
    setIsLoading(true);
    try {
      const payload = {
        vessel_name: newInquiry.vessel_name,
        client_name: newInquiry.client_name,
        port_of_call: newInquiry.port_of_call,
        eta: combineDateTime(newInquiry.eta_date, newInquiry.eta_time),
        additional_info: newInquiry.additional_info,
        reminder_date:
          newInquiry.reminder_date && newInquiry.reminder_time
            ? combineDateTime(
                newInquiry.reminder_date,
                newInquiry.reminder_time
              )
            : undefined,
        reminder_email: newInquiry.reminder_email,
        latest_update: newInquiry.latest_update,
        services: newInquiry.services
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json.success) {
        toast({ title: "Inquiry Added", description: json.message });
        setIsCreating(false);
        setNewInquiry({
          vessel_name: "",
          client_name: "",
          port_of_call: "",
          eta_date: "",
          eta_time: "",
          services: "",
          additional_info: "",
          reminder_date: "",
          reminder_time: "",
          reminder_email: "",
          latest_update: "",
        });
        fetchInquiries();
      } else {
        toast({
          title: "API Error",
          description: json.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "API Error",
        description: "Failed to add inquiry",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // --- EDIT ---
  const handleEditInquiry = async () => {
    if (!currentInquiry) return;
    if (!currentInquiry.vessel_name || !currentInquiry.client_name) {
      toast({
        title: "Validation Error",
        description: "Vessel name and client name are required.",
        variant: "destructive",
      });
      return;
    }
    if (!currentInquiry.eta || !editInquiryEtaDate || !editInquiryEtaTime) {
      toast({
        title: "Validation Error",
        description: "ETA date and time are required.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        vessel_name: currentInquiry.vessel_name,
        client_name: currentInquiry.client_name,
        port_of_call: currentInquiry.port_of_call,
        eta: combineDateTime(editInquiryEtaDate, editInquiryEtaTime),
        additional_info: currentInquiry.additional_info,
        reminder_date:
          editInquiryReminderDate && editInquiryReminderTime
            ? combineDateTime(editInquiryReminderDate, editInquiryReminderTime)
            : undefined,
        reminder_email: currentInquiry.reminder_email,
        latest_update: currentInquiry.latest_update,
        services: Array.isArray(currentInquiry.services)
          ? currentInquiry.services.map((s: any) =>
              typeof s === "string" ? s : s.service_name
            )
          : [],
      };
      const resp = await fetch(`${API_URL}/${currentInquiry.inquiry_id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();
      if (json.success) {
        toast({ title: "Inquiry Updated", description: json.message });
        setIsEditing(false);
        setCurrentInquiry(null);
        fetchInquiries();
      } else {
        toast({
          title: "API Error",
          description: json.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "API Error",
        description: "Failed to update inquiry",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // --- DELETE ---
  const handleDeleteInquiry = async (inquiry_id: string) => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_URL}/${inquiry_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await resp.json();
      if (json.success) {
        toast({ title: "Inquiry Deleted", description: json.message });
        fetchInquiries();
      } else {
        toast({
          title: "API Error",
          description: json.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "API Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  // --- Edit Dialog State for Date/Time fields ---
  // Extract initial values from ISO for edit form (when dialog opens)
  const [editInquiryEtaDate, setEditInquiryEtaDate] = useState("");
  const [editInquiryEtaTime, setEditInquiryEtaTime] = useState("");
  const [editInquiryReminderDate, setEditInquiryReminderDate] = useState("");
  const [editInquiryReminderTime, setEditInquiryReminderTime] = useState("");

  useEffect(() => {
    if (currentInquiry && isEditing) {
      // eta
      if (currentInquiry.eta) {
        const dt = new Date(currentInquiry.eta);
        setEditInquiryEtaDate(
          `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dt.getUTCDate().toString().padStart(2, "0")}`
        );
        setEditInquiryEtaTime(
          `${dt.getUTCHours().toString().padStart(2, "0")}:${dt
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setEditInquiryEtaDate("");
        setEditInquiryEtaTime("");
      }
      // reminder_date
      if (currentInquiry.reminder_date) {
        const dt = new Date(currentInquiry.reminder_date);
        setEditInquiryReminderDate(
          `${dt.getUTCFullYear()}-${(dt.getUTCMonth() + 1)
            .toString()
            .padStart(2, "0")}-${dt.getUTCDate().toString().padStart(2, "0")}`
        );
        setEditInquiryReminderTime(
          `${dt.getUTCHours().toString().padStart(2, "0")}:${dt
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}`
        );
      } else {
        setEditInquiryReminderDate("");
        setEditInquiryReminderTime("");
      }
    }
  }, [currentInquiry, isEditing]);

  // --- Filtered inquiries
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
      (Array.isArray(inq.services)
        ? inq.services
            .map((s: any) => (typeof s === "string" ? s : s.service_name))
            .join(", ")
            .toLowerCase()
        : ""
      ).includes(searchQuery.toLowerCase())
    );
  });

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
              {/* ------ MODAL SCROLL FIX HERE ------ */}
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Inquiry</DialogTitle>
                  <DialogDescription>
                    Enter vessel inquiry details below
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Vessel Name & Client Name */}
                  {[
                    { id: "vessel_name", label: "Vessel Name", required: true },
                    { id: "client_name", label: "Client Name", required: true },
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
                  {/* ETA fields (after Client Name) */}
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
                  {/* Reminder Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="reminder_date" className="text-right">
                      Reminder Date
                    </Label>
                    <DatePicker
                      id="reminder_date"
                      value={newInquiry.reminder_date}
                      onChange={(val) =>
                        setNewInquiry((prev) => ({
                          ...prev,
                          reminder_date: val,
                        }))
                      }
                      placeholder="DD.MM.YYYY"
                      className="sm:col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="reminder_time" className="text-right">
                      Reminder Time
                    </Label>
                    <TimePicker
                      id="reminder_time"
                      value={newInquiry.reminder_time}
                      onChange={(val) =>
                        setNewInquiry((prev) => ({
                          ...prev,
                          reminder_time: val,
                        }))
                      }
                      className="sm:col-span-3"
                    />
                  </div>
                  {/* rest of fields */}
                  {[
                    { id: "port_of_call", label: "Port of Call" },
                    { id: "additional_info", label: "Additional Info" },
                    { id: "latest_update", label: "Latest Status" },
                    { id: "reminder_email", label: "Reminder Email" },
                  ].map((field) => (
                    <div
                      className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4"
                      key={field.id}
                    >
                      <Label htmlFor={field.id} className="text-right">
                        {field.label}
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
                    <Label htmlFor="services" className="text-right">
                      Services (comma separated)
                    </Label>
                    <Input
                      id="services"
                      className="sm:col-span-3"
                      placeholder="Bunkering, Crew Change, Provisions"
                      value={newInquiry.services}
                      onChange={(e) =>
                        setNewInquiry((prev) => ({
                          ...prev,
                          services: e.target.value,
                        }))
                      }
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
                          key={inq.inquiry_id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">
                            {inq.vessel_name}
                          </TableCell>
                          <TableCell>{inq.client_name}</TableCell>
                          <TableCell>{inq.port_of_call}</TableCell>
                          <TableCell>{formatDateTime(inq.eta)}</TableCell>
                          <TableCell>
                            {Array.isArray(inq.services)
                              ? inq.services
                                  .map((s: any) =>
                                    typeof s === "string" ? s : s.service_name
                                  )
                                  .join(", ")
                              : ""}
                          </TableCell>
                          <TableCell>{inq.additional_info}</TableCell>
                          <TableCell>
                            {inq.reminder_date
                              ? formatDateTime(inq.reminder_date)
                              : ""}
                            {inq.reminder_email
                              ? ` (${inq.reminder_email})`
                              : ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {inq.latest_update}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog
                                open={
                                  isEditing &&
                                  currentInquiry?.inquiry_id === inq.inquiry_id
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
                                {/* ------ MODAL SCROLL FIX HERE ------ */}
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Edit Inquiry</DialogTitle>
                                    <DialogDescription>
                                      Update vessel inquiry details
                                    </DialogDescription>
                                  </DialogHeader>
                                  {currentInquiry ? (
                                    <div className="grid gap-4 py-4">
                                      {/* Vessel Name & Client Name */}
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
                                              (currentInquiry as any)[
                                                field.id
                                              ] ?? ""
                                            }
                                            onChange={(e) =>
                                              setCurrentInquiry((prev: any) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      [field.id]:
                                                        e.target.value,
                                                    }
                                                  : null
                                              )
                                            }
                                          />
                                        </div>
                                      ))}
                                      {/* ETA and Reminder fields after Client Name */}
                                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="eta_date"
                                          className="text-right"
                                        >
                                          ETA Date
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </Label>
                                        <DatePicker
                                          id="eta_date"
                                          value={editInquiryEtaDate}
                                          onChange={setEditInquiryEtaDate}
                                          required
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
                                          <span className="text-red-500">
                                            *
                                          </span>
                                        </Label>
                                        <TimePicker
                                          id="eta_time"
                                          value={editInquiryEtaTime}
                                          onChange={setEditInquiryEtaTime}
                                          className="sm:col-span-3"
                                        />
                                      </div>
                                      {/* Reminder Date & Time */}
                                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="reminder_date"
                                          className="text-right"
                                        >
                                          Reminder Date
                                        </Label>
                                        <DatePicker
                                          id="reminder_date"
                                          value={editInquiryReminderDate}
                                          onChange={setEditInquiryReminderDate}
                                          placeholder="DD.MM.YYYY"
                                          className="sm:col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="reminder_time"
                                          className="text-right"
                                        >
                                          Reminder Time
                                        </Label>
                                        <TimePicker
                                          id="reminder_time"
                                          value={editInquiryReminderTime}
                                          onChange={setEditInquiryReminderTime}
                                          className="sm:col-span-3"
                                        />
                                      </div>
                                      {/* rest of fields */}
                                      {[
                                        {
                                          id: "port_of_call",
                                          label: "Port of Call",
                                        },
                                        {
                                          id: "additional_info",
                                          label: "Additional Info",
                                        },
                                        {
                                          id: "latest_update",
                                          label: "Latest Status",
                                        },
                                        {
                                          id: "reminder_email",
                                          label: "Reminder Email",
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
                                          </Label>
                                          <Input
                                            id={field.id}
                                            className="sm:col-span-3"
                                            placeholder={field.label}
                                            value={
                                              (currentInquiry as any)[
                                                field.id
                                              ] ?? ""
                                            }
                                            onChange={(e) =>
                                              setCurrentInquiry((prev: any) =>
                                                prev
                                                  ? {
                                                      ...prev,
                                                      [field.id]:
                                                        e.target.value,
                                                    }
                                                  : null
                                              )
                                            }
                                          />
                                        </div>
                                      ))}
                                      <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                        <Label
                                          htmlFor="services"
                                          className="text-right"
                                        >
                                          Services (comma separated)
                                        </Label>
                                        <Input
                                          id="services"
                                          className="sm:col-span-3"
                                          placeholder="Bunkering, Crew Change, Provisions"
                                          value={
                                            Array.isArray(
                                              currentInquiry.services
                                            )
                                              ? currentInquiry.services
                                                  .map((s: any) =>
                                                    typeof s === "string"
                                                      ? s
                                                      : s.service_name
                                                  )
                                                  .join(", ")
                                              : ""
                                          }
                                          onChange={(e) =>
                                            setCurrentInquiry((prev: any) =>
                                              prev
                                                ? {
                                                    ...prev,
                                                    services: e.target.value
                                                      .split(",")
                                                      .map((s: string) =>
                                                        s.trim()
                                                      )
                                                      .filter(Boolean),
                                                  }
                                                : null
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  ) : null}
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
                                        handleDeleteInquiry(inq.inquiry_id)
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
