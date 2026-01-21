/**
 * Query Categories Configuration
 * Mapeamento de categorias para exibição no frontend
 */

import { QueryCategory, type CategoryConfig } from '@/types/query';

/**
 * Configuração de exibição para cada categoria
 */
export const CATEGORY_CONFIGS: Record<QueryCategory, CategoryConfig> = {
  [QueryCategory.CREDIT]: {
    category: QueryCategory.CREDIT,
    slug: 'credit',
    name: 'Crédito',
    description: 'Consultas de crédito, score e análise financeira',
    icon: 'CreditCard',
    enabled: true,
    color: 'blue',
  },
  [QueryCategory.VEHICLE]: {
    category: QueryCategory.VEHICLE,
    slug: 'vehicles',
    name: 'Veículos',
    description: 'Consultas de veículos, multas e documentação',
    icon: 'Car',
    enabled: false, // Em breve
    color: 'green',
  },
  [QueryCategory.COMPANY]: {
    category: QueryCategory.COMPANY,
    slug: 'company',
    name: 'Empresarial',
    description: 'Consultas de CNPJ, sócios e situação cadastral',
    icon: 'Building2',
    enabled: true, // Em breve
    color: 'purple',
  },
  [QueryCategory.OTHER]: {
    category: QueryCategory.OTHER,
    slug: 'other',
    name: 'Processos',
    description: 'Consultas judiciais e processos em andamento',
    icon: 'Scale',
    enabled: false, // Em breve
    color: 'orange',
  },
  [QueryCategory.PERSON]: {
    category: QueryCategory.PERSON,
    slug: 'person',
    name: 'Pessoa Física',
    description: 'Dados cadastrais e informações pessoais',
    icon: 'User',
    enabled: true,
    color: 'cyan',
  },
  [QueryCategory.PHONE]: {
    category: QueryCategory.PHONE,
    slug: 'phone',
    name: 'Telefone',
    description: 'Consultas de telefone e operadora',
    icon: 'Phone',
    enabled: false,
    color: 'pink',
  },
  [QueryCategory.ADDRESS]: {
    category: QueryCategory.ADDRESS,
    slug: 'address',
    name: 'Endereço',
    description: 'Consultas de CEP e endereços',
    icon: 'MapPin',
    enabled: false,
    color: 'indigo',
  },
};

/**
 * Retorna array de categorias ordenadas para exibição
 */
export function getOrderedCategories(): CategoryConfig[] {
  const order: QueryCategory[] = [
    // QueryCategory.CREDIT,
    // QueryCategory.VEHICLE,
    // QueryCategory.OTHER,
    QueryCategory.PERSON,
    QueryCategory.COMPANY,
    // QueryCategory.PHONE,
    // QueryCategory.ADDRESS,
  ];

  return order.map((cat) => CATEGORY_CONFIGS[cat]);
}

/**
 * Retorna apenas categorias habilitadas
 */
export function getEnabledCategories(): CategoryConfig[] {
  return getOrderedCategories().filter((cat) => cat.enabled);
}

/**
 * Busca configuração de categoria por slug
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return Object.values(CATEGORY_CONFIGS).find((cat) => cat.slug === slug);
}

/**
 * Busca configuração de categoria por enum
 */
export function getCategoryConfig(category: QueryCategory): CategoryConfig {
  return CATEGORY_CONFIGS[category];
}
