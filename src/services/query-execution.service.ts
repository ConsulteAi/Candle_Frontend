import { serverHttpClient } from '@/lib/api/serverHttpClient';
import type {
  ExecuteQueryRequest,
  ExecuteQueryResponse,
  QueryHistoryResponse,
  QueryByIdResponse,
} from '@/types/query';

export class QueryExecutionService {
  static async executeQuery(data: ExecuteQueryRequest): Promise<ExecuteQueryResponse> {
    const response = await serverHttpClient.post<ExecuteQueryResponse>('/queries/execute', data);
    return response.data;
  }

  static async getQueryHistory(page = 1, limit = 20): Promise<QueryHistoryResponse> {
    const response = await serverHttpClient.get<QueryHistoryResponse>('/queries', {
      params: { page, limit },
    });
    return response.data;
  }

  static async getQueryById(id: string): Promise<QueryByIdResponse> {
    const response = await serverHttpClient.get<QueryByIdResponse>(`/queries/${id}`);
    return response.data;
  }
}
