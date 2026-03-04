import { 
  getDashboardOverviewAction, 
  getRevenueStatsAction,
  getProviderStatsAction,
  getDashboardQueriesAction
} from '@/actions/admin.actions';
import { DashboardView } from '@/components/admin/DashboardView';

export default async function BackofficePage() {
  // Parallel fetching
  const [overviewRes, revenueRes, providersRes, queriesRes] = await Promise.all([
    getDashboardOverviewAction(),
    getRevenueStatsAction({ days: 30 }),
    getProviderStatsAction(),
    getDashboardQueriesAction()
  ]);

  return (
    <DashboardView 
      overview={overviewRes.success ? overviewRes.data! : null}
      revenueData={revenueRes.success ? revenueRes.data! : null}
      providerStats={providersRes.success ? providersRes.data! : null}
      queriesStats={queriesRes.success ? queriesRes.data! : null}
    />
  );
}
