import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  QueryHistoryFilters,
  QueryHistoryResponse,
  QueryByIdResponse,
} from '@/types/query';

const QUERY_EXECUTION_TIMEOUT_MS = 90000;

export class QueryExecutionService {
  static async executeQuery(data: ExecuteQueryRequest): Promise<ExecuteQueryResponse> {
    const response = await serverHttpClient.post<ExecuteQueryResponse>(
      '/queries/execute',
      data,
      { timeout: QUERY_EXECUTION_TIMEOUT_MS },
    );

    return response.data;
  }

  static async getQueryHistory(
    page = 1,
    limit = 20,
    filters: QueryHistoryFilters = {},
  ): Promise<QueryHistoryResponse> {
    const response = await serverHttpClient.get<QueryHistoryResponse>('/queries', {
      params: { page, limit, ...filters },
    });
    return response.data;
  }

  static async getQueryById(id: string): Promise<QueryByIdResponse> {
    const response = await serverHttpClient.get<QueryByIdResponse>(`/queries/${id}`);
    return response.data;
  }
}
