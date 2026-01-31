import { UserRole } from './auth';
import { BillingType, PaymentStatus } from './payment';

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
  period: 'day' | 'week' | 'month';
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
    healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
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
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
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

// --- Query Types Management ---

export interface QueryType {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string[];
  endpoint: string;
  providerCredential?: any;
  price: number;
  cost: number;
  cachedPrice: number;
  cacheTtlMinutes: number;
  isActive: boolean;
  providerId: string;
  providerName: string;
  providerIsActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    totalRevenue: number;
    cacheHitRate: number;
  };
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
  providerId: string;
  providerName: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'PROCESSING';
  cost: number;
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
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  timestamp: string;
  details?: any;
}

// --- Query Type DTOs ---

export interface CreateQueryTypeDto {
  code: string;
  name: string;
  description?: string;
  category: string[];
  endpoint?: string;
  price: number;
  cost: number;
  cachedPrice?: number;
  cacheTtlMinutes?: number;
  providerId: string;
}

export interface UpdateQueryTypeDto extends Partial<CreateQueryTypeDto> {}
