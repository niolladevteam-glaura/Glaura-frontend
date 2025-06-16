"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Ship,
  Users,
  FileText,
  BarChart3,
  Plus,
  Calendar,
  Activity,
  LogOut,
  MessageSquare,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface User {
  id: number;
  name: string;
  role: string;
  accessLevel: string;
  department: string;
}

interface PortCall {
  id: string;
  jobNumber: string;
  vesselName: string;
  imo: string;
  client: string;
  eta: string;
  port: string;
  status: string;
  services: number;
  assignedPIC: string;
}

interface BirthdayAlert {
  name: string;
  company: string;
  date: string;
  daysUntil: number;
}

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePortCalls, setActivePortCalls] = useState<PortCall[]>([]);
  const [birthdayAlerts, setBirthdayAlerts] = useState<BirthdayAlert[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Mock data based on user access level
    const mockPortCalls: PortCall[] = [
      {
        id: "1",
        jobNumber: "GLPC-2024-001",
        vesselName: "MSC Oscar",
        imo: "9876543",
        client: "Mediterranean Shipping",
        eta: "2024-01-15T14:30",
        port: "Colombo",
        status: "In Progress",
        services: 8,
        assignedPIC: "Sandalu Nawarathne",
      },
      {
        id: "2",
        jobNumber: "GLPC-2024-002",
        vesselName: "Maersk Gibraltar",
        imo: "9654321",
        client: "Maersk Line",
        eta: "2024-01-16T09:15",
        port: "Galle",
        status: "Pending",
        services: 12,
        assignedPIC: "Supun Rathnayaka",
      },
      {
        id: "3",
        jobNumber: "GLPC-2024-003",
        vesselName: "COSCO Shipping",
        imo: "9543210",
        client: "COSCO Shipping Lines",
        eta: "2024-01-17T16:45",
        port: "Hambantota",
        status: "Completed",
        services: 6,
        assignedPIC: "Chamod Asiridu",
      },
    ];

    const mockBirthdays: BirthdayAlert[] = [
      {
        name: "John Smith",
        company: "Mediterranean Shipping",
        date: "Jan 18",
        daysUntil: 3,
      },
      {
        name: "Sarah Johnson",
        company: "Maersk Line",
        date: "Jan 25",
        daysUntil: 10,
      },
      {
        name: "Mike Chen",
        company: "COSCO Shipping",
        date: "Jan 22",
        daysUntil: 7,
      },
    ];

    // Filter data based on user access level
    if (user.accessLevel === "F") {
      // Bunkering - only bunker services
      setActivePortCalls(mockPortCalls.filter((pc) => pc.services > 0));
    } else if (user.accessLevel === "G") {
      // Spare Clearance
      setActivePortCalls(mockPortCalls.filter((pc) => pc.services > 0));
    } else if (user.accessLevel === "I") {
      // Galle Operations
      setActivePortCalls(
        mockPortCalls.filter(
          (pc) => pc.port === "Galle" || pc.port === "Hambantota"
        )
      );
    } else {
      setActivePortCalls(mockPortCalls);
    }

    setBirthdayAlerts(mockBirthdays);
  }, [router]);

  // Chart data
  const vesselVolumeData = [
    { port: "Colombo", vessels: 45, month: "Jan" },
    { port: "Galle", vessels: 23, month: "Jan" },
    { port: "Hambantota", vessels: 18, month: "Jan" },
    { port: "Trincomalee", vessels: 12, month: "Jan" },
  ];

  const growthTrendData = [
    { month: "Sep", vessels: 78, revenue: 2.4 },
    { month: "Oct", vessels: 85, revenue: 2.8 },
    { month: "Nov", vessels: 92, revenue: 3.1 },
    { month: "Dec", vessels: 98, revenue: 3.4 },
    { month: "Jan", vessels: 105, revenue: 3.7 },
  ];

  const comparativeData = [
    { month: "Sep", colombo: 35, galle: 18, hambantota: 15, trincomalee: 10 },
    { month: "Oct", colombo: 38, galle: 20, hambantota: 16, trincomalee: 11 },
    { month: "Nov", colombo: 42, galle: 22, hambantota: 17, trincomalee: 11 },
    { month: "Dec", colombo: 45, galle: 23, hambantota: 18, trincomalee: 12 },
    { month: "Jan", colombo: 48, galle: 25, hambantota: 20, trincomalee: 12 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const canCreatePortCall = () => {
    return (
      currentUser &&
      ![
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
      ].includes(currentUser.accessLevel)
    );
  };

  const canViewReports = () => {
    return (
      currentUser &&
      ![
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
      ].includes(currentUser.accessLevel)
    );
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  GLAURA
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The Aura of Excellence in Port Services
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              Access Level: {currentUser.accessLevel}
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentUser.role}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen dark:bg-gray-800 dark:border-gray-700">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-900 dark:text-blue-300"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {canCreatePortCall() && (
              <Link
                href="/port-calls/new"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Plus className="h-5 w-5" />
                <span>New Port Call</span>
              </Link>
            )}

            <Link
              href="/port-calls"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Ship className="h-5 w-5" />
              <span>Active Port Calls</span>
            </Link>

            <Link
              href="/customers"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Users className="h-5 w-5" />
              <span>Customer Companies</span>
            </Link>

            <Link
              href="/vendors"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Users className="h-5 w-5" />
              <span>Vendor Management</span>
            </Link>

            <Link
              href="/documents"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FileText className="h-5 w-5" />
              <span>Documents</span>
            </Link>

            {canViewReports() && (
              <Link
                href="/reports"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Reports</span>
              </Link>
            )}

            {currentUser.accessLevel === "A" && (
              <Link
                href="/users"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </Link>
            )}

            <Link
              href="/messages"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <FileText className="h-5 w-5" />
              <span>Messages</span>
            </Link>

            <Link
              href="/feedback"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Feedback & Complaints</span>
            </Link>

            <Link
              href="/vessels"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Ship className="h-5 w-5" />
              <span>Vessel Management</span>
            </Link>

            <Link
              href="/whatsapp"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp</span>
            </Link>

            <Link
              href="/phonebook"
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Phone className="h-5 w-5" />
              <span>Phone Book</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {currentUser.name}
            </p>
          </div>

          {/* Enhanced Stats Cards with Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-100">
                  Active Port Calls
                </CardTitle>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-gray-100">
                  {
                    activePortCalls.filter((pc) => pc.status !== "Completed")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 from yesterday
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-100">
                  Pending Services
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-gray-100">
                  {activePortCalls.reduce(
                    (sum, pc) =>
                      sum + (pc.status !== "Completed" ? pc.services : 0),
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all active calls
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-100">
                  Birthday Alerts
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-gray-100">
                  {birthdayAlerts.filter((b) => b.daysUntil <= 7).length}
                </div>
                <p className="text-xs text-muted-foreground">Next 7 days</p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-100">
                  Department
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold dark:text-gray-100">
                  {currentUser.department}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your assigned department
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">
                  Recent Port Calls
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Latest vessel operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePortCalls.slice(0, 3).map((portCall) => (
                    <div
                      key={portCall.id}
                      className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium dark:text-gray-100">
                          {portCall.vesselName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {portCall.client}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {portCall.port}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            portCall.status === "Completed"
                              ? "default"
                              : portCall.status === "In Progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {portCall.status}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {portCall.services} services
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">
                  Birthday Alerts
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Upcoming PIC birthdays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {birthdayAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium dark:text-gray-100">
                          {alert.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {alert.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            alert.daysUntil <= 3 ? "destructive" : "secondary"
                          }
                        >
                          {alert.daysUntil} days
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {alert.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Vessel Volume per Port Chart */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">
                  Vessel Volume by Port
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Current month vessel traffic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vessels: {
                      label: "Vessels",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vesselVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="port" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="vessels" fill="var(--color-vessels)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Growth Trends Chart */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">
                  Monthly Growth Trends
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Vessel count and revenue trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vessels: {
                      label: "Vessels",
                      color: "hsl(var(--chart-1))",
                    },
                    revenue: {
                      label: "Revenue (M USD)",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="vessels"
                        stroke="var(--color-vessels)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Comparative Performance Chart */}
          <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">
                Comparative Port Performance
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Port-wise vessel volume comparison over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  colombo: {
                    label: "Colombo",
                    color: "hsl(var(--chart-1))",
                  },
                  galle: {
                    label: "Galle",
                    color: "hsl(var(--chart-2))",
                  },
                  hambantota: {
                    label: "Hambantota",
                    color: "hsl(var(--chart-3))",
                  },
                  trincomalee: {
                    label: "Trincomalee",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={comparativeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="colombo"
                      stroke="var(--color-colombo)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="galle"
                      stroke="var(--color-galle)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="hambantota"
                      stroke="var(--color-hambantota)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="trincomalee"
                      stroke="var(--color-trincomalee)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
