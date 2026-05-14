import { TenantsManager } from '@/components/admin/TenantsManager';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { sanitizeUser } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function TenantsPage() {
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
