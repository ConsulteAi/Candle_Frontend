const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/termos',
  '/politica-de-privacidade',
  '/lgpd',
  '/sobre',
  '/cookies',
] as const;

const AUTH_ROUTES = ['/login', '/register'] as const;

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route));
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => matchesRoute(pathname, route));
}

export { AUTH_ROUTES, PUBLIC_ROUTES };
