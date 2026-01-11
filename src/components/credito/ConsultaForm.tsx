"use client";

import { useState, useTransition, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TipoDocumento } from "@/lib/consultas";
import { CreditReportResponse, PremiumCreditReportResponse } from "@/types/credit";
import type { AssessmentState, PremiumAssessmentState } from "@/actions";

interface ConsultaFormServerProps {
  tipo: TipoDocumento;
  slug: string;
  onResult?: (result: CreditReportResponse | PremiumCreditReportResponse) => void;
  serverAction?: (prevState: AssessmentState, formData: FormData) => Promise<AssessmentState>;
  premiumServerAction?: (prevState: PremiumAssessmentState, formData: FormData) => Promise<PremiumAssessmentState>;
}

export default function ConsultaFormServer({ tipo, slug, onResult, serverAction, premiumServerAction }: ConsultaFormServerProps) {
  const [documento, setDocumento] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"cpf" | "cnpj">("cpf");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  // State for assessment result
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    status: "idle",
  });

  // State for premium assessment result
  const [premiumAssessmentState, setPremiumAssessmentState] = useState<PremiumAssessmentState>({
    status: "idle",
  });

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

  const validateCPF = (cpfValue: string) => {
    const numbers = cpfValue.replace(/\D/g, "");
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;

    return true;
  };

  const validateCNPJ = (cnpjValue: string) => {
    const numbers = cnpjValue.replace(/\D/g, "");
    if (numbers.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numbers)) return false;
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tipoAtual = tipo === "ambos" ? tipoSelecionado : tipo;

    if (tipoAtual === "cpf") {
      const formatted = formatCPF(value);
      setDocumento(formatted);
      if (formatted.replace(/\D/g, "").length === 11) {
        setIsValid(validateCPF(formatted));
      } else {
        setIsValid(null);
      }
    } else {
      const formatted = formatCNPJ(value);
      setDocumento(formatted);
      if (formatted.replace(/\D/g, "").length === 14) {
        setIsValid(validateCNPJ(formatted));
      } else {
        setIsValid(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const tipoAtual = tipo === "ambos" ? tipoSelecionado : tipo;
    const isValidDoc =
      tipoAtual === "cpf" ? validateCPF(documento) : validateCNPJ(documento);

    if (!isValidDoc) {
      setIsValid(false);
      return;
    }

    // Premium consultation (accepts both CPF and CNPJ)
    if (slug === "consulta-completa-premium" && premiumServerAction) {
      const formData = new FormData(e.currentTarget);

      startTransition(async () => {
        setPremiumAssessmentState({ status: "loading" });

        const result = await premiumServerAction(
          { status: "idle" },
          formData
        );

        setPremiumAssessmentState(result);

        // Call onResult callback if success
        if (result.status === "success" && result.data && onResult) {
          onResult(result.data);
        }
      });
    }
    // Standard CPF assessment
    else if (slug === "avalie-credito-cpf" && tipoAtual === "cpf" && serverAction) {
      const formData = new FormData(e.currentTarget);

      startTransition(async () => {
        setAssessmentState({ status: "loading" });

        const result = await serverAction(
          { status: "idle" },
          formData
        );

        setAssessmentState(result);

        // Call onResult callback if success
        if (result.status === "success" && result.data && onResult) {
          onResult(result.data);
        }
      });
    } else {
      // For other consultations not yet implemented
      const errorState = {
        status: "error" as const,
        error: serverAction || premiumServerAction
          ? "Esta consulta ainda não está disponível. Em breve!"
          : "Consulta não configurada. Configure o serverAction.",
      };

      // Set error in the appropriate state
      if (slug === "consulta-completa-premium") {
        setPremiumAssessmentState(errorState);
      } else {
        setAssessmentState(errorState);
      }
    }
  };

  const handleTipoChange = (value: string) => {
    setTipoSelecionado(value as "cpf" | "cnpj");
    setDocumento("");
    setIsValid(null);
    setAssessmentState({ status: "idle" });
    setPremiumAssessmentState({ status: "idle" });
  };

  const handleReset = () => {
    setDocumento("");
    setIsValid(null);
    setAssessmentState({ status: "idle" });
    setPremiumAssessmentState({ status: "idle" });
  };

  // Get current assessment state (premium or standard)
  const currentState = slug === "consulta-completa-premium" ? premiumAssessmentState : assessmentState;

  const renderFormFields = (tipoDoc: "cpf" | "cnpj") => {
    // Use "document" field name for premium, "cpf" for standard
    const fieldName = slug === "consulta-completa-premium" ? "document" : "cpf";

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="documento">{tipoDoc === "cpf" ? "CPF" : "CNPJ"}</Label>
          <div className="relative">
            <Input
              id="documento"
              name={fieldName}
              type="text"
              placeholder={
                tipoDoc === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"
              }
              value={documento}
              onChange={handleChange}
              maxLength={tipoDoc === "cpf" ? 14 : 18}
              disabled={isPending || currentState.status === "success"}
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
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            {isValid === true ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
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
          className="text-sm text-destructive"
        >
          Por favor, insira um {tipoDoc.toUpperCase()} válido
        </motion.p>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {currentState.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-700 dark:text-red-300">
              {currentState.error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || isPending || currentState.status === "success"}
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

        {currentState.status === "success" && (
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
  };

  if (tipo === "ambos") {
    return (
      <div className="space-y-6">
        <Tabs
          defaultValue="cpf"
          value={tipoSelecionado}
          onValueChange={handleTipoChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="cpf">Pessoa Física (CPF)</TabsTrigger>
            <TabsTrigger value="cnpj">Pessoa Jurídica (CNPJ)</TabsTrigger>
          </TabsList>
          <TabsContent value="cpf">{renderFormFields("cpf")}</TabsContent>
          <TabsContent value="cnpj">{renderFormFields("cnpj")}</TabsContent>
        </Tabs>

        {/* Expose assessment state for parent to render result */}
        {currentState.status === "success" && currentState.data && (
          <div className="hidden" data-result={JSON.stringify(currentState.data)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderFormFields(tipo as "cpf" | "cnpj")}

      {/* Expose assessment state for parent to render result */}
      {currentState.status === "success" && currentState.data && (
        <div className="hidden" data-result={JSON.stringify(currentState.data)} />
      )}
    </div>
  );
}
