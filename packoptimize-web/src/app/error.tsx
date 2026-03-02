"use client";

import Link from "next/link";
import { Intersect, WarningCircle, ArrowCounterClockwise, House } from "@phosphor-icons/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F6F8] px-5">
      <div className="mx-auto max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B4228]">
            <Intersect size={18} weight="bold" className="text-[#91E440]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#0B4228]">PackOptimize</span>
        </Link>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 border border-red-100">
          <WarningCircle size={36} className="text-red-400" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold text-[#0B4228]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#8B95A5]">
          An unexpected error occurred. This has been logged and we&apos;re working on it.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs font-mono text-[#8B95A5] bg-white rounded-lg px-3 py-1.5 border border-gray-100 inline-block">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0B4228] px-6 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            <ArrowCounterClockwise size={16} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8EAED] bg-white px-6 text-sm font-semibold text-[#0B4228] transition-all hover:bg-[#F5F6F8]"
          >
            <House size={16} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
