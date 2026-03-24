import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button, Badge } from '@/design-system/ComponentsTailwind';
import { cn } from '@/lib/utils';
import { downloadPdf, downloadBlob } from '@/lib/download';
import { httpClient } from '@/lib/api/httpClient';

interface StrategyHeaderProps {
  title: string;
  subtitle?: string;
  protocol?: string;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'error' | 'info' | 'outline' | 'primary';
  pdfUrl?: string;
  queryId?: string;
  children?: React.ReactNode;
  className?: string;
}

export function StrategyHeader({
  title,
  subtitle,
  protocol,
  status,
  statusVariant = 'primary',
  pdfUrl,
  queryId,
  children,
  className
}: StrategyHeaderProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  return (
    <div className={cn("flex justify-between items-start mb-6", className)}>
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
           {status && (
             <Badge variant={statusVariant}>
                {status}
             </Badge>
           )}
           {protocol && (
             <span className="text-xs text-gray-400 font-mono">Protocolo: {protocol}</span>
           )}
           {children}
        </div>
        
        <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            
            {(pdfUrl || queryId) && (
                <Button 
                   onClick={async () => {
                     try {
                       setIsDownloading(true);
                       let downloaded = false;

                       if (queryId) {
                         try {
                           const response = await httpClient.get(`/queries/${queryId}/pdf`, { responseType: 'blob' });
                           downloadBlob(response.data, `relatorio-${protocol || 'documento'}.pdf`);
                           downloaded = true;
                         } catch (err) {
                           console.warn('Failed to download PDF via Query ID, trying fallback', err);
                         }
                       }

                       if (!downloaded && pdfUrl) {
                         await downloadPdf(pdfUrl, `relatorio-${protocol || 'documento'}.pdf`);
                         downloaded = true;
                       }

                       if (!downloaded) {
                         throw new Error('Não foi possível baixar o PDF.');
                       }
                     } catch (e) {
                       console.error('PDF download failed:', e);
                       // Don't open raw API URLs that return JSON instead of PDF
                       // Only open URLs that point directly to .pdf files
                       if (pdfUrl && pdfUrl.match(/\.pdf(\?|$)/i)) {
                         window.open(pdfUrl, '_blank');
                       }
                     } finally {
                       setIsDownloading(false);
                     }
                   }}
                   disabled={isDownloading}
                   className="flex items-center gap-2 h-8"
                   variant="outline"
                >
                  {isDownloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloading ? 'Baixando...' : 'PDF'}
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}
