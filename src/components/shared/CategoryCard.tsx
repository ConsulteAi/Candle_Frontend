"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  nome: string;
  descricao: string;
  icon: React.ElementType;
  cor: string;
  consultasCount: number;
  isAvailable: boolean;
}

export default function CategoryCard({
  slug,
  nome,
  descricao,
  icon: Icon,
  cor,
  consultasCount,
  isAvailable,
}: CategoryCardProps) {
  if (isAvailable) {
    return (
      <Link href={`/${slug}`}>
        <motion.div
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-8 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-xl h-full"
        >
          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${cor} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
          />

          <div className="relative">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cor} flex items-center justify-center mb-6`}
            >
              <Icon className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              {nome}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">{descricao}</p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {consultasCount} consultas disponíveis
              </span>
              <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                Acessar
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-2xl bg-card/50 border border-border/30 p-8 opacity-60 h-full"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6">
          <Icon className="w-7 h-7 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-bold mb-2">{nome}</h3>
        <p className="text-muted-foreground text-sm mb-6">{descricao}</p>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Em breve
          </span>
        </div>
      </div>
    </motion.div>
  );
}
