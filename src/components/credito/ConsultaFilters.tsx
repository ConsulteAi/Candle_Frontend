"use client";

import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TipoDocumento } from "@/lib/consultas";

type FiltroTipo = TipoDocumento | "todos";

interface ConsultaFiltersProps {
  filtro: FiltroTipo;
  onFiltroChange: (filtro: FiltroTipo) => void;
  busca: string;
  onBuscaChange: (busca: string) => void;
}

export default function ConsultaFilters({
  filtro,
  onFiltroChange,
  busca,
  onBuscaChange,
}: ConsultaFiltersProps) {
  return (
    <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50 py-4">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Button
              variant={filtro === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltroChange("todos")}
              className="rounded-full"
            >
              Todos
            </Button>
            <Button
              variant={filtro === "cpf" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltroChange("cpf")}
              className="rounded-full"
            >
              CPF
            </Button>
            <Button
              variant={filtro === "cnpj" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltroChange("cnpj")}
              className="rounded-full"
            >
              CNPJ
            </Button>
            <Button
              variant={filtro === "ambos" ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltroChange("ambos")}
              className="rounded-full"
            >
              CPF / CNPJ
            </Button>
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar consulta..."
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
