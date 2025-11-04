"use client";

import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
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
  Mail,
  MapPin,
  Building,
  User,
  Edit,
  Trash2,
  Eye,
  Anchor,
  Cake,
  X,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import ShadCountryPhoneInput from "@/components/ui/ShadCountryPhoneInput";
import { DatePicker } from "@/components/ui/date-picker";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENDPOINTS = {
  CUSTOMERS: `${API_BASE_URL}/customer`,
  CUSTOMER: (id: string) => `${API_BASE_URL}/customer/${id}`,
};

interface PIC {
  id: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  name: string;
  department: string;
  contactNumbers: string[];
  contactTypes?: string[];
  emails: string[];
  emailTypes?: string[];
  birthday: string;
  remarks: string;
  receiveUpdates: boolean;
}

interface Customer {
  id: string;
  companyName: string;
  address: string;
  landlineCountryCode: string;
  landlineNumber: string;
  groupEmails: string[];
  companyType: string[]; // now array, not string
  remarks: string;
  pics: PIC[];
  createdAt: string;
  lastUpdated: string;
  totalPortCalls: number;
  activePortCalls: number;
}

export default function CustomerCompanies() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [birthdayAlerts, setBirthdayAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Add/Edit Customer Modal States
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Company type options (dynamic, checkboxes)
  const [companyTypeOptions, setCompanyTypeOptions] = useState<string[]>([
    "Owners",
    "Managers",
    "Charterers",
    "Bunker Traders",
  ]);
  const [newCompanyTypeInput, setNewCompanyTypeInput] = useState("");
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>(
    []
  );

  // Customer form
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    companyName: "",
    address: "",
    landlineCountryCode: "+94",
    landlineNumber: "",
    groupEmails: [""],
    companyType: [],
    remarks: "",
    pics: [],
  });

  // PIC Form States
  const [currentPicIndex, setCurrentPicIndex] = useState<number>(-1); // -1 = new PIC, >=0 = editing existing
  const [picForm, setPicForm] = useState<Partial<PIC>>({
    title: "Mr.",
    firstName: "",
    lastName: "",
    department: "",
    contactNumbers: [""],
    contactTypes: ["Direct Line"], // per number
    emails: [""],
    emailTypes: ["Personal"], // per email
    birthday: "",
    remarks: "",
    receiveUpdates: true,
  });

  // --- Handler for adding new company type dynamically ---
  const handleAddCompanyType = () => {
    if (
      newCompanyTypeInput.trim() &&
      !companyTypeOptions.includes(newCompanyTypeInput)
    ) {
      setCompanyTypeOptions((prev) => [...prev, newCompanyTypeInput.trim()]);
      setNewCompanyTypeInput("");
    }
  };

  // --- Handler for company type checkboxes ---
  const handleCompanyTypeCheckbox = (value: string) => {
    setSelectedCompanyTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // PIC form handlers
  const handlePicFormChange = (field: string, value: any) => {
    setPicForm((prev) => ({ ...prev, [field]: value }));
  };

  // PIC contact number type handler
  const handleContactTypeChange = (idx: number, type: string) => {
    setPicForm((prev) => {
      const arr = prev.contactTypes ? [...prev.contactTypes] : [];
      arr[idx] = type;
      return { ...prev, contactTypes: arr };
    });
  };

  // PIC email type handler
  const handleEmailTypeChange = (idx: number, type: string) => {
    setPicForm((prev) => {
      const arr = prev.emailTypes ? [...prev.emailTypes] : [];
      arr[idx] = type;
      return { ...prev, emailTypes: arr };
    });
  };

  // Add PIC to customerForm.pics
  const addPicToCustomer = () => {
    if (!picForm.firstName?.trim()) {
      alert("Please enter PIC first name");
      return;
    }
    if (!picForm.lastName?.trim()) {
      alert("Please enter PIC last name");
      return;
    }
    // Compose full name for legacy/data display
    const name =
      `${picForm.title} ${picForm.firstName} ${picForm.lastName}`.trim();
    const newPic: PIC = {
      id: Date.now().toString(),
      title: picForm.title || "Mr",
      firstName: picForm.firstName || "",
      lastName: picForm.lastName || "",
      name,
      department: picForm.department || "",
      contactNumbers: picForm.contactNumbers?.filter((num) => num.trim()) || [],
      contactTypes: (picForm.contactTypes || []).slice(
        0,
        picForm.contactNumbers?.length || 1
      ),
      emails: picForm.emails?.filter((email) => email.trim()) || [],
      emailTypes: (picForm.emailTypes || []).slice(
        0,
        picForm.emails?.length || 1
      ),
      birthday: picForm.birthday || "",
      remarks: picForm.remarks || "",
      receiveUpdates: picForm.receiveUpdates !== false,
    };

    setCustomerForm((prev) => ({
      ...prev,
      pics: [...(prev.pics || []), newPic],
    }));

    // Reset PIC form
    setPicForm({
      title: "Mr",
      firstName: "",
      lastName: "",
      department: "",
      contactNumbers: [""],
      contactTypes: ["Direct Line"],
      emails: [""],
      emailTypes: ["Personal"],
      birthday: "",
      remarks: "",
      receiveUpdates: true,
    });
    setCurrentPicIndex(-1);
  };

  const updatePicInCustomer = () => {
    if (currentPicIndex === -1) return;
    if (!picForm.firstName?.trim()) {
      alert("Please enter PIC first name");
      return;
    }
    if (!picForm.lastName?.trim()) {
      alert("Please enter PIC last name");
      return;
    }
    const name =
      `${picForm.title} ${picForm.firstName} ${picForm.lastName}`.trim();
    setCustomerForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[currentPicIndex] = {
        ...updatedPics[currentPicIndex],
        title: picForm.title || "Mr",
        firstName: picForm.firstName || "",
        lastName: picForm.lastName || "",
        name,
        department: picForm.department || "",
        contactNumbers:
          picForm.contactNumbers?.filter((num) => num.trim()) || [],
        contactTypes: (picForm.contactTypes || []).slice(
          0,
          picForm.contactNumbers?.length || 1
        ),
        emails: picForm.emails?.filter((email) => email.trim()) || [],
        emailTypes: (picForm.emailTypes || []).slice(
          0,
          picForm.emails?.length || 1
        ),
        birthday: picForm.birthday || "",
        remarks: picForm.remarks || "",
        receiveUpdates: picForm.receiveUpdates !== false,
      };
      return { ...prev, pics: updatedPics };
    });

    setPicForm({
      title: "Mr",
      firstName: "",
      lastName: "",
      department: "",
      contactNumbers: [""],
      contactTypes: ["Direct Line"],
      emails: [""],
      emailTypes: ["Personal"],
      birthday: "",
      remarks: "",
      receiveUpdates: true,
    });
    setCurrentPicIndex(-1);
  };

  const editPic = (index: number) => {
    const pic = customerForm.pics?.[index];
    if (pic) {
      setPicForm({
        title: pic.title || "Mr",
        firstName: pic.firstName || "",
        lastName: pic.lastName || "",
        department: pic.department,
        contactNumbers: [...pic.contactNumbers, ""].filter(Boolean),
        contactTypes: pic.contactTypes
          ? [...pic.contactTypes, "Direct Line"].filter(Boolean)
          : Array(pic.contactNumbers?.length ?? 1).fill("Direct Line"),
        emails: [...pic.emails, ""].filter(Boolean),
        emailTypes: pic.emailTypes
          ? [...pic.emailTypes, "Personal"].filter(Boolean)
          : Array(pic.emails?.length ?? 1).fill("Personal"),
        birthday: pic.birthday,
        remarks: pic.remarks,
        receiveUpdates: pic.receiveUpdates,
      });
      setCurrentPicIndex(index);
    }
  };

  const removePic = (index: number) => {
    setCustomerForm((prev) => ({
      ...prev,
      pics: (prev.pics || []).filter((_, i) => i !== index),
    }));
    if (currentPicIndex === index) {
      setCurrentPicIndex(-1);
      setPicForm({
        title: "Mr",
        firstName: "",
        lastName: "",
        department: "",
        contactNumbers: [""],
        contactTypes: ["Direct Line"],
        emails: [""],
        emailTypes: ["Personal"],
        birthday: "",
        remarks: "",
        receiveUpdates: true,
      });
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  const router = useRouter();

  // API Functions
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
      return await response.json();
    } catch (error: any) {
      console.error("API Error:", error);
      toast.error("API Error", {
        description: error.message || "Failed to complete request",
        icon: <AlertTriangle />,
        action: {
          label: "Retry",
          onClick: () => {
            toast.info("Retrying request...");
          },
        },
      });
      throw error;
    }
  };

  // Load customers from API
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.CUSTOMERS);

      const customersData = response.data || [];

      const transformedCustomers = customersData.map(
        (apiCustomer: any): Customer => {
          // Split phone number
          const phoneParts = apiCustomer.phone_number
            ? apiCustomer.phone_number.split(" ")
            : ["+94", ""];

          // Parse PIC data correctly
          const pics = [];
          if (apiCustomer.customerPic) {
            const pic = apiCustomer.customerPic;
            pics.push({
              id: pic.pic_id || Date.now().toString(),
              title: pic.prefix || pic.title || "Mr", // now using prefix from API
              firstName: pic.firstName || "",
              lastName: pic.lastName || "",
              name:
                (pic.prefix || pic.title || "Mr") +
                " " +
                (pic.firstName || "") +
                " " +
                (pic.lastName || ""),
              department: pic.department || "",
              contactNumbers: pic.phone_number ? [pic.phone_number] : [],
              contactTypes: pic.phoneNumberType ? [pic.phoneNumberType] : [],
              emails: pic.email ? [pic.email] : [],
              emailTypes: pic.emailType ? [pic.emailType] : [],
              birthday: pic.birthday || "",
              remarks: pic.remark || "",
              receiveUpdates: Boolean(pic.receiveUpdates),
            });
          }

          // Transform companyTypes array of objects into array of strings
          const companyTypeArr = Array.isArray(apiCustomer.companyTypes)
            ? apiCustomer.companyTypes.map((ct: any) => ct.company_type)
            : Array.isArray(apiCustomer.company_type)
            ? apiCustomer.company_type
            : typeof apiCustomer.company_type === "string"
            ? [apiCustomer.company_type]
            : [];

          return {
            id: apiCustomer.customer_id,
            companyName: apiCustomer.company_name,
            address: apiCustomer.address,
            landlineCountryCode: phoneParts[0] || "+94",
            landlineNumber: phoneParts.slice(1).join(" ") || "",
            groupEmails: apiCustomer.email
              ? apiCustomer.email.split(",").map((e: string) => e.trim())
              : [],
            companyType: companyTypeArr,
            remarks: apiCustomer.remark || "",
            pics: pics,
            createdAt: apiCustomer.createdAt,
            lastUpdated: apiCustomer.updatedAt,
            totalPortCalls: apiCustomer.totalPortCalls || 0,
            activePortCalls: apiCustomer.activePortCalls || 0,
          };
        }
      );

      setCustomers(transformedCustomers);
      setFilteredCustomers(transformedCustomers);
      calculateBirthdayAlerts(transformedCustomers);
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Improved birthday alerts calculation with proper typing
  interface BirthdayAlert {
    name: string;
    company: string;
    birthday: Date;
    daysUntil: number;
  }

  const calculateBirthdayAlerts = (customerList: Customer[]): void => {
    const today = new Date();
    const alerts: BirthdayAlert[] = [];

    customerList.forEach((customer) => {
      customer.pics.forEach((pic) => {
        if (!pic.birthday) return;

        try {
          const birthday = new Date(pic.birthday);
          if (isNaN(birthday.getTime())) return; // Skip invalid dates

          const thisYearBirthday = new Date(
            today.getFullYear(),
            birthday.getMonth(),
            birthday.getDate()
          );

          // Handle case where birthday is Feb 29 and not a leap year
          if (birthday.getMonth() === 1 && birthday.getDate() === 29) {
            if (!isLeapYear(today.getFullYear())) {
              thisYearBirthday.setDate(28); // Use Feb 28 in non-leap years
            }
          }

          const daysUntil = Math.ceil(
            (thisYearBirthday.getTime() - today.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysUntil >= 0 && daysUntil <= 7) {
            alerts.push({
              name: pic.name,
              company: customer.companyName,
              birthday: thisYearBirthday,
              daysUntil,
            });
          }
        } catch (e) {
          console.warn(`Invalid birthday for PIC ${pic.name}: ${pic.birthday}`);
        }
      });
    });

    setBirthdayAlerts(alerts.sort((a, b) => a.daysUntil - b.daysUntil));
  };

  // Helper function for leap year check
  const isLeapYear = (year: number): boolean => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userData);
    setCurrentUser(user);
    loadCustomers();
  }, [router]);

  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          customer.pics.some((pic) =>
            pic.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((customer) =>
        Array.isArray(customer.companyType)
          ? customer.companyType
              .map((t) => t.toLowerCase())
              .includes(typeFilter)
          : typeof customer.companyType === "string"
          ? (customer.companyType as string).toLowerCase() === typeFilter
          : false
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, typeFilter, customers]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  // Customer form handlers
  const handleCustomerFormChange = (field: string, value: any) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const addGroupEmail = () => {
    setCustomerForm((prev) => ({
      ...prev,
      groupEmails: [...(prev.groupEmails || []), ""],
    }));
  };

  const updateGroupEmail = (index: number, value: string) => {
    setCustomerForm((prev) => ({
      ...prev,
      groupEmails:
        prev.groupEmails?.map((email, i) => (i === index ? value : email)) ||
        [],
    }));
  };

  const removeGroupEmail = (index: number) => {
    setCustomerForm((prev) => ({
      ...prev,
      groupEmails: prev.groupEmails?.filter((_, i) => i !== index) || [],
    }));
  };

  // PIC form handlers
  const addPicContactNumber = () => {
    setPicForm((prev) => ({
      ...prev,
      contactNumbers: [...(prev.contactNumbers || []), ""],
      contactTypes: [...(prev.contactTypes || []), "Direct Line"],
    }));
  };

  const updatePicContactNumber = (index: number, value: string) => {
    setPicForm((prev) => ({
      ...prev,
      contactNumbers:
        prev.contactNumbers?.map((num, i) => (i === index ? value : num)) || [],
    }));
  };

  const removePicContactNumber = (index: number) => {
    setPicForm((prev) => ({
      ...prev,
      contactNumbers: prev.contactNumbers?.filter((_, i) => i !== index) || [],
      contactTypes: prev.contactTypes?.filter((_, i) => i !== index) || [],
    }));
  };

  const addPicEmail = () => {
    setPicForm((prev) => ({
      ...prev,
      emails: [...(prev.emails || []), ""],
      emailTypes: [...(prev.emailTypes || []), "Personal"],
    }));
  };

  const updatePicEmail = (index: number, value: string) => {
    setPicForm((prev) => ({
      ...prev,
      emails:
        prev.emails?.map((email, i) => (i === index ? value : email)) || [],
    }));
  };

  const removePicEmail = (index: number) => {
    setPicForm((prev) => ({
      ...prev,
      emails: prev.emails?.filter((_, i) => i !== index) || [],
      emailTypes: prev.emailTypes?.filter((_, i) => i !== index) || [],
    }));
  };

  // Save customer function - API ready
  const saveCustomer = async () => {
    if (!customerForm.companyName?.trim()) {
      alert("Please enter a company name");
      return;
    }

    try {
      setLoading(true);

      // Compose PIC payload from the first PIC
      const firstPic = customerForm.pics?.[0];
      let picData = null;
      if (firstPic) {
        picData = {
          prefix: firstPic.title || "Mr",
          firstName: firstPic.firstName || "",
          lastName: firstPic.lastName || "",
          department: firstPic.department,
          phone_number: firstPic.contactNumbers?.[0] || "",
          phoneNumberType: firstPic.contactTypes?.[0] || "Direct Line",
          email: firstPic.emails?.[0] || "",
          emailType: firstPic.emailTypes?.[0] || "Personal",
          birthday: firstPic.birthday,
          receiveUpdates: firstPic.receiveUpdates,
          remark: firstPic.remarks,
        };
      }

      // Prepare payload matching backend structure
      const payload = {
        company_name: customerForm.companyName,
        address: customerForm.address,
        phone_number:
          `${customerForm.landlineCountryCode} ${customerForm.landlineNumber}`.trim(),
        company_type: selectedCompanyTypes,
        email: customerForm.groupEmails?.[0] || "",
        remark: customerForm.remarks,
        pic: picData,
      };

      if (editingCustomer) {
        await apiCall(API_ENDPOINTS.CUSTOMER(editingCustomer.id), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall(API_ENDPOINTS.CUSTOMERS, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      // Refresh customer list from server
      await loadCustomers();

      // Show success toast
      toast.success("Customer saved!", {
        icon: <Building />,
        description: editingCustomer
          ? "Customer company updated successfully."
          : "The Customer Company Registration has been successfully completed",
      });

      // Reset form and close modal
      setCustomerForm({
        companyName: "",
        address: "",
        landlineCountryCode: "+94",
        landlineNumber: "",
        groupEmails: [""],
        companyType: [],
        remarks: "",
        pics: [],
      });
      setEditingCustomer(null);
      setIsAddCustomerOpen(false);
      setSelectedCompanyTypes([]);
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert("Failed to save customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit customer function
  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      companyName: customer.companyName,
      address: customer.address,
      landlineCountryCode: customer.landlineCountryCode,
      landlineNumber: customer.landlineNumber,
      groupEmails: customer.groupEmails,
      companyType: customer.companyType,
      remarks: customer.remarks,
      pics: customer.pics,
    });
    setSelectedCompanyTypes(customer.companyType || []);
    setIsAddCustomerOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

  // Implement the deleteCustomer function
  const deleteCustomer = async (customerId: string) => {
    try {
      setIsDeleting(true);

      await apiCall(API_ENDPOINTS.CUSTOMER(customerId), {
        method: "DELETE",
      });

      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setFilteredCustomers((prev) => prev.filter((c) => c.id !== customerId));

      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  function formatDateDMY(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Back Button */}
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

            {/* Page Title & Icon */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Customer Companies
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Client Relationships
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

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Birthday Alerts */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cake className="h-5 w-5" />
                  <span>Birthday Alerts</span>
                </CardTitle>
                <CardDescription>Upcoming PIC birthdays</CardDescription>
              </CardHeader>
              <CardContent>
                {birthdayAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {birthdayAlerts.map((alert, index) => (
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
            </Card>

            {/* Quick Stats */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Customers
                  </span>
                  <span className="font-medium">{customers.length}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Port Calls
                  </span>
                  <span className="font-medium">
                    {customers.reduce((sum, c) => sum + c.activePortCalls, 0)}
                  </span>
                </div> */}
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total PICs
                  </span>
                  <span className="font-medium">
                    {customers.reduce((sum, c) => sum + c.pics.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Birthday Alerts
                  </span>
                  <span className="font-medium">{birthdayAlerts.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Management</span>
                  <Dialog
                    open={isAddCustomerOpen}
                    onOpenChange={setIsAddCustomerOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="professional-button-primary"
                        disabled={loading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCustomer
                            ? "Edit Customer"
                            : "Add New Customer"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCustomer
                            ? "Update customer information"
                            : "Add a new customer company to the system"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">
                            Company Information
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="companyName"
                                className="form-label"
                              >
                                Company Name *
                              </Label>
                              <Input
                                id="companyName"
                                value={customerForm.companyName || ""}
                                onChange={(e) =>
                                  handleCustomerFormChange(
                                    "companyName",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter company name"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <Label className="form-label">Company Type</Label>

                              {/* Chip group */}
                              <div className="flex flex-wrap gap-2">
                                {companyTypeOptions.map((type) => {
                                  const active =
                                    selectedCompanyTypes.includes(type);
                                  return (
                                    <button
                                      key={type}
                                      type="button"
                                      onClick={() =>
                                        handleCompanyTypeCheckbox(type)
                                      }
                                      role="checkbox"
                                      aria-checked={active}
                                      className={[
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                                        "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                        active
                                          ? "bg-primary text-primary-foreground border-primary"
                                          : "bg-background text-foreground border-input hover:bg-muted/60",
                                      ].join(" ")}
                                    >
                                      {/* subtle check dot */}
                                      <span
                                        className={[
                                          "h-2 w-2 rounded-full",
                                          active
                                            ? "bg-primary-foreground"
                                            : "bg-muted-foreground/50",
                                        ].join(" ")}
                                      />
                                      <span className="whitespace-nowrap">
                                        {type}
                                      </span>
                                    </button>
                                  );
                                })}

                                {/* Add new type */}
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={newCompanyTypeInput}
                                    onChange={(e) =>
                                      setNewCompanyTypeInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (
                                        e.key === "Enter" &&
                                        newCompanyTypeInput.trim()
                                      ) {
                                        handleAddCompanyType();
                                      }
                                    }}
                                    placeholder="Add type"
                                    className="h-9 w-36 text-sm"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleAddCompanyType}
                                    className="h-9"
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>

                              {/* Helper: show a hint when nothing selected */}
                              {selectedCompanyTypes.length === 0 && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Tip: pick one or more company types, or add a
                                  custom one.
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address" className="form-label">
                              Address
                            </Label>
                            <Textarea
                              id="address"
                              value={customerForm.address || ""}
                              onChange={(e) =>
                                handleCustomerFormChange(
                                  "address",
                                  e.target.value
                                )
                              }
                              placeholder="Enter company address"
                              className="form-input"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="landlineCountryCode"
                                className="form-label"
                              >
                                Country Code
                              </Label>
                              <ShadCountryPhoneInput
                                country="lk"
                                value={
                                  customerForm.landlineCountryCode ?? "+94"
                                }
                                onChange={(_, data) => {
                                  const dial =
                                    "+" +
                                    (typeof data === "object" &&
                                    data &&
                                    "dialCode" in data
                                      ? (data as any).dialCode
                                      : "");
                                  handleCustomerFormChange(
                                    "landlineCountryCode",
                                    dial
                                  );
                                }}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="landlineNumber"
                                className="form-label"
                              >
                                Landline Number
                              </Label>
                              <Input
                                id="landlineNumber"
                                value={customerForm.landlineNumber || ""}
                                onChange={(e) =>
                                  handleCustomerFormChange(
                                    "landlineNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="11-234-5678"
                                className="form-input"
                              />
                            </div>
                          </div>

                          {/* Group Emails */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="form-label">Group Emails</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addGroupEmail}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Email
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {customerForm.groupEmails?.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={email}
                                    onChange={(e) =>
                                      updateGroupEmail(index, e.target.value)
                                    }
                                    placeholder="email@company.com"
                                    className="form-input"
                                  />
                                  {customerForm.groupEmails!.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeGroupEmail(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="remarks" className="form-label">
                              Remarks
                            </Label>
                            <Textarea
                              id="remarks"
                              value={customerForm.remarks || ""}
                              onChange={(e) =>
                                handleCustomerFormChange(
                                  "remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Additional notes about the customer"
                              className="form-input"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      {/* PIC Management Section */}
                      <div className="space-y-6 pt-6 border-t">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg sm:text-xl font-medium">
                            Persons In Charge (PICs)
                          </h3>
                          {customerForm.pics?.length ? (
                            <span className="text-xs text-muted-foreground">
                              {customerForm.pics.length} saved
                            </span>
                          ) : null}
                        </div>

                        {/* Display existing PICs */}
                        {customerForm.pics?.length ? (
                          <div className="grid gap-3">
                            {customerForm.pics.map((pic, index) => (
                              <div
                                key={pic.id}
                                className="rounded-lg border bg-card p-4"
                              >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">
                                      {pic.title} {pic.firstName} {pic.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {pic.department}
                                    </p>
                                  </div>

                                  <div className="flex w-full flex-row flex-wrap gap-2 sm:w-auto">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editPic(index)}
                                      className="flex-1 sm:flex-none"
                                    >
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removePic(index)}
                                      className="flex-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 sm:flex-none"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                                  <div className="truncate">
                                    <span className="text-muted-foreground">
                                      Contact:{" "}
                                    </span>
                                    {pic.contactNumbers.map((num, i) => (
                                      <span key={i}>
                                        {num}
                                        {pic.contactTypes && pic.contactTypes[i]
                                          ? ` (${pic.contactTypes[i]})`
                                          : ""}
                                        {i < pic.contactNumbers.length - 1
                                          ? ", "
                                          : ""}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="truncate">
                                    <span className="text-muted-foreground">
                                      Email:{" "}
                                    </span>
                                    {pic.emails.map((email, i) => (
                                      <span key={i}>
                                        {email}
                                        {pic.emailTypes && pic.emailTypes[i]
                                          ? ` (${pic.emailTypes[i]})`
                                          : ""}
                                        {i < pic.emails.length - 1 ? ", " : ""}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {pic.birthday && (
                                  <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">
                                      Birthday:{" "}
                                    </span>
                                    {formatDateDMY(pic.birthday)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No PICs added yet
                          </p>
                        )}

                        {/* PIC Form */}
                        <div className="space-y-5 rounded-lg border bg-card p-4">
                          <h4 className="font-medium">
                            {currentPicIndex >= 0 ? "Edit PIC" : "Add New PIC"}
                          </h4>

                          {/* Title + First + Last */}
                          <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12 sm:col-span-2">
                              <Select
                                value={picForm.title || "Mr."}
                                onValueChange={(val) =>
                                  handlePicFormChange("title", val)
                                }
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Title" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Mr.">Mr.</SelectItem>
                                  <SelectItem value="Ms.">Ms.</SelectItem>
                                  <SelectItem value="Mrs.">Mrs.</SelectItem>
                                  <SelectItem value="Dr.">Dr.</SelectItem>
                                  <SelectItem value="Capt.">Capt.</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-12 sm:col-span-5">
                              <Input
                                value={picForm.firstName || ""}
                                onChange={(e) =>
                                  handlePicFormChange(
                                    "firstName",
                                    e.target.value
                                  )
                                }
                                placeholder="First Name"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-5">
                              <Input
                                value={picForm.lastName || ""}
                                onChange={(e) =>
                                  handlePicFormChange(
                                    "lastName",
                                    e.target.value
                                  )
                                }
                                placeholder="Last Name"
                              />
                            </div>
                          </div>

                          {/* Department */}
                          <div>
                            <Label
                              htmlFor="picDepartment"
                              className="form-label"
                            >
                              Department
                            </Label>
                            <Input
                              id="picDepartment"
                              value={picForm.department || ""}
                              onChange={(e) =>
                                handlePicFormChange(
                                  "department",
                                  e.target.value
                                )
                              }
                              placeholder="Enter department"
                            />
                          </div>

                          {/* Contact Numbers */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="form-label">
                                Contact Numbers
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPicContactNumber}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Number
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {picForm.contactNumbers?.map((number, idx) => (
                                <div
                                  key={idx}
                                  className="grid grid-cols-12 items-center gap-2"
                                >
                                  {/* Type */}
                                  <div className="col-span-12 sm:col-span-3">
                                    <Select
                                      value={
                                        picForm.contactTypes?.[idx] ||
                                        "Direct Line"
                                      }
                                      onValueChange={(val) =>
                                        handlePicFormChange("contactTypes", [
                                          ...(picForm.contactTypes?.slice(
                                            0,
                                            idx
                                          ) || []),
                                          val,
                                          ...(picForm.contactTypes?.slice(
                                            idx + 1
                                          ) || []),
                                        ])
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Direct Line">
                                          Direct Line
                                        </SelectItem>
                                        <SelectItem value="General Line">
                                          General Line
                                        </SelectItem>
                                        <SelectItem value="Land Line">
                                          Mobile
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Country code */}
                                  <div className="col-span-12 sm:col-span-3">
                                    <ShadCountryPhoneInput
                                      country="lk"
                                      value={
                                        number.startsWith("+")
                                          ? number.split(" ")[0]
                                          : "+94"
                                      }
                                      onChange={(val, data) => {
                                        const rest = number.replace(
                                          /^(\+\d+)?\s?/,
                                          ""
                                        );
                                        const dial =
                                          "+" +
                                          (typeof data === "object" &&
                                          data &&
                                          "dialCode" in data
                                            ? (data as any).dialCode
                                            : "");
                                        const updatedNumber = dial + " " + rest;
                                        updatePicContactNumber(
                                          idx,
                                          updatedNumber.trim()
                                        );
                                      }}
                                    />
                                  </div>

                                  {/* Number */}
                                  <div className="col-span-12 sm:col-span-5">
                                    <Input
                                      value={
                                        number.startsWith("+")
                                          ? number.replace(/^(\+\d+)\s?/, "")
                                          : number
                                      }
                                      onChange={(e) =>
                                        updatePicContactNumber(
                                          idx,
                                          (number.startsWith("+")
                                            ? number.split(" ")[0] + " "
                                            : "+94 ") + e.target.value
                                        )
                                      }
                                      placeholder="77 123 4567"
                                    />
                                  </div>

                                  {/* Remove */}
                                  <div className="col-span-12 sm:col-span-1 flex sm:justify-end">
                                    {picForm.contactNumbers!.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                          removePicContactNumber(idx)
                                        }
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Emails */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="form-label">
                                Email Addresses
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPicEmail}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Email
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {picForm.emails?.map((email, idx) => (
                                <div
                                  key={idx}
                                  className="grid grid-cols-12 items-center gap-2"
                                >
                                  {/* Type */}
                                  <div className="col-span-12 sm:col-span-3">
                                    <Select
                                      value={
                                        picForm.emailTypes?.[idx] || "Personal"
                                      }
                                      onValueChange={(val) =>
                                        handlePicFormChange("emailTypes", [
                                          ...(picForm.emailTypes?.slice(
                                            0,
                                            idx
                                          ) || []),
                                          val,
                                          ...(picForm.emailTypes?.slice(
                                            idx + 1
                                          ) || []),
                                        ])
                                      }
                                    >
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Personal">
                                          Personal
                                        </SelectItem>
                                        <SelectItem value="Common">
                                          Common
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Email */}
                                  <div className="col-span-12 sm:col-span-8">
                                    <Input
                                      value={email}
                                      onChange={(e) =>
                                        updatePicEmail(idx, e.target.value)
                                      }
                                      placeholder="email@company.com"
                                      type="email"
                                    />
                                  </div>

                                  {/* Remove */}
                                  <div className="col-span-12 sm:col-span-1 flex sm:justify-end">
                                    {picForm.emails!.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => removePicEmail(idx)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Birthday + Updates */}
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                              <Label
                                htmlFor="picBirthday"
                                className="form-label"
                              >
                                Birthday
                              </Label>
                              <DatePicker
                                id="picBirthday"
                                value={picForm.birthday || ""}
                                onChange={(val) =>
                                  handlePicFormChange("birthday", val)
                                }
                                placeholder="dd.mm.yyyy"
                                className="form-input"
                              />
                            </div>

                            <div className="flex items-end">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id="receiveUpdates"
                                  checked={picForm.receiveUpdates !== false}
                                  onCheckedChange={(checked) =>
                                    handlePicFormChange(
                                      "receiveUpdates",
                                      checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor="receiveUpdates"
                                  className="form-label"
                                >
                                  Receive Updates
                                </Label>
                              </div>
                            </div>
                          </div>

                          {/* Remarks */}
                          <div>
                            <Label htmlFor="picRemarks" className="form-label">
                              Remarks
                            </Label>
                            <Textarea
                              id="picRemarks"
                              value={picForm.remarks || ""}
                              onChange={(e) =>
                                handlePicFormChange("remarks", e.target.value)
                              }
                              placeholder="Additional notes about this PIC"
                              rows={2}
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-2">
                            {currentPicIndex >= 0 ? (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentPicIndex(-1);
                                    setPicForm({
                                      title: "Mr",
                                      firstName: "",
                                      lastName: "",
                                      department: "",
                                      contactNumbers: [""],
                                      contactTypes: ["Direct Line"],
                                      emails: [""],
                                      emailTypes: ["Personal"],
                                      birthday: "",
                                      remarks: "",
                                      receiveUpdates: true,
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={updatePicInCustomer}
                                  className="professional-button-primary"
                                  disabled={
                                    !picForm.firstName?.trim() ||
                                    !picForm.lastName?.trim()
                                  }
                                >
                                  Update PIC
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={addPicToCustomer}
                                className="professional-button-primary"
                                disabled={
                                  !picForm.firstName?.trim() ||
                                  !picForm.lastName?.trim()
                                }
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Add PIC
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddCustomerOpen(false);
                            setEditingCustomer(null);
                            setCustomerForm({
                              companyName: "",
                              address: "",
                              landlineCountryCode: "+94",
                              landlineNumber: "",
                              groupEmails: [""],
                              companyType: ["Owners"],
                              remarks: "",
                              pics: [],
                            });
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveCustomer}
                          className="professional-button-primary"
                          disabled={
                            loading || !customerForm.companyName?.trim()
                          }
                        >
                          {loading
                            ? "Saving..."
                            : editingCustomer
                            ? "Update Customer"
                            : "Add Customer"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search customers or PICs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full" // Changed to w-full for better responsiveness
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-auto">
                    {" "}
                    {/* Added wrapper for better control */}
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        {" "}
                        {/* Made full width on mobile */}
                        <SelectValue placeholder="Company Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="owners">Owners</SelectItem>
                        <SelectItem value="managers">Managers</SelectItem>
                        <SelectItem value="charterers">Charterers</SelectItem>
                        <SelectItem value="bunker traders">
                          Bunker Traders
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="loading-skeleton w-8 h-8 rounded-full"></div>
                </div>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="professional-card hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
                        {/* Info section */}
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">
                              {customer.companyName}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {Array.isArray(customer.companyType) &&
                              customer.companyType.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                  {customer.companyType.map((type, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="whitespace-nowrap"
                                    >
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="whitespace-nowrap"
                                >
                                  Not specified
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                {customer.pics.length} PICs
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {/* Action buttons: wrap and stack on mobile */}
                        <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                            className="flex-1 sm:flex-none min-w-[90px]"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            <span className="hidden xs:inline">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editCustomer(customer)}
                            className="flex-1 sm:flex-none min-w-[90px]"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomerToDelete(customer);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-1 sm:flex-none min-w-[50px]"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>

                      {/* Responsive grid for customer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Address
                            </p>
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {customer.address}
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
                              {customer.landlineCountryCode}{" "}
                              {customer.landlineNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Emails
                            </p>
                            <p className="font-medium text-xs sm:text-sm truncate">
                              {customer.groupEmails.length} addresses
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Responsive grid for statistics */}
                      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Total Port Calls
                          </p>
                          <p className="font-semibold text-base sm:text-lg">
                            {customer.totalPortCalls}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Active Port Calls
                          </p>
                          <p className="font-semibold text-base sm:text-lg text-primary">
                            {customer.activePortCalls}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Last Updated
                          </p>
                          <p className="font-medium text-xs sm:text-sm">
                            {formatDateDMY(customer.lastUpdated)}
                          </p>
                        </div>
                      </div> */}

                      {customer.remarks && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {customer.remarks}
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
                      No customers found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || typeFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No customers registered yet"}
                    </p>
                    <Button
                      onClick={() => setIsAddCustomerOpen(true)}
                      className="professional-button-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-destructive">
                  {customerToDelete?.companyName + " "}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (customerToDelete) {
                    deleteCustomer(customerToDelete.id);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Company
                  </span>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedCustomer.companyName}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pics">
                      PICs ({selectedCustomer.pics.length})
                    </TabsTrigger>
                    {/* <TabsTrigger value="history">Port Call History</TabsTrigger> */}
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card className="professional-card">
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Company Type
                            </Label>
                            {Array.isArray(selectedCustomer.companyType) &&
                            selectedCustomer.companyType.length > 0 ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedCustomer.companyType.map(
                                  (type, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="whitespace-nowrap"
                                    >
                                      {type}
                                    </Badge>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">
                                Not specified
                              </p>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p>
                              {selectedCustomer.landlineCountryCode}{" "}
                              {selectedCustomer.landlineNumber}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p>{selectedCustomer.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Group Emails
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCustomer.groupEmails &&
                            selectedCustomer.groupEmails.length > 0 ? (
                              selectedCustomer.groupEmails.map(
                                (email, index) => (
                                  <Badge key={index} variant="outline">
                                    {email}
                                  </Badge>
                                )
                              )
                            ) : (
                              <span className="text-muted-foreground">
                                None
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedCustomer.remarks && (
                          <div>
                            <Label className="text-sm font-medium">
                              Remarks
                            </Label>
                            <p className="text-muted-foreground">
                              {selectedCustomer.remarks}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pics" className="space-y-4">
                    {selectedCustomer.pics.map((pic) => (
                      <Card key={pic.id} className="professional-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h3 className="font-medium">{pic.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {pic.department}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {pic.receiveUpdates && (
                                <Badge variant="secondary" className="text-xs">
                                  Receives Updates
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Birthday: {formatDateDMY(pic.birthday)}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">
                                Contact Numbers
                              </Label>
                              <div className="space-y-1">
                                {pic.contactNumbers.map((number, index) => (
                                  <p key={index} className="text-sm">
                                    {number}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">
                                Email Addresses
                              </Label>
                              <div className="space-y-1">
                                {pic.emails.map((email, index) => (
                                  <p key={index} className="text-sm">
                                    {email}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>

                          {pic.remarks && (
                            <div className="mt-3 pt-3 border-t">
                              <Label className="text-sm font-medium">
                                Remarks
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {pic.remarks}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="history">
                    <Card className="professional-card">
                      <CardHeader>
                        <CardTitle>Port Call History</CardTitle>
                        <CardDescription>
                          Recent vessel operations for this customer
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Port call history will be displayed here
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
