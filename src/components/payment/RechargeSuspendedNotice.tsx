'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { QrCode, ArrowUpRight, Mail } from 'lucide-react';
import { useTenant } from '@/components/layout/TenantThemeProvider';

/**
 * Tela exibida em /recarregar quando o tenant está com a recarga automática
 * suspensa (Tenant.rechargeDisabled). Substitui a seleção de valor: não há
 * motivo para escolher um valor que não pode ser cobrado.
 *
 * A regra real é do backend — aqui a tela apenas mostra o estado e conduz o
 * usuário para o caminho manual, com o botão "Gerar PIX" visivelmente
 * desabilitado no lugar de sempre.
 */

const SUPPORT_MESSAGE = 'Olá! Quero recarregar meu saldo.';

/** 5562969989477 → +55 (62) 96998-9477 */
function formatPhone(digits: string): string {
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const local = digits.slice(4);

  if (!area || !local) return `+${digits}`;

  const head = local.slice(0, local.length - 4);
  const tail = local.slice(-4);

  return `+${country} (${area}) ${head}-${tail}`;
}

const STEPS = [
  {
    title: 'Chame o suporte no WhatsApp',
    detail: 'Diga o valor que você quer adicionar ao saldo.',
  },
  {
    title: 'Faça o PIX na chave que o suporte enviar',
    detail: 'A chave é informada na conversa — nunca por aqui.',
  },
  {
    title: 'Envie o comprovante',
    detail: 'O time confere e o saldo entra no seu cadastro.',
  },
];

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 8.021.4C3.641.4.081 3.958.08 8.342a7.93 7.93 0 0 0 1.063 3.99L0 16l3.76-1.134a7.94 7.94 0 0 0 4.26 1.24h.003c4.38 0 7.94-3.558 7.94-7.94a7.88 7.88 0 0 0-2.362-5.84M8.024 14.84a6.57 6.57 0 0 1-3.35-.915l-.24-.142-2.23.67.74-2.17-.157-.247a6.56 6.56 0 0 1-1.007-3.49c.002-3.63 2.958-6.586 6.59-6.586a6.56 6.56 0 0 1 4.656 1.932 6.54 6.54 0 0 1 1.924 4.659c-.002 3.63-2.958 6.586-6.586 6.586m3.61-4.94c-.198-.1-1.17-.58-1.35-.647-.18-.067-.312-.1-.444.1-.132.198-.51.646-.624.78-.115.132-.23.149-.428.05-.198-.1-.838-.309-1.596-.985-.59-.523-.988-1.17-1.104-1.368-.115-.198-.012-.305.087-.404.09-.09.198-.23.297-.346.099-.115.132-.198.198-.33.066-.132.033-.248-.017-.347-.05-.1-.444-1.07-.608-1.466-.16-.386-.324-.333-.444-.34l-.378-.006a.73.73 0 0 0-.528.248c-.18.198-.69.676-.69 1.65s.707 1.916.806 2.048c.099.132 1.392 2.126 3.373 2.98.472.204.84.326 1.127.417.474.15.906.129 1.247.078.38-.057 1.17-.477 1.336-.938.165-.462.165-.859.116-.938-.05-.08-.182-.132-.38-.231" />
    </svg>
  );
}

export function RechargeSuspendedNotice() {
  const tenant = useTenant();
  const reduceMotion = useReducedMotion();

  const phoneDigits = (tenant.whatsappSupportPhone || '').replace(/\D/g, '');
  const whatsappUrl = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`
    : null;
  const emailUrl = tenant.contactEmail
    ? `mailto:${tenant.contactEmail}?subject=${encodeURIComponent('Recarga de saldo')}`
    : null;

  const rise = (delay: number) =>
    reduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } }
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      aria-labelledby="recarga-suspensa-titulo"
      className="mx-auto w-full max-w-3xl"
    >
      {/* Faixa de status — a peça que dá o tom da tela inteira */}
      <motion.div
        {...rise(0)}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-t-2xl bg-slate-950 px-5 py-3.5 sm:px-7"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          {!reduceMotion && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
        </span>
        <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 sm:text-[11px]">
          Recarga automática · Suspensa
        </span>
        <span className="ml-auto font-body text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
          Consultas seguem normais
        </span>
      </motion.div>

      <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white px-5 pb-8 pt-8 shadow-xl shadow-slate-200/50 sm:px-7 sm:pb-10 sm:pt-10">
        <motion.div {...rise(0.05)}>
          <h1
            id="recarga-suspensa-titulo"
            className="max-w-xl font-display text-[2rem] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-[2.75rem]"
          >
            Sua recarga passa pelo suporte agora.
          </h1>
          <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-slate-500 sm:text-lg">
            As APIs de pagamento estão instáveis. Enquanto a recarga automática
            está suspensa, o time credita seu saldo na hora, pelo WhatsApp.
          </p>
        </motion.div>

        {/* Trilho desativado: o controle de sempre, à vista e desligado */}
        <motion.div
          {...rise(0.12)}
          className="mt-9 overflow-hidden rounded-xl border border-slate-200"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(148,163,184,0.10) 0px, rgba(148,163,184,0.10) 1px, transparent 1px, transparent 9px)',
          }}
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="font-display text-sm font-bold text-slate-500">
                  PIX automático
                </p>
                <p className="font-body text-xs text-slate-400">
                  Geração de QR Code e cobrança pelo sistema
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Indisponível durante a suspensão"
              className="h-11 shrink-0 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-6 font-display text-sm font-bold text-slate-400"
            >
              Gerar PIX
            </button>
          </div>
        </motion.div>

        {/* Trilho ativo */}
        <motion.div
          {...rise(0.18)}
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 sm:p-7"
        >
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700 sm:text-[11px]">
              Recarga pelo suporte · Disponível agora
            </p>
          </div>

          <ol className="mt-6 space-y-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-emerald-200"
                  />
                )}
                <span className="relative z-10 mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-white font-display text-[11px] font-black tabular-nums text-emerald-700 ring-1 ring-emerald-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-bold leading-snug text-slate-900">
                    {step.title}
                  </p>
                  <p className="mt-0.5 font-body text-sm leading-relaxed text-slate-500">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[linear-gradient(140deg,#2edd6f_0%,#26d164_45%,#19b955_100%)] px-6 font-display text-[15px] font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 active:translate-y-0"
              >
                <WhatsAppGlyph className="h-[18px] w-[18px]" />
                Falar com o suporte
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : emailUrl ? (
              <a
                href={emailUrl}
                className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-6 font-display text-[15px] font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <Mail className="h-[18px] w-[18px]" />
                Falar com o suporte
              </a>
            ) : (
              <p className="font-body text-sm text-slate-500">
                Fale com o suporte pelo canal de atendimento do seu contrato.
              </p>
            )}

            {phoneDigits && (
              <span className="font-body text-sm tabular-nums text-slate-500">
                {formatPhone(phoneDigits)}
              </span>
            )}
          </div>
        </motion.div>

        <motion.p
          {...rise(0.24)}
          className="mt-6 font-body text-xs leading-relaxed text-slate-400"
        >
          Um PIX gerado antes da suspensão continua válido e credita o saldo
          normalmente.
        </motion.p>
      </div>
    </section>
  );
}
