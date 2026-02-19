"use client";

import React, { useEffect, useState } from "react";
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
  MessageSquareWarning,
  Lock,
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
import { can, canAny } from "@/lib/permissions";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserType {
  id: number;
  name: string;
  role: string;
  accessLevel: string;
  department: string;
  avatar?: string;
  profilePicture?: string;
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
          trendValue >= 0 ? `+${trendValue}` : `${trendValue}`,
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
          }),
        );
        setActivePortCalls(mappedPortCalls);

        const transformedVesselVolume = Object.entries(
          data.port_vessel_volume,
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
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/birthdays`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error("Unable to fetch birthdays");
        const b = await res.json();
        setBirthdayCount(
          (b.todayBirthdayCount ?? 0) + (b.thisWeekBirthdayCount ?? 0),
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

  // --- lock scrolling when mobile nav is open ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  type NavigationItem = {
    href: string;
    icon: any;
    label: string;
    active?: boolean;
    disabled?: boolean;
  };

  const dashboardNavItem: NavigationItem = {
    href: "/dashboard",
    icon: Gauge,
    label: "Dashboard",
    active: true,
  };

  const navigationGroups: {
    heading: string;
    items: NavigationItem[];
  }[] = [
    {
      heading: "Management",
      items: [
        {
          href: "/reports",
          icon: BarChart3,
          label: "Reports",
          disabled: true,
        },
        can("management.user.view") && {
          href: "/users",
          icon: Users,
          label: "User Management",
        },
        can("management.pic.view") && {
          href: "/pic-management",
          icon: UserCog,
          label: "PIC Management",
        },
        can("management.access_level.view") && {
          href: "/access-level-manager",
          icon: Lock,
          label: "Access Levels",
        },
      ].filter(Boolean) as NavigationItem[],
    },

    {
      heading: "Operations Department",
      items: [
        can("operation.port_call.view") && {
          href: "/port-calls",
          icon: Anchor,
          label: "Active Port Calls",
        },

        // USERS WITH ONLY THIS PERMISSION SEE ONLY THIS TAB
        can("operation.service.view") && {
          href: "/all-services",
          icon: ListChecks,
          label: "Active Services",
        },

        can("operation.service.update") && {
          href: "/services",
          icon: Wrench,
          label: "Services Management",
        },

        can("operation.email.view") && {
          href: "/emails",
          icon: Mail,
          label: "Email",
        },

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

        can("operation.document.view") && {
          href: "/documents",
          icon: FileText,
          label: "Document Management",
        },
      ].filter(Boolean) as NavigationItem[],
    },

    {
      heading: "Disbursement Department",
      items: [
        can("disbursement.inquiry.view") && {
          href: "/pending-inquiry",
          icon: ClipboardCheck,
          label: "Pending Inquiry",
        },
        can("disbursement.vessel.view") && {
          href: "/vessels",
          icon: Ship,
          label: "Vessel Management",
        },
        can("disbursement.customer.view") && {
          href: "/customers",
          icon: Building2,
          label: "Customers",
        },
        can("disbursement.port_call.create") && {
          href: "/port-calls/new",
          icon: Plus,
          label: "New Port Calls",
        },
        can("disbursement.service.view") && {
          href: "/services",
          icon: Wrench,
          label: "Services Management",
        },
        can("disbursement.email.view") && {
          href: "/emails",
          icon: Mail,
          label: "Email",
        },
        can("disbursement.document.view") && {
          href: "/documents",
          icon: FileText,
          label: "Document Management",
        },
        can("disbursement.task.view") && {
          href: "/tasks",
          icon: ListTodo,
          label: "Task Management",
        },
      ].filter(Boolean) as NavigationItem[],
    },

    {
      heading: "Accounts Department",
      items: [],
    },

    {
      heading: "HR Department",
      items: [],
    },

    {
      heading: "Admin Department",
      items: [
        can("admin.vendor.view") && {
          href: "/vendors",
          icon: Handshake,
          label: "Vendors",
        },
      ].filter(Boolean) as NavigationItem[],
    },

    {
      heading: "IT & Social Media Department",
      items: [],
    },

    {
      heading: "Other",
      items: [
        can("other.feedback.view") && {
          href: "/feedback",
          icon: MessageSquareWarning,
          label: "Feedback & Complaints",
        },
      ].filter(Boolean) as NavigationItem[],
    },
  ];

  const WelcomeCard = ({ user }: { user: UserType }) => {
    // Only read the flag, do not set it here
    const [isFirstLogin, setIsFirstLogin] = React.useState(false);
    React.useEffect(() => {
      const firstLoginFlag = localStorage.getItem("hasLoggedInBefore");
      setIsFirstLogin(!firstLoginFlag);
    }, []);

    // Determine button states based on department
    const isOperationsDept = user?.department?.toLowerCase() === "operations";
    const isDisbursementDept =
      user?.department?.toLowerCase() === "disbursement";
    const isManagementDept = user?.department?.toLowerCase() === "management";

    return (
      <Card className="welcome-card animate-fade-in-up mb-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                Access Level: {user?.accessLevel ?? ""}
              </Badge>
              <h1 className="text-3xl font-bold mb-2">
                {isFirstLogin ? "Welcome to GLAURA" : "Welcome back"},{" "}
                {currentUser?.name ?? ""}
              </h1>
              <p className="text-white/90 text-lg mb-6 max-w-2xl">
                The Aura of Excellence in Port Services
              </p>
              <div className="flex gap-4">
                {/* Port Calls Button */}
                {isOperationsDept || isManagementDept ? (
                  <Link href="/port-calls">
                    <Button
                      variant="secondary"
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Ship /> Port Calls
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="secondary"
                    disabled
                    className="bg-gray-400/30 border-gray-400/30 text-gray-300 cursor-not-allowed"
                  >
                    <Ship /> Port Calls
                  </Button>
                )}

                {/* Customers Button */}
                {isDisbursementDept || isManagementDept ? (
                  <Link href="/customers">
                    <Button
                      variant="outline"
                      className="bg-black/20 border-white/30 text-white hover:bg-white/10"
                    >
                      <Users />
                      Customers
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="bg-gray-400/30 border-gray-400/30 text-gray-300 cursor-not-allowed"
                  >
                    <Users />
                    Customers
                  </Button>
                )}
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
  };

  const MobileProfileCard = ({ user }: { user: UserType }) => (
    <Card className="mb-6 lg:hidden">
      <CardContent className="flex items-center gap-4 py-4">
        <Link href="/profile">
          <Avatar className="h-14 w-14 cursor-pointer">
            <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
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
      {/* MOBILE HEADER */}
      <header className="lg:hidden glass-effect border-b px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* --- Hamburger Menu --- */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
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

        {/* --- Custom Mobile Nav Overlay (Sheet + Mask) --- */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay mask */}
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm transition-opacity"
              aria-label="Close mobile menu"
              tabIndex={-1}
            />
            {/* Sidebar */}
            <nav
              className={`
                fixed top-0 left-0 z-[120] h-full w-[80vw] max-w-xs sm:max-w-sm bg-background shadow-lg flex flex-col
                animate-slide-in-left
                `}
              style={{
                minHeight: "100dvh", // support mobile 'viewport units'
                transition: "transform 0.2s cubic-bezier(.4,0,.2,1)",
              }}
              aria-label="Sidebar Navigation"
            >
              {/* --- close button --- */}
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-bold">GLAURA</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <span className="text-2xl" aria-hidden="true">
                    &times;
                  </span>
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <Link
                  href={dashboardNavItem.href}
                  className={`nav-item animate-fade-in-left ${
                    dashboardNavItem.active ? "active" : ""
                  }`}
                  style={{ animationDelay: "0s" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <dashboardNavItem.icon className="h-5 w-5" />
                  <span className="font-medium">{dashboardNavItem.label}</span>
                </Link>
                {navigationGroups.map((group, idx) => (
                  <div key={group.heading || idx} className="mt-6">
                    <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                      {group.heading}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item, index) =>
                        item.disabled ? (
                          <div
                            key={item.href}
                            className="nav-item nav-item--disabled animate-fade-in-left"
                            style={{
                              animationDelay: `${index * 0.05 + 0.05}s`,
                            }}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                        ) : (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item animate-fade-in-left`}
                            style={{
                              animationDelay: `${index * 0.05 + 0.05}s`,
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t px-4 py-3">
                <Button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500"
                  variant="ghost"
                  aria-label="Logout"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span>Logout</span>
                </Button>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* DESKTOP HEADER */}
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
                    Version 1.8
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

            <div className="text-right">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">
                {currentUser.role}
              </p>
            </div>
            <Link href="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage
                  src={currentUser.profilePicture || "/placeholder.svg"}
                />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* === DESKTOP SIDEBAR: 3-ZONE, PROFESSIONAL LAYOUT === */}
        <aside className="hidden lg:flex w-72 bg-background border-r flex-col h-[calc(100vh-73px)] sticky top-[73px]">
          {/* SCROLLABLE NAVIGATION BLOCK */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <Link
              href={dashboardNavItem.href}
              className={`nav-item ${dashboardNavItem.active ? "active" : ""}`}
            >
              <dashboardNavItem.icon className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            {navigationGroups.map((group, idx) => (
              <div key={group.heading || idx}>
                <h3 className="text-xs font-bold text-muted-foreground mb-3 uppercase">
                  {group.heading}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item) =>
                    item.disabled ? (
                      <div
                        key={item.href}
                        className="nav-item nav-item--disabled"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nav-item"
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SIDEBAR FOOTER (PROFILE + LOGOUT), NOT SCROLLABLE */}
          <div className="border-t px-2 pb-4 pt-3">
            <button
              onClick={handleLogout}
              className="
      flex items-center w-full gap-2
      px-3 py-2
      rounded-md
      text-base font-medium
      text-red-500
      bg-transparent
      transition
      hover:bg-neutral-900/70 
      hover:text-red-600
      active:bg-neutral-800/70
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400/60
      shadow-none
    "
              aria-label="Logout"
              tabIndex={0}
            >
              <LogOut className="h-[18px] w-[18px] opacity-80" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
        {/* === END SIDEBAR === */}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-[calc(98vh-73px)]">
          {/* Mobile Profile Card */}
          <MobileProfileCard user={currentUser} />

          {/* Welcome Card */}
          <WelcomeCard user={currentUser} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Today Added Port Calls"
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
