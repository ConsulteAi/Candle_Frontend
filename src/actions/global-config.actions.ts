'use server';

import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { GlobalConfigService } from '@/services/global-config.service';
import { env } from '@/lib/env';
import type { RechargeSuspendedNoticeConfig } from '@/types/admin';
import {
  RECHARGE_SUSPENDED_NOTICE_KEY,
  isValidRechargeSuspendedNoticeConfig,
} from '@/lib/global-config/recharge-suspended-notice';

/**
 * Leitura pública (sem auth) do aviso de recarga suspensa, para o banner em
 * /recarregar. É invocada via RPC de Server Action a partir de um Client
 * Component (`RechargeSuspendedNotice`, dentro de um `useEffect`) — fora do
 * ciclo de render de página/layout que o Data Cache do Next (`next.tags` +
 * `force-cache`) espera, então `revalidateTag()` no save do backoffice não
 * confiava em invalidar essa entrada e o banner ficava preso no texto antigo.
 * Chamada leve, pública e disparada só quando o MASTER salva no backoffice —
 * sem cache agressivo, `no-store` sempre busca o valor atual.
 *
 * Nunca lança — a página de recarga não pode quebrar se o global-config
 * estiver fora do ar; o chamador deve tratar `success: false` caindo no
 * fallback hardcoded (`DEFAULT_RECHARGE_SUSPENDED_NOTICE`).
 */
export async function getPublicRechargeSuspendedNoticeAction(): Promise<{
  success: boolean;
  data: RechargeSuspendedNoticeConfig | null;
}> {
  try {
    const res = await fetch(
      `${env.baseApiUrl}/public/global-config/${RECHARGE_SUSPENDED_NOTICE_KEY}`,
      {
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      return { success: false, data: null };
    }

    const body = await res.json();
    if (!isValidRechargeSuspendedNoticeConfig(body?.value)) {
      return { success: false, data: null };
    }

    return { success: true, data: body.value };
  } catch {
    return { success: false, data: null };
  }
}

/** Leitura autenticada (MASTER only) para popular o formulário do backoffice. */
export async function getRechargeSuspendedNoticeAction(): Promise<{
  success: boolean;
  data: RechargeSuspendedNoticeConfig | null;
}> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, data: null };
    }

    const record = await GlobalConfigService.getByKey<RechargeSuspendedNoticeConfig>(
      RECHARGE_SUSPENDED_NOTICE_KEY,
    );
    return { success: true, data: record.value };
  } catch {
    return { success: false, data: null };
  }
}

/**
 * Atualização (MASTER only). O banner público lê com `no-store`, então não há
 * cache para invalidar aqui — a próxima leitura já pega o valor novo.
 */
export async function updateRechargeSuspendedNoticeAction(
  value: RechargeSuspendedNoticeConfig,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, error: 'Acesso negado.' };
    }

    await GlobalConfigService.updateByKey(RECHARGE_SUSPENDED_NOTICE_KEY, value);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || 'Erro ao salvar a configuração.',
    };
  }
}
