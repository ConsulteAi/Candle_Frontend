'use server';

import { ApiTokensService } from '@/services/api-tokens.service';
import { AuthService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { sanitizeUser } from '@/lib/utils';

export async function getApiTokensAction() {
  try {
    const rawUser = await AuthService.getMe();
    const user = rawUser ? sanitizeUser(rawUser) : null;
    if (!user || user.role !== UserRole.MASTER) {
      return { success: false, data: [] };
    }

    const data = await ApiTokensService.getAll();
    return { success: true, data };
  } catch {
    return { success: false, data: [] };
  }
}
