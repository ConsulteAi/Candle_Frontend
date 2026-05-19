
export interface QueryStrategyProps<T = any> {
  data: T;
  queryId?: string;
}

// --- Shared Base Entities ---

export interface BasePerson {
  name: string;
  document: string;
  birthDate: string;
  status: string;
  motherName: string;
  gender?: string;
  email?: string;
  revenueStatus?: string;
}

export interface BaseCompany {
  cnpj: string;
  socialReason: string;
  fantasyName: string;
  foundationDate: string;
  status: string;
}

export interface BaseAddress {
  street: string;
  district: string;
  city: string;
  state: string;
  zip: string;
}

export interface BasePhone {
  areaCode: string;
  number: string;
  type: string;
}

export interface BaseAlert {
  title: string;
  description: string;
}

export interface BaseDebt {
  value: string;
  contract: string;
  origin: string;
  date: string;
  informant?: string;
  created_at?: string;
}

export interface BaseProtest {
  value: string;
  date: string;
  origin?: string;
  notary?: string;
  type?: string;
}

export interface BaseBadCheck {
  bankNumber: string;
  quantity: string;
  lastOccurrence: string;
}

export interface BaseSyntheticProtest {
  value: string;
  date: string;
  cartorio?: string;
  comarca?: string;
  uf?: string;
  credor?: string;
  cedente?: string;
  anuencia?: string | null;
}

export interface BasePartner {
  name: string;
  role: string;
  document: string;
}

export interface BaseLegalAction {
  type: string;
  quantity: string;
  value: string;
  date: string;
  origin: string;
  details: string;
}

// --- Base Result Interface ---

interface BaseStandardResult {
  protocol: string;
  pdf?: string;
  totalDebts: number;
  totalProtests: number;
  totalBadChecks?: number;
  debts: BaseDebt[];
  protests: BaseProtest[];
  badChecks?: BaseBadCheck[];
  alerts?: BaseAlert[];
  phones?: BasePhone[];
  addresses?: BaseAddress[];
}

// --- Specific Result Interfaces ---

// SCR Bacen (Unique structure)
export interface ScrBacenResult {
  protocol: string;
  document: string;
  documentType: string;
  consultationDateTime: string;
  pdf?: string;
  score: {
    value: number;
    band: string;
  };
  databaseDate: string;
  relationshipStartDate: string;
  institutionsCount: number;
  operationsCount: number;
  creditSummary: {
    creditToExpire: CreditSummaryItem;
    expiredCredit: CreditSummaryItem;
    creditLimit: CreditSummaryItem;
    loss: CreditSummaryItem;
  };
  operations: OperationItem[];
  hasRestrictions: boolean;
  totalRestrictiveValue: number;
}
interface CreditSummaryItem { description: string; value: number; percentage: number; }
interface OperationItem { modalityCode: string; modalityDescription: string; subModalityCode: string; subModalityDescription: string; totalValue: number; percentage: number; maturities: MaturityItem[]; }
interface MaturityItem { code: string; description: string; value: number; percentage: number; isRestrictive: boolean; }

// Localiza (Unique structure)
export interface LocalizaResult {
  protocol: string;
  pdf?: string;
  basicInfo: Omit<BasePerson, 'revenueStatus' | 'email'> & { gender: string };
  contact: {
    mainPhone: string;
    mobilePhones: string[];
    landlinePhones: string[];
    businessPhones: string[];
    emails: string[];
  };
  addresses: LocalizaAddressItem[];
  relations: {
    relatives: RelativeItem[];
    residents: any[];
    neighbors: any[];
    partners: any[];
  };
}
interface LocalizaAddressItem extends Omit<BaseAddress, 'zip'> { zipCode: string; number: string; complement: string; neighborhood: string; source: string; }
interface RelativeItem { name: string; document: string; type: string; relation: string; }

// Completa Plus
export interface CompletaPlusCpfResult extends BaseStandardResult {
  totalQueries: number;
  totalLegalActions?: number;
  person: BasePerson & {
    revenueStatus: string;
    email: string;
    gender: string;
  };
  score?: {
    value: string;
    class?: string;
    riskText?: string;
    informant?: string;
  };
  queries: Array<{ date: string; entity: string }>;
  legalActions?: BaseLegalAction[];
  veicular: any;
}

export interface CompletaPlusCnpjResult extends Omit<BaseStandardResult, 'addresses'> {
  totalQueries: number;
  totalLegalActions?: number;
  company: BaseCompany & {
    email: string;
    phone: string;
    address: BaseAddress;
  };
  score: {
    value: string;
    class: string;
    riskText: string;
  };
  queries: Array<{ date: string; entity: string; cityState: string }>;
  legalActions?: BaseLegalAction[];
}

// Boa Vista
export interface BoaVistaAcertaCpfResult extends BaseStandardResult {
  person: BasePerson;
  score: {
    value: string;
    class: string;
    risk: string;
  };
}

export interface BvsBasicaPfResult extends Omit<BaseStandardResult, 'addresses'> {
  person: BasePerson;
  address: BaseAddress;
}

export interface BvsBasicaPjResult extends Omit<BaseStandardResult, 'addresses'> {
  company: {
    cnpj: string;
    name: string;
    status: string;
    foundationDate: string;
  };
  address: BaseAddress;
}

// Max Brasil
export interface MaxBrasilAvancadoPfResult extends BaseStandardResult {
  person: BasePerson;
  score: {
    value: string;
    class: string;
    riskText: string;
  };
}

export interface MaxBrasilAvancadoPjResult extends BaseStandardResult {
  company: BaseCompany;
  score: {
    value: string;
    class: string;
    riskText: string;
  };
  partners: BasePartner[];
}

// Protesto Nacional (Unique Structure)
export interface ProtestoNacionalResult {
  protocol: string;
  pdf?: string;
  product: string;
  totalProtests: number;
  totalValue: string;
  protests: Array<{
    state: string;
    city: string;
    notary: string;
    date: string;
    value: string;
    creditor: string;
    assignor: string;
    address: string;
    phone: string;
  }>;
}

// Quod
export interface QuodRestritivoAcoesPfResult extends BaseStandardResult {
  totalLegalActions: number;
  person: BasePerson;
  legalActions: BaseLegalAction[];
}

export interface QuodRestritivoAcoesPjResult extends BaseStandardResult {
  totalLegalActions: number;
  company: BaseCompany;
  partners: BasePartner[];
  legalActions: BaseLegalAction[];
}

// Realtime Premium
export interface RealtimePremiumScorePfResult extends BaseStandardResult {
  person: BasePerson;
  score: {
    value: string;
    class: string;
    riskText: string;
    probability: string;
  };
}

export interface RealtimePremiumScorePjResult extends BaseStandardResult {
  company: BaseCompany;
  partners: BasePartner[];
  score: {
    value: string;
    class: string;
    riskText: string;
    probability: string;
  };
}

// Serasa Crednet
export interface SerasaCrednetPefinProtestoSpcPfResult extends BaseStandardResult {
  person: BasePerson;
  companyParticipations: Array<{
    cnpj: string;
    socialReason: string;
    participation: string;
  }>;
}

// Realtime MAX + Protesto
export interface RealtimeMaxSpcSerasaBvsProtestoPfResult extends BaseStandardResult {
  person: Omit<BasePerson, 'status'> & {
    status?: string;
    revenueStatus?: string;
  };
  score?: {
    value: string;
    class?: string;
    riskText?: string;
    informant?: string;
  };
  syntheticProtests?: BaseSyntheticProtest[];
}

export interface RealtimeMaxSpcSerasaBvsProtestoPjResult extends BaseStandardResult {
  company: BaseCompany;
  score?: {
    value: string;
    class?: string;
    riskText?: string;
    informant?: string;
  };
  syntheticProtests?: BaseSyntheticProtest[];
}

// Realtime MAX sem Protesto Sintetico
export interface MaxBrasilScoreBvsBasicaPfResult extends BaseStandardResult {
  person: Omit<BasePerson, 'status'> & {
    status?: string;
    revenueStatus?: string;
  };
}

export interface MaxBrasilScoreBvsBasicaPjResult extends BaseStandardResult {
  company: BaseCompany;
}

// Dividas Multi (EHM)
export interface DividasMultiFinancialSummary {
  // Compatibility field from provider aggregation. Avoid using as primary UI metric.
  totalDebts: number;
  totalScpcDebts: number;
  totalRefinPefinDebts: number;
  totalProtests: number;
  totalBadChecks: number;
  totalCadin: number;
  totalLegalActions: number;
  totalSerasaOccurrences: number;
}

export interface DividasMultiScpcDebt {
  occurrenceDate: string;
  debtorType: string;
  creditorName: string;
  value: string | number;
  city: string;
  state: string;
  contract: string;
  availabilityDate: string;
}

export interface DividasMultiRefinPefinDebt {
  date: string;
  value: string | number;
  origin: string;
  contract: string;
  informant: string;
  institutionDocument: string;
  originDocument: string;
  guarantor: string;
}

export interface DividasMultiProtest {
  date: string;
  value: string | number;
  city: string;
  state: string;
  origin: string;
  notary: string;
}

export interface DividasMultiBadCheck {
  bankNumber: string;
  quantity: string | number;
  lastOccurrence: string;
  branch: string;
  city: string;
  state: string;
  alinea: string;
}

export interface DividasMultiCadinItem {
  entity: string;
  unit: string;
  registrationNumber: string;
  registrationDate: string;
  value: string | number;
  state: string;
}

export interface DividasMultiSerasaSummary {
  firstOccurrenceDate: string;
  lastOccurrenceDate: string;
  totalOccurrences: number;
}

interface DividasMultiBaseResult {
  protocol: string;
  pdf?: string;
  financialSummary: DividasMultiFinancialSummary;
  scpcDebts: DividasMultiScpcDebt[];
  refinPefinDebts: DividasMultiRefinPefinDebt[];
  protests: DividasMultiProtest[];
  badChecks: DividasMultiBadCheck[];
  cadin: DividasMultiCadinItem[];
  legalActions: Array<Record<string, unknown>>;
  serasaSummary?: DividasMultiSerasaSummary;
  rawSections: {
    serasa?: Record<string, unknown>;
    siccf?: Record<string, unknown>;
  };
}

export interface DividasMultiCpfProResult extends DividasMultiBaseResult {
  person: Pick<BasePerson, 'name' | 'document' | 'birthDate' | 'motherName'>;
  score?: {
    value: string;
    class?: string;
    riskText?: string;
  };
}

export interface DividasMultiCnpjProResult extends DividasMultiBaseResult {
  company: Pick<BaseCompany, 'cnpj' | 'socialReason'>;
  score?: {
    value: string;
    class?: string;
    riskText?: string;
  };
}

// Raio X Credito Rating SCR
export interface RaioXMarketRestrictionsSummary {
  totalScpcDebts?: number;
  totalRefinPefinDebts?: number;
  totalProtests?: number;
  totalCadin?: number;
}

export interface RaioXMarketRestrictions {
  summary?: RaioXMarketRestrictionsSummary;
}

export interface RaioXCreditoRatingScrResult extends ScrBacenResult {
  person?: Pick<BasePerson, 'name' | 'document'>;
  company?: Pick<BaseCompany, 'socialReason' | 'cnpj'>;
  marketRestrictions?: RaioXMarketRestrictions;
  marketRestrictionsUnavailable?: boolean;
  marketRestrictionsMessage?: string;
}

// Protesto Nacional Plus
export interface ProtestoNacionalPlusRawItem {
  document?: string;
  protestDate?: string;
  date?: string;
  dueDate?: string;
  value?: string | number;
  city?: string;
  state?: string;
  notaryNumber?: string;
  notaryName?: string;
  presenterName?: string;
  assignorName?: string;
  hasConsent?: boolean;
  hasRenegotiation?: boolean;
  key?: string;
}

export interface ProtestoNacionalPlusItem extends ProtestoNacionalPlusRawItem {
  rawData?: ProtestoNacionalPlusRawItem;
}

export interface ProtestoNacionalPlusResult {
  protocol: string;
  pdf?: string;
  status?: string;
  document?: string;
  consultedAt?: string;
  totalProtests?: number;
  messages?: string[];
  protests?: ProtestoNacionalPlusItem[];
}

// CADIN
export interface CadinSummary {
  name?: string;
  document?: string;
  personType?: string;
  totalDebts?: number;
  totalValue?: string | number;
}

export interface CadinEntry {
  document?: string;
  name?: string;
  entity?: string;
  unit?: string;
  registrationNumber?: string;
  registrationDate?: string;
  state?: string;
  value?: string | number;
}

export interface CadinResult {
  protocol: string;
  pdf?: string;
  summary?: CadinSummary;
  cadin?: CadinEntry[];
}

// Protesto Detalhado SP
export interface ProtestoDetalhadoSpTitle {
  document?: string;
  protestDate?: string;
  dueDate?: string;
  city?: string;
  state?: string;
  notaryNumber?: string;
  notaryName?: string;
  value?: string | number;
}

export interface ProtestoDetalhadoSpNotary {
  notaryNumber?: string;
  notaryName?: string;
  city?: string;
  state?: string;
  phone?: string;
  whatsapp?: string;
  totalProtests?: number;
  titles?: ProtestoDetalhadoSpTitle[];
}

export interface ProtestoDetalhadoSpResult {
  protocol: string;
  pdf?: string;
  document?: string;
  consultedAt?: string;
  elapsedTime?: string;
  totalProtests?: number;
  protests?: ProtestoDetalhadoSpTitle[];
  notaries?: ProtestoDetalhadoSpNotary[];
}

// Analise Comercial (PF/PJ)
export interface CommercialAnalysisFinancialSummary {
  totalDebts?: number;
  totalProtests?: number;
  totalQueries?: number;
  totalScpcDebts?: number;
  totalRefinPefinDebts?: number;
  totalLegalActions?: number;
}

export interface CommercialAnalysisDebt {
  date?: string;
  origin?: string;
  contract?: string;
  value?: string | number;
  creditor?: string;
  currency?: string;
  modality?: string;
  debtorType?: string;
  inclusionDate?: string;
  registryType?: string;
  originalValue?: string | number;
  updatedValue?: string | number;
}

export interface CommercialAnalysisProtest {
  date?: string;
  origin?: string;
  notary?: string;
  notaryName?: string;
  value?: string | number;
}

export interface CommercialAnalysisQuery {
  date?: string;
  entity?: string;
  cityState?: string;
}

export interface CommercialAnalysisSerasaDebt {
  creditor?: string;
  dueDate?: string;
  type?: string;
  contract?: string;
  inclusionDate?: string;
  value?: string | number;
}

export interface CommercialAnalysisCreditLimitSuggestion {
  model?: string;
  name?: string;
  text?: string;
  amount?: string | number;
  value?: string | number;
}

export interface CommercialAnalysisScore {
  value?: string | number;
  riskText?: string;
  risk?: string;
  nomeScore?: string;
  tipoScore?: string;
  modeloPlano?: string;
  textoExplicativo?: string;
  classificacaoCor?: string;
}

export interface CommercialAnalysisDecision {
  status?: string;
}

export interface CommercialAnalysisLegalAction {
  type?: string;
  value?: string | number;
  date?: string;
  origin?: string;
  details?: string;
  processo?: string;
  autor?: string;
  vara?: string;
}

export interface CommercialAnalysisDebitSummary {
  valorAcumulado?: string | number;
  dataMaiorDebito?: string;
  valorMaiorDebito?: string | number;
  dataPrimeiroDebito?: string;
  totalDebitosDevedor?: number;
  valorPrimeiroDebito?: string | number;
}

export interface CommercialAnalysisProtestSummary {
  quantidade?: number;
  ultimaData?: string;
  valorTotal?: string | number;
  primeiraData?: string;
}

export interface CommercialAnalysisPainelNotaItem {
  nota?: string;
  label?: string;
}

export interface CommercialAnalysisPainelNotaComportamento {
  notaFaturaEmAtraso?: CommercialAnalysisPainelNotaItem;
  notaContratosRecentes?: CommercialAnalysisPainelNotaItem;
  notaAdiantamentoDePagamento?: CommercialAnalysisPainelNotaItem;
}

export interface CommercialAnalysisPainelMaturidade {
  txtTempoExperiencia?: string;
  datContratoMaisAntigo?: string;
  mesesContratoMaisAntigo?: number;
}

export interface CommercialAnalysisPainelPontuacaoPeriodo {
  label?: string;
  valor?: string;
}

export interface CommercialAnalysisPainelPontuacaoCategoria {
  blocoLabel?: string;
  periodos?: CommercialAnalysisPainelPontuacaoPeriodo[];
}

export interface CommercialAnalysisPainelPontuacao {
  operacoesParceladas?: CommercialAnalysisPainelPontuacaoCategoria;
  servicosContinuados?: CommercialAnalysisPainelPontuacaoCategoria;
  cartaoCreditoChequeOutrosRotativos?: CommercialAnalysisPainelPontuacaoCategoria;
}

interface CommercialAnalysisBaseResult {
  protocol: string;
  pdf?: string;
  financialSummary?: CommercialAnalysisFinancialSummary;
  score?: CommercialAnalysisScore;
  decision?: CommercialAnalysisDecision;
  creditLimitSuggestion?: CommercialAnalysisCreditLimitSuggestion;
  debts?: CommercialAnalysisDebt[];
  protests?: CommercialAnalysisProtest[];
  queries?: CommercialAnalysisQuery[];
  serasaDebts?: CommercialAnalysisSerasaDebt[];
  legalActions?: CommercialAnalysisLegalAction[];
  debitSummary?: CommercialAnalysisDebitSummary;
  protestSummary?: CommercialAnalysisProtestSummary;
  painelNotaComportamento?: CommercialAnalysisPainelNotaComportamento;
  painelMaturidadeCredito?: CommercialAnalysisPainelMaturidade;
  painelPontuacaoComprometimento?: CommercialAnalysisPainelPontuacao;
}

export interface CommercialAnalysisPfResult extends CommercialAnalysisBaseResult {
  person?: Pick<BasePerson, 'name' | 'document' | 'birthDate' | 'motherName' | 'status' | 'revenueStatus'> & {
    gender?: string;
    educationLevel?: string;
    rg?: string;
    orgaoEmissor?: string;
    estadoCivil?: string;
    tituloEleitor?: string;
    dataAtualizacao?: string;
    cidadeNascimento?: string;
    numeroDependentes?: number;
    obito?: boolean;
  };
}

export interface CommercialAnalysisPjResult extends CommercialAnalysisBaseResult {
  company?: Pick<BaseCompany, 'cnpj' | 'socialReason' | 'fantasyName' | 'foundationDate' | 'status'>;
}
