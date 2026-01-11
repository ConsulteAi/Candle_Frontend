/**
 * CorporateCreditStrategy
 * Concrete implementation for corporate credit assessment (CNPJ only)
 *
 * SOLID: Single Responsibility - Handles only corporate consultation logic
 */

import { ConsultaStrategy } from "./ConsultaStrategy";
import { ValidationService, ValidationResult } from "../services/ValidationService";
import { assessCorporateAction, CorporateAssessmentState } from "@/actions/credit.actions";

export class CorporateCreditStrategy implements ConsultaStrategy {
  readonly slug = "credito-total-cenprot-cnpj";
  readonly name = "Crédito Total Cenprot CNPJ";
  readonly documentTypes = "cnpj" as const;
  readonly fieldName = "cnpj";

  validate(document: string, tipo: "cpf" | "cnpj"): ValidationResult {
    // Corporate only accepts CNPJ
    if (tipo !== "cnpj") {
      return {
        isValid: false,
        error: "Esta consulta aceita apenas CNPJ"
      };
    }

    return ValidationService.validateDocument(document, "cnpj");
  }

  async execute(
    formData: FormData,
    prevState: CorporateAssessmentState
  ): Promise<CorporateAssessmentState> {
    return assessCorporateAction(prevState, formData);
  }

  getDescription(): string {
    return "Consulta corporativa completa incluindo CADIN (restrições federais), CCF (cheques sem fundo) e Contumacia (indicadores de mau pagador habitual). Aceita apenas CNPJ.";
  }
}
