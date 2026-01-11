/**
 * ConsultaStrategy Interface
 * Defines the contract for all credit consultation strategies
 *
 * SOLID Principles:
 * - Interface Segregation: Single, focused interface
 * - Dependency Inversion: Depend on abstraction, not concrete implementation
 * - Open/Closed: New strategies can be added without modifying existing code
 */

import { TipoDocumento } from "@/lib/consultas";
import { ValidationResult } from "../services/ValidationService";
import {
  AssessmentState,
  PremiumAssessmentState,
} from "@/actions/credit.actions";

/**
 * Base strategy interface for credit consultations
 */
export interface ConsultaStrategy {
  /**
   * Unique identifier (slug) for this consultation type
   */
  readonly slug: string;

  /**
   * Display name for this consultation
   */
  readonly name: string;

  /**
   * Document types supported by this consultation
   * - "cpf": Only CPF
   * - "cnpj": Only CNPJ
   * - "ambos": Both CPF and CNPJ
   */
  readonly documentTypes: TipoDocumento;

  /**
   * FormData field name for the document
   * E.g., "cpf", "document", "cnpj"
   */
  readonly fieldName: string;

  /**
   * Validate document based on consultation rules
   * @param document - Document string to validate
   * @param tipo - Document type (cpf or cnpj)
   * @returns Validation result with error message if invalid
   */
  validate(document: string, tipo: "cpf" | "cnpj"): ValidationResult;

  /**
   * Execute the consultation server action
   * @param formData - Form data containing document and other fields
   * @param prevState - Previous assessment state
   * @returns Promise with new assessment state
   */
  execute(
    formData: FormData,
    prevState: AssessmentState | PremiumAssessmentState
  ): Promise<AssessmentState | PremiumAssessmentState>;

  /**
   * Get description for this consultation type
   * @returns Description string
   */
  getDescription(): string;
}
