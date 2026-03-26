'use server';

import { ApiTokensService } from '@/services/api-tokens.service';

export async function getApiTokensAction() {
  try {
    const data = await ApiTokensService.getAll();
    return { success: true, data };
  } catch {
    return { success: false, data: [] };
  }
}
