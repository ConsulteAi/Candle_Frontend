'use client';

import { TenantsManager } from '@/components/admin/TenantsManager';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TenantsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== UserRole.MASTER) {
      router.push('/backoffice');
    }
  }, [user, router]);

  if (!user || user.role !== UserRole.MASTER) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
          Tenants
        </h1>
        <p className="text-slate-500 text-lg">
          Gerencie os tenants da plataforma e suas configurações de pagamento.
        </p>
      </div>
      <TenantsManager />
    </div>
  );
}
