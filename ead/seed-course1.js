// ═══════════════════════════════════════════════════════════════════════════
// seed-course1.js — ISO 9001:2015 Interpretação dos Requisitos
// Curso completo: 6 módulos, 24 aulas, 30 quiz de módulo + 30 quiz final
// ═══════════════════════════════════════════════════════════════════════════
// Uso:  import { seedCourse1 } from './seed-course1.js';
//       await seedCourse1(sql);   // sql = neon tagged template

export async function seedCourse1(sql) {

  // ─── Limpar dados anteriores deste curso (idempotente) ──────────────
  const existing = await sql`SELECT id FROM ead_courses WHERE slug = 'iso-9001-2015-interpretação'`;
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
      'iso-9001-2015-interpretação',
      'ISO 9001:2015 — Interpretação dos Requisitos',
      'Domine cada cláusula da norma e saiba aplicar na prática da sua empresa',
      'Curso completo de 12 horas cobrindo todos os requisitos da ISO 9001:2015 com exemplos reais da indústria metalúrgica, alimentícia, construção civil e agronegócio. Aprenda a interpretar, implementar e manter um Sistema de Gestão da Qualidade robusto e pronto para certificação.',
      '12h',
      397.00,
      597.00,
      'Gestores, coordenadores de qualidade, analistas, empresários',
      'Nenhum',
      'Compreender todos os requisitos da ISO 9001:2015 e saber como aplica-los na prática da sua empresa, com exemplos reais da indústria.',
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
    VALUES (${courseId}, 'Fundamentos da ISO 9001', 'O que e a ISO 9001, os 7 princípios, estrutura de 10 cláusulas e diferenças entre as versoes 2008 e 2015.', 1)
    RETURNING id
  `;
  const mod1 = mod1Rows[0].id;

  // --- Aula 1.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod1}, 'o-que-e-iso-9001', 'O que e a ISO 9001 e por que ela importa', '30 min', 1, ${`
<h2>O que e a ISO 9001 e por que ela importa</h2>

<p>A ISO 9001 e a norma internacional mais útilizada no mundo para Sistemas de Gestão da Qualidade (SGQ). Publicada pela International Organization for Standardization (ISO), ela define requisitos que qualquer organização — independente do porte, setor ou localização — pode adotar para garantir que seus produtos e serviços atendam consistentemente aos requisitos dos clientes e requisitos regulamentares aplicáveis.</p>

<p>Ate 2024, mais de 1,1 milhão de certificados ISO 9001 estavam ativos em 170 países. No Brasil, segundo dados do Inmetro/ABNT, há mais de 20.000 certificados válidos, com forte concentração na indústria metalmecânica, alimentícia e de construção civil.</p>

<h3>Uma breve história</h3>

<p>A primeira versão da ISO 9001 foi publicada em 1987, baseada em normas militares britanicas (BS 5750). Desde entao, passou por revisoes em 1994, 2000, 2008 e a versão atual de 2015. Cada revisão tornou a norma mais orientada a resultados e menos burocratica.</p>

<table>
  <tr><th>Versão</th><th>Foco principal</th><th>Mudança-chave</th></tr>
  <tr><td>1987</td><td>Conformidade de produto</td><td>Primeira publicação internacional</td></tr>
  <tr><td>1994</td><td>Ações preventivas</td><td>Ênfase em documentação</td></tr>
  <tr><td>2000</td><td>Abordagem de processos</td><td>Redução de documentação obrigatória</td></tr>
  <tr><td>2008</td><td>Compatibilidade com ISO 14001</td><td>Ajustes de clareza</td></tr>
  <tr><td>2015</td><td>Mentalidade de risco e contexto</td><td>Estrutura de Alto Nível (Anexo SL)</td></tr>
</table>

<h3>O que a ISO 9001 NÃO e</h3>

<p>Um equívoco comum: a ISO 9001 não e uma norma de produto. Ela não diz qual o teor de carbono do açonem a temperatura de pasteurização do leite. O que ela garante e que a organização tenha <strong>processos consistentes</strong> para planejar, executar, verificar e melhorar suas atividades. Em outras palavras, a norma cuida do <em>sistema</em>, não do <em>produto</em> diretamente.</p>

<div class="callout"><strong>Importante:</strong> A ISO 9001 e genérica por design. Isso significa que uma metalúrgica de 30 funcionários e uma multinacional de alimentos podem ambas ser certificadas — o nível de complexidade do SGQ e que muda.</div>

<h3>Por que buscar a certificação?</h3>

<ul>
  <li><strong>Requisito de mercado:</strong> muitas montadoras, redes de varejo e órgãos publicos exigem ISO 9001 de seus fornecedores. Na indústria automotiva brasileira, por exemplo, e práticamente impossível entrar na cadeia de suprimentos sem certificação.</li>
  <li><strong>Redução de custos da não-qualidade:</strong> retrabalho, refugo, devoluções e reclamações custam entre 5% e 25% do faturamento em empresas sem gestão estruturada. Um SGQ bem implementado reduz esses custos de forma mensurável.</li>
  <li><strong>Melhoria da gestão interna:</strong> processos claros, responsabilidades definidas, indicadores monitorados — beneficios que vao muito alem do selo na parede.</li>
  <li><strong>Credibilidade:</strong> para clientes nacionais e internacionais, o certificado ISO 9001 e um sinal de comprometimento com a qualidade.</li>
</ul>

<div class="example"><strong>Exemplo prático:</strong> Uma metalúrgica em Caxias do Sul fábricava eixos para transmissoes. O principal cliente (uma montadora) notificou que a partir do próximo contrato exigiria ISO 9001. A empresa tinha 8 meses para se certificar. O projeto envolveu mapear 14 processos, definir indicadores e treinar 45 colaboradores. Resultado: certificação obtida em 7 meses, redução de 32% no índice de refugo e abertura de mais 3 clientes no setor automotivo.</div>

<h3>A estrutura básica do SGQ</h3>

<p>Um Sistema de Gestão da Qualidade baseado na ISO 9001 tem quatro pilares fundamentais:</p>

<ol>
  <li><strong>Contexto e liderança</strong> — entender onde a organização esta inserida e garantir comprometimento da alta direção.</li>
  <li><strong>Planejamento e suporte</strong> — definir objetivos, alocar recursos e gerenciar riscos.</li>
  <li><strong>Operação</strong> — executar os processos que entregam valor ao cliente.</li>
  <li><strong>Avaliação e melhoria</strong> — medir resultados, auditar e melhorar continuamente.</li>
</ol>

<p>Esses quatro pilares seguem a lógica do ciclo PDCA (Plan-Do-Check-Act), que e o motor de qualquer sistema de gestão. Ao longo deste curso, você vai ver como cada cláusula da norma se encaixa nesse ciclo.</p>

<h3>Quem pode ser certificado?</h3>

<p>Qualquer organização: indústria, comércio, serviços, governo, ONGs. Não há restrição de porte — desde um escritório de engenharia com 5 pessoas até uma usina siderúrgica com 3.000 colaboradores. A norma se adapta a complexidade da organização.</p>

<div class="callout"><strong>Importante:</strong> A certificação e voluntária. Nenhuma lei brasileira obriga uma empresa a ser ISO 9001. Porém, o mercado — especialmente em cadeias de fornecimento indústriais — frequentemente a torna uma exigência contratual.</div>

<div class="template-box"><span>Download: Checklist - Beneficios da ISO 9001 para apresentar a direção</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod1}, 'sete-princípios-qualidade', 'Os 7 Princípios de Gestão da Qualidade', '30 min', 2, ${`
<h2>Os 7 Princípios de Gestão da Qualidade</h2>

<p>A ISO 9001:2015 e construida sobre sete princípios de gestão da qualidade. Eles não são requisitos auditaveis diretamente, mas formam a base filosofica de toda a norma. Entender esses princípios e fundamental para interpretar os requisitos de forma inteligente — e não apenas "cumprir tabela".</p>

<h3>1. Foco no cliente</h3>

<p>O propósito fundamental de qualquer organização e atender (e superar) as expectativas dos clientes. Isso vai muito alem de "entregar o que o cliente pediu". Envolve entender necessidades não declaradas, antecipar tendências e medir a satisfação de forma sistemática.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma indústria de alimentos em Chapeco recebia pouquíssimas reclamações formais. A direção assumia que os clientes estavam satisfeitos. Ao implementar uma pesquisa estruturada, descobriu que 40% dos distribuidores tinham problemas com o prazo de entrega — mas nunca reclamavam formalmente, simplesmente migravam para concorrentes. O foco no cliente exige ir buscar a informação, não esperar ela chegar.</div>

<h3>2. Liderança</h3>

<p>Lideres em todos os niveis devem criar condições para que as pessoas se comprometam com os objetivos da qualidade. Isso significa que a alta direção não pode "delegar a qualidade para o RD" — ela precisa demonstrar comprometimento com ações concretas: participar de análises críticas, alocar recursos, comúnicar a importancia do SGQ.</p>

<div class="callout"><strong>Importante:</strong> Na versão 2015, a figura do "Representante da Direção" (RD) deixou de ser obrigatória. A intenção e que a responsabilidade pela qualidade seja da alta direção, não de uma única pessoa.</div>

<h3>3. Engajamento de pessoas</h3>

<p>Pessoas competentes, habilitadas e engajadas são essênciais. Não basta ter processos documentados se as pessoas não entendem seu papel, não tem treinamento adequado ou não se sentem parte do sistema.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma construtora em Curitiba tinha procedimentos detalhados para controle de concreto, mas os mestrês de obra não participaram da elaboração e não viam valor nos formularios. O índice de preenchimento era de 30%. Após envolver os mestrês na revisão dos formularios — simplificando e tornando relevantes para o dia a dia deles — o preenchimento subiu para 92% em dois meses.</div>

<h3>4. Abordagem de processo</h3>

<p>Resultados consistentes são alcancados de forma mais eficaz quando as atividades são entendidas e gerenciadas como processos inter-relacionados que funcionam como um sistema coerente. Isso significa:</p>

<ul>
  <li>Cada processo tem entradas, atividades, saídas e indicadores.</li>
  <li>Os processos tem donos (responsáveis) definidos.</li>
  <li>As interações entre processos são mapeadas (o que um processo entrega ao próximo).</li>
</ul>

<p>Na prática, isso se traduz no <strong>mapa de processos</strong> da organização — um dos primeiros documentos que um auditor pede para ver.</p>

<h3>5. Melhoria</h3>

<p>Organizações de sucesso tem um foco permanente em melhoria. Não se trata apenas de corrigir problemas (isso e o mínimo), mas de buscar ativamente oportunidades de fazer melhor, mais rápido, com menos desperdício.</p>

<p>A melhoria pode ser incremental (kaizen, pequenos ajustes diarios) ou disruptiva (mudança de tecnologia, redesenho de processo). A ISO 9001 pede ambas.</p>

<h3>6. Tomada de decisão baseada em evidência</h3>

<p>Decisões baseadas em análise de dados e informações tem maior probabilidade de produzir resultados desejados. Isso não significa "burocratizar tudo com planilhas", mas sim garantir que decisões importantes sejam apoiadas por fatos, não por achismos.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma cooperativa agrícola em Toledo-PR decidia o volume de compra de insumos "pelo feeling" do gerente. Após implementar análise de dados históricos de safra e consumo, reduziu o estoque parado em 28% e o desperdício por vencimento em 45%.</div>

<h3>7. Gestão de relacionamento</h3>

<p>Uma organização não opera isolada. Fornecedores, parceiros, distribuidores e até órgãos reguladores impactam sua capacidade de entregar qualidade. Gerenciar esses relacionamentos de forma proativa — e não apenas reagir a problemas — e essêncial.</p>

<p>Na indústria metalúrgica, por exemplo, um fornecedor de materia-prima instável pode comprometer toda a cadeia produtiva. Avaliar, qualificar e desenvolver fornecedores e parte da gestão de relacionamento.</p>

<h3>Como os princípios se conectam com a norma</h3>

<table>
  <tr><th>Princípio</th><th>Cláusulas mais relacionadas</th></tr>
  <tr><td>Foco no cliente</td><td>5.1.2, 8.2, 9.1.2</td></tr>
  <tr><td>Liderança</td><td>5.1, 5.2, 5.3</td></tr>
  <tr><td>Engajamento de pessoas</td><td>7.1.2, 7.2, 7.3</td></tr>
  <tr><td>Abordagem de processo</td><td>4.4, 8.1</td></tr>
  <tr><td>Melhoria</td><td>10.1, 10.2, 10.3</td></tr>
  <tr><td>Decisão baseada em evidência</td><td>9.1, 9.3</td></tr>
  <tr><td>Gestão de relacionamento</td><td>8.4</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> Auditores não auditam "princípios" diretamente. Porém, se você entender os princípios, vai interpretar os requisitos com muito mais profundidade. Um auditor experiente percebe rápidamente se a organização realmente internalizou esses conceitos ou se esta apenas "jogando papel".</div>

<div class="template-box"><span>Download: Quadro-resumo dos 7 princípios com aplicação prática</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod1}, 'estrutura-10-cláusulas', 'Estrutura de 10 Cláusulas (Anexo SL)', '30 min', 3, ${`
<h2>Estrutura de 10 Cláusulas e o Anexo SL</h2>

<p>A partir da versão 2015, a ISO 9001 adotou a chamada <strong>Estrutura de Alto Nível</strong> (High Level Structure — HLS), definida pelo Anexo SL da ISO. Essa estrutura padroniza todas as normas de sistemas de gestão (ISO 9001, ISO 14001, ISO 45001, etc.) em 10 cláusulas, fácilitando a integração entre elas.</p>

<h3>As 10 cláusulas</h3>

<ol>
  <li><strong>Escopo</strong> — Define o que a norma cobre.</li>
  <li><strong>Referencia normativa</strong> — Documentos referênciados (ISO 9000:2015 - Fundamentos e vocabulario).</li>
  <li><strong>Termos e definições</strong> — Remete a ISO 9000:2015.</li>
  <li><strong>Contexto da organização</strong> — Entender o ambiente interno e externo, partes interessadas, escopo do SGQ e processos.</li>
  <li><strong>Liderança</strong> — Comprometimento da alta direção, política da qualidade e responsabilidades.</li>
  <li><strong>Planejamento</strong> — Riscos e oportunidades, objetivos da qualidade e planejamento de mudanças.</li>
  <li><strong>Apoio</strong> — Recursos, competência, conscientização, comúnicação e informação documentada.</li>
  <li><strong>Operação</strong> — Planejamento e controle operacional, requisitos de produtos/serviços, projeto, fornecedores, produção e liberação.</li>
  <li><strong>Avaliação de desempenho</strong> — Monitoramento, auditoria interna e análise crítica pela direção.</li>
  <li><strong>Melhoria</strong> — Não conformidade, ação corretiva e melhoria contínua.</li>
</ol>

<div class="callout"><strong>Importante:</strong> As cláusulas 1 a 3 são informativas (não contem requisitos auditaveis). Os requisitos que você precisa implementar estão nas cláusulas 4 a 10.</div>

<h3>A lógica do PDCA nas cláusulas</h3>

<p>A norma organiza os requisitos seguindo o ciclo PDCA:</p>

<table>
  <tr><th>Fase PDCA</th><th>Cláusulas</th><th>O que acontece</th></tr>
  <tr><td>Plan (Planejar)</td><td>4, 5, 6</td><td>Entender o contexto, definir liderança e planejar ações</td></tr>
  <tr><td>Do (Fazer)</td><td>7, 8</td><td>Alocar recursos e executar os processos operacionais</td></tr>
  <tr><td>Check (Verificar)</td><td>9</td><td>Monitorar, medir, auditar e analisar críticamente</td></tr>
  <tr><td>Act (Agir)</td><td>10</td><td>Tratar não conformidades e melhorar continuamente</td></tr>
</table>

<p>Essa organização não e arbitraria — ela reflete a forma como qualquer sistema de gestão deveria funcionar. Primeiro você planeja (entende onde esta e para onde quer ir), depois executa, depois verifica se deu certo e então ajusta.</p>

<h3>Leitura cruzada entre cláusulas</h3>

<p>Um erro comum de quem esta comecando: ler cada cláusula isoladamente. Na prática, as cláusulas conversam entre si constantemente. Exemplos:</p>

<ul>
  <li>A cláusula 6.1 (riscos) alimenta a cláusula 8.1 (planejamento operacional).</li>
  <li>A cláusula 9.1.2 (satisfação do cliente) alimenta a cláusula 9.3 (análise crítica) e a cláusula 10.3 (melhoria contínua).</li>
  <li>A cláusula 7.5 (informação documentada) permeia TODAS as outras cláusulas.</li>
</ul>

<div class="example"><strong>Exemplo prático:</strong> Em uma auditoria numa fábrica de estruturas metalicas, o auditor encontrou que a empresa tinha uma otima gestão de riscos documentada (cláusula 6.1), mas na operação (cláusula 8) não havia evidência de que esses riscos eram considerados no planejamento da produção. Resultado: não conformidade menor. A empresa tinha "papel" mas não tinha "conexao" entre as cláusulas.</div>

<h3>Terminologia essêncial</h3>

<p>Antes de avancar, alinhe o vocabulario. Termos que você vai encontrar em toda a norma:</p>

<ul>
  <li><strong>Informação documentada</strong> — substitui "procedimento documentado", "registro" e "manual da qualidade" da versão 2008. Agora e um termo único e flexível.</li>
  <li><strong>Parte interessada</strong> — qualquer pessoa ou organização que pode afetar, ser afetada ou se perceber afetada pelas decisões da empresa (clientes, funcionários, fornecedores, comunidade, órgãos reguladores).</li>
  <li><strong>Risco</strong> — efeito da incerteza. Pode ser positivo (oportunidade) ou negativo (ameaca).</li>
  <li><strong>Contexto</strong> — o ambiente em que a organização opera (fatores internos e externos).</li>
  <li><strong>Processo</strong> — conjunto de atividades inter-relacionadas que transformam entradas em saídas.</li>
</ul>

<div class="callout"><strong>Importante:</strong> Na versão 2015, a norma NÃO exige mais um Manual da Qualidade como documento obrigatório. Você pode ter um se quiser, mas não e exigido. O que a norma pede e que a informação documentada necessária esteja disponível e controlada.</div>

<h3>Beneficios da Estrutura de Alto Nível</h3>

<p>Se sua empresa já tem ou pretende ter ISO 14001 (meio ambiente) ou ISO 45001 (saude e segurança), a estrutura comum fácilita enormemente a integração. Os requisitos de contexto, liderança, planejamento, apoio, avaliação e melhoria são identicos em estrutura — muda apenas o foco técnico.</p>

<div class="template-box"><span>Download: Mapa visual das 10 cláusulas x PDCA</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod1}, 'diferenças-2008-2015', 'Diferenças entre ISO 9001:2008 e 2015', '30 min', 4, ${`
<h2>Diferenças entre ISO 9001:2008 e ISO 9001:2015</h2>

<p>Se você trabalhou com a versão 2008, precisa entender o que mudou — e por que. Se você e novo na norma, esse comparativo ajuda a entender a evolução do pensamento de gestão da qualidade. A revisão de 2015 foi a mais significativa desde a de 2000.</p>

<h3>Mudanças estruturais</h3>

<table>
  <tr><th>Aspecto</th><th>ISO 9001:2008</th><th>ISO 9001:2015</th></tr>
  <tr><td>Estrutura</td><td>8 cláusulas</td><td>10 cláusulas (Anexo SL)</td></tr>
  <tr><td>Manual da qualidade</td><td>Obrigatório</td><td>Não obrigatório</td></tr>
  <tr><td>Representante da Direção</td><td>Obrigatório</td><td>Não obrigatório (responsabilidade distribuida)</td></tr>
  <tr><td>Procedimentos documentados</td><td>6 obrigatórios</td><td>Nenhum obrigatório específico (informação documentada conforme necessidade)</td></tr>
  <tr><td>Acao preventiva</td><td>Cláusula específica (8.5.3)</td><td>Substituida por gestão de riscos (6.1)</td></tr>
  <tr><td>Exclusoes</td><td>Permitidas (cláusula 7)</td><td>Não há "exclusoes" — usa-se "aplicabilidade" (cláusula 4.3)</td></tr>
</table>

<h3>Novidades conceituais da versão 2015</h3>

<h3>1. Contexto da organização (cláusula 4)</h3>

<p>Na versão 2008, não existia nenhum requisito para entender o ambiente externo e interno da organização. A versão 2015 exige que a empresa análise fatores como mercado, tecnologia, legislação, cultura organizacional e expectativas das partes interessadas. E a norma reconhecendo que qualidade não existe no vacuo — ela depende do contexto.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma construtora que atuava só em obras residenciais decidiu entrar no mercado de obras publicas. O contexto mudou completamente: novas legislações (Lei de Licitações), novos requisitos de documentação, novos riscos. A análise de contexto da cláusula 4 obriga a empresa a reconhecer e tratar essas mudanças formalmente.</div>

<h3>2. Mentalidade de risco</h3>

<p>A maior mudança conceitual. A versão 2008 tinha "ações preventivas" como um requisito formal que ninguem conseguia implementar de forma convincente. A versão 2015 eliminou essa cláusula e substituiu por algo muito mais poderoso: a mentalidade de risco permeando toda a norma.</p>

<p>Agora, toda vez que você planeja um processo, define um objetivo ou modifica algo, precisa considerar: quais riscos isso traz? Quais oportunidades? O que pode dar errado? O que pode dar mais certo do que o esperado?</p>

<div class="callout"><strong>Importante:</strong> A norma NÃO exige uma métodologia formal de gestão de riscos (como FMEA ou ISO 31000). Ela pede que a organização considere riscos e oportunidades de forma proporcional a sua complexidade. Uma microempresa pode fazer isso com uma planilha simples; uma indústria complexa pode usar FMEA, Bow-Tie ou outra métodologia estruturada.</div>

<h3>3. Liderança mais ativa</h3>

<p>Na versão 2008, a alta direção podia "delegar" a gestão da qualidade ao Representante da Direção. Na versão 2015, a norma e explicita: a alta direção deve demonstrar liderança e comprometimento com relação ao SGQ, garantir que a política e os objetivos sejam compativeis com a direção estratégica, integrar os requisitos do SGQ nos processos de negócio e promover a mentalidade de risco.</p>

<h3>4. Informação documentada (novo termo)</h3>

<p>O termo "informação documentada" substituiu três termos anteriores:</p>

<ul>
  <li>"Documento" (procedimento, instrução de trabalho, manual)</li>
  <li>"Registro" (evidência de que algo foi feito)</li>
  <li>"Procedimento documentado" (os 6 obrigatórios da versão 2008)</li>
</ul>

<p>Agora tudo e "informação documentada". A norma diz quando você deve "manter" (documento) e quando deve "reter" (registro). Essa flexibilidade permite que cada organização defina o nível de documentação adequado para sua realidade.</p>

<h3>5. Pensamento baseado em processos reforcado</h3>

<p>A versão 2008 já falava em abordagem de processos, mas a 2015 reforcou significativamente. A cláusula 4.4 exige que a organização determine seus processos, suas interações, critérios de monitoramento, recursos necessários e responsabilidades. Na prática, o mapa de processos ficou mais importante.</p>

<h3>O que NÃO mudou</h3>

<ul>
  <li>A essência da norma contínua a mesma: entregar consistentemente produtos e serviços que atendam aos requisitos.</li>
  <li>O ciclo PDCA contínua como base.</li>
  <li>Auditoria interna, análise crítica e ação corretiva continuam obrigatórias.</li>
  <li>A necessidade de controlar fornecedores permanece.</li>
</ul>

<div class="example"><strong>Exemplo prático:</strong> Uma metalúrgica que migrou da versão 2008 para 2015 descobriu que 70% do seu SGQ já atendia a nova versão. As principais adequações foram: criar a análise de contexto e partes interessadas, reformular a gestão de riscos (tirando o formulario generico de "ação preventiva" e colocando análise de risco por processo) e envolver mais a direção nas análises críticas. O Manual da Qualidade foi mantido por opcao, mas simplificado de 40 para 12 páginas.</div>

<h3>Dica para quem vem da versão 2008</h3>

<p>Não tente "converter" os documentos antigos palavra por palavra. Use a transição como oportunidade para simplificar. Muitas empresas tinham documentação excessiva na versão 2008 que não agregava valor. A versão 2015 e a chance de ter um SGQ mais enxuto, prático e realmente útil para a gestão.</p>

<div class="template-box"><span>Download: Tabela comparativa detalhada 2008 vs 2015</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 2 — Contexto e Liderança (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod2Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Contexto e Liderança', 'Cláusulas 4 e 5: análise do contexto organizacional, partes interessadas, escopo, processos e papel da liderança.', 2)
    RETURNING id
  `;
  const mod2 = mod2Rows[0].id;

  // --- Aula 2.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod2}, 'contexto-organização', 'Cláusula 4.1 — Entendendo a Organização e seu Contexto', '30 min', 1, ${`
<h2>Cláusula 4.1 — Entendendo a Organização e seu Contexto</h2>

<p>A cláusula 4.1 e o ponto de partida de toda a norma ISO 9001:2015. Antes de definir políticas, objetivos ou processos, a organização precisa entender <strong>onde esta inserida</strong>. Isso envolve mapear fatores internos e externos que podem afetar a capacidade de entregar produtos e serviços conformes.</p>

<h3>O que a norma pede</h3>

<p>O requisito e direto: "A organização deve determinar questões externas e internas que sejam pertinentes para seu propósito e sua direção estratégica e que afetem sua capacidade de alcancar os resultados pretendidos de seu SGQ."</p>

<p>Traduzindo: você precisa saber o que esta acontecendo dentro e fora da empresa que impacta a qualidade dos seus produtos e serviços.</p>

<h3>Questoes externas</h3>

<p>São fatores do ambiente em que a organização opera, sobre os quais ela tem pouco ou nenhum controle:</p>

<ul>
  <li><strong>Economicas:</strong> inflação, taxa de cambio, custo de materias-primas, poder de compra dos clientes.</li>
  <li><strong>Legais/regulatórias:</strong> normas técnicas, legislação ambiental, requisitos sanitarios, normas trabalhistas.</li>
  <li><strong>Tecnológicas:</strong> novas tecnologias disponíveis, obsolescencia de equipamentos, digitalização.</li>
  <li><strong>Competitivas:</strong> ações de concorrentes, entrada de novos players, mudanças no mercado.</li>
  <li><strong>Sociais/culturais:</strong> expectativas da comunidade, tendências de consumo, escassez de mao de obra qualificada.</li>
</ul>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> Uma empresa de usinagem em Joinville identificou como questões externas críticas: (1) a escassez de operadores de CNC qualificados na região, (2) a variação do preco do açoimportado devido ao cambio, (3) a entrada de concorrentes chineses oferecendo peças a precos mais baixos. Cada um desses fatores exigiu ações específicas: programa de formação interna, contratos de fornecimento com hedge cambial e diferenciação pela qualidade e prazo.</div>

<h3>Questoes internas</h3>

<p>São fatores dentro da organização:</p>

<ul>
  <li><strong>Cultura organizacional:</strong> como as pessoas encaram qualidade, inovação, mudança.</li>
  <li><strong>Estrutura:</strong> organograma, processos decisorios, autonomia das equipes.</li>
  <li><strong>Recursos:</strong> financeiros, tecnologicos, humanos.</li>
  <li><strong>Conhecimento:</strong> know-how acumulado, dependencia de pessoas-chave.</li>
  <li><strong>Desempenho:</strong> indicadores atuais, histórico de não conformidades, nível de maturidade do SGQ.</li>
</ul>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Uma fábrica de embutidos identificou como questao interna crítica a alta rotatividade na linha de produção (turnover de 35% ao ano). Isso impactava diretamente a qualidade: operadores novos cometiam mais erros de dosagem e temperatura. A ação foi criar um programa de integração mais robusto e um plano de carreira para operadores, reduzindo o turnover para 18% em um ano.</div>

<h3>Ferramentas práticas para análise de contexto</h3>

<p>A norma não exige nenhuma ferramenta específica. As mais usadas na prática sao:</p>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Complexidade</th></tr>
  <tr><td>Análise SWOT</td><td>Visao geral rápida</td><td>Baixa</td></tr>
  <tr><td>PESTEL</td><td>Aprofundar fatores externos</td><td>Media</td></tr>
  <tr><td>5 Forças de Porter</td><td>Entender competitividade</td><td>Media</td></tr>
  <tr><td>Canvas de modelo de negócio</td><td>Startups e empresas novas</td><td>Media</td></tr>
</table>

<p>Para a maioria das PMEs brasileiras, uma <strong>análise SWOT bem-feita</strong> já atende plenamente o requisito. O importante e que seja realista (não um exercício de fantasia), que seja monitorada periodicamente e que alimente decisões concretas.</p>

<h3>Frequência de revisão</h3>

<p>A norma exige que a organização "monitore e análise críticamente" as informações sobre contexto. Na prática, a maioria das organizações faz isso na análise crítica pela direção (cláusula 9.3), que acontece pelo menos uma vez ao ano. Porém, eventos significativos (pandemia, mudança regulatoria, crise de mercado) devem disparar revisoes extraordinarias.</p>

<div class="callout"><strong>Importante:</strong> A análise de contexto não precisa ser um documento extenso. Para uma empresa de 50 funcionários, uma ou duas páginas com os principais fatores, seus impactos e as ações planejadas já e suficiente. O auditor quer ver que você PENSOU sobre isso e tomou decisões com base nessa análise — não quer um relatório academico.</div>

<div class="template-box"><span>Download: Template de análise de contexto (SWOT + fatores internos/externos)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod2}, 'partes-interessadas', 'Cláusula 4.2 — Partes Interessadas e seus Requisitos', '30 min', 2, ${`
<h2>Cláusula 4.2 — Partes Interessadas e seus Requisitos</h2>

<p>A cláusula 4.2 complementa a 4.1. Após entender o contexto, a organização precisa identificar quem são as <strong>partes interessadas pertinentes</strong> ao SGQ e quais são seus requisitos relevantes.</p>

<h3>O que a norma pede</h3>

<p>"A organização deve determinar: (a) as partes interessadas que sejam pertinentes para o SGQ; (b) os requisitos dessas partes interessadas que sejam pertinentes para o SGQ."</p>

<p>A palavra-chave e <strong>pertinente</strong>. Você não precisa listar todas as partes interessadas do universo — apenas aquelas que realmente impactam ou são impactadas pelo seu sistema de gestão da qualidade.</p>

<h3>Quem são as partes interessadas tipicas</h3>

<table>
  <tr><th>Parte interessada</th><th>Requisitos tipicos</th><th>Exemplo indústrial</th></tr>
  <tr><td>Clientes</td><td>Produto conforme, prazo, preco justo, suporte técnico</td><td>Montadora exige CPK > 1,33 em dimensoes críticas</td></tr>
  <tr><td>Colaboradores</td><td>Salario justo, segurança, treinamento, ambiente de trabalho</td><td>Operadores de solda pedem EPI adequado e ventilação</td></tr>
  <tr><td>Fornecedores</td><td>Pedidos claros, prazo de pagamento, previsibilidade</td><td>Siderurgica precisa de previsão de demanda com 60 dias</td></tr>
  <tr><td>Acionistas/socios</td><td>Retorno financeiro, crescimento sustentavel</td><td>Socio espera margem líquida acima de 8%</td></tr>
  <tr><td>Orgaos reguladores</td><td>Conformidade legal, licencas, autorizações</td><td>ANVISA exige BPF na indústria alimentícia</td></tr>
  <tr><td>Comunidade local</td><td>Baixo impacto ambiental, emprego local</td><td>Vizinhos da fábrica reclamam de ruido noturno</td></tr>
  <tr><td>Organismos de certificação</td><td>Atendimento aos requisitos da norma</td><td>Bureau Veritas agenda auditoria anual</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora de médio porte em Florianopolis listou 9 partes interessadas. Ao analisar com cuidado, percebeu que duas eram as mais críticas para o SGQ: (1) os clientes finais (compradores de apartamentos), cujos requisitos incluiam acabamento sem defeitos e entrega no prazo; e (2) o CREA/CAU, cujos requisitos eram conformidade com normas técnicas e ART recolhida. As demais partes existiam, mas seus requisitos tinham impacto menor no SGQ específicamente.</div>

<h3>Como levantar os requisitos</h3>

<p>Não complique. Para cada parte interessada pertinente, pergunte:</p>

<ol>
  <li>O que essa parte espera de nos em relação a qualidade?</li>
  <li>Qual o impacto se não atendermos essa expectativa?</li>
  <li>Esses requisitos são obrigatórios (legais/contratuais) ou voluntarios?</li>
</ol>

<p>Requisitos obrigatórios (legais, regulamentares, contratuais) devem ser tratados como prioridade absoluta. Requisitos voluntarios (expectativas do mercado, boas práticas) são importantes, mas podem ser priorizados conforme a estrategia da organização.</p>

<h3>Monitoramento e atualização</h3>

<p>Partes interessadas e seus requisitos mudam. Um novo contrato pode trazer novos requisitos do cliente. Uma mudança regulatoria pode criar novos requisitos legais. A norma pede que essa análise seja monitorada e atualizada — novamente, a análise crítica pela direção e o momento natural para isso.</p>

<div class="callout"><strong>Importante:</strong> Um erro frequente em auditorias e ter a matriz de partes interessadas "congelada" desde a implantação do SGQ. O auditor pergunta: "Quando foi a ultima vez que vocês revisaram as partes interessadas?" Se a resposta for "na implantação, há 3 anos", e um achado provavel. A organização precisa demonstrar que essa análise e viva.</div>

<h3>Conexao com outras cláusulas</h3>

<p>A análise de partes interessadas alimenta diretamente:</p>

<ul>
  <li><strong>Cláusula 4.3 (escopo):</strong> o escopo deve considerar os requisitos das partes interessadas.</li>
  <li><strong>Cláusula 6.1 (riscos):</strong> riscos e oportunidades devem considerar as partes interessadas.</li>
  <li><strong>Cláusula 8.2 (requisitos de produtos/serviços):</strong> os requisitos do cliente são um subconjunto dos requisitos das partes interessadas.</li>
  <li><strong>Cláusula 9.3 (análise crítica):</strong> mudanças nas partes interessadas são entrada obrigatória para a análise crítica.</li>
</ul>

<div class="template-box"><span>Download: Matriz de partes interessadas com prioridade e requisitos</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod2}, 'escopo-processos', 'Cláusulas 4.3 e 4.4 — Escopo do SGQ e Abordagem de Processos', '30 min', 3, ${`
<h2>Cláusulas 4.3 e 4.4 — Escopo e Abordagem de Processos</h2>

<h3>Cláusula 4.3 — Determinando o escopo do SGQ</h3>

<p>O escopo define os limites e a aplicabilidade do seu Sistema de Gestão da Qualidade. Em termos simples: o que esta dentro e o que esta fora do SGQ.</p>

<p>Para determinar o escopo, a organização deve considerar:</p>

<ul>
  <li>As questões externas e internas (cláusula 4.1)</li>
  <li>Os requisitos das partes interessadas (cláusula 4.2)</li>
  <li>Os produtos e serviços da organização</li>
</ul>

<p>O escopo deve ser mantido como informação documentada e deve declarar os tipos de produtos e serviços cobertos. Se algum requisito da norma não for aplicável, a organização deve justificar — e essa não aplicabilidade não pode afetar a conformidade dos produtos/serviços.</p>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> "O SGQ da MetalForte Ltda. abrange o projeto, fábricação e comercialização de peças usinadas em açoe alumínio para a indústria automotiva e de máquinas agrícolas, realizadas na unidade de Caxias do Sul - RS." Note como o escopo e específico: diz O QUE faz, PARA QUEM faz e ONDE faz.</div>

<div class="callout"><strong>Importante:</strong> Um escopo generico demais ("prestação de serviços") sera questionado pelo auditor. Um escopo específico demais pode limitar desnecessáriamente o SGQ. Encontre o equilibrio: seja claro o suficiente para que qualquer pessoa entenda o que a empresa faz e o que o certificado cobre.</div>

<h3>Sobre não aplicabilidade de requisitos</h3>

<p>Na versão 2008, existia o conceito de "exclusoes" (geralmente do requisito 7.3 — projeto). Na versão 2015, não existe mais "exclusao". Existe "não aplicabilidade", que e diferente: você precisa justificar por que aquele requisito não se aplica, e essa justificativa deve ser razoavel.</p>

<p>Requisitos que frequentemente são declarados "não aplicáveis":</p>

<ul>
  <li><strong>8.3 (Projeto e desenvolvimento):</strong> quando a organização fábrica conforme especificação do cliente, sem projetar. Exemplo: uma metalúrgica que usina peças conforme desenho do cliente não projeta — mas se ela modifica materiais ou processos por conta propria, pode estar projetando sem saber.</li>
  <li><strong>8.5.1 f (Atividades pos-entrega):</strong> quando não há necessidade de assistência técnica, garantia ou manutenção pos-venda.</li>
</ul>

<h3>Cláusula 4.4 — SGQ e seus processos</h3>

<p>Esta e uma das cláusulas mais importantes da norma. Ela exige que a organização determine os processos necessários para o SGQ e, para cada processo, defina:</p>

<ol>
  <li><strong>Entradas e saídas:</strong> o que entra e o que sai de cada processo.</li>
  <li><strong>Sequencia e interação:</strong> como os processos se conectam.</li>
  <li><strong>Critérios e métodos:</strong> como medir se o processo esta funcionando.</li>
  <li><strong>Recursos:</strong> o que e necessário para operar o processo.</li>
  <li><strong>Responsabilidades:</strong> quem e responsável pelo processo.</li>
  <li><strong>Riscos e oportunidades:</strong> conforme cláusula 6.1.</li>
  <li><strong>Melhoria:</strong> como o processo pode ser melhorado.</li>
</ol>

<h3>O mapa de processos</h3>

<p>Na prática, isso se materializa em um <strong>mapa de processos</strong>. A maioria das organizações classifica seus processos em três categorias:</p>

<table>
  <tr><th>Categoria</th><th>Função</th><th>Exemplos</th></tr>
  <tr><td>Processos de gestão</td><td>Direcionar e controlar</td><td>Planejamento estratégico, análise crítica, gestão de riscos</td></tr>
  <tr><td>Processos de realização (core)</td><td>Entregar valor ao cliente</td><td>Vendas, projeto, produção, entrega, pos-venda</td></tr>
  <tr><td>Processos de apoio</td><td>Suportar os processos core</td><td>RH, compras, manutenção, TI, qualidade</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Cooperativa agrícola:</strong> Uma cooperativa de grãos mapeou 11 processos: Governança (gestão), Recepção de grãos, Classificação, Armazenamento, Beneficiamento, Comercialização (core), Compras, Manutenção, Gestão de pessoas, Financeiro, Qualidade (apoio). Cada processo tinha um dono, indicadores, entradas e saídas definidos. Isso fácilitou tanto a gestão diária quanto as auditorias.</div>

<h3>Dicas para montar o mapa de processos</h3>

<ul>
  <li>Não crie processos demais. Uma empresa de 50 pessoas geralmente tem entre 8 e 15 processos. Mais que isso vira burocracia.</li>
  <li>Garanta que as interações estejam claras: quem entrega o que para quem.</li>
  <li>Cada processo precisa de pelo menos um indicador mensurável.</li>
  <li>O mapa deve refletir a realidade, não um ideal. Mapeie como a empresa realmente funciona, depois melhore.</li>
</ul>

<div class="template-box"><span>Download: Modelo de mapa de processos e ficha de processo</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod2}, 'liderança-política', 'Cláusula 5 — Liderança e Política da Qualidade', '30 min', 4, ${`
<h2>Cláusula 5 — Liderança e Política da Qualidade</h2>

<p>A cláusula 5 e o coração estratégico da norma. Ela coloca a alta direção no centro do SGQ — não como figurante, mas como protagonista. Se a direção não estiver comprometida de verdade, todo o resto vira papel sem alma.</p>

<h3>5.1 — Liderança e comprometimento</h3>

<h3>5.1.1 — Generalidades</h3>

<p>A alta direção deve demonstrar liderança e comprometimento com relação ao SGQ. A norma lista ações concretas:</p>

<ul>
  <li>Responsabilizar-se pela eficácia do SGQ.</li>
  <li>Assegurar que a política e os objetivos sejam estabelecidos e compativeis com a direção estratégica.</li>
  <li>Assegurar a integração dos requisitos do SGQ nos processos de negócio.</li>
  <li>Promover o uso da abordagem de processo e da mentalidade de risco.</li>
  <li>Assegurar que os recursos necessários estejam disponíveis.</li>
  <li>Comúnicar a importancia do SGQ e da conformidade com os requisitos.</li>
  <li>Assegurar que o SGQ alcance seus resultados pretendidos.</li>
  <li>Engajar, dirigir e apoiar pessoas a contribuir.</li>
  <li>Promover melhoria.</li>
  <li>Apoiar outros papeis de gestão pertinentes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> O verbo e "demonstrar" — não basta dizer que apoia. O auditor vai procurar evidências: atas de análise crítica com participação da direção, alocação de recursos para projetos de qualidade, comúnicações da direção sobre qualidade, decisões que priorizaram qualidade sobre custo de curto prazo.</div>

<h3>5.1.2 — Foco no cliente</h3>

<p>A alta direção deve demonstrar liderança e comprometimento com relação ao foco no cliente, assegurando que:</p>

<ul>
  <li>Requisitos do cliente e requisitos legais sejam determinados, entendidos e atendidos.</li>
  <li>Riscos que possam afetar a conformidade sejam tratados.</li>
  <li>O foco no aumento da satisfação do cliente seja mantido.</li>
</ul>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> O diretor de uma fábrica de massas em Erechim participava pessoalmente da reunião mensal de análise de reclamações de clientes. Não delegava ao gerente de qualidade. Quando uma rede de supermercados reportou problemas de embalagem, o diretor autorizou investimento de R$ 180.000 em nova seladora na mesma semana. Isso e liderança com foco no cliente — decisão rápida, recurso alocado, prioridade clara.</div>

<h3>5.2 — Política da qualidade</h3>

<p>A política da qualidade e a declaração de intencoes da organização em relação a qualidade. Ela deve:</p>

<ol>
  <li>Ser apropriada ao propósito e contexto da organização.</li>
  <li>Prover uma estrutura para definir objetivos da qualidade.</li>
  <li>Incluir comprometimento com o atendimento aos requisitos aplicáveis.</li>
  <li>Incluir comprometimento com a melhoria contínua do SGQ.</li>
</ol>

<p>Alem disso, a política deve ser mantida como informação documentada, comunicada e entendida na organização e disponível para partes interessadas pertinentes.</p>

<div class="callout"><strong>Importante:</strong> Políticas genéricas como "Buscamos a excelencia na satisfação dos nossos clientes atraves da melhoria contínua" não agregam nada. Uma boa política e específica para a empresa, reflete seus valores reais e serve como guia para decisões. Compare: "A MetalForte se compromete a entregar peças usinadas dentro das tolerâncias específicadas, no prazo acordado, buscando continuamente reduzir refugo e retrabalho, com respeito a segurança dos colaboradores e ao meio ambiente."</div>

<h3>5.3 — Papeis, responsabilidades e autoridades</h3>

<p>A alta direção deve assegurar que responsabilidades e autoridades estejam definidas, comunicadas e entendidas. Em particular, alguem precisa ter autoridade para:</p>

<ul>
  <li>Assegurar que o SGQ esteja conforme os requisitos da norma.</li>
  <li>Assegurar que os processos entreguem suas saídas pretendidas.</li>
  <li>Relatar o desempenho do SGQ e oportunidades de melhoria a alta direção.</li>
  <li>Assegurar a promoção do foco no cliente na organização.</li>
  <li>Assegurar que a integridade do SGQ seja mantida quando mudanças forem planejadas.</li>
</ul>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora definiu a seguinte estrutura: o Diretor Técnico era responsável pelo SGQ perante a alta direção; cada Engenheiro de Obra era responsável pela qualidade da sua obra; o Coordenador de Qualidade apoiava técnicamente mas não tinha "a culpa" quando algo dava errado. Essa clareza de papeis eliminou o clássico problema de "a qualidade e problema do setor de qualidade".</div>

<h3>Como o auditor avalia a cláusula 5</h3>

<p>O auditor normalmente:</p>

<ol>
  <li>Entrevista a alta direção diretamente (isso e obrigatório em auditorias de certificação).</li>
  <li>Verifica se a direção conhece a política, os objetivos e o desempenho do SGQ.</li>
  <li>Procura evidências de decisões baseadas em dados de qualidade.</li>
  <li>Verifica se recursos foram alocados quando necessário.</li>
  <li>Checa se a análise crítica foi conduzida com participação real da direção.</li>
</ol>

<div class="template-box"><span>Download: Modelo de política da qualidade + checklist de liderança</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 3 — Planejamento (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod3Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Planejamento', 'Cláusula 6: riscos e oportunidades, objetivos da qualidade, planejamento de mudanças e caso prático.', 3)
    RETURNING id
  `;
  const mod3 = mod3Rows[0].id;

  // --- Aula 3.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod3}, 'riscos-oportunidades', 'Cláusula 6.1 — Ações para Abordar Riscos e Oportunidades', '30 min', 1, ${`
<h2>Cláusula 6.1 — Ações para Abordar Riscos e Oportunidades</h2>

<p>A gestão de riscos e a maior novidade conceitual da ISO 9001:2015. Ela substitui o antigo conceito de "ação preventiva" (que na prática nunca funcionou bem) por algo muito mais natural e integrado: pensar em riscos e oportunidades como parte de qualquer decisão.</p>

<h3>O que a norma exige</h3>

<p>Ao planejar o SGQ, a organização deve considerar as questões de contexto (4.1) e os requisitos das partes interessadas (4.2) e determinar riscos e oportunidades que precisam ser abordados para:</p>

<ul>
  <li>Assegurar que o SGQ alcance seus resultados pretendidos.</li>
  <li>Aumentar efeitos desejaveis (oportunidades).</li>
  <li>Prevenir ou reduzir efeitos indesejaveis (riscos).</li>
  <li>Alcancar melhoria.</li>
</ul>

<p>A organização deve planejar ações para abordar esses riscos e oportunidades, integrar essas ações nos processos do SGQ e avaliar a eficácia dessas ações.</p>

<h3>Mentalidade de risco vs. gestão formal de riscos</h3>

<div class="callout"><strong>Importante:</strong> A norma NÃO exige gestão formal de riscos (ISO 31000) nem métodologias específicas como FMEA. O que ela exige e a "mentalidade de risco" — que significa considerar riscos e oportunidades nas decisões. Para uma micro/pequena empresa, isso pode ser tao simples quanto uma planilha com os principais riscos, probabilidade, impacto e ações planejadas.</div>

<p>Dito isso, para organizações mais complexas, métodologias estruturadas agregam muito valor:</p>

<table>
  <tr><th>Métodologia</th><th>Indicada para</th><th>Complexidade</th></tr>
  <tr><td>Matriz de Probabilidade x Impacto</td><td>Qualquer porte</td><td>Baixa</td></tr>
  <tr><td>FMEA (Análise de Modos de Falha)</td><td>Processos produtivos críticos</td><td>Media-Alta</td></tr>
  <tr><td>HAZOP</td><td>Processos quimicos e alimenticios</td><td>Alta</td></tr>
  <tr><td>Bow-Tie</td><td>Riscos complexos com múltiplas causas/consequências</td><td>Media</td></tr>
  <tr><td>What-If</td><td>Análise rápida de cenários</td><td>Baixa</td></tr>
</table>

<h3>Riscos tipicos por setor</h3>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong>
<ul>
  <li><strong>Risco:</strong> Materia-prima fora de especificação do fornecedor — <strong>Acao:</strong> inspeção de recebimento com análise química amostral, qualificação rigorosa de fornecedores.</li>
  <li><strong>Risco:</strong> Quebra de ferramenta de corte gerando peça não conforme — <strong>Acao:</strong> programa de troca preventiva de ferramentas por vida útil monitorada.</li>
  <li><strong>Oportunidade:</strong> Novo cliente do setor de energia eolica buscando fornecedores qualificados — <strong>Acao:</strong> adequar tolerâncias e obter qualificação específica.</li>
</ul></div>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong>
<ul>
  <li><strong>Risco:</strong> Contaminação cruzada na linha de produção — <strong>Acao:</strong> zoneamento, higienização válidada, controle de alergenos.</li>
  <li><strong>Risco:</strong> Falta de energia elétrica comprometendo a cadeia de frio — <strong>Acao:</strong> gerador de emergencia com teste mensal.</li>
  <li><strong>Oportunidade:</strong> Demanda crescente por produtos sem gluten — <strong>Acao:</strong> desenvolver linha dedicada e buscar certificação sem gluten.</li>
</ul></div>

<h3>Como estruturar a planilha de riscos</h3>

<p>Um formato prático que funciona para a maioria das empresas:</p>

<table>
  <tr><th>Processo</th><th>Risco/Oportunidade</th><th>Tipo</th><th>Probabilidade</th><th>Impacto</th><th>Nível</th><th>Acao</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr>
  <tr><td>Produção</td><td>Ferramenta quebrar durante corte</td><td>Risco</td><td>Media</td><td>Alto</td><td>Alto</td><td>Troca preventiva por hora-máquina</td><td>Sup. Produção</td><td>30/03</td><td>Implementado</td></tr>
</table>

<p>Use escala simples: probabilidade (Baixa/Media/Alta) x impacto (Baixo/Medio/Alto). Riscos com nível alto exigem ação; riscos com nível médio devem ser monitorados; riscos com nível baixo são aceitos com monitoramento periodico.</p>

<h3>Integração com outros processos</h3>

<p>As ações para riscos devem ser integradas nos processos operacionais, não ficar numa planilha isolada. Se o risco e "fornecedor entregar material fora de especificação", a ação (inspeção de recebimento) deve estar no processo de recebimento de materiais, não apenas na planilha de riscos.</p>

<div class="template-box"><span>Download: Planilha de gestão de riscos e oportunidades</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod3}, 'objetivos-qualidade', 'Cláusula 6.2 — Objetivos da Qualidade', '30 min', 2, ${`
<h2>Cláusula 6.2 — Objetivos da Qualidade e Planejamento para Alcanca-los</h2>

<p>Se a política da qualidade e o "norte estratégico", os objetivos são os "marcos no caminho". A cláusula 6.2 exige que a organização estabeleca objetivos da qualidade em funções, niveis e processos pertinentes, e planeje como alcanca-los.</p>

<h3>Requisitos para os objetivos</h3>

<p>Os objetivos da qualidade devem ser:</p>

<ul>
  <li><strong>Coerentes com a política da qualidade</strong> — se a política fala em "entrega no prazo", deve haver um objetivo de pontualidade.</li>
  <li><strong>Mensuraveis</strong> — "melhorar a qualidade" não e mensurável; "reduzir o índice de refugo de 4% para 2% até dezembro" e mensurável.</li>
  <li><strong>Considerar requisitos aplicáveis</strong> — legais, do cliente, regulamentares.</li>
  <li><strong>Pertinentes para a conformidade</strong> de produtos/serviços e satisfação do cliente.</li>
  <li><strong>Monitorados, comunicados e atualizados</strong> conforme apropriado.</li>
</ul>

<h3>Planejamento para alcancar os objetivos</h3>

<p>Para cada objetivo, a organização deve determinar:</p>

<table>
  <tr><th>Item</th><th>Pergunte</th><th>Exemplo</th></tr>
  <tr><td>O que sera feito</td><td>Quais ações concretas?</td><td>Implantar controle estatistico de processo (CEP) na linha 2</td></tr>
  <tr><td>Recursos necessários</td><td>Quanto custa? Quem faz?</td><td>Software CEP (R$ 8.000) + treinamento (16h)</td></tr>
  <tr><td>Responsável</td><td>Quem responde pelo resultado?</td><td>Coordenador de Produção</td></tr>
  <tr><td>Prazo</td><td>Quando deve estar pronto?</td><td>Ate 30/06/2025</td></tr>
  <tr><td>Como avaliar resultados</td><td>Qual indicador vai medir?</td><td>Índice de refugo mensal (%)</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> A MetalForte definiu 5 objetivos da qualidade para 2025:
<ol>
  <li>Reduzir refugo de 3,8% para 2,5% (indicador: % de refugo mensal)</li>
  <li>Aumentar pontualidade de entrega de 88% para 95% (indicador: % de pedidos entregues no prazo)</li>
  <li>Reduzir reclamações de clientes de 12 para 6 por semestre (indicador: número de reclamações)</li>
  <li>Treinar 100% dos operadores de CNC no novo procedimento de setup (indicador: % de operadores treinados)</li>
  <li>Obter nota mínima de 85% na pesquisa de satisfação anual (indicador: nota media da pesquisa)</li>
</ol>
Cada objetivo tinha plano de ação detalhado, responsável e prazo. A análise era mensal na reunião de indicadores.</div>

<h3>Erros comuns nos objetivos</h3>

<ul>
  <li><strong>Objetivos vagos:</strong> "Melhorar a qualidade" — sem meta numérica, sem prazo, impossível avaliar.</li>
  <li><strong>Objetivos irrelevantes:</strong> "Reduzir consumo de papel no escritório" — pode ser valido para gestão ambiental, mas não e pertinente para o SGQ.</li>
  <li><strong>Objetivos inalcancaveis:</strong> "Zero defeitos" quando o índice atual e 5% — metas irrealistas desmotivam.</li>
  <li><strong>Objetivos sem plano de ação:</strong> definir a meta mas não o caminho para chegar la.</li>
  <li><strong>Objetivos sem monitoramento:</strong> definir em janeiro e só verificar em dezembro.</li>
</ul>

<h3>Critério SMART</h3>

<p>Uma referência útil (embora não mencionada na norma) e o critério SMART:</p>

<ul>
  <li><strong>S</strong>pecific (Especifico)</li>
  <li><strong>M</strong>easurable (Mensurável)</li>
  <li><strong>A</strong>chievable (Alcancavel)</li>
  <li><strong>R</strong>elevant (Relevante)</li>
  <li><strong>T</strong>ime-bound (Com prazo)</li>
</ul>

<div class="callout"><strong>Importante:</strong> Os objetivos devem ser desdobrados para as funções e processos pertinentes. O objetivo corporativo de "reduzir refugo para 2,5%" pode se desdobrar em metas específicas por linha, por turno ou por produto. Quanto mais próximo do chão de fábrica, mais efetivo.</div>

<div class="template-box"><span>Download: Planilha de objetivos da qualidade com plano de ação 5W2H</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod3}, 'planejamento-mudanças', 'Cláusula 6.3 — Planejamento de Mudanças', '30 min', 3, ${`
<h2>Cláusula 6.3 — Planejamento de Mudanças</h2>

<p>Mudanças são inevitáveis. Novos clientes, novos produtos, mudanças de layout, troca de fornecedores, aquisição de equipamentos, mudanças regulatórias — tudo isso impacta o SGQ. A cláusula 6.3 exige que mudanças no SGQ sejam planejadas e controladas.</p>

<h3>O que a norma pede</h3>

<p>Quando a organização determina a necessidade de mudanças no SGQ, elas devem ser realizadas de maneira planejada, considerando:</p>

<ul>
  <li><strong>O propósito da mudança</strong> e suas potenciais consequências.</li>
  <li><strong>A integridade do SGQ</strong> — a mudança não pode "quebrar" o sistema.</li>
  <li><strong>A disponibilidade de recursos.</strong></li>
  <li><strong>A alocação ou realocação de responsabilidades e autoridades.</strong></li>
</ul>

<h3>Tipos de mudanças que afetam o SGQ</h3>

<table>
  <tr><th>Tipo de mudança</th><th>Exemplo</th><th>Impacto no SGQ</th></tr>
  <tr><td>Mudança de produto</td><td>Novo material em peça usinada</td><td>Pode exigir novo parâmetro de processo, novo controle</td></tr>
  <tr><td>Mudança de processo</td><td>Troca de máquina CNC</td><td>Novo setup, válidação de processo, treinamento</td></tr>
  <tr><td>Mudança de fornecedor</td><td>Trocar fornecedor de aço</td><td>Nova qualificação, ajuste na inspeção de recebimento</td></tr>
  <tr><td>Mudança organizacional</td><td>Fusao de setores</td><td>Novos responsáveis, revisão de processos</td></tr>
  <tr><td>Mudança regulatoria</td><td>Nova norma técnica</td><td>Adequação de especificações e controles</td></tr>
  <tr><td>Mudança de escopo</td><td>Incluir novo tipo de serviço</td><td>Expansao do SGQ, novos processos</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora decidiu trocar o sistema de formas de madeira por formas metalicas. Antes de implementar, o coordenador de qualidade mapeou os impactos: necessidade de treinamento das equipes (4 turmas de 8h), revisão da instrução de trabalho de concretagem, novo fornecedor de formas a ser qualificado, novo item de inspeção na checklist de conferencia. A mudança foi planejada em 3 fases ao longo de 2 meses, sem impacto na qualidade das obras em andamento.</div>

<h3>Processo de gestão de mudanças</h3>

<p>Um fluxo prático para gestão de mudanças:</p>

<ol>
  <li><strong>Identificar a mudança:</strong> o que vai mudar, por que e quando.</li>
  <li><strong>Avaliar impactos:</strong> quais processos, documentos, competências e recursos são afetados.</li>
  <li><strong>Planejar ações:</strong> o que precisa ser feito antes, durante e depois da mudança.</li>
  <li><strong>Aprovar:</strong> quem autoriza a mudança (geralmente o dono do processo + coordenador de qualidade).</li>
  <li><strong>Implementar:</strong> executar as ações planejadas.</li>
  <li><strong>Verificar:</strong> confirmar que a mudança foi eficaz e não gerou efeitos colaterais.</li>
</ol>

<div class="callout"><strong>Importante:</strong> Mudanças não planejadas são a maior fonte de não conformidades em auditorias. O clássico: a empresa troca de fornecedor de materia-prima "porque ficou mais barato" sem avaliar impacto na qualidade do produto final. Tres meses depois, as reclamações de clientes triplicam. Se a mudança tivesse sido planejada conforme 6.3, o impacto teria sido avaliado antes.</div>

<h3>Conexao com a cláusula 8.5.6</h3>

<p>A cláusula 8.5.6 trata específicamente do controle de mudanças na produção/provisão de serviços. A lógica e a mesma: qualquer mudança na produção deve ser analisada, aprovada e verificada antes de ser liberada. A 6.3 e mais ampla (mudanças no SGQ como um todo) e a 8.5.6 e específica para mudanças operacionais.</p>

<div class="example"><strong>Exemplo prático — Cooperativa agrícola:</strong> A cooperativa decidiu ampliar a capacidade de secagem de grãos, instalando um novo secador com tecnologia diferente da existente. O plano de mudança incluiu: treinamento de 3 operadores no novo equipamento, revisão da instrução de operação, definição de novos parâmetros de temperatura e umidade, período de operação assistida de 30 dias com monitoramento intensivo, e válidação do produto final (grãos secos conforme padrão). A mudança foi bem-sucedida sem perdas de qualidade.</div>

<div class="template-box"><span>Download: Formulario de gestão de mudanças</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod3}, 'caso-prático-planejamento', 'Caso Prático — Planejamento do SGQ numa Metalurgica', '30 min', 4, ${`
<h2>Caso Prático — Planejamento Completo do SGQ</h2>

<p>Vamos consolidar tudo que vimos nas cláusulas 4, 5 e 6 com um caso prático completo. Acompanhe a jornada da <strong>UsinaMax Ltda.</strong>, uma metalúrgica ficticia (mas baseada em casos reais) que decidiu implantar a ISO 9001:2015.</p>

<h3>Perfil da empresa</h3>

<ul>
  <li><strong>Razão social:</strong> UsinaMax Usinagem de Precisao Ltda.</li>
  <li><strong>Localização:</strong> Caxias do Sul - RS</li>
  <li><strong>Funcionarios:</strong> 62</li>
  <li><strong>Faturamento anual:</strong> R$ 12 milhoes</li>
  <li><strong>Produtos:</strong> peças usinadas em açocarbono e inox para indústria automotiva e de máquinas agrícolas</li>
  <li><strong>Parque indústrial:</strong> 8 tornos CNC, 3 centros de usinagem, 1 retifica, setor de metrologia</li>
</ul>

<h3>Passo 1 — Análise de contexto (cláusula 4.1)</h3>

<p>O comite de implantação (diretoria + gerentes + coordenador de qualidade) realizou uma análise SWOT:</p>

<table>
  <tr><th>Forças</th><th>Fraquezas</th></tr>
  <tr><td>Parque de máquinas moderno (CNC 5 eixos)</td><td>Alta rotatividade de operadores (turnover 30%)</td></tr>
  <tr><td>Laboratorio de metrologia próprio</td><td>Sem sistema ERP integrado</td></tr>
  <tr><td>20 anos de experiência no mercado</td><td>Dependencia de 3 clientes (70% do faturamento)</td></tr>
  <tr><td>Localização no polo metal-mecanico</td><td>Documentação informal (muito conhecimento "na cabeca")</td></tr>
</table>

<table>
  <tr><th>Oportunidades</th><th>Ameaças</th></tr>
  <tr><td>Setor de energia eolica buscando fornecedores</td><td>Concorrencia de importados chineses</td></tr>
  <tr><td>Demanda crescente por peças de alta precisão</td><td>Escassez de operadores CNC qualificados</td></tr>
  <tr><td>Indústria 4.0 — integração com sistemas dos clientes</td><td>Variação cambial no custo de ferramental importado</td></tr>
</table>

<h3>Passo 2 — Partes interessadas (cláusula 4.2)</h3>

<p>Foram identificadas 7 partes interessadas pertinentes:</p>

<ol>
  <li><strong>Clientes (montadoras + fábricantes de máquinas):</strong> peças conforme especificação, prazo, CPK mínimo, certificados de material.</li>
  <li><strong>Colaboradores:</strong> salario competitivo, segurança, treinamento, perspectiva de crescimento.</li>
  <li><strong>Fornecedores de materia-prima:</strong> previsão de demanda, pagamento em dia.</li>
  <li><strong>Socios:</strong> rentabilidade mínima de 10%, crescimento sustentavel.</li>
  <li><strong>Organismos reguladores (MTE, FEPAM):</strong> conformidade com NRs e licenca ambiental.</li>
  <li><strong>Comunidade:</strong> baixo impacto de ruido (fábrica fica em zona mista).</li>
  <li><strong>Organismo certificador:</strong> atendimento aos requisitos ISO 9001.</li>
</ol>

<h3>Passo 3 — Escopo (cláusula 4.3)</h3>

<p>"O SGQ da UsinaMax abrange a usinagem de precisão de peças em açocarbono e inoxidável para os setores automotivo e de máquinas agrícolas, incluindo programação CNC, usinagem, tratamento térmico (terceirizado com controle) e inspeção final, realizados na unidade de Caxias do Sul - RS."</p>

<p>Cláusula 8.3 (Projeto) declarada não aplicável — a empresa fábrica conforme especificação/desenho do cliente, sem desenvolver produtos próprios.</p>

<h3>Passo 4 — Mapa de processos (cláusula 4.4)</h3>

<p>12 processos mapeados:</p>

<ul>
  <li><strong>Gestão:</strong> Planejamento Estratégico, Gestão da Qualidade</li>
  <li><strong>Core:</strong> Vendas/Orçamento, Programação CNC, Usinagem, Inspeção/Metrologia, Expedição</li>
  <li><strong>Apoio:</strong> Compras, Almoxarifado, Manutenção, Gestão de Pessoas, Controle de Terceirizados</li>
</ul>

<h3>Passo 5 — Política da qualidade (cláusula 5.2)</h3>

<p>"A UsinaMax se compromete a fornecer peças usinadas dentro das tolerâncias específicadas, no prazo acordado, buscando continuamente a redução de retrabalho e refugo. Investimos na qualificação dos nossos colaboradores e na modernização do nosso parque fabril para atender e superar as expectativas dos nossos clientes. Estamos comprometidos com a melhoria contínua do nosso Sistema de Gestão da Qualidade e com o atendimento aos requisitos legais e regulamentares aplicáveis."</p>

<h3>Passo 6 — Riscos e oportunidades (cláusula 6.1)</h3>

<p>Os 5 riscos mais críticos identificados e suas ações:</p>

<ol>
  <li><strong>Perda de operadores qualificados</strong> (probabilidade alta, impacto alto): programa de retenção + escola interna de CNC.</li>
  <li><strong>Materia-prima fora de especificação</strong> (media, alto): inspeção de recebimento com análise química + dupla fonte aprovada.</li>
  <li><strong>Falha em máquina CNC crítica</strong> (media, alto): manutenção preventiva + contrato de manutenção corretiva com SLA 24h.</li>
  <li><strong>Perda de cliente grande</strong> (baixa, muito alto): diversificação de carteira — meta de nenhum cliente > 35% do faturamento.</li>
  <li><strong>Requisito de cliente não entendido</strong> (media, médio): revisão crítica de contrato documentada para todo pedido novo.</li>
</ol>

<h3>Passo 7 — Objetivos da qualidade (cláusula 6.2)</h3>

<table>
  <tr><th>Objetivo</th><th>Meta</th><th>Indicador</th><th>Responsável</th></tr>
  <tr><td>Reduzir refugo</td><td>De 4,2% para 2,5%</td><td>% refugo mensal</td><td>Gerente Indústrial</td></tr>
  <tr><td>Melhorar pontualidade</td><td>De 86% para 95%</td><td>% pedidos no prazo</td><td>PCP</td></tr>
  <tr><td>Reduzir reclamações</td><td>De 15 para 8/semestre</td><td>Nr. reclamações</td><td>Qualidade</td></tr>
  <tr><td>Capacitar equipe</td><td>40h/funcionario/ano</td><td>Horas treinamento</td><td>RH</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> Observe como cada passo se conecta ao anterior. O contexto revela a escassez de mao de obra, que vira risco, que vira objetivo de treinamento. A dependencia de poucos clientes aparece na SWOT, vira risco e vira ação estratégica de diversificação. Isso e a norma funcionando como sistema integrado — não como lista de requisitos isolados.</div>

<div class="template-box"><span>Download: Kit completo de planejamento do SGQ (contexto + partes interessadas + riscos + objetivos)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 4 — Apoio e Operação (2.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod4Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Apoio e Operação', 'Cláusulas 7 e 8: recursos, competência, informação documentada, controle operacional, fornecedores e produção.', 4)
    RETURNING id
  `;
  const mod4 = mod4Rows[0].id;

  // --- Aula 4.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod4}, 'recursos-competência', 'Cláusula 7 — Recursos, Competência e Conscientização', '40 min', 1, ${`
<h2>Cláusula 7 — Apoio: Recursos, Competência e Conscientização</h2>

<p>A cláusula 7 trata de tudo que a organização precisa disponibilizar para que o SGQ funcione: pessoas, infraestrutura, ambiente, recursos de monitoramento, conhecimento organizacional, competência, conscientização e comúnicação.</p>

<h3>7.1 — Recursos</h3>

<h3>7.1.1 — Generalidades</h3>

<p>A organização deve determinar e prover os recursos necessários para o SGQ. Isso inclui considerar as capacidades e restrições dos recursos internos existentes e o que precisa ser obtido de provedores externos.</p>

<h3>7.1.2 — Pessoas</h3>

<p>A organização deve determinar e prover as pessoas necessárias para a implementação eficaz do SGQ e para a operação e controle de seus processos. Na prática: você tem gente suficiente e qualificada para fazer o que precisa ser feito?</p>

<h3>7.1.3 — Infraestrutura</h3>

<p>Edificios, útilidades, equipamentos (hardware e software), transporte, tecnologia da informação e comúnicação. A infraestrutura deve ser determinada, provida e mantida.</p>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> Um torno CNC que quebra frequentemente e gera peças fora de tolerância e um problema de infraestrutura. A norma exige que a empresa identifique a infraestrutura necessária para a conformidade dos produtos e a mantenha — o que se traduz em programas de manutenção preventiva, calibração de máquinas e atualização de software CAM.</div>

<h3>7.1.4 — Ambiente para a operação de processos</h3>

<p>Combinação de fatores humanos e físicos: temperatura, umidade, iluminação, fluxo de ar, higiene, ruido, mas também fatores psicologicos como estrêsse, burnout, conflitos. A organização deve determinar, prover e manter o ambiente necessário.</p>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> A sala de embalagem precisa de temperatura controlada (max. 15 graus C), pressão positiva (evitar entrada de contaminantes), iluminação adequada para inspeção visual e operadores sem estrêsse excessivo (para não cometerem erros de rotulagem). Tudo isso e "ambiente para operação de processos".</div>

<h3>7.1.5 — Recursos de monitoramento e medição</h3>

<p>Quando monitoramento ou medição e usado para verificar a conformidade de produtos/serviços, a organização deve assegurar que os recursos sejam adequados e mantidos. Isso inclui a famosa <strong>calibração</strong>.</p>

<p>Quando a rastreabilidade de medição e um requisito (legal, do cliente ou definido pela organização), os instrumentos de medição devem ser:</p>

<ul>
  <li>Calibrados ou verificados em intervalos específicados, contra padrões rastreaveis.</li>
  <li>Identificados quanto a sua situação de calibração.</li>
  <li>Protegidos contra ajustes, danos ou deterioração que invalidem a calibração.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A calibração e um dos itens mais auditados. O auditor vai ao chão de fábrica, pega um paquímetro da bancada do operador e verifica: esta identificado? A etiqueta de calibração esta válida? Onde esta o certificado de calibração? Se o instrumento estiver com calibração vencida e estiver sendo usado para inspeção de produto, e não conformidade imediata.</div>

<h3>7.1.6 — Conhecimento organizacional</h3>

<p>Novidade da versão 2015. A organização deve determinar o conhecimento necessário para a operação de seus processos e para alcancar conformidade. Esse conhecimento deve ser mantido e disponibilizado na extensão necessária.</p>

<p>Na prática, isso trata do problema do "conhecimento na cabeca das pessoas". Se o único operador que sabe programar uma máquina específica sair da empresa, o que acontece?</p>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Um mestre de obra com 30 anos de experiência sabia "de cabeca" a dosagem ideal de concreto para cada tipo de obra. Quando ele se aposentou, a empresa teve problemas serios de qualidade por 3 meses até treinar um substituto. Isso e falha na gestão do conhecimento organizacional. A ação: documentar as dosagens, criar um banco de dados de licoes aprendidas e implantar programa de mentoria entre mestrês experientes e novos.</div>

<h3>7.2 — Competência</h3>

<p>A organização deve determinar a competência necessária para cada função que afeta o desempenho da qualidade, assegurar que as pessoas sejam competentes (educação, treinamento ou experiência), tomar ações para adquirir competência (quando necessário) e reter informação documentada como evidência.</p>

<p>Na prática, isso se traduz em:</p>

<ul>
  <li><strong>Matriz de competências:</strong> para cada função, quais competências são necessárias.</li>
  <li><strong>Avaliação de competências:</strong> cada pessoa atende aos requisitos da sua função?</li>
  <li><strong>Plano de treinamento:</strong> para fechar as lacunas identificadas.</li>
  <li><strong>Registros:</strong> certificados, listas de presença, avaliações de eficácia.</li>
</ul>

<h3>7.3 — Conscientização</h3>

<p>As pessoas que trabalham sob o controle da organização devem estar conscientes da política da qualidade, dos objetivos pertinentes, da sua contribuição para o SGQ e das consequências de não atender os requisitos. Não basta treinar — a pessoa precisa entender o "por que".</p>

<h3>7.4 — Comúnicação</h3>

<p>A organização deve determinar as comúnicações internas e externas pertinentes ao SGQ: o que comúnicar, quando, para quem, como e quem comúnica. Um quadro de gestão a vista no chão de fábricacom indicadores atualizados e um exemplo simples e eficaz de comúnicação do SGQ.</p>

<div class="template-box"><span>Download: Matriz de competências + plano de treinamento anual</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod4}, 'informação-documentada', 'Cláusula 7.5 — Informação Documentada', '30 min', 2, ${`
<h2>Cláusula 7.5 — Informação Documentada</h2>

<p>A informação documentada e o "esqueleto" do SGQ. E tudo aquilo que precisa ser registrado, controlado e mantido acessível. Na versão 2015, esse conceito ficou muito mais flexível — e isso e uma grande vantagem, se bem útilizado.</p>

<h3>O que mudou em relação a versão 2008</h3>

<p>Na versão 2008, existiam três termos distintos: "documento", "registro" e "procedimento documentado" (6 obrigatórios). Na versão 2015, tudo foi unificado sob o termo <strong>informação documentada</strong>. A norma usa dois verbos para diferenciar:</p>

<ul>
  <li><strong>"Manter" informação documentada:</strong> equivale ao antigo "documento" — algo que você atualiza (política, procedimento, instrução de trabalho).</li>
  <li><strong>"Reter" informação documentada:</strong> equivale ao antigo "registro" — evidência de que algo foi feito (relatório de inspeção, ata de reunião, certificado de calibração).</li>
</ul>

<h3>O que a norma obriga a documentar</h3>

<p>A ISO 9001:2015 exige informação documentada em pontos específicos. Aqui esta a lista completa:</p>

<table>
  <tr><th>Cláusula</th><th>Tipo</th><th>O que documentar</th></tr>
  <tr><td>4.3</td><td>Manter</td><td>Escopo do SGQ</td></tr>
  <tr><td>4.4</td><td>Manter</td><td>Informação para apoiar a operação dos processos</td></tr>
  <tr><td>4.4</td><td>Reter</td><td>Confianca de que os processos são realizados conforme planejado</td></tr>
  <tr><td>5.2</td><td>Manter</td><td>Política da qualidade</td></tr>
  <tr><td>6.2</td><td>Manter</td><td>Objetivos da qualidade</td></tr>
  <tr><td>7.1.5</td><td>Reter</td><td>Adequação dos recursos de monitoramento e medição</td></tr>
  <tr><td>7.2</td><td>Reter</td><td>Evidência de competência</td></tr>
  <tr><td>8.1</td><td>Manter/Reter</td><td>Planejamento e controle operacional</td></tr>
  <tr><td>8.2.3</td><td>Reter</td><td>Resultados da análise crítica de requisitos</td></tr>
  <tr><td>8.4</td><td>Reter</td><td>Avaliação, seleção e monitoramento de fornecedores</td></tr>
  <tr><td>8.5.2</td><td>Reter</td><td>Identificação e rastreabilidade</td></tr>
  <tr><td>8.5.6</td><td>Reter</td><td>Controle de mudanças na produção</td></tr>
  <tr><td>8.6</td><td>Reter</td><td>Liberação de produtos e serviços</td></tr>
  <tr><td>8.7</td><td>Reter</td><td>Controle de saídas não conformes</td></tr>
  <tr><td>9.1.1</td><td>Reter</td><td>Resultados de monitoramento e medição</td></tr>
  <tr><td>9.2</td><td>Reter</td><td>Programa e resultados de auditoria interna</td></tr>
  <tr><td>9.3</td><td>Reter</td><td>Resultados da análise crítica pela direção</td></tr>
  <tr><td>10.2</td><td>Reter</td><td>Não conformidades e ações corretivas</td></tr>
</table>

<h3>Controle de informação documentada (7.5.3)</h3>

<p>A informação documentada deve ser controlada para assegurar que esteja:</p>

<ul>
  <li><strong>Disponível e adequada</strong> para uso, onde e quando necessário.</li>
  <li><strong>Protegida</strong> contra perda de confidencialidade, uso indevido ou perda de integridade.</li>
</ul>

<p>O controle inclui: distribuição, acesso, recuperação, armazenamento, preservação (incluindo legibilidade), controle de mudanças e retenção/disposição.</p>

<div class="callout"><strong>Importante:</strong> Não existe mais obrigação de ter um "procedimento de controle de documentos" formal. Porém, a organização precisa demonstrar que controla sua informação documentada de alguma forma. Um sistema eletronico com controle de versão e permissoes de acesso atende perfeitamente. Uma pasta de rede com pasta "VIGENTE" e "OBSOLETO" também pode funcionar para empresas menores.</div>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> A UsinaMax migrou de documentos Word impressos (com carimbo "copia controlada") para um sistema digital. Todos os documentos ficam no SharePoint com controle de versão automatico, aprovação por workflow e acesso restrito por função. Os operadores acessam instruções de trabalho em tablets no chão de fábrica— sempre a versão vigente, sem risco de usar documento obsoleto. Custo: R$ 0 (ja tinham licenca Microsoft 365).</div>

<h3>Quanto documentar?</h3>

<p>A norma da liberdade, mas isso não significa "não documentar nada". A regra prática:</p>

<ul>
  <li>Documente tudo que a norma exige (tabela acima).</li>
  <li>Documente processos onde o erro tem alto impacto (instruções de trabalho críticas).</li>
  <li>Documente o que precisa ser consistente entre turnos/pessoas.</li>
  <li>NÃO documente o que e obvio para profissionais qualificados.</li>
</ul>

<div class="template-box"><span>Download: Lista mestra de informação documentada + template de controle</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod4}, 'operação-requisitos', 'Cláusula 8.1 a 8.4 — Planejamento Operacional e Fornecedores', '40 min', 3, ${`
<h2>Cláusula 8 — Operação (Parte 1: Planejamento, Requisitos e Fornecedores)</h2>

<p>A cláusula 8 e a mais extensa da norma e cobre toda a operação — desde a determinação dos requisitos do produto/serviço até a entrega e pos-entrega. E aqui que "a borracha encontra o asfalto".</p>

<h3>8.1 — Planejamento e controle operacional</h3>

<p>A organização deve planejar, implementar e controlar os processos necessários para atender aos requisitos de provisão de produtos e serviços. Isso inclui:</p>

<ul>
  <li>Determinar requisitos de produtos/serviços.</li>
  <li>Estabelecer critérios para processos e aceitação.</li>
  <li>Determinar recursos necessários.</li>
  <li>Implementar controle dos processos.</li>
  <li>Manter e reter informação documentada.</li>
</ul>

<p>Na prática, isso se traduz em planos de produção, ordens de serviço, fichas de processo, planos de controle — documentos que definem COMO a operação deve ser executada e controlada.</p>

<h3>8.2 — Requisitos para produtos e serviços</h3>

<h3>8.2.1 — Comúnicação com o cliente</h3>

<p>A comúnicação deve incluir: informações sobre produtos/serviços, consultas/contratos/pedidos (incluindo mudanças), retroalimentação do cliente (incluindo reclamações), propriedade do cliente e requisitos de contingencia.</p>

<h3>8.2.2 — Determinação de requisitos</h3>

<p>Ao determinar os requisitos, a organização deve assegurar que:</p>

<ul>
  <li>Requisitos do produto/serviço estejam definidos (incluindo legais e regulamentares).</li>
  <li>A organização pode atender as declarações feitas sobre o que oferece.</li>
</ul>

<h3>8.2.3 — Análise crítica dos requisitos</h3>

<p>Antes de se comprometer a fornecer, a organização deve fazer uma análise crítica para assegurar que tem capacidade de atender. Essa análise deve cobrir: requisitos específicados pelo cliente, requisitos não declarados mas necessários, requisitos legais e requisitos da propria organização.</p>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> Um cliente envia desenho de uma peça com tolerância de 0,005mm. Antes de aceitar o pedido, o setor técnico analisa: temos máquina capaz dessa tolerância? O material esta disponível? O prazo e viavel? Ha requisitos especiais (tratamento térmico, revestimento)? Essa e a análise crítica de requisitos. Se for aprovada, gera-se a ordem de produção. Se houver divergencia, negocia-se com o cliente ANTES de aceitar.</div>

<div class="callout"><strong>Importante:</strong> Um erro clássico: aceitar o pedido do cliente sem análise crítica ("o vendedor prometeu, agora a produção se vira"). Isso gera atraso, retrabalho e insatisfação. A análise crítica evita que a empresa se comprometa com algo que não pode entregar.</div>

<h3>8.4 — Controle de processos, produtos e serviços providos externamente</h3>

<p>Em linguagem simples: gestão de fornecedores e terceirizados. A norma exige que a organização controle processos, produtos e serviços de fornecedores externos quando:</p>

<ul>
  <li>São incorporados nos próprios produtos/serviços.</li>
  <li>São fornecidos diretamente ao cliente em nome da organização.</li>
  <li>Um processo e fornecido externamente por decisão da organização.</li>
</ul>

<h3>8.4.1 — Critérios de avaliação, seleção e monitoramento</h3>

<p>A organização deve definir critérios para avaliar, selecionar, monitorar e reavaliar fornecedores. Os critérios tipicos:</p>

<table>
  <tr><th>Critério</th><th>O que avaliar</th><th>Evidência</th></tr>
  <tr><td>Qualidade</td><td>Histórico de não conformidades, certificações</td><td>IQF (Índice de Qualidade do Fornecedor), % rejeição</td></tr>
  <tr><td>Prazo</td><td>Pontualidade de entrega</td><td>% entregas no prazo</td></tr>
  <tr><td>Capacidade técnica</td><td>Parque de máquinas, equipe técnica</td><td>Auditoria de segunda parte, questionario</td></tr>
  <tr><td>Preco</td><td>Competitividade, estabilidade</td><td>Comparativo de mercado</td></tr>
  <tr><td>Atendimento</td><td>Responsividade, resolução de problemas</td><td>Avaliação qualitativa</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora classifica seus fornecedores em três categorias: A (aprovado sem restrição), B (aprovado com monitoramento intensificado) e C (reprovado/suspenso). A avaliação e semestral, baseada em: qualidade do material entregue (40%), pontualidade (30%), preco (15%) e atendimento (15%). Fornecedores com nota abaixo de 60 são suspensos. Fornecedores de materiais críticos (concreto, aco) passam por auditoria de segunda parte antes da aprovação.</div>

<h3>8.4.2 — Tipo e extensão do controle</h3>

<p>O nível de controle sobre o fornecedor deve ser proporcional ao impacto do produto/serviço fornecido na conformidade do produto final. Um fornecedor de canetas para o escritório não precisa do mesmo nível de controle que um fornecedor de materia-prima crítica.</p>

<h3>8.4.3 — Informação para provedores externos</h3>

<p>A organização deve comúnicar claramente ao fornecedor: requisitos do produto/serviço, métodos e processos, requisitos de aprovação, competência necessária, interações com o SGQ da organização e controle/monitoramento que sera aplicado.</p>

<div class="template-box"><span>Download: Formulario de avaliação de fornecedores + lista de fornecedores aprovados</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod4}, 'produção-liberação', 'Cláusula 8.5 a 8.7 — Produção, Liberação e Controle de Não Conformes', '40 min', 4, ${`
<h2>Cláusula 8 — Operação (Parte 2: Produção, Liberação e Saidas Não Conformes)</h2>

<h3>8.5 — Produção e provisão de serviço</h3>

<h3>8.5.1 — Controle de produção e provisão de serviço</h3>

<p>A produção deve ser realizada sob condições controladas, incluindo:</p>

<ul>
  <li>Disponibilidade de informação documentada que defina as caracteristicas do produto e as atividades a serem realizadas.</li>
  <li>Disponibilidade e uso de recursos de monitoramento e medição adequados.</li>
  <li>Implementação de atividades de monitoramento e medição em estagios apropriados.</li>
  <li>Uso de infraestrutura e ambiente adequados.</li>
  <li>Designação de pessoas competentes.</li>
  <li>Validação (e reválidação periodica) de processos cuja saida não possa ser verificada por monitoramento/medição subsequente.</li>
  <li>Implementação de ações para prevenir erro humano.</li>
  <li>Implementação de atividades de liberação, entrega e pos-entrega.</li>
</ul>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> Na linha de usinagem, "condições controladas" significa: (1) programa CNC válidado e bloqueado (sem edicao pelo operador), (2) instrução de trabalho visual na estação com sequência de operações, (3) paquímetro e micrometro calibrados disponíveis, (4) medição a cada 10 peças conforme plano de controle, (5) operador treinado e qualificado para aquela operação, (6) ficha de setup preenchida antes de iniciar o lote.</div>

<h3>8.5.1 f — Validação de processos especiais</h3>

<div class="callout"><strong>Importante:</strong> Processos "especiais" são aqueles cujo resultado não pode ser verificado por inspeção depois. Exemplos clássicos: solda, tratamento térmico, pintura, colagem, pasteurização. Nesses processos, você precisa VALIDAR o processo (provar que ele e capaz de produzir resultados conformes) e controlar os parâmetros durante a execução, porque depois não há como verificar 100% sem destruir o produto.</div>

<h3>8.5.2 — Identificação e rastreabilidade</h3>

<p>A organização deve usar meios adequados para identificar as saídas dos processos e identificar o status de monitoramento/medição (aprovado, reprovado, em análise). Quando a rastreabilidade for um requisito, a organização deve controlar a identificação única das saídas e reter informação documentada.</p>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Cada lote de produção recebe um código único (ex: EMB-2025-0342) que permite rastrear: quais materias-primas foram usadas (lote do fornecedor), qual linha de produção, qual turno, quais parâmetros de processo (temperatura, tempo), quais resultados de análise e para quais clientes o lote foi enviado. Se houver um recall, a empresa consegue identificar em minutos todos os clientes afetados.</div>

<h3>8.5.3 — Propriedade pertencente a clientes ou provedores externos</h3>

<p>Se a organização usa algo que pertence ao cliente ou ao fornecedor (materia-prima do cliente, ferramental, propriedade intelectual, dados pessoais), deve identificar, verificar, proteger e salvaguardar essa propriedade. Se algo for perdido, danificado ou inadequado, deve comúnicar ao proprietario e reter registros.</p>

<h3>8.5.4 — Preservação</h3>

<p>A organização deve preservar as saídas durante produção e provisão de serviço, na extensão necessária para assegurar conformidade. Isso inclui identificação, manuseio, embalagem, armazenamento e proteção.</p>

<h3>8.5.5 — Atividades pos-entrega</h3>

<p>Quando aplicável: garantia, assistência técnica, manutenção, reciclagem, disposição final. Deve considerar requisitos legais, consequências potenciais, vida útil, requisitos do cliente e retroalimentação.</p>

<h3>8.5.6 — Controle de mudanças</h3>

<p>Mudanças na produção devem ser analisadas críticamente e controladas para assegurar continuidade da conformidade. Reter informação documentada descrevendo os resultados da análise, as pessoas que autorizaram e as ações tomadas.</p>

<h3>8.6 — Liberação de produtos e serviços</h3>

<p>A organização deve implementar arranjos planejados para verificar que os requisitos foram atendidos. A liberação não deve prosseguir até que os arranjos planejados tenham sido satisfatoriamente concluidos, a menos que aprovado por autoridade pertinente (e pelo cliente, quando aplicável).</p>

<p>A informação documentada de liberação deve incluir: evidência de conformidade com critérios de aceitação e rastreabilidade a quem autorizou a liberação.</p>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Antes de concretar uma laje, o engenheiro confere: armadura conforme projeto (inspeção visual + medição), formas niveladas e estanques, escoramentos verificados, concreto testado (slump test no recebimento). So após todas as verificações estarem OK e o engenheiro assinar a checklist, a concretagem e liberada. Esse e o processo de liberação — e se não for seguido, os riscos estruturais são gravíssimos.</div>

<h3>8.7 — Controle de saídas não conformes</h3>

<p>Quando uma saida não atende aos requisitos, a organização deve assegurar que seja identificada e controlada para prevenir uso ou entrega não intencional. As disposicoes possiveis:</p>

<ul>
  <li><strong>Correção:</strong> retrabalhar ou reparar para tornar conforme.</li>
  <li><strong>Segregação, contenção, retorno ou suspensão:</strong> impedir que o produto não conforme siga adiante.</li>
  <li><strong>Informar o cliente.</strong></li>
  <li><strong>Obter autorização de aceitação sob concessão:</strong> o cliente aceita o produto mesmo fora da especificação.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A segregação e identificação de produto não conforme e crítica. Peças rejeitadas devem ir para uma área identificada (caixa vermelha, prateleira demarcada) para que ninguem as use por engano. Misturar peças boas com ruins e um dos erros mais graves que pode ocorrer numa operação.</div>

<div class="template-box"><span>Download: Plano de controle de produção + formulario de produto não conforme</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 5 — Avaliação e Melhoria (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod5Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Avaliação e Melhoria', 'Cláusulas 9 e 10: monitoramento, auditoria interna, análise crítica, não conformidade, ação corretiva e melhoria contínua.', 5)
    RETURNING id
  `;
  const mod5 = mod5Rows[0].id;

  // --- Aula 5.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod5}, 'monitoramento-medição', 'Cláusula 9.1 — Monitoramento, Medição, Análise e Avaliação', '30 min', 1, ${`
<h2>Cláusula 9.1 — Monitoramento, Medição, Análise e Avaliação</h2>

<p>A cláusula 9 marca a transição do "fazer" para o "verificar" no ciclo PDCA. De nada adianta ter processos bem planejados e executados se você não mede os resultados. A cláusula 9.1 trata exatamente disso: como monitorar, medir, analisar e avaliar o desempenho do SGQ.</p>

<h3>9.1.1 — Generalidades</h3>

<p>A organização deve determinar:</p>

<ul>
  <li><strong>O que</strong> precisa ser monitorado e medido.</li>
  <li><strong>Os métodos</strong> de monitoramento, medição, análise e avaliação.</li>
  <li><strong>Quando</strong> monitorar e medir.</li>
  <li><strong>Quando</strong> analisar e avaliar os resultados.</li>
</ul>

<p>Alem disso, deve avaliar o desempenho e a eficácia do SGQ e reter informação documentada como evidência dos resultados.</p>

<h3>Indicadores-chave (KPIs) do SGQ</h3>

<p>Embora a norma não liste indicadores específicos, a prática mostra que toda organização precisa de um conjunto mínimo de indicadores:</p>

<table>
  <tr><th>Categoria</th><th>Indicador</th><th>Formula tipica</th><th>Frequência</th></tr>
  <tr><td>Qualidade</td><td>Índice de refugo</td><td>(Peças refugadas / total produzido) x 100</td><td>Mensal</td></tr>
  <tr><td>Qualidade</td><td>Índice de retrabalho</td><td>(Peças retrabalhadas / total produzido) x 100</td><td>Mensal</td></tr>
  <tr><td>Cliente</td><td>Reclamações de clientes</td><td>Número absoluto ou por volume vendido</td><td>Mensal</td></tr>
  <tr><td>Cliente</td><td>Satisfação do cliente</td><td>Nota media da pesquisa (0-100)</td><td>Semestral/Anual</td></tr>
  <tr><td>Entrega</td><td>Pontualidade de entrega</td><td>(Pedidos no prazo / total de pedidos) x 100</td><td>Mensal</td></tr>
  <tr><td>Processo</td><td>Eficiência operacional (OEE)</td><td>Disponibilidade x Performance x Qualidade</td><td>Mensal</td></tr>
  <tr><td>Fornecedor</td><td>IQF</td><td>Media ponderada (qualidade, prazo, atendimento)</td><td>Trimestral</td></tr>
  <tr><td>SGQ</td><td>Fechamento de não conformidades</td><td>% NCs fechadas no prazo</td><td>Mensal</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Uma fábrica de laticinios monitora diáriamente: temperatura de pasteurização (registro automatico a cada 30 segundos), pH do produto, peso liquido da embalagem (controle estatistico), contagem microbiológica (amostragem por lote). Mensalmente consolida: % de lotes aprovados em primeira inspeção, número de reclamações, volume de descarte por vencimento. Esses dados alimentam a análise crítica trimestral.</div>

<h3>9.1.2 — Satisfação do cliente</h3>

<p>A organização deve monitorar a percepção dos clientes sobre o grau em que suas necessidades e expectativas foram atendidas. A norma pede que a organização determine os métodos para obter, monitorar e analisar críticamente essa informação.</p>

<p>Métodos comuns:</p>

<ul>
  <li><strong>Pesquisa de satisfação:</strong> questionario estruturado (anual ou semestral).</li>
  <li><strong>Análise de reclamações:</strong> tendência, classificação, tempo de resposta.</li>
  <li><strong>Indicadores de desempenho do cliente:</strong> scorecards que o próprio cliente envia.</li>
  <li><strong>Dados de mercado:</strong> participação de mercado, taxas de retenção, novos clientes.</li>
  <li><strong>Entrevistas/visitas:</strong> contato direto para entender percepcoes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A ausência de reclamações NÃO e evidência de satisfação. O auditor vai questionar: "Alem de esperar reclamações, o que vocês fazem ativamente para medir a satisfação?" Se a resposta for "nada", e um achado. Busque a informação — não espere ela chegar.</div>

<h3>9.1.3 — Análise e avaliação</h3>

<p>A organização deve analisar e avaliar dados e informações apropriados. Os resultados da análise devem ser usados para avaliar:</p>

<ul>
  <li>Conformidade de produtos e serviços.</li>
  <li>Grau de satisfação do cliente.</li>
  <li>Desempenho e eficácia do SGQ.</li>
  <li>Se o planejamento foi implementado eficazmente.</li>
  <li>Eficacia das ações para abordar riscos e oportunidades.</li>
  <li>Desempenho de provedores externos.</li>
  <li>Necessidade de melhorias no SGQ.</li>
</ul>

<p>Na prática, isso se traduz em reuniões periodicas de análise de indicadores onde a equipe de gestão avalia os dados, identifica tendências e define ações.</p>

<div class="template-box"><span>Download: Painel de indicadores do SGQ (modelo Excel/Google Sheets)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod5}, 'auditoria-interna', 'Cláusula 9.2 — Auditoria Interna', '30 min', 2, ${`
<h2>Cláusula 9.2 — Auditoria Interna</h2>

<p>A auditoria interna e uma das ferramentas mais poderosas do SGQ — e também uma das mais mal útilizadas. Quando bem feita, e uma oportunidade de aprendizado e melhoria. Quando mal feita, vira uma "cacada a bruxas" ou um "ritual de papel" que ninguem leva a serio.</p>

<h3>O que a norma exige</h3>

<p>A organização deve conduzir auditorias internas em intervalos planejados para prover informação sobre se o SGQ:</p>

<ul>
  <li>Esta conforme os requisitos da propria organização e da ISO 9001.</li>
  <li>Esta implementado e mantido eficazmente.</li>
</ul>

<h3>Programa de auditoria</h3>

<p>A organização deve planejar, estabelecer, implementar e manter um programa de auditoria, incluindo frequência, métodos, responsabilidades, requisitos de planejamento e relato. O programa deve considerar:</p>

<ul>
  <li>A importancia dos processos envolvidos.</li>
  <li>Mudanças que afetem a organização.</li>
  <li>Resultados de auditorias anteriores.</li>
</ul>

<div class="callout"><strong>Importante:</strong> "Intervalos planejados" não significa necessáriamente "uma vez por ano tudo de uma vez". Muitas organizações distribuem as auditorias ao longo do ano, auditando processos diferentes a cada mes ou trimestre. Processos mais críticos ou com histórico de problemas podem ser auditados com maior frequência.</div>

<h3>Requisitos para auditores</h3>

<p>Os auditores devem ser selecionados de forma a assegurar objetividade e imparcialidade. Isso significa: ninguem audita seu próprio trabalho. O gerente de produção não audita a produção. O coordenador de qualidade não audita a gestão da qualidade (na prática, alguem de outro setor audita qualidade).</p>

<p>Competência necessária para auditores internos:</p>

<ul>
  <li>Conhecimento da ISO 9001 (requisitos aplicáveis).</li>
  <li>Conhecimento do processo a ser auditado (básico, não precisa ser especialista).</li>
  <li>Técnicas de auditoria (como formular perguntas, coletar evidências, registrar achados).</li>
  <li>Treinamento formal em auditoria interna (curso de 8 a 16 horas e o padrão de mercado).</li>
</ul>

<h3>Etapas de uma auditoria interna</h3>

<ol>
  <li><strong>Planejamento:</strong> definir escopo, critérios, equipe auditora, cronograma e checklist.</li>
  <li><strong>Reuniao de abertura:</strong> alinhar com o auditado escopo, objetivo, agenda e método.</li>
  <li><strong>Execução:</strong> coleta de evidências por entrevistas, observação e análise documental.</li>
  <li><strong>Classificação de achados:</strong> não conformidade maior, não conformidade menor, oportunidade de melhoria ou conformidade.</li>
  <li><strong>Reuniao de encerramento:</strong> apresentar achados ao auditado, alinhar entendimento.</li>
  <li><strong>Relatório:</strong> formalizar achados, classificação e prazo para tratamento.</li>
  <li><strong>Acompanhamento:</strong> verificar se as ações corretivas foram implementadas e são eficazes.</li>
</ol>

<div class="example"><strong>Exemplo prático — Metalurgica:</strong> O programa anual de auditoria da UsinaMax distribui auditorias ao longo de 10 meses (janeiro e dezembro ficam livres). Cada mes audita 1-2 processos. O setor de metrologia e auditado 2x ao ano (por ser crítico). A equipe de auditores internos tem 4 pessoas de setores diferentes, todas com curso de auditor interno. O coordenador de qualidade coordena o programa mas não participa como auditor (para manter imparcialidade, exceto para auditar processos onde não tem envolvimento direto).</div>

<h3>Perguntas eficazes em auditoria</h3>

<p>Um bom auditor faz perguntas abertas que revelam como o processo realmente funciona:</p>

<ul>
  <li>"Me mostre como você faz [atividade X]."</li>
  <li>"O que você faz quando [situação Y] acontece?"</li>
  <li>"Onde esta registrado [resultado Z]?"</li>
  <li>"Como você sabe que este instrumento esta calibrado?"</li>
  <li>"Quem autorizou essa mudança no processo?"</li>
</ul>

<p>Evite perguntas fechadas (sim/não) e perguntas que induzem a resposta ("você segue o procedimento, ne?").</p>

<div class="callout"><strong>Importante:</strong> A auditoria interna deve ser vista como uma ferramenta de MELHORIA, não de PUNICAO. Se as pessoas tiverem medo da auditoria, vao esconder problemas em vez de mostra-los. A cultura da organização deve incentivar a transparencia: encontrar um problema na auditoria e BOM — significa que podemos corrigi-lo antes que vire uma reclamação do cliente ou uma não conformidade na auditoria de certificação.</div>

<div class="template-box"><span>Download: Programa anual de auditoria + checklist de auditoria por cláusula</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod5}, 'análise-crítica-direção', 'Cláusula 9.3 — Análise Crítica pela Direção', '30 min', 3, ${`
<h2>Cláusula 9.3 — Análise Crítica pela Direção</h2>

<p>A análise crítica pela direção e a reunião mais importante do SGQ. E o momento em que a alta direção avalia o desempenho do sistema, toma decisões estratégicas e direciona a melhoria. Na prática, e onde a cláusula 5 (liderança) se materializa com fatos e dados.</p>

<h3>Frequência</h3>

<p>A norma diz "em intervalos planejados". O padrão de mercado e pelo menos anual, mas muitas organizações fazem semestral ou trimestral — e isso e altamente recomendado. Quanto mais frequente, mais agil a resposta a problemas.</p>

<h3>9.3.2 — Entradas da análise crítica</h3>

<p>A norma específica o que DEVE ser analisado. Essas são as entradas obrigatórias:</p>

<ol>
  <li><strong>Situação das ações de análises críticas anteriores:</strong> o que foi decidido na ultima reunião? Foi implementado?</li>
  <li><strong>Mudanças em questões externas e internas:</strong> algo mudou no contexto? Novos requisitos legais? Novo mercado?</li>
  <li><strong>Informação sobre desempenho e eficácia do SGQ:</strong>
    <ul>
      <li>Satisfação do cliente e retroalimentação de partes interessadas.</li>
      <li>Extensao em que os objetivos da qualidade foram alcancados.</li>
      <li>Desempenho de processos e conformidade de produtos/serviços.</li>
      <li>Não conformidades e ações corretivas.</li>
      <li>Resultados de monitoramento e medição.</li>
      <li>Resultados de auditoria.</li>
      <li>Desempenho de provedores externos.</li>
    </ul>
  </li>
  <li><strong>Adequação de recursos.</strong></li>
  <li><strong>Eficacia de ações para abordar riscos e oportunidades.</strong></li>
  <li><strong>Oportunidades de melhoria.</strong></li>
</ol>

<div class="example"><strong>Exemplo prático — Cooperativa agrícola:</strong> A análise crítica semestral da cooperativa segue uma pauta fixa de 2 horas:
<ul>
  <li>15 min — Status das ações da reunião anterior</li>
  <li>20 min — Indicadores de qualidade (grãos classificados, perdas, reclamações)</li>
  <li>15 min — Resultado da pesquisa de satisfação dos cooperados</li>
  <li>15 min — Resultados de auditorias internas</li>
  <li>15 min — Análise de não conformidades e ações corretivas</li>
  <li>15 min — Desempenho de fornecedores</li>
  <li>15 min — Revisao de riscos e oportunidades</li>
  <li>10 min — Necessidades de recursos e investimentos</li>
</ul>
Participam: presidente, diretor técnico, gerente de operações, coordenador de qualidade e gerente financeiro.</div>

<h3>9.3.3 — Saidas da análise crítica</h3>

<p>As saídas devem incluir decisões e ações relacionadas a:</p>

<ul>
  <li>Oportunidades de melhoria.</li>
  <li>Qualquer necessidade de mudança no SGQ.</li>
  <li>Necessidade de recursos.</li>
</ul>

<p>Em termos práticos, a ata da análise crítica deve registrar decisões concretas: quem vai fazer o que, até quando, com quais recursos.</p>

<div class="callout"><strong>Importante:</strong> O erro mais comum: a análise crítica vira uma "reunião de apresentação de indicadores" onde a direção ouve, faz alguns comentários e vai embora sem decisões concretas. A ata tem frases como "manter monitoramento" — que não e uma decisão, e uma fuga. O auditor vai cobrar: quais DECISOES foram tomadas? Quais ACOES foram definidas? Os RESULTADOS foram diferentes por causa dessa reunião?</div>

<h3>Dicas para uma análise crítica eficaz</h3>

<ol>
  <li><strong>Prepare o material com antecedencia</strong> — envie os dados pelo menos 5 dias antes para que todos venham preparados.</li>
  <li><strong>Use graficos e tendências</strong> — não só números absolutos. Mostre a evolução ao longo do tempo.</li>
  <li><strong>Foque em desvios e tendências negativas</strong> — o que esta no verde e rápido; o que esta no vermelho exige discussao.</li>
  <li><strong>Registre DECISOES, não só discussoes</strong> — a ata deve ter ações com responsável e prazo.</li>
  <li><strong>Acompanhe na próxima reunião</strong> — a primeira entrada da próxima análise crítica e o status das ações anteriores.</li>
</ol>

<div class="template-box"><span>Download: Modelo de ata de análise crítica pela direção</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod5}, 'melhoria-não-conformidade', 'Cláusula 10 — Melhoria, Não Conformidade e Acao Corretiva', '30 min', 4, ${`
<h2>Cláusula 10 — Melhoria, Não Conformidade e Acao Corretiva</h2>

<p>A cláusula 10 fecha o ciclo PDCA com o "Act" — agir para melhorar. E dividida em três partes: generalidades (10.1), não conformidade e ação corretiva (10.2) e melhoria contínua (10.3).</p>

<h3>10.1 — Generalidades</h3>

<p>A organização deve determinar e selecionar oportunidades de melhoria e implementar ações necessárias para atender aos requisitos do cliente e aumentar a satisfação. Isso inclui:</p>

<ul>
  <li>Melhorar produtos e serviços para atender requisitos e considerar necessidades futuras.</li>
  <li>Corrigir, prevenir ou reduzir efeitos indesejaveis.</li>
  <li>Melhorar o desempenho e a eficácia do SGQ.</li>
</ul>

<h3>10.2 — Não conformidade e ação corretiva</h3>

<p>Esta e a cláusula que mais gera evidências em auditorias e a que mais frequentemente apresenta problemas. O tratamento de não conformidades e o "teste de estrêsse" do SGQ.</p>

<p>Quando uma não conformidade ocorre (incluindo reclamações de clientes), a organização deve:</p>

<ol>
  <li><strong>Reagir a não conformidade:</strong>
    <ul>
      <li>Tomar ação para controla-la e corrigi-la (correção — disposição imediata).</li>
      <li>Lidar com as consequências.</li>
    </ul>
  </li>
  <li><strong>Avaliar a necessidade de ação para eliminar a causa:</strong>
    <ul>
      <li>Analisar críticamente a não conformidade.</li>
      <li>Determinar as causas.</li>
      <li>Determinar se não conformidades similares existem ou podem ocorrer.</li>
    </ul>
  </li>
  <li><strong>Implementar a ação necessária (ação corretiva).</strong></li>
  <li><strong>Analisar críticamente a eficácia da ação corretiva.</strong></li>
  <li><strong>Atualizar riscos e oportunidades, se necessário.</strong></li>
  <li><strong>Fazer mudanças no SGQ, se necessário.</strong></li>
</ol>

<h3>A diferença entre correção e ação corretiva</h3>

<div class="callout"><strong>Importante:</strong> Essa diferença e fundamental e frequentemente confundida.
<ul>
  <li><strong>Correção</strong> (disposição imediata): o que você faz AGORA para resolver o problema pontual. Exemplo: retrabalhar a peça, segregar o lote, devolver ao fornecedor.</li>
  <li><strong>Acao corretiva</strong>: o que você faz para eliminar a CAUSA do problema e evitar que se repita. Exemplo: recalibrar a máquina, retreinar o operador, revisar o procedimento, trocar de fornecedor.</li>
</ul>
A correção "apaga o incêndio". A ação corretiva "conserta a fiação elétrica" para que o incêndio não volte.</div>

<h3>Ferramentas de análise de causa raiz</h3>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Como funciona</th></tr>
  <tr><td>5 Porques</td><td>Problemas simples a moderados</td><td>Perguntar "por que?" 5 vezes até chegar a causa raiz</td></tr>
  <tr><td>Ishikawa (Espinha de peixe)</td><td>Problemas com múltiplas causas potenciais</td><td>Categorizar causas em 6M: Máquina, Método, Mao de obra, Material, Meio ambiente, Medição</td></tr>
  <tr><td>8D</td><td>Problemas complexos, especialmente reclamações de clientes</td><td>8 disciplinas estruturadas, da contenção até prevenção</td></tr>
  <tr><td>A3</td><td>Problemas que precisam ser comunicados de forma concisa</td><td>Tudo em uma folha A3: problema, análise, ação, resultado</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Metalurgica (5 Porques):</strong>
<p><strong>Problema:</strong> Lote de 200 eixos entregue com diametro fora de tolerância.</p>
<ul>
  <li>Por que? A medição não detectou o desvio durante a produção.</li>
  <li>Por que? O operador não mediu no intervalo específicado (a cada 10 peças).</li>
  <li>Por que? O operador estava acumulando a função de duas máquinas.</li>
  <li>Por que? O colega de turno faltou e não foi providenciado substituto.</li>
  <li>Por que? Não existe procedimento para substituição em caso de falta.</li>
</ul>
<p><strong>Causa raiz:</strong> Falta de procedimento para cobertura de ausências em funções críticas.</p>
<p><strong>Acao corretiva:</strong> Criar e implementar procedimento de cobertura com operadores polivalentes treinados.</p>
<p><strong>Verificação de eficácia:</strong> Acompanhar por 3 meses se há reincidencia; monitorar absenteismo e cobertura.</p></div>

<h3>10.3 — Melhoria contínua</h3>

<p>A organização deve melhorar continuamente a adequação, suficiência e eficácia do SGQ, considerando os resultados de análise e avaliação e as saídas da análise crítica para determinar se há necessidades ou oportunidades de melhoria.</p>

<p>Melhoria contínua não e apenas corrigir problemas. E buscar ativamente fazer melhor:</p>

<ul>
  <li><strong>Projetos de melhoria:</strong> kaizen, lean, six sigma, grupos de melhoria.</li>
  <li><strong>Benchmarking:</strong> comparar-se com os melhores do setor.</li>
  <li><strong>Inovação de processos:</strong> adotar novas tecnologias, novos métodos.</li>
  <li><strong>Sugestoes de colaboradores:</strong> programa estruturado de sugestoes.</li>
</ul>

<div class="template-box"><span>Download: Formulario de não conformidade e ação corretiva (RAC) + guia de 5 Porques</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MODULO 6 — Integração e Certificação (1.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod6Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Integração e Certificação', 'Roteiro de implantação, preparação para certificação, manutenção do SGQ e informações sobre a prova final.', 6)
    RETURNING id
  `;
  const mod6 = mod6Rows[0].id;

  // --- Aula 6.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod6}, 'roteiro-implantação', 'Roteiro de Implantação — Do Zero a Certificação', '25 min', 1, ${`
<h2>Roteiro de Implantação — Do Zero a Certificação</h2>

<p>Agora que você conhece todos os requisitos da ISO 9001:2015, vamos montar o roteiro prático para implantar o SGQ e chegar a certificação. O prazo tipico para uma PME brasileira e de 6 a 12 meses, dependendo da complexidade e maturidade da organização.</p>

<h3>Fase 1 — Diagnóstico e planejamento (mes 1-2)</h3>

<table>
  <tr><th>Atividade</th><th>Entrega</th><th>Responsável</th></tr>
  <tr><td>Diagnóstico inicial (gap analysis)</td><td>Relatório de gaps vs. requisitos ISO 9001</td><td>Consultor/Coordenador de Qualidade</td></tr>
  <tr><td>Comprometimento da direção</td><td>Ata de reunião de lançamento do projeto</td><td>Diretor + Consultor</td></tr>
  <tr><td>Definição do comite de implantação</td><td>Nomeação formal com papeis e responsabilidades</td><td>Diretor</td></tr>
  <tr><td>Cronograma do projeto</td><td>Cronograma detalhado com marcos e responsáveis</td><td>Coordenador de Qualidade</td></tr>
  <tr><td>Treinamento da equipe na norma</td><td>Todos os envolvidos treinados nos requisitos básicos</td><td>Consultor</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> O diagnóstico inicial e crítico. Ele mostra onde a empresa já atende (você vai se surpreender — muitas coisas já são feitas) e onde tem lacunas. Isso permite priorizar esforcos. Não comece documentando tudo — comece pelo que falta.</div>

<h3>Fase 2 — Construção do SGQ (mes 2-6)</h3>

<ol>
  <li><strong>Análise de contexto e partes interessadas</strong> (cláusulas 4.1, 4.2) — workshop com direção e gerencia, 4 horas.</li>
  <li><strong>Definição do escopo</strong> (cláusula 4.3) — redação e aprovação.</li>
  <li><strong>Mapeamento de processos</strong> (cláusula 4.4) — identificar processos, interações, donos e indicadores.</li>
  <li><strong>Política da qualidade</strong> (cláusula 5.2) — redigir, aprovar e comúnicar.</li>
  <li><strong>Gestão de riscos</strong> (cláusula 6.1) — workshop por processo, montar matriz de riscos.</li>
  <li><strong>Objetivos da qualidade</strong> (cláusula 6.2) — definir com planos de ação.</li>
  <li><strong>Documentação</strong> (cláusula 7.5) — criar/revisar procedimentos, instruções de trabalho, formularios.</li>
  <li><strong>Gestão de competências</strong> (cláusula 7.2) — matriz de competências, plano de treinamento.</li>
  <li><strong>Controle de fornecedores</strong> (cláusula 8.4) — critérios, avaliação, lista aprovada.</li>
  <li><strong>Controle de produção</strong> (cláusula 8.5) — planos de controle, instruções operacionais.</li>
  <li><strong>Gestão de não conformidades</strong> (cláusula 8.7, 10.2) — procedimento de tratamento de NC.</li>
  <li><strong>Calibração</strong> (cláusula 7.1.5) — inventario de instrumentos, plano de calibração.</li>
</ol>

<h3>Fase 3 — Operação e maturação (mes 5-9)</h3>

<p>O SGQ precisa "rodar" por pelo menos 3 meses antes da auditoria de certificação, gerando evidências de que funciona na prática:</p>

<ul>
  <li>Indicadores sendo coletados e analisados.</li>
  <li>Registros de produção, inspeção e liberação sendo feitos.</li>
  <li>Não conformidades sendo tratadas com análise de causa e ação corretiva.</li>
  <li>Fornecedores sendo avaliados.</li>
  <li>Treinamentos sendo realizados e registrados.</li>
</ul>

<h3>Fase 4 — Verificação (mes 8-10)</h3>

<ol>
  <li><strong>Auditoria interna completa</strong> (cláusula 9.2) — cobrindo todos os processos e cláusulas.</li>
  <li><strong>Tratamento dos achados</strong> da auditoria interna.</li>
  <li><strong>Análise crítica pela direção</strong> (cláusula 9.3) — com todas as entradas obrigatórias.</li>
</ol>

<h3>Fase 5 — Certificação (mes 10-12)</h3>

<ol>
  <li><strong>Seleção do organismo certificador:</strong> Bureau Veritas, SGS, BRTUV, Fundação Vanzolini, ABS, DNV, entre outros.</li>
  <li><strong>Auditoria de Fase 1 (documental):</strong> o auditor externo analisa a documentação do SGQ, verifica se os requisitos estão enderecados e identifica áreas de preocupação.</li>
  <li><strong>Correção de achados da Fase 1.</strong></li>
  <li><strong>Auditoria de Fase 2 (no local):</strong> o auditor verifica a implementação e eficácia do SGQ no chão de fábrica/escritório.</li>
  <li><strong>Tratamento de não conformidades</strong> (se houver) dentro do prazo estipulado.</li>
  <li><strong>Emissao do certificado.</strong></li>
</ol>

<div class="example"><strong>Exemplo prático — Cronograma real:</strong> A MetalForte (60 funcionários, Caxias do Sul) iníciou o projeto em fevereiro. Diagnóstico em fevereiro/marco. Construção do SGQ de marco a julho. Operação plena de agosto a outubro. Auditoria interna em novembro. Análise crítica em novembro. Auditoria de certificação Fase 1 em dezembro, Fase 2 em janeiro. Certificado emitido em fevereiro — 12 meses após o início.</div>

<div class="template-box"><span>Download: Cronograma de implantação ISO 9001 (Gantt editavel)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod6}, 'preparação-auditoria-certificação', 'Preparação para a Auditoria de Certificação', '25 min', 2, ${`
<h2>Preparação para a Auditoria de Certificação</h2>

<p>A auditoria de certificação e o momento da verdade. Vamos desmistifica-la: não e um tribunal, e não e impossível. Com preparação adequada, a grande maioria das organizações e certificada na primeira tentativa.</p>

<h3>Escolhendo o organismo certificador</h3>

<p>No Brasil, os principais organismos certificadores acreditados pelo Inmetro para ISO 9001 sao:</p>

<table>
  <tr><th>Organismo</th><th>Perfil</th><th>Faixa de preco (PME)</th></tr>
  <tr><td>Bureau Veritas</td><td>Global, forte na indústria</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>SGS</td><td>Global, ampla presença</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>BRTUV</td><td>Origem alema, foco indústrial</td><td>R$ 7.000 - R$ 15.000</td></tr>
  <tr><td>Fundação Vanzolini</td><td>Nacional, forte em SP</td><td>R$ 6.000 - R$ 14.000</td></tr>
  <tr><td>DNV</td><td>Global, forte em processos</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>ABS Quality</td><td>Origem naval, versatil</td><td>R$ 7.000 - R$ 15.000</td></tr>
</table>

<p>Os precos variam conforme: número de funcionários, número de sites, complexidade dos processos e localização (deslocamento do auditor).</p>

<div class="callout"><strong>Importante:</strong> O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do IAF — International Accreditation Forum). Um certificado de um organismo não acreditado não tem válidade de mercado. Verifique no site do Inmetro: <em>certifiq.inmetro.gov.br</em>.</div>

<h3>Auditoria Fase 1 — Análise documental</h3>

<p>O que o auditor avalia na Fase 1:</p>

<ul>
  <li>Documentação do SGQ (política, escopo, processos, procedimentos, registros).</li>
  <li>Contexto, partes interessadas e riscos.</li>
  <li>Objetivos e indicadores.</li>
  <li>Resultados de auditoria interna e análise crítica.</li>
  <li>Condicoes específicas do site (layout, fluxo, infraestrutura).</li>
</ul>

<p>A Fase 1 geralmente dura 1 dia para PMEs. O auditor emite um relatório com achados e recomendações. Se houver não conformidades maiores, a Fase 2 pode ser adiada até a resolução.</p>

<h3>Auditoria Fase 2 — No local</h3>

<p>E a auditoria completa. O auditor passa por todos os processos do escopo, entrevista pessoas em todos os niveis (direção, gerencia, operação) e verifica evidências de implementação e eficácia. Duração tipica: 2 a 4 dias para PMEs.</p>

<p>O que o auditor faz na prática:</p>

<ol>
  <li><strong>Reuniao de abertura:</strong> apresentação, escopo, agenda.</li>
  <li><strong>Auditoria da direção:</strong> entrevista com alta direção sobre contexto, política, objetivos, análise crítica.</li>
  <li><strong>Auditoria de processos:</strong> percorre cada processo do escopo, entrevista responsáveis e operadores, verifica registros.</li>
  <li><strong>Verificação no chão de fábrica/campo:</strong> observa operações reais, verifica calibração, identificação, rastreabilidade.</li>
  <li><strong>Reuniao de encerramento:</strong> apresenta achados, classifica (NC maior, NC menor, oportunidade de melhoria).</li>
</ol>

<h3>Classificação de achados</h3>

<table>
  <tr><th>Classificação</th><th>Definição</th><th>Consequencia</th></tr>
  <tr><td>Não conformidade maior</td><td>Falha sistemática ou ausência total de requisito</td><td>Certificação não e concedida até resolução (prazo 90 dias)</td></tr>
  <tr><td>Não conformidade menor</td><td>Falha pontual, não sistemática</td><td>Certificação e concedida, mas NC deve ser tratada até a próxima auditoria</td></tr>
  <tr><td>Oportunidade de melhoria</td><td>Atende ao requisito mas poderia ser melhor</td><td>Informativo, não bloqueia certificação</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Não conformidades mais comuns em auditorias de certificação:</strong>
<ul>
  <li>Instrumento de medição com calibração vencida em uso na produção (7.1.5).</li>
  <li>Análise crítica pela direção sem todas as entradas obrigatórias (9.3.2).</li>
  <li>Acao corretiva sem análise de causa raiz — apenas correção (10.2).</li>
  <li>Objetivos da qualidade sem plano de ação associado (6.2).</li>
  <li>Risco identificado mas sem ação implementada (6.1).</li>
  <li>Competência de operador não evidênciada para função crítica (7.2).</li>
</ul></div>

<h3>Dicas para o dia da auditoria</h3>

<ul>
  <li>Responda o que foi perguntado — não mais, não menos. Não "ofereca" problemas.</li>
  <li>Se não souber a resposta, diga "vou verificar" — e efetivamente verifique.</li>
  <li>Mostre evidências concretas (registros, telas, fotos) — não apenas explique verbalmente.</li>
  <li>Seja honesto. Se algo não esta implementado ainda, diga. Tentar enganar o auditor sempre termina mal.</li>
  <li>Mantenha a calma. O auditor não e um inimigo — e um profissional fazendo seu trabalho.</li>
</ul>

<div class="template-box"><span>Download: Checklist de preparação pre-auditoria de certificação</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod6}, 'manutenção-sgq', 'Manutenção e Melhoria Continua do SGQ', '20 min', 3, ${`
<h2>Manutenção e Melhoria Continua do SGQ após a Certificação</h2>

<p>Conseguir o certificado e importante, mas mante-lo e o verdadeiro desafio. O certificado ISO 9001 tem válidade de 3 anos, com auditorias de manutenção anuais. Se a organização relaxar após a certificação, a próxima auditoria vai revelar a deterioração — e o certificado pode ser suspenso.</p>

<h3>Ciclo de certificação (3 anos)</h3>

<table>
  <tr><th>Ano</th><th>Tipo de auditoria</th><th>Escopo</th><th>Duração tipica (PME)</th></tr>
  <tr><td>Ano 1</td><td>Certificação (Fase 1 + Fase 2)</td><td>Completo — todos os requisitos</td><td>3-5 dias</td></tr>
  <tr><td>Ano 2</td><td>Manutenção (Vigilancia 1)</td><td>Parcial — amostragem de processos</td><td>1-2 dias</td></tr>
  <tr><td>Ano 3</td><td>Manutenção (Vigilancia 2)</td><td>Parcial — outros processos</td><td>1-2 dias</td></tr>
  <tr><td>Ano 4</td><td>Recertificação</td><td>Completo — todos os requisitos</td><td>2-4 dias</td></tr>
</table>

<h3>Rotina mensal de manutenção do SGQ</h3>

<p>Para manter o SGQ vivo e eficaz, estabeleca uma rotina mínima:</p>

<ul>
  <li><strong>Semanal:</strong> coleta de indicadores de processo (refugo, retrabalho, pontualidade).</li>
  <li><strong>Mensal:</strong> reunião de indicadores com gestores de processo, análise de não conformidades abertas, status de ações corretivas.</li>
  <li><strong>Trimestral:</strong> avaliação de fornecedores, revisão da matriz de riscos, verificação de calibração.</li>
  <li><strong>Semestral:</strong> pesquisa de satisfação do cliente, auditoria interna parcial.</li>
  <li><strong>Anual:</strong> auditoria interna completa, análise crítica pela direção, revisão de contexto e partes interessadas, atualização de objetivos.</li>
</ul>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Após a certificação, a construtora designou 4 horas semanais do coordenador de qualidade para atividades de manutenção do SGQ: verificar não conformidades de obra (segunda), atualizar indicadores (terça), acompanhar ações corretivas (quarta) e preparar material para a reunião mensal de indicadores (quinta). Esse investimento de tempo manteve o SGQ ativo sem sobrecarregar ninguem.</div>

<h3>Armadilhas comuns após a certificação</h3>

<ol>
  <li><strong>"Sindrome do diploma na parede":</strong> conseguir o certificado e esquecer o SGQ. O sistema morre em poucos meses.</li>
  <li><strong>Documentação defasada:</strong> processos mudam mas documentos não são atualizados. Gera divergencia entre o real e o documentado.</li>
  <li><strong>Indicadores sem análise:</strong> coletar dados sem analisa-los e agir sobre eles. Vira burocracia pura.</li>
  <li><strong>Auditoria interna pro-forma:</strong> auditoria feita "para cumprir tabela" sem profundidade. Não gera melhoria.</li>
  <li><strong>Direção se desconecta:</strong> após a certificação, a direção delega tudo ao "pessoal da qualidade". O comprometimento some.</li>
</ol>

<div class="callout"><strong>Importante:</strong> O SGQ deve gerar VALOR para a gestão, não ser um peso. Se os gestores veem o SGQ como burocracia, algo esta errado. Revise: os indicadores são uteis para decisões? Os procedimentos ajudam o trabalho? As auditorias revelam oportunidades reais? Se a resposta for "não" em algum desses pontos, simplifique e melhore o próprio SGQ.</div>

<h3>Evolução do SGQ — próximos passos</h3>

<p>Após consolidar a ISO 9001, muitas organizações evoluem para:</p>

<ul>
  <li><strong>ISO 14001:</strong> Sistema de Gestão Ambiental — integravel com ISO 9001 pela estrutura comum.</li>
  <li><strong>ISO 45001:</strong> Saude e Seguranca Ocupacional — substitui a antiga OHSAS 18001.</li>
  <li><strong>IATF 16949:</strong> Gestão da Qualidade Automotiva — para fornecedores do setor automotivo.</li>
  <li><strong>FSSC 22000:</strong> Seguranca de Alimentos — para indústria alimentícia.</li>
  <li><strong>ISO 19011:</strong> Diretrizes para auditoria de sistemas de gestão — aprofundar competência de auditoria.</li>
</ul>

<div class="template-box"><span>Download: Calendario anual de manutenção do SGQ</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duração, ordem, conteúdo) VALUES (${mod6}, 'prova-final-orientações', 'Orientações para a Prova Final e Encerramento', '20 min', 4, ${`
<h2>Orientações para a Prova Final e Encerramento</h2>

<p>Parabens por chegar até aqui! Você percorreu todas as cláusulas da ISO 9001:2015, com exemplos práticos da indústria brasileira. Agora vamos preparar você para a prova final do curso, que e requisito para a emissão do certificado.</p>

<h3>Formato da prova final</h3>

<ul>
  <li><strong>Número de questões:</strong> 30 questões de multipla escolha.</li>
  <li><strong>Tempo:</strong> sem limite de tempo — faca com calma e concentração.</li>
  <li><strong>Nota mínima para aprovação:</strong> 70% (21 acertos em 30).</li>
  <li><strong>Tentativas:</strong> ilimitadas — se não passar, revise o conteúdo e tente novamente.</li>
  <li><strong>Abrangencia:</strong> todos os 6 módulos do curso, com enfase nas cláusulas 4 a 10.</li>
</ul>

<h3>Dicas para a prova</h3>

<ol>
  <li><strong>Leia a pergunta COMPLETA antes de ver as alternativas.</strong> Muitas questões tem pegadinhas sutis.</li>
  <li><strong>Preste atenção em palavras-chave:</strong> "deve" (obrigatório), "pode" (opcional), "quando aplicável" (condicional).</li>
  <li><strong>Identifique a cláusula:</strong> se a questao menciona "riscos e oportunidades", você sabe que e cláusula 6.1. Isso ajuda a contextualizar.</li>
  <li><strong>Elimine alternativas absurdas primeiro:</strong> geralmente 1 ou 2 alternativas são claramente incorretas. Elimine-as e compare as restantes.</li>
  <li><strong>Pense na prática:</strong> muitas questões pedem aplicação, não memorização. Pense em como você aplicaria o conceito numa empresa real.</li>
  <li><strong>Se tiver duvida, volte ao conteúdo:</strong> as aulas ficam disponíveis. Releia a aula correspondente antes de responder.</li>
</ol>

<h3>Temas mais cobrados</h3>

<table>
  <tr><th>Tema</th><th>Cláusulas</th><th>Frequência na prova</th></tr>
  <tr><td>Mentalidade de risco</td><td>6.1</td><td>Alta</td></tr>
  <tr><td>Informação documentada</td><td>7.5</td><td>Alta</td></tr>
  <tr><td>Liderança e comprometimento</td><td>5.1</td><td>Media-Alta</td></tr>
  <tr><td>Auditoria interna</td><td>9.2</td><td>Media-Alta</td></tr>
  <tr><td>Não conformidade e ação corretiva</td><td>10.2</td><td>Alta</td></tr>
  <tr><td>Contexto e partes interessadas</td><td>4.1, 4.2</td><td>Media</td></tr>
  <tr><td>Controle de fornecedores</td><td>8.4</td><td>Media</td></tr>
  <tr><td>Análise crítica pela direção</td><td>9.3</td><td>Media</td></tr>
</table>

<h3>O certificado</h3>

<p>Ao atingir 70% ou mais na prova final E ter concluido todas as aulas do curso, você recebera automaticamente o <strong>Certificado de Conclusão</strong> do curso "ISO 9001:2015 — Interpretação dos Requisitos", emitido pela Anders Tech, com carga horaria de 12 horas.</p>

<p>O certificado e gerado em PDF, com código de verificação único que pode ser válidado no site da Anders Tech. Você pode usa-lo para:</p>

<ul>
  <li>Comprovar competência em ISO 9001 para seu empregador.</li>
  <li>Compor horas de treinamento para auditorias de certificação.</li>
  <li>Incluir no curriculo/LinkedIn.</li>
  <li>Atender requisitos de qualificação de fornecedores.</li>
</ul>

<h3>Revisao rápida dos pontos-chave</h3>

<p>Antes de fazer a prova, relembre:</p>

<ul>
  <li>A ISO 9001:2015 tem 10 cláusulas, sendo que 4 a 10 contem requisitos auditaveis.</li>
  <li>A estrutura segue o ciclo PDCA: Plan (4-6), Do (7-8), Check (9), Act (10).</li>
  <li>Os 7 princípios são a base filosofica; os requisitos são a implementação prática.</li>
  <li>Mentalidade de risco substitui a antiga ação preventiva.</li>
  <li>Informação documentada substitui documentos + registros + procedimentos obrigatórios.</li>
  <li>A alta direção deve demonstrar comprometimento com ações concretas.</li>
  <li>A correção resolve o problema imediato; a ação corretiva elimina a causa.</li>
  <li>A auditoria interna e ferramenta de melhoria, não de púnicao.</li>
  <li>A análise crítica pela direção deve ter todas as entradas obrigatórias e gerar decisões e ações.</li>
</ul>

<div class="callout"><strong>Importante:</strong> Este curso ensinou a interpretar os requisitos. Para auditar, você precisara de um curso específico de auditor interno (ISO 19011). Para implantar, a prática e o melhor professor — aplique o que aprendeu, comece pelo básico e va evoluindo. A Anders Tech oferece consultoria para apoiar sua empresa na implantação e certificação.</div>

<h3>Obrigado!</h3>

<p>Esperamos que este curso tenha sido prático, objetivo e útil para sua carreira e sua empresa. A qualidade e uma jornada, não um destino. Bons estudos na prova final!</p>

<div class="template-box"><span>Download: Resumo executivo da ISO 9001:2015 (todas as cláusulas em 4 páginas)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ — Perguntas por módulo (5 por módulo = 30)
  // ═══════════════════════════════════════════════════════════════════

  // --- Quiz Módulo 1 ---
  const m1q = [
    {
      pergunta: 'Qual e o principal objetivo da ISO 9001:2015?',
      alternativas: ['Certificar produtos para exportação', 'Definir requisitos para um Sistema de Gestão da Qualidade', 'Estabelecer limites de tolerância para peças mecânicas', 'Regulamentar a segurança do trabalho na indústria'],
      correta: 1,
      explicação: 'A ISO 9001 define requisitos para um SGQ que permita a organização fornecer consistentemente produtos e serviços que atendam aos requisitos do cliente e regulamentares.'
    },
    {
      pergunta: 'Quantos princípios de gestão da qualidade fundamentam a ISO 9001:2015?',
      alternativas: ['5', '6', '7', '8'],
      correta: 2,
      explicação: 'São 7 princípios: Foco no cliente, Liderança, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisão baseada em evidência e Gestão de relacionamento.'
    },
    {
      pergunta: 'Qual estrutura padronizada a ISO 9001:2015 adota para fácilitar a integração com outras normas de gestão?',
      alternativas: ['Estrutura de 8 cláusulas', 'Anexo SL (Estrutura de Alto Nível)', 'Modelo EFQM', 'Ciclo DMAIC'],
      correta: 1,
      explicação: 'O Anexo SL define a Estrutura de Alto Nível (HLS) com 10 cláusulas, padronizando todas as normas de sistemas de gestão (ISO 9001, ISO 14001, ISO 45001, etc.).'
    },
    {
      pergunta: 'Qual das seguintes mudanças NÃO ocorreu na transição da ISO 9001:2008 para a 2015?',
      alternativas: ['Eliminação da obrigatoriedade do Manual da Qualidade', 'Introdução da mentalidade de risco', 'Eliminação da necessidade de auditoria interna', 'Adoção da Estrutura de Alto Nível com 10 cláusulas'],
      correta: 2,
      explicação: 'A auditoria interna contínua sendo obrigatória na versão 2015 (cláusula 9.2). O que mudou foi a eliminação do Manual da Qualidade obrigatório, a introdução da mentalidade de risco e a estrutura de 10 cláusulas.'
    },
    {
      pergunta: 'As cláusulas 1 a 3 da ISO 9001:2015 contem requisitos auditaveis?',
      alternativas: ['Sim, todas contem requisitos obrigatórios', 'Não, são cláusulas informativas', 'Apenas a cláusula 3 contem requisitos', 'Depende do porte da organização'],
      correta: 1,
      explicação: 'As cláusulas 1 (Escopo), 2 (Referencia normativa) e 3 (Termos e definições) são informativas. Os requisitos auditaveis estão nas cláusulas 4 a 10.'
    }
  ];

  for (const q of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod1}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // --- Quiz Módulo 2 ---
  const m2q = [
    {
      pergunta: 'O que a cláusula 4.1 da ISO 9001:2015 exige que a organização determine?',
      alternativas: ['Apenas os requisitos legais aplicáveis', 'As questões externas e internas pertinentes ao seu propósito e direção estratégica', 'O número mínimo de funcionários para o SGQ', 'A lista de todos os concorrentes do mercado'],
      correta: 1,
      explicação: 'A cláusula 4.1 exige que a organização determine questões externas e internas pertinentes para seu propósito, direção estratégica e que afetem o SGQ.'
    },
    {
      pergunta: 'Ao identificar partes interessadas (cláusula 4.2), a organização deve listar:',
      alternativas: ['Todas as partes interessadas existentes no mundo', 'Apenas clientes e fornecedores', 'As partes interessadas pertinentes ao SGQ e seus requisitos relevantes', 'Apenas as partes interessadas que reclamam formalmente'],
      correta: 2,
      explicação: 'A norma pede que sejam identificadas as partes interessadas PERTINENTES ao SGQ e seus requisitos RELEVANTES — não todas as partes existentes.'
    },
    {
      pergunta: 'Na versão 2015, quando um requisito da norma não se aplica, a organização deve:',
      alternativas: ['Ignorar completamente o requisito', 'Solicitar autorização do organismo certificador', 'Justificar a não aplicabilidade, que não pode afetar a conformidade do produto/serviço', 'Incluir o requisito mesmo assim, pois todos são obrigatórios'],
      correta: 2,
      explicação: 'Na versão 2015, não existem "exclusoes" como na 2008. A organização justifica a não aplicabilidade, desde que isso não afete a conformidade dos produtos/serviços.'
    },
    {
      pergunta: 'Qual e o papel da alta direção conforme a cláusula 5.1?',
      alternativas: ['Delegar toda a gestão da qualidade ao coordenador', 'Demonstrar liderança e comprometimento com o SGQ atraves de ações concretas', 'Apenas assinar a política da qualidade uma vez ao ano', 'Participar apenas das reuniões de auditoria externa'],
      correta: 1,
      explicação: 'A cláusula 5.1 exige que a alta direção demonstre liderança e comprometimento, responsabilizando-se pela eficácia do SGQ, alocando recursos, comúnicando importancia e engajando pessoas.'
    },
    {
      pergunta: 'A política da qualidade deve, entre outros requisitos:',
      alternativas: ['Ser idêntica para todas as empresas do mesmo setor', 'Ser secreta e acessível apenas a direção', 'Ser apropriada ao contexto, prover estrutura para objetivos e incluir comprometimento com melhoria contínua', 'Conter metas numéricas detalhadas para todos os indicadores'],
      correta: 2,
      explicação: 'A política deve ser apropriada ao propósito e contexto, prover estrutura para definir objetivos, incluir comprometimento com requisitos aplicáveis e melhoria contínua, e ser comunicada na organização.'
    }
  ];

  for (const q of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod2}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // --- Quiz Módulo 3 ---
  const m3q = [
    {
      pergunta: 'A cláusula 6.1 exige que a organização útilize qual métodologia formal de gestão de riscos?',
      alternativas: ['FMEA obrigatóriamente', 'ISO 31000 obrigatóriamente', 'Nenhuma específica — a norma pede mentalidade de risco, não métodologia formal', 'Análise Bow-Tie obrigatóriamente'],
      correta: 2,
      explicação: 'A norma NÃO exige métodologia formal de gestão de riscos. Ela pede que a organização considere riscos e oportunidades de forma proporcional a sua complexidade.'
    },
    {
      pergunta: 'Os objetivos da qualidade (cláusula 6.2) devem ser:',
      alternativas: ['Genericos e aplicáveis a qualquer empresa', 'Mensuraveis, coerentes com a política e ter plano de ação para alcanca-los', 'Definidos apenas pelo coordenador de qualidade', 'Revisados somente a cada 3 anos na recertificação'],
      correta: 1,
      explicação: 'Os objetivos devem ser mensuraveis, coerentes com a política, considerar requisitos aplicáveis, ser pertinentes para conformidade e satisfação, monitorados, comunicados e atualizados, com plano de ação definido.'
    },
    {
      pergunta: 'A cláusula 6.3 (Planejamento de mudanças) exige que mudanças no SGQ considerem:',
      alternativas: ['Apenas o custo financeiro da mudança', 'Proposito, consequências, integridade do SGQ, recursos e responsabilidades', 'Apenas a opinião do organismo certificador', 'Somente mudanças de documentação'],
      correta: 1,
      explicação: 'A cláusula 6.3 exige considerar o propósito e potenciais consequências da mudança, a integridade do SGQ, disponibilidade de recursos e alocação de responsabilidades.'
    },
    {
      pergunta: 'Qual dos seguintes e um exemplo de OPORTUNIDADE (não risco) na gestão de riscos do SGQ?',
      alternativas: ['Fornecedor entregar material fora de especificação', 'Novo mercado emergente buscando fornecedores qualificados', 'Máquina com manutenção atrasada', 'Operador sem treinamento adequado'],
      correta: 1,
      explicação: 'A gestão de riscos inclui oportunidades (efeitos positivos da incerteza). Um novo mercado buscando fornecedores e uma oportunidade que pode ser explorada. Os demais são riscos (efeitos negativos).'
    },
    {
      pergunta: 'Um objetivo da qualidade formulado como "Melhorar a qualidade" e inadequado porque:',
      alternativas: ['Não e possível melhorar a qualidade', 'Não e mensurável, não tem meta numérica nem prazo', 'A norma proibe objetivos relacionados a qualidade', 'Deveria ser "Maximizar a qualidade"'],
      correta: 1,
      explicação: 'Objetivos devem ser mensuraveis. "Melhorar a qualidade" não tem meta numérica nem prazo, sendo impossível avaliar se foi alcancado. O correto seria algo como "Reduzir o índice de refugo de 4% para 2,5% até dezembro".'
    }
  ];

  for (const q of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod3}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // --- Quiz Módulo 4 ---
  const m4q = [
    {
      pergunta: 'O que a cláusula 7.1.5 exige sobre instrumentos de medição útilizados para verificar conformidade de produtos?',
      alternativas: ['Devem ser novos e importados', 'Devem ser calibrados ou verificados em intervalos específicados, contra padrões rastreaveis', 'Basta que funcionem corretamente no momento do uso', 'Apenas instrumentos digitais são aceitos'],
      correta: 1,
      explicação: 'A cláusula 7.1.5 exige que instrumentos usados para verificar conformidade sejam calibrados/verificados periodicamente contra padrões rastreaveis, identificados e protegidos.'
    },
    {
      pergunta: 'Na ISO 9001:2015, "manter informação documentada" equivale ao antigo conceito de:',
      alternativas: ['Registro (evidência de atividade realizada)', 'Documento (procedimento, instrução de trabalho que e atualizado)', 'Backup de dados em nuvem', 'Manual da qualidade'],
      correta: 1,
      explicação: '"Manter" informação documentada equivale ao antigo "documento" (algo que se atualiza). "Reter" equivale ao antigo "registro" (evidência de que algo foi feito).'
    },
    {
      pergunta: 'A análise crítica de requisitos (cláusula 8.2.3) deve ser realizada:',
      alternativas: ['Somente após a entrega do produto', 'Antes de se comprometer a fornecer o produto/serviço', 'Apenas para clientes internacionais', 'Somente quando o cliente solicitar formalmente'],
      correta: 1,
      explicação: 'A análise crítica de requisitos deve ser feita ANTES de a organização se comprometer a fornecer, para garantir que tem capacidade de atender todos os requisitos.'
    },
    {
      pergunta: 'O que são "processos especiais" no contexto da cláusula 8.5.1?',
      alternativas: ['Processos realizados pela direção', 'Processos cujo resultado não pode ser verificado por inspeção posterior', 'Processos que usam máquinas importadas', 'Processos que custam mais de R$ 100.000'],
      correta: 1,
      explicação: 'Processos especiais são aqueles cujo resultado não pode ser verificado por monitoramento/medição posterior (ex: solda, tratamento térmico, pintura). Eles precisam ser VALIDADOS e ter parâmetros controlados durante a execução.'
    },
    {
      pergunta: 'Ao identificar produto não conforme (cláusula 8.7), qual ação e INADEQUADA?',
      alternativas: ['Segregar o produto em área identificada', 'Retrabalhar para tornar conforme', 'Misturar com produtos conformes para diluir o problema', 'Obter autorização do cliente para aceitação sob concessão'],
      correta: 2,
      explicação: 'Misturar produto não conforme com conforme e totalmente inadequado e pode gerar entrega de produto defeituoso ao cliente. As ações corretas sao: segregar, retrabalhar, devolver ou obter concessão do cliente.'
    }
  ];

  for (const q of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod4}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // --- Quiz Módulo 5 ---
  const m5q = [
    {
      pergunta: 'Qual a diferença entre CORRECAO e ACAO CORRETIVA?',
      alternativas: ['São sinônimos — significam a mesma coisa', 'Correção resolve o problema imediato; ação corretiva elimina a causa para evitar recorrência', 'Correção e para problemas graves; ação corretiva e para problemas leves', 'Correção e feita pela produção; ação corretiva e feita pela direção'],
      correta: 1,
      explicação: 'Correção e a ação imediata para resolver o problema pontual (ex: retrabalhar a peça). Acao corretiva visa eliminar a causa raiz para que o problema não se repita.'
    },
    {
      pergunta: 'A auditoria interna (cláusula 9.2) exige que os auditores:',
      alternativas: ['Sejam funcionários de empresas externas', 'Tenham imparcialidade — não auditem seu próprio trabalho', 'Sejam engenheiros formados', 'Tenham pelo menos 10 anos de experiência'],
      correta: 1,
      explicação: 'A norma exige que os auditores sejam selecionados de forma a assegurar objetividade e imparcialidade do processo de auditoria. Ninguem audita seu próprio trabalho.'
    },
    {
      pergunta: 'Qual das seguintes NÃO e uma entrada obrigatória da análise crítica pela direção (cláusula 9.3)?',
      alternativas: ['Satisfação do cliente', 'Resultados de auditoria', 'Orçamento detalhado do próximo exercício fiscal', 'Desempenho de provedores externos'],
      correta: 2,
      explicação: 'O orçamento detalhado não e entrada obrigatória da análise crítica. As entradas obrigatórias incluem: situação de ações anteriores, mudanças no contexto, desempenho do SGQ (satisfação, objetivos, processos, NCs, auditorias, fornecedores), adequação de recursos, eficácia de ações para riscos e oportunidades de melhoria.'
    },
    {
      pergunta: 'A ferramenta "5 Porques" e útilizada para:',
      alternativas: ['Definir os 5 objetivos estratégicos da organização', 'Identificar a causa raiz de um problema perguntando "por que?" iterativamente', 'Avaliar 5 fornecedores simultaneamente', 'Planejar 5 auditorias por ano'],
      correta: 1,
      explicação: 'A técnica dos 5 Porques consiste em perguntar "por que?" repetidamente (tipicamente 5 vezes) até chegar a causa raiz de um problema, saindo do sintoma superficial para a causa fundamental.'
    },
    {
      pergunta: 'A ausência de reclamações formais de clientes pode ser interpretada como:',
      alternativas: ['Prova definitiva de satisfação total dos clientes', 'Indicativo que não precisa de pesquisa de satisfação', 'Não necessáriamente indica satisfação — a organização deve buscar ativamente a percepção do cliente', 'Razão suficiente para eliminar o indicador de satisfação'],
      correta: 2,
      explicação: 'A norma e clara: a organização deve MONITORAR a percepção do cliente. A ausência de reclamações não e evidência de satisfação — muitos clientes insatisfeitos simplesmente migram para concorrentes sem reclamar formalmente.'
    }
  ];

  for (const q of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod5}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // --- Quiz Módulo 6 ---
  const m6q = [
    {
      pergunta: 'Qual a válidade do certificado ISO 9001 e com que frequência ocorrem auditorias de manutenção?',
      alternativas: ['5 anos com auditoria a cada 2 anos', '3 anos com auditorias de manutenção anuais', '1 ano com renovação anual', '10 anos sem necessidade de auditorias intermediárias'],
      correta: 1,
      explicação: 'O certificado ISO 9001 tem válidade de 3 anos. Nesse período, há auditorias de manutenção (vigilancia) anuais. Após 3 anos, e necessária auditoria de recertificação.'
    },
    {
      pergunta: 'A auditoria de certificação e dividida em duas fases. A Fase 1 consiste em:',
      alternativas: ['Auditoria completa no chão de fábrica', 'Análise documental e verificação da prontidao do SGQ', 'Entrevista apenas com operadores', 'Teste de produto em laboratorio externo'],
      correta: 1,
      explicação: 'A Fase 1 e a análise documental, onde o auditor verifica se a documentação do SGQ esta adequada, se os requisitos estão enderecados e identifica áreas de preocupação para a Fase 2.'
    },
    {
      pergunta: 'Qual das seguintes e uma "armadilha" comum após a certificação?',
      alternativas: ['Manter as auditorias internas em dia', 'Atualizar os documentos quando os processos mudam', 'Coletar indicadores sem analisa-los e sem tomar ações', 'Envolver a direção nas análises críticas'],
      correta: 2,
      explicação: 'Coletar dados sem analisa-los e agir sobre eles e uma armadilha comum — vira burocracia pura sem gerar valor. Os indicadores existem para apoiar decisões e direcionar a melhoria.'
    },
    {
      pergunta: 'Qual organismo deve acreditar o certificador para que o certificado ISO 9001 tenha válidade no Brasil?',
      alternativas: ['ABNT', 'Inmetro (ou membro do IAF)', 'Ministerio da Indústria', 'ISO diretamente'],
      correta: 1,
      explicação: 'O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do International Accreditation Forum — IAF). Um certificado de organismo não acreditado não tem válidade de mercado.'
    },
    {
      pergunta: 'Antes da auditoria de certificação (Fase 2), a organização deve ter:',
      alternativas: ['Apenas a documentação pronta, sem necessidade de implementação', 'O SGQ implementado e funcionando por pelo menos alguns meses, com evidências de operação', 'Apenas o Manual da Qualidade atualizado', 'Somente treinamento dos operadores concluido'],
      correta: 1,
      explicação: 'O SGQ deve estar implementado e gerando evidências de operação (registros, indicadores, auditorias internas, análise crítica) por pelo menos 3 meses antes da Fase 2. O auditor verifica implementação e eficácia, não apenas documentação.'
    }
  ];

  for (const q of m6q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${mod6}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, false)`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ FINAL — 30 questões (is_final = true)
  // ═══════════════════════════════════════════════════════════════════
  const finalQuiz = [
    {
      pergunta: 'A ISO 9001:2015 e uma norma que define requisitos para:',
      alternativas: ['Sistemas de Gestão Ambiental', 'Sistemas de Gestão da Qualidade', 'Sistemas de Gestão de Saude e Seguranca', 'Sistemas de Gestão de Seguranca da Informação'],
      correta: 1,
      explicação: 'A ISO 9001 define requisitos para Sistemas de Gestão da Qualidade. ISO 14001 e ambiental, ISO 45001 e saude/seguranca, ISO 27001 e segurança da informação.'
    },
    {
      pergunta: 'Qual dos seguintes NÃO e um dos 7 princípios de gestão da qualidade?',
      alternativas: ['Foco no cliente', 'Minimização de custos', 'Melhoria', 'Tomada de decisão baseada em evidência'],
      correta: 1,
      explicação: 'Os 7 princípios sao: Foco no cliente, Liderança, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisão baseada em evidência e Gestão de relacionamento. "Minimização de custos" não e um princípio.'
    },
    {
      pergunta: 'Na estrutura da ISO 9001:2015, a fase "Check" (Verificar) do ciclo PDCA corresponde a qual cláusula?',
      alternativas: ['Cláusula 6', 'Cláusula 8', 'Cláusula 9', 'Cláusula 10'],
      correta: 2,
      explicação: 'Check = Cláusula 9 (Avaliação de desempenho). Plan = Cláusulas 4-6, Do = Cláusulas 7-8, Act = Cláusula 10.'
    },
    {
      pergunta: 'A principal mudança conceitual da versão 2008 para 2015 foi:',
      alternativas: ['Obrigatoriedade de certificação para todas as empresas', 'Introdução da mentalidade de risco em substituição a ação preventiva', 'Exigência de 20 procedimentos documentados obrigatórios', 'Eliminação da necessidade de indicadores'],
      correta: 1,
      explicação: 'A mentalidade de risco (cláusula 6.1) substituiu a ação preventiva da versão 2008, permeando toda a norma com a consideração de riscos e oportunidades nas decisões.'
    },
    {
      pergunta: 'A análise de contexto (cláusula 4.1) deve considerar:',
      alternativas: ['Apenas fatores externos do mercado', 'Apenas fatores internos da organização', 'Fatores externos e internos pertinentes', 'Apenas fatores financeiros'],
      correta: 2,
      explicação: 'A cláusula 4.1 exige que a organização determine questões externas (mercado, legislação, tecnologia) e internas (cultura, recursos, competências) pertinentes ao SGQ.'
    },
    {
      pergunta: 'Qual ferramenta e mais comumente útilizada por PMEs para atender a cláusula 4.1?',
      alternativas: ['Balanced Scorecard', 'Análise SWOT', 'Six Sigma DMAIC', 'Diagrama de Gantt'],
      correta: 1,
      explicação: 'A análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças) e a ferramenta mais comum e prática para PMEs analisarem seu contexto interno e externo.'
    },
    {
      pergunta: 'A palavra-chave na cláusula 4.2 sobre partes interessadas e:',
      alternativas: ['Todas', 'Pertinentes', 'Prioritarias', 'Financeiras'],
      correta: 1,
      explicação: 'A norma pede que sejam identificadas as partes interessadas "pertinentes" ao SGQ — não todas as existentes, mas aquelas que efetivamente impactam ou são impactadas pelo SGQ.'
    },
    {
      pergunta: 'O escopo do SGQ (cláusula 4.3) deve declarar:',
      alternativas: ['Apenas o nome da empresa', 'Os tipos de produtos e serviços cobertos, com justificativa para não aplicabilidades', 'O faturamento anual da empresa', 'A lista completa de funcionários'],
      correta: 1,
      explicação: 'O escopo deve declarar os tipos de produtos/serviços cobertos pelo SGQ e justificar qualquer requisito da norma considerado não aplicável.'
    },
    {
      pergunta: 'Na versão 2015, a figura do Representante da Direção (RD):',
      alternativas: ['Continua obrigatória como na versão 2008', 'Deixou de ser obrigatória — a responsabilidade pelo SGQ e da alta direção', 'Foi substituida por um comite externo obrigatório', 'Passou a ser exigida em duplicidade'],
      correta: 1,
      explicação: 'A versão 2015 eliminou a obrigatoriedade do RD para que a responsabilidade pelo SGQ seja da alta direção como um todo, não delegada a uma única pessoa.'
    },
    {
      pergunta: 'A política da qualidade deve ser:',
      alternativas: ['Idêntica para todas as empresas do mesmo setor', 'Genérica para se aplicar a qualquer situação', 'Apropriada ao contexto e propósito da organização, comunicada e entendida', 'Confidencial e acessível apenas a direção e auditores'],
      correta: 2,
      explicação: 'A política deve ser apropriada ao contexto, prover estrutura para objetivos, incluir comprometimentos obrigatórios, ser comunicada e entendida na organização e disponível para partes interessadas.'
    },
    {
      pergunta: 'A gestão de riscos na ISO 9001:2015 exige:',
      alternativas: ['Uso obrigatório de FMEA em todos os processos', 'Contratação de especialista externo em riscos', 'Considerar riscos e oportunidades de forma proporcional a complexidade da organização', 'Certificação ISO 31000 como pre-requisito'],
      correta: 2,
      explicação: 'A norma não exige métodologia formal específica. Pede que a organização considere riscos e oportunidades de forma proporcional. Uma PME pode usar uma planilha simples; uma grande indústria pode usar FMEA ou outras métodologias.'
    },
    {
      pergunta: 'Para cada objetivo da qualidade (cláusula 6.2), a organização deve determinar:',
      alternativas: ['Apenas a meta numérica', 'O que sera feito, recursos, responsável, prazo e como avaliar resultados', 'Apenas o indicador de monitoramento', 'Apenas a data de início'],
      correta: 1,
      explicação: 'A cláusula 6.2 exige plano de ação completo: o que sera feito, recursos necessários, responsável, prazo e como os resultados serao avaliados.'
    },
    {
      pergunta: 'A cláusula 7.1.6 (Conhecimento organizacional) foi introduzida para tratar do problema de:',
      alternativas: ['Excesso de documentação', 'Conhecimento crítico que esta "na cabeca das pessoas" e pode ser perdido', 'Sigilo indústrial', 'Proteção de dados pessoais (LGPD)'],
      correta: 1,
      explicação: 'A cláusula 7.1.6 trata da gestão do conhecimento organizacional — garantir que o conhecimento necessário seja identificado, mantido e disponibilizado, evitando perda quando pessoas-chave saem da organização.'
    },
    {
      pergunta: 'Na ISO 9001:2015, o termo "informação documentada" unificou os antigos conceitos de:',
      alternativas: ['Apenas "documento" e "manual"', 'Apenas "registro" e "formulario"', '"Documento", "registro" e "procedimento documentado"', '"Política" e "objetivo"'],
      correta: 2,
      explicação: 'O termo "informação documentada" unificou três conceitos da versão 2008: "documento" (procedimento, instrução), "registro" (evidência) e "procedimento documentado" (os 6 obrigatórios).'
    },
    {
      pergunta: '"Manter informação documentada" na ISO 9001:2015 equivale ao antigo conceito de:',
      alternativas: ['Registro', 'Documento (que se atualiza)', 'Backup', 'Formulario em branco'],
      correta: 1,
      explicação: '"Manter" = documento (algo atualizado, como procedimento ou política). "Reter" = registro (evidência de atividade realizada, como relatório de inspeção).'
    },
    {
      pergunta: 'A análise crítica de requisitos do cliente (cláusula 8.2.3) deve ser realizada:',
      alternativas: ['Depois da entrega do produto', 'Antes de a organização se comprometer a fornecer', 'Apenas quando o cliente reclama', 'Somente para pedidos acima de R$ 10.000'],
      correta: 1,
      explicação: 'A análise crítica deve ser feita ANTES de aceitar o pedido/contrato, para garantir que a organização tem capacidade de atender todos os requisitos específicados.'
    },
    {
      pergunta: 'A calibração de instrumentos (cláusula 7.1.5) e necessária quando:',
      alternativas: ['O instrumento e novo', 'O monitoramento/medição e usado para verificar conformidade de produtos/serviços', 'O instrumento custou mais de R$ 1.000', 'O cliente solicita específicamente'],
      correta: 1,
      explicação: 'A calibração e necessária quando o instrumento e usado para verificar conformidade de produtos/serviços com requisitos. Não depende do custo do instrumento, mas do seu uso para inspeção/controle.'
    },
    {
      pergunta: 'Um "processo especial" e aquele cujo resultado:',
      alternativas: ['Custa mais que os demais processos', 'Não pode ser verificado por inspeção posterior — requer válidação', 'E destinado a clientes VIP', 'Envolve mais de 10 funcionários'],
      correta: 1,
      explicação: 'Processos especiais (ex: solda, tratamento térmico, pintura) produzem resultados que não podem ser verificados por inspeção posterior sem destruição. Por isso, devem ser VALIDADOS e controlados durante a execução.'
    },
    {
      pergunta: 'O controle de fornecedores (cláusula 8.4) deve ser proporcional a:',
      alternativas: ['Ao faturamento do fornecedor', 'Ao impacto do produto/serviço fornecido na conformidade do produto final', 'A distancia geografica do fornecedor', 'A idade do relacionamento comercial'],
      correta: 1,
      explicação: 'O nível de controle deve ser proporcional ao impacto que o produto/serviço do fornecedor tem na conformidade do produto final. Um fornecedor de materia-prima crítica requer mais controle que um fornecedor de material de escritório.'
    },
    {
      pergunta: 'Ao identificar produto não conforme (cláusula 8.7), a primeira ação deve ser:',
      alternativas: ['Destruir o produto imediatamente', 'Identificar e segregar para prevenir uso ou entrega não intencional', 'Enviar ao cliente com desconto', 'Registrar e continuar a produção normalmente'],
      correta: 1,
      explicação: 'A primeira ação e identificar e segregar (separar) o produto não conforme para evitar que seja usado ou entregue por engano. Depois se decide a disposição (retrabalho, refugo, concessão).'
    },
    {
      pergunta: 'A satisfação do cliente (cláusula 9.1.2) deve ser monitorada:',
      alternativas: ['Apenas quando há reclamações formais', 'Ativamente, usando métodos definidos pela organização', 'Apenas a cada 3 anos na recertificação', 'Somente por pesquisa impressa enviada pelo correio'],
      correta: 1,
      explicação: 'A organização deve determinar métodos para obter, monitorar e analisar a percepção dos clientes. A norma não específica qual método — pode ser pesquisa, entrevista, análise de indicadores, etc. Mas deve ser ativo, não passivo.'
    },
    {
      pergunta: 'Em uma auditoria interna (cláusula 9.2), o gerente de produção pode auditar:',
      alternativas: ['O processo de produção que ele gerencia', 'Qualquer processo, exceto o que ele gerencia', 'Apenas processos de apoio', 'Apenas a documentação, não o processo'],
      correta: 1,
      explicação: 'A norma exige imparcialidade — o auditor não pode auditar seu próprio trabalho. O gerente de produção pode auditar outros processos (compras, RH, qualidade), mas não a produção.'
    },
    {
      pergunta: 'As saídas da análise crítica pela direção (cláusula 9.3.3) devem incluir:',
      alternativas: ['Apenas um relatório informativo sem ações', 'Decisões e ações sobre oportunidades de melhoria, mudanças no SGQ e necessidade de recursos', 'Apenas a data da próxima reunião', 'Apenas a aprovação do orçamento anual'],
      correta: 1,
      explicação: 'As saídas devem ser decisões e ações concretas sobre: oportunidades de melhoria, necessidade de mudanças no SGQ e necessidade de recursos. Não pode ser apenas "manter monitoramento".'
    },
    {
      pergunta: 'A diferença fundamental entre correção e ação corretiva e:',
      alternativas: ['Correção e mais cara, ação corretiva e mais barata', 'Correção e para problemas grandes, ação corretiva e para problemas pequenos', 'Correção trata o efeito imediato, ação corretiva elimina a causa raiz', 'Não há diferença — são sinônimos'],
      correta: 2,
      explicação: 'Correção = ação imediata para resolver o problema pontual (retrabalhar a peça). Acao corretiva = ação para eliminar a causa raiz e prevenir recorrência (recalibrar máquina, retreinar operador).'
    },
    {
      pergunta: 'A cláusula 10.3 (Melhoria contínua) pede que a organização:',
      alternativas: ['Apenas corrija problemas quando surgirem', 'Melhore continuamente a adequação, suficiência e eficácia do SGQ', 'Mude todos os processos a cada 6 meses', 'Contrate consultoria externa permanente'],
      correta: 1,
      explicação: 'A melhoria contínua vai alem de corrigir problemas. A organização deve buscar ativamente oportunidades de melhoria usando resultados de análises, auditorias e análises críticas.'
    },
    {
      pergunta: 'O certificado ISO 9001 tem válidade de:',
      alternativas: ['1 ano', '2 anos', '3 anos', '5 anos'],
      correta: 2,
      explicação: 'O certificado ISO 9001 tem válidade de 3 anos, com auditorias de manutenção (vigilancia) anuais. Após 3 anos, e necessária auditoria de recertificação.'
    },
    {
      pergunta: 'Numa auditoria de certificação, uma não conformidade maior significa que:',
      alternativas: ['A certificação e concedida com ressalvas', 'A certificação NÃO e concedida até a resolução da NC', 'A empresa deve pagar uma multa', 'O certificado e emitido mas com válidade reduzida'],
      correta: 1,
      explicação: 'Uma NC maior (falha sistemática ou ausência de requisito) impede a concessão da certificação. A empresa tem prazo (geralmente 90 dias) para resolver, e o auditor verifica a resolução antes de conceder o certificado.'
    },
    {
      pergunta: 'Qual das seguintes cláusulas NÃO contem requisitos auditaveis?',
      alternativas: ['Cláusula 4 (Contexto)', 'Cláusula 7 (Apoio)', 'Cláusula 3 (Termos e definições)', 'Cláusula 10 (Melhoria)'],
      correta: 2,
      explicação: 'A cláusula 3 (Termos e definições) e informativa — remete a ISO 9000:2015. As cláusulas 4 a 10 contem requisitos auditaveis.'
    },
    {
      pergunta: 'A abordagem de processo (cláusula 4.4) exige que para cada processo sejam determinados:',
      alternativas: ['Apenas o nome e o responsável', 'Entradas, saídas, sequência, critérios, recursos, responsabilidades e riscos', 'Apenas o fluxograma', 'Apenas o indicador de resultado'],
      correta: 1,
      explicação: 'A cláusula 4.4 exige determinação completa: entradas, saídas, sequência e interação, critérios e métodos, recursos, responsabilidades e autoridades, riscos e oportunidades, e ações de melhoria.'
    },
    {
      pergunta: 'Ao planejar uma mudança no SGQ (cláusula 6.3), a organização deve considerar, EXCETO:',
      alternativas: ['O propósito da mudança e suas consequências', 'A integridade do SGQ', 'A opinião dos concorrentes sobre a mudança', 'A disponibilidade de recursos e a realocação de responsabilidades'],
      correta: 2,
      explicação: 'A cláusula 6.3 exige considerar propósito e consequências, integridade do SGQ, disponibilidade de recursos e realocação de responsabilidades. A opinião de concorrentes não faz parte dos requisitos.'
    }
  ];

  for (const q of finalQuiz) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicação, is_final)
      VALUES (${null}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicação}, true)`;
  }

  console.log(`Curso 1 seed completo: courseId=${courseId}, 6 módulos, 24 aulas, 30 quiz de módulo + 30 quiz final`);
  return courseId;
}
