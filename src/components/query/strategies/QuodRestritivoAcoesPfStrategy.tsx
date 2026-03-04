'use client';

import { 
  User, 
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Phone,
  Gavel,
  Calendar
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, QuodRestritivoAcoesPfResult } from '@/types/query-strategies';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import { AlertsGrid } from './components/AlertsGrid';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategyContacts } from './components/StrategyContacts';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

export function QuodRestritivoAcoesPfStrategy({ data }: QueryStrategyProps<QuodRestritivoAcoesPfResult>) {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-gray-900">
          <StrategyHeader 
            title={data.person.name}
            protocol={data.protocol}
            status={data.person.status}
            statusVariant={data.person.status === 'REGULAR' ? 'success' : 'warning'}
            pdfUrl={data.pdf}
            className="mb-6"
          />

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
            {data.person.motherName && (
              <div className="col-span-2">
                <InfoBox 
                  label="Nome da Mãe" 
                  value={data.person.motherName}
                  icon={<User className="w-4 h-4 text-gray-400" />}
                />
              </div>
            )}
          </div>
      </Card>

      {/* Behavioral Alerts Grid */}
      <AlertsGrid alerts={data.alerts || []} />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="Dívidas"
          value={data.totalDebts}
          subtitle={data.totalDebts > 0 ? "Constam registros" : "Nada consta"}
          color={data.totalDebts > 0 ? "red" : "green"}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Protestos"
          value={data.totalProtests}
          subtitle={data.totalProtests > 0 ? "Constam registros" : "Nada consta"}
          color={data.totalProtests > 0 ? "orange" : "green"}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Cheques"
          value={data.totalBadChecks || 0}
          subtitle={(data.totalBadChecks || 0) > 0 ? "Constam registros" : "Nada consta"}
          color={(data.totalBadChecks || 0) > 0 ? "yellow" : "green"}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Ações Judiciais"
          value={data.totalLegalActions || 0}
          subtitle={(data.totalLegalActions || 0) > 0 ? "Constam registros" : "Nada consta"}
          color={(data.totalLegalActions || 0) > 0 ? "gray" : "green"}
          icon={<Gavel className="w-5 h-5" />}
        />
      </div>

       <StrategyContacts 
         phones={data.phones}
         addresses={data.addresses}
       />

      {/* Legal Actions Table */}
      <StrategySectionWrapper
        title="Detalhamento de Ações Judiciais"
        icon={<Gavel className="w-5 h-5 text-purple-500" />}
        count={data.legalActions?.length || 0}
        isEmpty={!data.legalActions || data.legalActions.length === 0}
        emptyMessage="Nenhuma ação judicial encontrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.legalActions?.map((action, idx) => (
              <TableRow key={idx}>
                <TableCell>{action.date}</TableCell>
                <TableCell className="font-medium">{action.type}</TableCell>
                <TableCell>{action.details}</TableCell>
                <TableCell>{action.origin}</TableCell>
                <TableCell className="text-right font-bold text-purple-600">R$ {action.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Debts Table */}
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
                <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.debts.map((debt, idx) => (
              <TableRow key={idx}>
                <TableCell>{debt.date}</TableCell>
                <TableCell className="font-medium">{debt.origin}</TableCell>
                <TableCell>{debt.contract}</TableCell>
                <TableCell className="text-right font-bold text-red-600">R$ {debt.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Protests Table */}
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
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests?.map((protest, idx) => (
              <TableRow key={idx}>
                <TableCell>{protest.date}</TableCell>
                <TableCell className="font-medium">{protest.origin}</TableCell>
                <TableCell>{protest.type}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">R$ {protest.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Bad Checks Table */}
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
                <TableCell className="font-medium">Banco {check.bankNumber}</TableCell>
                <TableCell className="text-right font-bold text-yellow-600">{check.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
      
    </div>
  );
}
