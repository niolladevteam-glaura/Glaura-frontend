"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Eye,
  Edit,
  ArrowLeft,
  Anchor,
  FileText,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Document type based on your response
interface DocumentType {
  id: number;
  vendorID: string;
  documentID: string;
  url: string;
  expired_at: string;
  remarks: string;
  approved_by_amal: boolean;
  approved_by_udith: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpiryAlert {
  documentId: string;
  documentName: string;
  expiryDate: Date;
  daysUntil: number;
  status: "Expired" | "Expiring Soon";
}

// Utility for date formatting
function formatDateDMY(dateStr?: string | Date) {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "expired":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
    case "valid":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
}

export default function VendorDocumentsPage() {
  const { vendor_id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    accessLevel: string;
  } | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);

  useEffect(() => {
    // Load current user
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    async function fetchDocuments() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vendor/document/${vendor_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDocuments(data.data);

          // Calculate expiry alerts for sidebar
          const today = new Date();
          const alerts: ExpiryAlert[] = data.data
            .filter((doc: DocumentType) => doc.expired_at)
            .map((doc: DocumentType) => {
              const expiry = new Date(doc.expired_at);
              const daysUntil = Math.ceil(
                (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              let status: ExpiryAlert["status"] = "Expiring Soon";
              if (daysUntil < 0) status = "Expired";
              else if (daysUntil <= 7) status = "Expiring Soon";
              else return null;
              return {
                documentId: doc.documentID,
                documentName: doc.remarks || doc.documentID || "",
                expiryDate: expiry,
                daysUntil,
                status,
              };
            })
            .filter(Boolean)
            .sort((a: ExpiryAlert, b: ExpiryAlert) => a.daysUntil - b.daysUntil)
            .slice(0, 6) as ExpiryAlert[];
          setExpiryAlerts(alerts);
        } else {
          setDocuments([]);
          setExpiryAlerts([]);
        }
      } catch {
        setDocuments([]);
        setExpiryAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    if (vendor_id) fetchDocuments();
  }, [vendor_id]);

  // Actions handlers
  const handleView = (doc: DocumentType) => {
    // Open PDF in new tab
    window.open(doc.url, "_blank");
  };

  const handleEdit = (doc: DocumentType) => {
    // Implement edit logic (e.g., open dialog)
    alert(`Edit document: ${doc.documentID}`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - same as VendorManagement */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/vendors" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Vendors</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Vendor Documents
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Service Provider Documents
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Documents Expiry Alerts */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Documents Expiry Alerts</span>
                </CardTitle>
                <CardDescription>Expiring or expired documents</CardDescription>
              </CardHeader>
              <CardContent>
                {expiryAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {expiryAlerts.map((alert, index) => (
                      <div
                        key={alert.documentId}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">
                            {alert.documentName}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold px-3 py-1 ${getStatusBadgeColor(
                              alert.status
                            )} ${
                              alert.status !== "Expired"
                                ? "text-yellow-600 dark:text-yellow-300"
                                : ""
                            }`}
                          >
                            {alert.status === "Expired"
                              ? "Expired"
                              : `${alert.daysUntil}d`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDateDMY(alert.expiryDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No expiring documents
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document ID</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No documents found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.documentID}</TableCell>
                          <TableCell>{doc.remarks}</TableCell>
                          <TableCell>
                            {doc.expired_at
                              ? formatDateDMY(doc.expired_at)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs ${getStatusBadgeColor(
                                doc.status
                              )}`}
                            >
                              {doc.status.charAt(0).toUpperCase() +
                                doc.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleView(doc)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(doc)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
