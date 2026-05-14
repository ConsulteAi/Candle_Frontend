import { AuthService } from '@/services/auth.service';
import { sanitizeUser } from './utils';
import type { User } from '@/types';

/**
 * Server-side cache for AuthService.getMe()
 * Prevents rate limiting (429) by caching the user for a short TTL
 * across multiple server requests.
 */

interface CacheEntry {
  user: User | null;
  timestamp: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds
const serverCache = new Map<string, CacheEntry>();

function getCacheKey(): string {
  // In dev, we can't reliably access cookies here synchronously
  // So we use a simple time-based cache that serves all requests
  // In production with a real cache (Redis), you'd key by session/token
  return 'current-user';
}

export async function getCurrentUser(): Promise<User | null> {
  const key = getCacheKey();
  const now = Date.now();
  const cached = serverCache.get(key);

  // Return cached value if still valid
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[getCurrentUser] cache HIT');
    }
    return cached.user;
  }

  // Fetch from backend
  if (process.env.NODE_ENV !== 'production') {
    console.log('[getCurrentUser] cache MISS, calling backend...');
  }

  try {
    const rawUser = await AuthService.getMe();
    const user = rawUser ? sanitizeUser(rawUser) : null;

    // Store in cache
    serverCache.set(key, { user, timestamp: now });
    return user;
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[getCurrentUser] failed:', error?.response?.status, error?.message);
    }

    // If we have a stale cached value, return it as fallback
    // This prevents lockout during temporary backend issues
    if (cached) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[getCurrentUser] returning stale cache as fallback');
      }
      return cached.user;
    }

    return null;
  }
}

/**
 * Invalidate the cache (useful after login/logout/role changes)
 */
export function invalidateCurrentUserCache(): void {
  serverCache.delete('current-user');
}
