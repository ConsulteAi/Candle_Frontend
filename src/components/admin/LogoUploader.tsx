'use client';

import { useCallback, useRef, useState } from 'react';
import { httpClient as api } from '@/lib/api/httpClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Trash2, UploadCloud } from 'lucide-react';

/** Espelha TenantLogoDto do backend. */
export interface UploadedLogo {
  logoUrl: string;
  logoPngUrl: string;
  faviconUrl: string;
}

interface LogoUploaderProps {
  /** URL da logo atual, exibida como preview. */
  value?: string;
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

export function LogoUploader({ value, onUploaded, onRemoved }: LogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error('Formato inválido. Envie a logo em PNG ou JPEG.');
        return;
      }

      if (file.size > MAX_BYTES) {
        toast.error('Arquivo muito grande. O limite é 2 MB.');
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
        toast.success('Logo atualizada. O favicon foi gerado a partir dela.');
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || 'Não foi possível enviar a logo.',
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

      const file = event.dataTransfer.files?.[0];
      if (file) void upload(file);
    },
    [upload],
  );

  const handleRemove = useCallback(async () => {
    setIsRemoving(true);
    try {
      await api.delete('/admin/tenants/logo');
      await onRemoved();
      toast.success('Logo removida.');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Não foi possível remover a logo.',
      );
    } finally {
      setIsRemoving(false);
    }
  }, [onRemoved]);

  const isBusy = isUploading || isRemoving;

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar logotipo"
        aria-busy={isUploading}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (isBusy) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/70'
        } ${isBusy ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Processando a imagem...</p>
          </>
        ) : value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Logotipo atual"
              className="max-h-16 max-w-[200px] object-contain"
            />
            <p className="text-xs text-slate-500">
              Arraste um novo arquivo ou clique para substituir
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="h-7 w-7 text-slate-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">
                Arraste a logo aqui ou clique para selecionar
              </p>
              <p className="text-xs text-slate-500">PNG ou JPEG, até 2 MB</p>
            </div>
          </>
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

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          disabled={isBusy}
          className="text-slate-500 hover:text-red-600"
        >
          {isRemoving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          Remover logo
        </Button>
      )}
    </div>
  );
}
