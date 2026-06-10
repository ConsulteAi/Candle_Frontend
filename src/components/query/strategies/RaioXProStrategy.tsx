'use client';

import {
  AlertTriangle,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  FileWarning,
  Gavel,
  Landmark,
  Phone,
  MapPin,
  TrendingDown,
  User,
  XCircle,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type {
  QueryStrategyProps,
  RaioXProResult,
} from '@/types/query-strategies';
import { formatCpfCnpj } from '@/lib/formatters';
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

function parseBRLValue(raw: string | number | undefined): number {
  if (raw == null || raw === '') return 0;
  return parseFloat(String(raw).replace(',', '.')) || 0;
}

const fmtBRL = (raw: string | number | undefined) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    parseBRLValue(raw),
  );

function decisionVariant(
  approved: boolean | undefined,
  text: string | undefined,
): { color: string; bg: string; border: string; badge: 'success' | 'warning' | 'error' } {
  if (approved) return { color: '#22C55E', bg: 'bg-green-50', border: 'border-green-200', badge: 'success' };
  if (text?.toUpperCase().includes('CAUTELA'))
    return { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'warning' };
  return { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200', badge: 'error' };
}

function scoreClass(cls: string | undefined): { color: string; label: string } {
  const c = cls?.toUpperCase() ?? '';
  if (c === 'AA' || c === 'A') return { color: 'text-green-600', label: 'Risco Muito Baixo' };
  if (c === 'B') return { color: 'text-green-500', label: 'Risco Baixo' };
  if (c === 'C') return { color: 'text-yellow-600', label: 'Risco Médio' };
  if (c === 'D') return { color: 'text-orange-600', label: 'Risco Alto' };
  return { color: 'text-red-600', label: 'Risco Muito Alto' };
}

// ─── Boa Vista Decision Hero Card ────────────────────────────────────────────

function BoaVistaHeroCard({ bvr }: { bvr: NonNullable<RaioXProResult['boaVistaRating']> }) {
  const decision = bvr.decision ?? {};
  const score = bvr.score ?? {};
  const limit = bvr.creditLimitSuggestion ?? {};
  const variant = decisionVariant(decision.approved, decision.text);
  const sc = scoreClass(score.class as string | undefined);
  const scoreVal = parseBRLValue(score.value as string | number | undefined);
  const probability = score.probability != null ? Number(score.probability) : null;
  const limitAmount = parseBRLValue(limit.amount);
  const hasLimit = limitAmount > 0;

  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (circumference * Math.min(scoreVal, 1000)) / 1000;

  return (
    <div
      className={cn(
        'rounded-xl border-2 overflow-hidden shadow-lg',
        variant.border,
      )}
      style={{ borderLeftColor: variant.color, borderLeftWidth: 6 }}
    >
      <div className={cn('px-6 py-5', variant.bg)}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">

          {/* Score ring */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Score Boa Vista
            </span>
            <div className="relative">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#E5E7EB" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50" cy="50" r="44"
                  stroke={variant.color}
                  strokeWidth="8" fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-2xl font-bold tabular-nums', sc.color)}>
                  {scoreVal > 0 ? scoreVal : '-'}
                </span>
                <span className="text-[9px] text-gray-400">/1000</span>
              </div>
            </div>
            {score.class && (
              <Badge variant={variant.badge} className="text-xs font-bold px-3">
                Classe {score.class}
              </Badge>
            )}
            <p className={cn('text-[11px] font-semibold', sc.color)}>{sc.label}</p>
            {probability != null && (
              <p className="text-[10px] text-gray-500">
                {probability}% de pagamento
              </p>
            )}
          </div>

          {/* Decision + details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              {decision.approved
                ? <CheckCircle2 className="w-7 h-7 mt-0.5 shrink-0 text-green-500" />
                : <XCircle className="w-7 h-7 mt-0.5 shrink-0" style={{ color: variant.color }} />
              }
              <div>
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold mb-0.5">
                  Decisão Boa Vista
                </p>
                <p className="text-xl font-bold text-gray-900 leading-tight">
                  {decision.text
                    ? decision.text.charAt(0) + decision.text.slice(1).toLowerCase().replace(/_/g, ' ')
                    : 'Sem decisão'}
                </p>
                {decision.code && (
                  <p className="text-xs text-gray-400 mt-0.5">Código {decision.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {hasLimit && (
                <InfoBox
                  label="Limite Sugerido"
                  value={fmtBRL(limit.amount)}
                  icon={<BarChart3 className="w-4 h-4 text-green-500" />}
                />
              )}
              {!hasLimit && limit.text && (
                <div className="col-span-2 sm:col-span-3 rounded-md border border-amber-100 bg-amber-50/60 px-3 py-2 text-xs text-amber-800 leading-relaxed">
                  {limit.text}
                </div>
              )}
            </div>

            {score.riskText && (
              <p className="text-[10px] text-gray-400 italic leading-relaxed border-l-2 pl-3"
                style={{ borderColor: variant.color }}>
                {score.riskText.length > 220 ? score.riskText.slice(0, 220) + '…' : score.riskText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function RaioXProStrategy({ data, queryId }: QueryStrategyProps<RaioXProResult>) {
  if (!data) return null;

  const isPf = Boolean(data.person);
  const displayName = isPf
    ? data.person?.name || 'Raio X PRO PF'
    : data.company?.socialReason || 'Raio X PRO PJ';
  const document = isPf
    ? data.person?.document
    : data.company?.cnpj;

  const bvr = data.boaVistaRating;
  const bvrAvailable = bvr?.available === true;
  const fs = bvr?.financialSummary;

  const debts = data.debts ?? [];
  const protests = data.protests ?? [];
  const badChecks = data.badChecks ?? [];
  const bvrDebts = bvr?.debts ?? [];
  const bvrProtests = bvr?.protests ?? [];
  const bvrQueries = bvr?.queries ?? [];
  const companyParticipations = data.companyParticipations ?? [];
  const alerts = data.alerts ?? [];
  const phones = data.phones ?? [];
  const addresses = data.addresses ?? [];

  const hasRestrictions = data.totalDebts > 0 || data.totalProtests > 0 || data.totalBadChecks > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={displayName}
          protocol={data.protocol}
          status={hasRestrictions ? 'COM RESTRIÇÕES' : 'SEM RESTRIÇÕES'}
          statusVariant={hasRestrictions ? 'warning' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-5"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <InfoBox
            label="Documento"
            value={formatCpfCnpj(document || '-')}
            icon={isPf ? <User className="w-4 h-4 text-primary" /> : <Building2 className="w-4 h-4 text-primary" />}
          />
          {data.person?.birthDate && (
            <InfoBox
              label="Nascimento"
              value={formatDisplayDate(data.person.birthDate) || data.person.birthDate}
              icon={<Calendar className="w-4 h-4 text-primary" />}
            />
          )}
          {data.person?.status && (
            <InfoBox
              label="Status CPF"
              value={data.person.status}
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            />
          )}
          {data.person?.motherName && (
            <InfoBox
              label="Nome da Mãe"
              value={data.person.motherName}
              icon={<User className="w-4 h-4 text-gray-400" />}
            />
          )}
          <InfoBox
            label="Dívidas / Protestos"
            value={`${data.totalDebts} / ${data.totalProtests}`}
            icon={<AlertTriangle className={cn('w-4 h-4', hasRestrictions ? 'text-red-500' : 'text-green-500')} />}
          />
        </div>
      </Card>

      {/* ── Boa Vista Decision Hero ─────────────────────────────────────────── */}
      {bvrAvailable && bvr && (
        <BoaVistaHeroCard bvr={bvr} />
      )}

      {data.boaVistaRatingUnavailable && (
        <Card className="p-4 border border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">
              {data.boaVistaRatingMessage || 'O Rating Boa Vista não estava disponível para esta consulta (timeout ou falha no enriquecimento).'}
            </p>
          </div>
        </Card>
      )}

      {/* ── Resumo Boa Vista ───────────────────────────────────────────────── */}
      {bvrAvailable && fs && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard
            title="Dívidas Boa Vista"
            value={fs.totalDebts ?? 0}
            subtitle={(fs.totalDebts ?? 0) > 0 ? 'Constam registros' : 'Nada consta'}
            color={(fs.totalDebts ?? 0) > 0 ? 'red' : 'green'}
            icon={<FileWarning className="w-5 h-5" />}
          />
          <SummaryCard
            title="Protestos Boa Vista"
            value={fs.totalProtests ?? 0}
            subtitle={(fs.totalProtests ?? 0) > 0 ? 'Constam registros' : 'Nada consta'}
            color={(fs.totalProtests ?? 0) > 0 ? 'orange' : 'green'}
            icon={<Landmark className="w-5 h-5" />}
          />
          <SummaryCard
            title="Consultas Anteriores"
            value={fs.totalQueries ?? 0}
            subtitle="Passagens comerciais BV"
            color="blue"
            icon={<BarChart3 className="w-5 h-5" />}
          />
        </div>
      )}

      {/* ── Restrições Financeiras Serasa ──────────────────────────────────── */}
      <StrategySectionWrapper
        title="Restrições Financeiras Serasa"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={debts.length}
        isEmpty={debts.length === 0}
        emptyMessage="Nenhuma restrição financeira encontrada na base Serasa."
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
            {debts.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.contract || '-'}</TableCell>
                <TableCell>{item.informant || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">
                  {fmtBRL(item.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* ── Protestos Serasa ───────────────────────────────────────────────── */}
      <StrategySectionWrapper
        title="Protestos Serasa"
        icon={<Landmark className="w-5 h-5 text-indigo-500" />}
        count={protests.length}
        isEmpty={protests.length === 0}
        emptyMessage="Nenhum protesto encontrado na base Serasa."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protests.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date || '-'}</TableCell>
                <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                <TableCell>{item.notary || '-'}</TableCell>
                <TableCell>{item.type || '-'}</TableCell>
                <TableCell className="text-right font-bold text-indigo-600">
                  {fmtBRL(item.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* ── Cheques Sem Fundo ──────────────────────────────────────────────── */}
      {badChecks.length > 0 && (
        <StrategySectionWrapper
          title="Cheques Sem Fundo"
          icon={<TrendingDown className="w-5 h-5 text-yellow-600" />}
          count={badChecks.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Última Ocorrência</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badChecks.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.bankNumber || '-'}</TableCell>
                  <TableCell>{item.branch || '-'}</TableCell>
                  <TableCell>{item.lastOccurrence || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-yellow-700">
                    {item.quantity ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Dívidas Boa Vista ──────────────────────────────────────────────── */}
      {bvrAvailable && (
        <StrategySectionWrapper
          title="Pendências Financeiras (Boa Vista)"
          icon={<FileWarning className="w-5 h-5 text-red-400" />}
          count={bvrDebts.length}
          isEmpty={bvrDebts.length === 0}
          emptyMessage="Nenhuma pendência financeira registrada na base Boa Vista."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Credor / Origem</TableHead>
                <TableHead>Modalidade</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>Informante</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bvrDebts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.date || item.inclusionDate || '-'}</TableCell>
                  <TableCell className="font-medium">{item.creditor || item.origin || '-'}</TableCell>
                  <TableCell>{item.modality || '-'}</TableCell>
                  <TableCell>{item.contract || '-'}</TableCell>
                  <TableCell>{item.informant || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {fmtBRL(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Protestos Boa Vista ────────────────────────────────────────────── */}
      {bvrAvailable && (
        <StrategySectionWrapper
          title="Protestos (Boa Vista)"
          icon={<Landmark className="w-5 h-5 text-indigo-400" />}
          count={bvrProtests.length}
          isEmpty={bvrProtests.length === 0}
          emptyMessage="Nenhum protesto registrado na base Boa Vista."
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
              {bvrProtests.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.date || '-'}</TableCell>
                  <TableCell className="font-medium">{item.origin || '-'}</TableCell>
                  <TableCell>{item.notary || item.notaryName || '-'}</TableCell>
                  <TableCell className="text-right font-bold text-indigo-600">
                    {fmtBRL(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Passagens Comerciais ───────────────────────────────────────────── */}
      {bvrAvailable && bvrQueries.length > 0 && (
        <StrategySectionWrapper
          title="Passagens Comerciais (Boa Vista)"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
          count={bvrQueries.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Cidade / UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bvrQueries.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatDisplayDate(item.date) || item.date || '-'}</TableCell>
                  <TableCell className="font-medium">{item.entity || '-'}</TableCell>
                  <TableCell>{item.cityState || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Participações em Empresas ──────────────────────────────────────── */}
      {companyParticipations.length > 0 && (
        <StrategySectionWrapper
          title="Participações em Empresas"
          icon={<Building2 className="w-5 h-5 text-gray-500" />}
          count={companyParticipations.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead className="text-right">Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyParticipations.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-mono text-xs">{formatCpfCnpj(item.cnpj)}</TableCell>
                  <TableCell className="font-medium">{item.socialReason}</TableCell>
                  <TableCell className="text-right">{item.participation}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Alertas ───────────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <StrategySectionWrapper
          title="Alertas e Informações"
          icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
          count={alerts.length}
          isEmpty={false}
        >
          <div className="space-y-3 p-4">
            {alerts.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-yellow-100 bg-yellow-50/50 px-4 py-3">
                {item.title && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 mb-1">
                    {item.title}
                  </p>
                )}
                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </StrategySectionWrapper>
      )}

      {/* ── Ações Judiciais (dashboardSummary) ────────────────────────────── */}
      {bvrAvailable && Array.isArray(bvr?.dashboardSummary) && (bvr!.dashboardSummary as any[]).some((d: any) => d.anchor === 'ancora_acao_civel' && d.total) && (
        <Card className="p-4 border border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Gavel className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ações Cíveis</p>
          </div>
          {(bvr!.dashboardSummary as any[])
            .filter((d: any) => d.anchor === 'ancora_acao_civel' && d.total)
            .map((d: any, i: number) => (
              <p key={i} className="text-sm text-gray-700">{d.total} ocorrência(s)</p>
            ))}
        </Card>
      )}

      {/* ── Telefones ─────────────────────────────────────────────────────── */}
      {phones.length > 0 && (
        <StrategySectionWrapper
          title="Telefones"
          icon={<Phone className="w-5 h-5 text-primary" />}
          count={phones.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DDD</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operadora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.areaCode}</TableCell>
                  <TableCell className="font-medium font-mono">{item.number}</TableCell>
                  <TableCell>{item.type === 'C' ? 'Celular' : item.type === 'R' ? 'Residencial' : item.type || '-'}</TableCell>
                  <TableCell>{item.carrier || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* ── Endereços ─────────────────────────────────────────────────────── */}
      {addresses.length > 0 && (
        <StrategySectionWrapper
          title="Endereços"
          icon={<MapPin className="w-5 h-5 text-primary" />}
          count={addresses.length}
          isEmpty={false}
        >
          <div className="divide-y divide-gray-100">
            {addresses.map((addr, idx) => (
              <div key={idx} className="px-4 py-3 text-sm text-gray-700">
                <span className="font-medium">{addr.street}</span>
                {addr.number ? `, ${addr.number}` : ''}
                {addr.complement ? ` ${addr.complement}` : ''}
                {addr.district ? ` — ${addr.district}` : ''}
                {addr.city ? ` — ${addr.city}` : ''}
                {addr.state ? `/${addr.state}` : ''}
                {addr.zip ? <span className="ml-2 text-gray-400 text-xs">CEP {addr.zip}</span> : null}
              </div>
            ))}
          </div>
        </StrategySectionWrapper>
      )}
    </div>
  );
}
