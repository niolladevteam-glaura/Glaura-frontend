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
import { Users, Plus, X } from "lucide-react";
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
};

type EditVendorDialogProps = {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  serviceCategories: string[];
  loadingServices: boolean;
  initialVendorForm: VendorFormType | null;
  onUpdateVendor: (formData: VendorFormType) => Promise<void>;
};

// Key for localStorage draft persistence
const VENDOR_FORM_EDIT_DRAFT_KEY = "editVendorFormDraft";

export default function EditVendorDialog({
  open,
  onOpenChange,
  serviceCategories,
  loadingServices,
  initialVendorForm,
  onUpdateVendor,
}: EditVendorDialogProps) {
  // Internal state
  const [vendorForm, setVendorForm] = useState<VendorFormType | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const hasLoadedDraft = useRef(false);

  // Load draft if available when editing opens, otherwise use initialVendorForm (only once per open)
  useEffect(() => {
    if (open && !hasLoadedDraft.current) {
      hasLoadedDraft.current = true;
      const draft = localStorage.getItem(VENDOR_FORM_EDIT_DRAFT_KEY);
      if (draft) {
        try {
          setVendorForm(JSON.parse(draft));
        } catch {
          setVendorForm(initialVendorForm);
        }
      } else {
        setVendorForm(initialVendorForm);
      }
    }
  }, [open, initialVendorForm]);

  // Optionally clear draft and reset flag when dialog closes
  useEffect(() => {
    if (!open) {
      hasLoadedDraft.current = false;
      localStorage.removeItem(VENDOR_FORM_EDIT_DRAFT_KEY);
    }
  }, [open]);

  // Persist vendorForm draft to localStorage on every change while dialog is open
  useEffect(() => {
    if (open && vendorForm) {
      localStorage.setItem(
        VENDOR_FORM_EDIT_DRAFT_KEY,
        JSON.stringify(vendorForm)
      );
    }
  }, [open, vendorForm]);

  // Handler functions for PIC section
  const addNewPIC = () => {
    setVendorForm((prev: VendorFormType | null) =>
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
        : prev
    );
  };

  const updatePIC = (index: number, field: keyof VendorPIC, value: any) => {
    setVendorForm((prev: VendorFormType | null) => {
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
    setVendorForm((prev: VendorFormType | null) =>
      prev
        ? {
            ...prev,
            pics: (prev.pics || []).filter((_, i) => i !== index),
          }
        : prev
    );
  };

  const addPICContactNumber = (picIndex: number) => {
    setVendorForm((prev: VendorFormType | null) => {
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
    value: string
  ) => {
    setVendorForm((prev: VendorFormType | null) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers[contactIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };

  const removePICContactNumber = (picIndex: number, contactIndex: number) => {
    setVendorForm((prev: VendorFormType | null) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].contactNumbers = updatedPics[
        picIndex
      ].contactNumbers.filter((_, i) => i !== contactIndex);
      updatedPics[picIndex].contactTypes = updatedPics[picIndex].contactTypes
        ? updatedPics[picIndex].contactTypes!.filter(
            (_, i) => i !== contactIndex
          )
        : [];
      return { ...prev, pics: updatedPics };
    });
  };

  const addPICEmail = (picIndex: number) => {
    setVendorForm((prev: VendorFormType | null) => {
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
    value: string
  ) => {
    setVendorForm((prev: VendorFormType | null) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails[emailIndex] = value;
      return { ...prev, pics: updatedPics };
    });
  };

  const removePICEmail = (picIndex: number, emailIndex: number) => {
    setVendorForm((prev: VendorFormType | null) => {
      if (!prev) return prev;
      const updatedPics = [...(prev.pics || [])];
      updatedPics[picIndex].emails = updatedPics[picIndex].emails.filter(
        (_, i) => i !== emailIndex
      );
      updatedPics[picIndex].emailTypes = updatedPics[picIndex].emailTypes
        ? updatedPics[picIndex].emailTypes!.filter((_, i) => i !== emailIndex)
        : [];
      return { ...prev, pics: updatedPics };
    });
  };

  const filteredServiceCategories = serviceCategories.filter((cat) =>
    cat.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // Persist vendorForm draft to localStorage on every change while dialog is open
  useEffect(() => {
    if (open && vendorForm) {
      localStorage.setItem(
        VENDOR_FORM_EDIT_DRAFT_KEY,
        JSON.stringify(vendorForm)
      );
    }
  }, [open, vendorForm]);

  // Save vendor handler
  const handleUpdateVendor = async () => {
    if (!vendorForm) return;
    setLoading(true);
    try {
      await onUpdateVendor(vendorForm);
      localStorage.removeItem(VENDOR_FORM_EDIT_DRAFT_KEY);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Handler for "Go to Service Management" link to persist draft manually
  const handleGoToServiceManagement = () => {
    if (vendorForm) {
      localStorage.setItem(
        VENDOR_FORM_EDIT_DRAFT_KEY,
        JSON.stringify(vendorForm)
      );
    }
    // Nav is handled by <Link>, so no need for router.push here
  };

  if (!vendorForm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Company Information</h3>
            <div>
              <Label htmlFor="name" className="form-label">
                Company Name *
              </Label>
              <Input
                id="name"
                value={vendorForm.name}
                onChange={(e) =>
                  setVendorForm((prev) =>
                    prev ? { ...prev, name: e.target.value } : prev
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
                    prev ? { ...prev, company_type: e.target.value } : prev
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
                    prev ? { ...prev, address: e.target.value } : prev
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
                        prev ? { ...prev, phoneCountryCode: dial } : prev
                      );
                    }}
                  />
                </div>
                <Input
                  id="phoneNumber"
                  value={vendorForm.phoneNumber}
                  onChange={(e) =>
                    setVendorForm((prev) =>
                      prev ? { ...prev, phoneNumber: e.target.value } : prev
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
                    prev ? { ...prev, email: e.target.value } : prev
                  )
                }
                placeholder="email@company.com"
                className="form-input"
              />
            </div>
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
                                    category
                                  )
                                    ? vendorForm.services.filter(
                                        (c) => c !== category
                                      )
                                    : [...vendorForm.services, category],
                                }
                              : prev
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
            <div>
              <Label htmlFor="kycStatus" className="form-label">
                KYC Status
              </Label>
              <Select
                value={vendorForm.status.status ? "Approved" : "Pending"}
                onValueChange={(value) =>
                  setVendorForm((prev) =>
                    prev
                      ? { ...prev, status: { status: value === "Approved" } }
                      : prev
                  )
                }
              >
                <SelectTrigger className="form-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                                <div className="text-xs text-muted-foreground truncate">
                                  {pic.department || "No department"}
                                </div>
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
                                  val as "Primary" | "Secondary"
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
                          <div className="sm:col-span-2">
                            <Label className="mb-1 block">Department</Label>
                            <Input
                              value={pic.department || ""}
                              onChange={(e) =>
                                updatePIC(picIdx, "department", e.target.value)
                              }
                              placeholder="Department"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="mb-1 block">Birthday</Label>
                            <DatePicker
                              value={pic.birthday}
                              onChange={(val) =>
                                updatePIC(picIdx, "birthday", val)
                              }
                              placeholder="dd.mm.yyyy"
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
                                      ""
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
                                      updatedNumber.trim()
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
                                        : "+94 ") + e.target.value
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
                                      e.target.value
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
                    prev ? { ...prev, remark: e.target.value } : prev
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
            onClick={handleUpdateVendor}
            className="professional-button-primary w-full sm:w-auto"
            disabled={loading || !vendorForm.name.trim()}
          >
            {loading ? "Saving..." : "Update Vendor"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
