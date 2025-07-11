"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  ArrowLeft,
  Anchor,
  Trash2,
  Loader2,
  Plus,
  Check,
  X,
} from "lucide-react";
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

const API_BASE_URL = "http://localhost:3080/api/servicetask";

interface ServiceTask {
  id: string;
  task_id?: string;
  header_id: string;
  service_id?: string;
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
  _id?: string;
  header_id?: string;
  job_id: string;
  header_name: string;
  status: boolean | string;
  created_by: string;
  compleated_date?: string;
  compleated_time?: string;
  tasks: ServiceTask[];
  createdAt?: string;
  updatedAt?: string;
}

function isTaskCompleted(task: ServiceTask) {
  return task.status === true || task.status === "true";
}

export default function PCSTasksPage() {
  const { job_id, header_id } = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [header, setHeader] = useState<ServiceTaskHeader | null>(null);
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [taskToDelete, setTaskToDelete] = useState<ServiceTask | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completingTask, setCompletingTask] = useState<ServiceTask | null>(
    null
  );
  const [completeDate, setCompleteDate] = useState("");
  const [completeTime, setCompleteTime] = useState("");
  const [completing, setCompleting] = useState(false);

  // Add Task Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch tasks for this header on mount
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      // First fetch the header details
      const headerRes = await fetch(`${API_BASE_URL}/headers/${header_id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (headerRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }

      const headerData = await headerRes.json();
      const headerInfo = headerData.data || headerData;
      setHeader(headerInfo);

      // Then fetch tasks for this header
      const tasksRes = await fetch(
        `${API_BASE_URL}/tasks/header/${header_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (tasksRes.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }

      const tasksData = await tasksRes.json();
      // Map tasks so each has a consistent .id property
      const tasksList = Array.isArray(tasksData.data)
        ? tasksData.data.map((t: any) => ({
            ...t,
            id: t.id || t.task_id, // normalize
          }))
        : [];

      setTasks(tasksList);
    } catch (error) {
      setTasks([]);
      toast({
        title: "Error",
        description: "Failed to fetch service tasks.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    fetchTasks();
    // eslint-disable-next-line
  }, [router, job_id, header_id]);

  // Delete task logic
  const openDeleteDialog = (task: ServiceTask) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    const taskId = taskToDelete?.id || taskToDelete?.task_id || "";
    if (!taskId) {
      toast({
        title: "Error",
        description: "No task selected for deletion.",
        variant: "destructive",
      });
      return;
    }
    try {
      setDeleting((prev) => ({ ...prev, [taskId]: true }));
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
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

      if (response.ok || data.success) {
        setTasks((prev) => prev.filter((t) => (t.id || t.task_id) !== taskId));
        toast({
          title: "Deleted",
          description: "Service Task deleted successfully.",
          variant: "default",
        });
        setDeleteDialogOpen(false);
        setTaskToDelete(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete task",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    } finally {
      setDeleting((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Add Task logic
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      toast({
        title: "Error",
        description: "Task name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const body = {
        header_id,
        task_name: newTaskName,
        created_by: currentUser?.id || currentUser?.user_id || "unknown",
        status: false,
      };

      const response = await fetch(`${API_BASE_URL}/tasks`, {
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
        await fetchTasks();
        toast({
          title: "Added",
          description: "Service Task added successfully.",
          variant: "default",
        });
        setAddDialogOpen(false);
        setNewTaskName("");
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add task",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  // Mark as complete dialog logic
  const openCompleteDialog = (task: ServiceTask) => {
    setCompletingTask(task);
    // Default to now
    const now = new Date();
    setCompleteDate(now.toISOString().slice(0, 10));
    setCompleteTime(now.toTimeString().slice(0, 8));
    setCompleteDialogOpen(true);
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;
    setCompleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const body = {
        task_id: completingTask.id || completingTask.task_id,
        compleated_date: completeDate,
        compleated_time: completeTime,
      };
      const response = await fetch(`${API_BASE_URL}/tasks/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok || data.success) {
        await fetchTasks();
        toast({
          title: "Task completed",
          description: "Task marked as completed.",
          variant: "default",
        });
        setCompleteDialogOpen(false);
        setCompletingTask(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to complete task.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    } finally {
      setCompleting(false);
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

  const completedTasks = tasks.filter(isTaskCompleted).length;
  const totalTasks = tasks.length;
  const taskId = taskToDelete?.id || taskToDelete?.task_id || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/pcs/${job_id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Headers
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  {header?.header_name || "Service Tasks"}
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {header?.header_name || "Tasks"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
        <Card className="border rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-100 dark:bg-gray-800 py-4">
            <CardTitle className="text-lg">Service Tasks</CardTitle>
            <CardDescription>
              Tasks for {header?.header_name || "this header"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id || task.task_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium">
                      {task.task_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isTaskCompleted(task) ? "default" : "secondary"
                        }
                        className="cursor-default"
                      >
                        {isTaskCompleted(task) ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {isTaskCompleted(task) ? "Completed" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isTaskCompleted(task) ? (
                        <>
                          <div>{task.compleated_date}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.compleated_time}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!isTaskCompleted(task) && (
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => openCompleteDialog(task)}
                            title="Mark as Complete"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => openDeleteDialog(task)}
                          disabled={deleting[task.id || task.task_id || ""]}
                          title="Delete task"
                        >
                          {deleting[task.id || task.task_id || ""] ? (
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
              Showing {tasks.length} tasks
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Service Task</DialogTitle>
            <DialogDescription>
              Create a new Service Task for this header.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <Label>Task Name</Label>
              <Input
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Enter task name"
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
              <Button type="submit" disabled={adding || !newTaskName.trim()}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mark as Complete Dialog */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>
              Mark{" "}
              <span className="font-semibold">{completingTask?.task_name}</span>{" "}
              as complete.
              <br />
              You may edit the date/time below:
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteTask} className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={completeDate}
                onChange={(e) => setCompleteDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={completeTime}
                onChange={(e) => setCompleteTime(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCompleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={completing}>
                {completing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Mark Complete"
                )}
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
          if (!open) setTaskToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              {taskToDelete ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-destructive">
                    {taskToDelete.task_name}
                  </span>
                  ? This action cannot be undone.
                </>
              ) : (
                <span className="text-destructive">No task selected.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask}>
              {deleting[taskId] ? (
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
