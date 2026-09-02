import type { Metadata } from "next";
import { Inter, Outfit, DM_Sans } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers";
import { getTenantByHost } from "@/lib/tenant/config";
import {
  TENANT_CONFIG_HEADER,
  decodeTenantConfigHeader,
  normalizeHost,
} from "@/lib/tenant/request-context";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
import { WhatsAppSupportButton } from "@/components/layout/WhatsAppSupportButton";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { headers } from "next/headers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/**
 * O `proxy.ts` já resolveu o tenant e propagou a config no header
 * `x-tenant-config`. Reusamos esse resultado em vez de fazer um segundo fetch
 * ao backend no caminho crítico do request.
 *
 * Fallback (header ausente/inválido, ou config grande demais para caber no
 * header): resolvemos aqui — e neste runtime o Data Cache do Next FUNCIONA,
 * além do cache in-memory de `getTenantByHost`.
 *
 * `generateMetadata` e `RootLayout` chamam esta função no mesmo request; a
 * leitura de header é barata e o caminho de fallback é deduplicado pelo cache.
 */
async function resolveTenant() {
  const headersList = await headers();

  const propagated = decodeTenantConfigHeader(
    headersList.get(TENANT_CONFIG_HEADER),
  );
  if (propagated) return propagated;

  const host = normalizeHost(headersList.get("host"));
  return getTenantByHost(host);
}

export async function generateMetadata(
  props: { params: Promise<{ tenant: string }> }
): Promise<Metadata> {
  const tenant = await resolveTenant();

  return {
    title: {
      template: `%s | ${tenant.name}`,
      default: tenant.name,
    },
    description: "Sistema inteligente de consultas de crédito e dados cadastrais.",
    icons: {
      icon: tenant.faviconUrl,
      shortcut: tenant.faviconUrl,
    },
  };
}

export default async function RootLayout(props: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await resolveTenant();

  return (
    <html lang="pt-BR" className={`${outfit.variable} ${dmSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <TenantThemeProvider tenant={tenant}>
          <AuthGuard>
            <Providers>
              {props.children}
              <WhatsAppSupportButton />
            </Providers>
          </AuthGuard>
        </TenantThemeProvider>
      </body>
    </html>
  );
}

