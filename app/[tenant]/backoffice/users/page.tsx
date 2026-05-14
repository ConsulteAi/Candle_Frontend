import { getUsersAction } from '@/actions/admin.actions';
import { UsersClientView } from '@/components/admin/UsersClientView';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { sanitizeUser } from '@/lib/utils';
import { redirect } from 'next/navigation';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const rawUser = await AuthService.getMe();
    const user = rawUser ? sanitizeUser(rawUser) : null;
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.MASTER)) {
      redirect('/backoffice');
    }
  } catch {
    redirect('/backoffice');
  }

  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 10;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const result = await getUsersAction({
    page,
    limit,
    search,
    status
  });

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar usuários: {result.error}
      </div>
    );
  }

  return <UsersClientView initialData={result.data} />;
}
