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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Menu,
  TrendingUp,
  Anchor,
  Bell,
  Search,
  Camera,
  ArrowRight,
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

interface UserType {
  id: number;
  name: string;
  role: string;
  accessLevel: string;
  department: string;
  avatar?: string;
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

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: string;
  delay?: number;
}) => (
  <Card
    className="stats-card animate-fade-in-up"
    style={{ animationDelay: `${delay}s` }}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend && <span className="text-green-600">{trend}</span>} {subtitle}
      </p>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activePortCalls, setActivePortCalls] = useState<PortCall[]>([]);
  const [birthdayAlerts, setBirthdayAlerts] = useState<BirthdayAlert[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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
    ];

    // Filter data based on user access level
    if (user.accessLevel === "F") {
      setActivePortCalls(mockPortCalls.filter((pc) => pc.services > 0));
    } else if (user.accessLevel === "G") {
      setActivePortCalls(mockPortCalls.filter((pc) => pc.services > 0));
    } else if (user.accessLevel === "I") {
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
    { port: "Colombo", vessels: 45 },
    { port: "Galle", vessels: 23 },
    { port: "Hambantota", vessels: 18 },
    { port: "Trincomalee", vessels: 12 },
  ];

  const growthTrendData = [
    { month: "Sep", vessels: 78, revenue: 2.4 },
    { month: "Oct", vessels: 85, revenue: 2.8 },
    { month: "Nov", vessels: 92, revenue: 3.1 },
    { month: "Dec", vessels: 98, revenue: 3.4 },
    { month: "Jan", vessels: 105, revenue: 3.7 },
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

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

  const navigationItems = [
    { href: "/dashboard", icon: BarChart3, label: "Dashboard", active: true },
    ...(canCreatePortCall()
      ? [{ href: "/port-calls/new", icon: Plus, label: "New Port Call" }]
      : []),
    { href: "/port-calls", icon: Ship, label: "Active Port Calls" },
    { href: "/customers", icon: Users, label: "Customer Companies" },
    { href: "/vendors", icon: Users, label: "Vendor Management" },
    { href: "/documents", icon: FileText, label: "Documents" },
    ...(canViewReports()
      ? [{ href: "/reports", icon: BarChart3, label: "Reports" }]
      : []),
    ...(currentUser.accessLevel === "A"
      ? [{ href: "/users", icon: Users, label: "User Management" }]
      : []),
    { href: "/messages", icon: FileText, label: "Messages" },
    { href: "/feedback", icon: MessageSquare, label: "Feedback & Complaints" },
    { href: "/vessels", icon: Ship, label: "Vessel Management" },
    { href: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
    { href: "/phonebook", icon: Phone, label: "Phone Book" },
  ];

  const WelcomeCard = ({ user }: { user: UserType }) => (
    <Card className="welcome-card animate-fade-in-up mb-8">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Access Level: {currentUser.accessLevel}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-white/90 text-lg mb-6 max-w-2xl">
              The Aura of Excellence in Port Services
            </p>
            <div className="flex gap-4">
              <Link href="/port-calls">
                <Button
                  variant="secondary"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  <Ship /> Port Calls
                </Button>
              </Link>
              <Link href="/customers">
                <Button
                  variant="outline"
                  className="bg-black/20 border-white/30 text-white hover:bg-white/10"
                >
                  <Users />
                  Customers
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
              <Anchor className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Enhanced Mobile Header */}
      <header className="lg:hidden glass-effect border-b px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <nav className="space-y-2 pt-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-item ${item.active ? "active" : ""}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">GLAURA</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Enhanced Desktop Header */}
      <header className="hidden lg:flex glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-3 rounded-2xl">
                <Anchor className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">GLAURA</h1>
                <p className="text-sm text-muted-foreground">
                  The Aura of Excellence in Port Service{" "}
                </p>
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vessels, clients, or documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            <ThemeToggle />
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="text-right">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
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
        {/* Enhanced Desktop Sidebar */}
        <aside className="hidden lg:block w-72 border-r bg-background min-h-screen sticky top-[73px] overflow-y-auto">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item animate-fade-in-left ${
                  item.active ? "active" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Enhanced Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Welcome Card */}
          <WelcomeCard user={currentUser} />

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Port Calls"
              value={
                activePortCalls.filter((pc) => pc.status !== "Completed").length
              }
              subtitle="from yesterday"
              trend="+2"
              icon={Ship}
              delay={0}
            />
            <StatCard
              title="Pending Services"
              value={activePortCalls.reduce(
                (sum, pc) =>
                  sum + (pc.status !== "Completed" ? pc.services : 0),
                0
              )}
              subtitle="across all calls"
              icon={Activity}
              delay={0.1}
            />
            <StatCard
              title="Birthday Alerts"
              value={birthdayAlerts.filter((b) => b.daysUntil <= 7).length}
              subtitle="next 7 days"
              icon={Calendar}
              delay={0.2}
            />
            <StatCard
              title="Department"
              value={currentUser.department}
              subtitle="your assignment"
              icon={Users}
              delay={0.3}
            />
          </div>

          {/* Recent Apps Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Activities</h2>
              <Button variant="ghost" className="text-primary">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePortCalls.slice(0, 3).map((portCall, index) => (
                <Card
                  key={portCall.id}
                  className="professional-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Ship className="h-5 w-5 text-primary" />
                      </div>
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-1">
                      {portCall.vesselName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {portCall.client}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{portCall.port}</span>
                      <span>{portCall.services} services</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <Card className="professional-card animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Vessel Volume by Port
                </CardTitle>
                <CardDescription>
                  Current month traffic analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vessels: {
                      label: "Vessels",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vesselVolumeData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="port" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="vessels"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card
              className="professional-card animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Growth Trends
                </CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    vessels: {
                      label: "Vessels",
                      color: "hsl(var(--primary))",
                    },
                    revenue: {
                      label: "Revenue (M USD)",
                      color: "hsl(var(--maritime-success))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthTrendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="vessels"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{
                          fill: "hsl(var(--primary))",
                          strokeWidth: 2,
                          r: 4,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--maritime-success))"
                        strokeWidth={2}
                        dot={{
                          fill: "hsl(var(--maritime-success))",
                          strokeWidth: 2,
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
