'use client';

import { motion } from 'framer-motion';
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
    <motion.a
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com suporte no WhatsApp"
      className="group fixed right-4 z-50 isolate flex min-h-14 min-w-[252px] items-center justify-between gap-3 overflow-hidden rounded-[1.85rem] border border-white/35 bg-[linear-gradient(140deg,#2edd6f_0%,#26d164_45%,#19b955_100%)] px-5 py-3 text-white shadow-[0_22px_38px_-22px_rgba(0,0,0,0.85),0_10px_16px_-10px_rgba(15,118,56,0.85)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_16%_10%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_38%,rgba(255,255,255,0)_68%)]" />
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(105deg,transparent_26%,rgba(255,255,255,0.28)_44%,transparent_62%)]" />

      <span className="relative flex flex-col leading-none">
        <span className="font-body text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/90">
          Suporte por
        </span>
        <span className="font-display text-[2rem] font-black tracking-tight text-white [text-shadow:0_1px_0_rgba(0,0,0,0.08)] sm:text-[2.05rem]">
          WhatsApp
        </span>
      </span>

      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
        <MessageCircle className="h-5.5 w-5.5" strokeWidth={2.2} />
      </span>
    </motion.a>
  );
}
