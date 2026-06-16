'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Search, Edit, Loader2, Info, Save, DollarSign, FileText, Tag, SlidersHorizontal } from 'lucide-react';

/** Formata valor monetário em BRL sem prefixo duplicado */
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
import { httpClient } from '@/lib/api/httpClient';
import type {
  QueryType,
  PaginatedResponse,
  Provider,
} from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

type QueryTypeFormState = {
  name: string;
  description: string;
  price: number;
  apiTokenPrice: number | null;
  resellerPrice: number | null;
  cost: number;
};

type QueryTypeCompositionFormState = {
  enrichments: Array<{
    id: string;
    enrichmentId: string;
    enrichmentCode: string;
    enrichmentName: string;
    semanticKey: string;
    executionOrder: number;
    isActive: boolean;
    timeoutMs: number | null;
    candidates: Array<{
      id: string;
      queryTypeId: string;
      queryTypeCode: string;
      queryTypeName: string;
      priority: number;
      isActive: boolean;
    }>;
  }>;
};

const emptyFormData: QueryTypeFormState = {
  name: '',
  description: '',
  price: 0,
  apiTokenPrice: null,
  resellerPrice: null,
  cost: 0
};

/** Input monetário com prefixo R$ embutido à esquerda */
function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="relative flex items-center">
      <span className="pointer-events-none absolute left-3 select-none text-sm font-medium text-muted-foreground">
        R$
      </span>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn('pl-9', className)}
      />
    </div>
  );
}

/** Cabeçalho de seção dentro do dialog com ícone da brand */
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function QueryTypesManager() {
  const [queryTypes, setQueryTypes] = useState<QueryType[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProviderId, setSelectedProviderId] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QueryType | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [composition, setComposition] =
    useState<QueryTypeCompositionFormState | null>(null);
  const { toast } = useToast();
  const user = useAuthStore(state => state.user);
  const isMaster = user?.role === 'MASTER';

  const [formData, setFormData] = useState<QueryTypeFormState>(emptyFormData);

  const fetchQueryTypes = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get<PaginatedResponse<QueryType>>('/admin/query-types', {
        params: { limit: 100 }
      });
      setQueryTypes(response.data.data);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tipos de consulta.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await httpClient.get<Provider[]>('/admin/providers');
      setProviders(response.data);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os provedores.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchQueryTypes();
    if (isMaster) fetchProviders();
  }, [isMaster]);

  const resolveApiTokenPrice = (qt: QueryType) => qt.apiTokenPrice ?? qt.price;
  const resolveResellerPrice = (qt: QueryType) => qt.resellerPrice ?? qt.cost;
  const parseOptionalNumber = (value: string) => (value === '' ? null : Number(value));

  const fetchQueryTypeDetails = async (id: string) => {
    const response = await httpClient.get<QueryType>(`/admin/query-types/${id}`);
    return response.data;
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);
      const payload = isMaster
        ? {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            apiTokenPrice: formData.apiTokenPrice,
            resellerPrice: formData.resellerPrice,
            cost: formData.cost
          }
        : { price: formData.price };

      await httpClient.patch(`/admin/query-types/${editingItem.id}`, payload);

      if (composition) {
        await httpClient.patch(`/admin/query-types/${editingItem.id}/composition`, {
          enrichments: composition.enrichments.map((enrichment) => ({
            enrichmentId: enrichment.enrichmentId,
            executionOrder: enrichment.executionOrder,
            isActive: enrichment.isActive,
          })),
        });
      }

      toast({ title: 'Sucesso', description: 'Tipo de consulta atualizado.' });
      handleModalChange(false);
      fetchQueryTypes();
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar. Verifique os dados.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic update
    setQueryTypes(prev => prev.map(qt =>
      qt.id === id ? { ...qt, isActive: !qt.isActive } : qt
    ));

    try {
      await httpClient.post(`/admin/query-types/${id}/toggle`);
    } catch {
      // Revert on error
      setQueryTypes(prev => prev.map(qt =>
        qt.id === id ? { ...qt, isActive: !qt.isActive } : qt
      ));
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive'
      });
    }
  };

  const openModal = async (item: QueryType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description ?? '',
      price: item.price,
      apiTokenPrice: item.apiTokenPrice ?? null,
      resellerPrice: item.resellerPrice ?? null,
      cost: item.cost
    });
    setIsModalOpen(true);

    try {
      setLoadingDetails(true);
      const details = await fetchQueryTypeDetails(item.id);
      setEditingItem(details);

      const raw = details.composition as any;
      if (raw) {
        setComposition({
          enrichments: Array.isArray(raw.enrichments)
            ? raw.enrichments.map((entry: any) => ({
                id: entry.id,
                enrichmentId: entry.enrichmentId,
                enrichmentCode: entry.enrichment?.code ?? '',
                enrichmentName: entry.enrichment?.name ?? '',
                semanticKey: entry.enrichment?.semanticKey ?? '',
                executionOrder: entry.executionOrder,
                isActive: entry.isActive,
                timeoutMs: entry.enrichment?.timeoutMs ?? null,
                candidates: Array.isArray(entry.enrichment?.candidates)
                  ? entry.enrichment.candidates.map((candidate: any) => ({
                      id: candidate.id,
                      queryTypeId: candidate.queryTypeId,
                      queryTypeCode: candidate.queryTypeCode,
                      queryTypeName: candidate.queryTypeName,
                      priority: candidate.priority,
                      isActive: candidate.isActive,
                    }))
                  : [],
              }))
            : [],
        });
      } else {
        setComposition(null);
      }
    } catch {
      setComposition(null);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da composição.',
        variant: 'destructive'
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(null);
      setFormData(emptyFormData);
      setComposition(null);
      setLoadingDetails(false);
    }
  };

  const filteredTypes = queryTypes
    .filter(qt =>
      qt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qt.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(qt => !isMaster || selectedProviderId === 'all' || qt.providerId === selectedProviderId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const tableColSpan = isMaster ? 8 : 5;

  const renderCompositionSection = () => {
    if (!composition) return null;

    return (
      <div className="flex flex-col gap-4">
        <SectionHeader
          icon={SlidersHorizontal}
          title="Composição"
          description="Controle a composição deste tipo de consulta."
        />

        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-700" />
          <AlertTitle className="text-sm font-semibold text-amber-900">
            Contrato da arquitetura nova
          </AlertTitle>
          <AlertDescription className="mt-0.5 text-xs text-amber-800">
            A composição agora é definida por enrichments comerciais ligados ao query type técnico. Ordem e ativação continuam configuráveis aqui.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {composition.enrichments.map((enrichment) => (
            <div
              key={enrichment.id}
              className="rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {enrichment.enrichmentName}
                    </span>
                    <span className="rounded-full border border-border bg-muted/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {enrichment.enrichmentCode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ordem: {enrichment.executionOrder}
                    {enrichment.semanticKey && ` · Semântica: ${enrichment.semanticKey}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start rounded-full border border-border bg-muted/30 px-3 py-1.5">
                  <Switch
                    checked={enrichment.isActive}
                    onCheckedChange={(checked) =>
                      setComposition((current) =>
                        current
                          ? {
                              ...current,
                              enrichments: current.enrichments.map((item) =>
                                item.id === enrichment.id
                                  ? { ...item, isActive: checked }
                                  : item
                              ),
                            }
                          : current
                      )
                    }
                  />
                  <span className={cn(
                    'text-xs font-medium',
                    enrichment.isActive ? 'text-emerald-600' : 'text-muted-foreground'
                  )}>
                    {enrichment.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs text-muted-foreground">
                  Timeout do enrichment: {enrichment.timeoutMs ? `${enrichment.timeoutMs} ms` : 'default do runtime'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {enrichment.candidates.map((candidate) => (
                    <span
                      key={candidate.id}
                      className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {candidate.queryTypeName} ({candidate.queryTypeCode})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
    <div className="flex flex-col gap-4">
      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar consulta..."
              className="h-9 w-64 pl-9 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isMaster && (
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger className="h-9 w-52 text-sm">
                  <SelectValue placeholder="Todos os provedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Todos os provedores</SelectItem>
                    {providers.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {/* Contador de resultados */}
        {!loading && (
          <span className="text-xs text-muted-foreground">
            {filteredTypes.length} consulta{filteredTypes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Tabela ── */}
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {/* Coluna código com largura controlada */}
              <TableHead className="w-[200px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Código
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nome
              </TableHead>
              {isMaster ? (
                <>
                  {/* Custo — separado dos preços de venda pela semântica */}
                  <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-amber-600">
                    Custo
                  </TableHead>
                  <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Preço Site
                  </TableHead>
                  <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Preço API
                  </TableHead>
                  <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    P. Revenda
                  </TableHead>
                </>
              ) : (
                <TableHead className="w-28 text-right text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Preço
                </TableHead>
              )}
              <TableHead className="w-32 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-16 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColSpan} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Carregando consultas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColSpan} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-medium text-foreground">Nenhuma consulta encontrada</span>
                    <span className="text-xs text-muted-foreground">Tente ajustar o filtro de busca</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((qt) => (
                <TableRow
                  key={qt.id}
                  className={cn(
                    'group cursor-default transition-colors',
                    !qt.isActive && 'opacity-50'
                  )}
                >
                  {/* Código — chip monospace truncado com tooltip */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-block max-w-[180px] truncate rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {qt.code}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-mono text-xs">
                          {qt.code}
                        </TooltipContent>
                      </Tooltip>
                      {qt.kind === 'ENRICHMENT' && (
                        <span className="w-fit rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                          Raio X
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Nome + badge do provedor */}
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium leading-tight text-foreground">
                        {qt.name}
                      </span>
                      {isMaster && qt.providerName && qt.kind !== 'ENRICHMENT' && (
                        <span className="w-fit rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {qt.providerName}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Valores monetários — alinhados à direita, tabular-nums */}
                  {isMaster ? (
                    <>
                      <TableCell className="py-3 text-right tabular-nums">
                        <span className="text-sm font-medium text-amber-700">
                          R$ {fmt(qt.cost)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        <span className="text-sm font-semibold text-foreground">
                          R$ {fmt(qt.price)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {qt.kind === 'ENRICHMENT' ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm text-foreground">
                            R$ {fmt(resolveApiTokenPrice(qt))}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-right tabular-nums">
                        {qt.kind === 'ENRICHMENT' ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm text-foreground">
                            R$ {fmt(resolveResellerPrice(qt))}
                          </span>
                        )}
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="py-3 text-right tabular-nums">
                      <span className="text-sm font-semibold text-foreground">
                        R$ {fmt(qt.price)}
                      </span>
                    </TableCell>
                  )}

                  {/* Status: badge semântico + toggle */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={qt.isActive}
                        onCheckedChange={() => handleToggle(qt.id)}
                      />
                      <span className={cn(
                        'text-xs font-medium',
                        qt.isActive ? 'text-emerald-600' : 'text-muted-foreground'
                      )}>
                        {qt.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Ações */}
                  <TableCell className="py-3 text-right">
                    {qt.kind !== 'ENRICHMENT' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => openModal(qt)}
                            aria-label="Editar consulta"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Editar consulta</TooltipContent>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Dialog de edição ── */}
      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh]">

          {/* Header fixo com borda inferior */}
          <DialogHeader className="shrink-0 border-b px-6 py-5">
            <DialogTitle className="text-base font-semibold">
              Editar Consulta
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-muted-foreground">
              {editingItem?.name && (
                <span className="font-medium text-foreground">{editingItem.name}</span>
              )}
              {editingItem?.name && ' · '}
              Ajuste os valores conforme a política comercial vigente.
            </DialogDescription>
          </DialogHeader>

          {/* Body com scroll independente */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-5">
              {loadingDetails ? (
                <div className="flex min-h-40 items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Carregando detalhes...</span>
                  </div>
                </div>
              ) : isMaster ? (
                <div className="flex flex-col gap-6">
                  {/* Alerta de regras de herança */}
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-sm font-semibold text-blue-800">
                      Regras de herança de preços
                    </AlertTitle>
                    <AlertDescription className="mt-0.5 text-xs text-blue-700">
                      <strong>Preço API</strong> herda de <strong>Preço Site</strong> quando vazio.{' '}
                      <strong>Preço Revenda</strong> herda de <strong>Custo</strong> quando vazio.
                    </AlertDescription>
                  </Alert>

                  {/* Seção: Detalhes */}
                  <div className="flex flex-col gap-4">
                    <SectionHeader
                      icon={FileText}
                      title="Detalhes da consulta"
                      description="Informações exibidas no painel e para seus clientes."
                    />
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Nome</FieldLabel>
                        <FieldContent>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nome da consulta"
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <FieldContent>
                          <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição breve da consulta"
                          />
                        </FieldContent>
                      </Field>
                    </FieldGroup>
                  </div>

                  {/* Divisor */}
                  <div className="h-px w-full bg-border" />

                  {/* Seção: Precificação */}
                  <div className="flex flex-col gap-4">
                    <SectionHeader
                      icon={Tag}
                      title="Precificação"
                      description="Defina o preço do site e as regras de herança para API e revenda."
                    />
                    {/* Grid 2 colunas em telas sm+ — cai para 1 coluna em mobile */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel>Preço Site</FieldLabel>
                        <FieldContent>
                          <CurrencyInput
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Custo</FieldLabel>
                        <FieldContent>
                          <CurrencyInput
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                          />
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Preço API</FieldLabel>
                        <FieldContent>
                          <CurrencyInput
                            value={formData.apiTokenPrice ?? ''}
                            onChange={(e) =>
                              setFormData({ ...formData, apiTokenPrice: parseOptionalNumber(e.target.value) })
                            }
                            placeholder="Herda do Preço Site"
                          />
                          <FieldDescription>Se vazio, usa o preço do site.</FieldDescription>
                        </FieldContent>
                      </Field>
                      <Field>
                        <FieldLabel>Preço Revenda</FieldLabel>
                        <FieldContent>
                          <CurrencyInput
                            value={formData.resellerPrice ?? ''}
                            onChange={(e) =>
                              setFormData({ ...formData, resellerPrice: parseOptionalNumber(e.target.value) })
                            }
                            placeholder="Herda do Custo"
                          />
                          <FieldDescription>Se vazio, usa o custo.</FieldDescription>
                        </FieldContent>
                      </Field>
                    </div>
                  </div>

                  {composition && (
                    <>
                      <div className="h-px w-full bg-border" />
                      {renderCompositionSection()}
                    </>
                  )}
                </div>
              ) : (
                /* Visão simplificada para admin não-master */
                <div className="flex flex-col gap-4">
                  <SectionHeader
                    icon={DollarSign}
                    title="Preço da consulta"
                    description="Atualize apenas o valor comercial exibido no painel."
                  />
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Preço</FieldLabel>
                      <FieldContent>
                        <CurrencyInput
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        />
                      </FieldContent>
                    </Field>
                  </FieldGroup>

                  {composition && (
                    <>
                      <div className="h-px w-full bg-border" />
                      {renderCompositionSection()}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo com borda superior */}
          <DialogFooter className="shrink-0 border-t bg-muted/30 px-6 py-4">
            <Button
              variant="outline"
              onClick={() => handleModalChange(false)}
              disabled={saving}
              className="min-w-[90px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="min-w-[100px] gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
