import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantByHost } from "./src/lib/tenant/config";
import { isPublicRoute } from "./src/lib/auth/routes";

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
  const publicRoute = isPublicRoute(pathname);
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = !!accessToken || !!refreshToken;

  // Se tentar acessar protected route sem estar logado
  if (!publicRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return withCsrfCookie(request, NextResponse.redirect(loginUrl));
  }

  // 3. Rewrite request to the tenant folder
  // Ex: /home -> /[tenant]/home
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$).*)",
  ],
};
