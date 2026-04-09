'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTenant } from '@/components/layout/TenantThemeProvider';

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M13.601 2.326A7.854 7.854 0 0 0 8.021.4C3.641.4.081 3.958.08 8.342a7.93 7.93 0 0 0 1.063 3.99L0 16l3.76-1.134a7.94 7.94 0 0 0 4.26 1.24h.003c4.38 0 7.94-3.558 7.94-7.94a7.88 7.88 0 0 0-2.362-5.84M8.024 14.84a6.57 6.57 0 0 1-3.35-.915l-.24-.142-2.23.67.74-2.17-.157-.247a6.56 6.56 0 0 1-1.007-3.49c.002-3.63 2.958-6.586 6.59-6.586a6.56 6.56 0 0 1 4.656 1.932 6.54 6.54 0 0 1 1.924 4.659c-.002 3.63-2.958 6.586-6.586 6.586m3.61-4.94c-.198-.1-1.17-.58-1.35-.647-.18-.067-.312-.1-.444.1-.132.198-.51.646-.624.78-.115.132-.23.149-.428.05-.198-.1-.838-.309-1.596-.985-.59-.523-.988-1.17-1.104-1.368-.115-.198-.012-.305.087-.404.09-.09.198-.23.297-.346.099-.115.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.1-.444-1.07-.608-1.466-.16-.386-.324-.333-.444-.34l-.378-.006a.73.73 0 0 0-.528.248c-.18.198-.69.676-.69 1.65s.707 1.916.806 2.048c.099.132 1.392 2.126 3.373 2.98.472.204.84.326 1.127.417.474.15.906.129 1.247.078.38-.057 1.17-.477 1.336-.938.165-.462.165-.859.116-.938-.05-.08-.182-.132-.38-.231" />
    </svg>
  );
}

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
      className="group fixed right-3 z-50 isolate flex h-10 w-fit max-w-[calc(100vw-1.5rem)] min-w-[178px] items-center justify-between gap-1.5 overflow-hidden whitespace-nowrap rounded-[1.15rem] border border-white/30 bg-[linear-gradient(140deg,#2edd6f_0%,#26d164_45%,#19b955_100%)] px-3 py-1.5 text-white shadow-[0_16px_24px_-18px_rgba(0,0,0,0.75),0_8px_14px_-10px_rgba(15,118,56,0.75)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700 sm:right-4 sm:h-11 sm:min-w-[196px] sm:gap-2 sm:rounded-[1.25rem] sm:px-3.5 sm:py-2"
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_120%_at_16%_10%,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.08)_38%,rgba(255,255,255,0)_68%)]" />
      <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[linear-gradient(105deg,transparent_26%,rgba(255,255,255,0.28)_44%,transparent_62%)]" />

      <span className="relative flex flex-col leading-none">
        <span className="font-body text-[8px] font-extrabold uppercase tracking-[0.12em] text-white/90 sm:text-[9px]">
          Suporte por
        </span>
        <span className="font-display text-[0.98rem] font-black tracking-tight text-white [text-shadow:0_1px_0_rgba(0,0,0,0.08)] sm:text-[1.15rem]">
          WhatsApp
        </span>
      </span>

      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center text-white/95 sm:h-6 sm:w-6">
        <WhatsAppLogo className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
      </span>
    </motion.a>
  );
}
