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
import { Badge } from '@/design-system/ComponentsTailwind';
import type { ScrEhmEnrichment, ScrEhmOperacao } from '@/types/query-strategies';
import { cn } from '@/lib/utils';
import { InfoBox } from './InfoBox';
import { SummaryCard } from './SummaryCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

const fmtBRL = (v: number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v ?? 0));

const fmtPct = (v: number | undefined) => `${Number(v ?? 0).toFixed(2)}%`;

// ─── SCR BACEN enrichment section ────────────────────────────────────────────

export function ScrBacenSection({ scrBacen }: { scrBacen: ScrEhmEnrichment }) {
  const resumo = scrBacen.resumo ?? {};
  const consolidado = scrBacen.consolidado ?? {};
  const operacoes: ScrEhmOperacao[] = Array.isArray(scrBacen.operacoes) ? scrBacen.operacoes : [];
  const score = scrBacen.score ?? { pontuacao: 0, faixa: '' };

  const hasVencido = Number(consolidado.creditoVencido?.valor ?? 0) > 0;
  const hasPrejuizo = Number(consolidado.prejuizo?.valor ?? 0) > 0;
  const hasDiscordancia = Number(resumo.qtdOperacoesDiscordancia ?? 0) > 0;
  const hasSubJudice = Number(resumo.qtdOperacoesSubjudice ?? 0) > 0;

  const pontuacao = score.pontuacao ?? 0;
  const hasScore = pontuacao > 0 || Boolean(score.faixa);
  const qtdOperacoes = Number(resumo.qtdOperacoes ?? 0);
  const semScoreMensagem =
    qtdOperacoes > 0
      ? 'O Banco Central não disponibilizou uma pontuação de score para este documento, apesar de haver operações de crédito registradas no SCR.'
      : 'O Banco Central não disponibilizou uma pontuação de score para este documento — não há operações de crédito registradas no SCR.';
  const scoreColor =
    pontuacao > 600 ? 'text-green-600' : pontuacao > 300 ? 'text-yellow-600' : 'text-red-600';
  const scoreBorderColor =
    pontuacao > 600 ? 'border-green-200' : pontuacao > 300 ? 'border-yellow-200' : 'border-red-200';
  const scoreBg =
    pontuacao > 600
      ? 'from-green-50 to-emerald-50'
      : pontuacao > 300
        ? 'from-yellow-50 to-amber-50'
        : 'from-red-50 to-rose-50';
  const badgeVariant: 'success' | 'warning' | 'error' =
    pontuacao > 600 ? 'success' : pontuacao > 300 ? 'warning' : 'error';
  const strokeColor =
    pontuacao > 600 ? '#22C55E' : pontuacao > 300 ? '#F59E0B' : '#EF4444';
  const riskLabel =
    pontuacao > 600
      ? 'Baixo risco sistêmico'
      : pontuacao > 300
        ? 'Risco moderado'
        : 'Alto risco de inadimplência';

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (circumference * Math.min(pontuacao, 1000)) / 1000;

  return (
    <div className="space-y-5 p-4">

      {/* ── Score + Resumo ── */}
      <div className="grid md:grid-cols-12 gap-4">

        {/* Score gauge */}
        {hasScore ? (
          <div className={cn(
            'md:col-span-3 flex flex-col items-center justify-center rounded-xl p-5 text-center border bg-gradient-to-br',
            scoreBg, scoreBorderColor,
          )}>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Score SCR BACEN
            </span>

            <div className="relative mb-2">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#E5E7EB" strokeWidth="9" fill="transparent" />
                <circle
                  cx="60" cy="60" r="52"
                  stroke={strokeColor}
                  strokeWidth="9" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-3xl font-bold tabular-nums', scoreColor)}>
                  {pontuacao}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">/ 1000</span>
              </div>
            </div>

            <Badge variant={badgeVariant} className="mb-1">
              {score.faixa || '—'}
            </Badge>
            <p className="text-[10px] text-gray-500 leading-tight font-medium">{riskLabel}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">
              ≤300 alto · 301–600 médio · &gt;600 baixo
            </p>
          </div>
        ) : (
          <div className="md:col-span-3 flex flex-col items-center justify-center rounded-xl p-5 text-center border bg-gray-50 border-gray-200">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Score SCR BACEN
            </span>
            <span className="text-2xl font-bold text-gray-400 mb-2">—</span>
            <p className="text-[11px] text-gray-500 leading-snug">{semScoreMensagem}</p>
          </div>
        )}

        {/* Resumo info */}
        <div className="md:col-span-9 flex flex-col gap-3">
          <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-primary/30 pl-3">
            Posição consolidada do <strong>Sistema de Informações de Créditos (SCR)</strong> do Banco Central
            do Brasil — reflete todas as operações de crédito registradas por instituições financeiras
            autorizadas pelo BACEN para este documento.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

          {(hasDiscordancia || hasSubJudice) && (
            <div className="rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 leading-relaxed">
              <strong>Atenção:</strong>{' '}
              {hasDiscordancia && `${resumo.qtdOperacoesDiscordancia} operação(ões) com discordância registrada pelo tomador. `}
              {hasSubJudice && `${resumo.qtdOperacoesSubjudice} operação(ões) em disputa judicial (sub judice).`}
            </div>
          )}
        </div>
      </div>

      {/* ── Consolidado ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          title="Crédito a Vencer"
          value={fmtBRL(consolidado.creditoAVencer?.valor)}
          subtitle={`${fmtPct(consolidado.creditoAVencer?.percentual)} · não restritivo`}
          color="blue"
          icon={<Clock className="w-5 h-5" />}
        />
        <SummaryCard
          title="Crédito Vencido"
          value={fmtBRL(consolidado.creditoVencido?.valor)}
          subtitle={hasVencido ? `${fmtPct(consolidado.creditoVencido?.percentual)} · atenção` : 'Nada consta'}
          color={hasVencido ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Limite de Crédito"
          value={fmtBRL(consolidado.limiteCredito?.valor)}
          subtitle={fmtPct(consolidado.limiteCredito?.percentual)}
          color="green"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Prejuízo"
          value={fmtBRL(consolidado.prejuizo?.valor)}
          subtitle={hasPrejuizo ? `${fmtPct(consolidado.prejuizo?.percentual)} · restritivo` : 'Nada consta'}
          color={hasPrejuizo ? 'red' : 'gray'}
          icon={<TrendingDown className="w-5 h-5" />}
        />
      </div>

      {/* Legenda */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary/80 leading-relaxed">
        <strong>Legenda:</strong>{' '}
        <span className="text-blue-700">Crédito a Vencer</span> = parcelas futuras em aberto (não restritivo).{' '}
        <span className="text-red-600">Crédito Vencido</span> = atraso não baixado (fator de atenção).{' '}
        <span className="text-red-700 font-semibold">Prejuízo</span> = operações baixadas definitivamente — fator restritivo de maior peso.
        Prejuízo &gt; 50% indica exposição elevada.
      </div>

      {/* ── Operações ── */}
      {operacoes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2 px-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Operações por Modalidade ({operacoes.length})
          </p>
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
                    <TableCell className="text-right font-bold text-primary">
                      {fmtBRL(op.total)}
                    </TableCell>
                  </TableRow>
                  {(op.vencimentos ?? []).map((v, vi) => {
                    const isR =
                      v.restritivo === '1' ||
                      v.restritivo === 'true' ||
                      v.restritivo === 'RESTRITIVO';
                    return (
                      <TableRow
                        key={`scr-op-${idx}-v-${vi}`}
                        className={cn('text-xs', isR ? 'bg-red-50 text-red-700' : 'text-gray-500')}
                      >
                        <TableCell colSpan={2} className="pl-8 italic">
                          ↳ {v.descricao || '-'}
                          {v.qtdMeses ? ` (${v.qtdMeses} meses)` : ''}
                          {isR && (
                            <span className="ml-2 font-semibold text-red-600 uppercase text-[10px]">
                              Restritivo
                            </span>
                          )}
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
        </div>
      )}
    </div>
  );
}
