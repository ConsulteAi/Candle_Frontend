import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type { ApiToken } from '@/types/admin';

export const ApiTokensService = {
  getAll: async (): Promise<ApiToken[]> => {
    const response = await serverHttpClient.get<ApiToken[]>('/api-tokens');
    return response.data;
  },
};
