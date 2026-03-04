'use server';

/**
 * Query Server Actions
 * Actions para consultas de crédito que rodam no servidor
 */

import { QueryService } from '@/services/query.service';
import { useAuthStore } from '@/store/authStore';
import type {
  CreateQueryRequest,
  CreateQueryResponse,
  QueryHistoryEntry,
} from '@/types/credit';

// Estado de retorno genérico
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Action para executar consulta de CPF (Standard)
 */
export async function assessCreditCpfAction(
  cpf: string
): Promise<ActionState<CreateQueryResponse>> {
  try {
    const result = await QueryService.assessCreditCpf(cpf);

    // Atualizar saldo no store
    if (result.newBalance !== undefined) {
      useAuthStore.getState().updateBalance(result.newBalance);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    // Saldo insuficiente
    if (error.response?.status === 402) {
      return {
        success: false,
        error: 'Saldo insuficiente. Recarregue sua carteira para continuar.',
      };
    }

    // Erros de validação
    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao realizar consulta. Tente novamente.',
    };
  }
}

/**
 * Action para executar consulta Premium
 */
export async function assessPremiumAction(
  document: string
): Promise<ActionState<CreateQueryResponse>> {
  try {
    const result = await QueryService.assessPremium(document);

    // Atualizar saldo no store
    if (result.newBalance !== undefined) {
      useAuthStore.getState().updateBalance(result.newBalance);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {

    if (error.response?.status === 402) {
      return {
        success: false,
        error: 'Saldo insuficiente. Recarregue sua carteira para continuar.',
      };
    }

    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao realizar consulta. Tente novamente.',
    };
  }
}

/**
 * Action para executar consulta Corporate
 */
export async function assessCorporateAction(
  cnpj: string
): Promise<ActionState<CreateQueryResponse>> {
  try {
    const result = await QueryService.assessCorporate(cnpj);

    // Atualizar saldo no store
    if (result.newBalance !== undefined) {
      useAuthStore.getState().updateBalance(result.newBalance);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {

    if (error.response?.status === 402) {
      return {
        success: false,
        error: 'Saldo insuficiente. Recarregue sua carteira para continuar.',
      };
    }

    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao realizar consulta. Tente novamente.',
    };
  }
}

/**
 * Action genérica para criar consulta
 */
export async function createQueryAction(
  data: CreateQueryRequest
): Promise<ActionState<CreateQueryResponse>> {
  try {
    const result = await QueryService.createQuery(data);

    // Atualizar saldo no store
    if (result.newBalance !== undefined) {
      useAuthStore.getState().updateBalance(result.newBalance);
    }

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {

    if (error.response?.status === 402) {
      return {
        success: false,
        error: 'Saldo insuficiente. Recarregue sua carteira para continuar.',
      };
    }

    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao realizar consulta. Tente novamente.',
    };
  }
}

/**
 * Action para buscar histórico de consultas
 */
export async function getQueryHistoryAction(
  page = 1,
  limit = 20
): Promise<ActionState<{ queries: QueryHistoryEntry[]; total: number; pages: number }>> {
  try {
    const data = await QueryService.getQueryHistory(page, limit);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro ao buscar histórico de consultas',
    };
  }
}

/**
 * Action para buscar consulta por ID
 */
export async function getQueryByIdAction(
  id: string
): Promise<ActionState<QueryHistoryEntry>> {
  try {
    const data = await QueryService.getQueryById(id);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro ao buscar consulta',
    };
  }
}

/**
 * Action para buscar consulta por protocolo
 */
export async function getQueryByProtocolAction(
  protocol: string
): Promise<ActionState<QueryHistoryEntry>> {
  try {
    const data = await QueryService.getQueryByProtocol(protocol);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Erro ao buscar consulta',
    };
  }
}
