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
  Cake,
  FileText,
} from "lucide-react";
import Link from "next/link";

import type { DocumentType } from "../types/vendor-types";

import AddVendorDialog from "@/components/AddVendorDialog";
import EditVendorDialog from "@/components/EditVendorDialog";
import VendorDocumentsDialog from "@/components/VendorDocumentsDialog";

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
    status: boolean | string;
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
  // For edit dialog convenience:
  phoneCountryCode?: string;
  phoneNumber?: string;
  services?: string[];
  pics?: VendorPIC[];
  attachments?: any[]; // Add this line to fix the error
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

// -- Type for vendorForm --
type VendorFormType = {
  name: string;
  address: string;
  phoneCountryCode: string;
  phoneNumber: string;
  company_type: string;
  email: string;
  remark: string;
  services: string[];
  status: { status: boolean };
  pics: VendorPIC[];
};

const blankVendorForm = (): VendorFormType => ({
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
      title: "Mr.",
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

export default function VendorManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([]);
  const [vendorBirthdayAlerts, setVendorBirthdayAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [companyTypes, setCompanyTypes] = useState<string[]>([]);
  const [vendorToDelete, setVendorToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [documentList, setDocumentList] = useState<DocumentType[]>([]);

  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/vendor/document/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDocumentList(data.data as DocumentType[]);
        } else {
          setDocumentList([]);
        }
      } catch {
        setDocumentList([]);
      }
    };
    fetchDocuments();
  }, []);

  // --- AUTO-OPEN ADD VENDOR DIALOG IF A DRAFT EXISTS ---
  useEffect(() => {
    // Will run once after mount
    if (!isAddVendorOpen) {
      const draft = localStorage.getItem("addVendorFormDraft");
      if (draft) {
        setIsAddVendorOpen(true);
      }
    }
  }, []);

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
          errorData.message || `Request failed with status ${response.status}`,
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

  function calcVendorBirthdayAlerts(vendors: Vendor[]) {
    const today = new Date();
    const alerts: {
      name: string;
      company: string;
      birthday: Date;
      daysUntil: number;
    }[] = [];

    vendors.forEach((vendor) => {
      (vendor.vendorPics || []).forEach((pic) => {
        if (!pic.birthday) return;
        try {
          const birthday = new Date(pic.birthday);
          if (isNaN(birthday.getTime())) return;
          let thisYearBirthday = new Date(
            today.getFullYear(),
            birthday.getMonth(),
            birthday.getDate(),
          );
          // Handle Feb 29
          if (birthday.getMonth() === 1 && birthday.getDate() === 29) {
            if (
              !(
                (today.getFullYear() % 4 === 0 &&
                  today.getFullYear() % 100 !== 0) ||
                today.getFullYear() % 400 === 0
              )
            ) {
              thisYearBirthday.setDate(28);
            }
          }
          const daysUntil = Math.ceil(
            (thisYearBirthday.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24),
          );
          if (daysUntil >= 0 && daysUntil <= 7) {
            alerts.push({
              name:
                (pic.title ? pic.title + " " : "") +
                (pic.firstName || "") +
                (pic.lastName ? " " + pic.lastName : ""),
              company: vendor.name,
              birthday: thisYearBirthday,
              daysUntil,
            });
          }
        } catch (e) {
          // ignore invalid birthday
        }
      });
    });
    setVendorBirthdayAlerts(alerts.sort((a, b) => a.daysUntil - b.daysUntil));
  }

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
        // Handle status: can be boolean (true/false) or string ("approved"/"pending"/"rejected")
        let kycStatus = "Pending";
        if (
          vendor.vendorStatus?.status === true ||
          vendor.vendorStatus?.status === "approved"
        ) {
          kycStatus = "Approved";
        } else if (vendor.vendorStatus?.status === "rejected") {
          kycStatus = "Rejected";
        } else if (
          vendor.vendorStatus?.status === false ||
          vendor.vendorStatus?.status === "pending"
        ) {
          kycStatus = "Pending";
        }

        return {
          ...vendor,
          kycStatus,
          rating: 0,
          totalJobs: 0,
          completedJobs: 0,
          vendorPics,
        };
      });
      setVendors(formattedVendors);
      setFilteredVendors(formattedVendors);
      calcVendorBirthdayAlerts(formattedVendors);
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
        services.sort((a: string, b: string) => a.localeCompare(b));
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
    // Extract unique company types from vendors
    if (vendors.length > 0) {
      const uniqueTypes = Array.from(
        new Set(
          vendors
            .map((vendor) => vendor.company_type)
            .filter((type) => type && type.trim() !== ""),
        ),
      ).sort();
      setCompanyTypes(uniqueTypes);
    }
  }, [vendors]);

  useEffect(() => {
    let filtered = vendors;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchLower) ||
          vendor.company_type.toLowerCase().includes(searchLower) ||
          vendor.vendorServices.some((service) =>
            service.service_name.toLowerCase().includes(searchLower),
          ) ||
          vendor.vendorPics.some((pic) =>
            `${pic.title || ""} ${pic.firstName || ""} ${pic.lastName || ""}`
              .toLowerCase()
              .includes(searchLower),
          ),
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (vendor) =>
          vendor.company_type.toLowerCase() === typeFilter.toLowerCase(),
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((vendor) => {
        const status = vendor.vendorStatus?.status;
        if (statusFilter === "approved") {
          return status === true || status === "approved";
        } else if (statusFilter === "pending") {
          return status === false || status === "pending";
        } else if (statusFilter === "rejected") {
          return status === "rejected";
        }
        return false;
      });
    }
    setFilteredVendors(filtered);
  }, [searchTerm, typeFilter, statusFilter, vendors]);

  // ---- Add Vendor Dialog Handler ----
  const handleSaveVendor = async (formData: VendorFormType) => {
    setLoading(true);
    try {
      // Prepare backend payload
      const backendData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone_number: `${formData.phoneCountryCode || "+94"}${
          formData.phoneNumber ? " " + formData.phoneNumber.trim() : ""
        }`,
        company_type: formData.company_type.trim(),
        email: formData.email.trim(),
        remark: formData.remark.trim(),
        services: formData.services,
        status: { status: formData.status.status },
        pic:
          formData.pics && formData.pics.length > 0
            ? {
                firstName: formData.pics[0].firstName || "",
                lastName: formData.pics[0].lastName || "",
                phone_number: formData.pics[0].contactNumbers?.[0] || "",
                picType: formData.pics[0].type || "Primary",
                email: formData.pics[0].emails?.[0] || "",
                remark: formData.pics[0].remark?.trim() || "",
              }
            : undefined,
      };

      // Send create request
      await apiCall(`${API_BASE_URL}/vendor`, {
        method: "POST",
        body: JSON.stringify(backendData),
      });

      // Clean up draft data BEFORE reload to avoid re-triggering dialog open
      localStorage.removeItem("vendorFormDraft");
      localStorage.removeItem("addVendorFormDraft");
      setIsAddVendorOpen(false);

      toast({
        title: "Success",
        description: "Vendor created successfully!",
      });

      // Delay reload so the toast is visible
      setTimeout(() => {
        window.location.reload();
        // Or: router.refresh(); // if you use Next.js App Router
      }, 850);
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

  // ---- Edit Vendor Dialog Handler ----
  const handleUpdateVendor = async (formData: VendorFormType) => {
    try {
      setLoading(true);
      const backendData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone_number: `${formData.phoneCountryCode || "+94"} ${
          formData.phoneNumber || ""
        }`.trim(),
        company_type: formData.company_type.trim(),
        email: formData.email.trim(),
        remark: formData.remark.trim(),
        services: formData.services,
        status: { status: formData.status.status },
        pic:
          formData.pics && formData.pics.length > 0
            ? {
                firstName: formData.pics[0].firstName || "",
                lastName: formData.pics[0].lastName || "",
                phone_number: formData.pics[0].contactNumbers?.[0] || "",
                picType: formData.pics[0].type || "Primary",
                email: formData.pics[0].emails?.[0] || "",
                remark: formData.pics[0].remark?.trim() || "",
              }
            : undefined,
      };

      if (!editingVendor) return;
      await apiCall(`${API_BASE_URL}/vendor/${editingVendor.vendor_id}`, {
        method: "PUT",
        body: JSON.stringify(backendData),
      });
      await loadVendors();
      setEditingVendor(null);
      toast({
        title: "Success",
        description: "Vendor updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Failed to update vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setEditingVendor(null); // << Move these AFTER loadVendors
      setIsEditVendorOpen(false);
    }
  };

  // ---- Edit Vendor Dialog Open Handler ----
  const startEditVendor = (vendor: Vendor) => {
    let phoneCountryCode = "+94";
    let phoneNumber = "";
    if (vendor.phone_number) {
      // If format is "+94112223344" (no space)
      const match = vendor.phone_number.match(/^(\+\d{2})(\d{7,})$/);
      if (match) {
        phoneCountryCode = match[1]; // "+94"
        phoneNumber = match[2]; // "112223344" or "763721457"
      } else {
        // fallback: "+94 112223344" or "+94 763721457" (with space)
        const altMatch = vendor.phone_number.match(/^(\+\d+)\s*(.*)$/);
        if (altMatch) {
          phoneCountryCode = altMatch[1];
          phoneNumber = altMatch[2];
        } else {
          // fallback: just the number
          phoneNumber = vendor.phone_number;
        }
      }
    }
    const picArray = getVendorPICArray(vendor);

    setEditingVendor({
      ...vendor,
      phoneCountryCode,
      phoneNumber,
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
    } as Vendor);
    setIsEditVendorOpen(true);
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
      setVendors((prev: Vendor[]) =>
        prev.filter((vendor) => vendor.vendor_id !== id),
      );
      setFilteredVendors((prev: Vendor[]) =>
        prev.filter((vendor) => vendor.vendor_id !== id),
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
            {/* <Card className="professional-card">
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
            </Card> */}
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
                    Rejected KYC
                  </span>
                  <span className="font-medium">
                    {vendors.filter((v) => v.kycStatus === "Rejected").length}
                  </span>
                </div>

                {/* <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Document Alerts
                  </span>
                  <span className="font-medium">{expiryAlerts.length}</span>
                </div> */}
                {/* <div className="flex justify-between">
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
                </div> */}
              </CardContent>
            </Card>
            {/* Add Vendor Button */}
            <Button
              className="w-full h-12 text-base flex items-center justify-center gap-2 professional-button-primary"
              disabled={loading}
              onClick={() => setIsAddVendorOpen(true)}
            >
              <Plus className="h-5 w-5" />
              Add Vendor
            </Button>

            {/* Vendor Documents Button */}
            <Button
              className="w-full h-12 text-base flex items-center justify-center gap-2 border border-primary text-primary bg-background hover:bg-primary/10 transition"
              variant="outline"
              disabled={loading}
              onClick={() => setIsDocumentsDialogOpen(true)}
            >
              <FileText className="h-5 w-5" />
              Vendor Documents
            </Button>
            {/* <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cake className="h-5 w-5" />
                  <span>Vendor PIC Birthdays</span>
                </CardTitle>
                <CardDescription>Upcoming vendor PIC birthdays</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorBirthdayAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {vendorBirthdayAlerts.map((alert, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{alert.name}</p>
                          <Badge
                            variant={
                              alert.daysUntil <= 3 ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {alert.daysUntil === 0
                              ? "Today"
                              : `${alert.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {alert.company}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateDMY(alert.birthday)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No upcoming birthdays
                  </p>
                )}
              </CardContent>
            </Card> */}
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span>Vendor Management</span>
                  <div className="flex gap-2 flex-wrap">
                    {/* Vendor Documents Dialog */}
                    <VendorDocumentsDialog
                      open={isDocumentsDialogOpen}
                      onOpenChange={setIsDocumentsDialogOpen}
                      vendors={vendors}
                      loading={loading}
                    />

                    {/* ---- AddVendorDialog ---- */}
                    <AddVendorDialog
                      open={isAddVendorOpen}
                      onOpenChange={setIsAddVendorOpen}
                      serviceCategories={serviceCategories}
                      loadingServices={loadingServices}
                      onSaveVendor={handleSaveVendor}
                    />
                    {/* ---- EditVendorDialog ---- */}
                    <EditVendorDialog
                      open={isEditVendorOpen}
                      onOpenChange={setIsEditVendorOpen}
                      serviceCategories={serviceCategories}
                      loadingServices={loadingServices}
                      initialVendorForm={
                        editingVendor
                          ? {
                              vendor_id: editingVendor.vendor_id,
                              name: editingVendor.name,
                              address: editingVendor.address,
                              phoneCountryCode:
                                editingVendor.phoneCountryCode || "+94",
                              phoneNumber: editingVendor.phoneNumber || "",
                              company_type: editingVendor.company_type,
                              email: editingVendor.email,
                              remark: editingVendor.remark,
                              services: editingVendor.services || [],
                              status: editingVendor.status || { status: true },
                              pics: editingVendor.pics || [],
                              attachments: editingVendor.attachments || [],
                            }
                          : null
                      }
                      documentList={documentList}
                      onUpdateVendor={handleUpdateVendor}
                    />
                    {/* ---- Delete Confirmation Dialog ---- */}
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
                                  vendorToDelete.name,
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
                        <SelectValue placeholder="Company Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {companyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
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
                        <SelectItem value="rejected">Rejected</SelectItem>
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
                                  vendor.kycStatus || "Pending",
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
                            onClick={() => startEditVendor(vendor)}
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
                            {/* <div>
                              <Label>Department</Label>
                              <p className="text-sm mt-1">
                                {pic.department || "N/A"}
                              </p>
                            </div> */}
                            {/* <div>
                              <Label>Birthday</Label>
                              <p className="text-sm mt-1">
                                {formatDateDMY(pic.birthday) || "N/A"}
                              </p>
                            </div> */}
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
                                    ),
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
                                    ),
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
