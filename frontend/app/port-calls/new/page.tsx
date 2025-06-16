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
import { ArrowLeft, Ship, X, Plus, Users } from "lucide-react"
import Link from "next/link"

const SERVICES = [
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

const PORTS: { value: string; label: string }[] = []

const CLIENTS = [
  { value: "msc", label: "Mediterranean Shipping Company" },
  { value: "maersk", label: "Maersk Line" },
  { value: "cosco", label: "COSCO Shipping Lines" },
  { value: "evergreen", label: "Evergreen Marine" },
  { value: "hapag", label: "Hapag-Lloyd" },
]

const VESSEL_TYPES = [
  "Container Ship",
  "Bulk Carrier",
  "Tanker",
  "General Cargo",
  "RoRo",
  "Cruise Ship",
  "Ferry",
  "Offshore Vessel",
]

const FORMALITY_STATUS: string[] = []

// Mock vendors data
const VENDORS = [
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

export default function NewPortCall() {
  const [currentUser, setCurrentUser] = useState<any>(null)
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
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [serviceSearch, setServiceSearch] = useState("")
  const [availableServices, setAvailableServices] = useState(SERVICES)
  const [newServiceName, setNewServiceName] = useState("")
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [currentService, setCurrentService] = useState("")
  const [selectedVendor, setSelectedVendor] = useState("")
  const [customPorts, setCustomPorts] = useState<{ value: string; label: string }[]>([])
  const [customFormalityStatuses, setCustomFormalityStatuses] = useState<string[]>([])
  const [newPortName, setNewPortName] = useState("")
  const [newFormalityStatus, setNewFormalityStatus] = useState("")
  const [isAddPortOpen, setIsAddPortOpen] = useState(false)
  const [isAddFormalityOpen, setIsAddFormalityOpen] = useState(false)
  const router = useRouter()

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
      const vendor = VENDORS.find((v) => v.id === selectedVendor)
      setSelectedServices((prev) => [...prev, { name: currentService, vendor: vendor?.name, vendorId: vendor?.id }])
      setIsVendorModalOpen(false)
      setSelectedVendor("")
      setCurrentService("")
    }
  }

  const addNewService = () => {
    if (newServiceName.trim() && !availableServices.includes(newServiceName.trim())) {
      setAvailableServices((prev) => [...prev, newServiceName.trim()])
      setNewServiceName("")
      setIsAddServiceOpen(false)
    }
  }

  const removeSelectedService = (serviceName: string) => {
    setSelectedServices((prev) => prev.filter((s) => s.name !== serviceName))
  }

  const filteredServices = availableServices.filter((service) =>
    service.toLowerCase().includes(serviceSearch.toLowerCase()),
  )

  const addCustomPort = () => {
    if (newPortName.trim()) {
      const portValue = newPortName.toLowerCase().replace(/\s+/g, "-")
      setCustomPorts((prev) => [...prev, { value: portValue, label: newPortName.trim() }])
      setNewPortName("")
      setIsAddPortOpen(false)
    }
  }

  const addCustomFormalityStatus = () => {
    if (newFormalityStatus.trim() && !customFormalityStatuses.includes(newFormalityStatus.trim())) {
      setCustomFormalityStatuses((prev) => [...prev, newFormalityStatus.trim()])
      setNewFormalityStatus("")
      setIsAddFormalityOpen(false)
    }
  }

  const handleSubmit = () => {
    // Simulate port call creation
    const portCallData = {
      ...formData,
      services: selectedServices,
      createdBy: currentUser?.name,
      createdAt: new Date().toISOString(),
      status: "Pending Assignment",
    }

    console.log("Creating port call:", portCallData)

    // Simulate notification to Ops Manager
    alert(
      `Port Call ${formData.jobNumber} created successfully!\n\nNotifications sent to:\n- Operations Manager\n- Assigned PIC\n- Client: ${CLIENTS.find((c) => c.value === formData.clientCompany)?.label}`,
    )

    router.push("/dashboard")
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create New Port Call</h1>
              <p className="text-sm text-gray-500">Disbursement Department</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
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
            <Card>
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
                    <Label htmlFor="jobNumber">Job Number</Label>
                    <Input
                      id="jobNumber"
                      value={formData.jobNumber}
                      onChange={(e) => handleInputChange("jobNumber", e.target.value)}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="imo">IMO Number</Label>
                    <Input
                      id="imo"
                      value={formData.imo}
                      onChange={(e) => handleInputChange("imo", e.target.value)}
                      placeholder="9876543"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vesselName">Vessel Name</Label>
                    <Input
                      id="vesselName"
                      value={formData.vesselName}
                      onChange={(e) => handleInputChange("vesselName", e.target.value)}
                      placeholder="Enter vessel name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vesselType">Vessel Type</Label>
                    <Select
                      value={formData.vesselType}
                      onValueChange={(value) => handleInputChange("vesselType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VESSEL_TYPES.map((type) => (
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
                    <Label htmlFor="flag">Flag</Label>
                    <Input
                      id="flag"
                      value={formData.flag}
                      onChange={(e) => handleInputChange("flag", e.target.value)}
                      placeholder="Country flag"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="grt">GRT</Label>
                    <Input
                      id="grt"
                      value={formData.grt}
                      onChange={(e) => handleInputChange("grt", e.target.value)}
                      placeholder="45,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nrt">NRT</Label>
                    <Input
                      id="nrt"
                      value={formData.nrt}
                      onChange={(e) => handleInputChange("nrt", e.target.value)}
                      placeholder="25,000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loa">LOA (m)</Label>
                    <Input
                      id="loa"
                      value={formData.loa}
                      onChange={(e) => handleInputChange("loa", e.target.value)}
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dwt">DWT</Label>
                    <Input
                      id="dwt"
                      value={formData.dwt}
                      onChange={(e) => handleInputChange("dwt", e.target.value)}
                      placeholder="80,000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="callSign">Call Sign</Label>
                    <Input
                      id="callSign"
                      value={formData.callSign}
                      onChange={(e) => handleInputChange("callSign", e.target.value)}
                      placeholder="ABCD1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="builtYear">Built Year</Label>
                    <Input
                      id="builtYear"
                      value={formData.builtYear}
                      onChange={(e) => handleInputChange("builtYear", e.target.value)}
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sscecExpiry">SSCEC Expiry</Label>
                    <Input
                      id="sscecExpiry"
                      type="date"
                      value={formData.sscecExpiry}
                      onChange={(e) => handleInputChange("sscecExpiry", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="piClub">P&I Club</Label>
                  <Input
                    id="piClub"
                    value={formData.piClub}
                    onChange={(e) => handleInputChange("piClub", e.target.value)}
                    placeholder="Enter P&I Club name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Client & Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Client & Operations</CardTitle>
                <CardDescription>Client information and operational details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientCompany">Client Company</Label>
                    <Select
                      value={formData.clientCompany}
                      onValueChange={(value) => handleInputChange("clientCompany", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLIENTS.map((client) => (
                          <SelectItem key={client.value} value={client.value}>
                            {client.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="agencyName">Agency Name</Label>
                    <Input
                      id="agencyName"
                      value={formData.agencyName}
                      onChange={(e) => handleInputChange("agencyName", e.target.value)}
                      placeholder="Enter agency name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="port">Port & Country</Label>
                      <Dialog open={isAddPortOpen} onOpenChange={setIsAddPortOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Port
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Port</DialogTitle>
                            <DialogDescription>Add a new port to the available ports list</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newPort">Port Name & Country</Label>
                              <Input
                                id="newPort"
                                value={newPortName}
                                onChange={(e) => setNewPortName(e.target.value)}
                                placeholder="e.g., Colombo, Sri Lanka"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddPortOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={addCustomPort}>Add Port</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select value={formData.port} onValueChange={(value) => handleInputChange("port", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select port" />
                      </SelectTrigger>
                      <SelectContent>
                        {customPorts.map((port) => (
                          <SelectItem key={port.value} value={port.value}>
                            {port.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eta">ETA (Estimated Time of Arrival)</Label>
                    <Input
                      id="eta"
                      type="datetime-local"
                      value={formData.eta}
                      onChange={(e) => handleInputChange("eta", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="formalityStatus">Status of Formalities</Label>
                      <Dialog open={isAddFormalityOpen} onOpenChange={setIsAddFormalityOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Status
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Formality Status</DialogTitle>
                            <DialogDescription>Add a new formality status to the available options</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="newFormality">Formality Status</Label>
                              <Input
                                id="newFormality"
                                value={newFormalityStatus}
                                onChange={(e) => setNewFormalityStatus(e.target.value)}
                                placeholder="e.g., Pre-Arrival Message"
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsAddFormalityOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={addCustomFormalityStatus}>Add Status</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select
                      value={formData.formalityStatus}
                      onValueChange={(value) => handleInputChange("formalityStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {customFormalityStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignedPIC">Assigned PIC</Label>
                    <Input
                      id="assignedPIC"
                      value={formData.assignedPIC}
                      onChange={(e) => handleInputChange("assignedPIC", e.target.value)}
                      placeholder="Will be assigned by Ops Manager"
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => handleInputChange("remarks", e.target.value)}
                    placeholder="Enter any additional remarks or special instructions"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Scope & Services</CardTitle>
                <CardDescription>Select required services for this port call</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="serviceSearch">Search Services</Label>
                    <Input
                      id="serviceSearch"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search services..."
                    />
                  </div>
                  <div className="flex items-end">
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Service</DialogTitle>
                          <DialogDescription>Add a new service to the available services list</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="newService">Service Name</Label>
                            <Input
                              id="newService"
                              value={newServiceName}
                              onChange={(e) => setNewServiceName(e.target.value)}
                              placeholder="Enter new service name"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addNewService}>Add Service</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={selectedServices.some((s) => s.name === service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label htmlFor={service} className="text-sm cursor-pointer">
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
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                          <div>
                            <span>{service.name}</span>
                            {service.vendor && <span className="text-blue-600 ml-2">({service.vendor})</span>}
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

            <Card>
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
                      ? CLIENTS.find((c) => c.value === formData.clientCompany)?.label
                      : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-medium">
                    {formData.port ? customPorts.find((p) => p.value === formData.port)?.label : "Not selected"}
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
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!formData.vesselName || !formData.clientCompany || selectedServices.length === 0}
            >
              Create Port Call
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
              <Label htmlFor="vendor">Available Vendors</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
                <SelectContent>
                  {VENDORS.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-gray-500">{vendor.category}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsVendorModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleVendorSelection} disabled={!selectedVendor}>
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
