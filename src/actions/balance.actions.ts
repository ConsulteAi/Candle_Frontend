'use server';

/**
 * Balance Server Actions
 * Actions para consulta de saldo
 */

import { BalanceService } from '@/services/balance.service';
import type { BalanceResponse } from '@/types';

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Action para buscar saldo do usuário
 */
export async function getBalanceAction(): Promise<ActionState<BalanceResponse> & { statusCode?: number }> {
  try {
    const data = await BalanceService.getBalance();
    return { success: true, data };
  } catch (error: any) {
    console.error('Get balance error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar saldo',
      statusCode: error.response?.status || 500
    };
  }
}
