import { cache } from 'react';
import { AuthService } from '@/services/auth.service';
import { sanitizeUser } from './utils';
import type { User } from '@/types';

const getCurrentUserCached = cache(async (): Promise<User | null> => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[getCurrentUser] calling backend...');
  }

  try {
    const rawUser = await AuthService.getMe();
    return rawUser ? sanitizeUser(rawUser) : null;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[getCurrentUser] failed:', error?.response?.status, error?.message);
    }
    return null;
  }
});

export async function getCurrentUser(): Promise<User | null> {
  return getCurrentUserCached();
}

/**
 * Mantido por compatibilidade com chamadas existentes após login/logout.
 */
export function invalidateCurrentUserCache(): void {
  // No-op: current user is now always resolved from the real session.
}
