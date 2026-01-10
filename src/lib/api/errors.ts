/**
 * Custom Error Classes for API Operations
 * Follows best practices for error handling and type safety
 */

/**
 * Base API Error
 * All API-related errors extend from this class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Validation Error
 * Thrown when input validation fails (client-side)
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

/**
 * Network Error
 * Thrown when network request fails
 */
export class NetworkError extends ApiError {
  constructor(message: string = "Erro de conexão. Verifique sua internet.") {
    super(message, 0, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

/**
 * Not Found Error
 * Thrown when resource is not found (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Recurso não encontrado.") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

/**
 * Unauthorized Error
 * Thrown when authentication fails (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Não autorizado.") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/**
 * Server Error
 * Thrown when server returns 5xx error
 */
export class ServerError extends ApiError {
  constructor(message: string = "Erro no servidor. Tente novamente mais tarde.") {
    super(message, 500, "SERVER_ERROR");
    this.name = "ServerError";
  }
}

/**
 * Helper function to create appropriate error from HTTP response
 */
export function createErrorFromResponse(
  status: number,
  statusText: string,
  body?: unknown
): ApiError {
  const message = typeof body === "object" && body !== null && "message" in body
    ? String(body.message)
    : statusText;

  switch (status) {
    case 400:
      return new ValidationError(message, body);
    case 401:
      return new UnauthorizedError(message);
    case 404:
      return new NotFoundError(message);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new ApiError(message, status, "API_ERROR", body);
  }
}

/**
 * Type guard to check if error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
