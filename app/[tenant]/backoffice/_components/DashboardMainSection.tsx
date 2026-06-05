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
  Clock,
  ArrowUpRight,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueChartCard } from './RevenueChartCard';
import { ProvidersSection } from './ProvidersSection';
import { TopQueriesTablePaginated } from './TopQueriesTablePaginated';
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

function periodLabel(days: number): string {
  if (days === 1) return 'hoje';
  if (days === 7) return 'nos últimos 7 dias';
  if (days === 15) return 'nos últimos 15 dias';
  if (days === 30) return 'este mês';
  if (days === 90) return 'no trimestre';
  if (days === 180) return 'no semestre';
  return `nos últimos ${days} dias`;
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
      {/* Colored header strip */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4">
        <h3 className="text-white font-bold text-base font-display">Saúde do Negócio</h3>
        <p className="text-white/70 text-xs mt-0.5">Visão financeira e operacional</p>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Financial rows — dark text on white, high contrast */}
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

        {/* Margin */}
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

        {/* Query status breakdown */}
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

  const isToday = initialPeriod === 1;

  // Valores corretos por período
  const revenueValue = isToday ? overview.revenueToday : overview.revenueThisMonth;
  const profitValue = isToday ? overview.profitToday : overview.profitThisMonth;
  const queriesValue = isToday ? overview.queriesToday : overview.queriesThisMonth;

  const profitMargin =
    revenueValue > 0 ? ((profitValue / revenueValue) * 100).toFixed(1) : '0';

  const pLabel = periodLabel(initialPeriod);

  return (
    <>
      {/* ── KPI Grid ──────────────────────────────────────────── */}
      <SectionTitle>Indicadores — {pLabel}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <KpiCard
          title="Receita"
          value={fmtCompact(revenueValue)}
          subtext={
            isToday
              ? `Total acumulado: ${fmtCompact(overview.totalRevenue)}`
              : `+ ${fmt(overview.revenueToday)} gerado hoje`
          }
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          badge={
            overview.revenueToday > 0 && !isToday ? (
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
          value={fmtCompact(profitValue)}
          subtext={`Margem de ${profitMargin}% sobre a receita`}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          highlight
          delay={80}
        />
        <KpiCard
          title={isToday ? 'Consultas Hoje' : 'Consultas Este Mês'}
          value={queriesValue.toLocaleString('pt-BR')}
          subtext={isToday ? 'Realizadas no dia de hoje' : `${overview.queriesToday.toLocaleString('pt-BR')} realizadas hoje`}
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
          title="Aguardando Verificação"
          value={(overview.usersByStatus?.PENDING_VERIFICATION ?? 0).toLocaleString('pt-BR')}
          subtext="Usuários com cadastro pendente"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          badge={
            (overview.usersByStatus?.PENDING_VERIFICATION ?? 0) > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600">
                Atenção
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
          <TopQueriesTablePaginated />
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
