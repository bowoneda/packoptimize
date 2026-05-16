import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/api";

const mockUser: User = {
  id: "user-1",
  email: "admin@swiftship.com",
  role: "ADMIN",
  tenantId: "tenant-1",
  tenantName: "SwiftShip",
};

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe("auth-store — login", () => {
  it("sets user and isAuthenticated to true", () => {
    useAuthStore.getState().login(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("persists user to localStorage", () => {
    useAuthStore.getState().login(mockUser);
    const stored = localStorage.getItem("user");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(mockUser);
  });
});

describe("auth-store — logout", () => {
  it("clears user and sets isAuthenticated to false", () => {
    useAuthStore.getState().login(mockUser);
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("removes user from localStorage", () => {
    useAuthStore.getState().login(mockUser);
    useAuthStore.getState().logout();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

describe("auth-store — initialize", () => {
  it("restores user from localStorage on initialize", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("does nothing when localStorage is empty", () => {
    useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("clears corrupted localStorage value gracefully", () => {
    localStorage.setItem("user", "not-valid-json{{{");
    useAuthStore.getState().initialize();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("user")).toBeNull();
  });
});
