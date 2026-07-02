'use client';

import {
  AlertTriangle,
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from 'lucide-react';
import { formatCurrency, formatCpfCnpj } from '@/lib/formatters';
import { formatDisplayDate } from '@/lib/utils';
import type {
  CommercialAnalysisEstimatedAmount,
  CommercialAnalysisFinancialRestrictions,
  CommercialAnalysisPfResult,
  CommercialAnalysisPjResult,
} from '@/types/query-strategies';
import { InfoBox } from './InfoBox';
import { StrategySectionWrapper } from './StrategySectionWrapper';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/glass-table';

type CommercialAnalysisExtraSectionsData = Pick<
  CommercialAnalysisPfResult,
  | 'alerts'
  | 'contacts'
  | 'emails'
  | 'phones'
  | 'addresses'
  | 'companyParticipations'
  | 'estimatedIncome'
  | 'financialRestrictions'
> &
  Pick<CommercialAnalysisPjResult, 'estimatedRevenue'>;

function normalizeEstimatedAmount(
  value?: string | CommercialAnalysisEstimatedAmount,
): CommercialAnalysisEstimatedAmount | null {
  if (!value) return null;
  if (typeof value === 'string') {
    return { annualIncome: value };
  }
  return value;
}

export function CommercialAnalysisExtraSections({
  data,
}: {
  data: CommercialAnalysisExtraSectionsData;
}) {
  const alerts = data.alerts ?? [];
  const contacts = data.contacts ?? [];
  const emails = data.emails ?? [];
  const phones = data.phones ?? [];
  const addresses = data.addresses ?? [];
  const companyParticipations = data.companyParticipations ?? [];
  const estimatedAmount =
    normalizeEstimatedAmount(data.estimatedIncome) ??
    normalizeEstimatedAmount(data.estimatedRevenue);
  const financialRestrictions = data.financialRestrictions;

  return (
    <>
      {estimatedAmount && (
        <StrategySectionWrapper
          title="Faixa Presumida"
          icon={<Building2 className="w-5 h-5 text-primary" />}
          isEmpty={false}
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {estimatedAmount.range && (
              <InfoBox label="Faixa" value={estimatedAmount.range} icon={<Building2 className="w-4 h-4 text-primary" />} />
            )}
            {estimatedAmount.annualIncome && (
              <InfoBox
                label="Valor Anual"
                value={String(estimatedAmount.annualIncome)}
                icon={<Calendar className="w-4 h-4 text-primary" />}
              />
            )}
            {estimatedAmount.message && (
              <InfoBox label="Classe" value={estimatedAmount.message} icon={<ShieldAlert className="w-4 h-4 text-primary" />} />
            )}
            {estimatedAmount.description && (
              <InfoBox label="Status" value={estimatedAmount.description} icon={<AlertTriangle className="w-4 h-4 text-primary" />} />
            )}
          </div>
        </StrategySectionWrapper>
      )}

      {financialRestrictions &&
        ((financialRestrictions.count ?? 0) > 0 ||
          Number(financialRestrictions.totalValue ?? 0) > 0 ||
          financialRestrictions.firstDueDate ||
          financialRestrictions.lastDueDate) && (
          <StrategySectionWrapper
            title="Restrições Financeiras"
            icon={<ShieldAlert className="w-5 h-5 text-red-500" />}
            isEmpty={false}
          >
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoBox
                label="Ocorrências"
                value={String(financialRestrictions.count || 0)}
                icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              />
              <InfoBox
                label="Valor Total"
                value={formatCurrency(String(financialRestrictions.totalValue || 0))}
                icon={<ShieldAlert className="w-4 h-4 text-red-500" />}
              />
              <InfoBox
                label="Primeiro Vencimento"
                value={formatDisplayDate(financialRestrictions.firstDueDate) || '-'}
                icon={<Calendar className="w-4 h-4 text-red-500" />}
              />
              <InfoBox
                label="Último Vencimento"
                value={formatDisplayDate(financialRestrictions.lastDueDate) || '-'}
                icon={<Calendar className="w-4 h-4 text-red-500" />}
              />
            </div>
          </StrategySectionWrapper>
        )}

      {companyParticipations.length > 0 && (
        <StrategySectionWrapper
          title="Participações em Empresas"
          icon={<Building2 className="w-5 h-5 text-primary" />}
          count={companyParticipations.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CNPJ</TableHead>
                <TableHead>Razão Social</TableHead>
                <TableHead className="text-right">Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyParticipations.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{formatCpfCnpj(item.cnpj || '-')}</TableCell>
                  <TableCell className="font-medium">{item.socialReason || '-'}</TableCell>
                  <TableCell className="text-right">{item.participation || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {contacts.length > 0 && (
        <StrategySectionWrapper
          title="Vínculos Encontrados"
          icon={<User className="w-5 h-5 text-primary" />}
          count={contacts.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Relação</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Cidade/UF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.name || '-'}</TableCell>
                  <TableCell>{item.relation || '-'}</TableCell>
                  <TableCell>{formatCpfCnpj(item.document || '-')}</TableCell>
                  <TableCell>
                    {[item.city, item.state].filter(Boolean).join(' / ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {phones.length > 0 && (
        <StrategySectionWrapper
          title="Telefones"
          icon={<Phone className="w-5 h-5 text-primary" />}
          count={phones.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DDD</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Operadora</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.areaCode || '-'}</TableCell>
                  <TableCell className="font-medium">{item.number || '-'}</TableCell>
                  <TableCell>{item.type || '-'}</TableCell>
                  <TableCell>{(item as { carrier?: string }).carrier || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {emails.length > 0 && (
        <StrategySectionWrapper
          title="E-mails"
          icon={<Mail className="w-5 h-5 text-primary" />}
          count={emails.length}
          isEmpty={false}
        >
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {emails.map((email, idx) => (
              <InfoBox key={`${email}-${idx}`} label={`E-mail ${idx + 1}`} value={email} icon={<Mail className="w-4 h-4 text-primary" />} />
            ))}
          </div>
        </StrategySectionWrapper>
      )}

      {addresses.length > 0 && (
        <StrategySectionWrapper
          title="Endereços"
          icon={<MapPin className="w-5 h-5 text-primary" />}
          count={addresses.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logradouro</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>CEP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addresses.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{item.street || '-'}</TableCell>
                  <TableCell>{item.district || '-'}</TableCell>
                  <TableCell>
                    {[item.city, item.state].filter(Boolean).join(' / ') || '-'}
                  </TableCell>
                  <TableCell>{item.number || '-'}</TableCell>
                  <TableCell>{item.zip || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {alerts.length > 0 && (
        <StrategySectionWrapper
          title="Alertas"
          icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
          count={alerts.length}
          isEmpty={false}
        >
          <div className="p-4 space-y-3">
            {alerts.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className="rounded-xl border border-orange-100 bg-orange-50/60 p-4"
              >
                <p className="text-sm font-semibold text-orange-900">{item.title || 'Alerta'}</p>
                <p className="mt-1 text-sm leading-relaxed text-orange-800 whitespace-pre-wrap">
                  {item.description || '-'}
                </p>
              </div>
            ))}
          </div>
        </StrategySectionWrapper>
      )}
    </>
  );
}
