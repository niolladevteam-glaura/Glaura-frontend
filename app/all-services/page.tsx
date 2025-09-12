"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Loader2,
  Inbox,
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Search,
  Building2,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// Date helpers (DD.MM.YYYY and 24hr time)
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
function formatTime(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

interface Service {
  job_id: string;
  serviceName: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
}

function getServiceCategory(serviceName: string): "crew" | "spares" | "other" {
  // Crew Changes
  if (serviceName === "Crew Changes (On/Off)") {
    return "crew";
  }
  // Spares: match any of these
  const sparesNames = [
    "Ship Spares Clearance and Delivery",
    "Ship Spares Off-Landing and Re-Forwarding",
    "Ship Spares Off-Landing and Connect to another Vessel",
  ];
  if (sparesNames.includes(serviceName)) {
    return "spares";
  }
  return "other";
}

export default function ActiveServicesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch user and services
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));

    async function fetchServices() {
      setLoading(true);
      const token = localStorage.getItem("token");
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/portcall/active-services`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (resp.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/");
          throw new Error("Session expired. Please login again.");
        }
        const json = await resp.json();
        const list: Service[] = json?.data?.serviceData || [];
        setServices(list);
        setFilteredServices(list);
      } catch (err) {
        setServices([]);
        setFilteredServices([]);
      }
      setLoading(false);
    }
    fetchServices();
  }, [router]);

  // Unique vendor names for filter
  const vendorOptions = Array.from(
    new Set(services.map((svc) => svc.vendor))
  ).filter(Boolean);

  // Filter/search logic
  useEffect(() => {
    let filtered = services;
    if (searchTerm) {
      filtered = filtered.filter(
        (svc) =>
          svc.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          svc.job_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (vendorFilter !== "all") {
      filtered = filtered.filter((svc) => svc.vendor === vendorFilter);
    }
    // Tab logic:
    if (selectedTab === "crew") {
      filtered = filtered.filter(
        (svc) => getServiceCategory(svc.serviceName) === "crew"
      );
    } else if (selectedTab === "spares") {
      filtered = filtered.filter(
        (svc) => getServiceCategory(svc.serviceName) === "spares"
      );
    } else if (selectedTab === "recent") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((svc) => new Date(svc.createdAt) > weekAgo);
    }
    // "all" tab shows everything
    setFilteredServices(filtered);
  }, [searchTerm, vendorFilter, selectedTab, services]);

  // Counts for tabs
  const crewCount = services.filter(
    (svc) => getServiceCategory(svc.serviceName) === "crew"
  ).length;
  const sparesCount = services.filter(
    (svc) => getServiceCategory(svc.serviceName) === "spares"
  ).length;
  const recentCount = services.filter((svc) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(svc.createdAt) > weekAgo;
  }).length;

  // Sort by updatedAt (desc)
  const sortedServices = [...filteredServices].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Back Button */}
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

            {/* Page Title & Icon */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Inbox className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Active Services
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  View & manage all service tasks
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Service Management</span>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className="w-full sm:w-auto text-center"
                >
                  {sortedServices.length} services
                </Badge>
                <Link href="/port-calls/new" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    New Service
                  </Button>
                </Link>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by service name or job id..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {vendorOptions.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs: match Active Port Calls styling */}
            <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="w-full"
              >
                <TabsList className="w-full flex flex-nowrap overflow-x-auto no-scrollbar bg-muted rounded-lg p-1 sm:overflow-x-visible sm:justify-start sm:gap-0">
                  <TabsTrigger
                    value="all"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    All ({services.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="crew"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Crew Changes ({crewCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="spares"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Spares ({sparesCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Recent ({recentCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="space-y-4">
          {sortedServices.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Inbox className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No active services found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || vendorFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "There are currently no active services."}
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedServices.map((svc) => (
              <Card
                key={`${svc.job_id}-${svc.serviceName}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {svc.serviceName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {svc.job_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {"Vendor: " + svc.vendor || "—"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created
                        </p>
                        <p className="font-medium">
                          {formatDateTime(svc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last Updated
                        </p>
                        <p className="font-medium">
                          {formatDateTime(svc.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
