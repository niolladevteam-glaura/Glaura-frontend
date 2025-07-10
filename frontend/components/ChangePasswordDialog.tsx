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

  if (!open) return null;

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
          <Input
            type="password"
            placeholder="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={() => onChangePassword(current, next)}
              disabled={!current || !next || loading}
            >
              {loading ? "Changing..." : "Change"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
