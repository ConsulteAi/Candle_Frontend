'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Loader2,
  Building2,
  Trash2,
  Users,
  Database,
  Activity,
  Crown,
  Globe,
} from 'lucide-react';
import { httpClient } from '@/lib/api/httpClient';
import { revalidateTenantConfig } from '../../../app/actions/tenant';
import type { Tenant, CreateTenantDto, UpdateTenantDto } from '@/types/admin';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { UserSearchComboBox } from './UserSearchComboBox';

export function TenantsManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Tenant | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<
    Partial<CreateTenantDto> & {
      pdfShowLogo?: boolean;
      rechargeDisabled?: boolean;
    }
  >({
    slug: '',
    name: '',
    asaasApiKey: '',
    domain: '',
    ownerId: '',
    pdfShowLogo: false,
    rechargeDisabled: false,
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get<Tenant[]>('/admin/tenants');
      setTenants(response.data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tenants.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleSave = async () => {
    try {
      const payloadDomain = formData.domain?.trim() || undefined;
      const isDefaultTenant = editingItem?.slug === 'default' || formData.slug === 'default';
      const payloadOwnerId = isDefaultTenant ? null : (formData.ownerId?.trim() || null);

      if (editingItem) {
        const updateData: UpdateTenantDto = {
          name: formData.name,
          asaasApiKey: formData.asaasApiKey, // keep original behavior for the input that is still visible
          domain: payloadDomain,
          ownerId: payloadOwnerId,
          pdfShowLogo: !!formData.pdfShowLogo,
          rechargeDisabled: !!formData.rechargeDisabled,
        };
        await httpClient.patch(`/admin/tenants/${editingItem.id}`, updateData);
        // O status da recarga viaja no config público, cacheado pelo Next.
        await revalidateTenantConfig();
        toast({ title: 'Sucesso', description: 'Tenant atualizado.' });
      } else {
        const createData = {
          ...formData,
          asaasApiKey: formData.asaasApiKey,
          domain: payloadDomain,
          ownerId: payloadOwnerId || undefined, // undefined for POST
        };
        await httpClient.post('/admin/tenants', createData);
        toast({ title: 'Sucesso', description: 'Tenant criado. Providers e QueryTypes foram clonados do default.' });
      }
      setIsModalOpen(false);
      fetchTenants();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Falha ao salvar. Verifique os dados.';
      toast({
        title: 'Erro',
        description: Array.isArray(message) ? message.join(', ') : message,
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este tenant? Esta ação pode ser revertida.')) return;
    try {
      await httpClient.delete(`/admin/tenants/${id}`);
      fetchTenants();
      toast({ title: 'Sucesso', description: 'Tenant desativado.' });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao desativar tenant.',
        variant: 'destructive',
      });
    }
  };

  const openModal = (item: Tenant | null = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        slug: item.slug,
        name: item.name,
        asaasApiKey: item.asaasApiKey,
        domain: '',
        ownerId: item.ownerId || '',
        pdfShowLogo: !!item.pdfShowLogo,
        rechargeDisabled: !!item.rechargeDisabled,
      });
    } else {
      setFormData({
        slug: '',
        name: '',
        asaasApiKey: '',
        domain: '',
        ownerId: '',
        pdfShowLogo: false,
        rechargeDisabled: false,
      });
    }
    setIsModalOpen(true);
  };

  const filteredTenants = tenants
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar tenant..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tenant
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Usuários</TableHead>
              <TableHead>Provedores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                  Nenhum tenant encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredTenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <div className="font-medium">{t.name}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono ml-6">
                      {t.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    {t.ownerName ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          <span className="font-medium text-sm">{t.ownerName}</span>
                        </div>
                        <div className="text-xs text-slate-500 ml-5">{t.ownerEmail}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sem owner</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                      {t.asaasApiKey}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{t._count?.users ?? '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-slate-400" />
                      <span>{t._count?.providers ?? '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={t.isActive ? 'default' : 'secondary'}
                        className={cn(
                          t.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {t.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openModal(t)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeactivate(t.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
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

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Tenant' : 'Novo Tenant'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Slug</Label>
              <Input
                className="col-span-3 font-mono"
                placeholder="acme-corp"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                disabled={!!editingItem}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Nome</Label>
              <Input
                className="col-span-3"
                placeholder="Acme Corporation"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            {!editingItem && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Domínio</Label>
                <Input
                  className="col-span-3"
                  placeholder="acme.consulta.ai"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs leading-tight">Dono</Label>
              <div className="col-span-3">
                <UserSearchComboBox
                  ownerId={formData.ownerId}
                  onSelect={(id) => setFormData({ ...formData, ownerId: id || '' })}
                  disabled={editingItem?.slug === 'default' || formData.slug === 'default'}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-xs leading-tight">Asaas API Key</Label>
              <Input
                className="col-span-3 font-mono text-sm"
                placeholder="$aact_..."
                value={formData.asaasApiKey}
                onChange={(e) =>
                  setFormData({ ...formData, asaasApiKey: e.target.value })
                }
              />
            </div>
            {editingItem && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs leading-tight">
                  Logo no PDF
                </Label>
                <div className="col-span-3 flex items-center gap-3">
                  <Switch
                    checked={!!formData.pdfShowLogo}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, pdfShowLogo: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Exibe a logo do tenant no topo do PDF das consultas
                  </span>
                </div>
              </div>
            )}
            {editingItem && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-xs leading-tight">
                  Suspender recarga
                </Label>
                <div className="col-span-3 flex items-center gap-3">
                  <Switch
                    checked={!!formData.rechargeDisabled}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, rechargeDisabled: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Bloqueia o PIX automático e manda o usuário recarregar pelo
                    suporte
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
