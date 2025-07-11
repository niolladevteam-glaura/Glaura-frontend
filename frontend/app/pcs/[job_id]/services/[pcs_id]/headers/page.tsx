"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Anchor, Trash2, Loader2, Plus, Eye } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_BASE_URL = "http://localhost:3080/api/servicetask";

interface PCS {
  id: string;
  job_id: string;
  service_id: string;
  service_name: string;
  vendor_id: string;
  vendor_name: string;
  status: boolean;
}

interface ServiceTask {
  id: string;
  header_id: string;
  service_id: string;
  task_name: string;
  status: boolean | string;
  created_by: string;
  compleated_date?: string;
  compleated_time?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceTaskHeader {
  id: string;
  _id?: string; // for backend compatibility
  header_id?: string;
  job_id: string;
  service_id: string;
  header_name: string;
  status: boolean | string;
  created_by: string;
  compleated_date?: string;
  compleated_time?: string;
  tasks: ServiceTask[];
  createdAt?: string;
  updatedAt?: string;
}

// Helper: header is completed if all tasks are completed
function isHeaderCompletedByTasks(header: ServiceTaskHeader): boolean {
  if (!header.tasks || header.tasks.length === 0) return false;
  return header.tasks.every(
    (task) => task.status === true || task.status === "true"
  );
}

export default function PCSJobPage() {
  // Get both job_id and pcs_id from route params
  const { job_id, pcs_id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pcs, setPCS] = useState<PCS | null>(null); // The PCS record
  const [headers, setHeaders] = useState<ServiceTaskHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [headerToDelete, setHeaderToDelete] =
    useState<ServiceTaskHeader | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTasks, setNewTasks] = useState([{ task_name: "", status: false }]);

  // Add Header Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [adding, setAdding] = useState(false);

  // Fetch PCS (service) for this page (to get service_id)
  useEffect(() => {
    if (!pcs_id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetch(`http://localhost:3080/api/pcs/${pcs_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPCS(data.data))
      .catch(() => setPCS(null));
  }, [pcs_id, router]);

  // Fetch headers for this PCS (job_id + service_id)
  const fetchHeaders = async () => {
    if (!pcs || !pcs.service_id || !job_id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // Only fetch headers where job_id and service_id match
      const res = await fetch(
        `${API_BASE_URL}/headers?job_id=${job_id}&service_id=${pcs.service_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      if (res.status === 404) {
        setHeaders([]);
        setLoading(false);
        return;
      }
      const data = await res.json();

      // Normalize headers: always use id (even if backend returns _id)
      let filteredHeaders = Array.isArray(data)
        ? data
        : data.success && Array.isArray(data.data)
        ? data.data
        : [];

      // Filter by both job_id and service_id
      filteredHeaders = filteredHeaders
        .filter(
          (h: ServiceTaskHeader) =>
            h.job_id === job_id && h.service_id === pcs.service_id
        )
        .map((h: ServiceTaskHeader) => ({
          ...h,
          id: h.id ?? h._id,
        }));

      setHeaders(filteredHeaders);
    } catch (error) {
      setHeaders([]);
      toast({
        title: "Error",
        description: "Failed to fetch service task headers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only fetch headers when PCS is loaded
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    if (pcs && pcs.service_id && job_id) {
      fetchHeaders();
    }
    // eslint-disable-next-line
  }, [router, job_id, pcs]);

  // Delete header logic
  const openDeleteDialog = (header: ServiceTaskHeader) => {
    setHeaderToDelete(header);
    setDeleteDialogOpen(true);
  };

  const handleDeleteHeader = async () => {
    const headerId =
      headerToDelete?.id ||
      headerToDelete?._id ||
      headerToDelete?.header_id ||
      "";
    if (!headerId) {
      toast({
        title: "Error",
        description: "No header selected for deletion.",
        variant: "destructive",
      });
      return;
    }
    try {
      setDeleting((prev) => ({ ...prev, [headerId]: true }));
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://localhost:3080/api/servicetask/headers/${headerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();

      if (response.ok || data.success) {
        setHeaders((prev) =>
          prev.filter(
            (h) =>
              h.id !== headerId &&
              h._id !== headerId &&
              h.header_id !== headerId
          )
        );
        toast({
          title: "Deleted",
          description: "Service Task Header deleted successfully.",
          variant: "default",
        });
        setDeleteDialogOpen(false);
        setHeaderToDelete(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete header",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete header",
        variant: "destructive",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [headerId]: false }));
    }
  };

  // Add Header logic
  const handleAddHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeaderName.trim()) {
      toast({
        title: "Error",
        description: "Header name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!pcs) return;
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const body = {
        job_id,
        service_id: pcs.service_id, // ensure correct service
        header_name: newHeaderName,
        created_by: currentUser?.id || currentUser?.user_id || "unknown",
        status: false,
        tasks: newTasks,
      };

      const response = await fetch(`${API_BASE_URL}/headers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      const data = await response.json();
      if (data.success && data.data) {
        await fetchHeaders();
        toast({
          title: "Added",
          description: "Service Task Header added successfully.",
          variant: "default",
        });
        setAddDialogOpen(false);
        setNewHeaderName("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add header",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add header",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  // Progress Calculation (NEW)
  const allTasks = headers.flatMap((header) => header.tasks || []);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(
    (task) => task.status === true || task.status === "true"
  ).length;
  const progress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (!currentUser || !pcs) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const completedHeaders = headers.filter(isHeaderCompletedByTasks).length;
  const totalHeaders = headers.length;
  const headerId = headerToDelete?.id || headerToDelete?._id || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/pcs/${job_id}/services`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Port Call Services
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Service Task Headers for {pcs.service_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Greek Lanka PCMS
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-lg font-semibold">
                {completedTasks}/{totalTasks} tasks completed
              </div>
              <div className="w-full bg-gray-200 rounded-full h-5 mt-2 mb-2">
                <div
                  className="bg-blue-600 h-5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {progress}%
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service Task Header
          </Button>
        </div>
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Service Task Headers</CardTitle>
            <CardFooter>
              {completedHeaders} of {totalHeaders} headers completed
            </CardFooter>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Header Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      <div>
                        <div className="mb-2">
                          <Eye className="mx-auto h-10 w-10 text-gray-400" />
                        </div>
                        <div className="font-semibold mb-2">
                          No headers found for this service.
                        </div>
                        <Button onClick={() => setAddDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Service Task Header
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  headers.map((header) => (
                    <TableRow
                      key={header.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">
                        {header.header_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isHeaderCompletedByTasks(header)
                              ? "default"
                              : "secondary"
                          }
                        >
                          {isHeaderCompletedByTasks(header)
                            ? "Completed"
                            : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {header.tasks?.filter(
                          (t) => t.status === true || t.status === "true"
                        ).length ?? 0}
                        /{header.tasks?.length ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View header"
                            title="View header"
                            className="bg-blue-100 hover:bg-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                          >
                            <Link
                              href={`/pcs/${job_id}/${
                                header.id || header.header_id
                              }/tasks`}
                            >
                              <Eye className="h-4 w-4 text-gray-700" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => openDeleteDialog(header)}
                            disabled={deleting[header.id || ""]}
                            title="Delete header"
                          >
                            {deleting[header.id || ""] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-gray-100 dark:bg-gray-800 py-3 px-6">
            <div className="text-xs text-muted-foreground">
              Showing {headers.length} headers
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add Header Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Task Header</DialogTitle>
            <DialogDescription>
              Create a new Service Task Header for this service. You can add
              tasks later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHeader} className="space-y-4">
            <div>
              <Label>Header Name</Label>
              <Input
                value={newHeaderName}
                onChange={(e) => setNewHeaderName(e.target.value)}
                placeholder="Enter header name"
                required
              />
            </div>
            {newTasks.map((task, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  value={task.task_name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewTasks((tasks) =>
                      tasks.map((t, i) =>
                        i === idx ? { ...t, task_name: val } : t
                      )
                    );
                  }}
                  placeholder="Task name"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setNewTasks((tasks) => tasks.filter((_, i) => i !== idx))
                  }
                  disabled={newTasks.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              onClick={() =>
                setNewTasks((tasks) => [
                  ...tasks,
                  { task_name: "", status: false },
                ])
              }
            >
              Add Task
            </Button>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                disabled={adding}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={adding || !newHeaderName.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setHeaderToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Header</DialogTitle>
            <DialogDescription>
              {headerToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-destructive">
                    {headerToDelete.header_name}
                  </span>
                  ? This action cannot be undone and will delete all its tasks.
                </>
              ) : (
                <span className="text-destructive">No header selected.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setHeaderToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHeader}>
              {deleting[headerId] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
