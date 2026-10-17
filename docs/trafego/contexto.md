# Contexto para tráfego — Anders Tech

> Base para o kit de distribuição e para as páginas. Escrito em 17/10/2026 a partir
> do código, do schema e das páginas do próprio repositório.

## O que o app é, em 5 linhas

1. Site de uma consultoria em gestão da qualidade de Passo Fundo/RS, não um SaaS: ele não fecha venda, gera contato.
2. Carro-chefe: implantação e manutenção de **ISO 9001** e **PBQP-H** em indústrias e construtoras.
3. Além da landing, publica **285 URLs**: 161 páginas de dados públicos do PBQP-H, 83 verbetes de glossário, blog e páginas de serviço.
4. Tem três ferramentas gratuitas sem login (calculadora de ROI, calculadora de custo, checklist de 47 pontos) e uma plataforma EAD com 4 cursos pagos.
5. A conversão é **clique no WhatsApp com origem rastreada** — formulário é a via secundária.

## ICP concreto

| | |
|---|---|
| **Cargo** | Gerente ou coordenador da qualidade; em empresa menor, o próprio sócio-diretor ou o engenheiro de produção |
| **Setor** | Metalurgia, alimentos, cooperativa agrícola e construção civil |
| **Porte** | 20 a 200 funcionários — tem processo demais para planilha e caixa de menos para contratar um gerente da qualidade dedicado |
| **Região** | Norte do RS e serra gaúcha: Passo Fundo, Erechim, Carazinho, Marau, Caxias do Sul, Bento Gonçalves, Porto Alegre |

## Dor principal

**A certificação virou exigência externa com prazo, e não há estrutura interna para responder.** O gatilho quase nunca é melhoria: é cliente grande que passou a exigir, edital de licitação, financiamento da Caixa (no caso do PBQP-H) ou exportação. A partir daí o medo é duplo — quanto custa, e se vai parar a produção.

Quem já é certificado tem a segunda dor: **o certificado vence** e o sistema se desmanchou desde a última auditoria.

## Ação de conversão

Clique no WhatsApp (54) 99964-8368 com mensagem pré-preenchida identificando a página de origem. Secundário: formulário com papel e prazo de decisão.

## 20 buscas reais do ICP

Na linguagem de quem procura, não na linguagem da norma.

### Custo e decisão (fundo de funil — maior intenção)
1. quanto custa certificação iso 9001
2. quanto custa pbqp-h para construtora
3. consultoria iso 9001 preço
4. vale a pena certificar iso 9001 empresa pequena
5. quanto tempo demora para certificar iso 9001

### Exigência externa (o gatilho)
6. cliente exige iso 9001 o que fazer
7. licitação exige iso 9001 como conseguir
8. caixa exige pbqp-h para financiar obra
9. pbqp-h nível a como conseguir
10. certificação iso 9001 para participar de licitação

### Regional
11. consultoria iso 9001 passo fundo
12. consultoria iso 9001 erechim
13. empresa de consultoria qualidade rs
14. construtoras com pbqp-h em porto alegre
15. quem tem pbqp-h na minha cidade

### Operacional (quem já está dentro)
16. como fazer auditoria interna iso 9001
17. modelo de plano de ação 5w2h
18. como tratar não conformidade iso 9001
19. o que o auditor pede na auditoria iso 9001
20. meu certificado iso 9001 está vencendo o que fazer

## Cobertura atual dessas buscas

| Busca | Página que responde | Status |
|---|---|---|
| 1, 3 | `/quanto-custa-certificacao-iso` | existe |
| 2 | `/quanto-custa-pbqp-h` | existe |
| 4 | `/iso-9001-vale-a-pena` | existe |
| 5 | `/quanto-tempo-implantar-iso-9001` | existe |
| 11, 12 | `/consultoria-iso-9001-passo-fundo`, `/consultoria-iso-9001-erechim` | existe |
| 14, 15 | `/pbqp-h/construtoras/<uf>/<cidade>` | 107 cidades |
| 16 | curso EAD + `/quanto-custa-auditoria-interna` | parcial |
| 17, 18 | glossário + ferramentas do PrismaBiz | parcial |
| **6, 7, 8, 9, 10, 19, 20** | — | **descoberto** |

As sete buscas descobertas são justamente as do **gatilho** — quem busca assim está com prazo e tem urgência. São o alvo das páginas de conteúdo novas.
