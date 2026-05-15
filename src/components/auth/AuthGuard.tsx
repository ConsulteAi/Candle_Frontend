'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getMeAction } from '@/actions/auth.actions';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isResolvingSession, setIsResolvingSession] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || isResolvingSession) return;

    // Se já está autenticado no store, não precisa verificar
    // (o AdminGuard já cuida de refresh de sessão quando necessário)
    if (isAuthenticated) return;

    let cancelled = false;
    setIsResolvingSession(true);

    (async () => {
      const result = await getMeAction();
      if (cancelled) return;

      if (result.success && result.data) {
        login({ user: result.data });
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[auth][guard] session resolution failed, redirecting to login', {
            pathname,
          });
        }
        logout();
        router.replace(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
      }
      setIsResolvingSession(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, isAuthenticated, isResolvingSession, login, logout, pathname, router]);

  if (!isHydrated || isResolvingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
