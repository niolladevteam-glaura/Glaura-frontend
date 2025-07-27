"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  MessageSquare,
  Plus,
  Search,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Anchor,
  Filter,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface FeedbackResponse {
  id: string;
  message: string;
  staffMember: string;
  createdAt: string;
}

interface FeedbackItem {
  id: string;
  type: "feedback" | "complaint";
  created_by: string;
  created_by_name: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  assignedToId?: number;
  relatedVendor: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  responses: FeedbackResponse[];
}

interface UserType {
  id: number;
  user_id?: string;
  userId?: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface VendorType {
  id: number;
  vendor_id?: string;
  name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const apiCall = async (
  endpoint: string,
  options: RequestInit = {},
  router?: any
) => {
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
      if (router) router.push("/");
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

    try {
      return await response.json();
    } catch (e) {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};

export default function FeedbackManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<FeedbackItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // New Form State
  const [newType, setNewType] = useState<"feedback" | "complaint">("feedback");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(
    "low"
  );
  const [newAssignedTo, setNewAssignedTo] = useState<string>("none");
  const [newRelatedVendor, setNewRelatedVendor] = useState<string>("none");
  const [users, setUsers] = useState<UserType[]>([]);
  const [vendors, setVendors] = useState<VendorType[]>([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // --- Response state for Add Response ---
  const [responseMessage, setResponseMessage] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState<string | null>(null);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);
  const [deleteResponseIdLoading, setDeleteResponseIdLoading] = useState<
    string | null
  >(null);

  const [deleteFeedbackIdLoading, setDeleteFeedbackIdLoading] = useState<
    string | null
  >(null);
  const [deleteFeedbackError, setDeleteFeedbackError] = useState<string | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackItem | null>(
    null
  );
  const dialogCancelButtonRef = useRef<HTMLButtonElement>(null);

  // --- Update Feedback/Complaint State ---
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Update Form Fields
  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<"feedback" | "complaint">(
    "feedback"
  );
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high">(
    "low"
  );
  const [editStatus, setEditStatus] = useState<
    "open" | "in_progress" | "resolved"
  >("open");
  const [editAssignedTo, setEditAssignedTo] = useState<string>("none");
  const [editRelatedVendor, setEditRelatedVendor] = useState<string>("none");

  // --- Open Update Form with Current Data ---
  const openUpdateForm = (item: FeedbackItem) => {
    setEditId(item.id);
    setEditType(item.type);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditPriority(item.priority);
    setEditStatus(item.status);
    setEditAssignedTo(
      item.assignedToId ? item.assignedToId.toString() : "none"
    );
    setEditRelatedVendor(
      item.relatedVendor ? item.relatedVendor.toString() : "none"
    );
    setShowUpdateForm(true);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch users and vendors for dropdowns with token
  useEffect(() => {
    if (showNewForm || showUpdateForm) {
      apiCall(`${API_BASE_URL}/user`, {}, router)
        .then((data) => {
          if (data?.data) setUsers(data.data);
        })
        .catch(() => setUsers([]));

      apiCall(`${API_BASE_URL}/vendor`, {}, router)
        .then((data) => {
          if (data?.data) setVendors(data.data);
        })
        .catch(() => setVendors([]));
    }
  }, [showNewForm, showUpdateForm, router, API_BASE_URL]);

  // ----------- FETCH FEEDBACKS/COMPLAINTS FROM API -----------
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userData);
    setCurrentUser(user);

    apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
      .then((data) => {
        if (Array.isArray(data)) {
          // Transform API data to FeedbackItem[]
          const mapped: FeedbackItem[] = data.map((item) => ({
            id: item.fc_id,
            type: item.type,
            created_by: item.created_by,
            created_by_name: item.creator?.first_name || "-",
            title: item.title,
            description: item.description,
            priority: item.priority,
            status: item.status,
            assignedTo: item.assignee?.first_name || "-",
            assignedToId: item.assigned_to,
            relatedVendor: item.related_vendor || 0,
            createdBy: item.creator?.first_name || "-",
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            responses: Array.isArray(item.responses)
              ? item.responses.map((r: any) => ({
                  id: r.response_id,
                  message: r.message,
                  staffMember: r.responder_id,
                  createdAt: r.createdAt,
                }))
              : [],
          }));
          setFeedbackItems(mapped);
          setFilteredItems(mapped);
        } else {
          setFeedbackItems([]);
          setFilteredItems([]);
        }
      })
      .catch(() => {
        setFeedbackItems([]);
        setFilteredItems([]);
      });
  }, [router]);

  useEffect(() => {
    let filtered = feedbackItems;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.created_by_name || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    setFilteredItems(filtered);
  }, [searchTerm, statusFilter, typeFilter, feedbackItems]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    router.push("/");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  // Handle submit new feedback/complaint
  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const payload: any = {
        type: newType,
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        status: "open",
        created_by: currentUser.pkId,
      };
      if (newAssignedTo && newAssignedTo !== "none")
        payload.assigned_to = newAssignedTo;
      if (newRelatedVendor && newRelatedVendor !== "none")
        payload.related_vendor = newRelatedVendor;

      await apiCall(
        `${API_BASE_URL}/fc/feedbacks`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        router
      );

      setSubmitSuccess("Feedback/Complaint created successfully!");
      setShowNewForm(false);

      // Refetch feedbacks after submit
      apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: FeedbackItem[] = data.map((item) => ({
              id: item.fc_id,
              type: item.type,
              created_by: item.created_by,
              created_by_name: item.creator?.first_name || "-",
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              assignedTo: item.assignee?.first_name || "-",
              assignedToId: item.assigned_to,
              relatedVendor: item.related_vendor || 0,
              createdBy: item.creator?.first_name || "-",
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              responses: Array.isArray(item.responses)
                ? item.responses.map((r: any) => ({
                    id: r.response_id,
                    message: r.message,
                    staffMember: r.responder_id,
                    createdAt: r.createdAt,
                  }))
                : [],
            }));
            setFeedbackItems(mapped);
            setFilteredItems(mapped);
          }
        })
        .catch(() => {}); // swallow error, not critical

      setNewType("feedback");
      setNewTitle("");
      setNewDescription("");
      setNewPriority("low");
      setNewAssignedTo("none");
      setNewRelatedVendor("none");
    } catch (error: any) {
      setSubmitError(error.message || "Error occurred. Try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ----------- ADD RESPONSE HANDLER -------------
  const handleAddResponse = async () => {
    if (!selectedItem) return;
    if (!responseMessage.trim()) {
      setResponseError("Response message is required.");
      return;
    }
    setResponseLoading(true);
    setResponseError(null);
    setResponseSuccess(null);

    try {
      // Use currentUser for responder_id
      const responderId = currentUser.pkId;
      if (!responderId) {
        setResponseError("Missing user id.");
        setResponseLoading(false);
        return;
      }
      await apiCall(
        `${API_BASE_URL}/fc/feedbacks/${selectedItem.id}/responses`,
        {
          method: "POST",
          body: JSON.stringify({
            message: responseMessage,
            responder_id: responderId,
            is_public: true,
            parent_response_id: null,
          }),
        },
        router
      );
      setResponseSuccess("Response added successfully.");
      setResponseMessage("");

      // Refresh responses for this feedback
      apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: FeedbackItem[] = data.map((item) => ({
              id: item.fc_id,
              type: item.type,
              created_by: item.created_by,
              created_by_name: item.creator?.first_name || "-",
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              assignedTo: item.assignee?.first_name || "-",
              assignedToId: item.assigned_to,
              relatedVendor: item.related_vendor || 0,
              createdBy: item.creator?.first_name || "-",
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              responses: Array.isArray(item.responses)
                ? item.responses.map((r: any) => ({
                    id: r.response_id,
                    message: r.message,
                    staffMember: r.responder_id,
                    createdAt: r.createdAt,
                  }))
                : [],
            }));
            setFeedbackItems(mapped);
            setFilteredItems(mapped);
            // Update selectedItem to fresh data
            const updated = mapped.find((f) => f.id === selectedItem.id);
            if (updated) setSelectedItem(updated);
          }
        })
        .catch(() => {}); // swallow error
    } catch (err: any) {
      setResponseError(err.message || "Error adding response.");
    } finally {
      setResponseLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      // Find the feedback item to get original created_by and ids
      const original = feedbackItems.find((item) => item.id === editId);
      if (!original) {
        setUpdateError("Could not find feedback/complaint to update.");
        setUpdateLoading(false);
        return;
      }
      const payload: any = {
        fc_id: editId,
        type: editType,
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        created_by: original.created_by, // Should use the original created_by
      };
      // Use assigned_to from the form (editAssignedTo)
      if (editAssignedTo && editAssignedTo !== "none") {
        payload.assigned_to = Number(editAssignedTo);
      }
      if (editRelatedVendor && editRelatedVendor !== "none") {
        payload.related_vendor = Number(editRelatedVendor);
      }
      await apiCall(
        `${API_BASE_URL}/fc/feedbacks/${editId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
        router
      );
      setUpdateSuccess("Feedback/Complaint updated successfully!");
      setShowUpdateForm(false);

      // Refetch feedbacks
      apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: FeedbackItem[] = data.map((item) => ({
              id: item.fc_id,
              type: item.type,
              created_by: item.created_by,
              created_by_name: item.creator?.first_name || "-",
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              assignedTo: item.assignee?.first_name || "-",
              assignedToId: item.assigned_to,
              relatedVendor: item.related_vendor || 0,
              createdBy: item.creator?.first_name || "-",
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              responses: Array.isArray(item.responses)
                ? item.responses.map((r: any) => ({
                    id: r.response_id,
                    message: r.message,
                    staffMember: r.responder_id,
                    createdAt: r.createdAt,
                  }))
                : [],
            }));
            setFeedbackItems(mapped);
            setFilteredItems(mapped);
            // Update selectedItem to fresh data
            if (editId) {
              const updated = mapped.find((f) => f.id === editId);
              if (updated) setSelectedItem(updated);
            }
          }
        })
        .catch(() => {});
    } catch (err: any) {
      setUpdateError(err.message || "Error updating feedback/complaint.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ----------- DELETE RESPONSE HANDLER -------------
  const handleDeleteResponse = async (responseId: string) => {
    if (!selectedItem) return;
    setDeleteResponseIdLoading(responseId);
    setResponseError(null);

    try {
      await apiCall(
        `${API_BASE_URL}/fc/responses/${responseId}`,
        {
          method: "DELETE",
        },
        router
      );
      // Refresh responses for this feedback
      apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: FeedbackItem[] = data.map((item) => ({
              id: item.fc_id,
              type: item.type,
              created_by: item.created_by,
              created_by_name: item.creator?.first_name || "-",
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              assignedTo: item.assignee?.first_name || "-",
              assignedToId: item.assigned_to,
              relatedVendor: item.related_vendor || 0,
              createdBy: item.creator?.first_name || "-",
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              responses: Array.isArray(item.responses)
                ? item.responses.map((r: any) => ({
                    id: r.response_id,
                    message: r.message,
                    staffMember: r.responder_id,
                    createdAt: r.createdAt,
                  }))
                : [],
            }));
            setFeedbackItems(mapped);
            setFilteredItems(mapped);
            // Update selectedItem to fresh data
            const updated = mapped.find((f) => f.id === selectedItem.id);
            if (updated) setSelectedItem(updated);
          }
        })
        .catch(() => {});
    } catch (err: any) {
      setResponseError(err.message || "Error deleting response.");
    } finally {
      setDeleteResponseIdLoading(null);
    }
  };

  // ----------- DELETE FEEDBACK HANDLER -------------
  const openDeleteDialog = (item: FeedbackItem) => {
    setFeedbackToDelete(item);
    setDeleteFeedbackError(null);
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setFeedbackToDelete(null);
    setDeleteFeedbackError(null);
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    setDeleteFeedbackIdLoading(feedbackToDelete.id);
    setDeleteFeedbackError(null);
    try {
      await apiCall(
        `${API_BASE_URL}/fc/feedbacks/${feedbackToDelete.id}`,
        {
          method: "DELETE",
        },
        router
      );
      // Refresh feedback list
      apiCall(`${API_BASE_URL}/fc/feedbacks`, {}, router)
        .then((data) => {
          if (Array.isArray(data)) {
            const mapped: FeedbackItem[] = data.map((item) => ({
              id: item.fc_id,
              type: item.type,
              created_by: item.created_by,
              created_by_name: item.creator?.first_name || "-",
              title: item.title,
              description: item.description,
              priority: item.priority,
              status: item.status,
              assignedTo: item.assignee?.first_name || "-",
              assignedToId: item.assigned_to,
              relatedVendor: item.related_vendor || 0,
              createdBy: item.creator?.first_name || "-",
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              responses: Array.isArray(item.responses)
                ? item.responses.map((r: any) => ({
                    id: r.response_id,
                    message: r.message,
                    staffMember: r.responder_id,
                    createdAt: r.createdAt,
                  }))
                : [],
            }));
            setFeedbackItems(mapped);
            setFilteredItems(mapped);
            if (selectedItem?.id === feedbackToDelete.id) setSelectedItem(null);
          }
        })
        .catch(() => {});
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteFeedbackError(
        err.message || "Error deleting feedback/complaint."
      );
    } finally {
      setDeleteFeedbackIdLoading(null);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <div className="flex items-center space-x-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Anchor className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Feedback & Complaints
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customer feedback management
                  </p>
                </div>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 whitespace-nowrap"
            >
              {currentUser.name} - Level {currentUser.accessLevel}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Total Items
                  </span>
                  <span className="font-medium">{feedbackItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Open
                  </span>
                  <span className="font-medium text-red-600">
                    {
                      feedbackItems.filter((item) => item.status === "open")
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    In Progress
                  </span>
                  <span className="font-medium text-yellow-600">
                    {
                      feedbackItems.filter(
                        (item) => item.status === "in_progress"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Resolved
                  </span>
                  <span className="font-medium text-green-600">
                    {
                      feedbackItems.filter((item) => item.status === "resolved")
                        .length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => setShowNewForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">
                    New Feedback/Complaint
                  </span>
                  <span className="xs:hidden">New</span>
                </Button>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Advanced Filters</span>
                  <span className="xs:hidden">Filters</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">
                  Feedback & Complaint Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search feedback, complaints...."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-3 md:space-y-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                          <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-base md:text-lg">
                            {item.title}
                          </h3>
                          <div className="flex flex-wrap items-center space-x-2 mt-1">
                            <Badge
                              variant={
                                item.type === "complaint"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {item.type.charAt(0).toUpperCase() +
                                item.type.slice(1)}
                            </Badge>
                            <Badge variant={getPriorityColor(item.priority)}>
                              {item.priority} priority
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(item.status)}
                              <span className="text-sm capitalize">
                                {item.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-2 mt-2 md:mt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setResponseMessage("");
                            setResponseError(null);
                            setResponseSuccess(null);
                          }}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Feedback/Complaint"
                          onClick={() => openDeleteDialog(item)}
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 md:gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created By
                        </p>
                        <p className="font-medium">{item.created_by_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned To
                        </p>
                        <p className="font-medium">{item.assignedTo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Created
                        </p>
                        <p className="font-medium">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2 md:mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Created by {item.createdBy}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Updated{" "}
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8 md:py-12">
                    <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No items found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchTerm ||
                      statusFilter !== "all" ||
                      typeFilter !== "all"
                        ? "Try adjusting your search criteria"
                        : "No feedback or complaints logged yet"}
                    </p>
                    <Button onClick={() => setShowNewForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Detail Modal */}

        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-2">
                  <h2 className="text-xl md:text-2xl font-bold">
                    {selectedItem.title}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => openUpdateForm(selectedItem)}
                      className="self-end"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedItem(null)}
                      className="self-end"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="flex flex-wrap">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="responses">
                      Responses ({selectedItem.responses.length})
                    </TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Feedback/Complaint Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
                          <div>
                            <Label>Type</Label>
                            <p className="capitalize">{selectedItem.type}</p>
                          </div>
                          <div>
                            <Label>Priority</Label>
                            <p className="capitalize">
                              {selectedItem.priority}
                            </p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <p className="capitalize">
                              {selectedItem.status.replace("_", " ")}
                            </p>
                          </div>
                          <div>
                            <Label>Assigned To</Label>
                            <p>{selectedItem.assignedTo}</p>
                          </div>
                        </div>
                        <div>
                          <Label>Created By</Label>
                          <p>{selectedItem.created_by_name}</p>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <p className="text-gray-600 dark:text-gray-300">
                            {selectedItem.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-4">
                    {selectedItem.responses.map((response) => (
                      <Card key={response.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-2">
                              <span className="font-medium">
                                {response.staffMember}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(response.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">
                              {response.message}
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteResponse(response.id)}
                              disabled={deleteResponseIdLoading === response.id}
                              title="Delete Response"
                            >
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {selectedItem.responses.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No responses yet
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="actions">
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Response</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="response">Response Message</Label>
                          <Textarea
                            id="response"
                            placeholder="Enter your response..."
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            disabled={responseLoading}
                          />
                        </div>
                        {responseError && (
                          <p className="text-red-600 text-sm">
                            {responseError}
                          </p>
                        )}
                        {responseSuccess && (
                          <p className="text-green-600 text-sm">
                            {responseSuccess}
                          </p>
                        )}
                        <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
                          <Button
                            onClick={handleAddResponse}
                            disabled={
                              responseLoading || !responseMessage.trim()
                            }
                          >
                            {responseLoading ? "Adding..." : "Add Response"}
                          </Button>
                          <Button variant="outline">Update Status</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Update Feedback/Complaint Dialog */}
        {showUpdateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
            <form
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 md:p-6 shadow-xl"
              onSubmit={handleUpdateSubmit}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Update Feedback/Complaint</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowUpdateForm(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={editType}
                    onValueChange={(v) =>
                      setEditType(v as "feedback" | "complaint")
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Enter title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    placeholder="Enter description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editPriority}
                    onValueChange={(v) =>
                      setEditPriority(v as "low" | "medium" | "high")
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editStatus}
                    onValueChange={(v) =>
                      setEditStatus(v as "open" | "in_progress" | "resolved")
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-assigned_to">Assign To (optional)</Label>
                  <Select
                    value={editAssignedTo}
                    onValueChange={setEditAssignedTo}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id?.toString()}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-related_vendor">
                    Related Vendor (optional)
                  </Label>
                  <Select
                    value={editRelatedVendor}
                    onValueChange={setEditRelatedVendor}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem
                          key={vendor.id}
                          value={vendor.id?.toString()}
                        >
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {updateError && (
                <p className="text-red-600 text-sm mt-4">{updateError}</p>
              )}
              {updateSuccess && (
                <p className="text-green-600 text-sm mt-4">{updateSuccess}</p>
              )}
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* New Feedback/Complaint Dialog */}
        {showNewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
            <form
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 md:p-6 shadow-xl"
              onSubmit={handleSubmitNew}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">New Feedback/Complaint</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewForm(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) =>
                      setNewType(v as "feedback" | "complaint")
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newPriority}
                    onValueChange={(v) =>
                      setNewPriority(v as "low" | "medium" | "high")
                    }
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assigned_to">Assign To (optional)</Label>
                  <Select
                    value={newAssignedTo}
                    onValueChange={setNewAssignedTo}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id?.toString()}>
                          {user.first_name} {user.last_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="related_vendor">
                    Related Vendor (optional)
                  </Label>
                  <Select
                    value={newRelatedVendor}
                    onValueChange={setNewRelatedVendor}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {vendors.map((vendor) => (
                        <SelectItem
                          key={vendor.id}
                          value={vendor.id?.toString()}
                        >
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {submitError && (
                <p className="text-red-600 text-sm mt-4">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-green-600 text-sm mt-4">{submitSuccess}</p>
              )}

              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={loadingSubmit}>
                  {loadingSubmit ? "Submitting..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        )}
        {showDeleteDialog && feedbackToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-3 text-red-700 dark:text-red-400 flex items-center gap-2">
                <Trash2 className="h-6 w-6" /> Delete Feedback/Complaint
              </h2>
              <p className="mb-2 text-gray-800 dark:text-gray-200">
                Are you sure you want to delete this feedback/complaint? This
                action cannot be undone.
              </p>
              <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-900 rounded">
                <span className="font-semibold">{feedbackToDelete.title}</span>
                <div className="text-xs text-gray-500">
                  Type: {feedbackToDelete.type}, Priority:{" "}
                  {feedbackToDelete.priority}
                </div>
              </div>
              {deleteFeedbackError && (
                <p className="text-red-600 text-sm mb-2">
                  {deleteFeedbackError}
                </p>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={deleteFeedbackIdLoading === feedbackToDelete.id}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={handleDeleteFeedback}
                  disabled={deleteFeedbackIdLoading === feedbackToDelete.id}
                >
                  {deleteFeedbackIdLoading === feedbackToDelete.id
                    ? "Deleting..."
                    : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
