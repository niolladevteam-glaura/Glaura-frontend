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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { DocumentTypeModal } from "@/components/DocumentTypeModal";
import { FileText, Plus, LogOut, Anchor } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  type: string;
  category:
    | "PDA"
    | "Immigration"
    | "Customs"
    | "FDA"
    | "Permissions"
    | "Waybill"
    | "TW Applications"
    | "Other";
  portCallId: string;
  vesselName: string;
  client: string;
  generatedBy: string;
  generatedAt: string;
  format: "PDF" | "Word";
  hasLetterhead: boolean;
  status: "Draft" | "Generated" | "Sent" | "Approved";
  downloadUrl: string;
  fileSize: string;
}

interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: string[];
  lastUsed: string;
}

export default function DocumentManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const docTypes = [
    {
      label: "OKTB Documents",
      description: "Generate crew sign on/off letters with flight details",
      color: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      route: "/documents/oktb",
    },
    {
      label: "Ship Spares Documents",
      description: "Generate waybill and clearance letters for ship spares",
      color: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      route: "/documents/ship-spares",
    },
    {
      label: "Port Disbursement Account",
      description: "Generate PDA with all service charges and details",
      color: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      route: "/documents/pda",
    },
    {
      label: "Customs Letters",
      description: "Generate customs clearance and permission letters",
      color: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
      route: "/documents/customs",
    },
    {
      label: "FDA Applications",
      description: "Generate FDA applications and related documents",
      color: "bg-teal-100 dark:bg-teal-900",
      iconColor: "text-teal-600 dark:text-teal-400",
      route: "/documents/fda",
    },
    {
      label: "TW Applications",
      description: "Generate temporary work permit applications",
      color: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-400",
      route: "/documents/tw-applications",
    },
  ];

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userData);
    setCurrentUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <DocumentTypeModal open={showModal} onClose={() => setShowModal(false)} />
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Document Management
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Generate and manage documents
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value="generate" onValueChange={() => {}} className="space-y-6">
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Document</CardTitle>
                <CardDescription>
                  Select document type and port call to generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {docTypes.map((doc) => (
                    <Card
                      key={doc.label}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(doc.route)}
                    >
                      <CardContent className="p-6 text-center">
                        <div
                          className={`${doc.color} p-4 rounded-lg mx-auto w-fit mb-4`}
                        >
                          <FileText className={`h-8 w-8 ${doc.iconColor}`} />
                        </div>
                        <h3 className="font-semibold mb-2">{doc.label}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {doc.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
