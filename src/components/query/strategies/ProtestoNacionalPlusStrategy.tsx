'use client';

import { AlertTriangle, Calendar, FileWarning, MessageSquare, User } from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  ProtestoNacionalPlusItem,
  ProtestoNacionalPlusResult,
} from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { formatDisplayDate } from '@/lib/utils';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';
import { SummaryCard } from './components/SummaryCard';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

export function ProtestoNacionalPlusStrategy({
  data,
  queryId,
}: QueryStrategyProps<ProtestoNacionalPlusResult>) {
  if (!data) return null;

  const protests: ProtestoNacionalPlusItem[] = (data.protests ?? []).map((item) => ({
    document: item.document || item.rawData?.document || data.document || '-',
    protestDate: item.protestDate || item.rawData?.protestDate || item.date || '-',
    dueDate: item.dueDate || item.rawData?.dueDate || '-',
    value: item.value || item.rawData?.value || 0,
    city: item.city || item.rawData?.city || '-',
    state: item.state || item.rawData?.state || '-',
    notaryNumber: item.notaryNumber || item.rawData?.notaryNumber || '-',
    notaryName: item.notaryName || item.rawData?.notaryName || '-',
    presenterName: item.presenterName || item.rawData?.presenterName || '-',
    assignorName: item.assignorName || item.rawData?.assignorName || '-',
    hasConsent: item.hasConsent ?? item.rawData?.hasConsent,
    hasRenegotiation: item.hasRenegotiation ?? item.rawData?.hasRenegotiation,
    key: item.key || item.rawData?.key || '-',
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title="Protesto Nacional"
          protocol={data.protocol}
          status={data.status || 'CONCLUÍDO'}
          statusVariant={(data.totalProtests || 0) > 0 ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">Nacional</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(data.document || '-')}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Consultado em"
            value={formatDisplayDate(data.consultedAt)}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Mensagens"
            value={String((data.messages || []).length)}
            icon={<MessageSquare className="w-4 h-4 text-primary" />}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Total de Protestos"
          value={data.totalProtests || protests.length || 0}
          subtitle={(data.totalProtests || protests.length || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(data.totalProtests || protests.length || 0) > 0 ? 'orange' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
      </div>

      {(data.messages || []).length > 0 && (
        <StrategySectionWrapper
          title="Mensagens"
          icon={<MessageSquare className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="p-4 flex flex-wrap gap-2">
            {(data.messages ?? []).map((msg, idx) => (
              <Badge key={idx} variant="outline">{msg}</Badge>
            ))}
          </div>
        </StrategySectionWrapper>
      )}

      <StrategySectionWrapper
        title="Protestos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={protests.length}
        isEmpty={protests.length === 0}
        emptyMessage="Nenhum protesto encontrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Data Protesto</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead>Apresentante</TableHead>
              <TableHead>Cedente</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protests.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatCpfCnpj(item.document || '-')}</TableCell>
                <TableCell>{item.protestDate || '-'}</TableCell>
                <TableCell>{item.dueDate || '-'}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell className="font-medium">{`${item.notaryNumber || '-'} - ${item.notaryName || '-'}`}</TableCell>
                <TableCell>{item.presenterName || '-'}</TableCell>
                <TableCell>{item.assignorName || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  {formatCurrency(String(item.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
