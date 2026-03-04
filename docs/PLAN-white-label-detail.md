# PLAN-white-label-detailed

## Fase 0: Preparação e Contexto
- **Objetivo:** Transformar o Candle Frontend (Next.js App Router) em uma plataforma White Label multi-tenant servida por um único deploy na Vercel (Abordagem 1).
- **Escopo:** Alterações puramente visuais (Nome da Marca, Cores Primárias/Secundárias, Logo e Favicon).
- **Fonte de Dados:** Variável de ambiente `.env` (JSON string) para agilidade no MVP.

## Fase 1: Arquitetura de Roteamento Dinâmico (app/[tenant])
Como a Vercel exige que um único servidor saiba renderizar o site de múltiplos clientes, precisaremos mapear a URL de acesso ao conteúdo correto.
1. **Criar a pasta raiz de tenant:** Mover todo o conteúdo atual da pasta `app/` (rotas `(auth)`, `(home)`, `dashboard`, `credito`, `consulta`, e o `layout.tsx` principal) para dentro de uma nova estrutura: `app/[tenant]/`.
2. **Exceções:** Arquivos estáticos e a pasta `api/` (se houver) permanecem fora do `[tenant]` para não quebrarem webhooks ou chamadas externas.

## Fase 2: Interceptação com Proxy
Criaremos um interceptador global para ler o domínio que o usuário está acessando e redirecionar invisivelmente para a pasta do respectivo tenant.
1. **Criar arquivo `proxy.ts` na raiz do projeto:**
   - O código irá ler o `request.headers.get('host')`.
   - Se o host for `cliente-a.com.br`, o proxy reescreve a requisição para a rota `/[tenant-a]/...`.
   - Incluir um *Matcher* no proxy para ignorar requisições para `_next/static`, arquivos da pasta `public` (como imagens, fontes), e requisições `.ico`/`.json`.

## Fase 3: Gestão da Configuração de Tenants (JSON no .env)
Precisamos de um local centralizado para buscar as configurações com base no ID injetado pelo Proxy.
1. **Adicionar no `.env` (exemplo):**
   ```env
   TENANTS_CONFIG='[{"id":"tenant-a", "domain":"clientea.com.br", "name":"Cliente A", "logoUrl":"/logos/clientea.png", "faviconUrl":"/favicons/clientea.ico", "colors":{"primary":"221.2 83.2% 53.3%", "primaryForeground":"210 40% 98%"}}]'
   ```
   *(Nota: O Tailwind usa valores em HSL puros como `221.2 83.2% 53.3%` nas suas variáveis CSS, então as cores precisam estar neste formato).*
2. **Criar `src/lib/tenant.ts`:**
   - Criar uma interface `TenantConfig`.
   - Criar uma função `getTenantConfig(tenantId: string)` que parseia o JSON do `.env` e retorna a configuração ou joga para uma configuração "default" do Candle se não encontrar.

## Fase 4: Refatoração Visual (Variáveis CSS e Tailwind)
Atualmente, as cores (ex: `blue-600` e a variável global `--primary`) estão fixas.
1. **Criar Componente Provedor (`src/components/layout/TenantThemeProvider.tsx`):**
   - Um componente que não renderiza div nenhuma, apenas injeta `<style>` na página com variáveis CSS que sobrescrevem o `globals.css`.
   - Exemplo: 
   ```tsx
   <style>{`
     :root {
       --primary: ${tenant.colors.primary};
       --primary-foreground: ${tenant.colors.primaryForeground};
     }
   `}</style>
   ```
2. **Atualizar `app/[tenant]/layout.tsx`:** Importar este `TenantThemeProvider` e passar o objeto `tenant` atual para que a página inteira assuma as cores do cliente na raiz do HTML.
3. **Atualizar `tailwind.config.ts`:** Revisar os gradientes customizados (`gradient-primary`, `gradient-secondary`) para que não usem hexadecimal fixo (ex: `#3b82f6`), mas sim consumam as variáveis CSS (`var(--primary)` ou os utilities de cores gerados pelo tailwind baseados no HSL dinâmico).

## Fase 5: Componentização de Elementos da Marca (Logo e Textos)
O nome "ConsultaAi" e o logo (ícone de Lupa da Lucide) estão fixos nos componentes principais.
1. **Criar `<TenantBrand />` (`src/components/ui/TenantBrand.tsx`):**
   - O componente lê o nome do tenant pelo Contexto (se for Client Component) ou Props.
   - Substituir os hardcodes ("ConsultaAi") em `Sidebar.tsx`, `Footer.tsx` e `LoginPageTailwind.tsx` pelo uso de `<TenantBrand />`.
2. **Criar `<TenantLogo />` (`src/components/ui/TenantLogo.tsx`):**
   - O componente vai renderizar a tag `<img src={tenant.logoUrl} />`.
   - Substituir o ícone estático atual `<Search />` pelo `<TenantLogo />` em locais estratégicos (Navbar, Sidebar, Footer).

## Fase 6: Metadados Dinâmicos (Título da Aba e Favicon)
Como garantir que cada site tenha seu próprio Favicon:
1. **Modificar `app/[tenant]/layout.tsx`:**
   - Exportar a função oficial do Next.js chamada `generateMetadata({ params })`.
   - Buscar a configuração do cliente usando `getTenantConfig(params.tenant)`.
   - Retornar o objeto de Metadata populado de forma dinâmica:
     ```tsx
     export async function generateMetadata({ params }): Promise<Metadata> {
       const tenant = getTenantConfig(params.tenant);
       return {
         title: { template: `%s | ${tenant.name}`, default: tenant.name },
         icons: { icon: tenant.faviconUrl } // <--- Favicon Dinâmico!
       }
     }
     ```

## Fase 7: Implantação e Deploy na Vercel (DNS)
1. Fazer o commit da nova arquitetura para a `main` e aguardar o Build da Vercel (ele ainda será um projeto único!).
2. Acessar o Painel da Vercel > Project > **Settings** > **Domains**.
3. Inserir o domínio de cada cliente (ex: `clientea.com.br`, `consulta.clienteb.com`).
4. Repassar as orientações para os clientes configurarem os respectivos provedores de Domínio (Registro.br, Cloudflare, etc.) criando um apontamento `CNAME` para `cname.vercel-dns.com` ou `A record` para o IP da Vercel.

---
**Status da Verificação e Validação**
- [ ] O Build do Next.js passa sem erros na nova estrutura `app/[tenant]`.
- [ ] Navegar no `localhost:3000` via Host mappings locais carrega a cor Vermelha para o tenant A e Azul para o Candle.
- [ ] O ícone do navegador (`favicon`) muda apropriadamente para cada site.
