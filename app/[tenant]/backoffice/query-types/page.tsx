import { QueryTypesManager } from '@/components/admin/QueryTypesManager';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { sanitizeUser } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function QueryTypesPage() {
  try {
    const rawUser = await AuthService.getMe();
    const user = rawUser ? sanitizeUser(rawUser) : null;
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER)) {
      redirect('/backoffice');
    }
  } catch {
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
