'use client';

import {
  User,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  Landmark,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, RealtimeMaxSpcSerasaBvsProtestoPfResult } from '@/types/query-strategies';
import { formatCurrency } from '@/lib/formatters';
import { AlertsGrid } from './components/AlertsGrid';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

export function RealtimeMaxSpcSerasaBvsProtestoPfStrategy({
  data,
  queryId,
}: QueryStrategyProps<RealtimeMaxSpcSerasaBvsProtestoPfResult>) {
  if (!data) return null;

  const status = data.person.revenueStatus || data.person.status || 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
        <StrategyHeader
          title={data.person.name}
          protocol={data.protocol}
          status={status}
          statusVariant={status === 'REGULAR' ? 'success' : 'warning'}
          pdfUrl={data.pdf}
          queryId={queryId}
          className="mb-6"
        >
          <Badge variant="info">Realtime MAX + Protesto</Badge>
        </StrategyHeader>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox
            label="Documento"
            value={data.person.document}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Nascimento"
            value={formatDisplayDate(data.person.birthDate)}
            icon={<Calendar className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Gênero"
            value={data.person.gender || 'N/A'}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          <InfoBox
            label="Email"
            value={data.person.email || 'N/A'}
            icon={<User className="w-4 h-4 text-primary" />}
          />
          {data.person.motherName && (
            <div className="col-span-2 lg:col-span-4">
              <InfoBox
                label="Nome da Mãe"
                value={data.person.motherName}
                icon={<User className="w-4 h-4 text-gray-400" />}
              />
            </div>
          )}
        </div>
      </Card>

      <AlertsGrid alerts={data.alerts || []} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Dívidas"
          value={data.totalDebts}
          subtitle={data.totalDebts > 0 ? 'Constam registros' : 'Nada consta'}
          color={data.totalDebts > 0 ? 'red' : 'green'}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={data.totalProtests}
          subtitle={data.totalProtests > 0 ? 'Constam registros' : 'Nada consta'}
          color={data.totalProtests > 0 ? 'orange' : 'green'}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Cheques"
          value={data.totalBadChecks || 0}
          subtitle={(data.totalBadChecks || 0) > 0 ? 'Constam registros' : 'Nada consta'}
          color={(data.totalBadChecks || 0) > 0 ? 'yellow' : 'green'}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      <StrategySectionWrapper
        title="Detalhamento de Dívidas"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={data.debts.length}
        isEmpty={data.debts.length === 0}
        emptyMessage="Nenhuma dívida registrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Base</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.debts.map((debt, idx) => (
              <TableRow key={idx}>
                <TableCell>{debt.date}</TableCell>
                <TableCell className="font-medium">{debt.origin}</TableCell>
                <TableCell>{debt.contract || '-'}</TableCell>
                <TableCell>{debt.informant || '-'}</TableCell>
                <TableCell className="text-right font-bold text-red-600">{formatCurrency(String(debt.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Protestos Sintéticos"
        icon={<Landmark className="w-5 h-5 text-indigo-500" />}
        count={data.syntheticProtests?.length || 0}
        isEmpty={!data.syntheticProtests || data.syntheticProtests.length === 0}
        emptyMessage="Nenhum protesto sintético registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cartório</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Credor</TableHead>
              <TableHead>Anuência</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.syntheticProtests?.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.date}</TableCell>
                <TableCell className="font-medium">{item.cartorio || '-'}</TableCell>
                <TableCell>{item.uf || '-'}</TableCell>
                <TableCell>{item.credor || '-'}</TableCell>
                <TableCell>{item.anuencia || 'Ativo'}</TableCell>
                <TableCell className="text-right font-bold text-indigo-600">{formatCurrency(String(item.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Detalhamento de Protestos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={data.protests?.length || 0}
        isEmpty={!data.protests || data.protests.length === 0}
        emptyMessage="Nenhum protesto registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cartório/Origem</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests?.map((protest, idx) => (
              <TableRow key={idx}>
                <TableCell>{protest.date}</TableCell>
                <TableCell className="font-medium">{protest.notary || protest.origin || '-'}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">{formatCurrency(String(protest.value))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      <StrategySectionWrapper
        title="Detalhamento de Cheques Sem Fundo"
        icon={<CheckCircle2 className="w-5 h-5 text-yellow-500" />}
        count={data.badChecks?.length || 0}
        isEmpty={!data.badChecks || data.badChecks.length === 0}
        emptyMessage="Nenhum cheque sem fundo registrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Última Ocorrência</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.badChecks?.map((check, idx) => (
              <TableRow key={idx}>
                <TableCell>{check.lastOccurrence}</TableCell>
                <TableCell className="font-medium">{check.bankNumber}</TableCell>
                <TableCell className="text-right font-bold text-yellow-600">{check.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
