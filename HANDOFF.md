# HANDOFF — Anders Tech (seguranca + exposicao + conversao)

> Tudo que **EU (Daniel)** preciso configurar manualmente, agrupado por plataforma.
> Atualizado em 2026-07-12 apos MOTOR DE TRAFEGO (glossario 83 termos + paginas de custo + schema local + sitemap 123 URLs).

## MOTOR DE TRAFEGO (2026-07-12) — acoes manuais

### 1. Google Business Profile — CONTINUA MANUAL E E O ITEM Nº 1 DO MAPA LOCAL
- Criar/reivindicar perfil "Anders Tech" em business.google.com
  - Categoria: **Consultor de gestao** (secundaria: Consultoria empresarial)
  - Endereco: Rua Uruguai, 679 — Sala 201, Passo Fundo RS 99010-112 (MESMO NAP do site — nao variar)
  - Telefone: +55 54 99964-8368 · Site: https://anderstech.net
  - Areas de atendimento: Passo Fundo, Erechim, Carazinho, Marau, Caxias do Sul, Bento Goncalves, Porto Alegre
  - Servicos: ISO 9001, ISO 14001, PBQP-H, Auditoria interna, Otimizacao de processos
  - Fotos: fachada/sala, foto de perfil profissional, print de projeto
- **Pedir avaliacao aos clientes certificados** — meta: 5 reviews em 30 dias (fator nº 1 do ranking local)
- Depois de criado: me passar a URL do perfil para eu adicionar ao `sameAs` do schema (home + 7 regionais)
- LinkedIn: se existir pagina da empresa/perfil, me passar a URL — tambem entra no `sameAs`

### 2. Google Search Console
- Sitemaps > **reenviar https://anderstech.net/sitemap.xml** (agora dinamico, 123 URLs: +83 glossario, +3 paginas de custo, /glossario)
- Inspecao de URL > "Solicitar indexacao" para (prioridade nesta ordem):
  1. https://anderstech.net/quanto-custa-certificacao-iso (pagina definitiva com calculadora)
  2. https://anderstech.net/glossario
  3. as 7 regionais /consultoria-iso-9001-*
  4. /quanto-custa-iso-14001 · /quanto-custa-auditoria-interna · /quanto-custa-pbqp-h
- Monitorar Indexacao > Paginas semanalmente (crescimento esperado em 2-6 semanas)

### 3. Promocao dos cursos EAD — DECISAO COM DATA
- A promo "gratis ate 29/07/2026" agora e parametrizada: env **`EAD_PROMO_FIM`** (ISO 8601) em `promo.js`
- **Hoje e 12/07 — faltam ~17 dias.** Decidir ANTES de 29/07:
  - Estender: setar no Railway `EAD_PROMO_FIM=2026-08-31T23:59:59-03:00` (exemplo) e redeploy — home e EAD atualizam sozinhos
  - Encerrar: nao fazer nada (em 30/07 promoAtiva() vira false) — MAS conferir como as paginas EAD exibem preco pos-promo
  - Desativar ja: `EAD_PROMO_ATIVA=false`
- Sem env definida, o fallback continua 29/07/2026

### 4. PrismaBiz (cross-domain)
- O glossario linka 83 paginas para https://prismabiz.com.br/ferramenta/* — conferir que o dominio esta no ar e as landings /ferramenta/{slug} respondem 200 (slugs usados: nao-conformidades, auditoria-interna, indicadores-kpi, matriz-de-riscos, pdca, fmea, gestao-iso-9001, analise-swot, plano-de-acao-5w2h)
- Recomendado: criar link reciproco do PrismaBiz para https://anderstech.net/glossario

### N/A neste release: DNS, pagamento, Resend (sem mudanca).

---

## Teste do funil ponta-a-ponta — FAZER 1x NO CELULAR (15 min)

> O funil nunca foi validado com dado real (so `teste@teste.com`). Checklist:

1. Abrir anderstech.net no celular (rede 4G)
2. Conferir que a barra fixa inferior aparece ("Agendar diagnostico gratuito" + botao WhatsApp)
3. Tocar no CTA > preencher o formulario com um email real (nao teste@)
4. Conferir: toast de sucesso apareceu? WhatsApp abriu depois de ~1s?
5. Conferir no Gmail: chegou o email "[Anders Tech] Novo lead"? Chegou o autoresponder?
6. Conferir em anderstech.net/admin: o lead aparece na lista?
7. GA4 > Tempo real: eventos `diagnosis_click` e `generate_lead` registrados?

Se qualquer passo falhar, anotar qual e me avisar.

---

## Railway (variaveis de ambiente)

| Variavel | Valor | Prioridade |
|---|---|---|
| `SESSION_SECRET` | Gerar com: `openssl rand -base64 32` — colar o resultado | **CRITICO** — app faz `process.exit(1)` sem isso em prod |
| `ADMIN_KEY` | Gerar com: `openssl rand -base64 32` — colar o resultado | **CRITICO** — admin bloqueado em prod sem isso |
| `NODE_ENV` | `production` (ou verificar se `RAILWAY_ENVIRONMENT` ja existe com valor `production`) | **ALTO** — sem isso, CORS/cookies/session ficam em modo dev |
| `SENTRY_DSN` | Criar projeto em sentry.io > Settings > Client Keys > copiar DSN | MEDIO — monitoramento de erros |

### Rotacao de credenciais Neon
O `DATABASE_URL` ja esta no Railway, mas as credenciais estiveram expostas no `.env` commitado anteriormente. **Rotacionar**:
1. Neon Console > projeto > Settings > Reset password
2. Copiar a nova connection string
3. Atualizar `DATABASE_URL` no Railway

---

## DNS / Hostinger

| Registro | Tipo | Nome | Valor | Prioridade |
|---|---|---|---|---|
| SPF | TXT | `@` | `v=spf1 include:amazonses.com ~all` | ALTO — sem isso, emails do Resend caem em spam |

---

## Google Search Console

1. Acessar search.google.com/search-console
2. Adicionar propriedade `https://anderstech.net`
3. Verificar via DNS (registro TXT) ou HTML tag (tag ja presente no index.html)
4. Submeter sitemap: `https://anderstech.net/sitemap.xml`
5. Apos indexacao, verificar cobertura e solicitar indexacao das paginas principais

**Prioridade**: **ALTO** — necessario para indexacao, monitoramento SEO e sitelinks

---

## Bing Webmaster Tools

1. Acessar bing.com/webmasters
2. Importar do Google Search Console (mais rapido)
3. Submeter sitemap: `https://anderstech.net/sitemap.xml`
4. IndexNow ja configurado (key: `f6ba6a9696c4426b9a20bd3baa58e3ec`) — Bing indexa automaticamente via CI

**Prioridade**: MEDIO — IndexNow ja configurado, mas dashboard ajuda a monitorar

---

## Google Analytics (GA4) — ACAO PENDENTE (15 min, resolve o "0 conversoes")

> Contexto: o relatorio GA4 mostra 0 conversoes NAO por falta de tracking (o site ja dispara
> os eventos), mas porque nenhum evento foi marcado como "evento-chave" no painel.
> Alem disso, ~44% do trafego atual e bot de data center (Council Bluffs = Google,
> Lulea/Prineville = Facebook, Portland/Fort Worth = AWS), sujando todas as metricas.

### 1. Marcar eventos-chave (conversoes) — **CRITICO**
1. Acessar analytics.google.com > propriedade anderstech.net (`G-7XL5XVE6QZ`)
2. Menu **Admin** (engrenagem) > **Exibicoes de dados** > **Eventos**
3. Na lista de eventos, ativar a chave **"Marcar como evento-chave"** para:
   - `generate_lead` (formulario de contato + lead magnet checklist)
   - `contact_whatsapp` (cliques em WhatsApp, incluindo a barra sticky mobile)
   - `diagnosis_click` (novo — clique no CTA "Agendar diagnostico" da barra sticky)
4. Se algum evento nao aparecer na lista (so aparece apos o 1o disparo), criar em
   **Admin > Eventos-chave > Novo evento-chave** digitando o nome exato.

### 2. Filtrar trafego de bot/data center — **ALTO**
Opcao A (relatorios): em qualquer relatorio, **Adicionar comparacao** > Pais = Brasil.
Opcao B (definitivo): **Admin > Fluxos de dados > Web > Configurar tag > Definir trafego interno**
nao cobre data center — entao use **Admin > Filtros de dados** apenas para trafego interno (teu IP),
e para bots confie no filtro por pais nos relatorios + o GA4 ja exclui bots conhecidos por padrao.
Regra pratica: **sempre analisar com filtro Pais = Brasil**.

### 3. Validar (apos 1 e 2)
1. Abrir anderstech.net no celular (4G, nao no wifi de casa se tiver filtro de IP)
2. Clicar no botao da barra sticky e enviar o formulario com email real
3. GA4 > **Tempo real**: conferir `diagnosis_click` e `generate_lead` aparecendo
4. Em ate 24h, o card "Eventos-chave" deve sair de 0

- **Ja configurado**: tag `G-7XL5XVE6QZ` injetada via SSR no server.js
- **Eventos disparados pelo site**: `generate_lead`, `contact_whatsapp`, `diagnosis_click`,
  `select_content` + Plausible (`cta_click`, `diagnosis_sticky`, `whatsapp_sticky`, etc.)

---

## Pagamento

- N/A (site nao processa pagamentos diretamente)

---

## E-mail (Resend)

- `RESEND_API_KEY` ja configurado no Railway
- Dominio `anderstech.net` ja verificado no Resend
- **Pendente**: registro SPF no DNS (ver secao DNS acima)

---

## Correcoes aplicadas — Seguranca (`/seguranca`)

| # | Severidade | OWASP | Correcao |
|---|---|---|---|
| 1 | CRITICO | A05 | CORS restrito a `anderstech.net` em prod |
| 2 | CRITICO | A07 | Session hardening (httpOnly, secure, sameSite, SESSION_SECRET obrigatorio) |
| 3 | CRITICO | A01 | Admin auth: ADMIN_KEY obrigatorio em prod + timing-safe compare |
| 4 | ALTO | A05 | CSP habilitado com directives corretas |
| 5 | ALTO | A01 | Path traversal prevenido com safePath() + regex whitelist |
| 6 | ALTO | A03 | HTML injection em emails corrigido (funcao esc() em todos os inputs) |
| 7 | ALTO | A03 | Upload: fileFilter (mimes), limite 10MB, UUID nos nomes |
| 8 | ALTO | A07 | Rate limiting no login (10 tentativas / 15 min por IP) |
| 9 | MEDIO | A04 | Paginacao em admin/leads e portal/clients (LIMIT/OFFSET) |
| 10 | MEDIO | A06 | CI: npm audit + secret scanning no workflow |
| 11 | ALTO | — | Pagina 404 propria (sem vazar stack/paths) |

## Correcoes aplicadas — Conversao (2026-07-07)

| # | Severidade | Correcao |
|---|---|---|
| 1 | ALTO | Sticky CTA mobile ("Agendar diagnostico gratuito" + WhatsApp) em todas as paginas — home (index.html), 31 sub-paginas (SSR server.js) e fallback client-side (shared.js) |
| 2 | ALTO | Eventos GA4 novos: `diagnosis_click` e `contact_whatsapp` com label `sticky_mobile`; Plausible: `diagnosis_sticky` / `whatsapp_sticky` |
| 3 | — | FAB redondo do WhatsApp ocultado no mobile (<=760px) para nao sobrepor a barra; body ganha padding-bottom para nao cobrir o rodape |

**Verificacao objetiva**: servidor local na porta 3033 — 5/5 paginas testadas (`/`, `/blog`, `/consultoria-iso-9001-passo-fundo`, `/checklist-iso-9001`, `/calculadora-roi-certificacao`) com stickyCta presente exatamente 1x, CSS mobile e tracking. `node --check` OK em server.js, shared.js e app.js.

## Correcoes aplicadas — Exposicao (`/exposicao`)

| # | Severidade | Correcao |
|---|---|---|
| 1 | ALTO | Sitemap com `<lastmod>` em todas as 25 URLs |
| 2 | ALTO | BreadcrumbList schema injetado via SSR em todas as sub-paginas |
| 3 | ALTO | GA4 `generate_lead` events no formulario de contato e lead magnet |
| 4 | ALTO | WebSite schema com SearchAction no index.html (sitelinks searchbox) |
| 5 | ALTO | Links topicais ("Leia tambem") em todos os 4 blog posts |
| 6 | ALTO | IndexNow key file + ping automatico no CI (Bing/Yandex) |
| 7 | MEDIO | apple-touch-icon via SSR em todas as sub-paginas |
| 8 | MEDIO | llms-full.txt expandido (casos, ferramentas, areas de atuacao) |
