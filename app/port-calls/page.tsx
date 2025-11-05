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
  Ship,
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  LogOut,
  Anchor,
  SquareSlash,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Table2,
  LayoutGrid,
  Edit3,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import DatePicker from "@/components/ui/date-picker";
import TimePicker from "@/components/ui/TimePicker";

// Utility functions for date/time formatting -- USE UTC!
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

interface ServiceHeader {
  header_id: string;
  header_name: string;
  tasks: {
    status: boolean | string;
  }[];
}

interface PortCall {
  job_id: string;
  vessel_name: string;
  vessel_imo: string;
  client_company: string;
  eta: string;
  etd?: string;
  port: string;
  // assigned_pic: string;   // REMOVED
  priority: "High" | "Medium" | "Low" | "high" | "medium" | "low";
  created: string;
  updatedAt: string;
  call_type?: string;
  portkey?: string;
  draft?: string;
  tags?: string[];
  section_head: string;
  section_head_email: string;
  assigned_officer: string | null;
  assigned_officer_email: string | null;
}

export default function ActivePortCalls() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [filteredPortCalls, setFilteredPortCalls] = useState<PortCall[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [portFilter, setPortFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [portCallHeaders, setPortCallHeaders] = useState<
    Record<string, ServiceHeader[]>
  >({});
  const [headersLoading, setHeadersLoading] = useState<Record<string, boolean>>(
    {}
  );

  const [viewType, setViewType] = useState<"card" | "table">("card");

  // Edit ETA Dialog State
  const [editEtaDialogOpen, setEditEtaDialogOpen] = useState(false);
  const [editingPortCall, setEditingPortCall] = useState<PortCall | null>(null);
  const [editEtaDate, setEditEtaDate] = useState("");
  const [editEtaTime, setEditEtaTime] = useState("");
  const [editEtaLoading, setEditEtaLoading] = useState(false);

  useEffect(() => {
    const fetchPortCalls = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/portcall`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/");
          throw new Error("Session expired. Please login again.");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setPortCalls(data.data);
          setFilteredPortCalls(data.data);
        } else {
          console.error("Failed to fetch port calls:", data.message);
        }
      } catch (error) {
        console.error("Error fetching port calls:", error);
      } finally {
        setLoading(false);
      }
    };

    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    fetchPortCalls();
  }, [router]);

  useEffect(() => {
    const fetchHeadersForPortCalls = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      portCalls.forEach((pc) => {
        if (portCallHeaders[pc.job_id] || headersLoading[pc.job_id]) return;
        setHeadersLoading((prev) => ({ ...prev, [pc.job_id]: true }));
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/servicetask/headers?job_id=${pc.job_id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((res) => res.json())
          .then((data) => {
            let headers: ServiceHeader[] = [];
            if (Array.isArray(data.data)) headers = data.data;
            else if (data.data && typeof data.data === "object")
              headers = [data.data];
            setPortCallHeaders((prev) => ({
              ...prev,
              [pc.job_id]: headers,
            }));
          })
          .catch(() => {
            setPortCallHeaders((prev) => ({
              ...prev,
              [pc.job_id]: [],
            }));
          })
          .finally(() =>
            setHeadersLoading((prev) => ({ ...prev, [pc.job_id]: false }))
          );
      });
    };
    if (portCalls.length > 0) fetchHeadersForPortCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portCalls]);

  useEffect(() => {
    let filtered = portCalls;
    if (searchTerm) {
      filtered = filtered.filter(
        (pc) =>
          pc.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.client_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.vessel_imo.includes(searchTerm)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((pc) => {
        const headers = portCallHeaders[pc.job_id] || [];
        const status = getPortCallStatus(headers);
        return status.toLowerCase() === statusFilter;
      });
    }
    if (portFilter !== "all") {
      filtered = filtered.filter((pc) => pc.port.toLowerCase() === portFilter);
    }
    if (selectedTab !== "all") {
      filtered = filtered.filter((pc) => {
        const headers = portCallHeaders[pc.job_id] || [];
        const status = getPortCallStatus(headers);
        switch (selectedTab) {
          case "active":
            return status === "Pending";
          case "completed":
            return status === "Completed";
          case "urgent":
            return pc.priority === "High" || pc.priority === "high";
          default:
            return true;
        }
      });
    }
    setFilteredPortCalls(filtered);
  }, [
    searchTerm,
    statusFilter,
    portFilter,
    selectedTab,
    portCalls,
    portCallHeaders,
  ]);

  const getPortCallStatus = (
    headers: ServiceHeader[]
  ): "Pending" | "Completed" => {
    if (
      Array.isArray(headers) &&
      headers.length > 0 &&
      headers.every(
        (header) =>
          Array.isArray(header.tasks) &&
          header.tasks.length > 0 &&
          header.tasks.every(
            (task) => task.status === true || task.status === "true"
          )
      )
    ) {
      return "Completed";
    }
    return "Pending";
  };

  const getHeaderStats = (headers: ServiceHeader[]) => {
    const totalHeaders = headers.length;
    const completedHeaders = headers.filter(
      (header) =>
        Array.isArray(header.tasks) &&
        header.tasks.length > 0 &&
        header.tasks.every(
          (task) => task.status === true || task.status === "true"
        )
    ).length;
    return { totalHeaders, completedHeaders };
  };

  const getHeaderProgress = (headers: ServiceHeader[]) => {
    const { totalHeaders, completedHeaders } = getHeaderStats(headers);
    const progress =
      totalHeaders > 0
        ? Math.round((completedHeaders / totalHeaders) * 100)
        : 0;
    return { progress, totalHeaders, completedHeaders };
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium":
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // --- SORT BY RECENTLY UPDATED ---
  const sortedPortCalls = [...filteredPortCalls].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // -------------------- TABLE VIEW COMPONENT ------------------------
  const TableView = () => (
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900 border">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-50 dark:bg-gray-800">
          <tr>
            <th className="px-2 py-3 text-left font-semibold">Status</th>
            <th className="px-2 py-3 text-left font-semibold">Job ID</th>
            <th className="px-2 py-3 text-left font-semibold">ETA</th>
            <th className="px-2 py-3 text-left font-semibold">Port</th>
            <th className="px-2 py-3 text-left font-semibold">Priority</th>
            <th className="px-2 py-3 text-left font-semibold">Client</th>
            <th className="px-2 py-3 text-left font-semibold">Section Head</th>
            <th className="px-2 py-3 text-left font-semibold">
              Assigned Officer
            </th>
            <th className="px-2 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedPortCalls.map((portCall) => {
            const headers = portCallHeaders[portCall.job_id] || [];
            const status = getPortCallStatus(headers);

            return (
              <tr
                key={portCall.job_id}
                className="border-b dark:border-gray-700"
              >
                {/* Status */}
                <td className="px-2 py-2">
                  <span
                    className={
                      "inline-block w-3 h-3 rounded-full mr-2 align-middle " +
                      (status === "Completed"
                        ? "bg-green-500"
                        : status === "Pending"
                        ? "bg-yellow-500"
                        : "bg-gray-400")
                    }
                  ></span>
                  <span className="align-middle">{status}</span>
                </td>
                {/* Job ID and Vessel Name */}
                <td className="px-2 py-2">
                  <span className="font-bold">{portCall.job_id}</span>
                  <br />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {portCall.vessel_name}
                  </span>
                </td>
                {/* ETA */}
                <td className="px-2 py-2">
                  {formatDate(portCall.eta)} {formatTime(portCall.eta)}
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2 p-1 h-8 w-8"
                    title="Edit ETA"
                    onClick={() => {
                      setEditingPortCall(portCall);
                      // Set default values to current ETA (DB time!)
                      const etaDateObj = new Date(portCall.eta);
                      setEditEtaDate(etaDateObj.toISOString().slice(0, 10));
                      const hours = etaDateObj
                        .getUTCHours()
                        .toString()
                        .padStart(2, "0");
                      const minutes = etaDateObj
                        .getUTCMinutes()
                        .toString()
                        .padStart(2, "0");
                      setEditEtaTime(`${hours}:${minutes}`);
                      setEditEtaDialogOpen(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </td>
                {/* Port */}
                <td className="px-2 py-2">{portCall.port}</td>
                {/* Priority */}
                <td className="px-2 py-2">
                  <Badge className={getPriorityColor(portCall.priority)}>
                    {portCall.priority}
                  </Badge>
                </td>
                {/* Client */}
                <td className="px-2 py-2">{portCall.client_company}</td>
                {/* Section Head */}
                <td className="px-2 py-2">
                  <span>{portCall.section_head}</span>
                  <br />
                  <span className="text-xs text-gray-500">
                    {portCall.section_head_email}
                  </span>
                </td>
                {/* Assigned Officer */}
                <td className="px-2 py-2">
                  {portCall.assigned_officer ? (
                    <>
                      <div className="font-medium">
                        {portCall.assigned_officer}
                      </div>
                      <div className="text-xs text-gray-500">
                        {portCall.assigned_officer_email || ""}
                      </div>
                    </>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                    >
                      Awaiting Assignment
                    </Badge>
                  )}
                </td>

                {/* Action */}
                <td className="px-2 py-2">
                  <div className="flex gap-2">
                    <Link href={`/pcs/${portCall.job_id}/services`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="p-1 h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
          {sortedPortCalls.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-8">
                <Ship className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No port calls found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter !== "all" || portFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No active port calls at the moment"}
                </p>
                <Link href="/port-calls/new">
                  <Button className="w-full sm:w-auto">
                    <Ship className="h-4 w-4 mr-2" />
                    Create New Port Call
                  </Button>
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
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

  // -------------------- MAIN RENDER ------------------------
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
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Active Port Calls
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Vessel Operations
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
              <span>Port Call Management</span>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className="w-full sm:w-auto text-center"
                >
                  {filteredPortCalls.length} calls
                </Badge>
                <Link href="/port-calls/new" className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto">
                    <Ship className="h-4 w-4 mr-2" />
                    New Port Call
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
                    placeholder="Search by vessel name, job number, client, or IMO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={portFilter} onValueChange={setPortFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Port" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ports</SelectItem>
                    <SelectItem value="colombo">Colombo</SelectItem>
                    <SelectItem value="gall">Gall</SelectItem>
                    <SelectItem value="hambantota">Hambantota</SelectItem>
                    <SelectItem value="trincomalee">Trincomalee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* View Toggle Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
              <div className="flex gap-2 mb-2 sm:mb-0">
                <Button
                  variant={viewType === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewType("table")}
                  className="flex items-center gap-2"
                >
                  <Table2 className="h-4 w-4" />
                  Table View
                </Button>
                <Button
                  variant={viewType === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewType("card")}
                  className="flex items-center gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Card View
                </Button>
              </div>
              {/* Tabs */}
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
                    All ({portCalls.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Active (
                    {
                      portCalls.filter((pc) => {
                        const headers = portCallHeaders[pc.job_id] || [];
                        return getPortCallStatus(headers) === "Pending";
                      }).length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Completed (
                    {
                      portCalls.filter((pc) => {
                        const headers = portCallHeaders[pc.job_id] || [];
                        return getPortCallStatus(headers) === "Completed";
                      }).length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger
                    value="urgent"
                    className="flex-1 min-w-[120px] text-center px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition sm:min-w-[150px] sm:flex-none"
                  >
                    Urgent (
                    {
                      portCalls.filter(
                        (pc) => pc.priority === "High" || pc.priority === "high"
                      ).length
                    }
                    )
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        {/* Port Calls List */}
        <div className="space-y-4">
          {viewType === "table" ? (
            <TableView />
          ) : (
            sortedPortCalls.map((portCall) => {
              const headers = portCallHeaders[portCall.job_id] || [];
              const headersAreLoading = headersLoading[portCall.job_id];
              const { progress, totalHeaders, completedHeaders } =
                getHeaderProgress(headers);
              const remainingHeaders = totalHeaders - completedHeaders;
              let completionPhrase = "";
              if (remainingHeaders === 0 && totalHeaders > 0) {
                completionPhrase =
                  "All headers completed. This port call is marked as completed!";
              } else if (remainingHeaders > 0) {
                completionPhrase = `${remainingHeaders} more header${
                  remainingHeaders > 1 ? "s" : ""
                } to be completed.`;
              } else {
                completionPhrase = "No headers found.";
              }
              const status = getPortCallStatus(headers);
              return (
                <Card
                  key={portCall.job_id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg truncate">
                              {portCall.vessel_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {portCall.job_id}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          <Badge
                            className={getPriorityColor(portCall.priority)}
                          >
                            {portCall.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-row flex-wrap gap-2 mt-2 sm:mt-0">
                        <Link href={`/pcs/${portCall.job_id}/services`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 flex-1 sm:flex-none min-w-[90px]"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="text-xs sm:text-sm">Services</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit ETA"
                          onClick={() => {
                            setEditingPortCall(portCall);
                            const etaDateObj = new Date(portCall.eta);
                            setEditEtaDate(
                              etaDateObj.toISOString().slice(0, 10)
                            );
                            const hours = etaDateObj
                              .getUTCHours()
                              .toString()
                              .padStart(2, "0");
                            const minutes = etaDateObj
                              .getUTCMinutes()
                              .toString()
                              .padStart(2, "0");
                            setEditEtaTime(`${hours}:${minutes}`);
                            setEditEtaDialogOpen(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Client
                        </p>
                        <p className="font-medium">{portCall.client_company}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          IMO
                        </p>
                        <p className="font-medium">{portCall.vessel_imo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Section Head
                        </p>
                        <div className="font-medium">
                          {portCall.section_head}
                        </div>
                        <div className="text-xs text-gray-500">
                          {portCall.section_head_email}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned Officer
                        </p>

                        {portCall.assigned_officer ? (
                          <>
                            <div className="font-medium">
                              {portCall.assigned_officer}
                            </div>
                            {portCall.assigned_officer_email && (
                              <div className="text-xs text-gray-500">
                                {portCall.assigned_officer_email}
                              </div>
                            )}
                          </>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                          >
                            Awaiting Assignment
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ETA
                          </p>
                          <p className="font-medium">
                            {formatDate(portCall.eta)}{" "}
                            <span className="text-xs text-gray-400">
                              {formatTime(portCall.eta)}
                            </span>
                          </p>
                        </div>
                      </div>
                      {portCall.etd && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ETD
                            </p>
                            <p className="font-medium">
                              {formatDate(portCall.etd)}{" "}
                              <span className="text-xs text-gray-400">
                                {formatTime(portCall.etd)}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last Updated
                          </p>
                          <p className="font-medium">
                            {formatDate(portCall.updatedAt)}{" "}
                            <span className="text-xs text-gray-400">
                              {formatTime(portCall.updatedAt)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Created: {formatDate(portCall.created)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          {sortedPortCalls.length === 0 && !loading && viewType === "card" && (
            <Card>
              <CardContent className="text-center py-12">
                <Ship className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No port calls found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm || statusFilter !== "all" || portFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No active port calls at the moment"}
                </p>
                <Link href="/port-calls/new">
                  <Button className="w-full sm:w-auto">
                    <Ship className="h-4 w-4 mr-2" />
                    Create New Port Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit ETA Dialog */}
      <Dialog open={editEtaDialogOpen} onOpenChange={setEditEtaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit ETA</DialogTitle>
            <DialogDescription>
              Update ETA for <b>{editingPortCall?.vessel_name}</b> (
              {editingPortCall?.job_id})
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!editingPortCall || !editEtaDate || !editEtaTime) return;
              setEditEtaLoading(true);
              try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");
                // Build ISO string
                // editEtaDate: "YYYY-MM-DD", editEtaTime: "HH:MM"
                const isoEta = new Date(
                  `${editEtaDate}T${editEtaTime}:00Z`
                ).toISOString();
                const response = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/portcall/${editingPortCall.job_id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ eta: isoEta }),
                  }
                );
                const data = await response.json();
                if (response.ok || data.success) {
                  // Update portCalls state
                  setPortCalls((prev) =>
                    prev.map((pc) =>
                      pc.job_id === editingPortCall.job_id
                        ? { ...pc, eta: isoEta }
                        : pc
                    )
                  );
                  setFilteredPortCalls((prev) =>
                    prev.map((pc) =>
                      pc.job_id === editingPortCall.job_id
                        ? { ...pc, eta: isoEta }
                        : pc
                    )
                  );
                  setEditEtaDialogOpen(false);
                  setEditingPortCall(null);
                } else {
                  alert(data.message || "Failed to update ETA");
                }
              } catch (err) {
                alert("Failed to update ETA.");
              } finally {
                setEditEtaLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <DatePicker
                value={editEtaDate}
                onChange={setEditEtaDate}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <TimePicker
                value={editEtaTime}
                onChange={setEditEtaTime}
                placeholder="HH:MM"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditEtaDialogOpen(false)}
                disabled={editEtaLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editEtaLoading || !editEtaDate || !editEtaTime}
              >
                {editEtaLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update ETA"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
