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
  FileText,
  Eye,
  LogOut,
  Anchor,
  SquareSlash,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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
  assigned_pic: string;
  priority: "High" | "Medium" | "Low";
  created: string;
  updatedAt: string;
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
            return pc.priority === "High";
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
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

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
            {/* Tabs: Responsive row/scroll on mobile, row on desktop */}
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
                    {portCalls.filter((pc) => pc.priority === "High").length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
        {/* Port Calls List */}
        <div className="space-y-4">
          {filteredPortCalls.map((portCall) => {
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
                        <Badge className={getPriorityColor(portCall.priority)}>
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
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none min-w-[50px]"
                      >
                        <SquareSlash />
                      </Button> */}
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
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Port
                        </p>
                        <p className="font-medium">{portCall.port}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned PIC
                        </p>
                        <p className="font-medium">{portCall.assigned_pic}</p>
                      </div>
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
                          {new Date(portCall.eta).toLocaleString()}
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
                            {new Date(portCall.etd).toLocaleString()}
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
                          {new Date(portCall.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(portCall.created).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredPortCalls.length === 0 && !loading && (
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
    </div>
  );
}
