/**
 * Domain Types for Credit Assessment
 * Based on API specification from frontend_guide.md
 */

/**
 * Credit Status Enumeration
 * - RESTRICTED: Has debts or protests
 * - CLEAR: No debts or protests found
 */
export type CreditStatus = "RESTRICTED" | "CLEAR";

/**
 * Personal Information from Credit Report
 */
export interface PersonInfo {
  name: string;
  document: string; // CPF
  birthDate: string;
  revenueStatus: string; // e.g., 'REGULAR'
  motherName: string;
  gender: string;
  email: string;
  mainEconomicActivity: string;
}

/**
 * Financial Summary Totals
 */
export interface FinancialSummary {
  totalDebts: number;
  totalProtests: number;
  totalQueries: number;
  totalCadin?: number;
  totalCcf?: number;
}

/**
 * Financial Debt Entry
 */
export interface Debt {
  value: string;
  contract: string;
  origin: string; // Creditor
  date: string; // Due date
}

/**
 * Notary Protest Entry
 */
export interface Protest {
  value: string;
  notary: string; // Cartório - City
  date: string;
}

/**
 * Credit Query Entry (Who checked this CPF)
 */
export interface Query {
  date: string;
  entity: string;
}

/**
 * Complete Credit Report Response
 * Main interface returned by the assess-cpf endpoint
 */
export interface CreditReportResponse {
  /** Unique protocol ID for this query */
  protocol: string;

  /** Computed Credit Status */
  status: CreditStatus;

  /** Personal Information */
  person: PersonInfo;

  /** Financial Summary */
  financialSummary: FinancialSummary;

  /** List of Financial Debts */
  debts: Debt[];

  /** List of Notary Protests */
  protests: Protest[];

  /** History of Queries (Who checked this CPF) */
  queries: Query[];
}

/**
 * CADIN Entry (Federal Debt Registry)
 */
export interface CadinEntry {
  /** Entity Name or Description */
  literal: string;
  /** Debt Value */
  value: string;
  /** Registration Date */
  date: string;
}

/**
 * CCF Entry (Bad Checks - Cheques sem Fundo)
 */
export interface CcfEntry {
  /** Number of bad checks */
  quantity: number;
  /** Origin: 'BACEN' or 'VAREJO' */
  origin: string;
  /** Date of last occurrence (or empty string) */
  date: string;
}

/**
 * Premium Credit Report Response
 * Extends standard response with CADIN and CCF data
 * Returned by the assess-premium endpoint
 */
export interface PremiumCreditReportResponse extends CreditReportResponse {
  /**
   * CADIN: Federal Debt Registry
   * Will be empty array [] if no records found
   */
  cadin: CadinEntry[];

  /**
   * CCF: Bad Checks (Cheques sem Fundo)
   * Will be empty array [] if no records found
   */
  ccf: CcfEntry[];
}
