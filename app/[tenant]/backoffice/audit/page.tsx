import { getAuditEventsAction } from '@/actions/audit.actions';
import { AuditClientView } from '@/components/admin/AuditClientView';

export default async function AuditPage() {
  const result = await getAuditEventsAction({ page: 1, limit: 20 });

  const initialData = result.success && result.data
    ? result.data
    : { data: [], total: 0, page: 1, limit: 20 };

  return <AuditClientView initialData={initialData} />;
}
