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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Edit, Loader2 } from 'lucide-react';
import { httpClient } from '@/lib/api/httpClient';
import type { QueryType, CreateQueryTypeDto, PaginatedResponse, Provider } from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';

export function QueryTypesManager() {
  const [queryTypes, setQueryTypes] = useState<QueryType[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QueryType | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CreateQueryTypeDto>>({
    code: '',
    name: '',
    description: '',
    category: [],
    price: 0,
    cost: 0,
    endpoint: '',
    cacheTtlMinutes: 0,
    providerId: '',
    cachedPrice: 0
  });

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
      console.error('Failed to fetch providers', error);
    }
  };

  useEffect(() => {
    fetchQueryTypes();
    fetchProviders();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        ...formData
      };

      if (editingItem) {
        await httpClient.patch(`/admin/query-types/${editingItem.id}`, payload);
        toast({ title: 'Sucesso', description: 'Tipo de consulta atualizado.' });
      } else {
        await httpClient.post('/admin/query-types', payload);
        toast({ title: 'Sucesso', description: 'Tipo de consulta criado.' });
      }
      setIsModalOpen(false);
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
    try {
      await httpClient.post(`/admin/query-types/${id}/toggle`);
      fetchQueryTypes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive'
      });
    }
  };

  const openModal = (item: QueryType | null = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        cost: item.cost,
        endpoint: item.endpoint || '',
        providerId: item.providerId,
        cachedPrice: item.cachedPrice || 0
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        category: [],
        price: 0,
        cost: 0,
        endpoint: '',
        providerId: '',
        cachedPrice: 0
      });
    }
    setIsModalOpen(true);
  };

  const filteredTypes = queryTypes.filter(qt => 
    qt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qt.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar consulta..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Consulta
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Nenhum tipo de consulta encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((qt) => (
                <TableRow key={qt.id}>
                  <TableCell className="font-mono text-xs">{qt.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{qt.name}</div>
                    <div className="text-xs text-slate-500">{qt.providerName}</div>
                  </TableCell>
                  <TableCell>R$ {qt.cost.toFixed(2)}</TableCell>
                  <TableCell>R$ {qt.price.toFixed(2)}</TableCell>
                  <TableCell>
                     <Switch 
                        checked={qt.isActive}
                        onCheckedChange={() => handleToggle(qt.id)}
                     />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openModal(qt)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Consulta' : 'Nova Consulta'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Código</Label>
              <Input 
                className="col-span-3"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nome</Label>
              <Input 
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Endpoint</Label>
              <Input 
                className="col-span-3"
                value={formData.endpoint}
                onChange={(e) => setFormData({...formData, endpoint: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Preço Cache</Label>
              <Input 
                 type="number"
                className="col-span-3"
                value={formData.cachedPrice}
                onChange={(e) => setFormData({...formData, cachedPrice: parseFloat(e.target.value)})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Preço</Label>
              <Input 
                type="number"
                className="col-span-3"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Custo</Label>
              <Input 
                 type="number"
                className="col-span-3"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Provedor</Label>
              <div className="col-span-3">
                 <Select 
                   value={formData.providerId} 
                   onValueChange={(value) => setFormData({...formData, providerId: value})}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Selecione um provedor" />
                   </SelectTrigger>
                   <SelectContent>
                     {providers.map((p) => (
                       <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
