'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMeAction } from '@/actions/auth.actions';
import { buildLoginRedirectPath, clearClientSession } from '@/lib/auth/client';
import { isPublicRoute } from '@/lib/auth/routes';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const publicRoute = isPublicRoute(pathname || '/');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isResolvingSession, setIsResolvingSession] = useState(false);
  const hasValidatedProtectedSessionRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (publicRoute) {
      setIsResolvingSession(false);
      hasValidatedProtectedSessionRef.current = false;
      return;
    }

    if (hasValidatedProtectedSessionRef.current) {
      return;
    }

    let active = true;
    setIsResolvingSession(true);

    (async () => {
      const result = await getMeAction();
      if (!active) return;

      if (result.success && result.data) {
        login({ user: result.data });
        hasValidatedProtectedSessionRef.current = true;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[auth][guard] session resolution failed, redirecting to login', {
            pathname,
          });
        }
        hasValidatedProtectedSessionRef.current = false;
        await clearClientSession();
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
