# AGENTS.md

Guia para agentes que trabalham no **Candle_Frontend**: aplicação Next.js 16 (App Router,
React 18, TypeScript strict, Tailwind + shadcn/ui) que serve o produto **ConsultaAi/Candle**
em modelo **white label multi-tenant**.

O backend é uma API NestJS separada (repositório `Candle_Backend`). Este repositório contém
**apenas o frontend** e um BFF fino em Route Handlers.

---

## Ambiente de desenvolvimento

- O gerenciador de pacotes é **pnpm** (`"packageManager": "pnpm@11.5.1"`, `pnpm-lock.yaml`).
  **Nunca** use `npm` ou `yarn` — isso gera lockfile conflitante e quebra o build na Vercel.
- Instalar dependências: `pnpm install`.
- Subir o dev server: `pnpm dev` (Next.js em `http://localhost:3000`).
- Copie `.env.example` para `.env.local` antes de rodar:
  - `NEXT_PUBLIC_BASE_API_URL` — URL da API NestJS. Padrão local: `http://localhost:4000`.
    Precisa do prefixo `NEXT_PUBLIC_` porque é lido também no browser
    (ver `src/lib/env.ts`). Também alimenta o `connect-src` do CSP em `next.config.ts`.
  - `TENANTS_CONFIG` — JSON minificado com array de `TenantConfig`. **Atenção:** hoje
    nenhum código lê essa variável; a configuração de tenant vem da API
    (`GET /public/tenants/ui-config`) via `src/lib/tenant/config.ts`. A variável permanece
    em `.env.example` como legado/fallback documental. Não escreva código novo assumindo
    que ela existe sem antes implementar a leitura.
- **O backend precisa estar rodando em `localhost:4000`.** Sem ele, a resolução de tenant
  cai no `DEFAULT_TENANT`, e login, consultas, saldo e backoffice não funcionam.

## Verificação antes de abrir PR

Os **únicos** scripts declarados em `package.json` são `dev`, `build`, `start` e `lint`.

O gate real, confirmado rodando neste repositório:

```bash
npx tsc --noEmit   # type-check — passa limpo hoje (exit 0)
pnpm build         # next build — passa hoje (exit 0)
```

Rode os dois antes de abrir PR. `pnpm build` é o que mais se aproxima do CI da Vercel.

Estado conhecido das ferramentas de lint (verificado):

- **`pnpm lint` está quebrado.** O script é `next lint`, comando **removido no Next.js 16**;
  o CLI interpreta `lint` como diretório e falha com
  `Invalid project directory provided, no such directory: .../lint`.
- **`npx eslint .` também falha** hoje: `eslint.config.mjs` usa `FlatCompat` com
  `next/core-web-vitals` + `next/typescript` e estoura
  `TypeError: Converting circular structure to JSON` no `@eslint/eslintrc`.
- Ou seja: **não há lint funcional no momento**. Não afirme em PR que "o lint passou".
  Corrigir isso (migrar para `eslint-config-next` flat config e trocar o script por
  `eslint .`) é uma tarefa válida e bem-vinda, mas separada.

**Não existe suíte de testes automatizados neste repositório** — não há Jest, Vitest,
Playwright, nem arquivos `*.test.*` / `*.spec.*`. Não invente comandos de teste e não
escreva "testes passando" na descrição do PR. Validação de comportamento é manual:
`pnpm dev` com o backend em `localhost:4000` e verificação no navegador.

## Mapa do repositório

### `app/` — App Router

- `app/[tenant]/` — **todas as rotas do produto**, segmentadas por tenant. O segmento
  `[tenant]` nunca aparece na URL pública: o `proxy.ts` faz rewrite de `/rota` para
  `/{tenantId}/rota`. Contém:
  - `(auth)/` — `login`, `register`, `reset-password` (layout próprio).
  - `consulta/`, `consulta/[code]/` — execução e resultado de consultas.
  - `historico/`, `carteira/`, `recarregar/[transaction]/` — área do usuário.
  - `backoffice/` — painel admin (`users`, `providers`, `query-types`, `queries`,
    `tenants`, `transactions`, `api-tokens`, `audit`, `ui-settings`), com
    `_components/` privados do dashboard.
  - `docs/`, `sobre/`, `termos/`, `politica-de-privacidade/` — páginas institucionais.
  - `layout.tsx`, `providers.tsx` — providers globais e tema por tenant.
- `app/api/bff/[...path]/route.ts` — **BFF proxy** para a API Nest. Repassa a requisição
  usando os tokens guardados em **cookies `httpOnly`** (`accessToken` / `refreshToken`),
  que nunca chegam ao JavaScript do cliente. Possui um **allowlist explícito de rotas e
  métodos** (`allowedRoutes`) e valida CSRF em métodos mutantes. Ao consumir um endpoint
  novo do backend pelo BFF, é obrigatório adicionar o par pattern+método nesse allowlist,
  senão a chamada é bloqueada.
- `app/api/pdf-proxy/route.ts` — proxy simples (Edge Runtime) para baixar PDFs de
  consulta contornando CORS e o timeout curto de função serverless.
- `app/actions/tenant.ts` — Server Action de tenant (ex.: revalidação da tag
  `tenant-config`).
- `app/globals.css` — estilos globais e variáveis CSS do tema (shadcn).

### `proxy.ts` (middleware do Next)

Roda antes de toda requisição de página e faz três coisas:

1. **Resolução de tenant por hostname** — `getTenantByHost(host)` consulta a API.
2. **Guarda de rota** — rotas não públicas (`src/lib/auth/routes.ts`) sem `accessToken`
   nem `refreshToken` são redirecionadas para `/login?redirect=...`.
3. **Cookie CSRF** — emite `csrfToken` (não-httpOnly, para o cliente ecoar no header)
   quando ausente; o BFF valida esse token nos métodos mutantes.

O `matcher` exclui `api`, `_next/*` e arquivos estáticos.

### `src/`

- `src/services/` — cliente HTTP por domínio da API (`auth`, `query`, `query-types`,
  `query-execution`, `admin`, `audit`, `balance`, `credit`, `payment`, `api-tokens`).
  É a camada que fala com o backend; componentes não devem chamar `fetch`/`axios` direto.
- `src/actions/` — Server Actions que envolvem os services (autenticação, consultas,
  admin, pagamentos).
- `src/lib/` — infraestrutura:
  - `api/` — `httpClient` (browser, injeta CSRF), `serverHttpClient` (server, lê cookies
    httpOnly), `client.ts`, `errors.ts`.
  - `auth/` — `routes.ts` (rotas públicas) e helpers de sessão.
  - `tenant/config.ts` — `TenantConfig`, `DEFAULT_TENANT`, `getTenantByHost`,
    `getTenantById`; busca `/public/tenants/ui-config` com cache tag `tenant-config`.
  - `consultas/` — Strategy Pattern para regras de crédito por tipo de consulta
    (`strategies/`, `factories/`, `services/`).
  - `env.ts`, `formatters.ts`, `download.ts`, `utils.ts`, `hooks/`.
- `src/components/` — componentes React por domínio: `ui/` (shadcn), `admin/`, `auth/`,
  `query/` (inclui `strategies/` de renderização por tipo de consulta), `payment/`,
  `home/`, `layout/` (Header, Sidebar, TopBar, Footer, `TenantThemeProvider`), `shared/`.
- `src/store/authStore.ts` — store Zustand com persist: usuário, saldo e flags de
  hidratação. Não guarda tokens (ficam nos cookies httpOnly).
- `src/hooks/` — hooks de dados (SWR/React Query) e UI.
- `src/types/`, `src/validators/` (schemas Zod), `src/constants/`, `src/assets/`.

### `design-system/`

Camada visual própria, anterior/paralela ao shadcn, importada via alias
`@/design-system/*`: `ComponentsTailwind.tsx` (Button, Card, Badge, StatsCard, Input,
ConsultationCard…), `LoginPageTailwind.tsx`, `globals.css` e
`tailwind.config.candle.js`. Muitas páginas e strategies dependem dela — ao mexer nesses
componentes, verifique os consumidores antes.

### Configuração

- `next.config.ts` — headers de segurança e **CSP** montado dinamicamente (libera
  `vercel.live` só em dev/preview, adiciona o origin de `NEXT_PUBLIC_BASE_API_URL` no
  `connect-src`), HSTS em produção, source maps em preview.
- `tsconfig.json` — strict, aliases `@/*` → `src/*` e `@/design-system/*` →
  `design-system/*`.
- `components.json` — config do shadcn/ui (RSC, base color slate, CSS variables).
- `.context/` — documentação e playbooks internos: `.context/docs/README.md`,
  `.context/agents/README.md`, além de `plans/`, `skills/`, `workflow/`.
- `docs/` — notas técnicas pontuais (white label, mapeamento de query types, realtime).

## Arquitetura white label

- Um único deploy serve todos os tenants. O tenant é resolvido **pelo hostname** da
  requisição, no `proxy.ts`, via `getTenantByHost()`.
- `getTenantByHost` chama `GET {NEXT_PUBLIC_BASE_API_URL}/public/tenants/ui-config`
  enviando o header `x-tenant-domain` com o host original; a resposta é cacheada com a
  tag `tenant-config` e invalidada quando o admin salva as configurações de UI.
- O resultado é um `TenantConfig` (`id`/slug, `domain`, `name`, `logoUrl`, `faviconUrl`,
  `contactEmail`, `whatsappSupportPhone`, `colors.primary`, `colors.primaryForeground`
  em HSL). Falhas caem em `DEFAULT_TENANT` (`candle` / ConsultaAi).
- O middleware reescreve a URL para `/{tenant.id}/...`, entrando na árvore
  `app/[tenant]/`; o tema e o logo são aplicados por `TenantThemeProvider`, que injeta as
  cores do tenant nas variáveis CSS.
- `TENANTS_CONFIG` no `.env.example` descreve o mesmo formato, mas **não é lida por
  nenhum código atual** — a fonte da verdade é o backend.
- Ao criar UI nova, nunca hardcode nome, logo ou cor de marca: use o `TenantConfig`.

## Convenções de PR

- **Conventional Commits** — ex.: `feat(backoffice): adiciona filtro de auditoria`,
  `fix(bff): libera rota de tenants no allowlist`.
- **Nunca adicione co-authors nem rodapés de atribuição nos commits** (nada de
  `Co-Authored-By:`, `Generated with…`, links de sessão). A mensagem termina no corpo.
- Branch de trabalho: **`dev`**. `main` é **produção** — não commite direto nela.
- CD na **Vercel**: push em `dev` gera deploy de **preview**; merge em `main` sobe
  **produção**.
- Na descrição do PR, informe o que foi validado de fato: `npx tsc --noEmit`, `pnpm build`
  e o teste manual no navegador. Não cite lint nem testes automatizados (não existem).
- Não altere `pnpm-lock.yaml` com npm/yarn. Não commite `.env.local`.
