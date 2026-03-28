import { getApiTokensAction } from '@/actions/api-tokens.actions';
import { ApiTokensClientView } from '@/components/admin/ApiTokensClientView';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function ApiTokensPage() {
  try {
    const user = await AuthService.getMe();

    if (!user || user.role !== UserRole.MASTER) {
      redirect('/backoffice');
    }
  } catch {
    redirect('/backoffice');
  }

  const result = await getApiTokensAction();

  return (
    <ApiTokensClientView initialTokens={result.success ? result.data : []} />
  );
}
