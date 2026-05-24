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
  TrendingDown,
  User,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  RaioXCreditoRatingScrResult,
  ScrEhmEnrichment,
  ScrEhmOperacao,
} from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { cn, formatDisplayDate } from '@/lib/utils';
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

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtBRL = (v: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0));

const fmtPct = (v: number | undefined) => `${Number(v ?? 0).toFixed(2)}%`;

function ScrBacenEhmSection({ scrBacen }: { scrBacen: ScrEhmEnrichment }) {
  const consolidado = scrBacen.consolidado ?? {};
  const operacoes: ScrEhmOperacao[] = Array.isArray(scrBacen.operacoes) ? scrBacen.operacoes : [];
  const score = scrBacen.score ?? { pontuacao: 0, faixa: '' };

  return (
    <div className="space-y-6 p-4">
      {/* Score badge + resumo info */}
      <div className="grid md:grid-cols-12 gap-4">
        <div className="md:col-span-3 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">Score SCR</span>
          <span className={cn(
            'text-4xl font-bold',
            score.pontuacao > 600 ? 'text-green-600' : score.pontuacao > 300 ? 'text-yellow-600' : 'text-red-600',
          )}>
            {score.pontuacao}
          </span>
          <span className="text-xs text-gray-500 mb-2">/ 1000</span>
          <Badge variant={
            score.pontuacao > 600 ? 'success' :
            score.pontuacao > 300 ? 'warning' : 'error'
          }>
            {score.faixa || '—'}
          </Badge>
        </div>

        <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoBox label="Base Consultada" value={scrBacen.resumo?.databaseConsultada || '-'} icon={<Calendar className="w-4 h-4 text-primary" />} />
          <InfoBox label="Início Relac." value={scrBacen.resumo?.dataInicioRelacionamento || '-'} icon={<Clock className="w-4 h-4 text-primary" />} />
          <InfoBox label="Qtd Instituições" value={String(scrBacen.resumo?.qtdInstituicoes ?? 0)} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
          <InfoBox label="Qtd Operações" value={String(scrBacen.resumo?.qtdOperacoes ?? 0)} icon={<BarChart3 className="w-4 h-4 text-primary" />} />
        </div>
      </div>

      {/* Consolidado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard title="A Vencer" value={fmtBRL(consolidado.creditoAVencer?.valor)} subtitle={fmtPct(consolidado.creditoAVencer?.percentual)} color="blue" icon={<Clock className="w-5 h-5" />} />
        <SummaryCard title="Vencido" value={fmtBRL(consolidado.creditoVencido?.valor)} subtitle={fmtPct(consolidado.creditoVencido?.percentual)} color={Number(consolidado.creditoVencido?.valor ?? 0) > 0 ? 'red' : 'green'} icon={<AlertTriangle className="w-5 h-5" />} />
        <SummaryCard title="Limite" value={fmtBRL(consolidado.limiteCredito?.valor)} subtitle={fmtPct(consolidado.limiteCredito?.percentual)} color="green" icon={<CheckCircle2 className="w-5 h-5" />} />
        <SummaryCard title="Prejuízo" value={fmtBRL(consolidado.prejuizo?.valor)} subtitle={fmtPct(consolidado.prejuizo?.percentual)} color={Number(consolidado.prejuizo?.valor ?? 0) > 0 ? 'red' : 'gray'} icon={<TrendingDown className="w-5 h-5" />} />
      </div>

      {/* Operações */}
      {operacoes.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modalidade</TableHead>
              <TableHead>Sub-Modalidade</TableHead>
              <TableHead className="text-right">% Port.</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operacoes.map((op, idx) => (
              <>
                <TableRow key={`scr-op-${idx}`} className="bg-gray-50/60">
                  <TableCell className="font-semibold">{op.modalidade || '-'}</TableCell>
                  <TableCell>{op.subModalidade || '-'}</TableCell>
                  <TableCell className="text-right">{fmtPct(op.percentual)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{fmtBRL(op.total)}</TableCell>
                </TableRow>
                {(op.vencimentos ?? []).map((v, vi) => {
                  const isR = v.restritivo === '1' || v.restritivo === 'true' || v.restritivo === 'RESTRITIVO';
                  return (
                    <TableRow key={`scr-op-${idx}-v-${vi}`} className={cn('text-xs', isR ? 'bg-red-50 text-red-700' : 'text-gray-500')}>
                      <TableCell colSpan={2} className="pl-8 italic">
                        ↳ {v.descricao || '-'}{v.qtdMeses ? ` (${v.qtdMeses} meses)` : ''}
                        {isR && <span className="ml-2 font-semibold text-red-600 uppercase text-xs">Restritivo</span>}
                      </TableCell>
                      <TableCell className="text-right">{fmtPct(v.percentual)}</TableCell>
                      <TableCell className="text-right font-medium">{fmtBRL(v.valor)}</TableCell>
                    </TableRow>
                  );
                })}
              </>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

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

      {/* ── SCR BACEN EHM enrichment ───────────────────────────────────── */}
      {data.scrBacen && (
        <StrategySectionWrapper
          title="SCR BACEN (EHM)"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <ScrBacenEhmSection scrBacen={data.scrBacen} />
        </StrategySectionWrapper>
      )}

      {data.scrBacenUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.scrBacenMessage || 'A posição BACEN SCR (EHM) não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}
    </div>
  );
}
