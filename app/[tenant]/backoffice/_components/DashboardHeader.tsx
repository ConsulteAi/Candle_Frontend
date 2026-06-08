'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const PERIOD_PRESETS = [
  { label: 'Hoje', days: 1 },
  { label: '7d', days: 7 },
  { label: '15d', days: 15 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
  { label: '1 ano', days: 365 },
] as const;

interface DashboardHeaderProps {
  initialPeriod: number;
}

export function DashboardHeader({ initialPeriod }: DashboardHeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const period = Number(searchParams.get('period')) || initialPeriod;

  const today = new Date();
  const dateLabel = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const setPeriod = useCallback(
    (days: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', String(days));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-sm font-medium text-slate-400">{capitalizedDate}</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Dados atualizados
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">
          Olá, {user?.name?.split(' ')[0] || 'Administrador'}
        </h1>
        <p className="text-slate-500 text-base mt-1">
          Aqui está o resumo do seu negócio.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shrink-0">
        {PERIOD_PRESETS.map((preset) => (
          <button
            key={preset.days}
            onClick={() => setPeriod(preset.days)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                period === preset.days
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
