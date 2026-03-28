'use client';

import { useState, useCallback } from 'react';
import { format, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

import { httpClient } from '@/lib/api/httpClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { UserSearchComboBox } from '@/components/admin/UserSearchComboBox';

import type { ApiToken, CreatedApiToken, CreateApiTokenDto } from '@/types/admin';

// --- Types ---

interface ApiTokensClientViewProps {
  initialTokens: ApiToken[];
}

// --- Helpers ---

function getStatusBadge(token: ApiToken) {
  const expired = token.expiresAt && isPast(new Date(token.expiresAt));
  if (expired) {
    return <Badge className="bg-orange-100 text-orange-700 border-none">Expirado</Badge>;
  }
  if (token.isActive) {
    return <Badge className="bg-emerald-100 text-emerald-700 border-none">Ativo</Badge>;
  }
  return <Badge className="bg-slate-100 text-slate-500 border-none">Inativo</Badge>;
}

function formatDate(date: string | null) {
  if (!date) return null;
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

// --- animation variants ---
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// --- Component ---

export function ApiTokensClientView({ initialTokens }: ApiTokensClientViewProps) {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<ApiToken[]>(initialTokens);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ userId: string; name: string; expiresAt: string }>({
    userId: '',
    name: '',
    expiresAt: '',
  });

  // Token reveal dialog
  const [revealToken, setRevealToken] = useState<CreatedApiToken | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ApiToken | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle loading
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // --- Handlers ---

  const handleCreate = useCallback(async () => {
    if (!form.userId || !form.name.trim()) {
      toast({ title: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const payload: CreateApiTokenDto = {
        userId: form.userId,
        name: form.name.trim(),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      };
      const response = await httpClient.post<CreatedApiToken>('/api-tokens', payload);
      const created = response.data;
      setTokens((prev) => [created, ...prev]);
      setCreateOpen(false);
      setForm({ userId: '', name: '', expiresAt: '' });
      setRevealToken(created);
    } catch {
      toast({ title: 'Erro ao criar token', description: 'Verifique os dados e tente novamente.', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  }, [form, toast]);

  const handleToggle = useCallback(async (token: ApiToken) => {
    setTogglingId(token.id);
    try {
      const response = await httpClient.patch<ApiToken>(`/api-tokens/${token.id}`, {
        isActive: !token.isActive,
      });
      setTokens((prev) => prev.map((t) => (t.id === token.id ? response.data : t)));
      toast({
        title: token.isActive ? 'Token desativado' : 'Token ativado',
        description: `"${token.name}" foi ${token.isActive ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch {
      toast({ title: 'Erro ao atualizar token', variant: 'destructive' });
    } finally {
      setTogglingId(null);
    }
  }, [toast]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await httpClient.delete(`/api-tokens/${deleteTarget.id}`);
      setTokens((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast({ title: 'Token excluído', description: `"${deleteTarget.name}" foi removido permanentemente.` });
      setDeleteTarget(null);
    } catch {
      toast({ title: 'Erro ao excluir token', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, toast]);

  const handleCopy = useCallback(() => {
    if (!revealToken?.token) return;
    navigator.clipboard.writeText(revealToken.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [revealToken]);

  // --- Render ---

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">API Tokens</h1>
          <p className="text-slate-500">
            Gerencie tokens de acesso para integração direta com a API de consultas.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Criar Token
        </Button>
      </motion.div>

      {/* Info banner */}
      <motion.div variants={item} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-500">
          Tokens permitem que sistemas externos consumam consultas sem o white-label. Os créditos são debitados do saldo do usuário vinculado ao token.
        </p>
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600">Token</TableHead>
              <TableHead className="font-semibold text-slate-600">Usuário</TableHead>
              <TableHead className="font-semibold text-slate-600">Nome</TableHead>
              <TableHead className="font-semibold text-slate-600">Status</TableHead>
              <TableHead className="font-semibold text-slate-600">Último Uso</TableHead>
              <TableHead className="font-semibold text-slate-600">Expira em</TableHead>
              <TableHead className="text-right font-semibold text-slate-600">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const expired = token.expiresAt && isPast(new Date(token.expiresAt));
              return (
                <TableRow key={token.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                      {token.prefix}...
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800 text-sm">{token.userName}</TableCell>
                  <TableCell className="text-slate-700 text-sm">{token.name}</TableCell>
                  <TableCell>{getStatusBadge(token)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {token.lastUsedAt ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatDate(token.lastUsedAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Nunca usado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {token.expiresAt ? (
                      <span className={`text-sm ${expired ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                        {formatDate(token.expiresAt)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Sem expiração</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={togglingId === token.id}
                        onClick={() => handleToggle(token)}
                        className={`gap-1.5 text-xs font-medium h-8 hover:bg-slate-100 ${
                          token.isActive
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        {token.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {togglingId === token.id ? '...' : token.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteTarget(token)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {tokens.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <KeyRound className="w-8 h-8 text-slate-200" />
                    <span className="text-sm">Nenhum token criado ainda.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 gap-1.5 text-xs border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-primary/30"
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className="w-3.5 h-3.5" /> Criar primeiro token
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* ── Create Token Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!creating) setCreateOpen(o); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Criar API Token
            </DialogTitle>
            <DialogDescription>
              O token gerado permite acesso externo à API de consultas. Os créditos serão debitados do usuário selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">
                Usuário vinculado <span className="text-red-500">*</span>
              </Label>
              <UserSearchComboBox
                ownerId={form.userId || null}
                onSelect={(id) => setForm((f) => ({ ...f, userId: id ?? '' }))}
              />
              <p className="text-xs text-slate-400">Os créditos serão debitados deste usuário.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token-name" className="text-sm font-semibold text-slate-700">
                Nome do token <span className="text-red-500">*</span>
              </Label>
              <Input
                id="token-name"
                placeholder="Ex: Integração ERP, CRM Produção..."
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires-at" className="text-sm font-semibold text-slate-700">
                Data de expiração{' '}
                <span className="text-slate-400 font-normal text-xs">(opcional)</span>
              </Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="border-slate-200"
              />
              <p className="text-xs text-slate-400">Se não preenchido, o token não expira.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating} className="border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-primary/30">
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white gap-2"
              onClick={handleCreate}
              disabled={creating || !form.userId || !form.name.trim()}
            >
              {creating ? 'Criando...' : 'Criar Token'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Token Reveal Dialog ── */}
      <Dialog open={!!revealToken} onOpenChange={(o) => { if (!o) { setRevealToken(null); setCopied(false); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
              Token criado com sucesso!
            </DialogTitle>
          </DialogHeader>

          {/* Warning banner */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Salve este token agora.</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Ele não será exibido novamente. Após fechar este dialog, não será possível recuperá-lo.
              </p>
            </div>
          </div>

          {/* Token display */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Token de acesso</Label>
            <div className="relative">
              <code className="block w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl break-all leading-relaxed border border-slate-800">
                {revealToken?.token}
              </code>
              <Button
                size="icon"
                className={`absolute top-2 right-2 h-8 w-8 transition-all ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Copiado para a área de transferência!
              </p>
            )}
          </div>

          {/* Token info */}
          {revealToken && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1">Usuário</span>
                <span className="font-semibold text-slate-800">{revealToken.userName}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wide block mb-1">Nome</span>
                <span className="font-semibold text-slate-800">{revealToken.name}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2"
              onClick={() => { setRevealToken(null); setCopied(false); }}
            >
              <Check className="w-4 h-4" />
              Salvei o token, fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir token permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o token{' '}
              <span className="font-semibold text-slate-900">"{deleteTarget?.name}"</span>? Esta ação não pode ser desfeita.
              O token será desativado imediatamente e não poderá ser reativado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="border-slate-200 hover:bg-slate-50 focus-visible:ring-primary/30">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
