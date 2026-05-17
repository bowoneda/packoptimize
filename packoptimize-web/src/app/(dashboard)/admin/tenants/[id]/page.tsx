"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { adminApi } from "@/lib/admin-api";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import {
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";

export default function AdminTenantDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !user.isSuperAdmin) router.replace("/dashboard");
  }, [user, router]);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ["admin", "tenants", id],
    queryFn: () => adminApi.getTenant(id),
    enabled: !!user?.isSuperAdmin && !!id,
  });

  const [confirmSuspend, setConfirmSuspend] = useState(false);

  const mutation = useMutation({
    mutationFn: (isActive: boolean) => adminApi.updateTenantStatus(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      setConfirmSuspend(false);
    },
  });

  if (!user?.isSuperAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {isLoading ? (
            <div className="h-7 w-48 animate-pulse rounded-lg bg-[#E8EAED]" />
          ) : (
            <h1 className="text-2xl font-bold text-[#111827]">
              {tenant?.name}
            </h1>
          )}
          <p className="text-sm text-[#8B95A5] mt-1">Tenant detail</p>
        </div>
        <Link
          href="/admin/tenants"
          className="text-sm text-[#0B4228] font-medium hover:underline"
        >
          ← All tenants
        </Link>
      </div>

      {isLoading || !tenant ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <>
          {/* Info + Suspend */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tenant info */}
            <div className="rounded-2xl bg-white p-5 border border-[#E8EAED] shadow-sm space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#111827]">
                  Details
                </h2>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    tenant.isActive
                      ? "bg-[#91E440]/20 text-[#5a8e28]"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {tenant.isActive ? "Active" : "Suspended"}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ["Slug", tenant.slug],
                  ["Plan", tenant.plan],
                  ["Users", tenant._count.users],
                  ["Items", tenant._count.items],
                  ["Optimization runs", tenant._count.optimizationRuns],
                  [
                    "Total savings",
                    `$${Number(tenant.totalSavings).toFixed(2)}`,
                  ],
                  [
                    "Joined",
                    new Date(tenant.createdAt).toLocaleDateString(),
                  ],
                  [
                    "Stripe customer",
                    tenant.stripeCustomerId ?? "—",
                  ],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-[#8B95A5]">{label}</dt>
                    <dd className="font-medium text-[#111827]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Suspend / Reactivate */}
            <div className="rounded-2xl bg-white p-5 border border-[#E8EAED] shadow-sm flex flex-col justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[#111827] mb-1">
                  Account status
                </h2>
                <p className="text-sm text-[#8B95A5]">
                  {tenant.isActive
                    ? "Suspending will block all logins for this tenant immediately."
                    : "Reactivating will restore access for all users."}
                </p>
              </div>

              {tenant.isActive ? (
                confirmSuspend ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      Suspend {tenant.name}? This affects all their users.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => mutation.mutate(false)}
                        disabled={mutation.isPending}
                        className="flex-1 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
                      >
                        {mutation.isPending ? "Suspending…" : "Confirm suspend"}
                      </button>
                      <button
                        onClick={() => setConfirmSuspend(false)}
                        className="flex-1 rounded-full border border-[#E8EAED] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#F5F6F8] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmSuspend(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <WarningCircle size={16} />
                    Suspend tenant
                  </button>
                )
              ) : (
                <button
                  onClick={() => mutation.mutate(true)}
                  disabled={mutation.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0B4228] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115C3A] disabled:opacity-60 transition-colors"
                >
                  <CheckCircle size={16} />
                  {mutation.isPending ? "Reactivating…" : "Reactivate tenant"}
                </button>
              )}
            </div>
          </div>

          {/* 30-day sparkline */}
          {tenant.dailyRuns.length > 0 && (
            <div className="rounded-2xl bg-white p-5 border border-[#E8EAED] shadow-sm">
              <h2 className="text-base font-semibold text-[#111827] mb-4">
                Optimization runs — last 30 days
              </h2>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={tenant.dailyRuns}>
                  <defs>
                    <linearGradient id="runGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B4228" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0B4228" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#8B95A5" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8B95A5" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E8EAED",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0B4228"
                    strokeWidth={2}
                    fill="url(#runGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Users */}
          <div className="rounded-2xl bg-white border border-[#E8EAED] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E8EAED]">
              <h2 className="text-base font-semibold text-[#111827]">
                Users ({tenant.users.length})
              </h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8EAED] bg-[#F5F6F8]">
                  {["Email", "Role", "Last login", "Joined"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-medium text-[#8B95A5]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenant.users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-[#E8EAED] last:border-0 hover:bg-[#F5F6F8] transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-[#111827]">
                      {u.email}
                      {u.isSuperAdmin && (
                        <span className="ml-2 rounded-full bg-[#91E440] px-2 py-0.5 text-[10px] font-bold text-[#0B4228]">
                          SUPER ADMIN
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[#8B95A5]">{u.role}</td>
                    <td className="px-5 py-3 text-[#8B95A5]">
                      {u.lastLoginAt
                        ? new Date(u.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-5 py-3 text-[#8B95A5]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
