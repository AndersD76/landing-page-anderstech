# PROVA — o que saiu da home e o que precisa de autorização

A FASE 2 exige "zero invenção" e a regra é explícita: **nenhum nome real entra
até o Anders autorizar por escrito**. O que estava publicado na home tinha nome
de cliente e números específicos que ninguém neste repo consegue verificar.

Nada foi perdido: o HTML original está no histórico do git (commit anterior a
esta rodada) e a estrutura nova é a de `config/prova.js` — **liberar um case é
trocar uma linha**, não reescrever HTML.

---

## Como publicar um case (quando tiver autorização)

1. Abrir `config/prova.js`.
2. Preencher os campos do slot, **removendo todo `[PREENCHER]`**.
3. Trocar `publicado: false` por `publicado: true`.
4. Reiniciar a aplicação (o HTML é memorizado em cache entre deploys).

> Trava de segurança: um case com `publicado: true` que ainda tenha `[PREENCHER]`
> em qualquer campo **não vai ao ar**. É de propósito — evita publicar meio case
> por descuido.

---

## O que estava publicado e precisa de decisão

| # | Como aparecia | O que precisa antes de voltar |
|---|---|---|
| 1 | **PILI Industrial** — "Implantação do SGQ integrada a ferramentas digitais... da documentação à rotina de indicadores em tempo real." Resultado: "Certificação com processos digitalizados" | **Autorização escrita do cliente** para uso do nome. É o único nome próprio de empresa que estava na página. |
| 2 | **Qualificação PBQP-H** — "Construtora qualificada no PBQP-H em parceria com o Sebrae — habilitando acesso a financiamento habitacional e licitações." Resultado: "Nível de qualificação atingido no prazo" | Sem nome de cliente. Precisa só de **confirmação de que o projeto existiu** e do nível de qualificação atingido. É o mais fácil de reativar. |
| 3 | **Metalúrgica · Diagnóstico Operacional** — "Análise de 18 meses de comunicação operacional revelou retrabalho a **400% da meta**... Plano de ação em 90 dias." Resultado: "**Retrabalho reduzido em 60%** no primeiro trimestre" | **Origem dos números.** 400% da meta, 60% de redução, 18 meses, 90 dias — de onde saíram? Se houver medição, o case volta com a fonte registrada. |
| 4 | **Cooperativa Agrícola · SGQ** — padronização de recebimento, processamento e expedição. Resultado: "**Redução de 35%** em não-conformidades de produto" | Origem dos 35%. |
| 5 | **Indústria Alimentícia · Processos** — "**12 pontos** de desperdício... **ROI positivo em 4 meses**". Resultado: "**Produtividade +22%** sem investimento em equipamento" | Origem dos 12 pontos, do ROI em 4 meses e dos 22%. |

### Depoimento

> "Já tínhamos passado por dois consultores que sumiram no meio do projeto. A
> Anders Tech ficou, entendeu a nossa operação e mostrou onde a gente estava
> perdendo dinheiro de verdade."
> — **Rafael M.**, Diretor Industrial · Metalúrgica · RS

Precisa de: **autorização do depoente** (mesmo com o sobrenome abreviado, a
combinação cargo + segmento + estado identifica) e confirmação de que a frase é
literal, não uma paráfrase.

---

## Readout do hero — removido, mesma trava

O painel "Diagnóstico · amostra" do hero saiu. Ele afirmava:

| Métrica | Valor que exibia |
|---|---|
| Meses analisados | `18` |
| Mensagens lidas | `25.000+` |
| Retrabalho vs. meta | `400%` |

São **os mesmos números do case 3**, que saiu da página por não serem
verificáveis. Rotular de "amostra" atenuava, mas manter num lugar o que foi
tirado do outro seria incoerência.

Voltar é preencher `READOUT` em `config/prova.js` e marcar `publicado: true`.
Cada métrica tem um campo **`fonte`** que **não aparece na página**: existe para
que nenhum número volte ao ar sem alguém ter escrito de onde ele saiu. É o que
faltava nos que saíram. A trava exige `label`, `valor` e `fonte` preenchidos e
`barra` maior que zero.

Enquanto não houver autorização, o hero renderiza sem a coluna da direita — o
texto ocupa a largura toda, não fica um buraco.

## Tempo de experiência — `[PREENCHER]`

Todas as 8 referências a "15+ anos" foram trocadas por `[PREENCHER]` (3 em
`index.html`, 1 em `checklist-iso-9001.html`, 2 em `llms-full.txt`, 1 em
`llms.txt`). O `injectShared` remove `[PREENCHER]` do HTML público em produção,
mas no JSON-LD e nos llms.txt o placeholder vai ao ar literal — **preencher
antes do próximo deploy**.

| Arquivo | O que preencher |
|---|---|
| `index.html:62` — JSON-LD founder.description | `"N anos em gestão..."` |
| `index.html:273` — faixa de credenciais | `N anos` |
| `index.html:532` — seção Sobre | `N anos` |
| `pages/checklist-iso-9001.html:973` — badge | `N anos` |
| `llms.txt:5` — About | `N years` |
| `llms-full.txt:5` — About | `N years` |
| `llms-full.txt:10` — Founder | `N years` |

Fonte: afirmação do Anders, aguardando valor exato.

---

## Enquanto não há case autorizado

A seção de prova **não fica vazia nem mostra `[PREENCHER]` para o visitante**.
Ela renderiza um bloco honesto: muitos clientes de consultoria preferem não
divulgar, e o convite é ver os cases na conversa. É verdade e é uma porta de
entrada para o WhatsApp — não um buraco no meio da página.

Assim que o primeiro case for autorizado, o bloco vira grade de cases
automaticamente, sem tocar em HTML.
