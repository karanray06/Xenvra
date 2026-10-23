"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "DELETE") {
      setError('Please type "DELETE" exactly to confirm.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Successful deletion -> redirect to home / login
      router.push("/login?message=account_deleted");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deletion failed");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setConfirmText("");
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-danger/40 bg-surface px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
      >
        <Trash2 className="h-4 w-4" />
        Delete Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-scale-in">
            <div className="flex items-start justify-between pb-3">
              <div className="flex items-center gap-2.5 text-danger">
                <div className="rounded-full bg-danger/10 p-2">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">
                  Delete Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              This action is <strong className="text-danger">irreversible</strong>.
              All your resumes, saved data, and account details will be permanently
              deleted immediately.
            </p>

            <form onSubmit={handleDelete} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1.5">
                  Type <span className="font-mono text-danger font-bold">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-danger-light p-3 text-xs text-danger">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || confirmText !== "DELETE"}
                  className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Permanently Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
