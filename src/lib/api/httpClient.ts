/**
 * HTTP Client (Axios)
 * Cliente HTTP configurado com interceptors para autenticação
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { refreshTokenAction } from '@/actions/auth.actions';

// Base URL da API (do .env)
const baseURL = process.env.NEXT_PUBLIC_BASE_API_URL || 'http://localhost:4000';

// Criar instância do Axios
export const httpClient = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar loops infinitos no refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor
 * Injeta o access token em todas as requisições
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Trata erros 401 e faz refresh automático do token
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se erro 401 e ainda não tentou refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está fazendo refresh, adiciona na fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return httpClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        // Não tem refresh token, faz logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        // Tenta fazer refresh usando server action (atualiza cookies também)
        const result = await refreshTokenAction(refreshToken);

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Falha ao renovar token');
        }

        const { accessToken, refreshToken: newRefreshToken } = result.data;

        // Atualiza tokens no store
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        // Processa fila de requisições pendentes
        processQueue();

        // Refaz a requisição original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, faz logout
        processQueue(refreshError as Error);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
