import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getTenantByHost } from "./src/lib/tenant/config";
import {
  TENANT_CONFIG_HEADER,
  TENANT_ID_HEADER,
  encodeTenantConfigHeader,
  normalizeHost,
} from "./src/lib/tenant/request-context";
import { isPublicRoute } from "./src/lib/auth/routes";
import type { TenantConfig } from "./src/lib/tenant/config";

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
 * Monta os headers de request propagados ao Server Component.
 * Sempre sobrescreve/remove os valores recebidos do cliente — o header é fonte
 * interna de verdade, não pode ser spoofado de fora.
 */
const buildTenantHeaders = (request: NextRequest, tenant: TenantConfig) => {
  const headers = new Headers(request.headers);
  headers.delete(TENANT_ID_HEADER);
  headers.delete(TENANT_CONFIG_HEADER);

  headers.set(TENANT_ID_HEADER, tenant.id);

  const encoded = encodeTenantConfigHeader(tenant);
  if (encoded) {
    headers.set(TENANT_CONFIG_HEADER, encoded);
  }

  return headers;
};

/**
 * Middleware para proteção de rotas e Multi-tenant
 */
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = request.nextUrl;

  // 1. Tenant Resolution
  const hostname = normalizeHost(request.headers.get("host"));
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
  // Propagamos o tenant já resolvido via request header para que o
  // `app/[tenant]/layout.tsx` NÃO precise resolver de novo (era 1 fetch extra
  // por request, no caminho crítico).
  const requestHeaders = buildTenantHeaders(request, tenant);

  if (tenant) {
    url.pathname = `/${tenant.id}${pathname}`;
    return withCsrfCookie(
      request,
      NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
    );
  }

  return withCsrfCookie(
    request,
    NextResponse.next({ request: { headers: requestHeaders } }),
  );
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
