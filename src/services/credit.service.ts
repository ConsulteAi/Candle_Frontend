/**
 * Credit Service
 * Business logic for credit assessment operations
 * Follows Single Responsibility Principle (SOLID)
 */

import { IHttpClient, httpClient } from "@/lib/api/client";
import { ValidationError } from "@/lib/api/errors";
import { CreditReportResponse } from "@/types/credit";

/**
 * Credit Service Class
 * Handles all credit-related business logic
 */
export class CreditService {
  constructor(private client: IHttpClient) {}

  /**
   * Assess credit for a CPF
   * @param cpf - CPF number (can be formatted or not)
   * @returns Promise with credit report data
   * @throws ValidationError if CPF is invalid
   */
  async assessCpf(cpf: string): Promise<CreditReportResponse> {
    // Clean and validate CPF
    const cleanCpf = this.cleanCpf(cpf);

    if (!this.isValidCpfFormat(cleanCpf)) {
      throw new ValidationError("CPF inválido. Deve conter 11 dígitos.");
    }

    if (!this.isValidCpf(cleanCpf)) {
      throw new ValidationError("CPF inválido. Verifique os dígitos.");
    }

    // Make API request
    return this.client.get<CreditReportResponse>(
      `/credit/assess-cpf/${cleanCpf}`
    );
  }

  /**
   * Remove all non-numeric characters from CPF
   */
  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  /**
   * Check if CPF has valid format (11 digits)
   */
  private isValidCpfFormat(cpf: string): boolean {
    return /^\d{11}$/.test(cpf);
  }

  /**
   * Validate CPF using check digits algorithm
   * Based on official CPF validation rules
   */
  private isValidCpf(cpf: string): boolean {
    // Check if all digits are the same (invalid CPFs like 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(9))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cpf.charAt(10))) {
      return false;
    }

    return true;
  }
}

/**
 * Singleton instance of Credit Service
 * Uses the default HTTP client
 */
export const creditService = new CreditService(httpClient);

/**
 * Factory function to create Credit Service with custom client
 * Useful for testing with mock client
 */
export function createCreditService(client: IHttpClient): CreditService {
  return new CreditService(client);
}
