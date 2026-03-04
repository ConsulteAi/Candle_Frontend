
'use client';

import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Building2, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  Clock,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, ScrBacenResult } from '@/types/query-strategies';
import { cn, formatDisplayDate } from '@/lib/utils';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';

export function ScrBacenStrategy({ data }: QueryStrategyProps<ScrBacenResult>) {
  if (!data) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Score Card */}
        <div className="md:col-span-4">
          <Card className="h-full relative overflow-hidden border-2 border-primary/20 dark:border-primary/80 bg-gradient-to-br from-white to-primary/10 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/50/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center justify-center py-8">
              <div className="relative mb-4">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * data.score.value) / 1000}
                    className={cn(
                      "transition-all duration-1000 ease-out",
                      data.score.value > 700 ? "text-green-500" :
                      data.score.value > 400 ? "text-yellow-500" : "text-red-500"
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {data.score.value}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">SCORE</span>
                </div>
              </div>
              
              <Badge 
                variant={data.score.value > 700 ? "success" : data.score.value > 400 ? "warning" : "error"}
              >
                {data.score.band}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900">
            <StrategyHeader 
              title="Dados da Consulta"
              subtitle={`Documento: ${data.document}`}
              pdfUrl={data.pdf}
              className="mb-6"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoBox 
                label="Tipo" 
                value={data.documentType} 
                icon={<Briefcase className="w-4 h-4 text-purple-500" />} 
              />
              <InfoBox 
                label="Data Base" 
                value={formatDisplayDate(data.databaseDate)} 
                icon={<Calendar className="w-4 h-4 text-orange-500" />} 
              />
              <InfoBox 
                label="Início Relac." 
                value={formatDisplayDate(data.relationshipStartDate)} 
                icon={<Clock className="w-4 h-4 text-primary" />} 
              />
              <InfoBox 
                label="Instituições" 
                value={data.institutionsCount.toString()} 
                icon={<Building2 className="w-4 h-4 text-gray-500" />} 
              />
            </div>

            {data.hasRestrictions && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-lg flex items-center gap-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900 dark:text-red-100">Restrições Encontradas</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    Total Restritivo: <strong>{formatCurrency(data.totalRestrictiveValue)}</strong>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Credit Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="A Vencer"
          value={data.creditSummary.creditToExpire.value}
          subtitle={`${data.creditSummary.creditToExpire.percentage}% do total`}
          color="blue"
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Vencido"
          value={data.creditSummary.expiredCredit.value}
          subtitle={`${data.creditSummary.expiredCredit.percentage}% do total`}
          color="red"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Limite"
          value={data.creditSummary.creditLimit.value}
          subtitle={`${data.creditSummary.creditLimit.percentage}% do total`}
          color="green"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Prejuízo"
          value={data.creditSummary.loss.value}
          subtitle={`${data.creditSummary.loss.percentage}% do total`}
          color="gray"
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Operations Details */}
      <StrategySectionWrapper
        title="Detalhamento de Operações"
        icon={<DollarSign className="w-5 h-5 text-primary" />}
        isEmpty={data.operations.length === 0}
      >
        <div className="divide-y divide-gray-100">
          {data.operations.map((op, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info">{op.modalityDescription}</Badge>
                    <span className="text-gray-400 text-xs">•</span>
                    <span className="text-sm font-medium text-gray-700">{op.subModalityDescription}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(op.totalValue)}
                    <span className="text-sm font-normal text-gray-500 ml-2">({op.percentage}%)</span>
                  </div>
                </div>
              </div>

              {/* Maturities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {op.maturities.map((mat, mIdx) => (
                  <div 
                    key={mIdx}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      mat.isRestrictive 
                        ? "bg-red-50 border-red-100 text-red-700" 
                        : "bg-gray-50 border-gray-100 text-gray-600"
                    )}
                  >
                    <p className="font-medium text-xs mb-1 opacity-80">{mat.description}</p>
                    <p className="font-bold text-base">
                      {formatCurrency(mat.value)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </StrategySectionWrapper>
    </div>
  );
}
