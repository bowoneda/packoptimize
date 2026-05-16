import { create } from "zustand";
import type { User } from "@/types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },
  initialize: () => {
    if (typeof window === "undefined") return;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true });
      } catch {
        localStorage.removeItem("user");
      }
    }
  },
}));
