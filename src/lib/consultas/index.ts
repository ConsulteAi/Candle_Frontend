/**
 * Consultas Module - Main Index
 * Centralized exports for all consultation-related functionality
 *
 * This module provides a clean API for working with credit consultations
 * following SOLID principles and design patterns.
 */

// Re-export types and data from the original consultas.ts file
export type { TipoDocumento, Consulta, CategoriaConsulta } from "../consultas";
export {
  consultasCredito,
  categoriasConsultas,
  getConsultaBySlug,
  getCategoria,
} from "../consultas";

// Export services
export { ValidationService } from "./services";
export type { ValidationResult } from "./services";

// Export strategies
export type { ConsultaStrategy } from "./strategies";
export { CpfCreditStrategy, PremiumCreditStrategy } from "./strategies";

// Export factories
export { ConsultaStrategyFactory } from "./factories";
