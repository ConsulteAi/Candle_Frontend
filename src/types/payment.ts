/**
 * Payment Types
 * Tipos relacionados a pagamentos e transações
 */

export type BillingType = 'PIX' | 'BOLETO' | 'CREDIT_CARD';

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED';

export type TransactionType = 'RECHARGE' | 'QUERY' | 'REFUND';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  billingType?: BillingType;
}


export interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
}

export interface RechargeRequest {
  amount: number;
  billingType: BillingType;
  creditCard?: CreditCard;
  creditCardHolderInfo?: CreditCardHolderInfo;
}

export interface RechargeResponse {
  id: string;
  invoiceUrl?: string;
  invoiceId?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  bankSlipUrl?: string;
  dueDate?: string;
  status: PaymentStatus;
  amount: number;
  billingType?: BillingType;
  createdAt?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: PaymentStatus;
  paidAt?: string;
  amount: number;
}

/**
 * Balance response from GET /balance
 */
export interface BalanceResponse {
  id: string;
  userId: string;
  available: number;
  updatedAt: string;
}

