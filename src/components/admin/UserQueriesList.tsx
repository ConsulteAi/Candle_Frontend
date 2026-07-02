'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Loader2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock3,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatCpfCnpj } from '@/lib/formatters';

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

const fetcher = (url: string, params: Record<string, unknown>) =>
  httpClient.get<PaginatedResponse<AdminQuery>>(url, { params }).then((r) => r.data);

export function UserQueriesList({ userId }: UserQueriesListProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useSWR(
    [`/admin/users/${userId}/queries`, { limit: PAGE_SIZE, page }],
    ([url, params]) => fetcher(url, params as Record<string, unknown>),
    { keepPreviousData: true }
  );

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const isFetching = isLoading && !data;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const current = page;
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

  if (isFetching) {
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
        Não foi possível carregar o histórico de consultas.
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
      <div className={`rounded-md border border-slate-200 transition-opacity duration-150 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Consulta</TableHead>
              <TableHead>Documento</TableHead>
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
                  <span className="font-medium text-slate-700 truncate block max-w-[250px]" title={query.queryType.name}>
                    {query.queryType.name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-slate-700">
                    {formatCpfCnpj(query.input)}
                  </span>
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
                  {query.status === 'FAILED' ? (
                    <Button variant="ghost" size="sm" disabled={true}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Link href={`/consulta/${query.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
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
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || isLoading}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum as number)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
            
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || isLoading}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
  if (status === 'PENDING_RECONCILIATION') {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none">
        <Clock3 className="mr-1 h-3 w-3" />
        Reconciliação
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}
