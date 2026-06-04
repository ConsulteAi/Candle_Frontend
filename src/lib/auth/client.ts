'use client';

import { logoutAction } from '@/actions/auth.actions';
import { extractTenantFromPathname, isAuthRoute, isPublicRoute } from '@/lib/auth/routes';
import { useAuthStore } from '@/store/authStore';

let sessionResetPromise: Promise<void> | null = null;

function normalizePathname(pathname?: string): string {
  if (!pathname || !pathname.startsWith('/')) {
    return '/';
  }

  return pathname;
}

export function buildLoginRedirectPath(pathname?: string): string {
  const normalizedPathname = normalizePathname(pathname);
  const tenant = extractTenantFromPathname(normalizedPathname);
  const loginBase = tenant ? `/${tenant}/login` : '/login';

  if (isAuthRoute(normalizedPathname) || isPublicRoute(normalizedPathname)) {
    return loginBase;
  }

  return `${loginBase}?redirect=${encodeURIComponent(normalizedPathname)}`;
}

export async function clearClientSession(): Promise<void> {
  if (sessionResetPromise) {
    return sessionResetPromise;
  }

  sessionResetPromise = (async () => {
    try {
      await logoutAction();
    } catch {
      // Ignore server-side logout failures; local cleanup still needs to happen.
    } finally {
      useAuthStore.getState().logout();
    }
  })().finally(() => {
    sessionResetPromise = null;
  });

  return sessionResetPromise;
}
