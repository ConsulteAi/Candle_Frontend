"use client";

/**
 * ConsultaForm - Refactored with Strategy Pattern
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Only handles form UI and user interaction
 * - Open/Closed: Open for extension (new strategies), closed for modification
 * - Dependency Inversion: Depends on ConsultaStrategy interface, not concrete implementations
 *
 * The form delegates all consultation-specific logic to the injected strategy.
 */

import { useState, useTransition, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConsultaStrategy } from "@/lib/consultas/strategies/ConsultaStrategy";
import { ValidationService } from "@/lib/consultas/services/ValidationService";
import { CreditReportResponse, PremiumCreditReportResponse } from "@/types/credit";
import type { AssessmentState, PremiumAssessmentState } from "@/actions";

interface ConsultaFormProps {
  strategy: ConsultaStrategy;
  onResult?: (result: CreditReportResponse | PremiumCreditReportResponse) => void;
}

export default function ConsultaForm({ strategy, onResult }: ConsultaFormProps) {
  const [documento, setDocumento] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"cpf" | "cnpj">("cpf");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  // Single state that works for both standard and premium
  const [state, setState] = useState<AssessmentState | PremiumAssessmentState>({
    status: "idle",
  });

  // Document formatting functions
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tipoAtual = strategy.documentTypes === "ambos" ? tipoSelecionado :
                      strategy.documentTypes === "cpf" ? "cpf" : "cnpj";

    if (tipoAtual === "cpf") {
      const formatted = formatCPF(value);
      setDocumento(formatted);
      if (formatted.replace(/\D/g, "").length === 11) {
        setIsValid(ValidationService.validateCPF(formatted));
      } else {
        setIsValid(null);
      }
    } else {
      const formatted = formatCNPJ(value);
      setDocumento(formatted);
      if (formatted.replace(/\D/g, "").length === 14) {
        setIsValid(ValidationService.validateCNPJ(formatted));
      } else {
        setIsValid(null);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const tipoAtual = strategy.documentTypes === "ambos" ? tipoSelecionado :
                      strategy.documentTypes === "cpf" ? "cpf" : "cnpj";

    // Validate using strategy
    const validation = strategy.validate(documento, tipoAtual);

    if (!validation.isValid) {
      setIsValid(false);
      return;
    }

    // Execute using strategy
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      setState({ status: "loading" });

      try {
        const result = await strategy.execute(formData, { status: "idle" });
        setState(result);

        // Call onResult callback if success
        if (result.status === "success" && result.data && onResult) {
          onResult(result.data);
        }
      } catch (error) {
        setState({
          status: "error",
          error: "Erro ao processar consulta. Tente novamente.",
        });
      }
    });
  };

  const handleTipoChange = (value: string) => {
    setTipoSelecionado(value as "cpf" | "cnpj");
    setDocumento("");
    setIsValid(null);
    setState({ status: "idle" });
  };

  const handleReset = () => {
    setDocumento("");
    setIsValid(null);
    setState({ status: "idle" });
  };

  const renderFormFields = (tipoDoc: "cpf" | "cnpj") => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="documento">{tipoDoc === "cpf" ? "CPF" : "CNPJ"}</Label>
        <div className="relative">
          <Input
            id="documento"
            name={strategy.fieldName}
            type="text"
            placeholder={
              tipoDoc === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"
            }
            value={documento}
            onChange={handleChange}
            maxLength={tipoDoc === "cpf" ? 14 : 18}
            disabled={isPending || state.status === "success"}
            className={`h-14 text-lg pr-12 transition-all duration-300 ${
              isValid === true
                ? "border-green-500 focus-visible:ring-green-500"
                : isValid === false
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }`}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: isValid !== null ? 1 : 0,
              scale: isValid !== null ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {isValid === true ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : isValid === false ? (
              <AlertCircle className="h-6 w-6 text-destructive" />
            ) : null}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isValid === false ? 1 : 0,
            height: isValid === false ? "auto" : 0,
          }}
          transition={{ duration: 0.2 }}
          className="text-sm text-destructive overflow-hidden"
        >
          Por favor, insira um {tipoDoc.toUpperCase()} válido
        </motion.p>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {state.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-700 dark:text-red-300">
              {state.error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || isPending || state.status === "success"}
          className="flex-1 h-14 text-base font-semibold gradient-primary button-shadow"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Realizar Consulta
            </>
          )}
        </Button>

        {state.status === "success" && (
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={handleReset}
            className="h-14"
          >
            Nova Consulta
          </Button>
        )}
      </div>
    </form>
  );

  // Render tabs for "ambos" or single form for specific type
  if (strategy.documentTypes === "ambos") {
    return (
      <div className="space-y-6">
        <Tabs value={tipoSelecionado} onValueChange={handleTipoChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="cpf">Pessoa Física (CPF)</TabsTrigger>
            <TabsTrigger value="cnpj">Pessoa Jurídica (CNPJ)</TabsTrigger>
          </TabsList>
          <TabsContent value="cpf">{renderFormFields("cpf")}</TabsContent>
          <TabsContent value="cnpj">{renderFormFields("cnpj")}</TabsContent>
        </Tabs>

        {/* Expose state for parent to render result */}
        {state.status === "success" && state.data && (
          <div className="hidden" data-result={JSON.stringify(state.data)} />
        )}
      </div>
    );
  }

  const docType = strategy.documentTypes === "cpf" ? "cpf" : "cnpj";

  return (
    <div className="space-y-6">
      {renderFormFields(docType)}

      {/* Expose state for parent to render result */}
      {state.status === "success" && state.data && (
        <div className="hidden" data-result={JSON.stringify(state.data)} />
      )}
    </div>
  );
}
