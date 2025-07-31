"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import {
  Anchor,
  Ship,
  Waves,
  Navigation,
  Globe,
  Shield,
  Zap,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";
import { encrypt } from "@/utils/crypto";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  access_level: string;
  iat: number;
  exp: number;
}

type ApiUser = {
  pk_id: number;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  access_level: string;
  token: string;
  permissions?: Record<string, boolean>;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("internal");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Clear any existing tokens on login page load
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      // OTP flow: success but needs OTP
      if (response.ok && data.success && data.user_id) {
        localStorage.setItem("otpUserId", data.user_id);
        localStorage.setItem("otpEmail", encrypt(email));
        localStorage.setItem("otpPassword", encrypt(password));
        if (data.otp_token) localStorage.setItem("otpToken", data.otp_token);
        router.push("/otp");
        return;
      }

      // If classic login is still supported, handle here...
      // (You can keep your previous login logic here if needed)

      throw new Error(data.message || "Invalid credentials or OTP required.");
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithAPI = async (email: string, password: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Authentication failed");
    }

    return {
      pk_id: data.user.pk_id,
      id: data.user.id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      email: data.user.email,
      role: data.user.role,
      access_level: data.user.access_level,
      department: data.user.department,
      phone_number: data.user.phone_number,
      token: data.token,
      permissions: data.permissions,
    };
  };

  // const handleSuccessfulLogin = (user: ApiUser) => {
  //   // Decode token to verify access level
  //   let accessLevel = user.access_level;
  //   try {
  //     const decoded = jwtDecode<JwtPayload>(user.token);
  //     // Use access_level from token if available
  //     if (decoded.access_level) {
  //       accessLevel = decoded.access_level;
  //     }
  //   } catch (error) {
  //     console.error("Error decoding token:", error);
  //   }

  //   const userData = {
  //     pkId: user.pk_id,
  //     id: user.id,
  //     name: `${user.first_name} ${user.last_name}`,
  //     email: user.email,
  //     role: user.role,
  //     accessLevel: accessLevel, // Use verified access level
  //     permissions: user.permissions || {},
  //   };

  //   // Store authentication data with consistent keys
  //   localStorage.setItem("currentUser", JSON.stringify(userData));
  //   localStorage.setItem("token", user.token);

  //   // Redirect based on access level
  //   switch (accessLevel) {
  //     case "A":
  //       router.push("/dashboard");
  //       break;
  //     case "CLIENT":
  //       router.push("/client/dashboard");
  //       break;
  //     default:
  //       router.push("/dashboard");
  //   }
  // };

  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen maritime-gradient-bg flex items-center justify-center">
  //       <div className="loading-wave"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen maritime-gradient-bg relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 text-white/10 floating-element"
          style={{ animationDelay: "0s" }}
        >
          <Waves className="h-16 w-16" />
        </div>
        <div
          className="absolute top-40 right-20 text-white/10 floating-element"
          style={{ animationDelay: "1s" }}
        >
          <Ship className="h-12 w-12" />
        </div>
        <div
          className="absolute bottom-40 left-20 text-white/10 floating-element"
          style={{ animationDelay: "2s" }}
        >
          <Compass className="h-14 w-14" />
        </div>
        <div
          className="absolute bottom-20 right-10 text-white/10 floating-element"
          style={{ animationDelay: "0.5s" }}
        >
          <Navigation className="h-10 w-10" />
        </div>
        <div
          className="absolute top-60 left-1/3 text-white/5 floating-element"
          style={{ animationDelay: "1.5s" }}
        >
          <Anchor className="h-20 w-20" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Enhanced Branding */}
          <div className="hidden lg:block text-white space-y-8 animate-slide-in-left">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30 shadow-2xl">
                  <Anchor className="h-12 w-12 text-white floating-element" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-5xl font-bold gradient-text mb-2">
                  GLAURA
                </h1>
                <p className="text-xl text-blue-100">
                  The Aura of Excellence in Port Services
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">
                Next-Generation Maritime Management
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Streamline your port operations with our robust management
                platform, offering automated workflows, simplified processes,
                and seamless system integration.
              </p>
            </div>

            {/* Enhanced Feature Grid */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              {[
                {
                  icon: Ship,
                  title: "Port Call Creation",
                  desc: "Easily register and manage vessel arrivals and departures",
                  delay: 0,
                },
                {
                  icon: Zap,
                  title: "Service Management",
                  desc: "Coordinate and monitor port call services efficiently",
                  delay: 0.2,
                },
                {
                  icon: Globe,
                  title: "Document Handling",
                  desc: "Generate and manage shipping documents with ease",
                  delay: 0.4,
                },
                {
                  icon: Shield,
                  title: "Data Privacy & Security",
                  desc: "Enhanced system protection",
                  delay: 0.6,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="glass-morphism rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-scale-in"
                  style={{ animationDelay: `${feature.delay}s` }}
                >
                  <feature.icon className="h-10 w-10 text-blue-300 mb-4 floating-element" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-blue-200">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Enhanced Login Form */}
          <div className="w-full max-w-md mx-auto animate-slide-in-up">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Anchor className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">GLAURA</h1>
                  <p className="text-blue-200">Maritime Excellence</p>
                </div>
              </div>
            </div>

            <Card className="maritime-card border-0 shadow-2xl">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold gradient-text">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Access your maritime command center
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="userType"
                      className="text-base font-semibold text-gray-800"
                    >
                      Account Type
                    </Label>
                    <Select
                      value={userType}
                      onValueChange={setUserType}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal User</SelectItem>
                        <SelectItem value="client">Client Portal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="email"
                      className="text-base font-semibold text-gray-800"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@greeklanka.lk"
                      required
                      disabled={isLoading}
                      className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="password"
                      className="text-base font-semibold text-gray-800 "
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center animate-scale-in">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-semibold maritime-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="loading-wave mr-3"></div>
                        Authenticating...
                      </span>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Sign In Securely
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
