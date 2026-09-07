'use client';

import { Landmark } from 'lucide-react';
import type {
  QueryStrategyProps,
  RaioXFinanceiroPlusPfResult,
} from '@/types/query-strategies';
import { CommercialAnalysisPfStrategy } from './CommercialAnalysisPfStrategy';
import { MarketRestrictionsSection } from './components/MarketRestrictionsSection';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';

export function RaioXFinanceiroPlusPfStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXFinanceiroPlusPfResult>) {
  if (!data) return null;

  const marketPerson = data.marketRestrictions?.person;
  const fallbackPerson = marketPerson
    ? {
        ...marketPerson,
        status: '',
        revenueStatus: '',
      }
    : undefined;

  const normalizedData: RaioXFinanceiroPlusPfResult = {
    ...data,
    person: data.person ?? fallbackPerson,
  };

  return (
    <div className="space-y-8">
      <CommercialAnalysisPfStrategy
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
