'use client';

import {
  Building2,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  Landmark,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, RealtimeMaxSpcSerasaBvsProtestoPjResult } from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { AlertsGrid } from './components/AlertsGrid';
import { InfoBox } from './components/InfoBox';
import { ScoreGauge } from './components/ScoreGauge';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

export function RealtimeMaxSpcSerasaBvsProtestoPjStrategy({
  data,
  queryId,
}: QueryStrategyProps<RealtimeMaxSpcSerasaBvsProtestoPjResult>) {
  if (!data) return null;

  const hasScore = !!data.score?.value;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-12 gap-6">
        {hasScore && (
          <div className="md:col-span-4">
            <ScoreGauge
              value={Number(data.score?.value)}
              band={data.score?.class ? `Classe ${data.score.class}` : undefined}
              riskText={data.score?.riskText}
              label="SCORE"
            />
          </div>
        )}

        <div className={hasScore ? 'md:col-span-8' : 'md:col-span-12'}>
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
            <StrategyHeader
              title={data.company.socialReason}
              subtitle={data.company.fantasyName}
              protocol={data.protocol}
              status={data.company.status}
              statusVariant={data.company.status === 'ATIVA' ? 'success' : 'warning'}
              pdfUrl={data.pdf}
              queryId={queryId}
              className="mb-6"
            >
              <Badge variant="info">Realtime MAX + Protesto</Badge>
            </StrategyHeader>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoBox
                label="CNPJ"
                value={formatCpfCnpj(data.company.cnpj)}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Fundação"
                value={formatDisplayDate(data.company.foundationDate)}
                icon={<Calendar className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Status"
                value={data.company.status || 'N/A'}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
            </div>
          </Card>
        </div>
      </div>

      <AlertsGrid alerts={data.alerts || []} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Dívidas"
          value={data.totalDebts}
          subtitle={data.totalDebts > 0 ? 'Constam registros' : 'Nada consta'}
          color={data.totalDebts > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={data.totalProtests}
          subtitle={data.totalProtests > 0 ? 'Constam registros' : 'Nada consta'}
          color={data.totalProtests > 0 ? 'orange' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cheques"
          value={data.totalBadChecks || 0}
          subtitle={(data.totalBadChecks || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(data.totalBadChecks || 0) > 0 ? 'yellow' : 'green'}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="Detalhamento de Dívidas"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={data.debts.length}
        isEmpty={data.debts.length === 0}
        emptyMessage="Nenhuma dívida registrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead className="whitespace-nowrap">Base (I, II, III e IV)</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.debts.map((debt, idx) => (
              <TableRow key={idx}>
                <TableCell>{debt.date}</TableCell>
                <TableCell className="font-medium">{debt.origin}</TableCell>
                <TableCell>{debt.contract || '-'}</TableCell>
                <TableCell>{debt.informant || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">{formatCurrency(String(debt.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Protestos Sintéticos"
        icon={<Landmark className="w-5 h-5 text-indigo-500" />}
        count={data.syntheticProtests?.length || 0}
        isEmpty={!data.syntheticProtests || data.syntheticProtests.length === 0}
        emptyMessage="Nenhum protesto sintético registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Credor</TableHead>
              <TableHead>Anuência</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.syntheticProtests?.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium">{item.cartorio || '-'}</TableCell>
                <TableCell>{item.uf || '-'}</TableCell>
                <TableCell>{item.credor || '-'}</TableCell>
                <TableCell>{item.anuencia || 'Ativo'}</TableCell>
                <TableCell className="text-right font-bold text-indigo-600">{formatCurrency(String(item.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Detalhamento de Protestos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={data.protests?.length || 0}
        isEmpty={!data.protests || data.protests.length === 0}
        emptyMessage="Nenhum protesto registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cartório/Origem</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests?.map((protest, idx) => (
              <TableRow key={idx}>
                <TableCell>{protest.date}</TableCell>
                <TableCell className="font-medium">{protest.notary || protest.origin || protest.type || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">{formatCurrency(String(protest.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Detalhamento de Cheques Sem Fundo"
        icon={<CheckCircle2 className="w-5 h-5 text-yellow-500" />}
        count={data.badChecks?.length || 0}
        isEmpty={!data.badChecks || data.badChecks.length === 0}
        emptyMessage="Nenhum cheque sem fundo registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Última Ocorrência</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.badChecks?.map((check, idx) => (
              <TableRow key={idx}>
                <TableCell>{check.lastOccurrence}</TableCell>
                <TableCell className="font-medium">{check.bankNumber}</TableCell>
                <TableCell className="text-right font-bold text-yellow-600">{check.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
