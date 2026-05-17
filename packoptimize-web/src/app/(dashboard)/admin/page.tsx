"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { adminApi } from "@/lib/admin-api";
import { CardSkeleton } from "@/components/shared/card-skeleton";
import {
  Buildings,
  Users,
  Package,
  ChartBar,
  ArrowRight,
} from "@phosphor-icons/react";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isSuperAdmin) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.getStats,
    enabled: !!user?.isSuperAdmin,
  });

  const { data: recentTenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: adminApi.getTenants,
    enabled: !!user?.isSuperAdmin,
  });

  if (!user?.isSuperAdmin) return null;

  const kpis = [
    {
      label: "Total Tenants",
      value: stats?.tenantCount ?? 0,
      icon: Buildings,
      color: "bg-[#0B4228]/10 text-[#0B4228]",
    },
    {
      label: "Total Users",
      value: stats?.userCount ?? 0,
      icon: Users,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Completed Optimizations",
      value: stats?.completedOptimizationCount ?? 0,
      icon: Package,
      color: "bg-[#91E440]/20 text-[#5a8e28]",
    },
    {
      label: "Plans in Use",
      value: Object.keys(stats?.planBreakdown ?? {}).length,
      icon: ChartBar,
      color: "bg-purple-50 text-purple-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Platform Admin</h1>
        <p className="text-sm text-[#8B95A5] mt-1">
          Platform-wide overview — visible to super admins only
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl bg-white p-5 shadow-sm border border-[#E8EAED]"
            >
              <div className={`inline-flex rounded-xl p-2.5 ${color}`}>
                <Icon size={22} weight="duotone" />
              </div>
              <p className="mt-3 text-2xl font-bold text-[#111827]">
                {value.toLocaleString()}
              </p>
              <p className="text-sm text-[#8B95A5]">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Plan Breakdown */}
      {stats && (
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#E8EAED]">
          <h2 className="text-base font-semibold text-[#111827] mb-4">
            Plan Breakdown
          </h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => (
              <div
                key={plan}
                className="flex items-center gap-2 rounded-full border border-[#E8EAED] px-4 py-1.5"
              >
                <span className="text-sm font-medium text-[#111827]">
                  {plan}
                </span>
                <span className="rounded-full bg-[#91E440] px-2 py-0.5 text-xs font-bold text-[#0B4228]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tenants */}
      <div className="rounded-2xl bg-white shadow-sm border border-[#E8EAED] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8EAED]">
          <h2 className="text-base font-semibold text-[#111827]">
            Recent Sign-ups
          </h2>
          <Link
            href="/admin/tenants"
            className="flex items-center gap-1 text-sm text-[#0B4228] font-medium hover:underline"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {tenantsLoading ? (
          <div className="p-5">
            <CardSkeleton />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EAED] bg-[#F5F6F8]">
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Tenant
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Slug
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Plan
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Status
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Users
                </th>
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Joined
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {(recentTenants ?? []).slice(0, 5).map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[#E8EAED] last:border-0 hover:bg-[#F5F6F8] transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-[#111827]">
                    {t.name}
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">{t.slug}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#0B4228]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0B4228]">
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        t.isActive
                          ? "bg-[#91E440]/20 text-[#5a8e28]"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {t.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">
                    {t._count.users}
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="text-[#0B4228] hover:underline font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
