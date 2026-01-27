/**
 * useAuth Hook
 * Hook customizado para autenticação
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { loginAction, registerAction, logoutAction } from '@/actions/auth.actions';
import type { LoginDTO, RegisterDTO } from '@/types';

export function useAuth() {
  const router = useRouter();
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
    async (credentials: LoginDTO) => {
      try {
        const result = await loginAction(credentials);

        if (result.success && result.data) {
          setAuth(result.data);
          router.push('/');
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
          router.push('/');
          return { success: true };
        }

        if (result.fieldErrors) {
          console.log(result.fieldErrors);
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
    try {
      await logoutAction();
      clearAuth();
      router.push('/login');
    } catch (error) {
      // Mesmo com erro, limpa o estado local
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateBalance,
  };
}
