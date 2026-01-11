/**
 * ValidationService
 * Single Responsibility: Document validation only
 * Stateless utility class for validating CPF and CNPJ
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationService {
  /**
   * Remove all non-numeric characters from document
   */
  static cleanDocument(document: string): string {
    return document.replace(/\D/g, "");
  }

  /**
   * Determine document type based on length
   */
  static getDocumentType(document: string): "cpf" | "cnpj" | "invalid" {
    const cleaned = this.cleanDocument(document);
    if (cleaned.length === 11) return "cpf";
    if (cleaned.length === 14) return "cnpj";
    return "invalid";
  }

  /**
   * Validate CPF using check digits algorithm
   */
  static validateCPF(cpf: string): boolean {
    const cleaned = this.cleanDocument(cpf);

    // Check format (11 digits)
    if (!/^\d{11}$/.test(cleaned)) {
      return false;
    }

    // Check if all digits are the same (invalid CPFs like 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cleaned.charAt(9))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cleaned.charAt(10))) {
      return false;
    }

    return true;
  }

  /**
   * Validate CNPJ using check digits algorithm
   */
  static validateCNPJ(cnpj: string): boolean {
    const cleaned = this.cleanDocument(cnpj);

    // Check format (14 digits)
    if (!/^\d{14}$/.test(cleaned)) {
      return false;
    }

    // Check if all digits are the same (invalid CNPJs like 11.111.111/1111-11)
    if (/^(\d)\1{13}$/.test(cleaned)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(cleaned.charAt(12))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleaned.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(cleaned.charAt(13))) {
      return false;
    }

    return true;
  }

  /**
   * Validate document based on type
   */
  static validateDocument(
    document: string,
    tipo: "cpf" | "cnpj"
  ): ValidationResult {
    if (!document || document.trim() === "") {
      return {
        isValid: false,
        error: `${tipo.toUpperCase()} é obrigatório`,
      };
    }

    const isValid =
      tipo === "cpf" ? this.validateCPF(document) : this.validateCNPJ(document);

    if (!isValid) {
      return {
        isValid: false,
        error: `${tipo.toUpperCase()} inválido. Verifique os dígitos.`,
      };
    }

    return { isValid: true };
  }
}
