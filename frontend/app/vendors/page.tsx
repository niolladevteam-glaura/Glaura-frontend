"use client"

import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Building,
  User,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  Anchor,
  Star,
  AlertTriangle,
  FileText,
  Upload,
  Download,
} from "lucide-react"
import Link from "next/link"

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

export default function VendorManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [expiryAlerts, setExpiryAlerts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock vendor data
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

    // Calculate expiry alerts
    const today = new Date()
    const alerts: any[] = []

    mockVendors.forEach((vendor) => {
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
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vendor Management</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage service providers</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
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
            {/* Document Expiry Alerts */}
            <Card>
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">{alert.vendorName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.expiryDate.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No expiring documents</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Vendors</span>
                  <span className="font-medium">{vendors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Approved KYC</span>
                  <span className="font-medium">{vendors.filter((v) => v.kycStatus === "Approved").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Pending KYC</span>
                  <span className="font-medium">{vendors.filter((v) => v.kycStatus === "Pending").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Document Alerts</span>
                  <span className="font-medium">{expiryAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vendor Management</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
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
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48">
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
                      <SelectTrigger className="w-40">
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
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                          <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{vendor.companyName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{vendor.companyType}</Badge>
                            <Badge className={getKycStatusColor(vendor.kycStatus)}>{vendor.kycStatus}</Badge>
                            <div className="flex items-center space-x-1">
                              {renderStars(vendor.rating)}
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
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
                        <Button variant="outline" size="sm">
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
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                          <p className="font-medium text-sm">{vendor.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium">
                            {vendor.landlineCountryCode} {vendor.landlineNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
                          <p className="font-medium">{vendor.documents.length} uploaded</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Service Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {vendor.serviceCategories.map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
                        <p className="font-semibold text-lg">{vendor.totalJobs}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                        <p className="font-semibold text-lg text-green-600">{vendor.completedJobs}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                        <p className="font-semibold text-lg">
                          {vendor.totalJobs > 0 ? Math.round((vendor.completedJobs / vendor.totalJobs) * 100) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">PICs</p>
                        <p className="font-semibold text-lg">{vendor.pics.length}</p>
                      </div>
                    </div>

                    {vendor.remarks && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{vendor.remarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredVendors.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No vendors found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No vendors registered yet"}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Vendor
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Detail Modal */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">{selectedVendor.companyName}</h2>
                    <Badge className={getKycStatusColor(selectedVendor.kycStatus)}>{selectedVendor.kycStatus}</Badge>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pics">PICs ({selectedVendor.pics.length})</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({selectedVendor.documents.length})</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Company Type</Label>
                            <p>{selectedVendor.companyType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p>
                              {selectedVendor.landlineCountryCode} {selectedVendor.landlineNumber}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Address</Label>
                            <p>{selectedVendor.address}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Group Emails</Label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedVendor.groupEmails.map((email, index) => (
                                <Badge key={index} variant="outline">
                                  {email}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Service Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedVendor.serviceCategories.map((category, index) => (
                              <Badge key={index} variant="secondary">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedVendor.remarks && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Remarks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 dark:text-gray-300">{selectedVendor.remarks}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="pics" className="space-y-4">
                    {selectedVendor.pics.map((pic) => (
                      <Card key={pic.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-medium">{pic.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{pic.department}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Contact Numbers</Label>
                              <div className="space-y-1">
                                {pic.contactNumbers.map((number, index) => (
                                  <p key={index} className="text-sm">
                                    {number}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Email Addresses</Label>
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
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <Label className="text-sm font-medium">Remarks</Label>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{pic.remarks}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">KYC Documents</h3>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {selectedVendor.documents.map((doc) => (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {doc.type} • Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                  {doc.expiryDate && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getDocumentStatusColor(doc.status)}>{doc.status}</Badge>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Overall Rating</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-3xl font-bold mb-2">{selectedVendor.rating}</div>
                            <div className="flex justify-center space-x-1 mb-2">
                              {renderStars(selectedVendor.rating)}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Based on {selectedVendor.totalJobs} jobs
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Job Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span>Total Jobs</span>
                            <span className="font-medium">{selectedVendor.totalJobs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Completed</span>
                            <span className="font-medium text-green-600">{selectedVendor.completedJobs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success Rate</span>
                            <span className="font-medium">
                              {selectedVendor.totalJobs > 0
                                ? Math.round((selectedVendor.completedJobs / selectedVendor.totalJobs) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Recent Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2 text-green-600">Excellent</div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Consistently high performance over the last 6 months
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance History</CardTitle>
                        <CardDescription>Job completion and rating trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Performance charts will be displayed here</p>
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
  )
}
