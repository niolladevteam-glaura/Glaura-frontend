import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Eye,
} from "lucide-react";

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

interface CurrentUser {
  name: string;
  email: string;
}

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentType | null;
  currentUser: CurrentUser | null;
  onUpdated?: (doc: DocumentType) => void;
  documentTypes: { documentID: string; document_name: string }[]; // <-- NEW PROP
}

export const EditDocumentDialog = ({
  open,
  onOpenChange,
  document,
  currentUser,
  onUpdated,
  documentTypes = [],
}: EditDocumentDialogProps) => {
  const [fileUrl, setFileUrl] = useState(document?.url || "");
  const [fileUploading, setFileUploading] = useState(false);
  const [expiredAt, setExpiredAt] = useState(
    document?.expired_at ? document.expired_at.slice(0, 10) : ""
  );
  const [remarks, setRemarks] = useState(document?.remarks || "");
  const [saving, setSaving] = useState(false);

  // Only for Udith or Amal: local approval state
  const isUdith = currentUser?.email === "udith@greeklanka.com";
  const isAmal = currentUser?.email === "amal@greeklanka.com";
  const approverLabel = isUdith ? "Mr. Udith" : isAmal ? "Mr. Amal" : "";
  const [approved, setApproved] = useState(
    isUdith
      ? document?.approved_by_udith || false
      : isAmal
      ? document?.approved_by_amal || false
      : false
  );

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Helper to get document name by ID
  function getDocumentName(docId: string): string {
    const found = documentTypes.find((d) => d.documentID === docId);
    return found ? found.document_name : docId;
  }

  useEffect(() => {
    if (open && document) {
      setFileUrl(document.url);
      setExpiredAt(document.expired_at ? document.expired_at.slice(0, 10) : "");
      setRemarks(document.remarks || "");
      setApproved(
        isUdith
          ? document.approved_by_udith
          : isAmal
          ? document.approved_by_amal
          : false
      );
      setFileUploading(false);
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document, isUdith, isAmal]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileUploading(true);
    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });
      const data = await res.json();
      if (data?.success === false) {
        toast.error(data.message || "File upload failed.");
        setFileUploading(false);
        setFileUrl(document?.url || "");
        return;
      }
      const publicUrl = data?.data?.public_url;
      if (publicUrl) {
        setFileUrl(publicUrl);
        toast.success("File uploaded.");
      } else {
        toast.error("File upload failed: missing URL.");
      }
    } catch (err) {
      toast.error("File upload failed.");
    } finally {
      setFileUploading(false);
    }
  };

  const handleSave = async () => {
    if (!document) return;
    setSaving(true);

    const payload = {
      vendorID: document.vendorID,
      url: fileUrl || document.url,
      expired_at: expiredAt,
      remarks,
      approved_by_udith: isUdith ? approved : document.approved_by_udith,
      approved_by_amal: isAmal ? approved : document.approved_by_amal,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/vendor/document/${document.documentID}`,
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
      if (data?.success === false) {
        toast.error(data.message || "Update failed.");
        setSaving(false);
        return;
      }
      toast.success("Document updated!");
      onOpenChange(false);
      if (onUpdated) onUpdated({ ...document, ...payload });
    } catch (err) {
      toast.error("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // Status badges for both
  const statusBadges = (
    <div className="flex flex-row gap-3 pt-2">
      {document?.approved_by_udith ? (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50 px-2 py-1"
        >
          Approved by Mr. Udith
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-red-600 border-red-300 bg-red-50 px-2 py-1"
        >
          Mr. Udith not approved
        </Badge>
      )}
      {document?.approved_by_amal ? (
        <Badge
          variant="outline"
          className="text-green-600 border-green-300 bg-green-50 px-2 py-1"
        >
          Approved by Mr. Amal
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="text-red-600 border-red-300 bg-red-50 px-2 py-1"
        >
          Mr. Amal not approved
        </Badge>
      )}
    </div>
  );

  // Only show approve/reject for Udith or Amal
  let approvalControls = null;
  if (isUdith || isAmal) {
    approvalControls = (
      <div className="flex items-center gap-2 mt-2">
        <Button
          variant={approved ? "default" : "outline"}
          className={approved ? "bg-green-600 text-white" : ""}
          onClick={() => setApproved(true)}
          disabled={saving}
          size="sm"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Approve
        </Button>
        <Button
          variant={!approved ? "default" : "ghost"}
          className="text-red-600"
          onClick={() => setApproved(false)}
          disabled={saving || !approved}
          size="sm"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full p-6 rounded-xl shadow-lg bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="w-6 h-6 text-primary" />
            Edit Document
          </DialogTitle>
        </DialogHeader>
        {document ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Document Name</label>
              <div className="font-mono text-muted-foreground text-xs px-2 py-1 bg-muted rounded-md">
                {getDocumentName(document.documentID)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Document File</label>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="application/pdf"
                  disabled={fileUploading || saving}
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (fileUrl) window.open(fileUrl, "_blank");
                  }}
                  disabled={!fileUrl}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                {fileUploading && (
                  <Loader2 className="animate-spin w-5 h-5 ml-2" />
                )}
                {!fileUploading && fileUrl && (
                  <Badge variant="outline" className="ml-1 px-2 py-1 text-xs">
                    PDF Uploaded
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                Upload a new PDF to replace the current file.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input
                type="date"
                value={expiredAt}
                onChange={(e) => setExpiredAt(e.target.value)}
                disabled={saving}
                className="max-w-xs"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                disabled={saving}
                placeholder="Enter remarks about this document..."
                className="resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Approval</label>
              {approvalControls}
              {statusBadges}
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={saving}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={fileUploading || saving}
                className="bg-primary text-primary-foreground"
              >
                {saving ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            No document selected.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDocumentDialog;
