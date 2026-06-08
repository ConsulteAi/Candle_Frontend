/**
 * HTTP Client (Axios)
 * Cliente HTTP para chamadas browser -> BFF interno (/api/bff)
 */

import axios, { AxiosError } from 'axios';
import { buildLoginRedirectPath, clearClientSession } from '@/lib/auth/client';
import { refreshTokenAction } from '@/actions/auth.actions';

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

// Serialise concurrent refresh attempts: only one in-flight at a time.
let clientRefreshPromise: Promise<boolean> | null = null;

async function tryClientRefresh(): Promise<boolean> {
  if (clientRefreshPromise) return clientRefreshPromise;

  clientRefreshPromise = refreshTokenAction()
    .then((result) => result.success)
    .catch(() => false)
    .finally(() => {
      clientRefreshPromise = null;
    });

  return clientRefreshPromise;
}

/**
 * Response Interceptor
 *
 * On 401: the BFF's server-side refresh may have failed to propagate new
 * cookies to the browser.  Try one more refresh via a server action — which
 * correctly sets browser cookies — then retry.  Only if that also fails do we
 * clear the session and redirect to login.
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config as any;

      if (!originalRequest._clientRetry) {
        originalRequest._clientRetry = true;

        const refreshed = await tryClientRefresh();

        if (refreshed) {
          return httpClient(originalRequest);
        }
      }

      await clearClientSession();
      if (typeof window !== 'undefined') {
        window.location.replace(buildLoginRedirectPath(window.location.pathname));
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
