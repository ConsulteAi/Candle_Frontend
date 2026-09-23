/**
 * Manual CPF User Schema (Zod)
 * Validação do formulário de liberação manual de cadastro CPF no backoffice
 */

import { z } from 'zod';

export const manualCpfUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 11;
    }, 'CPF deve ter exatamente 11 dígitos. Se você digitou um CNPJ (14 dígitos), use o cadastro público.'),
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 11;
    }, 'Telefone inválido'),
});

export type ManualCpfUserFormData = z.infer<typeof manualCpfUserSchema>;
