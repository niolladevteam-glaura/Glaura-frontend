"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  MessageSquare,
  Plus,
  Search,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Anchor,
  Filter,
} from "lucide-react"
import Link from "next/link"

interface FeedbackItem {
  id: string
  type: "feedback" | "complaint"
  customerId: string
  customerName: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "in_progress" | "resolved"
  assignedTo: string
  createdBy: string
  createdAt: string
  updatedAt: string
  responses: FeedbackResponse[]
}

interface FeedbackResponse {
  id: string
  message: string
  staffMember: string
  createdAt: string
}

export default function FeedbackManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [filteredItems, setFilteredItems] = useState<FeedbackItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock feedback data
    const mockFeedback: FeedbackItem[] = [
      {
        id: "fb1",
        type: "complaint",
        customerId: "1",
        customerName: "Mediterranean Shipping Company",
        title: "Delayed Port Clearance",
        description:
          "Our vessel MSC Oscar experienced significant delays in port clearance procedures, causing schedule disruptions.",
        priority: "high",
        status: "in_progress",
        assignedTo: "Sandalu Nawarathne",
        createdBy: "John Smith",
        createdAt: "2024-01-10T09:00:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
        responses: [
          {
            id: "r1",
            message: "We have identified the issue and are working with port authorities to expedite the process.",
            staffMember: "Sandalu Nawarathne",
            createdAt: "2024-01-11T10:15:00Z",
          },
          {
            id: "r2",
            message: "Update: Clearance has been expedited. Vessel departed 2 hours behind schedule.",
            staffMember: "Sandalu Nawarathne",
            createdAt: "2024-01-12T14:30:00Z",
          },
        ],
      },
      {
        id: "fb2",
        type: "feedback",
        customerId: "2",
        customerName: "Maersk Line",
        title: "Excellent Service Quality",
        description:
          "We want to commend the team for their exceptional handling of our recent port call. Very professional service.",
        priority: "medium",
        status: "resolved",
        assignedTo: "Supun Rathnayaka",
        createdBy: "Lars Nielsen",
        createdAt: "2024-01-08T16:00:00Z",
        updatedAt: "2024-01-09T11:00:00Z",
        responses: [
          {
            id: "r3",
            message: "Thank you for the positive feedback. We'll share this with the entire team.",
            staffMember: "Supun Rathnayaka",
            createdAt: "2024-01-09T11:00:00Z",
          },
        ],
      },
      {
        id: "fb3",
        type: "complaint",
        customerId: "3",
        customerName: "COSCO Shipping Lines",
        title: "Communication Issues",
        description: "There was a lack of timely communication regarding berth availability changes.",
        priority: "medium",
        status: "open",
        assignedTo: "Chamod Asiridu",
        createdBy: "Wei Chen",
        createdAt: "2024-01-13T08:30:00Z",
        updatedAt: "2024-01-13T08:30:00Z",
        responses: [],
      },
    ]

    setFeedbackItems(mockFeedback)
    setFilteredItems(mockFeedback)
  }, [router])

  useEffect(() => {
    let filtered = feedbackItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    setFilteredItems(filtered)
  }, [searchTerm, statusFilter, typeFilter, feedbackItems])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Feedback & Complaints</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customer feedback management</p>
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
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Items</span>
                  <span className="font-medium">{feedbackItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Open</span>
                  <span className="font-medium text-red-600">
                    {feedbackItems.filter((item) => item.status === "open").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">In Progress</span>
                  <span className="font-medium text-yellow-600">
                    {feedbackItems.filter((item) => item.status === "in_progress").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Resolved</span>
                  <span className="font-medium text-green-600">
                    {feedbackItems.filter((item) => item.status === "resolved").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Feedback/Complaint
                </Button>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback & Complaint Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search feedback, complaints, or customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={item.type === "complaint" ? "destructive" : "secondary"}>
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </Badge>
                            <Badge variant={getPriorityColor(item.priority)}>{item.priority} priority</Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span className="text-sm capitalize">{item.status.replace("_", " ")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
                        <p className="font-medium">{item.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                        <p className="font-medium">{item.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                        <p className="font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Created by {item.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Updated {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No items found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No feedback or complaints logged yet"}
                    </p>
                    <Button onClick={() => setShowNewForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="responses">Responses ({selectedItem.responses.length})</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Feedback/Complaint Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Type</Label>
                            <p className="capitalize">{selectedItem.type}</p>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <p className="capitalize">{selectedItem.priority}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <p className="capitalize">{selectedItem.status.replace("_", " ")}</p>
                          </div>
                          <div>
                            <Label>Assigned To</Label>
                            <p>{selectedItem.assignedTo}</p>
                          </div>
                        </div>
                        <div>
                          <Label>Customer</Label>
                          <p>{selectedItem.customerName}</p>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <p className="text-gray-600 dark:text-gray-300">{selectedItem.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-4">
                    {selectedItem.responses.map((response) => (
                      <Card key={response.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{response.staffMember}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(response.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{response.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedItem.responses.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No responses yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="actions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Response</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="response">Response Message</Label>
                          <Textarea id="response" placeholder="Enter your response..." />
                        </div>
                        <div className="flex space-x-2">
                          <Button>Add Response</Button>
                          <Button variant="outline">Update Status</Button>
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
