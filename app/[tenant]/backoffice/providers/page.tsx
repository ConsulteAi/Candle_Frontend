import { ProvidersManager } from '@/components/admin/ProvidersManager';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { sanitizeUser } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function ProvidersPage() {
  try {
    const rawUser = await AuthService.getMe();
    const user = rawUser ? sanitizeUser(rawUser) : null;
    if (!user || user.role !== UserRole.MASTER) {
      redirect('/backoffice');
    }
  } catch {
    redirect('/backoffice');
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
