'use client';

import { ProvidersManager } from '@/components/admin/ProvidersManager';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProvidersPage() {
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
         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Provedores API</h1>
        <p className="text-slate-500 text-lg">Gerencie os provedores e verifique o status das integrações.</p>
      </div>
      <ProvidersManager />
    </div>
  );
}
