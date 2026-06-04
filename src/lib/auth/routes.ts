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

// All app routes live under /[tenant]/... so strip the first segment before matching.
function stripTenant(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return '/';
  return '/' + parts.slice(1).join('/');
}

export function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    PUBLIC_ROUTES.some((route) => matchesRoute(stripTenant(pathname), route))
  );
}

export function isAuthRoute(pathname: string): boolean {
  return (
    AUTH_ROUTES.some((route) => matchesRoute(pathname, route)) ||
    AUTH_ROUTES.some((route) => matchesRoute(stripTenant(pathname), route))
  );
}

export { AUTH_ROUTES, PUBLIC_ROUTES };
