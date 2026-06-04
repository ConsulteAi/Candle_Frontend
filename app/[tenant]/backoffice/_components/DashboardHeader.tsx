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
  { label: '365d', days: 365 },
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

  const setPeriod = useCallback(
    (days: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', String(days));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between text-slate-900 gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
          Olá, {user?.name?.split(' ')[0] || 'Administrador'}
        </h1>
        <p className="text-slate-500 text-lg">
          Aqui está o resumo financeiro e operacional de hoje.
        </p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        {PERIOD_PRESETS.map((preset) => (
          <button
            key={preset.days}
            onClick={() => setPeriod(preset.days)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${period === preset.days
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
