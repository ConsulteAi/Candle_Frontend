import axios, { AxiosError } from "axios";
import { cookies, headers } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server-side HTTP Client
 * Used for Server Actions to communicate with Backend
 * Handles Cookies and Refresh Token automatically
 */

const serverAxios = axios.create({
  baseURL: env.baseApiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const isRefreshRequest = (url?: string) => {
  if (!url) return false;
  return url.includes("/auth/refresh");
};

const generateCsrfToken = () => crypto.randomUUID().replace(/-/g, "");

// ---------------------------------------------------------------------------
// Refresh-token mutex
//
// Multiple concurrent Server Actions (e.g. Promise.all) can all receive 401
// at the same time. Without coordination, every one of them would attempt a
// token refresh — burning the single-use refresh token and logging the user
// out.  The mutex ensures only the FIRST request actually refreshes; the rest
// queue up and receive the new access token once refresh is done.
// ---------------------------------------------------------------------------

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function enqueueRefreshWaiter(): Promise<string> {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject });
  });
}

function drainQueue(newAccessToken: string) {
  pendingQueue.forEach(({ resolve }) => resolve(newAccessToken));
  pendingQueue = [];
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach(({ reject }) => reject(err));
  pendingQueue = [];
}

// Request Interceptor: Add Access Token from Cookies & User-Agent & Tenant Domain
serverAxios.interceptors.request.use(async (config) => {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    const token = cookieStore.get("accessToken")?.value;
    const userAgent = headersList.get("user-agent");
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");

    // Extract host for multi-tenant resolution
    let currentDomain = headersList.get("host");
    if (currentDomain) {
      currentDomain = currentDomain.split(":")[0]; // localhost:3000 -> localhost
    }

    if (config.headers) {
      if (token && !isRefreshRequest(config.url) && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (userAgent) {
        config.headers["User-Agent"] = userAgent;
      }
      if (forwardedFor) {
        config.headers["X-Forwarded-For"] = forwardedFor;
      }
      if (realIp) {
        config.headers["X-Real-IP"] = realIp;
      }

      // Inject the Tenant Domain header for the backend
      config.headers["X-Tenant-Domain"] = currentDomain || "consultaai.net.br"; // Fallback
    }

  } catch (error) {
    // Ignore error if cookies/headers fail (e.g. static generation)
    console.warn("Could not access request context in serverHttpClient", error);
  }
  return config;
});

// Response Interceptor: Handle 401, 429 & Refresh Token
serverAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 429 Too Many Requests with exponential backoff retry
    if (error.response?.status === 429) {
      const maxRetries = 3;
      originalRequest._429RetryCount = originalRequest._429RetryCount || 0;

      if (originalRequest._429RetryCount < maxRetries) {
        originalRequest._429RetryCount++;

        // Exponential backoff: 1000ms, 2000ms, 4000ms
        const delay = 1000 * Math.pow(2, originalRequest._429RetryCount - 1);

        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[serverHttpClient] 429 received, retrying in ${delay}ms (attempt ${originalRequest._429RetryCount}/${maxRetries})`);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));

        return serverAxios(originalRequest);
      }
    }

    // If 401 Unauthorized and not a refresh request itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest?.url)
    ) {
      originalRequest._retry = true;

      // If another request is already refreshing, queue this one and wait
      if (isRefreshing) {
        try {
          const newToken = await enqueueRefreshWaiter();
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return serverAxios(originalRequest);
        } catch (queueErr) {
          return Promise.reject(queueErr);
        }
      }

      // This request is the one that will perform the refresh
      isRefreshing = true;

      try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
          try {
            cookieStore.delete("accessToken");
            cookieStore.delete("refreshToken");
            cookieStore.delete("csrfToken");
          } catch (e) {
            // Ignore cookie errors inside Server Components
          }
          rejectQueue(error);
          return Promise.reject(error);
        }

        const refreshResponse = await serverAxios.post<{
          accessToken: string;
          refreshToken: string;
        }>(
          "/auth/refresh",
          { refreshToken },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        if (!newAccessToken) {
          throw new Error("Refresh failed: No access token returned");
        }

        // Update cookies
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: "lax" as const,
          path: "/",
          priority: "high" as const,
        };

        const csrfCookieOptions = {
          httpOnly: false,
          secure: isProduction,
          sameSite: "lax" as const,
          path: "/",
          priority: "high" as const,
        };

        try {
          cookieStore.set("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24,
          });
          cookieStore.set("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });
          cookieStore.set("csrfToken", generateCsrfToken(), {
            ...csrfCookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });
        } catch (e) {
          // Ignore cookie errors — the retry below will succeed via header
        }

        // Wake up all queued requests with the new token
        drainQueue(newAccessToken);

        // Retry the original request that triggered the refresh
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return serverAxios(originalRequest);
      } catch (refreshError) {
        // Refresh failed — reject all queued requests and clear the session
        rejectQueue(refreshError);
        try {
          const cookieStore = await cookies();
          cookieStore.delete("accessToken");
          cookieStore.delete("refreshToken");
          cookieStore.delete("csrfToken");
        } catch (e) {
          // ignore
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const serverHttpClient = serverAxios;
