"use client";

import { motion } from "framer-motion";
import { Filter, Search } from "lucide-react";
import { Input } from "@/design-system/ComponentsTailwind";
import { QueryCategory } from "@/types/query";
import { cn } from "@/lib/utils";

export type FilterType = "ALL" | QueryCategory.PERSON | QueryCategory.COMPANY;

interface QueryFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function QueryFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: QueryFiltersProps) {
  const tabs = [
    { id: "ALL", label: "Todas" },
    { id: QueryCategory.PERSON, label: "Pessoa Física (CPF)" },
    { id: QueryCategory.COMPANY, label: "Empresarial (CNPJ)" },
  ];

  return (
    <section className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-6 mb-8 mt-[-1px]">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          
          {/* Animated Tabs */}
          <div className="flex p-1 bg-gray-100/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 relative">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onFilterChange(tab.id as FilterType)}
                className={cn(
                  "relative px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 z-10",
                  filter === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {filter === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-96">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar consulta..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-gray-700 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
