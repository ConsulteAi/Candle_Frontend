'use client';

import { useCallback, useRef, useState } from 'react';
import { httpClient as api } from '@/lib/api/httpClient';
import { toast } from 'sonner';
import { FileImage, Loader2, Monitor, Trash2, UploadCloud } from 'lucide-react';

/** Espelha TenantLogoDto do backend. */
export interface UploadedLogo {
  logoUrl: string;
  logoPngUrl: string;
  faviconUrl: string;
}

interface LogoUploaderProps {
  /** URL da logo atual, exibida como preview. */
  value?: string;
  /** Favicon derivado, mostrado como prova de que foi gerado. */
  faviconUrl?: string;
  onUploaded: (logo: UploadedLogo) => void | Promise<void>;
  onRemoved: () => void | Promise<void>;
}

/** Precisa acompanhar MAX_LOGO_BYTES no TenantsController. */
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Formatos aceitos. SVG ficou de fora de propósito: é um documento
 * executável e servi-lo no nosso domínio abriria espaço para XSS.
 */
const ACCEPTED = ['image/png', 'image/jpeg'];

/**
 * Xadrez discreto atrás do preview. Logo costuma ter fundo transparente —
 * sobre branco puro, uma marca clara simplesmente desaparece e o usuário
 * acha que o upload falhou.
 */
const CHECKERBOARD = {
  backgroundImage:
    'linear-gradient(45deg, #eef2f6 25%, transparent 25%, transparent 75%, #eef2f6 75%),' +
    'linear-gradient(45deg, #eef2f6 25%, transparent 25%, transparent 75%, #eef2f6 75%)',
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 8px 8px',
};

export function LogoUploader({
  value,
  faviconUrl,
  onUploaded,
  onRemoved,
}: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = isUploading || isRemoving;

  const upload = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPTED.includes(file.type)) {
        setError('Formato não aceito. Envie a imagem em PNG ou JPEG.');
        return;
      }

      if (file.size > MAX_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        setError(`A imagem tem ${mb} MB. O limite é 2 MB.`);
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<UploadedLogo>(
          '/admin/tenants/logo',
          formData,
          {
            // O httpClient tem 'application/json' como default de instância.
            // Se ele vencer, o navegador não gera o boundary do multipart e o
            // multer não consegue parsear o corpo.
            headers: { 'Content-Type': undefined },
          },
        );

        await onUploaded(response.data);
        toast.success('Logo atualizada');
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            'Não foi possível enviar a imagem. Tente de novo.',
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUploaded],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (isBusy) return;

      const file = event.dataTransfer.files?.[0];
      if (file) void upload(file);
    },
    [isBusy, upload],
  );

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    setError(null);
    try {
      await api.delete('/admin/tenants/logo');
      await onRemoved();
      toast.success('Logo removida');
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Não foi possível remover a logo.',
      );
    } finally {
      setIsRemoving(false);
    }
  }, [onRemoved]);

  const openPicker = () => {
    if (!isBusy) inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border transition-colors duration-150 ${
          isDragging
            ? 'border-slate-900 bg-slate-900/[0.03]'
            : error
              ? 'border-red-200 bg-red-50/40'
              : 'border-slate-200 bg-white'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            <p className="text-sm text-slate-500">Processando a imagem</p>
          </div>
        ) : value ? (
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div
              className="flex h-24 w-full items-center justify-center rounded-xl border border-slate-100 sm:w-44"
              style={CHECKERBOARD}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Logotipo do ambiente"
                className="max-h-16 max-w-[85%] object-contain"
              />
            </div>

            <div className="flex flex-1 flex-col items-start gap-1">
              <p className="text-sm font-medium text-slate-900">
                Logo aplicada
              </p>
              <p className="text-xs text-slate-500">
                Arraste outra imagem aqui para substituir.
              </p>
              <div className="mt-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={openPicker}
                  disabled={isBusy}
                  className="whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50"
                >
                  Trocar imagem
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
                >
                  {isRemoving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Remover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openPicker}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl px-6 py-14 text-center transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <UploadCloud
              className={`h-6 w-6 transition-colors ${isDragging ? 'text-slate-900' : 'text-slate-400'}`}
            />
            <span className="text-sm font-medium text-slate-900">
              Arraste sua logo ou clique para escolher
            </span>
            <span className="text-xs text-slate-500">
              PNG ou JPEG · até 2 MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            // Permite reenviar o mesmo arquivo depois de um erro.
            event.target.value = '';
          }}
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}

      <Destinations logoUrl={value} faviconUrl={faviconUrl} />
    </div>
  );
}

/**
 * Os três destinos correspondem aos três derivados que o backend gera. A
 * lista existe para responder "o que aconteceu com a imagem que enviei?" sem
 * citar formato de arquivo — e para dar ao favicon o único lugar em que ele
 * pode ser visto de fato.
 */
function Destinations({
  logoUrl,
  faviconUrl,
}: {
  logoUrl?: string;
  faviconUrl?: string;
}) {
  if (!logoUrl) return null;

  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
        Onde sua logo aparece
      </p>
      <ul className="mt-2.5 space-y-2">
        <li className="flex items-center gap-2.5 text-sm text-slate-600">
          <Monitor className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          No topo do sistema
        </li>
        <li className="flex items-center gap-2.5 text-sm text-slate-600">
          <FileImage className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          Nos relatórios em PDF
        </li>
        <li className="flex items-center gap-2.5 text-sm text-slate-600">
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
          Na aba do navegador
        </li>
      </ul>
    </div>
  );
}
