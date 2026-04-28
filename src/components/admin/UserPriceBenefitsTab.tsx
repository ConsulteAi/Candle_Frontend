'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  Edit3,
  Loader2,
  Plus,
  ReceiptText,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import httpClient from '@/lib/api/httpClient';
import type {
  PaginatedResponse,
  QueryType,
  UpsertUserQueryPriceBenefitDTO,
  UserQueryPriceBenefit,
} from '@/types/admin';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface UserPriceBenefitsTabProps {
  userId: string;
  userName: string;
}

type BenefitFormState = {
  queryTypeId: string;
  sitePrice: string;
  apiPrice: string;
};

const emptyFormState: BenefitFormState = {
  queryTypeId: '',
  sitePrice: '',
  apiPrice: '',
};

const formatCurrency = (value: number | null) =>
  value == null
    ? 'Fallback padrão'
    : value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

const parseOptionalPrice = (value: string): number | null => {
  const normalized = value.trim().replace(',', '.');

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : NaN;
};

export function UserPriceBenefitsTab({
  userId,
  userName,
}: UserPriceBenefitsTabProps) {
  const [benefits, setBenefits] = useState<UserQueryPriceBenefit[]>([]);
  const [queryTypes, setQueryTypes] = useState<QueryType[]>([]);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(true);
  const [isLoadingQueryTypes, setIsLoadingQueryTypes] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBenefit, setEditingBenefit] =
    useState<UserQueryPriceBenefit | null>(null);
  const [form, setForm] = useState<BenefitFormState>(emptyFormState);

  const availableQueryTypes = useMemo(() => {
    if (editingBenefit) {
      return queryTypes;
    }

    const usedIds = new Set(benefits.map((benefit) => benefit.queryTypeId));
    return queryTypes.filter((queryType) => !usedIds.has(queryType.id));
  }, [benefits, editingBenefit, queryTypes]);

  const fetchBenefits = async () => {
    try {
      setIsLoadingBenefits(true);
      const response = await httpClient.get<UserQueryPriceBenefit[]>(
        `/admin/users/${userId}/query-price-benefits`
      );
      setBenefits(response.data);
    } catch {
      toast.error('Erro ao carregar benefícios de preço');
    } finally {
      setIsLoadingBenefits(false);
    }
  };

  const fetchQueryTypes = async () => {
    try {
      setIsLoadingQueryTypes(true);
      const response = await httpClient.get<PaginatedResponse<QueryType>>(
        '/admin/query-types',
        {
          params: { limit: 100 },
        }
      );
      setQueryTypes(response.data.data);
    } catch {
      toast.error('Erro ao carregar tipos de consulta');
    } finally {
      setIsLoadingQueryTypes(false);
    }
  };

  useEffect(() => {
    void fetchBenefits();
    void fetchQueryTypes();
  }, [userId]);

  const openCreateDialog = () => {
    setEditingBenefit(null);
    setForm(emptyFormState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (benefit: UserQueryPriceBenefit) => {
    setEditingBenefit(benefit);
    setForm({
      queryTypeId: benefit.queryTypeId,
      sitePrice:
        benefit.sitePrice == null ? '' : benefit.sitePrice.toFixed(2),
      apiPrice: benefit.apiPrice == null ? '' : benefit.apiPrice.toFixed(2),
    });
    setIsDialogOpen(true);
  };

  const resetDialog = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      setEditingBenefit(null);
      setForm(emptyFormState);
    }
  };

  const handleSave = async () => {
    const sitePrice = parseOptionalPrice(form.sitePrice);
    const apiPrice = parseOptionalPrice(form.apiPrice);

    if (Number.isNaN(sitePrice) || Number.isNaN(apiPrice)) {
      toast.error('Informe preços válidos para site e API');
      return;
    }

    if (sitePrice == null && apiPrice == null) {
      toast.error('Informe pelo menos um dos preços');
      return;
    }

    if (!form.queryTypeId) {
      toast.error('Selecione um tipo de consulta');
      return;
    }

    const payload: UpsertUserQueryPriceBenefitDTO = {
      sitePrice,
      apiPrice,
    };

    setIsSubmitting(true);
    try {
      await httpClient.put(
        `/admin/users/${userId}/query-price-benefits/${form.queryTypeId}`,
        payload
      );
      toast.success(
        editingBenefit
          ? 'Benefício atualizado com sucesso'
          : 'Benefício criado com sucesso'
      );
      resetDialog(false);
      await fetchBenefits();
    } catch {
      toast.error('Erro ao salvar benefício');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (benefit: UserQueryPriceBenefit) => {
    const confirmed = window.confirm(
      `Remover o benefício de ${benefit.queryType.name} para ${userName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await httpClient.delete(
        `/admin/users/${userId}/query-price-benefits/${benefit.queryTypeId}`
      );
      toast.success('Benefício removido com sucesso');
      await fetchBenefits();
    } catch {
      toast.error('Erro ao remover benefício');
    }
  };

  return (
    <>
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-slate-900">
                  Benefícios personalizados
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Defina preços especiais por tipo de consulta para o usuário.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                Site: preço próprio ou fallback padrão
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1">
                API: preço próprio ou fallback padrão
              </span>
            </div>
          </div>

          <Button
            onClick={openCreateDialog}
            disabled={isLoadingQueryTypes}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            {isLoadingQueryTypes ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Novo benefício
          </Button>
        </CardHeader>

        <CardContent>
          {isLoadingBenefits ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando benefícios...
              </div>
            </div>
          ) : benefits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                <ReceiptText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Nenhum benefício configurado
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                Crie preços especiais por query type para este usuário sem
                alterar o catálogo global.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-slate-300"
                onClick={openCreateDialog}
                disabled={isLoadingQueryTypes}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro benefício
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Query type</TableHead>
                    <TableHead>Preço site</TableHead>
                    <TableHead>Preço API</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benefits.map((benefit) => (
                    <TableRow key={benefit.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-900">
                            {benefit.queryType.name}
                          </div>
                          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                            <BadgeDollarSign className="h-3.5 w-3.5" />
                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-600">
                              {benefit.queryType.code}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-800">
                          {formatCurrency(benefit.sitePrice)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-800">
                          {formatCurrency(benefit.apiPrice)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {format(
                          new Date(benefit.updatedAt),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(benefit)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDelete(benefit)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={resetDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {editingBenefit ? 'Editar benefício' : 'Novo benefício'}
            </DialogTitle>
            <DialogDescription>
              Defina um preço especial para site, API ou ambos. Campos vazios
              continuam usando o fallback atual do backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Tipo de consulta</Label>
              <Select
                value={form.queryTypeId}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, queryTypeId: value }))
                }
                disabled={Boolean(editingBenefit)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um query type" />
                </SelectTrigger>
                <SelectContent>
                  {availableQueryTypes.map((queryType) => (
                    <SelectItem key={queryType.id} value={queryType.id}>
                      {queryType.name} · {queryType.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!editingBenefit && availableQueryTypes.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Todos os query types já possuem benefício configurado para
                  este usuário.
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Preço do site</Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 7,25"
                  value={form.sitePrice}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sitePrice: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-slate-500">
                  Deixe em branco para usar o preço padrão do site.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Preço da API</Label>
                <Input
                  inputMode="decimal"
                  placeholder="Ex: 8,50"
                  value={form.apiPrice}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      apiPrice: event.target.value,
                    }))
                  }
                />
                <p className="text-xs text-slate-500">
                  Deixe em branco para usar o fallback atual da API.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => resetDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !form.queryTypeId ||
                (!editingBenefit && availableQueryTypes.length === 0)
              }
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingBenefit ? 'Salvar alterações' : 'Criar benefício'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
