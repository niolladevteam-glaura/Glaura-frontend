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
import { Plus, Trash2, Anchor } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Vessel = {
  id: string;
  vessel_name: string;
};

type CrewChangeService = {
  Crw_Chg_Serv_id: string;
  VesselName: string;
  imo: string;
  port: string;
  crewName: string;
  job_id: string;
  onBoardDate: string;
  airline: string;
  type: string;
  crewList: {
    id: string;
    personName: string;
    nationality: string;
    eTicketNo: string;
    passportNumber: string;
    rank: string;
  }[];
  crewFlights: {
    flight_id: string;
    flightName: string;
    flightNumber: string;
    depatureDate: string;
    depatureTime: string;
    arriveDate: string;
    arriveTime: string;
    destination: string;
  }[];
};

type Crew = {
  name: string;
  natinality: string;
  rank: string;
  passport_number: string;
  eTicketNo: string;
};

type Flight = {
  flight_number: string;
  flight_name: string;
  flight_depature_date: string;
  flight_depature_time: string;
  flight_date: string;
  flight_time: string;
  flight_from: string;
  flight_to: string;
  arrive_date?: string;
  arrive_time?: string;
};

export default function OKTBPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [principle, setPrinciple] = useState<string>("");
  const [vessel, setVessel] = useState<string>("");
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [jobId, setJobId] = useState<string>("");
  const [crewServices, setCrewServices] = useState<CrewChangeService[]>([]);
  const [selectedCrewServiceID, setSelectedCrewServiceID] =
    useState<string>("");
  const [airline, setAirline] = useState<string>("");
  const [onBoardDate, setOnBoardDate] = useState<string>("");
  const [bookingReference, setBookingReference] = useState<string>("");
  const [airLinePNR, setAirLinePNR] = useState<string>("");
  const [crew, setCrew] = useState<Crew[]>([
    { name: "", natinality: "", rank: "", passport_number: "", eTicketNo: "" },
  ]);
  const [flights, setFlights] = useState<Flight[]>([
    {
      flight_number: "",
      flight_name: "",
      flight_depature_date: "",
      flight_depature_time: "",
      flight_date: "",
      flight_time: "",
      flight_from: "",
      flight_to: "",
    },
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

  // When jobId changes, fetch all crew change services for that job
  useEffect(() => {
    if (!jobId) {
      setCrewServices([]);
      setSelectedCrewServiceID("");
      return;
    }
    const fetchCrewServicesByJobId = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(
          `${API_BASE_URL}/crew/job/${encodeURIComponent(jobId)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCrewServices(data.data);
          if (data.data.length === 1)
            setSelectedCrewServiceID(data.data[0].Crw_Chg_Serv_id);
        } else {
          setCrewServices([]);
        }
      } catch (err) {
        setCrewServices([]);
      }
    };
    fetchCrewServicesByJobId();
  }, [jobId]);

  // When crew change is selected, autofill from crewServices array (NO API call)
  useEffect(() => {
    if (!selectedCrewServiceID) return;
    // Find the crew change in crewServices array
    const service = crewServices.find(
      (cs) => cs.Crw_Chg_Serv_id === selectedCrewServiceID
    );
    if (!service) return;

    setVessel(service.VesselName || "");
    setAirline(service.airline || "");
    setOnBoardDate(service.onBoardDate || "");
    setCrew(
      service.crewList && service.crewList.length > 0
        ? service.crewList.map((c: any) => ({
            name: c.personName,
            natinality: c.nationality,
            rank: c.rank,
            passport_number: c.passportNumber,
            eTicketNo: c.eTicketNo,
          }))
        : [
            {
              name: "",
              natinality: "",
              rank: "",
              passport_number: "",
              eTicketNo: "",
            },
          ]
    );
    setFlights(
      service.crewFlights && service.crewFlights.length > 0
        ? service.crewFlights.map((f: any) => ({
            flight_number: f.flightNumber,
            flight_name: f.flightName,
            flight_depature_date: f.depatureDate,
            flight_depature_time: f.depatureTime,
            flight_date: f.arriveDate ?? "",
            flight_time: f.arriveTime ?? "",
            flight_from: f.destination.split(" - ")[0] || f.destination || "",
            flight_to: f.destination.split(" - ")[1] || f.destination || "",
            arrive_date: f.arriveDate ?? "",
            arrive_time: f.arriveTime ?? "",
          }))
        : [
            {
              flight_number: "",
              flight_name: "",
              flight_depature_date: "",
              flight_depature_time: "",
              flight_date: "",
              flight_time: "",
              flight_from: "",
              flight_to: "",
            },
          ]
    );
  }, [selectedCrewServiceID, crewServices]);

  // Crew dynamic handlers
  const handleCrewChange = (
    index: number,
    field: keyof Crew,
    value: string
  ) => {
    setCrew((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };
  const addCrew = () =>
    setCrew((prev) => [
      ...prev,
      {
        name: "",
        natinality: "",
        rank: "",
        passport_number: "",
        eTicketNo: "",
      },
    ]);
  const removeCrew = (index: number) =>
    setCrew((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );

  // Flights dynamic handlers
  const handleFlightChange = (
    index: number,
    field: keyof Flight,
    value: string
  ) => {
    setFlights((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
    );
  };
  const addFlight = () =>
    setFlights((prev) => [
      ...prev,
      {
        flight_number: "",
        flight_name: "",
        flight_depature_date: "",
        flight_depature_time: "",
        flight_date: "",
        flight_time: "",
        flight_from: "",
        flight_to: "",
      },
    ]);
  const removeFlight = (index: number) =>
    setFlights((prev) =>
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
      const res = await fetch(`${API_BASE_URL}/documents/oktb`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date,
          principle,
          vessel,
          airline,
          onBoardDate,
          crew,
          fights: flights,
          bookingReference,
          airLinePNR,
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

      // --- PDF handling here ---
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setSuccess(
        "OKTB Document generated successfully! PDF should open/download automatically."
      );
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
            <Link href="/dashboard" className="flex-shrink-0"></Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  OKTB Document
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Generate OKTB Documents
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
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
            <CardTitle>Generate OKTB Document</CardTitle>
            <CardDescription>
              Fill the following details to generate an OKTB document.
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
                    Principle
                  </label>
                  <Input
                    value={principle}
                    onChange={(e) => setPrinciple(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Job ID
                  </label>
                  <Input
                    value={jobId}
                    onChange={(e) => {
                      setJobId(e.target.value);
                      setSelectedCrewServiceID("");
                    }}
                    placeholder="Enter job id to autofill"
                  />
                </div>
                {crewServices.length > 0 && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">
                      Crew Change Name
                    </label>
                    <Select
                      value={selectedCrewServiceID}
                      onValueChange={setSelectedCrewServiceID}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select crew change" />
                      </SelectTrigger>
                      <SelectContent>
                        {crewServices.map((cs) => (
                          <SelectItem
                            key={cs.Crw_Chg_Serv_id}
                            value={cs.Crw_Chg_Serv_id}
                          >
                            {cs.crewName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Vessel
                  </label>
                  <Select
                    value={vessel}
                    onValueChange={(v) => setVessel(v)}
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
                    Airline
                  </label>
                  <Input
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    On Board Date
                  </label>
                  <Input
                    type="date"
                    value={onBoardDate}
                    onChange={(e) => setOnBoardDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Booking Reference
                  </label>
                  <Input
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Airline PNR
                  </label>
                  <Input
                    value={airLinePNR}
                    onChange={(e) => setAirLinePNR(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Crew Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Crew List</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCrew}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Crew
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 font-semibold">
                  <span>Name</span>
                  <span>Nationality</span>
                  <span>Rank</span>
                  <span>Passport No.</span>
                  <span>eTicket No.</span>
                </div>
                {crew.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) =>
                        handleCrewChange(i, "name", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Nationality"
                      value={c.natinality}
                      onChange={(e) =>
                        handleCrewChange(i, "natinality", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Rank"
                      value={c.rank}
                      onChange={(e) =>
                        handleCrewChange(i, "rank", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Passport No."
                      value={c.passport_number}
                      onChange={(e) =>
                        handleCrewChange(i, "passport_number", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="eTicket No."
                      value={c.eTicketNo}
                      onChange={(e) =>
                        handleCrewChange(i, "eTicketNo", e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCrew(i)}
                      disabled={crew.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Flights Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Flights</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addFlight}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Flight
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-9 gap-2 mb-2 font-semibold">
                  <span>Number</span>
                  <span>Name</span>
                  <span>Dep. Date</span>
                  <span>Dep. Time</span>
                  <span>Arr. Date</span>
                  <span>Arr. Time</span>
                  <span>From</span>
                  <span>To</span>
                </div>
                {flights.map((f, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 md:grid-cols-10 gap-2 mb-2 items-end"
                  >
                    <Input
                      placeholder="Flight Number"
                      value={f.flight_number}
                      onChange={(e) =>
                        handleFlightChange(i, "flight_number", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Flight Name"
                      value={f.flight_name}
                      onChange={(e) =>
                        handleFlightChange(i, "flight_name", e.target.value)
                      }
                      required
                    />
                    <Input
                      type="date"
                      placeholder="Dep. Date"
                      value={f.flight_depature_date}
                      onChange={(e) =>
                        handleFlightChange(
                          i,
                          "flight_depature_date",
                          e.target.value
                        )
                      }
                      required
                    />
                    <Input
                      type="time"
                      placeholder="Dep. Time"
                      value={f.flight_depature_time}
                      onChange={(e) =>
                        handleFlightChange(
                          i,
                          "flight_depature_time",
                          e.target.value
                        )
                      }
                      required
                    />
                    <Input
                      type="date"
                      placeholder="Arr. Date"
                      value={f.arrive_date || ""}
                      onChange={(e) =>
                        handleFlightChange(i, "arrive_date", e.target.value)
                      }
                    />
                    <Input
                      type="time"
                      placeholder="Arr. Time"
                      value={f.arrive_time || ""}
                      onChange={(e) =>
                        handleFlightChange(i, "arrive_time", e.target.value)
                      }
                    />
                    <Input
                      placeholder="From"
                      value={f.flight_from}
                      onChange={(e) =>
                        handleFlightChange(i, "flight_from", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="To"
                      value={f.flight_to}
                      onChange={(e) =>
                        handleFlightChange(i, "flight_to", e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFlight(i)}
                      disabled={flights.length === 1}
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
                {loading ? "Submitting..." : "Generate OKTB"}
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
