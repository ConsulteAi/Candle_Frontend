'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, CreditCard } from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { PageHeader } from '@/components/shared';
import { QueryList, QueryFilters, type FilterType } from '@/components/query';
import { QueryCategory, type QueryType } from '@/types/query';
import { useQueryTypes } from '@/hooks/useQueryTypes';
import { getCategoryBySlug } from '@/constants/query-categories';

function ConsultaPageContent() {
  const searchParams = useSearchParams();
  const { getAllTypes, isLoading } = useQueryTypes();
  
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [queries, setQueries] = useState<QueryType[]>([]);

  useEffect(() => {
    const init = async () => {
      // 1. Fetch all queries
      const data = await getAllTypes();
      setQueries(data);

      // 2. Set filter from URL
      const categorySlug = searchParams.get('category');
      if (categorySlug) {
        const categoryConfig = getCategoryBySlug(categorySlug);
        if (categoryConfig) {
          setFilter(categoryConfig.category);
        }
      }
    };

    init();
  }, []); // Run once on mount

  const filteredQueries = queries.filter((query) => {
    let matchType = false;
    
    if (filter === "ALL") {
      matchType = true;
    } else {
      matchType = query.category === filter;
    }

    const matchSearch =
      search === "" ||
      query.name.toLowerCase().includes(search.toLowerCase()) ||
      (query.description && query.description.toLowerCase().includes(search.toLowerCase()));

    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1">
        <PageHeader
          backHref="/"
          backLabel="Voltar ao início"
          icon={CreditCard}
          badge="Todas as Consultas"
          title={
            <>
              Soluções de <span className="text-blue-600">Consulta</span>
            </>
          }
          description="Encontre a consulta ideal para sua necessidade. CPF, CNPJ e muito mais."
        />

        <QueryFilters
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />

        <section className="py-12">
          <div className="container max-w-7xl mx-auto px-4">
            {isLoading && queries.length === 0 ? (
               <div className="flex items-center justify-center py-12">
                 <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
               </div>
            ) : (
               <QueryList queries={filteredQueries} />
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <ConsultaPageContent />
    </Suspense>
  );
}
