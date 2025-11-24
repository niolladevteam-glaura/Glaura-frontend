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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Vessel = {
  id: string;
  vessel_name: string;
  imo_number: string;
};

type Delivery = {
  awb: string;
  weight: string;
  pcs: string;
};

type CrewMember = {
  name: string;
  nationality: string;
  rank: string;
  passport_number: string;
  accommodation?: string;
  arraival?: string;
};

export default function WorkDoneGeneratePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Vessel state
  const [vesselName, setVesselName] = useState<string>("");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [imo, setImo] = useState<string>("");

  // Form state
  const [voyageNo, setVoyageNo] = useState<string>("");
  const [eta, setEta] = useState<string>("");
  const [atd, setAtd] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [launchTrip, setLaunchTrip] = useState<string>("");

  const [medicalAssistanceStatus, setMedicalAssistanceStatus] =
    useState<boolean>(false);
  const [wasteDisposalStatus, setWasteDisposalStatus] =
    useState<boolean>(false);
  const [clearingAndDeliveryStatus, setClearingAndDeliveryStatus] =
    useState<boolean>(false);

  // Deliveries
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    { awb: "", weight: "", pcs: "" },
  ]);

  // Crew
  const [SingOncrew, setSingOncrew] = useState<CrewMember[]>([
    { name: "", nationality: "", rank: "", passport_number: "" },
  ]);
  const [SingOffcrew, setSingOffcrew] = useState<CrewMember[]>([
    { name: "", nationality: "", rank: "", passport_number: "" },
  ]);

  // Approver
  const [approvedBy, setApprovedBy] = useState<string>("");

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

  // Dynamic deliveries
  const handleDeliveryChange = (
    index: number,
    field: keyof Delivery,
    value: string,
  ) => {
    setDeliveries((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };
  const addDelivery = () =>
    setDeliveries((prev) => [...prev, { awb: "", weight: "", pcs: "" }]);
  const removeDelivery = (index: number) =>
    setDeliveries((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  // Dynamic Crew On
  const handleSingOnCrewChange = (
    index: number,
    field: keyof CrewMember,
    value: string,
  ) => {
    setSingOncrew((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };
  const addSingOnCrew = () =>
    setSingOncrew((prev) => [
      ...prev,
      { name: "", nationality: "", rank: "", passport_number: "" },
    ]);
  const removeSingOnCrew = (index: number) =>
    setSingOncrew((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
    );

  // Dynamic Crew Off
  const handleSingOffCrewChange = (
    index: number,
    field: keyof CrewMember,
    value: string,
  ) => {
    setSingOffcrew((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };
  const addSingOffCrew = () =>
    setSingOffcrew((prev) => [
      ...prev,
      { name: "", nationality: "", rank: "", passport_number: "" },
    ]);
  const removeSingOffCrew = (index: number) =>
    setSingOffcrew((prev) =>
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

    // Prepare payload; exclude empty deliveries/crew
    const payload: any = {
      vesselName,
      imo,
      voyageNo,
      eta,
      atd,
      port,
      date,
      approvedBy,
    };
    if (launchTrip) payload.launchTrip = launchTrip;
    payload.medicalAssistanceStatus = medicalAssistanceStatus;
    payload.wasteDisposalStatus = wasteDisposalStatus;
    payload.clearingAndDeliveryStatus = clearingAndDeliveryStatus;
    if (deliveries.some((d) => d.awb || d.weight || d.pcs))
      payload.deliveries = deliveries.filter((d) => d.awb || d.weight || d.pcs);
    if (
      SingOncrew.some(
        (c) => c.name || c.nationality || c.rank || c.passport_number,
      )
    )
      payload.SingOncrew = SingOncrew.filter(
        (c) => c.name || c.nationality || c.rank || c.passport_number,
      );
    if (
      SingOffcrew.some(
        (c) => c.name || c.nationality || c.rank || c.passport_number,
      )
    )
      payload.SingOffcrew = SingOffcrew.filter(
        (c) => c.name || c.nationality || c.rank || c.passport_number,
      );

    try {
      const res = await fetch(`${API_BASE_URL}/documents/work-done`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle PDF response or JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/pdf")) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setSuccess(
          "Work Done Certificate generated successfully! PDF should open/download automatically.",
        );
        setLoading(false);
        return;
      }

      // Otherwise, handle as JSON (API success/error)
      const result = await res.json();
      if (result.success && result.workDoneDoc?.id) {
        setSuccess("Work Done Certificate created successfully!");
        router.push(`/documents/work-done/${result.workDoneDoc.id}`);
      } else {
        setError(result.message || "Unknown error.");
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
              <div className="bg-blue-600 p-2 rounded-lg">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Work Done Certificate
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate Work Done Certificate for vessel and crew
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
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
            <CardTitle>Generate Work Done Certificate</CardTitle>
            <CardDescription>
              Fill the following details to generate a Work Done Certificate.
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
                    Voyage No
                  </label>
                  <Input
                    value={voyageNo}
                    onChange={(e) => setVoyageNo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Port</label>
                  <Input
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">ETA</label>
                  <Input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">ATD</label>
                  <Input
                    type="datetime-local"
                    value={atd}
                    onChange={(e) => setAtd(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Launch Trip
                  </label>
                  <Input
                    value={launchTrip}
                    onChange={(e) => setLaunchTrip(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Medical Assistance Provided
                  </label>
                  <Select
                    value={medicalAssistanceStatus ? "yes" : "no"}
                    onValueChange={(v) =>
                      setMedicalAssistanceStatus(v === "yes")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Waste Disposal Done
                  </label>
                  <Select
                    value={wasteDisposalStatus ? "yes" : "no"}
                    onValueChange={(v) => setWasteDisposalStatus(v === "yes")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Clearing & Delivery Done
                  </label>
                  <Select
                    value={clearingAndDeliveryStatus ? "yes" : "no"}
                    onValueChange={(v) =>
                      setClearingAndDeliveryStatus(v === "yes")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Deliveries Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Deliveries</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addDelivery}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Delivery
                  </Button>
                </div>
                {deliveries.map((d, i) => (
                  <div
                    key={`delivery-${i}`}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="AWB"
                      value={d.awb}
                      onChange={(e) =>
                        handleDeliveryChange(i, "awb", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Weight"
                      value={d.weight}
                      onChange={(e) =>
                        handleDeliveryChange(i, "weight", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Pieces"
                      value={d.pcs}
                      onChange={(e) =>
                        handleDeliveryChange(i, "pcs", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDelivery(i)}
                      disabled={deliveries.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Crew Sign On Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Crew Sign On</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSingOnCrew}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Crew On
                  </Button>
                </div>
                {SingOncrew.map((c, i) => (
                  <div
                    key={`singon-${i}`}
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) =>
                        handleSingOnCrewChange(i, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Nationality"
                      value={c.nationality}
                      onChange={(e) =>
                        handleSingOnCrewChange(i, "nationality", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Rank"
                      value={c.rank}
                      onChange={(e) =>
                        handleSingOnCrewChange(i, "rank", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Passport No."
                      value={c.passport_number}
                      onChange={(e) =>
                        handleSingOnCrewChange(
                          i,
                          "passport_number",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Accommodation"
                      value={c.accommodation || ""}
                      onChange={(e) =>
                        handleSingOnCrewChange(
                          i,
                          "accommodation",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Arrival"
                      value={c.arraival || ""}
                      onChange={(e) =>
                        handleSingOnCrewChange(i, "arraival", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSingOnCrew(i)}
                      disabled={SingOncrew.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Crew Sign Off Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Crew Sign Off</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addSingOffCrew}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Crew Off
                  </Button>
                </div>
                {SingOffcrew.map((c, i) => (
                  <div
                    key={`singoff-${i}`}
                    className="grid grid-cols-1 md:grid-cols-7 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) =>
                        handleSingOffCrewChange(i, "name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Nationality"
                      value={c.nationality}
                      onChange={(e) =>
                        handleSingOffCrewChange(
                          i,
                          "nationality",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Rank"
                      value={c.rank}
                      onChange={(e) =>
                        handleSingOffCrewChange(i, "rank", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Passport No."
                      value={c.passport_number}
                      onChange={(e) =>
                        handleSingOffCrewChange(
                          i,
                          "passport_number",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Accommodation"
                      value={c.accommodation || ""}
                      onChange={(e) =>
                        handleSingOffCrewChange(
                          i,
                          "accommodation",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      placeholder="Arrival"
                      value={c.arraival || ""}
                      onChange={(e) =>
                        handleSingOffCrewChange(i, "arraival", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSingOffCrew(i)}
                      disabled={SingOffcrew.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Approved By
                </label>
                <Input
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                />
              </div>

              {success && <div className="text-green-600">{success}</div>}
              {error && <div className="text-red-600">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Generate Work Done Certificate"}
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
