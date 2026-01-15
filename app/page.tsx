"use client";

import React, { useState, useEffect } from "react";
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
  Anchor,
  Ship,
  Waves,
  Navigation,
  Shield,
  Compass,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

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
        <div className="w-full max-w-7xl gap-8 items-center">
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
                      placeholder="user@greeklanka.com"
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
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                        className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <a
                        href="/forgot-password"
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </a>
                    </div>
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
