'use client';

import { QueryTypesManager } from '@/components/admin/QueryTypesManager';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function QueryTypesPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and not MASTER or ADMIN, redirect
    if (user && user.role !== UserRole.MASTER && user.role !== UserRole.ADMIN) {
      router.push('/backoffice');
    }
  }, [user, router]);

  // If user is not yet loaded or not MASTER/ADMIN, show loading
  if (!user || (user.role !== UserRole.MASTER && user.role !== UserRole.ADMIN)) {
    return (
       <div className="flex h-screen items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Tipos de Consulta</h1>
        <p className="text-slate-500 text-lg">Gerencie os tipos de consultas disponíveis no sistema.</p>
      </div>
      <QueryTypesManager />
    </div>
  );
}
