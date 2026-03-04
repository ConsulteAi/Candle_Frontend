import { getTransactionsAction } from '@/actions/admin.actions';
import { TransactionsClientView } from '@/components/admin/TransactionsClientView';
import { TransactionFilters } from '@/types/admin';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
  const limit = 20;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const filters: TransactionFilters = {
    page,
    limit,
    status
  };

  const result = await getTransactionsAction(filters);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar transações: {result.error}
      </div>
    );
  }

  return <TransactionsClientView initialData={result.data} />;
}
