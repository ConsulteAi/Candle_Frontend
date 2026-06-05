'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRevenueStatsAction } from '@/actions/admin.actions';
import type { RevenueStats } from '@/types/admin';

const PERIOD_LABELS: Record<number, string> = {
  1: 'Hoje',
  7: '7 dias',
  15: '15 dias',
  30: '30 dias',
  90: '90 dias',
  180: '180 dias',
  365: '1 ano',
};

const PAYMENT_METHODS = [
  { key: 'PIX' as const, label: 'Pix', color: '#10b981', bg: 'bg-emerald-500' },
  { key: 'BOLETO' as const, label: 'Boleto', color: '#f59e0b', bg: 'bg-amber-400' },
  { key: 'CREDIT_CARD' as const, label: 'Cartão', color: 'hsl(217 91% 60%)', bg: 'bg-primary' },
];

const fetchRevenue = (days: number) =>
  getRevenueStatsAction({ days }).then((res) => {
    if (res.success) return res.data as RevenueStats;
    throw new Error('Erro ao carregar receita');
  });

function PaymentDistribution({
  billingData,
}: {
  billingData: RevenueStats['revenueByBillingType'];
}) {
  const total = billingData.PIX + billingData.BOLETO + billingData.CREDIT_CARD;
  if (total === 0) return null;

  const methods = PAYMENT_METHODS.filter((m) => billingData[m.key] > 0);

  return (
    <div className="mt-5 pt-4 border-t border-slate-100">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-3">
        Distribuição por Método de Pagamento
      </p>
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {methods.map((m) => (
          <div
            key={m.key}
            className={`${m.bg} transition-all duration-700`}
            style={{ width: `${(billingData[m.key] / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        {methods.map((m) => (
          <div key={m.key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${m.bg} shrink-0`} />
            <span className="text-xs text-slate-500 font-medium">{m.label}</span>
            <span className="text-xs font-bold text-slate-700">
              {((billingData[m.key] / total) * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">
              {billingData[m.key].toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChartCard({ initialPeriod }: { initialPeriod: number }) {
  const searchParams = useSearchParams();
  const period = Number(searchParams.get('period')) || initialPeriod;
  const periodLabel = PERIOD_LABELS[period] ?? `${period} dias`;

  const { data: revenueData, isLoading } = useSWR(
    ['revenue-stats', period],
    () => fetchRevenue(period),
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  return (
    <Card className="shadow-glass border-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold">Evolução de Receita</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Acompanhamento diário — últimos {periodLabel}
            </CardDescription>
          </div>
          {revenueData && (
            <div className="text-right shrink-0">
              <p className="text-[11px] text-slate-400 font-medium">Total no período</p>
              <p className="text-base font-black text-slate-900 font-display">
                {revenueData.totalRevenue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="h-[320px]">
          {!revenueData?.revenueByDay?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <Activity className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium">Sem dados de receita no período</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.revenueByDay} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })
                  }
                  stroke="#cbd5e1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#cbd5e1"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    val >= 1000 ? `R$ ${(val / 1000).toFixed(0)}k` : `R$ ${val}`
                  }
                  dx={-6}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    backgroundColor: '#fff',
                    padding: '10px 14px',
                  }}
                  formatter={(value: number) => [
                    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                    'Receita',
                  ]}
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(217 91% 60%)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {revenueData && (
          <PaymentDistribution billingData={revenueData.revenueByBillingType} />
        )}
      </CardContent>
    </Card>
  );
}
