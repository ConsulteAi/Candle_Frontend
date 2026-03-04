'use client';

import { useState } from 'react';
import {
  executeQueryAction,
  getQueryHistoryAction,
  getQueryByIdAction,
} from '@/actions/query-execution.actions';
import type {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  QueryHistoryResponse,
  QueryHistoryEntry,
} from '@/types/query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

export function useQueryExecution() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateBalance = useAuthStore((state) => state.updateBalance);

  const executeQuery = async (
    queryTypeCode: string,
    input: string
  ): Promise<ExecuteQueryResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const request: ExecuteQueryRequest = {
        queryTypeCode,
        input,
      };

      const result = await executeQueryAction(request);

      if (!result.success || !result.data) {
        const errorMsg = result.error || 'Erro ao executar consulta';
        setError(errorMsg);
        return null;
      }

      return result.data;
    } catch (error) {
      const errorMsg = 'Erro inesperado ao executar consulta. Tente novamente.';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistory = async (
    page = 1,
    limit = 20
  ): Promise<QueryHistoryResponse | null> => {
    setIsLoading(true);
    try {
      const result = await getQueryHistoryAction(page, limit);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao buscar histórico');
        return null;
      }

      return result.data;
    } catch (error) {
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getById = async (id: string): Promise<QueryHistoryEntry | null> => {
    setIsLoading(true);
    try {
      const result = await getQueryByIdAction(id);

      if (!result.success || !result.data) {
        toast.error(result.error || 'Erro ao buscar consulta');
        return null;
      }

      // Transform QueryByIdResponse to QueryHistoryEntry
      const { query, result: queryResult } = result.data;
      const historyEntry: QueryHistoryEntry = {
        id: query.id,
        userId: '',
        queryTypeId: '',
        input: query.input,
        status: query.status,
        price: query.price,
        isCached: false,
        result: queryResult,
        errorMessage: null,
        createdAt: query.createdAt,
        updatedAt: query.completedAt,
        queryType: {
          code: query.queryType.code,
          name: query.queryType.name,
          category: query.queryType.category,
          description: null,
        },
      };

      return historyEntry;
    } catch (error) {
      toast.error('Erro ao buscar consulta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeQuery,
    getHistory,
    getById,
    isLoading,
    error,
  };
}
