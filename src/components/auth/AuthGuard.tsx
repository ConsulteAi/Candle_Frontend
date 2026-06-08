'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMeAction } from '@/actions/auth.actions';
import { buildLoginRedirectPath } from '@/lib/auth/client';
import { isPublicRoute } from '@/lib/auth/routes';
import { Loader2 } from 'lucide-react';

// AuthGuard only calls getMeAction() when the Zustand store shows the user
// is NOT authenticated. This covers the "valid cookies but cleared store"
// edge case while eliminating the race between getMeAction() and page-level
// SWR queries that fire simultaneously when the user IS authenticated.
//
// When the user IS authenticated, server-side layouts validate the actual
// session tokens on every navigation (via getCurrentUser()), so a redundant
// client-side check here only creates competing refresh-token requests.

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();
  const pathname = usePathname();
  const publicRoute = isPublicRoute(pathname || '/');
  const [isResolvingSession, setIsResolvingSession] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    if (publicRoute) {
      setIsResolvingSession(false);
      return;
    }

    // Already authenticated in the store: trust it and skip the server call.
    // Server-side layouts re-validate tokens on every navigation.
    if (isAuthenticated) {
      setIsResolvingSession(false);
      return;
    }

    // Not authenticated — check if cookies (httpOnly) still carry a valid
    // session that predates the current Zustand state (e.g., store was cleared
    // but the browser still has fresh tokens). Only in this case do we make a
    // server round-trip.
    let active = true;
    setIsResolvingSession(true);

    (async () => {
      const result = await getMeAction();
      if (!active) return;

      if (result.success && result.data) {
        login({ user: result.data });
      } else {
        if (active) {
          router.replace(buildLoginRedirectPath(pathname || '/'));
        }
      }
      if (active) {
        setIsResolvingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated, login, pathname, publicRoute, router]);

  if (!isHydrated || (!publicRoute && isResolvingSession)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
