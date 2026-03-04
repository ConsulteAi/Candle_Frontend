'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { QueryStrategyProps } from '@/types/query-strategies';
import { toast } from 'sonner';

export function DefaultStrategy({ data, queryId }: QueryStrategyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Não foi possível copiar o resultado.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta-${queryId || 'result'}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Resultado da Consulta</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar JSON
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Baixar JSON
          </Button>
        </div>
      </div>

      {/* JSON Display */}
      <div className="relative">
        <pre className="p-6 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto max-h-[600px] overflow-y-auto">
          <code className="text-sm">{JSON.stringify(data, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
