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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  UserCheck,
  UserX,
  LogOut,
  Anchor,
  Shield,
  Calendar,
  Activity,
  ArrowLeft,
  Menu,
  X,
  House,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { userApi } from "@/lib/api";
import { ErrorAlertDialog } from "@/components/ErrorAlertDialog";

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  accessLevel: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  phoneNumber: string;
  emergencyContact: string;
  dob?: string;
  profilePic?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  user?: T;
}

interface ApiUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  access_level: string;
  department: string;
  status: boolean;
  contact_number?: string;
  createdAt?: string;
  lastLogin?: string;
  dob?: string;
  profile_picture?: string;
  permissions?: Record<string, boolean>;
}

// Add this interface at the top of the file after the existing User interface
interface Privilege {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PermissionResponse {
  success: boolean;
  message?: string;
  userPermissions?: Record<string, boolean>;
}

type ApiPermission = {
  id: string;
  key: string;
  description: string;
  module: string;
};

type ApiAccessLevel = {
  id: string;
  name: string;
  description: string;
  Permissions: ApiPermission[];
};

export default function UserManagement() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editPrivileges, setEditPrivileges] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState("");
  const [accessLevels, setAccessLevels] = useState<ApiAccessLevel[]>([]);
  const [accessLevelLoading, setAccessLevelLoading] = useState(true);
  const [selectedAccessLevelId, setSelectedAccessLevelId] =
    useState<string>("");
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<any>(null);

  // Add this right after the state declarations
  const handleAddUserClick = () => {
    console.log("Add User button clicked!");
    console.log("Current dialog state:", isCreateDialogOpen);
    setIsCreateDialogOpen(true);
    console.log("Dialog state after setting:", true);
  };

  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Auth/user setup
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);
  }, [router]);

  // Get access levels
  useEffect(() => {
    if (!API_URL) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setAccessLevelLoading(false);
      return;
    }

    fetch(`${API_URL}/permission/access-level`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.accessLevels)) {
          setAccessLevels(data.accessLevels);
        }
      })
      .catch((err) => {
        // handle error, optionally set error state
        console.error("Failed to fetch access levels:", err);
      })
      .finally(() => setAccessLevelLoading(false));
  }, [API_URL]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await userApi.getAllUsers();
        const apiResponse = response as ApiResponse<ApiUser[]>;

        if (!apiResponse.success || !apiResponse.data) {
          throw new Error(apiResponse.message || "Failed to load users");
        }

        const transformedUsers = await Promise.all(
          apiResponse.data.map(async (apiUser: ApiUser) => {
            // Fetch permissions for each user using the new endpoint
            let permissions: string[] = [];
            // try {
            //   const permResponse = (await userApi.getUserPermissions(
            //     apiUser.user_id
            //   )) as PermissionResponse;
            //   if (permResponse.success && permResponse.userPermissions) {
            //     permissions = Object.entries(permResponse.userPermissions)
            //       .filter(([key, value]) => value === true)
            //       .map(([key]) => key);
            //   }
            // } catch (error) {
            //   console.error(
            //     "Failed to load permissions for user:",
            //     apiUser.user_id,
            //     error
            //   );
            // }

            return {
              id: apiUser.user_id,
              username: apiUser.email.split("@")[0],
              name: `${apiUser.first_name} ${apiUser.last_name}`,
              email: apiUser.email,
              role: apiUser.role,
              department: apiUser.department || "Other",
              accessLevel: apiUser.access_level,
              isActive: apiUser.status,
              lastLogin: apiUser.lastLogin || "",
              createdAt: apiUser.createdAt || new Date().toISOString(),
              permissions,
              phoneNumber: apiUser.contact_number || "",
              emergencyContact: "",
              dob: apiUser.dob || "",
              profilePic: apiUser.profile_picture || "",
            };
          })
        );

        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (error) {
        console.error("Failed to load users:", error);
        setUsers([]);
        setFilteredUsers([]);
      }
    };

    loadUsers();
  }, [router]);

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (user) => user?.department?.toLowerCase() === departmentFilter
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user?.isActive : !user?.isActive
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, departmentFilter, statusFilter, users]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      const newStatus = !user.isActive;
      const response = await userApi.toggleUserStatus(userId, newStatus);
      const apiResponse = response as ApiResponse<{}>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to toggle status");
      }

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u))
      );
    } catch (error) {
      console.error("Failed to toggle user status:", error);
    }
  };

  // ========== UPDATED VIEW USER FUNCTION ==========
  const handleViewUser = async (userId: string) => {
    try {
      const response = await userApi.getUserById(userId);
      const apiResponse = response as ApiResponse<ApiUser>;

      if (!apiResponse.success || !apiResponse.user) {
        throw new Error(apiResponse.message || "User not found");
      }

      const apiUser = apiResponse.user;

      // Convert permissions object to array of keys
      const permissions = apiUser.permissions
        ? Object.entries(apiUser.permissions)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        : [];

      setSelectedUser({
        id: apiUser.user_id,
        username: apiUser.email.split("@")[0],
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        email: apiUser.email,
        role: apiUser.role,
        department: apiUser.department || "Other",
        accessLevel: apiUser.access_level,
        isActive: apiUser.status,
        lastLogin: apiUser.lastLogin || "",
        createdAt: apiUser.createdAt || new Date().toISOString(),
        permissions,
        phoneNumber: apiUser.contact_number || "",
        emergencyContact: "",
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const [loading, setLoading] = useState(false);

  //  Create User
  const createUser = async () => {
    try {
      if (!newUser.username || !newUser.name || !newUser.email) {
        alert(
          "Please fill in all required fields (Username, Full Name, Email)"
        );
        return;
      }

      const [firstName, ...lastNameParts] = newUser.name.split(" ");
      const lastName = lastNameParts.join(" ");

      const userData = {
        first_name: firstName,
        last_name: lastName,
        contact_number: newUser.phoneNumber || "",
        dob: newUser.dob || "",
        email: newUser.email || "",
        password: "TemporaryPassword123!",
        role: newUser.role || "staff",
        access_level_id: selectedAccessLevelId, // <-- key update!
        department: newUser.department || "",
      };

      const response = await userApi.createUser(userData);
      const apiResponse = response as ApiResponse<ApiUser>;

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error(apiResponse.message || "Failed to create user");
      }

      const apiUser = apiResponse.data;
      const createdUser: User = {
        id: apiUser.user_id,
        username: newUser.username!,
        name: newUser.name!,
        email: newUser.email!,
        role: userData.role,
        department: userData.department,
        accessLevel: userData.access_level_id,
        isActive: true,
        lastLogin: "",
        createdAt: new Date().toISOString(),
        permissions: selectedPrivileges,
        phoneNumber: userData.contact_number,
        emergencyContact: newUser.emergencyContact || "",
        dob: newUser.dob,
      };

      setUsers([...users, createdUser]);
      setFilteredUsers([...filteredUsers, createdUser]);
      setNewUser({});
      setSelectedPrivileges([]);
      setIsCreateDialogOpen(false);
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.log(error);
      setErrorDialogMsg(error?.message || "Failed to create user");
      setErrorDialogOpen(true);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700";
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "A":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "B":
      case "C":
      case "D":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "E":
      case "F":
      case "G":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Update user
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      // Split full name into first and last
      const [firstName, ...lastNameParts] = editingUser.name.split(" ");
      const lastName = lastNameParts.join(" ");

      // Build permissions object (id: boolean) from editPrivileges array
      const permissionsObj: Record<string, boolean> = {};
      editPrivileges.forEach((key) => {
        permissionsObj[key] = true;
      });

      // Prepare API payload (matches your backend API requirements)
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: editingUser.email,
        contact_number: editingUser.phoneNumber || "",
        role: editingUser.role || "staff",
        access_level: editingUser.accessLevel || "R",
        department: editingUser.department || "Other",
        status: editingUser.isActive,
        permissions: permissionsObj, // <-- Correct format for backend!
        dob: editingUser.dob || "",
      };

      // Call your API
      const response = await userApi.updateUser(editingUser.id, userData);
      const apiResponse = response as ApiResponse<{}>;

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Failed to update user");
      }

      // Update local state (with new permissions array)
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? { ...editingUser, permissions: editPrivileges }
          : u
      );

      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setEditPrivileges([]);
      alert("User updated successfully!");
    } catch (error: any) {
      setErrorDialogMsg(
        error?.message ||
          (error instanceof Error ? error.message : "Unknown error")
      );
      setErrorDialogOpen(true);
    }
  };

  const handleEditClick = async (user: User) => {
    try {
      const token = localStorage.getItem("token");
      // Fetch the latest user data from the API
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (!data.success || !data.user) throw new Error("User not found");

      const apiUser = data.user;

      // Map API user to your User interface
      const editingUserObj: User = {
        id: apiUser.user_id,
        username: apiUser.email.split("@")[0],
        name: `${apiUser.first_name} ${apiUser.last_name}`,
        email: apiUser.email,
        role: apiUser.role,
        department: apiUser.department || "Other",
        accessLevel: apiUser.access_level_id, // use this for selection
        isActive: apiUser.status,
        lastLogin: apiUser.lastLogin || "",
        createdAt: apiUser.createdAt || new Date().toISOString(),
        permissions: [],
        phoneNumber: apiUser.contact_number || "",
        emergencyContact: "",
        dob: apiUser.dob || "",
        profilePic: apiUser.profile_picture || "",
      };

      setEditingUser(editingUserObj);

      // Fetch the access level details and permissions
      const accessLevelRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/permission/access-level/${apiUser.access_level_id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const accessLevelData = await accessLevelRes.json();
      if (accessLevelData.success && accessLevelData.accessLevel) {
        setSelectedAccessLevel(accessLevelData.accessLevel);
        setEditPrivileges(
          accessLevelData.accessLevel.Permissions.map((p: any) => p.key)
        );
      } else {
        setSelectedAccessLevel(null);
        setEditPrivileges([]);
      }

      setIsEditDialogOpen(true);
    } catch (err) {
      setSelectedAccessLevel(null);
      setEditPrivileges([]);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      console.error("Failed to fetch user or access level details", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ErrorAlertDialog
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        message={errorDialogMsg}
        title="Error"
      />
      {/* Header */}
      <header className="glass-effect border-b px-4 py-3 sm:px-6 sm:py-4 sticky top-0 z-50 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Back Button */}
            <Link href="/dashboard" className="flex-shrink-0 hidden md:block">
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
                  User Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  Manage System Users and Permissions
                </p>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <ThemeToggle />
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 px-2 py-1 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none"
            >
              <span className="truncate">{currentUser.name}</span>
              <span className="hidden xs:inline">
                {" "}
                - Level {currentUser.accessLevel}
              </span>
            </Badge>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <ThemeToggle />
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Users
              </CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {users.filter((u) => !u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Deactivated accounts
              </p>
            </CardContent>
          </Card>

          <Card className="sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(users.map((u) => u.department)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Active departments
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span>User Directory</span>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddUserClick}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle>Create New User</DialogTitle>
                        <DialogDescription>
                          Add a new user to the system
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newUser.username || ""}
                          onChange={(e) =>
                            setNewUser({ ...newUser, username: e.target.value })
                          }
                          placeholder="john.doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={newUser.name || ""}
                          onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email || ""}
                          onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                          }
                          placeholder="john@greeklanka.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={newUser.phoneNumber || ""}
                          onChange={(e) =>
                            setNewUser({
                              ...newUser,
                              phoneNumber: e.target.value,
                            })
                          }
                          placeholder="+94-77-123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          value={newUser.role || ""}
                          onChange={(e) =>
                            setNewUser({ ...newUser, role: e.target.value })
                          }
                          placeholder="Operations Executive"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={newUser.department || ""}
                          onValueChange={(value) =>
                            setNewUser({ ...newUser, department: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Management">
                              Management
                            </SelectItem>
                            <SelectItem value="Finance ">Finance</SelectItem>
                            <SelectItem value="Operations">
                              Operations
                            </SelectItem>
                            <SelectItem value="Disbursement">
                              Disbursement
                            </SelectItem>
                            <SelectItem value="Communication">
                              Communication
                            </SelectItem>
                            <SelectItem value="Clearance">Clearance</SelectItem>
                            <SelectItem value="Bunkering">Bunkering</SelectItem>
                            <SelectItem value="Supply">Supply</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="accessLevel">Access Level</Label>
                        <Select
                          value={selectedAccessLevelId}
                          onValueChange={(value) => {
                            setSelectedAccessLevelId(value);
                            setNewUser({ ...newUser, accessLevel: value });
                            const sel = accessLevels.find(
                              (al: any) => al.id === value
                            );
                            setSelectedAccessLevel(sel || null);
                          }}
                          disabled={accessLevelLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                          <SelectContent>
                            {accessLevels.map((level: any) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={newUser.dob || ""}
                          onChange={(e) =>
                            setNewUser({ ...newUser, dob: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    {/* System Privileges Section */}
                    {selectedAccessLevel && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            Permissions for {selectedAccessLevel?.id}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedAccessLevel.description ||
                              "Permissions for this access level."}
                          </p>
                        </div>
                        {selectedAccessLevel.Permissions?.length === 0 ? (
                          <div className="text-gray-500 text-sm">
                            No Permissions assigned.
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-800 bg-background p-2">
                            {[
                              ...new Set(
                                selectedAccessLevel.Permissions.map(
                                  (p: any) => p.module
                                )
                              ),
                            ].map((module) => (
                              <div key={String(module)} className="py-4">
                                <div className="font-semibold text-primary mb-2 flex items-center gap-2 text-base">
                                  {String(module)}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedAccessLevel.Permissions.filter(
                                    (p: any) => p.module === module
                                  ).map((perm: any) => (
                                    <span
                                      key={perm.id}
                                      className=" inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-white/10 dark:text-white text-sm font-medium shadow-sm"
                                    >
                                      {perm.description}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewUser({});
                        setSelectedPrivileges([]);
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createUser}
                      disabled={
                        !newUser.username || !newUser.name || !newUser.email
                      }
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, username, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="disbursement">Disbursement</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="clearance">Clearance</SelectItem>
                    <SelectItem value="bunkering">Bunkering</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          username: e.target.value,
                        })
                      }
                      placeholder="john.doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          name: e.target.value,
                        })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="john@greeklanka.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={editingUser.phoneNumber}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="+94-77-123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Input
                      id="edit-role"
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value,
                        })
                      }
                      placeholder="Operations Executive"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={editingUser.department}
                      onValueChange={(value) =>
                        setEditingUser({
                          ...editingUser,
                          department: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Operations">Operations</SelectItem>
                        <SelectItem value="Disbursement">
                          Disbursement
                        </SelectItem>
                        <SelectItem value="Communication">
                          Communication
                        </SelectItem>
                        <SelectItem value="Clearance">Clearance</SelectItem>
                        <SelectItem value="Bunkering">Bunkering</SelectItem>
                        <SelectItem value="Supply">Supply</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-accessLevel">Access Level</Label>
                    <Select
                      value={editingUser.accessLevel}
                      onValueChange={(value) => {
                        setEditingUser({
                          ...editingUser,
                          accessLevel: value,
                        });
                        const sel = accessLevels.find(
                          (al: any) => al.id === value
                        );
                        setSelectedAccessLevel(sel || null);
                        setEditPrivileges(
                          sel?.Permissions?.map((p: any) => p.key) || []
                        );
                      }}
                      disabled={accessLevelLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessLevels.map((level: any) => (
                          <SelectItem key={level.id} value={level.id}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-dob">Date of Birth</Label>
                    <Input
                      id="edit-dob"
                      type="date"
                      value={editingUser?.dob || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          dob: e.target.value,
                        } as User)
                      }
                    />
                  </div>
                </div>

                {/* System Privileges Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      Permissions for {selectedAccessLevel?.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Modify user permissions as needed
                    </p>
                  </div>

                  <div className="space-y-6">
                    {selectedAccessLevel?.Permissions &&
                      [
                        ...new Set(
                          selectedAccessLevel.Permissions.map(
                            (p: any) => p.module
                          )
                        ),
                      ].map((module) => (
                        <div key={String(module)} className="space-y-3">
                          <h4 className="font-medium text-blue-600 text-base">
                            {String(module)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedAccessLevel.Permissions.filter(
                              (p: any) => p.module === module
                            ).map((perm: any) => (
                              <div
                                key={perm.key}
                                className="flex items-start space-x-3"
                              >
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`edit-${perm.key}`}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {perm.description}
                                  </Label>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {perm.module}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Selected Privileges:</strong>{" "}
                      {editPrivileges.length} of{" "}
                      {selectedAccessLevel?.Permissions?.length ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                  setEditPrivileges([]);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={updateUser}
                disabled={
                  !editingUser?.username ||
                  !editingUser?.name ||
                  !editingUser?.email
                }
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-sm p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>User Created!</DialogTitle>
              <DialogDescription>
                The user has been created successfully.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        user.isActive
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Users
                        className={`h-6 w-6 ${
                          user.isActive
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={getStatusColor(user.isActive)}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {/* <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800">
                          Level {user.accessLevel}
                        </Badge> */}
                        <Badge variant="outline">{user.department}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      <span className="sr-only sm:not-sr-only">View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="sr-only sm:not-sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                      className="flex-1 sm:flex-none"
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          <span className="sr-only sm:not-sr-only">
                            Deactivate
                          </span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          <span className="sr-only sm:not-sr-only">
                            Activate
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                    <p className="font-medium truncate">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last Login
                      </p>
                      <p className="font-medium">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Permissions: {user.permissions.length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchTerm ||
                  departmentFilter !== "all" ||
                  statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No users registered yet"}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First User
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      {selectedUser.name}
                    </h2>
                    <Badge className={getStatusColor(selectedUser.isActive)}>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="profile">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>User Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">
                              Username
                            </Label>
                            <p>{selectedUser.username}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Full Name
                            </Label>
                            <p>{selectedUser.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Email</Label>
                            <p>{selectedUser.email}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Phone Number
                            </Label>
                            <p>{selectedUser.phoneNumber}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Role</Label>
                            <p>{selectedUser.role}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Department
                            </Label>
                            <p>{selectedUser.department}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Access Level
                            </Label>
                            <p>Level {selectedUser.accessLevel}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Date of Birth
                            </Label>
                            <p>
                              {selectedUser?.dob
                                ? new Date(
                                    selectedUser.dob
                                  ).toLocaleDateString()
                                : "Not specified"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                        <CardDescription>
                          Recent user activity and login history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                            <div>
                              <p className="font-medium">Last Login</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedUser.lastLogin
                                  ? new Date(
                                      selectedUser.lastLogin
                                    ).toLocaleString()
                                  : "Never"}
                              </p>
                            </div>
                            <Badge variant="outline">Login</Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2">
                            <div>
                              <p className="font-medium">Account Created</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  selectedUser.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline">Created</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
