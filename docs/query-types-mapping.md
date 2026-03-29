# Guia Oficial da API de Consultas de Crédito

> **Propósito:** Este é o guia definitivo para desenvolvedores, integradores e IAs que consomem ou implementam a API de Consultas (`Candle_Backend`). Documenta campo a campo todas as **22 estratégias de consulta ativas**, os provedores reais de dados, as fontes brutas mapeadas e todas as peculiaridades de cada produto.

---

## 🏗️ Como a API Funciona

1. O cliente envia uma requisição identificando o `queryTypeCode` (Ex: `MAX_BRASIL_AVANCADO_PF`).
2. O sistema identifica o **Provider** associado (`BIGTECH`, `SOLLOS` ou `ICONSULTEI`).
3. A requisição é disparada em tempo real para os bureaus reais (Serasa, SPC, BVS, BACEN, etc.).
4. O JSON bruto — massivo e despadronizado entre provedores — passa pela camada `ResponseParserStrategy`.
5. A API devolve um **DTO Padronizado** pronto para consumo por telas de frontend e pelo módulo de geração de PDF.

**Onde vivem as estratégias:** `src/modules/queries/strategies/*.strategy.ts`
**Onde vivem os DTOs:** `src/modules/queries/dto/providers/*.response.dto.ts`
**DTOs compartilhados:** `src/modules/queries/dto/shared/index.ts`

---

## 📚 Dicionário de Objetos Comuns (Shared DTOs)

A maioria das respostas compartilha esses objetos base. Cada estratégia pode adicionar campos extras além do que está listado aqui.

### `person` — Dados de Pessoa Física (CPF)
- `name` *(string)*: Nome completo.
- `document` *(string)*: CPF consultado.
- `birthDate` *(string)*: Data de nascimento no formato retornado pelo bureau (geralmente DD/MM/YYYY).
- `revenueStatus` *(string)*: Status na Receita Federal. Ex: `"REGULAR"`, `"SUSPENSA"`, `"PENDENTE DE REGULARIZAÇÃO"`.
- `motherName` *(string)*: Nome da mãe biológica.
- `gender` *(string, opcional)*: Sexo. Ex: `"M"`, `"F"`.
- `email` *(string, opcional)*: E-mail cadastral encontrado no bureau.
- `mainEconomicActivity` *(string, opcional)*: Ocupação profissional principal. Presente apenas em `CREDIT_PREMIUM`.
- `status` *(string, opcional)*: Presente em algumas estratégias como duplicata de `revenueStatus`.

### `company` — Dados de Pessoa Jurídica (CNPJ)
- `cnpj` *(string)*: CNPJ consultado.
- `socialReason` *(string)*: Razão Social legal.
- `fantasyName` *(string, opcional)*: Nome Fantasia.
- `foundationDate` *(string, opcional)*: Data de abertura/fundação.
- `status` *(string, opcional)*: Situação perante a Receita Federal. Ex: `"ATIVA"`, `"INAPTA"`, `"BAIXADA"`.
- `email` *(string, opcional)*: E-mail institucional. Presente apenas em `COMPLETA_PLUS_BVS_ACOES_CNPJ`.
- `phone` *(string, opcional)*: Telefone institucional. Presente apenas em `COMPLETA_PLUS_BVS_ACOES_CNPJ`.
- `address` *(objeto, opcional)*: Endereço completo com `street`, `district`, `city`, `state`, `zip`. Presente apenas em `COMPLETA_PLUS_BVS_ACOES_CNPJ`.

### `score` — Pontuação de Crédito
> **Atenção:** os nomes de campo variam por estratégia. A tabela abaixo detalha por tipo.
- `value` *(string)*: Pontuação numérica bruta (0-1000, pode vir como string).
- `class` *(string)*: Classificação alfanumérica. Ex: `"A"`, `"B"`, `"C"`, `"D"`, `"E"`.
- `riskText` *(string)*: Texto descritivo de risco. Ex: `"DE CADA 100 PESSOAS NESTA FAIXA, 15 DEVEM INADIMPLIR"`. *(campo chamado `risk` no `BOA_VISTA_ACERTA_CPF`)*
- `informant` *(string)*: Fonte do score. Ex: `"SERASA"`, `"NOVO SCORE FISICA 6 MESES"`.
- `probability` *(string, opcional)*: Probabilidade de inadimplência. Presente **apenas** em `REALTIME_PREMIUM_SCORE_PF`.

### `debts` — Pendências Financeiras
Array de dívidas não pagas (Pefin, Refin e Vencidas consolidadas):
- `value` *(string)*: Valor da dívida em R$.
- `contract` *(string)*: Número do contrato ou referência interna.
- `origin` *(string)*: Credor original. Ex: `"BANCO ITAU S.A"`, `"LOJAS RENNER"`.
- `date` *(string)*: Data de vencimento ou ocorrência da dívida.
- `informant` *(string, opcional)*: Sub-bureau ou base que forneceu o dado. Ex: `"BASE I"`, `"BASE II"`. O valor pode ser qualquer base disponível (I a IV) conforme o provedor retornar.

### `protests` — Protestos em Cartório
Array de títulos levados a protesto público:
- `value` *(string)*: Valor protestado em R$.
- `date` *(string)*: Data do protesto.
- `origin` *(string)*: Praça ou origem do protesto. Ex: `"SAO PAULO-SP"`.
- `notary` *(string, opcional)*: Nome do cartório. Ex: `"1º CARTORIO DE PROTESTOS"`.
- `type` *(string, opcional)*: Tipo do apontamento. Presente em algumas estratégias PJ.

### `badChecks` — Cheques Sem Fundos
Array de ocorrências de devolução de cheques:
- `bankNumber` *(string)*: Número do banco emitente.
- `quantity` *(string)*: Quantidade de cheques devolvidos.
- `lastOccurrence` *(string)*: Data da ocorrência mais recente.
- `returnReason` *(string, opcional)*: Motivo da devolução. Presente **apenas** em `BVS_BASICA_PJ`.

### `queries` — Passagens Comerciais (Consultas Anteriores)
Histórico de empresas que consultaram o documento recentemente:
- `date` *(string)*: Data da consulta.
- `entity` *(string)*: Razão Social ou ramo de quem consultou. Ex: `"BANCO BRADESCO"`, `"COMÉRCIO VAREJISTA"`.
- `cityState` *(string, opcional)*: Localidade de onde a consulta foi feita.

### `addresses` — Endereços (array)
Lista de endereços encontrados:
- `street` *(string)*: Logradouro.
- `number` *(string, opcional)*: Número.
- `complement` *(string, opcional)*: Complemento.
- `district` *(string)*: Bairro.
- `city` *(string)*: Cidade.
- `state` *(string)*: UF (2 letras).
- `zip` *(string)*: CEP.
- `type` *(string, opcional)*: Tipo do endereço. Ex: `"RESIDENCIAL"`, `"COMERCIAL"`.
- `source` *(string, opcional)*: Fonte/bureau que registrou o endereço.

### `phones` — Telefones (array)
Lista de telefones encontrados:
- `areaCode` *(string)*: DDD.
- `number` *(string)*: Número.
- `type` *(string)*: Tipo. Ex: `"CELULAR"`, `"FIXO"`, `"COMERCIAL"`.

---

## 📑 1. Grupo BIGTECH (13 tipos de consulta)

> Provedor `BIGTECH` acessa bases Serasa, SPC, BVS (Boa Vista), Quod, BACEN e Receita Federal.
> O JSON bruto vem dentro de `CREDCADASTRAL` com seções como `DADOS_RECEITA_FEDERAL`, `PEND_FINANCEIRAS`, `PROTESTOS`, `SCORES`, etc.

---

### 1.1 `MAX_BRASIL_AVANCADO_PF`
Consulta densa de crédito PF com Score unificado. Retorna restrições financeiras completas, protestos, cheques sem fundos, telefones e endereços.

- **Provider:** `BIGTECH`
- **Documento:** CPF
- **Campos retornados:**
  - `protocol` *(string)*: Chave de rastreio da consulta.
  - `pdf` *(string)*: URL ou Base64 do PDF gerado pelo bureau (quando disponível).
  - `totalDebts` *(number)*: Soma de ocorrências em `PEND_FINANCEIRAS + PEND_REFIN + PEND_VENCIDAS`.
  - `totalProtests` *(number)*: Total de protestos em `PROTESTOS.QUANTIDADE_OCORRENCIA`.
  - `totalBadChecks` *(number)*: Total de cheques sem fundos em `CH_SEM_FUNDOS_BACEN.QUANTIDADE_OCORRENCIA`.
  - `person` *(objeto)*: Mapeado de `DADOS_RECEITA_FEDERAL`. Contém `name`, `document`, `birthDate`, `status` (= `SITUACAO_RECEITA`), `motherName`. *(Sem `gender` ou `email` nesta variante.)*
  - `score` *(objeto)*: Mapeado de `SCORES.OCORRENCIAS[0]`. Contém `value` (= `SCORE`), `class` (= `CLASSIF_ABC`), `riskText` (= `RISCO || MENSAGEM`), `informant` (= `INFORMANTE`).
  - `alerts` *(array)*: Alertas de `INFORMACOES_ALERTAS_RESTRICOES`. Cada item: `{ title, description }`.
  - `debts` *(array)*: Pendências consolidadas. Ver SharedDTO `debts`.
  - `protests` *(array)*: Protestos de `PROTESTOS.OCORRENCIAS`. Contém `value`, `date`, `origin`, `type`.
  - `badChecks` *(array)*: De `CH_SEM_FUNDOS_BACEN`. Contém `bankNumber`, `quantity`, `lastOccurrence`.
  - `phones` *(array)*: De `TELEFONE_FIXO`, `TELEFONE_CELULAR`, `OUTROS_TELEFONES`, `TELEFONES`.
  - `addresses` *(array)*: De `ENDERECOS`.

---

### 1.2 `MAX_BRASIL_AVANCADO_PJ`
Variante CNPJ do 1.1. Adiciona sócios, combina cheques BACEN + Varejo, e usa `INFORMACOES_DA_EMPRESA` em vez de `DADOS_RECEITA_FEDERAL` para dados da empresa.

- **Provider:** `BIGTECH`
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts` *(number)*
  - `totalProtests` *(number)*
  - `totalBadChecks` *(number)*: **Soma BACEN + Varejo** — `CH_SEM_FUNDOS_BACEN + CH_SEM_FUNDOS_VAREJO`.
  - `company` *(objeto)*: De `INFORMACOES_DA_EMPRESA`. Contém `cnpj`, `socialReason` (= `RAZAO_SOCIAL`), `fantasyName` (= `NOME_FANTASIA`), `foundationDate` (= `DATA_NASCIMENTO_FUNDACAO || DATA_FUNDACAO`), `status` (= `SITUACAO || SITUACAO_RECEITA`).
  - `partners` *(array)*: Sócios de `QUADRO_SOCIETARIO`. Cada item: `{ name, document, role }`.
  - `score` *(objeto)*: Mesmo formato do 1.1.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - `badChecks` *(array)*: Combina ocorrências de `CH_SEM_FUNDOS_BACEN` e `CH_SEM_FUNDOS_VAREJO` em um único array.
  - `phones` *(array)*: De `TELEFONE_COMERCIAL`, `OUTROS_TELEFONES`, `TELEFONES`.
  - `addresses` *(array)*

---

### 1.3 `REALTIME_PREMIUM_SCORE_PF`
Versão otimizada via canal Realtime do MAX BRASIL. Alta acurácia de score e SLA prioritário. Idêntico ao 1.1 mas com o campo `probability` no score.

- **Provider:** `BIGTECH`
- **Documento:** CPF
- **Campos retornados:** Idênticos ao `MAX_BRASIL_AVANCADO_PF` (1.1), com a seguinte diferença:
  - `score.probability` *(string)*: **Campo exclusivo desta estratégia.** Probabilidade de inadimplência nos próximos 6 meses, extraída de `SCORES.OCORRENCIAS[0].PROBABILIDADE`.
  - `score.class` tem fallback duplo: `CLASSIF_ABC || CLASSE`.
  - `person` inclui `gender` (= `SEXO`) e `email` nesta variante.

---

### 1.4 `REALTIME_PREMIUM_SCORE_PJ`
Variante CNPJ do 1.3. Mesma estrutura do `MAX_BRASIL_AVANCADO_PJ` (1.2) com o canal Realtime.

- **Provider:** `BIGTECH`
- **Documento:** CNPJ
- **Campos retornados:** Idênticos ao `MAX_BRASIL_AVANCADO_PJ` (1.2).

---

### 1.5 `BOA_VISTA_ACERTA_CPF`
Análise nativa BVS/SCPC focada em score e detecção sintética de dívidas. Não retorna endereços. Combina cheques BACEN + Varejo.

- **Provider:** `BIGTECH` (via Boa Vista)
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts` *(number)*
  - `totalProtests` *(number)*
  - `totalBadChecks` *(number)*: **Soma BACEN + Varejo**.
  - `person` *(objeto)*: Padrão PF com `name`, `document`, `birthDate`, `status`, `motherName`.
  - `score` *(objeto)*: Contém `value`, `class`, `informant`. **Atenção: usa `risk` (não `riskText`)** para o texto descritivo — campo = `SCORES.OCORRENCIAS[0].RISCO`.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - `phones` *(array)*: Apenas de `SOMENTE_TELEFONE` (lista simplificada).
  - **SEM `addresses`** — esta estratégia não retorna endereços.

---

### 1.6 `QUOD_RESTRITIVO_ACOES_PF`
Especializada na base Quod (governamental e bancária). Detecta processos trabalhistas, ações cíveis, falências e recuperações judiciais. Agrega todas as ações legais em um único array tipado.

- **Provider:** `BIGTECH` (Bureau: QUOD)
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `totalLegalActions` *(number)*: **Campo exclusivo.** Total agregado de todas as ações judiciais encontradas.
  - `person` *(objeto)*: Padrão PF.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - `badChecks` *(array)*
  - `legalActions` *(array)*: **Campo exclusivo.** Combina 5 fontes em um único array flat. Cada item: `{ type, quantity, value, date, origin, details }`. Tipos possíveis: `"ACAO CIVEL"` (de `ACOES_CIVEIS`), `"ACAO TRABALHISTA"` (de `ACOES_TRABALHISTAS`), `"ACAO JUDICIAL"` (de `ACOES_JUDICIAIS_COMPLETAS`), `"FALENCIA/RECUPERACAO"` (de `FALENCIAS_ACOES_RECUPERACOES` ou `FALENCIA_RECUPERACAO_JUDICIAL`).
  - `phones` *(array)*
  - `addresses` *(array)*

---

### 1.7 `QUOD_RESTRITIVO_ACOES_PJ`
Variante CNPJ do 1.6. Adiciona `partners` e usa `DADOS_RECEITA_FEDERAL` para dados da empresa (com campos diferentes do 1.2).

- **Provider:** `BIGTECH` (Bureau: QUOD)
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks`, `totalLegalActions` *(number)*
  - `company` *(objeto)*: De `DADOS_RECEITA_FEDERAL`. Contém `cnpj`, `socialReason` (= `RAZAO_SOCIAL || NOME`), `fantasyName`, `foundationDate` (= `DATA_NASCIMENTO_FUNDACAO || DATA_FUNDACAO`), `status` (= `SITUACAO || SITUACAO_RECEITA`).
  - `partners` *(array)*: Sócios de `QUADRO_SOCIETARIO`.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - `badChecks` *(array)*
  - `legalActions` *(array)*: Mesmo formato do 1.6.
  - `phones` *(array)*: De `TELEFONE_COMERCIAL`, `OUTROS_TELEFONES`, `TELEFONES`.
  - `addresses` *(array)*

---

### 1.8 `BVS_BASICA_PF`
Versão mínima/rápida BVS. Usada para responder "tem restrição (sim/não)?". **Sem Score, sem cheques, sem telefones. Retorna um único endereço (não array).**

- **Provider:** `BIGTECH` (Boa Vista Básica)
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests` *(number)*. **Sem `totalBadChecks`.**
  - `person` *(objeto)*: Padrão PF.
  - `address` *(objeto singular, não array)*: Endereço de `ENDERECO_CEP`. Contém `street` (= `ENDERECO`), `district` (= `BAIRRO`), `city` (= `CIDADE`), `state` (= `UF`), `zip` (= `CEP`).
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - **SEM `badChecks`, `phones`, `score`.**

---

### 1.9 `BVS_BASICA_PJ`
Variante CNPJ do 1.8. Adiciona `totalBadChecks` e `badChecks` com campo exclusivo `returnReason`.

- **Provider:** `BIGTECH` (Boa Vista Básica)
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `company` *(objeto)*: De `DADOS_RECEITA_FEDERAL`. Contém `cnpj`, `name` (= `NOME`), `status` (= `SITUACAO_RECEITA`), `foundationDate` (= `DATA_NASCIMENTO_FUNDACAO`). *(Nota: usa `name` em vez de `socialReason`.)*
  - `address` *(objeto singular, não array)*: Mesmo formato do 1.8.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*
  - `badChecks` *(array)*: Contém `bankNumber`, `quantity`, `lastOccurrence` e **`returnReason`** (= `MOTIVO_DEVOLUCAO`) — campo exclusivo desta estratégia.

---

### 1.10 `PROTESTO_NACIONAL`
Consulta dedicada ao IEPTB (Instituto de Estudos de Protestos de Títulos do Brasil). Retorna **exclusivamente** protestos em cartórios nacionais com validade ativa (não prescritos em 5 anos).

- **Provider:** `BIGTECH`
- **Documento:** CPF ou CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `product` *(string)*: Nome do produto retornado pelo bureau (`HEADER.INFORMACOES_RETORNO.PRODUTO`).
  - `totalProtests` *(number)*: De `PROTESTO_SINTETICO.QUANTIDADE_OCORRENCIA`.
  - `totalValue` *(string)*: Soma total dos valores protestados, de `PROTESTO_SINTETICO.VALOR_TOTAL`.
  - `protests` *(array)*: De `PROTESTO_SINTETICO.OCORRENCIAS`. Cada item: `{ state, city, notary, date, value, creditor, assignor, address, phone }`. O campo `notary` identifica precisamente o cartório físico (Ex: `"1º DE PROTESTO DE GUARULHOS"`).
  - **SEM `debts`, `badChecks`, `person`, `company`, `score`.**

---

### 1.11 `SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF`
Motor clássico Serasa/SPC para CPF. Extrai Pefin, Refin e protestos. Inclui participações em empresas — campo exclusivo desta estratégia.

- **Provider:** `BIGTECH` (Experian Serasa)
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `person` *(objeto)*: Padrão PF. `birthDate` usa fallback `DATA_NASCIMENTO_FUNDACAO || DATA_NASCIMENTO`. `status` usa `SITUACAO_RECEITA || SITUACAO`.
  - `alerts` *(array)*
  - `debts` *(array)*: Pefin + Refin + Vencidas consolidadas.
  - `protests` *(array)*: `date` usa `DATA || DATA_PROTESTO`, `origin` usa `ORIGEM || CARTORIO`.
  - `badChecks` *(array)*
  - `companyParticipations` *(array)*: **Campo exclusivo.** Participações societárias do CPF em empresas, de `PARTICIPACAO_EM_EMPRESAS.OCORRENCIAS`. Cada item: `{ cnpj, socialReason, participation }`.

---

### 1.12 `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF`
Consulta densa unificando SPC + SERASA + BVS + Protesto Nacional para CPF. Única estratégia a retornar **`syntheticProtests`** (protestos sintéticos com dados ricos de cartório).

- **Provider:** `BIGTECH`
- **Código Produto:** `95.10.1002`
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `person` *(objeto)*: Padrão PF com `name`, `document`, `birthDate`, `revenueStatus`, `motherName`, `gender`, `email`.
  - `alerts` *(array)*
  - `debts` *(array)*: Pefin + Refin + Vencidas. `informant` indica a base (I a IV).
  - `syntheticProtests` *(array)*: **Campo exclusivo (junto com PJ).** Protestos sintéticos enriquecidos de `PROTESTO_SINTETICO.OCORRENCIAS`. Cada item: `{ value, date, cartorio, comarca, uf, credor, cedente, anuencia }`.
  - `protests` *(array)*: Protestos analíticos de `PROTESTOS.OCORRENCIAS`. Contém `value`, `date`, `origin`, `notary`.
  - `badChecks` *(array)*: De `CH_SEM_FUNDOS_BACEN`.

---

### 1.13 `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ`
Variante CNPJ do 1.12. Mesma estrutura completa de restrições, syntheticProtests e protests, mas retorna `company` em vez de `person`.

- **Provider:** `BIGTECH`
- **Código Produto:** `96.11.1002`
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `company` *(objeto)*: De `DADOS_RECEITA_FEDERAL`. Contém `cnpj`, `socialReason`, `fantasyName`, `foundationDate`, `status`.
  - `alerts` *(array)*
  - `debts` *(array)*
  - `syntheticProtests` *(array)*: Mesmo formato do 1.12.
  - `protests` *(array)*: Contém `value`, `date`, `origin`, `notary`.
  - `badChecks` *(array)*

---

### 1.14 `MAX_BRASIL_SCORE_BVS_BASICA_PF`
Consulta MAX Brasil Score + BVS Básica para CPF. Restrições financeiras completas, protestos analíticos e cheques. **Sem Score. Sem Protestos Sintéticos.**

- **Provider:** `BIGTECH`
- **Código Produto:** `441.10`
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `person` *(objeto)*: De `DADOS_RECEITA_FEDERAL`. Contém `name`, `document`, `birthDate` (= `DATA_NASCIMENTO_FUNDACAO`), `revenueStatus` (= `SITUACAO_RECEITA`), `motherName`, `gender`, `email`.
  - `alerts` *(array)*: De `INFORMACOES_ALERTAS_RESTRICOES`.
  - `debts` *(array)*: De `PEND_FINANCEIRAS + PEND_REFIN + PEND_VENCIDAS`.
  - `protests` *(array)*: De `PROTESTOS.OCORRENCIAS`. Contém `value`, `date`, `origin`, `notary` (= `CARTORIO`).
  - `badChecks` *(array)*: De `CH_SEM_FUNDOS_BACEN`.

---

### 1.15 `MAX_BRASIL_SCORE_BVS_BASICA_PJ`
Variante CNPJ do 1.14. Usa `DADOS_RECEITA_FEDERAL` para dados da empresa. Campo `type` (= `TIPO_ANOTACAO`) nos protestos em vez de `notary`.

- **Provider:** `BIGTECH`
- **Código Produto:** `442.11`
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts`, `totalProtests`, `totalBadChecks` *(number)*
  - `company` *(objeto)*: De `DADOS_RECEITA_FEDERAL`. Contém `cnpj` (= documento consultado), `socialReason` (= `NOME`), `foundationDate` (= `DATA_NASCIMENTO_FUNDACAO`), `status` (= `SITUACAO_RECEITA`).
  - `alerts` *(array)*
  - `debts` *(array)*
  - `protests` *(array)*: Contém `value`, `date`, `origin`, **`type`** (= `TIPO_ANOTACAO`) — sem `notary`.
  - `badChecks` *(array)*: De `CH_SEM_FUNDOS_BACEN`.

---

### 1.16 `RAIO_X_CREDITO_RATING_SCR_PF`
Consulta SCR BACEN + Rating Avançado para CPF via BIGTECH (produto 284.548 / código interno 1521). Estrutura **idêntica ao `SCR_BACEN_PREMIUM_SCORE`**. Requer dívidas ativas acima de R$200 bancarizadas para retornar dados do SCR.

- **Provider:** `BIGTECH`
- **Código Produto:** `284.548` (produto interno `1521`)
- **Documento:** CPF
- **Campos retornados:** Ver seção 2.2 (`SCR_BACEN_PREMIUM_SCORE`) — estrutura 100% idêntica.

---

### 1.17 `RAIO_X_CREDITO_RATING_SCR_PJ`
Variante CNPJ do 1.16 (produto 284.549 / código interno 1522). Estrutura **idêntica ao `SCR_BACEN_PREMIUM_SCORE`**.

- **Provider:** `BIGTECH`
- **Código Produto:** `284.549` (produto interno `1522`)
- **Documento:** CNPJ
- **Campos retornados:** Ver seção 2.2 (`SCR_BACEN_PREMIUM_SCORE`) — estrutura 100% idêntica.

---

## 📍 2. Grupo SOLLOS (3 tipos de consulta)

> Provedor `SOLLOS` acessa localização, SCR Bacen, BVS e Serasa via suas próprias rotas de integração.
> O JSON bruto tem estrutura diferente do BIGTECH: usa `data.CREDCADASTRAL` para crédito, `data.RELATORIO_SCR` para SCR, e arrays de contatos/endereços próprios.

---

### 2.1 `LOCALIZA_CPF_CNPJ`
Consulta de enriquecimento cadastral focada em **localização e vínculos sociais**. Retorna telefones quentes, e-mails vivos e árvore genealógica social. **Não busca dívidas.**

- **Provider:** `SOLLOS`
- **Documento:** CPF ou CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `basicInfo` *(objeto)*: Dados biográficos base (data de nascimento, idade, signo, indicador de óbito).
  - `contact` *(objeto)*:
    - `mainPhone` *(string)*: Telefone com maior score de assertividade (o mais "quente").
    - `mobilePhones` *(array de string)*: Celulares com DDD.
    - `landlinePhones` *(array de string)*: Fixos residenciais com DDD.
    - `businessPhones` *(array de string)*: Fixos comerciais com DDD.
    - `emails` *(array de string)*: E-mails com verificação de MX record.
  - `addresses` *(array)*: Todos os endereços por onde o documento transitou. Ver SharedDTO `addresses` — inclui `type` (COMERCIAL/RESIDENCIAL).
  - `relations` *(objeto)*:
    - `partners` *(array)*: Sócios ou pessoas conectadas ao negócio — `{ name, document }`.
    - `relatives` *(array de string)*: Laços parentais (nomes).
    - `neighbors` *(array de string)*: Vizinhos no mesmo logradouro (nomes).
    - `residents` *(array de string)*: Codomiciliados no mesmo endereço (nomes).
  - **SEM `debts`, `protests`, `score`.**

---

### 2.2 `SCR_BACEN_PREMIUM_SCORE`
Relatório SCR direto do Banco Central do Brasil via SOLLOS. Exige dívidas bancarizadas acima de R$200. Retorna posição financeira bancária detalhada por modalidade, score de risco e resumo consolidado.

- **Provider:** `SOLLOS`
- **Documento:** CPF ou CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `document` *(string)*: CPF/CNPJ consultado (de `HEADER.PARAMETROS.CPFCNPJ`).
  - `documentType` *(string)*: Tipo do documento (`HEADER.RELATORIO_SCR.TIPO_DOCUMENTO`). Ex: `"FISICA"`, `"JURIDICA"`.
  - `consultationDateTime` *(string)*: Data e hora da consulta (`HEADER.INFORMACOES_RETORNO.DATA_HORA_CONSULTA`).
  - `databaseDate` *(string)*: Competência da base consultada. Ex: `"08/2022"`.
  - `relationshipStartDate` *(string)*: Data de início do relacionamento bancário. Ex: `"11/07/2012"`.
  - `institutionsCount` *(number)*: Quantidade de instituições financeiras com operações ativas.
  - `operationsCount` *(number)*: Quantidade total de operações registradas.
  - `score` *(objeto)*: Contém `value` *(number)* (pontuação bruta, Ex: `450`) e `band` *(string)* (faixa, Ex: `"REGULAR"`, `"BOM"`, `"OTIMO"`).
  - `creditSummary` *(objeto)*: Resumo consolidado das carteiras. Cada sub-campo é um **objeto** com `{ description, value, percentage }`:
    - `creditToExpire`: Crédito a vencer (dívidas ativas não vencidas). Descrição: `"Crédito a Vencer"`.
    - `expiredCredit`: Crédito vencido (em atraso). Descrição: `"Crédito Vencido"`.
    - `creditLimit`: Limites de crédito disponíveis (cartões, cheque especial). Descrição: `"Limite de Crédito"`.
    - `loss`: Prejuízo (baixado como perda irrecuperável no BACEN). Descrição: `"Prejuízo"`.
  - `operations` *(array)*: Detalhamento por modalidade. Cada item: `{ modalityCode, modalityDescription, subModalityCode, subModalityDescription, totalValue, percentage, maturities[] }`. O array `maturities` tem itens: `{ code, description, value, percentage, isRestrictive }`.
  - `hasRestrictions` *(boolean)*: `true` quando `expiredCredit.value + loss.value > 0`.
  - `totalRestrictiveValue` *(number)*: Soma de `expiredCredit.value + loss.value`.

---

### 2.3 `COMPLETA_PLUS_BVS_ACOES_CPF`
Extrator CPF com BVS + Serasa. Retorna dívidas financeiras consolidadas e passagens comerciais (histórico de consultas). Inclui dados vehiculares brutos em `veicular`.

- **Provider:** `SOLLOS`
- **Documento:** CPF
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts` *(number)*
  - `totalQueries` *(number)*: Total de passagens comerciais (= `PASSAGENS_COMERCIAIS.QUANTIDADE_OCORRENCIA`).
  - `person` *(objeto)*: Contém `name`, `document`, `birthDate`, `revenueStatus` (= `SITUACAO_RECEITA`), `motherName`, `gender` (= `SEXO`), `email`.
  - `debts` *(array)*: De `PEND_FINANCEIRAS + PEND_REFIN + PEND_VENCIDAS`.
  - `queries` *(array)*: Passagens comerciais de `PASSAGENS_COMERCIAIS`. Cada item: `{ date, entity, cityState }`.
  - `veicular` *(objeto)*: **Pass-through bruto** do bloco `VEICULAR` do JSON do provedor. Não é parseado — conteúdo varia.
  - **SEM `protests`, `badChecks`, `score`, `addresses`, `phones`.**

---

### 2.4 `COMPLETA_PLUS_BVS_ACOES_CNPJ`
Variante CNPJ do 2.3. Mais completo: adiciona `score`, `protests`, `badChecks` (BACEN + Varejo) e dados ricos de empresa incluindo email, telefone e endereço **dentro do objeto `company`**.

- **Provider:** `SOLLOS`
- **Documento:** CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `totalDebts` *(number)*
  - `totalProtests` *(number)*: De `PROTESTOS.QUANTIDADE_OCORRENCIA`.
  - `totalQueries` *(number)*: De `PASSAGENS_COMERCIAIS.QUANTIDADE_OCORRENCIA`.
  - `totalBadChecks` *(number)*: **Soma BACEN + Varejo** — `CH_SEM_FUNDOS_BACEN + CH_SEM_FUNDOS_VAREJO`.
  - `company` *(objeto enriquecido)*: Contém `cnpj` (com fallback para `input`), `socialReason` (= `RAZAO_SOCIAL`), `fantasyName`, `status` (= `SITUACAO`), `foundationDate` (= `DATA_FUNDACAO`), **`email`**, **`phone`** (= `TELEFONE`) e **`address`** (objeto com `street`, `district`, `city`, `state`, `zip`).
  - `score` *(objeto)*: Contém `value`, `class`, `riskText`, `informant`.
  - `debts` *(array)*
  - `protests` *(array)*: Usa `CARTORIO` como campo de cartório (mapeado para `notary`). Contém `value`, `date`, `origin`, `notary`.
  - `queries` *(array)*: Mapeia `DATA_CONSULTA`, `CLIENTE_CONSULTA`, `CIDADE_UF_CLIENTE`.
  - **SEM `veicular`** (diferente da variante CPF).

---

## 🏛️ 3. Grupo ICONSULTEI (1 tipo de consulta)

> Provedor `ICONSULTEI` é o mais premium disponível. Acessa CADIN (Governo Federal/PGFN/Receita), CCF (Cheques sem fundos BACEN e Varejo), passagens comerciais e dívidas completas.
> JSON bruto tem estrutura própria com `CREDCADASTRAL` e seções `CADIN`, `CH_SEM_FUNDOS_BACEN`, `CH_SEM_FUNDOS_VAREJO`.

---

### 3.1 `CREDIT_PREMIUM`
A consulta mais densa disponível no sistema. Combina pendências financeiras, protestos, passagens comerciais, cheques sem fundos (Bacen + Varejo separados) e **CADIN** (dívidas com o Governo Federal).

- **Provider:** `ICONSULTEI`
- **Documento:** CPF ou CNPJ
- **Campos retornados:**
  - `protocol`, `pdf` *(string)*
  - `status` *(string)*: **Campo computado.** `"RESTRICTED"` se `totalDebts > 0 || totalProtests > 0 || totalCcf > 0 || totalCadin > 0`, caso contrário `"CLEAR"`.
  - `person` *(objeto)*: O mais completo do sistema. Contém `name`, `document` (= `PARAMETROS.CPFCNPJ || input`), `birthDate`, `revenueStatus` (= `SITUACAO_RECEITA`), `motherName`, `gender` (= `SEXO`), `email`, e **`mainEconomicActivity`** (= `ATIVIDADE_ECONOMICA_PRINCIPAL`) — **exclusivo desta estratégia**.
  - `financialSummary` *(objeto)*: Totais agregados para cards de frontend:
    - `totalDebts` *(number)*: Soma de `PEND_FINANCEIRAS + PEND_REFIN + PEND_VENCIDAS`.
    - `totalProtests` *(number)*: Soma de `PROTESTO_SINTETICO + PROTESTOS`.
    - `totalQueries` *(number)*: De `PASSAGENS_COMERCIAIS.QUANTIDADE_OCORRENCIA`.
    - `totalCcf` *(number)*: **Soma BACEN + Varejo** — `CH_SEM_FUNDOS_BACEN + CH_SEM_FUNDOS_VAREJO`.
    - `totalCadin` *(number)*: De `CADIN.QUANTIDADE_OCORRENCIA || QUANTIDADE_OCORRENCIAS`.
  - `debts` *(array)*: De `PEND_FINANCEIRAS + PEND_REFIN + PEND_VENCIDAS`.
  - `protests` *(array)*: Combina `PROTESTO_SINTETICO` e `PROTESTOS`.
  - `queries` *(array)*: Passagens comerciais.
  - `ccf` *(array)*: **Lógica complexa.** Se BACEN tiver `OCORRENCIAS`: mapeia individualmente, prefixando itens BACEN com `"BACEN - {nome do banco}"`. Se tiver apenas contagem: cria um item de sumário. Idem para Varejo. Cada item final: `{ quantity, date, origin }`.
  - `cadin` *(array)*: **Campo exclusivo.** Dívidas ativas com o Governo Federal/PGFN/Receita, de `CADIN.OCORRENCIAS`. Cada item: `{ value, literal, date }`. `literal` é o descritivo narrativo do fato (Ex: `"DÍVIDA ATIVA DA UNIÃO"`).

---

## 📊 Tabela Resumo de Capacidades

| Query Type | Tipo Doc | Score | Debts | Protests | SyntheticProtests | BadChecks | LegalActions | CADIN | SCR | Phones | Addresses |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `MAX_BRASIL_AVANCADO_PF` | CPF | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `MAX_BRASIL_AVANCADO_PJ` | CNPJ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `REALTIME_PREMIUM_SCORE_PF` | CPF | ✅ (+prob) | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `REALTIME_PREMIUM_SCORE_PJ` | CNPJ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `BOA_VISTA_ACERTA_CPF` | CPF | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `QUOD_RESTRITIVO_ACOES_PF` | CPF | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `QUOD_RESTRITIVO_ACOES_PJ` | CNPJ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| `BVS_BASICA_PF` | CPF | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (único) |
| `BVS_BASICA_PJ` | CNPJ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (único) |
| `PROTESTO_NACIONAL` | CPF/CNPJ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF` | CPF | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF` | CPF | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ` | CNPJ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `MAX_BRASIL_SCORE_BVS_BASICA_PF` | CPF | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `MAX_BRASIL_SCORE_BVS_BASICA_PJ` | CNPJ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `RAIO_X_CREDITO_RATING_SCR_PF` | CPF | ✅ (SCR) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `RAIO_X_CREDITO_RATING_SCR_PJ` | CNPJ | ✅ (SCR) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `LOCALIZA_CPF_CNPJ` | CPF/CNPJ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| `SCR_BACEN_PREMIUM_SCORE` | CPF/CNPJ | ✅ (SCR) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `COMPLETA_PLUS_BVS_ACOES_CPF` | CPF | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `COMPLETA_PLUS_BVS_ACOES_CNPJ` | CNPJ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `CREDIT_PREMIUM` | CPF/CNPJ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## ⚠️ Armadilhas Conhecidas

1. **`badChecks` combina BACEN + Varejo** em `MAX_BRASIL_AVANCADO_PJ`, `BOA_VISTA_ACERTA_CPF`, `COMPLETA_PLUS_BVS_ACOES_CNPJ` e `CREDIT_PREMIUM`. No `CREDIT_PREMIUM`, BACEN e Varejo ficam separados em `ccf`, mas o total em `financialSummary.totalCcf` combina os dois.

2. **`address` vs `addresses`**: `BVS_BASICA_PF` e `BVS_BASICA_PJ` retornam `address` (objeto singular, de `ENDERECO_CEP`). Todas as demais estratégias retornam `addresses` (array).

3. **`score.risk` vs `score.riskText`**: `BOA_VISTA_ACERTA_CPF` usa o campo `risk`, não `riskText`. Mesma informação, nome diferente.

4. **`legalActions` é array flat, não objeto agrupado**: `QUOD_RESTRITIVO_ACOES_PF/PJ` retornam array com campo `type` discriminando a origem. O builder de PDF (`buildLegalActionsSection`) agrupa por tipo internamente.

5. **`company.name` vs `company.socialReason`**: `BVS_BASICA_PJ` usa `name` (não `socialReason`) dentro do objeto `company`.

6. **SCR requer mínimo R$200 em dívidas bancarizadas**: `SCR_BACEN_PREMIUM_SCORE`, `RAIO_X_CREDITO_RATING_SCR_PF` e `RAIO_X_CREDITO_RATING_SCR_PJ` retornam dados vazios/incompletos se o consultado não tiver operações ativas acima desse valor no SCR.

7. **`REALTIME_PREMIUM_SCORE_PF` é o único com `score.probability`**: Nenhuma outra estratégia expõe este campo.

8. **`SERASA_CREDNET_PEFIN_PROTESTO_SPC_PF` é o único com `companyParticipations`**: Participações societárias do CPF em empresas.

9. **`CREDIT_PREMIUM` é o único com `mainEconomicActivity` na `person`**: Campo `ATIVIDADE_ECONOMICA_PRINCIPAL` do ICONSULTEI.

10. **`COMPLETA_PLUS_BVS_ACOES_CPF` tem `veicular`**: Pass-through bruto do bloco vehicular — estrutura variável, não é parseado.

---

> Este documento é orgânico e deve ser atualizado conforme novas estratégias forem adicionadas em `src/modules/queries/strategies/`. Ao implementar uma nova estratégia, adicione a entrada correspondente neste guia e marque os campos exclusivos com **"Campo exclusivo"**.
