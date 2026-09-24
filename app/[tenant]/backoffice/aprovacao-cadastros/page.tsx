import { getUsersAction } from '@/actions/admin.actions';
import { PendingApprovalView } from '@/components/admin/PendingApprovalView';

export default async function AprovacaoCadastrosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 10;

  const result = await getUsersAction({
    page,
    limit,
    status: 'PENDING_VERIFICATION',
  });

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar usuários: {result.error}
      </div>
    );
  }

  return <PendingApprovalView initialData={result.data} />;
}
