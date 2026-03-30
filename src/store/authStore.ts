/**
 * Auth Store (Zustand)
 * Gerenciamento de estado de autenticação
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';

interface AuthStore {
  // State
  user: User | null;
  balance: number; // Saldo mantido separado do User
  isAuthenticated: boolean;

  // Actions
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      balance: 0,
      isAuthenticated: false,

      // Login - salva usuário e tokens
      login: (authResponse: AuthResponse) => {
        set({
          user: authResponse.user || null,
          isAuthenticated: true,
        });
      },

      // Logout - limpa tudo
      logout: () => {
        set({
          user: null,
          balance: 0,
          isAuthenticated: false,
        });
      },

      // Atualizar dados do usuário
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Atualizar saldo (usado após consultas e recargas)
      updateBalance: (balance: number) => {
        set({ balance });
      },

    }),
    {
      name: 'candle-auth-storage', // nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // usa localStorage
      partialize: (state) => ({
        // Só persiste o necessário
        user: state.user,
        balance: state.balance,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useBalance = () => useAuthStore((state) => state.balance);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
