
import { ScrBacenStrategy } from './ScrBacenStrategy';
import { CreditPremiumStrategy } from './CreditPremiumStrategy';
import { LocalizaStrategy } from './LocalizaStrategy';
import { DefaultStrategy } from './DefaultStrategy';
import { CompletaPlusCpfStrategy } from './CompletaPlusCpfStrategy';
import { CompletaPlusCnpjStrategy } from './CompletaPlusCnpjStrategy';
import { BoaVistaAcertaCpfStrategy } from './BoaVistaAcertaCpfStrategy';
import { BvsBasicaPfStrategy } from './BvsBasicaPfStrategy';
import { BvsBasicaPjStrategy } from './BvsBasicaPjStrategy';
import { MaxBrasilAvancadoPfStrategy } from './MaxBrasilAvancadoPfStrategy';
import { MaxBrasilAvancadoPjStrategy } from './MaxBrasilAvancadoPjStrategy';
import { ProtestoNacionalStrategy } from './ProtestoNacionalStrategy';
import { QuodRestritivoAcoesPfStrategy } from './QuodRestritivoAcoesPfStrategy';
import { QuodRestritivoAcoesPjStrategy } from './QuodRestritivoAcoesPjStrategy';
import { RealtimePremiumScorePfStrategy } from './RealtimePremiumScorePfStrategy';
import { RealtimePremiumScorePjStrategy } from './RealtimePremiumScorePjStrategy';
import { SerasaCrednetPefinProtestoSpcPfStrategy } from './SerasaCrednetPefinProtestoSpcPfStrategy';
import { RealtimeMaxSpcSerasaBvsProtestoPfStrategy } from './RealtimeMaxSpcSerasaBvsProtestoPfStrategy';
import { RealtimeMaxSpcSerasaBvsProtestoPjStrategy } from './RealtimeMaxSpcSerasaBvsProtestoPjStrategy';
import { MaxBrasilScoreBvsBasicaPfStrategy } from './MaxBrasilScoreBvsBasicaPfStrategy';
import { MaxBrasilScoreBvsBasicaPjStrategy } from './MaxBrasilScoreBvsBasicaPjStrategy';
import { DividasMultiCpfProStrategy } from './DividasMultiCpfProStrategy';
import { DividasMultiCnpjProStrategy } from './DividasMultiCnpjProStrategy';
import { RaioXCreditoRatingScrStrategy } from './RaioXCreditoRatingScrStrategy';
import { ProtestoNacionalPlusStrategy } from './ProtestoNacionalPlusStrategy';
import { CadinStrategy } from './CadinStrategy';
import { ProtestoDetalhadoSpStrategy } from './ProtestoDetalhadoSpStrategy';
import { CommercialAnalysisPfStrategy } from './CommercialAnalysisPfStrategy';
import { CommercialAnalysisPjStrategy } from './CommercialAnalysisPjStrategy';
import { ScrEhmStrategy } from './ScrEhmStrategy';
import { CcfStrategy } from './CcfStrategy';
import { RaioXFinanceiroStrategy } from './RaioXFinanceiroStrategy';
import { RaioXBacenPlusStrategy } from './RaioXBacenPlusStrategy';
import { RaioXProStrategy } from './RaioXProStrategy';
import { DadosCpfStrategy } from './DadosCpfStrategy';
import { DadosCnpjStrategy } from './DadosCnpjStrategy';
import type { QueryStrategyProps } from '@/types/query-strategies';
import React from 'react';

export const STRATEGIES: Record<string, React.ComponentType<QueryStrategyProps>> = {
  'SCR_BACEN_PREMIUM_SCORE': ScrBacenStrategy,
  'CREDIT_PREMIUM': CreditPremiumStrategy,
  'LOCALIZA_CPF_CNPJ': LocalizaStrategy,
  'COMPLETA_PLUS_BVS_ACOES_CPF': CompletaPlusCpfStrategy,
  'COMPLETA_PLUS_BVS_ACOES_CNPJ': CompletaPlusCnpjStrategy,
  'BOA_VISTA_ACERTA_CPF': BoaVistaAcertaCpfStrategy,
  'BVS_BASICA_PF': BvsBasicaPfStrategy,
  'BVS_BASICA_PJ': BvsBasicaPjStrategy,
  'MAX_BRASIL_AVANCADO_PF': MaxBrasilAvancadoPfStrategy,
  'MAX_BRASIL_AVANCADO_PJ': MaxBrasilAvancadoPjStrategy,
  'PROTESTO_NACIONAL': ProtestoNacionalStrategy,
  'QUOD_RESTRITIVO_ACOES_PF': QuodRestritivoAcoesPfStrategy,
  'QUOD_RESTRITIVO_ACOES_PJ': QuodRestritivoAcoesPjStrategy,
  'REALTIME_PREMIUM_SCORE_PF': RealtimePremiumScorePfStrategy,
  'REALTIME_PREMIUM_SCORE_PJ': RealtimePremiumScorePjStrategy,
  'SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF': SerasaCrednetPefinProtestoSpcPfStrategy,
  'REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF': RealtimeMaxSpcSerasaBvsProtestoPfStrategy,
  'REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ': RealtimeMaxSpcSerasaBvsProtestoPjStrategy,
  'MAX_BRASIL_SCORE_BVS_BASICA_PF': MaxBrasilScoreBvsBasicaPfStrategy,
  'MAX_BRASIL_SCORE_BVS_BASICA_PJ': MaxBrasilScoreBvsBasicaPjStrategy,
  'RATING_AVANCADO_PF': CommercialAnalysisPfStrategy,
  'RATING_AVANCADO_PJ': CommercialAnalysisPjStrategy,
  'DIVIDAS_MULTI_CPF_PRO': DividasMultiCpfProStrategy,
  'DIVIDAS_MULTI_CNPJ_PRO': DividasMultiCnpjProStrategy,
  'RAIO_X_CREDITO_RATING_SCR_PF': RaioXCreditoRatingScrStrategy,
  'RAIO_X_CREDITO_RATING_SCR_PJ': RaioXCreditoRatingScrStrategy,
  'PROTESTO_NACIONAL_PLUS': ProtestoNacionalPlusStrategy,
  'CADIN': CadinStrategy,
  'PROTESTO_DETALHADO_SP': ProtestoDetalhadoSpStrategy,
  'BOA_VISTA_ACERTA_ESSENCIAL_POSITIVO_PF': CommercialAnalysisPfStrategy,
  'BOA_VISTA_DEFINE_RISCO_POSITIVO_PJ': CommercialAnalysisPjStrategy,
  'RATING_BANCARIO_BOA_VISTA_PF': CommercialAnalysisPfStrategy,
  'RATING_BANCARIO_BOA_VISTA_PJ': CommercialAnalysisPjStrategy,
  'SERASA_PF': CommercialAnalysisPfStrategy,
  'SERASA_PJ': CommercialAnalysisPjStrategy,
  'SCR_PF': ScrEhmStrategy,
  'SCR_PJ': ScrEhmStrategy,
  'CCF': CcfStrategy,
  'RAIO_X_FINANCEIRO_RATING_SCR_PF': RaioXFinanceiroStrategy,
  'RAIO_X_FINANCEIRO_RATING_SCR_PJ': RaioXFinanceiroStrategy,
  'RAIO_X_PRO_PF': RaioXProStrategy,
  'RAIO_X_PRO_PJ': RaioXProStrategy,
  'RAIO_X_BACEN_PLUS_PF': RaioXBacenPlusStrategy,
  'RAIO_X_BACEN_PLUS_PJ': RaioXBacenPlusStrategy,
  'DADOS_CPF': DadosCpfStrategy,
  'DADOS_CNPJ': DadosCnpjStrategy,
};

export const getStrategyComponent = (code: string): React.ComponentType<QueryStrategyProps> => {
  return STRATEGIES[code] || DefaultStrategy;
};

export * from '@/types/query-strategies';
export * from './DefaultStrategy';
export * from './ScrBacenStrategy';
export * from './CreditPremiumStrategy';
export * from './LocalizaStrategy';
export * from './CompletaPlusCpfStrategy';
export * from './CompletaPlusCnpjStrategy';
export * from './BoaVistaAcertaCpfStrategy';
export * from './BvsBasicaPfStrategy';
export * from './BvsBasicaPjStrategy';
export * from './MaxBrasilAvancadoPfStrategy';
export * from './MaxBrasilAvancadoPjStrategy';
export * from './ProtestoNacionalStrategy';
export * from './QuodRestritivoAcoesPfStrategy';
export * from './QuodRestritivoAcoesPjStrategy';
export * from './RealtimePremiumScorePfStrategy';
export * from './RealtimePremiumScorePjStrategy';
export * from './SerasaCrednetPefinProtestoSpcPfStrategy';
export * from './RealtimeMaxSpcSerasaBvsProtestoPfStrategy';
export * from './RealtimeMaxSpcSerasaBvsProtestoPjStrategy';
export * from './MaxBrasilScoreBvsBasicaPfStrategy';
export * from './MaxBrasilScoreBvsBasicaPjStrategy';
export * from './DividasMultiCpfProStrategy';
export * from './DividasMultiCnpjProStrategy';
export * from './RaioXCreditoRatingScrStrategy';
export * from './ProtestoNacionalPlusStrategy';
export * from './CadinStrategy';
export * from './ProtestoDetalhadoSpStrategy';
export * from './CommercialAnalysisPfStrategy';
export * from './CommercialAnalysisPjStrategy';
export * from './ScrEhmStrategy';
export * from './CcfStrategy';
export * from './RaioXFinanceiroStrategy';
export * from './RaioXBacenPlusStrategy';
export * from './RaioXProStrategy';
export * from './DadosCpfStrategy';
export * from './DadosCnpjStrategy';
