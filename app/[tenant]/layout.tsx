import type { Metadata } from "next";
import { Inter, Outfit, DM_Sans } from "next/font/google";
import "../globals.css";
import { Providers } from "./providers";
import { getTenantById } from "@/lib/tenant/config";
import { TenantThemeProvider } from "@/components/layout/TenantThemeProvider";

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

export async function generateMetadata(
  props: { params: Promise<{ tenant: string }> }
): Promise<Metadata> {
  const resolvedParams = await props.params;
  const tenant = await getTenantById(resolvedParams.tenant || 'candle');

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
  params: Promise<{ tenant: string }>;
}>) {
  const resolvedParams = await props.params;
  const tenant = await getTenantById(resolvedParams.tenant || 'candle');

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

