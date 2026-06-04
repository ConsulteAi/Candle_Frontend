import { Suspense } from 'react';
import { getDashboardMainAction } from '@/actions/admin.actions';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RevenueChartCard } from './RevenueChartCard';
import { ProvidersSection } from './ProvidersSection';
import type { DashboardOverview, DashboardQueries } from '@/types/admin';

// --- StatCard ---

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtext?: string;
  icon: LucideIcon;
  colorClass: string;
  highlight?: boolean;
}

function StatCard({ title, value, subtext, icon: Icon, colorClass, highlight = false }: StatCardProps) {
  return (
    <Card
      className={`border-none shadow-glass hover:shadow-glass-strong transition-all duration-300 overflow-hidden relative group h-full ${
        highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/20' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon className="w-24 h-24 -mr-4 -mt-4 transform rotate-12" />
      </div>
      <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div
              className={`p-3 rounded-xl shadow-sm ${
                highlight ? 'bg-white/10 text-white' : `bg-white ${colorClass} bg-opacity-10`
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-sm font-medium uppercase tracking-wider ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>
              {title}
            </h3>
            <div className={`text-3xl font-black ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
          </div>
        </div>
        {subtext && (
          <p className={`text-xs font-medium mt-4 ${highlight ? 'text-emerald-50' : 'text-slate-400'}`}>{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Top Queries Table ---

function TopQueriesTable({ queries }: { queries: DashboardQueries }) {
  return (
    <Card className="shadow-lg border-none overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Top Consultas</CardTitle>
          <CardDescription>Consultas mais rentáveis do período</CardDescription>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
          Rentabilidade
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold text-xs border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Consulta</th>
                <th className="px-6 py-4 text-center">Volume</th>
                <th className="px-6 py-4 text-right">Receita Total</th>
                <th className="px-6 py-4 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {queries.topQueryTypes.map((query) => (
                <tr key={query.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                        {query.code.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{query.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{query.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {query.totalQueries}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    {query.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      {query.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </td>
                </tr>
              ))}
              {queries.topQueryTypes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">
                    Nenhuma consulta realizada ainda.
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

// --- Operational Summary ---

function OperationalSummary({ overview, queries }: { overview: DashboardOverview; queries: DashboardQueries }) {
  const margin =
    queries.totalRevenue > 0
      ? ((queries.totalProfit / queries.totalRevenue) * 100).toFixed(1)
      : '0';

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-white">Resumo Operacional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <span className="text-white/80 text-sm">Saldo em Circulação</span>
          <span className="font-bold text-lg">
            {overview.totalBalanceInCirculation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <span className="text-white/80 text-sm">Custo Operacional</span>
          <span className="font-bold text-lg">
            {queries.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <div className="pt-2">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Activity className="w-4 h-4" /> Margem de Lucro Atual
          </div>
          <div className="w-full bg-black/20 rounded-full h-2 mb-1">
            <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${margin}%` }} />
          </div>
          <div className="text-right text-xs font-bold text-emerald-300">{margin}%</div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Providers skeleton (shown while ProvidersSection streams in) ---

function ProvidersSkeleton() {
  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-56 bg-slate-100 rounded animate-pulse mt-1" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
        ))}
      </CardContent>
    </Card>
  );
}

// --- Main async server component ---

export async function DashboardMainSection({ initialPeriod }: { initialPeriod: number }) {
  const [result, user] = await Promise.all([
    getDashboardMainAction(),
    getCurrentUser(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="text-center text-slate-400 py-12">
        Erro ao carregar dados do dashboard.
      </div>
    );
  }

  const { overview, queries } = result.data;
  const isMaster = user?.role === UserRole.MASTER;

  return (
    <>
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receita Mensal"
          value={overview.revenueThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          subtext={`+${overview.revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} hoje`}
          icon={TrendingUp}
          colorClass="text-primary bg-primary"
        />
        <StatCard
          title="Lucro Líquido"
          value={overview.profitThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          subtext="Performance financeira real"
          icon={DollarSign}
          colorClass="text-white"
          highlight
        />
        <StatCard
          title="Consultas Totais"
          value={overview.totalQueries}
          subtext={`${overview.querySuccessRate}% de taxa de sucesso`}
          icon={Zap}
          colorClass="text-amber-600 bg-amber-600"
        />
        <StatCard
          title="Usuários Ativos"
          value={overview.usersByStatus?.ACTIVE ?? 0}
          subtext={`${overview.newUsersThisMonth} novos cadastros este mês`}
          icon={Users}
          colorClass="text-purple-600 bg-purple-600"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-8">
          <RevenueChartCard initialPeriod={initialPeriod} />
          <TopQueriesTable queries={queries} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-8">
          {isMaster && (
            <Suspense fallback={<ProvidersSkeleton />}>
              <ProvidersSection />
            </Suspense>
          )}
          <OperationalSummary overview={overview} queries={queries} />
        </div>
      </div>
    </>
  );
}
