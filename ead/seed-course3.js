export async function seedCourse3(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      'gestão-processos-indicadores',
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

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteúdo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-o-que-e-processo', 'O que é um processo e por que gerênciar', '15 min', 1, ${`
<h2>O que é um processo?</h2>
<p>Um processo é um <strong>conjunto de atividades inter-relacionadas que transforma entradas em saídas</strong>, gerando valor para um cliente interno ou externo. Essa definição, que parece simples, é a base de toda a gestão por processos — e ignorar ela é a raiz de grande parte da ineficiência nas empresas brasileiras.</p>

<div class="callout"><strong>Definição formal (ISO 9000:2015):</strong> "Conjunto de atividades inter-relacionadas ou interativas que útilizam entradas para entregar um resultado pretendido."</div>

<h3>Processo vs. departamento</h3>
<p>O erro mais comum é confundir <strong>processo</strong> com <strong>departamento</strong>. Um departamento é uma estrutura organizacional (financeiro, produção, comercial). Um processo <strong>atravessa departamentos</strong>.</p>

<div class="example"><strong>Exemplo — metalúrgica de Caxias do Sul:</strong> O processo "Atendimento de pedido" começa no comercial (recebe pedido), passa pelo PCP (programa produção), vai para a produção (fabrica a peça), passa pelo controle de qualidade (inspeciona), segue para a expedição (embala e despacha) e termina no financeiro (fatura e cobra). São 6 departamentos envolvidos em UM processo.</div>

<h3>Os 3 tipos de processo</h3>
<table>
<tr><th>Tipo</th><th>Descrição</th><th>Exemplos</th></tr>
<tr><td><strong>Processos primários (de negócio)</strong></td><td>Geram valor direto para o cliente externo</td><td>Vendas, produção, entrega, pós-venda</td></tr>
<tr><td><strong>Processos de apoio (suporte)</strong></td><td>Suportam os processos primários</td><td>RH, TI, compras, manutenção, financeiro</td></tr>
<tr><td><strong>Processos gerênciais</strong></td><td>Direcionam e monitoram os demais</td><td>Planejamento estratégico, gestão da qualidade, análise crítica</td></tr>
</table>

<h3>Por que gerênciar processos?</h3>
<p>Quando você <strong>não</strong> gerência processos, cada departamento otimiza seu pedaço sem ver o todo. O resultado são as disfunções clássicas:</p>
<ul>
<li><strong>Retrabalho invisível:</strong> A produção refaz peças que o comercial prometeu com especificação errada</li>
<li><strong>Gargalos:</strong> O PCP programa 200 peças/dia, mas a pintura só processa 120 — e ninguém mapeia isso</li>
<li><strong>Culpa cruzada:</strong> "O problema não é do meu setor" — porque ninguém é dono do processo ponta a ponta</li>
<li><strong>Perda de conhecimento:</strong> O operador mais experiente sai e leva o "jeito certo" na cabeça</li>
</ul>

<div class="callout"><strong>Dado real:</strong> Uma pesquisa da ABPMP Brasil (2023) com 450 empresas mostrou que organizações com gestão por processos formalizada reduziram custos operacionais em média 18% e tempo de ciclo em 25% em 2 anos.</div>

<h3>Cadeia de valor</h3>
<p>Todos os processos de uma organização formam a <strong>cadeia de valor</strong>. A visão da cadeia de valor (conceito de Michael Porter) ajuda a enxergar onde está o valor real e onde está o desperdício. A ideia é simples: se uma atividade não agrega valor para o cliente final e também não é necessária para suportar quem agrega valor, ela é candidata a eliminação.</p>

<div class="example"><strong>Na prática — cooperativa agrícola do Paraná:</strong> Ao mapear a cadeia de valor do processo "recebimento de grãos", a cooperativa descobriu que o agricultor esperava em média 3,2 horas na fila de classificação. Ao redesenhar o processo com agendamento prévio e classificação rápida, reduziu para 45 minutos — aumentando a satisfação e o volume recebido em 30%.</div>

<h3>A mentalidade de processo</h3>
<p>Gerênciar por processos exige uma mudança de mentalidade: sair do <strong>"quem faz"</strong> para o <strong>"como flui"</strong>. Em vez de perguntar "de quem é a culpa?", perguntar "onde o processo falhou?". Em vez de "como meu setor pode ser mais eficiente?", perguntar "como o fluxo ponta a ponta pode ser melhor para o cliente?".</p>
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

<h3>O PDCA dentro de cada processo</h3>
<p>A ISO 9001 espera que cada processo funcione como um mini-PDCA:</p>
<ul>
<li><strong>Plan:</strong> Definir objetivo do processo, entradas esperadas, critérios de controle</li>
<li><strong>Do:</strong> Executar o processo conforme planejado</li>
<li><strong>Check:</strong> Monitorar indicadores, verificar saídas</li>
<li><strong>Act:</strong> Corrigir desvios, melhorar o processo</li>
</ul>

<div class="callout"><strong>Dica de auditoria:</strong> Quando o auditor avalia a cláusula 4.4, ele quer ver: (1) que você sabe quais são seus processos, (2) que você sabe como eles interagem, (3) que você tem critérios para controlá-los, e (4) que você mede se estão funcionando. Não precisa de software caro — um mapa de processos no PowerPoint e diagramas tartaruga já atendem.</div>
`}, 'Diagrama tartaruga preenchido'),

  (${m1.id}, '1-3-mapeamento-sipoc', 'Mapeamento com SIPOC', '15 min', 3, ${`
<h2>Mapeamento com SIPOC</h2>
<p>O SIPOC é uma das ferramentas mais poderosas e simples para <strong>mapear um processo de forma rápida</strong>. O nome é um acrônimo que descreve os 5 elementos do processo: <strong>Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saída), Customer (Cliente)</strong>.</p>

<div class="callout"><strong>Quando usar SIPOC:</strong> No início de qualquer projeto de melhoria, ao documentar processos para ISO 9001, ao integrar novos colaboradores que precisam entender o processo, ou sempre que houver confusão sobre "onde começa e onde termina" um processo.</div>

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
<ol>
<li><strong>Comece pelo P (Processo):</strong> Descreva as etapas macro (5 a 7 passos, não mais). Comece com um verbo de ação.</li>
<li><strong>Defina O (Saídas):</strong> O que cada etapa entrega? Qual é o resultado final?</li>
<li><strong>Defina C (Clientes):</strong> Quem recebe essas saídas? (Pode ser interno ou externo)</li>
<li><strong>Defina I (Entradas):</strong> O que é necessário para iniciar cada etapa?</li>
<li><strong>Defina S (Fornecedores):</strong> Quem fornece essas entradas?</li>
</ol>

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

<h3>SIPOC na prática indústrial</h3>

<div class="example"><strong>Exemplo — metalúrgica de Joinville (SC):</strong> A equipe de qualidade mapeou o SIPOC do processo de "Tratamento térmico de engrenagens". Descobriram que a entrada "especificação de dureza" vinha do projeto, mas em 30% dos casos chegava por e-mail informal (sem registro). O SIPOC tornou visível essa fragilidade. Solução: criar formulário padrão de requisição de tratamento térmico com campo obrigatório de dureza, vinculado à ordem de produção.</div>

<h3>Erros comuns no SIPOC</h3>
<ul>
<li><strong>Detalhar demais:</strong> O SIPOC é macro — se você tem mais de 8 etapas no P, está detalhando demais. Use fluxograma para o detalhe.</li>
<li><strong>Esquecer clientes internos:</strong> O "cliente" no SIPOC não é só o cliente final. É quem recebe a saída de cada etapa — frequentemente é outro departamento.</li>
<li><strong>Pular fornecedores internos:</strong> O PCP que fornece a ordem de produção é um fornecedor tão importante quanto o fornecedor externo de matéria-prima.</li>
<li><strong>Não validar com quem faz:</strong> Um SIPOC feito pelo gerente na sala dele, sem ouvir o operador, vai estar errado. Sempre valide no chão de fábrica.</li>
</ul>

<div class="callout"><strong>Regra de ouro:</strong> O SIPOC é o "mapa do tesouro" — mostra o caminho geral. O fluxograma (próxima aula) é o "passo a passo detalhado" de cada etapa. Use os dois em conjunto.</div>
`}, 'Template SIPOC preenchível'),

  (${m1.id}, '1-4-fluxograma-processo', 'Fluxograma de processo detalhado', '15 min', 4, ${`
<h2>Fluxograma de processo detalhado</h2>
<p>O fluxograma é a <strong>representação gráfica passo a passo</strong> de um processo. Enquanto o SIPOC mostra a visão macro (5-7 etapas), o fluxograma detalha cada decisão, ação e interação dentro do processo.</p>

<h3>Símbolos padrão do fluxograma</h3>
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
`}, 'Fluxograma swimlane modelo')`;

  // ── Module 2: Indicadores de Desempenho (KPIs) ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Indicadores de Desempenho (KPIs)', 'Definição, medição, dashboards e desdobramento de indicadores', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteúdo, entregavel_titulo) VALUES
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

<h3>Tipos de indicadores</h3>
<p>Indicadores podem ser classificados de diversas formas. As mais úteis na prática:</p>

<h3>Por natureza</h3>
<ul>
<li><strong>Indicadores de resultado (lagging):</strong> Medem o que já aconteceu. Ex: faturamento mensal, índice de reclamações, refugo acumulado.</li>
<li><strong>Indicadores de tendência (leading):</strong> Medem o que influencia o resultado futuro. Ex: horas de treinamento, número de propostas enviadas, índice de manutenção preventiva realizada.</li>
</ul>

<div class="example"><strong>Exemplo — construtora de Goiânia:</strong> O indicador "número de unidades entregues" é de resultado (lagging). O indicador "percentual de etapas concluídas no cronograma" é de tendência (leading). Se as etapas atrasam, a entrega vai atrasar — o leading avisa antes.</div>

<h3>Por dimensão</h3>
<table>
<tr><th>Dimensão</th><th>O que mede</th><th>Exemplo indústrial</th></tr>
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
`}, NULL),

  (${m2.id}, '2-2-definindo-indicadores', 'Definindo indicadores: fórmula, meta, frequência', '15 min', 2, ${`
<h2>Definindo indicadores: fórmula, meta, frequência</h2>
<p>Um indicador só funciona se for <strong>bem definido</strong>. A diferença entre "medir o refugo" (vago) e ter um KPI funcional é a definição rigorosa de 7 elementos essenciais.</p>

<h3>Os 7 elementos de um KPI bem definido</h3>
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

<h3>Como definir metas</h3>
<p>Metas devem seguir a lógica <strong>SMART</strong>: Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais. Na prática indústrial:</p>
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
`}, 'Ficha de indicador (KPI Card)'),

  (${m2.id}, '2-3-dashboards-gestão-visual', 'Dashboards e gestão visual de indicadores', '15 min', 3, ${`
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
<p>Um dashboard eficaz segue regras simples:</p>
<ol>
<li><strong>Máximo 7 indicadores por tela:</strong> Mais do que isso, ninguém absorve</li>
<li><strong>Codificação por cor:</strong> Verde (dentro da meta), amarelo (próximo do limite), vermelho (fora da meta)</li>
<li><strong>Tendência visível:</strong> Não mostre só o número atual — mostre a evolução (gráfico de linha)</li>
<li><strong>Meta explícita:</strong> Sempre mostre a meta junto do resultado real</li>
<li><strong>Período claro:</strong> "Refugo de usinagem — Junho 2025" e não apenas "Refugo"</li>
<li><strong>Responsável visível:</strong> Quem é o dono do indicador?</li>
</ol>

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
`}, 'Modelo de dashboard operacional'),

  (${m2.id}, '2-4-desdobramento-bsc', 'Desdobramento de objetivos em indicadores (BSC)', '15 min', 4, ${`
<h2>Desdobramento de objetivos em indicadores (BSC)</h2>
<p>O <strong>Balanced Scorecard (BSC)</strong> é uma métodologia criada por Kaplan e Norton nos anos 1990 que resolve um problema clássico: <strong>como conectar a estratégia da empresa com os indicadores do dia a dia</strong>. Sem essa conexão, os indicadores operacionais ficam soltos — você mede refugo, OEE e entrega, mas não sabe se isso está contribuindo para os objetivos estratégicos.</p>

<h3>As 4 perspectivas do BSC</h3>
<table>
<tr><th>Perspectiva</th><th>Pergunta central</th><th>Exemplos de indicadores</th></tr>
<tr><td><strong>Financeira</strong></td><td>Como estamos para os acionistas?</td><td>Faturamento, margem líquida, ROI, custo da não-qualidade</td></tr>
<tr><td><strong>Clientes</strong></td><td>Como os clientes nos veem?</td><td>Satisfação, retenção, OTIF, reclamações, NPS</td></tr>
<tr><td><strong>Processos Internos</strong></td><td>Em que devemos ser excelentes?</td><td>OEE, refugo, lead time, produtividade, PPM</td></tr>
<tr><td><strong>Aprendizado e Crescimento</strong></td><td>Como sustentar a capacidade de mudar?</td><td>Horas de treinamento, turnover, projetos de melhoria, competências</td></tr>
</table>

<div class="callout"><strong>A lógica do BSC:</strong> Se investimos em pessoas e conhecimento (Aprendizado) → nossos processos melhoram (Processos) → atendemos melhor os clientes (Clientes) → geramos mais resultado financeiro (Financeira). É uma cadeia de causa e efeito.</div>

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
`}, 'Mapa estratégico BSC modelo')`;

  // ── Module 3: Ferramentas de Análise ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Análise', 'Ishikawa, Pareto, 5 Porquês, Matriz GUT e FMEA para diagnóstico de problemas', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteúdo, entregavel_titulo) VALUES
  (${m3.id}, '3-1-diagrama-ishikawa', 'Diagrama de Ishikawa (causa e efeito)', '15 min', 1, ${`
<h2>Diagrama de Ishikawa (causa e efeito)</h2>
<p>O Diagrama de Ishikawa — também chamado de <strong>espinha de peixe</strong> ou <strong>diagrama de causa e efeito</strong> — foi criado por Kaoru Ishikawa em 1943 e contínua sendo uma das ferramentas mais usadas para <strong>identificar causas potenciais de um problema</strong>.</p>

<h3>Estrutura do diagrama</h3>
<p>O diagrama tem a forma de uma espinha de peixe:</p>
<ul>
<li><strong>Cabeça do peixe (direita):</strong> O problema (efeito) que você quer resolver</li>
<li><strong>Espinha central:</strong> Seta horizontal apontando para o problema</li>
<li><strong>Espinhas secundárias:</strong> As categorias de causas potenciais</li>
<li><strong>Espinhas terciárias:</strong> As causas específicas dentro de cada categoria</li>
</ul>

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
<ol>
<li><strong>Defina o problema com clareza:</strong> "Índice de refugo no torneamento CNC subiu de 1,5% para 4,2% em março" (específico, com dados)</li>
<li><strong>Desenhe a estrutura:</strong> Cabeça + espinha central + 6 espinhas de categoria</li>
<li><strong>Faça brainstorming por categoria:</strong> Reúna a equipe (operadores, técnico, supervisor) e liste causas potenciais em cada M</li>
<li><strong>Aprofunde com "Por quê?":</strong> Para cada causa listada, pergunte "por que isso acontece?" para chegar a causas mais profundas</li>
<li><strong>Priorize:</strong> Marque as 3-5 causas mais prováveis (com base em dados, não em achismo)</li>
<li><strong>Verifique:</strong> Valide as causas priorizadas com dados reais antes de sair corrigindo</li>
</ol>

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
`}, 'Template Ishikawa preenchível'),

  (${m3.id}, '3-2-5-porques-pareto', '5 Porquês e Diagrama de Pareto', '15 min', 2, ${`
<h2>5 Porquês e Diagrama de Pareto</h2>
<p>Duas ferramentas complementares e poderosas: os <strong>5 Porquês</strong> aprofundam a busca pela causa raiz de um problema específico, enquanto o <strong>Diagrama de Pareto</strong> mostra quais problemas merecem atenção primeiro.</p>

<h3>5 Porquês (5 Whys)</h3>
<p>Criada por Taiichi Ohno na Toyota, a técnica é simples: pergunte "por quê?" repetidamente (geralmente 5 vezes) até chegar à <strong>causa raiz</strong> — aquela que, se eliminada, evita que o problema se repita.</p>

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
`}, 'Matriz GUT preenchível'),

  (${m3.id}, '3-4-fmea-processos', 'FMEA simplificado para processos', '15 min', 4, ${`
<h2>FMEA simplificado para processos</h2>
<p>O <strong>FMEA (Failure Mode and Effects Analysis)</strong> — ou Análise de Modos de Falha e seus Efeitos — é uma ferramenta <strong>preventiva</strong> que identifica falhas potenciais em um processo ANTES que elas aconteçam, avalia seu risco e define ações para reduzir esse risco.</p>

<div class="callout"><strong>Diferença fundamental:</strong> O Ishikawa e os 5 Porquês são ferramentas REATIVAS (o problema já aconteceu). O FMEA é PREVENTIVO (analisa o que PODE dar errado). Essa é a essência do pensamento baseado em risco da ISO 9001:2015.</div>

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
`}, 'Template FMEA de processo')`;

  // ── Module 4: Ferramentas de Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Melhoria', 'PDCA, A3, 5W2H e Kaizen aplicados a processos indústriais', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteúdo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-ciclo-pdca', 'Ciclo PDCA na prática', '15 min', 1, ${`
<h2>Ciclo PDCA na prática</h2>
<p>O ciclo PDCA (Plan-Do-Check-Act) é o <strong>motor da melhoria contínua</strong>. Criado por Walter Shewhart e popularizado por Edwards Deming, é a base da ISO 9001, do Lean Manufacturing e de práticamente toda métodologia séria de gestão.</p>

<div class="callout"><strong>Por que o PDCA é tão poderoso?</strong> Porque impede os dois erros mais comuns em melhoria: (1) agir sem planejar (apagar incêndio) e (2) planejar sem verificar se funcionou (achismo). O ciclo força disciplina: planejo, executo, verifico e ajusto.</div>

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
<li><strong>Meta NAO atingida:</strong> Voltar ao P — analisar por que não funcionou, redefinir o plano, girar o ciclo novamente.</li>
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
`}, 'Formulário PDCA preenchível'),

  (${m4.id}, '4-2-a3-resolucao-problemas', 'A3 de resolução de problemas', '15 min', 2, ${`
<h2>A3 de resolução de problemas</h2>
<p>O <strong>Relatório A3</strong> é uma ferramenta da Toyota que resume todo o ciclo de resolução de problemas em <strong>uma única folha A3</strong> (42 x 30 cm). Não é apenas um formulário — é uma <strong>forma de pensar</strong>: sintetizar o problema, a análise, a solução e o resultado em um documento conciso que qualquer pessoa consegue entender em 5 minutos.</p>

<div class="callout"><strong>Filosofia Toyota:</strong> "Se você não consegue explicar o problema e a solução em uma folha A3, você não entendeu o problema." A restrição de espaço força clareza e foco.</div>

<h3>Estrutura do A3</h3>
<p>O A3 segue a lógica do PDCA e é dividido em dois lados:</p>
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
`}, 'Template A3 preenchível'),

  (${m4.id}, '4-3-5w2h-planos-acao', '5W2H para planos de ação', '15 min', 3, ${`
<h2>5W2H para planos de ação</h2>
<p>O <strong>5W2H</strong> é a ferramenta mais objetiva para transformar uma decisão em <strong>ação concreta</strong>. Quando a análise já identificou o que precisa ser feito (via Ishikawa, 5 Porquês, PDCA), o 5W2H responde: quem faz, o que faz, quando, onde, por que, como e quanto custa.</p>

<h3>Os 7 elementos</h3>
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

<div class="callout"><strong>Regra de ouro:</strong> O campo "Quem" deve ter um NOME, não um departamento. "Produção" não e responsável — "Carlos Silva, supervisor do turno A" é responsável. Se não tem nome, não tem dono. Se não tem dono, não vai acontecer.</div>

<h3>Exemplo completo</h3>

<div class="example"><strong>Contexto — construtora de Florianópolis (SC):</strong><br>
Problema: Atraso médio de 22 dias na entrega de apartamentos por retrabalho em instalações hidráulicas.<br>
Causa raiz (5 Porquês): Projeto hidraulico não conferido com o eletrico antes da execução, gerando conflito de passagens na laje.<br>

<table>
<tr><th>O que</th><th>Por que</th><th>Onde</th><th>Quando</th><th>Quem</th><th>Como</th><th>Quanto</th></tr>
<tr><td>Implementar check de compatibilidade de projetos</td><td>Eliminar conflitos entre hidráulico e elétrico</td><td>Dept. de projetos</td><td>Até 15/03</td><td>Eng. Marcos Lima</td><td>Reunião de compatibilização com checklist padrão antes de liberar projeto para obra</td><td>R$ 0 (recurso interno)</td></tr>
<tr><td>Criar checklist de verificação de passagens na laje</td><td>Padronizar conferência antes da concretagem</td><td>Canteiro de obra</td><td>Até 20/03</td><td>Mestre João Pedro</td><td>Elaborar checklist com 15 itens críticos, validar com engenheiro residente</td><td>R$ 200 (impressão)</td></tr>
<tr><td>Treinar equipe de instalações no novo procedimento</td><td>Garantir que todos sigam o padrão</td><td>Sala de treinamento</td><td>Até 01/04</td><td>Coord. Ana Souza</td><td>Treinamento presencial de 2h com simulação prática e prova</td><td>R$ 1.500 (hora-homem)</td></tr>
<tr><td>Monitorar retrabalho por 90 dias</td><td>Verificar eficácia das ações</td><td>Todas as obras</td><td>01/04 a 30/06</td><td>Eng. Marcos Lima</td><td>Indicador semanal de retrabalho por obra, reporte na reunião de gestão</td><td>R$ 0 (sistema existente)</td></tr>
</table>
</div>

<h3>Boas práticas</h3>
<ul>
<li><strong>Ações específicas e verificáveis:</strong> "Melhorar a qualidade" não é ação. "Implementar inspeção 100% na etapa de soldagem usando gabarito de verificação" é ação.</li>
<li><strong>Prazos realistas:</strong> Considere a capacidade da equipe, a complexidade e os recursos disponíveis. Prazo impossível gera descrença.</li>
<li><strong>Acompanhamento:</strong> O 5W2H sem follow-up é papel bonito na gaveta. Defina frequência de acompanhamento (semanal é o ideal).</li>
<li><strong>"How much" é opcional mas valioso:</strong> Mesmo para ações de custo zero, registre "R$ 0 (recurso interno)" — mostra que foi pensado.</li>
</ul>

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
`}, 'Template 5W2H preenchível'),

  (${m4.id}, '4-4-kaizen-melhoria-rapida', 'Kaizen e eventos de melhoria rápida', '15 min', 4, ${`
<h2>Kaizen e eventos de melhoria rápida</h2>
<p><strong>Kaizen</strong> (do japonês: "mudança para melhor") é a filosofia de <strong>melhoria contínua incremental</strong>. Na prática indústrial brasileira, kaizen se manifesta de duas formas: (1) como cultura diária de pequenas melhorias e (2) como <strong>eventos kaizen</strong> — projetos intensivos de melhoria rápida de 3 a 5 dias.</p>

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
<li>Analisar causas dos desperdícios (Ishikawa, 5 Porques)</li>
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
`}, 'Roteiro de evento Kaizen')`;

  // ── Module 5: Integracao e Sustentabilidade ──
  const [m5] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Integração e Sustentabilidade', 'Procedimentos, controle de documentos, cultura de melhoria e plano de ação final', 5) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteúdo, entregavel_titulo) VALUES
  (${m5.id}, '5-1-procedimentos-instruções', 'Procedimentos e instruções de trabalho', '15 min', 1, ${`
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
<ul>
<li><strong>Menos texto, mais visual:</strong> Fotos, diagramas e tabelas comunicam melhor que parágrafos longos</li>
<li><strong>Linguagem simples:</strong> Escreva para quem vai USAR, não para o auditor. O operador precisa entender.</li>
<li><strong>Mantenha atualizado:</strong> Documento desatualizado é pior do que não ter documento — gera confusão e descrença</li>
<li><strong>Envolva quem faz:</strong> O operador que executa a tarefa deve participar da elaboração da IT. Ele sabe os detalhes que o engenheiro não sabe.</li>
</ul>
`}, 'Template de instrução de trabalho'),

  (${m5.id}, '5-2-controle-documentos-registros', 'Controle de documentos e registros', '12 min', 2, ${`
<h2>Controle de documentos e registros</h2>
<p>De nada adianta ter procedimentos e instruções de trabalho excelentes se você <strong>não controla versões, distribuição e acesso</strong>. O controle de documentos garante que as pessoas certas usem a versão certa no momento certo.</p>

<div class="callout"><strong>ISO 9001:2015 (cláusula 7.5):</strong> A norma usa o termo "informação documentada" e exige que a organização controle: (a) distribuição, acesso, recuperação e uso; (b) armazenamento e preservação; (c) controle de alterações; (d) retenção e disposição.</div>

<h3>Documento vs. registro</h3>
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
<p>Crie uma lógica de código única:</p>
<ul>
<li><strong>Tipo:</strong> PR (procedimento), IT (instrução), FR (formulário), PL (política)</li>
<li><strong>Setor:</strong> PRD (produção), QLD (qualidade), ADM (administrativo)</li>
<li><strong>Número sequêncial:</strong> 001, 002, 003...</li>
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

<div class="callout"><strong>Dica prática para PMEs:</strong> Você não precisa de software de gestão documental caro. Uma estrutura de pastas no Google Drive ou SharePoint, com convenção de nome (codigo-titulo-versao) e uma planilha como lista mestra, atende perfeitamente a ISO 9001. O que importa é a DISCIPLINA do controle, não a ferramenta.</div>
`}, 'Lista mestra de documentos modelo'),

  (${m5.id}, '5-3-melhoria-continua-cultura', 'Melhoria contínua como cultura', '15 min', 3, ${`
<h2>Melhoria contínua como cultura</h2>
<p>Ferramentas como PDCA, Ishikawa e 5W2H são poderosas, mas sem <strong>cultura de melhoria</strong>, elas viram formulários que ninguém preenche. A diferença entre empresas que melhoram de verdade e empresas que apenas "fazem de conta" está na cultura — nos hábitos, valores e comportamentos do dia a dia.</p>

<div class="callout"><strong>Cláusula 10.3 da ISO 9001:</strong> "A organização deve melhorar continuamente a adequação, suficiência e eficácia do sistema de gestão da qualidade." Não é opcional — é requisito. Mas a norma não diz COMO criar a cultura. Isso é trabalho de liderança.</div>

<h3>Os 5 pilares da cultura de melhoria continua</h3>

<h3>1. Liderança pelo exemplo</h3>
<p>Se o diretor não participa das reuniões de indicadores, não vai ao gemba, e não valoriza as sugestoes de melhoria, nenhuma ferramenta vai funcionar. A cultura comeca no topo.</p>
<ul>
<li>A diretoria participa das análises criticas? (Não só assina a ata)</li>
<li>Os gestores visitam o chao de fábrica regularmente?</li>
<li>As sugestoes de melhoria recebem resposta em tempo razoavel?</li>
</ul>

<h3>2. Ambiente psicologicamente seguro</h3>
<p>As pessoas só vao reportar problemas e sugerir melhorias se <strong>nao forem punidas por isso</strong>. Se o operador que reporta um erro e advertido, ele aprende a esconder erros — e os problemas ficam invisiveis.</p>

<div class="example"><strong>Exemplo — metalúrgica de Canoas (RS):</strong> A empresa mudou a abordagem de tratamento de não-conformidades: em vez de "quem causou?", passou a perguntar "o que no processo permitiu que isso acontecesse?". Em 6 meses, o número de problemas reportados AUMENTOU 300% (as pessoas pararam de esconder), e o número de problemas recorrentes CAIU 60% (porque agora eram tratados de verdade).</div>

<h3>3. Gestão visual e transparencia</h3>
<p>Indicadores visiveis criam consciencia coletiva. Quando o quadro mostra que o refugo esta vermelho, toda a equipe sente a responsabilidade — não só o supervisor.</p>

<h3>4. Rotina estruturada</h3>
<p>Melhoria contínua precisa de <strong>espaco no calendario</strong>:</p>
<table>
<tr><th>Rotina</th><th>Frequência</th><th>Duracao</th><th>Participantes</th></tr>
<tr><td>Reuniao diaria de produção</td><td>Diaria</td><td>10-15 min</td><td>Operadores + supervisor</td></tr>
<tr><td>Análise de indicadores do processo</td><td>Semanal</td><td>30 min</td><td>Supervisor + gerente</td></tr>
<tr><td>Reuniao de gestão (KPIs)</td><td>Mensal</td><td>60 min</td><td>Gerentes + diretoria</td></tr>
<tr><td>Análise crítica pela direcao</td><td>Semestral</td><td>2-3 horas</td><td>Alta direcao + coordenadores</td></tr>
<tr><td>Evento Kaizen</td><td>Trimestral</td><td>3-5 dias</td><td>Equipe multidisciplinar</td></tr>
</table>

<h3>5. Reconhecimento e celebracao</h3>
<p>Valorize quem melhora. Não precisa ser dinheiro — reconhecimento publico, mencao em reuniao, quadro de honra, almoco especial com a diretoria. O importante e que as pessoas percebam que melhoria e valorizada.</p>

<h3>Maturidade da melhoria continua</h3>
<p>A evolucao da cultura segue niveis:</p>
<table>
<tr><th>Nivel</th><th>Descricao</th><th>Comportamento tipico</th></tr>
<tr><td><strong>1 — Apaga incendio</strong></td><td>So resolve quando estoura</td><td>"Conserta ai que o cliente ta reclamando"</td></tr>
<tr><td><strong>2 — Reativo</strong></td><td>Trata problemas com ferramentas</td><td>"Vamos fazer um Ishikawa pra esse defeito"</td></tr>
<tr><td><strong>3 — Preventivo</strong></td><td>Antecipa problemas com análise de risco</td><td>"O FMEA mostrou risco alto nessa etapa, vamos agir"</td></tr>
<tr><td><strong>4 — Proativo</strong></td><td>Busca melhorias mesmo sem problemas</td><td>"O processo ta OK, mas podemos reduzir o lead time"</td></tr>
<tr><td><strong>5 — Inovador</strong></td><td>Melhoria faz parte do DNA</td><td>"Cada pessoa contribui com melhorias todo mes"</td></tr>
</table>

<div class="callout"><strong>Realidade brasileira:</strong> A maioria das PMEs brasileiras esta entre os niveis 1 e 2. Chegar ao nivel 3 já e uma conquista significativa e atende bem a ISO 9001. O caminho do nivel 1 ao 3 leva tipicamente 12-18 meses de trabalho consistente.</div>
`}, NULL),

  (${m5.id}, '5-4-encerramento-plano-acao', 'Encerramento: montando seu plano de acao', '15 min', 4, ${`
<h2>Encerramento: montando seu plano de acao</h2>
<p>Voce chegou ao final do curso. Aprendeu a mapear processos (SIPOC, fluxograma), definir indicadores (KPIs, dashboards, BSC), analisar problemas (Ishikawa, Pareto, 5 Porques, GUT, FMEA) e implementar melhorias (PDCA, A3, 5W2H, Kaizen). Agora e hora de <strong>transformar conhecimento em acao</strong>.</p>

<div class="callout"><strong>Lembre-se:</strong> Conhecimento sem acao e entretenimento. O valor deste curso esta no que você VAI FAZER a partir de amanha.</div>

<h3>Seu plano de acao pessoal — 90 dias</h3>
<p>Não tente fazer tudo de uma vez. Siga uma sequência lógica de 3 fases:</p>

<h3>Fase 1 — Semanas 1 a 4: Mapear</h3>
<ul>
<li><strong>Escolha 1 processo critico:</strong> Aquele que mais gera reclamacao, retrabalho ou custo</li>
<li><strong>Faca o SIPOC:</strong> Com a equipe que executa o processo (nao sozinho na sala)</li>
<li><strong>Faca o fluxograma do estado atual:</strong> Va ao gemba, observe, pergunte, registre</li>
<li><strong>Identifique 3-5 pontos de melhoria:</strong> Retrabalhos, esperas, handoffs problematicos</li>
</ul>

<h3>Fase 2 — Semanas 5 a 8: Medir e analisar</h3>
<ul>
<li><strong>Defina 2-3 indicadores para o processo:</strong> Use a ficha de KPI (formula, meta, frequência, responsável)</li>
<li><strong>Comece a medir:</strong> Mesmo que manual, comece. Dados imperfeitos são melhores que nenhum dado.</li>
<li><strong>Análise o problema prioritario:</strong> Use Ishikawa + 5 Porques para encontrar a causa raiz</li>
<li><strong>Monte o plano de acao 5W2H:</strong> Para cada causa raiz, defina ações concretas</li>
</ul>

<h3>Fase 3 — Semanas 9 a 12: Melhorar e padronizar</h3>
<ul>
<li><strong>Implemente as ações:</strong> Execute o 5W2H, acompanhe semanalmente</li>
<li><strong>Meca o resultado:</strong> Compare antes vs. depois com os indicadores definidos</li>
<li><strong>Padronize:</strong> Atualize (ou crie) o procedimento/IT do processo melhorado</li>
<li><strong>Comunique:</strong> Apresente os resultados para a equipe e a diretoria (use o formato A3)</li>
</ul>

<div class="template-box">
<strong>Template: Plano de Acao Pessoal — 90 dias</strong>
<table>
<tr><th>Fase</th><th>Acao</th><th>Prazo</th><th>Ferramenta</th><th>Entregavel</th></tr>
<tr><td>1</td><td>Selecionar processo critico</td><td>Semana 1</td><td>Pareto / GUT</td><td>Processo escolhido com justificativa</td></tr>
<tr><td>1</td><td>Mapear SIPOC</td><td>Semana 2</td><td>SIPOC</td><td>SIPOC preenchido e validado</td></tr>
<tr><td>1</td><td>Mapear fluxograma AS-IS</td><td>Semana 3-4</td><td>Fluxograma</td><td>Fluxograma com pontos de melhoria marcados</td></tr>
<tr><td>2</td><td>Definir KPIs do processo</td><td>Semana 5</td><td>Ficha de KPI</td><td>2-3 fichas preenchidas</td></tr>
<tr><td>2</td><td>Coletar dados e analisar</td><td>Semana 6-7</td><td>Ishikawa + 5 Porques</td><td>Diagrama Ishikawa + análise de causa raiz</td></tr>
<tr><td>2</td><td>Elaborar plano de acao</td><td>Semana 8</td><td>5W2H</td><td>Plano de acao com responsaveis e prazos</td></tr>
<tr><td>3</td><td>Implementar ações</td><td>Semana 9-10</td><td>5W2H + PDCA</td><td>Ações executadas</td></tr>
<tr><td>3</td><td>Medir resultado e padronizar</td><td>Semana 11-12</td><td>Indicadores + IT</td><td>Resultado antes vs. depois + IT atualizada</td></tr>
</table>
</div>

<div class="example"><strong>Caso real — empresa de médio porte de Campinas (SP):</strong><br>
Um aluno deste curso aplicou o plano de 90 dias no processo de "expedicao de pedidos". Resultados:<br>
<ul>
<li><strong>SIPOC:</strong> Revelou que 40% dos atrasos de entrega vinham de informação incompleta do comercial</li>
<li><strong>KPI:</strong> OTIF (On Time In Full) — medição inicial: 72%</li>
<li><strong>Ishikawa + 5 Porques:</strong> Causa raiz: pedido entrava no sistema sem especificação de embalagem, gerando retrabalho na expedicao</li>
<li><strong>5W2H:</strong> Campo obrigatório de embalagem no sistema + checklist de conferencia do pedido</li>
<li><strong>Resultado após 90 dias:</strong> OTIF subiu de 72% para 94%. Custo de retrabalho na expedicao caiu R$ 8.500/mes</li>
</ul></div>

<h3>Proximos passos após o curso</h3>
<p>Recomendamos continuar sua formação:</p>
<ul>
<li><strong>ISO 9001:2015 — Interpretacao dos Requisitos</strong> — se você vai implantar ou manter um SGQ</li>
<li><strong>Auditor Interno ISO 9001:2015</strong> — se você vai auditar processos</li>
<li><strong>5S na Prática Indústrial</strong> — se você quer comecar a mudança de cultura pelo basico</li>
</ul>

<div class="callout"><strong>Mensagem final:</strong> Gestão por processos não e um projeto com início, meio e fim. E uma FORMA DE TRABALHAR. O dia que você parar de olhar para os processos e indicadores, eles comecam a degradar. Faca da melhoria contínua um habito — e os resultados virao, consistentes e sustentaveis.</div>
`}, 'Plano de acao 90 dias preenchível')`;

  // ── QUIZ: Module quizzes + Final quiz ──

  // Module 1 quiz
  const m1q = [
    ['Qual e a definição de processo segundo a ISO 9000:2015?', ['Uma sequência de departamentos','Um conjunto de atividades inter-relacionadas que transforma entradas em saidas','Um documento que descreve uma tarefa','Uma funcao organizacional'], 1, 'A ISO 9000:2015 define processo como conjunto de atividades inter-relacionadas que útilizam entradas para entregar um resultado pretendido.'],
    ['Quais são os 3 tipos de processo em uma organização?', ['Primarios, secundarios e terciarios','Produtivos, administrativos e financeiros','Primarios, de apoio e gerênciais','Internos, externos e mistos'], 2, 'Os 3 tipos sao: primários (geram valor para o cliente), de apoio (suportam os primários) e gerênciais (direcionam e monitoram).'],
    ['O que significa a sigla SIPOC?', ['Sistema Integrado de Produção e Controle','Supplier, Input, Process, Output, Customer','Segurança, Indicadores, Processos, Organização, Cliente','Sequência, Inspeção, Padrao, Operação, Controle'], 1, 'SIPOC e o acronimo para Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saida), Customer (Cliente).'],
    ['Qual e a principal diferenca entre o SIPOC e o fluxograma?', ['O SIPOC e mais detalhado','O fluxograma mostra a visao macro e o SIPOC o detalhe','O SIPOC mostra a visao macro (5-7 etapas) e o fluxograma detalha passo a passo','Não há diferenca significativa'], 2, 'O SIPOC mostra a visao macro do processo (5-7 etapas), enquanto o fluxograma detalha cada passo, decisao e interação.'],
    ['O que e um fluxograma funcional (swimlane)?', ['Um fluxograma com cores diferentes','Um fluxograma dividido em raias por departamento ou funcao','Um fluxograma simplificado','Um fluxograma exclusivo para processos de RH'], 1, 'O fluxograma swimlane divide o processo em raias (lanes), cada uma representando um departamento ou funcao, tornando visível quem faz o que.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 2 quiz
  const m2q = [
    ['Qual e a diferenca entre eficacia e eficiência?', ['São sinonimos','Eficacia e atingir o resultado; eficiência e usar bem os recursos','Eficacia e financeira; eficiência e operacional','Eficiência e mais importante que eficacia'], 1, 'Eficacia mede se o resultado foi atingido. Eficiência mede se os recursos foram bem útilizados.'],
    ['O que e um indicador de tendência (leading)?', ['Um indicador que mede resultados passados','Um indicador que mede fatores que influenciam resultados futuros','Um indicador financeiro','Um indicador de satisfação do cliente'], 1, 'Indicadores leading medem fatores que influenciam o resultado futuro, permitindo agir antes que o problema apareca.'],
    ['Quantos elementos essenciais deve ter um KPI bem definido?', ['3','5','7','10'], 2, 'Um KPI precisa de 7 elementos: nome, formula, unidade, frequência, meta, fonte de dados e responsável.'],
    ['Qual e a principal funcao de um dashboard operacional?', ['Impressionar a diretoria com graficos bonitos','Mostrar indicadores de forma visual para fácilitar tomada de decisao rapida','Substituir reuniões de gestão','Atender requisito de auditoria ISO'], 1, 'O dashboard operacional torna indicadores visiveis para que operadores e supervisores tomem decisões rapidas.'],
    ['O BSC (Balanced Scorecard) tem quantas perspectivas?', ['2','3','4','6'], 2, 'O BSC tem 4 perspectivas: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 3 quiz
  const m3q = [
    ['O diagrama de Ishikawa também e conhecido como:', ['Diagrama de Pareto','Diagrama de dispersao','Espinha de peixe ou causa e efeito','Grafico de controle'], 2, 'O diagrama de Ishikawa também e chamado de espinha de peixe (pela forma) ou diagrama de causa e efeito (pela funcao).'],
    ['Quais são as 6 categorias classicas (6M) do Ishikawa?', ['Marketing, Mercado, Margem, Marca, Meta, Missao','Máquina, Método, Mao de obra, Material, Meio ambiente, Medição','Manual, Modelo, Matriz, Mapa, Meta, Monitoramento','Manutenção, Material, Mao de obra, Mercado, Método, Margem'], 1, 'Os 6M sao: Máquina, Método, Mao de obra, Material, Meio ambiente e Medição.'],
    ['O princípio de Pareto afirma que:', ['Todos os problemas tem o mesmo peso','100% dos problemas vem de 100% das causas','Aproximadamente 80% dos problemas vem de 20% das causas','50% dos problemas vem de 50% das causas'], 2, 'O princípio 80/20 de Pareto indica que cerca de 80% dos problemas são causados por 20% das causas.'],
    ['Na Matriz GUT, a letra T significa:', ['Tempo','Tarefa','Tendência','Tolerancia'], 2, 'T significa Tendência — avalia se o problema vai piorar com o tempo caso não seja tratado.'],
    ['O que o RPN (Risk Priority Number) do FMEA calcula?', ['Custo do risco','Severidade x Ocorrencia x Deteccao','Gravidade x Urgência x Tendência','Probabilidade x Impacto'], 1, 'O RPN e o produto de Severidade (S) x Ocorrencia (O) x Deteccao (D), usado para priorizar riscos no FMEA.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 4 quiz
  const m4q = [
    ['Qual e a sequência correta das 4 fases do PDCA?', ['Plan, Do, Control, Act','Plan, Do, Check, Act','Process, Define, Check, Adjust','Plan, Design, Check, Approve'], 1, 'PDCA significa Plan (Planejar), Do (Executar), Check (Verificar), Act (Agir).'],
    ['O relatório A3 recebe esse nome porque:', ['Tem 3 seções de análise','Usa uma folha no formato A3 para resumir todo o ciclo de resolucao','Foi criado na planta A3 da Toyota','Tem 3 paginas obrigatorias'], 1, 'O A3 recebe esse nome porque resume todo o ciclo de resolucao de problemas em uma unica folha no formato A3 (42x30cm).'],
    ['No 5W2H, o campo "Who" deve conter:', ['O nome do departamento responsável','O nome da pessoa responsável pela execução','O nome do gerente geral','O nome do auditor'], 1, 'O campo Who deve conter o nome da pessoa responsável, não do departamento. Se não tem nome, não tem dono.'],
    ['Qual a diferenca entre PDCA e SDCA?', ['SDCA e a versao digital do PDCA','PDCA melhora; SDCA mantem o padrão já conquistado','SDCA e usado apenas em serviços','Não há diferenca'], 1, 'PDCA e para melhorar (subir o nivel). SDCA (Standardize-Do-Check-Act) e para manter (nao deixar cair o padrão conquistado).'],
    ['Um evento Kaizen tipicamente dura:', ['1 dia','3 a 5 dias','2 semanas','1 mes'], 1, 'Um evento Kaizen (Kaizen Blitz) tipicamente dura de 3 a 5 dias com uma equipe dedicada.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 5 quiz
  const m5q = [
    ['Qual e a principal diferenca entre procedimento e instrucao de trabalho?', ['O procedimento e mais curto','O procedimento diz O QUE fazer; a instrucao de trabalho detalha COMO fazer','A instrucao de trabalho e para gestores e o procedimento para operadores','Não há diferenca prática'], 1, 'O procedimento define o que fazer e quem faz (visao geral). A instrucao de trabalho detalha como fazer, passo a passo (nivel operacional).'],
    ['Na ISO 9001:2015, o termo usado para documentos e registros e:', ['Manual da qualidade','Procedimento operacional padrão','Informação documentada','Arquivo de gestão'], 2, 'A ISO 9001:2015 usa o termo único "informação documentada" em substituicao a "documentos" e "registros" da versao anterior.'],
    ['Qual comportamento indica que a cultura de melhoria contínua esta viva?', ['O SGQ só e atualizado antes de auditorias','Problemas são reportados voluntariamente sem medo de punicao','Apenas o setor de qualidade se preocupa com melhorias','Os indicadores são medidos mas não discutidos'], 1, 'Quando as pessoas reportam problemas voluntariamente e sem medo de punicao, a cultura de melhoria contínua esta funcionando.'],
    ['Qual e a sequência recomendada no plano de 90 dias do curso?', ['Melhorar, medir, mapear','Medir, mapear, melhorar','Mapear, medir e analisar, melhorar e padronizar','Padronizar, medir, melhorar'], 2, 'A sequência lógica e: Fase 1 - Mapear (SIPOC e fluxograma), Fase 2 - Medir e analisar (KPIs e causa raiz), Fase 3 - Melhorar e padronizar.'],
    ['Qual a principal funcao da lista mestra de documentos?', ['Substituir os documentos originais','Listar todos os documentos do SGQ com versao, responsável e local de guarda','Servir como backup dos documentos','Atender exclusivamente a auditoria externa'], 1, 'A lista mestra e o índice centralizado que lista todos os documentos do SGQ com código, versao, data, responsável e local de guarda.'],
  ];
  for (const [p, a, r, e] of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m5.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (25 questions) ──
  const finalQ = [
    ['A ISO 9000:2015 define processo como:', ['Um departamento funcional','Um conjunto de atividades inter-relacionadas que transforma entradas em saidas','Uma norma de certificação','Um indicador de desempenho'], 1, 'Processo e um conjunto de atividades inter-relacionadas que útilizam entradas para entregar um resultado pretendido.'],
    ['Os processos de apoio (suporte) tem como funcao:', ['Gerar valor direto para o cliente externo','Suportar os processos primários','Substituir os processos gerênciais','Auditar os processos produtivos'], 1, 'Processos de apoio suportam os processos primários, como RH, TI, compras e manutenção.'],
    ['A cláusula 4.4 da ISO 9001:2015 exige que a organização:', ['Tenha um manual da qualidade','Determine os processos necessários para o SGQ e gerencie suas interações','Contrate consultoria de processos','Implemente software de BPM'], 1, 'A cláusula 4.4 exige determinar os processos, suas entradas, saidas, sequência, interação, critérios e recursos.'],
    ['No SIPOC, a letra "C" representa:', ['Controle','Custo','Customer (Cliente)','Competencia'], 2, 'C significa Customer (Cliente) — quem recebe as saidas do processo.'],
    ['Qual tipo de fluxograma e mais indicado para processos que cruzam departamentos?', ['Fluxograma linear','Fluxograma de decisao','Fluxograma funcional (swimlane)','Diagrama de blocos'], 2, 'O fluxograma swimlane divide o processo em raias por departamento, tornando visiveis as transferências e responsabilidades.'],
    ['A diferenca entre indicador lagging e leading e:', ['Lagging e financeiro; leading e operacional','Lagging mede resultado passado; leading mede fator que influencia resultado futuro','Lagging e estratégico; leading e operacional','Não há diferenca prática'], 1, 'Indicadores lagging medem resultados passados; leading medem fatores que influenciam resultados futuros.'],
    ['Um KPI bem definido precisa ter, entre outros elementos:', ['Apenas nome e meta','Formula, meta, frequência, fonte de dados e responsável','Apenas formula e unidade','Apenas meta e prazo'], 1, 'Um KPI completo inclui: nome, formula, unidade, frequência, meta, fonte de dados e responsável.'],
    ['O BSC (Balanced Scorecard) conecta:', ['Departamentos com fornecedores','Estrategia da empresa com indicadores operacionais do dia a dia','Normas ISO com legislacao','Auditoria interna com auditoria externa'], 1, 'O BSC traduz objetivos estratégicos em metas e indicadores operacionais para cada nivel da organização.'],
    ['As 4 perspectivas do BSC sao:', ['Produção, vendas, financeiro e RH','Financeira, clientes, processos internos e aprendizado e crescimento','Qualidade, custo, entrega e segurança','Estrategica, tatica, operacional e individual'], 1, 'As 4 perspectivas do BSC sao: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
    ['O diagrama de Ishikawa útiliza as categorias 6M. Quais sao?', ['Marketing, Mercado, Margem, Marca, Meta, Missao','Máquina, Método, Mao de obra, Material, Meio ambiente, Medição','Manutenção, Material, Método, Mao de obra, Modelo, Meta','Máquina, Manutenção, Mao de obra, Material, Modelo, Missao'], 1, 'Os 6M do Ishikawa sao: Máquina, Método, Mao de obra, Material, Meio ambiente e Medição.'],
    ['A técnica dos 5 Porques busca:', ['Identificar 5 problemas diferentes','Encontrar a causa raiz de um problema perguntando "por que?" repetidamente','Definir 5 metas para cada indicador','Eleger 5 prioridades de melhoria'], 1, 'Os 5 Porques aprofundam a investigacao perguntando "por que?" repetidamente até chegar a causa raiz.'],
    ['O Diagrama de Pareto e baseado no princípio:', ['60/40','70/30','80/20','90/10'], 2, 'O princípio de Pareto (80/20) afirma que aproximadamente 80% dos problemas vem de 20% das causas.'],
    ['Na Matriz GUT, como e calculada a prioridade?', ['G + U + T','G x U x T','(G + U) x T','G x (U + T)'], 1, 'A prioridade na Matriz GUT e calculada multiplicando Gravidade x Urgência x Tendência.'],
    ['O FMEA e uma ferramenta de natureza:', ['Reativa — analisa problemas que já ocorreram','Preventiva — analisa falhas potenciais antes que ocorram','Corretiva — define ações para problemas existentes','Descritiva — apenas documenta o processo'], 1, 'O FMEA e preventivo: identifica modos de falha potenciais e seus riscos antes que as falhas acontecam.'],
    ['No FMEA, o índice D (Deteccao) mede:', ['A duracao da falha','A dificuldade de resolver o problema','A capacidade de detectar a falha antes que chegue ao cliente','O custo da detecção'], 2, 'D (Deteccao) mede a probabilidade de o controle atual detectar a falha antes que ela alcance o cliente.'],
    ['A fase mais negligenciada do PDCA e geralmente:', ['Plan (Planejar)','Do (Executar)','Check (Verificar)','Act (Agir)'], 0, 'A fase Plan e a mais importante e a mais negligenciada. Sem planejamento adequado, as ações viram "apaga incendio".'],
    ['O relatório A3 segue a lógica de qual ciclo?', ['DMAIC','PDCA','BSC','FMEA'], 1, 'O A3 segue a lógica do PDCA: lado esquerdo (Plan), lado direito (Do/Check/Act).'],
    ['No 5W2H, a principal regra para o campo "Quem" e:', ['Deve conter o nome do departamento','Deve conter o nome da pessoa responsável, não do departamento','Deve conter o nome do diretor','Deve conter o nome do auditor'], 1, 'O campo "Quem" deve ter um nome de pessoa, não de departamento. Sem responsável definido, a acao não acontece.'],
    ['Qual e a diferenca fundamental entre Kaizen diario e evento Kaizen?', ['Kaizen diario custa mais','Kaizen diario são pequenas melhorias continuas; evento Kaizen e intensivo de 3-5 dias num processo específico','Evento Kaizen e feito por consultores externos','Não há diferenca prática'], 1, 'Kaizen diario são pequenas melhorias feitas no dia a dia por cada pessoa. Evento Kaizen e um projeto intensivo de 3-5 dias focado em um processo.'],
    ['A ISO 9001:2015 usa o termo "informação documentada" para substituir:', ['Manual e politica','Documentos e registros','Procedimentos e instruções','Formularios e checklists'], 1, 'A versao 2015 unificou "documentos" e "registros" no termo único "informação documentada".'],
    ['Qual e a funcao da lista mestra de documentos?', ['Substituir os documentos originais','Servir como índice centralizado de todos os documentos do SGQ com versao e responsável','Ser enviada ao organismo de certificação','Controlar o acesso dos funcionarios ao sistema'], 1, 'A lista mestra e o índice que centraliza todos os documentos do SGQ com código, versao, data e responsável.'],
    ['Num dashboard eficaz, qual e o número maximo recomendado de indicadores por tela?', ['3','5','7','15'], 2, 'A recomendação e de no maximo 7 indicadores por tela de dashboard para que sejam absorvidos efetivamente.'],
    ['A diferenca entre PDCA e SDCA e:', ['SDCA e a versao atualizada do PDCA','PDCA busca melhorar; SDCA busca manter o padrão conquistado','SDCA usa apenas 3 fases','PDCA e para qualidade; SDCA e para produção'], 1, 'PDCA e para melhorar (subir o nivel de desempenho). SDCA e para manter (padronizar e não deixar cair).'],
    ['No contexto de gestão visual, o princípio "torne os problemas visiveis" e atribuido a:', ['ISO 9001','Peter Drucker','Toyota','Henry Ford'], 2, 'O princípio de tornar problemas visiveis e parte da cultura Toyota e do Sistema Toyota de Produção (TPS).'],
    ['Qual e a sequência recomendada para resolver um problema usando as ferramentas do curso?', ['5W2H, depois Ishikawa, depois Pareto','Pareto para priorizar, Ishikawa/5 Porques para causa raiz, 5W2H para plano de acao','FMEA, depois A3, depois PDCA','Fluxograma, depois BSC, depois GUT'], 1, 'A sequência lógica e: Pareto (priorizar qual problema), Ishikawa/5 Porques (encontrar causa raiz), 5W2H (plano de acao concreto).'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
