'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { httpClient } from '@/lib/api/httpClient';
import { manualCpfUserSchema, type ManualCpfUserFormData } from '@/validators/manual-cpf-user.schemas';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { ManualCpfUser, PaginatedResponse, CreateManualCpfUserResponse } from '@/types/admin';

interface ManualCpfUserViewProps {
  initialData: PaginatedResponse<ManualCpfUser>;
}

export function ManualCpfUserView({ initialData }: ManualCpfUserViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetLink, setResetLink] = useState<{ resetUrl: string; expiresAt: string } | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualCpfUserFormData>({
    resolver: zodResolver(manualCpfUserSchema),
    defaultValues: { name: '', email: '', cpf: '', phone: '' },
  });

  const onSubmit = async (data: ManualCpfUserFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.phone ? data.phone.replace(/\D/g, '') : undefined,
      };
      const response = await httpClient.post<CreateManualCpfUserResponse>('/admin/users/manual-cpf', payload);
      toast.success('Usuário criado com sucesso');
      setResetLink({ resetUrl: response.data.resetUrl, expiresAt: response.data.expiresAt });
      reset();
      router.refresh();
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast.error(typeof message === 'string' ? message : 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyResetLink = () => {
    if (resetLink?.resetUrl) {
      navigator.clipboard.writeText(resetLink.resetUrl);
      setIsLinkCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/backoffice/cpf-manual?${params.toString()}`);
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

  const getStatusBadge = (status: ManualCpfUser['passwordResetStatus']) => {
    return status === 'USED' ? (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Usado</Badge>
    ) : (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pendente</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Liberação Manual CPF</h1>
        <p className="text-slate-500">
          Crie contas com CPF diretamente pelo backoffice — o cadastro público continua exclusivo
          para CNPJ.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
          <CardDescription>
            Sem campo de senha — ao criar, copie o link de definição de senha e envie ao cliente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" placeholder="Somente números, 11 dígitos" {...register('cpf')} />
              {errors.cpf && <p className="text-sm text-red-500">{errors.cpf.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input id="phone" placeholder="Somente números" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar usuário'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Usuário</TableHead>
                <TableHead className="font-semibold text-slate-600">CPF</TableHead>
                <TableHead className="font-semibold text-slate-600">Cadastro</TableHead>
                <TableHead className="font-semibold text-slate-600">Link de senha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{user.cpfCnpj}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(user.passwordResetStatus)}</TableCell>
                </TableRow>
              ))}

              {initialData.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    Nenhum usuário encontrado por esta via.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between py-4 px-2">
          <span className="text-sm text-slate-500">
            Mostrando {initialData.data.length} de {initialData.total} resultados
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(initialData.page - 1)}
              disabled={initialData.page <= 1}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="flex items-center justify-center w-9 h-9 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                    page === initialData.page
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={() => handlePageChange(initialData.page + 1)}
              disabled={initialData.page >= totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={!!resetLink}
        onOpenChange={(open) => {
          if (!open) setResetLink(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuário criado</DialogTitle>
            <DialogDescription>
              Link gerado com sucesso. Copie e envie ao cliente por fora da plataforma.
            </DialogDescription>
          </DialogHeader>

          {resetLink && (
            <>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Link de definição de senha</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={resetLink.resetUrl} className="font-mono text-xs bg-slate-50" />
                    <Button size="icon" variant="outline" onClick={handleCopyResetLink} className="shrink-0">
                      {isLinkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Expira em:{' '}
                  <strong>
                    {format(new Date(resetLink.expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </strong>
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setResetLink(null)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
