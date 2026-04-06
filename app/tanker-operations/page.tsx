"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Amphora, Anchor } from "lucide-react";
import Link from "next/link";

export default function TankerOperations() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    try {
      setCurrentUser(JSON.parse(userData));
    } catch (err) {
      setCurrentUser({ name: "Demo User", accessLevel: "A" });
    }
  }, [router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - fully responsive */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
          {/* Left Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto">
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
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Amphora className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Tanker Operations
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage Tanker Specific Workflows
                </p>
              </div>
            </div>
          </div>
          {/* Right Section - responsive */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 mt-3 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser?.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser?.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Tanker operations functional module is currently being configured.</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center text-gray-500">
            <Amphora className="h-16 w-16 mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">Tanker Operations data will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
