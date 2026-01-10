/**
 * Credit Assessment Hook
 * Custom React hook for managing credit assessment state
 * Separates data fetching logic from UI components
 */

"use client";

import { useState, useCallback } from "react";
import { creditService } from "@/services/credit.service";
import { CreditReportResponse } from "@/types/credit";
import { getErrorMessage } from "@/lib/api/errors";

interface UseCreditAssessmentState {
  data: CreditReportResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseCreditAssessmentReturn extends UseCreditAssessmentState {
  assessCpf: (cpf: string) => Promise<CreditReportResponse>;
  reset: () => void;
}

/**
 * Hook to manage credit assessment operations
 *
 * @example
 * ```tsx
 * const { data, loading, error, assessCpf, reset } = useCreditAssessment();
 *
 * const handleSubmit = async (cpf: string) => {
 *   try {
 *     const report = await assessCpf(cpf);
 *     // Handle success (e.g., navigate to results page)
 *   } catch (err) {
 *     // Error is already in state, just handle UI
 *   }
 * };
 * ```
 */
export function useCreditAssessment(): UseCreditAssessmentReturn {
  const [state, setState] = useState<UseCreditAssessmentState>({
    data: null,
    loading: false,
    error: null,
  });

  /**
   * Assess CPF credit
   * Sets loading state, handles errors, and updates data
   */
  const assessCpf = useCallback(async (cpf: string): Promise<CreditReportResponse> => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await creditService.assessCpf(cpf);

      setState({
        data: result,
        loading: false,
        error: null,
      });

      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      // Re-throw so caller can handle it if needed
      throw err;
    }
  }, []);

  /**
   * Reset state to initial values
   * Useful for clearing form after submission or navigation
   */
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    assessCpf,
    reset,
  };
}
