export async function seedCourse2(sql) {
  const [course] = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ordem)
    VALUES (
      'auditor-interno-iso-9001',
      'Auditor Interno ISO 9001:2015',
      'Aprenda a planejar, conduzir e relatar auditorias internas com base na ISO 19011:2018.',
      'Curso completo de formação de auditor interno com foco prático: técnicas de auditoria, elaboração de checklist, condução de entrevistas, relatório de não conformidades e acompanhamento de ações corretivas.',
      '16 horas',
      497, 797,
      'Auditores internos, coordenadores de qualidade, analistas de SGQ, gestores',
      'Conhecimento básico de ISO 9001:2015 (recomendado o curso de Interpretação)',
      'Formar auditores internos capazes de planejar, executar e relatar auditorias de SGQ com base na ISO 19011:2018.',
      2
    ) RETURNING id
  `;
  const courseId = course.id;

  // ── Module 1: Fundamentos da Auditoria ──
  const [m1] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Fundamentos da Auditoria', 'Conceitos básicos, tipos de auditoria, princípios e terminologia da ISO 19011', 1) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m1.id}, '2-1-1-o-que-e-auditoria', 'O que e auditoria e tipos (1a, 2a, 3a parte)', '20 min', 1, ${`
<h2>O que e auditoria?</h2>
<p>Auditoria e um <strong>processo sistemático, independente e documentado</strong> para obter evidências objetivas e avalia-las de forma imparcial, a fim de determinar em que grau os critérios de auditoria são atendidos. Essa definição vem da ISO 19011:2018 e e a base de tudo que você aprendera neste curso.</p>

<div class="callout"><strong>Ponto-chave:</strong> Auditoria não einspeção, não efiscalização e não e"caca as bruxas". E um processo de <strong>verificação baseada em evidências</strong> que ajuda a organização a melhorar.</div>

<h3>Tipos de auditoria por "parte"</h3>
<p>As auditorias são classificadas conforme quem as realiza e com qual objetivo:</p>

<table>
<tr><th>Tipo</th><th>Quem realiza</th><th>Objetivo principal</th><th>Exemplo</th></tr>
<tr><td><strong>1a parte (interna)</strong></td><td>A própria organização</td><td>Verificar se o SGQ esta funcionando e identificar melhorias</td><td>Auditor interno da metalúrgica verifica o setor de usinagem</td></tr>
<tr><td><strong>2a parte (de fornecedor)</strong></td><td>O cliente no fornecedor</td><td>Avaliar a capacidade do fornecedor de atender requisitos</td><td>Montadora audita o fornecedor de peças estampadas</td></tr>
<tr><td><strong>3a parte (de certificação)</strong></td><td>Organismo certificador independente</td><td>Conceder, manter ou renovar o certificado ISO 9001</td><td>Bureau Veritas audita a construtora para certificação</td></tr>
</table>

<h3>Auditoria interna: o foco deste curso</h3>
<p>A auditoria interna (1a parte) e um <strong>requisito obrigatório</strong> da ISO 9001:2015 (cláusula 9.2). A organização deve conduzir auditorias internas a intervalos planejados para verificar se o SGQ esta conforme com os requisitos da própria organização e com a norma, e se esta mantido e implementado eficazmente.</p>

<div class="example"><strong>Na prática:</strong> Uma cooperativa agrícola de graos realiza auditorias internas semestrais. No primeiro semestre, cobre os processos de recebimento, classificação e armazenagem. No segundo, compras, logística e atendimento ao cooperado. Ao final do ano, todos os processos foram auditados.</div>

<h3>Auditorias combinadas e conjuntas</h3>
<p>Alem da classificação por "parte", existem duas modalidades especiais:</p>
<ul>
<li><strong>Auditoria combinada:</strong> Duas ou mais normas auditadas ao mesmo tempo (ex: ISO 9001 + ISO 14001 numa única auditoria). Economiza tempo e recursos.</li>
<li><strong>Auditoria conjunta:</strong> Dois ou mais organismos/organizações auditam juntos o mesmo auditado (menos comum).</li>
</ul>

<h3>Diferença entre auditoria e inspeção</h3>
<table>
<tr><th>Aspecto</th><th>Auditoria</th><th>Inspeção</th></tr>
<tr><td>Foco</td><td>Sistema, processo, gestão</td><td>Produto, peca, serviço específico</td></tr>
<tr><td>Natureza</td><td>Amostral, sistemática</td><td>Pode ser 100% ou amostral</td></tr>
<tr><td>Resultado</td><td>Constatações e conclusões</td><td>Aprovado/reprovado</td></tr>
<tr><td>Realizada por</td><td>Auditor qualificado</td><td>Inspetor/controlador de qualidade</td></tr>
</table>

<div class="callout"><strong>Lembre-se:</strong> Auditoria avalia o <strong>sistema</strong> (como a organização gerencia a qualidade). Inspeção avalia o <strong>produto</strong> (se a peca esta dentro da tolerancia). Sao complementares, não substitutos.</div>
`}, NULL),

  (${m1.id}, '2-1-2-princípios-auditoria', 'Os 7 princípios da auditoria (ISO 19011)', '20 min', 2, ${`
<h2>Os 7 princípios da auditoria</h2>
<p>A ISO 19011:2018 estabelece 7 princípios que sustentam a prática da auditoria. Eles guiam o comportamento do auditor e garantem que os resultados sejam confiáveis e uteis. Um auditor que não segue esses princípios compromete toda a credibilidade do processo.</p>

<h3>1. Integridade</h3>
<p>O auditor deve ser <strong>honesto, diligente e responsável</strong>. Relatar as constatações de forma verdadeira e precisa, mesmo quando os resultados não são os que o auditado (ou o gestor do programa) gostaria de ouvir.</p>
<div class="example"><strong>Situação real:</strong> Numa metalúrgica, o auditor interno e amigo do supervisor da produção. Durante a auditoria, encontra registros de inspeção não preenchidos. Integridade significa registrar a constatação — não"dar um jeitinho" porque são amigos.</div>

<h3>2. Apresentação justa</h3>
<p>As constatações, conclusões e relatórios devem refletir <strong>fielmente</strong> as atividades da auditoria. Sem exageros, sem minimização, sem omissões.</p>

<h3>3. Devido cuidado profissional</h3>
<p>Aplicar diligencia e julgamento nas atividades de auditoria. Isso inclui <strong>preparação adequada</strong>, conhecimento dos critérios, e cuidado ao tirar conclusões.</p>

<h3>4. Confidencialidade</h3>
<p>O auditor tem acesso a informações sensíveis — processos, dados financeiros, problemas internos. Essas informações <strong>não devem ser divulgadas</strong> sem autorização.</p>
<div class="callout"><strong>Na prática:</strong> Se você audita o setor de compras e descobre que um fornecedor prática precos muito abaixo do mercado, não pode comentar isso no almoco com colegas de outros setores. A informação fica restrita ao relatório.</div>

<h3>5. Independencia</h3>
<p>O auditor deve ser <strong>independente da atividade auditada</strong>. Na auditoria interna, isso significa que você não pode auditar seu próprio trabalho ou seu próprio setor.</p>

<div class="example"><strong>Regra prática:</strong> O analista de qualidade pode auditar a produção. O supervisor de produção pode auditar o almoxarifado. Mas nenhum deles audita a si mesmo. Isso preserva a objetividade.</div>

<h3>6. Abordagem baseada em evidência</h3>
<p>Toda constatação deve ser sustentada por <strong>evidências objetivas</strong> — registros, observações diretas, declarações verificáveis. Opiniao não eevidência. "Eu acho que..." não eaceito.</p>

<h3>7. Abordagem baseada em risco</h3>
<p>Novidade da versão 2018 da ISO 19011. O auditor deve considerar os riscos e oportunidades ao planejar e conduzir a auditoria, priorizando áreas de maior impacto.</p>

<table>
<tr><th>Princípio</th><th>Pergunta-guia para o auditor</th></tr>
<tr><td>Integridade</td><td>Estou relatando com honestidade?</td></tr>
<tr><td>Apresentação justa</td><td>Minhas constatações refletem a realidade?</td></tr>
<tr><td>Cuidado profissional</td><td>Estou preparado e sendo diligente?</td></tr>
<tr><td>Confidencialidade</td><td>Estou protegendo as informações?</td></tr>
<tr><td>Independencia</td><td>Estou livre de conflito de interesse?</td></tr>
<tr><td>Baseada em evidência</td><td>Tenho provas objetivas?</td></tr>
<tr><td>Baseada em risco</td><td>Priorizei o que tem maior impacto?</td></tr>
</table>
`}, 'Autoavaliação: você prática os 7 princípios?'),

  (${m1.id}, '2-1-3-estrutura-iso-19011', 'Estrutura da ISO 19011:2018', '15 min', 3, ${`
<h2>Estrutura da ISO 19011:2018</h2>
<p>A ISO 19011 e a norma-guia para auditoria de qualquer sistema de gestão — ISO 9001, 14001, 45001, 27001, etc. Ela não e certificável (não existe "certificação ISO 19011"), mas e a <strong>referência técnica</strong> que todo auditor deve conhecer.</p>

<div class="callout"><strong>Importante:</strong> A ISO 19011:2018 substituiu a versão 2012. A principal novidade foi a inclusão da <strong>abordagem baseada em risco</strong> como setimo princípio e como diretriz para o programa de auditoria.</div>

<h3>Cláusulas da ISO 19011:2018</h3>
<table>
<tr><th>Cláusula</th><th>Título</th><th>Conteúdo</th></tr>
<tr><td>1</td><td>Escopo</td><td>Aplicação da norma (auditoria de sistemas de gestão)</td></tr>
<tr><td>2</td><td>Referencias normativas</td><td>Nenhuma (norma independente)</td></tr>
<tr><td>3</td><td>Termos e definições</td><td>Vocabulario de auditoria</td></tr>
<tr><td>4</td><td>Principios de auditoria</td><td>Os 7 princípios que vimos na aula anterior</td></tr>
<tr><td><strong>5</strong></td><td><strong>Gestão do programa de auditoria</strong></td><td>Como planejar e gerenciar o conjunto de auditorias</td></tr>
<tr><td><strong>6</strong></td><td><strong>Realização da auditoria</strong></td><td>Como conduzir uma auditoria individual (do inicio ao fim)</td></tr>
<tr><td><strong>7</strong></td><td><strong>Competência e avaliação de auditores</strong></td><td>Conhecimentos, habilidades e comportamento esperados</td></tr>
</table>

<h3>Cláusula 5 — Programa de auditoria</h3>
<p>A cláusula 5 trata do <strong>panorama geral</strong>: o programa de auditoria e o conjunto de todas as auditorias planejadas para um periodo (geralmente 1 ano). Inclui definição de objetivos, escopo, recursos, cronograma e critérios de seleção de auditores.</p>

<h3>Cláusula 6 — Realização da auditoria</h3>
<p>A cláusula 6 detalha o <strong>passo a passo</strong> de cada auditoria individual:</p>
<ol>
<li>Inicio da auditoria (contato inicial, viabilidade)</li>
<li>Preparação das atividades (análise documental, plano, checklist)</li>
<li>Condução da auditoria (reunião de abertura, coleta de evidências, reunião de encerramento)</li>
<li>Preparação e distribuição do relatório</li>
<li>Conclusão da auditoria</li>
<li>Acompanhamento (follow-up)</li>
</ol>

<h3>Cláusula 7 — Competência de auditores</h3>
<p>Define os <strong>conhecimentos e habilidades</strong> que um auditor deve ter, incluindo conhecimento da norma, do setor, técnicas de auditoria, e atributos pessoais como imparcialidade e postura ética.</p>

<div class="example"><strong>Visao geral:</strong> Pense assim — a cláusula 5 responde "quantas auditorias e quando?", a cláusula 6 responde "como fazer cada auditoria?" e a cláusula 7 responde "quem esta qualificado para auditar?".</div>
`}, NULL),

  (${m1.id}, '2-1-4-termos-definições', 'Termos e definições essenciais', '15 min', 4, ${`
<h2>Termos e definições essenciais</h2>
<p>Para comunicar com clareza durante uma auditoria, você precisa dominar o vocabulario técnico. Confundir "constatação" com "conclusão" ou "critério" com "evidência" gera mal-entendidos que comprometem o relatório e a credibilidade do auditor.</p>

<h3>Glossário do auditor</h3>
<table>
<tr><th>Termo</th><th>Definição</th><th>Exemplo prático</th></tr>
<tr><td><strong>Auditado</strong></td><td>Organização ou parte dela que esta sendo auditada</td><td>O setor de expedição da metalúrgica</td></tr>
<tr><td><strong>Auditor</strong></td><td>Pessoa que conduz a auditoria</td><td>O analista de qualidade treinado como auditor interno</td></tr>
<tr><td><strong>Equipe auditora</strong></td><td>Um ou mais auditores que conduzem uma auditoria, incluindo o auditor-lider</td><td>Maria (lider) + Joao (auditor técnico)</td></tr>
<tr><td><strong>Criterio de auditoria</strong></td><td>Conjunto de requisitos usados como referência para comparar as evidências</td><td>ISO 9001 cláusula 8.5, procedimento interno PO-012</td></tr>
<tr><td><strong>Evidência de auditoria</strong></td><td>Registros, declarações de fato ou outras informações verificáveis</td><td>Registro de inspeção preenchido, certificado de calibração valido</td></tr>
<tr><td><strong>Constatação de auditoria</strong></td><td>Resultado da avaliação da evidência contra o critério</td><td>"O registro de inspeção do lote 4523 não foi preenchido" (não conformidade)</td></tr>
<tr><td><strong>Conclusão de auditoria</strong></td><td>Resultado geral da auditoria, considerando os objetivos e todas as constatações</td><td>"O processo de expedição atende parcialmente os requisitos; 2 NCs menores identificadas"</td></tr>
</table>

<div class="callout"><strong>Hierarquia logica:</strong> Criterio → Evidência → Constatação → Conclusão. O auditor compara a evidência com o critério para gerar constatações, e agrupa as constatações para chegar a uma conclusão.</div>

<h3>Outros termos importantes</h3>
<ul>
<li><strong>Não conformidade (NC):</strong> Não atendimento de um requisito. Pode ser maior ou menor.</li>
<li><strong>Conformidade:</strong> Atendimento de um requisito.</li>
<li><strong>Oportunidade de melhoria (OM):</strong> Situação que atende o requisito mas poderia ser melhor.</li>
<li><strong>Observação:</strong> Termo informal usado por alguns organismos para situações que podem se tornar NC se não tratadas.</li>
<li><strong>Programa de auditoria:</strong> Conjunto de auditorias planejadas para um periodo e com objetivo específico.</li>
<li><strong>Plano de auditoria:</strong> Descrição das atividades e arranjos de uma auditoria individual.</li>
<li><strong>Escopo de auditoria:</strong> Extensao e limites de uma auditoria (processos, locais, periodo).</li>
</ul>

<div class="example"><strong>Analogia:</strong> Criterio e a "regra do jogo". Evidência e o "lance que aconteceu". Constatação e o "cartao do juiz" (amarelo ou nenhum). Conclusão e o "resultado da partida".</div>

<h3>Confusoes comuns</h3>
<table>
<tr><th>Confusao</th><th>Correto</th></tr>
<tr><td>Tratar "constatação" como sinônimo de "não conformidade"</td><td>Constatação pode ser positiva (conformidade), negativa (NC) ou neutra (observação/OM)</td></tr>
<tr><td>Usar "auditoria" e "inspeção" como sinonimos</td><td>Auditoria avalia o sistema; inspeção avalia o produto</td></tr>
<tr><td>Confundir "plano de auditoria" com "programa de auditoria"</td><td>Plano = uma auditoria. Programa = todas as auditorias do periodo</td></tr>
</table>
`}, 'Glossário do auditor (PDF)')`;

  // ── Module 2: Gestão do Programa de Auditoria ──
  const [m2] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Gestão do Programa de Auditoria', 'Como planejar, gerenciar e melhorar o programa de auditorias internas', 2) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m2.id}, '2-2-1-conceito-programa', 'Conceito de programa de auditoria', '15 min', 1, ${`
<h2>Conceito de programa de auditoria</h2>
<p>O <strong>programa de auditoria</strong> e o planejamento macro que define quais auditorias serao realizadas em um determinado periodo, seus objetivos, abrangencia e recursos. Pense nele como o "plano anual de auditorias" — embora possa cobrir periodos diferentes de 12 meses.</p>

<div class="callout"><strong>Cláusula de referência:</strong> A ISO 19011:2018, cláusula 5, e a ISO 9001:2015, cláusula 9.2, exigem que a organização planeje um programa de auditoria considerando a importancia dos processos, mudancas que afetam a organização e resultados de auditorias anteriores.</div>

<h3>Programa vs. Plano: não confunda</h3>
<table>
<tr><th>Aspecto</th><th>Programa de auditoria</th><th>Plano de auditoria</th></tr>
<tr><td>Nível</td><td>Estrategico/gerencial</td><td>Operacional/tatico</td></tr>
<tr><td>Abrangencia</td><td>Todas as auditorias do periodo</td><td>Uma auditoria específica</td></tr>
<tr><td>Conteúdo</td><td>Cronograma, processos, auditores, recursos</td><td>Agenda detalhada, horarios, entrevistados</td></tr>
<tr><td>Quem elabora</td><td>Gestor do programa (geralmente o coord. de qualidade)</td><td>Auditor-lider da auditoria específica</td></tr>
</table>

<h3>Elementos de um programa de auditoria</h3>
<p>Segundo a ISO 19011, o programa deve incluir:</p>
<ul>
<li><strong>Objetivos:</strong> O que se pretende alcançar (ex: verificar conformidade, identificar melhorias, preparar para certificação)</li>
<li><strong>Extensao/escopo:</strong> Quais processos, locais, periodos serao cobertos</li>
<li><strong>Criterios:</strong> Contra quais requisitos sera auditado (ISO 9001, procedimentos internos, legislação)</li>
<li><strong>Métodos:</strong> Presencial, remota, hibrida</li>
<li><strong>Recursos:</strong> Equipe auditora, tempo, infraestrutura</li>
<li><strong>Cronograma:</strong> Quando cada auditoria sera realizada</li>
<li><strong>Riscos do programa:</strong> O que pode impedir o programa de atingir seus objetivos</li>
</ul>

<div class="example"><strong>Exemplo — metalúrgica com 8 processos:</strong> O programa anual preve 4 ciclos de auditoria (mar, jun, set, dez), cada um cobrindo 2 processos. Os processos críticos (produção e controle de qualidade) são auditados 2 vezes no ano; os de apoio (RH, TI), 1 vez.</div>

<h3>O gestor do programa</h3>
<p>Alguem deve ser designado para gerenciar o programa. Geralmente e o coordenador de qualidade, mas pode ser qualquer pessoa competente. Suas responsabilidades incluem:</p>
<ul>
<li>Estabelecer os objetivos do programa</li>
<li>Definir o cronograma e atribuir auditores</li>
<li>Garantir recursos (tempo liberado, salas, acesso a documentos)</li>
<li>Monitorar a implementação do programa</li>
<li>Analisar resultados e promover melhorias</li>
</ul>
`}, 'Template de programa anual de auditoria'),

  (${m2.id}, '2-2-2-escopo-critérios', 'Definindo escopo e critérios', '15 min', 2, ${`
<h2>Definindo escopo e critérios de auditoria</h2>
<p>Antes de iniciar qualquer auditoria individual, e fundamental definir com clareza <strong>o que sera auditado</strong> (escopo) e <strong>contra quais referências</strong> (critérios). Definições vagas geram auditorias superficiais e constatações questionáveis.</p>

<h3>Escopo de auditoria</h3>
<p>O escopo delimita a extensao e os limites da auditoria. Deve específicar:</p>
<ul>
<li><strong>Processos:</strong> Quais processos serao auditados (ex: compras, produção, expedição)</li>
<li><strong>Locais:</strong> Quais unidades, filiais ou áreas físicas</li>
<li><strong>Periodo:</strong> Quais registros/atividades serao verificados (ex: ultimos 6 meses)</li>
<li><strong>Turno:</strong> Se aplicável (ex: auditar apenas o turno noturno onde ha mais reclamações)</li>
</ul>

<div class="example"><strong>Escopo bem definido:</strong> "Auditoria do processo de recebimento e armazenagem de materias-primas na unidade de Caxias do Sul, cobrindo o periodo de janeiro a junho de 2025, nos turnos A e B."</div>

<div class="example"><strong>Escopo mal definido:</strong> "Auditoria da produção." — Qual unidade? Quais etapas? Qual periodo? Isso e vago demais.</div>

<h3>Criterios de auditoria</h3>
<p>Os critérios são as <strong>referências</strong> contra as quais as evidências serao comparadas. Os critérios mais comuns sao:</p>

<table>
<tr><th>Tipo de critério</th><th>Exemplo</th></tr>
<tr><td>Norma de referência</td><td>ISO 9001:2015 cláusulas 8.4 e 8.5</td></tr>
<tr><td>Procedimentos internos</td><td>PO-015 Controle de recebimento, IT-008 Armazenagem</td></tr>
<tr><td>Legislação/regulamentação</td><td>Portaria INMETRO 587, RDC Anvisa 275</td></tr>
<tr><td>Requisitos contratuais</td><td>Especificação do cliente XYZ para lote mínimo</td></tr>
<tr><td>Historico/metas</td><td>Meta de indice de rejeição < 2%</td></tr>
</table>

<div class="callout"><strong>Regra de ouro:</strong> Se não ha critério, não ha constatação. O auditor só pode apontar não conformidade se existir um requisito claro que não foi atendido. "Eu acho que deveria ser diferente" não ebase para NC — a menos que um requisito documentado diga isso.</div>

<h3>Relação entre escopo e critérios</h3>
<p>O escopo define <strong>onde</strong> olhar. O critério define <strong>o que</strong> procurar. Juntos, eles direcionam o trabalho do auditor e garantem foco.</p>

<h3>Fatores para definir prioridades</h3>
<p>Ao definir quais processos auditar primeiro, considere:</p>
<ul>
<li>Resultados de auditorias anteriores (processos com NCs recorrentes)</li>
<li>Reclamações de clientes concentradas em determinados processos</li>
<li>Mudancas significativas (novo equipamento, novo fornecedor, novo turno)</li>
<li>Criticidade do processo para o produto/serviço final</li>
<li>Riscos identificados pela organização</li>
</ul>
`}, NULL),

  (${m2.id}, '2-2-3-competência-auditores', 'Competência e avaliação de auditores', '20 min', 3, ${`
<h2>Competência e avaliação de auditores</h2>
<p>A cláusula 7 da ISO 19011:2018 e a cláusula 9.2 da ISO 9001:2015 exigem que os auditores internos sejam <strong>competentes</strong>. Mas o que significa "competente" neste contexto?</p>

<h3>Conhecimentos e habilidades necessários</h3>
<p>A ISO 19011 divide a competência do auditor em duas categorias:</p>

<table>
<tr><th>Categoria</th><th>Exemplos</th></tr>
<tr><td><strong>Conhecimentos genericos</strong></td><td>Principios de auditoria, norma ISO 19011, técnicas de entrevista, elaboração de relatório, amostragem</td></tr>
<tr><td><strong>Conhecimentos específicos do setor</strong></td><td>Processos de usinagem (metalúrgica), APPCC (alimentos), NRs aplicáveis (construção civil), normas técnicas do produto</td></tr>
</table>

<h3>Atributos pessoais do auditor</h3>
<p>Alem de conhecimento técnico, o auditor precisa de atributos comportamentais:</p>
<ul>
<li><strong>Etico:</strong> Justo, verdadeiro, sincero, honesto e discreto</li>
<li><strong>Mente aberta:</strong> Disposto a considerar pontos de vista e ideias alternativas</li>
<li><strong>Diplomatico:</strong> Tato ao lidar com pessoas</li>
<li><strong>Observador:</strong> Atento ao ambiente e as atividades</li>
<li><strong>Perceptivo:</strong> Capaz de entender situações e contextos</li>
<li><strong>Versatil:</strong> Adapta-se a diferentes situações</li>
<li><strong>Persistente:</strong> Focado em alcançar os objetivos</li>
<li><strong>Decidido:</strong> Capaz de chegar a conclusões em tempo hábil</li>
<li><strong>Autoconfiante:</strong> Age de forma independente ao interagir com outros</li>
</ul>

<div class="callout"><strong>Reflexao:</strong> Um auditor excelente tecnicamente mas arrogante e inflexível vai gerar resistencia e conflitos. Um auditor diplomatico mas sem conhecimento técnico vai perder constatações importantes. E preciso equilibrio.</div>

<h3>Como avaliar a competência</h3>
<p>A organização deve definir critérios para avaliar seus auditores internos. Métodos comuns:</p>
<ul>
<li><strong>Formação:</strong> Curso de auditor interno (como este!) com avaliação</li>
<li><strong>Experiencia:</strong> Participação em auditorias como observador ou membro da equipe</li>
<li><strong>Avaliação de desempenho:</strong> Feedback pos-auditoria pelo auditor-lider ou gestor do programa</li>
<li><strong>Atualização:</strong> Participação em treinamentos continuos</li>
</ul>

<div class="example"><strong>Criterio típico numa indústria alimentícia:</strong> Para atuar como auditor interno, o colaborador deve ter: (a) curso de auditor interno ISO 19011 de no mínimo 16h; (b) conhecimento básico de ISO 9001:2015; (c) pelo menos 1 auditoria acompanhada como observador; (d) avaliação satisfatória pelo gestor do programa.</div>

<h3>Auditor-lider: papel e competência adicional</h3>
<p>O auditor-lider coordena a equipe auditora e e responsável por:</p>
<ul>
<li>Elaborar o plano de auditoria</li>
<li>Coordenar a equipe durante a execução</li>
<li>Conduzir as reuniões de abertura e encerramento</li>
<li>Resolver impasses e tomar decisões</li>
<li>Aprovar o relatório final</li>
</ul>
`}, 'Matriz de competência de auditores'),

  (${m2.id}, '2-2-4-monitoramento-melhoria', 'Monitoramento e melhoria do programa', '15 min', 4, ${`
<h2>Monitoramento e melhoria do programa de auditoria</h2>
<p>Um programa de auditoria não e"defina e esqueca". Assim como qualquer processo do SGQ, ele segue o ciclo PDCA: planejar, executar, verificar e melhorar. O gestor do programa deve monitorar sua implementação e buscar melhorias continuamente.</p>

<h3>O que monitorar</h3>
<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta tipica</th></tr>
<tr><td>Taxa de execução do programa</td><td>% de auditorias planejadas que foram realizadas</td><td>100% (sem cancelamentos)</td></tr>
<tr><td>Cumprimento do cronograma</td><td>% de auditorias realizadas na data prevista</td><td>>= 90%</td></tr>
<tr><td>NCs identificadas por auditoria</td><td>Quantidade media de não conformidades</td><td>Acompanhar tendencia</td></tr>
<tr><td>Eficacia das ações corretivas</td><td>% de NCs efetivamente fechadas no prazo</td><td>>= 80%</td></tr>
<tr><td>Satisfação dos auditados</td><td>Feedback sobre a conduta e utilidade da auditoria</td><td>Favoravel</td></tr>
<tr><td>Desenvolvimento de auditores</td><td>Número de auditores qualificados ativos</td><td>Conforme necessidade</td></tr>
</table>

<h3>Análise crítica do programa</h3>
<p>Ao final do ciclo (geralmente anual), o gestor do programa deve fazer uma análise crítica que inclua:</p>
<ul>
<li>Resultados consolidados: total de NCs, por tipo, por processo, tendencias</li>
<li>Conformidade geral do SGQ (visao macro)</li>
<li>Desempenho dos auditores</li>
<li>Adequação do cronograma e dos recursos</li>
<li>Feedback dos auditados e da direção</li>
<li>Oportunidades de melhoria para o proximo ciclo</li>
</ul>

<div class="example"><strong>Exemplo — construtora:</strong> Na análise crítica do programa 2024, o gestor identificou que 60% das NCs estavam no processo de compras (3 auditorias seguidas). Ação: aumentar a frequência de auditoria de compras de anual para semestral em 2025, e incluir um auditor com experiência em supply chain na equipe.</div>

<h3>Melhorias tipicas no programa</h3>
<ul>
<li><strong>Ajustar frequência:</strong> Processos com mais NCs ou maior risco recebem mais auditorias</li>
<li><strong>Rotacionar auditores:</strong> Evitar que o mesmo auditor audite o mesmo processo sempre (perde a "visao fresca")</li>
<li><strong>Incluir auditorias não planejadas:</strong> Em caso de mudancas significativas, reclamações críticas ou incidentes</li>
<li><strong>Atualizar critérios:</strong> Incorporar novos requisitos legais, normativos ou de clientes</li>
<li><strong>Investir em capacitação:</strong> Treinar novos auditores e reciclar os existentes</li>
</ul>

<div class="callout"><strong>Ciclo PDCA do programa:</strong> <strong>P</strong> = definir objetivos, cronograma, auditores. <strong>D</strong> = executar as auditorias conforme planejado. <strong>C</strong> = monitorar indicadores e analisar resultados. <strong>A</strong> = ajustar o programa para o proximo ciclo.</div>
`}, NULL)`;

  // ── Module 3: Planejamento da Auditoria ──
  const [m3] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Planejamento da Auditoria', 'Análise documental, plano de auditoria, checklists e amostragem', 3) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m3.id}, '2-3-1-análise-documentação', 'Análise de documentação pre-auditoria', '20 min', 1, ${`
<h2>Análise de documentação pre-auditoria</h2>
<p>Antes de pisar no "chão de fábrica", o auditor deve <strong>estudar</strong>. A análise de documentação e a primeira etapa prática de qualquer auditoria e determina a qualidade de todo o trabalho subsequente. Um auditor que chega sem preparação faz perguntas genericas e perde constatações importantes.</p>

<h3>Quais documentos analisar</h3>
<p>Dependendo do escopo e dos critérios da auditoria, o auditor deve revisar:</p>

<table>
<tr><th>Documento</th><th>O que buscar</th></tr>
<tr><td>Política e objetivos da qualidade</td><td>Alinhamento com os processos auditados</td></tr>
<tr><td>Manual do SGQ (se existir)</td><td>Escopo, exclusões, mapa de processos</td></tr>
<tr><td>Procedimentos operacionais (POs)</td><td>O que a organização diz que faz no processo auditado</td></tr>
<tr><td>Instruções de trabalho (ITs)</td><td>Detalhamento operacional (como faz)</td></tr>
<tr><td>Registros recentes</td><td>Evidências de que o processo esta sendo seguido</td></tr>
<tr><td>Resultados de auditorias anteriores</td><td>NCs recorrentes, status de ações corretivas</td></tr>
<tr><td>Indicadores do processo</td><td>Tendencias, desvios, metas não atingidas</td></tr>
<tr><td>Reclamações de clientes</td><td>Relacionadas ao processo auditado</td></tr>
<tr><td>Mudancas recentes</td><td>Novos equipamentos, novos funcionarios, mudancas de processo</td></tr>
</table>

<div class="callout"><strong>Regra prática:</strong> Leia os documentos com uma pergunta na mente: "O que a organização disse que faz?" Na auditoria em campo, a pergunta muda para: "A organização realmente faz o que disse?"</div>

<h3>Sinais de atenção na análise documental</h3>
<p>Durante a análise, fique atento a:</p>
<ul>
<li><strong>Procedimentos desatualizados:</strong> Ultima revisao ha mais de 2 anos sem justificativa</li>
<li><strong>Lacunas:</strong> Requisitos da norma sem procedimento ou registro correspondente</li>
<li><strong>Complexidade excessiva:</strong> Procedimentos tao detalhados que ninguem consegue seguir</li>
<li><strong>NCs anteriores não fechadas:</strong> Ações corretivas pendentes ou atrasadas</li>
<li><strong>Indicadores sem análise:</strong> Dados coletados mas sem evidência de ação sobre desvios</li>
</ul>

<div class="example"><strong>Na metalúrgica:</strong> Ao analisar a documentação do setor de soldagem, o auditor percebe que a IT-023 (Instrução de soldagem) referência a específicação AWS D1.1:2010, mas a versão atual é 2020. Isso já é um ponto a verificar na auditoria em campo: estão usando a versão correta?</div>

<h3>Resultado da análise</h3>
<p>Ao final da análise documental, o auditor deve ter:</p>
<ol>
<li>Entendimento claro do processo a ser auditado</li>
<li>Lista de pontos de atenção para investigar em campo</li>
<li>Base para elaborar o checklist de auditoria</li>
<li>Insumos para o plano de auditoria (agenda, entrevistados-chave)</li>
</ol>
`}, NULL),

  (${m3.id}, '2-3-2-plano-auditoria', 'Elaboração do plano de auditoria', '20 min', 2, ${`
<h2>Elaboração do plano de auditoria</h2>
<p>O plano de auditoria e o documento que descreve os <strong>arranjos praticos</strong> para a realização de uma auditoria individual. Ele e elaborado pelo auditor-lider e deve ser comunicado ao auditado com antecedencia suficiente.</p>

<div class="callout"><strong>Cláusula de referência:</strong> ISO 19011:2018, cláusula 6.3.2 — "O auditor-lider deve preparar um plano de auditoria baseado nas informações contidas no programa de auditoria e na documentação fornecida pelo auditado."</div>

<h3>Conteúdo mínimo do plano</h3>
<p>Um plano de auditoria completo deve conter:</p>

<table>
<tr><th>Item</th><th>Descrição</th><th>Exemplo</th></tr>
<tr><td>Objetivo</td><td>O que a auditoria pretende verificar</td><td>Verificar conformidade do processo de compras com ISO 9001 cl. 8.4</td></tr>
<tr><td>Escopo</td><td>Processos, locais, periodo</td><td>Processo de compras, sede Caxias do Sul, jan-jun 2025</td></tr>
<tr><td>Criterios</td><td>Normas e documentos de referência</td><td>ISO 9001:2015 cl. 8.4, PO-010 Compras v.3</td></tr>
<tr><td>Equipe auditora</td><td>Nomes e papeis</td><td>Maria (lider), Joao (auditor)</td></tr>
<tr><td>Agenda/cronograma</td><td>Horarios e atividades</td><td>08:00 Abertura, 08:30-11:30 Entrevistas, 13:00-14:00 Encerramento</td></tr>
<tr><td>Auditados/entrevistados</td><td>Quem sera entrevistado</td><td>Gerente de compras, comprador, analista de qualidade de recebimento</td></tr>
<tr><td>Recursos necessários</td><td>Sala, acesso a sistemas, EPI</td><td>Acesso ao sistema ERP, sala de reunião, EPI para área de recebimento</td></tr>
<tr><td>Idioma</td><td>Se aplicável (auditorias internacionais)</td><td>Portugues</td></tr>
</table>

<h3>Exemplo de agenda de auditoria</h3>
<div class="template-box">
<p><strong>Auditoria Interna — Processo de Compras</strong><br>Data: 15/07/2025 | Auditor-lider: Maria Silva</p>
<table>
<tr><th>Horario</th><th>Atividade</th><th>Participantes</th></tr>
<tr><td>08:00 - 08:20</td><td>Reuniao de abertura</td><td>Equipe auditora + gerente de compras + coord. qualidade</td></tr>
<tr><td>08:20 - 10:00</td><td>Entrevista: gerente de compras</td><td>Maria (auditor-lider)</td></tr>
<tr><td>10:00 - 11:30</td><td>Entrevista: comprador + verificação de registros</td><td>Joao (auditor)</td></tr>
<tr><td>11:30 - 12:00</td><td>Visita a área de recebimento</td><td>Equipe auditora + inspetor de recebimento</td></tr>
<tr><td>12:00 - 13:00</td><td>Almoco</td><td>—</td></tr>
<tr><td>13:00 - 14:00</td><td>Consolidação de constatações (equipe auditora)</td><td>Maria + Joao</td></tr>
<tr><td>14:00 - 14:30</td><td>Reuniao de encerramento</td><td>Equipe auditora + gerente de compras + coord. qualidade</td></tr>
</table>
</div>

<h3>Dicas para um bom plano</h3>
<ul>
<li>Envie o plano ao auditado com pelo menos 1 semana de antecedencia</li>
<li>Seja realista com o tempo — entrevistas levam mais tempo do que parece</li>
<li>Reserve tempo para consolidação antes do encerramento</li>
<li>Inclua margem para imprevistos (atrasos, entrevistados ausentes)</li>
<li>O plano pode ser ajustado no dia, se necessário — não erigido</li>
</ul>

<div class="example"><strong>Erro comum:</strong> Planejar 6 entrevistas de 30 minutos seguidas sem intervalo. Na prática, cada entrevista pode levar 45-60 minutos, e o auditor precisa anotar e organizar antes da proxima. Resultado: atraso e estresse.</div>
`}, 'Template de plano de auditoria'),

  (${m3.id}, '2-3-3-checklists-eficazes', 'Construindo checklists eficazes', '20 min', 3, ${`
<h2>Construindo checklists eficazes</h2>
<p>O checklist e a <strong>ferramenta mais importante</strong> do auditor em campo. Ele guia a coleta de evidências, garante que nenhum requisito seja esquecido e serve como registro do trabalho realizado. Um checklist bem construido e a diferença entre uma auditoria superficial e uma auditoria que agrega valor.</p>

<h3>O que incluir no checklist</h3>
<p>Para cada requisito ou item do escopo, o checklist deve conter:</p>

<table>
<tr><th>Coluna</th><th>Função</th></tr>
<tr><td>Requisito/referência</td><td>Cláusula da norma ou item do procedimento interno</td></tr>
<tr><td>Pergunta/verificação</td><td>O que o auditor vai perguntar ou verificar</td></tr>
<tr><td>Método de verificação</td><td>Entrevista, observação, análise de registro</td></tr>
<tr><td>Evidência encontrada</td><td>O que o auditor efetivamente viu/ouviu (preenchido em campo)</td></tr>
<tr><td>Constatação</td><td>C (conforme), NC (não conforme), OM (oportunidade de melhoria)</td></tr>
<tr><td>Observações</td><td>Notas adicionais</td></tr>
</table>

<h3>Exemplo de checklist parcial — Processo de compras (ISO 9001 cl. 8.4)</h3>
<div class="template-box">
<table>
<tr><th>Ref.</th><th>Pergunta</th><th>Método</th><th>Evidência</th><th>Status</th></tr>
<tr><td>8.4.1</td><td>Os fornecedores críticos estao avaliados conforme critérios definidos?</td><td>Registro</td><td></td><td></td></tr>
<tr><td>8.4.1</td><td>Existe lista de fornecedores qualificados atualizada?</td><td>Registro</td><td></td><td></td></tr>
<tr><td>8.4.2</td><td>Os requisitos de compra estao claramente comunicados ao fornecedor?</td><td>Entrevista + registro</td><td></td><td></td></tr>
<tr><td>8.4.2</td><td>Os pedidos de compra incluem específicações técnicas quando aplicável?</td><td>Registro (amostra de POs)</td><td></td><td></td></tr>
<tr><td>8.4.3</td><td>Ha inspeção de recebimento para materiais críticos?</td><td>Observação + registro</td><td></td><td></td></tr>
<tr><td>8.4.3</td><td>Quando um material e reprovado no recebimento, qual o tratamento?</td><td>Entrevista</td><td></td><td></td></tr>
</table>
</div>

<h3>Tipos de pergunta no checklist</h3>
<ul>
<li><strong>Perguntas abertas:</strong> "Como você avalia os fornecedores?" — obrigam o auditado a explicar o processo</li>
<li><strong>Perguntas de verificação:</strong> "Mostre-me o registro de avaliação do fornecedor X" — confirmam com evidência</li>
<li><strong>Perguntas de rastreamento:</strong> "Posso ver o pedido de compra mais recente e verificar se inclui as específicações?" — seguem a trilha do processo</li>
</ul>

<div class="callout"><strong>Regra de ouro:</strong> Nunca use apenas perguntas de sim/não. "Você avalia fornecedores?" gera resposta "sim" e não revela nada. "Como você avalia fornecedores? Mostre-me os ultimos 3 registros" revela a prática real.</div>

<h3>Erros comuns na elaboração do checklist</h3>
<ul>
<li><strong>Copiar o texto da norma ipsis litteris:</strong> "A organização determina os processos providos externamente?" — isso não epergunta, e requisito. Traduza para linguagem operacional.</li>
<li><strong>Checklist genérico para todos os processos:</strong> Cada processo tem particularidades. Adapte.</li>
<li><strong>Checklist como questionario fechado:</strong> O checklist e um guia, não um roteiro rigido. Siga as trilhas que surgem.</li>
<li><strong>Não atualizar após cada ciclo:</strong> Incorpore lições aprendidas de auditorias anteriores.</li>
</ul>
`}, 'Modelo de checklist de auditoria'),

  (${m3.id}, '2-3-4-amostragem', 'Amostragem em auditoria', '15 min', 4, ${`
<h2>Amostragem em auditoria</h2>
<p>E impossível verificar 100% dos registros, entrevistar todos os colaboradores ou observar todas as atividades. Por isso, o auditor trabalha com <strong>amostras</strong> — seleções representativas que permitem tirar conclusões sobre o todo.</p>

<h3>Por que amostrar</h3>
<p>A auditoria tem tempo limitado. Se o processo de compras gera 200 pedidos por mes e você tem 2 horas, não da para verificar todos. A amostragem permite <strong>maximizar a cobertura</strong> dentro do tempo disponível.</p>

<div class="callout"><strong>ISO 19011:2018, Anexo A.6:</strong> A norma reconhece que a amostragem e necessária e fornece diretrizes sobre abordagens baseadas em julgamento e abordagens estatisticas.</div>

<h3>Tipos de amostragem</h3>
<table>
<tr><th>Tipo</th><th>Descrição</th><th>Quando usar</th></tr>
<tr><td><strong>Baseada em julgamento</strong></td><td>O auditor seleciona amostras com base em experiência e risco</td><td>Maioria das auditorias internas</td></tr>
<tr><td><strong>Estatistica</strong></td><td>Seleção aleatoria com calculo de tamanho amostral</td><td>Auditorias com grande volume de dados ou exigencia de rigor estatístico</td></tr>
</table>

<h3>Criterios para seleção da amostra (julgamento)</h3>
<p>Ao usar amostragem por julgamento, considere:</p>
<ul>
<li><strong>Periodo:</strong> Cubra diferentes meses (não apenas o ultimo)</li>
<li><strong>Turnos:</strong> Se ha turnos, amostre de mais de um</li>
<li><strong>Produtos/servicos:</strong> Inclua diferentes linhas ou tipos</li>
<li><strong>Fornecedores:</strong> Inclua fornecedores críticos e de menor porte</li>
<li><strong>Operadores:</strong> Entreviste diferentes pessoas (não só o mais experiente)</li>
<li><strong>Criticidade:</strong> Priorize itens de maior risco ou impacto</li>
</ul>

<div class="example"><strong>Na indústria alimentícia:</strong> Ao auditar o controle de temperatura das câmaras frias, o auditor seleciona registros de 3 meses diferentes, incluindo um mes de verão (maior risco de desvio). Verifica também os registros do turno noturno, onde supervisão é menor.</div>

<h3>Tamanho da amostra: referências práticas</h3>
<table>
<tr><th>Volume de registros no periodo</th><th>Amostra sugerida (mínimo)</th></tr>
<tr><td>Ate 10</td><td>Todos (ou maioria)</td></tr>
<tr><td>11 a 50</td><td>5 a 8</td></tr>
<tr><td>51 a 200</td><td>8 a 15</td></tr>
<tr><td>201 a 500</td><td>15 a 25</td></tr>
<tr><td>Acima de 500</td><td>25 a 40 (com foco nos críticos)</td></tr>
</table>

<div class="callout"><strong>Atenção:</strong> Se uma amostra revela não conformidade, <strong>amplie a amostra</strong> antes de concluir se e um problema pontual ou sistemico. Encontrar 1 registro errado em 5 pode ser acaso. Encontrar 3 em 5 e padrão.</div>

<h3>Registrando a amostra</h3>
<p>Sempre registre no checklist <strong>quais</strong> amostras você verificou: números de lotes, datas, nomes de fornecedores, números de pedidos. Isso da rastreabilidade ao relatório e permite ao auditado entender exatamente o que foi verificado.</p>
`}, NULL)`;

  // ── Module 4: Execução da Auditoria ──
  const [m4] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Execução da Auditoria', 'Reuniao de abertura, entrevistas, coleta de evidências e reunião de encerramento', 4) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m4.id}, '2-4-1-reunião-abertura', 'Reuniao de abertura', '15 min', 1, ${`
<h2>Reuniao de abertura</h2>
<p>A reunião de abertura e o <strong>primeiro contato formal</strong> entre a equipe auditora e os auditados. Ela define o tom da auditoria e pode determinar o nível de colaboração que você recebera. Uma abertura bem conduzida reduz ansiedade, esclarece expectativas e demonstra profissionalismo.</p>

<h3>Quem participa</h3>
<ul>
<li>Equipe auditora (auditor-lider + demais auditores)</li>
<li>Responsavel pela área auditada (gerente, supervisor, coordenador)</li>
<li>Coordenador/gestor de qualidade</li>
<li>Representante da alta direção (quando possível)</li>
<li>Guia (se designado pelo auditado)</li>
</ul>

<h3>Agenda da reunião de abertura</h3>
<p>A reunião deve ser breve (15-20 minutos) e cobrir:</p>
<ol>
<li><strong>Apresentação da equipe auditora</strong> e seus papeis</li>
<li><strong>Confirmação do escopo</strong> e objetivos da auditoria</li>
<li><strong>Criterios de auditoria</strong> utilizados</li>
<li><strong>Confirmação do plano/agenda</strong> — horarios, entrevistados, logística</li>
<li><strong>Métodos de auditoria</strong> — entrevistas, observações, análise de registros</li>
<li><strong>Classificação das constatações</strong> — como serao categorizadas (NC maior, menor, OM)</li>
<li><strong>Confidencialidade</strong> — reforcar que as informações serao tratadas com sigilo</li>
<li><strong>Canais de comunicação</strong> — como reportar problemas ou duvidas durante a auditoria</li>
<li><strong>Perguntas dos auditados</strong></li>
</ol>

<div class="callout"><strong>Dica importante:</strong> O tom da reunião de abertura define a auditoria. Seja profissional, mas acessível. Deixe claro que o objetivo e ajudar a organização a melhorar — não punir. Evite linguagem intimidadora.</div>

<div class="example"><strong>Frase de abertura eficaz:</strong> "Bom dia a todos. Nosso objetivo hoje e verificar como o processo de compras esta funcionando na prática, identificar o que esta indo bem e onde podemos melhorar. Não estamos aqui para encontrar culpados — estamos aqui para ajudar o processo a ficar mais robusto."</div>

<h3>Erros comuns na reunião de abertura</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th></tr>
<tr><td>Pular a reunião de abertura ("ja nos conhecemos")</td><td>Auditados não sabem o que esperar, gera confusao</td></tr>
<tr><td>Reuniao longa demais (>30 min)</td><td>Perde tempo que seria usado para a auditoria real</td></tr>
<tr><td>Tom autoritario ou intimidador</td><td>Auditados ficam na defensiva e omitem informações</td></tr>
<tr><td>Não confirmar a agenda</td><td>Pessoas-chave ausentes, salas ocupadas</td></tr>
</table>
`}, NULL),

  (${m4.id}, '2-4-2-técnicas-entrevista', 'Tecnicas de entrevista e coleta de evidências', '25 min', 2, ${`
<h2>Tecnicas de entrevista e coleta de evidências</h2>
<p>A entrevista e o principal método de coleta de evidências em auditoria. Um auditor que sabe entrevistar extrai informações valiosas em minutos; um auditor sem técnica perde tempo com perguntas ineficazes e não consegue avaliar o processo real.</p>

<h3>Os 3 métodos de coleta de evidências</h3>
<table>
<tr><th>Método</th><th>Descrição</th><th>Quando usar</th></tr>
<tr><td><strong>Entrevista</strong></td><td>Conversar com as pessoas que executam o processo</td><td>Entender como o processo funciona na prática</td></tr>
<tr><td><strong>Observação</strong></td><td>Ver as atividades sendo executadas in loco</td><td>Verificar se a prática corresponde ao documentado</td></tr>
<tr><td><strong>Análise de registros</strong></td><td>Examinar documentos, formulários, dados, sistemas</td><td>Verificar evidências objetivas de conformidade</td></tr>
</table>

<div class="callout"><strong>Regra dos 3 pontos:</strong> Sempre que possível, triangule: pergunte ao operador como faz (entrevista), veja ele fazendo (observação), e verifique o registro (análise). Se os tres baterem, a evidência e sólida.</div>

<h3>Tecnica de funil: do geral ao específico</h3>
<p>Comece com perguntas amplas e va afunilando:</p>
<ol>
<li><strong>Abertura:</strong> "Me conte como funciona o processo de recebimento de materiais."</li>
<li><strong>Aprofundamento:</strong> "Quem faz a inspeção? Quais critérios usa?"</li>
<li><strong>Verificação:</strong> "Posso ver o registro de inspeção do ultimo recebimento?"</li>
<li><strong>Sondagem:</strong> "E quando o material chega fora da específicação, o que acontece?"</li>
</ol>

<h3>Perguntas que funcionam</h3>
<table>
<tr><th>Tipo</th><th>Exemplo</th><th>Por que funciona</th></tr>
<tr><td>Aberta</td><td>"Como você controla..."</td><td>Obriga explicacao, revela o processo real</td></tr>
<tr><td>Mostre-me</td><td>"Mostre-me o registro de..."</td><td>Gera evidência objetiva</td></tr>
<tr><td>Hipotetica</td><td>"Se chegar material fora da específicação, o que você faz?"</td><td>Testa conhecimento do procedimento</td></tr>
<tr><td>Rastreamento</td><td>"Posso ver o pedido que originou essa entrega?"</td><td>Segue a trilha do processo (rastreabilidade)</td></tr>
</table>

<h3>Perguntas que NAO funcionam</h3>
<ul>
<li><strong>Sim/não:</strong> "Você segue o procedimento?" — resposta: "Sim". (Não revela nada.)</li>
<li><strong>Indutiva:</strong> "Você sempre calibra os instrumentos conforme o plano, certo?" — induz a resposta.</li>
<li><strong>Multipla:</strong> "Como você faz a inspeção, quem treinou você e qual a frequência?" — confunde o auditado.</li>
</ul>

<div class="example"><strong>Na cooperativa agrícola:</strong> O auditor pergunta ao operador do secador: "Me explique como você controla a temperatura de secagem do milho." O operador explica. O auditor pede: "Posso ver os registros da última semana?" Ao verificar, nota que há 2 dias sem registro. Sondagem: "O que aconteceu nesses dias?" Resposta: "Estava em manutenção." O auditor verifica a ordem de serviço de manutenção. Se não existir, há uma constatação.</div>

<h3>Anotações durante a entrevista</h3>
<ul>
<li>Anote <strong>fatos</strong>, não opiniões — "Registro R-045 não preenchido em 12/03", não"processo mal gerenciado"</li>
<li>Registre quem disse o que — "Operador Carlos informou que..."</li>
<li>Anote números de documentos, lotes, datas — são suas evidências</li>
<li>Se possível, tire foto (com autorização) de situações relevantes</li>
</ul>
`}, NULL),

  (${m4.id}, '2-4-3-avaliando-conformidade', 'Avaliando conformidade e gerando constatações', '20 min', 3, ${`
<h2>Avaliando conformidade e gerando constatações</h2>
<p>Apos coletar evidências, o auditor deve <strong>avaliar</strong> cada evidência contra os critérios de auditoria e gerar constatações. Essa e a etapa que transforma dados brutos em informação util para a organização.</p>

<h3>Tipos de constatação</h3>
<table>
<tr><th>Constatação</th><th>Significado</th><th>Exemplo</th></tr>
<tr><td><strong>Conformidade</strong></td><td>O requisito esta sendo atendido</td><td>Registros de inspeção de recebimento preenchidos e completos para todos os 10 lotes amostrados</td></tr>
<tr><td><strong>Não conformidade (NC)</strong></td><td>Um requisito não esta sendo atendido</td><td>3 dos 10 fornecedores críticos não possuem avaliação registrada conforme PO-010</td></tr>
<tr><td><strong>Oportunidade de melhoria (OM)</strong></td><td>O requisito esta atendido, mas ha potencial de melhoria</td><td>A avaliação de fornecedores considera apenas entrega no prazo; poderia incluir qualidade do material</td></tr>
</table>

<h3>O processo de avaliação</h3>
<p>Para cada item do checklist, siga este fluxo mental:</p>
<ol>
<li><strong>Identifique o critério:</strong> O que a norma/procedimento exige?</li>
<li><strong>Verifique a evidência:</strong> O que você efetivamente encontrou?</li>
<li><strong>Compare:</strong> A evidência atende ao critério?</li>
<li><strong>Classifique:</strong> Conforme, NC ou OM?</li>
<li><strong>Registre:</strong> Documente no checklist com detalhes suficientes</li>
</ol>

<div class="callout"><strong>Princípio fundamental:</strong> Uma constatação de NC deve sempre ter tres elementos: (1) o <strong>critério</strong> que não foi atendido, (2) a <strong>evidência</strong> objetiva, e (3) a <strong>explicacao</strong> de por que não atende. Se falta qualquer um dos tres, a constatação e fragil.</div>

<h3>Exemplo de constatação bem estruturada</h3>
<div class="template-box">
<p><strong>NC #1</strong></p>
<p><strong>Criterio:</strong> ISO 9001:2015 cl. 8.4.1 — A organização deve avaliar e selecionar provedores externos com base na sua capacidade de fornecer conforme requisitos.</p>
<p><strong>Evidência:</strong> Dos 15 fornecedores classificados como críticos na lista LF-001, 4 (Fornecedores C, F, J, M) não possuem registro de avaliação no periodo jan-jun 2025.</p>
<p><strong>Conclusão:</strong> Não conformidade — a avaliação de fornecedores não esta sendo realizada de forma sistemática conforme definido no PO-010.</p>
</div>

<h3>Quando NaO abrir NC</h3>
<ul>
<li><strong>Não ha critério claro:</strong> Se não ha requisito (norma ou procedimento) que exija aquilo, não eNC — pode ser OM</li>
<li><strong>Caso isolado comprovado:</strong> Se 1 registro em 50 tem erro e o auditado demonstra que e um caso pontual ja corrigido</li>
<li><strong>Opiniao pessoal:</strong> "Eu faria diferente" não ebase para NC</li>
</ul>

<div class="example"><strong>Cuidado:</strong> Na metalúrgica, o auditor encontra um operador que não sabe recitar a política da qualidade palavra por palavra. Isso e NC? Depende. A cláusula 7.3 exige que as pessoas estejam <strong>conscientes</strong> da política — não que a decoram. Se o operador sabe que a empresa busca qualidade e melhoria e entende seu papel, esta conforme.</div>
`}, NULL),

  (${m4.id}, '2-4-4-reunião-encerramento', 'Reuniao de encerramento', '15 min', 4, ${`
<h2>Reuniao de encerramento</h2>
<p>A reunião de encerramento e o momento em que a equipe auditora <strong>apresenta formalmente</strong> as constatações e conclusões da auditoria ao auditado. E uma etapa crítica: as constatações devem ser claras, as evidências devem ser apresentadas, e o auditado deve ter oportunidade de comentar.</p>

<h3>Quem participa</h3>
<p>Os mesmos participantes da reunião de abertura, mais qualquer pessoa que a direção considere relevante. E importante que quem tem autoridade para desencadear ações corretivas esteja presente.</p>

<h3>Agenda da reunião de encerramento</h3>
<ol>
<li><strong>Agradecimento</strong> pela colaboração durante a auditoria</li>
<li><strong>Reafirmar o escopo e objetivos</strong> (brevemente)</li>
<li><strong>Lembrar que a auditoria e amostral</strong> — não conformidades podem existir em áreas não auditadas</li>
<li><strong>Apresentar as constatações</strong> — uma a uma, com critério e evidência</li>
<li><strong>Classificar cada constatação</strong> — NC maior, NC menor, OM</li>
<li><strong>Apresentar a conclusão geral</strong> da auditoria</li>
<li><strong>Perguntas e esclarecimentos</strong> do auditado</li>
<li><strong>Definir proximos passos</strong> — prazo para ações corretivas, responsáveis, forma de acompanhamento</li>
</ol>

<div class="callout"><strong>Regra de ouro:</strong> Nenhuma constatação deve ser "surpresa" na reunião de encerramento. Se você identificou uma NC durante a auditoria, comunique ao auditado no momento — não guarde para o encerramento. Isso e apresentação justa e evita reações defensivas.</div>

<h3>Lidando com discordancias</h3>
<p>O auditado pode discordar de uma constatação. Como proceder:</p>
<ul>
<li><strong>Ouça:</strong> O auditado pode ter informações que você não viu</li>
<li><strong>Reveja a evidência:</strong> Se o auditado apresentar evidência que refuta a constatação, altere-a</li>
<li><strong>Mantenha se houver base:</strong> Se a evidência e sólida, mantenha a constatação e registre a discordancia</li>
<li><strong>Não negocie:</strong> NC não e"negociável". Se o requisito não foi atendido, e NC — independente da justificativa</li>
</ul>

<div class="example"><strong>Situação real na indústria alimentícia:</strong> O auditor aponta NC porque não encontrou registros de higienização das esteiras de quarta-feira. O gerente diz: "Na quarta paramos para manutenção preventiva, a higienização é feita após a manutenção e registrada no formulário de manutenção, não no de higienização." O auditor verifica o formulário de manutenção — realmente consta a higienização. Constatação retirada. O auditor sugere como OM que a rastreabilidade seria melhor se houvesse referência cruzada entre os dois formulários.</div>

<h3>Registro da reunião</h3>
<p>Registre formalmente:</p>
<ul>
<li>Data, hora, participantes</li>
<li>Constatações apresentadas e classificação</li>
<li>Discordancias registradas (se houver)</li>
<li>Conclusão geral</li>
<li>Prazos acordados para ações corretivas</li>
<li>Assinatura (ou aceite eletronico) do auditado e do auditor-lider</li>
</ul>
`}, 'Modelo de ata de reunião de encerramento')`;

  // ── Module 5: Relatorio e Acompanhamento ──
  const [m5] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Relatorio e Acompanhamento', 'Redação de NCs, classificação, relatório final e follow-up de ações corretivas', 5) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m5.id}, '2-5-1-redigindo-ncs', 'Redigindo não conformidades claras', '20 min', 1, ${`
<h2>Redigindo não conformidades claras</h2>
<p>Uma não conformidade bem redigida e aquela que <strong>qualquer pessoa</strong> consegue entender — o auditado, o gestor de qualidade, a direção, e ate um auditor externo que nunca esteve na empresa. A clareza da NC determina a qualidade da ação corretiva que sera tomada.</p>

<h3>Estrutura de uma NC bem escrita</h3>
<p>Toda NC deve conter tres elementos obrigatórios:</p>

<table>
<tr><th>Elemento</th><th>O que responde</th><th>Exemplo</th></tr>
<tr><td><strong>Criterio</strong></td><td>Qual requisito não foi atendido?</td><td>ISO 9001:2015 cl. 7.1.5.2 — rastreabilidade de medição</td></tr>
<tr><td><strong>Evidência</strong></td><td>O que foi encontrado?</td><td>Paquimetro ID-045 com certificado de calibração vencido desde 03/2025; em uso na linha de usinagem</td></tr>
<tr><td><strong>Declaração da NC</strong></td><td>Por que e uma não conformidade?</td><td>Instrumento de medição utilizado para aceitar/rejeitar produto esta fora do prazo de calibração valida</td></tr>
</table>

<h3>Exemplo completo</h3>
<div class="template-box">
<p><strong>NC #03 — Calibração de instrumentos</strong></p>
<p><strong>Criterio:</strong> ISO 9001:2015, cláusula 7.1.5.2 e procedimento PO-007 Controle de instrumentos de medição, item 5.3.</p>
<p><strong>Evidência:</strong> O paquimetro digital Mitutoyo ID-045, utilizado pelo operador Carlos na conferencia dimensional de peças usinadas (celula 3), apresenta certificado de calibração com validade ate 15/03/2025. Na data da auditoria (10/07/2025), o instrumento estava em uso sem recalibração. O plano de calibração PC-2025 preve calibração a cada 6 meses.</p>
<p><strong>Declaração:</strong> Instrumento de medição utilizado na aceitação de produto esta sendo operado alem do prazo de calibração valida, em desacordo com o procedimento PO-007 e com a cláusula 7.1.5.2 da ISO 9001:2015.</p>
</div>

<h3>Erros comuns na redação de NCs</h3>
<table>
<tr><th>Erro</th><th>Exemplo ruim</th><th>Versao corrigida</th></tr>
<tr><td>Falta de critério</td><td>"Documentos desorganizados no almoxarifado"</td><td>Indicar qual requisito exige organização e o que específicamente não esta atendido</td></tr>
<tr><td>Evidência vaga</td><td>"Alguns registros estao incompletos"</td><td>"Os registros R-012 dos dias 05/05, 12/05 e 18/05 não possuem campo de aprovação preenchido"</td></tr>
<tr><td>Julgamento pessoal</td><td>"O processo de compras e fraco"</td><td>Descrever o que foi encontrado objetivamente, sem adjetivos subjetivos</td></tr>
<tr><td>Misturar NCs</td><td>Uma NC com 3 problemas diferentes</td><td>Cada problema distinto deve ser uma NC separada</td></tr>
</table>

<div class="callout"><strong>Teste da NC:</strong> Releia sua NC e faca 3 perguntas: (1) O critério esta claro? (2) A evidência e verificável? (3) Alguem que não esteve na auditoria entenderia? Se a resposta for "sim" para as tres, a NC esta boa.</div>

<h3>Dicas práticas de redação</h3>
<ul>
<li>Use linguagem factual e neutra — não acuse pessoas</li>
<li>Inclua números, datas, codigos de documentos — quanto mais específico, melhor</li>
<li>Uma NC por assunto — não misture problemas diferentes</li>
<li>Cite o requisito específico (cláusula e item), não genericamente "não atende a norma"</li>
</ul>
`}, 'Formulario de registro de NC'),

  (${m5.id}, '2-5-2-classificação-ncs', 'Classificação: NC maior, NC menor e OM', '15 min', 2, ${`
<h2>Classificação: NC maior, NC menor e oportunidade de melhoria</h2>
<p>Nem todas as não conformidades tem o mesmo peso. A classificação correta e essencial para <strong>priorizar as ações corretivas</strong> e comunicar o nível de gravidade a direção. Classificar errado (NC maior como menor, ou vice-versa) compromete a credibilidade do auditor.</p>

<h3>Definições</h3>
<table>
<tr><th>Classificação</th><th>Definição</th><th>Consequencia tipica</th></tr>
<tr><td><strong>NC maior</strong></td><td>Não atendimento que afeta a capacidade do SGQ de atingir os resultados pretendidos, ou ausência/falha total de um requisito</td><td>Requer ação corretiva imediata; pode impedir certificação ou levar a suspensao</td></tr>
<tr><td><strong>NC menor</strong></td><td>Não atendimento parcial ou pontual que não compromete o SGQ como um todo</td><td>Requer ação corretiva em prazo definido; não impede certificação</td></tr>
<tr><td><strong>Oportunidade de melhoria (OM)</strong></td><td>Situação conforme que poderia ser melhorada para aumentar eficácia</td><td>Não requer ação obrigatoria; e uma recomendação</td></tr>
</table>

<h3>Criterios para classificar</h3>
<p>Use estas perguntas para decidir a classificação:</p>
<ul>
<li><strong>O requisito esta totalmente ausente?</strong> (ex: não existe processo de avaliação de fornecedores) → NC maior</li>
<li><strong>O requisito existe mas falhou sistematicamente?</strong> (ex: avaliação existe mas não foi feita nos ultimos 12 meses para nenhum fornecedor) → NC maior</li>
<li><strong>O requisito existe e funciona, mas falhou pontualmente?</strong> (ex: 2 de 15 fornecedores sem avaliação) → NC menor</li>
<li><strong>O requisito esta atendido mas poderia ser melhor?</strong> → OM</li>
<li><strong>Multiplas NCs menores no mesmo tema indicam falha sistemática?</strong> → Considerar NC maior</li>
</ul>

<div class="example"><strong>Exemplo prático na construtora:</strong></p>
<ul>
<li><strong>NC maior:</strong> A empresa não realiza auditoria interna ha 18 meses. O requisito 9.2 esta totalmente descumprido.</li>
<li><strong>NC menor:</strong> Auditoria interna e realizada regularmente, mas a auditoria de maio/2025 não cobriu o processo de compras conforme programado.</li>
<li><strong>OM:</strong> Auditorias internas são realizadas e cobrem todos os processos, mas o checklist poderia ser mais detalhado para o processo de compras, que tem historico de NCs.</li>
</ul>
</div>

<div class="callout"><strong>Regra prática:</strong> Na dúvida entre NC maior e menor, pergunte-se: "Se eu fosse o cliente desta empresa, essa falha me preocuparia seriamente?" Se sim, tende a ser maior. Se não, tende a ser menor.</div>

<h3>Acumulo de NCs menores</h3>
<p>Atenção a um padrão perigoso: varias NCs menores no mesmo tema podem indicar uma falha sistemática que justifica reclassificação como NC maior. Por exemplo:</p>
<ul>
<li>NC menor em calibração no setor A</li>
<li>NC menor em calibração no setor B</li>
<li>NC menor em calibração no setor C</li>
</ul>
<p>Tres NCs menores em calibração podem ser evidência de falha no <strong>sistema</strong> de controle de instrumentos — o que seria uma NC maior.</p>
`}, NULL),

  (${m5.id}, '2-5-3-relatório-final', 'Elaborando o relatório final de auditoria', '20 min', 3, ${`
<h2>Elaborando o relatório final de auditoria</h2>
<p>O relatório e o <strong>produto final</strong> da auditoria — o documento que registra tudo o que foi feito, encontrado e concluido. Um bom relatório e claro, completo, objetivo e util para a tomada de decisao. Um relatório ruim gera confusao, retrabalho e desconfianca no processo de auditoria.</p>

<h3>Conteúdo mínimo do relatório</h3>
<p>Segundo a ISO 19011:2018, cláusula 6.5, o relatório deve incluir:</p>

<table>
<tr><th>Seção</th><th>Conteúdo</th></tr>
<tr><td>Identificação</td><td>Número/codigo da auditoria, data, processo/área auditada</td></tr>
<tr><td>Objetivo</td><td>O que a auditoria pretendeu verificar</td></tr>
<tr><td>Escopo</td><td>Processos, locais, periodo coberto</td></tr>
<tr><td>Criterios</td><td>Normas e documentos de referência</td></tr>
<tr><td>Equipe auditora</td><td>Nomes e papeis</td></tr>
<tr><td>Cronologia</td><td>Datas e locais das atividades de auditoria</td></tr>
<tr><td>Constatações</td><td>Cada constatação com critério, evidência e classificação</td></tr>
<tr><td>Conclusão</td><td>Avaliação geral do grau de atendimento dos critérios</td></tr>
<tr><td>Pontos positivos</td><td>Boas práticas identificadas (opcional mas recomendado)</td></tr>
<tr><td>Distribuição</td><td>Quem recebe o relatório</td></tr>
</table>

<div class="callout"><strong>Boa prática:</strong> Inclua sempre uma seção de "pontos positivos". Auditorias que só apontam problemas geram desmotivação. Reconhecer o que esta funcionando bem engaja as pessoas e reforça boas práticas.</div>

<h3>Exemplo de estrutura de relatório</h3>
<div class="template-box">
<p><strong>RELATORIO DE AUDITORIA INTERNA N. AI-2025-003</strong></p>
<p><strong>Processo:</strong> Compras e recebimento | <strong>Data:</strong> 15/07/2025</p>
<p><strong>Auditor-lider:</strong> Maria Silva | <strong>Auditor:</strong> Joao Pereira</p>
<p><strong>Escopo:</strong> Processo de compras na unidade Caxias do Sul, periodo jan-jun 2025</p>
<p><strong>Criterios:</strong> ISO 9001:2015 cl. 8.4, PO-010 Compras v.3, PO-012 Recebimento v.2</p>
<p><strong>Conclusão geral:</strong> O processo de compras atende parcialmente aos critérios. 1 NC menor e 2 OMs foram identificadas. O processo de recebimento esta conforme.</p>
<p><strong>Pontos positivos:</strong> Sistema ERP bem configurado para rastreabilidade de pedidos; equipe de recebimento demonstra conhecimento dos critérios de inspeção.</p>
<p><strong>Constatações:</strong> [listagem detalhada de cada NC e OM]</p>
<p><strong>Prazo para ações corretivas:</strong> 30 dias (ate 14/08/2025)</p>
</div>

<h3>Prazo para emissao do relatório</h3>
<p>O relatório deve ser emitido o mais rapido possível após a auditoria — idealmente em ate <strong>5 dias uteis</strong>. Quanto mais tempo passa, mais detalhes se perdem e menor e o senso de urgencia para as ações corretivas.</p>

<h3>Distribuição</h3>
<p>O relatório deve ser distribuido para:</p>
<ul>
<li>Responsavel pela área auditada</li>
<li>Gestor do programa de auditoria</li>
<li>Alta direção (ou representante designado)</li>
<li>Coordenador de qualidade</li>
</ul>

<h3>Erros comuns no relatório</h3>
<ul>
<li><strong>Relatorio genérico:</strong> "O processo esta bom com algumas oportunidades de melhoria" — não diz nada</li>
<li><strong>Excesso de texto:</strong> Relatorio de 30 páginas que ninguem le. Seja conciso e objetivo.</li>
<li><strong>Falta de evidências:</strong> NC sem mencionar registros, datas, números específicos</li>
<li><strong>Conclusão desalinhada:</strong> 3 NCs maiores e conclusão "o SGQ esta adequado" — incoerente</li>
</ul>
`}, 'Template de relatório de auditoria'),

  (${m5.id}, '2-5-4-acompanhamento-ações', 'Acompanhamento de ações corretivas', '15 min', 4, ${`
<h2>Acompanhamento de ações corretivas</h2>
<p>A auditoria não termina no relatório. O <strong>acompanhamento (follow-up)</strong> das ações corretivas e o que transforma constatações em melhorias reais. Sem acompanhamento, a auditoria e apenas um exercício burocrático que identifica problemas mas não os resolve.</p>

<h3>Fluxo de tratamento de NCs</h3>
<ol>
<li><strong>Correção (ação imediata):</strong> O auditado trata o efeito imediato (ex: retirar de uso o instrumento não calibrado)</li>
<li><strong>Análise de causa-raiz:</strong> Investigar POR QUE a NC ocorreu (não apenas o sintoma)</li>
<li><strong>Ação corretiva:</strong> Implementar ações para eliminar a causa raiz e prevenir recorrencia</li>
<li><strong>Verificação de eficácia:</strong> O auditor (ou gestor do programa) verifica se a ação funcionou</li>
<li><strong>Fechamento:</strong> Se eficaz, a NC e formalmente encerrada</li>
</ol>

<div class="callout"><strong>Diferença crítica:</strong> Correção = tratar o sintoma ("calibrar o paquimetro"). Ação corretiva = eliminar a causa ("revisar o sistema de alerta de vencimento no plano de calibração para que não passe despercebido novamente").</div>

<h3>Ferramentas para análise de causa-raiz</h3>
<table>
<tr><th>Ferramenta</th><th>Descrição</th><th>Quando usar</th></tr>
<tr><td><strong>5 Por ques</strong></td><td>Perguntar "por que?" repetidamente ate chegar a causa raiz</td><td>Problemas simples a moderados</td></tr>
<tr><td><strong>Ishikawa (espinha de peixe)</strong></td><td>Categorizar causas potenciais em 6M (Máquina, Método, Material, Mao de obra, Meio ambiente, Medição)</td><td>Problemas com múltiplas causas possíveis</td></tr>
<tr><td><strong>Arvore de falhas</strong></td><td>Diagrama logico de eventos que levam a falha</td><td>Problemas complexos e críticos</td></tr>
</table>

<div class="example"><strong>Exemplo de 5 Por ques — paquimetro não calibrado:</strong>
<ol>
<li>Por que o paquimetro estava vencido? Porque ninguem percebeu.</li>
<li>Por que ninguem percebeu? Porque não ha alerta automatico de vencimento.</li>
<li>Por que não ha alerta? Porque o controle e feito em planilha manual que ninguem consulta.</li>
<li>Por que ninguem consulta? Porque não ha responsável definido para essa tarefa.</li>
<li>Por que não ha responsável? Porque quando o antigo responsável saiu, a tarefa não foi reatribuida.</li>
</ol>
<p><strong>Causa raiz:</strong> Falta de definição de responsabilidade e sistema de alerta para controle de calibração.</p>
<p><strong>Ação corretiva:</strong> (1) Designar responsável pelo controle de calibração. (2) Migrar controle para sistema com alerta automatico de vencimento. (3) Incluir verificação mensal na rotina do responsável.</p>
</div>

<h3>Verificação de eficácia</h3>
<p>A verificação deve responder: "A ação implementada eliminou a causa e a NC não reincidiu?" Métodos:</p>
<ul>
<li>Verificação documental (evidências de implementação)</li>
<li>Verificação em campo (auditoria de follow-up)</li>
<li>Monitoramento de indicadores (a tendencia melhorou?)</li>
<li>Amostragem após implementação (os proximos registros estao conformes?)</li>
</ul>

<h3>Prazos típicos</h3>
<table>
<tr><th>Tipo de NC</th><th>Prazo para ação corretiva</th><th>Prazo para verificação de eficácia</th></tr>
<tr><td>NC maior</td><td>30 a 60 dias</td><td>60 a 90 dias após implementação</td></tr>
<tr><td>NC menor</td><td>30 a 90 dias</td><td>Na proxima auditoria do processo</td></tr>
</table>
`}, 'Formulario de ação corretiva com 5 Por ques')`;

  // ── Module 6: Habilidades do Auditor ──
  const [m6] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Habilidades do Auditor', 'Comunicação, gestão de conflitos, pensamento baseado em risco e ética', 6) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m6.id}, '2-6-1-comunicação-postura', 'Comunicação e postura profissional', '15 min', 1, ${`
<h2>Comunicação e postura profissional</h2>
<p>A competência técnica e fundamental, mas sem habilidade de comunicação, o auditor não consegue extrair informações, transmitir constatações e manter um clima construtivo. Muitas auditorias fracassam não por falta de conhecimento técnico, mas por <strong>falha de comunicação</strong>.</p>

<h3>Comunicação verbal</h3>
<p>Diretrizes para a fala do auditor durante a auditoria:</p>
<ul>
<li><strong>Linguagem simples:</strong> Evite jargao excessivo. Em vez de "informe sobre o controle de provedores externos conforme 8.4.1", diga "me conte como vocês escolhem e avaliam os fornecedores".</li>
<li><strong>Tom neutro:</strong> Nem arrogante nem intimidado. Profissional e respeitoso.</li>
<li><strong>Escuta ativa:</strong> Ouca mais do que fale. A proporção ideal e 80% ouvindo, 20% falando.</li>
<li><strong>Reformule:</strong> "Se eu entendi corretamente, você verifica a temperatura a cada hora. E isso?" — confirma entendimento e evita mal-entendidos.</li>
<li><strong>Agradeca:</strong> "Obrigado por explicar. Posso ver os registros?" — mantem o clima colaborativo.</li>
</ul>

<h3>Comunicação não verbal</h3>
<table>
<tr><th>Postura</th><th>Impacto</th></tr>
<tr><td>Contato visual moderado</td><td>Transmite interesse e atenção</td></tr>
<tr><td>Bracos cruzados</td><td>Pode transmitir julgamento ou distanciamento (evite)</td></tr>
<tr><td>Anotando enquanto a pessoa fala</td><td>Mostra que você valoriza o que esta sendo dito</td></tr>
<tr><td>Olhando o relogio frequentemente</td><td>Transmite pressa e desinteresse (evite)</td></tr>
<tr><td>Sorriso leve e acenos</td><td>Encoraja o auditado a continuar explicando</td></tr>
</table>

<div class="callout"><strong>Regra prática:</strong> Trate cada auditado como você gostaria de ser tratado se estivesse sendo auditado. Respeito gera colaboração. Arrogancia gera resistencia.</div>

<h3>Postura profissional no chao de fábrica</h3>
<ul>
<li>Use os EPIs exigidos — sem exceção. Se você exige que outros sigam as regras, você segue primeiro.</li>
<li>Não toque em equipamentos, produtos ou instrumentos sem autorização</li>
<li>Não interrompa atividades em andamento — espere um momento adequado</li>
<li>Cumprimente as pessoas e se apresente antes de fazer perguntas</li>
<li>Não faca "emboscada" — não faca perguntas tipo "pegadinha"</li>
</ul>

<div class="example"><strong>Situação na metalúrgica:</strong> O auditor chega na celula de usinagem CNC. Em vez de ir direto ao operador com o checklist na mao, ele se apresenta: "Oi, meu nome e Marcos, sou do time de qualidade. Você tem uns minutos? Gostaria de entender como funciona o controle de processo aqui." Essa abordagem abre portas.</div>

<h3>O que NUNCA fazer</h3>
<ul>
<li>Criticar pessoas nominalmente — a NC e do processo, não da pessoa</li>
<li>Fazer comparações entre setores ("La no setor X fazem certo, por que vocês não?")</li>
<li>Dar opiniao pessoal sobre como deveria ser feito (a menos que peçam)</li>
<li>Discutir constatações com outros auditados (confidencialidade)</li>
</ul>
`}, NULL),

  (${m6.id}, '2-6-2-conflitos-resistencias', 'Gerenciando conflitos e resistencias', '15 min', 2, ${`
<h2>Gerenciando conflitos e resistencias</h2>
<p>Resistencia a auditoria e natural. As pessoas se sentem avaliadas, expostas e potencialmente ameacadas. O auditor interno tem o desafio adicional de auditar <strong>colegas de trabalho</strong> — pessoas com quem convive no dia a dia. Saber gerenciar conflitos e resistencias e uma competência essencial.</p>

<h3>Tipos comuns de resistencia</h3>
<table>
<tr><th>Comportamento</th><th>Exemplo</th><th>Como lidar</th></tr>
<tr><td><strong>Hostil/agressivo</strong></td><td>"Você não entende nada do meu trabalho"</td><td>Mantenha a calma. Reconheca a expertise do auditado. Redirecione para evidências.</td></tr>
<tr><td><strong>Evasivo</strong></td><td>Respostas vagas, muda de assunto</td><td>Reformule a pergunta de forma mais específica. Peca registros concretos.</td></tr>
<tr><td><strong>Excessivamente cooperativo</strong></td><td>Fala muito, mostra tudo menos o que importa</td><td>Redirecione educadamente: "Obrigado, agora vamos focar em..."</td></tr>
<tr><td><strong>Ausente/indisponível</strong></td><td>"Hoje não posso, estou muito ocupado"</td><td>Comunique ao gestor do programa. Se necessário, reagende com suporte da direção.</td></tr>
<tr><td><strong>Intimidado/nervoso</strong></td><td>Pessoa travada, respostas monossilabicas</td><td>Tranquilize. Explique que não eavaliação pessoal. Comece com perguntas simples.</td></tr>
</table>

<h3>Tecnicas de desescalada</h3>
<ol>
<li><strong>Reconheça o sentimento:</strong> "Entendo que e desconfortável ser auditado. Estou aqui para ajudar o processo, não para julgar pessoas."</li>
<li><strong>Reformule:</strong> Em vez de "você não fez o registro", diga "notei que o registro deste dia esta em branco. Pode me explicar o que aconteceu?"</li>
<li><strong>Foque em fatos:</strong> Afaste-se de opiniões e volte para evidências documentais.</li>
<li><strong>De tempo:</strong> Se o clima esquentar, sugira uma pausa. "Vamos fazer um intervalo de 10 minutos."</li>
<li><strong>Envolva o guia:</strong> Se o auditado designou um guia/acompanhante, ele pode ajudar a mediar.</li>
</ol>

<div class="callout"><strong>Limite:</strong> Se a resistencia impedir a auditoria (recusa em mostrar registros, obstrução ativa), registre no relatório e comunique ao gestor do programa e a direção. Isso pode ser uma NC em si mesma (obstrução ao processo de auditoria).</div>

<div class="example"><strong>Caso real numa indústria alimentícia:</strong> O supervisor de produção ficou visivelmente irritado quando o auditor pediu para ver os registros de temperatura do pasteurizador. Disse: "Todo ano a mesma coisa, vocês só sabem cobrar papel!" O auditor respondeu calmamente: "Entendo a frustração. Os registros são importantes porque protegem o produto e a segurança do consumidor. Se houver uma forma melhor de manter esses registros que facilite o trabalho de vocês, podemos sugerir como oportunidade de melhoria." O supervisor mostrou os registros e, ao final, agradeceu pela sugestão de digitalização dos formulários.</div>

<h3>Prevenção e a melhor estrategia</h3>
<ul>
<li>Comunique a agenda com antecedencia — surpresas geram resistencia</li>
<li>Explique na reunião de abertura que o foco e o processo, não a pessoa</li>
<li>Mantenha postura neutra e profissional durante toda a auditoria</li>
<li>Reconheca boas práticas — não só aponte problemas</li>
<li>Se possível, alterne auditores (evitar "perseguição" percebida)</li>
</ul>
`}, NULL),

  (${m6.id}, '2-6-3-pensamento-risco', 'Pensamento baseado em risco na auditoria', '15 min', 3, ${`
<h2>Pensamento baseado em risco na auditoria</h2>
<p>A versão 2018 da ISO 19011 incluiu a <strong>abordagem baseada em risco</strong> como setimo princípio. Na prática, isso significa que o auditor deve usar o pensamento baseado em risco para <strong>planejar, conduzir e reportar</strong> a auditoria, priorizando o que tem maior impacto potencial.</p>

<h3>Onde o risco entra na auditoria</h3>
<table>
<tr><th>Etapa</th><th>Aplicação do pensamento baseado em risco</th></tr>
<tr><td><strong>Programa</strong></td><td>Auditar com maior frequência os processos de maior risco</td></tr>
<tr><td><strong>Planejamento</strong></td><td>Alocar mais tempo e auditores mais experientes para áreas críticas</td></tr>
<tr><td><strong>Checklist</strong></td><td>Incluir mais perguntas para controles de alto risco</td></tr>
<tr><td><strong>Amostragem</strong></td><td>Amostrar mais itens em áreas de maior risco</td></tr>
<tr><td><strong>Avaliação</strong></td><td>Considerar o impacto potencial ao classificar NCs (maior vs. menor)</td></tr>
<tr><td><strong>Relatorio</strong></td><td>Destacar riscos identificados que não são cobertos por controles atuais</td></tr>
</table>

<h3>Identificando riscos no contexto da auditoria</h3>
<p>Perguntas que o auditor deve fazer ao planejar:</p>
<ul>
<li>Quais processos afetam diretamente a conformidade do produto ou segurança do cliente?</li>
<li>Onde houve NCs recorrentes em auditorias anteriores?</li>
<li>Quais processos passaram por mudancas significativas recentemente?</li>
<li>Onde as reclamações de clientes se concentram?</li>
<li>Quais processos dependem fortemente de competência individual (menos padronizados)?</li>
<li>Onde os controles são mais fracos ou menos maduros?</li>
</ul>

<div class="example"><strong>Na metalúrgica:</strong> O programa de auditoria identifica que o processo de tratamento termico e de alto risco: (a) e um processo especial (resultado só verificável destrutivamente); (b) houve 2 NCs em auditorias anteriores; (c) opera no turno noturno com supervisao reduzida. Resultado: o tratamento termico recebe 2 auditorias por ano (ao inves de 1) com auditor que tem experiência em metalurgia.</div>

<h3>Riscos DO programa de auditoria</h3>
<p>Alem de considerar riscos NOS processos auditados, o gestor deve considerar riscos no próprio programa:</p>
<ul>
<li><strong>Risco de não executar:</strong> Auditores sobrecarregados, ausências, falta de recursos</li>
<li><strong>Risco de baixa qualidade:</strong> Auditores não qualificados, checklists genericos</li>
<li><strong>Risco de parcialidade:</strong> Auditor auditando área com conflito de interesse</li>
<li><strong>Risco de irrelevancia:</strong> Programa que não cobre processos críticos ou mudancas recentes</li>
</ul>

<div class="callout"><strong>Aplicação prática:</strong> Não e preciso uma análise de risco formal (matriz probabilidade x impacto) para cada auditoria interna. O importante e que o auditor <strong>pense</strong> sobre o que e mais crítico e direcione seu tempo e atenção proporcionalmente. Isso ja atende ao princípio.</div>
`}, NULL),

  (${m6.id}, '2-6-4-ética-confidencialidade', 'Ética e confidencialidade', '15 min', 4, ${`
<h2>Ética e confidencialidade</h2>
<p>A auditoria coloca o auditor numa posição de <strong>poder e confiança</strong>. Ele tem acesso a informações sensíveis, avalia o trabalho de colegas e gera constatações que podem ter consequências significativas. Sem ética e confidencialidade, esse poder se corrompe e o processo perde legitimidade.</p>

<h3>Principios eticos do auditor</h3>
<ul>
<li><strong>Veracidade:</strong> Relatar exatamente o que foi encontrado — sem exagerar, minimizar ou omitir</li>
<li><strong>Imparcialidade:</strong> Não favorecer nem prejudicar nenhum auditado por relações pessoais</li>
<li><strong>Objetividade:</strong> Basear constatações em evidências, não em opiniões ou preconceitos</li>
<li><strong>Responsabilidade:</strong> Assumir a responsabilidade pela qualidade e precisão do trabalho</li>
<li><strong>Respeito:</strong> Tratar todos com dignidade, independente de cargo ou função</li>
</ul>

<h3>Dilemas eticos comuns</h3>
<table>
<tr><th>Dilema</th><th>Resposta ética</th></tr>
<tr><td>Seu supervisor pede para "pegar leve" com certo setor</td><td>Mantenha a imparcialidade. Audite conforme os critérios, não conforme interesses politicos.</td></tr>
<tr><td>Você descobre que um amigo proximo não segue o procedimento</td><td>Registre a constatação como faria com qualquer outro auditado. Se ha conflito de interesse, solicite substituição.</td></tr>
<tr><td>O auditado oferece um "presente" (almoço especial, brinde)</td><td>Recuse cortesmente. Aceitar pode comprometer sua independencia percebida.</td></tr>
<tr><td>Você encontra evidência de fraude (não apenas NC)</td><td>Registre e comunique ao gestor do programa e a direção. Não tente investigar alem do escopo da auditoria.</td></tr>
<tr><td>A direção quer que você "gere NCs" para justificar demissao de alguem</td><td>Recuse. Auditoria não eferramenta disciplinar. NCs são geradas por evidências, não por agenda política.</td></tr>
</table>

<div class="callout"><strong>Teste de ética:</strong> Antes de agir, pergunte-se: "Se esta decisao fosse publicada no mural da empresa, eu me sentiria confortável?" Se a resposta for não, repense.</div>

<h3>Confidencialidade na prática</h3>
<p>O auditor interno tem obrigação de manter sigilo sobre:</p>
<ul>
<li>Informações de processos e tecnologia da empresa</li>
<li>Dados de fornecedores, precos, contratos</li>
<li>Problemas identificados em setores específicos (não comentar com outros setores)</li>
<li>Informações pessoais dos auditados</li>
<li>Constatações antes de serem formalmente comunicadas</li>
</ul>

<div class="example"><strong>Situação na cooperativa agrícola:</strong> Durante a auditoria do processo de compras de insumos, o auditor descobre que um fornecedor de sementes prática precos 40% acima do mercado e não ha cotação registrada. Ele registra a NC (falta de cotação conforme procedimento). Mas não comenta com colegas na hora do almoco que "o setor de compras esta pagando 40% a mais" — isso seria quebra de confidencialidade e poderia gerar fofocas e conflitos.</div>

<h3>Conflito de interesse</h3>
<p>O auditor deve <strong>declarar</strong> qualquer situação que possa comprometer sua imparcialidade:</p>
<ul>
<li>Ter trabalhado recentemente na área auditada</li>
<li>Ter parentesco ou relação pessoal proxima com o auditado</li>
<li>Ter interesse direto no resultado (ex: meta atrelada ao desempenho da área)</li>
<li>Ter participado da implementação dos controles que esta auditando</li>
</ul>
<p>Em caso de conflito, o auditor deve ser substituido ou, no mínimo, a situação deve ser documentada e aprovada pelo gestor do programa.</p>
`}, NULL)`;

  // ── Module 7: Prática e Certificação ──
  const [m7] = await sql`INSERT INTO ead_modules (course_id, titulo, descricao, ordem) VALUES (${courseId}, 'Prática e Certificação', 'Estudos de caso completos, erros comuns e preparação para avaliação final', 7) RETURNING id`;

  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo, entregavel_titulo) VALUES
  (${m7.id}, '2-7-1-caso-metalúrgica', 'Estudo de caso: auditoria completa numa metalúrgica', '25 min', 1, ${`
<h2>Estudo de caso: auditoria interna completa numa metalúrgica</h2>
<p>Vamos acompanhar uma auditoria interna do inicio ao fim na <strong>MetalSul Usinagem Ltda</strong>, uma metalúrgica com 85 funcionarios certificada ISO 9001:2015, localizada em Caxias do Sul/RS. O processo auditado sera <strong>Produção (usinagem CNC)</strong>.</p>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Fabricação de peças usinadas de precisão para indústria automotiva e agrícola</li>
<li><strong>Processo auditado:</strong> Usinagem CNC (tornos e centros de usinagem)</li>
<li><strong>Motivo da prioridade:</strong> 3 reclamações de cliente nos ultimos 4 meses por variação dimensional; 1 NC na auditoria anterior (calibração)</li>
<li><strong>Auditor-lider:</strong> Ana (coord. de qualidade — 5 anos de experiência em auditoria)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 (Produção), 7.1.5 (Monitoramento e medição), PO-020 (Usinagem CNC)</li>
</ul>

<h3>Fase 1: Preparação</h3>
<p>Ana revisou antes da auditoria:</p>
<ul>
<li>PO-020 Usinagem CNC v.4 e IT-030 Setup de máquina</li>
<li>Relatorio da auditoria anterior (NC de calibração — ação corretiva implementada)</li>
<li>3 RACs (Relatorios de Ação Corretiva) das reclamações de clientes</li>
<li>Indicadores: indice de refugo (meta 2%, real 3,8% nos ultimos 3 meses)</li>
<li>Plano de calibração PC-2025</li>
</ul>

<div class="callout"><strong>Ponto de atenção de Ana:</strong> O indice de refugo acima da meta e as reclamações por variação dimensional sugerem que ha um problema no controle de processo ou na medição. Isso vai guiar suas perguntas.</div>

<h3>Fase 2: Execução (principais entrevistas e verificações)</h3>
<p><strong>Entrevista com o supervisor de produção:</strong></p>
<ul>
<li>Ana pergunta como e feito o setup das máquinas CNC. O supervisor explica o procedimento.</li>
<li>Ana pede para ver os registros de setup dos ultimos 3 meses. Nota que 4 registros não tem a assinatura do operador.</li>
<li>Ana pergunta sobre as reclamações de clientes. O supervisor diz que "ja resolvemos trocando a ferramenta".</li>
</ul>

<p><strong>Observação no chão de fábrica:</strong></p>
<ul>
<li>Ana observa um operador fazendo inspeção dimensional com paquimetro. O operador confere apenas 1 peca a cada 50. A IT-030 específica 1 a cada 20.</li>
<li>Ana verifica a etiqueta de calibração do paquimetro: dentro da validade.</li>
</ul>

<p><strong>Análise de registros:</strong></p>
<ul>
<li>Plano de calibração: os 3 micrometros do setor estao em dia. OK.</li>
<li>RACs das reclamações: 2 das 3 não tem análise de causa-raiz documentada — apenas "correção: trocar ferramenta".</li>
</ul>

<h3>Fase 3: Constatações</h3>
<div class="template-box">
<p><strong>NC #1 (menor):</strong> 4 de 15 registros de setup amostrados (RF-080) não possuem assinatura do operador conforme exigido pelo PO-020 item 6.2.</p>
<p><strong>NC #2 (menor):</strong> Operador realizando inspeção dimensional a cada 50 pecas; IT-030 item 4.1 determina frequência de 1:20.</p>
<p><strong>NC #3 (menor):</strong> RACs 2025-008 e 2025-011 (reclamações de clientes) não possuem análise de causa-raiz documentada conforme PO-050 Ação Corretiva item 5.3. Apenas correção foi registrada.</p>
<p><strong>OM #1:</strong> Considerar incluir carta de controle (CEP) para cotas críticas, dado o historico de reclamações por variação dimensional.</p>
</div>

<h3>Fase 4: Encerramento e relatório</h3>
<p>Ana apresenta as constatações na reunião de encerramento. O supervisor concorda com as NCs e se compromete a tratar em 30 dias. Ana emite o relatório em 3 dias uteis.</p>
`}, NULL),

  (${m7.id}, '2-7-2-caso-alimenticia', 'Estudo de caso: auditoria numa indústria alimentícia', '25 min', 2, ${`
<h2>Estudo de caso: auditoria interna numa indústria alimentícia</h2>
<p>Acompanhe a auditoria interna na <strong>CoopLat Laticinios</strong>, uma cooperativa de laticinios com 120 colaboradores no interior do Parana, certificada ISO 9001:2015 e com APPCC implementado. O processo auditado sera <strong>Pasteurização e envase</strong>.</p>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Produção de leite pasteurizado, iogurte e queijo mussarela</li>
<li><strong>Processo auditado:</strong> Pasteurização e envase de leite</li>
<li><strong>Motivo da prioridade:</strong> Novo equipamento de envase instalado ha 3 meses; mudanca de turno (de 2 para 3 turnos)</li>
<li><strong>Auditor-lider:</strong> Roberto (analista de qualidade — formação em auditoria ISO 19011)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 e 8.6, PO-035 (Pasteurização), IT-040 (Envase), IN 76 MAPA (instrução normativa)</li>
</ul>

<h3>Fase 1: Preparação</h3>
<p>Roberto identificou pontos de atenção na análise documental:</p>
<ul>
<li>O PO-035 foi atualizado para incluir o novo equipamento de envase — verificar se os operadores conhecem a nova versão</li>
<li>3o turno opera com equipe menos experiente — verificar treinamento e supervisao</li>
<li>Registros de temperatura do pasteurizador são críticos (72C por 15 segundos para leite tipo A)</li>
<li>Indicador de devolução de produto por validade/qualidade: meta 0,5%, real 0,3% — dentro da meta</li>
</ul>

<h3>Fase 2: Execução</h3>
<p><strong>Entrevista com operador do 3o turno (23h-07h):</strong></p>
<ul>
<li>Roberto pergunta: "Qual procedimento você segue para operar o pasteurizador?"</li>
<li>Operador descreve o processo corretamente mas não menciona o novo registro de controle do envase (adicionado na revisao 4 do PO-035)</li>
<li>Roberto pede para ver a pasta de procedimentos no setor: a versão disponível e a revisao 3 (desatualizada)</li>
</ul>

<p><strong>Verificação de registros de temperatura:</strong></p>
<ul>
<li>Roberto amostra 15 dias de registros. Em 14, tudo conforme.</li>
<li>No dia 12/06, o registro mostra temperatura de 71,2C as 03:15h — abaixo do mínimo de 72C</li>
<li>Não ha registro de desvio ou tratamento para esse lote</li>
</ul>

<p><strong>Observação do envase:</strong></p>
<ul>
<li>Operação do novo equipamento: operador segue corretamente as etapas</li>
<li>Limpeza CIP (Clean in Place): registros preenchidos conforme IT-041</li>
</ul>

<h3>Fase 3: Constatações</h3>
<div class="template-box">
<p><strong>NC #1 (maior):</strong> Registro de temperatura do pasteurizador de 12/06/2025 as 03:15h indica 71,2C (mínimo 72C conforme PO-035 item 4.2 e IN 76 MAPA). Não ha registro de tratamento do desvio nem de disposição do lote. Falha no controle de PCC (Ponto Crítico de Controle) que pode afetar a segurança do produto.</p>
<p><strong>NC #2 (menor):</strong> A versão do PO-035 disponível no setor de pasteurização/envase (3o turno) e a revisao 3 (jan/2025). A versão vigente e a revisao 4 (abr/2025), que inclui controles do novo equipamento de envase. Descumprimento da cláusula 7.5.3 — controle de informação documentada.</p>
<p><strong>OM #1:</strong> Implementar alarme automatico no sistema SCADA quando a temperatura do pasteurizador ficar abaixo de 72C, para que o desvio seja detectado em tempo real independente da atenção do operador.</p>
</div>

<div class="callout"><strong>Por que a NC #1 e maior:</strong> A pasteurização é um PCC — um ponto onde a falha pode causar dano a saúde do consumidor. A ausência de tratamento do desvio significa que um lote potencialmente inseguro pode ter sido liberado. Isso compromete a capacidade do SGQ de garantir segurança do produto — critério clássico de NC maior.</div>

<h3>Fase 4: Ações pos-auditoria</h3>
<p>O gestor de qualidade da CoopLat agiu imediatamente:</p>
<ul>
<li><strong>Correção (NC#1):</strong> Rastreou o lote do dia 12/06 — já havia sido distribuído. Acionou protocolo de recall preventivo.</li>
<li><strong>Ação corretiva (NC#1):</strong> Instalação de alarme automatico no SCADA + retreinamento de operadores do 3o turno sobre procedimento de desvio.</li>
<li><strong>Ação corretiva (NC#2):</strong> Revisao do processo de distribuição de documentos controlados para todos os turnos, com verificação semanal.</li>
</ul>
`}, NULL),

  (${m7.id}, '2-7-3-erros-comuns', 'Erros comuns do auditor iniciante', '15 min', 3, ${`
<h2>Erros comuns do auditor iniciante</h2>
<p>Todo auditor começa como iniciante, e errar faz parte do aprendizado. Mas conhecer os erros mais frequentes ajuda você a evita-los desde o inicio e a se desenvolver mais rapido. Estes são os erros que vemos com mais frequência em auditores internos de primeira viagem.</p>

<h3>Erros de planejamento</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Não estudar a documentação antes</td><td>Perguntas genericas, perda de tempo, constatações superficiais</td><td>Reserve pelo menos 2h de preparação para cada dia de auditoria</td></tr>
<tr><td>Checklist copiado da internet</td><td>Perguntas não aplicáveis ao processo real da empresa</td><td>Construa o checklist baseado nos procedimentos reais da organização + norma</td></tr>
<tr><td>Agenda irrealista</td><td>Auditoria apressada, constatações incompletas</td><td>Planeje com margem: entrevistas demoram mais do que parece</td></tr>
</table>

<h3>Erros de execução</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Fazer perguntas de sim/não</td><td>Respostas que não revelam a prática real</td><td>Use perguntas abertas: "Como...", "Mostre-me...", "Explique..."</td></tr>
<tr><td>Seguir rigidamente o checklist</td><td>Perder trilhas importantes que surgem nas respostas</td><td>Use o checklist como guia, não como roteiro fixo. Siga as trilhas.</td></tr>
<tr><td>Não anotar evidências específicas</td><td>Constatações vagas que não resistem a questionamento</td><td>Anote números de documentos, datas, nomes, lotes</td></tr>
<tr><td>Auditar apenas o "papel"</td><td>Verificar só documentos sem ver o processo real</td><td>Triangule: documento + entrevista + observação</td></tr>
<tr><td>Fazer "emboscadas"</td><td>Auditados ficam na defensiva, clima hostil</td><td>Seja transparente sobre o que esta verificando</td></tr>
</table>

<h3>Erros de comunicação</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>Tom de "fiscal" ou "policia"</td><td>Resistencia, informações escondidas, clima negativo</td><td>Adote postura colaborativa e respeitosa</td></tr>
<tr><td>Discutir constatações no corredor</td><td>Fofoca, quebra de confidencialidade, conflitos</td><td>Comunique constatações apenas nos canais formais</td></tr>
<tr><td>Guardar "surpresas" para o encerramento</td><td>Auditado se sente traido, gera conflito</td><td>Comunique constatações ao auditado no momento em que são identificadas</td></tr>
</table>

<h3>Erros de relatório</h3>
<table>
<tr><th>Erro</th><th>Consequencia</th><th>Como evitar</th></tr>
<tr><td>NC sem critério claro</td><td>Auditado questiona a validade, NC pode ser derrubada</td><td>Sempre cite o requisito específico (cláusula + procedimento)</td></tr>
<tr><td>NC baseada em opiniao pessoal</td><td>Falta de objetividade, perda de credibilidade</td><td>Baseie-se exclusivamente em evidências vs. critérios</td></tr>
<tr><td>Relatorio demorado (>2 semanas)</td><td>Perda de senso de urgencia, detalhes esquecidos</td><td>Emita em ate 5 dias uteis</td></tr>
<tr><td>Não registrar pontos positivos</td><td>Auditoria vista como puramente negativa</td><td>Inclua pelo menos 2-3 pontos positivos no relatório</td></tr>
</table>

<div class="callout"><strong>Conselho para o auditor iniciante:</strong> Nas primeiras auditorias, va como observador ou membro da equipe (não como lider). Aprenda com auditores mais experientes. Anote o que funciona e o que não funciona. E lembre-se: confiança vem com prática.</div>

<div class="example"><strong>Erro clássico e como corrigir:</strong> O auditor iniciante encontra um formulário preenchido a lapis (em vez de caneta) e abre NC por "formulario preenchido a lapis". Mas não existe requisito (nem na norma, nem no procedimento da empresa) que proiba lapis. Isso e opiniao pessoal, nãoNC. Se o procedimento exigir caneta, ai sim — mas cite o procedimento.</div>
`}, NULL),

  (${m7.id}, '2-7-4-preparação-quiz', 'Preparação para o quiz final e proximos passos', '15 min', 4, ${`
<h2>Preparação para o quiz final e proximos passos</h2>
<p>Você chegou ao final do curso. Antes do quiz final, vamos consolidar os temas-chave e orientar seus proximos passos como auditor interno.</p>

<h3>Revisao dos temas essenciais</h3>
<table>
<tr><th>Modulo</th><th>Tema central</th><th>Conceito-chave</th></tr>
<tr><td>1</td><td>Fundamentos</td><td>Auditoria e processo sistemático baseado em evidências, não inspeção nem fiscalização</td></tr>
<tr><td>2</td><td>Programa</td><td>Programa = macro (anual). Plano = micro (1 auditoria). Gestor do programa coordena tudo.</td></tr>
<tr><td>3</td><td>Planejamento</td><td>Preparação e 50% do sucesso. Checklist bem feito + análise documental = auditoria eficaz.</td></tr>
<tr><td>4</td><td>Execução</td><td>Triangulação (entrevista + observação + registro). Perguntas abertas. Comunicação constante.</td></tr>
<tr><td>5</td><td>Relatorio</td><td>NC = critério + evidência + declaração. Classificação: maior, menor, OM. Follow-up e essencial.</td></tr>
<tr><td>6</td><td>Habilidades</td><td>Comunicação, ética, confidencialidade e pensamento em risco são tao importantes quanto técnica.</td></tr>
<tr><td>7</td><td>Prática</td><td>Cada auditoria e única. A prática e o melhor professor.</td></tr>
</table>

<h3>Dicas para o quiz final</h3>
<ul>
<li>O quiz tem <strong>30 questões</strong> de múltipla escolha</li>
<li>Cobre todos os 7 modulos proporcionalmente</li>
<li>Foque nos conceitos, não em decorar números de cláusulas</li>
<li>Leia cada pergunta com atenção — muitas alternativas são parecidas</li>
<li>Quando em dúvida, pense no que a ISO 19011 e os princípios de auditoria recomendam</li>
</ul>

<h3>Checklist de competências adquiridas</h3>
<div class="template-box">
<p>Apos este curso, você deve ser capaz de:</p>
<ul>
<li>Explicar a diferença entre auditoria de 1a, 2a e 3a parte</li>
<li>Listar e aplicar os 7 princípios da auditoria</li>
<li>Elaborar um programa anual de auditoria interna</li>
<li>Definir escopo, critérios e plano para uma auditoria individual</li>
<li>Construir checklists eficazes baseados em norma e procedimentos</li>
<li>Conduzir reuniões de abertura e encerramento</li>
<li>Aplicar técnicas de entrevista e coleta de evidências</li>
<li>Redigir não conformidades com critério, evidência e declaração</li>
<li>Classificar NCs (maior, menor) e OMs</li>
<li>Elaborar relatório de auditoria completo</li>
<li>Acompanhar ações corretivas e verificar eficácia</li>
<li>Gerenciar conflitos e resistencias durante a auditoria</li>
</ul>
</div>

<h3>Proximos passos</h3>
<ol>
<li><strong>Faca o quiz final</strong> e obtenha seu certificado de conclusão</li>
<li><strong>Participe como observador</strong> em uma auditoria interna real na sua organização</li>
<li><strong>Conduza sua primeira auditoria</strong> acompanhado de um auditor mais experiente</li>
<li><strong>Pratique a elaboração de checklists</strong> para diferentes processos da sua empresa</li>
<li><strong>Busque reciclagem</strong> anualmente — participe de treinamentos, leia artigos, troque experiências</li>
</ol>

<div class="callout"><strong>Lembre-se:</strong> O certificado deste curso atesta sua formação teorica. A competência real vem com a <strong>prática</strong>. Comece a auditar o mais rapido possível, mesmo que em escopo pequeno. Cada auditoria ensinara mais do que qualquer teoria.</div>
`}, 'Checklist de competências do auditor interno')`;

  // ══════════════════════════════════════════════
  //  QUIZZES — Module quizzes (5 questions each)
  // ══════════════════════════════════════════════

  // Module 1 quiz
  const m1q = [
    ['Qual tipo de auditoria e conduzida pela própria organização para verificar seu SGQ?', ['1a parte (interna)','2a parte (de fornecedor)','3a parte (de certificação)','Auditoria governamental'], 0, 'A auditoria de 1a parte (interna) e conduzida pela própria organização.'],
    ['Quantos princípios de auditoria a ISO 19011:2018 estabelece?', ['5','6','7','8'], 2, 'A ISO 19011:2018 estabelece 7 princípios de auditoria, incluindo a abordagem baseada em risco (novidade da versão 2018).'],
    ['Qual princípio de auditoria foi adicionado na versão 2018 da ISO 19011?', ['Confidencialidade','Integridade','Abordagem baseada em risco','Apresentação justa'], 2, 'A abordagem baseada em risco e o setimo princípio, incluido na versão 2018.'],
    ['Qual e a hierarquia logica correta no processo de auditoria?', ['Evidência > Criterio > Conclusão > Constatação','Criterio > Evidência > Constatação > Conclusão','Constatação > Evidência > Criterio > Conclusão','Conclusão > Constatação > Criterio > Evidência'], 1, 'O auditor compara a evidência com o critério para gerar constatações, e agrupa as constatações para chegar a uma conclusão.'],
    ['Qual é a principal diferença entre auditoria e inspeção?', ['Auditoria e mais rapida','Auditoria avalia o sistema, inspeção avalia o produto','Inspeção e feita por auditores certificados','Não ha diferença significativa'], 1, 'Auditoria avalia o sistema de gestão. Inspeção avalia o produto ou peca específica.'],
  ];
  for (const [p, a, r, e] of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m1.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 2 quiz
  const m2q = [
    ['Qual a diferença entre programa de auditoria e plano de auditoria?', ['Sao sinonimos','Programa = todas as auditorias do periodo; Plano = uma auditoria específica','Programa e feito pelo auditor; Plano pelo gestor','Plano e mais abrangente que programa'], 1, 'Programa e o panorama geral (todas as auditorias). Plano e o detalhamento de uma auditoria individual.'],
    ['Quem normalmente e responsável por gerenciar o programa de auditoria?', ['O auditor-lider','A alta direção pessoalmente','O gestor do programa (geralmente coord. de qualidade)','O organismo certificador'], 2, 'O gestor do programa e designado pela organização, geralmente sendo o coordenador de qualidade.'],
    ['Qual critério NAO e valido para definir prioridades no programa de auditoria?', ['Resultados de auditorias anteriores','Preferência pessoal do auditor','Reclamações de clientes','Mudancas significativas nos processos'], 1, 'A preferência pessoal do auditor não ecriterio valido. As prioridades devem ser baseadas em risco, dados e requisitos.'],
    ['A ISO 19011 exige que o programa de auditoria considere:', ['Apenas os requisitos da norma ISO 9001','Riscos e oportunidades do programa','Apenas as reclamações de clientes','Apenas o orcamento disponível'], 1, 'A versão 2018 enfatiza que riscos e oportunidades devem ser considerados no programa de auditoria.'],
    ['Um auditor interno pode auditar seu próprio setor de trabalho?', ['Sim, sempre','Não, pois compromete a independencia','Sim, se tiver mais de 5 anos de experiência','Sim, se o gestor autorizar'], 1, 'O princípio da independencia exige que o auditor não audite sua própria atividade/setor.'],
  ];
  for (const [p, a, r, e] of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m2.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 3 quiz
  const m3q = [
    ['Qual e o principal objetivo da análise de documentação pre-auditoria?', ['Encontrar não conformidades antes da auditoria','Entender o processo e identificar pontos de atenção','Aprovar os procedimentos do auditado','Eliminar a necessidade de entrevistas'], 1, 'A análise documental prepara o auditor: entender o processo, identificar pontos de atenção e construir o checklist.'],
    ['No checklist de auditoria, qual tipo de pergunta e mais eficaz?', ['Perguntas de sim/não','Perguntas abertas combinadas com pedido de evidência','Perguntas indutivas','Perguntas múltiplas (3 perguntas em 1)'], 1, 'Perguntas abertas + pedido de evidência ("Mostre-me...") revelam a prática real do processo.'],
    ['Na amostragem por julgamento, o auditor deve priorizar:', ['Apenas os registros mais recentes','Itens de maior risco e diferentes periodos/turnos','Apenas os itens que o auditado indicar','Sempre a mesma quantidade para todos os processos'], 1, 'A amostragem deve considerar risco, variedade de periodos, turnos e criticidade.'],
    ['O plano de auditoria deve ser comunicado ao auditado:', ['No dia da auditoria','Nunca — e confidencial','Com antecedencia suficiente (recomendado 1 semana)','Apenas se o auditado solicitar'], 2, 'O plano deve ser enviado com antecedencia para que o auditado se organize e as pessoas-chave estejam disponíveis.'],
    ['Se o auditor encontra uma não conformidade na amostra, o que deve fazer?', ['Encerrar a auditoria','Ampliar a amostra para verificar se e pontual ou sistemico','Ignorar se for apenas 1 caso','Registrar e seguir em frente sem ampliar'], 1, 'Ao encontrar uma NC, o auditor deve ampliar a amostra para determinar se o problema e pontual ou sistemico.'],
  ];
  for (const [p, a, r, e] of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m3.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 4 quiz
  const m4q = [
    ['Qual e o principal objetivo da reunião de abertura?', ['Apresentar as não conformidades encontradas','Alinhar expectativas, confirmar escopo e agenda','Definir quem sera punido','Coletar evidências de auditoria'], 1, 'A reunião de abertura alinha expectativas, confirma escopo, agenda e métodos, e define o tom da auditoria.'],
    ['A "regra dos 3 pontos" na coleta de evidências significa:', ['Coletar 3 evidências por NC','Triangular: entrevista + observação + registro','Entrevistar pelo menos 3 pessoas','Verificar 3 documentos por processo'], 1, 'Triangulação: pergunte ao operador (entrevista), veja ele fazendo (observação), confira o registro (análise).'],
    ['Durante a auditoria, o auditor identifica uma NC. Quando deve comunicar ao auditado?', ['Apenas na reunião de encerramento','No momento em que identifica','Apenas no relatório final','Nunca — e confidencial ate o relatório'], 1, 'As constatações devem ser comunicadas no momento para garantir apresentação justa e evitar surpresas no encerramento.'],
    ['Na reunião de encerramento, se o auditado discordar de uma constatação, o auditor deve:', ['Retirar a constatação automaticamente','Ouvir, revisar a evidência e manter se houver base','Adiar a decisao para o proximo ano','Transformar a NC em oportunidade de melhoria'], 1, 'O auditor deve ouvir, revisar a evidência, e manter a constatação se ela tiver base sólida.'],
    ['Perguntas indutivas ("Você sempre segue o procedimento, correto?") devem ser evitadas porque:', ['Sao muito longas','Induzem a resposta que o auditor quer ouvir','Sao dificeis de entender','Sao proibidas pela ISO 19011'], 1, 'Perguntas indutivas direcionam a resposta e não revelam a prática real.'],
  ];
  for (const [p, a, r, e] of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m4.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 5 quiz
  const m5q = [
    ['Uma NC bem redigida deve conter obrigatoriamente:', ['Criterio, evidência e declaração da NC','Nome do culpado e penalidade','Criterio e sugestão de melhoria','Apenas a descrição do problema'], 0, 'Os tres elementos obrigatórios sao: critério (requisito não atendido), evidência (o que foi encontrado) e declaração (por que e NC).'],
    ['Qual e a diferença entre NC maior e NC menor?', ['NC maior e reincidente; NC menor e primeira vez','NC maior afeta o SGQ como um todo ou e ausência total; NC menor e pontual','NC maior e do auditor externo; NC menor e do interno','Não ha diferença — são sinonimos'], 1, 'NC maior = falha sistemática ou ausência total de requisito. NC menor = falha pontual que não compromete o SGQ.'],
    ['Multiplas NCs menores no mesmo tema podem indicar:', ['Que o auditor esta sendo rigoroso demais','Uma falha sistemática que justifica NC maior','Que a norma e muito exigente','Que o checklist esta errado'], 1, 'Varias NCs menores no mesmo tema podem evidenciar falha sistemática, justificando reclassificação como NC maior.'],
    ['Qual e o prazo recomendado para emissao do relatório de auditoria?', ['No mesmo dia','Ate 5 dias uteis','Ate 30 dias','Ate a proxima auditoria'], 1, 'O relatório deve ser emitido o mais rapido possível — idealmente ate 5 dias uteis.'],
    ['A verificação de eficácia de uma ação corretiva responde a pergunta:', ['A ação foi implementada?','A NC foi registrada corretamente?','A causa raiz foi eliminada e a NC não reincidiu?','O auditor aprovou o relatório?'], 2, 'A verificação de eficácia confirma que a ação eliminou a causa raiz e que a NC não reincidiu.'],
  ];
  for (const [p, a, r, e] of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m5.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 6 quiz
  const m6q = [
    ['A escuta ativa do auditor significa:', ['Ouvir e ja preparar a proxima pergunta mentalmente','Ouvir com atenção, reformular para confirmar entendimento e não interromper','Gravar todas as entrevistas','Anotar tudo palavra por palavra'], 1, 'Escuta ativa = ouvir atentamente, reformular para confirmar entendimento, não interromper e demonstrar interesse genuíno.'],
    ['Quando o auditado fica hostil, a melhor abordagem e:', ['Responder com firmeza e impor autoridade','Encerrar a auditoria imediatamente','Manter a calma, reconhecer a expertise do auditado e redirecionar para evidências','Ignorar e seguir com o checklist'], 2, 'Manter a calma, reconhecer o conhecimento do auditado e redirecionar para fatos e evidências desescala o conflito.'],
    ['O pensamento baseado em risco na auditoria significa:', ['Fazer análise de risco formal para cada auditoria','Priorizar áreas de maior impacto no planejamento e condução da auditoria','Auditar apenas processos de alto risco','Eliminar todos os riscos identificados'], 1, 'Significa direcionar tempo e atenção proporcionalmente ao risco/impacto de cada área.'],
    ['Se um auditor interno descobre evidência de fraude durante a auditoria, deve:', ['Investigar a fraude pessoalmente','Registrar e comunicar ao gestor do programa e a direção','Ignorar, pois não eescopo da auditoria','Confrontar o auditado publicamente'], 1, 'O auditor deve registrar o achado e comunicar aos responsáveis (gestor e direção), sem investigar alem do escopo.'],
    ['Qual situação configura conflito de interesse para o auditor?', ['Auditar um processo que nunca trabalhou','Auditar uma área onde trabalhou recentemente','Auditar um processo diferente do seu setor','Usar checklist padronizado da empresa'], 1, 'Auditar área onde trabalhou recentemente compromete a independencia e configura conflito de interesse.'],
  ];
  for (const [p, a, r, e] of m6q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m6.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // Module 7 quiz
  const m7q = [
    ['No estudo de caso da metalúrgica, por que as RACs sem análise de causa-raiz foram NC?', ['Porque a norma proibe correções','Porque a ação corretiva exige identificação da causa raiz (ISO 9001 cl. 10.2)','Porque o auditor não gostou da resposta','Porque as reclamações não foram resolvidas'], 1, 'A cláusula 10.2 exige análise de causa raiz como parte da ação corretiva. Apenas correção (tratar o sintoma) não atende ao requisito.'],
    ['No estudo de caso da indústria alimentícia, a NC de temperatura do pasteurizador foi classificada como maior porque:', ['O desvio foi de apenas 0,8C','A pasteurização é PCC e a falha pode afetar segurança do consumidor','O operador era do 3o turno','O procedimento estava desatualizado'], 1, 'A pasteurização é um Ponto Crítico de Controle (PCC). Falha no PCC sem tratamento pode comprometer a segurança do produto.'],
    ['Um auditor iniciante abre NC porque um formulário foi preenchido a lapis. Isso esta correto?', ['Sim, formulários devem ser sempre a caneta','Depende — só e NC se existir requisito (norma ou procedimento) que proiba lapis','Sim, e uma prática internacionalmente reconhecida','Não, formulários a lapis são aceitos pela ISO'], 1, 'So e NC se houver critério (requisito) que determine uso de caneta. Opiniao pessoal não ebase para NC.'],
    ['Qual a primeira ação recomendada para um auditor recem-formado?', ['Liderar uma auditoria sozinho','Participar como observador numa auditoria com auditor experiente','Reescrever todos os procedimentos da empresa','Fazer outra certificação antes de auditar'], 1, 'A prática recomendada e comecar como observador, acompanhando auditores mais experientes.'],
    ['Ao identificar que o indice de refugo esta acima da meta, o auditor deve:', ['Abrir NC automaticamente','Investigar as causas e verificar se ha tratamento adequado dos desvios','Ignorar, pois indicadores não são escopo de auditoria','Recomendar demissao do supervisor'], 1, 'O auditor deve investigar se os desvios estao sendo tratados conforme o SGQ exige, não apenas apontar o número.'],
  ];
  for (const [p, a, r, e] of m7q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${m7.id}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, false)`;
  }

  // ══════════════════════════════════════════════
  //  FINAL QUIZ — 30 questions
  // ══════════════════════════════════════════════
  const finalQ = [
    ['Auditoria de 2a parte e realizada por:', ['A própria organização','O cliente no fornecedor','Organismo certificador','O governo'], 1, 'Auditoria de 2a parte e quando o cliente (ou representante) audita seu fornecedor.'],
    ['Qual princípio de auditoria exige que o auditor não divulgue informações sem autorização?', ['Integridade','Independencia','Confidencialidade','Apresentação justa'], 2, 'Confidencialidade exige que informações obtidas na auditoria sejam protegidas.'],
    ['A ISO 19011:2018 e uma norma:', ['Certificavel','Não certificável — e uma norma-guia','Obrigatoria por lei','Aplicavel apenas a ISO 9001'], 1, 'A ISO 19011 e uma norma-guia para auditorias de sistemas de gestão. Não e certificável.'],
    ['O gestor do programa de auditoria e responsável por:', ['Conduzir cada auditoria pessoalmente','Planejar cronograma, designar auditores e monitorar o programa','Apenas elaborar o relatório final','Auditar a alta direção'], 1, 'O gestor do programa coordena o planejamento, execução e monitoramento do conjunto de auditorias.'],
    ['Na análise de documentação pre-auditoria, o auditor deve buscar:', ['Apenas o manual da qualidade','O que a organização diz que faz, para comparar com a prática em campo','Erros de portugues nos procedimentos','Apenas os indicadores financeiros'], 1, 'A análise documental prepara o auditor para verificar se a prática corresponde ao documentado.'],
    ['Um escopo de auditoria bem definido deve conter:', ['Apenas o nome do processo','Processos, locais, periodo e turno (quando aplicável)','Apenas a cláusula da norma','O nome dos auditados'], 1, 'O escopo deve delimitar processos, locais, periodo e turno para direcionar o trabalho do auditor.'],
    ['Se não ha critério (requisito) para comparar, o auditor:', ['Pode abrir NC baseado em boas práticas','Pode abrir NC baseado em experiência pessoal','Não pode abrir NC — sem critério não ha constatação de NC','Deve criar um novo requisito'], 2, 'Sem critério (requisito documentado), não ha base para não conformidade. Pode sugerir como OM.'],
    ['A competência do auditor interno inclui:', ['Apenas conhecimento da norma ISO 9001','Conhecimentos genericos de auditoria + conhecimentos específicos do setor + atributos pessoais','Apenas diploma universitario','Apenas experiência profissional'], 1, 'A ISO 19011 requer conhecimentos genericos, específicos do setor e atributos pessoais.'],
    ['O ciclo PDCA aplicado ao programa de auditoria e:', ['P=auditar, D=relatar, C=corrigir, A=encerrar','P=definir objetivos e cronograma, D=executar auditorias, C=monitorar indicadores, A=ajustar programa','P=planejar o checklist, D=fazer entrevistas, C=preencher relatório, A=fechar NCs','Não se aplica ao programa de auditoria'], 1, 'O programa de auditoria segue PDCA: planejar, executar, monitorar e ajustar.'],
    ['A reunião de abertura deve durar aproximadamente:', ['5 minutos','15 a 20 minutos','1 hora','Não ha reunião de abertura em auditorias internas'], 1, 'A reunião de abertura deve ser breve (15-20 minutos), cobrindo escopo, critérios, agenda e expectativas.'],
    ['A técnica de funil na entrevista significa:', ['Perguntar apenas sobre o topo da hierarquia','Comecar com perguntas amplas e ir afunilando para o específico','Usar apenas perguntas fechadas','Entrevistar do operador ao gerente nessa ordem'], 1, 'A técnica de funil vai do geral ("como funciona o processo?") ao específico ("mostre-me o registro de...").'],
    ['Triangulação na coleta de evidências combina:', ['3 auditores diferentes','3 normas diferentes','Entrevista + observação + análise de registros','3 entrevistas com a mesma pessoa'], 2, 'Triangulação: pergunte (entrevista), veja (observação) e confira (registro). Se os tres baterem, a evidência e sólida.'],
    ['Uma NC sem critério claro e problematica porque:', ['O auditado pode questionar a validade da constatação','O relatório fica mais curto','A norma proibe NCs sem número','Não e problematica'], 0, 'Sem critério claro, a NC pode ser questionada e derrubada pelo auditado, comprometendo a credibilidade do auditor.'],
    ['A diferença entre correção e ação corretiva e:', ['Correção e mais importante que ação corretiva','Correção trata o efeito imediato; ação corretiva elimina a causa raiz','Sao a mesma coisa','Correção e preventiva; ação corretiva e reativa'], 1, 'Correção = tratar o sintoma (calibrar o instrumento). Ação corretiva = eliminar a causa raiz (corrigir o sistema de alerta).'],
    ['NC maior se caracteriza por:', ['Falha pontual em um único registro','Ausencia ou falha total de um requisito, afetando a capacidade do SGQ','Qualquer NC encontrada pelo auditor externo','Erro de digitação em formulário'], 1, 'NC maior = falha sistemática ou ausência total de um requisito que compromete o SGQ.'],
    ['A ferramenta dos 5 Por ques e usada para:', ['Definir o escopo da auditoria','Chegar a causa raiz de uma não conformidade','Classificar NCs em maior ou menor','Elaborar o plano de auditoria'], 1, 'Os 5 Por ques aprofundam a investigação ate identificar a causa raiz do problema.'],
    ['O relatório de auditoria deve incluir pontos positivos porque:', ['E obrigatório pela ISO 19011','Reconhecer boas práticas engaja as pessoas e equilibra o relatório','Aumenta o número de páginas','Facilita a aprovação pelo gestor'], 1, 'Incluir pontos positivos equilibra o relatório, reconhece boas práticas e evita que a auditoria seja vista como puramente punitiva.'],
    ['Quanto tempo o auditor tem, idealmente, para emitir o relatório?', ['No mesmo dia da auditoria','Ate 5 dias uteis','Ate 30 dias','Ate a proxima reunião de análise crítica'], 1, 'O relatório deve ser emitido o mais rapido possível — idealmente ate 5 dias uteis após a auditoria.'],
    ['Qual a proporção ideal de fala do auditor durante a entrevista?', ['50% auditor, 50% auditado','80% auditor, 20% auditado','20% auditor, 80% auditado','100% auditor'], 2, 'O auditor deve ouvir mais do que falar. A proporção ideal e 80% ouvindo, 20% falando.'],
    ['Quando o auditado se mostra evasivo e muda de assunto, o auditor deve:', ['Encerrar a entrevista','Aceitar as respostas vagas','Reformular a pergunta de forma mais específica e pedir registros','Registrar obstrução e sair'], 2, 'Reformular a pergunta e pedir evidências concretas (registros) redireciona o auditado para o tema.'],
    ['O auditor observa um operador que não sabe recitar a política da qualidade. Isso e NC?', ['Sim, sempre','Não, nunca','Depende — se ele entende seu papel e contribuição, pode estar conforme (cl. 7.3)','Sim, se o operador tem mais de 1 ano de empresa'], 2, 'A cláusula 7.3 exige consciencia (entender a política e seu papel), não memorização do texto.'],
    ['Em auditorias internas, a independencia e garantida por:', ['Contratar auditores externos','O auditor não auditar sua própria área de trabalho','O auditor ser mais antigo que o auditado','O auditor ter diploma superior'], 1, 'Independencia em auditoria interna = não auditar seu próprio trabalho ou setor.'],
    ['Amostragem em auditoria e necessária porque:', ['A norma exige exatamente 10 amostras','O tempo é limitado e não é possível verificar 100% dos registros','O auditor só precisa ver documentos recentes','O auditado escolhe o que mostrar'], 1, 'O tempo de auditoria é limitado, então o auditor trabalha com amostras representativas.'],
    ['Se a amostra revela NC, o auditor deve:', ['Encerrar e registrar a NC','Ampliar a amostra para verificar se e pontual ou sistemico','Ignorar se for apenas 1 caso em muitos','Pedir ao auditado que corrija antes de registrar'], 1, 'Ampliar a amostra ajuda a determinar se o problema e isolado ou sistemico, o que afeta a classificação (menor vs. maior).'],
    ['O Diagrama de Ishikawa categoriza causas usando:', ['5 Por ques','As 10 cláusulas da ISO 9001','6M: Máquina, Método, Material, Mao de obra, Meio ambiente, Medição','PDCA'], 2, 'O Ishikawa (espinha de peixe) organiza causas potenciais nas categorias 6M.'],
    ['Qual cláusula da ISO 9001:2015 exige auditoria interna?', ['8.5','9.1','9.2','10.2'], 2, 'A cláusula 9.2 da ISO 9001:2015 estabelece os requisitos para auditoria interna.'],
    ['A verificação de eficácia de ação corretiva deve ocorrer:', ['Imediatamente após a implementação','Apos tempo suficiente para verificar se a NC não reincidiu','Apenas na proxima certificação','Nunca — a implementação basta'], 1, 'E preciso tempo para verificar se a ação realmente eliminou a causa raiz e a NC não reincidiu.'],
    ['Um auditor que aceita presente do auditado compromete qual princípio?', ['Cuidado profissional','Confidencialidade','Independencia','Abordagem baseada em evidência'], 2, 'Aceitar presentes pode comprometer a independencia e imparcialidade percebida do auditor.'],
    ['Na reunião de encerramento, constatações NAO devem ser surpresa porque:', ['O auditor deve comunicar constatações ao auditado no momento da identificação','O auditado ja sabe o resultado antes da auditoria','As constatações são enviadas por e-mail antes','O gestor do programa informa antecipadamente'], 0, 'Princípio da apresentação justa: comunicar constatações ao auditado no momento em que são identificadas evita surpresas.'],
    ['Qual é a principal lição dos estudos de caso do modulo 7?', ['Auditorias devem durar pelo menos 3 dias','A preparação e crítica e cada auditoria revela situações únicas que exigem julgamento','Todas as NCs devem ser maiores','Auditorias internas não geram ações corretivas relevantes'], 1, 'Os estudos de caso mostram que preparação sólida e julgamento profissional são essenciais para auditorias eficazes.'],
  ];
  for (const [p, a, r, e] of finalQ) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final) VALUES (${null}, ${courseId}, ${p}, ${JSON.stringify(a)}::jsonb, ${r}, ${e}, true)`;
  }
}
