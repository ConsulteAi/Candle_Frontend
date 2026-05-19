'use client';

import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  FileWarning,
  Gavel,
  Landmark,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { DividasMultiCnpjProResult, QueryStrategyProps } from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';
import { SummaryCard } from './components/SummaryCard';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { ScoreGauge } from './components/ScoreGauge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

export function DividasMultiCnpjProStrategy({
  data,
  queryId,
}: QueryStrategyProps<DividasMultiCnpjProResult>) {
  if (!data) return null;

  const summary = data.financialSummary;
  const hasOccurrences = [
    summary.totalScpcDebts,
    summary.totalRefinPefinDebts,
    summary.totalProtests,
    summary.totalBadChecks,
    summary.totalCadin,
    summary.totalLegalActions,
    summary.totalSerasaOccurrences,
  ].some((value) => Number(value || 0) > 0);

  const hasScore = !!data.score?.value;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-12 gap-6">
        {hasScore && (
          <div className="md:col-span-4">
            <ScoreGauge
              value={Number(data.score!.value)}
              band={data.score!.class}
              riskText={data.score!.riskText}
            />
          </div>
        )}

        <div className={hasScore ? 'md:col-span-8' : 'md:col-span-12'}>
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
            <StrategyHeader
              title={data.company.socialReason}
              protocol={data.protocol}
              status={hasOccurrences ? 'COM OCORRENCIAS' : 'SEM OCORRENCIAS'}
              statusVariant={hasOccurrences ? 'warning' : 'success'}
              pdfUrl={data.pdf}
              queryId={queryId}
              className="mb-6"
            >
              <Badge variant="info">Dividas Multi PJ Pro</Badge>
            </StrategyHeader>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <InfoBox
                label="CNPJ"
                value={formatCpfCnpj(data.company.cnpj)}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Razão Social"
                value={data.company.socialReason}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Ocorrências SCPC"
          value={summary.totalScpcDebts || 0}
          subtitle={(summary.totalScpcDebts || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalScpcDebts || 0) > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Ocorrências REFIN/PEFIN"
          value={summary.totalRefinPefinDebts || 0}
          subtitle={(summary.totalRefinPefinDebts || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalRefinPefinDebts || 0) > 0 ? 'orange' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={summary.totalProtests || 0}
          subtitle={(summary.totalProtests || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalProtests || 0) > 0 ? 'yellow' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cheques"
          value={summary.totalBadChecks || 0}
          subtitle={(summary.totalBadChecks || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalBadChecks || 0) > 0 ? 'yellow' : 'green'}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard
          title="CADIN"
          value={summary.totalCadin || 0}
          subtitle={(summary.totalCadin || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalCadin || 0) > 0 ? 'purple' : 'green'}
          icon={<Building2 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Ações Judiciais"
          value={summary.totalLegalActions || 0}
          subtitle={(summary.totalLegalActions || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalLegalActions || 0) > 0 ? 'gray' : 'green'}
          icon={<Gavel className="w-5 h-5" />}
        />
        <SummaryCard
          title="SERASA (Resumo)"
          value={summary.totalSerasaOccurrences || 0}
          subtitle={(summary.totalSerasaOccurrences || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalSerasaOccurrences || 0) > 0 ? 'blue' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="OCORRÊNCIAS SCPC"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={data.scpcDebts?.length || 0}
        isEmpty={!data.scpcDebts || data.scpcDebts.length === 0}
        emptyMessage="Nenhuma ocorrência SCPC registrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo Devedor</TableHead>
              <TableHead>Credor</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Disponibilidade</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.scpcDebts.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.occurrenceDate || '-'}</TableCell>
                <TableCell>{item.debtorType || '-'}</TableCell>
                <TableCell className="font-medium">{item.creditorName || '-'}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell>{item.contract || '-'}</TableCell>
                <TableCell>{item.availabilityDate || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  {formatCurrency(String(item.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="OCORRÊNCIAS REFIN/PEFIN"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={data.refinPefinDebts?.length || 0}
        isEmpty={!data.refinPefinDebts || data.refinPefinDebts.length === 0}
        emptyMessage="Nenhuma ocorrência REFIN/PEFIN registrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Informante (Tipo)</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Doc. Instituição</TableHead>
              <TableHead>Doc. Origem</TableHead>
              <TableHead>Garantidor</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.refinPefinDebts.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.informant || '-'}</TableCell>
                <TableCell>{item.contract || '-'}</TableCell>
                <TableCell>{item.institutionDocument || '-'}</TableCell>
                <TableCell>{item.originDocument || '-'}</TableCell>
                <TableCell>{item.guarantor || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">
                  {formatCurrency(String(item.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Protestos"
        icon={<Landmark className="w-5 h-5 text-indigo-500" />}
        count={data.protests?.length || 0}
        isEmpty={!data.protests || data.protests.length === 0}
        emptyMessage="Nenhum protesto registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.notary || '-'}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell className="text-right font-bold text-indigo-600">
                  {formatCurrency(String(item.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Cheques Sem Fundo"
        icon={<CheckCircle2 className="w-5 h-5 text-yellow-500" />}
        count={data.badChecks?.length || 0}
        isEmpty={!data.badChecks || data.badChecks.length === 0}
        emptyMessage="Nenhum cheque sem fundo registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Agência</TableHead>
              <TableHead>Alínea</TableHead>
              <TableHead>Última Ocorrência</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.badChecks.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.bankNumber || '-'}</TableCell>
                <TableCell>{item.branch || '-'}</TableCell>
                <TableCell>{item.alinea || '-'}</TableCell>
                <TableCell>{item.lastOccurrence || '-'}</TableCell>
                <TableCell>{`${item.city || '-'} / ${item.state || '-'}`}</TableCell>
                <TableCell className="text-right font-bold text-yellow-600">{item.quantity || 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="CADIN"
        icon={<Building2 className="w-5 h-5 text-purple-500" />}
        count={data.cadin?.length || 0}
        isEmpty={!data.cadin || data.cadin.length === 0}
        emptyMessage="Nenhum registro em CADIN."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Nº Inscrição</TableHead>
              <TableHead>Data Inscrição</TableHead>
              <TableHead>UF</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.cadin.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{item.entity || '-'}</TableCell>
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

      <StrategySectionWrapper
        title="Ações Judiciais"
        icon={<Gavel className="w-5 h-5 text-gray-500" />}
        count={data.legalActions?.length || 0}
        isEmpty={!data.legalActions || data.legalActions.length === 0}
        emptyMessage="Nenhuma ação judicial registrada."
      >
        <div className="p-4 space-y-4">
          {data.legalActions.map((item, idx) => (
            <pre
              key={idx}
              className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto"
            >
              {JSON.stringify(item, null, 2)}
            </pre>
          ))}
        </div>
      </StrategySectionWrapper>

      {data.serasaSummary && (
        <StrategySectionWrapper
          title="Resumo SERASA"
          icon={<FileWarning className="w-5 h-5 text-blue-500" />}
          isEmpty={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <InfoBox
              label="Primeira Ocorrência"
              value={data.serasaSummary.firstOccurrenceDate || '-'}
              icon={<Calendar className="w-4 h-4 text-primary" />}
            />
            <InfoBox
              label="Última Ocorrência"
              value={data.serasaSummary.lastOccurrenceDate || '-'}
              icon={<Calendar className="w-4 h-4 text-primary" />}
            />
            <InfoBox
              label="Total de Ocorrências"
              value={String(data.serasaSummary.totalOccurrences || 0)}
              icon={<FileWarning className="w-4 h-4 text-primary" />}
            />
          </div>
        </StrategySectionWrapper>
      )}

    </div>
  );
}
