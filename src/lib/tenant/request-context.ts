import type { TenantConfig } from "./config";

/**
 * Propagação do tenant já resolvido no `proxy.ts` para o Server Component
 * (`app/[tenant]/layout.tsx`) via request header.
 *
 * POR QUÊ: antes, o tenant era resolvido DUAS vezes por request — uma no proxy e
 * outra no layout — cada uma com um fetch ao backend no caminho crítico. O proxy
 * já resolveu; basta carregar o resultado adiante.
 */

/** Header com o slug do tenant (sempre presente quando o proxy resolveu). */
export const TENANT_ID_HEADER = "x-tenant-id";
/** Header com a config completa serializada (percent-encoded JSON). */
export const TENANT_CONFIG_HEADER = "x-tenant-config";

/**
 * Teto conservador para o valor do header. O limite da Vercel é 16 KB para o
 * conjunto de headers; acima disso caímos para propagar só o id e o layout
 * resolve a config completa — lá o Data Cache do Next FUNCIONA.
 */
const MAX_CONFIG_HEADER_BYTES = 4096;

/** Normaliza o host: sem porta, minúsculo. Chave única de cache em todo o app. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return "localhost";
  return host.trim().toLowerCase().split(":")[0] || "localhost";
}

/**
 * Serializa a config para header. Retorna `null` se ficar grande demais.
 * `encodeURIComponent` garante um valor ASCII válido para header HTTP.
 */
export function encodeTenantConfigHeader(tenant: TenantConfig): string | null {
  try {
    const encoded = encodeURIComponent(JSON.stringify(tenant));
    if (encoded.length > MAX_CONFIG_HEADER_BYTES) return null;
    return encoded;
  } catch {
    return null;
  }
}

/** Desserializa o header. Retorna `null` se ausente ou inválido. */
export function decodeTenantConfigHeader(
  value: string | null | undefined,
): TenantConfig | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.id === "string" &&
      typeof parsed.name === "string" &&
      parsed.colors &&
      typeof parsed.colors.primary === "string"
    ) {
      return parsed as TenantConfig;
    }
    return null;
  } catch {
    return null;
  }
}
