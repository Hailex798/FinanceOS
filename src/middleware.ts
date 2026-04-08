import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_ROUTES = new Set(["/login", "/signup"]);

function isStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  );
}

function isPublicPath(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname) || pathname.startsWith("/api/auth") || isStaticPath(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublicPath(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token && AUTH_ROUTES.has(pathname)) {
      const destination = request.nextUrl.searchParams.get("next") ?? "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }

    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"]
};
