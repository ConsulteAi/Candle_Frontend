import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/termos',
  '/privacidade',
  '/lgpd',
  '/sobre',
  '/cookies',
  '/consulta', // Allow catalog access
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

/**
 * Proxy middleware para proteção de rotas
 * Redireciona usuários não autenticados para /login
 * Redireciona usuários autenticados das páginas de auth para /dashboard
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route matches a public route or starts with public path
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if it's an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get access token from cookies (will be set by server actions)
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // If trying to access auth pages while authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected route without authentication
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter to return to original page after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow request to proceed
  return NextResponse.next();
}

/**
 * Configuração de quais rotas o proxy middleware deve ser executado
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
