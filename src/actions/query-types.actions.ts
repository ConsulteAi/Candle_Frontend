'use server';

import { QueryTypesService } from '@/services/query-types.service';
import type { QueryType, QueryCategory } from '@/types/query';

export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAllQueryTypesAction(): Promise<ActionState<QueryType[]>> {
  try {
    const data = await QueryTypesService.getAllQueryTypes();
    return { success: true, data };
  } catch (error: any) {
    console.error('Get all query types error:', error);
    return { success: false, error: 'Erro ao buscar tipos de consulta' };
  }
}

export async function getQueryTypesByCategoryAction(
  category: QueryCategory
): Promise<ActionState<QueryType[]>> {
  try {
    const data = await QueryTypesService.getQueryTypesByCategory(category);
    return { success: true, data };
  } catch (error: any) {
    console.error('Get query types by category error:', error);
    return { success: false, error: 'Erro ao buscar consultas da categoria' };
  }
}

export async function getQueryTypeByCodeAction(
  code: string
): Promise<ActionState<QueryType | null>> {
  try {
    const data = await QueryTypesService.getQueryTypeByCode(code);
    return { success: true, data };
  } catch (error: any) {
    console.error('Get query type by code error:', error);
    return { success: false, error: 'Erro ao buscar tipo de consulta' };
  }
}

export async function groupByCategoryAction(): Promise<
  ActionState<Record<QueryCategory, QueryType[]>>
> {
  try {
    const data = await QueryTypesService.groupByCategory();
    return { success: true, data };
  } catch (error: any) {
    console.error('Group by category error:', error);
    return { success: false, error: 'Erro ao agrupar consultas' };
  }
}

export async function getCountsByCategoryAction(): Promise<
  ActionState<Record<QueryCategory, number>>
> {
  try {
    const data = await QueryTypesService.getCountsByCategory();
    return { success: true, data };
  } catch (error: any) {
    console.error('Get counts by category error:', error);
    return { success: false, error: 'Erro ao contar consultas por categoria' };
  }
}
