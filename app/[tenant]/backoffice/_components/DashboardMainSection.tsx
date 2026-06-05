import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { getDashboardMainAction } from '@/actions/admin.actions';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  Wallet,
  Database,
  ArrowUpRight,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueChartCard } from './RevenueChartCard';
import { ProvidersSection } from './ProvidersSection';
import type { DashboardOverview, DashboardQueries } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return fmt(value);
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

// ─── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: ReactNode;
  subtext?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge?: ReactNode;
  highlight?: boolean;
  delay?: number;
}

function KpiCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  highlight = false,
  delay = 0,
}: KpiCardProps) {
  return (
    <Card
      className={`border-none overflow-hidden group h-full transition-all duration-300 hover:-translate-y-0.5 animate-fade-up ${
        highlight
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20'
          : 'shadow-glass hover:shadow-glass-strong bg-white'
      }`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <CardContent className="p-5 flex flex-col gap-3 h-full min-h-[136px]">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl shrink-0 ${highlight ? 'bg-white/15' : iconBg}`}>
            <Icon className={`w-5 h-5 ${highlight ? 'text-white' : iconColor}`} />
          </div>
          {badge}
        </div>
        <div className="flex-1">
          <p className={`text-[11px] font-bold uppercase tracking-[0.12em] mb-1.5 ${highlight ? 'text-white/65' : 'text-slate-400'}`}>
            {title}
          </p>
          <div className={`text-[1.7rem] font-black font-display leading-none ${highlight ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </div>
        </div>
        {subtext && (
          <p className={`text-xs font-medium leading-snug mt-auto ${highlight ? 'text-white/65' : 'text-slate-400'}`}>
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Top Queries Table ─────────────────────────────────────────────────────────

const MEDAL_CONFIG = [
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-slate-100', text: 'text-slate-500' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
];

function TopQueriesTable({ queries }: { queries: DashboardQueries }) {
  const maxVolume = Math.max(...queries.topQueryTypes.map((q) => q.totalQueries), 1);

  return (
    <Card className="shadow-glass border-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold">Top Consultas</CardTitle>
          <CardDescription className="text-xs">Consultas mais rentáveis do período</CardDescription>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-100 shrink-0">
          Por rentabilidade
        </span>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Consulta</th>
                <th className="px-5 py-3.5">Volume</th>
                <th className="px-5 py-3.5 text-right">Receita</th>
                <th className="px-5 py-3.5 text-right">Margem</th>
                <th className="px-5 py-3.5 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {queries.topQueryTypes.map((query, index) => {
                const margin = query.revenue > 0 ? (query.profit / query.revenue) * 100 : 0;
                const volumePct = (query.totalQueries / maxVolume) * 100;
                const medal = index < 3 ? MEDAL_CONFIG[index] : null;

                return (
                  <tr
                    key={query.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {medal ? (
                          <span
                            className={`w-7 h-7 rounded-lg ${medal.bg} ${medal.text} flex items-center justify-center text-xs font-black shrink-0`}
                          >
                            {index + 1}°
                          </span>
                        ) : (
                          <span className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center text-xs font-bold shrink-0">
                            {index + 1}
                          </span>
                        )}
                        <div>
                          <div className="font-semibold text-slate-800 text-sm leading-none mb-0.5">
                            {query.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{query.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">
                          {query.totalQueries.toLocaleString('pt-BR')}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/50 rounded-full transition-all duration-700"
                            style={{ width: `${volumePct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-700">
                        {fmtCompact(query.revenue)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          margin >= 40
                            ? 'bg-emerald-50 text-emerald-700'
                            : margin >= 20
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-emerald-600">{fmtCompact(query.profit)}</span>
                    </td>
                  </tr>
                );
              })}
              {queries.topQueryTypes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-300 text-sm">
                    Nenhuma consulta realizada neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
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

  const cachedCount = Math.round((queries.cacheHitRate / 100) * queries.totalQueries);

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/85 text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-3 right-3 w-28 h-28 rounded-full border border-white/10 pointer-events-none" />
      <div className="absolute top-10 right-10 w-14 h-14 rounded-full border border-white/8 pointer-events-none" />

      <CardHeader className="pb-3 relative">
        <CardTitle className="text-white text-base font-bold">Saúde do Negócio</CardTitle>
        <CardDescription className="text-white/55 text-xs">
          Visão financeira e operacional
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {/* Financial rows */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-white/65 text-sm">Saldo em Circulação</span>
            <span className="font-bold text-sm">{fmt(overview.totalBalanceInCirculation)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/15">
            <span className="text-white/65 text-sm">Custo Operacional</span>
            <span className="font-bold text-sm">{fmt(queries.totalCost)}</span>
          </div>
        </div>

        {/* Margin */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/65 text-xs font-medium flex items-center gap-1.5">
              <Activity className="w-3 h-3" />
              Margem de Lucro
            </span>
            <span className="text-emerald-300 font-black text-sm">{margin.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(margin, 100)}%` }}
            />
          </div>
        </div>

        {/* Query status breakdown */}
        <div>
          <p className="text-white/55 text-[11px] font-bold uppercase tracking-wider mb-2">
            Status das Consultas
          </p>
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-2.5">
            {successPct > 0 && (
              <div className="bg-emerald-400 rounded-l-full" style={{ width: `${successPct}%` }} />
            )}
            {failedPct > 0 && (
              <div className="bg-red-400" style={{ width: `${failedPct}%` }} />
            )}
            {pendingPct > 0 && (
              <div className="bg-amber-400 rounded-r-full" style={{ width: `${pendingPct}%` }} />
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-white/65">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              {queries.queriesByStatus.SUCCESS.toLocaleString('pt-BR')} OK
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
              {queries.queriesByStatus.FAILED.toLocaleString('pt-BR')} falhas
            </span>
            {queries.queriesByStatus.PENDING + queries.queriesByStatus.PROCESSING > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                {(
                  queries.queriesByStatus.PENDING + queries.queriesByStatus.PROCESSING
                ).toLocaleString('pt-BR')}{' '}
                pendentes
              </span>
            )}
          </div>
        </div>

        {/* Cache badge */}
        <div className="flex items-center justify-between pt-1 border-t border-white/15">
          <span className="text-white/65 text-xs">Cache ativo</span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold px-2.5 py-1 rounded-full">
            <Database className="w-3 h-3" />
            {queries.cacheHitRate.toFixed(1)}% — {cachedCount.toLocaleString('pt-BR')} hits
          </span>
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
  const [result, user] = await Promise.all([getDashboardMainAction(), getCurrentUser()]);

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-slate-400 py-16">
        Erro ao carregar dados do dashboard.
      </div>
    );
  }

  const { overview, queries } = result.data;
  const isMaster = user?.role === UserRole.MASTER;

  const profitMargin =
    overview.revenueThisMonth > 0
      ? ((overview.profitThisMonth / overview.revenueThisMonth) * 100).toFixed(1)
      : '0';

  const cachedCount = Math.round((queries.cacheHitRate / 100) * queries.totalQueries);

  return (
    <>
      {/* ── KPI Grid ──────────────────────────────────────────── */}
      <SectionTitle>Indicadores do Período</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <KpiCard
          title="Receita do Período"
          value={fmtCompact(overview.revenueThisMonth)}
          subtext={`+ ${fmt(overview.revenueToday)} gerado hoje`}
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          badge={
            overview.revenueToday > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                <ArrowUpRight className="w-3 h-3" />
                Ativo hoje
              </span>
            ) : undefined
          }
          delay={0}
        />
        <KpiCard
          title="Lucro Líquido"
          value={fmtCompact(overview.profitThisMonth)}
          subtext={`Margem de ${profitMargin}% sobre a receita`}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          highlight
          delay={80}
        />
        <KpiCard
          title="Consultas Realizadas"
          value={overview.queriesThisMonth.toLocaleString('pt-BR')}
          subtext={`${overview.queriesToday.toLocaleString('pt-BR')} consultas hoje`}
          icon={Zap}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          badge={
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                overview.querySuccessRate >= 95
                  ? 'bg-emerald-50 text-emerald-700'
                  : overview.querySuccessRate >= 80
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {overview.querySuccessRate}%
            </span>
          }
          delay={160}
        />
        <KpiCard
          title="Usuários Ativos"
          value={(overview.usersByStatus?.ACTIVE ?? 0).toLocaleString('pt-BR')}
          subtext={`${overview.newUsersThisMonth} novos cadastros este mês`}
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          badge={
            overview.newUsersThisMonth > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                <ArrowUpRight className="w-3 h-3" />+{overview.newUsersThisMonth}
              </span>
            ) : undefined
          }
          delay={240}
        />
        <KpiCard
          title="Saldo em Circulação"
          value={fmtCompact(overview.totalBalanceInCirculation)}
          subtext="Créditos disponíveis dos usuários"
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          delay={320}
        />
        <KpiCard
          title="Taxa de Cache"
          value={`${queries.cacheHitRate.toFixed(1)}%`}
          subtext={`${cachedCount.toLocaleString('pt-BR')} consultas servidas do cache`}
          icon={Database}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          badge={
            queries.cacheHitRate > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full bg-teal-50 text-teal-700">
                Economia
              </span>
            ) : undefined
          }
          delay={400}
        />
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <SectionTitle>Evolução de Receita</SectionTitle>
          <RevenueChartCard initialPeriod={initialPeriod} />

          <SectionTitle>Performance por Produto</SectionTitle>
          <TopQueriesTable queries={queries} />
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
