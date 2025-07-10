"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3080/api/servicetask";

interface ServiceTask {
  id: string;
  header_id: string;
  service_id: string;
  task_name: string;
  status: boolean;
  created_by: string;
  compleated_date?: string;
  compleated_time?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceTaskHeader {
  id: string;
  header_name: string;
  status: boolean;
  created_by: string;
  compleated_date?: string;
  compleated_time?: string;
  tasks: ServiceTask[];
  createdAt?: string;
  updatedAt?: string;
}

export default function ServiceTasksPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [headers, setHeaders] = useState<ServiceTaskHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [headerToDelete, setHeaderToDelete] =
    useState<ServiceTaskHeader | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Add Header Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newHeaderName, setNewHeaderName] = useState("");
  const [adding, setAdding] = useState(false);

  // Fetch headers on mount
  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(`${API_BASE_URL}/headers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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
        if (Array.isArray(data)) {
          setHeaders(data);
        } else if (data.success && Array.isArray(data.data)) {
          setHeaders(data.data);
        } else {
          setHeaders([]);
          toast({
            title: "Error",
            description: "Failed to load service headers.",
            variant: "destructive",
          });
        }
      } catch (error) {
        setHeaders([]);
        toast({
          title: "Error",
          description: "Failed to fetch task headers.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    fetchHeaders();
  }, [router]);

  // Delete header logic
  const openDeleteDialog = (header: ServiceTaskHeader) => {
    setHeaderToDelete(header);
    setDeleteDialogOpen(true);
  };

  const handleDeleteHeader = async () => {
    if (!headerToDelete) return;
    const headerId = headerToDelete.id;
    try {
      setDeleting((prev) => ({ ...prev, [headerId]: true }));
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/headers/${headerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      const data = await response.json();
      if (data.success || response.status === 200) {
        setHeaders((prev) => prev.filter((h) => h.id !== headerId));
        toast({
          title: "Deleted",
          description: "Header deleted successfully.",
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
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const body = {
        header_name: newHeaderName,
        created_by: currentUser?.id || currentUser?.user_id || "unknown",
        status: false,
        tasks: [],
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
        setHeaders((prev) => [...prev, data.data]);
        toast({
          title: "Added",
          description: "Header added successfully.",
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

  if (!currentUser) {
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

  if (!headers.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">
            No Service Task Headers found
          </h2>
          <Button onClick={() => setAddDialogOpen(true)}>
            Add Service Task Header
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service Task Header</DialogTitle>
                <DialogDescription>
                  Create a new Service Task Header. You can add tasks later.
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    disabled={adding}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={adding || !newHeaderName.trim()}
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    );
  }

  const completedHeaders = headers.filter((h) => h.status === true).length;
  const totalHeaders = headers.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  Service Task Headers
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
        <div className="flex justify-end mb-4">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service Task Header
          </Button>
        </div>
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Service Task Headers</CardTitle>
            <CardDescription>
              {completedHeaders} of {totalHeaders} headers completed
            </CardDescription>
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
                {headers.map((header) => (
                  <TableRow
                    key={header.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {header.header_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={header.status ? "default" : "secondary"}>
                        {header.status ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>{header.tasks?.length ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View header"
                          title="View header"
                          className="bg-blue-100 hover:bg-gray-100 focus:ring-2 focus:ring-primary focus:outline-none"
                          // onClick={() => viewHeader(header.id)}
                        >
                          <Eye className="h-4 w-4 text-gray-700" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(header)}
                          disabled={deleting[header.id]}
                          title="Delete header"
                        >
                          {deleting[header.id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
              Create a new Service Task Header. You can add tasks later.
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Header</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-destructive">
                {headerToDelete?.header_name}
              </span>
              ? This action cannot be undone and will delete all its tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting[headerToDelete?.id ?? ""]}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHeader}
              disabled={deleting[headerToDelete?.id ?? ""]}
            >
              {deleting[headerToDelete?.id ?? ""] ? (
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
