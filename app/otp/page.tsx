"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { decrypt } from "@/utils/crypto";
import {
  Waves,
  Ship,
  Compass,
  Navigation,
  Anchor,
  Shield,
  Lock,
} from "lucide-react";

const OTP_LENGTH = 6;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
function maskEmail(email: string) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return user[0] + "*".repeat(Math.max(user.length - 1, 1)) + "@" + domain;
}

export default function OTPPage() {
  const [otpArray, setOtpArray] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false); // Prevent double submit
  const router = useRouter();
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const encryptedEmail = localStorage.getItem("otpEmail");
    if (encryptedEmail) setEmail(decrypt(encryptedEmail));
  }, []);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // AUTO SUBMIT WHEN ALL FILLED
  useEffect(() => {
    if (
      otpArray.every((val) => val.length === 1) &&
      !isLoading &&
      !hasAutoSubmitted
    ) {
      setHasAutoSubmitted(true);
      handleVerify(); // <-- auto submit!
    }
    if (otpArray.some((val) => val.length === 0)) {
      setHasAutoSubmitted(false); // reset for next time
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otpArray]);

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
      if (!response.ok || !data.success || !data.user_id)
        throw new Error(data.message || "Failed to resend OTP");
      localStorage.setItem("otpUserId", data.user_id);
      if (data.otp_token) localStorage.setItem("otpToken", data.otp_token);
      setTimeLeft(300);
      setOtpArray(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpChange = (idx: number, value: string) => {
    // Multi-char paste fallback
    if (value.length > 1) {
      const chars = value.slice(0, OTP_LENGTH).split("");
      const next = Array(OTP_LENGTH).fill("");
      chars.forEach((c, i) => (next[i] = c));
      setOtpArray(next);
      setTimeout(() => {
        inputRefs.current[Math.min(chars.length, OTP_LENGTH) - 1]?.focus();
      }, 20);
      return;
    }
    // Single input
    if (!/^[0-9a-zA-Z]?$/.test(value)) return;
    const updated = [...otpArray];
    updated[idx] = value;
    setOtpArray(updated);
    if (value && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\s+/g, "");
    if (/^[0-9a-zA-Z]{6}$/.test(text)) {
      const chars = text.split("");
      setOtpArray(chars);
      setTimeout(() => {
        inputRefs.current[OTP_LENGTH - 1]?.focus();
      }, 20);
      e.preventDefault();
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (otpArray[idx]) {
        const updated = [...otpArray];
        updated[idx] = "";
        setOtpArray(updated);
      } else if (idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "Tab" && !e.shiftKey && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    }
  };

  // Clear all boxes and focus the first
  const handleClearOtp = () => {
    setOtpArray(Array(OTP_LENGTH).fill(""));
    inputRefs.current[0]?.focus();
    setError("");
    setHasAutoSubmitted(false);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");
    const otp = otpArray.join("");
    if (otp.length !== OTP_LENGTH) {
      setError("Please enter all OTP digits.");
      setIsLoading(false);
      return;
    }
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
        avatar: data.user.profile_picture,
        token: data.token,
        permissions: data.permissions,
      };
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      localStorage.removeItem("otpUserId");
      localStorage.removeItem("otpToken");
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
    <div className="min-h-screen maritime-gradient-bg relative overflow-hidden">
      {/* Maritime icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-white/10 floating-element">
          <Waves className="h-16 w-16" />
        </div>
        <div className="absolute top-40 right-20 text-white/10 floating-element">
          <Ship className="h-12 w-12" />
        </div>
        <div className="absolute bottom-40 left-20 text-white/10 floating-element">
          <Compass className="h-14 w-14" />
        </div>
        <div className="absolute bottom-20 right-10 text-white/10 floating-element">
          <Navigation className="h-10 w-10" />
        </div>
        <div className="absolute top-60 left-1/3 text-white/5 floating-element">
          <Anchor className="h-20 w-20" />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-md">
          <form
            onSubmit={handleVerify}
            className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl space-y-6 w-full border border-gray-100"
            style={{
              boxShadow:
                "0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-2">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Enter Verification Code
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                We've sent a 6-digit code to{" "}
                <span className="font-semibold text-blue-700">
                  {maskEmail(email)}
                </span>
                . Enter it below to continue.
              </p>
            </div>

            {/* OTP Input Section */}
            <div className="space-y-5">
              <div className="flex justify-center items-center gap-2.5">
                {otpArray.map((digit, idx) => (
                  <div key={idx} className="relative">
                    <input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      autoFocus={idx === 0}
                      disabled={timeLeft === 0}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      className="w-14 h-14 text-2xl font-bold text-center rounded-xl border-2 border-gray-200 
                        focus:border-blue-500 focus:ring-3 focus:ring-blue-100 focus:outline-none transition-all duration-200
                        bg-gray-50 hover:bg-gray-100 disabled:bg-gray-100 disabled:cursor-not-allowed
                        text-gray-900 shadow-sm"
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                    {idx < OTP_LENGTH - 1 && (
                      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-0.5 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center animate-scale-in
                flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200
                  bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                  shadow-md hover:shadow-lg active:scale-[0.99]"
                disabled={isLoading || timeLeft <= 0}
              >
                {timeLeft <= 0 ? (
                  "OTP Expired"
                ) : isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
              {/* <button
                type="button"
                className="w-full h-12 border border-gray-300 rounded-xl text-gray-700 font-semibold 
                  bg-white hover:bg-gray-50 transition-all duration-200 hover:border-gray-400 
                  active:scale-[0.99] flex items-center justify-center gap-2"
                onClick={handleClearOtp}
                disabled={otpArray.every((v) => v === "")}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Code
              </button> */}
            </div>

            {/* Timer + Resend Below Buttons */}
            <div className="flex justify-between items-center text-xs text-gray-500 mt-4 w-full px-1">
              {/* Left Side: Timer */}
              <span>
                Remaining time:{" "}
                <span className="text-blue-700 font-semibold">
                  {formatTime(timeLeft)}
                </span>
              </span>
              {/* Right Side: Resend */}
              <span>
                Didn't got the code?{" "}
                <button
                  type="button"
                  className="text-blue-700 font-semibold hover:underline focus:outline-none"
                  disabled={isResending || timeLeft === 0}
                  onClick={handleResendOtp}
                  tabIndex={0}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </span>
            </div>

            {/* Security Note */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                For security, this code expires in 5 minutes
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
