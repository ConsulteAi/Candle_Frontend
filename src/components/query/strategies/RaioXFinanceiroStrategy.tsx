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
  RaioXFinanceiroResult,
  RaioXMarketRestrictions,
  CcfEnrichment,
} from '@/types/query-strategies';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { cn, formatDisplayDate } from '@/lib/utils';

// ─── CCF motivo map ──────────────────────────────────────────────────────────
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
  // Provider returns "12 - MOTIVO 12" — extract the leading numeric code
  const match = raw.match(/^(\d+)/);
  if (match) {
    const code = match[1];
    if (CCF_MOTIVOS[code]) return `${code} – ${CCF_MOTIVOS[code]}`;
  }
  return raw; // fallback: show as-is
}
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
      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-indigo-300 pl-3">
        Restrições de mercado consultadas via birôs de crédito — inclui dívidas SCPC, pendências
        REFIN/PEFIN, protestos em cartório, cheques sem fundo e inscrições em CADIN.{' '}
        {!hasAny && <span className="font-semibold text-green-700">Nenhuma restrição encontrada.</span>}
      </p>

      {/* Summary cards */}
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

      {/* SERASA summary */}
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

      {/* SCPC */}
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

      {/* REFIN / PEFIN */}
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

      {/* Protestos */}
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

      {/* Cheques sem fundo */}
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

      {/* CADIN */}
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

      {/* Ações Judiciais */}
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

// ─── CCF enrichment section ───────────────────────────────────────────────────

function CcfSection({ ccf }: { ccf: CcfEnrichment }) {
  const summary = ccf.summary ?? { totalRegistro: 0, sumQteOcorrencias: 0, ultimaOcorrencia: '' };
  const historico = Array.isArray(ccf.historico) ? ccf.historico : [];
  const lista = Array.isArray(ccf.lista) ? ccf.lista : [];
  const hasOccurrences = summary.totalRegistro > 0 || summary.sumQteOcorrencias > 0;

  return (
    <div className="space-y-5 p-4">
      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-red-300 pl-3">
        Consulta ao <strong>CCF (Cadastro de Cheques sem Fundos)</strong> do Banco Central do Brasil —
        registra devolução de cheques por insuficiência de fundos e outros motivos bancários.{' '}
        {!hasOccurrences && (
          <span className="font-semibold text-green-700">Nenhum registro encontrado.</span>
        )}
      </p>

      {/* Summary */}
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

      {/* No occurrences banner */}
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

      {/* Lista por banco */}
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

      {/* Histórico mensal */}
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

export function RaioXFinanceiroStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXFinanceiroResult>) {
  if (!data) return null;

  const isPf = Boolean(data.person);
  const displayName = isPf
    ? data.person?.name || 'Raio X Financeiro PF'
    : data.company?.socialReason || 'Raio X Financeiro PJ';
  const document = isPf
    ? data.person?.document || data.document
    : data.company?.cnpj || data.document;

  const marketRestrictions = data.marketRestrictions;

  const scoreValue = Number(data.score?.value || 0);
  const scoreColor =
    scoreValue > 600 ? 'text-green-600' : scoreValue > 300 ? 'text-yellow-600' : 'text-red-600';
  const scoreBorderColor =
    scoreValue > 600 ? 'border-green-200' : scoreValue > 300 ? 'border-yellow-200' : 'border-red-200';
  const scoreBg =
    scoreValue > 600
      ? 'from-green-50 to-emerald-50'
      : scoreValue > 300
        ? 'from-yellow-50 to-amber-50'
        : 'from-red-50 to-rose-50';
  const badgeVariant: 'success' | 'warning' | 'error' =
    scoreValue > 600 ? 'success' : scoreValue > 300 ? 'warning' : 'error';
  const strokeColor =
    scoreValue > 600 ? '#22C55E' : scoreValue > 300 ? '#F59E0B' : '#EF4444';

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (circumference * Math.min(scoreValue, 1000)) / 1000;

  const hasCcf = Boolean(data.ccf);
  const ccfHasOccurrences =
    hasCcf &&
    ((data.ccf!.summary?.totalRegistro ?? 0) > 0 ||
      (data.ccf!.summary?.sumQteOcorrencias ?? 0) > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-12 gap-6">

        {/* Score gauge */}
        <div className="md:col-span-4">
          <Card className={cn(
            'h-full p-6 flex flex-col items-center justify-center text-center border bg-gradient-to-br',
            scoreBg, scoreBorderColor,
          )}>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-3">
              Score SCR — BACEN
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
                  {scoreValue}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">/ 1000</span>
              </div>
            </div>

            <Badge variant={badgeVariant} className="mb-1">
              {data.score?.band || '—'}
            </Badge>
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">
              ≤300 alto · 301–600 médio · &gt;600 baixo
            </p>
          </Card>
        </div>

        {/* Main header */}
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
                label="Data Base SCR"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Operações SCR"
          value={data.operationsCount || 0}
          subtitle="Total registrado no BACEN"
          color="blue"
          icon={<BarChart3 className="w-5 h-5" />}
        />
        <SummaryCard
          title="Valor Restritivo"
          value={fmtBRL(data.totalRestrictiveValue)}
          subtitle={Number(data.totalRestrictiveValue || 0) > 0 ? 'Constam restrições' : 'Nada consta'}
          color={Number(data.totalRestrictiveValue || 0) > 0 ? 'red' : 'green'}
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <SummaryCard
          title="Crédito Vencido"
          value={fmtBRL(data.creditSummary?.expiredCredit?.value)}
          subtitle={Number(data.creditSummary?.expiredCredit?.value || 0) > 0 ? `${fmtPct(data.creditSummary?.expiredCredit?.percentage)} · atenção` : 'Nada consta'}
          color={Number(data.creditSummary?.expiredCredit?.value || 0) > 0 ? 'orange' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Prejuízo"
          value={fmtBRL(data.creditSummary?.loss?.value)}
          subtitle={Number(data.creditSummary?.loss?.value || 0) > 0 ? `${fmtPct(data.creditSummary?.loss?.percentage)} · restritivo` : 'Nada consta'}
          color={Number(data.creditSummary?.loss?.value || 0) > 0 ? 'red' : 'gray'}
          icon={<TrendingDown className="w-5 h-5" />}
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
                  {fmtBRL(item.totalValue)}
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
