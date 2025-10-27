import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GLAURA",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/icons/icon-192x192.png", sizes: "192x192" },
    {
      rel: "apple-touch-icon",
      url: "/icons/icon-192x192.png",
      sizes: "192x192",
    },
  ],
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2363d1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {" "}
          <Toaster richColors position="top-center" />
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
