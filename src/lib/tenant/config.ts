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
  contactEmail: string; // e.g., 'contato@empresa.com.br'
  colors: TenantColors;
}

// Default Configuration for the base product "Candle / ConsultaAi"
export const DEFAULT_TENANT: TenantConfig = {
  id: "candle",
  domain: "localhost", // Update for production
  name: "ConsultaAi",
  logoUrl: "/icon.png", // Fallback, will handle Search icon logic in component
  faviconUrl: "/icon.png",
  contactEmail: "contato@candle.com.br",
  colors: {
    primary: "221.2 83.2% 53.3%",
    primaryForeground: "210 40% 98%",
  },
};

/**
 * Helper definition to parse API response to TenantConfig
 */
function parseTenantData(t: any, fallbackId: string): TenantConfig {
  if (!t) return DEFAULT_TENANT;

  const uiSettings = t.uiSettings || {};
  const colors = uiSettings.colors || {};

  return {
    id: t.slug || fallbackId, // Frontend ID is the backend SLUG, use fallback if not returned
    dbId: t.id || "",
    domain: t.domain || "",
    name: uiSettings.name || t.name || DEFAULT_TENANT.name,
    logoUrl: uiSettings.logoUrl || DEFAULT_TENANT.logoUrl,
    faviconUrl: uiSettings.faviconUrl || DEFAULT_TENANT.faviconUrl,
    contactEmail: uiSettings.contactEmail || DEFAULT_TENANT.contactEmail,
    colors: {
      primary: colors.primary || DEFAULT_TENANT.colors.primary,
      primaryForeground:
        colors.primaryForeground || DEFAULT_TENANT.colors.primaryForeground,
    },
  };
}

/**
 * Fetch a single tenant configuration from the dynamic backend API
 */
async function fetchTenantConfig(fallbackId: string): Promise<TenantConfig> {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:4000";
    // Em modo dinâmico (com painel de admin que ajusta UI), cache agressivo no fetch
    // gerava dados desatualizados. O backend já faz cache no Redis e invalida no save.
    const res = await fetch(`${apiUrl}/public/tenants/ui-config`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Failed to fetch tenant config`);
      return DEFAULT_TENANT;
    }

    const data = await res.json();
    return parseTenantData(data, fallbackId);
  } catch (error) {
    console.error("Failed to fetch tenant from API:", error);
    return DEFAULT_TENANT;
  }
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
