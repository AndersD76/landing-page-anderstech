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

**Arquétipo: venda por relacionamento.** O site não fecha negócio — ele gera **contato
qualificado no WhatsApp** e sustenta credibilidade. O fechamento é humano, por conversa.

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
| Pagamento | Asaas (só EAD — `ead/asaas.js`) |
| PDF | `pdfkit` — atas (`portal/routes.js`) e certificados EAD (`ead/routes.js`) |
| Segurança | `helmet` com CSP explícita, `express-session` + `connect-pg-simple`, rate limit em memória, `ADMIN_KEY` com comparação timing-safe |
| Analytics | GA4 `G-7XL5XVE6QZ` com **Consent Mode v2** (injetado **só em produção**) + Plausible (**hoje só na home**) |
| Telemetria | `telemetry.js` (adaptador server-side) + `telemetry-client.js` (cliente) + `POST /api/telemetry` → tabela `telemetry_events`. Roda em dev **e** produção, por flag própria |
| SEO | `sitemap.js` gera `/sitemap.xml` dinâmico; `robots.txt`, `llms.txt`, glossário SSR |
| Deploy | Railway (NIXPACKS, healthcheck `/healthz`) |
| CI | GitHub Actions: `node --check` em todo JS versionado + `npm test` + existência de arquivos-chave |

### Comandos
```bash
npm start      # produção (node server.js)
npm run dev    # node --watch server.js  → http://localhost:3001
npm test       # node --test test/asaas.test.js test/migrate.test.js
npm run migrate
npm run seed
```

### Fatos operacionais que mordem
- **Railway não faz auto-deploy neste projeto**: `git push` não publica. Publicar exige
  commit vazio para disparar ou acionar o painel.
- GA4 e banner de cookie **só existem quando `NODE_ENV=production`** ou
  `RAILWAY_ENVIRONMENT=production`. Em dev, nenhum evento sai — não é bug.
- `sendPage()` **memoriza o HTML em `Map`**: mudou HTML/`inject.js`, tem que reiniciar.
- Arquivos na raiz só são servidos se estiverem na whitelist `ARQUIVOS_PUBLICOS` (server.js).
  Arquivo novo na raiz responde 404 até ser adicionado lá.
- Página nova em `pages/<slug>.html` fica em `/<slug>` automaticamente — mas **não entra no
  sitemap nem no breadcrumb** sem editar `sitemap.js` e `BREADCRUMB_LABELS` em `inject.js`.
- Dados da empresa (WhatsApp, e-mail, CNPJ, GA4) vivem em `config/empresa.js`. Use
  `EMPRESA` e `waLink()` — não repita literais.
- **O banner de consentimento agora é injetado sempre** (dev e produção); só o GA4
  continua restrito a produção. Sem isso a telemetria não teria gate de LGPD em dev.
- A tabela de telemetria chama **`telemetry_events`**, não `events`: `events` já
  existe desde a `001_baseline` com outro significado (horas de consultoria do
  portal, com FK vinda de `atas.event_id`).
- **O gerador de propostas em PDF é EXTERNO a este repo** (script Python, ReportLab/
  Playwright, template da marca). Este site **não** gera proposta: ele só hospeda a rota
  `/r/<código>` que registra `artifact_scan` e redireciona para a landing com
  `utm_medium=artifact`. Mudança no layout da proposta é feita no repo Python — aqui só
  a spec do rodapé assinado.

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
   `page_view` · `cta_view` · `cta_whatsapp_click` · `form_submit` · `case_view` · `artifact_scan`.
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

> Bug conhecido: `styles.css:15` tem `--red-accent: var(--red-accent)` — auto-referência,
> valor inválido. Afeta `.tag.light`. Corrigir na rodada que tocar a landing.

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
ead/                cursos, checkout Asaas, certificados
portal/             área logada de cliente/admin
specs/              réguas de e-mail como YAML (não executam neste repo)
migrations/         SQL versionado, aplicado no boot
AUDITORIA.md        histórico de achados e correções
HANDOFF.md          o que o humano precisa configurar à mão
```
