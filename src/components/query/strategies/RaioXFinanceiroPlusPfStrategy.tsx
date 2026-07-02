'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileWarning,
  Landmark,
} from 'lucide-react';
import type {
  QueryStrategyProps,
  RaioXFinanceiroPlusPfResult,
  RaioXMarketRestrictions,
  RaioXGenericDebt,
} from '@/types/query-strategies';
import { formatCurrency } from '@/lib/formatters';
import { formatDisplayDate } from '@/lib/utils';
import { CommercialAnalysisPfStrategy } from './CommercialAnalysisPfStrategy';
import { InfoBox } from './components/InfoBox';
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

function MarketRestrictionsSection({ mr }: { mr: RaioXMarketRestrictions }) {
  const summary = mr.summary ?? {};
  const debts = mr.debts ?? [];
  const scpcDebts = mr.scpcDebts ?? [];
  const refinPefinDebts = mr.refinPefinDebts ?? [];
  const protests = mr.protests ?? [];
  const badChecks = mr.badChecks ?? [];
  const cadin = mr.cadin ?? [];
  const legalActions = mr.legalActions ?? [];

  const totalDebts = Number(summary.totalDebts ?? debts.length);
  const totalScpcDebts = Number(summary.totalScpcDebts ?? scpcDebts.length);
  const totalRefinPefinDebts = Number(
    summary.totalRefinPefinDebts ?? refinPefinDebts.length,
  );
  const totalProtests = Number(summary.totalProtests ?? protests.length);
  const totalBadChecks = Number(summary.totalBadChecks ?? badChecks.length);
  const totalCadin = Number(summary.totalCadin ?? cadin.length);
  const totalSerasaOccurrences = Number(
    summary.totalSerasaOccurrences ?? debts.length,
  );

  const hasDetailedDebtBreakdown =
    totalScpcDebts > 0 ||
    totalRefinPefinDebts > 0 ||
    scpcDebts.length > 0 ||
    refinPefinDebts.length > 0;
  const isSerasaCrednet =
    mr.sourceQueryTypeCode === 'SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF' ||
    (!hasDetailedDebtBreakdown && (debts.length > 0 || totalSerasaOccurrences > 0));
  const hasAny =
    totalDebts > 0 ||
    totalScpcDebts > 0 ||
    totalRefinPefinDebts > 0 ||
    totalProtests > 0 ||
    totalBadChecks > 0 ||
    totalCadin > 0 ||
    legalActions.length > 0;

  const formatDebtDate = (item: RaioXGenericDebt) =>
    formatDisplayDate(item.dueDate || item.date) || '-';

  return (
    <div className="space-y-5 p-4">
      <p className="border-l-2 border-indigo-300 pl-3 text-xs leading-relaxed text-gray-500">
        Restrições de mercado consultadas via birôs de crédito.
        {' '}
        {isSerasaCrednet
          ? 'Nesta composição, a camada complementar foi retornada pelo Serasa Crednet, com pendências, protestos e cheques sem fundo.'
          : 'Inclui dívidas SCPC, pendências REFIN/PEFIN, protestos em cartório, cheques sem fundo e inscrições em CADIN.'}
        {' '}
        {!hasAny && (
          <span className="font-semibold text-green-700">
            Nenhuma restrição encontrada.
          </span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {hasDetailedDebtBreakdown ? (
          <>
            <SummaryCard
              title="SCPC"
              value={totalScpcDebts}
              subtitle={totalScpcDebts > 0 ? 'Constam registros' : 'Nada consta'}
              color={totalScpcDebts > 0 ? 'red' : 'green'}
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <SummaryCard
              title="REFIN / PEFIN"
              value={totalRefinPefinDebts}
              subtitle={
                totalRefinPefinDebts > 0 ? 'Constam registros' : 'Nada consta'
              }
              color={totalRefinPefinDebts > 0 ? 'orange' : 'green'}
              icon={<FileWarning className="w-5 h-5" />}
            />
          </>
        ) : (
          <SummaryCard
            title="Pendências"
            value={totalDebts}
            subtitle={totalDebts > 0 ? 'Constam registros' : 'Nada consta'}
            color={totalDebts > 0 ? 'red' : 'green'}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
        )}
        <SummaryCard
          title="Protestos"
          value={totalProtests}
          subtitle={totalProtests > 0 ? 'Constam registros' : 'Nada consta'}
          color={totalProtests > 0 ? 'yellow' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cheques"
          value={totalBadChecks}
          subtitle={totalBadChecks > 0 ? 'Constam registros' : 'Nada consta'}
          color={totalBadChecks > 0 ? 'yellow' : 'green'}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        {(isSerasaCrednet || totalSerasaOccurrences > 0) && (
          <SummaryCard
            title="SERASA"
            value={totalSerasaOccurrences}
            subtitle={
              totalSerasaOccurrences > 0 ? 'Constam ocorrências' : 'Nada consta'
            }
            color={totalSerasaOccurrences > 0 ? 'orange' : 'green'}
            icon={<FileWarning className="w-5 h-5" />}
          />
        )}
        {(totalCadin > 0 || cadin.length > 0) && (
          <SummaryCard
            title="CADIN"
            value={totalCadin}
            subtitle={totalCadin > 0 ? 'Constam registros' : 'Nada consta'}
            color={totalCadin > 0 ? 'purple' : 'green'}
            icon={<FileWarning className="w-5 h-5" />}
          />
        )}
      </div>

      {mr.serasaSummary && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 md:grid-cols-3">
          <InfoBox
            label="1ª Ocorrência SERASA"
            value={formatDisplayDate(mr.serasaSummary.firstOccurrenceDate) || '-'}
            icon={<Calendar className="w-4 h-4 text-blue-500" />}
          />
          <InfoBox
            label="Última Ocorrência SERASA"
            value={formatDisplayDate(mr.serasaSummary.lastOccurrenceDate) || '-'}
            icon={<Calendar className="w-4 h-4 text-blue-500" />}
          />
          <InfoBox
            label="Total SERASA"
            value={String(mr.serasaSummary.totalOccurrences || 0)}
            icon={<FileWarning className="w-4 h-4 text-blue-500" />}
          />
        </div>
      )}

      {debts.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Pendências de Mercado ({debts.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Credor / Origem</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Inclusão</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatDebtDate(item)}</TableCell>
                  <TableCell className="font-medium">
                    {item.creditor || item.origin || '-'}
                  </TableCell>
                  <TableCell>{item.type || item.informant || '-'}</TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>
                    {formatDisplayDate(item.inclusionDate || item.created_at) || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(String(item.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {scpcDebts.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            Ocorrências SCPC ({scpcDebts.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Credor</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Disponível em</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scpcDebts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.occurrenceDate || '-'}</TableCell>
                  <TableCell className="font-medium">
                    {item.creditorName || '-'}
                  </TableCell>
                  <TableCell>
                    {item.city && item.state
                      ? `${item.city} / ${item.state}`
                      : item.city || item.state || '-'}
                  </TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>{item.availabilityDate || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(String(item.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {refinPefinDebts.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
            <FileWarning className="h-3.5 w-3.5" />
            Ocorrências REFIN / PEFIN ({refinPefinDebts.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Informante</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Doc. Instituição</TableHead>
                <TableHead>Garantidor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refinPefinDebts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.date || '-'}</TableCell>
                  <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                  <TableCell>{item.informant || '-'}</TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>{item.institutionDocument || '-'}</TableCell>
                  <TableCell>{item.guarantor || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-orange-600">
                    {formatCurrency(String(item.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {protests.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <Landmark className="h-3.5 w-3.5" />
            Protestos ({protests.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Cartório</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {protests.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatDisplayDate(item.date) || '-'}</TableCell>
                  <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                  <TableCell>{item.notary || '-'}</TableCell>
                  <TableCell>
                    {item.city && item.state
                      ? `${item.city} / ${item.state}`
                      : item.city || item.state || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-indigo-600">
                    {formatCurrency(String(item.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {badChecks.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Cheques Sem Fundo ({badChecks.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Alínea</TableHead>
                <TableHead>Última Ocorrência</TableHead>
                <TableHead>Cidade / UF</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badChecks.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {item.bankNumber || '-'}
                  </TableCell>
                  <TableCell>{item.branch || '-'}</TableCell>
                  <TableCell>{item.alinea || '-'}</TableCell>
                  <TableCell>
                    {formatDisplayDate(item.lastOccurrence) || item.lastOccurrence || '-'}
                  </TableCell>
                  <TableCell>
                    {item.city && item.state
                      ? `${item.city} / ${item.state}`
                      : item.city || item.state || '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-yellow-700">
                    {item.quantity || 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {cadin.length > 0 && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-purple-600">
            <FileWarning className="h-3.5 w-3.5" />
            CADIN ({cadin.length})
          </p>
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
              {cadin.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.entity || '-'}</TableCell>
                  <TableCell>{item.unit || '-'}</TableCell>
                  <TableCell>{item.registrationNumber || '-'}</TableCell>
                  <TableCell>
                    {formatDisplayDate(item.registrationDate) || '-'}
                  </TableCell>
                  <TableCell>{item.state || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {formatCurrency(String(item.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function RaioXFinanceiroPlusPfStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXFinanceiroPlusPfResult>) {
  if (!data) return null;

  const marketPerson = data.marketRestrictions?.person;
  const fallbackPerson = marketPerson
    ? {
        ...marketPerson,
        status: '',
        revenueStatus: '',
      }
    : undefined;

  const normalizedData: RaioXFinanceiroPlusPfResult = {
    ...data,
    person: data.person ?? fallbackPerson,
  };

  return (
    <div className="space-y-8">
      <CommercialAnalysisPfStrategy
        data={normalizedData}
        queryId={queryId}
        scoreVariant="gauge"
        showRiskDetails={false}
        showCreditLimitSuggestion={false}
      />

      {normalizedData.marketRestrictions && (
        <StrategySectionWrapper
          title="Restrições de Mercado"
          icon={<Landmark className="w-5 h-5 text-indigo-500" />}
          isEmpty={false}
        >
          <MarketRestrictionsSection mr={normalizedData.marketRestrictions} />
        </StrategySectionWrapper>
      )}
    </div>
  );
}
