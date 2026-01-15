"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User,
  Settings,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  Building,
  Calendar,
  Anchor,
} from "lucide-react";
import Link from "next/link";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { changeUserPassword } from "@/lib/api/changePassword";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// --- API utility functions ---
const BASE_URL = `${API_BASE_URL}/usersetting`;

async function fetchUserSettings(userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function updateUserSettings(userId: string, body: any, token: string) {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- UI Types ---

interface UserProfile {
  id: string;
  personal_info: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
    role: string;
    department: string;
    joining_date: string;
    profile_picture?: string;
    access_level?: string;
  };
  preferences: {
    notifications: {
      email_notifications: boolean;
      push_notifications: boolean;
    };
    theme?: string;
  };
  security: {
    twoFactorAuth: boolean;
  };
  theme: {
    theme: string;
    color_theme: string;
  };
}

// Push Notification VAPID public key (replace with yours)
const PUBLIC_VAPID_KEY =
  "BBdcQ1e4xI1jrTBKFGvSXOeYYXjNpLpoL8ZN7FffGt4NcOyUEyfWoYrj-pNGuz8pxxLJmGp4NkMnBkWlnX7eQJ4";

// VAPID key conversion helper
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Register Service Worker
async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/worker.js");
  } else {
    alert("Service Workers not supported!");
    return null;
  }
}

// Subscribe to push
async function subscribeToPush() {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast.error("Notification permission not granted!");
    return false;
  }
  await navigator.serviceWorker.register("/worker.js");
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
  });

  await fetch(`${API_BASE_URL}/push/subscribe`, {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return true;
}

// Optional theme selector, not used in main code but retained for completeness
const ColorThemeSelector = ({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}) => {
  const themes = [
    {
      name: "Maritime Blue",
      value: "maritime",
      primary: "#003d82",
      secondary: "#0ea5e9",
    },
    {
      name: "Ocean Green",
      value: "ocean",
      primary: "#059669",
      secondary: "#10b981",
    },
    {
      name: "Sunset Orange",
      value: "sunset",
      primary: "#ea580c",
      secondary: "#f97316",
    },
    {
      name: "Royal Purple",
      value: "royal",
      primary: "#7c3aed",
      secondary: "#8b5cf6",
    },
    {
      name: "Steel Gray",
      value: "steel",
      primary: "#475569",
      secondary: "#64748b",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => (
        <div
          key={theme.value}
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            currentTheme === theme.value
              ? "border-primary"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => onThemeChange(theme.value)}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex space-x-1">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.primary }}
              />
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: theme.secondary }}
              />
            </div>
            <span className="font-medium">{theme.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Professional {theme.name.toLowerCase()} theme
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile picture upload handler
  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPic(true);
    const formDataObj = new FormData();
    formDataObj.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do not set Content-Type here!
        },
        body: formDataObj,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const publicUrl = data.data?.public_url;

      // Helper to get relative path (no query params)
      const getRelativeProfilePic = (url: string | undefined) => {
        if (!url) return "";
        let path = url;
        if (url.startsWith("http")) {
          const match = url.match(/\/uploads\/.+/);
          path = match ? match[0].replace(/^\//, "") : url;
        }
        return path.split("?")[0];
      };

      if (publicUrl) {
        const relativePic = getRelativeProfilePic(publicUrl);
        setFormData((prev) => ({
          ...prev,
          personal_info: {
            ...(prev.personal_info ??
              currentUser?.personal_info ?? {
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                dob: "",
                address: "",
                role: "",
                department: "",
                joining_date: "",
                profile_picture: "",
                access_level: "",
              }),
            profile_picture: publicUrl,
          },
        }));

        // --- Update avatar, profilePicture, and personal_info.profile_picture in localStorage ---
        const storedUserRaw = localStorage.getItem("currentUser");
        if (storedUserRaw) {
          const storedUser = JSON.parse(storedUserRaw);
          storedUser.avatar = relativePic;
          storedUser.profilePicture = publicUrl;
          if (storedUser.personal_info)
            storedUser.personal_info.profile_picture = publicUrl;
          localStorage.setItem("currentUser", JSON.stringify(storedUser));
          setCurrentUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              personal_info: {
                ...prev.personal_info,
                profile_picture: publicUrl,
              },
            };
          });
        }
        // -------------------------------------------------------------------------------

        toast.success("Profile picture uploaded!");
      } else {
        toast.error("Upload failed.");
      }
    } catch (e) {
      toast.error("Failed to upload picture.");
    } finally {
      setUploadingPic(false);
      if (e.target) e.target.value = "";
    }
  };

  // Push notification status
  const [pushStatus, setPushStatus] = useState<
    "enabled" | "disabled" | "loading"
  >("disabled");

  // Get user and token from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userData);

    // Fetch both user and settings
    Promise.all([
      fetch(`${API_BASE_URL}/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetchUserSettings(user.id, token),
    ])
      .then(([userRes, settingsRes]) => {
        const userRaw = userRes.user;
        const { preferences, security, theme } = settingsRes.data;

        const userProfile: UserProfile = {
          id: userRaw.user_id || userRaw.id,
          personal_info: {
            first_name: userRaw.first_name,
            last_name: userRaw.last_name,
            email: userRaw.email,
            phone: userRaw.contact_number,
            dob: userRaw.dob,
            address: userRaw.address || "",
            role: userRaw.role,
            department: userRaw.department,
            joining_date: userRaw.createdAt,
            profile_picture: userRaw.profile_picture,
            access_level: userRaw.access_level,
          },
          preferences: {
            notifications: {
              // Always cast to bool (for backend type safety)
              email_notifications: !!(
                preferences.notifications?.email === true ||
                preferences.notifications?.email === "true"
              ),
              push_notifications: !!(
                preferences.notifications?.push === true ||
                preferences.notifications?.push === "true"
              ),
            },
            theme: preferences.theme ?? "maritime",
          },
          security: {
            twoFactorAuth: !!security.twoFactorAuth,
          },
          theme: {
            theme: theme.theme,
            color_theme: theme.color_theme,
          },
        };

        setCurrentUser(userProfile);
        setFormData(userProfile);
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, [router]);

  // Check push notification status on mount
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        if (Notification.permission === "granted" && subscription) {
          setPushStatus("enabled");
        } else {
          setPushStatus("disabled");
        }
      });
    }
  }, []);

  // Save handler mapped to PUT
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!currentUser || !formData || !token) return;

    // Always force booleans here (for backend)!
    const push_notifications =
      !!formData.preferences?.notifications?.push_notifications;
    const email_notifications =
      !!formData.preferences?.notifications?.email_notifications;

    // Extract only the relative path for profile_picture and remove query params
    const getRelativeProfilePic = (url: string | undefined) => {
      if (!url) return "";
      let path = url;
      // If full URL, extract /uploads/... part
      if (url.startsWith("http")) {
        const match = url.match(/\/uploads\/.+/);
        path = match ? match[0].replace(/^\//, "") : url;
      }
      // Remove query params if present
      return path.split("?")[0];
    };

    const profilePicRaw =
      formData.personal_info?.profile_picture ||
      currentUser.personal_info.profile_picture ||
      "";
    const profile_picture = getRelativeProfilePic(profilePicRaw);

    const updateBody = {
      first_name:
        formData.personal_info?.first_name ||
        currentUser.personal_info.first_name,
      last_name:
        formData.personal_info?.last_name ||
        currentUser.personal_info.last_name,
      profile_picture,
      email: formData.personal_info?.email || currentUser.personal_info.email,
      contact_number:
        formData.personal_info?.phone || currentUser.personal_info.phone,
      dob: formData.personal_info?.dob || currentUser.personal_info.dob,
      push_notifications,
      email_notifications,
      colorTheme: formData.preferences?.theme || currentUser.preferences.theme,
    };
    console.log("UPDATE_BODY:", updateBody);

    try {
      await updateUserSettings(currentUser.id, updateBody, token);

      // ---- Update localStorage and state with new details ----
      const storedUserRaw = localStorage.getItem("currentUser");
      if (storedUserRaw) {
        const storedUser = JSON.parse(storedUserRaw);

        storedUser.personal_info = {
          ...storedUser.personal_info,
          ...formData.personal_info,
        };
        if (formData.preferences) {
          storedUser.preferences = {
            ...storedUser.preferences,
            ...formData.preferences,
          };
        }
        // Update the name field in localStorage.currentUser
        const firstName =
          formData.personal_info?.first_name ||
          storedUser.personal_info?.first_name ||
          "";
        const lastName =
          formData.personal_info?.last_name ||
          storedUser.personal_info?.last_name ||
          "";
        storedUser.name = `${firstName} ${lastName}`.trim();

        localStorage.setItem("currentUser", JSON.stringify(storedUser));
        setCurrentUser(storedUser);
      }

      setIsEditing(false);
      toast.success("Profile updated!");
    } catch (e) {
      console.error("Failed to update settings:", e);
      toast.error("Failed to update profile.");
    }
  };

  // Any input field handler
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof typeof prev] as object),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // Always force boolean for notification prefs!
  const handlePreferenceChange = (field: string, value: any) => {
    setFormData((prev) => {
      const notificationKey =
        field === "email" ? "email_notifications" : "push_notifications";
      if (field === "email" || field === "push") {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            notifications: {
              email_notifications:
                notificationKey === "email_notifications"
                  ? !!(value === true || value === "true")
                  : !!(
                      prev.preferences?.notifications?.email_notifications ??
                      false
                    ),
              push_notifications:
                notificationKey === "push_notifications"
                  ? !!(value === true || value === "true")
                  : !!(
                      prev.preferences?.notifications?.push_notifications ??
                      false
                    ),
            },
            theme: prev.preferences?.theme,
          },
        };
      }
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value,
          notifications: {
            email_notifications: !!(
              prev.preferences?.notifications?.email_notifications ?? false
            ),
            push_notifications: !!(
              prev.preferences?.notifications?.push_notifications ?? false
            ),
          },
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }
  if (!currentUser) return null;

  const handleChangePassword = async (current: string, next: string) => {
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (!userData || !token) return;
    const user = JSON.parse(userData);
    setPasswordLoading(true);
    setPasswordError(null);
    try {
      await changeUserPassword(user.id, current, next, token);
      toast.success("Password changed successfully!");
      setShowPasswordDialog(false);
    } catch (e: any) {
      setPasswordError(e.message || "Failed to change password.");
      toast.error("Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Push notification enable handler
  const handleEnablePushNotifications = async () => {
    setPushStatus("loading");
    const result = await subscribeToPush();
    if (result) {
      setPushStatus("enabled");
      toast.success("Subscribed successfully!");
    } else {
      setPushStatus("disabled");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Back Button */}
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

            {/* Page Title & Icon */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-primary p-2 rounded-xl flex-shrink-0">
                <Anchor className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-lg sm:text-xl text-gradient truncate">
                  User Profile
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  GLAURA
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="professional-card mb-4 lg:mb-0">
              <CardContent className="p-6 text-center flex flex-col items-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage
                      src={
                        formData.personal_info?.profile_picture ||
                        currentUser.personal_info.profile_picture ||
                        "/placeholder.svg"
                      }
                    />
                    <AvatarFallback className="text-2xl">
                      {currentUser?.personal_info?.first_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPic}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleProfilePicChange}
                        disabled={uploadingPic}
                      />
                    </>
                  )}
                  {uploadingPic && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full">
                      <div className="loading-skeleton w-10 h-10 rounded-full" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {currentUser?.personal_info?.first_name || ""}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {currentUser?.personal_info?.role || ""}
                </p>
                <Badge variant="outline" className="mb-4">
                  Access Level: {currentUser?.personal_info?.access_level || ""}
                </Badge>
                <Separator className="my-4" />
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{currentUser?.personal_info?.department || ""}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined{" "}
                      {currentUser?.personal_info?.joining_date
                        ? new Date(
                            currentUser.personal_info.joining_date
                          ).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>
                      Update your personal details and contact information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={
                            formData.personal_info?.first_name ||
                            currentUser?.personal_info?.first_name ||
                            ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "personal_info.first_name",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={
                            formData.personal_info?.last_name ||
                            currentUser?.personal_info?.last_name ||
                            ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "personal_info.last_name",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={
                            formData.personal_info?.email ||
                            currentUser?.personal_info?.email ||
                            ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "personal_info.email",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={
                            formData.personal_info?.phone ||
                            currentUser?.personal_info?.phone ||
                            ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "personal_info.phone",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Birthday</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={
                            formData.personal_info?.dob ||
                            currentUser?.personal_info?.dob ||
                            ""
                          }
                          onChange={(e) =>
                            handleInputChange(
                              "personal_info.dob",
                              e.target.value
                            )
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={
                            formData.personal_info?.role ||
                            currentUser?.personal_info?.role ||
                            ""
                          }
                          disabled
                          className="form-input bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={
                            formData.personal_info?.department ||
                            currentUser?.personal_info?.department ||
                            ""
                          }
                          disabled
                          className="form-input bg-muted"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences">
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="mr-2 h-5 w-5" />
                      Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize your application preferences and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about port calls and updates
                        </p>
                      </div>
                      <Switch
                        checked={
                          !!formData.preferences?.notifications
                            ?.push_notifications
                        }
                        onCheckedChange={async (checked) => {
                          handlePreferenceChange("push", checked);
                          if (checked) {
                            // Optionally, trigger service worker subscription
                            await handleEnablePushNotifications();
                          } else {
                            // If you wish, add unsubscribe logic here!
                            // For now, just uncheck the value and let Save send to backend.
                          }
                        }}
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email notifications for important updates
                        </p>
                      </div>
                      <Switch
                        checked={
                          !!formData.preferences?.notifications
                            ?.email_notifications
                        }
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("email", checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage Your Account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Change Password</h4>
                          <p className="text-sm text-muted-foreground">
                            Update your account password
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowPasswordDialog(true)}
                        >
                          Change
                        </Button>
                      </div>
                      <ChangePasswordDialog
                        open={showPasswordDialog}
                        onClose={() => setShowPasswordDialog(false)}
                        onChangePassword={handleChangePassword}
                        loading={passwordLoading}
                        error={passwordError || undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
              <div className="flex flex-col sm:flex-row justify-end w-full">
                <Button
                  onClick={() =>
                    isEditing ? handleSave() : setIsEditing(true)
                  }
                  className="w-full sm:w-auto professional-button-primary"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
