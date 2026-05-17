"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { adminApi } from "@/lib/admin-api";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import type { AdminTenantSummary } from "@/types/api";
import {
  MagnifyingGlass,
  ArrowUp,
  ArrowDown,
} from "@phosphor-icons/react";

type SortKey = keyof Pick<
  AdminTenantSummary,
  "name" | "plan" | "createdAt"
> | "_count.users" | "_count.optimizationRuns";

export default function AdminTenantsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !user.isSuperAdmin) router.replace("/dashboard");
  }, [user, router]);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: adminApi.getTenants,
    enabled: !!user?.isSuperAdmin,
  });

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (!user?.isSuperAdmin) return null;

  const getValue = (t: AdminTenantSummary, key: SortKey): string | number => {
    if (key === "_count.users") return t._count.users;
    if (key === "_count.optimizationRuns") return t._count.optimizationRuns;
    return t[key as keyof AdminTenantSummary] as string | number;
  };

  const filtered = (tenants ?? [])
    .filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = getValue(a, sortKey);
      const bv = getValue(b, sortKey);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ArrowUp size={13} className="inline ml-1" />
      ) : (
        <ArrowDown size={13} className="inline ml-1" />
      )
    ) : null;

  const cols: { label: string; key: SortKey }[] = [
    { label: "Tenant", key: "name" },
    { label: "Plan", key: "plan" },
    { label: "Users", key: "_count.users" },
    { label: "Runs", key: "_count.optimizationRuns" },
    { label: "Joined", key: "createdAt" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">All Tenants</h1>
          <p className="text-sm text-[#8B95A5] mt-1">
            {tenants?.length ?? 0} tenants on the platform
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-[#0B4228] font-medium hover:underline"
        >
          ← Back to overview
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B95A5]"
        />
        <input
          type="text"
          placeholder="Search by name or slug…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-[#E8EAED] bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#0B4228] focus:ring-1 focus:ring-[#0B4228]"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-[#E8EAED] overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8EAED] bg-[#F5F6F8]">
                {cols.map(({ label, key }) => (
                  <th
                    key={key}
                    className="px-5 py-3 text-left font-medium text-[#8B95A5] cursor-pointer select-none hover:text-[#111827] transition-colors"
                    onClick={() => toggleSort(key)}
                  >
                    {label}
                    <SortIcon col={key} />
                  </th>
                ))}
                <th className="px-5 py-3 text-left font-medium text-[#8B95A5]">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[#8B95A5]"
                  >
                    No tenants match your search.
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[#E8EAED] last:border-0 hover:bg-[#F5F6F8] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="font-medium text-[#111827]">{t.name}</div>
                    <div className="text-xs text-[#8B95A5]">{t.slug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-[#0B4228]/10 px-2.5 py-0.5 text-xs font-semibold text-[#0B4228]">
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">
                    {t._count.users}
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">
                    {t._count.optimizationRuns}
                  </td>
                  <td className="px-5 py-3 text-[#8B95A5]">
                    {new Date(t.createdAt).toLocaleDateString()}
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
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="text-[#0B4228] font-medium hover:underline"
                    >
                      View →
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
