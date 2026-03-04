"use server";

import { revalidateTag, revalidatePath } from "next/cache";

export async function revalidateTenantConfig() {
  // @ts-ignore - Lint errôneo alertando sobre os argumentos do revalidateTag
  revalidateTag("tenant-config");
  // Purga a rota inteira para invalidar o cache HTML do Vercel CDN no Server Component (Sidebar)
  revalidatePath("/[tenant]", "layout");
}
