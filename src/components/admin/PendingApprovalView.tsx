'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { formatCpfCnpj } from '@/lib/formatters';
import httpClient from '@/lib/api/httpClient';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { AdminUser, PaginatedResponse } from '@/types/admin';

interface PendingApprovalViewProps {
  initialData: PaginatedResponse<AdminUser>;
}

export function PendingApprovalView({ initialData }: PendingApprovalViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState(initialData.data);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const totalPages = Math.ceil(initialData.total / initialData.limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/backoffice/aprovacao-cadastros?${params.toString()}`);
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await httpClient.patch(`/admin/users/${id}/status`, { status: 'ACTIVE' });
      toast.success('Cadastro aprovado com sucesso');
      setUsers((prev) => prev.filter((user) => user.id !== id));
      router.refresh();
    } catch (error) {
      toast.error('Erro ao aprovar cadastro');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aprovação de Cadastros</h1>
        <p className="text-slate-500">Cadastros de CPF aguardando aprovação para liberar o acesso à plataforma.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Nome</TableHead>
                <TableHead className="font-semibold text-slate-600">Email</TableHead>
                <TableHead className="font-semibold text-slate-600">CPF/CNPJ</TableHead>
                <TableHead className="font-semibold text-slate-600">Data de Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{user.name}</TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell className="font-mono text-slate-600">{formatCpfCnpj(user.cpfCnpj)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleApprove(user.id)}
                      disabled={approvingId === user.id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {approvingId === user.id ? 'Aprovando...' : 'Aprovar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Nenhum cadastro pendente no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4 px-2">
            <span className="text-sm text-slate-500">
              Mostrando {users.length} de {initialData.total} resultados
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(initialData.page - 1)}
                disabled={initialData.page <= 1}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-600 px-2">
                Página {initialData.page} de {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(initialData.page + 1)}
                disabled={initialData.page >= totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
