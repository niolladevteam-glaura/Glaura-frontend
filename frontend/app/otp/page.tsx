"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { decrypt } from "@/utils/crypto";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function OTPPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend OTP handler
  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    try {
      const encryptedEmail = localStorage.getItem("otpEmail");
      const encryptedPassword = localStorage.getItem("otpPassword");
      if (!encryptedEmail || !encryptedPassword)
        throw new Error("Session expired. Please login again.");

      const email = decrypt(encryptedEmail);
      const password = decrypt(encryptedPassword);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success || !data.user_id) {
        throw new Error(data.message || "Failed to resend OTP");
      }
      // Update stored OTP user and token if provided
      localStorage.setItem("otpUserId", data.user_id);
      if (data.otp_token) localStorage.setItem("otpToken", data.otp_token);
      setTimeLeft(300); // Reset timer
      setOtp(""); // Optionally clear OTP input
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const userId = localStorage.getItem("otpUserId");
    const otpToken = localStorage.getItem("otpToken");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, otp, otp_token: otpToken }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Assemble userData for context/localStorage
      const userData = {
        pkId: data.user.pk_id,
        id: data.user.id,
        userId: data.user.id,
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        role: data.user.role,
        department: data.user.department,
        accessLevel: data.user.access_level,
        phoneNumber: data.user.phone_number,
        joinDate: data.user.joinDate,
        profilePicture: data.user.profile_picture,
        token: data.token,
        permissions: data.permissions,
      };

      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", data.token);

      localStorage.removeItem("otpUserId");
      localStorage.removeItem("otpToken");

      // Redirect based on access level if you want (like in your login)
      switch (data.user.access_level) {
        case "A":
          router.push("/dashboard");
          break;
        case "CLIENT":
          router.push("/client/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-xl shadow-xl space-y-6 w-full max-w-md"
      >
        {/* Countdown Timer and Resend */}
        <div className="flex flex-col items-center mb-2">
          <span
            className={`font-mono text-lg font-semibold ${
              timeLeft <= 30 ? "text-red-600" : "text-blue-600"
            }`}
          >
            OTP expires in: {formatTime(timeLeft)}
          </span>
          {timeLeft === 0 && (
            <Button
              type="button"
              className="mt-2"
              onClick={handleResendOtp}
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </Button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-black text-center">Enter OTP</h2>
        <p className="text-center text-gray-500">
          Please enter the OTP sent to your email.
        </p>
        <Input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
          className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl"
          disabled={timeLeft === 0}
        />
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-center animate-scale-in">
            {error}
          </div>
        )}
        <Button
          type="submit"
          className="w-full h-12"
          disabled={isLoading || timeLeft <= 0}
        >
          {timeLeft <= 0
            ? "OTP Expired"
            : isLoading
            ? "Verifying..."
            : "Verify OTP"}
        </Button>
      </form>
    </div>
  );
}
