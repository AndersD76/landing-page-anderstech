# HANDOFF — Anders Tech (seguranca + exposicao)

> Tudo que **EU (Daniel)** preciso configurar manualmente, agrupado por plataforma.
> Atualizado em 2026-06-06 apos auditorias `/seguranca` e `/exposicao`.

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

## Google Analytics

- **Ja configurado**: tag `G-7XL5XVE6QZ` injetada via SSR no server.js
- **Eventos de conversao**: `generate_lead` disparado em formulario de contato e lead magnet
- **Verificar**: analytics.google.com > Tempo real > abrir o site em outra aba
- **Configurar no GA4**: Admin > Events > marcar `generate_lead` como conversao

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
