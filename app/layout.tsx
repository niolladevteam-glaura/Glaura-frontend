import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

// Import Next's Head component for meta tags
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GLAURA",
  description: "Maritime Port Call Management System",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        {/* PWA primary color theme */}
        <meta name="theme-color" content="#2363d1" />
        {/* PWA manifest and icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.jpg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Add more meta as needed for PWA */}
      </Head>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-center" richColors />
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
