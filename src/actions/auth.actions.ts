'use server';

/**
 * Auth Server Actions
 * Actions para autenticação que rodam no servidor
 */

import { cookies } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import type { LoginDTO, RegisterDTO, AuthResponse, User } from '@/types';
import { sanitizeUser } from '@/lib/utils';
import { invalidateCurrentUserCache } from '@/lib/auth';

const isProduction = process.env.NODE_ENV === 'production';

function decodeJwtSessionId(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf-8'));
    return payload.sessionId ?? 'sem-sessionId';
  } catch {
    return 'decode-error';
  }
}

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  priority: 'high' as const,
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
  priority: 'high' as const,
};

const generateCsrfToken = () => crypto.randomUUID().replace(/-/g, '');

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

    if (!data.accessToken) {
      throw new Error('Access token ausente na resposta de login');
    }

    if (!data.refreshToken) {
      throw new Error('Refresh token ausente na resposta de login');
    }

    const accessToken = data.accessToken;

    // Set httpOnly cookies FIRST so subsequent requests (getMe) use the fresh token
    const cookieStore = await cookies();
    cookieStore.set('accessToken', accessToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24,
    });
    cookieStore.set('refreshToken', data.refreshToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('csrfToken', generateCsrfToken(), {
      ...csrfCookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log(`[loginAction] cookies definidos: at_session=${decodeJwtSessionId(accessToken)} rt_session=${decodeJwtSessionId(data.refreshToken)} secure=${isProduction} NODE_ENV=${process.env.NODE_ENV}`);

    // Se o login não retornou user, buscamos após cookies já estarem setados
    if (!data.user) {
      try {
        const user = await AuthService.getMe(accessToken);
        data.user = user;
      } catch (error) {
        // ignore error
      }
    }

    // Sanitize user data
    if (data.user) {
      data.user = sanitizeUser(data.user);
    }

    // Invalidate cache so next request fetches fresh user
    invalidateCurrentUserCache();

    return {
      success: true,
      data: {
        user: data.user,
        tokenType: data.tokenType,
        expiresIn: data.expiresIn,
      },
    };
  } catch (error: any) {

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
      error: error.response?.data?.message || error.message || 'Erro ao fazer login. Tente novamente.',
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
      tokenType: tokens.tokenType,
      expiresIn: tokens.expiresIn,
    };

    // 3. Fetch user data using the new token
    try {
      const user = await AuthService.getMe(tokens.accessToken);
      data.user = sanitizeUser(user);
    } catch (error) {
      // Continue without user data - will be fetched on next page load
    }

    // 4. Set httpOnly cookies for authentication
    const cookieStore = await cookies();
    cookieStore.set('accessToken', tokens.accessToken, {
      ...authCookieOptions,
      maxAge: tokens.expiresIn || 60 * 60 * 24, // Use backend expiry or default 24 hours
    });
    cookieStore.set('refreshToken', tokens.refreshToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set('csrfToken', generateCsrfToken(), {
      ...csrfCookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      data: {
        user: data.user,
        tokenType: data.tokenType,
        expiresIn: data.expiresIn,
      },
    };
  } catch (error: any) {
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
    return {
      success: false,
      error: 'Erro ao buscar dados do usuário',
    };
  }
}

/**
 * Clears auth cookies server-side WITHOUT revoking the session in the backend.
 * Use this for implicit auth failures (expired tokens, concurrent refresh errors).
 * Only call logoutAction() for explicit user-initiated logout.
 */
export async function clearSessionCookiesAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('csrfToken');
  invalidateCurrentUserCache();
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
    cookieStore.delete('csrfToken');

    // Invalidate cache
    invalidateCurrentUserCache();

    return {
      success: true,
    };
  } catch (error: any) {
    // Clear cookies even if API call fails
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('csrfToken');

    // Invalidate cache
    invalidateCurrentUserCache();

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
 * Action para redefinir senha via token de reset
 */
export async function resetPasswordAction(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionState<void>> {
  try {
    await AuthService.resetPassword(token, newPassword, confirmPassword);
    return { success: true };
  } catch (error: any) {
    const msg = error.response?.data?.message;
    return {
      success: false,
      error: Array.isArray(msg) ? msg[0] : (msg || 'Erro ao redefinir senha. Tente novamente.'),
    };
  }
}

/**
 * Action para refresh de token
 * Atualiza os tokens e os cookies httpOnly
 */
export async function refreshTokenAction(
): Promise<ActionState<{ accessToken: string }>> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
      cookieStore.delete('csrfToken');
      return {
        success: false,
        error: 'Sessão expirada',
      };
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    // Update httpOnly cookies
    cookieStore.set('accessToken', tokens.accessToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24, // 24 hours
    });
    cookieStore.set('refreshToken', tokens.refreshToken, {
      ...authCookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    cookieStore.set('csrfToken', generateCsrfToken(), {
      ...csrfCookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      data: {
        accessToken: tokens.accessToken,
      },
    };
  } catch (error: any) {
    // Clear cookies on refresh failure
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.delete('csrfToken');

    return {
      success: false,
      error: 'Sessão expirada',
    };
  }
}
