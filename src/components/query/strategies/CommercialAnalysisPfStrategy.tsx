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
  Gavel,
  TrendingUp,
  ShieldAlert,
  Activity,
  Clock,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { CommercialAnalysisPfResult, QueryStrategyProps } from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { formatDisplayDate } from '@/lib/utils';
import { InfoBox } from './components/InfoBox';
import { ScoreGauge } from './components/ScoreGauge';
import { StrategyHeader } from './components/StrategyHeader';
import { SummaryCard } from './components/SummaryCard';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { CommercialAnalysisExtraSections } from './components/CommercialAnalysisExtraSections';
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
  totalLegalActions: 0,
};

export function CommercialAnalysisPfStrategy({
  data,
  queryId,
  scoreVariant = 'default',
  showRiskDetails = true,
  showCreditLimitSuggestion = true,
}: QueryStrategyProps<CommercialAnalysisPfResult> & {
  scoreVariant?: 'default' | 'gauge';
  showRiskDetails?: boolean;
  showCreditLimitSuggestion?: boolean;
}) {
  if (!data) return null;

  const summary = data.financialSummary ?? EMPTY_SUMMARY;
  const debts = data.debts ?? [];
  const protests = data.protests ?? [];
  const queries = data.queries ?? [];
  const serasaDebts = data.serasaDebts ?? [];
  const legalActions = data.legalActions ?? [];

  const scoreValue = data.score?.value;
  const riskText = data.score?.riskText || data.score?.risk;
  const scoreBand = data.score?.band || data.score?.class;
  const hasExtraDebtFields = debts.some((d) => d.creditor || d.updatedValue);
  const useScoreGauge = scoreVariant === 'gauge' && scoreValue != null;
  const numericScoreValue = Number(scoreValue || 0);
  const visibleRiskText = showRiskDetails ? riskText : undefined;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {useScoreGauge ? (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <ScoreGauge
              value={numericScoreValue}
              band={scoreBand}
              riskText={visibleRiskText}
            />
          </div>

          <div className="md:col-span-8">
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2">
                  <InfoBox
                    label="Documento"
                    value={formatCpfCnpj(data.person?.document || '-')}
                    icon={<User className="w-4 h-4 text-primary" />}
                  />
                </div>
                <div className="xl:col-span-2">
                  <InfoBox
                    label="Nascimento"
                    value={formatDisplayDate(data.person?.birthDate)}
                    icon={<Calendar className="w-4 h-4 text-primary" />}
                  />
                </div>
                <div className="xl:col-span-2">
                  <InfoBox
                    label="Decisão"
                    value={data.decision?.status || '-'}
                    icon={<FileText className="w-4 h-4 text-primary" />}
                  />
                </div>

                {data.person?.motherName && (
                  <div className="xl:col-span-4">
                    <InfoBox
                      label="Nome da Mãe"
                      value={data.person.motherName}
                      icon={<User className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                )}
                {visibleRiskText && (
                  <div className="xl:col-span-2">
                    <InfoBox
                      label="Risco"
                      value={visibleRiskText}
                      icon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                )}
                {data.person?.rg && (
                  <div className="xl:col-span-2">
                    <InfoBox label="RG" value={data.person.rg} icon={<FileText className="w-4 h-4 text-gray-400" />} />
                  </div>
                )}
                {data.person?.estadoCivil && (
                  <div className="xl:col-span-2">
                    <InfoBox label="Estado Civil" value={data.person.estadoCivil} icon={<User className="w-4 h-4 text-gray-400" />} />
                  </div>
                )}
                {data.person?.tituloEleitor && (
                  <div className="xl:col-span-2">
                    <InfoBox label="Título Eleitor" value={data.person.tituloEleitor} icon={<FileText className="w-4 h-4 text-gray-400" />} />
                  </div>
                )}
                {data.person?.dataAtualizacao && (
                  <div className="xl:col-span-2">
                    <InfoBox label="Atualização" value={formatDisplayDate(data.person.dataAtualizacao)} icon={<Clock className="w-4 h-4 text-gray-400" />} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      ) : (
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

          {(data.person?.motherName || visibleRiskText) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {data.person?.motherName && (
                <InfoBox
                  label="Nome da Mãe"
                  value={data.person.motherName}
                  icon={<User className="w-4 h-4 text-gray-400" />}
                />
              )}
              {visibleRiskText && (
                <InfoBox
                  label="Risco"
                  value={visibleRiskText}
                  icon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
                />
              )}
            </div>
          )}

          {(data.person?.rg || data.person?.estadoCivil || data.person?.tituloEleitor || data.person?.dataAtualizacao) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {data.person?.rg && (
                <InfoBox label="RG" value={data.person.rg} icon={<FileText className="w-4 h-4 text-gray-400" />} />
              )}
              {data.person?.estadoCivil && (
                <InfoBox label="Estado Civil" value={data.person.estadoCivil} icon={<User className="w-4 h-4 text-gray-400" />} />
              )}
              {data.person?.tituloEleitor && (
                <InfoBox label="Título Eleitor" value={data.person.tituloEleitor} icon={<FileText className="w-4 h-4 text-gray-400" />} />
              )}
              {data.person?.dataAtualizacao && (
                <InfoBox label="Atualização" value={formatDisplayDate(data.person.dataAtualizacao)} icon={<Clock className="w-4 h-4 text-gray-400" />} />
              )}
            </div>
          )}
        </Card>
      )}

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
        {legalActions.length > 0 && (
          <SummaryCard
            title="Ações Cíveis"
            value={legalActions.length}
            color="red"
            icon={<Gavel className="w-5 h-5" />}
          />
        )}
      </div>

      {(data.debitSummary || data.protestSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.debitSummary && (
            <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Resumo de Débitos</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {data.debitSummary.valorAcumulado != null && (
                  <InfoBox label="Valor Acumulado" value={formatCurrency(String(data.debitSummary.valorAcumulado))} />
                )}
                {data.debitSummary.totalDebitosDevedor != null && (
                  <InfoBox label="Total Débitos" value={String(data.debitSummary.totalDebitosDevedor)} />
                )}
                {data.debitSummary.dataMaiorDebito && (
                  <InfoBox label="Maior Débito" value={formatDisplayDate(data.debitSummary.dataMaiorDebito)} />
                )}
                {data.debitSummary.dataPrimeiroDebito && (
                  <InfoBox label="Primeiro Débito" value={formatDisplayDate(data.debitSummary.dataPrimeiroDebito)} />
                )}
              </div>
            </Card>
          )}
          {data.protestSummary && (
            <Card className="p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Resumo de Protestos</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {data.protestSummary.quantidade != null && (
                  <InfoBox label="Quantidade" value={String(data.protestSummary.quantidade)} />
                )}
                {data.protestSummary.valorTotal != null && (
                  <InfoBox label="Valor Total" value={formatCurrency(String(data.protestSummary.valorTotal))} />
                )}
                {data.protestSummary.ultimaData && (
                  <InfoBox label="Último" value={formatDisplayDate(data.protestSummary.ultimaData)} />
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {showCreditLimitSuggestion && data.creditLimitSuggestion && (
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
                  <TableCell>{formatDisplayDate(item.dueDate) || '-'}</TableCell>
                  <TableCell>{item.type || '-'}</TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>{formatDisplayDate(item.inclusionDate) || '-'}</TableCell>
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
              {hasExtraDebtFields && <TableHead>Credor</TableHead>}
              <TableHead>Origem</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{formatDisplayDate(item.date) || '-'}</TableCell>
                {hasExtraDebtFields && (
                  <TableCell className="font-medium">{item.creditor || item.origin || '-'}</TableCell>
                )}
                <TableCell>{item.origin || '-'}</TableCell>
                <TableCell>{item.contract || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  {formatCurrency(String(item.updatedValue || item.value || 0))}
                </TableCell>
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
                <TableCell>{formatDisplayDate(item.date) || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.notary || item.notaryName || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">{formatCurrency(String(item.value || 0))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {legalActions.length > 0 && (
        <StrategySectionWrapper
          title="Ações Cíveis"
          icon={<Gavel className="w-5 h-5 text-red-500" />}
          count={legalActions.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Processo</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {legalActions.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatDisplayDate(item.date) || '-'}</TableCell>
                  <TableCell className="font-medium">{item.type || '-'}</TableCell>
                  <TableCell>{item.origin || '-'}</TableCell>
                  <TableCell>{item.processo || '-'}</TableCell>
                  <TableCell>{item.autor || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">{formatCurrency(String(item.value || 0))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {data.painelNotaComportamento && (
        <StrategySectionWrapper
          title="Nota de Comportamento"
          icon={<Activity className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.painelNotaComportamento.notaFaturaEmAtraso && (
              <InfoBox
                label={data.painelNotaComportamento.notaFaturaEmAtraso.label || 'Fatura em Atraso'}
                value={data.painelNotaComportamento.notaFaturaEmAtraso.nota || '-'}
                icon={<AlertTriangle className="w-4 h-4 text-gray-400" />}
              />
            )}
            {data.painelNotaComportamento.notaContratosRecentes && (
              <InfoBox
                label={data.painelNotaComportamento.notaContratosRecentes.label || 'Contratos Recentes'}
                value={data.painelNotaComportamento.notaContratosRecentes.nota || '-'}
                icon={<FileText className="w-4 h-4 text-gray-400" />}
              />
            )}
            {data.painelNotaComportamento.notaAdiantamentoDePagamento && (
              <InfoBox
                label={data.painelNotaComportamento.notaAdiantamentoDePagamento.label || 'Adiantamento'}
                value={data.painelNotaComportamento.notaAdiantamentoDePagamento.nota || '-'}
                icon={<CheckCircle2 className="w-4 h-4 text-gray-400" />}
              />
            )}
          </div>
        </StrategySectionWrapper>
      )}

      {data.painelMaturidadeCredito && (
        <StrategySectionWrapper
          title="Maturidade de Crédito"
          icon={<Clock className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.painelMaturidadeCredito.txtTempoExperiencia && (
              <InfoBox label="Tempo de Experiência" value={data.painelMaturidadeCredito.txtTempoExperiencia} icon={<Clock className="w-4 h-4 text-gray-400" />} />
            )}
            {data.painelMaturidadeCredito.datContratoMaisAntigo && (
              <InfoBox label="Contrato Mais Antigo" value={formatDisplayDate(data.painelMaturidadeCredito.datContratoMaisAntigo)} icon={<Calendar className="w-4 h-4 text-gray-400" />} />
            )}
            {data.painelMaturidadeCredito.mesesContratoMaisAntigo != null && (
              <InfoBox label="Meses de Experiência" value={String(data.painelMaturidadeCredito.mesesContratoMaisAntigo)} icon={<TrendingUp className="w-4 h-4 text-gray-400" />} />
            )}
          </div>
        </StrategySectionWrapper>
      )}

      {data.painelPontuacaoComprometimento && (
        <StrategySectionWrapper
          title="Comprometimento"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="space-y-4 p-4">
            {data.painelPontuacaoComprometimento.operacoesParceladas?.periodos && data.painelPontuacaoComprometimento.operacoesParceladas.periodos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{data.painelPontuacaoComprometimento.operacoesParceladas.blocoLabel || 'Parcelados'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.painelPontuacaoComprometimento.operacoesParceladas.periodos.map((p, i) => (
                    <InfoBox key={i} label={p.label || '-'} value={p.valor || '-'} />
                  ))}
                </div>
              </div>
            )}
            {data.painelPontuacaoComprometimento.servicosContinuados?.periodos && data.painelPontuacaoComprometimento.servicosContinuados.periodos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{data.painelPontuacaoComprometimento.servicosContinuados.blocoLabel || 'Serviços Continuados'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.painelPontuacaoComprometimento.servicosContinuados.periodos.map((p, i) => (
                    <InfoBox key={i} label={p.label || '-'} value={p.valor || '-'} />
                  ))}
                </div>
              </div>
            )}
            {data.painelPontuacaoComprometimento.cartaoCreditoChequeOutrosRotativos?.periodos && data.painelPontuacaoComprometimento.cartaoCreditoChequeOutrosRotativos.periodos.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">{data.painelPontuacaoComprometimento.cartaoCreditoChequeOutrosRotativos.blocoLabel || 'Cartão/Cheque/Rotativos'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.painelPontuacaoComprometimento.cartaoCreditoChequeOutrosRotativos.periodos.map((p, i) => (
                    <InfoBox key={i} label={p.label || '-'} value={p.valor || '-'} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </StrategySectionWrapper>
      )}

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
                  <TableCell>{formatDisplayDate(item.date) || '-'}</TableCell>
                  <TableCell className="font-medium">{item.entity || '-'}</TableCell>
                  <TableCell>{item.cityState || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      <CommercialAnalysisExtraSections data={data} />
    </div>
  );
}
