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
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  LogOut,
  Anchor,
  Calendar,
  User,
  Ship,
  Upload,
  Printer,
} from "lucide-react"
import Link from "next/link"

interface Document {
  id: string
  name: string
  type: string
  category: "PDA" | "Immigration" | "Customs" | "FDA" | "Permissions" | "Waybill" | "TW Applications" | "Other"
  portCallId: string
  vesselName: string
  client: string
  generatedBy: string
  generatedAt: string
  format: "PDF" | "Word"
  hasLetterhead: boolean
  status: "Draft" | "Generated" | "Sent" | "Approved"
  downloadUrl: string
  fileSize: string
}

interface DocumentTemplate {
  id: string
  name: string
  category: string
  description: string
  fields: string[]
  lastUsed: string
}

export default function DocumentManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTab, setSelectedTab] = useState("documents")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Mock documents data
    const mockDocuments: Document[] = [
      {
        id: "1",
        name: "Crew Disembarkation Letter",
        type: "Immigration Letter",
        category: "Immigration",
        portCallId: "GLPC-2024-001",
        vesselName: "MSC Oscar",
        client: "Mediterranean Shipping",
        generatedBy: "Sewwandi Rupasinghe",
        generatedAt: "2024-01-15T09:00:00Z",
        format: "PDF",
        hasLetterhead: true,
        status: "Generated",
        downloadUrl: "#",
        fileSize: "245 KB",
      },
      {
        id: "2",
        name: "Port Disbursement Account",
        type: "PDA",
        category: "PDA",
        portCallId: "GLPC-2024-001",
        vesselName: "MSC Oscar",
        client: "Mediterranean Shipping",
        generatedBy: "Kumar Fernando",
        generatedAt: "2024-01-15T10:30:00Z",
        format: "PDF",
        hasLetterhead: true,
        status: "Sent",
        downloadUrl: "#",
        fileSize: "512 KB",
      },
      {
        id: "3",
        name: "Customs Clearance Letter",
        type: "Customs Letter",
        category: "Customs",
        portCallId: "GLPC-2024-002",
        vesselName: "Maersk Gibraltar",
        client: "Maersk Line",
        generatedBy: "Sithmini Jinarathna",
        generatedAt: "2024-01-16T14:15:00Z",
        format: "Word",
        hasLetterhead: false,
        status: "Draft",
        downloadUrl: "#",
        fileSize: "128 KB",
      },
      {
        id: "4",
        name: "Ship Spares Waybill",
        type: "Waybill Letter",
        category: "Waybill",
        portCallId: "GLPC-2024-001",
        vesselName: "MSC Oscar",
        client: "Mediterranean Shipping",
        generatedBy: "Saman Kumara",
        generatedAt: "2024-01-15T16:45:00Z",
        format: "PDF",
        hasLetterhead: true,
        status: "Approved",
        downloadUrl: "#",
        fileSize: "189 KB",
      },
      {
        id: "5",
        name: "FDA Application",
        type: "FDA",
        category: "FDA",
        portCallId: "GLPC-2024-003",
        vesselName: "COSCO Shipping",
        client: "COSCO Shipping Lines",
        generatedBy: "Upeksha Wijewardhana",
        generatedAt: "2024-01-17T11:20:00Z",
        format: "PDF",
        hasLetterhead: true,
        status: "Generated",
        downloadUrl: "#",
        fileSize: "367 KB",
      },
    ]

    // Mock templates data
    const mockTemplates: DocumentTemplate[] = [
      {
        id: "t1",
        name: "Crew Sign On/Off Letter",
        category: "Immigration",
        description: "Standard template for crew embarkation and disembarkation",
        fields: ["Vessel Name", "IMO", "Crew Details", "Flight Information", "Port"],
        lastUsed: "2024-01-15T09:00:00Z",
      },
      {
        id: "t2",
        name: "Ship Spares Clearance",
        category: "Customs",
        description: "Template for ship spares customs clearance",
        fields: ["Vessel Name", "AWB Number", "Package Details", "Consignee"],
        lastUsed: "2024-01-14T16:30:00Z",
      },
      {
        id: "t3",
        name: "Port Disbursement Account",
        category: "PDA",
        description: "Standard PDA template with all service charges",
        fields: ["Vessel Details", "Services", "Charges", "Agent Information"],
        lastUsed: "2024-01-15T10:30:00Z",
      },
      {
        id: "t4",
        name: "Bunker Delivery Note",
        category: "Other",
        description: "Template for bunker fuel delivery documentation",
        fields: ["Vessel Name", "Fuel Type", "Quantity", "Supplier Details"],
        lastUsed: "2024-01-12T14:00:00Z",
      },
    ]

    setDocuments(mockDocuments)
    setTemplates(mockTemplates)
    setFilteredDocuments(mockDocuments)
  }, [router])

  useEffect(() => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.portCallId.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((doc) => doc.category.toLowerCase() === categoryFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status.toLowerCase() === statusFilter)
    }

    setFilteredDocuments(filtered)
  }, [searchTerm, categoryFilter, statusFilter, documents])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      case "Generated":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
      case "Sent":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "PDA":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Immigration":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Customs":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "FDA":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "Waybill":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
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
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Document Management</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generate and manage documents</p>
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
              <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
              <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
              <TabsTrigger value="generate">Generate New</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <Link href="/documents/crew-change">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Document
                </Button>
              </Link>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          <TabsContent value="documents" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>Manage all generated documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search documents, vessels, or clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="pda">PDA</SelectItem>
                        <SelectItem value="immigration">Immigration</SelectItem>
                        <SelectItem value="customs">Customs</SelectItem>
                        <SelectItem value="fda">FDA</SelectItem>
                        <SelectItem value="waybill">Waybill</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="generated">Generated</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{document.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{document.type}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCategoryColor(document.category)}>{document.category}</Badge>
                            <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                            <Badge variant="outline">{document.format}</Badge>
                            {document.hasLetterhead && (
                              <Badge variant="secondary" className="text-xs">
                                Letterhead
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Ship className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Vessel</p>
                          <p className="font-medium">{document.vesselName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                        <p className="font-medium">{document.client}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Port Call</p>
                        <p className="font-medium">{document.portCallId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                        <p className="font-medium">{document.fileSize}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Generated by: {document.generatedBy}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(document.generatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDocuments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No documents generated yet"}
                    </p>
                    <Link href="/documents/crew-change">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate First Document
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <CardDescription>Manage and customize document templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Fields:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.fields.map((field, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last used: {new Date(template.lastUsed).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm">Use Template</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Document</CardTitle>
                <CardDescription>Select document type and port call to generate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/documents/crew-change">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg mx-auto w-fit mb-4">
                          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Crew Change Documents</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Generate crew sign on/off letters with flight details
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mx-auto w-fit mb-4">
                        <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Ship Spares Documents</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate waybill and clearance letters for ship spares
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg mx-auto w-fit mb-4">
                        <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Port Disbursement Account</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate PDA with all service charges and details
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg mx-auto w-fit mb-4">
                        <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="font-semibold mb-2">Customs Letters</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate customs clearance and permission letters
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-teal-100 dark:bg-teal-900 p-4 rounded-lg mx-auto w-fit mb-4">
                        <FileText className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                      </div>
                      <h3 className="font-semibold mb-2">FDA Applications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate FDA applications and related documents
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mx-auto w-fit mb-4">
                        <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h3 className="font-semibold mb-2">TW Applications</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Generate temporary work permit applications
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
