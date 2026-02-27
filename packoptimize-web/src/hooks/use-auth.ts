"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "@/types/api";

export function useAuth() {
  const { token, user, isAuthenticated, login: storeLogin, logout: storeLogout, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = async (data: LoginRequest) => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    storeLogin(res.data.accessToken, res.data.user);
    router.push("/dashboard");
  };

  const register = async (data: RegisterRequest) => {
    const res = await api.post<RegisterResponse>("/auth/register", data);
    storeLogin(res.data.accessToken, res.data.user);
    router.push("/dashboard");
  };

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  return { token, user, isAuthenticated, login, register, logout };
}
