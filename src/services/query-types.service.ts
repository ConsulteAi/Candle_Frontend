/**
 * Query Types Service
 * Serviço para buscar tipos de consulta disponíveis
 */

import httpClient from '@/lib/api/httpClient';
import type { QueryType, QueryCategory } from '@/types/query';

export class QueryTypesService {
  /**
   * Buscar todos os tipos de consulta disponíveis (endpoint público)
   */
  static async getAllQueryTypes(): Promise<QueryType[]> {
    const response = await httpClient.get<QueryType[]>('/query-types');
    return response.data;
  }

  /**
   * Buscar query types de uma categoria específica
   */
  static async getQueryTypesByCategory(category: QueryCategory): Promise<QueryType[]> {
    const allTypes = await this.getAllQueryTypes();
    return allTypes.filter((qt) => qt.category === category && qt.isActive);
  }

  /**
   * Buscar um query type específico por código
   */
  static async getQueryTypeByCode(code: string): Promise<QueryType | null> {
    const allTypes = await this.getAllQueryTypes();
    return allTypes.find((qt) => qt.code === code && qt.isActive) || null;
  }

  /**
   * Contar query types por categoria
   */
  static async countByCategory(category: QueryCategory): Promise<number> {
    const types = await this.getQueryTypesByCategory(category);
    return types.length;
  }

  /**
   * Agrupar query types por categoria
   */
  static async groupByCategory(): Promise<Record<QueryCategory, QueryType[]>> {
    const allTypes = await this.getAllQueryTypes();

    const grouped = {} as Record<QueryCategory, QueryType[]>;

    allTypes.forEach((qt) => {
      if (qt.isActive) {
        if (!grouped[qt.category]) {
          grouped[qt.category] = [];
        }
        grouped[qt.category].push(qt);
      }
    });

    return grouped;
  }

  /**
   * Contar query types por categoria (endpoint otimizado)
   */
  static async getCountsByCategory(): Promise<Record<QueryCategory, number>> {
    const response = await httpClient.get<Record<QueryCategory, number>>('/query-types/counts-by-category');
    return response.data;
  }
}
