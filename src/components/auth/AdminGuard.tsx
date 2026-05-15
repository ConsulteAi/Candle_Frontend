'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMeAction } from '@/actions/auth.actions';
import { buildLoginRedirectPath, clearClientSession } from '@/lib/auth/client';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isResolvingSession, setIsResolvingSession] = useState(false);
  const hasValidatedProtectedSessionRef = useRef(false);

  useEffect(() => {
    // Helper to check if hydration is complete
    // In a real app we might use a custom hook for store hydration or persist.onFinish
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

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
          console.warn('[auth][admin-guard] session resolution failed, redirecting to login', {
            pathname,
          });
        }
        hasValidatedProtectedSessionRef.current = false;
        await clearClientSession();
        if (active) {
          router.replace(buildLoginRedirectPath(pathname || '/backoffice'));
        }
      }
      if (active) {
        setIsResolvingSession(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isHydrated, login, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasValidatedProtectedSessionRef.current = false;
    }
  }, [isAuthenticated]);

  // After hydration and session resolution, check role on client-side
  useEffect(() => {
    if (!isHydrated || isResolvingSession) return;

    const role = user?.role;
    if (isAuthenticated && role && role !== UserRole.ADMIN && role !== UserRole.MASTER) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth][admin-guard] client-side role check failed, redirecting to home', {
          role,
        });
      }
      router.replace('/');
    }
  }, [isHydrated, isResolvingSession, isAuthenticated, user, router]);

  if (!isHydrated || (!isAuthenticated && !user) || isResolvingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
