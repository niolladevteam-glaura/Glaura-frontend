"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentName?: string;
}

export function DeleteDocumentDialog({
  open,
  onClose,
  onConfirm,
  documentName,
}: DeleteDocumentDialogProps) {
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
