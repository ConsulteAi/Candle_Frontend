'use client';

import { useState, useEffect, useCallback } from 'react';
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

export function UserTransactionsList({ userId }: UserTransactionsListProps) {
  const [data, setData] = useState<PaginatedResponse<AdminTransaction> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async (targetPage: number) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await httpClient.get<PaginatedResponse<AdminTransaction>>(`/admin/users/${userId}/transactions`, {
        params: { limit: PAGE_SIZE, page: targetPage },
      });
      setData(response.data);
    } catch {
      setError('Não foi possível carregar as transações.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions(page);
  }, [fetchTransactions, page]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  if (isLoading) {
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
        {error}
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
      <div className="rounded-md border border-slate-200">
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
              disabled={page === 1}
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
              disabled={page === totalPages}
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
