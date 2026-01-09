"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  Crown,
  User,
  BarChart3,
  LineChart,
  Search,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Consulta, TipoDocumento } from "@/lib/consultas";

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  Building2,
  Crown,
  User,
  BarChart3,
  LineChart,
  Search,
  ShieldCheck,
  Zap,
};

const tipoLabels: Record<TipoDocumento, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  ambos: "CPF / CNPJ",
};

interface ConsultaHeaderProps {
  consulta: Consulta;
}

export default function ConsultaHeader({ consulta }: ConsultaHeaderProps) {
  const Icon = iconMap[consulta.icone] || CreditCard;

  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="container relative py-12">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href="/credito"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar às consultas de crédito
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-start gap-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{consulta.nome}</h1>
              <Badge variant="outline" className="text-xs">
                {tipoLabels[consulta.tipo]}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              {consulta.descricao}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
