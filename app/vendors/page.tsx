"use client";

import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Building,
  Edit,
  Eye,
  Trash2,
  Anchor,
  AlertTriangle,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { DatePicker } from "@/components/ui/date-picker";
import ShadCountryPhoneInput from "@/components/ui/ShadCountryPhoneInput";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Separator } from "@/components/ui/separator";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENDPOINTS = {
  VENDORS: `${API_BASE_URL}/vendor`,
};

interface VendorPIC {
  id: string;
  type?: "Primary" | "Secondary";
  title?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  department: string;
  birthday: string;
  contactNumbers: string[];
  contactTypes?: string[];
  emails: string[];
  emailTypes?: string[];
  remark: string;
}

interface Vendor {
  id: string;
  vendor_id: string;
  name: string;
  address: string;
  phone_number: string;
  company_type: string;
  email: string;
  remark: string;
  vendorServices: {
    id: number;
    vendor_id: string;
    service_name: string;
    createdAt: string;
    updatedAt: string;
  }[];
  vendorStatus: {
    id: number;
    status_id: string;
    vendor_id: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  };
  vendorPics: VendorPIC[];
  status: {
    status: boolean;
  };
  kycStatus?: string;
  rating?: number;
  totalJobs?: number;
  completedJobs?: number;
}

function formatDateDMY(dateStr?: string) {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function getVendorPICArray(vendor: Vendor) {
  if (Array.isArray(vendor.vendorPics) && vendor.vendorPics.length > 0) {
    return vendor.vendorPics;
  }
  if ((vendor as any).vendorPic) {
    return [(vendor as any).vendorPic];
  }
  if ((vendor as any).pic) {
    return [(vendor as any).pic];
  }
  return [];
}

export default function VendorManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState({
    name: "",
    address: "",
    phoneCountryCode: "+94",
    phoneNumber: "",
    company_type: "",
    email: "",
    remark: "",
    services: [] as string[],
    status: { status: true },
    pics: [
      {
        id: `${Date.now()}`,
        type: "Primary",
        title: "Mr",
        firstName: "",
        lastName: "",
        name: "",
        department: "",
        birthday: "",
        contactNumbers: [""],
        contactTypes: ["Direct Line"],
        emails: [""],
        emailTypes: ["Personal"],
        remark: "",
      },
    ] as VendorPIC[],
  });

  const router = useRouter();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(response.statusText || "Request failed");
        }
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      try {
        return await response.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (error: any) {
      toast({
        title: "API Error",
        description: error.message || "Failed to complete request",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.VENDORS);
      if (!response.success) {
        throw new Error(response.message || "Failed to load vendors");
      }
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid vendors data format");
      }
      const formattedVendors = response.data.map((vendor: any) => {
        let vendorPics: VendorPIC[] = [];
        if (Array.isArray(vendor.vendorPics) && vendor.vendorPics.length > 0) {
          vendorPics = vendor.vendorPics;
        } else if (vendor.vendorPic) {
          vendorPics = [vendor.vendorPic];
        } else if (vendor.pic) {
          vendorPics = [vendor.pic];
        }
        return {
          ...vendor,
          kycStatus: vendor.vendorStatus?.status ? "Approved" : "Pending",
          rating: 0,
          totalJobs: 0,
          completedJobs: 0,
          vendorPics,
        };
      });
      setVendors(formattedVendors);
      setFilteredVendors(formattedVendors);
    } catch (error) {
      toast({
        title: "API Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load vendors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    loadVendors();
  }, [router]);

  useEffect(() => {
    const fetchServiceCategories = async () => {
      try {
        setLoadingServices(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please login again",
            variant: "destructive",
          });
          return;
        }
        const response = await fetch(`${API_BASE_URL}/service`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch services");
        }
        const data = await response.json();
        const services = data.data.map((service: any) => service.service_name);
        setServiceCategories(services);
      } catch (error: any) {
        toast({
          title: "API Error",
          description: error.message || "Failed to load service categories",
          variant: "destructive",
        });
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServiceCategories();
  }, []);

  useEffect(() => {
    let filtered = vendors;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchLower) ||
          vendor.company_type.toLowerCase().includes(searchLower) ||
          vendor.vendorServices.some((service) =>
            service.service_name.toLowerCase().includes(searchLower)
          ) ||
          vendor.vendorPics.some((pic) =>
            `${pic.title || ""} ${pic.firstName || ""} ${pic.lastName || ""}`
              .toLowerCase()
              .includes(searchLower)
          )
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((vendor) =>
        vendor.company_type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      const statusBoolean = statusFilter === "approved";
      filtered = filtered.filter(
        (vendor) => vendor.vendorStatus?.status === statusBoolean
      );
    }
    setFilteredVendors(filtered);
  }, [searchTerm, typeFilter, statusFilter, vendors]);

  const handleVendorFormChange = (field: string, value: any) => {
    setVendorForm((prev) => ({ ...prev, [field]: value }));
  };

  // ---- PIC Section Handlers ----
  const addNewPIC = () => {
    setVendorForm((prev) => ({
      ...prev,
      pics: [
        ...(prev.pics || []),
        {
          id: Date.now().toString(),
          type: "Secondary",
          title: "Mr",
          firstName: "",
          lastName: "",
          name: "",
          department: "",
          birthday: "",
          contactNumbers: [""],
          contactTypes: ["Direct Line"],
          emails: [""],
          emailTypes: ["Personal"],
          remark: "",
        },
      ],
    }));
  };
  const updatePIC = (index: number, field: keyof VendorPIC, value: any) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[index] = {
        ...updatedPics[index],
        [field]: value,
      };
      return { ...prev, pics: updatedPics };
    });
  };
  const removePIC = (index: number) => {
    setVendorForm((prev) => ({
      ...prev,
      pics: (prev.pics || []).filter((_, i) => i !== index),
    }));
  };
  const addPICContactNumber = (picIndex: number) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers = [
        ...updatedPics[picIndex].contactNumbers,
        "",
      ];
      updatedPics[picIndex].contactTypes = [
        ...(updatedPics[picIndex].contactTypes || []),
        "Direct Line",
      ];
      return { ...prev, pics: updatedPics };
    });
  };
  const updatePICContactNumber = (
    picIndex: number,
    contactIndex: number,
    value: string
  ) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers[contactIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };
  const updatePICContactType = (
    picIndex: number,
    contactIndex: number,
    value: string
  ) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      if (!updatedPics[picIndex].contactTypes) {
        updatedPics[picIndex].contactTypes = [];
      }
      updatedPics[picIndex].contactTypes[contactIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };
  const removePICContactNumber = (picIndex: number, contactIndex: number) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers = updatedPics[
        picIndex
      ].contactNumbers.filter((_, i) => i !== contactIndex);
      updatedPics[picIndex].contactTypes = updatedPics[picIndex].contactTypes
        ? updatedPics[picIndex].contactTypes!.filter(
            (_, i) => i !== contactIndex
          )
        : [];
      return { ...prev, pics: updatedPics };
    });
  };
  const addPICEmail = (picIndex: number) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails = [...updatedPics[picIndex].emails, ""];
      updatedPics[picIndex].emailTypes = [
        ...(updatedPics[picIndex].emailTypes || []),
        "Personal",
      ];
      return { ...prev, pics: updatedPics };
    });
  };
  const updatePICEmail = (
    picIndex: number,
    emailIndex: number,
    value: string
  ) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails[emailIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };
  const updatePICEmailType = (
    picIndex: number,
    emailIndex: number,
    value: string
  ) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      if (!updatedPics[picIndex].emailTypes) {
        updatedPics[picIndex].emailTypes = [];
      }
      updatedPics[picIndex].emailTypes[emailIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };
  const removePICEmail = (picIndex: number, emailIndex: number) => {
    setVendorForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails = updatedPics[picIndex].emails.filter(
        (_, i) => i !== emailIndex
      );
      updatedPics[picIndex].emailTypes = updatedPics[picIndex].emailTypes
        ? updatedPics[picIndex].emailTypes!.filter((_, i) => i !== emailIndex)
        : [];
      return { ...prev, pics: updatedPics };
    });
  };

  const saveVendor = async () => {
    if (!vendorForm.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }
    const atLeastOnePic =
      Array.isArray(vendorForm.pics) &&
      vendorForm.pics.some(
        (pic) => (pic.firstName?.trim() || "") && (pic.lastName?.trim() || "")
      );
    if (!atLeastOnePic) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one PIC with name",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      const backendData = {
        name: vendorForm.name.trim(),
        address: vendorForm.address.trim(),
        phone_number: `${vendorForm.phoneCountryCode || "+94"} ${
          vendorForm.phoneNumber || ""
        }`.trim(),
        company_type: vendorForm.company_type.trim(),
        email: vendorForm.email.trim(),
        remark: vendorForm.remark.trim(),
        services: vendorForm.services,
        status: { status: vendorForm.status.status },
        // Send only the first PIC as "pic" object, with API keys matching backend requirements
        pic:
          vendorForm.pics && vendorForm.pics.length > 0
            ? {
                firstName: vendorForm.pics[0].firstName || "",
                lastName: vendorForm.pics[0].lastName || "",
                phone_number: vendorForm.pics[0].contactNumbers?.[0] || "",
                picType: vendorForm.pics[0].type || "Primary",
                email: vendorForm.pics[0].emails?.[0] || "",
                remark: vendorForm.pics[0].remark?.trim() || "",
              }
            : undefined,
      };
      console.log("Backend payload:", backendData);
      const VENDOR_API = `${API_BASE_URL}/vendor`;
      let response;
      if (editingVendor) {
        response = await apiCall(`${VENDOR_API}/${editingVendor.vendor_id}`, {
          method: "PUT",
          body: JSON.stringify(backendData),
        });
      } else {
        response = await apiCall(VENDOR_API, {
          method: "POST",
          body: JSON.stringify(backendData),
        });
      }
      await loadVendors();
      setIsAddVendorOpen(false);
      setEditingVendor(null);
      setVendorForm({
        name: "",
        address: "",
        phoneCountryCode: "+94",
        phoneNumber: "",
        company_type: "",
        email: "",
        remark: "",
        services: [],
        status: { status: true },
        pics: [
          {
            id: `${Date.now()}`,
            type: "Primary",
            title: "Mr",
            firstName: "",
            lastName: "",
            name: "",
            department: "",
            birthday: "",
            contactNumbers: [""],
            contactTypes: ["Direct Line"],
            emails: [""],
            emailTypes: ["Personal"],
            remark: "",
          },
        ],
      });
      toast({
        title: "Success",
        description: editingVendor
          ? "Vendor updated successfully!"
          : "Vendor created successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const editVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);

    // Split vendor.phone_number into country code and number for the form
    let phoneCountryCode = "+94";
    let phoneNumber = "";
    if (vendor.phone_number) {
      const match = vendor.phone_number.match(/^(\+\d+)\s*(.*)$/);
      if (match) {
        phoneCountryCode = match[1];
        phoneNumber = match[2];
      } else {
        phoneNumber = vendor.phone_number;
      }
    }

    // Normalize PICs for the form!
    const picArray = getVendorPICArray(vendor);

    setVendorForm({
      name: vendor.name,
      address: vendor.address,
      phoneCountryCode,
      phoneNumber,
      company_type: vendor.company_type,
      email: vendor.email,
      remark: vendor.remark,
      services: vendor.vendorServices.map((service) => service.service_name),
      status: { status: vendor.vendorStatus?.status || false },
      pics:
        picArray.length > 0
          ? picArray.map((pic, i) => ({
              id: pic.id || pic.pic_id || `${i}_${Date.now()}`,
              type: pic.type || pic.picType || "Secondary",
              title: pic.title || "Mr",
              firstName: pic.firstName || "",
              lastName: pic.lastName || "",
              name: pic.name || "",
              department: pic.department || "",
              birthday: pic.birthday || "",
              contactNumbers:
                pic.contactNumbers && pic.contactNumbers.length > 0
                  ? pic.contactNumbers
                  : pic.phone_number
                  ? [pic.phone_number]
                  : [""],
              contactTypes:
                pic.contactTypes && pic.contactTypes.length > 0
                  ? pic.contactTypes
                  : ["Direct Line"],
              emails:
                pic.emails && pic.emails.length > 0
                  ? pic.emails
                  : pic.email
                  ? [pic.email]
                  : [""],
              emailTypes:
                pic.emailTypes && pic.emailTypes.length > 0
                  ? pic.emailTypes
                  : ["Personal"],
              remark: pic.remark || "",
            }))
          : [
              {
                id: `${Date.now()}`,
                type: "Primary",
                title: "Mr",
                firstName: "",
                lastName: "",
                name: "",
                department: "",
                birthday: "",
                contactNumbers: [""],
                contactTypes: ["Direct Line"],
                emails: [""],
                emailTypes: ["Personal"],
                remark: "",
              },
            ],
    });
    setIsAddVendorOpen(true);
  };
  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const deleteVendor = async (id: string, companyName: string) => {
    try {
      setLoading(true);
      await apiCall(`${API_ENDPOINTS.VENDORS}/${id}`, { method: "DELETE" });
      setVendors((prev) => prev.filter((vendor) => vendor.vendor_id !== id));
      setFilteredVendors((prev) =>
        prev.filter((vendor) => vendor.vendor_id !== id)
      );
      toast({
        title: "Success",
        description: `${companyName} has been deleted successfully`,
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to delete ${companyName}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

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
                  Vendor Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Service Providers
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
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Document Expiry Alerts */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Document Alerts</span>
                </CardTitle>
                <CardDescription>Expiring documents</CardDescription>
              </CardHeader>
              <CardContent>
                {expiryAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {expiryAlerts.slice(0, 5).map((alert, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">
                            {alert.documentName}
                          </p>
                          <Badge
                            variant={
                              alert.status === "Expired"
                                ? "destructive"
                                : alert.status === "Critical"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {alert.daysUntil <= 0
                              ? "Expired"
                              : `${alert.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.vendorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No expiring documents
                  </p>
                )}
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Vendors
                  </span>
                  <span className="font-medium">{vendors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Approved KYC
                  </span>
                  <span className="font-medium">
                    {vendors.filter((v) => v.kycStatus === "Approved").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Pending KYC
                  </span>
                  <span className="font-medium">
                    {vendors.filter((v) => v.kycStatus === "Pending").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Document Alerts
                  </span>
                  <span className="font-medium">{expiryAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Avg Rating
                  </span>
                  <span className="font-medium">
                    {vendors.length > 0
                      ? vendors.some((v) => v.rating !== undefined)
                        ? (
                            vendors.reduce(
                              (sum, v) => sum + (v.rating || 0),
                              0
                            ) /
                            vendors.filter((v) => v.rating !== undefined).length
                          ).toFixed(1)
                        : "N/A"
                      : "0"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Vendor Management</span>
                  <div className="flex gap-2 flex-wrap">
                    <Dialog
                      open={isAddVendorOpen}
                      onOpenChange={setIsAddVendorOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          className="professional-button-primary"
                          disabled={loading}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Vendor
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[98vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingVendor ? "Edit Vendor" : "Add New Vendor"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-medium">
                              Company Information
                            </h3>
                            {/* Company fields */}
                            <div>
                              <Label htmlFor="name" className="form-label">
                                Company Name *
                              </Label>
                              <Input
                                id="name"
                                value={vendorForm.name}
                                onChange={(e) =>
                                  setVendorForm((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Enter company name"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="companyType"
                                className="form-label"
                              >
                                Company Type
                              </Label>
                              <Input
                                id="companyType"
                                value={vendorForm.company_type}
                                onChange={(e) =>
                                  setVendorForm((prev) => ({
                                    ...prev,
                                    company_type: e.target.value,
                                  }))
                                }
                                placeholder="e.g., Launch Boat Operator"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="address" className="form-label">
                                Address
                              </Label>
                              <Textarea
                                id="address"
                                value={vendorForm.address}
                                onChange={(e) =>
                                  setVendorForm((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }))
                                }
                                placeholder="Enter company address"
                                className="form-input"
                                rows={3}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="phoneNumber"
                                className="form-label"
                              >
                                Phone Number
                              </Label>
                              <div className="flex gap-2">
                                <div className="w-36">
                                  {" "}
                                  {/* Makes the country code selector longer */}
                                  <ShadCountryPhoneInput
                                    country="lk"
                                    value={vendorForm.phoneCountryCode || "+94"}
                                    onChange={(_, data) => {
                                      const dial =
                                        "+" +
                                        (typeof data === "object" &&
                                        data &&
                                        "dialCode" in data
                                          ? (data as any).dialCode
                                          : "");
                                      setVendorForm((prev) => ({
                                        ...prev,
                                        phoneCountryCode: dial,
                                      }));
                                    }}
                                  />
                                </div>
                                <Input
                                  id="phoneNumber"
                                  value={vendorForm.phoneNumber}
                                  onChange={(e) =>
                                    setVendorForm((prev) => ({
                                      ...prev,
                                      phoneNumber: e.target.value,
                                    }))
                                  }
                                  placeholder="112223344"
                                  className="form-input flex-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="email" className="form-label">
                                Email
                              </Label>
                              <Input
                                id="email"
                                value={vendorForm.email}
                                onChange={(e) =>
                                  setVendorForm((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="email@company.com"
                                className="form-input"
                              />
                            </div>
                            {/* Service categories */}
                            <div>
                              <Label className="form-label">
                                Service Categories
                              </Label>
                              <br />
                              <Link
                                href="/services"
                                className="text-primary text-sm mt-1 inline-block hover:underline"
                              >
                                Go to Service Management to add services
                              </Link>
                              {loadingServices ? (
                                <div className="flex items-center space-x-2 py-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                  <span className="text-sm text-muted-foreground">
                                    Loading services...
                                  </span>
                                </div>
                              ) : serviceCategories.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                                  {serviceCategories.map((category) => (
                                    <div
                                      key={category}
                                      className="flex items-center space-x-2"
                                    >
                                      <input
                                        type="checkbox"
                                        id={`service-${category}`}
                                        checked={vendorForm.services.includes(
                                          category
                                        )}
                                        onChange={() =>
                                          handleVendorFormChange(
                                            "services",
                                            vendorForm.services.includes(
                                              category
                                            )
                                              ? vendorForm.services.filter(
                                                  (c) => c !== category
                                                )
                                              : [
                                                  ...vendorForm.services,
                                                  category,
                                                ]
                                          )
                                        }
                                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                                      />
                                      <Label
                                        htmlFor={`service-${category}`}
                                        className="text-sm cursor-pointer truncate"
                                        title={category}
                                      >
                                        {category}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                                  <p className="text-yellow-800 text-sm">
                                    No service categories found.
                                  </p>
                                </div>
                              )}
                            </div>
                            {/* KYC Status */}
                            <div>
                              <Label htmlFor="kycStatus" className="form-label">
                                KYC Status
                              </Label>
                              <Select
                                value={
                                  vendorForm.status.status
                                    ? "Approved"
                                    : "Pending"
                                }
                                onValueChange={(value) =>
                                  handleVendorFormChange("status", {
                                    status: value === "Approved",
                                  })
                                }
                              >
                                <SelectTrigger className="form-input">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Approved">
                                    Approved
                                  </SelectItem>
                                  <SelectItem value="Pending">
                                    Pending
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {/* PIC Section */}
                            {/* Primary Contacts (PICs) */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Primary Contacts (PICs)
                                  <span className="text-xs rounded-full bg-muted-foreground/10 text-muted-foreground px-2 py-0.5">
                                    {vendorForm.pics.length}
                                  </span>
                                </h3>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addNewPIC}
                                  className="gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add PIC
                                </Button>
                              </div>

                              {/* PIC list */}
                              <Accordion
                                type="single"
                                collapsible
                                className="space-y-3"
                              >
                                {vendorForm.pics.map((pic, picIdx) => {
                                  const displayName =
                                    [pic.title, pic.firstName, pic.lastName]
                                      .filter(Boolean)
                                      .join(" ") || "Untitled";

                                  return (
                                    <AccordionItem
                                      key={pic.id || picIdx}
                                      value={`pic-${pic.id || picIdx}`}
                                      className="rounded-xl border bg-muted/60"
                                    >
                                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                        <div className="flex w-full items-center justify-between gap-3">
                                          <div className="min-w-0 flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                              <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                  {(pic.firstName?.[0] || "?") +
                                                    (pic.lastName?.[0] || "")}
                                                </AvatarFallback>
                                              </Avatar>
                                              <div className="min-w-0">
                                                <div className="truncate font-medium">
                                                  {displayName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                  {pic.department ||
                                                    "No department"}
                                                </div>
                                              </div>
                                            </div>
                                            <Badge
                                              variant={
                                                pic.type === "Primary"
                                                  ? "default"
                                                  : "secondary"
                                              }
                                            >
                                              {pic.type || "Secondary"}
                                            </Badge>
                                          </div>

                                          <div className="flex items-center gap-1">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removePIC(picIdx);
                                              }}
                                              aria-label="Remove PIC"
                                            >
                                              <X className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </AccordionTrigger>

                                      <AccordionContent className="px-4 pb-4 pt-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                          {/* PIC Type */}
                                          <div>
                                            <Label className="mb-1 block">
                                              PIC Type
                                            </Label>
                                            <Select
                                              value={pic.type || "Secondary"}
                                              onValueChange={(val) =>
                                                updatePIC(
                                                  picIdx,
                                                  "type",
                                                  val as "Primary" | "Secondary"
                                                )
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select PIC Type" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Primary">
                                                  Primary
                                                </SelectItem>
                                                <SelectItem value="Secondary">
                                                  Secondary
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          {/* Title */}
                                          <div>
                                            <Label className="mb-1 block">
                                              Title
                                            </Label>
                                            <Select
                                              value={pic.title || "Mr"}
                                              onValueChange={(val) =>
                                                updatePIC(picIdx, "title", val)
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Title" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="Mr">
                                                  Mr
                                                </SelectItem>
                                                <SelectItem value="Ms">
                                                  Ms
                                                </SelectItem>
                                                <SelectItem value="Miss">
                                                  Miss
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          {/* First / Last Name */}
                                          <div>
                                            <Label className="mb-1 block">
                                              First Name
                                            </Label>
                                            <Input
                                              value={pic.firstName || ""}
                                              onChange={(e) =>
                                                updatePIC(
                                                  picIdx,
                                                  "firstName",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="First name"
                                              autoCapitalize="words"
                                            />
                                          </div>
                                          <div>
                                            <Label className="mb-1 block">
                                              Last Name
                                            </Label>
                                            <Input
                                              value={pic.lastName || ""}
                                              onChange={(e) =>
                                                updatePIC(
                                                  picIdx,
                                                  "lastName",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Last name"
                                              autoCapitalize="words"
                                            />
                                          </div>

                                          {/* Department */}
                                          <div className="sm:col-span-2">
                                            <Label className="mb-1 block">
                                              Department
                                            </Label>
                                            <Input
                                              value={pic.department || ""}
                                              onChange={(e) =>
                                                updatePIC(
                                                  picIdx,
                                                  "department",
                                                  e.target.value
                                                )
                                              }
                                              placeholder="Department"
                                            />
                                          </div>

                                          {/* Birthday */}
                                          <div className="sm:col-span-2">
                                            <Label className="mb-1 block">
                                              Birthday
                                            </Label>
                                            <DatePicker
                                              value={pic.birthday}
                                              onChange={(val) =>
                                                updatePIC(
                                                  picIdx,
                                                  "birthday",
                                                  val
                                                )
                                              }
                                              placeholder="dd.mm.yyyy"
                                            />
                                          </div>
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Contact Numbers */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label>Contact Numbers</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                addPICContactNumber(picIdx)
                                              }
                                              className="gap-1"
                                            >
                                              <Plus className="h-4 w-4" /> Add
                                              Number
                                            </Button>
                                          </div>

                                          {pic.contactNumbers.map(
                                            (num, numIdx) => (
                                              <div
                                                className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                                                key={numIdx}
                                              >
                                                <div className="sm:col-span-4">
                                                  <ShadCountryPhoneInput
                                                    country="lk"
                                                    value={
                                                      num.startsWith("+")
                                                        ? num.split(" ")[0]
                                                        : "+94"
                                                    }
                                                    onChange={(val, data) => {
                                                      const rest = num.replace(
                                                        /^(\+\d+)?\s?/,
                                                        ""
                                                      );
                                                      const dial =
                                                        "+" +
                                                        (typeof data ===
                                                          "object" &&
                                                        data &&
                                                        "dialCode" in data
                                                          ? (data as any)
                                                              .dialCode
                                                          : "");
                                                      const updatedNumber =
                                                        dial + " " + rest;
                                                      updatePICContactNumber(
                                                        picIdx,
                                                        numIdx,
                                                        updatedNumber.trim()
                                                      );
                                                    }}
                                                  />
                                                </div>
                                                <div className="sm:col-span-7">
                                                  <Input
                                                    value={
                                                      num.startsWith("+")
                                                        ? num.replace(
                                                            /^(\+\d+)\s?/,
                                                            ""
                                                          )
                                                        : num
                                                    }
                                                    onChange={(e) =>
                                                      updatePICContactNumber(
                                                        picIdx,
                                                        numIdx,
                                                        (num.startsWith("+")
                                                          ? num.split(" ")[0] +
                                                            " "
                                                          : "+94 ") +
                                                          e.target.value
                                                      )
                                                    }
                                                    placeholder="77 123 4567"
                                                  />
                                                </div>
                                                <div className="sm:col-span-1 flex sm:justify-end">
                                                  {pic.contactNumbers.length >
                                                    1 && (
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() =>
                                                        removePICContactNumber(
                                                          picIdx,
                                                          numIdx
                                                        )
                                                      }
                                                      aria-label="Remove number"
                                                    >
                                                      <X className="h-4 w-4" />
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Emails */}
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label>Emails</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                addPICEmail(picIdx)
                                              }
                                              className="gap-1"
                                            >
                                              <Plus className="h-4 w-4" /> Add
                                              Email
                                            </Button>
                                          </div>

                                          {pic.emails.map((email, emailIdx) => (
                                            <div
                                              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                                              key={emailIdx}
                                            >
                                              <div className="sm:col-span-11">
                                                <Input
                                                  value={email}
                                                  onChange={(e) =>
                                                    updatePICEmail(
                                                      picIdx,
                                                      emailIdx,
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="email@company.com"
                                                  inputMode="email"
                                                />
                                              </div>
                                              <div className="sm:col-span-1 flex sm:justify-end">
                                                {pic.emails.length > 1 && (
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      removePICEmail(
                                                        picIdx,
                                                        emailIdx
                                                      )
                                                    }
                                                    aria-label="Remove email"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>

                                        <Separator className="my-4" />

                                        {/* Remarks */}
                                        <div>
                                          <Label className="mb-1 block">
                                            Remarks
                                          </Label>
                                          <Textarea
                                            value={pic.remark}
                                            onChange={(e) =>
                                              updatePIC(
                                                picIdx,
                                                "remark",
                                                e.target.value
                                              )
                                            }
                                            placeholder="Additional notes about this PIC"
                                            rows={3}
                                          />
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  );
                                })}

                                {vendorForm.pics.length === 0 && (
                                  <div className="rounded-xl border bg-muted/40 p-6 text-center">
                                    <p className="text-sm text-muted-foreground mb-3">
                                      No Primary Contacts yet.
                                    </p>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={addNewPIC}
                                      className="gap-1"
                                    >
                                      <Plus className="h-4 w-4" /> Add New PIC
                                    </Button>
                                  </div>
                                )}
                              </Accordion>
                            </div>

                            {/* Company Remarks */}
                            <div>
                              <Label htmlFor="remark" className="form-label">
                                Company Remarks
                              </Label>
                              <Textarea
                                id="remark"
                                value={vendorForm.remark}
                                onChange={(e) =>
                                  setVendorForm((prev) => ({
                                    ...prev,
                                    remark: e.target.value,
                                  }))
                                }
                                placeholder="Additional notes about the vendor"
                                className="form-input"
                                rows={3}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setIsAddVendorOpen(false)}
                            disabled={loading}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={saveVendor}
                            className="professional-button-primary w-full sm:w-auto"
                            disabled={loading || !vendorForm.name.trim()}
                          >
                            {loading
                              ? "Saving..."
                              : editingVendor
                              ? "Update Vendor"
                              : "Add Vendor"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {/* Delete Confirmation Dialog */}
                    <Dialog
                      open={deleteDialogOpen}
                      onOpenChange={setDeleteDialogOpen}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Deletion</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">
                              {vendorToDelete?.name}
                            </span>
                            ? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              if (vendorToDelete) {
                                deleteVendor(
                                  vendorToDelete.id,
                                  vendorToDelete.name
                                );
                                setDeleteDialogOpen(false);
                              }
                            }}
                            disabled={loading}
                            className="w-full sm:w-auto"
                          >
                            {loading ? "Deleting..." : "Delete Vendor"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search vendors, services, or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full sm:w-48 form-input">
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="launch boat">Launch Boat</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="clearance">
                          Clearance Agent
                        </SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-40 form-input">
                        <SelectValue placeholder="KYC Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Vendor List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading-skeleton w-8 h-8 rounded-full"></div>
                </div>
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <Card
                    key={vendor.id}
                    className="professional-card hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
                        {/* Info section */}
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl flex-shrink-0">
                            <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">
                              {vendor.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="truncate">
                                {vendor.company_type}
                              </Badge>
                              <Badge
                                className={`truncate ${getKycStatusColor(
                                  vendor.kycStatus || "Pending"
                                )}`}
                              >
                                {vendor.kycStatus || "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {/* Action buttons */}
                        <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedVendor(vendor)}
                            className="flex-1 sm:flex-none min-w-[90px]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden xs:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editVendor(vendor)}
                            className="flex-1 sm:flex-none min-w-[90px]"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVendorToDelete({
                                id: vendor.vendor_id,
                                name: vendor.name,
                              });
                              setDeleteDialogOpen(true);
                            }}
                            className="flex-1 sm:flex-none min-w-[50px] text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      {/* Responsive grid for vendor info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Address
                            </p>
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {vendor.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {vendor.phone_number}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          Services
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vendor.vendorServices.map((service, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs truncate"
                            >
                              {typeof service === "string"
                                ? service
                                : service.service_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {vendor.remark && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {vendor.remark}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="professional-card">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No vendors found
                    </h3>
                    <p className="text-muted-foreground">
                      No vendors match your search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Vendor Details Modal */}
      <Dialog
        open={!!selectedVendor}
        onOpenChange={() => setSelectedVendor(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVendor.name} Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input value={selectedVendor.name} readOnly />
                    </div>
                    <div>
                      <Label>Company Type</Label>
                      <Input value={selectedVendor.company_type} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Textarea
                      value={selectedVendor.address}
                      readOnly
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input value={selectedVendor.phone_number} readOnly />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={selectedVendor.email} readOnly />
                    </div>
                  </div>
                  <div>
                    <Label>Services</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVendor.vendorServices.map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service.service_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>KYC Status</Label>
                    <Input
                      value={
                        selectedVendor.vendorStatus?.status
                          ? "Approved"
                          : "Pending"
                      }
                      readOnly
                    />
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Textarea value={selectedVendor.remark} readOnly rows={3} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" /> Primary Contacts (PICs)
                  </h3>
                  {(() => {
                    const picArr = selectedVendor
                      ? getVendorPICArray(selectedVendor)
                      : [];
                    return picArr.length > 0 ? (
                      picArr.map((pic, picIdx) => (
                        <Card key={pic.id || pic.pic_id || picIdx}>
                          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>PIC Name</Label>
                              <p className="text-sm mt-1">
                                {pic.name ||
                                  `${pic.title || "Mr"} ${
                                    pic.firstName || ""
                                  } ${pic.lastName || ""}`.trim()}
                              </p>
                            </div>
                            <div>
                              <Label>Type</Label>
                              <p className="text-sm mt-1">
                                {pic.type || pic.picType || "Primary"}
                              </p>
                            </div>
                            <div>
                              <Label>Department</Label>
                              <p className="text-sm mt-1">
                                {pic.department || "N/A"}
                              </p>
                            </div>
                            <div>
                              <Label>Birthday</Label>
                              <p className="text-sm mt-1">
                                {formatDateDMY(pic.birthday) || "N/A"}
                              </p>
                            </div>
                            <div>
                              <Label>Contact Numbers</Label>
                              <div>
                                {pic.contactNumbers &&
                                pic.contactNumbers.length > 0 ? (
                                  pic.contactNumbers.map(
                                    (num: string, idx: number) => (
                                      <p className="text-sm mt-1" key={idx}>
                                        {num}
                                      </p>
                                    )
                                  )
                                ) : pic.phone_number ? (
                                  <p className="text-sm mt-1">
                                    {pic.phone_number}
                                  </p>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label>Emails</Label>
                              <div>
                                {pic.emails && pic.emails.length > 0 ? (
                                  pic.emails.map(
                                    (email: string, idx: number) => (
                                      <p className="text-sm mt-1" key={idx}>
                                        {email}
                                      </p>
                                    )
                                  )
                                ) : pic.email ? (
                                  <p className="text-sm mt-1">{pic.email}</p>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    N/A
                                  </span>
                                )}
                              </div>
                            </div>
                            <div>
                              <Label>Remarks</Label>
                              <p className="text-sm mt-1">
                                {pic.remark || "No remarks"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">
                        No PICs available.
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedVendor(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
