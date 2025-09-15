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
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Edit,
  Trash2,
  ArrowLeft,
  Mail,
  Loader2,
  Send,
  XCircle,
  CheckCircle2,
  Inbox,
  ListChecks,
  Save,
  Info,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_ENDPOINTS = {
  EMAILS: `${API_BASE_URL}/emails`,
  TASKMAIL: `${API_BASE_URL}/taskmail`,
};

type EmailStatus = "pending" | "sent" | "failed";

interface QueuedEmail {
  id: number;
  job_id: number;
  header_name: string;
  task_name: string;
  completed_date: string;
  completed_time: string;
  job_tasks: Record<string, any>;
  status: EmailStatus;
  createdAt: string;
  updatedAt: string;
}

interface TaskMail {
  id: number;
  mail_id: string;
  job_id: string;
  subject: string;
  client_name: string;
  client_email: string;
  body: string;
  vessel_name: string;
  port_name: string;
  created_by: string;
  createdAt: string;
  updatedAt: string;
  ccs: string[];
}

export default function EmailTabsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tab, setTab] = useState<"emails" | "queued">("emails");

  // Queued tab state
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([]);
  const [queuedLoading, setQueuedLoading] = useState(false);
  const [queuedSearch, setQueuedSearch] = useState("");
  const [selectedQueuedEmail, setSelectedQueuedEmail] =
    useState<QueuedEmail | null>(null);
  const [isQueuedEditDialogOpen, setIsQueuedEditDialogOpen] = useState(false);
  const [queuedEditStatus, setQueuedEditStatus] =
    useState<EmailStatus>("pending");
  const [sendingJobId, setSendingJobId] = useState<number | null>(null);
  const [showQueuedSendInfo, setShowQueuedSendInfo] = useState<null | number>(
    null
  );

  // Emails tab state (Task Mails)
  const [taskMails, setTaskMails] = useState<TaskMail[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsSearch, setEmailsSearch] = useState("");
  const [selectedTaskMail, setSelectedTaskMail] = useState<TaskMail | null>(
    null
  );
  const [isTaskMailEditDialogOpen, setIsTaskMailEditDialogOpen] =
    useState(false);
  const [taskMailEdit, setTaskMailEdit] = useState<{
    subject: string;
    body: string;
    client_email: string;
    ccs: string;
  }>({
    subject: "",
    body: "",
    client_email: "",
    ccs: "",
  });
  const [deletingTaskMailId, setDeletingTaskMailId] = useState<string | null>(
    null
  );

  const router = useRouter();

  // --- API Helper ---
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

  // --- Loaders ---
  const loadQueuedEmails = async () => {
    try {
      setQueuedLoading(true);
      const response = await apiCall(API_ENDPOINTS.EMAILS);
      if (Array.isArray(response)) {
        setQueuedEmails(response);
      } else if (Array.isArray(response.data)) {
        setQueuedEmails(response.data);
      } else {
        setQueuedEmails([]);
      }
    } finally {
      setQueuedLoading(false);
    }
  };

  const loadTaskMails = async () => {
    try {
      setEmailsLoading(true);
      const response = await apiCall(API_ENDPOINTS.TASKMAIL);
      if (Array.isArray(response)) {
        setTaskMails(response);
      } else if (Array.isArray(response.data)) {
        setTaskMails(response.data);
      } else {
        setTaskMails([]);
      }
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      router.push("/");
      return;
    }
    setCurrentUser(JSON.parse(userData));
    loadQueuedEmails();
    loadTaskMails();
  }, [router]);

  useEffect(() => {
    if (tab === "queued") {
      loadQueuedEmails();
    } else {
      loadTaskMails();
    }
  }, [tab]);

  // --- Actions for Queued Emails ---
  const sendAllPending = async () => {
    setShowQueuedSendInfo(null);
    try {
      setQueuedLoading(true);
      const resp = await apiCall(`${API_ENDPOINTS.EMAILS}/send-pending`, {
        method: "POST",
      });
      toast({ title: "Email Sending", description: resp.message });
      loadQueuedEmails();
    } finally {
      setQueuedLoading(false);
    }
  };

  // For "Send" by job: Ask user if they want to edit, offer navigation to Emails tab.
  const handleSendJobEmails = (job_id: number) => {
    setShowQueuedSendInfo(job_id);
  };

  const sendJobEmails = async (job_id: number) => {
    setShowQueuedSendInfo(null);
    try {
      setSendingJobId(job_id);
      const resp = await apiCall(`${API_ENDPOINTS.EMAILS}/job/${job_id}/send`, {
        method: "POST",
      });
      toast({ title: "Job Email Sending", description: resp.message });
      loadQueuedEmails();
    } finally {
      setSendingJobId(null);
    }
  };

  const deleteJobEmails = async (job_id: number) => {
    if (!window.confirm(`Delete all queued emails for job_id ${job_id}?`))
      return;
    try {
      setQueuedLoading(true);
      const resp = await apiCall(`${API_ENDPOINTS.EMAILS}/job/${job_id}`, {
        method: "DELETE",
      });
      toast({ title: "Job Emails Deleted", description: resp.message });
      loadQueuedEmails();
    } finally {
      setQueuedLoading(false);
    }
  };

  const deleteQueuedEmail = async (id: number) => {
    if (!window.confirm(`Delete email #${id}?`)) return;
    try {
      setQueuedLoading(true);
      const resp = await apiCall(`${API_ENDPOINTS.EMAILS}/${id}`, {
        method: "DELETE",
      });
      toast({ title: "Email Deleted", description: resp.message });
      loadQueuedEmails();
    } finally {
      setQueuedLoading(false);
    }
  };

  const updateQueuedEmailStatus = async () => {
    if (!selectedQueuedEmail) return;
    try {
      setQueuedLoading(true);
      const resp = await apiCall(
        `${API_ENDPOINTS.EMAILS}/${selectedQueuedEmail.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status: queuedEditStatus }),
        }
      );
      toast({ title: "Email Updated", description: resp.message });
      setIsQueuedEditDialogOpen(false);
      setSelectedQueuedEmail(null);
      loadQueuedEmails();
    } finally {
      setQueuedLoading(false);
    }
  };

  // --- Actions for Task Mails ---
  const openTaskMailEditDialog = (mail: TaskMail) => {
    setSelectedTaskMail(mail);
    setTaskMailEdit({
      subject: mail.subject || "",
      body: mail.body || "",
      client_email: mail.client_email || "",
      ccs: (mail.ccs || []).join(", "),
    });
    setIsTaskMailEditDialogOpen(true);
  };

  const updateTaskMail = async () => {
    if (!selectedTaskMail) return;
    try {
      setEmailsLoading(true);
      const ccsArr =
        taskMailEdit.ccs
          .split(",")
          .map((s) => s.trim())
          .filter((s) => !!s) || [];
      const resp = await apiCall(
        `${API_ENDPOINTS.TASKMAIL}/${selectedTaskMail.mail_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            subject: taskMailEdit.subject,
            body: taskMailEdit.body,
            client_email: taskMailEdit.client_email,
            ccs: ccsArr,
          }),
        }
      );
      toast({ title: "Task Email Updated", description: resp.message });
      setIsTaskMailEditDialogOpen(false);
      setSelectedTaskMail(null);
      loadTaskMails();
    } finally {
      setEmailsLoading(false);
    }
  };

  // DELETE for TaskMail (Emails tab)
  const confirmDeleteTaskMail = (mail_id: string) => {
    setDeletingTaskMailId(mail_id);
  };

  const deleteTaskMail = async () => {
    if (!deletingTaskMailId) return;
    try {
      setEmailsLoading(true);
      const resp = await apiCall(
        `${API_ENDPOINTS.TASKMAIL}/${deletingTaskMailId}`,
        { method: "DELETE" }
      );
      toast({ title: "Task Email Deleted", description: resp.message });
      setDeletingTaskMailId(null);
      loadTaskMails();
    } finally {
      setEmailsLoading(false);
    }
  };

  // --- Search filters ---
  const filteredQueuedEmails = queuedEmails.filter(
    (email) =>
      (email.header_name || "")
        .toLowerCase()
        .includes(queuedSearch.toLowerCase()) ||
      (email.task_name || "")
        .toLowerCase()
        .includes(queuedSearch.toLowerCase()) ||
      String(email.job_id).includes(queuedSearch) ||
      (email.status || "").toLowerCase().includes(queuedSearch.toLowerCase())
  );

  const filteredTaskMails = taskMails.filter(
    (mail) =>
      (mail.subject || "").toLowerCase().includes(emailsSearch.toLowerCase()) ||
      (mail.client_email || "")
        .toLowerCase()
        .includes(emailsSearch.toLowerCase()) ||
      (mail.body || "").toLowerCase().includes(emailsSearch.toLowerCase()) ||
      (mail.job_id || "").toLowerCase().includes(emailsSearch.toLowerCase()) ||
      (mail.vessel_name || "")
        .toLowerCase()
        .includes(emailsSearch.toLowerCase())
  );

  // --- UI Helpers ---
  const statusColor = (status: EmailStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "sent":
        return "bg-green-100 text-green-800 border-green-300";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center p-2"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="sr-only sm:not-sr-only">
                  Back to Dashboard
                </span>
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  Email Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage queued & sent task emails
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none"
            >
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden sm:inline">
                {" "}
                - Level {currentUser.accessLevel}
              </span>
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Tabs: Emails first, then Queued */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setTab("emails")}
            variant={tab === "emails" ? "default" : "outline"}
            className="flex-1 flex items-center gap-2 py-2 text-xs sm:text-sm"
          >
            <ListChecks className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Emails</span>
          </Button>
          <Button
            onClick={() => setTab("queued")}
            variant={tab === "queued" ? "default" : "outline"}
            className="flex-1 flex items-center gap-2 py-2 text-xs sm:text-sm"
          >
            <Inbox className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="truncate">Queued</span>
          </Button>
        </div>

        {/* Tab Content */}
        {tab === "emails" ? (
          <Card className="professional-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Task Emails</CardTitle>
              <CardDescription>
                Edit, search, and manage sent/generated task emails.
              </CardDescription>
              <div className="mt-3">
                <Input
                  className="w-full"
                  placeholder="Search subject/client/job/vessel"
                  value={emailsSearch}
                  onChange={(e) => setEmailsSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {emailsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
              ) : filteredTaskMails.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">
                  <CheckCircle2 className="mx-auto mb-3 w-8 h-8 text-muted-foreground" />
                  No task emails found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTaskMails.map((mail) => (
                    <Card key={mail.mail_id} className="p-3 border bg-muted/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="font-medium text-base truncate">
                            {mail.subject}
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-muted-foreground">
                            <span>Client: {mail.client_name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">
                              {mail.client_email}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>Vessel: {mail.vessel_name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Port: {mail.port_name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Job: {mail.job_id}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {mail.createdAt && mail.createdAt.slice(0, 10)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 self-end">
                          <Button
                            variant="outline"
                            size="icon"
                            title="Edit Email"
                            onClick={() => openTaskMailEditDialog(mail)}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Email"
                            onClick={() => confirmDeleteTaskMail(mail.mail_id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="professional-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">
                Queued Emails
              </CardTitle>
              <CardDescription>
                View, send, update, or delete queued emails. All actions require
                valid JWT token.
              </CardDescription>
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendAllPending}
                  disabled={queuedLoading}
                  className="gap-1 order-2 sm:order-1"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Send All Pending</span>
                  <span className="sm:hidden">Send All</span>
                </Button>
                <Input
                  className="w-full order-1 sm:order-2"
                  placeholder="Search header/task/job/status"
                  value={queuedSearch}
                  onChange={(e) => setQueuedSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              {queuedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin w-8 h-8 text-primary" />
                </div>
              ) : filteredQueuedEmails.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-10">
                  <CheckCircle2 className="mx-auto mb-3 w-8 h-8 text-muted-foreground" />
                  No queued emails found.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQueuedEmails.map((email) => (
                    <Card key={email.id} className="p-3 border bg-muted/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-base truncate">
                              {email.header_name}
                            </span>
                            <Badge
                              className={`text-xs ${statusColor(email.status)}`}
                            >
                              {email.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-muted-foreground">
                            <span>Task: {email.task_name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>Job #{email.job_id}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {email.completed_date} {email.completed_time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 self-end">
                          <Button
                            variant="outline"
                            size="icon"
                            title="View / Edit"
                            onClick={() => {
                              setSelectedQueuedEmail(email);
                              setQueuedEditStatus(email.status);
                              setIsQueuedEditDialogOpen(true);
                            }}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            title="Send All For Job"
                            disabled={sendingJobId === email.job_id}
                            onClick={() => handleSendJobEmails(email.job_id)}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete Email"
                            onClick={() => deleteQueuedEmail(email.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete All For Job"
                            onClick={() => deleteJobEmails(email.job_id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        {/* Send confirmation dialog for queued emails */}
        <Dialog
          open={showQueuedSendInfo !== null}
          onOpenChange={(open) => !open && setShowQueuedSendInfo(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="text-yellow-600 h-5 w-5 flex-shrink-0" />
                <span>Do you want to send?</span>
              </DialogTitle>
            </DialogHeader>
            <div className="font-semibold mb-2 text-sm">
              If you need to change the email content, please go to the{" "}
              <b>Emails</b> tab and edit before sending.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShowQueuedSendInfo(null);
                  setTab("emails");
                }}
              >
                Go to Emails
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  if (showQueuedSendInfo !== null)
                    sendJobEmails(showQueuedSendInfo);
                }}
              >
                Send Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQueuedSendInfo(null)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Queued (queue) edit */}
        <Dialog
          open={isQueuedEditDialogOpen}
          onOpenChange={setIsQueuedEditDialogOpen}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Queued Email</DialogTitle>
            </DialogHeader>
            {selectedQueuedEmail && (
              <div className="space-y-4">
                <div>
                  <div className="font-medium">
                    Header: {selectedQueuedEmail.header_name}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Task: {selectedQueuedEmail.task_name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Job #{selectedQueuedEmail.job_id} &mdash;{" "}
                    {selectedQueuedEmail.completed_date}{" "}
                    {selectedQueuedEmail.completed_time}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Status</label>
                  <select
                    className="w-full rounded border border-gray-300 p-2 text-sm"
                    value={queuedEditStatus}
                    onChange={(e) =>
                      setQueuedEditStatus(e.target.value as EmailStatus)
                    }
                    disabled={queuedLoading}
                  >
                    <option value="pending">pending</option>
                    <option value="sent">sent</option>
                    <option value="failed">failed</option>
                  </select>
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsQueuedEditDialogOpen(false)}
                    disabled={queuedLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateQueuedEmailStatus}
                    className="w-full sm:w-auto"
                    disabled={queuedLoading}
                  >
                    {queuedLoading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Update Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Emails (task mail) edit */}
        <Dialog
          open={isTaskMailEditDialogOpen}
          onOpenChange={setIsTaskMailEditDialogOpen}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task Email</DialogTitle>
            </DialogHeader>
            {selectedTaskMail && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <div className="font-medium mb-1">Subject</div>
                  <Input
                    value={taskMailEdit.subject}
                    onChange={(e) =>
                      setTaskMailEdit((edit) => ({
                        ...edit,
                        subject: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="font-medium mb-1">Client Email</div>
                  <Input
                    value={taskMailEdit.client_email}
                    onChange={(e) =>
                      setTaskMailEdit((edit) => ({
                        ...edit,
                        client_email: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="font-medium mb-1">
                    CC Emails (comma separated)
                  </div>
                  <Input
                    value={taskMailEdit.ccs}
                    onChange={(e) =>
                      setTaskMailEdit((edit) => ({
                        ...edit,
                        ccs: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="font-medium mb-1">Body</div>
                  <textarea
                    value={taskMailEdit.body}
                    onChange={(e) =>
                      setTaskMailEdit((edit) => ({
                        ...edit,
                        body: e.target.value,
                      }))
                    }
                    className="w-full rounded border border-gray-300 p-2 text-sm min-h-[200px]"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setIsTaskMailEditDialogOpen(false)}
                    disabled={emailsLoading}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={updateTaskMail}
                    className="w-full sm:w-auto"
                    disabled={emailsLoading}
                  >
                    {emailsLoading ? (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Mail delete dialog */}
        <Dialog
          open={!!deletingTaskMailId}
          onOpenChange={(open) => !open && setDeletingTaskMailId(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="text-red-600 h-5 w-5 flex-shrink-0" />
                <span>Delete Task Email?</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mb-2 text-sm">
              Are you sure you want to delete this Task Email? This action
              cannot be undone.
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDeletingTaskMailId(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteTaskMail}
                disabled={emailsLoading}
                className="w-full sm:w-auto"
              >
                {emailsLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
