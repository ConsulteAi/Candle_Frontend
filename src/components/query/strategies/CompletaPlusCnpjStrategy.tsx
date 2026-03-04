'use client';

import { 
  Building2, 
  MapPin, 
  Mail, 
  Calendar,
  AlertTriangle,
  Search,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, CompletaPlusCnpjResult } from '@/types/query-strategies';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/glass-table";
import { ScoreGauge } from './components/ScoreGauge';
import { InfoBox } from './components/InfoBox';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';
import { StrategyContacts } from './components/StrategyContacts';

export function CompletaPlusCnpjStrategy({ data }: QueryStrategyProps<CompletaPlusCnpjResult>) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Info & Score */}
      <Card className="h-full relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg p-0">
          <div className="flex flex-col md:flex-row h-full">
            {/* Score Section (Left) */}
            <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 relative">
               <ScoreGauge 
                 value={Number(data.score.value)} 
                 band={`Classe ${data.score.class}`}
                 riskText={data.score.riskText}
                 label="SCORE"
                 simpleMode
               />
            </div>

            {/* Info Section (Right) */}
            <div className="flex-1 p-6">
                <StrategyHeader 
                  title={data.company.socialReason}
                  subtitle={data.company.fantasyName}
                  protocol={data.protocol}
                  status={data.company.status}
                  statusVariant={data.company.status === 'ATIVA' ? 'success' : 'warning'}
                  pdfUrl={data.pdf}
                  className="mb-4"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InfoBox 
                    label="CNPJ" 
                    value={data.company.cnpj} 
                    icon={<Building2 className="w-4 h-4 text-purple-500" />} 
                  />
                  <InfoBox 
                    label="Fundação" 
                    value={formatDisplayDate(data.company.foundationDate)} 
                    icon={<Calendar className="w-4 h-4 text-purple-500" />} 
                  />
                  {data.company.email && (
                     <InfoBox 
                        label="Email"
                        value={data.company.email}
                        icon={<Mail className="w-4 h-4 text-primary" />}
                     />
                  )}
                </div>
            </div>
          </div>
      </Card>

      {/* Contacts */}
      <StrategyContacts
         phones={data.company.phone ? [{ areaCode: '', number: data.company.phone }] : []}
         addresses={data.company.address ? [{
            street: data.company.address.street,
            number: '',
            district: data.company.address.district,
            city: data.company.address.city,
            state: data.company.address.state,
            zip: data.company.address.zip
         }] : []}
      />

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
        <SummaryCard
          title="Consultas"
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

      {/* Protests Table */}
      <StrategySectionWrapper
         title={`Detalhamento de Protestos (${data.protests.length})`}
         icon={<FileWarning className="w-5 h-5 text-orange-500" />}
         isEmpty={data.protests.length === 0}
         emptyMessage="Nenhum protesto registrado."
      >
        <Table>
           <TableHeader>
              <TableRow>
                 <TableHead>Data</TableHead>
                 <TableHead>Cartório</TableHead>
                 <TableHead>Origem</TableHead>
                 <TableHead className="text-right">Valor</TableHead>
              </TableRow>
           </TableHeader>
           <TableBody>
              {data.protests.map((p, idx) => (
                <TableRow key={idx}>
                   <TableCell>{p.date}</TableCell>
                   <TableCell className="font-medium">{p.notary}</TableCell>
                   <TableCell>{p.origin}</TableCell>
                   <TableCell className="text-right font-bold text-orange-600">R$ {p.value}</TableCell>
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
               <TableHead>Local</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.queries.map((q, idx) => (
              <TableRow key={idx}>
                <TableCell>{q.date}</TableCell>
                <TableCell>{q.entity}</TableCell>
                <TableCell>{q.cityState}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

    </div>
  );
}
