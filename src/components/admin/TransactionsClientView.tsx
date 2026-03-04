'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  QrCode, 
  FileText 
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

interface TransactionsClientViewProps {
  initialData: PaginatedResponse<AdminTransaction>;
}

export function TransactionsClientView({ initialData }: TransactionsClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== 'ALL') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/backoffice/transactions?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
     const params = new URLSearchParams(searchParams);
     params.set('page', newPage.toString());
     router.push(`/backoffice/transactions?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECEIVED':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Confirmado</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pendente</Badge>;
      case 'FAILED':
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Falhou</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillingIcon = (type: string) => {
    switch (type) {
      case 'PIX': return <QrCode className="w-4 h-4 text-emerald-600" />;
      case 'CREDIT_CARD': return <CreditCard className="w-4 h-4 text-primary" />;
      case 'BOLETO': return <FileText className="w-4 h-4 text-orange-600" />;
      default: return <CreditCard className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transações Financeiras</h1>
          <p className="text-slate-500">Histórico completo de entradas e saídas.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
           Exportar Relatório
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select 
            defaultValue={searchParams.get('status') || 'ALL'} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px] border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="CONFIRMED">Confirmado</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-100 overflow-hidden">
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
                       <span className="text-sm text-slate-700">{tx.billingType}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
              {initialData.data.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                     Nenhuma transação encontrada.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between py-4 px-2">
            <span className="text-sm text-slate-500">
              Mostrando {initialData.data.length} de {initialData.total} resultados
            </span>
            <div className="flex gap-2">
               <Button 
                 variant="outline" 
                 size="sm" 
                 onClick={() => handlePageChange(initialData.page - 1)}
                 disabled={initialData.page <= 1}
               >
                 Anterior
               </Button>
               <div className="flex items-center px-4 text-sm font-medium bg-slate-50 rounded-md border border-slate-200">
                 Página {initialData.page}
               </div>
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={() => handlePageChange(initialData.page + 1)}
                 disabled={initialData.data.length < initialData.limit}
               >
                 Próxima
               </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
