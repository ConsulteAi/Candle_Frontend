'use client';

import { Building2, Calendar, FileWarning, Hash, Landmark } from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { ProtestoDetalhadoSpResult, QueryStrategyProps } from '@/types/query-strategies';
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

export function ProtestoDetalhadoSpStrategy({
  data,
  queryId,
}: QueryStrategyProps<ProtestoDetalhadoSpResult>) {
  if (!data) return null;

  const protests = data.protests ?? [];
  const notaries = data.notaries ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title="Protesto Detalhado SP"
          protocol={data.protocol}
          status={(data.totalProtests || protests.length || 0) > 0 ? 'COM REGISTROS' : 'SEM REGISTROS'}
          statusVariant={(data.totalProtests || protests.length || 0) > 0 ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">São Paulo</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(data.document || '-')}
            icon={<Hash className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Consultado em"
            value={data.consultedAt || '-'}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Tempo de Processamento"
            value={data.elapsedTime || '-'}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Total de Protestos"
            value={String(data.totalProtests || protests.length || 0)}
            icon={<FileWarning className="w-4 h-4 text-primary" />}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Títulos Protestados"
          value={protests.length}
          color={protests.length > 0 ? 'orange' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cartórios"
          value={notaries.length}
          color={notaries.length > 0 ? 'blue' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="Títulos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={protests.length}
        isEmpty={protests.length === 0}
        emptyMessage="Nenhum título protestado encontrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Data Protesto</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protests.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatCpfCnpj(item.document || data.document || '-')}</TableCell>
                <TableCell>{item.protestDate || '-'}</TableCell>
                <TableCell>{item.dueDate || '-'}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell className="font-medium">{`${item.notaryNumber || '-'} - ${item.notaryName || '-'}`}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  {formatCurrency(String(item.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Cartórios"
        icon={<Building2 className="w-5 h-5 text-indigo-500" />}
        count={notaries.length}
        isEmpty={notaries.length === 0}
        emptyMessage="Nenhum cartório retornado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cartório</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>WhatsApp</TableHead>
              <TableHead className="text-right">Total de Títulos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notaries.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{`${item.notaryNumber || '-'} - ${item.notaryName || '-'}`}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell>{item.phone || '-'}</TableCell>
                <TableCell>{item.whatsapp || '-'}</TableCell>
                <TableCell className="text-right font-bold text-indigo-600">
                  {item.totalProtests || item.titles?.length || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
