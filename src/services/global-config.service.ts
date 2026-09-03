import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type { GlobalConfigRecord } from '@/types/admin';

/**
 * Cliente admin (MASTER only) para `/admin/global-config/:key`. Autenticado
 * via cookie httpOnly (serverHttpClient) — usar somente a partir de Server
 * Actions / Server Components, nunca do browser.
 */
export const GlobalConfigService = {
  getByKey: async <T = unknown>(key: string): Promise<GlobalConfigRecord<T>> => {
    const response = await serverHttpClient.get<GlobalConfigRecord<T>>(
      `/admin/global-config/${encodeURIComponent(key)}`,
    );
    return response.data;
  },

  updateByKey: async <T = unknown>(key: string, value: T): Promise<GlobalConfigRecord<T>> => {
    const response = await serverHttpClient.patch<GlobalConfigRecord<T>>(
      `/admin/global-config/${encodeURIComponent(key)}`,
      { value },
    );
    return response.data;
  },
};
