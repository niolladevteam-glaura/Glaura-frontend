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
  MoreHorizontal,
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

interface PortCall {
  job_id: string;
  vessel_name: string;
  vessel_imo: string;
  client_company: string;
  eta: string;
  etd?: string;
  port: string;
  status: "Pending" | "Completed";
  assigned_pic: string;
  priority: "High" | "Medium" | "Low";
  created: string;
  updatedAt: string;
  services: any[];
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

  useEffect(() => {
    const fetchPortCalls = async () => {
      try {
        setLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/portcall`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle 401 Unauthorized
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/");
          throw new Error("Session expired. Please login again.");
        }

        const data = await response.json();

        console.log(data);

        if (data.success && data.data) {
          const mappedPortCalls = data.data.map((pc: any) => ({
            job_id: pc.job_id,
            vessel_name: pc.vessel_name,
            vessel_imo: pc.vessel_imo,
            client_company: pc.client_company,
            eta: pc.eta,
            etd: pc.etd || undefined,
            port: pc.port,
            status: mapStatus(pc.status, pc.services || []), // <-- modified line
            assigned_pic: pc.assigned_pic || "Not assigned",
            priority: pc.priority || "Medium",
            created: pc.created,
            updatedAt: pc.updatedAt,
            services: pc.services || [],
          }));

          setPortCalls(mappedPortCalls);
          setFilteredPortCalls(mappedPortCalls);
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

    const user = JSON.parse(userData);
    setCurrentUser(user);
    fetchPortCalls();
  }, [router]);

  // Helper function to map API status and check if all services are completed
  const mapStatus = (status: string, services: any[]): PortCall["status"] => {
    // If there are services and all are completed, return Completed
    if (
      Array.isArray(services) &&
      services.length > 0 &&
      services.every(
        (s) =>
          s.status === false ||
          s.status === "Completed" ||
          s.status === "completed"
      )
    ) {
      return "Completed";
    }

    switch (status.toLowerCase()) {
      case "open":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  useEffect(() => {
    let filtered = portCalls;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (pc) =>
          pc.vessel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.job_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.client_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pc.vessel_imo.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (pc) => pc.status.toLowerCase() === statusFilter
      );
    }

    // Apply port filter
    if (portFilter !== "all") {
      filtered = filtered.filter((pc) => pc.port.toLowerCase() === portFilter);
    }

    // Apply tab filter
    if (selectedTab !== "all") {
      switch (selectedTab) {
        case "active":
          filtered = filtered.filter((pc) => pc.status === "Pending");
          break;
        case "completed":
          filtered = filtered.filter((pc) => pc.status === "Completed");
          break;
        case "urgent":
          filtered = filtered.filter((pc) => pc.priority === "High");
          break;
      }
    }

    setFilteredPortCalls(filtered);
  }, [searchTerm, statusFilter, portFilter, selectedTab, portCalls]);

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

  // Calculate service stats
  const getServiceStats = (services: any[]) => {
    const totalServices = services.length;
    const completedServices = services.filter(
      (s) =>
        s.status === false ||
        s.status === "Completed" ||
        s.status === "completed"
    ).length;
    const progress =
      totalServices > 0
        ? Math.round((completedServices / totalServices) * 100)
        : 0;

    return { totalServices, completedServices, progress };
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
                  {portCalls.filter((pc) => pc.status === "Pending").length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed (
                  {portCalls.filter((pc) => pc.status === "Completed").length})
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
            const { totalServices, completedServices, progress } =
              getServiceStats(portCall.services);

            return (
              <Card
                key={portCall.job_id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(portCall.status)}
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
                        <Badge className={getStatusColor(portCall.status)}>
                          {portCall.status}
                        </Badge>
                        <Badge className={getPriorityColor(portCall.priority)}>
                          {portCall.priority}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link href={`/pcs/${portCall.job_id}`}>
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

                  {/* Services Progress */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Services: {completedServices}/{totalServices}
                        </span>
                      </div>
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {progress}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
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
