"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function revalidateTenantConfig() {
  // @ts-ignore - Lint errôneo alertando sobre os argumentos do revalidateTag
  revalidateTag("tenant-config");
  // NOTA: o cache in-memory do proxy (src/lib/tenant/runtime-cache.ts) não é
  // alcançado por revalidateTag — ele vive fora do runtime de cache do Next.
  // Mudanças de branding podem levar até FRESH_TTL_MS (60s) para propagar.
  // Purga a rota inteira para invalidar o cache HTML do Vercel CDN no Server Component (Sidebar)
  revalidatePath("/[tenant]", "layout");
}
