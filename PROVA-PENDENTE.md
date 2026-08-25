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

## Outros números da home que ficaram no ar e merecem checagem

Estes **não foram removidos** — não faziam parte do bloco de prova e a decisão é
sua. Estão listados porque caem na mesma regra de "nenhum número inventado":

| Onde | O que afirma |
|---|---|
| Hero — "Diagnóstico · amostra" | `18` meses analisados · `25.000+` mensagens lidas · retrabalho a `400%` da meta |
| Faixa de credenciais | `15+ anos` de experiência |

O readout do hero está rotulado "amostra", o que atenua — mas ele repete os
mesmos números do case 3, que saiu da página por falta de verificação. Vale
decidir os dois juntos.

---

## Enquanto não há case autorizado

A seção de prova **não fica vazia nem mostra `[PREENCHER]` para o visitante**.
Ela renderiza um bloco honesto: muitos clientes de consultoria preferem não
divulgar, e o convite é ver os cases na conversa. É verdade e é uma porta de
entrada para o WhatsApp — não um buraco no meio da página.

Assim que o primeiro case for autorizado, o bloco vira grade de cases
automaticamente, sem tocar em HTML.
