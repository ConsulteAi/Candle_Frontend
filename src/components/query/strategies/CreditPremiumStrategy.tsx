import {
  AlertTriangle,
  FileWarning,
  CheckCircle2,
  Calendar,
  Users,
  User,
  Briefcase,
  Fingerprint,
  XCircle,
  Eye,
  FileText
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps } from '@/types/query-strategies';
import type { PremiumCreditReportResponse } from '@/types/credit';
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
import { cn } from '@/lib/utils';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { formatDisplayDate } from '@/lib/utils';

export function CreditPremiumStrategy({ data }: QueryStrategyProps<PremiumCreditReportResponse>) {
  if (!data) return null;

  const isRestricted = data.status === 'RESTRICTED';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header Section */}
      <div className="grid md:grid-cols-12 gap-6">

        {/* Status Card (Left) - Mimics ScoreGauge layout */}
        <div className="md:col-span-4">
           <Card className="h-full relative overflow-hidden border-2 border-primary/20 dark:border-primary/80 bg-gradient-to-br from-white to-primary/10 dark:from-gray-900 dark:to-gray-800 p-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/50/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col items-center justify-center py-8 h-full">
                <div className="relative mb-4">
                   {isRestricted ? (
                     <div className="w-40 h-40 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                        <XCircle className="w-24 h-24 text-red-500" />
                     </div>
                   ) : (
                      <div className="w-40 h-40 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <CheckCircle2 className="w-24 h-24 text-green-500" />
                      </div>
                   )}
                </div>

                <div className="text-center">
                  <span className={cn(
                    "text-3xl font-bold",
                    isRestricted ? "text-red-500" : "text-green-500"
                  )}>
                    {isRestricted ? "RESTRITO" : "LIMPO"}
                  </span>
                  <p className="text-sm text-gray-500 font-medium mt-1">SITUAÇÃO DO CPF</p>
                </div>
              </div>
            </Card>
        </div>

        {/* Person Info (Right) */}
        <div className="md:col-span-8">
          <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
             <div className="flex h-full flex-col">
               <StrategyHeader
                  title={data.person.name || 'Nome não informado'}
                  protocol={data.protocol}
                  status={data.person.revenueStatus}
                  statusVariant={data.person.revenueStatus === 'REGULAR' ? 'success' : 'warning'}
                  pdfUrl={data.pdf}
                  className="mb-4"
               />

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  <InfoBox
                    label="CPF"
                    value={data.person.document}
                    icon={<Fingerprint className="w-4 h-4 text-purple-500" />}
                  />
                  <InfoBox
                    label="Nascimento"
                    value={formatDisplayDate(data.person.birthDate)}
                    icon={<Calendar className="w-4 h-4 text-purple-500" />}
                  />
                  <InfoBox
                    label="Gênero"
                    value={data.person.gender}
                    icon={<User className="w-4 h-4 text-purple-500" />}
                  />
                  <div className="md:col-span-2">
                     <InfoBox
                      label="Mãe"
                      value={data.person.motherName || 'Não informado'}
                      icon={<Users className="w-4 h-4 text-purple-500" />}
                    />
                  </div>
                   <InfoBox
                    label="Atividade"
                    value={data.person.mainEconomicActivity}
                    icon={<Briefcase className="w-4 h-4 text-purple-500" />}
                  />
               </div>
             </div>
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Dívidas"
          value={data.financialSummary.totalDebts}
          subtitle={data.financialSummary.totalDebts > 0 ? "Constam registros" : "Nada consta"}
          color={data.financialSummary.totalDebts > 0 ? "red" : "green"}
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <SummaryCard
          title="Protestos"
          value={data.financialSummary.totalProtests}
          subtitle={data.financialSummary.totalProtests > 0 ? "Constam registros" : "Nada consta"}
          color={data.financialSummary.totalProtests > 0 ? "orange" : "green"}
          icon={<FileWarning className="w-5 h-5" />}
        />
        <SummaryCard
          title="Consultas"
          value={data.financialSummary.totalQueries}
          subtitle="Recentes"
          color="blue"
          icon={<Eye className="w-5 h-5" />}
        />
        <SummaryCard
          title="CADIN"
          value={data.financialSummary.totalCadin || 0}
          subtitle={(data.financialSummary.totalCadin || 0) > 0 ? "Constam registros" : "Nada consta"}
          color={(data.financialSummary.totalCadin || 0) > 0 ? "purple" : "green"}
          icon={<FileText className="w-5 h-5" />}
        />
        <SummaryCard
          title="CCF"
          value={data.financialSummary.totalCcf || 0}
          subtitle={(data.financialSummary.totalCcf || 0) > 0 ? "Constam registros" : "Nada consta"}
          color={(data.financialSummary.totalCcf || 0) > 0 ? "yellow" : "green"}
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
               <TableHead>Cartório</TableHead>
               <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.protests?.map((protest, idx) => (
              <TableRow key={idx}>
                <TableCell>{protest.date}</TableCell>
                <TableCell className="font-medium">{protest.notary}</TableCell>
                <TableCell className="text-right font-bold text-orange-600">R$ {protest.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* CADIN Table logic */}
      <StrategySectionWrapper
         title={`CADIN (${data.cadin?.length || 0})`}
         icon={<FileText className="w-5 h-5 text-purple-500" />}
         isEmpty={!data.cadin || data.cadin.length === 0}
         emptyMessage="Nenhum registro no CADIN."
      >
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead>Data</TableHead>
               <TableHead>Entidade</TableHead>
               <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.cadin?.map((entry, idx) => (
              <TableRow key={idx}>
                <TableCell>{entry.date}</TableCell>
                <TableCell className="font-medium">{entry.literal}</TableCell>
                <TableCell className="text-right font-bold text-purple-600">R$ {entry.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* CCF Table logic */}
       <StrategySectionWrapper
         title={`CCF - Cheques sem Fundo (${data.ccf?.length || 0})`}
         icon={<FileText className="w-5 h-5 text-yellow-500" />}
         isEmpty={!data.ccf || data.ccf.length === 0}
         emptyMessage="Nenhum registro no CCF."
      >
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead>Data</TableHead>
               <TableHead>Origem</TableHead>
               <TableHead className="text-right">Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.ccf?.map((entry, idx) => (
              <TableRow key={idx}>
                <TableCell>{entry.date}</TableCell>
                <TableCell className="font-medium">{entry.origin}</TableCell>
                <TableCell className="text-right font-bold text-yellow-600">{entry.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Queries Table */}
       <StrategySectionWrapper
         title={`Histórico de Consultas (${data.queries?.length || 0})`}
         icon={<Eye className="w-5 h-5 text-primary" />}
         isEmpty={!data.queries || data.queries.length === 0}
         emptyMessage="Nenhuma consulta recente."
      >
        <Table>
          <TableHeader>
            <TableRow>
               <TableHead>Data</TableHead>
               <TableHead>Entidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.queries?.map((q, idx) => (
              <TableRow key={idx}>
                <TableCell>{q.date}</TableCell>
                <TableCell className="font-medium">{q.entity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

    </div>
  );
}
