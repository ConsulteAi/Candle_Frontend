"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Consulta } from "@/lib/consultas";
import ConsultaCard from "./ConsultaCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

interface ConsultasListProps {
  consultas: Consulta[];
}

export default function ConsultasList({ consultas }: ConsultasListProps) {
  if (consultas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {consultas.map((consulta) => (
        <motion.div key={consulta.id} variants={itemVariants}>
          <ConsultaCard consulta={consulta} />
        </motion.div>
      ))}
    </motion.div>
  );
}
