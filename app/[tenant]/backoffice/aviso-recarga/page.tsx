import { getRechargeSuspendedNoticeAction } from '@/actions/global-config.actions';
import { RechargeSuspendedNoticeSettingsView } from '@/components/admin/RechargeSuspendedNoticeSettingsView';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { redirect } from 'next/navigation';

export default async function RechargeSuspendedNoticeSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== UserRole.MASTER) redirect('/backoffice');

  const result = await getRechargeSuspendedNoticeAction();

  return (
    <RechargeSuspendedNoticeSettingsView
      initialConfig={result.success ? result.data : null}
    />
  );
}
