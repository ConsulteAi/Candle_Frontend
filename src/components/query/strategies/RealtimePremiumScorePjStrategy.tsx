'use client';

import { 
  Building2, 
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  Users
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import type { QueryStrategyProps, RealtimePremiumScorePjResult } from '@/types/query-strategies';
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

export function RealtimePremiumScorePjStrategy({ data }: QueryStrategyProps<RealtimePremiumScorePjResult>) {
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
            label="SCORE"
          />
        </div>

        {/* Company Info (Right) */}
        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
             <StrategyHeader 
               title={data.company.socialReason}
               subtitle={data.company.fantasyName}
               protocol={data.protocol}
               status={data.company.status}
               statusVariant={data.company.status === 'ATIVA' ? 'success' : 'warning'}
               pdfUrl={data.pdf}
               className="mb-6"
             >
                {/* Extra Badge for Probability */}
                {data.score.probability && (
                  <div className="mb-4 flex">
                     <Badge variant="info">
                         Probabilidade: {data.score.probability}%
                     </Badge>
                  </div>
                )}
             </StrategyHeader>

             <div className="grid grid-cols-2 gap-4 mt-6">
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
             </div>
          </Card>
        </div>
      </div>

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

       {/* Partners (Socios) */}
       <StrategySectionWrapper
         title="Quadro Societário"
         icon={<Users className="w-5 h-5 text-indigo-500" />}
         count={data.partners?.length || 0}
         isEmpty={!data.partners || data.partners.length === 0}
         emptyMessage="Nenhum sócio encontrado."
       >
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {data.partners?.map((partner, idx) => (
              <div key={idx} className="flex flex-col p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <div className="flex items-start justify-between mb-2">
                    <span className="font-bold text-gray-900">{partner.name}</span>
                    <Badge variant="outline" className="text-xs">{partner.role}</Badge>
                 </div>
                 <div className="text-sm text-gray-500">
                   Documento: <span className="font-mono text-gray-700">{partner.document}</span>
                 </div>
              </div>
           ))}
         </div>
       </StrategySectionWrapper>

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
                <TableHead>Notário/Origem</TableHead>
                <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests?.map((protest, idx) => (
              <TableRow key={idx}>
                <TableCell>{protest.date}</TableCell>
                <TableCell className="font-medium">{protest.notary || protest.origin}</TableCell>
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
