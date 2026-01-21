'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { QueryExecutionForm, QueryResultDisplay } from '@/components/query';
import { useQueryTypes } from '@/hooks/useQueryTypes';
import { getCategoryConfig } from '@/constants/query-categories';
import type { QueryType, ExecuteQueryResponse, QueryHistoryEntry } from '@/types/query';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function QueryExecutionPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const { getByCode, isLoading } = useQueryTypes();
  const [queryType, setQueryType] = useState<QueryType | null>(null);
  const [result, setResult] = useState<QueryHistoryEntry | null>(null);

  useEffect(() => {
    const loadQueryType = async () => {
      const type = await getByCode(code);
      setQueryType(type);
    };

    loadQueryType();
  }, [code]);

  const handleSuccess = (executeResult: ExecuteQueryResponse) => {
    // Convert ExecuteQueryResponse to QueryHistoryEntry format for display
    const historyEntry: QueryHistoryEntry = {
      id: executeResult.queryId,
      userId: '', // Not needed for display
      queryTypeId: queryType!.id,
      input: '', // Not returned from backend
      result: executeResult.result,
      price: executeResult.price,
      isCached: executeResult.cached,
      status: 'SUCCESS',
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      queryType: {
        code: queryType!.code,
        name: queryType!.name,
        category: queryType!.category,
        description: queryType!.description,
      },
    };

    setResult(historyEntry);
  };

  const handleNewQuery = () => {
    setResult(null);
  };

  if (isLoading || !queryType) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  const mainCategory = queryType.category && queryType.category.length > 0 ? queryType.category[0] : null;
  const categoryConfig = mainCategory ? getCategoryConfig(mainCategory) : null;
  const IconComponent = (categoryConfig?.icon && Icons[categoryConfig.icon as keyof typeof Icons] ? Icons[categoryConfig.icon as keyof typeof Icons] : Icons.FileText) as React.ElementType;

  if (!categoryConfig) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href={`/consulta?category=${categoryConfig.slug}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para {categoryConfig.name}
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{queryType.name}</h1>
                <p className="text-gray-600">{queryType.description}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          {result ? (
            <div className="space-y-6">
              <QueryResultDisplay query={result} />

              <div className="flex justify-center pt-6">
                <Button onClick={handleNewQuery} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Fazer Nova Consulta
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-8">
              <QueryExecutionForm queryType={queryType} onSuccess={handleSuccess} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
