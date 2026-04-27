'use server';

import axios from 'axios';
import { QueryExecutionService } from '@/services/query-execution.service';
import { useAuthStore } from '@/store/authStore';
import type {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  QueryHistoryResponse,
  QueryHistoryEntry,
  QueryByIdResponse,
} from '@/types/query';

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function executeQueryAction(
  request: ExecuteQueryRequest
): Promise<ActionState<ExecuteQueryResponse>> {
  try {
    const response = await QueryExecutionService.executeQuery(request);

    // Atualizar saldo no store (foi debitado)
    // O backend não retorna novo saldo, então precisamos buscar
    const { refreshBalanceAction } = await import('@/actions/payment.actions');
    await refreshBalanceAction();

    return { success: true, data: response };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 402) {
      return { success: false, error: 'Saldo insuficiente. Recarregue sua carteira.' };
    }

    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      return {
        success: false,
        error:
          'TIMEOUT: a consulta demorou mais do que o esperado. Verifique o histórico antes de tentar novamente, pois ela pode ter sido concluída.',
      };
    }

    return {
      success: false,
      error:
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Erro ao executar consulta'
          : 'Erro ao executar consulta',
    };
  }
}

export async function getQueryHistoryAction(
  page = 1,
  limit = 20
): Promise<ActionState<QueryHistoryResponse>> {
  try {
    const data = await QueryExecutionService.getQueryHistory(page, limit);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'Erro ao buscar histórico' };
  }
}

export async function getQueryByIdAction(
  id: string
): Promise<ActionState<QueryByIdResponse>> {
  try {
    const data = await QueryExecutionService.getQueryById(id);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: 'Erro ao buscar consulta' };
  }
}
