'use client';

import { Building2, MapPin, Phone, Mail, Users, FileText, Calendar, Percent } from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import { formatCpfCnpj } from '@/lib/formatters';
import type { QueryStrategyProps, DadosCnpjResult } from '@/types/query-strategies';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/glass-table';

export function DadosCnpjStrategy({ data, queryId }: QueryStrategyProps<DadosCnpjResult>) {
  if (!data) return null;

  const { company, addresses = [], phones = [], emails = [], simplesNacional, partners = [] } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Company Header */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={company.fantasyName || company.socialReason || 'RAZÃO SOCIAL NÃO INFORMADA'}
          protocol={undefined}
          status={company.status}
          statusVariant={company.status?.toUpperCase() === 'ATIVA' ? 'success' : 'warning'}
          queryId={queryId}
          className="mb-6"
        >
          {company.socialReason && company.fantasyName && (
            <p className="text-sm text-gray-500 mt-1">{company.socialReason}</p>
          )}
        </StrategyHeader>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox label="CNPJ" value={formatCpfCnpj(company.cnpj)} icon={<Building2 className="w-4 h-4 text-primary" />} />
          {company.foundationDate && (
            <InfoBox label="Fundação" value={formatDisplayDate(company.foundationDate)} icon={<Calendar className="w-4 h-4 text-primary" />} />
          )}
          {company.legalNature && (
            <InfoBox label="Natureza Jurídica" value={company.legalNature} icon={<FileText className="w-4 h-4 text-gray-400" />} />
          )}
          {company.cnae && (
            <InfoBox label="CNAE" value={company.cnae} icon={<Briefcase className="w-4 h-4 text-gray-400" />} />
          )}
          {company.size && (
            <InfoBox label="Porte" value={company.size} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
          )}
          {company.revenueSize && (
            <InfoBox label="Porte Receita" value={company.revenueSize} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
          )}
          {company.capital && (
            <InfoBox label="Capital Social" value={company.capital} icon={<Percent className="w-4 h-4 text-green-500" />} />
          )}
          {company.segment && (
            <InfoBox label="Segmento" value={company.segment} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
          )}
          {company.mosaicBusiness && (
            <InfoBox label="Mosaico" value={company.mosaicBusiness} icon={<Building2 className="w-4 h-4 text-indigo-400" />} />
          )}
          {company.isMatrix != null && (
            <InfoBox label="Tipo" value={company.isMatrix ? 'Matriz' : 'Filial'} icon={<Building2 className="w-4 h-4 text-gray-400" />} />
          )}
        </div>
      </Card>

      {/* Simples Nacional */}
      {simplesNacional && (simplesNacional.statusSimples || simplesNacional.statusSimei) && (
        <Card className="p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-500" />
            Simples Nacional
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {simplesNacional.statusSimples && (
              <InfoBox
                label="Status Simples"
                value={simplesNacional.statusSimples}
                icon={<FileText className="w-4 h-4 text-teal-500" />}
              />
            )}
            {simplesNacional.statusSimei && (
              <InfoBox
                label="Status SIMEI"
                value={simplesNacional.statusSimei}
                icon={<FileText className="w-4 h-4 text-teal-500" />}
              />
            )}
            {simplesNacional.dateSimples && (
              <InfoBox
                label="Data Opção Simples"
                value={formatDisplayDate(simplesNacional.dateSimples)}
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
            )}
            {simplesNacional.dateSimei && (
              <InfoBox
                label="Data Opção SIMEI"
                value={formatDisplayDate(simplesNacional.dateSimei)}
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
            )}
          </div>
        </Card>
      )}

      {/* Partners */}
      <StrategySectionWrapper
        title="Quadro Societário"
        icon={<Users className="w-5 h-5 text-purple-500" />}
        count={partners.length}
        isEmpty={partners.length === 0}
        emptyMessage="Nenhum sócio encontrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Participação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{p.cpf ? formatCpfCnpj(p.cpf) : '-'}</TableCell>
                <TableCell>
                  {p.participation ? (
                    <Badge variant="outline" className="text-[10px]">{p.participation}%</Badge>
                  ) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Addresses */}
      {addresses.length > 0 && (
        <Card className="p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" />
            Endereços ({addresses.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((addr, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {addr.street}{(addr as any).number ? `, ${(addr as any).number}` : ''}
                </p>
                <p className="text-gray-500 text-xs">{addr.district} — {addr.city}/{addr.state}</p>
                <p className="text-gray-400 text-xs font-mono mt-1">{addr.zip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Phones & Emails */}
      {(phones.length > 0 || emails.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">
          {phones.length > 0 && (
            <Card className="p-6 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-500" />
                Telefones ({phones.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {phones.map((phone, i) => (
                  <Badge key={i} variant="outline" className="text-sm py-1 px-3 font-mono bg-gray-50">{phone}</Badge>
                ))}
              </div>
            </Card>
          )}

          {emails.length > 0 && (
            <Card className="p-6 border border-gray-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                E-mails ({emails.length})
              </h3>
              <div className="flex flex-col gap-2">
                {emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    {email}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
