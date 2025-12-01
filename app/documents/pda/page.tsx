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
import { Plus, Trash2, Anchor, LogOut, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// IMPORT Textarea
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Vessel = {
  id: string;
  vessel_name: string;
  grt: number;
  // ...other fields
};

type InvoiceRow = {
  no: number;
  details: string;
  amount: number | string;
  remarks: string;
};

type InvoiceTable = {
  tableHeader: string;
  tableRows: InvoiceRow[];
  tableTotal: number;
};

export default function PdaGeneratePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [ClientName, setClientName] = useState<string>("");
  const [ClientAddress, setClientAddress] = useState<string>("");
  const [ClientRefNo, setClientRefNo] = useState<string>("");
  const [AgentName, setAgentName] = useState<string>("");
  const [VesselName, setVesselName] = useState<string>("");
  const [grt, setGrt] = useState<number | string>("");
  const [port, setPort] = useState<string>("");
  const [arraivalDate, setArraivalDate] = useState<string>("");
  const [departureDate, setDepartureDate] = useState<string>("");
  const [poc, setPoc] = useState<string>("Cargo Operations");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [invoiceData, setInvoiceData] = useState<InvoiceTable[]>([
    {
      tableHeader: "",
      tableRows: [{ no: 1, details: "", amount: "", remarks: "" }],
      tableTotal: 0,
    },
  ]);
  const [InvoiceTotal, setInvoiceTotal] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Fetch vessels on mount
  useEffect(() => {
    const fetchVessels = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_BASE_URL}/vessel`, {
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
      } catch (e) {
        setVessels([]);
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

  // When VesselName changes, auto-fill GRT
  useEffect(() => {
    const vessel = vessels.find((v) => v.vessel_name === VesselName);
    if (vessel) setGrt(vessel.grt || "");
    else setGrt("");
  }, [VesselName, vessels]);

  // Auto-calculate tableTotals and InvoiceTotal
  useEffect(() => {
    const updatedInvoiceData = invoiceData.map((table) => {
      const total = table.tableRows.reduce(
        (sum, row) => sum + (parseFloat(row.amount as string) || 0),
        0,
      );
      return { ...table, tableTotal: total };
    });
    setInvoiceData(updatedInvoiceData);

    const totalAll = updatedInvoiceData.reduce(
      (sum, table) => sum + table.tableTotal,
      0,
    );
    setInvoiceTotal(totalAll);
    // eslint-disable-next-line
  }, [JSON.stringify(invoiceData)]);

  // Handlers for invoiceData (tables/rows)
  const addInvoiceTable = () => {
    setInvoiceData((prev) => [
      ...prev,
      {
        tableHeader: "",
        tableRows: [{ no: 1, details: "", amount: "", remarks: "" }],
        tableTotal: 0,
      },
    ]);
  };

  const removeInvoiceTable = (index: number) => {
    setInvoiceData((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  const handleTableHeaderChange = (index: number, header: string) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === index ? { ...table, tableHeader: header } : table,
      ),
    );
  };

  const handleRowChange = (
    tableIdx: number,
    rowIdx: number,
    field: keyof InvoiceRow,
    value: string,
  ) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === tableIdx
          ? {
              ...table,
              tableRows: table.tableRows.map((row, ri) =>
                ri === rowIdx ? { ...row, [field]: value } : row,
              ),
            }
          : table,
      ),
    );
  };

  const addRow = (tableIdx: number) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === tableIdx
          ? {
              ...table,
              tableRows: [
                ...table.tableRows,
                {
                  no: table.tableRows.length + 1,
                  details: "",
                  amount: "",
                  remarks: "",
                },
              ],
            }
          : table,
      ),
    );
  };

  const removeRow = (tableIdx: number, rowIdx: number) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === tableIdx
          ? {
              ...table,
              tableRows:
                table.tableRows.length > 1
                  ? table.tableRows
                      .filter((_, ri) => ri !== rowIdx)
                      .map((row, idx) => ({
                        ...row,
                        no: idx + 1,
                      }))
                  : table.tableRows,
            }
          : table,
      ),
    );
  };

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

    // Prepare payload
    // Convert datetime-local format (YYYY-MM-DDTHH:mm) to YYYY-MM-DD for backend
    const formatDate = (dateTimeStr: string) => {
      if (!dateTimeStr) return "";
      return dateTimeStr.split('T')[0]; // Extract date part only
    };

    const payload = {
      date,
      ClientName,
      ClientAddress,
      ClientRefNo,
      AgentName,
      VesselName,
      port,
      grt: grt ? Number(grt) : null,
      arraivalDate: formatDate(arraivalDate),
      departureDate: formatDate(departureDate),
      poc,
      invoiceData: invoiceData.map((table) => ({
        tableHeader: table.tableHeader,
        tableTotal: table.tableTotal,
        tableRows: table.tableRows.map((row) => ({
          no: row.no,
          details: row.details,
          amount: Number(row.amount) || 0,
          remarks: row.remarks,
        })),
      })),
      InvoiceTotal,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/documents/pda`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setError("Unauthorized. Please login again.");
        } else {
          setError((await res.text()) || "Failed to submit");
        }
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setSuccess(
        "PDA Document generated successfully! PDF should open/download automatically.",
      );
      clearDraft(); // Clear draft after successful generation
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    router.push("/");
  };

  // Check if form has any content
  const hasFormContent = () => {
    return (
      ClientName.trim() !== "" ||
      ClientAddress.trim() !== "" ||
      ClientRefNo.trim() !== "" ||
      AgentName.trim() !== "" ||
      VesselName.trim() !== "" ||
      grt !== "" ||
      port.trim() !== "" ||
      arraivalDate !== "" ||
      departureDate !== "" ||
      poc !== "Cargo Operations" ||
      invoiceData.some(
        (table) =>
          table.tableHeader.trim() !== "" ||
          table.tableRows.some(
            (row) =>
              row.details.trim() !== "" ||
              row.amount !== "" ||
              row.remarks.trim() !== ""
          )
      )
    );
  };

  // Save draft to localStorage
  const handleSaveDraft = () => {
    const draftData = {
      date,
      ClientName,
      ClientAddress,
      ClientRefNo,
      AgentName,
      VesselName,
      port,
      grt,
      arraivalDate,
      departureDate,
      poc,
      invoiceData,
      InvoiceTotal,
    };

    try {
      localStorage.setItem("pdaDraft", JSON.stringify(draftData));
      setShowDraftModal(false);
      router.push("/documents");
    } catch (err: any) {
      alert("Failed to save draft to local storage");
    }
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("pdaDraft");
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setDate(draftData.date || new Date().toISOString().slice(0, 10));
        setClientName(draftData.ClientName || "");
        setClientAddress(draftData.ClientAddress || "");
        setClientRefNo(draftData.ClientRefNo || "");
        setAgentName(draftData.AgentName || "");
        setVesselName(draftData.VesselName || "");
        setGrt(draftData.grt || "");
        setPort(draftData.port || "");
        setArraivalDate(draftData.arraivalDate || "");
        setDepartureDate(draftData.departureDate || "");
        setPoc(draftData.poc || "Cargo Operations");
        setInvoiceData(draftData.invoiceData || [
          {
            tableHeader: "",
            tableRows: [{ no: 1, details: "", amount: "", remarks: "" }],
            tableTotal: 0,
          },
        ]);
        setInvoiceTotal(draftData.InvoiceTotal || 0);
        setHasDraft(true);
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    if (hasFormContent()) {
      setShowDraftModal(true);
    } else {
      router.push("/documents");
    }
  };

  // Discard draft and go back
  const handleDiscard = () => {
    localStorage.removeItem("pdaDraft");
    setShowDraftModal(false);
    router.push("/documents");
  };

  // Clear draft after successful submission
  const clearDraft = () => {
    localStorage.removeItem("pdaDraft");
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="animate-pulse text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="glass-effect border-b px-2 py-2 sm:px-4 sm:py-3 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="flex items-center px-2 py-1 text-xs sm:text-sm flex-shrink-0"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4 mr-0 sm:mr-2" />
              <span className="hidden xs:inline">Back to Dashboard</span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-yellow-500 p-2 rounded-lg">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  PDA Document
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate PDA Documents
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
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

      <div className="w-full max-w-4xl mx-auto px-2 sm:px-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-xl">
              Generate PDA Document
            </CardTitle>
            <CardDescription className="text-sm">
              Fill the following details to generate a Port Disbursement
              Account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Client Name
                  </label>
                  <Input
                    value={ClientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Client Address
                  </label>
                  <Input
                    value={ClientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Client Reference No
                  </label>
                  <Input
                    value={ClientRefNo}
                    onChange={(e) => setClientRefNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Agent Name
                  </label>
                  <Input
                    value={AgentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Vessel Name
                  </label>
                  <Select
                    value={VesselName}
                    onValueChange={(v) => setVesselName(v)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vessel" />
                    </SelectTrigger>
                    <SelectContent>
                      {vessels.map((v) => (
                        <SelectItem key={v.id} value={v.vessel_name}>
                          {v.vessel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Gross Registered Tonnage (GRT)
                  </label>
                  <Input value={grt} readOnly placeholder="Auto-filled" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Port</label>
                  <Input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Arrival Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={arraivalDate}
                    onChange={(e) => setArraivalDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Departure Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-1 text-sm font-medium">
                    Purpose of Call (POC)
                  </label>
                  <Input
                    value={poc}
                    onChange={(e) => setPoc(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Invoice Data Section */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                  <span className="font-medium text-base">Invoice Tables</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addInvoiceTable}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Table
                  </Button>
                </div>
                <div className="space-y-4">
                  {invoiceData.map((table, tableIdx) => (
                    <div
                      key={tableIdx}
                      className="border rounded-lg p-3 sm:p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <Input
                          placeholder="Table Header (e.g. Port Charges)"
                          value={table.tableHeader}
                          onChange={(e) =>
                            handleTableHeaderChange(tableIdx, e.target.value)
                          }
                          required
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInvoiceTable(tableIdx)}
                          disabled={invoiceData.length === 1}
                          title="Remove Table"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      {/* Table Rows */}
                      <div>
                        <div className="flex flex-col gap-2 w-full overflow-x-auto">
                          {table.tableRows.map((row, rowIdx) => (
                            <div
                              key={rowIdx}
                              className="grid grid-cols-12 gap-2 items-center"
                            >
                              <div className="col-span-12 xs:col-span-1">
                                <Input
                                  value={row.no}
                                  readOnly
                                  className="w-full"
                                />
                              </div>
                              <div className="col-span-12 xs:col-span-4">
                                <Input
                                  placeholder="Details"
                                  value={row.details}
                                  onChange={(e) =>
                                    handleRowChange(
                                      tableIdx,
                                      rowIdx,
                                      "details",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  className="w-full"
                                />
                              </div>
                              <div className="col-span-12 xs:col-span-3">
                                <Input
                                  type="number"
                                  placeholder="Amount"
                                  value={row.amount}
                                  onChange={(e) =>
                                    handleRowChange(
                                      tableIdx,
                                      rowIdx,
                                      "amount",
                                      e.target.value,
                                    )
                                  }
                                  required
                                  min={0}
                                  step="any"
                                  className="w-full"
                                />
                              </div>
                              <div className="col-span-12 xs:col-span-3">
                                {/* Use Textarea for Remarks */}
                                <Textarea
                                  placeholder="Remarks"
                                  value={row.remarks}
                                  onChange={(e) =>
                                    handleRowChange(
                                      tableIdx,
                                      rowIdx,
                                      "remarks",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full"
                                  rows={2}
                                />
                              </div>
                              <div className="col-span-12 xs:col-span-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeRow(tableIdx, rowIdx)}
                                  disabled={table.tableRows.length === 1}
                                  title="Remove Row"
                                  className="w-full"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addRow(tableIdx)}
                              className="mt-2"
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add Row
                            </Button>
                          </div>
                          <div className="flex justify-end mt-2">
                            <span className="text-base font-semibold text-yellow-700 dark:text-yellow-300">
                              Table Total: {table.tableTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <span className="text-lg font-bold text-yellow-900 dark:text-yellow-300">
                    Invoice Total: {InvoiceTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? "Submitting..." : "Generate PDA"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                className="w-full sm:w-auto"
                onClick={handleBackClick}
              >
                Back
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Draft Modal */}
      <Dialog open={showDraftModal} onOpenChange={setShowDraftModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Draft?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Would you like to save this as a draft before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="w-full sm:w-auto"
            >
              Discard
            </Button>
            <Button
              onClick={handleSaveDraft}
              className="w-full sm:w-auto"
            >
              Save as Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
