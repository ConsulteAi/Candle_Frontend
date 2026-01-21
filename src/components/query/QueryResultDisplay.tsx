'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { QueryHistoryEntry } from '@/types/query';
import { QueryCategory } from '@/types/query';
import { CreditReportDisplay } from '@/components/credit/CreditReportDisplay';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QueryResultDisplayProps {
  query: QueryHistoryEntry;
  className?: string;
}

export function QueryResultDisplay({ query, className }: QueryResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  // For CREDIT category, use existing CreditReportDisplay
  if (query.queryType.category.includes(QueryCategory.CREDIT)) {
    return (
      <div className={className}>
        <CreditReportDisplay report={query.result} />
      </div>
    );
  }

  // Generic JSON display for other categories
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(query.result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(query.result, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consulta-${query.id}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-4', className)}>
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
          <code className="text-sm">{JSON.stringify(query.result, null, 2)}</code>
        </pre>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Protocolo</p>
          <p className="text-sm font-medium text-gray-900">{query.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Data</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date(query.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Valor</p>
          <p className="text-sm font-medium text-gray-900">R$ {query.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Cache</p>
          <p className="text-sm font-medium text-gray-900">
            {query.isCached ? (
              <span className="text-green-600">Sim</span>
            ) : (
              <span className="text-gray-600">Não</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
