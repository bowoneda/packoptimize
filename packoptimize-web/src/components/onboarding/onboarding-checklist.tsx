"use client";

import Link from "next/link";
import {
  Package,
  Cube,
  Lightning,
  Check,
  CaretRight,
} from "@phosphor-icons/react";

interface OnboardingChecklistProps {
  hasBoxes: boolean;
  hasItems: boolean;
  hasRuns: boolean;
}

const steps = [
  {
    key: "boxes" as const,
    title: "Add your box inventory",
    description: "Define the boxes you use for shipping — inner dimensions, cost, and weight.",
    href: "/boxes",
    icon: Cube,
    cta: "Add Boxes",
  },
  {
    key: "items" as const,
    title: "Add your product catalog",
    description: "Enter your items with dimensions, weight, fragility, and rotation settings.",
    href: "/items",
    icon: Package,
    cta: "Add Items",
  },
  {
    key: "optimize" as const,
    title: "Run your first optimization",
    description: "Select items, choose a carrier, and let the 3D engine find the best fit.",
    href: "/optimize",
    icon: Lightning,
    cta: "Start Optimizing",
  },
];

export function OnboardingChecklist({
  hasBoxes,
  hasItems,
  hasRuns,
}: OnboardingChecklistProps) {
  const completion: Record<string, boolean> = {
    boxes: hasBoxes,
    items: hasItems,
    optimize: hasRuns,
  };

  const completedCount = Object.values(completion).filter(Boolean).length;
  const allComplete = completedCount === 3;

  if (allComplete) return null;

  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-base font-bold text-[#0B4228]">Get started with PackOptimize</h3>
          <p className="text-sm text-[#8B95A5] mt-0.5">
            Complete these steps to start saving on shipping.
          </p>
        </div>
        <span className="text-xs font-bold text-[#91E440] bg-[#91E440]/10 rounded-full px-2.5 py-1 shrink-0">
          {completedCount}/3
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 mb-5 h-1.5 w-full rounded-full bg-[#E8EAED] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#0B4228] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const isDone = completion[step.key];
          // Find the first incomplete step
          const firstIncompleteKey = steps.find((s) => !completion[s.key])?.key;
          const isCurrent = step.key === firstIncompleteKey;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
                isDone
                  ? "border-[#91E440]/30 bg-[#91E440]/5"
                  : isCurrent
                  ? "border-[#0B4228]/15 bg-[#F5F6F8]"
                  : "border-gray-100 bg-white opacity-60"
              }`}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isDone
                    ? "bg-[#91E440] text-[#0B4228]"
                    : isCurrent
                    ? "bg-[#0B4228] text-[#91E440]"
                    : "bg-[#E8EAED] text-[#8B95A5]"
                }`}
              >
                {isDone ? <Check size={18} weight="bold" /> : <step.icon size={18} />}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isDone ? "text-[#0B4228] line-through decoration-[#91E440]" : "text-[#0B4228]"
                  }`}
                >
                  {step.title}
                </p>
                {!isDone && (
                  <p className="text-xs text-[#8B95A5] mt-0.5 hidden sm:block">{step.description}</p>
                )}
              </div>

              {/* CTA */}
              {!isDone && isCurrent && (
                <Link
                  href={step.href}
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-[#0B4228] px-4 text-xs font-semibold text-white transition-all hover:bg-[#115C3A] active:scale-[0.97] shrink-0"
                >
                  {step.cta}
                  <CaretRight size={12} weight="bold" />
                </Link>
              )}
              {isDone && (
                <span className="text-xs font-bold text-[#91E440] shrink-0">Done</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
