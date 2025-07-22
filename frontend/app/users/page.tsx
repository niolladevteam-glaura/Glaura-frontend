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
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { userApi } from "@/lib/api";

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
  created_at?: string;
  last_login?: string;
  dob?: string;
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

// Add this constant after the User interface
const ALL_PRIVILEGES: Privilege[] = [
  // Management Privileges
  {
    id: "user_management",
    name: "User Management",
    description: "Create, edit, and manage user accounts",
    category: "Management",
  },
  {
    id: "system_settings",
    name: "System Settings",
    description: "Configure system-wide settings",
    category: "Management",
  },
  {
    id: "reports_access",
    name: "Reports Access",
    description: "View all system reports and analytics",
    category: "Management",
  },
  {
    id: "audit_logs",
    name: "Audit Logs",
    description: "View system audit logs and user activities",
    category: "Management",
  },

  // Port Call Privileges
  {
    id: "create_port_calls",
    name: "Create Port Calls",
    description: "Create new port call entries",
    category: "Port Calls",
  },
  {
    id: "edit_port_calls",
    name: "Edit Port Calls",
    description: "Modify existing port call details",
    category: "Port Calls",
  },
  {
    id: "delete_port_calls",
    name: "Delete Port Calls",
    description: "Remove port call entries",
    category: "Port Calls",
  },
  {
    id: "view_port_calls",
    name: "View Port Calls",
    description: "Access port call information",
    category: "Port Calls",
  },
  {
    id: "assign_port_calls",
    name: "Assign Port Calls",
    description: "Assign port calls to staff members",
    category: "Port Calls",
  },

  // Customer Management
  {
    id: "create_customers",
    name: "Create Customers",
    description: "Add new customer companies",
    category: "Customers",
  },
  {
    id: "edit_customers",
    name: "Edit Customers",
    description: "Modify customer information",
    category: "Customers",
  },
  {
    id: "view_customers",
    name: "View Customers",
    description: "Access customer database",
    category: "Customers",
  },
  {
    id: "delete_customers",
    name: "Delete Customers",
    description: "Remove customer records",
    category: "Customers",
  },

  // Vendor Management
  {
    id: "create_vendors",
    name: "Create Vendors",
    description: "Add new vendor companies",
    category: "Vendors",
  },
  {
    id: "edit_vendors",
    name: "Edit Vendors",
    description: "Modify vendor information",
    category: "Vendors",
  },
  {
    id: "view_vendors",
    name: "View Vendors",
    description: "Access vendor database",
    category: "Vendors",
  },
  {
    id: "delete_vendors",
    name: "Delete Vendors",
    description: "Remove vendor records",
    category: "Vendors",
  },

  // Document Management
  {
    id: "create_documents",
    name: "Create Documents",
    description: "Upload and create new documents",
    category: "Documents",
  },
  {
    id: "edit_documents",
    name: "Edit Documents",
    description: "Modify document details",
    category: "Documents",
  },
  {
    id: "view_documents",
    name: "View Documents",
    description: "Access document library",
    category: "Documents",
  },
  {
    id: "delete_documents",
    name: "Delete Documents",
    description: "Remove documents",
    category: "Documents",
  },

  // Communication
  {
    id: "send_messages",
    name: "Send Messages",
    description: "Send internal messages",
    category: "Communication",
  },
  {
    id: "view_messages",
    name: "View Messages",
    description: "Access messaging system",
    category: "Communication",
  },
  {
    id: "whatsApp_access",
    name: "WhatsApp Access",
    description: "Use WhatsApp integration",
    category: "Communication",
  },
  {
    id: "manage_phone_book",
    name: "Manage Phone Book",
    description: "Add/edit/delete contacts",
    category: "Communication",
  },

  // Operations
  {
    id: "manage_vessels",
    name: "Manage Vessels",
    description: "Add and edit vessel information",
    category: "Operations",
  },
  {
    id: "clearance_operations",
    name: "Clearance Operations",
    description: "Handle customs and clearance",
    category: "Operations",
  },
  {
    id: "bunkering_operations",
    name: "Bunkering Operations",
    description: "Manage fuel and bunkering services",
    category: "Operations",
  },

  // Financial
  {
    id: "view_disbursements",
    name: "View Disbursements",
    description: "Access disbursement accounts",
    category: "Financial",
  },
  {
    id: "create_disbursements",
    name: "Create Disbursements",
    description: "Create disbursement entries",
    category: "Financial",
  },
  {
    id: "invoicing",
    name: "invoicing",
    description: "Generate and manage invoices",
    category: "Financial",
  },
];

// Add this function to get default privileges for access levels
const getDefaultPrivileges = (accessLevel: string): string[] => {
  switch (accessLevel) {
    case "A": // Managing Director
      return ALL_PRIVILEGES.map((p) => p.id);
    case "B": // Operations Manager
      return [
        "create_port_calls",
        "edit_port_calls",
        "view_port_calls",
        "assign_port_calls",
        "view_customers",
        "edit_customers",
        "view_vendors",
        "edit_vendors",
        "view_documents",
        "create_documents",
        "edit_documents",
        "send_messages",
        "view_messages",
        "manage_vessels",
        "reports_access",
        "clearance_operations",
        "bunkering_operations",
      ];
    case "C": // Disbursement Manager
      return [
        "view_port_calls",
        "edit_port_calls",
        "view_customers",
        "edit_customers",
        "view_vendors",
        "view_documents",
        "create_documents",
        "send_messages",
        "view_messages",
        "view_disbursements",
        "create_disbursements",
        "invoicing",
      ];
    case "D": // Assistant Manager
      return [
        "view_port_calls",
        "edit_port_calls",
        "view_customers",
        "view_vendors",
        "view_documents",
        "create_documents",
        "send_messages",
        "view_messages",
        "manage_vessels",
        "clearance_operations",
      ];
    case "E": // Operations Executive
      return [
        "view_port_calls",
        "view_customers",
        "view_vendors",
        "view_documents",
        "create_documents",
        "send_messages",
        "view_messages",
        "whatsApp_access",
        "manage_phone_book",
      ];
    case "F": // Bunkering Officer
      return [
        "view_port_calls",
        "view_vendors",
        "view_documents",
        "send_messages",
        "view_messages",
        "bunkering_operations",
      ];
    case "G": // Clearance Officer
      return [
        "view_port_calls",
        "view_vendors",
        "view_documents",
        "send_messages",
        "view_messages",
        "clearance_operations",
      ];
    case "R": // General Staff
      return ["view_port_calls", "view_documents", "view_messages"];
    default:
      return [];
  }
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

  // Add state for privileges
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  // Add this right after the state declarations
  const handleAddUserClick = () => {
    console.log("Add User button clicked!");
    console.log("Current dialog state:", isCreateDialogOpen);
    setIsCreateDialogOpen(true);
    console.log("Dialog state after setting:", true);
  };

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    const user = JSON.parse(userData);
    setCurrentUser(user);

    let hasPermission = false;
    if (user.permissions) {
      if (Array.isArray(user.permissions)) {
        hasPermission = user.permissions.includes("user_management");
      } else if (typeof user.permissions === "object") {
        hasPermission = !!user.permissions["user_management"];
      }
    }

    if (!hasPermission) {
      router.push("/dashboard");
      return;
    }

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
            try {
              const permResponse = (await userApi.getUserPermissions(
                apiUser.user_id
              )) as PermissionResponse;

              if (permResponse.success && permResponse.userPermissions) {
                // Convert permissions object to array of keys
                permissions = Object.entries(permResponse.userPermissions)
                  .filter(
                    ([key, value]) =>
                      value === true && // Only include true permissions
                      !["createdAt", "updatedAt"].includes(key) // Exclude metadata fields
                  )
                  .map(([key]) => key);
              }
            } catch (error) {
              console.error(
                "Failed to load permissions for user:",
                apiUser.user_id,
                error
              );
            }

            return {
              id: apiUser.user_id,
              username: apiUser.email.split("@")[0],
              name: `${apiUser.first_name} ${apiUser.last_name}`,
              email: apiUser.email,
              role: apiUser.role,
              department: apiUser.department || "Other",
              accessLevel: apiUser.access_level,
              isActive: apiUser.status,
              lastLogin: apiUser.last_login || "",
              createdAt: apiUser.created_at || new Date().toISOString(),
              permissions, // Use fetched permissions
              phoneNumber: apiUser.contact_number || "",
              emergencyContact: "",
              dob: apiUser.dob || "",
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
    let filtered = [...users]; // Start with a copy of users

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
        lastLogin: apiUser.last_login || "",
        createdAt: apiUser.created_at || new Date().toISOString(),
        permissions,
        phoneNumber: apiUser.contact_number || "",
        emergencyContact: "",
      });
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  };

  const [loading, setLoading] = useState(false);

  // // Example usage in API calls
  // const loadUsers = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await userApi.getAllUsers();
  //     setUsers(response.data);
  //     setFilteredUsers(response.data);
  //   } catch (error) {
  //     console.error("Failed to load users:", error);
  //     // Show error to user
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Update the access level change handler to set default privileges
  const handleAccessLevelChange = (value: string) => {
    setNewUser({ ...newUser, accessLevel: value });
    const defaultPrivs = getDefaultPrivileges(value);
    setSelectedPrivileges(defaultPrivs);
  };

  // Add privilege toggle function
  const togglePrivilege = (privilegeId: string) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  //  Create User
  const createUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.email) {
      alert("Please fill in all required fields (Username, Full Name, Email)");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = newUser.name.split(" ");
      const lastName = lastNameParts.join(" ");

      const permissionsObj = ALL_PRIVILEGES.reduce((acc, privilege) => {
        acc[privilege.id] = selectedPrivileges.includes(privilege.id);
        return acc;
      }, {} as Record<string, boolean>);

      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: newUser.email,
        contact_number: newUser.phoneNumber || "",
        role: newUser.role || "staff",
        access_level: newUser.accessLevel || "R",
        department: newUser.department || "Other",
        status: true,
        password: "TemporaryPassword123!",
        permissions: permissionsObj,
        dob: newUser.dob || "",
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
        accessLevel: userData.access_level,
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
    } catch (error) {
      console.error("Error creating user:", error);
      alert(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
  // ...rest of your component above...

  // Update user
  const updateUser = async () => {
    if (!editingUser) return;

    try {
      // Split full name into first and last
      const [firstName, ...lastNameParts] = editingUser.name.split(" ");
      const lastName = lastNameParts.join(" ");

      // Build permissions object (id: boolean) from editPrivileges array
      const permissionsObj = ALL_PRIVILEGES.reduce((acc, privilege) => {
        acc[privilege.id] = editPrivileges.includes(privilege.id);
        return acc;
      }, {} as Record<string, boolean>);

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
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditPrivileges(user.permissions);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
            <CardTitle className="flex items-center justify-between">
              <span>User Directory</span>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={handleAddUserClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="accessLevel">Access Level</Label>
                        <Select
                          value={newUser.accessLevel || ""}
                          onValueChange={(value) => {
                            setNewUser({ ...newUser, accessLevel: value });
                            const defaultPrivs = getDefaultPrivileges(value);
                            setSelectedPrivileges(defaultPrivs);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">
                              A - Managing Director
                            </SelectItem>
                            <SelectItem value="B">
                              B - Operations Manager
                            </SelectItem>
                            <SelectItem value="C">
                              C - Disbursement Manager
                            </SelectItem>
                            <SelectItem value="D">
                              D - Assistant Manager
                            </SelectItem>
                            <SelectItem value="E">
                              E - Operations Executive
                            </SelectItem>
                            <SelectItem value="F">
                              F - Bunkering Officer
                            </SelectItem>
                            <SelectItem value="G">
                              G - Clearance Officer
                            </SelectItem>
                            <SelectItem value="R">R - General Staff</SelectItem>
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
                    {newUser.accessLevel && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            System Privileges
                          </h3>
                          <p className="text-sm text-gray-500">
                            Default privileges for {newUser.accessLevel} level
                            are pre-selected. You can modify them as needed.
                          </p>
                        </div>

                        <div className="space-y-6">
                          {Object.entries(
                            ALL_PRIVILEGES.reduce((acc, privilege) => {
                              if (!acc[privilege.category])
                                acc[privilege.category] = [];
                              acc[privilege.category].push(privilege);
                              return acc;
                            }, {} as Record<string, Privilege[]>)
                          ).map(([category, privileges]) => (
                            <div key={category} className="space-y-3">
                              <h4 className="font-medium text-blue-600 text-base">
                                {category}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {privileges.map((privilege) => (
                                  <div
                                    key={privilege.id}
                                    className="flex items-start space-x-3"
                                  >
                                    <Checkbox
                                      id={privilege.id}
                                      checked={selectedPrivileges.includes(
                                        privilege.id
                                      )}
                                      onCheckedChange={() =>
                                        togglePrivilege(privilege.id)
                                      }
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <Label
                                        htmlFor={privilege.id}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {privilege.name}
                                      </Label>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {privilege.description}
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
                            {selectedPrivileges.length} of{" "}
                            {ALL_PRIVILEGES.length}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewUser({});
                        setSelectedPrivileges([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createUser}
                      disabled={
                        !newUser.username || !newUser.name || !newUser.email
                      }
                      className="bg-blue-600 hover:bg-blue-700"
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
              <div className="flex gap-2">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="disbursement">Disbursement</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="clearance">Clearance</SelectItem>
                    <SelectItem value="bunkering">Bunkering</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        const defaultPrivs = getDefaultPrivileges(value);
                        setEditPrivileges(defaultPrivs);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select access level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A - Managing Director</SelectItem>
                        <SelectItem value="B">
                          B - Operations Manager
                        </SelectItem>
                        <SelectItem value="C">
                          C - Disbursement Manager
                        </SelectItem>
                        <SelectItem value="D">D - Assistant Manager</SelectItem>
                        <SelectItem value="E">
                          E - Operations Executive
                        </SelectItem>
                        <SelectItem value="F">F - Bunkering Officer</SelectItem>
                        <SelectItem value="G">G - Clearance Officer</SelectItem>
                        <SelectItem value="R">R - General Staff</SelectItem>
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
                    <h3 className="text-lg font-medium">System Privileges</h3>
                    <p className="text-sm text-gray-500">
                      Modify user permissions as needed
                    </p>
                  </div>

                  <div className="space-y-6">
                    {Object.entries(
                      ALL_PRIVILEGES.reduce((acc, privilege) => {
                        if (!acc[privilege.category])
                          acc[privilege.category] = [];
                        acc[privilege.category].push(privilege);
                        return acc;
                      }, {} as Record<string, Privilege[]>)
                    ).map(([category, privileges]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-medium text-blue-600 text-base">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {privileges.map((privilege) => (
                            <div
                              key={privilege.id}
                              className="flex items-start space-x-3"
                            >
                              <Checkbox
                                id={`edit-${privilege.id}`}
                                checked={editPrivileges.includes(privilege.id)}
                                onCheckedChange={() => {
                                  if (editPrivileges.includes(privilege.id)) {
                                    setEditPrivileges(
                                      editPrivileges.filter(
                                        (id) => id !== privilege.id
                                      )
                                    );
                                  } else {
                                    setEditPrivileges([
                                      ...editPrivileges,
                                      privilege.id,
                                    ]);
                                  }
                                }}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={`edit-${privilege.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {privilege.name}
                                </Label>
                                <p className="text-xs text-gray-500 mt-1">
                                  {privilege.description}
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
                      {editPrivileges.length} of {ALL_PRIVILEGES.length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                  setEditPrivileges([]);
                }}
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update User
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-sm">
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
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
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(user.isActive)}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge
                          className={getAccessLevelColor(user.accessLevel)}
                        >
                          Level {user.accessLevel}
                        </Badge>
                        <Badge variant="outline">{user.department}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Role
                    </p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium">{user.phoneNumber}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4 text-gray-400" />
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
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
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                    <Badge className={getStatusColor(selectedUser.isActive)}>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                  >
                    Close
                  </Button>
                </div>

                <Tabs defaultValue="profile">
                  <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4">
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

                  <TabsContent value="permissions">
                    <Card>
                      <CardHeader>
                        <CardTitle>System Permissions</CardTitle>
                        <CardDescription>
                          User access rights and capabilities
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedUser.permissions.map((permission, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-3 border rounded-lg"
                            >
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="capitalize">
                                {permission.replace("_", " ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity">
                    <Card>
                      <CardHeader>
                        <CardTitle>Activity Log</CardTitle>
                        <CardDescription>
                          Recent user activity and login history
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
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
                          <div className="flex items-center justify-between p-3 border rounded-lg">
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
