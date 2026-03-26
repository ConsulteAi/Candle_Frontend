'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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
import type { AdminQuery, PaginatedResponse } from '@/types/admin';

const PAGE_SIZE = 10;

interface UserQueriesListProps {
  userId: string;
}

export function UserQueriesList({ userId }: UserQueriesListProps) {
  const [data, setData] = useState<PaginatedResponse<AdminQuery> | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueries = useCallback(async (targetPage: number) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await httpClient.get<PaginatedResponse<AdminQuery>>(`/admin/users/${userId}/queries`, {
        params: { limit: PAGE_SIZE, page: targetPage },
      });
      setData(response.data);
    } catch {
      setError('Não foi possível carregar o histórico de consultas.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQueries(page);
  }, [fetchQueries, page]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Carregando consultas...
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
        Nenhuma consulta recente encontrada.
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
              <TableHead>Consulta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Custo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((query) => (
              <TableRow key={query.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(query.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{query.queryType.name}</span>
                    <span className="text-xs text-slate-400 font-mono">{query.queryType.code}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={query.status} />
                </TableCell>
                <TableCell className="text-right font-medium text-slate-700">
                  {query.status === 'FAILED' ? (
                    <span className="text-slate-400">{(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  ) : query.price > 0 ? (
                    query.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  ) : (
                    <span className="text-slate-400">Gratuito</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/consulta/${query.id}`} target="_blank">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
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
            de <span className="font-medium text-slate-700">{data.total}</span> consultas
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
  if (status === 'SUCCESS') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
        Sucesso
      </Badge>
    );
  }
  if (status === 'FAILED') {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
        Falhou
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}
