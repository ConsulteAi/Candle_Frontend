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
  Archive,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import type { AdminQueryListItem, PaginatedResponse } from '@/types/admin';
import { formatCpfCnpj } from '@/lib/formatters';

interface QueriesClientViewProps {
  initialData: PaginatedResponse<AdminQueryListItem>;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'SUCCESS':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Sucesso
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none gap-1">
          <XCircle className="w-3 h-3" />
          Falhou
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none gap-1">
          <Clock className="w-3 h-3" />
          Pendente
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Processando
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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
        if (!value || value === 'ALL') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      params.set('page', '1');
      router.push(`/backoffice/queries?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push('/backoffice/queries');
    });
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
          <p className="text-slate-500">Histórico completo de todas as consultas do tenant.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Archive className="w-4 h-4" />
          <span className="font-medium text-slate-700">{initialData.total.toLocaleString('pt-BR')}</span> consultas no total
        </div>
      </div>

      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-wrap gap-3 items-end">

            {/* Status */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <Select
                value={currentStatus}
                onValueChange={(v) => pushFilters({ status: v })}
              >
                <SelectTrigger className="w-[160px] h-9 border-slate-200 text-sm">
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

            {/* Input / Document Search */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Search className="w-3 h-3" /> Documento
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="CPF, CNPJ..."
                  className="h-9 w-[180px] border-slate-200 text-sm pl-8"
                  value={currentInput}
                  onChange={(e) => pushFilters({ input: e.target.value })}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> Período
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  className="h-9 w-[150px] border-slate-200 text-sm"
                  value={currentStartDate}
                  onChange={(e) => pushFilters({ startDate: e.target.value })}
                />
                <span className="text-slate-400 text-sm">até</span>
                <Input
                  type="date"
                  className="h-9 w-[150px] border-slate-200 text-sm"
                  value={currentEndDate}
                  onChange={(e) => pushFilters({ endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-9 text-slate-500 hover:text-slate-900 gap-1.5 self-end"
              >
                <X className="w-4 h-4" />
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Active Filter Pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {currentStatus !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  Status: {currentStatus}
                  <button onClick={() => pushFilters({ status: 'ALL' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentInput && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  Documento: {currentInput}
                  <button onClick={() => pushFilters({ input: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentStartDate && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  De: {currentStartDate}
                  <button onClick={() => pushFilters({ startDate: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
              {currentEndDate && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  Até: {currentEndDate}
                  <button onClick={() => pushFilters({ endDate: '' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Data</TableHead>
                <TableHead className="font-semibold text-slate-600">Usuário</TableHead>
                <TableHead className="font-semibold text-slate-600">Tipo de Consulta</TableHead>
                <TableHead className="font-semibold text-slate-600">Documento</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600 text-right">Preço</TableHead>
                <TableHead className="font-semibold text-slate-600">Cache</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.map((query) => (
                <TableRow key={query.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-slate-500 text-sm whitespace-nowrap">
                    {format(new Date(query.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-sm">{query.user.name}</span>
                      <span className="text-xs text-slate-500">{query.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700 font-medium">{query.queryType.name}</span>
                    <span className="block text-xs text-slate-400 font-mono">{query.queryType.code}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-slate-700">
                      {formatCpfCnpj(query.input)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={query.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {query.status === 'FAILED' ? (
                      <span className="font-mono text-sm text-slate-400">
                        {(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : query.price > 0 ? (
                      <span className="font-mono text-sm font-medium text-slate-700">
                        {query.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Gratuito</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {query.isCached ? (
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-200 border-none text-xs">
                        Cache
                      </Badge>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {initialData.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    Nenhuma consulta encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-4 px-4 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Mostrando <span className="font-medium text-slate-700">{initialData.data.length}</span> de{' '}
            <span className="font-medium text-slate-700">{initialData.total.toLocaleString('pt-BR')}</span> resultados
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page <= 1 || isPending}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pageNum, index) =>
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum as number)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    pageNum === initialData.page
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page >= totalPages || isPending}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
