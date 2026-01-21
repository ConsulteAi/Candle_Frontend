'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { QueryFilters, type FilterType } from '@/components/query/QueryFilters';
import { QueryTypeCard } from '@/components/query/QueryTypeCard';
import { QuerySkeleton } from '@/components/query/QuerySkeleton';
import { useQueriesSWR } from '@/hooks/useQueriesSWR';
import { QueryCategory } from '@/types/query';
import { getCategoryBySlug } from '@/constants/query-categories';
import { motion } from 'framer-motion';

function ConsultaPageContent() {
  const searchParams = useSearchParams();
  const { queries, isLoading } = useQueriesSWR();
  
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");

  // Initialize filter from URL params
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug) {
      const categoryConfig = getCategoryBySlug(categorySlug);
      if (categoryConfig) {
        // Map slug to valid FilterType (only PERSON or COMPANY, fallback to ALL if something else)
        if (categoryConfig.category === QueryCategory.PERSON) {
          setFilter(QueryCategory.PERSON);
        } else if (categoryConfig.category === QueryCategory.COMPANY) {
          setFilter(QueryCategory.COMPANY);
        }
      }
    }
  }, [searchParams]);

  const filteredQueries = queries.filter((query) => {
    let matchType = false;
    
    if (filter === "ALL") {
      matchType = true;
    } else {
      // Verifica se a categoria selecionada está presente no array de categorias da consulta
      matchType = query.category.includes(filter as QueryCategory);
    }

    const matchSearch =
      search === "" ||
      query.name.toLowerCase().includes(search.toLowerCase()) ||
      (query.description && query.description.toLowerCase().includes(search.toLowerCase()));

    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30 animate-float" />
          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                Catálogo de <span className="gradient-text">Consultas</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Acesse as melhores fontes de dados do mercado. Resultados precisos, atualizados e com o melhor custo-benefício.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters Sticky Section */}
        <QueryFilters
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />

        {/* Content Section */}
        <section className="pb-24">
          <div className="container max-w-7xl mx-auto px-4">
            {isLoading ? (
               <QuerySkeleton />
            ) : filteredQueries.length > 0 ? (
               <motion.div 
                 className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ staggerChildren: 0.1 }}
               >
                 {filteredQueries.map((query) => (
                   <QueryTypeCard key={query.code} queryType={query} />
                 ))}
               </motion.div>
            ) : (
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl"
               >
                 <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                   <Search className="w-8 h-8 text-gray-400" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">
                   Nenhuma consulta encontrada
                 </h3>
                 <p className="text-gray-500 max-w-md mx-auto">
                   Não encontramos resultados para sua busca. Tente alterar os filtros ou os termos pesquisados.
                 </p>
               </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50/50"><Header /><main className="container py-32"><QuerySkeleton /></main><Footer /></div>}>
      <ConsultaPageContent />
    </Suspense>
  );
}
