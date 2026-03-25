'use client';

import { 
  User, 
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Calendar,
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, BoaVistaAcertaCpfResult } from '@/types/query-strategies';
import { AlertsGrid } from './components/AlertsGrid';
import { ScoreGauge } from './components/ScoreGauge';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import { StrategyHeader } from './components/StrategyHeader';
import { StrategyContacts } from './components/StrategyContacts';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

export function BoaVistaAcertaCpfStrategy({ data }: QueryStrategyProps<BoaVistaAcertaCpfResult>) {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Person Info & Score */}
      <Card className="h-full relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg p-0">
          <div className="flex flex-col md:flex-row h-full">
            {/* Score Section (Left) */}
            <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 relative">
               <ScoreGauge 
                 value={Number(data.score.value)} 
                 band={`Classe ${data.score.class}`}
                 riskText={data.score.risk}
                 label="SCORE"
                 simpleMode
               />
            </div>

            {/* Info Section (Right) */}
            <div className="flex-1 p-6">
                <StrategyHeader
                  title={data.person.name}
                  protocol={data.protocol}
                  status={data.person.status}
                  statusVariant={data.person.status === 'REGULAR' ? 'success' : 'warning'}
                  pdfUrl={data.pdf}
                  className="mb-6"
                />

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoBox 
                    label="Documento" 
                    value={data.person.document} 
                    icon={<User className="w-4 h-4 text-orange-500" />} 
                  />
                  <InfoBox 
                    label="Nascimento" 
                    value={formatDisplayDate(data.person.birthDate)} 
                    icon={<Calendar className="w-4 h-4 text-orange-500" />} 
                  />
                 {data.person.motherName && (
                   <div className="col-span-2 lg:col-span-3">
                     <InfoBox 
                       label="Nome da Mãe" 
                       value={data.person.motherName} 
                       icon={<User className="w-4 h-4 text-gray-400" />} 
                     />
                   </div>
                 )}
                </div>
            </div>
          </div>
      </Card>

      {/* Behavioral Alerts Grid */}
      <AlertsGrid alerts={data.alerts || []} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

       {/* Phones */}
       <StrategyContacts phones={data.phones} />

      {/* Debts Table */}
      <StrategySectionWrapper
         title={`Detalhamento de Dívidas (${data.debts.length})`}
         icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
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
         title={`Detalhamento de Protestos (${data.protests?.length || 0})`}
         icon={<FileWarning className="w-5 h-5 text-orange-500" />}
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
      
    </div>
  );
}
