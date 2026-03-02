import Link from "next/link";
import { Intersect, MagnifyingGlass, House, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
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
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-gray-100">
          <MagnifyingGlass size={36} className="text-[#8B95A5]" />
        </div>

        {/* Text */}
        <h1 className="text-5xl font-extrabold text-[#0B4228]">404</h1>
        <p className="mt-2 text-lg font-semibold text-[#0B4228]">Page not found</p>
        <p className="mt-2 text-sm text-[#8B95A5]">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0B4228] px-6 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            <House size={16} />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#E8EAED] bg-white px-6 text-sm font-semibold text-[#0B4228] transition-all hover:bg-[#F5F6F8]"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
