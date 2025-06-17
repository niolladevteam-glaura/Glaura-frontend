"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Ship, X, Plus, Users, Anchor } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

// API Configuration - Replace with your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

// API Endpoints
const API_ENDPOINTS = {
  SERVICES: `${API_BASE_URL}/services`,
  PORTS: `${API_BASE_URL}/ports`,
  FORMALITY_STATUS: `${API_BASE_URL}/formality-status`,
  VENDORS: `${API_BASE_URL}/vendors`,
  PORT_CALLS: `${API_BASE_URL}/port-calls`,
  CLIENTS: `${API_BASE_URL}/clients`,
  VESSEL_TYPES: `${API_BASE_URL}/vessel-types`,
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
]

const DEFAULT_PORTS = [
  { value: "colombo", label: "Colombo, Sri Lanka" },
  { value: "galle", label: "Galle, Sri Lanka" },
  { value: "hambantota", label: "Hambantota, Sri Lanka" },
  { value: "trincomalee", label: "Trincomalee, Sri Lanka" },
]

const DEFAULT_CLIENTS = [
  { value: "msc", label: "Mediterranean Shipping Company" },
  { value: "maersk", label: "Maersk Line" },
  { value: "cosco", label: "COSCO Shipping Lines" },
  { value: "evergreen", label: "Evergreen Marine" },
  { value: "hapag", label: "Hapag-Lloyd" },
]

const DEFAULT_VESSEL_TYPES = [
  "Container Ship",
  "Bulk Carrier",
  "Tanker",
  "General Cargo",
  "RoRo",
  "Cruise Ship",
  "Ferry",
  "Offshore Vessel",
]

const DEFAULT_FORMALITY_STATUS = [
  "Pre-Arrival Message",
  "Port Clearance Pending",
  "Immigration Clearance",
  "Customs Clearance",
  "Health Clearance",
  "All Formalities Complete",
]

const DEFAULT_VENDORS = [
  { id: "1", name: "Lanka Marine Services", category: "Launch Boat Services" },
  { id: "2", name: "Ceylon Transport Solutions", category: "Transport" },
  { id: "3", name: "Port Clearance Experts", category: "Clearance Agent" },
  { id: "4", name: "Marine Supply Co.", category: "Supply" },
  { id: "5", name: "Underwater Services Ltd", category: "Underwater Services" },
  { id: "6", name: "Bunker Solutions", category: "Bunkering" },
  { id: "7", name: "Ship Repair Specialists", category: "Repairs" },
  { id: "8", name: "Medical Services Lanka", category: "Medical" },
]

interface SelectedService {
  name: string
  vendor?: string
  vendorId?: string
}

interface Port {
  value: string
  label: string
}

interface Client {
  value: string
  label: string
}

interface Vendor {
  id: string
  name: string
  category: string
}

export default function NewPortCall() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    jobNumber: "",
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
  })

  // State for dynamic data
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [serviceSearch, setServiceSearch] = useState("")
  const [availableServices, setAvailableServices] = useState<string[]>(DEFAULT_SERVICES)
  const [ports, setPorts] = useState<Port[]>(DEFAULT_PORTS)
  const [clients, setClients] = useState<Client[]>(DEFAULT_CLIENTS)
  const [vesselTypes, setVesselTypes] = useState<string[]>(DEFAULT_VESSEL_TYPES)
  const [formalityStatuses, setFormalityStatuses] = useState<string[]>(DEFAULT_FORMALITY_STATUS)
  const [vendors, setVendors] = useState<Vendor[]>(DEFAULT_VENDORS)

  // Modal states
  const [newServiceName, setNewServiceName] = useState("")
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [currentService, setCurrentService] = useState("")
  const [selectedVendor, setSelectedVendor] = useState("")
  const [newPortName, setNewPortName] = useState("")
  const [newFormalityStatus, setNewFormalityStatus] = useState("")
  const [isAddPortOpen, setIsAddPortOpen] = useState(false)
  const [isAddFormalityOpen, setIsAddFormalityOpen] = useState(false)

  const router = useRouter()

  // API Functions - Replace these with your actual API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          // Add your authentication headers here
          // 'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Load initial data from API
  const loadInitialData = async () => {
    try {
      setLoading(true)

      // TODO: Replace with actual API calls
      // const [servicesRes, portsRes, clientsRes, vendorsRes] = await Promise.all([
      //   apiCall(API_ENDPOINTS.SERVICES),
      //   apiCall(API_ENDPOINTS.PORTS),
      //   apiCall(API_ENDPOINTS.CLIENTS),
      //   apiCall(API_ENDPOINTS.VENDORS)
      // ])

      // setAvailableServices(servicesRes.data || DEFAULT_SERVICES)
      // setPorts(portsRes.data || DEFAULT_PORTS)
      // setClients(clientsRes.data || DEFAULT_CLIENTS)
      // setVendors(vendorsRes.data || DEFAULT_VENDORS)

      // For now, using default data
      console.log("Loading initial data from API...")
    } catch (error) {
      console.error("Failed to load initial data:", error)
      // Fallback to default data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Generate job number
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const jobNumber = `GLPC-${year}-${month}${day}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    setFormData((prev) => ({ ...prev, jobNumber }))

    // Load initial data
    loadInitialData()
  }, [router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceToggle = (service: string) => {
    const isSelected = selectedServices.some((s) => s.name === service)

    if (isSelected) {
      setSelectedServices((prev) => prev.filter((s) => s.name !== service))
    } else {
      setCurrentService(service)
      setIsVendorModalOpen(true)
    }
  }

  const handleVendorSelection = () => {
    if (selectedVendor) {
      const vendor = vendors.find((v) => v.id === selectedVendor)
      setSelectedServices((prev) => [
        ...prev,
        {
          name: currentService,
          vendor: vendor?.name,
          vendorId: vendor?.id,
        },
      ])
      setIsVendorModalOpen(false)
      setSelectedVendor("")
      setCurrentService("")
    }
  }

  // Add new service function - API ready
  const addNewService = async () => {
    if (!newServiceName.trim()) {
      alert("Please enter a service name.")
      return
    }

    if (availableServices.includes(newServiceName.trim())) {
      alert("This service already exists.")
      return
    }

    try {
      setLoading(true)

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.SERVICES, {
      //   method: 'POST',
      //   body: JSON.stringify({ name: newServiceName.trim() })
      // })

      // For now, update local state
      setAvailableServices((prev) => [...prev, newServiceName.trim()])
      setNewServiceName("")
      setIsAddServiceOpen(false)

      console.log("Service added:", newServiceName.trim())
      alert("Service added successfully!")
    } catch (error) {
      console.error("Failed to add service:", error)
      alert("Failed to add service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const removeSelectedService = (serviceName: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.name !== serviceName))
  }

  const filteredServices = availableServices.filter((service) =>
    service.toLowerCase().includes(serviceSearch.toLowerCase()),
  )

  // Add custom port function - API ready
  const addCustomPort = async () => {
    if (!newPortName.trim()) {
      alert("Please enter a port name.")
      return
    }

    try {
      setLoading(true)

      const portValue = newPortName.toLowerCase().replace(/\s+/g, "-")
      const newPort = { value: portValue, label: newPortName.trim() }

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.PORTS, {
      //   method: 'POST',
      //   body: JSON.stringify(newPort)
      // })

      // For now, update local state
      setPorts((prev) => [...prev, newPort])
      setNewPortName("")
      setIsAddPortOpen(false)

      console.log("Port added:", newPort)
      alert("Port added successfully!")
    } catch (error) {
      console.error("Failed to add port:", error)
      alert("Failed to add port. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add custom formality status function - API ready
  const addCustomFormalityStatus = async () => {
    if (!newFormalityStatus.trim()) {
      alert("Please enter a formality status.")
      return
    }

    if (formalityStatuses.includes(newFormalityStatus.trim())) {
      alert("This formality status already exists.")
      return
    }

    try {
      setLoading(true)

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.FORMALITY_STATUS, {
      //   method: 'POST',
      //   body: JSON.stringify({ name: newFormalityStatus.trim() })
      // })

      // For now, update local state
      setFormalityStatuses((prev) => [...prev, newFormalityStatus.trim()])
      setNewFormalityStatus("")
      setIsAddFormalityOpen(false)

      console.log("Formality status added:", newFormalityStatus.trim())
      alert("Formality status added successfully!")
    } catch (error) {
      console.error("Failed to add formality status:", error)
      alert("Failed to add formality status. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Submit port call function - API ready
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.vesselName || !formData.clientCompany || selectedServices.length === 0) {
      alert("Please fill in all required fields and select at least one service.")
      return
    }

    try {
      setLoading(true)

      const portCallData = {
        ...formData,
        services: selectedServices,
        createdBy: currentUser?.name,
        createdAt: new Date().toISOString(),
        status: "Pending Assignment",
      }

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.PORT_CALLS, {
      //   method: 'POST',
      //   body: JSON.stringify(portCallData)
      // })

      console.log("Creating port call:", portCallData)

      // Simulate success
      alert(
        `Port Call ${formData.jobNumber} created successfully!\n\nNotifications sent to:\n- Operations Manager\n- Assigned PIC\n- Client: ${clients.find((c) => c.value === formData.clientCompany)?.label}`,
      )

      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to create port call:", error)
      alert("Failed to create port call. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Create New Port Call</h1>
                <p className="text-sm text-muted-foreground">Disbursement Department</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {currentUser.name} - Level {currentUser.accessLevel}
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
                <CardDescription>Enter the basic port call and vessel details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jobNumber" className="form-label">
                      Job Number
                    </Label>
                    <Input
                      id="jobNumber"
                      value={formData.jobNumber}
                      onChange={(e) => handleInputChange("jobNumber", e.target.value)}
                      className="form-input bg-muted"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="imo" className="form-label">
                      IMO Number *
                    </Label>
                    <Input
                      id="imo"
                      value={formData.imo}
                      onChange={(e) => handleInputChange("imo", e.target.value)}
                      placeholder="9876543"
                      className="form-input"
                    />
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
                      onChange={(e) => handleInputChange("vesselName", e.target.value)}
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
                      onValueChange={(value) => handleInputChange("vesselType", value)}
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
                      onChange={(e) => handleInputChange("flag", e.target.value)}
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
                      onChange={(e) => handleInputChange("callSign", e.target.value)}
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
                      onChange={(e) => handleInputChange("builtYear", e.target.value)}
                      placeholder="2020"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <Label htmlFor="nrt" className="form-label">
                      NRT
                    </Label>
                    <Input
                      id="nrt"
                      value={formData.nrt}
                      onChange={(e) => handleInputChange("nrt", e.target.value)}
                      placeholder="25,000"
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
                      onChange={(e) => handleInputChange("sscecExpiry", e.target.value)}
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
                      onChange={(e) => handleInputChange("piClub", e.target.value)}
                      placeholder="Enter P&I Club name"
                      className="form-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client & Operations */}
            <Card className="professional-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>Client & Operations</CardTitle>
                <CardDescription>Client information and operational details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCompany" className="form-label">
                      Client Company *
                    </Label>
                    <Select
                      value={formData.clientCompany}
                      onValueChange={(value) => handleInputChange("clientCompany", value)}
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
                      onChange={(e) => handleInputChange("agencyName", e.target.value)}
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
                      <Dialog open={isAddPortOpen} onOpenChange={setIsAddPortOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={() => {
                              console.log("Add Port button clicked")
                              setIsAddPortOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Port
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Port</DialogTitle>
                            <DialogDescription>Add a new port to the available ports list</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="portName">Port Name & Country</Label>
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
                                  setIsAddPortOpen(false)
                                  setNewPortName("")
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={addCustomPort}
                                disabled={loading || !newPortName.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {loading ? "Adding..." : "Add Port"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select value={formData.port} onValueChange={(value) => handleInputChange("port", value)}>
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
                      <Dialog open={isAddFormalityOpen} onOpenChange={setIsAddFormalityOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={() => {
                              console.log("Add Status button clicked")
                              setIsAddFormalityOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Add New Formality Status</DialogTitle>
                            <DialogDescription>Add a new formality status to the available options</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="statusName">Formality Status</Label>
                              <Input
                                id="statusName"
                                value={newFormalityStatus}
                                onChange={(e) => setNewFormalityStatus(e.target.value)}
                                placeholder="e.g., Pre-Arrival Message"
                                className="w-full"
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsAddFormalityOpen(false)
                                  setNewFormalityStatus("")
                                }}
                                disabled={loading}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={addCustomFormalityStatus}
                                disabled={loading || !newFormalityStatus.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {loading ? "Adding..." : "Add Status"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.formalityStatus}
                      onValueChange={(value) => handleInputChange("formalityStatus", value)}
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
                    <Label htmlFor="assignedPIC" className="form-label">
                      Assigned PIC
                    </Label>
                    <Input
                      id="assignedPIC"
                      value={formData.assignedPIC}
                      onChange={(e) => handleInputChange("assignedPIC", e.target.value)}
                      placeholder="Will be assigned by Ops Manager"
                      className="form-input bg-muted"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks" className="form-label">
                    Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
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
            <Card className="professional-card animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle>Work Scope & Services</CardTitle>
                <CardDescription>Select required services for this port call</CardDescription>
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
                    />
                  </div>
                  <div className="flex items-end">
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                          onClick={() => {
                            console.log("Add Service button clicked")
                            setIsAddServiceOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Service</DialogTitle>
                          <DialogDescription>Add a new service to the available services list</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="serviceName">Service Name</Label>
                            <Input
                              id="serviceName"
                              value={newServiceName}
                              onChange={(e) => setNewServiceName(e.target.value)}
                              placeholder="Enter new service name"
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-end space-x-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsAddServiceOpen(false)
                                setNewServiceName("")
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
                  {filteredServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.some((s) => s.name === service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label htmlFor={service} className="text-sm cursor-pointer flex-1">
                        {service}
                      </Label>
                    </div>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Selected Services ({selectedServices.length})</h4>
                    <div className="space-y-2">
                      {selectedServices.map((service, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <div>
                            <span>{service.name}</span>
                            {service.vendor && <span className="text-primary ml-2">({service.vendor})</span>}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeSelectedService(service.name)}>
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
                  <span>Job Number:</span>
                  <span className="font-medium">{formData.jobNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vessel:</span>
                  <span className="font-medium">{formData.vesselName || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Client:</span>
                  <span className="font-medium">
                    {formData.clientCompany
                      ? clients.find((c) => c.value === formData.clientCompany)?.label
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-medium">
                    {formData.port ? ports.find((p) => p.value === formData.port)?.label : "Not selected"}
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
              disabled={loading || !formData.vesselName || !formData.clientCompany || selectedServices.length === 0}
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
            <DialogDescription>Choose a vendor to provide this service</DialogDescription>
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
                          <div className="text-sm text-muted-foreground">{vendor.category}</div>
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
                  setIsVendorModalOpen(false)
                  setSelectedVendor("")
                  setCurrentService("")
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
  )
}
