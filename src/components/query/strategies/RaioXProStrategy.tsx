'use client';

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileWarning,
  Gavel,
  Hash,
  Landmark,
  ShieldAlert,
  TrendingDown,
  User,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  RaioXProResult,
  RaioXMarketRestrictions,
  ScrEhmEnrichment,
  ScrEhmOperacao,
  CcfEnrichment,
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

const CCF_MOTIVOS: Record<string, string> = {
  '11': 'Insuficiência de fundos – 1ª apresentação',
  '12': 'Insuficiência de fundos – 2ª apresentação',
  '13': 'Conta encerrada',
  '14': 'Prática espúria',
  '21': 'Cheque prescrito',
  '22': 'Divergência ou insuficiência de assinatura',
  '23': 'Emitente menor',
  '24': 'Contraordem do emitente',
  '25': 'Cancelamento de talonário pelo banco',
  '26': 'Bloqueio judicial / BCB',
  '27': 'Furto ou roubo de malotes',
  '28': 'Encerramento de conta corrente',
  '29': 'Conta encerrada pelo BCB',
};

function formatMotivo(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/^(\d+)/);
  if (match) {
    const code = match[1];
    if (CCF_MOTIVOS[code]) return `${code} – ${CCF_MOTIVOS[code]}`;
  }
  return raw;
}

// ─── Market Restrictions section ─────────────────────────────────────────────

function MarketRestrictionsSection({ mr }: { mr: RaioXMarketRestrictions }) {
  const summary = mr.summary ?? {};
  const scpcDebts = mr.scpcDebts ?? [];
  const refinPefinDebts = mr.refinPefinDebts ?? [];
  const protests = mr.protests ?? [];
  const badChecks = mr.badChecks ?? [];
  const cadin = mr.cadin ?? [];
  const legalActions = mr.legalActions ?? [];

  const hasAny =
    scpcDebts.length > 0 ||
    refinPefinDebts.length > 0 ||
    protests.length > 0 ||
    badChecks.length > 0 ||
    cadin.length > 0 ||
    legalActions.length > 0;

  return (
    <div className="space-y-5 p-4">
      <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-indigo-300 pl-3">
        Restrições de mercado consultadas via birôs de crédito — inclui dívidas SCPC, pendências
        REFIN/PEFIN, protestos em cartório, cheques sem fundo e inscrições em CADIN.{' '}
        {!hasAny && <span className="font-semibold text-green-700">Nenhuma restrição encontrada.</span>}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          title="SCPC"
          value={summary.totalScpcDebts || 0}
          subtitle={(summary.totalScpcDebts || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(summary.totalScpcDebts || 0) > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="REFIN / PEFIN"
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
      </div>

      {mr.serasaSummary && (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-4 py-3 grid grid-cols-3 gap-4">
          <InfoBox
            label="1ª Ocorrência SERASA"
            value={mr.serasaSummary.firstOccurrenceDate || '-'}
            icon={<Calendar className="w-4 h-4 text-blue-500" />}
          />
          <InfoBox
            label="Última Ocorrência SERASA"
            value={mr.serasaSummary.lastOccurrenceDate || '-'}
            icon={<Calendar className="w-4 h-4 text-blue-500" />}
          />
          <InfoBox
            label="Total SERASA"
            value={String(mr.serasaSummary.totalOccurrences || 0)}
            icon={<FileWarning className="w-4 h-4 text-blue-500" />}
          />
        </div>
      )}

      {scpcDebts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 flex items-center gap-2 px-1">
            <AlertTriangle className="w-3.5 h-3.5" />
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
                  <TableCell className="font-medium">{item.creditorName || '-'}</TableCell>
                  <TableCell>{item.city && item.state ? `${item.city} / ${item.state}` : item.city || item.state || '-'}</TableCell>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 flex items-center gap-2 px-1">
            <FileWarning className="w-3.5 h-3.5" />
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
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 flex items-center gap-2 px-1">
            <Landmark className="w-3.5 h-3.5" />
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
                  <TableCell>{item.date || '-'}</TableCell>
                  <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                  <TableCell>{item.notary || '-'}</TableCell>
                  <TableCell>{item.city && item.state ? `${item.city} / ${item.state}` : item.city || item.state || '-'}</TableCell>
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
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
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
                  <TableCell className="font-medium">{item.bankNumber || '-'}</TableCell>
                  <TableCell>{item.branch || '-'}</TableCell>
                  <TableCell>{item.alinea || '-'}</TableCell>
                  <TableCell>{item.lastOccurrence || '-'}</TableCell>
                  <TableCell>{item.city && item.state ? `${item.city} / ${item.state}` : item.city || item.state || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-yellow-700">{item.quantity || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {cadin.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 flex items-center gap-2 px-1">
            <Building2 className="w-3.5 h-3.5" />
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
                  <TableCell>{item.registrationDate || '-'}</TableCell>
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

      {legalActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 flex items-center gap-2 px-1">
            <Gavel className="w-3.5 h-3.5" />
            Ações Judiciais ({legalActions.length})
          </p>
          <div className="space-y-2">
            {legalActions.map((item, idx) => (
              <pre key={idx} className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto">
                {JSON.stringify(item, null, 2)}
              </pre>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SCR BACEN enrichment section ────────────────────────────────────────────

function ScrBacenSection({ scrBacen }: { scrBacen: ScrEhmEnrichment }) {
  const resumo = scrBacen.resumo ?? {};
  const consolidado = scrBacen.consolidado ?? {};
  const operacoes: ScrEhmOperacao[] = Array.isArray(scrBacen.operacoes) ? scrBacen.operacoes : [];
  const score = scrBacen.score ?? { pontuacao: 0, faixa: '' };

  const hasVencido = Number(consolidado.creditoVencido?.valor ?? 0) > 0;
  const hasPrejuizo = Number(consolidado.prejuizo?.valor ?? 0) > 0;
  const hasDiscordancia = Number(resumo.qtdOperacoesDiscordancia ?? 0) > 0;
  const hasSubJudice = Number(resumo.qtdOperacoesSubjudice ?? 0) > 0;

  const pontuacao = score.pontuacao ?? 0;
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
      <div className="grid md:grid-cols-12 gap-4">
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
              icon={<AlertTriangle className={cn('w-4 h-4', hasDiscordancia ? 'text-yellow-500' : 'text-gray-300')} />}
            />
            <InfoBox
              label="Sub Judice"
              value={String(resumo.qtdOperacoesSubjudice ?? 0)}
              icon={<AlertTriangle className={cn('w-4 h-4', hasSubJudice ? 'text-orange-500' : 'text-gray-300')} />}
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

      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary/80 leading-relaxed">
        <strong>Legenda:</strong>{' '}
        <span className="text-blue-700">Crédito a Vencer</span> = parcelas futuras em aberto (não restritivo).{' '}
        <span className="text-red-600">Crédito Vencido</span> = atraso não baixado (fator de atenção).{' '}
        <span className="text-red-700 font-semibold">Prejuízo</span> = operações baixadas definitivamente — fator restritivo de maior peso.
        Prejuízo &gt; 50% indica exposição elevada.
      </div>

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

// ─── CCF section ──────────────────────────────────────────────────────────────

function CcfSection({ ccf }: { ccf: CcfEnrichment }) {
  const summary = ccf.summary ?? { totalRegistro: 0, sumQteOcorrencias: 0, ultimaOcorrencia: '' };
  const historico = Array.isArray(ccf.historico) ? ccf.historico : [];
  const lista = Array.isArray(ccf.lista) ? ccf.lista : [];
  const hasOccurrences = summary.totalRegistro > 0 || summary.sumQteOcorrencias > 0;

  return (
    <div className="space-y-5 p-4">
      <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-red-300 pl-3">
        Consulta ao <strong>CCF (Cadastro de Cheques sem Fundos)</strong> do Banco Central do Brasil —
        registra devolução de cheques por insuficiência de fundos e outros motivos bancários.{' '}
        {!hasOccurrences && (
          <span className="font-semibold text-green-700">Nenhum registro encontrado.</span>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Registros"
          value={summary.totalRegistro || 0}
          subtitle={(summary.totalRegistro || 0) > 0 ? 'Bancos com ocorrência' : 'Nenhum registro'}
          color={(summary.totalRegistro || 0) > 0 ? 'red' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
        <SummaryCard
          title="Total de Ocorrências"
          value={summary.sumQteOcorrencias || 0}
          subtitle={(summary.sumQteOcorrencias || 0) > 0 ? 'Cheques devolvidos' : 'Nenhuma ocorrência'}
          color={(summary.sumQteOcorrencias || 0) > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <InfoBox
          label="Última Ocorrência"
          value={formatDisplayDate(summary.ultimaOcorrencia) || 'Sem registros'}
          icon={<Calendar className="w-4 h-4 text-primary" />}
        />
      </div>

      {!hasOccurrences && (
        <div className="rounded-lg border border-green-100 bg-green-50/50 flex items-center gap-3 p-4">
          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Nada consta no CCF</p>
            <p className="text-xs text-green-700 mt-0.5">
              Este documento não possui registros de cheques devolvidos no Banco Central.
            </p>
          </div>
        </div>
      )}

      {lista.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 flex items-center gap-2 px-1">
            <Landmark className="w-3.5 h-3.5" />
            Ocorrências por Banco ({lista.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Última Ocorrência</TableHead>
                <TableHead className="text-right">Qtd Cheques</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((item, idx) => (
                <TableRow key={idx} className="text-sm">
                  <TableCell className="font-medium">{item.banco || '-'}</TableCell>
                  <TableCell>{item.agencia || '-'}</TableCell>
                  <TableCell>
                    {item.motivo ? (
                      <Badge variant="error" className="text-[10px]">{formatMotivo(item.motivo)}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{formatDisplayDate(item.ultimo) || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {item.qteOcorrencias ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {historico.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-2 px-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Histórico Mensal ({historico.length} meses)
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDisplayDate(item.dataConsulta) || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <span className={item.quantidade > 0 ? 'font-bold text-red-600' : 'text-gray-500'}>
                        {item.quantidade}
                      </span>
                    </span>
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

// ─── main component ───────────────────────────────────────────────────────────

export function RaioXProStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXProResult>) {
  if (!data) return null;

  const isPf = Boolean(data.person);
  const displayName = isPf
    ? data.person?.name || 'Raio X PRO PF'
    : data.company?.socialReason || 'Raio X PRO PJ';
  const document = isPf
    ? data.person?.document || data.document
    : data.company?.cnpj || data.document;

  const marketRestrictions = data.marketRestrictions;
  const hasCcf = Boolean(data.ccf);
  const ccfHasOccurrences =
    hasCcf &&
    ((data.ccf!.summary?.totalRegistro ?? 0) > 0 ||
      (data.ccf!.summary?.sumQteOcorrencias ?? 0) > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header row ─────────────────────────────────────────────────────── */}
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
              {data.hasRestrictions ? 'Foram identificadas restrições no SCR.' : 'Sem restrições no SCR.'}
            </div>
          </Card>
        </div>

        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
            <StrategyHeader
              title={displayName}
              protocol={data.protocol}
              status={data.hasRestrictions ? 'COM RESTRIÇÕES' : 'SEM RESTRIÇÕES'}
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

      {/* ── Summary cards ───────────────────────────────────────────────────── */}
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
          subtitle={Number(data.totalRestrictiveValue || 0) > 0 ? 'Constam restrições' : 'Nada consta'}
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

      {/* ── Operações SCR ────────────────────────────────────────────────────── */}
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

      {/* ── Restrições de Mercado ────────────────────────────────────────────── */}
      {marketRestrictions && (
        <StrategySectionWrapper
          title="Restrições de Mercado"
          icon={<Landmark className="w-5 h-5 text-indigo-500" />}
          isEmpty={false}
        >
          <MarketRestrictionsSection mr={marketRestrictions} />
        </StrategySectionWrapper>
      )}

      {data.marketRestrictionsUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.marketRestrictionsMessage ||
              'O enriquecimento de restrições de mercado não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}

      {/* ── Posição SCR BACEN (enrichment EHM) ──────────────────────────────── */}
      {data.scrBacen && (
        <StrategySectionWrapper
          title="Posição SCR — Banco Central"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <ScrBacenSection scrBacen={data.scrBacen} />
        </StrategySectionWrapper>
      )}

      {data.scrBacenUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.scrBacenMessage || 'A posição SCR do Banco Central não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}

      {/* ── CCF — Cheques Sem Fundo ──────────────────────────────────────────── */}
      {hasCcf && (
        <StrategySectionWrapper
          title="CCF — Cheques Sem Fundo"
          icon={
            <Landmark
              className={cn('w-5 h-5', ccfHasOccurrences ? 'text-red-500' : 'text-green-500')}
            />
          }
          isEmpty={false}
        >
          <CcfSection ccf={data.ccf!} />
        </StrategySectionWrapper>
      )}

      {data.ccfUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.ccfMessage ||
              'A consulta CCF (Cheques Sem Fundo) não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}
    </div>
  );
}
