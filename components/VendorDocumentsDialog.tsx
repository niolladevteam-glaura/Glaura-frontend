import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Users, ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

interface Vendor {
  vendor_id: string;
  name: string;
  company_type: string;
}

interface VendorDocumentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Vendor[];
  loading?: boolean;
}

export default function VendorDocumentsDialog({
  open,
  onOpenChange,
  vendors,
  loading = false,
}: VendorDocumentsDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  // Filter vendors by name/type based on search query
  const filteredVendors = useMemo(() => {
    if (!search.trim()) return vendors;
    const searchLower = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(searchLower) ||
        v.company_type.toLowerCase().includes(searchLower)
    );
  }, [vendors, search]);

  const handleVendorClick = (vendorId: string) => {
    router.push(`/vendors/${vendorId}/documents`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>Vendor Documents</DialogTitle>
          <DialogDescription>
            Click on the relevant vendor to view and manage their documents.
          </DialogDescription>
        </DialogHeader>
        {/* Search bar */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>
        <div
          className="flex flex-col gap-3 overflow-y-auto"
          style={{ maxHeight: "340px", minHeight: "120px" }}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading-skeleton w-8 h-8 rounded-full"></div>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base font-medium mb-2">No vendors found</h3>
              <p className="text-muted-foreground">
                No vendors to show. Add a vendor to begin managing documents.
              </p>
            </div>
          ) : (
            filteredVendors.map((vendor, idx) => (
              <Button
                key={vendor.vendor_id}
                className="w-full flex items-center justify-between gap-4 text-left rounded-lg px-4 py-4
                  bg-background hover:bg-primary/10 active:bg-primary/20 transition
                  shadow-sm hover:shadow-lg border-none"
                variant="ghost"
                onClick={() => handleVendorClick(vendor.vendor_id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar>
                    <AvatarFallback>
                      {vendor.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex flex-col">
                    <span className="font-semibold text-base truncate">
                      {vendor.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {vendor.company_type}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
