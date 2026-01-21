/**
 * Auth Types
 * Tipos relacionados à autenticação e usuário
 */

export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  phone?: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
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
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}
