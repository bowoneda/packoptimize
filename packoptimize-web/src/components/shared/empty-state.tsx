import type { Icon } from "@phosphor-icons/react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react";

interface EmptyStateProps {
  icon: Icon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F6F8] border border-gray-100">
        <IconComponent size={28} className="text-[#8B95A5]" />
      </div>
      <h3 className="text-base font-bold text-[#0B4228]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-[#8B95A5]">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            {actionLabel}
            <CaretRight size={14} weight="bold" />
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-[#0B4228] px-5 text-sm font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97]"
          >
            {actionLabel}
            <CaretRight size={14} weight="bold" />
          </button>
        )
      )}
    </div>
  );
}
