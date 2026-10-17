# Tráfego — o que foi feito e o que falta

Atualizado em 17/10/2026.

## O ponto de partida honesto

O gargalo **não é conteúdo**. O site tem 285 URLs no sitemap, todas renderizadas no
servidor, com canonical, schema e título único. O Google conhece 36 delas e **indexou
16** (última leitura do Search Console, setembro).

Isso é autoridade, não técnica: domínio novo, quase nenhum link de fora apontando para
ele, então o robô visita pouco. É por isso que o peso deste trabalho está no **kit de
distribuição**, e não em gerar mais páginas.

## Commits desta rodada

| Commit | O que entrou |
|---|---|
| `f85e6ec` | **seo: destravar indexação** — IndexNow (chave, script, workflow) + `contexto.md` |
| `d5bca9a` | **feat(admin): painel de tráfego** — `/admin/trafego` com funil por sessão |
| `0ab29b9` | **docs(trafego): kit de distribuição** — 5 arquivos prontos para publicar |

## Antes e depois

| | 24/08/2026 | 20/09/2026 | Hoje |
|---|---|---|---|
| URLs no sitemap | 126 | 287 | **285** |
| Páginas PBQP-H com dado próprio | 0 | 161 | 161 |
| Verbetes de glossário | 83 | 83 | 83 |
| Ferramentas gratuitas sem login | 3 | 3 | 3 |
| Indexadas no Google | — | 16 | 16 (sem nova leitura) |
| Aviso a Bing/Yandex | nenhum | nenhum | **285 URLs aceitas** |
| Painel de tráfego | não existia | não existia | **no ar** |

> As duas URLs a menos entre setembro e hoje são os termos de uso e a política de
> privacidade, que têm `noindex` e foram removidas do sitemap — o Search Console
> acusava a contradição.

### O que NÃO foi feito nesta rodada, e por quê

O PASSO 2 pedia no mínimo 30 páginas indexáveis novas. **Já existem 285**, das quais 161
são páginas de dado próprio por município e por certificadora, criadas em setembro. Criar
mais páginas antes de o Google indexar as que existem não resolve nada — gastaria esforço
no lado que já está pronto.

A página "alternativa a X" também ficou fora: os concorrentes em consultoria de ISO no RS
são empresas locais, e comparação nominal com concorrente exigiria afirmar coisas sobre
o serviço deles que eu não posso verificar. A regra 3 do CLAUDE.md proíbe.

## O que SÓ VOCÊ pode fazer — em ordem

Tempo total da primeira leva: cerca de 2h30, mais a espera de verificação do Google.

| # | Tarefa | Tempo | Por que é esta a ordem |
|---|---|---|---|
| 1 | **Search Console → Sitemaps**: digite `sitemap.xml` e Enviar. Depois, inspecione `https://anderstech.net/pbqp-h/construtoras` e peça indexação | 10 min | O Google leu 126 URLs pela última vez. São 285 |
| 2 | **Bing Webmaster Tools** (bing.com/webmasters): adicione o site e importe do Search Console | 10 min | O IndexNow já avisou o Bing, mas sem o site verificado você não vê o resultado. O Bing alimenta ChatGPT e Copilot |
| 3 | **Google Business Profile**: criar o perfil da empresa | 20 min + espera | É o maior ganho isolado para busca local. A verificação demora dias — por isso começa cedo |
| 4 | **Bing Places**: importa do Google em um clique | 5 min | Depois do 3 |
| 5 | **Página da empresa no LinkedIn** | 15 min | Link seguido e base para os 15 posts |
| 6 | **Perfil na Unio/Sebrae**: confirmar que aponta para anderstech.net | 5 min | Link de domínio do governo, o mais valioso da lista |
| 7 | **4 associações** (ACISA, CIC Erechim, Sinduscon-RS, FIERGS) | 15 min cada | Links do setor, que é o que o Google usa para entender o nicho |
| 8 | **7 diretórios gerais** | 30 min no total | Volume. Faça de uma vez e esqueça |

Todos com texto pronto em [distribuicao/diretorios.md](distribuicao/diretorios.md).

Depois de cada bloco de cadastros, rode:

```bash
npm run indexnow
```

## Rotina diária de 30 minutos — 4 semanas

### Semana 1 — fundação (os links que o robô segue)
| Dia | 30 minutos |
|---|---|
| Seg | Tarefas 1 e 2 da tabela acima |
| Ter | Tarefa 3 (Google Business Profile) |
| Qua | Tarefas 4, 5 e 6 |
| Qui | Associações: ACISA e CIC Erechim |
| Sex | Associações: Sinduscon-RS e FIERGS · post 1 do LinkedIn |

### Semana 2 — conteúdo começa a circular
| Dia | 30 minutos |
|---|---|
| Seg | Post 2 · responder comentários do post 1 |
| Ter | Post 3 · 7 diretórios gerais |
| Qua | Post 4 · mensagem 1 do WhatsApp em um grupo |
| Qui | Post 5 · responder comentários |
| Sex | Post 6 · gravar os 5 shorts (reserve a manhã, não 30 min) |

### Semana 3 — prospecção direta
| Dia | 30 minutos |
|---|---|
| Seg | Post 7 · publicar o short 1 · montar lista de 20 construtoras com PBQP-H vencendo |
| Ter | Post 8 · 10 e-mails do outbound 1 |
| Qua | Post 9 · 10 e-mails do outbound 1 |
| Qui | Post 10 · follow-ups (outbound 2) |
| Sex | Post 11 · short 2 · mensagem 2 em outro grupo |

### Semana 4 — medir e repetir o que funcionou
| Dia | 30 minutos |
|---|---|
| Seg | Post 12 · abrir `/admin/trafego` e anotar: quais páginas receberam visita |
| Ter | Post 13 · encerramentos do outbound 3 |
| Qua | Post 14 · short 3 |
| Qui | Post 15 · conferir indexação no Search Console (quantas das 285) |
| Sex | **Revisão**: qual origem trouxe sessão, qual página gerou lead. Repetir o que funcionou, cortar o resto |

## Como saber se está funcionando

Abra `/admin/trafego` com a sua chave de admin. O que olhar, em ordem:

1. **Sessões por dia** — está saindo de zero?
2. **Origem** — qual plataforma está trazendo. Se tudo aparece como "direto", algum link
   foi publicado sem UTM.
3. **Funil por sessão** — visitou → viu o CTA → clicou no WhatsApp. Se muita gente vê e
   ninguém clica, o problema é a oferta. Se ninguém vê o CTA, o problema é a página.
4. **Leads por página de entrada** — a única métrica que vira dinheiro.

Não espere resultado em uma semana. Indexação de site novo leva de 2 a 8 semanas, e o
tráfego de busca vem depois disso. O que dá retorno rápido nesse intervalo é LinkedIn,
WhatsApp e outbound — por isso eles estão na rotina desde a semana 1.

## Pendências técnicas conhecidas

- O caminho da página na telemetria vive em `props->>'path'` (JSONB, sem índice). Serve
  no volume atual; vira índice se o tráfego crescer.
- O workflow do IndexNow espera 90 segundos após o push para o deploy publicar. Como o
  Railway não faz auto-deploy neste projeto, se você publicar pelo painel bem depois do
  push, rode `npm run indexnow` à mão.
- As sete buscas de gatilho listadas em [contexto.md](contexto.md) ainda não têm página
  dedicada. São o melhor alvo da próxima rodada de conteúdo.
