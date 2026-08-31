# Frontend Guide — Realtime MAX SPC + SERASA + BVS (4 produtos)

> **Destinatário:** Time de Frontend.
> **Objetivo:** Documentar campo a campo o JSON retornado pelas 4 consultas da família "Realtime MAX", com exemplos reais, lógica de status e sugestões de renderização para cada seção.

---

## Os 4 Produtos

| Query Type Code | Produto | Tipo Doc | Protesto Sintético? |
|---|---|---|---|
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF` | 95.10.1002 — Realtime MAX SPC + SERASA + BVS + Protesto | CPF | ✅ Sim |
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ` | 96.11.1002 — Realtime MAX SPC + SERASA + BVS + Protesto | CNPJ | ✅ Sim |
| `MAX_BRASIL_SCORE_BVS_BASICA_PF` | 441.10 — Realtime MAX SPC + SERASA + BVS | CPF | ❌ Não |
| `MAX_BRASIL_SCORE_BVS_BASICA_PJ` | 442.11 — Realtime MAX SPC + SERASA + BVS | CNPJ | ❌ Não |

**Score:** os produtos `+PROTESTO` (PF e PJ) **retornam** `score`. Os produtos `_BASICA_` (PF e PJ) **não** retornam Score de crédito.

---

## Estrutura Geral da Resposta

Todos os 4 produtos seguem o mesmo esqueleto. A única diferença estrutural é:
- Produtos CPF → têm `person`
- Produtos CNPJ → têm `company`
- Produtos `+PROTESTO` → têm `syntheticProtests` (array rico com dados de cartório)
- Produtos sem `+PROTESTO` → **não têm** `syntheticProtests`

---

## 1. Campos Raiz (todos os 4 produtos)

```json
{
  "protocol": "1022687",
  "totalDebts": 8,
  "totalProtests": 2,
  "totalBadChecks": 1,
  "person": { ... },       // CPF apenas
  "company": { ... },      // CNPJ apenas
  "alerts": [ ... ],
  "debts": [ ... ],
  "syntheticProtests": [ ... ],  // apenas produtos +PROTESTO
  "protests": [ ... ],
  "badChecks": [ ... ],
  "score": { ... },                // apenas produtos +PROTESTO
  "totalQueries": 4,               // apenas produtos +PROTESTO
  "queries": [ ... ],              // apenas produtos +PROTESTO
  "companyParticipations": [ ... ] // apenas +PROTESTO_PF
}
```

> **O campo `pdf` não existe na resposta da API.** O parser ainda o extrai e o valor
> fica persistido no banco/cache para uso interno (geração de PDF), mas
> `CreditParser.sanitizeResponse` remove `pdf`, `providerRaw` e `returnedDataFlags`
> antes do retorno ao cliente. O mesmo sanitize descarta dívidas com `nadaConsta`
> e remove as chaves internas `_base` / `base` / `nadaConsta` de cada dívida.

| Campo | Tipo | Descrição |
|---|---|---|
| `protocol` | `string` | Identificador único da consulta no bureau. Usar como chave de rastreio e exibir no relatório. |
| `totalDebts` | `number` | **Contador de dívidas.** Soma das ocorrências de Pefin + Refin + Vencidas **mescladas com** `RESTRICOES_FINANCEIRAS.OCORRENCIAS`. Usar para o badge de quantidade. |
| `totalProtests` | `number` | **Contador de protestos.** Soma de protestos analíticos e sintéticos. Usar para o badge. |
| `totalBadChecks` | `number` | **Contador de cheques sem fundos** (BACEN). Usar para o badge. |
| `score` | `objeto \| ausente` | **Apenas nos produtos `+PROTESTO`.** Campos: `value`, `class` (`CLASSIF_ABC` com fallback `CLASSE`), `riskText` (`RISCO` → `TEXTO` → `MENSAGEM`), `informant`. |
| `totalQueries` | `number \| ausente` | **Apenas nos produtos `+PROTESTO`.** Quantidade de consultas anteriores ao documento. |
| `queries` | `array \| ausente` | **Apenas nos produtos `+PROTESTO`.** Histórico de consultas ao documento. |
| `companyParticipations` | `array \| ausente` | **Apenas em `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF`.** Participações societárias do CPF. Não existe na variante PJ. |

### Lógica de Status (RESTRITO / REGULAR)

A API não retorna um campo `status` nesses produtos. O frontend deve derivar:

```js
const isRestricted = totalDebts > 0 || totalProtests > 0 || totalBadChecks > 0;
const statusLabel = isRestricted ? 'RESTRITO' : 'REGULAR';
const statusColor = isRestricted ? '#EF4444' : '#22C55E'; // vermelho / verde
```

---

## 2. Objeto `person` — Produtos CPF

Presente em `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF` e `MAX_BRASIL_SCORE_BVS_BASICA_PF`.

```json
{
  "person": {
    "name": "MARIA SILVA DOS SANTOS",
    "document": "123.456.789-00",
    "birthDate": "15/03/1985",
    "revenueStatus": "REGULAR",
    "motherName": "ANA SILVA DOS SANTOS",
    "gender": "F",
    "email": "maria.santos@email.com"
  }
}
```

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `name` | `string` | Raramente | Nome completo da pessoa. |
| `document` | `string` | Nunca | CPF consultado. Pode vir sem formatação ou com pontos/traço. |
| `birthDate` | `string` | Às vezes | Data de nascimento (DD/MM/YYYY). |
| `revenueStatus` | `string` | Às vezes | Situação na Receita Federal. Ex: `"REGULAR"`, `"SUSPENSA"`, `"CANCELADA"`, `"PENDENTE DE REGULARIZAÇÃO"`. |
| `motherName` | `string` | Às vezes | Nome da mãe biológica. |
| `gender` | `string` | Às vezes | `"M"` ou `"F"`. Pode vir como `""`. |
| `email` | `string` | Frequentemente | E-mail cadastral. Pode vir como `""`. Tratar string vazia como ausente. |

**UI sugerida:** Card de cabeçalho com nome em destaque, CPF formatado, badge colorido para `revenueStatus` (verde = REGULAR, amarelo = PENDENTE, vermelho = SUSPENSA/CANCELADA), dados secundários em grid 2-3 colunas.

---

## 3. Objeto `company` — Produtos CNPJ

Presente em `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ` e `MAX_BRASIL_SCORE_BVS_BASICA_PJ`.

```json
{
  "company": {
    "cnpj": "12.345.678/0001-90",
    "socialReason": "EMPRESA EXEMPLO COMÉRCIO LTDA",
    "fantasyName": "EXEMPLO STORE",
    "foundationDate": "10/05/2010",
    "status": "ATIVA"
  }
}
```

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `cnpj` | `string` | Nunca | CNPJ consultado. |
| `socialReason` | `string` | Raramente | Razão Social registrada na Receita. |
| `fantasyName` | `string` | Frequentemente | Nome Fantasia. Pode ser `""` ou `null` — exibir `socialReason` como fallback. |
| `foundationDate` | `string` | Às vezes | Data de fundação (DD/MM/YYYY). |
| `status` | `string` | Às vezes | Situação na Receita. Ex: `"ATIVA"`, `"INAPTA"`, `"BAIXADA"`, `"SUSPENSA"`. |

**Nota para o produto `MAX_BRASIL_SCORE_BVS_BASICA_PJ`:** `socialReason` vem do campo `NOME` da Receita Federal (não de `RAZAO_SOCIAL`). O conteúdo é equivalente, mas pode ter formatação ligeiramente diferente.

---

## 4. Array `alerts` — Todos os 4 produtos

Alertas informativos e restritivos retornados pelo bureau. Podem indicar fraude, renda estimada, vínculos, escolaridade, etc.

```json
{
  "alerts": [
    {
      "title": "ALERTA DE ÓBITO",
      "description": "CPF COM INDICATIVO DE ÓBITO NA BASE DA RECEITA FEDERAL"
    },
    {
      "title": "RENDA PRESUMIDA",
      "description": "RENDA ESTIMADA ENTRE R$ 1.000,00 E R$ 3.000,00"
    },
    {
      "title": "INFORMAÇÃO",
      "description": "NENHUMA PENDÊNCIA FINANCEIRA ENCONTRADA"
    }
  ]
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `title` | `string` | Categoria ou tipo do alerta. Ex: `"ALERTA DE ÓBITO"`, `"RENDA PRESUMIDA"`, `"INFORMAÇÃO"`. |
| `description` | `string` | Texto completo do alerta. Pode ser longo — truncar com "ver mais" se necessário. |

**Estados possíveis:**
- Array vazio `[]` → nenhum alerta. Ocultar a seção ou exibir "Sem alertas".
- Alertas negativos (óbito, fraude) → destacar visualmente em vermelho/laranja.
- Alertas informativos → destacar em azul/cinza.

**UI sugerida:** Lista de cards compactos. Agrupar por `title` quando houver múltiplos com o mesmo nome (ex: vários "INFORMAÇÃO"). Alertas com palavras como "ÓBITO", "FRAUDE", "BLOQUEIO" em destaque vermelho.

---

## 5. Array `debts` — Todos os 4 produtos

Pendências financeiras consolidadas (Pefin + Refin + Vencidas). O array pode ter dezenas ou centenas de itens.

```json
{
  "debts": [
    {
      "value": "1.250,00",
      "contract": "0009823741",
      "origin": "BANCO ITAU S.A",
      "date": "15/08/2023",
      "informant": "BASE I"
    },
    {
      "value": "450,00",
      "contract": "FT2024001234",
      "origin": "LOJAS RENNER S.A",
      "date": "03/01/2024",
      "informant": "BASE II"
    }
  ]
}
```

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `value` | `string` | Raramente | Valor da dívida em R$. Vem como string formatada (ex: `"1.250,00"`). Converter para `float` para somar. |
| `contract` | `string` | Às vezes | Número do contrato ou referência. Pode ser `""`. |
| `origin` | `string` | Raramente | Nome do credor original. Ex: banco, loja, financeira. |
| `date` | `string` | Às vezes | Data da ocorrência ou vencimento (DD/MM/YYYY). |
| `informant` | `string` | Às vezes | Base de dados que forneceu o dado. Ex: `"BASE I"`, `"BASE II"`, `"BASE III"`, `"BASE IV"`. Indica a sub-fonte do dado dentro do bureau. |

**Estados possíveis:**
- `totalDebts === 0` e `debts.length === 0` → sem dívidas. Exibir badge verde "Sem restrições financeiras".
- Array populado → exibir tabela paginada.

**UI sugerida:** Tabela com colunas Credor / Valor / Contrato / Data / Fonte. Ordenar por data (mais recente primeiro). Exibir `totalDebts` como badge de contagem no cabeçalho da seção. Mostrar soma total dos valores.

---

## 6. Array `syntheticProtests` — Apenas produtos `+PROTESTO`

> **Presente em:** `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF` e `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ`
> **Ausente em:** `MAX_BRASIL_SCORE_BVS_BASICA_PF` e `MAX_BRASIL_SCORE_BVS_BASICA_PJ`

Protestos sintéticos — versão enriquecida com dados completos do cartório, comarca e credores. São os protestos mais detalhados disponíveis.

```json
{
  "syntheticProtests": [
    {
      "value": "3.200,00",
      "date": "20/06/2023",
      "cartorio": "1º TABELIONATO DE PROTESTOS DE SÃO PAULO",
      "comarca": "SÃO PAULO",
      "uf": "SP",
      "credor": "BANCO BRADESCO S.A",
      "cedente": "EMPRESA ABC LTDA",
      "anuencia": null
    },
    {
      "value": "780,00",
      "date": "05/11/2022",
      "cartorio": "2º OFÍCIO DE PROTESTOS DE CAMPINAS",
      "comarca": "CAMPINAS",
      "uf": "SP",
      "credor": "FINANCEIRA XYZ",
      "cedente": "SERVIÇOS GERAIS ME",
      "anuencia": "12/01/2023"
    }
  ]
}
```

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `value` | `string` | Raramente | Valor protestado em R$. |
| `date` | `string` | Raramente | Data em que o título foi lavrado em cartório. |
| `cartorio` | `string` | Às vezes | Nome completo do cartório. Ex: `"1º TABELIONATO DE PROTESTOS DE SÃO PAULO"`. |
| `comarca` | `string` | Às vezes | Comarca onde o protesto foi registrado. |
| `uf` | `string` | Às vezes | Estado (2 letras). Ex: `"SP"`, `"RJ"`, `"MG"`. |
| `credor` | `string` | Às vezes | Quem detém o crédito protestado (banco ou empresa). |
| `cedente` | `string` | Às vezes | Quem cedeu o título ao credor (origem do débito). |
| `anuencia` | `string \| null` | Frequentemente | Data de anuência (quitação/cancelamento do protesto). Se não for `null`, o protesto foi cancelado. |

**Lógica de anuência:**
```js
const isActive = item.anuencia === null || item.anuencia === '';
// isActive = true → protesto ativo (exibir em vermelho)
// isActive = false → protesto cancelado/pago (exibir em cinza com "Cancelado")
```

**UI sugerida:** Cards individuais por protesto. Exibir UF como badge colorido. Destacar cartório e comarca. Se `anuencia` estiver preenchida, mostrar badge "Cancelado" e a data de cancelamento em verde.

---

## 7. Array `protests` — Todos os 4 produtos

Protestos analíticos — versão simplificada sem dados ricos de cartório. Complementam os `syntheticProtests` nos produtos `+PROTESTO`, ou são a única fonte de protestos nos produtos sem `+PROTESTO`.

```json
{
  "protests": [
    {
      "value": "1.500,00",
      "date": "10/09/2023",
      "origin": "SAO PAULO-SP",
      "notary": "3º CARTORIO DE PROTESTOS",
      "type": null
    }
  ]
}
```

**Variação por produto:**

| Produto | Campos presentes |
|---|---|
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF` (CPF) | `value`, `date`, `origin`, `notary` |
| `REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PJ` (CNPJ) | `value`, `date`, `origin`, `notary` |
| `MAX_BRASIL_SCORE_BVS_BASICA_PF` (CPF) | `value`, `date`, `origin`, `notary` |
| `MAX_BRASIL_SCORE_BVS_BASICA_PJ` (CNPJ) | `value`, `date`, `origin`, **`type`** *(sem `notary`)* |

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `value` | `string` | Raramente | Valor do protesto em R$. |
| `date` | `string` | Às vezes | Data do protesto. |
| `origin` | `string` | Às vezes | Praça ou origem. Ex: `"SAO PAULO-SP"`. |
| `notary` | `string` | Frequentemente | Nome do cartório. Pode ser `""`. CPF e PJ com `+PROTESTO`. |
| `type` | `string` | Frequentemente | Tipo da anotação. Presente apenas em `MAX_BRASIL_SCORE_BVS_BASICA_PJ`. |

**Estado possível:**
- `totalProtests === 0` → sem protestos. Badge verde "Sem protestos".
- Nos produtos `+PROTESTO`: pode haver sobreposição com `syntheticProtests` — ambos os arrays podem ter registros para o mesmo protesto, porém com detalhes diferentes. Exibir as duas seções separadas.

---

## 8. Array `badChecks` — Todos os 4 produtos

Cheques sem fundos registrados no BACEN (Banco Central).

```json
{
  "badChecks": [
    {
      "bankNumber": "341",
      "quantity": "3",
      "lastOccurrence": "15/04/2023"
    }
  ]
}
```

| Campo | Tipo | Pode ser vazio? | Descrição |
|---|---|---|---|
| `bankNumber` | `string` | Raramente | Código do banco onde os cheques foram devolvidos. Ex: `"341"` = Itaú, `"237"` = Bradesco. |
| `quantity` | `string` | Raramente | Quantidade de cheques devolvidos naquele banco. Vem como string — converter para `int` para exibir. |
| `lastOccurrence` | `string` | Às vezes | Data da última devolução naquele banco (DD/MM/YYYY). |

**Estado possível:**
- `totalBadChecks === 0` → sem ocorrências. Badge verde "Sem cheques sem fundos".
- Array vazio com `totalBadChecks > 0` → o total existe mas os detalhes não foram retornados. Exibir apenas o contador.

**UI sugerida:** Tabela simples com Banco / Quantidade / Última Ocorrência. Opcionalmente resolver o código do banco para nome (ex: 341 → "Itaú Unibanco"). Exibir `totalBadChecks` como badge no cabeçalho.

---

## 9. Diferenças entre os 4 produtos (resumo para o frontend)

| | `_PROTESTO_PF` | `_PROTESTO_PJ` | `_BASICA_PF` | `_BASICA_PJ` |
|---|---|---|---|---|
| Identificador do consultado | `person` | `company` | `person` | `company` |
| `alerts` | ✅ | ✅ | ✅ | ✅ |
| `debts` | ✅ | ✅ | ✅ | ✅ |
| `syntheticProtests` | ✅ (rico) | ✅ (rico) | ❌ | ❌ |
| `protests` | ✅ (com `notary`) | ✅ (com `notary`) | ✅ (com `notary`) | ✅ (com `type`) |
| `badChecks` | ✅ | ✅ | ✅ | ✅ |
| `score` | ✅ | ✅ | ❌ | ❌ |
| `totalQueries` / `queries` | ✅ | ✅ | ❌ | ❌ |
| `companyParticipations` | ✅ | ❌ | ❌ | ❌ |
| Campo de protesto analítico | `notary` | `notary` | `notary` | **`type`** |

---

## 10. Exemplos de Resposta Completa

### Produto CPF com Protesto (`REALTIME_MAX_SPC_SERASA_BVS_PROTESTO_PF`)

```json
{
  "protocol": "1022687",
  "totalDebts": 3,
  "totalProtests": 1,
  "totalBadChecks": 1,
  "person": {
    "name": "JOÃO CARLOS PEREIRA",
    "document": "123.456.789-00",
    "birthDate": "22/07/1980",
    "revenueStatus": "REGULAR",
    "motherName": "MARIA PEREIRA",
    "gender": "M",
    "email": "joao@email.com"
  },
  "alerts": [
    {
      "title": "RENDA PRESUMIDA",
      "description": "RENDA ESTIMADA ENTRE R$ 3.000,00 E R$ 5.000,00"
    }
  ],
  "debts": [
    {
      "value": "2.300,00",
      "contract": "CC20230912",
      "origin": "BANCO BRADESCO S.A",
      "date": "12/09/2023",
      "informant": "BASE I"
    },
    {
      "value": "890,50",
      "contract": "REF-4521",
      "origin": "FINANCEIRA FÁCIL CRÉDITO",
      "date": "05/01/2024",
      "informant": "BASE II"
    },
    {
      "value": "150,00",
      "contract": "",
      "origin": "CLARO S.A",
      "date": "30/11/2023",
      "informant": "BASE I"
    }
  ],
  "syntheticProtests": [
    {
      "value": "3.200,00",
      "date": "20/06/2023",
      "cartorio": "1º TABELIONATO DE PROTESTOS DE SÃO PAULO",
      "comarca": "SÃO PAULO",
      "uf": "SP",
      "credor": "BANCO BRADESCO S.A",
      "cedente": "EMPRESA ABC LTDA",
      "anuencia": null
    }
  ],
  "protests": [
    {
      "value": "3.200,00",
      "date": "20/06/2023",
      "origin": "SAO PAULO-SP",
      "notary": "1º TABELIONATO DE PROTESTOS",
      "type": null
    }
  ],
  "badChecks": [
    {
      "bankNumber": "341",
      "quantity": "2",
      "lastOccurrence": "15/04/2023"
    }
  ]
}
```

---

### Produto CNPJ sem Protesto (`MAX_BRASIL_SCORE_BVS_BASICA_PJ`)

```json
{
  "protocol": "2034891",
  "totalDebts": 0,
  "totalProtests": 0,
  "totalBadChecks": 0,
  "company": {
    "cnpj": "12.345.678/0001-90",
    "socialReason": "TECH SOLUTIONS COMÉRCIO LTDA",
    "fantasyName": "TECHSOL",
    "foundationDate": "15/03/2018",
    "status": "ATIVA"
  },
  "alerts": [
    {
      "title": "INFORMAÇÃO",
      "description": "NENHUMA PENDÊNCIA FINANCEIRA ENCONTRADA"
    }
  ],
  "debts": [],
  "protests": [],
  "badChecks": []
}
```

---

## 11. Tratamento de Campos Vazios

Todos os arrays podem vir vazios `[]`. Nunca vêm como `null`. A regra é:

```js
// Arrays: sempre presentes, podem ser []
if (data.debts.length === 0) → mostrar seção "Sem restrições"
if (data.syntheticProtests?.length === 0) → mostrar seção "Sem protestos"

// Strings: podem ser "" (string vazia) — tratar como ausente
const displayName = person.name || '—';
const displayEmail = person.email || 'Não informado';

// Totals: sempre são number (0 quando vazio)
const showRestrictedBadge = totalDebts > 0 || totalProtests > 0 || totalBadChecks > 0;
```

---

## 12. Ordem de Renderização Sugerida para a Tela

```
1. Cabeçalho da consulta (protocol, data/hora, tipo de consulta)
2. Badge de status global (RESTRITO / REGULAR)
3. Dados do consultado (person ou company)
4. Contadores resumo: [N Dívidas] [N Protestos] [N Cheques]
5. Alertas (se houver)
6. Dívidas Financeiras (tabela paginada)
7. Protestos Sintéticos (apenas +PROTESTO — cards com cartório)
8. Protestos Analíticos (tabela simples)
9. Cheques Sem Fundos
10. Rodapé com avisos legais
```

---

> Dúvidas sobre campos específicos ou variações não cobertas aqui: consultar `Candle_Backend/docs/query-types-mapping.md` (fonte única do contrato de campos) ou a camada de estratégias em `Candle_Backend/src/modules/queries/strategies/`.
