"use client"

import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Building,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  Anchor,
  Star,
  AlertTriangle,
  FileText,
  X,
} from "lucide-react"
import Link from "next/link"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
const API_ENDPOINTS = {
  VENDORS: `${API_BASE_URL}/vendors`,
  VENDOR_PICS: `${API_BASE_URL}/vendor-pics`,
  VENDOR_DOCUMENTS: `${API_BASE_URL}/vendor-documents`,
}

interface VendorPIC {
  id: string
  name: string
  department: string
  contactNumbers: string[]
  emails: string[]
  remarks: string
}

interface Document {
  id: string
  name: string
  type: string
  uploadedAt: string
  expiryDate?: string
  status: "Valid" | "Expiring" | "Expired"
}

interface Vendor {
  id: string
  companyName: string
  address: string
  landlineCountryCode: string
  landlineNumber: string
  groupEmails: string[]
  companyType: string
  serviceCategories: string[]
  pics: VendorPIC[]
  documents: Document[]
  rating: number
  totalJobs: number
  completedJobs: number
  createdAt: string
  lastUpdated: string
  kycStatus: "Pending" | "Approved" | "Rejected"
  remarks: string
}

const DEFAULT_SERVICE_CATEGORIES = [
  "Launch Boat Services",
  "Transport",
  "Clearance Agent",
  "Supply",
  "Underwater Services",
  "Bunkering",
  "Repairs",
  "Medical",
  "Pilot Transfer",
  "Crew Transfer",
  "Customs Clearance",
  "Ship Spares Clearance",
  "Documentation",
  "Crew Transportation",
  "Cargo Transport",
  "Airport Transfer",
]

export default function VendorManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Add/Edit Vendor Modal States
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({
    companyName: "",
    address: "",
    landlineCountryCode: "+94",
    landlineNumber: "",
    groupEmails: [""],
    companyType: "",
    serviceCategories: [],
    remarks: "",
    kycStatus: "Pending",
    rating: 0,
    totalJobs: 0,
    completedJobs: 0,
    pics: [],
    documents: [],
  })

  const router = useRouter()

  // API Functions
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers here
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

  // Load vendors from API
  const loadVendors = async () => {
    try {
      setLoading(true)

      // TODO: Replace with actual API call
      // const response = await apiCall(API_ENDPOINTS.VENDORS)
      // setVendors(response.data || [])

      // Mock data for now
      const mockVendors: Vendor[] = [
        {
          id: "1",
          companyName: "Lanka Marine Services",
          address: "Marine Drive, Colombo 03, Sri Lanka",
          landlineCountryCode: "+94",
          landlineNumber: "11-234-5678",
          groupEmails: ["operations@lankamarine.lk", "admin@lankamarine.lk"],
          companyType: "Launch Boat Operator",
          serviceCategories: ["Launch Boat Services", "Pilot Transfer", "Crew Transfer"],
          pics: [
            {
              id: "vp1",
              name: "Pradeep Silva",
              department: "Operations",
              contactNumbers: ["+94-77-123-4567"],
              emails: ["pradeep@lankamarine.lk"],
              remarks: "Primary contact for launch boat operations",
            },
          ],
          documents: [
            {
              id: "d1",
              name: "Marine License",
              type: "License",
              uploadedAt: "2023-06-15T10:00:00Z",
              expiryDate: "2024-06-15",
              status: "Expiring",
            },
            {
              id: "d2",
              name: "Insurance Certificate",
              type: "Insurance",
              uploadedAt: "2023-12-01T10:00:00Z",
              expiryDate: "2024-12-01",
              status: "Valid",
            },
          ],
          rating: 4.5,
          totalJobs: 156,
          completedJobs: 152,
          createdAt: "2023-01-15T10:00:00Z",
          lastUpdated: "2024-01-10T14:30:00Z",
          kycStatus: "Approved",
          remarks: "Reliable launch boat operator, excellent service record",
        },
        {
          id: "2",
          companyName: "Ceylon Transport Solutions",
          address: "Industrial Zone, Katunayake, Sri Lanka",
          landlineCountryCode: "+94",
          landlineNumber: "11-345-6789",
          groupEmails: ["dispatch@ceylontransport.lk"],
          companyType: "Transport",
          serviceCategories: ["Crew Transportation", "Cargo Transport", "Airport Transfer"],
          pics: [
            {
              id: "vp2",
              name: "Kumara Perera",
              department: "Dispatch",
              contactNumbers: ["+94-71-987-6543"],
              emails: ["kumara@ceylontransport.lk"],
              remarks: "Fleet manager",
            },
          ],
          documents: [
            {
              id: "d3",
              name: "Transport License",
              type: "License",
              uploadedAt: "2023-08-20T10:00:00Z",
              expiryDate: "2024-08-20",
              status: "Valid",
            },
            {
              id: "d4",
              name: "Vehicle Insurance",
              type: "Insurance",
              uploadedAt: "2023-01-10T10:00:00Z",
              expiryDate: "2024-01-10",
              status: "Expired",
            },
          ],
          rating: 4.2,
          totalJobs: 89,
          completedJobs: 85,
          createdAt: "2023-02-20T09:00:00Z",
          lastUpdated: "2024-01-08T11:15:00Z",
          kycStatus: "Approved",
          remarks: "Good transport service, occasional delays",
        },
        {
          id: "3",
          companyName: "Port Clearance Experts",
          address: "Fort, Colombo 01, Sri Lanka",
          landlineCountryCode: "+94",
          landlineNumber: "11-456-7890",
          groupEmails: ["clearance@portexperts.lk", "customs@portexperts.lk"],
          companyType: "Clearance Agent",
          serviceCategories: ["Customs Clearance", "Ship Spares Clearance", "Documentation"],
          pics: [
            {
              id: "vp3",
              name: "Nimal Fernando",
              department: "Customs",
              contactNumbers: ["+94-76-555-1234"],
              emails: ["nimal@portexperts.lk"],
              remarks: "Senior customs agent",
            },
            {
              id: "vp4",
              name: "Sita Jayawardena",
              department: "Documentation",
              contactNumbers: ["+94-75-444-5678"],
              emails: ["sita@portexperts.lk"],
              remarks: "Documentation specialist",
            },
          ],
          documents: [
            {
              id: "d5",
              name: "Customs Agent License",
              type: "License",
              uploadedAt: "2023-03-15T10:00:00Z",
              expiryDate: "2025-03-15",
              status: "Valid",
            },
          ],
          rating: 4.8,
          totalJobs: 234,
          completedJobs: 230,
          createdAt: "2023-03-10T16:00:00Z",
          lastUpdated: "2024-01-05T09:45:00Z",
          kycStatus: "Approved",
          remarks: "Excellent clearance agent, very efficient",
        },
      ]

      setVendors(mockVendors)
      setFilteredVendors(mockVendors)
      calculateExpiryAlerts(mockVendors)
    } catch (error) {
      console.error("Failed to load vendors:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateExpiryAlerts = (vendorList: Vendor[]) => {
    const today = new Date()
    const alerts: any[] = []

    vendorList.forEach((vendor) => {
      vendor.documents.forEach((doc) => {
        if (doc.expiryDate) {
          const expiryDate = new Date(doc.expiryDate)
          const daysUntil = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntil <= 15 && daysUntil >= 0) {
            alerts.push({
              vendorName: vendor.companyName,
              documentName: doc.name,
              documentType: doc.type,
              expiryDate,
              daysUntil,
              status: daysUntil <= 0 ? "Expired" : daysUntil <= 7 ? "Critical" : "Warning",
            })
          }
        }
      })
    })

    setExpiryAlerts(alerts.sort((a, b) => a.daysUntil - b.daysUntil))
  }

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    loadVendors()
  }, [router])

  useEffect(() => {
    let filtered = vendors

    if (searchTerm) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.companyType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vendor.serviceCategories.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((vendor) => vendor.companyType.toLowerCase().includes(typeFilter.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vendor) => vendor.kycStatus.toLowerCase() === statusFilter)
    }

    setFilteredVendors(filtered)
  }, [searchTerm, typeFilter, statusFilter, vendors])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  // Vendor form handlers
  const handleVendorFormChange = (field: string, value: any) => {
    setVendorForm((prev) => ({ ...prev, [field]: value }))
  }

  const addGroupEmail = () => {
    setVendorForm((prev) => ({
      ...prev,
      groupEmails: [...(prev.groupEmails || []), ""],
    }))
  }

  const updateGroupEmail = (index: number, value: string) => {
    setVendorForm((prev) => ({
      ...prev,
      groupEmails: prev.groupEmails?.map((email, i) => (i === index ? value : email)) || [],
    }))
  }

  const removeGroupEmail = (index: number) => {
    setVendorForm((prev) => ({
      ...prev,
      groupEmails: prev.groupEmails?.filter((_, i) => i !== index) || [],
    }))
  }

  const toggleServiceCategory = (category: string) => {
    setVendorForm((prev) => {
      const categories = prev.serviceCategories || []
      const isSelected = categories.includes(category)

      return {
        ...prev,
        serviceCategories: isSelected ? categories.filter((c) => c !== category) : [...categories, category],
      }
    })
  }

  // Save vendor function - API ready
  const saveVendor = async () => {
    if (!vendorForm.companyName?.trim()) {
      alert("Please enter a company name")
      return
    }

    try {
      setLoading(true)

      const vendorData = {
        ...vendorForm,
        groupEmails: vendorForm.groupEmails?.filter((email) => email.trim()) || [],
        id: editingVendor?.id || Date.now().toString(),
        createdAt: editingVendor?.createdAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        pics: editingVendor?.pics || [],
        documents: editingVendor?.documents || [],
      }

      // TODO: Replace with actual API call
      // if (editingVendor) {
      //   await apiCall(`${API_ENDPOINTS.VENDORS}/${editingVendor.id}`, {
      //     method: 'PUT',
      //     body: JSON.stringify(vendorData)
      //   })
      // } else {
      //   await apiCall(API_ENDPOINTS.VENDORS, {
      //     method: 'POST',
      //     body: JSON.stringify(vendorData)
      //   })
      // }

      // Update local state
      if (editingVendor) {
        setVendors((prev) => prev.map((v) => (v.id === editingVendor.id ? (vendorData as Vendor) : v)))
      } else {
        setVendors((prev) => [...prev, vendorData as Vendor])
      }

      // Reset form and close modal
      setVendorForm({
        companyName: "",
        address: "",
        landlineCountryCode: "+94",
        landlineNumber: "",
        groupEmails: [""],
        companyType: "",
        serviceCategories: [],
        remarks: "",
        kycStatus: "Pending",
        rating: 0,
        totalJobs: 0,
        completedJobs: 0,
        pics: [],
        documents: [],
      })
      setEditingVendor(null)
      setIsAddVendorOpen(false)

      console.log(editingVendor ? "Vendor updated:" : "Vendor created:", vendorData)
    } catch (error) {
      console.error("Failed to save vendor:", error)
      alert("Failed to save vendor. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Edit vendor function
  const editVendor = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setVendorForm({
      companyName: vendor.companyName,
      address: vendor.address,
      landlineCountryCode: vendor.landlineCountryCode,
      landlineNumber: vendor.landlineNumber,
      groupEmails: vendor.groupEmails,
      companyType: vendor.companyType,
      serviceCategories: vendor.serviceCategories,
      remarks: vendor.remarks,
      kycStatus: vendor.kycStatus,
      rating: vendor.rating,
      totalJobs: vendor.totalJobs,
      completedJobs: vendor.completedJobs,
      pics: vendor.pics,
      documents: vendor.documents,
    })
    setIsAddVendorOpen(true)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case "Valid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Expiring":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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
              <div className="flex items-center space-x-2">
                <div className="bg-primary p-2 rounded-xl">
                  <Anchor className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">Vendor Management</h1>
                  <p className="text-sm text-muted-foreground">Manage service providers</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
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
                          <p className="font-medium text-sm">{alert.documentName}</p>
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
                            {alert.daysUntil <= 0 ? "Expired" : `${alert.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.vendorName}</p>
                        <p className="text-xs text-muted-foreground">{alert.expiryDate.toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No expiring documents</p>
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
                  <span className="text-sm text-muted-foreground">Total Vendors</span>
                  <span className="font-medium">{vendors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Approved KYC</span>
                  <span className="font-medium">{vendors.filter((v) => v.kycStatus === "Approved").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pending KYC</span>
                  <span className="font-medium">{vendors.filter((v) => v.kycStatus === "Pending").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Document Alerts</span>
                  <span className="font-medium">{expiryAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Rating</span>
                  <span className="font-medium">
                    {vendors.length > 0
                      ? (vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)
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
                <CardTitle className="flex items-center justify-between">
                  <span>Vendor Management</span>
                  <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
                    <DialogTrigger asChild>
                      <Button className="professional-button-primary" disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                        <DialogDescription>
                          {editingVendor ? "Update vendor information" : "Add a new vendor to the system"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Company Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="companyName" className="form-label">
                                Company Name *
                              </Label>
                              <Input
                                id="companyName"
                                value={vendorForm.companyName || ""}
                                onChange={(e) => handleVendorFormChange("companyName", e.target.value)}
                                placeholder="Enter company name"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="companyType" className="form-label">
                                Company Type
                              </Label>
                              <Input
                                id="companyType"
                                value={vendorForm.companyType || ""}
                                onChange={(e) => handleVendorFormChange("companyType", e.target.value)}
                                placeholder="e.g., Launch Boat Operator"
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="address" className="form-label">
                              Address
                            </Label>
                            <Textarea
                              id="address"
                              value={vendorForm.address || ""}
                              onChange={(e) => handleVendorFormChange("address", e.target.value)}
                              placeholder="Enter company address"
                              className="form-input"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="landlineCountryCode" className="form-label">
                                Country Code
                              </Label>
                              <Input
                                id="landlineCountryCode"
                                value={vendorForm.landlineCountryCode || ""}
                                onChange={(e) => handleVendorFormChange("landlineCountryCode", e.target.value)}
                                placeholder="+94"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <Label htmlFor="landlineNumber" className="form-label">
                                Landline Number
                              </Label>
                              <Input
                                id="landlineNumber"
                                value={vendorForm.landlineNumber || ""}
                                onChange={(e) => handleVendorFormChange("landlineNumber", e.target.value)}
                                placeholder="11-234-5678"
                                className="form-input"
                              />
                            </div>
                          </div>

                          {/* Group Emails */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="form-label">Group Emails</Label>
                              <Button type="button" variant="outline" size="sm" onClick={addGroupEmail}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Email
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {vendorForm.groupEmails?.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    value={email}
                                    onChange={(e) => updateGroupEmail(index, e.target.value)}
                                    placeholder="email@company.com"
                                    className="form-input"
                                  />
                                  {vendorForm.groupEmails!.length > 1 && (
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

                          {/* Service Categories */}
                          <div>
                            <Label className="form-label">Service Categories</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                              {DEFAULT_SERVICE_CATEGORIES.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={category}
                                    checked={vendorForm.serviceCategories?.includes(category) || false}
                                    onChange={() => toggleServiceCategory(category)}
                                    className="rounded border-gray-300"
                                  />
                                  <Label htmlFor={category} className="text-sm cursor-pointer">
                                    {category}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="kycStatus" className="form-label">
                                KYC Status
                              </Label>
                              <Select
                                value={vendorForm.kycStatus}
                                onValueChange={(value) => handleVendorFormChange("kycStatus", value)}
                              >
                                <SelectTrigger className="form-input">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Approved">Approved</SelectItem>
                                  <SelectItem value="Rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="rating" className="form-label">
                                Rating (0-5)
                              </Label>
                              <Input
                                id="rating"
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={vendorForm.rating || 0}
                                onChange={(e) =>
                                  handleVendorFormChange("rating", Number.parseFloat(e.target.value) || 0)
                                }
                                className="form-input"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="remarks" className="form-label">
                              Remarks
                            </Label>
                            <Textarea
                              id="remarks"
                              value={vendorForm.remarks || ""}
                              onChange={(e) => handleVendorFormChange("remarks", e.target.value)}
                              placeholder="Additional notes about the vendor"
                              className="form-input"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddVendorOpen(false)
                            setEditingVendor(null)
                            setVendorForm({
                              companyName: "",
                              address: "",
                              landlineCountryCode: "+94",
                              landlineNumber: "",
                              groupEmails: [""],
                              companyType: "",
                              serviceCategories: [],
                              remarks: "",
                              kycStatus: "Pending",
                              rating: 0,
                              totalJobs: 0,
                              completedJobs: 0,
                              pics: [],
                              documents: [],
                            })
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveVendor}
                          className="professional-button-primary"
                          disabled={loading || !vendorForm.companyName?.trim()}
                        >
                          {loading ? "Saving..." : editingVendor ? "Update Vendor" : "Add Vendor"}
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
                        placeholder="Search vendors, services, or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 form-input"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48 form-input">
                        <SelectValue placeholder="Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="launch boat">Launch Boat</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="clearance">Clearance Agent</SelectItem>
                        <SelectItem value="supply">Supply</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 form-input">
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
                  <Card key={vendor.id} className="professional-card hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
                            <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{vendor.companyName}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{vendor.companyType}</Badge>
                              <Badge className={getKycStatusColor(vendor.kycStatus)}>{vendor.kycStatus}</Badge>
                              <div className="flex items-center space-x-1">
                                {renderStars(vendor.rating)}
                                <span className="text-sm text-muted-foreground ml-1">
                                  {vendor.rating} ({vendor.totalJobs} jobs)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedVendor(vendor)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => editVendor(vendor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="font-medium text-sm">{vendor.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">
                              {vendor.landlineCountryCode} {vendor.landlineNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Documents</p>
                            <p className="font-medium">{vendor.documents.length} uploaded</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Service Categories</p>
                        <div className="flex flex-wrap gap-2">
                          {vendor.serviceCategories.map((category, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Jobs</p>
                          <p className="font-semibold text-lg">{vendor.totalJobs}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Completed</p>
                          <p className="font-semibold text-lg text-green-600">{vendor.completedJobs}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Success Rate</p>
                          <p className="font-semibold text-lg">
                            {vendor.totalJobs > 0 ? Math.round((vendor.completedJobs / vendor.totalJobs) * 100) : 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">PICs</p>
                          <p className="font-semibold text-lg">{vendor.pics.length}</p>
                        </div>
                      </div>

                      {vendor.remarks && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">{vendor.remarks}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="professional-card">
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No vendors found</h3>
                    <p className="text-muted-foreground">No vendors match your search criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={() => setSelectedVendor(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVendor.companyName} Details</DialogTitle>
                <DialogDescription>Detailed information about {selectedVendor.companyName}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Company Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">Company Name</Label>
                      <Input value={selectedVendor.companyName} readOnly className="form-input" />
                    </div>
                    <div>
                      <Label className="form-label">Company Type</Label>
                      <Input value={selectedVendor.companyType} readOnly className="form-input" />
                    </div>
                  </div>

                  <div>
                    <Label className="form-label">Address</Label>
                    <Textarea value={selectedVendor.address} readOnly className="form-input" rows={3} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">Country Code</Label>
                      <Input value={selectedVendor.landlineCountryCode} readOnly className="form-input" />
                    </div>
                    <div>
                      <Label className="form-label">Landline Number</Label>
                      <Input value={selectedVendor.landlineNumber} readOnly className="form-input" />
                    </div>
                  </div>

                  {/* Group Emails */}
                  <div>
                    <Label className="form-label">Group Emails</Label>
                    <div className="space-y-2">
                      {selectedVendor.groupEmails.map((email, index) => (
                        <Input key={index} value={email} readOnly className="form-input" />
                      ))}
                    </div>
                  </div>

                  {/* Service Categories */}
                  <div>
                    <Label className="form-label">Service Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedVendor.serviceCategories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="form-label">KYC Status</Label>
                      <Input value={selectedVendor.kycStatus} readOnly className="form-input" />
                    </div>
                    <div>
                      <Label className="form-label">Rating</Label>
                      <div className="flex items-center">
                        {renderStars(selectedVendor.rating)}
                        <span className="ml-2">{selectedVendor.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="form-label">Remarks</Label>
                    <Textarea value={selectedVendor.remarks} readOnly className="form-input" rows={3} />
                  </div>
                </div>

                {/* Vendor PICs */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vendor PICs</h3>
                  {selectedVendor.pics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVendor.pics.map((pic) => (
                        <Card key={pic.id} className="professional-card">
                          <CardContent className="space-y-2">
                            <p className="font-medium">{pic.name}</p>
                            <p className="text-sm text-muted-foreground">Department: {pic.department}</p>
                            <p className="text-sm text-muted-foreground">Email: {pic.emails.join(", ")}</p>
                            <p className="text-sm text-muted-foreground">Contact: {pic.contactNumbers.join(", ")}</p>
                            {pic.remarks && <p className="text-sm text-muted-foreground">Remarks: {pic.remarks}</p>}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No PICs available</p>
                  )}
                </div>

                {/* Vendor Documents */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Vendor Documents</h3>
                  {selectedVendor.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVendor.documents.map((doc) => (
                        <Card key={doc.id} className="professional-card">
                          <CardContent className="space-y-2">
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">Type: {doc.type}</p>
                            <p className="text-sm text-muted-foreground">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                            {doc.expiryDate && (
                              <p className="text-sm text-muted-foreground">
                                Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                            <Badge className={getDocumentStatusColor(doc.status)}>{doc.status}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No documents available</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
