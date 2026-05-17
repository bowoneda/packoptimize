export interface AdminTenantSummary {
  id: string;
  name: string;
  slug: string;
  plan: string;
  isActive: boolean;
  createdAt: Date;
  _count: {
    users: number;
    items: number;
    optimizationRuns: number;
    apiKeys: number;
  };
}

export interface AdminTenantUser {
  id: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

export interface AdminTenantDetail extends AdminTenantSummary {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: Date;
  users: AdminTenantUser[];
  dailyRuns: { date: string; count: number }[];
  totalSavings: number;
}

export interface PlatformStats {
  tenantCount: number;
  userCount: number;
  completedOptimizationCount: number;
  planBreakdown: Record<string, number>;
  recentTenants: { id: string; name: string; plan: string; createdAt: Date }[];
}
