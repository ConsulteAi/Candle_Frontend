'use client';

import {
  User,
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, BvsBasicaPfResult } from '@/types/query-strategies';
import { AlertsGrid } from './components/AlertsGrid';
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

export function BvsBasicaPfStrategy({ data }: QueryStrategyProps<BvsBasicaPfResult>) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader 
           title={data.person.name}
           protocol={data.protocol}
           status={data.person.status}
           statusVariant={data.person.status === 'REGULAR' ? 'success' : 'warning'}
           pdfUrl={data.pdf}
        />
        <div className="grid grid-cols-2 gap-4 mt-2">
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

       {/* Address */}
      {data.address && (data.address.street || data.address.city) && (
         <StrategyContacts 
            addresses={[
              {
                street: data.address.street,
                number: '',
                district: data.address.district,
                city: data.address.city,
                state: data.address.state,
                zip: data.address.zip
              }
            ]}
         />
      )}

      {/* Behavioral Alerts Grid */}
      <AlertsGrid alerts={data.alerts || []} />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

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
