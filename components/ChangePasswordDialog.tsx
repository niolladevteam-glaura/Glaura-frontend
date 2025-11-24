import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePasswordDialog({
  open,
  onClose,
  onChangePassword,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onChangePassword: (current: string, next: string) => void;
  loading?: boolean;
  error?: string;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [validationError, setValidationError] = useState("");

  const validatePassword = (password: string) => {
    const errors = [];

    if (password.length < 8) {
      errors.push("minimum 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("capital letter");
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("symbol");
    }

    return errors;
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setNext(password);

    if (password.length > 0) {
      const errors = validatePassword(password);
      if (errors.length > 0) {
        setValidationError(`Password must contain: ${errors.join(", ")}`);
      } else {
        setValidationError("");
      }
    } else {
      setValidationError("");
    }
  };

  const handleSubmit = () => {
    const errors = validatePassword(next);
    if (errors.length > 0) {
      setValidationError(`Password must contain: ${errors.join(", ")}`);
      return;
    }
    onChangePassword(current, next);
  };

  if (!open) return null;

  const isMinLength = next.length >= 8;
  const hasCapital = /[A-Z]/.test(next);
  const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(next);
  const isValid = isMinLength && hasCapital && hasSymbol;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-background rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="font-bold mb-4">Change Password</h2>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="New password"
              value={next}
              onChange={handleNewPasswordChange}
            />
            {next.length > 0 && (
              <div className="text-xs space-y-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="font-medium text-gray-700 dark:text-gray-300">Password requirements:</div>
                <div className={`flex items-center gap-1 ${isMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{isMinLength ? '\u2713' : '\u2022'}</span>
                  Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1 ${hasCapital ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{hasCapital ? '✓' : '•'}</span>
                  Capital letter
                </div>
                <div className={`flex items-center gap-1 ${hasSymbol ? 'text-green-600' : 'text-gray-400'}`}>
                  <span>{hasSymbol ? '✓' : '•'}</span>
                  Symbol (!@#$%^&* etc.)
                </div>
              </div>
            )}
          </div>
          {validationError && <div className="text-red-500 text-sm">{validationError}</div>}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!current || !next || !isValid || loading}
            >
              {loading ? "Changing..." : "Change"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
