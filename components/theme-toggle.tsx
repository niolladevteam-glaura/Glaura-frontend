"use client";

import { Moon, Sun, House } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      {/* Conditionally render Home button */}
      {pathname !== "/dashboard" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="relative flex items-center justify-center"
        >
          <House className="h-4 w-4" />
          <span className="sr-only">Go to Dashboard</span>
        </Button>
      )}

      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="relative flex items-center justify-center"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
