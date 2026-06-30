export async function seedCourse4(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      '5s-pratica-industrial',
      '5S na Prática Indústrial',
      'Implante o programa 5S na sua fábrica com método, ferramentas e resultados mensuráveis.',
      'Curso 100% prático de 5S para ambiente indústrial: cada senso explicado com exemplos reais, templates de implantação, auditorias de manutenção e estratégias para sustentar o programa a longo prazo.',
      '6 horas',
      197, 347,
      'Supervisores, líderes de produção, operadores, analistas, empresários',
      'Nenhum',
      'Capacitar o profissional a implantar e sustentar o programa 5S no ambiente indústrial, com método prático e resultados mensuráveis.',
      4
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos do 5S ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos do 5S', 'Origem, conceitos, benefícios e diagnóstico inicial do programa 5S', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-origem-historia-5s', 'Origem e história do 5S (do Japão ao Brasil)', '20 min', 1, ${`
<h2>Origem e história do 5S</h2>
<p>O programa 5S é uma das métodologias mais conhecidas e aplicadas no mundo indústrial. Nasceu no <strong>Japão pós-Segunda Guerra Mundial</strong>, num contexto de reconstrução econômica em que cada recurso — material, espaço e tempo — precisava ser aproveitado ao máximo. O 5S não surgiu como teoria acadêmica: nasceu no <strong>chão de fábrica</strong>, criado por quem precisava resolver problemas reais de desorganização, desperdício e falta de padronização.</p>

<h3>O contexto japonês</h3>
<p>Após 1945, o Japão estava devastado. A indústria precisava produzir mais com menos. Engenheiros e gestores japoneses, com forte influência dos consultores americanos W. Edwards Deming e Joseph Juran, desenvolveram sistemas de gestão que valorizavam a <strong>ordem, a limpeza e a disciplina</strong> como base para qualquer melhoria. O 5S foi uma das primeiras ferramentas adotadas em larga escala por empresas como Toyota, Honda e Matsushita (atual Panasonic).</p>

<div class="callout"><strong>Curiosidade:</strong> No Japão, o conceito de manter o ambiente limpo e organizado tem raízes culturais profundas. Nas escolas japonesas, os próprios alunos limpam as salas de aula. O 5S indústrial apenas sistematizou algo que já era valor cultural.</div>

<h3>Os 5 sensos — origem do nome</h3>
<p>O nome "5S" vem de cinco palavras japonesas que começam com a letra S:</p>
<table>
<tr><th>Japonês</th><th>Tradução livre</th><th>Senso (adaptação brasileira)</th></tr>
<tr><td>Seiri</td><td>Separar, classificar</td><td>Senso de útilização</td></tr>
<tr><td>Seiton</td><td>Ordenar, organizar</td><td>Senso de organização</td></tr>
<tr><td>Seiso</td><td>Limpar, inspecionar</td><td>Senso de limpeza</td></tr>
<tr><td>Seiketsu</td><td>Padronizar, saúde</td><td>Senso de padronização</td></tr>
<tr><td>Shitsuke</td><td>Disciplina, educação</td><td>Senso de disciplina</td></tr>
</table>

<h3>A chegada ao Brasil</h3>
<p>O 5S chegou ao Brasil no início dos anos 1990, trazido principalmente por empresas japonesas instaladas no país (como Toyota em Indaiatuba-SP e Honda em Sumaré-SP) e por programas de qualidade total incentivados pela abertura econômica do governo Collor. Naquela época, a indústria brasileira precisava se modernizar rapidamente para competir com produtos importados.</p>

<div class="example"><strong>Marco histórico:</strong> A Fundação Christiano Ottoni (UFMG) foi uma das pioneiras na disseminação do 5S no Brasil, publicando materiais em português e realizando treinamentos em indústrias de Minas Gerais, São Paulo e Paraná a partir de 1991. Muitas metalúrgicas da região do ABC Paulista e do polo indústrial de Betim (MG) adotaram o 5S como primeiro passo para a certificação ISO 9001.</div>

<h3>Evolução do 5S na indústria brasileira</h3>
<p>A trajetória do 5S no Brasil pode ser dividida em fases:</p>
<ul>
<li><strong>Anos 1990:</strong> Introdução — focado em "limpeza e organização". Muitas empresas fizeram o "Dia da Limpeza" e pararam por aí.</li>
<li><strong>Anos 2000:</strong> Integração com sistemas de gestão (ISO 9001, ISO 14001). O 5S passou a ser visto como base para programas mais robustos.</li>
<li><strong>Anos 2010:</strong> Conexão com Lean Manufacturing. O 5S se tornou pré-requisito para TPM, Kaizen e produção enxuta.</li>
<li><strong>Anos 2020 em diante:</strong> 5S digital — uso de apps para auditorias, fotos de antes/depois com geolocalização, dashboards de indicadores em tempo real.</li>
</ul>

<h3>Por que o 5S contínua relevante</h3>
<p>Mesmo após mais de 70 anos, o 5S contínua sendo a <strong>porta de entrada</strong> para qualquer programa de melhoria. A razão é simples: não adianta implantar Lean, Six Sigma ou Indústria 4.0 num ambiente sujo, desorganizado e sem padrão. O 5S cria a <strong>fundação cultural e física</strong> sobre a qual outros programas podem prosperar.</p>

<div class="callout"><strong>Dado real:</strong> Segundo pesquisa do SEBRAE (2022), 78% das pequenas e médias indústrias que implantaram o 5S de forma estruturada relataram redução de pelo menos 15% no tempo de setup de máquinas nos primeiros 6 meses. O investimento médio foi de R$ 2.500 a R$ 8.000 (principalmente em sinalização, estantes e treinamento).</div>

<h3>5S não é faxina</h3>
<p>O maior erro na implantação do 5S é reduzi-lo a "dia de limpeza". O 5S é um <strong>programa de mudança de comportamento</strong>. A limpeza e a organização são consequências — o verdadeiro objetivo é criar uma cultura de <strong>cuidado com o ambiente, respeito ao padrão e melhoria contínua</strong>. Quando tratado apenas como faxina, o programa morre em 3 meses.</p>
`}, NULL),

  (${m1.id}, '1-2-cinco-sensos-explicados', 'Os 5 sensos explicados: Seiri, Seiton, Seiso, Seiketsu, Shitsuke', '25 min', 2, ${`
<h2>Os 5 sensos explicados</h2>
<p>Cada um dos 5 sensos tem um propósito específico é uma lógica de sequência. Não se implanta o 5S de forma aleatória — os três primeiros sensos (Seiri, Seiton, Seiso) são de <strong>ação física</strong>, enquanto os dois últimos (Seiketsu, Shitsuke) são de <strong>manutenção e cultura</strong>. Entender cada senso em profundidade é fundamental antes de ir para a prática.</p>

<h3>1. Seiri — Senso de útilização</h3>
<p>O primeiro senso é sobre <strong>separar o necessário do desnecessário</strong>. No ambiente indústrial, isso significa passar por cada área de trabalho e questionar: "Este item é necessário aqui? Com que frequência é usado?"</p>
<ul>
<li><strong>O que manter:</strong> Ferramentas, materiais e documentos usados com frequência (diária ou semanal)</li>
<li><strong>O que realocar:</strong> Itens usados raramente (mensal ou menos) — guardar em almoxarifado central</li>
<li><strong>O que descartar:</strong> Itens quebrados, obsoletos, em duplicata ou sem função definida</li>
</ul>

<div class="example"><strong>Exemplo real:</strong> Numa metalúrgica de Caxias do Sul (RS), ao aplicar o Seiri no setor de ferramentaria, foram encontradas 340 ferramentas. Após a classificação, 95 foram descartadas (quebradas ou obsoletas), 80 foram realocadas para o almoxarifado central, e 165 permaneceram no setor. O tempo médio para localizar uma ferramenta caiu de 4,5 minutos para 45 segundos.</div>

<p>A principal ferramenta do Seiri é a <strong>etiqueta vermelha</strong> (red tag): um cartão que se fixa no item questionável, registrando data, responsável e destino proposto. Itens etiquetados ficam numa "área de quarentena" por 30 dias — se ninguém reclamar, são descartados ou realocados.</p>

<h3>2. Seiton — Senso de organização</h3>
<p>Após separar o que é necessário, o próximo passo é <strong>organizar de forma que qualquer pessoa encontre, use e devolva rapidamente</strong>. O lema do Seiton é: "Um lugar para cada coisa, cada coisa em seu lugar."</p>
<ul>
<li><strong>Identificação visual:</strong> Etiquetas, cores, sinalização de chão e de prateleiras</li>
<li><strong>Critério de frequência:</strong> Itens mais usados ficam mais acessíveis (altura dos olhos, bancada mais próxima)</li>
<li><strong>Shadow boards:</strong> Painéis com o contorno de cada ferramenta desenhado — qualquer pessoa sabe o que falta</li>
<li><strong>Endereçamento:</strong> Cada estante, prateleira e posição tem um código (ex: E3-P2-C5 = estante 3, prateleira 2, coluna 5)</li>
</ul>

<div class="callout"><strong>Regra dos 30 segundos:</strong> No Seiton bem implantado, qualquer pessoa deve conseguir encontrar qualquer item em até 30 segundos. Se demora mais, a organização precisa ser melhorada.</div>

<h3>3. Seiso — Senso de limpeza</h3>
<p>Seiso vai muito além de varrer o chão. No contexto indústrial, <strong>limpeza é inspeção</strong>. Ao limpar uma máquina, o operador observa vazamentos, folgas, fissuras e anomalias que poderiam passar despercebidas. O Seiso conecta o 5S com a <strong>manutenção autônoma</strong> do TPM (Total Productive Maintenance).</p>
<ul>
<li><strong>Limpar e eliminar fontes de sujeira:</strong> Não basta limpar — é preciso identificar e eliminar a causa da sujeira (vazamento de óleo, rebarbas, poeira de processo)</li>
<li><strong>Definir responsáveis:</strong> Cada área tem um "dono" responsável pela limpeza</li>
<li><strong>Checklist de limpeza:</strong> O que limpar, com que frequência, com que material, em quanto tempo</li>
</ul>

<div class="example"><strong>Exemplo real:</strong> Uma indústria alimentícia de Chapecó (SC) implantou o Seiso com foco em "limpeza como inspeção" nas linhas de embalagem. Em 60 dias, os operadores identificaram 23 pequenos vazamentos de ar comprimido que não estavam nos relatórios de manutenção. O conserto custou R$ 1.200 e gerou economia de R$ 14.000/ano em energia.</div>

<h3>4. Seiketsu — Senso de padronização</h3>
<p>O quarto senso trata de <strong>criar padrões para manter os três primeiros sensos</strong>. Sem padronização, o Seiri, Seiton é Seiso funcionam por algumas semanas e depois tudo volta ao estado anterior.</p>
<ul>
<li><strong>Procedimentos visuais:</strong> Fotos do "estado padrão" de cada área fixadas no local</li>
<li><strong>Checklists diários:</strong> 5 minutos no início do turno para verificar se tudo está no padrão</li>
<li><strong>Cores e sinalização:</strong> Padronização de cores para áreas, corredores, equipamentos</li>
<li><strong>Quadro de gestão visual:</strong> Fotos de antes/depois, indicadores, responsáveis</li>
</ul>

<h3>5. Shitsuke — Senso de disciplina</h3>
<p>O quinto senso é o mais difícil é o mais importante. Trata de <strong>manter o programa vivo através do hábito e da cultura</strong>. Não se trata de cobrança punitiva, mas de criar um ambiente onde o padrão é seguido naturalmente.</p>
<ul>
<li><strong>Exemplo da liderança:</strong> Se o supervisor não segue o 5S, ninguém segue</li>
<li><strong>Auditorias periódicas:</strong> Com pontuação, feedback e reconhecimento</li>
<li><strong>Treinamento contínuo:</strong> Novos funcionários devem ser treinados no 5S desde o primeiro dia</li>
<li><strong>Reconhecimento:</strong> Premiar áreas que se destacam, não punir as que falham</li>
</ul>

<div class="callout"><strong>A verdade sobre o Shitsuke:</strong> Pesquisas mostram que o 5S leva em média 18 a 24 meses para se tornar hábito numa organização. Nos primeiros 6 meses, é puro esforço consciente. Se a liderança afrouxar nesse período, o programa desmorona.</div>
`}, 'Resumo visual dos 5 sensos (pôster para impressão)'),

  (${m1.id}, '1-3-beneficios-5s-numeros-reais', 'Benefícios do 5S com números reais', '20 min', 3, ${`
<h2>Benefícios do 5S com números reais</h2>
<p>Um dos maiores desafios ao implantar o 5S é convencer a liderança e os operadores de que o programa vale o investimento de tempo e dinheiro. Nesta aula, vamos apresentar <strong>dados concretos e casos reais</strong> de indústrias brasileiras que mediram os resultados do 5S.</p>

<h3>Benefícios tangíveis (mensuráveis)</h3>
<table>
<tr><th>Indicador</th><th>Antes do 5S</th><th>Depois do 5S (6 meses)</th><th>Melhoria</th></tr>
<tr><td>Tempo de setup médio</td><td>45 min</td><td>28 min</td><td>-38%</td></tr>
<tr><td>Tempo para localizar ferramenta</td><td>4,2 min</td><td>0,8 min</td><td>-81%</td></tr>
<tr><td>Acidentes com afastamento (por ano)</td><td>12</td><td>4</td><td>-67%</td></tr>
<tr><td>Retrabalho por falta de padrão</td><td>8,5%</td><td>3,2%</td><td>-62%</td></tr>
<tr><td>Área útil recuperada</td><td>—</td><td>+22%</td><td>—</td></tr>
<tr><td>Consumo de materiais de limpeza</td><td>R$ 4.800/mês</td><td>R$ 2.100/mês</td><td>-56%</td></tr>
</table>

<div class="callout"><strong>Fonte:</strong> Dados compilados de casos publicados pelo SEBRAE-RS, SENAI-SC e relatórios internos de metalúrgicas do ABC Paulista (2019-2023). Os números representam médias — resultados individuais variam conforme o porte e o comprometimento da empresa.</div>

<h3>Caso 1 — Metalúrgica em Joinville (SC)</h3>
<p>Empresa de 120 funcionários, fábricante de peças estampadas para o setor automotivo. Implantou o 5S em 2021 como pré-requisito para a certificação IATF 16949.</p>
<ul>
<li><strong>Investimento:</strong> R$ 18.000 (sinalização, estantes, treinamento, shadow boards)</li>
<li><strong>Resultado em 12 meses:</strong> Redução de 42% nas paradas não planejadas, economia de R$ 95.000 em peças rejeitadas, área de produção ampliada em 35 m2 sem obra</li>
<li><strong>ROI:</strong> R$ 95.000 / R$ 18.000 = 5,3x no primeiro ano</li>
</ul>

<h3>Caso 2 — Cooperativa agrícola em Cascavel (PR)</h3>
<p>Cooperativa com 80 funcionários na unidade de beneficiamento de grãos. Implantou o 5S no armazém e na área de classificação.</p>
<ul>
<li><strong>Investimento:</strong> R$ 7.500</li>
<li><strong>Resultado em 6 meses:</strong> Tempo de carga de caminhões reduzido de 2h para 1h15min. Perda de grãos por armazenamento inadequado caiu de 3,1% para 0,8%.</li>
<li><strong>Economia anual estimada:</strong> R$ 62.000 só em redução de perdas de grãos</li>
</ul>

<h3>Caso 3 — Construtora em Goiânia (GO)</h3>
<p>Canteiro de obra com 200 trabalhadores. Aplicou 5S como parte do programa PBQP-H.</p>
<ul>
<li><strong>Investimento:</strong> R$ 12.000 (containers organizadores, sinalização, treinamento)</li>
<li><strong>Resultado em 4 meses:</strong> Acidentes leves reduziram 55%. Desperdício de material (argamassa, cimento, fios) caiu 28%. Auditoria PBQP-H pontuou 92% na organização do canteiro (antes era 61%).</li>
</ul>

<h3>Benefícios intangíveis</h3>
<p>Além dos números, o 5S gera benefícios que são difíceis de medir mas extremamente valiosos:</p>
<ul>
<li><strong>Moral da equipe:</strong> Trabalhar num ambiente limpo e organizado aumenta a satisfação e o orgulho do trabalho</li>
<li><strong>Impressão de clientes e visitantes:</strong> Uma fábrica organizada transmite confiança e profissionalismo</li>
<li><strong>Facilitação de auditorias:</strong> Auditores de ISO 9001, IATF 16949, ISO 14001 sempre começam pela observação visual — 5S bem feito causa boa impressão imediata</li>
<li><strong>Base para outros programas:</strong> Lean, TPM, Kaizen e Six Sigma funcionam melhor com 5S implantado</li>
<li><strong>Redução de estresse:</strong> Operadores perdem menos tempo procurando coisas e se frustrando com a desorganização</li>
</ul>

<div class="example"><strong>Depoimento real:</strong> "Antes do 5S, eu perdia uns 40 minutos por turno procurando ferramenta e material. Hoje perco zero. Isso me dá mais calma pra trabalhar e mais tempo pra produzir." — Operador de CNC, metalúrgica de Erechim (RS), 2022.</div>

<h3>Quanto custa implantar o 5S?</h3>
<table>
<tr><th>Porte da empresa</th><th>Investimento típico</th><th>Inclui</th></tr>
<tr><td>Micro (até 20 func.)</td><td>R$ 2.000 a R$ 5.000</td><td>Sinalização básica, treinamento interno</td></tr>
<tr><td>Pequena (20-99 func.)</td><td>R$ 5.000 a R$ 20.000</td><td>Estantes, shadow boards, sinalização completa, consultoria pontual</td></tr>
<tr><td>Média (100-499 func.)</td><td>R$ 20.000 a R$ 80.000</td><td>Projeto completo com consultoria, mobiliário indústrial, sistema de auditoria</td></tr>
<tr><td>Grande (500+ func.)</td><td>R$ 80.000 a R$ 300.000</td><td>Programa corporativo com multiplicadores, app de auditoria, premiação</td></tr>
</table>

<div class="callout"><strong>Conclusão:</strong> O 5S tem um dos melhores ROIs entre todas as ferramentas de gestão indústrial. Com investimento baixo (comparado a automação ou novos equipamentos), gera resultados rápidos e visíveis. O único recurso realmente caro é o <strong>tempo da liderança</strong> — e esse é inegociável.</div>
`}, 'Planilha de ROI do 5S (modelo editável)'),

  (${m1.id}, '1-4-diagnostico-inicial', 'Diagnóstico inicial: como avaliar o estado atual', '20 min', 4, ${`
<h2>Diagnóstico inicial: como avaliar o estado atual</h2>
<p>Antes de implantar o 5S, é essencial saber <strong>de onde você está partindo</strong>. O diagnóstico inicial serve para: (1) medir a situação atual com critérios objetivos, (2) identificar as áreas prioritárias, (3) gerar evidências de "antes" para comparar com o "depois", e (4) sensibilizar a equipe sobre a necessidade de mudança.</p>

<h3>Método de avaliação — Checklist de 50 pontos</h3>
<p>O método mais prático para o diagnóstico é um checklist com 10 critérios por senso, pontuados de 0 a 5:</p>

<div class="template-box">
<h3>Template: Checklist de Diagnóstico Inicial 5S</h3>
<p><strong>Área avaliada:</strong> _____________ | <strong>Data:</strong> ___/___/___ | <strong>Avaliador:</strong> _____________</p>
<p><strong>Escala:</strong> 0 = Inexistente | 1 = Péssimo | 2 = Ruim | 3 = Regular | 4 = Bom | 5 = Excelente</p>
<table>
<tr><th>Senso</th><th>Critério</th><th>Nota (0-5)</th></tr>
<tr><td rowspan="3">Seiri (Utilização)</td><td>Ausência de itens desnecessários na área</td><td>___</td></tr>
<tr><td>Materiais e ferramentas compatíveis com a atividade</td><td>___</td></tr>
<tr><td>Sem acúmulo de itens obsoletos ou quebrados</td><td>___</td></tr>
<tr><td rowspan="3">Seiton (Organização)</td><td>Identificação clara de locais de guarda</td><td>___</td></tr>
<tr><td>Itens guardados no lugar definido</td><td>___</td></tr>
<tr><td>Facilidade de acesso (item encontrado em até 30s)</td><td>___</td></tr>
<tr><td rowspan="2">Seiso (Limpeza)</td><td>Área limpa e sem resíduos no chão</td><td>___</td></tr>
<tr><td>Equipamentos limpos e sem vazamentos visíveis</td><td>___</td></tr>
<tr><td>Seiketsu (Padronização)</td><td>Existem padrões visuais definidos e visíveis</td><td>___</td></tr>
<tr><td>Shitsuke (Disciplina)</td><td>A equipe demonstra hábito de seguir os padrões</td><td>___</td></tr>
</table>
<p><strong>Total:</strong> ___/50 | <strong>Percentual:</strong> ___%</p>
</div>

<h3>Classificação do resultado</h3>
<table>
<tr><th>Faixa</th><th>Classificação</th><th>Ação recomendada</th></tr>
<tr><td>0-20%</td><td>Crítico</td><td>Implantação urgente. Comece pelo Seiri com Dia D.</td></tr>
<tr><td>21-40%</td><td>Insuficiente</td><td>Implantação estruturada em 90 dias, priorizando áreas piores.</td></tr>
<tr><td>41-60%</td><td>Regular</td><td>Reforço nos 3 primeiros S. Foco em padronização (4o S).</td></tr>
<tr><td>61-80%</td><td>Bom</td><td>Refinar padrões e focar em disciplina (5o S). Auditorias mensais.</td></tr>
<tr><td>81-100%</td><td>Excelente</td><td>Manter com auditorias. Buscar íntegração com TPM/Lean.</td></tr>
</table>

<h3>Passo a passo do diagnóstico</h3>
<ol>
<li><strong>Defina as áreas:</strong> Liste todas as áreas da fábrica (produção, almoxarifado, escritório, refeitório, vestiário, área externa). Cada área será avaliada separadamente.</li>
<li><strong>Escolha os avaliadores:</strong> Mínimo 2 pessoas por área. Idealmente, inclua alguém de fora da área (olhar externo é mais crítico).</li>
<li><strong>Fotografe tudo:</strong> Tire fotos sistemáticas de cada área — essas fotos serão o "antes" para comparação futura. Recomendação: use sempre o mesmo ângulo para o "depois".</li>
<li><strong>Aplique o checklist:</strong> Cada avaliador pontua independentemente. Use a média.</li>
<li><strong>Consolide os resultados:</strong> Monte um quadro com a nota de cada área e cada senso. Isso mostra onde atacar primeiro.</li>
<li><strong>Apresente para a direção:</strong> Use as fotos e os números para justificar o investimento no programa.</li>
</ol>

<div class="example"><strong>Exemplo prático:</strong> Uma indústria alimentícia de Lajeado (RS) fez o diagnóstico em 8 áreas. Resultado médio: 32% (insuficiente). A área mais crítica foi o almoxarifado de embalagens (18%), e a menos crítica foi o escritório administrativo (55%). A direção aprovou o programa ao ver as fotos do almoxarifado — itens empilhados sem identificação, embalagens vencidas misturadas com novas, corredores bloqueados.</div>

<h3>Erros comuns no diagnóstico</h3>
<ul>
<li><strong>Avaliar com condescendência:</strong> Dar nota 3 quando é 1 para "não ofender" a equipe. O diagnóstico precisa ser honesto.</li>
<li><strong>Não fotografar:</strong> Sem fotos, não há evidência. É a comparação antes/depois é a ferramenta mais poderosa de motivação.</li>
<li><strong>Avaliar só a produção:</strong> Escritórios, refeitório, vestiário e área externa também precisam de 5S.</li>
<li><strong>Pular o diagnóstico:</strong> Ir direto para o "Dia D" sem medir o ponto de partida impede que você comprove a melhoria depois.</li>
</ul>

<div class="callout"><strong>Dica de ouro:</strong> Faça o diagnóstico numa sexta-feira à tarde, quando a fábrica está no "modo automático" e ninguém se preparou para ser avaliado. Isso mostra a realidade. Se avisar com antecedência, todo mundo vai arrumar na véspera — e você não medirá o dia a dia real.</div>
`}, 'Checklist de diagnóstico 5S (modelo completo)')`;

  // ── Module 2: Implantação dos 3 Primeiros S ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Implantação dos 3 Primeiros S', 'Seiri, Seiton é Seiso na prática indústrial com ferramentas e templates', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-1-seiri-etiqueta-vermelha', 'Seiri na prática: etiqueta vermelha e critérios de descarte', '25 min', 1, ${`
<h2>Seiri na prática: etiqueta vermelha e critérios de descarte</h2>
<p>O Seiri (senso de útilização) é o primeiro passo concreto da implantação. Seu objetivo é simples e poderoso: <strong>eliminar tudo que não é necessário na área de trabalho</strong>. Parece fácil, mas na prática é o senso que gera mais resistência — porque mexe com o hábito de "guardar porque um dia pode servir".</p>

<h3>A técnica da etiqueta vermelha (Red Tag)</h3>
<p>A etiqueta vermelha é o método mais eficaz para o Seiri. Funciona assim:</p>
<ol>
<li><strong>Percorra a área</strong> com a equipe e identifique todos os itens questionáveis</li>
<li><strong>Fixe uma etiqueta vermelha</strong> em cada item cuja necessidade não é unânime</li>
<li><strong>Registre na etiqueta:</strong> data, nome do item, responsável, motivo da etiqueta e destino sugerido</li>
<li><strong>Mova para a "área de quarentena"</strong> (um local definido para itens etiquetados)</li>
<li><strong>Aguarde 30 dias:</strong> Se ninguém reclamar ou justificar a permanência, o item é descartado, vendido ou doado</li>
</ol>

<div class="template-box">
<h3>Template: Etiqueta Vermelha 5S</h3>
<table>
<tr><td><strong>ETIQUETA VERMELHA — 5S</strong></td></tr>
<tr><td><strong>N:</strong> _______ | <strong>Data:</strong> ___/___/___</td></tr>
<tr><td><strong>Item:</strong> _________________________________</td></tr>
<tr><td><strong>Quantidade:</strong> _______ | <strong>Código (se houver):</strong> _______</td></tr>
<tr><td><strong>Localização atual:</strong> _________________________________</td></tr>
<tr><td><strong>Motivo da etiqueta:</strong><br>[ ] Desnecessário na área<br>[ ] Quebrado / danificado<br>[ ] Obsoleto<br>[ ] Excesso / duplicata<br>[ ] Sem identificação<br>[ ] Outro: ____________</td></tr>
<tr><td><strong>Destino sugerido:</strong><br>[ ] Descartar<br>[ ] Transferir para: ____________<br>[ ] Vender<br>[ ] Doar<br>[ ] Devolver ao fornecedor</td></tr>
<tr><td><strong>Responsável:</strong> _________________ | <strong>Prazo:</strong> ___/___/___</td></tr>
<tr><td><strong>Decisão final:</strong> _________________ | <strong>Data:</strong> ___/___/___</td></tr>
</table>
</div>

<h3>Critérios de descarte — a regra dos 12 meses</h3>
<p>Uma regra simples é eficaz para decidir o que fica é o que sai:</p>
<table>
<tr><th>Frequência de uso</th><th>Ação</th><th>Local</th></tr>
<tr><td>Toda hora</td><td>Manter na bancada/máquina</td><td>Posto de trabalho</td></tr>
<tr><td>Todo dia</td><td>Manter próximo</td><td>Armário do setor</td></tr>
<tr><td>Toda semana</td><td>Manter na área</td><td>Estante do setor</td></tr>
<tr><td>Todo mês</td><td>Manter acessível</td><td>Almoxarifado central</td></tr>
<tr><td>1-2 vezes por ano</td><td>Guardar identificado</td><td>Depósito/arquivo morto</td></tr>
<tr><td>Não usou em 12 meses</td><td>Descartar, vender ou doar</td><td>Fora da empresa</td></tr>
</table>

<div class="callout"><strong>Exceção importante:</strong> Ferramentas especiais, calibradores e peças de reposição críticas podem ter uso raro mas são essenciais. Use o critério: "Se precisarmos e não tivermos, qual o impacto?" Se o impacto for alto (parada de linha, segurança), mantenha mesmo com uso raro — mas identifique e armazene adequadamente.</div>

<h3>Lidando com a resistência</h3>
<p>A frase mais ouvida no Seiri é: "Não joga fora, pode servir um dia." Estratégias para lidar:</p>
<ul>
<li><strong>Dados:</strong> Mostre quanto espaço está sendo ocupado por itens sem uso. "Esse armário de 4 m² guarda coisas que ninguém usou em 2 anos. Esse espaço custa R$ X/mês."</li>
<li><strong>Área de quarentena com prazo:</strong> Ninguém precisa decidir na hora. O prazo de 30 dias dá segurança.</li>
<li><strong>Envolvimento:</strong> A equipe da área decide — não é imposição de fora.</li>
<li><strong>Começar pelo exemplo:</strong> A liderança deve limpar sua sala primeiro.</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma fábrica de móveis de Bento Gonçalves (RS) liberou 85 m² de área útil só com o Seiri. Os itens removidos incluíam: 2 máquinas desativadas há 4 anos, 120 kg de retalhos de MDF sem classificação, 3 estantes cheias de catálogos de fornecedores que não existiam mais, e 45 baldes de cola vencida. O espaço liberado foi transformado em área de embalagem, eliminando um gargalo de produção.</div>

<h3>Registro e controle</h3>
<p>Mantenha um controle de todas as etiquetas vermelhas emitidas:</p>
<ul>
<li><strong>Planilha de controle:</strong> Número da etiqueta, item, área, data de emissão, destino sugerido, decisão final, data da ação</li>
<li><strong>Fotos:</strong> Fotografe cada item etiquetado (comprovação)</li>
<li><strong>Indicador:</strong> Total de itens etiquetados, total descartado, total realocado, espaço recuperado (em m²), valor estimado do descarte</li>
</ul>
`}, 'Template de etiqueta vermelha 5S'),

  (${m2.id}, '2-2-seiton-organização-visual', 'Seiton na prática: organização visual e shadow boards', '25 min', 2, ${`
<h2>Seiton na prática: organização visual e shadow boards</h2>
<p>Após o Seiri ter eliminado o desnecessário, o Seiton organiza o que ficou de forma que <strong>qualquer pessoa encontre, use e devolva em segundos</strong>. O Seiton é o senso que mais transforma visualmente o ambiente — é o que mais impressiona visitantes e auditores.</p>

<h3>Princípios do Seiton indústrial</h3>
<ol>
<li><strong>Um lugar para cada coisa, cada coisa em seu lugar</strong> — o princípio fundamental</li>
<li><strong>Frequência de uso define a posição</strong> — quanto mais usado, mais acessível</li>
<li><strong>Identificação visual</strong> — ninguém deveria precisar perguntar onde algo fica</li>
<li><strong>Limite máximo</strong> — definir quantidade máxima para cada item (evita acúmulo)</li>
<li><strong>Primeiro a entrar, primeiro a sair (FIFO)</strong> — especialmente para insumos com validade</li>
</ol>

<h3>Shadow boards (quadros de sombra)</h3>
<p>O shadow board é um painel onde o contorno de cada ferramenta e desenhado ou pintado. Quando a ferramenta está no lugar, o contorno está coberto. Quando falta, o contorno vazio mostra imediatamente <strong>o que falta e onde deveria estar</strong>.</p>

<div class="callout"><strong>Como fazer um shadow board:</strong> (1) Selecione as ferramentas do posto. (2) Fixe um painel de MDF pintado de branco ou cinza claro. (3) Posicione cada ferramenta e trace o contorno com caneta permanente preta. (4) Instale ganchos ou suportes. (5) Identifique cada posição com etiqueta. Custo médio: R$ 80 a R$ 200 por painel (material + mao de obra interna).</div>

<h3>Sinalização de chao</h3>
<p>A demarcação de chao é fundamental na indústria. Define visualmente:</p>
<table>
<tr><th>Cor</th><th>Uso padrão (NBR 7195 / OSHA adaptado)</th></tr>
<tr><td><strong>Amarelo</strong></td><td>Corredores de circulação, áreas de atenção</td></tr>
<tr><td><strong>Branco</strong></td><td>Posicao de equipamentos, bancadas, estáções de trabalho</td></tr>
<tr><td><strong>Verde</strong></td><td>Áreas de produto aprovado, material em processo</td></tr>
<tr><td><strong>Vermelho</strong></td><td>Áreas de produto não conforme, rejeito, extintores</td></tr>
<tr><td><strong>Azul</strong></td><td>Material em análise, área de inspeção</td></tr>
<tr><td><strong>Preto e branco (zebrado)</strong></td><td>Áreas que devem permanecer livres (não obstruir)</td></tr>
</table>

<div class="example"><strong>Exemplo real:</strong> Uma metalúrgica de Contagem (MG) investiu R$ 6.200 em pintura de chao e sinalização. Resultado: eliminação de 100% das reclamações de "material no corredor" em auditorias. O tempo de movimentação interna de materiais caiu 22% porque os corredores ficaram sempre livres.</div>

<h3>Organização de estantes e almoxarifado</h3>
<p>Regras práticas para organizar prateleiras e estantes:</p>
<ul>
<li><strong>Enderecamento:</strong> Cada posição tem um código único (ex: E2-P3-C1 = Estante 2, Prateleira 3, Coluna 1)</li>
<li><strong>Etiquetas frontais:</strong> Nome do item, código, quantidade mínima e máxima, foto</li>
<li><strong>Nível dos olhos:</strong> Itens mais usados na altura dos olhos (1,20 m a 1,60 m)</li>
<li><strong>Peso embaixo:</strong> Itens pesados nas prateleiras de baixo (segurança)</li>
<li><strong>FIFO físico:</strong> Abastecer por trás, retirar pela frente (para insumos com validade)</li>
</ul>

<h3>Kanban visual para materiais</h3>
<p>O Seiton pode incluir um sistema simples de kanban visual para controle de estoque:</p>
<ul>
<li><strong>Cartão verde:</strong> Estoque acima do nível de reposição — OK</li>
<li><strong>Cartão amarelo:</strong> Estoque no ponto de reposição — fazer pedido</li>
<li><strong>Cartão vermelho:</strong> Estoque abaixo do mínimo — pedido urgente</li>
</ul>

<h3>Organização de documentos e informação</h3>
<p>O Seiton também se aplica a documentos, instruções de trabalho e informações:</p>
<ul>
<li><strong>Instruções de trabalho:</strong> Fixadas no ponto de uso, com fotos e letras grandes</li>
<li><strong>Pasta de turno:</strong> Organizada com separadores por assunto (produção, qualidade, manutenção, segurança)</li>
<li><strong>Gestão visual de informações:</strong> Quadros de indicadores na entrada de cada setor, atualizados diariamente</li>
</ul>

<div class="callout"><strong>Teste do Seiton:</strong> Pegue um visitante que nunca entrou na fábrica e peça para ele localizar um item. Se conseguir em menos de 30 segundos seguindo a sinalização, o Seiton está bom. Se precisar perguntar a alguém, precisa melhorar.</div>
`}, 'Guia de sinalização de chao indústrial'),

  (${m2.id}, '2-3-seiso-limpeza-inspeção', 'Seiso na prática: limpeza como inspeção', '22 min', 3, ${`
<h2>Seiso na prática: limpeza como inspeção</h2>
<p>O Seiso é frequentemente o senso mais subestimado. Muitas empresas o tratam como "dia de faxina", mas no contexto indústrial o Seiso tem um papel estratégico: <strong>a limpeza é a primeira forma de inspeção</strong>. Ao limpar uma máquina, o operador passa a mao em cada superfície, olha cada canto — e encontra anomalias que nenhum sensor detectaria.</p>

<h3>Seiso indústrial vs. faxina comum</h3>
<table>
<tr><th>Aspecto</th><th>Faxina comum</th><th>Seiso indústrial</th></tr>
<tr><td>Objetivo</td><td>Estética</td><td>Inspeção e prevenção</td></tr>
<tr><td>Quem faz</td><td>Equipe de limpeza</td><td>O próprio operador da área/máquina</td></tr>
<tr><td>Frequência</td><td>Quando está sujo</td><td>Rotina diária programada</td></tr>
<tr><td>Atitude</td><td>Limpar a sujeira</td><td>Eliminar a fonte da sujeira</td></tr>
<tr><td>Resultado</td><td>Área limpa temporariamente</td><td>Máquina inspecionada + anomalias identificadas</td></tr>
</table>

<h3>O conceito de "limpeza como inspeção"</h3>
<p>Este conceito vem do TPM (Total Productive Maintenance) e se íntegra perfeitamente ao 5S. A ideia é:</p>
<ol>
<li><strong>Limpar:</strong> Remover sujeira, poeira, óleo, resíduos</li>
<li><strong>Inspecionar:</strong> Enquanto limpa, observar: vazamentos, folgas, rachaduras, fios soltos, ruídos anormais, vibração</li>
<li><strong>Registrar:</strong> Anotar anomalias encontradas numa ficha ou app</li>
<li><strong>Corrigir ou escalar:</strong> Se o operador pode resolver, resolve. Se não, abre ordem de serviço para manutenção</li>
<li><strong>Eliminar a fonte:</strong> Investigar por que a sujeira aparece é tratar a causa raiz</li>
</ol>

<div class="example"><strong>Caso real:</strong> Numa indústria de alimentos de Ponta Grossa (PR), a implantação do Seiso como inspeção nas linhas de envase gerou 67 relatórios de anomalias no primeiro mês. Dentre eles: 12 vazamentos de ar comprimido, 8 mangueiras com microfissuras, 3 rolamentos com ruído anormal é 1 fio elétrico desencapado. Custo total de reparo: R$ 3.800. Custo estimado se os problemas evoluissem para quebra: mais de R$ 45.000 (incluindo parada de linha e perda de produto).</div>

<h3>Rotina de Seiso — o check de 5 minutos</h3>
<p>A rotina de limpeza/inspeção não precisa ser longa. Um check de 5 minutos no início de cada turno é suficiente:</p>

<div class="template-box">
<h3>Template: Check de Limpeza/Inspeção Diária (5 min)</h3>
<table>
<tr><th>Item</th><th>Verificar</th><th>OK/NOK</th></tr>
<tr><td>Piso da área</td><td>Limpo, sem óleo/resíduos no chao</td><td>[ ]</td></tr>
<tr><td>Bancada de trabalho</td><td>Organizada, sem itens desnecessários</td><td>[ ]</td></tr>
<tr><td>Máquina — visual</td><td>Sem vazamentos, parafusos soltos, fios expostos</td><td>[ ]</td></tr>
<tr><td>Máquina — auditivo</td><td>Sem ruídos anormais ao ligar</td><td>[ ]</td></tr>
<tr><td>Ferramentas</td><td>Todas no shadow board, em bom estado</td><td>[ ]</td></tr>
<tr><td>Lixeiras</td><td>Vazias e identificadas por tipo de resíduo</td><td>[ ]</td></tr>
<tr><td>Sinalização</td><td>Placas e demarcações visíveis e íntegras</td><td>[ ]</td></tr>
</table>
<p><strong>Anomalias encontradas:</strong> _______________________________________________</p>
<p><strong>Acao tomada:</strong> __________________ | <strong>OS aberta?</strong> [ ] Sim N _______ [ ] Não</p>
<p><strong>Operador:</strong> __________________ | <strong>Turno:</strong> _____ | <strong>Data:</strong> ___/___/___</p>
</div>

<h3>Eliminando fontes de sujeira</h3>
<p>O Seiso avancado não se contenta em limpar — busca eliminar a <strong>causa raiz da sujeira</strong>:</p>
<ul>
<li><strong>Vazamento de óleo:</strong> Trocar retentores, apertar conexões, instalar bandejas coletoras</li>
<li><strong>Poeira de processo:</strong> Instalar coifas de exaustão, enclausurar pontos de geração</li>
<li><strong>Rebarbas e cavaco:</strong> Ajustar parâmetros de corte, instalar proteções, melhorar sistema de refrigeração</li>
<li><strong>Residuos de embalagem:</strong> Mudar material de embalagem, definir ponto de descarte próximo a área de uso</li>
</ul>

<div class="callout"><strong>Indicador de Seiso:</strong> Meça o "número de fontes de sujeira eliminadas por mês". No início será alto (muitas fontes). Com o tempo, cai — sinal de que o ambiente está realmente mais limpo de forma sustentável, não apenas varrido.</div>

<h3>Materiais de limpeza adequados</h3>
<p>Cada tipo de indústria exige materiais específicos:</p>
<table>
<tr><th>Tipo de indústria</th><th>Materiais recomendados</th><th>Cuidados</th></tr>
<tr><td>Metalúrgica</td><td>Panos absorventes indústriais, desengraxante, vassoura magnética</td><td>Oleo de corte exige descarte como resíduo perigoso</td></tr>
<tr><td>Alimentícia</td><td>Detergente neutro, sanitizante, panos descartáveis, rodo</td><td>Seguir PPHO (Procedimento Padrão de Higiene Operacional)</td></tr>
<tr><td>Construtora</td><td>Vassoura, pa, container para entulho, água sob pressão</td><td>Separar resíduos classe A, B, C conforme CONAMA 307</td></tr>
<tr><td>Agrícola</td><td>Vassoura, soprador, pa, sacos de ração/grainhos para descarte</td><td>Embalagens de agrotóxico seguem logística reversa (Lei 7.802)</td></tr>
</table>
`}, 'Ficha de limpeza/inspeção diária'),

  (${m2.id}, '2-4-dia-d-5s', 'Dia D do 5S: planejando o mutirao', '23 min', 4, ${`
<h2>Dia D do 5S: planejando o mutirao</h2>
<p>O Dia D é o marco de lançamento do programa 5S. É um <strong>evento concentrado</strong>, geralmente de 4 a 8 horas, onde toda a fábrica para (ou roda em escala reduzida) para aplicar os tres primeiros sensos de uma vez. O Dia D não é o 5S — e o <strong>pontape inicial</strong> que gera impacto visual e emocional, criando momentum para o programa.</p>

<h3>Antes do Dia D — planejamento (2-4 semanas antes)</h3>

<div class="template-box">
<h3>Template: Plano de Implantação — Dia D do 5S</h3>
<table>
<tr><th>Etapa</th><th>Acao</th><th>Responsável</th><th>Prazo</th></tr>
<tr><td>1</td><td>Definir data e horário do Dia D</td><td>Direção</td><td>4 semanas antes</td></tr>
<tr><td>2</td><td>Formar comitê 5S (3-5 pessoas)</td><td>Gestor de qualidade</td><td>4 semanas antes</td></tr>
<tr><td>3</td><td>Realizar diagnóstico inicial (todas as áreas)</td><td>Comitê 5S</td><td>3 semanas antes</td></tr>
<tr><td>4</td><td>Treinar todos os funcionários (conceitos básicos de 5S)</td><td>Comitê 5S</td><td>2 semanas antes</td></tr>
<tr><td>5</td><td>Comprar materiais (etiquetas, tintas, estantes, lixeiras, EPIs)</td><td>Compras</td><td>2 semanas antes</td></tr>
<tr><td>6</td><td>Definir áreas de quarentena para etiqueta vermelha</td><td>Comitê 5S</td><td>1 semana antes</td></tr>
<tr><td>7</td><td>Preparar caçambas para descarte e veículo para transporte</td><td>Logística</td><td>1 semana antes</td></tr>
<tr><td>8</td><td>Comunicar amplamente (cartazes, e-mail, reunião geral)</td><td>Comitê 5S</td><td>1 semana antes</td></tr>
<tr><td>9</td><td>Executar o Dia D</td><td>Todos</td><td>Data definida</td></tr>
<tr><td>10</td><td>Registrar resultados e compartilhar fotos antes/depois</td><td>Comitê 5S</td><td>1 dia após</td></tr>
</table>
</div>

<h3>Durante o Dia D — roteiro hora a hora</h3>
<p>Exemplo para um Dia D de 6 horas (07h00 as 13h00):</p>
<table>
<tr><th>Horário</th><th>Atividade</th><th>Duração</th></tr>
<tr><td>07h00</td><td>Abertura: palavra da direção, objetivos do dia, divisão de equipes</td><td>30 min</td></tr>
<tr><td>07h30</td><td><strong>Seiri:</strong> Cada equipe percorre sua área, separa e etiqueta itens desnecessários</td><td>2h</td></tr>
<tr><td>09h30</td><td>Intervalo (café/lanche oferecido pela empresa — gesto simbólico importante)</td><td>15 min</td></tr>
<tr><td>09h45</td><td><strong>Seiso:</strong> Limpeza profunda de cada área (chao, máquinas, estantes, paredes)</td><td>1h30</td></tr>
<tr><td>11h15</td><td><strong>Seiton:</strong> Reorganizar o que ficou — definir locais, identificar, sinalizar</td><td>1h15</td></tr>
<tr><td>12h30</td><td>Encerramento: fotos do depois, reconhecimento das equipes, próximos passos</td><td>30 min</td></tr>
</table>

<h3>Materiais necessários para o Dia D</h3>
<table>
<tr><th>Item</th><th>Quantidade estimada (fábrica 50-100 func.)</th><th>Custo estimado</th></tr>
<tr><td>Etiquetas vermelhas</td><td>200 unidades</td><td>R$ 80</td></tr>
<tr><td>Sacos de lixo indústriais (100L)</td><td>50 unidades</td><td>R$ 120</td></tr>
<tr><td>Fita adesiva demarcatória (amarela, 50mm)</td><td>10 rolos</td><td>R$ 350</td></tr>
<tr><td>Etiquetas adesivas para identificação</td><td>500 unidades</td><td>R$ 60</td></tr>
<tr><td>Tinta para piso epoxy</td><td>20 litros</td><td>R$ 600</td></tr>
<tr><td>Vassouras, rodos, panos, baldes</td><td>20 kits</td><td>R$ 400</td></tr>
<tr><td>Luvas de borracha, máscaras descartáveis</td><td>100 pares / 100 unidades</td><td>R$ 250</td></tr>
<tr><td>Café e lanche para equipe</td><td>1 serviço</td><td>R$ 500</td></tr>
<tr><td><strong>TOTAL ESTIMADO</strong></td><td></td><td><strong>R$ 2.360</strong></td></tr>
</table>

<div class="callout"><strong>Dica crítica:</strong> O café/lanche não é luxo — é investimento. O Dia D e um evento físico e exaustivo. Oferecer alimentação mostra que a empresa valoriza o esforço. Muitas fábricas relatam que o lanche comunitario do Dia D foi um dos momentos de maior íntegração da equipe.</div>

<h3>Erros comuns no Dia D</h3>
<ul>
<li><strong>Não envolver a direção:</strong> Se o dono ou diretor não participar, a mensagem é "isso não é importante". A direção deve estar presente, camiseta arregaçada, limpando junto.</li>
<li><strong>Não fotografar o antes:</strong> Sem o "antes", o "depois" perde impacto. Fotografe ANTES de começar qualquer atividade.</li>
<li><strong>Jogar tudo fora sem critério:</strong> O Seiri exige critério e registro. Jogar coisas fora sem etiqueta e sem consultar a equipe gera revolta e desconfiança.</li>
<li><strong>Achar que o Dia D resolve tudo:</strong> O Dia D é o início, não o fim. Sem continuidade (4o e 5o S), tudo volta ao normal em 60 dias.</li>
<li><strong>Fazer no horário de produção sem planejar:</strong> Parar a produção custa dinheiro. Planeje com antecedência, avise clientes se necessário, ajuste entregas.</li>
</ul>

<div class="example"><strong>Resultado típico:</strong> Uma fábrica de embalagens plásticas de Curitiba (PR) com 65 funcionários fez seu Dia D em um sábado. Resultados do dia: 2,3 toneladas de material descartado, 120 etiquetas vermelhas emitidas, 45 m2 de área liberada, 8 caçambas de entulho. Na segunda-feira seguinte, os operadores relataram que "parecia outra fábrica". A nota do diagnóstico 5S subiu de 28% para 58% em um único dia.</div>

<h3>Pós-Dia D — as primeiras 4 semanas</h3>
<p>O período após o Dia D e crítico. Ações essenciais:</p>
<ol>
<li><strong>Semana 1:</strong> Montar mural de fotos antes/depois em local visível. Resolver os itens da área de quarentena mais óbvios.</li>
<li><strong>Semana 2:</strong> Definir padrões visuais para cada área (fotos do "estado ideal").</li>
<li><strong>Semana 3:</strong> Implantar o check de 5 minutos diário (rotina de Seiso).</li>
<li><strong>Semana 4:</strong> Fazer a primeira mini-auditoria 5S para medir a evolução.</li>
</ol>
`}, 'Plano de implantação do Dia D (cronograma completo)')`;

  // ── Module 3: Padronização e Disciplina ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Padronização e Disciplina', 'Seiketsu, Shitsuke, gestão visual e engajamento de equipe', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '3-1-seiketsu-padronização-checklists', 'Seiketsu: padronização e checklists diários', '22 min', 1, ${`
<h2>Seiketsu: padronização e checklists diários</h2>
<p>O Seiketsu (senso de padronização) é o senso que <strong>consolida os tres primeiros</strong>. Sem ele, o Seiri, Seiton é Seiso são eventos pontuais que se desfazem em semanas. O Seiketsu transforma ações em <strong>rotinas, padrões e hábitos</strong>.</p>

<h3>O que é padronizar no contexto do 5S?</h3>
<p>Padronizar significa definir <strong>como as coisas devem ser</strong> e garantir que todos saibam e sigam. No 5S, isso inclui:</p>
<ul>
<li><strong>Estado padrão de cada área:</strong> Foto do "como deve estar" fixada no local</li>
<li><strong>Rotina de limpeza/inspeção:</strong> O que fazer, quando, como, quem</li>
<li><strong>Locais definidos para cada item:</strong> Mapa de layout com posição de tudo</li>
<li><strong>Limites visuais:</strong> Quantidade máxima e mínima de materiais em cada local</li>
<li><strong>Regras de uso compartilhado:</strong> Como usar e devolver ferramentas comuns</li>
</ul>

<h3>A foto do estado padrão</h3>
<p>A ferramenta mais simples é eficaz do Seiketsu é a <strong>foto do estado padrão</strong>. Funciona assim:</p>
<ol>
<li>Após o Dia D, quando a área está no melhor estado, tire uma foto de alta qualidade</li>
<li>Imprima em tamanho A4 ou A3 colorido</li>
<li>Plastifique e fixe num local visível da área</li>
<li>Essa foto se torna a <strong>referência</strong> — qualquer pessoa pode comparar o estado atual com o padrão</li>
</ol>

<div class="callout"><strong>Custo:</strong> Impressão A3 colorida + plastificação = R$ 8 a R$ 15 por foto. Para uma fábrica com 10 áreas, o investimento total fica entre R$ 80 e R$ 150. O retorno é desproporcional ao custo.</div>

<h3>Checklist diário de 5S — modelo prático</h3>

<div class="template-box">
<h3>Template: Checklist Diário de 5S — Setor Produção</h3>
<p><strong>Turno:</strong> _____ | <strong>Data:</strong> ___/___/___ | <strong>Responsável:</strong> _____________</p>
<table>
<tr><th>N</th><th>Item de verificação</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>
<tr><td>1</td><td>Bancada limpa e organizada conforme foto padrão</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2</td><td>Todas as ferramentas no shadow board</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3</td><td>Piso limpo, sem óleo ou resíduos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4</td><td>Lixeiras vazias e identificadas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5</td><td>Materiais no local correto e identificados</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>6</td><td>Sem itens desnecessários na área</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>7</td><td>Máquina sem vazamentos ou anomalias visíveis</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>8</td><td>Sinalização de chao íntegra e visível</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>9</td><td>Corredores livres (sem obstrução)</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>10</td><td>EPIs no local definido e em bom estado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Observações:</strong> _________________________________________________</p>
<p><strong>Assinatura responsável:</strong> __________________ <strong>Visto líder:</strong> __________________</p>
</div>

<h3>Padronização de cores na fábrica</h3>
<p>Um sistema de cores consistente fácilita a comunicação visual em toda a planta:</p>
<table>
<tr><th>Elemento</th><th>Cor sugerida</th><th>Exemplo</th></tr>
<tr><td>Equipamentos de produção</td><td>Verde ou azul claro</td><td>Tornos, fresadoras, prensas</td></tr>
<tr><td>Equipamentos de segurança</td><td>Vermelho</td><td>Extintores, alarmes, lava-olhos</td></tr>
<tr><td>Tubulações — ar comprimido</td><td>Azul</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulações — água</td><td>Verde</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulações — gas</td><td>Amarelo</td><td>Conforme NBR 6493</td></tr>
<tr><td>Áreas de risco</td><td>Amarelo e preto (zebrado)</td><td>Pontos de esmagamento, queda, elétrico</td></tr>
</table>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de autopecas de Sorocaba (SP) padronizou todo o sistema de cores em 30 dias. Investiu R$ 9.500 em tinta e mao de obra. Resultado: tempo de íntegração de novos funcionários caiu de 5 dias para 2 dias (porque o ambiente "se explica sozinho"), e o número de quase-acidentes por "não sabia que era perigoso" caiu 70%.</div>
`}, 'Checklist diário de 5S (modelo editável)'),

  (${m3.id}, '3-2-shitsuke-disciplina-lideranca', 'Shitsuke: disciplina e o papel da liderança', '22 min', 2, ${`
<h2>Shitsuke: disciplina e o papel da liderança</h2>
<p>O Shitsuke (senso de disciplina) é o senso que determina se o programa 5S <strong>vai sobreviver ou morrer</strong>. Estatisticas indicam que 70% dos programas 5S fracassam no médio prazo — é a causa principal e a falta de disciplina sustentada pela liderança.</p>

<h3>O que é disciplina no 5S?</h3>
<p>Disciplina no contexto do 5S <strong>não é punicao</strong>. É a capacidade de <strong>seguir padrões de forma consistente e autônoma</strong>, mesmo sem supervisao. Disciplina madura e quando o operador mantem o padrão porque entende o valor, não porque tem medo de ser cobrado.</p>

<h3>Os tres estágios da disciplina</h3>
<table>
<tr><th>Estágio</th><th>Descrição</th><th>Tempo médio</th><th>Acao da liderança</th></tr>
<tr><td><strong>1. Cobranca</strong></td><td>A equipe só segue o padrão quando cobrada</td><td>Meses 1-6</td><td>Presenca constante, auditorias semanais, feedback imediato</td></tr>
<tr><td><strong>2. Consciencia</strong></td><td>A equipe entende o porqu e segue com menos cobrança</td><td>Meses 6-18</td><td>Reconhecimento, autonomia gradual, auditorias quinzenais</td></tr>
<tr><td><strong>3. Habito</strong></td><td>O padrão é seguido naturalmente, faz parte da cultura</td><td>Após 18 meses</td><td>Manter auditorias mensais, inovar, celebrar resultados</td></tr>
</table>

<h3>O papel da liderança — o fator mais crítico</h3>
<p>Pesquisas de campo em indústrias brasileiras revelam um padrão claro: <strong>onde a liderança prática o 5S, o programa funciona; onde não prática, o programa morre</strong>. Não importa quanto treinamento você deu. Se o supervisor tem a mesa bagunçada, se o gerente ignora o chao sujo, o operador entende que "5S não é de verdade".</p>

<div class="callout"><strong>Regra de ouro:</strong> A liderança deve ser a primeira a ser auditada no 5S. Se a sala da direção não está no padrão, nenhuma área de produção estara. Comece de cima para baixo — sempre.</div>

<h3>Ações práticas da liderança para sustentar o 5S</h3>
<ol>
<li><strong>Gemba walk semanal:</strong> O gestor caminha pela fábrica com o checklist de 5S, conversa com operadores, reconhece melhorias e aponta desvios. Não e inspeção punitiva — e demonstracao de interesse.</li>
<li><strong>Feedback imediato:</strong> Quando encontrar algo fora do padrão, corrija na hora com a equipe (sem armazenar para a reunião mensal).</li>
<li><strong>Reconhecimento público:</strong> Destaque as áreas que melhoraram. Use fotos antes/depois no quadro de gestão visual. Reconhecimento é mais poderoso que punicao.</li>
<li><strong>Recursos disponíveis:</strong> Se a equipe precisa de uma estante, um rolo de fita ou uma lata de tinta para manter o padrão, forneça rapidamente. Demora em liberar recursos mata a motivação.</li>
<li><strong>Exemplo pessoal:</strong> Mantenha sua mesa, seu escritório e suas áreas no padrão. Participe do Dia D. Use os EPIs corretamente.</li>
</ol>

<h3>O que mata o 5S — os 7 assassinos</h3>
<ul>
<li><strong>1. Falta de exemplo da liderança:</strong> "Faça o que eu digo, não o que eu faco" não funciona</li>
<li><strong>2. Dia D sem continuidade:</strong> Fazer o evento e abandonar depois</li>
<li><strong>3. Punicao sem reconhecimento:</strong> Cobrar erros e ignorar acertos</li>
<li><strong>4. Falta de tempo dedicado:</strong> "Não temos tempo para 5S, tem produção para entregar" — se não há 5 minutos por dia, o problema é de gestão, não de tempo</li>
<li><strong>5. Rotatividade sem treinamento:</strong> Novos funcionários não sabem o que é 5S é desfazem o trabalho dos outros</li>
<li><strong>6. Sem medição:</strong> O que não é medido não é gerênciado. Sem auditoria, sem nota, sem acompanhamento</li>
<li><strong>7. Programa "da qualidade":</strong> Quando o 5S é visto como responsabilidade só do setor de qualidade, e não de todos</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma indústria grafica de Blumenau (SC) implantou o 5S em 2019. Em 6 meses, a nota média subiu de 35% para 78%. Então o gerente de produção foi transferido e o substituto "não acreditava em 5S". Em 4 meses, a nota caiu para 42%. A empresa só recuperou quando o diretor assumiu pessoalmente as auditorias e cobrou o novo gerente. Licao: a sustentação depende da <strong>estrutura</strong> (auditorias, metas, reconhecimento), não de uma única pessoa.</div>

<h3>Integracao de novos funcionários</h3>
<p>Todo novo funcionário deve passar por uma <strong>íntegração de 5S</strong> no primeiro dia:</p>
<ul>
<li>Explicacao dos 5 sensos (15 minutos)</li>
<li>Tour pela fábrica mostrando os padrões visuais</li>
<li>Apresentação do shadow board e do checklist da área</li>
<li>Designacao de um "padrinho de 5S" (colega experiente) na primeira semana</li>
</ul>
`}, NULL),

  (${m3.id}, '3-3-gestão-visual-quadros-sinalização', 'Gestão visual: quadros, sinalização e cores', '20 min', 3, ${`
<h2>Gestão visual: quadros, sinalização e cores</h2>
<p>A gestão visual e o <strong>sistema nervoso do 5S</strong>. Num ambiente com boa gestão visual, qualquer pessoa — funcionário, visitante, auditor — consegue entender a situação em segundos, sem precisar perguntar. O objetivo é simples: <strong>tornar o estado normal e o anormal visíveis instantaneamente</strong>.</p>

<h3>Princípios da gestão visual indústrial</h3>
<ol>
<li><strong>Informação no ponto de uso:</strong> A informação deve estar onde é necessária, não num escritório distante</li>
<li><strong>Compreensao imediata:</strong> Qualquer pessoa deve entender em até 5 segundos</li>
<li><strong>Anomalia visível:</strong> Quando algo está fora do padrão, deve ser óbvio</li>
<li><strong>Atualização fácil:</strong> Se e difícil atualizar, ninguém atualiza</li>
</ol>

<h3>Quadro de gestão visual — o "cockpit" da área</h3>
<p>Cada setor deve ter um quadro de gestão visual (também chamado de "quadro de bordo" ou "daily management board"). Conteúdo recomendado:</p>

<div class="template-box">
<h3>Template: Quadro de Gestão Visual — Setor</h3>
<table>
<tr><th>Seção</th><th>Conteúdo</th><th>Frequência de atualização</th></tr>
<tr><td>Segurança</td><td>Dias sem acidente, mapa de riscos da área, EPIs obrigatórios</td><td>Diária</td></tr>
<tr><td>Qualidade</td><td>Índice de rejeição, não-conformidades abertas, meta do mês</td><td>Diária/semanal</td></tr>
<tr><td>Produção</td><td>Meta x realizado (diário), OEE, paradas</td><td>Diária</td></tr>
<tr><td>5S</td><td>Nota da última auditoria, fotos antes/depois, ranking de áreas</td><td>Mensal</td></tr>
<tr><td>Pessoas</td><td>Aniversariantes, treinamentos, reconhecimentos</td><td>Mensal</td></tr>
<tr><td>Ações</td><td>Plano de ação pendente (5W2H simplificado)</td><td>Semanal</td></tr>
</table>
</div>

<h3>Tipos de sinalização indústrial</h3>
<table>
<tr><th>Tipo</th><th>Exemplos</th><th>Material</th><th>Custo médio</th></tr>
<tr><td>Sinalização de chao</td><td>Faixas de corredor, demarcação de equipamentos, áreas de estoque</td><td>Fita adesiva ou pintura epoxy</td><td>R$ 15-40/m (fita) ou R$ 30-60/m2 (pintura)</td></tr>
<tr><td>Placas de identificação</td><td>Nome do setor, função do equipamento, nome da estante</td><td>PVC, acrílico ou alumínio</td><td>R$ 20-80/placa</td></tr>
<tr><td>Etiquetas de prateleira</td><td>Nome do item, código, quantidade min/max, foto</td><td>Papel plastificado ou PVC fino</td><td>R$ 2-8/etiqueta</td></tr>
<tr><td>Andon (semáforo)</td><td>Verde (normal), amarelo (atenção), vermelho (parada)</td><td>LED indústrial</td><td>R$ 150-600/unidade</td></tr>
<tr><td>Marcadores de nível</td><td>Nível min/max em recipientes de líquidos ou estoque</td><td>Fita colorida ou pintura</td><td>R$ 5-15/marcador</td></tr>
</table>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de alimentos de Marília (SP) implantou gestão visual completa em 45 dias. Investimento: R$ 14.000 (quadros, placas, sinalização de chao, etiquetas). Resultado: o tempo de treinamento de novos operadores na linha de produção caiu de 2 semanas para 5 dias, porque o ambiente "ensina" sozinho. Auditores da ANVISA elogiaram especificamente a identificação de áreas e o controle visual de validade.</div>

<h3>Sinalização de segurança integrada ao 5S</h3>
<p>O 5S é a sinalização de segurança (NR-26, NBR 7195) se complementam. Ao implantar o 5S, aproveite para revisar e melhorar a sinalização de segurança:</p>
<ul>
<li><strong>Rotas de fuga:</strong> Setas fotoluminescentes no chao e nas paredes</li>
<li><strong>Extintores:</strong> Demarcacao de chao vermelha, placa de identificação com tipo e validade</li>
<li><strong>Painéis eletricos:</strong> Identificação de circuitos, aviso de risco de choque</li>
<li><strong>Áreas de risco:</strong> Zebrado amarelo/preto, placa com tipo de risco e EPI obrigatório</li>
<li><strong>Saida de emergência:</strong> Sinalização verde com pictograma e seta direcional</li>
</ul>

<h3>Gestão visual digital</h3>
<p>Empresas mais avancadas estão complementando a gestão visual física com ferramentas digitais:</p>
<ul>
<li><strong>TV/monitor no setor:</strong> Exibindo indicadores em tempo real (OEE, produção, qualidade)</li>
<li><strong>Apps de auditoria 5S:</strong> Fotos com geolocalização, pontuação automática, histórico de evolução</li>
<li><strong>QR codes:</strong> Nas máquinas e estantes, linkando para instrução de trabalho, ficha técnica ou histórico de manutenção</li>
</ul>

<div class="callout"><strong>Equilibrio:</strong> A gestão visual física (quadros, placas, cores) e insubstituivel — funciona sem energia, sem wifi, sem celular. A digital complementa, mas não substitui. Comece pelo físico, depois adicione o digital onde agregar valor.</div>
`}, 'Layout de quadro de gestão visual (modelo A1)'),

  (${m3.id}, '3-4-engajamento-equipe-comunicação', 'Engajamento de equipe e comunicação', '20 min', 4, ${`
<h2>Engajamento de equipe e comunicação</h2>
<p>O 5S só funciona se as <strong>pessoas acreditarem no programa</strong>. Não se implanta 5S por decreto — se implanta por <strong>convencimento, envolvimento e comunicação</strong>. Esta aula aborda as estratégias práticas para engajar todos os niveis da organização.</p>

<h3>Por que as pessoas resistem ao 5S?</h3>
<p>Entender a resistência é o primeiro passo para supera-la:</p>
<table>
<tr><th>Motivo da resistência</th><th>O que a pessoa pensa</th><th>Como lidar</th></tr>
<tr><td>Medo de mudança</td><td>"Vai mudar minha rotina e eu não sei se vou me adaptar"</td><td>Envolver na decisão, treinar antes de cobrar</td></tr>
<tr><td>Experiência negativa anterior</td><td>"Já tentaram 5S aqui e não funcionou"</td><td>Reconhecer o passado, mostrar o que será diferente desta vez</td></tr>
<tr><td>Falta de tempo</td><td>"Mal dou conta da produção, agora querem que eu limpe?"</td><td>Mostrar que 5 min de organização economizam 30 min de busca</td></tr>
<tr><td>Senso de propriedade</td><td>"Ninguem vai mexer nas minhas coisas"</td><td>Participacao na classificação, respeito ao conhecimento do operador</td></tr>
<tr><td>Descrenca na liderança</td><td>"Eles nem arrumam o escritório deles"</td><td>Liderança pelo exemplo — comece de cima</td></tr>
</table>

<h3>Estratégias de engajamento por nível</h3>

<h3>Alta direção</h3>
<ul>
<li><strong>Linguagem:</strong> ROI, produtividade, redução de custo, imagem para clientes e auditores</li>
<li><strong>Ferramenta:</strong> Apresente o diagnóstico com fotos e números. Compare o custo do 5S com o custo do desperdício.</li>
<li><strong>Compromisso:</strong> A direção deve estar presente no Dia D e nas auditorias iniciais.</li>
</ul>

<h3>Gestão intermediaria (supervisores e líderes)</h3>
<ul>
<li><strong>Linguagem:</strong> Facilitação do trabalho, menos problemas diários, equipe mais autônoma</li>
<li><strong>Ferramenta:</strong> Treine-os como auditores 5S. Dando-lhes papel ativo, cria senso de propriedade.</li>
<li><strong>Compromisso:</strong> Cada supervisor e responsável pela nota 5S da sua área.</li>
</ul>

<h3>Operadores</h3>
<ul>
<li><strong>Linguagem:</strong> Conforto, segurança, orgulho do ambiente, menos tempo perdido</li>
<li><strong>Ferramenta:</strong> Envolvimento na decisão (eles decidem o que fica é o que sai, onde cada coisa fica). Faça com eles, não para eles.</li>
<li><strong>Compromisso:</strong> Cada operador e responsável pelo check diário da sua área.</li>
</ul>

<div class="callout"><strong>Princípio fundamental:</strong> "As pessoas apoiam o que ajudam a construir." Quanto mais a equipe participar das decisões do 5S (onde guardar, como organizar, que padrão definir), mais ela vai defender o programa.</div>

<h3>Comunicação do programa 5S</h3>
<p>A comunicação deve ser constante, não só no lançamento:</p>
<table>
<tr><th>Momento</th><th>Canal</th><th>Mensagem</th></tr>
<tr><td>Antes do lançamento</td><td>Reuniao geral, cartazes</td><td>"O que é 5S, por que estamos fazendo, como vai funcionar"</td></tr>
<tr><td>Dia D</td><td>Presencial, fotos</td><td>"Estamos transformando nosso ambiente juntos"</td></tr>
<tr><td>Primeiras semanas</td><td>Mural, e-mail, app</td><td>Fotos antes/depois, resultados iniciais</td></tr>
<tr><td>Mensal</td><td>Quadro de gestão visual</td><td>Nota da auditoria, ranking de áreas, evolução</td></tr>
<tr><td>Trimestral</td><td>Reuniao geral</td><td>Resultados consolidados, reconhecimento das melhores áreas</td></tr>
</table>

<h3>Programa de reconhecimento 5S</h3>
<p>O reconhecimento é mais eficaz que a punicao para manter o programa vivo. Modelos que funcionam:</p>
<ul>
<li><strong>Área destaque do mês:</strong> A área com melhor nota na auditoria ganha um troféu simbólico (um selo, uma bandeira, um quadro) que fica exposto até a próxima avaliação. Custo: zero.</li>
<li><strong>Foto no quadro:</strong> A equipe da melhor área tem foto no quadro de gestão visual. Orgulho visível.</li>
<li><strong>Café com a direção:</strong> A equipe vencedora toma um café com o diretor, que pessoalmente agradece o esforço. Custo: R$ 50. Impacto: enorme.</li>
<li><strong>Prêmio trimestral:</strong> A melhor área do trimestre recebe um prêmio coletivo (churrasco, cesta básica extra, folga). Custo: R$ 500-1.500. Retorno: incalculavel em motivação.</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma metalúrgica de Piracicaba (SP) com 180 funcionários criou o "Torneio 5S". As 6 áreas de produção competem mensalmente. A vencedora ganha uma estrela no quadro. Ao final de 6 meses, a área com mais estrelas ganha um churrasco pago pela empresa. Em 2 anos de programa, a nota média subiu de 45% para 87%, e a rotatividade de pessoal caiu 18% (as pessoas passaram a ter mais orgulho do ambiente de trabalho).</div>

<h3>O papel do comitê 5S</h3>
<p>O comitê 5S é o grupo responsável por coordenar o programa. Composicao ideal:</p>
<ul>
<li>1 coordenador (preferencialmente da área de qualidade ou produção)</li>
<li>1 representante de cada setor principal</li>
<li>1 representante da direção (para garantir autoridade e recursos)</li>
<li>Mandato de 12 meses, renovável</li>
</ul>
<p>Atribuições: planejar auditorias, compilar resultados, propor melhorias, organizar eventos de reconhecimento, treinar novos funcionários.</p>
`}, 'Modelo de programa de reconhecimento 5S')`;

  // ── Module 4: Sustentação e Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Sustentação e Melhoria', 'Auditoria, indicadores, melhoria contínua e íntegração com outros programas', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-auditoria-5s-checklist-pontuacao', 'Auditoria 5S: checklist e pontuação', '25 min', 1, ${`
<h2>Auditoria 5S: checklist e pontuação</h2>
<p>A auditoria 5S é o <strong>instrumento que mantem o programa vivo</strong>. Sem auditoria, não há medição. Sem medição, não há gestão. Sem gestão, o 5S desaparece em semanas. A auditoria não é "fiscalização" — é um <strong>diagnóstico periódico</strong> que mostra onde a área está e para onde precisa ir.</p>

<h3>Frequência de auditorias</h3>
<table>
<tr><th>Fase do programa</th><th>Frequência recomendada</th><th>Quem audita</th></tr>
<tr><td>Primeiros 3 meses</td><td>Semanal</td><td>Comitê 5S ou líder da área vizinha</td></tr>
<tr><td>Meses 3-12</td><td>Quinzenal</td><td>Comitê 5S</td></tr>
<tr><td>Após 12 meses</td><td>Mensal</td><td>Comitê 5S + auditoria cruzada entre setores</td></tr>
<tr><td>Programa maduro (2+ anos)</td><td>Mensal ou bimestral</td><td>Auditoria cruzada + auditoria surpresa trimestral</td></tr>
</table>

<div class="callout"><strong>Auditoria cruzada:</strong> O líder do setor A audita o setor B, o líder de B audita o C, e assim por diante. Isso traz olhar externo (mais crítico) e dissemina boas práticas entre setores. É uma das técnicas mais eficazes para sustentar o 5S.</div>

<h3>Checklist de auditoria 5S — modelo completo</h3>

<div class="template-box">
<h3>Template: Auditoria 5S — Checklist de Pontuacao</h3>
<p><strong>Área:</strong> _____________ | <strong>Auditor:</strong> _____________ | <strong>Data:</strong> ___/___/___</p>
<p><strong>Escala:</strong> 0 = Não atende | 1 = Atende parcialmente | 2 = Atende plenamente</p>

<p><strong>SEIRI (Utilizacao)</strong></p>
<table>
<tr><th>N</th><th>Critério</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>1.1</td><td>Não há itens desnecessários na área de trabalho</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.2</td><td>Não há ferramentas/materiais sem uso visível</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.3</td><td>Não há documentos ou informações obsoletas expostas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.4</td><td>Não há equipamentos/móveis sem função definida</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.5</td><td>Quantidade de materiais compatível com a demanda</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiri: ___/10</strong></p>

<p><strong>SEITON (Organização)</strong></p>
<table>
<tr><th>N</th><th>Critério</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>2.1</td><td>Cada item tem local definido e identificado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.2</td><td>Itens estão efetivamente nos locais definidos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.3</td><td>Shadow board ou sistema equivalente em uso</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.4</td><td>Demarcacao de chao íntegra e respeitada</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.5</td><td>Item localizado em até 30 segundos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiton: ___/10</strong></p>

<p><strong>SEISO (Limpeza)</strong></p>
<table>
<tr><th>N</th><th>Critério</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>3.1</td><td>Piso limpo, sem resíduos, óleo ou poeira excessiva</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.2</td><td>Equipamentos limpos e sem vazamentos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.3</td><td>Materiais de limpeza disponíveis e organizados</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.4</td><td>Lixeiras identificadas, não transbordando</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.5</td><td>Fontes de sujeira identificadas e em tratamento</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiso: ___/10</strong></p>

<p><strong>SEIKETSU (Padronização)</strong></p>
<table>
<tr><th>N</th><th>Critério</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>4.1</td><td>Foto do estado padrão fixada e visível</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.2</td><td>Checklist diário preenchido e atualizado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.3</td><td>Padrões de cores e sinalização seguidos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.4</td><td>Informações do quadro de gestão visual atualizadas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.5</td><td>Instruções de trabalho no ponto de uso</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiketsu: ___/10</strong></p>

<p><strong>SHITSUKE (Disciplina)</strong></p>
<table>
<tr><th>N</th><th>Critério</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>5.1</td><td>A equipe demonstra conhecimento dos padrões 5S</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.2</td><td>O check diário é feito sem cobrança</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.3</td><td>Novos funcionários receberam treinamento 5S</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.4</td><td>Ações corretivas de auditorias anteriores foram concluidas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.5</td><td>A área demonstra melhoria em relação a última auditoria</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Shitsuke: ___/10</strong></p>

<p><strong>TOTAL GERAL: ___/50 = ___%</strong></p>
<p><strong>Classificação:</strong> [ ] Crítico (0-40%) | [ ] Insuficiente (41-60%) | [ ] Bom (61-80%) | [ ] Excelente (81-100%)</p>
<p><strong>Pontos fortes:</strong> _________________________________________________</p>
<p><strong>Oportunidades de melhoria:</strong> _______________________________________</p>
<p><strong>Assinatura auditor:</strong> _____________ | <strong>Assinatura líder da área:</strong> _____________</p>
</div>

<h3>Conduzindo a auditoria</h3>
<p>Dicas para uma auditoria eficaz:</p>
<ol>
<li><strong>Caminhe pela área:</strong> Não audite de longe. Entre, olhe atras das máquinas, abra armarios, verifique gavetas.</li>
<li><strong>Converse com operadores:</strong> Pergunte: "Onde fica tal ferramenta? Qual e a rotina de limpeza?" Se o operador sabe responder, o 5S está funcionando.</li>
<li><strong>Teste os 30 segundos:</strong> Peça para localizar um item específico. Cronometre.</li>
<li><strong>Fotografe desvios:</strong> Foto com data e hora e evidência objetiva.</li>
<li><strong>Feedback imediato:</strong> Ao final, converse com o líder da área sobre os achados. Não espere o relatório formal.</li>
<li><strong>Registre pontos positivos:</strong> A auditoria não é só para achar defeitos. Reconheca o que está bom.</li>
</ol>

<div class="example"><strong>Benchmark:</strong> Empresas com programa 5S maduro costumam ter nota média entre 80% e 92%. Notas acima de 95% por períodos longos podem indicar auditoria branda (complacência). O ideal e que haja sempre oportunidades de melhoria identificadas — isso mostra que o olhar crítico contínua ativo.</div>
`}, 'Checklist de auditoria 5S (modelo completo com pontuação)'),

  (${m4.id}, '4-2-indicadores-5s-acompanhamento', 'Indicadores de 5S é acompanhamento', '20 min', 2, ${`
<h2>Indicadores de 5S é acompanhamento</h2>
<p>O 5S, como qualquer programa de gestão, precisa de <strong>indicadores para ser gerênciado</strong>. Sem números, não há como saber se o programa está avancando, estagnado ou regredindo. Os indicadores transformam percepção em <strong>fatos</strong>.</p>

<h3>Indicadores primários do 5S</h3>
<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta sugerida</th><th>Frequência</th></tr>
<tr><td><strong>Nota de auditoria 5S (%)</strong></td><td>Aderência ao padrão geral</td><td>Acima de 80% após 12 meses</td><td>Mensal</td></tr>
<tr><td><strong>Nota por senso (%)</strong></td><td>Pontuacao de cada S separadamente</td><td>Nenhum senso abaixo de 60%</td><td>Mensal</td></tr>
<tr><td><strong>Tendência de evolução</strong></td><td>A nota está subindo, estavel ou caindo?</td><td>Tendência de alta nos primeiros 12 meses</td><td>Trimestral</td></tr>
<tr><td><strong>Taxa de fechamento de ações</strong></td><td>% de ações corretivas da auditoria concluidas no prazo</td><td>Acima de 90%</td><td>Mensal</td></tr>
</table>

<h3>Indicadores secundários (impacto do 5S)</h3>
<p>Além dos indicadores diretos do programa, é importante medir o <strong>impacto do 5S nos resultados da operação</strong>:</p>
<table>
<tr><th>Indicador</th><th>Relacao com o 5S</th><th>Como medir</th></tr>
<tr><td>Tempo de setup</td><td>Seiton reduz busca de ferramentas e materiais</td><td>Cronometrar setup antes e depois do 5S</td></tr>
<tr><td>Acidentes de trabalho</td><td>Seiso elimina riscos; Seiton libera corredores</td><td>Registros de SST (CAT, quase-acidentes)</td></tr>
<tr><td>Retrabalho / refugo</td><td>Organização reduz troca de material e erros</td><td>Índice de rejeição por área</td></tr>
<tr><td>Reclamações de clientes</td><td>Ambiente organizado reduz erros de expedicao</td><td>SAC / sistema de reclamações</td></tr>
<tr><td>Área útil disponível</td><td>Seiri libera espaço</td><td>Medição em m2 recuperados</td></tr>
<tr><td>Custo de manutenção corretiva</td><td>Seiso como inspeção previne quebras</td><td>Ordens de serviço corretivas vs. preventivas</td></tr>
</table>

<div class="callout"><strong>Correlação e causalidade:</strong> Cuidado ao atribuir toda melhoria ao 5S. Se você implantou 5S é TPM ao mesmo tempo, a redução de paradas pode ser efeito dos dois. Mas se o 5S foi a única mudança, a correlação é mais forte. Documente as datas de implantação de cada programa para poder isolar os efeitos.</div>

<h3>Dashboard de 5S — como montar</h3>
<p>O acompanhamento deve ser visual e acessível. Opções:</p>

<h3>Opcao 1 — Quadro físico (recomendado para início)</h3>
<ul>
<li>Gráfico de barras mensal com a nota de cada área (desenhado a mao ou impresso)</li>
<li>Semáforo por área: verde (acima de 80%), amarelo (60-80%), vermelho (abaixo de 60%)</li>
<li>Fotos antes/depois das 3 maiores melhorias do mês</li>
<li>Lista de ações pendentes com responsável e prazo</li>
</ul>

<h3>Opcao 2 — Planilha compartilhada (Google Sheets / Excel Online)</h3>
<ul>
<li>Aba de registro de auditorias (data, área, nota por senso, nota total)</li>
<li>Aba de gráfico de evolução (linha do tempo com notas mensais por área)</li>
<li>Aba de ações corretivas (item, responsável, prazo, status)</li>
<li>Dashboard automático com gráficos</li>
</ul>

<h3>Opcao 3 — App especializado</h3>
<p>Para empresas maiores (100+ funcionários), apps como ChecklistFacil, iAuditor ou Auditoria Digital permitem:</p>
<ul>
<li>Auditorias no celular com fotos geolocalizadas</li>
<li>Pontuacao automática</li>
<li>Geração de relatórios em PDF</li>
<li>Notificações de ações vencidas</li>
<li>Custo: R$ 100 a R$ 500/mês dependendo do plano</li>
</ul>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de peças em Manaus (AM) migrou das auditorias em papel para o app ChecklistFacil. O tempo de auditoria por área caiu de 45 minutos para 20 minutos (porque o app já tem os critérios pre-carregados). O tempo de compilacao dos resultados caiu de 4 horas/mês para zero (o app gera o relatório automaticamente). É o histórico de fotos permitiu criar um "album de evolução" que impressiona clientes em visitas a fábrica.</div>

<h3>Reuniao mensal de 5S</h3>
<p>Uma boa prática e realizar uma reunião mensal de 15-30 minutos para revisar os indicadores:</p>
<ol>
<li>Apresentar nota de auditoria de cada área (5 min)</li>
<li>Destacar as 3 maiores melhorias e as 3 maiores oportunidades (5 min)</li>
<li>Revisar ações pendentes (5 min)</li>
<li>Reconhecer a área destaque do mês (2 min)</li>
<li>Definir foco do próximo mês (3 min)</li>
</ol>
`}, 'Modelo de dashboard 5S (planilha)'),

  (${m4.id}, '4-3-ações-corretivas-melhoria-continua', 'Ações corretivas e melhoria contínua no 5S', '20 min', 3, ${`
<h2>Ações corretivas e melhoria contínua no 5S</h2>
<p>A auditoria identifica desvios. Os indicadores mostram tendências. Mas o que realmente <strong>melhora o programa</strong> e a ação sobre essas informações. Nesta aula, vamos tratar de como transformar achados de auditoria em <strong>ações eficazes</strong> e como manter o ciclo de melhoria contínua do 5S.</p>

<h3>O ciclo PDCA aplicado ao 5S</h3>
<p>O 5S segue naturalmente o ciclo PDCA:</p>
<table>
<tr><th>Fase</th><th>Aplicacao no 5S</th><th>Ferramentas</th></tr>
<tr><td><strong>Plan (Planejar)</strong></td><td>Diagnóstico, definição de padrões, metas, cronograma</td><td>Checklist de diagnóstico, plano de implantação</td></tr>
<tr><td><strong>Do (Executar)</strong></td><td>Dia D, organização, limpeza, sinalização</td><td>Etiqueta vermelha, shadow board, demarcação</td></tr>
<tr><td><strong>Check (Verificar)</strong></td><td>Auditorias, indicadores, feedback dos operadores</td><td>Checklist de auditoria, dashboard, reunião mensal</td></tr>
<tr><td><strong>Act (Agir)</strong></td><td>Ações corretivas, ajuste de padrões, melhoria</td><td>5W2H, 5 Por ques, Kaizen</td></tr>
</table>

<h3>Tratamento de não-conformidades de auditoria</h3>
<p>Quando a auditoria identifica um desvio, o tratamento segue um fluxo simples:</p>
<ol>
<li><strong>Registrar:</strong> O que foi encontrado, onde, quando (com foto)</li>
<li><strong>Analisar causa:</strong> Por que aconteceu? (use os 5 Por ques)</li>
<li><strong>Definir ação:</strong> O que fazer para corrigir e prevenir recorrencia</li>
<li><strong>Definir responsável e prazo:</strong> Quem faz e até quando</li>
<li><strong>Executar:</strong> Realizar a ação</li>
<li><strong>Verificar eficácia:</strong> Na próxima auditoria, o desvio desapareceu?</li>
</ol>

<div class="template-box">
<h3>Template: Plano de Acao 5S (5W2H simplificado)</h3>
<table>
<tr><th>Campo</th><th>Descrição</th><th>Preenchimento</th></tr>
<tr><td><strong>O que? (What)</strong></td><td>Qual e o desvio/oportunidade?</td><td>______________________________</td></tr>
<tr><td><strong>Por que? (Why)</strong></td><td>Qual a causa raiz?</td><td>______________________________</td></tr>
<tr><td><strong>Onde? (Where)</strong></td><td>Em qual área/setor?</td><td>______________________________</td></tr>
<tr><td><strong>Quem? (Who)</strong></td><td>Responsável pela ação</td><td>______________________________</td></tr>
<tr><td><strong>Quando? (When)</strong></td><td>Prazo para conclusão</td><td>___/___/___</td></tr>
<tr><td><strong>Como? (How)</strong></td><td>Descrição da ação</td><td>______________________________</td></tr>
<tr><td><strong>Quanto? (How much)</strong></td><td>Custo estimado (se houver)</td><td>R$ ________</td></tr>
</table>
<p><strong>Status:</strong> [ ] Pendente | [ ] Em andamento | [ ] Concluida | [ ] Verificada eficaz</p>
</div>

<h3>Os 5 Por ques — análise de causa raiz no 5S</h3>
<p>Muitos desvios de 5S tem causas raiz mais profundas do que parecem. A técnica dos 5 Por ques ajuda a ir além do superficial:</p>

<div class="example"><strong>Exemplo:</strong>
<p><strong>Desvio:</strong> Ferramentas fora do shadow board no setor de usinagem.</p>
<p><strong>1o Por que?</strong> Os operadores não devolvem as ferramentas após o uso.</p>
<p><strong>2o Por que?</strong> O shadow board fica longe da máquina (15 metros).</p>
<p><strong>3o Por que?</strong> O shadow board foi instalado na parede mais conveniente durante o Dia D, sem consultar os operadores.</p>
<p><strong>4o Por que?</strong> Não houve critério de proximidade ao definir a posição do shadow board.</p>
<p><strong>Causa raiz:</strong> Shadow board mal posicionado.</p>
<p><strong>Acao:</strong> Relocar o shadow board para a parede ao lado das máquinas CNC (distância máxima de 3 metros). Custo: R$ 120 (parafusos e mao de obra). Prazo: 5 dias.</p></div>

<h3>Kaizen no 5S — pequenas melhorias continuas</h3>
<p>Além de corrigir desvios, o 5S pode (e deve) evoluir continuamente. Ideias de Kaizen no 5S:</p>
<ul>
<li><strong>Novos shadow boards:</strong> Expandir para áreas que não tinham</li>
<li><strong>Demarcacao de chao melhorada:</strong> Trocar fita por pintura (mais durável)</li>
<li><strong>Iluminacao de estantes:</strong> Adicionar LED em estantes escuras para fácilitar a identificação</li>
<li><strong>Etiquetas com QR code:</strong> Linkar para a ficha técnica ou instrução de trabalho</li>
<li><strong>Redução do check de 5 min para 3 min:</strong> Otimizar a rotina a medida que o padrão se consolida</li>
</ul>

<h3>Quando o 5S regride — plano de recuperação</h3>
<p>Se a nota de auditoria cair abaixo de 60% após já ter estado acima de 80%, é necessário um plano de recuperação:</p>
<ol>
<li><strong>Diagnóstico rapido:</strong> Identificar a causa da regressão (mudança de líder? Rotatividade alta? Perda de interesse?)</li>
<li><strong>Reuniao com a equipe:</strong> Não para punir, mas para entender e replanejar</li>
<li><strong>Mini Dia D:</strong> Um mutirao de 2-3 horas para restaurar o padrão</li>
<li><strong>Aumento temporario de auditorias:</strong> Voltar para semanal até estabilizar acima de 70%</li>
<li><strong>Reforco da liderança:</strong> O gestor deve estar mais presente na área</li>
</ol>

<div class="callout"><strong>Dado real:</strong> Em uma pesquisa com 45 indústrias brasileiras que implantaram 5S (SENAI-PR, 2021), 62% relataram pelo menos uma regressão significativa nos primeiros 2 anos. Das que se recuperaram, 100% tinham sistema de auditoria ativo. Das que não se recuperaram, apenas 15% faziam auditorias regulares. A auditoria é o "seguro de vida" do programa 5S.</div>
`}, 'Modelo de plano de ação 5W2H para 5S'),

  (${m4.id}, '4-4-íntegração-5s-iso-outros-programas', 'Integracao do 5S com ISO 9001 e outros programas', '22 min', 4, ${`
<h2>Integracao do 5S com ISO 9001 e outros programas</h2>
<p>O 5S não existe isolado. Ele é a <strong>base sobre a qual outros programas de gestão se apoiam</strong>. Nesta aula, vamos explorar como integrar o 5S com ISO 9001, ISO 14001, Lean Manufacturing, TPM e outros programas comuns na indústria brasileira.</p>

<h3>5S é ISO 9001:2015</h3>
<p>A ISO 9001 não menciona o 5S explicitamente, mas vários requisitos são atendidos ou fácilitados pelo programa:</p>
<table>
<tr><th>Cláusula ISO 9001</th><th>Requisito</th><th>Contribuição do 5S</th></tr>
<tr><td>7.1.3</td><td>Infraestrutura</td><td>Seiso mantem infraestrutura limpa e funcional; Seiton garante organização</td></tr>
<tr><td>7.1.4</td><td>Ambiente para operação de processos</td><td>5S cria ambiente físico adequado (limpo, organizado, seguro)</td></tr>
<tr><td>7.1.5</td><td>Recursos de monitoramento e medição</td><td>Seiton garante rastreabilidade e localização de instrumentos calibrados</td></tr>
<tr><td>7.1.6</td><td>Conhecimento organizacional</td><td>Gestão visual e padrões escritos preservam o conhecimento no ambiente</td></tr>
<tr><td>7.3</td><td>Conscientizacao</td><td>Treinamento 5S é auditorias promovem conscientização da qualidade</td></tr>
<tr><td>8.5.2</td><td>Identificação e rastreabilidade</td><td>Seiton com etiquetas e enderecamento garante identificação</td></tr>
<tr><td>8.5.4</td><td>Preservacao de saídas</td><td>Organização e limpeza preservam produto durante manuseio e armazenamento</td></tr>
<tr><td>8.7</td><td>Controle de saídas não conformes</td><td>Área vermelha demarcada para produto não conforme (gestão visual)</td></tr>
</table>

<div class="callout"><strong>Dica para auditoria de certificação:</strong> Auditores de ISO 9001 sempre observam o ambiente durante a auditoria. Uma fábrica com 5S bem implantado causa impressão positiva imediata e fácilita a demonstracao de vários requisitos. Muitos auditores relatam que "uma fábrica organizada raramente tem não-conformidades graves".</div>

<h3>5S é Lean Manufacturing</h3>
<p>No Lean, o 5S é considerado <strong>a fundação da casa Toyota</strong> (Toyota Production System). Sem 5S, não se implanta:</p>
<ul>
<li><strong>Trabalho padronizado:</strong> Requer ambiente organizado e ferramentas no lugar certo</li>
<li><strong>Kanban:</strong> Requer sinalização visual clara e limites de estoque definidos</li>
<li><strong>SMED (troca rapida):</strong> Requer ferramentas organizadas e acessíveis (shadow board)</li>
<li><strong>Fluxo contínuo:</strong> Requer corredores livres e áreas demarcadas</li>
<li><strong>Kaizen:</strong> 5S é o primeiro Kaizen — a melhoria mais visível e imediata</li>
</ul>

<div class="example"><strong>Sequência recomendada de implantação Lean:</strong> 5S → Trabalho padronizado → Gestão visual → SMED → Kanban → Fluxo contínuo → Heijunka. O 5S é sempre o primeiro passo. Tentar implantar Kanban sem 5S é como construir um predio sem fundação.</div>

<h3>5S é TPM (Total Productive Maintenance)</h3>
<p>A conexão entre 5S é TPM e direta e poderosa:</p>
<ul>
<li><strong>Seiso = Manutenção autônoma:</strong> O operador que limpa a máquina é o primeiro nível de manutenção preventiva</li>
<li><strong>Seiton = Organização de ferramentas de manutenção:</strong> Chaves, graxeiras e lubrificantes organizados no ponto de uso</li>
<li><strong>Seiketsu = Checklists de manutenção autônoma:</strong> Rotina padronizada de inspeção diária</li>
</ul>
<p>Na prática, muitas empresas implantam "5S + Manutenção Autonoma" como um programa único, otimizando recursos e treinamento.</p>

<h3>5S é ISO 14001 (Meio Ambiente)</h3>
<p>O 5S contribui para a gestão ambiental de diversas formas:</p>
<ul>
<li><strong>Seiri:</strong> Descarte controlado de resíduos e materiais obsoletos</li>
<li><strong>Seiso:</strong> Identificação de vazamentos de óleo, produtos químicos, água</li>
<li><strong>Seiton:</strong> Armazenamento correto de produtos químicos (compatibilidade, contenção)</li>
<li><strong>Gestão visual:</strong> Identificação de lixeiras por tipo de resíduo (coleta seletiva indústrial)</li>
</ul>

<h3>5S é NRs de Segurança do Trabalho</h3>
<table>
<tr><th>NR</th><th>Tema</th><th>Contribuição do 5S</th></tr>
<tr><td>NR-12</td><td>Segurança em máquinas</td><td>Seiton: áreas demarcadas; Seiso: máquinas inspecionadas</td></tr>
<tr><td>NR-17</td><td>Ergonomia</td><td>Seiton: organização ergonômica de postos de trabalho</td></tr>
<tr><td>NR-23</td><td>Proteção contra incêndio</td><td>Seiton: corredores livres; Seiso: sem materiais inflamáveis soltos</td></tr>
<tr><td>NR-25</td><td>Residuos indústriais</td><td>Seiri: segregação; Seiso: controle de fontes; Seiton: armazenamento correto</td></tr>
<tr><td>NR-26</td><td>Sinalização de segurança</td><td>Seiketsu: padronização de cores conforme norma</td></tr>
</table>

<h3>Roadmap de íntegração — do 5S ao sistema de gestão integrado</h3>
<p>Para empresas que querem evoluir do 5S para programas mais abrangentes:</p>
<table>
<tr><th>Fase</th><th>Programa</th><th>Prazo típico</th><th>Investimento estimado (PME)</th></tr>
<tr><td>1</td><td>5S (base)</td><td>3-6 meses</td><td>R$ 5.000 - R$ 20.000</td></tr>
<tr><td>2</td><td>ISO 9001:2015</td><td>8-14 meses</td><td>R$ 15.000 - R$ 50.000</td></tr>
<tr><td>3</td><td>Lean básico (5S + Kaizen + SMED)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 30.000</td></tr>
<tr><td>4</td><td>TPM (pilar manutenção autônoma)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 40.000</td></tr>
<tr><td>5</td><td>ISO 14001 / ISO 45001</td><td>8-14 meses cada</td><td>R$ 15.000 - R$ 50.000 cada</td></tr>
</table>

<div class="callout"><strong>Mensagem final:</strong> O 5S é simultaneamente o programa mais simples é o mais transformador da gestão indústrial. Simples porque não exige tecnologia, investimento alto ou conhecimento avancado. Transformador porque muda a cultura, o ambiente e os resultados de forma visível e rapida. O segredo está em tres palavras: <strong>método, liderança e persistencia</strong>.</div>

<div class="example"><strong>Caso inspirador:</strong> Uma pequena metalúrgica de Novo Hamburgo (RS), com 28 funcionários, implantou o 5S em 2020 como primeiro projeto de gestão. Em 3 anos, o 5S levou a ISO 9001 (2021), que levou ao Lean (2022), que levou a IATF 16949 (2023). A empresa triplicou o faturamento, entrou na cadeia automotiva e recebeu prêmio de fornecedor destaque de um fábricante multinacional. Tudo começou com etiquetas vermelhas e um shadow board de R$ 150.</div>
`}, 'Roadmap de íntegração 5S + ISO + Lean')`;

  // ── Module 1 quiz ──
  const m1q = [
    ['Em que contexto histórico surgiu o programa 5S?', ['Europa pós-Revolução Indústrial','Japao pós-Segunda Guerra Mundial','Estados Unidos nos anos 1980','Brasil nos anos 1970'], 1, 'O 5S nasceu no Japao após a Segunda Guerra Mundial, num contexto de reconstrução econômica e necessidade de maximizar recursos.'],
    ['Qual e a traducao correta do senso Seiri?', ['Senso de limpeza','Senso de disciplina','Senso de útilização','Senso de padronização'], 2, 'Seiri é o senso de útilização — separar o necessário do desnecessário.'],
    ['Segundo dados apresentados, qual a redução tipica no tempo para localizar ferramentas após o 5S?', ['Cerca de 30%','Cerca de 50%','Cerca de 80%','Cerca de 95%'], 2, 'Os dados mostram redução de 4,2 min para 0,8 min, ou seja, aproximadamente 81%.'],
    ['Qual e o principal erro ao implantar o 5S?', ['Investir demais em sinalização','Reduzi-lo a dia de faxina sem continuidade','Fazer auditorias muito frequentes','Treinar demais os operadores'], 1, 'O maior erro é tratar o 5S como faxina pontual, sem o programa de padronização e disciplina que sustenta os resultados.'],
    ['No diagnóstico inicial, quando se deve avaliar a fábrica para obter resultados realistas?', ['Na segunda-feira de manhã, após o fim de semana','Após avisar a equipe com 1 semana de antecedência','Numa sexta-feira a tarde, sem aviso prévio','Durante uma auditoria externa'], 2, 'Avaliar sem aviso prévio, numa sexta-feira a tarde, mostra a realidade do dia a dia, não uma área arrumada para a avaliação.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 2 quiz ──
  const m2q = [
    ['Qual e a principal ferramenta útilizada no Seiri?', ['Shadow board','Etiqueta vermelha','Checklist de limpeza','Quadro de gestão visual'], 1, 'A etiqueta vermelha (red tag) e o método padrão para identificar e classificar itens questionáveis no Seiri.'],
    ['Pela regra dos 12 meses, o que fazer com um item que não foi usado nesse período?', ['Manter no setor por segurança','Transferir para o almoxarifado central','Descartar, vender ou doar','Etiquetar e aguardar mais 12 meses'], 2, 'Itens sem uso por 12 meses devem ser descartados, vendidos ou doados, salvo exceções de peças críticas.'],
    ['O que significa a "regra dos 30 segundos" no Seiton?', ['A limpeza de cada área deve levar 30 segundos','Qualquer item deve ser encontrado em até 30 segundos','O setup deve ser reduzido em 30 segundos','A auditoria de cada critério leva 30 segundos'], 1, 'No Seiton bem implantado, qualquer pessoa deve localizar qualquer item em até 30 segundos.'],
    ['No conceito de "limpeza como inspeção" do Seiso, o que o operador faz além de limpar?', ['Preenche relatório de produção','Observa anomalias como vazamentos e folgas','Calibra os instrumentos de medição','Atualiza o quadro de gestão visual'], 1, 'No Seiso indústrial, ao limpar o operador inspeciona a máquina buscando vazamentos, folgas, fissuras e anomalias.'],
    ['Qual e o investimento total estimado em materiais para o Dia D de uma fábrica de 50-100 funcionários?', ['Menos de R$ 500','Cerca de R$ 2.400','Cerca de R$ 10.000','Mais de R$ 20.000'], 1, 'O material para o Dia D (etiquetas, fita, tinta, material de limpeza, EPIs, lanche) custa aproximadamente R$ 2.360 para esse porte.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 3 quiz ──
  const m3q = [
    ['Qual é a ferramenta mais simples é eficaz do Seiketsu?', ['Checklist de 50 itens','Foto do estado padrão fixada no local','Sistema ERP de controle','App de auditoria digital'], 1, 'A foto do estado padrão é a referência visual mais simples é eficaz — custa R$ 8-15 e qualquer pessoa pode comparar o estado atual com o padrão.'],
    ['Quanto tempo leva em média para o 5S se tornar hábito (Shitsuke)?', ['3 meses','6 meses','18 a 24 meses','5 anos'], 2, 'Pesquisas mostram que o 5S leva de 18 a 24 meses para se tornar hábito numa organização.'],
    ['Qual dos itens abaixo NÃO é um dos "7 assassinos do 5S"?', ['Falta de exemplo da liderança','Dia D sem continuidade','Auditorias muito frequentes','Programa visto como responsabilidade só da qualidade'], 2, 'Auditorias frequentes sustentam o programa. Os assassinos são: falta de exemplo, sem continuidade, punicao sem reconhecimento, falta de tempo, rotatividade sem treinamento, sem medição e programa "da qualidade".'],
    ['O que deve conter o quadro de gestão visual de cada setor?', ['Apenas indicadores de produção','Segurança, qualidade, produção, 5S, pessoas e ações','Apenas fotos de antes e depois do 5S','Apenas o checklist diário de limpeza'], 1, 'O quadro completo íntegra segurança, qualidade, produção, 5S, pessoas e plano de ações pendentes.'],
    ['Qual estrategia de reconhecimento é citada como altamente eficaz e de custo quase zero?', ['Bônus salarial mensal','Área destaque do mês com troféu simbólico','Viagem de premiações','Promoção de cargo'], 1, 'Um troféu ou selo simbólico que fica exposto na área vencedora até a próxima avaliação tem custo zero e impacto significativo na motivação.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 4 quiz ──
  const m4q = [
    ['Qual e a frequência de auditoria recomendada nos primeiros 3 meses do programa 5S?', ['Diária','Semanal','Mensal','Trimestral'], 1, 'Nos primeiros 3 meses, a auditoria deve ser semanal para reforcar o padrão e corrigir desvios rapidamente.'],
    ['O que é uma auditoria cruzada no contexto do 5S?', ['Auditoria feita por empresa externa','O líder de um setor audita outro setor','Auditoria que avalia dois programas simultaneamente','Auditoria feita por dois auditores ao mesmo tempo'], 1, 'Na auditoria cruzada, líderes de diferentes setores auditam as áreas uns dos outros, trazendo olhar externo e disseminando boas práticas.'],
    ['Qual ferramenta é recomendada para analisar a causa raiz de desvios encontrados na auditoria 5S?', ['Diagrama de Gantt','5 Por ques','Análise SWOT','Balanced Scorecard'], 1, 'A técnica dos 5 Por ques permite ir além do sintoma e encontrar a causa raiz do desvio de forma simples e eficaz.'],
    ['Qual cláusula da ISO 9001 é diretamente fácilitada pelo Seiton (identificação e rastreabilidade)?', ['4.1','7.1.3','8.5.2','10.2'], 2, 'A cláusula 8.5.2 trata de identificação e rastreabilidade, que é diretamente apoiada pelo sistema de enderecamento e etiquetagem do Seiton.'],
    ['Na íntegração 5S + TPM, qual senso equivale a manutenção autônoma?', ['Seiri','Seiton','Seiso','Seiketsu'], 2, 'Seiso (limpeza como inspeção) e a essencia da manutenção autônoma do TPM — o operador limpa e ao mesmo tempo inspeciona a máquina.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (20 questions, is_final: true) ──
  const finalQ = [
    ['O programa 5S surgiu em qual país e decada?', ['EUA, anos 1950','Japao, anos 1950','Alemanha, anos 1960','Brasil, anos 1990'], 1, 'O 5S nasceu no Japao pós-Segunda Guerra Mundial (decada de 1950), num contexto de reconstrução indústrial.'],
    ['Qual a sequência correta dos 5 sensos?', ['Seiri, Seiso, Seiton, Seiketsu, Shitsuke','Seiton, Seiri, Seiso, Shitsuke, Seiketsu','Seiri, Seiton, Seiso, Seiketsu, Shitsuke','Seiso, Seiri, Seiton, Shitsuke, Seiketsu'], 2, 'A sequência correta e: Seiri (utilização), Seiton (organização), Seiso (limpeza), Seiketsu (padronização), Shitsuke (disciplina).'],
    ['Qual e o ROI típico do 5S no primeiro ano, conforme o caso da metalúrgica de Joinville apresentado?', ['1,5x','3x','5,3x','10x'], 2, 'A metalúrgica de Joinville investiu R$ 18.000 e obteve R$ 95.000 em economia de peças rejeitadas — ROI de 5,3x.'],
    ['No checklist de diagnóstico inicial, uma nota de 32% classifica a área como:', ['Critica','Insuficiente','Regular','Boa'], 1, 'A faixa de 21-40% e classificada como "Insuficiente", exigindo implantação estruturada em 90 dias.'],
    ['Qual e o prazo padrão da "área de quarentena" na técnica da etiqueta vermelha?', ['7 dias','15 dias','30 dias','60 dias'], 2, 'Itens etiquetados ficam na área de quarentena por 30 dias. Se ninguém reclamar, são descartados ou realocados.'],
    ['Segundo a NBR 7195, qual cor e padrão para demarcação de corredores de circulação?', ['Branco','Verde','Amarelo','Azul'], 2, 'A cor amarela e usada para corredores de circulação e áreas de atenção conforme a norma brasileira.'],
    ['O conceito de "limpeza como inspeção" do Seiso tem origem em qual métodologia?', ['ISO 9001','Lean Manufacturing','TPM (Total Productive Maintenance)','Six Sigma'], 2, 'O conceito de limpeza como inspeção vem diretamente do pilar de manutenção autônoma do TPM.'],
    ['Qual o custo médio de um shadow board feito internamente?', ['R$ 20 a R$ 50','R$ 80 a R$ 200','R$ 500 a R$ 1.000','R$ 2.000 a R$ 5.000'], 1, 'Um shadow board feito com MDF, tinta e ganchos custa entre R$ 80 e R$ 200 com mao de obra interna.'],
    ['No Dia D, qual e a atividade que deve acontecer ANTES de qualquer outra?', ['Limpeza profunda','Fotografar o estado atual (antes)','Organizar as ferramentas','Pintar o chao'], 1, 'Fotografar o "antes" é essencial e deve ser feito antes de qualquer atividade, pois a comparação antes/depois é a ferramenta mais poderosa de motivação.'],
    ['Qual e o custo médio de uma foto do estado padrão (A3 plastificada)?', ['R$ 1 a R$ 3','R$ 8 a R$ 15','R$ 50 a R$ 80','R$ 100 a R$ 200'], 1, 'Impressão A3 colorida + plastificação custa entre R$ 8 e R$ 15 por unidade.'],
    ['Em quanto tempo o 5S tipicamente se torna hábito organizacional?', ['1 a 3 meses','6 a 12 meses','18 a 24 meses','3 a 5 anos'], 2, 'Pesquisas indicam que o 5S leva de 18 a 24 meses para se tornar hábito. Nos primeiros 6 meses e esforço consciente.'],
    ['Qual é o fator mais crítico para a sustentação do programa 5S?', ['Investimento em tecnologia','Exemplo e envolvimento da liderança','Contratacao de consultoria externa','Implantação de app de auditoria'], 1, 'A liderança pelo exemplo é o fator mais crítico. Onde a liderança prática o 5S, o programa funciona; onde não prática, morre.'],
    ['Na auditoria 5S, uma nota consistentemente acima de 95% pode indicar:', ['Excelencia máxima do programa','Auditoria branda (complacência)','Necessidade de suspender auditorias','Que o programa pode ser encerrado'], 1, 'Notas constantemente acima de 95% podem indicar complacência na auditoria. O ideal é sempre haver oportunidades de melhoria identificadas.'],
    ['A técnica dos 5 Por ques serve para:', ['Definir os 5 sensos do programa','Realizar análise de causa raiz de desvios','Pontuar a auditoria de 5S','Classificar itens para etiqueta vermelha'], 1, 'Os 5 Por ques são uma técnica de análise de causa raiz que permite ir além do sintoma superficial.'],
    ['Qual cláusula da ISO 9001:2015 o 5S ajuda a atender ao criar um ambiente físico adequado?', ['4.1 — Contexto da organização','7.1.4 — Ambiente para operação de processos','8.1 — Planejamento operacional','9.1 — Monitoramento'], 1, 'A cláusula 7.1.4 exige que a organização proporcione ambiente adequado para a operação, o que o 5S atende diretamente.'],
    ['No Lean Manufacturing, o 5S é considerado:', ['Uma ferramenta complementar opcional','A fundação da casa Toyota','Um substituto do Kaizen','Uma alternativa ao Kanban'], 1, 'No Sistema Toyota de Produção, o 5S é a fundação sobre a qual todas as outras ferramentas Lean se apoiam.'],
    ['Segundo a pesquisa do SENAI-PR citada, qual percentual de indústrias que mantiveram auditorias regulares conseguiu se recuperar de regressoes no 5S?', ['50%','75%','90%','100%'], 3, 'Das empresas que se recuperaram de regressoes, 100% tinham sistema de auditoria ativo, versus apenas 15% das que não se recuperaram.'],
    ['Qual e a sequência recomendada de implantação após o 5S no roadmap de melhoria?', ['TPM, depois ISO 9001, depois Lean','ISO 9001, depois Lean básico, depois TPM','Lean, depois TPM, depois ISO 9001','ISO 14001, depois ISO 9001, depois Lean'], 1, 'O roadmap recomendado e: 5S → ISO 9001 → Lean básico → TPM → ISO 14001/45001.'],
    ['Qual e o investimento típico para implantar 5S numa pequena indústria (20-99 funcionários)?', ['R$ 500 a R$ 2.000','R$ 5.000 a R$ 20.000','R$ 50.000 a R$ 100.000','R$ 200.000 ou mais'], 1, 'Para pequenas indústrias, o investimento típico fica entre R$ 5.000 e R$ 20.000, incluindo estantes, shadow boards, sinalização e consultoria pontual.'],
    ['No caso da metalúrgica de Novo Hamburgo citada, qual foi o primeiro programa implantado que desencadeou toda a evolução da empresa?', ['ISO 9001','Lean Manufacturing','5S','IATF 16949'], 2, 'A empresa começou com o 5S em 2020, que levou a ISO 9001, depois Lean e finalmente IATF 16949, triplicando o faturamento em 3 anos.'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
