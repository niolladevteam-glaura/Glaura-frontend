"use client"

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
  Ship,
  Search,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  Anchor,
  AlertTriangle,
  Calendar,
  Flag,
  Building,
} from "lucide-react"
import Link from "next/link"

interface Vessel {
  id: string
  name: string
  imo: string
  flag: string
  vesselType: string
  grt: number
  nrt: number
  dwt: number
  loa: number
  builtYear: number
  callSign: string
  sscecExpiry: string
  sscecStatus: "Valid" | "Expiring" | "Expired"
  owner: string
  manager: string
  piClub: string
  lastPortCall: string
  totalPortCalls: number
  createdAt: string
  lastUpdated: string
}

export default function VesselManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTab, setSelectedTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock vessel data
    const mockVessels: Vessel[] = [
      {
        id: "1",
        name: "MSC Oscar",
        imo: "9876543",
        flag: "Panama",
        vesselType: "Container Ship",
        grt: 195000,
        nrt: 58500,
        dwt: 199400,
        loa: 395,
        builtYear: 2015,
        callSign: "3EJK2",
        sscecExpiry: "2024-03-15",
        sscecStatus: "Expiring",
        owner: "Mediterranean Shipping Company",
        manager: "MSC Ship Management",
        piClub: "Britannia P&I Club",
        lastPortCall: "2024-01-15",
        totalPortCalls: 45,
        createdAt: "2023-01-15T10:00:00Z",
        lastUpdated: "2024-01-15T14:30:00Z",
      },
      {
        id: "2",
        name: "Maersk Gibraltar",
        imo: "9654321",
        flag: "Denmark",
        vesselType: "Container Ship",
        grt: 165000,
        nrt: 49500,
        dwt: 180000,
        loa: 380,
        builtYear: 2018,
        callSign: "OZJM2",
        sscecExpiry: "2024-08-20",
        sscecStatus: "Valid",
        owner: "Maersk Line",
        manager: "Maersk Ship Management",
        piClub: "Gard P&I Club",
        lastPortCall: "2024-01-16",
        totalPortCalls: 32,
        createdAt: "2023-02-20T09:00:00Z",
        lastUpdated: "2024-01-16T11:15:00Z",
      },
      {
        id: "3",
        name: "COSCO Shipping",
        imo: "9543210",
        flag: "China",
        vesselType: "Container Ship",
        grt: 140000,
        nrt: 42000,
        dwt: 155000,
        loa: 350,
        builtYear: 2020,
        callSign: "BQXM8",
        sscecExpiry: "2023-12-10",
        sscecStatus: "Expired",
        owner: "COSCO Shipping Lines",
        manager: "COSCO Ship Management",
        piClub: "China P&I Club",
        lastPortCall: "2024-01-17",
        totalPortCalls: 28,
        createdAt: "2023-03-10T16:00:00Z",
        lastUpdated: "2024-01-17T18:00:00Z",
      },
      {
        id: "4",
        name: "Ever Given",
        imo: "9811000",
        flag: "Panama",
        vesselType: "Container Ship",
        grt: 220000,
        nrt: 66000,
        dwt: 224000,
        loa: 400,
        builtYear: 2018,
        callSign: "H3RC",
        sscecExpiry: "2024-06-30",
        sscecStatus: "Valid",
        owner: "Evergreen Marine",
        manager: "Evergreen Ship Management",
        piClub: "UK P&I Club",
        lastPortCall: "2024-01-18",
        totalPortCalls: 38,
        createdAt: "2023-04-05T12:00:00Z",
        lastUpdated: "2024-01-18T10:15:00Z",
      },
      {
        id: "5",
        name: "Hapag Express",
        imo: "9765432",
        flag: "Germany",
        vesselType: "Container Ship",
        grt: 175000,
        nrt: 52500,
        dwt: 190000,
        loa: 385,
        builtYear: 2019,
        callSign: "DKBM4",
        sscecExpiry: "2024-02-28",
        sscecStatus: "Expiring",
        owner: "Hapag-Lloyd",
        manager: "Hapag-Lloyd Ship Management",
        piClub: "Skuld P&I Club",
        lastPortCall: "2024-01-19",
        totalPortCalls: 25,
        createdAt: "2023-05-12T14:00:00Z",
        lastUpdated: "2024-01-19T16:30:00Z",
      },
    ]

    setVessels(mockVessels)
    setFilteredVessels(mockVessels)
  }, [router])

  useEffect(() => {
    let filtered = vessels

    if (searchTerm) {
      filtered = filtered.filter(
        (vessel) =>
          vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vessel.imo.includes(searchTerm) ||
          vessel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vessel.flag.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((vessel) => vessel.vesselType.toLowerCase().includes(typeFilter.toLowerCase()))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((vessel) => vessel.sscecStatus.toLowerCase() === statusFilter)
    }

    if (selectedTab !== "all") {
      switch (selectedTab) {
        case "valid":
          filtered = filtered.filter((vessel) => vessel.sscecStatus === "Valid")
          break
        case "expiring":
          filtered = filtered.filter((vessel) => vessel.sscecStatus === "Expiring")
          break
        case "expired":
          filtered = filtered.filter((vessel) => vessel.sscecStatus === "Expired")
          break
      }
    }

    setFilteredVessels(filtered)
  }, [searchTerm, typeFilter, statusFilter, selectedTab, vessels])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getSSCECStatusColor = (status: string) => {
    switch (status) {
      case "Valid":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      case "Expiring":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getSSCECIcon = (status: string) => {
    switch (status) {
      case "Expired":
      case "Expiring":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Vessel Management</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage vessel details and SSCEC status</p>
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Vessels ({vessels.length})</TabsTrigger>
              <TabsTrigger value="valid">
                Valid SSCEC ({vessels.filter((v) => v.sscecStatus === "Valid").length})
              </TabsTrigger>
              <TabsTrigger value="expiring">
                Expiring ({vessels.filter((v) => v.sscecStatus === "Expiring").length})
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired ({vessels.filter((v) => v.sscecStatus === "Expired").length})
              </TabsTrigger>
            </TabsList>

            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vessel
            </Button>
          </div>

          <TabsContent value={selectedTab} className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Vessel Database</CardTitle>
                <CardDescription>Manage vessel information and track SSCEC expiry dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by vessel name, IMO, owner, or flag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Vessel Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="container">Container Ship</SelectItem>
                        <SelectItem value="bulk">Bulk Carrier</SelectItem>
                        <SelectItem value="tanker">Tanker</SelectItem>
                        <SelectItem value="general">General Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="SSCEC Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vessels List */}
            <div className="space-y-4">
              {filteredVessels.map((vessel) => (
                <Card key={vessel.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <Ship className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{vessel.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">IMO: {vessel.imo}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{vessel.vesselType}</Badge>
                            <Badge className={getSSCECStatusColor(vessel.sscecStatus)}>
                              {getSSCECIcon(vessel.sscecStatus)}
                              <span className="ml-1">{vessel.sscecStatus}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Flag</p>
                          <p className="font-medium">{vessel.flag}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                          <p className="font-medium text-sm">{vessel.owner}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Call Sign</p>
                        <p className="font-medium">{vessel.callSign}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Built Year</p>
                        <p className="font-medium">{vessel.builtYear}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">GRT</p>
                        <p className="font-medium">{vessel.grt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">DWT</p>
                        <p className="font-medium">{vessel.dwt.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">LOA</p>
                        <p className="font-medium">{vessel.loa}m</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Port Calls</p>
                        <p className="font-medium">{vessel.totalPortCalls}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            SSCEC Expires: {new Date(vessel.sscecExpiry).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Ship className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Last Port Call: {new Date(vessel.lastPortCall).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Updated: {new Date(vessel.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredVessels.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Ship className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No vessels found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No vessels registered yet"}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Vessel
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
