'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  FileWarning,
  Landmark,
  Search,
  User,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { CommercialAnalysisPfResult, QueryStrategyProps } from '@/types/query-strategies';
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

const EMPTY_SUMMARY = {
  totalDebts: 0,
  totalProtests: 0,
  totalQueries: 0,
  totalScpcDebts: 0,
  totalRefinPefinDebts: 0,
};

export function CommercialAnalysisPfStrategy({
  data,
  queryId,
}: QueryStrategyProps<CommercialAnalysisPfResult>) {
  if (!data) return null;

  const summary = data.financialSummary ?? EMPTY_SUMMARY;
  const debts = data.debts ?? [];
  const protests = data.protests ?? [];
  const queries = data.queries ?? [];
  const serasaDebts = data.serasaDebts ?? [];

  const scoreValue = data.score?.value;
  const riskText = data.score?.riskText || data.score?.risk;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={data.person?.name || 'Análise Comercial PF'}
          protocol={data.protocol}
          status={data.person?.revenueStatus || data.person?.status}
          statusVariant={(summary.totalDebts || 0) > 0 || (summary.totalProtests || 0) > 0 ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">PF</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(data.person?.document || '-')}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Nascimento"
            value={formatDisplayDate(data.person?.birthDate)}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Score"
            value={scoreValue ? String(scoreValue) : '-'}
            icon={<CheckCircle2 className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Decisão"
            value={data.decision?.status || '-'}
            icon={<FileText className="w-4 h-4 text-primary" />}
          />
        </div>

        {(data.person?.motherName || riskText) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {data.person?.motherName && (
              <InfoBox
                label="Nome da Mãe"
                value={data.person.motherName}
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
            )}
            {riskText && (
              <InfoBox
                label="Risco"
                value={riskText}
                icon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
              />
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Dívidas"
          value={summary.totalDebts || debts.length || serasaDebts.length || 0}
          color={(summary.totalDebts || debts.length || serasaDebts.length || 0) > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={summary.totalProtests || protests.length || 0}
          color={(summary.totalProtests || protests.length || 0) > 0 ? 'orange' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Consultas"
          value={summary.totalQueries || queries.length || 0}
          color="blue"
          icon={<Search className="w-5 h-5" />}
        />
        <SummaryCard
          title="SCPC"
          value={summary.totalScpcDebts || 0}
          color={(summary.totalScpcDebts || 0) > 0 ? 'yellow' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
        <SummaryCard
          title="REFIN/PEFIN"
          value={summary.totalRefinPefinDebts || 0}
          color={(summary.totalRefinPefinDebts || 0) > 0 ? 'purple' : 'green'}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {data.creditLimitSuggestion && (
        <StrategySectionWrapper
          title="Sugestão de Limite"
          icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoBox label="Modelo" value={data.creditLimitSuggestion.model || '-'} icon={<FileText className="w-4 h-4 text-primary" />} />
            <InfoBox label="Nome" value={data.creditLimitSuggestion.name || '-'} icon={<FileText className="w-4 h-4 text-primary" />} />
            <InfoBox label="Texto" value={data.creditLimitSuggestion.text || '-'} icon={<FileText className="w-4 h-4 text-primary" />} />
            <InfoBox label="Valor" value={formatCurrency(String(data.creditLimitSuggestion.amount || data.creditLimitSuggestion.value || 0))} icon={<CheckCircle2 className="w-4 h-4 text-primary" />} />
          </div>
        </StrategySectionWrapper>
      )}

      {serasaDebts.length > 0 && (
        <StrategySectionWrapper
          title="Débitos SERASA"
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          count={serasaDebts.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Inclusão</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serasaDebts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.creditor || '-'}</TableCell>
                  <TableCell>{item.dueDate || '-'}</TableCell>
                  <TableCell>{item.type || '-'}</TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>{item.inclusionDate || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{formatCurrency(String(item.value || 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      <StrategySectionWrapper
        title="Dívidas"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={debts.length}
        isEmpty={debts.length === 0}
        emptyMessage="Nenhuma dívida registrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.contract || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">{formatCurrency(String(item.value || 0))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Protestos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={protests.length}
        isEmpty={protests.length === 0}
        emptyMessage="Nenhum protesto registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protests.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.notary || item.notaryName || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">{formatCurrency(String(item.value || 0))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {queries.length > 0 && (
        <StrategySectionWrapper
          title="Histórico de Consultas"
          icon={<Search className="w-5 h-5 text-primary" />}
          count={queries.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Cidade/UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.date || '-'}</TableCell>
                  <TableCell className="font-medium">{item.entity || '-'}</TableCell>
                  <TableCell>{item.cityState || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}
    </div>
  );
}
