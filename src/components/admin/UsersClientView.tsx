'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useUser } from '@/store/authStore';
import { UserRole } from '@/types/auth';

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

import type { AdminUser, PaginatedResponse } from '@/types/admin';

interface UsersClientViewProps {
  initialData: PaginatedResponse<AdminUser>;
}

export function UsersClientView({ initialData }: UsersClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useUser();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Debounce search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1
    router.push(`/backoffice/users?${params.toString()}`);
  };

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== 'ALL') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/backoffice/users?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
     const params = new URLSearchParams(searchParams);
     params.set('page', newPage.toString());
     router.push(`/backoffice/users?${params.toString()}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Ativo</Badge>;
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pendente</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">Suspenso</Badge>;
      case 'BANNED':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none">Banido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'MASTER':
        return <Badge className="bg-purple-100 text-purple-700 border-purple-200">MASTER</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">ADMIN</Badge>;
      default:
        return <span className="text-slate-500 text-sm">Usuário</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gerenciar Usuários</h1>
          <p className="text-slate-500">Visualize e gerencie todos os usuários da plataforma.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="gap-2">
             <Filter className="w-4 h-4" />
             Filtros Avançados
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
             Exportar CSV
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome, email ou CPF..." 
              className="pl-10 border-slate-200 bg-slate-50 focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select 
            defaultValue={searchParams.get('status') || 'ALL'} 
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-[180px] border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pendente</SelectItem>
              <SelectItem value="SUSPENDED">Suspenso</SelectItem>
              <SelectItem value="BANNED">Banido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Usuário</TableHead>
                <TableHead className="font-semibold text-slate-600">Status</TableHead>
                {currentUser?.role === UserRole.MASTER && (
                  <TableHead className="font-semibold text-slate-600">Role</TableHead>
                )}
                <TableHead className="font-semibold text-slate-600">Saldo</TableHead>
                <TableHead className="font-semibold text-slate-600">Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialData.data.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.email}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{user.cpfCnpj}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  {currentUser?.role === UserRole.MASTER && (
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                  )}
                  <TableCell>
                    <span className={`font-mono font-medium ${user.balance.available > 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {user.balance.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/backoffice/users/${user.id}`)}>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {initialData.data.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                     Nenhum usuário encontrado.
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
