import { getTransactionsAction } from '@/actions/admin.actions';
import { RechargeAvailabilityCard } from '@/components/admin/RechargeAvailabilityCard';
import { TransactionsClientView } from '@/components/admin/TransactionsClientView';
import type { TransactionFilters } from '@/types/admin';

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const p = await searchParams;

  const getString = (key: string) =>
    typeof p[key] === 'string' ? (p[key] as string) : undefined;

  const filters: TransactionFilters = {
    page: p.page ? parseInt(p.page as string) : 1,
    limit: 10,
    status: getString('status'),
    billingType: getString('billingType'),
    startDate: getString('startDate'),
    endDate: getString('endDate'),
  };

  const result = await getTransactionsAction(filters);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-red-500">
        Erro ao carregar transações: {result.error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RechargeAvailabilityCard />
      <TransactionsClientView initialData={result.data} />
    </div>
  );
}
