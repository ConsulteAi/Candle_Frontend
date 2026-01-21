/**
 * Balance Service
 * Serviço para consulta de saldo do usuário
 */

import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type { BalanceResponse } from '@/types';

export class BalanceService {
  /**
   * Buscar saldo atual
   * Executado no server side via Server Action
   */
  static async getBalance(): Promise<BalanceResponse> {
    const response = await serverHttpClient.get<BalanceResponse>('/balance');
    return response.data;
  }
}
