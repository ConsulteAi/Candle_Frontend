'use client';

import { Building2, Calendar, FileText, User } from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { CadinResult, QueryStrategyProps } from '@/types/query-strategies';
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

export function CadinStrategy({ data, queryId }: QueryStrategyProps<CadinResult>) {
  if (!data) return null;

  const summary = data.summary ?? {};
  const cadin = data.cadin ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={summary.name || 'Consulta CADIN'}
          protocol={data.protocol}
          status={(summary.totalDebts || 0) > 0 ? 'COM REGISTROS' : 'SEM REGISTROS'}
          statusVariant={(summary.totalDebts || 0) > 0 ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">CADIN</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(summary.document || '-')}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Tipo de Pessoa"
            value={summary.personType || '-'}
            icon={<Building2 className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Total de Itens"
            value={String(summary.totalDebts || cadin.length || 0)}
            icon={<FileText className="w-4 h-4 text-primary" />}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Total de Registros"
          value={summary.totalDebts || cadin.length || 0}
          color={(summary.totalDebts || cadin.length || 0) > 0 ? 'purple' : 'green'}
          icon={<FileText className="w-5 h-5" />}
        />
        <SummaryCard
          title="Valor Total"
          value={formatCurrency(String(summary.totalValue || 0))}
          color={Number(summary.totalValue || 0) > 0 ? 'red' : 'green'}
          icon={<Building2 className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="Ocorrências CADIN"
        icon={<Building2 className="w-5 h-5 text-purple-500" />}
        count={cadin.length}
        isEmpty={cadin.length === 0}
        emptyMessage="Nenhuma ocorrência no CADIN."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Nº Inscrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>UF</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cadin.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatCpfCnpj(item.document || summary.document || '-')}</TableCell>
                <TableCell className="font-medium">{item.name || summary.name || '-'}</TableCell>
                <TableCell>{item.entity || '-'}</TableCell>
                <TableCell>{item.unit || '-'}</TableCell>
                <TableCell>{item.registrationNumber || '-'}</TableCell>
                <TableCell>{item.registrationDate || '-'}</TableCell>
                <TableCell>{item.state || '-'}</TableCell>
                <TableCell className="text-right font-bold text-purple-600">
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
