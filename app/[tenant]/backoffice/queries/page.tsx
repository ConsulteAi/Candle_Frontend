import { getAdminQueriesAction, getQueryTypesAction } from '@/actions/admin.actions';
import { QueriesClientView } from '@/components/admin/QueriesClientView';
import type { AdminQueriesFilters, QueryType } from '@/types/admin';

export default async function QueriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;

  const getString = (key: string) =>
    typeof p[key] === 'string' ? (p[key] as string) : undefined;

  const filters: AdminQueriesFilters = {
    page: p.page ? parseInt(p.page as string) : 1,
    limit: 20,
    status: getString('status'),
    input: getString('input'),
    queryTypeId: getString('queryTypeId'),
    startDate: getString('startDate'),
    endDate: getString('endDate'),
  };

  const [result, queryTypesResult] = await Promise.all([
    getAdminQueriesAction(filters),
    getQueryTypesAction({ limit: 200, isActive: true }),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar consultas: {result.error}
      </div>
    );
  }

  const queryTypes: QueryType[] = queryTypesResult.success ? (queryTypesResult.data?.data ?? []) : [];

  return <QueriesClientView initialData={result.data} queryTypes={queryTypes} />;
}
