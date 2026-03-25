'use client';

import { 
  Building2, 
  MapPin, 
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import type { BvsBasicaPjResult, QueryStrategyProps } from '@/types/query-strategies';
import { AlertsGrid } from './components/AlertsGrid';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategyContacts } from './components/StrategyContacts';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";

export function BvsBasicaPjStrategy({ data }: QueryStrategyProps<BvsBasicaPjResult>) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-purple-500">
        <StrategyHeader 
          title={data.company.name}
          protocol={data.protocol}
          status={data.company.status}
          statusVariant={data.company.status === 'ATIVO' ? 'success' : 'warning'}
          pdfUrl={data.pdf}
        />
        <div className="grid grid-cols-2 gap-4 mt-2">
          <InfoBox 
            label="CNPJ" 
            value={data.company.cnpj} 
            icon={<Building2 className="w-4 h-4 text-purple-500" />} 
          />
          <InfoBox 
            label="Fundação" 
            value={formatDisplayDate(data.company.foundationDate)} 
            icon={<Briefcase className="w-4 h-4 text-purple-500" />} 
          />
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
