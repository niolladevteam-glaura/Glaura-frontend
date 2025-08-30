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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Ship,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MapPin,
  Calendar,
  FileText,
  LogOut,
  Anchor,
} from "lucide-react";

interface PortCall {
  id: string;
  jobNumber: string;
  vesselName: string;
  imo: string;
  eta: string;
  port: string;
  status: string;
  services: ServiceItem[];
  timeline: TimelineEvent[];
  documents: Document[];
}

interface ServiceItem {
  id: string;
  name: string;
  status: "Pending" | "In Progress" | "Completed";
  assignedTo: string;
  startTime?: string;
  completedTime?: string;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  event: string;
  description: string;
  user: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  downloadUrl: string;
}

export default function ClientPortal() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [selectedPortCall, setSelectedPortCall] = useState<PortCall | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    if (user.accessLevel !== "CLIENT") {
      router.push("/dashboard");
      return;
    }

    setCurrentUser(user);

    // Mock client port calls data
    const mockPortCalls: PortCall[] = [
      {
        id: "1",
        jobNumber: "GLPC-2024-001",
        vesselName: "MSC Oscar",
        imo: "9876543",
        eta: "2024-01-15T14:30",
        port: "Colombo",
        status: "In Progress",
        services: [
          {
            id: "s1",
            name: "Crew Changes (On/Off)",
            status: "Completed",
            assignedTo: "Sandalu Nawarathne",
            startTime: "2024-01-15T08:00",
            completedTime: "2024-01-15T11:30",
          },
          {
            id: "s2",
            name: "Ship Spares Clearance and Delivery",
            status: "In Progress",
            assignedTo: "Saman Kumara",
            startTime: "2024-01-15T09:00",
          },
          {
            id: "s3",
            name: "Fresh Water Supply",
            status: "Pending",
            assignedTo: "Maleesha Bandara",
          },
          {
            id: "s4",
            name: "Provisions Supply",
            status: "Pending",
            assignedTo: "Maleesha Bandara",
          },
        ],
        timeline: [
          {
            id: "t1",
            timestamp: "2024-01-15T08:00",
            event: "Crew Changes Started",
            description: "Crew disembarkation process initiated at berth",
            user: "Sandalu Nawarathne",
          },
          {
            id: "t2",
            timestamp: "2024-01-15T09:30",
            event: "Immigration Clearance",
            description: "All crew documentation approved by immigration",
            user: "Sewwandi Rupasinghe",
          },
          {
            id: "t3",
            timestamp: "2024-01-15T11:30",
            event: "Crew Changes Completed",
            description: "All crew changes successfully completed",
            user: "Sandalu Nawarathne",
          },
          {
            id: "t4",
            timestamp: "2024-01-15T12:00",
            event: "Spares Clearance Started",
            description: "Ship spares clearance process initiated",
            user: "Saman Kumara",
          },
        ],
        documents: [
          {
            id: "d1",
            name: "Crew Disembarkation Letter",
            type: "Immigration",
            generatedAt: "2024-01-15T09:00",
            downloadUrl: "#",
          },
          {
            id: "d2",
            name: "Port Disbursement Account",
            type: "PDA",
            generatedAt: "2024-01-15T10:30",
            downloadUrl: "#",
          },
        ],
      },
      {
        id: "2",
        jobNumber: "GLPC-2024-002",
        vesselName: "MSC Mediterranean",
        imo: "9654321",
        eta: "2024-01-18T16:00",
        port: "Galle",
        status: "Pending",
        services: [
          {
            id: "s5",
            name: "Bunker Coordination",
            status: "Pending",
            assignedTo: "Shadini De Silva",
          },
          {
            id: "s6",
            name: "Underwater Inspection",
            status: "Pending",
            assignedTo: "Supun Rathnayaka",
          },
        ],
        timeline: [
          {
            id: "t5",
            timestamp: "2024-01-14T10:00",
            event: "Port Call Created",
            description: "New port call registered in system",
            user: "Kumar Fernando",
          },
        ],
        documents: [],
      },
    ];

    setPortCalls(mockPortCalls);
    setSelectedPortCall(mockPortCalls[0]);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />;
      case "In Progress":
        return <Clock className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Greek Lanka Client Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Real-time Port Call Tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Client Access
            </Badge>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Mediterranean Shipping
              </p>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Port Calls List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Port Calls</CardTitle>
                <CardDescription>
                  Active and recent vessel operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {portCalls.map((portCall) => (
                  <div
                    key={portCall.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPortCall?.id === portCall.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPortCall(portCall)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">
                        {portCall.vesselName}
                      </h3>
                      <Badge className={getStatusColor(portCall.status)}>
                        {portCall.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      {portCall.jobNumber}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      <span>{portCall.port}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        ETA: {new Date(portCall.eta).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPortCall && (
              <div className="space-y-6">
                {/* Port Call Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Ship className="h-5 w-5" />
                          <span>{selectedPortCall.vesselName}</span>
                        </CardTitle>
                        <CardDescription>
                          {selectedPortCall.jobNumber} • IMO:{" "}
                          {selectedPortCall.imo}
                        </CardDescription>
                      </div>
                      <Badge
                        className={getStatusColor(selectedPortCall.status)}
                      >
                        {selectedPortCall.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Port of Call</p>
                        <p className="font-medium">{selectedPortCall.port}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">ETA</p>
                        <p className="font-medium">
                          {new Date(selectedPortCall.eta).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Services</p>
                        <p className="font-medium">
                          {selectedPortCall.services.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="services" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="services">Services Status</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="services" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Service Progress</CardTitle>
                        <CardDescription>
                          Real-time status of all requested services
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedPortCall.services.map((service) => (
                            <div
                              key={service.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-medium">{service.name}</h3>
                                <Badge
                                  className={getStatusColor(service.status)}
                                >
                                  {getStatusIcon(service.status)}
                                  <span className="ml-1">{service.status}</span>
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Assigned To</p>
                                  <p className="font-medium">
                                    {service.assignedTo}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Start Time</p>
                                  <p className="font-medium">
                                    {service.startTime
                                      ? new Date(
                                          service.startTime
                                        ).toLocaleString()
                                      : "Not started"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">
                                    Completed Time
                                  </p>
                                  <p className="font-medium">
                                    {service.completedTime
                                      ? new Date(
                                          service.completedTime
                                        ).toLocaleString()
                                      : "In progress"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Timeline</CardTitle>
                        <CardDescription>
                          Chronological log of all port call activities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedPortCall.timeline.map((event, index) => (
                            <div key={event.id} className="flex space-x-4">
                              <div className="flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                {index <
                                  selectedPortCall.timeline.length - 1 && (
                                  <div className="w-px h-12 bg-gray-300 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-medium text-sm">
                                    {event.event}
                                  </h3>
                                  <span className="text-xs text-gray-500">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  {event.description}
                                </p>
                                <p className="text-xs text-gray-500">
                                  By: {event.user}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Generated Documents</CardTitle>
                        <CardDescription>
                          Download official documents for this port call
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedPortCall.documents.length > 0 ? (
                          <div className="space-y-3">
                            {selectedPortCall.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-sm">
                                      {doc.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {doc.type} • Generated:{" "}
                                      {new Date(
                                        doc.generatedAt
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">
                              No documents generated yet
                            </p>
                            <p className="text-sm text-gray-400">
                              Documents will appear here as services are
                              completed
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
