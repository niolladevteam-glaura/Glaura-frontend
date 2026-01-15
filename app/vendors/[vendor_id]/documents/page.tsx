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
  FileText,
  XCircle,
  CheckCircle,
  Building,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import EditDocumentDialog from "@/components/vendors/EditDocumentDialog";
import { Toaster, toast } from "sonner";

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

interface CurrentUser {
  name: string;
  email: string;
  accessLevel: string;
}

interface VendorPIC {
  id: number;
  pic_id: string;
  vendor_id: string;
  firstName: string;
  lastName: string;
  phone_number: string;
  email: string;
  picType: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

interface VendorStatus {
  id: number;
  status_id: string;
  vendor_id: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: number;
  vendor_id: string;
  name: string;
  address: string;
  phone_number: string;
  company_type: string;
  email: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  vendorPic: VendorPIC | null;
  vendorStatus: VendorStatus | null;
}

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
    case "approved":
    case "Approved":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    case "Expired":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
    case "valid":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
    case "Expiring Soon":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
    case "rejected":
    case "Rejected":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
  }
}

export default function VendorDocumentsPage() {
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { vendor_id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(
    null
  );
  const [documentTypes, setDocumentTypes] = useState<
    { documentID: string; document_name: string }[]
  >([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [vendorLoading, setVendorLoading] = useState(true);

  //Load the documents list with name and id
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/vendor/document/list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDocumentTypes(data.data);
        }
      } catch {
        setDocumentTypes([]);
      }
    };
    fetchTypes();
  }, []);

  //helper for the match document id with name
  function getDocumentName(docId: string): string {
    const found = documentTypes.find((d) => d.documentID === docId);
    return found ? found.document_name : docId;
  }

  useEffect(() => {
    // Load current user
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      const user = JSON.parse(userData);
      // Defensive: ensure name, email, accessLevel exist
      setCurrentUser({
        name: user.name,
        email: user.email,
        accessLevel: user.accessLevel,
      });
    } else {
      router.push("/");
    }
  }, [router]);

  const fetchDocuments = async () => {
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

        // Updated: Calculate expiry alerts for sidebar to show
        const today = new Date();
        const alerts: ExpiryAlert[] = data.data
          .filter((doc: DocumentType) => doc.expired_at)
          .map((doc: DocumentType) => {
            const expiry = new Date(doc.expired_at);
            const daysUntil = Math.ceil(
              (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            let status: ExpiryAlert["status"] | null = null;
            if (daysUntil < 0) {
              status = "Expired";
            } else if (daysUntil <= 7 && daysUntil >= 0) {
              status = "Expiring Soon";
            }
            if (!status) return null;
            return {
              documentId: doc.documentID,
              documentName: getDocumentName(doc.documentID),
              expiryDate: expiry,
              daysUntil,
              status,
            };
          })
          .filter(Boolean)
          .sort((a: ExpiryAlert, b: ExpiryAlert) => {
            if (a.status === "Expired" && b.status !== "Expired") return -1;
            if (b.status === "Expired" && a.status !== "Expired") return 1;
            return a.daysUntil - b.daysUntil;
          })
          .slice(0, 6) as ExpiryAlert[];
        setExpiryAlerts(alerts);
      } else {
        setDocuments([]);
        setExpiryAlerts([]);
        if (data.success === false) {
          toast.error(data.message || "Failed to fetch documents.");
        }
      }
    } catch {
      setDocuments([]);
      setExpiryAlerts([]);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendor = async () => {
    setVendorLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor/${vendor_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setVendor(data.data);
      } else {
        setVendor(null);
        if (data.success === false) {
          toast.error(data.message || "Failed to fetch vendor details.");
        }
      }
    } catch {
      setVendor(null);
      toast.error("Failed to fetch vendor details.");
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    if (vendor_id) {
      fetchDocuments();
      fetchVendor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor_id]);

  // Actions handlers
  const handleView = (doc: DocumentType) => {
    window.open(doc.url, "_blank");
  };

  const handleEdit = (doc: DocumentType) => {
    setSelectedDocument(doc);
    setEditOpen(true);
  };

  const handleEditUpdated = () => {
    setEditOpen(false);
    setSelectedDocument(null);
    fetchDocuments();
  };

  // Approve/Reject logic (single)
  const handleApprove = async (doc: DocumentType) => {
    try {
      const isUdith = currentUser?.email === "udith@greeklanka.com";
      const isAmal = currentUser?.email === "amal@greeklanka.com";
      const payload: any = { vendorID: doc.vendorID };
      if (isUdith) {
        payload.approved_by_udith = "approved";
        payload.approved_by_amal = doc.approved_by_amal;
      } else if (isAmal) {
        payload.approved_by_amal = "approved";
        payload.approved_by_udith = doc.approved_by_udith;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor/document/${doc.documentID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Document approved!");
        fetchDocuments();
      } else {
        toast.error(data.message || "Approval failed.");
      }
    } catch {
      toast.error("Approval failed.");
    }
  };

  const handleReject = async (doc: DocumentType) => {
    try {
      const isUdith = currentUser?.email === "udith@greeklanka.com";
      const isAmal = currentUser?.email === "amal@greeklanka.com";
      const payload: any = { vendorID: doc.vendorID };
      if (isUdith) {
        payload.approved_by_udith = "rejected";
        payload.approved_by_amal = doc.approved_by_amal;
      } else if (isAmal) {
        payload.approved_by_amal = "rejected";
        payload.approved_by_udith = doc.approved_by_udith;
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vendor/document/${doc.documentID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.error("Document rejected!");
        fetchDocuments();
      } else {
        toast.error(data.message || "Rejection failed.");
      }
    } catch {
      toast.error("Rejection failed.");
    }
  };

  // Bulk approve/reject
  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    const docsToApprove = documents.filter((doc) =>
      selectedIds.includes(doc.id)
    );
    let successCount = 0;
    for (const doc of docsToApprove) {
      try {
        await handleApprove(doc);
        successCount++;
      } catch {}
    }
    setSelectedIds([]);
    fetchDocuments();
    toast.success(`Approved ${successCount} document(s).`);
  };

  const handleBulkReject = async () => {
    if (!selectedIds.length) return;
    const docsToReject = documents.filter((doc) =>
      selectedIds.includes(doc.id)
    );
    let successCount = 0;
    for (const doc of docsToReject) {
      try {
        await handleReject(doc);
        successCount++;
      } catch {}
    }
    setSelectedIds([]);
    fetchDocuments();
    toast.success(`Rejected ${successCount} document(s).`);
  };

  // Checkbox handlers
  const isAllSelected =
    documents.length > 0 && selectedIds.length === documents.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < documents.length;
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map((doc) => doc.id));
    }
  };
  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

  // Check if user should see Approve/Reject
  const canApproveOrReject =
    currentUser.email === "udith@greeklanka.com" ||
    currentUser.email === "amal@greeklanka.com";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <EditDocumentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        document={selectedDocument}
        currentUser={currentUser}
        onUpdated={handleEditUpdated}
        documentTypes={documentTypes}
      />
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
                            {getDocumentName(alert.documentId)}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs font-semibold px-3 py-1 ${getStatusBadgeColor(
                              alert.status
                            )}`}
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
            {/* Vendor Summary */}
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Vendor Summary</span>
                </CardTitle>
                <CardDescription>Vendor Details</CardDescription>
              </CardHeader>
              <CardContent>
                {vendorLoading ? (
                  <div className="text-sm text-muted-foreground">
                    Loading vendor details...
                  </div>
                ) : vendor ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-medium">{vendor.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Phone Number
                      </p>
                      <p className="text-sm">{vendor.phone_number}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        Email
                      </p>
                      <p className="text-sm break-all">{vendor.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Remark</p>
                      <p className="text-sm">{vendor.remark || "-"}</p>
                    </div>
                    {vendor.vendorPic && (
                      <>
                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Person in Charge
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            PIC Name
                          </p>
                          <p className="text-sm font-medium">
                            {vendor.vendorPic.firstName}{" "}
                            {vendor.vendorPic.lastName}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            PIC Number
                          </p>
                          <p className="text-sm">
                            {vendor.vendorPic.phone_number}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            PIC Email
                          </p>
                          <p className="text-sm break-all">
                            {vendor.vendorPic.email}
                          </p>
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant="outline"
                        className={
                          vendor.vendorStatus?.status
                            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
                        }
                      >
                        {vendor.vendorStatus?.status ? "Active" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No vendor details available.
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
                {/* Bulk action bar */}
                {canApproveOrReject && selectedIds.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="text-green-700 border-green-200"
                      onClick={handleBulkApprove}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve Selected
                    </Button>
                    <Button
                      variant="outline"
                      className="text-purple-700 border-purple-200"
                      onClick={handleBulkReject}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject Selected
                    </Button>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {selectedIds.length} selected
                    </span>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {canApproveOrReject && (
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isIndeterminate;
                            }}
                            onChange={handleSelectAll}
                            aria-label="Select all documents"
                          />
                        )}
                      </TableHead>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          No documents found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            {canApproveOrReject && (
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(doc.id)}
                                onChange={() => handleSelectOne(doc.id)}
                                aria-label={`Select document ${getDocumentName(
                                  doc.documentID
                                )}`}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {getDocumentName(doc.documentID)}
                          </TableCell>
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
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(doc)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {canApproveOrReject && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprove(doc)}
                                    disabled={doc.status === "valid"}
                                    className="text-green-700 border-green-200"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReject(doc)}
                                    disabled={doc.status === "rejected"}
                                    className="text-purple-700 border-purple-200"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
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
