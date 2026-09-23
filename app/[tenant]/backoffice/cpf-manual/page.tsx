import { getManualCpfUsersAction } from '@/actions/admin.actions';
import { ManualCpfUserView } from '@/components/admin/ManualCpfUserView';

export default async function ManualCpfUserPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 10;

  const result = await getManualCpfUsersAction({ page, limit });

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar usuários: {result.error}
      </div>
    );
  }

  return <ManualCpfUserView initialData={result.data} />;
}
