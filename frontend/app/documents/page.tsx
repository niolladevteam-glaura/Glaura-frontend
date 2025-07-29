"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentTypeModal } from "@/components/DocumentTypeModal";
import {
  FileText,
  Search,
  Plus,
  Download,
  Eye,
  Printer,
  Trash2,
  ArrowLeft,
  Anchor,
  Calendar,
  User,
  Ship,
} from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  vesselName: string;
  principle: string;
  generatedAt: string;
  format?: "PDF" | "Word";
  status: "Draft" | "Generated" | "Sent" | "Approved";
}

export default function DocumentManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [oktbDocs, setOKTBDocs] = useState<Document[]>([]);
  const [signOnDocs, setSignOnDocs] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("documents");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const docTypes = [
    {
      label: "OKTB Documents",
      description: "Generate OKTB Documents with flight details",
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      route: "/documents/oktb",
    },
    {
      label: "Crew Sign On Documents",
      description: "Generates required document for crew sign-on.",
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      route: "/documents/crew-signon",
    },
    {
      label: "Port Disbursement Account (PDA)",
      description:
        "Generate Port Disbursement Account for port costs and charges.",
      color: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      route: "/documents/pda",
    },
    // ...other docTypes
  ];

  // Fetch OKTB and Crew Sign On documents on mount
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));

    const fetchDocuments = async () => {
      try {
        // OKTB
        const oktbRes = await fetch(`${API_URL}/documents/oktb`);
        const oktbJson = await oktbRes.json();
        const oktbDocs: Document[] = (oktbJson.data || []).map((d: any) => ({
          id: d.ccd_id,
          name: "OKTB Document",
          type: "OKTB",
          category: "OKTB",
          vesselName: d.vessel,
          principle: d.principle,
          generatedAt: d.createdAt,
          status: "Generated",
          format: "PDF",
        }));

        setOKTBDocs(oktbDocs);

        // Crew Sign On
        const signOnRes = await fetch(`${API_URL}/documents/signon`);
        const signOnJson = await signOnRes.json();
        const signOnDocs: Document[] = (signOnJson.data || []).map(
          (d: any) => ({
            id: d.csd_id,
            name: "Crew Sign On Document",
            type: "Crew Sign On",
            category: "Crew Sign On",
            vesselName: d.VesselName,
            principle: d.authorizePerson,
            generatedAt: d.date,
            status: "Generated",
            format: "PDF",
          })
        );

        setSignOnDocs(signOnDocs);

        // Combine for the main documents tab
        setDocuments([...oktbDocs, ...signOnDocs]);
        setFilteredDocuments([...oktbDocs, ...signOnDocs]);
      } catch (err) {
        setOKTBDocs([]);
        setSignOnDocs([]);
        setDocuments([]);
        setFilteredDocuments([]);
      }
    };

    fetchDocuments();
  }, [router]);

  useEffect(() => {
    let filtered = documents;
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.principle &&
            doc.principle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (doc) => doc.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (doc) => doc.status.toLowerCase() === statusFilter
      );
    }
    setFilteredDocuments(filtered);
  }, [searchTerm, categoryFilter, statusFilter, documents]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "Generated":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
      case "Sent":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700";
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "OKTB":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Crew Sign On":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Document Actions
  const handlePreview = (document: Document) => {
    if (document.category === "OKTB") {
      router.push(`/documents/oktb/${document.id}`);
    } else if (document.category === "Crew Sign On") {
      router.push(`/documents/crew-signon/${document.id}`);
    }
  };
  const handlePrint = (document: Document) => {
    if (document.category === "OKTB") {
      window.open(`${API_URL}/documents/oktb/${document.id}/pdf`, "_blank");
    } else if (document.category === "Crew Sign On") {
      window.open(`${API_URL}/documents/signon/${document.id}/pdf`, "_blank");
    }
  };
  const handleDownload = (document: Document) => {
    if (document.category === "OKTB") {
      window.open(`${API_URL}/documents/oktb/${document.id}/pdf`, "_blank");
    } else if (document.category === "Crew Sign On") {
      window.open(`${API_URL}/documents/signon/${document.id}/pdf`, "_blank");
    }
  };
  const handleDelete = async (document: Document) => {
    if (
      window.confirm(
        "Are you sure you want to delete this document? This action cannot be undone."
      )
    ) {
      if (document.category === "OKTB") {
        await fetch(`${API_URL}/documents/oktb/${document.id}`, {
          method: "DELETE",
        });
      } else if (document.category === "Crew Sign On") {
        await fetch(`${API_URL}/documents/signon/${document.id}`, {
          method: "DELETE",
        });
      }
      setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      setFilteredDocuments((prev) => prev.filter((d) => d.id !== document.id));
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DocumentTypeModal open={showModal} onClose={() => setShowModal(false)} />
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/dashboard" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Document Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate and Manage Documents
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="documents">
                Documents ({filteredDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="generate">Generate New</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              <Button onClick={() => setShowModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Document
              </Button>
            </div>
          </div>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
                <CardDescription>
                  Manage all generated documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search documents"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="OKTB">OKTB</SelectItem>
                        <SelectItem value="Crew Sign On">
                          Crew Sign On
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
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

            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <Card
                  key={document.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={
                            document.category === "OKTB"
                              ? "bg-blue-100 dark:bg-blue-900 p-3 rounded-lg"
                              : "bg-green-100 dark:bg-green-900 p-3 rounded-lg"
                          }
                        >
                          <FileText
                            className={
                              document.category === "OKTB"
                                ? "h-6 w-6 text-blue-600 dark:text-blue-400"
                                : "h-6 w-6 text-green-600 dark:text-green-400"
                            }
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {document.type}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              className={getCategoryColor(document.category)}
                            >
                              {document.category}
                            </Badge>
                            <Badge className={getStatusColor(document.status)}>
                              {document.status}
                            </Badge>
                            {document.format && (
                              <Badge variant="outline">{document.format}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(document)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(document)}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(document)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Ship className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Vessel
                          </p>
                          <p className="font-medium">{document.vesselName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Principle: {document.principle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(document.generatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredDocuments.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No documents found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm ||
                      categoryFilter !== "all" ||
                      statusFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No documents generated yet"}
                    </p>
                    <Link href="/documents">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Document
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Document</CardTitle>
                <CardDescription>
                  Select document type to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docTypes.map((doc) => (
                    <Card
                      key={doc.label}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(doc.route)}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`${doc.color} p-4 rounded-lg mx-auto w-fit mb-4`}
                        >
                          <FileText className={`h-8 w-8 ${doc.iconColor}`} />
                        </div>
                        <h3 className="font-semibold mb-2">{doc.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {doc.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
