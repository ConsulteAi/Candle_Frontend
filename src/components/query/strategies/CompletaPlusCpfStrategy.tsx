'use client';

import { 
  User, 
  Search, 
  Calendar, 
  Mail,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, CompletaPlusCpfResult } from '@/types/query-strategies';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';
import { StrategyContacts } from './components/StrategyContacts';

export function CompletaPlusCpfStrategy({ data }: QueryStrategyProps<CompletaPlusCpfResult>) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
         <StrategyHeader
            title={data.person.name}
            protocol={data.protocol}
            status={data.person.revenueStatus}
            statusVariant={data.person.revenueStatus === 'REGULAR' ? 'success' : 'warning'}
            pdfUrl={data.pdf}
         />
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
             <InfoBox 
               label="Documento" 
               value={data.person.document}
               icon={<User className="w-4 h-4 text-primary" />}
             />
             <InfoBox 
               label="Nascimento" 
               value={`${formatDisplayDate(data.person.birthDate)} (${data.person.gender})`}
               icon={<Calendar className="w-4 h-4 text-primary" />}
             />
             {data.person.email && (
                <InfoBox 
                  label="Email" 
                  value={data.person.email}
                  icon={<Mail className="w-4 h-4 text-primary" />}
                />
             )}
             {data.person.motherName && (
               <div className="lg:col-span-2">
                 <InfoBox 
                   label="Nome da Mãe" 
                   value={data.person.motherName}
                   icon={<User className="w-4 h-4 text-gray-400" />}
                 />
               </div>
             )}
         </div>
      </Card>

      {/* Contacts if available */}
      <StrategyContacts 
         phones={data.phones}
         addresses={data.addresses?.map(addr => ({
            street: addr.street,
            district: addr.district,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            // Assuming CompletaPlus might have number if it matches BaseAddress, but interface says BaseAddress usually doesn't have number in common type? Warning: BaseAddress in `query-strategies.ts` only has street, district, city, state, zip. StrategyContacts expects that + optional number. Fine.
         }))}
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <SummaryCard 
          title="Dívidas Negativadas"
          value={data.totalDebts}
          subtitle={data.totalDebts > 0 ? "Constam registros" : "Nada consta"}
          color={data.totalDebts > 0 ? "red" : "green"}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard 
          title="Consultas Recentes"
          value={data.totalQueries}
          subtitle="Últimos meses"
          color="blue"
          icon={<Search className="w-5 h-5" />}
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

      {/* Queries History */}
      <StrategySectionWrapper
         title={`Histórico de Consultas (${data.queries.length})`}
         icon={<Search className="w-5 h-5 text-primary" />}
         isEmpty={data.queries.length === 0}
         emptyMessage="Nenhuma consulta recente encontrada."
      >
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead>Data</TableHead>
               <TableHead>Entidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.queries.map((q, idx) => (
              <TableRow key={idx}>
                <TableCell>{q.date}</TableCell>
                <TableCell>{q.entity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>
    </div>
  );
}
