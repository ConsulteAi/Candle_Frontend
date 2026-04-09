'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/components/layout/TenantThemeProvider';

const buildWhatsAppUrl = (rawPhone?: string): string | null => {
  if (!rawPhone) return null;

  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) return null;

  return `https://wa.me/${digits}`;
};

export function WhatsAppSupportButton() {
  const tenant = useTenant();
  const pathname = usePathname();

  const whatsappUrl = buildWhatsAppUrl(tenant.whatsappSupportPhone);

  if (!whatsappUrl) {
    return null;
  }

  if (pathname.includes('/backoffice')) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com suporte no WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-white shadow-xl shadow-black/20 transition-transform duration-200 hover:scale-[1.03] hover:bg-[#1fb858] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">Suporte por</span>
      <span className="text-lg font-black leading-none">WhatsApp</span>
      <MessageCircle className="h-5 w-5" />
    </a>
  );
}
