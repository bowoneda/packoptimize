import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token");

  // Redirect unauthenticated users away from protected routes
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/items") ||
    pathname.startsWith("/boxes") ||
    pathname.startsWith("/optimize") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/api-docs") ||
    pathname.startsWith("/admin");

  if (isProtected && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/items/:path*",
    "/boxes/:path*",
    "/optimize/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/api-docs/:path*",
    "/admin/:path*",
  ],
};
