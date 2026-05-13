'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMeAction } from '@/actions/auth.actions';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isResolvingSession, setIsResolvingSession] = useState(false);

  useEffect(() => {
    // Helper to check if hydration is complete
    // In a real app we might use a custom hook for store hydration or persist.onFinish
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || user || isAuthenticated || isResolvingSession) return;

    let cancelled = false;
    setIsResolvingSession(true);

    (async () => {
      const result = await getMeAction();
      if (cancelled) return;

      if (result.success && result.data) {
        login({ user: result.data });
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[auth][admin-guard] session resolution failed, redirecting to login', {
            pathname,
          });
        }
        logout();
        router.replace(`/login?redirect=${encodeURIComponent(pathname || '/backoffice')}`);
      }
      setIsResolvingSession(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, isAuthenticated, isResolvingSession, login, logout, pathname, router, user]);

  if (!isHydrated || (!isAuthenticated && !user) || isResolvingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
