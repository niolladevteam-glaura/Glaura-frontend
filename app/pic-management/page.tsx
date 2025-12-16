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
import { Plus, Search, Edit, Trash2, ArrowLeft, Anchor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { House, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface BasePIC {
  id: number;
  pic_id: string;
  firstName: string;
  lastName: string;
  phone_number: string;
  email: string;
  remark?: string;
  created_by?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface VendorPIC extends BasePIC {
  type: "vendor";
  vendor_id: string;
  picType?: string;
}

interface CustomerPIC extends BasePIC {
  type: "customer";
  customer_id: string;
  birthday?: string;
  receiveUpdates?: boolean;
  department?: string;
  prefix?: string;
  phoneNumberType?: string;
  emailType?: string;
}

type PIC = VendorPIC | CustomerPIC;

export default function PICManagement() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    accessLevel: string;
  } | null>(null);

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

  const [pics, setPics] = useState<PIC[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPic, setCurrentPic] = useState<PIC | null>(null);
  const [picType, setPicType] = useState<"vendor" | "customer">("vendor");
  const [filterType, setFilterType] = useState<"all" | "vendor" | "customer">(
    "all"
  );

  const [newPic, setNewPic] = useState({
    type: "vendor" as "vendor" | "customer",
    vendor_id: "",
    customer_id: "",
    firstName: "",
    lastName: "",
    phone_number: "",
    email: "",
    remark: "",
    birthday: "",
    receiveUpdates: false,
    department: "",
    prefix: "",
    phoneNumberType: "",
    emailType: "",
    picType: "", // <-- Added property
  });

  useEffect(() => {
    const fetchPICs = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const [vendorResponse, customerResponse] = await Promise.all([
          fetch(`${API_URL}/vendorpic`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/customerpic`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!vendorResponse.ok || !customerResponse.ok) {
          throw new Error("Failed to fetch PIC data");
        }

        const vendorData = await vendorResponse.json();
        const customerData = await customerResponse.json();

        const vendorPICs = (vendorData.data || []).map((item: any) => ({
          id: item.id,
          pic_id: item.pic_id || "N/A",
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          phone_number: item.phone_number || "N/A",
          email: item.email || "N/A",
          remark: item.remark || "",
          vendor_id: item.vendor_id || "N/A",
          picType: item.picType || "",
          type: "vendor",
        }));

        const customerPICs = (customerData.data || []).map((item: any) => ({
          id: item.id,
          pic_id: item.pic_id || "N/A",
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          phone_number: item.phone_number || "N/A",
          email: item.email || "N/A",
          remark: item.remark || "",
          customer_id: item.customer_id || "N/A",
          birthday: item.birthday || "",
          receiveUpdates: item.receiveUpdates || false,
          department: item.department || "",
          prefix: item.prefix || "",
          phoneNumberType: item.phoneNumberType || "",
          emailType: item.emailType || "",
          type: "customer",
        }));

        setPics([...vendorPICs, ...customerPICs]);
      } catch (error: any) {
        console.error("Fetch error:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load PIC data",
          variant: "destructive",
        });
        setPics([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPICs();
  }, [toast]);

  const handleCreatePIC = async () => {
    if (
      !newPic.firstName ||
      !newPic.lastName ||
      !newPic.phone_number ||
      !newPic.email
    ) {
      toast({
        title: "Validation Error",
        description:
          "First name, last name, phone number, and email are required",
        variant: "destructive",
      });
      return;
    }

    if (newPic.type === "vendor" && !newPic.vendor_id) {
      toast({
        title: "Validation Error",
        description: "Vendor ID is required",
        variant: "destructive",
      });
      return;
    }
    if (newPic.type === "customer" && !newPic.customer_id) {
      toast({
        title: "Validation Error",
        description: "Customer ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const endpoint =
        newPic.type === "vendor"
          ? `${API_URL}/vendorpic`
          : `${API_URL}/customerpic`;

      const payload =
        newPic.type === "vendor"
          ? {
              vendor_id: newPic.vendor_id,
              firstName: newPic.firstName,
              lastName: newPic.lastName,
              phone_number: newPic.phone_number,
              email: newPic.email,
              remark: newPic.remark,
              created_by: currentUser?.name || "Demo User",
              picType: newPic.picType,
            }
          : {
              customer_id: newPic.customer_id,
              firstName: newPic.firstName,
              lastName: newPic.lastName,
              phone_number: newPic.phone_number,
              email: newPic.email,
              remark: newPic.remark,
              birthday: newPic.birthday,
              receiveUpdates: newPic.receiveUpdates,
              department: newPic.department,
              prefix: newPic.prefix,
              phoneNumberType: newPic.phoneNumberType,
              emailType: newPic.emailType,
              created_by: currentUser?.name || "Demo User",
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create PIC");
      }

      const result = await response.json();
      const newPIC = { ...result.data, type: newPic.type };

      setPics((prevPICs) => [...prevPICs, newPIC]);
      setIsCreating(false);
      resetNewPICForm();

      toast({
        title: "PIC Created",
        description: `${newPic.firstName} ${newPic.lastName} has been added successfully`,
      });
    } catch (error: any) {
      console.error("Create PIC error:", error);
      toast({
        title: "API Error",
        description: error.message || "Failed to create PIC",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPIC = async () => {
    if (!currentPic) return;
    if (
      !currentPic.firstName ||
      !currentPic.lastName ||
      !currentPic.phone_number ||
      !currentPic.email
    ) {
      toast({
        title: "Validation Error",
        description:
          "First name, last name, phone number, and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const endpoint =
        currentPic.type === "vendor"
          ? `${API_URL}/vendorpic/${currentPic.pic_id}`
          : `${API_URL}/customerpic/${currentPic.pic_id}`;

      const payload =
        currentPic.type === "vendor"
          ? {
              firstName: currentPic.firstName,
              lastName: currentPic.lastName,
              phone_number: currentPic.phone_number,
              email: currentPic.email,
              remark: currentPic.remark,
              vendor_id: (currentPic as VendorPIC).vendor_id,
              picType: (currentPic as VendorPIC).picType,
            }
          : {
              firstName: currentPic.firstName,
              lastName: currentPic.lastName,
              phone_number: currentPic.phone_number,
              email: currentPic.email,
              remark: currentPic.remark,
              customer_id: (currentPic as CustomerPIC).customer_id,
              birthday: (currentPic as CustomerPIC).birthday,
              receiveUpdates: (currentPic as CustomerPIC).receiveUpdates,
              department: (currentPic as CustomerPIC).department,
              prefix: (currentPic as CustomerPIC).prefix,
              phoneNumberType: (currentPic as CustomerPIC).phoneNumberType,
              emailType: (currentPic as CustomerPIC).emailType,
            };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update PIC");
      }

      const fetchUpdatedPIC = async () => {
        const endpoint =
          currentPic.type === "vendor"
            ? `${API_URL}/vendorpic/${currentPic.pic_id}`
            : `${API_URL}/customerpic/${currentPic.pic_id}`;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        return { ...data.data, type: currentPic.type };
      };

      const updatedPIC = await fetchUpdatedPIC();

      setPics((prevPICs) =>
        prevPICs.map((p) => (p.pic_id === currentPic.pic_id ? updatedPIC : p))
      );

      setIsEditing(false);
      setCurrentPic(null);
      toast({
        title: "PIC Updated",
        description: `${currentPic.firstName} ${currentPic.lastName} updated successfully`,
      });
    } catch (error: any) {
      console.error("PIC update failed:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update PIC",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePIC = async (
    picId: string,
    picType: "vendor" | "customer"
  ) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const endpoint =
        picType === "vendor"
          ? `${API_URL}/vendorpic/${picId}`
          : `${API_URL}/customerpic/${picId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete PIC");
      }

      setPics((prevPICs) => prevPICs.filter((p) => p.pic_id !== picId));

      toast({
        title: "PIC Deleted",
        description: "PIC has been removed successfully",
      });
    } catch (error: any) {
      console.error("Delete PIC error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete PIC",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewPICForm = () => {
    setNewPic({
      type: "vendor",
      vendor_id: "",
      customer_id: "",
      firstName: "",
      lastName: "",
      phone_number: "",
      email: "",
      remark: "",
      birthday: "",
      receiveUpdates: false,
      department: "",
      prefix: "",
      phoneNumberType: "",
      emailType: "",
      picType: "",
    });
  };

  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPICs = pics.filter((pic) => {
    if (filterType !== "all" && pic.type !== filterType) return false;
    const query = searchQuery.toLowerCase();
    return (
      (pic.firstName ?? "").toLowerCase().includes(query) ||
      (pic.lastName ?? "").toLowerCase().includes(query) ||
      (pic.email ?? "").toLowerCase().includes(query) ||
      (pic.phone_number ?? "").toLowerCase().includes(query) ||
      (pic.pic_id ?? "").toLowerCase().includes(query) ||
      (pic.type === "vendor"
        ? ((pic as VendorPIC).vendor_id ?? "").toLowerCase().includes(query)
        : ((pic as CustomerPIC).customer_id ?? "")
            .toLowerCase()
            .includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
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
                  PIC Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Vendor and Customer Points of Contact
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
              <span className="truncate">{currentUser?.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser?.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">PIC Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage Vendor and Customer Points of Contact
            </p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search PICs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(value: "all" | "vendor" | "customer") =>
                setFilterType(value)
              }
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">All Points of Contact</CardTitle>
            <CardDescription>
              {filteredPICs.length} PICs found (
              {filterType !== "customer" &&
                `${pics.filter((p) => p.type === "vendor").length} vendor${
                  filterType === "all" ? ", " : ""
                }`}
              {filterType !== "vendor" &&
                `${pics.filter((p) => p.type === "customer").length} customer`}
              )
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-[100px]">PIC ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>
                    {picType === "vendor" ? "Vendor ID" : "Customer ID"}
                  </TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        Loading PICs...
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredPICs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-4 mb-4">
                          <Search className="h-8 w-8 text-gray-500" />
                        </div>
                        <p className="text-lg font-medium">No PICs found</p>
                        <p className="text-muted-foreground mt-2">
                          Try adjusting your search or create a new PIC
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPICs.map((pic) => (
                    <TableRow
                      key={pic.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {pic.pic_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pic.type === "vendor" ? "default" : "secondary"
                          }
                        >
                          {pic.type === "vendor" ? "Vendor" : "Customer"}
                        </Badge>
                      </TableCell>
                      <TableCell>{pic.firstName}</TableCell>
                      <TableCell>{pic.lastName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{pic.phone_number}</span>
                          <span className="text-muted-foreground text-sm">
                            {pic.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pic?.type === "vendor"
                          ? (pic as VendorPIC)?.vendor_id || "N/A"
                          : (pic as CustomerPIC)?.customer_id || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {pic.remark}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog
                            open={isEditing && currentPic?.id === pic.id}
                            onOpenChange={(open) => {
                              if (open) {
                                setCurrentPic(pic);
                                setIsEditing(true);
                              } else {
                                setIsEditing(false);
                                setCurrentPic(null);
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
                                <DialogTitle>Edit PIC</DialogTitle>
                                <DialogDescription>
                                  Update PIC details
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="picId" className="text-right">
                                    PIC ID
                                  </Label>
                                  <Input
                                    id="picId"
                                    value={currentPic?.pic_id || ""}
                                    className="col-span-3"
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="picType"
                                    className="text-right"
                                  >
                                    PIC Type
                                  </Label>
                                  <Input
                                    id="picType"
                                    value={
                                      currentPic?.type === "vendor"
                                        ? "Vendor"
                                        : "Customer"
                                    }
                                    className="col-span-3"
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="entityId"
                                    className="text-right"
                                  >
                                    {currentPic?.type === "vendor"
                                      ? "Vendor ID"
                                      : "Customer ID"}
                                  </Label>
                                  <Input
                                    id="entityId"
                                    className="col-span-3"
                                    value={
                                      currentPic?.type === "vendor"
                                        ? (currentPic as VendorPIC)
                                            ?.vendor_id || ""
                                        : (currentPic as CustomerPIC)
                                            ?.customer_id || ""
                                    }
                                    disabled
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="firstName"
                                    className="text-right"
                                  >
                                    First Name
                                  </Label>
                                  <Input
                                    id="firstName"
                                    placeholder="John"
                                    className="col-span-3"
                                    value={currentPic?.firstName || ""}
                                    onChange={(e) =>
                                      currentPic &&
                                      setCurrentPic({
                                        ...currentPic,
                                        firstName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="lastName"
                                    className="text-right"
                                  >
                                    Last Name
                                  </Label>
                                  <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    className="col-span-3"
                                    value={currentPic?.lastName || ""}
                                    onChange={(e) =>
                                      currentPic &&
                                      setCurrentPic({
                                        ...currentPic,
                                        lastName: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="phone" className="text-right">
                                    Phone Number
                                  </Label>
                                  <Input
                                    id="phone"
                                    placeholder="0771234567"
                                    className="col-span-3"
                                    value={currentPic?.phone_number || ""}
                                    onChange={(e) =>
                                      currentPic &&
                                      setCurrentPic({
                                        ...currentPic,
                                        phone_number: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="email" className="text-right">
                                    Email
                                  </Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className="col-span-3"
                                    value={currentPic?.email || ""}
                                    onChange={(e) =>
                                      currentPic &&
                                      setCurrentPic({
                                        ...currentPic,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                {currentPic?.type === "customer" && (
                                  <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="birthday"
                                        className="text-right"
                                      >
                                        Birthday
                                      </Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className={cn(
                                              "col-span-3 justify-start text-left font-normal",
                                              !(currentPic as CustomerPIC)
                                                .birthday &&
                                                "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {(currentPic as CustomerPIC)
                                              .birthday ? (
                                              formatDate(
                                                (currentPic as CustomerPIC)
                                                  .birthday || ""
                                              )
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                          <Calendar
                                            mode="single"
                                            selected={
                                              (currentPic as CustomerPIC)
                                                .birthday
                                                ? new Date(
                                                    (currentPic as CustomerPIC)
                                                      .birthday || ""
                                                  )
                                                : undefined
                                            }
                                            onSelect={(date) =>
                                              setCurrentPic({
                                                ...currentPic,
                                                birthday: date
                                                  ? format(date, "yyyy-MM-dd")
                                                  : "",
                                              } as CustomerPIC)
                                            }
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="department"
                                        className="text-right"
                                      >
                                        Department
                                      </Label>
                                      <Select
                                        value={
                                          (currentPic as CustomerPIC)
                                            .department || ""
                                        }
                                        onValueChange={(value) =>
                                          setCurrentPic({
                                            ...currentPic,
                                            department: value,
                                          } as CustomerPIC)
                                        }
                                      >
                                        <SelectTrigger className="col-span-3">
                                          <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Procurement">
                                            Procurement
                                          </SelectItem>
                                          <SelectItem value="Finance">
                                            Finance
                                          </SelectItem>
                                          <SelectItem value="Operations">
                                            Operations
                                          </SelectItem>
                                          <SelectItem value="Logistics">
                                            Logistics
                                          </SelectItem>
                                          <SelectItem value="Management">
                                            Management
                                          </SelectItem>
                                          <SelectItem value="Other">
                                            Other
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="receiveUpdates"
                                        className="text-right"
                                      >
                                        Receive Updates
                                      </Label>
                                      <div className="col-span-3 flex items-center space-x-2">
                                        <Checkbox
                                          id="receiveUpdates"
                                          checked={
                                            (currentPic as CustomerPIC)
                                              .receiveUpdates
                                          }
                                          onCheckedChange={(checked) =>
                                            setCurrentPic({
                                              ...currentPic,
                                              receiveUpdates:
                                                checked as boolean,
                                            } as CustomerPIC)
                                          }
                                        />
                                        <Label
                                          htmlFor="receiveUpdates"
                                          className="font-normal"
                                        >
                                          Subscribe to email updates
                                        </Label>
                                      </div>
                                    </div>
                                  </>
                                )}
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="remark"
                                    className="text-right"
                                  >
                                    Remark
                                  </Label>
                                  <Input
                                    id="remark"
                                    placeholder="Additional notes"
                                    className="col-span-3"
                                    value={currentPic?.remark || ""}
                                    onChange={(e) =>
                                      currentPic &&
                                      setCurrentPic({
                                        ...currentPic,
                                        remark: e.target.value,
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
                                  onClick={handleEditPIC}
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
                                  permanently delete the "{pic.firstName}{" "}
                                  {pic.lastName}" point of contact.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeletePIC(pic.pic_id ?? "", pic.type)
                                  }
                                  disabled={isLoading}
                                >
                                  {isLoading ? "Deleting..." : "Delete PIC"}
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
              Showing {filteredPICs.length} of {pics.length} PICs
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
