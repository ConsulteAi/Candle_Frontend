'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, AlertCircle, Database, CheckCircle, XCircle } from 'lucide-react';

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

interface UserQueriesListProps {
  userId: string;
}

export function UserQueriesList({ userId }: UserQueriesListProps) {
  const [data, setData] = useState<PaginatedResponse<AdminQuery> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await httpClient.get<PaginatedResponse<AdminQuery>>(`/admin/users/${userId}/queries`, {
        params: {
          limit: 10,
          page: 1
        }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar o histórico de consultas.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

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
    <div className="rounded-md border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Consulta</TableHead>
            <TableHead>Protocolo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Custo</TableHead>
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
                  <span className="font-mono text-xs text-slate-500 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                    {query.protocol}
                  </span>
               </TableCell>
              <TableCell>
                <StatusBadge status={query.status} />
              </TableCell>
              <TableCell className="text-right font-medium text-slate-700">
                 {query.cost > 0 ? (
                   query.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                 ) : (
                   <span className="text-slate-400">Gratuito</span>
                 )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
