'use client';

import type {
  CompletaPlusCnpjResult,
  CompletaPlusCpfResult,
  CompletaPlusScoreResult,
  QueryStrategyProps,
} from '@/types/query-strategies';
import { CompletaPlusCnpjStrategy } from './CompletaPlusCnpjStrategy';
import { CompletaPlusCpfStrategy } from './CompletaPlusCpfStrategy';

export function CompletaPlusScoreStrategy({
  data,
  queryId,
}: QueryStrategyProps<CompletaPlusScoreResult>) {
  if (!data) return null;

  if (data.company) {
    const pjData: CompletaPlusCnpjResult = {
      ...data,
      company: data.company,
      score: data.score
        ? {
            ...data.score,
            class: data.score.class ?? '',
            riskText: data.score.riskText ?? '',
          }
        : { value: '', class: '', riskText: '' },
    };
    return <CompletaPlusCnpjStrategy data={pjData} queryId={queryId} />;
  }

  const pfData: CompletaPlusCpfResult = {
    ...data,
    person: data.person ?? {
      name: '',
      document: '',
      birthDate: '',
      motherName: '',
      status: '',
      revenueStatus: '',
      email: '',
      gender: '',
    },
    veicular: {},
  };
  return <CompletaPlusCpfStrategy data={pfData} queryId={queryId} />;
}
