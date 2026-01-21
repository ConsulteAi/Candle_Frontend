/**
 * Query System Types
 * Tipos para o sistema de consultas dinâmicas baseado em QueryTypes
 */

/**
 * Categorias de consulta disponíveis no sistema
 */
export enum QueryCategory {
  PERSON = 'PERSON',
  COMPANY = 'COMPANY',
  VEHICLE = 'VEHICLE',
  PHONE = 'PHONE',
  ADDRESS = 'ADDRESS',
  CREDIT = 'CREDIT',
  OTHER = 'OTHER',
}

/**
 * Query Type - Tipo de consulta configurado no backend
 */
export interface QueryType {
  id: string;
  code: string; // ex: "CPF_BASICO", "CNPJ_COMPLETO"
  name: string; // ex: "Consulta CPF Básica"
  description: string | null;
  category: QueryCategory[]; // Array de categorias
  price: number; // Preço normal
  cachedPrice: number; // Preço quando vem do cache
  cacheTtlMinutes: number;
  isActive: boolean;
  providerId: string;
  providerEndpoint: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request para executar uma consulta
 */
export interface ExecuteQueryRequest {
  queryTypeCode: string; // Código do tipo de consulta
  input: string; // Dados de entrada (CPF, CNPJ, placa, etc)
}

/**
 * Response da execução de consulta
 */
export interface ExecuteQueryResponse {
  queryId: string; // ID da consulta salva no banco
  result: any; // Resultado do provider (JSON genérico)
  cached: boolean; // Se veio do cache
  price: number; // Preço cobrado
}

/**
 * Query History Entry - Registro de consulta no histórico
 */
export interface QueryHistoryEntry {
  id: string;
  userId: string;
  queryTypeId: string;
  input: string; // Dado consultado
  status: 'SUCCESS' | 'FAILED';
  price: number;
  isCached: boolean;
  result: any | null; // Resultado armazenado (se SUCCESS)
  errorMessage: string | null; // Mensagem de erro (se FAILED)
  createdAt: string;
  updatedAt: string;
  queryType: {
    code: string;
    name: string;
    category: QueryCategory[];
    description: string | null;
  };
}

/**
 * Response paginado do histórico
 */
export interface QueryHistoryResponse {
  data: QueryHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Configuração de categoria para exibição
 */
export interface CategoryConfig {
  category: QueryCategory;
  slug: string;
  name: string;
  description: string;
  icon: string; // Nome do ícone Lucide
  enabled: boolean; // Se está disponível para uso
  color: string; // Cor do tema (ex: "blue", "green")
}
