import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type {
  AuditEvent,
  AuditEventListFilters,
  AuditEventListResponse,
  AuditEventExportFilters,
} from '@/types/admin';

const BASE = '/admin/audit-events';

function buildParams(
  filters: Record<string, string | number | undefined | null>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  return params;
}

export const AuditService = {
  listEvents: async (
    filters: AuditEventListFilters,
  ): Promise<AuditEventListResponse> => {
    const response = await serverHttpClient.get<AuditEventListResponse>(BASE, {
      params: filters,
    });
    return response.data;
  },

  getEventById: async (id: string): Promise<AuditEvent> => {
    const response = await serverHttpClient.get<AuditEvent>(`${BASE}/${id}`);
    return response.data;
  },

  getResourceTimeline: async (
    resourceType: string,
    resourceId: string,
    limit = 100,
  ): Promise<AuditEvent[]> => {
    const response = await serverHttpClient.get<AuditEvent[]>(
      `${BASE}/resource/${resourceType}/${resourceId}`,
      { params: { limit } },
    );
    return response.data;
  },

  buildExportUrl: (filters: AuditEventExportFilters): string => {
    const params = buildParams(
      filters as Record<string, string | number | undefined | null>,
    );
    const base =
      typeof window !== 'undefined'
        ? (process.env.NEXT_PUBLIC_BASE_API_URL ?? '')
        : '';
    return `${base}${BASE}/export?${params.toString()}`;
  },
};
