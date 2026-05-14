'use server';

import { ApiTokensService } from '@/services/api-tokens.service';
import { getCurrentUser } from '@/lib/auth';
import { UserRole } from '@/types/auth';

export async function getApiTokensAction() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, data: [] };
    }

    const data = await ApiTokensService.getAll();
    return { success: true, data };
  } catch {
    return { success: false, data: [] };
  }
}
