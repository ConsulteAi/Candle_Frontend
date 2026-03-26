'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  QrCode, 
  CreditCard, 
  FileText,
  CalendarDays,
  X,
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

import type { AdminTransaction, PaginatedResponse } from '@/types/admin';

// --- Types ---

interface TransactionsClientViewProps {
  initialData: PaginatedResponse<AdminTransaction>;
}

// --- Helpers ---

function getStatusBadge(status: string) {
  switch (status) {
    case 'CONFIRMED':
    case 'RECEIVED':
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Confirmado</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pendente</Badge>;
    case 'FAILED':
    case 'CANCELED':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Falhou</Badge>;
    case 'OVERDUE':
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Vencido</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getBillingIcon(type: string) {
  switch (type) {
    case 'PIX': return <QrCode className="w-4 h-4 text-emerald-600" />;
    case 'CREDIT_CARD': return <CreditCard className="w-4 h-4 text-primary" />;
    case 'BOLETO': return <FileText className="w-4 h-4 text-orange-600" />;
    default: return <CreditCard className="w-4 h-4 text-slate-500" />;
  }
}

const BILLING_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  BOLETO: 'Boleto',
};

// --- Component ---

export function TransactionsClientView({ initialData }: TransactionsClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get('status') || 'ALL';
  const currentBillingType = searchParams.get('billingType') || 'ALL';
  const currentStartDate = searchParams.get('startDate') || '';
  const currentEndDate = searchParams.get('endDate') || '';

  const hasActiveFilters =
    currentStatus !== 'ALL' ||
    currentBillingType !== 'ALL' ||
    currentStartDate !== '' ||
    currentEndDate !== '';

  const pushFilters = (overrides: Record<string, string>) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      const merged = {
        status: currentStatus,
        billingType: currentBillingType,
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
      router.push(`/backoffice/transactions?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push('/backoffice/transactions');
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', newPage.toString());
      router.push(`/backoffice/transactions?${params.toString()}`);
    });
  };

  const totalPages = Math.ceil(initialData.total / initialData.limit);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transações Financeiras</h1>
          <p className="text-slate-500">Histórico completo de entradas e saídas.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          Exportar Relatório
        </Button>
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
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="RECEIVED">Recebido</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                  <SelectItem value="OVERDUE">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Billing Type */}
            {/* <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Método</label>
              <Select
                value={currentBillingType}
                onValueChange={(v) => pushFilters({ billingType: v })}
              >
                <SelectTrigger className="w-[180px] h-9 border-slate-200 text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                  <SelectItem value="BOLETO">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

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
              {currentBillingType !== 'ALL' && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                  Método: {BILLING_LABELS[currentBillingType] ?? currentBillingType}
                  <button onClick={() => pushFilters({ billingType: 'ALL' })} className="hover:opacity-70"><X className="w-3 h-3" /></button>
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
                <TableHead className="font-semibold text-slate-600">ID da Transação</TableHead>
                <TableHead className="font-semibold text-slate-600">Usuário</TableHead>
                <TableHead className="font-semibold text-slate-600">Valor</TableHead>
                <TableHead className="font-semibold text-slate-600">Método</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                <TableHead className="font-semibold text-slate-600">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs text-slate-500">
                    {tx.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{tx.user.name}</span>
                      <span className="text-xs text-slate-500">{tx.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono font-medium ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}
                      {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getBillingIcon(tx.billingType)}
                      <span className="text-sm text-slate-700">{BILLING_LABELS[tx.billingType] ?? tx.billingType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
              {initialData.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    Nenhuma transação encontrada para os filtros selecionados.
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
            <span className="font-medium text-slate-700">{initialData.total}</span> resultados
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page <= 1 || isPending}
            >
              Anterior
            </Button>
            <div className="flex items-center px-4 text-sm font-medium bg-slate-50 rounded-md border border-slate-200">
              {initialData.page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page >= totalPages || isPending}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
