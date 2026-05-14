import { QueryTypesManager } from '@/components/admin/QueryTypesManager';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function QueryTypesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER)) {
    redirect('/backoffice');
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
