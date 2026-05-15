'use client';

import { logoutAction } from '@/actions/auth.actions';
import { isAuthRoute, isPublicRoute } from '@/lib/auth/routes';
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

  if (isAuthRoute(normalizedPathname) || isPublicRoute(normalizedPathname)) {
    return '/login';
  }

  return `/login?redirect=${encodeURIComponent(normalizedPathname)}`;
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
