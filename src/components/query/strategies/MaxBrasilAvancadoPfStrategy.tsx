'use client';

import { 
  User, 
  MapPin, 
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  Phone
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, MaxBrasilAvancadoPfResult } from '@/types/query-strategies';
import { AlertsGrid } from './components/AlertsGrid';
import { ScoreGauge } from './components/ScoreGauge';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategyContacts } from './components/StrategyContacts';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";

export function MaxBrasilAvancadoPfStrategy({ data }: QueryStrategyProps<MaxBrasilAvancadoPfResult>) {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Score Card (Left) */}
        <div className="md:col-span-4">
          <ScoreGauge 
            value={Number(data.score.value)} 
            band={`Classe ${data.score.class}`}
            riskText={data.score.riskText}
          />
        </div>

        {/* Info Card (Right) */}
        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
             <StrategyHeader 
               title={data.person.name}
               protocol={data.protocol}
               status={data.person.status}
               statusVariant={data.person.status === 'REGULAR' ? 'success' : 'warning'}
               pdfUrl={data.pdf}
             />

             <div className="grid grid-cols-2 gap-4">
               <InfoBox 
                 label="Documento" 
                 value={data.person.document}
                 icon={<User className="w-4 h-4 text-indigo-500" />}
               />
               <InfoBox 
                 label="Nascimento" 
                 value={formatDisplayDate(data.person.birthDate)}
                 icon={<Calendar className="w-4 h-4 text-indigo-500" />}
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
        </div>
      </div>

      {/* Behavioral Alerts Grid */}
      <AlertsGrid alerts={data.alerts || []} />

      {/* Summary Stats Cards */}
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

      <StrategyContacts 
        phones={data.phones}
        addresses={data.addresses}
      />

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
                <TableCell className="text-xs text-gray-500">{protest.type}</TableCell>
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

