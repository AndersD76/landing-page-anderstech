# AUDITORIA.md — AndersTech (landing-page-anderstech)

> **Iniciada em**: 2026-08-17 · **Formato**: numeração global contínua (#1, #2, …)
> **Base auditada**: working tree atual (inclui alterações não commitadas sobre `a92f3ab`).
> Os `arquivo:linha` referem-se ao estado atual dos arquivos em disco, não ao HEAD.

---

## MAPA DA ESTRUTURA DO PROJETO

### Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js, ESM (`"type": "module"` em `package.json:5`) |
| Servidor | Express 5.2.1 (`server.js`) |
| Banco | PostgreSQL via Neon serverless HTTP driver (`@neondatabase/serverless` 1.1.0) |
| Sessão | `express-session` + `connect-pg-simple` (store no Postgres; MemoryStore se não houver `DATABASE_URL`) |
| Segurança | `helmet` (CSP), `cors`, `bcryptjs` |
| E-mail | Resend (`resend` 6.12.4) — `emails.js` |
| Pagamento | Mercado Pago (REST direto via `fetch`, sem SDK) |
| PDF | `pdfkit` (certificados, atas, templates) |
| Upload | `multer` 2.2.0 (disco, pasta `uploads/`) |
| Observabilidade | Sentry opcional (`@sentry/node`, ativado só se `SENTRY_DSN`) |
| Build | **Não há build step.** HTML/CSS/JS servidos direto, sem bundler/transpilador |
| Testes | **Não existem** (nenhum framework declarado em `package.json`) |

### Frontend — não é SPA

Não há framework de frontend. São páginas HTML estáticas servidas pelo Express, com
JavaScript inline (ES5, `var`/`function`) dentro de cada `.html`. O único `.js` de
frontend separado é `app.js` (home).

| Área | Arquivos | Consumo de API |
|---|---|---|
| Landing / home | `index.html` (712 L), `app.js` (333 L), `styles.css` | `POST /api/contact` |
| Blog | `blog/*.html` (8 posts + índice + `_template.html`) | nenhum |
| Páginas SEO | `pages/*.html` (22 páginas: regionais, custo, nicho, 404, legais) | `POST /api/contact` (checklist + calculadora ROI) |
| Glossário | `glossario/terms.js` (1031 L, 83 termos) + `glossario/render.js` (SSR) | nenhum (SSR puro) |
| Admin de leads | `admin/index.html` (616 L) | `/api/admin/*` com `Authorization: Bearer` |
| Portal admin | `portal/admin.html` (1193 L) | `/portal/api/*` via cookie de sessão |
| Portal cliente | `portal/cliente.html` (855 L) | `/portal/api/me*` via cookie de sessão |
| Portal login | `portal/login.html` (261 L) | `/portal/login`, `/portal/api/me` |
| EAD | `ead/pages/*.html` (11 páginas; `player.html` = 1389 L) | `/ead/api/*` via cookie de sessão |

### Backend

| Arquivo | Linhas | Responsabilidade |
|---|---|---|
| `server.js` | 415 | Bootstrap, middlewares, CSP, sessão, static, leads (`/api/contact`, `/api/admin/*`), glossário SSR, catch-all de páginas |
| `portal/routes.js` | 1198 | Portal do cliente/admin: auth, clientes, contratos, eventos, pagamentos, atas, dashboard |
| `ead/routes.js` | 1149 | EAD: cursos, auth de aluno, player, progresso, quizzes, certificados, checkout MP, webhook |
| `inject.js` | 142 | Injeção SSR compartilhada (GA4, nav, footer, breadcrumb JSON-LD, CTA sticky) |
| `emails.js` | 121 | Templates HTML de e-mail (lead, auto-reply, checklist, boas-vindas do portal) |
| `sitemap.js` | 84 | Geração dinâmica de `sitemap.xml` |
| `promo.js` | 24 | Regra da promoção de lançamento do EAD (lê `EAD_PROMO_*`) |
| `glossario/render.js` | 232 | SSR do glossário (index + termo) |
| `shared.js` | 77 | **Órfão** — 0 referências no HTML após a remoção das tags `<script>` |
| `inject.js` / `fix-accents.cjs` | — | `fix-accents.cjs` é script utilitário avulso, não referenciado por `package.json` |

### Banco de dados — 17 tabelas (+ `session`), migrações versionadas desde 2026-08-18

**Não há migrations.** Todo o DDL é `CREATE TABLE IF NOT EXISTS` executado no boot,
espalhado por três funções: `initDB()` (`server.js:128`), `initPortalDB()`
(`portal/routes.js:60`), `initEadDB()` (`ead/routes.js:28`).

| Módulo | Tabelas |
|---|---|
| Leads (`server.js`) | `leads`, `lead_events` |
| Portal (`portal/routes.js`) | `portal_users`, `contracts`, `events`, `payments`, `atas` |
| EAD (`ead/routes.js`) | `ead_courses`, `ead_modules`, `ead_lessons`, `ead_quiz_questions`, `ead_users`, `ead_orders`, `ead_enrollments`, `ead_progress`, `ead_quiz_attempts`, `ead_certificates` |
| Sessão | `session` (criada automaticamente por `connect-pg-simple`, `createTableIfMissing: true`) |

Dois sistemas de identidade **independentes e sem relação**: `portal_users`
(sessão `req.session.portalUser`) e `ead_users` (sessão `req.session.eadUser`).

### Configuração e ambiente

13 variáveis lidas no código: `PORT`, `NODE_ENV`, `RAILWAY_ENVIRONMENT`, `DATABASE_URL`,
`SESSION_SECRET`, `ADMIN_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `MP_ACCESS_TOKEN`,
`MP_WEBHOOK_SECRET`, `SENTRY_DSN`, `EAD_PROMO_FIM`, `EAD_PROMO_ATIVA`.
Documentadas em `.env.example`: 12 (falta `RAILWAY_ENVIRONMENT`).
Deploy: Railway (inferido de `RAILWAY_ENVIRONMENT` em `server.js:32` e de `HANDOFF.md`).
CI: `.github/workflows/ci.yml`.

### Seeds e material de curso

`ead/seed.js` + `ead/seed-course1..4.js` (script `npm run seed`).
`treinamentos/` contém PDFs/PPTs de origem — material bruto, não servido pela aplicação.

---

## ACHADOS

### CRÍTICO

#### #26 — Webhook de pagamento sem transação e devolvendo 200 no erro: cliente paga e pode ficar sem acesso, sem retry
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Reconstruído no Asaas: `UPDATE` + `INSERT` numa `sql.transaction`, e o `catch` devolve **500** para o gateway reenviar.
> **Severidade revisada no Bloco H (ALTO → CRÍTICO)**: reavaliando contra os outros três críticos, este é mais grave. Nos demais uma funcionalidade não funciona e o usuário percebe na hora; aqui **o dinheiro é recebido, o serviço não é entregue, e o próprio guard de idempotência impede a autocorreção** — o estado inconsistente é permanente e silencioso. Falha de integridade de pagamento pertence ao topo da escala.
- **Arquivos**: `ead/routes.js:1032-1038` (sem transação) · `ead/routes.js:1065-1068` (catch devolve 200)
- **Descrição**: Quando o Mercado Pago confirma um pagamento, o webhook executa **duas escritas independentes, fora de transação**:

  ```js
  await sql`UPDATE ead_orders SET status = 'aprovado', … WHERE id = ${orderId}`;      // 1036
  await sql`INSERT INTO ead_enrollments (…) … ON CONFLICT DO NOTHING`;                // 1037
  ```

  Se a segunda falhar (queda de rede com o Neon, timeout, indisponibilidade momentânea), o pedido já está gravado como `aprovado` e **a matrícula nunca é criada**. O `catch` externo então executa `res.sendStatus(200)` (`ead/routes.js:1067`).
- **Por que o 200 agrava**: para o Mercado Pago, HTTP 200 significa "notificação processada com sucesso, não reenviar". Ao devolver 200 num erro, o sistema descarta a única chance de reprocessamento automático. A notificação some. E como o `SELECT` de guarda é `WHERE id = … AND status != 'aprovado'` (`:1033`), um reenvio manual também não corrigiria: o pedido já está `aprovado`, a condição não bate, e o bloco inteiro é pulado. **O estado fica permanentemente inconsistente.**
- **Impacto**: cliente pagou, o pedido consta como aprovado no banco, e ele não tem acesso ao curso. Não há alerta, não há fila de retentativa, e o próprio guard de idempotência impede a autocorreção. A descoberta depende do cliente reclamar.
- **Correção proposta**: envolver as duas escritas em `sql.transaction(...)` — o mesmo padrão já usado em `server.js:340-351` — e devolver **500** no `catch`, para que o Mercado Pago reenvie conforme a política de retentativa dele. Manter o 200 apenas nos caminhos de descarte deliberado (`type !== 'payment'`, `:1019`), que não são erro.
- **Risco da correção**: médio. Trocar o 200 por 500 faz o MP passar a reenviar notificações que hoje são descartadas — é o comportamento desejado, mas exige que a idempotência esteja sólida antes. A idempotência atual (`status != 'aprovado'` + `ON CONFLICT DO NOTHING`) cobre o caso feliz; com a transação, passa a cobrir o caso de falha parcial também. Aplicar a transação **primeiro**, validar, e só então mudar o status code.

#### #1 — `PUT /portal/api/pagamentos/:id` não existe: editar pagamento sempre falha
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `PUT /portal/api/pagamentos/:id` criado, mesmo padrão COALESCE das demais entidades.
- **Arquivos**: `portal/admin.html:1126-1127` (envia) · `portal/routes.js:1062-1097` (rota ausente)
- **Descrição**: O modal de pagamento monta `endpoint = currentEditId ? '/pagamentos/' + currentEditId : '/pagamentos'` e `method = currentEditId ? 'PUT' : 'POST'` (`portal/admin.html:1126-1127`). O backend registra apenas `POST /portal/api/pagamentos` (1062), `GET /portal/api/pagamentos/:id` (1083) e `DELETE /portal/api/pagamentos/:id` (1097). **Não há `PUT`.** Toda edição de pagamento cai no catch-all 404 de `server.js:393`, que responde HTML de 404; `apiFetch` (`portal/admin.html:470`) tenta `res.json()`, falha, e exibe "Erro ao salvar: Erro 404".
- **Comparação**: as outras três entidades têm PUT — `/clientes/:id` (854), `/eventos/:id` (990), `/atas/:id` (543). Pagamento é a única sem.
- **Correção proposta**: adicionar `router.put('/portal/api/pagamentos/:id', requireAdmin, …)` com o mesmo padrão `COALESCE(${campo ?? null}, campo)` usado em `/eventos/:id` (`portal/routes.js:990-1015`), cobrindo `valor`, `data`, `metodo`, `observacoes`, `contract_id`.
- **Risco da correção**: baixo. Rota nova, não altera comportamento existente. Atenção: o frontend envia `cliente_id`/`contrato_id` em português (ver #6) — corrigir só o PUT sem resolver #6 mantém o bug de gravação.

---

#### #6 — Criar evento, pagamento ou ata falha sempre: corpo em PT, validação em EN
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `campo()` aceita PT e EN no corpo; mensagens de erro deixaram de citar nome de campo interno.
- **Arquivos**: `portal/admin.html:1095,1102` (evento) · `:1118,1123` (pagamento) · `:1133-1142` (ata) · `portal/routes.js:973-976` · `:1065-1068` · `:513-516`
- **Descrição**: A correção do mismatch de rotas criou os aliases em português (`/eventos`, `/pagamentos`), mas manteve os **nomes de campo do corpo em inglês**. O frontend monta `payload = { cliente_id: parseInt(cid), … contrato_id: … }` (`admin.html:1095` e `:1102`); o handler faz `const { client_id, contract_id, … } = req.body` (`portal/routes.js:973`) e barra na guarda seguinte:

  | Ação | Frontend envia | Backend exige | Resultado |
  |---|---|---|---|
  | Criar evento (`admin.html:1095`) | `cliente_id` | `client_id` (`routes.js:973-975`) | **HTTP 400** "client_id, data, tipo e horas sao obrigatorios" |
  | Criar pagamento (`admin.html:1118`) | `cliente_id` | `client_id` (`routes.js:1065-1067`) | **HTTP 400** "client_id, valor e data sao obrigatorios" |
  | Criar ata (`admin.html:1133-1142`) | nem envia cliente | `client_id` (`routes.js:513-515`) | **HTTP 400** "client_id, titulo e data sao obrigatorios" |
  | Editar evento (`admin.html:1105`) | `contrato_id` | `contract_id` — não está no `PUT` (`routes.js:993`) | salva, mas **o contrato vinculado é perdido** |
  | Criar ata a partir de evento (`admin.html:724`) | `evento_id` | `event_id` (`routes.js:513`) | vínculo evento↔ata **nunca é gravado** |

- **Impacto**: as três operações de criação mais usadas do Portal Admin — lançar evento, registrar pagamento e criar ata — estão 100% inoperantes. O usuário vê "Erro ao salvar: client_id, data, tipo e horas sao obrigatorios", uma mensagem em inglês técnico sobre um campo que ele preencheu. Junto com #1, o CRUD do portal só funciona para clientes.
- **Correção proposta**: padronizar em português no backend, já que o frontend, o banco (`atas`, `eventos`… não — o banco é EN) e as rotas PT já apontam nessa direção. O caminho de menor risco é aceitar os dois nomes na desestruturação — `const client_id = req.body.client_id ?? req.body.cliente_id` — nas 5 rotas afetadas, e depois migrar o frontend em lote separado. Alternativa mais limpa: renomear no frontend (`cliente_id` → `client_id`), que toca 8 pontos em um único arquivo.
- **Risco da correção**: baixo na abordagem tolerante (aceita ambos, nada quebra). Médio na renomeação do frontend: precisa cobrir também os `id` dos elementos (`f-cliente_id`, `f-contrato_id`, `f-evento_id`) e os leitores (#9). Testar as 4 entidades × criar/editar antes de fechar.

#### #7 — Ativar/desativar cliente é um no-op silencioso que reporta sucesso
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Frontend passou a enviar e ler `ativo` (boolean). `status` não existia na tabela.
- **Arquivos**: `portal/admin.html:645-650` (envia) · `portal/routes.js:885` (lê) · `portal/routes.js:64-75` (schema)
- **Descrição**: `toggleClienteStatus` calcula `const newStatus = c.status === 'inativo' ? 'ativo' : 'inativo'` e envia `PATCH /clientes/:id` com `{ status: newStatus }` (`admin.html:645-650`). O handler desestrutura `const { nome, empresa, telefone, cnpj, ativo } = req.body` (`portal/routes.js:885`) — **`status` não é lido**. Como todos os campos ficam `undefined`, o `UPDATE` vira `SET nome = COALESCE(null, nome), …` para todas as colunas: uma escrita que não altera nada. Retorna 200 com a linha inalterada, e o frontend exibe "Cliente desativado".
- **Agravante**: a coluna `status` **não existe** em `portal_users` (`portal/routes.js:64-75` define `ativo BOOLEAN DEFAULT true`). Os 7 pontos que leem `c.status` (`admin.html:589,592,593,645,875,914,964`) recebem sempre `undefined`, então a comparação `c.status === 'inativo'` é sempre falsa: **todo cliente aparece como "Ativo"**, inclusive os que têm `ativo = false` no banco e não conseguem mais fazer login (`portal/routes.js:200-202`).
- **Impacto**: duplo. (a) Não há como desativar um cliente pela interface. (b) O painel mente sobre o estado: um cliente bloqueado continua listado como Ativo, e o admin não tem como descobrir isso pela UI.
- **Correção proposta**: trocar o contrato para o campo real — frontend envia `{ ativo: boolean }` e lê `c.ativo` nos 7 pontos, com `c.ativo === false ? 'Inativo' : 'Ativo'`. Não criar coluna `status`: `ativo` já cobre o caso e é o que o login consulta.
- **Risco da correção**: baixo. Atenção ao `COALESCE(${ativo ?? null}, ativo)` de `portal/routes.js:894`: com `ativo = false` o `??` preserva `false` corretamente (só `null`/`undefined` viram `null`), então o PATCH funcionará assim que o nome do campo bater.

### ALTO

#### #8 — Prova final do EAD deixou de mostrar a alternativa correta
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Gabarito revelado **apenas a quem passou** — mantém o valor pedagógico sem permitir farm por tentativa.
- **Arquivos**: `ead/pages/player.html:574` (lê) · `ead/routes.js:556-562` (deixou de enviar)
- **Descrição**: A correção de vazamento de gabarito removeu `correctAnswer` da resposta do submit — o retorno passou a ser `{ questionId, correct, explicacao }` (`ead/routes.js:561`). O player não foi ajustado: `if(idx===r.correctAnswer)lbl.classList.add('correct')` (`player.html:574`) compara um índice numérico com `undefined`, resultado sempre falso.
- **Impacto**: ao terminar a prova final, nenhuma alternativa é destacada em verde. O aluno que errou vê a própria resposta marcada em vermelho (`player.html:575`, que ainda funciona) e a explicação textual, mas não vê qual era a correta. É uma regressão de UX introduzida junto com a correção de segurança — a correção em si está certa, o frontend é que ficou para trás.
- **Correção proposta**: duas opções coerentes com a decisão de segurança. (a) Revelar o gabarito **apenas quando o aluno já foi aprovado** — o backend acrescenta `correctAnswer` ao payload só se `passed === true`; mantém o valor pedagógico sem permitir farm de gabarito por tentativa. (b) Manter o gabarito oculto e ajustar o `player.html` para não prometer o destaque verde, reforçando a explicação textual.
- **Risco da correção**: baixo. Na opção (a), garantir que a condição seja avaliada no servidor e não derivável pelo cliente.

#### #9 — Painel de detalhe do cliente: 3 das 4 métricas sempre mostram "-"
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Resumo devolve `total_eventos`, `total_horas`, `total_faturado` e `total_pagamentos` — os nomes que o painel lê.
- **Arquivos**: `portal/admin.html:627-630` (lê) · `portal/routes.js:921-928` (retorna)
- **Descrição**: `toggleClienteDetail` lê `data.total_eventos`, `data.total_horas`, `data.total_faturado` e `data.total_pagamentos` (`admin.html:627-630`). O endpoint `/clientes/:id/resumo` devolve `contratos_count`, `eventos_count`, `total_horas`, `pagamentos_count` e `total_pago` (`portal/routes.js:923-927`).

  | Frontend lê | Backend envia | Resultado |
  |---|---|---|
  | `total_eventos` | `eventos_count` | "-" |
  | `total_horas` | `total_horas` | ✅ funciona |
  | `total_faturado` | *(não existe)* | "-" |
  | `total_pagamentos` | `total_pago` / `pagamentos_count` | "-" |

- **Impacto**: expandir a linha de um cliente mostra apenas as horas; eventos, faturado e pagamentos ficam em branco. `contratos_count` é calculado no backend (`routes.js:914`) e nunca consumido — query desperdiçada em toda abertura.
- **Correção proposta**: alinhar os nomes. `total_faturado` não tem origem — ou se calcula no backend (`SUM(horas * valor_hora)` sobre `events`, ver #10) ou se remove o campo da UI.
- **Risco da correção**: baixo, mas note que `total_faturado` exige decidir a regra de negócio de faturamento, que hoje não existe em lugar nenhum do código.

#### #10 — Coluna "Cliente" das tabelas de Eventos, Pagamentos e Atas sempre exibe "-"
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Queries devolvem `cliente_nome` e `cliente_id` por alias SQL.
- **Arquivos**: `portal/admin.html:547,557,691,751,799` (lê) · `portal/routes.js:961,1049,1113` (retorna) · `portal/admin.html:442-445` (fallback)
- **Descrição**: Os renderizadores usam `esc(e.cliente_nome || clienteNome(e.cliente_id))`. As queries fazem `SELECT e.*, pu.nome AS client_nome` (`portal/routes.js:961`, `:1049`, `:1113`), então a resposta traz `client_nome` e `client_id` — em inglês. Ambas as leituras dão `undefined`, e o fallback `clienteNome(undefined)` faz `clientesCache.find(x => x.id === undefined)`, que retorna `undefined`, resultando em `'-'` (`admin.html:442-445`).
- **Impacto**: cinco tabelas — as duas do dashboard e as três das seções principais — mostram um traço na coluna Cliente em todas as linhas. Como o filtro por cliente também não funciona (#3), não há nenhuma forma de saber a que cliente um lançamento pertence pela interface.
- **Correção proposta**: mesma decisão de nomenclatura de #6. Se o backend passar a expor `cliente_nome`/`cliente_id` (via alias SQL `AS cliente_nome` e renomeação da coluna no `SELECT`), os cinco pontos passam a funcionar sem tocar no frontend.
- **Risco da correção**: baixo. Mudar só o alias do `JOIN` (`AS client_nome` → `AS cliente_nome`) não afeta nenhum outro consumidor, porque as rotas EN equivalentes são órfãs (#2).

#### #2 — 16 rotas do portal nunca são consumidas (duplicação EN/PT integral)
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — As 13 rotas EN órfãs removidas.
- **Arquivo**: `portal/routes.js`
- **Descrição**: A camada de aliases em português (linhas 767-1176) duplicou recursos que já existiam em inglês, mas as versões em inglês não foram removidas nem redirecionadas. Verifiquei por grep em `portal/`, `admin/` e `ead/`: **zero** ocorrências de `/clients`, `/events`, `/payments`, `/contracts`, `/me/contracts`, `/me/events`, `/me/payments`, `/me/summary` no frontend.

  Rotas órfãs confirmadas:

  | Rota | Linha | Equivalente PT em uso |
  |---|---|---|
  | `GET /portal/api/clients` | 238 | `/clientes` (767) |
  | `POST /portal/api/clients` | 254 | `/clientes` (783) |
  | `GET /portal/api/clients/:id` | 298 | `/clientes/:id/resumo` (908) |
  | `PUT /portal/api/clients/:id` | 326 | `/clientes/:id` (854) |
  | `GET /portal/api/events` | 398 | `/eventos` (949) |
  | `POST /portal/api/events` | 419 | `/eventos` (970) |
  | `PUT /portal/api/events/:id` | 439 | `/eventos/:id` (990) |
  | `GET /portal/api/payments` | 469 | `/pagamentos` (1045) |
  | `POST /portal/api/payments` | 486 | `/pagamentos` (1062) |
  | `GET /portal/api/me/contracts` | 690 | `/me/contratos` (1142) |
  | `GET /portal/api/me/events` | 702 | `/me/eventos` (1154) |
  | `GET /portal/api/me/payments` | 714 | `/me/pagamentos` (1166) |
  | `GET /portal/api/me/summary` | 738 | nenhum — `cliente.html` calcula os totais no cliente |
  | `POST /portal/api/contracts` | 356 | nenhum — não há UI de contrato |
  | `POST /portal/api/contracts/:id/upload` | 376 | nenhum — não há UI de upload |
  | `GET /portal/api/clientes/:id` | 826 | nenhum — `editCliente` (`admin.html:635-640`) usa `clientesCache`, não busca do servidor |

- **Impacto**: ~430 linhas de código vivo mas inalcançável, cada uma com sua própria query e tratamento de erro. Dobra a superfície de manutenção e de segurança: uma correção aplicada só na versão PT deixa a versão EN vulnerável, e ambas continuam expostas na rede.
- **Correção proposta**: escolher um idioma (PT, já que é o que o frontend usa) e remover as 13 rotas EN duplicadas. Manter `POST /contracts` e `/contracts/:id/upload` **apenas se** houver intenção de construir a UI de contratos — caso contrário remover também (a UI atual só *lê* contratos, via `/clientes/:id/contratos`).
- **Risco da correção**: médio. Se algum consumidor externo (Postman, script, integração) usa as rotas EN, elas quebram. Mitigação: antes de remover, instrumentar com log de acesso por 1-2 semanas, ou responder 410 Gone com aviso.

#### #16 — Sem framework de migração: o schema congela após o primeiro boot
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Runner em `db/migrate.js` + `migrations/001..004`. `schema_migrations` controla o aplicado; cada arquivo roda em transação junto com seu registro.
- **Arquivos**: `server.js:128-158` · `portal/routes.js:60-146` · `ead/routes.js:28-183`
- **Descrição**: Todo o DDL são 16 blocos `CREATE TABLE IF NOT EXISTS` executados no boot. Não existe nenhum `ALTER TABLE` no projeto — confirmei por grep em todos os `.js` fora de `node_modules`: zero ocorrências. A consequência é que **`IF NOT EXISTS` pula a instrução inteira quando a tabela já existe**: qualquer coluna adicionada ao `CREATE TABLE` depois do primeiro deploy nunca chega ao banco de produção.
- **Assimetria que mascara o problema**: os 23 índices usam `CREATE INDEX IF NOT EXISTS`, que **é** incremental — um índice novo é criado normalmente em um banco já existente. Foi o que aconteceu na última rodada de correções (20 índices novos aplicaram sem incidente). Isso dá a falsa impressão de que o mecanismo de boot também propaga mudanças de coluna. Não propaga.
- **Impacto**: armadilha latente e silenciosa. O dia em que alguém adicionar uma coluna ao `CREATE TABLE` e escrever código que a usa, o comportamento será: funciona no ambiente local (banco novo, tabela criada do zero) e falha em produção com `column "x" does not exist` no primeiro request. Não há como detectar a divergência sem inspecionar o banco manualmente. Também impede a correção de #22 (adicionar `CHECK`) e de #18 (mudar `ON DELETE`) pelo caminho normal.
- **Correção proposta**: adotar migrações versionadas. O caminho mais leve para este projeto — sem adicionar dependência pesada — é uma tabela `schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ)` e um diretório `migrations/` com arquivos `NNN_descricao.sql` aplicados em ordem no boot, dentro de transação, pulando os já registrados. Os `CREATE TABLE IF NOT EXISTS` atuais viram a migração `001`, o que mantém bancos existentes intactos.
- **Risco da correção**: médio, e é o ponto de atenção principal. A migração `001` precisa ser idempotente sobre o banco de produção **atual** — que pode já ter divergido do código. Antes de escrever `001`, extrair o schema real (`\d+` de cada tabela via `psql` no Neon) e comparar coluna a coluna com os `CREATE TABLE` do código. Se houver divergência, ela precisa ser reconciliada explicitamente, não presumida.

#### #18 — 19 das 23 foreign keys sem `ON DELETE`: nenhum usuário pode ser excluído
> **🟡 PARCIAL (Fase 2 — 2026-08-18)** — `migrations/006` aplica CASCADE no que é operacional (progresso, tentativas, matrículas, eventos de lead). Registros financeiros ficaram de fora de propósito — devem sobreviver anonimizados.
- **Arquivos**: `server.js:152` · `portal/routes.js:81,97,98,114,115,130,131` · `ead/routes.js:110,111,129,130,131,143,144,156,157,173,174`
- **Descrição**: Das 23 foreign keys do sistema, apenas 4 declaram comportamento de exclusão — todas em `ead/routes.js`: `ead_modules.course_id` (54), `ead_lessons.module_id` (65) e `ead_quiz_questions.module_id`/`course_id` (82-83), todas `ON DELETE CASCADE`. As outras 19 usam o padrão do PostgreSQL, `NO ACTION`.
- **Impacto**: `DELETE FROM portal_users WHERE id = X` falha com violação de FK se o cliente tiver qualquer contrato, evento, pagamento ou ata. `DELETE FROM ead_users` falha se o aluno tiver qualquer pedido, matrícula, progresso, tentativa de quiz ou certificado — ou seja, sempre, para qualquer aluno real. **Não existe caminho para excluir um titular de dados**, nem por API (não há rota de exclusão de usuário) nem por SQL direto sem apagar manualmente 5 tabelas na ordem certa. Isso vira um problema concreto de LGPD, a ser detalhado na Seção 17 (Bloco F).
- **Correção proposta**: decidir por relação, não em bloco. Dados operacionais que só fazem sentido com o titular (`ead_progress`, `ead_quiz_attempts`, `ead_enrollments`) pedem `ON DELETE CASCADE`. Registros financeiros e fiscais (`ead_orders`, `payments`, `contracts`) não devem sumir — pedem `ON DELETE SET NULL` com a coluna tornada nullable, preservando o histórico contábil anonimizado. `ead_certificates` merece discussão à parte: um certificado emitido é um documento verificável publicamente (`ead/routes.js:811`), apagá-lo quebra a verificação.
- **Risco da correção**: **alto** — é a correção mais delicada do bloco. Depende de #16 (sem migrações não há como alterar constraint). `CASCADE` mal aplicado apaga dados em silêncio; um `DELETE` num cliente levaria junto contratos e pagamentos. Aplicar uma relação por vez, com backup verificado antes, e testar cada uma em cópia do banco.

#### #27 — Assinatura de webhook malformada responde 200 em vez de 401
> **⚪ OBSOLETO (Fase 2 — 2026-08-18)** — O webhook do Mercado Pago foi removido. O do Asaas compara com `timingSafeEqual` após checar tamanho — testado com token vazio, curto e errado: 401 nos três, sem `RangeError`.
- **Arquivo**: `ead/routes.js:1014` · `ead/routes.js:1065-1068`
- **Descrição**: A verificação HMAC compara com `crypto.timingSafeEqual(Buffer.from(receivedHash, 'hex'), Buffer.from(expectedHash, 'hex'))`. `timingSafeEqual` **exige buffers do mesmo tamanho** — com qualquer `v1` que não decodifique para exatamente 32 bytes, ela lança `RangeError` em vez de retornar `false`. Verificado por execução:

  ```
  v1 válido        -> comparou sem lançar
  v1 não-hex ("zz") -> RangeError: Input buffers must have the same byte length
  v1 hex curto      -> RangeError: Input buffers must have the same byte length
  v1 vazio          -> RangeError: Input buffers must have the same byte length
  ```

  O `RangeError` sobe para o `catch` externo (`:1065`), que registra no log e responde **`res.sendStatus(200)`**.
- **Impacto**: em termos de segurança o resultado é o correto — a exceção ocorre antes de qualquer escrita, então nenhuma matrícula é liberada: **continua fail-closed**. O defeito é de protocolo: as três guardas anteriores devolvem 401 corretamente (`:991`, `:1005`, `:1016`), e esta devolve 200. Um atacante sondando o endpoint recebe 200 para lixo e 401 para assinatura bem-formada porém inválida — um oráculo que distingue os dois casos. E o log registra "EAD webhook error" genérico em vez de "assinatura invalida", dificultando o diagnóstico.
- **Correção proposta**: validar o formato antes de comparar — `if (!/^[0-9a-f]{64}$/i.test(receivedHash)) return res.sendStatus(401)` — ou envolver a comparação em try/catch próprio que devolva 401. A primeira é preferível por ser explícita.
- **Risco da correção**: nenhum. A mudança só afeta requisições que hoje já são rejeitadas de fato.

#### #34 — Formulários de lead magnet exibem sucesso mesmo quando o envio falha
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Os dois lead magnets exibem erro com alternativa por WhatsApp, em vez de sucesso falso.
- **Arquivos**: `pages/checklist-iso-9001.html:1070-1073` · `pages/calculadora-roi-certificacao.html:1108-1111`
- **Descrição**: Os dois lead magnets tratam o erro exibindo a tela de sucesso. No checklist:

  ```js
  .catch(function () {
    /* Show success anyway for now (API might not exist yet) */
    form.style.display = "none";
    formSuccess.classList.add("show");
  });
  ```

  Como o `.then` anterior faz `if (!res.ok) throw new Error("Erro no servidor")` (`:1063`), **qualquer** resposta de erro do servidor — 400 de validação, 429 de rate limit, 500 — cai nesse `catch` e vira tela de sucesso. Na calculadora o padrão é idêntico (`:1103` lança, `:1108` mostra sucesso), com o comentário "data will be in server logs", que é falso: se o `fetch` falhou, nada chegou ao servidor para ser logado.
- **Contraste**: o formulário principal da home trata corretamente — `showToast("Erro ao enviar. Tente via WhatsApp.")` (`app.js:229-231`). O defeito está isolado nos dois lead magnets.
- **Impacto**: alto para o negócio. São as duas páginas de captura de topo de funil do site. O visitante preenche, vê "pronto, seu checklist está a caminho", e **o lead nunca existiu** — nem no banco, nem no e-mail de notificação, nem no log. Ninguém do lado da empresa fica sabendo. O rate limit de `/api/contact` é de 5 requisições por minuto por IP (`server.js:166-168`), então uma rajada de tráfego legítimo (campanha, compartilhamento) produz 429 em massa — exatamente o cenário em que os leads são mais valiosos e em que a falha é 100% silenciosa.
- **Correção proposta**: exibir mensagem de erro com caminho alternativo (WhatsApp), no mesmo padrão de `app.js:229`. Se a intenção original era não perder o lead por falha transitória, a solução correta é retentativa com backoff ou gravação em `localStorage` para reenvio, nunca mentir para o usuário.
- **Risco da correção**: nenhum no código. Efeito colateral esperado: a taxa de "sucesso" aparente vai cair para a taxa real — se hoje há falhas, elas passarão a ficar visíveis. Isso é o objetivo, mas convém medir antes e depois para saber o tamanho do problema que estava escondido.

#### #36 — IDOR: marcar aula como concluída não verifica matrícula
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/lesson/:id/complete` verifica matrícula. As 10 checagens do EAD passaram a exigir `revogada_em IS NULL`.
- **Arquivo**: `ead/routes.js:480-496`
- **Descrição**: `POST /ead/api/lesson/:lessonId/complete` exige apenas `requireEadAuth` e grava direto:

  ```js
  const userId = req.session.eadUser.id;
  const lessonId = parseInt(req.params.lessonId, 10);
  await sql`INSERT INTO ead_progress (user_id, lesson_id, completed, completed_at)
            VALUES (${userId}, ${lessonId}, true, NOW()) ON CONFLICT … DO UPDATE …`;
  ```

  Não há consulta a `ead_enrollments`, e `lessonId` não é validado contra curso algum.
- **Contexto que torna isto relevante**: as três rotas irmãs **têm** a checagem — `GET /ead/api/lesson/:lessonId` (`:453`), `GET /ead/api/template/:lessonId` (`:608`) e `POST /ead/api/quiz/:courseSlug/submit` (`:545`). As duas últimas receberam a guarda numa rodada de correção recente. **Esta ficou de fora.** É a última rota da família sem verificação de matrícula.
- **Impacto (avaliado sem exagero)**: o cadastro no EAD é gratuito, então qualquer pessoa obtém a sessão necessária. Com ela pode marcar como concluída qualquer aula de qualquer curso pago. Isso **não** gera certificado — a emissão depende da prova final, que hoje valida matrícula (`:545`). O ganho real é: (a) poluir `ead_progress` com registros de cursos não contratados; (b) pré-concluir um curso e, ao se matricular depois (por exemplo na promoção gratuita), vê-lo como 100% concluído sem ter assistido nada; (c) usar a diferença entre 200 e 500 como oráculo para enumerar quais `lesson_id` existem, já que um ID inexistente viola a foreign key e retorna 500.
- **Correção proposta**: replicar exatamente o padrão de `ead/routes.js:601-609` — buscar `m.course_id` via `JOIN` a partir do `lessonId`, retornar 404 se a aula não existir, consultar `ead_enrollments` e retornar 403 se não houver matrícula. São ~8 linhas, idênticas às já aplicadas na rota de template.
- **Risco da correção**: baixo. Verificar antes se há linhas em `ead_progress` de usuários sem matrícula (`SELECT … FROM ead_progress p JOIN ead_lessons l … LEFT JOIN ead_enrollments e … WHERE e.id IS NULL`) — se houver, decidir se limpa ou preserva antes de fechar a porta.

#### #37 — Fixação de sessão: nenhum dos três logins regenera o identificador
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `session.regenerate()` nos três fluxos de login.
- **Arquivos**: `portal/routes.js:209-215` · `ead/routes.js:328` · `ead/routes.js:368`
- **Descrição**: Os três fluxos que estabelecem identidade atribuem o usuário à sessão existente, sem chamar `req.session.regenerate()`. Grep por `regenerate` no projeto inteiro: **zero ocorrências** (só existe `req.session.destroy` em `portal/routes.js:229`).

  | Fluxo | Linha | O que faz |
  |---|---|---|
  | Login do portal | `portal/routes.js:209` | `req.session.portalUser = {…}` |
  | Registro do EAD | `ead/routes.js:328` | `req.session.eadUser = {…}` |
  | Login do EAD | `ead/routes.js:368` | `req.session.eadUser = {…}` |

- **Impacto**: o identificador de sessão que a vítima carrega **antes** de autenticar continua válido **depois**. Um atacante que consiga fixar um `connect.sid` conhecido no navegador da vítima — via subdomínio comprometido, injeção de `Set-Cookie` em HTTP, ou XSS (#42) — passa a compartilhar a sessão autenticada dela. As mitigações presentes ajudam mas não fecham: `httpOnly` (`server.js:79`) impede leitura por script, `secure` em produção (`:80`) impede injeção via HTTP simples, e `sameSite: 'lax'` (`:78`) limita CSRF. Nenhuma delas impede a reutilização do ID pré-autenticação, que é justamente o que `regenerate()` resolve.
- **Correção proposta**: envolver a atribuição em `req.session.regenerate(err => { … req.session.portalUser = …; req.session.save(cb) })` nos três pontos. Com `connect-pg-simple` isso emite `DELETE` + `INSERT` na tabela `session` — comportamento normal e barato.
- **Risco da correção**: baixo, mas **exige atenção à ordem**: `regenerate()` apaga tudo o que havia na sessão. Como um mesmo navegador pode ter `portalUser` e `eadUser` simultaneamente (são sessões independentes no mesmo cookie, ver #25), regenerar no login do EAD derrubaria uma sessão de portal ativa. Preservar explicitamente o outro objeto ao regenerar, ou aceitar o logout cruzado como decisão consciente.

#### #39 — Rate limit de `/api/contact` é burlado por um header forjado
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `req.ip` em vez do header cru.
- **Arquivo**: `server.js:177`
- **Descrição**: A rota identifica o cliente assim:

  ```js
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  ```

  O header é lido **cru**, direto do request. Como qualquer cliente pode enviar o valor que quiser, basta variar `X-Forwarded-For` a cada requisição para que `checkRate` (`server.js:165-174`) sempre veja um "IP" novo e nunca acione o limite de 5 por minuto.
- **Contraste que confirma o defeito**: o Express está corretamente configurado com `app.set('trust proxy', 1)` (`server.js:62`), e os outros três limitadores usam `req.ip` — `portal/routes.js:37`, `ead/routes.js:212` e `:228` — que respeita essa configuração e resolve o IP real. **Só `/api/contact` lê o header manualmente.**
- **Impacto**: o único formulário público do site fica sem proteção efetiva contra flood. Cada requisição que passa grava um lead, insere um `lead_event` e dispara **dois** e-mails via Resend (`server.js:206-225`) — notificação interna e auto-resposta ao endereço informado. Um script simples enche a base de leads falsos, consome a cota do Resend e transforma o endpoint em amplificador de e-mail: o atacante escolhe o destinatário da auto-resposta, que sai do domínio `anderstech.net`. O honeypot (`website`, `server.js:184`) só barra bots ingênuos.
- **Correção proposta**: trocar por `req.ip`, alinhando com as outras três rotas. Se houver intenção de suportar cadeias de proxy, usar o primeiro elemento **apenas** quando `trust proxy` estiver ajustado ao número real de proxies à frente.
- **Risco da correção**: nenhum no código. Efeito esperado: o limite passa a valer de verdade, então convém confirmar que 5/min por IP não penaliza tráfego legítimo compartilhando NAT corporativo — se penalizar, ajustar o teto, não a identificação.

#### #48 — O CI está vermelho há um mês, e nenhum dos seus gates reprova build
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Removidos os `test -f` de arquivos inexistentes; `node --check` cobre os 16 JS via `git ls-files`; `npm audit` sem `|| true`.
- **Arquivo**: `.github/workflows/ci.yml`
- **Descrição**: Três problemas independentes no mesmo arquivo.

  **(a) O pipeline falha desde 18/07/2026.** O passo `Verify required files exist` executa `test -f sitemap.xml` (`ci.yml:33`), mas `sitemap.xml` **foi removido do repositório** no commit `a92f3ab` — o mesmo que migrou o sitemap para geração dinâmica (`server.js:86-89`, `sitemap.js`). Confirmado por execução:

  ```
  gh run list  →  29664038420  failure  "feat: glossario 83 termos…"  2026-07-18
                  28892963892  success  (commit anterior)
  git log --diff-filter=D -- sitemap.xml  →  a92f3ab
  ```

  Todas as execuções anteriores passavam; a partir desse commit, **toda** execução falha. Hoje é 17/08 — **um mês** de pipeline vermelho. O mesmo passo exige `test -f shared.js` (`ci.yml:32`), arquivo hoje órfão (ver #56): remover o código morto quebra o CI de novo.

  **(b) A verificação de sintaxe cobre 3 de 10 arquivos JS.** São checados `server.js`, `emails.js` e `portal/routes.js` (`ci.yml:22-29`). Ficam de fora, entre outros, **`ead/routes.js` (1149 linhas — o maior do projeto, e o que contém pagamento e webhook)**, `inject.js` (142, criado recentemente), `sitemap.js`, `promo.js`, `glossario/render.js`, `glossario/terms.js` e `app.js`. Um erro de sintaxe em qualquer um deles passaria pelo CI — se o CI estivesse verde.

  **(c) Os dois gates de segurança nunca reprovam.** `npm audit --audit-level=high || true` (`ci.yml:44`) descarta o código de saída; o `Secret scan` emite `::warning::` e termina com sucesso (`ci.yml:60-62`). São informativos disfarçados de gate.
- **Impacto**: um pipeline permanentemente vermelho deixa de ser sinal. Ninguém distingue "quebrou agora" de "está quebrado desde julho", então nenhuma das verificações — sintaxe, vazamento de `.env`, varredura de segredos — está de fato protegendo. As 41 alterações não commitadas em andamento nunca passaram por CI válido.
- **Correção proposta**: na ordem — (1) remover `test -f sitemap.xml` e `test -f shared.js`, devolvendo o pipeline ao verde; (2) trocar a lista fixa por `node --check` sobre todos os `.js` versionados (`git ls-files '*.js' | grep -v node_modules | xargs -n1 node --check`), o que se mantém correto sozinho quando arquivos são criados; (3) remover os `|| true` para que `npm audit` reprove de fato, depois de resolver o que ele apontar hoje.
- **Risco da correção**: baixo nos três passos. Verifiquei o passo (3) executando: `npm audit --omit=dev` retorna **0 `high` e 0 `critical`** (ver #53), então remover o `|| true` com `--audit-level=high` **não** deixaria o build vermelho hoje — a mudança é segura de aplicar junto com (1) e (2).

#### #49 — URLs de retorno e notificação do Mercado Pago fixas em produção
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `APP_URL` e `ASAAS_API_URL` por ambiente.
- **Arquivo**: `ead/routes.js:923,954-956,959`
- **Descrição**: O domínio de produção está embutido nas quatro URLs que o Mercado Pago usa para devolver o controle à aplicação:

  ```js
  notification_url: `https://anderstech.net/ead/api/webhook/mp`,                       // :923 (PIX) e :959 (Checkout Pro)
  back_urls: {
    success: `https://anderstech.net/ead/checkout/sucesso?order=${order[0].id}`,       // :954
    failure: `https://anderstech.net/ead/checkout/erro?order=${order[0].id}`,          // :955
    pending: `https://anderstech.net/ead/checkout/pendente?order=${order[0].id}`,      // :956
  },
  ```

  Não há variável de ambiente para a URL base — grep confirma que `process.env` não é consultado em nenhum desses pontos.
- **Impacto**: torna impossível exercitar o fluxo de pagamento fora de produção. Um checkout iniciado em ambiente local ou de homologação **redireciona o usuário para o site de produção** ao concluir, e manda a notificação do webhook para o servidor de produção — que vai procurar a `ead_order` no banco de produção, não encontrar o ID, e descartar silenciosamente (`ead/routes.js:1029-1030`). Na prática, a única forma de testar pagamento é testar em produção com dinheiro real, o que ajuda a explicar por que os defeitos #26, #27 e #29 do fluxo de pagamento não foram percebidos antes.
- **Correção proposta**: introduzir `APP_URL` (documentada no `.env.example`), com `const BASE = process.env.APP_URL || 'https://anderstech.net'`, e usá-la nas quatro URLs. Vale estender o mesmo tratamento aos links dos e-mails (`ead/routes.js:339,1051`; `emails.js`), onde o efeito é menor mas idêntico.
- **Risco da correção**: baixo, com uma atenção: o `notification_url` precisa ser alcançável pela internet para o webhook chegar. Em desenvolvimento local isso exige túnel (ngrok, Cloudflare Tunnel) — o valor da variável passa a ser a URL do túnel, não `localhost`.

#### #64 — `express.static(__dirname)` publica o projeto inteiro: código-fonte do backend acessível pela web
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `express.static(__dirname)` removido. Verificado: `/server.js`, `/portal/routes.js`, `/package.json`, `/HANDOFF.md` e `/AUDITORIA.md` respondem **404**.
- **Arquivo**: `server.js:100`
- **Descrição**: A linha `app.use(express.static(__dirname, { ...staticOpts, index: false, redirect: false }))` expõe **a raiz do projeto** como diretório web. Sondei o servidor em execução; todos os caminhos abaixo responderam **200 com o conteúdo real**:

  | Caminho | O que entrega |
  |---|---|
  | `/server.js` · `/portal/routes.js` · `/ead/routes.js` | código-fonte completo do backend, incluindo toda a lógica de autorização e de pagamento |
  | `/emails.js` · `/promo.js` · `/sitemap.js` · `/inject.js` · `/glossario/terms.js` | demais módulos do servidor |
  | `/package.json` · `/package-lock.json` | versões exatas de todas as dependências |
  | `/HANDOFF.md` | documento operacional de implantação |
  | `/AUDITORIA.md` | **este relatório** — o mapa completo das vulnerabilidades do sistema |
  | `/ead/seed.js` · `/fix-accents.cjs` | scripts internos |
  | `/portal/admin.html` · `/admin/index.html` | HTML dos painéis administrativos |

  Arquivos que começam com ponto (`.env`, `.gitignore`) retornam 404 — não por configuração deste projeto, mas porque `serve-static` ignora *dotfiles* por padrão. É a única barreira em pé, e ela não foi escolhida.
- **Impacto**: é o achado de maior alcance do relatório. Um atacante lê `portal/routes.js` e `ead/routes.js` e obtém, sem esforço: a lista completa de rotas (incluindo as 16 órfãs de #2), a lógica exata de autorização — o que revela #36 diretamente —, o algoritmo de verificação do webhook (#27), os nomes das tabelas e colunas, e o formato dos identificadores. `package-lock.json` entrega o inventário de dependências para busca de CVE. Se `AUDITORIA.md` for commitado e implantado, publica-se o índice de todos os defeitos conhecidos. Não há segredo em texto claro nos fontes — as chaves vêm de variáveis de ambiente —, e é isso que evita a classificação como crítico; mas a divulgação transforma cada um dos outros achados de "precisa ser descoberto" em "está documentado publicamente".
- **Dimensão de SEO**, que é o motivo de o item nascer neste bloco: como efeito colateral, **toda página passa a ter uma segunda URL** — `/pages/quanto-custa-certificacao-iso.html` responde o mesmo conteúdo de `/quanto-custa-certificacao-iso`, `/blog/o-que-e-iso-9001.html` duplica `/blog/o-que-e-iso-9001`, e `/index.html` duplica `/`. Some-se `/blog/_template.html`, um esqueleto sem conteúdo, e `/ead/pages/*.html`, cascas sem dados. São dezenas de URLs rastreáveis com conteúdo duplicado ou vazio, competindo com as canônicas.
- **Nota de método**: este item pertence tanto à **Seção 5** (divulgação de código-fonte) quanto às **Seções 12 e 13** (conteúdo duplicado). Foi encontrado aqui, no Bloco E, ao sondar as URLs públicas — o Bloco B analisou o código de autorização, não o que o servidor de arquivos estáticos entrega. Registro a origem para que o **Bloco H** avalie se a numeração deve ser reconciliada.
- **Correção proposta**: parar de servir a raiz. O correto é expor apenas os diretórios que contêm recursos públicos — `assets/`, `styles.css`, `app.js`, `robots.txt` e os arquivos de verificação `.txt` —, montando cada um explicitamente em vez de `__dirname`. As páginas já são entregues pelas rotas (`sendPage`, `sendEadPage`), então nada de conteúdo se perde. Enquanto a mudança não vem, um middleware que bloqueie `.js`, `.json`, `.md` e `.cjs` fora de `assets/` reduz a exposição imediata.
- **Risco da correção**: médio, e exige atenção. `app.js`, `styles.css` e `assets/` **precisam** continuar públicos — são carregados por todas as páginas. Migrar caminho a caminho e conferir cada tipo de página (home, blog, pages, glossário, EAD, portal) antes de considerar concluído. O `redirect: false` e `index: false` atuais devem ser preservados no novo mapeamento.

#### #65 — Páginas dos cursos são invisíveis para o Google: título único repetido, sem descrição, sem canônica e sem conteúdo
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/ead/curso/:slug` renderiza title, description, canonical, OG e schema `Course` com `Offer` e preço.
- **Arquivos**: `ead/pages/curso-detail.html` · `ead/routes.js:1101` · `ead/pages/cursos.html`
- **Descrição**: Sondei o HTML efetivamente entregue, sem executar JavaScript — que é o que um rastreador vê na primeira passada:

  ```
  /ead/curso/iso-9001-na-pratica       -> <title>Curso — Anders Tech EAD</title>
  /ead/curso/auditor-interno-iso-9001  -> <title>Curso — Anders Tech EAD</title>
  ```

  As quatro páginas de curso compartilham **o mesmo título**, porque `sendEadPage('curso-detail.html', …)` (`ead/routes.js:1101`) entrega o mesmo arquivo estático para qualquer `:slug`. Levantamento dos elementos, comparado com uma página estática do site:

  | Página | title | description | canonical | H1 | OG | JSON-LD | conteúdo no HTML |
  |---|---|---|---|---|---|---|---|
  | `/quanto-custa-certificacao-iso` | 1 | 1 | 1 | 1 | 1 | 2 | 36 KB, 25 parágrafos |
  | `/ead/cursos` | 1 | 1 | 1 | 1 | **0** | 2 | grade em `class="loading"` |
  | `/ead/curso/:slug` | 1 (repetido) | **0** | **0** | 1 | **0** | 1 | **nenhum** |

  O nome do curso não aparece no HTML de `/ead/curso/:slug` — busca por "ISO 9001 na Prática" retorna zero. Tudo vem depois, por `fetch('/ead/api/courses/'+slug)` (`curso-detail.html:117`).
- **Impacto**: são as páginas de produto — as que vendem os cursos. Para o Google elas se apresentam como quatro URLs distintas com HTML praticamente idêntico, título repetido, sem descrição e sem canônica que resolva a ambiguidade. O resultado esperado é canonicalização automática pelo buscador (ele escolhe uma e descarta as outras) ou exclusão por conteúdo insuficiente. Sem `og:title` e `og:description`, o compartilhamento em WhatsApp e LinkedIn — canal natural para curso técnico — gera prévia genérica. Perde-se CTR na busca, elegibilidade a *rich results* de curso, e a chance de ranquear para "curso auditor interno ISO 9001", que é intenção de compra.
- **Contraste que mostra que o projeto sabe fazer**: as 24 páginas estáticas e os 83 termos do glossário são renderizados no servidor com título, descrição e canônica próprios, e o glossário ainda tem cache (`server.js:365`). A capacidade existe; o EAD ficou fora dela.
- **Correção proposta**: renderizar no servidor o essencial de `/ead/curso/:slug` — buscar o curso pelo slug antes de enviar o HTML e substituir `<title>`, `<meta name="description">`, `<link rel="canonical">` e as tags Open Graph com os dados reais, no mesmo padrão já implementado para a página de certificado (`ead/routes.js:1122-1141`), que faz exatamente isso e funciona. Acrescentar JSON-LD do tipo `Course` com nome, descrição, provedor e preço habilita *rich result*. O conteúdo do corpo pode continuar vindo por JS num primeiro momento; o ganho maior está nas tags.
- **Risco da correção**: baixo — o mecanismo de substituição já existe e está testado na página de certificado. Escapar os valores vindos do banco ao injetar nas tags, reaproveitando a função `esc` de `ead/routes.js:1132`, para não abrir o vetor descrito em #42.

#### #70 — Acentuação perdida em 26 das 36 páginas públicas, inclusive na palavra-chave do negócio
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — **414 correções em 17 páginas**, por lista fechada de palavras cuja forma sem acento não existe. Verificado: slugs, canonicals e os 47 blocos JSON-LD intactos.
- **Arquivos**: 26 arquivos em `pages/` e `blog/` · `fix-accents.cjs` (script órfão que existe para isto)
- **Descrição**: O conteúdo indexado do site tem perda sistemática de acentuação, misturada com texto correto **dentro do mesmo parágrafo**. Amostra literal de `pages/consultoria-iso-9001-bento-goncalves.html`:

  > "A Movergs (**Associacao** das Indústrias de **Moveis** do Estado do Rio Grande do Sul) e o Sindmoveis (Sindicato das Indústrias do **Mobiliario** de Bento **Goncalves**) **sao** as entidades de classe..."

  "Indústrias" está correto; "Associação", "Móveis", "Mobiliário", "Gonçalves" e "são" não. Contagem sobre uma amostra de **25 palavras inequívocas** (excluí casos ambíguos como "e"/"é"):

  | Palavra | Ocorrências | Palavra | Ocorrências |
  |---|---|---|---|
  | `certificacao` | **65** | `medio` | 27 |
  | `agricola` | 23 | `acoes` | 21 |
  | `producao` | 19 | `gestao` | 19 |
  | `especificos` | 15 | `exigencias` | 15 |
  | `gaucho` | 9 | `logistica` | 7 |

  **Total da amostra: 264 ocorrências em 26 de 36 páginas públicas.** O total real é maior — foram 25 palavras de um vocabulário muito mais amplo.
- **Impacto, em duas frentes**:
  - **Credibilidade**: é uma consultoria que vende rigor e conformidade. Texto com erro de português na página de vendas contradiz a proposta de valor de forma direta, e o visitante que está avaliando contratar lê isso antes de qualquer outra coisa.
  - **Busca orgânica**: `certificacao` sem cedilha aparece **65 vezes** — é o termo central do negócio. O Google normaliza acentuação na maioria dos casos, então o dano de ranqueamento é limitado; o dano maior é o trecho exibido no resultado de busca sair com erro, afetando a taxa de clique.
- **Achado correlato**: existe um script `fix-accents.cjs` na raiz — não referenciado por nada (**#56**), cujo cabeçalho diz "Fix Portuguese accent issues in EAD lesson content (database + seed files)". Ele foi escrito exatamente para este problema, aplicado ao conteúdo do EAD, e nunca estendido às páginas do site. O problema é conhecido e a ferramenta existe; faltou concluir.
- **Encoding não é a causa** — verificado: `charset="UTF-8"` está declarado em **51 de 51** arquivos HTML, e o header HTTP responde `Content-Type: text/html; charset=utf-8`. Não há corrupção de codificação (nada de "Ã§"); os caracteres simplesmente não foram digitados.
- **Correção proposta**: adaptar o `fix-accents.cjs` para varrer `pages/` e `blog/`, rodar em modo de simulação primeiro, revisar as substituições propostas e aplicar por lotes de páginas. Revisão humana é indispensável: substituição automática de "e" por "é" ou "sao" por "são" erra em nomes próprios e siglas.
- **Risco da correção**: médio — é o único item deste bloco que mexe em texto publicado. Substituição cega quebra nomes próprios ("São Paulo" já correto, "Sao" em outro contexto) e pode alterar `<title>` e `<meta description>`, mudando o que já está indexado. Aplicar página a página, conferindo o diff, e não tocar em slug nem em URL — mudar slug exigiria 301 que o projeto não tem (**#66**).

#### #71 — Não existe recuperação nem alteração de senha em nenhum dos dois módulos
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/esqueci-senha` e `/redefinir-senha` nos dois módulos, token com hash, validade de 30 min, uso único e resposta genérica contra enumeração.
- **Arquivos**: `portal/routes.js` · `ead/routes.js` · `portal/login.html` · `ead/pages/login.html`
- **Descrição**: Busca por "esqueci", "recuperar senha", "alterar senha", "trocar senha" e "reset" em todo o código: **nenhuma rota, nenhuma tela, nenhum link**. Os únicos resultados são texto de conteúdo dos cursos e do blog. As duas telas de login têm apenas e-mail e senha, sem link de recuperação.
- **Impacto**, que difere entre os módulos:
  - **Portal do cliente**: a senha é **gerada pelo sistema** e enviada por e-mail (`portal/routes.js:263,274-279`). O cliente nunca escolheu a própria senha e não pode trocá-la. Se perder o e-mail ou a senha, a única saída é o administrador criar outro cadastro — o que esbarra na constraint `UNIQUE` do e-mail (`portal/routes.js:66`) e exige intervenção manual no banco. E se o envio do e-mail falhar, o `catch` apenas registra no log (`:280-282`) e a rota devolve 200: existe uma conta cujo dono nunca recebeu a credencial e não tem como recuperá-la (ligado a **#41**).
  - **EAD**: o aluno escolhe a própria senha no cadastro, então a situação é menos grave — mas quem esquecer perde o acesso a um curso comprado com promessa de acesso vitalício, sem autoatendimento.
- **Consequência de segurança**: sem troca de senha, uma credencial comprometida não tem remédio. É o cenário que torna **#41** (senha em texto puro no corpo da resposta) mais sério do que pareceria isoladamente.
- **Correção proposta**: implementar o fluxo padrão nos dois módulos — `POST /…/esqueci-senha` que gera token de uso único com validade curta, grava o hash do token e envia o link por e-mail; `POST /…/redefinir-senha` que valida e troca. A infraestrutura já existe: Resend para envio, `bcrypt` para hash, `crypto.randomBytes` para o token. Acrescentar também "alterar senha" para usuário autenticado, que é mais simples e cobre o caso mais comum.
- **Risco da correção**: médio. Requer tabela nova para os tokens, o que depende de **#16** (sem mecanismo de migração). O endpoint precisa nascer com limitador de taxa e responder de forma idêntica para e-mail existente e inexistente, para não virar oráculo de enumeração de contas.

#### #77 — Estorno e chargeback não revogam matrícula, e o webhook sequer os recebe
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_*` e `PAYMENT_DELETED` revogam a matrícula por marcação (`revogada_em`), preservando histórico e certificado.
- **Arquivos**: `ead/routes.js:1032,1060-1062` · ausência de qualquer revogação em todo o projeto
- **Descrição**: O webhook trata **três** status do Mercado Pago e ignora o resto:

  ```js
  if (payment.status === 'approved') { … matricula … }                                    // :1032
  else if (payment.status === 'rejected' || payment.status === 'cancelled') { … }          // :1060
  ```

  Ficam sem tratamento os status que representam dinheiro devolvido: **`refunded`**, **`charged_back`** e **`in_mediation`**, além de `in_process`, `authorized` e `pending`. Qualquer um deles cai no fim do bloco e recebe `res.sendStatus(200)` — o Mercado Pago entende "processado" e não reenvia.

  Mais grave: busca por `refund`, `estorno`, `charge_back`, `revogar` ou remoção de `ead_enrollments` em todo o projeto retorna **nada**. **Não existe nenhum caminho, em código ou API, que retire o acesso de um aluno.**
- **Impacto**: um cliente que compra um curso, pede reembolso e recebe o dinheiro de volta **mantém acesso vitalício ao conteúdo**. O mesmo vale para chargeback contestado no cartão — o valor volta ao comprador, o Mercado Pago notifica `charged_back`, o sistema responde 200 e não faz nada. O pedido continua marcado como `aprovado` no banco, a matrícula continua ativa, o certificado continua emitível. Não há nem revogação nem registro de que aconteceu: como não existe rota de histórico (**#78**), a descoberta depende de alguém conferir o painel do Mercado Pago manualmente e cruzar com o banco.
- **Relação com outros itens**: o status vindo do gateway é gravado cru (`SET status = ${payment.status}`, `:1061`), sem mapeamento e sem `CHECK` no banco (**#22**) — então mesmo os status tratados entram misturando idiomas (`aprovado`, `pendente` em português; `rejected`, `cancelled` em inglês). E a ausência de transação no caminho de aprovação (**#26**) significa que nem o estado de sucesso é garantido.
- **Correção proposta**: tratar explicitamente os status de devolução — em `refunded`, `charged_back` e `in_mediation`, gravar o status mapeado e **remover a matrícula** (ou marcá-la como revogada, preservando o histórico), dentro da mesma transação proposta em #26. Definir a regra de negócio antes de codificar: em `in_mediation` o dinheiro ainda não voltou, e suspender acesso durante a disputa pode ser indesejado — talvez apenas sinalizar. Mapear todos os status do gateway para um vocabulário interno em vez de gravar o valor cru.
- **Risco da correção**: médio. Revogar acesso é ação destrutiva do ponto de vista do cliente: um `charged_back` disparado por engano tiraria o curso de quem pagou. Preferir marcação (`ead_enrollments.revogada_em`) a `DELETE`, o que preserva o histórico, permite reverter e mantém o certificado verificável se já emitido.

#### #3 — Filtros de eventos e pagamentos são enviados mas ignorados pelo backend
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/eventos` e `/pagamentos` aceitam `cliente_id`, `data_de` e `data_ate`, com filtro real de intervalo.
- **Arquivos**: `portal/admin.html:666-670` e `portal/admin.html:733-735` (envio) · `portal/routes.js:951` e `portal/routes.js:1047` (leitura)
- **Descrição**: `loadEventos()` monta a query string com `params.set('cliente_id', cid)`, `params.set('data_de', de)` e `params.set('data_ate', ate)`. O handler `GET /portal/api/eventos` lê apenas `const { client_id, contract_id } = req.query` (`portal/routes.js:951`) — nenhum dos três nomes bate, e não existe filtro de intervalo de datas na query. Mesmo padrão em `loadPagamentos()`: envia `cliente_id`, o handler lê `client_id` (`portal/routes.js:1047`).
- **Impacto**: os três filtros da tela de Eventos e o filtro da tela de Pagamentos não têm nenhum efeito — a lista completa é sempre retornada. Com o crescimento da base, a tela passa a trafegar todos os eventos/pagamentos de todos os clientes em toda abertura.
- **Correção proposta**: alinhar os nomes (decidir por `cliente_id` no backend, coerente com #6) e implementar o filtro de intervalo: `WHERE data >= ${data_de} AND data <= ${data_ate}`.
- **Risco da correção**: baixo se feito junto com #6. Fazer só no backend (aceitar `cliente_id`) sem tocar no resto mantém a inconsistência de nomenclatura.

---

### MÉDIO

#### #17 — Tabela `leads` sem nenhum índice, filtrada e ordenada por 6 colunas
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `migrations/002_indices_leads.sql` — 5 índices.
> **Severidade revisada no Bloco H (ALTO → MÉDIO)**: é degradação **latente**, sem impacto no volume atual, e a correção é uma linha por índice. ALTO estava reservado a problemas com efeito hoje.
- **Arquivos**: `server.js:130-148` (schema, sem índices) · `server.js:266-270,294-302,317` (queries)
- **Descrição**: `leads` e `lead_events` são as duas únicas tabelas do sistema sem um único `CREATE INDEX` — todos os 23 índices existentes estão em `portal/routes.js` e `ead/routes.js`. As queries sobre `leads` filtram e agregam por:

  | Coluna | Onde | Tipo de acesso |
  |---|---|---|
  | `status` | `server.js:294,296` + `GROUP BY` em `:270` | filtro + agregação |
  | `interesse` | `server.js:294,298` + `GROUP BY` em `:269` | filtro + agregação |
  | `source` | `server.js:300` + `GROUP BY` em `:268` | filtro + agregação |
  | `created_at` | `ORDER BY` em `:294-302`, `WHERE >=` em `:266`, `ORDER BY` em `:267` | ordenação + range |
  | `lead_events.lead_id` | `server.js:317` | `WHERE` de detalhe |

- **Impacto**: `GET /api/admin/stats` dispara 6 queries em paralelo (`server.js:264-271`), todas seq scan sobre a tabela inteira; `GET /api/admin/leads` faz seq scan + sort a cada abertura do painel. Irrelevante com centenas de leads, degrada de forma perceptível na casa dos milhares — que é exatamente o cenário de sucesso do funil que o site inteiro existe para alimentar.
- **Correção proposta**: `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`, `idx_leads_status ON leads(status)`, `idx_leads_interesse ON leads(interesse)`, `idx_leads_source ON leads(source)` e `idx_lead_events_lead_id ON lead_events(lead_id)`.
- **Risco da correção**: baixo — `CREATE INDEX IF NOT EXISTS` é idempotente e aplica incrementalmente (ver #16). Em tabela grande, considerar `CONCURRENTLY` para não travar escrita; com o volume atual não é necessário.

#### #63 — Zero testes, zero linter, zero dependências de desenvolvimento
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — 10 testes em `node --test`, ligados ao `npm test` e ao CI.
- **Arquivos**: `package.json:6-10,11-25` · ausência de `*.test.js`, `*.spec.js`, `__tests__/`, config de linter
- **Descrição**: Levantamento executado:

  ```
  npm test                     -> npm error Missing script: "test"
  find . -name "*.test.js" …   -> nenhum arquivo
  devDependencies              -> "nenhuma"
  eslint/prettier/biome/.editorconfig -> nenhum
  ```

  Os três scripts existentes são `start`, `dev` e `seed` (`package.json:7-9`). Não há framework de teste, nenhum arquivo de teste, nenhuma dependência de desenvolvimento e nenhuma ferramenta de análise estática ou formatação.
- **Impacto**: nenhum comportamento do sistema é verificado automaticamente. Isso pesa de forma desigual — não é a mesma coisa para uma landing page estática e para os dois módulos que movimentam dado sensível:
  - **Pagamento** (`ead/routes.js:880-1069`): o fluxo com maior consequência do projeto, e o único caminho de verificação hoje é executar em produção com dinheiro real, porque as URLs de callback estão fixas em produção (**#49**). Os três defeitos de integridade encontrados no Bloco B — webhook sem transação (#26), assinatura malformada devolvendo 200 (#27), corrida na matrícula (#29) — são todos detectáveis por teste de unidade sobre a função de webhook, sem tocar no Mercado Pago.
  - **Autorização** (`portal/routes.js`, `ead/routes.js`): #36 é literalmente uma rota que ficou sem a checagem que as três irmãs têm. Um teste parametrizado sobre "toda rota que recebe `lessonId` exige matrícula" teria apontado.
  - **Contratos de dados**: os 10 achados da Seção 2 são divergências de nome entre o que o frontend envia e o que o backend lê. Um único teste de integração por entidade — criar cliente, evento, pagamento e ata via HTTP — falharia em três dos quatro (#6) na primeira execução.
- **Agravante**: combinado com **#48** (CI vermelho desde 18/07), o projeto não tem **nenhuma** verificação automática ativa — nem teste, nem lint, nem sintaxe, nem auditoria de dependência. As 41 alterações não commitadas em andamento não passaram por nenhuma delas.
- **Correção proposta**: começar pequeno e pelo que dói mais, não por cobertura ampla. Sugestão de ordem: (1) `node --test` (nativo, sem dependência nova) com testes de integração HTTP das 4 entidades do portal — pegaria #1, #6 e #7 de uma vez; (2) testes de unidade do webhook do Mercado Pago com payload sintético, cobrindo assinatura válida, inválida, malformada e falha parcial; (3) um teste que percorre as rotas do EAD e exige checagem de matrícula onde há `lessonId`/`courseSlug`. Só depois pensar em linter.
- **Risco da correção**: baixo — adicionar teste não altera comportamento. O ponto de atenção é o ambiente: os testes de integração precisam de um banco descartável (Neon branch ou Postgres em contêiner), e hoje não existe configuração para isso. Resolver junto com #49, que é o mesmo problema de "não há ambiente que não seja produção".

#### #38 — `/uploads` autentica mas não autoriza: qualquer usuário do portal baixa o contrato de qualquer cliente
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/uploads` virou rota com resolução de dono, `Content-Disposition: attachment` e `nosniff`.
- **Arquivos**: `server.js:101-104` · `portal/routes.js:376-392`
- **Descrição**: A pasta de uploads passou a exigir sessão:

  ```js
  app.use('/uploads', (req, res, next) => {
    if (!req.session?.portalUser) return res.status(401).send('Nao autorizado');
    next();
  }, express.static(join(__dirname, 'uploads'), staticOpts));
  ```

  A guarda verifica **autenticação**, não **propriedade**. Qualquer cliente logado que conheça ou adivinhe o caminho `/uploads/<uuid>.pdf` recebe o arquivo, independentemente de a quem o contrato pertence.
- **Atenuante real**: o nome é `crypto.randomUUID()` (`portal/routes.js:30`) — 122 bits de entropia, inviável de adivinhar. Na prática o vazamento exige que o caminho tenha escapado por outro canal: `arquivo_path` é devolvido em `/portal/api/me/contratos` (só ao dono ✅), mas também em `/portal/api/clientes/:id/contratos` e no `SELECT *` de `/portal/api/clientes/:id` — ambos restritos a admin ✅. Ou seja, hoje não há caminho conhecido de exposição do UUID a um cliente que não seja o dono.
- **Severidade revisada no Bloco H (ALTO → MÉDIO)**: na primeira passada classifiquei como ALTO pelo tipo de documento envolvido. Reavaliando com ceticismo: **não há caminho conhecido** que entregue o UUID a um usuário que não seja o dono — todas as rotas que expõem `arquivo_path` são restritas ao próprio cliente ou a admin, e o nome tem 122 bits de entropia. Sem trajetória de exploração demonstrável, ALTO superestima. Fica MÉDIO, pelo motivo abaixo.
- **Por que permanece relevante**: a segurança está apoiada inteiramente no sigilo da URL, não em uma verificação. Basta um log de acesso compartilhado, um histórico de navegador, um `Referer` vazado, ou uma futura rota que liste contratos de forma mais ampla, para que o controle deixe de existir — sem que ninguém precise mudar o código de autorização, porque ele não existe. São documentos contratuais de clientes.
- **Correção proposta**: substituir o `express.static` por uma rota que resolva o dono — `GET /uploads/:filename` que consulte `SELECT client_id FROM contracts WHERE arquivo_path = ${'/uploads/'+filename}` e sirva o arquivo apenas se `client_id === req.session.portalUser.id` ou o papel for `admin`, com `res.sendFile`. Ver também #44, que trata de onde esses arquivos vivem.
- **Risco da correção**: baixo. Confirmar que `payments.comprovante_path` (hoje órfã, #23) seja incluída na resolução caso venha a ser usada.

#### #28 — 22 rotas mascaram banco ausente como sucesso, e não há healthcheck
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Rotas admin respondem **503** em vez de 200 com dados vazios.
- **Arquivos**: `portal/routes.js` (17 ocorrências) · `ead/routes.js` (3) · `server.js:160-162,262,287`
- **Descrição**: O padrão `if (!sql) return res.json([])` / `res.json({ …zeros })` aparece em 22 rotas. Nesse estado o sistema responde **HTTP 200 com lista vazia ou totais zerados** — indistinguível, para o frontend, de "não há dados cadastrados".
- **Correção feita na revisão final (Bloco H)**: a versão original deste item afirmava que "uma falha de banco se apresenta como os dados sumiram". **Isso estava errado**, e a verificação mostra por quê: `sql` é avaliado **uma única vez, no carregamento do módulo** (`server.js:125`, `portal/routes.js:16`, `ead/routes.js:14`), e só é `null` quando `DATABASE_URL` está **ausente**. Com a variável presente e o banco fora do ar, a query lança, cai no `catch` da rota e responde **500** — que é o comportamento correto. O cenário de "200 com dados vazios" é, portanto, **erro de configuração no deploy**, não indisponibilidade em tempo de execução. O item foi rebaixado de ALTO para MÉDIO em função disso.

  Os casos mais graves são os agregados: `/portal/api/dashboard` devolve `{total_clients: 0, total_hours: 0, total_revenue: 0, pending_value: 0}` (`portal/routes.js:646`) e `/portal/api/me/summary` devolve zeros (`:739`). Um admin abrindo o painel com o banco fora do ar vê um negócio sem clientes e sem receita, apresentado como fato.
- **Agravante**: a inicialização usa `initDB().catch(console.error)` (`server.js:160-162`) — se a criação das tabelas falhar, o erro vai para o log e **o servidor sobe normalmente** e passa a aceitar tráfego. Não existe endpoint de healthcheck em lugar nenhum do projeto (grep por `health`/`healthz`/`ping`: zero ocorrências), então nem a plataforma nem um monitor externo têm como detectar o estado degradado.
- **Impacto**: um deploy sem `DATABASE_URL` sobe silenciosamente e apresenta o negócio como vazio — dashboard com zero clientes e zero receita, portal do cliente sem contratos. Nada falha visivelmente, então o erro de configuração pode passar despercebido por horas. É um cenário estreito, mas de diagnóstico confuso quando ocorre.
- **Correção proposta**: devolver **503** com corpo `{ error: 'Serviço temporariamente indisponível' }` nas rotas de leitura quando `sql` for nulo, e o frontend exibir estado de erro em vez de estado vazio. Adicionar `GET /healthz` que faça `SELECT 1` e devolva 200/503, apontando o healthcheck do Railway para ele.
- **Risco da correção**: baixo. Verificar antes se algum ambiente roda deliberadamente sem `DATABASE_URL` (o `MemoryStore` de sessão em `server.js:72` sugere que o modo sem banco é intencional para desenvolvimento local) — nesse caso, o 503 é o comportamento correto mesmo assim, apenas mais barulhento no dev.

#### #29 — Matrícula gratuita: `SELECT` seguido de `INSERT` sem transação nem `ON CONFLICT`
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Chave de idempotência na criação da cobrança, reaproveitamento de pedido pendente e `ON CONFLICT` na matrícula.
- **Arquivos**: `ead/routes.js:890-899`
- **Descrição**: O caminho de matrícula durante a promoção faz três operações sequenciais sem atomicidade: verifica se já existe matrícula (`:890`), insere o pedido (`:894-897`) e insere a matrícula (`:898`). Duas requisições concorrentes passam pela verificação antes de qualquer inserção. A primeira grava; a segunda viola `UNIQUE(user_id, course_id)` de `ead_enrollments` (`ead/routes.js:133`) e cai no `catch` genérico, respondendo 500 "Erro no checkout".
- **Contraste**: o webhook usa `ON CONFLICT DO NOTHING` na mesma inserção (`ead/routes.js:1037`). O caminho da promoção não usa.
- **Resultado da corrida**: o usuário **fica matriculado** (a primeira requisição venceu) mas **vê uma mensagem de erro**, e o banco fica com uma `ead_orders` órfã com `status = 'aprovado'` e `valor = 0` sem matrícula correspondente — poluindo qualquer contagem de pedidos aprovados.
- **Mitigação existente**: o frontend desabilita o botão no clique (`ead/pages/checkout.html:118`), o que cobre o duplo clique comum. Não cobre duas abas abertas, retomada de requisição em rede instável, nem chamada direta à API.
- **Correção proposta**: acrescentar `ON CONFLICT (user_id, course_id) DO NOTHING` ao `INSERT` da matrícula e envolver as duas escritas em `sql.transaction(...)`. Se a matrícula já existir, responder sucesso — o estado final desejado foi atingido, que é o comportamento idempotente correto.
- **Risco da correção**: baixo. Mesmo padrão já validado no webhook.

#### #30 — Dez rotas de listagem sem paginação, e um `?limit` enviado e ignorado
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `limit`/`offset` em eventos e pagamentos; `LIMIT 500` nas rotas `/me/*`.
- **Arquivos**: `portal/routes.js:726,936,949,1045,1111,1142,1154,1166` · `ead/routes.js:253,389` · `portal/admin.html:1056` (envia `?limit=50`)
- **Descrição**: Apenas 3 das 13 rotas de listagem implementam `limit`/`offset`: `/portal/api/clients` (`:241`), `/portal/api/clientes` (`:770`) e `/api/admin/leads` (`server.js:290`). As demais fazem `SELECT` sem limite e devolvem a tabela inteira:

  | Rota | Linha | Escopo do `SELECT` |
  |---|---|---|
  | `/portal/api/eventos` | 949 | todos os eventos de todos os clientes |
  | `/portal/api/pagamentos` | 1045 | todos os pagamentos |
  | `/portal/api/atas` | 1111 | todas as atas |
  | `/portal/api/clientes/:id/contratos` | 936 | todos os contratos do cliente |
  | `/portal/api/me/contratos` · `/me/eventos` · `/me/pagamentos` · `/me/atas` | 1142, 1154, 1166, 726 | todo o histórico do cliente |
  | `/ead/api/courses` · `/ead/api/my-courses` | 253, 389 | catálogo e matrículas |

- **Agravante**: `loadEventosForSelect` envia `apiFetch('/eventos?limit=50')` (`portal/admin.html:1056`) — o parâmetro é ignorado pelo handler, que não lê `req.query.limit`. É o mesmo defeito de #3 (parâmetro enviado e descartado), aqui com consequência de volume.
- **Impacto**: hoje é irrelevante — a base é pequena. Cresce de forma direta com o uso: o portal do cliente carrega **todo** o histórico de eventos e pagamentos a cada abertura, e a tela de eventos do admin puxa a tabela inteira mais o `JOIN` com `portal_users`. As rotas do EAD (`/courses`, `/my-courses`) são naturalmente pequenas e não preocupam.
- **Correção proposta**: aplicar o mesmo padrão já existente — `Math.min(parseInt(req.query.limit, 10) || 100, 500)` — nas 8 rotas do portal, e fazer o frontend paginar. Priorizar `/eventos` e `/pagamentos`, que são as que crescem sem teto.
- **Risco da correção**: médio, e vale atenção: o frontend hoje calcula totais somando o array recebido (`portal/cliente.html:679-680`, `admin.html:1056`). Introduzir paginação **sem** mover a soma para o backend faz os totais passarem a refletir apenas a página atual — trocaria um problema de performance por um de dado errado. Mover as agregações para SQL antes de paginar.

#### #31 — `PATCH /api/admin/leads/:id` sem nenhuma validação de entrada
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `notes` validado como texto e `status` contra `STATUS_LEAD`.
- **Arquivo**: `server.js:331-351`
- **Descrição**: A rota lê `const { status, notes } = req.body` (`:331`) e grava direto no banco. Dois defeitos:

  1. **`notes.slice(0, 200)` sem guarda de nulo** (`:348`): a guarda é `notes !== undefined`, então um corpo `{"notes": null}` entra no ramo e executa `null.slice(0, 200)` → `TypeError` → `catch` → **500** "Erro ao atualizar lead". O correto seria 400. Como o erro ocorre dentro do callback de `sql.transaction` (`:340`), a transação é abortada e nada é gravado — o efeito colateral está contido, mas a resposta é enganosa.
  2. **`status` aceita qualquer string**: não há lista de valores permitidos nem no código nem no banco (ver #22). Um `PATCH {"status": "qualquer coisa"}` grava, e o valor passa a aparecer no `GROUP BY status` de `/api/admin/stats` (`server.js:270`) como se fosse categoria legítima.

- **Impacto**: baixo em exposição — a rota exige `ADMIN_KEY` (`server.js:237-248`). É um problema de robustez e de integridade de relatório, não de segurança. O painel só envia valores da própria lista, então o caminho pela UI é seguro.
- **Correção proposta**: validar antes de gravar — `if (notes !== undefined && typeof notes !== 'string') return res.status(400)` e `if (status !== undefined && !STATUS_VALIDOS.includes(status)) return res.status(400)`, com `STATUS_VALIDOS` extraído para constante compartilhada com o `<select>` do painel.
- **Risco da correção**: baixo. Levantar a lista de `status` já existentes no banco antes de fixar o enum, para não rejeitar valores legítimos criados antes da validação.

#### #32 — `POST /ead/api/quiz/:courseSlug/submit` quebra com 500 se `answers` faltar
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — 400 quando `answers` falta, em vez de 500.
- **Arquivo**: `ead/routes.js:538,557`
- **Descrição**: A rota desestrutura `const { answers, isFinal, moduleId } = req.body` (`:538`) sem validar, e mais adiante executa `const userAnswer = answers[String(q.id)]` dentro do `map` (`:557`). Um corpo `{"isFinal": true}` sem `answers` produz `TypeError: Cannot read properties of undefined` → `catch` → 500 "Erro ao processar quiz".
- **Detalhe relacionado**: `moduleId` também vem do corpo sem validação e é usado direto na query (`:552`), sem verificar se o módulo pertence ao curso da URL. Um aluno matriculado no curso A pode submeter respostas para um módulo do curso B; a tentativa é gravada em `ead_quiz_attempts` com `module_id` de outro curso — sem consequência prática hoje porque esse caminho não é exercitado pela UI (#4) e a coluna não tem FK (#20).
- **Impacto**: baixo. Não é alcançável pela interface (`player.html:565` sempre envia `answers`), e o erro não corrompe estado — o `INSERT` da tentativa vem depois do ponto de falha.
- **Correção proposta**: `if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Respostas não enviadas' })`, e validar que `moduleId` pertence ao curso (`SELECT 1 FROM ead_modules WHERE id = ${moduleId} AND course_id = ${courseId}`).
- **Risco da correção**: nenhum.

#### #40 — Os quatro limitadores de taxa crescem sem limite na memória e zeram a cada deploy
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Varredura periódica com `unref()` nos quatro limitadores.
- **Arquivos**: `server.js:164-174` · `portal/routes.js:35-51` · `ead/routes.js:210-224` · `ead/routes.js:226-240`
- **Descrição**: Os quatro controles usam `Map` em memória do processo. Grep por `delete`, `clear` ou `setInterval` sobre esses mapas: **nenhuma ocorrência**. Uma vez criada, a entrada de um IP nunca é removida — nem quando a janela expira. Em `server.js:169-172` o array de timestamps é filtrado a cada acesso, mas a chave permanece no `Map` para sempre; nos outros três, o objeto `{start, count}` é sobrescrito quando a janela vence, mas a chave também nunca sai.
- **Impacto, em três frentes**:
  1. **Vazamento de memória** — crescimento monotônico proporcional ao número de IPs distintos vistos desde o último restart. Com o bypass de #39, um atacante controla diretamente esse crescimento em `server.js`, já que cada `X-Forwarded-For` inventado vira uma chave permanente.
  2. **Não sobrevive a restart** — todo deploy zera os contadores. Como o Railway reinicia a cada publicação, os limites de login e registro são efetivamente reiniciados junto.
  3. **Não escala horizontalmente** — com duas instâncias, cada uma conta separadamente e o limite real vira o dobro do configurado.
- **Correção proposta**: mover o estado para o PostgreSQL, que já é dependência e já hospeda as sessões — uma tabela `rate_limits (key TEXT, window_start TIMESTAMPTZ, count INT)` com limpeza periódica resolve os três pontos de uma vez. Se a preferência for manter em memória, ao menos varrer entradas expiradas com `setInterval` e limitar o tamanho do `Map`.
- **Risco da correção**: baixo a médio. A versão em banco adiciona uma consulta por requisição em rotas sensíveis; medir antes de aplicar em `/api/contact`, que é a de maior volume.

#### #41 — Senha temporária do cliente trafega no corpo da resposta HTTP
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `senha_temporaria` fora da resposta; devolve `email_enviado`.
- **Arquivos**: `portal/routes.js:285-288` · `portal/routes.js:817-820`
- **Descrição**: As duas rotas de criação de cliente devolvem a senha em texto puro:

  ```js
  res.json({ ...result[0], senha_temporaria: rawPassword });
  ```

  A senha já foi enviada por e-mail logo antes (`portal/routes.js:274-279`), então o campo é redundante. E ele **não é consumido**: grep por `senha_temporaria` em todo o frontend retorna zero ocorrências — o painel exibe apenas "Criado com sucesso" (`portal/admin.html:1155`).
- **Impacto**: a credencial passa a existir em toda camada que toque a resposta — logs de proxy, ferramentas de APM, histórico do DevTools, cache de rede. É credencial em texto puro num canal que não foi projetado para segredo, sem nenhum benefício em troca, já que ninguém a lê. A geração em si está correta (`crypto.randomBytes(8)`, `portal/routes.js:263`) e o armazenamento também (`bcrypt.hash(…, 10)`, `:264`).
- **Agravante adjacente**: se o envio pelo Resend falhar, o `catch` apenas registra no log (`portal/routes.js:280-282`) e a rota segue devolvendo 200. Como o painel não mostra a senha, ela se perde: existe uma conta cujo dono nunca recebeu a credencial, e não há rota de redefinição de senha em nenhum dos dois módulos.
- **Correção proposta**: remover `senha_temporaria` da resposta. Para cobrir a falha de e-mail, propagar o resultado do envio (`{ email_enviado: false }`) e o painel oferecer reenvio — sem nunca exibir a senha em tela.
- **Risco da correção**: baixo. Confirmar que nenhum script ou coleção de Postman dependa do campo antes de removê-lo.

#### #42 — Portal do cliente monta HTML sem escapar; nenhuma página do EAD tem função de escape
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `esc()` em `cliente.html` e nas páginas do EAD.
- **Arquivos**: `portal/cliente.html:632-633,654-655,681-682,734-735,790-791,830,834` · `ead/pages/cursos.html:207-223` · `ead/pages/curso-detail.html:175-190`
- **Descrição**: `portal/cliente.html` **não possui função de escape** — grep por `function esc` retorna zero. Ele concatena valores vindos do banco em strings de HTML e atribui via `innerHTML`:

  ```js
  html += '<tr>' + '<td>' + fmtDate(e.data) + '</td>'
        + '<td>' + (e.descricao || e.titulo || '-') + '</td>' …   // cliente.html:682-684
  ```

  `descricao` e `observacoes` são escritos pelo admin no painel; `titulo` de contratos idem. As páginas do EAD seguem o mesmo padrão com `c.titulo`, `c.subtitulo` e `c.descricao` (`cursos.html:218-221`).
- **Contraste**: `portal/admin.html` **tem** `esc()` (`:435-440`, via `textContent` de um elemento auxiliar) e o aplica de forma consistente. A defesa existe em um lado do portal e não existe no outro.
- **Impacto, avaliado com honestidade**: a origem do dado é confiável hoje. No portal, quem escreve `descricao` é o próprio administrador do negócio — o vetor seria admin atacando o próprio cliente, ou um admin comprometido. No EAD não existe interface de edição de curso: o conteúdo vem dos seeds, controlados por quem tem acesso ao repositório. Portanto **não há exploração prática no estado atual** — é ausência de defesa em profundidade, não vulnerabilidade ativa. O que eleva para MÉDIO é a combinação: a vítima é externa (o cliente), o payload seria persistente, e a CSP autoriza `'unsafe-inline'` em `script-src` (`server.js:45`), de modo que um `<script>` injetado executaria sem obstáculo. Um XSS aqui encadeia diretamente com #37 (fixação de sessão).
- **Correção proposta**: portar a `esc()` de `portal/admin.html:435` para `cliente.html` e aplicá-la em todos os valores interpolados; nas páginas do EAD, adotar a mesma função. Onde o texto é puro, preferir `textContent` — o modal de ata já faz certo (`cliente.html:753-754`).
- **Risco da correção**: baixo, mas mecânico e extenso: são **12** pontos de interpolação em `cliente.html` e ~10 no EAD. Escapar conteúdo que hoje contém HTML intencional quebraria a renderização — verificar `ead_lessons.conteudo`, que é HTML por natureza e é injetado no player, e que **deve** permanecer sem escape (com a ressalva de que sua origem precisa continuar restrita).

#### #43 — Upload valida o tipo declarado pelo cliente e monta o nome com a extensão original
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Extensão derivada do MIME permitido, não de `originalname`.
- **Arquivo**: `portal/routes.js:20-32`
- **Descrição**: Dois pontos:

  ```js
  fileFilter: (_req, file, cb) => { if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true); … }   // :24-27
  filename: (_req, file, cb) => cb(null, crypto.randomUUID() + extname(file.originalname)),            // :30
  ```

  `file.mimetype` é o `Content-Type` que o próprio cliente declara na parte do multipart — não é inferido do conteúdo. E `extname(file.originalname)` deriva a extensão gravada em disco de outro campo controlado pelo cliente, sem lista de permissão.
- **Impacto**: enviando `Content-Type: application/pdf` com `filename="x.html"`, o arquivo é aceito e gravado como `<uuid>.html`. Servido por `express.static` a partir de `/uploads` (`server.js:104`), recebe `Content-Type: text/html` — e o `X-Content-Type-Options: nosniff` do Helmet não ajuda, porque o tipo está correto para a extensão. Resultado: HTML arbitrário executando na origem `anderstech.net`, com acesso ao cookie de sessão de qualquer usuário do portal que abra o link (#38).
- **Atenuante**: a rota exige `requireAdmin` (`portal/routes.js:376`), então o atacante precisa já ser administrador. É escalada lateral a partir de posição privilegiada, não entrada inicial. O limite de tamanho **está** correto (10 MB, `:23`).
- **Correção proposta**: validar a extensão contra lista fixa derivada do MIME permitido, em vez de copiar a do nome original; conferir os magic bytes do conteúdo; e servir uploads sempre com `Content-Disposition: attachment` e `Content-Type: application/octet-stream`, o que neutraliza a execução independentemente da extensão. A rota proposta em #38 é o lugar natural para isso.
- **Risco da correção**: baixo. Arquivos já gravados mantêm a extensão antiga — varrer `uploads/` por extensões fora da lista antes de considerar fechado.

#### #44 — `uploads/` fora do `.gitignore`, em repositório público e filesystem efêmero
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `uploads/` no `.gitignore`.
- **Arquivos**: `.gitignore` · `portal/routes.js:22,29` · `server.js:104`
- **Descrição**: Três fatos verificados que se combinam mal:
  1. O repositório é **público** — `gh repo view` retorna `"visibility": "PUBLIC"`.
  2. `uploads/` **não está** no `.gitignore` (`git check-ignore uploads/` não casa). O `.gitignore` cobre `node_modules/`, `.env`, `.DS_Store`, `Thumbs.db`, `*.zip`, `.claude/`, `_ul*` e `.streamlit/`.
  3. O destino dos uploads é o próprio diretório do projeto (`join(projectRoot, 'uploads')`, `portal/routes.js:22`), dentro da árvore versionada.

  Hoje a pasta está vazia e nada foi commitado (`git ls-files uploads/` não retorna nada), então **não há vazamento consumado**.
- **Impacto**: um `git add -A` executado após qualquer teste local de upload publica contratos de clientes no GitHub. É um passo de rotina, sem nenhuma barreira, com consequência irreversível — conteúdo em repositório público deve ser tratado como divulgado mesmo após remoção, porque permanece no histórico e em réplicas.
- **Problema operacional no mesmo ponto**: em Railway o filesystem do contêiner é efêmero. Gravar em `projectRoot/uploads` significa que **todo contrato enviado desaparece no próximo deploy**, enquanto `contracts.arquivo_path` continua apontando para o arquivo ausente. Isso não é hipótese de segurança, é perda de dado no fluxo normal de publicação. Aprofundamento na Seção 18 (Bloco G/F).
- **Correção proposta**: acrescentar `uploads/` ao `.gitignore` imediatamente — é uma linha e elimina o risco de publicação acidental. Em paralelo, migrar o armazenamento para serviço externo (S3, R2, Supabase Storage) ou volume persistente do Railway, que resolve a efemeridade e tira os arquivos da árvore do projeto de uma vez.
- **Risco da correção**: nenhum para o `.gitignore`. A migração de storage é mudança de arquitetura: exige reescrever a rota de upload, a de download (#38) e migrar `arquivo_path` — planejar como item próprio.

#### #53 — Quatro vulnerabilidades conhecidas nas dependências, nenhuma alta, todas transitivas
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `npm audit fix` — de 4 vulnerabilidades para **0**.
- **Arquivos**: `package.json:11-25` · `package-lock.json`
- **Descrição**: Executei `npm audit --omit=dev`. Resultado: **4 vulnerabilidades — 1 baixa, 3 moderadas, 0 altas, 0 críticas**. Todas são transitivas; nenhuma dependência declarada diretamente está comprometida.

  | Severidade | Pacote | Origem | Advisory |
  |---|---|---|---|
  | moderada | `@opentelemetry/core` `<2.8.0` | `@sentry/node` | Alocação de memória sem limite na propagação de W3C Baggage |
  | moderada | `@opentelemetry/resources` | idem (depende do anterior) | — |
  | moderada | `@opentelemetry/sdk-trace-base` | idem | — |
  | baixa | `body-parser` `2.0.0–2.2.2` | `express` 5 | DoS quando um valor de `limit` inválido desativa silenciosamente a checagem de tamanho |

- **Aplicabilidade real a este projeto** — as duas merecem contexto, porque o número bruto superestima o risco:
  - **`body-parser`**: o problema só se manifesta com um `limit` inválido. Aqui o valor é `express.json({ limit: '100kb' })` (`server.js:61`), sintaticamente válido, então a checagem de tamanho está ativa e o vetor não se aplica na configuração atual.
  - **`@opentelemetry/*`**: chega pela cadeia do Sentry, que é carregado por `import()` dinâmico condicionado a `SENTRY_DSN` (`server.js:24-30`). Sem essa variável definida, o pacote sequer é carregado em memória.
- **Impacto**: baixo no estado atual. Registro por dois motivos: a correção é `npm audit fix`, sem mudança de código; e enquanto existirem, o gate do CI proposto em #48 precisa saber distinguir o que reprova do que apenas informa.
- **Correção proposta**: `npm audit fix` (resolve as quatro sem alterar versões maiores), commitar o `package-lock.json` resultante, e então remover o `|| true` do CI conforme #48.
- **Risco da correção**: baixo. `npm audit fix` sem `--force` só aplica atualizações dentro do range semver declarado. Rodar o smoke test do servidor depois — o projeto não tem testes automatizados para detectar regressão (Seção 11, Bloco D).

#### #54 — `pg` declarado como dependência direta sem nunca ser importado
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `pg` fora de `dependencies`.
- **Arquivos**: `package.json:23` · `node_modules/connect-pg-simple/package.json`
- **Descrição**: `pg` está declarado em `dependencies` (`"pg": "^8.22.0"`), mas **nenhum arquivo do projeto o importa** — grep por `from 'pg'` ou `require('pg')` retorna zero. Verifiquei a origem real: `connect-pg-simple` declara `pg` nas suas próprias `dependencies` (`"pg": "^8.12.0"`), **não** como `peerDependency`. Ou seja, seria instalado transitivamente de qualquer forma, e não há peer para satisfazer.
- **Impacto**: baixo — é ruído, não defeito. O efeito colateral é que o projeto fixa um range (`^8.22.0`) mais estreito que o do consumidor real (`^8.12.0`), assumindo a responsabilidade de manter atualizada uma dependência que não usa. Aparece como desatualizada em `npm outdated` (8.22.0 → 8.23.0) sem que isso signifique nada para o código.
- **Observação de arquitetura, sem achado**: o projeto usa **dois clientes PostgreSQL simultâneos** — o driver HTTP da Neon (`neon()`, em `server.js:125`, `portal/routes.js:16`, `ead/routes.js:14`) para as ~120 queries, e o `pg` tradicional com pool TCP, via `connect-pg-simple` (`server.js:71`), para a tabela de sessões. Não é duplicação a corrigir: o store de sessão exige um cliente com pool persistente, que o driver HTTP não oferece. Registro porque é o tipo de coexistência que parece redundante à primeira leitura e não é.
- **Correção proposta**: remover `pg` de `dependencies`. Se a intenção era fixar a versão de propósito, manter e documentar o motivo em comentário — hoje a declaração não distingue as duas intenções.
- **Risco da correção**: baixo, mas verificar após remover: rodar `npm ci` do zero e subir o servidor para confirmar que `connect-pg-simple` continua resolvendo `pg` sozinho.

#### #50 — GA4 sem separação de ambiente: navegação em desenvolvimento contamina a analítica de produção
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — GA4 só em produção e só após consentimento.
- **Arquivos**: `inject.js:8-9,136` · `server.js:32`
- **Descrição**: O identificador da propriedade está fixo no código e é injetado incondicionalmente:

  ```js
  const GTAG_HTML = '<script async src="…/gtag/js?id=G-7XL5XVE6QZ"></script>' + …   // inject.js:8-9
  …
  .replace('</head>', … + GTAG_HTML + WA_TRACK_HTML + '</head>')                     // inject.js:136
  ```

  `inject.js` **não conhece o ambiente**: grep por `IS_PROD` ou `NODE_ENV` nesse arquivo retorna zero. A constante `IS_PROD` existe e é usada em `server.js:32` para CORS, cookie e chave de admin — mas não chega até aqui.
- **Impacto**: toda navegação em desenvolvimento local envia pageviews e eventos de conversão para a propriedade de produção. Como o rastreamento inclui os eventos de negócio — `generate_lead` (`app.js:224`), `contact` em clique de WhatsApp (`inject.js:14`) e `diagnosis_click` no CTA sticky (`inject.js:74`) —, cada teste de formulário durante o desenvolvimento registra um lead falso no GA4. É contaminação direta da métrica usada para avaliar campanhas e decidir investimento em tráfego, sem nenhuma forma de separar depois o que foi real do que foi teste.
- **Correção proposta**: passar `IS_PROD` (ou ler `NODE_ENV` no próprio `inject.js`) e injetar `GTAG_HTML`/`WA_TRACK_HTML` apenas em produção; e mover o ID para `GA4_MEASUREMENT_ID` no ambiente, permitindo uma propriedade separada de homologação quando houver.
- **Risco da correção**: baixo. Conferir se algum teste de conversão depende de disparar em ambiente local — nesse caso, usar uma propriedade GA4 de teste, nunca a de produção.

#### #51 — Dados de contato repetidos em dezenas de arquivos, sem fonte única
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `config/empresa.js` como fonte única, consumida por `inject.js`.
- **Arquivos**: `inject.js:56,61,67` · `emails.js:28,77,97,114` · `glossario/render.js:166,217,226` · `app.js:23-24` · dezenas de `.html`
- **Descrição**: Os dados de contato e identificação da empresa estão replicados literalmente por todo o repositório. Contagem por grep em `.js` e `.html`:

  | Valor | Arquivos | Ocorrências |
  |---|---|---|
  | `5554999648368` (WhatsApp) | 39 | 46 |
  | `danielanders76@gmail.com` | 23 | 31 |
  | `42.073.716/0001-80` (CNPJ) | 24 | 23 |

  Existe centralização parcial e não aproveitada: `app.js:23-24` define `whatsapp` e `email` num objeto de configuração, mas ele só governa a home — `inject.js`, `emails.js`, `glossario/render.js` e as páginas estáticas repetem os literais.
- **Impacto**: baixo hoje, alto no dia da mudança. Trocar o número de WhatsApp exige editar 39 arquivos sem errar nenhum; um esquecido vira lead perdido em uma página que ninguém revisita. O mesmo vale para e-mail e CNPJ. Não há teste nem verificação que detecte a divergência.
- **Correção proposta**: um módulo `config/empresa.js` exportando `{ whatsapp, email, cnpj, cidade, dominio }`, consumido por `inject.js`, `emails.js` e `glossario/render.js` — que juntos cobrem a maior parte das ocorrências, porque são injetados em todas as páginas. As páginas estáticas com o número no corpo do texto podem migrar aos poucos, ou usar um token substituído no `injectShared`, no mesmo padrão já existente de `__PROMO_FIM_CURTO__` (`inject.js:140`).
- **Risco da correção**: baixo por arquivo, mas é refatoração ampla. Fazer em lotes por origem (primeiro os 3 módulos de injeção, depois as páginas) e conferir com grep que a contagem de literais cai a cada lote.

#### #55 — Lógica duplicada em quatro frentes, uma delas verbatim
> **🟡 PARCIAL (Fase 2 — 2026-08-18)** — (a) `PUT` duplicado removido; (d) templates centralizados. (b) e (c) pendentes.
- **Arquivos**: `portal/routes.js:854-878` × `:881-905` · `portal/routes.js:36-51` × `ead/routes.js:227-240` · `server.js:125-126` × `portal/routes.js:16-17` × `ead/routes.js:14-15` · `emails.js` × `ead/routes.js:336,1048`
- **Descrição**: Quatro duplicações confirmadas por comparação direta.

  **(a) `PUT` e `PATCH` de `/portal/api/clientes/:id` são idênticos.** Comparei os dois corpos com `diff`: **25 linhas, uma única diferença** — a string do `console.error` (`'…update error:'` × `'…patch error:'`). Mesma desestruturação, mesmo `UPDATE` com `COALESCE`, mesmo retorno. Ambos existem porque o frontend usa `PUT` para editar (`portal/admin.html:1082`) e `PATCH` para alternar status (`:648`) — mas o `PATCH` não funciona (#7), então uma das duas cópias está morta na prática.

  **(b) Três cópias do limitador de taxa.** `loginRateLimit` aparece em `portal/routes.js:36-51` e `ead/routes.js:227-240` — o `diff` mostra que diferem apenas no nome da variável (`maxAttempts` × `max`) e na formatação do `if`; a lógica e os valores (10 tentativas / 15 min) são iguais. `regRateLimit` (`ead/routes.js:211-224`) é uma terceira cópia da mesma estrutura com outros números. Consequência prática: a correção de #40 (vazamento de memória) precisa ser aplicada três vezes, mais uma quarta em `server.js:165-174`, que usa um formato diferente.

  **(c) Cliente de banco e de e-mail instanciados três vezes.** `const sql = process.env.DATABASE_URL ? neon(…) : null` e `const resend = …` se repetem literalmente em `server.js:125-126`, `portal/routes.js:16-17` e `ead/routes.js:14-15`. São três instâncias independentes do driver e três do cliente Resend no mesmo processo.

  **(d) Templates de e-mail em dois lugares.** `emails.js` centraliza quatro templates exportados (`notifyNewLead`, `autoReplyContact`, `portalWelcome`, `checklistDelivery`) e é o padrão do projeto — mas o EAD monta HTML inline em `ead/routes.js:336-342` (boas-vindas) e `:1048-1054` (matrícula confirmada), com marcação e rodapé próprios.
- **Impacto**: médio, e o custo é sempre o mesmo — correção aplicada em uma cópia e esquecida nas outras. Já é observável: o limitador do `server.js` tem o defeito de identificação por header (#39) que as outras cópias não têm, justamente porque foram escritas separadamente. Os templates divergentes fazem os e-mails do EAD terem identidade visual diferente dos demais.
- **Correção proposta**: (a) manter apenas o `PATCH` e remover o `PUT`, ajustando o frontend — semanticamente `PATCH` é o correto para atualização parcial com `COALESCE`; (b) extrair um `middleware/rateLimit.js` parametrizável, resolvendo #40 num ponto só; (c) extrair `db.js` exportando `sql` e `resend` já instanciados; (d) mover os dois templates do EAD para `emails.js`.
- **Risco da correção**: baixo em (b), (c) e (d) — são movimentações mecânicas. O item (a) tem risco médio: remover o `PUT` exige que o frontend seja ajustado no mesmo lote, e ele hoje depende do `PUT` para editar cliente. Fazer junto de #7.

#### #56 — Código morto: um arquivo inteiro, um middleware e um script utilitário
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `shared.js`, `fix-accents.cjs`, `requireEadAdmin` e o parâmetro morto removidos.
- **Arquivos**: `shared.js` · `ead/routes.js:199-207` · `fix-accents.cjs` · `ead/routes.js:736`
- **Descrição**: Quatro itens verificados por contagem de referências em todo o repositório.

  | Item | Tamanho | Referências | Situação |
  |---|---|---|---|
  | `shared.js` | 77 linhas | 0 no HTML | Órfão desde a remoção das tags `<script src="/shared.js">` das 35 páginas. Continha NAV/FOOTER **desatualizados** (sem o link "Cursos" e sem menu móvel) que hoje vivem em `inject.js` |
  | `requireEadAdmin` | 9 linhas | **1** — só a declaração | Nenhuma rota o usa. Contém a única regra que cruza as duas identidades do sistema (ver #25) |
  | `fix-accents.cjs` | script CLI | 0 | Não referenciado por `package.json`, CI ou qualquer `.js`. Script pontual de correção de acentuação que ficou no repositório |
  | parâmetro `title` de `defaultItems` | — | recebido, nunca lido | `function defaultItems(title)` (`ead/routes.js:736`) ignora o argumento; os dois chamadores (`:718`, `:732`) o passam |

  Somam-se a estes as **16 rotas nunca consumidas** de #2, que são a maior massa de código morto do projeto.
- **Agravante em `shared.js`**: o CI **exige** sua presença (`test -f shared.js`, `ci.yml:32`). Remover o arquivo morto quebra o pipeline — hoje já quebrado por motivo análogo (#48). É código morto protegido por uma verificação automatizada, o pior dos dois mundos.
- **Impacto**: médio. `shared.js` é ativamente enganoso: quem abrir o arquivo encontra uma navegação plausível porém obsoleta e pode editá-la acreditando estar mudando o site. `requireEadAdmin` é pior nesse aspecto — é uma regra de autorização nunca exercitada, à espera de ser reaproveitada por quem construir a área admin do EAD (detalhado em #25).
- **Correção proposta**: remover os quatro, na ordem — primeiro ajustar o `ci.yml` (#48), depois apagar `shared.js`, `requireEadAdmin`, `fix-accents.cjs` e o parâmetro não usado. Se `fix-accents.cjs` ainda tiver utilidade operacional, movê-lo para `scripts/` e registrá-lo em `package.json`, tornando explícito que é ferramenta e não código de aplicação.
- **Risco da correção**: baixo, desde que o `ci.yml` seja ajustado primeiro. Confirmar com um grep final que nenhuma página HTML remanescente referencia `/shared.js` — verifiquei e não há nenhuma.

#### #58 — Polling do PIX nunca para: só é interrompido se o pagamento for aprovado
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Polling encerra em aprovação, recusa, vencimento, estorno e por teto de 360 tentativas (~30 min); `.catch` na promise interna.
- **Arquivo**: `ead/pages/checkout.html:187-191`
- **Descrição**: Depois de gerar o QR code, a página passa a consultar o status a cada 5 segundos, e o `clearInterval` está dentro do único ramo que testa `aprovado`. Faltam três coisas: tratamento de `rejected` e `cancelled` — status que o webhook **efetivamente grava** (`ead/routes.js:1061`) —, um limite de tentativas ou de tempo, e um `.catch` na promise interna.
- **Impacto**: qualquer desfecho que não seja aprovação deixa o laço rodando indefinidamente enquanto a aba estiver aberta — pagamento recusado, PIX expirado (o padrão do Mercado Pago é 30 min) ou simples abandono. São **720 requisições por hora por aba**, cada uma abrindo sessão e consultando o banco. A ausência do `.catch` interno faz cada falha de rede virar uma rejeição não tratada, também a cada 5 segundos. E o usuário cujo pagamento foi recusado fica olhando "Aguardando pagamento" para sempre, sem nunca ser informado.
- **Correção proposta**: tratar os três desfechos — em aprovado, seguir como hoje; em recusado ou cancelado, parar e exibir a mensagem com opção de tentar outro método; e adicionar um teto (por exemplo 360 tentativas, cerca de 30 min, alinhado à validade do PIX) que pare com "o código expirou, gere um novo". Acrescentar `.catch` na promise interna para não acumular rejeições.
- **Risco da correção**: baixo. Alinhar o teto à validade real do PIX configurada no Mercado Pago; se divergirem, a tela para antes ou depois do código expirar de fato.

#### #59 — Chave de administrador guardada em `localStorage` sem expiração
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `sessionStorage` — a chave morre com a aba.
- **Arquivo**: `admin/index.html:208,221,227,246`
- **Descrição**: O painel de leads autentica com `ADMIN_KEY` enviada como `Bearer` e persiste a chave no navegador — `localStorage.getItem('adminKey')` na inicialização (`:208`) e `localStorage.setItem` no login (`:221`). `localStorage` não expira: a chave permanece até alguém fazer logout (`:227`) ou até uma resposta de erro removê-la (`:246`). É o mesmo segredo estático do servidor (`server.js:238`), não um token derivado — não tem prazo, não é revogável individualmente e é idêntico para qualquer pessoa que administre o sistema.
- **Impacto**: qualquer execução de script na origem `anderstech.net` lê a chave — e a CSP autoriza `unsafe-inline` em `script-src` (`server.js:45`), o que remove o obstáculo natural. Diferente de um cookie de sessão, aqui não há `httpOnly` possível, não há expiração de 24 h e a revogação exige trocar a variável de ambiente e reimplantar, invalidando o acesso de todo mundo. Em máquina compartilhada, a chave sobrevive ao fechamento do navegador.
- **Ligação com outros itens**: é o desfecho concreto de **#42** (ausência de escape em páginas que o mesmo navegador visita) — um XSS em qualquer página da origem colhe a chave de administrador do painel de leads.
- **Correção proposta**: trocar a chave estática por sessão de servidor, reaproveitando a infraestrutura que já existe e funciona no portal (`express-session` com cookie `httpOnly`, `secure`, expiração de 24 h). O painel passaria a ter login em vez de digitação de chave. Se a troca for grande demais para agora, o passo intermediário é migrar para `sessionStorage`, que ao menos morre com a aba.
- **Risco da correção**: médio na versão completa — muda o modelo de autenticação do painel e exige criar identidade de administrador, que hoje não tem caminho no código (**#24**). O passo intermediário é de risco baixo e imediato.

#### #60 — Anotações do aluno existem só no navegador, mas o botão diz "Salvo!"
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Tabela `ead_notes` + `PUT /ead/api/lesson/:id/nota`. O `localStorage` virou rascunho local.
- **Arquivo**: `ead/pages/player.html:1335-1349`
- **Descrição**: Os campos de anotação das aulas gravam exclusivamente no navegador: o clique troca o rótulo para "Salvo!" e chama `localStorage.setItem` (`:1341-1342`). Não há chamada de API, e o schema não tem tabela de anotações — as 16 tabelas do sistema estão mapeadas no início deste relatório e nenhuma guarda esse conteúdo. O `catch` vazio é apropriado aqui (modo privado do navegador bloqueia `localStorage`), mas significa que uma falha de gravação também exibe "Salvo!".
- **Impacto**: o rótulo comunica persistência que não existe. O aluno que anota durante um curso perde tudo ao trocar de navegador, de dispositivo, ao limpar dados de navegação ou ao usar janela anônima — sem nenhum aviso e sem forma de recuperar. Em um curso vendido com acesso vitalício, a expectativa razoável é que a anotação acompanhe a conta, não a máquina. É a mesma classe de problema de **#34**: a interface afirma um resultado que o sistema não entregou.
- **Correção proposta**: persistir no servidor. Uma tabela `ead_notes (user_id, lesson_id, idx, conteudo, updated_at)` com `UNIQUE(user_id, lesson_id, idx)` e uma rota `PUT /ead/api/lesson/:lessonId/nota` seguem exatamente o padrão já usado em `ead_progress` (`ead/routes.js:486-490`), inclusive o `ON CONFLICT DO UPDATE`. Manter o `localStorage` como rascunho local e sincronizar. Se persistir não for a intenção, mudar o rótulo para algo honesto — "Salvo neste navegador".
- **Risco da correção**: baixo. Depende de **#16** (sem migrações, criar tabela nova em banco existente exige o mecanismo que ainda não há) e de **#36** estar corrigido, para que a nova rota nasça já com checagem de matrícula.

#### #61 — Cada requisição de página relê o arquivo do disco e reinjeta o layout, sem cache
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `pageCache` estende ao site o padrão já usado no glossário.
- **Arquivos**: `server.js:108-114,116-123` · `ead/routes.js:1089-1097,1116-1147` · comparar com `server.js:365-385`
- **Descrição**: O caminho de servir página é síncrono e não memoriza nada: `sendPage` faz `readFileSync(filePath, 'utf8')` (`server.js:110`) e em seguida `injectShared(html, urlPath)`. A cada requisição são uma leitura **síncrona** de disco e seis `String.replace` sobre o HTML inteiro (`inject.js:135-141`), que acrescentam por volta de 10 KB de nav, rodapé, GA4, CTA sticky e breadcrumb. O mesmo padrão se repete em `send404` (`server.js:118`), `sendEadPage` (`ead/routes.js:1093`) e na página de certificado (`:1120`).
- **Contraste dentro do próprio projeto**: o glossário **tem** cache — `glossarioCache` (`server.js:365`) guarda o HTML já injetado e o reaproveita (`:367-372,377-383`), e o sitemap idem (`:85-88`). A técnica está implementada e validada; simplesmente não foi aplicada às cerca de 45 páginas restantes (22 em `pages/`, 9 no blog, 11 no EAD, home e 404).
- **Impacto**: `readFileSync` bloqueia o event loop do Node durante a leitura. Como o processo é único e atende todas as requisições, cada página servida trava brevemente o atendimento de todas as outras — incluindo as chamadas de API do portal e do EAD. Com as páginas maiores (a home tem 48 KB, `player.html` 100 KB) e o tráfego orgânico que o site busca atrair, é sob carga que o efeito aparece. O conteúdo é estático entre deploys: recalcular por requisição não traz benefício algum.
- **Correção proposta**: estender o padrão do glossário — um `Map` de HTML já injetado, com a chave sendo o caminho da URL, populado na primeira requisição. Como não há build, o cache é invalidado no restart, que é o comportamento natural de um `Map` em memória e coincide com o ciclo de deploy do Railway. Alternativa mais robusta: pré-renderizar tudo no boot, trocando `readFileSync` por leitura única.
- **Risco da correção**: baixo, com uma ressalva importante: `injectShared` substitui `__PROMO_FIM_CURTO__` e `__PROMO_FIM_LONGO__` (`inject.js:140-141`) por datas derivadas de `PROMO`. Como esses valores só mudam por variável de ambiente — e portanto por restart —, o cache é seguro. Se a promoção passar a depender da data corrente em tempo de execução, o cache precisa de invalidação por tempo.

#### #66 — Toda página responde em duas URLs por causa da barra final, sem nenhum 301
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — 301 de barra final e de `/index.html` para `/`.
- **Arquivo**: `server.js:394` · ausência de redirecionamento canônico em todo o projeto
- **Descrição**: O catch-all normaliza a barra final apenas internamente — `const clean = req.path.replace(/\/$/, '') || '/'` — e **serve o conteúdo nos dois formatos, ambos com 200**. Sondagem no servidor:

  ```
  /blog                              200      /blog/                              200
  /blog/o-que-e-iso-9001             200      /blog/o-que-e-iso-9001/             200
  /glossario                         200      /glossario/                         200
  /quanto-custa-certificacao-iso     200      /quanto-custa-certificacao-iso/     200
  ```

  Grep por `301` em todo o projeto retorna uma única ocorrência, e é um **comentário** explicando por que um redirecionamento foi *evitado* (`server.js:99`). Não existe nenhum `res.redirect(301, …)` no código.
- **Impacto**: cada uma das 123 URLs do sitemap tem uma gêmea com barra final servindo conteúdo idêntico com status 200. O buscador precisa decidir sozinho qual indexar; sinais de link e autoridade que cheguem à variante errada não se somam à canônica. O atenuante real é que **existe `<link rel="canonical">` correto em todas as páginas estáticas** (verificado), o que resolve a maior parte do problema para o Google — mas canônica é dica, redirecionamento é regra, e outros rastreadores e ferramentas de análise tratam as duas URLs como distintas. O sitemap lista apenas a forma sem barra ✅, então não há sinal contraditório vindo dele.
- **Ponto correto no mesmo tema**: maiúsculas **não** geram duplicata — `/Blog` e `/BLOG` retornam 404, porque o slug é validado contra `/^[a-z0-9-]+$/` (`server.js:407`). Não há conteúdo duplicado por diferença de caixa. O ideal seria 301 para minúsculas em vez de 404, mas o comportamento atual não fragmenta indexação.
- **Correção proposta**: middleware único, antes das rotas de página, que emita `301` de qualquer caminho terminado em `/` para a versão sem barra — exceto a raiz. Aplicar o mesmo tratamento a `/index.html` → `/`, que hoje também responde 200 (ver #64).
- **Risco da correção**: baixo, com uma exceção a preservar: `/glossario/` **não** pode ser redirecionado de forma que colida com a pasta física `glossario/`, cuidado que o comentário de `server.js:99` já registra. Testar as seis famílias de URL (raiz, blog, blog/post, pages, glossário, glossário/termo, EAD) depois de aplicar.

#### #67 — Página de erro acessível com status 200: soft 404 indexável
> **🟡 ESCLARECIDO (Fase 2 — 2026-08-18)** — A tag `noindex` **já existia** (`pages/404.html:8`) — a proposta original era redundante. Resta o status 200 no caminho direto, que depende de #64.
- **Arquivos**: `pages/404.html` · `server.js:100,116-123`
- **Descrição**: O tratamento de rota inexistente está **correto** — `/nao-existe` retorna `404` com o HTML de `pages/404.html` renderizado por `send404` (`server.js:116-123`). O problema é o arquivo em si também ser alcançável pelo servidor de estáticos:

  ```
  /nao-existe        -> 404   (correto)
  /pages/404.html    -> 200   (soft 404)
  ```

  É consequência direta de #64, mas com efeito próprio: existe uma URL rastreável cujo conteúdo é "Página não encontrada" e cujo status afirma sucesso.
- **Impacto**: baixo e específico. O Google trata como *soft 404* e não indexa, mas registra o problema no Search Console, e páginas assim consomem orçamento de rastreamento sem contrapartida. Como `pages/404.html` não é referenciado por nenhum link interno — verifiquei os 56 links do site e nenhum aponta para lá —, a descoberta dependeria de rastreamento direto de diretório.
- **Correção proposta**: resolvido por **#64**, ao parar de servir `pages/` como diretório estático. **Correção da própria proposta (Fase 2)**: a versão original sugeria acrescentar `<meta name="robots" content="noindex">` ao arquivo. Ao aplicar, verifiquei que **a tag já existe** (`pages/404.html:8`, `content="noindex, nofollow"`) — a sugestão era redundante e foi revertida. O achado permanece válido apenas quanto ao status 200 no caminho direto, cuja correção é #64.
- **Risco da correção**: nenhum.

#### #68 — Imagens sem largura e altura declaradas: causa direta de deslocamento de layout
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `width`/`height` no logo injetado e em 13 imagens da home.
- **Arquivos**: `index.html` (13 imagens) · `blog/*.html` · `pages/*.html` · `inject.js:22`
- **Descrição**: Medi as imagens no HTML entregue:

  | Página | `<img>` | com `alt` | com `loading="lazy"` | com `width`/`height` |
  |---|---|---|---|---|
  | `/` | 13 | **13** | 11 | **0** |
  | `/blog/o-que-e-iso-9001` | 1 | **1** | 0 | **0** |
  | `/quanto-custa-certificacao-iso` | 1 | **1** | 0 | **0** |

  Texto alternativo está em **100%** das imagens — ponto positivo, e relevante também para acessibilidade (Seção 15). O carregamento tardio cobre 11 de 13 na home, o que é o padrão correto (as primeiras ficam ansiosas de propósito). O que falta em **todas** é a declaração de dimensão.
- **Impacto**: sem `width` e `height`, o navegador não reserva espaço antes de a imagem chegar, e o conteúdo abaixo salta quando ela carrega. É a causa mais comum de *Cumulative Layout Shift*, uma das três métricas de Core Web Vitals que o Google usa como sinal de ranqueamento. O efeito é mais forte no logotipo do cabeçalho, injetado em **todas** as páginas com `style="height:80px;width:auto"` (`inject.js:22`) — altura via CSS não substitui o atributo, e `width:auto` impede qualquer reserva horizontal. Como o logo fica no topo, o salto desloca a página inteira.
- **Verificado e correto no mesmo tema**: as fontes usam `preconnect` para `fonts.googleapis.com` e `fonts.gstatic.com` e `display=swap` na URL (`index.html:28-30`) ✅; `compression` está ativo (`server.js:34`) ✅; estáticos têm `Cache-Control` de 7 dias com `stale-while-revalidate` (`server.js:91-98`) ✅. A lacuna de Core Web Vitals é a dimensão de imagem, mais o custo de renderização por requisição de **#61**.
- **Correção proposta**: declarar `width` e `height` reais em cada `<img>`, começando pelo logotipo do `inject.js`, que rende o ganho em todas as páginas de uma vez. Manter o CSS existente para responsividade — os atributos servem para o navegador calcular a proporção, não para fixar tamanho. Complementarmente, os arquivos em `assets/` são `.jpg` e `.png`; converter para WebP ou AVIF reduziria o peso, mas é ganho menor que a correção de deslocamento.
- **Risco da correção**: baixo, desde que os valores correspondam à proporção real do arquivo — dimensão errada distorce a imagem. Conferir cada arquivo em `assets/` antes de preencher.

#### #72 — Formulários públicos coletam dado pessoal sem consentimento explícito nem aviso de cookies
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Banner de cookies condicionando o GA4 + aviso de tratamento sob os três formulários.
- **Arquivos**: `index.html` (formulário de contato) · `pages/checklist-iso-9001.html` · `pages/calculadora-roi-certificacao.html` · `inject.js:8-9,136`
- **Descrição**: Os três formulários públicos coletam nome, e-mail, telefone, empresa e cargo, e nenhum apresenta caixa de consentimento ou aviso de tratamento. Busca por `type="checkbox"` nos três: **nenhum**. Busca por menção à política de privacidade próxima aos formulários: **nenhuma** — a política existe (`pages/politica-de-privacidade.html`, 125 linhas) e está linkada apenas no rodapé. Em paralelo, o GA4 é injetado em todas as páginas sem qualquer condição (`inject.js:136`, ver **#50**), gravando cookies de análise antes de qualquer manifestação do visitante. Não há banner de consentimento.
- **Avaliação sob a LGPD**: a base legal para contato comercial solicitado pelo próprio titular pode ser legítimo interesse ou procedimentos preliminares de contrato (art. 7º, V e IX), então o formulário de contato **não exige necessariamente consentimento**. Os pontos frágeis são outros e mais concretos: (a) o titular não é informado, no momento da coleta, de qual será o tratamento — dever de transparência do art. 9º; (b) os dois lead magnets disparam e-mail automático (`server.js:213-225`), o que configura comunicação de marketing sem manifestação registrada; (c) o cookie de análise é gravado antes de qualquer escolha, ponto em que a orientação da ANPD é mais restritiva.
- **Já correto, e vale registrar**: a política de privacidade é substantiva — menciona anonimização, eliminação, portabilidade, revogação, encarregado e DPO, cobrindo os direitos do titular no texto. O problema é de **implementação**, não de documento: os direitos estão descritos e não há mecanismo que os realize (**#73**).
- **Correção proposta**: acrescentar sob cada formulário uma linha curta de aviso com link para a política, o que resolve a transparência sem atrito de conversão; e um banner de cookies simples que condicione a injeção do GA4 à aceitação — o que se encaixa na mesma mudança de **#50**, já que ambos exigem tornar a injeção condicional.
- **Risco da correção**: baixo no código. O efeito colateral esperado é queda na medição do GA4, proporcional a quem recusar cookies — é o custo correto de medir apenas quem consentiu. Registrar a data da mudança para não ler a queda como perda de tráfego.

#### #73 — Direitos do titular descritos na política e sem nenhum mecanismo que os realize
> **🟡 PARCIAL (Fase 2 — 2026-08-18)** — (a) log sem nome. (b) exclusão de titular agora é possível para o EAD via CASCADE da `006`; rota de autoatendimento segue pendente.
- **Arquivos**: `pages/politica-de-privacidade.html` · `portal/routes.js` · `ead/routes.js` · `server.js:228`
- **Descrição**: A política promete anonimização, eliminação, portabilidade e revogação. No código não existe **nenhuma** rota que exclua ou anonimize titular: as 87 rotas foram enumeradas nos Blocos A e B, e não há exclusão de `portal_users`, de `ead_users` nem de `leads`. Pior, o schema **impede** a exclusão mesmo por SQL direto: **19 das 23 foreign keys não têm `ON DELETE`** (**#18**). Apagar um cliente esbarra em contratos, eventos, pagamentos e atas; apagar um aluno esbarra em pedidos, matrículas, progresso, tentativas de quiz e certificados — ou seja, sempre, para qualquer aluno real.
- **Impacto**: um pedido de exclusão sob o art. 18 hoje não tem como ser atendido no prazo legal por nenhum caminho automatizado, e o caminho manual exige apagar registros em cinco tabelas na ordem correta, direto no banco de produção, sem transação nem trilha. O alcance dos dados é amplo: nomes, e-mails, telefones e CNPJ no portal; nomes e e-mails no EAD; e nome de aluno exposto publicamente na verificação de certificado (**#46**).
- **Dado pessoal em log**: `console.log` com o nome do lead (`server.js:228`) grava dado pessoal no log da aplicação a cada envio de formulário. Em Railway esse log vai para a plataforma e fica retido conforme a política dela, fora do controle do sistema — criando uma cópia de dado pessoal sem ciclo de vida definido e fora do alcance de qualquer mecanismo de exclusão futuro. É o **único** log com dado pessoal; os demais 30+ `console.error` registram apenas contexto e objeto de erro, verificados um a um.
- **Correção proposta**: (a) remover o nome do log, mantendo o identificador — correção de uma linha, sem perda operacional. (b) Implementar exclusão de titular, o que **depende de #18**: definir por relação o que cascateia (progresso, matrícula, tentativas), o que é anonimizado preservando histórico contábil (pedidos, pagamentos, contratos) e o que permanece por obrigação de verificabilidade (certificados emitidos). (c) Expor rota autenticada de exclusão de conta e um canal para titular não cadastrado.
- **Risco da correção**: **alto** na parte (b) — é a correção mais delicada do relatório, junto com #18. Cascata mal aplicada apaga dado financeiro em silêncio. Fazer relação por relação, com backup verificado antes de cada alteração de constraint, e testar em cópia do banco. A parte (a) é de risco nulo e pode ser feita imediatamente.

#### #74 — Operação sem healthcheck, sem falha visível na inicialização e sem backup referenciado
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — (a) `/healthz`; (b) falha de migração derruba o deploy; (c) política de backup registrada no `HANDOFF.md`.
- **Arquivos**: `server.js:160-162` · comparar com `server.js:64-67`
- **Descrição**: Três lacunas de operação, verificadas por busca em todo o projeto.

  **(a) Nenhum healthcheck.** Busca por `healthz`, `/health` ou `/ping`: zero ocorrências. O Railway não tem como distinguir "processo vivo" de "aplicação funcional", e um monitor externo não tem endpoint para consultar. Combinado com **#28** — 22 rotas que respondem 200 com dados vazios quando o banco está ausente —, uma falha de banco se apresenta como "os dados sumiram", não como "o sistema está fora".

  **(b) Inicialização que não falha alto.** As três funções de DDL são chamadas com `.catch(console.error)` (`server.js:160-162`): registram o erro e seguem. O servidor sobe e aceita tráfego mesmo que a criação das tabelas tenha falhado. O único ponto que **encerra** o processo em condição inválida é a ausência de `SESSION_SECRET` em produção (`server.js:64-67`) — comportamento correto, que serve de modelo para o resto.

  **(c) Nenhuma referência a backup.** Busca por "backup" no projeto retorna apenas o texto de um termo do glossário. O banco é Neon, que oferece recuperação a ponto no tempo no próprio serviço, então provavelmente **há** proteção — mas nada no repositório registra qual é a política, qual a janela de retenção, nem quem verificou que a restauração funciona. Os uploads não estão cobertos de forma alguma: ficam no filesystem efêmero do contêiner (**#44**), sem cópia.
- **Impacto**: a operação depende de alguém perceber que algo está errado por outro meio. Não há sinal automatizado — nem healthcheck, nem alerta, nem falha de deploy. O Sentry existe e está bem posicionado (`server.js:24-30`), mas é opcional (`SENTRY_DSN`) e captura exceção, não indisponibilidade de dependência.
- **Correção proposta**: (a) `GET /healthz` executando `SELECT 1` e devolvendo 200 ou 503, apontado como healthcheck no Railway — é a peça que falta para a plataforma reiniciar sozinha uma instância degradada; (b) trocar `.catch(console.error)` por encerramento do processo em produção, no padrão de `server.js:64-67`, para que o deploy falhe visivelmente em vez de subir quebrado; (c) registrar no `HANDOFF.md` a política de retenção do Neon e a data do último teste de restauração, e resolver os uploads junto de #44.
- **Risco da correção**: baixo em (a) e (c). O item (b) merece cuidado: encerrar o processo quando o DDL falha transforma um problema transitório de rede em indisponibilidade total. Distinguir falha de conexão (que deve tentar novamente) de erro de esquema (que deve encerrar), ou aplicar tentativas com espera crescente antes de desistir.

#### #78 — Home anuncia promoção gratuita que expirou há 20 dias
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Bloco da promoção virou `__PROMO_TAG__`, injetado só enquanto `promoAtiva()`.
- **Arquivos**: `index.html` · `promo.js:5,22` · `inject.js:140-141`
- **Descrição**: A home traz a chamada **"Lançamento — acesso gratuito até `__PROMO_FIM_CURTO__`"**, e `injectShared` substitui o token pela data da promoção (`inject.js:140`). Executei `promo.js` no estado atual:

  ```
  EAD_PROMO_FIM (env): não definida  ->  usa o padrão do código
  PROMO.fim          : 2026-07-30T02:59:59.000Z
  agora              : 2026-08-18
  promoAtiva()       : false
  fimCurto           : 29/07
  ```

  A promoção terminou em **29/07** e hoje é **18/08**. A home continua exibindo "acesso gratuito até 29/07" — um anúncio de oferta gratuita com data visivelmente no passado.
- **Por que só a home**: as páginas do EAD são orientadas a dado — decidem o que exibir por `c.promo_gratuito`, que vem do servidor (`cursos.html:209`, `curso-detail.html:127`, `checkout.html:94`). Com a promoção encerrada, elas já mostram o preço cheio corretamente. A home tem **texto estático** que não é condicionado a `promoAtiva()`, então não acompanhou a virada.
- **Impacto**: é a primeira página do site e a que recebe o tráfego orgânico. O visitante lê que os cursos são gratuitos, clica, e encontra preço cheio no checkout — a pior sequência possível para conversão, porque quebra a confiança justamente no ponto de decisão. A data no passado ainda comunica descuido, o que pesa dobrado para uma consultoria que vende gestão da qualidade.
- **Correção proposta**: condicionar o bloco à promoção. Como `injectShared` já roda no servidor e tem acesso a `promoAtiva()`, o caminho mais direto é trocar o token por um marcador de bloco — `__PROMO_BLOCO__` — substituído pelo HTML da tarja quando ativa e por string vazia quando não. Isso resolve de forma permanente, sem depender de alguém lembrar de editar a home a cada mudança de campanha.
- **Risco da correção**: baixo. Verificar se outros trechos da home dependem visualmente da presença da tarja (espaçamento, cor de fundo da seção) antes de removê-la condicionalmente.

#### #79 — Nenhum histórico de transações consultável, por ninguém
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `GET /ead/api/my-orders` — histórico do aluno.
- **Arquivos**: `ead/routes.js:1033,1077` · `ead/pages/meus-cursos.html` · ausência de rota administrativa
- **Descrição**: A tabela `ead_orders` guarda valor, método, status, `mp_payment_id`, `mp_preference_id`, data de criação e data de pagamento — tudo o que um histórico financeiro precisa. Ela é lida em **dois** lugares, e nenhum deles é um histórico:

  | Local | Query | Para quê |
  |---|---|---|
  | `ead/routes.js:1033` | `SELECT * … WHERE id = ? AND status != 'aprovado'` | guarda de idempotência do webhook |
  | `ead/routes.js:1077` | `SELECT status … WHERE id = ? AND user_id = ?` | polling do PIX, devolve só o status |

  **Não existe rota que liste pedidos** — nem para o aluno ver o que comprou, nem para o administrador ver o que foi vendido. O EAD não tem área administrativa (o único middleware para isso, `requireEadAdmin`, é código morto — **#25**, **#56**).
- **Impacto**: não há como responder "quanto foi vendido este mês", "este aluno pagou", ou "quais pedidos ficaram pendentes" sem consultar o banco diretamente ou o painel do Mercado Pago. O aluno não tem comprovante nem recibo dentro do produto. E, combinado com **#77**, um estorno passa completamente despercebido: o pedido continua `aprovado` no banco e não há tela onde a divergência com o gateway apareceria.
- **Agravante de dado órfão**: os pedidos pendentes acumulam sem visibilidade. Cada PIX gerado e não pago cria uma linha `pendente` (`ead/routes.js:909-912`), e **não há deduplicação** — o mesmo aluno tentando duas vezes gera dois pedidos (relacionado a #21 e #29). Ninguém vê esse acúmulo.
- **Correção proposta**: duas rotas simples sobre dado que já existe — `GET /ead/api/my-orders` para o aluno, com filtro por `user_id` da sessão, exibida em "Meus cursos"; e uma listagem administrativa com totais por período. A segunda depende de decidir o modelo de identidade do admin do EAD (**#25**).
- **Risco da correção**: baixo para a rota do aluno — leitura filtrada por sessão, sem efeito colateral. Não expor `mp_payment_id` nem `mp_preference_id` ao aluno: são identificadores do gateway, sem utilidade para ele.

#### #35 — Erros de carregamento silenciados deixam a tela indistinguível de "sem dados"
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Portal do cliente distingue erro de vazio e avisa qual seção falhou.
- **Arquivos**: `portal/cliente.html:563-566` · `ead/pages/cursos.html:193,201` · `ead/pages/curso-detail.html:111,115` · `ead/pages/meus-cursos.html:84` · `portal/admin.html:632,1061`
- **Descrição**: Nove pontos capturam a falha e seguem com valor vazio, sem sinalizar nada. O caso mais consequente é o portal do cliente:

  ```js
  api('/eventos').catch(() => []),      // cliente.html:563
  api('/pagamentos').catch(() => []),   // :564
  api('/atas').catch(() => []),         // :565
  api('/contratos').catch(() => [])     // :566
  ```

  Uma falha de rede ou um 500 produz array vazio, e o renderizador exibe "Nenhum evento registrado." (`cliente.html:627`) — exatamente a mesma tela de um cliente que de fato não tem eventos.
- **Impacto**: o cliente conclui que a consultoria não registrou o trabalho dele. É o oposto da função do portal, que existe para comprovar horas e entregas contratadas. Nos demais pontos (EAD, detalhe do admin) o efeito é menor: card vazio ou dropdown com a opção padrão.
- **Nota de método**: distinto de **#34**, embora da mesma família. Ali o sistema **afirma sucesso** onde houve falha, e o dano é perda de lead — receita direta, por isso ALTO. Aqui ele **omite a falha**, e o dano é confiança do cliente já conquistado. Ambos entregam informação errada ao usuário.
- **Correção proposta**: distinguir os três estados — carregando, erro, vazio — exibindo "Não foi possível carregar seus eventos. Tente novamente." com botão de recarregar quando houver falha.
- **Risco da correção**: baixo, mas toca o fluxo de renderização de duas telas grandes; fazer por seção e conferir cada uma.

#### #4 — Quiz por módulo: rota implementada, frontend nunca chama
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Módulo do quiz agora é validado contra o curso; a rota deixou de aceitar módulo de outro curso.
- **Arquivos**: `ead/routes.js:502-531` (`GET /ead/api/quiz/:courseSlug`, ramo `moduleId`) e `ead/routes.js:552` (submit com `is_final = false`) · `ead/pages/player.html:503` e `:562` (únicos consumidores)
- **Descrição**: O player só invoca o quiz com `?final=1` (`player.html:503`) e só submete com `isFinal:true` (`player.html:565`). O ramo `else if (moduleId)` de `ead/routes.js:520-521` e o ramo `else` do submit (`ead/routes.js:551-553`) são inalcançáveis pela UI. As colunas `ead_quiz_questions.is_final = false` e `ead_quiz_attempts.module_id` existem e são populadas pelos seeds, mas nunca exercitadas.
- **Impacto**: os quizzes de fixação por módulo — anunciados na página de checkout como "Quizzes por módulo + avaliação final" (`ead/pages/checkout.html:104`) — não existem na prática. É uma promessa da página de vendas sem contrapartida no produto (será reexaminado na Seção 20, Bloco G).
- **Correção proposta**: decidir entre (a) implementar o botão de quiz por módulo no `player.html`, ou (b) remover a menção na página de checkout e as rotas mortas.
- **Risco da correção**: baixo em ambos os caminhos. Opção (a) não altera nada existente; opção (b) exige revisar o texto de vendas.

#### #11 — Portal do cliente lê `evento.valor`, coluna que não existe: tudo R$ 0,00
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `valor` calculado em SQL como `horas * valor_hora`.
- **Arquivos**: `portal/cliente.html:635,676,684` (lê) · `portal/routes.js:95-107` (schema) · `portal/routes.js:1156-1160` (query)
- **Descrição**: A tabela de eventos do portal do cliente renderiza `fmtCurrency(e.valor)` e soma `totalV += Number(e.valor) || 0` (`cliente.html:676,678`). A tabela `events` (`portal/routes.js:95-107`) tem `horas NUMERIC(6,2)` e `valor_hora NUMERIC(8,2)`, mas **não tem coluna `valor`**. A rota `/portal/api/me/eventos` (`portal/routes.js:1156-1160`) faz `SELECT *`, então nunca há `valor` no payload.
- **Impacto**: `fmtCurrency(null)` retorna `'R$ 0,00'` por construção (`cliente.html:519`) — não um traço, um zero. O cliente vê uma coluna "Valor" preenchida com R$ 0,00 em todas as linhas e um total de R$ 0,00, mesmo em contratos com `valor_hora` definido. É pior que um campo vazio: comunica um número errado com aparência de correto.
- **Correção proposta**: calcular no backend, `SELECT *, (horas * valor_hora) AS valor FROM events WHERE …`, tratando `valor_hora` nulo como 0. Isso também alimenta o `total_faturado` que falta em #9.
- **Risco da correção**: baixo. Verificar antes se há eventos com `valor_hora` nulo em produção — nesse caso o valor exibido passa de "R$ 0,00 sempre" para "R$ 0,00 só quando não houver hora-valor", o que é o comportamento correto mas muda números já vistos pelo cliente.

#### #12 — Datas exibidas um dia antes do real (off-by-one de fuso)
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `fmtDate` formata a partir das partes da string, sem instanciar `Date`.
- **Arquivos**: `portal/admin.html:405-410` · `portal/cliente.html:523-528`
- **Descrição**: Ambos os `fmtDate` fazem `new Date(str).toLocaleDateString('pt-BR')`. Colunas `DATE` (`events.data`, `payments.data`, `atas.data`, `contracts.data_inicio/data_fim`) serializadas como meia-noite UTC caem no dia anterior quando formatadas em `America/Sao_Paulo` (UTC−3). Verificado executando o próprio código:

  ```
  TZ='America/Sao_Paulo'
  new Date('2026-08-17T00:00:00.000Z').toLocaleDateString('pt-BR')  →  16/08/2026
  new Date('2026-08-17').toLocaleDateString('pt-BR')                →  16/08/2026
  ```

- **Condição**: manifesta-se quando o processo Node roda em UTC — o padrão de contêineres Railway. Se o servidor rodasse em `America/Sao_Paulo`, o driver produziria `T03:00:00.000Z` e a conversão daria certo por acidente. Ou seja: o bug é latente e depende do fuso do host, não do código de negócio.
- **Impacto**: toda data do Portal (eventos, pagamentos, atas, contratos) exibida um dia antes, para o admin e para o cliente. Em um produto cuja função é comprovar horas e pagamentos por data, isso corrói a confiança no registro.
- **Correção proposta**: formatar a partir das partes da string em vez de instanciar `Date` — `const [a,m,d] = str.slice(0,10).split('-'); return `${d}/${m}/${a}`` — ou passar `{ timeZone: 'UTC' }` para o `toLocaleDateString`. A primeira é mais robusta porque não depende de o backend manter a serialização atual.
- **Risco da correção**: baixo, isolado em duas funções. Verificar se `created_at` (TIMESTAMPTZ, com hora real) também passa por `fmtDate` — nesse caso a conversão para UTC estaria errada e precisa de tratamento separado. Em `admin.html:822` há `fmtDate(a.data || a.created_at)`, que mistura os dois tipos.

#### #13 — Seletor de contrato lê `descricao`/`numero`; a coluna é `titulo`
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `c.titulo` no seletor de contrato.
- **Arquivos**: `portal/admin.html:1047` (lê) · `portal/routes.js:79-91` (schema) · `portal/routes.js:940` (query)
- **Descrição**: `loadContratosForSelect` monta as opções com `esc(c.descricao || c.numero || 'Contrato #' + c.id)` (`admin.html:1047`). A tabela `contracts` (`portal/routes.js:79-91`) tem `titulo TEXT NOT NULL` — **nem `descricao` nem `numero` existem**. A query é `SELECT *` (`portal/routes.js:940`), então os dois primeiros operandos são sempre `undefined`.
- **Impacto**: o dropdown de contrato nos modais de evento e pagamento sempre cai no fallback e lista "Contrato #12", "Contrato #13"… O admin precisa memorizar IDs para vincular um lançamento ao contrato certo. Combinado com #6 (o `contrato_id` escolhido nem é gravado), o recurso é inútil de ponta a ponta.
- **Correção proposta**: trocar para `c.titulo || 'Contrato #' + c.id`.
- **Risco da correção**: nenhum — uma linha, sem efeito colateral.

#### #19 — `ead_quiz_attempts` é write-only: histórico gravado que ninguém consegue ler
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Os 2 índices sem leitor removidos.
- **Arquivos**: `ead/routes.js:153-168` (schema + índices) · `ead/routes.js:567-570` (único acesso)
- **Descrição**: A tabela recebe um `INSERT` a cada submissão de prova (`ead/routes.js:568`) e **nunca é lida**. Confirmei por grep: as únicas ocorrências de `ead_quiz_attempts` no projeto são o `CREATE TABLE` (154), os dois `CREATE INDEX` (167-168), o `INSERT` (568) e um `DELETE` de limpeza no seed (`ead/seed.js:26`). Não há `SELECT` em rota nenhuma.
- **Agravante**: os dois índices criados sobre ela (`idx_ead_quiz_attempts_user_id`, `idx_ead_quiz_attempts_course_id`) não servem query alguma — são custo puro de escrita e armazenamento, já que índice só se paga na leitura.
- **Impacto**: o dado mais valioso do EAD para diagnóstico pedagógico — quantas tentativas, qual nota, quais alunos travam em qual módulo — está sendo acumulado e é inacessível. Nem o aluno vê seu histórico, nem o admin. Combinado com #4 (quiz por módulo nunca chamado), metade das colunas (`module_id`, `is_final = false`) nunca recebe dado significativo.
- **Correção proposta**: expor o histórico. Mínimo viável: `GET /ead/api/my-attempts` para o aluno ver as próprias tentativas na página de curso. Se não houver intenção de construir isso, remover os dois índices — manter a tabela como log de auditoria é legítimo, manter índices sem leitor não é.
- **Risco da correção**: nenhum para a rota de leitura (adição). Remover os índices é reversível.

#### #20 — `ead_quiz_attempts.module_id` é a única FK "solta" do sistema
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `migrations/006` limpa órfãos e cria a FK em `ead_quiz_attempts.module_id`.
- **Arquivo**: `ead/routes.js:158`
- **Descrição**: A coluna é declarada `module_id INTEGER,` — sem `REFERENCES`. Em toda tabela irmã a mesma coluna é declarada com integridade referencial: `ead_lessons.module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE` (`ead/routes.js:65`) e `ead_quiz_questions.module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE` (`:82`).
- **Impacto**: baixo hoje, porque a única escrita (`ead/routes.js:569`) grava `${moduleId || null}` vindo do corpo da requisição e o caminho de quiz por módulo nunca é exercitado (#4). Se #4 for implementado, a coluna passa a aceitar qualquer inteiro — inclusive `module_id` de outro curso ou de um módulo já excluído — sem o banco reclamar, e sem o `CASCADE` que limparia as linhas órfãs.
- **Correção proposta**: `module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE`, alinhando com as irmãs.
- **Risco da correção**: baixo, mas depende de #16 e exige limpar eventuais linhas órfãs antes de criar a constraint (`DELETE FROM ead_quiz_attempts WHERE module_id IS NOT NULL AND module_id NOT IN (SELECT id FROM ead_modules)`).

#### #21 — QR code do PIX é gravado e nunca lido: fechou a página, perdeu o pagamento
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/ead/api/order/:id/status` agora devolve `qr_code` e `qr_code_base64` enquanto o pedido está pendente.
- **Arquivos**: `ead/routes.js:117-118` (schema) · `ead/routes.js:929` (única escrita) · `ead/routes.js:1072-1083` (rota de status)
- **Descrição**: No checkout PIX, o `qr_code` e o `qr_code_base64` retornados pelo Mercado Pago são persistidos em `ead_orders` (`ead/routes.js:929`) **e** devolvidos na resposta do checkout (`:932-933`). O frontend renderiza a partir da resposta. As duas colunas nunca são lidas de volta: grep confirma que `pix_qr_code` e `pix_qr_code_base64` só aparecem no `CREATE TABLE` (117-118) e nesse único `UPDATE`. A rota de acompanhamento `/ead/api/order/:orderId/status` devolve apenas `{ status }` (`ead/routes.js:1077-1079`).
- **Impacto**: o aluno que gera um PIX e fecha a aba antes de pagar não tem como recuperar o QR code. O pedido fica `pendente` no banco com o QR guardado logo ao lado, inacessível. Ele precisa recomeçar o checkout, o que cria uma segunda `ead_order` pendente para o mesmo curso — não há deduplicação de pedido pendente em `ead/routes.js:909-912`. O dado para resolver isso já está gravado; falta só a leitura.
- **Correção proposta**: incluir `pix_qr_code` e `pix_qr_code_base64` no retorno de `/ead/api/order/:orderId/status` quando `status = 'pendente'` e `metodo = 'pix'` (a rota já filtra por `user_id`, então a autorização está resolvida), e criar uma tela "meus pedidos pendentes".
- **Risco da correção**: baixo. Atenção a não expor o QR de pedido de outro usuário — a query já tem `AND user_id = ${userId}` (`ead/routes.js:1077`), preservar essa cláusula.

#### #22 — Nenhuma coluna de enum tem `CHECK`: o banco aceita qualquer string
> **🟡 PARCIAL (Fase 2 — 2026-08-18)** — Mapeamento evento→estado agora é explícito em `ead/asaas.js` (`traduzEvento`), e evento desconhecido não vira estado. Falta o `CHECK` no banco — exige inspecionar os valores já gravados.
- **Arquivos**: `server.js:143` · `portal/routes.js:69,88,100,118` · `ead/routes.js:114`
- **Descrição**: Grep por `CHECK (` em todos os `.js` do projeto: zero constraints (a única ocorrência textual é um rótulo "CHECK (Verificar)" dentro de um SVG do PDCA em `ead/seed-course1.js:74`). Seis colunas funcionam como enum apenas por convenção do código:

  | Coluna | Valores esperados | Definido em |
  |---|---|---|
  | `leads.status` | `novo` + os do `<select>` do painel | `server.js:143` (`DEFAULT 'novo'`) |
  | `portal_users.role` | `cliente`, `admin` | `portal/routes.js:69` |
  | `contracts.status` | `ativo` (usado em `WHERE status = 'ativo'`, `:652,745`) | `portal/routes.js:88` |
  | `events.tipo` | `consultoria\|auditoria\|treinamento\|diagnostico\|reuniao` | `portal/routes.js:100` |
  | `payments.metodo` | `pix\|boleto\|transferencia\|cartao` | `portal/routes.js:118` |
  | `ead_orders.status` | `pendente\|aprovado\|rejected\|cancelled` | `ead/routes.js:114` |

- **Impacto**: as rotas gravam o valor cru do corpo da requisição sem validar contra uma lista (`portal/routes.js:980` grava `${tipo}` direto; `:1072` grava `${metodo}`). Um POST manual com `tipo: "qualquer coisa"` é aceito. Na UI o efeito é silencioso: `tipoLabel` e `metodoLabel` (`portal/admin.html:427,432`) fazem `return map[tipo] || tipo`, então o lixo é exibido como se fosse categoria válida, e passa a poluir os `GROUP BY` de relatório.
- **Agravante em `ead_orders.status`**: mistura idiomas — o código grava `'pendente'`/`'aprovado'` em português (`ead/routes.js:911,896`) e `'rejected'`/`'cancelled'` em inglês, porque estes últimos vêm crus do Mercado Pago (`ead/routes.js:1061`: `SET status = ${payment.status}`). O gateway pode enviar outros valores (`in_process`, `refunded`, `charged_back`) que entrariam no banco sem nenhum tratamento — ponto a aprofundar na Seção 19 (Bloco G).
- **Correção proposta**: adicionar `CHECK (col IN (...))` às seis colunas e validar a lista na entrada da rota, devolvendo 400 em vez de deixar o banco recusar com erro 500. Para `ead_orders.status`, mapear explicitamente os status do Mercado Pago para o vocabulário interno antes de gravar.
- **Risco da correção**: médio. Depende de #16, e antes de criar cada `CHECK` é obrigatório verificar se o banco já tem linhas fora da lista (`SELECT DISTINCT status FROM ead_orders`) — a constraint falha na criação se houver.

---

### BAIXO

#### #33 — `?offset` negativo derruba a query com 500
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `Math.max(offset, 0)` nas 3 rotas.
- **Arquivos**: `server.js:291` · `portal/routes.js:242,771`
- **Descrição**: As três rotas paginadas calculam `const offset = parseInt(req.query.offset, 10) || 0`. O `|| 0` só protege contra `NaN` e `0`; um valor negativo passa intacto. `?offset=-1` gera `OFFSET -1`, que o PostgreSQL rejeita com `ERROR: OFFSET must not be negative` → `catch` → 500. O `limit` ao lado está corretamente protegido nos dois extremos por `Math.min(… || 100, 500)`.
- **Impacto**: baixo. Não é alcançável pela UI (nenhuma tela envia `offset`), e as três rotas exigem autenticação. É robustez.
- **Correção proposta**: `Math.max(parseInt(req.query.offset, 10) || 0, 0)`.
- **Risco da correção**: nenhum.

#### #57 — Guarda de banco ausente responde de três formas diferentes na mesma base
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `requireDB` unificou a guarda em 503.
- **Arquivos**: `portal/routes.js:239,646,675` · `ead/routes.js:254,481` · `server.js:262,287,312,328`
- **Descrição**: A verificação `if (!sql)` aparece em ~30 rotas e resolve de três maneiras incompatíveis entre si:

  | Forma | Exemplo | Ocorrências |
  |---|---|---|
  | `res.json([])` / `res.json({…zeros})` — 200 | `portal/routes.js:239`, `:646` | 22 (ver #28) |
  | `res.status(500)` | `portal/routes.js:675`, `ead/routes.js:481` | ~7 |
  | `res.status(404)` | `portal/routes.js:299`, `server.js:312` | ~4 |

  A mesma condição — banco indisponível — vira 200, 500 ou 404 dependendo da rota. `server.js:328` chega a responder 404 com a mensagem "Banco de dados não configurado", combinando um código que significa "não existe" com um texto que diz "não configurado".
- **Padrões conferidos e consistentes** (registro para delimitar o achado): o formato `try/catch` + `console.error(contexto, err)` + `res.status(500).json({ error })` é seguido por **todas** as ~90 rotas, sem exceção; a estrutura de pastas é coerente (`portal/` e `ead/` com `routes.js` e páginas próprias); e não há um único `TODO`, `FIXME`, `HACK` ou `XXX` no código — grep confirma que as ocorrências são todas de "TODOS OS DIREITOS RESERVADOS" no rodapé.
- **Impacto**: baixo. Nenhum defeito funcional decorre disso — o cliente HTTP simplesmente não consegue tratar a condição de forma uniforme, e o frontend acaba com caminhos de erro diferentes para a mesma causa (o que alimenta #28 e #35).
- **Correção proposta**: unificar em 503 com corpo padronizado, preferencialmente num middleware único aplicado aos routers em vez de repetido em 30 rotas — o que resolve este item e #28 na mesma mudança.
- **Risco da correção**: baixo. Ajustar o frontend junto, para que 503 não caia no tratamento genérico de erro sem mensagem específica.

#### #62 — Três idas ao servidor no carregamento das páginas do EAD, uma delas redundante
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `/ead/api/courses` devolve `{courses, promo}` — uma ida a menos.
- **Arquivos**: `ead/pages/cursos.html:181,195,203` · `ead/pages/curso-detail.html:109,113,117`
- **Descrição**: As duas páginas públicas do EAD disparam três requisições independentes ao carregar: `/ead/api/me` (para decidir o que mostrar na navegação), `/ead/api/promo` (para a tarja de lançamento) e `/ead/api/courses` ou `/ead/api/courses/:slug` (para o conteúdo). A terceira **já traz** a informação de promoção — `promo_gratuito` é acrescentado a cada curso em `ead/routes.js:268` e ao curso individual em `:299`. A chamada separada a `/promo` existe apenas para obter a data de término, que a resposta de cursos não inclui.
- **Impacto**: baixo, e vale dizer com clareza — as três rotas são leves e duas delas nem tocam o banco (`/promo` lê variáveis de ambiente; `/me` lê a sessão). O custo é latência de rede em série na primeira renderização, justamente nas duas páginas que recebem tráfego orgânico e onde o tempo até o conteúdo aparecer influencia conversão. Não é gargalo de servidor, é atraso percebido pelo visitante.
- **Correção proposta**: incluir `promo_fim` (ou o objeto `PROMO` completo) na resposta de `/ead/api/courses` e `/ead/api/courses/:slug`, eliminando a chamada a `/promo`. A chamada a `/me` pode ser dispensada nas páginas servidas pelo servidor, já que `injectShared` roda no backend e tem acesso à sessão — a navegação poderia vir pronta no HTML, o que também melhora o que o Googlebot enxerga (a ser aprofundado na Seção 13, Bloco E).
- **Risco da correção**: baixo. Verificar que `checkout.html:88` e as demais consumidoras de `/ead/api/courses/:slug` não quebrem com campos adicionais na resposta — não quebram, porque leem por nome.

#### #69 — IndexNow notifica 8 URLs fixas enquanto o site publica 123
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — IndexNow lê o sitemap — 123 URLs em vez de 8 fixas.
- **Arquivo**: `.github/workflows/ci.yml:66-88`
- **Descrição**: O passo final do CI avisa o IndexNow a cada push em `master`, mas com uma lista **escrita à mão** dentro do YAML: home, `/blog`, quatro posts, a calculadora e o checklist — **8 URLs**. O sitemap gerado dinamicamente contém **123**:

  | Origem | URLs |
  |---|---|
  | `ci.yml:66-88` (lista fixa) | 8 |
  | `/sitemap.xml` (dinâmico) | 123 — sendo 84 do glossário, 9 do blog, 24 páginas, 5 do EAD e a home |

  A lista foi escrita quando o site tinha esse tamanho e não acompanhou o crescimento. Os 83 termos do glossário, as 18 páginas de conteúdo criadas depois e as páginas do EAD nunca foram notificadas.
- **Impacto**: o IndexNow existe para acelerar a descoberta no Bing e no Yandex — publicar e avisar, em vez de esperar o rastreamento. Hoje ele acelera 6,5% do site e ignora o restante, incluindo o glossário, que é o maior ativo de cauda longa (84 URLs de termos técnicos, exatamente o tipo de conteúdo que capta busca informacional). Não prejudica o que já está indexado; apenas deixa de entregar o benefício onde ele seria maior.
- **Agravante**: o passo só roda `if: github.event_name == 'push'` — mas o workflow inteiro **falha antes de chegar nele** desde 18/07 (#48), no passo `Verify required files exist`. Portanto o IndexNow não é disparado há um mês, nem para as 8 URLs.
- **Correção proposta**: substituir a lista fixa por leitura do próprio sitemap — buscar `https://anderstech.net/sitemap.xml`, extrair os `<loc>` e montar o `urlList`, o que se mantém correto sozinho a cada conteúdo novo. A API do IndexNow aceita até 10.000 URLs por requisição, então as 123 cabem numa chamada. Corrigir #48 primeiro, senão o passo continua inalcançável.
- **Risco da correção**: baixo. Enviar todas as 123 a cada push é aceitável e não é penalizado, mas se incomodar, dá para enviar apenas as URLs cujos arquivos mudaram no commit.

#### #75 — Busca do painel de leads não ignora acentos, e o próprio projeto já sabe fazer isso
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Busca de leads normaliza acentos.
- **Arquivos**: `admin/index.html:335,345` · comparar com `ead/pages/player.html:1069`
- **Descrição**: O filtro de leads compara texto cru em minúsculas, sem normalizar acentuação:

  ```js
  const search = document.getElementById('filter-search').value.toLowerCase().trim();   // :335
  const hay = ((l.nome || '') + ' ' + (l.empresa || '')).toLowerCase();                  // :345
  if (!hay.includes(search)) return false;
  ```

  Buscar "jose" não encontra "José"; "conceicao" não encontra "Conceição"; "assessoria tecnica" não encontra "Assessoria Técnica". Em base de leads brasileira, nome e razão social acentuados são a regra, não a exceção.
- **Contraste dentro do projeto**: o player do EAD **faz certo** — `(sc.textContent||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')` (`player.html:1069`). A técnica está implementada, validada e a uma linha de distância; simplesmente não foi aplicada ao painel.
- **Impacto**: baixo em consequência, cotidiano em frequência. O administrador digita o nome sem acento — comportamento natural de quem busca rápido — e conclui que o lead não existe. Some-se ao **#70**, em que a própria base de conteúdo mistura texto com e sem acento, e o resultado da busca fica imprevisível.
- **Correção proposta**: aplicar `normalize('NFD').replace(/[̀-ͯ]/g,'')` aos dois lados da comparação, reaproveitando exatamente a expressão de `player.html:1069`.
- **Risco da correção**: nenhum. Duas linhas, sem efeito colateral — a busca passa a encontrar um superconjunto do que encontra hoje.

#### #76 — Tamanhos de fonte majoritariamente fixos em pixels
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — 74 declarações de `font-size` convertidas de `px` para `rem`.
- **Arquivo**: `styles.css`
- **Descrição**: Contagem no folha de estilo principal: **74 declarações de `font-size` em `px`** contra **15 em unidade relativa** (`rem`, `em` ou `clamp`). O uso de `clamp()` aparece nos títulos maiores, o que é a parte bem resolvida; o corpo de texto, rótulos e elementos de interface usam pixel fixo.
- **Impacto**: quem aumenta o tamanho de fonte padrão do navegador — recurso usado por pessoas com baixa visão — não vê diferença em texto declarado em `px`. O zoom de página continua funcionando e atenua bastante o problema na prática, razão pela qual o item fica em BAIXO e não acima. É a diferença entre "inacessível" e "menos adaptável do que poderia".
- **Verificado e correto no mesmo tema**, o que delimita o achado: **todos** os campos de formulário têm `<label>` associado (conferido em 5 telas: 2/2, 2/2, 6/6, 16/30, 2/3 — sempre com rótulos suficientes); há `:focus` e `:focus-visible` no CSS (6 declarações); nenhum `tabindex` positivo, então a ordem de tabulação segue o DOM; landmarks semânticos (`<header>`, `<nav>`, `<main>`, `<footer>`) presentes; skip-link injetado em todas as páginas (`inject.js:78,137`); `lang="pt-BR"` declarado; e **100% das imagens com `alt`** (medido no Bloco E).
- **Correção proposta**: migrar `font-size` de `px` para `rem` no corpo de texto e nos componentes de interface, mantendo `clamp()` nos títulos. Como o `:root` já define a escala tipográfica, a conversão é mecânica: dividir por 16.
- **Risco da correção**: baixo, mas é alteração visual ampla — 74 pontos em uma folha de estilo que governa o site inteiro. Fazer por grupo de componentes e conferir cada família de página, porque arredondamento em `rem` desloca ligeiramente o ritmo vertical.

#### #80 — A virada de gratuito para pago depende de duas variáveis cuja ausência bloqueia 100% das vendas, sem alerta
> **🟡 AGUARDA VOCÊ (Fase 2 — 2026-08-18)** — Código pronto e fail-closed. Falta `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` no Railway — ver `HANDOFF.md`.
- **Arquivos**: `ead/routes.js:893-906,981-985` · `.env.example`
- **Descrição**: Com `promoAtiva()` retornando `false` desde 29/07 (**#78**), o checkout deixou de seguir o caminho gratuito e passou a depender inteiramente do Mercado Pago. Os dois pontos de entrada são fail-closed — o que está **correto** do ponto de vista de segurança, e é justamente por isso que a consequência operacional precisa ser registrada:

  | Variável | Se ausente | Efeito |
  |---|---|---|
  | `MP_ACCESS_TOKEN` | `ead/routes.js:904-906` | checkout devolve **503** "Pagamento não configurado" — nenhuma venda se conclui |
  | `MP_WEBHOOK_SECRET` | `ead/routes.js:982-985` | **todo** webhook devolve 503 — nenhum pagamento é confirmado, nenhuma matrícula é liberada |

  Ambas as guardas foram introduzidas numa rodada de correções recente, substituindo comportamentos inseguros (matrícula grátis sem token; webhook sem verificação de assinatura). A troca é claramente melhor. O que ficou pendente é que **a mudança de regime — de promoção gratuita para venda paga — aconteceu automaticamente por data**, sem que nada verifique se as variáveis necessárias para o novo regime existem.
- **O que não posso verificar daqui**: se `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` estão de fato configuradas no Railway. Não tenho acesso ao painel, e nenhuma delas está no `.env` local. Registro o mecanismo, não um diagnóstico de produção — **este é o primeiro item a confirmar manualmente**.
- **Impacto se estiverem ausentes**: interrupção total de vendas desde 29/07, silenciosa. Não há healthcheck (**#74**), não há histórico de pedidos que mostraria o volume caindo a zero (**#79**), e o Sentry captura exceção, não um 503 deliberado. O sintoma visível para o cliente é "Pagamento não configurado. Entre em contato com o suporte" — e o cliente que vê isso normalmente não entra em contato, apenas sai.
- **Correção proposta**: (a) **verificar agora** as duas variáveis no Railway — é uma consulta de dois minutos que resolve a incerteza; (b) validar a configuração na inicialização: se `promoAtiva()` for falso e `MP_ACCESS_TOKEN` não existir, registrar erro visível no boot, no mesmo espírito da guarda de `SESSION_SECRET` (`server.js:64-67`); (c) incluir no `/healthz` proposto em #74 um indicador de "pagamento configurado", para que a condição apareça em monitoramento em vez de depender de alguém testar o checkout.
- **Risco da correção**: baixo. Não afrouxar as guardas fail-closed — a correção é tornar a condição **visível**, nunca voltar a aprovar matrícula sem pagamento.

#### #52 — `RAILWAY_ENVIRONMENT` decide o modo de produção e não está documentada
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `RAILWAY_ENVIRONMENT` documentada.
- **Arquivos**: `server.js:32` · `.env.example`
- **Descrição**: A detecção de produção é `process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production'`. Comparei as 13 variáveis lidas no código com o `.env.example`: **12 estão documentadas, só `RAILWAY_ENVIRONMENT` falta.**
- **Impacto**: baixo, e o desenho é defensivo — são duas condições em `OU`, então basta `NODE_ENV=production` para ativar o modo seguro, e `NODE_ENV` **está** documentada. A ausência é de documentação: quem lê o `.env.example` para reproduzir o ambiente não descobre que a plataforma injeta uma segunda chave capaz de mudar CORS, flag `secure` do cookie e comportamento da chave de admin.
- **Correção proposta**: acrescentar ao `.env.example`, comentada, explicando que é preenchida automaticamente pelo Railway e não deve ser definida à mão localmente.
- **Risco da correção**: nenhum — é uma linha de comentário.

#### #45 — Logout do EAD não encerra a sessão, apenas remove o objeto
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Logout do EAD usa `session.destroy()`.
- **Arquivos**: `ead/routes.js:376-379` · comparar com `portal/routes.js:228-232`
- **Descrição**: Os dois módulos tratam logout de forma diferente:

  ```js
  router.post('/ead/api/logout', (req, res) => { delete req.session.eadUser; res.json({ ok: true }); });   // ead:376-379
  router.post('/portal/logout', (req, res) => { req.session.destroy(() => res.json({ ok: true })); });     // portal:228-232
  ```

  O EAD apaga uma propriedade; o registro da sessão permanece na tabela `session` e o cookie continua válido até expirar (24 h, `server.js:77`).
- **Impacto**: baixo. Sem o objeto `eadUser`, `requireEadAuth` (`ead/routes.js:190`) barra o acesso, então o efeito funcional do logout é obtido. O que fica é o identificador de sessão vivo — relevante em computador compartilhado e, combinado com #37, mantém utilizável um ID que o usuário acredita ter invalidado.
- **Correção proposta**: usar `req.session.destroy()`, como no portal. Se a intenção era permitir sair do EAD preservando uma sessão de portal simultânea (#25), então a diferença é deliberada e deve ser documentada em comentário — hoje parece descuido.
- **Risco da correção**: baixo, com a ressalva acima: `destroy()` derruba também a sessão do portal, se houver.

#### #46 — Verificação pública de certificado expõe nome do aluno sem limite de requisições
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Limitador de 20/min no endpoint público e código de certificado passou de 4 para **12 bytes**.
- **Arquivos**: `ead/routes.js:811-827` · `ead/routes.js:578` (geração do código) · `ead/routes.js:1116-1147` (página)
- **Descrição**: `GET /ead/api/certificate/:code` não tem autenticação nem limitador. Com `?format=json` devolve `{ nome, curso, carga, code, data }` (`:826`); sem ele, gera o PDF com o nome do aluno. A página `/ead/certificado/:code` também injeta nome e curso em tags Open Graph (`:1135`). O código é `'AT-' + crypto.randomBytes(4).toString('hex').toUpperCase()` (`:578`) — 4 bytes, ou seja **2³² combinações**.
- **Avaliação**: o endpoint ser público é correto e intencional — certificado existe para ser verificado por terceiros. 2³² não é enumerável por HTTP em tempo razoável, então não há vazamento em massa realista. Os dois pontos que restam são: não há limitador para tornar a sondagem cara, e o espaço de 32 bits é menor do que o usual para identificador público (`randomUUID`, usado nos uploads, tem 122 bits). Com o crescimento da base de certificados a densidade de acertos sobe proporcionalmente.
- **Impacto**: baixo hoje. Registrado por ser um endpoint público que devolve dado pessoal (nome de pessoa física vinculado a uma formação), o que o coloca sob a LGPD — a ser retomado na Seção 17 (Bloco F).
- **Correção proposta**: elevar para `crypto.randomBytes(12)` nos códigos novos, mantendo a validação dos antigos, e aplicar um limitador brando por IP no endpoint. Não fechar a rota: isso quebraria a função de verificação.
- **Risco da correção**: baixo. O regex da página aceita `[A-Za-z0-9-]{4,40}` (`ead/routes.js:1122`), que já comporta códigos maiores; confirmar que `ead_certificates.code` é `TEXT` (é — `:175`) e que nada depende do comprimento fixo.

#### #47 — Comparação da chave de admin é implementação manual, não `crypto.timingSafeEqual`
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `crypto.timingSafeEqual` sobre digests SHA-256 — some o vazamento de comprimento.
- **Arquivo**: `server.js:250-255` · uso em `server.js:244`
- **Descrição**: A comparação da `ADMIN_KEY` usa função escrita à mão:

  ```js
  function timingSafeEqual(a, b) {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return result === 0;
  }
  ```

  O laço em si é de tempo constante e está correto. Dois reparos: o retorno antecipado por diferença de comprimento revela o tamanho da chave, e o nome idêntico ao da API nativa sugere equivalência que não existe — `crypto.timingSafeEqual` está disponível e é o que o próprio projeto usa no webhook (`ead/routes.js:1014`).
- **Impacto**: baixo. Descobrir o comprimento da chave não a revela, e o oráculo exige medição de tempo em rede. É inconsistência de padrão mais que vulnerabilidade — o mesmo repositório resolve o mesmo problema de duas formas diferentes.
- **Correção proposta**: usar `crypto.timingSafeEqual` sobre buffers, comparando primeiro os digests SHA-256 dos dois valores — isso normaliza o comprimento e elimina o vazamento, sem o `RangeError` de #27.
- **Risco da correção**: nenhum.

#### #5 — Prefixos de API inconsistentes entre módulos, sem versionamento
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — Base `API` extraída em 8 páginas do EAD.
- **Arquivos**: `server.js:176,261,286,311,327` (`/api/…`) · `portal/admin.html:390` (`const API = '/portal/api'`) · `portal/cliente.html:538` (`'/portal/api/me' + path`) · `ead/pages/*.html` (`/ead/api/…` literal em cada chamada)
- **Descrição**: Três prefixos distintos (`/api/`, `/portal/api/`, `/ead/api/`) e três estratégias de montagem de URL no frontend: constante (`portal/admin.html:390`), string concatenada no wrapper (`portal/cliente.html:538`) e literal absoluto repetido em cada `fetch` (todas as páginas EAD e `admin/index.html`). Não há versionamento (`/v1/`) em nenhum deles.
- **Impacto**: baixo hoje — não há bug ativo, os prefixos não colidem. O custo aparece na manutenção: mudar o prefixo do EAD exige editar 20 `fetch` espalhados por 8 arquivos.
- **Correção proposta**: extrair uma constante de base por módulo no frontend do EAD, no mesmo padrão de `portal/admin.html:390`. Versionamento não se justifica para uma API interna sem consumidores externos.
- **Risco da correção**: baixo, mas é refatoração de 20 pontos de chamada — fazer em lote e testar cada página EAD.

#### #14 — Coluna "Evento" da tabela de Atas sempre exibe "-"
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `LEFT JOIN events` na query de atas devolve `evento_descricao`.
- **Arquivos**: `portal/admin.html:801` (lê) · `portal/routes.js:1113,1115` (query)
- **Descrição**: O renderizador de atas lê `esc(a.evento_descricao || '-')`. A query de `/portal/api/atas` é `SELECT a.*, pu.nome AS client_nome FROM atas a LEFT JOIN portal_users pu ON pu.id = a.client_id` (`portal/routes.js:1115`) — não há `JOIN` com `events` nem qualquer coluna `evento_descricao`.
- **Impacto**: baixo e cosmético hoje, porque o vínculo evento↔ata nem chega a ser gravado (#6). Se #6 for corrigido sem este, a coluna continua vazia.
- **Correção proposta**: acrescentar `LEFT JOIN events ev ON ev.id = a.event_id` e `ev.descricao AS evento_descricao` à query.
- **Risco da correção**: baixo. Só corrigir depois de #6, senão não há dado para exibir.

#### #15 — Campos enviados pelo frontend e descartados em silêncio
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `email` editável no cliente e `data` editável na ata. `cargo` do checklist segue pendente.
- **Arquivos**: `pages/checklist-iso-9001.html:1047` · `server.js:182` · `portal/admin.html:1077` · `portal/routes.js:858` · `portal/admin.html:1135` · `portal/routes.js:547`
- **Descrição**: Três casos confirmados de campo enviado, aceito com 200 e nunca persistido:

  | Origem | Campo | Destino | Situação |
  |---|---|---|---|
  | `checklist-iso-9001.html:1047` | `cargo` | `server.js:182` | não está na desestruturação nem na tabela `leads` (`server.js:131-147`) |
  | `portal/admin.html:1077` (editar cliente) | `email` | `portal/routes.js:858` | `PUT` só lê `nome, empresa, telefone, cnpj, ativo` — e-mail não é editável |
  | `portal/admin.html:1135` (editar ata) | `data` | `portal/routes.js:547` | `PUT` só lê `titulo, participantes, pauta, discussao, decisoes, proximos_passos` |

- **Impacto**: baixo, mas silencioso — é a característica que torna esses casos difíceis de descobrir em uso. O `cargo` é um dado de qualificação de lead que o formulário pede ao visitante e joga fora. A data da ata, uma vez criada, não pode mais ser corrigida pela interface, e o admin não recebe nenhum aviso disso.
- **Correção proposta**: para `cargo`, decidir entre remover o campo do formulário ou adicionar a coluna e persistir (o `lead_events.payload` JSONB já poderia recebê-lo sem alterar o schema). Para `email` e `data`, incluir os campos no `UPDATE` ou desabilitá-los na UI para não prometer o que não entrega.
- **Risco da correção**: baixo. Tornar `email` editável exige tratar colisão com a constraint `UNIQUE` de `portal_users.email` (`portal/routes.js:66`) e devolver 409, como já faz o `POST` (`portal/routes.js:290-292`).

#### #23 — Cinco colunas órfãs: declaradas, nunca escritas nem lidas
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `publico` e `prerequisito` agora exibidos em `/ead/curso/:slug`.
- **Arquivos**: `portal/routes.js:119` · `ead/routes.js:71,41,42,43`
- **Descrição**: Colunas verificadas por grep em todo o projeto (`.js` + `.html`, incluindo os 5 arquivos de seed):

  | Coluna | Escrita? | Lida? | Situação |
  |---|---|---|---|
  | `payments.comprovante_path` (`portal/routes.js:119`) | não | não | órfã total — só aparece no `CREATE TABLE` |
  | `ead_lessons.entregavel_url` (`ead/routes.js:71`) | não (nem nos seeds) | não | órfã total; a irmã `entregavel_titulo` é usada em `ead/routes.js:288,426` |
  | `ead_courses.imagem` (`ead/routes.js:41`) | só `seed-course4.js` | não | `cursos.html:206` usa um array fixo `['9001','AUD','P+I','5S']` como thumbnail |
  | `ead_courses.publico` (`ead/routes.js:42`) | os 4 seeds | não | trafega em todo `SELECT *` e é descartada |
  | `ead_courses.prerequisito` (`ead/routes.js:43`) | os 4 seeds | não | idem |

  Contraste: `ead_courses.objetivo` (`ead/routes.js:44`), da mesma família, **é** consumida (`curso-detail.html:187`).
- **Impacto**: baixo. `publico` e `prerequisito` têm conteúdo real escrito nos seeds e são informação de venda relevante para a página de detalhe do curso — é conteúdo pronto que não está sendo aproveitado, mais oportunidade perdida que defeito. `comprovante_path` sinaliza uma funcionalidade planejada (anexar comprovante de pagamento) que nunca foi construída, embora o upload de contrato exista (`portal/routes.js:376`).
- **Correção proposta**: exibir `publico` e `prerequisito` em `curso-detail.html`, junto de `objetivo`. Para `comprovante_path` e `entregavel_url`, decidir entre implementar ou remover — carregar coluna sem uso confunde quem lê o schema.
- **Risco da correção**: nenhum para exibir os campos (dado já existe). Remover colunas depende de #16.

#### #24 — Não existe caminho no código para criar o `role = 'admin'` que o código exige
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `migrations/008` promove o e-mail de `PORTAL_ADMIN_EMAIL`, idempotente e sem senha embutida.
- **Arquivos**: `portal/routes.js:69` (schema) · `portal/routes.js:268,801` (únicos `INSERT`) · `portal/routes.js:170,220,577,1185` e `ead/routes.js:200` (leitores)
- **Descrição**: Cinco pontos do código ramificam por `role === 'admin'` — o middleware `requireAdmin` (`portal/routes.js:170`), o redirect pós-login (`:220`), o acesso irrestrito às atas em PDF (`:577`), o redirect de `/portal` (`:1185`) e `requireEadAdmin` (`ead/routes.js:200`). Mas as duas únicas rotas que criam usuário gravam o papel **hardcoded**: `VALUES (…, 'cliente', …)` em `portal/routes.js:268` e `:801`. Não há rota que atribua ou altere `role`, e o `PUT`/`PATCH` de cliente não inclui o campo (`:858`, `:885`).
- **Impacto**: o primeiro administrador só pode existir por `INSERT`/`UPDATE` manual direto no banco — um passo operacional obrigatório que não está registrado em lugar nenhum do código. Some-se a #16 (sem migrações, não há seed de bootstrap versionado) e o procedimento de recriar o ambiente do zero fica sem trilha. Como a coluna também não tem `CHECK` (#22), um `UPDATE` manual com erro de digitação (`'Admin'`, `'administrador'`) grava sem reclamar e produz um usuário que não é admin nem cliente pleno.
- **Correção proposta**: registrar o procedimento no `HANDOFF.md` com o SQL exato, e prever um bootstrap idempotente na migração `001` que promova a `admin` o e-mail definido em uma env var (`PORTAL_ADMIN_EMAIL`), sem senha embutida.
- **Risco da correção**: baixo. Não criar rota de API para promover a admin sem antes resolver autorização — seria escalonamento de privilégio exposto na rede.

#### #25 — Duas identidades sem relação, e um middleware que cruza as duas
> **✅ CORRIGIDO (Fase 2 — 2026-08-18)** — `requireEadAdmin` removido — o acoplamento entre as duas identidades deixou de existir.
- **Arquivos**: `portal/routes.js:64-76` (`portal_users`) · `ead/routes.js:95-105` (`ead_users`) · `ead/routes.js:199-207` (`requireEadAdmin`)
- **Descrição**: O sistema tem dois cadastros de pessoa independentes, com tabelas, senhas e sessões próprias (`req.session.portalUser` × `req.session.eadUser`), sem nenhuma FK ou coluna de ligação entre eles. É uma escolha defensável — são produtos distintos (consultoria × cursos). O que destoa é `requireEadAdmin` (`ead/routes.js:199-207`), que vive no módulo EAD mas autoriza consultando `req.session.portalUser.role`, acoplando os dois sistemas de identidade em um único ponto.
- **Impacto**: baixo hoje, porque `requireEadAdmin` **não é usado por nenhuma rota** — é código morto (a ser confirmado na Seção 8, Bloco C). O risco é de manutenção: quem for criar a área administrativa do EAD encontrará esse middleware pronto e assumirá que a regra "admin do portal administra o EAD" é intencional e testada, quando nunca foi exercitada. O mesmo cliente que faz um curso ocupa duas linhas em duas tabelas, com senhas que podem divergir — atrito de UX a considerar na Seção 16 (Bloco F).
- **Correção proposta**: se a área admin do EAD for construída, decidir explicitamente o modelo de identidade antes. Enquanto não for, remover `requireEadAdmin` para não deixar uma regra de autorização não testada à espera de ser reaproveitada.
- **Risco da correção**: nenhum — remover código que ninguém referencia.

---

## AUTOCHECK — Seção 1

| Subitem exigido | Verificado onde |
|---|---|
| Listar rotas do backend (método, path) | Enumeração completa por grep de `router.<verbo>`/`app.<verbo>` em `server.js` (9 rotas), `portal/routes.js` (47), `ead/routes.js` (31) = **87 rotas** |
| Listar chamadas HTTP do frontend | Grep de `fetch(` em todo `*.html`/`*.js` (exceto `node_modules` e seeds): 37 pontos de chamada, incluindo os 3 wrappers (`admin/index.html:254`, `portal/admin.html:459`, `portal/cliente.html:537`) e seus 24 call sites resolvidos |
| Chamadas para rotas inexistentes | **#1** (`PUT /portal/api/pagamentos/:id`). Demais chamadas conferidas uma a uma contra a lista de rotas — nenhuma outra órfã |
| Rotas nunca consumidas | **#2** (16 rotas) e **#4** (ramo de quiz por módulo) |
| Método HTTP divergente | Verificado: PUT/POST/PATCH/DELETE de clientes, eventos, pagamentos, atas e leads conferidos contra os handlers. Única divergência real é #1 (método inexistente, não divergente) |
| Paths com typo | Nenhum encontrado. Os descasamentos são de idioma (#2), não de digitação |
| Versões de API misturadas | Não se aplica — não há versionamento em nenhuma rota (registrado em #5) |
| baseURL/prefixos inconsistentes | **#5** |
| Rotas duplicadas ou conflitantes | Duplicação semântica EN/PT em **#2**. Conflitos de matching verificados e **sem problema**: `/ead/checkout/sucesso\|erro\|pendente` (`ead/routes.js:1112-1114`) estão registrados antes de `/ead/checkout/:slug` (1115); `/portal/api/clientes/:id` (826) não captura `/clientes/:id/resumo` (908) nem `/clientes/:id/contratos` (936) porque Express casa segmentos exatos; `/portal/api/atas/:id` (530) e `/portal/api/atas/:id/pdf` (569) idem |
| Query params enviados e ignorados | **#3** |

---

## AUTOCHECK — Seção 2

| Subitem exigido | Verificado onde |
|---|---|
| Campos enviados pelo frontend × esperados/validados pelo backend | Confrontei os 4 payloads do `saveModal` (`portal/admin.html:1069-1148`) contra as desestruturações de `req.body` em `portal/routes.js:783,858,885,973,993,1065,513,547`; o payload de `/api/contact` (`app.js:202-212`, `checklist-iso-9001.html:1043-1050`, `calculadora-roi-certificacao.html:1089-1095`) contra `server.js:182`; e os payloads do EAD (`login.html:80`, `registro.html:95`, `checkout.html:117,169,199`, `player.html:565`) contra `ead/routes.js:311,355,538,884` |
| Campos retornados pelo backend × consumidos pelo frontend | Renderizadores de `portal/admin.html` (linhas 547,557,589,627-630,691,751,799,801,1047,1059), `portal/cliente.html` (632-636,681-692,817-832) e EAD (`cursos.html:203-223`, `meus-cursos.html:86`, `player.html:566-580`) confrontados com os `res.json(...)` correspondentes |
| Nomes divergentes (camelCase × snake_case) | Não há divergência de *case*: todo o sistema usa `snake_case` nos dois lados. A divergência real é de **idioma** — PT no frontend, EN no backend: **#6**, **#9**, **#10**, **#13**, **#14** |
| Tipos incompatíveis | **#7** (string `'inativo'` × `BOOLEAN ativo`). Numéricos verificados: o backend já aplica `Number(...)` nas agregações (`portal/routes.js:925,927,660-662,752-754`) e o frontend reaplica `Number(...)` antes de formatar (`cliente.html:519,532`) — sem incompatibilidade |
| Campos obrigatórios ausentes | **#6** — `client_id` exigido em 3 rotas e nunca enviado; no caso da ata, sequer existe no payload |
| Campos opcionais tratados como garantidos | Verificado e **sem achado grave**: os renderizadores usam `\|\| '-'`, `?? '-'` ou `\|\| 0` de forma consistente. O caso limítrofe é `fmtCurrency(null) → 'R$ 0,00'` (`cliente.html:519`), que transforma ausência em zero — registrado como agravante de **#11** |
| Estruturas aninhadas divergentes | Verificadas as três respostas aninhadas: `/portal/api/clients/:id` devolve `{...cliente, contracts, summary:{...}}` (`portal/routes.js:311-319`) — órfã (#2); `/ead/api/courses/:slug` devolve `modules[].aulas[]` via `json_agg` (`ead/routes.js:284-291`), consumido corretamente em `curso-detail.html:117` e `checkout.html:97`; `/api/admin/leads/:id` devolve `{...lead, events}` (`server.js:320`), consumido em `admin/index.html:485`. Sem divergência |
| Enums/constantes com valores diferentes | Conferidos e **coerentes**: `tipo` (`consultoria\|auditoria\|treinamento\|diagnostico\|reuniao`) bate entre o `<select>` (`admin.html:929-933`) e o `tipoLabel` (`admin.html:420-426`); `metodo` (`pix\|boleto\|transferencia\|cartao`) idem (`admin.html:980-983` × `:431`). Ressalva registrada na Seção 3: nenhum deles tem `CHECK` no banco |
| Formatos de data/hora e timezone | **#12** (off-by-one verificado por execução). Também conferido `fmtDateInput` (`admin.html:412-417`): **não** tem o mesmo defeito — testado com `Date` local e com string UTC, devolve a data correta nos dois casos |

---

## AUTOCHECK — Seção 3

| Subitem exigido | Verificado onde |
|---|---|
| Comparar schema/models/migrations com o uso real | Li os 16 blocos `CREATE TABLE` (`server.js:130-157`, `portal/routes.js:63-143`, `ead/routes.js:31-180`) e confrontei cada coluna com grep de uso em `.js` e `.html`, incluindo os 5 arquivos de seed. **Migrations não existem** — registrado como **#16** |
| Colunas órfãs | **#23** (5 colunas), **#19** (tabela inteira write-only), **#21** (2 colunas write-only). Falsos positivos descartados após checar os seeds: `ead_courses.objetivo` (lida em `curso-detail.html:187`), `contracts.data_inicio/data_fim` (lidas em `cliente.html:821-822`), `mp_preference_id` (escrita em `ead/routes.js:965`, usada como rastro do MP), `total_questions`/`correct_answers` (escritas em `:568` — órfãs por consequência de #19, não isoladamente) |
| Campos usados que não existem no banco | **#7** (`portal_users.status`), **#11** (`events.valor`), **#13** (`contracts.descricao`/`numero`) — todos confirmados contra o `CREATE TABLE` correspondente |
| Tipos divergentes | **#7** (string × `BOOLEAN`). Numéricos conferidos: `NUMERIC` chega como string no driver e o código aplica `Number(...)` nos dois lados (`portal/routes.js:925,927`; `cliente.html:519,532`) — sem divergência |
| Nullable inconsistente | Conferido caso a caso. Um achado real: `events.horas` é `NOT NULL` mas `valor_hora` é nullable (`portal/routes.js:102-103`), então o cálculo proposto em **#11** produz `NULL` quando não há hora-valor — registrado como risco daquele item. Também: `leads.email` e `leads.telefone` são ambos nullable (`server.js:135-136`) enquanto a API exige ao menos um (`server.js:186`) — regra de negócio não refletida no schema, impacto baixo demais para item próprio |
| Defaults divergentes | Conferidos os 14 `DEFAULT` do projeto contra o valor que o código grava. Todos coerentes: `leads.status DEFAULT 'novo'` × `server.js:294`; `contracts.status DEFAULT 'ativo'` × `portal/routes.js:366`; `ead_orders.status DEFAULT 'pendente'` × `:911`; `portal_users.role DEFAULT 'cliente'` × `:268`. **Sem achado** |
| Falta de índices em busca/JOIN | **#17** (`leads`/`lead_events`, zero índices). Também `portal_users.role`, filtrado em `portal/routes.js:245,649,772` sem índice, e `ead_courses (ativo, ordem)` em `ead/routes.js:260` — ambos com cardinalidade baixa e volume pequeno, incluídos na correção proposta de #17 e não elevados a item próprio. Os 23 índices existentes foram conferidos: todos cobrem uma query real, **exceto** os 2 de `ead_quiz_attempts` (**#19**) |
| Foreign keys ausentes | **#20** (`ead_quiz_attempts.module_id`, única FK faltante). **#18** cobre as 19 FKs que existem mas sem `ON DELETE` |
| Migrations fora de sincronia | Não se aplica no sentido literal — **não há migrations**. O risco equivalente (schema de produção divergir do código sem detecção) é o núcleo de **#16** |
| Relacionamentos mal modelados | **#25** (duas identidades sem relação + `requireEadAdmin` cruzando as duas), **#24** (`role` que o código exige e nunca produz). Os demais relacionamentos foram conferidos e estão corretos: `ead_courses → ead_modules → ead_lessons` com cascata coerente, `UNIQUE(user_id, course_id)` em `ead_enrollments` (`ead/routes.js:133`) e `UNIQUE(user_id, lesson_id)` em `ead_progress` (`:147`) impedindo duplicidade |

---

## AUTOCHECK — Seção 4

| Subitem exigido | Verificado onde |
|---|---|
| Erros não tratados, async/promises sem tratamento | **#28** (`initDB().catch(console.error)` em `server.js:160-162` — servidor sobe mesmo com o DDL falhando). Varri todos os `await sql` do backend: **todos** estão dentro de `try/catch` de rota, nenhuma promise fica sem `catch`. Sem achado adicional |
| Exceções engolidas | **#34** (as duas piores — engolem e afirmam sucesso), **#35** (9 pontos que engolem e omitem), **#26** e **#27** (o `catch` do webhook converte erro em 200). Os `catch (_) {}` de envio de e-mail (`ead/routes.js:344`, `:1056`) foram avaliados e **considerados corretos**: falha de e-mail não deve derrubar cadastro nem matrícula. O `catch {}` de `localStorage` (`player.html:1342,1348`) idem — modo privado do navegador |
| Inputs de rotas sem validação | **#31** (`status`/`notes` sem validação), **#32** (`answers`/`moduleId` sem validação). Conferidas as demais entradas: `/api/contact` valida nome + (email ou telefone) (`server.js:186`); registro do EAD valida senha ≥ 6 (`ead/routes.js:313`); as rotas de criação do portal validam obrigatórios (`portal/routes.js:974,1066,514`) — a validação existe, o problema é o **nome** do campo (#6), não a ausência da guarda |
| Status codes incorretos | **#26** (200 onde deveria ser 500), **#27** (200 onde deveria ser 401), **#28** (200 onde deveria ser 503), **#31** (500 onde deveria ser 400). Verificado também: `409` em e-mail duplicado (`portal/routes.js:291`, `ead/routes.js:318`) ✅, `429` nos rate limits ✅, `403` × `401` distinguidos corretamente em `requireAdmin` (`portal/routes.js:164-176`) ✅ |
| Mensagens de erro inconsistentes | Achado registrado dentro de **#6**: o usuário recebe `"client_id, data, tipo e horas sao obrigatorios"` — nome de campo interno, em inglês, num painel em português. Idioma das mensagens também é misto entre módulos (portal sem acentuação: "nao configurado"; EAD com acentuação: "não configurado") — tratado na Seção 14 (Bloco F), não duplicado aqui |
| Race conditions | **#29** (`SELECT`-then-`INSERT` na matrícula gratuita). Verificado que o webhook **está** protegido por `status != 'aprovado'` + `ON CONFLICT DO NOTHING` (`ead/routes.js:1033,1037`), e que `/lesson/:id/complete` usa `ON CONFLICT … DO UPDATE` (`:489`) — corretos |
| Queries N+1 | **Nenhuma encontrada.** Varri por `await` dentro de laço no backend: o único laço é a renderização de seções do PDF de ata (`portal/routes.js:619`), sem query dentro. As listagens que poderiam virar N+1 usam subquery correlacionada (`ead/routes.js:258-259,395-397`) e há 7 usos de `Promise.all` para paralelizar (`server.js:264,315`; `portal/routes.js:302,648,742,830,912`). **Sem achado** |
| Transações ausentes em operações múltiplas | **#26** (webhook: `UPDATE` + `INSERT`), **#29** (matrícula: 2 `INSERT`). Verificado que `PATCH /api/admin/leads/:id` **já usa** `sql.transaction` (`server.js:340-351`) ✅ — é o único ponto do sistema que usa transação, e serve de modelo para as duas correções |
| Null/undefined não tratados | **#31** (`notes.slice` em `null`), **#32** (`answers[...]` em `undefined`). Verificados e **sem risco**: os acessos encadeados usam optional chaining de forma consistente (`req.session?.portalUser`, `mpData.point_of_interaction?.transaction_data?.qr_code`, `eventsAgg[0]?.total_horas`). `nome.split(' ')[0]` aparece em 4 pontos de e-mail (`server.js:219`, `portal/routes.js:277`, `ead/routes.js:335,1050`) sempre após validação de `nome` obrigatório |
| Condições de borda — listas vazias | Verificado: todos os renderizadores tratam lista vazia com mensagem própria (`admin.html:583,681`; `cliente.html:627,671`; `cursos.html:205`). **Sem achado** — mas ver #35, em que "vazio" é usado indevidamente para representar "erro" |
| Condições de borda — paginação e limites | **#30** (10 rotas sem paginação), **#33** (`offset` negativo). O `limit` está corretamente limitado nos dois extremos onde existe (`Math.min(… \|\| 100, 500)`) ✅ |
| Condições de borda — valores extremos | Verificado: `score` protegido contra divisão por zero (`ead/routes.js:564`: `questions.length > 0 ? … : 0`) ✅; `Number(course.preco)` convertido antes de ir ao Mercado Pago (`:918,950`) ✅; upload limitado a 10 MB (`portal/routes.js:23`) ✅; corpo JSON limitado a 100 kb (`server.js:61`) ✅. **Sem achado adicional** |

---

## AUTOCHECK — Seção 5

| Subitem exigido | Verificado onde |
|---|---|
| Rotas sem autenticação que deveriam ter | Enumerei as 87 rotas e isolei as sem middleware. **Portal: zero desprotegidas** — todas as 47 têm `requireAuth` ou `requireAdmin`. **EAD: 8 públicas**, todas justificadas — `/promo`, `/courses`, `/courses/:slug` (catálogo público), `/register`, `/login`, `/logout` (fluxo de entrada, com limitador), `/certificate/:code` (verificação pública por design, ver **#46**) e `/webhook/mp` (autenticado por HMAC, ver #27). `GET /admin` (`server.js:258`) serve o HTML sem auth, mas é apenas a tela de digitação da chave e a API por trás exige `Bearer` — **sem achado** |
| Rotas sem autorização adequada | **#36** (matrícula não verificada), **#38** (propriedade do arquivo não verificada). Verificado e **correto**: PDF de ata restringe cliente ao próprio registro via `AND a.client_id = ${user.id}` (`portal/routes.js:580`); `/ead/api/order/:id/status` filtra por `AND user_id = ${userId}` (`ead/routes.js:1077`); as demais rotas `/me/*` derivam o ID da sessão, nunca do parâmetro |
| Permissão verificada só no frontend | **Nenhum caso encontrado.** Toda tela protegida tem contrapartida no servidor: `/portal/admin` exige `requireAdmin` (`portal/routes.js:1190`), `/ead/player/:slug` exige `requireEadAuth` (`ead/routes.js:1111`) e a API do player revalida a matrícula (`:419-420`). **Sem achado** |
| Injeção SQL/NoSQL | **Nenhuma.** Grep por concatenação em SQL não retorna nada: as ~120 queries usam exclusivamente tagged templates do driver Neon, que parametriza. Conferi individualmente os pontos com entrada do usuário — `slug`, `email`, `code`, `status`, `metodo` — todos interpolados como parâmetro. **Sem achado, e é um ponto forte do projeto** |
| XSS | **#42** (portal do cliente e EAD sem escape). Verificado como **correto**: `portal/admin.html` escapa consistentemente com `esc()` (`:435`); as OG tags dinâmicas do certificado escapam com função própria (`ead/routes.js:1132`); o modal de ata usa `textContent` (`cliente.html:753`). Relacionado: `ead_lessons.conteudo` é HTML por natureza e injetado no player sem escape — correto por design, mas depende de a origem permanecer restrita |
| Dados sensíveis em logs/respostas/URLs | **#41** (senha em texto puro na resposta). **Logs verificados**: os 30+ `console.error` registram apenas contexto e o objeto de erro, sem corpo de requisição; `server.js:228` loga `Lead #id: nome (interesse)` — nome é dado pessoal em log, ponto a retomar na Seção 17. **URLs**: nenhuma credencial ou token em query string; `?order=` e `?code=` carregam apenas identificadores |
| Secrets hardcoded ou versionados | Único fallback embutido é `SESSION_SECRET \|\| 'anderstech-dev-only'` (`server.js:73`), **protegido** pela guarda de produção que encerra o processo se a variável faltar (`server.js:64-67`) — comportamento correto. `.env` está no `.gitignore` e `git log --all -- .env` confirma que **nunca foi commitado**. **#44** cobre o risco correlato de `uploads/` fora do `.gitignore` num repositório público |
| CORS mal configurado | `origin: IS_PROD ? 'https://anderstech.net' : true` com `credentials: true` (`server.js:57-60`). Em produção, restrito a uma origem ✅. Em desenvolvimento, `true` reflete qualquer origem com credenciais — permissivo, mas só vale fora de produção e a detecção de produção cobre `NODE_ENV` e `RAILWAY_ENVIRONMENT` (`:32`). **Sem achado** |
| Cookies/sessões sem flags adequadas | Flags conferidas em `server.js:76-81`: `httpOnly: true` ✅, `secure: IS_PROD` ✅, `sameSite: 'lax'` ✅, `maxAge` de 24 h ✅, store no PostgreSQL em vez de memória ✅. O que falta não é flag, é **#37** (ausência de `regenerate`) e **#45** (logout do EAD sem `destroy`) |
| Senhas sem hash adequado | **Correto em todos os pontos.** `bcrypt.hash(senha, 10)` no portal (`portal/routes.js:264`) e no EAD (`ead/routes.js:320`); comparação com `bcrypt.compare` (`portal/routes.js:204`, `ead/routes.js:365`); geração aleatória com `crypto.randomBytes(8)` (`portal/routes.js:263`). **Sem achado** — ressalva de exposição é #41, não de hashing |
| Tokens sem expiração | A `ADMIN_KEY` é estática e não expira (`server.js:238`), e o painel a guarda em `localStorage` — tratado na Seção 8/6 quanto a armazenamento; aqui registro **#47** sobre a comparação. Sessões expiram em 24 h ✅ |
| IDs previsíveis expostos | Verificados os três geradores: nome de upload usa `crypto.randomUUID()`, 122 bits ✅; código de certificado usa `randomBytes(4)`, 32 bits — **#46**; IDs de recurso são `SERIAL` sequenciais e **expostos** em `/portal/api/clientes/:id` etc., o que seria enumeração se não houvesse autorização — como `requireAdmin` cobre todas essas rotas, não há achado, mas é a razão pela qual #36 e #38 importam |
| Upload sem validação de tipo/tamanho | **#43**. Tamanho **está** validado (10 MB, `portal/routes.js:23`) ✅; o tipo é validado contra valor declarado pelo cliente ✗ |
| Rate limiting ausente em rotas sensíveis | Cobertura conferida: `/api/contact` 5/min ✅ (mas burlável, **#39**), `/portal/login` 10/15min ✅, `/ead/api/login` 10/15min ✅, `/ead/api/register` 5/h ✅. **Ausente** em `POST /ead/api/checkout` (`ead/routes.js:880`), que cria pedido e chama a API do Mercado Pago a cada requisição — registrado como parte de **#40** na proposta de correção, e retomado na Seção 19 (Bloco G) pelo ângulo de integridade de pagamento. Qualidade dos limitadores existentes: **#40** |

---

## AUTOCHECK — Seção 6

| Subitem exigido | Verificado onde |
|---|---|
| Variáveis de ambiente usadas × documentadas | Comparei as **13** lidas no código (grep de `process.env.*`) com as **12** do `.env.example`, uma a uma. Única divergência: **#52** (`RAILWAY_ENVIRONMENT`). Nenhuma variável documentada está órfã — todas as 12 são efetivamente lidas |
| Valores hardcoded que deveriam ser configuráveis — URLs | **#49** (4 URLs do Mercado Pago). Também conferidos: links de e-mail (`ead/routes.js:339,1051`; `emails.js:30,59,66-68`) e `og:url` do certificado (`ead/routes.js:1137`) — mesma causa, incluídos na correção proposta de #49 |
| Valores hardcoded — chaves | **#50** (ID do GA4). A chave do IndexNow (`f6ba…`) aparece em `ci.yml:78` e como arquivo `.txt` na raiz — **correto por design**: o protocolo exige que a chave seja publicamente acessível nesse formato. Sem achado |
| Valores hardcoded — dados de contato | **#51** (46 ocorrências do WhatsApp, 31 do e-mail, 23 do CNPJ) |
| Valores hardcoded — portas | `PORT` vem do ambiente com fallback `3001` (`server.js:22`) ✅. **Sem achado** |
| Configurações divergentes entre ambientes | **#48** (CI referencia arquivo que não existe mais), **#49** (impossível exercitar pagamento fora de produção), **#50** (analítica sem separação). Conferido e **correto**: `IS_PROD` governa CORS, `secure` do cookie e a guarda de `ADMIN_KEY` de forma coerente (`server.js:32,58,80,240`) |
| Arquivos sensíveis versionados | `.env` está no `.gitignore` e nunca foi commitado (verificado em todo o histórico) ✅. `HANDOFF.md` e `GOOGLE-BUSINESS-PROFILE.md` foram inspecionados por padrões de segredo: contêm **instruções** de como gerar segredos (`openssl rand -base64 32`), nunca valores ✅. O risco real está em **#44** (`uploads/` fora do `.gitignore` em repositório público), já registrado no Bloco B |

---

## AUTOCHECK — Seção 7

| Subitem exigido | Verificado onde |
|---|---|
| Dependências declaradas e nunca usadas | **#54** (`pg`). Dois **falsos positivos descartados** após verificação: `@sentry/node` não aparece em grep de `import … from`, mas é carregado por `import()` dinâmico (`server.js:25`) ✅; `dotenv` idem, é importado pelo subpath de efeito colateral `import 'dotenv/config'` (`server.js:1`) ✅. As outras 11 dependências têm import direto confirmado |
| Dependências usadas e não declaradas | **Nenhuma.** Todo import externo do projeto resolve para um pacote declarado em `package.json`; os demais são módulos nativos do Node (`crypto`, `fs`, `path`, `url`) |
| Versões com vulnerabilidades conhecidas | **#53** — `npm audit --omit=dev` executado: 1 baixa, 3 moderadas, **0 altas, 0 críticas**, todas transitivas. Avaliei a aplicabilidade real de cada uma à configuração deste projeto |
| Versões muito desatualizadas | `npm outdated` executado. Nenhuma defasagem relevante: `@sentry/node` 10.56→10.70, `helmet` 8.2→8.3, `pg` 8.22→8.23 e `resend` 6.12→6.20 são atualizações *minor* dentro do range declarado; `pdfkit` 0.18.0→0.19.1 é a única fora do range, e é *minor* em versionamento 0.x. **Sem achado** — nenhuma dependência está em versão abandonada ou com salto *major* pendente |
| Duplicação de bibliotecas com a mesma função | Único caso é a coexistência de **dois clientes PostgreSQL** — driver HTTP da Neon para as queries e `pg` com pool TCP para o store de sessão. Analisado em #54 e **considerado justificado**: `connect-pg-simple` exige pool persistente, que o driver HTTP não oferece. Registrado como observação, não como achado. Nenhuma outra sobreposição (um framework HTTP, uma lib de PDF, uma de e-mail, uma de hash) |

---

## AUTOCHECK — Seção 8

| Subitem exigido | Verificado onde |
|---|---|
| Código morto — arquivos | **#56** (`shared.js`, `fix-accents.cjs`) |
| Código morto — funções | **#56** (`requireEadAdmin`, parâmetro `title` de `defaultItems`). Contei as referências das 11 funções auxiliares do backend: as outras 9 (`normalizeTitle`, `detectFields`, `detectColumns`, `extractListItems`, `drawTable`, `safePath`, `send404`, `sendPage`, `buildBreadcrumbSchema`) têm ao menos um chamador real ✅ |
| Código morto — rotas | **#2** (16 rotas nunca consumidas) e **#4** (ramo de quiz por módulo), ambos do Bloco A |
| Duplicação de lógica | **#55**, com as quatro frentes verificadas por `diff`: `PUT`/`PATCH` idênticos exceto uma string; `loginRateLimit` em duas cópias mais `regRateLimit` como terceira; `sql`/`resend` instanciados 3× cada; templates de e-mail divididos entre `emails.js` e HTML inline no EAD |
| Duplicação front × back com comportamento divergente | Verificado: a validação de formulário existe nos dois lados e **é coerente** — obrigatoriedade de nome/e-mail no `app.js` × `server.js:186`, senha ≥ 6 em `registro.html` × `ead/routes.js:313`. A divergência real é de **nome de campo** (#6), não de regra. Sem achado novo |
| Padrões inconsistentes — nomenclatura | Coberto por **#2** e **#6** (PT × EN em rotas e campos), que são a inconsistência estrutural do projeto. Nomenclatura de arquivos e pastas conferida e **coerente** |
| Padrões inconsistentes — estrutura de pastas | Conferida e **consistente**: `portal/` e `ead/` seguem o mesmo formato (`routes.js` + páginas). **Sem achado** |
| Padrões inconsistentes — tratamento de erro | **#57** (guarda `!sql` com três respostas diferentes). Em contrapartida, o formato `try/catch` + `console.error` + `500` é seguido por **todas** as ~90 rotas sem exceção ✅ |
| TODOs/FIXMEs esquecidos | **Nenhum.** Grep por `TODO`, `FIXME`, `HACK`, `XXX` e `@deprecated` em `.js` e `.html`: as 4 ocorrências são todas falso positivo de "TODOS OS DIREITOS RESERVADOS" no rodapé. **Sem achado — ponto positivo** |
| `console.log` de debug esquecido | **Nenhum de debug.** As 5 ocorrências no backend são de ciclo de vida legítimo: inicialização do Sentry (`server.js:28`), das tabelas (`portal/routes.js:145`, `ead/routes.js:182`) e do servidor (`server.js:415`). A quinta, `console.log(\`Lead #${leadId}: ${nome}…\`)` (`server.js:228`), é intencional mas registra **nome de pessoa física em log** — encaminhado à Seção 17 (Bloco F), onde o critério de LGPD se aplica, em vez de tratado aqui como sujeira de debug |

---

---

## AUTOCHECK — Seção 9

| Subitem exigido | Verificado onde |
|---|---|
| Estados de loading ausentes | Conferidos os marcadores de carregamento por página: `player.html` 6, `cliente.html` 5, `cursos.html` 3, `curso-detail.html` 3, `checkout.html` 3, `meus-cursos.html` 2. **Todas as telas que consomem API têm estado de carregamento** — sem achado |
| Estados de erro ausentes | Coberto por **#35** (Bloco B): 9 pontos capturam a falha e renderizam vazio, sem distinguir "erro" de "sem dados". Aqui não há achado novo — o problema é de tratamento, não de ausência de marcação |
| Memory leaks — timers | **#58** (`setInterval` do PIX sem parada). Verificados os demais: `admin/index.html:242` cria `refreshTimer` e **tem** `clearInterval` no logout (`:232`) ✅; os ~14 `setTimeout` restantes são de curta duração para toast e animação, todos autoextinguíveis ✅ |
| Memory leaks — listeners | Verificado: as páginas são multipágina (sem SPA), então cada navegação descarta o documento e seus listeners junto. Os `addEventListener` são registrados uma vez por carregamento, sobre elementos que vivem enquanto a página existir. **Não se aplica** no sentido clássico de vazamento acumulativo |
| Memory leaks — subscriptions | **Não se aplica** — não há WebSocket, EventSource nem observável em nenhuma página |
| Formulários sem validação | Verificado: todos os formulários validam no cliente **e** no servidor. Contato (`app.js:191-197` × `server.js:186`), registro do EAD (`registro.html:93` valida coincidência de senha × `ead/routes.js:312-313` valida obrigatórios e tamanho mínimo), login e modais do portal (`admin.html:1071,1091,1116,1132`). **Sem achado** |
| Validação divergente da do backend | Uma divergência conferida e **avaliada como não-achado**: o registro do EAD não checa no cliente o mínimo de 6 caracteres que o backend exige (`ead/routes.js:313`). O resultado é uma ida ao servidor a mais com a mensagem correta exibida (`registro.html:104`) — atrito de UX, não brecha: nenhum dado inválido passa. A divergência **relevante** é de nome de campo, registrada em #6 |
| Renderizações com dados possivelmente nulos | Verificado no Bloco B (autocheck da Seção 4): os renderizadores usam `\|\| '-'`, `?? '-'` ou `\|\| 0` de forma consistente. O caso em que ausência vira zero está em **#11** |
| Chaves de lista instáveis | **Não se aplica** — não há framework com reconciliação de lista. As tabelas são reconstruídas por `innerHTML` a cada carga, sem conceito de chave |
| Rotas de navegação quebradas | **Nenhuma.** Extraí os **56 links internos únicos** de `inject.js`, `glossario/render.js` e de todas as páginas, e verifiquei cada um contra as rotas registradas no backend e os arquivos em disco. **Todos resolvem** — sem achado |
| Armazenamento no cliente | **#59** (chave de administrador em `localStorage`), **#60** (anotações do aluno só no navegador). O terceiro uso, `at_exit_shown` (`app.js:278-283`), é flag de exibição de popup — apropriado para `localStorage` ✅ |

---

## AUTOCHECK — Seção 10

| Subitem exigido | Verificado onde |
|---|---|
| Queries pesadas sem paginação | **#30** (Bloco B): 10 rotas de listagem sem `limit`/`offset` |
| Dados demais trafegados por requisição | Relacionado a #30. Verificado também que as rotas de listagem usam `SELECT *` (`portal/routes.js:940,1156` e outras), trazendo colunas nunca consumidas — inclusive as órfãs de **#23**. Impacto pequeno com o volume atual, incluído na correção proposta de #30 |
| Chamadas de API redundantes | **#62** (três idas ao servidor no carregamento, com `/promo` duplicando dado que `/courses` já traz) |
| Chamadas de API em loop | **#58** (`setInterval` do PIX que nunca para). Nenhum outro laço de requisição encontrado — o auto-refresh do painel de leads (60 s, `admin/index.html:242`) é intencional e tem parada |
| Ausência de cache onde óbvio | **#61** (cerca de 45 páginas sem cache, com leitura de disco por requisição). Conferido o que **está** correto: glossário (`server.js:365`), sitemap (`:85`) e estáticos com `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` (`server.js:91-98`) ✅ |
| Operações bloqueantes em fluxos críticos | **#61** — `readFileSync` em 4 pontos do caminho de requisição (`server.js:110,118`; `ead/routes.js:1093,1120`). Verificados e **corretos**: a geração de PDF usa stream (`doc.pipe(res)`, `portal/routes.js:591`, `ead/routes.js:633,832`), e as chamadas ao Mercado Pago são `await fetch` assíncronas ✅ |
| Peso das páginas | Medido: `player.html` 100 KB, `admin.html` 52 KB, `index.html` 48 KB, `styles.css` 44 KB, páginas de conteúdo entre 36 e 44 KB. São valores altos para HTML mas coerentes com páginas de conteúdo longo e sem bundler; `compression` está ativo (`server.js:34`) ✅. **Sem achado próprio** — o custo de renderização por requisição é #61, e a otimização de recursos para Core Web Vitals pertence à Seção 13 (Bloco E) |

---

## AUTOCHECK — Seção 11

| Subitem exigido | Verificado onde |
|---|---|
| Cobertura de testes | **#63** — zero. Executei `npm test` (`Missing script: "test"`), busquei `*.test.js`, `*.spec.js` e `__tests__/` (nenhum arquivo) e conferi `devDependencies` (nenhuma) |
| Módulos críticos sem teste | **#63**, com o impacto dimensionado por módulo: pagamento (`ead/routes.js:880-1069`), autorização e contratos de dados — os três onde os Blocos A e B concentraram os achados de maior consequência |
| Testes quebrados ou desativados | **Não se aplica** — não existem testes para estar quebrados. Registrado explicitamente para não confundir ausência com aprovação |
| Warnings/erros no build | **Não há build.** O projeto serve HTML, CSS e JS direto, sem bundler, transpilador ou etapa de compilação — confirmado no mapa do projeto e em `package.json:6-10`. O equivalente mais próximo é a verificação de sintaxe do CI, tratada em **#48** |
| Scripts quebrados | Os três scripts de `package.json` foram conferidos: `start` e `dev` apontam para `server.js`, que existe e sobe; `seed` aponta para `ead/seed.js`, que existe. **Sem achado**. O script ausente é `test` (**#63**) |
| Saúde do pipeline | **#48** (Bloco C) — vermelho desde 18/07/2026 por `test -f sitemap.xml` sobre arquivo removido. Não reaberto aqui; a Seção 11 acrescenta o que falta **além** do pipeline estar quebrado: mesmo verde, ele não executaria teste algum |
| Ferramental de qualidade | Verificado: nenhum ESLint, Prettier, Biome ou `.editorconfig` no repositório. Consolidado em **#63** |

---

## AUTOCHECK — Seção 12

| Subitem exigido | Verificado onde |
|---|---|
| Auditar TODAS as URLs públicas | Sondei o servidor em execução com `curl`, cobrindo as seis famílias: raiz, `/blog` e `/blog/:slug`, `/:slug` de `pages/`, `/glossario` e `/glossario/:slug`, `/ead/*` e os arquivos de infraestrutura. Também sondei caminhos de arquivo interno — foi assim que **#64** apareceu |
| IDs numéricos, hashes ou query strings onde deveria haver slug | **Nenhum caso em URL pública.** Todo conteúdo indexável usa slug descritivo. Identificadores numéricos aparecem só em rotas autenticadas (`?order=`, `/portal/api/*/:id`), sem indexação. **Sem achado** |
| Slugs — formato | Minúsculas, hifenizados, sem acento em todas as famílias. O servidor **impõe** o formato via `/^[a-z0-9-]+$/` (`server.js:407` e `:376`). **Sem achado** |
| Slugs — unicidade | Garantida no banco para o EAD (`ead_courses.slug TEXT UNIQUE`, `ead/routes.js:34`) e pelo sistema de arquivos para blog e páginas. **Sem achado** |
| Slugs — estabilidade e 301 ao mudar | **Não há mecanismo de redirecionamento** — nenhum `res.redirect(301)` no projeto (**#66**). Renomear arquivo quebra a URL antiga com 404. Risco latente: nenhum slug foi alterado até agora |
| Hierarquia de URLs | Rasa e coerente, no máximo três níveis (`/ead/curso/:slug`). **Sem achado** |
| Redirects — 301 para URLs antigas | Ausente por completo — **#66** |
| Redirects — cadeias | **Nenhuma.** O único redirecionamento é `/ead` para `/ead/cursos` (`ead/routes.js:1099`), de um salto só |
| Redirects — 302 onde deveria ser 301 | `/ead` responde **302** (verificado por `curl`), quando o correto seria 301. Impacto pequeno — uma URL só, destino no sitemap — incluído na correção de **#66** |
| www × sem-www e http para https | **Fora do código** — resolvido na camada Railway/DNS, não verificável neste repositório. Precisa ser confirmado no painel; encaminhado ao HANDOFF |
| Páginas inexistentes retornando 200 | **#67** e **#64**. O catch-all está **correto**: `/nao-existe` e `/blog/nao-existe` retornam 404 real, verificados |
| Soft 404 | **#67** |
| Trailing slash gerando duplicata | **#66** — verificado nas quatro famílias, todas servindo 200 nas duas formas |
| Maiúsculas/minúsculas gerando duplicata | **Nenhuma.** `/Blog` e `/BLOG` retornam 404 pela validação de slug. Registrado em #66 como ponto correto |

---

## AUTOCHECK — Seção 13

| Subitem exigido | Verificado onde |
|---|---|
| Renderização — conteúdo visível ao Googlebot | **#65**, medido sem executar JS: `/ead/curso/:slug` entrega **zero** conteúdo do curso (o nome sequer aparece) e `/ead/cursos` entrega a grade como `class="loading"`. Em contraste, `/quanto-custa-certificacao-iso` entrega 36 KB com 25 parágrafos. As 24 páginas estáticas, 9 do blog e 84 do glossário são **todas SSR** |
| Title — existência e unicidade | Todas as páginas têm exatamente 1 `<title>`. A falha de unicidade está em **#65**: os 4 cursos compartilham o mesmo |
| Meta description | Presente em todas as páginas estáticas, blog e glossário. **Ausente** em `/ead/curso/:slug` (**#65**) |
| Headings — H1 único e hierarquia | Verificado: **exatamente 1 `<h1>` por página** nas 11 URLs sondadas, incluindo as do EAD. **Sem achado** |
| Dados estruturados | Bom volume: 3 blocos JSON-LD na home, 2 nas páginas de conteúdo, 2 no glossário, 3 nas regionais (com `LocalBusiness`), e `BreadcrumbList` injetado no servidor para toda rota (`inject.js:116-131`). A lacuna é o tipo `Course`, tratada em **#65** |
| Open Graph e Twitter Cards | Presentes em todas as páginas estáticas. **Ausentes** em `/ead/cursos` e `/ead/curso/:slug` (**#65**). A página de certificado tem OG **dinâmico** e correto (`ead/routes.js:1133-1139`) |
| Canonical | Presente e correta nas páginas estáticas, blog e glossário. **Ausente** em `/ead/curso/:slug` (**#65**). Nenhuma canônica conflitante |
| Controle de duplicação — filtros, paginação, UTMs | Não há paginação nem filtro em URL pública. UTMs são capturados por JS e vão no corpo do formulário (`app.js:205-207`), sem gerar URL indexável. **Sem achado** |
| sitemap.xml | Dinâmico (`sitemap.js`), **123 URLs**, referenciado no `robots.txt`. Confere com o disco e exclui corretamente `pages/404.html` e `blog/_template.html`. **Sem achado** |
| robots.txt | Existe, bloqueia `/portal/`, `/admin/`, `/uploads/` e `/api/`, e libera explicitamente rastreadores de IA. **Não bloqueia** os caminhos expostos por **#64** — mas robots.txt é orientação, não controle de acesso; a correção pertence a #64 |
| Meta robots / noindex | Presente na home. Nenhuma página importante com `noindex` acidental. A que **deveria** ter é `pages/404.html` (**#67**) |

| Imagens — alt | **100% das imagens têm `alt`** — relevante também para a Seção 15 |
| Imagens — lazy loading | 11 de 13 na home, com as primeiras ansiosas de propósito |
| Imagens — dimensões declaradas | **#68** — nenhuma imagem declara `width`/`height` |
| Imagens — formatos modernos | `assets/` usa `.jpg` e `.png`; WebP/AVIF renderiam ganho de peso. Registrado dentro de **#68** como recomendação secundária |
| Imagens — nomes de arquivo descritivos | Parcial: `logo-horizontal-transparent.png` e `og-image.png` descrevem; `blog-01.jpg` a `blog-04.jpg` e `case-01.jpg` a `case-05.jpg` são genéricos. Ganho marginal em busca por imagem — não elevado a item próprio |
| Core Web Vitals no código | **#68** (deslocamento de layout) e **#61** (custo de renderização por requisição). Verificados e **corretos**: `preconnect` para as duas origens de fonte e `display=swap` (`index.html:28-30`), `compression` ativo, `Cache-Control` de 7 dias em estáticos. Não há bundle de JS — o site não usa framework |
| Links internos — âncoras descritivas | Verificadas: nenhuma âncora genérica do tipo "clique aqui". Os textos descrevem o destino |
| Links internos — alcançabilidade | Rodapé injetado em todas as páginas com 10 links de navegação e 7 regionais (`inject.js:44-55`): páginas principais a 1 clique de qualquer lugar |
| Links internos — quebrados | **Nenhum.** Os 56 links internos únicos foram verificados no Bloco D, um a um |
| Breadcrumbs com dados estruturados | `BreadcrumbList` gerado no servidor para toda rota (`inject.js:116-131`), com rótulos legíveis por slug. Observação: o schema existe, mas **não há trilha visual** na página — o dado serve ao buscador e não ao usuário; ponto de UX para a Seção 16 (Bloco F) |
| Mobile — viewport | Declarado. CTA sticky e menu móvel implementados (`inject.js:29-37,65-76`) |
| Página 404 customizada e status correto | `pages/404.html` existe e é servida com **404 real** pelo catch-all. O defeito é responder 200 no caminho direto (**#67**) |
| hreflang / idioma | `lang="pt-BR"` declarado. `hreflang` ausente e **correto** — o site é monolíngue. **Sem achado** |
| Notificação de conteúdo novo | **#69** (IndexNow com lista fixa de 8 URLs contra 123 do sitemap) |

---

## AUTOCHECK — Seção 14

| Subitem exigido | Verificado onde |
|---|---|
| Revisar textos visíveis — páginas | **#70**: 264 ocorrências sem acentuação numa amostra de 25 palavras, em 26 de 36 páginas públicas |
| Revisar textos visíveis — mensagens de erro | Contadas por módulo: `portal/routes.js` **108**, `ead/routes.js` **56**, `server.js` **13**. As do portal são sistematicamente sem acento — 45× "nao ", 14× "sao ", 9× "obrigatorios", 21× "configurado", 19× "encontrado". Consolidado em **#70** por ser a mesma causa, com o agravante de **#6**: o usuário recebe "client_id, data, tipo e horas sao obrigatorios", nome de campo interno em inglês num painel em português |
| Revisar textos visíveis — e-mails | Os quatro templates de `emails.js` foram lidos: acentuação correta. Os dois inline do EAD (`ead/routes.js:336-342,1048-1054`) idem. **Sem achado** — a divergência ali é de centralização (**#55**), não de texto |
| Ortografia, acentuação, cedilha | **#70** |
| Concordância e gramática | Revisados os textos de interface e os quatro templates de e-mail: sem erro de concordância. Os problemas são de acentuação, não de gramática. **Sem achado adicional** |
| Encoding — charset no HTML | `charset="UTF-8"` declarado em **51 de 51** arquivos HTML. **Sem achado** |
| Encoding — header HTTP | Verificado por `curl -I`: `Content-Type: text/html; charset=utf-8` nas páginas estáticas e no glossário. **Sem achado** |
| Encoding — banco e e-mails | Nenhum sinal de corrupção (nada de "Ã§") em nenhum ponto do sistema. O conteúdo do EAD já passou pelo `fix-accents.cjs`. **Sem achado** — registrado em #70 que a causa não é encoding, é digitação |
| Textos em inglês na interface | Verificado: a interface é integralmente em português. As exceções são nomes de campo técnico vazando em mensagem de erro (`client_id`), coberto por **#6**. **Sem achado próprio** |
| Padronização de tom e termos | Um caso real: o mesmo recurso é "cliente" no portal e "usuário" no banco (`portal_users`), e o EAD usa "aluno". Como cada termo vive num contexto distinto e coerente, não gera confusão ao usuário. **Sem achado** |
| Formatos — datas | `toLocaleDateString('pt-BR')` em 6 arquivos ✅. O defeito é de fuso, não de formato — **#12** |
| Formatos — moeda | `style: 'currency', currency: 'BRL'` com `toLocaleString('pt-BR')` ✅. **Sem achado** |
| Formatos — telefone, CPF/CNPJ/CEP | **Sem máscara e sem validação.** O campo CNPJ é `<input type="text">` livre (`portal/admin.html:902`), e telefone idem. Impacto baixo: são campos preenchidos pelo próprio administrador, não pelo público, e não alimentam integração fiscal. Registrado aqui em vez de item próprio |
| Busca interna ignorando acentos | **#75** — o painel de leads não normaliza; o player do EAD normaliza |

---

## AUTOCHECK — Seção 15

| Subitem exigido | Verificado onde |
|---|---|
| Textos alternativos em imagens | **100% das imagens têm `alt`** — medido no Bloco E sobre o HTML entregue (13/13 na home, 1/1 nas páginas de conteúdo). **Sem achado** |
| Labels em campos de formulário | Conferido em 5 telas — `portal/login.html` 2 inputs / 2 labels, `ead/pages/login.html` 2/2, `ead/pages/registro.html` 6/6, `portal/admin.html` 16/30, `admin/index.html` 2/3. **Todos os campos rotulados.** Sem achado |
| Contraste de cores | Avaliado sobre a paleta declarada (navy `#0b1730`, vermelho `#c5383c`, texto sobre branco). As combinações principais — texto escuro sobre fundo claro e branco sobre navy — têm folga confortável sobre o mínimo AA. Não encontrei par de baixo contraste em elemento de leitura. **Sem achado**, com a ressalva de que verificação definitiva exige ferramenta de medição sobre a página renderizada, fora do alcance da análise estática |
| Tamanhos de fonte fixos | **#76** — 74 declarações em `px` contra 15 em unidade relativa |
| Navegação por teclado | Possível: os controles são `<button>` e `<a>` nativos, sem `div` clicável substituindo elemento interativo. **Sem achado** |
| Foco visível | 6 declarações de `:focus` / `:focus-visible` em `styles.css` ✅. **Sem achado** |
| Ordem de tabulação lógica | **Nenhum `tabindex` positivo** em todo o projeto — a ordem segue o DOM, que é o comportamento correto. **Sem achado** |
| HTML semântico | `<header>`, `<nav>`, `<main>`, `<footer>` presentes; ações usam `<button>` e navegação usa `<a>`. **Sem achado** |
| Atributos ARIA | Usados onde fazem falta: `aria-label` no botão de menu e no FAB de WhatsApp, `aria-expanded` no toggle móvel com atualização por JS (`inject.js:26,37,61,67`), `aria-label` nas duas `<nav>`. **Sem achado** |
| Skip link | Injetado em todas as páginas (`inject.js:78,137`), com estilo próprio em `styles.css` ✅ |
| `lang="pt-BR"` | Declarado ✅ (verificado no Bloco E) |

---

## AUTOCHECK — Seção 16

| Subitem exigido | Verificado onde |
|---|---|
| Comportamentos inconsistentes entre telas | Verificado: o portal admin usa modal para criar e editar as quatro entidades, de forma uniforme; o EAD usa página dedicada em todo o fluxo de compra. Cada módulo é internamente coerente. **Sem achado** |
| Feedback ausente após ações | Presente e consistente: `showToast` no portal admin (`admin.html:449-455`), no painel de leads (`index.html:600`), no player (`player.html:433`) e na home (`app.js:176`). Onde o feedback **mente** está em **#34** (sucesso falso) e **#35** (erro omitido), ambos do Bloco B |
| Estados vazios sem orientação | Todos os renderizadores tratam lista vazia com mensagem própria — verificado no Bloco D (`admin.html:583,681`; `cliente.html:627,671`; `cursos.html:205`). **Sem achado** |
| Ações destrutivas sem confirmação | As três exclusões do portal admin têm `confirm()` — evento (`admin.html:714`), pagamento (`:771`) e ata (`:857`) ✅. Não há outra ação destrutiva no sistema. **Sem achado** |
| Duplo clique gerando duplicados | Botões são desabilitados no envio em todos os formulários — portal admin, checkout do EAD (3 pontos), login, registro e home. **Sem achado no frontend.** A proteção que falta é do lado do servidor, contra requisições concorrentes que não passam pelo botão: **#29** |
| Recuperação e alteração de senha | **#71** — ausente nos dois módulos |
| Trilha de navegação visual | `BreadcrumbList` é gerado como dado estruturado para toda rota (`inject.js:116-131`), mas **não há breadcrumb visível** na página. O buscador enxerga a hierarquia e o visitante não. Impacto pequeno em site raso de três níveis; registrado aqui e não elevado a item próprio |
| Fluxo de pagamento sem saída | Coberto por **#58** (Bloco D): pagamento recusado deixa o usuário em "Aguardando pagamento" indefinidamente, sem mensagem e sem alternativa |

---

## AUTOCHECK — Seção 17

| Subitem exigido | Verificado onde |
|---|---|
| Dados pessoais coletados sem necessidade | Avaliado campo a campo. O formulário de contato pede nome, empresa, e-mail, telefone, interesse e mensagem — todos justificáveis para retorno comercial. O checklist acrescenta **cargo**, que é descartado sem uso (**#15**): dado coletado sem finalidade é exatamente o que o princípio da necessidade veda. O portal armazena CNPJ, adequado ao contexto B2B. **Sem achado próprio** — o caso do `cargo` já está registrado |
| Dados pessoais trafegados sem proteção | HTTPS em produção com cookie `secure` ✅. A exceção é **#41**: senha em texto puro no corpo da resposta HTTP |
| Dados pessoais armazenados sem proteção | Senhas com `bcrypt` ✅. Demais dados em texto claro no banco, o que é normal para dado cadastral não sensível. **Sem achado** |
| Dados sensíveis em logs | **#73** — nome de pessoa em `server.js:228`. Os 30+ `console.error` restantes foram conferidos: registram contexto e objeto de erro, sem corpo de requisição, sem credencial |
| Ausência de política de privacidade | **Existe** (`pages/politica-de-privacidade.html`, 125 linhas) e é substantiva — menciona anonimização, eliminação, portabilidade, revogação, encarregado e DPO ✅. Também há termos de uso (75 linhas) ✅ |
| Aviso de cookies | **#72** — ausente, com GA4 injetado incondicionalmente antes de qualquer manifestação |
| Exclusão/anonimização de dados | **#73** — prometida na política, sem nenhuma rota que a realize, e bloqueada no schema por **#18** |
| Consentimento para comunicações | **#72** — os dois lead magnets disparam e-mail automático sem manifestação registrada |
| Exposição pública de dado pessoal | **#46** (Bloco B): verificação de certificado é pública, sem limitador, e devolve nome do aluno. Reavaliado aqui sob o critério de LGPD e mantido em BAIXO — a publicidade é a função do recurso, e o espaço de 2³² torna a varredura impraticável |

---

## AUTOCHECK — Seção 18

| Subitem exigido | Verificado onde |
|---|---|
| Logs existem | Sim: 5 `console.log` de ciclo de vida e mais de 30 `console.error` cobrindo todas as rotas. **Sem achado** |
| Nível de log adequado | Adequado — não loga demais (nada de log por requisição) nem de menos (todo `catch` registra). **Sem achado** |
| Logs não expõem dados sensíveis | **#73** (nome de pessoa). Nenhuma credencial, token ou corpo de requisição é registrado — verificado nos 30+ pontos |
| Erros do servidor registrados de forma rastreável | Parcialmente. Cada `console.error` tem prefixo de contexto ("Portal evento create error:", "EAD webhook error:"), o que permite localizar a origem ✅. O que falta é correlação: não há identificador de requisição, então dois erros simultâneos não se distinguem. O Sentry (`server.js:24-30`) resolveria isso, mas é opcional e depende de `SENTRY_DSN`. Registrado dentro de **#74** |
| Healthcheck da aplicação | **#74** — nenhum |
| Tratamento de indisponibilidade do banco | **#28** (22 rotas mascarando como 200), **#57** (três respostas diferentes para a mesma condição) e **#74(b)** (inicialização que não falha alto) |
| Rotinas de backup referenciadas | **#74(c)** — nenhuma referência no repositório. O Neon provavelmente cobre o banco, mas não está registrado; os uploads não estão cobertos de forma alguma (**#44**) |
| Monitoramento de erro em produção | Sentry integrado e bem posicionado (`server.js:24-30`), com `tracesSampleRate` de 0.1 ✅. Ativação condicionada a `SENTRY_DSN`, que está documentada no `.env.example` como opcional. Registrado em **#74** que captura exceção, não indisponibilidade de dependência |

---

## AUTOCHECK — Seção 19

| Subitem exigido | Verificado onde |
|---|---|
| Mapear o fluxo — checkout | `POST /ead/api/checkout` (`ead/routes.js:880`) com três caminhos: promoção gratuita (`:893-900`), PIX via API de pagamentos (`:908-938`) e cartão via Checkout Pro (`:941-967`). Mapeado por leitura integral |
| Mapear o fluxo — criação da cobrança | PIX cria pedido `pendente` e chama `/v1/payments` com `X-Idempotency-Key: ead-${orderId}` (`:916`) ✅ — chave de idempotência correta. Cartão cria preferência em `/checkout/preferences` (`:946`) |
| Mapear o fluxo — confirmação | Webhook `POST /ead/api/webhook/mp` (`:977`) mais polling de status pelo frontend (`checkout.html:187`) |
| Mapear o fluxo — falha | `rejected` e `cancelled` atualizam o pedido (`:1060-1061`), mas **o frontend nunca os observa** (**#58**) |
| Mapear o fluxo — estorno e cancelamento | **#77** — não existem |
| Webhook existe | Sim (`:977`) ✅ |
| Webhook valida assinatura | Sim — HMAC-SHA256 sobre `id;request-id;ts` (`:1008-1017`), fail-closed sem o segredo ✅. Defeitos de borda em **#27** (buffer de tamanho diferente lança e devolve 200) |
| Webhook trata todos os eventos relevantes | **#77** — trata 3 de 9 status; faltam `refunded`, `charged_back`, `in_mediation`, `in_process`, `authorized`, `pending` |
| Webhook é idempotente | **Parcialmente sim** ✅ — a guarda `WHERE id = ? AND status != 'aprovado'` (`:1033`) somada a `ON CONFLICT DO NOTHING` na matrícula (`:1037`) impede efeito duplicado no caminho de sucesso. A falha é a ausência de transação entre as duas escritas (**#26**), que permite estado parcial permanente |
| Valores — preço calculado no backend | **Correto, e é um ponto forte.** O preço vem sempre de `course.preco`, lido do banco: `transaction_amount: Number(course.preco)` (`:918`) e `unit_price: Number(course.preco)` (`:950`). O frontend envia **apenas** `{ courseSlug, metodo }` nas três chamadas (`checkout.html:117,169,199`) — **nunca um valor**. Sem achado |
| Consistência de estado banco × gateway | **#26** (webhook perdido ou falha parcial), **#77** (estorno não reflete), **#79** (nenhuma tela onde a divergência apareceria). O polling do frontend só observa `aprovado` (**#58**) |
| Divergência entre tela de checkout e o cobrado | Nenhuma: a tela lê `c.preco` de `/ead/api/courses/:slug` e o backend cobra `course.preco` da mesma origem. Uma única fonte de verdade ✅. **Sem achado** |
| Cupons e descontos | **Não se aplica** — não existe sistema de cupom no projeto. O único desconto é `preco_original` exibido riscado (`cursos.html:212`), que é rótulo de vitrine e não afeta o valor cobrado. Verificado, não omitido |
| Falhas de pagamento — retry | Do lado do gateway, o retry depende do webhook devolver erro; hoje devolve 200 em qualquer falha (**#26**). Do lado do usuário, não há mensagem nem caminho alternativo (**#58**) |
| Falhas de pagamento — acesso cortado sem aviso | **Não se aplica** — não há acesso recorrente a cortar. A compra é única e o acesso é vitalício |
| Dados de cartão no backend próprio | **Nenhum dado de cartão toca o sistema.** Busca por `card_number`, `cvv`, `security_code` e equivalentes: zero ocorrências. O fluxo de cartão redireciona para o Checkout Pro do Mercado Pago (`:964-966`), mantendo o escopo PCI fora da aplicação ✅. **Ponto forte** |
| Logs com dado de cartão | Impossível por construção, pelo item acima ✅ |
| Reembolso e cancelamento — fluxo | **#77** |
| Registro e auditoria de transações | **#79** |

---

## AUTOCHECK — Seção 20

> **Nota de aplicabilidade.** O projeto **não é um SaaS por assinatura**. O EAD vende curso avulso com pagamento único e acesso vitalício (`ead_enrollments` não tem data de expiração — `ead/routes.js:127-134`), e o portal é área de acompanhamento de consultoria, sem plano nem cobrança recorrente. Não existem tabelas de plano, assinatura, limite de uso ou período de teste — as 16 tabelas foram mapeadas no início deste relatório. Os subitens de assinatura estão portanto registrados como **não se aplica**, com a justificativa, e **não foram omitidos**. Os subitens que **se aplicam** — controle de acesso a conteúdo pago, lógica de oferta por prazo e promessa da página de vendas × produto real — foram auditados normalmente.

| Subitem exigido | Verificado onde |
|---|---|
| Mapear planos e features por plano | **Não se aplica** — não há planos. O catálogo é de 4 cursos avulsos (`ead_courses`), cada um com preço próprio, sem níveis nem pacotes |
| Feature gating verificado no backend | **Aplica-se por analogia** — o equivalente ao plano é a matrícula. Verificado: `ead_enrollments` é consultado no player (`ead/routes.js:419`), na aula (`:453`), no quiz (`:514,545`) e no template (`:608`) ✅. A exceção é **#36**, a única rota da família sem a checagem |
| Feature acessível por chamada direta à API | **#36** — marcar aula como concluída não valida matrícula |
| Limites de uso por plano | **Não se aplica** — não há limite de uso a aplicar |
| Funcionalidades sem verificação nenhuma | **#36**, e o inverso registrado em #64: o código-fonte exposto facilita descobrir exatamente qual rota não valida |
| Trial — início, duração e fim | **Aplica-se por analogia** à promoção de lançamento. Lógica em `promo.js:5-6,22`: data por variável de ambiente em ISO 8601 com offset explícito (`-03:00`) e comparação direta `new Date() < PROMO.fim`. **O tratamento de fuso está correto** — o offset no literal elimina a ambiguidade que causa **#12** em outros pontos ✅ |
| Trial — o que acontece ao expirar | Verificado por execução: `promoAtiva()` retorna **false** desde 29/07. O checkout deixa de matricular grátis e passa ao caminho pago (`ead/routes.js:893`). **Dados preservados** — quem se matriculou durante a promoção mantém a matrícula, pois não há expiração nem revogação ✅, o que **cumpre** a promessa "mantenha o acesso permanente". Os problemas da virada estão em **#78** (home não acompanhou) e **#80** (dependência de env sem alerta) |
| Trial — usuário consegue burlar | A promoção era aberta a qualquer cadastro, por desenho — não havia o que burlar. Após a expiração, `promoAtiva()` é avaliado **no servidor** a cada checkout, então manipular data no cliente não tem efeito ✅. A janela real de abuso é o `metodo: 'promo'` enviado pelo frontend (`checkout.html:117`): o backend **ignora** o campo e decide por `promoAtiva()` — comportamento correto ✅ |
| Trial — avisos de fim próximo | Não existem. Como a promoção não gera cobrança ao terminar, a ausência não causa dano ao usuário; o dano está em **#78**, na comunicação desatualizada |
| Ciclo de assinatura — aviso de renovação | **Não se aplica** — não há renovação |
| Ciclo de assinatura — upgrade, downgrade, pró-rata | **Não se aplica** — não há planos entre os quais migrar |
| Ciclo de assinatura — downgrade com dados acima do limite | **Não se aplica** — não há limites |
| Ciclo de assinatura — cancelamento e acesso até o fim do período | **Não se aplica** ao modelo recorrente. O correlato é o estorno de compra única, tratado em **#77** |
| Ciclo de assinatura — inadimplência e carência | **Não se aplica** — não há cobrança recorrente que possa ficar inadimplente |
| Promessa da landing × produto — features anunciadas | Extraídas as promessas de `checkout.html` e `curso-detail.html`: "Acesso vitalício ao conteúdo completo" ✅ (matrícula sem expiração), "Templates e ferramentas para download" ✅ (`/ead/api/template/:lessonId`), "Certificado de conclusão" ✅ (emitido ao passar na prova final), "Casos reais anonimizados" ✅ (conteúdo presente nos seeds). **A exceção é "Quizzes por módulo + avaliação final"** — a avaliação final existe, mas o quiz por módulo **nunca é chamado pelo frontend** (**#4**): a rota existe, o dado existe nos seeds, e não há botão que o acione. É promessa de página de vendas sem contrapartida no produto |
| Promessa da landing × produto — limites anunciados | **Não se aplica** — nenhum limite numérico é anunciado |
| Promessa da landing × produto — preços | Coerentes: a vitrine (`cursos.html:212`) e o checkout (`checkout.html:140`) leem `preco` e `preco_original` da mesma rota que o backend usa para cobrar ✅. **#78** é divergência de **oferta** (gratuidade expirada), não de preço |
| Promessa da landing × produto — textos desatualizados | **#78** — a home anuncia acesso gratuito até uma data já vencida |
| Features que existem e não são anunciadas | Levantadas duas: **anotações por aula** no player (`player.html:1335-1349`) e **compartilhamento social da conclusão**, nenhuma mencionada nas páginas de venda. A primeira só vale anunciar depois de **#60** (hoje as anotações não persistem no servidor). Oportunidade de marketing, não defeito |

## TABELA-RESUMO

### Por severidade

| Severidade | Qtd | Itens |
|---|---|---|
| CRÍTICO | 4 | #1, #6, #7, #26 |
| ALTO | 19 | #2, #3, #8, #9, #10, #16, #18, #27, #34, #36, #37, #39, #48, #49, #64, #65, #70, #71, #77 |
| MÉDIO | 40 | #4, #11, #12, #13, #17, #19, #20, #21, #22, #28, #29, #30, #31, #32, #35, #38, #40, #41, #42, #43, #44, #50, #51, #53, #54, #55, #56, #58, #59, #60, #61, #63, #66, #67, #68, #72, #73, #74, #78, #79 |
| BAIXO | 17 | #5, #14, #15, #23, #24, #25, #33, #45, #46, #47, #52, #57, #62, #69, #75, #76, #80 |
| **Total** | **80** | |

> Contagem conferida no Bloco H a partir do arquivo. As 5 severidades ajustadas na revisão final estão justificadas na seção **Revisão**: #26 subiu para CRÍTICO; #17, #28, #38 e #63 desceram para MÉDIO.

### Por seção

| Seção | Itens | Qtd |
|---|---|---|
| 1 — Rotas × chamadas de API | #1, #2, #3, #4, #5 | 5 |
| 2 — Contratos de dados | #6, #7, #8, #9, #10, #11, #12, #13, #14, #15 | 10 |
| 3 — Banco de dados × código | #16, #17, #18, #19, #20, #21, #22, #23, #24, #25 | 10 |
| 4 — Erros e bugs | #26, #27, #28, #29, #30, #31, #32, #33, #34, #35 | 10 |
| 5 — Segurança | #36, #37, #38, #39, #40, #41, #42, #43, #44, #45, #46, #47 | 12 |
| 6 — Configuração e ambiente | #48, #49, #50, #51, #52 | 5 |
| 7 — Dependências | #53, #54 | 2 |
| 8 — Qualidade e consistência | #55, #56, #57 | 3 |
| 9 — Frontend específico | #58, #59, #60 | 3 |
| 10 — Performance | #61, #62 | 2 |
| 11 — Testes e build | #63 | 1 |
| 12 — URLs amigáveis | #64, #66, #67 | 3 |
| 13 — SEO on-page e tração orgânica | #65, #68, #69 | 3 |
| 14 — Textos, idioma e encoding | #70, #75 | 2 |
| 15 — Acessibilidade | #76 | 1 |
| 16 — UX e consistência | #71 | 1 |
| 17 — Privacidade e LGPD | #72, #73 | 2 |
| 18 — Observabilidade e operação | #74 | 1 |
| 19 — Pagamentos | #77, #79 | 2 |
| 20 — SaaS, promoção e promessa da landing | #78, #80 | 2 |

### Concentração por arquivo

| Arquivo | Itens que o citam |
|---|---|
| `ead/routes.js` | #4, #8, #16, #18, #19, #20, #21, #22, #23, #25, #26, #27, #29, #32, #36, #37, #40, #45, #46, #49, #55, #56 |
| `portal/routes.js` | #1, #2, #3, #6, #7, #9, #10, #11, #13, #14, #15, #16, #18, #22, #23, #24, #25, #30, #37, #40, #41, #43, #44, #55, #57 |
| `server.js` | #5, #15, #16, #17, #18, #22, #28, #31, #33, #38, #39, #40, #47, #50, #52, #55, #57 |
| `portal/admin.html` | #1, #3, #6, #7, #9, #10, #12, #13, #14, #15, #30, #55 |
| `portal/cliente.html` | #11, #12, #35, #42 |
| `.github/workflows/ci.yml` | #48, #56, #63, #69 |
| `ead/pages/curso-detail.html` | #62, #65 |
| `inject.js` (SSR compartilhado) | #50, #51, #56, #68 |
| `ead/pages/checkout.html` | #29, #58, #79 |
| `promo.js` / `index.html` (oferta) | #78, #80 |
| `ead/pages/player.html` | #8, #60 |
| `admin/index.html` | #31, #59 |
| `inject.js` | #50, #51, #56 |
| `pages/*.html` (conteúdo público) | #15, #34, #70 |
| `admin/index.html` (painel de leads) | #31, #59, #75 |
| `styles.css` | #76 |

O Portal (backend + admin + cliente) segue concentrando os 3 críticos. O EAD lidera em volume, com os achados de pagamento (#26, #27, #29, #49) e autorização (#36).

---


---

## REVISÃO (Bloco H)

Segunda passada sobre o relatório inteiro, conduzida como auditor independente e cético: reabrir cada item no código, confirmar que o problema existe **exatamente** como descrito, remover falso positivo, reavaliar severidade e procurar o que a primeira passada não procurou.

### Números da revisão

| Métrica | Resultado |
|---|---|
| Itens reabertos e verificados | **80 de 80** |
| Referências `arquivo:linha` validadas automaticamente | **405 únicas** |
| Referências corrigidas por imprecisão | **4 itens** (#1, #11, #15, #42) |
| Itens removidos como falso positivo | **0** |
| Descrições corrigidas por erro factual | **1** (#28) |
| Severidades ajustadas | **5** (#17, #26, #28, #38, #63) |
| Seções que receberam segunda passada | **5** (3, 4, 5, 13, 19) |
| Numeração global | íntegra, 1–80, sem lacuna e sem duplicata |

### Verificação das referências

Extraí as **405** referências `arquivo:linha` únicas do relatório e validei cada uma contra o código: arquivo existente e linha dentro do arquivo. Depois conferi o **conteúdo** das linhas citadas nos itens críticos e altos, e todas as de `portal/admin.html` e `portal/cliente.html` — os dois arquivos com mais citações.

Quatro imprecisões corrigidas. Nenhuma invalidou o achado; todas eram desvio de citação:

| Item | Estava | Correto | Situação |
|---|---|---|---|
| #1 | `portal/admin.html:1128` | `:1126-1127` | 1128 é `break;`. O achado (rota `PUT` inexistente) permanece confirmado |
| #11 | `cliente.html:692` para a soma | `:676,678` | 692 é a célula "Total"; a soma está em 676-678 |
| #15 | `admin.html:1076` para `email` | `:1077` | 1076 é `empresa` |
| #42 | 5 pontos, 2 deles errados | 12 pontos reais | `:730` e `:785` não eram interpolação. Levantei os 12 pontos reais por grep |

Também identifiquei **70 referências abreviadas** (`admin.html:1047`, `routes.js:973`) que são ambíguas fora do contexto do parágrafo — há dois `routes.js`, dois `admin.html` e dois `login.html` no projeto. Não são erros, mas obrigam o leitor a reconstruir o caminho pela prosa. Registro como limitação conhecida do relatório, a corrigir se ele vier a ser lido fora desta sequência.

### Severidades ajustadas

**Rebaixadas (3)** — o critério aplicado foi: ALTO exige efeito hoje, não risco latente.

- **#17** (`leads` sem índice) — **ALTO → MÉDIO**. Degradação latente, sem impacto no volume atual; correção de uma linha por índice.
- **#38** (`/uploads` sem autorização) — **ALTO → MÉDIO**. Reavaliei procurando trajetória de exploração e **não encontrei**: nenhuma rota entrega o `arquivo_path` a quem não seja o dono ou admin, e o nome tem 122 bits de entropia. Sem caminho demonstrável, ALTO superestimava. Permanece relevante porque o controle não existe — a proteção é sigilo de URL, não verificação.
- **#63** (zero testes) — **ALTO → MÉDIO**. É lacuna de processo que **amplifica** risco, não defeito que quebra algo. Mantê-la ao lado de #26 achatava a escala.

**Elevada (1)**

- **#26** (webhook sem transação, 200 no erro) — **ALTO → CRÍTICO**. Comparado aos outros três críticos, é mais grave: neles uma funcionalidade não funciona e o usuário percebe na hora; aqui **o dinheiro entra, o serviço não é entregue, e o guard de idempotência impede a autocorreção**. O estado inconsistente é permanente e silencioso.

**Rebaixada por correção factual (1)**

- **#28** (22 rotas mascarando banco ausente) — **ALTO → MÉDIO**, detalhado abaixo.

### Erro factual corrigido

**#28** afirmava que "uma falha de banco se apresenta como os dados sumiram". **Estava errado.** Verifiquei o mecanismo: `sql` é avaliado **uma única vez, no carregamento do módulo**, e só é `null` quando `DATABASE_URL` está **ausente**. Com a variável presente e o banco fora do ar, a query lança, cai no `catch` da rota e responde **500** — comportamento correto.

O cenário de "200 com dados vazios" é portanto **erro de configuração no deploy**, não indisponibilidade em tempo de execução. Bem mais estreito do que descrevi. O item foi reescrito e rebaixado.

### Falsos positivos: nenhum removido, dois quase

Nenhum dos 80 itens caiu na verificação. Dois chegaram perto e sobreviveram com a descrição ajustada:

- **#38** sobreviveu como MÉDIO após eu falhar em encontrar trajetória de exploração — o controle ausente é real, o risco imediato não.
- **#67** (soft 404) é consequência de #64 e poderia ser fundido nele. Mantive separado porque a correção difere: #64 exige remapear o servidor de estáticos, #67 se resolve com uma meta tag enquanto isso.

### Segunda passada por seção

Para cada seção perguntei o que um auditor experiente ainda procuraria. Cinco pontos fracos identificados e verificados — **todos passaram**, e por isso viram pontos positivos em vez de achados:

| Seção | O que faltava procurar | Resultado |
|---|---|---|
| 13 | Eu havia auditado o sitemap por contagem, sem testar se as URLs **respondem**. Testei as **123** por HTTP: **0 fora de 200** ✅ |
| 4 | Levantei no Bloco B a suspeita de que `parseInt` sem guarda de `NaN` causaria 500. **Não causa**: `/api/admin/leads/abc` responde **404**, porque o driver serializa `NaN` como nulo e a query não retorna linha. Foi correto eu **não** ter registrado como achado |
| 5 | *Mass assignment* — nunca verifiquei. Busca por `...req.body`, `Object.assign(req.body)` e `Object.keys(req.body)`: **zero ocorrências**. Todas as rotas desestruturam campos explicitamente ✅ |
| 3 | Colunas `NOT NULL` que o código pudesse inserir vazias. Conferidas as quatro (`events.horas`, `atas.data`, `payments.valor`, `leads.nome`): **todas têm guarda de obrigatoriedade** na rota correspondente ✅ |
| 19 | Se o frontend consegue forçar matrícula gratuita mandando `metodo: 'promo'`. **Não consegue**: o backend decide por `promoAtiva()` (`ead/routes.js:893`) e **ignora** o campo `metodo` nessa decisão — ele só escolhe entre PIX e Checkout Pro depois ✅ |

### Consistência

- **Itens relacionados referenciam-se mutuamente** — as cadeias principais são: #6 → #7 → #9 → #10 (contratos PT/EN do portal); #26 → #27 → #29 → #77 → #79 (integridade de pagamento); #18 → #73 (exclusão de titular); #48 → #63 → #69 (CI e verificação); #34 → #35 → #60 (interface que afirma o que não aconteceu); #16 → #20 → #22 → #71 (dependências do mecanismo de migração).
- **#64 permanece como item único**, com a origem registrada no corpo. Pertence à Seção 5 (divulgação de código-fonte) e às Seções 12 e 13 (conteúdo duplicado). Desdobrar em dois criaria referência circular sem ganho; renumerar quebraria as citações já feitas. Decisão: mantido em 12, com a dupla natureza explícita no texto.
- **Nenhum item duplicado a mesclar.** Os pares que se sobrepõem tratam de causas distintas com correções distintas: #28 × #57 (mascaramento × inconsistência de código de status), #34 × #35 (afirmar sucesso × omitir falha), #50 × #72 (separação de ambiente × consentimento).

### Contagem conferida

A tabela-resumo foi recontada a partir do arquivo, não da memória: **4 críticos, 19 altos, 40 médios, 17 baixos = 80**, batendo com os 80 blocos `####` presentes e com a numeração contínua de 1 a 80.

### Limitações desta auditoria

Registro o que **não** foi possível verificar, para que não se leia como aprovação:

1. **Variáveis de ambiente em produção** — não tenho acesso ao painel do Railway. **#80** depende disso e é o primeiro item a confirmar manualmente.
2. **Schema real do banco de produção** — sem `DATABASE_URL`, toda a Seção 3 foi auditada contra o DDL do código. Como não há migrações (**#16**), o banco real **pode** ter divergido. A migração `001` proposta em #16 exige extrair o schema real antes.
3. **Contraste de cores** — avaliado sobre a paleta declarada; medição definitiva exige ferramenta sobre a página renderizada.
4. **`www` × sem-`www` e http→https** — resolvidos na camada de plataforma, fora deste repositório.
5. **Comportamento real do Mercado Pago** — os fluxos de webhook foram auditados por leitura; nenhum pagamento de teste foi executado, porque **#49** torna isso impossível fora de produção.

## REGISTRO DE PROGRESSO

| Bloco | Seções | Status |
|---|---|---|
| A | 1, 2, 3 | ✅ **concluído** — 2026-08-17 (#1 a #25) |
| B | 4, 5 | ✅ **concluído** — 2026-08-17 (#26 a #47) |
| C | 6, 7, 8 | ✅ **concluído** — 2026-08-17 (#48 a #57) |
| D | 9, 10, 11 | ✅ **concluído** — 2026-08-18 (#58 a #63) |
| E | 12, 13 | ✅ **concluído** — 2026-08-18 (#64 a #69) |
| F | 14–18 | ✅ **concluído** — 2026-08-18 (#70 a #76) |
| G | 19, 20 | ✅ **concluído** — 2026-08-18 (#77 a #80) |
| H | 21 (revisão final) | ✅ **concluído** — 2026-08-18 |
| **Fase 2** | correção | ✅ **concluída** — 2026-08-18 · Mercado Pago → Asaas · treinamentos pagos |

**Último número global usado**: **#80** · **Auditoria completa: blocos A a H concluídos.**

### Pontos positivos confirmados (Blocos A a G)

Registrados porque delimitam o que **não** precisa de atenção e sustentam a avaliação de severidade dos itens acima:

- **SQL 100% parametrizado** — ~120 queries, todas em tagged template do driver Neon. Zero concatenação. Nenhuma injeção possível.
- **Hashing de senha correto** — `bcrypt` com custo 10 na escrita e `bcrypt.compare` na verificação, nos dois módulos.
- **Flags de cookie corretas** — `httpOnly`, `secure` em produção, `sameSite: 'lax'`, expiração de 24 h, store em PostgreSQL.
- **Autorização presente onde importa** — 47 de 47 rotas do portal protegidas; as 8 rotas públicas do EAD são todas justificadas.
- **Sem N+1** — as listagens usam subquery correlacionada e há 7 usos de `Promise.all`.
- **CORS restrito em produção** a uma única origem.
- **`.env` nunca foi commitado** — verificado em todo o histórico.
- **Segredo de sessão obrigatório em produção** — o processo encerra se faltar, em vez de cair no fallback de desenvolvimento.
- **Nenhum `TODO`/`FIXME`/`HACK` esquecido** e nenhum `console.log` de depuração no backend — os 5 logs existentes são de ciclo de vida.
- **Nenhuma dependência não declarada**, nenhuma vulnerabilidade alta ou crítica, nenhuma versão abandonada ou com *major* pendente.
- **Tratamento de erro uniforme** — as ~90 rotas seguem sem exceção o formato `try/catch` + `console.error` + `500`.
- **Estrutura de pastas coerente** — `portal/` e `ead/` com o mesmo formato.
- **Nenhum link de navegação quebrado** — os 56 links internos únicos foram verificados um a um contra rotas e arquivos.
- **Estados de carregamento presentes** em todas as telas que consomem API.
- **Validação em dois lados** — todo formulário valida no cliente e no servidor, com regras coerentes.
- **Cache e compressão corretos onde existem** — glossário, sitemap e estáticos com `Cache-Control` de 7 dias.
- **PDFs gerados por stream**, sem bufferizar em memória.
- **SEO on-page sólido no conteúdo estático** — as 24 páginas, 9 posts e 84 URLs do glossário são renderizadas no servidor, com `<title>`, `<meta description>`, `<link canonical>`, H1 único, Open Graph e JSON-LD próprios.
- **Sitemap dinâmico com 123 URLs**, referenciado no `robots.txt`, excluindo corretamente template e página de erro.
- **`BreadcrumbList` injetado no servidor** para toda rota, e `LocalBusiness` nas páginas regionais.
- **URLs limpas** — slugs descritivos em todo conteúdo indexável, sem ID numérico ou query string; formato imposto por validação no servidor.
- **100% das imagens com `alt`**, e `lazy loading` onde apropriado.
- **Fontes com `preconnect` e `display=swap`**; `robots.txt` libera rastreadores de IA explicitamente.
- **Acessibilidade em bom estado** — todos os campos rotulados, `:focus-visible` no CSS, nenhum `tabindex` positivo, landmarks semânticos, skip-link injetado, ARIA onde faz falta, `lang="pt-BR"`.
- **Encoding correto em todo o sistema** — `charset="UTF-8"` em 51 de 51 arquivos HTML e no header HTTP; nenhum sinal de corrupção.
- **Política de privacidade e termos de uso existem** e são substantivos, cobrindo os direitos do titular no texto.
- **UX consistente** — feedback por toast em todos os módulos, estados vazios com mensagem própria, confirmação nas três ações destrutivas, botões desabilitados no envio.
- **Formatos brasileiros corretos** para data e moeda (`pt-BR`, `currency: BRL`).
- **Preço 100% derivado do backend** — o frontend nunca envia valor; o cobrado vem sempre de `ead_courses.preco`.
- **Nenhum dado de cartão toca a aplicação** — o fluxo de cartão redireciona para o Checkout Pro, mantendo o escopo PCI fora do sistema.
- **Webhook com assinatura HMAC e idempotência** no caminho de sucesso, mais chave de idempotência na criação do PIX.
- **Fuso tratado corretamente na regra de promoção** — data em ISO 8601 com offset explícito, avaliada no servidor.
- **Acesso vitalício cumprido** — matrícula sem expiração, então quem entrou na promoção mantém o acesso prometido.
- **As 123 URLs do sitemap respondem 200** — testadas uma a uma por HTTP no Bloco H.
- **Sem *mass assignment*** — nenhuma rota faz spread de `req.body`; todas desestruturam campos explicitamente.
- **Identificador não-numérico em rota responde 404, não 500** — o driver trata `NaN` sem quebrar.
- **Colunas `NOT NULL` protegidas por guarda de obrigatoriedade** nas quatro rotas que as alimentam.
- **Gratuidade decidida no servidor** — o campo `metodo` enviado pelo frontend não influencia a decisão de matrícula gratuita.

### Observações para os próximos blocos

- **Base auditada**: working tree com as alterações não commitadas. Se elas forem commitadas ou revertidas antes do próximo bloco, revalidar os `arquivo:linha` deste relatório.
- **Pendências encaminhadas a blocos específicos**, já identificadas e fora do escopo de A e B:
  - Impossibilidade de excluir titular de dados (#18), nome de pessoa em log (`server.js:228`) e certificado público com dado pessoal (#46) → **Seção 17, Bloco F**
  - Armazenamento efêmero de contratos no Railway (#44) e ausência de healthcheck (#28) → **Seção 18, Bloco F**
  - **CI vermelho desde 18/07 (#48)** — a Seção 11 deve partir daí para avaliar cobertura de testes e saúde de build, sem reabrir o diagnóstico → **Seção 11, Bloco D**
  - Lista fixa de 8 URLs no ping do IndexNow (`ci.yml:66-88`) enquanto o sitemap é dinâmico e cobre blog, páginas e 83 termos do glossário — conteúdo novo nunca é notificado → **Seção 12/13, Bloco E**
  - `www` × sem-`www` e http→https são resolvidos na plataforma, fora deste repositório — confirmar no painel do Railway → **HANDOFF**

> Encerrados no Bloco C: `requireEadAdmin` e `shared.js` viraram **#56**; a inconsistência da guarda `!sql` virou **#57**.
> Encerrados no Bloco D: `ADMIN_KEY` em `localStorage` virou **#59**; a Seção 11 partiu de #48 sem reabrir o diagnóstico e acrescentou **#63**.
> Encerrados no Bloco E: a lista fixa do IndexNow virou **#69**; Core Web Vitals virou **#68**; a renderização por JS do EAD virou **#65**.
> Encerrados no Bloco G: estorno e chargeback viraram **#77**; a promoção expirada na home virou **#78**; a ausência de histórico virou **#79**; a dependência de env na virada para pago virou **#80**. O "quiz por módulo" prometido e não entregue foi confirmado como promessa quebrada e permanece registrado em **#4**.
>
> **Pendência operacional urgente**: **#80** exige confirmar no painel do Railway se `MP_ACCESS_TOKEN` e `MP_WEBHOOK_SECRET` estão configuradas. Se não estiverem, as vendas estão paradas desde 29/07 sem nenhum alerta. É o primeiro item a checar, antes de qualquer correção de código.

> Encerrados no Bloco F: acentuação inconsistente virou **#70**; redefinição de senha virou **#71**; exclusão de titular e nome em log viraram **#73**; healthcheck e backup viraram **#74**. O breadcrumb sem trilha visual e a ausência de máscara em CNPJ/telefone foram avaliados e registrados nos autochecks das Seções 16 e 14, sem item próprio.

> **Atenção para o Bloco H**: **#64** (raiz do projeto servida como diretório web) pertence tanto à **Seção 5** quanto às **Seções 12 e 13**. Foi encontrado no Bloco E, ao sondar URLs públicas — o Bloco B auditou o código de autorização, não o que o servidor de estáticos entrega. A revisão final deve decidir se o item é reclassificado, desdobrado ou mantido como está.
