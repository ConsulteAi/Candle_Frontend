'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';

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

interface UserTransactionsListProps {
  userId: string;
}

export function UserTransactionsList({ userId }: UserTransactionsListProps) {
  const [data, setData] = useState<PaginatedResponse<AdminTransaction> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      // Using httpClient (client-side) to fetch from /admin/transactions
      // We assume the API supports filter by userId
      const response = await httpClient.get<PaginatedResponse<AdminTransaction>>(`/admin/users/${userId}/transactions`, {
        params: {
          limit: 10,
          page: 1
        }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar as transações.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
                 {/* Logic to color amount based on distinct logic if available, or just generic formatting */}
                 {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700 border-none',
    PENDING: 'bg-amber-100 text-amber-700 border-none',
    FAILED: 'bg-red-100 text-red-700 border-none',
    CANCELED: 'bg-slate-100 text-slate-700 border-none',
  };

  const labels: Record<string, string> = {
    CONFIRMED: 'Confirmado',
    PENDING: 'Pendente',
    FAILED: 'Falhou',
    CANCELED: 'Cancelado',
  };

  return (
    <Badge className={styles[status] || 'bg-slate-100'} variant="outline">
      {labels[status] || status}
    </Badge>
  );
}
