"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

// Animated Success Dialog
function SuccessDialog({ open, onOk }: { open: boolean; onOk: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-background rounded-2xl shadow-2xl p-8 flex flex-col items-center animate-bounceIn">
        <svg
          className="w-20 h-20 mb-4 text-green-500 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
          <path
            d="M8 12l3 3 5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <h2 className="text-2xl font-bold text-green-700 mb-2">Success!</h2>
        <p className="text-center text-muted-foreground mb-4">
          Officer nomination complete.
          <br />
          You will be redirected to the Port Calls page.
        </p>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold shadow"
          onClick={onOk}
        >
          Okay
        </Button>
      </div>
      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          60% {
            transform: scale(1.1);
            opacity: 1;
          }
          80% {
            transform: scale(0.95);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-bounceIn {
          animation: bounceIn 0.7s cubic-bezier(0.7, -0.41, 0.36, 1.44);
        }
      `}</style>
    </div>
  );
}

export default function OtpPage() {
  const router = useRouter();
  const { job_id } = useParams();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Countdown state
  const [secondsLeft, setSecondsLeft] = useState(5 * 60); // 5 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showSuccess) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((sec) => {
        if (sec <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [showSuccess]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Professional UX: pulse badge when urgent
  const urgent = secondsLeft > 0 && secondsLeft <= 30;

  const handleOtpConfirm = () => {
    if (secondsLeft <= 0) {
      toast.error("OTP expired. Please request a new code.");
      return;
    }
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
    }, 1000);
  };

  const handleSuccessOk = () => {
    setShowSuccess(false);
    router.push("/port-calls");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <SuccessDialog open={showSuccess} onOk={handleSuccessOk} />
      <Card className="w-full max-w-md shadow-xl border border-[#232e45]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-2xl font-semibold">
            <KeyRound className="w-5 h-5 text-primary" />
            Enter OTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showSuccess ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">OTP sent to your device</Badge>
                <span>
                  <Badge
                    variant={urgent ? "destructive" : "outline"}
                    className={`font-mono px-4 py-1 transition-all
                      ${urgent ? "shadow-otp-pulse animate-otpPulse" : ""}
                      ${secondsLeft === 0 ? "opacity-75" : ""}
                    `}
                  >
                    {secondsLeft > 0
                      ? `Valid for ${formatTime(secondsLeft)}`
                      : "Expired"}
                  </Badge>
                  <style jsx>{`
                    @keyframes otpPulse {
                      0%,
                      100% {
                        box-shadow: 0 0 0 0 #ef4444;
                      }
                      50% {
                        box-shadow: 0 0 12px 2px #ef4444;
                      }
                    }
                    .animate-otpPulse {
                      animation: otpPulse 1s infinite;
                    }
                  `}</style>
                </span>
              </div>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Enter OTP"
                disabled={loading || secondsLeft <= 0}
                className={`tracking-widest text-xl text-center border-2 transition-all ${
                  secondsLeft <= 0
                    ? "border-red-500 bg-[#1a1a2c] text-[#a3aed0] opacity-50"
                    : "border-blue-500"
                }`}
              />
              <Button
                onClick={handleOtpConfirm}
                disabled={loading || secondsLeft <= 0}
                className={`w-full mt-3 font-semibold ${
                  secondsLeft <= 0 ? "bg-gray-600 cursor-not-allowed" : ""
                }`}
              >
                Confirm OTP
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
