'use client';

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  TrendingDown,
} from 'lucide-react';
import { Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  ScrEhmResult,
  ScrEhmOperacao,
} from '@/types/query-strategies';
import { cn } from '@/lib/utils';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { SummaryCard } from './components/SummaryCard';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';
import { ScoreGauge } from './components/ScoreGauge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatBRL = (val: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(val ?? 0),
  );

const formatPct = (val: number | undefined) =>
  `${Number(val ?? 0).toFixed(2)}%`;

// ─── operações table ──────────────────────────────────────────────────────────

function OperacoesTable({ operacoes }: { operacoes: ScrEhmOperacao[] }) {
  if (!operacoes || operacoes.length === 0) return null;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modalidade</TableHead>
          <TableHead>Sub-Modalidade</TableHead>
          <TableHead>Câmbio</TableHead>
          <TableHead className="text-right">% Port.</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operacoes.map((op, idx) => (
          <>
            <TableRow key={`op-${idx}`} className="bg-gray-50/60">
              <TableCell className="font-semibold">{op.modalidade || '-'}</TableCell>
              <TableCell>{op.subModalidade || '-'}</TableCell>
              <TableCell>{op.variacaoCambial || '0'}</TableCell>
              <TableCell className="text-right">{formatPct(op.percentual)}</TableCell>
              <TableCell className="text-right font-bold text-primary">
                {formatBRL(op.total)}
              </TableCell>
            </TableRow>
            {(op.vencimentos ?? []).map((v, vi) => {
              const isRestritivo =
                v.restritivo === '1' || v.restritivo === 'true' || v.restritivo === 'RESTRITIVO';
              return (
                <TableRow
                  key={`op-${idx}-v-${vi}`}
                  className={cn(
                    'text-xs',
                    isRestritivo ? 'bg-red-50 text-red-700' : 'bg-white text-gray-500',
                  )}
                >
                  <TableCell colSpan={2} className="pl-8 italic">
                    ↳ {v.descricao || '-'}
                    {v.qtdMeses ? ` (${v.qtdMeses} meses)` : ''}
                    {isRestritivo && (
                      <span className="ml-2 text-xs font-semibold text-red-600 uppercase">
                        Restritivo
                      </span>
                    )}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right">{formatPct(v.percentual)}</TableCell>
                  <TableCell className="text-right font-medium">{formatBRL(v.valor)}</TableCell>
                </TableRow>
              );
            })}
          </>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function ScrEhmStrategy({
  data,
  queryId,
}: QueryStrategyProps<ScrEhmResult>) {
  if (!data) return null;

  const resumo = data.resumo ?? {};
  const consolidado = data.consolidado ?? {};
  const score = data.score ?? { pontuacao: 0, faixa: '' };
  const operacoes = Array.isArray(data.operacoes) ? data.operacoes : [];

  const hasVencido = Number(consolidado.creditoVencido?.valor ?? 0) > 0;
  const hasPrejuizo = Number(consolidado.prejuizo?.valor ?? 0) > 0;
  const hasDiscordancia = Number(resumo.qtdOperacoesDiscordancia ?? 0) > 0;
  const hasSubJudice = Number(resumo.qtdOperacoesSubjudice ?? 0) > 0;
  const hasRestrictions = hasVencido || hasPrejuizo;

  const isPj = (resumo.tipoDocumento || '').toUpperCase() === 'JURIDICA';

  const riskLabel =
    score.pontuacao > 600
      ? 'Baixo risco sistêmico'
      : score.pontuacao > 300
        ? 'Risco moderado de inadimplência'
        : 'Alto risco de inadimplência';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-12 gap-6">

        {/* Score gauge */}
        <div className="md:col-span-4">
          <ScoreGauge
            value={score.pontuacao}
            max={1000}
            band={score.faixa || undefined}
            riskText={riskLabel}
            label="/ 1000"
          />
        </div>

        {/* Resumo info */}
        <div className="md:col-span-8">
          <div className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary rounded-xl flex flex-col gap-5">
            <StrategyHeader
              title="SCR BACEN"
              subtitle={`Documento: ${resumo.documento || '-'}`}
              status={hasRestrictions ? 'COM RESTRIÇÕES' : 'SEM RESTRIÇÕES'}
              statusVariant={hasRestrictions ? 'warning' : 'success'}
              pdfUrl={data.pdf}
              queryId={queryId}
            >
              <Badge variant="info">{isPj ? 'Pessoa Jurídica' : 'Pessoa Física'}</Badge>
            </StrategyHeader>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-primary/30 pl-3">
              Posição consolidada do <strong>Sistema de Informações de Créditos (SCR)</strong> do
              Banco Central do Brasil — inclui todas as operações de crédito registradas por
              instituições financeiras autorizadas pelo BACEN.
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoBox
                label="Base Consultada"
                value={resumo.databaseConsultada || '-'}
                icon={<Calendar className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Início Relacionamento"
                value={resumo.dataInicioRelacionamento || '-'}
                icon={<Clock className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Instituições"
                value={String(resumo.qtdInstituicoes ?? 0)}
                icon={<Building2 className="w-4 h-4 text-gray-400" />}
              />
              <InfoBox
                label="Operações"
                value={String(resumo.qtdOperacoes ?? 0)}
                icon={<BarChart3 className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Discordâncias"
                value={String(resumo.qtdOperacoesDiscordancia ?? 0)}
                icon={
                  <AlertTriangle
                    className={cn('w-4 h-4', hasDiscordancia ? 'text-yellow-500' : 'text-gray-300')}
                  />
                }
              />
              <InfoBox
                label="Sub Judice"
                value={String(resumo.qtdOperacoesSubjudice ?? 0)}
                icon={
                  <AlertTriangle
                    className={cn('w-4 h-4', hasSubJudice ? 'text-orange-500' : 'text-gray-300')}
                  />
                }
              />
            </div>

            {/* Alertas de discordância/sub judice */}
            {(hasDiscordancia || hasSubJudice) && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 leading-relaxed flex gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-600" />
                <span>
                  {hasDiscordancia && (
                    <><strong>{resumo.qtdOperacoesDiscordancia}</strong> operação(ões) com discordância registrada pelo tomador.{' '}</>
                  )}
                  {hasSubJudice && (
                    <><strong>{resumo.qtdOperacoesSubjudice}</strong> operação(ões) em disputa judicial (sub judice).</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Consolidado (4 buckets) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Crédito a Vencer"
          value={formatBRL(consolidado.creditoAVencer?.valor)}
          subtitle={`${formatPct(consolidado.creditoAVencer?.percentual)} · não restritivo`}
          color="blue"
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard
          title="Crédito Vencido"
          value={formatBRL(consolidado.creditoVencido?.valor)}
          subtitle={hasVencido ? `${formatPct(consolidado.creditoVencido?.percentual)} · atenção` : 'Nada consta'}
          color={hasVencido ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Limite de Crédito"
          value={formatBRL(consolidado.limiteCredito?.valor)}
          subtitle={formatPct(consolidado.limiteCredito?.percentual)}
          color="green"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Prejuízo"
          value={formatBRL(consolidado.prejuizo?.valor)}
          subtitle={hasPrejuizo ? `${formatPct(consolidado.prejuizo?.percentual)} · restritivo` : 'Nada consta'}
          color={hasPrejuizo ? 'red' : 'gray'}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Legenda */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary/80 leading-relaxed flex gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          <strong>Legenda:</strong>{' '}
          <span className="text-blue-700">Crédito a Vencer</span> = parcelas futuras em aberto (não restritivo).{' '}
          <span className="text-red-600">Crédito Vencido</span> = atraso não baixado (fator de atenção).{' '}
          <span className="text-red-700 font-semibold">Prejuízo</span> = operações baixadas definitivamente — fator restritivo de maior peso.
          Prejuízo &gt; 50% indica exposição financeira elevada.
        </span>
      </div>

      {/* ── Operações por modalidade ───────────────────────────────────── */}
      <StrategySectionWrapper
        title="Operações por Modalidade"
        icon={<BarChart3 className="w-5 h-5 text-primary" />}
        count={operacoes.length}
        isEmpty={operacoes.length === 0}
        emptyMessage="Nenhuma operação disponível no SCR para este documento."
      >
        <OperacoesTable operacoes={operacoes} />
      </StrategySectionWrapper>
    </div>
  );
}
