'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types/auth';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;

    // Server layout already verified auth + admin role; just check
    // that the client-side store agrees before rendering children.
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    const role = user.role;
    if (role !== UserRole.ADMIN && role !== UserRole.MASTER) {
      router.replace('/');
      return;
    }

    setChecked(true);
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}
