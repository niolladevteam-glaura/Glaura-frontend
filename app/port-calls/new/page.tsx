"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/TimePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Ship,
  X,
  Plus,
  Users,
  Anchor,
  Loader2,
  Building,
  House,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { format } from "date-fns";
import { Toaster } from "sonner";
import { toast } from "sonner";

// API Configuration - Replace with your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API Endpoints
const API_ENDPOINTS = {
  SERVICES: `${API_BASE_URL}/service`,
  PORTS: `${API_BASE_URL}/port`,
  FORMALITY_STATUS: `${API_BASE_URL}/sof`,
  VENDORS: `${API_BASE_URL}/vendor`,
  PORT_CALLS: `${API_BASE_URL}/portcall`,
  CLIENTS: `${API_BASE_URL}/customer`,
  VESSEL: `${API_BASE_URL}/vessel`,
  CUSTOMER_PIC: `${API_BASE_URL}/customerpic`,
};

interface Customer {
  customer_id: string;
  company_name: string;
  address: string;
  phone_number: string;
  company_type: string;
  email: string;
  remark: string;
  customerPic: {
    pic_id: string;
    name: string;
    phone_number: string;
    email: string;
    department: string;
  };
}

interface CustomerPic {
  pic_id: string;
  customer_id: string;
  firstName: string;
  lastName: string;
  phone_number: string;
  email: string;
  birthday: string;
  receiveUpdates: boolean;
  department: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
}

interface Vessel {
  vessel_name: string;
  imo_number: string;
  SSCEC_expires: string;
  company: string;
  vessel_type: string;
  flag: string;
  call_sign: string;
  build_year: number;
  grt: number;
  dwt: number;
  loa: number;
  nrt: number;
  p_and_i_club: string;
  remark: string;
}

interface PortCall {
  vesselName: string;
  imo: string;
  vesselType: string;
  grt: string;
  nrt: string;
  flag: string;
  callSign: string;
  loa: string;
  dwt: string;
  builtYear: string;
  sscecExpiry: string;
  clientCompany: string;
  agencyName: string;
  eta: string;
  assignedPIC: string;
  port: string;
  formalityStatus: string;
  piClub: string;
  remarks: string;
  services: SelectedService[];
  createdBy: string;
  createdAt: string;
  status: string;
}

interface VesselAPIResponse {
  success: boolean;
  data: {
    vessel_id: string;
    vessel_name: string;
    imo_number: string;
    SSCEC_expires: string;
    build_year: number;
    call_sign: string;
    company: string;
    vessel_type: string;
    flag: string;
    grt: number;
    dwt: number;
    loa: number;
    nrt: number;
    p_and_i_club: string;
    remark: string;
  };
}

interface StatusOfFormality {
  id: string;
  status_of_formalities: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StatusOfFormalityResponse {
  success: boolean;
  message: string;
  data: StatusOfFormality | StatusOfFormality[];
}

interface CustomerPic {
  pic_id: string;
  customer_id: string;
  name: string;
  phone_number: string;
  email: string;
  birthday: string;
  receiveUpdates: boolean;
  department: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerPicResponse {
  success: boolean;
  data: CustomerPic[];
}

interface SelectedService {
  name: string;
  vendor?: string;
  vendorId?: string;
}

interface Service {
  id: number;
  service_id: string;
  service_name: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
}

interface Port {
  port_id: string;
  port_name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  department: string;
  email: string;
}

interface PortsResponse {
  success: boolean;
  message: string;
  data: Port[];
}

interface Client {
  value: string;
  label: string;
}

interface VendorService {
  id: number;
  vendor_id: string;
  service_name: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorStatus {
  id: number;
  status_id: string;
  vendor_id: string;
  status: string | boolean;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  vendor_id?: string;
  name: string;
  category: string;
  vendorServices?: VendorService[];
  vendorStatus?: VendorStatus | VendorStatus[];
}

export default function NewPortCall() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vesselId: "",
    vesselName: "",
    imo: "",
    vesselType: "",
    grt: "",
    nrt: "",
    flag: "",
    callSign: "",
    loa: "",
    dwt: "",
    builtYear: "",
    sscecExpiry: "",
    clientCompany: "",
    sectionHead: "",
    sectionHeadName: "",
    sectionHeadEmail: "",
    eta: "",
    etaDate: "",
    etaTime: "",
    formalityStatus: "",
    priority: "",
    remarks: "",
    port: "",
    piClub: "",
    pic: {
      pic_id: "",
      customerPIC: "",
      email: "",
    },
  });
  const [loadingVessel, setLoadingVessel] = useState(false);
  const [vesselError, setVesselError] = useState<string | null>(null);

  // Dynamic data
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  );
  const [serviceSearch, setServiceSearch] = useState("");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [clients, setClients] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [vesselTypes, setVesselTypes] = useState<string[]>([
    "Container Ship",
    "Bulk Carrier",
    "Tanker",
    "General Cargo",
    "RoRo",
    "Cruise Ship",
    "Ferry",
    "Offshore Vessel",
  ]);
  const [formalityStatuses, setFormalityStatuses] = useState<string[]>([
    "Pre-Arrival Message",
    "Port Clearance Pending",
    "Immigration Clearance",
    "Customs Clearance",
    "Health Clearance",
    "All Formalities Complete",
  ]);
  const [customerPICs, setCustomerPICs] = useState<CustomerPic[]>([]);
  const [customerPICOptions, setCustomerPICOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      name: "Lanka Marine Services",
      category: "Launch Boat Services",
    },
    { id: "2", name: "Ceylon Transport Solutions", category: "Transport" },
    { id: "3", name: "Port Clearance Experts", category: "Clearance Agent" },
    { id: "4", name: "Marine Supply Co.", category: "Supply" },
    {
      id: "5",
      name: "Underwater Services Ltd",
      category: "Underwater Services",
    },
    { id: "6", name: "Bunker Solutions", category: "Bunkering" },
    { id: "7", name: "Ship Repair Specialists", category: "Repairs" },
    { id: "8", name: "Medical Services Lanka", category: "Medical" },
  ]);
  const [isAddingPort, setIsAddingPort] = useState(false);
  const [isAddingFormalityStatus, setIsAddingFormalityStatus] = useState(false);
  const [location, setLocation] = useState("");

  // Modal states
  const [newServiceName, setNewServiceName] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [showExceptionVendor, setShowExceptionVendor] = useState(false);
  const [exceptionVendorName, setExceptionVendorName] = useState("");
  const [exceptionVendorLoading, setExceptionVendorLoading] = useState(false);
  const [newPortName, setNewPortName] = useState("");
  const [newFormalityStatus, setNewFormalityStatus] = useState("");
  const [isAddPortOpen, setIsAddPortOpen] = useState(false);
  const [isAddFormalityOpen, setIsAddFormalityOpen] = useState(false);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);
  // Restore from localStorage on mount
  useEffect(() => {
    if (!restoredFromStorage) {
      const savedFormData = localStorage.getItem("portCallFormData");
      if (savedFormData) setFormData(JSON.parse(savedFormData));
      const savedServices = localStorage.getItem("portCallSelectedServices");
      if (savedServices) setSelectedServices(JSON.parse(savedServices));
      setRestoredFromStorage(true);
    }
  }, [restoredFromStorage]);
  const [users, setUsers] = useState<User[]>([]);
  const [sectionHeadOptions, setSectionHeadOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Only persist after initial restore
  useEffect(() => {
    if (restoredFromStorage) {
      localStorage.setItem("portCallFormData", JSON.stringify(formData));
    }
  }, [formData, restoredFromStorage]);

  useEffect(() => {
    if (restoredFromStorage) {
      localStorage.setItem(
        "portCallSelectedServices",
        JSON.stringify(selectedServices),
      );
    }
  }, [selectedServices, restoredFromStorage]);

  const priorities = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Permission check for creating port calls
    // let hasPermission = false;
    // if (user.permissions) {
    //   if (Array.isArray(user.permissions)) {
    //     hasPermission = user.permissions.includes("create_port_calls");
    //   } else if (typeof user.permissions === "object") {
    //     hasPermission = !!user.permissions["create_port_calls"];
    //   }
    // }
    // if (!hasPermission) {
    //   toast.error("Access Denied", {
    //     description: "You do not have permission to create port calls.",
    //     duration: 4000,
    //   });
    //   router.push("/dashboard");
    //   return;
    // }
  }, [router]);

  const handleCancel = () => {
    // Reset state
    setFormData({
      vesselId: "",
      vesselName: "",
      imo: "",
      vesselType: "",
      grt: "",
      nrt: "",
      flag: "",
      callSign: "",
      loa: "",
      dwt: "",
      builtYear: "",
      sscecExpiry: "",
      clientCompany: "",
      sectionHead: "",
      sectionHeadName: "",
      sectionHeadEmail: "",
      eta: "",
      etaDate: "",
      etaTime: "",
      formalityStatus: "",
      priority: "",
      remarks: "",
      port: "",
      piClub: "",
      pic: {
        pic_id: "",
        customerPIC: "",
        email: "",
      },
    });
    setSelectedServices([]);
    // Remove from localStorage
    localStorage.removeItem("portCallFormData");
    localStorage.removeItem("portCallSelectedServices");
    toast("Form Cleared", {
      description: "Port call form has been cleared.",
      duration: 3000,
    });
    router.push("/dashboard");
  };

  const handleClearFormFields = () => {
    setFormData({
      vesselId: "",
      vesselName: "",
      imo: "",
      vesselType: "",
      grt: "",
      nrt: "",
      flag: "",
      callSign: "",
      loa: "",
      dwt: "",
      builtYear: "",
      sscecExpiry: "",
      clientCompany: "",
      sectionHead: "",
      sectionHeadName: "",
      sectionHeadEmail: "",
      eta: "",
      etaDate: "",
      etaTime: "",
      formalityStatus: "",
      priority: "",
      remarks: "",
      port: "",
      piClub: "",
      pic: {
        pic_id: "",
        customerPIC: "",
        email: "",
      },
    });
    setSelectedServices([]);
    toast("Form Fields Cleared", {
      description: "All form fields have been reset.",
      duration: 3000,
    });
  };

  // Load ports when component mounts
  useEffect(() => {
    const loadPorts = async () => {
      const portList = await fetchPorts();
      setPorts(portList);
    };
    loadPorts();
  }, []);

  // Load clients when component mounts
  useEffect(() => {
    const loadClients = async () => {
      const clientList = await fetchClients();
      setClients(clientList);
    };
    loadClients();
  }, []);

  // Load statuses when component mounts
  useEffect(() => {
    const loadFormalityStatuses = async () => {
      const statusList = await fetchFormalityStatuses();
      setFormalityStatuses(statusList);
    };
    loadFormalityStatuses();
  }, []);

  // Fetch all customer PICs and set options
  useEffect(() => {
    fetchCustomerPics().then((pics: CustomerPic[]) => {
      setCustomerPICs(pics);
      setCustomerPICOptions(
        pics.map((pic) => ({
          value: pic.pic_id,
          label: `${pic.firstName} ${pic.lastName}`,
        })),
      );
    });
  }, []);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/user`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          setUsers(json.data);
          setSectionHeadOptions(
            json.data.map((u: User) => ({
              value: String(u.id),
              label: `${u.first_name} ${u.last_name} (${u.department})`,
            })),
          );
        }
      } catch (err) {
        console.log(`error ${err}`);
      }
    }
    fetchAllUsers();
  }, []);

  // API Functions - Replace these with your actual API calls
  const apiCall = async <T = any,>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> => {
    try {
      const token = localStorage.getItem("token");
      const headers = new Headers({
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      });

      const response = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error("API Error Details:", {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            errorData,
          });
        } catch (e) {
          console.error("API Error (no JSON):", {
            status: response.status,
            statusText: response.statusText,
            endpoint,
          });
        }
        throw new Error(
          errorData?.message || `Request failed with status ${response.status}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Full API Error:", {
        message: error.message,
        stack: error.stack,
        endpoint,
        options,
      });
      throw error;
    }
  };

  const addPortToDatabase = async (portName: string): Promise<Port> => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${API_ENDPOINTS.PORTS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ port_name: portName }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add port");
    }
    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || "Failed to add port");
    }
    return responseData.data;
  };

  // Fetch all statuses
  const fetchFormalityStatuses = async (): Promise<string[]> => {
    try {
      const response = await apiCall<any>(API_ENDPOINTS.FORMALITY_STATUS);
      if (response.success && response.data) {
        const statuses = Array.isArray(response.data)
          ? response.data
          : [response.data];
        return statuses.map((status: any) => status.status_of_formalities);
      }
      return [];
    } catch (error) {
      // toast.error("Error", {
      //   description: "Failed to load formality statuses",
      //   duration: 3000,
      // });
      return [];
    }
  };

  const fetchCustomerPic = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const response = await apiCall<CustomerPicResponse>(
        API_ENDPOINTS.CUSTOMER_PIC,
      );

      if (response.success && Array.isArray(response.data)) {
        return response.data.map((pic) => ({
          value: pic.pic_id,
          label: pic.name,
        }));
      }

      return [];
    } catch (error) {
      console.error("Failed to fetch customer PIC:", error);
      toast.error("Error", {
        description: "Failed to load customer PICs",
        duration: 3000,
      });
      return [];
    }
  };

  // Add new status
  const addFormalityStatusToDatabase = async (statusName: string) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");
    const response = await fetch(`${API_ENDPOINTS.FORMALITY_STATUS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status_of_formalities: statusName }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to add status");
    }
    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(responseData.message || "Failed to add status");
    }
    return responseData.data;
  };

  // API functions for the port call page
  const fetchVesselByIMO = async (imo: string) => {
    if (!imo) return null;
    try {
      setLoadingVessel(true);
      setVesselError(null);
      const response = await apiCall<any>(`${API_ENDPOINTS.VESSEL}/imo/${imo}`);
      return response;
    } catch (error: any) {
      setVesselError(error.message || "Failed to fetch vessel data");
      return null;
    } finally {
      setLoadingVessel(false);
    }
  };

  const fetchServices = async (): Promise<Service[]> => {
    try {
      const response = await apiCall<{ data: Service[] }>(
        API_ENDPOINTS.SERVICES,
      );
      return response.data || [];
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load services",
        duration: 3000,
      });
      return [];
    }
  };

  // Fetch all ports
  const fetchPorts = async (): Promise<{ value: string; label: string }[]> => {
    try {
      const response = await apiCall<any>(API_ENDPOINTS.PORTS);
      if (response.success && response.data) {
        return response.data.map((port: Port) => ({
          value: port.port_id,
          label: port.port_name,
        }));
      }
      return [];
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load ports",
        duration: 3000,
      });
      return [];
    }
  };

  const fetchClients = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const response = await apiCall<any>(API_ENDPOINTS.CLIENTS);
      if (response.success && response.data) {
        return response.data.map((customer: any) => ({
          value: customer.customer_id,
          label: customer.company_name,
        }));
      }
      return [];
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load clients",
        duration: 3000,
      });
      return [];
    }
  };

  const fetchCustomerPics = async (): Promise<CustomerPic[]> => {
    try {
      const response = await apiCall<any>(API_ENDPOINTS.CUSTOMER_PIC);
      if (response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load customer PICs",
        duration: 3000,
      });
      return [];
    }
  };

  const fetchVendors = async (): Promise<Vendor[]> => {
    try {
      const response = await apiCall<{ data: Vendor[] }>(API_ENDPOINTS.VENDORS);
      return response.data || vendors;
    } catch (error) {
      return vendors;
    }
  };

  const createPortCall = async (portCallData: any): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      const headers = new Headers({
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      });

      console.log(
        "Sending port call data:",
        JSON.stringify(portCallData, null, 2),
      );

      const response = await fetch(API_ENDPOINTS.PORT_CALLS, {
        method: "POST",
        headers,
        body: JSON.stringify(portCallData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error details:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData.message || "Failed to create port call");
      }

      return await response.json();
    } catch (error) {
      console.error("Full API Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        portCallData,
      });
      throw error;
    }
  };

  const handleIMONumberChange = async (imo: string) => {
    handleInputChange("imo", imo);
    if (imo.length >= 4) {
      const response = await fetchVesselByIMO(imo);
      if (response && response.data) {
        // Match vessel_type to your select options (case insensitive)
        const apiVesselType = response.data.vessel_type || "";
        const matchedVesselType =
          vesselTypes.find(
            (t) => t.toLowerCase() === apiVesselType.toLowerCase(),
          ) || "";

        setFormData((prev) => ({
          ...prev,
          vesselId: response.data.vessel_id || "",
          vesselName: response.data.vessel_name || prev.vesselName,
          vesselType: matchedVesselType,
          flag: response.data.flag || prev.flag,
          callSign: response.data.call_sign || prev.callSign,
          builtYear: response.data.build_year
            ? String(response.data.build_year)
            : prev.builtYear,
          grt: response.data.grt ? String(response.data.grt) : prev.grt,
          dwt: response.data.dwt ? String(response.data.dwt) : prev.dwt,
          loa: response.data.loa ? String(response.data.loa) : prev.loa,
          nrt: response.data.nrt ? String(response.data.nrt) : prev.nrt,
          sscecExpiry: response.data.SSCEC_expires
            ? format(new Date(response.data.SSCEC_expires), "yyyy-MM-dd")
            : prev.sscecExpiry,
          piClub: response.data.p_and_i_club || prev.piClub,
          remarks: response.data.remark || prev.remarks,
        }));
      }
    }
  };

  // Load initial data from API
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [services, ports, clients, vendors, statuses, pics] =
        await Promise.all([
          fetchServices(),
          fetchPorts(),
          fetchClients(),
          fetchVendors(),
          fetchFormalityStatuses(),
          fetchCustomerPics(),
        ]);
      setAvailableServices(services);
      setPorts(ports);
      setClients(clients);
      setVendors(vendors);
      setFormalityStatuses(statuses);
      setCustomerPICs(pics);
      setCustomerPICOptions(
        pics.map((pic) => ({
          value: pic.pic_id,
          label: `${pic.firstName} ${pic.lastName}`,
        })),
      );
    } catch (error) {
      // already handled
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
    if (!restoredFromStorage) {
      // Only load initial API data if not restoring from storage
      loadInitialData();
    }
  }, [router, restoredFromStorage]);

  const handleInputChange = (field: string, value: string) => {
    if (field === "location") {
      setLocation(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handlePicChange = (pic_id: string) => {
    const selected = customerPICs.find((pic) => pic.pic_id === pic_id);
    setFormData((prev) => ({
      ...prev,
      pic: {
        pic_id,
        customerPIC: selected
          ? `${selected.firstName} ${selected.lastName}`
          : "",
        email: selected?.email || "",
      },
    }));
  };

  const handleServiceToggle = (service: string) => {
    const isSelected = selectedServices.some((s) => s.name === service);
    if (isSelected) {
      setSelectedServices((prev) => prev.filter((s) => s.name !== service));
    } else {
      setCurrentService(service);
      setIsVendorModalOpen(true);
    }
  };

  const handleVendorSelection = async () => {
    if (showExceptionVendor && exceptionVendorName.trim()) {
      setExceptionVendorLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/exception-vendors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ vendorName: exceptionVendorName.trim() }),
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.message || "Failed to create exception vendor");
        setSelectedServices((prev) => [
          ...prev,
          {
            name: currentService,
            vendor: data.data.vendor,
            vendorId: data.data.vendorId,
            isException: true,
          },
        ]);
        setIsVendorModalOpen(false);
        setSelectedVendor("");
        setCurrentService("");
        setShowExceptionVendor(false);
        setExceptionVendorName("");
      } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        } else {
          alert("Failed to create exception vendor");
        }
      } finally {
        setExceptionVendorLoading(false);
      }
      return;
    }
    if (selectedVendor) {
      const vendor = vendors.find((v) => v.id === selectedVendor);
      setSelectedServices((prev) => [
        ...prev,
        {
          name: currentService,
          vendor: vendor?.name,
          vendorId: vendor?.id,
        },
      ]);
      setIsVendorModalOpen(false);
      setSelectedVendor("");
      setCurrentService("");
      setShowExceptionVendor(false);
      setExceptionVendorName("");
    }
  };

  // Add new service function - API ready
  const addNewService = async () => {
    if (!newServiceName.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a service name",
        duration: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiCall<Service>(API_ENDPOINTS.SERVICES, {
        method: "POST",
        body: JSON.stringify({ service_name: newServiceName.trim() }),
      });
      setAvailableServices((prev) => [...prev, response]);
      setNewServiceName("");
      setIsAddServiceOpen(false);
      toast.success("Success", {
        description: "Service added successfully!",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add service",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedService = (serviceName: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.name !== serviceName));
  };

  const filteredServices = useMemo(() => {
    if (!serviceSearch) return availableServices;
    return availableServices.filter((service) =>
      service.service_name.toLowerCase().includes(serviceSearch.toLowerCase()),
    );
  }, [availableServices, serviceSearch]);

  // Add custom port function - API ready
  const addCustomPort = async () => {
    if (!newPortName.trim()) {
      alert("Please enter a port name.");
      return;
    }

    try {
      setLoading(true);

      const portValue = newPortName.toLowerCase().replace(/\s+/g, "-");
      const newPort = { value: portValue, label: newPortName.trim() };

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.PORTS, {
      //   method: 'POST',
      //   body: JSON.stringify(newPort)
      // })

      // For now, update local state
      setPorts((prev) => [...prev, newPort]);
      setNewPortName("");
      setIsAddPortOpen(false);

      console.log("Port added:", newPort);
      alert("Port added successfully!");
    } catch (error) {
      console.error("Failed to add port:", error);
      alert("Failed to add port. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add custom formality status function - API ready
  const addCustomFormalityStatus = async () => {
    if (!newFormalityStatus.trim()) {
      alert("Please enter a formality status.");
      return;
    }

    if (formalityStatuses.includes(newFormalityStatus.trim())) {
      alert("This formality status already exists.");
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.FORMALITY_STATUS, {
      //   method: 'POST',
      //   body: JSON.stringify({ name: newFormalityStatus.trim() })
      // })

      // For now, update local state
      setFormalityStatuses((prev) => [...prev, newFormalityStatus.trim()]);
      setNewFormalityStatus("");
      setIsAddFormalityOpen(false);

      console.log("Formality status added:", newFormalityStatus.trim());
      alert("Formality status added successfully!");
    } catch (error) {
      console.error("Failed to add formality status:", error);
      alert("Failed to add formality status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit port call function - API ready
  const handleSubmit = async () => {
    console.log("handleSubmit called", { formData, selectedServices });

    try {
      setLoading(true);
      console.log("Step 1: Loading set to true");

      // Required fields check
      if (!formData.vesselName || !formData.clientCompany || !formData.port) {
        console.error("Step 2: Required fields missing", {
          vesselName: formData.vesselName,
          clientCompany: formData.clientCompany,
          port: formData.port,
        });
        throw new Error("Vessel name, client company, and port are required");
      }
      console.log("Step 3: Required fields present");

      // ETA validation
      console.log("Step 4: ETA validation", {
        etaDate: formData.etaDate,
        etaTime: formData.etaTime,
      });

      // Accept YYYY-MM-DD or DD-MM-YYYY
      const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const dmyDateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (
        !formData.etaDate ||
        !formData.etaTime ||
        (!isoDateRegex.test(formData.etaDate) &&
          !dmyDateRegex.test(formData.etaDate)) ||
        !formData.etaTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
      ) {
        console.error("Step 5: ETA validation failed", {
          etaDate: formData.etaDate,
          etaTime: formData.etaTime,
        });
        throw new Error(
          "ETA Date (YYYY-MM-DD or DD-MM-YYYY) and Time (HH:mm, 24hr) are required and must be correctly formatted.",
        );
      }
      console.log("Step 6: ETA validation passed");

      // Convert ETA to ISO format
      let etaIsoString = "";
      if (isoDateRegex.test(formData.etaDate)) {
        etaIsoString = new Date(
          `${formData.etaDate}T${formData.etaTime}:00`,
        ).toISOString();
      } else if (dmyDateRegex.test(formData.etaDate)) {
        const [dd, mm, yyyy] = formData.etaDate.split("-");
        etaIsoString = new Date(
          `${yyyy}-${mm}-${dd}T${formData.etaTime}:00`,
        ).toISOString();
      }
      console.log("Step 7: ETA ISO String", etaIsoString);

      // Find port and client names
      const portLabel =
        ports.find((p) => p.value === formData.port)?.label || "";
      const clientLabel =
        clients.find((c) => c.value === formData.clientCompany)?.label || "";
      console.log("Step 8: Port Label", portLabel, "Client Label", clientLabel);

      // Combine Port & Country with Location (for backend)
      const portCombined = location
        ? `${portLabel} ${location}`.trim()
        : portLabel;
      console.log("Step 9: Port Combined", portCombined);

      // Prepare mail object
      const mail = {
        email: formData.pic.email || "",
        body: "",
        cc_emails: [],
      };

      // Prepare services array
      const services = selectedServices.map((service, index) => ({
        service_id: `SVC-${Date.now()}-${index}`,
        service_name: service.name,
        vendor_id: service.vendorId || null,
        vendor_name: service.vendor || "No vendor specified",
        status: true,
      }));

      // Build payload
      const payload = {
        vessel_id: formData.vesselId || `VES-${Date.now()}`,
        vessel_name: formData.vesselName,
        imo: formData.imo,
        port: portCombined,
        client_company: clientLabel,
        section_head: formData.sectionHeadName,
        section_head_email: formData.sectionHeadEmail,
        status_of_formalities: formData.formalityStatus || "Pending",
        eta: etaIsoString,
        pic: {
          id: formData.pic.pic_id,
          name: formData.pic.customerPIC,
        },
        priority: formData.priority,
        remarks: formData.remarks || "",
        status: "Open",
        mail,
        services,
        vessel_type: formData.vesselType,
        flag: formData.flag,
        call_sign: formData.callSign,
        grt: formData.grt ? parseFloat(formData.grt) : null,
        nrt: formData.nrt ? parseFloat(formData.nrt) : null,
        loa: formData.loa ? parseFloat(formData.loa) : null,
        dwt: formData.dwt ? parseFloat(formData.dwt) : null,
        built_year: formData.builtYear ? parseInt(formData.builtYear) : null,
      };

      console.log("Step 10: Payload to send", payload);

      // Debug: Check API endpoint and token
      console.log("Step 11: Endpoint", API_ENDPOINTS.PORT_CALLS);
      const token = localStorage.getItem("token");
      console.log("Step 12: Token", token);

      // Do the fetch!
      const response = await fetch(API_ENDPOINTS.PORT_CALLS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Step 13: Fetch response object", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Step 14: Response not ok", errorData);
        throw new Error(errorData.error || "Failed to create port call");
      }

      const result = await response.json();
      console.log("Step 15: Success result", result);

      toast.success("Port call created successfully!", {
        description: "Your new port call has been created.",
        duration: 3000,
      });
      localStorage.removeItem("portCallFormData");
      localStorage.removeItem("portCallSelectedServices");

      setTimeout(() => {
        router.push("/port-calls");
      }, 1500);
    } catch (error) {
      console.error("Step 16: Caught error", error);
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to create port call",
        duration: 8000,
      });
    } finally {
      console.log("Step 17: Loading set to false");
      setLoading(false);
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
                  Create New Port Call
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Disbursement Department
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

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="professional-card animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ship className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the basic port call and vessel details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imo" className="form-label">
                      IMO Number *
                    </Label>
                    <div className="relative">
                      <Input
                        id="imo"
                        value={formData.imo}
                        onChange={(e) => handleIMONumberChange(e.target.value)}
                        placeholder="9876543"
                        className="form-input"
                      />
                      {loadingVessel && (
                        <span className="text-sm">Loading vessel data...</span>
                      )}
                      {vesselError && (
                        <span className="text-sm text-red-500">
                          {vesselError}
                        </span>
                      )}
                      {loadingVessel && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                    {vesselError && (
                      <p className="text-sm text-red-500 mt-1">{vesselError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vesselName" className="form-label">
                      Vessel Name *
                    </Label>
                    <Input
                      id="vesselName"
                      value={formData.vesselName}
                      onChange={(e) =>
                        handleInputChange("vesselName", e.target.value)
                      }
                      placeholder="Enter vessel name"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselType" className="form-label">
                      Vessel Type
                    </Label>
                    <Select
                      value={formData.vesselType}
                      onValueChange={(value) =>
                        handleInputChange("vesselType", value)
                      }
                    >
                      <SelectTrigger className="form-input">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vesselTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="flag" className="form-label">
                      Flag
                    </Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) =>
                        handleInputChange("flag", e.target.value)
                      }
                      placeholder="Country flag"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="callSign" className="form-label">
                      Call Sign
                    </Label>
                    <Input
                      id="callSign"
                      value={formData.callSign}
                      onChange={(e) =>
                        handleInputChange("callSign", e.target.value)
                      }
                      placeholder="ABCD1"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="builtYear" className="form-label">
                      Built Year
                    </Label>
                    <Input
                      id="builtYear"
                      value={formData.builtYear}
                      onChange={(e) =>
                        handleInputChange("builtYear", e.target.value)
                      }
                      placeholder="2020"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="grt" className="form-label">
                      GRT
                    </Label>
                    <Input
                      id="grt"
                      value={formData.grt}
                      onChange={(e) => handleInputChange("grt", e.target.value)}
                      placeholder="45,000"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loa" className="form-label">
                      LOA (m)
                    </Label>
                    <Input
                      id="loa"
                      value={formData.loa}
                      onChange={(e) => handleInputChange("loa", e.target.value)}
                      placeholder="300"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dwt" className="form-label">
                      DWT
                    </Label>
                    <Input
                      id="dwt"
                      value={formData.dwt}
                      onChange={(e) => handleInputChange("dwt", e.target.value)}
                      placeholder="80,000"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor="sscecExpiry" className="form-label mb-1">
                      SSCEC Expiry
                    </Label>
                    <DatePicker
                      id="sscecExpiry"
                      value={formData.sscecExpiry}
                      onChange={(date) =>
                        handleInputChange("sscecExpiry", date)
                      }
                      placeholder="DD.MM.YYYY"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="piClub" className="form-label">
                      P&I Club
                    </Label>
                    <Input
                      id="piClub"
                      value={formData.piClub}
                      onChange={(e) =>
                        handleInputChange("piClub", e.target.value)
                      }
                      placeholder="Enter P&I Club name"
                      className="form-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client & Operations */}
            <Card
              className="professional-card animate-fade-in-up border-l-4 border-l-blue-600"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building className="h-5 w-5 " />
                  Client & Operations
                </CardTitle>
                <CardDescription>
                  Client information and operational details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Row 1: Client Company & Section Head */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="clientCompany"
                      className="form-label font-medium"
                    >
                      Client Company *
                    </Label>
                    <Select
                      value={formData.clientCompany}
                      onValueChange={(value) =>
                        handleInputChange("clientCompany", value)
                      }
                    >
                      <SelectTrigger className="form-input h-11">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.value} value={client.value}>
                            {client.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="sectionHead"
                      className="form-label font-medium"
                    >
                      Section Head
                    </Label>
                    <Select
                      value={formData.sectionHead}
                      onValueChange={(value) => {
                        // Find the selected user by id
                        const selectedUser = users.find(
                          (u) => String(u.id) === value,
                        );
                        setFormData((prev) => ({
                          ...prev,
                          sectionHead: value,
                          sectionHeadName: selectedUser
                            ? `${selectedUser.first_name} ${selectedUser.last_name}`
                            : "",
                          sectionHeadEmail: selectedUser
                            ? selectedUser.email
                            : "",
                        }));
                      }}
                    >
                      <SelectTrigger className="form-input h-11">
                        <SelectValue placeholder="Select Section Head" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionHeadOptions.map((user) => (
                          <SelectItem key={user.value} value={user.value}>
                            {user.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Port & Country | Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="port" className="form-label font-medium">
                        Port & Country
                      </Label>
                      <Dialog
                        open={isAddPortOpen}
                        onOpenChange={setIsAddPortOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            className="h-8 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Port
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Port</DialogTitle>
                            <DialogDescription>
                              Add a new port to the available ports list
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="portName">
                                Port Name & Country
                              </Label>
                              <Input
                                id="portName"
                                value={newPortName}
                                onChange={(e) => setNewPortName(e.target.value)}
                                placeholder="e.g., Colombo, Sri Lanka"
                                className="w-full"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAddPortOpen(false);
                                  setNewPortName("");
                                }}
                                disabled={isAddingPort}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  if (!newPortName.trim()) {
                                    toast.error("Validation Error", {
                                      description: "Please enter a port name",
                                      duration: 3000,
                                    });
                                    return;
                                  }
                                  setIsAddingPort(true);
                                  try {
                                    const newPort = await addPortToDatabase(
                                      newPortName.trim(),
                                    );
                                    setPorts((prevPorts) => [
                                      ...prevPorts,
                                      {
                                        value: newPort.port_id,
                                        label: newPort.port_name,
                                      },
                                    ]);
                                    setFormData((prev) => ({
                                      ...prev,
                                      port: newPort.port_id,
                                    }));
                                    setIsAddPortOpen(false);
                                    setNewPortName("");
                                    toast.success("Success", {
                                      description: "Port added successfully!",
                                      duration: 3000,
                                    });
                                  } catch (error) {
                                    toast.error("Error", {
                                      description:
                                        error instanceof Error
                                          ? error.message
                                          : "Failed to add port",
                                      duration: 8000,
                                    });
                                  } finally {
                                    setIsAddingPort(false);
                                  }
                                }}
                                disabled={!newPortName.trim() || isAddingPort}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isAddingPort ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Add Port"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.port}
                      onValueChange={(value) =>
                        handleInputChange("port", value)
                      }
                    >
                      <SelectTrigger className="form-input h-11">
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {ports.map((port) => (
                          <SelectItem key={port.value} value={port.value}>
                            {port.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="form-label font-medium"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Enter location"
                      className="form-input h-11"
                    />
                  </div>
                </div>

                {/* Row 3: ETA Date & ETA Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="etaDate" className="form-label font-medium">
                      ETA Date
                    </Label>
                    <DatePicker
                      id="etaDate"
                      value={formData.etaDate}
                      onChange={(date) => handleInputChange("etaDate", date)}
                      placeholder="DD.MM.YYYY"
                      className="form-input h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etaTime" className="form-label font-medium">
                      ETA Time (24hr)
                    </Label>
                    <TimePicker
                      value={formData.etaTime}
                      onChange={(value) => handleInputChange("etaTime", value)}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Row 4: Status, Priority & Client PIC */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="Priority"
                      className="form-label font-medium"
                    >
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(priority) =>
                        handleInputChange("priority", priority)
                      }
                    >
                      <SelectTrigger className="form-input h-11" id="priority">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem
                            key={priority.value}
                            value={priority.value}
                          >
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="assignedPIC"
                      className="form-label font-medium"
                    >
                      Client PIC
                    </Label>
                    <Select
                      value={formData.pic.pic_id}
                      onValueChange={(pic_id) => handlePicChange(pic_id)}
                    >
                      <SelectTrigger
                        className="form-input h-11"
                        id="assignedPIC"
                      >
                        <SelectValue placeholder="Select Client PIC" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerPICOptions.map((pic) => (
                          <SelectItem key={pic.value} value={pic.value}>
                            {pic.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="form-label font-medium">
                    Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    placeholder="Enter any additional remarks or special instructions"
                    rows={3}
                    className="form-input resize-vertical"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Selection */}
          <div className="space-y-6">
            <Card
              className="professional-card animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle>Work Scope & Services</CardTitle>
                <CardDescription>
                  Select required services for this port call
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="serviceSearch" className="form-label">
                      Search Services
                    </Label>
                    <Input
                      id="serviceSearch"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search services..."
                      className="form-input"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-end">
                    <Dialog
                      open={isAddServiceOpen}
                      onOpenChange={setIsAddServiceOpen}
                    >
                      <Link href="/port-calls/add-services" passHref>
                        <Button variant="outline" size="sm" disabled={loading}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </Link>

                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Service</DialogTitle>
                          <DialogDescription>
                            Add a new service to the available services list
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="serviceName">Service Name</Label>
                            <Input
                              id="serviceName"
                              value={newServiceName}
                              onChange={(e) =>
                                setNewServiceName(e.target.value)
                              }
                              placeholder="Enter new service name"
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddServiceOpen(false);
                                setNewServiceName("");
                              }}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={addNewService}
                              disabled={loading || !newServiceName.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {loading ? "Adding..." : "Add Service"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={service.service_id}
                          checked={selectedServices.some(
                            (s) => s.name === service.service_name,
                          )}
                          onCheckedChange={() =>
                            handleServiceToggle(service.service_name)
                          }
                        />
                        <Label
                          htmlFor={service.service_id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {service.service_name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {loading
                        ? "Loading services..."
                        : "No services available"}
                    </div>
                  )}
                </div>

                {selectedServices.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">
                      Selected Services ({selectedServices.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedServices.map((service, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                        >
                          <div>
                            <span>{service.name}</span>
                            {service.vendor && (
                              <span className="text-primary ml-2">
                                ({service.vendor})
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedService(service.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vessel:</span>
                  <span className="font-medium">
                    {formData.vesselName || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="font-medium">
                    {formData.clientCompany
                      ? clients.find((c) => c.value === formData.clientCompany)
                          ?.label
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-medium">
                    {formData.port
                      ? ports.find((p) => p.value === formData.port)?.label
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span className="font-medium">{selectedServices.length}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSubmit}
              className="w-full professional-button-primary h-12 text-base"
              disabled={
                loading ||
                !formData.vesselName ||
                !formData.clientCompany ||
                selectedServices.length === 0
              }
            >
              {loading ? "Creating..." : "Create Port Call"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 text-base mt-2"
              onClick={handleClearFormFields}
              disabled={loading}
            >
              Clear Form Fields
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base mt-2"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Vendor Selection Modal */}
      <Dialog open={isVendorModalOpen} onOpenChange={setIsVendorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Vendor for {currentService}</DialogTitle>
            <DialogDescription>
              Choose a vendor to provide this service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vendor" className="form-label">
                Available Vendors
              </Label>
              <Select
                value={selectedVendor}
                onValueChange={setSelectedVendor}
                disabled={showExceptionVendor}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors
                    .filter((vendor) => {
                      // Filter vendors that are approved (string or boolean, object or array)
                      const isApproved = Array.isArray(vendor.vendorStatus)
                        ? vendor.vendorStatus.some((status) =>
                            typeof status.status === "string"
                              ? status.status.toLowerCase() === "approved"
                              : status.status === true,
                          )
                        : typeof vendor.vendorStatus?.status === "string"
                          ? vendor.vendorStatus.status.toLowerCase() ===
                            "approved"
                          : vendor.vendorStatus?.status === true;

                      // Filter vendors that provide the current service
                      const providesService = vendor.vendorServices?.some(
                        (service) => service.service_name === currentService,
                      );

                      return isApproved && providesService;
                    })
                    .map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vendor.category}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                type="button"
                variant={showExceptionVendor ? "default" : "outline"}
                onClick={() => {
                  setShowExceptionVendor((v) => !v);
                  setExceptionVendorName("");
                  setSelectedVendor("");
                }}
                disabled={loading || exceptionVendorLoading}
              >
                Exception Vendor
              </Button>
              {showExceptionVendor && (
                <Input
                  className="w-64"
                  placeholder="Enter Exception Vendor Name"
                  value={exceptionVendorName}
                  onChange={(e) => setExceptionVendorName(e.target.value)}
                  disabled={exceptionVendorLoading}
                />
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsVendorModalOpen(false);
                  setSelectedVendor("");
                  setCurrentService("");
                  setShowExceptionVendor(false);
                  setExceptionVendorName("");
                }}
                disabled={loading || exceptionVendorLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVendorSelection}
                disabled={
                  loading ||
                  exceptionVendorLoading ||
                  (showExceptionVendor
                    ? !exceptionVendorName.trim()
                    : !selectedVendor)
                }
                className="professional-button-primary"
              >
                {loading || exceptionVendorLoading
                  ? "Adding..."
                  : showExceptionVendor
                    ? "Add Exception Vendor"
                    : "Add Service"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
