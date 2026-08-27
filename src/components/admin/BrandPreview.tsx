'use client';

import { useEffect, useState } from 'react';
import { Lock, MousePointer2 } from 'lucide-react';

interface BrandPreviewProps {
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  primaryForegroundColor: string;
}

/**
 * Janela de navegador com a marca do tenant aplicada.
 *
 * A moldura não é enfeite: a aba é o único lugar onde um favicon existe de
 * verdade. Sem ela, a tela promete gerar um ícone e nunca mostra o resultado
 * — que era exatamente o furo da versão anterior.
 */
export function BrandPreview({
  name,
  logoUrl,
  faviconUrl,
  primaryColor,
  primaryForegroundColor,
}: BrandPreviewProps) {
  const brandName = name?.trim() || 'Sua empresa';

  // O host do admin é o próprio domínio do tenant — usar o real deixa o
  // preview concreto em vez de genérico.
  const [host, setHost] = useState('app.suaempresa.com.br');
  useEffect(() => {
    if (typeof window !== 'undefined') setHost(window.location.host);
  }, []);

  const brandStyle = {
    '--brand': primaryColor,
    '--brand-ink': primaryForegroundColor,
  } as React.CSSProperties;

  return (
    <div style={brandStyle}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
        {/* Barra do navegador */}
        <div className="px-2.5 pt-2.5">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 gap-1.5 pl-0.5 pr-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>

            {/* A aba: favicon + nome do ambiente */}
            <div className="flex min-w-0 max-w-[190px] flex-1 items-center gap-2 rounded-t-lg bg-white px-3 py-2">
              {faviconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={faviconUrl}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                />
              ) : (
                <span className="h-3.5 w-3.5 shrink-0 rounded-sm bg-slate-200" />
              )}
              <span className="truncate font-display text-xs text-slate-700">
                {brandName}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white">
          {/* Barra de endereço */}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5">
              <Lock className="h-3 w-3 shrink-0 text-slate-400" />
              <span className="truncate text-[11px] text-slate-500">{host}</span>
            </div>
          </div>

          {/* Topo do sistema */}
          <div className="flex h-14 items-center gap-3 border-y border-slate-100 px-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-6 max-w-[130px] object-contain"
              />
            ) : (
              <span className="font-display text-sm font-semibold tracking-tight text-slate-800">
                {brandName}
              </span>
            )}
            <div className="flex-1" />
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold"
              style={{
                backgroundColor: 'hsl(var(--brand))',
                color: 'hsl(var(--brand-ink))',
              }}
            >
              {brandName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Corpo */}
          <div className="space-y-4 bg-slate-50/60 p-4">
            <div className="space-y-1.5">
              <div className="h-2 w-16 rounded bg-slate-200" />
              <div className="h-4 w-32 rounded bg-slate-300/70" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Consultas
                </div>
                <div
                  className="mt-1.5 font-display text-lg font-bold tracking-tight"
                  style={{ color: 'hsl(var(--brand))' }}
                >
                  1.284
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Saldo
                </div>
                <div className="mt-1.5 font-display text-lg font-bold tracking-tight text-slate-800">
                  R$ 4.320
                </div>
              </div>
            </div>

            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'hsl(var(--brand))',
                color: 'hsl(var(--brand-ink))',
              }}
            >
              <MousePointer2 className="h-3.5 w-3.5" />
              Nova consulta
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        A cor da marca pinta botões e destaques. Se o texto sobre ela estiver
        difícil de ler, ajuste a cor de contraste.
      </p>
    </div>
  );
}
