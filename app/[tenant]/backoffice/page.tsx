import { Suspense } from 'react';
import { DashboardHeader } from './_components/DashboardHeader';
import { DashboardMainSection } from './_components/DashboardMainSection';
import { DashboardSkeleton } from './_components/DashboardSkeleton';

interface BackofficePageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function BackofficePage({ searchParams }: BackofficePageProps) {
  const { period } = await searchParams;
  const initialPeriod = Number(period) || 30;

  return (
    <div className="space-y-8">
      <DashboardHeader initialPeriod={initialPeriod} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardMainSection initialPeriod={initialPeriod} />
      </Suspense>
    </div>
  );
}
