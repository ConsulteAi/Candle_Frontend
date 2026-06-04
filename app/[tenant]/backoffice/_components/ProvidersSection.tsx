import { getProviderStatsAction } from '@/actions/admin.actions';
import { Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export async function ProvidersSection() {
  const result = await getProviderStatsAction();

  if (!result.success || !result.data) {
    return null;
  }

  const { providers } = result.data;

  return (
    <Card className="shadow-lg border-none flex flex-col">
      <CardHeader>
        <CardTitle>Status dos Provedores</CardTitle>
        <CardDescription>Monitoramento em tempo real das APIs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-start justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 h-2.5 w-2.5 rounded-full shadow-md shrink-0 ${
                  provider.healthStatus === 'healthy'
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : provider.healthStatus === 'degraded'
                    ? 'bg-amber-500 shadow-amber-500/50'
                    : 'bg-red-500 shadow-red-500/50'
                } ${provider.isActive ? 'animate-pulse' : ''}`}
              />
              <div>
                <div className="font-bold text-sm text-slate-800 leading-none mb-1.5">{provider.name}</div>
                <div className="text-xs text-slate-500 flex flex-col gap-1">
                  {provider.avgResponseTime ? (
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-400" /> {provider.avgResponseTime}ms
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Sem dados recentes</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold px-2 py-1 rounded-md block mb-1 ${
                  provider.healthStatus === 'healthy'
                    ? 'text-emerald-700 bg-emerald-100'
                    : provider.healthStatus === 'degraded'
                    ? 'text-amber-700 bg-amber-100'
                    : 'text-red-700 bg-red-100'
                }`}
              >
                {provider.successRate ? `${provider.successRate}%` : '--'}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
