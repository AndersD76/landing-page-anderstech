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

## 7. N/A para este projeto

- Domínio e DNS: já apontados
- `www` → apex e http → https: resolvidos na plataforma; confirme uma vez no painel
- Loja de aplicativos, push, CDN próprio: não se aplicam
