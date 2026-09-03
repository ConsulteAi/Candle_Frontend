'use server';

import { revalidateTag } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';
import { GlobalConfigService } from '@/services/global-config.service';
import { env } from '@/lib/env';
import type { RechargeSuspendedNoticeConfig } from '@/types/admin';
import {
  RECHARGE_SUSPENDED_NOTICE_KEY,
  RECHARGE_SUSPENDED_NOTICE_CACHE_TAG,
  isValidRechargeSuspendedNoticeConfig,
} from '@/lib/global-config/recharge-suspended-notice';

/**
 * Leitura pública (sem auth) do aviso de recarga suspensa, para o banner em
 * /recarregar. Mesmo padrão de `fetchTenantConfig` em `src/lib/tenant/config.ts`:
 * fetch direto ao backend, cacheado pelo data cache do Next com uma tag
 * dedicada, invalidada quando o MASTER salva a config no backoffice.
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
        next: { tags: [RECHARGE_SUSPENDED_NOTICE_CACHE_TAG] },
        cache: 'force-cache',
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

/** Atualização (MASTER only). Invalida o cache do banner público ao salvar. */
export async function updateRechargeSuspendedNoticeAction(
  value: RechargeSuspendedNoticeConfig,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, error: 'Acesso negado.' };
    }

    await GlobalConfigService.updateByKey(RECHARGE_SUSPENDED_NOTICE_KEY, value);

    // @ts-ignore - mesmo alerta de lint falso-positivo já suprimido em app/actions/tenant.ts
    revalidateTag(RECHARGE_SUSPENDED_NOTICE_CACHE_TAG);

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || 'Erro ao salvar a configuração.',
    };
  }
}
