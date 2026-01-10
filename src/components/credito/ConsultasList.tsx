"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Consulta } from "@/lib/consultas";
import ConsultaCard from "./ConsultaCard";

interface ConsultasListProps {
  consultas: Consulta[];
}

export default function ConsultasList({ consultas }: ConsultasListProps) {
  if (consultas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-center py-16"
      >
        <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Nenhuma consulta encontrada com os filtros selecionados.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {consultas.map((consulta, index) => (
          <motion.div
            key={consulta.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              layout: { duration: 0.3 },
            }}
          >
            <ConsultaCard consulta={consulta} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
