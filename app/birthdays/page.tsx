"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Calendar,
  Gift,
  Clock,
  Phone,
  Mail,
  UserCircle,
  ArrowLeft,
} from "lucide-react";

type RawBirthdayCustomer = {
  pic_id: string;
  customer_id: string;
  prefix: string;
  firstName: string;
  lastName: string;
  phone_number?: string;
  email?: string;
  birthday: string;
  receiveUpdates: boolean;
  remark?: string;
};

interface BirthdayResponse {
  todayBirthdayCount: number;
  thisWeekBirthdayCount: number;
  thisMonthBirthdayCount: number;
  birthdays: {
    today: RawBirthdayCustomer[];
    thisWeek: RawBirthdayCustomer[];
    thisMonth: RawBirthdayCustomer[];
  };
}

function getCustomerBDKey(c: RawBirthdayCustomer) {
  return `${c.pic_id || ""}_${c.birthday}`;
}
function formatName(c: RawBirthdayCustomer) {
  return [c.prefix, c.firstName, c.lastName].filter(Boolean).join(" ");
}
function displayDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClientBirthdayAlertsPage() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    accessLevel: string;
  } | null>(null);
  const [birthdays, setBirthdays] = useState<BirthdayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userRaw = localStorage.getItem("currentUser");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setCurrentUser({
          name: user.name || user.fullName || "User",
          accessLevel: user.accessLevel || "A",
        });
      } catch {
        setCurrentUser({ name: "User", accessLevel: "A" });
      }
    }
  }, []);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const resp = await fetch("http://localhost:3080/api/birthdays");
        if (!resp.ok) throw new Error("Unable to fetch birthdays");
        const data = await resp.json();
        setBirthdays(data);
      } catch (err) {
        setBirthdays(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBirthdays();
  }, []);

  // Combine all upcoming birthdays (today + week + month), de-duped
  function getUpcoming() {
    if (!birthdays) return [];
    const entries = [
      ...(birthdays.birthdays.today ?? []),
      ...(birthdays.birthdays.thisWeek ?? []),
      ...(birthdays.birthdays.thisMonth ?? []),
    ];
    const seen = new Set();
    const unique: RawBirthdayCustomer[] = [];
    for (const c of entries) {
      const key = getCustomerBDKey(c);
      if (!seen.has(key)) {
        unique.push(c);
        seen.add(key);
      }
    }
    unique.sort((a, b) => (a.birthday || "").localeCompare(b.birthday || ""));
    return unique;
  }

  const uniqueUpcoming = birthdays ? getUpcoming() : [];

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
        <Calendar className="h-6 w-6 animate-spin mr-2" />
        Loading user...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
        <Calendar className="h-6 w-6 animate-spin mr-2" />
        Loading client birthdays...
      </div>
    );
  }

  if (!birthdays) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">
        <Calendar className="h-6 w-6 mr-2" />
        Unable to load birthday data.
      </div>
    );
  }

  return (
    <>
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
                <Gift className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Birthday Alerts
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Celebrate & Engage With Clients
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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/*  Summary Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-between py-6 px-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Calendar className="h-7 w-7" />
                Client Birthday Alerts
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Stay connected with your clients by celebrating their special
                days 🎉
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-primary text-white px-3 py-1.5 rounded-full shadow-sm">
                Today: {birthdays.todayBirthdayCount}
              </Badge>
              <Badge className="bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm">
                This Week: {birthdays.thisWeekBirthdayCount}
              </Badge>
              <Badge className="bg-purple-600 text-white px-3 py-1.5 rounded-full shadow-sm">
                This Month: {birthdays.thisMonthBirthdayCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Birthdays Section */}
        <Card className="border border-primary/30 bg-primary/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Gift className="h-5 w-5" />
              Today’s Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            {birthdays.birthdays.today.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {birthdays.birthdays.today.map((c) => (
                  <Card
                    key={c.customer_id}
                    className="p-4 bg-white dark:bg-gray-900 border border-primary/20 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center">
                        <UserCircle className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg text-foreground">
                          {formatName(c)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {c.email}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone_number}
                      </span>
                      <Button
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        Send Wishes
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">
                No birthdays today.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uniqueUpcoming.length > 0 ? (
              <ul className="relative border-l border-muted pl-4 space-y-4">
                {uniqueUpcoming.map((c) => (
                  <li key={getCustomerBDKey(c)} className="relative pl-4">
                    <span className="absolute -left-[9px] top-1 w-2 h-2 rounded-full bg-blue-600"></span>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="font-medium text-foreground">
                          {formatName(c)}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {c.email}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 mt-1 sm:mt-0">
                        {displayDate(c.birthday)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">
                No upcoming birthdays this month.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
