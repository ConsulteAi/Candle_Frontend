'use server';

import { AdminService } from '@/services/admin.service';
import type { 
  AdminUser, 
  DashboardOverview, 
  PaginatedResponse, 
  UserFilters,
  RevenueStats,
  ProviderStats,
  AdminTransaction,
  TransactionFilters,
  QueryType,
  QueryTypeFilters,
  DashboardQueries
} from '@/types/admin';
import type { ActionState } from './auth.actions';

export async function getDashboardOverviewAction(): Promise<ActionState<DashboardOverview>> {
  try {
    const data = await AdminService.getDashboardOverview();
    return { success: true, data };
  } catch (error: any) {
    console.error('getDashboardOverviewAction error:', error);
    return { success: false, error: 'Erro ao carregar dashboard' };
  }
}

import { redirect } from 'next/navigation';
import { isAxiosError } from 'axios';

export async function getUsersAction(filters: UserFilters): Promise<ActionState<PaginatedResponse<AdminUser>>> {
  try {
    const data = await AdminService.getUsers(filters);
    return { success: true, data };
  } catch (error: any) {
    if (isAxiosError(error) && error.response?.status === 401) {
      redirect('/auth/login');
    }
    console.error('getUsersAction error:', error);
    return { success: false, error: 'Erro ao listar usuários' };
  }
}

export async function getRevenueStatsAction(params?: { period?: string; days?: number }): Promise<ActionState<RevenueStats>> {
  try {
    const data = await AdminService.getRevenueStats(params);
    return { success: true, data };
  } catch (error: any) {
    console.error('getRevenueStatsAction error:', error);
    return { success: false, error: 'Erro ao carregar receita' };
  }
}

export async function getProviderStatsAction(): Promise<ActionState<ProviderStats>> {
  try {
      const data = await AdminService.getProviderStats();
      return { success: true, data };
  } catch (error: any) {
      console.error('getProviderStatsAction error:', error);
      return { success: false, error: 'Erro ao carregar status de providers' };
  }
}

export async function getDashboardQueriesAction(): Promise<ActionState<DashboardQueries>> {
  try {
    const data = await AdminService.getDashboardQueries();
    return { success: true, data };
  } catch (error: any) {
    console.error('getDashboardQueriesAction error:', error);
    return { success: false, error: 'Erro ao carregar estatísticas de consultas' };
  }
}

export async function getTransactionsAction(filters: TransactionFilters): Promise<ActionState<PaginatedResponse<AdminTransaction>>> {
  try {
    const data = await AdminService.getTransactions(filters);
    return { success: true, data };
  } catch (error: any) {
    console.error('getTransactionsAction error:', error);
    return { success: false, error: 'Erro ao listar transações' };
  }
}

export async function getQueryTypesAction(filters: QueryTypeFilters): Promise<ActionState<PaginatedResponse<QueryType>>> {
  try {
    const data = await AdminService.getQueryTypes(filters);
    return { success: true, data };
  } catch (error: any) {
    console.error('getQueryTypesAction error:', error);
    return { success: false, error: 'Erro ao listar tipos de consulta' };
  }
}

export async function toggleQueryTypeAction(id: string): Promise<ActionState<void>> {
  try {
    await AdminService.toggleQueryType(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Erro ao alterar status da consulta' };
  }
}
