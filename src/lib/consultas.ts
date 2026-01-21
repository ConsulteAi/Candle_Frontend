import { QueryCategory, type QueryType } from "@/types/query";

export type TipoDocumento = "cpf" | "cnpj" | "ambos";

export interface Consulta {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  tipo: TipoDocumento;
  destaque?: boolean;
  icone: string;
}

export interface CategoriaConsulta {
  id: string;
  slug: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  consultas: Consulta[];
}

export const consultasCredito: Consulta[] = [
  {
    id: "1",
    slug: "avalie-credito-cpf",
    nome: "Avalie Crédito CPF",
    descricao: "Avaliação completa de crédito para pessoa física",
    tipo: "cpf",
    destaque: true,
    icone: "CreditCard",
  },
  {
    id: "2",
    slug: "credito-total-cenprot-cnpj",
    nome: "Crédito Total + Cenprot CNPJ",
    descricao: "Análise de crédito com dados Cenprot para empresas",
    tipo: "cnpj",
    icone: "Building2",
  },
  {
    id: "3",
    slug: "consulta-completa-premium",
    nome: "Consulta Completa Premium",
    descricao: "Relatório premium com todas as informações disponíveis",
    tipo: "ambos",
    destaque: true,
    icone: "Crown",
  },
  {
    id: "4",
    slug: "credito-total-cenprot-cpf",
    nome: "Crédito Total + Cenprot CPF",
    descricao: "Análise de crédito com dados Cenprot para pessoa física",
    tipo: "cpf",
    icone: "User",
  },
  {
    id: "5",
    slug: "dpa-cnpj-score",
    nome: "DPA CNPJ + Score",
    descricao: "Dados públicos agregados com score de crédito empresarial",
    tipo: "cnpj",
    icone: "BarChart3",
  },
  {
    id: "6",
    slug: "ser-bvs-score-cnpj",
    nome: "SER BVS + Score CNPJ",
    descricao: "Consulta SER Bureau com score para empresas",
    tipo: "cnpj",
    icone: "LineChart",
  },
  {
    id: "7",
    slug: "ser-bvs-score-cpf",
    nome: "SER BVS + Score CPF",
    descricao: "Consulta SER Bureau com score para pessoa física",
    tipo: "cpf",
    icone: "LineChart",
  },
  {
    id: "8",
    slug: "ser-crednet-cpf-cnpj",
    nome: "SER Crednet CPF / CNPJ",
    descricao: "Consulta Crednet para pessoa física ou jurídica",
    tipo: "ambos",
    icone: "Search",
  },
  {
    id: "9",
    slug: "ser-spc-score-cnpj",
    nome: "SER + SPC + Score CNPJ",
    descricao: "Consulta SER com dados SPC e score empresarial",
    tipo: "cnpj",
    icone: "ShieldCheck",
  },
  {
    id: "10",
    slug: "ser-prime-score",
    nome: "SER Prime + Score",
    descricao: "Consulta Prime com score de crédito avançado",
    tipo: "ambos",
    destaque: true,
    icone: "Zap",
  },
];

export const categorias: CategoriaConsulta[] = [
  {
    id: "credito",
    slug: "credito",
    nome: "Crédito",
    descricao: "Consultas de crédito, score e análise financeira",
    icone: "CreditCard",
    cor: "from-blue-600 to-cyan-500",
    consultas: consultasCredito,
  },
  {
    id: "veiculos",
    slug: "veiculos",
    nome: "Veículos",
    descricao: "Consultas de veículos, multas e documentação",
    icone: "Car",
    cor: "from-emerald-600 to-teal-500",
    consultas: [],
  },
  {
    id: "processos",
    slug: "processos",
    nome: "Processos",
    descricao: "Consultas judiciais e processos em andamento",
    icone: "Scale",
    cor: "from-violet-600 to-purple-500",
    consultas: [],
  },
  {
    id: "empresarial",
    slug: "empresarial",
    nome: "Empresarial",
    descricao: "Consultas de CNPJ, sócios e situação cadastral",
    icone: "Building",
    cor: "from-orange-600 to-amber-500",
    consultas: [],
  },
];

export function getConsultaBySlug(slug: string): Consulta | undefined {
  return consultasCredito.find((c) => c.slug === slug);
}

export function getCategoriaBySlug(slug: string): CategoriaConsulta | undefined {
  return categorias.find((c) => c.slug === slug);
}

// Adapter to convert legacy Consulta to QueryType
// Adapter to convert legacy Consulta to QueryType
export const queriesMock: QueryType[] = consultasCredito.map((c) => {
  let categories: QueryCategory[] = [QueryCategory.CREDIT];
  
  if (c.tipo === "cpf") {
    categories.push(QueryCategory.PERSON);
  } else if (c.tipo === "cnpj") {
    categories.push(QueryCategory.COMPANY);
  } else if (c.tipo === "ambos") {
    categories.push(QueryCategory.PERSON);
    categories.push(QueryCategory.COMPANY);
  }

  return {
    id: c.id,
    code: c.slug, // Mapping slug to code
    name: c.nome,
    description: c.descricao,
    category: categories,
    price: 19.90, // Mock price
    cachedPrice: 9.90, // Mock cached price
    cacheTtlMinutes: 30,
    isActive: true,
    providerId: "mock-provider",
    providerEndpoint: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
