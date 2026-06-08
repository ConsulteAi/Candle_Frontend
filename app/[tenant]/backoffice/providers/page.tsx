import { ProvidersManager } from '@/components/admin/ProvidersManager';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function ProvidersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== UserRole.MASTER) redirect('/backoffice');

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
