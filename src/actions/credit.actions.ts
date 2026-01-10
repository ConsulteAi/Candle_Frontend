"use server";

/**
 * Server Actions for Credit Consultation
 * These functions run on the server and provide secure API access
 */

import { creditService } from "@/services/credit.service";
import { CreditReportResponse } from "@/types/credit";
import { isApiError, getErrorMessage } from "@/lib/api/errors";

export interface AssessmentState {
  status: "idle" | "loading" | "success" | "error";
  data?: CreditReportResponse;
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
