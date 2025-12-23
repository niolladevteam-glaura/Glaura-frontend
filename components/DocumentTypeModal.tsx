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

const documentOptions = [
  { label: "OKTB Documents", path: "/documents/oktb" },
  { label: "Crew Sign On / Off Documents", path: "/documents/crew-signon" },
  { label: "Port Disbursement Account", path: "/documents/pda" },
  { label: "Work Done Certificate", path: "/documents/work-done" },
  { label: "Delivery Note", path: "/documents/delivery-note" },
  //{ label: "Customs Letters", path: "/documents/customs" },
  //{ label: "FDA Applications", path: "/documents/fda" },
  //{ label: "TW Applications", path: "/documents/tw-applications" },
];

export function DocumentTypeModal({ open, onClose }: Props) {
  const router = useRouter();

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
