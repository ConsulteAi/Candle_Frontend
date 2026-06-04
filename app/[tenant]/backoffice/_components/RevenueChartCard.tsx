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
  7: '7d',
  15: '15d',
  30: '30d',
  90: '90d',
  180: '180d',
  365: '365d',
};

const fetchRevenue = (days: number) =>
  getRevenueStatsAction({ days }).then((res) => {
    if (res.success) return res.data as RevenueStats;
    throw new Error('Erro ao carregar receita');
  });

export function RevenueChartCard({ initialPeriod }: { initialPeriod: number }) {
  const searchParams = useSearchParams();
  const period = Number(searchParams.get('period')) || initialPeriod;
  const periodLabel = PERIOD_LABELS[period] ?? `${period}d`;

  const { data: revenueData, isLoading } = useSWR(
    ['revenue-stats', period],
    () => fetchRevenue(period),
    { keepPreviousData: true, revalidateOnFocus: false },
  );

  return (
    <Card className="shadow-lg border-none">
      <CardHeader>
        <CardTitle>Evolução de Receita</CardTitle>
        <CardDescription>Acompanhamento diário — últimos {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent
        className={`h-[350px] transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      >
        {!revenueData?.revenueByDay?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-medium">Sem dados de receita no período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData.revenueByDay}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickFormatter={(val) =>
                  new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                }
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `R$ ${val}`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  backgroundColor: '#fff',
                  padding: '12px 16px',
                }}
                formatter={(value: any) => [
                  <span key="val" className="font-bold text-primary">
                    R$ {value}
                  </span>,
                  <span key="label" className="text-slate-500 font-medium">
                    Receita
                  </span>,
                ]}
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
