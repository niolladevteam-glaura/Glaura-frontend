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
  Mail,
  MapPin,
  Building,
  User,
  Edit,
  Eye,
  MoreHorizontal,
  LogOut,
  Anchor,
  Cake,
} from "lucide-react"
import Link from "next/link"

interface PIC {
  id: string
  name: string
  department: string
  contactNumbers: string[]
  emails: string[]
  birthday: string
  remarks: string
  receiveUpdates: boolean
}

interface Customer {
  id: string
  companyName: string
  address: string
  landlineCountryCode: string
  landlineNumber: string
  groupEmails: string[]
  companyType: "Owners" | "Managers" | "Charterers" | "Bunker Traders"
  remarks: string
  pics: PIC[]
  createdAt: string
  lastUpdated: string
  totalPortCalls: number
  activePortCalls: number
}

export default function CustomerCompanies() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [birthdayAlerts, setBirthdayAlerts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock customer data
    const mockCustomers: Customer[] = [
      {
        id: "1",
        companyName: "Mediterranean Shipping Company",
        address: "MSC House, 123 Marine Drive, Geneva, Switzerland",
        landlineCountryCode: "+41",
        landlineNumber: "22-123-4567",
        groupEmails: ["operations@msc.com", "chartering@msc.com"],
        companyType: "Owners",
        remarks: "Major container shipping line, priority client",
        pics: [
          {
            id: "p1",
            name: "John Smith",
            department: "Operations",
            contactNumbers: ["+41-79-123-4567", "+41-22-987-6543"],
            emails: ["john.smith@msc.com", "j.smith@msc.com"],
            birthday: "1985-01-18",
            remarks: "Primary contact for Colombo operations",
            receiveUpdates: true,
          },
          {
            id: "p2",
            name: "Sarah Johnson",
            department: "Chartering",
            contactNumbers: ["+41-79-234-5678"],
            emails: ["sarah.johnson@msc.com"],
            birthday: "1990-03-25",
            remarks: "Handles vessel scheduling",
            receiveUpdates: true,
          },
        ],
        createdAt: "2023-01-15T10:00:00Z",
        lastUpdated: "2024-01-10T14:30:00Z",
        totalPortCalls: 45,
        activePortCalls: 3,
      },
      {
        id: "2",
        companyName: "Maersk Line",
        address: "Maersk Building, 456 Harbor Street, Copenhagen, Denmark",
        landlineCountryCode: "+45",
        landlineNumber: "33-123-4567",
        groupEmails: ["operations@maersk.com", "agency@maersk.com"],
        companyType: "Managers",
        remarks: "Global shipping company, regular client",
        pics: [
          {
            id: "p3",
            name: "Lars Nielsen",
            department: "Port Operations",
            contactNumbers: ["+45-20-123-456"],
            emails: ["lars.nielsen@maersk.com"],
            birthday: "1982-07-12",
            remarks: "Regional manager for South Asia",
            receiveUpdates: true,
          },
          {
            id: "p4",
            name: "Emma Andersen",
            department: "Commercial",
            contactNumbers: ["+45-30-987-654"],
            emails: ["emma.andersen@maersk.com"],
            birthday: "1988-11-30",
            remarks: "Commercial coordinator",
            receiveUpdates: false,
          },
        ],
        createdAt: "2023-02-20T09:00:00Z",
        lastUpdated: "2024-01-08T11:15:00Z",
        totalPortCalls: 38,
        activePortCalls: 2,
      },
      {
        id: "3",
        companyName: "COSCO Shipping Lines",
        address: "COSCO Tower, 789 Ocean Avenue, Shanghai, China",
        landlineCountryCode: "+86",
        landlineNumber: "21-6123-4567",
        groupEmails: ["operations@cosco.com"],
        companyType: "Charterers",
        remarks: "Chinese state-owned shipping company",
        pics: [
          {
            id: "p5",
            name: "Wei Chen",
            department: "Operations",
            contactNumbers: ["+86-138-0123-4567"],
            emails: ["wei.chen@cosco.com"],
            birthday: "1987-09-15",
            remarks: "Operations manager for Indian Ocean region",
            receiveUpdates: true,
          },
        ],
        createdAt: "2023-03-10T16:00:00Z",
        lastUpdated: "2024-01-05T09:45:00Z",
        totalPortCalls: 22,
        activePortCalls: 1,
      },
    ]

    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)

    // Calculate birthday alerts
    const today = new Date()
    const alerts: any[] = []

    mockCustomers.forEach((customer) => {
      customer.pics.forEach((pic) => {
        const birthday = new Date(pic.birthday)
        const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate())
        const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntil >= 0 && daysUntil <= 7) {
          alerts.push({
            name: pic.name,
            company: customer.companyName,
            birthday: thisYearBirthday,
            daysUntil,
          })
        }
      })
    })

    setBirthdayAlerts(alerts.sort((a, b) => a.daysUntil - b.daysUntil))
  }, [router])

  useEffect(() => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.pics.some((pic) => pic.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((customer) => customer.companyType.toLowerCase() === typeFilter)
    }

    setFilteredCustomers(filtered)
  }, [searchTerm, typeFilter, customers])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Customer Companies</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage client relationships</p>
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
            {/* Birthday Alerts */}
            <Card>
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
                          <Badge variant={alert.daysUntil <= 3 ? "destructive" : "secondary"} className="text-xs">
                            {alert.daysUntil === 0 ? "Today" : `${alert.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{alert.company}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {alert.birthday.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming birthdays</p>
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
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Customers</span>
                  <span className="font-medium">{customers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active Port Calls</span>
                  <span className="font-medium">{customers.reduce((sum, c) => sum + c.activePortCalls, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total PICs</span>
                  <span className="font-medium">{customers.reduce((sum, c) => sum + c.pics.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Birthday Alerts</span>
                  <span className="font-medium">{birthdayAlerts.length}</span>
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
                  <span>Customer Management</span>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
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
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Company Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="owners">Owners</SelectItem>
                      <SelectItem value="managers">Managers</SelectItem>
                      <SelectItem value="charterers">Charterers</SelectItem>
                      <SelectItem value="bunker traders">Bunker Traders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{customer.companyName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{customer.companyType}</Badge>
                            <Badge variant="secondary">{customer.pics.length} PICs</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
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
                          <p className="font-medium text-sm">{customer.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                          <p className="font-medium">
                            {customer.landlineCountryCode} {customer.landlineNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Emails</p>
                          <p className="font-medium text-sm">{customer.groupEmails.length} addresses</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Port Calls</p>
                        <p className="font-semibold text-lg">{customer.totalPortCalls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Port Calls</p>
                        <p className="font-semibold text-lg text-blue-600">{customer.activePortCalls}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                        <p className="font-medium">{new Date(customer.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {customer.remarks && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{customer.remarks}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredCustomers.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No customers found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || typeFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No customers registered yet"}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Customer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Customer Detail Modal/Sidebar */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedCustomer.companyName}</h2>
                  <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pics">PICs ({selectedCustomer.pics.length})</TabsTrigger>
                    <TabsTrigger value="history">Port Call History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Company Type</Label>
                            <p>{selectedCustomer.companyType}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Phone</Label>
                            <p>
                              {selectedCustomer.landlineCountryCode} {selectedCustomer.landlineNumber}
                            </p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Address</Label>
                          <p>{selectedCustomer.address}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Group Emails</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedCustomer.groupEmails.map((email, index) => (
                              <Badge key={index} variant="outline">
                                {email}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedCustomer.remarks && (
                          <div>
                            <Label className="text-sm font-medium">Remarks</Label>
                            <p className="text-gray-600 dark:text-gray-300">{selectedCustomer.remarks}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pics" className="space-y-4">
                    {selectedCustomer.pics.map((pic) => (
                      <Card key={pic.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h3 className="font-medium">{pic.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{pic.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {pic.receiveUpdates && (
                                <Badge variant="secondary" className="text-xs">
                                  Receives Updates
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                Birthday: {new Date(pic.birthday).toLocaleDateString()}
                              </Badge>
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

                  <TabsContent value="history">
                    <Card>
                      <CardHeader>
                        <CardTitle>Port Call History</CardTitle>
                        <CardDescription>Recent vessel operations for this customer</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400">Port call history will be displayed here</p>
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
