'use client';

import { 
  Building2, 
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Phone,
  Briefcase,
  Users
} from 'lucide-react';
import { Card, Badge, StatsCard } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import type { QueryStrategyProps, MaxBrasilAvancadoPjResult } from '@/types/query-strategies';
import { AlertsGrid } from './components/AlertsGrid';
import { ScoreGauge } from './components/ScoreGauge';
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

export function MaxBrasilAvancadoPjStrategy({ data }: QueryStrategyProps<MaxBrasilAvancadoPjResult>) {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header with Company Info & Score */}
      <Card className="h-full relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg p-0">
         <div className="flex flex-col md:flex-row h-full">
           {/* Score Section (Left) - Only if score exists */}
           {data.score && (
              <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-800 relative">
                  <ScoreGauge 
                    value={Number(data.score.value)} 
                    band={`Classe ${data.score.class}`}
                    riskText={data.score.riskText}
                    label="SCORE"
                    simpleMode
                  />
              </div>
           )}

           {/* Company Details (Right) */}
           <div className="flex-1 p-6">
              <StrategyHeader 
                  title={data.company.fantasyName || data.company.socialReason}
                  subtitle={data.company.fantasyName ? data.company.socialReason : undefined}
                  protocol={data.protocol}
                  status={data.company.status}
                  statusVariant={data.company.status === 'ATIVA' ? 'success' : 'warning'}
                  pdfUrl={data.pdf}
                  className="mb-6"
               />

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
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
           </div>
         </div>
      </Card>

      {/* Partners (Socios) */}
      {data.partners && data.partners.length > 0 && (
         <Card className="overflow-hidden border border-gray-100 shadow-lg">
           <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Quadro Societário
              </h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
             {data.partners.map((partner, idx) => (
               <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                     <span className="font-bold text-gray-900 text-sm">{partner.name}</span>
                     <Badge variant="outline" className="text-[10px]">{partner.role}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">{partner.document}</span>
                  </div>
               </div>
             ))}
           </div>
        </Card>
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

       <StrategyContacts 
         phones={data.phones}
         addresses={data.addresses} // Assuming data.addresses exists on the interface, though originally was only in PF? Let's check view_file of PJ. yes it had map pin.
       />

      {/* Debts Table */}
      <StrategySectionWrapper
        title="Detalhamento de Dívidas"
        icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        count={data.debts.length}
        isEmpty={data.debts.length === 0}
        emptyMessage="Nenhuma dívida registrada."
      >
        <div className="overflow-x-auto">
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
        </div>
      </StrategySectionWrapper>

      {/* Protests Table */}
      <StrategySectionWrapper
        title="Detalhamento de Protestos"
        icon={<FileWarning className="w-5 h-5 text-orange-500" />}
        count={data.protests?.length || 0}
        isEmpty={!data.protests || data.protests.length === 0}
        emptyMessage="Nenhum protesto registrado."
      >
        <div className="overflow-x-auto">
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
        </div>
      </StrategySectionWrapper>
      
    </div>
  );
}
