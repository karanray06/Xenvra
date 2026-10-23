"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-50 p-6 font-sans">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Application Error
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            A critical error occurred. Please refresh or try again.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
