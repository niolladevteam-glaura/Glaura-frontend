"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "sonner";
import {
  UserCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  Check,
} from "lucide-react";

const mockOfficers = [
  { id: "officer1", name: "Udith Kalupahana", email: "udith@greeklanka.com" },
  { id: "officer2", name: "Amal Silva", email: "amal@greeklanka.com" },
  { id: "officer3", name: "Nuwan Jayasuriya", email: "nuwan@greeklanka.com" },
];

export default function NominateOfficerPage() {
  const router = useRouter();
  const { job_id } = useParams();

  // Step State
  const [step, setStep] = useState<"select" | "otp" | "success">("select");
  const [selectedOfficer, setSelectedOfficer] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Success dialog state
  const [showSuccess, setShowSuccess] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown - close when clicking outside
  // (You can use a library for this, but here's a simple React way)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Confirm handler (mock password check)
  const handleConfirm = () => {
    if (!selectedOfficer) {
      toast.error("Please select a nominated officer.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast.success(
        "Password verified! Please enter the OTP sent to your device."
      );
    }, 1200);
  };

  // OTP handler (mock OTP check)
  const handleOtpConfirm = () => {
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
      setShowSuccess(true);
    }, 1000);
  };

  // Success dialog ok handler
  const handleSuccessOk = () => {
    setShowSuccess(false);
    router.push("/port-calls");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border border-[#232e45]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-2xl font-semibold">
            <UserCheck className="w-5 h-5" />
            Nominate Officer
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "select" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Select Nominated Officer
                </label>
                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    className={`w-full flex items-center justify-between px-3 py-2 rounded bg-[#232e45] text-white font-medium border border-[#232e45] focus:outline-none transition-all
                    ${
                      dropdownOpen
                        ? "ring-2 ring-blue-500"
                        : "hover:border-blue-500"
                    }`}
                    onClick={() => setDropdownOpen((v) => !v)}
                    disabled={loading}
                  >
                    {selectedOfficer ? (
                      `${
                        mockOfficers.find((o) => o.id === selectedOfficer)?.name
                      } (${
                        mockOfficers.find((o) => o.id === selectedOfficer)
                          ?.email
                      })`
                    ) : (
                      <span className="text-[#a3aed0]">
                        -- Select Officer --
                      </span>
                    )}
                    <ChevronDown
                      className="w-5 h-5 ml-2 text-[#a3aed0] transition-transform"
                      style={{
                        transform: dropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 top-full z-10 w-full mt-2 bg-background border border-[#232e45] rounded shadow-lg animate-fadeIn">
                      {mockOfficers.map((officer) => (
                        <button
                          type="button"
                          key={officer.id}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2
                            hover:bg-[#232e45] hover:text-white transition-all
                            ${
                              selectedOfficer === officer.id
                                ? "bg-[#232e45] text-blue-400"
                                : "text-[#a3aed0]"
                            }
                          `}
                          onClick={() => {
                            setSelectedOfficer(officer.id);
                            setDropdownOpen(false);
                          }}
                        >
                          <UserCheck className="w-4 h-4" />
                          <span className="font-medium">{officer.name}</span>
                          <span className="text-xs text-[#6e7ea5]">
                            {officer.email}
                          </span>
                          {selectedOfficer === officer.id && (
                            <Check className="w-4 h-4 ml-auto text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <style jsx>{`
                    .animate-fadeIn {
                      animation: fadeIn 0.2s ease;
                    }
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white">
                  Your Password
                </label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="max-w-full pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#a3aed0]" />
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full transition-all font-semibold"
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold text-white">
                  Enter OTP
                </span>
                <Badge variant="outline" className="ml-auto">
                  Sent to your device
                </Badge>
              </div>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="Enter OTP"
                disabled={loading}
                className="tracking-widest text-xl text-center"
              />
              <Button
                onClick={handleOtpConfirm}
                disabled={loading}
                className="w-full mt-3"
              >
                Confirm OTP
              </Button>
            </div>
          )}

          {step === "success" && showSuccess && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="text-green-500 w-14 h-14 mb-2 animate-bounce" />
              <h2 className="text-2xl font-bold text-green-700">Success!</h2>
              <p className="text-center text-muted-foreground">
                Officer nomination complete.
                <br />
                You will be redirected to the Port Calls page.
              </p>
              <Button
                className="mt-4 px-6 py-2 bg-primary text-white rounded shadow"
                onClick={handleSuccessOk}
              >
                Okay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
