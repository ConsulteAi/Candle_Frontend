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
      if (token && !isRefreshRequest(config.url)) {
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

// Response Interceptor: Handle 401 & Refresh Token
serverAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 Unauthorized and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest?.url)
    ) {
      originalRequest._retry = true;

      try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get("refreshToken")?.value;

        if (!refreshToken) {
          // No refresh token, clear session and throw
          try {
            cookieStore.delete("accessToken");
            cookieStore.delete("refreshToken");
            cookieStore.delete("csrfToken");
          } catch (e) {
            // Ignore cookie errors (e.g. inside Server Component)
          }
          return Promise.reject(error);
        }

        // Use the same axios instance so tenant and request-context headers are preserved.
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

        // Update Cookies
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
          // Access Token (24 hours)
          cookieStore.set("accessToken", newAccessToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24,
          });

          // Refresh Token (7 days)
          cookieStore.set("refreshToken", newRefreshToken, {
            ...cookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });

          cookieStore.set("csrfToken", generateCsrfToken(), {
            ...csrfCookieOptions,
            maxAge: 60 * 60 * 24 * 7,
          });
        } catch (e) {
          // Ignore cookie errors (e.g. inside Server Component)
          // The current request will still succeed due to header update below
        }

        // Update Authorization header and retry
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return serverAxios(originalRequest);
      } catch (refreshError) {
        // Clear session on failure
        try {
          const cookieStore = await cookies();
          cookieStore.delete("accessToken");
          cookieStore.delete("refreshToken");
          cookieStore.delete("csrfToken");
        } catch (e) {
          // ignore
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export const serverHttpClient = serverAxios;
