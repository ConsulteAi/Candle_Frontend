'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { httpClient as api } from '@/lib/api/httpClient';
import { revalidateTenantConfig } from '../../../app/actions/tenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { TenantUiSettings } from '@/types/admin';
import { BrandPreview } from './BrandPreview';
import { LogoUploader, type UploadedLogo } from './LogoUploader';

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

  const extractPhoneDigits = (value?: string) => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  };

  const formatWhatsappPhone = (value?: string) => {
    const digits = extractPhoneDigits(value).slice(0, 13);
    if (!digits) return '';

    const countryCode = digits.slice(0, 2);
    const rest = digits.slice(2);

    if (!rest) return `+${countryCode}`;

    const areaCode = rest.slice(0, 2);
    const localNumber = rest.slice(2);

    if (!localNumber) return `+${countryCode} (${areaCode}`;
    if (localNumber.length <= 4) {
      return `+${countryCode} (${areaCode}) ${localNumber}`;
    }
    if (localNumber.length <= 8) {
      return `+${countryCode} (${areaCode}) ${localNumber.slice(0, 4)}-${localNumber.slice(4)}`;
    }

    return `+${countryCode} (${areaCode}) ${localNumber.slice(0, 5)}-${localNumber.slice(5, 9)}`;
  };

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    logoPngUrl: '',
    faviconUrl: '',
    contactEmail: '',
    whatsappSupportPhone: '',
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
            logoPngUrl: ui.logoPngUrl || '',
            faviconUrl: ui.faviconUrl || '',
            contactEmail: ui.contactEmail || '',
            whatsappSupportPhone: formatWhatsappPhone(ui.whatsappSupportPhone),
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
      const normalizedWhatsappSupportPhone = extractPhoneDigits(formData.whatsappSupportPhone);

      await api.patch(`/admin/tenants/ui-settings`, {
        uiSettings: {
          name: formData.name,
          logoUrl: formData.logoUrl || null,
          logoPngUrl: formData.logoPngUrl || null,
          faviconUrl: formData.faviconUrl || null,
          contactEmail: normalizedContactEmail.length > 0 ? normalizedContactEmail : null,
          whatsappSupportPhone: normalizedWhatsappSupportPhone.length > 0 ? normalizedWhatsappSupportPhone : null,
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

    if (name === 'whatsappSupportPhone') {
      setFormData((prev) => ({ ...prev, whatsappSupportPhone: formatWhatsappPhone(value) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (name: string, hexValue: string) => {
    setFormData((prev) => ({ ...prev, [name]: hexToHslString(hexValue) }));
  };

  // O upload já persistiu as URLs no backend. Sincronizar o estado local evita
  // que o "Salvar" seguinte reenvie os valores antigos por cima.
  const handleLogoUploaded = async (logo: UploadedLogo) => {
    setFormData((prev) => ({ ...prev, ...logo }));
    // O upload já gravou no banco. Sem purgar o cache do Next, o restante do
    // app (sidebar, favicon) continuaria exibindo a logo anterior até o Salvar.
    await revalidateTenantConfig();
  };

  const handleLogoRemoved = async () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
      logoPngUrl: '',
      faviconUrl: '',
    }));
    await revalidateTenantConfig();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass =
    'h-10 border-slate-200 bg-white text-sm transition-colors focus-visible:ring-slate-900';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-6 py-5">
        <h2 className="font-display text-xl font-semibold tracking-tight text-slate-900">
          Identidade visual
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          A marca que seus clientes veem quando usam o sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 p-6 lg:grid-cols-5 lg:gap-12">
        {/* Controles */}
        <form onSubmit={handleSubmit} className="space-y-10 lg:col-span-3">
          <section className="space-y-5">
            <SectionHeading
              title="Sua marca"
              hint="Uma imagem só. O sistema gera o resto."
            />

            <Field
              label="Nome do ambiente"
              htmlFor="name"
              hint="Aparece no topo do sistema, na aba do navegador e nos relatórios."
            >
              <Input
                id="name"
                name="name"
                placeholder="Ex: 3V Negócios"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Logotipo
              </Label>
              <LogoUploader
                value={formData.logoUrl}
                faviconUrl={formData.faviconUrl}
                onUploaded={handleLogoUploaded}
                onRemoved={handleLogoRemoved}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Cor da marca"
                htmlFor="primaryColor"
                hint="Botões e destaques."
              >
                <ColorField
                  id="primaryColor"
                  name="primaryColor"
                  title="Escolher a cor da marca"
                  value={formData.primaryColor}
                  onPick={(hex) => handleColorChange('primaryColor', hex)}
                  onChange={handleChange}
                />
              </Field>

              <Field
                label="Cor de contraste"
                htmlFor="primaryForegroundColor"
                hint="Texto sobre a cor da marca."
              >
                <ColorField
                  id="primaryForegroundColor"
                  name="primaryForegroundColor"
                  title="Escolher a cor de contraste"
                  value={formData.primaryForegroundColor}
                  onPick={(hex) =>
                    handleColorChange('primaryForegroundColor', hex)
                  }
                  onChange={handleChange}
                />
              </Field>
            </div>

            <details className="group rounded-xl border border-slate-200 px-4 py-3">
              <summary className="cursor-pointer select-none text-xs font-medium text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
                Hospedar as imagens por conta própria
              </summary>
              <div className="space-y-4 pt-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  Informe endereços aqui só se preferir servir os arquivos do
                  seu próprio site. Eles são usados como estão, sem conversão —
                  e para a logo aparecer nos relatórios em PDF, precisa ser PNG
                  ou JPEG.
                </p>
                <Field label="Endereço da logo" htmlFor="logoUrl">
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    placeholder="https://seusite.com.br/logo.png"
                    value={formData.logoUrl}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
                <Field
                  label="Endereço do ícone da aba"
                  htmlFor="faviconUrl"
                  hint="Útil se você tem um ícone quadrado próprio."
                >
                  <Input
                    id="faviconUrl"
                    name="faviconUrl"
                    placeholder="https://seusite.com.br/favicon.ico"
                    value={formData.faviconUrl}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </Field>
              </div>
            </details>
          </section>

          <section className="space-y-5">
            <SectionHeading
              title="Contato"
              hint="Como seus clientes falam com você."
            />

            <Field
              label="E-mail comercial"
              htmlFor="contactEmail"
              hint="Se ficar vazio, as seções de contato somem do site."
            >
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="suporte@suaempresa.com.br"
                value={formData.contactEmail}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field
              label="WhatsApp de suporte"
              htmlFor="whatsappSupportPhone"
              hint="Se ficar vazio, o botão flutuante de suporte não aparece."
            >
              <Input
                id="whatsappSupportPhone"
                name="whatsappSupportPhone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+55 (11) 99999-9999"
                value={formData.whatsappSupportPhone}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </section>

          <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400">
              A logo é salva no envio. O resto, ao salvar.
            </p>
            <Button type="submit" disabled={isSaving} className="min-w-[132px]">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </form>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Como fica
            </p>
            <BrandPreview
              name={formData.name}
              logoUrl={formData.logoUrl}
              faviconUrl={formData.faviconUrl}
              primaryColor={formData.primaryColor}
              primaryForegroundColor={formData.primaryForegroundColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border-b border-slate-100 pb-3">
      <h3 className="font-display text-sm font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint && <p className="text-xs leading-relaxed text-slate-500">{hint}</p>}
    </div>
  );
}

/** Seletor de cor + o valor HSL que o sistema realmente usa. */
function ColorField({
  id,
  name,
  title,
  value,
  onPick,
  onChange,
}: {
  id: string;
  name: string;
  title: string;
  value: string;
  onPick: (hex: string) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-slate-900/15">
        <input
          type="color"
          title={title}
          aria-label={title}
          value={hslStringToHex(value)}
          onChange={(event) => onPick(event.target.value)}
          className="absolute -inset-2 h-16 w-16 cursor-pointer border-0 p-0"
        />
      </div>
      <Input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 border-slate-200 bg-white font-mono text-xs transition-colors focus-visible:ring-slate-900"
      />
    </div>
  );
}
