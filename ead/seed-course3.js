export async function seedCourse3(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      'gestao-processos-indicadores',
      'Gestao de Processos e Indicadores',
      'Mapeie, meca e melhore seus processos com indicadores que geram resultado.',
      'Curso pratico de gestao por processos: mapeamento SIPOC e fluxograma, definicao de KPIs, dashboards, ferramentas de analise de causa raiz e melhoria continua aplicada.',
      '10 horas',
      297, 497,
      'Gestores, analistas de processos, coordenadores, empresarios',
      'Nenhum',
      'Capacitar o profissional a mapear processos, definir indicadores relevantes e implementar ciclos de melhoria continua na sua organizacao.',
      3
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos de Gestao por Processos ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos de Gestao por Processos', 'O que e um processo, abordagem ISO 9001, SIPOC e fluxogramas', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '1-1-o-que-e-processo', 'O que e um processo e por que gerenciar', '15 min', 1, ${`
<h2>O que e um processo?</h2>
<p>Um processo e um <strong>conjunto de atividades inter-relacionadas que transforma entradas em saidas</strong>, gerando valor para um cliente interno ou externo. Essa definicao, que parece simples, e a base de toda a gestao por processos — e ignorar ela e a raiz de grande parte da ineficiencia nas empresas brasileiras.</p>

<div class="callout"><strong>Definicao formal (ISO 9000:2015):</strong> "Conjunto de atividades inter-relacionadas ou interativas que utilizam entradas para entregar um resultado pretendido."</div>

<h3>Processo vs. departamento</h3>
<p>O erro mais comum e confundir <strong>processo</strong> com <strong>departamento</strong>. Um departamento e uma estrutura organizacional (financeiro, producao, comercial). Um processo <strong>atravessa departamentos</strong>.</p>

<div class="example"><strong>Exemplo — metalurgica de Caxias do Sul:</strong> O processo "Atendimento de pedido" comeca no comercial (recebe pedido), passa pelo PCP (programa producao), vai para a producao (fabrica a peca), passa pelo controle de qualidade (inspeciona), segue para a expedicao (embala e despacha) e termina no financeiro (fatura e cobra). Sao 6 departamentos envolvidos em UM processo.</div>

<h3>Os 3 tipos de processo</h3>
<table>
<tr><th>Tipo</th><th>Descricao</th><th>Exemplos</th></tr>
<tr><td><strong>Processos primarios (de negocio)</strong></td><td>Geram valor direto para o cliente externo</td><td>Vendas, producao, entrega, pos-venda</td></tr>
<tr><td><strong>Processos de apoio (suporte)</strong></td><td>Suportam os processos primarios</td><td>RH, TI, compras, manutencao, financeiro</td></tr>
<tr><td><strong>Processos gerenciais</strong></td><td>Direcionam e monitoram os demais</td><td>Planejamento estrategico, gestao da qualidade, analise critica</td></tr>
</table>

<h3>Por que gerenciar processos?</h3>
<p>Quando voce <strong>nao</strong> gerencia processos, cada departamento otimiza seu pedaco sem ver o todo. O resultado sao as disfuncoes classicas:</p>
<ul>
<li><strong>Retrabalho invisivel:</strong> A producao refaz pecas que o comercial prometeu com especificacao errada</li>
<li><strong>Gargalos:</strong> O PCP programa 200 pecas/dia, mas a pintura so processa 120 — e ninguem mapeia isso</li>
<li><strong>Culpa cruzada:</strong> "O problema nao e do meu setor" — porque ninguem e dono do processo ponta a ponta</li>
<li><strong>Perda de conhecimento:</strong> O operador mais experiente sai e leva o "jeito certo" na cabeca</li>
</ul>

<div class="callout"><strong>Dado real:</strong> Uma pesquisa da ABPMP Brasil (2023) com 450 empresas mostrou que organizacoes com gestao por processos formalizada reduziram custos operacionais em media 18% e tempo de ciclo em 25% em 2 anos.</div>

<h3>Cadeia de valor</h3>
<p>Todos os processos de uma organizacao formam a <strong>cadeia de valor</strong>. A visao da cadeia de valor (conceito de Michael Porter) ajuda a enxergar onde esta o valor real e onde esta o desperdicio. A ideia e simples: se uma atividade nao agrega valor para o cliente final e tambem nao e necessaria para suportar quem agrega valor, ela e candidata a eliminacao.</p>

<div class="example"><strong>Na pratica — cooperativa agricola do Parana:</strong> Ao mapear a cadeia de valor do processo "recebimento de graos", a cooperativa descobriu que o agricultor esperava em media 3,2 horas na fila de classificacao. Ao redesenhar o processo com agendamento previo e classificacao rapida, reduziu para 45 minutos — aumentando a satisfacao e o volume recebido em 30%.</div>

<h3>A mentalidade de processo</h3>
<p>Gerenciar por processos exige uma mudanca de mentalidade: sair do <strong>"quem faz"</strong> para o <strong>"como flui"</strong>. Em vez de perguntar "de quem e a culpa?", perguntar "onde o processo falhou?". Em vez de "como meu setor pode ser mais eficiente?", perguntar "como o fluxo ponta a ponta pode ser melhor para o cliente?".</p>
`}, NULL),

  (${m1.id}, '1-2-abordagem-processos-iso-9001', 'Abordagem de processos na ISO 9001', '15 min', 2, ${`
<h2>Abordagem de processos na ISO 9001</h2>
<p>A ISO 9001:2015 faz da abordagem de processos um dos <strong>pilares centrais</strong> do Sistema de Gestao da Qualidade. A clausula 4.4 exige explicitamente que a organizacao determine os processos necessarios para o SGQ e gerencie suas interacoes.</p>

<div class="callout"><strong>O que a norma diz (clausula 4.4.1):</strong> "A organizacao deve determinar os processos necessarios para o SGQ e sua aplicacao na organizacao, e deve: (a) determinar as entradas requeridas e as saidas esperadas; (b) determinar a sequencia e interacao desses processos; (c) determinar criterios e metodos necessarios para assegurar a operacao e controle eficazes; (d) determinar os recursos necessarios..."</div>

<h3>O modelo de processo ISO 9001</h3>
<p>A ISO 9001 enxerga a organizacao como uma rede de processos inter-relacionados. Cada processo tem:</p>
<table>
<tr><th>Elemento</th><th>O que e</th><th>Exemplo (usinagem)</th></tr>
<tr><td><strong>Entrada</strong></td><td>O que inicia ou alimenta o processo</td><td>Materia-prima (barra de aco), desenho tecnico, ordem de producao</td></tr>
<tr><td><strong>Atividades</strong></td><td>Transformacao que agrega valor</td><td>Corte, torneamento, fresamento, acabamento</td></tr>
<tr><td><strong>Saida</strong></td><td>Resultado do processo</td><td>Peca usinada conforme especificacao</td></tr>
<tr><td><strong>Recursos</strong></td><td>O que e necessario para executar</td><td>Torno CNC, operador qualificado, refrigerante de corte</td></tr>
<tr><td><strong>Controles</strong></td><td>Como garantir que funciona</td><td>Instrucao de trabalho, controle dimensional, indicadores</td></tr>
<tr><td><strong>Responsavel</strong></td><td>Dono do processo</td><td>Supervisor de usinagem</td></tr>
</table>

<h3>A "tartaruga" de processo</h3>
<p>Uma das ferramentas mais usadas para atender a clausula 4.4 e o <strong>diagrama tartaruga</strong>. Ele organiza visualmente os 6 elementos de cada processo:</p>

<div class="template-box">
<strong>Template: Diagrama Tartaruga</strong>
<table>
<tr><td colspan="3" style="text-align:center"><strong>COM O QUE? (Recursos materiais)</strong><br>Equipamentos, maquinas, ferramentas, software</td></tr>
<tr><td><strong>ENTRADA</strong><br>- Materiais<br>- Informacoes<br>- Requisitos</td><td style="text-align:center"><strong>PROCESSO</strong><br>[Nome do processo]<br>Atividades principais</td><td><strong>SAIDA</strong><br>- Produtos<br>- Servicos<br>- Registros</td></tr>
<tr><td colspan="3" style="text-align:center"><strong>COM QUEM? (Recursos humanos)</strong><br>Competencias, funcoes, quantidade</td></tr>
<tr><td colspan="3" style="text-align:center"><strong>COMO? (Metodos/procedimentos)</strong> | <strong>QUANTO? (Indicadores)</strong></td></tr>
</table>
</div>

<h3>Hierarquia de processos</h3>
<p>Processos podem ser decompostos em niveis de detalhe:</p>
<ul>
<li><strong>Macroprocesso:</strong> Producao</li>
<li><strong>Processo:</strong> Usinagem de pecas</li>
<li><strong>Subprocesso:</strong> Torneamento</li>
<li><strong>Atividade:</strong> Setup da maquina</li>
<li><strong>Tarefa:</strong> Fixar ferramenta no porta-ferramenta</li>
</ul>

<div class="example"><strong>Exemplo — construtora de Chapeco (SC):</strong> A construtora mapeou 4 macroprocessos (Incorporacao, Projeto, Obra, Pos-obra), 18 processos e 62 subprocessos. A simples visualizacao da interacao entre eles revelou 11 pontos de retrabalho — a maioria na interface entre Projeto e Obra, onde informacoes chegavam incompletas ao mestre de obras.</div>

<h3>O PDCA dentro de cada processo</h3>
<p>A ISO 9001 espera que cada processo funcione como um mini-PDCA:</p>
<ul>
<li><strong>Plan:</strong> Definir objetivo do processo, entradas esperadas, criterios de controle</li>
<li><strong>Do:</strong> Executar o processo conforme planejado</li>
<li><strong>Check:</strong> Monitorar indicadores, verificar saidas</li>
<li><strong>Act:</strong> Corrigir desvios, melhorar o processo</li>
</ul>

<div class="callout"><strong>Dica de auditoria:</strong> Quando o auditor avalia a clausula 4.4, ele quer ver: (1) que voce sabe quais sao seus processos, (2) que voce sabe como eles interagem, (3) que voce tem criterios para controla-los, e (4) que voce mede se estao funcionando. Nao precisa de software caro — um mapa de processos no PowerPoint e diagramas tartaruga ja atendem.</div>
`}, 'Diagrama tartaruga preenchido'),

  (${m1.id}, '1-3-mapeamento-sipoc', 'Mapeamento com SIPOC', '15 min', 3, ${`
<h2>Mapeamento com SIPOC</h2>
<p>O SIPOC e uma das ferramentas mais poderosas e simples para <strong>mapear um processo de forma rapida</strong>. O nome e um acronimo que descreve os 5 elementos do processo: <strong>Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saida), Customer (Cliente)</strong>.</p>

<div class="callout"><strong>Quando usar SIPOC:</strong> No inicio de qualquer projeto de melhoria, ao documentar processos para ISO 9001, ao integrar novos colaboradores que precisam entender o processo, ou sempre que houver confusao sobre "onde comeca e onde termina" um processo.</div>

<h3>Os 5 elementos do SIPOC</h3>
<table>
<tr><th>Letra</th><th>Significado</th><th>Pergunta-chave</th></tr>
<tr><td><strong>S</strong></td><td>Suppliers (Fornecedores)</td><td>Quem fornece as entradas do processo?</td></tr>
<tr><td><strong>I</strong></td><td>Inputs (Entradas)</td><td>O que o processo recebe para funcionar?</td></tr>
<tr><td><strong>P</strong></td><td>Process (Processo)</td><td>Quais sao as 5 a 7 etapas principais?</td></tr>
<tr><td><strong>O</strong></td><td>Outputs (Saidas)</td><td>O que o processo entrega?</td></tr>
<tr><td><strong>C</strong></td><td>Customers (Clientes)</td><td>Quem recebe as saidas?</td></tr>
</table>

<h3>Como construir um SIPOC — passo a passo</h3>
<ol>
<li><strong>Comece pelo P (Processo):</strong> Descreva as etapas macro (5 a 7 passos, nao mais). Comece com um verbo de acao.</li>
<li><strong>Defina O (Saidas):</strong> O que cada etapa entrega? Qual e o resultado final?</li>
<li><strong>Defina C (Clientes):</strong> Quem recebe essas saidas? (Pode ser interno ou externo)</li>
<li><strong>Defina I (Entradas):</strong> O que e necessario para iniciar cada etapa?</li>
<li><strong>Defina S (Fornecedores):</strong> Quem fornece essas entradas?</li>
</ol>

<div class="template-box">
<strong>Template SIPOC — Processo de compras (industria alimenticia)</strong>
<table>
<tr><th>S - Fornecedor</th><th>I - Entrada</th><th>P - Processo</th><th>O - Saida</th><th>C - Cliente</th></tr>
<tr><td>Producao / PCP</td><td>Requisicao de compra</td><td>1. Receber requisicao</td><td>Pedido de compra emitido</td><td>Fornecedor externo</td></tr>
<tr><td>Cadastro de fornecedores</td><td>Lista de fornecedores aprovados</td><td>2. Cotar com fornecedores</td><td>Mapa de cotacao</td><td>Gerente (aprovacao)</td></tr>
<tr><td>Financeiro</td><td>Orcamento disponivel</td><td>3. Aprovar compra</td><td>Pedido aprovado</td><td>Compras</td></tr>
<tr><td>Fornecedor externo</td><td>Proposta comercial</td><td>4. Emitir pedido de compra</td><td>Pedido enviado ao fornecedor</td><td>Fornecedor externo</td></tr>
<tr><td>Fornecedor externo</td><td>Material + nota fiscal</td><td>5. Receber material</td><td>Material inspecionado e liberado</td><td>Almoxarifado / Producao</td></tr>
<tr><td>Qualidade</td><td>Criterios de inspecao</td><td>6. Inspecionar recebimento</td><td>Laudo de inspecao</td><td>Compras / Producao</td></tr>
</table>
</div>

<h3>SIPOC na pratica industrial</h3>

<div class="example"><strong>Exemplo — metalurgica de Joinville (SC):</strong> A equipe de qualidade mapeou o SIPOC do processo de "Tratamento termico de engrenagens". Descobriram que a entrada "especificacao de dureza" vinha do projeto, mas em 30% dos casos chegava por e-mail informal (sem registro). O SIPOC tornou visivel essa fragilidade. Solucao: criar formulario padrao de requisicao de tratamento termico com campo obrigatorio de dureza, vinculado a ordem de producao.</div>

<h3>Erros comuns no SIPOC</h3>
<ul>
<li><strong>Detalhar demais:</strong> O SIPOC e macro — se voce tem mais de 8 etapas no P, esta detalhando demais. Use fluxograma para o detalhe.</li>
<li><strong>Esquecer clientes internos:</strong> O "cliente" no SIPOC nao e so o cliente final. E quem recebe a saida de cada etapa — frequentemente e outro departamento.</li>
<li><strong>Pular fornecedores internos:</strong> O PCP que fornece a ordem de producao e um fornecedor tao importante quanto o fornecedor externo de materia-prima.</li>
<li><strong>Nao validar com quem faz:</strong> Um SIPOC feito pelo gerente na sala dele, sem ouvir o operador, vai estar errado. Sempre valide no chao de fabrica.</li>
</ul>

<div class="callout"><strong>Regra de ouro:</strong> O SIPOC e o "mapa do tesouro" — mostra o caminho geral. O fluxograma (proxima aula) e o "passo a passo detalhado" de cada etapa. Use os dois em conjunto.</div>
`}, 'Template SIPOC preenchivel'),

  (${m1.id}, '1-4-fluxograma-processo', 'Fluxograma de processo detalhado', '15 min', 4, ${`
<h2>Fluxograma de processo detalhado</h2>
<p>O fluxograma e a <strong>representacao grafica passo a passo</strong> de um processo. Enquanto o SIPOC mostra a visao macro (5-7 etapas), o fluxograma detalha cada decisao, acao e interacao dentro do processo.</p>

<h3>Simbolos padrao do fluxograma</h3>
<table>
<tr><th>Simbolo</th><th>Nome</th><th>Significado</th></tr>
<tr><td>Oval</td><td>Terminador</td><td>Inicio ou fim do processo</td></tr>
<tr><td>Retangulo</td><td>Atividade</td><td>Uma acao ou tarefa</td></tr>
<tr><td>Losango</td><td>Decisao</td><td>Ponto de decisao (sim/nao)</td></tr>
<tr><td>Paralelogramo</td><td>Documento</td><td>Documento gerado ou usado</td></tr>
<tr><td>Seta</td><td>Fluxo</td><td>Direcao do processo</td></tr>
<tr><td>Retangulo ondulado</td><td>Espera/atraso</td><td>Ponto de espera ou fila</td></tr>
</table>

<h3>Tipos de fluxograma</h3>
<ul>
<li><strong>Fluxograma simples (linear):</strong> Uma unica sequencia de atividades, sem raias. Bom para processos simples ou instrucoes de trabalho.</li>
<li><strong>Fluxograma funcional (swimlane):</strong> Divide o processo em raias (lanes), cada uma representando um departamento ou funcao. Ideal para processos que cruzam departamentos.</li>
<li><strong>Fluxograma de decisao:</strong> Focado nas ramificacoes — multiplos caminhos dependendo de condicoes. Usado para processos com muitas verificacoes.</li>
</ul>

<div class="callout"><strong>Recomendacao:</strong> Para gestao por processos e ISO 9001, o fluxograma funcional (swimlane) e o mais util, porque torna visivel <strong>quem faz o que</strong> e onde ocorrem as transferencias entre departamentos.</div>

<h3>Como construir um fluxograma — passo a passo</h3>
<ol>
<li><strong>Defina o escopo:</strong> Onde o processo comeca e onde termina? (Use o SIPOC como referencia)</li>
<li><strong>Liste as etapas:</strong> Reuna as pessoas que executam o processo e liste TODAS as etapas que acontecem na pratica (nao o que deveria acontecer)</li>
<li><strong>Identifique decisoes:</strong> Onde existem pontos de sim/nao? Onde o fluxo se ramifica?</li>
<li><strong>Organize em raias:</strong> Atribua cada atividade ao departamento/funcao responsavel</li>
<li><strong>Valide no gemba:</strong> Va ao local onde o processo acontece e confirme se o fluxograma reflete a realidade</li>
<li><strong>Identifique problemas:</strong> Marque retrabalhos, esperas, gargalos e handoffs desnecessarios</li>
</ol>

<div class="example"><strong>Exemplo — industria alimenticia de Maringa (PR):</strong> Ao mapear o fluxograma do processo de "Liberacao de lote de alimento enlatado", a equipe descobriu que o laudo de analise microbiologica levava 5 dias, e durante esse periodo 100% dos lotes ficavam em quarentena ocupando 40% do armazem. Com o fluxograma visivel, a diretoria aprovou investimento em analise rapida (PCR), reduzindo o tempo de liberacao para 8 horas e liberando espaco no armazem para mais 2 turnos de producao.</div>

<h3>Fluxograma do estado atual vs. estado futuro</h3>
<p>Uma pratica poderosa e mapear <strong>dois fluxogramas</strong>:</p>
<table>
<tr><th>Aspecto</th><th>Estado Atual (AS-IS)</th><th>Estado Futuro (TO-BE)</th></tr>
<tr><td>O que mostra</td><td>Como o processo funciona HOJE, na realidade</td><td>Como o processo DEVERIA funcionar apos a melhoria</td></tr>
<tr><td>Para que serve</td><td>Identificar desperdicio, retrabalho, gargalos</td><td>Servir como meta e guia para implementacao</td></tr>
<tr><td>Quem participa</td><td>Equipe operacional que executa o processo</td><td>Equipe operacional + gestores + especialistas</td></tr>
</table>

<div class="template-box">
<strong>Checklist para validacao do fluxograma</strong>
<ul>
<li>Cada atividade comeca com verbo no infinitivo? (Receber, inspecionar, aprovar...)</li>
<li>Toda decisao tem pelo menos duas saidas (sim/nao)?</li>
<li>O processo tem inicio e fim claramente definidos?</li>
<li>As raias correspondem as funcoes reais (nao apenas aos departamentos no organograma)?</li>
<li>Foi validado com quem EXECUTA o processo (nao apenas com quem GERENCIA)?</li>
<li>Os handoffs entre departamentos estao marcados?</li>
<li>Os documentos/registros gerados estao indicados?</li>
</ul>
</div>

<div class="callout"><strong>Ferramentas recomendadas:</strong> Para mapeamento simples, Lucidchart, Draw.io (gratuito) ou Bizagi Modeler (gratuito). Para BPM formal, Bizagi ou Heflo. Em muitas auditorias ISO, um fluxograma bem feito no PowerPoint ja atende perfeitamente.</div>
`}, 'Fluxograma swimlane modelo')`;

  // ── Module 2: Indicadores de Desempenho (KPIs) ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Indicadores de Desempenho (KPIs)', 'Definicao, medicao, dashboards e desdobramento de indicadores', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-1-o-que-medir', 'O que medir e por que — eficacia, eficiencia, efetividade', '15 min', 1, ${`
<h2>O que medir e por que</h2>
<p>"O que nao se mede, nao se gerencia." A frase, atribuida a Peter Drucker e a Edwards Deming, resume o principio: <strong>indicadores sao o instrumento que transforma gestao de achismo em gestao baseada em evidencia</strong>. A ISO 9001:2015 (clausula 9.1) exige que a organizacao monitore, meca, analise e avalie o desempenho dos seus processos.</p>

<h3>Os 3 Es: eficacia, eficiencia e efetividade</h3>
<p>Antes de definir indicadores, e fundamental entender tres conceitos que sao frequentemente confundidos:</p>
<table>
<tr><th>Conceito</th><th>Pergunta que responde</th><th>Exemplo (processo de entrega)</th></tr>
<tr><td><strong>Eficacia</strong></td><td>Atingimos o resultado?</td><td>98% dos pedidos entregues no prazo</td></tr>
<tr><td><strong>Eficiencia</strong></td><td>Usamos bem os recursos?</td><td>Custo de entrega de R$ 12 por pedido (meta: R$ 15)</td></tr>
<tr><td><strong>Efetividade</strong></td><td>Gerou o impacto desejado?</td><td>Satisfacao do cliente com entrega subiu de 7,2 para 9,1</td></tr>
</table>

<div class="callout"><strong>Ponto-chave:</strong> Voce pode ser eficaz sem ser eficiente (entregar no prazo, mas gastando o dobro). Pode ser eficiente sem ser eficaz (gastar pouco, mas atrasar). A meta e ser os tres — e isso so e possivel medindo.</div>

<h3>Tipos de indicadores</h3>
<p>Indicadores podem ser classificados de diversas formas. As mais uteis na pratica:</p>

<h3>Por natureza</h3>
<ul>
<li><strong>Indicadores de resultado (lagging):</strong> Medem o que ja aconteceu. Ex: faturamento mensal, indice de reclamacoes, refugo acumulado.</li>
<li><strong>Indicadores de tendencia (leading):</strong> Medem o que influencia o resultado futuro. Ex: horas de treinamento, numero de propostas enviadas, indice de manutencao preventiva realizada.</li>
</ul>

<div class="example"><strong>Exemplo — construtora de Goiania:</strong> O indicador "numero de unidades entregues" e de resultado (lagging). O indicador "percentual de etapas concluidas no cronograma" e de tendencia (leading). Se as etapas atrasam, a entrega vai atrasar — o leading avisa antes.</div>

<h3>Por dimensao</h3>
<table>
<tr><th>Dimensao</th><th>O que mede</th><th>Exemplo industrial</th></tr>
<tr><td>Qualidade</td><td>Conformidade do produto/servico</td><td>PPM (pecas defeituosas por milhao), indice de rejeicao</td></tr>
<tr><td>Produtividade</td><td>Relacao entre producao e recursos</td><td>Pecas/hora/operador, OEE</td></tr>
<tr><td>Custo</td><td>Eficiencia financeira</td><td>Custo por unidade produzida, custo da nao-qualidade</td></tr>
<tr><td>Entrega</td><td>Pontualidade e confiabilidade</td><td>OTIF (On Time In Full), lead time medio</td></tr>
<tr><td>Seguranca</td><td>Protecao das pessoas</td><td>Taxa de frequencia de acidentes, dias sem acidente</td></tr>
<tr><td>Moral/Pessoas</td><td>Engajamento da equipe</td><td>Absenteismo, turnover, horas de treinamento</td></tr>
</table>

<h3>A armadilha dos indicadores de vaidade</h3>
<p>Indicadores de vaidade sao numeros que parecem bons mas nao levam a acao. O perigo e medir muita coisa e agir sobre nada.</p>
<ul>
<li><strong>Ruim:</strong> "Produzimos 50.000 pecas este mes" (sem contexto de meta, capacidade ou refugo)</li>
<li><strong>Bom:</strong> "Produzimos 50.000 pecas vs. meta de 55.000 (91%), com 2,1% de refugo vs. meta de 1,5%"</li>
</ul>

<div class="callout"><strong>Regra pratica:</strong> Se voce olha um indicador e nao sabe que acao tomar, ele e de vaidade. Um bom indicador provoca acao quando esta fora da meta.</div>
`}, NULL),

  (${m2.id}, '2-2-definindo-indicadores', 'Definindo indicadores: formula, meta, frequencia', '15 min', 2, ${`
<h2>Definindo indicadores: formula, meta, frequencia</h2>
<p>Um indicador so funciona se for <strong>bem definido</strong>. A diferenca entre "medir o refugo" (vago) e ter um KPI funcional e a definicao rigorosa de 7 elementos essenciais.</p>

<h3>Os 7 elementos de um KPI bem definido</h3>
<table>
<tr><th>Elemento</th><th>Descricao</th><th>Exemplo</th></tr>
<tr><td><strong>Nome</strong></td><td>Claro e sem ambiguidade</td><td>Indice de refugo de usinagem</td></tr>
<tr><td><strong>Formula</strong></td><td>Como calcular, exatamente</td><td>(Pecas rejeitadas / Total produzido) x 100</td></tr>
<tr><td><strong>Unidade</strong></td><td>Percentual, R$, horas, unidades</td><td>%</td></tr>
<tr><td><strong>Frequencia</strong></td><td>Com que periodicidade medir</td><td>Semanal</td></tr>
<tr><td><strong>Meta</strong></td><td>Valor desejado</td><td>Maximo 1,5%</td></tr>
<tr><td><strong>Fonte de dados</strong></td><td>De onde vem o numero</td><td>Sistema ERP — modulo de producao</td></tr>
<tr><td><strong>Responsavel</strong></td><td>Quem coleta, analisa e atua</td><td>Supervisor de usinagem</td></tr>
</table>

<div class="template-box">
<strong>Template: Ficha de Indicador (KPI Card)</strong>
<table>
<tr><td><strong>Indicador:</strong></td><td>[Nome do indicador]</td></tr>
<tr><td><strong>Processo:</strong></td><td>[Nome do processo ao qual pertence]</td></tr>
<tr><td><strong>Objetivo:</strong></td><td>[O que este indicador pretende monitorar]</td></tr>
<tr><td><strong>Formula:</strong></td><td>[Numerador / Denominador x 100] ou [descricao do calculo]</td></tr>
<tr><td><strong>Unidade:</strong></td><td>[%, R$, unidades, horas, dias...]</td></tr>
<tr><td><strong>Frequencia:</strong></td><td>[Diaria / Semanal / Mensal / Trimestral]</td></tr>
<tr><td><strong>Meta:</strong></td><td>[Valor alvo + tolerancia]</td></tr>
<tr><td><strong>Polaridade:</strong></td><td>[Quanto maior melhor / Quanto menor melhor]</td></tr>
<tr><td><strong>Fonte de dados:</strong></td><td>[ERP, planilha, sistema, medicao manual...]</td></tr>
<tr><td><strong>Responsavel pela coleta:</strong></td><td>[Nome / funcao]</td></tr>
<tr><td><strong>Responsavel pela analise:</strong></td><td>[Nome / funcao]</td></tr>
</table>
</div>

<h3>Como definir metas</h3>
<p>Metas devem seguir a logica <strong>SMART</strong>: Especificas, Mensuraveis, Atingiveis, Relevantes e Temporais. Na pratica industrial:</p>
<ul>
<li><strong>Historico:</strong> Analise os ultimos 12 meses. Se o refugo medio foi 3,2%, uma meta de 2,5% e desafiadora mas atingivel.</li>
<li><strong>Benchmark:</strong> Compare com empresas do mesmo setor. O indice medio de refugo em metalurgicas brasileiras gira em torno de 2-3%.</li>
<li><strong>Requisito do cliente:</strong> Se o cliente exige PPM abaixo de 500, sua meta interna deve ser mais apertada (ex: PPM 300).</li>
<li><strong>Capacidade do processo:</strong> Se o Cpk do seu processo e 1,0, voce nao vai atingir refugo zero — precisa primeiro melhorar o processo.</li>
</ul>

<div class="example"><strong>Exemplo — cooperativa agricola do Rio Grande do Sul:</strong> A cooperativa definiu o KPI "Tempo medio de classificacao de graos" com formula = (tempo total de classificacao no dia / numero de cargas classificadas). Historico: 45 min/carga. Meta: 30 min/carga. Frequencia: diaria. Fonte: sistema de balanca. Responsavel: gerente de recebimento. Em 6 meses, atingiram 28 min/carga com agendamento e balanca automatizada.</div>

<h3>Frequencia de medicao: como escolher</h3>
<table>
<tr><th>Frequencia</th><th>Quando usar</th><th>Exemplos</th></tr>
<tr><td>Diaria/por turno</td><td>Processos criticos, alta variabilidade</td><td>OEE, refugo, producao, seguranca</td></tr>
<tr><td>Semanal</td><td>Processos com ciclo semanal</td><td>Backlog de manutencao, horas extras</td></tr>
<tr><td>Mensal</td><td>Indicadores agregados, financeiros</td><td>Faturamento, custo da qualidade, turnover</td></tr>
<tr><td>Trimestral</td><td>Indicadores estrategicos</td><td>Satisfacao do cliente, market share</td></tr>
</table>

<div class="callout"><strong>Regra pratica:</strong> Meca na frequencia que permite agir. Se voce so mede o refugo mensalmente, quando perceber que esta alto, ja perdeu 30 dias de producao com problema. Se mede diariamente, age no dia seguinte.</div>
`}, 'Ficha de indicador (KPI Card)'),

  (${m2.id}, '2-3-dashboards-gestao-visual', 'Dashboards e gestao visual de indicadores', '15 min', 3, ${`
<h2>Dashboards e gestao visual de indicadores</h2>
<p>Indicadores que ficam escondidos em planilhas nao geram acao. A <strong>gestao visual</strong> e o principio de tornar a informacao <strong>visivel, imediata e compreensivel</strong> para quem precisa tomar decisao — do operador ao diretor.</p>

<h3>O que e gestao visual</h3>
<p>Gestao visual e usar recursos graficos para comunicar informacoes de desempenho de forma que qualquer pessoa entenda em <strong>menos de 5 segundos</strong>. Exemplos classicos:</p>
<ul>
<li>Semaforo (verde/amarelo/vermelho) para status de indicadores</li>
<li>Grafico de tendencia na parede do chao de fabrica</li>
<li>Quadro de producao atualizado a cada turno</li>
<li>Dashboard digital em TV na area de gestao</li>
</ul>

<div class="callout"><strong>Principio Toyota:</strong> "Torne os problemas visiveis." Se o indicador esta vermelho e todo mundo ve, a pressao natural para resolver e muito maior do que se o numero esta numa celula de planilha que so o gerente acessa.</div>

<h3>Tipos de dashboard</h3>
<table>
<tr><th>Tipo</th><th>Publico</th><th>Conteudo</th><th>Frequencia de atualizacao</th></tr>
<tr><td><strong>Operacional</strong></td><td>Operadores, supervisores</td><td>Producao, refugo, paradas, seguranca do turno</td><td>Tempo real ou por turno</td></tr>
<tr><td><strong>Tatico</strong></td><td>Gerentes, coordenadores</td><td>Indicadores de processo, tendencias, planos de acao</td><td>Semanal ou mensal</td></tr>
<tr><td><strong>Estrategico</strong></td><td>Diretoria</td><td>KPIs do negocio, BSC, resultados financeiros</td><td>Mensal ou trimestral</td></tr>
</table>

<h3>Elementos de um bom dashboard</h3>
<p>Um dashboard eficaz segue regras simples:</p>
<ol>
<li><strong>Maximo 7 indicadores por tela:</strong> Mais do que isso, ninguem absorve</li>
<li><strong>Codificacao por cor:</strong> Verde (dentro da meta), amarelo (proximo do limite), vermelho (fora da meta)</li>
<li><strong>Tendencia visivel:</strong> Nao mostre so o numero atual — mostre a evolucao (grafico de linha)</li>
<li><strong>Meta explicita:</strong> Sempre mostre a meta junto do resultado real</li>
<li><strong>Periodo claro:</strong> "Refugo de usinagem — Junho 2025" e nao apenas "Refugo"</li>
<li><strong>Responsavel visivel:</strong> Quem e o dono do indicador?</li>
</ol>

<div class="example"><strong>Exemplo — metalurgica de Bento Goncalves (RS):</strong> A empresa instalou uma TV de 55 polegadas na entrada do chao de fabrica com dashboard operacional mostrando: OEE do dia, refugo acumulado, pedidos atrasados e dias sem acidente. O efeito psicologico foi imediato: quando o OEE caia abaixo de 70%, os proprios operadores chamavam a manutencao sem esperar o supervisor pedir. Em 3 meses, o OEE medio subiu de 68% para 79%.</div>

<h3>Gestao visual no chao de fabrica</h3>
<p>Nem todo dashboard precisa ser digital. Quadros brancos, quadros kanban e graficos manuais sao igualmente eficazes:</p>

<div class="template-box">
<strong>Template: Quadro de Gestao Visual Diaria</strong>
<table>
<tr><th>Item</th><th>Meta</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>
<tr><td>Producao (pecas)</td><td>500</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Refugo (%)</td><td>1,5%</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Paradas (min)</td><td>30</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Seguranca</td><td>0 acidentes</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>Absenteismo</td><td>3%</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
<p><em>Pintar verde se atingiu meta, vermelho se nao atingiu. Reuniao de 10 minutos no inicio do turno para analisar.</em></p>
</div>

<h3>Reunioes de indicadores</h3>
<p>O dashboard so gera resultado se for <strong>discutido regularmente</strong>:</p>
<ul>
<li><strong>Reuniao diaria (10 min):</strong> No chao de fabrica, em frente ao quadro. Foco: o que aconteceu ontem, o que vamos fazer hoje, quais impedimentos.</li>
<li><strong>Reuniao semanal (30 min):</strong> Nivel gerencial. Foco: tendencias da semana, acoes pendentes, necessidade de recursos.</li>
<li><strong>Reuniao mensal (60 min):</strong> Nivel diretoria. Foco: analise critica dos KPIs, decisoes estrategicas, investimentos.</li>
</ul>

<div class="callout"><strong>Dica:</strong> A reuniao nao e para "apresentar numeros bonitos". E para <strong>tomar decisoes sobre os numeros vermelhos</strong>. Se todos os indicadores estao verdes e a reuniao dura 5 minutos, otimo. Se ha vermelhos e ninguem propoe acao, a reuniao falhou.</div>
`}, 'Modelo de dashboard operacional'),

  (${m2.id}, '2-4-desdobramento-bsc', 'Desdobramento de objetivos em indicadores (BSC)', '15 min', 4, ${`
<h2>Desdobramento de objetivos em indicadores (BSC)</h2>
<p>O <strong>Balanced Scorecard (BSC)</strong> e uma metodologia criada por Kaplan e Norton nos anos 1990 que resolve um problema classico: <strong>como conectar a estrategia da empresa com os indicadores do dia a dia</strong>. Sem essa conexao, os indicadores operacionais ficam soltos — voce mede refugo, OEE e entrega, mas nao sabe se isso esta contribuindo para os objetivos estrategicos.</p>

<h3>As 4 perspectivas do BSC</h3>
<table>
<tr><th>Perspectiva</th><th>Pergunta central</th><th>Exemplos de indicadores</th></tr>
<tr><td><strong>Financeira</strong></td><td>Como estamos para os acionistas?</td><td>Faturamento, margem liquida, ROI, custo da nao-qualidade</td></tr>
<tr><td><strong>Clientes</strong></td><td>Como os clientes nos veem?</td><td>Satisfacao, retencao, OTIF, reclamacoes, NPS</td></tr>
<tr><td><strong>Processos Internos</strong></td><td>Em que devemos ser excelentes?</td><td>OEE, refugo, lead time, produtividade, PPM</td></tr>
<tr><td><strong>Aprendizado e Crescimento</strong></td><td>Como sustentar a capacidade de mudar?</td><td>Horas de treinamento, turnover, projetos de melhoria, competencias</td></tr>
</table>

<div class="callout"><strong>A logica do BSC:</strong> Se investimos em pessoas e conhecimento (Aprendizado) → nossos processos melhoram (Processos) → atendemos melhor os clientes (Clientes) → geramos mais resultado financeiro (Financeira). E uma cadeia de causa e efeito.</div>

<h3>Desdobramento: da estrategia ao chao de fabrica</h3>
<p>O desdobramento e o processo de <strong>traduzir objetivos estrategicos em metas operacionais</strong> para cada nivel da organizacao:</p>

<div class="example"><strong>Exemplo — metalurgica de Sorocaba (SP):</strong><br>
<strong>Objetivo estrategico:</strong> Aumentar margem liquida de 8% para 12% em 2 anos<br>
<strong>Desdobramento:</strong>
<ul>
<li><strong>Financeiro:</strong> Reduzir custo da nao-qualidade de 5% para 2% do faturamento</li>
<li><strong>Clientes:</strong> Reduzir reclamacoes de 15/mes para 5/mes</li>
<li><strong>Processos:</strong> Reduzir refugo de 3,5% para 1,5%; aumentar OEE de 65% para 80%</li>
<li><strong>Aprendizado:</strong> 100% dos operadores treinados em CEP; 4 eventos kaizen por semestre</li>
</ul>
Cada indicador tem meta, responsavel e plano de acao. O operador no torno sabe que sua meta de refugo (1,5%) esta conectada a meta de custo da nao-qualidade (2%) que esta conectada a meta de margem (12%).</div>

<h3>Mapa estrategico</h3>
<p>O mapa estrategico e a <strong>representacao visual</strong> das relacoes de causa e efeito entre os objetivos nas 4 perspectivas. E a ferramenta mais poderosa do BSC para alinhar a organizacao.</p>

<div class="template-box">
<strong>Template simplificado de Mapa Estrategico</strong>
<table>
<tr><th colspan="3">FINANCEIRA</th></tr>
<tr><td>Aumentar faturamento</td><td>Reduzir custos operacionais</td><td>Melhorar margem</td></tr>
<tr><th colspan="3">CLIENTES</th></tr>
<tr><td>Melhorar satisfacao</td><td>Reduzir prazo de entrega</td><td>Garantir qualidade do produto</td></tr>
<tr><th colspan="3">PROCESSOS INTERNOS</th></tr>
<tr><td>Otimizar producao (OEE)</td><td>Reduzir refugo e retrabalho</td><td>Agilizar logistica interna</td></tr>
<tr><th colspan="3">APRENDIZADO E CRESCIMENTO</th></tr>
<tr><td>Capacitar equipe</td><td>Implementar cultura de melhoria</td><td>Investir em tecnologia</td></tr>
</table>
<p><em>Cada objetivo se conecta aos de cima por setas de causa e efeito.</em></p>
</div>

<h3>BSC para pequenas e medias empresas</h3>
<p>O BSC nao e so para multinacionais. Uma versao simplificada funciona para qualquer empresa:</p>
<ol>
<li>Defina 2-3 objetivos por perspectiva (nao mais que 12 no total)</li>
<li>Atribua 1-2 indicadores por objetivo</li>
<li>Defina metas anuais e marcos trimestrais</li>
<li>Revise mensalmente na reuniao de gestao</li>
</ol>

<div class="callout"><strong>Erro comum:</strong> Empresas criam 50 indicadores e nao acompanham nenhum. Melhor ter 10 indicadores realmente monitorados do que 50 em planilhas que ninguem abre. Comece simples, amplie conforme a maturidade.</div>
`}, 'Mapa estrategico BSC modelo')`;

  // ── Module 3: Ferramentas de Analise ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Analise', 'Ishikawa, Pareto, 5 Porques, Matriz GUT e FMEA para diagnostico de problemas', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '3-1-diagrama-ishikawa', 'Diagrama de Ishikawa (causa e efeito)', '15 min', 1, ${`
<h2>Diagrama de Ishikawa (causa e efeito)</h2>
<p>O Diagrama de Ishikawa — tambem chamado de <strong>espinha de peixe</strong> ou <strong>diagrama de causa e efeito</strong> — foi criado por Kaoru Ishikawa em 1943 e continua sendo uma das ferramentas mais usadas para <strong>identificar causas potenciais de um problema</strong>.</p>

<h3>Estrutura do diagrama</h3>
<p>O diagrama tem a forma de uma espinha de peixe:</p>
<ul>
<li><strong>Cabeca do peixe (direita):</strong> O problema (efeito) que voce quer resolver</li>
<li><strong>Espinha central:</strong> Seta horizontal apontando para o problema</li>
<li><strong>Espinhas secundarias:</strong> As categorias de causas potenciais</li>
<li><strong>Espinhas terciarias:</strong> As causas especificas dentro de cada categoria</li>
</ul>

<h3>Os 6M — categorias classicas</h3>
<p>Na industria, as categorias tradicionais sao os <strong>6M</strong>:</p>
<table>
<tr><th>Categoria</th><th>O que investigar</th><th>Exemplos de causas</th></tr>
<tr><td><strong>Maquina</strong></td><td>Equipamentos, ferramentas, instrumentos</td><td>Maquina descalibrada, ferramenta desgastada, falta de manutencao preventiva</td></tr>
<tr><td><strong>Metodo</strong></td><td>Procedimentos, instrucoes, fluxos</td><td>Instrucao de trabalho desatualizada, ausencia de padrao, sequencia incorreta</td></tr>
<tr><td><strong>Mao de obra</strong></td><td>Pessoas, competencias, treinamento</td><td>Falta de treinamento, rotatividade alta, fadiga por excesso de horas extras</td></tr>
<tr><td><strong>Material</strong></td><td>Materia-prima, insumos, componentes</td><td>Material fora de especificacao, fornecedor nao qualificado, armazenamento inadequado</td></tr>
<tr><td><strong>Meio ambiente</strong></td><td>Condicoes ambientais, layout</td><td>Temperatura excessiva, iluminacao insuficiente, contaminacao, layout desorganizado</td></tr>
<tr><td><strong>Medicao</strong></td><td>Instrumentos, metodos de medicao</td><td>Instrumento descalibrado, criterio de inspecao subjetivo, amostragem insuficiente</td></tr>
</table>

<div class="callout"><strong>Variacao:</strong> Para processos de servico, use 4P: Politicas, Procedimentos, Pessoas e Planta (infraestrutura). O importante e adaptar as categorias ao seu contexto.</div>

<h3>Como construir — passo a passo</h3>
<ol>
<li><strong>Defina o problema com clareza:</strong> "Indice de refugo no torneamento CNC subiu de 1,5% para 4,2% em marco" (especifico, com dados)</li>
<li><strong>Desenhe a estrutura:</strong> Cabeca + espinha central + 6 espinhas de categoria</li>
<li><strong>Faca brainstorming por categoria:</strong> Reuna a equipe (operadores, tecnico, supervisor) e liste causas potenciais em cada M</li>
<li><strong>Aprofunde com "Por que?":</strong> Para cada causa listada, pergunte "por que isso acontece?" para chegar a causas mais profundas</li>
<li><strong>Priorize:</strong> Marque as 3-5 causas mais provaveis (com base em dados, nao em achismo)</li>
<li><strong>Verifique:</strong> Valide as causas priorizadas com dados reais antes de sair corrigindo</li>
</ol>

<div class="example"><strong>Exemplo completo — industria alimenticia de Londrina (PR):</strong><br>
<strong>Problema:</strong> Aumento de devolucoes de iogurte por "sabor acido" (de 0,3% para 1,8% em 2 meses)<br>
<strong>Causas identificadas:</strong>
<ul>
<li><strong>Maquina:</strong> Pasteurizador com temperatura instavel (variacao de +/- 3 graus C)</li>
<li><strong>Material:</strong> Novo fornecedor de fermento lactico com concentracao diferente</li>
<li><strong>Metodo:</strong> Tempo de fermentacao nao ajustado para lote maior</li>
<li><strong>Medicao:</strong> PHmetro sem calibracao ha 4 meses</li>
</ul>
<strong>Causa raiz validada:</strong> A combinacao do novo fermento + tempo nao ajustado + medicao imprecisa. A empresa calibrou o PHmetro, ajustou o tempo de fermentacao e qualificou o novo fornecedor. Devolucoes voltaram a 0,2% em 6 semanas.</div>

<div class="template-box">
<strong>Template: Registro do Ishikawa</strong>
<table>
<tr><td><strong>Problema (efeito):</strong></td><td>[Descreva o problema com dados]</td></tr>
<tr><td><strong>Data da analise:</strong></td><td>[DD/MM/AAAA]</td></tr>
<tr><td><strong>Equipe:</strong></td><td>[Nomes e funcoes]</td></tr>
<tr><td><strong>Maquina:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Metodo:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Mao de obra:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Material:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Meio ambiente:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Medicao:</strong></td><td>[Causas listadas]</td></tr>
<tr><td><strong>Causas priorizadas:</strong></td><td>[As 3-5 mais provaveis, com justificativa]</td></tr>
<tr><td><strong>Verificacao:</strong></td><td>[Como validou cada causa]</td></tr>
</table>
</div>
`}, 'Template Ishikawa preenchivel'),

  (${m3.id}, '3-2-5-porques-pareto', '5 Porques e Diagrama de Pareto', '15 min', 2, ${`
<h2>5 Porques e Diagrama de Pareto</h2>
<p>Duas ferramentas complementares e poderosas: os <strong>5 Porques</strong> aprofundam a busca pela causa raiz de um problema especifico, enquanto o <strong>Diagrama de Pareto</strong> mostra quais problemas merecem atencao primeiro.</p>

<h3>5 Porques (5 Whys)</h3>
<p>Criada por Taiichi Ohno na Toyota, a tecnica e simples: pergunte "por que?" repetidamente (geralmente 5 vezes) ate chegar a <strong>causa raiz</strong> — aquela que, se eliminada, evita que o problema se repita.</p>

<div class="example"><strong>Exemplo — metalurgica de Contagem (MG):</strong><br>
<strong>Problema:</strong> Peca rejeitada por dimensao fora de tolerancia<br>
<strong>1o Por que?</strong> A peca saiu 0,3mm acima da tolerancia → Porque a ferramenta de corte estava desgastada<br>
<strong>2o Por que?</strong> A ferramenta estava desgastada → Porque nao foi trocada no momento certo<br>
<strong>3o Por que?</strong> Nao foi trocada → Porque nao existe controle de vida util da ferramenta<br>
<strong>4o Por que?</strong> Nao existe controle → Porque nunca foi definido um padrao de troca<br>
<strong>5o Por que?</strong> Nao foi definido → Porque a instrucao de trabalho nao inclui criterio de troca de ferramenta<br>
<strong>Causa raiz:</strong> Instrucao de trabalho incompleta (nao define criterio de troca de ferramenta)<br>
<strong>Acao:</strong> Atualizar IT com vida util estimada por tipo de ferramenta/material e criar controle visual de troca</div>

<h3>Regras para usar os 5 Porques corretamente</h3>
<ul>
<li><strong>Nao e sempre 5:</strong> Pode ser 3, 7 ou 8 — o numero e um guia, nao uma regra rigida. Pare quando chegar a algo acionavel.</li>
<li><strong>Baseie-se em fatos:</strong> Cada "por que" deve ter evidencia. "Porque o operador nao quis" nao e causa raiz — e achismo.</li>
<li><strong>Foque no processo, nao nas pessoas:</strong> "Porque o Joao errou" nao e causa raiz. "Porque o procedimento permite ambiguidade" sim.</li>
<li><strong>Considere multiplas cadeias:</strong> Um problema pode ter mais de uma cadeia de "por ques". Explore todas.</li>
</ul>

<div class="callout"><strong>Armadilha comum:</strong> Parar cedo demais. "A peca saiu ruim porque a maquina estava com problema" nao e causa raiz — e preciso perguntar POR QUE a maquina estava com problema, POR QUE nao foi feita manutencao, etc.</div>

<h3>Diagrama de Pareto</h3>
<p>O Diagrama de Pareto e baseado no <strong>principio 80/20</strong> de Vilfredo Pareto: aproximadamente 80% dos problemas vem de 20% das causas. O diagrama ordena as causas por frequencia ou impacto, permitindo priorizar o que tratar primeiro.</p>

<h3>Como construir um Pareto</h3>
<ol>
<li><strong>Colete dados:</strong> Registre a frequencia de cada tipo de problema/defeito em um periodo definido</li>
<li><strong>Ordene:</strong> Coloque do mais frequente ao menos frequente</li>
<li><strong>Calcule o percentual acumulado:</strong> Some os percentuais progressivamente</li>
<li><strong>Desenhe:</strong> Barras para frequencia (eixo esquerdo) + linha para acumulado (eixo direito)</li>
<li><strong>Identifique o "vital few":</strong> Os poucos tipos que somam 80% dos problemas</li>
</ol>

<div class="example"><strong>Exemplo — construtora de Curitiba (PR):</strong><br>
<strong>Dados de nao-conformidades em 6 meses:</strong>
<table>
<tr><th>Tipo de defeito</th><th>Ocorrencias</th><th>%</th><th>% Acumulado</th></tr>
<tr><td>Trinca em alvenaria</td><td>45</td><td>32%</td><td>32%</td></tr>
<tr><td>Infiltracao</td><td>38</td><td>27%</td><td>59%</td></tr>
<tr><td>Desalinhamento de piso</td><td>22</td><td>16%</td><td>75%</td></tr>
<tr><td>Defeito em esquadria</td><td>15</td><td>11%</td><td>86%</td></tr>
<tr><td>Problema eletrico</td><td>12</td><td>8%</td><td>94%</td></tr>
<tr><td>Outros</td><td>8</td><td>6%</td><td>100%</td></tr>
</table>
<strong>Conclusao:</strong> Trinca + Infiltracao + Desalinhamento = 75% dos problemas. Atacar esses 3 resolve 3/4 das nao-conformidades.</div>

<h3>Combinando as duas ferramentas</h3>
<p>Use na seguinte sequencia:</p>
<ol>
<li><strong>Pareto primeiro:</strong> Identifique QUAIS problemas atacar (os "vital few")</li>
<li><strong>5 Porques depois:</strong> Para cada problema priorizado pelo Pareto, aprofunde a causa raiz</li>
</ol>

<div class="callout"><strong>Na pratica:</strong> Essa combinacao e a mais usada em circulos de qualidade e equipes de melhoria continua no Brasil. O Pareto direciona o foco, os 5 Porques encontram a raiz. Juntos, evitam o desperdicio de resolver problemas errados ou tratar sintomas em vez de causas.</div>
`}, NULL),

  (${m3.id}, '3-3-matriz-gut', 'Matriz GUT e priorizacao', '15 min', 3, ${`
<h2>Matriz GUT e priorizacao</h2>
<p>Quando voce tem uma lista de problemas ou oportunidades e precisa decidir <strong>qual atacar primeiro</strong>, a Matriz GUT e uma ferramenta objetiva de priorizacao. GUT e o acronimo de <strong>Gravidade, Urgencia e Tendencia</strong>.</p>

<h3>Os 3 criterios</h3>
<table>
<tr><th>Criterio</th><th>Pergunta</th><th>O que avalia</th></tr>
<tr><td><strong>G — Gravidade</strong></td><td>Se nao resolver, qual o impacto?</td><td>Consequencia do problema (financeiro, seguranca, cliente, legal)</td></tr>
<tr><td><strong>U — Urgencia</strong></td><td>Quanto tempo tenho para agir?</td><td>Pressao do tempo (pode esperar ou e imediato?)</td></tr>
<tr><td><strong>T — Tendencia</strong></td><td>Se nao agir, vai piorar?</td><td>Evolucao do problema ao longo do tempo</td></tr>
</table>

<h3>Escala de pontuacao</h3>
<table>
<tr><th>Nota</th><th>Gravidade</th><th>Urgencia</th><th>Tendencia</th></tr>
<tr><td><strong>5</strong></td><td>Extremamente grave</td><td>Precisa de acao imediata</td><td>Piora rapidamente</td></tr>
<tr><td><strong>4</strong></td><td>Muito grave</td><td>Acao urgente</td><td>Piora em curto prazo</td></tr>
<tr><td><strong>3</strong></td><td>Grave</td><td>Acao o mais rapido possivel</td><td>Piora em medio prazo</td></tr>
<tr><td><strong>2</strong></td><td>Pouco grave</td><td>Pode esperar um pouco</td><td>Piora em longo prazo</td></tr>
<tr><td><strong>1</strong></td><td>Sem gravidade</td><td>Pode esperar</td><td>Nao piora (ou melhora)</td></tr>
</table>

<p><strong>Calculo:</strong> GUT = G x U x T. O problema com maior pontuacao e prioridade numero 1.</p>

<div class="example"><strong>Exemplo — cooperativa agricola de Cascavel (PR):</strong><br>
A cooperativa levantou 5 problemas no processo de recebimento de graos:
<table>
<tr><th>Problema</th><th>G</th><th>U</th><th>T</th><th>GxUxT</th><th>Prioridade</th></tr>
<tr><td>Balanca com erro de +/- 50kg</td><td>5</td><td>5</td><td>4</td><td>100</td><td>1o</td></tr>
<tr><td>Fila de espera de 3h no pico</td><td>4</td><td>4</td><td>5</td><td>80</td><td>2o</td></tr>
<tr><td>Classificador sem treinamento atualizado</td><td>3</td><td>3</td><td>4</td><td>36</td><td>3o</td></tr>
<tr><td>Sistema de agendamento fora do ar</td><td>3</td><td>4</td><td>2</td><td>24</td><td>4o</td></tr>
<tr><td>Goteira no armazem 3</td><td>2</td><td>2</td><td>3</td><td>12</td><td>5o</td></tr>
</table>
<strong>Decisao:</strong> Calibrar a balanca primeiro (impacto financeiro direto no peso dos graos), depois resolver a fila de espera (produtores estao migrando para concorrente).</div>

<h3>Quando usar a Matriz GUT</h3>
<ul>
<li>Na reuniao de analise critica, para priorizar acoes corretivas</li>
<li>No planejamento de projetos de melhoria</li>
<li>Na selecao de riscos a tratar (pode ser usada como complemento a clausula 6.1 da ISO 9001)</li>
<li>Na priorizacao de investimentos em manutencao</li>
</ul>

<h3>Cuidados ao usar</h3>
<ul>
<li><strong>Nao use sozinho:</strong> A pontuacao e subjetiva. Faca com um grupo (3-5 pessoas) para reduzir vies individual.</li>
<li><strong>Defina criterios claros:</strong> O que significa "extremamente grave" no seu contexto? R$ 100.000 de prejuizo? Risco de acidente fatal? Perda de cliente-chave?</li>
<li><strong>Revise periodicamente:</strong> A pontuacao muda com o tempo. O que era urgencia 2 pode virar 5 em um mes.</li>
</ul>

<div class="template-box">
<strong>Template: Matriz GUT</strong>
<table>
<tr><th>Item / Problema</th><th>G (1-5)</th><th>U (1-5)</th><th>T (1-5)</th><th>GxUxT</th><th>Prioridade</th><th>Responsavel</th><th>Prazo</th></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>[Descreva o problema]</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
</div>

<div class="callout"><strong>GUT vs. Pareto:</strong> O Pareto prioriza por FREQUENCIA (o que acontece mais). O GUT prioriza por IMPACTO (o que faz mais estrago). Use Pareto quando tem dados historicos; use GUT quando precisa priorizar com a equipe e os problemas sao qualitativamente diferentes.</div>
`}, 'Matriz GUT preenchivel'),

  (${m3.id}, '3-4-fmea-processos', 'FMEA simplificado para processos', '15 min', 4, ${`
<h2>FMEA simplificado para processos</h2>
<p>O <strong>FMEA (Failure Mode and Effects Analysis)</strong> — ou Analise de Modos de Falha e seus Efeitos — e uma ferramenta <strong>preventiva</strong> que identifica falhas potenciais em um processo ANTES que elas acontecam, avalia seu risco e define acoes para reduzir esse risco.</p>

<div class="callout"><strong>Diferenca fundamental:</strong> O Ishikawa e os 5 Porques sao ferramentas REATIVAS (o problema ja aconteceu). O FMEA e PREVENTIVO (analisa o que PODE dar errado). Essa e a essencia do pensamento baseado em risco da ISO 9001:2015.</div>

<h3>Estrutura do FMEA de processo</h3>
<p>Para cada etapa do processo, o FMEA analisa:</p>
<table>
<tr><th>Elemento</th><th>Pergunta</th></tr>
<tr><td><strong>Modo de falha</strong></td><td>O que pode dar errado nesta etapa?</td></tr>
<tr><td><strong>Efeito da falha</strong></td><td>Se falhar, qual e o impacto no cliente ou no processo seguinte?</td></tr>
<tr><td><strong>Causa da falha</strong></td><td>O que pode causar essa falha?</td></tr>
<tr><td><strong>Controles atuais</strong></td><td>O que existe hoje para prevenir ou detectar esta falha?</td></tr>
</table>

<h3>Os 3 indices do FMEA</h3>
<table>
<tr><th>Indice</th><th>O que mede</th><th>Escala</th></tr>
<tr><td><strong>S — Severidade</strong></td><td>Gravidade do efeito da falha</td><td>1 (imperceptivel) a 10 (catastrofico)</td></tr>
<tr><td><strong>O — Ocorrencia</strong></td><td>Probabilidade de a causa acontecer</td><td>1 (improvavel) a 10 (quase certo)</td></tr>
<tr><td><strong>D — Deteccao</strong></td><td>Capacidade de detectar a falha antes de chegar ao cliente</td><td>1 (certamente detecta) a 10 (nao detecta)</td></tr>
</table>

<p><strong>RPN (Risk Priority Number) = S x O x D</strong></p>
<p>Quanto maior o RPN, maior o risco. Valores acima de 100-125 (depende do criterio da empresa) demandam acao.</p>

<div class="example"><strong>Exemplo — metalurgica de Cachoeirinha (RS):</strong><br>
<strong>Processo:</strong> Soldagem de chassis<br>
<table>
<tr><th>Etapa</th><th>Modo de falha</th><th>Efeito</th><th>Causa</th><th>Controle atual</th><th>S</th><th>O</th><th>D</th><th>RPN</th></tr>
<tr><td>Preparacao da junta</td><td>Superficie com oleosidade</td><td>Porosidade na solda, rejeicao no ensaio</td><td>Limpeza inadequada da peca</td><td>Instrucao de trabalho (visual)</td><td>7</td><td>5</td><td>6</td><td>210</td></tr>
<tr><td>Soldagem MIG</td><td>Parametros incorretos</td><td>Solda fria, trinca</td><td>Setup nao conferido</td><td>Checklist de setup</td><td>9</td><td>3</td><td>4</td><td>108</td></tr>
<tr><td>Inspecao visual</td><td>Defeito nao detectado</td><td>Peca defeituosa entregue ao cliente</td><td>Inspetor sem treinamento em defeitos de solda</td><td>Nenhum adicional</td><td>8</td><td>4</td><td>7</td><td>224</td></tr>
</table>
<strong>Acoes para RPN > 100:</strong> (1) Implementar limpeza com solvente + secagem forcada antes da soldagem (RPN 210); (2) Treinamento de inspetores com padrao fotografico de defeitos (RPN 224); (3) Validacao de parametros com peca-teste a cada inicio de turno (RPN 108).</div>

<h3>Passo a passo simplificado</h3>
<ol>
<li><strong>Liste as etapas do processo</strong> (use o fluxograma como base)</li>
<li><strong>Para cada etapa, identifique modos de falha:</strong> O que pode dar errado?</li>
<li><strong>Avalie efeito + causa + controle:</strong> Preencha a tabela</li>
<li><strong>Pontue S, O e D:</strong> Use escalas predefinidas (consistencia e mais importante que precisao)</li>
<li><strong>Calcule RPN:</strong> Priorize os maiores</li>
<li><strong>Defina acoes:</strong> Para cada RPN acima do limite, defina acao, responsavel e prazo</li>
<li><strong>Recalcule:</strong> Apos implementar as acoes, reavalie S, O e D</li>
</ol>

<div class="template-box">
<strong>Template: FMEA de Processo Simplificado</strong>
<table>
<tr><th>Etapa</th><th>Modo de falha</th><th>Efeito</th><th>S</th><th>Causa</th><th>O</th><th>Controle atual</th><th>D</th><th>RPN</th><th>Acao recomendada</th><th>Resp.</th><th>Prazo</th></tr>
<tr><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
</div>

<div class="callout"><strong>Dica para ISO 9001:</strong> O FMEA nao e obrigatorio pela ISO 9001, mas e uma das formas mais robustas de atender ao requisito de "pensamento baseado em risco" (clausula 6.1). Auditores valorizam quando a empresa usa FMEA nos processos criticos — mostra maturidade e proatividade.</div>
`}, 'Template FMEA de processo')`;

  // ── Module 4: Ferramentas de Melhoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Ferramentas de Melhoria', 'PDCA, A3, 5W2H e Kaizen aplicados a processos industriais', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '4-1-ciclo-pdca', 'Ciclo PDCA na pratica', '15 min', 1, ${`
<h2>Ciclo PDCA na pratica</h2>
<p>O ciclo PDCA (Plan-Do-Check-Act) e o <strong>motor da melhoria continua</strong>. Criado por Walter Shewhart e popularizado por Edwards Deming, e a base da ISO 9001, do Lean Manufacturing e de praticamente toda metodologia seria de gestao.</p>

<div class="callout"><strong>Por que o PDCA e tao poderoso?</strong> Porque impede os dois erros mais comuns em melhoria: (1) agir sem planejar (apagar incendio) e (2) planejar sem verificar se funcionou (achismo). O ciclo forca disciplina: planejo, executo, verifico e ajusto.</div>

<h3>As 4 fases detalhadas</h3>

<h3>P — Plan (Planejar)</h3>
<p>A fase mais importante (e mais negligenciada). Inclui:</p>
<ul>
<li><strong>Identificar o problema/oportunidade:</strong> O que precisa melhorar? Com dados, nao com opiniao.</li>
<li><strong>Analisar causas:</strong> Use Ishikawa, 5 Porques, Pareto para entender a raiz.</li>
<li><strong>Definir metas:</strong> O que queremos atingir? Em quanto tempo?</li>
<li><strong>Elaborar plano de acao:</strong> Quem faz o que, quando, como (5W2H).</li>
</ul>

<h3>D — Do (Executar)</h3>
<p>Implementar o plano. Pontos criticos:</p>
<ul>
<li>Treinar as pessoas envolvidas ANTES de implementar</li>
<li>Executar conforme planejado (nao improvisar)</li>
<li>Registrar dados durante a execucao (para a fase Check)</li>
<li>Se possivel, testar em escala menor antes (piloto)</li>
</ul>

<h3>C — Check (Verificar)</h3>
<p>Comparar os resultados obtidos com as metas planejadas:</p>
<ul>
<li>Os indicadores melhoraram? Em que medida?</li>
<li>A meta foi atingida?</li>
<li>Houve efeitos colaterais nao previstos?</li>
<li>O que funcionou e o que nao funcionou?</li>
</ul>

<h3>A — Act (Agir)</h3>
<p>Duas situacoes possiveis:</p>
<ul>
<li><strong>Meta atingida:</strong> Padronizar o novo metodo (criar/atualizar procedimento), treinar todos, estender para processos similares. O novo padrao vira o "chao" do proximo ciclo.</li>
<li><strong>Meta NAO atingida:</strong> Voltar ao P — analisar por que nao funcionou, redefinir o plano, girar o ciclo novamente.</li>
</ul>

<div class="example"><strong>Exemplo completo — metalurgica de Piracicaba (SP):</strong><br>
<strong>Plan:</strong> Refugo de estampagem em 4,8% (meta: 2,0%). Analise com Ishikawa identificou: (1) ferramenta desgastada sem controle, (2) chapa com espessura no limite superior, (3) operador ajustando pressao "no olho". Plano: implementar controle de vida util de ferramenta, receber materia-prima com laudo dimensional, padronizar pressao por referencia de produto.<br>
<strong>Do:</strong> Implementacao em 1 linha piloto durante 30 dias. Treinamento de 3 operadores.<br>
<strong>Check:</strong> Refugo na linha piloto caiu de 4,8% para 1,6% (abaixo da meta). Nas demais linhas, continuou em 4,5%.<br>
<strong>Act:</strong> Padronizar o novo metodo e replicar para as 4 linhas restantes. Nova IT criada. Treinamento estendido para todos os turnos. Meta do proximo ciclo: 1,0%.</div>

<h3>PDCA vs. SDCA</h3>
<p>O PDCA e para <strong>melhorar</strong> (subir o nivel). O SDCA (Standardize-Do-Check-Act) e para <strong>manter</strong> (nao deixar cair). Na pratica:</p>
<table>
<tr><th>Ciclo</th><th>Quando usar</th><th>Foco</th></tr>
<tr><td><strong>PDCA</strong></td><td>Quando quer melhorar um resultado</td><td>Melhoria (subir a barra)</td></tr>
<tr><td><strong>SDCA</strong></td><td>Quando quer manter um resultado ja conquistado</td><td>Manutencao (nao deixar cair)</td></tr>
</table>

<div class="callout"><strong>O erro classico:</strong> Girar PDCA sem nunca padronizar (SDCA). A empresa melhora, mas 3 meses depois volta ao patamar anterior porque ninguem padronizou o novo metodo. Melhoria sem padronizacao e volatil.</div>
`}, 'Formulario PDCA preenchivel'),

  (${m4.id}, '4-2-a3-resolucao-problemas', 'A3 de resolucao de problemas', '15 min', 2, ${`
<h2>A3 de resolucao de problemas</h2>
<p>O <strong>Relatorio A3</strong> e uma ferramenta da Toyota que resume todo o ciclo de resolucao de problemas em <strong>uma unica folha A3</strong> (42 x 30 cm). Nao e apenas um formulario — e uma <strong>forma de pensar</strong>: sintetizar o problema, a analise, a solucao e o resultado em um documento conciso que qualquer pessoa consegue entender em 5 minutos.</p>

<div class="callout"><strong>Filosofia Toyota:</strong> "Se voce nao consegue explicar o problema e a solucao em uma folha A3, voce nao entendeu o problema." A restricao de espaco forca clareza e foco.</div>

<h3>Estrutura do A3</h3>
<p>O A3 segue a logica do PDCA e e dividido em dois lados:</p>
<table>
<tr><th colspan="2">LADO ESQUERDO (PLAN — Entender o problema)</th></tr>
<tr><td><strong>1. Contexto / Background</strong></td><td>Por que este problema importa? Qual processo? Qual impacto no negocio?</td></tr>
<tr><td><strong>2. Condicao atual</strong></td><td>Dados que mostram o problema. Graficos, numeros, fatos. Nao opinioes.</td></tr>
<tr><td><strong>3. Objetivo / Meta</strong></td><td>O que queremos atingir? Quando? Quanto?</td></tr>
<tr><td><strong>4. Analise de causa raiz</strong></td><td>Ishikawa, 5 Porques, Pareto — a analise que levou as causas reais.</td></tr>
<tr><th colspan="2">LADO DIREITO (DO/CHECK/ACT — Resolver e verificar)</th></tr>
<tr><td><strong>5. Contramedidas propostas</strong></td><td>O que vamos fazer para eliminar cada causa raiz? (5W2H resumido)</td></tr>
<tr><td><strong>6. Plano de implementacao</strong></td><td>Cronograma com responsaveis e prazos.</td></tr>
<tr><td><strong>7. Verificacao de resultados</strong></td><td>Dados que mostram se funcionou. Comparacao antes vs. depois.</td></tr>
<tr><td><strong>8. Padronizacao e proximos passos</strong></td><td>O que padronizar? O que aprendemos? Qual o proximo desafio?</td></tr>
</table>

<div class="example"><strong>Exemplo resumido — industria alimenticia de Uberlandia (MG):</strong><br>
<strong>1. Contexto:</strong> Linha de envase de molho de tomate — producao de 50.000 unidades/dia.<br>
<strong>2. Condicao atual:</strong> Perda de embalagem por vazamento no envase: 3,2% (1.600 unidades/dia = R$ 4.800/dia de prejuizo).<br>
<strong>3. Meta:</strong> Reduzir perda para 0,5% em 60 dias.<br>
<strong>4. Analise:</strong> 5 Porques identificou: bico dosador com vedacao desgastada + temperatura do molho acima de 85 graus C no envase (especificacao: 78-82 graus C), causando dilatacao da embalagem.<br>
<strong>5. Contramedidas:</strong> (a) Trocar vedacao do dosador a cada 500.000 ciclos (antes: sem controle); (b) Instalar sensor de temperatura antes do envase com bloqueio automatico acima de 83 graus C.<br>
<strong>6. Plano:</strong> Semana 1: instalar sensor; Semana 2: definir rotina de troca de vedacao; Semana 3-8: monitorar.<br>
<strong>7. Resultado:</strong> Perda caiu de 3,2% para 0,4% (abaixo da meta). Economia: R$ 4.200/dia = R$ 92.400/mes.<br>
<strong>8. Padronizacao:</strong> IT de manutencao preventiva do dosador atualizada. Sensor incluido no plano de calibracao. Replicar para as outras 3 linhas de envase.</div>

<div class="template-box">
<strong>Template: A3 de Resolucao de Problemas</strong>
<table>
<tr><td colspan="2" style="text-align:center"><strong>TITULO DO A3: [Descreva o problema em 1 linha]</strong></td></tr>
<tr><td style="width:50%"><strong>1. CONTEXTO</strong><br>[Por que este problema importa? 2-3 linhas]</td><td style="width:50%"><strong>5. CONTRAMEDIDAS</strong><br>[O que fazer para cada causa raiz]</td></tr>
<tr><td><strong>2. CONDICAO ATUAL</strong><br>[Dados, graficos, numeros que mostram o problema]</td><td><strong>6. PLANO DE IMPLEMENTACAO</strong><br>[Quem, o que, quando — cronograma resumido]</td></tr>
<tr><td><strong>3. OBJETIVO / META</strong><br>[O que atingir, quando, quanto]</td><td><strong>7. VERIFICACAO</strong><br>[Dados de antes vs. depois. Atingiu a meta?]</td></tr>
<tr><td><strong>4. ANALISE DE CAUSA RAIZ</strong><br>[Ishikawa, 5 Porques, Pareto]</td><td><strong>8. PADRONIZACAO / PROXIMOS PASSOS</strong><br>[O que padronizar? Proximo desafio?]</td></tr>
<tr><td colspan="2"><strong>Autor:</strong> [Nome] | <strong>Data:</strong> [DD/MM/AAAA] | <strong>Mentor/Aprovador:</strong> [Nome]</td></tr>
</table>
</div>

<div class="callout"><strong>Dica pratica:</strong> O A3 funciona como ferramenta de COMUNICACAO tambem. Use-o para apresentar melhorias a diretoria, para relatar acoes corretivas em auditorias, e como registro de licoes aprendidas. Um bom A3 substitui 15 slides de PowerPoint.</div>
`}, 'Template A3 preenchivel'),

  (${m4.id}, '4-3-5w2h-planos-acao', '5W2H para planos de acao', '15 min', 3, ${`
<h2>5W2H para planos de acao</h2>
<p>O <strong>5W2H</strong> e a ferramenta mais objetiva para transformar uma decisao em <strong>acao concreta</strong>. Quando a analise ja identificou o que precisa ser feito (via Ishikawa, 5 Porques, PDCA), o 5W2H responde: quem faz, o que faz, quando, onde, por que, como e quanto custa.</p>

<h3>Os 7 elementos</h3>
<table>
<tr><th>Sigla</th><th>Ingles</th><th>Portugues</th><th>Pergunta pratica</th></tr>
<tr><td><strong>W</strong></td><td>What</td><td>O que</td><td>Qual e a acao especifica a ser realizada?</td></tr>
<tr><td><strong>W</strong></td><td>Why</td><td>Por que</td><td>Qual a justificativa / qual problema resolve?</td></tr>
<tr><td><strong>W</strong></td><td>Where</td><td>Onde</td><td>Em qual local, setor, processo ou maquina?</td></tr>
<tr><td><strong>W</strong></td><td>When</td><td>Quando</td><td>Prazo de inicio e conclusao</td></tr>
<tr><td><strong>W</strong></td><td>Who</td><td>Quem</td><td>Responsavel pela execucao (nome, nao setor)</td></tr>
<tr><td><strong>H</strong></td><td>How</td><td>Como</td><td>Metodo, procedimento, etapas para executar</td></tr>
<tr><td><strong>H</strong></td><td>How much</td><td>Quanto custa</td><td>Custo estimado, recursos necessarios</td></tr>
</table>

<div class="callout"><strong>Regra de ouro:</strong> O campo "Quem" deve ter um NOME, nao um departamento. "Producao" nao e responsavel — "Carlos Silva, supervisor do turno A" e responsavel. Se nao tem nome, nao tem dono. Se nao tem dono, nao vai acontecer.</div>

<h3>Exemplo completo</h3>

<div class="example"><strong>Contexto — construtora de Florianopolis (SC):</strong><br>
Problema: Atraso medio de 22 dias na entrega de apartamentos por retrabalho em instalacoes hidraulicas.<br>
Causa raiz (5 Porques): Projeto hidraulico nao conferido com o eletrico antes da execucao, gerando conflito de passagens na laje.<br>

<table>
<tr><th>O que</th><th>Por que</th><th>Onde</th><th>Quando</th><th>Quem</th><th>Como</th><th>Quanto</th></tr>
<tr><td>Implementar check de compatibilidade de projetos</td><td>Eliminar conflitos entre hidraulico e eletrico</td><td>Dept. de projetos</td><td>Ate 15/03</td><td>Eng. Marcos Lima</td><td>Reuniao de compatibilizacao com checklist padrao antes de liberar projeto para obra</td><td>R$ 0 (recurso interno)</td></tr>
<tr><td>Criar checklist de verificacao de passagens na laje</td><td>Padronizar conferencia antes da concretagem</td><td>Canteiro de obra</td><td>Ate 20/03</td><td>Mestre Joao Pedro</td><td>Elaborar checklist com 15 itens criticos, validar com engenheiro residente</td><td>R$ 200 (impressao)</td></tr>
<tr><td>Treinar equipe de instalacoes no novo procedimento</td><td>Garantir que todos sigam o padrao</td><td>Sala de treinamento</td><td>Ate 01/04</td><td>Coord. Ana Souza</td><td>Treinamento presencial de 2h com simulacao pratica e prova</td><td>R$ 1.500 (hora-homem)</td></tr>
<tr><td>Monitorar retrabalho por 90 dias</td><td>Verificar eficacia das acoes</td><td>Todas as obras</td><td>01/04 a 30/06</td><td>Eng. Marcos Lima</td><td>Indicador semanal de retrabalho por obra, reporte na reuniao de gestao</td><td>R$ 0 (sistema existente)</td></tr>
</table>
</div>

<h3>Boas praticas</h3>
<ul>
<li><strong>Acoes especificas e verificaveis:</strong> "Melhorar a qualidade" nao e acao. "Implementar inspecao 100% na etapa de soldagem usando gabarito de verificacao" e acao.</li>
<li><strong>Prazos realistas:</strong> Considere a capacidade da equipe, a complexidade e os recursos disponiveis. Prazo impossivel gera descrenca.</li>
<li><strong>Acompanhamento:</strong> O 5W2H sem follow-up e papel bonito na gaveta. Defina frequencia de acompanhamento (semanal e o ideal).</li>
<li><strong>"How much" e opcional mas valioso:</strong> Mesmo para acoes de custo zero, registre "R$ 0 (recurso interno)" — mostra que foi pensado.</li>
</ul>

<div class="template-box">
<strong>Template: Plano de Acao 5W2H</strong>
<table>
<tr><th>No</th><th>O que (What)</th><th>Por que (Why)</th><th>Onde (Where)</th><th>Quando (When)</th><th>Quem (Who)</th><th>Como (How)</th><th>Quanto (How much)</th><th>Status</th></tr>
<tr><td>1</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>2</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
<tr><td>3</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td><td>--</td></tr>
</table>
<p><em>Status: Pendente / Em andamento / Concluido / Cancelado</em></p>
</div>

<div class="callout"><strong>Onde o 5W2H se encaixa:</strong> Ele e a "saida" natural de qualquer ferramenta de analise. Fez um Ishikawa? O 5W2H vira o plano de acao. Girou um PDCA? O "P" termina com o 5W2H. Preencheu um A3? O quadro 5 (contramedidas) e um 5W2H resumido. Fez uma analise critica? As saidas viram 5W2H.</div>
`}, 'Template 5W2H preenchivel'),

  (${m4.id}, '4-4-kaizen-melhoria-rapida', 'Kaizen e eventos de melhoria rapida', '15 min', 4, ${`
<h2>Kaizen e eventos de melhoria rapida</h2>
<p><strong>Kaizen</strong> (do japones: "mudanca para melhor") e a filosofia de <strong>melhoria continua incremental</strong>. Na pratica industrial brasileira, kaizen se manifesta de duas formas: (1) como cultura diaria de pequenas melhorias e (2) como <strong>eventos kaizen</strong> — projetos intensivos de melhoria rapida de 3 a 5 dias.</p>

<h3>Kaizen diario vs. Evento Kaizen</h3>
<table>
<tr><th>Aspecto</th><th>Kaizen diario</th><th>Evento Kaizen (Kaizen Blitz)</th></tr>
<tr><td><strong>Duracao</strong></td><td>Continuo</td><td>3 a 5 dias</td></tr>
<tr><td><strong>Equipe</strong></td><td>Cada pessoa, no seu posto</td><td>5-8 pessoas dedicadas ao evento</td></tr>
<tr><td><strong>Escopo</strong></td><td>Pequenas melhorias no dia a dia</td><td>Um processo especifico com problema definido</td></tr>
<tr><td><strong>Exemplo</strong></td><td>Operador reorganiza ferramentas para reduzir deslocamento</td><td>Equipe multidisciplinar redesenha o layout do setor de embalagem</td></tr>
<tr><td><strong>Investimento</strong></td><td>Baixo ou zero</td><td>Medio (horas da equipe + materiais)</td></tr>
<tr><td><strong>Resultado tipico</strong></td><td>Ganhos incrementais acumulados</td><td>Reducao de 30-50% em tempo/custo/espaco</td></tr>
</table>

<div class="callout"><strong>Filosofia:</strong> "Melhor do que ontem" — todos os dias. Kaizen nao e sobre grandes projetos; e sobre centenas de pequenas melhorias feitas por todas as pessoas da organizacao. Um evento kaizen de 5 dias pode resolver um problema especifico, mas a cultura kaizen e o que sustenta a melhoria ao longo dos anos.</div>

<h3>Estrutura de um evento Kaizen (5 dias)</h3>

<h3>Dia 1 — Preparacao e diagnostico</h3>
<ul>
<li>Definir escopo, meta e equipe</li>
<li>Treinar a equipe nos conceitos e ferramentas</li>
<li>Ir ao gemba (local real do processo) e observar</li>
<li>Mapear o processo atual (fluxograma, cronometragem, medidas)</li>
</ul>

<h3>Dia 2 — Analise</h3>
<ul>
<li>Identificar desperdicios (os 7 desperdicios do Lean)</li>
<li>Medir tempos, distancias, estoques intermediarios</li>
<li>Analisar causas dos desperdicios (Ishikawa, 5 Porques)</li>
<li>Brainstorming de solucoes</li>
</ul>

<h3>Dia 3 — Projeto e teste</h3>
<ul>
<li>Desenhar o novo processo (estado futuro)</li>
<li>Simular/testar as mudancas em escala piloto</li>
<li>Ajustar conforme necessario</li>
</ul>

<h3>Dia 4 — Implementacao</h3>
<ul>
<li>Implementar as mudancas fisicas (layout, ferramentas, quadros)</li>
<li>Criar/atualizar instrucoes de trabalho</li>
<li>Treinar os operadores do processo</li>
</ul>

<h3>Dia 5 — Padronizacao e apresentacao</h3>
<ul>
<li>Medir os resultados (antes vs. depois)</li>
<li>Padronizar o novo processo</li>
<li>Apresentar os resultados para a diretoria</li>
<li>Definir plano de sustentacao (SDCA)</li>
</ul>

<div class="example"><strong>Exemplo — cooperativa agricola de Passo Fundo (RS):</strong><br>
<strong>Problema:</strong> Processo de preparo de sementes para distribuicao levava 12 horas (turno e meio), gerando horas extras e atraso na safra.<br>
<strong>Evento Kaizen (5 dias):</strong> Equipe de 6 pessoas (2 operadores, 1 mecanico, 1 supervisor, 1 qualidade, 1 logistica).<br>
<strong>Acoes implementadas:</strong>
<ul>
<li>Reorganizacao do layout (reducao de 60% no deslocamento)</li>
<li>Kit pre-montado de embalagens (eliminacao de espera)</li>
<li>Troca rapida de setup entre variedades de sementes (SMED simplificado)</li>
<li>Quadro de gestao visual com meta diaria</li>
</ul>
<strong>Resultado:</strong> Tempo caiu de 12h para 7h (reducao de 42%). Eliminacao de horas extras. Meta de preparacao diaria atingida em turno normal. ROI do evento em 3 semanas.</div>

<h3>Sistema de sugestoes Kaizen</h3>
<p>Para sustentar a cultura de melhoria diaria, implemente um <strong>sistema de sugestoes</strong>:</p>
<ol>
<li><strong>Quadro de sugestoes:</strong> Local visivel onde qualquer pessoa pode registrar uma ideia de melhoria</li>
<li><strong>Avaliacao rapida:</strong> Supervisor avalia em ate 48h — nao deixe sugestoes sem resposta</li>
<li><strong>Implementacao rapida:</strong> Se aprovada, implemente em no maximo 30 dias</li>
<li><strong>Reconhecimento:</strong> Valorize quem sugere (quadro de honra, mencao em reuniao, premio simbolico)</li>
</ol>

<div class="callout"><strong>Dado real:</strong> A Toyota recebe em media 70 sugestoes por funcionario por ano (e implementa mais de 90%). Empresas brasileiras bem estruturadas atingem 5-10 sugestoes por funcionario por ano. Comece com a meta de 1 por pessoa por trimestre e evolua.</div>

<div class="template-box">
<strong>Template: Ficha de Sugestao Kaizen</strong>
<table>
<tr><td><strong>Nome:</strong></td><td>[Nome do colaborador]</td></tr>
<tr><td><strong>Setor:</strong></td><td>[Departamento / processo]</td></tr>
<tr><td><strong>Situacao atual:</strong></td><td>[Descreva o problema ou desperdicio em 2-3 linhas]</td></tr>
<tr><td><strong>Melhoria proposta:</strong></td><td>[Descreva sua sugestao em 2-3 linhas]</td></tr>
<tr><td><strong>Beneficio esperado:</strong></td><td>[Reducao de tempo, custo, risco, etc.]</td></tr>
<tr><td><strong>Avaliacao (supervisor):</strong></td><td>Aprovada / Reprovada (justificativa) / Em analise</td></tr>
<tr><td><strong>Data de implementacao:</strong></td><td>[Previsao]</td></tr>
</table>
</div>
`}, 'Roteiro de evento Kaizen')`;

  // ── Module 5: Integracao e Sustentabilidade ──
  const [m5] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Integracao e Sustentabilidade', 'Procedimentos, controle de documentos, cultura de melhoria e plano de acao final', 5) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m5.id}, '5-1-procedimentos-instrucoes', 'Procedimentos e instrucoes de trabalho', '15 min', 1, ${`
<h2>Procedimentos e instrucoes de trabalho</h2>
<p>Todo o trabalho de mapeamento, indicadores e melhoria so se sustenta se for <strong>documentado em procedimentos e instrucoes de trabalho</strong>. Sem padronizacao escrita, o conhecimento fica na cabeca das pessoas — e sai pela porta quando elas saem.</p>

<h3>Procedimento vs. instrucao de trabalho</h3>
<table>
<tr><th>Aspecto</th><th>Procedimento</th><th>Instrucao de trabalho (IT)</th></tr>
<tr><td><strong>Nivel</strong></td><td>O QUE fazer e QUEM faz</td><td>COMO fazer, passo a passo</td></tr>
<tr><td><strong>Detalhe</strong></td><td>Visao geral do fluxo</td><td>Detalhamento operacional</td></tr>
<tr><td><strong>Publico</strong></td><td>Gestores, auditores, envolvidos no processo</td><td>Operadores que executam a tarefa</td></tr>
<tr><td><strong>Exemplo</strong></td><td>"Procedimento de compras — define etapas de requisicao a recebimento"</td><td>"IT de inspecao de recebimento — como inspecionar parafusos M10 com torquimetro"</td></tr>
</table>

<div class="callout"><strong>ISO 9001:2015 e documentacao:</strong> A norma nao obriga nenhum procedimento especifico. Usa o termo "informacao documentada" e deixa a empresa decidir o que documentar. A regra pratica: documente tudo que, se feito errado, gera impacto no cliente ou risco para o negocio.</div>

<h3>Estrutura de um procedimento</h3>
<ol>
<li><strong>Cabecalho:</strong> Titulo, codigo, versao, data, aprovador</li>
<li><strong>Objetivo:</strong> Para que serve este procedimento (1-2 linhas)</li>
<li><strong>Escopo:</strong> A que processos/setores se aplica</li>
<li><strong>Responsabilidades:</strong> Quem faz o que</li>
<li><strong>Descricao do processo:</strong> Etapas, decisoes, fluxograma</li>
<li><strong>Registros gerados:</strong> Quais formularios/registros sao produzidos</li>
<li><strong>Documentos de referencia:</strong> Normas, ITs, outros procedimentos relacionados</li>
</ol>

<h3>Estrutura de uma instrucao de trabalho</h3>
<ol>
<li><strong>Cabecalho:</strong> Titulo, codigo, versao, data</li>
<li><strong>Materiais necessarios:</strong> Ferramentas, EPIs, insumos</li>
<li><strong>Passo a passo:</strong> Acoes numeradas com fotos ou ilustracoes</li>
<li><strong>Pontos criticos:</strong> O que NAO pode acontecer (erros comuns)</li>
<li><strong>Criterios de aceitacao:</strong> Como saber se fez certo</li>
</ol>

<div class="example"><strong>Exemplo — metalurgica de Novo Hamburgo (RS):</strong><br>
A empresa criou ITs visuais para o setor de soldagem. Cada IT tem no maximo 1 pagina, com:<br>
- 4 fotos do processo (passo a passo visual)<br>
- 2 fotos de "certo vs. errado" (padrao visual de aceitacao)<br>
- Parametros criticos em destaque (corrente, tensao, velocidade de arame)<br>
- QR code que leva ao video de demonstracao<br>
Resultado: tempo de treinamento de novos soldadores caiu de 15 para 5 dias. Refugo no primeiro mes de operador novo caiu de 8% para 2%.</div>

<div class="template-box">
<strong>Template: Instrucao de Trabalho Simplificada</strong>
<table>
<tr><td colspan="2" style="text-align:center"><strong>INSTRUCAO DE TRABALHO</strong></td></tr>
<tr><td><strong>Codigo:</strong> IT-[setor]-[numero]</td><td><strong>Versao:</strong> [01]</td></tr>
<tr><td><strong>Titulo:</strong> [Nome da tarefa]</td><td><strong>Data:</strong> [DD/MM/AAAA]</td></tr>
<tr><td colspan="2"><strong>Materiais / EPIs:</strong> [Liste tudo que precisa antes de comecar]</td></tr>
<tr><td colspan="2"><strong>Passo a passo:</strong><br>1. [Acao + foto/ilustracao]<br>2. [Acao + foto/ilustracao]<br>3. [Acao + foto/ilustracao]<br>4. [Acao + foto/ilustracao]</td></tr>
<tr><td colspan="2"><strong>Pontos criticos (ATENCAO):</strong><br>- [O que nao pode errar]<br>- [Erro comum a evitar]</td></tr>
<tr><td colspan="2"><strong>Criterio de aceitacao:</strong> [Como saber se esta OK]</td></tr>
<tr><td><strong>Elaborado por:</strong></td><td><strong>Aprovado por:</strong></td></tr>
</table>
</div>

<h3>Boas praticas</h3>
<ul>
<li><strong>Menos texto, mais visual:</strong> Fotos, diagramas e tabelas comunicam melhor que paragrafos longos</li>
<li><strong>Linguagem simples:</strong> Escreva para quem vai USAR, nao para o auditor. O operador precisa entender.</li>
<li><strong>Mantenha atualizado:</strong> Documento desatualizado e pior do que nao ter documento — gera confusao e descrenca</li>
<li><strong>Envolva quem faz:</strong> O operador que executa a tarefa deve participar da elaboracao da IT. Ele sabe os detalhes que o engenheiro nao sabe.</li>
</ul>
`}, 'Template de instrucao de trabalho'),

  (${m5.id}, '5-2-controle-documentos-registros', 'Controle de documentos e registros', '12 min', 2, ${`
<h2>Controle de documentos e registros</h2>
<p>De nada adianta ter procedimentos e instrucoes de trabalho excelentes se voce <strong>nao controla versoes, distribuicao e acesso</strong>. O controle de documentos garante que as pessoas certas usem a versao certa no momento certo.</p>

<div class="callout"><strong>ISO 9001:2015 (clausula 7.5):</strong> A norma usa o termo "informacao documentada" e exige que a organizacao controle: (a) distribuicao, acesso, recuperacao e uso; (b) armazenamento e preservacao; (c) controle de alteracoes; (d) retencao e disposicao.</div>

<h3>Documento vs. registro</h3>
<table>
<tr><th>Aspecto</th><th>Documento</th><th>Registro</th></tr>
<tr><td><strong>O que e</strong></td><td>Define como fazer (regra)</td><td>Prova de que foi feito (evidencia)</td></tr>
<tr><td><strong>Muda?</strong></td><td>Sim, e atualizado com novas versoes</td><td>Nao — uma vez gerado, nao pode ser alterado</td></tr>
<tr><td><strong>Exemplos</strong></td><td>Procedimento, IT, politica, manual</td><td>Registro de inspecao, ata, certificado de calibracao</td></tr>
<tr><td><strong>Controle</strong></td><td>Versao, aprovacao, distribuicao</td><td>Retencao (quanto tempo guardar), legibilidade</td></tr>
</table>

<h3>Sistema de controle de documentos</h3>
<p>O controle nao exige software caro. Precisa ter:</p>

<h3>1. Codificacao padrao</h3>
<p>Crie uma logica de codigo unica:</p>
<ul>
<li><strong>Tipo:</strong> PR (procedimento), IT (instrucao), FR (formulario), PL (politica)</li>
<li><strong>Setor:</strong> PRD (producao), QLD (qualidade), ADM (administrativo)</li>
<li><strong>Numero sequencial:</strong> 001, 002, 003...</li>
<li><strong>Exemplo:</strong> PR-PRD-005 = Procedimento de producao numero 5</li>
</ul>

<h3>2. Controle de versao</h3>
<table>
<tr><th>Versao</th><th>Data</th><th>Descricao da alteracao</th><th>Aprovado por</th></tr>
<tr><td>01</td><td>15/01/2025</td><td>Emissao inicial</td><td>Gerente da qualidade</td></tr>
<tr><td>02</td><td>10/06/2025</td><td>Incluido controle de temperatura na etapa 3</td><td>Gerente da qualidade</td></tr>
</table>

<h3>3. Lista mestra de documentos</h3>
<p>Um unico local (planilha ou sistema) que lista TODOS os documentos do SGQ:</p>

<div class="template-box">
<strong>Template: Lista Mestra de Documentos</strong>
<table>
<tr><th>Codigo</th><th>Titulo</th><th>Versao</th><th>Data</th><th>Responsavel</th><th>Local de guarda</th><th>Distribuicao</th></tr>
<tr><td>PR-QLD-001</td><td>Controle de documentos</td><td>03</td><td>10/03/2025</td><td>Coord. Qualidade</td><td>Pasta compartilhada</td><td>Todos os setores</td></tr>
<tr><td>IT-PRD-012</td><td>Operacao do torno CNC</td><td>02</td><td>22/05/2025</td><td>Sup. Producao</td><td>Pasta compartilhada + posto</td><td>Producao</td></tr>
</table>
</div>

<h3>Tempo de retencao de registros</h3>
<p>Registros devem ser mantidos por tempo definido. Alguns exemplos:</p>
<table>
<tr><th>Tipo de registro</th><th>Tempo minimo sugerido</th><th>Base</th></tr>
<tr><td>Registros de treinamento</td><td>Duracao do vinculo + 5 anos</td><td>Legislacao trabalhista</td></tr>
<tr><td>Registros de inspecao de produto</td><td>3 anos (ou vida util do produto)</td><td>Pratica ISO 9001</td></tr>
<tr><td>Registros de calibracao</td><td>2 ciclos de calibracao</td><td>Pratica metrologica</td></tr>
<tr><td>Atas de analise critica</td><td>Ciclo de certificacao (3 anos)</td><td>Pratica de auditoria</td></tr>
<tr><td>Registros de auditoria interna</td><td>3 anos</td><td>Pratica ISO 9001</td></tr>
</table>

<div class="example"><strong>Exemplo — industria alimenticia de Chapeco (SC):</strong> A empresa migrou de pastas fisicas (com 1.200 documentos impressos) para um sistema digital simples (Google Drive estruturado com permissoes). Resultado: tempo de busca de documento caiu de 15 minutos para 30 segundos. Custo de impressao reduziu R$ 2.400/ano. Zero nao-conformidades por documento obsoleto nas ultimas 2 auditorias.</div>

<div class="callout"><strong>Dica pratica para PMEs:</strong> Voce nao precisa de software de gestao documental caro. Uma estrutura de pastas no Google Drive ou SharePoint, com convencao de nome (codigo-titulo-versao) e uma planilha como lista mestra, atende perfeitamente a ISO 9001. O que importa e a DISCIPLINA do controle, nao a ferramenta.</div>
`}, 'Lista mestra de documentos modelo'),

  (${m5.id}, '5-3-melhoria-continua-cultura', 'Melhoria continua como cultura', '15 min', 3, ${`
<h2>Melhoria continua como cultura</h2>
<p>Ferramentas como PDCA, Ishikawa e 5W2H sao poderosas, mas sem <strong>cultura de melhoria</strong>, elas viram formularios que ninguem preenche. A diferenca entre empresas que melhoram de verdade e empresas que apenas "fazem de conta" esta na cultura — nos habitos, valores e comportamentos do dia a dia.</p>

<div class="callout"><strong>Clausula 10.3 da ISO 9001:</strong> "A organizacao deve melhorar continuamente a adequacao, suficiencia e eficacia do sistema de gestao da qualidade." Nao e opcional — e requisito. Mas a norma nao diz COMO criar a cultura. Isso e trabalho de lideranca.</div>

<h3>Os 5 pilares da cultura de melhoria continua</h3>

<h3>1. Lideranca pelo exemplo</h3>
<p>Se o diretor nao participa das reunioes de indicadores, nao vai ao gemba, e nao valoriza as sugestoes de melhoria, nenhuma ferramenta vai funcionar. A cultura comeca no topo.</p>
<ul>
<li>A diretoria participa das analises criticas? (Nao so assina a ata)</li>
<li>Os gestores visitam o chao de fabrica regularmente?</li>
<li>As sugestoes de melhoria recebem resposta em tempo razoavel?</li>
</ul>

<h3>2. Ambiente psicologicamente seguro</h3>
<p>As pessoas so vao reportar problemas e sugerir melhorias se <strong>nao forem punidas por isso</strong>. Se o operador que reporta um erro e advertido, ele aprende a esconder erros — e os problemas ficam invisiveis.</p>

<div class="example"><strong>Exemplo — metalurgica de Canoas (RS):</strong> A empresa mudou a abordagem de tratamento de nao-conformidades: em vez de "quem causou?", passou a perguntar "o que no processo permitiu que isso acontecesse?". Em 6 meses, o numero de problemas reportados AUMENTOU 300% (as pessoas pararam de esconder), e o numero de problemas recorrentes CAIU 60% (porque agora eram tratados de verdade).</div>

<h3>3. Gestao visual e transparencia</h3>
<p>Indicadores visiveis criam consciencia coletiva. Quando o quadro mostra que o refugo esta vermelho, toda a equipe sente a responsabilidade — nao so o supervisor.</p>

<h3>4. Rotina estruturada</h3>
<p>Melhoria continua precisa de <strong>espaco no calendario</strong>:</p>
<table>
<tr><th>Rotina</th><th>Frequencia</th><th>Duracao</th><th>Participantes</th></tr>
<tr><td>Reuniao diaria de producao</td><td>Diaria</td><td>10-15 min</td><td>Operadores + supervisor</td></tr>
<tr><td>Analise de indicadores do processo</td><td>Semanal</td><td>30 min</td><td>Supervisor + gerente</td></tr>
<tr><td>Reuniao de gestao (KPIs)</td><td>Mensal</td><td>60 min</td><td>Gerentes + diretoria</td></tr>
<tr><td>Analise critica pela direcao</td><td>Semestral</td><td>2-3 horas</td><td>Alta direcao + coordenadores</td></tr>
<tr><td>Evento Kaizen</td><td>Trimestral</td><td>3-5 dias</td><td>Equipe multidisciplinar</td></tr>
</table>

<h3>5. Reconhecimento e celebracao</h3>
<p>Valorize quem melhora. Nao precisa ser dinheiro — reconhecimento publico, mencao em reuniao, quadro de honra, almoco especial com a diretoria. O importante e que as pessoas percebam que melhoria e valorizada.</p>

<h3>Maturidade da melhoria continua</h3>
<p>A evolucao da cultura segue niveis:</p>
<table>
<tr><th>Nivel</th><th>Descricao</th><th>Comportamento tipico</th></tr>
<tr><td><strong>1 — Apaga incendio</strong></td><td>So resolve quando estoura</td><td>"Conserta ai que o cliente ta reclamando"</td></tr>
<tr><td><strong>2 — Reativo</strong></td><td>Trata problemas com ferramentas</td><td>"Vamos fazer um Ishikawa pra esse defeito"</td></tr>
<tr><td><strong>3 — Preventivo</strong></td><td>Antecipa problemas com analise de risco</td><td>"O FMEA mostrou risco alto nessa etapa, vamos agir"</td></tr>
<tr><td><strong>4 — Proativo</strong></td><td>Busca melhorias mesmo sem problemas</td><td>"O processo ta OK, mas podemos reduzir o lead time"</td></tr>
<tr><td><strong>5 — Inovador</strong></td><td>Melhoria faz parte do DNA</td><td>"Cada pessoa contribui com melhorias todo mes"</td></tr>
</table>

<div class="callout"><strong>Realidade brasileira:</strong> A maioria das PMEs brasileiras esta entre os niveis 1 e 2. Chegar ao nivel 3 ja e uma conquista significativa e atende bem a ISO 9001. O caminho do nivel 1 ao 3 leva tipicamente 12-18 meses de trabalho consistente.</div>
`}, NULL),

  (${m5.id}, '5-4-encerramento-plano-acao', 'Encerramento: montando seu plano de acao', '15 min', 4, ${`
<h2>Encerramento: montando seu plano de acao</h2>
<p>Voce chegou ao final do curso. Aprendeu a mapear processos (SIPOC, fluxograma), definir indicadores (KPIs, dashboards, BSC), analisar problemas (Ishikawa, Pareto, 5 Porques, GUT, FMEA) e implementar melhorias (PDCA, A3, 5W2H, Kaizen). Agora e hora de <strong>transformar conhecimento em acao</strong>.</p>

<div class="callout"><strong>Lembre-se:</strong> Conhecimento sem acao e entretenimento. O valor deste curso esta no que voce VAI FAZER a partir de amanha.</div>

<h3>Seu plano de acao pessoal — 90 dias</h3>
<p>Nao tente fazer tudo de uma vez. Siga uma sequencia logica de 3 fases:</p>

<h3>Fase 1 — Semanas 1 a 4: Mapear</h3>
<ul>
<li><strong>Escolha 1 processo critico:</strong> Aquele que mais gera reclamacao, retrabalho ou custo</li>
<li><strong>Faca o SIPOC:</strong> Com a equipe que executa o processo (nao sozinho na sala)</li>
<li><strong>Faca o fluxograma do estado atual:</strong> Va ao gemba, observe, pergunte, registre</li>
<li><strong>Identifique 3-5 pontos de melhoria:</strong> Retrabalhos, esperas, handoffs problematicos</li>
</ul>

<h3>Fase 2 — Semanas 5 a 8: Medir e analisar</h3>
<ul>
<li><strong>Defina 2-3 indicadores para o processo:</strong> Use a ficha de KPI (formula, meta, frequencia, responsavel)</li>
<li><strong>Comece a medir:</strong> Mesmo que manual, comece. Dados imperfeitos sao melhores que nenhum dado.</li>
<li><strong>Analise o problema prioritario:</strong> Use Ishikawa + 5 Porques para encontrar a causa raiz</li>
<li><strong>Monte o plano de acao 5W2H:</strong> Para cada causa raiz, defina acoes concretas</li>
</ul>

<h3>Fase 3 — Semanas 9 a 12: Melhorar e padronizar</h3>
<ul>
<li><strong>Implemente as acoes:</strong> Execute o 5W2H, acompanhe semanalmente</li>
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
<tr><td>2</td><td>Coletar dados e analisar</td><td>Semana 6-7</td><td>Ishikawa + 5 Porques</td><td>Diagrama Ishikawa + analise de causa raiz</td></tr>
<tr><td>2</td><td>Elaborar plano de acao</td><td>Semana 8</td><td>5W2H</td><td>Plano de acao com responsaveis e prazos</td></tr>
<tr><td>3</td><td>Implementar acoes</td><td>Semana 9-10</td><td>5W2H + PDCA</td><td>Acoes executadas</td></tr>
<tr><td>3</td><td>Medir resultado e padronizar</td><td>Semana 11-12</td><td>Indicadores + IT</td><td>Resultado antes vs. depois + IT atualizada</td></tr>
</table>
</div>

<div class="example"><strong>Caso real — empresa de medio porte de Campinas (SP):</strong><br>
Um aluno deste curso aplicou o plano de 90 dias no processo de "expedicao de pedidos". Resultados:<br>
<ul>
<li><strong>SIPOC:</strong> Revelou que 40% dos atrasos de entrega vinham de informacao incompleta do comercial</li>
<li><strong>KPI:</strong> OTIF (On Time In Full) — medicao inicial: 72%</li>
<li><strong>Ishikawa + 5 Porques:</strong> Causa raiz: pedido entrava no sistema sem especificacao de embalagem, gerando retrabalho na expedicao</li>
<li><strong>5W2H:</strong> Campo obrigatorio de embalagem no sistema + checklist de conferencia do pedido</li>
<li><strong>Resultado apos 90 dias:</strong> OTIF subiu de 72% para 94%. Custo de retrabalho na expedicao caiu R$ 8.500/mes</li>
</ul></div>

<h3>Proximos passos apos o curso</h3>
<p>Recomendamos continuar sua formacao:</p>
<ul>
<li><strong>ISO 9001:2015 — Interpretacao dos Requisitos</strong> — se voce vai implantar ou manter um SGQ</li>
<li><strong>Auditor Interno ISO 9001:2015</strong> — se voce vai auditar processos</li>
<li><strong>5S na Pratica Industrial</strong> — se voce quer comecar a mudanca de cultura pelo basico</li>
</ul>

<div class="callout"><strong>Mensagem final:</strong> Gestao por processos nao e um projeto com inicio, meio e fim. E uma FORMA DE TRABALHAR. O dia que voce parar de olhar para os processos e indicadores, eles comecam a degradar. Faca da melhoria continua um habito — e os resultados virao, consistentes e sustentaveis.</div>
`}, 'Plano de acao 90 dias preenchivel')`;

  // ── QUIZ: Module quizzes + Final quiz ──

  // Module 1 quiz
  const m1q = [
    ['Qual e a definicao de processo segundo a ISO 9000:2015?', ['Uma sequencia de departamentos','Um conjunto de atividades inter-relacionadas que transforma entradas em saidas','Um documento que descreve uma tarefa','Uma funcao organizacional'], 1, 'A ISO 9000:2015 define processo como conjunto de atividades inter-relacionadas que utilizam entradas para entregar um resultado pretendido.'],
    ['Quais sao os 3 tipos de processo em uma organizacao?', ['Primarios, secundarios e terciarios','Produtivos, administrativos e financeiros','Primarios, de apoio e gerenciais','Internos, externos e mistos'], 2, 'Os 3 tipos sao: primarios (geram valor para o cliente), de apoio (suportam os primarios) e gerenciais (direcionam e monitoram).'],
    ['O que significa a sigla SIPOC?', ['Sistema Integrado de Producao e Controle','Supplier, Input, Process, Output, Customer','Seguranca, Indicadores, Processos, Organizacao, Cliente','Sequencia, Inspecao, Padrao, Operacao, Controle'], 1, 'SIPOC e o acronimo para Supplier (Fornecedor), Input (Entrada), Process (Processo), Output (Saida), Customer (Cliente).'],
    ['Qual e a principal diferenca entre o SIPOC e o fluxograma?', ['O SIPOC e mais detalhado','O fluxograma mostra a visao macro e o SIPOC o detalhe','O SIPOC mostra a visao macro (5-7 etapas) e o fluxograma detalha passo a passo','Nao ha diferenca significativa'], 2, 'O SIPOC mostra a visao macro do processo (5-7 etapas), enquanto o fluxograma detalha cada passo, decisao e interacao.'],
    ['O que e um fluxograma funcional (swimlane)?', ['Um fluxograma com cores diferentes','Um fluxograma dividido em raias por departamento ou funcao','Um fluxograma simplificado','Um fluxograma exclusivo para processos de RH'], 1, 'O fluxograma swimlane divide o processo em raias (lanes), cada uma representando um departamento ou funcao, tornando visivel quem faz o que.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 2 quiz
  const m2q = [
    ['Qual e a diferenca entre eficacia e eficiencia?', ['Sao sinonimos','Eficacia e atingir o resultado; eficiencia e usar bem os recursos','Eficacia e financeira; eficiencia e operacional','Eficiencia e mais importante que eficacia'], 1, 'Eficacia mede se o resultado foi atingido. Eficiencia mede se os recursos foram bem utilizados.'],
    ['O que e um indicador de tendencia (leading)?', ['Um indicador que mede resultados passados','Um indicador que mede fatores que influenciam resultados futuros','Um indicador financeiro','Um indicador de satisfacao do cliente'], 1, 'Indicadores leading medem fatores que influenciam o resultado futuro, permitindo agir antes que o problema apareca.'],
    ['Quantos elementos essenciais deve ter um KPI bem definido?', ['3','5','7','10'], 2, 'Um KPI precisa de 7 elementos: nome, formula, unidade, frequencia, meta, fonte de dados e responsavel.'],
    ['Qual e a principal funcao de um dashboard operacional?', ['Impressionar a diretoria com graficos bonitos','Mostrar indicadores de forma visual para facilitar tomada de decisao rapida','Substituir reunioes de gestao','Atender requisito de auditoria ISO'], 1, 'O dashboard operacional torna indicadores visiveis para que operadores e supervisores tomem decisoes rapidas.'],
    ['O BSC (Balanced Scorecard) tem quantas perspectivas?', ['2','3','4','6'], 2, 'O BSC tem 4 perspectivas: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 3 quiz
  const m3q = [
    ['O diagrama de Ishikawa tambem e conhecido como:', ['Diagrama de Pareto','Diagrama de dispersao','Espinha de peixe ou causa e efeito','Grafico de controle'], 2, 'O diagrama de Ishikawa tambem e chamado de espinha de peixe (pela forma) ou diagrama de causa e efeito (pela funcao).'],
    ['Quais sao as 6 categorias classicas (6M) do Ishikawa?', ['Marketing, Mercado, Margem, Marca, Meta, Missao','Maquina, Metodo, Mao de obra, Material, Meio ambiente, Medicao','Manual, Modelo, Matriz, Mapa, Meta, Monitoramento','Manutencao, Material, Mao de obra, Mercado, Metodo, Margem'], 1, 'Os 6M sao: Maquina, Metodo, Mao de obra, Material, Meio ambiente e Medicao.'],
    ['O principio de Pareto afirma que:', ['Todos os problemas tem o mesmo peso','100% dos problemas vem de 100% das causas','Aproximadamente 80% dos problemas vem de 20% das causas','50% dos problemas vem de 50% das causas'], 2, 'O principio 80/20 de Pareto indica que cerca de 80% dos problemas sao causados por 20% das causas.'],
    ['Na Matriz GUT, a letra T significa:', ['Tempo','Tarefa','Tendencia','Tolerancia'], 2, 'T significa Tendencia — avalia se o problema vai piorar com o tempo caso nao seja tratado.'],
    ['O que o RPN (Risk Priority Number) do FMEA calcula?', ['Custo do risco','Severidade x Ocorrencia x Deteccao','Gravidade x Urgencia x Tendencia','Probabilidade x Impacto'], 1, 'O RPN e o produto de Severidade (S) x Ocorrencia (O) x Deteccao (D), usado para priorizar riscos no FMEA.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 4 quiz
  const m4q = [
    ['Qual e a sequencia correta das 4 fases do PDCA?', ['Plan, Do, Control, Act','Plan, Do, Check, Act','Process, Define, Check, Adjust','Plan, Design, Check, Approve'], 1, 'PDCA significa Plan (Planejar), Do (Executar), Check (Verificar), Act (Agir).'],
    ['O relatorio A3 recebe esse nome porque:', ['Tem 3 secoes de analise','Usa uma folha no formato A3 para resumir todo o ciclo de resolucao','Foi criado na planta A3 da Toyota','Tem 3 paginas obrigatorias'], 1, 'O A3 recebe esse nome porque resume todo o ciclo de resolucao de problemas em uma unica folha no formato A3 (42x30cm).'],
    ['No 5W2H, o campo "Who" deve conter:', ['O nome do departamento responsavel','O nome da pessoa responsavel pela execucao','O nome do gerente geral','O nome do auditor'], 1, 'O campo Who deve conter o nome da pessoa responsavel, nao do departamento. Se nao tem nome, nao tem dono.'],
    ['Qual a diferenca entre PDCA e SDCA?', ['SDCA e a versao digital do PDCA','PDCA melhora; SDCA mantem o padrao ja conquistado','SDCA e usado apenas em servicos','Nao ha diferenca'], 1, 'PDCA e para melhorar (subir o nivel). SDCA (Standardize-Do-Check-Act) e para manter (nao deixar cair o padrao conquistado).'],
    ['Um evento Kaizen tipicamente dura:', ['1 dia','3 a 5 dias','2 semanas','1 mes'], 1, 'Um evento Kaizen (Kaizen Blitz) tipicamente dura de 3 a 5 dias com uma equipe dedicada.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 5 quiz
  const m5q = [
    ['Qual e a principal diferenca entre procedimento e instrucao de trabalho?', ['O procedimento e mais curto','O procedimento diz O QUE fazer; a instrucao de trabalho detalha COMO fazer','A instrucao de trabalho e para gestores e o procedimento para operadores','Nao ha diferenca pratica'], 1, 'O procedimento define o que fazer e quem faz (visao geral). A instrucao de trabalho detalha como fazer, passo a passo (nivel operacional).'],
    ['Na ISO 9001:2015, o termo usado para documentos e registros e:', ['Manual da qualidade','Procedimento operacional padrao','Informacao documentada','Arquivo de gestao'], 2, 'A ISO 9001:2015 usa o termo unico "informacao documentada" em substituicao a "documentos" e "registros" da versao anterior.'],
    ['Qual comportamento indica que a cultura de melhoria continua esta viva?', ['O SGQ so e atualizado antes de auditorias','Problemas sao reportados voluntariamente sem medo de punicao','Apenas o setor de qualidade se preocupa com melhorias','Os indicadores sao medidos mas nao discutidos'], 1, 'Quando as pessoas reportam problemas voluntariamente e sem medo de punicao, a cultura de melhoria continua esta funcionando.'],
    ['Qual e a sequencia recomendada no plano de 90 dias do curso?', ['Melhorar, medir, mapear','Medir, mapear, melhorar','Mapear, medir e analisar, melhorar e padronizar','Padronizar, medir, melhorar'], 2, 'A sequencia logica e: Fase 1 - Mapear (SIPOC e fluxograma), Fase 2 - Medir e analisar (KPIs e causa raiz), Fase 3 - Melhorar e padronizar.'],
    ['Qual a principal funcao da lista mestra de documentos?', ['Substituir os documentos originais','Listar todos os documentos do SGQ com versao, responsavel e local de guarda','Servir como backup dos documentos','Atender exclusivamente a auditoria externa'], 1, 'A lista mestra e o indice centralizado que lista todos os documentos do SGQ com codigo, versao, data, responsavel e local de guarda.'],
  ];
  for (const [p, a, r, e] of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m5.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ── Final quiz (25 questions) ──
  const finalQ = [
    ['A ISO 9000:2015 define processo como:', ['Um departamento funcional','Um conjunto de atividades inter-relacionadas que transforma entradas em saidas','Uma norma de certificacao','Um indicador de desempenho'], 1, 'Processo e um conjunto de atividades inter-relacionadas que utilizam entradas para entregar um resultado pretendido.'],
    ['Os processos de apoio (suporte) tem como funcao:', ['Gerar valor direto para o cliente externo','Suportar os processos primarios','Substituir os processos gerenciais','Auditar os processos produtivos'], 1, 'Processos de apoio suportam os processos primarios, como RH, TI, compras e manutencao.'],
    ['A clausula 4.4 da ISO 9001:2015 exige que a organizacao:', ['Tenha um manual da qualidade','Determine os processos necessarios para o SGQ e gerencie suas interacoes','Contrate consultoria de processos','Implemente software de BPM'], 1, 'A clausula 4.4 exige determinar os processos, suas entradas, saidas, sequencia, interacao, criterios e recursos.'],
    ['No SIPOC, a letra "C" representa:', ['Controle','Custo','Customer (Cliente)','Competencia'], 2, 'C significa Customer (Cliente) — quem recebe as saidas do processo.'],
    ['Qual tipo de fluxograma e mais indicado para processos que cruzam departamentos?', ['Fluxograma linear','Fluxograma de decisao','Fluxograma funcional (swimlane)','Diagrama de blocos'], 2, 'O fluxograma swimlane divide o processo em raias por departamento, tornando visiveis as transferencias e responsabilidades.'],
    ['A diferenca entre indicador lagging e leading e:', ['Lagging e financeiro; leading e operacional','Lagging mede resultado passado; leading mede fator que influencia resultado futuro','Lagging e estrategico; leading e operacional','Nao ha diferenca pratica'], 1, 'Indicadores lagging medem resultados passados; leading medem fatores que influenciam resultados futuros.'],
    ['Um KPI bem definido precisa ter, entre outros elementos:', ['Apenas nome e meta','Formula, meta, frequencia, fonte de dados e responsavel','Apenas formula e unidade','Apenas meta e prazo'], 1, 'Um KPI completo inclui: nome, formula, unidade, frequencia, meta, fonte de dados e responsavel.'],
    ['O BSC (Balanced Scorecard) conecta:', ['Departamentos com fornecedores','Estrategia da empresa com indicadores operacionais do dia a dia','Normas ISO com legislacao','Auditoria interna com auditoria externa'], 1, 'O BSC traduz objetivos estrategicos em metas e indicadores operacionais para cada nivel da organizacao.'],
    ['As 4 perspectivas do BSC sao:', ['Producao, vendas, financeiro e RH','Financeira, clientes, processos internos e aprendizado e crescimento','Qualidade, custo, entrega e seguranca','Estrategica, tatica, operacional e individual'], 1, 'As 4 perspectivas do BSC sao: Financeira, Clientes, Processos Internos e Aprendizado e Crescimento.'],
    ['O diagrama de Ishikawa utiliza as categorias 6M. Quais sao?', ['Marketing, Mercado, Margem, Marca, Meta, Missao','Maquina, Metodo, Mao de obra, Material, Meio ambiente, Medicao','Manutencao, Material, Metodo, Mao de obra, Modelo, Meta','Maquina, Manutencao, Mao de obra, Material, Modelo, Missao'], 1, 'Os 6M do Ishikawa sao: Maquina, Metodo, Mao de obra, Material, Meio ambiente e Medicao.'],
    ['A tecnica dos 5 Porques busca:', ['Identificar 5 problemas diferentes','Encontrar a causa raiz de um problema perguntando "por que?" repetidamente','Definir 5 metas para cada indicador','Eleger 5 prioridades de melhoria'], 1, 'Os 5 Porques aprofundam a investigacao perguntando "por que?" repetidamente ate chegar a causa raiz.'],
    ['O Diagrama de Pareto e baseado no principio:', ['60/40','70/30','80/20','90/10'], 2, 'O principio de Pareto (80/20) afirma que aproximadamente 80% dos problemas vem de 20% das causas.'],
    ['Na Matriz GUT, como e calculada a prioridade?', ['G + U + T','G x U x T','(G + U) x T','G x (U + T)'], 1, 'A prioridade na Matriz GUT e calculada multiplicando Gravidade x Urgencia x Tendencia.'],
    ['O FMEA e uma ferramenta de natureza:', ['Reativa — analisa problemas que ja ocorreram','Preventiva — analisa falhas potenciais antes que ocorram','Corretiva — define acoes para problemas existentes','Descritiva — apenas documenta o processo'], 1, 'O FMEA e preventivo: identifica modos de falha potenciais e seus riscos antes que as falhas acontecam.'],
    ['No FMEA, o indice D (Deteccao) mede:', ['A duracao da falha','A dificuldade de resolver o problema','A capacidade de detectar a falha antes que chegue ao cliente','O custo da deteccao'], 2, 'D (Deteccao) mede a probabilidade de o controle atual detectar a falha antes que ela alcance o cliente.'],
    ['A fase mais negligenciada do PDCA e geralmente:', ['Plan (Planejar)','Do (Executar)','Check (Verificar)','Act (Agir)'], 0, 'A fase Plan e a mais importante e a mais negligenciada. Sem planejamento adequado, as acoes viram "apaga incendio".'],
    ['O relatorio A3 segue a logica de qual ciclo?', ['DMAIC','PDCA','BSC','FMEA'], 1, 'O A3 segue a logica do PDCA: lado esquerdo (Plan), lado direito (Do/Check/Act).'],
    ['No 5W2H, a principal regra para o campo "Quem" e:', ['Deve conter o nome do departamento','Deve conter o nome da pessoa responsavel, nao do departamento','Deve conter o nome do diretor','Deve conter o nome do auditor'], 1, 'O campo "Quem" deve ter um nome de pessoa, nao de departamento. Sem responsavel definido, a acao nao acontece.'],
    ['Qual e a diferenca fundamental entre Kaizen diario e evento Kaizen?', ['Kaizen diario custa mais','Kaizen diario sao pequenas melhorias continuas; evento Kaizen e intensivo de 3-5 dias num processo especifico','Evento Kaizen e feito por consultores externos','Nao ha diferenca pratica'], 1, 'Kaizen diario sao pequenas melhorias feitas no dia a dia por cada pessoa. Evento Kaizen e um projeto intensivo de 3-5 dias focado em um processo.'],
    ['A ISO 9001:2015 usa o termo "informacao documentada" para substituir:', ['Manual e politica','Documentos e registros','Procedimentos e instrucoes','Formularios e checklists'], 1, 'A versao 2015 unificou "documentos" e "registros" no termo unico "informacao documentada".'],
    ['Qual e a funcao da lista mestra de documentos?', ['Substituir os documentos originais','Servir como indice centralizado de todos os documentos do SGQ com versao e responsavel','Ser enviada ao organismo de certificacao','Controlar o acesso dos funcionarios ao sistema'], 1, 'A lista mestra e o indice que centraliza todos os documentos do SGQ com codigo, versao, data e responsavel.'],
    ['Num dashboard eficaz, qual e o numero maximo recomendado de indicadores por tela?', ['3','5','7','15'], 2, 'A recomendacao e de no maximo 7 indicadores por tela de dashboard para que sejam absorvidos efetivamente.'],
    ['A diferenca entre PDCA e SDCA e:', ['SDCA e a versao atualizada do PDCA','PDCA busca melhorar; SDCA busca manter o padrao conquistado','SDCA usa apenas 3 fases','PDCA e para qualidade; SDCA e para producao'], 1, 'PDCA e para melhorar (subir o nivel de desempenho). SDCA e para manter (padronizar e nao deixar cair).'],
    ['No contexto de gestao visual, o principio "torne os problemas visiveis" e atribuido a:', ['ISO 9001','Peter Drucker','Toyota','Henry Ford'], 2, 'O principio de tornar problemas visiveis e parte da cultura Toyota e do Sistema Toyota de Producao (TPS).'],
    ['Qual e a sequencia recomendada para resolver um problema usando as ferramentas do curso?', ['5W2H, depois Ishikawa, depois Pareto','Pareto para priorizar, Ishikawa/5 Porques para causa raiz, 5W2H para plano de acao','FMEA, depois A3, depois PDCA','Fluxograma, depois BSC, depois GUT'], 1, 'A sequencia logica e: Pareto (priorizar qual problema), Ishikawa/5 Porques (encontrar causa raiz), 5W2H (plano de acao concreto).'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
