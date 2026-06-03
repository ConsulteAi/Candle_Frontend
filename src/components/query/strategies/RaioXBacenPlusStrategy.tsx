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
  Star,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  RaioXBacenPlusResult,
  BoaVistaRatingEnrichment,
  CommercialAnalysisScore,
  ScrEhmEnrichment,
  ScrEhmOperacao,
} from '@/types/query-strategies';
import { cn, formatDisplayDate } from '@/lib/utils';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
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

function ScoreValue({ score }: { score?: CommercialAnalysisScore }) {
  if (!score) return <span className="text-gray-400">—</span>;
  const raw = score.value ?? score.nomeScore ?? '—';
  return <span className="font-bold text-2xl text-primary">{String(raw)}</span>;
}

// ─── Boa Vista Rating enrichment section ─────────────────────────────────────

function BoaVistaRatingSection({ bvr }: { bvr: BoaVistaRatingEnrichment }) {
  const score = bvr.score ?? {};
  const decision = bvr.decision ?? {};
  const creditLimit = bvr.creditLimitSuggestion ?? {};
  const financialSummary = bvr.financialSummary ?? {};
  const queries = bvr.queries ?? [];
  const protests = bvr.protests ?? [];
  const debts = bvr.debts ?? [];

  return (
    <div className="space-y-5 p-4">
      <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-violet-300 pl-3">
        Rating bancário consolidado da <strong>Boa Vista (SCPC)</strong> — inclui pontuação de risco,
        decisão de crédito, limite sugerido e histórico de consultas e pendências.
      </p>

      {/* Score + Decision + Limit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-violet-100 bg-violet-50/50 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-violet-600 font-semibold flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Score
          </p>
          <ScoreValue score={score} />
          {score.riskText && (
            <p className="text-xs text-gray-500 leading-snug">{score.riskText}</p>
          )}
          {score.tipoScore && (
            <Badge variant="outline" className="text-[10px]">{score.tipoScore}</Badge>
          )}
        </Card>

        <Card className="p-4 border border-emerald-100 bg-emerald-50/50 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Decisão
          </p>
          <p className="font-bold text-lg text-gray-800">{decision.status || '—'}</p>
        </Card>

        <Card className="p-4 border border-blue-100 bg-blue-50/50 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-blue-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Limite Sugerido
          </p>
          <p className="font-bold text-lg text-gray-800">
            {creditLimit.amount != null
              ? formatCurrency(String(creditLimit.amount))
              : creditLimit.text || '—'}
          </p>
          {creditLimit.name && (
            <p className="text-xs text-gray-500">{creditLimit.name}</p>
          )}
        </Card>
      </div>

      {/* Financial summary */}
      {(financialSummary.totalDebts != null ||
        financialSummary.totalProtests != null ||
        financialSummary.totalQueries != null) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            title="Dívidas"
            value={financialSummary.totalDebts || 0}
            subtitle={(financialSummary.totalDebts || 0) > 0 ? 'Constam registros' : 'Nada consta'}
            color={(financialSummary.totalDebts || 0) > 0 ? 'red' : 'green'}
            icon={<AlertTriangle className="w-5 h-5" />}
          />
          <SummaryCard
            title="Protestos"
            value={financialSummary.totalProtests || 0}
            subtitle={(financialSummary.totalProtests || 0) > 0 ? 'Constam registros' : 'Nada consta'}
            color={(financialSummary.totalProtests || 0) > 0 ? 'yellow' : 'green'}
            icon={<Landmark className="w-5 h-5" />}
          />
          <SummaryCard
            title="Consultas"
            value={financialSummary.totalQueries || 0}
            subtitle="Passagens comerciais"
            color="blue"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          {financialSummary.totalLegalActions != null && (
            <SummaryCard
              title="Ações Judiciais"
              value={financialSummary.totalLegalActions || 0}
              subtitle={(financialSummary.totalLegalActions || 0) > 0 ? 'Constam registros' : 'Nada consta'}
              color={(financialSummary.totalLegalActions || 0) > 0 ? 'red' : 'green'}
              icon={<FileWarning className="w-5 h-5" />}
            />
          )}
        </div>
      )}

      {/* Débitos */}
      {debts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600 flex items-center gap-2 px-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pendências Financeiras ({debts.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Credor / Origem</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{d.date || d.inclusionDate || '-'}</TableCell>
                  <TableCell className="font-medium">{d.creditor || d.origin || '-'}</TableCell>
                  <TableCell>{d.modality || '-'}</TableCell>
                  <TableCell>{d.contract || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(String(d.value || d.updatedValue || d.originalValue || 0))}
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
          <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 flex items-center gap-2 px-1">
            <Landmark className="w-3.5 h-3.5" />
            Protestos ({protests.length})
          </p>
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
              {protests.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{p.date || '-'}</TableCell>
                  <TableCell className="font-medium">{p.origin || '-'}</TableCell>
                  <TableCell>{p.notary || p.notaryName || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-yellow-700">
                    {formatCurrency(String(p.value || 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Histórico de consultas */}
      {queries.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 flex items-center gap-2 px-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Passagens Comerciais ({queries.length})
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cidade / UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((q, i) => (
                <TableRow key={i}>
                  <TableCell>{formatDisplayDate(q.date) || '-'}</TableCell>
                  <TableCell className="font-medium">{q.entity || '-'}</TableCell>
                  <TableCell>{q.cityState || '-'}</TableCell>
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

export function RaioXBacenPlusStrategy({
  data,
  queryId,
}: QueryStrategyProps<RaioXBacenPlusResult>) {
  if (!data) return null;

  const isPf = Boolean(data.person);
  const displayName = isPf
    ? data.person?.name || 'Raio X BACEN Plus PF'
    : data.company?.socialReason || 'Raio X BACEN Plus PJ';
  const document = isPf
    ? data.person?.document || ''
    : data.company?.cnpj || '';

  const debts = data.debts ?? [];
  const protests = data.protests ?? [];
  const badChecks = data.badChecks ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={displayName}
          protocol={data.protocol}
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
          {data.score && (
            <InfoBox
              label="Score"
              value={String(data.score.value || '—')}
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
            />
          )}
          {isPf && data.person?.birthDate && (
            <InfoBox
              label="Nascimento"
              value={formatDisplayDate(data.person.birthDate) || '-'}
              icon={<Calendar className="w-4 h-4 text-primary" />}
            />
          )}
          {!isPf && data.company?.foundationDate && (
            <InfoBox
              label="Fundação"
              value={data.company.foundationDate}
              icon={<Calendar className="w-4 h-4 text-primary" />}
            />
          )}
        </div>
      </Card>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Pendências"
          value={debts.length}
          subtitle={debts.length > 0 ? 'Constam registros' : 'Nada consta'}
          color={debts.length > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={protests.length}
          subtitle={protests.length > 0 ? 'Constam registros' : 'Nada consta'}
          color={protests.length > 0 ? 'yellow' : 'green'}
          icon={<Landmark className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cheques"
          value={badChecks.length}
          subtitle={badChecks.length > 0 ? 'Constam registros' : 'Nada consta'}
          color={badChecks.length > 0 ? 'orange' : 'green'}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* ── Dívidas primárias ──────────────────────────────────────────────── */}
      <StrategySectionWrapper
        title="Pendências Financeiras"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={debts.length}
        isEmpty={debts.length === 0}
        emptyMessage="Nenhuma pendência financeira encontrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Credor / Origem</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Informante</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debts.map((d, i) => (
              <TableRow key={i}>
                <TableCell>{d.date || '-'}</TableCell>
                <TableCell className="font-medium">{d.origin || '-'}</TableCell>
                <TableCell>{d.contract || '-'}</TableCell>
                <TableCell>{d.informant || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  {formatCurrency(String(d.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* ── Protestos primários ────────────────────────────────────────────── */}
      <StrategySectionWrapper
        title="Protestos"
        icon={<Landmark className="w-5 h-5 text-yellow-500" />}
        count={protests.length}
        isEmpty={protests.length === 0}
        emptyMessage="Nenhum protesto encontrado."
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
            {protests.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.date || '-'}</TableCell>
                <TableCell className="font-medium">{p.origin || '-'}</TableCell>
                <TableCell>{p.notary || '-'}</TableCell>
                <TableCell className="text-right font-bold text-yellow-700">
                  {formatCurrency(String(p.value || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* ── Sócios (PJ only) ────────────────────────────────────────────────── */}
      {!isPf && (data.partners ?? []).length > 0 && (
        <StrategySectionWrapper
          title="Quadro Societário"
          icon={<Building2 className="w-5 h-5 text-primary" />}
          count={(data.partners ?? []).length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cargo / Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.partners ?? []).map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.name || '-'}</TableCell>
                  <TableCell>{p.document ? formatCpfCnpj(p.document) : '-'}</TableCell>
                  <TableCell>{p.role || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Participações societárias (PF only) ─────────────────────────────── */}
      {isPf && (data.companyParticipations ?? []).length > 0 && (
        <StrategySectionWrapper
          title="Participações em Empresas"
          icon={<Building2 className="w-5 h-5 text-primary" />}
          count={(data.companyParticipations ?? []).length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead>Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.companyParticipations ?? []).map((cp, i) => (
                <TableRow key={i}>
                  <TableCell>{formatCpfCnpj(cp.cnpj) || '-'}</TableCell>
                  <TableCell className="font-medium">{cp.socialReason || '-'}</TableCell>
                  <TableCell>{cp.participation || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Rating Boa Vista (enrichment) ────────────────────────────────────── */}
      {data.boaVistaRating && (
        <StrategySectionWrapper
          title="Rating Bancário — Boa Vista"
          icon={<Star className="w-5 h-5 text-violet-500" />}
          isEmpty={false}
        >
          <BoaVistaRatingSection bvr={data.boaVistaRating} />
        </StrategySectionWrapper>
      )}

      {data.boaVistaRatingUnavailable && (
        <Card className="p-4 border border-yellow-100 bg-yellow-50">
          <p className="text-sm text-yellow-800 font-medium">
            {data.boaVistaRatingMessage ||
              'O Rating Bancário Boa Vista não estava disponível para esta consulta.'}
          </p>
        </Card>
      )}
    </div>
  );
}
