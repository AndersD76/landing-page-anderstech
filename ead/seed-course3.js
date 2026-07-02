export async function seedCourse3(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      'gestao-processos-indicadores',
      'Gestão de Processos e Indicadores',
      'Mapeie, meça e melhore seus processos com indicadores que geram resultado.',
      'Curso prático de gestão por processos: mapeamento SIPOC e fluxograma, definição de KPIs, dashboards, ferramentas de análise de causa raiz e melhoria contínua aplicada.',
      '10 horas',
      297, 497,
      'Gestores, analistas de processos, coordenadores, empresários',
      'Nenhum',
      'Capacitar o profissional a mapear processos, definir indicadores relevantes e implementar ciclos de melhoria contínua na sua organização.',
      3
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos de Gestão por Processos ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos de Gestão por Processos', 'O que é um processo, abordagem ISO 9001, SIPOC e fluxogramas', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-o-que-e-processo', 'O que é um processo e por que gerenciar', '15 min', 1, ${`
<h2>O que é um processo?</h2>
<p>Um processo é um <strong>conjunto de atividades inter-relacionadas que transforma entradas em saídas</strong>, gerando valor para um cliente interno ou externo. Essa definição, que parece simples, é a base de toda a gestão por processos — e ignorar ela é a raiz de grande parte da ineficiência nas empresas brasileiras.</p>

<div class="callout"><strong>Definição formal (ISO 9000:2015):</strong> "Conjunto de atividades inter-relacionadas ou interativas que utilizam entradas para entregar um resultado pretendido."</div>

<div class="diagram"><svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="60" width="80" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="50" y="85" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">ENTRADAS</text><text x="50" y="100" text-anchor="middle" fill="#94a3b8" font-size="9">Materiais</text><text x="50" y="112" text-anchor="middle" fill="#94a3b8" font-size="9">Informações</text><polygon points="100,90 120,80 120,100" fill="#2563eb"/><rect x="130" y="40" width="140" height="100" rx="10" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="200" y="70" text-anchor="middle" fill="#16a34a" font-size="12" font-weight="bold">PROCESSO</text><text x="200" y="88" text-anchor="middle" fill="#fff" font-size="10">Atividades que</text><text x="200" y="102" text-anchor="middle" fill="#fff" font-size="10">agregam valor</text><text x="200" y="120" text-anchor="middle" fill="#94a3b8" font-size="9">(transformação)</text><polygon points="280,90 300,80 300,100" fill="#2563eb"/><rect x="310" y="60" width="80" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="350" y="85" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">SAÍDAS</text><text x="350" y="100" text-anchor="middle" fill="#94a3b8" font-size="9">Produtos</text><text x="350" y="112" text-anchor="middle" fill="#94a3b8" font-size="9">Serviços</text><text x="200" y="20" text-anchor="middle" fill="#eab308" font-size="10">Controles e indicadores</text><line x1="200" y1="25" x2="200" y2="40" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4"/><text x="200" y="165" text-anchor="middle" fill="#eab308" font-size="10">Recursos (pessoas, equipamentos)</text><line x1="200" y1="140" x2="200" y2="155" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4"/></svg><figcaption>Modelo básico de processo: entradas transformadas em saídas com recursos e controles</figcaption></div>

<h3>Processo vs. departamento</h3>
<p>O erro mais comum é confundir <strong>processo</strong> com <strong>departamento</strong>. Um departamento é uma estrutura organizacional (financeiro, produção, comercial). Um processo <strong>atravessa departamentos</strong>.</p>

<div class="example"><strong>Exemplo — metalúrgica de Caxias do Sul:</strong> O processo "Atendimento de pedido" começa no comercial (recebe pedido), passa pelo PCP (programa produção), vai para a produção (fabrica a peça), passa pelo controle de qualidade (inspeciona), segue para a expedição (embala e despacha) e termina no financeiro (fatura e cobra). São 6 departamentos envolvidos em UM processo.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Visão por departamento</h4><ul><li>Cada setor otimiza seu pedaco isoladamente</li><li>"O problema não é do meu setor"</li><li>Indicadores departamentais desconectados</li><li>Transferencias viram buracos negros</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Visão por processo</h4><ul><li>Fluxo ponta a ponta visível e gerenciado</li><li>Dono do processo responde pelo resultado</li><li>Indicadores medem o fluxo completo</li><li>Handoffs são mapeados e controlados</li></ul></div></div>

<h3>Os 3 tipos de processo</h3>
<table>
<tr><th>Tipo</th><th>Descrição</th><th>Exemplos</th></tr>
<tr><td><strong>Processos primários (de negócio)</strong></td><td>Geram valor direto para o cliente externo</td><td>Vendas, produção, entrega, pós-venda</td></tr>
<tr><td><strong>Processos de apoio (suporte)</strong></td><td>Suportam os processos primários</td><td>RH, TI, compras, manutenção, financeiro</td></tr>
<tr><td><strong>Processos gerenciais</strong></td><td>Direcionam e monitoram os demais</td><td>Planejamento estratégico, gestão da qualidade, análise crítica</td></tr>
</table>

<h3>Por que gerenciar processos?</h3>
<p>Quando você <strong>não</strong> gerência processos, cada departamento otimiza seu pedaço sem ver o todo. O resultado são as disfunções clássicas:</p>
<ul>
<li><strong>Retrabalho invisível:</strong> A produção refaz peças que o comercial prometeu com especificação errada</li>
<li><strong>Gargalos:</strong> O PCP programa 200 peças/dia, mas a pintura só processa 120 — e ninguém mapeia isso</li>
<li><strong>Culpa cruzada:</strong> "O problema não é do meu setor" — porque ninguém é dono do processo ponta a ponta</li>
<li><strong>Perda de conhecimento:</strong> O operador mais experiente sai e leva o "jeito certo" na cabeça</li>
</ul>

<div class="callout"><strong>Dado real:</strong> Uma pesquisa da ABPMP Brasil (2023) com 450 empresas mostrou que organizações com gestão por processos formalizada reduziram custos operacionais em média 18% e tempo de ciclo em 25% em 2 anos.</div>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">-18%</div><div class="kpi-label">Custos operacionais</div></div><div class="kpi-card"><div class="kpi-value">-25%</div><div class="kpi-label">Tempo de ciclo</div></div><div class="kpi-card"><div class="kpi-value">450</div><div class="kpi-label">Empresas pesquisadas</div></div></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma distribuidora de bebidas de Ribeirao Preto (SP) operava com gestão 100% departamental. Cada gerente otimizava seu setor: o comercial vendia agressivamente, a logística cortava custos de frete, e o financeiro apertava prazos de pagamento. O resultado? O comercial prometia entregas impossiveis, a logística consolidava cargas atrasando pedidos urgentes, e o financeiro bloqueava pedidos de bons clientes por R$ 200 de atraso. Ao mapear o processo "Pedido a Entrega" ponta a ponta, descobriram que 35% do tempo do ciclo era espera entre departamentos. Em 8 meses de gestão por processos, o lead time caiu de 9 para 4 dias e o OTIF subiu de 68% para 91%.</p></div>

<h3>Cadeia de valor</h3>
<p>Todos os processos de uma organização formam a <strong>cadeia de valor</strong>. A visão da cadeia de valor (conceito de Michael Porter) ajuda a enxergar onde está o valor real e onde está o desperdício. A ideia é simples: se uma atividade não agrega valor para o cliente final e também não é necessária para suportar quem agrega valor, ela é candidata a eliminação.</p>

<div class="example"><strong>Na prática — cooperativa agrícola do Paraná:</strong> Ao mapear a cadeia de valor do processo "recebimento de grãos", a cooperativa descobriu que o agricultor esperava em média 3,2 horas na fila de classificação. Ao redesenhar o processo com agendamento prévio e classificação rápida, reduziu para 45 minutos — aumentando a satisfação e o volume recebido em 30%.</div>

<h3>A mentalidade de processo</h3>
<p>Gerênciar por processos exige uma mudança de mentalidade: sair do <strong>"quem faz"</strong> para o <strong>"como flui"</strong>. Em vez de perguntar "de quem é a culpa?", perguntar "onde o processo falhou?". Em vez de "como meu setor pode ser mais eficiente?", perguntar "como o fluxo ponta a ponta pode ser melhor para o cliente?".</p>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Processo é um conjunto de atividades que transforma entradas em saídas, atravessando departamentos." data-fb-nok="Incorreto. Revise a definição: processo não é sinonimo de departamento nem de tarefa isolada."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a principal diferença entre processo e departamento?</div><button class="qi-option" data-key="a">Processo e departamento são a mesma coisa, só muda o nome</button><button class="qi-option" data-key="b">Processo atravessa departamentos e transforma entradas em saídas; departamento e estrutura organizacional</button><button class="qi-option" data-key="c">Departamento e mais importante que processo porque tem gerente</button><div class="qi-feedback"></div></div>
`}, NULL),

  (${m1.id}, '1-2-abordagem-processos-iso-9001', 'Abordagem de processos na ISO 9001', '15 min', 2, ${`
<h2>Abordagem de processos na ISO 9001</h2>
<p>A ISO 9001:2015 faz da abordagem de processos um dos <strong>pilares centrais</strong> do Sistema de Gestão da Qualidade. A cláusula 4.4 exige explicitamente que a organização determine os processos necessários para o SGQ e gerencie suas interações.</p>

<div class="callout"><strong>O que a norma diz (cláusula 4.4.1):</strong> "A organização deve determinar os processos necessários para o SGQ e sua aplicação na organização, e deve: (a) determinar as entradas requeridas e as saídas esperadas; (b) determinar a sequência e interação desses processos; (c) determinar critérios e métodos necessários para assegurar a operação e controle eficazes; (d) determinar os recursos necessários..."</div>

<h3>O modelo de processo ISO 9001</h3>
<p>A ISO 9001 enxerga a organização como uma rede de processos inter-relacionados. Cada processo tem:</p>
<table>
<tr><th>Elemento</th><th>O que é</th><th>Exemplo (usinagem)</th></tr>
<tr><td><strong>Entrada</strong></td><td>O que inicia ou alimenta o processo</td><td>Matéria-prima (barra de aço), desenho técnico, ordem de produção</td></tr>
<tr><td><strong>Atividades</strong></td><td>Transformação que agrega valor</td><td>Corte, torneamento, fresamento, acabamento</td></tr>
<tr><td><strong>Saída</strong></td><td>Resultado do processo</td><td>Peça usinada conforme especificação</td></tr>
<tr><td><strong>Recursos</strong></td><td>O que é necessário para executar</td><td>Torno CNC, operador qualificado, refrigerante de corte</td></tr>
<tr><td><strong>Controles</strong></td><td>Como garantir que funciona</td><td>Instrução de trabalho, controle dimensional, indicadores</td></tr>
<tr><td><strong>Responsável</strong></td><td>Dono do processo</td><td>Supervisor de usinagem</td></tr>
</table>

<h3>A "tartaruga" de processo</h3>
<p>Uma das ferramentas mais usadas para atender a cláusula 4.4 é o <strong>diagrama tartaruga</strong>. Ele organiza visualmente os 6 elementos de cada processo:</p>

<div class="diagram"><svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg"><rect x="120" y="80" width="160" height="70" rx="10" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="200" y="110" text-anchor="middle" fill="#16a34a" font-size="12" font-weight="bold">PROCESSO</text><text x="200" y="130" text-anchor="middle" fill="#fff" font-size="10">[Nome do processo]</text><rect x="5" y="90" width="95" height="50" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/><text x="52" y="112" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">ENTRADA</text><text x="52" y="126" text-anchor="middle" fill="#94a3b8" font-size="8">Materiais, info</text><line x1="100" y1="115" x2="120" y2="115" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr1)"/><rect x="300" y="90" width="95" height="50" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/><text x="348" y="112" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">SAÍDA</text><text x="348" y="126" text-anchor="middle" fill="#94a3b8" font-size="8">Produtos, registros</text><line x1="280" y1="115" x2="300" y2="115" stroke="#2563eb" stroke-width="1.5"/><rect x="120" y="5" width="160" height="45" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="200" y="24" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">COM O QUE?</text><text x="200" y="40" text-anchor="middle" fill="#94a3b8" font-size="8">Equipamentos, software</text><line x1="200" y1="50" x2="200" y2="80" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4"/><rect x="120" y="175" width="160" height="45" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="200" y="194" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">COM QUEM?</text><text x="200" y="210" text-anchor="middle" fill="#94a3b8" font-size="8">Competências, funções</text><line x1="200" y1="150" x2="200" y2="175" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4"/><rect x="5" y="175" width="95" height="45" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/><text x="52" y="194" text-anchor="middle" fill="#c5383c" font-size="10" font-weight="bold">COMO?</text><text x="52" y="210" text-anchor="middle" fill="#94a3b8" font-size="8">Métodos, ITs</text><rect x="300" y="175" width="95" height="45" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/><text x="348" y="194" text-anchor="middle" fill="#c5383c" font-size="10" font-weight="bold">QUANTO?</text><text x="348" y="210" text-anchor="middle" fill="#94a3b8" font-size="8">KPIs, metas</text><defs><marker id="arr1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#2563eb"/></marker></defs></svg><figcaption>Diagrama Tartaruga: visão completa dos 6 elementos de um processo ISO 9001</figcaption></div>

<div class="template-box">
<strong>Template: Diagrama Tartaruga</strong>
<table>
<tr><td colspan="3" style="text-align:center"><strong>COM O QUE? (Recursos materiais)</strong><br>Equipamentos, máquinas, ferramentas, software</td></tr>
<tr><td><strong>ENTRADA</strong><br>- Materiais<br>- Informações<br>- Requisitos</td><td style="text-align:center"><strong>PROCESSO</strong><br>[Nome do processo]<br>Atividades principais</td><td><strong>SAÍDA</strong><br>- Produtos<br>- Serviços<br>- Registros</td></tr>
<tr><td colspan="3" style="text-align:center"><strong>COM QUEM? (Recursos humanos)</strong><br>Competências, funções, quantidade</td></tr>
<tr><td colspan="3" style="text-align:center"><strong>COMO? (Métodos/procedimentos)</strong> | <strong>QUANTO? (Indicadores)</strong></td></tr>
</table>
</div>

<h3>Hierarquia de processos</h3>
<p>Processos podem ser decompostos em níveis de detalhe:</p>
<ul>
<li><strong>Macroprocesso:</strong> Produção</li>
<li><strong>Processo:</strong> Usinagem de peças</li>
<li><strong>Subprocesso:</strong> Torneamento</li>
<li><strong>Atividade:</strong> Setup da máquina</li>
<li><strong>Tarefa:</strong> Fixar ferramenta no porta-ferramenta</li>
</ul>

<div class="example"><strong>Exemplo — construtora de Chapecó (SC):</strong> A construtora mapeou 4 macroprocessos (Incorporação, Projeto, Obra, Pós-obra), 18 processos e 62 subprocessos. A simples visualização da interação entre eles revelou 11 pontos de retrabalho — a maioria na interface entre Projeto e Obra, onde informações chegavam incompletas ao mestre de obras.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de autopeças de Betim (MG) estava se preparando para a certificação ISO 9001. O consultor pediu que mapeassem os processos usando diagramas tartaruga. O gerente de produção, resistente, disse: "Eu sei de cor como funciona, não preciso desenhar." Quando a equipe preencheu a tartaruga do processo de usinagem, descobriram que o campo "COM QUEM?" revelava que 3 dos 8 operadores nunca tinham recebido treinamento formal na máquina CNC que operavam — trabalhavam "aprendendo com o colega". O campo "QUANTO?" estava vazio: não havia indicador nenhum no processo. Em 6 meses, com indicadores e treinamento formalizado, o refugo caiu de 4,1% para 1,8%.</p></div>

<h3>O PDCA dentro de cada processo</h3>
<p>A ISO 9001 espera que cada processo funcione como um mini-PDCA:</p>
<ul>
<li><strong>Plan:</strong> Definir objetivo do processo, entradas esperadas, critérios de controle</li>
<li><strong>Do:</strong> Executar o processo conforme planejado</li>
<li><strong>Check:</strong> Monitorar indicadores, verificar saídas</li>
<li><strong>Act:</strong> Corrigir desvios, melhorar o processo</li>
</ul>

<div class="callout"><strong>Dica de auditoria:</strong> Quando o auditor avalia a cláusula 4.4, ele quer ver: (1) que você sabe quais são seus processos, (2) que você sabe como eles interagem, (3) que você tem critérios para controlá-los, e (4) que você mede se estão funcionando. Não precisa de software caro — um mapa de processos no PowerPoint e diagramas tartaruga já atendem.</div>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>P — Plan</strong><br>Definir objetivo, entradas, critérios de controle do processo</div></div><div class="step-item"><div class="step-content"><strong>D — Do</strong><br>Executar o processo conforme planejado e documentado</div></div><div class="step-item"><div class="step-content"><strong>C — Check</strong><br>Monitorar indicadores, verificar saídas vs. requisitos</div></div><div class="step-item"><div class="step-content"><strong>A — Act</strong><br>Corrigir desvios e melhorar o processo continuamente</div></div></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A cláusula 4.4 exige que a organização determine os processos, suas interações, critérios e recursos." data-fb-nok="Incorreto. A cláusula 4.4 trata especificamente da abordagem de processos, não de auditorias ou documentos específicos."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O que a cláusula 4.4 da ISO 9001:2015 exige sobre processos?</div><button class="qi-option" data-key="a">Que a empresa contrate um consultor de processos certificado</button><button class="qi-option" data-key="b">Que todos os processos usem software de BPM</button><button class="qi-option" data-key="c">Que a organização determine os processos, suas interações, critérios e recursos necessários</button><div class="qi-feedback"></div></div>
`}, 'Diagrama tartaruga preenchido'),

  (${m1.id}, '1-3-mapeamento-sipoc', 'Mapeamento com SIPOC', '15 min', 3, ${`
<h2>Mapeamento com SIPOC</h2>
<p>O SIPOC é uma das ferramentas mais poderosas e simples para <strong>mapear um processo de forma rápida</strong>. O nome é um acrônimo que descreve os 5 elementos do processo: <strong>Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saída), Customer (Cliente)</strong>.</p>

<div class="callout"><strong>Quando usar SIPOC:</strong> No início de qualquer projeto de melhoria, ao documentar processos para ISO 9001, ao integrar novos colaboradores que precisam entender o processo, ou sempre que houver confusão sobre "onde começa e onde termina" um processo.</div>

<div class="diagram"><svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="30" width="70" height="80" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="40" y="55" text-anchor="middle" fill="#c5383c" font-size="11" font-weight="bold">S</text><text x="40" y="72" text-anchor="middle" fill="#fff" font-size="8">Fornecedor</text><text x="40" y="85" text-anchor="middle" fill="#94a3b8" font-size="7">Quem fornece</text><text x="40" y="95" text-anchor="middle" fill="#94a3b8" font-size="7">as entradas?</text><polygon points="80,70 92,64 92,76" fill="#eab308"/><rect x="97" y="30" width="70" height="80" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="132" y="55" text-anchor="middle" fill="#eab308" font-size="11" font-weight="bold">I</text><text x="132" y="72" text-anchor="middle" fill="#fff" font-size="8">Entrada</text><text x="132" y="85" text-anchor="middle" fill="#94a3b8" font-size="7">O que o processo</text><text x="132" y="95" text-anchor="middle" fill="#94a3b8" font-size="7">recebe?</text><polygon points="172,70 184,64 184,76" fill="#eab308"/><rect x="189" y="20" width="70" height="100" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2.5"/><text x="224" y="48" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="bold">P</text><text x="224" y="65" text-anchor="middle" fill="#fff" font-size="8">Processo</text><text x="224" y="78" text-anchor="middle" fill="#94a3b8" font-size="7">5-7 etapas</text><text x="224" y="90" text-anchor="middle" fill="#94a3b8" font-size="7">principais</text><text x="224" y="108" text-anchor="middle" fill="#16a34a" font-size="7">COMECE AQUI</text><polygon points="264,70 276,64 276,76" fill="#eab308"/><rect x="281" y="30" width="70" height="80" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="316" y="55" text-anchor="middle" fill="#2563eb" font-size="11" font-weight="bold">O</text><text x="316" y="72" text-anchor="middle" fill="#fff" font-size="8">Saída</text><text x="316" y="85" text-anchor="middle" fill="#94a3b8" font-size="7">O que o processo</text><text x="316" y="95" text-anchor="middle" fill="#94a3b8" font-size="7">entrega?</text><polygon points="356,70 368,64 368,76" fill="#eab308"/><rect x="373" y="30" width="22" height="80" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="384" y="65" text-anchor="middle" fill="#c5383c" font-size="11" font-weight="bold">C</text><text x="384" y="80" text-anchor="middle" fill="#fff" font-size="7" transform="rotate(-90,384,80)">Cliente</text></svg><figcaption>Estrutura SIPOC: comece sempre pelo P (Processo), depois defina O, C, I e S</figcaption></div>

<h3>Os 5 elementos do SIPOC</h3>
<table>
<tr><th>Letra</th><th>Significado</th><th>Pergunta-chave</th></tr>
<tr><td><strong>S</strong></td><td>Suppliers (Fornecedores)</td><td>Quem fornece as entradas do processo?</td></tr>
<tr><td><strong>I</strong></td><td>Inputs (Entradas)</td><td>O que o processo recebe para funcionar?</td></tr>
<tr><td><strong>P</strong></td><td>Process (Processo)</td><td>Quais são as 5 a 7 etapas principais?</td></tr>
<tr><td><strong>O</strong></td><td>Outputs (Saídas)</td><td>O que o processo entrega?</td></tr>
<tr><td><strong>C</strong></td><td>Customers (Clientes)</td><td>Quem recebe as saídas?</td></tr>
</table>

<h3>Como construir um SIPOC — passo a passo</h3>
<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Comece pelo P</strong><br>Descreva as etapas macro (5-7 passos). Comece cada uma com verbo de ação.</div></div><div class="step-item"><div class="step-content"><strong>2. Defina O (Saídas)</strong><br>O que cada etapa entrega? Qual é o resultado final?</div></div><div class="step-item"><div class="step-content"><strong>3. Defina C (Clientes)</strong><br>Quem recebe essas saídas? Pode ser interno ou externo.</div></div><div class="step-item"><div class="step-content"><strong>4. Defina I (Entradas)</strong><br>O que é necessário para iniciar cada etapa?</div></div><div class="step-item"><div class="step-content"><strong>5. Defina S (Fornecedores)</strong><br>Quem fornece essas entradas?</div></div></div>

<div class="template-box">
<strong>Template SIPOC — Processo de compras (indústria alimentícia)</strong>
<table>
<tr><th>S - Fornecedor</th><th>I - Entrada</th><th>P - Processo</th><th>O - Saída</th><th>C - Cliente</th></tr>
<tr><td>Produção / PCP</td><td>Requisição de compra</td><td>1. Receber requisição</td><td>Pedido de compra emitido</td><td>Fornecedor externo</td></tr>
<tr><td>Cadastro de fornecedores</td><td>Lista de fornecedores aprovados</td><td>2. Cotar com fornecedores</td><td>Mapa de cotação</td><td>Gerente (aprovação)</td></tr>
<tr><td>Financeiro</td><td>Orçamento disponível</td><td>3. Aprovar compra</td><td>Pedido aprovado</td><td>Compras</td></tr>
<tr><td>Fornecedor externo</td><td>Proposta comercial</td><td>4. Emitir pedido de compra</td><td>Pedido enviado ao fornecedor</td><td>Fornecedor externo</td></tr>
<tr><td>Fornecedor externo</td><td>Material + nota fiscal</td><td>5. Receber material</td><td>Material inspecionado e liberado</td><td>Almoxarifado / Produção</td></tr>
<tr><td>Qualidade</td><td>Critérios de inspeção</td><td>6. Inspecionar recebimento</td><td>Laudo de inspeção</td><td>Compras / Produção</td></tr>
</table>
</div>

<h3>SIPOC na prática industrial</h3>

<div class="example"><strong>Exemplo — metalúrgica de Joinville (SC):</strong> A equipe de qualidade mapeou o SIPOC do processo de "Tratamento térmico de engrenagens". Descobriram que a entrada "especificação de dureza" vinha do projeto, mas em 30% dos casos chegava por e-mail informal (sem registro). O SIPOC tornou visível essa fragilidade. Solução: criar formulário padrão de requisição de tratamento térmico com campo obrigatório de dureza, vinculado à ordem de produção.</div>

<h3>Erros comuns no SIPOC</h3>
<div class="checklist"><ul class="checklist"><li><span class="ck-box"></span>Máximo 7 etapas no P (se tem mais, esta detalhando demais)</li><li><span class="ck-box"></span>Incluiu clientes internos (quem recebe a saída de cada etapa)?</li><li><span class="ck-box"></span>Incluiu fornecedores internos (PCP, engenharia, etc.)?</li><li><span class="ck-box"></span>Validou com quem EXECUTA o processo no chão de fabrica?</li><li><span class="ck-box"></span>Cada etapa comeca com verbo de ação (receber, inspecionar, aprovar)?</li></ul></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma indústria de embalagens plasticas de Manaus (AM) fez o SIPOC do processo de extrusão. O gerente listou 4 fornecedores: o almoxarifado (resina), a engenharia (ficha técnica), o PCP (ordem de produção) e o fornecedor externo (pigmento). Quando chamaram o operador lider, ele apontou um 5o fornecedor que ninguém tinha pensado: a manutenção, que fornecia "máquina funcionando" como entrada crítica. E era justamente ali que 40% das paradas não programadas ocorriam. O SIPOC revelou que a manutenção preventiva era o elo fraco que ninguém enxergava.</p></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! O SIPOC é uma ferramenta macro (5-7 etapas). O detalhamento passo a passo fica no fluxograma." data-fb-nok="Incorreto. O SIPOC mostra a visão de alto nível do processo, não o detalhamento operacional."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Se seu SIPOC tem 15 etapas no campo P (Processo), o que esta errado?</div><button class="qi-option" data-key="a">Esta detalhando demais — o SIPOC deve ter 5-7 etapas macro, o detalhe vai no fluxograma</button><button class="qi-option" data-key="b">Nada esta errado, quanto mais etapas melhor</button><button class="qi-option" data-key="c">Precisa apenas numerar melhor as etapas</button><div class="qi-feedback"></div></div>

<div class="callout"><strong>Regra de ouro:</strong> O SIPOC é o "mapa do tesouro" — mostra o caminho geral. O fluxograma (próxima aula) é o "passo a passo detalhado" de cada etapa. Use os dois em conjunto.</div>
`}, 'Template SIPOC preenchível'),

  (${m1.id}, '1-4-fluxograma-processo', 'Fluxograma de processo detalhado', '15 min', 4, ${`
<h2>Fluxograma de processo detalhado</h2>
<p>O fluxograma é a <strong>representação gráfica passo a passo</strong> de um processo. Enquanto o SIPOC mostra a visão macro (5-7 etapas), o fluxograma detalha cada decisão, ação e interação dentro do processo.</p>

<h3>Simbolos padrão do fluxograma</h3>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><ellipse cx="60" cy="30" rx="45" ry="20" fill="none" stroke="#16a34a" stroke-width="2"/><text x="60" y="34" text-anchor="middle" fill="#16a34a" font-size="9">INICIO/FIM</text><text x="60" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Terminador</text><rect x="150" y="10" width="90" height="40" rx="4" fill="none" stroke="#2563eb" stroke-width="2"/><text x="195" y="34" text-anchor="middle" fill="#2563eb" font-size="9">ATIVIDADE</text><text x="195" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Ação/tarefa</text><polygon points="340,10 385,30 340,50 295,30" fill="none" stroke="#eab308" stroke-width="2"/><text x="340" y="34" text-anchor="middle" fill="#eab308" font-size="9">DECISAO</text><text x="340" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Sim/Não</text><polygon points="15,110 105,100 105,140 15,150" fill="none" stroke="#c5383c" stroke-width="2"/><text x="60" y="130" text-anchor="middle" fill="#c5383c" font-size="9">DOCUMENTO</text><text x="60" y="168" text-anchor="middle" fill="#94a3b8" font-size="8">Registro gerado</text><line x1="170" y1="120" x2="230" y2="120" stroke="#fff" stroke-width="2" marker-end="url(#arrF)"/><text x="200" y="140" text-anchor="middle" fill="#fff" font-size="9">FLUXO</text><text x="200" y="168" text-anchor="middle" fill="#94a3b8" font-size="8">Direção</text><rect x="290" y="100" width="90" height="40" rx="4" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6"/><text x="335" y="124" text-anchor="middle" fill="#94a3b8" font-size="9">ESPERA</text><text x="335" y="168" text-anchor="middle" fill="#94a3b8" font-size="8">Fila/atraso</text><defs><marker id="arrF" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="#fff"/></marker></defs></svg><figcaption>Simbolos padrão de fluxograma: cada forma tem significado específico</figcaption></div>

<table>
<tr><th>Símbolo</th><th>Nome</th><th>Significado</th></tr>
<tr><td>Oval</td><td>Terminador</td><td>Início ou fim do processo</td></tr>
<tr><td>Retângulo</td><td>Atividade</td><td>Uma ação ou tarefa</td></tr>
<tr><td>Losango</td><td>Decisão</td><td>Ponto de decisão (sim/não)</td></tr>
<tr><td>Paralelogramo</td><td>Documento</td><td>Documento gerado ou usado</td></tr>
<tr><td>Seta</td><td>Fluxo</td><td>Direção do processo</td></tr>
<tr><td>Retângulo ondulado</td><td>Espera/atraso</td><td>Ponto de espera ou fila</td></tr>
</table>

<h3>Tipos de fluxograma</h3>
<ul>
<li><strong>Fluxograma simples (linear):</strong> Uma única sequência de atividades, sem raias. Bom para processos simples ou instruções de trabalho.</li>
<li><strong>Fluxograma funcional (swimlane):</strong> Divide o processo em raias (lanes), cada uma representando um departamento ou função. Ideal para processos que cruzam departamentos.</li>
<li><strong>Fluxograma de decisão:</strong> Focado nas ramificações — múltiplos caminhos dependendo de condições. Usado para processos com muitas verificações.</li>
</ul>

<div class="callout"><strong>Recomendação:</strong> Para gestão por processos e ISO 9001, o fluxograma funcional (swimlane) é o mais útil, porque torna visível <strong>quem faz o que</strong> e onde ocorrem as transferências entre departamentos.</div>

<div class="tabs"><div class="tab-btns"><button class="tab-btn active">Linear</button><button class="tab-btn">Swimlane</button><button class="tab-btn">Decisão</button></div><div class="tab-panel active"><p><strong>Fluxograma linear:</strong> Uma única sequência de atividades sem raias. Ideal para processos simples ou instruções de trabalho. Exemplo: passo a passo de setup de uma máquina CNC.</p></div><div class="tab-panel"><p><strong>Fluxograma funcional (swimlane):</strong> Divide o processo em raias por departamento/função. Torna visível QUEM faz o que é onde ocorrem transferencias. O mais recomendado para ISO 9001 e gestão por processos.</p></div><div class="tab-panel"><p><strong>Fluxograma de decisão:</strong> Focado nas ramificações — múltiplos caminhos dependendo de condições. Usado para processos com muitas verificações, como inspeção de qualidade ou aprovação de credito.</p></div></div>

<h3>Como construir um fluxograma — passo a passo</h3>
<ol>
<li><strong>Defina o escopo:</strong> Onde o processo começa e onde termina? (Use o SIPOC como referência)</li>
<li><strong>Liste as etapas:</strong> Reúna as pessoas que executam o processo e liste TODAS as etapas que acontecem na prática (não o que deveria acontecer)</li>
<li><strong>Identifique decisões:</strong> Onde existem pontos de sim/não? Onde o fluxo se ramifica?</li>
<li><strong>Organize em raias:</strong> Atribua cada atividade ao departamento/função responsável</li>
<li><strong>Valide no gemba:</strong> Vá ao local onde o processo acontece e confirme se o fluxograma reflete a realidade</li>
<li><strong>Identifique problemas:</strong> Marque retrabalhos, esperas, gargalos e handoffs desnecessários</li>
</ol>

<div class="example"><strong>Exemplo — indústria alimentícia de Maringá (PR):</strong> Ao mapear o fluxograma do processo de "Liberação de lote de alimento enlatado", a equipe descobriu que o laudo de análise microbiológica levava 5 dias, e durante esse período 100% dos lotes ficavam em quarentena ocupando 40% do armazém. Com o fluxograma visível, a diretoria aprovou investimento em análise rápida (PCR), reduzindo o tempo de liberação para 8 horas e liberando espaço no armazém para mais 2 turnos de produção.</div>

<h3>Fluxograma do estado atual vs. estado futuro</h3>
<p>Uma prática poderosa é mapear <strong>dois fluxogramas</strong>:</p>
<table>
<tr><th>Aspecto</th><th>Estado Atual (AS-IS)</th><th>Estado Futuro (TO-BE)</th></tr>
<tr><td>O que mostra</td><td>Como o processo funciona HOJE, na realidade</td><td>Como o processo DEVERIA funcionar após a melhoria</td></tr>
<tr><td>Para que serve</td><td>Identificar desperdício, retrabalho, gargalos</td><td>Servir como meta e guia para implementação</td></tr>
<tr><td>Quem participa</td><td>Equipe operacional que executa o processo</td><td>Equipe operacional + gestores + especialistas</td></tr>
</table>

<div class="template-box">
<strong>Checklist para validação do fluxograma</strong>
<ul>
<li>Cada atividade começa com verbo no infinitivo? (Receber, inspecionar, aprovar...)</li>
<li>Toda decisão tem pelo menos duas saídas (sim/não)?</li>
<li>O processo tem início e fim claramente definidos?</li>
<li>As raias correspondem às funções reais (não apenas aos departamentos no organograma)?</li>
<li>Foi validado com quem EXECUTA o processo (não apenas com quem GERENCIA)?</li>
<li>Os handoffs entre departamentos estão marcados?</li>
<li>Os documentos/registros gerados estão indicados?</li>
</ul>
</div>

<div class="callout"><strong>Ferramentas recomendadas:</strong> Para mapeamento simples, Lucidchart, Draw.io (gratuito) ou Bizagi Modeler (gratuito). Para BPM formal, Bizagi ou Heflo. Em muitas auditorias ISO, um fluxograma bem feito no PowerPoint já atende perfeitamente.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de móveis de Arapongas (PR) mapeou o fluxograma do processo de "Corte e montagem de armários". O fluxograma AS-IS revelou que a peça cortada viajava 180 metros dentro da fabrica antes de ser montada, passando por 3 estoques intermediarios. No fluxograma TO-BE, reorganizaram o layout em celulas de produção. A peça passou a percorrer apenas 35 metros. Resultado: lead time de produção caiu de 5 dias para 2 dias, e o WIP (estoque em processo) reduziu 60%.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O swimlane divide o processo em raias por departamento, mostrando claramente quem faz o que é onde ocorrem as transferencias." data-fb-nok="Incorreto. O fluxograma swimlane e especificamente desenhado para mostrar responsabilidades departamentais com raias."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual tipo de fluxograma e mais indicado para processos que cruzam departamentos?</div><button class="qi-option" data-key="a">Fluxograma linear simples</button><button class="qi-option" data-key="b">Fluxograma funcional (swimlane) com raias por departamento</button><button class="qi-option" data-key="c">Diagrama de blocos sem raias</button><div class="qi-feedback"></div></div>
`}, 'Fluxograma swimlane modelo')`;

  // ── Module 2: Indicadores de Desempenho (KPIs) ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Indicadores de Desempenho (KPIs)', 'Definição, medição, dashboards e desdobramento de indicadores', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-1-o-que-medir', 'O que medir e por que — eficácia, eficiência, efetividade', '15 min', 1, ${`
<h2>O que medir e por que</h2>
<p>"O que não se mede, não se gerência." A frase, atribuída a Peter Drucker e a Edwards Deming, resume o princípio: <strong>indicadores são o instrumento que transforma gestão de achismo em gestão baseada em evidência</strong>. A ISO 9001:2015 (cláusula 9.1) exige que a organização monitore, meça, análise e avalie o desempenho dos seus processos.</p>

<h3>Os 3 Es: eficácia, eficiência e efetividade</h3>
<p>Antes de definir indicadores, é fundamental entender três conceitos que são frequentemente confundidos:</p>
<table>
<tr><th>Conceito</th><th>Pergunta que responde</th><th>Exemplo (processo de entrega)</th></tr>
<tr><td><strong>Eficácia</strong></td><td>Atingimos o resultado?</td><td>98% dos pedidos entregues no prazo</td></tr>
<tr><td><strong>Eficiência</strong></td><td>Usamos bem os recursos?</td><td>Custo de entrega de R$ 12 por pedido (meta: R$ 15)</td></tr>
<tr><td><strong>Efetividade</strong></td><td>Gerou o impacto desejado?</td><td>Satisfação do cliente com entrega subiu de 7,2 para 9,1</td></tr>
</table>

<div class="callout"><strong>Ponto-chave:</strong> Você pode ser eficaz sem ser eficiente (entregar no prazo, mas gastando o dobro). Pode ser eficiente sem ser eficaz (gastar pouco, mas atrasar). A meta é ser os três — e isso só é possível medindo.</div>

<div class="diagram"><svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><circle cx="130" cy="90" r="65" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4"/><text x="130" y="60" text-anchor="middle" fill="#2563eb" font-size="11" font-weight="bold">EFICÁCIA</text><text x="130" y="78" text-anchor="middle" fill="#94a3b8" font-size="9">Atingiu o</text><text x="130" y="90" text-anchor="middle" fill="#94a3b8" font-size="9">resultado?</text><text x="130" y="110" text-anchor="middle" fill="#fff" font-size="8">98% entregas</text><text x="130" y="122" text-anchor="middle" fill="#fff" font-size="8">no prazo</text><circle cx="270" cy="90" r="65" fill="none" stroke="#16a34a" stroke-width="2" stroke-dasharray="4"/><text x="270" y="60" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="bold">EFICIÊNCIA</text><text x="270" y="78" text-anchor="middle" fill="#94a3b8" font-size="9">Usou bem os</text><text x="270" y="90" text-anchor="middle" fill="#94a3b8" font-size="9">recursos?</text><text x="270" y="110" text-anchor="middle" fill="#fff" font-size="8">R$12/pedido</text><text x="270" y="122" text-anchor="middle" fill="#fff" font-size="8">(meta: R$15)</text><rect x="160" y="145" width="80" height="30" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="200" y="163" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">EFETIVIDADE</text><text x="200" y="14" text-anchor="middle" fill="#94a3b8" font-size="8">Gerou impacto real? (satisfação 7.2 → 9.1)</text></svg><figcaption>Os 3 Es: eficácia, eficiência e efetividade — a meta e atingir os três</figcaption></div>

<h3>Tipos de indicadores</h3>
<p>Indicadores podem ser classificados de diversas formas. As mais úteis na prática:</p>

<h3>Por natureza</h3>
<ul>
<li><strong>Indicadores de resultado (lagging):</strong> Medem o que já aconteceu. Ex: faturamento mensal, índice de reclamações, refugo acumulado.</li>
<li><strong>Indicadores de tendência (leading):</strong> Medem o que influencia o resultado futuro. Ex: horas de treinamento, número de propostas enviadas, índice de manutenção preventiva realizada.</li>
</ul>

<div class="example"><strong>Exemplo — construtora de Goiânia:</strong> O indicador "número de unidades entregues" é de resultado (lagging). O indicador "percentual de etapas concluídas no cronograma" é de tendência (leading). Se as etapas atrasam, a entrega vai atrasar — o leading avisa antes.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Indicador de vaidade</h4><ul><li>"Produzimos 50.000 peças este mes"</li><li>Sem contexto de meta ou capacidade</li><li>Não provoca ação nenhuma</li><li>Parece bom mas não leva a decisão</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Indicador acionavel</h4><ul><li>"50.000 vs. meta 55.000 (91%)"</li><li>"Refugo 2,1% vs. meta 1,5%"</li><li>Provoca ação imediata quando fora da meta</li><li>Conectado a decisão gerencial</li></ul></div></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma rede de oficinas mecânicas de Belo Horizonte (MG) media apenas "faturamento mensal" como indicador. Parecia bom: R$ 850 mil/mes. Mas ao implementar indicadores de eficiência, descobriram que o custo de retrabalho (serviços refeitos sem cobrar) era de R$ 72 mil/mes — 8,5% do faturamento. Ao adicionar indicadores de qualidade (taxa de retorno em 30 dias) e produtividade (serviços/mecânico/dia), conseguiram atacar as causas e reduzir o retrabalho para R$ 18 mil/mes em 5 meses.</p></div>

<h3>Por dimensão</h3>
<table>
<tr><th>Dimensão</th><th>O que mede</th><th>Exemplo industrial</th></tr>
<tr><td>Qualidade</td><td>Conformidade do produto/serviço</td><td>PPM (peças defeituosas por milhão), índice de rejeição</td></tr>
<tr><td>Produtividade</td><td>Relação entre produção e recursos</td><td>Peças/hora/operador, OEE</td></tr>
<tr><td>Custo</td><td>Eficiência financeira</td><td>Custo por unidade produzida, custo da não-qualidade</td></tr>
<tr><td>Entrega</td><td>Pontualidade e confiabilidade</td><td>OTIF (On Time In Full), lead time médio</td></tr>
<tr><td>Segurança</td><td>Proteção das pessoas</td><td>Taxa de frequência de acidentes, dias sem acidente</td></tr>
<tr><td>Moral/Pessoas</td><td>Engajamento da equipe</td><td>Absenteísmo, turnover, horas de treinamento</td></tr>
</table>

<h3>A armadilha dos indicadores de vaidade</h3>
<p>Indicadores de vaidade são números que parecem bons mas não levam a ação. O perigo é medir muita coisa e agir sobre nada.</p>
<ul>
<li><strong>Ruim:</strong> "Produzimos 50.000 peças este mês" (sem contexto de meta, capacidade ou refugo)</li>
<li><strong>Bom:</strong> "Produzimos 50.000 peças vs. meta de 55.000 (91%), com 2,1% de refugo vs. meta de 1,5%"</li>
</ul>

<div class="callout"><strong>Regra prática:</strong> Se você olha um indicador e não sabe que ação tomar, ele é de vaidade. Um bom indicador provoca ação quando está fora da meta.</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Indicadores leading medem fatores que influenciam o resultado futuro, permitindo agir antes que o problema apareca." data-fb-nok="Incorreto. Indicadores de tendência (leading) antecipam resultados — eles medem causas, não efeitos."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a vantagem principal de um indicador de tendência (leading) sobre um de resultado (lagging)?</div><button class="qi-option" data-key="a">O leading e mais fácil de calcular</button><button class="qi-option" data-key="b">O leading permite agir ANTES que o problema apareca no resultado</button><button class="qi-option" data-key="c">O leading e mais preciso que o lagging</button><div class="qi-feedback"></div></div>
`}, NULL),

  (${m2.id}, '2-2-definindo-indicadores', 'Definindo indicadores: fórmula, meta, frequência', '15 min', 2, ${`
<h2>Definindo indicadores: fórmula, meta, frequência</h2>
<p>Um indicador só funciona se for <strong>bem definido</strong>. A diferença entre "medir o refugo" (vago) e ter um KPI funcional é a definição rigorosa de 7 elementos essenciais.</p>

<h3>Os 7 elementos de um KPI bem definido</h3>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">7</div><div class="kpi-label">Elementos essenciais de um KPI</div></div><div class="kpi-card"><div class="kpi-value">SMART</div><div class="kpi-label">Critério para definir metas</div></div><div class="kpi-card"><div class="kpi-value">1 nome</div><div class="kpi-label">1 responsável por KPI</div></div></div>

<table>
<tr><th>Elemento</th><th>Descrição</th><th>Exemplo</th></tr>
<tr><td><strong>Nome</strong></td><td>Claro e sem ambiguidade</td><td>Índice de refugo de usinagem</td></tr>
<tr><td><strong>Fórmula</strong></td><td>Como calcular, exatamente</td><td>(Peças rejeitadas / Total produzido) x 100</td></tr>
<tr><td><strong>Unidade</strong></td><td>Percentual, R$, horas, unidades</td><td>%</td></tr>
<tr><td><strong>Frequência</strong></td><td>Com que periodicidade medir</td><td>Semanal</td></tr>
<tr><td><strong>Meta</strong></td><td>Valor desejado</td><td>Máximo 1,5%</td></tr>
<tr><td><strong>Fonte de dados</strong></td><td>De onde vem o número</td><td>Sistema ERP — módulo de produção</td></tr>
<tr><td><strong>Responsável</strong></td><td>Quem coleta, analisa e atua</td><td>Supervisor de usinagem</td></tr>
</table>

<div class="template-box">
<strong>Template: Ficha de Indicador (KPI Card)</strong>
<table>
<tr><td><strong>Indicador:</strong></td><td>[Nome do indicador]</td></tr>
<tr><td><strong>Processo:</strong></td><td>[Nome do processo ao qual pertence]</td></tr>
<tr><td><strong>Objetivo:</strong></td><td>[O que este indicador pretende monitorar]</td></tr>
<tr><td><strong>Fórmula:</strong></td><td>[Numerador / Denominador x 100] ou [descrição do cálculo]</td></tr>
<tr><td><strong>Unidade:</strong></td><td>[%, R$, unidades, horas, dias...]</td></tr>
<tr><td><strong>Frequência:</strong></td><td>[Diária / Semanal / Mensal / Trimestral]</td></tr>
<tr><td><strong>Meta:</strong></td><td>[Valor alvo + tolerância]</td></tr>
<tr><td><strong>Polaridade:</strong></td><td>[Quanto maior melhor / Quanto menor melhor]</td></tr>
<tr><td><strong>Fonte de dados:</strong></td><td>[ERP, planilha, sistema, medição manual...]</td></tr>
<tr><td><strong>Responsável pela coleta:</strong></td><td>[Nome / função]</td></tr>
<tr><td><strong>Responsável pela análise:</strong></td><td>[Nome / função]</td></tr>
</table>
</div>

<div class="diagram"><svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="380" height="140" rx="10" fill="#0b1730" stroke="#2563eb" stroke-width="1"/><text x="200" y="30" text-anchor="middle" fill="#2563eb" font-size="11" font-weight="bold">FICHA DE KPI — Exemplo completo</text><line x1="10" y1="38" x2="390" y2="38" stroke="#2563eb" stroke-width="0.5"/><text x="20" y="55" fill="#eab308" font-size="9" font-weight="bold">Nome:</text><text x="80" y="55" fill="#fff" font-size="9">Índice de refugo de usinagem</text><text x="20" y="72" fill="#eab308" font-size="9" font-weight="bold">Formula:</text><text x="80" y="72" fill="#fff" font-size="9">(Peças rejeitadas / Total produzido) x 100</text><text x="20" y="89" fill="#eab308" font-size="9" font-weight="bold">Unidade:</text><text x="80" y="89" fill="#fff" font-size="9">%</text><text x="150" y="89" fill="#eab308" font-size="9" font-weight="bold">Frequência:</text><text x="230" y="89" fill="#fff" font-size="9">Semanal</text><text x="20" y="106" fill="#eab308" font-size="9" font-weight="bold">Meta:</text><text x="80" y="106" fill="#16a34a" font-size="9">Max 1,5%</text><text x="150" y="106" fill="#eab308" font-size="9" font-weight="bold">Polaridade:</text><text x="230" y="106" fill="#fff" font-size="9">Quanto menor, melhor</text><text x="20" y="123" fill="#eab308" font-size="9" font-weight="bold">Fonte:</text><text x="80" y="123" fill="#fff" font-size="9">ERP — módulo produção</text><text x="20" y="140" fill="#eab308" font-size="9" font-weight="bold">Responsável:</text><text x="100" y="140" fill="#fff" font-size="9">Supervisor de usinagem</text></svg><figcaption>Exemplo de ficha de KPI com todos os 7 elementos preenchidos</figcaption></div>

<h3>Como definir metas</h3>
<p>Metas devem seguir a lógica <strong>SMART</strong>: Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais. Na prática industrial:</p>
<ul>
<li><strong>Histórico:</strong> Análise os últimos 12 meses. Se o refugo médio foi 3,2%, uma meta de 2,5% é desafiadora mas atingível.</li>
<li><strong>Benchmark:</strong> Compare com empresas do mesmo setor. O índice médio de refugo em metalúrgicas brasileiras gira em torno de 2-3%.</li>
<li><strong>Requisito do cliente:</strong> Se o cliente exige PPM abaixo de 500, sua meta interna deve ser mais apertada (ex: PPM 300).</li>
<li><strong>Capacidade do processo:</strong> Se o Cpk do seu processo é 1,0, você não vai atingir refugo zero — precisa primeiro melhorar o processo.</li>
</ul>

<div class="example"><strong>Exemplo — cooperativa agrícola do Rio Grande do Sul:</strong> A cooperativa definiu o KPI "Tempo médio de classificação de grãos" com fórmula = (tempo total de classificação no dia / número de cargas classificadas). Histórico: 45 min/carga. Meta: 30 min/carga. Frequência: diária. Fonte: sistema de balança. Responsável: gerente de recebimento. Em 6 meses, atingiram 28 min/carga com agendamento e balança automatizada.</div>

<h3>Frequência de medição: como escolher</h3>
<table>
<tr><th>Frequência</th><th>Quando usar</th><th>Exemplos</th></tr>
<tr><td>Diária/por turno</td><td>Processos críticos, alta variabilidade</td><td>OEE, refugo, produção, segurança</td></tr>
<tr><td>Semanal</td><td>Processos com ciclo semanal</td><td>Backlog de manutenção, horas extras</td></tr>
<tr><td>Mensal</td><td>Indicadores agregados, financeiros</td><td>Faturamento, custo da qualidade, turnover</td></tr>
<tr><td>Trimestral</td><td>Indicadores estratégicos</td><td>Satisfação do cliente, market share</td></tr>
</table>

<div class="callout"><strong>Regra prática:</strong> Meça na frequência que permite agir. Se você só mede o refugo mensalmente, quando perceber que está alto, já perdeu 30 dias de produção com problema. Se mede diariamente, age no dia seguinte.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de calcados de Franca (SP) media o refugo mensalmente e o índice sempre ficava "em torno de 3%". Quando passaram a medir diariamente, descobriram que a media de 3% escondia picos de 8-9% nas sextas-feiras — justamente quando operadores menos experientes assumiam as máquinas de costura para cobrir folgas. A ação foi simples: realocar operadores experientes como "padrinhos" nas sextas. O refugo médio caiu de 3% para 1,2% sem nenhum investimento em equipamento.</p></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Um KPI bem definido precisa de 7 elementos: nome, formula, unidade, frequência, meta, fonte de dados e responsável." data-fb-nok="Incorreto. São 7 elementos essenciais. Sem algum deles, o KPI fica incompleto e difícil de gerenciar."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Quantos elementos essenciais deve ter um KPI bem definido?</div><button class="qi-option" data-key="a">3 — nome, formula e meta</button><button class="qi-option" data-key="b">5 — nome, formula, meta, frequência e responsável</button><button class="qi-option" data-key="c">7 — nome, formula, unidade, frequência, meta, fonte de dados e responsável</button><div class="qi-feedback"></div></div>
`}, 'Ficha de indicador (KPI Card)'),

  (${m2.id}, '2-3-dashboards-gestao-visual', 'Dashboards e gestão visual de indicadores', '15 min', 3, ${`
<h2>Dashboards e gestão visual de indicadores</h2>
<p>Indicadores que ficam escondidos em planilhas não geram ação. A <strong>gestão visual</strong> é o princípio de tornar a informação <strong>visível, imediata e compreensível</strong> para quem precisa tomar decisão — do operador ao diretor.</p>

<h3>O que é gestão visual</h3>
<p>Gestão visual é usar recursos gráficos para comunicar informações de desempenho de forma que qualquer pessoa entenda em <strong>menos de 5 segundos</strong>. Exemplos clássicos:</p>
<ul>
<li>Semáforo (verde/amarelo/vermelho) para status de indicadores</li>
<li>Gráfico de tendência na parede do chão de fábrica</li>
<li>Quadro de produção atualizado a cada turno</li>
<li>Dashboard digital em TV na área de gestão</li>
</ul>

<div class="callout"><strong>Princípio Toyota:</strong> "Torne os problemas visíveis." Se o indicador está vermelho e todo mundo vê, a pressão natural para resolver é muito maior do que se o número está numa célula de planilha que só o gerente acessa.</div>

<h3>Tipos de dashboard</h3>
<table>
<tr><th>Tipo</th><th>Público</th><th>Conteúdo</th><th>Frequência de atualização</th></tr>
<tr><td><strong>Operacional</strong></td><td>Operadores, supervisores</td><td>Produção, refugo, paradas, segurança do turno</td><td>Tempo real ou por turno</td></tr>
<tr><td><strong>Tático</strong></td><td>Gerentes, coordenadores</td><td>Indicadores de processo, tendências, planos de ação</td><td>Semanal ou mensal</td></tr>
<tr><td><strong>Estratégico</strong></td><td>Diretoria</td><td>KPIs do negócio, BSC, resultados financeiros</td><td>Mensal ou trimestral</td></tr>
</table>

<h3>Elementos de um bom dashboard</h3>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="390" height="190" rx="10" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="22" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">DASHBOARD OPERACIONAL — Usinagem | Jun 2025</text><line x1="5" y1="28" x2="395" y2="28" stroke="#2563eb" stroke-width="0.5"/><rect x="15" y="35" width="85" height="50" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/><text x="57" y="52" text-anchor="middle" fill="#16a34a" font-size="16" font-weight="bold">79%</text><text x="57" y="65" text-anchor="middle" fill="#94a3b8" font-size="8">OEE | Meta: 75%</text><circle cx="80" cy="42" r="4" fill="#16a34a"/><rect x="110" y="35" width="85" height="50" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/><text x="152" y="52" text-anchor="middle" fill="#c5383c" font-size="16" font-weight="bold">2.1%</text><text x="152" y="65" text-anchor="middle" fill="#94a3b8" font-size="8">Refugo | Meta: 1.5%</text><circle cx="175" cy="42" r="4" fill="#c5383c"/><rect x="205" y="35" width="85" height="50" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/><text x="247" y="52" text-anchor="middle" fill="#16a34a" font-size="16" font-weight="bold">94%</text><text x="247" y="65" text-anchor="middle" fill="#94a3b8" font-size="8">OTIF | Meta: 90%</text><circle cx="270" cy="42" r="4" fill="#16a34a"/><rect x="300" y="35" width="85" height="50" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="342" y="52" text-anchor="middle" fill="#eab308" font-size="16" font-weight="bold">127</text><text x="342" y="65" text-anchor="middle" fill="#94a3b8" font-size="8">Dias sem acidente</text><circle cx="365" cy="42" r="4" fill="#eab308"/><rect x="15" y="95" width="175" height="90" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1"/><text x="102" y="112" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">Tendência OEE (6 meses)</text><polyline points="30,170 55,162 80,155 105,148 130,140 155,133 175,130" fill="none" stroke="#16a34a" stroke-width="1.5"/><line x1="30" y1="155" x2="175" y2="155" stroke="#eab308" stroke-width="1" stroke-dasharray="3"/><text x="178" y="158" fill="#eab308" font-size="7">Meta</text><rect x="205" y="95" width="175" height="90" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1"/><text x="292" y="112" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">Produção do turno</text><rect x="220" y="130" width="15" height="40" fill="#16a34a" rx="2"/><rect x="245" y="140" width="15" height="30" fill="#16a34a" rx="2"/><rect x="270" y="125" width="15" height="45" fill="#16a34a" rx="2"/><rect x="295" y="150" width="15" height="20" fill="#c5383c" rx="2"/><rect x="320" y="135" width="15" height="35" fill="#eab308" rx="2"/><rect x="345" y="145" width="15" height="25" fill="#94a3b8" rx="2" stroke-dasharray="3" stroke="#94a3b8"/></svg><figcaption>Exemplo de dashboard operacional: KPIs com sinaleiro, tendência e produção por turno</figcaption></div>

<p>Um dashboard eficaz segue regras simples:</p>
<ul class="checklist"><li><span class="ck-box"></span>Máximo 7 indicadores por tela</li><li><span class="ck-box"></span>Codificação por cor: verde (meta), amarelo (atenção), vermelho (fora)</li><li><span class="ck-box"></span>Tendência visível (não só o número atual)</li><li><span class="ck-box"></span>Meta explicita junto do resultado real</li><li><span class="ck-box"></span>Período claro ("Refugo — Jun 2025")</li><li><span class="ck-box"></span>Responsável visível (dono do indicador)</li></ul>

<div class="example"><strong>Exemplo — metalúrgica de Bento Gonçalves (RS):</strong> A empresa instalou uma TV de 55 polegadas na entrada do chão de fábrica com dashboard operacional mostrando: OEE do dia, refugo acumulado, pedidos atrasados e dias sem acidente. O efeito psicológico foi imediato: quando o OEE caia abaixo de 70%, os próprios operadores chamavam a manutenção sem esperar o supervisor pedir. Em 3 meses, o OEE médio subiu de 68% para 79%.</div>

<h3>Gestão visual no chão de fábrica</h3>
<p>Nem todo dashboard precisa ser digital. Quadros brancos, quadros kanban e gráficos manuais são igualmente eficazes:</p>

<div class="template-box">
<strong>Template: Quadro de Gestão Visual Diária</strong>
<table>
<tr><th>Item</th><th>Meta</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>
<tr><td>Produção (peças)</td><td>500</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Refugo (%)</td><td>1,5%</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Paradas (min)</td><td>30</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Segurança</td><td>0 acidentes</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Absenteísmo</td><td>3%</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
<p><em>Pintar verde se atingiu meta, vermelho se não atingiu. Reunião de 10 minutos no início do turno para analisar.</em></p>
</div>

<h3>Reuniões de indicadores</h3>
<p>O dashboard só gera resultado se for <strong>discutido regularmente</strong>:</p>
<ul>
<li><strong>Reunião diária (10 min):</strong> No chão de fábrica, em frente ao quadro. Foco: o que aconteceu ontem, o que vamos fazer hoje, quais impedimentos.</li>
<li><strong>Reunião semanal (30 min):</strong> Nível gerencial. Foco: tendências da semana, ações pendentes, necessidade de recursos.</li>
<li><strong>Reunião mensal (60 min):</strong> Nível diretoria. Foco: análise crítica dos KPIs, decisões estratégicas, investimentos.</li>
</ul>

<div class="callout"><strong>Dica:</strong> A reunião não é para "apresentar números bonitos". É para <strong>tomar decisões sobre os números vermelhos</strong>. Se todos os indicadores estão verdes e a reunião dura 5 minutos, ótimo. Se há vermelhos e ninguém propõe ação, a reunião falhou.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de peças automotivas de Jundiai (SP) tinha dashboards bonitos em 3 TVs — mas ninguém olhava. O motivo? Os números eram atualizados mensalmente e ninguém discutia. A mudança veio quando implementaram reunião diária de 10 minutos no chão de fabrica, com o quadro atualizado por turno. O supervisor apontava os indicadores vermelhos e a equipe propunha ações ali mesmo. Em 4 meses, o OEE subiu de 62% para 78% e as paradas não programadas cairam 40%.</p></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A recomendação e de no máximo 7 indicadores por tela para que sejam efetivamente absorvidos e gerem ação." data-fb-nok="Incorreto. Dashboards com muitos indicadores perdem eficácia — o ideal e no máximo 7 por tela."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é o número máximo recomendado de indicadores por tela de dashboard?</div><button class="qi-option" data-key="a">7 indicadores — mais do que isso ninguém absorve</button><button class="qi-option" data-key="b">15 indicadores — quanto mais dados, melhor</button><button class="qi-option" data-key="c">3 indicadores — para manter o foco total</button><div class="qi-feedback"></div></div>
`}, 'Modelo de dashboard operacional'),

  (${m2.id}, '2-4-desdobramento-bsc', 'Desdobramento de objetivos em indicadores (BSC)', '15 min', 4, ${`
<h2>Desdobramento de objetivos em indicadores (BSC)</h2>
<p>O <strong>Balanced Scorecard (BSC)</strong> é uma metodologia criada por Kaplan e Norton nos anos 1990 que resolve um problema clássico: <strong>como conectar a estratégia da empresa com os indicadores do dia a dia</strong>. Sem essa conexão, os indicadores operacionais ficam soltos — você mede refugo, OEE e entrega, mas não sabe se isso está contribuindo para os objetivos estratégicos.</p>

<h3>As 4 perspectivas do BSC</h3>
<table>
<tr><th>Perspectiva</th><th>Pergunta central</th><th>Exemplos de indicadores</th></tr>
<tr><td><strong>Financeira</strong></td><td>Como estamos para os acionistas?</td><td>Faturamento, margem líquida, ROI, custo da não-qualidade</td></tr>
<tr><td><strong>Clientes</strong></td><td>Como os clientes nos veem?</td><td>Satisfação, retenção, OTIF, reclamações, NPS</td></tr>
<tr><td><strong>Processos Internos</strong></td><td>Em que devemos ser excelentes?</td><td>OEE, refugo, lead time, produtividade, PPM</td></tr>
<tr><td><strong>Aprendizado e Crescimento</strong></td><td>Como sustentar a capacidade de mudar?</td><td>Horas de treinamento, turnover, projetos de melhoria, competências</td></tr>
</table>

<div class="callout"><strong>A lógica do BSC:</strong> Se investimos em pessoas e conhecimento (Aprendizado) → nossos processos melhoram (Processos) → atendemos melhor os clientes (Clientes) → geramos mais resultado financeiro (Financeira). É uma cadeia de causa e efeito.</div>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="100" y="5" width="200" height="38" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="200" y="20" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="bold">FINANCEIRA</text><text x="200" y="34" text-anchor="middle" fill="#94a3b8" font-size="8">Margem, faturamento, ROI</text><line x1="200" y1="43" x2="200" y2="52" stroke="#eab308" stroke-width="1.5" marker-start="url(#arrBSC)"/><rect x="100" y="52" width="200" height="38" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="200" y="67" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">CLIENTES</text><text x="200" y="81" text-anchor="middle" fill="#94a3b8" font-size="8">Satisfação, OTIF, NPS</text><line x1="200" y1="90" x2="200" y2="99" stroke="#eab308" stroke-width="1.5" marker-start="url(#arrBSC)"/><rect x="100" y="99" width="200" height="38" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="200" y="114" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">PROCESSOS INTERNOS</text><text x="200" y="128" text-anchor="middle" fill="#94a3b8" font-size="8">OEE, refugo, lead time</text><line x1="200" y1="137" x2="200" y2="146" stroke="#eab308" stroke-width="1.5" marker-start="url(#arrBSC)"/><rect x="100" y="146" width="200" height="38" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="200" y="161" text-anchor="middle" fill="#c5383c" font-size="10" font-weight="bold">APRENDIZADO</text><text x="200" y="175" text-anchor="middle" fill="#94a3b8" font-size="8">Treinamento, kaizen, tecnologia</text><text x="35" y="105" text-anchor="middle" fill="#eab308" font-size="8" transform="rotate(-90,35,105)">CAUSA → EFEITO</text><line x1="50" y1="170" x2="50" y2="30" stroke="#eab308" stroke-width="1" marker-end="url(#arrBSC)"/><defs><marker id="arrBSC" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#eab308"/></marker></defs></svg><figcaption>As 4 perspectivas do BSC: cada nível sustenta o de cima numa cadeia de causa e efeito</figcaption></div>

<h3>Desdobramento: da estratégia ao chão de fábrica</h3>
<p>O desdobramento é o processo de <strong>traduzir objetivos estratégicos em metas operacionais</strong> para cada nível da organização:</p>

<div class="example"><strong>Exemplo — metalúrgica de Sorocaba (SP):</strong><br>
<strong>Objetivo estratégico:</strong> Aumentar margem líquida de 8% para 12% em 2 anos<br>
<strong>Desdobramento:</strong>
<ul>
<li><strong>Financeiro:</strong> Reduzir custo da não-qualidade de 5% para 2% do faturamento</li>
<li><strong>Clientes:</strong> Reduzir reclamações de 15/mês para 5/mês</li>
<li><strong>Processos:</strong> Reduzir refugo de 3,5% para 1,5%; aumentar OEE de 65% para 80%</li>
<li><strong>Aprendizado:</strong> 100% dos operadores treinados em CEP; 4 eventos kaizen por semestre</li>
</ul>
Cada indicador tem meta, responsável e plano de ação. O operador no torno sabe que sua meta de refugo (1,5%) está conectada a meta de custo da não-qualidade (2%) que está conectada a meta de margem (12%).</div>

<h3>Mapa estratégico</h3>
<p>O mapa estratégico é a <strong>representação visual</strong> das relações de causa e efeito entre os objetivos nas 4 perspectivas. É a ferramenta mais poderosa do BSC para alinhar a organização.</p>

<div class="template-box">
<strong>Template simplificado de Mapa Estratégico</strong>
<table>
<tr><th colspan="3">FINANCEIRA</th></tr>
<tr><td>Aumentar faturamento</td><td>Reduzir custos operacionais</td><td>Melhorar margem</td></tr>
<tr><th colspan="3">CLIENTES</th></tr>
<tr><td>Melhorar satisfação</td><td>Reduzir prazo de entrega</td><td>Garantir qualidade do produto</td></tr>
<tr><th colspan="3">PROCESSOS INTERNOS</th></tr>
<tr><td>Otimizar produção (OEE)</td><td>Reduzir refugo e retrabalho</td><td>Agilizar logística interna</td></tr>
<tr><th colspan="3">APRENDIZADO E CRESCIMENTO</th></tr>
<tr><td>Capacitar equipe</td><td>Implementar cultura de melhoria</td><td>Investir em tecnologia</td></tr>
</table>
<p><em>Cada objetivo se conecta aos de cima por setas de causa e efeito.</em></p>
</div>

<h3>BSC para pequenas e médias empresas</h3>
<p>O BSC não é só para multinacionais. Uma versão simplificada funciona para qualquer empresa:</p>
<ol>
<li>Defina 2-3 objetivos por perspectiva (não mais que 12 no total)</li>
<li>Atribua 1-2 indicadores por objetivo</li>
<li>Defina metas anuais e marcos trimestrais</li>
<li>Revise mensalmente na reunião de gestão</li>
</ol>

<div class="callout"><strong>Erro comum:</strong> Empresas criam 50 indicadores e não acompanham nenhum. Melhor ter 10 indicadores realmente monitorados do que 50 em planilhas que ninguém abre. Comece simples, amplie conforme a maturidade.</div>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Defina objetivos</strong><br>2-3 objetivos por perspectiva (max 12 total)</div></div><div class="step-item"><div class="step-content"><strong>2. Atribua indicadores</strong><br>1-2 KPIs por objetivo com ficha completa</div></div><div class="step-item"><div class="step-content"><strong>3. Defina metas</strong><br>Anuais com marcos trimestrais</div></div><div class="step-item"><div class="step-content"><strong>4. Revise mensalmente</strong><br>Na reunião de gestão com plano de ação</div></div></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma indústria de plasticos de Joinville (SC), com 120 funcionários, implantou um BSC simplificado com apenas 10 indicadores (2-3 por perspectiva). O diretor resistia: "BSC e coisa de multinacional". O consultor mostrou que não: bastava conectar a meta de faturamento (financeira) com satisfação do cliente (clientes), com produtividade e refugo (processos), e com horas de treinamento (aprendizado). Em 18 meses, a margem liquida subiu de 6% para 11% — porque cada nível da empresa sabia como seu indicador impactava o resultado final.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O BSC conecta estratégia com operação através de 4 perspectivas: Financeira, Clientes, Processos Internos e Aprendizado." data-fb-nok="Incorreto. O BSC tem 4 perspectivas que formam uma cadeia de causa e efeito da estratégia a operação."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a função principal do BSC (Balanced Scorecard)?</div><button class="qi-option" data-key="a">Substituir os indicadores operacionais por indicadores financeiros</button><button class="qi-option" data-key="b">Conectar a estratégia da empresa com indicadores operacionais do dia a dia</button><button class="qi-option" data-key="c">Criar o máximo de indicadores possível para cobrir toda a empresa</button><div class="qi-feedback"></div></div>
`}, 'Mapa estratégico BSC modelo')`;

  // ── Module 3: Ferramentas de Análise ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Análise', 'Ishikawa, Pareto, 5 Porquês, Matriz GUT e FMEA para diagnóstico de problemas', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '3-1-diagrama-ishikawa', 'Diagrama de Ishikawa (causa e efeito)', '15 min', 1, ${`
<h2>Diagrama de Ishikawa (causa e efeito)</h2>
<p>O Diagrama de Ishikawa — também chamado de <strong>espinha de peixe</strong> ou <strong>diagrama de causa e efeito</strong> — foi criado por Kaoru Ishikawa em 1943 e contínua sendo uma das ferramentas mais usadas para <strong>identificar causas potenciais de um problema</strong>.</p>

<h3>Estrutura do diagrama</h3>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><line x1="50" y1="100" x2="340" y2="100" stroke="#fff" stroke-width="2.5"/><rect x="340" y="75" width="55" height="50" rx="6" fill="#c5383c" stroke="#c5383c" stroke-width="2"/><text x="367" y="96" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">EFEITO</text><text x="367" y="110" text-anchor="middle" fill="#fff" font-size="7">(Problema)</text><line x1="90" y1="30" x2="140" y2="100" stroke="#2563eb" stroke-width="1.5"/><text x="70" y="25" fill="#2563eb" font-size="9" font-weight="bold">Máquina</text><line x1="90" y1="42" x2="110" y2="60" stroke="#94a3b8" stroke-width="1"/><text x="60" y="45" fill="#94a3b8" font-size="7">Desgaste</text><line x1="190" y1="30" x2="210" y2="100" stroke="#16a34a" stroke-width="1.5"/><text x="175" y="25" fill="#16a34a" font-size="9" font-weight="bold">Método</text><line x1="185" y1="42" x2="198" y2="60" stroke="#94a3b8" stroke-width="1"/><text x="160" y="45" fill="#94a3b8" font-size="7">IT antiga</text><line x1="280" y1="30" x2="280" y2="100" stroke="#eab308" stroke-width="1.5"/><text x="280" y="22" fill="#eab308" font-size="9" font-weight="bold">Mão obra</text><line x1="268" y1="50" x2="278" y2="60" stroke="#94a3b8" stroke-width="1"/><text x="240" y="48" fill="#94a3b8" font-size="7">S/ treino</text><line x1="90" y1="170" x2="140" y2="100" stroke="#c5383c" stroke-width="1.5"/><text x="68" y="180" fill="#c5383c" font-size="9" font-weight="bold">Material</text><line x1="95" y1="155" x2="112" y2="140" stroke="#94a3b8" stroke-width="1"/><text x="60" y="155" fill="#94a3b8" font-size="7">Fora spec</text><line x1="190" y1="170" x2="210" y2="100" stroke="#fff" stroke-width="1.5"/><text x="170" y="182" fill="#fff" font-size="9" font-weight="bold">Meio amb.</text><line x1="280" y1="170" x2="280" y2="100" stroke="#2563eb" stroke-width="1.5"/><text x="280" y="185" fill="#2563eb" font-size="9" font-weight="bold">Medição</text><line x1="268" y1="150" x2="278" y2="140" stroke="#94a3b8" stroke-width="1"/><text x="230" y="152" fill="#94a3b8" font-size="7">Descalibr.</text></svg><figcaption>Diagrama de Ishikawa (espinha de peixe): 6M apontando para o efeito/problema</figcaption></div>

<h3>Os 6M — categorias clássicas</h3>
<p>Na indústria, as categorias tradicionais são os <strong>6M</strong>:</p>
<table>
<tr><th>Categoria</th><th>O que investigar</th><th>Exemplos de causas</th></tr>
<tr><td><strong>Máquina</strong></td><td>Equipamentos, ferramentas, instrumentos</td><td>Máquina descalibrada, ferramenta desgastada, falta de manutenção preventiva</td></tr>
<tr><td><strong>Método</strong></td><td>Procedimentos, instruções, fluxos</td><td>Instrução de trabalho desatualizada, ausência de padrão, sequência incorreta</td></tr>
<tr><td><strong>Mão de obra</strong></td><td>Pessoas, competências, treinamento</td><td>Falta de treinamento, rotatividade alta, fadiga por excesso de horas extras</td></tr>
<tr><td><strong>Material</strong></td><td>Matéria-prima, insumos, componentes</td><td>Material fora de especificação, fornecedor não qualificado, armazenamento inadequado</td></tr>
<tr><td><strong>Meio ambiente</strong></td><td>Condições ambientais, layout</td><td>Temperatura excessiva, iluminação insuficiente, contaminação, layout desorganizado</td></tr>
<tr><td><strong>Medição</strong></td><td>Instrumentos, métodos de medição</td><td>Instrumento descalibrado, critério de inspeção subjetivo, amostragem insuficiente</td></tr>
</table>

<div class="callout"><strong>Variação:</strong> Para processos de serviço, use 4P: Políticas, Procedimentos, Pessoas e Planta (infraestrutura). O importante é adaptar as categorias ao seu contexto.</div>

<h3>Como construir — passo a passo</h3>
<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Defina o problema</strong><br>"Refugo no torneamento CNC subiu de 1,5% para 4,2% em marco" (específico, com dados)</div></div><div class="step-item"><div class="step-content"><strong>2. Desenhe a estrutura</strong><br>Cabeca + espinha central + 6 espinhas de categoria (6M)</div></div><div class="step-item"><div class="step-content"><strong>3. Brainstorming por M</strong><br>Reuna operadores, técnicos e supervisor. Liste causas em cada M.</div></div><div class="step-item"><div class="step-content"><strong>4. Aprofunde com "Por que?"</strong><br>Para cada causa, pergunte por que até chegar a causas profundas</div></div><div class="step-item"><div class="step-content"><strong>5. Priorize (3-5 causas)</strong><br>Marque as mais prováveis com base em DADOS, não achismo</div></div><div class="step-item"><div class="step-content"><strong>6. Valide com dados</strong><br>Confirme as causas priorizadas com evidência real antes de agir</div></div></div>

<div class="example"><strong>Exemplo completo — indústria alimentícia de Londrina (PR):</strong><br>
<strong>Problema:</strong> Aumento de devoluções de iogurte por "sabor ácido" (de 0,3% para 1,8% em 2 meses)<br>
<strong>Causas identificadas:</strong>
<ul>
<li><strong>Máquina:</strong> Pasteurizador com temperatura instável (variação de +/- 3 graus C)</li>
<li><strong>Material:</strong> Novo fornecedor de fermento láctico com concentração diferente</li>
<li><strong>Método:</strong> Tempo de fermentação não ajustado para lote maior</li>
<li><strong>Medição:</strong> PHmetro sem calibração há 4 meses</li>
</ul>
<strong>Causa raiz validada:</strong> A combinação do novo fermento + tempo não ajustado + medição imprecisa. A empresa calibrou o PHmetro, ajustou o tempo de fermentação e qualificou o novo fornecedor. Devoluções voltaram a 0,2% em 6 semanas.</div>

<div class="template-box">
<strong>Template: Registro do Ishikawa</strong>
<table>
<tr><td><strong>Problema (efeito):</strong></td><td>[Descreva o problema com dados]</td></tr>
<tr><td><strong>Data da análise:</strong></td><td>[DD/MM/AAAA]</td></tr>
<tr><td><strong>Equipe:</strong></td><td>[Nomes e funções]</td></tr>
<tr><td><strong>Máquina:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Método:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Mão de obra:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Material:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Meio ambiente:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Medição:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Causas priorizadas:</strong></td><td>[As 3-5 mais prováveis, com justificativa]</td></tr>
<tr><td><strong>Verificação:</strong></td><td>[Como validou cada causa]</td></tr>
</table>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Os 6M são: Máquina, Método, Mão de obra, Material, Meio ambiente e Medição." data-fb-nok="Incorreto. Os 6M classicos do Ishikawa industrial são: Máquina, Método, Mão de obra, Material, Meio ambiente e Medição."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Quais são as 6 categorias classicas (6M) do Diagrama de Ishikawa?</div><button class="qi-option" data-key="a">Marketing, Mercado, Margem, Marca, Meta, Missão</button><button class="qi-option" data-key="b">Máquina, Método, Mão de obra, Material, Meio ambiente, Medição</button><button class="qi-option" data-key="c">Manutenção, Material, Modelo, Mapa, Meta, Monitoramento</button><div class="qi-feedback"></div></div>
`}, 'Template Ishikawa preenchível'),

  (${m3.id}, '3-2-5-porques-pareto', '5 Porquês e Diagrama de Pareto', '15 min', 2, ${`
<h2>5 Porquês e Diagrama de Pareto</h2>
<p>Duas ferramentas complementares e poderosas: os <strong>5 Porquês</strong> aprofundam a busca pela causa raiz de um problema específico, enquanto o <strong>Diagrama de Pareto</strong> mostra quais problemas merecem atenção primeiro.</p>

<h3>5 Porquês (5 Whys)</h3>
<p>Criada por Taiichi Ohno na Toyota, a técnica é simples: pergunte "por quê?" repetidamente (geralmente 5 vezes) até chegar à <strong>causa raiz</strong> — aquela que, se eliminada, evita que o problema se repita.</p>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><rect x="130" y="5" width="140" height="28" rx="6" fill="#c5383c" stroke="#c5383c" stroke-width="1.5"/><text x="200" y="23" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">PROBLEMA: Peça fora de tolerância</text><line x1="200" y1="33" x2="200" y2="40" stroke="#eab308" stroke-width="1.5"/><rect x="100" y="40" width="200" height="24" rx="5" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="110" y="55" fill="#eab308" font-size="8" font-weight="bold">1o PQ?</text><text x="200" y="55" fill="#fff" font-size="8">Ferramenta desgastada</text><line x1="200" y1="64" x2="200" y2="72" stroke="#eab308" stroke-width="1.5"/><rect x="100" y="72" width="200" height="24" rx="5" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="110" y="87" fill="#eab308" font-size="8" font-weight="bold">2o PQ?</text><text x="200" y="87" fill="#fff" font-size="8">Não trocada no momento certo</text><line x1="200" y1="96" x2="200" y2="104" stroke="#eab308" stroke-width="1.5"/><rect x="100" y="104" width="200" height="24" rx="5" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="110" y="119" fill="#eab308" font-size="8" font-weight="bold">3o PQ?</text><text x="200" y="119" fill="#fff" font-size="8">Sem controle de vida útil</text><line x1="200" y1="128" x2="200" y2="136" stroke="#eab308" stroke-width="1.5"/><rect x="100" y="136" width="200" height="24" rx="5" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/><text x="110" y="151" fill="#eab308" font-size="8" font-weight="bold">4o PQ?</text><text x="200" y="151" fill="#fff" font-size="8">Padrão de troca não definido</text><line x1="200" y1="160" x2="200" y2="168" stroke="#eab308" stroke-width="1.5"/><rect x="100" y="168" width="200" height="24" rx="5" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="110" y="183" fill="#16a34a" font-size="8" font-weight="bold">5o PQ?</text><text x="210" y="183" fill="#16a34a" font-size="8">IT não inclui critério de troca</text><text x="340" y="183" fill="#16a34a" font-size="7" font-weight="bold">CAUSA RAIZ</text></svg><figcaption>5 Porquês: cada resposta gera uma nova pergunta até chegar a causa raiz acionavel</figcaption></div>

<div class="example"><strong>Exemplo — metalúrgica de Contagem (MG):</strong><br>
<strong>Problema:</strong> Peça rejeitada por dimensão fora de tolerância<br>
<strong>1o Por quê?</strong> A peça saiu 0,3mm acima da tolerância → Porque a ferramenta de corte estava desgastada<br>
<strong>2o Por quê?</strong> A ferramenta estava desgastada → Porque não foi trocada no momento certo<br>
<strong>3o Por quê?</strong> Não foi trocada → Porque não existe controle de vida útil da ferramenta<br>
<strong>4o Por quê?</strong> Não existe controle → Porque nunca foi definido um padrão de troca<br>
<strong>5o Por quê?</strong> Não foi definido → Porque a instrução de trabalho não inclui critério de troca de ferramenta<br>
<strong>Causa raiz:</strong> Instrução de trabalho incompleta (não define critério de troca de ferramenta)<br>
<strong>Ação:</strong> Atualizar IT com vida útil estimada por tipo de ferramenta/material e criar controle visual de troca</div>

<h3>Regras para usar os 5 Porquês corretamente</h3>
<ul>
<li><strong>Não é sempre 5:</strong> Pode ser 3, 7 ou 8 — o número é um guia, não uma regra rígida. Pare quando chegar a algo acionável.</li>
<li><strong>Baseie-se em fatos:</strong> Cada "por quê" deve ter evidência. "Porque o operador não quis" não é causa raiz — é achismo.</li>
<li><strong>Foque no processo, não nas pessoas:</strong> "Porque o João errou" não é causa raiz. "Porque o procedimento permite ambiguidade" sim.</li>
<li><strong>Considere múltiplas cadeias:</strong> Um problema pode ter mais de uma cadeia de "por quês". Explore todas.</li>
</ul>

<div class="callout"><strong>Armadilha comum:</strong> Parar cedo demais. "A peça saiu ruim porque a máquina estava com problema" não é causa raiz — é preciso perguntar POR QUE a máquina estava com problema, POR QUE não foi feita manutenção, etc.</div>

<h3>Diagrama de Pareto</h3>
<p>O Diagrama de Pareto é baseado no <strong>princípio 80/20</strong> de Vilfredo Pareto: aproximadamente 80% dos problemas vêm de 20% das causas. O diagrama ordena as causas por frequência ou impacto, permitindo priorizar o que tratar primeiro.</p>

<div class="diagram"><svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><line x1="60" y1="150" x2="380" y2="150" stroke="#94a3b8" stroke-width="1"/><line x1="60" y1="20" x2="60" y2="150" stroke="#94a3b8" stroke-width="1"/><rect x="75" y="50" width="40" height="100" fill="#c5383c" rx="2"/><text x="95" y="162" text-anchor="middle" fill="#fff" font-size="7">Trinca</text><text x="95" y="45" text-anchor="middle" fill="#c5383c" font-size="8">32%</text><rect x="130" y="62" width="40" height="88" fill="#c5383c" rx="2"/><text x="150" y="162" text-anchor="middle" fill="#fff" font-size="7">Infiltr.</text><text x="150" y="57" text-anchor="middle" fill="#c5383c" font-size="8">27%</text><rect x="185" y="82" width="40" height="68" fill="#eab308" rx="2"/><text x="205" y="162" text-anchor="middle" fill="#fff" font-size="7">Piso</text><text x="205" y="77" text-anchor="middle" fill="#eab308" font-size="8">16%</text><rect x="240" y="98" width="40" height="52" fill="#2563eb" rx="2"/><text x="260" y="162" text-anchor="middle" fill="#fff" font-size="7">Esquadr.</text><text x="260" y="93" text-anchor="middle" fill="#2563eb" font-size="8">11%</text><rect x="295" y="108" width="40" height="42" fill="#94a3b8" rx="2"/><text x="315" y="162" text-anchor="middle" fill="#fff" font-size="7">Eletric.</text><text x="315" y="103" text-anchor="middle" fill="#94a3b8" font-size="8">8%</text><rect x="350" y="118" width="25" height="32" fill="#94a3b8" rx="2" opacity="0.6"/><text x="362" y="162" text-anchor="middle" fill="#fff" font-size="7">Outros</text><polyline points="95,48 150,38 205,34 260,32 315,30 362,28" fill="none" stroke="#16a34a" stroke-width="2"/><circle cx="95" cy="48" r="3" fill="#16a34a"/><circle cx="150" cy="38" r="3" fill="#16a34a"/><circle cx="205" cy="34" r="3" fill="#16a34a"/><text x="95" y="44" text-anchor="middle" fill="#16a34a" font-size="7">32%</text><text x="150" y="34" text-anchor="middle" fill="#16a34a" font-size="7">59%</text><text x="205" y="30" text-anchor="middle" fill="#16a34a" font-size="7">75%</text><line x1="60" y1="37" x2="380" y2="37" stroke="#eab308" stroke-width="1" stroke-dasharray="4"/><text x="385" y="40" fill="#eab308" font-size="7">80%</text><text x="30" y="100" text-anchor="middle" fill="#94a3b8" font-size="8" transform="rotate(-90,30,100)">Frequência</text></svg><figcaption>Diagrama de Pareto: barras (frequência) + linha (% acumulado). Os 3 primeiros = 75% dos problemas</figcaption></div>

<h3>Como construir um Pareto</h3>
<ol>
<li><strong>Colete dados:</strong> Registre a frequência de cada tipo de problema/defeito em um período definido</li>
<li><strong>Ordene:</strong> Coloque do mais frequente ao menos frequente</li>
<li><strong>Calcule o percentual acumulado:</strong> Some os percentuais progressivamente</li>
<li><strong>Desenhe:</strong> Barras para frequência (eixo esquerdo) + linha para acumulado (eixo direito)</li>
<li><strong>Identifique o "vital few":</strong> Os poucos tipos que somam 80% dos problemas</li>
</ol>

<div class="example"><strong>Exemplo — construtora de Curitiba (PR):</strong><br>
<strong>Dados de não-conformidades em 6 meses:</strong>
<table>
<tr><th>Tipo de defeito</th><th>Ocorrências</th><th>%</th><th>% Acumulado</th></tr>
<tr><td>Trinca em alvenaria</td><td>45</td><td>32%</td><td>32%</td></tr>
<tr><td>Infiltração</td><td>38</td><td>27%</td><td>59%</td></tr>
<tr><td>Desalinhamento de piso</td><td>22</td><td>16%</td><td>75%</td></tr>
<tr><td>Defeito em esquadria</td><td>15</td><td>11%</td><td>86%</td></tr>
<tr><td>Problema elétrico</td><td>12</td><td>8%</td><td>94%</td></tr>
<tr><td>Outros</td><td>8</td><td>6%</td><td>100%</td></tr>
</table>
<strong>Conclusão:</strong> Trinca + Infiltração + Desalinhamento = 75% dos problemas. Atacar esses 3 resolve 3/4 das não-conformidades.</div>

<h3>Combinando as duas ferramentas</h3>
<p>Use na seguinte sequência:</p>
<ol>
<li><strong>Pareto primeiro:</strong> Identifique QUAIS problemas atacar (os "vital few")</li>
<li><strong>5 Porquês depois:</strong> Para cada problema priorizado pelo Pareto, aprofunde a causa raiz</li>
</ol>

<div class="callout"><strong>Na prática:</strong> Essa combinação é a mais usada em círculos de qualidade e equipes de melhoria contínua no Brasil. O Pareto direciona o foco, os 5 Porquês encontram a raiz. Juntos, evitam o desperdício de resolver problemas errados ou tratar sintomas em vez de causas.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de peças estampadas de Guarulhos (SP) registrava 12 tipos diferentes de defeitos. O gerente queria atacar todos ao mesmo tempo com um "programa de qualidade total". O consultor pediu: "Vamos fazer um Pareto primeiro." O gráfico mostrou que 3 defeitos (rebarba, dimensão fora e amassamento) representavam 78% das rejeições. Focaram nos 3 com 5 Porquês para cada. Em 4 meses, reduziram o refugo total de 5,2% para 1,8% — atacando apenas 3 dos 12 defeitos.</p></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Use Pareto primeiro para identificar QUAIS problemas atacar, depois 5 Porquês para encontrar a causa raiz de cada um." data-fb-nok="Incorreto. A sequência lógica e: Pareto prioriza o foco, 5 Porquês encontra a raiz. Nessa ordem."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a sequência correta para combinar Pareto e 5 Porquês?</div><button class="qi-option" data-key="a">5 Porquês primeiro, depois Pareto para validar</button><button class="qi-option" data-key="b">Usar apenas uma das ferramentas, nunca as duas</button><button class="qi-option" data-key="c">Pareto primeiro (priorizar problemas), depois 5 Porquês (encontrar causa raiz)</button><div class="qi-feedback"></div></div>
`}, NULL),

  (${m3.id}, '3-3-matriz-gut', 'Matriz GUT e priorização', '15 min', 3, ${`
<h2>Matriz GUT e priorização</h2>
<p>Quando você tem uma lista de problemas ou oportunidades e precisa decidir <strong>qual atacar primeiro</strong>, a Matriz GUT é uma ferramenta objetiva de priorização. GUT é o acrônimo de <strong>Gravidade, Urgência e Tendência</strong>.</p>

<h3>Os 3 critérios</h3>
<table>
<tr><th>Critério</th><th>Pergunta</th><th>O que avalia</th></tr>
<tr><td><strong>G — Gravidade</strong></td><td>Se não resolver, qual o impacto?</td><td>Consequência do problema (financeiro, segurança, cliente, legal)</td></tr>
<tr><td><strong>U — Urgência</strong></td><td>Quanto tempo tenho para agir?</td><td>Pressão do tempo (pode esperar ou é imediato?)</td></tr>
<tr><td><strong>T — Tendência</strong></td><td>Se não agir, vai piorar?</td><td>Evolução do problema ao longo do tempo</td></tr>
</table>

<h3>Escala de pontuação</h3>
<table>
<tr><th>Nota</th><th>Gravidade</th><th>Urgência</th><th>Tendência</th></tr>
<tr><td><strong>5</strong></td><td>Extremamente grave</td><td>Precisa de ação imediata</td><td>Piora rapidamente</td></tr>
<tr><td><strong>4</strong></td><td>Muito grave</td><td>Ação urgente</td><td>Piora em curto prazo</td></tr>
<tr><td><strong>3</strong></td><td>Grave</td><td>Ação o mais rápido possível</td><td>Piora em médio prazo</td></tr>
<tr><td><strong>2</strong></td><td>Pouco grave</td><td>Pode esperar um pouco</td><td>Piora em longo prazo</td></tr>
<tr><td><strong>1</strong></td><td>Sem gravidade</td><td>Pode esperar</td><td>Não piora (ou melhora)</td></tr>
</table>

<p><strong>Cálculo:</strong> GUT = G x U x T. O problema com maior pontuação é prioridade número 1.</p>

<div class="diagram"><svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="120" height="140" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="70" y="35" text-anchor="middle" fill="#c5383c" font-size="14" font-weight="bold">G</text><text x="70" y="52" text-anchor="middle" fill="#fff" font-size="10">Gravidade</text><text x="70" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Se não resolver,</text><text x="70" y="82" text-anchor="middle" fill="#94a3b8" font-size="8">qual o impacto?</text><text x="70" y="105" text-anchor="middle" fill="#c5383c" font-size="10">1 (leve)</text><text x="70" y="120" text-anchor="middle" fill="#c5383c" font-size="10">a</text><text x="70" y="135" text-anchor="middle" fill="#c5383c" font-size="10">5 (extremo)</text><text x="145" y="85" text-anchor="middle" fill="#eab308" font-size="18" font-weight="bold">x</text><rect x="160" y="10" width="120" height="140" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="220" y="35" text-anchor="middle" fill="#eab308" font-size="14" font-weight="bold">U</text><text x="220" y="52" text-anchor="middle" fill="#fff" font-size="10">Urgência</text><text x="220" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Quanto tempo</text><text x="220" y="82" text-anchor="middle" fill="#94a3b8" font-size="8">para agir?</text><text x="220" y="105" text-anchor="middle" fill="#eab308" font-size="10">1 (pode esperar)</text><text x="220" y="120" text-anchor="middle" fill="#eab308" font-size="10">a</text><text x="220" y="135" text-anchor="middle" fill="#eab308" font-size="10">5 (imediato)</text><text x="295" y="85" text-anchor="middle" fill="#eab308" font-size="18" font-weight="bold">x</text><rect x="310" y="10" width="80" height="140" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="350" y="35" text-anchor="middle" fill="#2563eb" font-size="14" font-weight="bold">T</text><text x="350" y="52" text-anchor="middle" fill="#fff" font-size="10">Tendência</text><text x="350" y="70" text-anchor="middle" fill="#94a3b8" font-size="8">Vai piorar?</text><text x="350" y="105" text-anchor="middle" fill="#2563eb" font-size="10">1 (estável)</text><text x="350" y="120" text-anchor="middle" fill="#2563eb" font-size="10">a</text><text x="350" y="135" text-anchor="middle" fill="#2563eb" font-size="10">5 (rápido)</text></svg><figcaption>Matriz GUT: multiplique G x U x T para obter a prioridade de cada problema</figcaption></div>

<div class="example"><strong>Exemplo — cooperativa agrícola de Cascavel (PR):</strong><br>
A cooperativa levantou 5 problemas no processo de recebimento de grãos:
<table>
<tr><th>Problema</th><th>G</th><th>U</th><th>T</th><th>GxUxT</th><th>Prioridade</th></tr>
<tr><td>Balança com erro de +/- 50kg</td><td>5</td><td>5</td><td>4</td><td>100</td><td>1o</td></tr>
<tr><td>Fila de espera de 3h no pico</td><td>4</td><td>4</td><td>5</td><td>80</td><td>2o</td></tr>
<tr><td>Classificador sem treinamento atualizado</td><td>3</td><td>3</td><td>4</td><td>36</td><td>3o</td></tr>
<tr><td>Sistema de agendamento fora do ar</td><td>3</td><td>4</td><td>2</td><td>24</td><td>4o</td></tr>
<tr><td>Goteira no armazém 3</td><td>2</td><td>2</td><td>3</td><td>12</td><td>5o</td></tr>
</table>
<strong>Decisão:</strong> Calibrar a balança primeiro (impacto financeiro direto no peso dos grãos), depois resolver a fila de espera (produtores estão migrando para concorrente).</div>

<h3>Quando usar a Matriz GUT</h3>
<ul>
<li>Na reunião de análise crítica, para priorizar ações corretivas</li>
<li>No planejamento de projetos de melhoria</li>
<li>Na seleção de riscos a tratar (pode ser usada como complemento à cláusula 6.1 da ISO 9001)</li>
<li>Na priorização de investimentos em manutenção</li>
</ul>

<h3>Cuidados ao usar</h3>
<ul>
<li><strong>Não use sozinho:</strong> A pontuação é subjetiva. Faça com um grupo (3-5 pessoas) para reduzir viés individual.</li>
<li><strong>Defina critérios claros:</strong> O que significa "extremamente grave" no seu contexto? R$ 100.000 de prejuízo? Risco de acidente fatal? Perda de cliente-chave?</li>
<li><strong>Revise periodicamente:</strong> A pontuação muda com o tempo. O que era urgência 2 pode virar 5 em um mês.</li>
</ul>

<div class="template-box">
<strong>Template: Matriz GUT</strong>
<table>
<tr><th>Item / Problema</th><th>G (1-5)</th><th>U (1-5)</th><th>T (1-5)</th><th>GxUxT</th><th>Prioridade</th><th>Responsável</th><th>Prazo</th></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
</div>

<div class="callout"><strong>GUT vs. Pareto:</strong> O Pareto prioriza por FREQUÊNCIA (o que acontece mais). O GUT prioriza por IMPACTO (o que faz mais estrago). Use Pareto quando tem dados históricos; use GUT quando precisa priorizar com a equipe e os problemas são qualitativamente diferentes.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma empresa de manutenção industrial de Cuiaba (MT) tinha 14 demandas de melhoria e recursos para atacar apenas 3 por trimestre. O gerente decidia "no feeling" — e sempre priorizava o que o cliente mais barulhento reclamava. Ao implementar a Matriz GUT com a equipe (5 pessoas pontuando independentemente), descobriram que o problema mais reclamado (lentidao no relatório) tinha GUT = 18, enquanto "vazamento de óleo no compressor" tinha GUT = 100 (G5 x U5 x T4) — risco de incendio e parada total. A priorização objetiva salvou a empresa de um incidente grave.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A pontuação GUT e calculada multiplicando G x U x T. Quanto maior, mais prioritario." data-fb-nok="Incorreto. A formula e multiplicação (G x U x T), não soma. Isso amplifica a diferença entre problemas críticos e menores."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Como e calculada a prioridade na Matriz GUT?</div><button class="qi-option" data-key="a">G + U + T (soma dos três critérios)</button><button class="qi-option" data-key="b">G x U x T (multiplicação dos três critérios)</button><button class="qi-option" data-key="c">Media simples de G, U e T</button><div class="qi-feedback"></div></div>
`}, 'Matriz GUT preenchível'),

  (${m3.id}, '3-4-fmea-processos', 'FMEA simplificado para processos', '15 min', 4, ${`
<h2>FMEA simplificado para processos</h2>
<p>O <strong>FMEA (Failure Mode and Effects Analysis)</strong> — ou Análise de Modos de Falha e seus Efeitos — é uma ferramenta <strong>preventiva</strong> que identifica falhas potenciais em um processo ANTES que elas aconteçam, avalia seu risco e define ações para reduzir esse risco.</p>

<div class="callout"><strong>Diferença fundamental:</strong> O Ishikawa e os 5 Porquês são ferramentas REATIVAS (o problema já aconteceu). O FMEA é PREVENTIVO (analisa o que PODE dar errado). Essa é a essência do pensamento baseado em risco da ISO 9001:2015.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Ferramentas REATIVAS</h4><ul><li>Ishikawa — analisa DEPOIS do problema</li><li>5 Porquês — busca causa de falha JÁ ocorrida</li><li>Pareto — prioriza defeitos JÁ registrados</li><li>Agem sobre o passado</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> FMEA — PREVENTIVO</h4><ul><li>Analisa o que PODE dar errado</li><li>Avalia risco ANTES da falha</li><li>Define ações para EVITAR que aconteca</li><li>Age sobre o futuro (pensamento baseado em risco)</li></ul></div></div>

<h3>Estrutura do FMEA de processo</h3>
<p>Para cada etapa do processo, o FMEA analisa:</p>
<table>
<tr><th>Elemento</th><th>Pergunta</th></tr>
<tr><td><strong>Modo de falha</strong></td><td>O que pode dar errado nesta etapa?</td></tr>
<tr><td><strong>Efeito da falha</strong></td><td>Se falhar, qual é o impacto no cliente ou no processo seguinte?</td></tr>
<tr><td><strong>Causa da falha</strong></td><td>O que pode causar essa falha?</td></tr>
<tr><td><strong>Controles atuais</strong></td><td>O que existe hoje para prevenir ou detectar esta falha?</td></tr>
</table>

<h3>Os 3 índices do FMEA</h3>
<table>
<tr><th>Índice</th><th>O que mede</th><th>Escala</th></tr>
<tr><td><strong>S — Severidade</strong></td><td>Gravidade do efeito da falha</td><td>1 (imperceptível) a 10 (catastrófico)</td></tr>
<tr><td><strong>O — Ocorrência</strong></td><td>Probabilidade de a causa acontecer</td><td>1 (improvável) a 10 (quase certo)</td></tr>
<tr><td><strong>D — Detecção</strong></td><td>Capacidade de detectar a falha antes de chegar ao cliente</td><td>1 (certamente detecta) a 10 (não detecta)</td></tr>
</table>

<p><strong>RPN (Risk Priority Number) = S x O x D</strong></p>
<p>Quanto maior o RPN, maior o risco. Valores acima de 100-125 (depende do critério da empresa) demandam ação.</p>

<div class="diagram"><svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="15" width="100" height="60" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="60" y="35" text-anchor="middle" fill="#c5383c" font-size="12" font-weight="bold">S</text><text x="60" y="50" text-anchor="middle" fill="#fff" font-size="9">Severidade</text><text x="60" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">1 (leve) a 10 (fatal)</text><text x="125" y="50" text-anchor="middle" fill="#eab308" font-size="16" font-weight="bold">x</text><rect x="140" y="15" width="100" height="60" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="190" y="35" text-anchor="middle" fill="#eab308" font-size="12" font-weight="bold">O</text><text x="190" y="50" text-anchor="middle" fill="#fff" font-size="9">Ocorrência</text><text x="190" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">1 (raro) a 10 (certo)</text><text x="255" y="50" text-anchor="middle" fill="#eab308" font-size="16" font-weight="bold">x</text><rect x="270" y="15" width="100" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="320" y="35" text-anchor="middle" fill="#2563eb" font-size="12" font-weight="bold">D</text><text x="320" y="50" text-anchor="middle" fill="#fff" font-size="9">Detecção</text><text x="320" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">1 (detecta) a 10 (não)</text><text x="200" y="95" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="bold">RPN = S x O x D (acima de 100-125 = ação obrigatória)</text></svg><figcaption>Formula RPN: Severidade x Ocorrência x Detecção — quanto maior, maior o risco</figcaption></div>

<div class="example"><strong>Exemplo — metalúrgica de Cachoeirinha (RS):</strong><br>
<strong>Processo:</strong> Soldagem de chassis<br>
<table>
<tr><th>Etapa</th><th>Modo de falha</th><th>Efeito</th><th>Causa</th><th>Controle atual</th><th>S</th><th>O</th><th>D</th><th>RPN</th></tr>
<tr><td>Preparação da junta</td><td>Superfície com oleosidade</td><td>Porosidade na solda, rejeição no ensaio</td><td>Limpeza inadequada da peça</td><td>Instrução de trabalho (visual)</td><td>7</td><td>5</td><td>6</td><td>210</td></tr>
<tr><td>Soldagem MIG</td><td>Parâmetros incorretos</td><td>Solda fria, trinca</td><td>Setup não conferido</td><td>Checklist de setup</td><td>9</td><td>3</td><td>4</td><td>108</td></tr>
<tr><td>Inspeção visual</td><td>Defeito não detectado</td><td>Peça defeituosa entregue ao cliente</td><td>Inspetor sem treinamento em defeitos de solda</td><td>Nenhum adicional</td><td>8</td><td>4</td><td>7</td><td>224</td></tr>
</table>
<strong>Ações para RPN > 100:</strong> (1) Implementar limpeza com solvente + secagem forçada antes da soldagem (RPN 210); (2) Treinamento de inspetores com padrão fotográfico de defeitos (RPN 224); (3) Validação de parâmetros com peça-teste a cada início de turno (RPN 108).</div>

<h3>Passo a passo simplificado</h3>
<ol>
<li><strong>Liste as etapas do processo</strong> (use o fluxograma como base)</li>
<li><strong>Para cada etapa, identifique modos de falha:</strong> O que pode dar errado?</li>
<li><strong>Avalie efeito + causa + controle:</strong> Preencha a tabela</li>
<li><strong>Pontue S, O e D:</strong> Use escalas predefinidas (consistência é mais importante que precisão)</li>
<li><strong>Calcule RPN:</strong> Priorize os maiores</li>
<li><strong>Defina ações:</strong> Para cada RPN acima do limite, defina ação, responsável e prazo</li>
<li><strong>Recalcule:</strong> Após implementar as ações, reavalie S, O e D</li>
</ol>

<div class="template-box">
<strong>Template: FMEA de Processo Simplificado</strong>
<table>
<tr><th>Etapa</th><th>Modo de falha</th><th>Efeito</th><th>S</th><th>Causa</th><th>O</th><th>Controle atual</th><th>D</th><th>RPN</th><th>Ação recomendada</th><th>Resp.</th><th>Prazo</th></tr>
<tr><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
</div>

<div class="callout"><strong>Dica para ISO 9001:</strong> O FMEA não é obrigatório pela ISO 9001, mas é uma das formas mais robustas de atender ao requisito de "pensamento baseado em risco" (cláusula 6.1). Auditores valorizam quando a empresa usa FMEA nos processos críticos — mostra maturidade e proatividade.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de alimentos congelados de Chapeco (SC) sofria recalls frequentes por contaminação. O gerente da qualidade sempre tratava reativamente — depois que o problema chegava ao cliente. Ao implementar FMEA no processo de embalagem, identificaram 3 modos de falha com RPN acima de 200: selagem incompleta (RPN 280), contaminação cruzada por luvas furadas (RPN 240) e detector de metais descalibrado (RPN 210). As ações preventivas custaram R$ 35 mil, mas evitaram 2 recalls estimados em R$ 800 mil cada. O FMEA pagou-se 45 vezes.</p></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! O FMEA é fundamentalmente uma ferramenta PREVENTIVA — analisa falhas potenciais ANTES que ocorram." data-fb-nok="Incorreto. Diferente do Ishikawa e 5 Porquês (reativos), o FMEA analisa riscos futuros preventivamente."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a natureza fundamental do FMEA?</div><button class="qi-option" data-key="a">Preventiva — analisa falhas potenciais ANTES que ocorram</button><button class="qi-option" data-key="b">Reativa — resolve problemas que já aconteceram</button><button class="qi-option" data-key="c">Descritiva — apenas documenta o processo sem avaliar riscos</button><div class="qi-feedback"></div></div>
`}, 'Template FMEA de processo')`;

  // ── Module 4: Ferramentas de Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Melhoria', 'PDCA, A3, 5W2H e Kaizen aplicados a processos industriais', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-ciclo-pdca', 'Ciclo PDCA na prática', '15 min', 1, ${`
<h2>Ciclo PDCA na prática</h2>
<p>O ciclo PDCA (Plan-Do-Check-Act) é o <strong>motor da melhoria contínua</strong>. Criado por Walter Shewhart e popularizado por Edwards Deming, é a base da ISO 9001, do Lean Manufacturing e de praticamente toda metodologia séria de gestão.</p>

<div class="callout"><strong>Por que o PDCA é tão poderoso?</strong> Porque impede os dois erros mais comuns em melhoria: (1) agir sem planejar (apagar incêndio) e (2) planejar sem verificar se funcionou (achismo). O ciclo força disciplina: planejo, executo, verifico e ajusto.</div>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><circle cx="200" cy="100" r="80" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4"/><path d="M200,20 A80,80 0 0,1 280,100" fill="none" stroke="#2563eb" stroke-width="4"/><path d="M280,100 A80,80 0 0,1 200,180" fill="none" stroke="#16a34a" stroke-width="4"/><path d="M200,180 A80,80 0 0,1 120,100" fill="none" stroke="#eab308" stroke-width="4"/><path d="M120,100 A80,80 0 0,1 200,20" fill="none" stroke="#c5383c" stroke-width="4"/><circle cx="200" cy="100" r="30" fill="#0b1730" stroke="#fff" stroke-width="1.5"/><text x="200" y="96" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">MELHORIA</text><text x="200" y="108" text-anchor="middle" fill="#fff" font-size="8">CONTINUA</text><rect x="225" y="25" width="55" height="30" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="252" y="38" text-anchor="middle" fill="#2563eb" font-size="11" font-weight="bold">PLAN</text><text x="252" y="50" text-anchor="middle" fill="#94a3b8" font-size="7">Planejar</text><rect x="285" y="85" width="50" height="30" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="310" y="98" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="bold">DO</text><text x="310" y="110" text-anchor="middle" fill="#94a3b8" font-size="7">Executar</text><rect x="125" y="145" width="60" height="30" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="155" y="158" text-anchor="middle" fill="#eab308" font-size="11" font-weight="bold">CHECK</text><text x="155" y="170" text-anchor="middle" fill="#94a3b8" font-size="7">Verificar</text><rect x="70" y="80" width="50" height="30" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="95" y="93" text-anchor="middle" fill="#c5383c" font-size="11" font-weight="bold">ACT</text><text x="95" y="105" text-anchor="middle" fill="#94a3b8" font-size="7">Agir</text><path d="M285,48 C295,55 305,70 308,82" fill="none" stroke="#fff" stroke-width="1" marker-end="url(#arrPDCA)"/><path d="M310,118 C305,135 290,152 270,162" fill="none" stroke="#fff" stroke-width="1" marker-end="url(#arrPDCA)"/><path d="M135,170 C120,165 105,152 98,135" fill="none" stroke="#fff" stroke-width="1" marker-end="url(#arrPDCA)"/><path d="M90,78 C95,62 110,45 130,35" fill="none" stroke="#fff" stroke-width="1" marker-end="url(#arrPDCA)"/><defs><marker id="arrPDCA" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="#fff"/></marker></defs></svg><figcaption>Ciclo PDCA: Plan → Do → Check → Act — o motor da melhoria contínua</figcaption></div>

<h3>As 4 fases detalhadas</h3>

<h3>P — Plan (Planejar)</h3>
<p>A fase mais importante (e mais negligenciada). Inclui:</p>
<ul>
<li><strong>Identificar o problema/oportunidade:</strong> O que precisa melhorar? Com dados, não com opinião.</li>
<li><strong>Analisar causas:</strong> Use Ishikawa, 5 Porquês, Pareto para entender a raiz.</li>
<li><strong>Definir metas:</strong> O que queremos atingir? Em quanto tempo?</li>
<li><strong>Elaborar plano de ação:</strong> Quem faz o que, quando, como (5W2H).</li>
</ul>

<h3>D — Do (Executar)</h3>
<p>Implementar o plano. Pontos críticos:</p>
<ul>
<li>Treinar as pessoas envolvidas ANTES de implementar</li>
<li>Executar conforme planejado (não improvisar)</li>
<li>Registrar dados durante a execução (para a fase Check)</li>
<li>Se possível, testar em escala menor antes (piloto)</li>
</ul>

<h3>C — Check (Verificar)</h3>
<p>Comparar os resultados obtidos com as metas planejadas:</p>
<ul>
<li>Os indicadores melhoraram? Em que medida?</li>
<li>A meta foi atingida?</li>
<li>Houve efeitos colaterais não previstos?</li>
<li>O que funcionou e o que não funcionou?</li>
</ul>

<h3>A — Act (Agir)</h3>
<p>Duas situações possíveis:</p>
<ul>
<li><strong>Meta atingida:</strong> Padronizar o novo método (criar/atualizar procedimento), treinar todos, estender para processos similares. O novo padrão vira o "chão" do próximo ciclo.</li>
<li><strong>Meta NÃO atingida:</strong> Voltar ao P — analisar por que não funcionou, redefinir o plano, girar o ciclo novamente.</li>
</ul>

<div class="example"><strong>Exemplo completo — metalúrgica de Piracicaba (SP):</strong><br>
<strong>Plan:</strong> Refugo de estampagem em 4,8% (meta: 2,0%). Análise com Ishikawa identificou: (1) ferramenta desgastada sem controle, (2) chapa com espessura no limite superior, (3) operador ajustando pressão "no olho". Plano: implementar controle de vida útil de ferramenta, receber matéria-prima com laudo dimensional, padronizar pressão por referência de produto.<br>
<strong>Do:</strong> Implementação em 1 linha piloto durante 30 dias. Treinamento de 3 operadores.<br>
<strong>Check:</strong> Refugo na linha piloto caiu de 4,8% para 1,6% (abaixo da meta). Nas demais linhas, continuou em 4,5%.<br>
<strong>Act:</strong> Padronizar o novo método e replicar para as 4 linhas restantes. Nova IT criada. Treinamento estendido para todos os turnos. Meta do próximo ciclo: 1,0%.</div>

<h3>PDCA vs. SDCA</h3>
<p>O PDCA é para <strong>melhorar</strong> (subir o nível). O SDCA (Standardize-Do-Check-Act) é para <strong>manter</strong> (não deixar cair). Na prática:</p>
<table>
<tr><th>Ciclo</th><th>Quando usar</th><th>Foco</th></tr>
<tr><td><strong>PDCA</strong></td><td>Quando quer melhorar um resultado</td><td>Melhoria (subir a barra)</td></tr>
<tr><td><strong>SDCA</strong></td><td>Quando quer manter um resultado já conquistado</td><td>Manutenção (não deixar cair)</td></tr>
</table>

<div class="callout"><strong>O erro clássico:</strong> Girar PDCA sem nunca padronizar (SDCA). A empresa melhora, mas 3 meses depois volta ao patamar anterior porque ninguém padronizou o novo método. Melhoria sem padronização é volátil.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> PDCA sem SDCA e como subir uma escada e não fixar o degrau. Você sobe, mas escorrega de volta. Sempre padronize (SDCA) o que o PDCA conquistou antes de iniciar o próximo ciclo de melhoria.</div></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma metalúrgica de Caxias do Sul (RS) girou 3 ciclos PDCA no processo de pintura eletrostatica. No primeiro ciclo, reduziram o refugo de 6% para 3%. No segundo, de 3% para 1,8%. Mas não padronizaram — 4 meses depois, o refugo voltou a 5%. O problema? O novo método estava na cabeca do supervisor que saiu de ferias e o substituto voltou ao método antigo. Na quarta tentativa, ANTES de iniciar novo PDCA, padronizaram com IT visual e treinaram 100% da equipe (SDCA). O refugo estabilizou em 1,5% e não voltou mais.</p></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A sequência e Plan-Do-Check-Act. Plan e a fase mais importante (e mais negligenciada)." data-fb-nok="Incorreto. PDCA significa Plan (Planejar), Do (Executar), Check (Verificar), Act (Agir) — nessa ordem."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a sequência correta das 4 fases do PDCA?</div><button class="qi-option" data-key="a">Plan (Planejar), Do (Executar), Check (Verificar), Act (Agir)</button><button class="qi-option" data-key="b">Process (Processar), Define (Definir), Check (Checar), Adjust (Ajustar)</button><button class="qi-option" data-key="c">Plan (Planejar), Design (Projetar), Control (Controlar), Act (Agir)</button><div class="qi-feedback"></div></div>
`}, 'Formulário PDCA preenchível'),

  (${m4.id}, '4-2-a3-resolucao-problemas', 'A3 de resolução de problemas', '15 min', 2, ${`
<h2>A3 de resolução de problemas</h2>
<p>O <strong>Relatório A3</strong> é uma ferramenta da Toyota que resume todo o ciclo de resolução de problemas em <strong>uma única folha A3</strong> (42 x 30 cm). Não é apenas um formulário — é uma <strong>forma de pensar</strong>: sintetizar o problema, a análise, a solução e o resultado em um documento conciso que qualquer pessoa consegue entender em 5 minutos.</p>

<div class="callout"><strong>Filosofia Toyota:</strong> "Se você não consegue explicar o problema e a solução em uma folha A3, você não entendeu o problema." A restrição de espaço força clareza e foco.</div>

<h3>Estrutura do A3</h3>
<p>O A3 segue a lógica do PDCA e é dividido em dois lados:</p>

<div class="diagram"><svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="390" height="170" rx="8" fill="#0b1730" stroke="#fff" stroke-width="1.5"/><text x="200" y="22" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">RELATÓRIO A3 — [Título do problema]</text><line x1="200" y1="28" x2="200" y2="170" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4"/><line x1="5" y1="28" x2="395" y2="28" stroke="#94a3b8" stroke-width="0.5"/><text x="100" y="42" text-anchor="middle" fill="#2563eb" font-size="9" font-weight="bold">LADO ESQUERDO (PLAN)</text><rect x="12" y="48" width="182" height="25" rx="4" fill="none" stroke="#2563eb" stroke-width="1"/><text x="18" y="63" fill="#2563eb" font-size="8" font-weight="bold">1.</text><text x="28" y="63" fill="#fff" font-size="8">Contexto / Background</text><rect x="12" y="78" width="182" height="25" rx="4" fill="none" stroke="#2563eb" stroke-width="1"/><text x="18" y="93" fill="#2563eb" font-size="8" font-weight="bold">2.</text><text x="28" y="93" fill="#fff" font-size="8">Condição atual (dados, gráficos)</text><rect x="12" y="108" width="182" height="25" rx="4" fill="none" stroke="#2563eb" stroke-width="1"/><text x="18" y="123" fill="#2563eb" font-size="8" font-weight="bold">3.</text><text x="28" y="123" fill="#fff" font-size="8">Objetivo / Meta</text><rect x="12" y="138" width="182" height="28" rx="4" fill="none" stroke="#2563eb" stroke-width="1"/><text x="18" y="155" fill="#2563eb" font-size="8" font-weight="bold">4.</text><text x="28" y="155" fill="#fff" font-size="8">Análise de causa raiz</text><text x="300" y="42" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">LADO DIREITO (DO/CHECK/ACT)</text><rect x="206" y="48" width="182" height="25" rx="4" fill="none" stroke="#16a34a" stroke-width="1"/><text x="212" y="63" fill="#16a34a" font-size="8" font-weight="bold">5.</text><text x="222" y="63" fill="#fff" font-size="8">Contramedidas propostas</text><rect x="206" y="78" width="182" height="25" rx="4" fill="none" stroke="#16a34a" stroke-width="1"/><text x="212" y="93" fill="#16a34a" font-size="8" font-weight="bold">6.</text><text x="222" y="93" fill="#fff" font-size="8">Plano de implementação</text><rect x="206" y="108" width="182" height="25" rx="4" fill="none" stroke="#16a34a" stroke-width="1"/><text x="212" y="123" fill="#16a34a" font-size="8" font-weight="bold">7.</text><text x="222" y="123" fill="#fff" font-size="8">Verificação de resultados</text><rect x="206" y="138" width="182" height="28" rx="4" fill="none" stroke="#16a34a" stroke-width="1"/><text x="212" y="155" fill="#16a34a" font-size="8" font-weight="bold">8.</text><text x="222" y="155" fill="#fff" font-size="8">Padronização / Próximos passos</text></svg><figcaption>Estrutura do Relatório A3: lado esquerdo (PLAN) + lado direito (DO/CHECK/ACT) em uma folha</figcaption></div>
<table>
<tr><th colspan="2">LADO ESQUERDO (PLAN — Entender o problema)</th></tr>
<tr><td><strong>1. Contexto / Background</strong></td><td>Por que este problema importa? Qual processo? Qual impacto no negócio?</td></tr>
<tr><td><strong>2. Condição atual</strong></td><td>Dados que mostram o problema. Gráficos, números, fatos. Não opinioes.</td></tr>
<tr><td><strong>3. Objetivo / Meta</strong></td><td>O que queremos atingir? Quando? Quanto?</td></tr>
<tr><td><strong>4. Análise de causa raiz</strong></td><td>Ishikawa, 5 Porquês, Pareto — a análise que levou às causas reais.</td></tr>
<tr><th colspan="2">LADO DIREITO (DO/CHECK/ACT — Resolver e verificar)</th></tr>
<tr><td><strong>5. Contramedidas propostas</strong></td><td>O que vamos fazer para eliminar cada causa raiz? (5W2H resumido)</td></tr>
<tr><td><strong>6. Plano de implementação</strong></td><td>Cronograma com responsáveis e prazos.</td></tr>
<tr><td><strong>7. Verificação de resultados</strong></td><td>Dados que mostram se funcionou. Comparação antes vs. depois.</td></tr>
<tr><td><strong>8. Padronização e próximos passos</strong></td><td>O que padronizar? O que aprendemos? Qual o próximo desafio?</td></tr>
</table>

<div class="example"><strong>Exemplo resumido — indústria alimentícia de Uberlândia (MG):</strong><br>
<strong>1. Contexto:</strong> Linha de envase de molho de tomate — produção de 50.000 unidades/dia.<br>
<strong>2. Condição atual:</strong> Perda de embalagem por vazamento no envase: 3,2% (1.600 unidades/dia = R$ 4.800/dia de prejuízo).<br>
<strong>3. Meta:</strong> Reduzir perda para 0,5% em 60 dias.<br>
<strong>4. Análise:</strong> 5 Porquês identificou: bico dosador com vedação desgastada + temperatura do molho acima de 85 graus C no envase (especificação: 78-82 graus C), causando dilatação da embalagem.<br>
<strong>5. Contramedidas:</strong> (a) Trocar vedação do dosador a cada 500.000 ciclos (antes: sem controle); (b) Instalar sensor de temperatura antes do envase com bloqueio automático acima de 83 graus C.<br>
<strong>6. Plano:</strong> Semana 1: instalar sensor; Semana 2: definir rotina de troca de vedação; Semana 3-8: monitorar.<br>
<strong>7. Resultado:</strong> Perda caiu de 3,2% para 0,4% (abaixo da meta). Economia: R$ 4.200/dia = R$ 92.400/mês.<br>
<strong>8. Padronização:</strong> IT de manutenção preventiva do dosador atualizada. Sensor incluído no plano de calibração. Replicar para as outras 3 linhas de envase.</div>

<div class="template-box">
<strong>Template: A3 de Resolução de Problemas</strong>
<table>
<tr><td colspan="2" style="text-align:center"><strong>TÍTULO DO A3: [Descreva o problema em 1 linha]</strong></td></tr>
<tr><td style="width:50%"><strong>1. CONTEXTO</strong><br>[Por que este problema importa? 2-3 linhas]</td><td style="width:50%"><strong>5. CONTRAMEDIDAS</strong><br>[O que fazer para cada causa raiz]</td></tr>
<tr><td><strong>2. CONDIÇÃO ATUAL</strong><br>[Dados, gráficos, números que mostram o problema]</td><td><strong>6. PLANO DE IMPLEMENTAÇÃO</strong><br>[Quem, o que, quando — cronograma resumido]</td></tr>
<tr><td><strong>3. OBJETIVO / META</strong><br>[O que atingir, quando, quanto]</td><td><strong>7. VERIFICAÇÃO</strong><br>[Dados de antes vs. depois. Atingiu a meta?]</td></tr>
<tr><td><strong>4. ANÁLISE DE CAUSA RAIZ</strong><br>[Ishikawa, 5 Porquês, Pareto]</td><td><strong>8. PADRONIZAÇÃO / PRÓXIMOS PASSOS</strong><br>[O que padronizar? Próximo desafio?]</td></tr>
<tr><td colspan="2"><strong>Autor:</strong> [Nome] | <strong>Data:</strong> [DD/MM/AAAA] | <strong>Mentor/Aprovador:</strong> [Nome]</td></tr>
</table>
</div>

<div class="callout"><strong>Dica prática:</strong> O A3 funciona como ferramenta de COMUNICAÇÃO também. Use-o para apresentar melhorias a diretoria, para relatar ações corretivas em auditorias, e como registro de lições aprendidas. Um bom A3 substitui 15 slides de PowerPoint.</div>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">3,2%</div><div class="kpi-label">Perda antes (envase)</div></div><div class="kpi-card"><div class="kpi-value">0,4%</div><div class="kpi-label">Perda depois (A3)</div></div><div class="kpi-card"><div class="kpi-value">R$ 92k</div><div class="kpi-label">Economia mensal</div></div></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O A3 segue a lógica do PDCA: lado esquerdo (Plan), lado direito (Do/Check/Act)." data-fb-nok="Incorreto. O relatório A3 foi criado pela Toyota e segue a estrutura do PDCA em uma única folha."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O relatório A3 segue a lógica de qual ciclo?</div><button class="qi-option" data-key="a">DMAIC (Define, Measure, Analyze, Improve, Control)</button><button class="qi-option" data-key="b">PDCA (Plan, Do, Check, Act)</button><button class="qi-option" data-key="c">BSC (Balanced Scorecard)</button><div class="qi-feedback"></div></div>
`}, 'Template A3 preenchível'),

  (${m4.id}, '4-3-5w2h-planos-acao', '5W2H para planos de ação', '15 min', 3, ${`
<h2>5W2H para planos de ação</h2>
<p>O <strong>5W2H</strong> é a ferramenta mais objetiva para transformar uma decisão em <strong>ação concreta</strong>. Quando a análise já identificou o que precisa ser feito (via Ishikawa, 5 Porquês, PDCA), o 5W2H responde: quem faz, o que faz, quando, onde, por que, como e quanto custa.</p>

<h3>Os 7 elementos</h3>

<div class="diagram"><svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="31" y="30" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">WHAT</text><text x="31" y="45" text-anchor="middle" fill="#94a3b8" font-size="7">O que?</text><rect x="62" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="88" y="30" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">WHY</text><text x="88" y="45" text-anchor="middle" fill="#94a3b8" font-size="7">Por que?</text><rect x="119" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="145" y="30" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">WHERE</text><text x="145" y="45" text-anchor="middle" fill="#94a3b8" font-size="7">Onde?</text><rect x="176" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="202" y="30" text-anchor="middle" fill="#2563eb" font-size="10" font-weight="bold">WHEN</text><text x="202" y="45" text-anchor="middle" fill="#94a3b8" font-size="7">Quando?</text><rect x="233" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2.5"/><text x="259" y="30" text-anchor="middle" fill="#c5383c" font-size="10" font-weight="bold">WHO</text><text x="259" y="45" text-anchor="middle" fill="#c5383c" font-size="7">Quem?</text><rect x="290" y="10" width="52" height="45" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="316" y="30" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="bold">HOW</text><text x="316" y="45" text-anchor="middle" fill="#94a3b8" font-size="7">Como?</text><rect x="347" y="10" width="48" height="45" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="371" y="26" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">HOW</text><text x="371" y="38" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">MUCH</text><text x="371" y="50" text-anchor="middle" fill="#94a3b8" font-size="7">Quanto?</text><text x="140" y="78" text-anchor="middle" fill="#2563eb" font-size="9" font-weight="bold">5W</text><text x="330" y="78" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">2H</text><text x="259" y="95" text-anchor="middle" fill="#c5383c" font-size="8">WHO = NOME da pessoa, não do departamento!</text></svg><figcaption>5W2H: 5 perguntas com W + 2 perguntas com H = plano de ação completo</figcaption></div>

<table>
<tr><th>Sigla</th><th>Inglês</th><th>Português</th><th>Pergunta prática</th></tr>
<tr><td><strong>W</strong></td><td>What</td><td>O que</td><td>Qual é a ação específica a ser realizada?</td></tr>
<tr><td><strong>W</strong></td><td>Why</td><td>Por que</td><td>Qual a justificativa / qual problema resolve?</td></tr>
<tr><td><strong>W</strong></td><td>Where</td><td>Onde</td><td>Em qual local, setor, processo ou máquina?</td></tr>
<tr><td><strong>W</strong></td><td>When</td><td>Quando</td><td>Prazo de início e conclusão</td></tr>
<tr><td><strong>W</strong></td><td>Who</td><td>Quem</td><td>Responsável pela execução (nome, não setor)</td></tr>
<tr><td><strong>H</strong></td><td>How</td><td>Como</td><td>Método, procedimento, etapas para executar</td></tr>
<tr><td><strong>H</strong></td><td>How much</td><td>Quanto custa</td><td>Custo estimado, recursos necessários</td></tr>
</table>

<div class="callout"><strong>Regra de ouro:</strong> O campo "Quem" deve ter um NOME, não um departamento. "Produção" não é responsável — "Carlos Silva, supervisor do turno A" é responsável. Se não tem nome, não tem dono. Se não tem dono, não vai acontecer.</div>

<h3>Exemplo completo</h3>

<div class="example"><strong>Contexto — construtora de Florianópolis (SC):</strong><br>
Problema: Atraso médio de 22 dias na entrega de apartamentos por retrabalho em instalações hidráulicas.<br>
Causa raiz (5 Porquês): Projeto hidraulico não conferido com o elétrico antes da execução, gerando conflito de passagens na laje.<br>

<table>
<tr><th>O que</th><th>Por que</th><th>Onde</th><th>Quando</th><th>Quem</th><th>Como</th><th>Quanto</th></tr>
<tr><td>Implementar check de compatibilidade de projetos</td><td>Eliminar conflitos entre hidráulico e elétrico</td><td>Dept. de projetos</td><td>Até 15/03</td><td>Eng. Marcos Lima</td><td>Reunião de compatibilização com checklist padrão antes de liberar projeto para obra</td><td>R$ 0 (recurso interno)</td></tr>
<tr><td>Criar checklist de verificação de passagens na laje</td><td>Padronizar conferência antes da concretagem</td><td>Canteiro de obra</td><td>Até 20/03</td><td>Mestre João Pedro</td><td>Elaborar checklist com 15 itens críticos, validar com engenheiro residente</td><td>R$ 200 (impressão)</td></tr>
<tr><td>Treinar equipe de instalações no novo procedimento</td><td>Garantir que todos sigam o padrão</td><td>Sala de treinamento</td><td>Até 01/04</td><td>Coord. Ana Souza</td><td>Treinamento presencial de 2h com simulação prática e prova</td><td>R$ 1.500 (hora-homem)</td></tr>
<tr><td>Monitorar retrabalho por 90 dias</td><td>Verificar eficácia das ações</td><td>Todas as obras</td><td>01/04 a 30/06</td><td>Eng. Marcos Lima</td><td>Indicador semanal de retrabalho por obra, reporte na reunião de gestão</td><td>R$ 0 (sistema existente)</td></tr>
</table>
</div>

<h3>Boas práticas</h3>

<div class="checklist"><ul class="checklist"><li><span class="ck-box"></span>Ações específicas e verificaveis (não "melhorar a qualidade")</li><li><span class="ck-box"></span>Campo "Quem" com NOME de pessoa, não departamento</li><li><span class="ck-box"></span>Prazos realistas (capacidade da equipe + complexidade)</li><li><span class="ck-box"></span>Acompanhamento semanal definido</li><li><span class="ck-box"></span>"How much" preenchido (mesmo R$ 0 = recurso interno)</li></ul></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma construtora de Goiania (GO) fazia planos de ação em reuniões — mas 70% das ações nunca eram concluídas. O motivo? O campo "Quem" dizia "Produção" em vez de um nome. "Quando" dizia "o mais rápido possível" em vez de uma data. "Como" estava em branco. Ao adotar 5W2H rigoroso (nome da pessoa, data específica, método descrito), a taxa de conclusão subiu de 30% para 87% em 3 meses. A ferramenta não mudou — a disciplina de preenchimento mudou.</p></div>

<div class="template-box">
<strong>Template: Plano de Ação 5W2H</strong>
<table>
<tr><th>No</th><th>O que (What)</th><th>Por que (Why)</th><th>Onde (Where)</th><th>Quando (When)</th><th>Quem (Who)</th><th>Como (How)</th><th>Quanto (How much)</th><th>Status</th></tr>
<tr><td>1</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>2</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>3</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
<p><em>Status: Pendente / Em andamento / Concluído / Cancelado</em></p>
</div>

<div class="callout"><strong>Onde o 5W2H se encaixa:</strong> Ele é a "saída" natural de qualquer ferramenta de análise. Fez um Ishikawa? O 5W2H vira o plano de ação. Girou um PDCA? O "P" termina com o 5W2H. Preencheu um A3? O quadro 5 (contramedidas) é um 5W2H resumido. Fez uma análise crítica? As saídas viram 5W2H.</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O campo Who deve ter o nome da pessoa responsável, não do departamento. Se não tem nome, não tem dono." data-fb-nok="Incorreto. A regra de ouro do 5W2H: Who = nome de pessoa. Departamento não executa ação — pessoa executa."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">No 5W2H, o que deve conter o campo "Who" (Quem)?</div><button class="qi-option" data-key="a">O nome do departamento responsável</button><button class="qi-option" data-key="b">O nome da pessoa responsável pela execução</button><button class="qi-option" data-key="c">O nome do gerente geral que aprova</button><div class="qi-feedback"></div></div>
`}, 'Template 5W2H preenchível'),

  (${m4.id}, '4-4-kaizen-melhoria-rapida', 'Kaizen e eventos de melhoria rápida', '15 min', 4, ${`
<h2>Kaizen e eventos de melhoria rápida</h2>
<p><strong>Kaizen</strong> (do japonês: "mudança para melhor") é a filosofia de <strong>melhoria contínua incremental</strong>. Na prática industrial brasileira, kaizen se manifesta de duas formas: (1) como cultura diária de pequenas melhorias e (2) como <strong>eventos kaizen</strong> — projetos intensivos de melhoria rápida de 3 a 5 dias.</p>

<h3>Kaizen diário vs. Evento Kaizen</h3>
<table>
<tr><th>Aspecto</th><th>Kaizen diário</th><th>Evento Kaizen (Kaizen Blitz)</th></tr>
<tr><td><strong>Duração</strong></td><td>Contínuo</td><td>3 a 5 dias</td></tr>
<tr><td><strong>Equipe</strong></td><td>Cada pessoa, no seu posto</td><td>5-8 pessoas dedicadas ao evento</td></tr>
<tr><td><strong>Escopo</strong></td><td>Pequenas melhorias no dia a dia</td><td>Um processo específico com problema definido</td></tr>
<tr><td><strong>Exemplo</strong></td><td>Operador reorganiza ferramentas para reduzir deslocamento</td><td>Equipe multidisciplinar redesenha o layout do setor de embalagem</td></tr>
<tr><td><strong>Investimento</strong></td><td>Baixo ou zero</td><td>Médio (horas da equipe + materiais)</td></tr>
<tr><td><strong>Resultado típico</strong></td><td>Ganhos incrementais acumulados</td><td>Redução de 30-50% em tempo/custo/espaço</td></tr>
</table>

<div class="callout"><strong>Filosofia:</strong> "Melhor do que ontem" — todos os dias. Kaizen não é sobre grandes projetos; é sobre centenas de pequenas melhorias feitas por todas as pessoas da organização. Um evento kaizen de 5 dias pode resolver um problema específico, mas a cultura kaizen é o que sustenta a melhoria ao longo dos anos.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Melhoria por projeto grande</h4><ul><li>Investimento alto e arriscado</li><li>Meses de planejamento</li><li>Depende de aprovação da diretoria</li><li>Resultado demorado e incerto</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Kaizen (melhoria contínua)</h4><ul><li>Pequenas melhorias de baixo custo</li><li>Implementação rápida (dias, não meses)</li><li>Participação de todos os níveis</li><li>Resultado acumulado e sustentável</li></ul></div></div>

<h3>Estrutura de um evento Kaizen (5 dias)</h3>

<h3>Dia 1 — Preparação e diagnóstico</h3>
<ul>
<li>Definir escopo, meta e equipe</li>
<li>Treinar a equipe nos conceitos e ferramentas</li>
<li>Ir ao gemba (local real do processo) e observar</li>
<li>Mapear o processo atual (fluxograma, cronometragem, medidas)</li>
</ul>

<h3>Dia 2 — Análise</h3>
<ul>
<li>Identificar desperdícios (os 7 desperdícios do Lean)</li>
<li>Medir tempos, distâncias, estoques intermediários</li>
<li>Analisar causas dos desperdícios (Ishikawa, 5 Porquês)</li>
<li>Brainstorming de soluções</li>
</ul>

<h3>Dia 3 — Projeto e teste</h3>
<ul>
<li>Desenhar o novo processo (estado futuro)</li>
<li>Simular/testar as mudanças em escala piloto</li>
<li>Ajustar conforme necessário</li>
</ul>

<h3>Dia 4 — Implementação</h3>
<ul>
<li>Implementar as mudanças físicas (layout, ferramentas, quadros)</li>
<li>Criar/atualizar instruções de trabalho</li>
<li>Treinar os operadores do processo</li>
</ul>

<h3>Dia 5 — Padronização e apresentação</h3>
<ul>
<li>Medir os resultados (antes vs. depois)</li>
<li>Padronizar o novo processo</li>
<li>Apresentar os resultados para a diretoria</li>
<li>Definir plano de sustentação (SDCA)</li>
</ul>

<div class="example"><strong>Exemplo — cooperativa agrícola de Passo Fundo (RS):</strong><br>
<strong>Problema:</strong> Processo de preparo de sementes para distribuição levava 12 horas (turno e meio), gerando horas extras e atraso na safra.<br>
<strong>Evento Kaizen (5 dias):</strong> Equipe de 6 pessoas (2 operadores, 1 mecânico, 1 supervisor, 1 qualidade, 1 logística).<br>
<strong>Ações implementadas:</strong>
<ul>
<li>Reorganização do layout (redução de 60% no deslocamento)</li>
<li>Kit pré-montado de embalagens (eliminação de espera)</li>
<li>Troca rápida de setup entre variedades de sementes (SMED simplificado)</li>
<li>Quadro de gestão visual com meta diária</li>
</ul>
<strong>Resultado:</strong> Tempo caiu de 12h para 7h (redução de 42%). Eliminação de horas extras. Meta de preparação diária atingida em turno normal. ROI do evento em 3 semanas.</div>

<h3>Sistema de sugestões Kaizen</h3>
<p>Para sustentar a cultura de melhoria diária, implemente um <strong>sistema de sugestões</strong>:</p>
<ol>
<li><strong>Quadro de sugestões:</strong> Local visível onde qualquer pessoa pode registrar uma ideia de melhoria</li>
<li><strong>Avaliação rápida:</strong> Supervisor avalia em até 48h — não deixe sugestões sem resposta</li>
<li><strong>Implementação rápida:</strong> Se aprovada, implemente em no máximo 30 dias</li>
<li><strong>Reconhecimento:</strong> Valorize quem sugere (quadro de honra, menção em reunião, prêmio simbólico)</li>
</ol>

<div class="callout"><strong>Dado real:</strong> A Toyota recebe em média 70 sugestões por funcionário por ano (e implementa mais de 90%). Empresas brasileiras bem estruturadas atingem 5-10 sugestões por funcionário por ano. Comece com a meta de 1 por pessoa por trimestre e evolua.</div>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">-42%</div><div class="kpi-label">Redução de tempo (caso Passo Fundo)</div></div><div class="kpi-card"><div class="kpi-value">5 dias</div><div class="kpi-label">Duração evento Kaizen</div></div><div class="kpi-card"><div class="kpi-value">70/ano</div><div class="kpi-label">Sugestões/func. Toyota</div></div></div>

<div class="diagram"><svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg"><text x="200" y="15" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Evento Kaizen — 5 dias</text><rect x="10" y="25" width="70" height="80" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="45" y="42" text-anchor="middle" fill="#2563eb" font-size="9" font-weight="bold">DIA 1</text><text x="45" y="58" text-anchor="middle" fill="#fff" font-size="7">Diagnóstico</text><text x="45" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Observar</text><text x="45" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Mapear</text><text x="45" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">Medir</text><rect x="88" y="25" width="70" height="80" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="123" y="42" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">DIA 2</text><text x="123" y="58" text-anchor="middle" fill="#fff" font-size="7">Análise</text><text x="123" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Desperdicios</text><text x="123" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Causas</text><text x="123" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">Brainstorm</text><rect x="166" y="25" width="70" height="80" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="201" y="42" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">DIA 3</text><text x="201" y="58" text-anchor="middle" fill="#fff" font-size="7">Projeto</text><text x="201" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Desenhar</text><text x="201" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Simular</text><text x="201" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">Ajustar</text><rect x="244" y="25" width="70" height="80" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="279" y="42" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">DIA 4</text><text x="279" y="58" text-anchor="middle" fill="#fff" font-size="7">Implementar</text><text x="279" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Mudar layout</text><text x="279" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Criar ITs</text><text x="279" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">Treinar</text><rect x="322" y="25" width="70" height="80" rx="6" fill="#0b1730" stroke="#fff" stroke-width="2"/><text x="357" y="42" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">DIA 5</text><text x="357" y="58" text-anchor="middle" fill="#fff" font-size="7">Padronizar</text><text x="357" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Medir result.</text><text x="357" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Apresentar</text><text x="357" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">SDCA</text></svg><figcaption>Estrutura de 5 dias do evento Kaizen: do diagnóstico a padronização</figcaption></div>

<div class="template-box">
<strong>Template: Ficha de Sugestão Kaizen</strong>
<table>
<tr><td><strong>Nome:</strong></td><td>[Nome do colaborador]</td></tr>
<tr><td><strong>Setor:</strong></td><td>[Departamento / processo]</td></tr>
<tr><td><strong>Situação atual:</strong></td><td>[Descreva o problema ou desperdício em 2-3 linhas]</td></tr>
<tr><td><strong>Melhoria proposta:</strong></td><td>[Descreva sua sugestão em 2-3 linhas]</td></tr>
<tr><td><strong>Benefício esperado:</strong></td><td>[Redução de tempo, custo, risco, etc.]</td></tr>
<tr><td><strong>Avaliação (supervisor):</strong></td><td>Aprovada / Reprovada (justificativa) / Em análise</td></tr>
<tr><td><strong>Data de implementação:</strong></td><td>[Previsão]</td></tr>
</table>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Kaizen diário são pequenas melhorias continuas no dia a dia. Evento Kaizen é um projeto intensivo de 3-5 dias focado num processo específico." data-fb-nok="Incorreto. A diferença está na duração e intensidade: kaizen diário e continuo; evento kaizen é um blitz de 3-5 dias."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a diferença entre kaizen diário e evento Kaizen?</div><button class="qi-option" data-key="a">Kaizen diário custa mais que evento Kaizen</button><button class="qi-option" data-key="b">Não há diferença — são a mesma coisa</button><button class="qi-option" data-key="c">Kaizen diário são pequenas melhorias continuas; evento Kaizen e intensivo de 3-5 dias num processo específico</button><div class="qi-feedback"></div></div>
`}, 'Roteiro de evento Kaizen')`;

  // ── Module 5: Integração e Sustentabilidade ──
  const [m5] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Integração e Sustentabilidade', 'Procedimentos, controle de documentos, cultura de melhoria e plano de ação final', 5) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m5.id}, '5-1-procedimentos-instrucoes', 'Procedimentos e instruções de trabalho', '15 min', 1, ${`
<h2>Procedimentos e instruções de trabalho</h2>
<p>Todo o trabalho de mapeamento, indicadores e melhoria só se sustenta se for <strong>documentado em procedimentos e instruções de trabalho</strong>. Sem padronização escrita, o conhecimento fica na cabeça das pessoas — e sai pela porta quando elas saem.</p>

<h3>Procedimento vs. instrução de trabalho</h3>
<table>
<tr><th>Aspecto</th><th>Procedimento</th><th>Instrução de trabalho (IT)</th></tr>
<tr><td><strong>Nível</strong></td><td>O QUE fazer e QUEM faz</td><td>COMO fazer, passo a passo</td></tr>
<tr><td><strong>Detalhe</strong></td><td>Visão geral do fluxo</td><td>Detalhamento operacional</td></tr>
<tr><td><strong>Público</strong></td><td>Gestores, auditores, envolvidos no processo</td><td>Operadores que executam a tarefa</td></tr>
<tr><td><strong>Exemplo</strong></td><td>"Procedimento de compras — define etapas de requisição a recebimento"</td><td>"IT de inspeção de recebimento — como inspecionar parafusos M10 com torquímetro"</td></tr>
</table>

<div class="callout"><strong>ISO 9001:2015 e documentação:</strong> A norma não obriga nenhum procedimento específico. Usa o termo "informação documentada" e deixa a empresa decidir o que documentar. A regra prática: documente tudo que, se feito errado, gera impacto no cliente ou risco para o negócio.</div>

<div class="diagram"><svg viewBox="0 0 400 140" xmlns="http://www.w3.org/2000/svg"><rect x="50" y="10" width="300" height="120" rx="10" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="30" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Hierarquia documental</text><polygon points="200,42 280,65 120,65" fill="none" stroke="#c5383c" stroke-width="1.5"/><text x="200" y="60" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">Política</text><rect x="130" y="70" width="140" height="18" rx="3" fill="none" stroke="#eab308" stroke-width="1.5"/><text x="200" y="83" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">Procedimentos (O QUE + QUEM)</text><rect x="105" y="93" width="190" height="18" rx="3" fill="none" stroke="#16a34a" stroke-width="1.5"/><text x="200" y="106" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">Instruções de trabalho (COMO, passo a passo)</text><rect x="80" y="116" width="240" height="10" rx="3" fill="none" stroke="#94a3b8" stroke-width="1"/><text x="200" y="124" text-anchor="middle" fill="#94a3b8" font-size="7">Registros / Formulários (evidências)</text></svg><figcaption>Hierarquia: Política → Procedimentos → Instruções de trabalho → Registros</figcaption></div>

<h3>Estrutura de um procedimento</h3>
<ol>
<li><strong>Cabeçalho:</strong> Título, código, versão, data, aprovador</li>
<li><strong>Objetivo:</strong> Para que serve este procedimento (1-2 linhas)</li>
<li><strong>Escopo:</strong> A que processos/setores se aplica</li>
<li><strong>Responsabilidades:</strong> Quem faz o que</li>
<li><strong>Descrição do processo:</strong> Etapas, decisões, fluxograma</li>
<li><strong>Registros gerados:</strong> Quais formulários/registros são produzidos</li>
<li><strong>Documentos de referência:</strong> Normas, ITs, outros procedimentos relacionados</li>
</ol>

<h3>Estrutura de uma instrução de trabalho</h3>
<ol>
<li><strong>Cabeçalho:</strong> Título, código, versão, data</li>
<li><strong>Materiais necessários:</strong> Ferramentas, EPIs, insumos</li>
<li><strong>Passo a passo:</strong> Ações numeradas com fotos ou ilustrações</li>
<li><strong>Pontos críticos:</strong> O que NÃO pode acontecer (erros comuns)</li>
<li><strong>Critérios de aceitação:</strong> Como saber se fez certo</li>
</ol>

<div class="example"><strong>Exemplo — metalúrgica de Novo Hamburgo (RS):</strong><br>
A empresa criou ITs visuais para o setor de soldagem. Cada IT tem no máximo 1 página, com:<br>
- 4 fotos do processo (passo a passo visual)<br>
- 2 fotos de "certo vs. errado" (padrão visual de aceitação)<br>
- Parâmetros críticos em destaque (corrente, tensão, velocidade de arame)<br>
- QR code que leva ao vídeo de demonstração<br>
Resultado: tempo de treinamento de novos soldadores caiu de 15 para 5 dias. Refugo no primeiro mês de operador novo caiu de 8% para 2%.</div>

<div class="template-box">
<strong>Template: Instrução de Trabalho Simplificada</strong>
<table>
<tr><td colspan="2" style="text-align:center"><strong>INSTRUÇÃO DE TRABALHO</strong></td></tr>
<tr><td><strong>Código:</strong> IT-[setor]-[número]</td><td><strong>Versão:</strong> [01]</td></tr>
<tr><td><strong>Título:</strong> [Nome da tarefa]</td><td><strong>Data:</strong> [DD/MM/AAAA]</td></tr>
<tr><td colspan="2"><strong>Materiais / EPIs:</strong> [Liste tudo que precisa antes de começar]</td></tr>
<tr><td colspan="2"><strong>Passo a passo:</strong><br>1. [Ação + foto/ilustração]<br>2. [Ação + foto/ilustração]<br>3. [Ação + foto/ilustração]<br>4. [Ação + foto/ilustração]</td></tr>
<tr><td colspan="2"><strong>Pontos críticos (ATENÇÃO):</strong><br>- [O que não pode errar]<br>- [Erro comum a evitar]</td></tr>
<tr><td colspan="2"><strong>Critério de aceitação:</strong> [Como saber se está OK]</td></tr>
<tr><td><strong>Elaborado por:</strong></td><td><strong>Aprovado por:</strong></td></tr>
</table>
</div>

<h3>Boas práticas</h3>

<div class="checklist"><ul class="checklist"><li><span class="ck-box"></span>Menos texto, mais visual (fotos, diagramas, tabelas)</li><li><span class="ck-box"></span>Linguagem simples (para quem USA, não para o auditor)</li><li><span class="ck-box"></span>Mantido atualizado (desatualizado é pior que não ter)</li><li><span class="ck-box"></span>Elaborado COM quem faz (operador sabe detalhes que engenheiro não sabe)</li><li><span class="ck-box"></span>Máximo 1 página por IT (se possível)</li></ul></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma indústria de componentes eletrônicos de Manaus (AM) tinha 150 instruções de trabalho — todas com 5-8 páginas de texto corrido. Ninguém lia. O índice de não-conformidade por "procedimento não seguido" era de 12%. Ao reformular para ITs visuais (1 página, 4 fotos, parametros em destaque, QR code para vídeo), o índice caiu para 2% em 4 meses. O segredo: a IT precisa ser tao fácil de seguir que o operador QUER consultar.</p></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Procedimento define O QUE fazer e QUEM faz. Instrução de trabalho detalha COMO fazer, passo a passo." data-fb-nok="Incorreto. A diferença e de nível: procedimento = visão geral (o que/quem), IT = detalhe operacional (como)."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a principal diferença entre procedimento e instrução de trabalho?</div><button class="qi-option" data-key="a">Procedimento diz O QUE fazer e QUEM; IT detalha COMO fazer passo a passo</button><button class="qi-option" data-key="b">Não há diferença prática entre os dois</button><button class="qi-option" data-key="c">IT e para gestores; procedimento e para operadores</button><div class="qi-feedback"></div></div>
`}, 'Template de instrução de trabalho'),

  (${m5.id}, '5-2-controle-documentos-registros', 'Controle de documentos e registros', '12 min', 2, ${`
<h2>Controle de documentos e registros</h2>
<p>De nada adianta ter procedimentos e instruções de trabalho excelentes se você <strong>não controla versões, distribuição e acesso</strong>. O controle de documentos garante que as pessoas certas usem a versão certa no momento certo.</p>

<div class="callout"><strong>ISO 9001:2015 (cláusula 7.5):</strong> A norma usa o termo "informação documentada" e exige que a organização controle: (a) distribuição, acesso, recuperação e uso; (b) armazenamento e preservação; (c) controle de alterações; (d) retenção e disposição.</div>

<h3>Documento vs. registro</h3>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Sem controle</h4><ul><li>Documentos obsoletos em uso</li><li>Versões diferentes circulando</li><li>Registros ilegíveis ou perdidos</li><li>Ninguém sabe qual é a versão atual</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Com controle</h4><ul><li>Lista mestra centralizada e atualizada</li><li>Versão única e vigente acessível</li><li>Registros preservados e rastreáveis</li><li>Alterações controladas e aprovadas</li></ul></div></div>

<table>
<tr><th>Aspecto</th><th>Documento</th><th>Registro</th></tr>
<tr><td><strong>O que é</strong></td><td>Define como fazer (regra)</td><td>Prova de que foi feito (evidência)</td></tr>
<tr><td><strong>Muda?</strong></td><td>Sim, é atualizado com novas versões</td><td>Não — uma vez gerado, não pode ser alterado</td></tr>
<tr><td><strong>Exemplos</strong></td><td>Procedimento, IT, política, manual</td><td>Registro de inspeção, ata, certificado de calibração</td></tr>
<tr><td><strong>Controle</strong></td><td>Versão, aprovação, distribuição</td><td>Retenção (quanto tempo guardar), legibilidade</td></tr>
</table>

<h3>Sistema de controle de documentos</h3>
<p>O controle não exige software caro. Precisa ter:</p>

<h3>1. Codificação padrão</h3>

<div class="diagram"><svg viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="10" width="380" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="28" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Exemplo de codificação: PR-PRD-005</text><rect x="50" y="38" width="60" height="24" rx="4" fill="none" stroke="#c5383c" stroke-width="1.5"/><text x="80" y="54" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">PR</text><text x="80" y="68" text-anchor="middle" fill="#94a3b8" font-size="7">Tipo (Proced.)</text><text x="122" y="54" text-anchor="middle" fill="#eab308" font-size="12">-</text><rect x="135" y="38" width="70" height="24" rx="4" fill="none" stroke="#eab308" stroke-width="1.5"/><text x="170" y="54" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">PRD</text><text x="170" y="68" text-anchor="middle" fill="#94a3b8" font-size="7">Setor (Produção)</text><text x="218" y="54" text-anchor="middle" fill="#eab308" font-size="12">-</text><rect x="228" y="38" width="60" height="24" rx="4" fill="none" stroke="#16a34a" stroke-width="1.5"/><text x="258" y="54" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">005</text><text x="258" y="68" text-anchor="middle" fill="#94a3b8" font-size="7">Sequencial</text></svg><figcaption>Lógica de codificação: Tipo + Setor + Número sequencial</figcaption></div>

<p>Crie uma lógica de código única:</p>
<ul>
<li><strong>Tipo:</strong> PR (procedimento), IT (instrução), FR (formulário), PL (política)</li>
<li><strong>Setor:</strong> PRD (produção), QLD (qualidade), ADM (administrativo)</li>
<li><strong>Número sequencial:</strong> 001, 002, 003...</li>
<li><strong>Exemplo:</strong> PR-PRD-005 = Procedimento de produção número 5</li>
</ul>

<h3>2. Controle de versão</h3>
<table>
<tr><th>Versão</th><th>Data</th><th>Descrição da alteração</th><th>Aprovado por</th></tr>
<tr><td>01</td><td>15/01/2025</td><td>Emissão inicial</td><td>Gerente da qualidade</td></tr>
<tr><td>02</td><td>10/06/2025</td><td>Incluído controle de temperatura na etapa 3</td><td>Gerente da qualidade</td></tr>
</table>

<h3>3. Lista mestra de documentos</h3>
<p>Um único local (planilha ou sistema) que lista TODOS os documentos do SGQ:</p>

<div class="template-box">
<strong>Template: Lista Mestra de Documentos</strong>
<table>
<tr><th>Código</th><th>Título</th><th>Versão</th><th>Data</th><th>Responsável</th><th>Local de guarda</th><th>Distribuição</th></tr>
<tr><td>PR-QLD-001</td><td>Controle de documentos</td><td>03</td><td>10/03/2025</td><td>Coord. Qualidade</td><td>Pasta compartilhada</td><td>Todos os setores</td></tr>
<tr><td>IT-PRD-012</td><td>Operação do torno CNC</td><td>02</td><td>22/05/2025</td><td>Sup. Produção</td><td>Pasta compartilhada + posto</td><td>Produção</td></tr>
</table>
</div>

<h3>Tempo de retenção de registros</h3>
<p>Registros devem ser mantidos por tempo definido. Alguns exemplos:</p>
<table>
<tr><th>Tipo de registro</th><th>Tempo mínimo sugerido</th><th>Base</th></tr>
<tr><td>Registros de treinamento</td><td>Duração do vínculo + 5 anos</td><td>Legislação trabalhista</td></tr>
<tr><td>Registros de inspeção de produto</td><td>3 anos (ou vida útil do produto)</td><td>Prática ISO 9001</td></tr>
<tr><td>Registros de calibração</td><td>2 ciclos de calibração</td><td>Prática metrológica</td></tr>
<tr><td>Atas de análise crítica</td><td>Ciclo de certificação (3 anos)</td><td>Prática de auditoria</td></tr>
<tr><td>Registros de auditoria interna</td><td>3 anos</td><td>Prática ISO 9001</td></tr>
</table>

<div class="example"><strong>Exemplo — indústria alimentícia de Chapecó (SC):</strong> A empresa migrou de pastas físicas (com 1.200 documentos impressos) para um sistema digital simples (Google Drive estruturado com permissões). Resultado: tempo de busca de documento caiu de 15 minutos para 30 segundos. Custo de impressão reduziu R$ 2.400/ano. Zero não-conformidades por documento obsoleto nas últimas 2 auditorias.</div>

<div class="callout"><strong>Dica prática para PMEs:</strong> Você não precisa de software de gestão documental caro. Uma estrutura de pastas no Google Drive ou SharePoint, com convenção de nome (código-título-versão) e uma planilha como lista mestra, atende perfeitamente a ISO 9001. O que importa é a DISCIPLINA do controle, não a ferramenta.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma fabrica de cosmeticos de Recife (PE) gastava R$ 8.000/mes com impressão de documentos e tinha 3 armários de aço cheios de pastas físicas. Ao migrar para Google Drive estruturado com permissões (custo: R$ 0), a busca de documento caiu de 12 minutos para 20 segundos. Na auditoria seguinte, zero não-conformidades por documento obsoleto — algo que antes gerava 4-5 apontamentos por auditoria. A chave foi criar uma planilha de lista mestra e treinar todos para usar a pasta "VIGENTE" e nunca editar o original.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A ISO 9001:2015 usa o termo único 'informação documentada' em substituição a 'documentos' e 'registros' da versão anterior." data-fb-nok="Incorreto. A versão 2015 unificou os termos para simplificar. O conceito importante e que documentos MUDAM (versões) e registros NÃO MUDAM (evidência)."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Na ISO 9001:2015, qual termo substitui "documentos" e "registros"?</div><button class="qi-option" data-key="a">Manual da qualidade</button><button class="qi-option" data-key="b">Informação documentada</button><button class="qi-option" data-key="c">Procedimento operacional padrão</button><div class="qi-feedback"></div></div>
`}, 'Lista mestra de documentos modelo'),

  (${m5.id}, '5-3-melhoria-continua-cultura', 'Melhoria contínua como cultura', '15 min', 3, ${`
<h2>Melhoria contínua como cultura</h2>
<p>Ferramentas como PDCA, Ishikawa e 5W2H são poderosas, mas sem <strong>cultura de melhoria</strong>, elas viram formulários que ninguém preenche. A diferença entre empresas que melhoram de verdade e empresas que apenas "fazem de conta" está na cultura — nos hábitos, valores e comportamentos do dia a dia.</p>

<div class="callout"><strong>Cláusula 10.3 da ISO 9001:</strong> "A organização deve melhorar continuamente a adequação, suficiência e eficácia do sistema de gestão da qualidade." Não é opcional — é requisito. Mas a norma não diz COMO criar a cultura. Isso é trabalho de liderança.</div>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><text x="200" y="15" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Os 5 pilares da cultura de melhoria contínua</text><rect x="10" y="25" width="70" height="90" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="45" y="50" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">LIDERANÇA</text><text x="45" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">Exemplo</text><text x="45" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">vem do</text><text x="45" y="89" text-anchor="middle" fill="#94a3b8" font-size="7">topo</text><rect x="88" y="25" width="70" height="90" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="123" y="45" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">SEGURANÇA</text><text x="123" y="57" text-anchor="middle" fill="#eab308" font-size="7">PSICOL.</text><text x="123" y="72" text-anchor="middle" fill="#94a3b8" font-size="7">Sem medo</text><text x="123" y="84" text-anchor="middle" fill="#94a3b8" font-size="7">de reportar</text><text x="123" y="96" text-anchor="middle" fill="#94a3b8" font-size="7">problemas</text><rect x="166" y="25" width="70" height="90" rx="8" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="201" y="45" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">GESTAO</text><text x="201" y="57" text-anchor="middle" fill="#16a34a" font-size="7">VISUAL</text><text x="201" y="72" text-anchor="middle" fill="#94a3b8" font-size="7">Indicadores</text><text x="201" y="84" text-anchor="middle" fill="#94a3b8" font-size="7">visíveis</text><text x="201" y="96" text-anchor="middle" fill="#94a3b8" font-size="7">para todos</text><rect x="244" y="25" width="70" height="90" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="279" y="50" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">ROTINA</text><text x="279" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">Reuniões</text><text x="279" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">estrutur.</text><text x="279" y="89" text-anchor="middle" fill="#94a3b8" font-size="7">diária/sem.</text><rect x="322" y="25" width="70" height="90" rx="8" fill="#0b1730" stroke="#fff" stroke-width="2"/><text x="357" y="45" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">RECONHE-</text><text x="357" y="57" text-anchor="middle" fill="#fff" font-size="7">CIMENTO</text><text x="357" y="72" text-anchor="middle" fill="#94a3b8" font-size="7">Valorizar</text><text x="357" y="84" text-anchor="middle" fill="#94a3b8" font-size="7">quem</text><text x="357" y="96" text-anchor="middle" fill="#94a3b8" font-size="7">melhora</text><rect x="10" y="130" width="382" height="60" rx="8" fill="#0b1730" stroke="#94a3b8" stroke-width="1"/><text x="200" y="148" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">Escala de maturidade</text><text x="40" y="168" text-anchor="middle" fill="#c5383c" font-size="8">Nível 1</text><text x="40" y="180" text-anchor="middle" fill="#94a3b8" font-size="7">Apaga</text><text x="40" y="188" text-anchor="middle" fill="#94a3b8" font-size="6">incendio</text><text x="120" y="168" text-anchor="middle" fill="#eab308" font-size="8">Nível 2</text><text x="120" y="180" text-anchor="middle" fill="#94a3b8" font-size="7">Reativo</text><text x="200" y="168" text-anchor="middle" fill="#16a34a" font-size="8">Nível 3</text><text x="200" y="180" text-anchor="middle" fill="#94a3b8" font-size="7">Preventivo</text><text x="280" y="168" text-anchor="middle" fill="#2563eb" font-size="8">Nível 4</text><text x="280" y="180" text-anchor="middle" fill="#94a3b8" font-size="7">Proativo</text><text x="360" y="168" text-anchor="middle" fill="#fff" font-size="8">Nível 5</text><text x="360" y="180" text-anchor="middle" fill="#94a3b8" font-size="7">Inovador</text><line x1="30" y1="160" x2="380" y2="160" stroke="#16a34a" stroke-width="2"/><circle cx="200" cy="160" r="4" fill="#16a34a"/></svg><figcaption>5 pilares + escala de maturidade: a maioria das PMEs brasileiras está entre níveis 1-2</figcaption></div>

<h3>Os 5 pilares da cultura de melhoria contínua</h3>

<h3>1. Liderança pelo exemplo</h3>
<p>Se o diretor não participa das reuniões de indicadores, não vai ao gemba, e não valoriza as sugestões de melhoria, nenhuma ferramenta vai funcionar. A cultura comeca no topo.</p>
<ul>
<li>A diretoria participa das análises criticas? (Não só assina a ata)</li>
<li>Os gestores visitam o chão de fábrica regularmente?</li>
<li>As sugestões de melhoria recebem resposta em tempo razoavel?</li>
</ul>

<h3>2. Ambiente psicologicamente seguro</h3>
<p>As pessoas só vão reportar problemas e sugerir melhorias se <strong>não forem punidas por isso</strong>. Se o operador que reporta um erro e advertido, ele aprende a esconder erros — e os problemas ficam invisiveis.</p>

<div class="example"><strong>Exemplo — metalúrgica de Canoas (RS):</strong> A empresa mudou a abordagem de tratamento de não-conformidades: em vez de "quem causou?", passou a perguntar "o que no processo permitiu que isso acontecesse?". Em 6 meses, o número de problemas reportados AUMENTOU 300% (as pessoas pararam de esconder), e o número de problemas recorrentes CAIU 60% (porque agora eram tratados de verdade).</div>

<h3>3. Gestão visual e transparência</h3>
<p>Indicadores visíveis criam consciência coletiva. Quando o quadro mostra que o refugo esta vermelho, toda a equipe sente a responsabilidade — não só o supervisor.</p>

<h3>4. Rotina estruturada</h3>
<p>Melhoria contínua precisa de <strong>espaço no calendário</strong>:</p>
<table>
<tr><th>Rotina</th><th>Frequência</th><th>Duração</th><th>Participantes</th></tr>
<tr><td>Reunião diária de produção</td><td>Diária</td><td>10-15 min</td><td>Operadores + supervisor</td></tr>
<tr><td>Análise de indicadores do processo</td><td>Semanal</td><td>30 min</td><td>Supervisor + gerente</td></tr>
<tr><td>Reunião de gestão (KPIs)</td><td>Mensal</td><td>60 min</td><td>Gerentes + diretoria</td></tr>
<tr><td>Análise crítica pela direção</td><td>Semestral</td><td>2-3 horas</td><td>Alta direção + coordenadores</td></tr>
<tr><td>Evento Kaizen</td><td>Trimestral</td><td>3-5 dias</td><td>Equipe multidisciplinar</td></tr>
</table>

<h3>5. Reconhecimento e celebração</h3>
<p>Valorize quem melhora. Não precisa ser dinheiro — reconhecimento publico, menção em reunião, quadro de honra, almoco especial com a diretoria. O importante e que as pessoas percebam que melhoria e valorizada.</p>

<h3>Maturidade da melhoria contínua</h3>
<p>A evolução da cultura segue níveis:</p>
<table>
<tr><th>Nível</th><th>Descrição</th><th>Comportamento tipico</th></tr>
<tr><td><strong>1 — Apaga incendio</strong></td><td>Só resolve quando estoura</td><td>"Conserta ai que o cliente ta reclamando"</td></tr>
<tr><td><strong>2 — Reativo</strong></td><td>Trata problemas com ferramentas</td><td>"Vamos fazer um Ishikawa pra esse defeito"</td></tr>
<tr><td><strong>3 — Preventivo</strong></td><td>Antecipa problemas com análise de risco</td><td>"O FMEA mostrou risco alto nessa etapa, vamos agir"</td></tr>
<tr><td><strong>4 — Proativo</strong></td><td>Busca melhorias mesmo sem problemas</td><td>"O processo ta OK, mas podemos reduzir o lead time"</td></tr>
<tr><td><strong>5 — Inovador</strong></td><td>Melhoria faz parte do DNA</td><td>"Cada pessoa contribui com melhorias todo mes"</td></tr>
</table>

<div class="callout"><strong>Realidade brasileira:</strong> A maioria das PMEs brasileiras está entre os níveis 1 e 2. Chegar ao nível 3 já é uma conquista significativa e atende bem a ISO 9001. O caminho do nível 1 ao 3 leva tipicamente 12-18 meses de trabalho consistente.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Ferramentas sem cultura = formulários vazios. Cultura sem ferramentas = boa intenção sem método. A melhoria contínua real precisa dos dois: ferramentas certas DENTRO de uma cultura que valoriza melhoria, tolera erros e celebra conquistas.</div></div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma indústria têxtil de Blumenau (SC) implementou todas as ferramentas do curso: SIPOC, fluxogramas, KPIs, PDCA, 5W2H. Mas em 6 meses, tudo parou. O motivo? O dono punia quem reportava problemas ("você esta reclamando demais") e não participava das reuniões de indicadores. Ao mudar a abordagem — o dono passou a ir ao chão de fabrica toda segunda-feira e a reconhecer publicamente as melhores sugestões do mes — o número de problemas reportados triplicou e o refugo caiu 40% em 4 meses. A ferramenta era a mesma; a cultura mudou.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Quando as pessoas reportam problemas voluntariamente sem medo de punição, a cultura de melhoria contínua esta viva." data-fb-nok="Incorreto. A cultura real se manifesta no comportamento diário, não em documentos ou auditorias."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual comportamento indica que a cultura de melhoria contínua esta realmente funcionando?</div><button class="qi-option" data-key="a">O SGQ e atualizado apenas antes das auditorias</button><button class="qi-option" data-key="b">Problemas são reportados voluntariamente sem medo de punição</button><button class="qi-option" data-key="c">Apenas o setor de qualidade se preocupa com melhorias</button><div class="qi-feedback"></div></div>
`}, NULL),

  (${m5.id}, '5-4-encerramento-plano-acao', 'Encerramento: montando seu plano de ação', '15 min', 4, ${`
<h2>Encerramento: montando seu plano de ação</h2>
<p>Você chegou ao final do curso. Aprendeu a mapear processos (SIPOC, fluxograma), definir indicadores (KPIs, dashboards, BSC), analisar problemas (Ishikawa, Pareto, 5 Porquês, GUT, FMEA) e implementar melhorias (PDCA, A3, 5W2H, Kaizen). Agora e hora de <strong>transformar conhecimento em ação</strong>.</p>

<div class="callout"><strong>Lembre-se:</strong> Conhecimento sem ação e entretenimento. O valor deste curso está no que você VAI FAZER a partir de amanha.</div>

<div class="diagram"><svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg"><text x="200" y="15" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Jornada do curso: de conceito a resultado</text><rect x="10" y="30" width="85" height="55" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/><text x="52" y="50" text-anchor="middle" fill="#2563eb" font-size="9" font-weight="bold">MAPEAR</text><text x="52" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">SIPOC</text><text x="52" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">Fluxograma</text><polygon points="100,57 115,50 115,64" fill="#eab308"/><rect x="120" y="30" width="85" height="55" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/><text x="162" y="50" text-anchor="middle" fill="#eab308" font-size="9" font-weight="bold">MEDIR</text><text x="162" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">KPIs, BSC</text><text x="162" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">Dashboard</text><polygon points="210,57 225,50 225,64" fill="#eab308"/><rect x="230" y="30" width="85" height="55" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/><text x="272" y="50" text-anchor="middle" fill="#c5383c" font-size="9" font-weight="bold">ANALISAR</text><text x="272" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">Ishikawa, Pareto</text><text x="272" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">GUT, FMEA</text><polygon points="320,57 335,50 335,64" fill="#eab308"/><rect x="340" y="30" width="55" height="55" rx="8" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="367" y="50" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">MELHORAR</text><text x="367" y="65" text-anchor="middle" fill="#94a3b8" font-size="7">PDCA, A3</text><text x="367" y="77" text-anchor="middle" fill="#94a3b8" font-size="7">5W2H, Kaizen</text><rect x="10" y="100" width="385" height="50" rx="8" fill="#0b1730" stroke="#16a34a" stroke-width="2"/><text x="200" y="118" text-anchor="middle" fill="#16a34a" font-size="10" font-weight="bold">SUSTENTAR: Procedimentos + Controle documental + Cultura de melhoria</text><text x="200" y="138" text-anchor="middle" fill="#94a3b8" font-size="8">A melhoria contínua não é projeto — e forma de trabalhar</text></svg><figcaption>De mapear a sustentar: a jornada completa do curso aplicada em 90 dias</figcaption></div>

<h3>Seu plano de ação pessoal — 90 dias</h3>
<p>Não tente fazer tudo de uma vez. Siga uma sequência lógica de 3 fases:</p>

<h3>Fase 1 — Semanas 1 a 4: Mapear</h3>
<div class="step-flow"><div class="step-item"><div class="step-content"><strong>Semana 1:</strong> Escolha 1 processo crítico (mais reclamação, retrabalho ou custo)</div></div><div class="step-item"><div class="step-content"><strong>Semana 2:</strong> Faca o SIPOC com a equipe que executa (não sozinho)</div></div><div class="step-item"><div class="step-content"><strong>Semana 3-4:</strong> Fluxograma AS-IS no gemba + identifique 3-5 pontos de melhoria</div></div></div>

<h3>Fase 2 — Semanas 5 a 8: Medir e analisar</h3>
<ul>
<li><strong>Defina 2-3 indicadores para o processo:</strong> Use a ficha de KPI (formula, meta, frequência, responsável)</li>
<li><strong>Comece a medir:</strong> Mesmo que manual, comece. Dados imperfeitos são melhores que nenhum dado.</li>
<li><strong>Análise o problema prioritario:</strong> Use Ishikawa + 5 Porquês para encontrar a causa raiz</li>
<li><strong>Monte o plano de ação 5W2H:</strong> Para cada causa raiz, defina ações concretas</li>
</ul>

<h3>Fase 3 — Semanas 9 a 12: Melhorar e padronizar</h3>
<ul>
<li><strong>Implemente as ações:</strong> Execute o 5W2H, acompanhe semanalmente</li>
<li><strong>Meca o resultado:</strong> Compare antes vs. depois com os indicadores definidos</li>
<li><strong>Padronize:</strong> Atualize (ou crie) o procedimento/IT do processo melhorado</li>
<li><strong>Comunique:</strong> Apresente os resultados para a equipe e a diretoria (use o formato A3)</li>
</ul>

<div class="template-box">
<strong>Template: Plano de Ação Pessoal — 90 dias</strong>
<table>
<tr><th>Fase</th><th>Ação</th><th>Prazo</th><th>Ferramenta</th><th>Entregavel</th></tr>
<tr><td>1</td><td>Selecionar processo crítico</td><td>Semana 1</td><td>Pareto / GUT</td><td>Processo escolhido com justificativa</td></tr>
<tr><td>1</td><td>Mapear SIPOC</td><td>Semana 2</td><td>SIPOC</td><td>SIPOC preenchido e validado</td></tr>
<tr><td>1</td><td>Mapear fluxograma AS-IS</td><td>Semana 3-4</td><td>Fluxograma</td><td>Fluxograma com pontos de melhoria marcados</td></tr>
<tr><td>2</td><td>Definir KPIs do processo</td><td>Semana 5</td><td>Ficha de KPI</td><td>2-3 fichas preenchidas</td></tr>
<tr><td>2</td><td>Coletar dados e analisar</td><td>Semana 6-7</td><td>Ishikawa + 5 Porquês</td><td>Diagrama Ishikawa + análise de causa raiz</td></tr>
<tr><td>2</td><td>Elaborar plano de ação</td><td>Semana 8</td><td>5W2H</td><td>Plano de ação com responsáveis e prazos</td></tr>
<tr><td>3</td><td>Implementar ações</td><td>Semana 9-10</td><td>5W2H + PDCA</td><td>Ações executadas</td></tr>
<tr><td>3</td><td>Medir resultado e padronizar</td><td>Semana 11-12</td><td>Indicadores + IT</td><td>Resultado antes vs. depois + IT atualizada</td></tr>
</table>
</div>

<div class="example"><strong>Caso real — empresa de médio porte de Campinas (SP):</strong><br>
Um aluno deste curso aplicou o plano de 90 dias no processo de "expedição de pedidos". Resultados:<br>
<ul>
<li><strong>SIPOC:</strong> Revelou que 40% dos atrasos de entrega vinham de informação incompleta do comercial</li>
<li><strong>KPI:</strong> OTIF (On Time In Full) — medição inicial: 72%</li>
<li><strong>Ishikawa + 5 Porquês:</strong> Causa raiz: pedido entrava no sistema sem especificação de embalagem, gerando retrabalho na expedição</li>
<li><strong>5W2H:</strong> Campo obrigatório de embalagem no sistema + checklist de conferencia do pedido</li>
<li><strong>Resultado após 90 dias:</strong> OTIF subiu de 72% para 94%. Custo de retrabalho na expedição caiu R$ 8.500/mes</li>
</ul></div>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">72%→94%</div><div class="kpi-label">OTIF em 90 dias</div></div><div class="kpi-card"><div class="kpi-value">-R$8.5k</div><div class="kpi-label">Retrabalho/mes</div></div><div class="kpi-card"><div class="kpi-value">90 dias</div><div class="kpi-label">Da teoria ao resultado</div></div></div>

<h3>Próximos passos após o curso</h3>
<p>Recomendamos continuar sua formação:</p>
<ul>
<li><strong>ISO 9001:2015 — Interpretação dos Requisitos</strong> — se você vai implantar ou manter um SGQ</li>
<li><strong>Auditor Interno ISO 9001:2015</strong> — se você vai auditar processos</li>
<li><strong>5S na Prática Industrial</strong> — se você quer comecar a mudança de cultura pelo básico</li>
</ul>

<div class="callout"><strong>Mensagem final:</strong> Gestão por processos não é um projeto com início, meio e fim. É uma FORMA DE TRABALHAR. O dia que você parar de olhar para os processos e indicadores, eles comecam a degradar. Faca da melhoria contínua um hábito — e os resultados virao, consistentes e sustentáveis.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Uma empresa de embalagens de São Jose dos Pinhais (PR) aplicou exatamente este plano de 90 dias. O processo escolhido: "Impressão flexografica". SIPOC revelou 6 fornecedores internos desalinhados. Fluxograma mostrou 3 pontos de espera que somavam 4 horas/dia. KPIs definidos: setup time, refugo de impressão e OTIF. Ishikawa + 5 Porquês identificaram que 65% do refugo vinha de tinta fora de viscosidade porque o operador não tinha viscosimetro. Investimento de R$ 2.800 no instrumento + IT visual. Resultado em 90 dias: refugo de impressão caiu de 7% para 1,5%, setup time reduziu 35 minutos, e a empresa economizou R$ 14.000/mes.</p></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A sequência lógica e: Mapear (SIPOC + fluxograma), Medir e analisar (KPIs + causa raiz), Melhorar e padronizar." data-fb-nok="Incorreto. A ordem importa: primeiro entenda o processo (mapeie), depois meca e análise, e só então melhore e padronize."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a sequência recomendada no plano de 90 dias?</div><button class="qi-option" data-key="a">Melhorar, depois medir, depois mapear</button><button class="qi-option" data-key="b">Medir, depois mapear, depois melhorar</button><button class="qi-option" data-key="c">Mapear, depois medir e analisar, depois melhorar e padronizar</button><div class="qi-feedback"></div></div>
`}, 'Plano de ação 90 dias preenchível')`;

  // ── QUIZ: Module quizzes + Final quiz ──

  // Module 1 quiz
  const m1q = [
    ['Qual é a definição de processo segundo a ISO 9000:2015?', ['Uma sequência de departamentos','Um conjunto de atividades inter-relacionadas que transforma entradas em saídas','Um documento que descreve uma tarefa','Uma função organizacional'], 1, 'A ISO 9000:2015 define processo como conjunto de atividades inter-relacionadas que utilizam entradas para entregar um resultado pretendido.'],
    ['Quais são os 3 tipos de processo em uma organização?', ['Primarios, secundarios e terciarios','Produtivos, administrativos e financeiros','Primarios, de apoio e gerenciais','Internos, externos e mistos'], 2, 'Os 3 tipos são: primários (geram valor para o cliente), de apoio (suportam os primários) e gerenciais (direcionam e monitoram).'],
    ['O que significa a sigla SIPOC?', ['Sistema Integrado de Produção e Controle','Supplier, Input, Process, Output, Customer','Segurança, Indicadores, Processos, Organização, Cliente','Sequência, Inspeção, Padrão, Operação, Controle'], 1, 'SIPOC é o acrônimo para Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saída), Customer (Cliente).'],
    ['Qual é a principal diferença entre o SIPOC e o fluxograma?', ['O SIPOC e mais detalhado','O fluxograma mostra a visão macro e o SIPOC o detalhe','O SIPOC mostra a visão macro (5-7 etapas) e o fluxograma detalha passo a passo','Não há diferença significativa'], 2, 'O SIPOC mostra a visão macro do processo (5-7 etapas), enquanto o fluxograma detalha cada passo, decisão e interação.'],
    ['O que é um fluxograma funcional (swimlane)?', ['Um fluxograma com cores diferentes','Um fluxograma dividido em raias por departamento ou função','Um fluxograma simplificado','Um fluxograma exclusivo para processos de RH'], 1, 'O fluxograma swimlane divide o processo em raias (lanes), cada uma representando um departamento ou função, tornando visível quem faz o que.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 2 quiz
  const m2q = [
    ['Qual é a diferença entre eficácia e eficiência?', ['São sinonimos','Eficácia e atingir o resultado; eficiência e usar bem os recursos','Eficácia e financeira; eficiência e operacional','Eficiência e mais importante que eficácia'], 1, 'Eficácia mede se o resultado foi atingido. Eficiência mede se os recursos foram bem utilizados.'],
    ['O que é um indicador de tendência (leading)?', ['Um indicador que mede resultados passados','Um indicador que mede fatores que influenciam resultados futuros','Um indicador financeiro','Um indicador de satisfação do cliente'], 1, 'Indicadores leading medem fatores que influenciam o resultado futuro, permitindo agir antes que o problema apareca.'],
    ['Quantos elementos essenciais deve ter um KPI bem definido?', ['3','5','7','10'], 2, 'Um KPI precisa de 7 elementos: nome, formula, unidade, frequência, meta, fonte de dados e responsável.'],
    ['Qual é a principal função de um dashboard operacional?', ['Impressionar a diretoria com gráficos bonitos','Mostrar indicadores de forma visual para facilitar tomada de decisão rápida','Substituir reuniões de gestão','Atender requisito de auditoria ISO'], 1, 'O dashboard operacional torna indicadores visíveis para que operadores e supervisores tomem decisões rápidas.'],
    ['O BSC (Balanced Scorecard) tem quantas perspectivas?', ['2','3','4','6'], 2, 'O BSC tem 4 perspectivas: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 3 quiz
  const m3q = [
    ['O diagrama de Ishikawa também e conhecido como:', ['Diagrama de Pareto','Diagrama de dispersão','Espinha de peixe ou causa e efeito','Gráfico de controle'], 2, 'O diagrama de Ishikawa também e chamado de espinha de peixe (pela forma) ou diagrama de causa e efeito (pela função).'],
    ['Quais são as 6 categorias classicas (6M) do Ishikawa?', ['Marketing, Mercado, Margem, Marca, Meta, Missão','Máquina, Método, Mão de obra, Material, Meio ambiente, Medição','Manual, Modelo, Matriz, Mapa, Meta, Monitoramento','Manutenção, Material, Mão de obra, Mercado, Método, Margem'], 1, 'Os 6M são: Máquina, Método, Mão de obra, Material, Meio ambiente e Medição.'],
    ['O princípio de Pareto afirma que:', ['Todos os problemas tem o mesmo peso','100% dos problemas vem de 100% das causas','Aproximadamente 80% dos problemas vem de 20% das causas','50% dos problemas vem de 50% das causas'], 2, 'O princípio 80/20 de Pareto indica que cerca de 80% dos problemas são causados por 20% das causas.'],
    ['Na Matriz GUT, a letra T significa:', ['Tempo','Tarefa','Tendência','Tolerância'], 2, 'T significa Tendência — avalia se o problema vai piorar com o tempo caso não seja tratado.'],
    ['O que o RPN (Risk Priority Number) do FMEA calcula?', ['Custo do risco','Severidade x Ocorrência x Detecção','Gravidade x Urgência x Tendência','Probabilidade x Impacto'], 1, 'O RPN e o produto de Severidade (S) x Ocorrência (O) x Detecção (D), usado para priorizar riscos no FMEA.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 4 quiz
  const m4q = [
    ['Qual é a sequência correta das 4 fases do PDCA?', ['Plan, Do, Control, Act','Plan, Do, Check, Act','Process, Define, Check, Adjust','Plan, Design, Check, Approve'], 1, 'PDCA significa Plan (Planejar), Do (Executar), Check (Verificar), Act (Agir).'],
    ['O relatório A3 recebe esse nome porque:', ['Tem 3 seções de análise','Usa uma folha no formato A3 para resumir todo o ciclo de resolução','Foi criado na planta A3 da Toyota','Tem 3 páginas obrigatórias'], 1, 'O A3 recebe esse nome porque resume todo o ciclo de resolução de problemas em uma única folha no formato A3 (42x30cm).'],
    ['No 5W2H, o campo "Who" deve conter:', ['O nome do departamento responsável','O nome da pessoa responsável pela execução','O nome do gerente geral','O nome do auditor'], 1, 'O campo Who deve conter o nome da pessoa responsável, não do departamento. Se não tem nome, não tem dono.'],
    ['Qual a diferença entre PDCA e SDCA?', ['SDCA e a versão digital do PDCA','PDCA melhora; SDCA mantém o padrão já conquistado','SDCA e usado apenas em serviços','Não há diferença'], 1, 'PDCA e para melhorar (subir o nível). SDCA (Standardize-Do-Check-Act) e para manter (não deixar cair o padrão conquistado).'],
    ['Um evento Kaizen tipicamente dura:', ['1 dia','3 a 5 dias','2 semanas','1 mes'], 1, 'Um evento Kaizen (Kaizen Blitz) tipicamente dura de 3 a 5 dias com uma equipe dedicada.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 5 quiz
  const m5q = [
    ['Qual é a principal diferença entre procedimento e instrução de trabalho?', ['O procedimento e mais curto','O procedimento diz O QUE fazer; a instrução de trabalho detalha COMO fazer','A instrução de trabalho e para gestores e o procedimento para operadores','Não há diferença prática'], 1, 'O procedimento define o que fazer e quem faz (visão geral). A instrução de trabalho detalha como fazer, passo a passo (nível operacional).'],
    ['Na ISO 9001:2015, o termo usado para documentos e registros e:', ['Manual da qualidade','Procedimento operacional padrão','Informação documentada','Arquivo de gestão'], 2, 'A ISO 9001:2015 usa o termo único "informação documentada" em substituição a "documentos" e "registros" da versão anterior.'],
    ['Qual comportamento indica que a cultura de melhoria contínua esta viva?', ['O SGQ só e atualizado antes de auditorias','Problemas são reportados voluntariamente sem medo de punição','Apenas o setor de qualidade se preocupa com melhorias','Os indicadores são medidos mas não discutidos'], 1, 'Quando as pessoas reportam problemas voluntariamente e sem medo de punição, a cultura de melhoria contínua está funcionando.'],
    ['Qual é a sequência recomendada no plano de 90 dias do curso?', ['Melhorar, medir, mapear','Medir, mapear, melhorar','Mapear, medir e analisar, melhorar e padronizar','Padronizar, medir, melhorar'], 2, 'A sequência lógica e: Fase 1 - Mapear (SIPOC e fluxograma), Fase 2 - Medir e analisar (KPIs e causa raiz), Fase 3 - Melhorar e padronizar.'],
    ['Qual a principal função da lista mestra de documentos?', ['Substituir os documentos originais','Listar todos os documentos do SGQ com versão, responsável e local de guarda','Servir como backup dos documentos','Atender exclusivamente a auditoria externa'], 1, 'A lista mestra e o índice centralizado que lista todos os documentos do SGQ com código, versão, data, responsável e local de guarda.'],
  ];
  for (const [p, a, r, e] of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m5.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (25 questions) ──
  const finalQ = [
    ['A ISO 9000:2015 define processo como:', ['Um departamento funcional','Um conjunto de atividades inter-relacionadas que transforma entradas em saídas','Uma norma de certificação','Um indicador de desempenho'], 1, 'Processo é um conjunto de atividades inter-relacionadas que utilizam entradas para entregar um resultado pretendido.'],
    ['Os processos de apoio (suporte) tem como função:', ['Gerar valor direto para o cliente externo','Suportar os processos primários','Substituir os processos gerenciais','Auditar os processos produtivos'], 1, 'Processos de apoio suportam os processos primários, como RH, TI, compras e manutenção.'],
    ['A cláusula 4.4 da ISO 9001:2015 exige que a organização:', ['Tenha um manual da qualidade','Determine os processos necessários para o SGQ e gerencie suas interações','Contrate consultoria de processos','Implemente software de BPM'], 1, 'A cláusula 4.4 exige determinar os processos, suas entradas, saídas, sequência, interação, critérios e recursos.'],
    ['No SIPOC, a letra "C" representa:', ['Controle','Custo','Customer (Cliente)','Competência'], 2, 'C significa Customer (Cliente) — quem recebe as saídas do processo.'],
    ['Qual tipo de fluxograma e mais indicado para processos que cruzam departamentos?', ['Fluxograma linear','Fluxograma de decisão','Fluxograma funcional (swimlane)','Diagrama de blocos'], 2, 'O fluxograma swimlane divide o processo em raias por departamento, tornando visíveis as transferências e responsabilidades.'],
    ['A diferença entre indicador lagging e leading e:', ['Lagging e financeiro; leading e operacional','Lagging mede resultado passado; leading mede fator que influencia resultado futuro','Lagging e estratégico; leading e operacional','Não há diferença prática'], 1, 'Indicadores lagging medem resultados passados; leading medem fatores que influenciam resultados futuros.'],
    ['Um KPI bem definido precisa ter, entre outros elementos:', ['Apenas nome e meta','Formula, meta, frequência, fonte de dados e responsável','Apenas formula e unidade','Apenas meta e prazo'], 1, 'Um KPI completo inclui: nome, formula, unidade, frequência, meta, fonte de dados e responsável.'],
    ['O BSC (Balanced Scorecard) conecta:', ['Departamentos com fornecedores','Estratégia da empresa com indicadores operacionais do dia a dia','Normas ISO com legislação','Auditoria interna com auditoria externa'], 1, 'O BSC traduz objetivos estratégicos em metas e indicadores operacionais para cada nível da organização.'],
    ['As 4 perspectivas do BSC são:', ['Produção, vendas, financeiro e RH','Financeira, clientes, processos internos e aprendizado e crescimento','Qualidade, custo, entrega e segurança','Estratégica, tatica, operacional e individual'], 1, 'As 4 perspectivas do BSC são: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
    ['O diagrama de Ishikawa utiliza as categorias 6M. Quais são?', ['Marketing, Mercado, Margem, Marca, Meta, Missão','Máquina, Método, Mão de obra, Material, Meio ambiente, Medição','Manutenção, Material, Método, Mão de obra, Modelo, Meta','Máquina, Manutenção, Mão de obra, Material, Modelo, Missão'], 1, 'Os 6M do Ishikawa são: Máquina, Método, Mão de obra, Material, Meio ambiente e Medição.'],
    ['A técnica dos 5 Porquês busca:', ['Identificar 5 problemas diferentes','Encontrar a causa raiz de um problema perguntando "por que?" repetidamente','Definir 5 metas para cada indicador','Eleger 5 prioridades de melhoria'], 1, 'Os 5 Porquês aprofundam a investigação perguntando "por que?" repetidamente até chegar a causa raiz.'],
    ['O Diagrama de Pareto e baseado no princípio:', ['60/40','70/30','80/20','90/10'], 2, 'O princípio de Pareto (80/20) afirma que aproximadamente 80% dos problemas vem de 20% das causas.'],
    ['Na Matriz GUT, como e calculada a prioridade?', ['G + U + T','G x U x T','(G + U) x T','G x (U + T)'], 1, 'A prioridade na Matriz GUT e calculada multiplicando Gravidade x Urgência x Tendência.'],
    ['O FMEA e uma ferramenta de natureza:', ['Reativa — analisa problemas que já ocorreram','Preventiva — analisa falhas potenciais antes que ocorram','Corretiva — define ações para problemas existentes','Descritiva — apenas documenta o processo'], 1, 'O FMEA e preventivo: identifica modos de falha potenciais e seus riscos antes que as falhas acontecam.'],
    ['No FMEA, o índice D (Detecção) mede:', ['A duração da falha','A dificuldade de resolver o problema','A capacidade de detectar a falha antes que chegue ao cliente','O custo da detecção'], 2, 'D (Detecção) mede a probabilidade de o controle atual detectar a falha antes que ela alcance o cliente.'],
    ['A fase mais negligenciada do PDCA e geralmente:', ['Plan (Planejar)','Do (Executar)','Check (Verificar)','Act (Agir)'], 0, 'A fase Plan e a mais importante e a mais negligenciada. Sem planejamento adequado, as ações viram "apaga incendio".'],
    ['O relatório A3 segue a lógica de qual ciclo?', ['DMAIC','PDCA','BSC','FMEA'], 1, 'O A3 segue a lógica do PDCA: lado esquerdo (Plan), lado direito (Do/Check/Act).'],
    ['No 5W2H, a principal regra para o campo "Quem" e:', ['Deve conter o nome do departamento','Deve conter o nome da pessoa responsável, não do departamento','Deve conter o nome do diretor','Deve conter o nome do auditor'], 1, 'O campo "Quem" deve ter um nome de pessoa, não de departamento. Sem responsável definido, a ação não acontece.'],
    ['Qual é a diferença fundamental entre Kaizen diário e evento Kaizen?', ['Kaizen diário custa mais','Kaizen diário são pequenas melhorias continuas; evento Kaizen e intensivo de 3-5 dias num processo específico','Evento Kaizen e feito por consultores externos','Não há diferença prática'], 1, 'Kaizen diário são pequenas melhorias feitas no dia a dia por cada pessoa. Evento Kaizen é um projeto intensivo de 3-5 dias focado em um processo.'],
    ['A ISO 9001:2015 usa o termo "informação documentada" para substituir:', ['Manual e política','Documentos e registros','Procedimentos e instruções','Formulários e checklists'], 1, 'A versão 2015 unificou "documentos" e "registros" no termo único "informação documentada".'],
    ['Qual é a função da lista mestra de documentos?', ['Substituir os documentos originais','Servir como índice centralizado de todos os documentos do SGQ com versão e responsável','Ser enviada ao organismo de certificação','Controlar o acesso dos funcionários ao sistema'], 1, 'A lista mestra e o índice que centraliza todos os documentos do SGQ com código, versão, data e responsável.'],
    ['Num dashboard eficaz, qual é o número máximo recomendado de indicadores por tela?', ['3','5','7','15'], 2, 'A recomendação e de no máximo 7 indicadores por tela de dashboard para que sejam absorvidos efetivamente.'],
    ['A diferença entre PDCA e SDCA e:', ['SDCA e a versão atualizada do PDCA','PDCA busca melhorar; SDCA busca manter o padrão conquistado','SDCA usa apenas 3 fases','PDCA e para qualidade; SDCA e para produção'], 1, 'PDCA e para melhorar (subir o nível de desempenho). SDCA e para manter (padronizar e não deixar cair).'],
    ['No contexto de gestão visual, o princípio "torne os problemas visíveis" e atribuído a:', ['ISO 9001','Peter Drucker','Toyota','Henry Ford'], 2, 'O princípio de tornar problemas visíveis e parte da cultura Toyota e do Sistema Toyota de Produção (TPS).'],
    ['Qual é a sequência recomendada para resolver um problema usando as ferramentas do curso?', ['5W2H, depois Ishikawa, depois Pareto','Pareto para priorizar, Ishikawa/5 Porquês para causa raiz, 5W2H para plano de ação','FMEA, depois A3, depois PDCA','Fluxograma, depois BSC, depois GUT'], 1, 'A sequência lógica e: Pareto (priorizar qual problema), Ishikawa/5 Porquês (encontrar causa raiz), 5W2H (plano de ação concreto).'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
