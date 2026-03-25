'use client';

import { 
  User, 
  Phone, 
  MapPin, 
  Users, 
  Mail, 
  Smartphone,
  Calendar
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import type { QueryStrategyProps, LocalizaResult } from '@/types/query-strategies';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';

export function LocalizaStrategy({ data }: QueryStrategyProps<LocalizaResult>) {
  if (!data) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Basic Info Card */}
      <Card className="h-full p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
          <div className="flex flex-col gap-6">
             <div className="flex-1">
               <StrategyHeader 
                  title={data.basicInfo.name || "NOME NÃO INFORMADO"}
                  protocol={data.protocol}
                  status={data.basicInfo.status}
                  statusVariant="info"
                  pdfUrl={data.pdf}
                  className="mb-6"
               />

               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                 <InfoBox 
                   label="Documento" 
                   value={data.basicInfo.document}
                   icon={<User className="w-4 h-4 text-primary" />}
                 />
                 {data.basicInfo.birthDate && (
                   <InfoBox 
                      label="Nascimento" 
                      value={formatDisplayDate(data.basicInfo.birthDate)}
                      icon={<Calendar className="w-4 h-4 text-primary" />}
                   />
                 )}
                 {data.basicInfo.motherName && (
                   <div className="lg:col-span-1">
                     <InfoBox 
                       label="Nome da Mãe" 
                       value={data.basicInfo.motherName}
                       icon={<User className="w-4 h-4 text-gray-400" />}
                     />
                   </div>
                 )}
               </div>
             </div>
         </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <Card className="p-6 h-full border border-gray-100 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contatos
            </h3>
            
            <div className="space-y-6">
              {data.contact.mainPhone && (
                <div className="p-4 bg-primary/10 dark:bg-primary/80/20 rounded-xl border border-primary/20 dark:border-primary/80">
                  <span className="text-xs text-primary dark:text-primary/40 font-bold uppercase tracking-wide">Telefone Principal</span>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.contact.mainPhone}</p>
                </div>
              )}

              {data.contact.mobilePhones.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Smartphone className="w-3 h-3" /> Celulares
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {data.contact.mobilePhones.map((phone, i) => (
                      <Badge key={i} variant="outline" className="text-sm py-1 px-3 bg-gray-50">{phone}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.contact.emails.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Emails
                  </label>
                  <div className="flex flex-col gap-2">
                    {data.contact.emails.map((email, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Mail className="w-3 h-3 text-gray-400" />
                        {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </Card>

        {/* Relations */}
        <Card className="p-6 h-full border border-gray-100 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Relacionamentos
            </h3>
            
            <div className="space-y-4">
               {data.relations.relatives.length > 0 ? (
                 <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                   {data.relations.relatives.map((rel, i) => (
                     <li key={i} className="py-3 flex justify-between items-center first:pt-0">
                       <div>
                         <p className="font-bold text-gray-900 dark:text-white text-sm">{rel.name}</p>
                         <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] uppercase">{rel.type}</Badge>
                            <span className="text-xs text-gray-500">{rel.relation}</span>
                         </div>
                       </div>
                     </li>
                   ))}
                 </ul>
               ) : (
                 <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <Users className="w-12 h-12 text-gray-300 mb-2" />
                    <p>Nenhum relacionamento encontrado.</p>
                 </div>
               )}
            </div>
        </Card>
      </div>

      {/* Addresses */}
      <Card className="p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Endereços Encontrados ({data.addresses.length})
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.addresses.map((addr, i) => (
              <div 
                key={i} 
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900 transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="warning" className="text-[10px] px-2 h-5">{addr.source}</Badge>
                  <span className="text-xs text-gray-400 font-mono tracking-tight">{addr.zipCode}</span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                  {addr.street}, {addr.number}
                </p>
                <p className="text-gray-500 text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {addr.neighborhood} - {addr.city}/{addr.state}
                </p>
              </div>
            ))}
          </div>
      </Card>
      
    </div>
  );
}
