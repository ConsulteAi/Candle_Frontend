'use client';

// Imports removed
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { DashboardOverview, DashboardQueries } from '@/types/admin';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/hooks/useAuth';

interface DashboardViewProps {
  overview: DashboardOverview | null;
  revenueData: any; 
  providerStats: any;
  queriesStats: DashboardQueries | null;
  isLoading?: boolean;
}

export function DashboardView({ overview, revenueData, providerStats, queriesStats, isLoading }: DashboardViewProps) {
  const { user } = useAuth();

  if (!overview && !isLoading) return null;

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const StatCard = ({ title, value, subtext, icon: Icon, colorClass, highlight = false }: any) => (
    <motion.div variants={item}>
      <Card className={`border-none shadow-glass hover:shadow-glass-strong transition-all duration-300 overflow-hidden relative group h-full ${highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-2xl shadow-emerald-500/20' : ''}`}>
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
           <Icon className="w-24 h-24 -mr-4 -mt-4 transform rotate-12" />
        </div>
        <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl shadow-sm ${highlight ? 'bg-white/10 text-white' : `bg-white ${colorClass} bg-opacity-10 text-opacity-100`}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm font-medium uppercase tracking-wider ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>{title}</h3>
              <div className={`text-3xl font-black ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</div>
            </div>
          </div>
          {subtext && <p className={`text-xs font-medium mt-4 ${highlight ? 'text-emerald-50' : 'text-slate-400'}`}>{subtext}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div 
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between text-slate-900 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
            Olá, {user?.name?.split(' ')[0] || 'Administrador'}
          </h1>
          <p className="text-slate-500 text-lg">Aqui está o resumo financeiro e operacional de hoje.</p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full inline-block">
             {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
           </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* REVENUE */}
        <StatCard 
          title="Receita Mensal" 
          value={overview?.revenueThisMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'}
          subtext={`+${overview?.revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} hoje`}
          icon={TrendingUp}
          colorClass="text-blue-600 bg-blue-600"
        />

        {/* PROFIT - HIGHLIGHTED */}
        <StatCard 
          title="Lucro Líquido" 
          value={overview?.profitThisMonth?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'}
          subtext="Performance financeira real"
          icon={DollarSign}
          colorClass="text-white"
          highlight={true}
        />

        {/* QUERIES - VOLUME & SUCCESS */}
        <StatCard 
          title="Consultas Totais" 
          value={overview?.totalQueries}
          subtext={`${overview?.querySuccessRate}% de taxa de sucesso`}
          icon={Zap}
          colorClass="text-amber-600 bg-amber-600"
        />

        {/* ACTIVE USERS */}
        <StatCard 
          title="Usuários Ativos" 
          value={overview?.usersByStatus?.ACTIVE ?? 0}
          subtext={`${overview?.newUsersThisMonth} novos cadastros este mês`}
          icon={Users}
          colorClass="text-purple-600 bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Tables */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Chart */}
          <motion.div variants={item}>
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle>Evolução de Receita</CardTitle>
                <CardDescription>Acompanhamento diário dos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                {(!revenueData?.revenueByDay || revenueData.revenueByDay.length === 0) ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">Sem dados de receita no período</p>
                   </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData?.revenueByDay || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(val) => new Date(val).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}  
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
                          padding: '12px 16px'
                        }}
                        formatter={(value: any) => [
                          <span key="val" className="font-bold text-blue-600">R$ {value}</span>, 
                          <span key="label" className="text-slate-500 font-medium">Receita</span>
                        ]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Queries Table - NEW Section */}
          <motion.div variants={item}>
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
                        {queriesStats?.topQueryTypes.map((query: any) => (
                           <tr key={query.id} className="hover:bg-slate-50/50 transition-colors group">
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
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
                        {(!queriesStats?.topQueryTypes || queriesStats.topQueryTypes.length === 0) && (
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
          </motion.div>
        </div>

        {/* Right Column: Status & Health */}
        <motion.div variants={item} className="lg:col-span-1 space-y-8">
           
           {/* Providers Status */}
           <Card className="shadow-lg border-none flex flex-col">
             <CardHeader>
               <CardTitle>Status dos Provedores</CardTitle>
               <CardDescription>Monitoramento em tempo real das APIs</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
                {providerStats?.providers?.map((provider: any) => (
                  <div key={provider.id} className="flex items-start justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full shadow-md shrink-0 ${
                        provider.healthStatus === 'healthy' ? 'bg-emerald-500 shadow-emerald-500/50' : 
                        provider.healthStatus === 'degraded' ? 'bg-amber-500 shadow-amber-500/50' :
                        'bg-red-500 shadow-red-500/50'
                      } ${provider.isActive ? 'animate-pulse' : ''}`} />
                      
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
                       <span className={`text-xs font-bold px-2 py-1 rounded-md block mb-1 ${
                          provider.healthStatus === 'healthy' ? 'text-emerald-700 bg-emerald-100' : 
                          provider.healthStatus === 'degraded' ? 'text-amber-700 bg-amber-100' :
                          'text-red-700 bg-red-100'
                       }`}>
                         {provider.successRate ? `${provider.successRate}%` : '--'}
                       </span>
                    </div>
                  </div>
                ))}
             </CardContent>
           </Card>

           {/* Quick Actions or Summary */}
           <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
             <CardHeader>
               <CardTitle className="text-white">Resumo Operacional</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center border-b border-white/20 pb-3">
                 <span className="text-blue-100 text-sm">Saldo em Circulação</span>
                 <span className="font-bold text-lg">
                   {overview?.totalBalanceInCirculation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-white/20 pb-3">
                 <span className="text-blue-100 text-sm">Custo Operacional</span>
                 <span className="font-bold text-lg">
                   {queriesStats?.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
               </div>
               <div className="pt-2">
                 <div className="flex items-center gap-2 text-sm text-blue-100 mb-2">
                   <Activity className="w-4 h-4" /> Margem de Lucro Atual
                 </div>
                 {/* Profit Margin Calculation (Avoid division by zero) */}
                 <div className="w-full bg-black/20 rounded-full h-2 mb-1">
                   <div 
                     className="bg-emerald-400 h-2 rounded-full" 
                     style={{ width: `${queriesStats?.totalRevenue ? ((queriesStats.totalProfit / queriesStats.totalRevenue) * 100) : 0}%` }} 
                   />
                 </div>
                 <div className="text-right text-xs font-bold text-emerald-300">
                    {queriesStats?.totalRevenue ? ((queriesStats.totalProfit / queriesStats.totalRevenue) * 100).toFixed(1) : 0}%
                 </div>
               </div>
             </CardContent>
           </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}
