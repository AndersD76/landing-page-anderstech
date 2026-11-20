# CLAUDE.md — Anders Tech (anderstech.net)

> Instruções de projeto. Complementam o `~/.claude/CLAUDE.md` global (auditar → corrigir,
> robustez, verificação objetiva, HANDOFF ao final, PT-BR).

## 1. Produto

**Anders Tech** — consultoria em gestão de Anders, em **Passo Fundo/RS**. Carro-chefe:
**ISO 9001** e **PBQP-H**; o portfólio credenciado tem **13 serviços** (processos,
finanças, estratégia, inovação, marketing). Venda **direta** ou pela plataforma
**Unio** do Sebrae. Público: **indústrias e construtoras do RS**.

> **Unio, não "Sebraetec".** O nome antigo saiu do site em 29/08/2026 — a plataforma
> do Sebrae se chama **Unio** e é **plataforma**, não programa. O modelo é: cliente usa
> **cupom de desconto** conforme critério do Sebrae; a Anders Tech emite NF para o
> Sebrae, que paga integral e cobra o cliente. **Não existe "70% de subsídio"** — esse
> número era invenção do site antigo e foi removido. `/sebraetec` responde 301 → `/unio`.

**Fora do portfólio (18/11/2026):** ISO 14001, ISO 45001, BPF e HACCP/APPCC — o Anders
não presta. Não oferecer em texto novo. `/quanto-custa-iso-14001` e
`/iso-9001-industria-alimenticia` respondem 301.

**Arquétipo: venda por relacionamento.** O site gera **contato qualificado no WhatsApp**
e sustenta credibilidade; o fechamento é humano, por conversa.

> **Exceção desde 18/11/2026 — consultoria paga no site.** `/contratar` calcula o preço
> (R$ 180/h + acréscimos somados), registra o aceite do contrato e cobra pelo Asaas; o
> contrato em PDF sai depois do pagamento. Regras em `consultoria/preco.js`, texto em
> `consultoria/contrato.js`. Fica desligada até os dados da CONTRATADA estarem em
> `config/empresa.js` (HANDOFF 11.7). O WhatsApp continua sendo o CTA dominante.

**Definição de conversão:** clique no WhatsApp com origem rastreada.
Tudo que não empurra para isso é secundário.

Consequências práticas:
- Um CTA dominante por página: WhatsApp com mensagem pré-preenchida que identifica a origem.
- Formulário é a via secundária (para quem não usa WhatsApp) — nunca a via principal.
- Credibilidade > volume: nada de conteúdo raso em massa.

## 2. Stack detectado

| Camada | O que é |
|---|---|
| Runtime | Node.js 22, ESM (`"type": "module"`) — sem TypeScript, sem bundler, sem framework de front |
| Servidor | Express 5 — `server.js` monta tudo; rotas em `portal/routes.js`, `ead/routes.js` |
| Páginas | HTML estático em `pages/`, `blog/`, `ead/pages/`, `portal/` + `index.html` na raiz |
| Composição | `inject.js` — injeta nav, footer, WhatsApp FAB, CTA sticky, GA4/consent e breadcrumb JSON-LD em toda página servida via `sendPage()` |
| Front | `app.js` (IIFE, ES5, sem dependências) + `styles.css` — arquivo único |
| Banco | Neon Postgres via `@neondatabase/serverless`; SQL versionado em `migrations/*.sql`, aplicado no boot por `db/migrate.js` |
| E-mail | Resend (`emails.js`) |
| Pagamento | Asaas (`ead/asaas.js`) — EAD e consultoria; um webhook só, em `/ead/api/webhook/asaas` |
| PDF | `pdfkit` — atas (`portal/routes.js`) e certificados EAD (`ead/routes.js`) |
| Segurança | `helmet` com CSP explícita, `express-session` + `connect-pg-simple`, rate limit em memória, `ADMIN_KEY` com comparação timing-safe |
| Analytics | GA4 `G-7XL5XVE6QZ` (propriedade 540470926) com **Consent Mode v2 básico** (injetado **só em produção**; o gtag.js só carrega depois do "sim" para análise) + Plausible (**hoje só na home**). IDs e credenciais: seção "Métricas e buscadores" abaixo |
| Telemetria | `telemetry.js` (adaptador server-side) + `telemetry-client.js` (cliente) + `POST /api/telemetry` → tabela `telemetry_events`. Roda em dev **e** produção, por flag própria |
| SEO | `sitemap.js` gera `/sitemap.xml` dinâmico; `robots.txt`, `llms.txt`, glossário SSR |
| SEO programático | `pbqph/` — páginas de PBQP-H por município e por certificadora, SSR com cache, a partir de `data/pbqph-siac.json` (carga mensal por `.github/workflows/carga-pbqph.yml`) |
| Extração | Playwright (**devDependency**, só em `scripts/`) — o Certifiq só se deixa consultar por navegador. Não roda no servidor |
| Deploy | Railway (NIXPACKS, healthcheck `/healthz`) |
| CI | GitHub Actions: `node --check` em todo JS versionado + `npm test` + existência de arquivos-chave |

### Comandos
```bash
npm start      # produção (node server.js)
npm run dev    # node --watch server.js  → http://localhost:3001
npm test       # 9 arquivos em test/ — lista completa no package.json
npm run migrate
npm run seed
```

### Fatos operacionais que mordem
- **Todo push no `master` publica** (o Railway faz auto-deploy; conferido em 20/11/2026:
  commit só de documentação e merge de PR pelo GitHub viraram deploy sozinhos). Não precisa
  de commit vazio. Antes de dar push, confira que o commit no ar
  (`railway deployment list --json`) é o mesmo do `origin/master`.
- **`railway.json` deixa de ser lido em 01/12/2026.** Desde 19/11/2026 o painel do serviço
  tem start command (npm start), healthcheck (/healthz, 30 s), restart On Failure 3 e builder
  NIXPACKS, gravados via API. **Nunca** aplicar o `.railway/railway.ts` gerado por `railway config migrate`: o plan dele
  apaga as 11 variáveis de produção e desconecta o GitHub.
- **A versão do Node em produção vem de `engines` no `package.json` (22.x).** Sem o campo,
  o Nixpacks usa Node 18: foi assim até 19/11/2026, com o CI testando em 22. Confira a linha
  `setup │ nodejs_22` no log de build (`railway logs --build <id>`) ao mexer em deploy.
- `npm run test:integracao` sobe o servidor inteiro sobre Postgres em memória (PGlite) e
  passa por todos os fluxos (leads, conversões, parceiros, iscas, WhatsApp, outbound,
  régua, rotinas). Roda no CI. Use ao mexer em SQL.
- GA4 **só existe quando `NODE_ENV=production`** ou `RAILWAY_ENVIRONMENT=production`.
  Em dev, nenhum evento sai — não é bug. Mesmo em produção, **nada vai ao Google antes do
  "sim"**: o modo avançado mandava page_view sem cookie antes da escolha e perdia a página
  de entrada de quem aceitava (GA4 com 4 usuários contra 19 cliques do Google em 28 dias,
  medido em 19/11/2026). No aceite, `atCarregaGa()` registra a página atual com o referrer
  original. Para testar: servidor local com `NODE_ENV=production` + Playwright
  interceptando `/g/collect`.
- `sendPage()` **memoriza o HTML em `Map`**: mudou HTML/`inject.js`, tem que reiniciar.
- Arquivos na raiz só são servidos se estiverem na whitelist `ARQUIVOS_PUBLICOS` (server.js).
  Arquivo novo na raiz responde 404 até ser adicionado lá.
- Página nova em `pages/<slug>.html` fica em `/<slug>` automaticamente — mas **não entra no
  sitemap nem no breadcrumb** sem editar `sitemap.js` e `BREADCRUMB_LABELS` em `inject.js`.
- Dados da empresa (WhatsApp, e-mail, CNPJ, GA4) vivem em `config/empresa.js`. Use
  `EMPRESA` e `waLink()` — não repita literais.
- **O banner de consentimento agora é injetado sempre** (dev e produção); só o GA4
  continua restrito a produção. Sem isso a telemetria não teria gate de LGPD em dev.
- **URL nunca leva acento.** Uma correção de acentuação em massa já transformou
  `certificacao` em `certificação` em 110 links e em 13 canonicals — todos 404.
  `test/urls.test.js` barra isso e confere que todo canonical aponta para rota que existe.
- A tabela de telemetria chama **`telemetry_events`**, não `events`: `events` já
  existe desde a `001_baseline` com outro significado (horas de consultoria do
  portal, com FK vinda de `atas.event_id`).
- **O gerador de propostas em PDF é EXTERNO a este repo** (script Python, ReportLab/
  Playwright, template da marca). Este site **não** gera proposta: ele só hospeda a rota
  `/r/<código>` que registra `artifact_scan` e redireciona para a landing com
  `utm_medium=artifact`. Mudança no layout da proposta é feita no repo Python — aqui só
  a spec do rodapé assinado.

### Métricas e buscadores (configurado em 19/11/2026, padrão dos 9 apps)
| O quê | Valor |
|---|---|
| GA4 | propriedade `540470926`, fluxo `G-7XL5XVE6QZ`, fuso São Paulo (desde 20/11/2026). Eventos principais: `purchase`, `contact` (clique no WhatsApp) e `generate_lead` (formulários), os dois últimos com valor padrão de US$ 1 que a interface gravou sem pedir: **não importar valor do GA4 no Google Ads** sem antes tirar isso |
| Search Console | `sc-domain:anderstech.net` (verificada por TXT), sitemap `https://anderstech.net/sitemap.xml` |
| Bing Webmaster | verificado, mesmo sitemap |
| IndexNow | chave `c310f106aad0297668046237775e3dc3` (arquivo na raiz; a antiga `f6ba…` continua servida) |
| Credencial | conta de serviço do projeto Google Cloud compartilhado: **Leitor** no GA4, **proprietária** no Search Console. Lida por `growth/integracoes.js` (`googleTokenLeitura`) |

Variáveis no Railway (serviço `landing-page-anderstech`), nomes em `.env.example`:
`GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, `GA4_PROPERTY_ID`, `GA4_MEASUREMENT_ID`,
`GSC_SITE_URL`, `INDEXNOW_KEY`, `BING_WEBMASTER_API_KEY`. A coleta diária
(`organico/jobs.js`, depois das 3h) liga sozinha com a chave da conta de serviço; a
primeira puxa 90 dias. OAuth (`GOOGLE_OAUTH_*`) fica só para Google Ads e Data Manager.
Para perguntas de tráfego numa sessão do Claude Code, use os MCPs `gsc` e `analytics-mcp`.

## 3. Convenções

- **PT-BR em tudo**: interface, comentários, mensagens de commit, documentação.
- Comentário explica **por quê**, não o quê — no padrão já existente no repo (referência ao
  achado que originou a mudança, quando houver).
- Sem dependência nova sem avisar. O projeto é deliberadamente magro.
- Sem framework de front, sem build step. HTML + CSS + JS puro.
- Idempotência: não duplicar o que já existe (nav, footer, tracking, schema).
- Refatoração incremental e testada por lote — nunca big-bang.
- Toda mudança termina em **verificação objetiva** (número, checagem, teste), nunca "pronto".

## 4. Regras permanentes (máquina de tráfego)

1. **UTM obrigatória**: todo link externo gerado por código carrega
   `utm_source=anderstech&utm_medium=<canal>&utm_campaign=<contexto>`.
   Canais em uso: `whatsapp`, `artifact` (proposta/case em PDF), `email` (réguas), `qr`.
2. **WhatsApp com origem**: todo botão usa `wa.me` com mensagem pré-preenchida no formato
   `"Olá! Vim pela página <X>"` — a origem tem que chegar legível na conversa do Anders.
3. **Nada inventado**: número, cliente, depoimento, preço, prazo ou resultado que não foi
   fornecido vira `[PREENCHER]`. Todo texto de marketing sai marcado `[REVISAR]`.
4. **SEO**: `title` e `meta description` únicos por página; canonical; sitemap automático.
   **Proibido gerar páginas por cidade em massa** — doorway page é punição do Google.
   **Exceção autorizada pelo Anders em 20/09/2026**, e só ela: página por cidade
   construída sobre **dado próprio da cidade** — lista nominal das empresas, contagem
   e vencimentos, vindos de fonte pública carimbada. O que a regra proíbe continua
   proibido: texto genérico com o nome da cidade trocado.
   **Quality gate obrigatório: menos de 5 registros vigentes no município → a página
   não existe** (`noindex` e fora do sitemap). Registro sem data de validade não
   conta. Fonte incompleta excluindo cidade é o sistema funcionando, não falha.
   Medido em 20/09/2026: 25 municípios passam em RS+SC+PR, 107 no Brasil.
   **Só o PBQP-H sustenta esse eixo** — o Certifiq (ISO 9001) não devolve município.
5. **Performance**: alvo < 3s em 4G; LCP < 2s na landing; Lighthouse ≥ 95.
6. **Eventos de telemetria** (nomes literais, sem variação):
   `page_view` · `cta_view` · `cta_whatsapp_click` · `form_submit` · `case_view` · `artifact_scan`
   · e, desde 18/11/2026 (pedido do Anders, motor orgânico): `isca_vista` · `isca_iniciada` ·
   `isca_concluida` · `lead_capturado` · `cta_produto_clicado`, sempre com `page_type`,
   `cluster`, `consulta_alvo` e `isca_id` (organico/taxonomia.js).
   Conversões de negócio (lead, checkout, pagamento, indicação) NÃO são telemetria: ficam na
   tabela `conversoes` (growth/conversoes.js), gravadas no servidor; pagamento só pelo webhook.
   `cta_view` é a impressão do CTA (metade do botão na tela), um disparo por CTA
   por sessão — sem ele não existe denominador e o CTR é incalculável.
   Todo evento carrega `session_id`, que fecha por 30 min de inatividade: o
   `anonymous_id` é identificador de dispositivo e não serve para contar sessão.
   `identify()` quando o usuário fornecer telefone ou e-mail.
   Nenhum evento pode duplicar por re-render.
7. **LGPD**: telemetria e cookies respeitam o consentimento já implementado
   (Consent Mode v2 + banner). Nada dispara antes da escolha.

## 5. Identidade de artefatos

Referência obrigatória para **qualquer PDF ou imagem gerada** com a marca — proposta
comercial, case de 1 página, certificado, relatório. Vale tanto para o gerador Python
externo quanto para o que sai do `pdfkit` daqui.

| Elemento | Valor |
|---|---|
| Fundo / blocos escuros | **Navy escuro** — `#0b1730` (base) · `#12233f` e `#203864` (variações) |
| Acento | **Vermelho** `#FE0000` (`#d80a0a` para estados de hover/pressão) |
| Tipografia | **Poppins** — títulos em SemiBold/Bold, corpo em Regular |
| Elemento gráfico | **Diamante**: quadrado sólido rotacionado 45°, vermelho, usado como bullet, marcador de seção e assinatura visual |
| Texto sobre navy | `#ffffff` (principal) · `#b9c8e4` (secundário) |
| Papel / fundo claro | `#F4F6FA` |

**Atenção — o site diverge do artefato de propósito**: `styles.css` usa Space Grotesk
(display), Inter (corpo) e Space Mono (mono). **Poppins é a fonte dos artefatos**, não do
site. Não "corrigir" um pelo outro sem decisão do Anders.

> O bug da auto-referência em `--red-accent` (`styles.css`) já foi corrigido: hoje vale
> `#ff6a6a`, com comentário explicando a origem.

## 6. Mapa rápido

```
index.html          landing principal (home)
app.js  styles.css  front-end da home
inject.js           nav/footer/analytics/breadcrumb injetados server-side
server.js           rotas, static, /api/contact, admin API, roteamento de pages/ e blog/
config/empresa.js   dados da empresa — fonte única
sitemap.js          /sitemap.xml (editar ao criar página)
telemetry.js        adaptador de telemetria (server) — ponto único de saída de evento
telemetry-client.js cliente de telemetria (público, injetado em toda página)
pages/              páginas estáticas → servidas em /<slug>
blog/               posts → /blog/<slug>
cases/              gerador de case (validate.js, pdf.js, render.js) → /cases/<slug>
glossario/          glossário SSR (terms.js + render.js)
ead/                cursos, checkout Asaas, cupons (regra em ead/cupons.js, painel em /admin/cupons), certificados
consultoria/        venda de consultoria no site: preco.js (regra), contrato.js (texto + PDF), routes.js
data/distancias-passo-fundo.json  km por estrada até 504 municípios (scripts/distancias-passo-fundo.mjs)
growth/             atribuição (cookie at_attr), livro de conversões e envio às plataformas, caixa
                    única de leads + score, parceiros (/p/<código>), regras de corte de mídia,
                    mensageria (outbound e régua: DESLIGADOS por padrão), WhatsApp de entrada,
                    campanhas do Google Ads (midia.js). Painéis /admin/crescimento e /admin/operacao
organico/           motor orgânico: mapa de buscas, páginas no banco (seo_paginas) com portão de
                    qualidade e motor de links, requisitos da ISO 9001, 12 iscas, dados do PBQP-H,
                    Search Console/Bing/GA4, crawlers, produção com LLM (desligada sem chave),
                    ondas semanais, alertas e resumo semanal. Painel /admin/organico
                    Sem .md de planejamento: dado operacional vive no banco e aparece no painel.
portal/             área logada de cliente/admin
specs/              réguas de e-mail como YAML (não executam neste repo)
migrations/         SQL versionado, aplicado no boot
AUDITORIA.md        histórico de achados e correções
HANDOFF.md          o que o humano precisa configurar à mão
```
