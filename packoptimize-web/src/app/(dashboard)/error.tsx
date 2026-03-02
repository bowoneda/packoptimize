"use client";

import { WarningCircle, ArrowCounterClockwise } from "@phosphor-icons/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
        <WarningCircle size={28} className="text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-[#0B4228]">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-[#8B95A5]">
        An error occurred loading this page. Try again or go back to the dashboard.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs font-mono text-[#8B95A5] bg-white rounded-lg px-3 py-1.5 border border-gray-100">
          {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
      >
        <ArrowCounterClockwise size={14} />
        Try Again
      </button>
    </div>
  );
}
