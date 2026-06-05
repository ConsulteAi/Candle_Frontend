import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { getDashboardMainAction } from '@/actions/admin.actions';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueChartCard } from './RevenueChartCard';
import { ProvidersSection } from './ProvidersSection';
import { TopQueriesTablePaginated } from './TopQueriesTablePaginated';
import { KpiSection } from './KpiSection';
import type { DashboardOverview, DashboardQueries } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Section Title ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
    </div>
  );
}

// ─── Operational Summary ───────────────────────────────────────────────────────

function OperationalSummary({
  overview,
  queries,
}: {
  overview: DashboardOverview;
  queries: DashboardQueries;
}) {
  const margin =
    queries.totalRevenue > 0 ? (queries.totalProfit / queries.totalRevenue) * 100 : 0;

  const totalForStatus =
    queries.queriesByStatus.SUCCESS +
    queries.queriesByStatus.FAILED +
    queries.queriesByStatus.PENDING +
    queries.queriesByStatus.PROCESSING;

  const successPct = totalForStatus > 0 ? (queries.queriesByStatus.SUCCESS / totalForStatus) * 100 : 0;
  const failedPct = totalForStatus > 0 ? (queries.queriesByStatus.FAILED / totalForStatus) * 100 : 0;
  const pendingPct =
    totalForStatus > 0
      ? ((queries.queriesByStatus.PENDING + queries.queriesByStatus.PROCESSING) / totalForStatus) * 100
      : 0;

  return (
    <Card className="shadow-glass border-none overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
        <h3 className="text-white font-bold text-base font-display">Saúde do Negócio</h3>
        <p className="text-white/70 text-xs mt-0.5">Visão financeira e operacional</p>
      </div>

      <CardContent className="p-5 space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
            <span className="text-slate-500 text-sm">Saldo em Circulação</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {fmt(overview.totalBalanceInCirculation)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-slate-500 text-sm">Custo Operacional</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums">
              {fmt(queries.totalCost)}
            </span>
          </div>
        </div>

        <div className="pt-1 border-t border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 text-xs font-medium flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Margem de Lucro
            </span>
            <span className="text-emerald-600 font-black text-sm">{margin.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(margin, 100)}%` }}
            />
          </div>
        </div>

        <div className="pt-1 border-t border-slate-100">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            Status das Consultas
          </p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
            {successPct > 0 && (
              <div className="bg-emerald-500 rounded-l-full" style={{ width: `${successPct}%` }} />
            )}
            {failedPct > 0 && (
              <div className="bg-red-400" style={{ width: `${failedPct}%` }} />
            )}
            {pendingPct > 0 && (
              <div className="bg-amber-400 rounded-r-full" style={{ width: `${pendingPct}%` }} />
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              {queries.queriesByStatus.SUCCESS.toLocaleString('pt-BR')} OK
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              {queries.queriesByStatus.FAILED.toLocaleString('pt-BR')} falhas
            </span>
            {queries.queriesByStatus.PENDING + queries.queriesByStatus.PROCESSING > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                {(
                  queries.queriesByStatus.PENDING + queries.queriesByStatus.PROCESSING
                ).toLocaleString('pt-BR')}{' '}
                pendentes
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Providers skeleton ────────────────────────────────────────────────────────

function ProvidersSkeleton() {
  return (
    <Card className="shadow-glass border-none">
      <CardHeader>
        <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-52 bg-slate-100 rounded animate-pulse mt-1.5" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main server component ─────────────────────────────────────────────────────

export async function DashboardMainSection({ initialPeriod }: { initialPeriod: number }) {
  const [result, user] = await Promise.all([
    getDashboardMainAction({ days: initialPeriod }),
    getCurrentUser(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-slate-400 py-16">
        Erro ao carregar dados do dashboard.
      </div>
    );
  }

  const { overview, queries } = result.data;
  const isMaster = user?.role === UserRole.MASTER;

  return (
    <>
      {/* KPI Section — client component, re-fetches revenue on period change */}
      <KpiSection
        initialPeriod={initialPeriod}
        overview={overview}
        queries={queries}
      />

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <SectionTitle>Evolução de Receita</SectionTitle>
          <RevenueChartCard initialPeriod={initialPeriod} />

          <SectionTitle>Performance por Produto</SectionTitle>
          <TopQueriesTablePaginated data={queries.topQueryTypes} />
        </div>

        {/* Right 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          {isMaster && (
            <>
              <SectionTitle>APIs Externas</SectionTitle>
              <Suspense fallback={<ProvidersSkeleton />}>
                <ProvidersSection />
              </Suspense>
            </>
          )}
          <SectionTitle>Saúde do Negócio</SectionTitle>
          <OperationalSummary overview={overview} queries={queries} />
        </div>
      </div>
    </>
  );
}
