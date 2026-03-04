import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button, Badge } from '@/design-system/ComponentsTailwind';
import { cn } from '@/lib/utils';
import { downloadPdf } from '@/lib/download';

interface StrategyHeaderProps {
  title: string;
  subtitle?: string;
  protocol?: string;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'error' | 'info' | 'outline' | 'primary';
  pdfUrl?: string;
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
            
            {pdfUrl && (
                <Button 
                   onClick={async () => {
                     try {
                       setIsDownloading(true);
                       await downloadPdf(pdfUrl, `relatorio-${protocol || 'documento'}.pdf`);
                     } catch (e) {
                       window.open(pdfUrl, '_blank');
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
