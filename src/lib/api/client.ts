/**
 * HTTP Client Abstraction
 * Implements Dependency Inversion Principle (SOLID)
 * Services depend on IHttpClient interface, not concrete implementation
 */

import { env } from "@/lib/env";
import {
  ApiError,
  NetworkError,
  createErrorFromResponse,
} from "./errors";

/**
 * HTTP Client Interface (Abstraction)
 * Allows for easy mocking and testing
 */
export interface IHttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

/**
 * Request Configuration Options
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

/**
 * Fetch-based HTTP Client Implementation
 * Concrete implementation of IHttpClient using native fetch API
 */
export class FetchHttpClient implements IHttpClient {
  constructor(private baseURL: string = env.baseApiUrl) {}

  /**
   * GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("GET", url, undefined, config);
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("POST", url, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>("PUT", url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>("DELETE", url, undefined, config);
  }

  /**
   * Generic request handler with error handling
   */
  private async request<T>(
    method: string,
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const fullUrl = this.buildUrl(url, config?.params);
    const headers = this.buildHeaders(config?.headers);

    const requestInit: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      // Optional timeout handling
      const controller = new AbortController();
      const timeoutId = config?.timeout
        ? setTimeout(() => controller.abort(), config.timeout)
        : null;

      const response = await fetch(fullUrl, {
        ...requestInit,
        signal: controller.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors (no internet, CORS, etc)
      if (error instanceof TypeError || error instanceof Error && error.name === "AbortError") {
        throw new NetworkError();
      }

      throw new ApiError("Erro desconhecido ao fazer requisição");
    }
  }

  /**
   * Handle HTTP response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Try to parse JSON response
    let body: unknown;
    try {
      const text = await response.text();
      body = text ? JSON.parse(text) : null;
    } catch {
      body = null;
    }

    // Check if response is successful
    if (!response.ok) {
      throw createErrorFromResponse(response.status, response.statusText, body);
    }

    return body as T;
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, string>): string {
    const fullUrl = `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const searchParams = new URLSearchParams(params);
    return `${fullUrl}?${searchParams.toString()}`;
  }

  /**
   * Build request headers
   */
  private buildHeaders(
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders,
    };
  }
}

/**
 * Singleton instance of HTTP client
 * Can be replaced with mock for testing
 */
export const httpClient: IHttpClient = new FetchHttpClient();

/**
 * Factory function to create HTTP client with custom base URL
 * Useful for testing or multiple API endpoints
 */
export function createHttpClient(baseURL: string): IHttpClient {
  return new FetchHttpClient(baseURL);
}
