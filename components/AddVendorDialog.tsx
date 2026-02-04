"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Plus, X, FileText } from "lucide-react";
import ShadCountryPhoneInput from "@/components/ui/ShadCountryPhoneInput";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// Vendor PIC and VendorFormType definitions
interface VendorPIC {
  id: string;
  type?: "Primary" | "Secondary";
  title?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  department: string;
  birthday: string;
  contactNumbers: string[];
  contactTypes?: string[];
  emails: string[];
  emailTypes?: string[];
  remark: string;
}

type VendorFormType = {
  name: string;
  address: string;
  phoneCountryCode: string;
  phoneNumber: string;
  company_type: string;
  email: string;
  remark: string;
  services: string[];
  status: { status: boolean };
  pics: VendorPIC[];
  attachments: AttachmentFormType[];
};

type AttachmentFormType = {
  documentID: string;
  type: string;
  file: File | null;
  fileSize: number;
  expiryDate: string;
  remarks: string;
  publicUrl?: string;
};

type DocumentType = {
  documentID: string;
  document_name: string;
  isRequired?: boolean;
  isExpiryRequiredIfUploaded?: boolean;
  group: "mandatory" | "optional";
};

type AddVendorDialogProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  serviceCategories: string[];
  loadingServices: boolean;
  onVendorCreated?: (newVendor?: any) => void;
  onSaveVendor: (formData: VendorFormType) => Promise<void>;
};

const VENDOR_FORM_DRAFT_KEY = "addVendorFormDraft";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Hardcoded document list as per requirements
const HARDCODED_DOCUMENTS: DocumentType[] = [
  // Mandatory
  {
    documentID: "DOC005",
    document_name: "Bank Details",
    isRequired: true,
    group: "mandatory",
  },
  {
    documentID: "DOC002",
    document_name: "Business Registration Certificate",
    isRequired: true,
    group: "mandatory",
  },
  {
    documentID: "DOC001",
    document_name: "Company Profile",
    isRequired: true,
    group: "mandatory",
  },
  {
    documentID: "DOC008",
    document_name: "Health, Safety and Quality Policy Documents",
    isRequired: true,
    group: "mandatory",
  },
  {
    documentID: "DOC004",
    document_name: "List of Directors/Owners",
    isRequired: true,
    group: "mandatory",
  },
  {
    documentID: "DOC009",
    document_name: "List of Key Contact Persons",
    isRequired: true,
    group: "mandatory",
  },

  // Optional
  {
    documentID: "DOC007",
    document_name: "Insurance Certificates",
    isRequired: false,
    isExpiryRequiredIfUploaded: true,
    group: "optional",
  },
  {
    documentID: "DOC006",
    document_name: "Relevant ISO or Industry Certifications",
    isRequired: false,
    isExpiryRequiredIfUploaded: true,
    group: "optional",
  },
  {
    documentID: "DOC003",
    document_name: "Tax Registration Certificate",
    isRequired: false,
    isExpiryRequiredIfUploaded: false,
    group: "optional",
  },
];

const blankVendorForm = (documents: DocumentType[]): VendorFormType => ({
  name: "",
  address: "",
  phoneCountryCode: "+94",
  phoneNumber: "",
  company_type: "",
  email: "",
  remark: "",
  services: [],
  status: { status: true },
  pics: [
    {
      id: `${Date.now()}`,
      type: "Primary",
      title: "Mr.",
      firstName: "",
      lastName: "",
      name: "",
      department: "",
      birthday: "",
      contactNumbers: [""],
      contactTypes: ["Direct Line"],
      emails: [""],
      emailTypes: ["Personal"],
      remark: "",
    },
  ],
  attachments: documents.map((doc) => ({
    documentID: doc.documentID,
    type: doc.document_name,
    file: null,
    fileSize: 0,
    expiryDate: "",
    remarks: "",
  })),
});

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data.data.publicUrl || data.data.public_url;
}

export default function AddVendorDialog({
  open,
  onOpenChange,
  serviceCategories,
  loadingServices,
  onVendorCreated,
  onSaveVendor,
}: AddVendorDialogProps) {
  const [vendorForm, setVendorForm] = useState<VendorFormType | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [attachmentErrors, setAttachmentErrors] = useState<boolean[]>([]);
  const [documentList, setDocumentList] = useState<DocumentType[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const hasLoadedDraft = useRef(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const { toast } = useToast();

  // Always use the hardcoded document list
  useEffect(() => {
    if (open) {
      setLoadingDocuments(true);
      setTimeout(() => {
        setDocumentList(HARDCODED_DOCUMENTS);
        setLoadingDocuments(false);
      }, 100); // Simulate async for consistency
    }
  }, [open]);

  useEffect(() => {
    if (open && documentList.length > 0 && !hasLoadedDraft.current) {
      hasLoadedDraft.current = true;
      const draft = localStorage.getItem(VENDOR_FORM_DRAFT_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          const draftAttachments =
            Array.isArray(parsed.attachments) &&
            parsed.attachments.length === documentList.length
              ? parsed.attachments
              : documentList.map((doc) => ({
                  documentID: doc.documentID,
                  type: doc.document_name,
                  file: null,
                  fileSize: 0,
                  expiryDate: "",
                  remarks: "",
                }));
          setVendorForm({ ...parsed, attachments: draftAttachments });
        } catch {
          setVendorForm(blankVendorForm(documentList));
        }
      } else {
        setVendorForm(blankVendorForm(documentList));
      }
    }
  }, [open, documentList]);

  useEffect(() => {
    if (!open) {
      setSubmitAttempted(false);
      hasLoadedDraft.current = false;
      localStorage.removeItem(VENDOR_FORM_DRAFT_KEY);
      setVendorForm(null);
    }
  }, [open]);

  useEffect(() => {
    if (open && vendorForm) {
      localStorage.setItem(VENDOR_FORM_DRAFT_KEY, JSON.stringify(vendorForm));
    }
  }, [open, vendorForm]);

  // PIC handlers
  const addNewPIC = () => {
    setVendorForm((prev) =>
      prev
        ? {
            ...prev,
            pics: [
              ...(prev.pics || []),
              {
                id: Date.now().toString(),
                type: "Secondary",
                title: "Mr.",
                firstName: "",
                lastName: "",
                name: "",
                department: "",
                birthday: "",
                contactNumbers: [""],
                contactTypes: ["Direct Line"],
                emails: [""],
                emailTypes: ["Personal"],
                remark: "",
              },
            ],
          }
        : prev,
    );
  };

  const updatePIC = (index: number, field: keyof VendorPIC, value: any) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[index] = {
        ...updatedPics[index],
        [field]: value,
      };
      return { ...prev, pics: updatedPics };
    });
  };

  const removePIC = (index: number) => {
    setVendorForm((prev) =>
      prev
        ? {
            ...prev,
            pics: (prev.pics || []).filter((_, i) => i !== index),
          }
        : prev,
    );
  };

  const addPICContactNumber = (picIndex: number) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers = [
        ...updatedPics[picIndex].contactNumbers,
        "",
      ];
      updatedPics[picIndex].contactTypes = [
        ...(updatedPics[picIndex].contactTypes || []),
        "Direct Line",
      ];
      return { ...prev, pics: updatedPics };
    });
  };

  const updatePICContactNumber = (
    picIndex: number,
    contactIndex: number,
    value: string,
  ) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers[contactIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };

  const removePICContactNumber = (picIndex: number, contactIndex: number) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers = updatedPics[
        picIndex
      ].contactNumbers.filter((_, i) => i !== contactIndex);
      updatedPics[picIndex].contactTypes = updatedPics[picIndex].contactTypes
        ? updatedPics[picIndex].contactTypes!.filter(
            (_, i) => i !== contactIndex,
          )
        : [];
      return { ...prev, pics: updatedPics };
    });
  };

  const addPICEmail = (picIndex: number) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails = [...updatedPics[picIndex].emails, ""];
      updatedPics[picIndex].emailTypes = [
        ...(updatedPics[picIndex].emailTypes || []),
        "Personal",
      ];
      return { ...prev, pics: updatedPics };
    });
  };

  const updatePICEmail = (
    picIndex: number,
    emailIndex: number,
    value: string,
  ) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails[emailIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };

  const removePICEmail = (picIndex: number, emailIndex: number) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails = updatedPics[picIndex].emails.filter(
        (_, i) => i !== emailIndex,
      );
      updatedPics[picIndex].emailTypes = updatedPics[picIndex].emailTypes
        ? updatedPics[picIndex].emailTypes!.filter((_, i) => i !== emailIndex)
        : [];
      return { ...prev, pics: updatedPics };
    });
  };

  // Attachment Handlers
  const handleAttachmentFile = (idx: number, file: File | null) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const newAttachments = [...prev.attachments];
      newAttachments[idx].file = file;
      newAttachments[idx].fileSize = file ? file.size : 0;
      // Clear uploaded URL if file changes
      newAttachments[idx].publicUrl = undefined;
      return { ...prev, attachments: newAttachments };
    });
  };

  const handleAttachmentExpiry = (idx: number, value: string) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const newAttachments = [...prev.attachments];
      newAttachments[idx].expiryDate = value;
      return { ...prev, attachments: newAttachments };
    });
  };

  const handleAttachmentRemarks = (idx: number, value: string) => {
    setVendorForm((prev) => {
      if (!prev) return prev;
      const newAttachments = [...prev.attachments];
      newAttachments[idx].remarks = value;
      return { ...prev, attachments: newAttachments };
    });
  };

  // Service filter
  const filteredServiceCategories = serviceCategories.filter((cat) =>
    cat.toLowerCase().includes(serviceSearchTerm.toLowerCase()),
  );

  // Validation for attachments
  useEffect(() => {
    if (!vendorForm) return;
    // Validate required attachments
    const errors = vendorForm.attachments.map((att) => {
      const doc = documentList.find((d) => d.documentID === att.documentID);
      if (!doc) return false;
      // Only mandatory for Insurance Certificates and Relevant ISO or Industry Certifications if file is uploaded
      if (
        (doc.documentID === "DOC007" || doc.documentID === "DOC006") &&
        att.file
      ) {
        return !att.expiryDate;
      }
      // No other expiry date is mandatory
      return false;
    });
    setAttachmentErrors(errors);
  }, [vendorForm?.attachments, documentList]);

  // Save vendor handler
  const handleSaveVendor = async () => {
    setSubmitAttempted(true);
    if (!vendorForm) return;

    // Validate required attachments before submission
    const hasErrors = vendorForm.attachments.some((att, idx) => {
      const doc = documentList.find((d) => d.documentID === att.documentID);
      if (!doc) return false;
      // Only mandatory for Insurance Certificates and Relevant ISO or Industry Certifications if file is uploaded
      if (
        (doc.documentID === "DOC007" || doc.documentID === "DOC006") &&
        att.file
      ) {
        return !att.expiryDate;
      }
      // No other expiry date is mandatory
      return false;
    });

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description:
          "For Insurance and ISO/Industry Certifications, expiry date is required if file is uploaded.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Upload files and get public URLs
      const attachmentsWithUrls = await Promise.all(
        vendorForm.attachments.map(async (att) => {
          if (att.file) {
            // Only upload if file is present and not already uploaded
            if (!att.publicUrl) {
              const publicUrl = await uploadFile(att.file);
              return {
                ...att,
                publicUrl,
              };
            }
            return att;
          }
          return att;
        }),
      );

      // 2. Prepare documents array for payload
      const documents = attachmentsWithUrls
        .filter((att) => att.file)
        .map((att) => ({
          documentID: att.documentID,
          url: att.publicUrl,
          expired_at: att.expiryDate,
          remarks: att.remarks,
        }));

      // 3. Prepare PIC (taking the first one as main contact)
      const mainPic = vendorForm.pics[0] || {};
      const picPayload = {
        phone_number: mainPic.contactNumbers[0] || "",
        firstName: mainPic.firstName || "",
        lastName: mainPic.lastName || "",
        picType: mainPic.type || "",
        email: mainPic.emails[0] || "",
        remark: mainPic.remark || "",
      };

      // 4. Prepare final vendor payload
      const vendorPayload = {
        address: vendorForm.address,
        name: vendorForm.name,
        phone_number: vendorForm.phoneCountryCode + vendorForm.phoneNumber,
        company_type: vendorForm.company_type,
        email: vendorForm.email,
        remark: vendorForm.remark,
        pic: picPayload,
        services: vendorForm.services,
        documents,
      };

      // --- LOG THE PAYLOAD ---
      console.log("payload:", vendorPayload);
      console.log("documents:", documents);
      console.log("pic:", picPayload);

      // 5. Send vendor create request
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/vendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vendorPayload),
      });
      if (!res.ok) {
        throw new Error("Vendor creation failed");
      }
      let newVendor = null;
      try {
        newVendor = await res.json();
      } catch {}

      // Clean up
      onOpenChange(false);
      setVendorForm(blankVendorForm(documentList));
      localStorage.removeItem(VENDOR_FORM_DRAFT_KEY);
      if (onVendorCreated) onVendorCreated(newVendor || vendorPayload);
    } catch (err: any) {
      alert(err.message || "Error occurred while saving vendor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToServiceManagement = (e: React.MouseEvent) => {
    if (vendorForm)
      localStorage.setItem(VENDOR_FORM_DRAFT_KEY, JSON.stringify(vendorForm));
  };

  if (loadingDocuments) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center gap-2 py-10 justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-lg text-muted-foreground">
              Loading required documents...
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  if (!vendorForm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            {/* Company fields */}
            <div>
              <Label htmlFor="name" className="form-label">
                Company Name *
              </Label>
              <Input
                id="name"
                value={vendorForm.name}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev,
                  )
                }
                placeholder="Enter company name"
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="companyType" className="form-label">
                Company Type
              </Label>
              <Input
                id="companyType"
                value={vendorForm.company_type}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, company_type: e.target.value } : prev,
                  )
                }
                placeholder="e.g., Launch Boat Operator"
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="address" className="form-label">
                Address
              </Label>
              <Textarea
                id="address"
                value={vendorForm.address}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, address: e.target.value } : prev,
                  )
                }
                placeholder="Enter company address"
                className="form-input"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="form-label">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <div className="w-36">
                  <ShadCountryPhoneInput
                    country="lk"
                    value={vendorForm.phoneCountryCode || "+94"}
                    onChange={(_, data) => {
                      const dial =
                        "+" +
                        (typeof data === "object" && data && "dialCode" in data
                          ? (data as any).dialCode
                          : "");
                      setVendorForm((prev) =>
                        prev ? { ...prev, phoneCountryCode: dial } : prev,
                      );
                    }}
                  />
                </div>
                <Input
                  id="phoneNumber"
                  value={vendorForm.phoneNumber}
                  onChange={(e) =>
                    setVendorForm((prev) =>
                      prev ? { ...prev, phoneNumber: e.target.value } : prev,
                    )
                  }
                  placeholder="112223344"
                  className="form-input flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="form-label">
                Email
              </Label>
              <Input
                id="email"
                value={vendorForm.email}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, email: e.target.value } : prev,
                  )
                }
                placeholder="email@company.com"
                className="form-input"
              />
            </div>
            {/* Service categories */}
            <div>
              <Label className="form-label">Service Categories</Label>
              <br />
              <Link
                href="/vendors/add-services"
                className="text-primary text-sm mt-1 inline-block hover:underline"
                onClick={handleGoToServiceManagement}
              >
                Go to Service Management to add services
              </Link>
              <Input
                placeholder="Search services..."
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                className="form-input mt-2 mb-2"
              />
              {loadingServices ? (
                <div className="flex items-center space-x-2 py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading services...
                  </span>
                </div>
              ) : filteredServiceCategories.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                  {filteredServiceCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`service-${category}`}
                        checked={vendorForm.services.includes(category)}
                        onChange={() =>
                          setVendorForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  services: vendorForm.services.includes(
                                    category,
                                  )
                                    ? vendorForm.services.filter(
                                        (c) => c !== category,
                                      )
                                    : [...vendorForm.services, category],
                                }
                              : prev,
                          )
                        }
                        className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <Label
                        htmlFor={`service-${category}`}
                        className="text-sm cursor-pointer truncate"
                        title={category}
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-2">
                  <p className="text-yellow-800 text-sm">
                    No service categories found.
                  </p>
                </div>
              )}
            </div>

            {/* --- Attachment Section --- */}
            <Separator className="my-6" />
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Vendor Documents
              </h3>
              <p
                className="bg-[#FA4812] isolate gap-2 relative before:absolute before:inset-0 before:rounded-[6px] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_50%)]
        items-center mb-2 inline-flex  tracking-tight border border-[#FA4812] dark:border-none py-2  text-white  px-3 rounded-[6px] shadow-[0px_1px_0px_rgba(255,255,255,0.12)_inset,0px_2px_5px_rgba(0,0,0,0.20)] text-sm  "
              >
                <span>
                  <svg
                    width="15"
                    height="13"
                    viewBox="0 0 15 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.08891 5.43092V7.76426M7.08891 9.43092V9.42426M6.51364 1.07973L0.843394 10.7607C0.583088 11.2051 0.903594 11.7643 1.41865 11.7643H12.7592C13.2742 11.7643 13.5947 11.2051 13.3344 10.7607L7.66417 1.07973C7.40664 0.64009 6.77117 0.64009 6.51364 1.07973ZM7.25557 9.43092C7.25557 9.52299 7.18097 9.59759 7.08891 9.59759C6.99684 9.59759 6.92224 9.52299 6.92224 9.43092C6.92224 9.33886 6.99684 9.26426 7.08891 9.26426C7.18097 9.26426 7.25557 9.33886 7.25557 9.43092Z"
                      stroke="white"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>
                Max upload size is 5MB
              </p>

              <div className="space-y-6">
                {vendorForm.attachments.map((att, idx) => {
                  const doc = documentList.find(
                    (d) => d.documentID === att.documentID,
                  );
                  return (
                    <div
                      key={att.documentID}
                      className="border p-4 rounded-xl bg-muted/40"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <Label className="font-semibold mb-2 block">
                            {idx + 1}. {att.type}
                            {doc?.isRequired && (
                              <span className="text-red-600 ml-1">*</span>
                            )}
                          </Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) =>
                                handleAttachmentFile(
                                  idx,
                                  e.target.files?.[0] || null,
                                )
                              }
                            />
                            {att.file && (
                              <Badge variant="secondary" className="text-xs">
                                {(att.file.size / 1024).toFixed(2)} KB
                              </Badge>
                            )}
                            {att.publicUrl && (
                              <a
                                href={att.publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-xs text-blue-600 underline"
                              >
                                View uploaded file
                              </a>
                            )}
                          </div>
                          {submitAttempted && attachmentErrors[idx] && (
                            <p className="text-xs text-red-600 mt-2">
                              {doc?.documentID === "DOC007" ||
                              doc?.documentID === "DOC006"
                                ? "Expiry date is required if file is uploaded."
                                : ""}
                            </p>
                          )}
                        </div>
                        <div className="w-full md:w-40">
                          <Label className="mb-1 block">
                            Expiry Date
                            {doc?.isExpiryRequiredIfUploaded && (
                              <span className="text-red-600 ml-1">*</span>
                            )}
                          </Label>
                          <DatePicker
                            value={att.expiryDate}
                            onChange={(val) => handleAttachmentExpiry(idx, val)}
                            placeholder="dd.mm.yyyy"
                            // minDate removed to allow past years
                          />
                        </div>
                        <div className="w-full md:w-52">
                          <Label className="mb-1 block">Remarks</Label>
                          <Input
                            type="text"
                            maxLength={60}
                            placeholder="Enter remarks"
                            value={att.remarks}
                            onChange={(e) =>
                              handleAttachmentRemarks(idx, e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* --- End Attachment Section --- */}
            <Separator className="my-6" />
            {/* PIC Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Primary Contacts (PICs)
                  <span className="text-xs rounded-full bg-muted-foreground/10 text-muted-foreground px-2 py-0.5">
                    {vendorForm.pics.length}
                  </span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewPIC}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add PIC
                </Button>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {vendorForm.pics.map((pic, picIdx) => {
                  const displayName =
                    [pic.title, pic.firstName, pic.lastName]
                      .filter(Boolean)
                      .join(" ") || "Untitled";
                  return (
                    <AccordionItem
                      key={pic.id || picIdx}
                      value={`pic-${pic.id || picIdx}`}
                      className="rounded-xl border bg-muted/60"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex w-full items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {(pic.firstName?.[0] || "?") +
                                    (pic.lastName?.[0] || "")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {displayName}
                                </div>
                                {/* <div className="text-xs text-muted-foreground truncate">
                                  {pic.department || "No department"}
                                </div> */}
                              </div>
                            </div>
                            <Badge
                              variant={
                                pic.type === "Primary" ? "default" : "secondary"
                              }
                            >
                              {pic.type || "Secondary"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePIC(picIdx);
                              }}
                              aria-label="Remove PIC"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <Label className="mb-1 block">PIC Type</Label>
                            <Select
                              value={pic.type || "Secondary"}
                              onValueChange={(val) =>
                                updatePIC(
                                  picIdx,
                                  "type",
                                  val as "Primary" | "Secondary",
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select PIC Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Primary">Primary</SelectItem>
                                <SelectItem value="Secondary">
                                  Secondary
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="mb-1 block">Title</Label>
                            <Select
                              value={pic.title || "Mr"}
                              onValueChange={(val) =>
                                updatePIC(picIdx, "title", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Title" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mr.">Mr.</SelectItem>
                                <SelectItem value="Ms.">Ms.</SelectItem>
                                <SelectItem value="Mrs.">Mrs.</SelectItem>
                                <SelectItem value="Dr.">Dr.</SelectItem>
                                <SelectItem value="Capt.">Capt.</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="mb-1 block">First Name</Label>
                            <Input
                              value={pic.firstName || ""}
                              onChange={(e) =>
                                updatePIC(picIdx, "firstName", e.target.value)
                              }
                              placeholder="First name"
                              autoCapitalize="words"
                            />
                          </div>
                          <div>
                            <Label className="mb-1 block">Last Name</Label>
                            <Input
                              value={pic.lastName || ""}
                              onChange={(e) =>
                                updatePIC(picIdx, "lastName", e.target.value)
                              }
                              placeholder="Last name"
                              autoCapitalize="words"
                            />
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Contact Numbers</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPICContactNumber(picIdx)}
                              className="gap-1"
                            >
                              <Plus className="h-4 w-4" /> Add Number
                            </Button>
                          </div>
                          {pic.contactNumbers.map((num, numIdx) => (
                            <div
                              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                              key={numIdx}
                            >
                              <div className="sm:col-span-4">
                                <ShadCountryPhoneInput
                                  country="lk"
                                  value={
                                    num.startsWith("+")
                                      ? num.split(" ")[0]
                                      : "+94"
                                  }
                                  onChange={(val, data) => {
                                    const rest = num.replace(
                                      /^(\+\d+)?\s?/,
                                      "",
                                    );
                                    const dial =
                                      "+" +
                                      (typeof data === "object" &&
                                      data &&
                                      "dialCode" in data
                                        ? (data as any).dialCode
                                        : "");
                                    const updatedNumber = dial + " " + rest;
                                    updatePICContactNumber(
                                      picIdx,
                                      numIdx,
                                      updatedNumber.trim(),
                                    );
                                  }}
                                />
                              </div>
                              <div className="sm:col-span-7">
                                <Input
                                  value={
                                    num.startsWith("+")
                                      ? num.replace(/^(\+\d+)\s?/, "")
                                      : num
                                  }
                                  onChange={(e) =>
                                    updatePICContactNumber(
                                      picIdx,
                                      numIdx,
                                      (num.startsWith("+")
                                        ? num.split(" ")[0] + " "
                                        : "+94 ") + e.target.value,
                                    )
                                  }
                                  placeholder="77 123 4567"
                                />
                              </div>
                              <div className="sm:col-span-1 flex sm:justify-end">
                                {pic.contactNumbers.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removePICContactNumber(picIdx, numIdx)
                                    }
                                    aria-label="Remove number"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Emails</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addPICEmail(picIdx)}
                              className="gap-1"
                            >
                              <Plus className="h-4 w-4" /> Add Email
                            </Button>
                          </div>
                          {pic.emails.map((email, emailIdx) => (
                            <div
                              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
                              key={emailIdx}
                            >
                              <div className="sm:col-span-11">
                                <Input
                                  value={email}
                                  onChange={(e) =>
                                    updatePICEmail(
                                      picIdx,
                                      emailIdx,
                                      e.target.value,
                                    )
                                  }
                                  placeholder="email@company.com"
                                  inputMode="email"
                                />
                              </div>
                              <div className="sm:col-span-1 flex sm:justify-end">
                                {pic.emails.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removePICEmail(picIdx, emailIdx)
                                    }
                                    aria-label="Remove email"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <Separator className="my-4" />
                        <div>
                          <Label className="mb-1 block">Remarks</Label>
                          <Textarea
                            value={pic.remark}
                            onChange={(e) =>
                              updatePIC(picIdx, "remark", e.target.value)
                            }
                            placeholder="Additional notes about this PIC"
                            rows={3}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
                {vendorForm.pics.length === 0 && (
                  <div className="rounded-xl border bg-muted/40 p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      No Primary Contacts yet.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewPIC}
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add New PIC
                    </Button>
                  </div>
                )}
              </Accordion>
            </div>
            <div>
              <Label htmlFor="remark" className="form-label">
                Company Remarks
              </Label>
              <Textarea
                id="remark"
                value={vendorForm.remark}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, remark: e.target.value } : prev,
                  )
                }
                placeholder="Additional notes about the vendor"
                className="form-input"
                rows={3}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveVendor}
            className="professional-button-primary w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Vendor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
