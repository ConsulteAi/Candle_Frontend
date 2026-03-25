'use client';

import { 
  FileWarning, 
  MapPin, 
  Building2,
  Calendar,
  Phone,
  User,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';
import type { QueryStrategyProps, ProtestoNacionalResult } from '@/types/query-strategies';
import { SummaryCard } from './components/SummaryCard';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import { InfoBox } from './components/InfoBox';

export function ProtestoNacionalStrategy({ data }: QueryStrategyProps<ProtestoNacionalResult>) {
  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg">
        <StrategyHeader 
          title="Protesto Nacional"
          subtitle={data.product}
          protocol={data.protocol}
          status="CONSULTA"
          statusVariant="warning"
          pdfUrl={data.pdf}
        />
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <SummaryCard 
            title="Valor Total" 
            value={data.totalValue} 
            color="red" 
            icon={<FileWarning className="w-5 h-5" />}
            subtitle="Em protestos"
         />
         <SummaryCard 
            title="Registros" 
            value={data.totalProtests} 
            color="gray" 
            icon={<Building2 className="w-5 h-5" />}
            subtitle="Total encontrados"
         />
      </div>

      {/* Protests Detail */}
      <StrategySectionWrapper
        title="Detalhamento dos Protestos"
        icon={<FileWarning className="w-5 h-5 text-red-500" />}
        count={data.protests?.length || 0}
        isEmpty={!data.protests || data.protests.length === 0}
        emptyMessage="Nenhum protesto encontrado para este documento."
      >
        <div className="space-y-4">
          {data.protests?.map((protest, idx) => (
            <Card key={idx} className="p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Column 1: Value & Date */}
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <p className="text-xs text-red-600 dark:text-red-400 uppercase font-bold mb-1">Valor do Protesto</p>
                    <p className="text-xl font-bold text-red-600 dark:text-red-400">R$ {protest.value}</p>
                  </div>
                  <InfoBox 
                    label="Data do Protesto" 
                    value={protest.date} 
                    icon={<Calendar className="w-4 h-4 text-gray-400" />} 
                  />
                </div>

                {/* Column 2: Notary & Location */}
                <div className="space-y-4">
                  <InfoBox 
                    label="Cartório" 
                    value={`${protest.notary}º Tabelionato`} 
                    icon={<Building2 className="w-4 h-4 text-gray-400" />} 
                  />
                  <InfoBox 
                    label="Local" 
                    value={`${protest.city} - ${protest.state}`} 
                    icon={<MapPin className="w-4 h-4 text-gray-400" />} 
                  />
                </div>

                {/* Column 3: Creditor Info */}
                <div className="space-y-4">
                  <InfoBox 
                    label="Credor" 
                    value={protest.creditor} 
                    icon={<User className="w-4 h-4 text-gray-400" />} 
                  />
                  <InfoBox 
                    label="Cedente" 
                    value={protest.assignor} 
                    icon={<User className="w-4 h-4 text-gray-400" />} 
                  />
                </div>

                {/* Column 4: Contact Info */}
                <div className="space-y-4">
                   <InfoBox 
                    label="Endereço do Cartório" 
                    value={protest.address} 
                    icon={<MapPin className="w-4 h-4 text-gray-400" />} 
                  />
                  {protest.phone && (
                    <InfoBox 
                      label="Telefone" 
                      value={protest.phone} 
                      icon={<Phone className="w-4 h-4 text-gray-400" />} 
                    />
                  )}
                </div>

              </div>
            </Card>
          ))}
        </div>
      </StrategySectionWrapper>
    </div>
  );
}
