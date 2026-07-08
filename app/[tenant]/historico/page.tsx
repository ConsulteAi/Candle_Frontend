'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Search, FileText, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { Card, Button } from '@/components/candle';
import { Header, Footer } from '@/components/layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QueryCategory,
  type QueryExecutionStatus,
  type QueryHistoryEntry,
} from '@/types/query';
import { getCategoryConfig } from '@/constants/query-categories';
import { getPriorityCategory } from '@/lib/utils';

export default function HistoricoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getHistory, isLoading } = useQueryExecution();
  const [isPending, startTransition] = useTransition();
  const [queries, setQueries] = useState<QueryHistoryEntry[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<QueryHistoryEntry[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<QueryCategory | 'all'>('all');
  const currentStatus = searchParams.get('status') || 'ALL';
  const currentInput = searchParams.get('input') || '';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';

  const hasApiFilters =
    currentStatus !== 'ALL' ||
    currentInput !== '' ||
    currentStartDate !== '' ||
    currentEndDate !== '';

  const loadQueries = async () => {
    const filters = {
      ...(currentStatus !== 'ALL'
        ? { status: currentStatus as QueryExecutionStatus }
        : {}),
      ...(currentInput ? { input: currentInput } : {}),
      ...(currentStartDate ? { startDate: currentStartDate } : {}),
      ...(currentEndDate ? { endDate: currentEndDate } : {}),
    };
    const result = await getHistory(1, 50, filters);

    if (result) {
      setQueries(result.data);
      setFilteredQueries(result.data);
    }
  };

  useEffect(() => {
    loadQueries();
  }, [currentStatus, currentInput, currentStartDate, currentEndDate]);

  const pushFilters = (overrides: Record<string, string>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      const merged = {
        status: currentStatus,
        input: currentInput,
        startDate: currentStartDate,
        endDate: currentEndDate,
        ...overrides,
      };

      for (const [key, value] of Object.entries(merged)) {
        if (!value || value === 'ALL') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      router.push(`/historico?${params.toString()}`);
    });
  };

  const clearApiFilters = () => {
    startTransition(() => router.push('/historico'));
  };

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredQueries(queries);
    } else {
      setFilteredQueries(
        queries.filter((q) => q.queryType.category.includes(categoryFilter as QueryCategory))
      );
    }
  }, [categoryFilter, queries]);

  const handleViewQuery = (query: QueryHistoryEntry) => {
    router.push(`/consulta/${query.id}`);
  };

  const totalSpent = filteredQueries.reduce((sum, q) => sum + q.price, 0);
  const getStatusMeta = (status: QueryHistoryEntry['status']) => {
    if (status === 'SUCCESS') {
      return {
        label: 'Concluída',
        className: 'bg-green-50 text-green-700 border-green-200',
        dotClassName: 'bg-green-500',
        canView: true,
        billedPrice: true,
        viewTitle: 'Ver detalhes',
      };
    }

    if (status === 'PENDING_RECONCILIATION') {
      return {
        label: 'Em reconciliação',
        className: 'bg-orange-50 text-orange-700 border-orange-200',
        dotClassName: 'bg-orange-500',
        canView: true,
        billedPrice: true,
        viewTitle: 'Acompanhar reconciliação',
      };
    }

    return {
      label: status === 'FAILED' ? 'Erro' : status,
      className: 'bg-red-50 text-red-700 border-red-200',
      dotClassName: 'bg-red-500',
      canView: false,
      billedPrice: false,
      viewTitle: 'Indisponível para consultas sem resultado final',
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8 pb-20">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-2">
                  Histórico de Consultas
                </h1>
                <p className="text-gray-500 font-medium text-lg">
                  Gerencie e monitore todas as suas atividades em tempo real.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden border-0 bg-white/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/90 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                    <Search className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    Total
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Consultas</p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    {filteredQueries.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/40 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-100/50 px-3 py-1 rounded-full border border-purple-200/50">
                    Investimento
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Total Gasto</p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    R$ {totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="relative">
            <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden p-1">
              <div
                className={`border-b border-gray-200/30 transition-opacity duration-200 ${
                  isPending ? 'opacity-70 pointer-events-none' : ''
                }`}
              >
                <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-gray-800">
                      Transações Recentes
                    </h3>
                  </div>

                  <div className="w-full lg:w-auto">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categoria:</span>
                      <div className="w-[220px] max-w-full">
                        <Select
                          value={categoryFilter}
                          onValueChange={(value) => setCategoryFilter(value as QueryCategory | 'all')}
                        >
                          <SelectTrigger className="h-10 bg-white/50 border-white/50 focus:bg-white transition-colors shadow-sm text-gray-700 font-medium rounded-xl">
                            <SelectValue placeholder="Todas Categorias" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-2xl rounded-xl">
                            <SelectItem value="all" className="font-medium">Todas Categorias</SelectItem>
                            <SelectItem value="CREDIT">Crédito</SelectItem>
                            <SelectItem value="VEHICLE">Veículos</SelectItem>
                            <SelectItem value="COMPANY">Empresarial</SelectItem>
                            <SelectItem value="PERSON">Pessoa Física</SelectItem>
                            <SelectItem value="PHONE">Telefone</SelectItem>
                            <SelectItem value="ADDRESS">Endereço</SelectItem>
                            <SelectItem value="OTHER">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                      <Select value={currentStatus} onValueChange={(value) => pushFilters({ status: value })}>
                        <SelectTrigger className="w-[170px] h-10 bg-white/50 border-white/50 focus:bg-white transition-colors shadow-sm rounded-xl">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/90 backdrop-blur-xl border-gray-200/50 shadow-2xl rounded-xl">
                          <SelectItem value="ALL">Todos</SelectItem>
                          <SelectItem value="SUCCESS">Sucesso</SelectItem>
                          <SelectItem value="FAILED">Falhou</SelectItem>
                          <SelectItem value="PENDING_RECONCILIATION">Em reconciliação</SelectItem>
                          <SelectItem value="PENDING">Pendente</SelectItem>
                          <SelectItem value="PROCESSING">Processando</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Documento</label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="CPF, CNPJ, placa..."
                          className="h-10 w-[220px] max-w-full bg-white/50 border-white/50 pl-9 rounded-xl"
                          value={currentInput}
                          onChange={(e) => pushFilters({ input: e.target.value })}
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" /> Período
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="date"
                          className="h-10 w-[160px] bg-white/50 border-white/50 rounded-xl"
                          value={currentStartDate}
                          onChange={(e) => pushFilters({ startDate: e.target.value })}
                        />
                        <span className="text-slate-400 text-sm">até</span>
                        <Input
                          type="date"
                          className="h-10 w-[160px] bg-white/50 border-white/50 rounded-xl"
                          value={currentEndDate}
                          onChange={(e) => pushFilters({ endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    {hasApiFilters && (
                      <Button
                        variant="ghost"
                        onClick={clearApiFilters}
                        className="h-10 text-slate-500 hover:text-slate-700 self-end"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar filtros
                      </Button>
                    )}
                  </div>

                  {hasApiFilters && (
                    <div className="flex flex-wrap gap-2">
                      {currentStatus !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => pushFilters({ status: 'ALL' })}
                          className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium"
                        >
                          {currentStatus}
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {currentInput && (
                        <button
                          type="button"
                          onClick={() => pushFilters({ input: '' })}
                          className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium"
                        >
                          {currentInput}
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {currentStartDate && (
                        <button
                          type="button"
                          onClick={() => pushFilters({ startDate: '' })}
                          className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium"
                        >
                          de {currentStartDate}
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {currentEndDate && (
                        <button
                          type="button"
                          onClick={() => pushFilters({ endDate: '' })}
                          className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-1 rounded-full font-medium"
                        >
                          até {currentEndDate}
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="text-gray-500 font-medium animate-pulse">Carregando dados...</p>
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhum registro encontrado</h4>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Não encontramos nenhuma consulta correspondente aos seus filtros atuais.
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 rounded-xl px-8 py-6 font-bold h-auto">
                      Nova Consulta
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden bg-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-200/30 hover:bg-transparent bg-gray-50/30">
                        <TableHead className="w-[160px] pl-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Data</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Tipo</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Categoria</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Protocolo</TableHead>
                        <TableHead className="font-bold text-gray-400 uppercase text-xs tracking-wider">Status</TableHead>
                        <TableHead className="text-right font-bold text-gray-400 uppercase text-xs tracking-wider">Custo</TableHead>
                  <TableHead className="text-center font-bold text-gray-400 uppercase text-xs tracking-wider">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueries.map((query) => {
                    const mainCategory = getPriorityCategory(query.queryType.category);
                    const categoryConfig = getCategoryConfig(mainCategory);
                    const statusMeta = getStatusMeta(query.status);

                    return (
                      <TableRow key={query.id} className="border-b border-gray-100/50 hover:bg-white/40 transition-colors group">
                        <TableCell className="pl-6 font-semibold text-gray-600">
                          {new Date(query.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          <span className="block text-xs font-normal text-gray-400">
                             {new Date(query.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-800">
                            {query.queryType.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {categoryConfig.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                            {query.id.substring(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                             <div className={`
                                flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
                                ${statusMeta.className}
                             `}>
                                <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClassName}`} />
                                {statusMeta.label}
                             </div>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-display font-bold ${statusMeta.billedPrice ? 'text-gray-900' : 'text-gray-400'}`}>
                          R$ {statusMeta.billedPrice ? query.price.toFixed(2) : '0.00'}
                        </TableCell>
                        <TableCell className="text-center">
                               <div className="flex items-center justify-center">
                                 <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => statusMeta.canView && handleViewQuery(query)}
                                  disabled={!statusMeta.canView}
                                  className="bg-white hover:bg-primary/10 text-primary border border-primary/20 hover:border-primary/30 shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                  title={statusMeta.viewTitle}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
