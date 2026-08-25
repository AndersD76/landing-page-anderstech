# HANDOFF — Anders Tech

O que **você** precisa configurar à mão. Tudo que era código já foi feito.

---

## 1. Railway → Variables (bloqueia venda)

Sem estas duas, o checkout devolve 503 e nenhuma matrícula é liberada. É
proposital — fail-closed é melhor que liberar curso sem pagamento —, mas
significa que **enquanto não forem preenchidas, não há venda**.

| Variável | Onde obter | Valor |
|---|---|---|
| `ASAAS_API_KEY` | Asaas → Integrações → Chave de API | cole a chave |
| `ASAAS_WEBHOOK_TOKEN` | você define, no passo 2 | mesma string do passo 2 |
| `APP_URL` | — | `https://anderstech.net` |

> ⚠️ **A chave que você colou no chat precisa ser trocada.** Gere uma nova no
> painel do Asaas — a anterior ficou registrada no histórico da conversa.

Já configuradas e que devem continuar: `DATABASE_URL`, `SESSION_SECRET`,
`ADMIN_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`.
Opcional: `SENTRY_DSN`, `ASAAS_API_URL` (só para apontar ao sandbox).

**Remover** (Mercado Pago saiu do projeto): `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`.

---

## 2. Asaas → Integrações → Webhooks

| Campo | Valor |
|---|---|
| URL | `https://anderstech.net/ead/api/webhook/asaas` |
| Token de autenticação | uma string longa e aleatória — **a mesma** de `ASAAS_WEBHOOK_TOKEN` |
| Versão | v3 |
| Eventos | Cobranças (todos) |

O webhook rejeita com 401 se o token não bater, e responde 500 em erro interno
para o Asaas reenviar — notificação de pagamento não se perde.

---

## 3. Railway → Settings → Healthcheck

| Campo | Valor |
|---|---|
| Path | `/healthz` |
| Timeout | 30s |

Responde 200 com `SELECT 1` no banco e 503 se o banco estiver fora. Sem isso a
plataforma não distingue "processo vivo" de "aplicação funcional".

---

## 4. Banco — primeira publicação após esta rodada

As migrações rodam sozinhas no boot. A `001_baseline` é toda `IF NOT EXISTS`:
**não altera nada num banco que já existe**. As de `002` a `006` são aditivas.

Confira depois do deploy:

```sql
SELECT version, applied_at FROM schema_migrations ORDER BY version;
-- esperado: 001_baseline .. 006_integridade
```

A `006` cria foreign keys com `ON DELETE CASCADE` em progresso, tentativas de
quiz, matrículas e eventos de lead. **Faça backup antes** (Neon → Branches →
criar branch do estado atual serve como ponto de restauração).

---

## 5. Google Search Console

- Reenviar `https://anderstech.net/sitemap.xml` (123 URLs)
- Pedir indexação das 4 páginas de treinamento, que passaram a ter title,
  description, canonical, Open Graph e schema `Course` com preço:
  `/ead/curso/<slug>` — elegíveis a rich result agora que são pagos

---

## 6. Backup — registrar a política

O Neon oferece recuperação a ponto no tempo, mas nada no projeto registra a
janela nem quando a restauração foi testada pela última vez. Anote aqui:

- Retenção configurada no Neon: `____`
- Último teste de restauração: `____`

**Uploads de contrato continuam sem backup** e sem persistência: o filesystem do
contêiner Railway é efêmero, então arquivo enviado pelo portal some no próximo
deploy. Resolver com storage externo (S3, R2, Supabase) — está pendente na
auditoria e não foi feito nesta rodada.

---

---

## 7. Telemetria (FASE 1) — Railway → Variables

O serviço central ainda não está no ar. Enquanto isso, o adaptador grava na
tabela `telemetry_events` do próprio Neon, **no schema do serviço central** — a
migração depois é um `INSERT ... SELECT`, não um retrabalho.

| Variável | Valor | Bloqueia? |
|---|---|---|
| `TELEMETRY_ENABLED` | `true` | não — ausente = ligado; só `false` desliga |
| `TELEMETRY_KEY` | **gerar no serviço central e colar aqui** | não (ainda não é usada) |
| `TELEMETRY_ENDPOINT` | deixar vazio até o central subir | não |

Nada aqui bloqueia venda ou deploy: sem as variáveis, a telemetria simplesmente
grava local. `TELEMETRY_ENABLED` é flag **própria** — não depende do `NODE_ENV`
que liga o GA4, então a telemetria funciona em dev e em produção. O gate de
consentimento (LGPD) vale para os dois: nada é enviado nem persistido antes de a
pessoa responder o banner.

### Quando o serviço central subir — a troca, em 3 passos

1. Preencher `TELEMETRY_ENDPOINT` e `TELEMETRY_KEY` no Railway.
2. Em `telemetry.js`, trocar o corpo da função `entregar()` — ela já recebe os
   eventos normalizados e validados; falta só o transporte HTTP. Nenhum outro
   arquivo muda.
3. Migrar o histórico:

```sql
INSERT INTO <central>.events
  (ts, app, event, anonymous_id, person_id,
   utm_source, utm_medium, utm_campaign, utm_content, props)
SELECT ts, app, event, anonymous_id, person_id,
       utm_source, utm_medium, utm_campaign, utm_content, props
FROM telemetry_events;
```

> ⚠️ **A tabela local chama `telemetry_events`, não `events`.** `events` já existe
> desde a `001_baseline` com outro significado (horas e eventos de consultoria do
> portal, com FK vinda de `atas.event_id`). As **colunas** são as do serviço
> central; só o nome local muda, e o `FROM` acima resolve.

### Confira depois do deploy

```sql
SELECT version FROM schema_migrations WHERE version = '009_telemetria';
SELECT event, COUNT(*) FROM telemetry_events GROUP BY event ORDER BY 2 DESC;
```

### Limitações conhecidas — decisões, não bugs

1. **O funil mede só quem consentiu.** Todo evento passa pelo gate do banner:
   quem recusa ou não responde não gera `page_view`, `cta_whatsapp_click` nem
   `form_submit`. As taxas do funil são, portanto, **sobre a base consentida** —
   viés de medição conhecido e aceito, em troca de conformidade com a LGPD. Ao
   comparar com números de outra fonte (GA4, Plausible, contagem de conversas no
   WhatsApp), a diferença é esperada e não indica perda de dado.
   O **lead em si nunca se perde**: `/api/contact` grava em `leads`
   independentemente do consentimento, com base legal própria.

2. **`cta_whatsapp_click` não fecha automaticamente com a conversa real.** O elo
   entre o clique e o que chega no WhatsApp é a **mensagem de origem**
   ("Olá! Vim pela página X") — leitura humana, feita por quem atende. A costura
   automática por número de telefone depende do serviço central de WhatsApp, que
   ainda não existe; quando existir, é lá que ela acontece, não aqui. Até então,
   `cta_whatsapp_click` mede **intenção de contato**, não conversa iniciada.

### Mapeamento dos eventos antigos → novos (duplo disparo em vigor)

Os eventos ad-hoc do GA4/Plausible **continuam disparando**, de propósito: o
histórico não pode ser quebrado enquanto a série nova não tiver volume. Quando
houver base de comparação, decidir o que aposentar.

| GA4 / Plausible (antigo, segue vivo) | Onde dispara | Evento literal novo |
|---|---|---|
| `contact` (method: whatsapp) | qualquer `a[href*="wa.me"]` (inject.js) | `cta_whatsapp_click` |
| `contact_whatsapp` | CTAs `[data-wa]` e sticky mobile (app.js) | `cta_whatsapp_click` |
| `whatsapp_click` / `whatsapp_sticky` (Plausible) | mesmos links | `cta_whatsapp_click` |
| `generate_lead` (contact) | formulário de contato | `form_submit` + `identify` |
| `generate_lead` (lead_magnet) | popup de saída / checklist | `form_submit` + `identify` |
| `form_submit` (Plausible) | formulário de contato | `form_submit` |
| `diagnosis_click` / `diagnosis_sticky` | CTA sticky "Agendar diagnóstico" | — sem equivalente literal ainda |
| `cta_click` (Plausible) | botões em geral | — sem equivalente literal ainda |
| `scroll_section` / `exit_intent_*` | home | — permanecem só no Plausible |
| — | páginas `/cases/<slug>` (FASE 4) | `case_view` |
| — | rota `/r/<código>` (FASE 4) | `artifact_scan` |

**Sem equivalente ainda** não é esquecimento: `page_view`, `cta_whatsapp_click`,
`form_submit`, `case_view` e `artifact_scan` são a lista fechada combinada. Criar
evento literal fora dela é o que estraga a base do serviço central.

### O que ainda NÃO existe (pendente das próximas fases)

- `case_view` e `artifact_scan` já estão implementados no adaptador e na lista de
  eventos válidos, mas **nada os dispara ainda** — dependem das páginas `/cases/`
  e da rota `/r/<código>`, que são da FASE 4.

## 8. N/A para este projeto

- Domínio e DNS: já apontados
- `www` → apex e http → https: resolvidos na plataforma; confirme uma vez no painel
- Loja de aplicativos, push, CDN próprio: não se aplicam
