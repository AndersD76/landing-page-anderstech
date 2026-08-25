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

---

## 8. Landing de conversão (FASE 2) — o que ficou para você

### 8.1 Imagens — RESOLVIDO, nada a fazer

Feito por `npm run optimize:images` (`scripts/optimize-images.mjs`, sharp como
devDependency). Rodar de novo é seguro: o script desfaz a forma anterior antes
de aplicar, então é idempotente mesmo depois de mudar a estratégia.

| | Antes | Depois |
|---|---|---|
| Os dois logos, somados | 305,6 KB | **13,4 KB** |
| Dimensão servida | 1831 × 859 | 192 × 90 (1x) e 384 × 180 (2x) |
| LCP no celular (4G) | 3,6 s | **2,2 s** |
| Performance mobile | 89 | **98** |

**Não gerou WebP, de propósito.** O pedido era WebP com PNG de fallback, mas a
medição contradiz a suposição: nestes logos — arte chapada com transparência —
o PNG com paleta dá 2,5 KB e o WebP dá 14,4 KB (lossless, 18,5 KB). Publicar um
`<source type="image/webp">` maior que o próprio fallback seria piorar de
propósito. A perda da quantização é imperceptível: comparando as derivadas com o
original, ambas compostas sobre o navy real da nav, o erro médio ficou em
0,26–0,55 de 255, concentrado nas bordas de antialiasing.

O script continua gerando e medindo os dois formatos a cada execução. Se um dia
entrar uma foto ali, o WebP vence sozinho e o `<picture>` aparece sem ninguém
mexer em código.

**`logo-nav.png` (375 KB) foi removido** — grep no repositório inteiro (HTML,
JS, CSS, configs, seeds do EAD, templates do portal) não achou uma única
referência. Está no histórico do git se precisar.

**Os PNGs originais continuam no repositório**, e devem continuar:
`ead/routes.js` usa `logo-horizontal-transparent.png` como `og:image` da página
de certificado. Preview social precisa de imagem grande — apontar para a
derivada de 192 px quebraria o card.

### 8.1.1 Se quiser os últimos 0,2 s de LCP no celular

O LCP hoje é 2,2 s, contra o alvo de 2 s. O que sobrou não é imagem:

| Alavanca | Ganho estimado | Custo |
|---|---|---|
| Minificar `styles.css` (51 KB, bloqueia a renderização por 165 ms) | ~100 ms | passa a existir um passo de build para o CSS |
| CSS crítico inline + resto assíncrono | ~200 ms | complexidade real de manutenção |
| GA4 carrega 69 KB de JS não usado | ~100 ms no TBT | trocar gtag.js por Measurement Protocol muda o tracking |

Nenhuma foi feita: as três mexem em como o site é construído ou medido, e isso
é decisão sua, não gold-plating meu. **Todos os critérios declarados já estão
atendidos** — Lighthouse ≥ 95 em tudo, nas duas plataformas, e a regra de 3 s
no 4G com folga.

### 8.2 `onclick=` no painel admin está morto em produção

Achado **fora do escopo da FASE 2**, encontrado porque o mesmo problema quebrou
uma mudança minha. O CSP do helmet aplica `script-src-attr 'none'`, que bloqueia
handler em atributo HTML. O Chrome registra:

```
Executing inline event handler violates the following Content Security Policy
directive 'script-src-attr 'none''
```

Afetados (não corrigidos nesta rodada):

- `admin/index.html` — ~13 botões e cabeçalhos de tabela com `onclick=`
  (login, atualizar, sair, exportar CSV, ordenação, abrir lead, salvar nota)
- `ead/pages/player.html:477` — `onclick=` dentro de HTML gerado por string

A correção é trocar atributo por `addEventListener`. **Não confirmei no navegador
se o painel está inteiramente inutilizável** — o CSP é claro, mas vale você abrir
`/admin` em produção e testar um botão antes de eu mexer.

### 8.3 Prova social — decisão sua

Cinco cases e um depoimento saíram da home: tinham nome de cliente e números não
verificáveis. Estrutura, o que cada um precisa para voltar e como republicar
(uma linha em `config/prova.js`) estão em **`PROVA-PENDENTE.md`**.

Enquanto nada estiver autorizado, a seção mostra um bloco honesto com CTA — não
fica vazia nem exibe `[PREENCHER]` para o visitante.

### 8.4 Textos marcados `[REVISAR]`

Seis blocos de copy novos aguardam sua validação. Encontre todos com:

```bash
grep -rn "REVISAR:" index.html
```

Eles são comentários HTML e **não vão para o HTML público em produção** — o
`injectShared` remove antes de servir. Em dev continuam visíveis no fonte.

### 8.5 Fontes agora são locais

Space Grotesk, Inter e Space Mono saíram do Google Fonts e vivem em
`assets/fonts/` (220 KB, todas sob SIL Open Font License 1.1). Motivo: bloquear
a folha de estilo não impede a troca de fonte, só atrasa o download do arquivo —
o CLS medido oscilava entre 0,05 e 0,33 de uma execução para outra. Com preload
dos subsets latin, **CLS = 0**.

Trocar uma fonte no futuro: substituir o `.woff2` e **subir o `?v=N`** no
`@font-face` de `styles.css` — os arquivos são servidos com cache de 1 ano
`immutable`.

`/admin` e `/portal/*` são servidos por `sendFile`, fora do `injectShared`, e
**continuam no Google Fonts**. Por isso o CSP mantém `fonts.googleapis.com` e
`fonts.gstatic.com` liberados. São áreas internas, não páginas de conversão.


## 9. Padrão `fonte` — portfólio com rastreabilidade

Todo número publicado no site (case, readout, depoimento) precisa de um campo
**`fonte`** que **não aparece na página**. Existe para que nenhum número volte ao
ar sem alguém ter escrito de onde ele saiu — é o que tirou os cases no início da
FASE 2.

### Como funciona

Em `config/prova.js`, cada métrica do readout tem:

```js
{ label: 'Meses analisados', valor: '18', barra: 80, fonte: 'planilha X do cliente Y, jan/2025' }
```

A trava (`readoutPublicado()`, `casesPublicados()`) verifica:
1. `publicado: true`
2. Nenhum campo contém `[PREENCHER`
3. Cada métrica tem `fonte` não-vazio

Se qualquer condição falha, o item **não vai ao ar**. O teste
`test/prova.test.js` cobre os três cenários.

### Para replicar em outro produto

1. Criar um módulo `config/prova.js` com a mesma estrutura: array de slots,
   cada um com `publicado: false` e campos `[PREENCHER]`.
2. Exportar uma função que filtra: `publicado && completo(item)` — onde
   `completo()` verifica que nenhum campo contém `[PREENCHER` e, para métricas
   numéricas, que `fonte` é string não-vazia.
3. No render, chamar a função — nunca acessar o array diretamente.
4. Escrever um teste que confirma: (a) nada publica por padrão, (b)
   `publicado: true` com `[PREENCHER]` não passa, (c) completo publica, (d)
   métrica sem `fonte` não publica.

A trava é **de propósito agressiva**: é mais barato preencher um campo do que
explicar a um cliente por que o número dele apareceu sem autorização.

---

## 10. N/A para este projeto

- Domínio e DNS: já apontados
- `www` → apex e http → https: resolvidos na plataforma; confirme uma vez no painel
- Loja de aplicativos, push, CDN próprio: não se aplicam
