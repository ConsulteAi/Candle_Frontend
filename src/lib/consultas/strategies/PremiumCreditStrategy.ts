/**
 * PremiumCreditStrategy
 * Concrete implementation for premium credit assessment (CPF or CNPJ)
 *
 * SOLID: Single Responsibility - Handles only premium consultation logic
 */

import { ConsultaStrategy } from "./ConsultaStrategy";
import { ValidationService, ValidationResult } from "../services/ValidationService";
import { assessPremiumCreditAction, PremiumAssessmentState } from "@/actions/credit.actions";

export class PremiumCreditStrategy implements ConsultaStrategy {
  readonly slug = "consulta-completa-premium";
  readonly name = "Consulta Completa Premium";
  readonly documentTypes = "ambos" as const;
  readonly fieldName = "document";

  validate(document: string, tipo: "cpf" | "cnpj"): ValidationResult {
    // Premium supports both CPF and CNPJ
    return ValidationService.validateDocument(document, tipo);
  }

  async execute(
    formData: FormData,
    prevState: PremiumAssessmentState
  ): Promise<PremiumAssessmentState> {
    return assessPremiumCreditAction(prevState, formData);
  }

  getDescription(): string {
    return "Consulta premium com dados completos incluindo CADIN (restrições federais) e CCF (cheques sem fundo). Aceita CPF ou CNPJ.";
  }
}
