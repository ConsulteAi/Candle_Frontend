import { UserRole } from "./auth";
import { BillingType, PaymentStatus } from "./payment";
import type { QueryExecutionStatus } from "./query";

// --- Dashboard & Stats Types ---

export interface DashboardOverview {
  totalUsers: number;
  usersByStatus: {
    PENDING_VERIFICATION: number;
    ACTIVE: number;
    SUSPENDED: number;
    BANNED: number;
  };
  newUsersToday: number;
  newUsersThisMonth: number;
  totalBalanceInCirculation: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  totalQueries: number;
  queriesToday: number;
  queriesThisMonth: number;
  querySuccessRate: number;
  activeProviders: number;
  providersHealth: {
    healthy: number;
    unhealthy: number;
  };
  totalProfit: number;
  profitToday: number;
  profitThisMonth: number;
}

export interface DashboardQueries {
  totalQueries: number;
  queriesByStatus: {
    SUCCESS: number;
    FAILED: number;
    PENDING: number;
    PROCESSING: number;
  };
  cacheHitRate: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  topQueryTypes: Array<{
    id: string;
    code: string;
    name: string;
    totalQueries: number;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

export interface RevenueStats {
  period: "day" | "week" | "month";
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalTransactions: number;
  revenueByBillingType: {
    PIX: number;
    BOLETO: number;
    CREDIT_CARD: number;
  };
  revenueByDay: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface ProviderStats {
  summary: {
    totalProviders: number;
    activeProviders: number;
    healthyProviders: number;
    unhealthyProviders: number;
  };
  providers: Array<{
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    priority: number;
    avgResponseTime: number | null;
    successRate: number | null;
    lastHealthCheck: string | null;
    lastErrorAt: string | null;
    healthStatus: "healthy" | "degraded" | "unhealthy" | "unknown";
    queryTypesCount: number;
    queriesLast24h: number;
  }>;
}

// --- User Management Types ---

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  cpfCnpj: string;
  phone?: string;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "BANNED";
  role: UserRole;
  emailVerifiedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
  balance: {
    available: number;
  };
  stats?: {
    totalQueries: number;
    totalSpent: number;
    totalDeposits: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdjustBalanceDTO {
  amount: number;
  description: string;
}

export interface UserQueryPriceBenefit {
  id: string;
  userId: string;
  queryTypeId: string;
  sitePrice: number | null;
  apiPrice: number | null;
  queryType: {
    id: string;
    code: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpsertUserQueryPriceBenefitDTO {
  sitePrice?: number | null;
  apiPrice?: number | null;
}

// --- Query Types Management ---

export interface QueryType {
  id: string;
  kind?: 'QUERY_TYPE' | 'ENRICHMENT';
  code: string;
  name: string;
  description?: string;
  category: string[];
  endpoint?: string | null;
  providerCredential?: any;
  price: number;
  apiTokenPrice?: number | null;
  resellerPrice?: number | null;
  cost: number;
  cachedPrice?: number | null;
  cacheTtlMinutes?: number | null;
  isActive: boolean;
  providerId?: string | null;
  providerName?: string | null;
  providerIsActive?: boolean | null;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    totalRevenue: number;
    cacheHitRate: number;
  };
  composition?: QueryTypeComposition;
}

export interface QueryTypeCompositionEnrichment {
  id: string;
  enrichmentId: string;
  executionOrder: number;
  isActive: boolean;
  compositeQueryTypeId?: string;
  compositeQueryTypeCode?: string;
  compositeQueryTypeName?: string;
  enrichment?: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    price: number;
    cost: number;
    category: string[];
    semanticKey?: string | null;
    timeoutMs?: number | null;
    isActive: boolean;
    isVisible: boolean;
    candidates: Array<{
      id: string;
      queryTypeId: string;
      queryTypeCode: string;
      queryTypeName: string;
      priority: number;
      isActive: boolean;
    }>;
  };
}

export interface QueryTypeComposition {
  enrichments: QueryTypeCompositionEnrichment[];
}

export interface QueryTypeFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  providerId?: string;
  page?: number;
  limit?: number;
}

// --- Transaction Management ---

export interface AdminTransaction {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  idempotencyKey?: string;
  asaasId?: string;
  amount: number;
  netValue?: number;
  description: string;
  dueDate?: string;
  status: PaymentStatus;
  billingType: BillingType;
  invoiceUrl?: string;
  createdAt: string;
  confirmedAt?: string;
  canceledAt?: string;
  statusHistory?: Array<{
    id: string;
    fromStatus: string;
    toStatus: string;
    reason?: string;
    createdAt: string;
  }>;
}

export interface TransactionFilters {
  status?: string;
  billingType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// --- Paginated Response Generic ---

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// --- User Lists types ---

export interface AdminQuery {
  id: string;
  userId: string;
  queryType: {
    id: string;
    code: string;
    name: string;
  };
  input: string;
  providerId: string;
  providerName: string;
  status: QueryExecutionStatus;
  price: number;
  durationMs: number;
  createdAt: string;
  responseStatus?: number;
  cacheHit: boolean;
  errorMessage?: string;
  protocol?: string;
}

export interface AdminTransactionListQueryDto {
  userId: string;
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
}

export interface AdminQueryListQueryDto {
  userId: string;
  limit?: number;
  page?: number;
  status?: string;
  queryTypeCode?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminQueryListItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  queryTypeId: string;
  queryType: {
    id: string;
    code: string;
    name: string;
  };
  input: string;
  status: QueryExecutionStatus;
  price: number;
  isCached: boolean;
  requestOrigin: 'AUTHENTICATED_USER' | 'API_TOKEN' | null;
  isWhiteLabel: boolean;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AdminQueriesFilters {
  status?: string;
  userId?: string;
  queryTypeId?: string;
  input?: string;
  isCached?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// --- Provider Types ---

export interface Provider {
  id: string;
  code: string;
  name: string;
  description?: string;
  baseUrl: string;
  credentialsKey?: string;
  timeout: number;
  retryAttempts: number;
  isActive: boolean;
  priority: number;
  avgResponseTime: number | null;
  successRate: number | null;
  lastHealthCheck: string | null;
  lastErrorAt: string | null;
}

export interface CreateProviderDto {
  code: string;
  name: string;
  description?: string;
  baseUrl: string;
  credentialsKey?: string;
  timeout?: number;
  retryAttempts?: number;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateProviderDto extends Partial<CreateProviderDto> {}

export interface HealthCheckResponseDto {
  isHealthy: boolean;
  avgResponseTime?: number;
  successRate?: number;
  lastCheck?: string;
}

// --- Query Type DTOs ---

export interface CreateQueryTypeDto {
  code: string;
  name: string;
  description?: string;
  category: string[];
  endpoint?: string;
  price: number;
  apiTokenPrice?: number | null;
  resellerPrice?: number | null;
  cost: number;
  cachedPrice?: number;
  cacheTtlMinutes?: number;
  providerId: string;
}

export interface UpdateQueryTypeDto extends Partial<CreateQueryTypeDto> {}

// --- Tenant Management ---

export interface TenantUiSettings {
  name?: string;
  /** Derivado WebP da logo, exibido na interface. */
  logoUrl?: string;
  /** Derivado PNG da logo, consumido pelo PDF (o pdfmake não lê WebP). */
  logoPngUrl?: string;
  /** Favicon .ico, derivado automaticamente da logo enviada. */
  faviconUrl?: string;
  contactEmail?: string;
  whatsappSupportPhone?: string;
  colors?: {
    primary?: string;
    primaryForeground?: string;
  };
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  asaasApiKey: string;
  asaasApiUrl: string;
  asaasWebhookSecret: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId?: string | null;
  ownerName?: string;
  ownerEmail?: string;
  uiSettings?: TenantUiSettings;
  pdfShowLogo?: boolean;
  rechargeDisabled?: boolean;
  _count?: {
    users: number;
    providers: number;
    queryTypes: number;
  };
}

export interface CreateTenantDto {
  slug: string;
  name: string;
  asaasApiKey: string;
  asaasApiUrl?: string;
  asaasWebhookSecret: string;
  domain?: string;
  ownerId?: string;
}

export interface UpdateTenantDto {
  name?: string;
  asaasApiKey?: string;
  asaasApiUrl?: string;
  asaasWebhookSecret?: string;
  isActive?: boolean;
  domain?: string | null;
  ownerId?: string | null;
  pdfShowLogo?: boolean;
  rechargeDisabled?: boolean;
}

// --- API Tokens ---

export interface ApiToken {
  id: string;
  userId: string;
  userName: string;
  name: string;
  prefix: string;
  isActive: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface CreatedApiToken extends ApiToken {
  token: string;
}

export interface CreateApiTokenDto {
  userId: string;
  name: string;
  expiresAt?: string;
}

// --- Audit Events ---

export type AuditActorType = 'USER' | 'ADMIN' | 'SYSTEM';

export interface AuditEvent {
  id: string;
  createdAt: string;
  action: string;
  actorType: AuditActorType;
  resourceType: string;
  metadata: Record<string, unknown>;
  requestId: string | null;
  tenantId: string | null;
  actorUserId: string | null;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  method: string | null;
  route: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface AuditEventListResponse {
  data: AuditEvent[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditEventListFilters {
  action?: string;
  resourceType?: string;
  resourceId?: string;
  actorUserId?: string;
  requestId?: string;
  actorType?: AuditActorType;
  method?: string;
  route?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export type AuditEventExportFilters = Omit<AuditEventListFilters, 'page'>;
