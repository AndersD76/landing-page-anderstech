// ═══════════════════════════════════════════════════════════════════════════
// seed-course1.js — ISO 9001:2015 Interpretacao dos Requisitos
// Curso completo: 6 modulos, 24 aulas, 30 quiz de modulo + 30 quiz final
// ═══════════════════════════════════════════════════════════════════════════
// Uso:  import { seedCourse1 } from './seed-course1.js';
//       await seedCourse1(sql);   // sql = neon tagged template

export async function seedCourse1(sql) {

  // ─── Limpar dados anteriores deste curso (idempotente) ──────────────
  const existing = await sql`SELECT id FROM ead_courses WHERE slug = 'iso-9001-2015-interpretacao'`;
  if (existing.length) {
    const cid = existing[0].id;
    await sql`DELETE FROM ead_quiz_questions WHERE course_id = ${cid}`;
    await sql`DELETE FROM ead_lessons WHERE module_id IN (SELECT id FROM ead_modules WHERE course_id = ${cid})`;
    await sql`DELETE FROM ead_modules WHERE course_id = ${cid}`;
    await sql`DELETE FROM ead_courses WHERE id = ${cid}`;
  }

  // ─── Criar curso ───────────────────────────────────────────────────
  const courseRows = await sql`
    INSERT INTO ead_courses (slug, titulo, subtitulo, descricao, carga_horaria, preco, preco_original, publico, prerequisito, objetivo, ativo, ordem)
    VALUES (
      'iso-9001-2015-interpretacao',
      'ISO 9001:2015 — Interpretacao dos Requisitos',
      'Domine cada clausula da norma e saiba aplicar na pratica da sua empresa',
      'Curso completo de 12 horas cobrindo todos os requisitos da ISO 9001:2015 com exemplos reais da industria metalurgica, alimenticia, construcao civil e agronegocio. Aprenda a interpretar, implementar e manter um Sistema de Gestao da Qualidade robusto e pronto para certificacao.',
      '12h',
      397.00,
      597.00,
      'Gestores, coordenadores de qualidade, analistas, empresarios',
      'Nenhum',
      'Compreender todos os requisitos da ISO 9001:2015 e saber como aplica-los na pratica da sua empresa, com exemplos reais da industria.',
      true,
      1
    )
    RETURNING id
  `;
  const courseId = courseRows[0].id;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 1 — Fundamentos da ISO 9001 (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod1Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Fundamentos da ISO 9001', 'O que e a ISO 9001, os 7 principios, estrutura de 10 clausulas e diferencas entre as versoes 2008 e 2015.', 1)
    RETURNING id
  `;
  const mod1 = mod1Rows[0].id;

  // --- Aula 1.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'o-que-e-iso-9001', 'O que e a ISO 9001 e por que ela importa', '30 min', 1, ${`
<h2>O que e a ISO 9001 e por que ela importa</h2>

<p>A ISO 9001 e a norma internacional mais utilizada no mundo para Sistemas de Gestao da Qualidade (SGQ). Publicada pela International Organization for Standardization (ISO), ela define requisitos que qualquer organizacao — independente do porte, setor ou localizacao — pode adotar para garantir que seus produtos e servicos atendam consistentemente aos requisitos dos clientes e requisitos regulamentares aplicaveis.</p>

<p>Ate 2024, mais de 1,1 milhao de certificados ISO 9001 estavam ativos em 170 paises. No Brasil, segundo dados do Inmetro/ABNT, ha mais de 20.000 certificados validos, com forte concentracao na industria metalmecanica, alimenticia e de construcao civil.</p>

<h3>Uma breve historia</h3>

<p>A primeira versao da ISO 9001 foi publicada em 1987, baseada em normas militares britanicas (BS 5750). Desde entao, passou por revisoes em 1994, 2000, 2008 e a versao atual de 2015. Cada revisao tornou a norma mais orientada a resultados e menos burocratica.</p>

<table>
  <tr><th>Versao</th><th>Foco principal</th><th>Mudanca-chave</th></tr>
  <tr><td>1987</td><td>Conformidade de produto</td><td>Primeira publicacao internacional</td></tr>
  <tr><td>1994</td><td>Acoes preventivas</td><td>Enfase em documentacao</td></tr>
  <tr><td>2000</td><td>Abordagem de processos</td><td>Reducao de documentacao obrigatoria</td></tr>
  <tr><td>2008</td><td>Compatibilidade com ISO 14001</td><td>Ajustes de clareza</td></tr>
  <tr><td>2015</td><td>Mentalidade de risco e contexto</td><td>Estrutura de Alto Nivel (Anexo SL)</td></tr>
</table>

<h3>O que a ISO 9001 NAO e</h3>

<p>Um equivoco comum: a ISO 9001 nao e uma norma de produto. Ela nao diz qual o teor de carbono do aco nem a temperatura de pasteurizacao do leite. O que ela garante e que a organizacao tenha <strong>processos consistentes</strong> para planejar, executar, verificar e melhorar suas atividades. Em outras palavras, a norma cuida do <em>sistema</em>, nao do <em>produto</em> diretamente.</p>

<div class="callout"><strong>Importante:</strong> A ISO 9001 e generica por design. Isso significa que uma metalurgica de 30 funcionarios e uma multinacional de alimentos podem ambas ser certificadas — o nivel de complexidade do SGQ e que muda.</div>

<h3>Por que buscar a certificacao?</h3>

<ul>
  <li><strong>Requisito de mercado:</strong> muitas montadoras, redes de varejo e orgaos publicos exigem ISO 9001 de seus fornecedores. Na industria automotiva brasileira, por exemplo, e praticamente impossivel entrar na cadeia de suprimentos sem certificacao.</li>
  <li><strong>Reducao de custos da nao-qualidade:</strong> retrabalho, refugo, devolucoes e reclamacoes custam entre 5% e 25% do faturamento em empresas sem gestao estruturada. Um SGQ bem implementado reduz esses custos de forma mensuravel.</li>
  <li><strong>Melhoria da gestao interna:</strong> processos claros, responsabilidades definidas, indicadores monitorados — beneficios que vao muito alem do selo na parede.</li>
  <li><strong>Credibilidade:</strong> para clientes nacionais e internacionais, o certificado ISO 9001 e um sinal de comprometimento com a qualidade.</li>
</ul>

<div class="example"><strong>Exemplo pratico:</strong> Uma metalurgica em Caxias do Sul fabricava eixos para transmissoes. O principal cliente (uma montadora) notificou que a partir do proximo contrato exigiria ISO 9001. A empresa tinha 8 meses para se certificar. O projeto envolveu mapear 14 processos, definir indicadores e treinar 45 colaboradores. Resultado: certificacao obtida em 7 meses, reducao de 32% no indice de refugo e abertura de mais 3 clientes no setor automotivo.</div>

<h3>A estrutura basica do SGQ</h3>

<p>Um Sistema de Gestao da Qualidade baseado na ISO 9001 tem quatro pilares fundamentais:</p>

<ol>
  <li><strong>Contexto e lideranca</strong> — entender onde a organizacao esta inserida e garantir comprometimento da alta direcao.</li>
  <li><strong>Planejamento e suporte</strong> — definir objetivos, alocar recursos e gerenciar riscos.</li>
  <li><strong>Operacao</strong> — executar os processos que entregam valor ao cliente.</li>
  <li><strong>Avaliacao e melhoria</strong> — medir resultados, auditar e melhorar continuamente.</li>
</ol>

<p>Esses quatro pilares seguem a logica do ciclo PDCA (Plan-Do-Check-Act), que e o motor de qualquer sistema de gestao. Ao longo deste curso, voce vai ver como cada clausula da norma se encaixa nesse ciclo.</p>

<h3>Quem pode ser certificado?</h3>

<p>Qualquer organizacao: industria, comercio, servicos, governo, ONGs. Nao ha restricao de porte — desde um escritorio de engenharia com 5 pessoas ate uma usina siderurgica com 3.000 colaboradores. A norma se adapta a complexidade da organizacao.</p>

<div class="callout"><strong>Importante:</strong> A certificacao e voluntaria. Nenhuma lei brasileira obriga uma empresa a ser ISO 9001. Porem, o mercado — especialmente em cadeias de fornecimento industriais — frequentemente a torna uma exigencia contratual.</div>

<div class="template-box"><span>Download: Checklist - Beneficios da ISO 9001 para apresentar a direcao</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'sete-principios-qualidade', 'Os 7 Principios de Gestao da Qualidade', '30 min', 2, ${`
<h2>Os 7 Principios de Gestao da Qualidade</h2>

<p>A ISO 9001:2015 e construida sobre sete principios de gestao da qualidade. Eles nao sao requisitos auditaveis diretamente, mas formam a base filosofica de toda a norma. Entender esses principios e fundamental para interpretar os requisitos de forma inteligente — e nao apenas "cumprir tabela".</p>

<h3>1. Foco no cliente</h3>

<p>O proposito fundamental de qualquer organizacao e atender (e superar) as expectativas dos clientes. Isso vai muito alem de "entregar o que o cliente pediu". Envolve entender necessidades nao declaradas, antecipar tendencias e medir a satisfacao de forma sistematica.</p>

<div class="example"><strong>Exemplo pratico:</strong> Uma industria de alimentos em Chapeco recebia pouquissimas reclamacoes formais. A direcao assumia que os clientes estavam satisfeitos. Ao implementar uma pesquisa estruturada, descobriu que 40% dos distribuidores tinham problemas com o prazo de entrega — mas nunca reclamavam formalmente, simplesmente migravam para concorrentes. O foco no cliente exige ir buscar a informacao, nao esperar ela chegar.</div>

<h3>2. Lideranca</h3>

<p>Lideres em todos os niveis devem criar condicoes para que as pessoas se comprometam com os objetivos da qualidade. Isso significa que a alta direcao nao pode "delegar a qualidade para o RD" — ela precisa demonstrar comprometimento com acoes concretas: participar de analises criticas, alocar recursos, comunicar a importancia do SGQ.</p>

<div class="callout"><strong>Importante:</strong> Na versao 2015, a figura do "Representante da Direcao" (RD) deixou de ser obrigatoria. A intencao e que a responsabilidade pela qualidade seja da alta direcao, nao de uma unica pessoa.</div>

<h3>3. Engajamento de pessoas</h3>

<p>Pessoas competentes, habilitadas e engajadas sao essenciais. Nao basta ter processos documentados se as pessoas nao entendem seu papel, nao tem treinamento adequado ou nao se sentem parte do sistema.</p>

<div class="example"><strong>Exemplo pratico:</strong> Uma construtora em Curitiba tinha procedimentos detalhados para controle de concreto, mas os mestres de obra nao participaram da elaboracao e nao viam valor nos formularios. O indice de preenchimento era de 30%. Apos envolver os mestres na revisao dos formularios — simplificando e tornando relevantes para o dia a dia deles — o preenchimento subiu para 92% em dois meses.</div>

<h3>4. Abordagem de processo</h3>

<p>Resultados consistentes sao alcancados de forma mais eficaz quando as atividades sao entendidas e gerenciadas como processos inter-relacionados que funcionam como um sistema coerente. Isso significa:</p>

<ul>
  <li>Cada processo tem entradas, atividades, saidas e indicadores.</li>
  <li>Os processos tem donos (responsaveis) definidos.</li>
  <li>As interacoes entre processos sao mapeadas (o que um processo entrega ao proximo).</li>
</ul>

<p>Na pratica, isso se traduz no <strong>mapa de processos</strong> da organizacao — um dos primeiros documentos que um auditor pede para ver.</p>

<h3>5. Melhoria</h3>

<p>Organizacoes de sucesso tem um foco permanente em melhoria. Nao se trata apenas de corrigir problemas (isso e o minimo), mas de buscar ativamente oportunidades de fazer melhor, mais rapido, com menos desperdicio.</p>

<p>A melhoria pode ser incremental (kaizen, pequenos ajustes diarios) ou disruptiva (mudanca de tecnologia, redesenho de processo). A ISO 9001 pede ambas.</p>

<h3>6. Tomada de decisao baseada em evidencia</h3>

<p>Decisoes baseadas em analise de dados e informacoes tem maior probabilidade de produzir resultados desejados. Isso nao significa "burocratizar tudo com planilhas", mas sim garantir que decisoes importantes sejam apoiadas por fatos, nao por achismos.</p>

<div class="example"><strong>Exemplo pratico:</strong> Uma cooperativa agricola em Toledo-PR decidia o volume de compra de insumos "pelo feeling" do gerente. Apos implementar analise de dados historicos de safra e consumo, reduziu o estoque parado em 28% e o desperdicio por vencimento em 45%.</div>

<h3>7. Gestao de relacionamento</h3>

<p>Uma organizacao nao opera isolada. Fornecedores, parceiros, distribuidores e ate orgaos reguladores impactam sua capacidade de entregar qualidade. Gerenciar esses relacionamentos de forma proativa — e nao apenas reagir a problemas — e essencial.</p>

<p>Na industria metalurgica, por exemplo, um fornecedor de materia-prima instavel pode comprometer toda a cadeia produtiva. Avaliar, qualificar e desenvolver fornecedores e parte da gestao de relacionamento.</p>

<h3>Como os principios se conectam com a norma</h3>

<table>
  <tr><th>Principio</th><th>Clausulas mais relacionadas</th></tr>
  <tr><td>Foco no cliente</td><td>5.1.2, 8.2, 9.1.2</td></tr>
  <tr><td>Lideranca</td><td>5.1, 5.2, 5.3</td></tr>
  <tr><td>Engajamento de pessoas</td><td>7.1.2, 7.2, 7.3</td></tr>
  <tr><td>Abordagem de processo</td><td>4.4, 8.1</td></tr>
  <tr><td>Melhoria</td><td>10.1, 10.2, 10.3</td></tr>
  <tr><td>Decisao baseada em evidencia</td><td>9.1, 9.3</td></tr>
  <tr><td>Gestao de relacionamento</td><td>8.4</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> Auditores nao auditam "principios" diretamente. Porem, se voce entender os principios, vai interpretar os requisitos com muito mais profundidade. Um auditor experiente percebe rapidamente se a organizacao realmente internalizou esses conceitos ou se esta apenas "jogando papel".</div>

<div class="template-box"><span>Download: Quadro-resumo dos 7 principios com aplicacao pratica</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'estrutura-10-clausulas', 'Estrutura de 10 Clausulas (Anexo SL)', '30 min', 3, ${`
<h2>Estrutura de 10 Clausulas e o Anexo SL</h2>

<p>A partir da versao 2015, a ISO 9001 adotou a chamada <strong>Estrutura de Alto Nivel</strong> (High Level Structure — HLS), definida pelo Anexo SL da ISO. Essa estrutura padroniza todas as normas de sistemas de gestao (ISO 9001, ISO 14001, ISO 45001, etc.) em 10 clausulas, facilitando a integracao entre elas.</p>

<h3>As 10 clausulas</h3>

<ol>
  <li><strong>Escopo</strong> — Define o que a norma cobre.</li>
  <li><strong>Referencia normativa</strong> — Documentos referenciados (ISO 9000:2015 - Fundamentos e vocabulario).</li>
  <li><strong>Termos e definicoes</strong> — Remete a ISO 9000:2015.</li>
  <li><strong>Contexto da organizacao</strong> — Entender o ambiente interno e externo, partes interessadas, escopo do SGQ e processos.</li>
  <li><strong>Lideranca</strong> — Comprometimento da alta direcao, politica da qualidade e responsabilidades.</li>
  <li><strong>Planejamento</strong> — Riscos e oportunidades, objetivos da qualidade e planejamento de mudancas.</li>
  <li><strong>Apoio</strong> — Recursos, competencia, conscientizacao, comunicacao e informacao documentada.</li>
  <li><strong>Operacao</strong> — Planejamento e controle operacional, requisitos de produtos/servicos, projeto, fornecedores, producao e liberacao.</li>
  <li><strong>Avaliacao de desempenho</strong> — Monitoramento, auditoria interna e analise critica pela direcao.</li>
  <li><strong>Melhoria</strong> — Nao conformidade, acao corretiva e melhoria continua.</li>
</ol>

<div class="callout"><strong>Importante:</strong> As clausulas 1 a 3 sao informativas (nao contem requisitos auditaveis). Os requisitos que voce precisa implementar estao nas clausulas 4 a 10.</div>

<h3>A logica do PDCA nas clausulas</h3>

<p>A norma organiza os requisitos seguindo o ciclo PDCA:</p>

<table>
  <tr><th>Fase PDCA</th><th>Clausulas</th><th>O que acontece</th></tr>
  <tr><td>Plan (Planejar)</td><td>4, 5, 6</td><td>Entender o contexto, definir lideranca e planejar acoes</td></tr>
  <tr><td>Do (Fazer)</td><td>7, 8</td><td>Alocar recursos e executar os processos operacionais</td></tr>
  <tr><td>Check (Verificar)</td><td>9</td><td>Monitorar, medir, auditar e analisar criticamente</td></tr>
  <tr><td>Act (Agir)</td><td>10</td><td>Tratar nao conformidades e melhorar continuamente</td></tr>
</table>

<p>Essa organizacao nao e arbitraria — ela reflete a forma como qualquer sistema de gestao deveria funcionar. Primeiro voce planeja (entende onde esta e para onde quer ir), depois executa, depois verifica se deu certo e entao ajusta.</p>

<h3>Leitura cruzada entre clausulas</h3>

<p>Um erro comum de quem esta comecando: ler cada clausula isoladamente. Na pratica, as clausulas conversam entre si constantemente. Exemplos:</p>

<ul>
  <li>A clausula 6.1 (riscos) alimenta a clausula 8.1 (planejamento operacional).</li>
  <li>A clausula 9.1.2 (satisfacao do cliente) alimenta a clausula 9.3 (analise critica) e a clausula 10.3 (melhoria continua).</li>
  <li>A clausula 7.5 (informacao documentada) permeia TODAS as outras clausulas.</li>
</ul>

<div class="example"><strong>Exemplo pratico:</strong> Em uma auditoria numa fabrica de estruturas metalicas, o auditor encontrou que a empresa tinha uma otima gestao de riscos documentada (clausula 6.1), mas na operacao (clausula 8) nao havia evidencia de que esses riscos eram considerados no planejamento da producao. Resultado: nao conformidade menor. A empresa tinha "papel" mas nao tinha "conexao" entre as clausulas.</div>

<h3>Terminologia essencial</h3>

<p>Antes de avancar, alinhe o vocabulario. Termos que voce vai encontrar em toda a norma:</p>

<ul>
  <li><strong>Informacao documentada</strong> — substitui "procedimento documentado", "registro" e "manual da qualidade" da versao 2008. Agora e um termo unico e flexivel.</li>
  <li><strong>Parte interessada</strong> — qualquer pessoa ou organizacao que pode afetar, ser afetada ou se perceber afetada pelas decisoes da empresa (clientes, funcionarios, fornecedores, comunidade, orgaos reguladores).</li>
  <li><strong>Risco</strong> — efeito da incerteza. Pode ser positivo (oportunidade) ou negativo (ameaca).</li>
  <li><strong>Contexto</strong> — o ambiente em que a organizacao opera (fatores internos e externos).</li>
  <li><strong>Processo</strong> — conjunto de atividades inter-relacionadas que transformam entradas em saidas.</li>
</ul>

<div class="callout"><strong>Importante:</strong> Na versao 2015, a norma NAO exige mais um Manual da Qualidade como documento obrigatorio. Voce pode ter um se quiser, mas nao e exigido. O que a norma pede e que a informacao documentada necessaria esteja disponivel e controlada.</div>

<h3>Beneficios da Estrutura de Alto Nivel</h3>

<p>Se sua empresa ja tem ou pretende ter ISO 14001 (meio ambiente) ou ISO 45001 (saude e seguranca), a estrutura comum facilita enormemente a integracao. Os requisitos de contexto, lideranca, planejamento, apoio, avaliacao e melhoria sao identicos em estrutura — muda apenas o foco tecnico.</p>

<div class="template-box"><span>Download: Mapa visual das 10 clausulas x PDCA</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'diferencas-2008-2015', 'Diferencas entre ISO 9001:2008 e 2015', '30 min', 4, ${`
<h2>Diferencas entre ISO 9001:2008 e ISO 9001:2015</h2>

<p>Se voce trabalhou com a versao 2008, precisa entender o que mudou — e por que. Se voce e novo na norma, esse comparativo ajuda a entender a evolucao do pensamento de gestao da qualidade. A revisao de 2015 foi a mais significativa desde a de 2000.</p>

<h3>Mudancas estruturais</h3>

<table>
  <tr><th>Aspecto</th><th>ISO 9001:2008</th><th>ISO 9001:2015</th></tr>
  <tr><td>Estrutura</td><td>8 clausulas</td><td>10 clausulas (Anexo SL)</td></tr>
  <tr><td>Manual da qualidade</td><td>Obrigatorio</td><td>Nao obrigatorio</td></tr>
  <tr><td>Representante da Direcao</td><td>Obrigatorio</td><td>Nao obrigatorio (responsabilidade distribuida)</td></tr>
  <tr><td>Procedimentos documentados</td><td>6 obrigatorios</td><td>Nenhum obrigatorio especifico (informacao documentada conforme necessidade)</td></tr>
  <tr><td>Acao preventiva</td><td>Clausula especifica (8.5.3)</td><td>Substituida por gestao de riscos (6.1)</td></tr>
  <tr><td>Exclusoes</td><td>Permitidas (clausula 7)</td><td>Nao ha "exclusoes" — usa-se "aplicabilidade" (clausula 4.3)</td></tr>
</table>

<h3>Novidades conceituais da versao 2015</h3>

<h3>1. Contexto da organizacao (clausula 4)</h3>

<p>Na versao 2008, nao existia nenhum requisito para entender o ambiente externo e interno da organizacao. A versao 2015 exige que a empresa analise fatores como mercado, tecnologia, legislacao, cultura organizacional e expectativas das partes interessadas. E a norma reconhecendo que qualidade nao existe no vacuo — ela depende do contexto.</p>

<div class="example"><strong>Exemplo pratico:</strong> Uma construtora que atuava so em obras residenciais decidiu entrar no mercado de obras publicas. O contexto mudou completamente: novas legislacoes (Lei de Licitacoes), novos requisitos de documentacao, novos riscos. A analise de contexto da clausula 4 obriga a empresa a reconhecer e tratar essas mudancas formalmente.</div>

<h3>2. Mentalidade de risco</h3>

<p>A maior mudanca conceitual. A versao 2008 tinha "acoes preventivas" como um requisito formal que ninguem conseguia implementar de forma convincente. A versao 2015 eliminou essa clausula e substituiu por algo muito mais poderoso: a mentalidade de risco permeando toda a norma.</p>

<p>Agora, toda vez que voce planeja um processo, define um objetivo ou modifica algo, precisa considerar: quais riscos isso traz? Quais oportunidades? O que pode dar errado? O que pode dar mais certo do que o esperado?</p>

<div class="callout"><strong>Importante:</strong> A norma NAO exige uma metodologia formal de gestao de riscos (como FMEA ou ISO 31000). Ela pede que a organizacao considere riscos e oportunidades de forma proporcional a sua complexidade. Uma microempresa pode fazer isso com uma planilha simples; uma industria complexa pode usar FMEA, Bow-Tie ou outra metodologia estruturada.</div>

<h3>3. Lideranca mais ativa</h3>

<p>Na versao 2008, a alta direcao podia "delegar" a gestao da qualidade ao Representante da Direcao. Na versao 2015, a norma e explicita: a alta direcao deve demonstrar lideranca e comprometimento com relacao ao SGQ, garantir que a politica e os objetivos sejam compativeis com a direcao estrategica, integrar os requisitos do SGQ nos processos de negocio e promover a mentalidade de risco.</p>

<h3>4. Informacao documentada (novo termo)</h3>

<p>O termo "informacao documentada" substituiu tres termos anteriores:</p>

<ul>
  <li>"Documento" (procedimento, instrucao de trabalho, manual)</li>
  <li>"Registro" (evidencia de que algo foi feito)</li>
  <li>"Procedimento documentado" (os 6 obrigatorios da versao 2008)</li>
</ul>

<p>Agora tudo e "informacao documentada". A norma diz quando voce deve "manter" (documento) e quando deve "reter" (registro). Essa flexibilidade permite que cada organizacao defina o nivel de documentacao adequado para sua realidade.</p>

<h3>5. Pensamento baseado em processos reforcado</h3>

<p>A versao 2008 ja falava em abordagem de processos, mas a 2015 reforcou significativamente. A clausula 4.4 exige que a organizacao determine seus processos, suas interacoes, criterios de monitoramento, recursos necessarios e responsabilidades. Na pratica, o mapa de processos ficou mais importante.</p>

<h3>O que NAO mudou</h3>

<ul>
  <li>A essencia da norma continua a mesma: entregar consistentemente produtos e servicos que atendam aos requisitos.</li>
  <li>O ciclo PDCA continua como base.</li>
  <li>Auditoria interna, analise critica e acao corretiva continuam obrigatorias.</li>
  <li>A necessidade de controlar fornecedores permanece.</li>
</ul>

<div class="example"><strong>Exemplo pratico:</strong> Uma metalurgica que migrou da versao 2008 para 2015 descobriu que 70% do seu SGQ ja atendia a nova versao. As principais adequacoes foram: criar a analise de contexto e partes interessadas, reformular a gestao de riscos (tirando o formulario generico de "acao preventiva" e colocando analise de risco por processo) e envolver mais a direcao nas analises criticas. O Manual da Qualidade foi mantido por opcao, mas simplificado de 40 para 12 paginas.</div>

<h3>Dica para quem vem da versao 2008</h3>

<p>Nao tente "converter" os documentos antigos palavra por palavra. Use a transicao como oportunidade para simplificar. Muitas empresas tinham documentacao excessiva na versao 2008 que nao agregava valor. A versao 2015 e a chance de ter um SGQ mais enxuto, pratico e realmente util para a gestao.</p>

<div class="template-box"><span>Download: Tabela comparativa detalhada 2008 vs 2015</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 2 — Contexto e Lideranca (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod2Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Contexto e Lideranca', 'Clausulas 4 e 5: analise do contexto organizacional, partes interessadas, escopo, processos e papel da lideranca.', 2)
    RETURNING id
  `;
  const mod2 = mod2Rows[0].id;

  // --- Aula 2.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'contexto-organizacao', 'Clausula 4.1 — Entendendo a Organizacao e seu Contexto', '30 min', 1, ${`
<h2>Clausula 4.1 — Entendendo a Organizacao e seu Contexto</h2>

<p>A clausula 4.1 e o ponto de partida de toda a norma ISO 9001:2015. Antes de definir politicas, objetivos ou processos, a organizacao precisa entender <strong>onde esta inserida</strong>. Isso envolve mapear fatores internos e externos que podem afetar a capacidade de entregar produtos e servicos conformes.</p>

<h3>O que a norma pede</h3>

<p>O requisito e direto: "A organizacao deve determinar questoes externas e internas que sejam pertinentes para seu proposito e sua direcao estrategica e que afetem sua capacidade de alcancar os resultados pretendidos de seu SGQ."</p>

<p>Traduzindo: voce precisa saber o que esta acontecendo dentro e fora da empresa que impacta a qualidade dos seus produtos e servicos.</p>

<h3>Questoes externas</h3>

<p>Sao fatores do ambiente em que a organizacao opera, sobre os quais ela tem pouco ou nenhum controle:</p>

<ul>
  <li><strong>Economicas:</strong> inflacao, taxa de cambio, custo de materias-primas, poder de compra dos clientes.</li>
  <li><strong>Legais/regulatorias:</strong> normas tecnicas, legislacao ambiental, requisitos sanitarios, normas trabalhistas.</li>
  <li><strong>Tecnologicas:</strong> novas tecnologias disponiveis, obsolescencia de equipamentos, digitalizacao.</li>
  <li><strong>Competitivas:</strong> acoes de concorrentes, entrada de novos players, mudancas no mercado.</li>
  <li><strong>Sociais/culturais:</strong> expectativas da comunidade, tendencias de consumo, escassez de mao de obra qualificada.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> Uma empresa de usinagem em Joinville identificou como questoes externas criticas: (1) a escassez de operadores de CNC qualificados na regiao, (2) a variacao do preco do aco importado devido ao cambio, (3) a entrada de concorrentes chineses oferecendo pecas a precos mais baixos. Cada um desses fatores exigiu acoes especificas: programa de formacao interna, contratos de fornecimento com hedge cambial e diferenciacao pela qualidade e prazo.</div>

<h3>Questoes internas</h3>

<p>Sao fatores dentro da organizacao:</p>

<ul>
  <li><strong>Cultura organizacional:</strong> como as pessoas encaram qualidade, inovacao, mudanca.</li>
  <li><strong>Estrutura:</strong> organograma, processos decisorios, autonomia das equipes.</li>
  <li><strong>Recursos:</strong> financeiros, tecnologicos, humanos.</li>
  <li><strong>Conhecimento:</strong> know-how acumulado, dependencia de pessoas-chave.</li>
  <li><strong>Desempenho:</strong> indicadores atuais, historico de nao conformidades, nivel de maturidade do SGQ.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong> Uma fabrica de embutidos identificou como questao interna critica a alta rotatividade na linha de producao (turnover de 35% ao ano). Isso impactava diretamente a qualidade: operadores novos cometiam mais erros de dosagem e temperatura. A acao foi criar um programa de integracao mais robusto e um plano de carreira para operadores, reduzindo o turnover para 18% em um ano.</div>

<h3>Ferramentas praticas para analise de contexto</h3>

<p>A norma nao exige nenhuma ferramenta especifica. As mais usadas na pratica sao:</p>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Complexidade</th></tr>
  <tr><td>Analise SWOT</td><td>Visao geral rapida</td><td>Baixa</td></tr>
  <tr><td>PESTEL</td><td>Aprofundar fatores externos</td><td>Media</td></tr>
  <tr><td>5 Forcas de Porter</td><td>Entender competitividade</td><td>Media</td></tr>
  <tr><td>Canvas de modelo de negocio</td><td>Startups e empresas novas</td><td>Media</td></tr>
</table>

<p>Para a maioria das PMEs brasileiras, uma <strong>analise SWOT bem-feita</strong> ja atende plenamente o requisito. O importante e que seja realista (nao um exercicio de fantasia), que seja monitorada periodicamente e que alimente decisoes concretas.</p>

<h3>Frequencia de revisao</h3>

<p>A norma exige que a organizacao "monitore e analise criticamente" as informacoes sobre contexto. Na pratica, a maioria das organizacoes faz isso na analise critica pela direcao (clausula 9.3), que acontece pelo menos uma vez ao ano. Porem, eventos significativos (pandemia, mudanca regulatoria, crise de mercado) devem disparar revisoes extraordinarias.</p>

<div class="callout"><strong>Importante:</strong> A analise de contexto nao precisa ser um documento extenso. Para uma empresa de 50 funcionarios, uma ou duas paginas com os principais fatores, seus impactos e as acoes planejadas ja e suficiente. O auditor quer ver que voce PENSOU sobre isso e tomou decisoes com base nessa analise — nao quer um relatorio academico.</div>

<div class="template-box"><span>Download: Template de analise de contexto (SWOT + fatores internos/externos)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'partes-interessadas', 'Clausula 4.2 — Partes Interessadas e seus Requisitos', '30 min', 2, ${`
<h2>Clausula 4.2 — Partes Interessadas e seus Requisitos</h2>

<p>A clausula 4.2 complementa a 4.1. Apos entender o contexto, a organizacao precisa identificar quem sao as <strong>partes interessadas pertinentes</strong> ao SGQ e quais sao seus requisitos relevantes.</p>

<h3>O que a norma pede</h3>

<p>"A organizacao deve determinar: (a) as partes interessadas que sejam pertinentes para o SGQ; (b) os requisitos dessas partes interessadas que sejam pertinentes para o SGQ."</p>

<p>A palavra-chave e <strong>pertinente</strong>. Voce nao precisa listar todas as partes interessadas do universo — apenas aquelas que realmente impactam ou sao impactadas pelo seu sistema de gestao da qualidade.</p>

<h3>Quem sao as partes interessadas tipicas</h3>

<table>
  <tr><th>Parte interessada</th><th>Requisitos tipicos</th><th>Exemplo industrial</th></tr>
  <tr><td>Clientes</td><td>Produto conforme, prazo, preco justo, suporte tecnico</td><td>Montadora exige CPK > 1,33 em dimensoes criticas</td></tr>
  <tr><td>Colaboradores</td><td>Salario justo, seguranca, treinamento, ambiente de trabalho</td><td>Operadores de solda pedem EPI adequado e ventilacao</td></tr>
  <tr><td>Fornecedores</td><td>Pedidos claros, prazo de pagamento, previsibilidade</td><td>Siderurgica precisa de previsao de demanda com 60 dias</td></tr>
  <tr><td>Acionistas/socios</td><td>Retorno financeiro, crescimento sustentavel</td><td>Socio espera margem liquida acima de 8%</td></tr>
  <tr><td>Orgaos reguladores</td><td>Conformidade legal, licencas, autorizacoes</td><td>ANVISA exige BPF na industria alimenticia</td></tr>
  <tr><td>Comunidade local</td><td>Baixo impacto ambiental, emprego local</td><td>Vizinhos da fabrica reclamam de ruido noturno</td></tr>
  <tr><td>Organismos de certificacao</td><td>Atendimento aos requisitos da norma</td><td>Bureau Veritas agenda auditoria anual</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Uma construtora de medio porte em Florianopolis listou 9 partes interessadas. Ao analisar com cuidado, percebeu que duas eram as mais criticas para o SGQ: (1) os clientes finais (compradores de apartamentos), cujos requisitos incluiam acabamento sem defeitos e entrega no prazo; e (2) o CREA/CAU, cujos requisitos eram conformidade com normas tecnicas e ART recolhida. As demais partes existiam, mas seus requisitos tinham impacto menor no SGQ especificamente.</div>

<h3>Como levantar os requisitos</h3>

<p>Nao complique. Para cada parte interessada pertinente, pergunte:</p>

<ol>
  <li>O que essa parte espera de nos em relacao a qualidade?</li>
  <li>Qual o impacto se nao atendermos essa expectativa?</li>
  <li>Esses requisitos sao obrigatorios (legais/contratuais) ou voluntarios?</li>
</ol>

<p>Requisitos obrigatorios (legais, regulamentares, contratuais) devem ser tratados como prioridade absoluta. Requisitos voluntarios (expectativas do mercado, boas praticas) sao importantes, mas podem ser priorizados conforme a estrategia da organizacao.</p>

<h3>Monitoramento e atualizacao</h3>

<p>Partes interessadas e seus requisitos mudam. Um novo contrato pode trazer novos requisitos do cliente. Uma mudanca regulatoria pode criar novos requisitos legais. A norma pede que essa analise seja monitorada e atualizada — novamente, a analise critica pela direcao e o momento natural para isso.</p>

<div class="callout"><strong>Importante:</strong> Um erro frequente em auditorias e ter a matriz de partes interessadas "congelada" desde a implantacao do SGQ. O auditor pergunta: "Quando foi a ultima vez que voces revisaram as partes interessadas?" Se a resposta for "na implantacao, ha 3 anos", e um achado provavel. A organizacao precisa demonstrar que essa analise e viva.</div>

<h3>Conexao com outras clausulas</h3>

<p>A analise de partes interessadas alimenta diretamente:</p>

<ul>
  <li><strong>Clausula 4.3 (escopo):</strong> o escopo deve considerar os requisitos das partes interessadas.</li>
  <li><strong>Clausula 6.1 (riscos):</strong> riscos e oportunidades devem considerar as partes interessadas.</li>
  <li><strong>Clausula 8.2 (requisitos de produtos/servicos):</strong> os requisitos do cliente sao um subconjunto dos requisitos das partes interessadas.</li>
  <li><strong>Clausula 9.3 (analise critica):</strong> mudancas nas partes interessadas sao entrada obrigatoria para a analise critica.</li>
</ul>

<div class="template-box"><span>Download: Matriz de partes interessadas com prioridade e requisitos</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'escopo-processos', 'Clausulas 4.3 e 4.4 — Escopo do SGQ e Abordagem de Processos', '30 min', 3, ${`
<h2>Clausulas 4.3 e 4.4 — Escopo e Abordagem de Processos</h2>

<h3>Clausula 4.3 — Determinando o escopo do SGQ</h3>

<p>O escopo define os limites e a aplicabilidade do seu Sistema de Gestao da Qualidade. Em termos simples: o que esta dentro e o que esta fora do SGQ.</p>

<p>Para determinar o escopo, a organizacao deve considerar:</p>

<ul>
  <li>As questoes externas e internas (clausula 4.1)</li>
  <li>Os requisitos das partes interessadas (clausula 4.2)</li>
  <li>Os produtos e servicos da organizacao</li>
</ul>

<p>O escopo deve ser mantido como informacao documentada e deve declarar os tipos de produtos e servicos cobertos. Se algum requisito da norma nao for aplicavel, a organizacao deve justificar — e essa nao aplicabilidade nao pode afetar a conformidade dos produtos/servicos.</p>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> "O SGQ da MetalForte Ltda. abrange o projeto, fabricacao e comercializacao de pecas usinadas em aco e aluminio para a industria automotiva e de maquinas agricolas, realizadas na unidade de Caxias do Sul - RS." Note como o escopo e especifico: diz O QUE faz, PARA QUEM faz e ONDE faz.</div>

<div class="callout"><strong>Importante:</strong> Um escopo generico demais ("prestacao de servicos") sera questionado pelo auditor. Um escopo especifico demais pode limitar desnecessariamente o SGQ. Encontre o equilibrio: seja claro o suficiente para que qualquer pessoa entenda o que a empresa faz e o que o certificado cobre.</div>

<h3>Sobre nao aplicabilidade de requisitos</h3>

<p>Na versao 2008, existia o conceito de "exclusoes" (geralmente do requisito 7.3 — projeto). Na versao 2015, nao existe mais "exclusao". Existe "nao aplicabilidade", que e diferente: voce precisa justificar por que aquele requisito nao se aplica, e essa justificativa deve ser razoavel.</p>

<p>Requisitos que frequentemente sao declarados "nao aplicaveis":</p>

<ul>
  <li><strong>8.3 (Projeto e desenvolvimento):</strong> quando a organizacao fabrica conforme especificacao do cliente, sem projetar. Exemplo: uma metalurgica que usina pecas conforme desenho do cliente nao projeta — mas se ela modifica materiais ou processos por conta propria, pode estar projetando sem saber.</li>
  <li><strong>8.5.1 f (Atividades pos-entrega):</strong> quando nao ha necessidade de assistencia tecnica, garantia ou manutencao pos-venda.</li>
</ul>

<h3>Clausula 4.4 — SGQ e seus processos</h3>

<p>Esta e uma das clausulas mais importantes da norma. Ela exige que a organizacao determine os processos necessarios para o SGQ e, para cada processo, defina:</p>

<ol>
  <li><strong>Entradas e saidas:</strong> o que entra e o que sai de cada processo.</li>
  <li><strong>Sequencia e interacao:</strong> como os processos se conectam.</li>
  <li><strong>Criterios e metodos:</strong> como medir se o processo esta funcionando.</li>
  <li><strong>Recursos:</strong> o que e necessario para operar o processo.</li>
  <li><strong>Responsabilidades:</strong> quem e responsavel pelo processo.</li>
  <li><strong>Riscos e oportunidades:</strong> conforme clausula 6.1.</li>
  <li><strong>Melhoria:</strong> como o processo pode ser melhorado.</li>
</ol>

<h3>O mapa de processos</h3>

<p>Na pratica, isso se materializa em um <strong>mapa de processos</strong>. A maioria das organizacoes classifica seus processos em tres categorias:</p>

<table>
  <tr><th>Categoria</th><th>Funcao</th><th>Exemplos</th></tr>
  <tr><td>Processos de gestao</td><td>Direcionar e controlar</td><td>Planejamento estrategico, analise critica, gestao de riscos</td></tr>
  <tr><td>Processos de realizacao (core)</td><td>Entregar valor ao cliente</td><td>Vendas, projeto, producao, entrega, pos-venda</td></tr>
  <tr><td>Processos de apoio</td><td>Suportar os processos core</td><td>RH, compras, manutencao, TI, qualidade</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Cooperativa agricola:</strong> Uma cooperativa de graos mapeou 11 processos: Governanca (gestao), Recepcao de graos, Classificacao, Armazenamento, Beneficiamento, Comercializacao (core), Compras, Manutencao, Gestao de pessoas, Financeiro, Qualidade (apoio). Cada processo tinha um dono, indicadores, entradas e saidas definidos. Isso facilitou tanto a gestao diaria quanto as auditorias.</div>

<h3>Dicas para montar o mapa de processos</h3>

<ul>
  <li>Nao crie processos demais. Uma empresa de 50 pessoas geralmente tem entre 8 e 15 processos. Mais que isso vira burocracia.</li>
  <li>Garanta que as interacoes estejam claras: quem entrega o que para quem.</li>
  <li>Cada processo precisa de pelo menos um indicador mensuravel.</li>
  <li>O mapa deve refletir a realidade, nao um ideal. Mapeie como a empresa realmente funciona, depois melhore.</li>
</ul>

<div class="template-box"><span>Download: Modelo de mapa de processos e ficha de processo</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'lideranca-politica', 'Clausula 5 — Lideranca e Politica da Qualidade', '30 min', 4, ${`
<h2>Clausula 5 — Lideranca e Politica da Qualidade</h2>

<p>A clausula 5 e o coracao estrategico da norma. Ela coloca a alta direcao no centro do SGQ — nao como figurante, mas como protagonista. Se a direcao nao estiver comprometida de verdade, todo o resto vira papel sem alma.</p>

<h3>5.1 — Lideranca e comprometimento</h3>

<h3>5.1.1 — Generalidades</h3>

<p>A alta direcao deve demonstrar lideranca e comprometimento com relacao ao SGQ. A norma lista acoes concretas:</p>

<ul>
  <li>Responsabilizar-se pela eficacia do SGQ.</li>
  <li>Assegurar que a politica e os objetivos sejam estabelecidos e compativeis com a direcao estrategica.</li>
  <li>Assegurar a integracao dos requisitos do SGQ nos processos de negocio.</li>
  <li>Promover o uso da abordagem de processo e da mentalidade de risco.</li>
  <li>Assegurar que os recursos necessarios estejam disponiveis.</li>
  <li>Comunicar a importancia do SGQ e da conformidade com os requisitos.</li>
  <li>Assegurar que o SGQ alcance seus resultados pretendidos.</li>
  <li>Engajar, dirigir e apoiar pessoas a contribuir.</li>
  <li>Promover melhoria.</li>
  <li>Apoiar outros papeis de gestao pertinentes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> O verbo e "demonstrar" — nao basta dizer que apoia. O auditor vai procurar evidencias: atas de analise critica com participacao da direcao, alocacao de recursos para projetos de qualidade, comunicacoes da direcao sobre qualidade, decisoes que priorizaram qualidade sobre custo de curto prazo.</div>

<h3>5.1.2 — Foco no cliente</h3>

<p>A alta direcao deve demonstrar lideranca e comprometimento com relacao ao foco no cliente, assegurando que:</p>

<ul>
  <li>Requisitos do cliente e requisitos legais sejam determinados, entendidos e atendidos.</li>
  <li>Riscos que possam afetar a conformidade sejam tratados.</li>
  <li>O foco no aumento da satisfacao do cliente seja mantido.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong> O diretor de uma fabrica de massas em Erechim participava pessoalmente da reuniao mensal de analise de reclamacoes de clientes. Nao delegava ao gerente de qualidade. Quando uma rede de supermercados reportou problemas de embalagem, o diretor autorizou investimento de R$ 180.000 em nova seladora na mesma semana. Isso e lideranca com foco no cliente — decisao rapida, recurso alocado, prioridade clara.</div>

<h3>5.2 — Politica da qualidade</h3>

<p>A politica da qualidade e a declaracao de intencoes da organizacao em relacao a qualidade. Ela deve:</p>

<ol>
  <li>Ser apropriada ao proposito e contexto da organizacao.</li>
  <li>Prover uma estrutura para definir objetivos da qualidade.</li>
  <li>Incluir comprometimento com o atendimento aos requisitos aplicaveis.</li>
  <li>Incluir comprometimento com a melhoria continua do SGQ.</li>
</ol>

<p>Alem disso, a politica deve ser mantida como informacao documentada, comunicada e entendida na organizacao e disponivel para partes interessadas pertinentes.</p>

<div class="callout"><strong>Importante:</strong> Politicas genericas como "Buscamos a excelencia na satisfacao dos nossos clientes atraves da melhoria continua" nao agregam nada. Uma boa politica e especifica para a empresa, reflete seus valores reais e serve como guia para decisoes. Compare: "A MetalForte se compromete a entregar pecas usinadas dentro das tolerancias especificadas, no prazo acordado, buscando continuamente reduzir refugo e retrabalho, com respeito a seguranca dos colaboradores e ao meio ambiente."</div>

<h3>5.3 — Papeis, responsabilidades e autoridades</h3>

<p>A alta direcao deve assegurar que responsabilidades e autoridades estejam definidas, comunicadas e entendidas. Em particular, alguem precisa ter autoridade para:</p>

<ul>
  <li>Assegurar que o SGQ esteja conforme os requisitos da norma.</li>
  <li>Assegurar que os processos entreguem suas saidas pretendidas.</li>
  <li>Relatar o desempenho do SGQ e oportunidades de melhoria a alta direcao.</li>
  <li>Assegurar a promocao do foco no cliente na organizacao.</li>
  <li>Assegurar que a integridade do SGQ seja mantida quando mudancas forem planejadas.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Uma construtora definiu a seguinte estrutura: o Diretor Tecnico era responsavel pelo SGQ perante a alta direcao; cada Engenheiro de Obra era responsavel pela qualidade da sua obra; o Coordenador de Qualidade apoiava tecnicamente mas nao tinha "a culpa" quando algo dava errado. Essa clareza de papeis eliminou o classico problema de "a qualidade e problema do setor de qualidade".</div>

<h3>Como o auditor avalia a clausula 5</h3>

<p>O auditor normalmente:</p>

<ol>
  <li>Entrevista a alta direcao diretamente (isso e obrigatorio em auditorias de certificacao).</li>
  <li>Verifica se a direcao conhece a politica, os objetivos e o desempenho do SGQ.</li>
  <li>Procura evidencias de decisoes baseadas em dados de qualidade.</li>
  <li>Verifica se recursos foram alocados quando necessario.</li>
  <li>Checa se a analise critica foi conduzida com participacao real da direcao.</li>
</ol>

<div class="template-box"><span>Download: Modelo de politica da qualidade + checklist de lideranca</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 3 — Planejamento (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod3Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Planejamento', 'Clausula 6: riscos e oportunidades, objetivos da qualidade, planejamento de mudancas e caso pratico.', 3)
    RETURNING id
  `;
  const mod3 = mod3Rows[0].id;

  // --- Aula 3.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'riscos-oportunidades', 'Clausula 6.1 — Acoes para Abordar Riscos e Oportunidades', '30 min', 1, ${`
<h2>Clausula 6.1 — Acoes para Abordar Riscos e Oportunidades</h2>

<p>A gestao de riscos e a maior novidade conceitual da ISO 9001:2015. Ela substitui o antigo conceito de "acao preventiva" (que na pratica nunca funcionou bem) por algo muito mais natural e integrado: pensar em riscos e oportunidades como parte de qualquer decisao.</p>

<h3>O que a norma exige</h3>

<p>Ao planejar o SGQ, a organizacao deve considerar as questoes de contexto (4.1) e os requisitos das partes interessadas (4.2) e determinar riscos e oportunidades que precisam ser abordados para:</p>

<ul>
  <li>Assegurar que o SGQ alcance seus resultados pretendidos.</li>
  <li>Aumentar efeitos desejaveis (oportunidades).</li>
  <li>Prevenir ou reduzir efeitos indesejaveis (riscos).</li>
  <li>Alcancar melhoria.</li>
</ul>

<p>A organizacao deve planejar acoes para abordar esses riscos e oportunidades, integrar essas acoes nos processos do SGQ e avaliar a eficacia dessas acoes.</p>

<h3>Mentalidade de risco vs. gestao formal de riscos</h3>

<div class="callout"><strong>Importante:</strong> A norma NAO exige gestao formal de riscos (ISO 31000) nem metodologias especificas como FMEA. O que ela exige e a "mentalidade de risco" — que significa considerar riscos e oportunidades nas decisoes. Para uma micro/pequena empresa, isso pode ser tao simples quanto uma planilha com os principais riscos, probabilidade, impacto e acoes planejadas.</div>

<p>Dito isso, para organizacoes mais complexas, metodologias estruturadas agregam muito valor:</p>

<table>
  <tr><th>Metodologia</th><th>Indicada para</th><th>Complexidade</th></tr>
  <tr><td>Matriz de Probabilidade x Impacto</td><td>Qualquer porte</td><td>Baixa</td></tr>
  <tr><td>FMEA (Analise de Modos de Falha)</td><td>Processos produtivos criticos</td><td>Media-Alta</td></tr>
  <tr><td>HAZOP</td><td>Processos quimicos e alimenticios</td><td>Alta</td></tr>
  <tr><td>Bow-Tie</td><td>Riscos complexos com multiplas causas/consequencias</td><td>Media</td></tr>
  <tr><td>What-If</td><td>Analise rapida de cenarios</td><td>Baixa</td></tr>
</table>

<h3>Riscos tipicos por setor</h3>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong>
<ul>
  <li><strong>Risco:</strong> Materia-prima fora de especificacao do fornecedor — <strong>Acao:</strong> inspecao de recebimento com analise quimica amostral, qualificacao rigorosa de fornecedores.</li>
  <li><strong>Risco:</strong> Quebra de ferramenta de corte gerando peca nao conforme — <strong>Acao:</strong> programa de troca preventiva de ferramentas por vida util monitorada.</li>
  <li><strong>Oportunidade:</strong> Novo cliente do setor de energia eolica buscando fornecedores qualificados — <strong>Acao:</strong> adequar tolerancias e obter qualificacao especifica.</li>
</ul></div>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong>
<ul>
  <li><strong>Risco:</strong> Contaminacao cruzada na linha de producao — <strong>Acao:</strong> zoneamento, higienizacao validada, controle de alergenos.</li>
  <li><strong>Risco:</strong> Falta de energia eletrica comprometendo a cadeia de frio — <strong>Acao:</strong> gerador de emergencia com teste mensal.</li>
  <li><strong>Oportunidade:</strong> Demanda crescente por produtos sem gluten — <strong>Acao:</strong> desenvolver linha dedicada e buscar certificacao sem gluten.</li>
</ul></div>

<h3>Como estruturar a planilha de riscos</h3>

<p>Um formato pratico que funciona para a maioria das empresas:</p>

<table>
  <tr><th>Processo</th><th>Risco/Oportunidade</th><th>Tipo</th><th>Probabilidade</th><th>Impacto</th><th>Nivel</th><th>Acao</th><th>Responsavel</th><th>Prazo</th><th>Status</th></tr>
  <tr><td>Producao</td><td>Ferramenta quebrar durante corte</td><td>Risco</td><td>Media</td><td>Alto</td><td>Alto</td><td>Troca preventiva por hora-maquina</td><td>Sup. Producao</td><td>30/03</td><td>Implementado</td></tr>
</table>

<p>Use escala simples: probabilidade (Baixa/Media/Alta) x impacto (Baixo/Medio/Alto). Riscos com nivel alto exigem acao; riscos com nivel medio devem ser monitorados; riscos com nivel baixo sao aceitos com monitoramento periodico.</p>

<h3>Integracao com outros processos</h3>

<p>As acoes para riscos devem ser integradas nos processos operacionais, nao ficar numa planilha isolada. Se o risco e "fornecedor entregar material fora de especificacao", a acao (inspecao de recebimento) deve estar no processo de recebimento de materiais, nao apenas na planilha de riscos.</p>

<div class="template-box"><span>Download: Planilha de gestao de riscos e oportunidades</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'objetivos-qualidade', 'Clausula 6.2 — Objetivos da Qualidade', '30 min', 2, ${`
<h2>Clausula 6.2 — Objetivos da Qualidade e Planejamento para Alcanca-los</h2>

<p>Se a politica da qualidade e o "norte estrategico", os objetivos sao os "marcos no caminho". A clausula 6.2 exige que a organizacao estabeleca objetivos da qualidade em funcoes, niveis e processos pertinentes, e planeje como alcanca-los.</p>

<h3>Requisitos para os objetivos</h3>

<p>Os objetivos da qualidade devem ser:</p>

<ul>
  <li><strong>Coerentes com a politica da qualidade</strong> — se a politica fala em "entrega no prazo", deve haver um objetivo de pontualidade.</li>
  <li><strong>Mensuraveis</strong> — "melhorar a qualidade" nao e mensuravel; "reduzir o indice de refugo de 4% para 2% ate dezembro" e mensuravel.</li>
  <li><strong>Considerar requisitos aplicaveis</strong> — legais, do cliente, regulamentares.</li>
  <li><strong>Pertinentes para a conformidade</strong> de produtos/servicos e satisfacao do cliente.</li>
  <li><strong>Monitorados, comunicados e atualizados</strong> conforme apropriado.</li>
</ul>

<h3>Planejamento para alcancar os objetivos</h3>

<p>Para cada objetivo, a organizacao deve determinar:</p>

<table>
  <tr><th>Item</th><th>Pergunte</th><th>Exemplo</th></tr>
  <tr><td>O que sera feito</td><td>Quais acoes concretas?</td><td>Implantar controle estatistico de processo (CEP) na linha 2</td></tr>
  <tr><td>Recursos necessarios</td><td>Quanto custa? Quem faz?</td><td>Software CEP (R$ 8.000) + treinamento (16h)</td></tr>
  <tr><td>Responsavel</td><td>Quem responde pelo resultado?</td><td>Coordenador de Producao</td></tr>
  <tr><td>Prazo</td><td>Quando deve estar pronto?</td><td>Ate 30/06/2025</td></tr>
  <tr><td>Como avaliar resultados</td><td>Qual indicador vai medir?</td><td>Indice de refugo mensal (%)</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> A MetalForte definiu 5 objetivos da qualidade para 2025:
<ol>
  <li>Reduzir refugo de 3,8% para 2,5% (indicador: % de refugo mensal)</li>
  <li>Aumentar pontualidade de entrega de 88% para 95% (indicador: % de pedidos entregues no prazo)</li>
  <li>Reduzir reclamacoes de clientes de 12 para 6 por semestre (indicador: numero de reclamacoes)</li>
  <li>Treinar 100% dos operadores de CNC no novo procedimento de setup (indicador: % de operadores treinados)</li>
  <li>Obter nota minima de 85% na pesquisa de satisfacao anual (indicador: nota media da pesquisa)</li>
</ol>
Cada objetivo tinha plano de acao detalhado, responsavel e prazo. A analise era mensal na reuniao de indicadores.</div>

<h3>Erros comuns nos objetivos</h3>

<ul>
  <li><strong>Objetivos vagos:</strong> "Melhorar a qualidade" — sem meta numerica, sem prazo, impossivel avaliar.</li>
  <li><strong>Objetivos irrelevantes:</strong> "Reduzir consumo de papel no escritorio" — pode ser valido para gestao ambiental, mas nao e pertinente para o SGQ.</li>
  <li><strong>Objetivos inalcancaveis:</strong> "Zero defeitos" quando o indice atual e 5% — metas irrealistas desmotivam.</li>
  <li><strong>Objetivos sem plano de acao:</strong> definir a meta mas nao o caminho para chegar la.</li>
  <li><strong>Objetivos sem monitoramento:</strong> definir em janeiro e so verificar em dezembro.</li>
</ul>

<h3>Criterio SMART</h3>

<p>Uma referencia util (embora nao mencionada na norma) e o criterio SMART:</p>

<ul>
  <li><strong>S</strong>pecific (Especifico)</li>
  <li><strong>M</strong>easurable (Mensuravel)</li>
  <li><strong>A</strong>chievable (Alcancavel)</li>
  <li><strong>R</strong>elevant (Relevante)</li>
  <li><strong>T</strong>ime-bound (Com prazo)</li>
</ul>

<div class="callout"><strong>Importante:</strong> Os objetivos devem ser desdobrados para as funcoes e processos pertinentes. O objetivo corporativo de "reduzir refugo para 2,5%" pode se desdobrar em metas especificas por linha, por turno ou por produto. Quanto mais proximo do chao de fabrica, mais efetivo.</div>

<div class="template-box"><span>Download: Planilha de objetivos da qualidade com plano de acao 5W2H</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'planejamento-mudancas', 'Clausula 6.3 — Planejamento de Mudancas', '30 min', 3, ${`
<h2>Clausula 6.3 — Planejamento de Mudancas</h2>

<p>Mudancas sao inevitaveis. Novos clientes, novos produtos, mudancas de layout, troca de fornecedores, aquisicao de equipamentos, mudancas regulatorias — tudo isso impacta o SGQ. A clausula 6.3 exige que mudancas no SGQ sejam planejadas e controladas.</p>

<h3>O que a norma pede</h3>

<p>Quando a organizacao determina a necessidade de mudancas no SGQ, elas devem ser realizadas de maneira planejada, considerando:</p>

<ul>
  <li><strong>O proposito da mudanca</strong> e suas potenciais consequencias.</li>
  <li><strong>A integridade do SGQ</strong> — a mudanca nao pode "quebrar" o sistema.</li>
  <li><strong>A disponibilidade de recursos.</strong></li>
  <li><strong>A alocacao ou realocacao de responsabilidades e autoridades.</strong></li>
</ul>

<h3>Tipos de mudancas que afetam o SGQ</h3>

<table>
  <tr><th>Tipo de mudanca</th><th>Exemplo</th><th>Impacto no SGQ</th></tr>
  <tr><td>Mudanca de produto</td><td>Novo material em peca usinada</td><td>Pode exigir novo parametro de processo, novo controle</td></tr>
  <tr><td>Mudanca de processo</td><td>Troca de maquina CNC</td><td>Novo setup, validacao de processo, treinamento</td></tr>
  <tr><td>Mudanca de fornecedor</td><td>Trocar fornecedor de aco</td><td>Nova qualificacao, ajuste na inspecao de recebimento</td></tr>
  <tr><td>Mudanca organizacional</td><td>Fusao de setores</td><td>Novos responsaveis, revisao de processos</td></tr>
  <tr><td>Mudanca regulatoria</td><td>Nova norma tecnica</td><td>Adequacao de especificacoes e controles</td></tr>
  <tr><td>Mudanca de escopo</td><td>Incluir novo tipo de servico</td><td>Expansao do SGQ, novos processos</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Uma construtora decidiu trocar o sistema de formas de madeira por formas metalicas. Antes de implementar, o coordenador de qualidade mapeou os impactos: necessidade de treinamento das equipes (4 turmas de 8h), revisao da instrucao de trabalho de concretagem, novo fornecedor de formas a ser qualificado, novo item de inspecao na checklist de conferencia. A mudanca foi planejada em 3 fases ao longo de 2 meses, sem impacto na qualidade das obras em andamento.</div>

<h3>Processo de gestao de mudancas</h3>

<p>Um fluxo pratico para gestao de mudancas:</p>

<ol>
  <li><strong>Identificar a mudanca:</strong> o que vai mudar, por que e quando.</li>
  <li><strong>Avaliar impactos:</strong> quais processos, documentos, competencias e recursos sao afetados.</li>
  <li><strong>Planejar acoes:</strong> o que precisa ser feito antes, durante e depois da mudanca.</li>
  <li><strong>Aprovar:</strong> quem autoriza a mudanca (geralmente o dono do processo + coordenador de qualidade).</li>
  <li><strong>Implementar:</strong> executar as acoes planejadas.</li>
  <li><strong>Verificar:</strong> confirmar que a mudanca foi eficaz e nao gerou efeitos colaterais.</li>
</ol>

<div class="callout"><strong>Importante:</strong> Mudancas nao planejadas sao a maior fonte de nao conformidades em auditorias. O classico: a empresa troca de fornecedor de materia-prima "porque ficou mais barato" sem avaliar impacto na qualidade do produto final. Tres meses depois, as reclamacoes de clientes triplicam. Se a mudanca tivesse sido planejada conforme 6.3, o impacto teria sido avaliado antes.</div>

<h3>Conexao com a clausula 8.5.6</h3>

<p>A clausula 8.5.6 trata especificamente do controle de mudancas na producao/provisao de servicos. A logica e a mesma: qualquer mudanca na producao deve ser analisada, aprovada e verificada antes de ser liberada. A 6.3 e mais ampla (mudancas no SGQ como um todo) e a 8.5.6 e especifica para mudancas operacionais.</p>

<div class="example"><strong>Exemplo pratico — Cooperativa agricola:</strong> A cooperativa decidiu ampliar a capacidade de secagem de graos, instalando um novo secador com tecnologia diferente da existente. O plano de mudanca incluiu: treinamento de 3 operadores no novo equipamento, revisao da instrucao de operacao, definicao de novos parametros de temperatura e umidade, periodo de operacao assistida de 30 dias com monitoramento intensivo, e validacao do produto final (graos secos conforme padrao). A mudanca foi bem-sucedida sem perdas de qualidade.</div>

<div class="template-box"><span>Download: Formulario de gestao de mudancas</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'caso-pratico-planejamento', 'Caso Pratico — Planejamento do SGQ numa Metalurgica', '30 min', 4, ${`
<h2>Caso Pratico — Planejamento Completo do SGQ</h2>

<p>Vamos consolidar tudo que vimos nas clausulas 4, 5 e 6 com um caso pratico completo. Acompanhe a jornada da <strong>UsinaMax Ltda.</strong>, uma metalurgica ficticia (mas baseada em casos reais) que decidiu implantar a ISO 9001:2015.</p>

<h3>Perfil da empresa</h3>

<ul>
  <li><strong>Razao social:</strong> UsinaMax Usinagem de Precisao Ltda.</li>
  <li><strong>Localizacao:</strong> Caxias do Sul - RS</li>
  <li><strong>Funcionarios:</strong> 62</li>
  <li><strong>Faturamento anual:</strong> R$ 12 milhoes</li>
  <li><strong>Produtos:</strong> pecas usinadas em aco carbono e inox para industria automotiva e de maquinas agricolas</li>
  <li><strong>Parque industrial:</strong> 8 tornos CNC, 3 centros de usinagem, 1 retifica, setor de metrologia</li>
</ul>

<h3>Passo 1 — Analise de contexto (clausula 4.1)</h3>

<p>O comite de implantacao (diretoria + gerentes + coordenador de qualidade) realizou uma analise SWOT:</p>

<table>
  <tr><th>Forcas</th><th>Fraquezas</th></tr>
  <tr><td>Parque de maquinas moderno (CNC 5 eixos)</td><td>Alta rotatividade de operadores (turnover 30%)</td></tr>
  <tr><td>Laboratorio de metrologia proprio</td><td>Sem sistema ERP integrado</td></tr>
  <tr><td>20 anos de experiencia no mercado</td><td>Dependencia de 3 clientes (70% do faturamento)</td></tr>
  <tr><td>Localizacao no polo metal-mecanico</td><td>Documentacao informal (muito conhecimento "na cabeca")</td></tr>
</table>

<table>
  <tr><th>Oportunidades</th><th>Ameacas</th></tr>
  <tr><td>Setor de energia eolica buscando fornecedores</td><td>Concorrencia de importados chineses</td></tr>
  <tr><td>Demanda crescente por pecas de alta precisao</td><td>Escassez de operadores CNC qualificados</td></tr>
  <tr><td>Industria 4.0 — integracao com sistemas dos clientes</td><td>Variacao cambial no custo de ferramental importado</td></tr>
</table>

<h3>Passo 2 — Partes interessadas (clausula 4.2)</h3>

<p>Foram identificadas 7 partes interessadas pertinentes:</p>

<ol>
  <li><strong>Clientes (montadoras + fabricantes de maquinas):</strong> pecas conforme especificacao, prazo, CPK minimo, certificados de material.</li>
  <li><strong>Colaboradores:</strong> salario competitivo, seguranca, treinamento, perspectiva de crescimento.</li>
  <li><strong>Fornecedores de materia-prima:</strong> previsao de demanda, pagamento em dia.</li>
  <li><strong>Socios:</strong> rentabilidade minima de 10%, crescimento sustentavel.</li>
  <li><strong>Organismos reguladores (MTE, FEPAM):</strong> conformidade com NRs e licenca ambiental.</li>
  <li><strong>Comunidade:</strong> baixo impacto de ruido (fabrica fica em zona mista).</li>
  <li><strong>Organismo certificador:</strong> atendimento aos requisitos ISO 9001.</li>
</ol>

<h3>Passo 3 — Escopo (clausula 4.3)</h3>

<p>"O SGQ da UsinaMax abrange a usinagem de precisao de pecas em aco carbono e inoxidavel para os setores automotivo e de maquinas agricolas, incluindo programacao CNC, usinagem, tratamento termico (terceirizado com controle) e inspecao final, realizados na unidade de Caxias do Sul - RS."</p>

<p>Clausula 8.3 (Projeto) declarada nao aplicavel — a empresa fabrica conforme especificacao/desenho do cliente, sem desenvolver produtos proprios.</p>

<h3>Passo 4 — Mapa de processos (clausula 4.4)</h3>

<p>12 processos mapeados:</p>

<ul>
  <li><strong>Gestao:</strong> Planejamento Estrategico, Gestao da Qualidade</li>
  <li><strong>Core:</strong> Vendas/Orcamento, Programacao CNC, Usinagem, Inspecao/Metrologia, Expedicao</li>
  <li><strong>Apoio:</strong> Compras, Almoxarifado, Manutencao, Gestao de Pessoas, Controle de Terceirizados</li>
</ul>

<h3>Passo 5 — Politica da qualidade (clausula 5.2)</h3>

<p>"A UsinaMax se compromete a fornecer pecas usinadas dentro das tolerancias especificadas, no prazo acordado, buscando continuamente a reducao de retrabalho e refugo. Investimos na qualificacao dos nossos colaboradores e na modernizacao do nosso parque fabril para atender e superar as expectativas dos nossos clientes. Estamos comprometidos com a melhoria continua do nosso Sistema de Gestao da Qualidade e com o atendimento aos requisitos legais e regulamentares aplicaveis."</p>

<h3>Passo 6 — Riscos e oportunidades (clausula 6.1)</h3>

<p>Os 5 riscos mais criticos identificados e suas acoes:</p>

<ol>
  <li><strong>Perda de operadores qualificados</strong> (probabilidade alta, impacto alto): programa de retencao + escola interna de CNC.</li>
  <li><strong>Materia-prima fora de especificacao</strong> (media, alto): inspecao de recebimento com analise quimica + dupla fonte aprovada.</li>
  <li><strong>Falha em maquina CNC critica</strong> (media, alto): manutencao preventiva + contrato de manutencao corretiva com SLA 24h.</li>
  <li><strong>Perda de cliente grande</strong> (baixa, muito alto): diversificacao de carteira — meta de nenhum cliente > 35% do faturamento.</li>
  <li><strong>Requisito de cliente nao entendido</strong> (media, medio): revisao critica de contrato documentada para todo pedido novo.</li>
</ol>

<h3>Passo 7 — Objetivos da qualidade (clausula 6.2)</h3>

<table>
  <tr><th>Objetivo</th><th>Meta</th><th>Indicador</th><th>Responsavel</th></tr>
  <tr><td>Reduzir refugo</td><td>De 4,2% para 2,5%</td><td>% refugo mensal</td><td>Gerente Industrial</td></tr>
  <tr><td>Melhorar pontualidade</td><td>De 86% para 95%</td><td>% pedidos no prazo</td><td>PCP</td></tr>
  <tr><td>Reduzir reclamacoes</td><td>De 15 para 8/semestre</td><td>Nr. reclamacoes</td><td>Qualidade</td></tr>
  <tr><td>Capacitar equipe</td><td>40h/funcionario/ano</td><td>Horas treinamento</td><td>RH</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> Observe como cada passo se conecta ao anterior. O contexto revela a escassez de mao de obra, que vira risco, que vira objetivo de treinamento. A dependencia de poucos clientes aparece na SWOT, vira risco e vira acao estrategica de diversificacao. Isso e a norma funcionando como sistema integrado — nao como lista de requisitos isolados.</div>

<div class="template-box"><span>Download: Kit completo de planejamento do SGQ (contexto + partes interessadas + riscos + objetivos)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 4 — Apoio e Operacao (2.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod4Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Apoio e Operacao', 'Clausulas 7 e 8: recursos, competencia, informacao documentada, controle operacional, fornecedores e producao.', 4)
    RETURNING id
  `;
  const mod4 = mod4Rows[0].id;

  // --- Aula 4.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'recursos-competencia', 'Clausula 7 — Recursos, Competencia e Conscientizacao', '40 min', 1, ${`
<h2>Clausula 7 — Apoio: Recursos, Competencia e Conscientizacao</h2>

<p>A clausula 7 trata de tudo que a organizacao precisa disponibilizar para que o SGQ funcione: pessoas, infraestrutura, ambiente, recursos de monitoramento, conhecimento organizacional, competencia, conscientizacao e comunicacao.</p>

<h3>7.1 — Recursos</h3>

<h3>7.1.1 — Generalidades</h3>

<p>A organizacao deve determinar e prover os recursos necessarios para o SGQ. Isso inclui considerar as capacidades e restricoes dos recursos internos existentes e o que precisa ser obtido de provedores externos.</p>

<h3>7.1.2 — Pessoas</h3>

<p>A organizacao deve determinar e prover as pessoas necessarias para a implementacao eficaz do SGQ e para a operacao e controle de seus processos. Na pratica: voce tem gente suficiente e qualificada para fazer o que precisa ser feito?</p>

<h3>7.1.3 — Infraestrutura</h3>

<p>Edificios, utilidades, equipamentos (hardware e software), transporte, tecnologia da informacao e comunicacao. A infraestrutura deve ser determinada, provida e mantida.</p>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> Um torno CNC que quebra frequentemente e gera pecas fora de tolerancia e um problema de infraestrutura. A norma exige que a empresa identifique a infraestrutura necessaria para a conformidade dos produtos e a mantenha — o que se traduz em programas de manutencao preventiva, calibracao de maquinas e atualizacao de software CAM.</div>

<h3>7.1.4 — Ambiente para a operacao de processos</h3>

<p>Combinacao de fatores humanos e fisicos: temperatura, umidade, iluminacao, fluxo de ar, higiene, ruido, mas tambem fatores psicologicos como estresse, burnout, conflitos. A organizacao deve determinar, prover e manter o ambiente necessario.</p>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong> A sala de embalagem precisa de temperatura controlada (max. 15 graus C), pressao positiva (evitar entrada de contaminantes), iluminacao adequada para inspecao visual e operadores sem estresse excessivo (para nao cometerem erros de rotulagem). Tudo isso e "ambiente para operacao de processos".</div>

<h3>7.1.5 — Recursos de monitoramento e medicao</h3>

<p>Quando monitoramento ou medicao e usado para verificar a conformidade de produtos/servicos, a organizacao deve assegurar que os recursos sejam adequados e mantidos. Isso inclui a famosa <strong>calibracao</strong>.</p>

<p>Quando a rastreabilidade de medicao e um requisito (legal, do cliente ou definido pela organizacao), os instrumentos de medicao devem ser:</p>

<ul>
  <li>Calibrados ou verificados em intervalos especificados, contra padroes rastreaveis.</li>
  <li>Identificados quanto a sua situacao de calibracao.</li>
  <li>Protegidos contra ajustes, danos ou deterioracao que invalidem a calibracao.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A calibracao e um dos itens mais auditados. O auditor vai ao chao de fabrica, pega um paquimetro da bancada do operador e verifica: esta identificado? A etiqueta de calibracao esta valida? Onde esta o certificado de calibracao? Se o instrumento estiver com calibracao vencida e estiver sendo usado para inspecao de produto, e nao conformidade imediata.</div>

<h3>7.1.6 — Conhecimento organizacional</h3>

<p>Novidade da versao 2015. A organizacao deve determinar o conhecimento necessario para a operacao de seus processos e para alcancar conformidade. Esse conhecimento deve ser mantido e disponibilizado na extensao necessaria.</p>

<p>Na pratica, isso trata do problema do "conhecimento na cabeca das pessoas". Se o unico operador que sabe programar uma maquina especifica sair da empresa, o que acontece?</p>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Um mestre de obra com 30 anos de experiencia sabia "de cabeca" a dosagem ideal de concreto para cada tipo de obra. Quando ele se aposentou, a empresa teve problemas serios de qualidade por 3 meses ate treinar um substituto. Isso e falha na gestao do conhecimento organizacional. A acao: documentar as dosagens, criar um banco de dados de licoes aprendidas e implantar programa de mentoria entre mestres experientes e novos.</div>

<h3>7.2 — Competencia</h3>

<p>A organizacao deve determinar a competencia necessaria para cada funcao que afeta o desempenho da qualidade, assegurar que as pessoas sejam competentes (educacao, treinamento ou experiencia), tomar acoes para adquirir competencia (quando necessario) e reter informacao documentada como evidencia.</p>

<p>Na pratica, isso se traduz em:</p>

<ul>
  <li><strong>Matriz de competencias:</strong> para cada funcao, quais competencias sao necessarias.</li>
  <li><strong>Avaliacao de competencias:</strong> cada pessoa atende aos requisitos da sua funcao?</li>
  <li><strong>Plano de treinamento:</strong> para fechar as lacunas identificadas.</li>
  <li><strong>Registros:</strong> certificados, listas de presenca, avaliacoes de eficacia.</li>
</ul>

<h3>7.3 — Conscientizacao</h3>

<p>As pessoas que trabalham sob o controle da organizacao devem estar conscientes da politica da qualidade, dos objetivos pertinentes, da sua contribuicao para o SGQ e das consequencias de nao atender os requisitos. Nao basta treinar — a pessoa precisa entender o "por que".</p>

<h3>7.4 — Comunicacao</h3>

<p>A organizacao deve determinar as comunicacoes internas e externas pertinentes ao SGQ: o que comunicar, quando, para quem, como e quem comunica. Um quadro de gestao a vista no chao de fabrica com indicadores atualizados e um exemplo simples e eficaz de comunicacao do SGQ.</p>

<div class="template-box"><span>Download: Matriz de competencias + plano de treinamento anual</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'informacao-documentada', 'Clausula 7.5 — Informacao Documentada', '30 min', 2, ${`
<h2>Clausula 7.5 — Informacao Documentada</h2>

<p>A informacao documentada e o "esqueleto" do SGQ. E tudo aquilo que precisa ser registrado, controlado e mantido acessivel. Na versao 2015, esse conceito ficou muito mais flexivel — e isso e uma grande vantagem, se bem utilizado.</p>

<h3>O que mudou em relacao a versao 2008</h3>

<p>Na versao 2008, existiam tres termos distintos: "documento", "registro" e "procedimento documentado" (6 obrigatorios). Na versao 2015, tudo foi unificado sob o termo <strong>informacao documentada</strong>. A norma usa dois verbos para diferenciar:</p>

<ul>
  <li><strong>"Manter" informacao documentada:</strong> equivale ao antigo "documento" — algo que voce atualiza (politica, procedimento, instrucao de trabalho).</li>
  <li><strong>"Reter" informacao documentada:</strong> equivale ao antigo "registro" — evidencia de que algo foi feito (relatorio de inspecao, ata de reuniao, certificado de calibracao).</li>
</ul>

<h3>O que a norma obriga a documentar</h3>

<p>A ISO 9001:2015 exige informacao documentada em pontos especificos. Aqui esta a lista completa:</p>

<table>
  <tr><th>Clausula</th><th>Tipo</th><th>O que documentar</th></tr>
  <tr><td>4.3</td><td>Manter</td><td>Escopo do SGQ</td></tr>
  <tr><td>4.4</td><td>Manter</td><td>Informacao para apoiar a operacao dos processos</td></tr>
  <tr><td>4.4</td><td>Reter</td><td>Confianca de que os processos sao realizados conforme planejado</td></tr>
  <tr><td>5.2</td><td>Manter</td><td>Politica da qualidade</td></tr>
  <tr><td>6.2</td><td>Manter</td><td>Objetivos da qualidade</td></tr>
  <tr><td>7.1.5</td><td>Reter</td><td>Adequacao dos recursos de monitoramento e medicao</td></tr>
  <tr><td>7.2</td><td>Reter</td><td>Evidencia de competencia</td></tr>
  <tr><td>8.1</td><td>Manter/Reter</td><td>Planejamento e controle operacional</td></tr>
  <tr><td>8.2.3</td><td>Reter</td><td>Resultados da analise critica de requisitos</td></tr>
  <tr><td>8.4</td><td>Reter</td><td>Avaliacao, selecao e monitoramento de fornecedores</td></tr>
  <tr><td>8.5.2</td><td>Reter</td><td>Identificacao e rastreabilidade</td></tr>
  <tr><td>8.5.6</td><td>Reter</td><td>Controle de mudancas na producao</td></tr>
  <tr><td>8.6</td><td>Reter</td><td>Liberacao de produtos e servicos</td></tr>
  <tr><td>8.7</td><td>Reter</td><td>Controle de saidas nao conformes</td></tr>
  <tr><td>9.1.1</td><td>Reter</td><td>Resultados de monitoramento e medicao</td></tr>
  <tr><td>9.2</td><td>Reter</td><td>Programa e resultados de auditoria interna</td></tr>
  <tr><td>9.3</td><td>Reter</td><td>Resultados da analise critica pela direcao</td></tr>
  <tr><td>10.2</td><td>Reter</td><td>Nao conformidades e acoes corretivas</td></tr>
</table>

<h3>Controle de informacao documentada (7.5.3)</h3>

<p>A informacao documentada deve ser controlada para assegurar que esteja:</p>

<ul>
  <li><strong>Disponivel e adequada</strong> para uso, onde e quando necessario.</li>
  <li><strong>Protegida</strong> contra perda de confidencialidade, uso indevido ou perda de integridade.</li>
</ul>

<p>O controle inclui: distribuicao, acesso, recuperacao, armazenamento, preservacao (incluindo legibilidade), controle de mudancas e retencao/disposicao.</p>

<div class="callout"><strong>Importante:</strong> Nao existe mais obrigacao de ter um "procedimento de controle de documentos" formal. Porem, a organizacao precisa demonstrar que controla sua informacao documentada de alguma forma. Um sistema eletronico com controle de versao e permissoes de acesso atende perfeitamente. Uma pasta de rede com pasta "VIGENTE" e "OBSOLETO" tambem pode funcionar para empresas menores.</div>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> A UsinaMax migrou de documentos Word impressos (com carimbo "copia controlada") para um sistema digital. Todos os documentos ficam no SharePoint com controle de versao automatico, aprovacao por workflow e acesso restrito por funcao. Os operadores acessam instrucoes de trabalho em tablets no chao de fabrica — sempre a versao vigente, sem risco de usar documento obsoleto. Custo: R$ 0 (ja tinham licenca Microsoft 365).</div>

<h3>Quanto documentar?</h3>

<p>A norma da liberdade, mas isso nao significa "nao documentar nada". A regra pratica:</p>

<ul>
  <li>Documente tudo que a norma exige (tabela acima).</li>
  <li>Documente processos onde o erro tem alto impacto (instrucoes de trabalho criticas).</li>
  <li>Documente o que precisa ser consistente entre turnos/pessoas.</li>
  <li>NAO documente o que e obvio para profissionais qualificados.</li>
</ul>

<div class="template-box"><span>Download: Lista mestra de informacao documentada + template de controle</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'operacao-requisitos', 'Clausula 8.1 a 8.4 — Planejamento Operacional e Fornecedores', '40 min', 3, ${`
<h2>Clausula 8 — Operacao (Parte 1: Planejamento, Requisitos e Fornecedores)</h2>

<p>A clausula 8 e a mais extensa da norma e cobre toda a operacao — desde a determinacao dos requisitos do produto/servico ate a entrega e pos-entrega. E aqui que "a borracha encontra o asfalto".</p>

<h3>8.1 — Planejamento e controle operacional</h3>

<p>A organizacao deve planejar, implementar e controlar os processos necessarios para atender aos requisitos de provisao de produtos e servicos. Isso inclui:</p>

<ul>
  <li>Determinar requisitos de produtos/servicos.</li>
  <li>Estabelecer criterios para processos e aceitacao.</li>
  <li>Determinar recursos necessarios.</li>
  <li>Implementar controle dos processos.</li>
  <li>Manter e reter informacao documentada.</li>
</ul>

<p>Na pratica, isso se traduz em planos de producao, ordens de servico, fichas de processo, planos de controle — documentos que definem COMO a operacao deve ser executada e controlada.</p>

<h3>8.2 — Requisitos para produtos e servicos</h3>

<h3>8.2.1 — Comunicacao com o cliente</h3>

<p>A comunicacao deve incluir: informacoes sobre produtos/servicos, consultas/contratos/pedidos (incluindo mudancas), retroalimentacao do cliente (incluindo reclamacoes), propriedade do cliente e requisitos de contingencia.</p>

<h3>8.2.2 — Determinacao de requisitos</h3>

<p>Ao determinar os requisitos, a organizacao deve assegurar que:</p>

<ul>
  <li>Requisitos do produto/servico estejam definidos (incluindo legais e regulamentares).</li>
  <li>A organizacao pode atender as declaracoes feitas sobre o que oferece.</li>
</ul>

<h3>8.2.3 — Analise critica dos requisitos</h3>

<p>Antes de se comprometer a fornecer, a organizacao deve fazer uma analise critica para assegurar que tem capacidade de atender. Essa analise deve cobrir: requisitos especificados pelo cliente, requisitos nao declarados mas necessarios, requisitos legais e requisitos da propria organizacao.</p>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> Um cliente envia desenho de uma peca com tolerancia de 0,005mm. Antes de aceitar o pedido, o setor tecnico analisa: temos maquina capaz dessa tolerancia? O material esta disponivel? O prazo e viavel? Ha requisitos especiais (tratamento termico, revestimento)? Essa e a analise critica de requisitos. Se for aprovada, gera-se a ordem de producao. Se houver divergencia, negocia-se com o cliente ANTES de aceitar.</div>

<div class="callout"><strong>Importante:</strong> Um erro classico: aceitar o pedido do cliente sem analise critica ("o vendedor prometeu, agora a producao se vira"). Isso gera atraso, retrabalho e insatisfacao. A analise critica evita que a empresa se comprometa com algo que nao pode entregar.</div>

<h3>8.4 — Controle de processos, produtos e servicos providos externamente</h3>

<p>Em linguagem simples: gestao de fornecedores e terceirizados. A norma exige que a organizacao controle processos, produtos e servicos de fornecedores externos quando:</p>

<ul>
  <li>Sao incorporados nos proprios produtos/servicos.</li>
  <li>Sao fornecidos diretamente ao cliente em nome da organizacao.</li>
  <li>Um processo e fornecido externamente por decisao da organizacao.</li>
</ul>

<h3>8.4.1 — Criterios de avaliacao, selecao e monitoramento</h3>

<p>A organizacao deve definir criterios para avaliar, selecionar, monitorar e reavaliar fornecedores. Os criterios tipicos:</p>

<table>
  <tr><th>Criterio</th><th>O que avaliar</th><th>Evidencia</th></tr>
  <tr><td>Qualidade</td><td>Historico de nao conformidades, certificacoes</td><td>IQF (Indice de Qualidade do Fornecedor), % rejeicao</td></tr>
  <tr><td>Prazo</td><td>Pontualidade de entrega</td><td>% entregas no prazo</td></tr>
  <tr><td>Capacidade tecnica</td><td>Parque de maquinas, equipe tecnica</td><td>Auditoria de segunda parte, questionario</td></tr>
  <tr><td>Preco</td><td>Competitividade, estabilidade</td><td>Comparativo de mercado</td></tr>
  <tr><td>Atendimento</td><td>Responsividade, resolucao de problemas</td><td>Avaliacao qualitativa</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Uma construtora classifica seus fornecedores em tres categorias: A (aprovado sem restricao), B (aprovado com monitoramento intensificado) e C (reprovado/suspenso). A avaliacao e semestral, baseada em: qualidade do material entregue (40%), pontualidade (30%), preco (15%) e atendimento (15%). Fornecedores com nota abaixo de 60 sao suspensos. Fornecedores de materiais criticos (concreto, aco) passam por auditoria de segunda parte antes da aprovacao.</div>

<h3>8.4.2 — Tipo e extensao do controle</h3>

<p>O nivel de controle sobre o fornecedor deve ser proporcional ao impacto do produto/servico fornecido na conformidade do produto final. Um fornecedor de canetas para o escritorio nao precisa do mesmo nivel de controle que um fornecedor de materia-prima critica.</p>

<h3>8.4.3 — Informacao para provedores externos</h3>

<p>A organizacao deve comunicar claramente ao fornecedor: requisitos do produto/servico, metodos e processos, requisitos de aprovacao, competencia necessaria, interacoes com o SGQ da organizacao e controle/monitoramento que sera aplicado.</p>

<div class="template-box"><span>Download: Formulario de avaliacao de fornecedores + lista de fornecedores aprovados</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'producao-liberacao', 'Clausula 8.5 a 8.7 — Producao, Liberacao e Controle de Nao Conformes', '40 min', 4, ${`
<h2>Clausula 8 — Operacao (Parte 2: Producao, Liberacao e Saidas Nao Conformes)</h2>

<h3>8.5 — Producao e provisao de servico</h3>

<h3>8.5.1 — Controle de producao e provisao de servico</h3>

<p>A producao deve ser realizada sob condicoes controladas, incluindo:</p>

<ul>
  <li>Disponibilidade de informacao documentada que defina as caracteristicas do produto e as atividades a serem realizadas.</li>
  <li>Disponibilidade e uso de recursos de monitoramento e medicao adequados.</li>
  <li>Implementacao de atividades de monitoramento e medicao em estagios apropriados.</li>
  <li>Uso de infraestrutura e ambiente adequados.</li>
  <li>Designacao de pessoas competentes.</li>
  <li>Validacao (e revalidacao periodica) de processos cuja saida nao possa ser verificada por monitoramento/medicao subsequente.</li>
  <li>Implementacao de acoes para prevenir erro humano.</li>
  <li>Implementacao de atividades de liberacao, entrega e pos-entrega.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> Na linha de usinagem, "condicoes controladas" significa: (1) programa CNC validado e bloqueado (sem edicao pelo operador), (2) instrucao de trabalho visual na estacao com sequencia de operacoes, (3) paquimetro e micrometro calibrados disponiveis, (4) medicao a cada 10 pecas conforme plano de controle, (5) operador treinado e qualificado para aquela operacao, (6) ficha de setup preenchida antes de iniciar o lote.</div>

<h3>8.5.1 f — Validacao de processos especiais</h3>

<div class="callout"><strong>Importante:</strong> Processos "especiais" sao aqueles cujo resultado nao pode ser verificado por inspecao depois. Exemplos classicos: solda, tratamento termico, pintura, colagem, pasteurizacao. Nesses processos, voce precisa VALIDAR o processo (provar que ele e capaz de produzir resultados conformes) e controlar os parametros durante a execucao, porque depois nao ha como verificar 100% sem destruir o produto.</div>

<h3>8.5.2 — Identificacao e rastreabilidade</h3>

<p>A organizacao deve usar meios adequados para identificar as saidas dos processos e identificar o status de monitoramento/medicao (aprovado, reprovado, em analise). Quando a rastreabilidade for um requisito, a organizacao deve controlar a identificacao unica das saidas e reter informacao documentada.</p>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong> Cada lote de producao recebe um codigo unico (ex: EMB-2025-0342) que permite rastrear: quais materias-primas foram usadas (lote do fornecedor), qual linha de producao, qual turno, quais parametros de processo (temperatura, tempo), quais resultados de analise e para quais clientes o lote foi enviado. Se houver um recall, a empresa consegue identificar em minutos todos os clientes afetados.</div>

<h3>8.5.3 — Propriedade pertencente a clientes ou provedores externos</h3>

<p>Se a organizacao usa algo que pertence ao cliente ou ao fornecedor (materia-prima do cliente, ferramental, propriedade intelectual, dados pessoais), deve identificar, verificar, proteger e salvaguardar essa propriedade. Se algo for perdido, danificado ou inadequado, deve comunicar ao proprietario e reter registros.</p>

<h3>8.5.4 — Preservacao</h3>

<p>A organizacao deve preservar as saidas durante producao e provisao de servico, na extensao necessaria para assegurar conformidade. Isso inclui identificacao, manuseio, embalagem, armazenamento e protecao.</p>

<h3>8.5.5 — Atividades pos-entrega</h3>

<p>Quando aplicavel: garantia, assistencia tecnica, manutencao, reciclagem, disposicao final. Deve considerar requisitos legais, consequencias potenciais, vida util, requisitos do cliente e retroalimentacao.</p>

<h3>8.5.6 — Controle de mudancas</h3>

<p>Mudancas na producao devem ser analisadas criticamente e controladas para assegurar continuidade da conformidade. Reter informacao documentada descrevendo os resultados da analise, as pessoas que autorizaram e as acoes tomadas.</p>

<h3>8.6 — Liberacao de produtos e servicos</h3>

<p>A organizacao deve implementar arranjos planejados para verificar que os requisitos foram atendidos. A liberacao nao deve prosseguir ate que os arranjos planejados tenham sido satisfatoriamente concluidos, a menos que aprovado por autoridade pertinente (e pelo cliente, quando aplicavel).</p>

<p>A informacao documentada de liberacao deve incluir: evidencia de conformidade com criterios de aceitacao e rastreabilidade a quem autorizou a liberacao.</p>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Antes de concretar uma laje, o engenheiro confere: armadura conforme projeto (inspecao visual + medicao), formas niveladas e estanques, escoramentos verificados, concreto testado (slump test no recebimento). So apos todas as verificacoes estarem OK e o engenheiro assinar a checklist, a concretagem e liberada. Esse e o processo de liberacao — e se nao for seguido, os riscos estruturais sao gravissimos.</div>

<h3>8.7 — Controle de saidas nao conformes</h3>

<p>Quando uma saida nao atende aos requisitos, a organizacao deve assegurar que seja identificada e controlada para prevenir uso ou entrega nao intencional. As disposicoes possiveis:</p>

<ul>
  <li><strong>Correcao:</strong> retrabalhar ou reparar para tornar conforme.</li>
  <li><strong>Segregacao, contencao, retorno ou suspensao:</strong> impedir que o produto nao conforme siga adiante.</li>
  <li><strong>Informar o cliente.</strong></li>
  <li><strong>Obter autorizacao de aceitacao sob concessao:</strong> o cliente aceita o produto mesmo fora da especificacao.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A segregacao e identificacao de produto nao conforme e critica. Pecas rejeitadas devem ir para uma area identificada (caixa vermelha, prateleira demarcada) para que ninguem as use por engano. Misturar pecas boas com ruins e um dos erros mais graves que pode ocorrer numa operacao.</div>

<div class="template-box"><span>Download: Plano de controle de producao + formulario de produto nao conforme</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 5 — Avaliacao e Melhoria (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod5Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Avaliacao e Melhoria', 'Clausulas 9 e 10: monitoramento, auditoria interna, analise critica, nao conformidade, acao corretiva e melhoria continua.', 5)
    RETURNING id
  `;
  const mod5 = mod5Rows[0].id;

  // --- Aula 5.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'monitoramento-medicao', 'Clausula 9.1 — Monitoramento, Medicao, Analise e Avaliacao', '30 min', 1, ${`
<h2>Clausula 9.1 — Monitoramento, Medicao, Analise e Avaliacao</h2>

<p>A clausula 9 marca a transicao do "fazer" para o "verificar" no ciclo PDCA. De nada adianta ter processos bem planejados e executados se voce nao mede os resultados. A clausula 9.1 trata exatamente disso: como monitorar, medir, analisar e avaliar o desempenho do SGQ.</p>

<h3>9.1.1 — Generalidades</h3>

<p>A organizacao deve determinar:</p>

<ul>
  <li><strong>O que</strong> precisa ser monitorado e medido.</li>
  <li><strong>Os metodos</strong> de monitoramento, medicao, analise e avaliacao.</li>
  <li><strong>Quando</strong> monitorar e medir.</li>
  <li><strong>Quando</strong> analisar e avaliar os resultados.</li>
</ul>

<p>Alem disso, deve avaliar o desempenho e a eficacia do SGQ e reter informacao documentada como evidencia dos resultados.</p>

<h3>Indicadores-chave (KPIs) do SGQ</h3>

<p>Embora a norma nao liste indicadores especificos, a pratica mostra que toda organizacao precisa de um conjunto minimo de indicadores:</p>

<table>
  <tr><th>Categoria</th><th>Indicador</th><th>Formula tipica</th><th>Frequencia</th></tr>
  <tr><td>Qualidade</td><td>Indice de refugo</td><td>(Pecas refugadas / total produzido) x 100</td><td>Mensal</td></tr>
  <tr><td>Qualidade</td><td>Indice de retrabalho</td><td>(Pecas retrabalhadas / total produzido) x 100</td><td>Mensal</td></tr>
  <tr><td>Cliente</td><td>Reclamacoes de clientes</td><td>Numero absoluto ou por volume vendido</td><td>Mensal</td></tr>
  <tr><td>Cliente</td><td>Satisfacao do cliente</td><td>Nota media da pesquisa (0-100)</td><td>Semestral/Anual</td></tr>
  <tr><td>Entrega</td><td>Pontualidade de entrega</td><td>(Pedidos no prazo / total de pedidos) x 100</td><td>Mensal</td></tr>
  <tr><td>Processo</td><td>Eficiencia operacional (OEE)</td><td>Disponibilidade x Performance x Qualidade</td><td>Mensal</td></tr>
  <tr><td>Fornecedor</td><td>IQF</td><td>Media ponderada (qualidade, prazo, atendimento)</td><td>Trimestral</td></tr>
  <tr><td>SGQ</td><td>Fechamento de nao conformidades</td><td>% NCs fechadas no prazo</td><td>Mensal</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Industria alimenticia:</strong> Uma fabrica de laticinios monitora diariamente: temperatura de pasteurizacao (registro automatico a cada 30 segundos), pH do produto, peso liquido da embalagem (controle estatistico), contagem microbiologica (amostragem por lote). Mensalmente consolida: % de lotes aprovados em primeira inspecao, numero de reclamacoes, volume de descarte por vencimento. Esses dados alimentam a analise critica trimestral.</div>

<h3>9.1.2 — Satisfacao do cliente</h3>

<p>A organizacao deve monitorar a percepcao dos clientes sobre o grau em que suas necessidades e expectativas foram atendidas. A norma pede que a organizacao determine os metodos para obter, monitorar e analisar criticamente essa informacao.</p>

<p>Metodos comuns:</p>

<ul>
  <li><strong>Pesquisa de satisfacao:</strong> questionario estruturado (anual ou semestral).</li>
  <li><strong>Analise de reclamacoes:</strong> tendencia, classificacao, tempo de resposta.</li>
  <li><strong>Indicadores de desempenho do cliente:</strong> scorecards que o proprio cliente envia.</li>
  <li><strong>Dados de mercado:</strong> participacao de mercado, taxas de retencao, novos clientes.</li>
  <li><strong>Entrevistas/visitas:</strong> contato direto para entender percepcoes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A ausencia de reclamacoes NAO e evidencia de satisfacao. O auditor vai questionar: "Alem de esperar reclamacoes, o que voces fazem ativamente para medir a satisfacao?" Se a resposta for "nada", e um achado. Busque a informacao — nao espere ela chegar.</div>

<h3>9.1.3 — Analise e avaliacao</h3>

<p>A organizacao deve analisar e avaliar dados e informacoes apropriados. Os resultados da analise devem ser usados para avaliar:</p>

<ul>
  <li>Conformidade de produtos e servicos.</li>
  <li>Grau de satisfacao do cliente.</li>
  <li>Desempenho e eficacia do SGQ.</li>
  <li>Se o planejamento foi implementado eficazmente.</li>
  <li>Eficacia das acoes para abordar riscos e oportunidades.</li>
  <li>Desempenho de provedores externos.</li>
  <li>Necessidade de melhorias no SGQ.</li>
</ul>

<p>Na pratica, isso se traduz em reunioes periodicas de analise de indicadores onde a equipe de gestao avalia os dados, identifica tendencias e define acoes.</p>

<div class="template-box"><span>Download: Painel de indicadores do SGQ (modelo Excel/Google Sheets)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'auditoria-interna', 'Clausula 9.2 — Auditoria Interna', '30 min', 2, ${`
<h2>Clausula 9.2 — Auditoria Interna</h2>

<p>A auditoria interna e uma das ferramentas mais poderosas do SGQ — e tambem uma das mais mal utilizadas. Quando bem feita, e uma oportunidade de aprendizado e melhoria. Quando mal feita, vira uma "cacada a bruxas" ou um "ritual de papel" que ninguem leva a serio.</p>

<h3>O que a norma exige</h3>

<p>A organizacao deve conduzir auditorias internas em intervalos planejados para prover informacao sobre se o SGQ:</p>

<ul>
  <li>Esta conforme os requisitos da propria organizacao e da ISO 9001.</li>
  <li>Esta implementado e mantido eficazmente.</li>
</ul>

<h3>Programa de auditoria</h3>

<p>A organizacao deve planejar, estabelecer, implementar e manter um programa de auditoria, incluindo frequencia, metodos, responsabilidades, requisitos de planejamento e relato. O programa deve considerar:</p>

<ul>
  <li>A importancia dos processos envolvidos.</li>
  <li>Mudancas que afetem a organizacao.</li>
  <li>Resultados de auditorias anteriores.</li>
</ul>

<div class="callout"><strong>Importante:</strong> "Intervalos planejados" nao significa necessariamente "uma vez por ano tudo de uma vez". Muitas organizacoes distribuem as auditorias ao longo do ano, auditando processos diferentes a cada mes ou trimestre. Processos mais criticos ou com historico de problemas podem ser auditados com maior frequencia.</div>

<h3>Requisitos para auditores</h3>

<p>Os auditores devem ser selecionados de forma a assegurar objetividade e imparcialidade. Isso significa: ninguem audita seu proprio trabalho. O gerente de producao nao audita a producao. O coordenador de qualidade nao audita a gestao da qualidade (na pratica, alguem de outro setor audita qualidade).</p>

<p>Competencia necessaria para auditores internos:</p>

<ul>
  <li>Conhecimento da ISO 9001 (requisitos aplicaveis).</li>
  <li>Conhecimento do processo a ser auditado (basico, nao precisa ser especialista).</li>
  <li>Tecnicas de auditoria (como formular perguntas, coletar evidencias, registrar achados).</li>
  <li>Treinamento formal em auditoria interna (curso de 8 a 16 horas e o padrao de mercado).</li>
</ul>

<h3>Etapas de uma auditoria interna</h3>

<ol>
  <li><strong>Planejamento:</strong> definir escopo, criterios, equipe auditora, cronograma e checklist.</li>
  <li><strong>Reuniao de abertura:</strong> alinhar com o auditado escopo, objetivo, agenda e metodo.</li>
  <li><strong>Execucao:</strong> coleta de evidencias por entrevistas, observacao e analise documental.</li>
  <li><strong>Classificacao de achados:</strong> nao conformidade maior, nao conformidade menor, oportunidade de melhoria ou conformidade.</li>
  <li><strong>Reuniao de encerramento:</strong> apresentar achados ao auditado, alinhar entendimento.</li>
  <li><strong>Relatorio:</strong> formalizar achados, classificacao e prazo para tratamento.</li>
  <li><strong>Acompanhamento:</strong> verificar se as acoes corretivas foram implementadas e sao eficazes.</li>
</ol>

<div class="example"><strong>Exemplo pratico — Metalurgica:</strong> O programa anual de auditoria da UsinaMax distribui auditorias ao longo de 10 meses (janeiro e dezembro ficam livres). Cada mes audita 1-2 processos. O setor de metrologia e auditado 2x ao ano (por ser critico). A equipe de auditores internos tem 4 pessoas de setores diferentes, todas com curso de auditor interno. O coordenador de qualidade coordena o programa mas nao participa como auditor (para manter imparcialidade, exceto para auditar processos onde nao tem envolvimento direto).</div>

<h3>Perguntas eficazes em auditoria</h3>

<p>Um bom auditor faz perguntas abertas que revelam como o processo realmente funciona:</p>

<ul>
  <li>"Me mostre como voce faz [atividade X]."</li>
  <li>"O que voce faz quando [situacao Y] acontece?"</li>
  <li>"Onde esta registrado [resultado Z]?"</li>
  <li>"Como voce sabe que este instrumento esta calibrado?"</li>
  <li>"Quem autorizou essa mudanca no processo?"</li>
</ul>

<p>Evite perguntas fechadas (sim/nao) e perguntas que induzem a resposta ("voce segue o procedimento, ne?").</p>

<div class="callout"><strong>Importante:</strong> A auditoria interna deve ser vista como uma ferramenta de MELHORIA, nao de PUNICAO. Se as pessoas tiverem medo da auditoria, vao esconder problemas em vez de mostra-los. A cultura da organizacao deve incentivar a transparencia: encontrar um problema na auditoria e BOM — significa que podemos corrigi-lo antes que vire uma reclamacao do cliente ou uma nao conformidade na auditoria de certificacao.</div>

<div class="template-box"><span>Download: Programa anual de auditoria + checklist de auditoria por clausula</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'analise-critica-direcao', 'Clausula 9.3 — Analise Critica pela Direcao', '30 min', 3, ${`
<h2>Clausula 9.3 — Analise Critica pela Direcao</h2>

<p>A analise critica pela direcao e a reuniao mais importante do SGQ. E o momento em que a alta direcao avalia o desempenho do sistema, toma decisoes estrategicas e direciona a melhoria. Na pratica, e onde a clausula 5 (lideranca) se materializa com fatos e dados.</p>

<h3>Frequencia</h3>

<p>A norma diz "em intervalos planejados". O padrao de mercado e pelo menos anual, mas muitas organizacoes fazem semestral ou trimestral — e isso e altamente recomendado. Quanto mais frequente, mais agil a resposta a problemas.</p>

<h3>9.3.2 — Entradas da analise critica</h3>

<p>A norma especifica o que DEVE ser analisado. Essas sao as entradas obrigatorias:</p>

<ol>
  <li><strong>Situacao das acoes de analises criticas anteriores:</strong> o que foi decidido na ultima reuniao? Foi implementado?</li>
  <li><strong>Mudancas em questoes externas e internas:</strong> algo mudou no contexto? Novos requisitos legais? Novo mercado?</li>
  <li><strong>Informacao sobre desempenho e eficacia do SGQ:</strong>
    <ul>
      <li>Satisfacao do cliente e retroalimentacao de partes interessadas.</li>
      <li>Extensao em que os objetivos da qualidade foram alcancados.</li>
      <li>Desempenho de processos e conformidade de produtos/servicos.</li>
      <li>Nao conformidades e acoes corretivas.</li>
      <li>Resultados de monitoramento e medicao.</li>
      <li>Resultados de auditoria.</li>
      <li>Desempenho de provedores externos.</li>
    </ul>
  </li>
  <li><strong>Adequacao de recursos.</strong></li>
  <li><strong>Eficacia de acoes para abordar riscos e oportunidades.</strong></li>
  <li><strong>Oportunidades de melhoria.</strong></li>
</ol>

<div class="example"><strong>Exemplo pratico — Cooperativa agricola:</strong> A analise critica semestral da cooperativa segue uma pauta fixa de 2 horas:
<ul>
  <li>15 min — Status das acoes da reuniao anterior</li>
  <li>20 min — Indicadores de qualidade (graos classificados, perdas, reclamacoes)</li>
  <li>15 min — Resultado da pesquisa de satisfacao dos cooperados</li>
  <li>15 min — Resultados de auditorias internas</li>
  <li>15 min — Analise de nao conformidades e acoes corretivas</li>
  <li>15 min — Desempenho de fornecedores</li>
  <li>15 min — Revisao de riscos e oportunidades</li>
  <li>10 min — Necessidades de recursos e investimentos</li>
</ul>
Participam: presidente, diretor tecnico, gerente de operacoes, coordenador de qualidade e gerente financeiro.</div>

<h3>9.3.3 — Saidas da analise critica</h3>

<p>As saidas devem incluir decisoes e acoes relacionadas a:</p>

<ul>
  <li>Oportunidades de melhoria.</li>
  <li>Qualquer necessidade de mudanca no SGQ.</li>
  <li>Necessidade de recursos.</li>
</ul>

<p>Em termos praticos, a ata da analise critica deve registrar decisoes concretas: quem vai fazer o que, ate quando, com quais recursos.</p>

<div class="callout"><strong>Importante:</strong> O erro mais comum: a analise critica vira uma "reuniao de apresentacao de indicadores" onde a direcao ouve, faz alguns comentarios e vai embora sem decisoes concretas. A ata tem frases como "manter monitoramento" — que nao e uma decisao, e uma fuga. O auditor vai cobrar: quais DECISOES foram tomadas? Quais ACOES foram definidas? Os RESULTADOS foram diferentes por causa dessa reuniao?</div>

<h3>Dicas para uma analise critica eficaz</h3>

<ol>
  <li><strong>Prepare o material com antecedencia</strong> — envie os dados pelo menos 5 dias antes para que todos venham preparados.</li>
  <li><strong>Use graficos e tendencias</strong> — nao so numeros absolutos. Mostre a evolucao ao longo do tempo.</li>
  <li><strong>Foque em desvios e tendencias negativas</strong> — o que esta no verde e rapido; o que esta no vermelho exige discussao.</li>
  <li><strong>Registre DECISOES, nao so discussoes</strong> — a ata deve ter acoes com responsavel e prazo.</li>
  <li><strong>Acompanhe na proxima reuniao</strong> — a primeira entrada da proxima analise critica e o status das acoes anteriores.</li>
</ol>

<div class="template-box"><span>Download: Modelo de ata de analise critica pela direcao</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'melhoria-nao-conformidade', 'Clausula 10 — Melhoria, Nao Conformidade e Acao Corretiva', '30 min', 4, ${`
<h2>Clausula 10 — Melhoria, Nao Conformidade e Acao Corretiva</h2>

<p>A clausula 10 fecha o ciclo PDCA com o "Act" — agir para melhorar. E dividida em tres partes: generalidades (10.1), nao conformidade e acao corretiva (10.2) e melhoria continua (10.3).</p>

<h3>10.1 — Generalidades</h3>

<p>A organizacao deve determinar e selecionar oportunidades de melhoria e implementar acoes necessarias para atender aos requisitos do cliente e aumentar a satisfacao. Isso inclui:</p>

<ul>
  <li>Melhorar produtos e servicos para atender requisitos e considerar necessidades futuras.</li>
  <li>Corrigir, prevenir ou reduzir efeitos indesejaveis.</li>
  <li>Melhorar o desempenho e a eficacia do SGQ.</li>
</ul>

<h3>10.2 — Nao conformidade e acao corretiva</h3>

<p>Esta e a clausula que mais gera evidencias em auditorias e a que mais frequentemente apresenta problemas. O tratamento de nao conformidades e o "teste de estresse" do SGQ.</p>

<p>Quando uma nao conformidade ocorre (incluindo reclamacoes de clientes), a organizacao deve:</p>

<ol>
  <li><strong>Reagir a nao conformidade:</strong>
    <ul>
      <li>Tomar acao para controla-la e corrigi-la (correcao — disposicao imediata).</li>
      <li>Lidar com as consequencias.</li>
    </ul>
  </li>
  <li><strong>Avaliar a necessidade de acao para eliminar a causa:</strong>
    <ul>
      <li>Analisar criticamente a nao conformidade.</li>
      <li>Determinar as causas.</li>
      <li>Determinar se nao conformidades similares existem ou podem ocorrer.</li>
    </ul>
  </li>
  <li><strong>Implementar a acao necessaria (acao corretiva).</strong></li>
  <li><strong>Analisar criticamente a eficacia da acao corretiva.</strong></li>
  <li><strong>Atualizar riscos e oportunidades, se necessario.</strong></li>
  <li><strong>Fazer mudancas no SGQ, se necessario.</strong></li>
</ol>

<h3>A diferenca entre correcao e acao corretiva</h3>

<div class="callout"><strong>Importante:</strong> Essa diferenca e fundamental e frequentemente confundida.
<ul>
  <li><strong>Correcao</strong> (disposicao imediata): o que voce faz AGORA para resolver o problema pontual. Exemplo: retrabalhar a peca, segregar o lote, devolver ao fornecedor.</li>
  <li><strong>Acao corretiva</strong>: o que voce faz para eliminar a CAUSA do problema e evitar que se repita. Exemplo: recalibrar a maquina, retreinar o operador, revisar o procedimento, trocar de fornecedor.</li>
</ul>
A correcao "apaga o incendio". A acao corretiva "conserta a fiacao eletrica" para que o incendio nao volte.</div>

<h3>Ferramentas de analise de causa raiz</h3>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Como funciona</th></tr>
  <tr><td>5 Porques</td><td>Problemas simples a moderados</td><td>Perguntar "por que?" 5 vezes ate chegar a causa raiz</td></tr>
  <tr><td>Ishikawa (Espinha de peixe)</td><td>Problemas com multiplas causas potenciais</td><td>Categorizar causas em 6M: Maquina, Metodo, Mao de obra, Material, Meio ambiente, Medicao</td></tr>
  <tr><td>8D</td><td>Problemas complexos, especialmente reclamacoes de clientes</td><td>8 disciplinas estruturadas, da contencao ate prevencao</td></tr>
  <tr><td>A3</td><td>Problemas que precisam ser comunicados de forma concisa</td><td>Tudo em uma folha A3: problema, analise, acao, resultado</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Metalurgica (5 Porques):</strong>
<p><strong>Problema:</strong> Lote de 200 eixos entregue com diametro fora de tolerancia.</p>
<ul>
  <li>Por que? A medicao nao detectou o desvio durante a producao.</li>
  <li>Por que? O operador nao mediu no intervalo especificado (a cada 10 pecas).</li>
  <li>Por que? O operador estava acumulando a funcao de duas maquinas.</li>
  <li>Por que? O colega de turno faltou e nao foi providenciado substituto.</li>
  <li>Por que? Nao existe procedimento para substituicao em caso de falta.</li>
</ul>
<p><strong>Causa raiz:</strong> Falta de procedimento para cobertura de ausencias em funcoes criticas.</p>
<p><strong>Acao corretiva:</strong> Criar e implementar procedimento de cobertura com operadores polivalentes treinados.</p>
<p><strong>Verificacao de eficacia:</strong> Acompanhar por 3 meses se ha reincidencia; monitorar absenteismo e cobertura.</p></div>

<h3>10.3 — Melhoria continua</h3>

<p>A organizacao deve melhorar continuamente a adequacao, suficiencia e eficacia do SGQ, considerando os resultados de analise e avaliacao e as saidas da analise critica para determinar se ha necessidades ou oportunidades de melhoria.</p>

<p>Melhoria continua nao e apenas corrigir problemas. E buscar ativamente fazer melhor:</p>

<ul>
  <li><strong>Projetos de melhoria:</strong> kaizen, lean, six sigma, grupos de melhoria.</li>
  <li><strong>Benchmarking:</strong> comparar-se com os melhores do setor.</li>
  <li><strong>Inovacao de processos:</strong> adotar novas tecnologias, novos metodos.</li>
  <li><strong>Sugestoes de colaboradores:</strong> programa estruturado de sugestoes.</li>
</ul>

<div class="template-box"><span>Download: Formulario de nao conformidade e acao corretiva (RAC) + guia de 5 Porques</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 6 — Integracao e Certificacao (1.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod6Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Integracao e Certificacao', 'Roteiro de implantacao, preparacao para certificacao, manutencao do SGQ e informacoes sobre a prova final.', 6)
    RETURNING id
  `;
  const mod6 = mod6Rows[0].id;

  // --- Aula 6.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'roteiro-implantacao', 'Roteiro de Implantacao — Do Zero a Certificacao', '25 min', 1, ${`
<h2>Roteiro de Implantacao — Do Zero a Certificacao</h2>

<p>Agora que voce conhece todos os requisitos da ISO 9001:2015, vamos montar o roteiro pratico para implantar o SGQ e chegar a certificacao. O prazo tipico para uma PME brasileira e de 6 a 12 meses, dependendo da complexidade e maturidade da organizacao.</p>

<h3>Fase 1 — Diagnostico e planejamento (mes 1-2)</h3>

<table>
  <tr><th>Atividade</th><th>Entrega</th><th>Responsavel</th></tr>
  <tr><td>Diagnostico inicial (gap analysis)</td><td>Relatorio de gaps vs. requisitos ISO 9001</td><td>Consultor/Coordenador de Qualidade</td></tr>
  <tr><td>Comprometimento da direcao</td><td>Ata de reuniao de lancamento do projeto</td><td>Diretor + Consultor</td></tr>
  <tr><td>Definicao do comite de implantacao</td><td>Nomeacao formal com papeis e responsabilidades</td><td>Diretor</td></tr>
  <tr><td>Cronograma do projeto</td><td>Cronograma detalhado com marcos e responsaveis</td><td>Coordenador de Qualidade</td></tr>
  <tr><td>Treinamento da equipe na norma</td><td>Todos os envolvidos treinados nos requisitos basicos</td><td>Consultor</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> O diagnostico inicial e critico. Ele mostra onde a empresa ja atende (voce vai se surpreender — muitas coisas ja sao feitas) e onde tem lacunas. Isso permite priorizar esforcos. Nao comece documentando tudo — comece pelo que falta.</div>

<h3>Fase 2 — Construcao do SGQ (mes 2-6)</h3>

<ol>
  <li><strong>Analise de contexto e partes interessadas</strong> (clausulas 4.1, 4.2) — workshop com direcao e gerencia, 4 horas.</li>
  <li><strong>Definicao do escopo</strong> (clausula 4.3) — redacao e aprovacao.</li>
  <li><strong>Mapeamento de processos</strong> (clausula 4.4) — identificar processos, interacoes, donos e indicadores.</li>
  <li><strong>Politica da qualidade</strong> (clausula 5.2) — redigir, aprovar e comunicar.</li>
  <li><strong>Gestao de riscos</strong> (clausula 6.1) — workshop por processo, montar matriz de riscos.</li>
  <li><strong>Objetivos da qualidade</strong> (clausula 6.2) — definir com planos de acao.</li>
  <li><strong>Documentacao</strong> (clausula 7.5) — criar/revisar procedimentos, instrucoes de trabalho, formularios.</li>
  <li><strong>Gestao de competencias</strong> (clausula 7.2) — matriz de competencias, plano de treinamento.</li>
  <li><strong>Controle de fornecedores</strong> (clausula 8.4) — criterios, avaliacao, lista aprovada.</li>
  <li><strong>Controle de producao</strong> (clausula 8.5) — planos de controle, instrucoes operacionais.</li>
  <li><strong>Gestao de nao conformidades</strong> (clausula 8.7, 10.2) — procedimento de tratamento de NC.</li>
  <li><strong>Calibracao</strong> (clausula 7.1.5) — inventario de instrumentos, plano de calibracao.</li>
</ol>

<h3>Fase 3 — Operacao e maturacao (mes 5-9)</h3>

<p>O SGQ precisa "rodar" por pelo menos 3 meses antes da auditoria de certificacao, gerando evidencias de que funciona na pratica:</p>

<ul>
  <li>Indicadores sendo coletados e analisados.</li>
  <li>Registros de producao, inspecao e liberacao sendo feitos.</li>
  <li>Nao conformidades sendo tratadas com analise de causa e acao corretiva.</li>
  <li>Fornecedores sendo avaliados.</li>
  <li>Treinamentos sendo realizados e registrados.</li>
</ul>

<h3>Fase 4 — Verificacao (mes 8-10)</h3>

<ol>
  <li><strong>Auditoria interna completa</strong> (clausula 9.2) — cobrindo todos os processos e clausulas.</li>
  <li><strong>Tratamento dos achados</strong> da auditoria interna.</li>
  <li><strong>Analise critica pela direcao</strong> (clausula 9.3) — com todas as entradas obrigatorias.</li>
</ol>

<h3>Fase 5 — Certificacao (mes 10-12)</h3>

<ol>
  <li><strong>Selecao do organismo certificador:</strong> Bureau Veritas, SGS, BRTUV, Fundacao Vanzolini, ABS, DNV, entre outros.</li>
  <li><strong>Auditoria de Fase 1 (documental):</strong> o auditor externo analisa a documentacao do SGQ, verifica se os requisitos estao enderecados e identifica areas de preocupacao.</li>
  <li><strong>Correcao de achados da Fase 1.</strong></li>
  <li><strong>Auditoria de Fase 2 (no local):</strong> o auditor verifica a implementacao e eficacia do SGQ no chao de fabrica/escritorio.</li>
  <li><strong>Tratamento de nao conformidades</strong> (se houver) dentro do prazo estipulado.</li>
  <li><strong>Emissao do certificado.</strong></li>
</ol>

<div class="example"><strong>Exemplo pratico — Cronograma real:</strong> A MetalForte (60 funcionarios, Caxias do Sul) iniciou o projeto em fevereiro. Diagnostico em fevereiro/marco. Construcao do SGQ de marco a julho. Operacao plena de agosto a outubro. Auditoria interna em novembro. Analise critica em novembro. Auditoria de certificacao Fase 1 em dezembro, Fase 2 em janeiro. Certificado emitido em fevereiro — 12 meses apos o inicio.</div>

<div class="template-box"><span>Download: Cronograma de implantacao ISO 9001 (Gantt editavel)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'preparacao-auditoria-certificacao', 'Preparacao para a Auditoria de Certificacao', '25 min', 2, ${`
<h2>Preparacao para a Auditoria de Certificacao</h2>

<p>A auditoria de certificacao e o momento da verdade. Vamos desmistifica-la: nao e um tribunal, e nao e impossivel. Com preparacao adequada, a grande maioria das organizacoes e certificada na primeira tentativa.</p>

<h3>Escolhendo o organismo certificador</h3>

<p>No Brasil, os principais organismos certificadores acreditados pelo Inmetro para ISO 9001 sao:</p>

<table>
  <tr><th>Organismo</th><th>Perfil</th><th>Faixa de preco (PME)</th></tr>
  <tr><td>Bureau Veritas</td><td>Global, forte na industria</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>SGS</td><td>Global, ampla presenca</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>BRTUV</td><td>Origem alema, foco industrial</td><td>R$ 7.000 - R$ 15.000</td></tr>
  <tr><td>Fundacao Vanzolini</td><td>Nacional, forte em SP</td><td>R$ 6.000 - R$ 14.000</td></tr>
  <tr><td>DNV</td><td>Global, forte em processos</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>ABS Quality</td><td>Origem naval, versatil</td><td>R$ 7.000 - R$ 15.000</td></tr>
</table>

<p>Os precos variam conforme: numero de funcionarios, numero de sites, complexidade dos processos e localizacao (deslocamento do auditor).</p>

<div class="callout"><strong>Importante:</strong> O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do IAF — International Accreditation Forum). Um certificado de um organismo nao acreditado nao tem validade de mercado. Verifique no site do Inmetro: <em>certifiq.inmetro.gov.br</em>.</div>

<h3>Auditoria Fase 1 — Analise documental</h3>

<p>O que o auditor avalia na Fase 1:</p>

<ul>
  <li>Documentacao do SGQ (politica, escopo, processos, procedimentos, registros).</li>
  <li>Contexto, partes interessadas e riscos.</li>
  <li>Objetivos e indicadores.</li>
  <li>Resultados de auditoria interna e analise critica.</li>
  <li>Condicoes especificas do site (layout, fluxo, infraestrutura).</li>
</ul>

<p>A Fase 1 geralmente dura 1 dia para PMEs. O auditor emite um relatorio com achados e recomendacoes. Se houver nao conformidades maiores, a Fase 2 pode ser adiada ate a resolucao.</p>

<h3>Auditoria Fase 2 — No local</h3>

<p>E a auditoria completa. O auditor passa por todos os processos do escopo, entrevista pessoas em todos os niveis (direcao, gerencia, operacao) e verifica evidencias de implementacao e eficacia. Duracao tipica: 2 a 4 dias para PMEs.</p>

<p>O que o auditor faz na pratica:</p>

<ol>
  <li><strong>Reuniao de abertura:</strong> apresentacao, escopo, agenda.</li>
  <li><strong>Auditoria da direcao:</strong> entrevista com alta direcao sobre contexto, politica, objetivos, analise critica.</li>
  <li><strong>Auditoria de processos:</strong> percorre cada processo do escopo, entrevista responsaveis e operadores, verifica registros.</li>
  <li><strong>Verificacao no chao de fabrica/campo:</strong> observa operacoes reais, verifica calibracao, identificacao, rastreabilidade.</li>
  <li><strong>Reuniao de encerramento:</strong> apresenta achados, classifica (NC maior, NC menor, oportunidade de melhoria).</li>
</ol>

<h3>Classificacao de achados</h3>

<table>
  <tr><th>Classificacao</th><th>Definicao</th><th>Consequencia</th></tr>
  <tr><td>Nao conformidade maior</td><td>Falha sistematica ou ausencia total de requisito</td><td>Certificacao nao e concedida ate resolucao (prazo 90 dias)</td></tr>
  <tr><td>Nao conformidade menor</td><td>Falha pontual, nao sistematica</td><td>Certificacao e concedida, mas NC deve ser tratada ate a proxima auditoria</td></tr>
  <tr><td>Oportunidade de melhoria</td><td>Atende ao requisito mas poderia ser melhor</td><td>Informativo, nao bloqueia certificacao</td></tr>
</table>

<div class="example"><strong>Exemplo pratico — Nao conformidades mais comuns em auditorias de certificacao:</strong>
<ul>
  <li>Instrumento de medicao com calibracao vencida em uso na producao (7.1.5).</li>
  <li>Analise critica pela direcao sem todas as entradas obrigatorias (9.3.2).</li>
  <li>Acao corretiva sem analise de causa raiz — apenas correcao (10.2).</li>
  <li>Objetivos da qualidade sem plano de acao associado (6.2).</li>
  <li>Risco identificado mas sem acao implementada (6.1).</li>
  <li>Competencia de operador nao evidenciada para funcao critica (7.2).</li>
</ul></div>

<h3>Dicas para o dia da auditoria</h3>

<ul>
  <li>Responda o que foi perguntado — nao mais, nao menos. Nao "ofereca" problemas.</li>
  <li>Se nao souber a resposta, diga "vou verificar" — e efetivamente verifique.</li>
  <li>Mostre evidencias concretas (registros, telas, fotos) — nao apenas explique verbalmente.</li>
  <li>Seja honesto. Se algo nao esta implementado ainda, diga. Tentar enganar o auditor sempre termina mal.</li>
  <li>Mantenha a calma. O auditor nao e um inimigo — e um profissional fazendo seu trabalho.</li>
</ul>

<div class="template-box"><span>Download: Checklist de preparacao pre-auditoria de certificacao</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'manutencao-sgq', 'Manutencao e Melhoria Continua do SGQ', '20 min', 3, ${`
<h2>Manutencao e Melhoria Continua do SGQ apos a Certificacao</h2>

<p>Conseguir o certificado e importante, mas mante-lo e o verdadeiro desafio. O certificado ISO 9001 tem validade de 3 anos, com auditorias de manutencao anuais. Se a organizacao relaxar apos a certificacao, a proxima auditoria vai revelar a deterioracao — e o certificado pode ser suspenso.</p>

<h3>Ciclo de certificacao (3 anos)</h3>

<table>
  <tr><th>Ano</th><th>Tipo de auditoria</th><th>Escopo</th><th>Duracao tipica (PME)</th></tr>
  <tr><td>Ano 1</td><td>Certificacao (Fase 1 + Fase 2)</td><td>Completo — todos os requisitos</td><td>3-5 dias</td></tr>
  <tr><td>Ano 2</td><td>Manutencao (Vigilancia 1)</td><td>Parcial — amostragem de processos</td><td>1-2 dias</td></tr>
  <tr><td>Ano 3</td><td>Manutencao (Vigilancia 2)</td><td>Parcial — outros processos</td><td>1-2 dias</td></tr>
  <tr><td>Ano 4</td><td>Recertificacao</td><td>Completo — todos os requisitos</td><td>2-4 dias</td></tr>
</table>

<h3>Rotina mensal de manutencao do SGQ</h3>

<p>Para manter o SGQ vivo e eficaz, estabeleca uma rotina minima:</p>

<ul>
  <li><strong>Semanal:</strong> coleta de indicadores de processo (refugo, retrabalho, pontualidade).</li>
  <li><strong>Mensal:</strong> reuniao de indicadores com gestores de processo, analise de nao conformidades abertas, status de acoes corretivas.</li>
  <li><strong>Trimestral:</strong> avaliacao de fornecedores, revisao da matriz de riscos, verificacao de calibracao.</li>
  <li><strong>Semestral:</strong> pesquisa de satisfacao do cliente, auditoria interna parcial.</li>
  <li><strong>Anual:</strong> auditoria interna completa, analise critica pela direcao, revisao de contexto e partes interessadas, atualizacao de objetivos.</li>
</ul>

<div class="example"><strong>Exemplo pratico — Construtora:</strong> Apos a certificacao, a construtora designou 4 horas semanais do coordenador de qualidade para atividades de manutencao do SGQ: verificar nao conformidades de obra (segunda), atualizar indicadores (terca), acompanhar acoes corretivas (quarta) e preparar material para a reuniao mensal de indicadores (quinta). Esse investimento de tempo manteve o SGQ ativo sem sobrecarregar ninguem.</div>

<h3>Armadilhas comuns apos a certificacao</h3>

<ol>
  <li><strong>"Sindrome do diploma na parede":</strong> conseguir o certificado e esquecer o SGQ. O sistema morre em poucos meses.</li>
  <li><strong>Documentacao defasada:</strong> processos mudam mas documentos nao sao atualizados. Gera divergencia entre o real e o documentado.</li>
  <li><strong>Indicadores sem analise:</strong> coletar dados sem analisa-los e agir sobre eles. Vira burocracia pura.</li>
  <li><strong>Auditoria interna pro-forma:</strong> auditoria feita "para cumprir tabela" sem profundidade. Nao gera melhoria.</li>
  <li><strong>Direcao se desconecta:</strong> apos a certificacao, a direcao delega tudo ao "pessoal da qualidade". O comprometimento some.</li>
</ol>

<div class="callout"><strong>Importante:</strong> O SGQ deve gerar VALOR para a gestao, nao ser um peso. Se os gestores veem o SGQ como burocracia, algo esta errado. Revise: os indicadores sao uteis para decisoes? Os procedimentos ajudam o trabalho? As auditorias revelam oportunidades reais? Se a resposta for "nao" em algum desses pontos, simplifique e melhore o proprio SGQ.</div>

<h3>Evolucao do SGQ — proximos passos</h3>

<p>Apos consolidar a ISO 9001, muitas organizacoes evoluem para:</p>

<ul>
  <li><strong>ISO 14001:</strong> Sistema de Gestao Ambiental — integravel com ISO 9001 pela estrutura comum.</li>
  <li><strong>ISO 45001:</strong> Saude e Seguranca Ocupacional — substitui a antiga OHSAS 18001.</li>
  <li><strong>IATF 16949:</strong> Gestao da Qualidade Automotiva — para fornecedores do setor automotivo.</li>
  <li><strong>FSSC 22000:</strong> Seguranca de Alimentos — para industria alimenticia.</li>
  <li><strong>ISO 19011:</strong> Diretrizes para auditoria de sistemas de gestao — aprofundar competencia de auditoria.</li>
</ul>

<div class="template-box"><span>Download: Calendario anual de manutencao do SGQ</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'prova-final-orientacoes', 'Orientacoes para a Prova Final e Encerramento', '20 min', 4, ${`
<h2>Orientacoes para a Prova Final e Encerramento</h2>

<p>Parabens por chegar ate aqui! Voce percorreu todas as clausulas da ISO 9001:2015, com exemplos praticos da industria brasileira. Agora vamos preparar voce para a prova final do curso, que e requisito para a emissao do certificado.</p>

<h3>Formato da prova final</h3>

<ul>
  <li><strong>Numero de questoes:</strong> 30 questoes de multipla escolha.</li>
  <li><strong>Tempo:</strong> sem limite de tempo — faca com calma e concentracao.</li>
  <li><strong>Nota minima para aprovacao:</strong> 70% (21 acertos em 30).</li>
  <li><strong>Tentativas:</strong> ilimitadas — se nao passar, revise o conteudo e tente novamente.</li>
  <li><strong>Abrangencia:</strong> todos os 6 modulos do curso, com enfase nas clausulas 4 a 10.</li>
</ul>

<h3>Dicas para a prova</h3>

<ol>
  <li><strong>Leia a pergunta COMPLETA antes de ver as alternativas.</strong> Muitas questoes tem pegadinhas sutis.</li>
  <li><strong>Preste atencao em palavras-chave:</strong> "deve" (obrigatorio), "pode" (opcional), "quando aplicavel" (condicional).</li>
  <li><strong>Identifique a clausula:</strong> se a questao menciona "riscos e oportunidades", voce sabe que e clausula 6.1. Isso ajuda a contextualizar.</li>
  <li><strong>Elimine alternativas absurdas primeiro:</strong> geralmente 1 ou 2 alternativas sao claramente incorretas. Elimine-as e compare as restantes.</li>
  <li><strong>Pense na pratica:</strong> muitas questoes pedem aplicacao, nao memorizacao. Pense em como voce aplicaria o conceito numa empresa real.</li>
  <li><strong>Se tiver duvida, volte ao conteudo:</strong> as aulas ficam disponiveis. Releia a aula correspondente antes de responder.</li>
</ol>

<h3>Temas mais cobrados</h3>

<table>
  <tr><th>Tema</th><th>Clausulas</th><th>Frequencia na prova</th></tr>
  <tr><td>Mentalidade de risco</td><td>6.1</td><td>Alta</td></tr>
  <tr><td>Informacao documentada</td><td>7.5</td><td>Alta</td></tr>
  <tr><td>Lideranca e comprometimento</td><td>5.1</td><td>Media-Alta</td></tr>
  <tr><td>Auditoria interna</td><td>9.2</td><td>Media-Alta</td></tr>
  <tr><td>Nao conformidade e acao corretiva</td><td>10.2</td><td>Alta</td></tr>
  <tr><td>Contexto e partes interessadas</td><td>4.1, 4.2</td><td>Media</td></tr>
  <tr><td>Controle de fornecedores</td><td>8.4</td><td>Media</td></tr>
  <tr><td>Analise critica pela direcao</td><td>9.3</td><td>Media</td></tr>
</table>

<h3>O certificado</h3>

<p>Ao atingir 70% ou mais na prova final E ter concluido todas as aulas do curso, voce recebera automaticamente o <strong>Certificado de Conclusao</strong> do curso "ISO 9001:2015 — Interpretacao dos Requisitos", emitido pela Anders Tech, com carga horaria de 12 horas.</p>

<p>O certificado e gerado em PDF, com codigo de verificacao unico que pode ser validado no site da Anders Tech. Voce pode usa-lo para:</p>

<ul>
  <li>Comprovar competencia em ISO 9001 para seu empregador.</li>
  <li>Compor horas de treinamento para auditorias de certificacao.</li>
  <li>Incluir no curriculo/LinkedIn.</li>
  <li>Atender requisitos de qualificacao de fornecedores.</li>
</ul>

<h3>Revisao rapida dos pontos-chave</h3>

<p>Antes de fazer a prova, relembre:</p>

<ul>
  <li>A ISO 9001:2015 tem 10 clausulas, sendo que 4 a 10 contem requisitos auditaveis.</li>
  <li>A estrutura segue o ciclo PDCA: Plan (4-6), Do (7-8), Check (9), Act (10).</li>
  <li>Os 7 principios sao a base filosofica; os requisitos sao a implementacao pratica.</li>
  <li>Mentalidade de risco substitui a antiga acao preventiva.</li>
  <li>Informacao documentada substitui documentos + registros + procedimentos obrigatorios.</li>
  <li>A alta direcao deve demonstrar comprometimento com acoes concretas.</li>
  <li>A correcao resolve o problema imediato; a acao corretiva elimina a causa.</li>
  <li>A auditoria interna e ferramenta de melhoria, nao de punicao.</li>
  <li>A analise critica pela direcao deve ter todas as entradas obrigatorias e gerar decisoes e acoes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> Este curso ensinou a interpretar os requisitos. Para auditar, voce precisara de um curso especifico de auditor interno (ISO 19011). Para implantar, a pratica e o melhor professor — aplique o que aprendeu, comece pelo basico e va evoluindo. A Anders Tech oferece consultoria para apoiar sua empresa na implantacao e certificacao.</div>

<h3>Obrigado!</h3>

<p>Esperamos que este curso tenha sido pratico, objetivo e util para sua carreira e sua empresa. A qualidade e uma jornada, nao um destino. Bons estudos na prova final!</p>

<div class="template-box"><span>Download: Resumo executivo da ISO 9001:2015 (todas as clausulas em 4 paginas)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ — Perguntas por modulo (5 por modulo = 30)
  // ═══════════════════════════════════════════════════════════════════

  // --- Quiz Modulo 1 ---
  const m1q = [
    {
      pergunta: 'Qual e o principal objetivo da ISO 9001:2015?',
      alternativas: ['Certificar produtos para exportacao', 'Definir requisitos para um Sistema de Gestao da Qualidade', 'Estabelecer limites de tolerancia para pecas mecanicas', 'Regulamentar a seguranca do trabalho na industria'],
      correta: 1,
      explicacao: 'A ISO 9001 define requisitos para um SGQ que permita a organizacao fornecer consistentemente produtos e servicos que atendam aos requisitos do cliente e regulamentares.'
    },
    {
      pergunta: 'Quantos principios de gestao da qualidade fundamentam a ISO 9001:2015?',
      alternativas: ['5', '6', '7', '8'],
      correta: 2,
      explicacao: 'Sao 7 principios: Foco no cliente, Lideranca, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisao baseada em evidencia e Gestao de relacionamento.'
    },
    {
      pergunta: 'Qual estrutura padronizada a ISO 9001:2015 adota para facilitar a integracao com outras normas de gestao?',
      alternativas: ['Estrutura de 8 clausulas', 'Anexo SL (Estrutura de Alto Nivel)', 'Modelo EFQM', 'Ciclo DMAIC'],
      correta: 1,
      explicacao: 'O Anexo SL define a Estrutura de Alto Nivel (HLS) com 10 clausulas, padronizando todas as normas de sistemas de gestao (ISO 9001, ISO 14001, ISO 45001, etc.).'
    },
    {
      pergunta: 'Qual das seguintes mudancas NAO ocorreu na transicao da ISO 9001:2008 para a 2015?',
      alternativas: ['Eliminacao da obrigatoriedade do Manual da Qualidade', 'Introducao da mentalidade de risco', 'Eliminacao da necessidade de auditoria interna', 'Adocao da Estrutura de Alto Nivel com 10 clausulas'],
      correta: 2,
      explicacao: 'A auditoria interna continua sendo obrigatoria na versao 2015 (clausula 9.2). O que mudou foi a eliminacao do Manual da Qualidade obrigatorio, a introducao da mentalidade de risco e a estrutura de 10 clausulas.'
    },
    {
      pergunta: 'As clausulas 1 a 3 da ISO 9001:2015 contem requisitos auditaveis?',
      alternativas: ['Sim, todas contem requisitos obrigatorios', 'Nao, sao clausulas informativas', 'Apenas a clausula 3 contem requisitos', 'Depende do porte da organizacao'],
      correta: 1,
      explicacao: 'As clausulas 1 (Escopo), 2 (Referencia normativa) e 3 (Termos e definicoes) sao informativas. Os requisitos auditaveis estao nas clausulas 4 a 10.'
    }
  ];

  for (const q of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod1}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Modulo 2 ---
  const m2q = [
    {
      pergunta: 'O que a clausula 4.1 da ISO 9001:2015 exige que a organizacao determine?',
      alternativas: ['Apenas os requisitos legais aplicaveis', 'As questoes externas e internas pertinentes ao seu proposito e direcao estrategica', 'O numero minimo de funcionarios para o SGQ', 'A lista de todos os concorrentes do mercado'],
      correta: 1,
      explicacao: 'A clausula 4.1 exige que a organizacao determine questoes externas e internas pertinentes para seu proposito, direcao estrategica e que afetem o SGQ.'
    },
    {
      pergunta: 'Ao identificar partes interessadas (clausula 4.2), a organizacao deve listar:',
      alternativas: ['Todas as partes interessadas existentes no mundo', 'Apenas clientes e fornecedores', 'As partes interessadas pertinentes ao SGQ e seus requisitos relevantes', 'Apenas as partes interessadas que reclamam formalmente'],
      correta: 2,
      explicacao: 'A norma pede que sejam identificadas as partes interessadas PERTINENTES ao SGQ e seus requisitos RELEVANTES — nao todas as partes existentes.'
    },
    {
      pergunta: 'Na versao 2015, quando um requisito da norma nao se aplica, a organizacao deve:',
      alternativas: ['Ignorar completamente o requisito', 'Solicitar autorizacao do organismo certificador', 'Justificar a nao aplicabilidade, que nao pode afetar a conformidade do produto/servico', 'Incluir o requisito mesmo assim, pois todos sao obrigatorios'],
      correta: 2,
      explicacao: 'Na versao 2015, nao existem "exclusoes" como na 2008. A organizacao justifica a nao aplicabilidade, desde que isso nao afete a conformidade dos produtos/servicos.'
    },
    {
      pergunta: 'Qual e o papel da alta direcao conforme a clausula 5.1?',
      alternativas: ['Delegar toda a gestao da qualidade ao coordenador', 'Demonstrar lideranca e comprometimento com o SGQ atraves de acoes concretas', 'Apenas assinar a politica da qualidade uma vez ao ano', 'Participar apenas das reunioes de auditoria externa'],
      correta: 1,
      explicacao: 'A clausula 5.1 exige que a alta direcao demonstre lideranca e comprometimento, responsabilizando-se pela eficacia do SGQ, alocando recursos, comunicando importancia e engajando pessoas.'
    },
    {
      pergunta: 'A politica da qualidade deve, entre outros requisitos:',
      alternativas: ['Ser identica para todas as empresas do mesmo setor', 'Ser secreta e acessivel apenas a direcao', 'Ser apropriada ao contexto, prover estrutura para objetivos e incluir comprometimento com melhoria continua', 'Conter metas numericas detalhadas para todos os indicadores'],
      correta: 2,
      explicacao: 'A politica deve ser apropriada ao proposito e contexto, prover estrutura para definir objetivos, incluir comprometimento com requisitos aplicaveis e melhoria continua, e ser comunicada na organizacao.'
    }
  ];

  for (const q of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod2}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Modulo 3 ---
  const m3q = [
    {
      pergunta: 'A clausula 6.1 exige que a organizacao utilize qual metodologia formal de gestao de riscos?',
      alternativas: ['FMEA obrigatoriamente', 'ISO 31000 obrigatoriamente', 'Nenhuma especifica — a norma pede mentalidade de risco, nao metodologia formal', 'Analise Bow-Tie obrigatoriamente'],
      correta: 2,
      explicacao: 'A norma NAO exige metodologia formal de gestao de riscos. Ela pede que a organizacao considere riscos e oportunidades de forma proporcional a sua complexidade.'
    },
    {
      pergunta: 'Os objetivos da qualidade (clausula 6.2) devem ser:',
      alternativas: ['Genericos e aplicaveis a qualquer empresa', 'Mensuraveis, coerentes com a politica e ter plano de acao para alcanca-los', 'Definidos apenas pelo coordenador de qualidade', 'Revisados somente a cada 3 anos na recertificacao'],
      correta: 1,
      explicacao: 'Os objetivos devem ser mensuraveis, coerentes com a politica, considerar requisitos aplicaveis, ser pertinentes para conformidade e satisfacao, monitorados, comunicados e atualizados, com plano de acao definido.'
    },
    {
      pergunta: 'A clausula 6.3 (Planejamento de mudancas) exige que mudancas no SGQ considerem:',
      alternativas: ['Apenas o custo financeiro da mudanca', 'Proposito, consequencias, integridade do SGQ, recursos e responsabilidades', 'Apenas a opiniao do organismo certificador', 'Somente mudancas de documentacao'],
      correta: 1,
      explicacao: 'A clausula 6.3 exige considerar o proposito e potenciais consequencias da mudanca, a integridade do SGQ, disponibilidade de recursos e alocacao de responsabilidades.'
    },
    {
      pergunta: 'Qual dos seguintes e um exemplo de OPORTUNIDADE (nao risco) na gestao de riscos do SGQ?',
      alternativas: ['Fornecedor entregar material fora de especificacao', 'Novo mercado emergente buscando fornecedores qualificados', 'Maquina com manutencao atrasada', 'Operador sem treinamento adequado'],
      correta: 1,
      explicacao: 'A gestao de riscos inclui oportunidades (efeitos positivos da incerteza). Um novo mercado buscando fornecedores e uma oportunidade que pode ser explorada. Os demais sao riscos (efeitos negativos).'
    },
    {
      pergunta: 'Um objetivo da qualidade formulado como "Melhorar a qualidade" e inadequado porque:',
      alternativas: ['Nao e possivel melhorar a qualidade', 'Nao e mensuravel, nao tem meta numerica nem prazo', 'A norma proibe objetivos relacionados a qualidade', 'Deveria ser "Maximizar a qualidade"'],
      correta: 1,
      explicacao: 'Objetivos devem ser mensuraveis. "Melhorar a qualidade" nao tem meta numerica nem prazo, sendo impossivel avaliar se foi alcancado. O correto seria algo como "Reduzir o indice de refugo de 4% para 2,5% ate dezembro".'
    }
  ];

  for (const q of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod3}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Modulo 4 ---
  const m4q = [
    {
      pergunta: 'O que a clausula 7.1.5 exige sobre instrumentos de medicao utilizados para verificar conformidade de produtos?',
      alternativas: ['Devem ser novos e importados', 'Devem ser calibrados ou verificados em intervalos especificados, contra padroes rastreaveis', 'Basta que funcionem corretamente no momento do uso', 'Apenas instrumentos digitais sao aceitos'],
      correta: 1,
      explicacao: 'A clausula 7.1.5 exige que instrumentos usados para verificar conformidade sejam calibrados/verificados periodicamente contra padroes rastreaveis, identificados e protegidos.'
    },
    {
      pergunta: 'Na ISO 9001:2015, "manter informacao documentada" equivale ao antigo conceito de:',
      alternativas: ['Registro (evidencia de atividade realizada)', 'Documento (procedimento, instrucao de trabalho que e atualizado)', 'Backup de dados em nuvem', 'Manual da qualidade'],
      correta: 1,
      explicacao: '"Manter" informacao documentada equivale ao antigo "documento" (algo que se atualiza). "Reter" equivale ao antigo "registro" (evidencia de que algo foi feito).'
    },
    {
      pergunta: 'A analise critica de requisitos (clausula 8.2.3) deve ser realizada:',
      alternativas: ['Somente apos a entrega do produto', 'Antes de se comprometer a fornecer o produto/servico', 'Apenas para clientes internacionais', 'Somente quando o cliente solicitar formalmente'],
      correta: 1,
      explicacao: 'A analise critica de requisitos deve ser feita ANTES de a organizacao se comprometer a fornecer, para garantir que tem capacidade de atender todos os requisitos.'
    },
    {
      pergunta: 'O que sao "processos especiais" no contexto da clausula 8.5.1?',
      alternativas: ['Processos realizados pela direcao', 'Processos cujo resultado nao pode ser verificado por inspecao posterior', 'Processos que usam maquinas importadas', 'Processos que custam mais de R$ 100.000'],
      correta: 1,
      explicacao: 'Processos especiais sao aqueles cujo resultado nao pode ser verificado por monitoramento/medicao posterior (ex: solda, tratamento termico, pintura). Eles precisam ser VALIDADOS e ter parametros controlados durante a execucao.'
    },
    {
      pergunta: 'Ao identificar produto nao conforme (clausula 8.7), qual acao e INADEQUADA?',
      alternativas: ['Segregar o produto em area identificada', 'Retrabalhar para tornar conforme', 'Misturar com produtos conformes para diluir o problema', 'Obter autorizacao do cliente para aceitacao sob concessao'],
      correta: 2,
      explicacao: 'Misturar produto nao conforme com conforme e totalmente inadequado e pode gerar entrega de produto defeituoso ao cliente. As acoes corretas sao: segregar, retrabalhar, devolver ou obter concessao do cliente.'
    }
  ];

  for (const q of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod4}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Modulo 5 ---
  const m5q = [
    {
      pergunta: 'Qual a diferenca entre CORRECAO e ACAO CORRETIVA?',
      alternativas: ['Sao sinonimos — significam a mesma coisa', 'Correcao resolve o problema imediato; acao corretiva elimina a causa para evitar recorrencia', 'Correcao e para problemas graves; acao corretiva e para problemas leves', 'Correcao e feita pela producao; acao corretiva e feita pela direcao'],
      correta: 1,
      explicacao: 'Correcao e a acao imediata para resolver o problema pontual (ex: retrabalhar a peca). Acao corretiva visa eliminar a causa raiz para que o problema nao se repita.'
    },
    {
      pergunta: 'A auditoria interna (clausula 9.2) exige que os auditores:',
      alternativas: ['Sejam funcionarios de empresas externas', 'Tenham imparcialidade — nao auditem seu proprio trabalho', 'Sejam engenheiros formados', 'Tenham pelo menos 10 anos de experiencia'],
      correta: 1,
      explicacao: 'A norma exige que os auditores sejam selecionados de forma a assegurar objetividade e imparcialidade do processo de auditoria. Ninguem audita seu proprio trabalho.'
    },
    {
      pergunta: 'Qual das seguintes NAO e uma entrada obrigatoria da analise critica pela direcao (clausula 9.3)?',
      alternativas: ['Satisfacao do cliente', 'Resultados de auditoria', 'Orcamento detalhado do proximo exercicio fiscal', 'Desempenho de provedores externos'],
      correta: 2,
      explicacao: 'O orcamento detalhado nao e entrada obrigatoria da analise critica. As entradas obrigatorias incluem: situacao de acoes anteriores, mudancas no contexto, desempenho do SGQ (satisfacao, objetivos, processos, NCs, auditorias, fornecedores), adequacao de recursos, eficacia de acoes para riscos e oportunidades de melhoria.'
    },
    {
      pergunta: 'A ferramenta "5 Porques" e utilizada para:',
      alternativas: ['Definir os 5 objetivos estrategicos da organizacao', 'Identificar a causa raiz de um problema perguntando "por que?" iterativamente', 'Avaliar 5 fornecedores simultaneamente', 'Planejar 5 auditorias por ano'],
      correta: 1,
      explicacao: 'A tecnica dos 5 Porques consiste em perguntar "por que?" repetidamente (tipicamente 5 vezes) ate chegar a causa raiz de um problema, saindo do sintoma superficial para a causa fundamental.'
    },
    {
      pergunta: 'A ausencia de reclamacoes formais de clientes pode ser interpretada como:',
      alternativas: ['Prova definitiva de satisfacao total dos clientes', 'Indicativo que nao precisa de pesquisa de satisfacao', 'Nao necessariamente indica satisfacao — a organizacao deve buscar ativamente a percepcao do cliente', 'Razao suficiente para eliminar o indicador de satisfacao'],
      correta: 2,
      explicacao: 'A norma e clara: a organizacao deve MONITORAR a percepcao do cliente. A ausencia de reclamacoes nao e evidencia de satisfacao — muitos clientes insatisfeitos simplesmente migram para concorrentes sem reclamar formalmente.'
    }
  ];

  for (const q of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod5}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Modulo 6 ---
  const m6q = [
    {
      pergunta: 'Qual a validade do certificado ISO 9001 e com que frequencia ocorrem auditorias de manutencao?',
      alternativas: ['5 anos com auditoria a cada 2 anos', '3 anos com auditorias de manutencao anuais', '1 ano com renovacao anual', '10 anos sem necessidade de auditorias intermediarias'],
      correta: 1,
      explicacao: 'O certificado ISO 9001 tem validade de 3 anos. Nesse periodo, ha auditorias de manutencao (vigilancia) anuais. Apos 3 anos, e necessaria auditoria de recertificacao.'
    },
    {
      pergunta: 'A auditoria de certificacao e dividida em duas fases. A Fase 1 consiste em:',
      alternativas: ['Auditoria completa no chao de fabrica', 'Analise documental e verificacao da prontidao do SGQ', 'Entrevista apenas com operadores', 'Teste de produto em laboratorio externo'],
      correta: 1,
      explicacao: 'A Fase 1 e a analise documental, onde o auditor verifica se a documentacao do SGQ esta adequada, se os requisitos estao enderecados e identifica areas de preocupacao para a Fase 2.'
    },
    {
      pergunta: 'Qual das seguintes e uma "armadilha" comum apos a certificacao?',
      alternativas: ['Manter as auditorias internas em dia', 'Atualizar os documentos quando os processos mudam', 'Coletar indicadores sem analisa-los e sem tomar acoes', 'Envolver a direcao nas analises criticas'],
      correta: 2,
      explicacao: 'Coletar dados sem analisa-los e agir sobre eles e uma armadilha comum — vira burocracia pura sem gerar valor. Os indicadores existem para apoiar decisoes e direcionar a melhoria.'
    },
    {
      pergunta: 'Qual organismo deve acreditar o certificador para que o certificado ISO 9001 tenha validade no Brasil?',
      alternativas: ['ABNT', 'Inmetro (ou membro do IAF)', 'Ministerio da Industria', 'ISO diretamente'],
      correta: 1,
      explicacao: 'O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do International Accreditation Forum — IAF). Um certificado de organismo nao acreditado nao tem validade de mercado.'
    },
    {
      pergunta: 'Antes da auditoria de certificacao (Fase 2), a organizacao deve ter:',
      alternativas: ['Apenas a documentacao pronta, sem necessidade de implementacao', 'O SGQ implementado e funcionando por pelo menos alguns meses, com evidencias de operacao', 'Apenas o Manual da Qualidade atualizado', 'Somente treinamento dos operadores concluido'],
      correta: 1,
      explicacao: 'O SGQ deve estar implementado e gerando evidencias de operacao (registros, indicadores, auditorias internas, analise critica) por pelo menos 3 meses antes da Fase 2. O auditor verifica implementacao e eficacia, nao apenas documentacao.'
    }
  ];

  for (const q of m6q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod6}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ FINAL — 30 questoes (is_final = true)
  // ═══════════════════════════════════════════════════════════════════
  const finalQuiz = [
    {
      pergunta: 'A ISO 9001:2015 e uma norma que define requisitos para:',
      alternativas: ['Sistemas de Gestao Ambiental', 'Sistemas de Gestao da Qualidade', 'Sistemas de Gestao de Saude e Seguranca', 'Sistemas de Gestao de Seguranca da Informacao'],
      correta: 1,
      explicacao: 'A ISO 9001 define requisitos para Sistemas de Gestao da Qualidade. ISO 14001 e ambiental, ISO 45001 e saude/seguranca, ISO 27001 e seguranca da informacao.'
    },
    {
      pergunta: 'Qual dos seguintes NAO e um dos 7 principios de gestao da qualidade?',
      alternativas: ['Foco no cliente', 'Minimizacao de custos', 'Melhoria', 'Tomada de decisao baseada em evidencia'],
      correta: 1,
      explicacao: 'Os 7 principios sao: Foco no cliente, Lideranca, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisao baseada em evidencia e Gestao de relacionamento. "Minimizacao de custos" nao e um principio.'
    },
    {
      pergunta: 'Na estrutura da ISO 9001:2015, a fase "Check" (Verificar) do ciclo PDCA corresponde a qual clausula?',
      alternativas: ['Clausula 6', 'Clausula 8', 'Clausula 9', 'Clausula 10'],
      correta: 2,
      explicacao: 'Check = Clausula 9 (Avaliacao de desempenho). Plan = Clausulas 4-6, Do = Clausulas 7-8, Act = Clausula 10.'
    },
    {
      pergunta: 'A principal mudanca conceitual da versao 2008 para 2015 foi:',
      alternativas: ['Obrigatoriedade de certificacao para todas as empresas', 'Introducao da mentalidade de risco em substituicao a acao preventiva', 'Exigencia de 20 procedimentos documentados obrigatorios', 'Eliminacao da necessidade de indicadores'],
      correta: 1,
      explicacao: 'A mentalidade de risco (clausula 6.1) substituiu a acao preventiva da versao 2008, permeando toda a norma com a consideracao de riscos e oportunidades nas decisoes.'
    },
    {
      pergunta: 'A analise de contexto (clausula 4.1) deve considerar:',
      alternativas: ['Apenas fatores externos do mercado', 'Apenas fatores internos da organizacao', 'Fatores externos e internos pertinentes', 'Apenas fatores financeiros'],
      correta: 2,
      explicacao: 'A clausula 4.1 exige que a organizacao determine questoes externas (mercado, legislacao, tecnologia) e internas (cultura, recursos, competencias) pertinentes ao SGQ.'
    },
    {
      pergunta: 'Qual ferramenta e mais comumente utilizada por PMEs para atender a clausula 4.1?',
      alternativas: ['Balanced Scorecard', 'Analise SWOT', 'Six Sigma DMAIC', 'Diagrama de Gantt'],
      correta: 1,
      explicacao: 'A analise SWOT (Forcas, Fraquezas, Oportunidades, Ameacas) e a ferramenta mais comum e pratica para PMEs analisarem seu contexto interno e externo.'
    },
    {
      pergunta: 'A palavra-chave na clausula 4.2 sobre partes interessadas e:',
      alternativas: ['Todas', 'Pertinentes', 'Prioritarias', 'Financeiras'],
      correta: 1,
      explicacao: 'A norma pede que sejam identificadas as partes interessadas "pertinentes" ao SGQ — nao todas as existentes, mas aquelas que efetivamente impactam ou sao impactadas pelo SGQ.'
    },
    {
      pergunta: 'O escopo do SGQ (clausula 4.3) deve declarar:',
      alternativas: ['Apenas o nome da empresa', 'Os tipos de produtos e servicos cobertos, com justificativa para nao aplicabilidades', 'O faturamento anual da empresa', 'A lista completa de funcionarios'],
      correta: 1,
      explicacao: 'O escopo deve declarar os tipos de produtos/servicos cobertos pelo SGQ e justificar qualquer requisito da norma considerado nao aplicavel.'
    },
    {
      pergunta: 'Na versao 2015, a figura do Representante da Direcao (RD):',
      alternativas: ['Continua obrigatoria como na versao 2008', 'Deixou de ser obrigatoria — a responsabilidade pelo SGQ e da alta direcao', 'Foi substituida por um comite externo obrigatorio', 'Passou a ser exigida em duplicidade'],
      correta: 1,
      explicacao: 'A versao 2015 eliminou a obrigatoriedade do RD para que a responsabilidade pelo SGQ seja da alta direcao como um todo, nao delegada a uma unica pessoa.'
    },
    {
      pergunta: 'A politica da qualidade deve ser:',
      alternativas: ['Identica para todas as empresas do mesmo setor', 'Generica para se aplicar a qualquer situacao', 'Apropriada ao contexto e proposito da organizacao, comunicada e entendida', 'Confidencial e acessivel apenas a direcao e auditores'],
      correta: 2,
      explicacao: 'A politica deve ser apropriada ao contexto, prover estrutura para objetivos, incluir comprometimentos obrigatorios, ser comunicada e entendida na organizacao e disponivel para partes interessadas.'
    },
    {
      pergunta: 'A gestao de riscos na ISO 9001:2015 exige:',
      alternativas: ['Uso obrigatorio de FMEA em todos os processos', 'Contratacao de especialista externo em riscos', 'Considerar riscos e oportunidades de forma proporcional a complexidade da organizacao', 'Certificacao ISO 31000 como pre-requisito'],
      correta: 2,
      explicacao: 'A norma nao exige metodologia formal especifica. Pede que a organizacao considere riscos e oportunidades de forma proporcional. Uma PME pode usar uma planilha simples; uma grande industria pode usar FMEA ou outras metodologias.'
    },
    {
      pergunta: 'Para cada objetivo da qualidade (clausula 6.2), a organizacao deve determinar:',
      alternativas: ['Apenas a meta numerica', 'O que sera feito, recursos, responsavel, prazo e como avaliar resultados', 'Apenas o indicador de monitoramento', 'Apenas a data de inicio'],
      correta: 1,
      explicacao: 'A clausula 6.2 exige plano de acao completo: o que sera feito, recursos necessarios, responsavel, prazo e como os resultados serao avaliados.'
    },
    {
      pergunta: 'A clausula 7.1.6 (Conhecimento organizacional) foi introduzida para tratar do problema de:',
      alternativas: ['Excesso de documentacao', 'Conhecimento critico que esta "na cabeca das pessoas" e pode ser perdido', 'Sigilo industrial', 'Protecao de dados pessoais (LGPD)'],
      correta: 1,
      explicacao: 'A clausula 7.1.6 trata da gestao do conhecimento organizacional — garantir que o conhecimento necessario seja identificado, mantido e disponibilizado, evitando perda quando pessoas-chave saem da organizacao.'
    },
    {
      pergunta: 'Na ISO 9001:2015, o termo "informacao documentada" unificou os antigos conceitos de:',
      alternativas: ['Apenas "documento" e "manual"', 'Apenas "registro" e "formulario"', '"Documento", "registro" e "procedimento documentado"', '"Politica" e "objetivo"'],
      correta: 2,
      explicacao: 'O termo "informacao documentada" unificou tres conceitos da versao 2008: "documento" (procedimento, instrucao), "registro" (evidencia) e "procedimento documentado" (os 6 obrigatorios).'
    },
    {
      pergunta: '"Manter informacao documentada" na ISO 9001:2015 equivale ao antigo conceito de:',
      alternativas: ['Registro', 'Documento (que se atualiza)', 'Backup', 'Formulario em branco'],
      correta: 1,
      explicacao: '"Manter" = documento (algo atualizado, como procedimento ou politica). "Reter" = registro (evidencia de atividade realizada, como relatorio de inspecao).'
    },
    {
      pergunta: 'A analise critica de requisitos do cliente (clausula 8.2.3) deve ser realizada:',
      alternativas: ['Depois da entrega do produto', 'Antes de a organizacao se comprometer a fornecer', 'Apenas quando o cliente reclama', 'Somente para pedidos acima de R$ 10.000'],
      correta: 1,
      explicacao: 'A analise critica deve ser feita ANTES de aceitar o pedido/contrato, para garantir que a organizacao tem capacidade de atender todos os requisitos especificados.'
    },
    {
      pergunta: 'A calibracao de instrumentos (clausula 7.1.5) e necessaria quando:',
      alternativas: ['O instrumento e novo', 'O monitoramento/medicao e usado para verificar conformidade de produtos/servicos', 'O instrumento custou mais de R$ 1.000', 'O cliente solicita especificamente'],
      correta: 1,
      explicacao: 'A calibracao e necessaria quando o instrumento e usado para verificar conformidade de produtos/servicos com requisitos. Nao depende do custo do instrumento, mas do seu uso para inspecao/controle.'
    },
    {
      pergunta: 'Um "processo especial" e aquele cujo resultado:',
      alternativas: ['Custa mais que os demais processos', 'Nao pode ser verificado por inspecao posterior — requer validacao', 'E destinado a clientes VIP', 'Envolve mais de 10 funcionarios'],
      correta: 1,
      explicacao: 'Processos especiais (ex: solda, tratamento termico, pintura) produzem resultados que nao podem ser verificados por inspecao posterior sem destruicao. Por isso, devem ser VALIDADOS e controlados durante a execucao.'
    },
    {
      pergunta: 'O controle de fornecedores (clausula 8.4) deve ser proporcional a:',
      alternativas: ['Ao faturamento do fornecedor', 'Ao impacto do produto/servico fornecido na conformidade do produto final', 'A distancia geografica do fornecedor', 'A idade do relacionamento comercial'],
      correta: 1,
      explicacao: 'O nivel de controle deve ser proporcional ao impacto que o produto/servico do fornecedor tem na conformidade do produto final. Um fornecedor de materia-prima critica requer mais controle que um fornecedor de material de escritorio.'
    },
    {
      pergunta: 'Ao identificar produto nao conforme (clausula 8.7), a primeira acao deve ser:',
      alternativas: ['Destruir o produto imediatamente', 'Identificar e segregar para prevenir uso ou entrega nao intencional', 'Enviar ao cliente com desconto', 'Registrar e continuar a producao normalmente'],
      correta: 1,
      explicacao: 'A primeira acao e identificar e segregar (separar) o produto nao conforme para evitar que seja usado ou entregue por engano. Depois se decide a disposicao (retrabalho, refugo, concessao).'
    },
    {
      pergunta: 'A satisfacao do cliente (clausula 9.1.2) deve ser monitorada:',
      alternativas: ['Apenas quando ha reclamacoes formais', 'Ativamente, usando metodos definidos pela organizacao', 'Apenas a cada 3 anos na recertificacao', 'Somente por pesquisa impressa enviada pelo correio'],
      correta: 1,
      explicacao: 'A organizacao deve determinar metodos para obter, monitorar e analisar a percepcao dos clientes. A norma nao especifica qual metodo — pode ser pesquisa, entrevista, analise de indicadores, etc. Mas deve ser ativo, nao passivo.'
    },
    {
      pergunta: 'Em uma auditoria interna (clausula 9.2), o gerente de producao pode auditar:',
      alternativas: ['O processo de producao que ele gerencia', 'Qualquer processo, exceto o que ele gerencia', 'Apenas processos de apoio', 'Apenas a documentacao, nao o processo'],
      correta: 1,
      explicacao: 'A norma exige imparcialidade — o auditor nao pode auditar seu proprio trabalho. O gerente de producao pode auditar outros processos (compras, RH, qualidade), mas nao a producao.'
    },
    {
      pergunta: 'As saidas da analise critica pela direcao (clausula 9.3.3) devem incluir:',
      alternativas: ['Apenas um relatorio informativo sem acoes', 'Decisoes e acoes sobre oportunidades de melhoria, mudancas no SGQ e necessidade de recursos', 'Apenas a data da proxima reuniao', 'Apenas a aprovacao do orcamento anual'],
      correta: 1,
      explicacao: 'As saidas devem ser decisoes e acoes concretas sobre: oportunidades de melhoria, necessidade de mudancas no SGQ e necessidade de recursos. Nao pode ser apenas "manter monitoramento".'
    },
    {
      pergunta: 'A diferenca fundamental entre correcao e acao corretiva e:',
      alternativas: ['Correcao e mais cara, acao corretiva e mais barata', 'Correcao e para problemas grandes, acao corretiva e para problemas pequenos', 'Correcao trata o efeito imediato, acao corretiva elimina a causa raiz', 'Nao ha diferenca — sao sinonimos'],
      correta: 2,
      explicacao: 'Correcao = acao imediata para resolver o problema pontual (retrabalhar a peca). Acao corretiva = acao para eliminar a causa raiz e prevenir recorrencia (recalibrar maquina, retreinar operador).'
    },
    {
      pergunta: 'A clausula 10.3 (Melhoria continua) pede que a organizacao:',
      alternativas: ['Apenas corrija problemas quando surgirem', 'Melhore continuamente a adequacao, suficiencia e eficacia do SGQ', 'Mude todos os processos a cada 6 meses', 'Contrate consultoria externa permanente'],
      correta: 1,
      explicacao: 'A melhoria continua vai alem de corrigir problemas. A organizacao deve buscar ativamente oportunidades de melhoria usando resultados de analises, auditorias e analises criticas.'
    },
    {
      pergunta: 'O certificado ISO 9001 tem validade de:',
      alternativas: ['1 ano', '2 anos', '3 anos', '5 anos'],
      correta: 2,
      explicacao: 'O certificado ISO 9001 tem validade de 3 anos, com auditorias de manutencao (vigilancia) anuais. Apos 3 anos, e necessaria auditoria de recertificacao.'
    },
    {
      pergunta: 'Numa auditoria de certificacao, uma nao conformidade maior significa que:',
      alternativas: ['A certificacao e concedida com ressalvas', 'A certificacao NAO e concedida ate a resolucao da NC', 'A empresa deve pagar uma multa', 'O certificado e emitido mas com validade reduzida'],
      correta: 1,
      explicacao: 'Uma NC maior (falha sistematica ou ausencia de requisito) impede a concessao da certificacao. A empresa tem prazo (geralmente 90 dias) para resolver, e o auditor verifica a resolucao antes de conceder o certificado.'
    },
    {
      pergunta: 'Qual das seguintes clausulas NAO contem requisitos auditaveis?',
      alternativas: ['Clausula 4 (Contexto)', 'Clausula 7 (Apoio)', 'Clausula 3 (Termos e definicoes)', 'Clausula 10 (Melhoria)'],
      correta: 2,
      explicacao: 'A clausula 3 (Termos e definicoes) e informativa — remete a ISO 9000:2015. As clausulas 4 a 10 contem requisitos auditaveis.'
    },
    {
      pergunta: 'A abordagem de processo (clausula 4.4) exige que para cada processo sejam determinados:',
      alternativas: ['Apenas o nome e o responsavel', 'Entradas, saidas, sequencia, criterios, recursos, responsabilidades e riscos', 'Apenas o fluxograma', 'Apenas o indicador de resultado'],
      correta: 1,
      explicacao: 'A clausula 4.4 exige determinacao completa: entradas, saidas, sequencia e interacao, criterios e metodos, recursos, responsabilidades e autoridades, riscos e oportunidades, e acoes de melhoria.'
    },
    {
      pergunta: 'Ao planejar uma mudanca no SGQ (clausula 6.3), a organizacao deve considerar, EXCETO:',
      alternativas: ['O proposito da mudanca e suas consequencias', 'A integridade do SGQ', 'A opiniao dos concorrentes sobre a mudanca', 'A disponibilidade de recursos e a realocacao de responsabilidades'],
      correta: 2,
      explicacao: 'A clausula 6.3 exige considerar proposito e consequencias, integridade do SGQ, disponibilidade de recursos e realocacao de responsabilidades. A opiniao de concorrentes nao faz parte dos requisitos.'
    }
  ];

  for (const q of finalQuiz) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${null}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, true)`;
  }

  console.log(`Curso 1 seed completo: courseId=${courseId}, 6 modulos, 24 aulas, 30 quiz de modulo + 30 quiz final`);
  return courseId;
}
