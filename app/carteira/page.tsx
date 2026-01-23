'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePayment } from '@/hooks/usePayment';
import { useBalance } from '@/hooks/useBalance';
import { Card, Button, Badge } from '@/components/candle';
import { Header, Footer } from '@/components/layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import type { Transaction, PaymentStatus } from '@/types/payment';

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: 'success' | 'warning' | 'error' | 'info' }
> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  CONFIRMED: { label: 'Confirmado', variant: 'success' },
  RECEIVED: { label: 'Recebido', variant: 'success' },
  OVERDUE: { label: 'Vencido', variant: 'error' },
  REFUNDED: { label: 'Reembolsado', variant: 'info' },
};

const TRANSACTION_TYPE_LABELS = {
  RECHARGE: 'Recarga',
  QUERY: 'Consulta',
  REFUND: 'Reembolso',
};

export default function CarteiraPage() {
  const router = useRouter();
  const { getTransactions, refreshBalance } = usePayment();
  const { formattedBalance, fetchBalance } = useBalance();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load transactions
  const loadTransactions = async () => {
    setIsLoading(true);
    const result = await getTransactions(1, 20);
    if (result.success && result.data) {
      setTransactions(result.data.transactions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();
    fetchBalance();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refreshBalance(), loadTransactions()]);
    setIsRefreshing(false);
  };



  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Atmosphere - Consistent with Design System */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-[100px] mix-blend-multiply animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 font-body">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-2">
                  Minha Carteira
                </h1>
                <p className="text-gray-600 font-medium text-lg">
                  Gerencie seu saldo e visualize suas transações.
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="gap-2 bg-white/50 backdrop-blur-md border-blue-200 text-blue-700 hover:bg-white shadow-sm"
                isLoading={isRefreshing}
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>

            {/* Balance Card - Following Design System 'Card' with gradient prop */}
            <div className="glass-strong rounded-3xl p-8 md:p-10 relative overflow-hidden bg-gradient-to-br from-white/90 to-blue-50/90 border border-white/60 shadow-glass-strong group">
               {/* Decorative background elements matching the light aesthetic */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-cyan-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none opacity-60" />
               
               <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="font-display font-bold text-blue-900 uppercase tracking-wider text-sm">Saldo Disponível</span>
                     </div>
                     
                     <div className="flex items-baseline gap-1">
                       <span className="text-2xl font-bold text-gray-400">R$</span>
                       <span className="text-6xl md:text-7xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                         {formattedBalance}
                       </span>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                     <Button
                      onClick={() => router.push('/recarregar')}
                      className="w-full md:w-auto px-8 py-4 h-auto text-lg rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Recarregar Agora
                    </Button>
                    <p className="text-xs text-center text-blue-600/70 font-medium">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                      Processamento Instantâneo
                    </p>
                  </div>
               </div>
            </div>

            {/* Transactions Section */}
            <div className="glass rounded-3xl border border-white/50 shadow-glass overflow-hidden">
                <div className="p-6 border-b border-blue-100/50 bg-white/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-bold text-gray-900">Extrato</h3>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Últimas movimentações</p>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white/30">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-blue-100 rounded-full" />
                      <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                    </div>
                    <p className="text-blue-600/80 font-medium animate-pulse text-sm">Atualizando extrato...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-24 px-4 bg-white/30">
                    <div className="w-20 h-20 bg-blue-50/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Wallet className="h-8 w-8 text-blue-300" />
                    </div>
                    <h4 className="text-xl font-display font-bold text-gray-900 mb-2">Sua carteira está vazia</h4>
                     <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                      Realize sua primeira recarga para começar a aproveitar todos os recursos da plataforma.
                    </p>
                    <Button
                      onClick={() => router.push('/recarregar')}
                      variant="outline"
                      className="border-dashed border-2 px-8 py-3 hover:bg-blue-50"
                    >
                      Fazer primeira recarga
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white/20">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-blue-100/50 bg-blue-50/30 hover:bg-blue-50/50">
                          <TableHead className="w-[180px] pl-8 font-bold text-blue-900/60 uppercase text-xs tracking-wider py-4">Data</TableHead>
                          <TableHead className="font-bold text-blue-900/60 uppercase text-xs tracking-wider py-4">Tipo</TableHead>
                          <TableHead className="font-bold text-blue-900/60 uppercase text-xs tracking-wider py-4">Descrição</TableHead>
                          <TableHead className="font-bold text-blue-900/60 uppercase text-xs tracking-wider py-4">Status</TableHead>
                          <TableHead className="text-right pr-8 font-bold text-blue-900/60 uppercase text-xs tracking-wider py-4">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => {
                          const isPositive =
                            transaction.type === 'RECHARGE' ||
                            transaction.type === 'REFUND';
                          const statusConfig = STATUS_CONFIG[transaction.status];

                          return (
                            <TableRow key={transaction.id} className="border-b border-blue-50/50 hover:bg-white/60 transition-colors group">
                              <TableCell className="pl-8 py-5">
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-700">
                                    {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'long',
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-400 font-medium">
                                    {new Date(transaction.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(transaction.createdAt).getFullYear()}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-5">
                                <div className="flex items-center gap-3">
                                  {isPositive ? (
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                                      <TrendingUp className="h-4 w-4" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 transition-transform">
                                      <TrendingDown className="h-4 w-4" />
                                    </div>
                                  )}
                                  <span className="font-semibold text-gray-700">
                                    {TRANSACTION_TYPE_LABELS[transaction.type]}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-600 font-medium py-5">
                                {transaction.description}
                              </TableCell>
                              <TableCell className="py-5">
                                <Badge
                                  variant={statusConfig.variant}
                                  size="sm"
                                  className="shadow-sm border border-current/20"
                                >
                                  {statusConfig.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right pr-8 py-5">
                                <span
                                  className={`font-display font-bold text-lg ${
                                    isPositive ? 'text-green-600' : 'text-gray-900'
                                  }`}
                                >
                                  {isPositive ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
            </div>

            {/* Recharge Modal Removed */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
