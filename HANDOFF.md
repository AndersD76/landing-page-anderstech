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

### 8.2 `onclick=` no painel admin — RESOLVIDO

Todos os `onclick=`, `onchange=` e `oninput=` em atributos HTML foram migrados
para `addEventListener` (delegação de eventos para conteúdo dinâmico, listeners
diretos para elementos estáticos). Arquivos corrigidos:

- `admin/index.html` — 13 handlers estáticos + 3 dinâmicos (delegação no tbody)
- `portal/admin.html` — 19 handlers estáticos + 11 dinâmicos (delegação por seção)
- `portal/cliente.html` — 2 handlers dinâmicos (atas)
- `ead/pages/player.html` — 1 handler dinâmico (módulo toggle)

Zero `onclick=` ou `on*=` em atributos HTML em todo o projeto. O CSP
`script-src-attr 'none'` não bloqueia mais nada.

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

## 10. FAQPage schema — expectativa correta

As 3 páginas de serviço (`/iso-9001`, `/pbqp-h`, `/unio`) incluem schema
JSON-LD do tipo `FAQPage` com 5 perguntas cada. O schema é **válido e mantido**
— pode ser verificado no Rich Results Test do Google.

**Expectativa realista**: o Google **quase não exibe rich results de FAQ para
sites comerciais** desde a atualização de agosto de 2023. O schema está lá por
estrutura, acessibilidade de dados e compatibilidade futura — não promete
"estrelinha" no resultado de busca. Se o Google voltar a exibir FAQ snippets
para este tipo de página, eles já estarão prontos.

**Manutenção**: se o conteúdo das perguntas mudar, atualize tanto o HTML
visível quanto o JSON-LD no `<head>` — são blocos separados e precisam estar
em sincronia.

## 11. Gerador de case (FASE 4) — como usar

### 11.1 Criar um case via API

```bash
curl -X POST https://anderstech.net/api/admin/cases \
  -H "Authorization: Bearer $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "metalurgica-abc-iso-9001",
    "publicado": true,
    "cliente": "Metalúrgica ABC",
    "segmento": "Metalúrgica",
    "servico": "ISO 9001",
    "problema": "Perdia 15% por retrabalho...",
    "solucao": "Mapeamento de 12 processos-chave...",
    "resultado": "Retrabalho caiu de 15% para 3% em 6 meses.",
    "resultado_fonte": "Relatório interno da qualidade, mar/2025",
    "depoimento_texto": "Mudou a forma como trabalhamos.",
    "depoimento_autor": "João Silva",
    "depoimento_cargo": "Diretor Industrial",
    "depoimento_fonte": "E-mail autorizado em 10/04/2025",
    "metricas": [
      {"label": "Redução retrabalho", "valor": "80%", "fonte": "Relatório interno"}
    ]
  }'
```

Resposta (201):
```json
{
  "slug": "metalurgica-abc-iso-9001",
  "publicado": true,
  "artifact_codigo": "c7k2m9x4",
  "url_case": "https://anderstech.net/cases/metalurgica-abc-iso-9001",
  "url_pdf": "https://anderstech.net/api/admin/cases/metalurgica-abc-iso-9001/pdf",
  "url_artefato": "https://anderstech.net/r/c7k2m9x4"
}
```

### 11.2 Trava de fonte

Todo campo numérico e depoimento **exige `fonte`** (string não-vazia, sem
`[PREENCHER]`). Sem fonte, o POST retorna 400 com a lista de erros. Mesma
trava de `config/prova.js` — campo sem fonte **não publica**.

### 11.3 PDF

O PDF é gerado sob demanda em `GET /api/admin/cases/:slug/pdf` (autenticado).
Usa Poppins (TTF em `assets/fonts/`), identidade de artefato (navy, vermelho,
diamante). O QR no rodapé é um **placeholder** — o QR real deve ser gerado
pelo script Python com `qrcode` (SPEC-RODAPE-ARTEFATOS.md §2) e embutido
manualmente ou via sobreposição no PDF final.

### 11.4 Versão web

Cases com `publicado: true` ficam acessíveis em `/cases/<slug>` (indexável,
JSON-LD Article, sitemap dinâmico, breadcrumb). O evento `case_view` é
registrado na telemetria. O CTA leva ao WhatsApp com mensagem que identifica
o case.

### 11.5 Migration

A migration `011_cases.sql` roda sozinha no boot. Confira:
```sql
SELECT version FROM schema_migrations WHERE version = '011_cases';
SELECT COUNT(*) FROM cases;
```

---

## 11.6 Sebraetec → Unio — o que mudou e o que você precisa fazer

**A correção**: o site chamava a plataforma do Sebrae de "Sebraetec" e a descrevia
como *programa*. Os dois estavam errados: chama-se **Unio** e é **plataforma**.

Junto com o nome, saiu um número que **nunca foi confirmado**: o site afirmava
"até 70% de subsídio" e "30% de contrapartida". O modelo real, pelo texto oficial
da plataforma, é outro — **cupom de desconto** conforme critérios do Sebrae, com a
Anders Tech emitindo NF para o Sebrae, que paga integral e cobra o cliente.
Todo percentual foi removido do site.

| O que | Antes | Agora |
|---|---|---|
| Nome | Sebraetec | **Unio** |
| Natureza | "programa" | **plataforma** |
| Modelo | "70% subsidiado" | **cupom de desconto** (critérios do Sebrae) |
| URL | `/sebraetec` | `/unio` (a antiga responde **301**) |

### O que você precisa fazer no Google Search Console

O redirect 301 já está no ar em código — o Google transfere a autoridade de
`/sebraetec` para `/unio` sozinho, mas leva algumas semanas. Para acelerar:

1. **Inspeção de URL** → colar `https://anderstech.net/unio` → **Solicitar indexação**
2. Repetir para `https://anderstech.net/servicos`
3. Reenviar o sitemap (agora com **126 URLs**)
4. Em **Páginas** → acompanhar `/sebraetec` migrar para "Redirecionamento" — é o
   comportamento esperado, não um erro a corrigir

> Não remova `/sebraetec` pelo "Remoções" do Search Console. O 301 precisa continuar
> respondendo para transferir o histórico; removê-lo joga fora o que a página já tinha.

### Três `[PREENCHER]` esperando você em `pages/unio.html`

Estão em comentário HTML, e o texto visível descreve o mecanismo sem o número:
1. **Percentual ou valor do cupom** e seus critérios
2. **Prazo de tramitação** entre proposta e aprovação
3. **Critérios de elegibilidade** — porte, faturamento, setor

---

## 12. Réguas de e-mail (FASE 5) — SPECS, não código

As specs vivem em `specs/regua-nutricao.yml` e `specs/regua-ressurreicao.yml`.
**Nada executa neste repo** — são contratos para a automação externa.

Antes de implementar:
1. Validar **todo [REVISAR]** nas specs (assuntos, templates, datas sazonais)
2. Criar campo `leads.email_optout` (boolean, default false) — migration a
   fazer quando a automação for construída
3. Implementar o dedup: consultar `lead_events` antes de cada envio

---

## 13. Lista consolidada de pendências `[PREENCHER]` e `[REVISAR]`

**Zerada em 29/08/2026.** Nenhum `[REVISAR]` ou `[PREENCHER]` de conteúdo
sobrou no repositório. O que existia virou uma destas três coisas:

| Era | Virou | Onde |
|---|---|---|
| "X anos de experiência" (5 lugares) | **desde 2004** | index.html, checklist, llms.txt, llms-full.txt |
| 3 `[PREENCHER]` da Unio | dados oficiais do Sebrae RS (elegibilidade, mecanismo do cupom) | `pages/unio.html` |
| 27 "validar com o Anders" | removidos — você validou | index, iso-9001, pbqp-h, unio, servicos |
| 21 `[REVISAR]` nas réguas | removidos; aviso único no topo de cada spec | `specs/*.yml` |
| 11 marcadores que **explicavam uma decisão** | `<!-- NOTA: -->` | idem |

### Por que sobrou `NOTA:` no código

Não é pendência — é memória. Um exemplo real: o site dizia "até 70% de subsídio",
número que ninguém confirmou. Foi removido. Sem uma nota dizendo **por que** saiu,
a chance de alguém (eu, daqui a seis meses) recolocar é alta. As `NOTA:` marcam
esses pontos. Como os `REVISAR:`, **não vão para o HTML público** — `injectShared`
remove os dois em produção.

### O que ainda aparece num grep por PREENCHER — e não é pendência

`cases/validate.js`, `config/prova.js`, `inject.js` e os dois arquivos de teste
citam a string `[PREENCHER` porque **são a trava que a procura**: é o código que
impede um case pela metade de ir ao ar. Apagar dali quebraria a proteção.

### Cases e depoimentos: agora array vazio, não slot fantasma

`config/prova.js` tinha 3 slots de case e 1 de depoimento preenchidos com
`[PREENCHER]`. Pareciam tarefa sua, mas não eram: case não depende de alguém
sentar e escrever — depende de **um cliente real autorizar por escrito**. Até lá
não há o que preencher.

Os arrays agora nascem vazios, com o formato documentado em comentário logo acima.
A home não fica vazia: mostra o bloco `prova-vazia`, que é honesto e tem CTA.
Quando você tiver um case autorizado, adicione um objeto no formato do comentário —
os testes cobrem exatamente esse caminho.

### TRAVA DE DEPLOY — liberada

`/pbqp-h` e `/iso-9001` validados por você em 29/08/2026. `/unio` e `/servicos`
foram criadas depois: veja as duas antes de publicar — não por pendência de
conteúdo, mas porque falam em seu nome e você ainda não as leu.

---

## 14. N/A para este projeto

- Domínio e DNS: já apontados
- `www` → apex e http → https: resolvidos na plataforma; confirme uma vez no painel
- Loja de aplicativos, push, CDN próprio: não se aplicam
