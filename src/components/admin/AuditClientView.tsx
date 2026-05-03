'use client';

import { useState, useCallback, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Clock,
  User,
  Cpu,
  RefreshCw,
  GitBranch,
  Eye,
} from 'lucide-react';

import { getAuditEventsAction, getAuditEventByIdAction, getAuditResourceTimelineAction } from '@/actions/audit.actions';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

import type {
  AuditEvent,
  AuditEventListFilters,
  AuditEventListResponse,
  AuditActorType,
} from '@/types/admin';

// ─── Translation Maps ────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  // Payments
  RECHARGE_CREATED:              'Recarga criada',
  WEBHOOK_RECEIVED:              'Webhook recebido',
  PAYMENT_STATUS_CHANGED:        'Status do pagamento alterado',
  WEBHOOK_PROCESSED:             'Webhook processado',
  WEBHOOK_FAILED:                'Falha no webhook',
  BALANCE_CREDIT_APPLIED:        'Crédito de saldo aplicado',
  BALANCE_REVERSAL_APPLIED:      'Estorno de saldo aplicado',
  PAID_WITHOUT_DEPOSIT_DETECTED: 'Pagamento sem depósito detectado',
  // Auth
  ACCOUNT_ACTIVATED:             'Conta ativada',
  LOGIN_SUCCESS:                 'Login realizado',
  LOGIN_FAILED:                  'Falha no login',
  PASSWORD_CHANGE:               'Senha alterada',
  PASSWORD_RESET_REQUEST:        'Solicitação de redefinição de senha',
  PASSWORD_RESET:                'Senha redefinida',
  // Sessions
  SESSION_LOGOUT:                'Logout realizado',
  ALL_SESSIONS_REVOKED:          'Todas as sessões encerradas',
  SESSION_REVOKED:               'Sessão encerrada',
  // Admin
  ADMIN_BALANCE_ADJUSTED:        'Saldo ajustado pelo admin',
  USER_STATUS_CHANGED:           'Status do usuário alterado',
  USER_ROLE_CHANGED:             'Perfil do usuário alterado',
  QUERY_PRICE_BENEFIT_UPSERTED:  'Benefício de preço salvo',
  QUERY_PRICE_BENEFIT_REMOVED:   'Benefício de preço removido',
  // Queries
  QUERY_RESERVED:                'Consulta reservada',
  QUERY_BILLING_DEBIT_APPLIED:   'Débito de consulta aplicado',
  QUERY_CACHE_HIT_RECORDED:      'Resultado obtido do cache',
  QUERY_EXECUTION_SUCCEEDED:     'Consulta realizada com sucesso',
  QUERY_EXECUTION_FAILED:        'Falha na execução da consulta',
  QUERY_BILLING_REFUND_APPLIED:  'Estorno de consulta aplicado',
  QUERY_RESULT_PERSISTENCE_FAILED: 'Falha ao salvar resultado da consulta',
  // API Tokens
  API_TOKEN_CREATED:             'Token de API criado',
  API_TOKEN_STATUS_CHANGED:      'Status do token de API alterado',
  API_TOKEN_DELETED:             'Token de API removido',
};

const RESOURCE_LABELS: Record<string, string> = {
  transaction:         'Transação',
  webhook_log:         'Webhook',
  balance_movement:    'Movimentação de saldo',
  user:                'Usuário',
  session:             'Sessão',
  query:               'Consulta',
  query_price_benefit: 'Benefício de preço',
  api_token:           'Token de API',
};

const ACTOR_LABELS: Record<AuditActorType, string> = {
  USER:   'Usuário',
  ADMIN:  'Administrador',
  SYSTEM: 'Sistema',
};

function labelAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function labelResource(resourceType: string): string {
  return RESOURCE_LABELS[resourceType] ?? resourceType;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return format(new Date(d), "dd/MM/yy HH:mm:ss", { locale: ptBR });
}

function ActorBadge({ type }: { type: AuditActorType }) {
  const styles: Record<AuditActorType, string> = {
    USER:   'bg-sky-100 text-sky-700',
    ADMIN:  'bg-amber-100 text-amber-700',
    SYSTEM: 'bg-slate-100 text-slate-600',
  };
  const icons: Record<AuditActorType, React.ReactNode> = {
    USER:   <User className="w-3 h-3" />,
    ADMIN:  <ShieldCheck className="w-3 h-3" />,
    SYSTEM: <Cpu className="w-3 h-3" />,
  };
  return (
    <Badge title={type} className={`gap-1 border-none text-xs font-medium ${styles[type]}`}>
      {icons[type]} {ACTOR_LABELS[type]}
    </Badge>
  );
}

function ActionBadge({ action }: { action: string }) {
  const color = action.includes('FAILED') || action.includes('ERROR') || action.includes('DETECTED')
    ? 'bg-red-100 text-red-700'
    : action.includes('CREATED') || action.includes('CREDIT') || action.includes('SUCCESS') || action.includes('ACTIVATED')
    ? 'bg-emerald-100 text-emerald-700'
    : action.includes('CHANGED') || action.includes('UPDATED') || action.includes('UPSERTED') || action.includes('PROCESSED') || action.includes('RECEIVED')
    ? 'bg-blue-100 text-blue-700'
    : action.includes('DELETED') || action.includes('REMOVED') || action.includes('REVOKED') || action.includes('REVERSAL')
    ? 'bg-rose-100 text-rose-700'
    : 'bg-slate-100 text-slate-600';
  return (
    <Badge title={action} className={`border-none text-xs font-medium max-w-[220px] truncate ${color}`}>
      {labelAction(action)}
    </Badge>
  );
}

function JsonBlock({ value }: { value: Record<string, unknown> | null }) {
  if (!value || Object.keys(value).length === 0) {
    return <span className="text-slate-400 italic text-xs">—</span>;
  }
  return (
    <pre className="bg-slate-900 text-emerald-400 text-xs font-mono p-3 rounded-lg overflow-auto max-h-48 leading-relaxed">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function Truncate({ text, max = 24 }: { text: string | null; max?: number }) {
  if (!text) return <span className="text-slate-400">—</span>;
  return (
    <span title={text} className="font-mono text-xs">
      {text.length > max ? `${text.slice(0, max)}…` : text}
    </span>
  );
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

const EMPTY_FILTERS: AuditEventListFilters = {
  action: '', resourceType: '', resourceId: '',
  actorUserId: '', requestId: '', actorType: undefined,
  method: '', route: '', from: '', to: '',
  page: 1, limit: 20,
};

interface FilterPanelProps {
  filters: AuditEventListFilters;
  onChange: (f: AuditEventListFilters) => void;
  onSearch: () => void;
  onReset: () => void;
  loading: boolean;
}

function FilterPanel({ filters, onChange, onSearch, onReset, loading }: FilterPanelProps) {
  const set = (key: keyof AuditEventListFilters, val: string) =>
    onChange({ ...filters, [key]: val || undefined, page: 1 });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ação</Label>
          <Input placeholder="ex: WEBHOOK_FAILED" value={filters.action ?? ''} onChange={e => set('action', e.target.value)} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo de Recurso</Label>
          <Input placeholder="ex: transaction" value={filters.resourceType ?? ''} onChange={e => set('resourceType', e.target.value)} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ID do Recurso</Label>
          <Input placeholder="UUID do recurso" value={filters.resourceId ?? ''} onChange={e => set('resourceId', e.target.value)} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo de Ator</Label>
          <Select value={filters.actorType ?? 'ALL'} onValueChange={v => onChange({ ...filters, actorType: v === 'ALL' ? undefined : v as AuditActorType, page: 1 })}>
            <SelectTrigger className="h-9 text-sm border-slate-200">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="SYSTEM">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">ID do Ator</Label>
          <Input placeholder="UUID do usuário" value={filters.actorUserId ?? ''} onChange={e => set('actorUserId', e.target.value)} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Request ID</Label>
          <Input placeholder="UUID da request" value={filters.requestId ?? ''} onChange={e => set('requestId', e.target.value)} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">De</Label>
          <Input type="datetime-local" value={filters.from ?? ''} onChange={e => set('from', e.target.value ? new Date(e.target.value).toISOString() : '')} className="h-9 text-sm border-slate-200" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Até</Label>
          <Input type="datetime-local" value={filters.to ?? ''} onChange={e => set('to', e.target.value ? new Date(e.target.value).toISOString() : '')} className="h-9 text-sm border-slate-200" />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1.5 text-slate-500 hover:text-slate-800">
          <X className="w-3.5 h-3.5" /> Limpar
        </Button>
        <Button size="sm" onClick={onSearch} disabled={loading}
          className="bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-md shadow-primary/20">
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Buscar
        </Button>
      </div>
    </div>
  );
}

// ─── Event Detail Dialog ──────────────────────────────────────────────────────

interface EventDetailDialogProps {
  eventId: string | null;
  onClose: () => void;
  onViewTimeline: (resourceType: string, resourceId: string) => void;
}

function EventDetailDialog({ eventId, onClose, onViewTimeline }: EventDetailDialogProps) {
  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setEvent(null);
    const result = await getAuditEventByIdAction(id);
    if (result.success && result.data) {
      setEvent(result.data);
    } else {
      toast({ title: 'Evento não encontrado', variant: 'destructive' });
      onClose();
    }
    setLoading(false);
  }, [toast, onClose]);

  // Load when eventId changes
  if (eventId && !loading && !event) {
    load(eventId);
  }

  return (
    <Dialog open={!!eventId} onOpenChange={o => { if (!o) { onClose(); setEvent(null); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Detalhe do Evento
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {event && (
          <div className="space-y-5">
            {/* Summary row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Ação', value: <ActionBadge action={event.action} /> },
                { label: 'Tipo de Ator', value: <ActorBadge type={event.actorType} /> },
                { label: 'Tipo de Recurso', value: <span title={event.resourceType} className="text-sm text-slate-700">{labelResource(event.resourceType)}</span> },
                { label: 'ID do Recurso', value: <Truncate text={event.resourceId} max={32} /> },
                { label: 'ID do Ator', value: <Truncate text={event.actorUserId} max={32} /> },
                { label: 'Request ID', value: <Truncate text={event.requestId} max={32} /> },
                { label: 'Método', value: event.method ? <Badge className="bg-slate-100 text-slate-700 border-none font-mono">{event.method}</Badge> : <span className="text-slate-400">—</span> },
                { label: 'Rota', value: <Truncate text={event.route} max={32} /> },
                { label: 'IP', value: <Truncate text={event.ip} max={20} /> },
                { label: 'Data', value: <span className="text-sm text-slate-700">{fmtDate(event.createdAt)}</span> },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide block mb-1">{label}</span>
                  {value}
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Metadata</span>
              <JsonBlock value={event.metadata} />
            </div>

            {/* Before / After */}
            {(event.before || event.after) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Antes</span>
                  <JsonBlock value={event.before} />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Depois</span>
                  <JsonBlock value={event.after} />
                </div>
              </div>
            )}

            {/* Timeline button */}
            {event.resourceId && (
              <Button
                variant="outline"
                className="w-full gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                onClick={() => { onViewTimeline(event.resourceType, event.resourceId!); onClose(); setEvent(null); }}
              >
                <GitBranch className="w-4 h-4 text-primary" />
                Ver histórico completo de {labelResource(event.resourceType)}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Resource Timeline Dialog ─────────────────────────────────────────────────

interface TimelineDialogProps {
  resourceType: string | null;
  resourceId: string | null;
  onClose: () => void;
}

function TimelineDialog({ resourceType, resourceId, onClose }: TimelineDialogProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async (rt: string, ri: string) => {
    setLoading(true);
    setEvents([]);
    const result = await getAuditResourceTimelineAction(rt, ri);
    if (result.success && result.data) {
      setEvents(result.data);
    } else {
      toast({ title: 'Erro ao carregar timeline', variant: 'destructive' });
    }
    setLoading(false);
  }, [toast]);

  const open = !!resourceType && !!resourceId;

  if (open && !loading && events.length === 0) {
    load(resourceType!, resourceId!);
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) { onClose(); setEvents([]); } }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            Histórico de {resourceType ? labelResource(resourceType) : '—'}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <p className="text-center text-slate-400 py-8 text-sm">Nenhum evento encontrado para este recurso.</p>
        )}

        {events.length > 0 && (
          <div className="relative pl-4">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-4">
              {events.map((ev, i) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative pl-5"
                >
                  <div className="absolute left-[-1px] top-2 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
                  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <ActionBadge action={ev.action} />
                      <div className="flex items-center gap-1.5">
                        <ActorBadge type={ev.actorType} />
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDate(ev.createdAt)}
                        </span>
                      </div>
                    </div>
                    {Object.keys(ev.metadata).length > 0 && (
                      <pre className="mt-2 bg-slate-50 text-slate-600 text-xs font-mono p-2 rounded overflow-auto max-h-20 leading-relaxed">
                        {JSON.stringify(ev.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

interface AuditClientViewProps {
  initialData: AuditEventListResponse;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export function AuditClientView({ initialData }: AuditClientViewProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<AuditEventListResponse>(initialData);
  const [filters, setFilters] = useState<AuditEventListFilters>({ page: 1, limit: 20 });
  const [showFilters, setShowFilters] = useState(false);

  // Detail / Timeline state
  const [detailId, setDetailId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ resourceType: string; resourceId: string } | null>(null);

  const totalPages = Math.ceil(data.total / (filters.limit ?? 20));

  const search = useCallback((f: AuditEventListFilters) => {
    startTransition(async () => {
      const result = await getAuditEventsAction(f);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        toast({ title: 'Erro ao carregar auditoria', variant: 'destructive' });
      }
    });
  }, [toast]);

  const handleSearch = () => search(filters);

  const handleReset = () => {
    const reset = { page: 1, limit: 20 };
    setFilters(reset);
    search(reset);
  };

  const goToPage = (page: number) => {
    const next = { ...filters, page };
    setFilters(next);
    search(next);
  };

  const handleExport = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      const exportFilters = { ...filters };
      delete (exportFilters as any).page;
      for (const [k, v] of Object.entries(exportFilters)) {
        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
      }
      const apiBase = process.env.NEXT_PUBLIC_BASE_API_URL ?? '';
      const url = `${apiBase}/admin/audit-events/export?${params.toString()}`;

      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'audit-events.csv';
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch {
      toast({ title: 'Erro ao exportar CSV', variant: 'destructive' });
    }
  }, [filters, toast]);

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Auditoria</h1>
          <p className="text-slate-500 mt-0.5">
            Log de eventos internos do sistema · {data.total.toLocaleString('pt-BR')} eventos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(v => !v)}
            className="gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onSearch={handleSearch}
              onReset={handleReset}
              loading={isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide w-36">Data</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">Ação</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">Ator</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">Recurso</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">ID Recurso</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">ID Ator</TableHead>
              <TableHead className="font-semibold text-slate-600 text-xs uppercase tracking-wide">Rota</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <RefreshCw className="w-5 h-5 animate-spin text-slate-300 mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {!isPending && data.data.map((ev) => (
              <TableRow
                key={ev.id}
                className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                onClick={() => setDetailId(ev.id)}
              >
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                    {fmtDate(ev.createdAt)}
                  </span>
                </TableCell>
                <TableCell><ActionBadge action={ev.action} /></TableCell>
                <TableCell><ActorBadge type={ev.actorType} /></TableCell>
                <TableCell className="text-xs text-slate-700" title={ev.resourceType}>{labelResource(ev.resourceType)}</TableCell>
                <TableCell><Truncate text={ev.resourceId} /></TableCell>
                <TableCell><Truncate text={ev.actorUserId} /></TableCell>
                <TableCell className="font-mono text-xs text-slate-500 max-w-[160px] truncate">{ev.route ?? '—'}</TableCell>
                <TableCell>
                  <Eye className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </TableCell>
              </TableRow>
            ))}
            {!isPending && data.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-slate-200" />
                    <span className="text-sm">Nenhum evento encontrado com os filtros aplicados.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <span className="text-xs text-slate-500">
              Página {data.page} de {totalPages} · {data.total.toLocaleString('pt-BR')} eventos
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-slate-500 hover:bg-slate-100"
                disabled={data.page <= 1 || isPending}
                onClick={() => goToPage(data.page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" size="icon"
                className="h-7 w-7 text-slate-500 hover:bg-slate-100"
                disabled={data.page >= totalPages || isPending}
                onClick={() => goToPage(data.page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Dialogs */}
      <EventDetailDialog
        eventId={detailId}
        onClose={() => setDetailId(null)}
        onViewTimeline={(rt, ri) => setTimeline({ resourceType: rt, resourceId: ri })}
      />
      <TimelineDialog
        resourceType={timeline?.resourceType ?? null}
        resourceId={timeline?.resourceId ?? null}
        onClose={() => setTimeline(null)}
      />
    </motion.div>
  );
}
