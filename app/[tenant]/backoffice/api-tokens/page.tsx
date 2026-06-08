import { getApiTokensAction } from '@/actions/api-tokens.actions';
import { ApiTokensClientView } from '@/components/admin/ApiTokensClientView';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function ApiTokensPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== UserRole.MASTER) redirect('/backoffice');

  const result = await getApiTokensAction();

  return (
    <ApiTokensClientView initialTokens={result.success ? result.data : []} />
  );
}
