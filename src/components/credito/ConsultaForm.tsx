"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TipoDocumento } from "@/lib/consultas";

interface ConsultaFormProps {
  tipo: TipoDocumento;
  onSubmit?: (documento: string, tipoDoc: "cpf" | "cnpj") => void;
}

export default function ConsultaForm({ tipo, onSubmit }: ConsultaFormProps) {
  const [documento, setDocumento] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"cpf" | "cnpj">("cpf");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tipoAtual = tipo === "ambos" ? tipoSelecionado : tipo;
    const isValidDoc =
      tipoAtual === "cpf" ? validateCPF(documento) : validateCNPJ(documento);

    if (!isValidDoc) {
      setIsValid(false);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmit?.(documento, tipoAtual as "cpf" | "cnpj");
    }, 2000);
  };

  const handleTipoChange = (value: string) => {
    setTipoSelecionado(value as "cpf" | "cnpj");
    setDocumento("");
    setIsValid(null);
  };

  const renderFormFields = (tipoDoc: "cpf" | "cnpj") => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="documento">{tipoDoc === "cpf" ? "CPF" : "CNPJ"}</Label>
        <div className="relative">
          <Input
            id="documento"
            type="text"
            placeholder={
              tipoDoc === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"
            }
            value={documento}
            onChange={handleChange}
            maxLength={tipoDoc === "cpf" ? 14 : 18}
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

      <Button
        type="submit"
        size="lg"
        disabled={!isValid || isLoading}
        className="w-full h-14 text-base font-semibold gradient-primary button-shadow"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
          />
        ) : (
          <>
            <Search className="mr-2 h-5 w-5" />
            Realizar Consulta
          </>
        )}
      </Button>
    </form>
  );

  if (tipo === "ambos") {
    return (
      <Tabs
        defaultValue="cpf"
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
    );
  }

  return renderFormFields(tipo as "cpf" | "cnpj");
}
