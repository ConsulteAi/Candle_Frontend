'use server';

/**
 * Auth Server Actions
 * Actions para autenticação que rodam no servidor
 */

import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import type { LoginDTO, RegisterDTO, AuthResponse, User } from '@/types';
import { sanitizeUser } from '@/lib/utils';

// Estado de retorno genérico
export interface ActionState<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Action de Login
 */
export async function loginAction(
  credentials: LoginDTO
): Promise<ActionState<AuthResponse>> {
  try {
    const data = await AuthService.login(credentials);

    // Se o login retornou token mas não user, buscamos o user
    if (data.accessToken && !data.user) {
        try {
            const user = await AuthService.getMe(data.accessToken);
            data.user = user;
        } catch (error) {
            console.error('Failed to fetch user details after login:', error);
        }
    }

    // Sanitize user data
    if (data.user) {
      data.user = sanitizeUser(data.user);
    }

    // Set httpOnly cookies for authentication
    const cookieStore = await cookies();
    cookieStore.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours (access token expiry)
    });
    cookieStore.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days (refresh token expiry)
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Login error:', error);

    // Erros de validação do backend
    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    // Credenciais inválidas
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message;
      
      if (errorMessage === 'Conta suspensa') {
        return {
          success: false,
          error: 'Sua conta está suspensa. Entre em contato com o suporte para mais informações.',
        };
      }

      return {
        success: false,
        error: 'Email ou senha incorretos',
      };
    }

    // Erro genérico
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao fazer login. Tente novamente.',
    };
  }
}

/**
 * Action de Registro
 * Backend retorna apenas tokens, precisamos buscar o user separadamente
 */
export async function registerAction(
  userData: RegisterDTO
): Promise<ActionState<AuthResponse>> {
  try {
    // 1. Register returns only tokens
    const tokens = await AuthService.register(userData);

    // 2. Build AuthResponse with tokens
    const data: AuthResponse = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
    };

    // 3. Fetch user data using the new token
    try {
      const user = await AuthService.getMe(tokens.accessToken);
      data.user = sanitizeUser(user);
    } catch (error) {
      console.error('Failed to fetch user details after registration:', error);
      // Continue without user data - will be fetched on next page load
    }

    // 4. Set httpOnly cookies for authentication
    const cookieStore = await cookies();
    cookieStore.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresIn || 60 * 60 * 24, // Use backend expiry or default 24 hours
    });
    cookieStore.set('refreshToken', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Register error:', error);

    // Erros de validação do backend
    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    // Conflito (Email ou CPF/CNPJ já cadastrado)
    if (error.response?.status === 409) {
      return {
        success: false,
        error: error.response?.data?.message || 'Este email ou CPF/CNPJ já está cadastrado',
      };
    }

    // Erro genérico
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao criar conta. Tente novamente.',
    };
  }
}

/**
 * Action para buscar dados do usuário
 */
export async function getMeAction(): Promise<ActionState<User>> {
  try {
    const data = await AuthService.getMe();
    return {
      success: true,
      data: sanitizeUser(data),
    };
  } catch (error: any) {
    console.error('GetMe error:', error);
    return {
      success: false,
      error: 'Erro ao buscar dados do usuário',
    };
  }
}

/**
 * Action de Logout
 */
export async function logoutAction(): Promise<ActionState<void>> {
  try {
    await AuthService.logout();

    // Clear authentication cookies
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Logout error:', error);

    // Clear cookies even if API call fails
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    // Mesmo com erro, consideramos logout bem-sucedido no cliente
    return {
      success: true,
    };
  }
}

/**
 * Action para alterar senha
 */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<ActionState<void>> {
  try {
    await AuthService.changePassword(currentPassword, newPassword);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Change password error:', error);

    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Senha atual incorreta',
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao alterar senha',
    };
  }
}

/**
 * Action para atualizar perfil
 */
export async function updateProfileAction(
  data: Partial<User>
): Promise<ActionState<User>> {
  try {
    const updatedUser = await AuthService.updateProfile(data);
    return {
      success: true,
      data: sanitizeUser(updatedUser),
    };
  } catch (error: any) {
    console.error('Update profile error:', error);

    if (error.response?.status === 400 && error.response?.data?.errors) {
      return {
        success: false,
        fieldErrors: error.response.data.errors,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao atualizar perfil',
    };
  }
}

/**
 * Action para refresh de token
 * Atualiza os tokens e os cookies httpOnly
 */
export async function refreshTokenAction(
  refreshToken: string
): Promise<ActionState<{ accessToken: string; refreshToken: string }>> {
  try {
    const tokens = await AuthService.refreshToken(refreshToken);

    // Update httpOnly cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      data: tokens,
    };
  } catch (error: any) {
    console.error('Refresh token error:', error);

    // Clear cookies on refresh failure
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    return {
      success: false,
      error: 'Sessão expirada',
    };
  }
}
