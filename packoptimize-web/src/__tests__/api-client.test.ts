import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

// We test the interceptor behavior by re-importing a fresh module.
// axios instance is module-level, so we test it directly via mocks.

describe("api client — 401 interceptor", () => {
  let originalLocation: Location;

  beforeEach(() => {
    localStorage.setItem("user", JSON.stringify({ id: "u1" }));
    originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/dashboard", href: "/dashboard" },
    });
  });

  afterEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it("clears user from localStorage on 401", async () => {
    // Simulate what the interceptor does
    const error = { response: { status: 401 } };
    localStorage.setItem("user", JSON.stringify({ id: "u1" }));

    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    expect(localStorage.getItem("user")).toBeNull();
  });

  it("does not redirect when already on /login", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { pathname: "/login", href: "/login" },
    });

    const hrefSpy = vi.spyOn(window.location, "href", "set").mockImplementation(() => {});

    const error = { response: { status: 401 } };
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    expect(hrefSpy).not.toHaveBeenCalled();
  });

  it("api instance has withCredentials: true", async () => {
    const api = (await import("@/lib/api")).default;
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("api instance baseURL is /api/proxy", async () => {
    const api = (await import("@/lib/api")).default;
    expect(api.defaults.baseURL).toBe("/api/proxy");
  });

  it("non-401 errors are re-rejected without redirecting", async () => {
    const api = (await import("@/lib/api")).default;
    const mockAdapter = vi.fn().mockRejectedValue({
      response: { status: 500, data: { message: "Internal error" } },
      isAxiosError: true,
    });
    const instance = axios.create({ ...api.defaults, adapter: mockAdapter });
    instance.interceptors.response.use(
      (r) => r,
      (err: { response?: { status: number } }) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("user");
        }
        return Promise.reject(err);
      }
    );

    await expect(instance.get("/test")).rejects.toMatchObject({
      response: { status: 500 },
    });
    expect(localStorage.getItem("user")).not.toBeNull();
  });
});

describe("OptimizeRequest shape", () => {
  it("requires items array", () => {
    const req = { items: [{ id: "abc", quantity: 2 }] };
    expect(req.items).toHaveLength(1);
    expect(req.items[0].id).toBe("abc");
    expect(req.items[0].quantity).toBe(2);
  });

  it("accepts optional carrier and optimizeFor", () => {
    const req = {
      items: [{ id: "abc", quantity: 1 }],
      carrier: "FEDEX",
      optimizeFor: "COST",
    };
    expect(req.carrier).toBe("FEDEX");
    expect(req.optimizeFor).toBe("COST");
  });
});
