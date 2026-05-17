import api from "./api";
import type {
  PlatformStats,
  AdminTenantSummary,
  AdminTenantDetail,
} from "@/types/api";

export const adminApi = {
  getStats: (): Promise<PlatformStats> =>
    api.get<PlatformStats>("/admin/stats").then((r) => r.data),

  getTenants: (): Promise<AdminTenantSummary[]> =>
    api.get<AdminTenantSummary[]>("/admin/tenants").then((r) => r.data),

  getTenant: (id: string): Promise<AdminTenantDetail> =>
    api.get<AdminTenantDetail>(`/admin/tenants/${id}`).then((r) => r.data),

  updateTenantStatus: (
    id: string,
    isActive: boolean,
  ): Promise<{ id: string; isActive: boolean }> =>
    api
      .put<{ id: string; isActive: boolean }>(`/admin/tenants/${id}/status`, {
        isActive,
      })
      .then((r) => r.data),
};
