"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  Crown,
  User,
  BarChart3,
  LineChart,
  Search,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
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

const tipoColors: Record<TipoDocumento, string> = {
  cpf: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  cnpj: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  ambos: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

interface ConsultaCardProps {
  consulta: Consulta;
}

export default function ConsultaCard({ consulta }: ConsultaCardProps) {
  const Icon = iconMap[consulta.icone] || CreditCard;

  return (
    <Link href={`/credito/${consulta.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 p-6 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
      >
        {/* Destaque badge */}
        {consulta.destaque && (
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className="bg-amber-500/10 text-amber-600 border-amber-500/20"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Destaque
            </Badge>
          </div>
        )}

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors pr-20">
          {consulta.nome}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {consulta.descricao}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
          <Badge variant="outline" className={tipoColors[consulta.tipo]}>
            {tipoLabels[consulta.tipo]}
          </Badge>
          <div className="flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Consultar
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
