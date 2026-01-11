/**
 * Credit Service
 * Business logic for credit assessment operations
 * Follows Single Responsibility Principle (SOLID)
 */

import { IHttpClient, httpClient } from "@/lib/api/client";
import { ValidationError } from "@/lib/api/errors";
import {
  CreditReportResponse,
  PremiumCreditReportResponse,
  CorporateCreditReportResponse
} from "@/types/credit";

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
   * Assess premium credit for a CPF or CNPJ
   * @param document - CPF (11 digits) or CNPJ (14 digits) number (can be formatted or not)
   * @returns Promise with premium credit report data (includes CADIN and CCF)
   * @throws ValidationError if document is invalid
   */
  async assessPremium(document: string): Promise<PremiumCreditReportResponse> {
    // Clean document (remove all non-numeric characters)
    const cleanDocument = this.cleanDocument(document);

    // Validate based on length
    if (cleanDocument.length === 11) {
      // CPF validation
      if (!this.isValidCpfFormat(cleanDocument)) {
        throw new ValidationError("CPF inválido. Deve conter 11 dígitos.");
      }
      if (!this.isValidCpf(cleanDocument)) {
        throw new ValidationError("CPF inválido. Verifique os dígitos.");
      }
    } else if (cleanDocument.length === 14) {
      // CNPJ validation
      if (!this.isValidCnpjFormat(cleanDocument)) {
        throw new ValidationError("CNPJ inválido. Deve conter 14 dígitos.");
      }
      if (!this.isValidCnpj(cleanDocument)) {
        throw new ValidationError("CNPJ inválido. Verifique os dígitos.");
      }
    } else {
      throw new ValidationError(
        "Documento inválido. Deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)."
      );
    }

    // Make API request to premium endpoint
    return this.client.get<PremiumCreditReportResponse>(
      `/credit/assess-premium/${cleanDocument}`
    );
  }

  /**
   * Assess corporate credit for a CNPJ
   * @param cnpj - CNPJ number (can be formatted or not)
   * @returns Promise with corporate credit report data (includes CADIN, CCF, and Contumacia)
   * @throws ValidationError if CNPJ is invalid
   */
  async assessCorporate(cnpj: string): Promise<CorporateCreditReportResponse> {
    // Clean document (remove all non-numeric characters)
    const cleanCnpj = this.cleanDocument(cnpj);

    // Validate CNPJ (only accepts 14 digits)
    if (!this.isValidCnpjFormat(cleanCnpj)) {
      throw new ValidationError("CNPJ inválido. Deve conter 14 dígitos.");
    }

    if (!this.isValidCnpj(cleanCnpj)) {
      throw new ValidationError("CNPJ inválido. Verifique os dígitos.");
    }

    // Make API request to corporate endpoint
    return this.client.get<CorporateCreditReportResponse>(
      `/credit/assess-corporate/${cleanCnpj}`
    );
  }

  /**
   * Remove all non-numeric characters from CPF
   */
  private cleanCpf(cpf: string): string {
    return cpf.replace(/\D/g, "");
  }

  /**
   * Remove all non-numeric characters from any document (CPF or CNPJ)
   */
  private cleanDocument(document: string): string {
    return document.replace(/\D/g, "");
  }

  /**
   * Check if CPF has valid format (11 digits)
   */
  private isValidCpfFormat(cpf: string): boolean {
    return /^\d{11}$/.test(cpf);
  }

  /**
   * Check if CNPJ has valid format (14 digits)
   */
  private isValidCnpjFormat(cnpj: string): boolean {
    return /^\d{14}$/.test(cnpj);
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

  /**
   * Validate CNPJ using check digits algorithm
   * Based on official CNPJ validation rules
   */
  private isValidCnpj(cnpj: string): boolean {
    // Check if all digits are the same (invalid CNPJs like 11.111.111/1111-11)
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    // Validate first check digit
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(cnpj.charAt(12))) {
      return false;
    }

    // Validate second check digit
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (checkDigit !== parseInt(cnpj.charAt(13))) {
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
