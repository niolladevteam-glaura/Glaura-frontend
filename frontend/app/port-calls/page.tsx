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

  // Store headers for each port call by job_id
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

  // Fetch headers for each port call
  useEffect(() => {
    const fetchHeadersForPortCalls = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      // Only fetch if we haven't already
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
            // `data.data` can be array or object, normalize to array
            let headers: ServiceHeader[] = [];
            if (Array.isArray(data.data)) headers = data.data;
            else if (data.data && typeof data.data === "object")
              headers = [data.data];
            setPortCallHeaders((prev) => ({
              ...prev,
              [pc.job_id]: headers,
            }));
          })
          .catch((err) => {
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

  // Filtering (same as before)
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

  // Helper: Mark port call as completed only if ALL service headers are completed
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
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Active Port Calls
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage vessel operations
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Port Call Management</span>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {filteredPortCalls.length} calls
                </Badge>
                <Link href="/port-calls/new">
                  <Button size="sm">
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
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
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
                  <SelectTrigger className="w-40">
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

            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All ({portCalls.length})</TabsTrigger>
                <TabsTrigger value="active">
                  Active (
                  {
                    portCalls.filter((pc) => {
                      const headers = portCallHeaders[pc.job_id] || [];
                      return getPortCallStatus(headers) === "Pending";
                    }).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed (
                  {
                    portCalls.filter((pc) => {
                      const headers = portCallHeaders[pc.job_id] || [];
                      return getPortCallStatus(headers) === "Completed";
                    }).length
                  }
                  )
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  Urgent (
                  {portCalls.filter((pc) => pc.priority === "High").length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {portCall.vessel_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {portCall.job_id}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                        <Badge className={getPriorityColor(portCall.priority)}>
                          {portCall.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/pcs/${portCall.job_id}/services`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Services
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <SquareSlash />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

                  {/* Service Headers Progress Bar */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* <div className="flex items-center gap-2 font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span>
                        {headersAreLoading
                          ? "Loading..."
                          : `${completedHeaders}/${totalHeaders} headers completed`}
                      </span>
                    </div> */}
                    {/* Progress Bar */}
                    {/* <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-4 mb-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {headersAreLoading
                        ? "Loading header data..."
                        : completionPhrase}
                    </div> */}
                    {/* Service Headers List */}
                    {/* <div className="space-y-2">
                      {headersAreLoading ? (
                        <div className="text-gray-500 dark:text-gray-400">
                          Loading headers...
                        </div>
                      ) : (
                        headers.map((header, idx) => {
                          const isHeaderCompleted =
                            Array.isArray(header.tasks) &&
                            header.tasks.length > 0 &&
                            header.tasks.every(
                              (task) =>
                                task.status === true || task.status === "true"
                            );
                          return (
                            <div
                              key={header.header_id || idx}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded px-3 py-2"
                            >
                              <span className="font-medium">
                                {header.header_name || `Header ${idx + 1}`}
                              </span>
                              <Badge
                                variant={
                                  isHeaderCompleted ? "default" : "secondary"
                                }
                                className={
                                  isHeaderCompleted
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : ""
                                }
                              >
                                {isHeaderCompleted ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          );
                        })
                      )}
                    </div> */}
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
                  <Button>
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
