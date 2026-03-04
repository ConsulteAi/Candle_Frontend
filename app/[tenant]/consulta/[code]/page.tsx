'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, ShieldCheck, Zap, Info, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Header, Footer } from '@/components/layout';
import { QueryExecutionForm } from '@/components/query/QueryExecutionForm';
import { QueryResultDisplay } from '@/components/query/QueryResultDisplay';
import { useQueryByTypeSWR } from '@/hooks/useQueryByTypeSWR';
import { useQueryExecution } from '@/hooks/useQueryExecution';
import { getCategoryConfig } from '@/constants/query-categories';
import { QueryCategory, type ExecuteQueryResponse, type QueryHistoryEntry } from '@/types/query';
import { Button, Card, StatsCard, Badge } from '@/design-system/ComponentsTailwind';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getPriorityCategory } from '@/lib/utils';

function QueryExecutionContent() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);

  const { getById } = useQueryExecution();
  const [historyResult, setHistoryResult] = useState<QueryHistoryEntry | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(isUUID);
  const [historyError, setHistoryError] = useState(false);

  // Additional state for Query Type view
  const { queryType, isLoading: isTypeLoading, notFound } = useQueryByTypeSWR(isUUID ? '' : code);

  // Effect for UUID fetching
  useEffect(() => {
    if (isUUID) {
      setLoadingHistory(true);
      getById(code).then((res) => {
        if (res && res.id) {
          setHistoryResult(res);
        } else {
          setHistoryError(true);
        }
        setLoadingHistory(false);
      }).catch(() => {
        setHistoryError(true);
        setLoadingHistory(false);
      });
    }
  }, [code, isUUID]);

  const handleSuccess = (executeResult: ExecuteQueryResponse) => {
    // Redirect to the query result page
    router.push(`/consulta/${executeResult.queryId}`);
  };

  // --------------------------------------------------------------------------
  // RENDER: Loading State
  // --------------------------------------------------------------------------
  if (loadingHistory || (isTypeLoading && !isUUID)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Direct Query Result View (UUID)
  // --------------------------------------------------------------------------
  if (isUUID) {
    if (historyError || !historyResult) {
       return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Info className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Consulta não encontrada</h1>
          <p className="text-gray-600 mb-8 max-w-md text-center">
            Não foi possível localizar o resultado desta consulta. Verifique o ID e tente novamente.
          </p>
          <Link href="/consulta">
            <Button variant="primary">Ir para o catálogo</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/consulta"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Consultas
          </Link>
        </motion.div>
        
        <div className="space-y-6">
          <div className="flex items-center flex-wrap gap-4 mb-8">
             <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
             </div>
             <div>
                <div className="mb-1"><Badge variant="info">{historyResult.queryType?.code || 'CONSULTA'}</Badge></div>
                <h1 className="text-2xl font-bold text-gray-900">{historyResult.queryType?.name || 'Detalhes da Consulta'}</h1>
             </div>
          </div>
          <QueryResultDisplay query={historyResult} />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: Query Execution View (Type Code)
  // --------------------------------------------------------------------------

  if (notFound || !queryType) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Info className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tipo de consulta não encontrado</h1>
        <p className="text-gray-600 mb-8 max-w-md text-center">
          O tipo de consulta que você está procurando não existe ou foi desativado.
        </p>
        <Link href="/consulta">
          <Button variant="primary">Voltar para o catálogo</Button>
        </Link>
      </div>
    );
  }

  const mainCategory = getPriorityCategory(queryType.category);
  const categoryConfig = mainCategory ? getCategoryConfig(mainCategory) : null;
  const IconComponent = (categoryConfig?.icon && Icons[categoryConfig.icon as keyof typeof Icons] ? Icons[categoryConfig.icon as keyof typeof Icons] : Icons.FileText) as React.ElementType;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <Link
          href={`/consulta?category=${categoryConfig?.slug || ''}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para {categoryConfig?.name || 'Consultas'}
        </Link>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 sm:gap-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/10 to-white rounded-2xl border border-primary/5 shadow-sm flex items-center justify-center flex-shrink-0">
              {IconComponent && <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="info">{code}</Badge>
                {categoryConfig && (
                   <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-600">
                     {categoryConfig.name}
                   </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2">
                {queryType.name}
              </h1>
              <p className="text-gray-600 leading-relaxed text-lg">
                {queryType.description}
              </p>
            </div>
          </motion.div>

          {/* Action Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Card className="border-primary/20 shadow-xl shadow-primary/5">
              <div className="mb-6 pb-6 border-b border-gray-100">
                 <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                   <Zap className="w-5 h-5 text-primary" />
                   Executar Consulta
                 </h3>
                 <p className="text-sm text-gray-500 mt-1">
                   Insira os dados abaixo para buscar as informações nos bureaus.
                 </p>
              </div>
              <QueryExecutionForm queryType={queryType} onSuccess={handleSuccess} />
            </Card>
          </motion.div>
        </div>

        {/* Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
           >
             <StatsCard 
               icon={<Zap className="w-6 h-6" />}
               label="Custo da Consulta"
               value={`R$ ${queryType.price.toFixed(2)}`}
             />
           </motion.div>

           <motion.div
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
           >
              <Card className="bg-gray-50 border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  Garantias
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Dados diretos da fonte oficial
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Histórico salvo automaticamente
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Suporte especializado 24/7
                  </li>
                </ul>
              </Card>
           </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function QueryExecutionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1">
         <QueryExecutionContent />
      </main>
      <Footer />
    </div>
  );
}
