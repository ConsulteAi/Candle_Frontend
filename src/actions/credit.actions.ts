"use server";

/**
 * Server Actions for Credit Consultation
 * These functions run on the server and provide secure API access
 */

import { creditService } from "@/services/credit.service";
import {
  CreditReportResponse,
  PremiumCreditReportResponse,
  CorporateCreditReportResponse
} from "@/types/credit";
import { isApiError, getErrorMessage } from "@/lib/api/errors";

export interface AssessmentState {
  status: "idle" | "loading" | "success" | "error";
  data?: CreditReportResponse;
  error?: string;
}

export interface PremiumAssessmentState {
  status: "idle" | "loading" | "success" | "error";
  data?: PremiumCreditReportResponse;
  error?: string;
}

export interface CorporateAssessmentState {
  status: "idle" | "loading" | "success" | "error";
  data?: CorporateCreditReportResponse;
  error?: string;
}

/**
 * Server Action to assess CPF credit
 * Executes on the server, keeping API endpoints and sensitive logic secure
 */
export async function assessCreditAction(
  prevState: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  try {
    const cpf = formData.get("cpf") as string;

    if (!cpf) {
      return {
        status: "error",
        error: "CPF é obrigatório",
      };
    }

    // Call service on server-side
    // This keeps the API endpoint URL hidden from the client
    const result = await creditService.assessCpf(cpf);

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("Error in assessCreditAction:", error);

    return {
      status: "error",
      error: isApiError(error)
        ? getErrorMessage(error)
        : "Erro ao consultar CPF. Tente novamente.",
    };
  }
}

/**
 * Server Action to assess Premium credit for CPF or CNPJ
 * Executes on the server, keeping API endpoints and sensitive logic secure
 * Returns premium report with CADIN and CCF data
 */
export async function assessPremiumCreditAction(
  prevState: PremiumAssessmentState,
  formData: FormData
): Promise<PremiumAssessmentState> {
  try {
    const document = formData.get("document") as string;

    if (!document) {
      return {
        status: "error",
        error: "CPF ou CNPJ é obrigatório",
      };
    }

    // Call service on server-side
    // This keeps the API endpoint URL hidden from the client
    const result = await creditService.assessPremium(document);

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("Error in assessPremiumCreditAction:", error);

    return {
      status: "error",
      error: isApiError(error)
        ? getErrorMessage(error)
        : "Erro ao consultar documento. Tente novamente.",
    };
  }
}

/**
 * Server Action to assess Corporate credit for CNPJ
 * Executes on the server, keeping API endpoints and sensitive logic secure
 * Returns corporate report with CADIN, CCF, and Contumacia data
 */
export async function assessCorporateAction(
  prevState: CorporateAssessmentState,
  formData: FormData
): Promise<CorporateAssessmentState> {
  try {
    const cnpj = formData.get("cnpj") as string;

    if (!cnpj) {
      return {
        status: "error",
        error: "CNPJ é obrigatório",
      };
    }

    // Call service on server-side
    // This keeps the API endpoint URL hidden from the client
    const result = await creditService.assessCorporate(cnpj);

    return {
      status: "success",
      data: result,
    };
  } catch (error) {
    console.error("Error in assessCorporateAction:", error);

    return {
      status: "error",
      error: isApiError(error)
        ? getErrorMessage(error)
        : "Erro ao consultar CNPJ. Tente novamente.",
    };
  }
}
