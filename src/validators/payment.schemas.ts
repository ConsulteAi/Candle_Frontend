/**
 * Payment Schemas (Zod)
 * Validação de formulários de pagamento e recarga
 */

import { z } from 'zod';

/**
 * Schema de Recarga
 */
export const rechargeSchema = z.object({
  amount: z
    .number()
    .min(50, 'Valor mínimo de recarga é R$ 50,00')
    .max(10000, 'Valor máximo de recarga é R$ 10.000,00'),
  billingType: z.enum(['PIX', 'BOLETO', 'CREDIT_CARD'], {
    errorMap: () => ({ message: 'Método de pagamento inválido' }),
  }),
});

export type RechargeFormData = z.infer<typeof rechargeSchema>;

/**
 * Schema de Pagamento com Cartão de Crédito
 */
export const creditCardSchema = z.object({
  holderName: z
    .string()
    .min(3, 'Nome do titular deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  number: z
    .string()
    .regex(/^\d{16}$/, 'Número do cartão inválido (16 dígitos)'),
  expiryMonth: z
    .string()
    .regex(/^(0[1-9]|1[0-2])$/, 'Mês de validade inválido (01-12)'),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, 'Ano de validade inválido (YYYY)')
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      return parseInt(year) >= currentYear;
    }, 'Cartão expirado'),
  ccv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV inválido (3 ou 4 dígitos)'),
});

export type CreditCardFormData = z.infer<typeof creditCardSchema>;

/**
 * Schema completo de recarga com cartão
 */
export const rechargeWithCardSchema = z.object({
  amount: z
    .number()
    .min(50, 'Valor mínimo de recarga é R$ 50,00')
    .max(10000, 'Valor máximo de recarga é R$ 10.000,00'),
  billingType: z.literal('CREDIT_CARD'),
  creditCard: creditCardSchema,
  creditCardHolderInfo: z.object({
    name: z.string().min(3, 'Nome completo é obrigatório'),
    email: z.string().email('Email inválido'),
    cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
    postalCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
    addressNumber: z.string().min(1, 'Número do endereço obrigatório'),
    phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  }),
});

export type RechargeWithCardFormData = z.infer<typeof rechargeWithCardSchema>;
