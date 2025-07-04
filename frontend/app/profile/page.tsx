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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  User,
  Settings,
  Palette,
  Shield,
  Camera,
  Save,
  ArrowLeft,
  Building,
  Calendar,
  Anchor,
} from "lucide-react";
import Link from "next/link";

// --- API utility functions ---
const BASE_URL = "http://localhost:3080/api/usersetting";

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
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  accessLevel: string;
  avatar?: string;
  address: string;
  emergencyContact?: string;
  joinDate: string;
  preferences: {
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  twoFactorAuth?: boolean;
  mode?: string;
}

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

  // Get user and token from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");
    if (!userData || !token) {
      router.push("/");
      return;
    }
    const user = JSON.parse(userData);
    // Fetch from backend
    fetchUserSettings(user.id, token)
      .then((resp) => {
        const { personal_info, preferences, security, theme } = resp.data;
        // Map API shape to UI shape
        const userProfile: UserProfile = {
          id: user.id,
          name: [personal_info.first_name, personal_info.last_name]
            .filter(Boolean)
            .join(" "),
          email: personal_info.email,
          phone: personal_info.phone,
          role: personal_info.role,
          department: personal_info.department,
          accessLevel: personal_info.role, // can map differently if needed
          avatar: personal_info.profile_picture,
          address: personal_info.address,
          emergencyContact: "", // Add if exists in backend
          joinDate: personal_info.joining_date,
          preferences: {
            theme: theme.color_theme,
            notifications: preferences.notifications.push,
            emailUpdates: preferences.notifications.email,
            language: preferences.language || "en",
          },
          twoFactorAuth: security.two_factor_authentication,
          mode: theme.theme,
        };
        setCurrentUser(userProfile);
        setFormData(userProfile);
      })
      .catch((e) => {
        // Handle error or allow fallback
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Save handler mapped to PUT
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!currentUser || !formData || !token) return;
    // Map UI -> API shape
    const updateBody = {
      push_notifications: formData.preferences?.notifications ?? true,
      email_notifications: formData.preferences?.emailUpdates ?? true,
      twoFactorAuth: formData.twoFactorAuth ?? false,
      mode: formData.mode || "light",
      colorTheme: formData.preferences?.theme || "maritime",
    };
    try {
      await updateUserSettings(currentUser.id, updateBody, token);
      setIsEditing(false);
    } catch (e) {
      // Optionally show error
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        theme: prev.preferences?.theme ?? "maritime",
        notifications: prev.preferences?.notifications ?? false,
        emailUpdates: prev.preferences?.emailUpdates ?? false,
        language: prev.preferences?.language ?? "en",
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
      </div>
    );
  }
  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="glass-effect border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-xl">
                <Anchor className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">
                  User Profile
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your account and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="professional-button-primary"
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
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card className="professional-card">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={currentUser.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback className="text-2xl">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-1">
                  {currentUser.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {currentUser.role}
                </p>
                <Badge variant="outline" className="mb-4">
                  Access Level: {currentUser.accessLevel}
                </Badge>

                <Separator className="my-4" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{currentUser.department}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Joined{" "}
                      {new Date(currentUser.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
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
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
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
                          value={formData.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          disabled={!isEditing}
                          className="form-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergency">Address</Label>
                        <Input
                          id="address"
                          value={formData.address || ""}
                          onChange={(e) =>
                            handleInputChange("address", e.target.value)
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
                          value={formData.role || ""}
                          disabled
                          className="form-input bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={formData.department || ""}
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
                        checked={formData.preferences?.notifications || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("notifications", checked)
                        }
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
                        checked={formData.preferences?.emailUpdates || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("emailUpdates", checked)
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value={formData.preferences?.language || "en"}
                        onValueChange={(value) =>
                          handlePreferenceChange("language", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="si">Sinhala</SelectItem>
                          <SelectItem value="ta">Tamil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                    <CardDescription>
                      Manage your account security and access permissions
                    </CardDescription>
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
                        <Button variant="outline">Change</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">
                            Two-Factor Authentication
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Active Sessions</h4>
                          <p className="text-sm text-muted-foreground">
                            Manage your active login sessions
                          </p>
                        </div>
                        <Button variant="outline">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <Card className="professional-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Palette className="mr-2 h-5 w-5" />
                      Appearance Settings
                    </CardTitle>
                    <CardDescription>
                      Customize the look and feel of your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">
                          Color Theme
                        </Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Choose your preferred color scheme for the application
                        </p>
                        <ColorThemeSelector
                          currentTheme={
                            formData.preferences?.theme || "maritime"
                          }
                          onThemeChange={(theme) =>
                            handlePreferenceChange("theme", theme)
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Toggle between light and dark themes
                          </p>
                        </div>
                        <ThemeToggle />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
