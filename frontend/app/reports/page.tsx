"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { BarChart3, TrendingUp, DollarSign, Ship, Users, Download, LogOut, Anchor, PieChart } from "lucide-react"
import Link from "next/link"

interface ReportData {
  portCallsByMonth: { month: string; count: number; revenue: number }[]
  portCallsByPort: { port: string; count: number; percentage: number }[]
  clientConversion: { month: string; inquiries: number; secured: number; missed: number }[]
  vendorPerformance: { vendor: string; rating: number; jobs: number; successRate: number }[]
  servicePopularity: { service: string; count: number; revenue: number }[]
}

export default function Reports() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [selectedPort, setSelectedPort] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Check if user has access to reports
    const restrictedLevels = ["C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"]
    if (restrictedLevels.includes(user.accessLevel)) {
      router.push("/dashboard")
      return
    }

    // Mock report data
    const mockReportData: ReportData = {
      portCallsByMonth: [
        { month: "Aug 2023", count: 45, revenue: 125000 },
        { month: "Sep 2023", count: 52, revenue: 142000 },
        { month: "Oct 2023", count: 48, revenue: 135000 },
        { month: "Nov 2023", count: 61, revenue: 168000 },
        { month: "Dec 2023", count: 58, revenue: 159000 },
        { month: "Jan 2024", count: 67, revenue: 185000 },
      ],
      portCallsByPort: [
        { port: "Colombo", count: 185, percentage: 65 },
        { port: "Galle", count: 67, percentage: 23 },
        { port: "Hambantota", count: 35, percentage: 12 },
      ],
      clientConversion: [
        { month: "Aug 2023", inquiries: 78, secured: 45, missed: 33 },
        { month: "Sep 2023", inquiries: 85, secured: 52, missed: 33 },
        { month: "Oct 2023", inquiries: 72, secured: 48, missed: 24 },
        { month: "Nov 2023", inquiries: 89, secured: 61, missed: 28 },
        { month: "Dec 2023", inquiries: 82, secured: 58, missed: 24 },
        { month: "Jan 2024", inquiries: 95, secured: 67, missed: 28 },
      ],
      vendorPerformance: [
        { vendor: "Lanka Marine Services", rating: 4.5, jobs: 156, successRate: 97 },
        { vendor: "Ceylon Transport Solutions", rating: 4.2, jobs: 89, successRate: 95 },
        { vendor: "Port Clearance Experts", rating: 4.8, jobs: 234, successRate: 98 },
        { vendor: "Island Bunker Services", rating: 4.1, jobs: 67, successRate: 94 },
        { vendor: "Maritime Supply Co", rating: 4.3, jobs: 123, successRate: 96 },
      ],
      servicePopularity: [
        { service: "Crew Changes", count: 145, revenue: 87000 },
        { service: "Ship Spares Clearance", count: 234, revenue: 156000 },
        { service: "Bunker Coordination", count: 89, revenue: 45000 },
        { service: "Fresh Water Supply", count: 167, revenue: 23000 },
        { service: "Provisions Supply", count: 198, revenue: 67000 },
        { service: "Launch Boat Services", count: 287, revenue: 98000 },
      ],
    }

    setReportData(mockReportData)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (!currentUser) {
    return <div>Loading...</div>
  }

  if (!reportData) {
    return <div>Loading report data...</div>
  }

  const totalPortCalls = reportData.portCallsByMonth.reduce((sum, item) => sum + item.count, 0)
  const totalRevenue = reportData.portCallsByMonth.reduce((sum, item) => sum + item.revenue, 0)
  const avgConversionRate =
    (reportData.clientConversion.reduce((sum, item) => sum + item.secured / item.inquiries, 0) /
      reportData.clientConversion.length) *
    100

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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Business intelligence dashboard</p>
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
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analytics Dashboard</span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="2years">Last 2 Years</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPort} onValueChange={setSelectedPort}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Port Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ports</SelectItem>
                  <SelectItem value="colombo">Colombo</SelectItem>
                  <SelectItem value="galle">Galle</SelectItem>
                  <SelectItem value="hambantota">Hambantota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Port Calls</CardTitle>
              <Ship className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPortCalls}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+3%</span> from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.vendorPerformance.length}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600">2 new</span> this month
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="clients">Client Performance</TabsTrigger>
            <TabsTrigger value="vendors">Vendor Analysis</TabsTrigger>
            <TabsTrigger value="services">Service Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Port Calls by Month */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Port Calls Trend</span>
                  </CardTitle>
                  <CardDescription>Monthly port call volume over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.portCallsByMonth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 text-sm text-gray-500 dark:text-gray-400">{item.month}</div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-32">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(item.count / Math.max(...reportData.portCallsByMonth.map((i) => i.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.count}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(item.revenue)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Port Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Port Distribution</span>
                  </CardTitle>
                  <CardDescription>Port call distribution by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.portCallsByPort.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-20 text-sm font-medium">{item.port}</div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-32">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.count}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Month</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.portCallsByMonth.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.month}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} port calls</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{formatCurrency(item.revenue)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.revenue / item.count)} avg
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Revenue</CardTitle>
                  <CardDescription>Revenue by service type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.servicePopularity
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{item.service}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} requests</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(item.revenue)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(item.revenue / item.count)} avg
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Conversion Analysis</CardTitle>
                <CardDescription>Inquiry to secured port call conversion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.clientConversion.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{item.month}</h3>
                        <Badge variant="outline">
                          {((item.secured / item.inquiries) * 100).toFixed(1)}% conversion
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Inquiries</p>
                          <p className="font-semibold text-lg">{item.inquiries}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Secured</p>
                          <p className="font-semibold text-lg text-green-600">{item.secured}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Missed</p>
                          <p className="font-semibold text-lg text-red-600">{item.missed}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-1">
                        <div
                          className="bg-green-500 h-2 rounded-l"
                          style={{ width: `${(item.secured / item.inquiries) * 100}%` }}
                        ></div>
                        <div
                          className="bg-red-500 h-2 rounded-r"
                          style={{ width: `${(item.missed / item.inquiries) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Analysis</CardTitle>
                <CardDescription>Performance metrics for service providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.vendorPerformance
                    .sort((a, b) => b.rating - a.rating)
                    .map((vendor, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{vendor.vendor}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{vendor.rating} ⭐</Badge>
                            <Badge variant={vendor.successRate >= 95 ? "default" : "secondary"}>
                              {vendor.successRate}% success
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Total Jobs</p>
                            <p className="font-semibold text-lg">{vendor.jobs}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Success Rate</p>
                            <p className="font-semibold text-lg">{vendor.successRate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Rating</p>
                            <p className="font-semibold text-lg">{vendor.rating}/5.0</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${vendor.successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Popularity & Revenue</CardTitle>
                <CardDescription>Most requested services and their revenue contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData.servicePopularity
                    .sort((a, b) => b.count - a.count)
                    .map((service, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium">{service.service}</h3>
                          <Badge variant="outline">#{index + 1} most popular</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Requests</p>
                            <p className="font-semibold text-lg">{service.count}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <p className="font-semibold text-lg">{formatCurrency(service.revenue)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Avg per Request</p>
                            <p className="font-semibold text-lg">{formatCurrency(service.revenue / service.count)}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${(service.count / Math.max(...reportData.servicePopularity.map((s) => s.count))) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
