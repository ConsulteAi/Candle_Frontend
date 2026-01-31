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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Loader2, Activity, Trash2, Globe } from 'lucide-react';
import { httpClient } from '@/lib/api/httpClient';
import type { Provider, CreateProviderDto, HealthCheckResponseDto } from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Provider | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<CreateProviderDto>>({
    code: '',
    name: '',
    description: '',
    baseUrl: '',
    timeout: 5000,
    retryAttempts: 3,
    priority: 1,
    credentialsKey: ''
  });

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get<Provider[]>('/admin/providers');
      setProviders(response.data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os provedores.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await httpClient.patch(`/admin/providers/${editingItem.id}`, formData);
        toast({ title: 'Sucesso', description: 'Provedor atualizado.' });
      } else {
        await httpClient.post('/admin/providers', formData);
        toast({ title: 'Sucesso', description: 'Provedor criado.' });
      }
      setIsModalOpen(false);
      fetchProviders();
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
      await httpClient.post(`/admin/providers/${id}/toggle`);
      fetchProviders();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status.',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este provedor?')) return;
    try {
      await httpClient.delete(`/admin/providers/${id}`);
      fetchProviders();
      toast({ title: 'Sucesso', description: 'Provedor excluído.' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir provedor.',
        variant: 'destructive'
      });
    }
  };

  const handleHealthCheck = async (id: string) => {
    try {
      const response = await httpClient.get<HealthCheckResponseDto>(`/admin/providers/${id}/health`);
      const status = response.data.status;
      const responseTime = response.data.responseTime;
      
      toast({
        title: `Health Check: ${status === 'healthy' ? 'OK' : status.toUpperCase()}`,
        description: `Tempo de resposta: ${responseTime}ms`,
        variant: status === 'healthy' ? 'default' : 'destructive'
      });
      // Optionally refresh list to update lastHealthCheck timestamp if backend updates it
      fetchProviders();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao verificar saúde do provedor.',
        variant: 'destructive'
      });
    }
  }

  const openModal = (item: Provider | null = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        description: item.description,
        baseUrl: item.baseUrl,
        timeout: item.timeout,
        retryAttempts: item.retryAttempts,
        priority: item.priority,
        credentialsKey: item.credentialsKey || ''
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        baseUrl: '',
        timeout: 5000,
        retryAttempts: 3,
        priority: 1,
        credentialsKey: ''
      });
    }
    setIsModalOpen(true);
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar provedor..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Provedor
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provedor</TableHead>
              <TableHead>Base URL</TableHead>
              <TableHead>Latência Média</TableHead>
              <TableHead>Prioridade</TableHead>
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
            ) : filteredProviders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Nenhum provedor encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProviders.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Globe className="h-4 w-4 text-slate-400" />
                       <div className="font-medium">{p.name}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono ml-6">{p.code}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={p.baseUrl}>
                    {p.baseUrl}
                  </TableCell>
                  <TableCell>
                    {p.avgResponseTime ? `${p.avgResponseTime.toFixed(0)}ms` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.priority}</Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                         <Switch 
                            checked={p.isActive}
                            onCheckedChange={() => handleToggle(p.id)}
                         />
                         <span className={cn("inline-block w-2 h-2 rounded-full", p.isActive ? "bg-emerald-500" : "bg-slate-300")}></span>
                     </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleHealthCheck(p.id)} title="Verificar Saúde">
                           <Activity className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openModal(p)}>
                           <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Provedor' : 'Novo Provedor'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nome</Label>
              <Input 
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Código</Label>
              <Input 
                className="col-span-3"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Base URL</Label>
              <Input 
                className="col-span-3"
                value={formData.baseUrl}
                onChange={(e) => setFormData({...formData, baseUrl: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Credenciais (Key)</Label>
              <Textarea 
                className="col-span-3 font-mono text-xs"
                rows={1}
                placeholder="Nome da variável de ambiente"
                value={formData.credentialsKey || ''}
                onChange={(e) => setFormData({...formData, credentialsKey: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Timeout (ms)</Label>
              <Input 
                type="number"
                className="col-span-3"
                value={formData.timeout}
                onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Retentativas</Label>
              <Input 
                 type="number"
                className="col-span-3"
                value={formData.retryAttempts}
                onChange={(e) => setFormData({...formData, retryAttempts: parseInt(e.target.value)})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Prioridade</Label>
              <Input 
                 type="number"
                className="col-span-3"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Descrição</Label>
              <Input 
                className="col-span-3"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
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
