"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";

interface BirthdayCustomer {
  id?: string | number;
  name: string;
  company?: string;
  date: string;
}

interface BirthdayResponse {
  todayBirthdayCount: number;
  thisWeekBirthdayCount: number;
  thisMonthBirthdayCount: number;
  birthdays: {
    today: BirthdayCustomer[];
    thisWeek: BirthdayCustomer[];
    thisMonth: BirthdayCustomer[];
  };
}

export default function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<BirthdayResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Calendar className="h-6 w-6 animate-spin mr-2" />
        Loading birthdays...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Calendar className="h-7 w-7" />
        Customer Birthdays
      </h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-primary text-white px-2 py-1">Today</Badge>
              <span> {birthdays?.todayBirthdayCount || 0} birthdays</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(birthdays?.birthdays.today?.length ?? 0) === 0 ? (
              <div className="text-muted-foreground">No birthdays today.</div>
            ) : (
              <ul>
                {birthdays!.birthdays.today.map((b, idx) => (
                  <li
                    key={b.id || idx}
                    className="mb-2 flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <span>
                      <span className="font-semibold">{b.name}</span>
                      {b.company && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({b.company})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white px-2 py-1">
                This Week
              </Badge>
              <span>{birthdays?.thisWeekBirthdayCount || 0} birthdays</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(birthdays?.birthdays.thisWeek?.length ?? 0) === 0 ? (
              <div className="text-muted-foreground">
                No birthdays this week.
              </div>
            ) : (
              <ul>
                {birthdays!.birthdays.thisWeek.map((b, idx) => (
                  <li
                    key={b.id || idx}
                    className="mb-2 flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <span>
                      <span className="font-semibold">{b.name}</span>
                      {b.company && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({b.company})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-pink-600 text-white px-2 py-1">
                This Month
              </Badge>
              <span>{birthdays?.thisMonthBirthdayCount || 0} birthdays</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(birthdays?.birthdays.thisMonth?.length ?? 0) === 0 ? (
              <div className="text-muted-foreground">
                No birthdays this month.
              </div>
            ) : (
              <ul>
                {birthdays!.birthdays.thisMonth.map((b, idx) => (
                  <li
                    key={b.id || idx}
                    className="mb-2 flex flex-col md:flex-row md:items-center justify-between"
                  >
                    <span>
                      <span className="font-semibold">{b.name}</span>
                      {b.company && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({b.company})
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
