'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react';

import { useQueryExecution } from '@/hooks/useQueryExecution';
import { Card, Button as CandleButton } from '@/components/candle';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';
import { formatCpfCnpj } from '@/lib/formatters';
import type { QueryExecutionStatus, QueryHistoryEntry } from '@/types/query';

export default function HistoricoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getHistory, isLoading } = useQueryExecution();
  const [isPending, startTransition] = useTransition();
  const [queries, setQueries] = useState<QueryHistoryEntry[]>([]);
  const [totalQueries, setTotalQueries] = useState(0);
  const [pageLimit, setPageLimit] = useState(20);

  const currentStatus = searchParams.get('status') || 'ALL';
  const currentInput = searchParams.get('input') || '';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';
  const currentPage = Math.max(1, Number(searchParams.get('page') || '1'));

  const hasActiveFilters =
    currentStatus !== 'ALL' ||
    currentInput !== '' ||
    currentStartDate !== '' ||
    currentEndDate !== '';

  useEffect(() => {
    const loadQueries = async () => {
      const filters = {
        ...(currentStatus !== 'ALL'
          ? { status: currentStatus as QueryExecutionStatus }
          : {}),
        ...(currentInput ? { input: currentInput } : {}),
        ...(currentStartDate ? { startDate: currentStartDate } : {}),
        ...(currentEndDate ? { endDate: currentEndDate } : {}),
      };

      const result = await getHistory(currentPage, 20, filters);
      if (!result) return;

      setQueries(result.data);
      setTotalQueries(result.total);
      setPageLimit(result.limit);
    };

    loadQueries();
  }, [
    currentEndDate,
    currentInput,
    currentPage,
    currentStartDate,
    currentStatus,
    getHistory,
  ]);

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

      params.set('page', '1');
      router.push(`/historico?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => router.push('/historico'));
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`/historico?${params.toString()}`);
    });
  };

  const handleViewQuery = (query: QueryHistoryEntry) => {
    router.push(`/consulta/${query.id}`);
  };

  const totalPages = Math.max(1, Math.ceil(totalQueries / pageLimit));
  const totalSpent = queries.reduce((sum, query) => sum + query.price, 0);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 4) pages.push('...');

    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);

    return pages;
  };

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
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    Consultas
                  </p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    {totalQueries}
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
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">
                    Total Gasto
                  </p>
                  <p className="text-4xl font-display font-black text-gray-900 tracking-tight">
                    R$ {totalSpent.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="relative">
            <div
              className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-opacity duration-200 ${
                isPending ? 'opacity-60 pointer-events-none' : ''
              }`}
            >
              <div className="p-4 border-b border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-800">
                    Transações Recentes
                  </h3>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Status
                    </label>
                    <Select
                      value={currentStatus}
                      onValueChange={(value) => pushFilters({ status: value })}
                    >
                      <SelectTrigger className="w-[150px] h-9 border-slate-200 text-sm bg-slate-50/50">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todos</SelectItem>
                        <SelectItem value="SUCCESS">Sucesso</SelectItem>
                        <SelectItem value="FAILED">Falhou</SelectItem>
                        <SelectItem value="PENDING_RECONCILIATION">
                          Em reconciliação
                        </SelectItem>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PROCESSING">Processando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Documento
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="CPF ou CNPJ..."
                        className="h-9 w-[180px] border-slate-200 text-sm pl-8 bg-slate-50/50"
                        value={currentInput}
                        onChange={(e) => pushFilters({ input: e.target.value })}
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Período
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        className="h-9 w-[145px] border-slate-200 text-sm bg-slate-50/50"
                        value={currentStartDate}
                        onChange={(e) => pushFilters({ startDate: e.target.value })}
                      />
                      <span className="text-slate-300 text-sm">→</span>
                      <Input
                        type="date"
                        className="h-9 w-[145px] border-slate-200 text-sm bg-slate-50/50"
                        value={currentEndDate}
                        onChange={(e) => pushFilters({ endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-9 text-slate-400 hover:text-slate-700 gap-1.5 self-end text-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      Limpar
                    </Button>
                  )}
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentStatus !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                        {currentStatus}
                        <button
                          onClick={() => pushFilters({ status: 'ALL' })}
                          className="hover:opacity-60 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {currentInput && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                        {currentInput}
                        <button
                          onClick={() => pushFilters({ input: '' })}
                          className="hover:opacity-60 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {currentStartDate && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                        de {currentStartDate}
                        <button
                          onClick={() => pushFilters({ startDate: '' })}
                          className="hover:opacity-60 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {currentEndDate && (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                        até {currentEndDate}
                        <button
                          onClick={() => pushFilters({ endDate: '' })}
                          className="hover:opacity-60 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  </div>
                  <p className="text-gray-500 font-medium animate-pulse">
                    Carregando dados...
                  </p>
                </div>
              ) : queries.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Nenhum registro encontrado
                  </h4>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Não encontramos nenhuma consulta correspondente aos seus filtros atuais.
                  </p>
                  <Link href="/">
                    <CandleButton className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-300 rounded-xl px-8 py-6 font-bold h-auto">
                      Nova Consulta
                    </CandleButton>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-100 bg-slate-50/60">
                        <TableHead className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 w-[130px]">
                          Data
                        </TableHead>
                        <TableHead className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                          Tipo de Consulta
                        </TableHead>
                        <TableHead className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                          Documento
                        </TableHead>
                        <TableHead className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                          Status
                        </TableHead>
                        <TableHead className="text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">
                          Preço
                        </TableHead>
                        <TableHead className="px-4 py-3 w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {queries.map((query) => {
                        const statusMeta = getStatusMeta(query.status);

                        return (
                          <TableRow key={query.id} className="transition-colors group hover:bg-slate-50/40">
                            <TableCell className="px-4 py-3.5 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                              {format(new Date(query.createdAt), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                              <span className="block text-slate-400">
                                {format(new Date(query.createdAt), 'HH:mm', {
                                  locale: ptBR,
                                })}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                              <p className="text-sm text-slate-700 leading-tight">
                                {query.queryType.name}
                              </p>
                              <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                                {query.queryType.code}
                              </p>
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                              <span className="font-mono text-sm text-slate-700">
                                {formatCpfCnpj(query.input)}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${statusMeta.className}`}
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClassName}`}
                                  />
                                  {statusMeta.label}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-right">
                              {statusMeta.billedPrice ? (
                                <span className="font-mono text-sm font-semibold text-slate-800">
                                  {query.price.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  })}
                                </span>
                              ) : (
                                <span className="font-mono text-sm text-slate-300 line-through">
                                  {(0).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                  })}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                              <div className="flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => statusMeta.canView && handleViewQuery(query)}
                                  disabled={!statusMeta.canView}
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-primary hover:bg-primary/5 disabled:opacity-30"
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

              {!isLoading && queries.length > 0 && (
                <div className="flex items-center justify-between py-3.5 px-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 tabular-nums">
                    <span className="font-medium text-slate-600">{queries.length}</span> de{' '}
                    <span className="font-medium text-slate-600">
                      {totalQueries.toLocaleString('pt-BR')}
                    </span>{' '}
                    resultados
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || isPending}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {getPageNumbers().map((pageNum, index) =>
                      pageNum === '...' ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex items-center justify-center w-8 h-8 text-slate-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </span>
                      ) : (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === currentPage
                              ? 'bg-primary text-white shadow-sm shadow-primary/30'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ),
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || isPending}
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
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
