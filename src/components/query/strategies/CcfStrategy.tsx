'use client';

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Hash,
  Landmark,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { CcfResult, QueryStrategyProps } from '@/types/query-strategies';
import { formatDisplayDate } from '@/lib/utils';
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

// ─── CCF motivo map ──────────────────────────────────────────────────────────
// Standard BACEN motivo codes for cheque devolvido
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

// ─── main component ───────────────────────────────────────────────────────────

export function CcfStrategy({
  data,
  queryId,
}: QueryStrategyProps<CcfResult>) {
  if (!data) return null;

  const summary = data.summary ?? { totalRegistro: 0, sumQteOcorrencias: 0, ultimaOcorrencia: '' };
  const historico = Array.isArray(data.historico) ? data.historico : [];
  const lista = Array.isArray(data.lista) ? data.lista : [];

  const hasOccurrences = summary.totalRegistro > 0 || summary.sumQteOcorrencias > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* ── Header card ── */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title="CCF — Cheques Sem Fundo"
          status={hasOccurrences ? 'COM OCORRÊNCIAS' : 'NADA CONSTA'}
          statusVariant={hasOccurrences ? 'error' : 'success'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-5"
        />
        <p className="text-xs text-gray-500 leading-relaxed border-l-2 border-primary/30 pl-3">
          Consulta ao <strong>CCF (Cadastro de Cheques sem Fundos)</strong> do Banco Central do Brasil —
          registra devolução de cheques por insuficiência de fundos e outros motivos bancários.
        </p>
      </Card>

      {/* ── Resumo ── */}
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
        <div className="flex flex-col">
          <InfoBox
            label="Última Ocorrência"
            value={formatDisplayDate(summary.ultimaOcorrencia) || 'Sem registros'}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
        </div>
      </div>

      {/* ── Sem ocorrências ── */}
      {!hasOccurrences && (
        <Card className="p-6 border border-green-100 bg-green-50/50 flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Nada consta no CCF</p>
            <p className="text-xs text-green-700 mt-0.5">
              Este documento não possui registros de cheques devolvidos no Banco Central.
            </p>
          </div>
        </Card>
      )}

      {/* ── Lista de ocorrências por banco ── */}
      <StrategySectionWrapper
        title="Ocorrências por Banco"
        icon={<Landmark className="w-5 h-5 text-red-500" />}
        count={lista.length}
        isEmpty={lista.length === 0}
        emptyMessage="Nenhuma ocorrência de cheque sem fundo registrada."
      >
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
      </StrategySectionWrapper>

      {/* ── Histórico mensal ── */}
      <StrategySectionWrapper
        title="Histórico Mensal de Consultas"
        icon={<BarChart3 className="w-5 h-5 text-primary" />}
        count={historico.length}
        isEmpty={historico.length === 0}
        emptyMessage="Sem histórico de consultas disponível."
      >
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
                <TableCell className="font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {formatDisplayDate(item.dataConsulta) || '-'}
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
      </StrategySectionWrapper>
    </div>
  );
}
