import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantByHost } from "./src/lib/tenant/config";

const isProduction = process.env.NODE_ENV === "production";

const withCsrfCookie = (request: NextRequest, response: NextResponse) => {
  if (!request.cookies.get("csrfToken")?.value) {
    response.cookies.set("csrfToken", crypto.randomUUID().replace(/-/g, ""), {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
};

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/termos",
  "/politica-de-privacidade",
  "/lgpd",
  "/sobre",
  "/cookies",
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register"];

/**
 * Middleware para proteção de rotas e Multi-tenant
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = request.nextUrl;

  // 1. Tenant Resolution
  const hostname = request.headers.get("host") || "";
  const tenant = await getTenantByHost(hostname);

  // 2. Authentication Checks
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = !!accessToken || !!refreshToken;

  // Se tentar acessar auth pages (ex: /login) estando logado, manda pro dashboard
  if (isAuthRoute && isAuthenticated) {
    url.pathname = "/dashboard";
    return withCsrfCookie(request, NextResponse.redirect(url));
  }

  // Se tentar acessar protected route sem estar logado
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return withCsrfCookie(request, NextResponse.redirect(loginUrl));
  }

  // 3. Rewrite request to the tenant folder
  // Ex: /dashboard -> /[tenant]/dashboard
  if (tenant) {
    url.pathname = `/${tenant.id}${pathname}`;
    return withCsrfCookie(request, NextResponse.rewrite(url));
  }

  return withCsrfCookie(request, NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (if any global APIs need to bypass tenant rewrite)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
