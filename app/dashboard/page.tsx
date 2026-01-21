'use client';

import { Search, FileText, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/store/authStore';
import { StatsCard, Card } from '@/components/candle';
import { categorias } from '@/lib/consultas';

export default function DashboardPage() {
  const user = useUser();

  // Mock stats - Replace with real data later
  const stats = [
    {
      label: 'Consultas Hoje',
      value: '12',
      trend: 8,
      icon: Search,
    },
    {
      label: 'Total Gasto',
      value: 'R$ 156,00',
      trend: 23,
      icon: TrendingUp,
    },
    {
      label: 'Saldo Disponível',
      value: `R$ ${user?.balance?.toFixed(2) || '0,00'}`,
      icon: Wallet,
    },
    {
      label: 'Total de Consultas',
      value: '245',
      trend: 12,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="glass rounded-2xl p-6 border border-white/40">
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-gray-600">
          Bem-vindo de volta ao seu painel de controle
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <StatsCard
              key={index}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={<Icon className="h-5 w-5" />}
            />
          );
        })}
      </div>

      {/* Quick Access Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-gray-900">
            Acesso Rápido às Consultas
          </h2>
          <Link
            href="/consulta"
            className="text-sm text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.slice(0, 6).map((categoria) => (
            <Link key={categoria.slug} href={`/consulta/${categoria.slug}`}>
              <Card className="glass p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer border border-white/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-white flex-shrink-0">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 mb-1">
                      {categoria.nome}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {categoria.descricao}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-gray-900">
          Atividade Recente
        </h2>

        <Card className="glass p-6 border border-white/40">
          <div className="space-y-4">
            {/* Empty state - Replace with real data */}
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Nenhuma consulta recente</p>
              <p className="text-sm mt-1">
                Suas consultas aparecerão aqui
              </p>
              <Link
                href="/consulta"
                className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Fazer uma consulta
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
