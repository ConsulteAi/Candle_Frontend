# Mapeamento de Query Types — ponteiro

> Este arquivo **não** é mais uma cópia do guia. O documento canônico vive no backend:
>
> **[`Candle_Backend/docs/query-types-mapping.md`](../../Candle_Backend/docs/query-types-mapping.md)**

## Por que virou ponteiro

Existiam duas cópias do mesmo guia (frontend e backend) e elas divergiram. A cópia
que estava aqui documentava **22 estratégias** enquanto o backend já documentava
**33**, e não tinha, por exemplo, a nota sobre o campo `pdf` ser removido da
resposta pública por `sanitizeResponse`. Manter duas cópias garantia que o
frontend consumisse contrato errado, então a fonte única passou a ser o backend —
que é onde as estratégias e os DTOs realmente vivem.

## Onde está cada coisa no backend

| O que você procura | Onde |
| --- | --- |
| Guia campo a campo por `queryTypeCode` | `Candle_Backend/docs/query-types-mapping.md` |
| Estratégias de parsing | `Candle_Backend/src/modules/queries/strategies/*.strategy.ts` |
| DTOs de resposta por provider | `Candle_Backend/src/modules/queries/dto/providers/*.response.dto.ts` |
| DTOs compartilhados (`person`, `company`, `score`, …) | `Candle_Backend/src/modules/queries/dto/shared/index.ts` |
| Produtos compostos (Raio X / enrichments) | `Candle_Backend/docs/COMPOSITE_QUERIES.md` |
| Mapa de enrichments | `Candle_Backend/docs/enrichments-map.md` |
| Seções do PDF por query type | `Candle_Backend/docs/pdf-query-types-sections.md` |
| Guia de implementação de um novo query type | `Candle_Backend/docs/query-type-implementation-guide.md` |

## Regra

Ao adicionar ou alterar um query type, atualize **apenas** o doc do backend.
Se o frontend precisar de nota específica de renderização, escreva-a aqui como
complemento — nunca duplicando o contrato de campos.
