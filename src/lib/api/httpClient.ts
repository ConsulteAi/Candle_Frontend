/**
 * HTTP Client (Axios)
 * Cliente HTTP para chamadas browser -> BFF interno (/api/bff)
 */

import axios, { AxiosError } from 'axios';
import { buildLoginRedirectPath, clearClientSession } from '@/lib/auth/client';

// Browser deve falar apenas com o BFF interno.
const baseURL = '/api/bff';

// Criar instância do Axios
export const httpClient = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getCookieValue = (name: string) => {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
};

httpClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toUpperCase();

  if (method !== 'GET') {
    const csrfToken = getCookieValue('csrfToken');
    if (csrfToken && config.headers) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

/**
 * Response Interceptor
 * Sessão inválida no BFF -> limpa estado local e redireciona para login
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearClientSession();
      if (typeof window !== 'undefined') {
        window.location.replace(buildLoginRedirectPath(window.location.pathname));
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
