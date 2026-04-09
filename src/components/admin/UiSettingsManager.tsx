'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { httpClient as api } from '@/lib/api/httpClient';
import { revalidateTenantConfig } from '../../../app/actions/tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Palette, Image as ImageIcon, Link as LinkIcon, Eye, LayoutTemplate, MousePointer2, CheckCircle2 } from 'lucide-react';
import { TenantUiSettings } from '@/types/admin';

// Helper utilities to parse and convert Tailwind HSL strings <-> Hex values
const hexToHslString = (hex: string): string => {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
};

const hslStringToHex = (hslStr: string): string => {
  if (!hslStr) return '#000000';
  const match = hslStr.match(/([\d.]+)[^\d]+([\d.]+)[^\d]+([\d.]+)/);
  if (!match) return '#000000';
  const [, hStr, sStr, lStr] = match;
  const hNum = parseFloat(hStr);
  const sNum = parseFloat(sStr) / 100;
  const lNum = parseFloat(lStr) / 100;

  const a = sNum * Math.min(lNum, 1 - lNum);
  const f = (n: number, k = (n + hNum / 30) % 12) => lNum - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

export function UiSettingsManager() {
  const params = useParams();
  const tenantSlug = params.tenant as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    primaryColor: '221.2 83.2% 53.3%',
    primaryForegroundColor: '210 40% 98%',
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await api.get<{ id?: string; uiSettings?: TenantUiSettings }>(`/public/tenants/ui-config`);
        const currentTenant = response.data;

        if (currentTenant) {
          const ui = currentTenant.uiSettings || {};
          const colors = ui.colors || {};

          setFormData({
            name: ui.name || '',
            logoUrl: ui.logoUrl || '',
            faviconUrl: ui.faviconUrl || '',
            contactEmail: ui.contactEmail || '',
            primaryColor: colors.primary || '221.2 83.2% 53.3%',
            primaryForegroundColor: colors.primaryForeground || '210 40% 98%',
          });
        }
      } catch (error) {
        console.error('Failed to load UI configs', error);
        toast.error('Erro ao carregar configurações.');
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, [tenantSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      const normalizedContactEmail = formData.contactEmail.trim();

      await api.patch(`/admin/tenants/ui-settings`, {
        uiSettings: {
          name: formData.name,
          logoUrl: formData.logoUrl,
          faviconUrl: formData.faviconUrl,
          contactEmail: normalizedContactEmail.length > 0 ? normalizedContactEmail : null,
          colors: {
            primary: formData.primaryColor,
            primaryForeground: formData.primaryForegroundColor,
          }
        }
      });
      toast.success('Configurações de interface atualizadas com sucesso!');
      
      // Update CSS variables real-time on host document
      document.documentElement.style.setProperty('--primary', formData.primaryColor);
      document.documentElement.style.setProperty('--primary-foreground', formData.primaryForegroundColor);

      // Purge Next.js Vercel Edge Cache globally so all users see the new brand immediately
      await revalidateTenantConfig();

      // Force refresh so Server Components (like Sidebar) get the updated name locally
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Erro ao salvar as configurações visuais.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (name: string, hexValue: string) => {
    setFormData((prev) => ({ ...prev, [name]: hexToHslString(hexValue) }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Generate dynamic styles for preview
  const previewStyle = {
    '--preview-primary': formData.primaryColor,
    '--preview-primary-foreground': formData.primaryForegroundColor
  } as React.CSSProperties;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 leading-tight">Painel de White-Label</h2>
          <p className="text-sm text-slate-500">Configure a identidade visual do seu ambiente.</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
              
              {/* Branding Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Imagens e Comunicação</h3>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">Nome do Ambiente (Empresa)</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Minha Plataforma"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm font-medium">Logotipo Principal (URL)</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      placeholder="Ex: https://meusite.com/logo.png"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl" className="flex items-center gap-2 text-sm font-medium">
                      Ícone / Favicon (URL)
                    </Label>
                    <Input
                      id="faviconUrl"
                      name="faviconUrl"
                      placeholder="Ex: https://meusite.com/favicon.ico"
                      value={formData.faviconUrl}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="contactEmail" className="text-sm font-medium">E-mail de Contato Comercial (opcional)</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      placeholder="Ex: suporte@suaempresa.com.br"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Se este campo ficar vazio, o e-mail será removido e as seções de contato não aparecerão para os usuários no site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors Section */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Palette className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Paleta de Cores Institucionais</h3>
                </div>
                
                <p className="text-sm text-slate-500 -mt-2">
                  Use o seletor visual abaixo para escolher as cores. O sistema fará a conversão automática para variáveis HSL utilizadas na interface.
                </p>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="primaryColor" className="text-sm font-medium">Cor Primária (Fundo, Botões)</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 bg-white">
                        <input 
                          type="color"
                          title="Escolher Cor Primária"
                          value={hslStringToHex(formData.primaryColor)}
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          className="absolute -inset-2 w-16 h-16 cursor-pointer border-0 p-0"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          id="primaryColor"
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          className="bg-slate-50 font-mono text-xs h-10 border-slate-200 focus:bg-white"
                          placeholder="221.2 83.2% 53.3%"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="primaryForegroundColor" className="text-sm font-medium">Cor Secundária (Textos sobre Primária)</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 bg-white">
                        <input 
                          type="color"
                          title="Escolher Cor de Texto Primário"
                          value={hslStringToHex(formData.primaryForegroundColor)}
                          onChange={(e) => handleColorChange('primaryForegroundColor', e.target.value)}
                          className="absolute -inset-2 w-16 h-16 cursor-pointer border-0 p-0"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          id="primaryForegroundColor"
                          name="primaryForegroundColor"
                          value={formData.primaryForegroundColor}
                          onChange={handleChange}
                          className="bg-slate-50 font-mono text-xs h-10 border-slate-200 focus:bg-white"
                          placeholder="210 40% 98%"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <Button type="submit" disabled={isSaving} className="min-w-[150px] shadow-sm">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Identidade Visual'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-1 border-l border-slate-100 lg:pl-8 space-y-5 pt-8 lg:pt-0">
            <div className="flex items-center gap-2 pb-2 border-b border-transparent">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Preview em Tempo Real</h3>
            </div>
            
            <p className="text-sm text-slate-500 mb-4">Veja como os botões e componentes principais reagirão às suas cores.</p>
            
            <div 
              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col ring-1 ring-black/[0.03]"
              style={previewStyle}
            >
              {/* Fake Topbar */}
              <div className="h-14 border-b border-slate-100 flex items-center px-4 gap-3 bg-white">
                {formData.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={formData.logoUrl} alt="Preview Logo" className="h-6 object-contain max-w-[120px]" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
                      <LayoutTemplate className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-semibold text-slate-700 tracking-tight">{formData.name || 'Sua Empresa'}</span>
                  </div>
                )}
                <div className="flex-1" />
                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-300" />
                </div>
              </div>
              
              {/* Fake Body */}
              <div className="p-5 space-y-5 bg-slate-50/50 flex-1">
                {/* Fake Breadcrumb/Title */}
                <div className="space-y-1.5">
                  <div className="h-3 w-20 bg-slate-200/60 rounded" />
                  <div className="h-5 w-40 bg-slate-300/60 rounded" />
                </div>
                
                {/* Fake Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 bg-white border border-slate-200 rounded-lg shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Faturamento</div>
                    <div className="text-xl font-bold tracking-tight" style={{ color: `hsl(var(--preview-primary))` }}>R$ 1.2M</div>
                  </div>
                  <div className="h-24 bg-white border border-slate-200 rounded-lg shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                       <CheckCircle2 className="w-3 h-3 opacity-20" style={{ color: `hsl(var(--preview-primary))` }} />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Status</div>
                    <div className="flex items-center gap-1.5 mt-auto">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(--preview-primary))` }} />
                      <span className="text-sm font-semibold text-slate-700">Ativo</span>
                    </div>
                  </div>
                </div>

                {/* Fake Interactive Component */}
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 mt-2">
                   <p className="text-xs text-slate-500 mb-3 text-center">Interação de botão e cor de contraste</p>
                   <button 
                     type="button"
                     className="w-full text-sm py-2.5 rounded-md font-medium transition-all shadow-sm hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                     style={{ 
                       backgroundColor: `hsl(var(--preview-primary))`, 
                       color: `hsl(var(--preview-primary-foreground))`
                     }}
                   >
                     <MousePointer2 className="w-4 h-4" />
                     Simular Clique
                   </button>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mt-4">
              <p className="text-xs text-blue-600 leading-relaxed">
                As cores primárias são usadas nos botões de ação e modais, certifique-se de que a <b>cor secundária</b> permite boa leitura (branco `210 40% 98%` ou escuro).
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
