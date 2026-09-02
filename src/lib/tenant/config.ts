import { cachedResolve, type ResolveResult } from "./runtime-cache";
import { normalizeHost } from "./request-context";

export interface TenantColors {
  primary: string; // e.g., '221.2 83.2% 53.3%'
  primaryForeground: string; // e.g., '210 40% 98%'
}

export interface TenantConfig {
  id: string; // e.g., 'candle', 'cliente-a'
  dbId?: string;
  domain: string; // e.g., 'candel.com.br', 'clientea.com'
  name: string; // e.g., 'ConsultaAi', 'Cliente A'
  logoUrl: string; // e.g., '/logo.png'
  faviconUrl: string; // e.g., '/favicon.ico'
  contactEmail?: string; // e.g., 'contato@empresa.com.br'
  whatsappSupportPhone?: string; // e.g., '5511999999999'
  /** Recarga automática via PIX suspensa — o suporte credita manualmente. */
  rechargeDisabled: boolean;
  colors: TenantColors;
}

function extractPhoneDigits(value?: string): string {
  if (!value) return "";
  return value.replace(/\D/g, "").trim();
}

// Default Configuration for the base product "Candle / ConsultaAi"
export const DEFAULT_TENANT: TenantConfig = {
  id: "candle",
  domain: "localhost", // Update for production
  name: "ConsultaAi",
  logoUrl: "/icon.png", // Fallback, will handle Search icon logic in component
  faviconUrl: "/icon.png",
  rechargeDisabled: false,
  colors: {
    primary: "221.2 83.2% 53.3%",
    primaryForeground: "210 40% 98%",
  },
};

/**
 * Timeout curto do fetch de configuração de tenant.
 * O fetch está no caminho crítico da resolução de tenant: o connect timeout
 * padrão do fetch nativo (undici) é de 10s e, num incidente de rede, isso vira
 * ~10s de TTFB antes do fallback. Com o cache in-memory (runtime-cache.ts) esse
 * timeout é pago raramente — só quando não há entrada fresca nem stale — então
 * 1,5s degrada rápido sem sacrificar a chance de uma resposta legítima.
 */
const TENANT_CONFIG_TIMEOUT_MS = 1500;

/** Distingue abort por timeout de outros erros de rede. */
function isAbortTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = (error as { name?: string }).name;
  return name === "TimeoutError" || name === "AbortError";
}

/**
 * Helper definition to parse API response to TenantConfig
 */
function parseTenantData(t: any, fallbackId: string): TenantConfig {
  if (!t) return DEFAULT_TENANT;

  const uiSettings = t.uiSettings || {};
  const colors = uiSettings.colors || {};
  const contactEmail =
    typeof uiSettings.contactEmail === "string"
      ? uiSettings.contactEmail.trim()
      : "";
  const whatsappSupportPhone =
    typeof uiSettings.whatsappSupportPhone === "string"
      ? extractPhoneDigits(uiSettings.whatsappSupportPhone)
      : "";

  return {
    id: t.slug || fallbackId, // Frontend ID is the backend SLUG, use fallback if not returned
    dbId: t.id || "",
    domain: t.domain || "",
    name: uiSettings.name || t.name || DEFAULT_TENANT.name,
    logoUrl: uiSettings.logoUrl || DEFAULT_TENANT.logoUrl,
    faviconUrl: uiSettings.faviconUrl || DEFAULT_TENANT.faviconUrl,
    contactEmail: contactEmail || undefined,
    whatsappSupportPhone: whatsappSupportPhone || undefined,
    rechargeDisabled: t.rechargeDisabled === true,
    colors: {
      primary: colors.primary || DEFAULT_TENANT.colors.primary,
      primaryForeground:
        colors.primaryForeground || DEFAULT_TENANT.colors.primaryForeground,
    },
  };
}

/**
 * Fetch a single tenant configuration from the dynamic backend API.
 * Retorna também `isFallback` para que o cache saiba distinguir resposta boa de
 * degradação (e possa servir stale em vez do fallback genérico).
 */
async function fetchTenantConfigResult(
  fallbackId: string,
): Promise<ResolveResult<TenantConfig>> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:4000";
    // Passamos o fallbackId (host original) no header x-tenant-domain
    // para que o backend Middleware resolva o tenant correto no SSR.
    // Usamos revalidateTag para limpar o cache de dados globalmente APENAS quando o Admin salva as configurações.
    // OBS: `next.tags`/`force-cache` só valem em Server Components/Route Handlers.
    // No `proxy.ts` quem cacheia é o `cachedResolve` (src/lib/tenant/runtime-cache.ts).
    const res = await fetch(`${apiUrl}/public/tenants/ui-config`, {
      headers: {
        "x-tenant-domain": fallbackId,
      },
      next: { tags: ["tenant-config"] },
      cache: "force-cache",
      signal: AbortSignal.timeout(TENANT_CONFIG_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.warn(`Failed to fetch tenant config`);
      return { value: DEFAULT_TENANT, isFallback: true };
    }

    const data = await res.json();
    return { value: parseTenantData(data, fallbackId), isFallback: false };
  } catch (error) {
    if (isAbortTimeoutError(error)) {
      console.warn(
        `[tenant-config] Timeout (${TENANT_CONFIG_TIMEOUT_MS}ms) ao buscar tenant config para "${fallbackId}". Usando cache stale ou DEFAULT_TENANT.`,
      );
    } else {
      console.error("Failed to fetch tenant from API:", error);
    }
    return { value: DEFAULT_TENANT, isFallback: true };
  }
}

async function fetchTenantConfig(fallbackId: string): Promise<TenantConfig> {
  const key = normalizeHost(fallbackId);
  return cachedResolve(key, () => fetchTenantConfigResult(key));
}

/**
 * Get tenant configuration based on the requested host
 */
export async function getTenantByHost(host: string): Promise<TenantConfig> {
  return fetchTenantConfig(host);
}

/**
 * Get tenant configuration by its ID (slug)
 */
export async function getTenantById(id: string): Promise<TenantConfig> {
  return fetchTenantConfig(id);
}
