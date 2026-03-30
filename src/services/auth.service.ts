/**
 * Auth Service
 * Serviço de autenticação - comunicação com backend
 */

import axios from 'axios';
import { serverHttpClient } from '@/lib/api/serverHttpClient';
import { env } from '@/lib/env';
import type {
  AuthResponse,
  TokensResponse,
  LoginDTO,
  RegisterDTO,
  User,
} from '@/types';

export class AuthService {
  /**
   * Login de usuário
   */
  static async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await serverHttpClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Registro de novo usuário
   * Backend retorna apenas tokens, sem user
   */
  static async register(userData: RegisterDTO): Promise<TokensResponse> {
    const response = await serverHttpClient.post<TokensResponse>('/auth/register', userData);
    return response.data;
  }

  /**
   * Buscar dados do usuário autenticado
   */
  static async getMe(token?: string): Promise<User> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await serverHttpClient.get<User>('/auth/me', config);
    return response.data;
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${env.baseApiUrl}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    await serverHttpClient.post('/auth/logout');
  }

  /**
   * Alterar senha
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await serverHttpClient.patch('/users/me/password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await serverHttpClient.patch<User>('/users/me', data);
    return response.data;
  }

  /**
   * Redefinir senha via token de reset
   */
  static async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<void> {
    await serverHttpClient.post('/auth/reset-password', { token, newPassword, confirmPassword });
  }
}
