"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initialize();
    setReady(true);
  }, [initialize]);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F6F8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0B4228] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8]" style={{ zoom: 0.9 }}>
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      <div className="md:pl-[280px]">
        {/* Desktop header — hidden on mobile */}
        <Header />

        {/* Mobile header — visible only on mobile */}
        <MobileHeader />

        {/* Main content — extra bottom padding on mobile for floating nav */}
        <main className="px-4 py-4 sm:px-6 sm:py-5 lg:p-8 pb-28 md:pb-8">
          {children}
        </main>
      </div>

      {/* Floating bottom nav — visible only on mobile */}
      <MobileBottomNav />
    </div>
  );
}
