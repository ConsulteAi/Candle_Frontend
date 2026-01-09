"use client";

import { motion } from "framer-motion";
import { CreditCard, Car, Scale, Building } from "lucide-react";
import { categorias } from "@/lib/consultas";
import CategoryCard from "@/components/shared/CategoryCard";

const iconMap: Record<string, React.ElementType> = {
  CreditCard,
  Car,
  Scale,
  Building,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

export default function CategoriesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha o tipo de <span className="text-gradient">consulta</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Selecione uma categoria para ver todas as opções de consulta
            disponíveis
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {categorias.map((categoria) => {
            const Icon = iconMap[categoria.icone] || CreditCard;
            const isAvailable = categoria.consultas.length > 0;

            return (
              <motion.div key={categoria.id} variants={itemVariants}>
                <CategoryCard
                  slug={categoria.slug}
                  nome={categoria.nome}
                  descricao={categoria.descricao}
                  icon={Icon}
                  cor={categoria.cor}
                  consultasCount={categoria.consultas.length}
                  isAvailable={isAvailable}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
