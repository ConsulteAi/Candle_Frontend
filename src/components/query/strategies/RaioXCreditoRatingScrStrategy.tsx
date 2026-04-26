'use client';

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileWarning,
  Landmark,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, RaioXCreditoRatingScrResult } from '@/types/query-strategies';
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

export function RaioXCreditoRatingScrStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXCreditoRatingScrResult>) {
  if (!data) return null;

  const isPf = Boolean(data.person);
  const displayName = isPf
    ? data.person?.name || 'Consulta SCR PF'
    : data.company?.socialReason || 'Consulta SCR PJ';
  const document = isPf
    ? data.person?.document || data.document
    : data.company?.cnpj || data.document;

  const marketSummary = data.marketRestrictions?.summary;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-4">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Score SCR</h3>
            </div>
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {Number(data.score?.value || 0)}
            </div>
            <div className="mt-3">
              <Badge variant={data.hasRestrictions ? 'warning' : 'success'}>
                {data.score?.band || 'Sem faixa'}
              </Badge>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {data.hasRestrictions ? 'Foram identificadas restricoes no SCR.' : 'Sem restricoes no SCR.'}
            </div>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
            <StrategyHeader
              title={displayName}
              protocol={data.protocol}
              status={data.hasRestrictions ? 'COM RESTRICOES' : 'SEM RESTRICOES'}
              statusVariant={data.hasRestrictions ? 'warning' : 'success'}
              pdfUrl={data.pdf}
              queryId={queryId}
              className="mb-6"
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoBox
                label="Documento"
                value={formatCpfCnpj(document || '-')}
                icon={isPf ? <User className="w-4 h-4 text-primary" /> : <Building2 className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Data da Consulta"
                value={formatDisplayDate(data.consultationDateTime)}
                icon={<Calendar className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Data Base"
                value={data.databaseDate || '-'}
                icon={<Clock className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Instituições"
                value={String(data.institutionsCount || 0)}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Operações"
          value={data.operationsCount || 0}
          subtitle="Total no SCR"
          color="blue"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Valor Restritivo"
          value={formatCurrency(String(data.totalRestrictiveValue || 0))}
          subtitle={Number(data.totalRestrictiveValue || 0) > 0 ? 'Constam restricoes' : 'Nada consta'}
          color={Number(data.totalRestrictiveValue || 0) > 0 ? 'red' : 'green'}
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <SummaryCard
          title="Crédito Vencido"
          value={formatCurrency(String(data.creditSummary?.expiredCredit?.value || 0))}
          subtitle="Resumo SCR"
          color="orange"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Prejuízo"
          value={formatCurrency(String(data.creditSummary?.loss?.value || 0))}
          subtitle="Resumo SCR"
          color="gray"
          icon={<FileWarning className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="Operações SCR"
        icon={<BarChart3 className="w-5 h-5 text-primary" />}
        count={data.operations?.length ?? 0}
        isEmpty={(data.operations?.length ?? 0) === 0}
        emptyMessage="Nenhuma operação SCR disponível."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead>Submodalidade</TableHead>
              <TableHead className="text-right">Percentual</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.operations ?? []).map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.modalityDescription || '-'}</TableCell>
                <TableCell>{item.subModalityDescription || '-'}</TableCell>
                <TableCell className="text-right">{item.percentage || 0}%</TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatCurrency(String(item.totalValue || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {marketSummary && (
        <StrategySectionWrapper
          title="Restrições de Mercado"
          icon={<Landmark className="w-5 h-5 text-indigo-500" />}
          isEmpty={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <SummaryCard
              title="SCPC"
              value={marketSummary.totalScpcDebts || 0}
              color={(marketSummary.totalScpcDebts || 0) > 0 ? 'red' : 'green'}
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <SummaryCard
              title="REFIN/PEFIN"
              value={marketSummary.totalRefinPefinDebts || 0}
              color={(marketSummary.totalRefinPefinDebts || 0) > 0 ? 'orange' : 'green'}
              icon={<FileWarning className="w-5 h-5" />}
            />
            <SummaryCard
              title="Protestos"
              value={marketSummary.totalProtests || 0}
              color={(marketSummary.totalProtests || 0) > 0 ? 'yellow' : 'green'}
              icon={<Landmark className="w-5 h-5" />}
            />
            <SummaryCard
              title="CADIN"
              value={marketSummary.totalCadin || 0}
              color={(marketSummary.totalCadin || 0) > 0 ? 'purple' : 'green'}
              icon={<Building2 className="w-5 h-5" />}
            />
          </div>
        </StrategySectionWrapper>
      )}

      {data.marketRestrictionsUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.marketRestrictionsMessage || 'O enriquecimento de mercado não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}
    </div>
  );
}
