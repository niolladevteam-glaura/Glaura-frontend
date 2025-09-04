"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Eye,
  ArrowLeft,
  Loader2,
  ListChecks,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENDPOINTS = {
  SERVICES: `${API_BASE_URL}/allservices`,
  ACTIVE: `${API_BASE_URL}/activeservices`,
};

const CREW_SERVICES = [
  "crew changes (on/off)",
  "ship spares clearance and delivery",
  "ship spares off-landing and re-forwarding",
  "ship spares off-landing and connect to another vessel",
];

interface Service {
  id: number;
  job_id: string;
  service_name: string;
  vendor_name: string;
  vessel_name: string;
  crew_details?: any; // object, array, or null
  vessel_details?: any;
  status: "active" | "inactive" | string;
  createdAt: string;
  updatedAt: string;
}

export default function AllServicesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<"all" | "active">("all");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewDetails, setViewDetails] = useState<Service | null>(null);

  const router = useRouter();

  // --- API Helper ---
  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(response.statusText || "Request failed");
        }
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      return await response.json();
    } catch (error: any) {
      // toast
      return [];
    }
  };

  // --- Loaders ---
  const loadServices = async () => {
    setLoading(true);
    let resp;
    if (tab === "active") {
      resp = await apiCall(API_ENDPOINTS.ACTIVE);
    } else {
      resp = await apiCall(API_ENDPOINTS.SERVICES);
    }
    if (Array.isArray(resp)) {
      setServices(resp);
    } else if (Array.isArray(resp?.data)) {
      setServices(resp.data);
    } else {
      setServices([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    loadServices();
    // eslint-disable-next-line
  }, [router, tab]);

  // --- Filter and Search ---
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedFilter = filter.toLowerCase();

  const filteredServices = services.filter((svc) => {
    // Filter by Crew/Spare
    const isCrewOrSpare = CREW_SERVICES.some(
      (serviceName) => svc.service_name.trim().toLowerCase() === serviceName
    );
    if (normalizedFilter === "crew" && !isCrewOrSpare) return false;
    // Search by service name, vessel, job_id
    if (
      normalizedSearch &&
      !(
        svc.service_name.toLowerCase().includes(normalizedSearch) ||
        svc.vessel_name?.toLowerCase().includes(normalizedSearch) ||
        svc.job_id?.toLowerCase().includes(normalizedSearch)
      )
    )
      return false;
    return true;
  });

  // --- UI ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            <Link href="/dashboard" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center px-2 py-1 text-xs sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Back to Dashboard</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Inbox className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  All Services Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  View and filter all port call services
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Tabs: All Services, Active Services */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setTab("all")}
            variant={tab === "all" ? "default" : "outline"}
            className="flex-1 flex items-center gap-2"
          >
            <ListChecks className="h-4 w-4" /> All Services
          </Button>
          <Button
            onClick={() => setTab("active")}
            variant={tab === "active" ? "default" : "outline"}
            className="flex-1 flex items-center gap-2"
          >
            <Inbox className="h-4 w-4" /> Active Services
          </Button>
        </div>
        {/* Filter/Search */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Input
            className="w-full sm:w-64"
            placeholder="Search by service/vessel/job"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-input rounded border-gray-300 p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="crew">Crew & Spares</option>
          </select>
        </div>
        {/* Table/List */}
        <Card className="professional-card mb-6">
          <CardHeader>
            <CardTitle>
              {tab === "all" ? "All Services" : "Active Services"}
            </CardTitle>
            <CardDescription>
              {tab === "all"
                ? "View and filter all port call services."
                : "View and search only active services."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">
                <CheckCircle2 className="mx-auto mb-3 w-8 h-8 text-muted-foreground" />
                No services found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((svc) => {
                  const isCrewOrSpare = CREW_SERVICES.some(
                    (serviceName) =>
                      svc.service_name.trim().toLowerCase() === serviceName
                  );
                  return (
                    <Card
                      key={svc.id}
                      className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border bg-muted/60"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-base truncate">
                            {svc.service_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Vessel: {svc.vessel_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Job: {svc.job_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Vendor: {svc.vendor_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {svc.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {svc.createdAt && svc.createdAt.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isCrewOrSpare && (
                          <Button
                            variant="outline"
                            size="icon"
                            title="View Details"
                            onClick={() => setViewDetails(svc)}
                            className="flex-shrink-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Crew/Vessel Details Dialog */}
      <Dialog open={!!viewDetails} onOpenChange={() => setViewDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Service Details: {viewDetails?.service_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Vessel Name:</span>{" "}
              {viewDetails?.vessel_name}
            </div>
            <div>
              <span className="font-semibold">Job ID:</span>{" "}
              {viewDetails?.job_id}
            </div>
            <div>
              <span className="font-semibold">Vendor:</span>{" "}
              {viewDetails?.vendor_name}
            </div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              {viewDetails?.status}
            </div>
            <div>
              <span className="font-semibold">Date:</span>{" "}
              {viewDetails?.createdAt?.slice(0, 10)}
            </div>
            {viewDetails?.crew_details && (
              <div>
                <span className="font-semibold">Crew Details:</span>
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                  {JSON.stringify(viewDetails.crew_details, null, 2)}
                </pre>
              </div>
            )}
            {viewDetails?.vessel_details && (
              <div>
                <span className="font-semibold">Vessel Details:</span>
                <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                  {JSON.stringify(viewDetails.vessel_details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
