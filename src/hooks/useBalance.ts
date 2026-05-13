"use client";

/**
 * useBalance Hook
 * Hook para gerenciar e buscar saldo do usuário
 */

import { useCallback, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getBalanceAction } from "@/actions/balance.actions";

export function useBalance() {
  const balance = useAuthStore((state) => state.balance);
  const updateBalance = useAuthStore((state) => state.updateBalance);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const logout = useAuthStore((state) => state.logout);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  /**
   * Buscar saldo do usuário no backend
   */
  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setIsBalanceReady(false);
      return;
    }

    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setIsBalanceLoading(true);
    setBalanceError(null);

    try {
      const result = await getBalanceAction();
      if (result.success && result.data) {
        updateBalance(result.data.available);
      } else if (result.error) {
        setBalanceError(result.error);
      } else if (result.statusCode === 401) {
        logout();
      }
    } catch (error: any) {
      setBalanceError("Erro ao buscar saldo");
      if (
        error?.response?.status === 401 ||
        error?.status === 401 ||
        error?.message?.includes("401")
      ) {
        logout();
      }
    } finally {
      inFlightRef.current = false;
      setIsBalanceLoading(false);
      setIsBalanceReady(true);
    }
  }, [isAuthenticated, updateBalance, logout]);

  /**
   * Formatar saldo para exibição
   */
  const formattedBalance = balance.toFixed(2).replace(".", ",");

  return {
    balance,
    formattedBalance,
    fetchBalance,
    updateBalance,
    isBalanceLoading,
    isBalanceReady,
    balanceError,
  };
}
