/**
 * Auth Schemas (Zod)
 * Validação de formulários de autenticação
 */

import { z } from 'zod';

/**
 * Schema de Login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Schema de Registro
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letras maiúsculas, minúsculas e números'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(15, 'Telefone inválido')
    .regex(/^[0-9\s\-\(\)]+$/, 'Telefone deve conter apenas números'),
  cpf: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val) || /^\d{11}$/.test(val),
      'CPF inválido'
    ),
  cnpj: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(val) || /^\d{14}$/.test(val),
      'CNPJ inválido'
    ),
  terms: z.boolean().refine((val) => val === true, {
    message: 'Você precisa concordar com os termos de uso',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
}).refine((data) => data.cpf || data.cnpj, {
  message: 'Informe CPF ou CNPJ',
  path: ['cpf'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Schema de Alteração de Senha
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter letras maiúsculas, minúsculas e números'
    ),
  confirmNewPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
