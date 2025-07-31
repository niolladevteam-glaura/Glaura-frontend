"use client";

import { useState, useEffect, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Ship, X, Plus, Users, Anchor, Loader2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

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

// Default data - Replace with API calls
const DEFAULT_SERVICES = [
  "Crew Embarkation",
  "Crew Disembarkation",
  "Crew Changes (On/Off)",
  "Technician Embarkation",
  "Technician Disembarkation",
  "Technician Attendance",
  "Superintendent Embarkation",
  "Superintendent Disembarkation",
  "Superintendent Attendance",
  "Ship Spares Clearance and Delivery",
  "Ship Spares Off-Landing and Re-Forwarding",
  "CTM Handling and Delivery",
  "BA Charts Supply",
  "Marine Publications Supply",
  "Deck Stores Items Supply",
  "Engine Stores Supply",
  "Provisions Supply",
  "Chemical Stores Supply",
  "Crew Welfare Items Supply",
  "Cabin Stores Supply",
  "Bonded Stores Supply",
  "Safety Items Supply",
  "Flags Supply",
  "Electric Stores Supply",
  "Medical Supplies",
  "Fresh Water Supply",
  "Underwater Inspection",
  "Underwater Cleaning",
  "Underwater Inspection and Cleaning",
  "Marine Lubricants Supply",
  "Marine Paints and Chemicals Supply",
  "Cargo Tank Cleaning",
  "Removal of Garbage",
  "Removal of Sludge",
  "De-Slopping",
  "Ship to Ship Spare Transfer",
  "Marine/Cargo Surveyors",
  "Bunker Coordination",
  "Ship Repairs",
  "Dry Dock Repairs",
  "Medical Assistance",
  "Land and Repatriation of Human Remains",
  "SSCEC Renewal",
  "Medical Chest Certificate Renewal",
  "Vessel Takeover",
  "Vessel Handover",
  "Management Changeover",
  "Discharging Operation",
];

const DEFAULT_PORTS = [
  { value: "colombo", label: "Colombo, Sri Lanka" },
  { value: "galle", label: "Galle, Sri Lanka" },
  { value: "hambantota", label: "Hambantota, Sri Lanka" },
  { value: "trincomalee", label: "Trincomalee, Sri Lanka" },
];

const DEFAULT_CLIENTS = [
  { value: "msc", label: "Mediterranean Shipping Company" },
  { value: "maersk", label: "Maersk Line" },
  { value: "cosco", label: "COSCO Shipping Lines" },
  { value: "evergreen", label: "Evergreen Marine" },
  { value: "hapag", label: "Hapag-Lloyd" },
];

const priorities = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const DEFAULT_VESSEL_TYPES = [
  "Container Ship",
  "Bulk Carrier",
  "Tanker",
  "General Cargo",
  "RoRo",
  "Cruise Ship",
  "Ferry",
  "Offshore Vessel",
];

const DEFAULT_FORMALITY_STATUS = [
  "Pre-Arrival Message",
  "Port Clearance Pending",
  "Immigration Clearance",
  "Customs Clearance",
  "Health Clearance",
  "All Formalities Complete",
];

const DEFAULT_VENDORS = [
  { id: "1", name: "Lanka Marine Services", category: "Launch Boat Services" },
  { id: "2", name: "Ceylon Transport Solutions", category: "Transport" },
  { id: "3", name: "Port Clearance Experts", category: "Clearance Agent" },
  { id: "4", name: "Marine Supply Co.", category: "Supply" },
  { id: "5", name: "Underwater Services Ltd", category: "Underwater Services" },
  { id: "6", name: "Bunker Solutions", category: "Bunkering" },
  { id: "7", name: "Ship Repair Specialists", category: "Repairs" },
  { id: "8", name: "Medical Services Lanka", category: "Medical" },
];

interface SelectedService {
  name: string;
  vendor?: string;
  vendorId?: string;
}

interface Service {
  id: number; // or string if you want to use service_id
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

interface PortsResponse {
  success: boolean;
  message: string;
  data: Port[];
}

interface Client {
  value: string;
  label: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
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
    agencyName: "",
    eta: "",
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
    []
  );
  const [serviceSearch, setServiceSearch] = useState("");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [clients, setClients] = useState<{ value: string; label: string }[]>(
    []
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

  // Modal states
  const [newServiceName, setNewServiceName] = useState("");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [newPortName, setNewPortName] = useState("");
  const [newFormalityStatus, setNewFormalityStatus] = useState("");
  const [isAddPortOpen, setIsAddPortOpen] = useState(false);
  const [isAddFormalityOpen, setIsAddFormalityOpen] = useState(false);

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
    let hasPermission = false;
    if (user.permissions) {
      if (Array.isArray(user.permissions)) {
        hasPermission = user.permissions.includes("create_port_calls");
      } else if (typeof user.permissions === "object") {
        hasPermission = !!user.permissions["create_port_calls"];
      }
    }
    if (!hasPermission) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to create port calls.",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }
  }, [router]);

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

  useEffect(() => {
    // Fetch the data
    fetchCustomerPics().then((pics: CustomerPic[]) => {
      setCustomerPICs(pics);
      setCustomerPICOptions(
        pics.map((pic) => ({
          value: pic.pic_id,
          label: pic.name,
        }))
      );
    });
  }, []);

  // API Functions - Replace these with your actual API calls
  const apiCall = async <T = any,>(
    endpoint: string,
    options: RequestInit = {}
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
          errorData?.message || `Request failed with status ${response.status}`
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
      toast({
        title: "Error",
        description: "Failed to load formality statuses",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchCustomerPic = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const response = await apiCall<CustomerPicResponse>(
        API_ENDPOINTS.CUSTOMER_PIC
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
      toast({
        title: "Error",
        description: "Failed to load customer PICs",
        variant: "destructive",
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
        API_ENDPOINTS.SERVICES
      );
      return response.data || [];
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "Failed to load ports",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
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
      toast({
        title: "Error",
        description: "Failed to load customer PICs",
        variant: "destructive",
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
        JSON.stringify(portCallData, null, 2)
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
        setFormData((prev) => ({
          ...prev,
          vesselId: response.data.vessel_id || "",
          vesselName: response.data.vessel_name || prev.vesselName,
          vesselType: response.data.vessel_type || prev.vesselType,
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
            ? new Date(response.data.SSCEC_expires).toISOString().split("T")[0]
            : prev.sscecExpiry,
          remarks: response.data.remark || prev.remarks,
        }));
      }
    }
  };

  // Helper function for date formatting
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
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
          label: pic.name,
        }))
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
    loadInitialData();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePicChange = (pic_id: string) => {
    const selected = customerPICs.find((pic) => pic.pic_id === pic_id);
    setFormData((prev) => ({
      ...prev,
      pic: {
        pic_id,
        customerPIC: selected?.name || "",
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

  const handleVendorSelection = () => {
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
    }
  };

  // Add new service function - API ready
  const addNewService = async () => {
    if (!newServiceName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a service name",
        variant: "destructive",
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
      toast({
        title: "Success",
        description: "Service added successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
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
      service.service_name.toLowerCase().includes(serviceSearch.toLowerCase())
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
    try {
      setLoading(true);
      if (!formData.vesselName || !formData.clientCompany || !formData.port) {
        throw new Error("Vessel name, client company, and port are required");
      }
      // Find port and client names
      const portLabel =
        ports.find((p) => p.value === formData.port)?.label || "";
      const clientLabel =
        clients.find((c) => c.value === formData.clientCompany)?.label || "";

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

      const payload = {
        vessel_id: formData.vesselId || `VES-${Date.now()}`,
        vessel_name: formData.vesselName,
        imo: formData.imo,
        port: portLabel,
        client_company: clientLabel,
        agency_name: formData.agencyName,
        status_of_formalities: formData.formalityStatus || "Pending",
        eta: formData.eta ? new Date(formData.eta).toISOString() : null,
        // ETD: omit if not needed
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

      const response = await fetch(API_ENDPOINTS.PORT_CALLS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create port call");
      }

      toast({
        title: "Success",
        description: "Port call created successfully!",
        duration: 5000,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create port call",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
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
                  <div>
                    <Label htmlFor="sscecExpiry" className="form-label">
                      SSCEC Expiry
                    </Label>
                    <Input
                      id="sscecExpiry"
                      type="date"
                      value={formData.sscecExpiry}
                      onChange={(e) =>
                        handleInputChange("sscecExpiry", e.target.value)
                      }
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
              className="professional-card animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle>Client & Operations</CardTitle>
                <CardDescription>
                  Client information and operational details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCompany" className="form-label">
                      Client Company *
                    </Label>
                    <Select
                      value={formData.clientCompany}
                      onValueChange={(value) =>
                        handleInputChange("clientCompany", value)
                      }
                    >
                      <SelectTrigger className="form-input">
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
                  <div>
                    <Label htmlFor="agencyName" className="form-label">
                      Agency Name
                    </Label>
                    <Input
                      id="agencyName"
                      value={formData.agencyName}
                      onChange={(e) =>
                        handleInputChange("agencyName", e.target.value)
                      }
                      placeholder="Enter agency name"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="port" className="form-label">
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
                            onClick={() => {
                              console.log("Add Port button clicked");
                              setIsAddPortOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
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
                                    toast({
                                      title: "Validation Error",
                                      description: "Please enter a port name",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  setIsAddingPort(true);
                                  try {
                                    const newPort = await addPortToDatabase(
                                      newPortName.trim()
                                    );

                                    // Update the local state immediately
                                    setPorts((prevPorts) => [
                                      ...prevPorts,
                                      {
                                        value: newPort.port_id,
                                        label: newPort.port_name,
                                      },
                                    ]);

                                    // Optionally select the newly added port
                                    setFormData((prev) => ({
                                      ...prev,
                                      port: newPort.port_id,
                                    }));

                                    setIsAddPortOpen(false);
                                    setNewPortName("");

                                    toast({
                                      title: "Success",
                                      description: "Port added successfully!",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description:
                                        error instanceof Error
                                          ? error.message
                                          : "Failed to add port",
                                      variant: "destructive",
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
                      <SelectTrigger className="form-input">
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
                  <div>
                    <Label htmlFor="eta" className="form-label">
                      ETA (Estimated Time of Arrival)
                    </Label>
                    <Input
                      id="eta"
                      type="datetime-local"
                      value={formData.eta}
                      onChange={(e) => handleInputChange("eta", e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="formalityStatus" className="form-label">
                        Status of Formalities
                      </Label>
                      <Dialog
                        open={isAddFormalityOpen}
                        onOpenChange={setIsAddFormalityOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Formality Status</DialogTitle>
                            <DialogDescription>
                              Add a new status of formalities to the available
                              options
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="statusName">Status Name</Label>
                              <Input
                                id="statusName"
                                value={newFormalityStatus}
                                onChange={(e) =>
                                  setNewFormalityStatus(e.target.value)
                                }
                                placeholder="e.g., Customs Clearance"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAddFormalityOpen(false);
                                  setNewFormalityStatus("");
                                }}
                                disabled={isAddingFormalityStatus}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  if (!newFormalityStatus.trim()) {
                                    toast({
                                      title: "Validation Error",
                                      description: "Please enter a status name",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  setIsAddingFormalityStatus(true);
                                  try {
                                    const newStatus =
                                      await addFormalityStatusToDatabase(
                                        newFormalityStatus.trim()
                                      );

                                    // Update local state
                                    setFormalityStatuses((prev) => [
                                      ...prev,
                                      newStatus.status_of_formalities,
                                    ]);

                                    // AUTO-SELECT THE NEWLY ADDED STATUS
                                    setFormData((prev) => ({
                                      ...prev,
                                      formalityStatus: newStatus.id,
                                    }));

                                    setIsAddFormalityOpen(false);
                                    setNewFormalityStatus("");

                                    toast({
                                      title: "Success",
                                      description: "Status added and selected!",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: "Error",
                                      description:
                                        error instanceof Error
                                          ? error.message
                                          : "Failed to add status",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setIsAddingFormalityStatus(false);
                                  }
                                }}
                                disabled={
                                  !newFormalityStatus.trim() ||
                                  isAddingFormalityStatus
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {isAddingFormalityStatus ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  "Add Status"
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.formalityStatus}
                      onValueChange={(value) =>
                        handleInputChange("formalityStatus", value)
                      }
                    >
                      <SelectTrigger className="form-input">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {formalityStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="Priority" className="form-label">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(priority) => {
                        handleInputChange("priority", priority);
                      }}
                    >
                      <SelectTrigger className="form-input" id="priority">
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
                  <div>
                    <Label htmlFor="assignedPIC" className="form-label">
                      Assigned PIC
                    </Label>
                    <Select
                      value={formData.pic.pic_id}
                      onValueChange={(pic_id) => handlePicChange(pic_id)}
                    >
                      <SelectTrigger className="form-input" id="assignedPIC">
                        <SelectValue placeholder="Select PIC's" />
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

                <div>
                  <Label htmlFor="remarks" className="form-label">
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
                    className="form-input"
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
                      <Link href="/services" passHref>
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
                            (s) => s.name === service.service_name
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
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
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
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsVendorModalOpen(false);
                  setSelectedVendor("");
                  setCurrentService("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVendorSelection}
                disabled={loading || !selectedVendor}
                className="professional-button-primary"
              >
                {loading ? "Adding..." : "Add Service"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
