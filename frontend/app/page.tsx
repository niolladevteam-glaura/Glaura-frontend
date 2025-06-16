"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Anchor, Ship, Users, FileText, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock user data with RBAC levels
const mockUsers = [
  {
    id: 1,
    username: "udith.kalupahana",
    password: "demo123",
    name: "Udith Kalupahana",
    role: "Managing Director",
    accessLevel: "A",
    department: "All Departments",
  },
  {
    id: 2,
    username: "kumar.fernando",
    password: "demo123",
    name: "Kumar Fernando",
    role: "Asst.Manager - Disbursement Accounts",
    accessLevel: "C",
    department: "Disbursement",
  },
  {
    id: 3,
    username: "sajith.madushan",
    password: "demo123",
    name: "Sajith Madushan",
    role: "Asst.Manager - Operations",
    accessLevel: "D",
    department: "Operations",
  },
  {
    id: 4,
    username: "sewwandi.rupasinghe",
    password: "demo123",
    name: "Sewwandi Rupasinghe",
    role: "Operations Executive",
    accessLevel: "E",
    department: "Communication",
  },
  {
    id: 5,
    username: "client.msc",
    password: "demo123",
    name: "MSC Client Portal",
    role: "Client",
    accessLevel: "CLIENT",
    department: "External",
  },
];

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("internal");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Store user data in localStorage for demo purposes
      localStorage.setItem("currentUser", JSON.stringify(user));

      if (user.accessLevel === "CLIENT") {
        router.push("/client-portal");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">GLAURA</h1>
              <p className="text-blue-200">
                The Aura of Excellence in Port Services
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Maritime Port Call Management System
            </h2>
            <p className="text-blue-100 text-lg">
              Streamline port operations from vessel arrival to departure with
              real-time tracking, document generation, and comprehensive
              workflow management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Ship className="h-8 w-8 text-blue-300 mb-2" />
              <h3 className="font-semibold mb-1">Port Call Management</h3>
              <p className="text-sm text-blue-200">
                Complete vessel lifecycle tracking
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Users className="h-8 w-8 text-blue-300 mb-2" />
              <h3 className="font-semibold mb-1">RBAC System</h3>
              <p className="text-sm text-blue-200">18-tier access control</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <FileText className="h-8 w-8 text-blue-300 mb-2" />
              <h3 className="font-semibold mb-1">Document Generation</h3>
              <p className="text-sm text-blue-200">50+ dynamic templates</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <BarChart3 className="h-8 w-8 text-blue-300 mb-2" />
              <h3 className="font-semibold mb-1">Real-time Analytics</h3>
              <p className="text-sm text-blue-200">Performance insights</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access the PortCall Pro system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Login Type</Label>
              <Select value={userType} onValueChange={setUserType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal User</SelectItem>
                  <SelectItem value="client">Client Portal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Demo Credentials:</h4>
              <div className="text-xs space-y-1">
                <div>
                  <strong>Admin:</strong> udith.kalupahana / demo123
                </div>
                <div>
                  <strong>Disbursement:</strong> kumar.fernando / demo123
                </div>
                <div>
                  <strong>Operations:</strong> sajith.madushan / demo123
                </div>
                <div>
                  <strong>Communication:</strong> sewwandi.rupasinghe / demo123
                </div>
                <div>
                  <strong>Client Portal:</strong> client.msc / demo123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
