export async function seedCourse2(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      'auditor-interno-iso-9001',
      'Auditor Interno ISO 9001:2015',
      'Aprenda a planejar, conduzir e relatar auditorias internas com base na ISO 19011:2018.',
      'Curso completo de formacao de auditor interno com foco pratico: tecnicas de auditoria, elaboracao de checklist, conducao de entrevistas, relatorio de nao conformidades e acompanhamento de acoes corretivas.',
      '16 horas',
      497, 797,
      'Auditores internos, coordenadores de qualidade, analistas de SGQ, gestores',
      'Conhecimento basico de ISO 9001:2015 (recomendado o curso de Interpretacao)',
      'Formar auditores internos capazes de planejar, executar e relatar auditorias de SGQ com base na ISO 19011:2018.',
      2
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos da Auditoria ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos da Auditoria', 'Conceitos basicos, tipos de auditoria, principios e terminologia da ISO 19011', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '2-1-1-o-que-e-auditoria', 'O que e auditoria e tipos (1a, 2a, 3a parte)', '20 min', 1, ${`
<h2>O que e auditoria?</h2>
<p>Auditoria e um <strong>processo sistematico, independente e documentado</strong> para obter evidencias objetivas e avalia-las de forma imparcial, a fim de determinar em que grau os criterios de auditoria sao atendidos. Essa definicao vem da ISO 19011:2018 e e a base de tudo que voce aprendera neste curso.</p>

<div class="callout"><strong>Ponto-chave:</strong> Auditoria nao e inspecao, nao e fiscalizacao e nao e "caca as bruxas". E um processo de <strong>verificacao baseada em evidencias</strong> que ajuda a organizacao a melhorar.</div>

<h3>Tipos de auditoria por "parte"</h3>
<p>As auditorias sao classificadas conforme quem as realiza e com qual objetivo:</p>

<table>
<tr><th>Tipo</th><th>Quem realiza</th><th>Objetivo principal</th><th>Exemplo</th></tr>
<tr><td><strong>1a parte (interna)</strong></td><td>A propria organizacao</td><td>Verificar se o SGQ esta funcionando e identificar melhorias</td><td>Auditor interno da metalurgica verifica o setor de usinagem</td></tr>
<tr><td><strong>2a parte (de fornecedor)</strong></td><td>O cliente no fornecedor</td><td>Avaliar a capacidade do fornecedor de atender requisitos</td><td>Montadora audita o fornecedor de pecas estampadas</td></tr>
<tr><td><strong>3a parte (de certificacao)</strong></td><td>Organismo certificador independente</td><td>Conceder, manter ou renovar o certificado ISO 9001</td><td>Bureau Veritas audita a construtora para certificacao</td></tr>
</table>

<h3>Auditoria interna: o foco deste curso</h3>
<p>A auditoria interna (1a parte) e um <strong>requisito obrigatorio</strong> da ISO 9001:2015 (clausula 9.2). A organizacao deve conduzir auditorias internas a intervalos planejados para verificar se o SGQ esta conforme com os requisitos da propria organizacao e com a norma, e se esta mantido e implementado eficazmente.</p>

<div class="example"><strong>Na pratica:</strong> Uma cooperativa agricola de graos realiza auditorias internas semestrais. No primeiro semestre, cobre os processos de recebimento, classificacao e armazenagem. No segundo, compras, logistica e atendimento ao cooperado. Ao final do ano, todos os processos foram auditados.</div>

<h3>Auditorias combinadas e conjuntas</h3>
<p>Alem da classificacao por "parte", existem duas modalidades especiais:</p>
<ul>
<li><strong>Auditoria combinada:</strong> Duas ou mais normas auditadas ao mesmo tempo (ex: ISO 9001 + ISO 14001 numa unica auditoria). Economiza tempo e recursos.</li>
<li><strong>Auditoria conjunta:</strong> Dois ou mais organismos/organizacoes auditam juntos o mesmo auditado (menos comum).</li>
</ul>

<h3>Diferenca entre auditoria e inspecao</h3>
<table>
<tr><th>Aspecto</th><th>Auditoria</th><th>Inspecao</th></tr>
<tr><td>Foco</td><td>Sistema, processo, gestao</td><td>Produto, peca, servico especifico</td></tr>
<tr><td>Natureza</td><td>Amostral, sistematica</td><td>Pode ser 100% ou amostral</td></tr>
<tr><td>Resultado</td><td>Constatacoes e conclusoes</td><td>Aprovado/reprovado</td></tr>
<tr><td>Realizada por</td><td>Auditor qualificado</td><td>Inspetor/controlador de qualidade</td></tr>
</table>

<div class="callout"><strong>Lembre-se:</strong> Auditoria avalia o <strong>sistema</strong> (como a organizacao gerencia a qualidade). Inspecao avalia o <strong>produto</strong> (se a peca esta dentro da tolerancia). Sao complementares, nao substitutos.</div>
`}, NULL),

  (${m1.id}, '2-1-2-principios-auditoria', 'Os 7 principios da auditoria (ISO 19011)', '20 min', 2, ${`
<h2>Os 7 principios da auditoria</h2>
<p>A ISO 19011:2018 estabelece 7 principios que sustentam a pratica da auditoria. Eles guiam o comportamento do auditor e garantem que os resultados sejam confiaveis e uteis. Um auditor que nao segue esses principios compromete toda a credibilidade do processo.</p>

<h3>1. Integridade</h3>
<p>O auditor deve ser <strong>honesto, diligente e responsavel</strong>. Relatar as constatacoes de forma verdadeira e precisa, mesmo quando os resultados nao sao os que o auditado (ou o gestor do programa) gostaria de ouvir.</p>
<div class="example"><strong>Situacao real:</strong> Numa metalurgica, o auditor interno e amigo do supervisor da producao. Durante a auditoria, encontra registros de inspecao nao preenchidos. Integridade significa registrar a constatacao — nao "dar um jeitinho" porque sao amigos.</div>

<h3>2. Apresentacao justa</h3>
<p>As constatacoes, conclusoes e relatorios devem refletir <strong>fielmente</strong> as atividades da auditoria. Sem exageros, sem minimizacao, sem omissoes.</p>

<h3>3. Devido cuidado profissional</h3>
<p>Aplicar diligencia e julgamento nas atividades de auditoria. Isso inclui <strong>preparacao adequada</strong>, conhecimento dos criterios, e cuidado ao tirar conclusoes.</p>

<h3>4. Confidencialidade</h3>
<p>O auditor tem acesso a informacoes sensiveis — processos, dados financeiros, problemas internos. Essas informacoes <strong>nao devem ser divulgadas</strong> sem autorizacao.</p>
<div class="callout"><strong>Na pratica:</strong> Se voce audita o setor de compras e descobre que um fornecedor pratica precos muito abaixo do mercado, nao pode comentar isso no almoco com colegas de outros setores. A informacao fica restrita ao relatorio.</div>

<h3>5. Independencia</h3>
<p>O auditor deve ser <strong>independente da atividade auditada</strong>. Na auditoria interna, isso significa que voce nao pode auditar seu proprio trabalho ou seu proprio setor.</p>

<div class="example"><strong>Regra pratica:</strong> O analista de qualidade pode auditar a producao. O supervisor de producao pode auditar o almoxarifado. Mas nenhum deles audita a si mesmo. Isso preserva a objetividade.</div>

<h3>6. Abordagem baseada em evidencia</h3>
<p>Toda constatacao deve ser sustentada por <strong>evidencias objetivas</strong> — registros, observacoes diretas, declaracoes verificaveis. Opiniao nao e evidencia. "Eu acho que..." nao e aceito.</p>

<h3>7. Abordagem baseada em risco</h3>
<p>Novidade da versao 2018 da ISO 19011. O auditor deve considerar os riscos e oportunidades ao planejar e conduzir a auditoria, priorizando areas de maior impacto.</p>

<table>
<tr><th>Principio</th><th>Pergunta-guia para o auditor</th></tr>
<tr><td>Integridade</td><td>Estou relatando com honestidade?</td></tr>
<tr><td>Apresentacao justa</td><td>Minhas constatacoes refletem a realidade?</td></tr>
<tr><td>Cuidado profissional</td><td>Estou preparado e sendo diligente?</td></tr>
<tr><td>Confidencialidade</td><td>Estou protegendo as informacoes?</td></tr>
<tr><td>Independencia</td><td>Estou livre de conflito de interesse?</td></tr>
<tr><td>Baseada em evidencia</td><td>Tenho provas objetivas?</td></tr>
<tr><td>Baseada em risco</td><td>Priorizei o que tem maior impacto?</td></tr>
</table>
`}, 'Autoavaliacao: voce pratica os 7 principios?'),

  (${m1.id}, '2-1-3-estrutura-iso-19011', 'Estrutura da ISO 19011:2018', '15 min', 3, ${`
<h2>Estrutura da ISO 19011:2018</h2>
<p>A ISO 19011 e a norma-guia para auditoria de qualquer sistema de gestao — ISO 9001, 14001, 45001, 27001, etc. Ela nao e certificavel (nao existe "certificacao ISO 19011"), mas e a <strong>referencia tecnica</strong> que todo auditor deve conhecer.</p>

<div class="callout"><strong>Importante:</strong> A ISO 19011:2018 substituiu a versao 2012. A principal novidade foi a inclusao da <strong>abordagem baseada em risco</strong> como setimo principio e como diretriz para o programa de auditoria.</div>

<h3>Clausulas da ISO 19011:2018</h3>
<table>
<tr><th>Clausula</th><th>Titulo</th><th>Conteudo</th></tr>
<tr><td>1</td><td>Escopo</td><td>Aplicacao da norma (auditoria de sistemas de gestao)</td></tr>
<tr><td>2</td><td>Referencias normativas</td><td>Nenhuma (norma independente)</td></tr>
<tr><td>3</td><td>Termos e definicoes</td><td>Vocabulario de auditoria</td></tr>
<tr><td>4</td><td>Principios de auditoria</td><td>Os 7 principios que vimos na aula anterior</td></tr>
<tr><td><strong>5</strong></td><td><strong>Gestao do programa de auditoria</strong></td><td>Como planejar e gerenciar o conjunto de auditorias</td></tr>
<tr><td><strong>6</strong></td><td><strong>Realizacao da auditoria</strong></td><td>Como conduzir uma auditoria individual (do inicio ao fim)</td></tr>
<tr><td><strong>7</strong></td><td><strong>Competencia e avaliacao de auditores</strong></td><td>Conhecimentos, habilidades e comportamento esperados</td></tr>
</table>

<h3>Clausula 5 — Programa de auditoria</h3>
<p>A clausula 5 trata do <strong>panorama geral</strong>: o programa de auditoria e o conjunto de todas as auditorias planejadas para um periodo (geralmente 1 ano). Inclui definicao de objetivos, escopo, recursos, cronograma e criterios de selecao de auditores.</p>

<h3>Clausula 6 — Realizacao da auditoria</h3>
<p>A clausula 6 detalha o <strong>passo a passo</strong> de cada auditoria individual:</p>
<ol>
<li>Inicio da auditoria (contato inicial, viabilidade)</li>
<li>Preparacao das atividades (analise documental, plano, checklist)</li>
<li>Conducao da auditoria (reuniao de abertura, coleta de evidencias, reuniao de encerramento)</li>
<li>Preparacao e distribuicao do relatorio</li>
<li>Conclusao da auditoria</li>
<li>Acompanhamento (follow-up)</li>
</ol>

<h3>Clausula 7 — Competencia de auditores</h3>
<p>Define os <strong>conhecimentos e habilidades</strong> que um auditor deve ter, incluindo conhecimento da norma, do setor, tecnicas de auditoria, e atributos pessoais como imparcialidade e postura etica.</p>

<div class="example"><strong>Visao geral:</strong> Pense assim — a clausula 5 responde "quantas auditorias e quando?", a clausula 6 responde "como fazer cada auditoria?" e a clausula 7 responde "quem esta qualificado para auditar?".</div>
`}, NULL),

  (${m1.id}, '2-1-4-termos-definicoes', 'Termos e definicoes essenciais', '15 min', 4, ${`
<h2>Termos e definicoes essenciais</h2>
<p>Para comunicar com clareza durante uma auditoria, voce precisa dominar o vocabulario tecnico. Confundir "constatacao" com "conclusao" ou "criterio" com "evidencia" gera mal-entendidos que comprometem o relatorio e a credibilidade do auditor.</p>

<h3>Glossario do auditor</h3>
<table>
<tr><th>Termo</th><th>Definicao</th><th>Exemplo pratico</th></tr>
<tr><td><strong>Auditado</strong></td><td>Organizacao ou parte dela que esta sendo auditada</td><td>O setor de expedicao da metalurgica</td></tr>
<tr><td><strong>Auditor</strong></td><td>Pessoa que conduz a auditoria</td><td>O analista de qualidade treinado como auditor interno</td></tr>
<tr><td><strong>Equipe auditora</strong></td><td>Um ou mais auditores que conduzem uma auditoria, incluindo o auditor-lider</td><td>Maria (lider) + Joao (auditor tecnico)</td></tr>
<tr><td><strong>Criterio de auditoria</strong></td><td>Conjunto de requisitos usados como referencia para comparar as evidencias</td><td>ISO 9001 clausula 8.5, procedimento interno PO-012</td></tr>
<tr><td><strong>Evidencia de auditoria</strong></td><td>Registros, declaracoes de fato ou outras informacoes verificaveis</td><td>Registro de inspecao preenchido, certificado de calibracao valido</td></tr>
<tr><td><strong>Constatacao de auditoria</strong></td><td>Resultado da avaliacao da evidencia contra o criterio</td><td>"O registro de inspecao do lote 4523 nao foi preenchido" (nao conformidade)</td></tr>
<tr><td><strong>Conclusao de auditoria</strong></td><td>Resultado geral da auditoria, considerando os objetivos e todas as constatacoes</td><td>"O processo de expedicao atende parcialmente os requisitos; 2 NCs menores identificadas"</td></tr>
</table>

<div class="callout"><strong>Hierarquia logica:</strong> Criterio → Evidencia → Constatacao → Conclusao. O auditor compara a evidencia com o criterio para gerar constatacoes, e agrupa as constatacoes para chegar a uma conclusao.</div>

<h3>Outros termos importantes</h3>
<ul>
<li><strong>Nao conformidade (NC):</strong> Nao atendimento de um requisito. Pode ser maior ou menor.</li>
<li><strong>Conformidade:</strong> Atendimento de um requisito.</li>
<li><strong>Oportunidade de melhoria (OM):</strong> Situacao que atende o requisito mas poderia ser melhor.</li>
<li><strong>Observacao:</strong> Termo informal usado por alguns organismos para situacoes que podem se tornar NC se nao tratadas.</li>
<li><strong>Programa de auditoria:</strong> Conjunto de auditorias planejadas para um periodo e com objetivo especifico.</li>
<li><strong>Plano de auditoria:</strong> Descricao das atividades e arranjos de uma auditoria individual.</li>
<li><strong>Escopo de auditoria:</strong> Extensao e limites de uma auditoria (processos, locais, periodo).</li>
</ul>

<div class="example"><strong>Analogia:</strong> Criterio e a "regra do jogo". Evidencia e o "lance que aconteceu". Constatacao e o "cartao do juiz" (amarelo ou nenhum). Conclusao e o "resultado da partida".</div>

<h3>Confusoes comuns</h3>
<table>
<tr><th>Confusao</th><th>Correto</th></tr>
<tr><td>Tratar "constatacao" como sinonimo de "nao conformidade"</td><td>Constatacao pode ser positiva (conformidade), negativa (NC) ou neutra (observacao/OM)</td></tr>
<tr><td>Usar "auditoria" e "inspecao" como sinonimos</td><td>Auditoria avalia o sistema; inspecao avalia o produto</td></tr>
<tr><td>Confundir "plano de auditoria" com "programa de auditoria"</td><td>Plano = uma auditoria. Programa = todas as auditorias do periodo</td></tr>
</table>
`}, 'Glossario do auditor (PDF)')`;

  // ── Module 2: Gestao do Programa de Auditoria ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Gestao do Programa de Auditoria', 'Como planejar, gerenciar e melhorar o programa de auditorias internas', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-2-1-conceito-programa', 'Conceito de programa de auditoria', '15 min', 1, ${`
<h2>Conceito de programa de auditoria</h2>
<p>O <strong>programa de auditoria</strong> e o planejamento macro que define quais auditorias serao realizadas em um determinado periodo, seus objetivos, abrangencia e recursos. Pense nele como o "plano anual de auditorias" — embora possa cobrir periodos diferentes de 12 meses.</p>

<div class="callout"><strong>Clausula de referencia:</strong> A ISO 19011:2018, clausula 5, e a ISO 9001:2015, clausula 9.2, exigem que a organizacao planeje um programa de auditoria considerando a importancia dos processos, mudancas que afetam a organizacao e resultados de auditorias anteriores.</div>

<h3>Programa vs. Plano: nao confunda</h3>
<table>
<tr><th>Aspecto</th><th>Programa de auditoria</th><th>Plano de auditoria</th></tr>
<tr><td>Nivel</td><td>Estrategico/gerencial</td><td>Operacional/tatico</td></tr>
<tr><td>Abrangencia</td><td>Todas as auditorias do periodo</td><td>Uma auditoria especifica</td></tr>
<tr><td>Conteudo</td><td>Cronograma, processos, auditores, recursos</td><td>Agenda detalhada, horarios, entrevistados</td></tr>
<tr><td>Quem elabora</td><td>Gestor do programa (geralmente o coord. de qualidade)</td><td>Auditor-lider da auditoria especifica</td></tr>
</table>

<h3>Elementos de um programa de auditoria</h3>
<p>Segundo a ISO 19011, o programa deve incluir:</p>
<ul>
<li><strong>Objetivos:</strong> O que se pretende alcançar (ex: verificar conformidade, identificar melhorias, preparar para certificacao)</li>
<li><strong>Extensao/escopo:</strong> Quais processos, locais, periodos serao cobertos</li>
<li><strong>Criterios:</strong> Contra quais requisitos sera auditado (ISO 9001, procedimentos internos, legislacao)</li>
<li><strong>Metodos:</strong> Presencial, remota, hibrida</li>
<li><strong>Recursos:</strong> Equipe auditora, tempo, infraestrutura</li>
<li><strong>Cronograma:</strong> Quando cada auditoria sera realizada</li>
<li><strong>Riscos do programa:</strong> O que pode impedir o programa de atingir seus objetivos</li>
</ul>

<div class="example"><strong>Exemplo — metalurgica com 8 processos:</strong> O programa anual preve 4 ciclos de auditoria (mar, jun, set, dez), cada um cobrindo 2 processos. Os processos criticos (producao e controle de qualidade) sao auditados 2 vezes no ano; os de apoio (RH, TI), 1 vez.</div>

<h3>O gestor do programa</h3>
<p>Alguem deve ser designado para gerenciar o programa. Geralmente e o coordenador de qualidade, mas pode ser qualquer pessoa competente. Suas responsabilidades incluem:</p>
<ul>
<li>Estabelecer os objetivos do programa</li>
<li>Definir o cronograma e atribuir auditores</li>
<li>Garantir recursos (tempo liberado, salas, acesso a documentos)</li>
<li>Monitorar a implementacao do programa</li>
<li>Analisar resultados e promover melhorias</li>
</ul>
`}, 'Template de programa anual de auditoria'),

  (${m2.id}, '2-2-2-escopo-criterios', 'Definindo escopo e criterios', '15 min', 2, ${`
<h2>Definindo escopo e criterios de auditoria</h2>
<p>Antes de iniciar qualquer auditoria individual, e fundamental definir com clareza <strong>o que sera auditado</strong> (escopo) e <strong>contra quais referencias</strong> (criterios). Definicoes vagas geram auditorias superficiais e constatacoes questionaveis.</p>

<h3>Escopo de auditoria</h3>
<p>O escopo delimita a extensao e os limites da auditoria. Deve especificar:</p>
<ul>
<li><strong>Processos:</strong> Quais processos serao auditados (ex: compras, producao, expedicao)</li>
<li><strong>Locais:</strong> Quais unidades, filiais ou areas fisicas</li>
<li><strong>Periodo:</strong> Quais registros/atividades serao verificados (ex: ultimos 6 meses)</li>
<li><strong>Turno:</strong> Se aplicavel (ex: auditar apenas o turno noturno onde ha mais reclamacoes)</li>
</ul>

<div class="example"><strong>Escopo bem definido:</strong> "Auditoria do processo de recebimento e armazenagem de materias-primas na unidade de Caxias do Sul, cobrindo o periodo de janeiro a junho de 2025, nos turnos A e B."</div>

<div class="example"><strong>Escopo mal definido:</strong> "Auditoria da producao." — Qual unidade? Quais etapas? Qual periodo? Isso e vago demais.</div>

<h3>Criterios de auditoria</h3>
<p>Os criterios sao as <strong>referencias</strong> contra as quais as evidencias serao comparadas. Os criterios mais comuns sao:</p>

<table>
<tr><th>Tipo de criterio</th><th>Exemplo</th></tr>
<tr><td>Norma de referencia</td><td>ISO 9001:2015 clausulas 8.4 e 8.5</td></tr>
<tr><td>Procedimentos internos</td><td>PO-015 Controle de recebimento, IT-008 Armazenagem</td></tr>
<tr><td>Legislacao/regulamentacao</td><td>Portaria INMETRO 587, RDC Anvisa 275</td></tr>
<tr><td>Requisitos contratuais</td><td>Especificacao do cliente XYZ para lote minimo</td></tr>
<tr><td>Historico/metas</td><td>Meta de indice de rejeicao < 2%</td></tr>
</table>

<div class="callout"><strong>Regra de ouro:</strong> Se nao ha criterio, nao ha constatacao. O auditor so pode apontar nao conformidade se existir um requisito claro que nao foi atendido. "Eu acho que deveria ser diferente" nao e base para NC — a menos que um requisito documentado diga isso.</div>

<h3>Relacao entre escopo e criterios</h3>
<p>O escopo define <strong>onde</strong> olhar. O criterio define <strong>o que</strong> procurar. Juntos, eles direcionam o trabalho do auditor e garantem foco.</p>

<h3>Fatores para definir prioridades</h3>
<p>Ao definir quais processos auditar primeiro, considere:</p>
<ul>
<li>Resultados de auditorias anteriores (processos com NCs recorrentes)</li>
<li>Reclamacoes de clientes concentradas em determinados processos</li>
<li>Mudancas significativas (novo equipamento, novo fornecedor, novo turno)</li>
<li>Criticidade do processo para o produto/servico final</li>
<li>Riscos identificados pela organizacao</li>
</ul>
`}, NULL),

  (${m2.id}, '2-2-3-competencia-auditores', 'Competencia e avaliacao de auditores', '20 min', 3, ${`
<h2>Competencia e avaliacao de auditores</h2>
<p>A clausula 7 da ISO 19011:2018 e a clausula 9.2 da ISO 9001:2015 exigem que os auditores internos sejam <strong>competentes</strong>. Mas o que significa "competente" neste contexto?</p>

<h3>Conhecimentos e habilidades necessarios</h3>
<p>A ISO 19011 divide a competencia do auditor em duas categorias:</p>

<table>
<tr><th>Categoria</th><th>Exemplos</th></tr>
<tr><td><strong>Conhecimentos genericos</strong></td><td>Principios de auditoria, norma ISO 19011, tecnicas de entrevista, elaboracao de relatorio, amostragem</td></tr>
<tr><td><strong>Conhecimentos especificos do setor</strong></td><td>Processos de usinagem (metalurgica), APPCC (alimentos), NRs aplicaveis (construcao civil), normas tecnicas do produto</td></tr>
</table>

<h3>Atributos pessoais do auditor</h3>
<p>Alem de conhecimento tecnico, o auditor precisa de atributos comportamentais:</p>
<ul>
<li><strong>Etico:</strong> Justo, verdadeiro, sincero, honesto e discreto</li>
<li><strong>Mente aberta:</strong> Disposto a considerar pontos de vista e ideias alternativas</li>
<li><strong>Diplomatico:</strong> Tato ao lidar com pessoas</li>
<li><strong>Observador:</strong> Atento ao ambiente e as atividades</li>
<li><strong>Perceptivo:</strong> Capaz de entender situacoes e contextos</li>
<li><strong>Versatil:</strong> Adapta-se a diferentes situacoes</li>
<li><strong>Persistente:</strong> Focado em alcançar os objetivos</li>
<li><strong>Decidido:</strong> Capaz de chegar a conclusoes em tempo habil</li>
<li><strong>Autoconfiante:</strong> Age de forma independente ao interagir com outros</li>
</ul>

<div class="callout"><strong>Reflexao:</strong> Um auditor excelente tecnicamente mas arrogante e inflexivel vai gerar resistencia e conflitos. Um auditor diplomatico mas sem conhecimento tecnico vai perder constatacoes importantes. E preciso equilibrio.</div>

<h3>Como avaliar a competencia</h3>
<p>A organizacao deve definir criterios para avaliar seus auditores internos. Metodos comuns:</p>
<ul>
<li><strong>Formacao:</strong> Curso de auditor interno (como este!) com avaliacao</li>
<li><strong>Experiencia:</strong> Participacao em auditorias como observador ou membro da equipe</li>
<li><strong>Avaliacao de desempenho:</strong> Feedback pos-auditoria pelo auditor-lider ou gestor do programa</li>
<li><strong>Atualizacao:</strong> Participacao em treinamentos continuos</li>
</ul>

<div class="example"><strong>Criterio tipico numa industria alimenticia:</strong> Para atuar como auditor interno, o colaborador deve ter: (a) curso de auditor interno ISO 19011 de no minimo 16h; (b) conhecimento basico de ISO 9001:2015; (c) pelo menos 1 auditoria acompanhada como observador; (d) avaliacao satisfatoria pelo gestor do programa.</div>

<h3>Auditor-lider: papel e competencia adicional</h3>
<p>O auditor-lider coordena a equipe auditora e e responsavel por:</p>
<ul>
<li>Elaborar o plano de auditoria</li>
<li>Coordenar a equipe durante a execucao</li>
<li>Conduzir as reunioes de abertura e encerramento</li>
<li>Resolver impasses e tomar decisoes</li>
<li>Aprovar o relatorio final</li>
</ul>
`}, 'Matriz de competencia de auditores'),

  (${m2.id}, '2-2-4-monitoramento-melhoria', 'Monitoramento e melhoria do programa', '15 min', 4, ${`
<h2>Monitoramento e melhoria do programa de auditoria</h2>
<p>Um programa de auditoria nao e "defina e esqueca". Assim como qualquer processo do SGQ, ele segue o ciclo PDCA: planejar, executar, verificar e melhorar. O gestor do programa deve monitorar sua implementacao e buscar melhorias continuamente.</p>

<h3>O que monitorar</h3>
<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta tipica</th></tr>
<tr><td>Taxa de execucao do programa</td><td>% de auditorias planejadas que foram realizadas</td><td>100% (sem cancelamentos)</td></tr>
<tr><td>Cumprimento do cronograma</td><td>% de auditorias realizadas na data prevista</td><td>>= 90%</td></tr>
<tr><td>NCs identificadas por auditoria</td><td>Quantidade media de nao conformidades</td><td>Acompanhar tendencia</td></tr>
<tr><td>Eficacia das acoes corretivas</td><td>% de NCs efetivamente fechadas no prazo</td><td>>= 80%</td></tr>
<tr><td>Satisfacao dos auditados</td><td>Feedback sobre a conduta e utilidade da auditoria</td><td>Favoravel</td></tr>
<tr><td>Desenvolvimento de auditores</td><td>Numero de auditores qualificados ativos</td><td>Conforme necessidade</td></tr>
</table>

<h3>Analise critica do programa</h3>
<p>Ao final do ciclo (geralmente anual), o gestor do programa deve fazer uma analise critica que inclua:</p>
<ul>
<li>Resultados consolidados: total de NCs, por tipo, por processo, tendencias</li>
<li>Conformidade geral do SGQ (visao macro)</li>
<li>Desempenho dos auditores</li>
<li>Adequacao do cronograma e dos recursos</li>
<li>Feedback dos auditados e da direcao</li>
<li>Oportunidades de melhoria para o proximo ciclo</li>
</ul>

<div class="example"><strong>Exemplo — construtora:</strong> Na analise critica do programa 2024, o gestor identificou que 60% das NCs estavam no processo de compras (3 auditorias seguidas). Acao: aumentar a frequencia de auditoria de compras de anual para semestral em 2025, e incluir um auditor com experiencia em supply chain na equipe.</div>

<h3>Melhorias tipicas no programa</h3>
<ul>
<li><strong>Ajustar frequencia:</strong> Processos com mais NCs ou maior risco recebem mais auditorias</li>
<li><strong>Rotacionar auditores:</strong> Evitar que o mesmo auditor audite o mesmo processo sempre (perde a "visao fresca")</li>
<li><strong>Incluir auditorias nao planejadas:</strong> Em caso de mudancas significativas, reclamacoes criticas ou incidentes</li>
<li><strong>Atualizar criterios:</strong> Incorporar novos requisitos legais, normativos ou de clientes</li>
<li><strong>Investir em capacitacao:</strong> Treinar novos auditores e reciclar os existentes</li>
</ul>

<div class="callout"><strong>Ciclo PDCA do programa:</strong> <strong>P</strong> = definir objetivos, cronograma, auditores. <strong>D</strong> = executar as auditorias conforme planejado. <strong>C</strong> = monitorar indicadores e analisar resultados. <strong>A</strong> = ajustar o programa para o proximo ciclo.</div>
`}, NULL)`;

  // ── Module 3: Planejamento da Auditoria ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Planejamento da Auditoria', 'Analise documental, plano de auditoria, checklists e amostragem', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '2-3-1-analise-documentacao', 'Analise de documentacao pre-auditoria', '20 min', 1, ${`
<h2>Analise de documentacao pre-auditoria</h2>
<p>Antes de pisar no "chao de fabrica", o auditor deve <strong>estudar</strong>. A analise de documentacao e a primeira etapa pratica de qualquer auditoria e determina a qualidade de todo o trabalho subsequente. Um auditor que chega sem preparacao faz perguntas genericas e perde constatacoes importantes.</p>

<h3>Quais documentos analisar</h3>
<p>Dependendo do escopo e dos criterios da auditoria, o auditor deve revisar:</p>

<table>
<tr><th>Documento</th><th>O que buscar</th></tr>
<tr><td>Politica e objetivos da qualidade</td><td>Alinhamento com os processos auditados</td></tr>
<tr><td>Manual do SGQ (se existir)</td><td>Escopo, exclusoes, mapa de processos</td></tr>
<tr><td>Procedimentos operacionais (POs)</td><td>O que a organizacao diz que faz no processo auditado</td></tr>
<tr><td>Instrucoes de trabalho (ITs)</td><td>Detalhamento operacional (como faz)</td></tr>
<tr><td>Registros recentes</td><td>Evidencias de que o processo esta sendo seguido</td></tr>
<tr><td>Resultados de auditorias anteriores</td><td>NCs recorrentes, status de acoes corretivas</td></tr>
<tr><td>Indicadores do processo</td><td>Tendencias, desvios, metas nao atingidas</td></tr>
<tr><td>Reclamacoes de clientes</td><td>Relacionadas ao processo auditado</td></tr>
<tr><td>Mudancas recentes</td><td>Novos equipamentos, novos funcionarios, mudancas de processo</td></tr>
</table>

<div class="callout"><strong>Regra pratica:</strong> Leia os documentos com uma pergunta na mente: "O que a organizacao disse que faz?" Na auditoria em campo, a pergunta muda para: "A organizacao realmente faz o que disse?"</div>

<h3>Sinais de atencao na analise documental</h3>
<p>Durante a analise, fique atento a:</p>
<ul>
<li><strong>Procedimentos desatualizados:</strong> Ultima revisao ha mais de 2 anos sem justificativa</li>
<li><strong>Lacunas:</strong> Requisitos da norma sem procedimento ou registro correspondente</li>
<li><strong>Complexidade excessiva:</strong> Procedimentos tao detalhados que ninguem consegue seguir</li>
<li><strong>NCs anteriores nao fechadas:</strong> Acoes corretivas pendentes ou atrasadas</li>
<li><strong>Indicadores sem analise:</strong> Dados coletados mas sem evidencia de acao sobre desvios</li>
</ul>

<div class="example"><strong>Na metalurgica:</strong> Ao analisar a documentacao do setor de soldagem, o auditor percebe que a IT-023 (Instrucao de soldagem) referencia a especificacao AWS D1.1:2010, mas a versao atual e 2020. Isso ja e um ponto a verificar na auditoria em campo: estao usando a versao correta?</div>

<h3>Resultado da analise</h3>
<p>Ao final da analise documental, o auditor deve ter:</p>
<ol>
<li>Entendimento claro do processo a ser auditado</li>
<li>Lista de pontos de atencao para investigar em campo</li>
<li>Base para elaborar o checklist de auditoria</li>
<li>Insumos para o plano de auditoria (agenda, entrevistados-chave)</li>
</ol>
`}, NULL),

  (${m3.id}, '2-3-2-plano-auditoria', 'Elaboracao do plano de auditoria', '20 min', 2, ${`
<h2>Elaboracao do plano de auditoria</h2>
<p>O plano de auditoria e o documento que descreve os <strong>arranjos praticos</strong> para a realizacao de uma auditoria individual. Ele e elaborado pelo auditor-lider e deve ser comunicado ao auditado com antecedencia suficiente.</p>

<div class="callout"><strong>Clausula de referencia:</strong> ISO 19011:2018, clausula 6.3.2 — "O auditor-lider deve preparar um plano de auditoria baseado nas informacoes contidas no programa de auditoria e na documentacao fornecida pelo auditado."</div>

<h3>Conteudo minimo do plano</h3>
<p>Um plano de auditoria completo deve conter:</p>

<table>
<tr><th>Item</th><th>Descricao</th><th>Exemplo</th></tr>
<tr><td>Objetivo</td><td>O que a auditoria pretende verificar</td><td>Verificar conformidade do processo de compras com ISO 9001 cl. 8.4</td></tr>
<tr><td>Escopo</td><td>Processos, locais, periodo</td><td>Processo de compras, sede Caxias do Sul, jan-jun 2025</td></tr>
<tr><td>Criterios</td><td>Normas e documentos de referencia</td><td>ISO 9001:2015 cl. 8.4, PO-010 Compras v.3</td></tr>
<tr><td>Equipe auditora</td><td>Nomes e papeis</td><td>Maria (lider), Joao (auditor)</td></tr>
<tr><td>Agenda/cronograma</td><td>Horarios e atividades</td><td>08:00 Abertura, 08:30-11:30 Entrevistas, 13:00-14:00 Encerramento</td></tr>
<tr><td>Auditados/entrevistados</td><td>Quem sera entrevistado</td><td>Gerente de compras, comprador, analista de qualidade de recebimento</td></tr>
<tr><td>Recursos necessarios</td><td>Sala, acesso a sistemas, EPI</td><td>Acesso ao sistema ERP, sala de reuniao, EPI para area de recebimento</td></tr>
<tr><td>Idioma</td><td>Se aplicavel (auditorias internacionais)</td><td>Portugues</td></tr>
</table>

<h3>Exemplo de agenda de auditoria</h3>
<div class="template-box">
<p><strong>Auditoria Interna — Processo de Compras</strong><br>Data: 15/07/2025 | Auditor-lider: Maria Silva</p>
<table>
<tr><th>Horario</th><th>Atividade</th><th>Participantes</th></tr>
<tr><td>08:00 - 08:20</td><td>Reuniao de abertura</td><td>Equipe auditora + gerente de compras + coord. qualidade</td></tr>
<tr><td>08:20 - 10:00</td><td>Entrevista: gerente de compras</td><td>Maria (auditor-lider)</td></tr>
<tr><td>10:00 - 11:30</td><td>Entrevista: comprador + verificacao de registros</td><td>Joao (auditor)</td></tr>
<tr><td>11:30 - 12:00</td><td>Visita a area de recebimento</td><td>Equipe auditora + inspetor de recebimento</td></tr>
<tr><td>12:00 - 13:00</td><td>Almoco</td><td>—</td></tr>
<tr><td>13:00 - 14:00</td><td>Consolidacao de constatacoes (equipe auditora)</td><td>Maria + Joao</td></tr>
<tr><td>14:00 - 14:30</td><td>Reuniao de encerramento</td><td>Equipe auditora + gerente de compras + coord. qualidade</td></tr>
</table>
</div>

<h3>Dicas para um bom plano</h3>
<ul>
<li>Envie o plano ao auditado com pelo menos 1 semana de antecedencia</li>
<li>Seja realista com o tempo — entrevistas levam mais tempo do que parece</li>
<li>Reserve tempo para consolidacao antes do encerramento</li>
<li>Inclua margem para imprevistos (atrasos, entrevistados ausentes)</li>
<li>O plano pode ser ajustado no dia, se necessario — nao e rigido</li>
</ul>

<div class="example"><strong>Erro comum:</strong> Planejar 6 entrevistas de 30 minutos seguidas sem intervalo. Na pratica, cada entrevista pode levar 45-60 minutos, e o auditor precisa anotar e organizar antes da proxima. Resultado: atraso e estresse.</div>
`}, 'Template de plano de auditoria'),

  (${m3.id}, '2-3-3-checklists-eficazes', 'Construindo checklists eficazes', '20 min', 3, ${`
<h2>Construindo checklists eficazes</h2>
<p>O checklist e a <strong>ferramenta mais importante</strong> do auditor em campo. Ele guia a coleta de evidencias, garante que nenhum requisito seja esquecido e serve como registro do trabalho realizado. Um checklist bem construido e a diferenca entre uma auditoria superficial e uma auditoria que agrega valor.</p>

<h3>O que incluir no checklist</h3>
<p>Para cada requisito ou item do escopo, o checklist deve conter:</p>

<table>
<tr><th>Coluna</th><th>Funcao</th></tr>
<tr><td>Requisito/referencia</td><td>Clausula da norma ou item do procedimento interno</td></tr>
<tr><td>Pergunta/verificacao</td><td>O que o auditor vai perguntar ou verificar</td></tr>
<tr><td>Metodo de verificacao</td><td>Entrevista, observacao, analise de registro</td></tr>
<tr><td>Evidencia encontrada</td><td>O que o auditor efetivamente viu/ouviu (preenchido em campo)</td></tr>
<tr><td>Constatacao</td><td>C (conforme), NC (nao conforme), OM (oportunidade de melhoria)</td></tr>
<tr><td>Observacoes</td><td>Notas adicionais</td></tr>
</table>

<h3>Exemplo de checklist parcial — Processo de compras (ISO 9001 cl. 8.4)</h3>
<div class="template-box">
<table>
<tr><th>Ref.</th><th>Pergunta</th><th>Metodo</th><th>Evidencia</th><th>Status</th></tr>
<tr><td>8.4.1</td><td>Os fornecedores criticos estao avaliados conforme criterios definidos?</td><td>Registro</td><td></td><td></td></tr>
<tr><td>8.4.1</td><td>Existe lista de fornecedores qualificados atualizada?</td><td>Registro</td><td></td><td></td></tr>
<tr><td>8.4.2</td><td>Os requisitos de compra estao claramente comunicados ao fornecedor?</td><td>Entrevista + registro</td><td></td><td></td></tr>
<tr><td>8.4.2</td><td>Os pedidos de compra incluem especificacoes tecnicas quando aplicavel?</td><td>Registro (amostra de POs)</td><td></td><td></td></tr>
<tr><td>8.4.3</td><td>Ha inspecao de recebimento para materiais criticos?</td><td>Observacao + registro</td><td></td><td></td></tr>
<tr><td>8.4.3</td><td>Quando um material e reprovado no recebimento, qual o tratamento?</td><td>Entrevista</td><td></td><td></td></tr>
</table>
</div>

<h3>Tipos de pergunta no checklist</h3>
<ul>
<li><strong>Perguntas abertas:</strong> "Como voce avalia os fornecedores?" — obrigam o auditado a explicar o processo</li>
<li><strong>Perguntas de verificacao:</strong> "Mostre-me o registro de avaliacao do fornecedor X" — confirmam com evidencia</li>
<li><strong>Perguntas de rastreamento:</strong> "Posso ver o pedido de compra mais recente e verificar se inclui as especificacoes?" — seguem a trilha do processo</li>
</ul>

<div class="callout"><strong>Regra de ouro:</strong> Nunca use apenas perguntas de sim/nao. "Voce avalia fornecedores?" gera resposta "sim" e nao revela nada. "Como voce avalia fornecedores? Mostre-me os ultimos 3 registros" revela a pratica real.</div>

<h3>Erros comuns na elaboracao do checklist</h3>
<ul>
<li><strong>Copiar o texto da norma ipsis litteris:</strong> "A organizacao determina os processos providos externamente?" — isso nao e pergunta, e requisito. Traduza para linguagem operacional.</li>
<li><strong>Checklist generico para todos os processos:</strong> Cada processo tem particularidades. Adapte.</li>
<li><strong>Checklist como questionario fechado:</strong> O checklist e um guia, nao um roteiro rigido. Siga as trilhas que surgem.</li>
<li><strong>Nao atualizar apos cada ciclo:</strong> Incorpore licoes aprendidas de auditorias anteriores.</li>
</ul>
`}, 'Modelo de checklist de auditoria'),

  (${m3.id}, '2-3-4-amostragem', 'Amostragem em auditoria', '15 min', 4, ${`
<h2>Amostragem em auditoria</h2>
<p>E impossivel verificar 100% dos registros, entrevistar todos os colaboradores ou observar todas as atividades. Por isso, o auditor trabalha com <strong>amostras</strong> — selecoes representativas que permitem tirar conclusoes sobre o todo.</p>

<h3>Por que amostrar</h3>
<p>A auditoria tem tempo limitado. Se o processo de compras gera 200 pedidos por mes e voce tem 2 horas, nao da para verificar todos. A amostragem permite <strong>maximizar a cobertura</strong> dentro do tempo disponivel.</p>

<div class="callout"><strong>ISO 19011:2018, Anexo A.6:</strong> A norma reconhece que a amostragem e necessaria e fornece diretrizes sobre abordagens baseadas em julgamento e abordagens estatisticas.</div>

<h3>Tipos de amostragem</h3>
<table>
<tr><th>Tipo</th><th>Descricao</th><th>Quando usar</th></tr>
<tr><td><strong>Baseada em julgamento</strong></td><td>O auditor seleciona amostras com base em experiencia e risco</td><td>Maioria das auditorias internas</td></tr>
<tr><td><strong>Estatistica</strong></td><td>Selecao aleatoria com calculo de tamanho amostral</td><td>Auditorias com grande volume de dados ou exigencia de rigor estatistico</td></tr>
</table>

<h3>Criterios para selecao da amostra (julgamento)</h3>
<p>Ao usar amostragem por julgamento, considere:</p>
<ul>
<li><strong>Periodo:</strong> Cubra diferentes meses (nao apenas o ultimo)</li>
<li><strong>Turnos:</strong> Se ha turnos, amostre de mais de um</li>
<li><strong>Produtos/servicos:</strong> Inclua diferentes linhas ou tipos</li>
<li><strong>Fornecedores:</strong> Inclua fornecedores criticos e de menor porte</li>
<li><strong>Operadores:</strong> Entreviste diferentes pessoas (nao so o mais experiente)</li>
<li><strong>Criticidade:</strong> Priorize itens de maior risco ou impacto</li>
</ul>

<div class="example"><strong>Na industria alimenticia:</strong> Ao auditar o controle de temperatura das camaras frias, o auditor seleciona registros de 3 meses diferentes, incluindo um mes de verao (maior risco de desvio). Verifica tambem os registros do turno noturno, onde supervisao e menor.</div>

<h3>Tamanho da amostra: referencias praticas</h3>
<table>
<tr><th>Volume de registros no periodo</th><th>Amostra sugerida (minimo)</th></tr>
<tr><td>Ate 10</td><td>Todos (ou maioria)</td></tr>
<tr><td>11 a 50</td><td>5 a 8</td></tr>
<tr><td>51 a 200</td><td>8 a 15</td></tr>
<tr><td>201 a 500</td><td>15 a 25</td></tr>
<tr><td>Acima de 500</td><td>25 a 40 (com foco nos criticos)</td></tr>
</table>

<div class="callout"><strong>Atencao:</strong> Se uma amostra revela nao conformidade, <strong>amplie a amostra</strong> antes de concluir se e um problema pontual ou sistemico. Encontrar 1 registro errado em 5 pode ser acaso. Encontrar 3 em 5 e padrao.</div>

<h3>Registrando a amostra</h3>
<p>Sempre registre no checklist <strong>quais</strong> amostras voce verificou: numeros de lotes, datas, nomes de fornecedores, numeros de pedidos. Isso da rastreabilidade ao relatorio e permite ao auditado entender exatamente o que foi verificado.</p>
`}, NULL)`;

  // ── Module 4: Execucao da Auditoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Execucao da Auditoria', 'Reuniao de abertura, entrevistas, coleta de evidencias e reuniao de encerramento', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '2-4-1-reuniao-abertura', 'Reuniao de abertura', '15 min', 1, ${`
<h2>Reuniao de abertura</h2>
<p>A reuniao de abertura e o <strong>primeiro contato formal</strong> entre a equipe auditora e os auditados. Ela define o tom da auditoria e pode determinar o nivel de colaboracao que voce recebera. Uma abertura bem conduzida reduz ansiedade, esclarece expectativas e demonstra profissionalismo.</p>

<h3>Quem participa</h3>
<ul>
<li>Equipe auditora (auditor-lider + demais auditores)</li>
<li>Responsavel pela area auditada (gerente, supervisor, coordenador)</li>
<li>Coordenador/gestor de qualidade</li>
<li>Representante da alta direcao (quando possivel)</li>
<li>Guia (se designado pelo auditado)</li>
</ul>

<h3>Agenda da reuniao de abertura</h3>
<p>A reuniao deve ser breve (15-20 minutos) e cobrir:</p>
<ol>
<li><strong>Apresentacao da equipe auditora</strong> e seus papeis</li>
<li><strong>Confirmacao do escopo</strong> e objetivos da auditoria</li>
<li><strong>Criterios de auditoria</strong> utilizados</li>
<li><strong>Confirmacao do plano/agenda</strong> — horarios, entrevistados, logistica</li>
<li><strong>Metodos de auditoria</strong> — entrevistas, observacoes, analise de registros</li>
<li><strong>Classificacao das constatacoes</strong> — como serao categorizadas (NC maior, menor, OM)</li>
<li><strong>Confidencialidade</strong> — reforcar que as informacoes serao tratadas com sigilo</li>
<li><strong>Canais de comunicacao</strong> — como reportar problemas ou duvidas durante a auditoria</li>
<li><strong>Perguntas dos auditados</strong></li>
</ol>

<div class="callout"><strong>Dica importante:</strong> O tom da reuniao de abertura define a auditoria. Seja profissional, mas acessivel. Deixe claro que o objetivo e ajudar a organizacao a melhorar — nao punir. Evite linguagem intimidadora.</div>

<div class="example"><strong>Frase de abertura eficaz:</strong> "Bom dia a todos. Nosso objetivo hoje e verificar como o processo de compras esta funcionando na pratica, identificar o que esta indo bem e onde podemos melhorar. Nao estamos aqui para encontrar culpados — estamos aqui para ajudar o processo a ficar mais robusto."</div>

<h3>Erros comuns na reuniao de abertura</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th></tr>
<tr><td>Pular a reuniao de abertura ("ja nos conhecemos")</td><td>Auditados nao sabem o que esperar, gera confusao</td></tr>
<tr><td>Reuniao longa demais (>30 min)</td><td>Perde tempo que seria usado para a auditoria real</td></tr>
<tr><td>Tom autoritario ou intimidador</td><td>Auditados ficam na defensiva e omitem informacoes</td></tr>
<tr><td>Nao confirmar a agenda</td><td>Pessoas-chave ausentes, salas ocupadas</td></tr>
</table>
`}, NULL),

  (${m4.id}, '2-4-2-tecnicas-entrevista', 'Tecnicas de entrevista e coleta de evidencias', '25 min', 2, ${`
<h2>Tecnicas de entrevista e coleta de evidencias</h2>
<p>A entrevista e o principal metodo de coleta de evidencias em auditoria. Um auditor que sabe entrevistar extrai informacoes valiosas em minutos; um auditor sem tecnica perde tempo com perguntas ineficazes e nao consegue avaliar o processo real.</p>

<h3>Os 3 metodos de coleta de evidencias</h3>
<table>
<tr><th>Metodo</th><th>Descricao</th><th>Quando usar</th></tr>
<tr><td><strong>Entrevista</strong></td><td>Conversar com as pessoas que executam o processo</td><td>Entender como o processo funciona na pratica</td></tr>
<tr><td><strong>Observacao</strong></td><td>Ver as atividades sendo executadas in loco</td><td>Verificar se a pratica corresponde ao documentado</td></tr>
<tr><td><strong>Analise de registros</strong></td><td>Examinar documentos, formularios, dados, sistemas</td><td>Verificar evidencias objetivas de conformidade</td></tr>
</table>

<div class="callout"><strong>Regra dos 3 pontos:</strong> Sempre que possivel, triangule: pergunte ao operador como faz (entrevista), veja ele fazendo (observacao), e verifique o registro (analise). Se os tres baterem, a evidencia e solida.</div>

<h3>Tecnica de funil: do geral ao especifico</h3>
<p>Comece com perguntas amplas e va afunilando:</p>
<ol>
<li><strong>Abertura:</strong> "Me conte como funciona o processo de recebimento de materiais."</li>
<li><strong>Aprofundamento:</strong> "Quem faz a inspecao? Quais criterios usa?"</li>
<li><strong>Verificacao:</strong> "Posso ver o registro de inspecao do ultimo recebimento?"</li>
<li><strong>Sondagem:</strong> "E quando o material chega fora da especificacao, o que acontece?"</li>
</ol>

<h3>Perguntas que funcionam</h3>
<table>
<tr><th>Tipo</th><th>Exemplo</th><th>Por que funciona</th></tr>
<tr><td>Aberta</td><td>"Como voce controla..."</td><td>Obriga explicacao, revela o processo real</td></tr>
<tr><td>Mostre-me</td><td>"Mostre-me o registro de..."</td><td>Gera evidencia objetiva</td></tr>
<tr><td>Hipotetica</td><td>"Se chegar material fora da especificacao, o que voce faz?"</td><td>Testa conhecimento do procedimento</td></tr>
<tr><td>Rastreamento</td><td>"Posso ver o pedido que originou essa entrega?"</td><td>Segue a trilha do processo (rastreabilidade)</td></tr>
</table>

<h3>Perguntas que NAO funcionam</h3>
<ul>
<li><strong>Sim/nao:</strong> "Voce segue o procedimento?" — resposta: "Sim". (Nao revela nada.)</li>
<li><strong>Indutiva:</strong> "Voce sempre calibra os instrumentos conforme o plano, certo?" — induz a resposta.</li>
<li><strong>Multipla:</strong> "Como voce faz a inspecao, quem treinou voce e qual a frequencia?" — confunde o auditado.</li>
</ul>

<div class="example"><strong>Na cooperativa agricola:</strong> O auditor pergunta ao operador do secador: "Me explique como voce controla a temperatura de secagem do milho." O operador explica. O auditor pede: "Posso ver os registros da ultima semana?" Ao verificar, nota que ha 2 dias sem registro. Sondagem: "O que aconteceu nesses dias?" Resposta: "Estava em manutencao." O auditor verifica a ordem de servico de manutencao. Se nao existir, ha uma constatacao.</div>

<h3>Anotacoes durante a entrevista</h3>
<ul>
<li>Anote <strong>fatos</strong>, nao opinioes — "Registro R-045 nao preenchido em 12/03", nao "processo mal gerenciado"</li>
<li>Registre quem disse o que — "Operador Carlos informou que..."</li>
<li>Anote numeros de documentos, lotes, datas — sao suas evidencias</li>
<li>Se possivel, tire foto (com autorizacao) de situacoes relevantes</li>
</ul>
`}, NULL),

  (${m4.id}, '2-4-3-avaliando-conformidade', 'Avaliando conformidade e gerando constatacoes', '20 min', 3, ${`
<h2>Avaliando conformidade e gerando constatacoes</h2>
<p>Apos coletar evidencias, o auditor deve <strong>avaliar</strong> cada evidencia contra os criterios de auditoria e gerar constatacoes. Essa e a etapa que transforma dados brutos em informacao util para a organizacao.</p>

<h3>Tipos de constatacao</h3>
<table>
<tr><th>Constatacao</th><th>Significado</th><th>Exemplo</th></tr>
<tr><td><strong>Conformidade</strong></td><td>O requisito esta sendo atendido</td><td>Registros de inspecao de recebimento preenchidos e completos para todos os 10 lotes amostrados</td></tr>
<tr><td><strong>Nao conformidade (NC)</strong></td><td>Um requisito nao esta sendo atendido</td><td>3 dos 10 fornecedores criticos nao possuem avaliacao registrada conforme PO-010</td></tr>
<tr><td><strong>Oportunidade de melhoria (OM)</strong></td><td>O requisito esta atendido, mas ha potencial de melhoria</td><td>A avaliacao de fornecedores considera apenas entrega no prazo; poderia incluir qualidade do material</td></tr>
</table>

<h3>O processo de avaliacao</h3>
<p>Para cada item do checklist, siga este fluxo mental:</p>
<ol>
<li><strong>Identifique o criterio:</strong> O que a norma/procedimento exige?</li>
<li><strong>Verifique a evidencia:</strong> O que voce efetivamente encontrou?</li>
<li><strong>Compare:</strong> A evidencia atende ao criterio?</li>
<li><strong>Classifique:</strong> Conforme, NC ou OM?</li>
<li><strong>Registre:</strong> Documente no checklist com detalhes suficientes</li>
</ol>

<div class="callout"><strong>Principio fundamental:</strong> Uma constatacao de NC deve sempre ter tres elementos: (1) o <strong>criterio</strong> que nao foi atendido, (2) a <strong>evidencia</strong> objetiva, e (3) a <strong>explicacao</strong> de por que nao atende. Se falta qualquer um dos tres, a constatacao e fragil.</div>

<h3>Exemplo de constatacao bem estruturada</h3>
<div class="template-box">
<p><strong>NC #1</strong></p>
<p><strong>Criterio:</strong> ISO 9001:2015 cl. 8.4.1 — A organizacao deve avaliar e selecionar provedores externos com base na sua capacidade de fornecer conforme requisitos.</p>
<p><strong>Evidencia:</strong> Dos 15 fornecedores classificados como criticos na lista LF-001, 4 (Fornecedores C, F, J, M) nao possuem registro de avaliacao no periodo jan-jun 2025.</p>
<p><strong>Conclusao:</strong> Nao conformidade — a avaliacao de fornecedores nao esta sendo realizada de forma sistematica conforme definido no PO-010.</p>
</div>

<h3>Quando NaO abrir NC</h3>
<ul>
<li><strong>Nao ha criterio claro:</strong> Se nao ha requisito (norma ou procedimento) que exija aquilo, nao e NC — pode ser OM</li>
<li><strong>Caso isolado comprovado:</strong> Se 1 registro em 50 tem erro e o auditado demonstra que e um caso pontual ja corrigido</li>
<li><strong>Opiniao pessoal:</strong> "Eu faria diferente" nao e base para NC</li>
</ul>

<div class="example"><strong>Cuidado:</strong> Na metalurgica, o auditor encontra um operador que nao sabe recitar a politica da qualidade palavra por palavra. Isso e NC? Depende. A clausula 7.3 exige que as pessoas estejam <strong>conscientes</strong> da politica — nao que a decoram. Se o operador sabe que a empresa busca qualidade e melhoria e entende seu papel, esta conforme.</div>
`}, NULL),

  (${m4.id}, '2-4-4-reuniao-encerramento', 'Reuniao de encerramento', '15 min', 4, ${`
<h2>Reuniao de encerramento</h2>
<p>A reuniao de encerramento e o momento em que a equipe auditora <strong>apresenta formalmente</strong> as constatacoes e conclusoes da auditoria ao auditado. E uma etapa critica: as constatacoes devem ser claras, as evidencias devem ser apresentadas, e o auditado deve ter oportunidade de comentar.</p>

<h3>Quem participa</h3>
<p>Os mesmos participantes da reuniao de abertura, mais qualquer pessoa que a direcao considere relevante. E importante que quem tem autoridade para desencadear acoes corretivas esteja presente.</p>

<h3>Agenda da reuniao de encerramento</h3>
<ol>
<li><strong>Agradecimento</strong> pela colaboracao durante a auditoria</li>
<li><strong>Reafirmar o escopo e objetivos</strong> (brevemente)</li>
<li><strong>Lembrar que a auditoria e amostral</strong> — nao conformidades podem existir em areas nao auditadas</li>
<li><strong>Apresentar as constatacoes</strong> — uma a uma, com criterio e evidencia</li>
<li><strong>Classificar cada constatacao</strong> — NC maior, NC menor, OM</li>
<li><strong>Apresentar a conclusao geral</strong> da auditoria</li>
<li><strong>Perguntas e esclarecimentos</strong> do auditado</li>
<li><strong>Definir proximos passos</strong> — prazo para acoes corretivas, responsaveis, forma de acompanhamento</li>
</ol>

<div class="callout"><strong>Regra de ouro:</strong> Nenhuma constatacao deve ser "surpresa" na reuniao de encerramento. Se voce identificou uma NC durante a auditoria, comunique ao auditado no momento — nao guarde para o encerramento. Isso e apresentacao justa e evita reacoes defensivas.</div>

<h3>Lidando com discordancias</h3>
<p>O auditado pode discordar de uma constatacao. Como proceder:</p>
<ul>
<li><strong>Ouça:</strong> O auditado pode ter informacoes que voce nao viu</li>
<li><strong>Reveja a evidencia:</strong> Se o auditado apresentar evidencia que refuta a constatacao, altere-a</li>
<li><strong>Mantenha se houver base:</strong> Se a evidencia e solida, mantenha a constatacao e registre a discordancia</li>
<li><strong>Nao negocie:</strong> NC nao e "negociavel". Se o requisito nao foi atendido, e NC — independente da justificativa</li>
</ul>

<div class="example"><strong>Situacao real na industria alimenticia:</strong> O auditor aponta NC porque nao encontrou registros de higienizacao das esteiras de quarta-feira. O gerente diz: "Na quarta paramos para manutencao preventiva, a higienizacao e feita apos a manutencao e registrada no formulario de manutencao, nao no de higienizacao." O auditor verifica o formulario de manutencao — realmente consta a higienizacao. Constatacao retirada. O auditor sugere como OM que a rastreabilidade seria melhor se houvesse referencia cruzada entre os dois formularios.</div>

<h3>Registro da reuniao</h3>
<p>Registre formalmente:</p>
<ul>
<li>Data, hora, participantes</li>
<li>Constatacoes apresentadas e classificacao</li>
<li>Discordancias registradas (se houver)</li>
<li>Conclusao geral</li>
<li>Prazos acordados para acoes corretivas</li>
<li>Assinatura (ou aceite eletronico) do auditado e do auditor-lider</li>
</ul>
`}, 'Modelo de ata de reuniao de encerramento')`;

  // ── Module 5: Relatorio e Acompanhamento ──
  const [m5] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Relatorio e Acompanhamento', 'Redacao de NCs, classificacao, relatorio final e follow-up de acoes corretivas', 5) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m5.id}, '2-5-1-redigindo-ncs', 'Redigindo nao conformidades claras', '20 min', 1, ${`
<h2>Redigindo nao conformidades claras</h2>
<p>Uma nao conformidade bem redigida e aquela que <strong>qualquer pessoa</strong> consegue entender — o auditado, o gestor de qualidade, a direcao, e ate um auditor externo que nunca esteve na empresa. A clareza da NC determina a qualidade da acao corretiva que sera tomada.</p>

<h3>Estrutura de uma NC bem escrita</h3>
<p>Toda NC deve conter tres elementos obrigatorios:</p>

<table>
<tr><th>Elemento</th><th>O que responde</th><th>Exemplo</th></tr>
<tr><td><strong>Criterio</strong></td><td>Qual requisito nao foi atendido?</td><td>ISO 9001:2015 cl. 7.1.5.2 — rastreabilidade de medicao</td></tr>
<tr><td><strong>Evidencia</strong></td><td>O que foi encontrado?</td><td>Paquimetro ID-045 com certificado de calibracao vencido desde 03/2025; em uso na linha de usinagem</td></tr>
<tr><td><strong>Declaracao da NC</strong></td><td>Por que e uma nao conformidade?</td><td>Instrumento de medicao utilizado para aceitar/rejeitar produto esta fora do prazo de calibracao valida</td></tr>
</table>

<h3>Exemplo completo</h3>
<div class="template-box">
<p><strong>NC #03 — Calibracao de instrumentos</strong></p>
<p><strong>Criterio:</strong> ISO 9001:2015, clausula 7.1.5.2 e procedimento PO-007 Controle de instrumentos de medicao, item 5.3.</p>
<p><strong>Evidencia:</strong> O paquimetro digital Mitutoyo ID-045, utilizado pelo operador Carlos na conferencia dimensional de pecas usinadas (celula 3), apresenta certificado de calibracao com validade ate 15/03/2025. Na data da auditoria (10/07/2025), o instrumento estava em uso sem recalibracao. O plano de calibracao PC-2025 preve calibracao a cada 6 meses.</p>
<p><strong>Declaracao:</strong> Instrumento de medicao utilizado na aceitacao de produto esta sendo operado alem do prazo de calibracao valida, em desacordo com o procedimento PO-007 e com a clausula 7.1.5.2 da ISO 9001:2015.</p>
</div>

<h3>Erros comuns na redacao de NCs</h3>
<table>
<tr><th>Erro</th><th>Exemplo ruim</th><th>Versao corrigida</th></tr>
<tr><td>Falta de criterio</td><td>"Documentos desorganizados no almoxarifado"</td><td>Indicar qual requisito exige organizacao e o que especificamente nao esta atendido</td></tr>
<tr><td>Evidencia vaga</td><td>"Alguns registros estao incompletos"</td><td>"Os registros R-012 dos dias 05/05, 12/05 e 18/05 nao possuem campo de aprovacao preenchido"</td></tr>
<tr><td>Julgamento pessoal</td><td>"O processo de compras e fraco"</td><td>Descrever o que foi encontrado objetivamente, sem adjetivos subjetivos</td></tr>
<tr><td>Misturar NCs</td><td>Uma NC com 3 problemas diferentes</td><td>Cada problema distinto deve ser uma NC separada</td></tr>
</table>

<div class="callout"><strong>Teste da NC:</strong> Releia sua NC e faca 3 perguntas: (1) O criterio esta claro? (2) A evidencia e verificavel? (3) Alguem que nao esteve na auditoria entenderia? Se a resposta for "sim" para as tres, a NC esta boa.</div>

<h3>Dicas praticas de redacao</h3>
<ul>
<li>Use linguagem factual e neutra — nao acuse pessoas</li>
<li>Inclua numeros, datas, codigos de documentos — quanto mais especifico, melhor</li>
<li>Uma NC por assunto — nao misture problemas diferentes</li>
<li>Cite o requisito especifico (clausula e item), nao genericamente "nao atende a norma"</li>
</ul>
`}, 'Formulario de registro de NC'),

  (${m5.id}, '2-5-2-classificacao-ncs', 'Classificacao: NC maior, NC menor e OM', '15 min', 2, ${`
<h2>Classificacao: NC maior, NC menor e oportunidade de melhoria</h2>
<p>Nem todas as nao conformidades tem o mesmo peso. A classificacao correta e essencial para <strong>priorizar as acoes corretivas</strong> e comunicar o nivel de gravidade a direcao. Classificar errado (NC maior como menor, ou vice-versa) compromete a credibilidade do auditor.</p>

<h3>Definicoes</h3>
<table>
<tr><th>Classificacao</th><th>Definicao</th><th>Consequencia tipica</th></tr>
<tr><td><strong>NC maior</strong></td><td>Nao atendimento que afeta a capacidade do SGQ de atingir os resultados pretendidos, ou ausencia/falha total de um requisito</td><td>Requer acao corretiva imediata; pode impedir certificacao ou levar a suspensao</td></tr>
<tr><td><strong>NC menor</strong></td><td>Nao atendimento parcial ou pontual que nao compromete o SGQ como um todo</td><td>Requer acao corretiva em prazo definido; nao impede certificacao</td></tr>
<tr><td><strong>Oportunidade de melhoria (OM)</strong></td><td>Situacao conforme que poderia ser melhorada para aumentar eficacia</td><td>Nao requer acao obrigatoria; e uma recomendacao</td></tr>
</table>

<h3>Criterios para classificar</h3>
<p>Use estas perguntas para decidir a classificacao:</p>
<ul>
<li><strong>O requisito esta totalmente ausente?</strong> (ex: nao existe processo de avaliacao de fornecedores) → NC maior</li>
<li><strong>O requisito existe mas falhou sistematicamente?</strong> (ex: avaliacao existe mas nao foi feita nos ultimos 12 meses para nenhum fornecedor) → NC maior</li>
<li><strong>O requisito existe e funciona, mas falhou pontualmente?</strong> (ex: 2 de 15 fornecedores sem avaliacao) → NC menor</li>
<li><strong>O requisito esta atendido mas poderia ser melhor?</strong> → OM</li>
<li><strong>Multiplas NCs menores no mesmo tema indicam falha sistematica?</strong> → Considerar NC maior</li>
</ul>

<div class="example"><strong>Exemplo pratico na construtora:</strong></p>
<ul>
<li><strong>NC maior:</strong> A empresa nao realiza auditoria interna ha 18 meses. O requisito 9.2 esta totalmente descumprido.</li>
<li><strong>NC menor:</strong> Auditoria interna e realizada regularmente, mas a auditoria de maio/2025 nao cobriu o processo de compras conforme programado.</li>
<li><strong>OM:</strong> Auditorias internas sao realizadas e cobrem todos os processos, mas o checklist poderia ser mais detalhado para o processo de compras, que tem historico de NCs.</li>
</ul>
</div>

<div class="callout"><strong>Regra pratica:</strong> Na duvida entre NC maior e menor, pergunte-se: "Se eu fosse o cliente desta empresa, essa falha me preocuparia seriamente?" Se sim, tende a ser maior. Se nao, tende a ser menor.</div>

<h3>Acumulo de NCs menores</h3>
<p>Atencao a um padrao perigoso: varias NCs menores no mesmo tema podem indicar uma falha sistematica que justifica reclassificacao como NC maior. Por exemplo:</p>
<ul>
<li>NC menor em calibracao no setor A</li>
<li>NC menor em calibracao no setor B</li>
<li>NC menor em calibracao no setor C</li>
</ul>
<p>Tres NCs menores em calibracao podem ser evidencia de falha no <strong>sistema</strong> de controle de instrumentos — o que seria uma NC maior.</p>
`}, NULL),

  (${m5.id}, '2-5-3-relatorio-final', 'Elaborando o relatorio final de auditoria', '20 min', 3, ${`
<h2>Elaborando o relatorio final de auditoria</h2>
<p>O relatorio e o <strong>produto final</strong> da auditoria — o documento que registra tudo o que foi feito, encontrado e concluido. Um bom relatorio e claro, completo, objetivo e util para a tomada de decisao. Um relatorio ruim gera confusao, retrabalho e desconfianca no processo de auditoria.</p>

<h3>Conteudo minimo do relatorio</h3>
<p>Segundo a ISO 19011:2018, clausula 6.5, o relatorio deve incluir:</p>

<table>
<tr><th>Secao</th><th>Conteudo</th></tr>
<tr><td>Identificacao</td><td>Numero/codigo da auditoria, data, processo/area auditada</td></tr>
<tr><td>Objetivo</td><td>O que a auditoria pretendeu verificar</td></tr>
<tr><td>Escopo</td><td>Processos, locais, periodo coberto</td></tr>
<tr><td>Criterios</td><td>Normas e documentos de referencia</td></tr>
<tr><td>Equipe auditora</td><td>Nomes e papeis</td></tr>
<tr><td>Cronologia</td><td>Datas e locais das atividades de auditoria</td></tr>
<tr><td>Constatacoes</td><td>Cada constatacao com criterio, evidencia e classificacao</td></tr>
<tr><td>Conclusao</td><td>Avaliacao geral do grau de atendimento dos criterios</td></tr>
<tr><td>Pontos positivos</td><td>Boas praticas identificadas (opcional mas recomendado)</td></tr>
<tr><td>Distribuicao</td><td>Quem recebe o relatorio</td></tr>
</table>

<div class="callout"><strong>Boa pratica:</strong> Inclua sempre uma secao de "pontos positivos". Auditorias que so apontam problemas geram desmotivacao. Reconhecer o que esta funcionando bem engaja as pessoas e reforça boas praticas.</div>

<h3>Exemplo de estrutura de relatorio</h3>
<div class="template-box">
<p><strong>RELATORIO DE AUDITORIA INTERNA N. AI-2025-003</strong></p>
<p><strong>Processo:</strong> Compras e recebimento | <strong>Data:</strong> 15/07/2025</p>
<p><strong>Auditor-lider:</strong> Maria Silva | <strong>Auditor:</strong> Joao Pereira</p>
<p><strong>Escopo:</strong> Processo de compras na unidade Caxias do Sul, periodo jan-jun 2025</p>
<p><strong>Criterios:</strong> ISO 9001:2015 cl. 8.4, PO-010 Compras v.3, PO-012 Recebimento v.2</p>
<p><strong>Conclusao geral:</strong> O processo de compras atende parcialmente aos criterios. 1 NC menor e 2 OMs foram identificadas. O processo de recebimento esta conforme.</p>
<p><strong>Pontos positivos:</strong> Sistema ERP bem configurado para rastreabilidade de pedidos; equipe de recebimento demonstra conhecimento dos criterios de inspecao.</p>
<p><strong>Constatacoes:</strong> [listagem detalhada de cada NC e OM]</p>
<p><strong>Prazo para acoes corretivas:</strong> 30 dias (ate 14/08/2025)</p>
</div>

<h3>Prazo para emissao do relatorio</h3>
<p>O relatorio deve ser emitido o mais rapido possivel apos a auditoria — idealmente em ate <strong>5 dias uteis</strong>. Quanto mais tempo passa, mais detalhes se perdem e menor e o senso de urgencia para as acoes corretivas.</p>

<h3>Distribuicao</h3>
<p>O relatorio deve ser distribuido para:</p>
<ul>
<li>Responsavel pela area auditada</li>
<li>Gestor do programa de auditoria</li>
<li>Alta direcao (ou representante designado)</li>
<li>Coordenador de qualidade</li>
</ul>

<h3>Erros comuns no relatorio</h3>
<ul>
<li><strong>Relatorio generico:</strong> "O processo esta bom com algumas oportunidades de melhoria" — nao diz nada</li>
<li><strong>Excesso de texto:</strong> Relatorio de 30 paginas que ninguem le. Seja conciso e objetivo.</li>
<li><strong>Falta de evidencias:</strong> NC sem mencionar registros, datas, numeros especificos</li>
<li><strong>Conclusao desalinhada:</strong> 3 NCs maiores e conclusao "o SGQ esta adequado" — incoerente</li>
</ul>
`}, 'Template de relatorio de auditoria'),

  (${m5.id}, '2-5-4-acompanhamento-acoes', 'Acompanhamento de acoes corretivas', '15 min', 4, ${`
<h2>Acompanhamento de acoes corretivas</h2>
<p>A auditoria nao termina no relatorio. O <strong>acompanhamento (follow-up)</strong> das acoes corretivas e o que transforma constatacoes em melhorias reais. Sem acompanhamento, a auditoria e apenas um exercicio burocratico que identifica problemas mas nao os resolve.</p>

<h3>Fluxo de tratamento de NCs</h3>
<ol>
<li><strong>Correcao (acao imediata):</strong> O auditado trata o efeito imediato (ex: retirar de uso o instrumento nao calibrado)</li>
<li><strong>Analise de causa-raiz:</strong> Investigar POR QUE a NC ocorreu (nao apenas o sintoma)</li>
<li><strong>Acao corretiva:</strong> Implementar acoes para eliminar a causa raiz e prevenir recorrencia</li>
<li><strong>Verificacao de eficacia:</strong> O auditor (ou gestor do programa) verifica se a acao funcionou</li>
<li><strong>Fechamento:</strong> Se eficaz, a NC e formalmente encerrada</li>
</ol>

<div class="callout"><strong>Diferenca critica:</strong> Correcao = tratar o sintoma ("calibrar o paquimetro"). Acao corretiva = eliminar a causa ("revisar o sistema de alerta de vencimento no plano de calibracao para que nao passe despercebido novamente").</div>

<h3>Ferramentas para analise de causa-raiz</h3>
<table>
<tr><th>Ferramenta</th><th>Descricao</th><th>Quando usar</th></tr>
<tr><td><strong>5 Por ques</strong></td><td>Perguntar "por que?" repetidamente ate chegar a causa raiz</td><td>Problemas simples a moderados</td></tr>
<tr><td><strong>Ishikawa (espinha de peixe)</strong></td><td>Categorizar causas potenciais em 6M (Maquina, Metodo, Material, Mao de obra, Meio ambiente, Medicao)</td><td>Problemas com multiplas causas possiveis</td></tr>
<tr><td><strong>Arvore de falhas</strong></td><td>Diagrama logico de eventos que levam a falha</td><td>Problemas complexos e criticos</td></tr>
</table>

<div class="example"><strong>Exemplo de 5 Por ques — paquimetro nao calibrado:</strong>
<ol>
<li>Por que o paquimetro estava vencido? Porque ninguem percebeu.</li>
<li>Por que ninguem percebeu? Porque nao ha alerta automatico de vencimento.</li>
<li>Por que nao ha alerta? Porque o controle e feito em planilha manual que ninguem consulta.</li>
<li>Por que ninguem consulta? Porque nao ha responsavel definido para essa tarefa.</li>
<li>Por que nao ha responsavel? Porque quando o antigo responsavel saiu, a tarefa nao foi reatribuida.</li>
</ol>
<p><strong>Causa raiz:</strong> Falta de definicao de responsabilidade e sistema de alerta para controle de calibracao.</p>
<p><strong>Acao corretiva:</strong> (1) Designar responsavel pelo controle de calibracao. (2) Migrar controle para sistema com alerta automatico de vencimento. (3) Incluir verificacao mensal na rotina do responsavel.</p>
</div>

<h3>Verificacao de eficacia</h3>
<p>A verificacao deve responder: "A acao implementada eliminou a causa e a NC nao reincidiu?" Metodos:</p>
<ul>
<li>Verificacao documental (evidencias de implementacao)</li>
<li>Verificacao em campo (auditoria de follow-up)</li>
<li>Monitoramento de indicadores (a tendencia melhorou?)</li>
<li>Amostragem apos implementacao (os proximos registros estao conformes?)</li>
</ul>

<h3>Prazos tipicos</h3>
<table>
<tr><th>Tipo de NC</th><th>Prazo para acao corretiva</th><th>Prazo para verificacao de eficacia</th></tr>
<tr><td>NC maior</td><td>30 a 60 dias</td><td>60 a 90 dias apos implementacao</td></tr>
<tr><td>NC menor</td><td>30 a 90 dias</td><td>Na proxima auditoria do processo</td></tr>
</table>
`}, 'Formulario de acao corretiva com 5 Por ques')`;

  // ── Module 6: Habilidades do Auditor ──
  const [m6] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Habilidades do Auditor', 'Comunicacao, gestao de conflitos, pensamento baseado em risco e etica', 6) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m6.id}, '2-6-1-comunicacao-postura', 'Comunicacao e postura profissional', '15 min', 1, ${`
<h2>Comunicacao e postura profissional</h2>
<p>A competencia tecnica e fundamental, mas sem habilidade de comunicacao, o auditor nao consegue extrair informacoes, transmitir constatacoes e manter um clima construtivo. Muitas auditorias fracassam nao por falta de conhecimento tecnico, mas por <strong>falha de comunicacao</strong>.</p>

<h3>Comunicacao verbal</h3>
<p>Diretrizes para a fala do auditor durante a auditoria:</p>
<ul>
<li><strong>Linguagem simples:</strong> Evite jargao excessivo. Em vez de "informe sobre o controle de provedores externos conforme 8.4.1", diga "me conte como voces escolhem e avaliam os fornecedores".</li>
<li><strong>Tom neutro:</strong> Nem arrogante nem intimidado. Profissional e respeitoso.</li>
<li><strong>Escuta ativa:</strong> Ouca mais do que fale. A proporcao ideal e 80% ouvindo, 20% falando.</li>
<li><strong>Reformule:</strong> "Se eu entendi corretamente, voce verifica a temperatura a cada hora. E isso?" — confirma entendimento e evita mal-entendidos.</li>
<li><strong>Agradeca:</strong> "Obrigado por explicar. Posso ver os registros?" — mantem o clima colaborativo.</li>
</ul>

<h3>Comunicacao nao verbal</h3>
<table>
<tr><th>Postura</th><th>Impacto</th></tr>
<tr><td>Contato visual moderado</td><td>Transmite interesse e atencao</td></tr>
<tr><td>Bracos cruzados</td><td>Pode transmitir julgamento ou distanciamento (evite)</td></tr>
<tr><td>Anotando enquanto a pessoa fala</td><td>Mostra que voce valoriza o que esta sendo dito</td></tr>
<tr><td>Olhando o relogio frequentemente</td><td>Transmite pressa e desinteresse (evite)</td></tr>
<tr><td>Sorriso leve e acenos</td><td>Encoraja o auditado a continuar explicando</td></tr>
</table>

<div class="callout"><strong>Regra pratica:</strong> Trate cada auditado como voce gostaria de ser tratado se estivesse sendo auditado. Respeito gera colaboracao. Arrogancia gera resistencia.</div>

<h3>Postura profissional no chao de fabrica</h3>
<ul>
<li>Use os EPIs exigidos — sem excecao. Se voce exige que outros sigam as regras, voce segue primeiro.</li>
<li>Nao toque em equipamentos, produtos ou instrumentos sem autorizacao</li>
<li>Nao interrompa atividades em andamento — espere um momento adequado</li>
<li>Cumprimente as pessoas e se apresente antes de fazer perguntas</li>
<li>Nao faca "emboscada" — nao faca perguntas tipo "pegadinha"</li>
</ul>

<div class="example"><strong>Situacao na metalurgica:</strong> O auditor chega na celula de usinagem CNC. Em vez de ir direto ao operador com o checklist na mao, ele se apresenta: "Oi, meu nome e Marcos, sou do time de qualidade. Voce tem uns minutos? Gostaria de entender como funciona o controle de processo aqui." Essa abordagem abre portas.</div>

<h3>O que NUNCA fazer</h3>
<ul>
<li>Criticar pessoas nominalmente — a NC e do processo, nao da pessoa</li>
<li>Fazer comparacoes entre setores ("La no setor X fazem certo, por que voces nao?")</li>
<li>Dar opiniao pessoal sobre como deveria ser feito (a menos que peçam)</li>
<li>Discutir constatacoes com outros auditados (confidencialidade)</li>
</ul>
`}, NULL),

  (${m6.id}, '2-6-2-conflitos-resistencias', 'Gerenciando conflitos e resistencias', '15 min', 2, ${`
<h2>Gerenciando conflitos e resistencias</h2>
<p>Resistencia a auditoria e natural. As pessoas se sentem avaliadas, expostas e potencialmente ameacadas. O auditor interno tem o desafio adicional de auditar <strong>colegas de trabalho</strong> — pessoas com quem convive no dia a dia. Saber gerenciar conflitos e resistencias e uma competencia essencial.</p>

<h3>Tipos comuns de resistencia</h3>
<table>
<tr><th>Comportamento</th><th>Exemplo</th><th>Como lidar</th></tr>
<tr><td><strong>Hostil/agressivo</strong></td><td>"Voce nao entende nada do meu trabalho"</td><td>Mantenha a calma. Reconheca a expertise do auditado. Redirecione para evidencias.</td></tr>
<tr><td><strong>Evasivo</strong></td><td>Respostas vagas, muda de assunto</td><td>Reformule a pergunta de forma mais especifica. Peca registros concretos.</td></tr>
<tr><td><strong>Excessivamente cooperativo</strong></td><td>Fala muito, mostra tudo menos o que importa</td><td>Redirecione educadamente: "Obrigado, agora vamos focar em..."</td></tr>
<tr><td><strong>Ausente/indisponivel</strong></td><td>"Hoje nao posso, estou muito ocupado"</td><td>Comunique ao gestor do programa. Se necessario, reagende com suporte da direcao.</td></tr>
<tr><td><strong>Intimidado/nervoso</strong></td><td>Pessoa travada, respostas monossilabicas</td><td>Tranquilize. Explique que nao e avaliacao pessoal. Comece com perguntas simples.</td></tr>
</table>

<h3>Tecnicas de desescalada</h3>
<ol>
<li><strong>Reconheça o sentimento:</strong> "Entendo que e desconfortavel ser auditado. Estou aqui para ajudar o processo, nao para julgar pessoas."</li>
<li><strong>Reformule:</strong> Em vez de "voce nao fez o registro", diga "notei que o registro deste dia esta em branco. Pode me explicar o que aconteceu?"</li>
<li><strong>Foque em fatos:</strong> Afaste-se de opinioes e volte para evidencias documentais.</li>
<li><strong>De tempo:</strong> Se o clima esquentar, sugira uma pausa. "Vamos fazer um intervalo de 10 minutos."</li>
<li><strong>Envolva o guia:</strong> Se o auditado designou um guia/acompanhante, ele pode ajudar a mediar.</li>
</ol>

<div class="callout"><strong>Limite:</strong> Se a resistencia impedir a auditoria (recusa em mostrar registros, obstrucao ativa), registre no relatorio e comunique ao gestor do programa e a direcao. Isso pode ser uma NC em si mesma (obstrucao ao processo de auditoria).</div>

<div class="example"><strong>Caso real numa industria alimenticia:</strong> O supervisor de producao ficou visivelmente irritado quando o auditor pediu para ver os registros de temperatura do pasteurizador. Disse: "Todo ano a mesma coisa, voces so sabem cobrar papel!" O auditor respondeu calmamente: "Entendo a frustracao. Os registros sao importantes porque protegem o produto e a seguranca do consumidor. Se houver uma forma melhor de manter esses registros que facilite o trabalho de voces, podemos sugerir como oportunidade de melhoria." O supervisor mostrou os registros e, ao final, agradeceu pela sugestao de digitalizacao dos formularios.</div>

<h3>Prevencao e a melhor estrategia</h3>
<ul>
<li>Comunique a agenda com antecedencia — surpresas geram resistencia</li>
<li>Explique na reuniao de abertura que o foco e o processo, nao a pessoa</li>
<li>Mantenha postura neutra e profissional durante toda a auditoria</li>
<li>Reconheca boas praticas — nao so aponte problemas</li>
<li>Se possivel, alterne auditores (evitar "perseguicao" percebida)</li>
</ul>
`}, NULL),

  (${m6.id}, '2-6-3-pensamento-risco', 'Pensamento baseado em risco na auditoria', '15 min', 3, ${`
<h2>Pensamento baseado em risco na auditoria</h2>
<p>A versao 2018 da ISO 19011 incluiu a <strong>abordagem baseada em risco</strong> como setimo principio. Na pratica, isso significa que o auditor deve usar o pensamento baseado em risco para <strong>planejar, conduzir e reportar</strong> a auditoria, priorizando o que tem maior impacto potencial.</p>

<h3>Onde o risco entra na auditoria</h3>
<table>
<tr><th>Etapa</th><th>Aplicacao do pensamento baseado em risco</th></tr>
<tr><td><strong>Programa</strong></td><td>Auditar com maior frequencia os processos de maior risco</td></tr>
<tr><td><strong>Planejamento</strong></td><td>Alocar mais tempo e auditores mais experientes para areas criticas</td></tr>
<tr><td><strong>Checklist</strong></td><td>Incluir mais perguntas para controles de alto risco</td></tr>
<tr><td><strong>Amostragem</strong></td><td>Amostrar mais itens em areas de maior risco</td></tr>
<tr><td><strong>Avaliacao</strong></td><td>Considerar o impacto potencial ao classificar NCs (maior vs. menor)</td></tr>
<tr><td><strong>Relatorio</strong></td><td>Destacar riscos identificados que nao sao cobertos por controles atuais</td></tr>
</table>

<h3>Identificando riscos no contexto da auditoria</h3>
<p>Perguntas que o auditor deve fazer ao planejar:</p>
<ul>
<li>Quais processos afetam diretamente a conformidade do produto ou seguranca do cliente?</li>
<li>Onde houve NCs recorrentes em auditorias anteriores?</li>
<li>Quais processos passaram por mudancas significativas recentemente?</li>
<li>Onde as reclamacoes de clientes se concentram?</li>
<li>Quais processos dependem fortemente de competencia individual (menos padronizados)?</li>
<li>Onde os controles sao mais fracos ou menos maduros?</li>
</ul>

<div class="example"><strong>Na metalurgica:</strong> O programa de auditoria identifica que o processo de tratamento termico e de alto risco: (a) e um processo especial (resultado so verificavel destrutivamente); (b) houve 2 NCs em auditorias anteriores; (c) opera no turno noturno com supervisao reduzida. Resultado: o tratamento termico recebe 2 auditorias por ano (ao inves de 1) com auditor que tem experiencia em metalurgia.</div>

<h3>Riscos DO programa de auditoria</h3>
<p>Alem de considerar riscos NOS processos auditados, o gestor deve considerar riscos no proprio programa:</p>
<ul>
<li><strong>Risco de nao executar:</strong> Auditores sobrecarregados, ausencias, falta de recursos</li>
<li><strong>Risco de baixa qualidade:</strong> Auditores nao qualificados, checklists genericos</li>
<li><strong>Risco de parcialidade:</strong> Auditor auditando area com conflito de interesse</li>
<li><strong>Risco de irrelevancia:</strong> Programa que nao cobre processos criticos ou mudancas recentes</li>
</ul>

<div class="callout"><strong>Aplicacao pratica:</strong> Nao e preciso uma analise de risco formal (matriz probabilidade x impacto) para cada auditoria interna. O importante e que o auditor <strong>pense</strong> sobre o que e mais critico e direcione seu tempo e atencao proporcionalmente. Isso ja atende ao principio.</div>
`}, NULL),

  (${m6.id}, '2-6-4-etica-confidencialidade', 'Etica e confidencialidade', '15 min', 4, ${`
<h2>Etica e confidencialidade</h2>
<p>A auditoria coloca o auditor numa posicao de <strong>poder e confianca</strong>. Ele tem acesso a informacoes sensiveis, avalia o trabalho de colegas e gera constatacoes que podem ter consequencias significativas. Sem etica e confidencialidade, esse poder se corrompe e o processo perde legitimidade.</p>

<h3>Principios eticos do auditor</h3>
<ul>
<li><strong>Veracidade:</strong> Relatar exatamente o que foi encontrado — sem exagerar, minimizar ou omitir</li>
<li><strong>Imparcialidade:</strong> Nao favorecer nem prejudicar nenhum auditado por relacoes pessoais</li>
<li><strong>Objetividade:</strong> Basear constatacoes em evidencias, nao em opinioes ou preconceitos</li>
<li><strong>Responsabilidade:</strong> Assumir a responsabilidade pela qualidade e precisao do trabalho</li>
<li><strong>Respeito:</strong> Tratar todos com dignidade, independente de cargo ou funcao</li>
</ul>

<h3>Dilemas eticos comuns</h3>
<table>
<tr><th>Dilema</th><th>Resposta etica</th></tr>
<tr><td>Seu supervisor pede para "pegar leve" com certo setor</td><td>Mantenha a imparcialidade. Audite conforme os criterios, nao conforme interesses politicos.</td></tr>
<tr><td>Voce descobre que um amigo proximo nao segue o procedimento</td><td>Registre a constatacao como faria com qualquer outro auditado. Se ha conflito de interesse, solicite substituicao.</td></tr>
<tr><td>O auditado oferece um "presente" (almoço especial, brinde)</td><td>Recuse cortesmente. Aceitar pode comprometer sua independencia percebida.</td></tr>
<tr><td>Voce encontra evidencia de fraude (nao apenas NC)</td><td>Registre e comunique ao gestor do programa e a direcao. Nao tente investigar alem do escopo da auditoria.</td></tr>
<tr><td>A direcao quer que voce "gere NCs" para justificar demissao de alguem</td><td>Recuse. Auditoria nao e ferramenta disciplinar. NCs sao geradas por evidencias, nao por agenda politica.</td></tr>
</table>

<div class="callout"><strong>Teste de etica:</strong> Antes de agir, pergunte-se: "Se esta decisao fosse publicada no mural da empresa, eu me sentiria confortavel?" Se a resposta for nao, repense.</div>

<h3>Confidencialidade na pratica</h3>
<p>O auditor interno tem obrigacao de manter sigilo sobre:</p>
<ul>
<li>Informacoes de processos e tecnologia da empresa</li>
<li>Dados de fornecedores, precos, contratos</li>
<li>Problemas identificados em setores especificos (nao comentar com outros setores)</li>
<li>Informacoes pessoais dos auditados</li>
<li>Constatacoes antes de serem formalmente comunicadas</li>
</ul>

<div class="example"><strong>Situacao na cooperativa agricola:</strong> Durante a auditoria do processo de compras de insumos, o auditor descobre que um fornecedor de sementes pratica precos 40% acima do mercado e nao ha cotacao registrada. Ele registra a NC (falta de cotacao conforme procedimento). Mas nao comenta com colegas na hora do almoco que "o setor de compras esta pagando 40% a mais" — isso seria quebra de confidencialidade e poderia gerar fofocas e conflitos.</div>

<h3>Conflito de interesse</h3>
<p>O auditor deve <strong>declarar</strong> qualquer situacao que possa comprometer sua imparcialidade:</p>
<ul>
<li>Ter trabalhado recentemente na area auditada</li>
<li>Ter parentesco ou relacao pessoal proxima com o auditado</li>
<li>Ter interesse direto no resultado (ex: meta atrelada ao desempenho da area)</li>
<li>Ter participado da implementacao dos controles que esta auditando</li>
</ul>
<p>Em caso de conflito, o auditor deve ser substituido ou, no minimo, a situacao deve ser documentada e aprovada pelo gestor do programa.</p>
`}, NULL)`;

  // ── Module 7: Pratica e Certificacao ──
  const [m7] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Pratica e Certificacao', 'Estudos de caso completos, erros comuns e preparacao para avaliacao final', 7) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m7.id}, '2-7-1-caso-metalurgica', 'Estudo de caso: auditoria completa numa metalurgica', '25 min', 1, ${`
<h2>Estudo de caso: auditoria interna completa numa metalurgica</h2>
<p>Vamos acompanhar uma auditoria interna do inicio ao fim na <strong>MetalSul Usinagem Ltda</strong>, uma metalurgica com 85 funcionarios certificada ISO 9001:2015, localizada em Caxias do Sul/RS. O processo auditado sera <strong>Producao (usinagem CNC)</strong>.</p>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Fabricacao de pecas usinadas de precisao para industria automotiva e agricola</li>
<li><strong>Processo auditado:</strong> Usinagem CNC (tornos e centros de usinagem)</li>
<li><strong>Motivo da prioridade:</strong> 3 reclamacoes de cliente nos ultimos 4 meses por variacao dimensional; 1 NC na auditoria anterior (calibracao)</li>
<li><strong>Auditor-lider:</strong> Ana (coord. de qualidade — 5 anos de experiencia em auditoria)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 (Producao), 7.1.5 (Monitoramento e medicao), PO-020 (Usinagem CNC)</li>
</ul>

<h3>Fase 1: Preparacao</h3>
<p>Ana revisou antes da auditoria:</p>
<ul>
<li>PO-020 Usinagem CNC v.4 e IT-030 Setup de maquina</li>
<li>Relatorio da auditoria anterior (NC de calibracao — acao corretiva implementada)</li>
<li>3 RACs (Relatorios de Acao Corretiva) das reclamacoes de clientes</li>
<li>Indicadores: indice de refugo (meta 2%, real 3,8% nos ultimos 3 meses)</li>
<li>Plano de calibracao PC-2025</li>
</ul>

<div class="callout"><strong>Ponto de atencao de Ana:</strong> O indice de refugo acima da meta e as reclamacoes por variacao dimensional sugerem que ha um problema no controle de processo ou na medicao. Isso vai guiar suas perguntas.</div>

<h3>Fase 2: Execucao (principais entrevistas e verificacoes)</h3>
<p><strong>Entrevista com o supervisor de producao:</strong></p>
<ul>
<li>Ana pergunta como e feito o setup das maquinas CNC. O supervisor explica o procedimento.</li>
<li>Ana pede para ver os registros de setup dos ultimos 3 meses. Nota que 4 registros nao tem a assinatura do operador.</li>
<li>Ana pergunta sobre as reclamacoes de clientes. O supervisor diz que "ja resolvemos trocando a ferramenta".</li>
</ul>

<p><strong>Observacao no chao de fabrica:</strong></p>
<ul>
<li>Ana observa um operador fazendo inspecao dimensional com paquimetro. O operador confere apenas 1 peca a cada 50. A IT-030 especifica 1 a cada 20.</li>
<li>Ana verifica a etiqueta de calibracao do paquimetro: dentro da validade.</li>
</ul>

<p><strong>Analise de registros:</strong></p>
<ul>
<li>Plano de calibracao: os 3 micrometros do setor estao em dia. OK.</li>
<li>RACs das reclamacoes: 2 das 3 nao tem analise de causa-raiz documentada — apenas "correcao: trocar ferramenta".</li>
</ul>

<h3>Fase 3: Constatacoes</h3>
<div class="template-box">
<p><strong>NC #1 (menor):</strong> 4 de 15 registros de setup amostrados (RF-080) nao possuem assinatura do operador conforme exigido pelo PO-020 item 6.2.</p>
<p><strong>NC #2 (menor):</strong> Operador realizando inspecao dimensional a cada 50 pecas; IT-030 item 4.1 determina frequencia de 1:20.</p>
<p><strong>NC #3 (menor):</strong> RACs 2025-008 e 2025-011 (reclamacoes de clientes) nao possuem analise de causa-raiz documentada conforme PO-050 Acao Corretiva item 5.3. Apenas correcao foi registrada.</p>
<p><strong>OM #1:</strong> Considerar incluir carta de controle (CEP) para cotas criticas, dado o historico de reclamacoes por variacao dimensional.</p>
</div>

<h3>Fase 4: Encerramento e relatorio</h3>
<p>Ana apresenta as constatacoes na reuniao de encerramento. O supervisor concorda com as NCs e se compromete a tratar em 30 dias. Ana emite o relatorio em 3 dias uteis.</p>
`}, NULL),

  (${m7.id}, '2-7-2-caso-alimenticia', 'Estudo de caso: auditoria numa industria alimenticia', '25 min', 2, ${`
<h2>Estudo de caso: auditoria interna numa industria alimenticia</h2>
<p>Acompanhe a auditoria interna na <strong>CoopLat Laticinios</strong>, uma cooperativa de laticinios com 120 colaboradores no interior do Parana, certificada ISO 9001:2015 e com APPCC implementado. O processo auditado sera <strong>Pasteurizacao e envase</strong>.</p>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Producao de leite pasteurizado, iogurte e queijo mussarela</li>
<li><strong>Processo auditado:</strong> Pasteurizacao e envase de leite</li>
<li><strong>Motivo da prioridade:</strong> Novo equipamento de envase instalado ha 3 meses; mudanca de turno (de 2 para 3 turnos)</li>
<li><strong>Auditor-lider:</strong> Roberto (analista de qualidade — formacao em auditoria ISO 19011)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 e 8.6, PO-035 (Pasteurizacao), IT-040 (Envase), IN 76 MAPA (instrucao normativa)</li>
</ul>

<h3>Fase 1: Preparacao</h3>
<p>Roberto identificou pontos de atencao na analise documental:</p>
<ul>
<li>O PO-035 foi atualizado para incluir o novo equipamento de envase — verificar se os operadores conhecem a nova versao</li>
<li>3o turno opera com equipe menos experiente — verificar treinamento e supervisao</li>
<li>Registros de temperatura do pasteurizador sao criticos (72C por 15 segundos para leite tipo A)</li>
<li>Indicador de devolucao de produto por validade/qualidade: meta 0,5%, real 0,3% — dentro da meta</li>
</ul>

<h3>Fase 2: Execucao</h3>
<p><strong>Entrevista com operador do 3o turno (23h-07h):</strong></p>
<ul>
<li>Roberto pergunta: "Qual procedimento voce segue para operar o pasteurizador?"</li>
<li>Operador descreve o processo corretamente mas nao menciona o novo registro de controle do envase (adicionado na revisao 4 do PO-035)</li>
<li>Roberto pede para ver a pasta de procedimentos no setor: a versao disponivel e a revisao 3 (desatualizada)</li>
</ul>

<p><strong>Verificacao de registros de temperatura:</strong></p>
<ul>
<li>Roberto amostra 15 dias de registros. Em 14, tudo conforme.</li>
<li>No dia 12/06, o registro mostra temperatura de 71,2C as 03:15h — abaixo do minimo de 72C</li>
<li>Nao ha registro de desvio ou tratamento para esse lote</li>
</ul>

<p><strong>Observacao do envase:</strong></p>
<ul>
<li>Operacao do novo equipamento: operador segue corretamente as etapas</li>
<li>Limpeza CIP (Clean in Place): registros preenchidos conforme IT-041</li>
</ul>

<h3>Fase 3: Constatacoes</h3>
<div class="template-box">
<p><strong>NC #1 (maior):</strong> Registro de temperatura do pasteurizador de 12/06/2025 as 03:15h indica 71,2C (minimo 72C conforme PO-035 item 4.2 e IN 76 MAPA). Nao ha registro de tratamento do desvio nem de disposicao do lote. Falha no controle de PCC (Ponto Critico de Controle) que pode afetar a seguranca do produto.</p>
<p><strong>NC #2 (menor):</strong> A versao do PO-035 disponivel no setor de pasteurizacao/envase (3o turno) e a revisao 3 (jan/2025). A versao vigente e a revisao 4 (abr/2025), que inclui controles do novo equipamento de envase. Descumprimento da clausula 7.5.3 — controle de informacao documentada.</p>
<p><strong>OM #1:</strong> Implementar alarme automatico no sistema SCADA quando a temperatura do pasteurizador ficar abaixo de 72C, para que o desvio seja detectado em tempo real independente da atencao do operador.</p>
</div>

<div class="callout"><strong>Por que a NC #1 e maior:</strong> A pasteurizacao e um PCC — um ponto onde a falha pode causar dano a saude do consumidor. A ausencia de tratamento do desvio significa que um lote potencialmente inseguro pode ter sido liberado. Isso compromete a capacidade do SGQ de garantir seguranca do produto — criterio classico de NC maior.</div>

<h3>Fase 4: Acoes pos-auditoria</h3>
<p>O gestor de qualidade da CoopLat agiu imediatamente:</p>
<ul>
<li><strong>Correcao (NC#1):</strong> Rastreou o lote do dia 12/06 — ja havia sido distribuido. Acionou protocolo de recall preventivo.</li>
<li><strong>Acao corretiva (NC#1):</strong> Instalacao de alarme automatico no SCADA + retreinamento de operadores do 3o turno sobre procedimento de desvio.</li>
<li><strong>Acao corretiva (NC#2):</strong> Revisao do processo de distribuicao de documentos controlados para todos os turnos, com verificacao semanal.</li>
</ul>
`}, NULL),

  (${m7.id}, '2-7-3-erros-comuns', 'Erros comuns do auditor iniciante', '15 min', 3, ${`
<h2>Erros comuns do auditor iniciante</h2>
<p>Todo auditor começa como iniciante, e errar faz parte do aprendizado. Mas conhecer os erros mais frequentes ajuda voce a evita-los desde o inicio e a se desenvolver mais rapido. Estes sao os erros que vemos com mais frequencia em auditores internos de primeira viagem.</p>

<h3>Erros de planejamento</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Nao estudar a documentacao antes</td><td>Perguntas genericas, perda de tempo, constatacoes superficiais</td><td>Reserve pelo menos 2h de preparacao para cada dia de auditoria</td></tr>
<tr><td>Checklist copiado da internet</td><td>Perguntas nao aplicaveis ao processo real da empresa</td><td>Construa o checklist baseado nos procedimentos reais da organizacao + norma</td></tr>
<tr><td>Agenda irrealista</td><td>Auditoria apressada, constatacoes incompletas</td><td>Planeje com margem: entrevistas demoram mais do que parece</td></tr>
</table>

<h3>Erros de execucao</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Fazer perguntas de sim/nao</td><td>Respostas que nao revelam a pratica real</td><td>Use perguntas abertas: "Como...", "Mostre-me...", "Explique..."</td></tr>
<tr><td>Seguir rigidamente o checklist</td><td>Perder trilhas importantes que surgem nas respostas</td><td>Use o checklist como guia, nao como roteiro fixo. Siga as trilhas.</td></tr>
<tr><td>Nao anotar evidencias especificas</td><td>Constatacoes vagas que nao resistem a questionamento</td><td>Anote numeros de documentos, datas, nomes, lotes</td></tr>
<tr><td>Auditar apenas o "papel"</td><td>Verificar so documentos sem ver o processo real</td><td>Triangule: documento + entrevista + observacao</td></tr>
<tr><td>Fazer "emboscadas"</td><td>Auditados ficam na defensiva, clima hostil</td><td>Seja transparente sobre o que esta verificando</td></tr>
</table>

<h3>Erros de comunicacao</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Tom de "fiscal" ou "policia"</td><td>Resistencia, informacoes escondidas, clima negativo</td><td>Adote postura colaborativa e respeitosa</td></tr>
<tr><td>Discutir constatacoes no corredor</td><td>Fofoca, quebra de confidencialidade, conflitos</td><td>Comunique constatacoes apenas nos canais formais</td></tr>
<tr><td>Guardar "surpresas" para o encerramento</td><td>Auditado se sente traido, gera conflito</td><td>Comunique constatacoes ao auditado no momento em que sao identificadas</td></tr>
</table>

<h3>Erros de relatorio</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>NC sem criterio claro</td><td>Auditado questiona a validade, NC pode ser derrubada</td><td>Sempre cite o requisito especifico (clausula + procedimento)</td></tr>
<tr><td>NC baseada em opiniao pessoal</td><td>Falta de objetividade, perda de credibilidade</td><td>Baseie-se exclusivamente em evidencias vs. criterios</td></tr>
<tr><td>Relatorio demorado (>2 semanas)</td><td>Perda de senso de urgencia, detalhes esquecidos</td><td>Emita em ate 5 dias uteis</td></tr>
<tr><td>Nao registrar pontos positivos</td><td>Auditoria vista como puramente negativa</td><td>Inclua pelo menos 2-3 pontos positivos no relatorio</td></tr>
</table>

<div class="callout"><strong>Conselho para o auditor iniciante:</strong> Nas primeiras auditorias, va como observador ou membro da equipe (nao como lider). Aprenda com auditores mais experientes. Anote o que funciona e o que nao funciona. E lembre-se: confianca vem com pratica.</div>

<div class="example"><strong>Erro classico e como corrigir:</strong> O auditor iniciante encontra um formulario preenchido a lapis (em vez de caneta) e abre NC por "formulario preenchido a lapis". Mas nao existe requisito (nem na norma, nem no procedimento da empresa) que proiba lapis. Isso e opiniao pessoal, nao NC. Se o procedimento exigir caneta, ai sim — mas cite o procedimento.</div>
`}, NULL),

  (${m7.id}, '2-7-4-preparacao-quiz', 'Preparacao para o quiz final e proximos passos', '15 min', 4, ${`
<h2>Preparacao para o quiz final e proximos passos</h2>
<p>Voce chegou ao final do curso. Antes do quiz final, vamos consolidar os temas-chave e orientar seus proximos passos como auditor interno.</p>

<h3>Revisao dos temas essenciais</h3>
<table>
<tr><th>Modulo</th><th>Tema central</th><th>Conceito-chave</th></tr>
<tr><td>1</td><td>Fundamentos</td><td>Auditoria e processo sistematico baseado em evidencias, nao inspecao nem fiscalizacao</td></tr>
<tr><td>2</td><td>Programa</td><td>Programa = macro (anual). Plano = micro (1 auditoria). Gestor do programa coordena tudo.</td></tr>
<tr><td>3</td><td>Planejamento</td><td>Preparacao e 50% do sucesso. Checklist bem feito + analise documental = auditoria eficaz.</td></tr>
<tr><td>4</td><td>Execucao</td><td>Triangulacao (entrevista + observacao + registro). Perguntas abertas. Comunicacao constante.</td></tr>
<tr><td>5</td><td>Relatorio</td><td>NC = criterio + evidencia + declaracao. Classificacao: maior, menor, OM. Follow-up e essencial.</td></tr>
<tr><td>6</td><td>Habilidades</td><td>Comunicacao, etica, confidencialidade e pensamento em risco sao tao importantes quanto tecnica.</td></tr>
<tr><td>7</td><td>Pratica</td><td>Cada auditoria e unica. A pratica e o melhor professor.</td></tr>
</table>

<h3>Dicas para o quiz final</h3>
<ul>
<li>O quiz tem <strong>30 questoes</strong> de multipla escolha</li>
<li>Cobre todos os 7 modulos proporcionalmente</li>
<li>Foque nos conceitos, nao em decorar numeros de clausulas</li>
<li>Leia cada pergunta com atencao — muitas alternativas sao parecidas</li>
<li>Quando em duvida, pense no que a ISO 19011 e os principios de auditoria recomendam</li>
</ul>

<h3>Checklist de competencias adquiridas</h3>
<div class="template-box">
<p>Apos este curso, voce deve ser capaz de:</p>
<ul>
<li>Explicar a diferenca entre auditoria de 1a, 2a e 3a parte</li>
<li>Listar e aplicar os 7 principios da auditoria</li>
<li>Elaborar um programa anual de auditoria interna</li>
<li>Definir escopo, criterios e plano para uma auditoria individual</li>
<li>Construir checklists eficazes baseados em norma e procedimentos</li>
<li>Conduzir reunioes de abertura e encerramento</li>
<li>Aplicar tecnicas de entrevista e coleta de evidencias</li>
<li>Redigir nao conformidades com criterio, evidencia e declaracao</li>
<li>Classificar NCs (maior, menor) e OMs</li>
<li>Elaborar relatorio de auditoria completo</li>
<li>Acompanhar acoes corretivas e verificar eficacia</li>
<li>Gerenciar conflitos e resistencias durante a auditoria</li>
</ul>
</div>

<h3>Proximos passos</h3>
<ol>
<li><strong>Faca o quiz final</strong> e obtenha seu certificado de conclusao</li>
<li><strong>Participe como observador</strong> em uma auditoria interna real na sua organizacao</li>
<li><strong>Conduza sua primeira auditoria</strong> acompanhado de um auditor mais experiente</li>
<li><strong>Pratique a elaboracao de checklists</strong> para diferentes processos da sua empresa</li>
<li><strong>Busque reciclagem</strong> anualmente — participe de treinamentos, leia artigos, troque experiencias</li>
</ol>

<div class="callout"><strong>Lembre-se:</strong> O certificado deste curso atesta sua formacao teorica. A competencia real vem com a <strong>pratica</strong>. Comece a auditar o mais rapido possivel, mesmo que em escopo pequeno. Cada auditoria ensinara mais do que qualquer teoria.</div>
`}, 'Checklist de competencias do auditor interno')`;

  // ══════════════════════════════════════════════
  //  QUIZZES — Module quizzes (5 questions each)
  // ══════════════════════════════════════════════

  // Module 1 quiz
  const m1q = [
    ['Qual tipo de auditoria e conduzida pela propria organizacao para verificar seu SGQ?', ['1a parte (interna)','2a parte (de fornecedor)','3a parte (de certificacao)','Auditoria governamental'], 0, 'A auditoria de 1a parte (interna) e conduzida pela propria organizacao.'],
    ['Quantos principios de auditoria a ISO 19011:2018 estabelece?', ['5','6','7','8'], 2, 'A ISO 19011:2018 estabelece 7 principios de auditoria, incluindo a abordagem baseada em risco (novidade da versao 2018).'],
    ['Qual principio de auditoria foi adicionado na versao 2018 da ISO 19011?', ['Confidencialidade','Integridade','Abordagem baseada em risco','Apresentacao justa'], 2, 'A abordagem baseada em risco e o setimo principio, incluido na versao 2018.'],
    ['Qual e a hierarquia logica correta no processo de auditoria?', ['Evidencia > Criterio > Conclusao > Constatacao','Criterio > Evidencia > Constatacao > Conclusao','Constatacao > Evidencia > Criterio > Conclusao','Conclusao > Constatacao > Criterio > Evidencia'], 1, 'O auditor compara a evidencia com o criterio para gerar constatacoes, e agrupa as constatacoes para chegar a uma conclusao.'],
    ['Qual e a principal diferenca entre auditoria e inspecao?', ['Auditoria e mais rapida','Auditoria avalia o sistema, inspecao avalia o produto','Inspecao e feita por auditores certificados','Nao ha diferenca significativa'], 1, 'Auditoria avalia o sistema de gestao. Inspecao avalia o produto ou peca especifica.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 2 quiz
  const m2q = [
    ['Qual a diferenca entre programa de auditoria e plano de auditoria?', ['Sao sinonimos','Programa = todas as auditorias do periodo; Plano = uma auditoria especifica','Programa e feito pelo auditor; Plano pelo gestor','Plano e mais abrangente que programa'], 1, 'Programa e o panorama geral (todas as auditorias). Plano e o detalhamento de uma auditoria individual.'],
    ['Quem normalmente e responsavel por gerenciar o programa de auditoria?', ['O auditor-lider','A alta direcao pessoalmente','O gestor do programa (geralmente coord. de qualidade)','O organismo certificador'], 2, 'O gestor do programa e designado pela organizacao, geralmente sendo o coordenador de qualidade.'],
    ['Qual criterio NAO e valido para definir prioridades no programa de auditoria?', ['Resultados de auditorias anteriores','Preferencia pessoal do auditor','Reclamacoes de clientes','Mudancas significativas nos processos'], 1, 'A preferencia pessoal do auditor nao e criterio valido. As prioridades devem ser baseadas em risco, dados e requisitos.'],
    ['A ISO 19011 exige que o programa de auditoria considere:', ['Apenas os requisitos da norma ISO 9001','Riscos e oportunidades do programa','Apenas as reclamacoes de clientes','Apenas o orcamento disponivel'], 1, 'A versao 2018 enfatiza que riscos e oportunidades devem ser considerados no programa de auditoria.'],
    ['Um auditor interno pode auditar seu proprio setor de trabalho?', ['Sim, sempre','Nao, pois compromete a independencia','Sim, se tiver mais de 5 anos de experiencia','Sim, se o gestor autorizar'], 1, 'O principio da independencia exige que o auditor nao audite sua propria atividade/setor.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 3 quiz
  const m3q = [
    ['Qual e o principal objetivo da analise de documentacao pre-auditoria?', ['Encontrar nao conformidades antes da auditoria','Entender o processo e identificar pontos de atencao','Aprovar os procedimentos do auditado','Eliminar a necessidade de entrevistas'], 1, 'A analise documental prepara o auditor: entender o processo, identificar pontos de atencao e construir o checklist.'],
    ['No checklist de auditoria, qual tipo de pergunta e mais eficaz?', ['Perguntas de sim/nao','Perguntas abertas combinadas com pedido de evidencia','Perguntas indutivas','Perguntas multiplas (3 perguntas em 1)'], 1, 'Perguntas abertas + pedido de evidencia ("Mostre-me...") revelam a pratica real do processo.'],
    ['Na amostragem por julgamento, o auditor deve priorizar:', ['Apenas os registros mais recentes','Itens de maior risco e diferentes periodos/turnos','Apenas os itens que o auditado indicar','Sempre a mesma quantidade para todos os processos'], 1, 'A amostragem deve considerar risco, variedade de periodos, turnos e criticidade.'],
    ['O plano de auditoria deve ser comunicado ao auditado:', ['No dia da auditoria','Nunca — e confidencial','Com antecedencia suficiente (recomendado 1 semana)','Apenas se o auditado solicitar'], 2, 'O plano deve ser enviado com antecedencia para que o auditado se organize e as pessoas-chave estejam disponiveis.'],
    ['Se o auditor encontra uma nao conformidade na amostra, o que deve fazer?', ['Encerrar a auditoria','Ampliar a amostra para verificar se e pontual ou sistemico','Ignorar se for apenas 1 caso','Registrar e seguir em frente sem ampliar'], 1, 'Ao encontrar uma NC, o auditor deve ampliar a amostra para determinar se o problema e pontual ou sistemico.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 4 quiz
  const m4q = [
    ['Qual e o principal objetivo da reuniao de abertura?', ['Apresentar as nao conformidades encontradas','Alinhar expectativas, confirmar escopo e agenda','Definir quem sera punido','Coletar evidencias de auditoria'], 1, 'A reuniao de abertura alinha expectativas, confirma escopo, agenda e metodos, e define o tom da auditoria.'],
    ['A "regra dos 3 pontos" na coleta de evidencias significa:', ['Coletar 3 evidencias por NC','Triangular: entrevista + observacao + registro','Entrevistar pelo menos 3 pessoas','Verificar 3 documentos por processo'], 1, 'Triangulacao: pergunte ao operador (entrevista), veja ele fazendo (observacao), confira o registro (analise).'],
    ['Durante a auditoria, o auditor identifica uma NC. Quando deve comunicar ao auditado?', ['Apenas na reuniao de encerramento','No momento em que identifica','Apenas no relatorio final','Nunca — e confidencial ate o relatorio'], 1, 'As constatacoes devem ser comunicadas no momento para garantir apresentacao justa e evitar surpresas no encerramento.'],
    ['Na reuniao de encerramento, se o auditado discordar de uma constatacao, o auditor deve:', ['Retirar a constatacao automaticamente','Ouvir, revisar a evidencia e manter se houver base','Adiar a decisao para o proximo ano','Transformar a NC em oportunidade de melhoria'], 1, 'O auditor deve ouvir, revisar a evidencia, e manter a constatacao se ela tiver base solida.'],
    ['Perguntas indutivas ("Voce sempre segue o procedimento, correto?") devem ser evitadas porque:', ['Sao muito longas','Induzem a resposta que o auditor quer ouvir','Sao dificeis de entender','Sao proibidas pela ISO 19011'], 1, 'Perguntas indutivas direcionam a resposta e nao revelam a pratica real.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 5 quiz
  const m5q = [
    ['Uma NC bem redigida deve conter obrigatoriamente:', ['Criterio, evidencia e declaracao da NC','Nome do culpado e penalidade','Criterio e sugestao de melhoria','Apenas a descricao do problema'], 0, 'Os tres elementos obrigatorios sao: criterio (requisito nao atendido), evidencia (o que foi encontrado) e declaracao (por que e NC).'],
    ['Qual e a diferenca entre NC maior e NC menor?', ['NC maior e reincidente; NC menor e primeira vez','NC maior afeta o SGQ como um todo ou e ausencia total; NC menor e pontual','NC maior e do auditor externo; NC menor e do interno','Nao ha diferenca — sao sinonimos'], 1, 'NC maior = falha sistematica ou ausencia total de requisito. NC menor = falha pontual que nao compromete o SGQ.'],
    ['Multiplas NCs menores no mesmo tema podem indicar:', ['Que o auditor esta sendo rigoroso demais','Uma falha sistematica que justifica NC maior','Que a norma e muito exigente','Que o checklist esta errado'], 1, 'Varias NCs menores no mesmo tema podem evidenciar falha sistematica, justificando reclassificacao como NC maior.'],
    ['Qual e o prazo recomendado para emissao do relatorio de auditoria?', ['No mesmo dia','Ate 5 dias uteis','Ate 30 dias','Ate a proxima auditoria'], 1, 'O relatorio deve ser emitido o mais rapido possivel — idealmente ate 5 dias uteis.'],
    ['A verificacao de eficacia de uma acao corretiva responde a pergunta:', ['A acao foi implementada?','A NC foi registrada corretamente?','A causa raiz foi eliminada e a NC nao reincidiu?','O auditor aprovou o relatorio?'], 2, 'A verificacao de eficacia confirma que a acao eliminou a causa raiz e que a NC nao reincidiu.'],
  ];
  for (const [p, a, r, e] of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m5.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 6 quiz
  const m6q = [
    ['A escuta ativa do auditor significa:', ['Ouvir e ja preparar a proxima pergunta mentalmente','Ouvir com atencao, reformular para confirmar entendimento e nao interromper','Gravar todas as entrevistas','Anotar tudo palavra por palavra'], 1, 'Escuta ativa = ouvir atentamente, reformular para confirmar entendimento, nao interromper e demonstrar interesse genuino.'],
    ['Quando o auditado fica hostil, a melhor abordagem e:', ['Responder com firmeza e impor autoridade','Encerrar a auditoria imediatamente','Manter a calma, reconhecer a expertise do auditado e redirecionar para evidencias','Ignorar e seguir com o checklist'], 2, 'Manter a calma, reconhecer o conhecimento do auditado e redirecionar para fatos e evidencias desescala o conflito.'],
    ['O pensamento baseado em risco na auditoria significa:', ['Fazer analise de risco formal para cada auditoria','Priorizar areas de maior impacto no planejamento e conducao da auditoria','Auditar apenas processos de alto risco','Eliminar todos os riscos identificados'], 1, 'Significa direcionar tempo e atencao proporcionalmente ao risco/impacto de cada area.'],
    ['Se um auditor interno descobre evidencia de fraude durante a auditoria, deve:', ['Investigar a fraude pessoalmente','Registrar e comunicar ao gestor do programa e a direcao','Ignorar, pois nao e escopo da auditoria','Confrontar o auditado publicamente'], 1, 'O auditor deve registrar o achado e comunicar aos responsaveis (gestor e direcao), sem investigar alem do escopo.'],
    ['Qual situacao configura conflito de interesse para o auditor?', ['Auditar um processo que nunca trabalhou','Auditar uma area onde trabalhou recentemente','Auditar um processo diferente do seu setor','Usar checklist padronizado da empresa'], 1, 'Auditar area onde trabalhou recentemente compromete a independencia e configura conflito de interesse.'],
  ];
  for (const [p, a, r, e] of m6q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m6.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 7 quiz
  const m7q = [
    ['No estudo de caso da metalurgica, por que as RACs sem analise de causa-raiz foram NC?', ['Porque a norma proibe correcoes','Porque a acao corretiva exige identificacao da causa raiz (ISO 9001 cl. 10.2)','Porque o auditor nao gostou da resposta','Porque as reclamacoes nao foram resolvidas'], 1, 'A clausula 10.2 exige analise de causa raiz como parte da acao corretiva. Apenas correcao (tratar o sintoma) nao atende ao requisito.'],
    ['No estudo de caso da industria alimenticia, a NC de temperatura do pasteurizador foi classificada como maior porque:', ['O desvio foi de apenas 0,8C','A pasteurizacao e PCC e a falha pode afetar seguranca do consumidor','O operador era do 3o turno','O procedimento estava desatualizado'], 1, 'A pasteurizacao e um Ponto Critico de Controle (PCC). Falha no PCC sem tratamento pode comprometer a seguranca do produto.'],
    ['Um auditor iniciante abre NC porque um formulario foi preenchido a lapis. Isso esta correto?', ['Sim, formularios devem ser sempre a caneta','Depende — so e NC se existir requisito (norma ou procedimento) que proiba lapis','Sim, e uma pratica internacionalmente reconhecida','Nao, formularios a lapis sao aceitos pela ISO'], 1, 'So e NC se houver criterio (requisito) que determine uso de caneta. Opiniao pessoal nao e base para NC.'],
    ['Qual a primeira acao recomendada para um auditor recem-formado?', ['Liderar uma auditoria sozinho','Participar como observador numa auditoria com auditor experiente','Reescrever todos os procedimentos da empresa','Fazer outra certificacao antes de auditar'], 1, 'A pratica recomendada e comecar como observador, acompanhando auditores mais experientes.'],
    ['Ao identificar que o indice de refugo esta acima da meta, o auditor deve:', ['Abrir NC automaticamente','Investigar as causas e verificar se ha tratamento adequado dos desvios','Ignorar, pois indicadores nao sao escopo de auditoria','Recomendar demissao do supervisor'], 1, 'O auditor deve investigar se os desvios estao sendo tratados conforme o SGQ exige, nao apenas apontar o numero.'],
  ];
  for (const [p, a, r, e] of m7q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m7.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ══════════════════════════════════════════════
  //  FINAL QUIZ — 30 questions
  // ══════════════════════════════════════════════
  const finalQ = [
    ['Auditoria de 2a parte e realizada por:', ['A propria organizacao','O cliente no fornecedor','Organismo certificador','O governo'], 1, 'Auditoria de 2a parte e quando o cliente (ou representante) audita seu fornecedor.'],
    ['Qual principio de auditoria exige que o auditor nao divulgue informacoes sem autorizacao?', ['Integridade','Independencia','Confidencialidade','Apresentacao justa'], 2, 'Confidencialidade exige que informacoes obtidas na auditoria sejam protegidas.'],
    ['A ISO 19011:2018 e uma norma:', ['Certificavel','Nao certificavel — e uma norma-guia','Obrigatoria por lei','Aplicavel apenas a ISO 9001'], 1, 'A ISO 19011 e uma norma-guia para auditorias de sistemas de gestao. Nao e certificavel.'],
    ['O gestor do programa de auditoria e responsavel por:', ['Conduzir cada auditoria pessoalmente','Planejar cronograma, designar auditores e monitorar o programa','Apenas elaborar o relatorio final','Auditar a alta direcao'], 1, 'O gestor do programa coordena o planejamento, execucao e monitoramento do conjunto de auditorias.'],
    ['Na analise de documentacao pre-auditoria, o auditor deve buscar:', ['Apenas o manual da qualidade','O que a organizacao diz que faz, para comparar com a pratica em campo','Erros de portugues nos procedimentos','Apenas os indicadores financeiros'], 1, 'A analise documental prepara o auditor para verificar se a pratica corresponde ao documentado.'],
    ['Um escopo de auditoria bem definido deve conter:', ['Apenas o nome do processo','Processos, locais, periodo e turno (quando aplicavel)','Apenas a clausula da norma','O nome dos auditados'], 1, 'O escopo deve delimitar processos, locais, periodo e turno para direcionar o trabalho do auditor.'],
    ['Se nao ha criterio (requisito) para comparar, o auditor:', ['Pode abrir NC baseado em boas praticas','Pode abrir NC baseado em experiencia pessoal','Nao pode abrir NC — sem criterio nao ha constatacao de NC','Deve criar um novo requisito'], 2, 'Sem criterio (requisito documentado), nao ha base para nao conformidade. Pode sugerir como OM.'],
    ['A competencia do auditor interno inclui:', ['Apenas conhecimento da norma ISO 9001','Conhecimentos genericos de auditoria + conhecimentos especificos do setor + atributos pessoais','Apenas diploma universitario','Apenas experiencia profissional'], 1, 'A ISO 19011 requer conhecimentos genericos, especificos do setor e atributos pessoais.'],
    ['O ciclo PDCA aplicado ao programa de auditoria e:', ['P=auditar, D=relatar, C=corrigir, A=encerrar','P=definir objetivos e cronograma, D=executar auditorias, C=monitorar indicadores, A=ajustar programa','P=planejar o checklist, D=fazer entrevistas, C=preencher relatorio, A=fechar NCs','Nao se aplica ao programa de auditoria'], 1, 'O programa de auditoria segue PDCA: planejar, executar, monitorar e ajustar.'],
    ['A reuniao de abertura deve durar aproximadamente:', ['5 minutos','15 a 20 minutos','1 hora','Nao ha reuniao de abertura em auditorias internas'], 1, 'A reuniao de abertura deve ser breve (15-20 minutos), cobrindo escopo, criterios, agenda e expectativas.'],
    ['A tecnica de funil na entrevista significa:', ['Perguntar apenas sobre o topo da hierarquia','Comecar com perguntas amplas e ir afunilando para o especifico','Usar apenas perguntas fechadas','Entrevistar do operador ao gerente nessa ordem'], 1, 'A tecnica de funil vai do geral ("como funciona o processo?") ao especifico ("mostre-me o registro de...").'],
    ['Triangulacao na coleta de evidencias combina:', ['3 auditores diferentes','3 normas diferentes','Entrevista + observacao + analise de registros','3 entrevistas com a mesma pessoa'], 2, 'Triangulacao: pergunte (entrevista), veja (observacao) e confira (registro). Se os tres baterem, a evidencia e solida.'],
    ['Uma NC sem criterio claro e problematica porque:', ['O auditado pode questionar a validade da constatacao','O relatorio fica mais curto','A norma proibe NCs sem numero','Nao e problematica'], 0, 'Sem criterio claro, a NC pode ser questionada e derrubada pelo auditado, comprometendo a credibilidade do auditor.'],
    ['A diferenca entre correcao e acao corretiva e:', ['Correcao e mais importante que acao corretiva','Correcao trata o efeito imediato; acao corretiva elimina a causa raiz','Sao a mesma coisa','Correcao e preventiva; acao corretiva e reativa'], 1, 'Correcao = tratar o sintoma (calibrar o instrumento). Acao corretiva = eliminar a causa raiz (corrigir o sistema de alerta).'],
    ['NC maior se caracteriza por:', ['Falha pontual em um unico registro','Ausencia ou falha total de um requisito, afetando a capacidade do SGQ','Qualquer NC encontrada pelo auditor externo','Erro de digitacao em formulario'], 1, 'NC maior = falha sistematica ou ausencia total de um requisito que compromete o SGQ.'],
    ['A ferramenta dos 5 Por ques e usada para:', ['Definir o escopo da auditoria','Chegar a causa raiz de uma nao conformidade','Classificar NCs em maior ou menor','Elaborar o plano de auditoria'], 1, 'Os 5 Por ques aprofundam a investigacao ate identificar a causa raiz do problema.'],
    ['O relatorio de auditoria deve incluir pontos positivos porque:', ['E obrigatorio pela ISO 19011','Reconhecer boas praticas engaja as pessoas e equilibra o relatorio','Aumenta o numero de paginas','Facilita a aprovacao pelo gestor'], 1, 'Incluir pontos positivos equilibra o relatorio, reconhece boas praticas e evita que a auditoria seja vista como puramente punitiva.'],
    ['Quanto tempo o auditor tem, idealmente, para emitir o relatorio?', ['No mesmo dia da auditoria','Ate 5 dias uteis','Ate 30 dias','Ate a proxima reuniao de analise critica'], 1, 'O relatorio deve ser emitido o mais rapido possivel — idealmente ate 5 dias uteis apos a auditoria.'],
    ['Qual a proporcao ideal de fala do auditor durante a entrevista?', ['50% auditor, 50% auditado','80% auditor, 20% auditado','20% auditor, 80% auditado','100% auditor'], 2, 'O auditor deve ouvir mais do que falar. A proporcao ideal e 80% ouvindo, 20% falando.'],
    ['Quando o auditado se mostra evasivo e muda de assunto, o auditor deve:', ['Encerrar a entrevista','Aceitar as respostas vagas','Reformular a pergunta de forma mais especifica e pedir registros','Registrar obstrucao e sair'], 2, 'Reformular a pergunta e pedir evidencias concretas (registros) redireciona o auditado para o tema.'],
    ['O auditor observa um operador que nao sabe recitar a politica da qualidade. Isso e NC?', ['Sim, sempre','Nao, nunca','Depende — se ele entende seu papel e contribuicao, pode estar conforme (cl. 7.3)','Sim, se o operador tem mais de 1 ano de empresa'], 2, 'A clausula 7.3 exige consciencia (entender a politica e seu papel), nao memorizacao do texto.'],
    ['Em auditorias internas, a independencia e garantida por:', ['Contratar auditores externos','O auditor nao auditar sua propria area de trabalho','O auditor ser mais antigo que o auditado','O auditor ter diploma superior'], 1, 'Independencia em auditoria interna = nao auditar seu proprio trabalho ou setor.'],
    ['Amostragem em auditoria e necessaria porque:', ['A norma exige exatamente 10 amostras','O tempo e limitado e nao e possivel verificar 100% dos registros','O auditor so precisa ver documentos recentes','O auditado escolhe o que mostrar'], 1, 'O tempo de auditoria e limitado, entao o auditor trabalha com amostras representativas.'],
    ['Se a amostra revela NC, o auditor deve:', ['Encerrar e registrar a NC','Ampliar a amostra para verificar se e pontual ou sistemico','Ignorar se for apenas 1 caso em muitos','Pedir ao auditado que corrija antes de registrar'], 1, 'Ampliar a amostra ajuda a determinar se o problema e isolado ou sistemico, o que afeta a classificacao (menor vs. maior).'],
    ['O Diagrama de Ishikawa categoriza causas usando:', ['5 Por ques','As 10 clausulas da ISO 9001','6M: Maquina, Metodo, Material, Mao de obra, Meio ambiente, Medicao','PDCA'], 2, 'O Ishikawa (espinha de peixe) organiza causas potenciais nas categorias 6M.'],
    ['Qual clausula da ISO 9001:2015 exige auditoria interna?', ['8.5','9.1','9.2','10.2'], 2, 'A clausula 9.2 da ISO 9001:2015 estabelece os requisitos para auditoria interna.'],
    ['A verificacao de eficacia de acao corretiva deve ocorrer:', ['Imediatamente apos a implementacao','Apos tempo suficiente para verificar se a NC nao reincidiu','Apenas na proxima certificacao','Nunca — a implementacao basta'], 1, 'E preciso tempo para verificar se a acao realmente eliminou a causa raiz e a NC nao reincidiu.'],
    ['Um auditor que aceita presente do auditado compromete qual principio?', ['Cuidado profissional','Confidencialidade','Independencia','Abordagem baseada em evidencia'], 2, 'Aceitar presentes pode comprometer a independencia e imparcialidade percebida do auditor.'],
    ['Na reuniao de encerramento, constatacoes NAO devem ser surpresa porque:', ['O auditor deve comunicar constatacoes ao auditado no momento da identificacao','O auditado ja sabe o resultado antes da auditoria','As constatacoes sao enviadas por e-mail antes','O gestor do programa informa antecipadamente'], 0, 'Principio da apresentacao justa: comunicar constatacoes ao auditado no momento em que sao identificadas evita surpresas.'],
    ['Qual e a principal licao dos estudos de caso do modulo 7?', ['Auditorias devem durar pelo menos 3 dias','A preparacao e critica e cada auditoria revela situacoes unicas que exigem julgamento','Todas as NCs devem ser maiores','Auditorias internas nao geram acoes corretivas relevantes'], 1, 'Os estudos de caso mostram que preparacao solida e julgamento profissional sao essenciais para auditorias eficazes.'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
