import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, AuthResponse } from '@/types';

interface AuthStore {
  // State
  user: User | null;
  balance: number; // Saldo mantido separado do User
  balanceUpdatedAt: number | null; // Timestamp da última atualização do saldo
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  login: (authResponse: AuthResponse) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateBalance: (balance: number) => void;
  resetBalanceUpdatedAt: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      balance: 0,
      balanceUpdatedAt: null,
      isAuthenticated: false,
      isHydrated: false,

      // Login - armazena usuário e estado de autenticação (tokens ficam em cookies)
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
          balanceUpdatedAt: null,
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
        set({ balance, balanceUpdatedAt: Date.now() });
      },

      // Resetar timestamp do saldo (invalidar cache)
      resetBalanceUpdatedAt: () => {
        set({ balanceUpdatedAt: null });
      },

      // Marcar como hidratado após persistência
      setHydrated: () => {
        set({ isHydrated: true });
      },

    }),
    {
      name: 'candle-auth-storage', // nome da chave no localStorage
      storage: createJSONStorage(() => localStorage), // usa localStorage
      partialize: (state) => ({
        // Persiste o necessário para cache de saldo sobreviver a reloads
        user: state.user,
        balance: state.balance,
        balanceUpdatedAt: state.balanceUpdatedAt,
        isAuthenticated: state.isAuthenticated,
        // isHydrated NÃO é persistido — é um estado runtime
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated();
        }
      },
    }
  )
);

// Helper hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useBalance = () => useAuthStore((state) => state.balance);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
