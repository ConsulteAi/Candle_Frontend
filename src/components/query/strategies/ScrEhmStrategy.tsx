'use client';

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
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

function scoreBadgeVariant(faixa: string): 'success' | 'warning' | 'error' | 'info' {
  const f = (faixa || '').toUpperCase();
  if (['EXCELENTE', 'MUITO BOM', 'BOM'].some((k) => f.includes(k))) return 'success';
  if (['REGULAR', 'MÉDIO', 'MEDIO'].some((k) => f.includes(k))) return 'warning';
  if (['ALTO RISCO', 'RUIM', 'PESSIMO', 'PÉSSIMO'].some((k) => f.includes(k))) return 'error';
  return 'info';
}

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
                    isRestritivo
                      ? 'bg-red-50 text-red-700'
                      : 'bg-white text-gray-500',
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

  const hasRestrictions =
    Number(consolidado.creditoVencido?.valor ?? 0) > 0 ||
    Number(consolidado.prejuizo?.valor ?? 0) > 0;

  const isPj =
    (resumo.tipoDocumento || '').toUpperCase() === 'JURIDICA';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Header row ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-12 gap-6">
        {/* Score badge */}
        <div className="md:col-span-4">
          <Card className="h-full relative overflow-hidden border-2 border-primary/20 dark:border-primary/80 bg-gradient-to-br from-white to-primary/10 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex flex-col items-center justify-center py-8 gap-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Score SCR BACEN
                </span>
              </div>

              {/* Arc gauge */}
              <div className="relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                  <circle
                    cx="72" cy="72" r="62"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    strokeDasharray={390}
                    strokeDashoffset={390 - (390 * Math.min(score.pontuacao, 1000)) / 1000}
                    className={cn(
                      'transition-all duration-1000 ease-out',
                      score.pontuacao > 600 ? 'text-green-500' :
                      score.pontuacao > 300 ? 'text-yellow-500' : 'text-red-500',
                    )}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {score.pontuacao}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">/ 1000</span>
                </div>
              </div>

              <Badge variant={scoreBadgeVariant(score.faixa)}>
                {score.faixa || 'Sem faixa'}
              </Badge>

              <p className="text-xs text-gray-400 text-center px-4">
                Faixas: até 300 = alto risco · 301–600 = médio · acima de 600 = baixo risco
              </p>
            </div>
          </Card>
        </div>

        {/* Resumo Info */}
        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
            <StrategyHeader
              title="SCR BACEN via EHM"
              subtitle={`Documento: ${resumo.documento || '-'}`}
              status={hasRestrictions ? 'COM RESTRIÇÕES' : 'SEM RESTRIÇÕES'}
              statusVariant={hasRestrictions ? 'warning' : 'success'}
              pdfUrl={data.pdf}
              queryId={queryId}
              className="mb-6"
            >
              <Badge variant="info">{isPj ? 'Pessoa Jurídica' : 'Pessoa Física'}</Badge>
            </StrategyHeader>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoBox
                label="Tipo"
                value={resumo.tipoDocumento || '-'}
                icon={<Building2 className="w-4 h-4 text-primary" />}
              />
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
                label="Qtd Instituições"
                value={String(resumo.qtdInstituicoes ?? 0)}
                icon={<Building2 className="w-4 h-4 text-gray-400" />}
              />
              <InfoBox
                label="Qtd Operações"
                value={String(resumo.qtdOperacoes ?? 0)}
                icon={<BarChart3 className="w-4 h-4 text-primary" />}
              />
              <InfoBox
                label="Discordâncias"
                value={String(resumo.qtdOperacoesDiscordancia ?? 0)}
                icon={<AlertTriangle className="w-4 h-4 text-yellow-500" />}
              />
              <InfoBox
                label="Sub Judice"
                value={String(resumo.qtdOperacoesSubjudice ?? 0)}
                icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* ── Consolidado (4 buckets) ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Crédito a Vencer"
          value={formatBRL(consolidado.creditoAVencer?.valor)}
          subtitle={formatPct(consolidado.creditoAVencer?.percentual)}
          color="blue"
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard
          title="Crédito Vencido"
          value={formatBRL(consolidado.creditoVencido?.valor)}
          subtitle={formatPct(consolidado.creditoVencido?.percentual)}
          color={Number(consolidado.creditoVencido?.valor ?? 0) > 0 ? 'red' : 'green'}
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
          subtitle={formatPct(consolidado.prejuizo?.percentual)}
          color={Number(consolidado.prejuizo?.valor ?? 0) > 0 ? 'red' : 'gray'}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Contextual note */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary/80 leading-relaxed">
        <strong>Nota:</strong> Crédito a Vencer = parcelas futuras em aberto (não restritivo). Crédito Vencido = parcelas em atraso não baixadas (fator de atenção). Prejuízo = operações baixadas definitivamente (fator restritivo de maior peso). Percentual de prejuízo acima de 50% indica exposição financeira elevada.
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
