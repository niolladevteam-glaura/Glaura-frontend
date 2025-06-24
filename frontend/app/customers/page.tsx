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
  MoreHorizontal,
  LogOut,
  Anchor,
  Cake,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080";
const API_ENDPOINTS = {
  CUSTOMERS: `${API_BASE_URL}/customer`,
  CUSTOMER: (id: string) => `${API_BASE_URL}/customer/${id}`,
};
interface PIC {
  id: string;
  name: string;
  department: string;
  contactNumbers: string[];
  emails: string[];
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
  companyType: "Owners" | "Managers" | "Charterers" | "Bunker Traders";
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
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({
    companyName: "",
    address: "",
    landlineCountryCode: "+94",
    landlineNumber: "",
    groupEmails: [""],
    companyType: "Owners",
    remarks: "",
    pics: [],
  });

  // PIC Form States
  const [currentPicIndex, setCurrentPicIndex] = useState<number>(-1); // -1 = new PIC, >=0 = editing existing
  const [picForm, setPicForm] = useState<Partial<PIC>>({
    name: "",
    department: "",
    contactNumbers: [""],
    emails: [""],
    birthday: "",
    remarks: "",
    receiveUpdates: true,
  });

  // PIC form handlers
  const handlePicFormChange = (field: string, value: any) => {
    setPicForm((prev) => ({ ...prev, [field]: value }));
  };

  const addPicToCustomer = () => {
    if (!picForm.name?.trim()) {
      alert("Please enter PIC name");
      return;
    }

    const newPic: PIC = {
      id: Date.now().toString(),
      name: picForm.name || "",
      department: picForm.department || "",
      contactNumbers: picForm.contactNumbers?.filter((num) => num.trim()) || [],
      emails: picForm.emails?.filter((email) => email.trim()) || [],
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
      name: "",
      department: "",
      contactNumbers: [""],
      emails: [""],
      birthday: "",
      remarks: "",
      receiveUpdates: true,
    });
    setCurrentPicIndex(-1);
  };

  const updatePicInCustomer = () => {
    if (currentPicIndex === -1) return;
    if (!picForm.name?.trim()) {
      alert("Please enter PIC name");
      return;
    }

    setCustomerForm((prev) => {
      const updatedPics = [...(prev.pics || [])];
      updatedPics[currentPicIndex] = {
        ...updatedPics[currentPicIndex],
        name: picForm.name || "",
        department: picForm.department || "",
        contactNumbers:
          picForm.contactNumbers?.filter((num) => num.trim()) || [],
        emails: picForm.emails?.filter((email) => email.trim()) || [],
        birthday: picForm.birthday || "",
        remarks: picForm.remarks || "",
        receiveUpdates: picForm.receiveUpdates !== false,
      };
      return { ...prev, pics: updatedPics };
    });

    // Reset PIC form
    setPicForm({
      name: "",
      department: "",
      contactNumbers: [""],
      emails: [""],
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
        name: pic.name,
        department: pic.department,
        contactNumbers: [...pic.contactNumbers, ""].filter(Boolean),
        emails: [...pic.emails, ""].filter(Boolean),
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
        name: "",
        department: "",
        contactNumbers: [""],
        emails: [""],
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

      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

      if (options.body && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
      }

      // First check for 401 unauthorized
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }

      // Then check for other error statuses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // If we can't parse JSON, use the status text
          throw new Error(response.statusText || "Request failed");
        }
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }

      // Try to parse JSON for successful responses
      try {
        return await response.json();
      } catch (e) {
        throw new Error("Invalid JSON response from server");
      }
    } catch (error: any) {
      console.error("API Error:", error);
      toast({
        title: "API Error",
        description: error.message || "Failed to complete request",
        variant: "destructive",
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
              name: pic.name || "Unknown",
              department: pic.department || "",
              contactNumbers: pic.phone_number
                ? pic.phone_number.split(",").map((n: string) => n.trim())
                : [],
              emails: pic.email
                ? pic.email.split(",").map((e: string) => e.trim())
                : [],
              birthday: pic.birthday || "",
              remarks: pic.remark || "",
              receiveUpdates: Boolean(pic.receiveUpdates),
            });
          }

          return {
            id: apiCustomer.customer_id,
            companyName: apiCustomer.company_name,
            address: apiCustomer.address,
            landlineCountryCode: phoneParts[0] || "+94",
            landlineNumber: phoneParts.slice(1).join(" ") || "",
            groupEmails: apiCustomer.email
              ? apiCustomer.email.split(",").map((e: string) => e.trim())
              : [],
            companyType: apiCustomer.company_type,
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
      filtered = filtered.filter(
        (customer) => customer.companyType.toLowerCase() === typeFilter
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
    }));
  };

  const addPicEmail = () => {
    setPicForm((prev) => ({
      ...prev,
      emails: [...(prev.emails || []), ""],
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

      // Clean phone numbers by removing non-digit characters except '+'
      const cleanPhoneNumber = (phone: string) =>
        phone.replace(/[^\d+]/g, "").trim();

      // Prepare PIC data correctly
      const picData = customerForm.pics?.[0]
        ? {
            name: customerForm.pics[0].name,
            department: customerForm.pics[0].department,
            phone_number: cleanPhoneNumber(
              customerForm.pics[0].contactNumbers?.[0] || ""
            ),
            email: customerForm.pics[0].emails?.[0] || "",
            birthday: customerForm.pics[0].birthday,
            remark: customerForm.pics[0].remarks,
            receiveUpdates: customerForm.pics[0].receiveUpdates,
          }
        : null;

      // Prepare payload matching backend structure
      const payload = {
        company_name: customerForm.companyName,
        address: customerForm.address,
        phone_number: cleanPhoneNumber(
          `${customerForm.landlineCountryCode} ${customerForm.landlineNumber}`
        ),
        company_type: customerForm.companyType,
        email: customerForm.groupEmails?.[0] || "",
        remark: customerForm.remarks,
        pic: picData, // Corrected key name to "pic"
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

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

      // Reset form and close modal
      setCustomerForm({
        companyName: "",
        address: "",
        landlineCountryCode: "+94",
        landlineNumber: "",
        groupEmails: [""],
        companyType: "Owners",
        remarks: "",
        pics: [],
      });
      setEditingCustomer(null);
      setIsAddCustomerOpen(false);
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

      // Make the API call to delete the customer
      await apiCall(API_ENDPOINTS.CUSTOMER(customerId), {
        method: "DELETE",
      });

      // Update local state to remove the deleted customer
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setFilteredCustomers((prev) => prev.filter((c) => c.id !== customerId));

      // Close the dialog
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);

      console.log("Customer deleted successfully");
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-primary p-2 rounded-xl">
                  <Anchor className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">
                    Customer Companies
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Manage client relationships
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
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
                          {alert.birthday.toLocaleDateString()}
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
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Active Port Calls
                  </span>
                  <span className="font-medium">
                    {customers.reduce((sum, c) => sum + c.activePortCalls, 0)}
                  </span>
                </div>
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
                              <Label
                                htmlFor="companyType"
                                className="form-label"
                              >
                                Company Type
                              </Label>
                              <Select
                                value={customerForm.companyType}
                                onValueChange={(value) =>
                                  handleCustomerFormChange("companyType", value)
                                }
                              >
                                <SelectTrigger className="form-input">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Owners">Owners</SelectItem>
                                  <SelectItem value="Managers">
                                    Managers
                                  </SelectItem>
                                  <SelectItem value="Charterers">
                                    Charterers
                                  </SelectItem>
                                  <SelectItem value="Bunker Traders">
                                    Bunker Traders
                                  </SelectItem>
                                </SelectContent>
                              </Select>
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
                              <Input
                                id="landlineCountryCode"
                                value={customerForm.landlineCountryCode || ""}
                                onChange={(e) =>
                                  handleCustomerFormChange(
                                    "landlineCountryCode",
                                    e.target.value
                                  )
                                }
                                placeholder="+94"
                                className="form-input"
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
                      <div className="space-y-4 pt-6 border-t">
                        <h3 className="text-lg font-medium">
                          Persons In Charge (PICs)
                        </h3>

                        {/* Display existing PICs */}
                        {customerForm.pics?.length ? (
                          <div className="space-y-3">
                            {customerForm.pics.map((pic, index) => (
                              <div
                                key={pic.id}
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-medium">{pic.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {pic.department}
                                    </p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editPic(index)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removePic(index)}
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Contact:{" "}
                                    </span>
                                    {pic.contactNumbers.join(", ")}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Email:{" "}
                                    </span>
                                    {pic.emails.join(", ")}
                                  </div>
                                </div>
                                {pic.birthday && (
                                  <div className="text-sm mt-1">
                                    <span className="text-muted-foreground">
                                      Birthday:{" "}
                                    </span>
                                    {new Date(
                                      pic.birthday
                                    ).toLocaleDateString()}
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
                        <div className="space-y-4 pt-4 border-t">
                          <h4 className="font-medium">
                            {currentPicIndex >= 0 ? "Edit PIC" : "Add New PIC"}
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="picName" className="form-label">
                                Name *
                              </Label>
                              <Input
                                id="picName"
                                value={picForm.name || ""}
                                onChange={(e) =>
                                  handlePicFormChange("name", e.target.value)
                                }
                                placeholder="Enter PIC name"
                                className="form-input"
                              />
                            </div>
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
                                className="form-input"
                              />
                            </div>
                          </div>

                          {/* Contact Numbers */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="form-label">
                                Contact Numbers
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPicContactNumber}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Number
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {picForm.contactNumbers?.map((number, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={number}
                                    onChange={(e) =>
                                      updatePicContactNumber(
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="+94 77 123 4567"
                                    className="form-input"
                                  />
                                  {picForm.contactNumbers!.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        removePicContactNumber(index)
                                      }
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Emails */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="form-label">
                                Email Addresses
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPicEmail}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Email
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {picForm.emails?.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={email}
                                    onChange={(e) =>
                                      updatePicEmail(index, e.target.value)
                                    }
                                    placeholder="email@company.com"
                                    className="form-input"
                                    type="email"
                                  />
                                  {picForm.emails!.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removePicEmail(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="picBirthday"
                                className="form-label"
                              >
                                Birthday
                              </Label>
                              <Input
                                id="picBirthday"
                                type="date"
                                value={picForm.birthday || ""}
                                onChange={(e) =>
                                  handlePicFormChange(
                                    "birthday",
                                    e.target.value
                                  )
                                }
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
                              className="form-input"
                              rows={2}
                            />
                          </div>

                          <div className="flex justify-end pt-2">
                            {currentPicIndex >= 0 ? (
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentPicIndex(-1);
                                    setPicForm({
                                      name: "",
                                      department: "",
                                      contactNumbers: [""],
                                      emails: [""],
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
                                  disabled={!picForm.name?.trim()}
                                >
                                  Update PIC
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={addPicToCustomer}
                                className="professional-button-primary"
                                disabled={!picForm.name?.trim()}
                              >
                                <Plus className="h-4 w-4 mr-2" />
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
                              companyType: "Owners",
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
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-3 rounded-xl">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {customer.companyName}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">
                                {customer.companyType}
                              </Badge>
                              <Badge variant="secondary">
                                {customer.pics.length} PICs
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editCustomer(customer)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCustomerToDelete(customer);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Address
                            </p>
                            <p className="font-medium text-sm">
                              {customer.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Phone
                            </p>
                            <p className="font-medium">
                              {customer.landlineCountryCode}{" "}
                              {customer.landlineNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Emails
                            </p>
                            <p className="font-medium text-sm">
                              {customer.groupEmails.length} addresses
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Total Port Calls
                          </p>
                          <p className="font-semibold text-lg">
                            {customer.totalPortCalls}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Active Port Calls
                          </p>
                          <p className="font-semibold text-lg text-primary">
                            {customer.activePortCalls}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Last Updated
                          </p>
                          <p className="font-medium">
                            {new Date(
                              customer.lastUpdated
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

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
                    <TabsTrigger value="history">Port Call History</TabsTrigger>
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
                            <p>{selectedCustomer.companyType}</p>
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
                            {selectedCustomer.groupEmails.map(
                              (email, index) => (
                                <Badge key={index} variant="outline">
                                  {email}
                                </Badge>
                              )
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
                                Birthday:{" "}
                                {new Date(pic.birthday).toLocaleDateString()}
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
function toast(arg0: { title: string; description: any; variant: string }) {
  throw new Error("Function not implemented.");
}
