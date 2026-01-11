/**
 * CpfCreditStrategy
 * Concrete implementation for standard CPF credit assessment
 *
 * SOLID: Single Responsibility - Handles only CPF credit consultation logic
 */

import { ConsultaStrategy } from "./ConsultaStrategy";
import { ValidationService, ValidationResult } from "../services/ValidationService";
import { assessCreditAction, AssessmentState } from "@/actions/credit.actions";

export class CpfCreditStrategy implements ConsultaStrategy {
  readonly slug = "avalie-credito-cpf";
  readonly name = "Avalie Crédito CPF";
  readonly documentTypes = "cpf" as const;
  readonly fieldName = "cpf";

  validate(document: string, tipo: "cpf" | "cnpj"): ValidationResult {
    // This strategy only supports CPF
    if (tipo !== "cpf") {
      return {
        isValid: false,
        error: "Esta consulta aceita apenas CPF",
      };
    }

    return ValidationService.validateDocument(document, "cpf");
  }

  async execute(
    formData: FormData,
    prevState: AssessmentState
  ): Promise<AssessmentState> {
    return assessCreditAction(prevState, formData);
  }

  getDescription(): string {
    return "Consulta de crédito completa para CPF com análise de dívidas, protestos e histórico de consultas.";
  }
}
