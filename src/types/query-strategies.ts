
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
  person: BasePerson & {
    revenueStatus: string;
    email: string;
    gender: string;
  };
  queries: Array<{ date: string; entity: string }>;
  veicular: any;
}

export interface CompletaPlusCnpjResult extends Omit<BaseStandardResult, 'addresses'> {
  totalQueries: number;
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
  syntheticProtests?: BaseSyntheticProtest[];
}

export interface RealtimeMaxSpcSerasaBvsProtestoPjResult extends BaseStandardResult {
  company: BaseCompany;
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
