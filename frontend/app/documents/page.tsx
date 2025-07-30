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
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentTypeModal } from "@/components/DocumentTypeModal";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Trash2,
  ArrowLeft,
  Anchor,
  Calendar,
  User,
  Ship,
  ArrowLeftCircle,
} from "lucide-react";
import Link from "next/link";

// --- DeleteDialog Implementation ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentName?: string;
}
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  documentName,
}: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Delete Document
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p>
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {documentName || "this document"}
            </span>
            ?
            <br />
            This action{" "}
            <span className="font-semibold text-red-500">cannot be undone</span>
            .
          </p>
        </div>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- End DeleteDialog Implementation ---

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
  raw?: any;
}

// API wrapper with token
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(endpoint, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export default function DocumentManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [oktbDocs, setOKTBDocs] = useState<Document[]>([]);
  const [signOnDocs, setSignOnDocs] = useState<Document[]>([]);
  const [pdaDocs, setPDADocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("documents");
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // For DeleteDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const router = useRouter();

  // Document types config
  const docTypes = [
    {
      label: "OKTB",
      cardLabel: "OKTB Documents",
      description: "Generate OKTB Documents with flight details",
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      route: "/documents/oktb",
    },
    {
      label: "Crew Sign On",
      cardLabel: "Crew Sign On Documents",
      description: "Generates required document for crew sign-on.",
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      route: "/documents/crew-signon",
    },
    {
      label: "PDA",
      cardLabel: "Port Disbursement Account (PDA)",
      description:
        "Generate Port Disbursement Account for port costs and charges.",
      color: "bg-yellow-100 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      route: "/documents/pda",
    },
  ];

  // Fetch all docs on mount
  useEffect(() => {
    const userData =
      typeof window !== "undefined"
        ? localStorage.getItem("currentUser")
        : null;
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));

    const fetchDocuments = async () => {
      try {
        // OKTB
        const oktbJson = await apiCall(`${API_URL}/documents/oktb`);
        const oktbDocs: Document[] = (oktbJson.data || []).map((d: any) => ({
          id: d.ccd_id,
          name: "OKTB Document",
          type: "OKTB",
          category: "OKTB",
          vesselName: d.vessel || "",
          principle: d.principle,
          generatedAt: d.createdAt,
          status: "Generated",
          format: "PDF",
          raw: d,
        }));
        setOKTBDocs(oktbDocs);

        // Crew Sign On
        const signOnJson = await apiCall(`${API_URL}/documents/signon`);
        const signOnDocs: Document[] = (signOnJson.data || []).map(
          (d: any) => ({
            id: d.signon_id,
            name: "Crew Sign On Document",
            type: "Crew Sign On",
            category: "Crew Sign On",
            vesselName: d.VesselName,
            principle: d.authorizePerson,
            generatedAt: d.createdAt,
            status: "Generated",
            format: "PDF",
            raw: d,
          })
        );
        setSignOnDocs(signOnDocs);

        // PDA
        const pdaJson = await apiCall(`${API_URL}/documents/pda`);
        const pdaDocs: Document[] = (pdaJson.data || []).map((d: any) => ({
          id: d.pda_id,
          name: "PDA Document",
          type: "PDA",
          category: "PDA",
          vesselName: d.vessel_name,
          principle: d.client_name,
          generatedAt: d.createdAt,
          status: "Generated",
          format: "PDF",
          raw: d,
        }));
        setPDADocs(pdaDocs);
      } catch (err) {
        setOKTBDocs([]);
        setSignOnDocs([]);
        setPDADocs([]);
      }
    };

    fetchDocuments();
  }, [router]);

  // Filtering for each document type
  const filterDocuments = (docs: Document[]) => {
    let filtered = docs;
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.principle &&
            doc.principle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (doc) => doc.status.toLowerCase() === statusFilter
      );
    }
    return filtered;
  };

  const getDocsByType = (type: string) => {
    if (type === "OKTB") return filterDocuments(oktbDocs);
    if (type === "Crew Sign On") return filterDocuments(signOnDocs);
    if (type === "PDA") return filterDocuments(pdaDocs);
    return [];
  };

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
      case "PDA":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const openDocumentWithToken = async (url: string) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch document.");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (err) {
      alert("Failed to open document.");
    }
  };

  // Document Actions
  const handlePreview = (document: Document) => {
    let url = "";
    if (document.category === "OKTB") {
      url = `${API_URL}/documents/oktb/${document.id}/pdf`;
    } else if (document.category === "Crew Sign On") {
      url = `${API_URL}/documents/signon/${document.id}/pdf`;
    } else if (document.category === "PDA") {
      url = `${API_URL}/documents/pda/${document.id}/pdf`;
    }
    if (url) {
      openDocumentWithToken(url);
    }
  };

  // Delete dialog logic
  const handleDeleteClick = (document: Document) => {
    setDeleteTarget(document);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteDocument = async () => {
    if (!deleteTarget) return;
    let endpoint = "";
    if (deleteTarget.category === "OKTB") {
      endpoint = `${API_URL}/documents/oktb/${deleteTarget.id}`;
    } else if (deleteTarget.category === "Crew Sign On") {
      endpoint = `${API_URL}/documents/signon/${deleteTarget.id}`;
    } else if (deleteTarget.category === "PDA") {
      endpoint = `${API_URL}/documents/pda/${deleteTarget.id}`;
    }
    try {
      await apiCall(endpoint, { method: "DELETE" });
      if (deleteTarget.category === "OKTB") {
        setOKTBDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      } else if (deleteTarget.category === "Crew Sign On") {
        setSignOnDocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      } else if (deleteTarget.category === "PDA") {
        setPDADocs((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      }
    } catch (e) {
      // Optionally show error toast
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DocumentTypeModal open={showModal} onClose={() => setShowModal(false)} />
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteDocument}
        documentName={deleteTarget?.name}
      />
      <header className="glass-effect border-b px-2 py-2 sm:px-4 sm:py-3 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/dashboard" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-0 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-base sm:text-lg md:text-xl text-gradient truncate">
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

      <div className="max-w-7xl mx-auto px-2 py-4 sm:p-6">
        {selectedTab === "documents" && (
          <div>
            {!selectedType ? (
              <div>
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-6 gap-4">
                  <h2 className="text-lg sm:text-xl font-bold">
                    Document Types
                  </h2>
                  <Button
                    className="w-full xs:w-auto"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Document
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {docTypes.map((doc) => (
                    <Card
                      key={doc.label}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedType(doc.label)}
                    >
                      <CardContent className="p-4 sm:p-6 text-center flex flex-col items-center">
                        <div
                          className={`${doc.color} p-4 rounded-lg mx-auto w-fit mb-4`}
                        >
                          <FileText className={`h-8 w-8 ${doc.iconColor}`} />
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg mb-2">
                          {doc.cardLabel}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {doc.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center mr-0 sm:mr-4 mb-2 sm:mb-0"
                    onClick={() => setSelectedType(null)}
                  >
                    <ArrowLeftCircle className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <h2 className="text-lg sm:text-xl font-bold flex-1">
                    {docTypes.find((d) => d.label === selectedType)
                      ?.cardLabel || selectedType}
                  </h2>
                </div>
                <div className="flex flex-col md:flex-row gap-3 mb-4">
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
                  <div className="flex gap-2 w-full md:w-auto">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full md:w-40">
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
                <div className="space-y-3">
                  {getDocsByType(selectedType).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-10 sm:py-12">
                        <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          No {selectedType} documents found
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search criteria"
                            : `No ${selectedType} documents generated yet`}
                        </p>
                        <Button
                          className="w-full xs:w-auto"
                          onClick={() =>
                            router.push(
                              docTypes.find((d) => d.label === selectedType)
                                ?.route || "/documents"
                            )
                          }
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Generate {selectedType} Document
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    getDocsByType(selectedType).map((document) => (
                      <Card
                        key={document.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                            <div className="flex items-center space-x-4">
                              <div
                                className={
                                  getCategoryColor(document.category) +
                                  " p-3 rounded-lg"
                                }
                              >
                                <FileText className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-base sm:text-lg">
                                  {document.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {document.type}
                                </p>
                                <div className="flex flex-wrap items-center space-x-1 mt-1">
                                  <Badge
                                    className={getCategoryColor(
                                      document.category
                                    )}
                                  >
                                    {document.category}
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(document.status)}
                                  >
                                    {document.status}
                                  </Badge>
                                  {document.format && (
                                    <Badge variant="outline">
                                      {document.format}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreview(document)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClick(document)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div className="flex items-center space-x-2">
                              <Ship className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  Vessel
                                </p>
                                <p className="font-medium">
                                  {document.vesselName}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                  Principle: {document.principle}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                  {new Date(
                                    document.generatedAt
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
