'use client';

import { useState } from 'react';
import { getStrategyComponent } from './strategies';
import type { QueryHistoryEntry } from '@/types/query';
import { cn } from '@/lib/utils';
import { Card } from '@/design-system/ComponentsTailwind';
import { Button } from '@/components/ui/button';
import { Hash, Calendar, DollarSign, Copy, Check } from 'lucide-react';

interface QueryResultDisplayProps {
  query: QueryHistoryEntry;
  className?: string;
}

export function QueryResultDisplay({ query, className }: QueryResultDisplayProps) {
  const code = query.queryType?.code || 'DEFAULT';
  const StrategyComponent = getStrategyComponent(code);
  const [copied, setCopied] = useState(false);

  const handleCopyProtocol = () => {
    if (query.id) {
       navigator.clipboard.writeText(query.id);
       setCopied(true);
       setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <StrategyComponent data={query.result} queryId={query.id} />
      
      {/* Metadata Footer */}
      <Card className="p-0 border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
         <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
            
            {/* Protocolo Section */}
            <div className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-primary/10 dark:bg-primary/80/20 rounded-md">
                     <Hash className="w-3.5 h-3.5 text-primary dark:text-primary/50" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Consulta</span>
               </div>
               <div className="flex items-center gap-2 group">
                  <p className="text-sm font-mono font-medium text-gray-900 dark:text-white truncate" title={query.id}>
                     {query.id}
                  </p>
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                     onClick={handleCopyProtocol}
                  >
                     {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </Button>
               </div>
            </div>

            {/* Data Section */}
            <div className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                     <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data da Consulta</span>
               </div>
               <p className="text-sm font-medium text-gray-900 dark:text-white pl-1">
                  {query.createdAt ? new Date(query.createdAt).toLocaleString('pt-BR', {
                     day: '2-digit',
                     month: 'long',
                     year: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit'
                  }) : 'N/A'}
               </p>
            </div>

            {/* Valor Section */}
            <div className="p-4 flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-md">
                     <DollarSign className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Cobrado</span>
               </div>
               <p className="text-sm font-bold text-gray-900 dark:text-white pl-1">
                  R$ {query.price?.toFixed(2) || '0.00'}
               </p>
            </div>

         </div>
      </Card>
    </div>
  );
}
