'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Wallet,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getRevenueStatsAction } from '@/actions/admin.actions';
import type { DashboardOverview, DashboardQueries, RevenueStats } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtCompact(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1)}k`;
  return fmt(value);
}

const PERIOD_LABELS: Record<number, string> = {
  1: 'hoje',
  7: 'últimos 7 dias',
  15: 'últimos 15 dias',
  30: 'este mês',
  90: 'trimestre',
  180: 'semestre',
  365: 'este ano',
};

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
  loading?: boolean;
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
  loading = false,
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
          {loading ? (
            <div className={`h-8 w-28 rounded animate-pulse ${highlight ? 'bg-white/20' : 'bg-slate-100'}`} />
          ) : (
            <div className={`text-[1.7rem] font-black font-display leading-none ${highlight ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </div>
          )}
        </div>
        {subtext && !loading && (
          <p className={`text-xs font-medium leading-snug mt-auto ${highlight ? 'text-white/65' : 'text-slate-400'}`}>
            {subtext}
          </p>
        )}
        {loading && (
          <div className={`h-3 w-36 rounded animate-pulse ${highlight ? 'bg-white/20' : 'bg-slate-100'}`} />
        )}
      </CardContent>
    </Card>
  );
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

// ─── Main component ────────────────────────────────────────────────────────────

interface KpiSectionProps {
  initialPeriod: number;
  overview: DashboardOverview;
  queries: DashboardQueries;
}

export function KpiSection({ initialPeriod, overview, queries }: KpiSectionProps) {
  const searchParams = useSearchParams();
  const period = Number(searchParams.get('period')) || initialPeriod;
  const pLabel = PERIOD_LABELS[period] ?? `${period} dias`;

  const { data: revenueStats, isLoading: revenueLoading } = useSWR<RevenueStats>(
    ['kpi-revenue', period],
    () =>
      getRevenueStatsAction({ days: period }).then((res) => {
        if (res.success && res.data) return res.data as RevenueStats;
        throw new Error('Erro ao carregar receita');
      }),
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  const isToday = period === 1;

  // Revenue is period-aware (from revenueStats)
  const revenue = revenueStats?.totalRevenue ?? (isToday ? overview.revenueToday : overview.revenueThisMonth);

  // Profit: use today's or this month's (not period-aware from backend)
  const profit = isToday ? overview.profitToday : overview.profitThisMonth;
  const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

  // Queries: today's or this month's (not period-aware from backend)
  const queriesValue = isToday ? overview.queriesToday : overview.queriesThisMonth;
  const queriesLabel = isToday ? 'Consultas Hoje' : 'Consultas Este Mês';

  return (
    <>
      <SectionTitle>Indicadores — {pLabel}</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Receita — period-aware via SWR */}
        <KpiCard
          title="Receita"
          value={fmtCompact(revenue)}
          subtext={
            isToday
              ? `Total acumulado: ${fmtCompact(overview.totalRevenue)}`
              : `+ ${fmt(overview.revenueToday)} gerado hoje`
          }
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          loading={revenueLoading}
          badge={
            !revenueLoading && overview.revenueToday > 0 && !isToday ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                <ArrowUpRight className="w-3 h-3" />
                Ativo hoje
              </span>
            ) : undefined
          }
          delay={0}
        />

        {/* Lucro */}
        <KpiCard
          title="Lucro Líquido"
          value={fmtCompact(profit)}
          subtext={`Margem de ${profitMargin}% sobre a receita`}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          highlight
          delay={80}
        />

        {/* Consultas */}
        <KpiCard
          title={queriesLabel}
          value={queriesValue.toLocaleString('pt-BR')}
          subtext={
            isToday
              ? 'Realizadas no dia de hoje'
              : `${overview.queriesToday.toLocaleString('pt-BR')} realizadas hoje`
          }
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

        {/* Usuários Ativos */}
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

        {/* Saldo em Circulação */}
        <KpiCard
          title="Saldo em Circulação"
          value={fmtCompact(overview.totalBalanceInCirculation)}
          subtext="Créditos disponíveis dos usuários"
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          delay={320}
        />

        {/* Aguardando Verificação */}
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
    </>
  );
}
