"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowLeft,
  Amphora,
  Anchor,
  Search,
  Plus,
  Ship,
  FileText,
  MapPin,
  Table2,
  LayoutGrid,
  Edit,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface TankerOperation {
  id: string;
  agencyRef: string;
  vesselName: string;
  imoNo: string;
  voyageNo: string;
  port: string;
  status: "Pending" | "Closed";
}

// Dummy data for initial layout
const DUMMY_OPERATIONS: TankerOperation[] = [
  {
    id: "1",
    agencyRef: "GL/TO/001",
    vesselName: "NORD VOYAGER",
    imoNo: "9123456",
    voyageNo: "V-120",
    port: "COLOMBO",
    status: "Pending",
  },
  {
    id: "2",
    agencyRef: "GL/TO/002",
    vesselName: "EVER GIVEN",
    imoNo: "9001234",
    voyageNo: "V-99",
    port: "HAMBANTOTA",
    status: "Closed",
  },
];

export default function TankerOperations() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [operations, setOperations] = useState<TankerOperation[]>(DUMMY_OPERATIONS);
  const [filteredOperations, setFilteredOperations] = useState<TankerOperation[]>(DUMMY_OPERATIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewType, setViewType] = useState<"card" | "table">("card");
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

  useEffect(() => {
    let filtered = operations;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.vesselName.toLowerCase().includes(term) ||
          op.agencyRef.toLowerCase().includes(term) ||
          op.imoNo.includes(term)
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((op) => op.status.toLowerCase() === statusFilter);
    }
    setFilteredOperations(filtered);
  }, [searchTerm, statusFilter, operations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Closed":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
    }
  };

  if (!currentUser) return null;

  const TableView = () => (
    <div className="overflow-x-auto rounded-lg shadow bg-white dark:bg-gray-900 border">
      <table className="min-w-full text-sm">
        <thead className="bg-blue-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Agency Ref</th>
            <th className="px-4 py-3 text-left font-semibold">Vessel Name</th>
            <th className="px-4 py-3 text-left font-semibold">IMO No</th>
            <th className="px-4 py-3 text-left font-semibold">Voyage No</th>
            <th className="px-4 py-3 text-left font-semibold">Port</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredOperations.map((op) => (
            <tr key={op.id} className="border-b dark:border-gray-700">
              <td className="px-4 py-3">
                <Badge variant="outline" className={getStatusColor(op.status)}>
                  {op.status}
                </Badge>
              </td>
              <td className="px-4 py-3 font-medium">{op.agencyRef}</td>
              <td className="px-4 py-3">
                <span className="font-semibold">{op.vesselName}</span>
              </td>
              <td className="px-4 py-3">{op.imoNo}</td>
              <td className="px-4 py-3">{op.voyageNo}</td>
              <td className="px-4 py-3">{op.port}</td>
              <td className="px-4 py-3">
                <Link href={`/tanker-operations/${encodeURIComponent(op.agencyRef)}`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
          {filteredOperations.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8">
                <Amphora className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No operations found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search criteria
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span>Tanker Operations Management</span>
              <Link href="/tanker-operations/new">
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Open Tanker Operation
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4 mt-2">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by Vessel Name, Agency Ref, IMO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* View Type Toggles */}
            <div className="flex gap-2">
              <Button
                variant={viewType === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("table")}
                className="flex items-center gap-2"
              >
                <Table2 className="h-4 w-4" />
                Table View
              </Button>
              <Button
                variant={viewType === "card" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("card")}
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Card View
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {viewType === "table" ? (
            <TableView />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOperations.map((op) => (
                <Card key={op.id} className="hover:shadow-lg transition-shadow border-t-4 border-t-primary">
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                          {op.agencyRef}
                        </Badge>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Ship className="h-5 w-5 text-gray-500" />
                          {op.vesselName}
                        </CardTitle>
                      </div>
                      <Badge className={getStatusColor(op.status)}>
                        {op.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold uppercase">IMO No</p>
                      <p className="font-medium mt-1">{op.imoNo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-semibold uppercase">Voyage No</p>
                      <p className="font-medium mt-1">{op.voyageNo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-xs font-semibold uppercase">Port</p>
                      <p className="font-medium mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {op.port}
                      </p>
                    </div>
                    <div className="col-span-2 pt-4 border-t flex gap-2">
                      <Link href={`/tanker-operations/${encodeURIComponent(op.agencyRef)}`} className="w-full">
                        <Button variant="default" className="w-full flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Operation
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredOperations.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed">
                  <Amphora className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No operations found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
