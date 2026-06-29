export async function seedCourse4(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      '5s-pratica-industrial',
      '5S na Pratica Industrial',
      'Implante o programa 5S na sua fabrica com metodo, ferramentas e resultados mensuraveis.',
      'Curso 100% pratico de 5S para ambiente industrial: cada senso explicado com exemplos reais, templates de implantacao, auditorias de manutencao e estrategias para sustentar o programa a longo prazo.',
      '6 horas',
      197, 347,
      'Supervisores, lideres de producao, operadores, analistas, empresarios',
      'Nenhum',
      'Capacitar o profissional a implantar e sustentar o programa 5S no ambiente industrial, com metodo pratico e resultados mensuraveis.',
      4
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos do 5S ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos do 5S', 'Origem, conceitos, beneficios e diagnostico inicial do programa 5S', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-origem-historia-5s', 'Origem e historia do 5S (do Japao ao Brasil)', '20 min', 1, ${`
<h2>Origem e historia do 5S</h2>
<p>O programa 5S e uma das metodologias mais conhecidas e aplicadas no mundo industrial. Nasceu no <strong>Japao pos-Segunda Guerra Mundial</strong>, num contexto de reconstrucao economica em que cada recurso — material, espaco e tempo — precisava ser aproveitado ao maximo. O 5S nao surgiu como teoria academica: nasceu no <strong>chao de fabrica</strong>, criado por quem precisava resolver problemas reais de desorganizacao, desperdicio e falta de padronizacao.</p>

<h3>O contexto japones</h3>
<p>Apos 1945, o Japao estava devastado. A industria precisava produzir mais com menos. Engenheiros e gestores japoneses, com forte influencia dos consultores americanos W. Edwards Deming e Joseph Juran, desenvolveram sistemas de gestao que valorizavam a <strong>ordem, a limpeza e a disciplina</strong> como base para qualquer melhoria. O 5S foi uma das primeiras ferramentas adotadas em larga escala por empresas como Toyota, Honda e Matsushita (atual Panasonic).</p>

<div class="callout"><strong>Curiosidade:</strong> No Japao, o conceito de manter o ambiente limpo e organizado tem raizes culturais profundas. Nas escolas japonesas, os proprios alunos limpam as salas de aula. O 5S industrial apenas sistematizou algo que ja era valor cultural.</div>

<h3>Os 5 sensos — origem do nome</h3>
<p>O nome "5S" vem de cinco palavras japonesas que comecam com a letra S:</p>
<table>
<tr><th>Japones</th><th>Traducao livre</th><th>Senso (adaptacao brasileira)</th></tr>
<tr><td>Seiri</td><td>Separar, classificar</td><td>Senso de utilizacao</td></tr>
<tr><td>Seiton</td><td>Ordenar, organizar</td><td>Senso de organizacao</td></tr>
<tr><td>Seiso</td><td>Limpar, inspecionar</td><td>Senso de limpeza</td></tr>
<tr><td>Seiketsu</td><td>Padronizar, saude</td><td>Senso de padronizacao</td></tr>
<tr><td>Shitsuke</td><td>Disciplina, educacao</td><td>Senso de disciplina</td></tr>
</table>

<h3>A chegada ao Brasil</h3>
<p>O 5S chegou ao Brasil no inicio dos anos 1990, trazido principalmente por empresas japonesas instaladas no pais (como Toyota em Indaiatuba-SP e Honda em Sumare-SP) e por programas de qualidade total incentivados pela abertura economica do governo Collor. Naquela epoca, a industria brasileira precisava se modernizar rapidamente para competir com produtos importados.</p>

<div class="example"><strong>Marco historico:</strong> A Fundacao Christiano Ottoni (UFMG) foi uma das pioneiras na disseminacao do 5S no Brasil, publicando materiais em portugues e realizando treinamentos em industrias de Minas Gerais, Sao Paulo e Parana a partir de 1991. Muitas metalurgicas da regiao do ABC Paulista e do polo industrial de Betim (MG) adotaram o 5S como primeiro passo para a certificacao ISO 9001.</div>

<h3>Evolucao do 5S na industria brasileira</h3>
<p>A trajetoria do 5S no Brasil pode ser dividida em fases:</p>
<ul>
<li><strong>Anos 1990:</strong> Introducao — focado em "limpeza e organizacao". Muitas empresas fizeram o "Dia da Limpeza" e pararam por ai.</li>
<li><strong>Anos 2000:</strong> Integracao com sistemas de gestao (ISO 9001, ISO 14001). O 5S passou a ser visto como base para programas mais robustos.</li>
<li><strong>Anos 2010:</strong> Conexao com Lean Manufacturing. O 5S se tornou pre-requisito para TPM, Kaizen e producao enxuta.</li>
<li><strong>Anos 2020 em diante:</strong> 5S digital — uso de apps para auditorias, fotos de antes/depois com geolocalizacao, dashboards de indicadores em tempo real.</li>
</ul>

<h3>Por que o 5S continua relevante</h3>
<p>Mesmo apos mais de 70 anos, o 5S continua sendo a <strong>porta de entrada</strong> para qualquer programa de melhoria. A razao e simples: nao adianta implantar Lean, Six Sigma ou Industria 4.0 num ambiente sujo, desorganizado e sem padrao. O 5S cria a <strong>fundacao cultural e fisica</strong> sobre a qual outros programas podem prosperar.</p>

<div class="callout"><strong>Dado real:</strong> Segundo pesquisa do SEBRAE (2022), 78% das pequenas e medias industrias que implantaram o 5S de forma estruturada relataram reducao de pelo menos 15% no tempo de setup de maquinas nos primeiros 6 meses. O investimento medio foi de R$ 2.500 a R$ 8.000 (principalmente em sinalizacao, estantes e treinamento).</div>

<h3>5S nao e faxina</h3>
<p>O maior erro na implantacao do 5S e reduzi-lo a "dia de limpeza". O 5S e um <strong>programa de mudanca de comportamento</strong>. A limpeza e a organizacao sao consequencias — o verdadeiro objetivo e criar uma cultura de <strong>cuidado com o ambiente, respeito ao padrao e melhoria continua</strong>. Quando tratado apenas como faxina, o programa morre em 3 meses.</p>
`}, NULL),

  (${m1.id}, '1-2-cinco-sensos-explicados', 'Os 5 sensos explicados: Seiri, Seiton, Seiso, Seiketsu, Shitsuke', '25 min', 2, ${`
<h2>Os 5 sensos explicados</h2>
<p>Cada um dos 5 sensos tem um proposito especifico e uma logica de sequencia. Nao se implanta o 5S de forma aleatoria — os tres primeiros sensos (Seiri, Seiton, Seiso) sao de <strong>acao fisica</strong>, enquanto os dois ultimos (Seiketsu, Shitsuke) sao de <strong>manutencao e cultura</strong>. Entender cada senso em profundidade e fundamental antes de ir para a pratica.</p>

<h3>1. Seiri — Senso de utilizacao</h3>
<p>O primeiro senso e sobre <strong>separar o necessario do desnecessario</strong>. No ambiente industrial, isso significa passar por cada area de trabalho e questionar: "Este item e necessario aqui? Com que frequencia e usado?"</p>
<ul>
<li><strong>O que manter:</strong> Ferramentas, materiais e documentos usados com frequencia (diaria ou semanal)</li>
<li><strong>O que realocar:</strong> Itens usados raramente (mensal ou menos) — guardar em almoxarifado central</li>
<li><strong>O que descartar:</strong> Itens quebrados, obsoletos, em duplicata ou sem funcao definida</li>
</ul>

<div class="example"><strong>Exemplo real:</strong> Numa metalurgica de Caxias do Sul (RS), ao aplicar o Seiri no setor de ferramentaria, foram encontradas 340 ferramentas. Apos a classificacao, 95 foram descartadas (quebradas ou obsoletas), 80 foram realocadas para o almoxarifado central, e 165 permaneceram no setor. O tempo medio para localizar uma ferramenta caiu de 4,5 minutos para 45 segundos.</div>

<p>A principal ferramenta do Seiri e a <strong>etiqueta vermelha</strong> (red tag): um cartao que se fixa no item questionavel, registrando data, responsavel e destino proposto. Itens etiquetados ficam numa "area de quarentena" por 30 dias — se ninguem reclamar, sao descartados ou realocados.</p>

<h3>2. Seiton — Senso de organizacao</h3>
<p>Apos separar o que e necessario, o proximo passo e <strong>organizar de forma que qualquer pessoa encontre, use e devolva rapidamente</strong>. O lema do Seiton e: "Um lugar para cada coisa, cada coisa em seu lugar."</p>
<ul>
<li><strong>Identificacao visual:</strong> Etiquetas, cores, sinalizacao de chao e de prateleiras</li>
<li><strong>Criterio de frequencia:</strong> Itens mais usados ficam mais acessiveis (altura dos olhos, bancada mais proxima)</li>
<li><strong>Shadow boards:</strong> Paineis com o contorno de cada ferramenta desenhado — qualquer pessoa sabe o que falta</li>
<li><strong>Enderecamento:</strong> Cada estante, prateleira e posicao tem um codigo (ex: E3-P2-C5 = estante 3, prateleira 2, coluna 5)</li>
</ul>

<div class="callout"><strong>Regra dos 30 segundos:</strong> No Seiton bem implantado, qualquer pessoa deve conseguir encontrar qualquer item em ate 30 segundos. Se demora mais, a organizacao precisa ser melhorada.</div>

<h3>3. Seiso — Senso de limpeza</h3>
<p>Seiso vai muito alem de varrer o chao. No contexto industrial, <strong>limpeza e inspecao</strong>. Ao limpar uma maquina, o operador observa vazamentos, folgas, fissuras e anomalias que poderiam passar despercebidas. O Seiso conecta o 5S com a <strong>manutencao autonoma</strong> do TPM (Total Productive Maintenance).</p>
<ul>
<li><strong>Limpar e eliminar fontes de sujeira:</strong> Nao basta limpar — e preciso identificar e eliminar a causa da sujeira (vazamento de oleo, rebarbas, poeira de processo)</li>
<li><strong>Definir responsaveis:</strong> Cada area tem um "dono" responsavel pela limpeza</li>
<li><strong>Checklist de limpeza:</strong> O que limpar, com que frequencia, com que material, em quanto tempo</li>
</ul>

<div class="example"><strong>Exemplo real:</strong> Uma industria alimenticia de Chapeco (SC) implantou o Seiso com foco em "limpeza como inspecao" nas linhas de embalagem. Em 60 dias, os operadores identificaram 23 pequenos vazamentos de ar comprimido que nao estavam nos relatorios de manutencao. O conserto custou R$ 1.200 e gerou economia de R$ 14.000/ano em energia.</div>

<h3>4. Seiketsu — Senso de padronizacao</h3>
<p>O quarto senso trata de <strong>criar padroes para manter os tres primeiros sensos</strong>. Sem padronizacao, o Seiri, Seiton e Seiso funcionam por algumas semanas e depois tudo volta ao estado anterior.</p>
<ul>
<li><strong>Procedimentos visuais:</strong> Fotos do "estado padrao" de cada area fixadas no local</li>
<li><strong>Checklists diarios:</strong> 5 minutos no inicio do turno para verificar se tudo esta no padrao</li>
<li><strong>Cores e sinalizacao:</strong> Padronizacao de cores para areas, corredores, equipamentos</li>
<li><strong>Quadro de gestao visual:</strong> Fotos de antes/depois, indicadores, responsaveis</li>
</ul>

<h3>5. Shitsuke — Senso de disciplina</h3>
<p>O quinto senso e o mais dificil e o mais importante. Trata de <strong>manter o programa vivo atraves do habito e da cultura</strong>. Nao se trata de cobranca punitiva, mas de criar um ambiente onde o padrao e seguido naturalmente.</p>
<ul>
<li><strong>Exemplo da lideranca:</strong> Se o supervisor nao segue o 5S, ninguem segue</li>
<li><strong>Auditorias periodicas:</strong> Com pontuacao, feedback e reconhecimento</li>
<li><strong>Treinamento continuo:</strong> Novos funcionarios devem ser treinados no 5S desde o primeiro dia</li>
<li><strong>Reconhecimento:</strong> Premiar areas que se destacam, nao punir as que falham</li>
</ul>

<div class="callout"><strong>A verdade sobre o Shitsuke:</strong> Pesquisas mostram que o 5S leva em media 18 a 24 meses para se tornar habito numa organizacao. Nos primeiros 6 meses, e puro esforco consciente. Se a lideranca afrouxar nesse periodo, o programa desmorona.</div>
`}, 'Resumo visual dos 5 sensos (poster para impressao)'),

  (${m1.id}, '1-3-beneficios-5s-numeros-reais', 'Beneficios do 5S com numeros reais', '20 min', 3, ${`
<h2>Beneficios do 5S com numeros reais</h2>
<p>Um dos maiores desafios ao implantar o 5S e convencer a lideranca e os operadores de que o programa vale o investimento de tempo e dinheiro. Nesta aula, vamos apresentar <strong>dados concretos e casos reais</strong> de industrias brasileiras que mediram os resultados do 5S.</p>

<h3>Beneficios tangiveis (mensuraveis)</h3>
<table>
<tr><th>Indicador</th><th>Antes do 5S</th><th>Depois do 5S (6 meses)</th><th>Melhoria</th></tr>
<tr><td>Tempo de setup medio</td><td>45 min</td><td>28 min</td><td>-38%</td></tr>
<tr><td>Tempo para localizar ferramenta</td><td>4,2 min</td><td>0,8 min</td><td>-81%</td></tr>
<tr><td>Acidentes com afastamento (por ano)</td><td>12</td><td>4</td><td>-67%</td></tr>
<tr><td>Retrabalho por falta de padrao</td><td>8,5%</td><td>3,2%</td><td>-62%</td></tr>
<tr><td>Area util recuperada</td><td>—</td><td>+22%</td><td>—</td></tr>
<tr><td>Consumo de materiais de limpeza</td><td>R$ 4.800/mes</td><td>R$ 2.100/mes</td><td>-56%</td></tr>
</table>

<div class="callout"><strong>Fonte:</strong> Dados compilados de casos publicados pelo SEBRAE-RS, SENAI-SC e relatorios internos de metalurgicas do ABC Paulista (2019-2023). Os numeros representam medias — resultados individuais variam conforme o porte e o comprometimento da empresa.</div>

<h3>Caso 1 — Metalurgica em Joinville (SC)</h3>
<p>Empresa de 120 funcionarios, fabricante de pecas estampadas para o setor automotivo. Implantou o 5S em 2021 como pre-requisito para a certificacao IATF 16949.</p>
<ul>
<li><strong>Investimento:</strong> R$ 18.000 (sinalizacao, estantes, treinamento, shadow boards)</li>
<li><strong>Resultado em 12 meses:</strong> Reducao de 42% nas paradas nao planejadas, economia de R$ 95.000 em pecas rejeitadas, area de producao ampliada em 35 m2 sem obra</li>
<li><strong>ROI:</strong> R$ 95.000 / R$ 18.000 = 5,3x no primeiro ano</li>
</ul>

<h3>Caso 2 — Cooperativa agricola em Cascavel (PR)</h3>
<p>Cooperativa com 80 funcionarios na unidade de beneficiamento de graos. Implantou o 5S no armazem e na area de classificacao.</p>
<ul>
<li><strong>Investimento:</strong> R$ 7.500</li>
<li><strong>Resultado em 6 meses:</strong> Tempo de carga de caminhoes reduzido de 2h para 1h15min. Perda de graos por armazenamento inadequado caiu de 3,1% para 0,8%.</li>
<li><strong>Economia anual estimada:</strong> R$ 62.000 so em reducao de perdas de graos</li>
</ul>

<h3>Caso 3 — Construtora em Goiania (GO)</h3>
<p>Canteiro de obra com 200 trabalhadores. Aplicou 5S como parte do programa PBQP-H.</p>
<ul>
<li><strong>Investimento:</strong> R$ 12.000 (containers organizadores, sinalizacao, treinamento)</li>
<li><strong>Resultado em 4 meses:</strong> Acidentes leves reduziram 55%. Desperdicio de material (argamassa, cimento, fios) caiu 28%. Auditoria PBQP-H pontuou 92% na organizacao do canteiro (antes era 61%).</li>
</ul>

<h3>Beneficios intangiveis</h3>
<p>Alem dos numeros, o 5S gera beneficios que sao dificeis de medir mas extremamente valiosos:</p>
<ul>
<li><strong>Moral da equipe:</strong> Trabalhar num ambiente limpo e organizado aumenta a satisfacao e o orgulho do trabalho</li>
<li><strong>Impressao de clientes e visitantes:</strong> Uma fabrica organizada transmite confianca e profissionalismo</li>
<li><strong>Facilitacao de auditorias:</strong> Auditores de ISO 9001, IATF 16949, ISO 14001 sempre comecam pela observacao visual — 5S bem feito causa boa impressao imediata</li>
<li><strong>Base para outros programas:</strong> Lean, TPM, Kaizen e Six Sigma funcionam melhor com 5S implantado</li>
<li><strong>Reducao de estresse:</strong> Operadores perdem menos tempo procurando coisas e se frustrando com a desorganizacao</li>
</ul>

<div class="example"><strong>Depoimento real:</strong> "Antes do 5S, eu perdia uns 40 minutos por turno procurando ferramenta e material. Hoje perco zero. Isso me da mais calma pra trabalhar e mais tempo pra produzir." — Operador de CNC, metalurgica de Erechim (RS), 2022.</div>

<h3>Quanto custa implantar o 5S?</h3>
<table>
<tr><th>Porte da empresa</th><th>Investimento tipico</th><th>Inclui</th></tr>
<tr><td>Micro (ate 20 func.)</td><td>R$ 2.000 a R$ 5.000</td><td>Sinalizacao basica, treinamento interno</td></tr>
<tr><td>Pequena (20-99 func.)</td><td>R$ 5.000 a R$ 20.000</td><td>Estantes, shadow boards, sinalizacao completa, consultoria pontual</td></tr>
<tr><td>Media (100-499 func.)</td><td>R$ 20.000 a R$ 80.000</td><td>Projeto completo com consultoria, mobiliario industrial, sistema de auditoria</td></tr>
<tr><td>Grande (500+ func.)</td><td>R$ 80.000 a R$ 300.000</td><td>Programa corporativo com multiplicadores, app de auditoria, premiacao</td></tr>
</table>

<div class="callout"><strong>Conclusao:</strong> O 5S tem um dos melhores ROIs entre todas as ferramentas de gestao industrial. Com investimento baixo (comparado a automacao ou novos equipamentos), gera resultados rapidos e visiveis. O unico recurso realmente caro e o <strong>tempo da lideranca</strong> — e esse e inegociavel.</div>
`}, 'Planilha de ROI do 5S (modelo editavel)'),

  (${m1.id}, '1-4-diagnostico-inicial', 'Diagnostico inicial: como avaliar o estado atual', '20 min', 4, ${`
<h2>Diagnostico inicial: como avaliar o estado atual</h2>
<p>Antes de implantar o 5S, e essencial saber <strong>de onde voce esta partindo</strong>. O diagnostico inicial serve para: (1) medir a situacao atual com criterios objetivos, (2) identificar as areas prioritarias, (3) gerar evidencias de "antes" para comparar com o "depois", e (4) sensibilizar a equipe sobre a necessidade de mudanca.</p>

<h3>Metodo de avaliacao — Checklist de 50 pontos</h3>
<p>O metodo mais pratico para o diagnostico e um checklist com 10 criterios por senso, pontuados de 0 a 5:</p>

<div class="template-box">
<h3>Template: Checklist de Diagnostico Inicial 5S</h3>
<p><strong>Area avaliada:</strong> _____________ | <strong>Data:</strong> ___/___/___ | <strong>Avaliador:</strong> _____________</p>
<p><strong>Escala:</strong> 0 = Inexistente | 1 = Pessimo | 2 = Ruim | 3 = Regular | 4 = Bom | 5 = Excelente</p>
<table>
<tr><th>Senso</th><th>Criterio</th><th>Nota (0-5)</th></tr>
<tr><td rowspan="3">Seiri (Utilizacao)</td><td>Ausencia de itens desnecessarios na area</td><td>___</td></tr>
<tr><td>Materiais e ferramentas compativeis com a atividade</td><td>___</td></tr>
<tr><td>Sem acumulo de itens obsoletos ou quebrados</td><td>___</td></tr>
<tr><td rowspan="3">Seiton (Organizacao)</td><td>Identificacao clara de locais de guarda</td><td>___</td></tr>
<tr><td>Itens guardados no lugar definido</td><td>___</td></tr>
<tr><td>Facilidade de acesso (item encontrado em ate 30s)</td><td>___</td></tr>
<tr><td rowspan="2">Seiso (Limpeza)</td><td>Area limpa e sem residuos no chao</td><td>___</td></tr>
<tr><td>Equipamentos limpos e sem vazamentos visiveis</td><td>___</td></tr>
<tr><td>Seiketsu (Padronizacao)</td><td>Existem padroes visuais definidos e visiveis</td><td>___</td></tr>
<tr><td>Shitsuke (Disciplina)</td><td>A equipe demonstra habito de seguir os padroes</td><td>___</td></tr>
</table>
<p><strong>Total:</strong> ___/50 | <strong>Percentual:</strong> ___%</p>
</div>

<h3>Classificacao do resultado</h3>
<table>
<tr><th>Faixa</th><th>Classificacao</th><th>Acao recomendada</th></tr>
<tr><td>0-20%</td><td>Critico</td><td>Implantacao urgente. Comece pelo Seiri com Dia D.</td></tr>
<tr><td>21-40%</td><td>Insuficiente</td><td>Implantacao estruturada em 90 dias, priorizando areas piores.</td></tr>
<tr><td>41-60%</td><td>Regular</td><td>Reforco nos 3 primeiros S. Foco em padronizacao (4o S).</td></tr>
<tr><td>61-80%</td><td>Bom</td><td>Refinar padroes e focar em disciplina (5o S). Auditorias mensais.</td></tr>
<tr><td>81-100%</td><td>Excelente</td><td>Manter com auditorias. Buscar integracao com TPM/Lean.</td></tr>
</table>

<h3>Passo a passo do diagnostico</h3>
<ol>
<li><strong>Defina as areas:</strong> Liste todas as areas da fabrica (producao, almoxarifado, escritorio, refeitorio, vestiario, area externa). Cada area sera avaliada separadamente.</li>
<li><strong>Escolha os avaliadores:</strong> Minimo 2 pessoas por area. Idealmente, inclua alguem de fora da area (olhar externo e mais critico).</li>
<li><strong>Fotografe tudo:</strong> Tire fotos sistematicas de cada area — essas fotos serao o "antes" para comparacao futura. Recomendacao: use sempre o mesmo angulo para o "depois".</li>
<li><strong>Aplique o checklist:</strong> Cada avaliador pontua independentemente. Use a media.</li>
<li><strong>Consolide os resultados:</strong> Monte um quadro com a nota de cada area e cada senso. Isso mostra onde atacar primeiro.</li>
<li><strong>Apresente para a direcao:</strong> Use as fotos e os numeros para justificar o investimento no programa.</li>
</ol>

<div class="example"><strong>Exemplo pratico:</strong> Uma industria alimenticia de Lajeado (RS) fez o diagnostico em 8 areas. Resultado medio: 32% (insuficiente). A area mais critica foi o almoxarifado de embalagens (18%), e a menos critica foi o escritorio administrativo (55%). A direcao aprovou o programa ao ver as fotos do almoxarifado — itens empilhados sem identificacao, embalagens vencidas misturadas com novas, corredores bloqueados.</div>

<h3>Erros comuns no diagnostico</h3>
<ul>
<li><strong>Avaliar com condescendencia:</strong> Dar nota 3 quando e 1 para "nao ofender" a equipe. O diagnostico precisa ser honesto.</li>
<li><strong>Nao fotografar:</strong> Sem fotos, nao ha evidencia. E a comparacao antes/depois e a ferramenta mais poderosa de motivacao.</li>
<li><strong>Avaliar so a producao:</strong> Escritorios, refeitorio, vestiario e area externa tambem precisam de 5S.</li>
<li><strong>Pular o diagnostico:</strong> Ir direto para o "Dia D" sem medir o ponto de partida impede que voce comprove a melhoria depois.</li>
</ul>

<div class="callout"><strong>Dica de ouro:</strong> Faca o diagnostico numa sexta-feira a tarde, quando a fabrica esta no "modo automatico" e ninguem se preparou para ser avaliado. Isso mostra a realidade. Se avisar com antecedencia, todo mundo vai arrumar na vespera — e voce nao medira o dia a dia real.</div>
`}, 'Checklist de diagnostico 5S (modelo completo)')`;

  // ── Module 2: Implantacao dos 3 Primeiros S ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Implantacao dos 3 Primeiros S', 'Seiri, Seiton e Seiso na pratica industrial com ferramentas e templates', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-1-seiri-etiqueta-vermelha', 'Seiri na pratica: etiqueta vermelha e criterios de descarte', '25 min', 1, ${`
<h2>Seiri na pratica: etiqueta vermelha e criterios de descarte</h2>
<p>O Seiri (senso de utilizacao) e o primeiro passo concreto da implantacao. Seu objetivo e simples e poderoso: <strong>eliminar tudo que nao e necessario na area de trabalho</strong>. Parece facil, mas na pratica e o senso que gera mais resistencia — porque mexe com o habito de "guardar porque um dia pode servir".</p>

<h3>A tecnica da etiqueta vermelha (Red Tag)</h3>
<p>A etiqueta vermelha e o metodo mais eficaz para o Seiri. Funciona assim:</p>
<ol>
<li><strong>Percorra a area</strong> com a equipe e identifique todos os itens questionaveis</li>
<li><strong>Fixe uma etiqueta vermelha</strong> em cada item cuja necessidade nao e unanime</li>
<li><strong>Registre na etiqueta:</strong> data, nome do item, responsavel, motivo da etiqueta e destino sugerido</li>
<li><strong>Mova para a "area de quarentena"</strong> (um local definido para itens etiquetados)</li>
<li><strong>Aguarde 30 dias:</strong> Se ninguem reclamar ou justificar a permanencia, o item e descartado, vendido ou doado</li>
</ol>

<div class="template-box">
<h3>Template: Etiqueta Vermelha 5S</h3>
<table>
<tr><td><strong>ETIQUETA VERMELHA — 5S</strong></td></tr>
<tr><td><strong>N:</strong> _______ | <strong>Data:</strong> ___/___/___</td></tr>
<tr><td><strong>Item:</strong> _________________________________</td></tr>
<tr><td><strong>Quantidade:</strong> _______ | <strong>Codigo (se houver):</strong> _______</td></tr>
<tr><td><strong>Localizacao atual:</strong> _________________________________</td></tr>
<tr><td><strong>Motivo da etiqueta:</strong><br>[ ] Desnecessario na area<br>[ ] Quebrado / danificado<br>[ ] Obsoleto<br>[ ] Excesso / duplicata<br>[ ] Sem identificacao<br>[ ] Outro: ____________</td></tr>
<tr><td><strong>Destino sugerido:</strong><br>[ ] Descartar<br>[ ] Transferir para: ____________<br>[ ] Vender<br>[ ] Doar<br>[ ] Devolver ao fornecedor</td></tr>
<tr><td><strong>Responsavel:</strong> _________________ | <strong>Prazo:</strong> ___/___/___</td></tr>
<tr><td><strong>Decisao final:</strong> _________________ | <strong>Data:</strong> ___/___/___</td></tr>
</table>
</div>

<h3>Criterios de descarte — a regra dos 12 meses</h3>
<p>Uma regra simples e eficaz para decidir o que fica e o que sai:</p>
<table>
<tr><th>Frequencia de uso</th><th>Acao</th><th>Local</th></tr>
<tr><td>Toda hora</td><td>Manter na bancada/maquina</td><td>Posto de trabalho</td></tr>
<tr><td>Todo dia</td><td>Manter proximo</td><td>Armario do setor</td></tr>
<tr><td>Toda semana</td><td>Manter na area</td><td>Estante do setor</td></tr>
<tr><td>Todo mes</td><td>Manter acessivel</td><td>Almoxarifado central</td></tr>
<tr><td>1-2 vezes por ano</td><td>Guardar identificado</td><td>Deposito/arquivo morto</td></tr>
<tr><td>Nao usou em 12 meses</td><td>Descartar, vender ou doar</td><td>Fora da empresa</td></tr>
</table>

<div class="callout"><strong>Excecao importante:</strong> Ferramentas especiais, calibradores e pecas de reposicao criticas podem ter uso raro mas sao essenciais. Use o criterio: "Se precisarmos e nao tivermos, qual o impacto?" Se o impacto for alto (parada de linha, seguranca), mantenha mesmo com uso raro — mas identifique e armazene adequadamente.</div>

<h3>Lidando com a resistencia</h3>
<p>A frase mais ouvida no Seiri e: "Nao joga fora, pode servir um dia." Estrategias para lidar:</p>
<ul>
<li><strong>Dados:</strong> Mostre quanto espaco esta sendo ocupado por itens sem uso. "Esse armario de 4 m2 guarda coisas que ninguem usou em 2 anos. Esse espaco custa R$ X/mes."</li>
<li><strong>Area de quarentena com prazo:</strong> Ninguem precisa decidir na hora. O prazo de 30 dias da seguranca.</li>
<li><strong>Envolvimento:</strong> A equipe da area decide — nao e imposicao de fora.</li>
<li><strong>Comecar pelo exemplo:</strong> A lideranca deve limpar sua sala primeiro.</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma fabrica de moveis de Bento Goncalves (RS) liberou 85 m2 de area util so com o Seiri. Os itens removidos incluiam: 2 maquinas desativadas ha 4 anos, 120 kg de retalhos de MDF sem classificacao, 3 estantes cheias de catalogos de fornecedores que nao existiam mais, e 45 baldes de cola vencida. O espaco liberado foi transformado em area de embalagem, eliminando um gargalo de producao.</div>

<h3>Registro e controle</h3>
<p>Mantenha um controle de todas as etiquetas vermelhas emitidas:</p>
<ul>
<li><strong>Planilha de controle:</strong> Numero da etiqueta, item, area, data de emissao, destino sugerido, decisao final, data da acao</li>
<li><strong>Fotos:</strong> Fotografe cada item etiquetado (comprovacao)</li>
<li><strong>Indicador:</strong> Total de itens etiquetados, total descartado, total realocado, espaco recuperado (em m2), valor estimado do descarte</li>
</ul>
`}, 'Template de etiqueta vermelha 5S'),

  (${m2.id}, '2-2-seiton-organizacao-visual', 'Seiton na pratica: organizacao visual e shadow boards', '25 min', 2, ${`
<h2>Seiton na pratica: organizacao visual e shadow boards</h2>
<p>Apos o Seiri ter eliminado o desnecessario, o Seiton organiza o que ficou de forma que <strong>qualquer pessoa encontre, use e devolva em segundos</strong>. O Seiton e o senso que mais transforma visualmente o ambiente — e o que mais impressiona visitantes e auditores.</p>

<h3>Principios do Seiton industrial</h3>
<ol>
<li><strong>Um lugar para cada coisa, cada coisa em seu lugar</strong> — o principio fundamental</li>
<li><strong>Frequencia de uso define a posicao</strong> — quanto mais usado, mais acessivel</li>
<li><strong>Identificacao visual</strong> — ninguem deveria precisar perguntar onde algo fica</li>
<li><strong>Limite maximo</strong> — definir quantidade maxima para cada item (evita acumulo)</li>
<li><strong>Primeiro a entrar, primeiro a sair (FIFO)</strong> — especialmente para insumos com validade</li>
</ol>

<h3>Shadow boards (quadros de sombra)</h3>
<p>O shadow board e um painel onde o contorno de cada ferramenta e desenhado ou pintado. Quando a ferramenta esta no lugar, o contorno esta coberto. Quando falta, o contorno vazio mostra imediatamente <strong>o que falta e onde deveria estar</strong>.</p>

<div class="callout"><strong>Como fazer um shadow board:</strong> (1) Selecione as ferramentas do posto. (2) Fixe um painel de MDF pintado de branco ou cinza claro. (3) Posicione cada ferramenta e trace o contorno com caneta permanente preta. (4) Instale ganchos ou suportes. (5) Identifique cada posicao com etiqueta. Custo medio: R$ 80 a R$ 200 por painel (material + mao de obra interna).</div>

<h3>Sinalizacao de chao</h3>
<p>A demarcacao de chao e fundamental na industria. Define visualmente:</p>
<table>
<tr><th>Cor</th><th>Uso padrao (NBR 7195 / OSHA adaptado)</th></tr>
<tr><td><strong>Amarelo</strong></td><td>Corredores de circulacao, areas de atencao</td></tr>
<tr><td><strong>Branco</strong></td><td>Posicao de equipamentos, bancadas, estacoes de trabalho</td></tr>
<tr><td><strong>Verde</strong></td><td>Areas de produto aprovado, material em processo</td></tr>
<tr><td><strong>Vermelho</strong></td><td>Areas de produto nao conforme, rejeito, extintores</td></tr>
<tr><td><strong>Azul</strong></td><td>Material em analise, area de inspecao</td></tr>
<tr><td><strong>Preto e branco (zebrado)</strong></td><td>Areas que devem permanecer livres (nao obstruir)</td></tr>
</table>

<div class="example"><strong>Exemplo real:</strong> Uma metalurgica de Contagem (MG) investiu R$ 6.200 em pintura de chao e sinalizacao. Resultado: eliminacao de 100% das reclamacoes de "material no corredor" em auditorias. O tempo de movimentacao interna de materiais caiu 22% porque os corredores ficaram sempre livres.</div>

<h3>Organizacao de estantes e almoxarifado</h3>
<p>Regras praticas para organizar prateleiras e estantes:</p>
<ul>
<li><strong>Enderecamento:</strong> Cada posicao tem um codigo unico (ex: E2-P3-C1 = Estante 2, Prateleira 3, Coluna 1)</li>
<li><strong>Etiquetas frontais:</strong> Nome do item, codigo, quantidade minima e maxima, foto</li>
<li><strong>Nivel dos olhos:</strong> Itens mais usados na altura dos olhos (1,20 m a 1,60 m)</li>
<li><strong>Peso embaixo:</strong> Itens pesados nas prateleiras de baixo (seguranca)</li>
<li><strong>FIFO fisico:</strong> Abastecer por tras, retirar pela frente (para insumos com validade)</li>
</ul>

<h3>Kanban visual para materiais</h3>
<p>O Seiton pode incluir um sistema simples de kanban visual para controle de estoque:</p>
<ul>
<li><strong>Cartao verde:</strong> Estoque acima do nivel de reposicao — OK</li>
<li><strong>Cartao amarelo:</strong> Estoque no ponto de reposicao — fazer pedido</li>
<li><strong>Cartao vermelho:</strong> Estoque abaixo do minimo — pedido urgente</li>
</ul>

<h3>Organizacao de documentos e informacao</h3>
<p>O Seiton tambem se aplica a documentos, instrucoes de trabalho e informacoes:</p>
<ul>
<li><strong>Instrucoes de trabalho:</strong> Fixadas no ponto de uso, com fotos e letras grandes</li>
<li><strong>Pasta de turno:</strong> Organizada com separadores por assunto (producao, qualidade, manutencao, seguranca)</li>
<li><strong>Gestao visual de informacoes:</strong> Quadros de indicadores na entrada de cada setor, atualizados diariamente</li>
</ul>

<div class="callout"><strong>Teste do Seiton:</strong> Pegue um visitante que nunca entrou na fabrica e peca para ele localizar um item. Se conseguir em menos de 30 segundos seguindo a sinalizacao, o Seiton esta bom. Se precisar perguntar a alguem, precisa melhorar.</div>
`}, 'Guia de sinalizacao de chao industrial'),

  (${m2.id}, '2-3-seiso-limpeza-inspecao', 'Seiso na pratica: limpeza como inspecao', '22 min', 3, ${`
<h2>Seiso na pratica: limpeza como inspecao</h2>
<p>O Seiso e frequentemente o senso mais subestimado. Muitas empresas o tratam como "dia de faxina", mas no contexto industrial o Seiso tem um papel estrategico: <strong>a limpeza e a primeira forma de inspecao</strong>. Ao limpar uma maquina, o operador passa a mao em cada superficie, olha cada canto — e encontra anomalias que nenhum sensor detectaria.</p>

<h3>Seiso industrial vs. faxina comum</h3>
<table>
<tr><th>Aspecto</th><th>Faxina comum</th><th>Seiso industrial</th></tr>
<tr><td>Objetivo</td><td>Estetica</td><td>Inspecao e prevencao</td></tr>
<tr><td>Quem faz</td><td>Equipe de limpeza</td><td>O proprio operador da area/maquina</td></tr>
<tr><td>Frequencia</td><td>Quando esta sujo</td><td>Rotina diaria programada</td></tr>
<tr><td>Atitude</td><td>Limpar a sujeira</td><td>Eliminar a fonte da sujeira</td></tr>
<tr><td>Resultado</td><td>Area limpa temporariamente</td><td>Maquina inspecionada + anomalias identificadas</td></tr>
</table>

<h3>O conceito de "limpeza como inspecao"</h3>
<p>Este conceito vem do TPM (Total Productive Maintenance) e se integra perfeitamente ao 5S. A ideia e:</p>
<ol>
<li><strong>Limpar:</strong> Remover sujeira, poeira, oleo, residuos</li>
<li><strong>Inspecionar:</strong> Enquanto limpa, observar: vazamentos, folgas, rachaduras, fios soltos, ruidos anormais, vibracao</li>
<li><strong>Registrar:</strong> Anotar anomalias encontradas numa ficha ou app</li>
<li><strong>Corrigir ou escalar:</strong> Se o operador pode resolver, resolve. Se nao, abre ordem de servico para manutencao</li>
<li><strong>Eliminar a fonte:</strong> Investigar por que a sujeira aparece e tratar a causa raiz</li>
</ol>

<div class="example"><strong>Caso real:</strong> Numa industria de alimentos de Ponta Grossa (PR), a implantacao do Seiso como inspecao nas linhas de envase gerou 67 relatorios de anomalias no primeiro mes. Dentre eles: 12 vazamentos de ar comprimido, 8 mangueiras com microfissuras, 3 rolamentos com ruido anormal e 1 fio eletrico desencapado. Custo total de reparo: R$ 3.800. Custo estimado se os problemas evoluissem para quebra: mais de R$ 45.000 (incluindo parada de linha e perda de produto).</div>

<h3>Rotina de Seiso — o check de 5 minutos</h3>
<p>A rotina de limpeza/inspecao nao precisa ser longa. Um check de 5 minutos no inicio de cada turno e suficiente:</p>

<div class="template-box">
<h3>Template: Check de Limpeza/Inspecao Diaria (5 min)</h3>
<table>
<tr><th>Item</th><th>Verificar</th><th>OK/NOK</th></tr>
<tr><td>Piso da area</td><td>Limpo, sem oleo/residuos no chao</td><td>[ ]</td></tr>
<tr><td>Bancada de trabalho</td><td>Organizada, sem itens desnecessarios</td><td>[ ]</td></tr>
<tr><td>Maquina — visual</td><td>Sem vazamentos, parafusos soltos, fios expostos</td><td>[ ]</td></tr>
<tr><td>Maquina — auditivo</td><td>Sem ruidos anormais ao ligar</td><td>[ ]</td></tr>
<tr><td>Ferramentas</td><td>Todas no shadow board, em bom estado</td><td>[ ]</td></tr>
<tr><td>Lixeiras</td><td>Vazias e identificadas por tipo de residuo</td><td>[ ]</td></tr>
<tr><td>Sinalizacao</td><td>Placas e demarcacoes visiveis e integras</td><td>[ ]</td></tr>
</table>
<p><strong>Anomalias encontradas:</strong> _______________________________________________</p>
<p><strong>Acao tomada:</strong> __________________ | <strong>OS aberta?</strong> [ ] Sim N _______ [ ] Nao</p>
<p><strong>Operador:</strong> __________________ | <strong>Turno:</strong> _____ | <strong>Data:</strong> ___/___/___</p>
</div>

<h3>Eliminando fontes de sujeira</h3>
<p>O Seiso avancado nao se contenta em limpar — busca eliminar a <strong>causa raiz da sujeira</strong>:</p>
<ul>
<li><strong>Vazamento de oleo:</strong> Trocar retentores, apertar conexoes, instalar bandejas coletoras</li>
<li><strong>Poeira de processo:</strong> Instalar coifas de exaustao, enclausurar pontos de geracao</li>
<li><strong>Rebarbas e cavaco:</strong> Ajustar parametros de corte, instalar protecoes, melhorar sistema de refrigeracao</li>
<li><strong>Residuos de embalagem:</strong> Mudar material de embalagem, definir ponto de descarte proximo a area de uso</li>
</ul>

<div class="callout"><strong>Indicador de Seiso:</strong> Meça o "numero de fontes de sujeira eliminadas por mes". No inicio sera alto (muitas fontes). Com o tempo, cai — sinal de que o ambiente esta realmente mais limpo de forma sustentavel, nao apenas varrido.</div>

<h3>Materiais de limpeza adequados</h3>
<p>Cada tipo de industria exige materiais especificos:</p>
<table>
<tr><th>Tipo de industria</th><th>Materiais recomendados</th><th>Cuidados</th></tr>
<tr><td>Metalurgica</td><td>Panos absorventes industriais, desengraxante, vassoura magnetica</td><td>Oleo de corte exige descarte como residuo perigoso</td></tr>
<tr><td>Alimenticia</td><td>Detergente neutro, sanitizante, panos descartaveis, rodo</td><td>Seguir PPHO (Procedimento Padrao de Higiene Operacional)</td></tr>
<tr><td>Construtora</td><td>Vassoura, pa, container para entulho, agua sob pressao</td><td>Separar residuos classe A, B, C conforme CONAMA 307</td></tr>
<tr><td>Agricola</td><td>Vassoura, soprador, pa, sacos de racao/grainhos para descarte</td><td>Embalagens de agrotoxico seguem logistica reversa (Lei 7.802)</td></tr>
</table>
`}, 'Ficha de limpeza/inspecao diaria'),

  (${m2.id}, '2-4-dia-d-5s', 'Dia D do 5S: planejando o mutirao', '23 min', 4, ${`
<h2>Dia D do 5S: planejando o mutirao</h2>
<p>O Dia D e o marco de lancamento do programa 5S. E um <strong>evento concentrado</strong>, geralmente de 4 a 8 horas, onde toda a fabrica para (ou roda em escala reduzida) para aplicar os tres primeiros sensos de uma vez. O Dia D nao e o 5S — e o <strong>pontape inicial</strong> que gera impacto visual e emocional, criando momentum para o programa.</p>

<h3>Antes do Dia D — planejamento (2-4 semanas antes)</h3>

<div class="template-box">
<h3>Template: Plano de Implantacao — Dia D do 5S</h3>
<table>
<tr><th>Etapa</th><th>Acao</th><th>Responsavel</th><th>Prazo</th></tr>
<tr><td>1</td><td>Definir data e horario do Dia D</td><td>Direcao</td><td>4 semanas antes</td></tr>
<tr><td>2</td><td>Formar comite 5S (3-5 pessoas)</td><td>Gestor de qualidade</td><td>4 semanas antes</td></tr>
<tr><td>3</td><td>Realizar diagnostico inicial (todas as areas)</td><td>Comite 5S</td><td>3 semanas antes</td></tr>
<tr><td>4</td><td>Treinar todos os funcionarios (conceitos basicos de 5S)</td><td>Comite 5S</td><td>2 semanas antes</td></tr>
<tr><td>5</td><td>Comprar materiais (etiquetas, tintas, estantes, lixeiras, EPIs)</td><td>Compras</td><td>2 semanas antes</td></tr>
<tr><td>6</td><td>Definir areas de quarentena para etiqueta vermelha</td><td>Comite 5S</td><td>1 semana antes</td></tr>
<tr><td>7</td><td>Preparar cacambas para descarte e veiculo para transporte</td><td>Logistica</td><td>1 semana antes</td></tr>
<tr><td>8</td><td>Comunicar amplamente (cartazes, e-mail, reuniao geral)</td><td>Comite 5S</td><td>1 semana antes</td></tr>
<tr><td>9</td><td>Executar o Dia D</td><td>Todos</td><td>Data definida</td></tr>
<tr><td>10</td><td>Registrar resultados e compartilhar fotos antes/depois</td><td>Comite 5S</td><td>1 dia apos</td></tr>
</table>
</div>

<h3>Durante o Dia D — roteiro hora a hora</h3>
<p>Exemplo para um Dia D de 6 horas (07h00 as 13h00):</p>
<table>
<tr><th>Horario</th><th>Atividade</th><th>Duracao</th></tr>
<tr><td>07h00</td><td>Abertura: palavra da direcao, objetivos do dia, divisao de equipes</td><td>30 min</td></tr>
<tr><td>07h30</td><td><strong>Seiri:</strong> Cada equipe percorre sua area, separa e etiqueta itens desnecessarios</td><td>2h</td></tr>
<tr><td>09h30</td><td>Intervalo (cafe/lanche oferecido pela empresa — gesto simbolico importante)</td><td>15 min</td></tr>
<tr><td>09h45</td><td><strong>Seiso:</strong> Limpeza profunda de cada area (chao, maquinas, estantes, paredes)</td><td>1h30</td></tr>
<tr><td>11h15</td><td><strong>Seiton:</strong> Reorganizar o que ficou — definir locais, identificar, sinalizar</td><td>1h15</td></tr>
<tr><td>12h30</td><td>Encerramento: fotos do depois, reconhecimento das equipes, proximos passos</td><td>30 min</td></tr>
</table>

<h3>Materiais necessarios para o Dia D</h3>
<table>
<tr><th>Item</th><th>Quantidade estimada (fabrica 50-100 func.)</th><th>Custo estimado</th></tr>
<tr><td>Etiquetas vermelhas</td><td>200 unidades</td><td>R$ 80</td></tr>
<tr><td>Sacos de lixo industriais (100L)</td><td>50 unidades</td><td>R$ 120</td></tr>
<tr><td>Fita adesiva demarcatoria (amarela, 50mm)</td><td>10 rolos</td><td>R$ 350</td></tr>
<tr><td>Etiquetas adesivas para identificacao</td><td>500 unidades</td><td>R$ 60</td></tr>
<tr><td>Tinta para piso epoxy</td><td>20 litros</td><td>R$ 600</td></tr>
<tr><td>Vassouras, rodos, panos, baldes</td><td>20 kits</td><td>R$ 400</td></tr>
<tr><td>Luvas de borracha, mascaras descartaveis</td><td>100 pares / 100 unidades</td><td>R$ 250</td></tr>
<tr><td>Cafe e lanche para equipe</td><td>1 servico</td><td>R$ 500</td></tr>
<tr><td><strong>TOTAL ESTIMADO</strong></td><td></td><td><strong>R$ 2.360</strong></td></tr>
</table>

<div class="callout"><strong>Dica critica:</strong> O cafe/lanche nao e luxo — e investimento. O Dia D e um evento fisico e exaustivo. Oferecer alimentacao mostra que a empresa valoriza o esforco. Muitas fabricas relatam que o lanche comunitario do Dia D foi um dos momentos de maior integracao da equipe.</div>

<h3>Erros comuns no Dia D</h3>
<ul>
<li><strong>Nao envolver a direcao:</strong> Se o dono ou diretor nao participar, a mensagem e "isso nao e importante". A direcao deve estar presente, camiseta arregacada, limpando junto.</li>
<li><strong>Nao fotografar o antes:</strong> Sem o "antes", o "depois" perde impacto. Fotografe ANTES de comecar qualquer atividade.</li>
<li><strong>Jogar tudo fora sem criterio:</strong> O Seiri exige criterio e registro. Jogar coisas fora sem etiqueta e sem consultar a equipe gera revolta e desconfianca.</li>
<li><strong>Achar que o Dia D resolve tudo:</strong> O Dia D e o inicio, nao o fim. Sem continuidade (4o e 5o S), tudo volta ao normal em 60 dias.</li>
<li><strong>Fazer no horario de producao sem planejar:</strong> Parar a producao custa dinheiro. Planeje com antecedencia, avise clientes se necessario, ajuste entregas.</li>
</ul>

<div class="example"><strong>Resultado tipico:</strong> Uma fabrica de embalagens plasticas de Curitiba (PR) com 65 funcionarios fez seu Dia D em um sabado. Resultados do dia: 2,3 toneladas de material descartado, 120 etiquetas vermelhas emitidas, 45 m2 de area liberada, 8 cacambas de entulho. Na segunda-feira seguinte, os operadores relataram que "parecia outra fabrica". A nota do diagnostico 5S subiu de 28% para 58% em um unico dia.</div>

<h3>Pos-Dia D — as primeiras 4 semanas</h3>
<p>O periodo apos o Dia D e critico. Acoes essenciais:</p>
<ol>
<li><strong>Semana 1:</strong> Montar mural de fotos antes/depois em local visivel. Resolver os itens da area de quarentena mais obvios.</li>
<li><strong>Semana 2:</strong> Definir padroes visuais para cada area (fotos do "estado ideal").</li>
<li><strong>Semana 3:</strong> Implantar o check de 5 minutos diario (rotina de Seiso).</li>
<li><strong>Semana 4:</strong> Fazer a primeira mini-auditoria 5S para medir a evolucao.</li>
</ol>
`}, 'Plano de implantacao do Dia D (cronograma completo)')`;

  // ── Module 3: Padronizacao e Disciplina ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Padronizacao e Disciplina', 'Seiketsu, Shitsuke, gestao visual e engajamento de equipe', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '3-1-seiketsu-padronizacao-checklists', 'Seiketsu: padronizacao e checklists diarios', '22 min', 1, ${`
<h2>Seiketsu: padronizacao e checklists diarios</h2>
<p>O Seiketsu (senso de padronizacao) e o senso que <strong>consolida os tres primeiros</strong>. Sem ele, o Seiri, Seiton e Seiso sao eventos pontuais que se desfazem em semanas. O Seiketsu transforma acoes em <strong>rotinas, padroes e habitos</strong>.</p>

<h3>O que e padronizar no contexto do 5S?</h3>
<p>Padronizar significa definir <strong>como as coisas devem ser</strong> e garantir que todos saibam e sigam. No 5S, isso inclui:</p>
<ul>
<li><strong>Estado padrao de cada area:</strong> Foto do "como deve estar" fixada no local</li>
<li><strong>Rotina de limpeza/inspecao:</strong> O que fazer, quando, como, quem</li>
<li><strong>Locais definidos para cada item:</strong> Mapa de layout com posicao de tudo</li>
<li><strong>Limites visuais:</strong> Quantidade maxima e minima de materiais em cada local</li>
<li><strong>Regras de uso compartilhado:</strong> Como usar e devolver ferramentas comuns</li>
</ul>

<h3>A foto do estado padrao</h3>
<p>A ferramenta mais simples e eficaz do Seiketsu e a <strong>foto do estado padrao</strong>. Funciona assim:</p>
<ol>
<li>Apos o Dia D, quando a area esta no melhor estado, tire uma foto de alta qualidade</li>
<li>Imprima em tamanho A4 ou A3 colorido</li>
<li>Plastifique e fixe num local visivel da area</li>
<li>Essa foto se torna a <strong>referencia</strong> — qualquer pessoa pode comparar o estado atual com o padrao</li>
</ol>

<div class="callout"><strong>Custo:</strong> Impressao A3 colorida + plastificacao = R$ 8 a R$ 15 por foto. Para uma fabrica com 10 areas, o investimento total fica entre R$ 80 e R$ 150. O retorno e desproporcional ao custo.</div>

<h3>Checklist diario de 5S — modelo pratico</h3>

<div class="template-box">
<h3>Template: Checklist Diario de 5S — Setor Producao</h3>
<p><strong>Turno:</strong> _____ | <strong>Data:</strong> ___/___/___ | <strong>Responsavel:</strong> _____________</p>
<table>
<tr><th>N</th><th>Item de verificacao</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>
<tr><td>1</td><td>Bancada limpa e organizada conforme foto padrao</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2</td><td>Todas as ferramentas no shadow board</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3</td><td>Piso limpo, sem oleo ou residuos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4</td><td>Lixeiras vazias e identificadas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5</td><td>Materiais no local correto e identificados</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>6</td><td>Sem itens desnecessarios na area</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>7</td><td>Maquina sem vazamentos ou anomalias visiveis</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>8</td><td>Sinalizacao de chao integra e visivel</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>9</td><td>Corredores livres (sem obstrucao)</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>10</td><td>EPIs no local definido e em bom estado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Observacoes:</strong> _________________________________________________</p>
<p><strong>Assinatura responsavel:</strong> __________________ <strong>Visto lider:</strong> __________________</p>
</div>

<h3>Padronizacao de cores na fabrica</h3>
<p>Um sistema de cores consistente facilita a comunicacao visual em toda a planta:</p>
<table>
<tr><th>Elemento</th><th>Cor sugerida</th><th>Exemplo</th></tr>
<tr><td>Equipamentos de producao</td><td>Verde ou azul claro</td><td>Tornos, fresadoras, prensas</td></tr>
<tr><td>Equipamentos de seguranca</td><td>Vermelho</td><td>Extintores, alarmes, lava-olhos</td></tr>
<tr><td>Tubulacoes — ar comprimido</td><td>Azul</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulacoes — agua</td><td>Verde</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulacoes — gas</td><td>Amarelo</td><td>Conforme NBR 6493</td></tr>
<tr><td>Areas de risco</td><td>Amarelo e preto (zebrado)</td><td>Pontos de esmagamento, queda, eletrico</td></tr>
</table>

<div class="example"><strong>Caso pratico:</strong> Uma fabrica de autopecas de Sorocaba (SP) padronizou todo o sistema de cores em 30 dias. Investiu R$ 9.500 em tinta e mao de obra. Resultado: tempo de integracao de novos funcionarios caiu de 5 dias para 2 dias (porque o ambiente "se explica sozinho"), e o numero de quase-acidentes por "nao sabia que era perigoso" caiu 70%.</div>
`}, 'Checklist diario de 5S (modelo editavel)'),

  (${m3.id}, '3-2-shitsuke-disciplina-lideranca', 'Shitsuke: disciplina e o papel da lideranca', '22 min', 2, ${`
<h2>Shitsuke: disciplina e o papel da lideranca</h2>
<p>O Shitsuke (senso de disciplina) e o senso que determina se o programa 5S <strong>vai sobreviver ou morrer</strong>. Estatisticas indicam que 70% dos programas 5S fracassam no medio prazo — e a causa principal e a falta de disciplina sustentada pela lideranca.</p>

<h3>O que e disciplina no 5S?</h3>
<p>Disciplina no contexto do 5S <strong>nao e punicao</strong>. E a capacidade de <strong>seguir padroes de forma consistente e autonoma</strong>, mesmo sem supervisao. Disciplina madura e quando o operador mantem o padrao porque entende o valor, nao porque tem medo de ser cobrado.</p>

<h3>Os tres estagios da disciplina</h3>
<table>
<tr><th>Estagio</th><th>Descricao</th><th>Tempo medio</th><th>Acao da lideranca</th></tr>
<tr><td><strong>1. Cobranca</strong></td><td>A equipe so segue o padrao quando cobrada</td><td>Meses 1-6</td><td>Presenca constante, auditorias semanais, feedback imediato</td></tr>
<tr><td><strong>2. Consciencia</strong></td><td>A equipe entende o porqu e segue com menos cobranca</td><td>Meses 6-18</td><td>Reconhecimento, autonomia gradual, auditorias quinzenais</td></tr>
<tr><td><strong>3. Habito</strong></td><td>O padrao e seguido naturalmente, faz parte da cultura</td><td>Apos 18 meses</td><td>Manter auditorias mensais, inovar, celebrar resultados</td></tr>
</table>

<h3>O papel da lideranca — o fator mais critico</h3>
<p>Pesquisas de campo em industrias brasileiras revelam um padrao claro: <strong>onde a lideranca pratica o 5S, o programa funciona; onde nao pratica, o programa morre</strong>. Nao importa quanto treinamento voce deu. Se o supervisor tem a mesa bagunçada, se o gerente ignora o chao sujo, o operador entende que "5S nao e de verdade".</p>

<div class="callout"><strong>Regra de ouro:</strong> A lideranca deve ser a primeira a ser auditada no 5S. Se a sala da direcao nao esta no padrao, nenhuma area de producao estara. Comece de cima para baixo — sempre.</div>

<h3>Acoes praticas da lideranca para sustentar o 5S</h3>
<ol>
<li><strong>Gemba walk semanal:</strong> O gestor caminha pela fabrica com o checklist de 5S, conversa com operadores, reconhece melhorias e aponta desvios. Nao e inspecao punitiva — e demonstracao de interesse.</li>
<li><strong>Feedback imediato:</strong> Quando encontrar algo fora do padrao, corrija na hora com a equipe (sem armazenar para a reuniao mensal).</li>
<li><strong>Reconhecimento publico:</strong> Destaque as areas que melhoraram. Use fotos antes/depois no quadro de gestao visual. Reconhecimento e mais poderoso que punicao.</li>
<li><strong>Recursos disponiveis:</strong> Se a equipe precisa de uma estante, um rolo de fita ou uma lata de tinta para manter o padrao, forneça rapidamente. Demora em liberar recursos mata a motivacao.</li>
<li><strong>Exemplo pessoal:</strong> Mantenha sua mesa, seu escritorio e suas areas no padrao. Participe do Dia D. Use os EPIs corretamente.</li>
</ol>

<h3>O que mata o 5S — os 7 assassinos</h3>
<ul>
<li><strong>1. Falta de exemplo da lideranca:</strong> "Faca o que eu digo, nao o que eu faco" nao funciona</li>
<li><strong>2. Dia D sem continuidade:</strong> Fazer o evento e abandonar depois</li>
<li><strong>3. Punicao sem reconhecimento:</strong> Cobrar erros e ignorar acertos</li>
<li><strong>4. Falta de tempo dedicado:</strong> "Nao temos tempo para 5S, tem producao para entregar" — se nao ha 5 minutos por dia, o problema e de gestao, nao de tempo</li>
<li><strong>5. Rotatividade sem treinamento:</strong> Novos funcionarios nao sabem o que e 5S e desfazem o trabalho dos outros</li>
<li><strong>6. Sem medicao:</strong> O que nao e medido nao e gerenciado. Sem auditoria, sem nota, sem acompanhamento</li>
<li><strong>7. Programa "da qualidade":</strong> Quando o 5S e visto como responsabilidade so do setor de qualidade, e nao de todos</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma industria grafica de Blumenau (SC) implantou o 5S em 2019. Em 6 meses, a nota media subiu de 35% para 78%. Entao o gerente de producao foi transferido e o substituto "nao acreditava em 5S". Em 4 meses, a nota caiu para 42%. A empresa so recuperou quando o diretor assumiu pessoalmente as auditorias e cobrou o novo gerente. Licao: a sustentacao depende da <strong>estrutura</strong> (auditorias, metas, reconhecimento), nao de uma unica pessoa.</div>

<h3>Integracao de novos funcionarios</h3>
<p>Todo novo funcionario deve passar por uma <strong>integracao de 5S</strong> no primeiro dia:</p>
<ul>
<li>Explicacao dos 5 sensos (15 minutos)</li>
<li>Tour pela fabrica mostrando os padroes visuais</li>
<li>Apresentacao do shadow board e do checklist da area</li>
<li>Designacao de um "padrinho de 5S" (colega experiente) na primeira semana</li>
</ul>
`}, NULL),

  (${m3.id}, '3-3-gestao-visual-quadros-sinalizacao', 'Gestao visual: quadros, sinalizacao e cores', '20 min', 3, ${`
<h2>Gestao visual: quadros, sinalizacao e cores</h2>
<p>A gestao visual e o <strong>sistema nervoso do 5S</strong>. Num ambiente com boa gestao visual, qualquer pessoa — funcionario, visitante, auditor — consegue entender a situacao em segundos, sem precisar perguntar. O objetivo e simples: <strong>tornar o estado normal e o anormal visiveis instantaneamente</strong>.</p>

<h3>Principios da gestao visual industrial</h3>
<ol>
<li><strong>Informacao no ponto de uso:</strong> A informacao deve estar onde e necessaria, nao num escritorio distante</li>
<li><strong>Compreensao imediata:</strong> Qualquer pessoa deve entender em ate 5 segundos</li>
<li><strong>Anomalia visivel:</strong> Quando algo esta fora do padrao, deve ser obvio</li>
<li><strong>Atualizacao facil:</strong> Se e dificil atualizar, ninguem atualiza</li>
</ol>

<h3>Quadro de gestao visual — o "cockpit" da area</h3>
<p>Cada setor deve ter um quadro de gestao visual (tambem chamado de "quadro de bordo" ou "daily management board"). Conteudo recomendado:</p>

<div class="template-box">
<h3>Template: Quadro de Gestao Visual — Setor</h3>
<table>
<tr><th>Secao</th><th>Conteudo</th><th>Frequencia de atualizacao</th></tr>
<tr><td>Seguranca</td><td>Dias sem acidente, mapa de riscos da area, EPIs obrigatorios</td><td>Diaria</td></tr>
<tr><td>Qualidade</td><td>Indice de rejeicao, nao-conformidades abertas, meta do mes</td><td>Diaria/semanal</td></tr>
<tr><td>Producao</td><td>Meta x realizado (diario), OEE, paradas</td><td>Diaria</td></tr>
<tr><td>5S</td><td>Nota da ultima auditoria, fotos antes/depois, ranking de areas</td><td>Mensal</td></tr>
<tr><td>Pessoas</td><td>Aniversariantes, treinamentos, reconhecimentos</td><td>Mensal</td></tr>
<tr><td>Acoes</td><td>Plano de acao pendente (5W2H simplificado)</td><td>Semanal</td></tr>
</table>
</div>

<h3>Tipos de sinalizacao industrial</h3>
<table>
<tr><th>Tipo</th><th>Exemplos</th><th>Material</th><th>Custo medio</th></tr>
<tr><td>Sinalizacao de chao</td><td>Faixas de corredor, demarcacao de equipamentos, areas de estoque</td><td>Fita adesiva ou pintura epoxy</td><td>R$ 15-40/m (fita) ou R$ 30-60/m2 (pintura)</td></tr>
<tr><td>Placas de identificacao</td><td>Nome do setor, funcao do equipamento, nome da estante</td><td>PVC, acrilico ou aluminio</td><td>R$ 20-80/placa</td></tr>
<tr><td>Etiquetas de prateleira</td><td>Nome do item, codigo, quantidade min/max, foto</td><td>Papel plastificado ou PVC fino</td><td>R$ 2-8/etiqueta</td></tr>
<tr><td>Andon (semaforo)</td><td>Verde (normal), amarelo (atencao), vermelho (parada)</td><td>LED industrial</td><td>R$ 150-600/unidade</td></tr>
<tr><td>Marcadores de nivel</td><td>Nivel min/max em recipientes de liquidos ou estoque</td><td>Fita colorida ou pintura</td><td>R$ 5-15/marcador</td></tr>
</table>

<div class="example"><strong>Caso pratico:</strong> Uma fabrica de alimentos de Marilia (SP) implantou gestao visual completa em 45 dias. Investimento: R$ 14.000 (quadros, placas, sinalizacao de chao, etiquetas). Resultado: o tempo de treinamento de novos operadores na linha de producao caiu de 2 semanas para 5 dias, porque o ambiente "ensina" sozinho. Auditores da ANVISA elogiaram especificamente a identificacao de areas e o controle visual de validade.</div>

<h3>Sinalizacao de seguranca integrada ao 5S</h3>
<p>O 5S e a sinalizacao de seguranca (NR-26, NBR 7195) se complementam. Ao implantar o 5S, aproveite para revisar e melhorar a sinalizacao de seguranca:</p>
<ul>
<li><strong>Rotas de fuga:</strong> Setas fotoluminescentes no chao e nas paredes</li>
<li><strong>Extintores:</strong> Demarcacao de chao vermelha, placa de identificacao com tipo e validade</li>
<li><strong>Paineis eletricos:</strong> Identificacao de circuitos, aviso de risco de choque</li>
<li><strong>Areas de risco:</strong> Zebrado amarelo/preto, placa com tipo de risco e EPI obrigatorio</li>
<li><strong>Saida de emergencia:</strong> Sinalizacao verde com pictograma e seta direcional</li>
</ul>

<h3>Gestao visual digital</h3>
<p>Empresas mais avancadas estao complementando a gestao visual fisica com ferramentas digitais:</p>
<ul>
<li><strong>TV/monitor no setor:</strong> Exibindo indicadores em tempo real (OEE, producao, qualidade)</li>
<li><strong>Apps de auditoria 5S:</strong> Fotos com geolocalizacao, pontuacao automatica, historico de evolucao</li>
<li><strong>QR codes:</strong> Nas maquinas e estantes, linkando para instrucao de trabalho, ficha tecnica ou historico de manutencao</li>
</ul>

<div class="callout"><strong>Equilibrio:</strong> A gestao visual fisica (quadros, placas, cores) e insubstituivel — funciona sem energia, sem wifi, sem celular. A digital complementa, mas nao substitui. Comece pelo fisico, depois adicione o digital onde agregar valor.</div>
`}, 'Layout de quadro de gestao visual (modelo A1)'),

  (${m3.id}, '3-4-engajamento-equipe-comunicacao', 'Engajamento de equipe e comunicacao', '20 min', 4, ${`
<h2>Engajamento de equipe e comunicacao</h2>
<p>O 5S so funciona se as <strong>pessoas acreditarem no programa</strong>. Nao se implanta 5S por decreto — se implanta por <strong>convencimento, envolvimento e comunicacao</strong>. Esta aula aborda as estrategias praticas para engajar todos os niveis da organizacao.</p>

<h3>Por que as pessoas resistem ao 5S?</h3>
<p>Entender a resistencia e o primeiro passo para supera-la:</p>
<table>
<tr><th>Motivo da resistencia</th><th>O que a pessoa pensa</th><th>Como lidar</th></tr>
<tr><td>Medo de mudanca</td><td>"Vai mudar minha rotina e eu nao sei se vou me adaptar"</td><td>Envolver na decisao, treinar antes de cobrar</td></tr>
<tr><td>Experiencia negativa anterior</td><td>"Ja tentaram 5S aqui e nao funcionou"</td><td>Reconhecer o passado, mostrar o que sera diferente desta vez</td></tr>
<tr><td>Falta de tempo</td><td>"Mal dou conta da producao, agora querem que eu limpe?"</td><td>Mostrar que 5 min de organizacao economizam 30 min de busca</td></tr>
<tr><td>Senso de propriedade</td><td>"Ninguem vai mexer nas minhas coisas"</td><td>Participacao na classificacao, respeito ao conhecimento do operador</td></tr>
<tr><td>Descrenca na lideranca</td><td>"Eles nem arrumam o escritorio deles"</td><td>Lideranca pelo exemplo — comece de cima</td></tr>
</table>

<h3>Estrategias de engajamento por nivel</h3>

<h3>Alta direcao</h3>
<ul>
<li><strong>Linguagem:</strong> ROI, produtividade, reducao de custo, imagem para clientes e auditores</li>
<li><strong>Ferramenta:</strong> Apresente o diagnostico com fotos e numeros. Compare o custo do 5S com o custo do desperdicio.</li>
<li><strong>Compromisso:</strong> A direcao deve estar presente no Dia D e nas auditorias iniciais.</li>
</ul>

<h3>Gestao intermediaria (supervisores e lideres)</h3>
<ul>
<li><strong>Linguagem:</strong> Facilitacao do trabalho, menos problemas diarios, equipe mais autonoma</li>
<li><strong>Ferramenta:</strong> Treine-os como auditores 5S. Dando-lhes papel ativo, cria senso de propriedade.</li>
<li><strong>Compromisso:</strong> Cada supervisor e responsavel pela nota 5S da sua area.</li>
</ul>

<h3>Operadores</h3>
<ul>
<li><strong>Linguagem:</strong> Conforto, seguranca, orgulho do ambiente, menos tempo perdido</li>
<li><strong>Ferramenta:</strong> Envolvimento na decisao (eles decidem o que fica e o que sai, onde cada coisa fica). Faca com eles, nao para eles.</li>
<li><strong>Compromisso:</strong> Cada operador e responsavel pelo check diario da sua area.</li>
</ul>

<div class="callout"><strong>Principio fundamental:</strong> "As pessoas apoiam o que ajudam a construir." Quanto mais a equipe participar das decisoes do 5S (onde guardar, como organizar, que padrao definir), mais ela vai defender o programa.</div>

<h3>Comunicacao do programa 5S</h3>
<p>A comunicacao deve ser constante, nao so no lancamento:</p>
<table>
<tr><th>Momento</th><th>Canal</th><th>Mensagem</th></tr>
<tr><td>Antes do lancamento</td><td>Reuniao geral, cartazes</td><td>"O que e 5S, por que estamos fazendo, como vai funcionar"</td></tr>
<tr><td>Dia D</td><td>Presencial, fotos</td><td>"Estamos transformando nosso ambiente juntos"</td></tr>
<tr><td>Primeiras semanas</td><td>Mural, e-mail, app</td><td>Fotos antes/depois, resultados iniciais</td></tr>
<tr><td>Mensal</td><td>Quadro de gestao visual</td><td>Nota da auditoria, ranking de areas, evolucao</td></tr>
<tr><td>Trimestral</td><td>Reuniao geral</td><td>Resultados consolidados, reconhecimento das melhores areas</td></tr>
</table>

<h3>Programa de reconhecimento 5S</h3>
<p>O reconhecimento e mais eficaz que a punicao para manter o programa vivo. Modelos que funcionam:</p>
<ul>
<li><strong>Area destaque do mes:</strong> A area com melhor nota na auditoria ganha um trofeu simbolico (um selo, uma bandeira, um quadro) que fica exposto ate a proxima avaliacao. Custo: zero.</li>
<li><strong>Foto no quadro:</strong> A equipe da melhor area tem foto no quadro de gestao visual. Orgulho visivel.</li>
<li><strong>Cafe com a direcao:</strong> A equipe vencedora toma um cafe com o diretor, que pessoalmente agradece o esforco. Custo: R$ 50. Impacto: enorme.</li>
<li><strong>Premio trimestral:</strong> A melhor area do trimestre recebe um premio coletivo (churrasco, cesta basica extra, folga). Custo: R$ 500-1.500. Retorno: incalculavel em motivacao.</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma metalurgica de Piracicaba (SP) com 180 funcionarios criou o "Torneio 5S". As 6 areas de producao competem mensalmente. A vencedora ganha uma estrela no quadro. Ao final de 6 meses, a area com mais estrelas ganha um churrasco pago pela empresa. Em 2 anos de programa, a nota media subiu de 45% para 87%, e a rotatividade de pessoal caiu 18% (as pessoas passaram a ter mais orgulho do ambiente de trabalho).</div>

<h3>O papel do comite 5S</h3>
<p>O comite 5S e o grupo responsavel por coordenar o programa. Composicao ideal:</p>
<ul>
<li>1 coordenador (preferencialmente da area de qualidade ou producao)</li>
<li>1 representante de cada setor principal</li>
<li>1 representante da direcao (para garantir autoridade e recursos)</li>
<li>Mandato de 12 meses, renovavel</li>
</ul>
<p>Atribuicoes: planejar auditorias, compilar resultados, propor melhorias, organizar eventos de reconhecimento, treinar novos funcionarios.</p>
`}, 'Modelo de programa de reconhecimento 5S')`;

  // ── Module 4: Sustentacao e Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Sustentacao e Melhoria', 'Auditoria, indicadores, melhoria continua e integracao com outros programas', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-auditoria-5s-checklist-pontuacao', 'Auditoria 5S: checklist e pontuacao', '25 min', 1, ${`
<h2>Auditoria 5S: checklist e pontuacao</h2>
<p>A auditoria 5S e o <strong>instrumento que mantem o programa vivo</strong>. Sem auditoria, nao ha medicao. Sem medicao, nao ha gestao. Sem gestao, o 5S desaparece em semanas. A auditoria nao e "fiscalizacao" — e um <strong>diagnostico periodico</strong> que mostra onde a area esta e para onde precisa ir.</p>

<h3>Frequencia de auditorias</h3>
<table>
<tr><th>Fase do programa</th><th>Frequencia recomendada</th><th>Quem audita</th></tr>
<tr><td>Primeiros 3 meses</td><td>Semanal</td><td>Comite 5S ou lider da area vizinha</td></tr>
<tr><td>Meses 3-12</td><td>Quinzenal</td><td>Comite 5S</td></tr>
<tr><td>Apos 12 meses</td><td>Mensal</td><td>Comite 5S + auditoria cruzada entre setores</td></tr>
<tr><td>Programa maduro (2+ anos)</td><td>Mensal ou bimestral</td><td>Auditoria cruzada + auditoria surpresa trimestral</td></tr>
</table>

<div class="callout"><strong>Auditoria cruzada:</strong> O lider do setor A audita o setor B, o lider de B audita o C, e assim por diante. Isso traz olhar externo (mais critico) e dissemina boas praticas entre setores. E uma das tecnicas mais eficazes para sustentar o 5S.</div>

<h3>Checklist de auditoria 5S — modelo completo</h3>

<div class="template-box">
<h3>Template: Auditoria 5S — Checklist de Pontuacao</h3>
<p><strong>Area:</strong> _____________ | <strong>Auditor:</strong> _____________ | <strong>Data:</strong> ___/___/___</p>
<p><strong>Escala:</strong> 0 = Nao atende | 1 = Atende parcialmente | 2 = Atende plenamente</p>

<p><strong>SEIRI (Utilizacao)</strong></p>
<table>
<tr><th>N</th><th>Criterio</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>1.1</td><td>Nao ha itens desnecessarios na area de trabalho</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.2</td><td>Nao ha ferramentas/materiais sem uso visivel</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.3</td><td>Nao ha documentos ou informacoes obsoletas expostas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.4</td><td>Nao ha equipamentos/moveis sem funcao definida</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>1.5</td><td>Quantidade de materiais compativel com a demanda</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiri: ___/10</strong></p>

<p><strong>SEITON (Organizacao)</strong></p>
<table>
<tr><th>N</th><th>Criterio</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>2.1</td><td>Cada item tem local definido e identificado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.2</td><td>Itens estao efetivamente nos locais definidos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.3</td><td>Shadow board ou sistema equivalente em uso</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.4</td><td>Demarcacao de chao integra e respeitada</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>2.5</td><td>Item localizado em ate 30 segundos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiton: ___/10</strong></p>

<p><strong>SEISO (Limpeza)</strong></p>
<table>
<tr><th>N</th><th>Criterio</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>3.1</td><td>Piso limpo, sem residuos, oleo ou poeira excessiva</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.2</td><td>Equipamentos limpos e sem vazamentos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.3</td><td>Materiais de limpeza disponiveis e organizados</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.4</td><td>Lixeiras identificadas, nao transbordando</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>3.5</td><td>Fontes de sujeira identificadas e em tratamento</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiso: ___/10</strong></p>

<p><strong>SEIKETSU (Padronizacao)</strong></p>
<table>
<tr><th>N</th><th>Criterio</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>4.1</td><td>Foto do estado padrao fixada e visivel</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.2</td><td>Checklist diario preenchido e atualizado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.3</td><td>Padroes de cores e sinalizacao seguidos</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.4</td><td>Informacoes do quadro de gestao visual atualizadas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>4.5</td><td>Instrucoes de trabalho no ponto de uso</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Seiketsu: ___/10</strong></p>

<p><strong>SHITSUKE (Disciplina)</strong></p>
<table>
<tr><th>N</th><th>Criterio</th><th>0</th><th>1</th><th>2</th></tr>
<tr><td>5.1</td><td>A equipe demonstra conhecimento dos padroes 5S</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.2</td><td>O check diario e feito sem cobranca</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.3</td><td>Novos funcionarios receberam treinamento 5S</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.4</td><td>Acoes corretivas de auditorias anteriores foram concluidas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>5.5</td><td>A area demonstra melhoria em relacao a ultima auditoria</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Subtotal Shitsuke: ___/10</strong></p>

<p><strong>TOTAL GERAL: ___/50 = ___%</strong></p>
<p><strong>Classificacao:</strong> [ ] Critico (0-40%) | [ ] Insuficiente (41-60%) | [ ] Bom (61-80%) | [ ] Excelente (81-100%)</p>
<p><strong>Pontos fortes:</strong> _________________________________________________</p>
<p><strong>Oportunidades de melhoria:</strong> _______________________________________</p>
<p><strong>Assinatura auditor:</strong> _____________ | <strong>Assinatura lider da area:</strong> _____________</p>
</div>

<h3>Conduzindo a auditoria</h3>
<p>Dicas para uma auditoria eficaz:</p>
<ol>
<li><strong>Caminhe pela area:</strong> Nao audite de longe. Entre, olhe atras das maquinas, abra armarios, verifique gavetas.</li>
<li><strong>Converse com operadores:</strong> Pergunte: "Onde fica tal ferramenta? Qual e a rotina de limpeza?" Se o operador sabe responder, o 5S esta funcionando.</li>
<li><strong>Teste os 30 segundos:</strong> Peca para localizar um item especifico. Cronometre.</li>
<li><strong>Fotografe desvios:</strong> Foto com data e hora e evidencia objetiva.</li>
<li><strong>Feedback imediato:</strong> Ao final, converse com o lider da area sobre os achados. Nao espere o relatorio formal.</li>
<li><strong>Registre pontos positivos:</strong> A auditoria nao e so para achar defeitos. Reconheca o que esta bom.</li>
</ol>

<div class="example"><strong>Benchmark:</strong> Empresas com programa 5S maduro costumam ter nota media entre 80% e 92%. Notas acima de 95% por periodos longos podem indicar auditoria branda (complacencia). O ideal e que haja sempre oportunidades de melhoria identificadas — isso mostra que o olhar critico continua ativo.</div>
`}, 'Checklist de auditoria 5S (modelo completo com pontuacao)'),

  (${m4.id}, '4-2-indicadores-5s-acompanhamento', 'Indicadores de 5S e acompanhamento', '20 min', 2, ${`
<h2>Indicadores de 5S e acompanhamento</h2>
<p>O 5S, como qualquer programa de gestao, precisa de <strong>indicadores para ser gerenciado</strong>. Sem numeros, nao ha como saber se o programa esta avancando, estagnado ou regredindo. Os indicadores transformam percepcao em <strong>fatos</strong>.</p>

<h3>Indicadores primarios do 5S</h3>
<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta sugerida</th><th>Frequencia</th></tr>
<tr><td><strong>Nota de auditoria 5S (%)</strong></td><td>Aderencia ao padrao geral</td><td>Acima de 80% apos 12 meses</td><td>Mensal</td></tr>
<tr><td><strong>Nota por senso (%)</strong></td><td>Pontuacao de cada S separadamente</td><td>Nenhum senso abaixo de 60%</td><td>Mensal</td></tr>
<tr><td><strong>Tendencia de evolucao</strong></td><td>A nota esta subindo, estavel ou caindo?</td><td>Tendencia de alta nos primeiros 12 meses</td><td>Trimestral</td></tr>
<tr><td><strong>Taxa de fechamento de acoes</strong></td><td>% de acoes corretivas da auditoria concluidas no prazo</td><td>Acima de 90%</td><td>Mensal</td></tr>
</table>

<h3>Indicadores secundarios (impacto do 5S)</h3>
<p>Alem dos indicadores diretos do programa, e importante medir o <strong>impacto do 5S nos resultados da operacao</strong>:</p>
<table>
<tr><th>Indicador</th><th>Relacao com o 5S</th><th>Como medir</th></tr>
<tr><td>Tempo de setup</td><td>Seiton reduz busca de ferramentas e materiais</td><td>Cronometrar setup antes e depois do 5S</td></tr>
<tr><td>Acidentes de trabalho</td><td>Seiso elimina riscos; Seiton libera corredores</td><td>Registros de SST (CAT, quase-acidentes)</td></tr>
<tr><td>Retrabalho / refugo</td><td>Organizacao reduz troca de material e erros</td><td>Indice de rejeicao por area</td></tr>
<tr><td>Reclamacoes de clientes</td><td>Ambiente organizado reduz erros de expedicao</td><td>SAC / sistema de reclamacoes</td></tr>
<tr><td>Area util disponivel</td><td>Seiri libera espaco</td><td>Medicao em m2 recuperados</td></tr>
<tr><td>Custo de manutencao corretiva</td><td>Seiso como inspecao previne quebras</td><td>Ordens de servico corretivas vs. preventivas</td></tr>
</table>

<div class="callout"><strong>Correlacao e causalidade:</strong> Cuidado ao atribuir toda melhoria ao 5S. Se voce implantou 5S e TPM ao mesmo tempo, a reducao de paradas pode ser efeito dos dois. Mas se o 5S foi a unica mudanca, a correlacao e mais forte. Documente as datas de implantacao de cada programa para poder isolar os efeitos.</div>

<h3>Dashboard de 5S — como montar</h3>
<p>O acompanhamento deve ser visual e acessivel. Opcoes:</p>

<h3>Opcao 1 — Quadro fisico (recomendado para inicio)</h3>
<ul>
<li>Grafico de barras mensal com a nota de cada area (desenhado a mao ou impresso)</li>
<li>Semaforo por area: verde (acima de 80%), amarelo (60-80%), vermelho (abaixo de 60%)</li>
<li>Fotos antes/depois das 3 maiores melhorias do mes</li>
<li>Lista de acoes pendentes com responsavel e prazo</li>
</ul>

<h3>Opcao 2 — Planilha compartilhada (Google Sheets / Excel Online)</h3>
<ul>
<li>Aba de registro de auditorias (data, area, nota por senso, nota total)</li>
<li>Aba de grafico de evolucao (linha do tempo com notas mensais por area)</li>
<li>Aba de acoes corretivas (item, responsavel, prazo, status)</li>
<li>Dashboard automatico com graficos</li>
</ul>

<h3>Opcao 3 — App especializado</h3>
<p>Para empresas maiores (100+ funcionarios), apps como ChecklistFacil, iAuditor ou Auditoria Digital permitem:</p>
<ul>
<li>Auditorias no celular com fotos geolocalizadas</li>
<li>Pontuacao automatica</li>
<li>Geracao de relatorios em PDF</li>
<li>Notificacoes de acoes vencidas</li>
<li>Custo: R$ 100 a R$ 500/mes dependendo do plano</li>
</ul>

<div class="example"><strong>Caso pratico:</strong> Uma fabrica de pecas em Manaus (AM) migrou das auditorias em papel para o app ChecklistFacil. O tempo de auditoria por area caiu de 45 minutos para 20 minutos (porque o app ja tem os criterios pre-carregados). O tempo de compilacao dos resultados caiu de 4 horas/mes para zero (o app gera o relatorio automaticamente). E o historico de fotos permitiu criar um "album de evolucao" que impressiona clientes em visitas a fabrica.</div>

<h3>Reuniao mensal de 5S</h3>
<p>Uma boa pratica e realizar uma reuniao mensal de 15-30 minutos para revisar os indicadores:</p>
<ol>
<li>Apresentar nota de auditoria de cada area (5 min)</li>
<li>Destacar as 3 maiores melhorias e as 3 maiores oportunidades (5 min)</li>
<li>Revisar acoes pendentes (5 min)</li>
<li>Reconhecer a area destaque do mes (2 min)</li>
<li>Definir foco do proximo mes (3 min)</li>
</ol>
`}, 'Modelo de dashboard 5S (planilha)'),

  (${m4.id}, '4-3-acoes-corretivas-melhoria-continua', 'Acoes corretivas e melhoria continua no 5S', '20 min', 3, ${`
<h2>Acoes corretivas e melhoria continua no 5S</h2>
<p>A auditoria identifica desvios. Os indicadores mostram tendencias. Mas o que realmente <strong>melhora o programa</strong> e a acao sobre essas informacoes. Nesta aula, vamos tratar de como transformar achados de auditoria em <strong>acoes eficazes</strong> e como manter o ciclo de melhoria continua do 5S.</p>

<h3>O ciclo PDCA aplicado ao 5S</h3>
<p>O 5S segue naturalmente o ciclo PDCA:</p>
<table>
<tr><th>Fase</th><th>Aplicacao no 5S</th><th>Ferramentas</th></tr>
<tr><td><strong>Plan (Planejar)</strong></td><td>Diagnostico, definicao de padroes, metas, cronograma</td><td>Checklist de diagnostico, plano de implantacao</td></tr>
<tr><td><strong>Do (Executar)</strong></td><td>Dia D, organizacao, limpeza, sinalizacao</td><td>Etiqueta vermelha, shadow board, demarcacao</td></tr>
<tr><td><strong>Check (Verificar)</strong></td><td>Auditorias, indicadores, feedback dos operadores</td><td>Checklist de auditoria, dashboard, reuniao mensal</td></tr>
<tr><td><strong>Act (Agir)</strong></td><td>Acoes corretivas, ajuste de padroes, melhoria</td><td>5W2H, 5 Por ques, Kaizen</td></tr>
</table>

<h3>Tratamento de nao-conformidades de auditoria</h3>
<p>Quando a auditoria identifica um desvio, o tratamento segue um fluxo simples:</p>
<ol>
<li><strong>Registrar:</strong> O que foi encontrado, onde, quando (com foto)</li>
<li><strong>Analisar causa:</strong> Por que aconteceu? (use os 5 Por ques)</li>
<li><strong>Definir acao:</strong> O que fazer para corrigir e prevenir recorrencia</li>
<li><strong>Definir responsavel e prazo:</strong> Quem faz e ate quando</li>
<li><strong>Executar:</strong> Realizar a acao</li>
<li><strong>Verificar eficacia:</strong> Na proxima auditoria, o desvio desapareceu?</li>
</ol>

<div class="template-box">
<h3>Template: Plano de Acao 5S (5W2H simplificado)</h3>
<table>
<tr><th>Campo</th><th>Descricao</th><th>Preenchimento</th></tr>
<tr><td><strong>O que? (What)</strong></td><td>Qual e o desvio/oportunidade?</td><td>______________________________</td></tr>
<tr><td><strong>Por que? (Why)</strong></td><td>Qual a causa raiz?</td><td>______________________________</td></tr>
<tr><td><strong>Onde? (Where)</strong></td><td>Em qual area/setor?</td><td>______________________________</td></tr>
<tr><td><strong>Quem? (Who)</strong></td><td>Responsavel pela acao</td><td>______________________________</td></tr>
<tr><td><strong>Quando? (When)</strong></td><td>Prazo para conclusao</td><td>___/___/___</td></tr>
<tr><td><strong>Como? (How)</strong></td><td>Descricao da acao</td><td>______________________________</td></tr>
<tr><td><strong>Quanto? (How much)</strong></td><td>Custo estimado (se houver)</td><td>R$ ________</td></tr>
</table>
<p><strong>Status:</strong> [ ] Pendente | [ ] Em andamento | [ ] Concluida | [ ] Verificada eficaz</p>
</div>

<h3>Os 5 Por ques — analise de causa raiz no 5S</h3>
<p>Muitos desvios de 5S tem causas raiz mais profundas do que parecem. A tecnica dos 5 Por ques ajuda a ir alem do superficial:</p>

<div class="example"><strong>Exemplo:</strong>
<p><strong>Desvio:</strong> Ferramentas fora do shadow board no setor de usinagem.</p>
<p><strong>1o Por que?</strong> Os operadores nao devolvem as ferramentas apos o uso.</p>
<p><strong>2o Por que?</strong> O shadow board fica longe da maquina (15 metros).</p>
<p><strong>3o Por que?</strong> O shadow board foi instalado na parede mais conveniente durante o Dia D, sem consultar os operadores.</p>
<p><strong>4o Por que?</strong> Nao houve criterio de proximidade ao definir a posicao do shadow board.</p>
<p><strong>Causa raiz:</strong> Shadow board mal posicionado.</p>
<p><strong>Acao:</strong> Relocar o shadow board para a parede ao lado das maquinas CNC (distancia maxima de 3 metros). Custo: R$ 120 (parafusos e mao de obra). Prazo: 5 dias.</p></div>

<h3>Kaizen no 5S — pequenas melhorias continuas</h3>
<p>Alem de corrigir desvios, o 5S pode (e deve) evoluir continuamente. Ideias de Kaizen no 5S:</p>
<ul>
<li><strong>Novos shadow boards:</strong> Expandir para areas que nao tinham</li>
<li><strong>Demarcacao de chao melhorada:</strong> Trocar fita por pintura (mais duravel)</li>
<li><strong>Iluminacao de estantes:</strong> Adicionar LED em estantes escuras para facilitar a identificacao</li>
<li><strong>Etiquetas com QR code:</strong> Linkar para a ficha tecnica ou instrucao de trabalho</li>
<li><strong>Reducao do check de 5 min para 3 min:</strong> Otimizar a rotina a medida que o padrao se consolida</li>
</ul>

<h3>Quando o 5S regride — plano de recuperacao</h3>
<p>Se a nota de auditoria cair abaixo de 60% apos ja ter estado acima de 80%, e necessario um plano de recuperacao:</p>
<ol>
<li><strong>Diagnostico rapido:</strong> Identificar a causa da regressao (mudanca de lider? Rotatividade alta? Perda de interesse?)</li>
<li><strong>Reuniao com a equipe:</strong> Nao para punir, mas para entender e replanejar</li>
<li><strong>Mini Dia D:</strong> Um mutirao de 2-3 horas para restaurar o padrao</li>
<li><strong>Aumento temporario de auditorias:</strong> Voltar para semanal ate estabilizar acima de 70%</li>
<li><strong>Reforco da lideranca:</strong> O gestor deve estar mais presente na area</li>
</ol>

<div class="callout"><strong>Dado real:</strong> Em uma pesquisa com 45 industrias brasileiras que implantaram 5S (SENAI-PR, 2021), 62% relataram pelo menos uma regressao significativa nos primeiros 2 anos. Das que se recuperaram, 100% tinham sistema de auditoria ativo. Das que nao se recuperaram, apenas 15% faziam auditorias regulares. A auditoria e o "seguro de vida" do programa 5S.</div>
`}, 'Modelo de plano de acao 5W2H para 5S'),

  (${m4.id}, '4-4-integracao-5s-iso-outros-programas', 'Integracao do 5S com ISO 9001 e outros programas', '22 min', 4, ${`
<h2>Integracao do 5S com ISO 9001 e outros programas</h2>
<p>O 5S nao existe isolado. Ele e a <strong>base sobre a qual outros programas de gestao se apoiam</strong>. Nesta aula, vamos explorar como integrar o 5S com ISO 9001, ISO 14001, Lean Manufacturing, TPM e outros programas comuns na industria brasileira.</p>

<h3>5S e ISO 9001:2015</h3>
<p>A ISO 9001 nao menciona o 5S explicitamente, mas varios requisitos sao atendidos ou facilitados pelo programa:</p>
<table>
<tr><th>Clausula ISO 9001</th><th>Requisito</th><th>Contribuicao do 5S</th></tr>
<tr><td>7.1.3</td><td>Infraestrutura</td><td>Seiso mantem infraestrutura limpa e funcional; Seiton garante organizacao</td></tr>
<tr><td>7.1.4</td><td>Ambiente para operacao de processos</td><td>5S cria ambiente fisico adequado (limpo, organizado, seguro)</td></tr>
<tr><td>7.1.5</td><td>Recursos de monitoramento e medicao</td><td>Seiton garante rastreabilidade e localizacao de instrumentos calibrados</td></tr>
<tr><td>7.1.6</td><td>Conhecimento organizacional</td><td>Gestao visual e padroes escritos preservam o conhecimento no ambiente</td></tr>
<tr><td>7.3</td><td>Conscientizacao</td><td>Treinamento 5S e auditorias promovem conscientizacao da qualidade</td></tr>
<tr><td>8.5.2</td><td>Identificacao e rastreabilidade</td><td>Seiton com etiquetas e enderecamento garante identificacao</td></tr>
<tr><td>8.5.4</td><td>Preservacao de saidas</td><td>Organizacao e limpeza preservam produto durante manuseio e armazenamento</td></tr>
<tr><td>8.7</td><td>Controle de saidas nao conformes</td><td>Area vermelha demarcada para produto nao conforme (gestao visual)</td></tr>
</table>

<div class="callout"><strong>Dica para auditoria de certificacao:</strong> Auditores de ISO 9001 sempre observam o ambiente durante a auditoria. Uma fabrica com 5S bem implantado causa impressao positiva imediata e facilita a demonstracao de varios requisitos. Muitos auditores relatam que "uma fabrica organizada raramente tem nao-conformidades graves".</div>

<h3>5S e Lean Manufacturing</h3>
<p>No Lean, o 5S e considerado <strong>a fundacao da casa Toyota</strong> (Toyota Production System). Sem 5S, nao se implanta:</p>
<ul>
<li><strong>Trabalho padronizado:</strong> Requer ambiente organizado e ferramentas no lugar certo</li>
<li><strong>Kanban:</strong> Requer sinalizacao visual clara e limites de estoque definidos</li>
<li><strong>SMED (troca rapida):</strong> Requer ferramentas organizadas e acessiveis (shadow board)</li>
<li><strong>Fluxo continuo:</strong> Requer corredores livres e areas demarcadas</li>
<li><strong>Kaizen:</strong> 5S e o primeiro Kaizen — a melhoria mais visivel e imediata</li>
</ul>

<div class="example"><strong>Sequencia recomendada de implantacao Lean:</strong> 5S → Trabalho padronizado → Gestao visual → SMED → Kanban → Fluxo continuo → Heijunka. O 5S e sempre o primeiro passo. Tentar implantar Kanban sem 5S e como construir um predio sem fundacao.</div>

<h3>5S e TPM (Total Productive Maintenance)</h3>
<p>A conexao entre 5S e TPM e direta e poderosa:</p>
<ul>
<li><strong>Seiso = Manutencao autonoma:</strong> O operador que limpa a maquina e o primeiro nivel de manutencao preventiva</li>
<li><strong>Seiton = Organizacao de ferramentas de manutencao:</strong> Chaves, graxeiras e lubrificantes organizados no ponto de uso</li>
<li><strong>Seiketsu = Checklists de manutencao autonoma:</strong> Rotina padronizada de inspecao diaria</li>
</ul>
<p>Na pratica, muitas empresas implantam "5S + Manutencao Autonoma" como um programa unico, otimizando recursos e treinamento.</p>

<h3>5S e ISO 14001 (Meio Ambiente)</h3>
<p>O 5S contribui para a gestao ambiental de diversas formas:</p>
<ul>
<li><strong>Seiri:</strong> Descarte controlado de residuos e materiais obsoletos</li>
<li><strong>Seiso:</strong> Identificacao de vazamentos de oleo, produtos quimicos, agua</li>
<li><strong>Seiton:</strong> Armazenamento correto de produtos quimicos (compatibilidade, contencao)</li>
<li><strong>Gestao visual:</strong> Identificacao de lixeiras por tipo de residuo (coleta seletiva industrial)</li>
</ul>

<h3>5S e NRs de Seguranca do Trabalho</h3>
<table>
<tr><th>NR</th><th>Tema</th><th>Contribuicao do 5S</th></tr>
<tr><td>NR-12</td><td>Seguranca em maquinas</td><td>Seiton: areas demarcadas; Seiso: maquinas inspecionadas</td></tr>
<tr><td>NR-17</td><td>Ergonomia</td><td>Seiton: organizacao ergonomica de postos de trabalho</td></tr>
<tr><td>NR-23</td><td>Protecao contra incendio</td><td>Seiton: corredores livres; Seiso: sem materiais inflamaveis soltos</td></tr>
<tr><td>NR-25</td><td>Residuos industriais</td><td>Seiri: segregacao; Seiso: controle de fontes; Seiton: armazenamento correto</td></tr>
<tr><td>NR-26</td><td>Sinalizacao de seguranca</td><td>Seiketsu: padronizacao de cores conforme norma</td></tr>
</table>

<h3>Roadmap de integracao — do 5S ao sistema de gestao integrado</h3>
<p>Para empresas que querem evoluir do 5S para programas mais abrangentes:</p>
<table>
<tr><th>Fase</th><th>Programa</th><th>Prazo tipico</th><th>Investimento estimado (PME)</th></tr>
<tr><td>1</td><td>5S (base)</td><td>3-6 meses</td><td>R$ 5.000 - R$ 20.000</td></tr>
<tr><td>2</td><td>ISO 9001:2015</td><td>8-14 meses</td><td>R$ 15.000 - R$ 50.000</td></tr>
<tr><td>3</td><td>Lean basico (5S + Kaizen + SMED)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 30.000</td></tr>
<tr><td>4</td><td>TPM (pilar manutencao autonoma)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 40.000</td></tr>
<tr><td>5</td><td>ISO 14001 / ISO 45001</td><td>8-14 meses cada</td><td>R$ 15.000 - R$ 50.000 cada</td></tr>
</table>

<div class="callout"><strong>Mensagem final:</strong> O 5S e simultaneamente o programa mais simples e o mais transformador da gestao industrial. Simples porque nao exige tecnologia, investimento alto ou conhecimento avancado. Transformador porque muda a cultura, o ambiente e os resultados de forma visivel e rapida. O segredo esta em tres palavras: <strong>metodo, lideranca e persistencia</strong>.</div>

<div class="example"><strong>Caso inspirador:</strong> Uma pequena metalurgica de Novo Hamburgo (RS), com 28 funcionarios, implantou o 5S em 2020 como primeiro projeto de gestao. Em 3 anos, o 5S levou a ISO 9001 (2021), que levou ao Lean (2022), que levou a IATF 16949 (2023). A empresa triplicou o faturamento, entrou na cadeia automotiva e recebeu premio de fornecedor destaque de um fabricante multinacional. Tudo comecou com etiquetas vermelhas e um shadow board de R$ 150.</div>
`}, 'Roadmap de integracao 5S + ISO + Lean')`;

  // ── Module 1 quiz ──
  const m1q = [
    ['Em que contexto historico surgiu o programa 5S?', ['Europa pos-Revolucao Industrial','Japao pos-Segunda Guerra Mundial','Estados Unidos nos anos 1980','Brasil nos anos 1970'], 1, 'O 5S nasceu no Japao apos a Segunda Guerra Mundial, num contexto de reconstrucao economica e necessidade de maximizar recursos.'],
    ['Qual e a traducao correta do senso Seiri?', ['Senso de limpeza','Senso de disciplina','Senso de utilizacao','Senso de padronizacao'], 2, 'Seiri e o senso de utilizacao — separar o necessario do desnecessario.'],
    ['Segundo dados apresentados, qual a reducao tipica no tempo para localizar ferramentas apos o 5S?', ['Cerca de 30%','Cerca de 50%','Cerca de 80%','Cerca de 95%'], 2, 'Os dados mostram reducao de 4,2 min para 0,8 min, ou seja, aproximadamente 81%.'],
    ['Qual e o principal erro ao implantar o 5S?', ['Investir demais em sinalizacao','Reduzi-lo a dia de faxina sem continuidade','Fazer auditorias muito frequentes','Treinar demais os operadores'], 1, 'O maior erro e tratar o 5S como faxina pontual, sem o programa de padronizacao e disciplina que sustenta os resultados.'],
    ['No diagnostico inicial, quando se deve avaliar a fabrica para obter resultados realistas?', ['Na segunda-feira de manha, apos o fim de semana','Apos avisar a equipe com 1 semana de antecedencia','Numa sexta-feira a tarde, sem aviso previo','Durante uma auditoria externa'], 2, 'Avaliar sem aviso previo, numa sexta-feira a tarde, mostra a realidade do dia a dia, nao uma area arrumada para a avaliacao.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 2 quiz ──
  const m2q = [
    ['Qual e a principal ferramenta utilizada no Seiri?', ['Shadow board','Etiqueta vermelha','Checklist de limpeza','Quadro de gestao visual'], 1, 'A etiqueta vermelha (red tag) e o metodo padrao para identificar e classificar itens questionaveis no Seiri.'],
    ['Pela regra dos 12 meses, o que fazer com um item que nao foi usado nesse periodo?', ['Manter no setor por seguranca','Transferir para o almoxarifado central','Descartar, vender ou doar','Etiquetar e aguardar mais 12 meses'], 2, 'Itens sem uso por 12 meses devem ser descartados, vendidos ou doados, salvo excecoes de pecas criticas.'],
    ['O que significa a "regra dos 30 segundos" no Seiton?', ['A limpeza de cada area deve levar 30 segundos','Qualquer item deve ser encontrado em ate 30 segundos','O setup deve ser reduzido em 30 segundos','A auditoria de cada criterio leva 30 segundos'], 1, 'No Seiton bem implantado, qualquer pessoa deve localizar qualquer item em ate 30 segundos.'],
    ['No conceito de "limpeza como inspecao" do Seiso, o que o operador faz alem de limpar?', ['Preenche relatorio de producao','Observa anomalias como vazamentos e folgas','Calibra os instrumentos de medicao','Atualiza o quadro de gestao visual'], 1, 'No Seiso industrial, ao limpar o operador inspeciona a maquina buscando vazamentos, folgas, fissuras e anomalias.'],
    ['Qual e o investimento total estimado em materiais para o Dia D de uma fabrica de 50-100 funcionarios?', ['Menos de R$ 500','Cerca de R$ 2.400','Cerca de R$ 10.000','Mais de R$ 20.000'], 1, 'O material para o Dia D (etiquetas, fita, tinta, material de limpeza, EPIs, lanche) custa aproximadamente R$ 2.360 para esse porte.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 3 quiz ──
  const m3q = [
    ['Qual e a ferramenta mais simples e eficaz do Seiketsu?', ['Checklist de 50 itens','Foto do estado padrao fixada no local','Sistema ERP de controle','App de auditoria digital'], 1, 'A foto do estado padrao e a referencia visual mais simples e eficaz — custa R$ 8-15 e qualquer pessoa pode comparar o estado atual com o padrao.'],
    ['Quanto tempo leva em media para o 5S se tornar habito (Shitsuke)?', ['3 meses','6 meses','18 a 24 meses','5 anos'], 2, 'Pesquisas mostram que o 5S leva de 18 a 24 meses para se tornar habito numa organizacao.'],
    ['Qual dos itens abaixo NAO e um dos "7 assassinos do 5S"?', ['Falta de exemplo da lideranca','Dia D sem continuidade','Auditorias muito frequentes','Programa visto como responsabilidade so da qualidade'], 2, 'Auditorias frequentes sustentam o programa. Os assassinos sao: falta de exemplo, sem continuidade, punicao sem reconhecimento, falta de tempo, rotatividade sem treinamento, sem medicao e programa "da qualidade".'],
    ['O que deve conter o quadro de gestao visual de cada setor?', ['Apenas indicadores de producao','Seguranca, qualidade, producao, 5S, pessoas e acoes','Apenas fotos de antes e depois do 5S','Apenas o checklist diario de limpeza'], 1, 'O quadro completo integra seguranca, qualidade, producao, 5S, pessoas e plano de acoes pendentes.'],
    ['Qual estrategia de reconhecimento e citada como altamente eficaz e de custo quase zero?', ['Bonus salarial mensal','Area destaque do mes com trofeu simbolico','Viagem de premiacoes','Promocao de cargo'], 1, 'Um trofeu ou selo simbolico que fica exposto na area vencedora ate a proxima avaliacao tem custo zero e impacto significativo na motivacao.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 4 quiz ──
  const m4q = [
    ['Qual e a frequencia de auditoria recomendada nos primeiros 3 meses do programa 5S?', ['Diaria','Semanal','Mensal','Trimestral'], 1, 'Nos primeiros 3 meses, a auditoria deve ser semanal para reforcar o padrao e corrigir desvios rapidamente.'],
    ['O que e uma auditoria cruzada no contexto do 5S?', ['Auditoria feita por empresa externa','O lider de um setor audita outro setor','Auditoria que avalia dois programas simultaneamente','Auditoria feita por dois auditores ao mesmo tempo'], 1, 'Na auditoria cruzada, lideres de diferentes setores auditam as areas uns dos outros, trazendo olhar externo e disseminando boas praticas.'],
    ['Qual ferramenta e recomendada para analisar a causa raiz de desvios encontrados na auditoria 5S?', ['Diagrama de Gantt','5 Por ques','Analise SWOT','Balanced Scorecard'], 1, 'A tecnica dos 5 Por ques permite ir alem do sintoma e encontrar a causa raiz do desvio de forma simples e eficaz.'],
    ['Qual clausula da ISO 9001 e diretamente facilitada pelo Seiton (identificacao e rastreabilidade)?', ['4.1','7.1.3','8.5.2','10.2'], 2, 'A clausula 8.5.2 trata de identificacao e rastreabilidade, que e diretamente apoiada pelo sistema de enderecamento e etiquetagem do Seiton.'],
    ['Na integracao 5S + TPM, qual senso equivale a manutencao autonoma?', ['Seiri','Seiton','Seiso','Seiketsu'], 2, 'Seiso (limpeza como inspecao) e a essencia da manutencao autonoma do TPM — o operador limpa e ao mesmo tempo inspeciona a maquina.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (20 questions, is_final: true) ──
  const finalQ = [
    ['O programa 5S surgiu em qual pais e decada?', ['EUA, anos 1950','Japao, anos 1950','Alemanha, anos 1960','Brasil, anos 1990'], 1, 'O 5S nasceu no Japao pos-Segunda Guerra Mundial (decada de 1950), num contexto de reconstrucao industrial.'],
    ['Qual a sequencia correta dos 5 sensos?', ['Seiri, Seiso, Seiton, Seiketsu, Shitsuke','Seiton, Seiri, Seiso, Shitsuke, Seiketsu','Seiri, Seiton, Seiso, Seiketsu, Shitsuke','Seiso, Seiri, Seiton, Shitsuke, Seiketsu'], 2, 'A sequencia correta e: Seiri (utilizacao), Seiton (organizacao), Seiso (limpeza), Seiketsu (padronizacao), Shitsuke (disciplina).'],
    ['Qual e o ROI tipico do 5S no primeiro ano, conforme o caso da metalurgica de Joinville apresentado?', ['1,5x','3x','5,3x','10x'], 2, 'A metalurgica de Joinville investiu R$ 18.000 e obteve R$ 95.000 em economia de pecas rejeitadas — ROI de 5,3x.'],
    ['No checklist de diagnostico inicial, uma nota de 32% classifica a area como:', ['Critica','Insuficiente','Regular','Boa'], 1, 'A faixa de 21-40% e classificada como "Insuficiente", exigindo implantacao estruturada em 90 dias.'],
    ['Qual e o prazo padrao da "area de quarentena" na tecnica da etiqueta vermelha?', ['7 dias','15 dias','30 dias','60 dias'], 2, 'Itens etiquetados ficam na area de quarentena por 30 dias. Se ninguem reclamar, sao descartados ou realocados.'],
    ['Segundo a NBR 7195, qual cor e padrao para demarcacao de corredores de circulacao?', ['Branco','Verde','Amarelo','Azul'], 2, 'A cor amarela e usada para corredores de circulacao e areas de atencao conforme a norma brasileira.'],
    ['O conceito de "limpeza como inspecao" do Seiso tem origem em qual metodologia?', ['ISO 9001','Lean Manufacturing','TPM (Total Productive Maintenance)','Six Sigma'], 2, 'O conceito de limpeza como inspecao vem diretamente do pilar de manutencao autonoma do TPM.'],
    ['Qual o custo medio de um shadow board feito internamente?', ['R$ 20 a R$ 50','R$ 80 a R$ 200','R$ 500 a R$ 1.000','R$ 2.000 a R$ 5.000'], 1, 'Um shadow board feito com MDF, tinta e ganchos custa entre R$ 80 e R$ 200 com mao de obra interna.'],
    ['No Dia D, qual e a atividade que deve acontecer ANTES de qualquer outra?', ['Limpeza profunda','Fotografar o estado atual (antes)','Organizar as ferramentas','Pintar o chao'], 1, 'Fotografar o "antes" e essencial e deve ser feito antes de qualquer atividade, pois a comparacao antes/depois e a ferramenta mais poderosa de motivacao.'],
    ['Qual e o custo medio de uma foto do estado padrao (A3 plastificada)?', ['R$ 1 a R$ 3','R$ 8 a R$ 15','R$ 50 a R$ 80','R$ 100 a R$ 200'], 1, 'Impressao A3 colorida + plastificacao custa entre R$ 8 e R$ 15 por unidade.'],
    ['Em quanto tempo o 5S tipicamente se torna habito organizacional?', ['1 a 3 meses','6 a 12 meses','18 a 24 meses','3 a 5 anos'], 2, 'Pesquisas indicam que o 5S leva de 18 a 24 meses para se tornar habito. Nos primeiros 6 meses e esforco consciente.'],
    ['Qual e o fator mais critico para a sustentacao do programa 5S?', ['Investimento em tecnologia','Exemplo e envolvimento da lideranca','Contratacao de consultoria externa','Implantacao de app de auditoria'], 1, 'A lideranca pelo exemplo e o fator mais critico. Onde a lideranca pratica o 5S, o programa funciona; onde nao pratica, morre.'],
    ['Na auditoria 5S, uma nota consistentemente acima de 95% pode indicar:', ['Excelencia maxima do programa','Auditoria branda (complacencia)','Necessidade de suspender auditorias','Que o programa pode ser encerrado'], 1, 'Notas constantemente acima de 95% podem indicar complacencia na auditoria. O ideal e sempre haver oportunidades de melhoria identificadas.'],
    ['A tecnica dos 5 Por ques serve para:', ['Definir os 5 sensos do programa','Realizar analise de causa raiz de desvios','Pontuar a auditoria de 5S','Classificar itens para etiqueta vermelha'], 1, 'Os 5 Por ques sao uma tecnica de analise de causa raiz que permite ir alem do sintoma superficial.'],
    ['Qual clausula da ISO 9001:2015 o 5S ajuda a atender ao criar um ambiente fisico adequado?', ['4.1 — Contexto da organizacao','7.1.4 — Ambiente para operacao de processos','8.1 — Planejamento operacional','9.1 — Monitoramento'], 1, 'A clausula 7.1.4 exige que a organizacao proporcione ambiente adequado para a operacao, o que o 5S atende diretamente.'],
    ['No Lean Manufacturing, o 5S e considerado:', ['Uma ferramenta complementar opcional','A fundacao da casa Toyota','Um substituto do Kaizen','Uma alternativa ao Kanban'], 1, 'No Sistema Toyota de Producao, o 5S e a fundacao sobre a qual todas as outras ferramentas Lean se apoiam.'],
    ['Segundo a pesquisa do SENAI-PR citada, qual percentual de industrias que mantiveram auditorias regulares conseguiu se recuperar de regressoes no 5S?', ['50%','75%','90%','100%'], 3, 'Das empresas que se recuperaram de regressoes, 100% tinham sistema de auditoria ativo, versus apenas 15% das que nao se recuperaram.'],
    ['Qual e a sequencia recomendada de implantacao apos o 5S no roadmap de melhoria?', ['TPM, depois ISO 9001, depois Lean','ISO 9001, depois Lean basico, depois TPM','Lean, depois TPM, depois ISO 9001','ISO 14001, depois ISO 9001, depois Lean'], 1, 'O roadmap recomendado e: 5S → ISO 9001 → Lean basico → TPM → ISO 14001/45001.'],
    ['Qual e o investimento tipico para implantar 5S numa pequena industria (20-99 funcionarios)?', ['R$ 500 a R$ 2.000','R$ 5.000 a R$ 20.000','R$ 50.000 a R$ 100.000','R$ 200.000 ou mais'], 1, 'Para pequenas industrias, o investimento tipico fica entre R$ 5.000 e R$ 20.000, incluindo estantes, shadow boards, sinalizacao e consultoria pontual.'],
    ['No caso da metalurgica de Novo Hamburgo citada, qual foi o primeiro programa implantado que desencadeou toda a evolucao da empresa?', ['ISO 9001','Lean Manufacturing','5S','IATF 16949'], 2, 'A empresa comecou com o 5S em 2020, que levou a ISO 9001, depois Lean e finalmente IATF 16949, triplicando o faturamento em 3 anos.'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
