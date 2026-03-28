'use server';

import { ApiTokensService } from '@/services/api-tokens.service';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';

export async function getApiTokensAction() {
  try {
    const user = await AuthService.getMe();
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, data: [] };
    }

    const data = await ApiTokensService.getAll();
    return { success: true, data };
  } catch {
    return { success: false, data: [] };
  }
}
