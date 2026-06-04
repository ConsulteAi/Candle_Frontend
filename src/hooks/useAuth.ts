/**
 * useAuth Hook
 * Hook customizado para autenticação
 */

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { loginAction, registerAction, logoutAction } from '@/actions/auth.actions';
import { extractTenantFromPathname } from '@/lib/auth/routes';
import type { LoginDTO, RegisterDTO } from '@/types';

function sanitizeRedirectPath(redirectTo?: string): string {
  if (!redirectTo || !redirectTo.startsWith('/')) return '/';
  if (redirectTo.startsWith('//')) return '/';
  return redirectTo;
}

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const tenant = extractTenantFromPathname(pathname ?? '');
  const {
    user,
    isAuthenticated,
    login: setAuth,
    logout: clearAuth,
    updateBalance,
  } = useAuthStore();

  /**
   * Login
   */
  const login = useCallback(
    async (credentials: LoginDTO, redirectTo?: string) => {
      try {
        const result = await loginAction(credentials);

        if (result.success && result.data) {
          setAuth(result.data);
          router.push(sanitizeRedirectPath(redirectTo));
          return { success: true };
        }

        if (result.fieldErrors) {
          return { success: false, fieldErrors: result.fieldErrors };
        }

        return { success: false, error: result.error };
      } catch (error) {
        return { success: false, error: 'Erro inesperado' };
      }
    },
    [setAuth, router]
  );

  /**
   * Registro
   */
  const register = useCallback(
    async (userData: RegisterDTO) => {
      try {
        const result = await registerAction(userData);

        if (result.success && result.data) {
          setAuth(result.data);
          router.push(tenant ? `/${tenant}` : '/');
          return { success: true };
        }

        if (result.fieldErrors) {
          return { success: false, fieldErrors: result.fieldErrors };
        }

        return { success: false, error: result.error };
      } catch (error) {
        return { success: false, error: 'Erro inesperado' };
      }
    },
    [setAuth, router]
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    const loginPath = tenant ? `/${tenant}/login` : '/login';
    try {
      await logoutAction();
      clearAuth();
      router.push(loginPath);
    } catch (error) {
      clearAuth();
      router.push(loginPath);
    }
  }, [clearAuth, router, tenant]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateBalance,
  };
}
