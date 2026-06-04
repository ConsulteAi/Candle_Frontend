"use client";

/**
 * useBalance Hook
 * Hook para gerenciar e buscar saldo do usuário com stale-while-revalidate
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { getBalanceAction } from "@/actions/balance.actions";

/** Tempo de vida do cache do saldo: 5 minutos */
const BALANCE_TTL_MS = 5 * 60 * 1000;

export function useBalance() {
  const balance = useAuthStore((state) => state.balance);
  const balanceUpdatedAt = useAuthStore((state) => state.balanceUpdatedAt);
  const updateBalance = useAuthStore((state) => state.updateBalance);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isBalanceReady, setIsBalanceReady] = useState(false);
  const [isRevalidatingBalance, setIsRevalidatingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  /**
   * Verifica se o saldo em cache está fresco (dentro do TTL)
   */
  const isBalanceFresh = isHydrated
    && isAuthenticated
    && balanceUpdatedAt !== null
    && Date.now() - balanceUpdatedAt < BALANCE_TTL_MS;

  /**
   * Se o cache está fresco, marcar como pronto imediatamente
   */
  useEffect(() => {
    if (isBalanceFresh && !isBalanceReady) {
      setIsBalanceReady(true);
    }
  }, [isBalanceFresh, isBalanceReady]);

  /**
   * Buscar saldo do usuário no backend
   * @param silent - Se true, não seta isBalanceLoading (revalidação silenciosa)
   */
  const fetchBalance = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    // Aguarda hidratação do Zustand para evitar flash de não autenticado
    if (!isHydrated) {
      return;
    }

    // Usuário não autenticado: estado final conhecido
    if (!isAuthenticated) {
      setIsBalanceReady(true);
      setBalanceError(null);
      return;
    }

    if (inFlightRef.current) return;

    inFlightRef.current = true;
    if (!silent) {
      setIsBalanceLoading(true);
    } else {
      setIsRevalidatingBalance(true);
    }
    setBalanceError(null);

    try {
      const result = await getBalanceAction();
      if (result.success && result.data) {
        updateBalance(result.data.available);
      } else if (result.statusCode === 401) {
        // Clear local auth state so AuthGuard re-validates; avoid revoking the
        // DB session here — a concurrent RSC refresh may have already healed it.
        useAuthStore.getState().logout();
        setBalanceError("Sessão expirada. Faça login novamente.");
      } else if (result.error) {
        setBalanceError(result.error);
      }
    } catch (error: any) {
      const isUnauthorized =
        error?.response?.status === 401 ||
        error?.status === 401 ||
        error?.message?.includes("401");

      if (isUnauthorized) {
        useAuthStore.getState().logout();
        setBalanceError("Sessão expirada. Faça login novamente.");
      } else {
        setBalanceError("Erro ao buscar saldo");
      }
    } finally {
      inFlightRef.current = false;
      if (!silent) {
        setIsBalanceLoading(false);
      } else {
        setIsRevalidatingBalance(false);
      }
      setIsBalanceReady(true);
    }
  }, [isHydrated, isAuthenticated, updateBalance]);

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
    isRevalidatingBalance,
    isBalanceFresh,
    isAuthenticated,
    isHydrated,
    balanceError,
  };
}
