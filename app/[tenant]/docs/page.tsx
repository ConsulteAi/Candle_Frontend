'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, Badge } from '@/design-system/ComponentsTailwind';
import {
  BookOpen,
  KeyRound,
  Send,
  Braces,
  Database,
  FileSearch,
  FileDown,
  ChevronRight,
} from 'lucide-react';

type FieldDoc = {
  name: string;
  type: string;
  description: string;
};

type BlockDoc = {
  name: string;
  description: string;
  fields: FieldDoc[];
};

type QueryTypeDoc = {
  code: string;
  title: string;
  input: string;
  summary: string;
  rootFields: FieldDoc[];
  blocks: BlockDoc[];
};

const sharedBlocks: Record<string, BlockDoc> = {
  person: {
    name: 'person',
    description: 'Dados cadastrais da pessoa consultada.',
    fields: [
      { name: 'name', type: 'string', description: 'Nome completo.' },
      { name: 'document', type: 'string', description: 'Documento consultado (normalmente CPF).' },
      { name: 'birthDate', type: 'string', description: 'Data de nascimento no formato retornado pela API.' },
      { name: 'revenueStatus', type: 'string | undefined', description: 'Situacao fiscal/cadastral.' },
      { name: 'status', type: 'string | undefined', description: 'Status alternativo em alguns tipos de consultas.' },
      { name: 'motherName', type: 'string | undefined', description: 'Nome da mae.' },
      { name: 'gender', type: 'string | undefined', description: 'Genero quando disponivel.' },
      { name: 'email', type: 'string | undefined', description: 'Email cadastral quando disponivel.' },
      { name: 'mainEconomicActivity', type: 'string | undefined', description: 'Atividade economica principal (somente em alguns tipos).' },
    ],
  },
  company: {
    name: 'company',
    description: 'Dados cadastrais da empresa consultada.',
    fields: [
      { name: 'cnpj', type: 'string', description: 'Documento da empresa.' },
      { name: 'socialReason', type: 'string', description: 'Razao social.' },
      { name: 'name', type: 'string | undefined', description: 'Nome da empresa em tipos que nao usam socialReason.' },
      { name: 'fantasyName', type: 'string | undefined', description: 'Nome fantasia.' },
      { name: 'foundationDate', type: 'string | undefined', description: 'Data de fundacao/abertura.' },
      { name: 'status', type: 'string | undefined', description: 'Situacao cadastral.' },
      { name: 'email', type: 'string | undefined', description: 'Email institucional quando disponivel.' },
      { name: 'phone', type: 'string | undefined', description: 'Telefone institucional quando disponivel.' },
    ],
  },
  score: {
    name: 'score',
    description: 'Bloco de score quando o tipo de consulta inclui pontuacao.',
    fields: [
      { name: 'value', type: 'string | number', description: 'Pontuacao numerica.' },
      { name: 'class', type: 'string | undefined', description: 'Faixa/classificacao de score.' },
      { name: 'riskText', type: 'string | undefined', description: 'Texto descritivo de risco.' },
      { name: 'risk', type: 'string | undefined', description: 'Texto de risco em tipos que nao usam riskText.' },
      { name: 'informant', type: 'string | undefined', description: 'Base informante (Bases I, II, III e IV).' },
      { name: 'probability', type: 'string | undefined', description: 'Probabilidade de inadimplencia (quando existir).' },
      { name: 'band', type: 'string | undefined', description: 'Faixa de score em consultas SCR.' },
    ],
  },
  alerts: {
    name: 'alerts[]',
    description: 'Lista de alertas da consulta.',
    fields: [
      { name: 'title', type: 'string', description: 'Titulo do alerta.' },
      { name: 'description', type: 'string', description: 'Descricao textual completa do alerta.' },
    ],
  },
  debts: {
    name: 'debts[]',
    description: 'Lista de pendencias financeiras.',
    fields: [
      { name: 'value', type: 'string', description: 'Valor da pendencia.' },
      { name: 'contract', type: 'string', description: 'Contrato/referencia da pendencia.' },
      { name: 'origin', type: 'string', description: 'Origem/credor da pendencia.' },
      { name: 'date', type: 'string', description: 'Data da ocorrencia.' },
      { name: 'informant', type: 'string | undefined', description: 'Base informante (Bases I, II, III e IV).' },
    ],
  },
  protests: {
    name: 'protests[]',
    description: 'Lista de protestos.',
    fields: [
      { name: 'value', type: 'string', description: 'Valor do protesto.' },
      { name: 'date', type: 'string', description: 'Data do protesto.' },
      { name: 'origin', type: 'string | undefined', description: 'Origem/praca do protesto.' },
      { name: 'notary', type: 'string | undefined', description: 'Cartorio quando fornecido.' },
      { name: 'type', type: 'string | undefined', description: 'Tipo de protesto/apontamento quando fornecido.' },
    ],
  },
  syntheticProtests: {
    name: 'syntheticProtests[]',
    description: 'Protestos sinteticos enriquecidos.',
    fields: [
      { name: 'value', type: 'string', description: 'Valor do protesto.' },
      { name: 'date', type: 'string', description: 'Data do protesto.' },
      { name: 'cartorio', type: 'string', description: 'Nome do cartorio.' },
      { name: 'comarca', type: 'string', description: 'Comarca.' },
      { name: 'uf', type: 'string', description: 'Estado (UF).' },
      { name: 'credor', type: 'string', description: 'Credor do titulo.' },
      { name: 'cedente', type: 'string', description: 'Cedente do titulo.' },
      { name: 'anuencia', type: 'string | null', description: 'Data de anuencia/cancelamento, quando existir.' },
    ],
  },
  badChecks: {
    name: 'badChecks[]',
    description: 'Ocorrencias de cheques sem fundos.',
    fields: [
      { name: 'bankNumber', type: 'string', description: 'Codigo do banco da ocorrencia.' },
      { name: 'quantity', type: 'string', description: 'Quantidade de ocorrencias.' },
      { name: 'lastOccurrence', type: 'string', description: 'Data da ultima ocorrencia.' },
      { name: 'returnReason', type: 'string | undefined', description: 'Motivo de devolucao (quando existir).' },
    ],
  },
  legalActions: {
    name: 'legalActions[]',
    description: 'Lista consolidada de acoes judiciais/restritivas.',
    fields: [
      { name: 'type', type: 'string', description: 'Tipo da acao.' },
      { name: 'quantity', type: 'string', description: 'Quantidade de itens do grupo.' },
      { name: 'value', type: 'string', description: 'Valor envolvido.' },
      { name: 'date', type: 'string', description: 'Data da acao.' },
      { name: 'origin', type: 'string', description: 'Origem/tribunal/fonte.' },
      { name: 'details', type: 'string', description: 'Detalhamento textual.' },
    ],
  },
  phones: {
    name: 'phones[]',
    description: 'Lista de telefones relacionados ao documento.',
    fields: [
      { name: 'areaCode', type: 'string', description: 'DDD.' },
      { name: 'number', type: 'string', description: 'Numero.' },
      { name: 'type', type: 'string', description: 'Tipo do telefone.' },
    ],
  },
  addresses: {
    name: 'addresses[]',
    description: 'Lista de enderecos relacionados ao documento.',
    fields: [
      { name: 'street', type: 'string', description: 'Logradouro.' },
      { name: 'number', type: 'string | undefined', description: 'Numero.' },
      { name: 'complement', type: 'string | undefined', description: 'Complemento.' },
      { name: 'district', type: 'string', description: 'Bairro.' },
      { name: 'city', type: 'string', description: 'Cidade.' },
      { name: 'state', type: 'string', description: 'Estado (UF).' },
      { name: 'zip', type: 'string', description: 'CEP.' },
      { name: 'type', type: 'string | undefined', description: 'Tipo de endereco.' },
      { name: 'source', type: 'string | undefined', description: 'Fonte do endereco.' },
    ],
  },
  queries: {
    name: 'queries[]',
    description: 'Historico de consultas comerciais no documento.',
    fields: [
      { name: 'date', type: 'string', description: 'Data da consulta.' },
      { name: 'entity', type: 'string', description: 'Entidade que consultou.' },
      { name: 'cityState', type: 'string | undefined', description: 'Cidade/UF da entidade.' },
    ],
  },
  partners: {
    name: 'partners[]',
    description: 'Quadro societario quando disponivel.',
    fields: [
      { name: 'name', type: 'string', description: 'Nome do socio.' },
      { name: 'role', type: 'string', description: 'Papel no quadro societario.' },
      { name: 'document', type: 'string', description: 'Documento do socio.' },
    ],
  },
  companyParticipations: {
    name: 'companyParticipations[]',
    description: 'Participacoes do consultado em empresas.',
    fields: [
      { name: 'cnpj', type: 'string', description: 'CNPJ da empresa relacionada.' },
      { name: 'socialReason', type: 'string', description: 'Razao social da empresa relacionada.' },
      { name: 'participation', type: 'string', description: 'Tipo/descricao da participacao.' },
    ],
  },
  financialSummary: {
    name: 'financialSummary',
    description: 'Resumo consolidado de totais financeiros.',
    fields: [
      { name: 'totalDebts', type: 'number', description: 'Total de pendencias.' },
      { name: 'totalProtests', type: 'number', description: 'Total de protestos.' },
      { name: 'totalQueries', type: 'number', description: 'Total de passagens/consultas comerciais.' },
      { name: 'totalCcf', type: 'number', description: 'Total de ocorrencias em CCF.' },
      { name: 'totalCadin', type: 'number', description: 'Total de ocorrencias em CADIN.' },
    ],
  },
  ccf: {
    name: 'ccf[]',
    description: 'Registros de cheques sem fundos por origem.',
    fields: [
      { name: 'quantity', type: 'string', description: 'Quantidade de ocorrencias.' },
      { name: 'date', type: 'string', description: 'Data da ocorrencia.' },
      { name: 'origin', type: 'string', description: 'Origem do registro (ex.: BACEN).' },
    ],
  },
  cadin: {
    name: 'cadin[]',
    description: 'Registros de inadimplencia em orgaos governamentais.',
    fields: [
      { name: 'value', type: 'string', description: 'Valor da ocorrencia.' },
      { name: 'literal', type: 'string', description: 'Descricao textual da ocorrencia.' },
      { name: 'date', type: 'string', description: 'Data da ocorrencia.' },
    ],
  },
  basicInfo: {
    name: 'basicInfo',
    description: 'Dados basicos da consulta de localizacao.',
    fields: [
      { name: 'name', type: 'string', description: 'Nome da pessoa/empresa.' },
      { name: 'document', type: 'string', description: 'Documento consultado.' },
      { name: 'birthDate', type: 'string', description: 'Data de nascimento/fundacao quando disponivel.' },
      { name: 'gender', type: 'string | undefined', description: 'Genero quando disponivel.' },
      { name: 'status', type: 'string | undefined', description: 'Status cadastral quando disponivel.' },
    ],
  },
  contact: {
    name: 'contact',
    description: 'Bloco de contatos agrupados por tipo.',
    fields: [
      { name: 'mainPhone', type: 'string', description: 'Telefone principal.' },
      { name: 'mobilePhones', type: 'string[]', description: 'Lista de celulares.' },
      { name: 'landlinePhones', type: 'string[]', description: 'Lista de fixos.' },
      { name: 'businessPhones', type: 'string[]', description: 'Lista de telefones comerciais.' },
      { name: 'emails', type: 'string[]', description: 'Lista de emails encontrados.' },
    ],
  },
  relations: {
    name: 'relations',
    description: 'Relacionamentos e vinculos encontrados.',
    fields: [
      { name: 'partners', type: 'Array<any>', description: 'Parceiros/socios relacionados.' },
      { name: 'relatives', type: 'Array<any>', description: 'Familiares relacionados.' },
      { name: 'neighbors', type: 'Array<any>', description: 'Vizinhos relacionados.' },
      { name: 'residents', type: 'Array<any>', description: 'Co-residentes relacionados.' },
    ],
  },
  scrScore: {
    name: 'score',
    description: 'Score especifico da consulta SCR.',
    fields: [
      { name: 'value', type: 'number', description: 'Pontuacao SCR.' },
      { name: 'band', type: 'string', description: 'Faixa do score.' },
    ],
  },
  creditSummary: {
    name: 'creditSummary',
    description: 'Resumo de exposicao de credito no SCR.',
    fields: [
      { name: 'creditToExpire', type: '{ description, value, percentage }', description: 'Credito a vencer.' },
      { name: 'expiredCredit', type: '{ description, value, percentage }', description: 'Credito vencido.' },
      { name: 'creditLimit', type: '{ description, value, percentage }', description: 'Limite de credito.' },
      { name: 'loss', type: '{ description, value, percentage }', description: 'Prejuizo.' },
    ],
  },
  operations: {
    name: 'operations[]',
    description: 'Operacoes detalhadas por modalidade no SCR.',
    fields: [
      { name: 'modalityCode', type: 'string', description: 'Codigo da modalidade.' },
      { name: 'modalityDescription', type: 'string', description: 'Descricao da modalidade.' },
      { name: 'subModalityCode', type: 'string', description: 'Codigo da submodalidade.' },
      { name: 'subModalityDescription', type: 'string', description: 'Descricao da submodalidade.' },
      { name: 'totalValue', type: 'number', description: 'Valor total na modalidade.' },
      { name: 'percentage', type: 'number', description: 'Percentual da modalidade no total.' },
      { name: 'maturities', type: 'Array<{ code, description, value, percentage, isRestrictive }>', description: 'Faixas de vencimento.' },
    ],
  },
};

const commonRoot: FieldDoc[] = [
  { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
  { name: 'totalDebts', type: 'number', description: 'Total de pendencias financeiras.' },
  { name: 'totalProtests', type: 'number', description: 'Total de protestos.' },
  { name: 'totalBadChecks', type: 'number', description: 'Total de cheques sem fundos, quando aplicavel.' },
];

const scrRoot: FieldDoc[] = [
  { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
  { name: 'document', type: 'string', description: 'Documento consultado.' },
  { name: 'documentType', type: 'string', description: 'Tipo do documento (fisica/juridica).' },
  { name: 'consultationDateTime', type: 'string', description: 'Data/hora da consulta.' },
  { name: 'databaseDate', type: 'string', description: 'Competencia da base SCR.' },
  { name: 'relationshipStartDate', type: 'string', description: 'Inicio de relacionamento bancario.' },
  { name: 'institutionsCount', type: 'number', description: 'Quantidade de instituicoes no SCR.' },
  { name: 'operationsCount', type: 'number', description: 'Quantidade total de operacoes.' },
  { name: 'hasRestrictions', type: 'boolean', description: 'Indica presenca de restricoes no SCR.' },
  { name: 'totalRestrictiveValue', type: 'number', description: 'Soma de valores restritivos.' },
];

function getBlocks(keys: string[]): BlockDoc[] {
  return keys.map((key) => sharedBlocks[key]);
}

const queryTypeDocs: QueryTypeDoc[] = [
  { code: 'MAX_BRASIL_AVANCADO_PF', title: 'MAX Brasil Avancado PF', input: 'CPF', summary: 'Consulta completa PF com score, restricoes e dados de contato/endereco.', rootFields: commonRoot, blocks: getBlocks(['person', 'score', 'alerts', 'debts', 'protests', 'badChecks', 'phones', 'addresses']) },
  { code: 'MAX_BRASIL_AVANCADO_PJ', title: 'MAX Brasil Avancado PJ', input: 'CNPJ', summary: 'Consulta completa PJ com score e quadro societario.', rootFields: commonRoot, blocks: getBlocks(['company', 'partners', 'score', 'alerts', 'debts', 'protests', 'badChecks', 'phones', 'addresses']) },
  { code: 'REALTIME_PREMIUM_SCORE_PF', title: 'Realtime Premium Score PF', input: 'CPF', summary: 'Versao realtime PF com campo adicional de probabilidade.', rootFields: commonRoot, blocks: getBlocks(['person', 'score', 'alerts', 'debts', 'protests', 'badChecks', 'phones', 'addresses']) },
  { code: 'REALTIME_PREMIUM_SCORE_PJ', title: 'Realtime Premium Score PJ', input: 'CNPJ', summary: 'Versao realtime PJ com score e socios.', rootFields: commonRoot, blocks: getBlocks(['company', 'partners', 'score', 'alerts', 'debts', 'protests', 'badChecks', 'phones', 'addresses']) },
  { code: 'BOA_VISTA_ACERTA_CPF', title: 'Boa Vista Acerta CPF', input: 'CPF', summary: 'Consulta PF com score (campo risk) e sem bloco de enderecos.', rootFields: commonRoot, blocks: getBlocks(['person', 'score', 'alerts', 'debts', 'protests', 'badChecks', 'phones']) },
  { code: 'QUOD_RESTRITIVO_ACOES_PF', title: 'Quod Restritivo Acoes PF', input: 'CPF', summary: 'Consulta PF focada em restricoes e acoes judiciais.', rootFields: [...commonRoot, { name: 'totalLegalActions', type: 'number', description: 'Total de acoes legais encontradas.' }], blocks: getBlocks(['person', 'alerts', 'debts', 'protests', 'badChecks', 'legalActions', 'phones', 'addresses']) },
  { code: 'QUOD_RESTRITIVO_ACOES_PJ', title: 'Quod Restritivo Acoes PJ', input: 'CNPJ', summary: 'Consulta PJ focada em restricoes, socios e acoes judiciais.', rootFields: [...commonRoot, { name: 'totalLegalActions', type: 'number', description: 'Total de acoes legais encontradas.' }], blocks: getBlocks(['company', 'partners', 'alerts', 'debts', 'protests', 'badChecks', 'legalActions', 'phones', 'addresses']) },
  { code: 'BVS_BASICA_PF', title: 'BVS Basica PF', input: 'CPF', summary: 'Consulta basica PF; retorna address (objeto unico), nao addresses[].', rootFields: commonRoot, blocks: [...getBlocks(['person', 'alerts', 'debts', 'protests']), { name: 'address', description: 'Endereco unico da consulta.', fields: sharedBlocks.addresses.fields }] },
  { code: 'BVS_BASICA_PJ', title: 'BVS Basica PJ', input: 'CNPJ', summary: 'Consulta basica PJ com address unico e badChecks.', rootFields: commonRoot, blocks: [...getBlocks(['company', 'alerts', 'debts', 'protests', 'badChecks']), { name: 'address', description: 'Endereco unico da consulta.', fields: sharedBlocks.addresses.fields }] },
  { code: 'PROTESTO_NACIONAL', title: 'Protesto Nacional', input: 'CPF/CNPJ', summary: 'Consulta dedicada exclusivamente a protestos.', rootFields: [
    { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
    { name: 'product', type: 'string', description: 'Nome do produto da consulta.' },
    { name: 'totalProtests', type: 'number', description: 'Total de protestos encontrados.' },
    { name: 'totalValue', type: 'string', description: 'Valor total dos protestos.' },
  ], blocks: [
    {
      name: 'protests[]',
      description: 'Detalhamento dos protestos nacionais.',
      fields: [
        { name: 'state', type: 'string', description: 'Estado da ocorrencia.' },
        { name: 'city', type: 'string', description: 'Cidade da ocorrencia.' },
        { name: 'notary', type: 'string', description: 'Cartorio.' },
        { name: 'date', type: 'string', description: 'Data do protesto.' },
        { name: 'value', type: 'string', description: 'Valor do protesto.' },
        { name: 'creditor', type: 'string', description: 'Credor.' },
        { name: 'assignor', type: 'string', description: 'Cedente.' },
        { name: 'address', type: 'string', description: 'Endereco do cartorio/registro.' },
        { name: 'phone', type: 'string', description: 'Telefone de contato.' },
      ],
    },
  ] },
  { code: 'SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF', title: 'Serasa Crednet Pefin Protesto SPC PF', input: 'CPF', summary: 'Consulta PF com participacoes empresariais.', rootFields: commonRoot, blocks: getBlocks(['person', 'alerts', 'debts', 'protests', 'badChecks', 'companyParticipations']) },
  { code: 'REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF', title: 'Realtime MAX SPC Serasa BVS Protesto PF', input: 'CPF', summary: 'Consulta PF com bloco de syntheticProtests.', rootFields: commonRoot, blocks: getBlocks(['person', 'alerts', 'debts', 'syntheticProtests', 'protests', 'badChecks']) },
  { code: 'REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ', title: 'Realtime MAX SPC Serasa BVS Protesto PJ', input: 'CNPJ', summary: 'Consulta PJ com bloco de syntheticProtests.', rootFields: commonRoot, blocks: getBlocks(['company', 'alerts', 'debts', 'syntheticProtests', 'protests', 'badChecks']) },
  { code: 'MAX_BRASIL_SCORE_BVS_BASICA_PF', title: 'MAX Brasil Score BVS Basica PF', input: 'CPF', summary: 'Consulta PF sem score, com restricoes basicas completas.', rootFields: commonRoot, blocks: getBlocks(['person', 'alerts', 'debts', 'protests', 'badChecks']) },
  { code: 'MAX_BRASIL_SCORE_BVS_BASICA_PJ', title: 'MAX Brasil Score BVS Basica PJ', input: 'CNPJ', summary: 'Consulta PJ sem score; campo protests[].type e relevante.', rootFields: commonRoot, blocks: getBlocks(['company', 'alerts', 'debts', 'protests', 'badChecks']) },
  { code: 'RAIO_X_CREDITO_RATING_SCR_PF', title: 'Raio X Credito Rating SCR PF', input: 'CPF', summary: 'Consulta SCR detalhada para pessoa fisica.', rootFields: scrRoot, blocks: getBlocks(['scrScore', 'creditSummary', 'operations']) },
  { code: 'RAIO_X_CREDITO_RATING_SCR_PJ', title: 'Raio X Credito Rating SCR PJ', input: 'CNPJ', summary: 'Consulta SCR detalhada para pessoa juridica.', rootFields: scrRoot, blocks: getBlocks(['scrScore', 'creditSummary', 'operations']) },
  { code: 'LOCALIZA_CPF_CNPJ', title: 'Localiza CPF CNPJ', input: 'CPF/CNPJ', summary: 'Consulta de enriquecimento cadastral e relacional.', rootFields: [{ name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' }], blocks: getBlocks(['basicInfo', 'contact', 'addresses', 'relations']) },
  { code: 'SCR_BACEN_PREMIUM_SCORE', title: 'SCR Bacen Premium Score', input: 'CPF/CNPJ', summary: 'Consulta SCR padrao com score e operacoes.', rootFields: scrRoot, blocks: getBlocks(['scrScore', 'creditSummary', 'operations']) },
  { code: 'COMPLETA_PLUS_BVS_ACOES_CPF', title: 'Completa Plus BVS Acoes CPF', input: 'CPF', summary: 'Consulta CPF com dividas e passagens comerciais.', rootFields: [
    { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
    { name: 'totalDebts', type: 'number', description: 'Total de pendencias.' },
    { name: 'totalQueries', type: 'number', description: 'Total de passagens comerciais.' },
  ], blocks: getBlocks(['person', 'debts', 'queries']) },
  { code: 'COMPLETA_PLUS_BVS_ACOES_CNPJ', title: 'Completa Plus BVS Acoes CNPJ', input: 'CNPJ', summary: 'Consulta CNPJ com score, pendencias, protestos e passagens.', rootFields: [
    { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
    { name: 'totalDebts', type: 'number', description: 'Total de pendencias.' },
    { name: 'totalProtests', type: 'number', description: 'Total de protestos.' },
    { name: 'totalQueries', type: 'number', description: 'Total de passagens comerciais.' },
    { name: 'totalBadChecks', type: 'number', description: 'Total de cheques sem fundos.' },
  ], blocks: getBlocks(['company', 'score', 'debts', 'protests', 'queries', 'badChecks']) },
  { code: 'CREDIT_PREMIUM', title: 'Credit Premium', input: 'CPF/CNPJ', summary: 'Consulta mais completa: resumo financeiro, CADIN, CCF e historicos.', rootFields: [
    { name: 'protocol', type: 'string', description: 'Protocolo unico da consulta.' },
    { name: 'status', type: 'string', description: 'Status geral calculado da consulta.' },
  ], blocks: getBlocks(['person', 'financialSummary', 'debts', 'protests', 'queries', 'ccf', 'cadin']) },
];

const executeRequestExample = `curl -X POST \"https://{{ _baseURL }}/queries/execute\" \\
  -H \"Authorization: Bearer SEU_TOKEN\" \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"queryTypeCode\": \"REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF\",
    \"input\": \"12345678900\"
  }'`;

const executeResponseExample = `{
  \"queryId\": \"9c2f4d35-0a6c-4f47-9c15-bf9f5d73f80b\",
  \"result\": {
    \"protocol\": \"1022687\",
    \"totalDebts\": 3,
    \"totalProtests\": 1,
    \"totalBadChecks\": 1,
    \"person\": {
      \"name\": \"NOME EXEMPLO\",
      \"document\": \"12345678900\",
      \"birthDate\": \"22/07/1980\"
    },
    \"debts\": [],
    \"protests\": [],
    \"badChecks\": []
  },
  \"price\": 10.9
}`;

const queryByIdRequestExample = `curl -X GET \"https://{{ _baseURL }}/queries/9c2f4d35-0a6c-4f47-9c15-bf9f5d73f80b\" \\
  -H \"Authorization: Bearer SEU_TOKEN\"`;

const queryByIdResponseExample = `{
  \"query\": {
    \"id\": \"9c2f4d35-0a6c-4f47-9c15-bf9f5d73f80b\",
    \"input\": \"12345678900\",
    \"status\": \"SUCCESS\",
    \"price\": 10.9,
    \"queryType\": {
      \"code\": \"REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF\",
      \"name\": \"Realtime MAX SPC Serasa BVS Protesto PF\",
      \"category\": [\"PERSON\", \"CREDIT\"]
    },
    \"createdAt\": \"2026-03-29T16:22:44.000Z\",
    \"completedAt\": \"2026-03-29T16:22:46.000Z\"
  },
  \"result\": {
    \"protocol\": \"1022687\"
  }
}`;

const queryPdfRequestExample = `curl -X GET \"https://{{ _baseURL }}/queries/9c2f4d35-0a6c-4f47-9c15-bf9f5d73f80b/pdf\" \\
  -H \"Authorization: Bearer SEU_TOKEN\" \\
  --output consulta.pdf`;

const queryPdfResponseHeadersExample = `HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename=\"Consulta_REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF_NOME_2026-03-29.pdf\"
Content-Length: 123456`;

function getSampleInput(inputType: string): string {
  if (inputType === 'CPF') return '12345678900';
  if (inputType === 'CNPJ') return '12345678000199';
  return 'valor_de_entrada';
}

function getSampleValue(type: string, fieldName: string): unknown {
  const normalized = type.toLowerCase();
  const field = fieldName.toLowerCase();

  if (field === 'anuencia') return null;
  if (field.includes('date')) return '01/01/2026';
  if (field.includes('email')) return 'contato@empresa.com';
  if (field === 'document') return '12345678900';
  if (field === 'cnpj') return '12345678000199';
  if (field === 'protocol') return '1022687';

  if (normalized.includes('boolean')) return false;
  if (normalized.includes('number')) return 0;
  if (normalized.includes('array')) return [];
  if (normalized.includes('object')) return {};

  return `exemplo_${fieldName}`;
}

function buildBlockExample(block: BlockDoc): unknown {
  const item = block.fields.reduce<Record<string, unknown>>((acc, field) => {
    acc[field.name] = getSampleValue(field.type, field.name);
    return acc;
  }, {});

  if (block.name.endsWith('[]')) return [item];
  return item;
}

function buildSelectedResponseExample(doc: QueryTypeDoc): string {
  const resultPayload = doc.rootFields.reduce<Record<string, unknown>>((acc, field) => {
    acc[field.name] = getSampleValue(field.type, field.name);
    return acc;
  }, {});

  for (const block of doc.blocks) {
    const key = block.name.endsWith('[]') ? block.name.replace(/\[\]$/, '') : block.name;
    resultPayload[key] = buildBlockExample(block);
  }

  return JSON.stringify(
    {
      queryId: '9c2f4d35-0a6c-4f47-9c15-bf9f5d73f80b',
      result: resultPayload,
      price: 10.9,
    },
    null,
    2
  );
}

export default function DocsPage() {
  const [selectedCode, setSelectedCode] = useState<string>('MAX_BRASIL_AVANCADO_PF');
  const selectedDoc = useMemo(
    () => queryTypeDocs.find((q) => q.code === selectedCode) || queryTypeDocs[0],
    [selectedCode]
  );
  const selectedRequestExample = useMemo(
    () => `{
  "queryTypeCode": "${selectedDoc.code}",
  "input": "${getSampleInput(selectedDoc.input)}"
}`,
    [selectedDoc]
  );
  const selectedResponseExample = useMemo(
    () => buildSelectedResponseExample(selectedDoc),
    [selectedDoc]
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-10"
          >
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                Documentacao para Desenvolvedores
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
                API de Consultas - Guia de Integracao
              </h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Guia simples para integrar do zero: token, requisicao, resposta e o significado de cada campo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-gray-900">Token Bearer (obrigatorio)</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Em toda chamada da API, envie o token no header Authorization.
                </p>
                <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <pre className="text-xs leading-relaxed">Authorization: Bearer SEU_TOKEN</pre>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-gray-900">Como usar em 4 passos</h2>
                </div>
                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                  <li>Envie POST em /queries/execute com tipo de consulta e input.</li>
                  <li>Receba queryId, result e price.</li>
                  <li>Use GET /queries/:id para consultar novamente pelo queryId.</li>
                  <li>Use GET /queries/:id/pdf para baixar o PDF da consulta.</li>
                </ol>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Braces className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-bold text-gray-900">Endpoint principal: POST /queries/execute</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Este endpoint executa a consulta em tempo real. Voce envia o tipo de consulta e o documento de entrada, e recebe
                o <span className="font-mono">queryId</span>, o <span className="font-mono">result</span> e o valor cobrado em <span className="font-mono">price</span>.
              </p>
              <div className="rounded-xl border border-gray-200 p-4 bg-white mb-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">O que enviar</p>
                <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                  <li><span className="font-mono">Authorization: Bearer SEU_TOKEN</span> (obrigatorio)</li>
                  <li><span className="font-mono">Content-Type: application/json</span></li>
                  <li><span className="font-mono">queryTypeCode</span>: codigo do tipo de consulta (ex.: <span className="font-mono">CREDIT_PREMIUM</span>)</li>
                  <li><span className="font-mono">input</span>: valor de entrada conforme o tipo (CPF, CNPJ, etc.)</li>
                </ul>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Requisicao</h3>
              <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto mb-4">
                <pre className="text-xs leading-relaxed">{executeRequestExample}</pre>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Retorno</h3>
              <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                <pre className="text-xs leading-relaxed">{executeResponseExample}</pre>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-white mt-4">
                <p className="font-semibold text-gray-900 text-sm mb-2">Como interpretar o retorno</p>
                <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                  <li><span className="font-mono">queryId</span>: identificador unico para consultar depois por <span className="font-mono">GET /queries/:id</span>.</li>
                  <li><span className="font-mono">result</span>: dados completos da consulta (estrutura varia por tipo).</li>
                  <li><span className="font-mono">price</span>: valor cobrado na execucao.</li>
                </ul>
              </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileSearch className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-gray-900">Endpoint de consulta: GET /queries/:id</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Use este endpoint para recuperar os detalhes de uma consulta ja executada pelo <span className="font-mono">queryId</span>,
                  sem precisar executar novamente.
                </p>
                <div className="rounded-xl border border-gray-200 p-4 bg-white mb-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">O que enviar</p>
                  <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                    <li><span className="font-mono">GET /queries/:id</span> (substitua <span className="font-mono">:id</span> pelo <span className="font-mono">queryId</span>)</li>
                    <li><span className="font-mono">Authorization: Bearer SEU_TOKEN</span> (obrigatorio)</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Retornos comuns: 200 (sucesso), 404 (consulta nao encontrada).</p>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Requisicao</h3>
                <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto mb-4">
                  <pre className="text-xs leading-relaxed">{queryByIdRequestExample}</pre>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Retorno</h3>
                <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <pre className="text-xs leading-relaxed">{queryByIdResponseExample}</pre>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-white mt-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Como interpretar o retorno</p>
                  <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                    <li><span className="font-mono">query</span>: metadados da consulta (status, tipo, datas e preco).</li>
                    <li><span className="font-mono">result</span>: payload completo retornado pelo provedor.</li>
                    <li>Quando o status for <span className="font-mono">SUCCESS</span>, voce pode usar o mesmo <span className="font-mono">queryId</span> para baixar o PDF.</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileDown className="w-5 h-5 text-primary" />
                  <h2 className="font-display text-2xl font-bold text-gray-900">Endpoint de download: GET /queries/:id/pdf</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Use este endpoint para gerar e baixar o relatorio em PDF de uma consulta ja executada.
                </p>
                <div className="rounded-xl border border-gray-200 p-4 bg-white mb-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">O que enviar</p>
                  <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                    <li><span className="font-mono">GET /queries/:id/pdf</span> (substitua <span className="font-mono">:id</span> pelo <span className="font-mono">queryId</span>)</li>
                    <li><span className="font-mono">Authorization: Bearer SEU_TOKEN</span> (obrigatorio)</li>
                  </ul>
                  <p className="font-mono text-xs text-gray-700 mt-2">Response: application/pdf</p>
                  <p className="text-xs text-gray-500 mt-2">Retornos comuns: 200 (PDF gerado), 404 (consulta nao encontrada / sem resultado).</p>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Requisicao</h3>
                <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto mb-4">
                  <pre className="text-xs leading-relaxed">{queryPdfRequestExample}</pre>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exemplo de Headers de Resposta</h3>
                <div className="rounded-xl bg-gray-900 text-gray-100 p-4 overflow-x-auto">
                  <pre className="text-xs leading-relaxed">{queryPdfResponseHeadersExample}</pre>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-white mt-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Como interpretar a resposta</p>
                  <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                    <li><span className="font-mono">Content-Type: application/pdf</span> confirma o tipo do arquivo.</li>
                    <li><span className="font-mono">Content-Disposition</span> define o nome do arquivo para download.</li>
                    <li>Se retornar 404, valide se o <span className="font-mono">queryId</span> existe e se a consulta possui resultado.</li>
                  </ul>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h2 className="font-display text-2xl font-bold text-gray-900">Tipos Primitivos e Convencoes</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Campo <span className="font-mono">informant</span>: indica qual base originou o registro (Bases I, II, III e IV).
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { name: 'string', type: 'texto', description: 'Valor textual. Datas tambem podem vir como string.' },
                  { name: 'number', type: 'numero', description: 'Valor numerico (totais, score, contadores).' },
                  { name: 'boolean', type: 'verdadeiro/falso', description: 'Flags de estado (ex.: hasRestrictions).' },
                  { name: 'Array<T>', type: 'lista', description: 'Colecao de objetos do mesmo tipo.' },
                ].map((field) => (
                  <div key={field.name} className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-sm font-semibold text-gray-900">{field.name}</p>
                      <Badge variant="outline" size="sm">{field.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid lg:grid-cols-[320px,1fr] gap-6">
              <Card className="p-4 h-fit lg:sticky lg:top-28">
                <h2 className="font-display text-xl font-bold text-gray-900 mb-3">Tipos de Consultas</h2>
                <p className="text-xs text-gray-500 mb-4">
                  Selecione um tipo de consulta para ver request e response completos.
                </p>
                <div className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
                  {queryTypeDocs.map((qt) => {
                    const active = qt.code === selectedCode;
                    return (
                      <button
                        key={qt.code}
                        onClick={() => setSelectedCode(qt.code)}
                        className={`w-full text-left rounded-xl border px-3 py-2 transition-all ${
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 bg-white hover:border-primary/40 hover:bg-primary/5 text-gray-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono text-[11px] leading-tight break-all font-semibold">{qt.code}</p>
                          <ChevronRight className={`w-4 h-4 shrink-0 ${active ? 'text-primary' : 'text-gray-400'}`} />
                        </div>
                        <div className="mt-1">
                          <Badge size="sm" variant="info">{qt.input}</Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-gray-900">{selectedDoc.title}</h2>
                    <p className="font-mono text-xs text-gray-500 mt-1 break-all">{selectedDoc.code}</p>
                  </div>
                  <Badge variant="info">Input: {selectedDoc.input}</Badge>
                </div>

                <p className="text-gray-700 mb-6">{selectedDoc.summary}</p>

                <section className="mb-8">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Exemplo de Request deste tipo de consulta</h3>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white space-y-2">
                    <p className="font-mono text-sm text-gray-900">POST /queries/execute</p>
                    <p className="font-mono text-sm text-gray-900">Authorization: Bearer SEU_TOKEN</p>
                    <p className="font-mono text-sm text-gray-900">Content-Type: application/json</p>
                    <div className="rounded-lg bg-gray-900 text-gray-100 p-3 overflow-x-auto">
                      <pre className="text-xs leading-relaxed">{selectedRequestExample}</pre>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Exemplo de Response deste tipo de consulta</h3>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="rounded-lg bg-gray-900 text-gray-100 p-3 overflow-x-auto">
                      <pre className="text-xs leading-relaxed">{selectedResponseExample}</pre>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Response - Campos Raiz</h3>
                  <div className="space-y-3">
                    {selectedDoc.rootFields.map((field) => (
                      <div key={field.name} className="rounded-xl border border-gray-200 p-4 bg-white">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-mono text-sm font-semibold text-gray-900">{field.name}</p>
                          <Badge variant="outline" size="sm">{field.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{field.description}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Response - Blocos de Retorno</h3>
                  <div className="space-y-4">
                    {selectedDoc.blocks.map((block) => (
                      <div key={block.name} className="rounded-xl border border-gray-200 p-4 bg-white">
                        <p className="font-mono text-sm font-bold text-gray-900">{block.name}</p>
                        <p className="text-sm text-gray-600 mt-1 mb-3">{block.description}</p>
                        <div className="space-y-2">
                          {block.fields.map((field) => (
                            <div key={`${block.name}-${field.name}`} className="rounded-lg border border-gray-100 p-3 bg-gray-50/70">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-mono text-xs font-semibold text-gray-900">{field.name}</p>
                                <Badge variant="outline" size="sm">{field.type}</Badge>
                              </div>
                              <p className="text-xs text-gray-700">{field.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
