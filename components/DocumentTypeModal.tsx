"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}


const allDocumentOptions = [
  { label: "OKTB Documents", path: "/documents/oktb", key: "OKTB" },
  { label: "Crew Sign On / Off Documents", path: "/documents/crew-signon", key: "Crew Sign On" },
  { label: "Port Disbursement Account", path: "/documents/pda", key: "PDA" },
  { label: "Work Done Certificate", path: "/documents/work-done", key: "Work Done" },
  { label: "Delivery Note", path: "/documents/delivery-note", key: "Delivery Note" },
  //{ label: "Customs Letters", path: "/documents/customs", key: "Customs Letters" },
  //{ label: "FDA Applications", path: "/documents/fda", key: "FDA" },
  //{ label: "TW Applications", path: "/documents/tw-applications", key: "TW Applications" },
];

export function DocumentTypeModal({ open, onClose }: Props) {
  const router = useRouter();

  // Get current user from localStorage
  let department: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        department = user.department || null;
      }
    } catch {}
  }

  // Filter document options based on department
  let documentOptions = allDocumentOptions;
  if (department) {
    const dept = department.toLowerCase();
    if (dept === "disbursement") {
      documentOptions = allDocumentOptions.filter((d) => ["PDA", "Delivery Note", "FDA"].includes(d.key));
    } else if (dept === "operations") {
      documentOptions = allDocumentOptions.filter((d) => ["OKTB", "Crew Sign On", "Work Done", "Delivery Note"].includes(d.key));
    }
    // All other departments: no restrictions
  }

  const handleSelect = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Document Type</DialogTitle>
          <DialogDescription>
            What type of document do you want to generate?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {documentOptions.map((opt) => (
            <Button
              key={opt.path}
              variant="outline"
              className="justify-start"
              onClick={() => handleSelect(opt.path)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
