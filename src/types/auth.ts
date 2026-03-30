/**
 * Auth Types
 * Tipos relacionados à autenticação e usuário
 */

/**
 * User roles from backend
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MASTER = 'MASTER',
}

/**
 * User data returned from /auth/me
 */
export interface User {
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

/**
 * Response de tokens (usado em register e refresh)
 */
export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Response de autenticação (login pode incluir user)
 */
export interface AuthResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
  phone?: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
