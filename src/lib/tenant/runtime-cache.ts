/**
 * Cache in-memory (por instância) para a resolução de tenant.
 *
 * POR QUÊ: `getTenantByHost()` é chamado no `proxy.ts`, que roda no network
 * boundary da Vercel — ANTES do cache. O Data Cache do Next (`cache: "force-cache"`
 * + `next.tags`) NÃO tem efeito nesse runtime, então cada request batia no backend.
 * Um incidente de rede no backend derrubava a UX do site inteiro.
 *
 * Este cache resolve o problema sem dependência nova e sem provisionar recurso
 * na Vercel (Runtime Cache / Edge Config exigiriam isso):
 *  - TTL curto (60s) para respostas boas;
 *  - TTL bem curto (10s) para fallback, evitando martelar um backend fora do ar;
 *  - single-flight: requests concorrentes do mesmo host compartilham 1 fetch;
 *  - stale-on-error: se o backend cair, continuamos servindo o último valor bom.
 *
 * Limitação conhecida e aceita: `revalidateTag("tenant-config")` não alcança a
 * memória das instâncias de proxy, então uma mudança de branding pode levar até
 * `FRESH_TTL_MS` para aparecer.
 */

type CacheEntry<T> = {
  value: T;
  /** Momento em que o valor deixa de ser considerado fresco. */
  expiresAt: number;
  /** Indica que o valor é um fallback (backend indisponível / resposta ruim). */
  isFallback: boolean;
};

/** TTL de um valor resolvido com sucesso. */
export const FRESH_TTL_MS = 60_000;
/** TTL de um fallback — curto, para reconvergir rápido quando o backend voltar. */
export const FALLBACK_TTL_MS = 10_000;
/** Teto de entradas, para não crescer sem limite com hosts inválidos/scan. */
const MAX_ENTRIES = 200;

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

function evictIfNeeded() {
  if (store.size <= MAX_ENTRIES) return;
  // Evicção simples: remove a entrada mais antiga inserida (Map preserva ordem).
  const oldestKey = store.keys().next().value;
  if (oldestKey !== undefined) store.delete(oldestKey);
}

export type ResolveResult<T> = {
  value: T;
  /** true quando o valor não veio do backend (fallback / erro). */
  isFallback: boolean;
};

/**
 * Resolve `key` usando cache com TTL, single-flight e stale-on-error.
 */
export async function cachedResolve<T>(
  key: string,
  resolver: () => Promise<ResolveResult<T>>,
): Promise<T> {
  const now = Date.now();
  const cached = store.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const promise = (async () => {
    try {
      const { value, isFallback } = await resolver();

      // Backend indisponível: preferimos o último valor bom conhecido (stale)
      // a degradar a UX para o fallback genérico.
      if (isFallback && cached && !cached.isFallback) {
        store.set(key, {
          value: cached.value,
          expiresAt: Date.now() + FALLBACK_TTL_MS,
          isFallback: false,
        });
        return cached.value;
      }

      store.set(key, {
        value,
        expiresAt: Date.now() + (isFallback ? FALLBACK_TTL_MS : FRESH_TTL_MS),
        isFallback,
      });
      evictIfNeeded();
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/** Utilitário de teste/manutenção — limpa o cache da instância atual. */
export function clearTenantRuntimeCache() {
  store.clear();
  inFlight.clear();
}
