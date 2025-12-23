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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Vessel = {
  id: string;
  vessel_name: string;
  imo_number: string;
};

type Passenger = {
  name: string;
  nationality: string;
  passportNumber: string;
  rank: string;
};

export default function CrewSignOnGeneratePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Document type state
  const [documentType, setDocumentType] = useState<"signon" | "signoff">(
    "signon"
  );

  // Form state
  const [VesselName, setVesselName] = useState<string>("");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [imo, setImo] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [JoinDate, setJoinDate] = useState<string>("");
  const [authorizePerson, setAuthorizePerson] = useState<string>("");
  const [authorizePersonNic, setAuthorizePersonNic] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [flight, setFlight] = useState<string>("");
  const [arriveTime, setArriveTime] = useState<string>("");
  const [arriveDate, setArriveDate] = useState<string>("");
  const [passengers, setPassengers] = useState<Passenger[]>([
    { name: "", nationality: "", passportNumber: "", rank: "" },
  ]);

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

  // Handlers for dynamic passengers
  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };
  const addPassenger = () =>
    setPassengers((prev) => [
      ...prev,
      { name: "", nationality: "", passportNumber: "", rank: "" },
    ]);
  const removePassenger = (index: number) =>
    setPassengers((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );

  // Form submit with token
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
    try {
      // Optionally, you can use documentType to determine API endpoint or body parameter
      const url =
        documentType === "signon"
          ? `${API_BASE_URL}/documents/signon`
          : `${API_BASE_URL}/documents/signoff`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          VesselName,
          imo,
          port,
          JoinDate,
          flight,
          arriveTime,
          arriveDate,
          authorizePerson,
          authorizePersonNic,
          date,
          passengers,
        }),
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
        "Document generated successfully! PDF should open/download automatically."
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
              <div className="bg-green-600 p-2 rounded-lg">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Crew Sign On / Off Document
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate Crew Sign On / Off Document
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
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
        {/* Document Type Heading and Dropdown */}
        <div className="flex items-center mb-6 gap-2">
          <h1 className="text-xl font-bold">Generate Document:</h1>
          <Select
            value={documentType}
            onValueChange={(v) => setDocumentType(v as "signon" | "signoff")}
          >
            <SelectTrigger className="w-40">
              <SelectValue>
                {documentType === "signon" ? "Crew Sign On" : "Crew Sign Off"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="signon">Crew Sign On</SelectItem>
              <SelectItem value="signoff">Crew Sign Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {documentType === "signon"
                ? "Generate Crew Sign On Document"
                : "Generate Crew Sign Off Document"}
            </CardTitle>
            <CardDescription>
              Fill the following details to generate a document.
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
                    value={VesselName}
                    onValueChange={handleVesselChange}
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
                  <label className="block mb-1 text-sm font-medium">IMO</label>
                  <Input
                    value={imo}
                    onChange={(e) => setImo(e.target.value)}
                    required
                    readOnly
                  />
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
                    Join Date
                  </label>
                  <Input
                    type="date"
                    value={JoinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Flight Number
                  </label>
                  <Input
                    value={flight}
                    onChange={(e) => setFlight(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Arrive Date
                  </label>
                  <Input
                    type="date"
                    value={arriveDate}
                    onChange={(e) => setArriveDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Arrive Time
                  </label>
                  <Input
                    type="time"
                    value={arriveTime}
                    onChange={(e) => setArriveTime(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Authorized Person
                  </label>
                  <Input
                    value={authorizePerson}
                    onChange={(e) => setAuthorizePerson(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Authorized Person NIC
                  </label>
                  <Input
                    value={authorizePersonNic}
                    onChange={(e) => setAuthorizePersonNic(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Passengers Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Passengers</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addPassenger}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Passenger
                  </Button>
                </div>
                {passengers.map((p, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) =>
                        handlePassengerChange(i, "name", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Nationality"
                      value={p.nationality}
                      onChange={(e) =>
                        handlePassengerChange(i, "nationality", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Passport No."
                      value={p.passportNumber}
                      onChange={(e) =>
                        handlePassengerChange(
                          i,
                          "passportNumber",
                          e.target.value
                        )
                      }
                      required
                    />
                    <Input
                      placeholder="Rank"
                      value={p.rank}
                      onChange={(e) =>
                        handlePassengerChange(i, "rank", e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePassenger(i)}
                      disabled={passengers.length === 1}
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
                {loading
                  ? "Submitting..."
                  : documentType === "signon"
                  ? "Generate Crew Sign On"
                  : "Generate Crew Sign Off"}
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
