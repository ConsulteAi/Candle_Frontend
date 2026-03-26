'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import httpClient from '@/lib/api/httpClient';
import type { AdminTransaction, PaginatedResponse } from '@/types/admin';

const PAGE_SIZE = 10;

interface UserTransactionsListProps {
  userId: string;
}

const fetcher = (url: string, params: Record<string, unknown>) =>
  httpClient.get<PaginatedResponse<AdminTransaction>>(url, { params }).then((r) => r.data);

export function UserTransactionsList({ userId }: UserTransactionsListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSWR(
    [`/admin/users/${userId}/transactions`, { limit: PAGE_SIZE, page }],
    ([url, params]) => fetcher(url, params as Record<string, unknown>),
    { keepPreviousData: true }
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const isFetching = isLoading && !data;

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-8 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Carregando transações...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8 text-red-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        Não foi possível carregar as transações.
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="flex justify-center items-center py-8 text-slate-500">
        Nenhuma transação encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-md border border-slate-200 transition-opacity duration-150 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(transaction.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {transaction.billingType}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            Mostrando{' '}
            <span className="font-medium text-slate-700">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.total)}
            </span>{' '}
            de <span className="font-medium text-slate-700">{data.total}</span> transações
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-600 px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-none',
    PENDING: 'bg-amber-100 text-amber-700 border-none',
    FAILED: 'bg-red-100 text-red-700 border-none',
    CANCELED: 'bg-slate-100 text-slate-700 border-none',
    RECEIVED: 'bg-emerald-100 text-emerald-700 border-none',
    OVERDUE: 'bg-red-100 text-red-700 border-none',
  };

  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    PENDING: 'Pendente',
    FAILED: 'Falhou',
    CANCELED: 'Cancelado',
    RECEIVED: 'Recebido',
    OVERDUE: 'Vencido',
  };

  return (
    <Badge className={styles[status] || 'bg-slate-100'} variant="outline">
      {labels[status] || status}
    </Badge>
  );
}
