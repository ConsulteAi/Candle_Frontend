import { 
  getDashboardOverviewAction,
  getProviderStatsAction,
  getDashboardQueriesAction
} from '@/actions/admin.actions';
import { DashboardView } from '@/components/admin/DashboardView';

interface BackofficePageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function BackofficePage({ searchParams }: BackofficePageProps) {
  const { period } = await searchParams;
  const initialPeriod = Number(period) || 30;

  // Revenue is now fetched client-side in DashboardView (SWR)
  const [overviewRes, providersRes, queriesRes] = await Promise.all([
    getDashboardOverviewAction(),
    getProviderStatsAction(),
    getDashboardQueriesAction()
  ]);

  return (
    <DashboardView 
      overview={overviewRes.success ? overviewRes.data! : null}
      providerStats={providersRes.success ? providersRes.data! : null}
      queriesStats={queriesRes.success ? queriesRes.data! : null}
      initialPeriod={initialPeriod}
    />
  );
}
