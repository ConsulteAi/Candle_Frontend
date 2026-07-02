'use client';

import { Landmark } from 'lucide-react';
import type {
  QueryStrategyProps,
  RaioXFinanceiroPlusPjResult,
} from '@/types/query-strategies';
import { CommercialAnalysisPjStrategy } from './CommercialAnalysisPjStrategy';
import { MarketRestrictionsSection } from './RaioXFinanceiroPlusPfStrategy';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';

export function RaioXFinanceiroPlusPjStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXFinanceiroPlusPjResult>) {
  if (!data) return null;

  const marketCompany = data.marketRestrictions?.company;
  const fallbackCompany = marketCompany
    ? {
        ...marketCompany,
      }
    : undefined;

  const normalizedData: RaioXFinanceiroPlusPjResult = {
    ...data,
    company: data.company ?? fallbackCompany,
  };

  return (
    <div className="space-y-8">
      <CommercialAnalysisPjStrategy
        data={normalizedData}
        queryId={queryId}
        scoreVariant="gauge"
        showRiskDetails={false}
        showCreditLimitSuggestion={false}
      />

      {normalizedData.marketRestrictions && (
        <StrategySectionWrapper
          title="Restrições de Mercado"
          icon={<Landmark className="w-5 h-5 text-indigo-500" />}
          isEmpty={false}
        >
          <MarketRestrictionsSection mr={normalizedData.marketRestrictions} />
        </StrategySectionWrapper>
      )}
    </div>
  );
}
