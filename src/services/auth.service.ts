/**
 * Auth Service
 * Serviço de autenticação - comunicação com backend
 */

import httpClient from '@/lib/api/httpClient';
import type {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  User,
} from '@/types';

export class AuthService {
  /**
   * Login de usuário
   */
  static async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Registro de novo usuário
   */
  static async register(userData: RegisterDTO): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
  }

  /**
   * Buscar dados do usuário autenticado
   */
  static async getMe(token?: string): Promise<User> {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await httpClient.get<User>('/auth/me', config);
    return response.data;
  }

  /**
   * Refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await httpClient.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data;
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    await httpClient.post('/auth/logout');
  }

  /**
   * Alterar senha
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.patch('/users/me/password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await httpClient.patch<User>('/users/me', data);
    return response.data;
  }
}
