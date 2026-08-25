# Relatório — as 7 páginas de cidade

**Veredito: não são doorway pages. Recomendo manter as 7.** A suspeita que eu
levantei na inspeção inicial não se confirmou — a medição contradiz o palpite.

O problema real dessas páginas é outro, e ninguém tinha olhado para ele: **181
erros de acentuação** em páginas escritas para ranquear em português.

> Nenhuma ação foi tomada. Este documento existe para você aprovar o plano.

---

## 1. São clones?

Não. Comparei o **texto visível** (não o HTML) das 7 páginas, com o nome da
cidade neutralizado — sem isso, trocar "Erechim" por "Marau" já infla a
diferença e esconde que o resto é igual. Similaridade de Jaccard sobre shingles
de 5 palavras.

**Maior similaridade entre qualquer par: 9,3%.** Numa duplicata real, esse
número passa de 80%.

| Par mais parecido | Similaridade |
|---|---|
| carazinho × marau | 9,3% |
| carazinho × passo-fundo | 8,9% |
| marau × passo-fundo | 8,2% |
| *(os outros 18 pares)* | ≤ 4,3% |

E o conteúdo exclusivo por página:

| Página | Exclusivo | Palavras |
|---|---|---|
| erechim | **90,5%** | 1.025 |
| bento-goncalves | **89,9%** | 1.228 |
| porto-alegre | **89,8%** | 1.118 |
| caxias-do-sul | **86,9%** | 1.073 |
| marau | **81,4%** | 1.735 |
| carazinho | **79,4%** | 1.545 |
| passo-fundo | **74,6%** | 1.064 |

O conteúdo é local de verdade, não preenchimento: Marau fala do polo
metal-mecânico e da Stara; Passo Fundo, da UPF e da ACI; Porto Alegre se
posiciona como hub de serviços, não como mais uma cidade industrial.

O que as 7 compartilham é só o **esqueleto**: dois H2 ("Serviços oferecidos
em X", "Perguntas frequentes sobre consultoria em X") aparecem em todas. Isso é
template, não doorway. Doorway é quando o *corpo* é o mesmo com a cidade trocada.

---

## 2. O problema que ninguém viu: 181 erros de acentuação

Aparecem misturados **dentro da mesma frase**, o que descarta problema de
encoding do arquivo:

> "Marau **e** um dos munic**í**pios mais din**a**micos do norte..."

`municípios` tem acento; `é` e `dinâmicos` não. Confirmado nos bytes crus.

| Página | Ocorrências |
|---|---|
| marau | 42 |
| porto-alegre | 29 |
| carazinho | 28 |
| caxias-do-sul | 24 |
| erechim | 21 |
| passo-fundo | 18 |
| bento-goncalves | 16 |
| **Total nas 7** | **181** |

Contei só palavras que **nunca** existem sem acento (`não`, `já`, `região`,
`serviços`, `indústria`, `países`, `bilhões`...). Palavras ambíguas como "esta"
e "area" ficaram de fora, então 181 é piso, não teto.

**E o problema não é só das páginas de cidade.** No site inteiro são **372
ocorrências**, sendo 366 dentro de `pages/`:

| Grupo | Ocorrências |
|---|---|
| `pages/` — outras (não-cidade) | 185 |
| `pages/` — cidades | 181 |
| `blog/` | 5 |
| `index.html` | 1 |

O blog está praticamente limpo e `pages/` está tomado — o que sugere que essas
páginas nasceram de um processo diferente do resto do site.

Por que importa: são as páginas construídas para captar busca em português. Texto
com acento faltando derruba a percepção de qualidade de quem lê, e é exatamente
o leitor que você quer converter — um gestor industrial avaliando se contrata
uma consultoria de qualidade.

---

## 3. Indexação e linking

Tudo certo aqui:

| Sinal | Situação |
|---|---|
| No `sitemap.xml` | 7 de 7 |
| `canonical` próprio | 7 de 7, apontando para si mesmas |
| `robots` | `index, follow` nas 7 |
| Schema.org | `City`, `GeoCoordinates`, `Service`, `Offer`, `OfferCatalog`, `PostalAddress`, `FAQPage` — completo nas 7 |
| Links internos recebidos | 3 a 6 por página |

**Uma lacuna:** as 7 páginas **não se linkam entre si**. Zero cross-linking.
Quem chega em `/consultoria-iso-9001-marau` não tem caminho para Passo Fundo ou
Carazinho, que são a 30 e 60 km. Perde-se autoridade de tema e navegação real.

| Página | Links internos recebidos |
|---|---|
| passo-fundo | 6 |
| erechim | 5 |
| caxias-do-sul | 5 |
| porto-alegre | 4 |
| carazinho | 4 |
| marau | 4 |
| bento-goncalves | 3 |

---

## 4. O dado que eu não tenho: tráfego GA4

**Não consigo o tráfego por página.** Este repositório não tem credencial da API
do GA4, e a propriedade `G-7XL5XVE6QZ` só é acessível pelo painel. Não vou
inventar número.

Para completar o relatório, uma destas:

- **Exportar do painel** — GA4 → Relatórios → Engajamento → Páginas e telas,
  filtrar por `consultoria-iso-9001`, últimos 12 meses, exportar CSV. Me manda
  que eu incorporo.
- **Search Console** — mais útil que o GA4 para esta decisão: mostra impressões,
  cliques, posição média e **as consultas reais** por página. É o que diz se a
  página está capturando busca local.
- **Dar acesso via API** — service account no GA4 e uma chave; aí eu puxo direto
  e o relatório se atualiza sozinho.

**Isso muda a recomendação?** Para *manter ou não*, provavelmente não: mesmo com
tráfego zero, nenhuma das 7 é doorway, e página local sem tráfego é sinal de
página nova ou de concorrência, não de penalização. O tráfego importa para
**priorizar** onde investir conteúdo depois.

---

## 5. Recomendação por página

Nenhuma remoção, nenhum `noindex`, nenhum 301. Todas passam no teste.

| Página | Recomendação | Por quê |
|---|---|---|
| **passo-fundo** | Manter — página âncora | Cidade-sede, mais links recebidos (6). Menor exclusividade (74,6%) só porque é a referência que as outras citam |
| **erechim** | Manter | Maior exclusividade (90,5%), segunda cidade da operação |
| **marau** | Manter | Conteúdo mais denso (1.735 palavras), polo metal-mecânico bem trabalhado. Também o com mais erros de acento (42) |
| **carazinho** | Manter | 1.545 palavras, conteúdo próprio. Maior par de similaridade (9,3% com marau) ainda é baixíssimo |
| **caxias-do-sul** | Manter | 86,9% exclusivo, mercado grande |
| **porto-alegre** | Manter | Posicionamento distinto (serviços/hub, não indústria) — não é cópia com nome trocado |
| **bento-goncalves** | Manter, revisar depois | 89,9% exclusivo, mas menos links (3) e menor volume. Candidata a reforço, não a corte |

### Ações que eu recomendo, na ordem

1. **Corrigir os 181 acentos das páginas de cidade** — e, no mesmo passo, os 185
   das outras `pages/`. Alto impacto, risco quase nulo. Faço com um script que
   corrige só palavras inequívocas e mostra cada troca para você conferir antes
   de aplicar.
2. **Cross-linking regional** — um bloco "Também atendo na região" no fim de cada
   página, linkando as 2–3 cidades mais próximas geograficamente. Sem link
   automático para todas: 7 páginas se linkando em cadeia completa parece o que
   é, um anel de links.
3. **Não criar novas páginas de cidade.** As 7 existentes se sustentam porque
   têm contexto local real. Isso não escala para 30 municípios sem virar
   exatamente o que a regra proíbe.

### O que eu NÃO recomendo

- **Consolidar em uma página regional** — jogaria fora 7 páginas com conteúdo
  local genuíno e bem estruturado.
- **`noindex` em qualquer uma** — nenhuma tem sinal de baixa qualidade que
  justifique.
- **Reescrever o esqueleto compartilhado** — dois H2 iguais em 7 páginas não é
  problema; é consistência.
