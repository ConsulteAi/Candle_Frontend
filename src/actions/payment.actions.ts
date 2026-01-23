'use server';

/**
 * Payment Server Actions
 * Actions para pagamentos e recargas que rodam no servidor
 */

import { PaymentService } from '@/services/payment.service';
import type {
  RechargeRequest,
  RechargeResponse,
  Transaction,
  PaymentStatusResponse,
} from '@/types/payment';


// Estado de retorno genérico
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Action para criar recarga
 */
export async function createRechargeAction(
  data: RechargeRequest
): Promise<ActionState<RechargeResponse>> {
  try {
    const recharge = await PaymentService.createRecharge(data);
    return {
      success: true,
      data: recharge,
    };
  } catch (error: any) {
    console.error('Create recharge error:', error);

    // Erros de validação do backend
    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao criar recarga. Tente novamente.',
    };
  }
}

/**
 * Action para buscar transações
 */
export async function getTransactionsAction(
  page = 1,
  limit = 20
): Promise<
  ActionState<{ transactions: Transaction[]; total: number; pages: number }>
> {
  try {
    const data = await PaymentService.getTransactions(page, limit);
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return {
      success: false,
      error: 'Erro ao buscar transações',
    };
  }
}

/**
 * Action para verificar status de pagamento
 */
export async function checkPaymentStatusAction(
  paymentId: string
): Promise<ActionState<PaymentStatusResponse>> {
  try {
    const status = await PaymentService.checkPaymentStatus(paymentId);

    // Se o pagamento foi confirmado, o cliente deve atualizar o saldo localmente
    // via refreshBalance()
    // if (status.status === 'CONFIRMED' || status.status === 'RECEIVED') {
    //   const balanceData = await PaymentService.getBalance();
    //   // useAuthStore not available on server
    // }

    return {
      success: true,
      data: status,
    };
  } catch (error: any) {
    console.error('Check payment status error:', error);
    return {
      success: false,
      error: 'Erro ao verificar status do pagamento',
    };
  }
}

/**
 * Action para cancelar pagamento
 */
export async function cancelPaymentAction(
  paymentId: string
): Promise<ActionState<void>> {
  try {
    await PaymentService.cancelPayment(paymentId);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Cancel payment error:', error);
    return {
      success: false,
      error: 'Erro ao cancelar pagamento',
    };
  }
}

/**
 * Action para buscar saldo atualizado
 */
export async function refreshBalanceAction(): Promise<ActionState<number>> {
  try {
    const data = await PaymentService.getBalance();

    // Retornamos o dado para o cliente atualizar o store
    // useAuthStore.getState().updateBalance(data.balance);

    return {
      success: true,
      data: data.balance,
    };
  } catch (error: any) {
    console.error('Refresh balance error:', error);
    return {
      success: false,
      error: 'Erro ao atualizar saldo',
    };
  }
}

/**
 * Action para buscar detalhes de uma transação específica
 */
export async function getTransactionByIdAction(
  transactionId: string
): Promise<ActionState<RechargeResponse>> {
  try {
    const transaction = await PaymentService.getTransactionById(transactionId);
    return {
      success: true,
      data: transaction,
    };
  } catch (error: any) {
    console.error('Get transaction error:', error);
    return {
      success: false,
      error: 'Transação não encontrada',
    };
  }
}

/**
 * Action para buscar pagamento pendente (PIX ou Boleto)
 * Retorna a transação pendente mais recente, se houver
 */
export async function getPendingPaymentAction(): Promise<ActionState<RechargeResponse | null>> {
  try {
    // Busca últimas transações
    const result = await PaymentService.getTransactions(1, 10);
    
    // Filtra por PENDING e PIX/BOLETO
    const pendingTx = result.transactions.find(
      (tx) => tx.status === 'PENDING' && (tx.billingType === 'PIX' || tx.billingType === 'BOLETO')
    );

    if (!pendingTx) {
      return { success: true, data: null };
    }

    // Busca detalhes completos da transação pendente
    const fullDetails = await PaymentService.getTransactionById(pendingTx.id);
    
    // Verifica novamente se o status é PENDING (para garantir que não mudou entre as chamadas)
    if (fullDetails.status !== 'PENDING') {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: fullDetails,
    };
  } catch (error: any) {
    console.error('Get pending payment error:', error);
    return {
      success: false,
      error: 'Erro ao buscar pagamentos pendentes',
    };
  }
}
