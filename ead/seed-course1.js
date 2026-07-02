// ═══════════════════════════════════════════════════════════════════════════
// seed-course1.js — ISO 9001:2015 Interpretação dos Requisitos
// Curso completo: 6 módulos, 24 aulas, 30 quiz de módulo + 30 quiz final
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
      'ISO 9001:2015 — Interpretação dos Requisitos',
      'Domine cada cláusula da norma e saiba aplicar na prática da sua empresa',
      'Curso completo de 12 horas cobrindo todos os requisitos da ISO 9001:2015 com exemplos reais da indústria metalúrgica, alimentícia, construção civil e agronegócio. Aprenda a interpretar, implementar e manter um Sistema de Gestão da Qualidade robusto e pronto para certificação.',
      '12h',
      397.00,
      597.00,
      'Gestores, coordenadores de qualidade, analistas, empresários',
      'Nenhum',
      'Compreender todos os requisitos da ISO 9001:2015 e saber como aplicá-los na prática da sua empresa, com exemplos reais da indústria.',
      true,
      1
    )
    RETURNING id
  `;
  const courseId = courseRows[0].id;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 1 — Fundamentos da ISO 9001 (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod1Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Fundamentos da ISO 9001', 'O que é a ISO 9001, os 7 princípios, estrutura de 10 cláusulas e diferenças entre as versões 2008 e 2015.', 1)
    RETURNING id
  `;
  const mod1 = mod1Rows[0].id;

  // --- Aula 1.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'o-que-e-iso-9001', 'O que é a ISO 9001 e por que ela importa', '30 min', 1, ${`
<h2>O que é a ISO 9001 e por que ela importa</h2>

<p>A ISO 9001 e a norma internacional mais utilizada no mundo para Sistemas de Gestão da Qualidade (SGQ). Publicada pela International Organization for Standardization (ISO), ela define requisitos que qualquer organização — independente do porte, setor ou localização — pode adotar para garantir que seus produtos e serviços atendam consistentemente aos requisitos dos clientes e requisitos regulamentares aplicáveis.</p>

<p>Até 2024, mais de 1,1 milhão de certificados ISO 9001 estavam ativos em 170 países. No Brasil, segundo dados do Inmetro/ABNT, há mais de 20.000 certificados válidos, com forte concentração na indústria metalmecânica, alimentícia e de construção civil.</p>

<div class="kpi-grid"><div class="kpi-card"><div class="kpi-value">1,1M</div><div class="kpi-label">Certificados ativos no mundo</div></div><div class="kpi-card"><div class="kpi-value">170</div><div class="kpi-label">Países com certificação</div></div><div class="kpi-card"><div class="kpi-value">20.000+</div><div class="kpi-label">Certificados no Brasil</div></div><div class="kpi-card"><div class="kpi-value">1987</div><div class="kpi-label">Primeira publicação</div></div></div>

<h3>Uma breve história</h3>

<p>A primeira versão da ISO 9001 foi publicada em 1987, baseada em normas militares britanicas (BS 5750). Desde então, passou por revisões em 1994, 2000, 2008 e a versão atual de 2015. Cada revisão tornou a norma mais orientada a resultados e menos burocrática.</p>

<table>
  <tr><th>Versão</th><th>Foco principal</th><th>Mudança-chave</th></tr>
  <tr><td>1987</td><td>Conformidade de produto</td><td>Primeira publicação internacional</td></tr>
  <tr><td>1994</td><td>Ações preventivas</td><td>Ênfase em documentação</td></tr>
  <tr><td>2000</td><td>Abordagem de processos</td><td>Redução de documentação obrigatória</td></tr>
  <tr><td>2008</td><td>Compatibilidade com ISO 14001</td><td>Ajustes de clareza</td></tr>
  <tr><td>2015</td><td>Mentalidade de risco e contexto</td><td>Estrutura de Alto Nível (Anexo SL)</td></tr>
</table>

<div class="diagram"><svg viewBox="0 0 400 270" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrpdca" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6" fill="#64748b"/></marker></defs><rect x="140" y="12" width="120" height="46" rx="10" fill="#2563eb" opacity="0.14" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="32" text-anchor="middle" font-size="13" fill="#2563eb" font-weight="bold">PLAN (Planejar)</text><text x="200" y="48" text-anchor="middle" font-size="9" fill="#0b1730">Cl. 4, 5, 6</text><rect x="276" y="112" width="110" height="46" rx="10" fill="#16a34a" opacity="0.14" stroke="#16a34a" stroke-width="1.5"/><text x="331" y="132" text-anchor="middle" font-size="13" fill="#16a34a" font-weight="bold">DO (Fazer)</text><text x="331" y="148" text-anchor="middle" font-size="9" fill="#0b1730">Cl. 7, 8</text><rect x="140" y="212" width="120" height="46" rx="10" fill="#eab308" opacity="0.14" stroke="#ca8a04" stroke-width="1.5"/><text x="200" y="232" text-anchor="middle" font-size="12" fill="#ca8a04" font-weight="bold">CHECK (Verificar)</text><text x="200" y="248" text-anchor="middle" font-size="9" fill="#0b1730">Cl. 9</text><rect x="14" y="112" width="110" height="46" rx="10" fill="#c5383c" opacity="0.14" stroke="#c5383c" stroke-width="1.5"/><text x="69" y="132" text-anchor="middle" font-size="13" fill="#c5383c" font-weight="bold">ACT (Agir)</text><text x="69" y="148" text-anchor="middle" font-size="9" fill="#0b1730">Cl. 10</text><path d="M268 45 Q330 58 330 104" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrpdca)"/><path d="M330 166 Q330 212 268 226" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrpdca)"/><path d="M132 226 Q70 212 70 166" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrpdca)"/><path d="M70 104 Q70 58 132 45" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#arrpdca)"/><text x="200" y="130" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Melhoria</text><text x="200" y="146" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Contínua</text></svg><figcaption>Ciclo PDCA — base do SGQ ISO 9001:2015</figcaption></div>

<h3>O que a ISO 9001 NÃO e</h3>

<p>Um equívoco comum: a ISO 9001 não é uma norma de produto. Ela não diz qual o teor de carbono do açonem a temperatura de pasteurização do leite. O que ela garante e que a organização tenha <strong>processos consistentes</strong> para planejar, executar, verificar e melhorar suas atividades. Em outras palavras, a norma cuida do <em>sistema</em>, não do <em>produto</em> diretamente.</p>

<div class="callout"><strong>Importante:</strong> A ISO 9001 e genérica por design. Isso significa que uma metalúrgica de 30 funcionários e uma multinacional de alimentos podem ambas ser certificadas — o nível de complexidade do SGQ é que muda.</div>

<h3>Por que buscar a certificação?</h3>

<ul>
  <li><strong>Requisito de mercado:</strong> muitas montadoras, redes de varejo e órgãos públicos exigem ISO 9001 de seus fornecedores. Na indústria automotiva brasileira, por exemplo, e praticamente impossível entrar na cadeia de suprimentos sem certificação.</li>
  <li><strong>Redução de custos da não-qualidade:</strong> retrabalho, refugo, devoluções e reclamações custam entre 5% e 25% do faturamento em empresas sem gestão estruturada. Um SGQ bem implementado reduz esses custos de forma mensurável.</li>
  <li><strong>Melhoria da gestão interna:</strong> processos claros, responsabilidades definidas, indicadores monitorados — benefícios que vão muito além do selo na parede.</li>
  <li><strong>Credibilidade:</strong> para clientes nacionais e internacionais, o certificado ISO 9001 é um sinal de comprometimento com a qualidade.</li>
</ul>

<div class="example"><strong>Exemplo prático:</strong> Uma metalúrgica em Caxias do Sul fabricava eixos para transmissões. O principal cliente (uma montadora) notificou que a partir do próximo contrato exigiria ISO 9001. A empresa tinha 8 meses para se certificar. O projeto envolveu mapear 14 processos, definir indicadores e treinar 45 colaboradores. Resultado: certificação obtida em 7 meses, redução de 32% no índice de refugo e abertura de mais 3 clientes no setor automotivo.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>Em 2019, a Tramontina — gigante gaucha de utensilios domesticos — renovou sua certificação ISO 9001 em 9 unidades fabris simultaneamente. A empresa credita ao SGQ a padronização que permite produzir mais de 22.000 itens com consistencia, exportando para mais de 120 países. O diretor industrial declarou: "Sem o sistema de gestão, seria impossivel manter a qualidade nessa escala."</p></div>

<h3>A estrutura básica do SGQ</h3>

<p>Um Sistema de Gestão da Qualidade baseado na ISO 9001 tem quatro pilares fundamentais:</p>

<ol>
  <li><strong>Contexto e liderança</strong> — entender onde a organização esta inserida e garantir comprometimento da alta direção.</li>
  <li><strong>Planejamento e suporte</strong> — definir objetivos, alocar recursos e gerenciar riscos.</li>
  <li><strong>Operação</strong> — executar os processos que entregam valor ao cliente.</li>
  <li><strong>Avaliação e melhoria</strong> — medir resultados, auditar e melhorar continuamente.</li>
</ol>

<p>Esses quatro pilares seguem a lógica do ciclo PDCA (Plan-Do-Check-Act), que é o motor de qualquer sistema de gestão. Ao longo deste curso, você vai ver como cada cláusula da norma se encaixa nesse ciclo.</p>

<h3>Quem pode ser certificado?</h3>

<p>Qualquer organização: indústria, comércio, serviços, governo, ONGs. Não há restrição de porte — desde um escritório de engenharia com 5 pessoas até uma usina siderúrgica com 3.000 colaboradores. A norma se adapta a complexidade da organização.</p>

<div class="callout"><strong>Importante:</strong> A certificação é voluntária. Nenhuma lei brasileira obriga uma empresa a ser ISO 9001. Porém, o mercado — especialmente em cadeias de fornecimento industriais — frequentemente a torna uma exigência contratual.</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A ISO 9001 cuida do sistema de gestão, não específica requisitos de produto." data-fb-nok="Incorreto. Reveja: a ISO 9001 define requisitos para o sistema de gestão, não para produtos específicos."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O que a ISO 9001 define?</div><button class="qi-option" data-key="a">Especificações técnicas de produto (composição, dimensões)</button><button class="qi-option" data-key="b">Leis trabalhistas aplicáveis à indústria</button><button class="qi-option" data-key="c">Requisitos para um Sistema de Gestão da Qualidade</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Checklist - Benefícios da ISO 9001 para apresentar à direção</span><a href="#">Baixar template</a></div>


<h3>Como estudar este curso: 6 técnicas que funcionam</h3>
<p>Antes de mergulhar no conteúdo, vale investir 3 minutos aqui. Estas técnicas têm base na ciência da aprendizagem e estão embutidas na estrutura deste curso — usá-las de propósito pode dobrar o quanto você retém.</p>
<div class="accordion-lesson">
  <div class="acc-item">
    <button class="acc-trigger">1. Recall ativo — teste-se antes de reler <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Ler de novo cria ilusão de domínio; <strong>tentar lembrar</strong> é o que fixa. Responda os quizzes de cada aula sem voltar ao texto, e só depois confira. Ao errar, leia a explicação — o erro corrigido vale mais que o acerto de primeira.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">2. Prática espaçada — revise em 24h e em 1 semana <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>A memória consolida com repetição espaçada, não com maratona. Terminou uma aula? Releia seus destaques <strong>no dia seguinte</strong> (5 min) e <strong>uma semana depois</strong> (5 min). Duas revisões curtas superam uma releitura longa.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">3. Técnica de Feynman — explique com suas palavras <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Se você não consegue explicar simples, ainda não entendeu. Ao final de cada aula, feche o material e explique o conceito em 3 frases, como se fosse para um colega novo. As caixas "Aplique na prática" ao longo das aulas existem exatamente para isso.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">4. Pomodoro — blocos de 25 minutos com pausa <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>As aulas deste curso duram 15-40 minutos de propósito: uma aula por bloco de foco. Estude 25 minutos sem celular por perto, pause 5, e volte. Duas aulas por dia com foco total rendem mais que uma tarde inteira dispersa.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">5. Aplicação imediata — leve para o seu trabalho <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Conhecimento aplicado em até 48h tem taxa de retenção muito maior. Baixe os templates das aulas e <strong>preencha com dados reais da sua empresa</strong> no mesmo dia. Um template preenchido vale por três releituras.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">6. Anotação ativa — escreva, não copie <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Copiar trechos não ensina. Anote <strong>perguntas</strong> que o conteúdo respondeu, decisões que você tomaria diferente e o que quer verificar na sua operação. Use as caixas de anotação do player — elas ficam salvas no seu navegador.</p></div>
  </div>
</div>
<div class="callout"><strong>Regra de ouro:</strong> consistência vence intensidade. 30 minutos por dia, todos os dias, leva você ao certificado em poucas semanas — e com o conteúdo de verdade na memória, não só na tela.</div>
`})`;

  // --- Aula 1.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'sete-principios-qualidade', 'Os 7 Princípios de Gestão da Qualidade', '30 min', 2, ${`
<h2>Os 7 Princípios de Gestão da Qualidade</h2>

<p>A ISO 9001:2015 e construída sobre sete princípios de gestão da qualidade. Eles não são requisitos auditáveis diretamente, mas formam a base filosofica de toda a norma. Entender esses princípios é fundamental para interpretar os requisitos de forma inteligente — e não apenas "cumprir tabela".</p>

<div class="diagram"><svg viewBox="0 0 420 330" xmlns="http://www.w3.org/2000/svg"><circle cx="210" cy="170" r="48" fill="#0b1730" opacity="0.08" stroke="#0b1730" stroke-width="1.5"/><text x="210" y="166" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">7 Princípios</text><text x="210" y="181" text-anchor="middle" font-size="9" fill="#0b1730">ISO 9001</text><line x1="210" y1="122" x2="210" y2="86" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="210" cy="52" r="34" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="210" y="50" text-anchor="middle" font-size="8.5" fill="#c5383c" font-weight="bold">Foco no</text><text x="210" y="61" text-anchor="middle" font-size="8" fill="#c5383c">Cliente</text><line x1="247.5" y1="140.1" x2="275.7" y2="117.6" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="302.3" cy="96.4" r="34" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="302.3" y="99.4" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Liderança</text><line x1="256.8" y1="180.7" x2="291.9" y2="188.7" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="325" cy="196.3" r="34" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="325" y="194.3" text-anchor="middle" font-size="8.5" fill="#16a34a" font-weight="bold">Engajamento</text><text x="325" y="205.3" text-anchor="middle" font-size="8" fill="#16a34a">de Pessoas</text><line x1="230.8" y1="213.2" x2="246.4" y2="245.7" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="261.2" cy="276.3" r="34" fill="#ca8a04" opacity="0.12" stroke="#ca8a04" stroke-width="1.5"/><text x="261.2" y="274.3" text-anchor="middle" font-size="8.5" fill="#ca8a04" font-weight="bold">Abordagem</text><text x="261.2" y="285.3" text-anchor="middle" font-size="8" fill="#ca8a04">de Processo</text><line x1="189.2" y1="213.2" x2="173.6" y2="245.7" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="158.8" cy="276.3" r="34" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="158.8" y="279.3" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Melhoria</text><line x1="163.2" y1="180.7" x2="128.1" y2="188.7" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="95" cy="196.3" r="34" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="95" y="194.3" text-anchor="middle" font-size="8.5" fill="#c5383c" font-weight="bold">Decisão por</text><text x="95" y="205.3" text-anchor="middle" font-size="8" fill="#c5383c">Evidência</text><line x1="172.5" y1="140.1" x2="144.3" y2="117.6" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/><circle cx="117.7" cy="96.4" r="34" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="117.7" y="94.4" text-anchor="middle" font-size="8.5" fill="#16a34a" font-weight="bold">Gestão de</text><text x="117.7" y="105.4" text-anchor="middle" font-size="8" fill="#16a34a">Relacionamento</text></svg><figcaption>Os 7 Princípios de Gestão da Qualidade — base filosófica da ISO 9001:2015</figcaption></div>

<h3>1. Foco no cliente</h3>

<p>O propósito fundamental de qualquer organização e atender (e superar) as expectativas dos clientes. Isso vai muito além de "entregar o que o cliente pediu". Envolve entender necessidades não declaradas, antecipar tendências e medir a satisfação de forma sistemática.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma indústria de alimentos em Chapeco recebia pouquíssimas reclamações formais. A direção assumia que os clientes estavam satisfeitos. Ao implementar uma pesquisa estruturada, descobriu que 40% dos distribuidores tinham problemas com o prazo de entrega — mas nunca reclamavam formalmente, simplesmente migravam para concorrentes. O foco no cliente exige ir buscar a informação, não esperar ela chegar.</div>

<h3>2. Liderança</h3>

<p>Lideres em todos os níveis devem criar condições para que as pessoas se comprometam com os objetivos da qualidade. Isso significa que a alta direção não pode "delegar a qualidade para o RD" — ela precisa demonstrar comprometimento com ações concretas: participar de análises críticas, alocar recursos, comunicar a importância do SGQ.</p>

<div class="callout"><strong>Importante:</strong> Na versão 2015, a figura do "Representante da Direção" (RD) deixou de ser obrigatória. A intenção e que a responsabilidade pela qualidade seja da alta direção, não de uma única pessoa.</div>

<h3>3. Engajamento de pessoas</h3>

<p>Pessoas competentes, habilitadas e engajadas são essenciais. Não basta ter processos documentados se as pessoas não entendem seu papel, não tem treinamento adequado ou não se sentem parte do sistema.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma construtora em Curitiba tinha procedimentos detalhados para controle de concreto, mas os mestres de obra não participaram da elaboração e não viam valor nos formulários. O índice de preenchimento era de 30%. Após envolver os mestres na revisão dos formulários — simplificando e tornando relevantes para o dia a dia deles — o preenchimento subiu para 92% em dois meses.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A WEG, multinacional catarinense de motores elétricos, atribui ao principio de "engajamento de pessoas" boa parte do seu sucesso. A empresa mantém um programa onde operadores de chão de fabrica podem propor melhorias de processo e recebem reconhecimento financeiro pelas ideias implementadas. Em um único ano, mais de 3.000 sugestões foram implementadas, gerando economia estimada em R$ 15 milhoes. O engajamento real — não apenas treinamento formal — transforma qualidade em cultura.</p></div>

<h3>4. Abordagem de processo</h3>

<p>Resultados consistentes são alcancados de forma mais eficaz quando as atividades são entendidas e gerenciadas como processos inter-relacionados que funcionam como um sistema coerente. Isso significa:</p>

<ul>
  <li>Cada processo tem entradas, atividades, saídas e indicadores.</li>
  <li>Os processos tem donos (responsáveis) definidos.</li>
  <li>As interações entre processos são mapeadas (o que um processo entrega ao próximo).</li>
</ul>

<p>Na prática, isso se traduz no <strong>mapa de processos</strong> da organização — um dos primeiros documentos que um auditor pede para ver.</p>

<h3>5. Melhoria</h3>

<p>Organizações de sucesso tem um foco permanente em melhoria. Não se trata apenas de corrigir problemas (isso é o mínimo), mas de buscar ativamente oportunidades de fazer melhor, mais rápido, com menos desperdício.</p>

<p>A melhoria pode ser incremental (kaizen, pequenos ajustes diários) ou disruptiva (mudança de tecnologia, redesenho de processo). A ISO 9001 pede ambas.</p>

<h3>6. Tomada de decisão baseada em evidência</h3>

<p>Decisões baseadas em análise de dados e informações tem maior probabilidade de produzir resultados desejados. Isso não significa "burocratizar tudo com planilhas", mas sim garantir que decisões importantes sejam apoiadas por fatos, não por achismos.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma cooperativa agrícola em Toledo-PR decidia o volume de compra de insumos "pelo feeling" do gerente. Após implementar análise de dados históricos de safra e consumo, reduziu o estoque parado em 28% e o desperdício por vencimento em 45%.</div>

<h3>7. Gestão de relacionamento</h3>

<p>Uma organização não opera isolada. Fornecedores, parceiros, distribuidores e até órgãos reguladores impactam sua capacidade de entregar qualidade. Gerenciar esses relacionamentos de forma proativa — e não apenas reagir a problemas — é essencial.</p>

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

<h3>Aplicação por setor: como os princípios funcionam na prática</h3>

<div class="tabs">
  <div class="tab-btns">
    <button class="tab-btn active">Metalurgia</button>
    <button class="tab-btn">Alimentos</button>
    <button class="tab-btn">Construção</button>
  </div>
  <div class="tab-panel active">
    <p><strong>Foco no cliente:</strong> controle dimensional de peças conforme especificação do cliente, zerando devoluções por não conformidade geometrica.</p>
    <p><strong>Abordagem de processo:</strong> mapeamento da cadeia usinagem → tratamento termico → inspeção → expedição com indicadores em cada etapa.</p>
    <p><strong>Gestão de relacionamento:</strong> qualificação de fornecedores de aço, ensaios periodicos de materia-prima para garantir composição certificada.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Foco no cliente:</strong> rastreabilidade de lote garante recall eficiente e fortalece confiança do varejista na cadeia de fornecimento.</p>
    <p><strong>Tomada de decisão por evidência:</strong> análise de dados de validade, temperatura de armazenamento e índice de devoluções orientam produção e logística.</p>
    <p><strong>Melhoria:</strong> kaizen aplicado a linha de embalagem reduziu perdas por vazamento em 60% em uma fabrica de sucos no Parana.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Engajamento de pessoas:</strong> mestres de obra envolvidos na criação de instruções de trabalho aumentam adesão aos procedimentos de segurança e qualidade.</p>
    <p><strong>Liderança:</strong> gerente de obra lidera reuniões diárias de qualidade, não delega tudo ao RD.</p>
    <p><strong>Gestão de relacionamento:</strong> subcontratados avaliados por critérios de qualidade — não apenas preco — antes de cada contratação.</p>
  </div>
</div>

<h3>Autoavaliação: quantos princípios sua organização já pratica?</h3>

<ul class="checklist">
  <li><span class="ck-box"></span>Medimos a satisfação dos clientes de forma sistematica (não apenas esperamos reclamações)</li>
  <li><span class="ck-box"></span>A alta direção participa ativamente de reuniões de qualidade (não delega tudo ao RD)</li>
  <li><span class="ck-box"></span>Os colaboradores entendem como seu trabalho afeta a qualidade do produto final</li>
  <li><span class="ck-box"></span>Nossos processos tem entradas, saídas e indicadores definidos</li>
  <li><span class="ck-box"></span>Buscamos ativamente oportunidades de melhoria (não só corrigimos problemas)</li>
  <li><span class="ck-box"></span>Decisões importantes são baseadas em dados, não em opinião</li>
  <li><span class="ck-box"></span>Avaliamos e desenvolvemos fornecedores de forma proativa</li>
</ul>

<div class="callout"><strong>Importante:</strong> Auditores não auditam "princípios" diretamente. Porém, se você entender os princípios, vai interpretar os requisitos com muito mais profundidade. Um auditor experiente percebe rapidamente se a organização realmente internalizou esses conceitos ou se esta apenas "jogando papel".</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A versão 2015 distribuiu a responsabilidade pela qualidade para a alta direção." data-fb-nok="Incorreto. Reveja o principio de Liderança: na versão 2015, a responsabilidade e da alta direção, não de uma única pessoa."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Na ISO 9001:2015, o principio de Liderança implica que:</div><button class="qi-option" data-key="a">O Representante da Direção (RD) e o único responsável pelo SGQ</button><button class="qi-option" data-key="b">A alta direção deve demonstrar comprometimento direto com o SGQ</button><button class="qi-option" data-key="c">Apenas gerentes de qualidade precisam conhecer a política</button><div class="qi-feedback"></div></div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Princípios na teoria</h4><ul><li>Política da qualidade na parede, ninguém le</li><li>Treinamento obrigatório sem contexto prático</li><li>Indicadores que ninguém analisa</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Princípios na prática</h4><ul><li>Decisões do dia a dia refletem a política</li><li>Pessoas entendem seu papel no SGQ</li><li>Dados orientam ações de melhoria reais</li></ul></div></div>

<div class="template-box"><span>Download: Quadro-resumo dos 7 princípios com aplicação prática</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'estrutura-10-clausulas', 'Estrutura de 10 Cláusulas (Anexo SL)', '30 min', 3, ${`
<h2>Estrutura de 10 Cláusulas e o Anexo SL</h2>

<p>A partir da versão 2015, a ISO 9001 adotou a chamada <strong>Estrutura de Alto Nível</strong> (High Level Structure — HLS), definida pelo Anexo SL da ISO. Essa estrutura padroniza todas as normas de sistemas de gestão (ISO 9001, ISO 14001, ISO 45001, etc.) em 10 cláusulas, facilitando a integração entre elas.</p>

<h3>As 10 cláusulas</h3>

<ol>
  <li><strong>Escopo</strong> — Define o que a norma cobre.</li>
  <li><strong>Referência normativa</strong> — Documentos referenciados (ISO 9000:2015 - Fundamentos e vocabulário).</li>
  <li><strong>Termos e definições</strong> — Remete a ISO 9000:2015.</li>
  <li><strong>Contexto da organização</strong> — Entender o ambiente interno e externo, partes interessadas, escopo do SGQ e processos.</li>
  <li><strong>Liderança</strong> — Comprometimento da alta direção, política da qualidade e responsabilidades.</li>
  <li><strong>Planejamento</strong> — Riscos e oportunidades, objetivos da qualidade e planejamento de mudanças.</li>
  <li><strong>Apoio</strong> — Recursos, competência, conscientização, comunicação e informação documentada.</li>
  <li><strong>Operação</strong> — Planejamento e controle operacional, requisitos de produtos/serviços, projeto, fornecedores, produção e liberação.</li>
  <li><strong>Avaliação de desempenho</strong> — Monitoramento, auditoria interna e análise crítica pela direção.</li>
  <li><strong>Melhoria</strong> — Não conformidade, ação corretiva e melhoria contínua.</li>
</ol>

<div class="callout"><strong>Importante:</strong> As cláusulas 1 a 3 são informativas (não contem requisitos auditáveis). Os requisitos que você precisa implementar estão nas cláusulas 4 a 10.</div>

<div class="diagram"><svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="390" height="270" rx="10" fill="none" stroke="#0b1730" stroke-width="1" stroke-dasharray="4 2"/><text x="200" y="25" text-anchor="middle" font-size="12" fill="#0b1730" font-weight="bold">Estrutura de 10 Cláusulas — Anexo SL</text><rect x="20" y="40" width="105" height="22" rx="4" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="0.5"/><text x="72" y="55" text-anchor="middle" font-size="8" fill="#0b1730">1. Escopo</text><rect x="135" y="40" width="120" height="22" rx="4" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="0.5"/><text x="195" y="55" text-anchor="middle" font-size="8" fill="#0b1730">2. Ref. normativa</text><rect x="265" y="40" width="120" height="22" rx="4" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="0.5"/><text x="325" y="55" text-anchor="middle" font-size="8" fill="#0b1730">3. Termos/definições</text><text x="200" y="78" text-anchor="middle" font-size="8" fill="#0b1730" font-style="italic">Cláusulas informativas (sem requisitos auditáveis)</text><line x1="20" y1="85" x2="380" y2="85" stroke="#0b1730" stroke-width="0.5" stroke-dasharray="3 2"/><rect x="20" y="95" width="115" height="35" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="77" y="112" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">4. Contexto</text><text x="77" y="124" text-anchor="middle" font-size="8" fill="#2563eb">PLAN</text><rect x="145" y="95" width="100" height="35" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="195" y="112" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">5. Liderança</text><text x="195" y="124" text-anchor="middle" font-size="8" fill="#2563eb">PLAN</text><rect x="255" y="95" width="125" height="35" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="317" y="112" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">6. Planejamento</text><text x="317" y="124" text-anchor="middle" font-size="8" fill="#2563eb">PLAN</text><rect x="20" y="145" width="170" height="35" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="105" y="162" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">7. Apoio (Recursos)</text><text x="105" y="174" text-anchor="middle" font-size="8" fill="#16a34a">DO</text><rect x="200" y="145" width="180" height="35" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="290" y="162" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">8. Operação</text><text x="290" y="174" text-anchor="middle" font-size="8" fill="#16a34a">DO</text><rect x="20" y="195" width="170" height="35" rx="6" fill="#eab308" opacity="0.12" stroke="#eab308" stroke-width="1.5"/><text x="105" y="212" text-anchor="middle" font-size="9" fill="#eab308" font-weight="bold">9. Avaliação desempenho</text><text x="105" y="224" text-anchor="middle" font-size="8" fill="#eab308">CHECK</text><rect x="200" y="195" width="180" height="35" rx="6" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="290" y="212" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">10. Melhoria</text><text x="290" y="224" text-anchor="middle" font-size="8" fill="#c5383c">ACT</text><text x="200" y="258" text-anchor="middle" font-size="9" fill="#0b1730" font-style="italic">Cláusulas 4-10: requisitos auditáveis</text></svg><figcaption>Mapa das 10 cláusulas da ISO 9001:2015 organizadas pelo ciclo PDCA</figcaption></div>

<h3>A lógica do PDCA nas cláusulas</h3>

<p>A norma organiza os requisitos seguindo o ciclo PDCA:</p>

<table>
  <tr><th>Fase PDCA</th><th>Cláusulas</th><th>O que acontece</th></tr>
  <tr><td>Plan (Planejar)</td><td>4, 5, 6</td><td>Entender o contexto, definir liderança e planejar ações</td></tr>
  <tr><td>Do (Fazer)</td><td>7, 8</td><td>Alocar recursos e executar os processos operacionais</td></tr>
  <tr><td>Check (Verificar)</td><td>9</td><td>Monitorar, medir, auditar e analisar criticamente</td></tr>
  <tr><td>Act (Agir)</td><td>10</td><td>Tratar não conformidades e melhorar continuamente</td></tr>
</table>

<p>Essa organização não é arbitraria — ela reflete a forma como qualquer sistema de gestão deveria funcionar. Primeiro você planeja (entende onde esta e para onde quer ir), depois executa, depois verifica se deu certo e então ajusta.</p>

<h3>Leitura cruzada entre cláusulas</h3>

<p>Um erro comum de quem esta comecando: ler cada cláusula isoladamente. Na prática, as cláusulas conversam entre si constantemente. Exemplos:</p>

<ul>
  <li>A cláusula 6.1 (riscos) alimenta a cláusula 8.1 (planejamento operacional).</li>
  <li>A cláusula 9.1.2 (satisfação do cliente) alimenta a cláusula 9.3 (análise crítica) e a cláusula 10.3 (melhoria contínua).</li>
  <li>A cláusula 7.5 (informação documentada) permeia TODAS as outras cláusulas.</li>
</ul>

<div class="example"><strong>Exemplo prático:</strong> Em uma auditoria numa fábrica de estruturas metalicas, o auditor encontrou que a empresa tinha uma ótima gestão de riscos documentada (cláusula 6.1), mas na operação (cláusula 8) não havia evidência de que esses riscos eram considerados no planejamento da produção. Resultado: não conformidade menor. A empresa tinha "papel" mas não tinha "conexao" entre as cláusulas.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A Gerdau, maior produtora de acos longos das Americas, foi uma das primeiras siderurgicas brasileiras a adotar a estrutura do Anexo SL para integrar ISO 9001, ISO 14001 e ISO 45001 em um sistema de gestão único. Com mais de 30 unidades, a padronização das 10 cláusulas permitiu que auditorias internas cruzadas entre plantas usassem o mesmo roteiro, reduzindo o tempo de auditoria em 40% e facilitando a transferencia de boas práticas entre unidades.</p></div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> A leitura cruzada entre cláusulas e o que separa um SGQ "de papel" de um SGQ que realmente funciona. Quando você ve que a cláusula 6.1 (riscos) alimenta a 8.1 (operação), que a 9.1.2 (satisfação) alimenta a 10.3 (melhoria), você entende que a norma é um sistema vivo, não uma lista de tarefas.</div></div>

<h3>Terminologia essencial</h3>

<p>Antes de avancar, alinhe o vocabulário. Termos que você vai encontrar em toda a norma:</p>

<ul>
  <li><strong>Informação documentada</strong> — substitui "procedimento documentado", "registro" e "manual da qualidade" da versão 2008. Agora é um termo único e flexível.</li>
  <li><strong>Parte interessada</strong> — qualquer pessoa ou organização que pode afetar, ser afetada ou se perceber afetada pelas decisões da empresa (clientes, funcionários, fornecedores, comunidade, órgãos reguladores).</li>
  <li><strong>Risco</strong> — efeito da incerteza. Pode ser positivo (oportunidade) ou negativo (ameaca).</li>
  <li><strong>Contexto</strong> — o ambiente em que a organização opera (fatores internos e externos).</li>
  <li><strong>Processo</strong> — conjunto de atividades inter-relacionadas que transformam entradas em saídas.</li>
</ul>

<div class="callout"><strong>Importante:</strong> Na versão 2015, a norma NÃO exige mais um Manual da Qualidade como documento obrigatório. Você pode ter um se quiser, mas não é exigido. O que a norma pede e que a informação documentada necessária esteja disponível e controlada.</div>

<h3>Benefícios da Estrutura de Alto Nível</h3>

<p>Se sua empresa já tem ou pretende ter ISO 14001 (meio ambiente) ou ISO 45001 (saúde e segurança), a estrutura comum facilita enormemente a integração. Os requisitos de contexto, liderança, planejamento, apoio, avaliação e melhoria são identicos em estrutura — muda apenas o foco técnico.</p>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! As cláusulas 1 a 3 são informativas e não contem requisitos auditáveis." data-fb-nok="Incorreto. As cláusulas 1, 2 e 3 são informativas. Os requisitos auditáveis comecam na cláusula 4."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Quais cláusulas da ISO 9001:2015 NÃO contem requisitos auditáveis?</div><button class="qi-option" data-key="a">Cláusulas 1, 2 e 3</button><button class="qi-option" data-key="b">Cláusulas 9 e 10</button><button class="qi-option" data-key="c">Cláusulas 4 e 5</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Mapa visual das 10 cláusulas x PDCA</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 1.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod1}, 'diferenças-2008-2015', 'Diferenças entre ISO 9001:2008 e 2015', '30 min', 4, ${`
<h2>Diferenças entre ISO 9001:2008 e ISO 9001:2015</h2>

<p>Se você trabalhou com a versão 2008, precisa entender o que mudou — e por que. Se você e novo na norma, esse comparativo ajuda a entender a evolução do pensamento de gestão da qualidade. A revisão de 2015 foi a mais significativa desde a de 2000.</p>

<h3>Mudanças estruturais</h3>

<table>
  <tr><th>Aspecto</th><th>ISO 9001:2008</th><th>ISO 9001:2015</th></tr>
  <tr><td>Estrutura</td><td>8 cláusulas</td><td>10 cláusulas (Anexo SL)</td></tr>
  <tr><td>Manual da qualidade</td><td>Obrigatório</td><td>Não obrigatório</td></tr>
  <tr><td>Representante da Direção</td><td>Obrigatório</td><td>Não obrigatório (responsabilidade distribuída)</td></tr>
  <tr><td>Procedimentos documentados</td><td>6 obrigatórios</td><td>Nenhum obrigatório específico (informação documentada conforme necessidade)</td></tr>
  <tr><td>Ação preventiva</td><td>Cláusula específica (8.5.3)</td><td>Substituida por gestão de riscos (6.1)</td></tr>
  <tr><td>Exclusões</td><td>Permitidas (cláusula 7)</td><td>Não há "exclusões" — usa-se "aplicabilidade" (cláusula 4.3)</td></tr>
</table>

<div class="diagram"><svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><text x="200" y="20" text-anchor="middle" font-size="12" fill="#0b1730" font-weight="bold">ISO 9001:2008 vs 2015 — Evolução Estrutural</text><rect x="20" y="35" width="160" height="150" rx="8" fill="#c5383c" opacity="0.06" stroke="#c5383c" stroke-width="1.5"/><text x="100" y="55" text-anchor="middle" font-size="11" fill="#c5383c" font-weight="bold">Versão 2008</text><text x="100" y="75" text-anchor="middle" font-size="9" fill="#0b1730">8 cláusulas</text><text x="100" y="90" text-anchor="middle" font-size="9" fill="#0b1730">Manual obrigatório</text><text x="100" y="105" text-anchor="middle" font-size="9" fill="#0b1730">RD obrigatório</text><text x="100" y="120" text-anchor="middle" font-size="9" fill="#0b1730">6 proc. documentados</text><text x="100" y="135" text-anchor="middle" font-size="9" fill="#0b1730">Ação preventiva</text><text x="100" y="150" text-anchor="middle" font-size="9" fill="#0b1730">Exclusões (cl. 7)</text><text x="100" y="170" text-anchor="middle" font-size="9" fill="#0b1730" font-style="italic">Foco: conformidade</text><path fill="none" d="M185 110 L215 110" stroke="#0b1730" stroke-width="2" marker-end="url(#arr14)"/><rect x="220" y="35" width="165" height="150" rx="8" fill="#16a34a" opacity="0.06" stroke="#16a34a" stroke-width="1.5"/><text x="302" y="55" text-anchor="middle" font-size="11" fill="#16a34a" font-weight="bold">Versão 2015</text><text x="302" y="75" text-anchor="middle" font-size="9" fill="#0b1730">10 cláusulas (Anexo SL)</text><text x="302" y="90" text-anchor="middle" font-size="9" fill="#0b1730">Manual não obrigatório</text><text x="302" y="105" text-anchor="middle" font-size="9" fill="#0b1730">Liderança distribuída</text><text x="302" y="120" text-anchor="middle" font-size="9" fill="#0b1730">Info documentada flexível</text><text x="302" y="135" text-anchor="middle" font-size="9" fill="#0b1730">Mentalidade de risco</text><text x="302" y="150" text-anchor="middle" font-size="9" fill="#0b1730">Aplicabilidade (cl. 4.3)</text><text x="302" y="170" text-anchor="middle" font-size="9" fill="#0b1730" font-style="italic">Foco: resultado + risco</text><defs><marker id="arr14" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6" fill="#0b1730"/></marker></defs></svg><figcaption>Principais mudanças estruturais entre as versões 2008 e 2015</figcaption></div>

<h3>Novidades conceituais da versão 2015</h3>

<h3>1. Contexto da organização (cláusula 4)</h3>

<p>Na versão 2008, não existia nenhum requisito para entender o ambiente externo e interno da organização. A versão 2015 exige que a empresa análise fatores como mercado, tecnologia, legislação, cultura organizacional e expectativas das partes interessadas. E a norma reconhecendo que qualidade não existe no vacuo — ela depende do contexto.</p>

<div class="example"><strong>Exemplo prático:</strong> Uma construtora que atuava só em obras residenciais decidiu entrar no mercado de obras públicas. O contexto mudou completamente: novas legislações (Lei de Licitações), novos requisitos de documentação, novos riscos. A análise de contexto da cláusula 4 obriga a empresa a reconhecer e tratar essas mudanças formalmente.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A Marcopolo, fabricante gaucha de onibus com presença em mais de 100 países, migrou da ISO 9001:2008 para a 2015 em todas as suas plantas entre 2017 e 2018. O gerente de qualidade corporativo relatou que a maior conquista da transição foi eliminar o "manual da qualidade de 200 páginas que ninguém lia" e substituir por documentação enxuta e conectada ao dia a dia. A mentalidade de risco, antes inexistente na prática, passou a ser discutida nas reuniões semanais de produção — não como burocracia, mas como ferramenta de decisão.</p></div>

<h3>2. Mentalidade de risco</h3>

<p>A maior mudança conceitual. A versão 2008 tinha "ações preventivas" como um requisito formal que ninguém conseguia implementar de forma convincente. A versão 2015 eliminou essa cláusula e substituiu por algo muito mais poderoso: a mentalidade de risco permeando toda a norma.</p>

<p>Agora, toda vez que você planeja um processo, define um objetivo ou modifica algo, precisa considerar: quais riscos isso traz? Quais oportunidades? O que pode dar errado? O que pode dar mais certo do que o esperado?</p>

<div class="callout"><strong>Importante:</strong> A norma NÃO exige uma metodologia formal de gestão de riscos (como FMEA ou ISO 31000). Ela pede que a organização considere riscos e oportunidades de forma proporcional a sua complexidade. Uma microempresa pode fazer isso com uma planilha simples; uma indústria complexa pode usar FMEA, Bow-Tie ou outra metodologia estruturada.</div>

<h3>3. Liderança mais ativa</h3>

<p>Na versão 2008, a alta direção podia "delegar" a gestão da qualidade ao Representante da Direção. Na versão 2015, a norma e explicita: a alta direção deve demonstrar liderança e comprometimento com relação ao SGQ, garantir que a política e os objetivos sejam compatíveis com a direção estratégica, integrar os requisitos do SGQ nos processos de negócio e promover a mentalidade de risco.</p>

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

<div class="example"><strong>Exemplo prático:</strong> Uma metalúrgica que migrou da versão 2008 para 2015 descobriu que 70% do seu SGQ já atendia a nova versão. As principais adequações foram: criar a análise de contexto e partes interessadas, reformular a gestão de riscos (tirando o formulário genérico de "ação preventiva" e colocando análise de risco por processo) e envolver mais a direção nas análises críticas. O Manual da Qualidade foi mantido por opção, mas simplificado de 40 para 12 páginas.</div>

<h3>Dica para quem vem da versão 2008</h3>

<p>Não tente "converter" os documentos antigos palavra por palavra. Use a transição como oportunidade para simplificar. Muitas empresas tinham documentação excessiva na versão 2008 que não agregava valor. A versão 2015 e a chance de ter um SGQ mais enxuto, prático e realmente útil para a gestão.</p>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A ação preventiva formal foi substituída pela mentalidade de risco integrada a toda a norma." data-fb-nok="Incorreto. Na versão 2015, a ação preventiva deixou de existir como cláusula específica e foi substituída pela mentalidade de risco (cláusula 6.1)."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O que substituiu a "ação preventiva" da versão 2008 na ISO 9001:2015?</div><button class="qi-option" data-key="a">Ação corretiva ampliada (cláusula 10.2)</button><button class="qi-option" data-key="b">Análise crítica pela direção (cláusula 9.3)</button><button class="qi-option" data-key="c">Mentalidade de risco integrada a toda a norma (cláusula 6.1)</button><div class="qi-feedback"></div></div>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Avaliar o SGQ atual</strong><br>Identifique o que já atende a versão 2015 (geralmente 60-70%)</div></div><div class="step-item"><div class="step-content"><strong>2. Criar análise de contexto</strong><br>SWOT + partes interessadas (novidade da 2015)</div></div><div class="step-item"><div class="step-content"><strong>3. Reformular riscos</strong><br>Sair da ação preventiva genérica para risco por processo</div></div><div class="step-item"><div class="step-content"><strong>4. Engajar a direção</strong><br>Alta direção deve participar ativamente, não apenas delegar</div></div><div class="step-item"><div class="step-content"><strong>5. Simplificar documentação</strong><br>Eliminar excesso, manter apenas informação documentada necessária</div></div></div>

<div class="template-box"><span>Download: Tabela comparativa detalhada 2008 vs 2015</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 2 — Contexto e Liderança (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod2Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Contexto e Liderança', 'Cláusulas 4 e 5: análise do contexto organizacional, partes interessadas, escopo, processos e papel da liderança.', 2)
    RETURNING id
  `;
  const mod2 = mod2Rows[0].id;

  // --- Aula 2.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'contexto-organizacao', 'Cláusula 4.1 — Entendendo a Organização e seu Contexto', '30 min', 1, ${`
<h2>Cláusula 4.1 — Entendendo a Organização e seu Contexto</h2>

<p>A cláusula 4.1 é o ponto de partida de toda a norma ISO 9001:2015. Antes de definir políticas, objetivos ou processos, a organização precisa entender <strong>onde esta inserida</strong>. Isso envolve mapear fatores internos e externos que podem afetar a capacidade de entregar produtos e serviços conformes.</p>

<h3>O que a norma pede</h3>

<p>O requisito e direto: "A organização deve determinar questões externas e internas que sejam pertinentes para seu propósito e sua direção estratégica e que afetem sua capacidade de alcancar os resultados pretendidos de seu SGQ."</p>

<p>Traduzindo: você precisa saber o que esta acontecendo dentro e fora da empresa que impacta a qualidade dos seus produtos e serviços.</p>

<div class="diagram"><svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg"><text x="200" y="20" text-anchor="middle" font-size="12" fill="#0b1730" font-weight="bold">Análise SWOT — Fatores Internos e Externos</text><rect x="20" y="35" width="175" height="95" rx="8" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1.5"/><text x="107" y="55" text-anchor="middle" font-size="11" fill="#16a34a" font-weight="bold">S - Forcas</text><text x="107" y="72" text-anchor="middle" font-size="8" fill="#0b1730">Parque de máquinas moderno</text><text x="107" y="84" text-anchor="middle" font-size="8" fill="#0b1730">Equipe experiente</text><text x="107" y="96" text-anchor="middle" font-size="8" fill="#0b1730">Localização estratégica</text><text x="30" y="118" text-anchor="start" font-size="7" fill="#16a34a" font-style="italic">INTERNO / POSITIVO</text><rect x="205" y="35" width="175" height="95" rx="8" fill="#c5383c" opacity="0.1" stroke="#c5383c" stroke-width="1.5"/><text x="292" y="55" text-anchor="middle" font-size="11" fill="#c5383c" font-weight="bold">W - Fraquezas</text><text x="292" y="72" text-anchor="middle" font-size="8" fill="#0b1730">Alta rotatividade</text><text x="292" y="84" text-anchor="middle" font-size="8" fill="#0b1730">Documentação informal</text><text x="292" y="96" text-anchor="middle" font-size="8" fill="#0b1730">Concentração de clientes</text><text x="215" y="118" text-anchor="start" font-size="7" fill="#c5383c" font-style="italic">INTERNO / NEGATIVO</text><rect x="20" y="140" width="175" height="95" rx="8" fill="#2563eb" opacity="0.1" stroke="#2563eb" stroke-width="1.5"/><text x="107" y="160" text-anchor="middle" font-size="11" fill="#2563eb" font-weight="bold">O - Oportunidades</text><text x="107" y="177" text-anchor="middle" font-size="8" fill="#0b1730">Novos mercados (eolica)</text><text x="107" y="189" text-anchor="middle" font-size="8" fill="#0b1730">Indústria 4.0</text><text x="107" y="201" text-anchor="middle" font-size="8" fill="#0b1730">Demanda por alta precisão</text><text x="30" y="223" text-anchor="start" font-size="7" fill="#2563eb" font-style="italic">EXTERNO / POSITIVO</text><rect x="205" y="140" width="175" height="95" rx="8" fill="#eab308" opacity="0.1" stroke="#eab308" stroke-width="1.5"/><text x="292" y="160" text-anchor="middle" font-size="11" fill="#eab308" font-weight="bold">T - Ameacas</text><text x="292" y="177" text-anchor="middle" font-size="8" fill="#0b1730">Importados chineses</text><text x="292" y="189" text-anchor="middle" font-size="8" fill="#0b1730">Escassez de mão de obra</text><text x="292" y="201" text-anchor="middle" font-size="8" fill="#0b1730">Variação cambial</text><text x="215" y="223" text-anchor="start" font-size="7" fill="#eab308" font-style="italic">EXTERNO / NEGATIVO</text></svg><figcaption>Matriz SWOT — ferramenta prática para atender a cláusula 4.1</figcaption></div>

<h3>Questões externas</h3>

<p>São fatores do ambiente em que a organização opera, sobre os quais ela tem pouco ou nenhum controle:</p>

<ul>
  <li><strong>Econômicas:</strong> inflação, taxa de cambio, custo de materias-primas, poder de compra dos clientes.</li>
  <li><strong>Legais/regulatórias:</strong> normas técnicas, legislação ambiental, requisitos sanitarios, normas trabalhistas.</li>
  <li><strong>Tecnológicas:</strong> novas tecnologias disponíveis, obsolescencia de equipamentos, digitalização.</li>
  <li><strong>Competitivas:</strong> ações de concorrentes, entrada de novos players, mudanças no mercado.</li>
  <li><strong>Sociais/culturais:</strong> expectativas da comunidade, tendências de consumo, escassez de mão de obra qualificada.</li>
</ul>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> Uma empresa de usinagem em Joinville identificou como questões externas críticas: (1) a escassez de operadores de CNC qualificados na região, (2) a variação do preço do aço importado devido ao câmbio, (3) a entrada de concorrentes chineses oferecendo peças a preços mais baixos. Cada um desses fatores exigiu ações específicas: programa de formação interna, contratos de fornecimento com hedge cambial e diferenciação pela qualidade e prazo.</div>

<h3>Questões internas</h3>

<p>São fatores dentro da organização:</p>

<ul>
  <li><strong>Cultura organizacional:</strong> como as pessoas encaram qualidade, inovação, mudança.</li>
  <li><strong>Estrutura:</strong> organograma, processos decisorios, autonomia das equipes.</li>
  <li><strong>Recursos:</strong> financeiros, tecnologicos, humanos.</li>
  <li><strong>Conhecimento:</strong> know-how acumulado, dependência de pessoas-chave.</li>
  <li><strong>Desempenho:</strong> indicadores atuais, histórico de não conformidades, nível de maturidade do SGQ.</li>
</ul>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Uma fábrica de embutidos identificou como questão interna crítica a alta rotatividade na linha de produção (turnover de 35% ao ano). Isso impactava diretamente a qualidade: operadores novos cometiam mais erros de dosagem e temperatura. A ação foi criar um programa de integração mais robusto e um plano de carreira para operadores, reduzindo o turnover para 18% em um ano.</div>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A Tupy S.A., maior fabricante mundial de blocos e cabecotes de motor em ferro fundido (Joinville-SC), usa a análise de contexto como ferramenta estratégica real. Quando a tendência global de eletrificação veicular comecou a ameacar a demanda por motores a combustão, a empresa identificou isso na cláusula 4.1 e redirecionou investimentos para componentes de veiculos hibridos e infraestrutura de energia. A análise de contexto deixou de ser "papel para auditor" e virou bussola estratégica.</p></div>

<div class="tabs"><div class="tab-btns"><button class="tab-btn active">PESTEL</button><button class="tab-btn">5 Forcas Porter</button></div><div class="tab-panel active"><p><strong>P</strong>olitico: políticas industriais, incentivos fiscais<br><strong>E</strong>conomico: inflação, cambio, custo de insumos<br><strong>S</strong>ocial: escassez de mão de obra, cultura regional<br><strong>T</strong>ecnologico: Indústria 4.0, automação, IoT<br><strong>E</strong>cologico: regulamentação ambiental, ESG<br><strong>L</strong>egal: NRs, normas técnicas, LGPD</p></div><div class="tab-panel"><p><strong>1.</strong> Rivalidade entre concorrentes existentes<br><strong>2.</strong> Ameaca de novos entrantes (ex: importados)<br><strong>3.</strong> Poder de barganha dos fornecedores<br><strong>4.</strong> Poder de barganha dos clientes<br><strong>5.</strong> Ameaca de produtos substitutos</p></div></div>

<h3>Ferramentas práticas para análise de contexto</h3>

<p>A norma não exige nenhuma ferramenta específica. As mais usadas na prática são:</p>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Complexidade</th></tr>
  <tr><td>Análise SWOT</td><td>Visão geral rápida</td><td>Baixa</td></tr>
  <tr><td>PESTEL</td><td>Aprofundar fatores externos</td><td>Media</td></tr>
  <tr><td>5 Forças de Porter</td><td>Entender competitividade</td><td>Media</td></tr>
  <tr><td>Canvas de modelo de negócio</td><td>Startups e empresas novas</td><td>Media</td></tr>
</table>

<p>Para a maioria das PMEs brasileiras, uma <strong>análise SWOT bem-feita</strong> já atende plenamente o requisito. O importante e que seja realista (não um exercício de fantasia), que seja monitorada periodicamente e que alimente decisões concretas.</p>

<h3>Frequência de revisão</h3>

<p>A norma exige que a organização "monitore e análise criticamente" as informações sobre contexto. Na prática, a maioria das organizações faz isso na análise crítica pela direção (cláusula 9.3), que acontece pelo menos uma vez ao ano. Porém, eventos significativos (pandemia, mudança regulatoria, crise de mercado) devem disparar revisões extraordinarias.</p>

<div class="callout"><strong>Importante:</strong> A análise de contexto não precisa ser um documento extenso. Para uma empresa de 50 funcionários, uma ou duas páginas com os principais fatores, seus impactos e as ações planejadas já é suficiente. O auditor quer ver que você PENSOU sobre isso e tomou decisões com base nessa análise — não quer um relatório academico.</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A SWOT analisa fatores internos (forcas/fraquezas) e externos (oportunidades/ameacas)." data-fb-nok="Incorreto. A análise SWOT cobre fatores internos (S e W) e externos (O e T), sendo a ferramenta mais usada para a cláusula 4.1."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual ferramenta e mais indicada para PMEs atenderem a cláusula 4.1 de forma prática?</div><button class="qi-option" data-key="a">FMEA (Análise de Modos de Falha e Efeitos)</button><button class="qi-option" data-key="b">Análise SWOT (Forcas, Fraquezas, Oportunidades, Ameacas)</button><button class="qi-option" data-key="c">Diagrama de Ishikawa (Causa e Efeito)</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Template de análise de contexto (SWOT + fatores internos/externos)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'partes-interessadas', 'Cláusula 4.2 — Partes Interessadas e seus Requisitos', '30 min', 2, ${`
<h2>Cláusula 4.2 — Partes Interessadas e seus Requisitos</h2>

<p>A cláusula 4.2 complementa a 4.1. Após entender o contexto, a organização precisa identificar quem são as <strong>partes interessadas pertinentes</strong> ao SGQ e quais são seus requisitos relevantes.</p>

<h3>O que a norma pede</h3>

<p>"A organização deve determinar: (a) as partes interessadas que sejam pertinentes para o SGQ; (b) os requisitos dessas partes interessadas que sejam pertinentes para o SGQ."</p>

<p>A palavra-chave e <strong>pertinente</strong>. Você não precisa listar todas as partes interessadas do universo — apenas aquelas que realmente impactam ou são impactadas pelo seu sistema de gestão da qualidade.</p>

<div class="diagram"><svg viewBox="0 0 440 336" xmlns="http://www.w3.org/2000/svg"><text x="220" y="18" text-anchor="middle" font-size="12" fill="#0b1730" font-weight="bold">Mapa de Partes Interessadas</text><circle cx="220" cy="178" r="44" fill="#0b1730" opacity="0.08" stroke="#0b1730" stroke-width="2"/><text x="220" y="176" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">Organização</text><text x="220" y="190" text-anchor="middle" font-size="8" fill="#0b1730">(SGQ)</text><line x1="220" y1="134" x2="220" y2="82" stroke="#c5383c" stroke-width="1.4"/><ellipse cx="220" cy="60" rx="54" ry="22" fill="#c5383c" opacity="0.1" stroke="#c5383c" stroke-width="1.5"/><text x="220" y="63.5" text-anchor="middle" font-size="9.5" fill="#c5383c" font-weight="bold">Clientes</text><line x1="254.4" y1="150.6" x2="287.7" y2="124" stroke="#2563eb" stroke-width="1.4"/><ellipse cx="312.3" cy="104.4" rx="54" ry="22" fill="#2563eb" opacity="0.1" stroke="#2563eb" stroke-width="1.5"/><text x="312.3" y="107.9" text-anchor="middle" font-size="9.5" fill="#2563eb" font-weight="bold">Fornecedores</text><line x1="262.9" y1="187.8" x2="287.9" y2="193.5" stroke="#16a34a" stroke-width="1.4"/><ellipse cx="335" cy="204.3" rx="54" ry="22" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1.5"/><text x="335" y="207.8" text-anchor="middle" font-size="9.5" fill="#16a34a" font-weight="bold">Reguladores</text><line x1="239.1" y1="217.6" x2="260.8" y2="262.7" stroke="#ca8a04" stroke-width="1.4"/><ellipse cx="271.2" cy="284.3" rx="54" ry="22" fill="#ca8a04" opacity="0.1" stroke="#ca8a04" stroke-width="1.5"/><text x="271.2" y="287.8" text-anchor="middle" font-size="9.5" fill="#ca8a04" font-weight="bold">Comunidade</text><line x1="200.9" y1="217.6" x2="179.2" y2="262.7" stroke="#2563eb" stroke-width="1.4"/><ellipse cx="168.8" cy="284.3" rx="54" ry="22" fill="#2563eb" opacity="0.1" stroke="#2563eb" stroke-width="1.5"/><text x="168.8" y="287.8" text-anchor="middle" font-size="9.5" fill="#2563eb" font-weight="bold">Colaboradores</text><line x1="177.1" y1="187.8" x2="152.1" y2="193.5" stroke="#c5383c" stroke-width="1.4"/><ellipse cx="105" cy="204.3" rx="54" ry="22" fill="#c5383c" opacity="0.1" stroke="#c5383c" stroke-width="1.5"/><text x="105" y="207.8" text-anchor="middle" font-size="9.5" fill="#c5383c" font-weight="bold">Acionistas</text><line x1="185.6" y1="150.6" x2="152.3" y2="124" stroke="#16a34a" stroke-width="1.4"/><ellipse cx="127.7" cy="104.4" rx="54" ry="22" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1.5"/><text x="127.7" y="107.9" text-anchor="middle" font-size="9.5" fill="#16a34a" font-weight="bold">Certificadora</text></svg><figcaption>Mapa de partes interessadas típicas de uma organização industrial</figcaption></div>

<h3>Quem são as partes interessadas tipicas</h3>

<table>
  <tr><th>Parte interessada</th><th>Requisitos tipicos</th><th>Exemplo industrial</th></tr>
  <tr><td>Clientes</td><td>Produto conforme, prazo, preco justo, suporte técnico</td><td>Montadora exige CPK > 1,33 em dimensões críticas</td></tr>
  <tr><td>Colaboradores</td><td>Salário justo, segurança, treinamento, ambiente de trabalho</td><td>Operadores de solda pedem EPI adequado e ventilação</td></tr>
  <tr><td>Fornecedores</td><td>Pedidos claros, prazo de pagamento, previsibilidade</td><td>Siderurgica precisa de previsão de demanda com 60 dias</td></tr>
  <tr><td>Acionistas/socios</td><td>Retorno financeiro, crescimento sustentável</td><td>Socio espera margem líquida acima de 8%</td></tr>
  <tr><td>Órgãos reguladores</td><td>Conformidade legal, licencas, autorizações</td><td>ANVISA exige BPF na indústria alimentícia</td></tr>
  <tr><td>Comunidade local</td><td>Baixo impacto ambiental, emprego local</td><td>Vizinhos da fábrica reclamam de ruido noturno</td></tr>
  <tr><td>Organismos de certificação</td><td>Atendimento aos requisitos da norma</td><td>Bureau Veritas agenda auditoria anual</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora de médio porte em Florianopolis listou 9 partes interessadas. Ao analisar com cuidado, percebeu que duas eram as mais críticas para o SGQ: (1) os clientes finais (compradores de apartamentos), cujos requisitos incluiam acabamento sem defeitos e entrega no prazo; e (2) o CREA/CAU, cujos requisitos eram conformidade com normas técnicas e ART recolhida. As demais partes existiam, mas seus requisitos tinham impacto menor no SGQ especificamente.</div>

<h3>Como levantar os requisitos</h3>

<p>Não complique. Para cada parte interessada pertinente, pergunte:</p>

<ol>
  <li>O que essa parte espera de nos em relação a qualidade?</li>
  <li>Qual o impacto se não atendermos essa expectativa?</li>
  <li>Esses requisitos são obrigatórios (legais/contratuais) ou voluntários?</li>
</ol>

<p>Requisitos obrigatórios (legais, regulamentares, contratuais) devem ser tratados como prioridade absoluta. Requisitos voluntários (expectativas do mercado, boas práticas) são importantes, mas podem ser priorizados conforme a estratégia da organização.</p>

<h3>Monitoramento e atualização</h3>

<p>Partes interessadas e seus requisitos mudam. Um novo contrato pode trazer novos requisitos do cliente. Uma mudança regulatoria pode criar novos requisitos legais. A norma pede que essa análise seja monitorada e atualizada — novamente, a análise crítica pela direção é o momento natural para isso.</p>

<div class="callout"><strong>Importante:</strong> Um erro frequente em auditorias e ter a matriz de partes interessadas "congelada" desde a implantação do SGQ. O auditor pergunta: "Quando foi a última vez que vocês revisaram as partes interessadas?" Se a resposta for "na implantação, há 3 anos", é um achado provável. A organização precisa demonstrar que essa análise e viva.</div>

<h3>Conexao com outras cláusulas</h3>

<p>A análise de partes interessadas alimenta diretamente:</p>

<ul>
  <li><strong>Cláusula 4.3 (escopo):</strong> o escopo deve considerar os requisitos das partes interessadas.</li>
  <li><strong>Cláusula 6.1 (riscos):</strong> riscos e oportunidades devem considerar as partes interessadas.</li>
  <li><strong>Cláusula 8.2 (requisitos de produtos/serviços):</strong> os requisitos do cliente são um subconjunto dos requisitos das partes interessadas.</li>
  <li><strong>Cláusula 9.3 (análise crítica):</strong> mudanças nas partes interessadas são entrada obrigatória para a análise crítica.</li>
</ul>

<ul class="checklist">
  <li><span class="ck-box"></span>Listamos todas as partes interessadas pertinentes ao SGQ</li>
  <li><span class="ck-box"></span>Para cada parte, identificamos os requisitos relevantes</li>
  <li><span class="ck-box"></span>Diferenciamos requisitos obrigatórios (legais/contratuais) dos voluntários</li>
  <li><span class="ck-box"></span>Revisamos a matriz de partes interessadas pelo menos anualmente</li>
  <li><span class="ck-box"></span>A análise crítica pela direção inclui mudanças nas partes interessadas</li>
</ul>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A palavra-chave e pertinente — só as partes interessadas que realmente impactam o SGQ precisam ser consideradas." data-fb-nok="Incorreto. A norma não exige listar todas as partes interessadas, apenas as pertinentes ao SGQ."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">A cláusula 4.2 exige que a organização identifique:</div><button class="qi-option" data-key="a">Todas as partes interessadas existentes no mercado</button><button class="qi-option" data-key="b">As partes interessadas pertinentes ao SGQ e seus requisitos relevantes</button><button class="qi-option" data-key="c">Apenas clientes e fornecedores diretos</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Matriz de partes interessadas com prioridade e requisitos</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'escopo-processos', 'Cláusulas 4.3 e 4.4 — Escopo do SGQ e Abordagem de Processos', '30 min', 3, ${`
<h2>Cláusulas 4.3 e 4.4 — Escopo e Abordagem de Processos</h2>

<h3>Cláusula 4.3 — Determinando o escopo do SGQ</h3>

<p>O escopo define os limites e a aplicabilidade do seu Sistema de Gestão da Qualidade. Em termos simples: o que está dentro e o que está fora do SGQ.</p>

<p>Para determinar o escopo, a organização deve considerar:</p>

<ul>
  <li>As questões externas e internas (cláusula 4.1)</li>
  <li>Os requisitos das partes interessadas (cláusula 4.2)</li>
  <li>Os produtos e serviços da organização</li>
</ul>

<p>O escopo deve ser mantido como informação documentada e deve declarar os tipos de produtos e serviços cobertos. Se algum requisito da norma não for aplicável, a organização deve justificar — e essa não aplicabilidade não pode afetar a conformidade dos produtos/serviços.</p>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> "O SGQ da MetalForte Ltda. abrange o projeto, fabricação e comercialização de peças usinadas em açoe alumínio para a indústria automotiva e de máquinas agrícolas, realizadas na unidade de Caxias do Sul - RS." Note como o escopo e específico: diz O QUE faz, PARA QUEM faz e ONDE faz.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Escopo mal definido</h4><ul><li>Prestação de serviços industriais</li><li>Fabricação de peças em geral</li><li>Serviços diversos de engenharia</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Escopo bem definido</h4><ul><li>Usinagem de precisão em aço e alumínio para indústria automotiva</li><li>Projeto, fabricação e ensaio de estruturas metalicas para construção civil</li><li>Produção e envase de sucos naturais na unidade de Chapeco-SC</li></ul></div></div>

<div class="callout"><strong>Importante:</strong> Um escopo genérico demais ("prestação de serviços") será questionado pelo auditor. Um escopo específico demais pode limitar desnecessariamente o SGQ. Encontre o equilíbrio: seja claro o suficiente para que qualquer pessoa entenda o que a empresa faz e o que o certificado cobre.</div>

<h3>Sobre não aplicabilidade de requisitos</h3>

<p>Na versão 2008, existia o conceito de "exclusões" (geralmente do requisito 7.3 — projeto). Na versão 2015, não existe mais "exclusão". Existe "não aplicabilidade", que e diferente: você precisa justificar por que aquele requisito não se aplica, e essa justificativa deve ser razoavel.</p>

<p>Requisitos que frequentemente são declarados "não aplicáveis":</p>

<ul>
  <li><strong>8.3 (Projeto e desenvolvimento):</strong> quando a organização fábrica conforme especificação do cliente, sem projetar. Exemplo: uma metalúrgica que usina peças conforme desenho do cliente não projeta — mas se ela modifica materiais ou processos por conta própria, pode estar projetando sem saber.</li>
  <li><strong>8.5.1 f (Atividades pós-entrega):</strong> quando não há necessidade de assistência técnica, garantia ou manutenção pós-venda.</li>
</ul>

<h3>Cláusula 4.4 — SGQ e seus processos</h3>

<p>Esta e uma das cláusulas mais importantes da norma. Ela exige que a organização determine os processos necessários para o SGQ e, para cada processo, defina:</p>

<ol>
  <li><strong>Entradas e saídas:</strong> o que entra e o que sai de cada processo.</li>
  <li><strong>Sequência e interação:</strong> como os processos se conectam.</li>
  <li><strong>Critérios e métodos:</strong> como medir se o processo está funcionando.</li>
  <li><strong>Recursos:</strong> o que é necessário para operar o processo.</li>
  <li><strong>Responsabilidades:</strong> quem e responsável pelo processo.</li>
  <li><strong>Riscos e oportunidades:</strong> conforme cláusula 6.1.</li>
  <li><strong>Melhoria:</strong> como o processo pode ser melhorado.</li>
</ol>

<h3>O mapa de processos</h3>

<p>Na prática, isso se materializa em um <strong>mapa de processos</strong>. A maioria das organizações classifica seus processos em três categorias:</p>

<table>
  <tr><th>Categoria</th><th>Função</th><th>Exemplos</th></tr>
  <tr><td>Processos de gestão</td><td>Direcionar e controlar</td><td>Planejamento estratégico, análise crítica, gestão de riscos</td></tr>
  <tr><td>Processos de realização (core)</td><td>Entregar valor ao cliente</td><td>Vendas, projeto, produção, entrega, pós-venda</td></tr>
  <tr><td>Processos de apoio</td><td>Suportar os processos core</td><td>RH, compras, manutenção, TI, qualidade</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Cooperativa agrícola:</strong> Uma cooperativa de grãos mapeou 11 processos: Governança (gestão), Recepção de grãos, Classificação, Armazenamento, Beneficiamento, Comercialização (core), Compras, Manutenção, Gestão de pessoas, Financeiro, Qualidade (apoio). Cada processo tinha um dono, indicadores, entradas e saídas definidos. Isso fácilitou tanto a gestão diária quanto as auditorias.</div>

<div class="diagram"><svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><text x="200" y="18" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Mapa de Processos — Estrutura Tipica</text><rect x="120" y="28" width="160" height="30" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="48" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Processos de Gestão</text><text x="200" y="26" text-anchor="middle" font-size="7" fill="#2563eb">Planej. Estratégico | Gestão da Qualidade</text><rect x="20" y="75" width="80" height="80" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="60" y="95" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">Vendas</text><rect x="110" y="75" width="80" height="80" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="150" y="95" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">Produção</text><rect x="200" y="75" width="80" height="80" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="240" y="95" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">Inspeção</text><rect x="290" y="75" width="90" height="80" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="335" y="95" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">Expedição</text><text x="200" y="110" text-anchor="middle" font-size="8" fill="#16a34a">Processos Core (realização)</text><defs><marker id="arrMP" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0 0 L6 2.5 L0 5" fill="#0b1730"/></marker></defs><line x1="100" y1="115" x2="110" y2="115" stroke="#0b1730" stroke-width="1" marker-end="url(#arrMP)"/><line x1="190" y1="115" x2="200" y2="115" stroke="#0b1730" stroke-width="1" marker-end="url(#arrMP)"/><line x1="280" y1="115" x2="290" y2="115" stroke="#0b1730" stroke-width="1" marker-end="url(#arrMP)"/><text x="15" y="118" text-anchor="start" font-size="7" fill="#0b1730">CLIENTE</text><text x="385" y="118" text-anchor="end" font-size="7" fill="#0b1730">CLIENTE</text><rect x="60" y="172" width="280" height="30" rx="6" fill="#eab308" opacity="0.12" stroke="#eab308" stroke-width="1.5"/><text x="200" y="192" text-anchor="middle" font-size="9" fill="#eab308" font-weight="bold">Processos de Apoio</text><text x="200" y="170" text-anchor="middle" font-size="7" fill="#eab308">Compras | RH | Manutenção | TI | Qualidade</text></svg><figcaption>Estrutura tipica de mapa de processos: gestão, core e apoio</figcaption></div>

<h3>Dicas para montar o mapa de processos</h3>

<ul>
  <li>Não crie processos demais. Uma empresa de 50 pessoas geralmente tem entre 8 e 15 processos. Mais que isso vira burocracia.</li>
  <li>Garanta que as interações estejam claras: quem entrega o que para quem.</li>
  <li>Cada processo precisa de pelo menos um indicador mensurável.</li>
  <li>O mapa deve refletir a realidade, não um ideal. Mapeie como a empresa realmente funciona, depois melhore.</li>
</ul>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Na versão 2015, não existem mais exclusões — usa-se o conceito de não aplicabilidade, que deve ser justificado." data-fb-nok="Incorreto. A versão 2015 substituiu o conceito de exclusões pelo de não aplicabilidade (cláusula 4.3), que exige justificativa."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Na ISO 9001:2015, quando um requisito não se aplica a organização, o que deve ser feito?</div><button class="qi-option" data-key="a">Justificar a não aplicabilidade, garantindo que não afete a conformidade dos produtos</button><button class="qi-option" data-key="b">Simplesmente excluir o requisito sem necessidade de justificativa</button><button class="qi-option" data-key="c">Solicitar autorização do organismo certificador para a exclusão</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Modelo de mapa de processos e ficha de processo</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 2.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod2}, 'lideranca-politica', 'Cláusula 5 — Liderança e Política da Qualidade', '30 min', 4, ${`
<h2>Cláusula 5 — Liderança e Política da Qualidade</h2>

<p>A cláusula 5 é o coração estratégico da norma. Ela coloca a alta direção no centro do SGQ — não como figurante, mas como protagonista. Se a direção não estiver comprometida de verdade, todo o resto vira papel sem alma.</p>

<h3>5.1 — Liderança e comprometimento</h3>

<h3>5.1.1 — Generalidades</h3>

<p>A alta direção deve demonstrar liderança e comprometimento com relação ao SGQ. A norma lista ações concretas:</p>

<ul>
  <li>Responsabilizar-se pela eficácia do SGQ.</li>
  <li>Assegurar que a política e os objetivos sejam estabelecidos e compatíveis com a direção estratégica.</li>
  <li>Assegurar a integração dos requisitos do SGQ nos processos de negócio.</li>
  <li>Promover o uso da abordagem de processo e da mentalidade de risco.</li>
  <li>Assegurar que os recursos necessários estejam disponíveis.</li>
  <li>Comunicar a importância do SGQ e da conformidade com os requisitos.</li>
  <li>Assegurar que o SGQ alcance seus resultados pretendidos.</li>
  <li>Engajar, dirigir e apoiar pessoas a contribuir.</li>
  <li>Promover melhoria.</li>
  <li>Apoiar outros papéis de gestão pertinentes.</li>
</ul>

<div class="callout"><strong>Importante:</strong> O verbo e "demonstrar" — não basta dizer que apoia. O auditor vai procurar evidências: atas de análise crítica com participação da direção, alocação de recursos para projetos de qualidade, comunicações da direção sobre qualidade, decisões que priorizaram qualidade sobre custo de curto prazo.</div>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><text x="200" y="18" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Cláusula 5 — Pilares da Liderança no SGQ</text><rect x="20" y="35" width="110" height="55" rx="8" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="75" y="55" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">5.1 Liderança e</text><text x="75" y="67" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">Comprometimento</text><text x="75" y="82" text-anchor="middle" font-size="7" fill="#0b1730">Responsabilidade pela</text><text x="75" y="90" text-anchor="middle" font-size="7" fill="#0b1730">eficácia do SGQ</text><rect x="145" y="35" width="110" height="55" rx="8" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="55" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">5.2 Política da</text><text x="200" y="67" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Qualidade</text><text x="200" y="82" text-anchor="middle" font-size="7" fill="#0b1730">Direção estratégica</text><text x="200" y="90" text-anchor="middle" font-size="7" fill="#0b1730">+ melhoria contínua</text><rect x="270" y="35" width="110" height="55" rx="8" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="325" y="55" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">5.3 Papéis e</text><text x="325" y="67" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">Autoridades</text><text x="325" y="82" text-anchor="middle" font-size="7" fill="#0b1730">Responsabilidades</text><text x="325" y="90" text-anchor="middle" font-size="7" fill="#0b1730">claras e comunicadas</text><rect x="60" y="120" width="280" height="50" rx="8" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="1"/><text x="200" y="142" text-anchor="middle" font-size="9" fill="#0b1730" font-weight="bold">Evidências de liderança que o auditor busca:</text><text x="200" y="158" text-anchor="middle" font-size="8" fill="#0b1730">Atas de análise crítica | Recursos alocados | Decisões documentadas | Foco no cliente</text><line x1="75" y1="90" x2="120" y2="120" stroke="#0b1730" stroke-width="0.8" stroke-dasharray="3 2"/><line x1="200" y1="90" x2="200" y2="120" stroke="#0b1730" stroke-width="0.8" stroke-dasharray="3 2"/><line x1="325" y1="90" x2="280" y2="120" stroke="#0b1730" stroke-width="0.8" stroke-dasharray="3 2"/></svg><figcaption>Os três pilares da cláusula 5: liderança, política e papéis organizacionais</figcaption></div>

<h3>5.1.2 — Foco no cliente</h3>

<p>A alta direção deve demonstrar liderança e comprometimento com relação ao foco no cliente, assegurando que:</p>

<ul>
  <li>Requisitos do cliente e requisitos legais sejam determinados, entendidos e atendidos.</li>
  <li>Riscos que possam afetar a conformidade sejam tratados.</li>
  <li>O foco no aumento da satisfação do cliente seja mantido.</li>
</ul>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> O diretor de uma fábrica de massas em Erechim participava pessoalmente da reunião mensal de análise de reclamações de clientes. Não delegava ao gerente de qualidade. Quando uma rede de supermercados reportou problemas de embalagem, o diretor autorizou investimento de R$ 180.000 em nova seladora na mesma semana. Isso e liderança com foco no cliente — decisão rápida, recurso alocado, prioridade clara.</div>

<h3>5.2 — Política da qualidade</h3>

<p>A política da qualidade é a declaração de intenções da organização em relação a qualidade. Ela deve:</p>

<ol>
  <li>Ser apropriada ao propósito e contexto da organização.</li>
  <li>Prover uma estrutura para definir objetivos da qualidade.</li>
  <li>Incluir comprometimento com o atendimento aos requisitos aplicáveis.</li>
  <li>Incluir comprometimento com a melhoria contínua do SGQ.</li>
</ol>

<p>Além disso, a política deve ser mantida como informação documentada, comunicada e entendida na organização e disponível para partes interessadas pertinentes.</p>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Política genérica</h4><ul><li>Buscamos a excelência na satisfação dos clientes</li><li>Comprometidos com a melhoria contínua</li><li>Valorizamos nossos colaboradores</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Política específica</h4><ul><li>Entregar peças dentro das tolerâncias especificadas, no prazo acordado</li><li>Reduzir refugo e retrabalho continuamente com base em dados</li><li>Qualificar operadores CNC com 40h/ano de treinamento</li></ul></div></div>

<div class="callout"><strong>Importante:</strong> Políticas genéricas como "Buscamos a excelência na satisfação dos nossos clientes através da melhoria contínua" não agregam nada. Uma boa política e específica para a empresa, reflete seus valores reais e serve como guia para decisões. Compare: "A MetalForte se compromete a entregar peças usinadas dentro das tolerâncias especificadas, no prazo acordado, buscando continuamente reduzir refugo e retrabalho, com respeito a segurança dos colaboradores e ao meio ambiente."</div>

<h3>5.3 — Papéis, responsabilidades e autoridades</h3>

<p>A alta direção deve assegurar que responsabilidades e autoridades estejam definidas, comunicadas e entendidas. Em particular, alguém precisa ter autoridade para:</p>

<ul>
  <li>Assegurar que o SGQ esteja conforme os requisitos da norma.</li>
  <li>Assegurar que os processos entreguem suas saídas pretendidas.</li>
  <li>Relatar o desempenho do SGQ e oportunidades de melhoria a alta direção.</li>
  <li>Assegurar a promoção do foco no cliente na organização.</li>
  <li>Assegurar que a integridade do SGQ seja mantida quando mudanças forem planejadas.</li>
</ul>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora definiu a seguinte estrutura: o Diretor Técnico era responsável pelo SGQ perante a alta direção; cada Engenheiro de Obra era responsável pela qualidade da sua obra; o Coordenador de Qualidade apoiava tecnicamente mas não tinha "a culpa" quando algo dava errado. Essa clareza de papéis eliminou o clássico problema de "a qualidade e problema do setor de qualidade".</div>

<h3>Como o auditor avalia a cláusula 5</h3>

<p>O auditor normalmente:</p>

<ol>
  <li>Entrevista a alta direção diretamente (isso é obrigatório em auditorias de certificação).</li>
  <li>Verifica se a direção conhece a política, os objetivos e o desempenho do SGQ.</li>
  <li>Procura evidências de decisões baseadas em dados de qualidade.</li>
  <li>Verifica se recursos foram alocados quando necessário.</li>
  <li>Checa se a análise crítica foi conduzida com participação real da direção.</li>
</ol>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A norma exige que a alta direção demonstre liderança e comprometimento com ações concretas, não apenas delegue ao RD." data-fb-nok="Incorreto. Na ISO 9001:2015, a responsabilidade e da alta direção — ela deve demonstrar comprometimento ativo, não apenas nomear um responsável."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a principal exigência da cláusula 5.1 sobre liderança?</div><button class="qi-option" data-key="a">Nomear um Representante da Direção (RD) para cuidar do SGQ</button><button class="qi-option" data-key="b">Publicar a política da qualidade no site da empresa</button><button class="qi-option" data-key="c">A alta direção deve demonstrar liderança e comprometimento com ações concretas</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Modelo de política da qualidade + checklist de liderança</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 3 — Planejamento (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod3Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Planejamento', 'Cláusula 6: riscos e oportunidades, objetivos da qualidade, planejamento de mudanças e caso prático.', 3)
    RETURNING id
  `;
  const mod3 = mod3Rows[0].id;

  // --- Aula 3.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'riscos-oportunidades', 'Cláusula 6.1 — Ações para Abordar Riscos e Oportunidades', '30 min', 1, ${`
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

<div class="callout"><strong>Importante:</strong> A norma NÃO exige gestão formal de riscos (ISO 31000) nem metodologias específicas como FMEA. O que ela exige e a "mentalidade de risco" — que significa considerar riscos e oportunidades nas decisões. Para uma micro/pequena empresa, isso pode ser tao simples quanto uma planilha com os principais riscos, probabilidade, impacto e ações planejadas.</div>

<div class="diagram"><svg viewBox="0 0 400 216" xmlns="http://www.w3.org/2000/svg"><text x="200" y="18" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Matriz de Probabilidade x Impacto</text><rect x="80" y="30" width="100" height="50" rx="4" fill="#eab308" opacity="0.2" stroke="#eab308" stroke-width="1"/><text x="130" y="58" text-anchor="middle" font-size="9" fill="#0b1730">MÉDIO</text><rect x="180" y="30" width="100" height="50" rx="4" fill="#c5383c" opacity="0.2" stroke="#c5383c" stroke-width="1"/><text x="230" y="58" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">ALTO</text><rect x="280" y="30" width="100" height="50" rx="4" fill="#c5383c" opacity="0.35" stroke="#c5383c" stroke-width="2"/><text x="330" y="58" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">CRITICO</text><rect x="80" y="80" width="100" height="50" rx="4" fill="#16a34a" opacity="0.15" stroke="#16a34a" stroke-width="1"/><text x="130" y="108" text-anchor="middle" font-size="9" fill="#16a34a">BAIXO</text><rect x="180" y="80" width="100" height="50" rx="4" fill="#eab308" opacity="0.2" stroke="#eab308" stroke-width="1"/><text x="230" y="108" text-anchor="middle" font-size="9" fill="#0b1730">MÉDIO</text><rect x="280" y="80" width="100" height="50" rx="4" fill="#c5383c" opacity="0.2" stroke="#c5383c" stroke-width="1"/><text x="330" y="108" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">ALTO</text><rect x="80" y="130" width="100" height="50" rx="4" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="130" y="158" text-anchor="middle" font-size="9" fill="#16a34a">ACEITAR</text><rect x="180" y="130" width="100" height="50" rx="4" fill="#16a34a" opacity="0.15" stroke="#16a34a" stroke-width="1"/><text x="230" y="158" text-anchor="middle" font-size="9" fill="#16a34a">BAIXO</text><rect x="280" y="130" width="100" height="50" rx="4" fill="#eab308" opacity="0.2" stroke="#eab308" stroke-width="1"/><text x="330" y="158" text-anchor="middle" font-size="9" fill="#0b1730">MÉDIO</text><text x="40" y="58" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Alta</text><text x="40" y="108" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Media</text><text x="40" y="158" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Baixa</text><text x="15" y="108" text-anchor="middle" font-size="8" fill="#0b1730" transform="rotate(-90 15 108)">PROBABILIDADE</text><text x="130" y="195" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Baixo</text><text x="230" y="195" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Médio</text><text x="330" y="195" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Alto</text><text x="230" y="208" text-anchor="middle" font-size="8" fill="#0b1730">IMPACTO</text></svg><figcaption>Matriz de probabilidade x impacto — ferramenta prática para classificar riscos</figcaption></div>

<p>Dito isso, para organizações mais complexas, metodologias estruturadas agregam muito valor:</p>

<table>
  <tr><th>Metodologia</th><th>Indicada para</th><th>Complexidade</th></tr>
  <tr><td>Matriz de Probabilidade x Impacto</td><td>Qualquer porte</td><td>Baixa</td></tr>
  <tr><td>FMEA (Análise de Modos de Falha)</td><td>Processos produtivos críticos</td><td>Media-Alta</td></tr>
  <tr><td>HAZOP</td><td>Processos químicos e alimenticios</td><td>Alta</td></tr>
  <tr><td>Bow-Tie</td><td>Riscos complexos com múltiplas causas/consequências</td><td>Media</td></tr>
  <tr><td>What-If</td><td>Análise rápida de cenários</td><td>Baixa</td></tr>
</table>

<h3>Riscos tipicos por setor</h3>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong>
<ul>
  <li><strong>Risco:</strong> Materia-prima fora de especificação do fornecedor — <strong>Ação:</strong> inspeção de recebimento com análise química amostral, qualificação rigorosa de fornecedores.</li>
  <li><strong>Risco:</strong> Quebra de ferramenta de corte gerando peça não conforme — <strong>Ação:</strong> programa de troca preventiva de ferramentas por vida útil monitorada.</li>
  <li><strong>Oportunidade:</strong> Novo cliente do setor de energia eolica buscando fornecedores qualificados — <strong>Ação:</strong> adequar tolerâncias e obter qualificação específica.</li>
</ul></div>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong>
<ul>
  <li><strong>Risco:</strong> Contaminação cruzada na linha de produção — <strong>Ação:</strong> zoneamento, higienização validada, controle de alergenos.</li>
  <li><strong>Risco:</strong> Falta de energia elétrica comprometendo a cadeia de frio — <strong>Ação:</strong> gerador de emergência com teste mensal.</li>
  <li><strong>Oportunidade:</strong> Demanda crescente por produtos sem gluten — <strong>Ação:</strong> desenvolver linha dedicada e buscar certificação sem gluten.</li>
</ul></div>

<h3>Como estruturar a planilha de riscos</h3>

<p>Um formato prático que funciona para a maioria das empresas:</p>

<table>
  <tr><th>Processo</th><th>Risco/Oportunidade</th><th>Tipo</th><th>Probabilidade</th><th>Impacto</th><th>Nível</th><th>Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr>
  <tr><td>Produção</td><td>Ferramenta quebrar durante corte</td><td>Risco</td><td>Media</td><td>Alto</td><td>Alto</td><td>Troca preventiva por hora-máquina</td><td>Sup. Produção</td><td>30/03</td><td>Implementado</td></tr>
</table>

<p>Use escala simples: probabilidade (Baixa/Media/Alta) x impacto (Baixo/Médio/Alto). Riscos com nível alto exigem ação; riscos com nível médio devem ser monitorados; riscos com nível baixo são aceitos com monitoramento periodico.</p>

<h3>Integração com outros processos</h3>

<p>As ações para riscos devem ser integradas nos processos operacionais, não ficar numa planilha isolada. Se o risco e "fornecedor entregar material fora de especificação", a ação (inspeção de recebimento) deve estar no processo de recebimento de materiais, não apenas na planilha de riscos.</p>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A Randon S.A., fabricante gaucha de implementos rodoviarios, integrou a gestão de riscos da cláusula 6.1 diretamente no seu planejamento estratégico. Quando a crise de 2015-2016 reduziu drasticamente a demanda por caminhoes, a análise de riscos já havia previsto o cenário e a empresa tinha ações preparadas: diversificação para mercado externo, redução controlada de custos e investimento em inovação. A empresa saiu da crise com market share maior do que antes, enquanto concorrentes que não tinham gestão de riscos estruturada fecharam.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A norma pede mentalidade de risco — considerar riscos nas decisões — sem exigir metodologia formal." data-fb-nok="Incorreto. A ISO 9001:2015 não exige metodologia formal como FMEA ou ISO 31000. Ela pede que a organização considere riscos e oportunidades de forma proporcional."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O que a ISO 9001:2015 exige em relação a gestão de riscos?</div><button class="qi-option" data-key="a">Implementação obrigatória da ISO 31000 ou FMEA</button><button class="qi-option" data-key="b">Mentalidade de risco integrada as decisões, sem metodologia formal obrigatória</button><button class="qi-option" data-key="c">Apenas documentar riscos, sem necessidade de ações</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Planilha de gestão de riscos e oportunidades</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'objetivos-qualidade', 'Cláusula 6.2 — Objetivos da Qualidade', '30 min', 2, ${`
<h2>Cláusula 6.2 — Objetivos da Qualidade e Planejamento para Alcançá-los</h2>

<p>Se a política da qualidade e o "norte estratégico", os objetivos são os "marcos no caminho". A cláusula 6.2 exige que a organização estabeleca objetivos da qualidade em funções, níveis e processos pertinentes, e planeje como alcançá-los.</p>

<h3>Requisitos para os objetivos</h3>

<p>Os objetivos da qualidade devem ser:</p>

<ul>
  <li><strong>Coerentes com a política da qualidade</strong> — se a política fala em "entrega no prazo", deve haver um objetivo de pontualidade.</li>
  <li><strong>Mensuráveis</strong> — "melhorar a qualidade" não é mensurável; "reduzir o índice de refugo de 4% para 2% até dezembro" e mensurável.</li>
  <li><strong>Considerar requisitos aplicáveis</strong> — legais, do cliente, regulamentares.</li>
  <li><strong>Pertinentes para a conformidade</strong> de produtos/serviços e satisfação do cliente.</li>
  <li><strong>Monitorados, comunicados e atualizados</strong> conforme apropriado.</li>
</ul>

<h3>Planejamento para alcancar os objetivos</h3>

<p>Para cada objetivo, a organização deve determinar:</p>

<table>
  <tr><th>Item</th><th>Pergunte</th><th>Exemplo</th></tr>
  <tr><td>O que será feito</td><td>Quais ações concretas?</td><td>Implantar controle estatistico de processo (CEP) na linha 2</td></tr>
  <tr><td>Recursos necessários</td><td>Quanto custa? Quem faz?</td><td>Software CEP (R$ 8.000) + treinamento (16h)</td></tr>
  <tr><td>Responsável</td><td>Quem responde pelo resultado?</td><td>Coordenador de Produção</td></tr>
  <tr><td>Prazo</td><td>Quando deve estar pronto?</td><td>Até 30/06/2025</td></tr>
  <tr><td>Como avaliar resultados</td><td>Qual indicador vai medir?</td><td>Índice de refugo mensal (%)</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> A MetalForte definiu 5 objetivos da qualidade para 2025:
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
  <li><strong>Objetivos irrelevantes:</strong> "Reduzir consumo de papel no escritório" — pode ser válido para gestão ambiental, mas não é pertinente para o SGQ.</li>
  <li><strong>Objetivos inalcancaveis:</strong> "Zero defeitos" quando o índice atual e 5% — metas irrealistas desmotivam.</li>
  <li><strong>Objetivos sem plano de ação:</strong> definir a meta mas não o caminho para chegar la.</li>
  <li><strong>Objetivos sem monitoramento:</strong> definir em janeiro e só verificar em dezembro.</li>
</ul>

<h3>Critério SMART</h3>

<p>Uma referência útil (embora não mencionada na norma) e o critério SMART:</p>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>S — Specific (Específico)</strong><br>O objetivo deve ser claro e sem ambiguidade. "Reduzir refugo na linha 2" e específico.</div></div><div class="step-item"><div class="step-content"><strong>M — Measurable (Mensurável)</strong><br>Deve ter indicador numerico. "De 4% para 2,5%" e mensurável.</div></div><div class="step-item"><div class="step-content"><strong>A — Achievable (Alcancavel)</strong><br>Deve ser desafiador mas realista. "Zero defeitos" quando o índice e 5% desmotiva.</div></div><div class="step-item"><div class="step-content"><strong>R — Relevant (Relevante)</strong><br>Deve ser pertinente para a qualidade e satisfação do cliente.</div></div><div class="step-item"><div class="step-content"><strong>T — Time-bound (Com prazo)</strong><br>Deve ter data limite. "Até 31/12/2025" cria senso de urgência.</div></div></div>

<div class="callout"><strong>Importante:</strong> Os objetivos devem ser desdobrados para as funções e processos pertinentes. O objetivo corporativo de "reduzir refugo para 2,5%" pode se desdobrar em metas específicas por linha, por turno ou por produto. Quanto mais próximo do chão de fábrica, mais efetivo.</div>

<div class="diagram"><svg viewBox="0 0 440 196" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrOQ" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto"><path d="M0 0 L6 2.5 L0 5" fill="#64748b"/></marker></defs><text x="220" y="16" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Desdobramento de Objetivos da Qualidade</text><rect x="150" y="26" width="140" height="40" rx="6" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="220" y="42" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">Objetivo Corporativo</text><text x="220" y="57" text-anchor="middle" font-size="8.5" fill="#0b1730">Refugo &lt; 2,5%</text><line x1="190" y1="66" x2="84" y2="84" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><line x1="220" y1="66" x2="220" y2="84" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><line x1="250" y1="66" x2="356" y2="84" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><rect x="20" y="86" width="120" height="32" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="80" y="106" text-anchor="middle" font-size="8.5" fill="#2563eb" font-weight="bold">Linha 1: &lt; 2,0%</text><line x1="80" y1="118" x2="80" y2="132" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><rect x="160" y="86" width="120" height="32" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="220" y="106" text-anchor="middle" font-size="8.5" fill="#2563eb" font-weight="bold">Linha 2: &lt; 3,0%</text><line x1="220" y1="118" x2="220" y2="132" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><rect x="300" y="86" width="120" height="32" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="360" y="106" text-anchor="middle" font-size="8.5" fill="#2563eb" font-weight="bold">Linha 3: &lt; 2,5%</text><line x1="360" y1="118" x2="360" y2="132" stroke="#64748b" stroke-width="1.2" marker-end="url(#arrOQ)"/><rect x="17" y="134" width="126" height="28" rx="4" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="80" y="151" text-anchor="middle" font-size="7.5" fill="#16a34a">Ação: CEP + troca preventiva</text><rect x="157" y="134" width="126" height="28" rx="4" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="220" y="151" text-anchor="middle" font-size="7.5" fill="#16a34a">Ação: Retreinar setup</text><rect x="297" y="134" width="126" height="28" rx="4" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="360" y="151" text-anchor="middle" font-size="7.5" fill="#16a34a">Ação: Novo ferramental</text></svg><figcaption>Objetivos corporativos devem ser desdobrados por linha, turno ou produto</figcaption></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Objetivos devem ser mensuráveis, com indicador numerico, prazo e plano de ação associado." data-fb-nok="Incorreto. A norma exige que objetivos sejam mensuráveis e tenham planejamento (o que, quem, quando, como avaliar)."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual dos seguintes é um objetivo da qualidade bem formulado conforme a cláusula 6.2?</div><button class="qi-option" data-key="a">Reduzir o índice de refugo de 3,8% para 2,5% até dezembro de 2025</button><button class="qi-option" data-key="b">Melhorar a qualidade dos nossos produtos</button><button class="qi-option" data-key="c">Buscar a excelência na satisfação dos clientes</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Planilha de objetivos da qualidade com plano de ação 5W2H</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'planejamento-mudancas', 'Cláusula 6.3 — Planejamento de Mudanças', '30 min', 3, ${`
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
  <tr><td>Mudança de processo</td><td>Troca de máquina CNC</td><td>Novo setup, validação de processo, treinamento</td></tr>
  <tr><td>Mudança de fornecedor</td><td>Trocar fornecedor de aço</td><td>Nova qualificação, ajuste na inspeção de recebimento</td></tr>
  <tr><td>Mudança organizacional</td><td>Fusão de setores</td><td>Novos responsáveis, revisão de processos</td></tr>
  <tr><td>Mudança regulatoria</td><td>Nova norma técnica</td><td>Adequação de especificações e controles</td></tr>
  <tr><td>Mudança de escopo</td><td>Incluir novo tipo de serviço</td><td>Expansão do SGQ, novos processos</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora decidiu trocar o sistema de formas de madeira por formas metalicas. Antes de implementar, o coordenador de qualidade mapeou os impactos: necessidade de treinamento das equipes (4 turmas de 8h), revisão da instrução de trabalho de concretagem, novo fornecedor de formas a ser qualificado, novo item de inspeção na checklist de conferencia. A mudança foi planejada em 3 fases ao longo de 2 meses, sem impacto na qualidade das obras em andamento.</div>

<h3>Processo de gestão de mudanças</h3>

<p>Um fluxo prático para gestão de mudanças:</p>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Identificar</strong><br>O que vai mudar, por que e quando. Registrar a solicitação de mudança.</div></div><div class="step-item"><div class="step-content"><strong>2. Avaliar impactos</strong><br>Quais processos, documentos, competências e recursos são afetados.</div></div><div class="step-item"><div class="step-content"><strong>3. Planejar ações</strong><br>O que precisa ser feito antes, durante e depois da mudança.</div></div><div class="step-item"><div class="step-content"><strong>4. Aprovar</strong><br>Dono do processo + coordenador de qualidade autorizam a mudança.</div></div><div class="step-item"><div class="step-content"><strong>5. Implementar</strong><br>Executar as ações planejadas conforme cronograma.</div></div><div class="step-item"><div class="step-content"><strong>6. Verificar</strong><br>Confirmar que a mudança foi eficaz e não gerou efeitos colaterais.</div></div></div>

<div class="callout"><strong>Importante:</strong> Mudanças não planejadas são a maior fonte de não conformidades em auditorias. O clássico: a empresa troca de fornecedor de materia-prima "porque ficou mais barato" sem avaliar impacto na qualidade do produto final. Três meses depois, as reclamações de clientes triplicam. Se a mudança tivesse sido planejada conforme 6.3, o impacto teria sido avaliado antes.</div>

<h3>Conexao com a cláusula 8.5.6</h3>

<p>A cláusula 8.5.6 trata especificamente do controle de mudanças na produção/provisão de serviços. A lógica e a mesma: qualquer mudança na produção deve ser analisada, aprovada e verificada antes de ser liberada. A 6.3 e mais ampla (mudanças no SGQ como um todo) e a 8.5.6 e específica para mudanças operacionais.</p>

<div class="example"><strong>Exemplo prático — Cooperativa agrícola:</strong> A cooperativa decidiu ampliar a capacidade de secagem de grãos, instalando um novo secador com tecnologia diferente da existente. O plano de mudança incluiu: treinamento de 3 operadores no novo equipamento, revisão da instrução de operação, definição de novos parâmetros de temperatura e umidade, período de operação assistida de 30 dias com monitoramento intensivo, e validação do produto final (grãos secos conforme padrão). A mudança foi bem-sucedida sem perdas de qualidade.</div>

<div class="diagram"><svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg"><text x="200" y="18" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Gestão de Mudanças — Cláusulas 6.3 e 8.5.6</text><rect x="20" y="35" width="160" height="50" rx="8" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="100" y="55" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">6.3 — Mudanças no SGQ</text><text x="100" y="72" text-anchor="middle" font-size="8" fill="#0b1730">Escopo amplo: qualquer</text><text x="100" y="82" text-anchor="middle" font-size="8" fill="#0b1730">mudança no sistema</text><rect x="220" y="35" width="160" height="50" rx="8" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="300" y="55" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">8.5.6 — Mudanças Operac.</text><text x="300" y="72" text-anchor="middle" font-size="8" fill="#0b1730">Escopo específico: mudanças</text><text x="300" y="82" text-anchor="middle" font-size="8" fill="#0b1730">na produção/provisão</text><rect x="60" y="110" width="280" height="45" rx="8" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="1"/><text x="200" y="128" text-anchor="middle" font-size="9" fill="#0b1730" font-weight="bold">Ambas exigem: avaliar impacto + planejar + aprovar + verificar</text><text x="200" y="145" text-anchor="middle" font-size="8" fill="#0b1730">Mudanças não planejadas = maior fonte de não conformidades</text><line x1="100" y1="85" x2="140" y2="110" stroke="#0b1730" stroke-width="0.8" stroke-dasharray="3 2"/><line x1="300" y1="85" x2="260" y2="110" stroke="#0b1730" stroke-width="0.8" stroke-dasharray="3 2"/></svg><figcaption>As duas cláusulas de gestão de mudanças: 6.3 (SGQ) e 8.5.6 (operacional)</figcaption></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A cláusula 6.3 exige que mudanças no SGQ sejam planejadas considerando propósito, consequências, integridade e recursos." data-fb-nok="Incorreto. Mudanças no SGQ devem ser planejadas — avaliar propósito, consequências, integridade do sistema e recursos disponíveis."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Ao trocar um fornecedor de materia-prima, o que a cláusula 6.3 exige?</div><button class="qi-option" data-key="a">Apenas comunicar o organismo certificador sobre a troca</button><button class="qi-option" data-key="b">Nenhuma ação específica — fornecedores são tratados só na cláusula 8.4</button><button class="qi-option" data-key="c">Planejar a mudança avaliando propósito, impactos, integridade do SGQ e recursos</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Formulário de gestão de mudanças</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 3.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod3}, 'caso-pratico-planejamento', 'Caso Prático — Planejamento do SGQ numa Metalúrgica', '30 min', 4, ${`
<h2>Caso Prático — Planejamento Completo do SGQ</h2>

<p>Vamos consolidar tudo que vimos nas cláusulas 4, 5 e 6 com um caso prático completo. Acompanhe a jornada da <strong>UsinaMax Ltda.</strong>, uma metalúrgica ficticia (mas baseada em casos reais) que decidiu implantar a ISO 9001:2015.</p>

<h3>Perfil da empresa</h3>

<ul>
  <li><strong>Razão social:</strong> UsinaMax Usinagem de Precisão Ltda.</li>
  <li><strong>Localização:</strong> Caxias do Sul - RS</li>
  <li><strong>Funcionários:</strong> 62</li>
  <li><strong>Faturamento anual:</strong> R$ 12 milhoes</li>
  <li><strong>Produtos:</strong> peças usinadas em açocarbono e inox para indústria automotiva e de máquinas agrícolas</li>
  <li><strong>Parque industrial:</strong> 8 tornos CNC, 3 centros de usinagem, 1 retifica, setor de metrologia</li>
</ul>

<h3>Passo 1 — Análise de contexto (cláusula 4.1)</h3>

<p>O comite de implantação (diretoria + gerentes + coordenador de qualidade) realizou uma análise SWOT:</p>

<table>
  <tr><th>Forças</th><th>Fraquezas</th></tr>
  <tr><td>Parque de máquinas moderno (CNC 5 eixos)</td><td>Alta rotatividade de operadores (turnover 30%)</td></tr>
  <tr><td>Laboratório de metrologia próprio</td><td>Sem sistema ERP integrado</td></tr>
  <tr><td>20 anos de experiência no mercado</td><td>Dependência de 3 clientes (70% do faturamento)</td></tr>
  <tr><td>Localização no polo metal-mecânico</td><td>Documentação informal (muito conhecimento "na cabeca")</td></tr>
</table>

<table>
  <tr><th>Oportunidades</th><th>Ameaças</th></tr>
  <tr><td>Setor de energia eolica buscando fornecedores</td><td>Concorrência de importados chineses</td></tr>
  <tr><td>Demanda crescente por peças de alta precisão</td><td>Escassez de operadores CNC qualificados</td></tr>
  <tr><td>Indústria 4.0 — integração com sistemas dos clientes</td><td>Variação cambial no custo de ferramental importado</td></tr>
</table>

<h3>Passo 2 — Partes interessadas (cláusula 4.2)</h3>

<p>Foram identificadas 7 partes interessadas pertinentes:</p>

<ol>
  <li><strong>Clientes (montadoras + fabricantes de máquinas):</strong> peças conforme especificação, prazo, CPK mínimo, certificados de material.</li>
  <li><strong>Colaboradores:</strong> salário competitivo, segurança, treinamento, perspectiva de crescimento.</li>
  <li><strong>Fornecedores de materia-prima:</strong> previsão de demanda, pagamento em dia.</li>
  <li><strong>Socios:</strong> rentabilidade mínima de 10%, crescimento sustentável.</li>
  <li><strong>Organismos reguladores (MTE, FEPAM):</strong> conformidade com NRs e licenca ambiental.</li>
  <li><strong>Comunidade:</strong> baixo impacto de ruido (fábrica fica em zona mista).</li>
  <li><strong>Organismo certificador:</strong> atendimento aos requisitos ISO 9001.</li>
</ol>

<h3>Passo 3 — Escopo (cláusula 4.3)</h3>

<p>"O SGQ da UsinaMax abrange a usinagem de precisão de peças em açocarbono e inoxidável para os setores automotivo e de máquinas agrícolas, incluindo programação CNC, usinagem, tratamento térmico (terceirizado com controle) e inspeção final, realizados na unidade de Caxias do Sul - RS."</p>

<p>Cláusula 8.3 (Projeto) declarada não aplicável — a empresa fábrica conforme especificação/desenho do cliente, sem desenvolver produtos próprios.</p>

<h3>Passo 4 — Mapa de processos (cláusula 4.4)</h3>

<div class="diagram"><svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg"><text x="200" y="16" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">UsinaMax — Mapa de Processos (12 processos)</text><rect x="100" y="24" width="200" height="24" rx="5" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="200" y="40" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold">GESTAO: Planej. Estratégico | Gestão Qualidade</text><rect x="10" y="60" width="65" height="50" rx="5" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="42" y="80" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Vendas/</text><text x="42" y="90" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Orçamento</text><rect x="82" y="60" width="55" height="50" rx="5" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="109" y="80" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Progr.</text><text x="109" y="90" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">CNC</text><rect x="144" y="60" width="60" height="50" rx="5" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="174" y="85" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Usinagem</text><rect x="211" y="60" width="60" height="50" rx="5" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="241" y="80" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Inspeção/</text><text x="241" y="90" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Metrologia</text><rect x="278" y="60" width="60" height="50" rx="5" fill="#16a34a" opacity="0.1" stroke="#16a34a" stroke-width="1"/><text x="308" y="85" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Expedição</text><defs><marker id="arrCS" markerWidth="5" markerHeight="4" refX="5" refY="2" orient="auto"><path d="M0 0 L5 2 L0 4" fill="#0b1730"/></marker></defs><line x1="75" y1="85" x2="82" y2="85" stroke="#0b1730" stroke-width="0.8" marker-end="url(#arrCS)"/><line x1="137" y1="85" x2="144" y2="85" stroke="#0b1730" stroke-width="0.8" marker-end="url(#arrCS)"/><line x1="204" y1="85" x2="211" y2="85" stroke="#0b1730" stroke-width="0.8" marker-end="url(#arrCS)"/><line x1="271" y1="85" x2="278" y2="85" stroke="#0b1730" stroke-width="0.8" marker-end="url(#arrCS)"/><text x="200" y="125" text-anchor="middle" font-size="8" fill="#16a34a">CORE (realização de valor)</text><rect x="30" y="138" width="340" height="24" rx="5" fill="#eab308" opacity="0.12" stroke="#eab308" stroke-width="1.5"/><text x="200" y="154" text-anchor="middle" font-size="8" fill="#eab308" font-weight="bold">APOIO: Compras | Almoxarifado | Manutenção | RH | Terceirizados</text><text x="5" y="85" text-anchor="middle" font-size="7" fill="#0b1730" font-weight="bold">C</text><text x="5" y="92" text-anchor="middle" font-size="7" fill="#0b1730" font-weight="bold">L</text><text x="345" y="85" text-anchor="middle" font-size="7" fill="#0b1730" font-weight="bold">C</text><text x="345" y="92" text-anchor="middle" font-size="7" fill="#0b1730" font-weight="bold">L</text><text x="200" y="185" text-anchor="middle" font-size="8" fill="#0b1730" font-style="italic">CL = Cliente (entrada e saída do fluxo de valor)</text></svg><figcaption>Mapa de processos da UsinaMax: 2 de gestão, 5 core e 5 de apoio</figcaption></div>

<p>12 processos mapeados:</p>

<ul>
  <li><strong>Gestão:</strong> Planejamento Estratégico, Gestão da Qualidade</li>
  <li><strong>Core:</strong> Vendas/Orçamento, Programação CNC, Usinagem, Inspeção/Metrologia, Expedição</li>
  <li><strong>Apoio:</strong> Compras, Almoxarifado, Manutenção, Gestão de Pessoas, Controle de Terceirizados</li>
</ul>

<h3>Passo 5 — Política da qualidade (cláusula 5.2)</h3>

<p>"A UsinaMax se compromete a fornecer peças usinadas dentro das tolerâncias especificadas, no prazo acordado, buscando continuamente a redução de retrabalho e refugo. Investimos na qualificação dos nossos colaboradores e na modernização do nosso parque fabril para atender e superar as expectativas dos nossos clientes. Estamos comprometidos com a melhoria contínua do nosso Sistema de Gestão da Qualidade e com o atendimento aos requisitos legais e regulamentares aplicáveis."</p>

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
  <tr><td>Reduzir refugo</td><td>De 4,2% para 2,5%</td><td>% refugo mensal</td><td>Gerente Industrial</td></tr>
  <tr><td>Melhorar pontualidade</td><td>De 86% para 95%</td><td>% pedidos no prazo</td><td>PCP</td></tr>
  <tr><td>Reduzir reclamações</td><td>De 15 para 8/semestre</td><td>Nr. reclamações</td><td>Qualidade</td></tr>
  <tr><td>Capacitar equipe</td><td>40h/funcionário/ano</td><td>Horas treinamento</td><td>RH</td></tr>
</table>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Observe como cada passo se conecta ao anterior. O contexto revela a escassez de mão de obra, que vira risco, que vira objetivo de treinamento. A dependência de poucos clientes aparece na SWOT, vira risco e vira ação estratégica de diversificação. Isso é a norma funcionando como sistema integrado — não como lista de requisitos isolados.</div></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A análise de contexto (SWOT) alimenta a identificação de riscos, que alimenta os objetivos e planos de ação — tudo conectado." data-fb-nok="Incorreto. O planejamento do SGQ e integrado: contexto → riscos → objetivos → ações. Cada passo alimenta o seguinte."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">No caso da UsinaMax, como a alta rotatividade de operadores (identificada na SWOT) se conecta ao planejamento do SGQ?</div><button class="qi-option" data-key="a">Não se conecta — rotatividade e problema de RH, não do SGQ</button><button class="qi-option" data-key="b">Aparece como fraqueza na SWOT, vira risco na cláusula 6.1 e gera objetivo de treinamento na 6.2</button><button class="qi-option" data-key="c">E tratada apenas na política da qualidade como declaração de intenção</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Kit completo de planejamento do SGQ (contexto + partes interessadas + riscos + objetivos)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 4 — Apoio e Operação (2.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod4Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Apoio e Operação', 'Cláusulas 7 e 8: recursos, competência, informação documentada, controle operacional, fornecedores e produção.', 4)
    RETURNING id
  `;
  const mod4 = mod4Rows[0].id;

  // --- Aula 4.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'recursos-competencia', 'Cláusula 7 — Recursos, Competência e Conscientização', '40 min', 1, ${`
<h2>Cláusula 7 — Apoio: Recursos, Competência e Conscientização</h2>

<p>A cláusula 7 trata de tudo que a organização precisa disponibilizar para que o SGQ funcione: pessoas, infraestrutura, ambiente, recursos de monitoramento, conhecimento organizacional, competência, conscientização e comunicação.</p>

<div class="diagram">
  <svg viewBox="0 0 440 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="155" y="75" width="130" height="50" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="220" y="97" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">Cláusula 7</text>
    <text x="220" y="113" text-anchor="middle" fill="#ffffff" font-size="10">Apoio ao SGQ</text>
    <rect x="10" y="10" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="65" y="27" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.1 Recursos</text>
    <text x="65" y="41" text-anchor="middle" fill="#93c5fd" font-size="8">Pessoas · Infra · Ambiente</text>
    <rect x="130" y="10" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="185" y="27" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.1.5 Calibração</text>
    <text x="185" y="41" text-anchor="middle" fill="#93c5fd" font-size="8">Monitoramento · Medição</text>
    <rect x="250" y="10" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="305" y="27" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.1.6 Conhecimento</text>
    <text x="305" y="41" text-anchor="middle" fill="#93c5fd" font-size="8">Organizacional</text>
    <rect x="10" y="150" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#16a34a" stroke-width="1.5"/>
    <text x="65" y="167" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.2 Competência</text>
    <text x="65" y="181" text-anchor="middle" fill="#86efac" font-size="8">Matriz · Treinamento</text>
    <rect x="130" y="150" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#16a34a" stroke-width="1.5"/>
    <text x="185" y="167" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.3 Conscientização</text>
    <text x="185" y="181" text-anchor="middle" fill="#86efac" font-size="8">Política · Objetivos</text>
    <rect x="250" y="150" width="110" height="40" rx="4" fill="#1e3a5f" stroke="#16a34a" stroke-width="1.5"/>
    <text x="305" y="167" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">7.4 Comunicação</text>
    <text x="305" y="181" text-anchor="middle" fill="#86efac" font-size="8">Interna · Externa</text>
    <line x1="65" y1="50" x2="180" y2="75" stroke="#2563eb" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="185" y1="50" x2="210" y2="75" stroke="#2563eb" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="305" y1="50" x2="245" y2="75" stroke="#2563eb" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="65" y1="150" x2="180" y2="125" stroke="#16a34a" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="185" y1="150" x2="210" y2="125" stroke="#16a34a" stroke-width="1" stroke-dasharray="3,3"/>
    <line x1="305" y1="150" x2="245" y2="125" stroke="#16a34a" stroke-width="1" stroke-dasharray="3,3"/>
  </svg>
  <figcaption>Estrutura da Cláusula 7 — subcláusulas de Apoio do SGQ</figcaption>
</div>

<h3>7.1 — Recursos</h3>

<h3>7.1.1 — Generalidades</h3>

<p>A organização deve determinar e prover os recursos necessários para o SGQ. Isso inclui considerar as capacidades e restrições dos recursos internos existentes e o que precisa ser obtido de provedores externos.</p>

<div class="accordion-lesson">
  <div class="acc-item">
    <button class="acc-trigger">7.1.2 — Pessoas <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>A organização deve determinar e prover as pessoas necessárias para a implementação eficaz do SGQ e para a operação e controle de seus processos. Na prática: você tem gente suficiente e qualificada para fazer o que precisa ser feito?</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">7.1.3 — Infraestrutura <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Edifícios, utilidades, equipamentos (hardware e software), transporte, tecnologia da informação e comunicação. A infraestrutura deve ser determinada, provida e mantida.</p><div class="example"><strong>Exemplo prático — Metalúrgica:</strong> Um torno CNC que quebra frequentemente e gera peças fora de tolerância é um problema de infraestrutura. A norma exige que a empresa identifique a infraestrutura necessária para a conformidade dos produtos e a mantenha — traduzindo-se em programas de manutenção preventiva, calibração de máquinas e atualização de software CAM.</div></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">7.1.4 — Ambiente para operação de processos <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Combinação de fatores humanos e físicos: temperatura, umidade, iluminação, fluxo de ar, higiene, ruído — mas também fatores psicológicos como estresse, burnout, conflitos. A organização deve determinar, prover e manter o ambiente necessário.</p><div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> A sala de embalagem precisa de temperatura controlada (máx. 15 °C), pressão positiva, iluminação adequada para inspeção visual e operadores sem estresse excessivo (para não cometerem erros de rotulagem). Tudo isso é "ambiente para operação de processos".</div></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">7.1.6 — Conhecimento organizacional <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Novidade da versão 2015. A organização deve determinar o conhecimento necessário para a operação de seus processos e para alcançar conformidade. Esse conhecimento deve ser mantido e disponibilizado na extensão necessária.</p><p>Na prática, isso trata do problema do "conhecimento na cabeça das pessoas". Se o único operador que sabe programar uma máquina específica sair da empresa, o que acontece?</p><div class="example"><strong>Exemplo prático — Construtora:</strong> Um mestre de obra com 30 anos de experiência sabia "de cabeça" a dosagem ideal de concreto para cada tipo de obra. Quando se aposentou, a empresa teve problemas sérios de qualidade por 3 meses até treinar um substituto. Isso é falha na gestão do conhecimento organizacional. A ação: documentar as dosagens, criar banco de dados de lições aprendidas e implantar programa de mentoria entre mestres experientes e novos.</div></div>
  </div>
</div>

<h3>7.1.5 — Recursos de monitoramento e medição</h3>

<p>Quando monitoramento ou medição é usado para verificar a conformidade de produtos/serviços, a organização deve assegurar que os recursos sejam adequados e mantidos. Isso inclui a famosa <strong>calibração</strong>.</p>

<p>Quando a rastreabilidade de medição é um requisito (legal, do cliente ou definido pela organização), os instrumentos de medição devem ser:</p>

<ul>
  <li>Calibrados ou verificados em intervalos especificados, contra padrões rastreáveis.</li>
  <li>Identificados quanto à sua situação de calibração.</li>
  <li>Protegidos contra ajustes, danos ou deterioração que invalidem a calibração.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A calibração é um dos itens mais auditados. O auditor vai ao chão de fábrica, pega um paquímetro da bancada do operador e verifica: está identificado? A etiqueta de calibração está válida? Onde está o certificado de calibração? Se o instrumento estiver com calibração vencida e estiver sendo usado para inspeção de produto, é não conformidade imediata.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma metalúrgica no interior de São Paulo produzia eixos de transmissão para montadoras. Durante três meses, o paquímetro principal da linha de inspeção final estava com calibração vencida há 47 dias — ninguém percebeu porque a etiqueta ficava encoberta pela capa de proteção. Resultado: 1.200 peças entregues com folga dimensional fora do especificado. A montadora detectou na auditoria de recebimento, gerou uma devolução total e exigiu análise de causa raiz formal. O custo de retrabalho e transporte reverso superou R$ 85 mil. A causa raiz? Falta de controle de vencimento no sistema — a empresa registrava calibração em planilha Excel sem alertas automáticos.</p>
</div>

<h3>7.2 — Competência</h3>

<p>A organização deve determinar a competência necessária para cada função que afeta o desempenho da qualidade, assegurar que as pessoas sejam competentes (educação, treinamento ou experiência), tomar ações para adquirir competência (quando necessário) e reter informação documentada como evidência.</p>

<p>Na prática, isso se traduz em:</p>

<ul>
  <li><strong>Matriz de competências:</strong> para cada função, quais competências são necessárias.</li>
  <li><strong>Avaliação de competências:</strong> cada pessoa atende aos requisitos da sua função?</li>
  <li><strong>Plano de treinamento:</strong> para fechar as lacunas identificadas.</li>
  <li><strong>Registros:</strong> certificados, listas de presença, avaliações de eficácia.</li>
</ul>

<p>O que incluir em uma matriz de competências eficaz:</p>
<ul class="checklist">
  <li><span class="ck-box"></span>Lista de funções/cargos que impactam a qualidade</li>
  <li><span class="ck-box"></span>Competências técnicas obrigatórias por função</li>
  <li><span class="ck-box"></span>Nível exigido por competência (básico / intermediário / avançado)</li>
  <li><span class="ck-box"></span>Avaliação individual de cada colaborador frente ao nível exigido</li>
  <li><span class="ck-box"></span>Gap identificado e ação prevista (treinamento, mentoria, remanejamento)</li>
  <li><span class="ck-box"></span>Evidência do treinamento realizado (certificado, lista de presença)</li>
  <li><span class="ck-box"></span>Avaliação de eficácia do treinamento</li>
</ul>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A cláusula 7.2 exige evidência de competência — registros como certificados, listas de presença e avaliações de eficácia são obrigatórios." data-fb-nok="Não é isso. Além do treinamento, a cláusula 7.2 exige que a organização retenha informação documentada como evidência de competência.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Uma empresa treinou todos os operadores de solda em um novo processo. Para atender a cláusula 7.2 da ISO 9001:2015, o que é obrigatório além do treinamento em si?</div>
  <button class="qi-option" data-key="a">Publicar os certificados no mural da fábrica</button>
  <button class="qi-option" data-key="b">Contratar uma empresa externa para conduzir o treinamento</button>
  <button class="qi-option" data-key="c">Reter registros como evidência de competência (certificados, lista de presença, avaliação de eficácia)</button>
  <button class="qi-option" data-key="d">Repetir o treinamento semestralmente independentemente dos resultados</button>
  <div class="qi-feedback"></div>
</div>

<h3>7.3 — Conscientização</h3>

<p>As pessoas que trabalham sob o controle da organização devem estar conscientes da política da qualidade, dos objetivos pertinentes, da sua contribuição para o SGQ e das consequências de não atender os requisitos. Não basta treinar — a pessoa precisa entender o "por que".</p>

<h3>7.4 — Comunicação</h3>

<p>A organização deve determinar as comunicações internas e externas pertinentes ao SGQ: o que comunicar, quando, para quem, como e quem comunica. Um quadro de gestão à vista no chão de fábrica com indicadores atualizados é um exemplo simples e eficaz de comunicação do SGQ.</p>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Conscientização não é sinônimo de treinamento. Um operador pode ter participado do treinamento sobre a política da qualidade e mesmo assim não saber como seu trabalho impacta a satisfação do cliente. A pergunta que o auditor faz diretamente ao operador é: "O que acontece se você não seguir esta instrução de trabalho?" A resposta precisa ser concreta — não apenas "fica ruim".</div></div>

<div class="template-box"><span>Download: Matriz de competências + plano de treinamento anual</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'informacao-documentada', 'Cláusula 7.5 — Informação Documentada', '30 min', 2, ${`
<h2>Cláusula 7.5 — Informação Documentada</h2>

<p>A informação documentada é o "esqueleto" do SGQ. É tudo aquilo que precisa ser registrado, controlado e mantido acessível. Na versão 2015, esse conceito ficou muito mais flexível — e isso é uma grande vantagem, se bem utilizado.</p>

<div class="diagram">
  <svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="170" height="140" rx="8" fill="#1e3a5f" stroke="#2563eb" stroke-width="2"/>
    <text x="95" y="45" text-anchor="middle" fill="#93c5fd" font-size="10" font-weight="bold">MANTER</text>
    <text x="95" y="60" text-anchor="middle" fill="#ffffff" font-size="9">(antigo: Documento)</text>
    <text x="95" y="82" text-anchor="middle" fill="#e2e8f0" font-size="8">· Política da qualidade</text>
    <text x="95" y="96" text-anchor="middle" fill="#e2e8f0" font-size="8">· Procedimentos</text>
    <text x="95" y="110" text-anchor="middle" fill="#e2e8f0" font-size="8">· Instruções de trabalho</text>
    <text x="95" y="124" text-anchor="middle" fill="#e2e8f0" font-size="8">· Escopo do SGQ</text>
    <text x="95" y="138" text-anchor="middle" fill="#93c5fd" font-size="8">→ Você ATUALIZA</text>
    <rect x="220" y="20" width="170" height="140" rx="8" fill="#1e3a5f" stroke="#16a34a" stroke-width="2"/>
    <text x="305" y="45" text-anchor="middle" fill="#86efac" font-size="10" font-weight="bold">RETER</text>
    <text x="305" y="60" text-anchor="middle" fill="#ffffff" font-size="9">(antigo: Registro)</text>
    <text x="305" y="82" text-anchor="middle" fill="#e2e8f0" font-size="8">· Certificados de calibração</text>
    <text x="305" y="96" text-anchor="middle" fill="#e2e8f0" font-size="8">· Relatórios de inspeção</text>
    <text x="305" y="110" text-anchor="middle" fill="#e2e8f0" font-size="8">· Atas de reunião</text>
    <text x="305" y="124" text-anchor="middle" fill="#e2e8f0" font-size="8">· Evidências de competência</text>
    <text x="305" y="138" text-anchor="middle" fill="#86efac" font-size="8">→ Você PRESERVA</text>
    <text x="200" y="10" text-anchor="middle" fill="#c5383c" font-size="11" font-weight="bold">Informação Documentada</text>
  </svg>
  <figcaption>Distinção entre "manter" (documentos vivos) e "reter" (registros históricos) na ISO 9001:2015</figcaption>
</div>

<h3>O que mudou em relação à versão 2008</h3>

<p>Na versão 2008, existiam três termos distintos: "documento", "registro" e "procedimento documentado" (6 obrigatórios). Na versão 2015, tudo foi unificado sob o termo <strong>informação documentada</strong>. A norma usa dois verbos para diferenciar:</p>

<ul>
  <li><strong>"Manter" informação documentada:</strong> equivale ao antigo "documento" — algo que você atualiza (política, procedimento, instrução de trabalho).</li>
  <li><strong>"Reter" informação documentada:</strong> equivale ao antigo "registro" — evidência de que algo foi feito (relatório de inspeção, ata de reunião, certificado de calibração).</li>
</ul>

<h3>O que a norma obriga a documentar</h3>

<p>A ISO 9001:2015 exige informação documentada em pontos específicos. Aqui está a lista completa:</p>

<table>
  <tr><th>Cláusula</th><th>Tipo</th><th>O que documentar</th></tr>
  <tr><td>4.3</td><td>Manter</td><td>Escopo do SGQ</td></tr>
  <tr><td>4.4</td><td>Manter</td><td>Informação para apoiar a operação dos processos</td></tr>
  <tr><td>4.4</td><td>Reter</td><td>Confiança de que os processos são realizados conforme planejado</td></tr>
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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Criar</strong><br>Elaborar o documento seguindo modelo padrão</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Revisar</strong><br>Verificação técnica pelo responsável da área</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Aprovar</strong><br>Autoridade competente assina/válida</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Distribuir</strong><br>Disponibilizar para quem precisa usar</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Revisar</strong><br>Atualizar quando necessário, controlar versão</div></div>
  <div class="step-item"><div class="step-content"><strong>6. Arquivar</strong><br>Obsoletos identificados e segregados; registros retidos pelo prazo definido</div></div>
</div>

<h3>Controle de informação documentada (7.5.3)</h3>

<p>A informação documentada deve ser controlada para assegurar que esteja:</p>

<ul>
  <li><strong>Disponível e adequada</strong> para uso, onde e quando necessário.</li>
  <li><strong>Protegida</strong> contra perda de confidencialidade, uso indevido ou perda de integridade.</li>
</ul>

<p>O controle inclui: distribuição, acesso, recuperação, armazenamento, preservação (incluindo legibilidade), controle de mudanças e retenção/disposição.</p>

<div class="tabs">
  <div class="tab-btns">
    <button class="tab-btn active">Sistema em papel</button>
    <button class="tab-btn">Sistema digital</button>
  </div>
  <div class="tab-panel active">
    <p><strong>Controle em papel:</strong> Funciona para empresas pequenas com poucos documentos. Requer: carimbo "cópia controlada", lista de distribuição manual, pasta física "VIGENTE" separada de "OBSOLETO", registro de quem tem cópia. Principal risco: alguém usa versão desatualizada sem saber.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Controle digital (SharePoint, GED, etc.):</strong> Controle de versão automático, notificações de atualização, acesso por perfil, histórico de alterações. Operadores acessam em tablet no chão de fábrica — sempre a versão vigente. Custo: muitas vezes zero com ferramentas já contratadas (Microsoft 365, Google Workspace).</p>
  </div>
</div>

<div class="callout"><strong>Importante:</strong> Não existe mais obrigação de ter um "procedimento de controle de documentos" formal. Porém, a organização precisa demonstrar que controla sua informação documentada de alguma forma. Um sistema eletrônico com controle de versão e permissões de acesso atende perfeitamente.</div>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> A UsinaMax migrou de documentos Word impressos (com carimbo "cópia controlada") para um sistema digital. Todos os documentos ficam no SharePoint com controle de versão automático, aprovação por workflow e acesso restrito por função. Os operadores acessam instruções de trabalho em tablets no chão de fábrica — sempre a versão vigente, sem risco de usar documento obsoleto. Custo: R$ 0 (já tinham licença Microsoft 365).</div>

<h3>Quanto documentar?</h3>

<p>A norma dá liberdade, mas isso não significa "não documentar nada". A regra prática:</p>

<ul>
  <li>Documente tudo que a norma exige (tabela acima).</li>
  <li>Documente processos onde o erro tem alto impacto (instruções de trabalho críticas).</li>
  <li>Documente o que precisa ser consistente entre turnos/pessoas.</li>
  <li>NÃO documente o que é óbvio para profissionais qualificados.</li>
</ul>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Excesso de documentação</h4><ul><li>Procedimento de "como usar a impressora"</li><li>Instrução para tarefas triviais e óbvias</li><li>Documentos nunca atualizados (ficam obsoletos)</li><li>Burocracia que atrasa o trabalho real</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Documentação adequada</h4><ul><li>Tudo que a norma exige explicitamente</li><li>Processos críticos e de alto risco</li><li>Atividades que precisam ser consistentes</li><li>Documentos vivos, atualizados e usados</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Exato! Certificado de calibração é um registro que evidência que algo foi feito — portanto você RETÉM (não atualiza, mas preserva como evidência histórica)." data-fb-nok="Pense assim: você volta a um certificado de calibração e o reescreve? Não — você guarda como evidência do que foi feito. Isso é RETER.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Um certificado de calibração de um paquímetro é um exemplo de informação documentada que a organização deve:</div>
  <button class="qi-option" data-key="a">Manter — porque precisa ser atualizado periodicamente</button>
  <button class="qi-option" data-key="b">Reter — porque é evidência de que a calibração foi realizada</button>
  <button class="qi-option" data-key="c">Destruir após nova calibração ser feita</button>
  <button class="qi-option" data-key="d">Publicar no site da empresa para transparência</button>
  <div class="qi-feedback"></div>
</div>

<div class="template-box"><span>Download: Lista mestra de informação documentada + template de controle</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'operacao-requisitos', 'Cláusula 8.1 a 8.4 — Planejamento Operacional e Fornecedores', '40 min', 3, ${`
<h2>Cláusula 8 — Operação (Parte 1: Planejamento, Requisitos e Fornecedores)</h2>

<p>A cláusula 8 é a mais extensa da norma e cobre toda a operação — desde a determinação dos requisitos do produto/serviço até a entrega e pós-entrega. É aqui que "a borracha encontra o asfalto".</p>

<div class="diagram">
  <svg viewBox="0 0 440 160" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="65" width="70" height="40" rx="4" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="40" y="82" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Cliente</text>
    <text x="40" y="96" text-anchor="middle" fill="#93c5fd" font-size="7">Requisitos</text>
    <polygon points="80,85 90,80 90,90" fill="#2563eb"/>
    <rect x="93" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="130" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">8.2</text>
    <text x="130" y="87" text-anchor="middle" fill="#93c5fd" font-size="7">Análise crítica</text>
    <text x="130" y="99" text-anchor="middle" fill="#93c5fd" font-size="7">requisitos</text>
    <polygon points="173,85 183,80 183,90" fill="#2563eb"/>
    <rect x="186" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="223" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">8.4</text>
    <text x="223" y="87" text-anchor="middle" fill="#93c5fd" font-size="7">Controle de</text>
    <text x="223" y="99" text-anchor="middle" fill="#93c5fd" font-size="7">fornecedores</text>
    <polygon points="266,85 276,80 276,90" fill="#2563eb"/>
    <rect x="279" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="314" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">8.1</text>
    <text x="314" y="87" text-anchor="middle" fill="#93c5fd" font-size="7">Planejamento</text>
    <text x="314" y="99" text-anchor="middle" fill="#93c5fd" font-size="7">operacional</text>
    <polygon points="359,85 369,80 369,90" fill="#16a34a"/>
    <rect x="372" y="65" width="63" height="40" rx="4" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="403" y="82" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Produto</text>
    <text x="403" y="96" text-anchor="middle" fill="#86efac" font-size="7">Serviço OK</text>
    <rect x="138" y="125" width="88" height="22" rx="3" fill="#1a1a2e" stroke="#c5383c" stroke-width="1"/>
    <line x1="138" y1="115" x2="138" y2="125" stroke="#c5383c" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="182" y="140" text-anchor="middle" fill="#fca5a5" font-size="7">Insumos externos</text>
  </svg>
  <figcaption>Fluxo do planejamento operacional: do requisito do cliente ao produto entregue</figcaption>
</div>

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

<h3>8.2.1 — Comunicação com o cliente</h3>

<p>A comunicação deve incluir: informações sobre produtos/serviços, consultas/contratos/pedidos (incluindo mudanças), retroalimentação do cliente (incluindo reclamações), propriedade do cliente e requisitos de contingência.</p>

<h3>8.2.2 — Determinação de requisitos</h3>

<p>Ao determinar os requisitos, a organização deve assegurar que:</p>

<ul>
  <li>Requisitos do produto/serviço estejam definidos (incluindo legais e regulamentares).</li>
  <li>A organização pode atender as declarações feitas sobre o que oferece.</li>
</ul>

<h3>8.2.3 — Análise crítica dos requisitos</h3>

<p>Antes de se comprometer a fornecer, a organização deve fazer uma análise crítica para assegurar que tem capacidade de atender. Essa análise deve cobrir: requisitos especificados pelo cliente, requisitos não declarados mas necessários, requisitos legais e requisitos da própria organização.</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Receber pedido/consulta</strong><br>Cliente envia especificação, desenho ou escopo do serviço</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Verificar capacidade técnica</strong><br>Temos máquinas, processos e competência para atender?</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Verificar requisitos legais</strong><br>Há normas técnicas, certificações ou laudos obrigatórios?</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Verificar prazo e disponibilidade</strong><br>Conseguimos entregar no prazo com os recursos atuais?</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Negociar divergências</strong><br>Se houver diferença entre o solicitado e o possível, alinhar ANTES de aceitar</div></div>
  <div class="step-item"><div class="step-content"><strong>6. Registrar e aceitar</strong><br>Reter evidência da análise realizada (8.2.3 exige registro)</div></div>
</div>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> Um cliente envia desenho de uma peça com tolerância de 0,005 mm. Antes de aceitar o pedido, o setor técnico analisa: temos máquina capaz dessa tolerância? O material está disponível? O prazo é viável? Há requisitos especiais (tratamento térmico, revestimento)? Essa é a análise crítica de requisitos. Se for aprovada, gera-se a ordem de produção. Se houver divergência, negocia-se com o cliente ANTES de aceitar.</div>

<div class="callout"><strong>Importante:</strong> Um erro clássico: aceitar o pedido do cliente sem análise crítica ("o vendedor prometeu, agora a produção se vira"). Isso gera atraso, retrabalho e insatisfação. A análise crítica evita que a empresa se comprometa com algo que não pode entregar.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma empresa de serviços de engenharia aceitou um contrato de retrofit elétrico em uma planta industrial. O vendedor garantiu prazo de 45 dias sem consultar a equipe técnica. Ao iniciar, descobriu-se que parte dos equipamentos precisava de aprovação pela concessionária de energia — processo que levaria 60 dias sozinho. A obra atrasou 3 meses, gerou multa contratual de R$ 120 mil e perdeu a indicação do cliente para outros projetos. Uma análise crítica de requisitos de 2 horas teria identificado o gargalo antes da assinatura do contrato.</p>
</div>

<h3>8.4 — Controle de processos, produtos e serviços providos externamente</h3>

<p>Em linguagem simples: gestão de fornecedores e terceirizados. A norma exige que a organização controle processos, produtos e serviços de fornecedores externos quando:</p>

<ul>
  <li>São incorporados nos próprios produtos/serviços.</li>
  <li>São fornecidos diretamente ao cliente em nome da organização.</li>
  <li>Um processo é fornecido externamente por decisão da organização.</li>
</ul>

<h3>8.4.1 — Critérios de avaliação, seleção e monitoramento</h3>

<p>A organização deve definir critérios para avaliar, selecionar, monitorar e reavaliar fornecedores. Os critérios típicos:</p>

<table>
  <tr><th>Critério</th><th>O que avaliar</th><th>Evidência</th></tr>
  <tr><td>Qualidade</td><td>Histórico de não conformidades, certificações</td><td>IQF (Índice de Qualidade do Fornecedor), % rejeição</td></tr>
  <tr><td>Prazo</td><td>Pontualidade de entrega</td><td>% entregas no prazo</td></tr>
  <tr><td>Capacidade técnica</td><td>Parque de máquinas, equipe técnica</td><td>Auditoria de segunda parte, questionário</td></tr>
  <tr><td>Preço</td><td>Competitividade, estabilidade</td><td>Comparativo de mercado</td></tr>
  <tr><td>Atendimento</td><td>Responsividade, resolução de problemas</td><td>Avaliação qualitativa</td></tr>
</table>

<div class="tabs">
  <div class="tab-btns">
    <button class="tab-btn active">Classe A — Aprovado</button>
    <button class="tab-btn">Classe B — Monitorado</button>
    <button class="tab-btn">Classe C — Suspenso</button>
  </div>
  <div class="tab-panel active">
    <p><strong>Fornecedor Classe A (nota ≥ 80):</strong> Aprovado sem restrição. Inspeção de recebimento reduzida. Pode ser indicado para novos contratos. Reavaliação anual.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Fornecedor Classe B (nota 60–79):</strong> Aprovado com monitoramento intensificado. Inspeção de recebimento 100%. Plano de ação exigido para melhoria. Reavaliação semestral.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Fornecedor Classe C (nota &lt; 60):</strong> Suspenso — nenhum pedido novo até reabilitação. Deve apresentar plano de ação corretiva com prazo. Nova avaliação após implementação das ações.</p>
  </div>
</div>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Uma construtora classifica seus fornecedores em três categorias: A (aprovado sem restrição), B (aprovado com monitoramento intensificado) e C (reprovado/suspenso). A avaliação é semestral, baseada em: qualidade do material entregue (40%), pontualidade (30%), preço (15%) e atendimento (15%). Fornecedores com nota abaixo de 60 são suspensos. Fornecedores de materiais críticos (concreto, aço) passam por auditoria de segunda parte antes da aprovação.</div>

<h3>8.4.2 — Tipo e extensão do controle</h3>

<p>O nível de controle sobre o fornecedor deve ser proporcional ao impacto do produto/serviço fornecido na conformidade do produto final. Um fornecedor de canetas para o escritório não precisa do mesmo nível de controle que um fornecedor de matéria-prima crítica.</p>

<h3>8.4.3 — Informação para provedores externos</h3>

<p>A organização deve comunicar claramente ao fornecedor: requisitos do produto/serviço, métodos e processos, requisitos de aprovação, competência necessária, interações com o SGQ da organização e controle/monitoramento que será aplicado.</p>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! O nível de controle deve ser proporcional ao risco — fornecedor de material crítico exige muito mais rigor que fornecedor de itens de escritório." data-fb-nok="Reveja a cláusula 8.4.2: o controle deve ser proporcional ao impacto na conformidade do produto final. Não faz sentido aplicar o mesmo nível para todos.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Uma indústria alimentícia tem dois fornecedores: um de embalagem primária (contato direto com o alimento) e um de material de limpeza para o escritório. Como a ISO 9001:2015 orienta o controle desses fornecedores?</div>
  <button class="qi-option" data-key="a">Controle proporcional ao risco: embalagem primária exige critérios muito mais rigorosos</button>
  <button class="qi-option" data-key="b">Ambos devem passar pelo mesmo processo de avaliação e aprovação</button>
  <button class="qi-option" data-key="c">Somente fornecedores com ISO 9001 precisam ser avaliados</button>
  <button class="qi-option" data-key="d">Fornecedores de serviços não precisam de controle formal</button>
  <div class="qi-feedback"></div>
</div>

<div class="template-box"><span>Download: Formulário de avaliação de fornecedores + lista de fornecedores aprovados</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 4.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod4}, 'producao-liberacao', 'Cláusula 8.5 a 8.7 — Produção, Liberação e Controle de Não Conformes', '40 min', 4, ${`
<h2>Cláusula 8 — Operação (Parte 2: Produção, Liberação e Saídas Não Conformes)</h2>

<div class="diagram">
  <svg viewBox="0 0 440 170" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="65" width="70" height="40" rx="4" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="40" y="82" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Insumos</text>
    <text x="40" y="96" text-anchor="middle" fill="#93c5fd" font-size="7">Matéria-prima</text>
    <polygon points="80,85 90,80 90,90" fill="#2563eb"/>
    <rect x="93" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5"/>
    <text x="130" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Produção</text>
    <text x="130" y="87" text-anchor="middle" fill="#93c5fd" font-size="7">8.5.1 Condições</text>
    <text x="130" y="99" text-anchor="middle" fill="#93c5fd" font-size="7">controladas</text>
    <rect x="100" y="118" width="60" height="15" rx="2" fill="#1a1a2e" stroke="#c5383c" stroke-width="1"/>
    <text x="130" y="129" text-anchor="middle" fill="#fca5a5" font-size="6">Inspeção processo</text>
    <polygon points="173,85 183,80 183,90" fill="#2563eb"/>
    <rect x="186" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#16a34a" stroke-width="1.5"/>
    <text x="223" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Liberação</text>
    <text x="223" y="87" text-anchor="middle" fill="#86efac" font-size="7">8.6 Verificação</text>
    <text x="223" y="99" text-anchor="middle" fill="#86efac" font-size="7">final</text>
    <rect x="193" y="118" width="60" height="15" rx="2" fill="#1a1a2e" stroke="#16a34a" stroke-width="1"/>
    <text x="223" y="129" text-anchor="middle" fill="#86efac" font-size="6">Checklist OK?</text>
    <polygon points="266,85 276,80 276,90" fill="#16a34a"/>
    <rect x="279" y="65" width="70" height="40" rx="4" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="314" y="82" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">Entrega</text>
    <text x="314" y="96" text-anchor="middle" fill="#86efac" font-size="7">Produto OK</text>
    <line x1="223" y1="133" x2="223" y2="155" stroke="#c5383c" stroke-width="1" stroke-dasharray="2,2"/>
    <rect x="163" y="155" width="120" height="15" rx="3" fill="#c5383c" fill-opacity="0.2" stroke="#c5383c" stroke-width="1"/>
    <text x="223" y="166" text-anchor="middle" fill="#fca5a5" font-size="7">8.7 Não conforme: segregar / reparar / informar cliente</text>
    <rect x="360" y="55" width="75" height="60" rx="4" fill="#1e3a5f" stroke="#c5383c" stroke-width="1.5"/>
    <text x="397" y="74" text-anchor="middle" fill="#ffffff" font-size="8" font-weight="bold">8.5.2</text>
    <text x="397" y="87" text-anchor="middle" fill="#fca5a5" font-size="7">Identificação e</text>
    <text x="397" y="99" text-anchor="middle" fill="#fca5a5" font-size="7">rastreabilidade</text>
    <line x1="354" y1="85" x2="360" y2="85" stroke="#c5383c" stroke-width="1" stroke-dasharray="2,2"/>
  </svg>
  <figcaption>Fluxo de controle da produção: insumos → produção controlada → liberação → entrega (com desvio para não conformes)</figcaption>
</div>

<h3>8.5 — Produção e provisão de serviço</h3>

<h3>8.5.1 — Controle de produção e provisão de serviço</h3>

<p>A produção deve ser realizada sob condições controladas, incluindo:</p>

<ul>
  <li>Disponibilidade de informação documentada que defina as características do produto e as atividades a serem realizadas.</li>
  <li>Disponibilidade e uso de recursos de monitoramento e medição adequados.</li>
  <li>Implementação de atividades de monitoramento e medição em estágios apropriados.</li>
  <li>Uso de infraestrutura e ambiente adequados.</li>
  <li>Designação de pessoas competentes.</li>
  <li>Validação (e revalidação periódica) de processos cuja saída não possa ser verificada por monitoramento/medição subsequente.</li>
  <li>Implementação de ações para prevenir erro humano.</li>
  <li>Implementação de atividades de liberação, entrega e pós-entrega.</li>
</ul>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> Na linha de usinagem, "condições controladas" significa: (1) programa CNC validado e bloqueado (sem edição pelo operador), (2) instrução de trabalho visual na estação com sequência de operações, (3) paquímetro e micrômetro calibrados disponíveis, (4) medição a cada 10 peças conforme plano de controle, (5) operador treinado e qualificado para aquela operação, (6) ficha de setup preenchida antes de iniciar o lote.</div>

<h3>8.5.1 f — Validação de processos especiais</h3>

<div class="callout"><strong>Importante:</strong> Processos "especiais" são aqueles cujo resultado não pode ser verificado por inspeção depois. Exemplos clássicos: solda, tratamento térmico, pintura, colagem, pasteurização. Nesses processos, você precisa VALIDAR o processo (provar que ele é capaz de produzir resultados conformes) e controlar os parâmetros durante a execução, porque depois não há como verificar 100% sem destruir o produto.</div>

<div class="accordion-lesson">
  <div class="acc-item">
    <button class="acc-trigger">Solda — processo especial <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Qualificação do soldador (ex: AWS, ASME), procedimento de solda qualificado (WPS), registro de qualificação (PQR), controle de temperatura de pré e pós-aquecimento, inspeção por líquido penetrante ou ultrassom. Não dá para "abrir" a solda para ver se ficou boa — por isso o processo é validado antes.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">Tratamento térmico — processo especial <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Validação do forno (uniformidade de temperatura — AMS2750 para aeroespacial), registro dos ciclos (tempo, temperatura, atmosfera), teste de dureza em corpos de prova ou peças do lote. A variação de temperatura no forno pode comprometer todo o lote sem que seja visível externamente.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">Pintura eletrostática / anticorrosiva — processo especial <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Controle de espessura de camada (medidor de película seca), aderência (corte cruzado), preparação de superfície (jateamento grau Sa 2½), controle de temperatura e umidade ambiente durante aplicação. A falha de adesão só aparece meses depois em campo — quando a garantia já está em jogo.</p></div>
  </div>
</div>

<h3>8.5.2 — Identificação e rastreabilidade</h3>

<p>A organização deve usar meios adequados para identificar as saídas dos processos e identificar o status de monitoramento/medição (aprovado, reprovado, em análise). Quando a rastreabilidade for um requisito, a organização deve controlar a identificação única das saídas e reter informação documentada.</p>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma indústria de laticínios recebeu uma reclamação de cliente sobre sabor estranho em iogurte. Graças ao sistema de rastreabilidade por lote, em menos de 2 horas identificaram que o problema era do leite in natura do lote 2025-A-047, entregue por um fornecedor específico, processado na linha 3 no turno da tarde do dia 14. O recall foi cirúrgico: 3.200 unidades afetadas de um total de 180.000 em estoque — sem retirar o restante do mercado. Sem rastreabilidade, o recall teria sido total, com perda estimada de R$ 2,4 milhões. Com rastreabilidade: R$ 85 mil. O investimento no sistema: R$ 18 mil em etiquetas e software.</p>
</div>

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Cada lote de produção recebe um código único (ex: EMB-2025-0342) que permite rastrear: quais matérias-primas foram usadas (lote do fornecedor), qual linha de produção, qual turno, quais parâmetros de processo (temperatura, tempo), quais resultados de análise e para quais clientes o lote foi enviado. Se houver um recall, a empresa consegue identificar em minutos todos os clientes afetados.</div>

<h3>8.5.3 — Propriedade pertencente a clientes ou provedores externos</h3>

<p>Se a organização usa algo que pertence ao cliente ou ao fornecedor (matéria-prima do cliente, ferramental, propriedade intelectual, dados pessoais), deve identificar, verificar, proteger e salvaguardar essa propriedade. Se algo for perdido, danificado ou inadequado, deve comunicar ao proprietário e reter registros.</p>

<h3>8.5.4 — Preservação</h3>

<p>A organização deve preservar as saídas durante produção e provisão de serviço, na extensão necessária para assegurar conformidade. Isso inclui identificação, manuseio, embalagem, armazenamento e proteção.</p>

<h3>8.5.5 — Atividades pós-entrega</h3>

<p>Quando aplicável: garantia, assistência técnica, manutenção, reciclagem, disposição final. Deve considerar requisitos legais, consequências potenciais, vida útil, requisitos do cliente e retroalimentação.</p>

<h3>8.5.6 — Controle de mudanças</h3>

<p>Mudanças na produção devem ser analisadas criticamente e controladas para assegurar continuidade da conformidade. Reter informação documentada descrevendo os resultados da análise, as pessoas que autorizaram e as ações tomadas.</p>

<h3>8.6 — Liberação de produtos e serviços</h3>

<p>A organização deve implementar arranjos planejados para verificar que os requisitos foram atendidos. A liberação não deve prosseguir até que os arranjos planejados tenham sido satisfatoriamente concluídos, a menos que aprovado por autoridade pertinente (e pelo cliente, quando aplicável).</p>

<p>A informação documentada de liberação deve incluir: evidência de conformidade com critérios de aceitação e rastreabilidade a quem autorizou a liberação.</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Verificar critérios de aceitação</strong><br>Comparar resultado com especificação (dimensional, visual, funcional)</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Preencher checklist de liberação</strong><br>Todos os pontos do plano de controle foram executados?</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Identificar status</strong><br>Produto aprovado → etiqueta verde / aprovado no sistema</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Assinar/registrar autorização</strong><br>Quem liberou, quando, contra qual critério</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Liberar para expedição</strong><br>Somente após registro de liberação — nunca "informalizado"</div></div>
</div>

<div class="example"><strong>Exemplo prático — Construtora:</strong> Antes de concretar uma laje, o engenheiro confere: armadura conforme projeto (inspeção visual + medição), formas niveladas e estanques, escoramentos verificados, concreto testado (slump test no recebimento). Somente após todas as verificações estarem OK e o engenheiro assinar a checklist, a concretagem é liberada. Esse é o processo de liberação — e se não for seguido, os riscos estruturais são gravíssimos.</div>

<h3>8.7 — Controle de saídas não conformes</h3>

<p>Quando uma saída não atende aos requisitos, a organização deve assegurar que seja identificada e controlada para prevenir uso ou entrega não intencional. As disposições possíveis:</p>

<ul>
  <li><strong>Correção:</strong> retrabalhar ou reparar para tornar conforme.</li>
  <li><strong>Segregação, contenção, retorno ou suspensão:</strong> impedir que o produto não conforme siga adiante.</li>
  <li><strong>Informar o cliente.</strong></li>
  <li><strong>Obter autorização de aceitação sob concessão:</strong> o cliente aceita o produto mesmo fora da especificação.</li>
</ul>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Segregação inadequada</h4><ul><li>Peças reprovadas misturadas com aprovadas</li><li>Sem identificação visual clara (etiqueta, cor)</li><li>Área de não conformes sem delimitação física</li><li>Produto não conforme sem registro de disposição</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Segregação adequada</h4><ul><li>Área física demarcada (caixa vermelha, prateleira "REJEITADO")</li><li>Etiqueta de não conforme com número de RNC</li><li>Registro do defeito, quantidade e data</li><li>Disposição documentada (sucata, retrabalho, devolução, concessão)</li></ul></div>
</div>

<div class="callout"><strong>Importante:</strong> A segregação e identificação de produto não conforme é crítica. Peças rejeitadas devem ir para uma área identificada (caixa vermelha, prateleira demarcada) para que ninguém as use por engano. Misturar peças boas com ruins é um dos erros mais graves que pode ocorrer numa operação.</div>

<div class="quiz-inline" data-correct="d" data-fb-ok="Correto! A concessão (aceitação sob desvio) é uma opção válida, mas exige autorização formal e registro — e quando aplicável, aprovação do cliente. Não é 'aceitar e ignorar'." data-fb-nok="Reveja a cláusula 8.7. A concessão é a aceitação formal de um produto fora de especificação, com registro e, quando necessário, aprovação do cliente. Não é sinônimo de liberar sem documentar.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Uma peça saiu com diâmetro de 50,08 mm, mas a especificação é 50,00 ± 0,05 mm. A empresa decide aceitar assim mesmo pois o cliente disse que "pode passar dessa vez". Como a ISO 9001:2015 trata essa situação?</div>
  <button class="qi-option" data-key="a">É proibido — produto fora de especificação nunca pode ser entregue</button>
  <button class="qi-option" data-key="b">Pode ser entregue sem registro, já que o cliente autorizou verbalmente</button>
  <button class="qi-option" data-key="c">Deve ser sucateado imediatamente conforme cláusula 8.7</button>
  <button class="qi-option" data-key="d">É uma concessão — deve ser registrada formalmente com autorização do cliente e retida como evidência</button>
  <div class="qi-feedback"></div>
</div>

<div class="template-box"><span>Download: Plano de controle de produção + formulário de produto não conforme</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 5 — Avaliação e Melhoria (2h)
  // ═══════════════════════════════════════════════════════════════════
  const mod5Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Avaliação e Melhoria', 'Cláusulas 9 e 10: monitoramento, auditoria interna, análise crítica, não conformidade, ação corretiva e melhoria contínua.', 5)
    RETURNING id
  `;
  const mod5 = mod5Rows[0].id;

  // --- Aula 5.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'monitoramento-medicao', 'Cláusula 9.1 — Monitoramento, Medição, Análise e Avaliação', '30 min', 1, ${`
<h2>Cláusula 9.1 — Monitoramento, Medição, Análise e Avaliação</h2>

<p>A cláusula 9 marca a transição do "fazer" para o "verificar" no ciclo PDCA. De nada adianta ter processos bem planejados e executados se você não mede os resultados. A cláusula 9.1 trata exatamente disso: como monitorar, medir, analisar e avaliar o desempenho do SGQ.</p>

<div class="diagram">
  <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr51" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/>
      </marker>
    </defs>
    <rect x="10" y="20" width="85" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="52" y="46" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">PLAN</text>
    <text x="52" y="60" text-anchor="middle" fill="#93c5fd" font-size="9">Definir o que</text>
    <text x="52" y="72" text-anchor="middle" fill="#93c5fd" font-size="9">medir e como</text>
    <rect x="115" y="20" width="85" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="157" y="46" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">DO</text>
    <text x="157" y="60" text-anchor="middle" fill="#93c5fd" font-size="9">Executar e</text>
    <text x="157" y="72" text-anchor="middle" fill="#93c5fd" font-size="9">coletar dados</text>
    <rect x="220" y="20" width="85" height="60" rx="8" fill="#c5383c" stroke="#c5383c" stroke-width="1.5"/>
    <text x="262" y="46" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">CHECK</text>
    <text x="262" y="60" text-anchor="middle" fill="#fecaca" font-size="9">Medir, analisar</text>
    <text x="262" y="72" text-anchor="middle" fill="#fecaca" font-size="9">e avaliar — 9.1</text>
    <rect x="325" y="20" width="85" height="60" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="367" y="46" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">ACT</text>
    <text x="367" y="60" text-anchor="middle" fill="#93c5fd" font-size="9">Corrigir e</text>
    <text x="367" y="72" text-anchor="middle" fill="#93c5fd" font-size="9">melhorar</text>
    <polyline points="95,50 115,50" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arr51)"/>
    <polyline points="200,50 220,50" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arr51)"/>
    <polyline points="305,50 325,50" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arr51)"/>
    <path d="M367,80 Q367,140 210,148 Q52,140 52,80" fill="none" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arr51)"/>
    <text x="210" y="158" text-anchor="middle" fill="#93c5fd" font-size="9">Ciclo contínuo de aprendizado</text>
  </svg>
  <figcaption>A cláusula 9.1 ocupa o CHECK do PDCA — sem medir, o ciclo de melhoria não fecha</figcaption>
</div>

<h3>9.1.1 — Generalidades</h3>

<p>A organização deve determinar:</p>

<ul>
  <li><strong>O que</strong> precisa ser monitorado e medido.</li>
  <li><strong>Os métodos</strong> de monitoramento, medição, análise e avaliação.</li>
  <li><strong>Quando</strong> monitorar e medir.</li>
  <li><strong>Quando</strong> analisar e avaliar os resultados.</li>
</ul>

<p>Além disso, deve avaliar o desempenho e a eficácia do SGQ e reter informação documentada como evidência dos resultados.</p>

<h3>Indicadores-chave (KPIs) do SGQ</h3>

<p>Embora a norma não liste indicadores específicos, a prática mostra que toda organização precisa de um conjunto mínimo de indicadores:</p>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">≤ 2%</div><div class="kpi-label">Refugo — meta típica indústria</div></div>
  <div class="kpi-card"><div class="kpi-value">≥ 95%</div><div class="kpi-label">Pontualidade de entrega</div></div>
  <div class="kpi-card"><div class="kpi-value">≥ 85</div><div class="kpi-label">Satisfação do cliente (0–100)</div></div>
  <div class="kpi-card"><div class="kpi-value">100%</div><div class="kpi-label">NCs fechadas no prazo</div></div>
</div>

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

<div class="example"><strong>Exemplo prático — Indústria alimentícia:</strong> Uma fábrica de laticinios monitora diariamente: temperatura de pasteurização (registro automatico a cada 30 segundos), pH do produto, peso liquido da embalagem (controle estatistico), contagem microbiológica (amostragem por lote). Mensalmente consolida: % de lotes aprovados em primeira inspeção, número de reclamações, volume de descarte por vencimento. Esses dados alimentam a análise crítica trimestral.</div>

<h3>9.1.2 — Satisfação do cliente</h3>

<p>A organização deve monitorar a percepção dos clientes sobre o grau em que suas necessidades e expectativas foram atendidas. A norma pede que a organização determine os métodos para obter, monitorar e analisar criticamente essa informação.</p>

<p>Métodos comuns:</p>

<ul>
  <li><strong>Pesquisa de satisfação:</strong> questionário estruturado (anual ou semestral).</li>
  <li><strong>Análise de reclamações:</strong> tendência, classificação, tempo de resposta.</li>
  <li><strong>Indicadores de desempenho do cliente:</strong> scorecards que o próprio cliente envia.</li>
  <li><strong>Dados de mercado:</strong> participação de mercado, taxas de retenção, novos clientes.</li>
  <li><strong>Entrevistas/visitas:</strong> contato direto para entender percepções.</li>
</ul>

<div class="callout"><strong>Importante:</strong> A ausência de reclamações NÃO e evidência de satisfação. O auditor vai questionar: "Além de esperar reclamações, o que vocês fazem ativamente para medir a satisfação?" Se a resposta for "nada", é um achado. Busque a informação — não espere ela chegar.</div>

<h3>9.1.3 — Análise e avaliação</h3>

<p>A organização deve analisar e avaliar dados e informações apropriados. Os resultados da análise devem ser usados para avaliar:</p>

<ul>
  <li>Conformidade de produtos e serviços.</li>
  <li>Grau de satisfação do cliente.</li>
  <li>Desempenho e eficácia do SGQ.</li>
  <li>Se o planejamento foi implementado eficazmente.</li>
  <li>Eficácia das ações para abordar riscos e oportunidades.</li>
  <li>Desempenho de provedores externos.</li>
  <li>Necessidade de melhorias no SGQ.</li>
</ul>

<p>Na prática, isso se traduz em reuniões periodicas de análise de indicadores onde a equipe de gestão avalia os dados, identifica tendências e define ações.</p>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A ausência de reclamações não é evidência de satisfação. A organização deve buscar ativamente a percepção dos clientes." data-fb-nok="Incorreto. A norma exige que a organização monitore ATIVAMENTE a percepção dos clientes — não apenas espere reclamações."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Uma empresa não recebe reclamações de clientes há 6 meses. O que isso significa para a cláusula 9.1.2?</div><button class="qi-option" data-key="a">Os clientes estão plenamente satisfeitos — nenhuma ação necessária</button><button class="qi-option" data-key="b">A empresa pode pular a medição de satisfação na próxima análise crítica</button><button class="qi-option" data-key="c">Ausência de reclamações não é evidência de satisfação — é preciso buscar ativamente a percepção</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Painel de indicadores do SGQ (modelo Excel/Google Sheets)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'auditoria-interna', 'Cláusula 9.2 — Auditoria Interna', '30 min', 2, ${`
<h2>Cláusula 9.2 — Auditoria Interna</h2>

<p>A auditoria interna e uma das ferramentas mais poderosas do SGQ — e também uma das mais mal utilizadas. Quando bem feita, é uma oportunidade de aprendizado e melhoria. Quando mal feita, vira uma "cacada a bruxas" ou um "ritual de papel" que ninguém leva a serio.</p>

<h3>O que a norma exige</h3>

<p>A organização deve conduzir auditorias internas em intervalos planejados para prover informação sobre se o SGQ:</p>

<ul>
  <li>Está conforme os requisitos da própria organização e da ISO 9001.</li>
  <li>Esta implementado e mantido eficazmente.</li>
</ul>

<h3>Programa de auditoria</h3>

<p>A organização deve planejar, estabelecer, implementar e manter um programa de auditoria, incluindo frequência, métodos, responsabilidades, requisitos de planejamento e relato. O programa deve considerar:</p>

<ul>
  <li>A importância dos processos envolvidos.</li>
  <li>Mudanças que afetem a organização.</li>
  <li>Resultados de auditorias anteriores.</li>
</ul>

<div class="callout"><strong>Importante:</strong> "Intervalos planejados" não significa necessariamente "uma vez por ano tudo de uma vez". Muitas organizações distribuem as auditorias ao longo do ano, auditando processos diferentes a cada mes ou trimestre. Processos mais críticos ou com histórico de problemas podem ser auditados com maior frequência.</div>

<h3>Requisitos para auditores</h3>

<p>Os auditores devem ser selecionados de forma a assegurar objetividade e imparcialidade. Isso significa: ninguém audita seu próprio trabalho. O gerente de produção não audita a produção. O coordenador de qualidade não audita a gestão da qualidade (na prática, alguém de outro setor audita qualidade).</p>

<p>Competência necessária para auditores internos:</p>

<ul>
  <li>Conhecimento da ISO 9001 (requisitos aplicáveis).</li>
  <li>Conhecimento do processo a ser auditado (básico, não precisa ser especialista).</li>
  <li>Técnicas de auditoria (como formular perguntas, coletar evidências, registrar achados).</li>
  <li>Treinamento formal em auditoria interna (curso de 8 a 16 horas e o padrão de mercado).</li>
</ul>

<h3>Etapas de uma auditoria interna</h3>

<div class="step-flow"><div class="step-item"><div class="step-content"><strong>1. Planejamento</strong><br>Definir escopo, critérios, equipe auditora, cronograma e checklist.</div></div><div class="step-item"><div class="step-content"><strong>2. Reunião de abertura</strong><br>Alinhar com o auditado escopo, objetivo, agenda e método.</div></div><div class="step-item"><div class="step-content"><strong>3. Execução</strong><br>Coleta de evidências por entrevistas, observação e análise documental.</div></div><div class="step-item"><div class="step-content"><strong>4. Classificação de achados</strong><br>NC maior, NC menor, oportunidade de melhoria ou conformidade.</div></div><div class="step-item"><div class="step-content"><strong>5. Reunião de encerramento</strong><br>Apresentar achados ao auditado, alinhar entendimento.</div></div><div class="step-item"><div class="step-content"><strong>6. Relatório</strong><br>Formalizar achados, classificação e prazo para tratamento.</div></div><div class="step-item"><div class="step-content"><strong>7. Acompanhamento</strong><br>Verificar se as ações corretivas foram implementadas e são eficazes.</div></div></div>

<div class="example"><strong>Exemplo prático — Metalúrgica:</strong> O programa anual de auditoria da UsinaMax distribui auditorias ao longo de 10 meses (janeiro e dezembro ficam livres). Cada mes audita 1-2 processos. O setor de metrologia e auditado 2x ao ano (por ser crítico). A equipe de auditores internos tem 4 pessoas de setores diferentes, todas com curso de auditor interno. O coordenador de qualidade coordena o programa mas não participa como auditor (para manter imparcialidade, exceto para auditar processos onde não tem envolvimento direto).</div>

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

<div class="callout"><strong>Importante:</strong> A auditoria interna deve ser vista como uma ferramenta de MELHORIA, não de PUNICAO. Se as pessoas tiverem medo da auditoria, vão esconder problemas em vez de mostrá-los. A cultura da organização deve incentivar a transparência: encontrar um problema na auditoria e BOM — significa que podemos corrigi-lo antes que vire uma reclamação do cliente ou uma não conformidade na auditoria de certificação.</div>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Auditoria ineficaz</h4><ul><li>Auditoria anual tudo de uma vez em 1 dia</li><li>Auditor audita seu próprio setor</li><li>Perguntas fechadas: "você segue o procedimento?"</li><li>Achados genéricos sem evidência</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Auditoria eficaz</h4><ul><li>Distribuida ao longo do ano por processo</li><li>Auditores imparciais (de outros setores)</li><li>Perguntas abertas: "me mostre como faz..."</li><li>Achados com evidência objetiva e rastreável</li></ul></div></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O principio de imparcialidade exige que ninguém audite seu próprio trabalho. O gerente de produção não pode auditar a produção." data-fb-nok="Incorreto. A imparcialidade e requisito fundamental: auditores não podem auditar seus próprios processos."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Quem pode auditar o processo de produção numa auditoria interna?</div><button class="qi-option" data-key="a">O gerente de produção, pois conhece melhor o processo</button><button class="qi-option" data-key="b">Um auditor treinado de outro setor, garantindo imparcialidade</button><button class="qi-option" data-key="c">Qualquer pessoa da empresa, sem necessidade de treinamento</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Programa anual de auditoria + checklist de auditoria por cláusula</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'analise-critica-direcao', 'Cláusula 9.3 — Análise Crítica pela Direção', '30 min', 3, ${`
<h2>Cláusula 9.3 — Análise Crítica pela Direção</h2>

<p>A análise crítica pela direção e a reunião mais importante do SGQ. E o momento em que a alta direção avalia o desempenho do sistema, toma decisões estratégicas e direciona a melhoria. Na prática, e onde a cláusula 5 (liderança) se materializa com fatos e dados.</p>

<h3>Frequência</h3>

<p>A norma diz "em intervalos planejados". O padrão de mercado e pelo menos anual, mas muitas organizações fazem semestral ou trimestral — e isso e altamente recomendado. Quanto mais frequente, mais agil a resposta a problemas.</p>

<div class="diagram"><svg viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg"><text x="200" y="16" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">Análise Crítica pela Direção — Entradas e Saídas</text><rect x="10" y="30" width="155" height="155" rx="8" fill="#2563eb" opacity="0.08" stroke="#2563eb" stroke-width="1.5"/><text x="87" y="48" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">ENTRADAS (9.3.2)</text><text x="20" y="65" font-size="7" fill="#0b1730">• Ações de análises anteriores</text><text x="20" y="78" font-size="7" fill="#0b1730">• Mudanças no contexto</text><text x="20" y="91" font-size="7" fill="#0b1730">• Satisfação do cliente</text><text x="20" y="104" font-size="7" fill="#0b1730">• Objetivos alcancados?</text><text x="20" y="117" font-size="7" fill="#0b1730">• Desempenho de processos</text><text x="20" y="130" font-size="7" fill="#0b1730">• NCs e ações corretivas</text><text x="20" y="143" font-size="7" fill="#0b1730">• Resultados de auditorias</text><text x="20" y="156" font-size="7" fill="#0b1730">• Fornecedores</text><text x="20" y="169" font-size="7" fill="#0b1730">• Recursos adequados?</text><text x="20" y="182" font-size="7" fill="#0b1730">• Riscos e oportunidades</text><defs><marker id="arrACD" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6" fill="#0b1730"/></marker></defs><line x1="165" y1="110" x2="178" y2="110" stroke="#0b1730" stroke-width="2" marker-end="url(#arrACD)"/><rect x="180" y="75" width="50" height="70" rx="25" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="2"/><text x="205" y="107" text-anchor="middle" font-size="8" fill="#c5383c" font-weight="bold">ACD</text><text x="205" y="118" text-anchor="middle" font-size="7" fill="#c5383c">9.3</text><line x1="230" y1="110" x2="243" y2="110" stroke="#0b1730" stroke-width="2" marker-end="url(#arrACD)"/><rect x="245" y="55" width="145" height="110" rx="8" fill="#16a34a" opacity="0.08" stroke="#16a34a" stroke-width="1.5"/><text x="317" y="73" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">SAÍDAS (9.3.3)</text><text x="255" y="92" font-size="7" fill="#0b1730">• Oportunidades de melhoria</text><text x="255" y="108" font-size="7" fill="#0b1730">• Necessidade de mudanças</text><text x="255" y="124" font-size="7" fill="#0b1730">• Necessidade de recursos</text><text x="255" y="145" font-size="8" fill="#16a34a" font-weight="bold">= DECISOES concretas</text><text x="255" y="158" font-size="7" fill="#0b1730">Quem? O que? Até quando?</text><text x="200" y="210" text-anchor="middle" font-size="8" fill="#0b1730" font-style="italic">ACD = Análise Crítica pela Direção (mínimo anual)</text></svg><figcaption>A análise crítica transforma dados em decisões — com entradas obrigatórias e saídas concretas</figcaption></div>

<h3>9.3.2 — Entradas da análise crítica</h3>

<p>A norma específica o que DEVE ser analisado. Essas são as entradas obrigatórias:</p>

<ol>
  <li><strong>Situação das ações de análises críticas anteriores:</strong> o que foi decidido na última reunião? Foi implementado?</li>
  <li><strong>Mudanças em questões externas e internas:</strong> algo mudou no contexto? Novos requisitos legais? Novo mercado?</li>
  <li><strong>Informação sobre desempenho e eficácia do SGQ:</strong>
    <ul>
      <li>Satisfação do cliente e retroalimentação de partes interessadas.</li>
      <li>Extensão em que os objetivos da qualidade foram alcancados.</li>
      <li>Desempenho de processos e conformidade de produtos/serviços.</li>
      <li>Não conformidades e ações corretivas.</li>
      <li>Resultados de monitoramento e medição.</li>
      <li>Resultados de auditoria.</li>
      <li>Desempenho de provedores externos.</li>
    </ul>
  </li>
  <li><strong>Adequação de recursos.</strong></li>
  <li><strong>Eficácia de ações para abordar riscos e oportunidades.</strong></li>
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
  <li>15 min — Revisão de riscos e oportunidades</li>
  <li>10 min — Necessidades de recursos e investimentos</li>
</ul>
Participam: presidente, diretor técnico, gerente de operações, coordenador de qualidade e gerente financeiro.</div>

<h3>9.3.3 — Saídas da análise crítica</h3>

<p>As saídas devem incluir decisões e ações relacionadas a:</p>

<ul>
  <li>Oportunidades de melhoria.</li>
  <li>Qualquer necessidade de mudança no SGQ.</li>
  <li>Necessidade de recursos.</li>
</ul>

<p>Em termos práticos, a ata da análise crítica deve registrar decisões concretas: quem vai fazer o que, até quando, com quais recursos.</p>

<div class="callout"><strong>Importante:</strong> O erro mais comum: a análise crítica vira uma "reunião de apresentação de indicadores" onde a direção ouve, faz alguns comentários e vai embora sem decisões concretas. A ata tem frases como "manter monitoramento" — que não é uma decisão, é uma fuga. O auditor vai cobrar: quais DECISOES foram tomadas? Quais ACOES foram definidas? Os RESULTADOS foram diferentes por causa dessa reunião?</div>

<h3>Dicas para uma análise crítica eficaz</h3>

<ol>
  <li><strong>Prepare o material com antecedencia</strong> — envie os dados pelo menos 5 dias antes para que todos venham preparados.</li>
  <li><strong>Use gráficos e tendências</strong> — não só números absolutos. Mostre a evolução ao longo do tempo.</li>
  <li><strong>Foque em desvios e tendências negativas</strong> — o que está no verde é rápido; o que está no vermelho exige discussão.</li>
  <li><strong>Registre DECISOES, não só discussões</strong> — a ata deve ter ações com responsável e prazo.</li>
  <li><strong>Acompanhe na próxima reunião</strong> — a primeira entrada da próxima análise crítica e o status das ações anteriores.</li>
</ol>

<div class="checklist"><ul class="checklist">
  <li><span class="ck-box"></span>Material enviado com antecedencia (mínimo 5 dias antes)</li>
  <li><span class="ck-box"></span>Todas as entradas obrigatórias (9.3.2) incluídas na pauta</li>
  <li><span class="ck-box"></span>Alta direção presente e participando ativamente</li>
  <li><span class="ck-box"></span>Gráficos de tendência, não apenas números absolutos</li>
  <li><span class="ck-box"></span>Ata registra DECISOES com responsável e prazo (não apenas "manter monitoramento")</li>
  <li><span class="ck-box"></span>Status das ações da reunião anterior é a primeira pauta</li>
</ul></div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A ata deve registrar decisões concretas com responsável e prazo — não apenas discussões ou 'manter monitoramento'." data-fb-nok="Incorreto. O principal problema em análises criticas e a falta de decisões concretas. A ata deve ter ações com responsável e prazo."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é o erro mais comum na análise crítica pela direção?</div><button class="qi-option" data-key="a">A ata registra apenas "manter monitoramento" sem decisões concretas</button><button class="qi-option" data-key="b">Usar gráficos de tendência em vez de números absolutos</button><button class="qi-option" data-key="c">Incluir resultados de auditoria interna na pauta</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Modelo de ata de análise crítica pela direção</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 5.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod5}, 'melhoria-nao-conformidade', 'Cláusula 10 — Melhoria, Não Conformidade e Ação Corretiva', '30 min', 4, ${`
<h2>Cláusula 10 — Melhoria, Não Conformidade e Ação Corretiva</h2>

<p>A cláusula 10 fecha o ciclo PDCA com o "Act" — agir para melhorar. E dividida em três partes: generalidades (10.1), não conformidade e ação corretiva (10.2) e melhoria contínua (10.3).</p>

<h3>10.1 — Generalidades</h3>

<p>A organização deve determinar e selecionar oportunidades de melhoria e implementar ações necessárias para atender aos requisitos do cliente e aumentar a satisfação. Isso inclui:</p>

<ul>
  <li>Melhorar produtos e serviços para atender requisitos e considerar necessidades futuras.</li>
  <li>Corrigir, prevenir ou reduzir efeitos indesejaveis.</li>
  <li>Melhorar o desempenho e a eficácia do SGQ.</li>
</ul>

<h3>10.2 — Não conformidade e ação corretiva</h3>

<p>Esta e a cláusula que mais gera evidências em auditorias e a que mais frequentemente apresenta problemas. O tratamento de não conformidades e o "teste de estresse" do SGQ.</p>

<p>Quando uma não conformidade ocorre (incluindo reclamações de clientes), a organização deve:</p>

<ol>
  <li><strong>Reagir a não conformidade:</strong>
    <ul>
      <li>Tomar ação para controlá-la e corrigi-la (correção — disposição imediata).</li>
      <li>Lidar com as consequências.</li>
    </ul>
  </li>
  <li><strong>Avaliar a necessidade de ação para eliminar a causa:</strong>
    <ul>
      <li>Analisar criticamente a não conformidade.</li>
      <li>Determinar as causas.</li>
      <li>Determinar se não conformidades similares existem ou podem ocorrer.</li>
    </ul>
  </li>
  <li><strong>Implementar a ação necessária (ação corretiva).</strong></li>
  <li><strong>Analisar criticamente a eficácia da ação corretiva.</strong></li>
  <li><strong>Atualizar riscos e oportunidades, se necessário.</strong></li>
  <li><strong>Fazer mudanças no SGQ, se necessário.</strong></li>
</ol>

<h3>A diferença entre correção e ação corretiva</h3>

<div class="comparison"><div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Só correção (apagar incendio)</h4><ul><li>Retrabalhar a peça fora de tolerância</li><li>Segregar o lote com defeito</li><li>Devolver material ao fornecedor</li><li>Problema se repete em semanas</li></ul></div><div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline fill="none" points="9 12 12 15 16 10"/></svg> Correção + ação corretiva</h4><ul><li>Retrabalhar a peça (correção imediata)</li><li>Analisar causa raiz (5 Porquês)</li><li>Recalibrar máquina + retreinar operador</li><li>Problema eliminado na raiz</li></ul></div></div>

<div class="callout"><strong>Importante:</strong> Essa diferença é fundamental e frequentemente confundida.
<ul>
  <li><strong>Correção</strong> (disposição imediata): o que você faz AGORA para resolver o problema pontual. Exemplo: retrabalhar a peça, segregar o lote, devolver ao fornecedor.</li>
  <li><strong>Ação corretiva</strong>: o que você faz para eliminar a CAUSA do problema e evitar que se repita. Exemplo: recalibrar a máquina, retreinar o operador, revisar o procedimento, trocar de fornecedor.</li>
</ul>
A correção "apaga o incêndio". A ação corretiva "conserta a fiação elétrica" para que o incêndio não volte.</div>

<h3>Ferramentas de análise de causa raiz</h3>

<table>
  <tr><th>Ferramenta</th><th>Quando usar</th><th>Como funciona</th></tr>
  <tr><td>5 Porquês</td><td>Problemas simples a moderados</td><td>Perguntar "por que?" 5 vezes até chegar a causa raiz</td></tr>
  <tr><td>Ishikawa (Espinha de peixe)</td><td>Problemas com múltiplas causas potenciais</td><td>Categorizar causas em 6M: Máquina, Método, Mão de obra, Material, Meio ambiente, Medição</td></tr>
  <tr><td>8D</td><td>Problemas complexos, especialmente reclamações de clientes</td><td>8 disciplinas estruturadas, da contenção até prevenção</td></tr>
  <tr><td>A3</td><td>Problemas que precisam ser comunicados de forma concisa</td><td>Tudo em uma folha A3: problema, análise, ação, resultado</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Metalúrgica (5 Porquês):</strong>
<p><strong>Problema:</strong> Lote de 200 eixos entregue com diametro fora de tolerância.</p>
<ul>
  <li>Por que? A medição não detectou o desvio durante a produção.</li>
  <li>Por que? O operador não mediu no intervalo especificado (a cada 10 peças).</li>
  <li>Por que? O operador estava acumulando a função de duas máquinas.</li>
  <li>Por que? O colega de turno faltou e não foi providenciado substituto.</li>
  <li>Por que? Não existe procedimento para substituição em caso de falta.</li>
</ul>
<p><strong>Causa raiz:</strong> Falta de procedimento para cobertura de ausências em funções críticas.</p>
<p><strong>Ação corretiva:</strong> Criar e implementar procedimento de cobertura com operadores polivalentes treinados.</p>
<p><strong>Verificação de eficácia:</strong> Acompanhar por 3 meses se há reincidência; monitorar absenteismo e cobertura.</p></div>

<h3>10.3 — Melhoria contínua</h3>

<p>A organização deve melhorar continuamente a adequação, suficiência e eficácia do SGQ, considerando os resultados de análise e avaliação e as saídas da análise crítica para determinar se há necessidades ou oportunidades de melhoria.</p>

<p>Melhoria contínua não é apenas corrigir problemas. E buscar ativamente fazer melhor:</p>

<ul>
  <li><strong>Projetos de melhoria:</strong> kaizen, lean, six sigma, grupos de melhoria.</li>
  <li><strong>Benchmarking:</strong> comparar-se com os melhores do setor.</li>
  <li><strong>Inovação de processos:</strong> adotar novas tecnologias, novos métodos.</li>
  <li><strong>Sugestões de colaboradores:</strong> programa estruturado de sugestões.</li>
</ul>

<div class="diagram"><svg viewBox="0 0 414 200" xmlns="http://www.w3.org/2000/svg"><text x="200" y="16" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">Fluxo de Tratamento de NC (Cláusula 10.2)</text><defs><marker id="arrTNC" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0 0 L7 2.5 L0 5" fill="#0b1730"/></marker></defs><rect x="10" y="30" width="70" height="35" rx="6" fill="#c5383c" opacity="0.15" stroke="#c5383c" stroke-width="1.5"/><text x="45" y="45" text-anchor="middle" font-size="8" fill="#c5383c" font-weight="bold">NC ocorre</text><text x="45" y="58" text-anchor="middle" font-size="7" fill="#0b1730">(ou reclamação)</text><line x1="80" y1="47" x2="95" y2="47" stroke="#0b1730" stroke-width="1" marker-end="url(#arrTNC)"/><rect x="98" y="30" width="65" height="35" rx="6" fill="#eab308" opacity="0.12" stroke="#eab308" stroke-width="1"/><text x="130" y="45" text-anchor="middle" font-size="7" fill="#eab308" font-weight="bold">Correção</text><text x="130" y="58" text-anchor="middle" font-size="6" fill="#0b1730">Ação imediata</text><line x1="163" y1="47" x2="178" y2="47" stroke="#0b1730" stroke-width="1" marker-end="url(#arrTNC)"/><rect x="180" y="25" width="75" height="45" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="217" y="42" text-anchor="middle" font-size="7" fill="#2563eb" font-weight="bold">Análise de</text><text x="217" y="52" text-anchor="middle" font-size="7" fill="#2563eb" font-weight="bold">causa raiz</text><text x="217" y="64" text-anchor="middle" font-size="6" fill="#0b1730">5 Porquês/Ishikawa</text><line x1="255" y1="47" x2="270" y2="47" stroke="#0b1730" stroke-width="1" marker-end="url(#arrTNC)"/><rect x="272" y="30" width="65" height="35" rx="6" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1.5"/><text x="304" y="42" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">Ação</text><text x="304" y="52" text-anchor="middle" font-size="7" fill="#16a34a" font-weight="bold">corretiva</text><text x="304" y="64" text-anchor="middle" font-size="6" fill="#0b1730">Eliminar causa</text><line x1="337" y1="47" x2="352" y2="47" stroke="#0b1730" stroke-width="1" marker-end="url(#arrTNC)"/><rect x="354" y="30" width="55" height="35" rx="6" fill="#0b1730" opacity="0.08" stroke="#0b1730" stroke-width="1"/><text x="381" y="42" text-anchor="middle" font-size="7" fill="#0b1730" font-weight="bold">Verificar</text><text x="381" y="55" text-anchor="middle" font-size="6" fill="#0b1730">eficácia</text><rect x="80" y="90" width="280" height="40" rx="6" fill="#0b1730" opacity="0.04" stroke="#0b1730" stroke-width="1"/><text x="220" y="108" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">Se eficaz: fechar NC | Se não: reabrir e aprofundar análise</text><text x="220" y="122" text-anchor="middle" font-size="7" fill="#0b1730">Atualizar riscos e oportunidades se necessário (retroalimenta 6.1)</text><line x1="381" y1="65" x2="381" y2="88" stroke="#0b1730" stroke-width="1" marker-end="url(#arrTNC)"/></svg><figcaption>Fluxo completo de tratamento de NC: da detecção a verificação de eficácia</figcaption></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A ação corretiva elimina a CAUSA do problema para evitar reincidência. A correção resolve apenas o problema pontual." data-fb-nok="Incorreto. Correção resolve o problema imediato; ação corretiva elimina a causa raiz para que o problema não se repita."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a diferença entre correção e ação corretiva?</div><button class="qi-option" data-key="a">São sinônimos — ambas significam resolver o problema</button><button class="qi-option" data-key="b">Correção elimina a causa raiz; ação corretiva resolve o problema imediato</button><button class="qi-option" data-key="c">Correção resolve o problema imediato; ação corretiva elimina a causa para evitar reincidência</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Formulário de não conformidade e ação corretiva (RAC) + guia de 5 Porquês</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // MÓDULO 6 — Integração e Certificação (1.5h)
  // ═══════════════════════════════════════════════════════════════════
  const mod6Rows = await sql`
    INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
    VALUES (${courseId}, 'Integração e Certificação', 'Roteiro de implantação, preparação para certificação, manutenção do SGQ e informações sobre a prova final.', 6)
    RETURNING id
  `;
  const mod6 = mod6Rows[0].id;

  // --- Aula 6.1 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'roteiro-implantacao', 'Roteiro de Implantação — Do Zero a Certificação', '25 min', 1, ${`
<h2>Roteiro de Implantação — Do Zero a Certificação</h2>

<p>Agora que você conhece todos os requisitos da ISO 9001:2015, vamos montar o roteiro prático para implantar o SGQ e chegar a certificação. O prazo tipico para uma PME brasileira e de 6 a 12 meses, dependendo da complexidade e maturidade da organização.</p>

<div class="diagram">
  <svg viewBox="0 0 520 200" xmlns="http://www.w3.org/2000/svg" style="font-family:sans-serif;font-size:11px">
    <line x1="30" y1="100" x2="490" y2="100" stroke="#0b1730" stroke-width="2"/>
    <text x="30" y="120" fill="#64748b" text-anchor="middle">M1</text>
    <text x="112" y="120" fill="#64748b" text-anchor="middle">M2</text>
    <text x="194" y="120" fill="#64748b" text-anchor="middle">M4</text>
    <text x="276" y="120" fill="#64748b" text-anchor="middle">M6</text>
    <text x="358" y="120" fill="#64748b" text-anchor="middle">M8</text>
    <text x="440" y="120" fill="#64748b" text-anchor="middle">M10</text>
    <text x="490" y="120" fill="#64748b" text-anchor="middle">M12</text>
    <rect x="30" y="72" width="82" height="20" rx="4" fill="#2563eb" opacity="0.85"/>
    <text x="71" y="86" fill="#fff" text-anchor="middle" font-weight="bold">F1 Diagnóstico</text>
    <rect x="112" y="72" width="164" height="20" rx="4" fill="#0b1730" opacity="0.85"/>
    <text x="194" y="86" fill="#fff" text-anchor="middle" font-weight="bold">F2 Construção SGQ</text>
    <rect x="235" y="50" width="123" height="20" rx="4" fill="#16a34a" opacity="0.85"/>
    <text x="296" y="64" fill="#fff" text-anchor="middle" font-weight="bold">F3 Operação</text>
    <rect x="358" y="72" width="82" height="20" rx="4" fill="#c5383c" opacity="0.75"/>
    <text x="399" y="86" fill="#fff" text-anchor="middle" font-weight="bold">F4 Verificação</text>
    <rect x="440" y="72" width="50" height="20" rx="4" fill="#c5383c"/>
    <text x="465" y="86" fill="#fff" text-anchor="middle" font-weight="bold">F5 Cert.</text>
    <text x="30" y="155" fill="#0b1730" font-weight="bold">Legenda:</text>
    <rect x="95" y="145" width="12" height="12" rx="2" fill="#2563eb"/>
    <text x="112" y="155" fill="#475569">Diagnóstico</text>
    <rect x="185" y="145" width="12" height="12" rx="2" fill="#0b1730"/>
    <text x="202" y="155" fill="#475569">Construção</text>
    <rect x="275" y="145" width="12" height="12" rx="2" fill="#16a34a"/>
    <text x="292" y="155" fill="#475569">Operação</text>
    <rect x="355" y="145" width="12" height="12" rx="2" fill="#c5383c"/>
    <text x="372" y="155" fill="#475569">Verificação / Certificação</text>
  </svg>
  <figcaption>Linha do tempo tipica de implantação ISO 9001 para uma PME brasileira (6-12 meses)</figcaption>
</div>

<ul class="checklist">
  <li><span class="ck-box"></span>Apoio formal da alta direção garantido antes de iniciar</li>
  <li><span class="ck-box"></span>Coordenador de qualidade designado com dedicação mínima de 50%</li>
  <li><span class="ck-box"></span>Orçamento aprovado (consultoria + organismo certificador + treinamentos)</li>
  <li><span class="ck-box"></span>Escopo do SGQ definido (quais processos e sites serão cobertos)</li>
  <li><span class="ck-box"></span>Cronograma aprovado pela direção com marcos e responsáveis</li>
</ul>

<h3>Fase 1 — Diagnóstico e planejamento (mes 1-2)</h3>

<table>
  <tr><th>Atividade</th><th>Entrega</th><th>Responsável</th></tr>
  <tr><td>Diagnóstico inicial (gap analysis)</td><td>Relatório de gaps vs. requisitos ISO 9001</td><td>Consultor/Coordenador de Qualidade</td></tr>
  <tr><td>Comprometimento da direção</td><td>Ata de reunião de lançamento do projeto</td><td>Diretor + Consultor</td></tr>
  <tr><td>Definição do comite de implantação</td><td>Nomeação formal com papéis e responsabilidades</td><td>Diretor</td></tr>
  <tr><td>Cronograma do projeto</td><td>Cronograma detalhado com marcos e responsáveis</td><td>Coordenador de Qualidade</td></tr>
  <tr><td>Treinamento da equipe na norma</td><td>Todos os envolvidos treinados nos requisitos básicos</td><td>Consultor</td></tr>
</table>

<div class="callout"><strong>Importante:</strong> O diagnóstico inicial é crítico. Ele mostra onde a empresa já atende (você vai se surpreender — muitas coisas já são feitas) e onde tem lacunas. Isso permite priorizar esforços. Não comece documentando tudo — comece pelo que falta.</div>

<h3>Fase 2 — Construção do SGQ (mes 2-6)</h3>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Contexto e partes interessadas (4.1, 4.2)</strong><br>Workshop com direção e gerencia — 4 horas. Entrega: análise SWOT + mapa de partes interessadas.</div></div>
  <div class="step-item"><div class="step-content"><strong>Escopo e mapeamento de processos (4.3, 4.4)</strong><br>Definir o que entra no SGQ; mapear processos, interações, donos e indicadores de desempenho.</div></div>
  <div class="step-item"><div class="step-content"><strong>Política, objetivos e riscos (5.2, 6.1, 6.2)</strong><br>Redigir política da qualidade; montar matriz de riscos por processo; definir objetivos com planos de ação.</div></div>
  <div class="step-item"><div class="step-content"><strong>Documentação e competências (7.5, 7.2)</strong><br>Criar/revisar procedimentos e instruções de trabalho; montar matriz de competências e plano de treinamento.</div></div>
  <div class="step-item"><div class="step-content"><strong>Controles operacionais (8.4, 8.5, 8.7, 7.1.5)</strong><br>Qualificação de fornecedores, planos de controle, tratamento de NC, inventário e plano de calibração.</div></div>
</div>

<ol>
  <li><strong>Análise de contexto e partes interessadas</strong> (cláusulas 4.1, 4.2) — workshop com direção e gerencia, 4 horas.</li>
  <li><strong>Definição do escopo</strong> (cláusula 4.3) — redação e aprovação.</li>
  <li><strong>Mapeamento de processos</strong> (cláusula 4.4) — identificar processos, interações, donos e indicadores.</li>
  <li><strong>Política da qualidade</strong> (cláusula 5.2) — redigir, aprovar e comunicar.</li>
  <li><strong>Gestão de riscos</strong> (cláusula 6.1) — workshop por processo, montar matriz de riscos.</li>
  <li><strong>Objetivos da qualidade</strong> (cláusula 6.2) — definir com planos de ação.</li>
  <li><strong>Documentação</strong> (cláusula 7.5) — criar/revisar procedimentos, instruções de trabalho, formulários.</li>
  <li><strong>Gestão de competências</strong> (cláusula 7.2) — matriz de competências, plano de treinamento.</li>
  <li><strong>Controle de fornecedores</strong> (cláusula 8.4) — critérios, avaliação, lista aprovada.</li>
  <li><strong>Controle de produção</strong> (cláusula 8.5) — planos de controle, instruções operacionais.</li>
  <li><strong>Gestão de não conformidades</strong> (cláusula 8.7, 10.2) — procedimento de tratamento de NC.</li>
  <li><strong>Calibração</strong> (cláusula 7.1.5) — inventário de instrumentos, plano de calibração.</li>
</ol>

<h3>Fase 3 — Operação e maturação (mes 5-9)</h3>

<p>O SGQ precisa "rodar" por pelo menos 3 meses antes da auditoria de certificação, gerando evidências de que funciona na prática:</p>

<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:30%"></div></div><div class="pv-label">Mes 5 — SGQ iniciando operação, primeiros registros gerados</div></div>
<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:60%"></div></div><div class="pv-label">Mes 7 — Indicadores consolidados, primeiras ações corretivas concluídas</div></div>
<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:85%"></div></div><div class="pv-label">Mes 9 — SGQ maduro, evidências solidas para auditoria de certificação</div></div>

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
  <li><strong>Emissão do certificado.</strong></li>
</ol>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real — MetalForte, Caxias do Sul (RS)</div>
  <p>A MetalForte, usinagem de precisão com 60 funcionários, iniciou o projeto em fevereiro. O diagnóstico revelou que 40% dos requisitos já eram atendidos informalmente — ninguém havia documentado. A construção do SGQ levou de marco a julho, focando na documentação dos processos existentes e criação da matriz de riscos. A operação plena rodou de agosto a outubro gerando evidências reais. A auditoria interna em novembro identificou 8 achados, todos tratados antes de dezembro. A Fase 1 foi em dezembro com apenas 2 oportunidades de melhoria, e a Fase 2 em janeiro sem não conformidades maiores. O certificado chegou em fevereiro: exatamente 12 meses após o início.</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O SGQ deve rodar pelo menos 3 meses gerando indicadores, NCs tratadas e registros reais antes da auditoria de certificação." data-fb-nok="Não exatamente. O período mínimo de operação do SGQ antes da auditoria e de 3 meses, para que existam evidências de que o sistema funciona na prática.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o período mínimo recomendado de operação do SGQ antes da auditoria de certificação?</div>
  <button class="qi-option" data-key="a">1 mes — tempo suficiente para gerar os primeiros registros</button>
  <button class="qi-option" data-key="b">3 meses — o sistema precisa rodar gerando indicadores, NCs tratadas e registros reais</button>
  <button class="qi-option" data-key="c">6 meses — o organismo certificador exige meio ano de evidências</button>
  <div class="qi-feedback"></div>
</div>

<div class="example"><strong>Exemplo prático — Cronograma real:</strong> A MetalForte (60 funcionários, Caxias do Sul) iniciou o projeto em fevereiro. Diagnóstico em fevereiro/marco. Construção do SGQ de marco a julho. Operação plena de agosto a outubro. Auditoria interna em novembro. Análise crítica em novembro. Auditoria de certificação Fase 1 em dezembro, Fase 2 em janeiro. Certificado emitido em fevereiro — 12 meses após o início.</div>

<div class="template-box"><span>Download: Cronograma de implantação ISO 9001 (Gantt editavel)</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.2 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'preparacao-auditoria-certificacao', 'Preparação para a Auditoria de Certificação', '25 min', 2, ${`
<h2>Preparação para a Auditoria de Certificação</h2>

<p>A auditoria de certificação é o momento da verdade. Vamos desmistificá-la: não é um tribunal, e não é impossível. Com preparação adequada, a grande maioria das organizações e certificada na primeira tentativa.</p>

<h3>Escolhendo o organismo certificador</h3>

<p>No Brasil, os principais organismos certificadores acreditados pelo Inmetro para ISO 9001 são:</p>

<table>
  <tr><th>Organismo</th><th>Perfil</th><th>Faixa de preço (PME)</th></tr>
  <tr><td>Bureau Veritas</td><td>Global, forte na indústria</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>SGS</td><td>Global, ampla presença</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>BRTUV</td><td>Origem alema, foco industrial</td><td>R$ 7.000 - R$ 15.000</td></tr>
  <tr><td>Fundação Vanzolini</td><td>Nacional, forte em SP</td><td>R$ 6.000 - R$ 14.000</td></tr>
  <tr><td>DNV</td><td>Global, forte em processos</td><td>R$ 8.000 - R$ 18.000</td></tr>
  <tr><td>ABS Quality</td><td>Origem naval, versatil</td><td>R$ 7.000 - R$ 15.000</td></tr>
</table>

<p>Os preços variam conforme: número de funcionários, número de sites, complexidade dos processos e localização (deslocamento do auditor).</p>

<div class="callout"><strong>Importante:</strong> O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do IAF — International Accreditation Forum). Um certificado de um organismo não acreditado não tem validade de mercado. Verifique no site do Inmetro: <em>certifiq.inmetro.gov.br</em>.</div>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg" style="font-family:sans-serif;font-size:11px">
    <rect x="20" y="20" width="165" height="130" rx="8" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
    <text x="102" y="42" fill="#2563eb" text-anchor="middle" font-weight="bold" font-size="12">Fase 1 — Documental</text>
    <text x="102" y="58" fill="#475569" text-anchor="middle">Duração: 1 dia (PME)</text>
    <text x="35" y="78" fill="#475569">• Documentação do SGQ</text>
    <text x="35" y="95" fill="#475569">• Contexto e riscos</text>
    <text x="35" y="112" fill="#475569">• Objetivos e indicadores</text>
    <text x="35" y="129" fill="#475569">• Aud. interna e ACD</text>
    <text x="35" y="142" fill="#475569">• Layout e infraestrutura</text>
    <defs><marker id="arr62" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#0b1730"/></marker></defs>
    <line x1="185" y1="85" x2="235" y2="85" stroke="#0b1730" stroke-width="2" marker-end="url(#arr62)"/>
    <text x="210" y="78" fill="#64748b" text-anchor="middle" font-size="10">ok</text>
    <rect x="235" y="20" width="165" height="130" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <text x="317" y="42" fill="#16a34a" text-anchor="middle" font-weight="bold" font-size="12">Fase 2 — No Local</text>
    <text x="317" y="58" fill="#475569" text-anchor="middle">Duração: 2-4 dias (PME)</text>
    <text x="250" y="78" fill="#475569">• Reunião de abertura</text>
    <text x="250" y="95" fill="#475569">• Entrevista direção</text>
    <text x="250" y="112" fill="#475569">• Auditoria de processos</text>
    <text x="250" y="129" fill="#475569">• Verificação em campo</text>
    <text x="250" y="142" fill="#475569">• Reunião de encerramento</text>
  </svg>
  <figcaption>Estrutura da auditoria de certificação ISO 9001: Fase 1 (documental) precede Fase 2 (no local)</figcaption>
</div>

<h3>Auditoria Fase 1 — Análise documental</h3>

<p>O que o auditor avalia na Fase 1:</p>

<ul>
  <li>Documentação do SGQ (política, escopo, processos, procedimentos, registros).</li>
  <li>Contexto, partes interessadas e riscos.</li>
  <li>Objetivos e indicadores.</li>
  <li>Resultados de auditoria interna e análise crítica.</li>
  <li>Condições específicas do site (layout, fluxo, infraestrutura).</li>
</ul>

<p>A Fase 1 geralmente dura 1 dia para PMEs. O auditor emite um relatório com achados e recomendações. Se houver não conformidades maiores, a Fase 2 pode ser adiada até a resolução.</p>

<h3>Auditoria Fase 2 — No local</h3>

<p>E a auditoria completa. O auditor passa por todos os processos do escopo, entrevista pessoas em todos os níveis (direção, gerencia, operação) e verifica evidências de implementação e eficácia. Duração tipica: 2 a 4 dias para PMEs.</p>

<p>O que o auditor faz na prática:</p>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Reunião de abertura</strong><br>Apresentação do auditor, confirmação do escopo e agenda do dia. Todos os acompanhantes são apresentados.</div></div>
  <div class="step-item"><div class="step-content"><strong>Auditoria da direção</strong><br>Entrevista com alta direção: contexto, política da qualidade, objetivos, resultados da análise crítica.</div></div>
  <div class="step-item"><div class="step-content"><strong>Auditoria de processos</strong><br>Percorre cada processo do escopo, entrevista responsáveis e operadores, verifica registros e evidências de implementação.</div></div>
  <div class="step-item"><div class="step-content"><strong>Verificação em campo</strong><br>Observa operações reais, verifica calibração de instrumentos, identificação de produtos e rastreabilidade.</div></div>
  <div class="step-item"><div class="step-content"><strong>Reunião de encerramento</strong><br>Apresenta achados e os classifica: NC maior, NC menor ou oportunidade de melhoria. Define prazos para tratamento.</div></div>
</div>

<ol>
  <li><strong>Reunião de abertura:</strong> apresentação, escopo, agenda.</li>
  <li><strong>Auditoria da direção:</strong> entrevista com alta direção sobre contexto, política, objetivos, análise crítica.</li>
  <li><strong>Auditoria de processos:</strong> percorre cada processo do escopo, entrevista responsáveis e operadores, verifica registros.</li>
  <li><strong>Verificação no chão de fábrica/campo:</strong> observa operações reais, verifica calibração, identificação, rastreabilidade.</li>
  <li><strong>Reunião de encerramento:</strong> apresenta achados, classifica (NC maior, NC menor, oportunidade de melhoria).</li>
</ol>

<h3>Classificação de achados</h3>

<table>
  <tr><th>Classificação</th><th>Definição</th><th>Consequência</th></tr>
  <tr><td>Não conformidade maior</td><td>Falha sistemática ou ausência total de requisito</td><td>Certificação não é concedida até resolução (prazo 90 dias)</td></tr>
  <tr><td>Não conformidade menor</td><td>Falha pontual, não sistemática</td><td>Certificação e concedida, mas NC deve ser tratada até a próxima auditoria</td></tr>
  <tr><td>Oportunidade de melhoria</td><td>Atende ao requisito mas poderia ser melhor</td><td>Informativo, não bloqueia certificação</td></tr>
</table>

<div class="example"><strong>Exemplo prático — Não conformidades mais comuns em auditorias de certificação:</strong>
<ul>
  <li>Instrumento de medição com calibração vencida em uso na produção (7.1.5).</li>
  <li>Análise crítica pela direção sem todas as entradas obrigatórias (9.3.2).</li>
  <li>Ação corretiva sem análise de causa raiz — apenas correção (10.2).</li>
  <li>Objetivos da qualidade sem plano de ação associado (6.2).</li>
  <li>Risco identificado mas sem ação implementada (6.1).</li>
  <li>Competência de operador não evidenciada para função crítica (7.2).</li>
</ul></div>

<h3>Dicas para o dia da auditoria</h3>

<ul>
  <li>Responda o que foi perguntado — não mais, não menos. Não "ofereca" problemas.</li>
  <li>Se não souber a resposta, diga "vou verificar" — e efetivamente verifique.</li>
  <li>Mostre evidências concretas (registros, telas, fotos) — não apenas explique verbalmente.</li>
  <li>Seja honesto. Se algo não está implementado ainda, diga. Tentar enganar o auditor sempre termina mal.</li>
  <li>Mantenha a calma. O auditor não é um inimigo — é um profissional fazendo seu trabalho.</li>
</ul>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Uma NC maior indica falha sistematica ou ausência total de requisito e impede a certificação até ser resolvida." data-fb-nok="Incorreto. NC maior = falha sistematica que impede a certificação. NC menor = falha pontual que não bloqueia, mas deve ser tratada."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Qual é a consequência de uma não conformidade maior na auditoria de certificação?</div><button class="qi-option" data-key="a">A certificação não é concedida até a NC ser resolvida (prazo de 90 dias)</button><button class="qi-option" data-key="b">A certificação e concedida normalmente, com observação no certificado</button><button class="qi-option" data-key="c">A empresa e automaticamente reprovada e deve reiniciar todo o processo</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Checklist de preparação pré-auditoria de certificação</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.3 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'manutencao-sgq', 'Manutenção e Melhoria Contínua do SGQ', '20 min', 3, ${`
<h2>Manutenção e Melhoria Contínua do SGQ após a Certificação</h2>

<p>Conseguir o certificado e importante, mas mantê-lo e o verdadeiro desafio. O certificado ISO 9001 tem validade de 3 anos, com auditorias de manutenção anuais. Se a organização relaxar após a certificação, a próxima auditoria vai revelar a deterioração — e o certificado pode ser suspenso.</p>

<h3>Ciclo de certificação (3 anos)</h3>

<div class="diagram"><svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg"><text x="200" y="16" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">Ciclo de Certificação ISO 9001 (3 anos)</text><defs><marker id="arrCiclo" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><path d="M0 0 L7 2.5 L0 5" fill="#0b1730"/></marker></defs><rect x="15" y="35" width="85" height="45" rx="6" fill="#16a34a" opacity="0.15" stroke="#16a34a" stroke-width="2"/><text x="57" y="52" text-anchor="middle" font-size="9" fill="#16a34a" font-weight="bold">Ano 1</text><text x="57" y="65" text-anchor="middle" font-size="7" fill="#0b1730">Certificação</text><text x="57" y="75" text-anchor="middle" font-size="7" fill="#0b1730">Fase 1 + Fase 2</text><line x1="100" y1="57" x2="115" y2="57" stroke="#0b1730" stroke-width="1.2" marker-end="url(#arrCiclo)"/><rect x="118" y="35" width="85" height="45" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="160" y="52" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Ano 2</text><text x="160" y="65" text-anchor="middle" font-size="7" fill="#0b1730">Manutenção 1</text><text x="160" y="75" text-anchor="middle" font-size="7" fill="#0b1730">Parcial (1-2 dias)</text><line x1="203" y1="57" x2="218" y2="57" stroke="#0b1730" stroke-width="1.2" marker-end="url(#arrCiclo)"/><rect x="221" y="35" width="85" height="45" rx="6" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1.5"/><text x="263" y="52" text-anchor="middle" font-size="9" fill="#2563eb" font-weight="bold">Ano 3</text><text x="263" y="65" text-anchor="middle" font-size="7" fill="#0b1730">Manutenção 2</text><text x="263" y="75" text-anchor="middle" font-size="7" fill="#0b1730">Parcial (1-2 dias)</text><line x1="306" y1="57" x2="321" y2="57" stroke="#0b1730" stroke-width="1.2" marker-end="url(#arrCiclo)"/><rect x="324" y="35" width="70" height="45" rx="6" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/><text x="359" y="52" text-anchor="middle" font-size="9" fill="#c5383c" font-weight="bold">Ano 4</text><text x="359" y="65" text-anchor="middle" font-size="7" fill="#0b1730">Recertificação</text><text x="359" y="75" text-anchor="middle" font-size="7" fill="#0b1730">Completa</text><path d="M359 80 Q359 120 200 130 Q40 120 57 80" fill="none" stroke="#0b1730" stroke-width="1" stroke-dasharray="4 2" marker-end="url(#arrCiclo)"/><text x="200" y="148" text-anchor="middle" font-size="8" fill="#0b1730" font-style="italic">Ciclo se repete a cada 3 anos</text></svg><figcaption>Ciclo trienal: certificação → 2 manutenções anuais → recertificação</figcaption></div>

<table>
  <tr><th>Ano</th><th>Tipo de auditoria</th><th>Escopo</th><th>Duração tipica (PME)</th></tr>
  <tr><td>Ano 1</td><td>Certificação (Fase 1 + Fase 2)</td><td>Completo — todos os requisitos</td><td>3-5 dias</td></tr>
  <tr><td>Ano 2</td><td>Manutenção (Vigilância 1)</td><td>Parcial — amostragem de processos</td><td>1-2 dias</td></tr>
  <tr><td>Ano 3</td><td>Manutenção (Vigilância 2)</td><td>Parcial — outros processos</td><td>1-2 dias</td></tr>
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

<div class="example"><strong>Exemplo prático — Construtora:</strong> Após a certificação, a construtora designou 4 horas semanais do coordenador de qualidade para atividades de manutenção do SGQ: verificar não conformidades de obra (segunda), atualizar indicadores (terça), acompanhar ações corretivas (quarta) e preparar material para a reunião mensal de indicadores (quinta). Esse investimento de tempo manteve o SGQ ativo sem sobrecarregar ninguém.</div>

<h3>Armadilhas comuns após a certificação</h3>

<ol>
  <li><strong>"Sindrome do diploma na parede":</strong> conseguir o certificado e esquecer o SGQ. O sistema morre em poucos meses.</li>
  <li><strong>Documentação defasada:</strong> processos mudam mas documentos não são atualizados. Gera divergência entre o real e o documentado.</li>
  <li><strong>Indicadores sem análise:</strong> coletar dados sem analisá-los e agir sobre eles. Vira burocracia pura.</li>
  <li><strong>Auditoria interna pro-forma:</strong> auditoria feita "para cumprir tabela" sem profundidade. Não gera melhoria.</li>
  <li><strong>Direção se desconecta:</strong> após a certificação, a direção delega tudo ao "pessoal da qualidade". O comprometimento some.</li>
</ol>

<div class="callout"><strong>Importante:</strong> O SGQ deve gerar VALOR para a gestão, não ser um peso. Se os gestores veem o SGQ como burocracia, algo esta errado. Revise: os indicadores são úteis para decisões? Os procedimentos ajudam o trabalho? As auditorias revelam oportunidades reais? Se a resposta for "não" em algum desses pontos, simplifique e melhore o próprio SGQ.</div>

<h3>Evolução do SGQ — próximos passos</h3>

<p>Após consolidar a ISO 9001, muitas organizações evoluem para:</p>

<ul>
  <li><strong>ISO 14001:</strong> Sistema de Gestão Ambiental — integravel com ISO 9001 pela estrutura comum.</li>
  <li><strong>ISO 45001:</strong> Saúde e Segurança Ocupacional — substitui a antiga OHSAS 18001.</li>
  <li><strong>IATF 16949:</strong> Gestão da Qualidade Automotiva — para fornecedores do setor automotivo.</li>
  <li><strong>FSSC 22000:</strong> Segurança de Alimentos — para indústria alimentícia.</li>
  <li><strong>ISO 19011:</strong> Diretrizes para auditoria de sistemas de gestão — aprofundar competência de auditoria.</li>
</ul>

<div class="narration"><div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div><p>A Tigre S.A., fabricante catarinense de tubos e conexoes com mais de 7.000 funcionários, mantém certificação ISO 9001 há mais de 25 anos consecutivos. O segredo, segundo o diretor de qualidade, e que o SGQ nunca foi tratado como "projeto com data de fim". A empresa integrou os indicadores do SGQ no painel de gestão do dia a dia — não existe "reunião de qualidade" separada, porque qualidade faz parte de cada reunião operacional. Quando o SGQ e parte da cultura, a manutenção acontece naturalmente.</p></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Se o certificado tiver sido suspenso ou se a empresa relaxar após a certificação, a próxima auditoria revelara a deterioração do sistema." data-fb-nok="Incorreto. O certificado tem validade de 3 anos com auditorias de manutenção anuais. Relaxar após a certificação leva a suspensão."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">O que pode acontecer se a organização relaxar o SGQ após obter a certificação?</div><button class="qi-option" data-key="a">Nada — o certificado é válido por 3 anos independente do estado do SGQ</button><button class="qi-option" data-key="b">O certificado pode ser suspenso ou não renovado na auditoria de manutenção anual</button><button class="qi-option" data-key="c">O organismo certificador oferece um período de graca automatico de 6 meses</button><div class="qi-feedback"></div></div>

<div class="template-box"><span>Download: Calendário anual de manutenção do SGQ</span><a href="#">Baixar template</a></div>
`})`;

  // --- Aula 6.4 ---
  await sql`INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo) VALUES (${mod6}, 'prova-final-orientacoes', 'Orientações para a Prova Final e Encerramento', '20 min', 4, ${`
<h2>Orientações para a Prova Final e Encerramento</h2>

<p>Parabens por chegar até aqui! Você percorreu todas as cláusulas da ISO 9001:2015, com exemplos práticos da indústria brasileira. Agora vamos preparar você para a prova final do curso, que e requisito para a emissão do certificado.</p>

<h3>Formato da prova final</h3>

<ul>
  <li><strong>Número de questões:</strong> 30 questões de múltipla escolha.</li>
  <li><strong>Tempo:</strong> sem limite de tempo — faca com calma e concentração.</li>
  <li><strong>Nota mínima para aprovação:</strong> 70% (21 acertos em 30).</li>
  <li><strong>Tentativas:</strong> ilimitadas — se não passar, revise o conteúdo e tente novamente.</li>
  <li><strong>Abrangência:</strong> todos os 6 módulos do curso, com ênfase nas cláusulas 4 a 10.</li>
</ul>

<h3>Dicas para a prova</h3>

<ol>
  <li><strong>Leia a pergunta COMPLETA antes de ver as alternativas.</strong> Muitas questões tem pegadinhas sutis.</li>
  <li><strong>Preste atenção em palavras-chave:</strong> "deve" (obrigatório), "pode" (opcional), "quando aplicável" (condicional).</li>
  <li><strong>Identifique a cláusula:</strong> se a questão menciona "riscos e oportunidades", você sabe que e cláusula 6.1. Isso ajuda a contextualizar.</li>
  <li><strong>Elimine alternativas absurdas primeiro:</strong> geralmente 1 ou 2 alternativas são claramente incorretas. Elimine-as e compare as restantes.</li>
  <li><strong>Pense na prática:</strong> muitas questões pedem aplicação, não memorização. Pense em como você aplicaria o conceito numa empresa real.</li>
  <li><strong>Se tiver dúvida, volte ao conteúdo:</strong> as aulas ficam disponíveis. Releia a aula correspondente antes de responder.</li>
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

<p>Ao atingir 70% ou mais na prova final E ter concluído todas as aulas do curso, você recebera automaticamente o <strong>Certificado de Conclusão</strong> do curso "ISO 9001:2015 — Interpretação dos Requisitos", emitido pela Anders Tech, com carga horária de 12 horas.</p>

<p>O certificado e gerado em PDF, com código de verificação único que pode ser validado no site da Anders Tech. Você pode usá-lo para:</p>

<ul>
  <li>Comprovar competência em ISO 9001 para seu empregador.</li>
  <li>Compor horas de treinamento para auditorias de certificação.</li>
  <li>Incluir no curriculo/LinkedIn.</li>
  <li>Atender requisitos de qualificação de fornecedores.</li>
</ul>

<h3>Revisão rápida dos pontos-chave</h3>

<p>Antes de fazer a prova, relembre:</p>

<div class="accordion-lesson"><div class="acc-item"><button class="acc-trigger">Módulo 1 — Fundamentos <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>A ISO 9001:2015 tem 10 cláusulas, sendo que 4 a 10 contem requisitos auditáveis. A estrutura segue o ciclo PDCA: Plan (4-6), Do (7-8), Check (9), Act (10). Os 7 princípios são a base filosofica; os requisitos são a implementação prática.</p></div></div><div class="acc-item"><button class="acc-trigger">Módulo 2 — Contexto e Liderança <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>Análise de contexto (SWOT/PESTEL) e partes interessadas pertinentes. Escopo claro e específico. Mapa de processos com entradas, saídas e indicadores. Alta direção demonstra liderança com ações concretas.</p></div></div><div class="acc-item"><button class="acc-trigger">Módulo 3 — Planejamento <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>Mentalidade de risco substitui a antiga ação preventiva. Objetivos SMART com plano de ação. Mudanças no SGQ devem ser planejadas avaliando impacto e integridade do sistema.</p></div></div><div class="acc-item"><button class="acc-trigger">Módulo 4 — Apoio e Operação <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>Informação documentada substitui documentos + registros + procedimentos obrigatórios. Calibração é um dos itens mais auditados. Análise crítica de requisitos antes de aceitar pedidos. Fornecedores avaliados por critérios objetivos.</p></div></div><div class="acc-item"><button class="acc-trigger">Módulo 5 — Avaliação e Melhoria <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>Correção resolve o problema imediato; ação corretiva elimina a causa. Auditoria interna e ferramenta de melhoria, não de punição. Análise crítica pela direção deve ter todas as entradas obrigatórias e gerar decisões concretas.</p></div></div><div class="acc-item"><button class="acc-trigger">Módulo 6 — Integração e Certificação <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline fill="none" points="6 9 12 15 18 9"/></svg></button><div class="acc-body"><p>Implantação tipica: 6-12 meses. SGQ deve rodar 3 meses antes da auditoria. Certificado válido por 3 anos com auditorias de manutenção anuais. Organismo certificador deve ser acreditado pelo Inmetro/IAF.</p></div></div></div>

<div class="diagram"><svg viewBox="0 0 440 246" xmlns="http://www.w3.org/2000/svg"><text x="220" y="15" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">Mapa Mental — ISO 9001:2015 Completa</text><circle cx="220" cy="132" r="34" fill="#0b1730" opacity="0.08" stroke="#0b1730" stroke-width="1.5"/><text x="220" y="130" text-anchor="middle" font-size="9" fill="#0b1730" font-weight="bold">ISO 9001</text><text x="220" y="143" text-anchor="middle" font-size="7.5" fill="#0b1730">PDCA</text><line x1="220" y1="98" x2="220" y2="55" stroke="#2563eb" stroke-width="1"/><rect x="174.0" y="29.0" width="92" height="26" rx="5" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1"/><text x="220.0" y="45.0" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold">4. Contexto</text><line x1="244" y1="108" x2="325.8" y2="81.4" stroke="#2563eb" stroke-width="1"/><rect x="292.8" y="55.4" width="92" height="26" rx="5" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1"/><text x="338.8" y="71.4" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold">5. Liderança</text><line x1="254" y1="132" x2="342" y2="132" stroke="#2563eb" stroke-width="1"/><rect x="342.0" y="119.0" width="92" height="26" rx="5" fill="#2563eb" opacity="0.12" stroke="#2563eb" stroke-width="1"/><text x="388.0" y="135.0" text-anchor="middle" font-size="8" fill="#2563eb" font-weight="bold">6. Planejamento</text><line x1="244" y1="156" x2="325.8" y2="182.6" stroke="#16a34a" stroke-width="1"/><rect x="292.8" y="182.6" width="92" height="26" rx="5" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1"/><text x="338.8" y="198.6" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">7. Apoio</text><line x1="220" y1="166" x2="220" y2="209" stroke="#16a34a" stroke-width="1"/><rect x="174.0" y="209.0" width="92" height="26" rx="5" fill="#16a34a" opacity="0.12" stroke="#16a34a" stroke-width="1"/><text x="220.0" y="225.0" text-anchor="middle" font-size="8" fill="#16a34a" font-weight="bold">8. Operação</text><line x1="196" y1="156" x2="114.2" y2="182.6" stroke="#ca8a04" stroke-width="1"/><rect x="55.2" y="182.6" width="92" height="26" rx="5" fill="#ca8a04" opacity="0.12" stroke="#ca8a04" stroke-width="1"/><text x="101.2" y="198.6" text-anchor="middle" font-size="8" fill="#ca8a04" font-weight="bold">9. Avaliação</text><line x1="186" y1="132" x2="98" y2="132" stroke="#c5383c" stroke-width="1"/><rect x="6.0" y="119.0" width="92" height="26" rx="5" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1"/><text x="52.0" y="135.0" text-anchor="middle" font-size="8" fill="#c5383c" font-weight="bold">10. Melhoria</text><line x1="196" y1="108" x2="114.2" y2="81.4" stroke="#0b1730" stroke-width="1" stroke-dasharray="3 2"/><rect x="55.2" y="55.4" width="92" height="26" rx="5" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="1"/><text x="101.2" y="71.4" text-anchor="middle" font-size="8" fill="#0b1730" font-weight="bold">7 Princípios</text></svg><figcaption>Visão geral: todas as cláusulas da ISO 9001:2015 conectadas pelo ciclo PDCA</figcaption></div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A ISO 9001:2015 tem 10 cláusulas, sendo que as cláusulas 4 a 10 contem os requisitos auditáveis." data-fb-nok="Incorreto. A norma tem 10 cláusulas no total. As 3 primeiras são informativas; as cláusulas 4 a 10 contem requisitos auditáveis."><div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div><div class="qi-question">Quantas cláusulas tem a ISO 9001:2015 e quantas contem requisitos auditáveis?</div><button class="qi-option" data-key="a">8 cláusulas, todas com requisitos auditáveis</button><button class="qi-option" data-key="b">10 cláusulas, sendo que 4 a 10 contem requisitos auditáveis</button><button class="qi-option" data-key="c">10 cláusulas, todas com requisitos auditáveis</button><div class="qi-feedback"></div></div>

<div class="callout"><strong>Importante:</strong> Este curso ensinou a interpretar os requisitos. Para auditar, você precisara de um curso específico de auditor interno (ISO 19011). Para implantar, a prática e o melhor professor — aplique o que aprendeu, comece pelo básico e va evoluindo. A Anders Tech oferece consultoria para apoiar sua empresa na implantação e certificação.</div>

<h3>Obrigado!</h3>

<p>Esperamos que este curso tenha sido prático, objetivo e útil para sua carreira e sua empresa. A qualidade é uma jornada, não um destino. Bons estudos na prova final!</p>

<div class="template-box"><span>Download: Resumo executivo da ISO 9001:2015 (todas as cláusulas em 4 páginas)</span><a href="#">Baixar template</a></div>
`})`;

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ — Perguntas por módulo (5 por módulo = 30)
  // ═══════════════════════════════════════════════════════════════════

  // --- Quiz Módulo 1 ---
  const m1q = [
    {
      pergunta: 'Qual é o principal objetivo da ISO 9001:2015?',
      alternativas: ['Certificar produtos para exportação', 'Definir requisitos para um Sistema de Gestão da Qualidade', 'Estabelecer limites de tolerância para peças mecânicas', 'Regulamentar a segurança do trabalho na indústria'],
      correta: 1,
      explicacao: 'A ISO 9001 define requisitos para um SGQ que permita a organização fornecer consistentemente produtos e serviços que atendam aos requisitos do cliente e regulamentares.'
    },
    {
      pergunta: 'Quantos princípios de gestão da qualidade fundamentam a ISO 9001:2015?',
      alternativas: ['5', '6', '7', '8'],
      correta: 2,
      explicacao: 'São 7 princípios: Foco no cliente, Liderança, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisão baseada em evidência e Gestão de relacionamento.'
    },
    {
      pergunta: 'Qual estrutura padronizada a ISO 9001:2015 adota para facilitar a integração com outras normas de gestão?',
      alternativas: ['Estrutura de 8 cláusulas', 'Anexo SL (Estrutura de Alto Nível)', 'Modelo EFQM', 'Ciclo DMAIC'],
      correta: 1,
      explicacao: 'O Anexo SL define a Estrutura de Alto Nível (HLS) com 10 cláusulas, padronizando todas as normas de sistemas de gestão (ISO 9001, ISO 14001, ISO 45001, etc.).'
    },
    {
      pergunta: 'Qual das seguintes mudanças NÃO ocorreu na transição da ISO 9001:2008 para a 2015?',
      alternativas: ['Eliminação da obrigatoriedade do Manual da Qualidade', 'Introdução da mentalidade de risco', 'Eliminação da necessidade de auditoria interna', 'Adoção da Estrutura de Alto Nível com 10 cláusulas'],
      correta: 2,
      explicacao: 'A auditoria interna continua sendo obrigatória na versão 2015 (cláusula 9.2). O que mudou foi a eliminação do Manual da Qualidade obrigatório, a introdução da mentalidade de risco e a estrutura de 10 cláusulas.'
    },
    {
      pergunta: 'As cláusulas 1 a 3 da ISO 9001:2015 contem requisitos auditáveis?',
      alternativas: ['Sim, todas contem requisitos obrigatórios', 'Não, são cláusulas informativas', 'Apenas a cláusula 3 contem requisitos', 'Depende do porte da organização'],
      correta: 1,
      explicacao: 'As cláusulas 1 (Escopo), 2 (Referência normativa) e 3 (Termos e definições) são informativas. Os requisitos auditáveis estão nas cláusulas 4 a 10.'
    }
  ];

  for (const q of m1q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod1}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Módulo 2 ---
  const m2q = [
    {
      pergunta: 'O que a cláusula 4.1 da ISO 9001:2015 exige que a organização determine?',
      alternativas: ['Apenas os requisitos legais aplicáveis', 'As questões externas e internas pertinentes ao seu propósito e direção estratégica', 'O número mínimo de funcionários para o SGQ', 'A lista de todos os concorrentes do mercado'],
      correta: 1,
      explicacao: 'A cláusula 4.1 exige que a organização determine questões externas e internas pertinentes para seu propósito, direção estratégica e que afetem o SGQ.'
    },
    {
      pergunta: 'Ao identificar partes interessadas (cláusula 4.2), a organização deve listar:',
      alternativas: ['Todas as partes interessadas existentes no mundo', 'Apenas clientes e fornecedores', 'As partes interessadas pertinentes ao SGQ e seus requisitos relevantes', 'Apenas as partes interessadas que reclamam formalmente'],
      correta: 2,
      explicacao: 'A norma pede que sejam identificadas as partes interessadas PERTINENTES ao SGQ e seus requisitos RELEVANTES — não todas as partes existentes.'
    },
    {
      pergunta: 'Na versão 2015, quando um requisito da norma não se aplica, a organização deve:',
      alternativas: ['Ignorar completamente o requisito', 'Solicitar autorização do organismo certificador', 'Justificar a não aplicabilidade, que não pode afetar a conformidade do produto/serviço', 'Incluir o requisito mesmo assim, pois todos são obrigatórios'],
      correta: 2,
      explicacao: 'Na versão 2015, não existem "exclusoes" como na 2008. A organização justifica a não aplicabilidade, desde que isso não afete a conformidade dos produtos/serviços.'
    },
    {
      pergunta: 'Qual é o papel da alta direção conforme a cláusula 5.1?',
      alternativas: ['Delegar toda a gestão da qualidade ao coordenador', 'Demonstrar liderança e comprometimento com o SGQ através de ações concretas', 'Apenas assinar a política da qualidade uma vez ao ano', 'Participar apenas das reuniões de auditoria externa'],
      correta: 1,
      explicacao: 'A cláusula 5.1 exige que a alta direção demonstre liderança e comprometimento, responsabilizando-se pela eficácia do SGQ, alocando recursos, comunicando importância e engajando pessoas.'
    },
    {
      pergunta: 'A política da qualidade deve, entre outros requisitos:',
      alternativas: ['Ser idêntica para todas as empresas do mesmo setor', 'Ser secreta e acessível apenas a direção', 'Ser apropriada ao contexto, prover estrutura para objetivos e incluir comprometimento com melhoria contínua', 'Conter metas numéricas detalhadas para todos os indicadores'],
      correta: 2,
      explicacao: 'A política deve ser apropriada ao propósito e contexto, prover estrutura para definir objetivos, incluir comprometimento com requisitos aplicáveis e melhoria contínua, e ser comunicada na organização.'
    }
  ];

  for (const q of m2q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod2}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Módulo 3 ---
  const m3q = [
    {
      pergunta: 'A cláusula 6.1 exige que a organização utilize qual metodologia formal de gestão de riscos?',
      alternativas: ['FMEA obrigatóriamente', 'ISO 31000 obrigatóriamente', 'Nenhuma específica — a norma pede mentalidade de risco, não metodologia formal', 'Análise Bow-Tie obrigatóriamente'],
      correta: 2,
      explicacao: 'A norma NÃO exige metodologia formal de gestão de riscos. Ela pede que a organização considere riscos e oportunidades de forma proporcional a sua complexidade.'
    },
    {
      pergunta: 'Os objetivos da qualidade (cláusula 6.2) devem ser:',
      alternativas: ['Genéricos e aplicáveis a qualquer empresa', 'Mensuráveis, coerentes com a política e ter plano de ação para alcançá-los', 'Definidos apenas pelo coordenador de qualidade', 'Revisados somente a cada 3 anos na recertificação'],
      correta: 1,
      explicacao: 'Os objetivos devem ser mensuráveis, coerentes com a política, considerar requisitos aplicáveis, ser pertinentes para conformidade e satisfação, monitorados, comunicados e atualizados, com plano de ação definido.'
    },
    {
      pergunta: 'A cláusula 6.3 (Planejamento de mudanças) exige que mudanças no SGQ considerem:',
      alternativas: ['Apenas o custo financeiro da mudança', 'Propósito, consequências, integridade do SGQ, recursos e responsabilidades', 'Apenas a opinião do organismo certificador', 'Somente mudanças de documentação'],
      correta: 1,
      explicacao: 'A cláusula 6.3 exige considerar o propósito e potenciais consequências da mudança, a integridade do SGQ, disponibilidade de recursos e alocação de responsabilidades.'
    },
    {
      pergunta: 'Qual dos seguintes é um exemplo de OPORTUNIDADE (não risco) na gestão de riscos do SGQ?',
      alternativas: ['Fornecedor entregar material fora de especificação', 'Novo mercado emergente buscando fornecedores qualificados', 'Máquina com manutenção atrasada', 'Operador sem treinamento adequado'],
      correta: 1,
      explicacao: 'A gestão de riscos inclui oportunidades (efeitos positivos da incerteza). Um novo mercado buscando fornecedores é uma oportunidade que pode ser explorada. Os demais são riscos (efeitos negativos).'
    },
    {
      pergunta: 'Um objetivo da qualidade formulado como "Melhorar a qualidade" e inadequado porque:',
      alternativas: ['Não é possível melhorar a qualidade', 'Não é mensurável, não tem meta numérica nem prazo', 'A norma proibe objetivos relacionados a qualidade', 'Deveria ser "Maximizar a qualidade"'],
      correta: 1,
      explicacao: 'Objetivos devem ser mensuráveis. "Melhorar a qualidade" não tem meta numérica nem prazo, sendo impossível avaliar se foi alcancado. O correto seria algo como "Reduzir o índice de refugo de 4% para 2,5% até dezembro".'
    }
  ];

  for (const q of m3q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod3}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Módulo 4 ---
  const m4q = [
    {
      pergunta: 'O que a cláusula 7.1.5 exige sobre instrumentos de medição utilizados para verificar conformidade de produtos?',
      alternativas: ['Devem ser novos e importados', 'Devem ser calibrados ou verificados em intervalos especificados, contra padrões rastreáveis', 'Basta que funcionem corretamente no momento do uso', 'Apenas instrumentos digitais são aceitos'],
      correta: 1,
      explicacao: 'A cláusula 7.1.5 exige que instrumentos usados para verificar conformidade sejam calibrados/verificados periodicamente contra padrões rastreaveis, identificados e protegidos.'
    },
    {
      pergunta: 'Na ISO 9001:2015, "manter informação documentada" equivale ao antigo conceito de:',
      alternativas: ['Registro (evidência de atividade realizada)', 'Documento (procedimento, instrução de trabalho que e atualizado)', 'Backup de dados em nuvem', 'Manual da qualidade'],
      correta: 1,
      explicacao: '"Manter" informação documentada equivale ao antigo "documento" (algo que se atualiza). "Reter" equivale ao antigo "registro" (evidência de que algo foi feito).'
    },
    {
      pergunta: 'A análise crítica de requisitos (cláusula 8.2.3) deve ser realizada:',
      alternativas: ['Somente após a entrega do produto', 'Antes de se comprometer a fornecer o produto/serviço', 'Apenas para clientes internacionais', 'Somente quando o cliente solicitar formalmente'],
      correta: 1,
      explicacao: 'A análise crítica de requisitos deve ser feita ANTES de a organização se comprometer a fornecer, para garantir que tem capacidade de atender todos os requisitos.'
    },
    {
      pergunta: 'O que são "processos especiais" no contexto da cláusula 8.5.1?',
      alternativas: ['Processos realizados pela direção', 'Processos cujo resultado não pode ser verificado por inspeção posterior', 'Processos que usam máquinas importadas', 'Processos que custam mais de R$ 100.000'],
      correta: 1,
      explicacao: 'Processos especiais são aqueles cujo resultado não pode ser verificado por monitoramento/medição posterior (ex: solda, tratamento térmico, pintura). Eles precisam ser VALIDADOS e ter parâmetros controlados durante a execução.'
    },
    {
      pergunta: 'Ao identificar produto não conforme (cláusula 8.7), qual ação e INADEQUADA?',
      alternativas: ['Segregar o produto em área identificada', 'Retrabalhar para tornar conforme', 'Misturar com produtos conformes para diluir o problema', 'Obter autorização do cliente para aceitação sob concessão'],
      correta: 2,
      explicacao: 'Misturar produto não conforme com conforme e totalmente inadequado e pode gerar entrega de produto defeituoso ao cliente. As ações corretas são: segregar, retrabalhar, devolver ou obter concessão do cliente.'
    }
  ];

  for (const q of m4q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod4}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Módulo 5 ---
  const m5q = [
    {
      pergunta: 'Qual a diferença entre CORRECAO e ACAO CORRETIVA?',
      alternativas: ['São sinônimos — significam a mesma coisa', 'Correção resolve o problema imediato; ação corretiva elimina a causa para evitar recorrência', 'Correção e para problemas graves; ação corretiva e para problemas leves', 'Correção é feita pela produção; ação corretiva e feita pela direção'],
      correta: 1,
      explicacao: 'Correção e a ação imediata para resolver o problema pontual (ex: retrabalhar a peça). Ação corretiva visa eliminar a causa raiz para que o problema não se repita.'
    },
    {
      pergunta: 'A auditoria interna (cláusula 9.2) exige que os auditores:',
      alternativas: ['Sejam funcionários de empresas externas', 'Tenham imparcialidade — não auditem seu próprio trabalho', 'Sejam engenheiros formados', 'Tenham pelo menos 10 anos de experiência'],
      correta: 1,
      explicacao: 'A norma exige que os auditores sejam selecionados de forma a assegurar objetividade e imparcialidade do processo de auditoria. Ninguém audita seu próprio trabalho.'
    },
    {
      pergunta: 'Qual das seguintes NÃO é uma entrada obrigatória da análise crítica pela direção (cláusula 9.3)?',
      alternativas: ['Satisfação do cliente', 'Resultados de auditoria', 'Orçamento detalhado do próximo exercício fiscal', 'Desempenho de provedores externos'],
      correta: 2,
      explicacao: 'O orçamento detalhado não é entrada obrigatória da análise crítica. As entradas obrigatórias incluem: situação de ações anteriores, mudanças no contexto, desempenho do SGQ (satisfação, objetivos, processos, NCs, auditorias, fornecedores), adequação de recursos, eficácia de ações para riscos e oportunidades de melhoria.'
    },
    {
      pergunta: 'A ferramenta "5 Porquês" é utilizada para:',
      alternativas: ['Definir os 5 objetivos estratégicos da organização', 'Identificar a causa raiz de um problema perguntando "por que?" iterativamente', 'Avaliar 5 fornecedores simultaneamente', 'Planejar 5 auditorias por ano'],
      correta: 1,
      explicacao: 'A técnica dos 5 Porquês consiste em perguntar "por que?" repetidamente (tipicamente 5 vezes) até chegar a causa raiz de um problema, saindo do sintoma superficial para a causa fundamental.'
    },
    {
      pergunta: 'A ausência de reclamações formais de clientes pode ser interpretada como:',
      alternativas: ['Prova definitiva de satisfação total dos clientes', 'Indicativo que não precisa de pesquisa de satisfação', 'Não necessariamente indica satisfação — a organização deve buscar ativamente a percepção do cliente', 'Razão suficiente para eliminar o indicador de satisfação'],
      correta: 2,
      explicacao: 'A norma e clara: a organização deve MONITORAR a percepção do cliente. A ausência de reclamações não é evidência de satisfação — muitos clientes insatisfeitos simplesmente migram para concorrentes sem reclamar formalmente.'
    }
  ];

  for (const q of m5q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod5}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // --- Quiz Módulo 6 ---
  const m6q = [
    {
      pergunta: 'Qual a validade do certificado ISO 9001 e com que frequência ocorrem auditorias de manutenção?',
      alternativas: ['5 anos com auditoria a cada 2 anos', '3 anos com auditorias de manutenção anuais', '1 ano com renovação anual', '10 anos sem necessidade de auditorias intermediárias'],
      correta: 1,
      explicacao: 'O certificado ISO 9001 tem validade de 3 anos. Nesse período, há auditorias de manutenção (vigilância) anuais. Após 3 anos, é necessária auditoria de recertificação.'
    },
    {
      pergunta: 'A auditoria de certificação é dividida em duas fases. A Fase 1 consiste em:',
      alternativas: ['Auditoria completa no chão de fábrica', 'Análise documental e verificação da prontidao do SGQ', 'Entrevista apenas com operadores', 'Teste de produto em laboratório externo'],
      correta: 1,
      explicacao: 'A Fase 1 e a análise documental, onde o auditor verifica se a documentação do SGQ esta adequada, se os requisitos estão enderecados e identifica áreas de preocupação para a Fase 2.'
    },
    {
      pergunta: 'Qual das seguintes é uma "armadilha" comum após a certificação?',
      alternativas: ['Manter as auditorias internas em dia', 'Atualizar os documentos quando os processos mudam', 'Coletar indicadores sem analisá-los e sem tomar ações', 'Envolver a direção nas análises críticas'],
      correta: 2,
      explicacao: 'Coletar dados sem analisá-los e agir sobre eles é uma armadilha comum — vira burocracia pura sem gerar valor. Os indicadores existem para apoiar decisões e direcionar a melhoria.'
    },
    {
      pergunta: 'Qual organismo deve acreditar o certificador para que o certificado ISO 9001 tenha validade no Brasil?',
      alternativas: ['ABNT', 'Inmetro (ou membro do IAF)', 'Ministerio da Indústria', 'ISO diretamente'],
      correta: 1,
      explicacao: 'O organismo certificador deve ser acreditado pelo Inmetro (ou por um membro do International Accreditation Forum — IAF). Um certificado de organismo não acreditado não tem validade de mercado.'
    },
    {
      pergunta: 'Antes da auditoria de certificação (Fase 2), a organização deve ter:',
      alternativas: ['Apenas a documentação pronta, sem necessidade de implementação', 'O SGQ implementado e funcionando por pelo menos alguns meses, com evidências de operação', 'Apenas o Manual da Qualidade atualizado', 'Somente treinamento dos operadores concluído'],
      correta: 1,
      explicacao: 'O SGQ deve estar implementado e gerando evidências de operação (registros, indicadores, auditorias internas, análise crítica) por pelo menos 3 meses antes da Fase 2. O auditor verifica implementação e eficácia, não apenas documentação.'
    }
  ];

  for (const q of m6q) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${mod6}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, false)`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUIZ FINAL — 30 questões (is_final = true)
  // ═══════════════════════════════════════════════════════════════════
  const finalQuiz = [
    {
      pergunta: 'A ISO 9001:2015 e uma norma que define requisitos para:',
      alternativas: ['Sistemas de Gestão Ambiental', 'Sistemas de Gestão da Qualidade', 'Sistemas de Gestão de Saúde e Segurança', 'Sistemas de Gestão de Segurança da Informação'],
      correta: 1,
      explicacao: 'A ISO 9001 define requisitos para Sistemas de Gestão da Qualidade. ISO 14001 e ambiental, ISO 45001 e saude/segurança, ISO 27001 e segurança da informação.'
    },
    {
      pergunta: 'Qual dos seguintes NÃO é um dos 7 princípios de gestão da qualidade?',
      alternativas: ['Foco no cliente', 'Minimização de custos', 'Melhoria', 'Tomada de decisão baseada em evidência'],
      correta: 1,
      explicacao: 'Os 7 princípios são: Foco no cliente, Liderança, Engajamento de pessoas, Abordagem de processo, Melhoria, Tomada de decisão baseada em evidência e Gestão de relacionamento. "Minimização de custos" não é um princípio.'
    },
    {
      pergunta: 'Na estrutura da ISO 9001:2015, a fase "Check" (Verificar) do ciclo PDCA corresponde a qual cláusula?',
      alternativas: ['Cláusula 6', 'Cláusula 8', 'Cláusula 9', 'Cláusula 10'],
      correta: 2,
      explicacao: 'Check = Cláusula 9 (Avaliação de desempenho). Plan = Cláusulas 4-6, Do = Cláusulas 7-8, Act = Cláusula 10.'
    },
    {
      pergunta: 'A principal mudança conceitual da versão 2008 para 2015 foi:',
      alternativas: ['Obrigatoriedade de certificação para todas as empresas', 'Introdução da mentalidade de risco em substituição a ação preventiva', 'Exigência de 20 procedimentos documentados obrigatórios', 'Eliminação da necessidade de indicadores'],
      correta: 1,
      explicacao: 'A mentalidade de risco (cláusula 6.1) substituiu a ação preventiva da versão 2008, permeando toda a norma com a consideração de riscos e oportunidades nas decisões.'
    },
    {
      pergunta: 'A análise de contexto (cláusula 4.1) deve considerar:',
      alternativas: ['Apenas fatores externos do mercado', 'Apenas fatores internos da organização', 'Fatores externos e internos pertinentes', 'Apenas fatores financeiros'],
      correta: 2,
      explicacao: 'A cláusula 4.1 exige que a organização determine questões externas (mercado, legislação, tecnologia) e internas (cultura, recursos, competências) pertinentes ao SGQ.'
    },
    {
      pergunta: 'Qual ferramenta e mais comumente utilizada por PMEs para atender a cláusula 4.1?',
      alternativas: ['Balanced Scorecard', 'Análise SWOT', 'Six Sigma DMAIC', 'Diagrama de Gantt'],
      correta: 1,
      explicacao: 'A análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças) e a ferramenta mais comum e prática para PMEs analisarem seu contexto interno e externo.'
    },
    {
      pergunta: 'A palavra-chave na cláusula 4.2 sobre partes interessadas e:',
      alternativas: ['Todas', 'Pertinentes', 'Prioritarias', 'Financeiras'],
      correta: 1,
      explicacao: 'A norma pede que sejam identificadas as partes interessadas "pertinentes" ao SGQ — não todas as existentes, mas aquelas que efetivamente impactam ou são impactadas pelo SGQ.'
    },
    {
      pergunta: 'O escopo do SGQ (cláusula 4.3) deve declarar:',
      alternativas: ['Apenas o nome da empresa', 'Os tipos de produtos e serviços cobertos, com justificativa para não aplicabilidades', 'O faturamento anual da empresa', 'A lista completa de funcionários'],
      correta: 1,
      explicacao: 'O escopo deve declarar os tipos de produtos/serviços cobertos pelo SGQ e justificar qualquer requisito da norma considerado não aplicável.'
    },
    {
      pergunta: 'Na versão 2015, a figura do Representante da Direção (RD):',
      alternativas: ['Continua obrigatória como na versão 2008', 'Deixou de ser obrigatória — a responsabilidade pelo SGQ e da alta direção', 'Foi substituída por um comite externo obrigatório', 'Passou a ser exigida em duplicidade'],
      correta: 1,
      explicacao: 'A versão 2015 eliminou a obrigatoriedade do RD para que a responsabilidade pelo SGQ seja da alta direção como um todo, não delegada a uma única pessoa.'
    },
    {
      pergunta: 'A política da qualidade deve ser:',
      alternativas: ['Idêntica para todas as empresas do mesmo setor', 'Genérica para se aplicar a qualquer situação', 'Apropriada ao contexto e propósito da organização, comunicada e entendida', 'Confidencial e acessível apenas a direção e auditores'],
      correta: 2,
      explicacao: 'A política deve ser apropriada ao contexto, prover estrutura para objetivos, incluir comprometimentos obrigatórios, ser comunicada e entendida na organização e disponível para partes interessadas.'
    },
    {
      pergunta: 'A gestão de riscos na ISO 9001:2015 exige:',
      alternativas: ['Uso obrigatório de FMEA em todos os processos', 'Contratação de especialista externo em riscos', 'Considerar riscos e oportunidades de forma proporcional a complexidade da organização', 'Certificação ISO 31000 como pré-requisito'],
      correta: 2,
      explicacao: 'A norma não exige metodologia formal específica. Pede que a organização considere riscos e oportunidades de forma proporcional. Uma PME pode usar uma planilha simples; uma grande indústria pode usar FMEA ou outras metodologias.'
    },
    {
      pergunta: 'Para cada objetivo da qualidade (cláusula 6.2), a organização deve determinar:',
      alternativas: ['Apenas a meta numérica', 'O que será feito, recursos, responsável, prazo e como avaliar resultados', 'Apenas o indicador de monitoramento', 'Apenas a data de início'],
      correta: 1,
      explicacao: 'A cláusula 6.2 exige plano de ação completo: o que será feito, recursos necessários, responsável, prazo e como os resultados serão avaliados.'
    },
    {
      pergunta: 'A cláusula 7.1.6 (Conhecimento organizacional) foi introduzida para tratar do problema de:',
      alternativas: ['Excesso de documentação', 'Conhecimento crítico que esta "na cabeca das pessoas" e pode ser perdido', 'Sigilo industrial', 'Proteção de dados pessoais (LGPD)'],
      correta: 1,
      explicacao: 'A cláusula 7.1.6 trata da gestão do conhecimento organizacional — garantir que o conhecimento necessário seja identificado, mantido e disponibilizado, evitando perda quando pessoas-chave saem da organização.'
    },
    {
      pergunta: 'Na ISO 9001:2015, o termo "informação documentada" unificou os antigos conceitos de:',
      alternativas: ['Apenas "documento" e "manual"', 'Apenas "registro" e "formulário"', '"Documento", "registro" e "procedimento documentado"', '"Política" e "objetivo"'],
      correta: 2,
      explicacao: 'O termo "informação documentada" unificou três conceitos da versão 2008: "documento" (procedimento, instrução), "registro" (evidência) e "procedimento documentado" (os 6 obrigatórios).'
    },
    {
      pergunta: '"Manter informação documentada" na ISO 9001:2015 equivale ao antigo conceito de:',
      alternativas: ['Registro', 'Documento (que se atualiza)', 'Backup', 'Formulário em branco'],
      correta: 1,
      explicacao: '"Manter" = documento (algo atualizado, como procedimento ou política). "Reter" = registro (evidência de atividade realizada, como relatório de inspeção).'
    },
    {
      pergunta: 'A análise crítica de requisitos do cliente (cláusula 8.2.3) deve ser realizada:',
      alternativas: ['Depois da entrega do produto', 'Antes de a organização se comprometer a fornecer', 'Apenas quando o cliente reclama', 'Somente para pedidos acima de R$ 10.000'],
      correta: 1,
      explicacao: 'A análise crítica deve ser feita ANTES de aceitar o pedido/contrato, para garantir que a organização tem capacidade de atender todos os requisitos especificados.'
    },
    {
      pergunta: 'A calibração de instrumentos (cláusula 7.1.5) é necessária quando:',
      alternativas: ['O instrumento e novo', 'O monitoramento/medição e usado para verificar conformidade de produtos/serviços', 'O instrumento custou mais de R$ 1.000', 'O cliente solicita especificamente'],
      correta: 1,
      explicacao: 'A calibração e necessária quando o instrumento e usado para verificar conformidade de produtos/serviços com requisitos. Não depende do custo do instrumento, mas do seu uso para inspeção/controle.'
    },
    {
      pergunta: 'Um "processo especial" e aquele cujo resultado:',
      alternativas: ['Custa mais que os demais processos', 'Não pode ser verificado por inspeção posterior — requer validação', 'E destinado a clientes VIP', 'Envolve mais de 10 funcionários'],
      correta: 1,
      explicacao: 'Processos especiais (ex: solda, tratamento térmico, pintura) produzem resultados que não podem ser verificados por inspeção posterior sem destruição. Por isso, devem ser VALIDADOS e controlados durante a execução.'
    },
    {
      pergunta: 'O controle de fornecedores (cláusula 8.4) deve ser proporcional a:',
      alternativas: ['Ao faturamento do fornecedor', 'Ao impacto do produto/serviço fornecido na conformidade do produto final', 'A distância geografica do fornecedor', 'A idade do relacionamento comercial'],
      correta: 1,
      explicacao: 'O nível de controle deve ser proporcional ao impacto que o produto/serviço do fornecedor tem na conformidade do produto final. Um fornecedor de materia-prima crítica requer mais controle que um fornecedor de material de escritório.'
    },
    {
      pergunta: 'Ao identificar produto não conforme (cláusula 8.7), a primeira ação deve ser:',
      alternativas: ['Destruir o produto imediatamente', 'Identificar e segregar para prevenir uso ou entrega não intencional', 'Enviar ao cliente com desconto', 'Registrar e continuar a produção normalmente'],
      correta: 1,
      explicacao: 'A primeira ação e identificar e segregar (separar) o produto não conforme para evitar que seja usado ou entregue por engano. Depois se decide a disposição (retrabalho, refugo, concessão).'
    },
    {
      pergunta: 'A satisfação do cliente (cláusula 9.1.2) deve ser monitorada:',
      alternativas: ['Apenas quando há reclamações formais', 'Ativamente, usando métodos definidos pela organização', 'Apenas a cada 3 anos na recertificação', 'Somente por pesquisa impressa enviada pelo correio'],
      correta: 1,
      explicacao: 'A organização deve determinar métodos para obter, monitorar e analisar a percepção dos clientes. A norma não específica qual método — pode ser pesquisa, entrevista, análise de indicadores, etc. Mas deve ser ativo, não passivo.'
    },
    {
      pergunta: 'Em uma auditoria interna (cláusula 9.2), o gerente de produção pode auditar:',
      alternativas: ['O processo de produção que ele gerencia', 'Qualquer processo, exceto o que ele gerencia', 'Apenas processos de apoio', 'Apenas a documentação, não o processo'],
      correta: 1,
      explicacao: 'A norma exige imparcialidade — o auditor não pode auditar seu próprio trabalho. O gerente de produção pode auditar outros processos (compras, RH, qualidade), mas não a produção.'
    },
    {
      pergunta: 'As saídas da análise crítica pela direção (cláusula 9.3.3) devem incluir:',
      alternativas: ['Apenas um relatório informativo sem ações', 'Decisões e ações sobre oportunidades de melhoria, mudanças no SGQ e necessidade de recursos', 'Apenas a data da próxima reunião', 'Apenas a aprovação do orçamento anual'],
      correta: 1,
      explicacao: 'As saídas devem ser decisões e ações concretas sobre: oportunidades de melhoria, necessidade de mudanças no SGQ e necessidade de recursos. Não pode ser apenas "manter monitoramento".'
    },
    {
      pergunta: 'A diferença fundamental entre correção e ação corretiva e:',
      alternativas: ['Correção e mais cara, ação corretiva e mais barata', 'Correção e para problemas grandes, ação corretiva e para problemas pequenos', 'Correção trata o efeito imediato, ação corretiva elimina a causa raiz', 'Não há diferença — são sinônimos'],
      correta: 2,
      explicacao: 'Correção = ação imediata para resolver o problema pontual (retrabalhar a peça). Ação corretiva = ação para eliminar a causa raiz e prevenir recorrência (recalibrar máquina, retreinar operador).'
    },
    {
      pergunta: 'A cláusula 10.3 (Melhoria contínua) pede que a organização:',
      alternativas: ['Apenas corrija problemas quando surgirem', 'Melhore continuamente a adequação, suficiência e eficácia do SGQ', 'Mude todos os processos a cada 6 meses', 'Contrate consultoria externa permanente'],
      correta: 1,
      explicacao: 'A melhoria contínua vai além de corrigir problemas. A organização deve buscar ativamente oportunidades de melhoria usando resultados de análises, auditorias e análises críticas.'
    },
    {
      pergunta: 'O certificado ISO 9001 tem validade de:',
      alternativas: ['1 ano', '2 anos', '3 anos', '5 anos'],
      correta: 2,
      explicacao: 'O certificado ISO 9001 tem validade de 3 anos, com auditorias de manutenção (vigilância) anuais. Após 3 anos, é necessária auditoria de recertificação.'
    },
    {
      pergunta: 'Numa auditoria de certificação, uma não conformidade maior significa que:',
      alternativas: ['A certificação e concedida com ressalvas', 'A certificação NÃO e concedida até a resolução da NC', 'A empresa deve pagar uma multa', 'O certificado e emitido mas com validade reduzida'],
      correta: 1,
      explicacao: 'Uma NC maior (falha sistemática ou ausência de requisito) impede a concessão da certificação. A empresa tem prazo (geralmente 90 dias) para resolver, e o auditor verifica a resolução antes de conceder o certificado.'
    },
    {
      pergunta: 'Qual das seguintes cláusulas NÃO contem requisitos auditáveis?',
      alternativas: ['Cláusula 4 (Contexto)', 'Cláusula 7 (Apoio)', 'Cláusula 3 (Termos e definições)', 'Cláusula 10 (Melhoria)'],
      correta: 2,
      explicacao: 'A cláusula 3 (Termos e definições) e informativa — remete a ISO 9000:2015. As cláusulas 4 a 10 contem requisitos auditáveis.'
    },
    {
      pergunta: 'A abordagem de processo (cláusula 4.4) exige que para cada processo sejam determinados:',
      alternativas: ['Apenas o nome e o responsável', 'Entradas, saídas, sequência, critérios, recursos, responsabilidades e riscos', 'Apenas o fluxograma', 'Apenas o indicador de resultado'],
      correta: 1,
      explicacao: 'A cláusula 4.4 exige determinação completa: entradas, saídas, sequência e interação, critérios e métodos, recursos, responsabilidades e autoridades, riscos e oportunidades, e ações de melhoria.'
    },
    {
      pergunta: 'Ao planejar uma mudança no SGQ (cláusula 6.3), a organização deve considerar, EXCETO:',
      alternativas: ['O propósito da mudança e suas consequências', 'A integridade do SGQ', 'A opinião dos concorrentes sobre a mudança', 'A disponibilidade de recursos e a realocação de responsabilidades'],
      correta: 2,
      explicacao: 'A cláusula 6.3 exige considerar propósito e consequências, integridade do SGQ, disponibilidade de recursos e realocação de responsabilidades. A opinião de concorrentes não faz parte dos requisitos.'
    }
  ];

  for (const q of finalQuiz) {
    await sql`INSERT INTO ead_quiz_questions (module_id, course_id, pergunta, alternativas, resposta_correta, explicacao, is_final)
      VALUES (${null}, ${courseId}, ${q.pergunta}, ${JSON.stringify(q.alternativas)}::jsonb, ${q.correta}, ${q.explicacao}, true)`;
  }

  console.log(`Curso 1 seed completo: courseId=${courseId}, 6 módulos, 24 aulas, 30 quiz de módulo + 30 quiz final`);
  return courseId;
}
