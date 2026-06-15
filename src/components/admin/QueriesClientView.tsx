'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Link from 'next/link';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { AdminQueryListItem, PaginatedResponse } from '@/types/admin';
import { formatCpfCnpj } from '@/lib/formatters';

interface QueriesClientViewProps {
  initialData: PaginatedResponse<AdminQueryListItem>;
}

function StatusBadge({ status, errorMessage }: { status: string; errorMessage?: string | null }) {
  if (status === 'SUCCESS') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 w-fit">
        <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
        Sucesso
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 w-fit">
          <XCircle className="w-3 h-3 flex-shrink-0" />
          Falhou
        </span>
        {errorMessage && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[11px] text-red-500/80 cursor-default max-w-[200px]">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{errorMessage}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs break-words">
                {errorMessage}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }
  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 w-fit">
        <Clock className="w-3 h-3 flex-shrink-0" />
        Pendente
      </span>
    );
  }
  if (status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1 w-fit">
        <Loader2 className="w-3 h-3 flex-shrink-0 animate-spin" />
        Processando
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
      {status}
    </span>
  );
}

export function QueriesClientView({ initialData }: QueriesClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get('status') || 'ALL';
  const currentInput = searchParams.get('input') || '';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';

  const hasActiveFilters =
    currentStatus !== 'ALL' ||
    currentInput !== '' ||
    currentStartDate !== '' ||
    currentEndDate !== '';

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
        if (!value || value === 'ALL') params.delete(key);
        else params.set(key, value);
      }
      params.set('page', '1');
      router.push(`/backoffice/queries?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => router.push('/backoffice/queries'));
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/backoffice/queries?${params.toString()}`);
    });
  };

  const totalPages = Math.ceil(initialData.total / initialData.limit);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const current = initialData.page;
    const total = totalPages;
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push('...');
      const start = Math.max(2, current - 2);
      const end = Math.min(total - 1, current + 2);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 3) pages.push('...');
      pages.push(total);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Consultas Realizadas</h1>
          <p className="text-slate-500 text-sm mt-0.5">Histórico completo de todas as consultas do sistema.</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 tabular-nums">
          <span className="font-semibold text-slate-800">{initialData.total.toLocaleString('pt-BR')}</span> consultas no total
        </div>
      </div>

      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
              <Select value={currentStatus} onValueChange={(v) => pushFilters({ status: v })}>
                <SelectTrigger className="w-[150px] h-9 border-slate-200 text-sm bg-slate-50/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="SUCCESS">Sucesso</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="PROCESSING">Processando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Documento</label>
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
                  <button onClick={() => pushFilters({ status: 'ALL' })} className="hover:opacity-60 ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentInput && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                  {currentInput}
                  <button onClick={() => pushFilters({ input: '' })} className="hover:opacity-60 ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentStartDate && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                  de {currentStartDate}
                  <button onClick={() => pushFilters({ startDate: '' })} className="hover:opacity-60 ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentEndDate && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                  até {currentEndDate}
                  <button onClick={() => pushFilters({ endDate: '' })} className="hover:opacity-60 ml-0.5"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3 w-[130px]">Data</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Usuário</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Tipo de Consulta</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Documento</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 py-3">Preço</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialData.data.map((query) => (
                <tr key={query.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-4 py-3.5 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {format(new Date(query.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                    <span className="block text-slate-400">
                      {format(new Date(query.createdAt), "HH:mm", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-slate-800 leading-tight">{query.user.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{query.user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-700 leading-tight">{query.queryType.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{query.queryType.code}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm text-slate-700">{formatCpfCnpj(query.input)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={query.status} errorMessage={query.errorMessage} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {query.status === 'FAILED' ? (
                      <span className="font-mono text-sm text-slate-300 line-through">
                        {(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : query.price > 0 ? (
                      <span className="font-mono text-sm font-semibold text-slate-800">
                        {query.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Gratuito</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {query.status === 'FAILED' ? (
                      <Button variant="ghost" size="sm" disabled className="h-8 w-8 p-0 opacity-30">
                        <Eye className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Link href={`/consulta/${query.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-primary hover:bg-primary/5">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {initialData.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-24 text-center text-sm text-slate-400">
                    Nenhuma consulta encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-3.5 px-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 tabular-nums">
            <span className="font-medium text-slate-600">{initialData.data.length}</span> de{' '}
            <span className="font-medium text-slate-600">{initialData.total.toLocaleString('pt-BR')}</span> resultados
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page <= 1 || isPending}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-8 h-8 text-slate-300">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum as number)}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === initialData.page
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page >= totalPages || isPending}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
