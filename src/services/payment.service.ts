/**
 * Payment Service
 * Serviço de pagamentos e recargas - comunicação com backend
 */

import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type {
  RechargeRequest,
  RechargeResponse,
  Transaction,
  PaymentStatusResponse,
} from '@/types/payment';

export class PaymentService {
  /**
   * Criar recarga
   */
  static async createRecharge(data: RechargeRequest): Promise<RechargeResponse> {
    const response = await serverHttpClient.post<any>('/payments/recharge', data);
    return {
      ...response.data,
      id: response.data.transactionId,
    };
  }


  /**
   * Buscar extrato de transações
   */
  static async getTransactions(
    page = 1,
    limit = 20
  ): Promise<{ transactions: Transaction[]; total: number; pages: number }> {
    const response = await serverHttpClient.get<any>('/payments', {
      params: { page, limit },
    });
    
    // Map backend response structure to frontend structure if different
    // Backend returns: { data: TransactionItemDto[], total, page, limit }
    // Frontend expects: { transactions: Transaction[], total, pages }
    
    const { data, total } = response.data;
    const pages = Math.ceil(total / limit);

    return {
      transactions: data,
      total,
      pages
    };
  }

  /**
   * Buscar detalhes de uma transação (retorna formato compatível com RechargeResponse)
   */
  static async getTransactionById(id: string): Promise<RechargeResponse> {
    const response = await serverHttpClient.get<any>(`/payments/${id}`);
    const data = response.data;
    return {
      id: data.id,
      amount: data.amount,
      status: data.status,
      billingType: data.billingType,
      invoiceUrl: data.invoiceUrl,
      bankSlipUrl: data.bankSlipUrl,
      pixQrCode: data.pixQrCode,
      pixCopyPaste: data.pixCopyPaste,
      createdAt: data.createdAt,
    };
  }

  /**
   * Verificar status de pagamento
   */
  static async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    const response = await serverHttpClient.get<any>(`/payments/${paymentId}`);
    return {
      id: response.data.id,
      status: response.data.status,
      paidAt: response.data.confirmedAt,
      amount: response.data.amount
    };
  }


  /**
   * Cancelar pagamento pendente
   */
  static async cancelPayment(paymentId: string): Promise<void> {
    await serverHttpClient.post(`/payments/${paymentId}/cancel`);
  }

  /**
   * Buscar saldo do usuário
   */
  static async getBalance(): Promise<{ balance: number }> {
    const response = await serverHttpClient.get<{ balance: number }>('/users/me/balance');
    return response.data;
  }
}
