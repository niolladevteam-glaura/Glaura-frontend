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
  Menu,
  Anchor,
  ArrowRight,
  ClipboardList,
  UserCog,
  Handshake,
  Building2,
  ListTodo,
  ListChecks,
  Fuel,
  Amphora,
  ClipboardCheck,
  Wrench,
  Gauge,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Bar,
  BarChart,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [activePortCallsCount, setActivePortCallsCount] = useState(0);
  const [pendingServicesCount, setPendingServicesCount] = useState(0);
  const [birthdayCount, setBirthdayCount] = useState(0);
  const [todayBirthdayCount, setTodayBirthdayCount] = useState(0);
  const [thisWeekBirthdayCount, setThisWeekBirthdayCount] = useState(0);
  const [thisMonthBirthdayCount, setThisMonthBirthdayCount] = useState(0);
  const [activePortCallsTrend, setActivePortCallsTrend] = useState("");
  const [vesselVolumeData, setVesselVolumeData] = useState<
    { port: string; vessels: number }[]
  >([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Retrieve both user data and token from localStorage
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("currentUser");
          router.push("/");
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`);
        }

        const data = await response.json();

        setActivePortCallsCount(data.active_port_calls.today_count);
        setPendingServicesCount(data.pending_services);

        const trendValue =
          data.active_port_calls.today_count -
          data.active_port_calls.from_yesterday;
        setActivePortCallsTrend(
          trendValue >= 0 ? `+${trendValue}` : `${trendValue}`
        );

        const mappedPortCalls = data.recent_port_calls.map(
          (item: any, index: number) => ({
            id: `temp-${index}`,
            jobNumber: "N/A",
            vesselName: item.Vessel_Name,
            imo: "N/A",
            client: item.Company,
            eta: "N/A",
            port: item.Port,
            status: item.status,
            services: item.service,
            assignedPIC: "N/A",
          })
        );
        setActivePortCalls(mappedPortCalls);

        const transformedVesselVolume = Object.entries(
          data.port_vessel_volume
        ).map(([port, vessels]) => ({
          port,
          vessels: vessels as number,
        }));
        setVesselVolumeData(transformedVesselVolume);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  // Fetch Birthday Summary from separate API on startup
  useEffect(() => {
    const fetchBirthdaySummary = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/birthdays`);
        if (!res.ok) throw new Error("Unable to fetch birthdays");
        const b = await res.json();
        setBirthdayCount(
          (b.todayBirthdayCount ?? 0) + (b.thisWeekBirthdayCount ?? 0)
        );
        setTodayBirthdayCount(b.todayBirthdayCount ?? 0);
        setThisWeekBirthdayCount(b.thisWeekBirthdayCount ?? 0);
        setThisMonthBirthdayCount(b.thisMonthBirthdayCount ?? 0);
      } catch {
        setBirthdayCount(0);
        setTodayBirthdayCount(0);
        setThisWeekBirthdayCount(0);
        setThisMonthBirthdayCount(0);
      }
    };
    fetchBirthdaySummary();
  }, []);

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

  // Navigation item type with optional 'disabled' property
  type NavigationItem = {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    disabled?: boolean;
  };

  // Grouped navigation items with headings
  const navigationGroups: {
    heading: string;
    items: NavigationItem[];
  }[] = [
    {
      heading: "Management",
      items: [
        {
          href: "/dashboard",
          icon: Gauge,
          label: "Dashboard",
          active: true,
        },
        {
          href: "/reports",
          icon: BarChart3,
          label: "Reports",
          disabled: true,
        },
        ...(currentUser?.accessLevel === "A"
          ? [{ href: "/users", icon: Users, label: "User Management" }]
          : []),
        { href: "/pic-management", icon: UserCog, label: "PIC Management" },
      ],
    },
    {
      heading: "Operations Department",
      items: [
        { href: "/port-calls", icon: Anchor, label: "Active Port Calls" },
        { href: "/all-services", icon: ListChecks, label: "Active Services" },
        { href: "/services", icon: Wrench, label: "Services Management" },
        { href: "/emails", icon: Mail, label: "Email" },
        {
          href: "/husbandry-services",
          icon: ClipboardList,
          label: "Husbandry Services",
          disabled: true,
        },
        {
          href: "/tanker-operations",
          icon: Amphora,
          label: "Tanker Operations",
          disabled: true,
        },
        {
          href: "/bunkering-operations",
          icon: Fuel,
          label: "Bunkering Operations",
          disabled: true,
        },
        { href: "/documents", icon: FileText, label: "Document Management" },
      ],
    },
    {
      heading: "Disbursement Department",
      items: [
        ...(canCreatePortCall()
          ? [{ href: "/port-calls/new", icon: Plus, label: "New Port Calls" }]
          : []),
        { href: "/customers", icon: Building2, label: "Customers" },
        { href: "/vessels", icon: Ship, label: "Vessel Management" },
        { href: "/services", icon: Wrench, label: "Services Management" },
        { href: "/tasks", icon: ListTodo, label: "Task Management" },
        { href: "/documents", icon: FileText, label: "Document Management" },
        {
          href: "/pending-inquiry",
          icon: ClipboardCheck,
          label: "Pending Inquiry",
        },
      ],
    },
    {
      heading: "Accounts Department",
      items: [
        // Add links
      ],
    },
    {
      heading: "HR Department",
      items: [
        // Add links
      ],
    },
    {
      heading: "Admin Department",
      items: [{ href: "/vendors", icon: Handshake, label: "Vendors" }],
    },
    {
      heading: "IT & Social Media Department",
      items: [
        // Add links
      ],
    },
  ];

  const WelcomeCard = ({ user }: { user: UserType }) => (
    <Card className="welcome-card animate-fade-in-up mb-8">
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              Access Level: {user?.accessLevel ?? ""}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {currentUser?.name ?? ""}
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

  const MobileProfileCard = ({ user }: { user: UserType }) => (
    <Card className="mb-6 lg:hidden">
      <CardContent className="flex items-center gap-4 py-4">
        <Link href="/profile">
          <Avatar className="h-14 w-14 cursor-pointer">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <p className="text-base font-semibold">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs mt-2">
            Level {user.accessLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (!mounted || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

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
              <SheetContent
                side="left"
                className="w-[300px] max-h-[90vh] overflow-y-auto"
              >
                <nav className="space-y-6 pt-6">
                  {navigationGroups.map((group, idx) => (
                    <div key={group.heading || idx}>
                      <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                        {group.heading}
                      </h3>
                      <div className="space-y-1">
                        {group.items.map((item, index) =>
                          item.disabled ? (
                            <div
                              key={item.href}
                              className="nav-item nav-item--disabled animate-fade-in-left"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                          ) : (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`nav-item animate-fade-in-left ${
                                (item as any).active ? "active" : ""
                              }`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </Link>
                          )
                        )}



                      </div>
                    </div>
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
              <div className="h-12 w-12 relative">
                <img
                  src="/color-glaura.png"
                  alt="Glaura Logo"
                  className="absolute inset-0 h-full w-full object-contain dark:hidden"
                />
                <img
                  src="/white-glaura.png"
                  alt="Glaura Logo Dark"
                  className="absolute inset-0 h-full w-full object-contain hidden dark:block"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient flex items-center gap-4 mb-2">
                  GLAURA
                  <Badge
                    className="
                      bg-white/20 text-black border border-black/30 px-3 py-1 rounded-md
                      dark:bg-white/20 dark:text-white dark:border-white/30
                    "
                  >
                    Version 1.0
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  The Aura of Excellence in Port Service
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
        {/* Enhanced Desktop Sidebar with own scroll */}
        <aside className="hidden lg:block w-72 border-r bg-background min-h-screen sticky top-[73px]">
          <div className="h-screen max-h-screen overflow-y-auto">
            <nav className="p-4 space-y-6">
              {navigationGroups.map((group, idx) => (
                <div key={group.heading || idx}>
                  <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase">
                    {group.heading}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item, index) =>
                      item.disabled ? (
                        <div
                          key={item.href}
                          className="nav-item nav-item--disabled animate-fade-in-left"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`nav-item animate-fade-in-left ${
                            (item as any)?.active ? "active" : ""
                          }`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      )
                    )}



                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* Mobile Profile Card */}
          <MobileProfileCard user={currentUser} />

          {/* Welcome Card */}
          <WelcomeCard user={currentUser} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Port Calls"
              value={activePortCallsCount}
              subtitle="from yesterday"
              trend={activePortCallsTrend}
              icon={Ship}
              delay={0}
            />
            <StatCard
              title="Pending Services"
              value={pendingServicesCount}
              subtitle="across all calls"
              icon={Activity}
              delay={0.1}
            />
            {/* --------- Birthday Card --------- */}
            <Card
              className="stats-card animate-fade-in-up"
              style={{ animationDelay: `0.2s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Birthday Alerts
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{birthdayCount}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  next 7 days
                </p>
                {/* <div className="flex gap-2 text-xs mb-2">
                  <Badge variant="secondary" className="px-1">
                    Today: {todayBirthdayCount}
                  </Badge>
                  <Badge variant="outline" className="px-1">
                    This Week: {thisWeekBirthdayCount}
                  </Badge>
                  <Badge variant="outline" className="px-1">
                    Month: {thisMonthBirthdayCount}
                  </Badge>
                </div> */}
                <div>
                  <Link href="/birthdays">
                    <Button
                      variant="link"
                      className="flex items-center gap-1 p-0 h-auto text-violet-600 dark:text-violet-400 text-xs"
                    >
                      View All Birthdays
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {/* ---------------------------------------- */}
            <StatCard
              title="Department"
              value={currentUser?.department || ""}
              subtitle="your assignment"
              icon={Users}
              delay={0.3}
            />
          </div>

          {/* Recent Apps Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Port Calls</h2>
              <Link href="/port-calls">
                <Button variant="ghost" className="text-primary">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
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

          {/* Responsive Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 xl:gap-8 mb-8">
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
                <div className="w-full overflow-x-auto">
                  <ChartContainer
                    config={{
                      vessels: {
                        label: "Vessels",
                        color: "hsl(var(--primary))",
                      },
                    }}
                    className="h-[200px] sm:h-[300px] min-w-[320px]"
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
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
