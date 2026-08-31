'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import { httpClient as api } from '@/lib/api/httpClient';
import { revalidateTenantConfig } from '../../../app/actions/tenant';

/**
 * Liga e desliga a recarga automática via PIX do tenant.
 *
 * Quando suspensa, o backend recusa novas cobranças e /recarregar passa a
 * mostrar o caminho manual pelo suporte. O admin do tenant aciona isso
 * sozinho durante uma instabilidade do gateway.
 */
export function RechargeAvailabilityCard() {
  const [suspended, setSuspended] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get<{ rechargeDisabled?: boolean }>(
          '/public/tenants/ui-config',
        );
        setSuspended(response.data?.rechargeDisabled === true);
      } catch {
        toast.error('Não foi possível ler o status da recarga.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleToggle = async (nextSuspended: boolean) => {
    if (isSaving) return;

    setIsSaving(true);
    const previous = suspended;
    setSuspended(nextSuspended);

    try {
      await api.patch('/admin/tenants/recharge-availability', {
        rechargeDisabled: nextSuspended,
      });

      // O status viaja no config do tenant, que é cacheado pelo Next.
      // Sem purgar, a mudança só apareceria para o usuário mais tarde.
      await revalidateTenantConfig();

      toast.success(
        nextSuspended
          ? 'Recarga suspensa. Os usuários serão direcionados ao suporte.'
          : 'Recarga liberada. O PIX automático voltou a funcionar.',
      );
    } catch (error: any) {
      setSuspended(previous);
      toast.error(
        error?.response?.data?.message || 'Não foi possível alterar o status.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
              suspended ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          <div>
            <p className="font-display text-sm font-bold text-slate-900">
              Recarga automática via PIX
            </p>
            <p className="mt-0.5 max-w-xl font-body text-xs leading-relaxed text-slate-500">
              {suspended
                ? 'Suspensa. A tela de recarga mostra o passo a passo para recarregar pelo WhatsApp do suporte, e o botão Gerar PIX fica desabilitado.'
                : 'Ativa. Os usuários geram o QR Code e o saldo entra automaticamente. Suspenda quando o gateway estiver instável.'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 self-start sm:self-center">
          {isLoading || isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : null}
          <span
            className={`font-body text-[11px] font-bold uppercase tracking-[0.14em] ${
              suspended ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {suspended ? 'Suspensa' : 'Ativa'}
          </span>
          <Switch
            checked={suspended}
            onCheckedChange={handleToggle}
            disabled={isLoading || isSaving}
            aria-label="Suspender a recarga automática via PIX"
          />
        </div>
      </div>
    </div>
  );
}
