"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  ListChecks,
  Loader2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENDPOINTS = {
  TASKS: `${API_BASE_URL}/task`,
};

interface Task {
  id: string;
  name: string;
}

export default function TaskManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [editTaskName, setEditTaskName] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        router.push("/");
        throw new Error("Session expired. Please login again.");
      }
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(response.statusText || "Request failed");
        }
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      return await response.json();
    } catch (error: any) {
      toast({
        title: "API Error",
        description: error.message || "Failed to complete request",
        variant: "destructive",
      });
      throw error;
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await apiCall(API_ENDPOINTS.TASKS);
      // Support both array or { data: [...] }
      if (Array.isArray(response)) {
        setTasks(response.filter((task) => typeof task?.name === "string"));
      } else if (Array.isArray(response.data)) {
        setTasks(
          response.data.filter((task: any) => typeof task?.name === "string")
        );
      } else {
        setTasks([]);
      }
    } catch {
      /* handled in apiCall */
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
    loadTasks();
  }, [router]);

  const addTask = async () => {
    const name = newTaskName.trim();
    if (!name) {
      toast({
        title: "Validation Error",
        description: "Please enter a task name",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      await apiCall(API_ENDPOINTS.TASKS, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      toast({
        title: "Task Created",
        description: "Your task was created successfully.",
      });
      setNewTaskName("");
      setIsAddDialogOpen(false);
      loadTasks();
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskName(task.name);
    setIsEditDialogOpen(true);
  };

  const updateTask = async () => {
    if (!editingTask) return;
    const name = editTaskName.trim();
    if (!name) {
      toast({
        title: "Validation Error",
        description: "Please enter a task name",
        variant: "destructive",
      });
      return;
    }
    try {
      setLoading(true);
      await apiCall(`${API_ENDPOINTS.TASKS}/${editingTask.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      toast({
        title: "Task Updated",
        description: "Your task was updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingTask(null);
      setEditTaskName("");
      loadTasks();
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (task: Task) => {
    if (!window.confirm(`Delete task "${task.name}"?`)) return;
    try {
      setLoading(true);
      await apiCall(`${API_ENDPOINTS.TASKS}/${task.id}`, { method: "DELETE" });
      toast({
        title: "Task Deleted",
        description: `Task "${task.name}" deleted successfully.`,
      });
      loadTasks();
    } finally {
      setLoading(false);
    }
  };

  // Defensive: tasks may have undefined/missing name
  const filteredTasks = tasks.filter((task) =>
    (task?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
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
                <ListChecks className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Task Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage your tasks
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate"
            >
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <Card className="professional-card mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>Tasks</span>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="professional-button-primary"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Task name"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addTask}
                      className="professional-button-primary w-full sm:w-auto"
                      disabled={loading || !newTaskName.trim()}
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
            <CardDescription>
              You can add, edit, or delete tasks. All changes are saved
              instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80"
              />
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">
                <CheckCircle className="mx-auto mb-3 w-8 h-8 text-muted-foreground" />
                No tasks found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border bg-muted/60"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-base truncate block">
                        {task?.name ?? ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(task)}
                        aria-label="Edit Task"
                        className="flex-shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task)}
                        aria-label="Delete Task"
                        className="flex-shrink-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editTaskName}
              onChange={(e) => setEditTaskName(e.target.value)}
              placeholder="Task name"
              autoFocus
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={updateTask}
              className="professional-button-primary w-full sm:w-auto"
              disabled={loading || !editTaskName.trim()}
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              Update Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
