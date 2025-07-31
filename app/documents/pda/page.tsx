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
import { Plus, Trash2, Anchor, LogOut } from "lucide-react";

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
    new Date().toISOString().slice(0, 10)
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
        0
      );
      return { ...table, tableTotal: total };
    });
    setInvoiceData(updatedInvoiceData);

    const totalAll = updatedInvoiceData.reduce(
      (sum, table) => sum + table.tableTotal,
      0
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
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const handleTableHeaderChange = (index: number, header: string) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === index ? { ...table, tableHeader: header } : table
      )
    );
  };

  const handleRowChange = (
    tableIdx: number,
    rowIdx: number,
    field: keyof InvoiceRow,
    value: string
  ) => {
    setInvoiceData((prev) =>
      prev.map((table, i) =>
        i === tableIdx
          ? {
              ...table,
              tableRows: table.tableRows.map((row, ri) =>
                ri === rowIdx ? { ...row, [field]: value } : row
              ),
            }
          : table
      )
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
          : table
      )
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
          : table
      )
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
    const payload = {
      date,
      ClientName,
      ClientAddress,
      ClientRefNo,
      AgentName,
      VesselName,
      port,
      grt: grt ? Number(grt) : null,
      arraivalDate,
      departureDate,
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
        "PDA Document generated successfully! PDF should open/download automatically."
      );
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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-yellow-500 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Port Disbursement Account (PDA)
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generate Port Disbursement Account
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate PDA Document</CardTitle>
            <CardDescription>
              Fill the following details to generate a Port Disbursement
              Account.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    required
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
                    required
                  />
                </div>
                <div>
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
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Invoice Tables</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addInvoiceTable}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Table
                  </Button>
                </div>
                {invoiceData.map((table, tableIdx) => (
                  <div
                    key={tableIdx}
                    className="border rounded-lg p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20"
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
                      <div className="flex flex-col gap-2">
                        {table.tableRows.map((row, rowIdx) => (
                          <div
                            key={rowIdx}
                            className="grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-1">
                              <Input value={row.no} readOnly />
                            </div>
                            <div className="col-span-4">
                              <Input
                                placeholder="Details"
                                value={row.details}
                                onChange={(e) =>
                                  handleRowChange(
                                    tableIdx,
                                    rowIdx,
                                    "details",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={row.amount}
                                onChange={(e) =>
                                  handleRowChange(
                                    tableIdx,
                                    rowIdx,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                required
                                min={0}
                                step="any"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                placeholder="Remarks"
                                value={row.remarks}
                                onChange={(e) =>
                                  handleRowChange(
                                    tableIdx,
                                    rowIdx,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="col-span-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRow(tableIdx, rowIdx)}
                                disabled={table.tableRows.length === 1}
                                title="Remove Row"
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
                <div className="flex justify-end">
                  <span className="text-lg font-bold text-yellow-900 dark:text-yellow-300">
                    Invoice Total: {InvoiceTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Generate PDA"}
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
