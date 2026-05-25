import { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";
import { serverHttpClient } from "@/lib/api/serverHttpClient";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RouteContext = {
  params: Promise<{ path?: string[] }> | { path?: string[] };
};

type AllowedRoute = {
  pattern: RegExp;
  methods: Method[];
};

const mutatingMethods = new Set<Method>(["POST", "PUT", "PATCH", "DELETE"]);

const allowedRoutes: AllowedRoute[] = [
  { pattern: /^\/query-types$/, methods: ["GET"] },
  { pattern: /^\/query-types\/counts-by-category$/, methods: ["GET"] },
  { pattern: /^\/queries\/[a-zA-Z0-9-]+\/pdf$/, methods: ["GET"] },
  { pattern: /^\/public\/tenants\/ui-config$/, methods: ["GET"] },

  { pattern: /^\/admin\/users$/, methods: ["GET"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+$/, methods: ["GET"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/queries$/, methods: ["GET"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/transactions$/, methods: ["GET"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/query-price-benefits$/, methods: ["GET"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/query-price-benefits\/[a-zA-Z0-9-]+$/, methods: ["PUT", "DELETE"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/adjust-balance$/, methods: ["POST"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/status$/, methods: ["PATCH"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/role$/, methods: ["PATCH"] },
  { pattern: /^\/admin\/users\/[a-zA-Z0-9-]+\/generate-password-reset$/, methods: ["POST"] },

  { pattern: /^\/admin\/providers$/, methods: ["GET", "POST"] },
  { pattern: /^\/admin\/providers\/[a-zA-Z0-9-]+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^\/admin\/providers\/[a-zA-Z0-9-]+\/toggle$/, methods: ["POST"] },
  { pattern: /^\/admin\/providers\/[a-zA-Z0-9-]+\/health$/, methods: ["GET"] },

  { pattern: /^\/admin\/query-types$/, methods: ["GET", "POST"] },
  { pattern: /^\/admin\/query-types\/[a-zA-Z0-9-]+$/, methods: ["GET", "PATCH"] },
  { pattern: /^\/admin\/query-types\/[a-zA-Z0-9-]+\/composition$/, methods: ["PATCH"] },
  { pattern: /^\/admin\/query-types\/[a-zA-Z0-9-]+\/toggle$/, methods: ["POST"] },

  { pattern: /^\/admin\/audit-events$/, methods: ["GET"] },
  { pattern: /^\/admin\/audit-events\/export$/, methods: ["GET"] },
  { pattern: /^\/admin\/audit-events\/resource\/[^/]+\/[^/]+$/, methods: ["GET"] },
  { pattern: /^\/admin\/audit-events\/[a-zA-Z0-9-]+$/, methods: ["GET"] },

  { pattern: /^\/admin\/tenants$/, methods: ["GET", "POST"] },
  { pattern: /^\/admin\/tenants\/[a-zA-Z0-9-]+$/, methods: ["PATCH", "DELETE"] },
  { pattern: /^\/admin\/tenants\/ui-settings$/, methods: ["PATCH"] },

  { pattern: /^\/api-tokens$/, methods: ["POST"] },
  { pattern: /^\/api-tokens\/[a-zA-Z0-9-]+$/, methods: ["PATCH", "DELETE"] },
];

const hopByHopResponseHeaders = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "content-length",
]);

const forwardedRequestHeaders = [
  "content-type",
  "accept",
  "accept-language",
  "if-none-match",
  "if-modified-since",
  "range",
] as const;

class InvalidJsonBodyError extends Error {
  constructor() {
    super("Invalid JSON body");
    this.name = "InvalidJsonBodyError";
  }
}

function pickRequestHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  for (const key of forwardedRequestHeaders) {
    const value = request.headers.get(key);
    if (value) {
      headers[key] = value;
    }
  }

  return headers;
}

function isTrustedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false;
  }

  try {
    const normalizedOrigin = new URL(origin).origin;
    return normalizedOrigin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function isAllowedRoute(pathname: string, method: Method): boolean {
  return allowedRoutes.some(
    (route) => route.pattern.test(pathname) && route.methods.includes(method),
  );
}

function hasValidCsrfToken(request: NextRequest): boolean {
  const csrfCookie = request.cookies.get("csrfToken")?.value;
  const csrfHeader = request.headers.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader) {
    return false;
  }

  return csrfCookie === csrfHeader;
}

function toBuffer(data: unknown): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }

  if (typeof data === "string") {
    return Buffer.from(data, "utf-8");
  }

  if (data == null) {
    return Buffer.alloc(0);
  }

  return Buffer.from(JSON.stringify(data), "utf-8");
}

async function parseRequestBody(request: NextRequest, method: Method): Promise<unknown> {
  if (method === "GET") {
    return undefined;
  }

  const rawBody = await request.arrayBuffer();
  if (rawBody.byteLength === 0) {
    return undefined;
  }

  const contentType = request.headers.get("content-type") || "";
  const rawBuffer = Buffer.from(rawBody);

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawBuffer.toString("utf-8"));
    } catch {
      throw new InvalidJsonBodyError();
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return rawBuffer.toString("utf-8");
  }

  return rawBuffer;
}

async function forward(request: NextRequest, context: RouteContext, method: Method) {
  const resolvedParams = await context.params;
  const pathSegments = resolvedParams.path || [];

  if (pathSegments.length === 0) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const targetPathname = `/${pathSegments.join("/")}`;

  if (!isAllowedRoute(targetPathname, method)) {
    return NextResponse.json({ error: "Route not allowed" }, { status: 404 });
  }

  if (mutatingMethods.has(method)) {
    if (!isTrustedOrigin(request)) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    if (!hasValidCsrfToken(request)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }
  }

  const targetPath = `${targetPathname}${request.nextUrl.search}`;

  try {
    const response = await serverHttpClient.request<ArrayBuffer>({
      method,
      url: targetPath,
      data: await parseRequestBody(request, method),
      headers: pickRequestHeaders(request),
      responseType: "arraybuffer",
      validateStatus: () => true,
    });

    const responseHeaders = new Headers();

    for (const [key, value] of Object.entries(response.headers || {})) {
      const normalizedKey = key.toLowerCase();
      if (hopByHopResponseHeaders.has(normalizedKey)) {
        continue;
      }

      if (Array.isArray(value)) {
        if (normalizedKey === "set-cookie") {
          for (const cookieValue of value) {
            responseHeaders.append(key, cookieValue);
          }
        } else {
          responseHeaders.set(key, value.join(", "));
        }
      } else if (typeof value === "string") {
        responseHeaders.set(key, value);
      }
    }

    if (response.status === 204 || response.status === 304) {
      return new NextResponse(null, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    const body = toBuffer(response.data);
    const contentType = (responseHeaders.get("content-type") || "").toLowerCase();

    if (contentType.includes("application/json")) {
      return new NextResponse(body.toString("utf-8"), {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(new Uint8Array(body), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    if (error instanceof InvalidJsonBodyError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(
        {
          error: "BFF proxy error",
          status: error.response.status,
        },
        { status: error.response.status },
      );
    }

    return NextResponse.json(
      { error: "BFF upstream unavailable" },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return forward(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return forward(request, context, "POST");
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PUT");
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return forward(request, context, "PATCH");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return forward(request, context, "DELETE");
}
