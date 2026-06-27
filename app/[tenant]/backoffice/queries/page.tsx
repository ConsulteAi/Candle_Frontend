import { getAdminQueriesAction } from '@/actions/admin.actions';
import { QueriesClientView } from '@/components/admin/QueriesClientView';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import type { AdminQueriesFilters } from '@/types/admin';

export default async function QueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [p, user] = await Promise.all([searchParams, getCurrentUser()]);

  const getString = (key: string) =>
    typeof p[key] === 'string' ? (p[key] as string) : undefined;

  const filters: AdminQueriesFilters = {
    page: p.page ? parseInt(p.page as string) : 1,
    limit: 20,
    status: getString('status'),
    input: getString('input'),
    startDate: getString('startDate'),
    endDate: getString('endDate'),
  };

  const result = await getAdminQueriesAction(filters);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar consultas: {result.error}
      </div>
    );
  }

  return (
    <QueriesClientView
      initialData={result.data}
      isMaster={user?.role === UserRole.MASTER}
    />
  );
}
