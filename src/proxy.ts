import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/app",
  "/friends",
  "/stories",
  "/notifications",
  "/settings",
];

const authRoutes = ["/login", "/register"];

const isProtected = (pathname: string) =>
  protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasSession = request.cookies.has("relay_session");

  if (isProtected(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authRoutes.includes(pathname) && hasSession) {
    const redirectTo = searchParams.get("redirect");

    const isValidRedirect =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//");

    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = isValidRedirect ? redirectTo : "/app";
    targetUrl.search = "";

    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/friends/:path*",
    "/stories/:path*",
    "/notifications/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
