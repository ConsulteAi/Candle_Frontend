'use client';

import { Building2, FileText, MapPin, User, Wallet } from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { CadinRealtimeResult, QueryStrategyProps } from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { StrategyHeader } from './components/StrategyHeader';
import { SummaryCard } from './components/SummaryCard';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { InfoBox } from './components/InfoBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

export function CadinRealtimeStrategy({ data, queryId }: QueryStrategyProps<CadinRealtimeResult>) {
  if (!data) return null;

  const summary = data.summary ?? {};
  const natures = data.natures ?? [];
  const rows = natures.flatMap((group) =>
    (group.debts ?? []).map((debt) => ({ nature: group.nature, ...debt })),
  );

  const hasDebt = summary.hasDebt === true;
  const totalDebts = summary.totalDebts || rows.length;
  const hasFgts = Number(summary.totalFgts || 0) > 0;
  const title = summary.name || summary.tradeName || 'Consulta CADIN Realtime';
  const subtitle = summary.name && summary.tradeName ? summary.tradeName : undefined;
  const location = [summary.city, summary.state].filter(Boolean).join(' / ');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={title}
          subtitle={subtitle}
          protocol={data.protocol}
          status={hasDebt ? 'Com dívida' : 'Sem dívida'}
          statusVariant={hasDebt ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">CADIN Realtime</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(summary.document || '-')}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Cidade / UF"
            value={location || '-'}
            icon={<MapPin className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Atividade econômica"
            value={summary.cnaeDescription || '-'}
            icon={<Building2 className="w-4 h-4 text-primary" />}
          />
        </div>
      </Card>

      <div className={`grid grid-cols-1 gap-4 ${hasFgts ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        <SummaryCard
          title="Quantidade de inscrições"
          value={totalDebts}
          color={totalDebts > 0 ? 'purple' : 'green'}
          icon={<FileText className="w-5 h-5" />}
        />
        <SummaryCard
          title="Valor total"
          value={formatCurrency(String(summary.totalValue || 0))}
          color={Number(summary.totalValue || 0) > 0 ? 'red' : 'green'}
          icon={<Wallet className="w-5 h-5" />}
        />
        {hasFgts && (
          <SummaryCard
            title="Total FGTS"
            value={formatCurrency(String(summary.totalFgts))}
            color="orange"
            icon={<Wallet className="w-5 h-5" />}
          />
        )}
      </div>

      <StrategySectionWrapper
        title="Inscrições por natureza"
        icon={<Building2 className="w-5 h-5 text-purple-500" />}
        count={rows.length}
        isEmpty={rows.length === 0}
        emptyMessage="Nenhuma inscrição encontrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Natureza</TableHead>
              <TableHead>Nº da inscrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data de extração</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={`${row.nature}-${row.registrationNumber}-${idx}`}>
                <TableCell>{row.nature ? `Natureza ${row.nature}` : '-'}</TableCell>
                <TableCell>{row.registrationNumber || '-'}</TableCell>
                <TableCell className="text-right font-bold text-purple-600 tabular-nums">
                  {formatCurrency(String(row.value || 0))}
                </TableCell>
                <TableCell>{row.extractionDate || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
