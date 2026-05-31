'use client';

import {
  User, MapPin, Phone, Mail, Building2, Users,
  CreditCard, FileText, Calendar, GraduationCap, Briefcase,
} from 'lucide-react';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import { formatDisplayDate } from '@/lib/utils';
import { formatCpfCnpj } from '@/lib/formatters';
import type { QueryStrategyProps, DadosCpfResult } from '@/types/query-strategies';
import { InfoBox } from './components/InfoBox';
import { StrategyHeader } from './components/StrategyHeader';
import { StrategySectionWrapper } from './components/StrategySectionWrapper';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/glass-table';

export function DadosCpfStrategy({ data, queryId }: QueryStrategyProps<DadosCpfResult>) {
  if (!data) return null;

  const { person, scores, socialClass, relatives = [], companyParticipations = [],
    addresses = [], phones = [], emails = [], pis = [], irpf = [] } = data;

  const hasScores = scores && (scores.base || scores.antigo || scores.novoSerasaScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Person Header */}
      <Card className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg border-l-4 border-l-primary">
        <StrategyHeader
          title={person.name || 'NOME NÃO INFORMADO'}
          protocol={undefined}
          status={undefined}
          queryId={queryId}
          className="mb-6"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoBox label="CPF" value={formatCpfCnpj(person.document)} icon={<User className="w-4 h-4 text-primary" />} />
          {person.birthDate && (
            <InfoBox label="Nascimento" value={formatDisplayDate(person.birthDate)} icon={<Calendar className="w-4 h-4 text-primary" />} />
          )}
          {person.gender && (
            <InfoBox label="Sexo" value={person.gender} icon={<User className="w-4 h-4 text-primary" />} />
          )}
          {person.maritalStatus && (
            <InfoBox label="Estado Civil" value={person.maritalStatus} icon={<User className="w-4 h-4 text-gray-400" />} />
          )}
          {person.motherName && (
            <InfoBox label="Nome da Mãe" value={person.motherName} icon={<User className="w-4 h-4 text-gray-400" />} />
          )}
          {person.fatherName && (
            <InfoBox label="Nome do Pai" value={person.fatherName} icon={<User className="w-4 h-4 text-gray-400" />} />
          )}
          {person.nationality && (
            <InfoBox label="Nacionalidade" value={person.nationality} icon={<User className="w-4 h-4 text-gray-400" />} />
          )}
          {person.educationLevel && (
            <InfoBox label="Escolaridade" value={person.educationLevel} icon={<GraduationCap className="w-4 h-4 text-blue-500" />} />
          )}
          {person.cbo && (
            <InfoBox label="CBO" value={person.cbo} icon={<Briefcase className="w-4 h-4 text-gray-400" />} />
          )}
          {person.rg && (
            <InfoBox label="RG" value={`${person.rg}${person.issuer ? ` / ${person.issuer}` : ''}${person.issuerState ? `-${person.issuerState}` : ''}`} icon={<FileText className="w-4 h-4 text-gray-400" />} />
          )}
          {person.tituloEleitor && (
            <InfoBox label="Título Eleitor" value={person.tituloEleitor} icon={<FileText className="w-4 h-4 text-gray-400" />} />
          )}
          {(person.codigoMosaic || socialClass?.classe) && (
            <InfoBox
              label="Classe Social"
              value={[socialClass?.classe, socialClass?.subClasse].filter(Boolean).join(' / ') || person.codigoMosaic || ''}
              icon={<User className="w-4 h-4 text-indigo-400" />}
            />
          )}
        </div>
      </Card>

      {/* Scores */}
      {hasScores && (
        <Card className="p-6 border border-gray-100 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Scores de Crédito
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scores?.base && (
              <ScoreBlock label="Score Base" item={scores.base} novoSerasa={undefined} />
            )}
            {scores?.antigo && (
              <ScoreBlock label="Score Antigo" item={scores.antigo} novoSerasa={undefined} />
            )}
            {scores?.novoSerasaScore && (
              <ScoreBlock label="Score Novo" item={undefined} novoSerasa={scores.novoSerasaScore} />
            )}
          </div>
        </Card>
      )}

      {/* Phones & Emails */}
      <div className="grid md:grid-cols-2 gap-6">
        <StrategySectionWrapper
          title="Telefones"
          icon={<Phone className="w-5 h-5 text-green-500" />}
          count={phones.length}
          isEmpty={phones.length === 0}
          emptyMessage="Nenhum telefone encontrado."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Classificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phones.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono font-medium">{p.fullNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{p.classification || '-'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>

        <StrategySectionWrapper
          title="E-mails"
          icon={<Mail className="w-5 h-5 text-blue-500" />}
          count={emails.length}
          isEmpty={emails.length === 0}
          emptyMessage="Nenhum e-mail encontrado."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Pessoal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((e, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{e.email}</TableCell>
                  <TableCell>
                    <Badge variant={e.score === 'OTIMO' ? 'success' : 'outline'} className="text-[10px]">
                      {e.score || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.isPersonal === 'S' ? 'Sim' : e.isPersonal === 'N' ? 'Não' : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      </div>

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
                <p className="text-gray-500 text-xs">
                  {addr.district} — {addr.city}/{addr.state}
                </p>
                <p className="text-gray-400 text-xs font-mono mt-1">{addr.zip}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Relatives */}
      <StrategySectionWrapper
        title="Parentes"
        icon={<Users className="w-5 h-5 text-purple-500" />}
        count={relatives.length}
        isEmpty={relatives.length === 0}
        emptyMessage="Nenhum parente encontrado."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Vínculo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relatives.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="font-mono text-xs">{r.cpf ? formatCpfCnpj(r.cpf) : '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] uppercase">{r.relationship}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StrategySectionWrapper>

      {/* Company Participations */}
      {companyParticipations.length > 0 && (
        <StrategySectionWrapper
          title="Participações em Empresas"
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
          count={companyParticipations.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyParticipations.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{c.socialReason || c.fantasyName || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{formatCpfCnpj(c.cnpj)}</TableCell>
                  <TableCell>{c.participation ? `${c.participation}%` : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* PIS */}
      {pis.length > 0 && (
        <StrategySectionWrapper
          title="PIS/PASEP"
          icon={<FileText className="w-5 h-5 text-teal-500" />}
          count={pis.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PIS/PASEP</TableHead>
                <TableHead>Data de Inclusão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pis.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono">{p.pis}</TableCell>
                  <TableCell>{p.inclusionDate ? formatDisplayDate(p.inclusionDate) : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

      {/* IRPF */}
      {irpf.length > 0 && (
        <StrategySectionWrapper
          title="IRPF — Receita Federal"
          icon={<FileText className="w-5 h-5 text-gray-500" />}
          count={irpf.length}
          isEmpty={false}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead>Banco</TableHead>
                <TableHead>Agência</TableHead>
                <TableHead>Status Receita Federal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {irpf.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="font-bold">{item.referenceYear || '-'}</TableCell>
                  <TableCell>{item.bank || '-'}</TableCell>
                  <TableCell>{item.agency || '-'}</TableCell>
                  <TableCell className="text-xs text-gray-600">{item.status || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StrategySectionWrapper>
      )}

    </div>
  );
}

function ScoreBlock({ label, item, novoSerasa }: {
  label: string;
  item?: { serasaScore?: string; serasaFaixa?: string; boaVistaScore?: string; boaVistaFaixa?: string };
  novoSerasa?: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
      {item?.serasaScore && (
        <div className="mb-2">
          <span className="text-xs text-gray-500">Serasa</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">{item.serasaScore}</span>
            {item.serasaFaixa && (
              <Badge variant="warning" className="text-[10px]">{item.serasaFaixa}</Badge>
            )}
          </div>
        </div>
      )}
      {item?.boaVistaScore && (
        <div>
          <span className="text-xs text-gray-500">Boa Vista</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{item.boaVistaScore}</span>
            {item.boaVistaFaixa && (
              <Badge variant="outline" className="text-[10px]">{item.boaVistaFaixa}</Badge>
            )}
          </div>
        </div>
      )}
      {novoSerasa && (
        <div>
          <span className="text-xs text-gray-500">Serasa</span>
          <p className="text-2xl font-bold text-primary">{novoSerasa}</p>
        </div>
      )}
    </div>
  );
}
