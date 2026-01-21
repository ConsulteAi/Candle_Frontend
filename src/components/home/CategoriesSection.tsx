"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getOrderedCategories } from "@/constants/query-categories";
import { CategoryCard } from "@/components/query";
import { useQueryTypes } from "@/hooks/useQueryTypes";
import { Loader2 } from "lucide-react";

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
  const { getCountsByCategory, isLoading } = useQueryTypes();
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadCategoryCounts = async () => {
      const counts = await getCountsByCategory();
      setCategoryCounts(counts || {});
    };

    loadCategoryCounts();
  }, []);

  const categories = getOrderedCategories();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Escolha o tipo de <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">consulta</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Selecione uma categoria para ver todas as opções de consulta disponíveis
          </p>
        </motion.div>

        {isLoading && categoryCounts && Object.keys(categoryCounts).length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {categories.map((category) => (
              <motion.div key={category.slug} variants={itemVariants}>
                <CategoryCard
                  category={category}
                  queryCount={categoryCounts[category.category] || 0}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
