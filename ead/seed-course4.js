export async function seedCourse4(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      '5s-pratica-industrial',
      '5S na Prática Industrial',
      'Implante o programa 5S na sua fábrica com método, ferramentas e resultados mensuráveis.',
      'Curso 100% prático de 5S para ambiente industrial: cada senso explicado com exemplos reais, templates de implantação, auditorias de manutenção e estratégias para sustentar o programa a longo prazo.',
      '6 horas',
      197, 347,
      'Supervisores, líderes de produção, operadores, analistas, empresários',
      'Nenhum',
      'Capacitar o profissional a implantar e sustentar o programa 5S no ambiente industrial, com método prático e resultados mensuráveis.',
      4
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos do 5S ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos do 5S', 'Origem, conceitos, benefícios e diagnóstico inicial do programa 5S', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-origem-historia-5s', 'Origem e história do 5S (do Japão ao Brasil)', '20 min', 1, ${`
<h2>Origem e história do 5S</h2>
<p>O programa 5S é uma das metodologias mais conhecidas e aplicadas no mundo industrial. Nasceu no <strong>Japão pós-Segunda Guerra Mundial</strong>, num contexto de reconstrução econômica em que cada recurso — material, espaço e tempo — precisava ser aproveitado ao máximo. O 5S não surgiu como teoria acadêmica: nasceu no <strong>chão de fábrica</strong>, criado por quem precisava resolver problemas reais de desorganização, desperdício e falta de padronização.</p>

<div class="diagram">
  <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr1" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#c5383c"/></marker>
    </defs>
    <circle cx="210" cy="130" r="45" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="210" y="126" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">5S</text>
    <text x="210" y="140" text-anchor="middle" fill="#eab308" font-size="9">Base da</text>
    <text x="210" y="151" text-anchor="middle" fill="#eab308" font-size="9">Melhoria</text>
    <!-- Seiri -->
    <circle cx="210" cy="30" r="28" fill="#c5383c" opacity="0.9"/>
    <text x="210" y="27" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEIRI</text>
    <text x="210" y="39" text-anchor="middle" fill="#fff" font-size="7">Utilização</text>
    <line x1="210" y1="58" x2="210" y2="83" stroke="#c5383c" stroke-width="2" marker-end="url(#arr1)"/>
    <!-- Seiton -->
    <circle cx="380" cy="90" r="28" fill="#2563eb" opacity="0.9"/>
    <text x="380" y="87" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEITON</text>
    <text x="380" y="99" text-anchor="middle" fill="#fff" font-size="7">Organização</text>
    <line x1="354" y1="100" x2="258" y2="120" stroke="#2563eb" stroke-width="2" marker-end="url(#arr1)"/>
    <!-- Seiso -->
    <circle cx="340" cy="210" r="28" fill="#16a34a" opacity="0.9"/>
    <text x="340" y="207" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEISO</text>
    <text x="340" y="219" text-anchor="middle" fill="#fff" font-size="7">Limpeza</text>
    <line x1="316" y1="196" x2="242" y2="158" stroke="#16a34a" stroke-width="2" marker-end="url(#arr1)"/>
    <!-- Seiketsu -->
    <circle cx="80" cy="210" r="28" fill="#eab308" opacity="0.9"/>
    <text x="80" y="207" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">SEIKETSU</text>
    <text x="80" y="219" text-anchor="middle" fill="#0b1730" font-size="7">Padronização</text>
    <line x1="104" y1="196" x2="178" y2="158" stroke="#eab308" stroke-width="2" marker-end="url(#arr1)"/>
    <!-- Shitsuke -->
    <circle cx="40" cy="90" r="28" fill="#c5383c" opacity="0.7"/>
    <text x="40" y="87" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">SHITSUKE</text>
    <text x="40" y="99" text-anchor="middle" fill="#fff" font-size="7">Disciplina</text>
    <line x1="66" y1="100" x2="162" y2="120" stroke="#c5383c" stroke-width="2" marker-end="url(#arr1)"/>
  </svg>
  <figcaption>Os 5 sensos e sua conexão com a base de melhoria contínua</figcaption>
</div>

<h3>O contexto japonês</h3>
<p>Após 1945, o Japão estava devastado. A indústria precisava produzir mais com menos. Engenheiros e gestores japoneses, com forte influência dos consultores americanos W. Edwards Deming e Joseph Juran, desenvolveram sistemas de gestão que valorizavam a <strong>ordem, a limpeza e a disciplina</strong> como base para qualquer melhoria. O 5S foi uma das primeiras ferramentas adotadas em larga escala por empresas como Toyota, Honda e Matsushita (atual Panasonic).</p>

<div class="callout"><strong>Curiosidade:</strong> No Japão, o conceito de manter o ambiente limpo e organizado tem raízes culturais profundas. Nas escolas japonesas, os próprios alunos limpam as salas de aula. O 5S industrial apenas sistematizou algo que já era valor cultural.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Em 1948, a Toyota Motor Corporation começou a implementar o que chamava de "housekeeping industrial". Taiichi Ohno, engenheiro-chefe, costumava dizer: "Comece limpando. Quando o chão estiver limpo, os problemas aparecerão sozinhos." Essa frase simples resume a essência do 5S: organização e limpeza não são fins em si mesmos — são ferramentas para tornar problemas visíveis.</p>
</div>

<h3>Os 5 sensos — origem do nome</h3>
<p>O nome "5S" vem de cinco palavras japonesas que começam com a letra S:</p>
<table>
<tr><th>Japonês</th><th>Tradução livre</th><th>Senso (adaptação brasileira)</th></tr>
<tr><td>Seiri</td><td>Separar, classificar</td><td>Senso de utilização</td></tr>
<tr><td>Seiton</td><td>Ordenar, organizar</td><td>Senso de organização</td></tr>
<tr><td>Seiso</td><td>Limpar, inspecionar</td><td>Senso de limpeza</td></tr>
<tr><td>Seiketsu</td><td>Padronizar, saúde</td><td>Senso de padronização</td></tr>
<tr><td>Shitsuke</td><td>Disciplina, educação</td><td>Senso de disciplina</td></tr>
</table>

<h3>A chegada ao Brasil</h3>
<p>O 5S chegou ao Brasil no início dos anos 1990, trazido principalmente por empresas japonesas instaladas no país (como Toyota em Indaiatuba-SP e Honda em Sumaré-SP) e por programas de qualidade total incentivados pela abertura econômica do governo Collor. Naquela época, a indústria brasileira precisava se modernizar rapidamente para competir com produtos importados.</p>

<div class="example"><strong>Marco histórico:</strong> A Fundação Christiano Ottoni (UFMG) foi uma das pioneiras na disseminação do 5S no Brasil, publicando materiais em português e realizando treinamentos em indústrias de Minas Gerais, São Paulo e Paraná a partir de 1991. Muitas metalúrgicas da região do ABC Paulista e do polo industrial de Betim (MG) adotaram o 5S como primeiro passo para a certificação ISO 9001.</div>

<h3>Evolução do 5S na indústria brasileira</h3>
<p>A trajetória do 5S no Brasil pode ser dividida em fases:</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Anos 1990 — Introdução</strong><br>Focado em "limpeza e organização". Muitas empresas fizeram o "Dia da Limpeza" e pararam por aí.</div></div>
  <div class="step-item"><div class="step-content"><strong>Anos 2000 — Integração</strong><br>Conexão com sistemas de gestão (ISO 9001, ISO 14001). O 5S passou a ser base para programas mais robustos.</div></div>
  <div class="step-item"><div class="step-content"><strong>Anos 2010 — Lean</strong><br>Pré-requisito para TPM, Kaizen e produção enxuta. O 5S se tornou a fundação do Lean Manufacturing.</div></div>
  <div class="step-item"><div class="step-content"><strong>Anos 2020+ — Digital</strong><br>Apps para auditorias, fotos antes/depois com geolocalização, dashboards de indicadores em tempo real.</div></div>
</div>

<h3>Por que o 5S contínua relevante</h3>
<p>Mesmo após mais de 70 anos, o 5S contínua sendo a <strong>porta de entrada</strong> para qualquer programa de melhoria. A razão é simples: não adianta implantar Lean, Six Sigma ou Indústria 4.0 num ambiente sujo, desorganizado e sem padrão. O 5S cria a <strong>fundação cultural e física</strong> sobre a qual outros programas podem prosperar.</p>

<div class="callout"><strong>Dado real:</strong> Segundo pesquisa do SEBRAE (2022), 78% das pequenas e médias indústrias que implantaram o 5S de forma estruturada relataram redução de pelo menos 15% no tempo de setup de máquinas nos primeiros 6 meses. O investimento médio foi de R$ 2.500 a R$ 8.000 (principalmente em sinalização, estantes e treinamento).</div>

<h3>5S não é faxina</h3>
<p>O maior erro na implantação do 5S é reduzi-lo a "dia de limpeza". O 5S é um <strong>programa de mudança de comportamento</strong>. A limpeza e a organização são consequências — o verdadeiro objetivo é criar uma cultura de <strong>cuidado com o ambiente, respeito ao padrão e melhoria contínua</strong>. Quando tratado apenas como faxina, o programa morre em 3 meses.</p>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> 5S como faxina</h4><ul><li>Evento pontual ("Dia da Limpeza")</li><li>Resultados duram 2-3 semanas</li><li>Equipe vê como obrigação chata</li><li>Sem medição, sem padrão</li><li>Morre em 3 meses</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> 5S como programa</h4><ul><li>Mudança cultural contínua</li><li>Resultados sustentáveis por anos</li><li>Equipe engajada e orgulhosa</li><li>Auditorias, KPIs, reconhecimento</li><li>Base para Lean, TPM, ISO</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O 5S nasceu no chão de fábrica japonês pós-guerra." data-fb-nok="Incorreto. O 5S surgiu no Japão pós-Segunda Guerra Mundial.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Em que contexto histórico o programa 5S foi criado?</div>
  <button class="qi-option" data-key="a">Na Revolução Industrial europeia do século XIX</button>
  <button class="qi-option" data-key="b">No Japão pós-Segunda Guerra Mundial</button>
  <button class="qi-option" data-key="c">Nos EUA durante os anos 1980</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> O 5S é a única ferramenta de gestão que gera resultados visíveis em horas (Dia D), mensuráveis em semanas (auditorias) e culturais em meses (disciplina). Por isso é sempre o primeiro passo — e nunca o último.</div></div>
`}, NULL),

  (${m1.id}, '1-2-cinco-sensos-explicados', 'Os 5 sensos explicados: Seiri, Seiton, Seiso, Seiketsu, Shitsuke', '25 min', 2, ${`
<h2>Os 5 sensos explicados</h2>
<p>Cada um dos 5 sensos tem um propósito específico é uma lógica de sequência. Não se implanta o 5S de forma aleatória — os três primeiros sensos (Seiri, Seiton, Seiso) são de <strong>ação física</strong>, enquanto os dois últimos (Seiketsu, Shitsuke) são de <strong>manutenção e cultura</strong>. Entender cada senso em profundidade é fundamental antes de ir para a prática.</p>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#c5383c"/></marker>
    </defs>
    <!-- Ação física -->
    <rect x="10" y="10" width="250" height="75" rx="8" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="135" y="28" text-anchor="middle" fill="#2563eb" font-size="9" font-weight="bold">AÇÃO FÍSICA (fazer)</text>
    <rect x="20" y="40" width="70" height="38" rx="6" fill="#c5383c"/>
    <text x="55" y="57" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEIRI</text>
    <text x="55" y="69" text-anchor="middle" fill="#fff" font-size="7">Utilizar</text>
    <line x1="90" y1="59" x2="105" y2="59" stroke="#c5383c" stroke-width="2" marker-end="url(#arr2)"/>
    <rect x="107" y="40" width="70" height="38" rx="6" fill="#2563eb"/>
    <text x="142" y="57" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEITON</text>
    <text x="142" y="69" text-anchor="middle" fill="#fff" font-size="7">Organizar</text>
    <line x1="177" y1="59" x2="192" y2="59" stroke="#c5383c" stroke-width="2" marker-end="url(#arr2)"/>
    <rect x="194" y="40" width="60" height="38" rx="6" fill="#16a34a"/>
    <text x="224" y="57" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEISO</text>
    <text x="224" y="69" text-anchor="middle" fill="#fff" font-size="7">Limpar</text>
    <!-- Manutenção e cultura -->
    <rect x="275" y="10" width="140" height="75" rx="8" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="345" y="28" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">CULTURA (manter)</text>
    <rect x="282" y="40" width="60" height="38" rx="6" fill="#eab308"/>
    <text x="312" y="55" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">SEIKETSU</text>
    <text x="312" y="67" text-anchor="middle" fill="#0b1730" font-size="7">Padronizar</text>
    <rect x="350" y="40" width="60" height="38" rx="6" fill="#c5383c" opacity="0.8"/>
    <text x="380" y="55" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">SHITSUKE</text>
    <text x="380" y="67" text-anchor="middle" fill="#fff" font-size="7">Disciplina</text>
    <line x1="254" y1="59" x2="280" y2="59" stroke="#eab308" stroke-width="2" marker-end="url(#arr2)"/>
    <!-- Seta retorno -->
    <path d="M380 82 L380 140 L55 140 L55 82" fill="none" stroke="#c5383c" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr2)"/>
    <text x="210" y="158" text-anchor="middle" fill="#c5383c" font-size="9">Ciclo contínuo de melhoria</text>
  </svg>
  <figcaption>Os 5 sensos: 3 de ação física + 2 de sustentação cultural, em ciclo contínuo</figcaption>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Seiri</button><button class="tab-btn">Seiton</button><button class="tab-btn">Seiso</button><button class="tab-btn">Seiketsu</button><button class="tab-btn">Shitsuke</button></div>
  <div class="tab-panel active"><p><strong>Seiri (Utilização)</strong> — Separar o necessário do desnecessário. Ferramenta principal: etiqueta vermelha. Resultado: espaço liberado e menos desperdício.</p></div>
  <div class="tab-panel"><p><strong>Seiton (Organização)</strong> — Um lugar para cada coisa. Ferramentas: shadow boards, sinalização de chão, endereçamento. Resultado: encontrar qualquer item em 30 segundos.</p></div>
  <div class="tab-panel"><p><strong>Seiso (Limpeza)</strong> — Limpeza como inspeção. Ferramentas: checklist de limpeza, rotina de 5 minutos. Resultado: anomalias detectadas antes de virarem quebras.</p></div>
  <div class="tab-panel"><p><strong>Seiketsu (Padronização)</strong> — Manter os 3 primeiros S com padrões visuais. Ferramentas: foto do estado padrão, checklist diário. Resultado: sustentabilidade do programa.</p></div>
  <div class="tab-panel"><p><strong>Shitsuke (Disciplina)</strong> — Criar hábito e cultura. Ferramentas: auditoria, reconhecimento, exemplo da liderança. Resultado: 5S vira parte do DNA da empresa.</p></div>
</div>

<h3>1. Seiri — Senso de utilização</h3>
<p>O primeiro senso é sobre <strong>separar o necessário do desnecessário</strong>. No ambiente industrial, isso significa passar por cada área de trabalho e questionar: "Este item é necessário aqui? Com que frequência é usado?"</p>
<ul>
<li><strong>O que manter:</strong> Ferramentas, materiais e documentos usados com frequência (diária ou semanal)</li>
<li><strong>O que realocar:</strong> Itens usados raramente (mensal ou menos) — guardar em almoxarifado central</li>
<li><strong>O que descartar:</strong> Itens quebrados, obsoletos, em duplicata ou sem função definida</li>
</ul>

<div class="example"><strong>Exemplo real:</strong> Numa metalúrgica de Caxias do Sul (RS), ao aplicar o Seiri no setor de ferramentaria, foram encontradas 340 ferramentas. Após a classificação, 95 foram descartadas (quebradas ou obsoletas), 80 foram realocadas para o almoxarifado central, e 165 permaneceram no setor. O tempo médio para localizar uma ferramenta caiu de 4,5 minutos para 45 segundos.</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">340</div><div class="kpi-label">Ferramentas encontradas</div></div>
  <div class="kpi-card"><div class="kpi-value">95</div><div class="kpi-label">Descartadas</div></div>
  <div class="kpi-card"><div class="kpi-value">80</div><div class="kpi-label">Realocadas</div></div>
  <div class="kpi-card"><div class="kpi-value">45s</div><div class="kpi-label">Novo tempo de busca</div></div>
</div>

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
<p>Seiso vai muito além de varrer o chão. No contexto industrial, <strong>limpeza é inspeção</strong>. Ao limpar uma máquina, o operador observa vazamentos, folgas, fissuras e anomalias que poderiam passar despercebidas. O Seiso conecta o 5S com a <strong>manutenção autônoma</strong> do TPM (Total Productive Maintenance).</p>
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

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Numa fábrica de componentes plásticos em Manaus (AM), o programa 5S foi implantado três vezes. As duas primeiras vezes, morreu em menos de 4 meses. Na terceira, o diretor decidiu participar pessoalmente das auditorias semanais e manter sua própria sala como referência. Dois anos depois, a empresa conquistou a ISO 9001 e credita ao 5S sustentado pelo exemplo a mudança cultural que tornou isso possível.</p>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Os 3 primeiros sensos são de ação física e os 2 últimos de manutenção cultural." data-fb-nok="Incorreto. Seiri, Seiton e Seiso são de ação física; Seiketsu e Shitsuke sustentam a cultura.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual a divisão correta dos 5 sensos?</div>
  <button class="qi-option" data-key="a">Todos os 5 são de ação física</button>
  <button class="qi-option" data-key="b">4 de ação + 1 de cultura</button>
  <button class="qi-option" data-key="c">3 de ação física (Seiri, Seiton, Seiso) + 2 de cultura (Seiketsu, Shitsuke)</button>
  <div class="qi-feedback"></div>
</div>
`}, 'Resumo visual dos 5 sensos (pôster para impressão)'),

  (${m1.id}, '1-3-beneficios-5s-números-reais', 'Benefícios do 5S com números reais', '20 min', 3, ${`
<h2>Benefícios do 5S com números reais</h2>
<p>Um dos maiores desafios ao implantar o 5S é convencer a liderança e os operadores de que o programa vale o investimento de tempo e dinheiro. Nesta aula, vamos apresentar <strong>dados concretos e casos reais</strong> de indústrias brasileiras que mediram os resultados do 5S.</p>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">-38%</div><div class="kpi-label">Tempo de setup</div></div>
  <div class="kpi-card"><div class="kpi-value">-81%</div><div class="kpi-label">Tempo busca ferramenta</div></div>
  <div class="kpi-card"><div class="kpi-value">-67%</div><div class="kpi-label">Acidentes/ano</div></div>
  <div class="kpi-card"><div class="kpi-value">+22%</div><div class="kpi-label">Área útil recuperada</div></div>
</div>

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
<p>Empresa de 120 funcionários, fabricante de peças estampadas para o setor automotivo. Implantou o 5S em 2021 como pré-requisito para a certificação IATF 16949.</p>
<ul>
<li><strong>Investimento:</strong> R$ 18.000 (sinalização, estantes, treinamento, shadow boards)</li>
<li><strong>Resultado em 12 meses:</strong> Redução de 42% nas paradas não planejadas, economia de R$ 95.000 em peças rejeitadas, área de produção ampliada em 35 m2 sem obra</li>
<li><strong>ROI:</strong> R$ 95.000 / R$ 18.000 = 5,3x no primeiro ano</li>
</ul>

<div class="diagram">
  <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
    <!-- ROI bar comparison -->
    <text x="10" y="20" fill="#fff" font-size="11" font-weight="bold">ROI do 5S — Investimento vs. Retorno</text>
    <!-- Investimento -->
    <rect x="10" y="40" width="72" height="30" rx="4" fill="#c5383c"/>
    <text x="46" y="59" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">R$ 18k</text>
    <text x="90" y="59" fill="#aaa" font-size="9">Investimento</text>
    <!-- Retorno -->
    <rect x="10" y="80" width="380" height="30" rx="4" fill="#16a34a"/>
    <text x="200" y="99" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">R$ 95k economia</text>
    <text x="200" y="130" text-anchor="middle" fill="#eab308" font-size="13" font-weight="bold">ROI = 5,3x no primeiro ano</text>
  </svg>
  <figcaption>Caso da metalúrgica de Joinville: retorno 5,3 vezes superior ao investimento</figcaption>
</div>

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

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Carlos, supervisor de produção numa fábrica de autopeças em Sorocaba (SP), era cético com o 5S: "Achava que era modinha de consultor." Após 6 meses, ele mediu: a equipe dele economizava 3h20min por turno em tempo de busca de ferramentas e materiais. "Isso se traduz em 680 horas/ano. Com nosso custo hora, dá mais de R$ 40.000/ano economizados só no meu setor."</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O ROI da metalúrgica de Joinville foi de 5,3 vezes o investimento." data-fb-nok="Incorreto. O ROI apresentado foi de 5,3x (R$ 95k de retorno sobre R$ 18k de investimento).">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">No caso da metalúrgica de Joinville, qual foi o ROI do 5S no primeiro ano?</div>
  <button class="qi-option" data-key="a">2x o investimento</button>
  <button class="qi-option" data-key="b">5,3x o investimento</button>
  <button class="qi-option" data-key="c">10x o investimento</button>
  <div class="qi-feedback"></div>
</div>

<h3>Quanto custa implantar o 5S?</h3>
<table>
<tr><th>Porte da empresa</th><th>Investimento típico</th><th>Inclui</th></tr>
<tr><td>Micro (até 20 func.)</td><td>R$ 2.000 a R$ 5.000</td><td>Sinalização básica, treinamento interno</td></tr>
<tr><td>Pequena (20-99 func.)</td><td>R$ 5.000 a R$ 20.000</td><td>Estantes, shadow boards, sinalização completa, consultoria pontual</td></tr>
<tr><td>Média (100-499 func.)</td><td>R$ 20.000 a R$ 80.000</td><td>Projeto completo com consultoria, mobiliário industrial, sistema de auditoria</td></tr>
<tr><td>Grande (500+ func.)</td><td>R$ 80.000 a R$ 300.000</td><td>Programa corporativo com multiplicadores, app de auditoria, premiação</td></tr>
</table>

<div class="callout"><strong>Conclusão:</strong> O 5S tem um dos melhores ROIs entre todas as ferramentas de gestão industrial. Com investimento baixo (comparado a automação ou novos equipamentos), gera resultados rápidos e visíveis. O único recurso realmente caro é o <strong>tempo da liderança</strong> — e esse é inegociável.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> O 5S é provavelmente a única ferramenta de gestão em que o investimento inicial pode ser inferior a R$ 5.000 (para micro e pequenas empresas) e ainda assim gerar retorno mensurável em 3 meses. A chave não é dinheiro — é liderança e disciplina.</div></div>
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
<tr><td>81-100%</td><td>Excelente</td><td>Manter com auditorias. Buscar integração com TPM/Lean.</td></tr>
</table>

<h3>Passo a passo do diagnóstico</h3>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Defina as áreas</strong><br>Liste todas as áreas: produção, almoxarifado, escritório, refeitório, vestiário, área externa.</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Escolha os avaliadores</strong><br>Mínimo 2 pessoas por área. Inclua alguém de fora da área (olhar externo é mais crítico).</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Fotografe tudo</strong><br>Fotos sistemáticas de cada área — o "antes" para comparação futura. Use sempre o mesmo ângulo.</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Aplique o checklist</strong><br>Cada avaliador pontua independentemente. Use a média das notas.</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Consolide resultados</strong><br>Quadro com nota de cada área e senso. Isso mostra onde atacar primeiro.</div></div>
  <div class="step-item"><div class="step-content"><strong>6. Apresente à direção</strong><br>Use as fotos e os números para justificar o investimento no programa.</div></div>
</div>

<div class="example"><strong>Exemplo prático:</strong> Uma indústria alimentícia de Lajeado (RS) fez o diagnóstico em 8 áreas. Resultado médio: 32% (insuficiente). A área mais crítica foi o almoxarifado de embalagens (18%), e a menos crítica foi o escritório administrativo (55%). A direção aprovou o programa ao ver as fotos do almoxarifado — itens empilhados sem identificação, embalagens vencidas misturadas com novas, corredores bloqueados.</div>

<div class="diagram">
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Diagnóstico por área — exemplo real</text>
    <!-- Bars -->
    <rect x="30" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="30" y="138" width="36" height="27" rx="3" fill="#c5383c"/>
    <text x="48" y="155" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">18%</text>
    <text x="48" y="180" text-anchor="middle" fill="#aaa" font-size="7">Almox.</text>

    <rect x="80" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="80" y="130" width="36" height="35" rx="3" fill="#c5383c"/>
    <text x="98" y="152" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">25%</text>
    <text x="98" y="180" text-anchor="middle" fill="#aaa" font-size="7">Prod. A</text>

    <rect x="130" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="130" y="126" width="36" height="39" rx="3" fill="#c5383c"/>
    <text x="148" y="150" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">28%</text>
    <text x="148" y="180" text-anchor="middle" fill="#aaa" font-size="7">Prod. B</text>

    <rect x="180" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="180" y="122" width="36" height="43" rx="3" fill="#eab308"/>
    <text x="198" y="148" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">30%</text>
    <text x="198" y="180" text-anchor="middle" fill="#aaa" font-size="7">Manutenção</text>

    <rect x="230" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="230" y="113" width="36" height="52" rx="3" fill="#eab308"/>
    <text x="248" y="143" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">35%</text>
    <text x="248" y="180" text-anchor="middle" fill="#aaa" font-size="7">Expedição</text>

    <rect x="280" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="280" y="109" width="36" height="56" rx="3" fill="#eab308"/>
    <text x="298" y="141" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">38%</text>
    <text x="298" y="180" text-anchor="middle" fill="#aaa" font-size="7">Refeitório</text>

    <rect x="330" y="35" width="36" height="130" rx="3" fill="#333" stroke="#555" stroke-width="0.5"/>
    <rect x="330" y="96" width="36" height="69" rx="3" fill="#16a34a"/>
    <text x="348" y="135" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">55%</text>
    <text x="348" y="180" text-anchor="middle" fill="#aaa" font-size="7">Escritório</text>

    <!-- Média line -->
    <line x1="25" y1="123" x2="371" y2="123" stroke="#eab308" stroke-width="1.5" stroke-dasharray="5,3"/>
    <text x="380" y="127" fill="#eab308" font-size="8">32% média</text>
  </svg>
  <figcaption>Exemplo de diagnóstico: indústria alimentícia de Lajeado (RS) — 8 áreas avaliadas</figcaption>
</div>

<h3>Erros comuns no diagnóstico</h3>
<ul>
<li><strong>Avaliar com condescendência:</strong> Dar nota 3 quando é 1 para "não ofender" a equipe. O diagnóstico precisa ser honesto.</li>
<li><strong>Não fotografar:</strong> Sem fotos, não há evidência. É a comparação antes/depois é a ferramenta mais poderosa de motivação.</li>
<li><strong>Avaliar só a produção:</strong> Escritórios, refeitório, vestiário e área externa também precisam de 5S.</li>
<li><strong>Pular o diagnóstico:</strong> Ir direto para o "Dia D" sem medir o ponto de partida impede que você comprove a melhoria depois.</li>
</ul>

<div class="callout"><strong>Dica de ouro:</strong> Faça o diagnóstico numa sexta-feira à tarde, quando a fábrica está no "modo automático" e ninguém se preparou para ser avaliado. Isso mostra a realidade. Se avisar com antecedência, todo mundo vai arrumar na véspera — e você não medirá o dia a dia real.</div>

<ul class="checklist">
  <li><span class="ck-box"></span>Listar todas as áreas da fábrica (incluindo refeitório, vestiário, área externa)</li>
  <li><span class="ck-box"></span>Definir avaliadores (mínimo 2 por área, incluir olhar externo)</li>
  <li><span class="ck-box"></span>Preparar câmera/celular para fotos do "antes"</li>
  <li><span class="ck-box"></span>Imprimir checklists de diagnóstico para todas as áreas</li>
  <li><span class="ck-box"></span>Agendar sem aviso prévio (sexta-feira à tarde, idealmente)</li>
  <li><span class="ck-box"></span>Consolidar notas por área e por senso em planilha</li>
  <li><span class="ck-box"></span>Montar apresentação com fotos + números para a direção</li>
</ul>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Fotografar o antes é essencial para comprovar a evolução depois." data-fb-nok="Incorreto. As fotos do estado atual são a evidência mais poderosa para comparação futura.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é a ferramenta mais poderosa de motivação no diagnóstico do 5S?</div>
  <button class="qi-option" data-key="a">Fotos de antes/depois para comparação visual</button>
  <button class="qi-option" data-key="b">Planilha com indicadores numéricos</button>
  <button class="qi-option" data-key="c">Relatório escrito para a diretoria</button>
  <div class="qi-feedback"></div>
</div>
`}, 'Checklist de diagnóstico 5S (modelo completo)')`;

  // ── Module 2: Implantação dos 3 Primeiros S ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Implantação dos 3 Primeiros S', 'Seiri, Seiton é Seiso na prática industrial com ferramentas e templates', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-1-seiri-etiqueta-vermelha', 'Seiri na prática: etiqueta vermelha e critérios de descarte', '25 min', 1, ${`
<h2>Seiri na prática: etiqueta vermelha e critérios de descarte</h2>
<p>O Seiri (senso de utilização) é o primeiro passo concreto da implantação. Seu objetivo é simples e poderoso: <strong>eliminar tudo que não é necessário na área de trabalho</strong>. Parece fácil, mas na prática é o senso que gera mais resistência — porque mexe com o hábito de "guardar porque um dia pode servir".</p>

<h3>A técnica da etiqueta vermelha (Red Tag)</h3>
<p>A etiqueta vermelha é o método mais eficaz para o Seiri. Funciona assim:</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Percorra a área</strong><br>Com a equipe, identifique todos os itens questionáveis</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Fixe etiqueta vermelha</strong><br>Em cada item cuja necessidade não é unânime</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Registre na etiqueta</strong><br>Data, nome do item, responsável, motivo e destino sugerido</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Mova para quarentena</strong><br>Local definido para itens etiquetados</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Aguarde 30 dias</strong><br>Se ninguém reclamar, item é descartado, vendido ou doado</div></div>
</div>

<div class="diagram">
  <svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#c5383c"/></marker>
    </defs>
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Fluxo da Etiqueta Vermelha</text>
    <!-- Item -->
    <rect x="10" y="40" width="80" height="40" rx="6" fill="#0b1730" stroke="#555" stroke-width="1"/>
    <text x="50" y="57" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ITEM</text>
    <text x="50" y="69" text-anchor="middle" fill="#aaa" font-size="7">encontrado</text>
    <line x1="90" y1="60" x2="118" y2="60" stroke="#c5383c" stroke-width="2" marker-end="url(#arr3)"/>
    <!-- Decisão -->
    <polygon points="160,35 200,55 160,75 120,55" fill="#eab308" stroke="#eab308" stroke-width="1"/>
    <text x="160" y="58" text-anchor="middle" fill="#0b1730" font-size="8" font-weight="bold">Necessário?</text>
    <!-- Sim -->
    <line x1="160" y1="35" x2="160" y2="10" stroke="#16a34a" stroke-width="2"/>
    <text x="170" y="15" fill="#16a34a" font-size="8">SIM</text>
    <text x="210" y="15" fill="#aaa" font-size="8">→ Mantém no posto</text>
    <!-- Não / Dúvida -->
    <line x1="200" y1="55" x2="228" y2="55" stroke="#c5383c" stroke-width="2" marker-end="url(#arr3)"/>
    <text x="210" y="48" fill="#c5383c" font-size="8">NÃO</text>
    <!-- Etiquetar -->
    <rect x="230" y="38" width="75" height="35" rx="6" fill="#c5383c"/>
    <text x="268" y="54" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ETIQUETAR</text>
    <text x="268" y="65" text-anchor="middle" fill="#fff" font-size="7">Etiqueta vermelha</text>
    <line x1="268" y1="73" x2="268" y2="98" stroke="#c5383c" stroke-width="2" marker-end="url(#arr3)"/>
    <!-- Quarentena -->
    <rect x="220" y="100" width="95" height="35" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="268" y="116" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">QUARENTENA</text>
    <text x="268" y="128" text-anchor="middle" fill="#aaa" font-size="7">30 dias</text>
    <line x1="268" y1="135" x2="268" y2="155" stroke="#c5383c" stroke-width="2" marker-end="url(#arr3)"/>
    <!-- Destinos -->
    <rect x="155" y="160" width="55" height="30" rx="5" fill="#c5383c" opacity="0.7"/>
    <text x="183" y="179" text-anchor="middle" fill="#fff" font-size="8">Descartar</text>
    <rect x="220" y="160" width="55" height="30" rx="5" fill="#2563eb" opacity="0.7"/>
    <text x="248" y="179" text-anchor="middle" fill="#fff" font-size="8">Vender</text>
    <rect x="285" y="160" width="55" height="30" rx="5" fill="#16a34a" opacity="0.7"/>
    <text x="313" y="179" text-anchor="middle" fill="#fff" font-size="8">Doar</text>
    <rect x="350" y="160" width="55" height="30" rx="5" fill="#eab308" opacity="0.7"/>
    <text x="378" y="179" text-anchor="middle" fill="#0b1730" font-size="8">Realocar</text>
  </svg>
  <figcaption>Fluxo decisório da etiqueta vermelha: do item encontrado ao destino final</figcaption>
</div>

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

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Dona Marta, encarregada da ferramentaria numa indústria de embalagens em Gravataí (RS), relembra: "No primeiro Seiri, eu quase chorei. Tinha ferramentas ali que eu guardava há 8 anos 'por garantia'. Quando medimos, 40% do armário era lixo. Hoje, com o shadow board, sei exatamente o que tenho. E aquele espaço que eu usava pra guardar tralha virou minha mesa de trabalho."</p>
</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">85 m²</div><div class="kpi-label">Área útil liberada</div></div>
  <div class="kpi-card"><div class="kpi-value">2</div><div class="kpi-label">Máquinas desativadas removidas</div></div>
  <div class="kpi-card"><div class="kpi-value">120 kg</div><div class="kpi-label">Retalhos descartados</div></div>
  <div class="kpi-card"><div class="kpi-value">45</div><div class="kpi-label">Baldes de cola vencida</div></div>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! O prazo padrão da quarentena é 30 dias." data-fb-nok="Incorreto. Itens etiquetados ficam na área de quarentena por 30 dias antes da decisão final.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o prazo padrão para manter itens na área de quarentena antes do descarte?</div>
  <button class="qi-option" data-key="a">7 dias</button>
  <button class="qi-option" data-key="b">15 dias</button>
  <button class="qi-option" data-key="c">30 dias</button>
  <div class="qi-feedback"></div>
</div>

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

<h3>Princípios do Seiton industrial</h3>
<ol>
<li><strong>Um lugar para cada coisa, cada coisa em seu lugar</strong> — o princípio fundamental</li>
<li><strong>Frequência de uso define a posição</strong> — quanto mais usado, mais acessível</li>
<li><strong>Identificação visual</strong> — ninguém deveria precisar perguntar onde algo fica</li>
<li><strong>Limite máximo</strong> — definir quantidade máxima para cada item (evita acúmulo)</li>
<li><strong>Primeiro a entrar, primeiro a sair (FIFO)</strong> — especialmente para insumos com validade</li>
</ol>

<h3>Shadow boards (quadros de sombra)</h3>
<p>O shadow board é um painel onde o contorno de cada ferramenta e desenhado ou pintado. Quando a ferramenta está no lugar, o contorno está coberto. Quando falta, o contorno vazio mostra imediatamente <strong>o que falta e onde deveria estar</strong>.</p>

<div class="diagram">
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Shadow Board — Antes vs. Depois</text>
    <!-- Antes -->
    <rect x="10" y="30" width="180" height="150" rx="6" fill="#1a1a2e" stroke="#c5383c" stroke-width="1.5"/>
    <text x="100" y="48" text-anchor="middle" fill="#c5383c" font-size="10" font-weight="bold">ANTES</text>
    <!-- Ferramentas bagunçadas -->
    <rect x="25" y="60" width="40" height="8" rx="2" fill="#666" transform="rotate(15, 45, 64)"/>
    <rect x="50" y="80" width="35" height="7" rx="2" fill="#888" transform="rotate(-20, 68, 84)"/>
    <rect x="80" y="55" width="30" height="10" rx="2" fill="#777" transform="rotate(45, 95, 60)"/>
    <circle cx="140" cy="100" r="12" fill="none" stroke="#666" stroke-width="2"/>
    <rect x="100" y="120" width="50" height="6" rx="2" fill="#555" transform="rotate(-10, 125, 123)"/>
    <rect x="30" y="130" width="25" height="30" rx="3" fill="#444"/>
    <text x="100" y="170" text-anchor="middle" fill="#c5383c" font-size="8">Desordem — tempo de busca: 4+ min</text>
    <!-- Depois -->
    <rect x="210" y="30" width="180" height="150" rx="6" fill="#1a1a2e" stroke="#16a34a" stroke-width="1.5"/>
    <text x="300" y="48" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="bold">DEPOIS</text>
    <!-- Contornos organizados -->
    <rect x="225" y="60" width="45" height="8" rx="2" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
    <rect x="225" y="60" width="45" height="8" rx="2" fill="#16a34a" opacity="0.3"/>
    <text x="248" y="57" fill="#aaa" font-size="6">Chave 10mm</text>
    <rect x="225" y="82" width="40" height="7" rx="2" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
    <rect x="225" y="82" width="40" height="7" rx="2" fill="#16a34a" opacity="0.3"/>
    <text x="245" y="79" fill="#aaa" font-size="6">Chave 13mm</text>
    <rect x="285" y="60" width="35" height="8" rx="2" fill="none" stroke="#eab308" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="303" y="57" fill="#aaa" font-size="6">Alicate</text>
    <text x="303" y="73" fill="#eab308" font-size="7" font-weight="bold">FALTANDO</text>
    <rect x="285" y="82" width="50" height="7" rx="2" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
    <rect x="285" y="82" width="50" height="7" rx="2" fill="#16a34a" opacity="0.3"/>
    <text x="310" y="79" fill="#aaa" font-size="6">Chave Phillips</text>
    <circle cx="260" cy="120" r="12" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="260" cy="120" r="12" fill="#16a34a" opacity="0.2"/>
    <text x="260" y="108" text-anchor="middle" fill="#aaa" font-size="6">Fita métrica</text>
    <text x="300" y="170" text-anchor="middle" fill="#16a34a" font-size="8">Ordem — tempo de busca: 30 seg</text>
  </svg>
  <figcaption>Shadow board: contornos mostram imediatamente o que falta e onde deveria estar</figcaption>
</div>

<div class="callout"><strong>Como fazer um shadow board:</strong> (1) Selecione as ferramentas do posto. (2) Fixe um painel de MDF pintado de branco ou cinza claro. (3) Posicione cada ferramenta e trace o contorno com caneta permanente preta. (4) Instale ganchos ou suportes. (5) Identifique cada posição com etiqueta. Custo médio: R$ 80 a R$ 200 por painel (material + mão de obra interna).</div>

<h3>Sinalização de chão</h3>
<p>A demarcação de chão é fundamental na indústria. Define visualmente:</p>
<table>
<tr><th>Cor</th><th>Uso padrão (NBR 7195 / OSHA adaptado)</th></tr>
<tr><td><strong>Amarelo</strong></td><td>Corredores de circulação, áreas de atenção</td></tr>
<tr><td><strong>Branco</strong></td><td>Posição de equipamentos, bancadas, estações de trabalho</td></tr>
<tr><td><strong>Verde</strong></td><td>Áreas de produto aprovado, material em processo</td></tr>
<tr><td><strong>Vermelho</strong></td><td>Áreas de produto não conforme, rejeito, extintores</td></tr>
<tr><td><strong>Azul</strong></td><td>Material em análise, área de inspeção</td></tr>
<tr><td><strong>Preto e branco (zebrado)</strong></td><td>Áreas que devem permanecer livres (não obstruir)</td></tr>
</table>

<div class="example"><strong>Exemplo real:</strong> Uma metalúrgica de Contagem (MG) investiu R$ 6.200 em pintura de chão e sinalização. Resultado: eliminação de 100% das reclamações de "material no corredor" em auditorias. O tempo de movimentação interna de materiais caiu 22% porque os corredores ficaram sempre livres.</div>

<h3>Organização de estantes e almoxarifado</h3>
<p>Regras práticas para organizar prateleiras e estantes:</p>
<ul>
<li><strong>Endereçamento:</strong> Cada posição tem um código único (ex: E2-P3-C1 = Estante 2, Prateleira 3, Coluna 1)</li>
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

<ul class="checklist">
  <li><span class="ck-box"></span>Shadow boards instalados em todos os postos de trabalho</li>
  <li><span class="ck-box"></span>Demarcação de chão com cores padronizadas (NBR 7195)</li>
  <li><span class="ck-box"></span>Endereçamento de estantes (E-P-C) com etiquetas visíveis</li>
  <li><span class="ck-box"></span>Itens mais usados na altura dos olhos (1,20m a 1,60m)</li>
  <li><span class="ck-box"></span>Sistema FIFO implantado para insumos com validade</li>
  <li><span class="ck-box"></span>Kanban visual para controle de estoque (verde/amarelo/vermelho)</li>
  <li><span class="ck-box"></span>Teste dos 30 segundos aprovado com visitante externo</li>
</ul>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A regra dos 30 segundos é o benchmark do Seiton." data-fb-nok="Incorreto. No Seiton bem implantado, qualquer item deve ser encontrado em até 30 segundos.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Segundo a "regra dos 30 segundos", o que deve acontecer nesse tempo?</div>
  <button class="qi-option" data-key="a">A limpeza do posto deve ser completada</button>
  <button class="qi-option" data-key="b">Qualquer item deve ser localizado por qualquer pessoa</button>
  <button class="qi-option" data-key="c">O setup da máquina deve iniciar</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> O shadow board é a ferramenta com melhor relação custo-benefício do 5S: custa R$ 80-200 e elimina 100% do tempo de busca de ferramentas no posto. Se você pudesse implantar apenas uma coisa do Seiton, seria o shadow board.</div></div>
`}, 'Guia de sinalização de chão industrial'),

  (${m2.id}, '2-3-seiso-limpeza-inspeção', 'Seiso na prática: limpeza como inspeção', '22 min', 3, ${`
<h2>Seiso na prática: limpeza como inspeção</h2>
<p>O Seiso é frequentemente o senso mais subestimado. Muitas empresas o tratam como "dia de faxina", mas no contexto industrial o Seiso tem um papel estratégico: <strong>a limpeza é a primeira forma de inspeção</strong>. Ao limpar uma máquina, o operador passa a mão em cada superfície, olha cada canto — e encontra anomalias que nenhum sensor detectaria.</p>

<h3>Seiso industrial vs. faxina comum</h3>
<table>
<tr><th>Aspecto</th><th>Faxina comum</th><th>Seiso industrial</th></tr>
<tr><td>Objetivo</td><td>Estética</td><td>Inspeção e prevenção</td></tr>
<tr><td>Quem faz</td><td>Equipe de limpeza</td><td>O próprio operador da área/máquina</td></tr>
<tr><td>Frequência</td><td>Quando está sujo</td><td>Rotina diária programada</td></tr>
<tr><td>Atitude</td><td>Limpar a sujeira</td><td>Eliminar a fonte da sujeira</td></tr>
<tr><td>Resultado</td><td>Área limpa temporariamente</td><td>Máquina inspecionada + anomalias identificadas</td></tr>
</table>

<h3>O conceito de "limpeza como inspeção"</h3>
<p>Este conceito vem do TPM (Total Productive Maintenance) e se íntegra perfeitamente ao 5S. A ideia é:</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Limpar</strong><br>Remover sujeira, poeira, óleo, resíduos</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Inspecionar</strong><br>Observar vazamentos, folgas, rachaduras, fios soltos, ruídos anormais</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Registrar</strong><br>Anotar anomalias encontradas numa ficha ou app</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Corrigir ou escalar</strong><br>Resolver ou abrir ordem de serviço para manutenção</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Eliminar a fonte</strong><br>Investigar e tratar a causa raiz da sujeira</div></div>
</div>

<div class="diagram">
  <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Seiso: Limpeza como Inspeção — Ciclo</text>
    <!-- Ciclo circular -->
    <circle cx="200" cy="105" r="65" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="8,4"/>
    <circle cx="200" cy="105" r="30" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="200" y="101" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">SEISO</text>
    <text x="200" y="113" text-anchor="middle" fill="#fff" font-size="7">Limpeza +</text>
    <text x="200" y="122" text-anchor="middle" fill="#fff" font-size="7">Inspeção</text>
    <!-- Pontos no ciclo -->
    <circle cx="200" cy="37" r="16" fill="#2563eb"/>
    <text x="200" y="41" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">Limpar</text>
    <circle cx="265" cy="60" r="16" fill="#16a34a"/>
    <text x="265" y="63" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">Inspecionar</text>
    <circle cx="270" cy="140" r="16" fill="#eab308"/>
    <text x="270" y="143" text-anchor="middle" fill="#0b1730" font-size="7" font-weight="bold">Registrar</text>
    <circle cx="200" cy="173" r="16" fill="#c5383c"/>
    <text x="200" y="176" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">Corrigir</text>
    <circle cx="130" cy="140" r="16" fill="#c5383c" opacity="0.7"/>
    <text x="130" y="138" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">Eliminar</text>
    <text x="130" y="147" text-anchor="middle" fill="#fff" font-size="6">fonte</text>
  </svg>
  <figcaption>Ciclo do Seiso: limpar, inspecionar, registrar, corrigir e eliminar a fonte</figcaption>
</div>

<div class="example"><strong>Caso real:</strong> Numa indústria de alimentos de Ponta Grossa (PR), a implantação do Seiso como inspeção nas linhas de envase gerou 67 relatórios de anomalias no primeiro mês. Dentre eles: 12 vazamentos de ar comprimido, 8 mangueiras com microfissuras, 3 rolamentos com ruído anormal é 1 fio elétrico desencapado. Custo total de reparo: R$ 3.800. Custo estimado se os problemas evoluissem para quebra: mais de R$ 45.000 (incluindo parada de linha e perda de produto).</div>

<h3>Rotina de Seiso — o check de 5 minutos</h3>
<p>A rotina de limpeza/inspeção não precisa ser longa. Um check de 5 minutos no início de cada turno é suficiente:</p>

<div class="template-box">
<h3>Template: Check de Limpeza/Inspeção Diária (5 min)</h3>
<table>
<tr><th>Item</th><th>Verificar</th><th>OK/NOK</th></tr>
<tr><td>Piso da área</td><td>Limpo, sem óleo/resíduos no chão</td><td>[ ]</td></tr>
<tr><td>Bancada de trabalho</td><td>Organizada, sem itens desnecessários</td><td>[ ]</td></tr>
<tr><td>Máquina — visual</td><td>Sem vazamentos, parafusos soltos, fios expostos</td><td>[ ]</td></tr>
<tr><td>Máquina — auditivo</td><td>Sem ruídos anormais ao ligar</td><td>[ ]</td></tr>
<tr><td>Ferramentas</td><td>Todas no shadow board, em bom estado</td><td>[ ]</td></tr>
<tr><td>Lixeiras</td><td>Vazias e identificadas por tipo de resíduo</td><td>[ ]</td></tr>
<tr><td>Sinalização</td><td>Placas e demarcações visíveis e íntegras</td><td>[ ]</td></tr>
</table>
<p><strong>Anomalias encontradas:</strong> _______________________________________________</p>
<p><strong>Ação tomada:</strong> __________________ | <strong>OS aberta?</strong> [ ] Sim N _______ [ ] Não</p>
<p><strong>Operador:</strong> __________________ | <strong>Turno:</strong> _____ | <strong>Data:</strong> ___/___/___</p>
</div>

<h3>Eliminando fontes de sujeira</h3>
<p>O Seiso avançado não se contenta em limpar — busca eliminar a <strong>causa raiz da sujeira</strong>:</p>
<ul>
<li><strong>Vazamento de óleo:</strong> Trocar retentores, apertar conexões, instalar bandejas coletoras</li>
<li><strong>Poeira de processo:</strong> Instalar coifas de exaustão, enclausurar pontos de geração</li>
<li><strong>Rebarbas e cavaco:</strong> Ajustar parâmetros de corte, instalar proteções, melhorar sistema de refrigeração</li>
<li><strong>Resíduos de embalagem:</strong> Mudar material de embalagem, definir ponto de descarte próximo a área de uso</li>
</ul>

<div class="callout"><strong>Indicador de Seiso:</strong> Meça o "número de fontes de sujeira eliminadas por mês". No início será alto (muitas fontes). Com o tempo, cai — sinal de que o ambiente está realmente mais limpo de forma sustentável, não apenas varrido.</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Faxina comum</h4><ul><li>Feita pela equipe de limpeza</li><li>Quando está sujo</li><li>Objetivo: estética</li><li>Limpa a sujeira</li><li>Resultado: limpo temporariamente</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Seiso Industrial</h4><ul><li>Feita pelo próprio operador</li><li>Rotina diária programada (5 min)</li><li>Objetivo: inspeção e prevenção</li><li>Elimina a fonte da sujeira</li><li>Resultado: anomalias detectadas</li></ul></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>José Ricardo, operador de torno CNC numa metalúrgica de São Bernardo do Campo (SP): "Antes eu achava que limpar máquina era coisa de faxineiro. Depois que comecei a fazer o check de 5 minutos, em uma semana achei um vazamento de óleo hidráulico que ninguém tinha visto. O mecânico disse que se tivesse continuado, ia travar o cabeçote. Reparo: R$ 200. Se travasse: R$ 12.000. Agora eu limpo com orgulho."</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! No Seiso industrial, ao limpar o operador também inspeciona buscando anomalias." data-fb-nok="Incorreto. O conceito de limpeza como inspeção significa que o operador observa anomalias enquanto limpa.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">No conceito de "limpeza como inspeção", o que diferencia o Seiso da faxina comum?</div>
  <button class="qi-option" data-key="a">O operador observa anomalias (vazamentos, folgas, fissuras) enquanto limpa</button>
  <button class="qi-option" data-key="b">Usa-se produtos de limpeza industriais mais caros</button>
  <button class="qi-option" data-key="c">A limpeza é feita apenas uma vez por semana</button>
  <div class="qi-feedback"></div>
</div>

<h3>Materiais de limpeza adequados</h3>
<p>Cada tipo de indústria exige materiais específicos:</p>
<table>
<tr><th>Tipo de indústria</th><th>Materiais recomendados</th><th>Cuidados</th></tr>
<tr><td>Metalúrgica</td><td>Panos absorventes indústriais, desengraxante, vassoura magnética</td><td>Óleo de corte exige descarte como resíduo perigoso</td></tr>
<tr><td>Alimentícia</td><td>Detergente neutro, sanitizante, panos descartáveis, rodo</td><td>Seguir PPHO (Procedimento Padrão de Higiene Operacional)</td></tr>
<tr><td>Construtora</td><td>Vassoura, pa, container para entulho, água sob pressão</td><td>Separar resíduos classe A, B, C conforme CONAMA 307</td></tr>
<tr><td>Agrícola</td><td>Vassoura, soprador, pa, sacos de ração/grainhos para descarte</td><td>Embalagens de agrotóxico seguem logística reversa (Lei 7.802)</td></tr>
</table>
`}, 'Ficha de limpeza/inspeção diária'),

  (${m2.id}, '2-4-dia-d-5s', 'Dia D do 5S: planejando o mutirao', '23 min', 4, ${`
<h2>Dia D do 5S: planejando o mutirão</h2>
<p>O Dia D é o marco de lançamento do programa 5S. É um <strong>evento concentrado</strong>, geralmente de 4 a 8 horas, onde toda a fábrica para (ou roda em escala reduzida) para aplicar os três primeiros sensos de uma vez. O Dia D não é o 5S — e o <strong>pontapé inicial</strong> que gera impacto visual e emocional, criando momentum para o programa.</p>

<div class="diagram">
  <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr4" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#eab308"/></marker>
    </defs>
    <text x="210" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Cronograma do Dia D — 6 horas</text>
    <!-- Timeline -->
    <line x1="20" y1="60" x2="400" y2="60" stroke="#555" stroke-width="2"/>
    <!-- 07h00 -->
    <circle cx="40" cy="60" r="6" fill="#2563eb"/>
    <text x="40" y="50" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">07h00</text>
    <text x="40" y="80" text-anchor="middle" fill="#aaa" font-size="7">Abertura</text>
    <text x="40" y="90" text-anchor="middle" fill="#aaa" font-size="6">30 min</text>
    <!-- 07h30 -->
    <circle cx="110" cy="60" r="6" fill="#c5383c"/>
    <text x="110" y="50" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">07h30</text>
    <text x="110" y="80" text-anchor="middle" fill="#c5383c" font-size="7" font-weight="bold">SEIRI</text>
    <text x="110" y="90" text-anchor="middle" fill="#aaa" font-size="6">2 horas</text>
    <rect x="60" y="55" width="100" height="10" rx="3" fill="#c5383c" opacity="0.3"/>
    <!-- 09h30 -->
    <circle cx="190" cy="60" r="6" fill="#eab308"/>
    <text x="190" y="50" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">09h30</text>
    <text x="190" y="80" text-anchor="middle" fill="#aaa" font-size="7">Café</text>
    <text x="190" y="90" text-anchor="middle" fill="#aaa" font-size="6">15 min</text>
    <!-- 09h45 -->
    <circle cx="220" cy="60" r="6" fill="#16a34a"/>
    <text x="220" y="50" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">09h45</text>
    <text x="240" y="80" text-anchor="middle" fill="#16a34a" font-size="7" font-weight="bold">SEISO</text>
    <text x="240" y="90" text-anchor="middle" fill="#aaa" font-size="6">1h30</text>
    <rect x="220" y="55" width="70" height="10" rx="3" fill="#16a34a" opacity="0.3"/>
    <!-- 11h15 -->
    <circle cx="300" cy="60" r="6" fill="#2563eb"/>
    <text x="300" y="50" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">11h15</text>
    <text x="310" y="80" text-anchor="middle" fill="#2563eb" font-size="7" font-weight="bold">SEITON</text>
    <text x="310" y="90" text-anchor="middle" fill="#aaa" font-size="6">1h15</text>
    <rect x="300" y="55" width="60" height="10" rx="3" fill="#2563eb" opacity="0.3"/>
    <!-- 12h30 -->
    <circle cx="370" cy="60" r="6" fill="#eab308"/>
    <text x="370" y="50" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">12h30</text>
    <text x="370" y="80" text-anchor="middle" fill="#aaa" font-size="7">Encerramento</text>
    <text x="370" y="90" text-anchor="middle" fill="#aaa" font-size="6">30 min</text>
    <!-- Legenda -->
    <rect x="50" y="120" width="320" height="30" rx="6" fill="#0b1730" stroke="#555" stroke-width="0.5"/>
    <text x="210" y="139" text-anchor="middle" fill="#eab308" font-size="9">Dica: ofereça café/lanche — é investimento, não luxo!</text>
  </svg>
  <figcaption>Roteiro hora a hora de um Dia D de 6 horas</figcaption>
</div>

<h3>Antes do Dia D — planejamento (2-4 semanas antes)</h3>

<div class="template-box">
<h3>Template: Plano de Implantação — Dia D do 5S</h3>
<table>
<tr><th>Etapa</th><th>Ação</th><th>Responsável</th><th>Prazo</th></tr>
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
<tr><td>09h45</td><td><strong>Seiso:</strong> Limpeza profunda de cada área (chão, máquinas, estantes, paredes)</td><td>1h30</td></tr>
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

<div class="callout"><strong>Dica crítica:</strong> O café/lanche não é luxo — é investimento. O Dia D e um evento físico e exaustivo. Oferecer alimentação mostra que a empresa valoriza o esforço. Muitas fábricas relatam que o lanche comunitário do Dia D foi um dos momentos de maior integração da equipe.</div>

<h3>Erros comuns no Dia D</h3>
<ul>
<li><strong>Não envolver a direção:</strong> Se o dono ou diretor não participar, a mensagem é "isso não é importante". A direção deve estar presente, camiseta arregaçada, limpando junto.</li>
<li><strong>Não fotografar o antes:</strong> Sem o "antes", o "depois" perde impacto. Fotografe ANTES de começar qualquer atividade.</li>
<li><strong>Jogar tudo fora sem critério:</strong> O Seiri exige critério e registro. Jogar coisas fora sem etiqueta e sem consultar a equipe gera revolta e desconfiança.</li>
<li><strong>Achar que o Dia D resolve tudo:</strong> O Dia D é o início, não o fim. Sem continuidade (4o e 5o S), tudo volta ao normal em 60 dias.</li>
<li><strong>Fazer no horário de produção sem planejar:</strong> Parar a produção custa dinheiro. Planeje com antecedência, avise clientes se necessário, ajuste entregas.</li>
</ul>

<div class="example"><strong>Resultado típico:</strong> Uma fábrica de embalagens plásticas de Curitiba (PR) com 65 funcionários fez seu Dia D em um sábado. Resultados do dia: 2,3 toneladas de material descartado, 120 etiquetas vermelhas emitidas, 45 m2 de área liberada, 8 caçambas de entulho. Na segunda-feira seguinte, os operadores relataram que "parecia outra fábrica". A nota do diagnóstico 5S subiu de 28% para 58% em um único dia.</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">2,3 ton</div><div class="kpi-label">Material descartado</div></div>
  <div class="kpi-card"><div class="kpi-value">120</div><div class="kpi-label">Etiquetas vermelhas</div></div>
  <div class="kpi-card"><div class="kpi-value">45 m²</div><div class="kpi-label">Área liberada</div></div>
  <div class="kpi-card"><div class="kpi-value">28→58%</div><div class="kpi-label">Nota 5S (1 dia!)</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Anderson, diretor de uma fábrica de plásticos em Joinville (SC): "Fiz questão de limpar o chão junto com os operadores no Dia D. Alguns ficaram surpresos de me ver de joelhos limpando, mas a mensagem foi clara: isso é importante pra mim também. Dois anos depois, o pessoal ainda fala daquele dia."</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Fotografar o antes é essencial e deve ser feito antes de qualquer atividade." data-fb-nok="Incorreto. O registro fotográfico do estado inicial deve acontecer antes de qualquer ação, pois sem ele não há como comprovar a evolução.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">No Dia D, qual é a atividade que DEVE acontecer ANTES de todas as outras?</div>
  <button class="qi-option" data-key="a">Limpar as máquinas</button>
  <button class="qi-option" data-key="b">Fotografar o estado atual (antes)</button>
  <button class="qi-option" data-key="c">Distribuir as etiquetas vermelhas</button>
  <div class="qi-feedback"></div>
</div>

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
<p>O Seiketsu (senso de padronização) é o senso que <strong>consolida os três primeiros</strong>. Sem ele, o Seiri, Seiton é Seiso são eventos pontuais que se desfazem em semanas. O Seiketsu transforma ações em <strong>rotinas, padrões e hábitos</strong>.</p>

<div class="diagram">
  <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Seiketsu: a cola que sustenta os 3 primeiros S</text>
    <!-- 3 primeiros S -->
    <rect x="30" y="40" width="70" height="50" rx="6" fill="#c5383c"/>
    <text x="65" y="62" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEIRI</text>
    <text x="65" y="78" text-anchor="middle" fill="#fff" font-size="7">Separar</text>
    <rect x="115" y="40" width="70" height="50" rx="6" fill="#2563eb"/>
    <text x="150" y="62" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEITON</text>
    <text x="150" y="78" text-anchor="middle" fill="#fff" font-size="7">Organizar</text>
    <rect x="200" y="40" width="70" height="50" rx="6" fill="#16a34a"/>
    <text x="235" y="62" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SEISO</text>
    <text x="235" y="78" text-anchor="middle" fill="#fff" font-size="7">Limpar</text>
    <!-- Seiketsu como base -->
    <rect x="20" y="100" width="260" height="40" rx="8" fill="#eab308"/>
    <text x="150" y="118" text-anchor="middle" fill="#0b1730" font-size="11" font-weight="bold">SEIKETSU — Padronização</text>
    <text x="150" y="132" text-anchor="middle" fill="#0b1730" font-size="8">Foto padrão + Checklist + Cores + Rotina</text>
    <!-- Sem Seiketsu -->
    <rect x="300" y="40" width="90" height="100" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="345" y="60" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">SEM</text>
    <text x="345" y="75" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">SEIKETSU</text>
    <text x="345" y="95" text-anchor="middle" fill="#aaa" font-size="8">Tudo volta</text>
    <text x="345" y="108" text-anchor="middle" fill="#aaa" font-size="8">ao normal</text>
    <text x="345" y="121" text-anchor="middle" fill="#aaa" font-size="8">em semanas</text>
    <!-- Setas -->
    <text x="150" y="160" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">Com padrão = sustentável</text>
    <text x="345" y="155" text-anchor="middle" fill="#c5383c" font-size="9">Sem padrão = efêmero</text>
  </svg>
  <figcaption>Sem Seiketsu, os 3 primeiros S se desfazem em semanas</figcaption>
</div>

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
<tr><td>8</td><td>Sinalização de chão íntegra e visível</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>9</td><td>Corredores livres (sem obstrução)</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
<tr><td>10</td><td>EPIs no local definido e em bom estado</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
</table>
<p><strong>Observações:</strong> _________________________________________________</p>
<p><strong>Assinatura responsável:</strong> __________________ <strong>Visto líder:</strong> __________________</p>
</div>

<h3>Padronização de cores na fábrica</h3>
<p>Um sistema de cores consistente facilita a comunicação visual em toda a planta:</p>
<table>
<tr><th>Elemento</th><th>Cor sugerida</th><th>Exemplo</th></tr>
<tr><td>Equipamentos de produção</td><td>Verde ou azul claro</td><td>Tornos, fresadoras, prensas</td></tr>
<tr><td>Equipamentos de segurança</td><td>Vermelho</td><td>Extintores, alarmes, lava-olhos</td></tr>
<tr><td>Tubulações — ar comprimido</td><td>Azul</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulações — água</td><td>Verde</td><td>Conforme NBR 6493</td></tr>
<tr><td>Tubulações — gás</td><td>Amarelo</td><td>Conforme NBR 6493</td></tr>
<tr><td>Áreas de risco</td><td>Amarelo e preto (zebrado)</td><td>Pontos de esmagamento, queda, elétrico</td></tr>
</table>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de autopecas de Sorocaba (SP) padronizou todo o sistema de cores em 30 dias. Investiu R$ 9.500 em tinta e mão de obra. Resultado: tempo de integração de novos funcionários caiu de 5 dias para 2 dias (porque o ambiente "se explica sozinho"), e o número de quase-acidentes por "não sabia que era perigoso" caiu 70%.</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">R$ 8-15</div><div class="kpi-label">Custo/foto padrão A3</div></div>
  <div class="kpi-card"><div class="kpi-value">5→2 dias</div><div class="kpi-label">Integração novos func.</div></div>
  <div class="kpi-card"><div class="kpi-value">-70%</div><div class="kpi-label">Quase-acidentes</div></div>
  <div class="kpi-card"><div class="kpi-value">5 min/dia</div><div class="kpi-label">Checklist diário</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Fernanda, analista de qualidade de uma indústria de alimentos em Chapecó (SC): "Quando colamos a foto do estado padrão na parede de cada setor, a mudança foi imediata. Os operadores passaram a se autocorrigir. Um deles disse: 'Agora todo mundo vê se tá errado — não precisa mais de fiscal.' Custou R$ 120 para fazer as 10 fotos da fábrica toda. O retorno? Imensurável."</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A foto do estado padrão é a ferramenta mais simples e eficaz do Seiketsu." data-fb-nok="Incorreto. A foto do estado padrão — impressa e fixada no local — é a referência visual mais simples e de melhor custo-benefício do 4º S.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é a ferramenta mais simples e de melhor custo-benefício do Seiketsu?</div>
  <button class="qi-option" data-key="a">Foto do estado padrão fixada no local (R$ 8-15)</button>
  <button class="qi-option" data-key="b">Sistema ERP de controle</button>
  <button class="qi-option" data-key="c">App de auditoria digital</button>
  <div class="qi-feedback"></div>
</div>

<ul class="checklist">
  <li><span class="ck-box"></span>Foto do estado padrão impressa A3 e fixada em cada área</li>
  <li><span class="ck-box"></span>Checklist diário de 5S implantado em todos os setores</li>
  <li><span class="ck-box"></span>Sistema de cores padronizado (tubulações, áreas, equipamentos)</li>
  <li><span class="ck-box"></span>Limites visuais de quantidade definidos (min/max)</li>
  <li><span class="ck-box"></span>Regras de uso compartilhado documentadas e visíveis</li>
</ul>
`}, 'Checklist diário de 5S (modelo editável)'),

  (${m3.id}, '3-2-shitsuke-disciplina-lideranca', 'Shitsuke: disciplina e o papel da liderança', '22 min', 2, ${`
<h2>Shitsuke: disciplina e o papel da liderança</h2>
<p>O Shitsuke (senso de disciplina) é o senso que determina se o programa 5S <strong>vai sobreviver ou morrer</strong>. Estatísticas indicam que 70% dos programas 5S fracassam no médio prazo — é a causa principal e a falta de disciplina sustentada pela liderança.</p>

<h3>O que é disciplina no 5S?</h3>
<p>Disciplina no contexto do 5S <strong>não é punição</strong>. É a capacidade de <strong>seguir padrões de forma consistente e autônoma</strong>, mesmo sem supervisão. Disciplina madura e quando o operador mantém o padrão porque entende o valor, não porque tem medo de ser cobrado.</p>

<h3>Os três estágios da disciplina</h3>
<table>
<tr><th>Estágio</th><th>Descrição</th><th>Tempo médio</th><th>Ação da liderança</th></tr>
<tr><td><strong>1. Cobrança</strong></td><td>A equipe só segue o padrão quando cobrada</td><td>Meses 1-6</td><td>Presença constante, auditorias semanais, feedback imediato</td></tr>
<tr><td><strong>2. Consciência</strong></td><td>A equipe entende o porqu e segue com menos cobrança</td><td>Meses 6-18</td><td>Reconhecimento, autonomia gradual, auditorias quinzenais</td></tr>
<tr><td><strong>3. Hábito</strong></td><td>O padrão é seguido naturalmente, faz parte da cultura</td><td>Após 18 meses</td><td>Manter auditorias mensais, inovar, celebrar resultados</td></tr>
</table>

<div class="diagram">
  <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Evolução da disciplina no 5S</text>
    <!-- Eixo X -->
    <line x1="40" y1="120" x2="380" y2="120" stroke="#555" stroke-width="1.5"/>
    <text x="210" y="150" text-anchor="middle" fill="#aaa" font-size="8">Tempo (meses)</text>
    <!-- Eixo Y -->
    <line x1="40" y1="30" x2="40" y2="120" stroke="#555" stroke-width="1.5"/>
    <text x="15" y="75" text-anchor="middle" fill="#aaa" font-size="7" transform="rotate(-90, 15, 75)">Autonomia</text>
    <!-- Fase 1 -->
    <rect x="50" y="35" width="100" height="82" rx="4" fill="#c5383c" opacity="0.15"/>
    <line x1="50" y1="110" x2="150" y2="90" stroke="#c5383c" stroke-width="2.5"/>
    <text x="100" y="55" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">Cobrança</text>
    <text x="100" y="130" text-anchor="middle" fill="#aaa" font-size="7">Meses 1-6</text>
    <!-- Fase 2 -->
    <rect x="155" y="35" width="110" height="82" rx="4" fill="#eab308" opacity="0.15"/>
    <line x1="155" y1="90" x2="265" y2="55" stroke="#eab308" stroke-width="2.5"/>
    <text x="210" y="48" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">Consciência</text>
    <text x="210" y="130" text-anchor="middle" fill="#aaa" font-size="7">Meses 6-18</text>
    <!-- Fase 3 -->
    <rect x="270" y="35" width="105" height="82" rx="4" fill="#16a34a" opacity="0.15"/>
    <line x1="270" y1="55" x2="370" y2="40" stroke="#16a34a" stroke-width="2.5"/>
    <text x="320" y="48" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">Hábito</text>
    <text x="320" y="130" text-anchor="middle" fill="#aaa" font-size="7">Após 18 meses</text>
  </svg>
  <figcaption>A disciplina evolui em 3 estágios: de cobrança externa a hábito natural (18-24 meses)</figcaption>
</div>

<h3>O papel da liderança — o fator mais crítico</h3>
<p>Pesquisas de campo em indústrias brasileiras revelam um padrão claro: <strong>onde a liderança prática o 5S, o programa funciona; onde não prática, o programa morre</strong>. Não importa quanto treinamento você deu. Se o supervisor tem a mesa bagunçada, se o gerente ignora o chão sujo, o operador entende que "5S não é de verdade".</p>

<div class="callout"><strong>Regra de ouro:</strong> A liderança deve ser a primeira a ser auditada no 5S. Se a sala da direção não está no padrão, nenhuma área de produção estara. Comece de cima para baixo — sempre.</div>

<h3>Ações práticas da liderança para sustentar o 5S</h3>
<ol>
<li><strong>Gemba walk semanal:</strong> O gestor caminha pela fábrica com o checklist de 5S, conversa com operadores, reconhece melhorias e aponta desvios. Não é inspeção punitiva — e demonstração de interesse.</li>
<li><strong>Feedback imediato:</strong> Quando encontrar algo fora do padrão, corrija na hora com a equipe (sem armazenar para a reunião mensal).</li>
<li><strong>Reconhecimento público:</strong> Destaque as áreas que melhoraram. Use fotos antes/depois no quadro de gestão visual. Reconhecimento é mais poderoso que punição.</li>
<li><strong>Recursos disponíveis:</strong> Se a equipe precisa de uma estante, um rolo de fita ou uma lata de tinta para manter o padrão, forneça rapidamente. Demora em liberar recursos mata a motivação.</li>
<li><strong>Exemplo pessoal:</strong> Mantenha sua mesa, seu escritório e suas áreas no padrão. Participe do Dia D. Use os EPIs corretamente.</li>
</ol>

<h3>O que mata o 5S — os 7 assassinos</h3>

<div class="accordion-lesson">
  <div class="acc-item">
    <button class="acc-trigger">1. Falta de exemplo da liderança <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>"Faça o que eu digo, não o que eu faço" não funciona. Se o supervisor tem a mesa bagunçada, o operador entende que "5S não é de verdade".</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">2. Dia D sem continuidade <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Fazer o evento e abandonar depois. Sem os 4º e 5º S, tudo volta ao normal em 60 dias.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">3. Punição sem reconhecimento <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Cobrar erros e ignorar acertos. Reconhecimento público é mais poderoso que qualquer punição.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">4. Falta de tempo dedicado <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>"Não temos tempo para 5S, tem produção para entregar." Se não há 5 minutos por dia, o problema é de gestão, não de tempo.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">5. Rotatividade sem treinamento <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Novos funcionários que não são treinados no 5S desfazem o trabalho dos outros. Integração de 5S no primeiro dia é essencial.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">6. Sem medição <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>O que não é medido não é gerenciado. Sem auditoria, sem nota, sem acompanhamento — o programa morre.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">7. Programa "da qualidade" <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Quando o 5S é visto como responsabilidade só do setor de qualidade, e não de todos, perde força e legitimidade.</p></div>
  </div>
</div>

<div class="example"><strong>Caso real:</strong> Uma indústria gráfica de Blumenau (SC) implantou o 5S em 2019. Em 6 meses, a nota média subiu de 35% para 78%. Então o gerente de produção foi transferido e o substituto "não acreditava em 5S". Em 4 meses, a nota caiu para 42%. A empresa só recuperou quando o diretor assumiu pessoalmente as auditorias e cobrou o novo gerente. Lição: a sustentação depende da <strong>estrutura</strong> (auditorias, metas, reconhecimento), não de uma única pessoa.</div>

<h3>Integração de novos funcionários</h3>
<p>Todo novo funcionário deve passar por uma <strong>integração de 5S</strong> no primeiro dia:</p>
<ul>
<li>Explicação dos 5 sensos (15 minutos)</li>
<li>Tour pela fábrica mostrando os padrões visuais</li>
<li>Apresentação do shadow board e do checklist da área</li>
<li>Designação de um "padrinho de 5S" (colega experiente) na primeira semana</li>
</ul>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A liderança pelo exemplo é o fator mais crítico para a sustentação do 5S." data-fb-nok="Incorreto. Pesquisas de campo mostram que onde a liderança pratica o 5S, o programa funciona; onde não pratica, morre.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o fator mais crítico para que o programa 5S sobreviva no longo prazo?</div>
  <button class="qi-option" data-key="a">Investimento em tecnologia (apps, sensores)</button>
  <button class="qi-option" data-key="b">Contratação de consultoria externa permanente</button>
  <button class="qi-option" data-key="c">Exemplo e envolvimento ativo da liderança</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> A sustentação do 5S depende de estrutura (auditorias, metas, reconhecimento), não de uma única pessoa. Se o programa depende de um gerente específico, quando ele sair o 5S morre junto. Construa o sistema, não a dependência.</div></div>
`}, NULL),

  (${m3.id}, '3-3-gestão-visual-quadros-sinalização', 'Gestão visual: quadros, sinalização e cores', '20 min', 3, ${`
<h2>Gestão visual: quadros, sinalização e cores</h2>
<p>A gestão visual e o <strong>sistema nervoso do 5S</strong>. Num ambiente com boa gestão visual, qualquer pessoa — funcionário, visitante, auditor — consegue entender a situação em segundos, sem precisar perguntar. O objetivo é simples: <strong>tornar o estado normal e o anormal visíveis instantaneamente</strong>.</p>

<div class="diagram">
  <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Layout de Fábrica com Gestão Visual</text>
    <!-- Chão da fábrica -->
    <rect x="10" y="30" width="400" height="175" rx="6" fill="#1a1a2e" stroke="#555" stroke-width="1"/>
    <!-- Corredor principal (amarelo) -->
    <rect x="180" y="30" width="50" height="175" rx="0" fill="#eab308" opacity="0.15"/>
    <line x1="180" y1="30" x2="180" y2="205" stroke="#eab308" stroke-width="2"/>
    <line x1="230" y1="30" x2="230" y2="205" stroke="#eab308" stroke-width="2"/>
    <text x="205" y="200" text-anchor="middle" fill="#eab308" font-size="7" transform="rotate(-90, 205, 170)">CORREDOR</text>
    <!-- Setor Produção (esquerda) -->
    <rect x="20" y="40" width="150" height="70" rx="4" fill="none" stroke="#2563eb" stroke-width="1"/>
    <text x="95" y="55" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">PRODUÇÃO A</text>
    <!-- Máquinas -->
    <rect x="30" y="62" width="35" height="20" rx="3" fill="#2563eb" opacity="0.4"/>
    <text x="48" y="75" text-anchor="middle" fill="#fff" font-size="6">CNC-01</text>
    <rect x="75" y="62" width="35" height="20" rx="3" fill="#2563eb" opacity="0.4"/>
    <text x="93" y="75" text-anchor="middle" fill="#fff" font-size="6">CNC-02</text>
    <rect x="120" y="62" width="35" height="20" rx="3" fill="#2563eb" opacity="0.4"/>
    <text x="138" y="75" text-anchor="middle" fill="#fff" font-size="6">CNC-03</text>
    <!-- Shadow board -->
    <rect x="30" y="90" width="25" height="12" rx="2" fill="#16a34a" opacity="0.5"/>
    <text x="43" y="99" text-anchor="middle" fill="#fff" font-size="5">SB</text>
    <!-- Quadro gestão visual -->
    <rect x="120" y="90" width="40" height="12" rx="2" fill="#eab308" opacity="0.5"/>
    <text x="140" y="99" text-anchor="middle" fill="#0b1730" font-size="5">QUADRO</text>
    <!-- Setor Produção B (esquerda baixo) -->
    <rect x="20" y="120" width="150" height="75" rx="4" fill="none" stroke="#16a34a" stroke-width="1"/>
    <text x="95" y="135" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">PRODUÇÃO B</text>
    <rect x="30" y="145" width="35" height="20" rx="3" fill="#16a34a" opacity="0.3"/>
    <rect x="75" y="145" width="35" height="20" rx="3" fill="#16a34a" opacity="0.3"/>
    <rect x="120" y="145" width="35" height="20" rx="3" fill="#16a34a" opacity="0.3"/>
    <!-- Almoxarifado (direita) -->
    <rect x="240" y="40" width="160" height="70" rx="4" fill="none" stroke="#eab308" stroke-width="1"/>
    <text x="320" y="55" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">ALMOXARIFADO</text>
    <!-- Estantes -->
    <rect x="250" y="62" width="15" height="40" rx="2" fill="#555"/>
    <text x="258" y="85" text-anchor="middle" fill="#fff" font-size="5">E1</text>
    <rect x="275" y="62" width="15" height="40" rx="2" fill="#555"/>
    <text x="283" y="85" text-anchor="middle" fill="#fff" font-size="5">E2</text>
    <rect x="300" y="62" width="15" height="40" rx="2" fill="#555"/>
    <text x="308" y="85" text-anchor="middle" fill="#fff" font-size="5">E3</text>
    <!-- Área não conforme -->
    <rect x="350" y="62" width="40" height="40" rx="4" fill="#c5383c" opacity="0.2" stroke="#c5383c" stroke-width="1.5"/>
    <text x="370" y="78" text-anchor="middle" fill="#c5383c" font-size="6" font-weight="bold">N.C.</text>
    <text x="370" y="88" text-anchor="middle" fill="#c5383c" font-size="5">Rejeito</text>
    <!-- Expedição (direita baixo) -->
    <rect x="240" y="120" width="160" height="75" rx="4" fill="none" stroke="#c5383c" stroke-width="1"/>
    <text x="320" y="135" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">EXPEDIÇÃO</text>
    <!-- Extintores -->
    <circle cx="172" cy="115" r="5" fill="#c5383c"/>
    <text x="172" y="117" text-anchor="middle" fill="#fff" font-size="5">E</text>
    <circle cx="237" cy="115" r="5" fill="#c5383c"/>
    <text x="237" y="117" text-anchor="middle" fill="#fff" font-size="5">E</text>
    <!-- Legenda -->
    <rect x="250" y="150" width="8" height="8" fill="#eab308" opacity="0.4"/>
    <text x="262" y="157" fill="#aaa" font-size="6">Corredor</text>
    <rect x="300" y="150" width="8" height="8" fill="#c5383c"/>
    <text x="312" y="157" fill="#aaa" font-size="6">Extintor</text>
    <rect x="345" y="150" width="8" height="8" fill="#c5383c" opacity="0.3"/>
    <text x="357" y="157" fill="#aaa" font-size="6">Não conforme</text>
    <rect x="250" y="165" width="8" height="8" fill="#16a34a" opacity="0.5"/>
    <text x="262" y="172" fill="#aaa" font-size="6">Shadow board</text>
    <rect x="315" y="165" width="8" height="8" fill="#eab308" opacity="0.5"/>
    <text x="327" y="172" fill="#aaa" font-size="6">Quadro visual</text>
  </svg>
  <figcaption>Layout de fábrica com elementos de gestão visual: corredores, sinalização, shadow boards e quadros</figcaption>
</div>

<h3>Princípios da gestão visual industrial</h3>
<ol>
<li><strong>Informação no ponto de uso:</strong> A informação deve estar onde é necessária, não num escritório distante</li>
<li><strong>Compreensão imediata:</strong> Qualquer pessoa deve entender em até 5 segundos</li>
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

<h3>Tipos de sinalização industrial</h3>
<table>
<tr><th>Tipo</th><th>Exemplos</th><th>Material</th><th>Custo médio</th></tr>
<tr><td>Sinalização de chão</td><td>Faixas de corredor, demarcação de equipamentos, áreas de estoque</td><td>Fita adesiva ou pintura epoxy</td><td>R$ 15-40/m (fita) ou R$ 30-60/m2 (pintura)</td></tr>
<tr><td>Placas de identificação</td><td>Nome do setor, função do equipamento, nome da estante</td><td>PVC, acrílico ou alumínio</td><td>R$ 20-80/placa</td></tr>
<tr><td>Etiquetas de prateleira</td><td>Nome do item, código, quantidade min/max, foto</td><td>Papel plastificado ou PVC fino</td><td>R$ 2-8/etiqueta</td></tr>
<tr><td>Andon (semáforo)</td><td>Verde (normal), amarelo (atenção), vermelho (parada)</td><td>LED industrial</td><td>R$ 150-600/unidade</td></tr>
<tr><td>Marcadores de nível</td><td>Nível min/max em recipientes de líquidos ou estoque</td><td>Fita colorida ou pintura</td><td>R$ 5-15/marcador</td></tr>
</table>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de alimentos de Marília (SP) implantou gestão visual completa em 45 dias. Investimento: R$ 14.000 (quadros, placas, sinalização de chão, etiquetas). Resultado: o tempo de treinamento de novos operadores na linha de produção caiu de 2 semanas para 5 dias, porque o ambiente "ensina" sozinho. Auditores da ANVISA elogiaram especificamente a identificação de áreas e o controle visual de validade.</div>

<h3>Sinalização de segurança integrada ao 5S</h3>
<p>O 5S é a sinalização de segurança (NR-26, NBR 7195) se complementam. Ao implantar o 5S, aproveite para revisar e melhorar a sinalização de segurança:</p>
<ul>
<li><strong>Rotas de fuga:</strong> Setas fotoluminescentes no chão e nas paredes</li>
<li><strong>Extintores:</strong> Demarcação de chão vermelha, placa de identificação com tipo e validade</li>
<li><strong>Painéis elétricos:</strong> Identificação de circuitos, aviso de risco de choque</li>
<li><strong>Áreas de risco:</strong> Zebrado amarelo/preto, placa com tipo de risco e EPI obrigatório</li>
<li><strong>Saída de emergência:</strong> Sinalização verde com pictograma e seta direcional</li>
</ul>

<h3>Gestão visual digital</h3>
<p>Empresas mais avançadas estão complementando a gestão visual física com ferramentas digitais:</p>
<ul>
<li><strong>TV/monitor no setor:</strong> Exibindo indicadores em tempo real (OEE, produção, qualidade)</li>
<li><strong>Apps de auditoria 5S:</strong> Fotos com geolocalização, pontuação automática, histórico de evolução</li>
<li><strong>QR codes:</strong> Nas máquinas e estantes, linkando para instrução de trabalho, ficha técnica ou histórico de manutenção</li>
</ul>

<div class="callout"><strong>Equilíbrio:</strong> A gestão visual física (quadros, placas, cores) e insubstituível — funciona sem energia, sem wifi, sem celular. A digital complementa, mas não substitui. Comece pelo físico, depois adicione o digital onde agregar valor.</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Gestão Visual Física</button><button class="tab-btn">Gestão Visual Digital</button></div>
  <div class="tab-panel active"><p><strong>Vantagens:</strong> Funciona sem energia, sem wifi. Visível a qualquer momento. Baixo custo de implantação. Sem barreira tecnológica para operadores.</p><p><strong>Ferramentas:</strong> Quadros de bordo, placas de identificação, sinalização de chão, shadow boards, Andon, etiquetas.</p><p><strong>Quando usar:</strong> Sempre. É a base insubstituível da gestão visual.</p></div>
  <div class="tab-panel"><p><strong>Vantagens:</strong> Indicadores em tempo real, histórico automático, fotos geolocalizadas, acesso remoto.</p><p><strong>Ferramentas:</strong> TVs/monitores no setor, apps de auditoria, QR codes em máquinas/estantes.</p><p><strong>Quando usar:</strong> Como complemento após o físico estar consolidado. Ideal para fábricas com 100+ funcionários.</p></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A informação deve estar onde é necessária, no ponto de uso." data-fb-nok="Incorreto. O princípio fundamental da gestão visual é que a informação fique no ponto de uso, não centralizada.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o princípio mais importante da gestão visual industrial?</div>
  <button class="qi-option" data-key="a">Toda informação deve ser digital para facilitar o acesso</button>
  <button class="qi-option" data-key="b">A informação deve estar no ponto de uso, compreensível em 5 segundos</button>
  <button class="qi-option" data-key="c">Apenas supervisores devem ter acesso aos quadros de indicadores</button>
  <div class="qi-feedback"></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Um auditor da ANVISA visitou uma indústria de alimentos em Marília (SP) e comentou: "Não precisei pedir nenhum documento na primeira hora. O chão de fábrica me contou tudo: onde era cada área, quais produtos estavam liberados, quais estavam bloqueados, quando foi a última limpeza. A gestão visual economizou meu tempo e me deu confiança no sistema da empresa."</p>
</div>
`}, 'Layout de quadro de gestão visual (modelo A1)'),

  (${m3.id}, '3-4-engajamento-equipe-comunicação', 'Engajamento de equipe e comunicação', '20 min', 4, ${`
<h2>Engajamento de equipe e comunicação</h2>
<p>O 5S só funciona se as <strong>pessoas acreditarem no programa</strong>. Não se implanta 5S por decreto — se implanta por <strong>convencimento, envolvimento e comunicação</strong>. Esta aula aborda as estratégias práticas para engajar todos os níveis da organização.</p>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> "As pessoas apoiam o que ajudam a construir." Quanto mais a equipe participar das decisões do 5S (onde guardar, como organizar, que padrão definir), mais ela vai defender o programa. Faça com eles, nunca para eles.</div></div>

<h3>Por que as pessoas resistem ao 5S?</h3>
<p>Entender a resistência é o primeiro passo para supera-la:</p>
<table>
<tr><th>Motivo da resistência</th><th>O que a pessoa pensa</th><th>Como lidar</th></tr>
<tr><td>Medo de mudança</td><td>"Vai mudar minha rotina e eu não sei se vou me adaptar"</td><td>Envolver na decisão, treinar antes de cobrar</td></tr>
<tr><td>Experiência negativa anterior</td><td>"Já tentaram 5S aqui e não funcionou"</td><td>Reconhecer o passado, mostrar o que será diferente desta vez</td></tr>
<tr><td>Falta de tempo</td><td>"Mal dou conta da produção, agora querem que eu limpe?"</td><td>Mostrar que 5 min de organização economizam 30 min de busca</td></tr>
<tr><td>Senso de propriedade</td><td>"Ninguém vai mexer nas minhas coisas"</td><td>Participação na classificação, respeito ao conhecimento do operador</td></tr>
<tr><td>Descrença na liderança</td><td>"Eles nem arrumam o escritório deles"</td><td>Liderança pelo exemplo — comece de cima</td></tr>
</table>

<h3>Estratégias de engajamento por nível</h3>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Alta Direção</button><button class="tab-btn">Supervisores/Líderes</button><button class="tab-btn">Operadores</button></div>
  <div class="tab-panel active">
    <p><strong>Linguagem:</strong> ROI, produtividade, redução de custo, imagem para clientes e auditores</p>
    <p><strong>Ferramenta:</strong> Apresente o diagnóstico com fotos e números. Compare o custo do 5S com o custo do desperdício.</p>
    <p><strong>Compromisso:</strong> A direção deve estar presente no Dia D e nas auditorias iniciais.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Linguagem:</strong> Facilitação do trabalho, menos problemas diários, equipe mais autônoma</p>
    <p><strong>Ferramenta:</strong> Treine-os como auditores 5S. Dando-lhes papel ativo, cria senso de propriedade.</p>
    <p><strong>Compromisso:</strong> Cada supervisor é responsável pela nota 5S da sua área.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Linguagem:</strong> Conforto, segurança, orgulho do ambiente, menos tempo perdido</p>
    <p><strong>Ferramenta:</strong> Envolvimento na decisão (eles decidem o que fica e o que sai, onde cada coisa fica). Faça com eles, não para eles.</p>
    <p><strong>Compromisso:</strong> Cada operador é responsável pelo check diário da sua área.</p>
  </div>
</div>

<div class="callout"><strong>Princípio fundamental:</strong> "As pessoas apoiam o que ajudam a construir." Quanto mais a equipe participar das decisões do 5S (onde guardar, como organizar, que padrão definir), mais ela vai defender o programa.</div>

<h3>Comunicação do programa 5S</h3>
<p>A comunicação deve ser constante, não só no lançamento:</p>
<table>
<tr><th>Momento</th><th>Canal</th><th>Mensagem</th></tr>
<tr><td>Antes do lançamento</td><td>Reunião geral, cartazes</td><td>"O que é 5S, por que estamos fazendo, como vai funcionar"</td></tr>
<tr><td>Dia D</td><td>Presencial, fotos</td><td>"Estamos transformando nosso ambiente juntos"</td></tr>
<tr><td>Primeiras semanas</td><td>Mural, e-mail, app</td><td>Fotos antes/depois, resultados iniciais</td></tr>
<tr><td>Mensal</td><td>Quadro de gestão visual</td><td>Nota da auditoria, ranking de áreas, evolução</td></tr>
<tr><td>Trimestral</td><td>Reunião geral</td><td>Resultados consolidados, reconhecimento das melhores áreas</td></tr>
</table>

<h3>Programa de reconhecimento 5S</h3>
<p>O reconhecimento é mais eficaz que a punição para manter o programa vivo. Modelos que funcionam:</p>
<ul>
<li><strong>Área destaque do mês:</strong> A área com melhor nota na auditoria ganha um troféu simbólico (um selo, uma bandeira, um quadro) que fica exposto até a próxima avaliação. Custo: zero.</li>
<li><strong>Foto no quadro:</strong> A equipe da melhor área tem foto no quadro de gestão visual. Orgulho visível.</li>
<li><strong>Café com a direção:</strong> A equipe vencedora toma um café com o diretor, que pessoalmente agradece o esforço. Custo: R$ 50. Impacto: enorme.</li>
<li><strong>Prêmio trimestral:</strong> A melhor área do trimestre recebe um prêmio coletivo (churrasco, cesta básica extra, folga). Custo: R$ 500-1.500. Retorno: incalculável em motivação.</li>
</ul>

<div class="example"><strong>Caso real:</strong> Uma metalúrgica de Piracicaba (SP) com 180 funcionários criou o "Torneio 5S". As 6 áreas de produção competem mensalmente. A vencedora ganha uma estrela no quadro. Ao final de 6 meses, a área com mais estrelas ganha um churrasco pago pela empresa. Em 2 anos de programa, a nota média subiu de 45% para 87%, e a rotatividade de pessoal caiu 18% (as pessoas passaram a ter mais orgulho do ambiente de trabalho).</div>

<h3>O papel do comitê 5S</h3>
<p>O comitê 5S é o grupo responsável por coordenar o programa. Composição ideal:</p>
<ul>
<li>1 coordenador (preferencialmente da área de qualidade ou produção)</li>
<li>1 representante de cada setor principal</li>
<li>1 representante da direção (para garantir autoridade e recursos)</li>
<li>Mandato de 12 meses, renovável</li>
</ul>
<p>Atribuições: planejar auditorias, compilar resultados, propor melhorias, organizar eventos de reconhecimento, treinar novos funcionários.</p>

<div class="diagram">
  <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Programa de Reconhecimento 5S</text>
    <!-- Troféu central -->
    <rect x="150" y="35" width="100" height="50" rx="8" fill="#eab308" opacity="0.2" stroke="#eab308" stroke-width="1.5"/>
    <text x="200" y="55" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">RECONHECIMENTO</text>
    <text x="200" y="70" text-anchor="middle" fill="#eab308" font-size="8">Mais eficaz que punição</text>
    <!-- Opções -->
    <rect x="10" y="100" width="85" height="55" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1"/>
    <text x="53" y="118" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">Área Destaque</text>
    <text x="53" y="130" text-anchor="middle" fill="#aaa" font-size="7">Troféu simbólico</text>
    <text x="53" y="142" text-anchor="middle" fill="#16a34a" font-size="8">Custo: R$ 0</text>
    <rect x="105" y="100" width="85" height="55" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1"/>
    <text x="148" y="118" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">Foto no Quadro</text>
    <text x="148" y="130" text-anchor="middle" fill="#aaa" font-size="7">Orgulho visível</text>
    <text x="148" y="142" text-anchor="middle" fill="#2563eb" font-size="8">Custo: R$ 0</text>
    <rect x="200" y="100" width="95" height="55" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1"/>
    <text x="248" y="118" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">Café c/ Direção</text>
    <text x="248" y="130" text-anchor="middle" fill="#aaa" font-size="7">Agradecimento pessoal</text>
    <text x="248" y="142" text-anchor="middle" fill="#eab308" font-size="8">Custo: R$ 50</text>
    <rect x="305" y="100" width="85" height="55" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1"/>
    <text x="348" y="118" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">Prêmio Trim.</text>
    <text x="348" y="130" text-anchor="middle" fill="#aaa" font-size="7">Churrasco/cesta</text>
    <text x="348" y="142" text-anchor="middle" fill="#c5383c" font-size="8">R$ 500-1.500</text>
    <!-- Seta impacto -->
    <text x="200" y="172" text-anchor="middle" fill="#aaa" font-size="8">Impacto na motivação: alto independente do custo</text>
  </svg>
  <figcaption>4 estratégias de reconhecimento: de custo zero a investimento moderado, todas com alto impacto</figcaption>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>O "Torneio 5S" de uma metalúrgica em Piracicaba (SP) transformou a cultura da empresa. As 6 áreas competem mensalmente e a vencedora ganha uma estrela no quadro. Em 2 anos, a nota média subiu de 45% para 87%, e a rotatividade caiu 18%. O segredo? As pessoas passaram a ter orgulho do ambiente de trabalho — e orgulho é o combustível da disciplina.</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! As pessoas apoiam o que ajudam a construir." data-fb-nok="Incorreto. O princípio fundamental do engajamento é envolver as pessoas nas decisões — o que fica, o que sai, onde organizar.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o princípio mais eficaz para engajar operadores no 5S?</div>
  <button class="qi-option" data-key="a">Envolver nas decisões — fazer com eles, não para eles</button>
  <button class="qi-option" data-key="b">Impor regras rígidas e punir quem não cumprir</button>
  <button class="qi-option" data-key="c">Contratar consultoria para definir tudo e a equipe apenas executa</button>
  <div class="qi-feedback"></div>
</div>
`}, 'Modelo de programa de reconhecimento 5S')`;

  // ── Module 4: Sustentação e Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Sustentação e Melhoria', 'Auditoria, indicadores, melhoria contínua e integração com outros programas', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-auditoria-5s-checklist-pontuacao', 'Auditoria 5S: checklist e pontuação', '25 min', 1, ${`
<h2>Auditoria 5S: checklist e pontuação</h2>
<p>A auditoria 5S é o <strong>instrumento que mantém o programa vivo</strong>. Sem auditoria, não há medição. Sem medição, não há gestão. Sem gestão, o 5S desaparece em semanas. A auditoria não é "fiscalização" — é um <strong>diagnóstico periódico</strong> que mostra onde a área está e para onde precisa ir.</p>

<div class="diagram">
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Radar de Auditoria 5S — Exemplo</text>
    <!-- Radar background -->
    <polygon points="200,45 280,90 260,160 140,160 120,90" fill="none" stroke="#333" stroke-width="1"/>
    <polygon points="200,65 260,100 248,145 152,145 140,100" fill="none" stroke="#333" stroke-width="0.5"/>
    <polygon points="200,85 240,110 235,130 165,130 160,110" fill="none" stroke="#333" stroke-width="0.5"/>
    <!-- Eixos -->
    <line x1="200" y1="45" x2="200" y2="105" stroke="#555" stroke-width="0.5"/>
    <line x1="280" y1="90" x2="200" y2="105" stroke="#555" stroke-width="0.5"/>
    <line x1="260" y1="160" x2="200" y2="105" stroke="#555" stroke-width="0.5"/>
    <line x1="140" y1="160" x2="200" y2="105" stroke="#555" stroke-width="0.5"/>
    <line x1="120" y1="90" x2="200" y2="105" stroke="#555" stroke-width="0.5"/>
    <!-- Labels -->
    <text x="200" y="38" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">Seiri 85%</text>
    <text x="295" y="90" fill="#2563eb" font-size="9" font-weight="bold">Seiton 78%</text>
    <text x="275" y="172" fill="#16a34a" font-size="9" font-weight="bold">Seiso 90%</text>
    <text x="110" y="172" fill="#eab308" font-size="9" font-weight="bold">Seiketsu 70%</text>
    <text x="80" y="90" fill="#c5383c" font-size="9" font-weight="bold">Shitsuke 65%</text>
    <!-- Área preenchida -->
    <polygon points="200,52 268,93 254,155 148,155 128,93" fill="#2563eb" opacity="0.2" stroke="#2563eb" stroke-width="2"/>
    <circle cx="200" cy="52" r="3" fill="#c5383c"/>
    <circle cx="268" cy="93" r="3" fill="#2563eb"/>
    <circle cx="254" cy="155" r="3" fill="#16a34a"/>
    <circle cx="148" cy="155" r="3" fill="#eab308"/>
    <circle cx="128" cy="93" r="3" fill="#c5383c"/>
    <!-- Nota total -->
    <text x="200" y="195" text-anchor="middle" fill="#eab308" font-size="12" font-weight="bold">Nota total: 77,6% — BOM</text>
  </svg>
  <figcaption>Gráfico radar: visualize a nota de cada senso e identifique onde focar a melhoria</figcaption>
</div>

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
<h3>Template: Auditoria 5S — Checklist de Pontuação</h3>
<p><strong>Área:</strong> _____________ | <strong>Auditor:</strong> _____________ | <strong>Data:</strong> ___/___/___</p>
<p><strong>Escala:</strong> 0 = Não atende | 1 = Atende parcialmente | 2 = Atende plenamente</p>

<p><strong>SEIRI (Utilização)</strong></p>
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
<tr><td>2.4</td><td>Demarcação de chão íntegra e respeitada</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
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
<tr><td>5.4</td><td>Ações corretivas de auditorias anteriores foram concluídas</td><td>[ ]</td><td>[ ]</td><td>[ ]</td></tr>
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
<li><strong>Caminhe pela área:</strong> Não audite de longe. Entre, olhe atrás das máquinas, abra armários, verifique gavetas.</li>
<li><strong>Converse com operadores:</strong> Pergunte: "Onde fica tal ferramenta? Qual é a rotina de limpeza?" Se o operador sabe responder, o 5S está funcionando.</li>
<li><strong>Teste os 30 segundos:</strong> Peça para localizar um item específico. Cronometre.</li>
<li><strong>Fotografe desvios:</strong> Foto com data e hora e evidência objetiva.</li>
<li><strong>Feedback imediato:</strong> Ao final, converse com o líder da área sobre os achados. Não espere o relatório formal.</li>
<li><strong>Registre pontos positivos:</strong> A auditoria não é só para achar defeitos. Reconheca o que está bom.</li>
</ol>

<div class="example"><strong>Benchmark:</strong> Empresas com programa 5S maduro costumam ter nota média entre 80% e 92%. Notas acima de 95% por períodos longos podem indicar auditoria branda (complacência). O ideal é que haja sempre oportunidades de melhoria identificadas — isso mostra que o olhar crítico contínua ativo.</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Caminhe pela área</strong><br>Entre, olhe atrás das máquinas, abra armários, verifique gavetas</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Converse com operadores</strong><br>Pergunte: "Onde fica tal ferramenta? Qual a rotina de limpeza?"</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Teste os 30 segundos</strong><br>Peça para localizar um item específico e cronometre</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Fotografe desvios</strong><br>Foto com data e hora = evidência objetiva</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Feedback imediato</strong><br>Converse com o líder da área ao final — não espere relatório</div></div>
  <div class="step-item"><div class="step-content"><strong>6. Registre pontos positivos</strong><br>Auditoria não é só para achar defeitos — reconheça o que está bom</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Roberto, gerente de qualidade de uma fábrica de autopeças em Betim (MG): "No começo, os operadores tinham medo da auditoria. Mudou quando comecei a elogiar primeiro: 'Olha como esse shadow board está impecável!' Depois apontava o que melhorar. Hoje os próprios operadores me chamam para mostrar melhorias que fizeram por conta própria."</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A auditoria cruzada traz olhar externo e dissemina boas práticas entre setores." data-fb-nok="Incorreto. Na auditoria cruzada, líderes de diferentes setores auditam áreas uns dos outros.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O que é uma "auditoria cruzada" no contexto do 5S?</div>
  <button class="qi-option" data-key="a">Auditoria realizada por consultoria externa</button>
  <button class="qi-option" data-key="b">O líder do setor A audita o setor B, e vice-versa</button>
  <button class="qi-option" data-key="c">Dois auditores avaliam a mesma área simultaneamente</button>
  <div class="qi-feedback"></div>
</div>
`}, 'Checklist de auditoria 5S (modelo completo com pontuação)'),

  (${m4.id}, '4-2-indicadores-5s-acompanhamento', 'Indicadores de 5S é acompanhamento', '20 min', 2, ${`
<h2>Indicadores de 5S é acompanhamento</h2>
<p>O 5S, como qualquer programa de gestão, precisa de <strong>indicadores para ser gerenciado</strong>. Sem números, não há como saber se o programa está avançando, estagnado ou regredindo. Os indicadores transformam percepção em <strong>fatos</strong>.</p>

<div class="diagram">
  <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Evolução da Nota 5S — 12 meses</text>
    <!-- Eixos -->
    <line x1="40" y1="130" x2="380" y2="130" stroke="#555" stroke-width="1"/>
    <line x1="40" y1="30" x2="40" y2="130" stroke="#555" stroke-width="1"/>
    <!-- Labels eixo Y -->
    <text x="30" y="35" text-anchor="end" fill="#aaa" font-size="7">100%</text>
    <text x="30" y="55" text-anchor="end" fill="#aaa" font-size="7">80%</text>
    <text x="30" y="80" text-anchor="end" fill="#aaa" font-size="7">60%</text>
    <text x="30" y="105" text-anchor="end" fill="#aaa" font-size="7">40%</text>
    <text x="30" y="130" text-anchor="end" fill="#aaa" font-size="7">20%</text>
    <!-- Meta line -->
    <line x1="40" y1="50" x2="380" y2="50" stroke="#16a34a" stroke-width="1" stroke-dasharray="5,3"/>
    <text x="385" y="53" fill="#16a34a" font-size="7">Meta 80%</text>
    <!-- Linha de evolução -->
    <polyline points="60,115 90,100 120,90 150,82 180,75 210,68 240,62 270,58 300,55 330,52 360,50" fill="none" stroke="#2563eb" stroke-width="2.5"/>
    <!-- Pontos -->
    <circle cx="60" cy="115" r="3" fill="#c5383c"/>
    <circle cx="120" cy="90" r="3" fill="#eab308"/>
    <circle cx="180" cy="75" r="3" fill="#eab308"/>
    <circle cx="240" cy="62" r="3" fill="#16a34a"/>
    <circle cx="300" cy="55" r="3" fill="#16a34a"/>
    <circle cx="360" cy="50" r="3" fill="#16a34a"/>
    <!-- Labels meses -->
    <text x="60" y="145" text-anchor="middle" fill="#aaa" font-size="7">M1</text>
    <text x="120" y="145" text-anchor="middle" fill="#aaa" font-size="7">M3</text>
    <text x="180" y="145" text-anchor="middle" fill="#aaa" font-size="7">M5</text>
    <text x="240" y="145" text-anchor="middle" fill="#aaa" font-size="7">M7</text>
    <text x="300" y="145" text-anchor="middle" fill="#aaa" font-size="7">M9</text>
    <text x="360" y="145" text-anchor="middle" fill="#aaa" font-size="7">M12</text>
    <!-- Anotações -->
    <text x="75" y="110" fill="#c5383c" font-size="7">28%</text>
    <text x="355" y="45" fill="#16a34a" font-size="7">80%</text>
  </svg>
  <figcaption>Curva típica de evolução do 5S: de 28% (diagnóstico) a 80% (meta) em 12 meses</figcaption>
</div>

<h3>Indicadores primários do 5S</h3>
<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta sugerida</th><th>Frequência</th></tr>
<tr><td><strong>Nota de auditoria 5S (%)</strong></td><td>Aderência ao padrão geral</td><td>Acima de 80% após 12 meses</td><td>Mensal</td></tr>
<tr><td><strong>Nota por senso (%)</strong></td><td>Pontuação de cada S separadamente</td><td>Nenhum senso abaixo de 60%</td><td>Mensal</td></tr>
<tr><td><strong>Tendência de evolução</strong></td><td>A nota está subindo, estável ou caindo?</td><td>Tendência de alta nos primeiros 12 meses</td><td>Trimestral</td></tr>
<tr><td><strong>Taxa de fechamento de ações</strong></td><td>% de ações corretivas da auditoria concluídas no prazo</td><td>Acima de 90%</td><td>Mensal</td></tr>
</table>

<h3>Indicadores secundários (impacto do 5S)</h3>
<p>Além dos indicadores diretos do programa, é importante medir o <strong>impacto do 5S nos resultados da operação</strong>:</p>
<table>
<tr><th>Indicador</th><th>Relação com o 5S</th><th>Como medir</th></tr>
<tr><td>Tempo de setup</td><td>Seiton reduz busca de ferramentas e materiais</td><td>Cronometrar setup antes e depois do 5S</td></tr>
<tr><td>Acidentes de trabalho</td><td>Seiso elimina riscos; Seiton libera corredores</td><td>Registros de SST (CAT, quase-acidentes)</td></tr>
<tr><td>Retrabalho / refugo</td><td>Organização reduz troca de material e erros</td><td>Índice de rejeição por área</td></tr>
<tr><td>Reclamações de clientes</td><td>Ambiente organizado reduz erros de expedição</td><td>SAC / sistema de reclamações</td></tr>
<tr><td>Área útil disponível</td><td>Seiri libera espaço</td><td>Medição em m2 recuperados</td></tr>
<tr><td>Custo de manutenção corretiva</td><td>Seiso como inspeção previne quebras</td><td>Ordens de serviço corretivas vs. preventivas</td></tr>
</table>

<div class="callout"><strong>Correlação e causalidade:</strong> Cuidado ao atribuir toda melhoria ao 5S. Se você implantou 5S é TPM ao mesmo tempo, a redução de paradas pode ser efeito dos dois. Mas se o 5S foi a única mudança, a correlação é mais forte. Documente as datas de implantação de cada programa para poder isolar os efeitos.</div>

<h3>Dashboard de 5S — como montar</h3>
<p>O acompanhamento deve ser visual e acessível. Opções:</p>

<h3>Opção 1 — Quadro físico (recomendado para início)</h3>
<ul>
<li>Gráfico de barras mensal com a nota de cada área (desenhado a mão ou impresso)</li>
<li>Semáforo por área: verde (acima de 80%), amarelo (60-80%), vermelho (abaixo de 60%)</li>
<li>Fotos antes/depois das 3 maiores melhorias do mês</li>
<li>Lista de ações pendentes com responsável e prazo</li>
</ul>

<h3>Opção 2 — Planilha compartilhada (Google Sheets / Excel Online)</h3>
<ul>
<li>Aba de registro de auditorias (data, área, nota por senso, nota total)</li>
<li>Aba de gráfico de evolução (linha do tempo com notas mensais por área)</li>
<li>Aba de ações corretivas (item, responsável, prazo, status)</li>
<li>Dashboard automático com gráficos</li>
</ul>

<h3>Opção 3 — App especializado</h3>
<p>Para empresas maiores (100+ funcionários), apps como ChecklistFacil, iAuditor ou Auditoria Digital permitem:</p>
<ul>
<li>Auditorias no celular com fotos geolocalizadas</li>
<li>Pontuação automática</li>
<li>Geração de relatórios em PDF</li>
<li>Notificações de ações vencidas</li>
<li>Custo: R$ 100 a R$ 500/mês dependendo do plano</li>
</ul>

<div class="example"><strong>Caso prático:</strong> Uma fábrica de peças em Manaus (AM) migrou das auditorias em papel para o app ChecklistFacil. O tempo de auditoria por área caiu de 45 minutos para 20 minutos (porque o app já tem os critérios pre-carregados). O tempo de compilação dos resultados caiu de 4 horas/mês para zero (o app gera o relatório automaticamente). É o histórico de fotos permitiu criar um "album de evolução" que impressiona clientes em visitas a fábrica.</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">>80%</div><div class="kpi-label">Meta nota auditoria (12 meses)</div></div>
  <div class="kpi-card"><div class="kpi-value">>60%</div><div class="kpi-label">Piso mínimo por senso</div></div>
  <div class="kpi-card"><div class="kpi-value">>90%</div><div class="kpi-label">Fechamento de ações</div></div>
  <div class="kpi-card"><div class="kpi-value">45→20 min</div><div class="kpi-label">Auditoria c/ app</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Cláudia, coordenadora de qualidade em uma fábrica de cosméticos em Diadema (SP): "Quando começamos a mostrar o gráfico de evolução mês a mês na reunião geral, a competição saudável entre os setores explodiu. A área de envase, que sempre foi a pior, decidiu virar a melhor — e conseguiu em 4 meses. Tudo porque viram o número deles no quadro, menor que os outros."</p>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A tendência de evolução é verificada trimestralmente." data-fb-nok="Incorreto. O indicador de tendência (nota subindo, estável ou caindo) é verificado a cada trimestre.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual meta de nota de auditoria 5S é recomendada após 12 meses de programa?</div>
  <button class="qi-option" data-key="a">Acima de 50%</button>
  <button class="qi-option" data-key="b">Acima de 60%</button>
  <button class="qi-option" data-key="c">Acima de 80%</button>
  <div class="qi-feedback"></div>
</div>

<h3>Reunião mensal de 5S</h3>
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

<div class="diagram">
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <text x="200" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Ciclo PDCA aplicado ao 5S</text>
    <!-- Ciclo -->
    <circle cx="200" cy="115" r="70" fill="none" stroke="#555" stroke-width="1.5"/>
    <!-- P -->
    <path d="M200 45 A70 70 0 0 1 270 115" fill="#2563eb" opacity="0.2" stroke="#2563eb" stroke-width="2"/>
    <text x="250" y="70" fill="#2563eb" font-size="11" font-weight="bold">PLAN</text>
    <text x="260" y="83" fill="#aaa" font-size="7">Diagnóstico</text>
    <text x="260" y="93" fill="#aaa" font-size="7">Metas, Padrões</text>
    <!-- D -->
    <path d="M270 115 A70 70 0 0 1 200 185" fill="#16a34a" opacity="0.2" stroke="#16a34a" stroke-width="2"/>
    <text x="250" y="158" fill="#16a34a" font-size="11" font-weight="bold">DO</text>
    <text x="258" y="170" fill="#aaa" font-size="7">Dia D, Seiri</text>
    <text x="258" y="180" fill="#aaa" font-size="7">Seiton, Seiso</text>
    <!-- C -->
    <path d="M200 185 A70 70 0 0 1 130 115" fill="#eab308" opacity="0.2" stroke="#eab308" stroke-width="2"/>
    <text x="120" y="158" fill="#eab308" font-size="11" font-weight="bold">CHECK</text>
    <text x="110" y="170" fill="#aaa" font-size="7">Auditorias</text>
    <text x="110" y="180" fill="#aaa" font-size="7">Indicadores</text>
    <!-- A -->
    <path d="M130 115 A70 70 0 0 1 200 45" fill="#c5383c" opacity="0.2" stroke="#c5383c" stroke-width="2"/>
    <text x="120" y="70" fill="#c5383c" font-size="11" font-weight="bold">ACT</text>
    <text x="110" y="83" fill="#aaa" font-size="7">Ações corretivas</text>
    <text x="110" y="93" fill="#aaa" font-size="7">Kaizen, 5W2H</text>
    <!-- Centro -->
    <circle cx="200" cy="115" r="25" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="200" y="112" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">5S</text>
    <text x="200" y="123" text-anchor="middle" fill="#fff" font-size="7">contínuo</text>
  </svg>
  <figcaption>O 5S segue naturalmente o ciclo PDCA: planejar, executar, verificar, agir</figcaption>
</div>

<p>O 5S segue naturalmente o ciclo PDCA:</p>
<table>
<tr><th>Fase</th><th>Aplicação no 5S</th><th>Ferramentas</th></tr>
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
<li><strong>Definir ação:</strong> O que fazer para corrigir e prevenir recorrência</li>
<li><strong>Definir responsável e prazo:</strong> Quem faz e até quando</li>
<li><strong>Executar:</strong> Realizar a ação</li>
<li><strong>Verificar eficácia:</strong> Na próxima auditoria, o desvio desapareceu?</li>
</ol>

<div class="template-box">
<h3>Template: Plano de Ação 5S (5W2H simplificado)</h3>
<table>
<tr><th>Campo</th><th>Descrição</th><th>Preenchimento</th></tr>
<tr><td><strong>O que? (What)</strong></td><td>Qual é o desvio/oportunidade?</td><td>______________________________</td></tr>
<tr><td><strong>Por que? (Why)</strong></td><td>Qual a causa raiz?</td><td>______________________________</td></tr>
<tr><td><strong>Onde? (Where)</strong></td><td>Em qual área/setor?</td><td>______________________________</td></tr>
<tr><td><strong>Quem? (Who)</strong></td><td>Responsável pela ação</td><td>______________________________</td></tr>
<tr><td><strong>Quando? (When)</strong></td><td>Prazo para conclusão</td><td>___/___/___</td></tr>
<tr><td><strong>Como? (How)</strong></td><td>Descrição da ação</td><td>______________________________</td></tr>
<tr><td><strong>Quanto? (How much)</strong></td><td>Custo estimado (se houver)</td><td>R$ ________</td></tr>
</table>
<p><strong>Status:</strong> [ ] Pendente | [ ] Em andamento | [ ] Concluída | [ ] Verificada eficaz</p>
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
<p><strong>Ação:</strong> Relocar o shadow board para a parede ao lado das máquinas CNC (distância máxima de 3 metros). Custo: R$ 120 (parafusos e mão de obra). Prazo: 5 dias.</p></div>

<h3>Kaizen no 5S — pequenas melhorias continuas</h3>
<p>Além de corrigir desvios, o 5S pode (e deve) evoluir continuamente. Ideias de Kaizen no 5S:</p>

<ul class="checklist">
  <li><span class="ck-box"></span>Expandir shadow boards para áreas que ainda não tinham</li>
  <li><span class="ck-box"></span>Trocar fita de demarcação por pintura epóxi (mais durável)</li>
  <li><span class="ck-box"></span>Adicionar LED em estantes escuras para facilitar identificação</li>
  <li><span class="ck-box"></span>Instalar etiquetas com QR code linkando a fichas técnicas</li>
  <li><span class="ck-box"></span>Otimizar o check diário de 5 min para 3 min</li>
  <li><span class="ck-box"></span>Criar "banco de ideias" para sugestões de Kaizen dos operadores</li>
</ul>

<h3>Quando o 5S regride — plano de recuperação</h3>
<p>Se a nota de auditoria cair abaixo de 60% após já ter estado acima de 80%, é necessário um plano de recuperação:</p>
<ol>
<li><strong>Diagnóstico rápido:</strong> Identificar a causa da regressão (mudança de líder? Rotatividade alta? Perda de interesse?)</li>
<li><strong>Reunião com a equipe:</strong> Não para punir, mas para entender e replanejar</li>
<li><strong>Mini Dia D:</strong> Um mutirão de 2-3 horas para restaurar o padrão</li>
<li><strong>Aumento temporário de auditorias:</strong> Voltar para semanal até estabilizar acima de 70%</li>
<li><strong>Reforço da liderança:</strong> O gestor deve estar mais presente na área</li>
</ol>

<div class="callout"><strong>Dado real:</strong> Em uma pesquisa com 45 indústrias brasileiras que implantaram 5S (SENAI-PR, 2021), 62% relataram pelo menos uma regressão significativa nos primeiros 2 anos. Das que se recuperaram, 100% tinham sistema de auditoria ativo. Das que não se recuperaram, apenas 15% faziam auditorias regulares. A auditoria é o "seguro de vida" do programa 5S.</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Sem ação corretiva</h4><ul><li>Desvios se acumulam</li><li>Nota cai progressivamente</li><li>Equipe perde credibilidade no programa</li><li>Auditoria vira "formalidade"</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Com PDCA ativo</h4><ul><li>Desvios tratados na raiz</li><li>Nota sobe consistentemente</li><li>Equipe vê resultado das ações</li><li>Melhoria contínua real</li></ul></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma indústria de plásticos em Caxias do Sul (RS) teve queda da nota de 82% para 55% quando mudou o turno da noite sem treinar os novos operadores. O comitê 5S fez um mini Dia D de 3 horas, retomou auditorias semanais e criou um programa de integração com "padrinho de 5S". Em 2 meses, a nota voltou a 78%. Aprenderam que o 5S precisa de blindagem contra rotatividade.</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A técnica dos 5 Por Quês permite encontrar a causa raiz de desvios de forma simples." data-fb-nok="Incorreto. Os 5 Por Quês é a técnica recomendada para ir além do sintoma e encontrar a causa raiz.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual técnica é recomendada para encontrar a causa raiz de desvios na auditoria 5S?</div>
  <button class="qi-option" data-key="a">5 Por Quês — perguntar "por quê?" até chegar na causa raiz</button>
  <button class="qi-option" data-key="b">Diagrama de Gantt</button>
  <button class="qi-option" data-key="c">Análise SWOT</button>
  <div class="qi-feedback"></div>
</div>
`}, 'Modelo de plano de ação 5W2H para 5S'),

  (${m4.id}, '4-4-integração-5s-iso-outros-programas', 'Integracao do 5S com ISO 9001 e outros programas', '22 min', 4, ${`
<h2>Integração do 5S com ISO 9001 e outros programas</h2>
<p>O 5S não existe isolado. Ele é a <strong>base sobre a qual outros programas de gestão se apoiam</strong>. Nesta aula, vamos explorar como integrar o 5S com ISO 9001, ISO 14001, Lean Manufacturing, TPM e outros programas comuns na indústria brasileira.</p>

<div class="diagram">
  <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">5S como fundação do sistema de gestão</text>
    <!-- Base 5S -->
    <rect x="40" y="170" width="340" height="40" rx="6" fill="#c5383c"/>
    <text x="210" y="193" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">5S — FUNDAÇÃO</text>
    <!-- ISO 9001 -->
    <rect x="50" y="125" width="100" height="38" rx="5" fill="#2563eb"/>
    <text x="100" y="143" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ISO 9001</text>
    <text x="100" y="155" text-anchor="middle" fill="#fff" font-size="7">Qualidade</text>
    <!-- Lean -->
    <rect x="160" y="125" width="100" height="38" rx="5" fill="#16a34a"/>
    <text x="210" y="143" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">LEAN</text>
    <text x="210" y="155" text-anchor="middle" fill="#fff" font-size="7">Produção enxuta</text>
    <!-- TPM -->
    <rect x="270" y="125" width="100" height="38" rx="5" fill="#eab308"/>
    <text x="320" y="143" text-anchor="middle" fill="#0b1730" font-size="9" font-weight="bold">TPM</text>
    <text x="320" y="155" text-anchor="middle" fill="#0b1730" font-size="7">Manutenção</text>
    <!-- ISO 14001 -->
    <rect x="80" y="80" width="110" height="38" rx="5" fill="#16a34a" opacity="0.7"/>
    <text x="135" y="98" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ISO 14001</text>
    <text x="135" y="110" text-anchor="middle" fill="#fff" font-size="7">Meio ambiente</text>
    <!-- ISO 45001 -->
    <rect x="230" y="80" width="110" height="38" rx="5" fill="#c5383c" opacity="0.7"/>
    <text x="285" y="98" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">ISO 45001</text>
    <text x="285" y="110" text-anchor="middle" fill="#fff" font-size="7">Seg. Trabalho</text>
    <!-- Topo -->
    <rect x="130" y="35" width="160" height="38" rx="5" fill="#eab308" opacity="0.5"/>
    <text x="210" y="53" text-anchor="middle" fill="#0b1730" font-size="9" font-weight="bold">EXCELÊNCIA</text>
    <text x="210" y="65" text-anchor="middle" fill="#0b1730" font-size="7">Indústria 4.0 / WCM</text>
  </svg>
  <figcaption>O 5S é a fundação — sem ele, nenhum programa avançado se sustenta</figcaption>
</div>

<h3>5S é ISO 9001:2015</h3>
<p>A ISO 9001 não menciona o 5S explicitamente, mas vários requisitos são atendidos ou facilitados pelo programa:</p>
<table>
<tr><th>Cláusula ISO 9001</th><th>Requisito</th><th>Contribuição do 5S</th></tr>
<tr><td>7.1.3</td><td>Infraestrutura</td><td>Seiso mantém infraestrutura limpa e funcional; Seiton garante organização</td></tr>
<tr><td>7.1.4</td><td>Ambiente para operação de processos</td><td>5S cria ambiente físico adequado (limpo, organizado, seguro)</td></tr>
<tr><td>7.1.5</td><td>Recursos de monitoramento e medição</td><td>Seiton garante rastreabilidade e localização de instrumentos calibrados</td></tr>
<tr><td>7.1.6</td><td>Conhecimento organizacional</td><td>Gestão visual e padrões escritos preservam o conhecimento no ambiente</td></tr>
<tr><td>7.3</td><td>Conscientizacao</td><td>Treinamento 5S é auditorias promovem conscientização da qualidade</td></tr>
<tr><td>8.5.2</td><td>Identificação e rastreabilidade</td><td>Seiton com etiquetas e endereçamento garante identificação</td></tr>
<tr><td>8.5.4</td><td>Preservacao de saídas</td><td>Organização e limpeza preservam produto durante manuseio e armazenamento</td></tr>
<tr><td>8.7</td><td>Controle de saídas não conformes</td><td>Área vermelha demarcada para produto não conforme (gestão visual)</td></tr>
</table>

<div class="callout"><strong>Dica para auditoria de certificação:</strong> Auditores de ISO 9001 sempre observam o ambiente durante a auditoria. Uma fábrica com 5S bem implantado causa impressão positiva imediata e facilita a demonstração de vários requisitos. Muitos auditores relatam que "uma fábrica organizada raramente tem não-conformidades graves".</div>

<h3>5S é Lean Manufacturing</h3>
<p>No Lean, o 5S é considerado <strong>a fundação da casa Toyota</strong> (Toyota Production System). Sem 5S, não se implanta:</p>
<ul>
<li><strong>Trabalho padronizado:</strong> Requer ambiente organizado e ferramentas no lugar certo</li>
<li><strong>Kanban:</strong> Requer sinalização visual clara e limites de estoque definidos</li>
<li><strong>SMED (troca rápida):</strong> Requer ferramentas organizadas e acessíveis (shadow board)</li>
<li><strong>Fluxo contínuo:</strong> Requer corredores livres e áreas demarcadas</li>
<li><strong>Kaizen:</strong> 5S é o primeiro Kaizen — a melhoria mais visível e imediata</li>
</ul>

<div class="example"><strong>Sequência recomendada de implantação Lean:</strong> 5S → Trabalho padronizado → Gestão visual → SMED → Kanban → Fluxo contínuo → Heijunka. O 5S é sempre o primeiro passo. Tentar implantar Kanban sem 5S é como construir um prédio sem fundação.</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. 5S</strong><br>Base: organização, limpeza, padrão</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Trabalho Padronizado</strong><br>Definir o método padrão de cada operação</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Gestão Visual</strong><br>Tornar normal/anormal visível</div></div>
  <div class="step-item"><div class="step-content"><strong>4. SMED</strong><br>Troca rápida de ferramentas</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Kanban + Fluxo</strong><br>Produção puxada e contínua</div></div>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">5S + ISO 9001</button><button class="tab-btn">5S + Lean</button><button class="tab-btn">5S + TPM</button><button class="tab-btn">5S + NRs</button></div>
  <div class="tab-panel active"><p>O 5S atende diretamente requisitos das cláusulas 7.1.3 (infraestrutura), 7.1.4 (ambiente), 8.5.2 (identificação e rastreabilidade) e 8.5.4 (preservação). Auditores de certificação elogiam fábricas com 5S bem implantado.</p></div>
  <div class="tab-panel"><p>No Lean, o 5S é a fundação da "Casa Toyota". Sem ele, não funcionam: Kanban, SMED, fluxo contínuo, Kaizen. Comece sempre pelo 5S antes de qualquer ferramenta Lean avançada.</p></div>
  <div class="tab-panel"><p>Seiso = Manutenção Autônoma. O operador que limpa a máquina é o primeiro nível de prevenção. Muitas empresas implantam "5S + Manutenção Autônoma" como programa único.</p></div>
  <div class="tab-panel"><p>O 5S contribui para NR-12 (segurança em máquinas), NR-17 (ergonomia), NR-23 (proteção contra incêndio), NR-25 (resíduos) e NR-26 (sinalização de segurança).</p></div>
</div>

<h3>5S é TPM (Total Productive Maintenance)</h3>
<p>A conexão entre 5S é TPM e direta e poderosa:</p>
<ul>
<li><strong>Seiso = Manutenção autônoma:</strong> O operador que limpa a máquina é o primeiro nível de manutenção preventiva</li>
<li><strong>Seiton = Organização de ferramentas de manutenção:</strong> Chaves, graxeiras e lubrificantes organizados no ponto de uso</li>
<li><strong>Seiketsu = Checklists de manutenção autônoma:</strong> Rotina padronizada de inspeção diária</li>
</ul>
<p>Na prática, muitas empresas implantam "5S + Manutenção Autônoma" como um programa único, otimizando recursos e treinamento.</p>

<h3>5S é ISO 14001 (Meio Ambiente)</h3>
<p>O 5S contribui para a gestão ambiental de diversas formas:</p>
<ul>
<li><strong>Seiri:</strong> Descarte controlado de resíduos e materiais obsoletos</li>
<li><strong>Seiso:</strong> Identificação de vazamentos de óleo, produtos químicos, água</li>
<li><strong>Seiton:</strong> Armazenamento correto de produtos químicos (compatibilidade, contenção)</li>
<li><strong>Gestão visual:</strong> Identificação de lixeiras por tipo de resíduo (coleta seletiva industrial)</li>
</ul>

<h3>5S é NRs de Segurança do Trabalho</h3>
<table>
<tr><th>NR</th><th>Tema</th><th>Contribuição do 5S</th></tr>
<tr><td>NR-12</td><td>Segurança em máquinas</td><td>Seiton: áreas demarcadas; Seiso: máquinas inspecionadas</td></tr>
<tr><td>NR-17</td><td>Ergonomia</td><td>Seiton: organização ergonômica de postos de trabalho</td></tr>
<tr><td>NR-23</td><td>Proteção contra incêndio</td><td>Seiton: corredores livres; Seiso: sem materiais inflamáveis soltos</td></tr>
<tr><td>NR-25</td><td>Resíduos indústriais</td><td>Seiri: segregação; Seiso: controle de fontes; Seiton: armazenamento correto</td></tr>
<tr><td>NR-26</td><td>Sinalização de segurança</td><td>Seiketsu: padronização de cores conforme norma</td></tr>
</table>

<h3>Roadmap de integração — do 5S ao sistema de gestão integrado</h3>
<p>Para empresas que querem evoluir do 5S para programas mais abrangentes:</p>
<table>
<tr><th>Fase</th><th>Programa</th><th>Prazo típico</th><th>Investimento estimado (PME)</th></tr>
<tr><td>1</td><td>5S (base)</td><td>3-6 meses</td><td>R$ 5.000 - R$ 20.000</td></tr>
<tr><td>2</td><td>ISO 9001:2015</td><td>8-14 meses</td><td>R$ 15.000 - R$ 50.000</td></tr>
<tr><td>3</td><td>Lean básico (5S + Kaizen + SMED)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 30.000</td></tr>
<tr><td>4</td><td>TPM (pilar manutenção autônoma)</td><td>6-12 meses</td><td>R$ 10.000 - R$ 40.000</td></tr>
<tr><td>5</td><td>ISO 14001 / ISO 45001</td><td>8-14 meses cada</td><td>R$ 15.000 - R$ 50.000 cada</td></tr>
</table>

<div class="callout"><strong>Mensagem final:</strong> O 5S é simultaneamente o programa mais simples é o mais transformador da gestão industrial. Simples porque não exige tecnologia, investimento alto ou conhecimento avançado. Transformador porque muda a cultura, o ambiente e os resultados de forma visível e rápida. O segredo está em três palavras: <strong>método, liderança e persistência</strong>.</div>

<div class="example"><strong>Caso inspirador:</strong> Uma pequena metalúrgica de Novo Hamburgo (RS), com 28 funcionários, implantou o 5S em 2020 como primeiro projeto de gestão. Em 3 anos, o 5S levou a ISO 9001 (2021), que levou ao Lean (2022), que levou a IATF 16949 (2023). A empresa triplicou o faturamento, entrou na cadeia automotiva e recebeu prêmio de fornecedor destaque de um fabricante multinacional. Tudo começou com etiquetas vermelhas e um shadow board de R$ 150.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Seu Marcos, dono da metalúrgica de Novo Hamburgo: "Quando falo que triplicamos o faturamento em 3 anos, as pessoas perguntam que software caro compramos ou que máquina importamos. Eu respondo: começamos com um shadow board de R$ 150 e etiquetas vermelhas impressas na impressora do escritório. O 5S ensinou a equipe a pensar em padrão, e daí tudo veio naturalmente."</p>
</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">3x</div><div class="kpi-label">Faturamento em 3 anos</div></div>
  <div class="kpi-card"><div class="kpi-value">R$ 150</div><div class="kpi-label">Investimento inicial</div></div>
  <div class="kpi-card"><div class="kpi-value">28</div><div class="kpi-label">Funcionários</div></div>
  <div class="kpi-card"><div class="kpi-value">IATF</div><div class="kpi-label">Certificação conquistada</div></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O roadmap recomendado é 5S, depois ISO 9001, depois Lean, depois TPM." data-fb-nok="Incorreto. A sequência recomendada é: 5S → ISO 9001 → Lean básico → TPM → ISO 14001/45001.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é a sequência recomendada de evolução após o 5S?</div>
  <button class="qi-option" data-key="a">TPM → ISO 9001 → Lean</button>
  <button class="qi-option" data-key="b">ISO 9001 → Lean básico → TPM</button>
  <button class="qi-option" data-key="c">Lean → ISO 14001 → TPM</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight final:</strong> O 5S é simultaneamente o programa mais simples e o mais transformador da gestão industrial. O segredo está em três palavras: <strong>método, liderança e persistência</strong>. Comece pequeno, meça tudo, e nunca pare de melhorar.</div></div>
`}, 'Roadmap de integração 5S + ISO + Lean')`;

  // ── Module 1 quiz ──
  const m1q = [
    ['Em que contexto histórico surgiu o programa 5S?', ['Europa pós-Revolução Industrial','Japao pós-Segunda Guerra Mundial','Estados Unidos nos anos 1980','Brasil nos anos 1970'], 1, 'O 5S nasceu no Japão após a Segunda Guerra Mundial, num contexto de reconstrução econômica e necessidade de maximizar recursos.'],
    ['Qual é a tradução correta do senso Seiri?', ['Senso de limpeza','Senso de disciplina','Senso de utilização','Senso de padronização'], 2, 'Seiri é o senso de utilização — separar o necessário do desnecessário.'],
    ['Segundo dados apresentados, qual a redução tipica no tempo para localizar ferramentas após o 5S?', ['Cerca de 30%','Cerca de 50%','Cerca de 80%','Cerca de 95%'], 2, 'Os dados mostram redução de 4,2 min para 0,8 min, ou seja, aproximadamente 81%.'],
    ['Qual é o principal erro ao implantar o 5S?', ['Investir demais em sinalização','Reduzi-lo a dia de faxina sem continuidade','Fazer auditorias muito frequentes','Treinar demais os operadores'], 1, 'O maior erro é tratar o 5S como faxina pontual, sem o programa de padronização e disciplina que sustenta os resultados.'],
    ['No diagnóstico inicial, quando se deve avaliar a fábrica para obter resultados realistas?', ['Na segunda-feira de manhã, após o fim de semana','Após avisar a equipe com 1 semana de antecedência','Numa sexta-feira a tarde, sem aviso prévio','Durante uma auditoria externa'], 2, 'Avaliar sem aviso prévio, numa sexta-feira a tarde, mostra a realidade do dia a dia, não uma área arrumada para a avaliação.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 2 quiz ──
  const m2q = [
    ['Qual é a principal ferramenta utilizada no Seiri?', ['Shadow board','Etiqueta vermelha','Checklist de limpeza','Quadro de gestão visual'], 1, 'A etiqueta vermelha (red tag) e o método padrão para identificar e classificar itens questionáveis no Seiri.'],
    ['Pela regra dos 12 meses, o que fazer com um item que não foi usado nesse período?', ['Manter no setor por segurança','Transferir para o almoxarifado central','Descartar, vender ou doar','Etiquetar e aguardar mais 12 meses'], 2, 'Itens sem uso por 12 meses devem ser descartados, vendidos ou doados, salvo exceções de peças críticas.'],
    ['O que significa a "regra dos 30 segundos" no Seiton?', ['A limpeza de cada área deve levar 30 segundos','Qualquer item deve ser encontrado em até 30 segundos','O setup deve ser reduzido em 30 segundos','A auditoria de cada critério leva 30 segundos'], 1, 'No Seiton bem implantado, qualquer pessoa deve localizar qualquer item em até 30 segundos.'],
    ['No conceito de "limpeza como inspeção" do Seiso, o que o operador faz além de limpar?', ['Preenche relatório de produção','Observa anomalias como vazamentos e folgas','Calibra os instrumentos de medição','Atualiza o quadro de gestão visual'], 1, 'No Seiso industrial, ao limpar o operador inspeciona a máquina buscando vazamentos, folgas, fissuras e anomalias.'],
    ['Qual é o investimento total estimado em materiais para o Dia D de uma fábrica de 50-100 funcionários?', ['Menos de R$ 500','Cerca de R$ 2.400','Cerca de R$ 10.000','Mais de R$ 20.000'], 1, 'O material para o Dia D (etiquetas, fita, tinta, material de limpeza, EPIs, lanche) custa aproximadamente R$ 2.360 para esse porte.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 3 quiz ──
  const m3q = [
    ['Qual é a ferramenta mais simples é eficaz do Seiketsu?', ['Checklist de 50 itens','Foto do estado padrão fixada no local','Sistema ERP de controle','App de auditoria digital'], 1, 'A foto do estado padrão é a referência visual mais simples é eficaz — custa R$ 8-15 e qualquer pessoa pode comparar o estado atual com o padrão.'],
    ['Quanto tempo leva em média para o 5S se tornar hábito (Shitsuke)?', ['3 meses','6 meses','18 a 24 meses','5 anos'], 2, 'Pesquisas mostram que o 5S leva de 18 a 24 meses para se tornar hábito numa organização.'],
    ['Qual dos itens abaixo NÃO é um dos "7 assassinos do 5S"?', ['Falta de exemplo da liderança','Dia D sem continuidade','Auditorias muito frequentes','Programa visto como responsabilidade só da qualidade'], 2, 'Auditorias frequentes sustentam o programa. Os assassinos são: falta de exemplo, sem continuidade, punição sem reconhecimento, falta de tempo, rotatividade sem treinamento, sem medição e programa "da qualidade".'],
    ['O que deve conter o quadro de gestão visual de cada setor?', ['Apenas indicadores de produção','Segurança, qualidade, produção, 5S, pessoas e ações','Apenas fotos de antes e depois do 5S','Apenas o checklist diário de limpeza'], 1, 'O quadro completo íntegra segurança, qualidade, produção, 5S, pessoas e plano de ações pendentes.'],
    ['Qual estrategia de reconhecimento é citada como altamente eficaz e de custo quase zero?', ['Bônus salarial mensal','Área destaque do mês com troféu simbólico','Viagem de premiações','Promoção de cargo'], 1, 'Um troféu ou selo simbólico que fica exposto na área vencedora até a próxima avaliação tem custo zero e impacto significativo na motivação.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Module 4 quiz ──
  const m4q = [
    ['Qual é a frequência de auditoria recomendada nos primeiros 3 meses do programa 5S?', ['Diária','Semanal','Mensal','Trimestral'], 1, 'Nos primeiros 3 meses, a auditoria deve ser semanal para reforçar o padrão e corrigir desvios rapidamente.'],
    ['O que é uma auditoria cruzada no contexto do 5S?', ['Auditoria feita por empresa externa','O líder de um setor audita outro setor','Auditoria que avalia dois programas simultaneamente','Auditoria feita por dois auditores ao mesmo tempo'], 1, 'Na auditoria cruzada, líderes de diferentes setores auditam as áreas uns dos outros, trazendo olhar externo e disseminando boas práticas.'],
    ['Qual ferramenta é recomendada para analisar a causa raiz de desvios encontrados na auditoria 5S?', ['Diagrama de Gantt','5 Por ques','Análise SWOT','Balanced Scorecard'], 1, 'A técnica dos 5 Por ques permite ir além do sintoma e encontrar a causa raiz do desvio de forma simples e eficaz.'],
    ['Qual cláusula da ISO 9001 é diretamente facilitada pelo Seiton (identificação e rastreabilidade)?', ['4.1','7.1.3','8.5.2','10.2'], 2, 'A cláusula 8.5.2 trata de identificação e rastreabilidade, que é diretamente apoiada pelo sistema de endereçamento e etiquetagem do Seiton.'],
    ['Na integração 5S + TPM, qual senso equivale a manutenção autônoma?', ['Seiri','Seiton','Seiso','Seiketsu'], 2, 'Seiso (limpeza como inspeção) e a essencia da manutenção autônoma do TPM — o operador limpa e ao mesmo tempo inspeciona a máquina.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (20 questions, is_final: true) ──
  const finalQ = [
    ['O programa 5S surgiu em qual país e década?', ['EUA, anos 1950','Japao, anos 1950','Alemanha, anos 1960','Brasil, anos 1990'], 1, 'O 5S nasceu no Japão pós-Segunda Guerra Mundial (década de 1950), num contexto de reconstrução industrial.'],
    ['Qual a sequência correta dos 5 sensos?', ['Seiri, Seiso, Seiton, Seiketsu, Shitsuke','Seiton, Seiri, Seiso, Shitsuke, Seiketsu','Seiri, Seiton, Seiso, Seiketsu, Shitsuke','Seiso, Seiri, Seiton, Shitsuke, Seiketsu'], 2, 'A sequência correta e: Seiri (utilização), Seiton (organização), Seiso (limpeza), Seiketsu (padronização), Shitsuke (disciplina).'],
    ['Qual é o ROI típico do 5S no primeiro ano, conforme o caso da metalúrgica de Joinville apresentado?', ['1,5x','3x','5,3x','10x'], 2, 'A metalúrgica de Joinville investiu R$ 18.000 e obteve R$ 95.000 em economia de peças rejeitadas — ROI de 5,3x.'],
    ['No checklist de diagnóstico inicial, uma nota de 32% classifica a área como:', ['Critica','Insuficiente','Regular','Boa'], 1, 'A faixa de 21-40% e classificada como "Insuficiente", exigindo implantação estruturada em 90 dias.'],
    ['Qual é o prazo padrão da "área de quarentena" na técnica da etiqueta vermelha?', ['7 dias','15 dias','30 dias','60 dias'], 2, 'Itens etiquetados ficam na área de quarentena por 30 dias. Se ninguém reclamar, são descartados ou realocados.'],
    ['Segundo a NBR 7195, qual cor e padrão para demarcação de corredores de circulação?', ['Branco','Verde','Amarelo','Azul'], 2, 'A cor amarela e usada para corredores de circulação e áreas de atenção conforme a norma brasileira.'],
    ['O conceito de "limpeza como inspeção" do Seiso tem origem em qual metodologia?', ['ISO 9001','Lean Manufacturing','TPM (Total Productive Maintenance)','Six Sigma'], 2, 'O conceito de limpeza como inspeção vem diretamente do pilar de manutenção autônoma do TPM.'],
    ['Qual o custo médio de um shadow board feito internamente?', ['R$ 20 a R$ 50','R$ 80 a R$ 200','R$ 500 a R$ 1.000','R$ 2.000 a R$ 5.000'], 1, 'Um shadow board feito com MDF, tinta e ganchos custa entre R$ 80 e R$ 200 com mão de obra interna.'],
    ['No Dia D, qual é a atividade que deve acontecer ANTES de qualquer outra?', ['Limpeza profunda','Fotografar o estado atual (antes)','Organizar as ferramentas','Pintar o chao'], 1, 'Fotografar o "antes" é essencial e deve ser feito antes de qualquer atividade, pois a comparação antes/depois é a ferramenta mais poderosa de motivação.'],
    ['Qual é o custo médio de uma foto do estado padrão (A3 plastificada)?', ['R$ 1 a R$ 3','R$ 8 a R$ 15','R$ 50 a R$ 80','R$ 100 a R$ 200'], 1, 'Impressão A3 colorida + plastificação custa entre R$ 8 e R$ 15 por unidade.'],
    ['Em quanto tempo o 5S tipicamente se torna hábito organizacional?', ['1 a 3 meses','6 a 12 meses','18 a 24 meses','3 a 5 anos'], 2, 'Pesquisas indicam que o 5S leva de 18 a 24 meses para se tornar hábito. Nos primeiros 6 meses e esforço consciente.'],
    ['Qual é o fator mais crítico para a sustentação do programa 5S?', ['Investimento em tecnologia','Exemplo e envolvimento da liderança','Contratacao de consultoria externa','Implantação de app de auditoria'], 1, 'A liderança pelo exemplo é o fator mais crítico. Onde a liderança prática o 5S, o programa funciona; onde não prática, morre.'],
    ['Na auditoria 5S, uma nota consistentemente acima de 95% pode indicar:', ['Excelencia máxima do programa','Auditoria branda (complacência)','Necessidade de suspender auditorias','Que o programa pode ser encerrado'], 1, 'Notas constantemente acima de 95% podem indicar complacência na auditoria. O ideal é sempre haver oportunidades de melhoria identificadas.'],
    ['A técnica dos 5 Por ques serve para:', ['Definir os 5 sensos do programa','Realizar análise de causa raiz de desvios','Pontuar a auditoria de 5S','Classificar itens para etiqueta vermelha'], 1, 'Os 5 Por ques são uma técnica de análise de causa raiz que permite ir além do sintoma superficial.'],
    ['Qual cláusula da ISO 9001:2015 o 5S ajuda a atender ao criar um ambiente físico adequado?', ['4.1 — Contexto da organização','7.1.4 — Ambiente para operação de processos','8.1 — Planejamento operacional','9.1 — Monitoramento'], 1, 'A cláusula 7.1.4 exige que a organização proporcione ambiente adequado para a operação, o que o 5S atende diretamente.'],
    ['No Lean Manufacturing, o 5S é considerado:', ['Uma ferramenta complementar opcional','A fundação da casa Toyota','Um substituto do Kaizen','Uma alternativa ao Kanban'], 1, 'No Sistema Toyota de Produção, o 5S é a fundação sobre a qual todas as outras ferramentas Lean se apoiam.'],
    ['Segundo a pesquisa do SENAI-PR citada, qual percentual de indústrias que mantiveram auditorias regulares conseguiu se recuperar de regressoes no 5S?', ['50%','75%','90%','100%'], 3, 'Das empresas que se recuperaram de regressoes, 100% tinham sistema de auditoria ativo, versus apenas 15% das que não se recuperaram.'],
    ['Qual é a sequência recomendada de implantação após o 5S no roadmap de melhoria?', ['TPM, depois ISO 9001, depois Lean','ISO 9001, depois Lean básico, depois TPM','Lean, depois TPM, depois ISO 9001','ISO 14001, depois ISO 9001, depois Lean'], 1, 'O roadmap recomendado e: 5S → ISO 9001 → Lean básico → TPM → ISO 14001/45001.'],
    ['Qual é o investimento típico para implantar 5S numa pequena indústria (20-99 funcionários)?', ['R$ 500 a R$ 2.000','R$ 5.000 a R$ 20.000','R$ 50.000 a R$ 100.000','R$ 200.000 ou mais'], 1, 'Para pequenas indústrias, o investimento típico fica entre R$ 5.000 e R$ 20.000, incluindo estantes, shadow boards, sinalização e consultoria pontual.'],
    ['No caso da metalúrgica de Novo Hamburgo citada, qual foi o primeiro programa implantado que desencadeou toda a evolução da empresa?', ['ISO 9001','Lean Manufacturing','5S','IATF 16949'], 2, 'A empresa começou com o 5S em 2020, que levou a ISO 9001, depois Lean e finalmente IATF 16949, triplicando o faturamento em 3 anos.'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
