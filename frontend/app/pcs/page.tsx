"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Check } from "lucide-react";
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
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// API Endpoints
const API_ENDPOINTS = {
  SERVICES: `${API_BASE_URL}/service`,
  PORTS: `${API_BASE_URL}/port`,
  FORMALITY_STATUS: `${API_BASE_URL}/sof`,
  VENDORS: `${API_BASE_URL}/vendor`,
  PORT_CALLS: `${API_BASE_URL}/portcall`,
  CLIENTS: `${API_BASE_URL}/customer`,
  VESSEL: `${API_BASE_URL}/vessel`,
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
    assignedPIC: "",
    port: "",
    formalityStatus: "",
    piClub: "",
    remarks: "",
  });
  const [loadingVessel, setLoadingVessel] = useState(false);
  const [vesselError, setVesselError] = useState<string | null>(null);

  // State for dynamic data
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [serviceSearch, setServiceSearch] = useState("");
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [clients, setClients] = useState<{ value: string; label: string }[]>(
    []
  );
  const [vesselTypes, setVesselTypes] =
    useState<string[]>(DEFAULT_VESSEL_TYPES);
  const [formalityStatuses, setFormalityStatuses] = useState<string[]>(
    DEFAULT_FORMALITY_STATUS
  );
  const [vendors, setVendors] = useState<Vendor[]>(DEFAULT_VENDORS);
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

  const router = useRouter();

  const [portCalls, setPortCalls] = useState([
    {
      id: 1,
      vesselName: "Ever Given",
      imo: "9811000",
      port: "Colombo, Sri Lanka",
      eta: "2023-11-15 08:00",
      client: "Evergreen Marine",
      status: "In Progress",
      isCompleted: false,
    },
    {
      id: 2,
      vesselName: "MSC Oscar",
      imo: "9703314",
      port: "Hambantota, Sri Lanka",
      eta: "2023-11-16 14:30",
      client: "Mediterranean Shipping",
      status: "Pending",
      isCompleted: false,
    },
    {
      id: 3,
      vesselName: "CMA CGM Marco Polo",
      imo: "9454439",
      port: "Galle, Sri Lanka",
      eta: "2023-11-17 10:15",
      client: "CMA CGM",
      status: "Delayed",
      isCompleted: false,
    },
  ]);

  const markAsDone = (id: number) => {
    setPortCalls((prevPortCalls) =>
      prevPortCalls.map((pc) =>
        pc.id === id ? { ...pc, status: "Done", isCompleted: true } : pc
      )
    );
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
      setFormalityStatuses(statusList.map((s) => s.label));
    };
    loadFormalityStatuses();
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
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

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
        console.error("API Error Details:", errorData);
        throw new Error(errorData.message || "Failed to add port");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to add port");
      }

      // Return the complete port data including the ID
      return {
        port_id: responseData.data.port_id,
        port_name: responseData.data.port_name,
        // Include any other fields returned by your API
      };
    } catch (error) {
      console.error("Detailed Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        portName,
        endpoint: API_ENDPOINTS.PORTS,
      });
      throw error;
    }
  };

  // Fetch all statuses
  const fetchFormalityStatuses = async (): Promise<
    { value: string; label: string }[]
  > => {
    try {
      const response = await apiCall<StatusOfFormalityResponse>(
        `${API_ENDPOINTS.FORMALITY_STATUS}`
      );
      if (response.success && response.data) {
        const statuses = Array.isArray(response.data)
          ? response.data
          : [response.data];
        return statuses.map((status) => ({
          value: status.id,
          label: status.status_of_formalities,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      toast({
        title: "Error",
        description: "Failed to load formality statuses",
        variant: "destructive",
      });
      return [];
    }
  };

  // Add new status
  const addFormalityStatusToDatabase = async (
    statusName: string
  ): Promise<StatusOfFormality> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

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
        console.error("API Error Details:", errorData);
        throw new Error(errorData.message || "Failed to add status");
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to add status");
      }

      return responseData.data;
    } catch (error) {
      console.error("Detailed Error:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        statusName,
        endpoint: API_ENDPOINTS.FORMALITY_STATUS,
      });
      throw error;
    }
  };
  // API functions for the port call page
  const fetchVesselByIMO = async (
    imo: string
  ): Promise<VesselAPIResponse | null> => {
    if (!imo) return null;

    try {
      setLoadingVessel(true);
      setVesselError(null);
      const response = await apiCall<VesselAPIResponse>(
        `${API_ENDPOINTS.VESSEL}/imo/${imo}`
      );
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
      console.error("Failed to fetch services:", error);
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
      const response = await apiCall<PortsResponse>(API_ENDPOINTS.PORTS);
      if (response.success && response.data) {
        return response.data.map((port) => ({
          value: port.port_id,
          label: port.port_name,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch ports:", error);
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
      const response = await apiCall<CustomersResponse>(API_ENDPOINTS.CLIENTS);
      if (response.success && response.data) {
        return response.data.map((customer) => ({
          value: customer.customer_id,
          label: customer.company_name,
        }));
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast({
        title: "Error",
        description: "Failed to load clients",
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchVendors = async (): Promise<Vendor[]> => {
    try {
      const response = await apiCall<{ data: Vendor[] }>(API_ENDPOINTS.VENDORS);
      return response.data || DEFAULT_VENDORS;
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      return DEFAULT_VENDORS;
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
      if (response) {
        const vesselData = response;
        console.log("Processing vessel data:", vesselData);

        setFormData((prev) => ({
          ...prev,
          vesselId: vesselData.data.vessel_id || "", // Handle missing vessel_id
          vesselName: vesselData.data.vessel_name || prev.vesselName,
          vesselType: vesselData.data.vessel_type || prev.vesselType,
          flag: vesselData.data.flag || prev.flag,
          callSign: vesselData.data.call_sign || prev.callSign,
          builtYear: vesselData.data.build_year
            ? String(vesselData.data.build_year)
            : prev.builtYear,
          grt: vesselData.data.grt ? String(vesselData.data.grt) : prev.grt,
          dwt: vesselData.data.dwt ? String(vesselData.data.dwt) : prev.dwt,
          loa: vesselData.data.loa ? String(vesselData.data.loa) : prev.loa,
          nrt: vesselData.data.nrt ? String(vesselData.data.nrt) : prev.nrt,
          piClub: vesselData.data.p_and_i_club || prev.piClub,
          sscecExpiry: vesselData.data.SSCEC_expires
            ? new Date(vesselData.data.SSCEC_expires)
                .toISOString()
                .split("T")[0]
            : prev.sscecExpiry,
          remarks: vesselData.data.remark || prev.remarks,
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
    try {
      setLoading(true);
      const [services, ports, clients, vendors] = await Promise.all([
        fetchServices(),
        fetchPorts(),
        fetchClients(),
        fetchVendors(),
      ]);

      setAvailableServices(services);
      setPorts(ports);
      setClients(clients);
      setVendors(vendors);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      // Only set empty arrays (already the default state)
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

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Generate job number
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const jobNumber = `GLPC-${year}-${month}${day}-${Math.floor(
      Math.random() * 1000
    )
      .toString()
      .padStart(3, "0")}`;

    setFormData((prev) => ({ ...prev, jobNumber }));

    // Load initial data
    loadInitialData();
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    try {
      setLoading(true);
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
      console.error("Failed to add service:", error);
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

    return availableServices.filter((service) => {
      return service.service_name
        .toLowerCase()
        .includes(serviceSearch.toLowerCase());
    });
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

      // Validate required fields
      if (!formData.vesselName || !formData.clientCompany || !formData.port) {
        throw new Error("Vessel name, client company, and port are required");
      }

      // Prepare the payload in the exact format the backend expects
      const payload = {
        vessel_id: formData.vesselId || `VES-${Date.now()}`, // Ensure vessel_id is at root level
        vessel_name: formData.vesselName,
        imo: formData.imo,
        port_id: formData.port, // Send port_id directly
        port: ports.find((p) => p.value === formData.port)?.label,
        client_company_id: formData.clientCompany,
        client_company: clients.find((c) => c.value === formData.clientCompany)
          ?.label,
        agency_name: formData.agencyName,
        status_of_formalities: formData.formalityStatus || "Pending",
        eta: formData.eta ? new Date(formData.eta).toISOString() : null,
        pic_id: currentUser?.id || "system",
        pic_name: currentUser?.name || "System User",
        pic_email: currentUser?.email || "",
        remarks: formData.remarks || "",
        status: "In Progress", // Ensure status is at root level
        priority: "Low",
        created_by: currentUser?.id || "system",
        // Vessel details as separate fields (not nested)
        vessel_type: formData.vesselType,
        flag: formData.flag,
        call_sign: formData.callSign,
        grt: formData.grt ? parseFloat(formData.grt) : null,
        nrt: formData.nrt ? parseFloat(formData.nrt) : null,
        loa: formData.loa ? parseFloat(formData.loa) : null,
        dwt: formData.dwt ? parseFloat(formData.dwt) : null,
        built_year: formData.builtYear ? parseInt(formData.builtYear) : null,
        p_and_i_club: formData.piClub,
        // Services array
        services: selectedServices.map((service, index) => ({
          service_id: `SVC-${Date.now()}-${index}`,
          service_name: service.name,
          vendor_id: service.vendorId || null,
          vendor_name: service.vendor || "No vendor specified",
          status: true,
        })),
      };

      console.log(
        "Final payload being sent:",
        JSON.stringify(payload, null, 2)
      );

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
        console.error("Backend error details:", errorData);
        throw new Error(errorData.error || "Failed to create port call");
      }

      const result = await response.json();
      console.log("Success response:", result);

      toast({
        title: "Success",
        description: "Port call created successfully!",
        duration: 5000,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating port call:", {
        error: error instanceof Error ? error.message : String(error),
        formData,
      });

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
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/port-calls">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Active Port Calls
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Port Call Services
                </h1>
                <p className="text-sm text-muted-foreground">
                  Greek Lanka PCMS
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Port Call Services</CardTitle>
            <CardDescription>Evergreen</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portCalls.map((portCall) => (
                  <TableRow
                    key={portCall.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {portCall.vesselName}
                    </TableCell>
                    <TableCell>{portCall.imo}</TableCell>

                    <TableCell>{portCall.client}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          portCall.status === "Done"
                            ? "default"
                            : portCall.status === "Delayed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {portCall.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!portCall.isCompleted && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => markAsDone(portCall.id)}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}

                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing 3 of 12 port call Services
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
