'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  CreditCard,
  Ban,
  CheckCircle,
  Activity,
  DollarSign,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCpfCnpj, formatPhone } from '@/lib/formatters';
import { UserTransactionsList } from './UserTransactionsList';
import { UserQueriesList } from './UserQueriesList';
import { UserPriceBenefitsTab } from './UserPriceBenefitsTab';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import type { AdminUser } from '@/types/admin';
import httpClient from '@/lib/api/httpClient';

interface UserDetailsViewProps {
  user: AdminUser;
}

export function UserDetailsView({ user: initialUser }: UserDetailsViewProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Balance Modal State
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDescription, setBalanceDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role Modal State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isGeneratingReset, setIsGeneratingReset] = useState(false);
  const [resetPasswordLink, setResetPasswordLink] = useState<{ resetUrl: string; expiresAt: string } | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleAdjustBalance = async () => {
    const amount = parseFloat(balanceAmount.replace(',', '.'));
    
    if (isNaN(amount) || amount === 0) {
      toast.error('Por favor, informe um valor válido');
      return;
    }
    
    if (!balanceDescription.trim()) {
      toast.error('Informe uma descrição para o ajuste');
      return;
    }

    setIsSubmitting(true);
    try {
        await httpClient.post(`/admin/users/${user.id}/adjust-balance`, {
            amount,
            description: balanceDescription
        });
        toast.success(`Saldo ajustado com sucesso`);
        setIsBalanceModalOpen(false);
        setBalanceAmount('');
        setBalanceDescription('');
        
        // Optimistic update for balance
        setUser(prev => ({
            ...prev,
            balance: {
                ...prev.balance,
                available: prev.balance.available + amount
            }
        }));

        router.refresh();
    } catch (error) {
        toast.error('Erro ao ajustar saldo');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      await httpClient.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      toast.success('Status atualizado com sucesso');
      // Optimistic update or refetch
      setUser(prev => ({ ...prev, status: newStatus as any }));
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === user.role) {
      setIsRoleModalOpen(false);
      return;
    }

    setIsUpdatingRole(true);
    try {
      await httpClient.patch(`/admin/users/${user.id}/role`, { role: selectedRole });
      toast.success('Papel atualizado com sucesso');
      setUser(prev => ({ ...prev, role: selectedRole as any }));
      setIsRoleModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Erro ao atualizar papel');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleGeneratePasswordReset = async () => {
    setIsGeneratingReset(true);
    try {
      const { data } = await httpClient.post<{ token: string; expiresAt: string; resetUrl: string }>(
        `/admin/users/${user.id}/generate-password-reset`
      );
      setResetPasswordLink({ resetUrl: data.resetUrl, expiresAt: data.expiresAt });
    } catch {
      toast.error('Erro ao gerar link de reset');
    } finally {
      setIsGeneratingReset(false);
    }
  };

  const handleCopyResetLink = () => {
    if (resetPasswordLink?.resetUrl) {
      navigator.clipboard.writeText(resetPasswordLink.resetUrl);
      setIsLinkCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
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
      case UserRole.MASTER:
        if (currentUser?.role !== UserRole.MASTER) return null;
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none">Master</Badge>;
      case UserRole.ADMIN:
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">Admin</Badge>;
      case UserRole.USER:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">Usuário</Badge>;
      default:
        if (currentUser?.role !== UserRole.MASTER && role === UserRole.MASTER) return null;
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const canEditRole = 
    currentUser?.email !== user.email && (
      currentUser?.role === UserRole.MASTER || 
      (currentUser?.role === UserRole.ADMIN && user.role !== UserRole.MASTER)
    );

  const roleOptions = currentUser?.role === UserRole.MASTER 
    ? [
        { label: 'Master', value: UserRole.MASTER }, 
        { label: 'Admin', value: UserRole.ADMIN }, 
        { label: 'Usuário', value: UserRole.USER }
      ]
    : [
        { label: 'Admin', value: UserRole.ADMIN }, 
        { label: 'Usuário', value: UserRole.USER }
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.name}</h1>
              {getStatusBadge(user.status)}
              {getRoleBadge(user.role)}
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              ID: <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{user.id}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {canEditRole && (
             <Button
               variant="outline"
               onClick={() => { setSelectedRole(user.role); setIsRoleModalOpen(true); }}
               disabled={isLoading}
             >
               <Shield className="w-4 h-4 mr-2" /> Alterar Papel
             </Button>
           )}
           <Button
             variant="outline"
             onClick={() => { setResetPasswordLink(null); setIsResetPasswordModalOpen(true); }}
             disabled={isLoading}
           >
             <KeyRound className="w-4 h-4 mr-2" /> Resetar Senha
           </Button>
           {user.status === 'ACTIVE' ? (
             <Button variant="destructive" onClick={() => handleStatusChange('SUSPENDED')} disabled={isLoading}>
               <Ban className="w-4 h-4 mr-2" /> Suspender Usuário
             </Button>
           ) : (
             <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange('ACTIVE')} disabled={isLoading}>
               <CheckCircle className="w-4 h-4 mr-2" /> Ativar Usuário
             </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
           {/* Personal Info */}
           <Card>
             <CardHeader>
               <CardTitle>Informações Pessoais</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 uppercase">Email</label>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user.email}
                    </div>
                  </div>
                   <div className="space-y-1">
                     <label className="text-xs font-medium text-slate-500 uppercase">CPF/CNPJ</label>
                     <div className="flex items-center gap-2 text-slate-900 font-mono">
                       <Shield className="w-4 h-4 text-slate-400" />
                       {formatCpfCnpj(user.cpfCnpj)}
                     </div>
                   </div>
                   <div className="space-y-1">
                     <label className="text-xs font-medium text-slate-500 uppercase">Telefone</label>
                     <div className="flex items-center gap-2 text-slate-900">
                       <Phone className="w-4 h-4 text-slate-400" />
                       {user.phone ? formatPhone(user.phone) : 'N/A'}
                     </div>
                   </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500 uppercase">Data de Cadastro</label>
                    <div className="flex items-center gap-2 text-slate-900">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>
             </CardContent>
           </Card>

           {/* Stats / Activity */}
           <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Atividade Recente</TabsTrigger>
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="benefits">Benefícios</TabsTrigger>
              </TabsList>
              <TabsContent value="activity" className="mt-4">
                 <UserQueriesList userId={user.id} />
              </TabsContent>
              <TabsContent value="transactions" className="mt-4">
                 <UserTransactionsList userId={user.id} />
              </TabsContent>
              <TabsContent value="benefits" className="mt-4">
                 <UserPriceBenefitsTab userId={user.id} userName={user.name} />
              </TabsContent>
           </Tabs>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* Balance Card */}
           <Card className="bg-slate-900 text-white border-slate-800">
             <CardHeader className="pb-2">
               <CardTitle className="text-slate-200 text-sm font-medium uppercase tracking-wider">Saldo Disponível</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="text-3xl font-display font-bold">
                 {user.balance.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
               </div>
               <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                 <Button size="sm" variant="secondary" className="w-full text-slate-900 font-bold" onClick={() => setIsBalanceModalOpen(true)}>
                   <CreditCard className="w-4 h-4 mr-2" />
                   Ajustar
                 </Button>
               </div>
             </CardContent>
           </Card>

           {/* Quick Stats */}
           <Card>
             <CardHeader>
               <CardTitle>Métricas</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-sm text-slate-500">Total Gasto</span>
                 <span className="font-bold text-slate-900">
                   {(user.stats?.totalSpent || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
               </div>
               <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-sm text-slate-500">Recargas</span>
                 <span className="font-bold text-emerald-600">
                   {(user.stats?.totalDeposits || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-slate-500">Consultas Realizadas</span>
                 <span className="font-bold text-primary">
                   {user.stats?.totalQueries || 0}
                 </span>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
      {/* Balance Adjustment Modal */}
      <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Saldo</DialogTitle>
            <DialogDescription>
              Adicione ou remova créditos manualmente para {user.name}.
              Use valores negativos para remover.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Valor (R$)</Label>
               <Input 
                 placeholder="0,00" 
                 value={balanceAmount}
                 onChange={(e) => setBalanceAmount(e.target.value)}
                 type="text" 
               />
               <p className="text-xs text-slate-500">Use valores negativos (ex: -50.00) para debitar.</p>
             </div>
             
             <div className="space-y-2">
                <Label>Motivo / Descrição</Label>
                <Textarea 
                  placeholder="Ex: Reembolso de consulta falha, Bônus promocional..." 
                  value={balanceDescription}
                  onChange={(e) => setBalanceDescription(e.target.value)}
                />
             </div>
          </div>
          
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsBalanceModalOpen(false)}>Cancelar</Button>
             <Button onClick={handleAdjustBalance} disabled={isSubmitting}>
               {isSubmitting ? 'Processando...' : 'Confirmar Ajuste'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Adjustment Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel</DialogTitle>
            <DialogDescription>
              Altere as permissões de acesso de {user.name} na plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
             <div className="space-y-2">
               <Label>Papel do Usuário</Label>
               <Select value={selectedRole} onValueChange={setSelectedRole}>
                 <SelectTrigger>
                   <SelectValue placeholder="Selecione um papel" />
                 </SelectTrigger>
                 <SelectContent>
                   {roleOptions.map((opt) => (
                     <SelectItem key={opt.value} value={opt.value}>
                       {opt.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <p className="text-xs text-slate-500 mt-2">
                 Admin tem acesso ao painel. Usuário tem acesso apenas à área logada.
               </p>
             </div>
          </div>
          
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancelar</Button>
             <Button onClick={handleRoleChange} disabled={isUpdatingRole}>
               {isUpdatingRole ? 'Processando...' : 'Confirmar'}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Reset Password Modal */}
      <Dialog
        open={isResetPasswordModalOpen}
        onOpenChange={(open) => {
          setIsResetPasswordModalOpen(open);
          if (!open) setResetPasswordLink(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetar Senha</DialogTitle>
            <DialogDescription>
              {resetPasswordLink
                ? 'Link gerado com sucesso. Copie e envie ao usuário.'
                : `Gere um link de redefinição de senha para ${user.name}.`}
            </DialogDescription>
          </DialogHeader>

          {!resetPasswordLink ? (
            <>
              <div className="py-4 space-y-3">
                <p className="text-sm text-slate-600">
                  Um link seguro será gerado com validade de <strong>60 minutos</strong>.
                  Após o uso, todas as sessões ativas do usuário serão encerradas.
                </p>
                <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                  Tokens anteriores pendentes serão invalidados ao gerar um novo link.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetPasswordModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleGeneratePasswordReset} disabled={isGeneratingReset}>
                  {isGeneratingReset ? 'Gerando...' : 'Gerar Link'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Link de redefinição</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={resetPasswordLink.resetUrl}
                      className="font-mono text-xs bg-slate-50"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyResetLink}
                      className="shrink-0"
                    >
                      {isLinkCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Expira em:{' '}
                  <strong>
                    {format(new Date(resetPasswordLink.expiresAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </strong>
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsResetPasswordModalOpen(false)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
