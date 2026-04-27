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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Loader2 } from 'lucide-react';
import { httpClient } from '@/lib/api/httpClient';
import type { QueryType, PaginatedResponse, Provider } from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';

type QueryTypeFormState = {
  code: string;
  name: string;
  description: string;
  price: number;
  apiTokenPrice: number | null;
  resellerPrice: number | null;
  cost: number;
};

const emptyFormData: QueryTypeFormState = {
  code: '',
  name: '',
  description: '',
  price: 0,
  apiTokenPrice: null,
  resellerPrice: null,
  cost: 0
};

export function QueryTypesManager() {
  const [queryTypes, setQueryTypes] = useState<QueryType[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
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
        params: { limit: 100 } // Fetch all for management view or implement pagination later
      });
      setQueryTypes(response.data.data);
    } catch (error) {
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
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os provedores.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchQueryTypes();
    if (isMaster) {
      fetchProviders();
    }
  }, [isMaster]);

  const resolveApiTokenPrice = (queryType: QueryType) =>
    queryType.apiTokenPrice ?? queryType.price;

  const resolveResellerPrice = (queryType: QueryType) =>
    queryType.resellerPrice ?? queryType.cost;

  const parseOptionalNumber = (value: string) => (value === '' ? null : Number(value));

  const handleSave = async () => {
    if (!editingItem) {
      return;
    }

    try {
      const payload = isMaster
        ? {
            code: formData.code,
            name: formData.name,
            description: formData.description,
            price: formData.price,
            apiTokenPrice: formData.apiTokenPrice,
            resellerPrice: formData.resellerPrice,
            cost: formData.cost
          }
        : {
            price: formData.price
          };

      await httpClient.patch(`/admin/query-types/${editingItem.id}`, payload);
      toast({ title: 'Sucesso', description: 'Tipo de consulta atualizado.' });
      handleModalChange(false);
      fetchQueryTypes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar. Verifique os dados.',
        variant: 'destructive'
      });
    }
  };

  const handleToggle = async (id: string) => {
    // Optimistic update
    setQueryTypes(prev => prev.map(qt => 
      qt.id === id ? { ...qt, isActive: !qt.isActive } : qt
    ));

    try {
      await httpClient.post(`/admin/query-types/${id}/toggle`);
      // No need to refetch if successful
    } catch (error) {
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
      code: item.code,
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

  const tableColSpan = isMaster ? 7 : 5;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              {isMaster ? (
                <>
                  <TableHead>Custo</TableHead>
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

      <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Consulta</DialogTitle>
          </DialogHeader>
          <FieldGroup className="py-4">
            {isMaster ? (
              <>
                <Field>
                  <FieldLabel>Código</FieldLabel>
                  <FieldContent>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <FieldContent>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Descrição</FieldLabel>
                  <FieldContent>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Preço</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Preço API</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Usa o preço padrão"
                      value={formData.apiTokenPrice ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apiTokenPrice: parseOptionalNumber(e.target.value)
                        })
                      }
                    />
                    <FieldDescription>
                      Se vazio, usa o preço padrão.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Preço Revenda</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Usa o custo"
                      value={formData.resellerPrice ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resellerPrice: parseOptionalNumber(e.target.value)
                        })
                      }
                    />
                    <FieldDescription>
                      Se vazio, usa o custo.
                    </FieldDescription>
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Custo</FieldLabel>
                  <FieldContent>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    />
                  </FieldContent>
                </Field>
              </>
            ) : (
              <Field>
                <FieldLabel>Preço</FieldLabel>
                <FieldContent>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </FieldContent>
              </Field>
            )}
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleModalChange(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
