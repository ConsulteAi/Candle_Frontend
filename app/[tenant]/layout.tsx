import type { Metadata } from "next";
import { Inter, Outfit, DM_Sans } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers";
import { getTenantByHost } from "@/lib/tenant/config";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";
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

async function resolveTenant() {
  const headersList = await headers();
  const host = (headersList.get("host") || "localhost").split(":")[0];
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
          <Providers>{props.children}</Providers>
        </TenantThemeProvider>
      </body>
    </html>
  );
}

