"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Trash2, Anchor, ArrowLeft } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Vessel = {
  id: string;
  vessel_name: string;
  imo_number: string;
};

type DeliveryItem = {
  itemNumber: number;
  itemDescription: string;
  remarks: string;
  quantity: number;
  unit: string;
};

export default function DeliveryNoteGeneratePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Vessel state
  const [vesselName, setVesselName] = useState<string>("");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [imo, setImo] = useState<string>("");

  // Form state
  const [purpose, setPurpose] = useState<string>("");
  const [portCountry, setPortCountry] = useState<string>("");
  const [dateOfSupply, setDateOfSupply] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [reference, setReference] = useState<string>("");
  const [masterSignature, setMasterSignature] = useState<string>("");
  const [signatureDate, setSignatureDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [items, setItems] = useState<DeliveryItem[]>([
    { itemNumber: 1, itemDescription: "", remarks: "", quantity: 0, unit: "" },
  ]);

  // Feedback
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch vessels with token
  useEffect(() => {
    const fetchVessels = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/vessel`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setVessels(data.data);
        } else {
          setVessels([]);
        }
        if (res.status === 401) setError("Unauthorized. Please login again.");
      } catch (e) {
        setVessels([]);
        setError("Failed to fetch vessels.");
      }
    };
    fetchVessels();
  }, []);

  // Load user with token
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
  }, [router]);

  // Vessel select handler: auto-fill IMO
  const handleVesselChange = (vesselName: string) => {
    setVesselName(vesselName);
    const vessel = vessels.find((v) => v.vessel_name === vesselName);
    if (vessel && vessel.imo_number) {
      setImo(vessel.imo_number);
    } else {
      setImo("");
    }
  };

  // Delivery items
  const handleItemChange = (
    index: number,
    field: keyof DeliveryItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, itemNumber: i + 1 } : item,
      ),
    );
  };
  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        itemNumber: prev.length + 1,
        itemDescription: "",
        remarks: "",
        quantity: 0,
        unit: "",
      },
    ]);
  const removeItem = (index: number) =>
    setItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please login.");
      setLoading(false);
      return;
    }

    const payload = {
      vesselName,
      imo,
      purpose,
      portCountry,
      dateOfSupply,
      reference,
      masterSignature,
      signatureDate,
      items: items.filter(
        (item) => item.itemDescription || item.quantity || item.unit,
      ),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/documents/delivery-note`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle PDF response or error JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setSuccess(
          "Delivery Note generated! PDF should open/download automatically.",
        );
        setLoading(false);
        return;
      }

      // Error JSON
      const result = await res.json();
      if (result.error) {
        setError(result.error + (result.details ? `: ${result.details}` : ""));
      } else {
        setError("Unknown error.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    setLoading(false);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="glass-effect border-b px-2 py-2 sm:px-4 sm:py-3 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/documents" className="flex-shrink-0">
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
              <div className="bg-purple-600 p-2 rounded-lg">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delivery Note
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate Delivery Note for vessel supply deliveries
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
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

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate Delivery Note</CardTitle>
            <CardDescription>
              Fill the following details to generate a Delivery Note.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Date of Supply
                  </label>
                  <DatePicker
                    value={dateOfSupply}
                    onChange={setDateOfSupply}
                    placeholder="Date of Supply"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Vessel Name
                  </label>
                  <Select
                    value={vesselName}
                    onValueChange={handleVesselChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map((v, idx) => (
                        <SelectItem key={v.id || idx} value={v.vessel_name}>
                          {v.vessel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">IMO</label>
                  <Input
                    value={imo}
                    onChange={(e) => setImo(e.target.value)}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Purpose
                  </label>
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Port Country
                  </label>
                  <Input
                    value={portCountry}
                    onChange={(e) => setPortCountry(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Reference
                  </label>
                  <Input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                  />
                </div>
                {/* <div>
                  <label className="block mb-1 text-sm font-medium">
                    Master Signature
                  </label>
                  <Input
                    value={masterSignature}
                    onChange={(e) => setMasterSignature(e.target.value)}
                    required
                  />
                </div> */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Signature Date
                  </label>
                  <DatePicker
                    value={signatureDate}
                    onChange={setSignatureDate}
                    placeholder="Signature Date"
                    required
                  />
                </div>
              </div>

              {/* Delivery Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Delivery Items</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addItem}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Item
                  </Button>
                </div>
                {items.map((item, i) => (
                  <div
                    key={`item-${i}`}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Description"
                      value={item.itemDescription}
                      onChange={(e) =>
                        handleItemChange(i, "itemDescription", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Remarks"
                      value={item.remarks}
                      onChange={(e) =>
                        handleItemChange(i, "remarks", e.target.value)
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(i, "quantity", Number(e.target.value))
                      }
                      required
                      min={0}
                    />
                    <Input
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(i, "unit", e.target.value)
                      }
                      required
                    />
                    <span className="text-xs px-2 py-1 text-gray-500">
                      Item #{i + 1}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Generate Delivery Note"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="ml-2"
                onClick={() => router.push("/documents")}
              >
                Back
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
