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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Edit, Loader2, Info, Save, DollarSign, FileText, Tag } from 'lucide-react';
import { httpClient } from '@/lib/api/httpClient';
import type { QueryType, PaginatedResponse, Provider } from '@/types/admin';
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

  const openModal = (item: QueryType) => {
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
  };

  const handleModalChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setEditingItem(null);
      setFormData(emptyFormData);
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

  return (
    <div className="flex flex-col gap-4">
      {/* ── Barra de filtros ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar consulta..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isMaster && (
          <div className="w-64">
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger>
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

      {/* ── Tabela ── */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              {isMaster ? (
                <>
                  <TableHead>Custo</TableHead>
                  <TableHead>Preço Site</TableHead>
                  <TableHead>Preço API</TableHead>
                  <TableHead>Preço Revenda</TableHead>
                </>
              ) : (
                <TableHead>Preço</TableHead>
              )}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColSpan} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColSpan} className="h-24 text-center text-slate-500">
                  Nenhum tipo de consulta encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((qt) => (
                <TableRow key={qt.id}>
                  <TableCell className="font-mono text-xs">{qt.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{qt.name}</div>
                    {isMaster && <div className="text-xs text-slate-500">{qt.providerName}</div>}
                  </TableCell>
                  {isMaster ? (
                    <>
                      <TableCell>R$ {qt.cost.toFixed(2)}</TableCell>
                      <TableCell>R$ {qt.price.toFixed(2)}</TableCell>
                      <TableCell>R$ {resolveApiTokenPrice(qt).toFixed(2)}</TableCell>
                      <TableCell>R$ {resolveResellerPrice(qt).toFixed(2)}</TableCell>
                    </>
                  ) : (
                    <TableCell>R$ {qt.price.toFixed(2)}</TableCell>
                  )}
                  <TableCell>
                    <Switch
                      checked={qt.isActive}
                      onCheckedChange={() => handleToggle(qt.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(qt)}
                      aria-label="Editar consulta"
                    >
                      <Edit data-icon="inline-start" />
                      <span className="sr-only">Editar</span>
                    </Button>
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
          <ScrollArea className="flex-1">
            <div className="px-6 py-5">
              {isMaster ? (
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
                </div>
              )}
            </div>
          </ScrollArea>

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
  );
}
