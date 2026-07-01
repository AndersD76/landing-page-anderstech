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

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <!-- 1a parte -->
    <rect x="10" y="60" width="110" height="80" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="65" y="88" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">1ª Parte</text>
    <text x="65" y="106" text-anchor="middle" fill="#93c5fd" font-size="10">Auditoria</text>
    <text x="65" y="120" text-anchor="middle" fill="#93c5fd" font-size="10">Interna</text>
    <text x="65" y="134" text-anchor="middle" fill="#eab308" font-size="9">(própria org.)</text>
    <!-- seta 1→2 -->
    <line x1="120" y1="100" x2="155" y2="100" stroke="#c5383c" stroke-width="2" marker-end="url(#arr)"/>
    <!-- 2a parte -->
    <rect x="155" y="60" width="110" height="80" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="210" y="88" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">2ª Parte</text>
    <text x="210" y="106" text-anchor="middle" fill="#fca5a5" font-size="10">Auditoria de</text>
    <text x="210" y="120" text-anchor="middle" fill="#fca5a5" font-size="10">Fornecedor</text>
    <text x="210" y="134" text-anchor="middle" fill="#eab308" font-size="9">(cliente audita)</text>
    <!-- seta 2→3 -->
    <line x1="265" y1="100" x2="300" y2="100" stroke="#16a34a" stroke-width="2" marker-end="url(#arr2)"/>
    <!-- 3a parte -->
    <rect x="300" y="60" width="110" height="80" rx="8" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="355" y="88" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">3ª Parte</text>
    <text x="355" y="106" text-anchor="middle" fill="#86efac" font-size="10">Certificação</text>
    <text x="355" y="120" text-anchor="middle" fill="#86efac" font-size="10">Independente</text>
    <text x="355" y="134" text-anchor="middle" fill="#eab308" font-size="9">(organismo cert.)</text>
    <!-- rótulo superior -->
    <text x="210" y="25" text-anchor="middle" fill="#94a3b8" font-size="12">Tipos de Auditoria por "Parte"</text>
    <defs>
      <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c5383c"/></marker>
      <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/></marker>
    </defs>
  </svg>
  <figcaption>Classificação das auditorias: 1ª parte (interna), 2ª parte (cliente-fornecedor) e 3ª parte (certificação)</figcaption>
</div>

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

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma fabricante de autopeças em Sorocaba/SP precisava renovar sua certificação ISO 9001. Três meses antes da auditoria de recertificação, o novo coordenador de qualidade descobriu que as auditorias internas dos últimos dois anos tinham sido realizadas apenas no setor de produção — expedição, compras e RH nunca foram auditados. O organismo certificador considerou o programa de auditoria interna inadequado e emitiu uma não conformidade maior. A recertificação foi suspensa por 60 dias. Custo da omissão: atraso no contrato com a montadora e multa contratual de R$ 80 mil. A lição: auditoria interna não é formalidade — é requisito de negócio.</p>
</div>

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

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Confusão comum</h4><ul><li>"Vamos auditar as peças deste lote"</li><li>"A auditoria reprovou o produto"</li><li>"O auditor inspecionou a linha"</li><li>Usar auditoria como ferramenta punitiva</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Uso correto</h4><ul><li>"Vamos inspecionar as peças deste lote"</li><li>"A auditoria identificou NCs no processo"</li><li>"O auditor avaliou o processo de produção"</li><li>Auditoria como ferramenta de melhoria</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Auditoria avalia o sistema de gestão; inspeção avalia produtos ou resultados específicos." data-fb-nok="Não exatamente. Pense: auditoria foca em sistema/processo, inspeção foca em produto/resultado.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Uma empresa automotiva quer verificar se o seu processo de seleção de fornecedores atende à ISO 9001. Qual abordagem é mais adequada?</div>
  <button class="qi-option" data-key="a">A — Inspecionar os documentos de cada fornecedor individualmente</button>
  <button class="qi-option" data-key="b">B — Realizar uma auditoria do processo de qualificação e seleção de fornecedores</button>
  <button class="qi-option" data-key="c">C — Contratar um organismo certificador para auditar os fornecedores</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Empresas que realizam auditorias internas de qualidade com frequência têm, em média, 30% menos não conformidades nas auditorias de certificação externas. A auditoria interna não é custo — é investimento em previsibilidade e reputação.</div></div>

<div class="callout"><strong>Lembre-se:</strong> Auditoria avalia o <strong>sistema</strong> (como a organização gerencia a qualidade). Inspeção avalia o <strong>produto</strong> (se a peca esta dentro da tolerancia). Sao complementares, não substitutos.</div>
`}, NULL),

  (${m1.id}, '2-1-2-princípios-auditoria', 'Os 7 princípios da auditoria (ISO 19011)', '20 min', 2, ${`
<h2>Os 7 princípios da auditoria</h2>
<p>A ISO 19011:2018 estabelece 7 princípios que sustentam a prática da auditoria. Eles guiam o comportamento do auditor e garantem que os resultados sejam confiáveis e uteis. Um auditor que não segue esses princípios compromete toda a credibilidade do processo.</p>

<div class="diagram">
  <svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg">
    <!-- centro -->
    <circle cx="200" cy="170" r="46" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="200" y="164" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">7 Princípios</text>
    <text x="200" y="178" text-anchor="middle" fill="#93c5fd" font-size="9">ISO 19011</text>
    <!-- raios -->
    <line x1="200" y1="124" x2="200" y2="56" stroke="#475569" stroke-width="1.5"/>
    <line x1="240" y1="135" x2="298" y2="86" stroke="#475569" stroke-width="1.5"/>
    <line x1="244" y1="184" x2="320" y2="192" stroke="#475569" stroke-width="1.5"/>
    <line x1="222" y1="213" x2="254" y2="286" stroke="#475569" stroke-width="1.5"/>
    <line x1="178" y1="213" x2="146" y2="286" stroke="#475569" stroke-width="1.5"/>
    <line x1="156" y1="184" x2="80" y2="192" stroke="#475569" stroke-width="1.5"/>
    <line x1="160" y1="135" x2="102" y2="86" stroke="#475569" stroke-width="1.5"/>
    <!-- nós externos -->
    <circle cx="200" cy="42" r="28" fill="#c5383c" opacity="0.9"/>
    <text x="200" y="38" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">1.</text>
    <text x="200" y="50" text-anchor="middle" fill="#fff" font-size="8">Integridade</text>
    <circle cx="312" cy="74" r="28" fill="#2563eb" opacity="0.9"/>
    <text x="312" y="70" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">2.</text>
    <text x="312" y="82" text-anchor="middle" fill="#fff" font-size="8">Apresent.</text>
    <text x="312" y="92" text-anchor="middle" fill="#fff" font-size="7">Justa</text>
    <circle cx="340" cy="192" r="28" fill="#16a34a" opacity="0.9"/>
    <text x="340" y="188" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">3.</text>
    <text x="340" y="200" text-anchor="middle" fill="#fff" font-size="8">Cuidado</text>
    <text x="340" y="210" text-anchor="middle" fill="#fff" font-size="7">Profissional</text>
    <circle cx="266" cy="300" r="28" fill="#eab308" opacity="0.9"/>
    <text x="266" y="296" text-anchor="middle" fill="#0b1730" font-size="9" font-weight="bold">4.</text>
    <text x="266" y="308" text-anchor="middle" fill="#0b1730" font-size="8">Confiden-</text>
    <text x="266" y="318" text-anchor="middle" fill="#0b1730" font-size="7">cialidade</text>
    <circle cx="134" cy="300" r="28" fill="#7c3aed" opacity="0.9"/>
    <text x="134" y="296" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">5.</text>
    <text x="134" y="308" text-anchor="middle" fill="#fff" font-size="8">Indepen-</text>
    <text x="134" y="318" text-anchor="middle" fill="#fff" font-size="7">dência</text>
    <circle cx="60" cy="192" r="28" fill="#c5383c" opacity="0.9"/>
    <text x="60" y="188" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">6.</text>
    <text x="60" y="200" text-anchor="middle" fill="#fff" font-size="8">Baseada</text>
    <text x="60" y="210" text-anchor="middle" fill="#fff" font-size="7">Evidência</text>
    <circle cx="88" cy="74" r="28" fill="#0891b2" opacity="0.9"/>
    <text x="88" y="70" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">7.</text>
    <text x="88" y="82" text-anchor="middle" fill="#fff" font-size="8">Baseada</text>
    <text x="88" y="92" text-anchor="middle" fill="#fff" font-size="7">em Risco</text>
  </svg>
  <figcaption>Os 7 princípios da auditoria segundo a ISO 19011:2018 — pilares da credibilidade do auditor</figcaption>
</div>

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

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Dilema ético</div>
  <p>Carlos, auditor interno de uma distribuidora de alimentos no Paraná, descobriu durante uma auditoria do setor de RH que a empresa havia contratado funcionários sem os treinamentos obrigatórios de segurança alimentar — um requisito crítico da ISO 9001 e da legislação sanitária. O gerente de RH pediu para Carlos "dar uma passada" no achado porque "já estavam providenciando". Carlos sabia que registrar a não conformidade poderia gerar tensão política interna. Mas o princípio da <strong>integridade</strong> foi mais forte: ele registrou a NC, apresentou as evidências objetivas e recomendou prazo de 30 dias para correção. Três meses depois, durante a auditoria de certificação, o organismo externo elogiou a maturidade do programa de auditoria interna da empresa.</p>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Integridade</button><button class="tab-btn">Apresentação Justa</button><button class="tab-btn">Cuidado Profissional</button><button class="tab-btn">Confidencialidade</button></div>
  <div class="tab-panel active"><p><strong>Integridade</strong> significa relatar a verdade mesmo quando é inconveniente. Exemplo prático: você encontra um registro de inspeção com data adulterada. Mesmo que o responsável seja o gerente, o auditor íntegro registra a constatação com a evidência e segue o protocolo de reporte.</p></div>
  <div class="tab-panel"><p><strong>Apresentação justa</strong> significa nem exagerar nem minimizar. Exemplo: se 3 de 20 registros apresentaram falhas, o relatório diz "15% dos registros auditados apresentaram não conformidade" — não "todos os registros têm problema" nem "quase tudo está certo".</p></div>
  <div class="tab-panel"><p><strong>Cuidado profissional</strong> significa chegar preparado. Exemplo: antes de auditar o setor de calibração, o auditor estuda os requisitos da cláusula 7.1.5 da ISO 9001, os procedimentos internos do setor e os resultados da auditoria anterior. Não improvisa.</p></div>
  <div class="tab-panel"><p><strong>Confidencialidade</strong> significa que o que você encontra na auditoria fica no relatório — não vai para o corredor. Exemplo: ao auditar compras, você descobre os valores negociados com fornecedores estratégicos. Essas informações não são compartilhadas com outros setores.</p></div>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Auditar seu próprio setor viola o princípio da independência, pois ninguém pode ser imparcial ao avaliar seu próprio trabalho." data-fb-nok="Revise o princípio da independência: o auditor não pode auditar atividades pelas quais é responsável.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O supervisor do almoxarifado foi designado para auditar o almoxarifado na próxima semana. Qual princípio da auditoria está sendo violado?</div>
  <button class="qi-option" data-key="a">A — Confidencialidade, pois ele tem acesso a dados internos do setor</button>
  <button class="qi-option" data-key="b">B — Cuidado profissional, pois pode não ter o treinamento de auditor</button>
  <button class="qi-option" data-key="c">C — Independência, pois ele não pode auditar atividades pelas quais é responsável</button>
  <div class="qi-feedback"></div>
</div>

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

<p><strong>Autoavaliação — você pratica os 7 princípios?</strong> Marque os que já são naturais para você:</p>
<ul class="checklist">
  <li><span class="ck-box"></span>Relato constatações com honestidade, mesmo quando gera desconforto (Integridade)</li>
  <li><span class="ck-box"></span>Meus relatórios refletem exatamente o que encontrei, sem exageros (Apresentação justa)</li>
  <li><span class="ck-box"></span>Me preparo adequadamente antes de cada auditoria (Cuidado profissional)</li>
  <li><span class="ck-box"></span>Não comento informações da auditoria com pessoas não autorizadas (Confidencialidade)</li>
  <li><span class="ck-box"></span>Nunca audito meu próprio setor ou atividades das quais sou responsável (Independência)</li>
  <li><span class="ck-box"></span>Todas as minhas constatações têm evidências objetivas documentadas (Baseada em evidência)</li>
  <li><span class="ck-box"></span>Priorizo áreas e processos de maior risco no planejamento da auditoria (Baseada em risco)</li>
</ul>
`}, 'Autoavaliação: você pratica os 7 princípios?'),

  (${m1.id}, '2-1-3-estrutura-iso-19011', 'Estrutura da ISO 19011:2018', '15 min', 3, ${`
<h2>Estrutura da ISO 19011:2018</h2>
<p>A ISO 19011 e a norma-guia para auditoria de qualquer sistema de gestão — ISO 9001, 14001, 45001, 27001, etc. Ela não e certificável (não existe "certificação ISO 19011"), mas e a <strong>referência técnica</strong> que todo auditor deve conhecer.</p>

<div class="callout"><strong>Importante:</strong> A ISO 19011:2018 substituiu a versão 2012. A principal novidade foi a inclusão da <strong>abordagem baseada em risco</strong> como setimo princípio e como diretriz para o programa de auditoria.</div>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <!-- Bloco C1-4 -->
    <rect x="10" y="30" width="100" height="120" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
    <text x="60" y="55" text-anchor="middle" fill="#94a3b8" font-size="9">Cláusulas</text>
    <text x="60" y="69" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="bold">1 a 4</text>
    <text x="60" y="86" text-anchor="middle" fill="#94a3b8" font-size="8">Escopo,</text>
    <text x="60" y="98" text-anchor="middle" fill="#94a3b8" font-size="8">Referências,</text>
    <text x="60" y="110" text-anchor="middle" fill="#94a3b8" font-size="8">Termos,</text>
    <text x="60" y="122" text-anchor="middle" fill="#94a3b8" font-size="8">Princípios</text>
    <!-- seta -->
    <line x1="110" y1="90" x2="130" y2="90" stroke="#475569" stroke-width="1.5" marker-end="url(#arr3)"/>
    <!-- Bloco C5 -->
    <rect x="130" y="30" width="80" height="120" rx="6" fill="#1e3a5f" stroke="#2563eb" stroke-width="2"/>
    <text x="170" y="60" text-anchor="middle" fill="#93c5fd" font-size="9">Cláusula</text>
    <text x="170" y="74" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">5</text>
    <text x="170" y="91" text-anchor="middle" fill="#93c5fd" font-size="8">Gestão do</text>
    <text x="170" y="103" text-anchor="middle" fill="#93c5fd" font-size="8">Programa de</text>
    <text x="170" y="115" text-anchor="middle" fill="#93c5fd" font-size="8">Auditoria</text>
    <text x="170" y="131" text-anchor="middle" fill="#60a5fa" font-size="8">"Quando e quantas"</text>
    <!-- seta -->
    <line x1="210" y1="90" x2="230" y2="90" stroke="#475569" stroke-width="1.5" marker-end="url(#arr3)"/>
    <!-- Bloco C6 -->
    <rect x="230" y="20" width="80" height="140" rx="6" fill="#3b0a0a" stroke="#c5383c" stroke-width="2"/>
    <text x="270" y="50" text-anchor="middle" fill="#fca5a5" font-size="9">Cláusula</text>
    <text x="270" y="64" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">6</text>
    <text x="270" y="80" text-anchor="middle" fill="#fca5a5" font-size="8">Realização</text>
    <text x="270" y="92" text-anchor="middle" fill="#fca5a5" font-size="8">da Auditoria</text>
    <text x="270" y="108" text-anchor="middle" fill="#f87171" font-size="7">6 etapas</text>
    <text x="270" y="120" text-anchor="middle" fill="#f87171" font-size="7">do processo</text>
    <text x="270" y="136" text-anchor="middle" fill="#fca5a5" font-size="8">"Como fazer"</text>
    <!-- seta -->
    <line x1="310" y1="90" x2="330" y2="90" stroke="#475569" stroke-width="1.5" marker-end="url(#arr3)"/>
    <!-- Bloco C7 -->
    <rect x="330" y="30" width="80" height="120" rx="6" fill="#1a3a1a" stroke="#16a34a" stroke-width="2"/>
    <text x="370" y="60" text-anchor="middle" fill="#86efac" font-size="9">Cláusula</text>
    <text x="370" y="74" text-anchor="middle" fill="#ffffff" font-size="13" font-weight="bold">7</text>
    <text x="370" y="91" text-anchor="middle" fill="#86efac" font-size="8">Competência</text>
    <text x="370" y="103" text-anchor="middle" fill="#86efac" font-size="8">de Auditores</text>
    <text x="370" y="119" text-anchor="middle" fill="#4ade80" font-size="8">"Quem audita"</text>
    <text x="210" y="14" text-anchor="middle" fill="#94a3b8" font-size="11">Estrutura da ISO 19011:2018</text>
    <defs><marker id="arr3" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#475569"/></marker></defs>
  </svg>
  <figcaption>As três cláusulas operacionais da ISO 19011:2018 — cada uma responde uma pergunta diferente sobre a gestão de auditorias</figcaption>
</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">2018</div><div class="kpi-label">Versão atual da ISO 19011</div></div>
  <div class="kpi-card"><div class="kpi-value">7</div><div class="kpi-label">Cláusulas no total</div></div>
  <div class="kpi-card"><div class="kpi-value">6</div><div class="kpi-label">Etapas da cláusula 6 (realização)</div></div>
  <div class="kpi-card"><div class="kpi-value">+15</div><div class="kpi-label">Sistemas de gestão cobertos (ISO 9001, 14001, 45001…)</div></div>
</div>

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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Etapa 1 — Início</strong><br>Contato inicial com o auditado, confirmação de viabilidade, designação da equipe auditora e auditor-líder.</div></div>
  <div class="step-item"><div class="step-content"><strong>Etapa 2 — Preparação</strong><br>Análise documental prévia, elaboração do plano de auditoria e do checklist, comunicação ao auditado.</div></div>
  <div class="step-item"><div class="step-content"><strong>Etapa 3 — Condução</strong><br>Reunião de abertura, coleta de evidências (entrevistas, observações, análise de registros), reunião de encerramento.</div></div>
  <div class="step-item"><div class="step-content"><strong>Etapa 4 — Relatório</strong><br>Documentação das constatações, elaboração e aprovação do relatório de auditoria, distribuição aos responsáveis.</div></div>
  <div class="step-item"><div class="step-content"><strong>Etapa 5 — Conclusão</strong><br>Arquivo dos documentos, retroalimentação para o programa de auditoria, encerramento formal.</div></div>
  <div class="step-item"><div class="step-content"><strong>Etapa 6 — Follow-up</strong><br>Verificação das ações corretivas implementadas pelo auditado em resposta às não conformidades identificadas.</div></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A cláusula 5 trata do programa (visão macro/anual), enquanto a cláusula 6 trata da realização de cada auditoria individual." data-fb-nok="Revise as cláusulas: cláusula 5 = programa (conjunto de auditorias); cláusula 6 = realização (uma auditoria específica).">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual cláusula da ISO 19011:2018 orienta sobre como conduzir a reunião de abertura, a coleta de evidências e a reunião de encerramento de uma auditoria?</div>
  <button class="qi-option" data-key="a">A — Cláusula 5, que trata do programa de auditoria</button>
  <button class="qi-option" data-key="b">B — Cláusula 6, que trata da realização da auditoria</button>
  <button class="qi-option" data-key="c">C — Cláusula 7, que trata da competência dos auditores</button>
  <div class="qi-feedback"></div>
</div>

<h3>Cláusula 7 — Competência de auditores</h3>
<p>Define os <strong>conhecimentos e habilidades</strong> que um auditor deve ter, incluindo conhecimento da norma, do setor, técnicas de auditoria, e atributos pessoais como imparcialidade e postura ética.</p>

<div class="example"><strong>Visao geral:</strong> Pense assim — a cláusula 5 responde "quantas auditorias e quando?", a cláusula 6 responde "como fazer cada auditoria?" e a cláusula 7 responde "quem esta qualificado para auditar?".</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> As cláusulas 5, 6 e 7 formam um ciclo interdependente: o programa (5) define quem e quando; a realização (6) é o como; a competência (7) garante que o quem seja qualificado. Um programa de auditoria robusto precisa equilibrar as três dimensões — sem a cláusula 7, a cláusula 6 perde qualidade; sem a cláusula 5, a cláusula 6 vira improviso.</div></div>
`}, NULL),

  (${m1.id}, '2-1-4-termos-definições', 'Termos e definições essenciais', '15 min', 4, ${`
<h2>Termos e definições essenciais</h2>
<p>Para comunicar com clareza durante uma auditoria, você precisa dominar o vocabulario técnico. Confundir "constatação" com "conclusão" ou "critério" com "evidência" gera mal-entendidos que comprometem o relatório e a credibilidade do auditor.</p>

<div class="diagram">
  <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg">
    <!-- Hierarquia: Critério → Evidência → Constatação → Conclusão -->
    <rect x="10" y="50" width="90" height="60" rx="6" fill="#1e3a5f" stroke="#2563eb" stroke-width="2"/>
    <text x="55" y="75" text-anchor="middle" fill="#93c5fd" font-size="10" font-weight="bold">Critério</text>
    <text x="55" y="92" text-anchor="middle" fill="#64748b" font-size="8">ISO 9001,</text>
    <text x="55" y="104" text-anchor="middle" fill="#64748b" font-size="8">proc. interno</text>
    <!-- seta -->
    <line x1="100" y1="80" x2="118" y2="80" stroke="#475569" stroke-width="2" marker-end="url(#arr4)"/>
    <rect x="118" y="50" width="90" height="60" rx="6" fill="#1a3a1a" stroke="#16a34a" stroke-width="2"/>
    <text x="163" y="75" text-anchor="middle" fill="#86efac" font-size="10" font-weight="bold">Evidência</text>
    <text x="163" y="92" text-anchor="middle" fill="#64748b" font-size="8">Registros,</text>
    <text x="163" y="104" text-anchor="middle" fill="#64748b" font-size="8">declarações</text>
    <!-- seta -->
    <line x1="208" y1="80" x2="226" y2="80" stroke="#475569" stroke-width="2" marker-end="url(#arr4)"/>
    <rect x="226" y="50" width="90" height="60" rx="6" fill="#3b1f00" stroke="#eab308" stroke-width="2"/>
    <text x="271" y="75" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="bold">Constatação</text>
    <text x="271" y="92" text-anchor="middle" fill="#64748b" font-size="8">Evidência vs.</text>
    <text x="271" y="104" text-anchor="middle" fill="#64748b" font-size="8">Critério</text>
    <!-- seta -->
    <line x1="316" y1="80" x2="334" y2="80" stroke="#475569" stroke-width="2" marker-end="url(#arr4)"/>
    <rect x="334" y="50" width="76" height="60" rx="6" fill="#3b0a0a" stroke="#c5383c" stroke-width="2"/>
    <text x="372" y="75" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="bold">Conclusão</text>
    <text x="372" y="92" text-anchor="middle" fill="#64748b" font-size="8">Resultado</text>
    <text x="372" y="104" text-anchor="middle" fill="#64748b" font-size="8">geral</text>
    <!-- rótulo -->
    <text x="210" y="20" text-anchor="middle" fill="#94a3b8" font-size="11">Hierarquia lógica do processo de auditoria</text>
    <text x="210" y="148" text-anchor="middle" fill="#64748b" font-size="9">O auditor compara evidência com critério → gera constatações → agrupa em conclusão</text>
    <defs><marker id="arr4" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#475569"/></marker></defs>
  </svg>
  <figcaption>Fluxo lógico: o critério é a régua, a evidência é o que se observa, a constatação é o veredito e a conclusão é o resultado final</figcaption>
</div>

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

<div class="accordion-lesson">
  <div class="acc-item">
    <button class="acc-trigger">Critério de auditoria — definição detalhada <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>O critério é a <strong>régua de medição</strong> da auditoria — o conjunto de requisitos contra os quais as evidências são comparadas. Pode ser externo (ISO 9001:2015, regulamentos, legislação) ou interno (procedimentos, instruções de trabalho, especificações). Antes de auditar, o auditor deve ter clareza absoluta sobre quais critérios se aplicam ao processo que vai auditar.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">Evidência de auditoria — o que conta e o que não conta <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Evidência é toda informação <strong>verificável e objetiva</strong> que suporta uma constatação. Conta: registros preenchidos, certificados, observação direta, declarações verificadas. <strong>Não conta:</strong> "eu acho que...", "normalmente fazemos assim", suposições, impressões subjetivas do auditor. A regra de ouro: se não está documentado ou observado diretamente, não é evidência.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">Constatação vs. Não conformidade — diferença crítica <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>Constatação é o resultado da comparação entre evidência e critério — pode ser <strong>positiva</strong> (conformidade), <strong>negativa</strong> (não conformidade) ou <strong>neutra</strong> (oportunidade de melhoria). Não conformidade é apenas um tipo de constatação — aquela em que o requisito não foi atendido. Erro comum: usar "constatação" e "não conformidade" como sinônimos.</p></div>
  </div>
  <div class="acc-item">
    <button class="acc-trigger">Conclusão de auditoria — como chegar lá <svg class="acc-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></button>
    <div class="acc-body"><p>A conclusão é o <strong>julgamento final</strong> do auditor sobre o processo auditado, levando em conta todos os objetivos e constatações. É expressa na reunião de encerramento e no relatório. Exemplos: "O processo de compras atende os requisitos da ISO 9001 cláusula 8.4 com 1 NC menor identificada" ou "O SGQ da unidade X está implementado de forma eficaz".</p></div>
  </div>
</div>

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

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A evidência de auditoria são registros e fatos verificáveis. A opinião do auditor ou declarações não verificadas não constituem evidência objetiva." data-fb-nok="Cuidado: evidência precisa ser verificável e objetiva. Declaração do responsável sem documentação de suporte não é evidência suficiente.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Durante uma auditoria do setor de manutenção, o auditor pede o registro de manutenção preventiva do compressor. O responsável diz: "Sempre fazemos a manutenção em dia, mas o registro está no computador do técnico que está de férias." O que o auditor deve fazer?</div>
  <button class="qi-option" data-key="a">A — Registrar como não conformidade, pois a evidência objetiva (registro) não está disponível</button>
  <button class="qi-option" data-key="b">B — Aceitar a declaração verbal como evidência suficiente</button>
  <button class="qi-option" data-key="c">C — Aguardar o retorno do técnico antes de concluir a auditoria</button>
  <div class="qi-feedback"></div>
</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Como os termos se conectam na prática</strong><br>O auditor seleciona os <em>critérios</em> (cláusulas da ISO 9001 ou procedimentos internos) antes da auditoria.</div></div>
  <div class="step-item"><div class="step-content"><strong>Coleta evidências</strong><br>Analisa registros, faz entrevistas, observa o processo — tudo verificável e documentado.</div></div>
  <div class="step-item"><div class="step-content"><strong>Gera constatações</strong><br>Compara cada evidência com o critério correspondente: conforme, não conforme ou oportunidade de melhoria.</div></div>
  <div class="step-item"><div class="step-content"><strong>Formula a conclusão</strong><br>Agrupa todas as constatações e emite o julgamento final sobre o processo auditado.</div></div>
</div>

<h3>Confusoes comuns</h3>
<table>
<tr><th>Confusao</th><th>Correto</th></tr>
<tr><td>Tratar "constatação" como sinônimo de "não conformidade"</td><td>Constatação pode ser positiva (conformidade), negativa (NC) ou neutra (observação/OM)</td></tr>
<tr><td>Usar "auditoria" e "inspeção" como sinonimos</td><td>Auditoria avalia o sistema; inspeção avalia o produto</td></tr>
<tr><td>Confundir "plano de auditoria" com "programa de auditoria"</td><td>Plano = uma auditoria. Programa = todas as auditorias do periodo</td></tr>
</table>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Uso incorreto</h4><ul><li>"Encontrei várias constatações" (querendo dizer NCs)</li><li>"O critério é que a peça mede 10mm"</li><li>"Minha evidência é que o processo parece desorganizado"</li><li>"Vou auditar o produto antes de liberar"</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Uso correto</h4><ul><li>"Encontrei 2 NCs e 1 OM" (constatações específicas)</li><li>"O critério é a cláusula 7.1.5 da ISO 9001"</li><li>"A evidência é o registro de calibração vencido desde março"</li><li>"Vou inspecionar o produto antes de liberar"</li></ul></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Dominar a terminologia correta é o que diferencia um auditor credível de um que "parece que sabe". Em disputas de não conformidade com o auditado, quem usa os termos corretos e cita as fontes (ISO 19011, ISO 9001) tem autoridade técnica. Quem mistura os termos perde a confiança do auditado e compromete o relatório.</div></div>
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

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Plano de auditoria</h4><ul><li>Nivel operacional/tatico</li><li>Uma unica auditoria especifica</li><li>Agenda detalhada, horarios, entrevistados</li><li>Elaborado pelo auditor-lider</li><li>Validade: dias ou semanas</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Programa de auditoria</h4><ul><li>Nivel estrategico/gerencial</li><li>Todas as auditorias do periodo</li><li>Cronograma, processos, auditores, recursos</li><li>Elaborado pelo gestor do programa</li><li>Validade: meses ou um ano inteiro</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O programa e o planejamento anual macro — ele reune todas as auditorias do ciclo, auditores e recursos." data-fb-nok="Nao exatamente. Releia a tabela: programa = visao macro anual; plano = detalhamento de uma auditoria especifica.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O coordenador de qualidade preparou um documento definindo quais processos serao auditados em cada trimestre do ano, os auditores responsaveis e os recursos necessarios. Esse documento e:</div>
  <button class="qi-option" data-key="a">A — Plano de auditoria</button>
  <button class="qi-option" data-key="b">B — Programa de auditoria</button>
  <button class="qi-option" data-key="c">C — Relatorio de auditoria</button>
  <div class="qi-feedback"></div>
</div>

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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Objetivos</strong><br>Definir o proposito: conformidade, melhoria, preparacao para certificacao</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Escopo e Criterios</strong><br>Quais processos, locais, periodos e referencias normativas/internas</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Metodos e Recursos</strong><br>Presencial ou remota; equipe auditora, tempo, infraestrutura necessaria</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Cronograma</strong><br>Datas de cada auditoria distribuidas ao longo do periodo</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Riscos do programa</strong><br>O que pode impedir a execucao: falta de auditores, restricoes operacionais</div></div>
</div>

<div class="diagram">
  <svg viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="20" width="400" height="110" rx="8" fill="#0b1730" opacity="0.06" stroke="#0b1730" stroke-width="1"/>
    <text x="210" y="14" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Programa Anual de Auditoria — 4 Ciclos</text>
    <rect x="20" y="30" width="85" height="50" rx="6" fill="#2563eb"/>
    <text x="62" y="51" text-anchor="middle" font-size="10" fill="white" font-weight="bold">1 Ciclo</text>
    <text x="62" y="65" text-anchor="middle" font-size="9" fill="#bfdbfe">Mar</text>
    <text x="62" y="76" text-anchor="middle" font-size="8" fill="#bfdbfe">Producao + RH</text>
    <rect x="120" y="30" width="85" height="50" rx="6" fill="#16a34a"/>
    <text x="162" y="51" text-anchor="middle" font-size="10" fill="white" font-weight="bold">2 Ciclo</text>
    <text x="162" y="65" text-anchor="middle" font-size="9" fill="#bbf7d0">Jun</text>
    <text x="162" y="76" text-anchor="middle" font-size="8" fill="#bbf7d0">Compras + TI</text>
    <rect x="220" y="30" width="85" height="50" rx="6" fill="#eab308"/>
    <text x="262" y="51" text-anchor="middle" font-size="10" fill="#0b1730" font-weight="bold">3 Ciclo</text>
    <text x="262" y="65" text-anchor="middle" font-size="9" fill="#0b1730">Set</text>
    <text x="262" y="76" text-anchor="middle" font-size="8" fill="#0b1730">Qualidade + Expd.</text>
    <rect x="320" y="30" width="85" height="50" rx="6" fill="#c5383c"/>
    <text x="362" y="51" text-anchor="middle" font-size="10" fill="white" font-weight="bold">4 Ciclo</text>
    <text x="362" y="65" text-anchor="middle" font-size="9" fill="#fecaca">Dez</text>
    <text x="362" y="76" text-anchor="middle" font-size="8" fill="#fecaca">Producao + Fin.</text>
    <text x="210" y="100" text-anchor="middle" font-size="9" fill="#64748b">Processos criticos (Producao, Qualidade) auditados 2x ao ano</text>
    <text x="210" y="115" text-anchor="middle" font-size="9" fill="#64748b">Processos de apoio (RH, TI, Financeiro) auditados 1x ao ano</text>
    <defs><marker id="arr221" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>
    <line x1="105" y1="55" x2="120" y2="55" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr221)"/>
    <line x1="205" y1="55" x2="220" y2="55" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr221)"/>
    <line x1="305" y1="55" x2="320" y2="55" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr221)"/>
  </svg>
  <figcaption>Exemplo de programa anual com 4 ciclos de auditoria numa metalurgica com 8 processos</figcaption>
</div>

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

<ul class="checklist">
  <li><span class="ck-box"></span>Objetivos do programa definidos e documentados</li>
  <li><span class="ck-box"></span>Escopo e criterios de cada auditoria especificados</li>
  <li><span class="ck-box"></span>Cronograma anual elaborado e aprovado pela direcao</li>
  <li><span class="ck-box"></span>Auditores designados e com competencia comprovada</li>
  <li><span class="ck-box"></span>Recursos (tempo, salas, acesso) garantidos</li>
  <li><span class="ck-box"></span>Riscos do programa identificados e tratados</li>
  <li><span class="ck-box"></span>Processo de monitoramento e analise critica definido</li>
</ul>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Ana, coordenadora de qualidade de uma industria alimenticia em Campinas, precisava montar o programa anual. Em vez de agendar auditorias aleatoriamente, ela analisou os resultados do ano anterior: 70% das nao conformidades vinham do setor de embalagem. Resultado: o novo programa previu auditorias trimestrais (4x ao ano) para embalagem e semestrais para os demais setores. Quando a auditoria de certificacao chegou, o setor de embalagem tinha zero NCs abertas — o programa direcionado fez a diferenca.</p>
</div>
`}, 'Template de programa anual de auditoria'),

  (${m2.id}, '2-2-2-escopo-critérios', 'Definindo escopo e critérios', '15 min', 2, ${`
<h2>Definindo escopo e critérios de auditoria</h2>
<p>Antes de iniciar qualquer auditoria individual, e fundamental definir com clareza <strong>o que sera auditado</strong> (escopo) e <strong>contra quais referências</strong> (critérios). Definições vagas geram auditorias superficiais e constatações questionáveis.</p>

<h3>Escopo de auditoria</h3>
<p>O escopo delimita a extensao e os limites da auditoria. Deve especificar:</p>
<ul>
<li><strong>Processos:</strong> Quais processos serao auditados (ex: compras, producao, expedicao)</li>
<li><strong>Locais:</strong> Quais unidades, filiais ou areas fisicas</li>
<li><strong>Periodo:</strong> Quais registros/atividades serao verificados (ex: ultimos 6 meses)</li>
<li><strong>Turno:</strong> Se aplicavel (ex: auditar apenas o turno noturno onde ha mais reclamacoes)</li>
</ul>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Escopo mal definido</h4><ul><li>Auditoria da producao.</li><li>Qual unidade? Quais etapas?</li><li>Qual periodo? Quais turnos?</li><li>Gera auditorias superficiais</li><li>Constatacoes questionaveis</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Escopo bem definido</h4><ul><li>Processo: recebimento e armazenagem</li><li>Unidade: Caxias do Sul</li><li>Periodo: jan a jun 2025</li><li>Turnos A e B incluidos</li><li>Foco claro = auditoria eficaz</li></ul></div>
</div>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="16" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Escopo + Criterios: o que direciona o auditor</text>
    <ellipse cx="130" cy="100" rx="110" ry="65" fill="#2563eb" opacity="0.15" stroke="#2563eb" stroke-width="1.5"/>
    <text x="130" y="72" text-anchor="middle" font-size="10" fill="#1d4ed8" font-weight="bold">ESCOPO</text>
    <text x="130" y="88" text-anchor="middle" font-size="8.5" fill="#1e40af">Onde olhar</text>
    <text x="130" y="103" text-anchor="middle" font-size="8" fill="#1e40af">Processos, locais,</text>
    <text x="130" y="115" text-anchor="middle" font-size="8" fill="#1e40af">periodo, turno</text>
    <ellipse cx="290" cy="100" rx="110" ry="65" fill="#c5383c" opacity="0.12" stroke="#c5383c" stroke-width="1.5"/>
    <text x="290" y="72" text-anchor="middle" font-size="10" fill="#9b1c1c" font-weight="bold">CRITERIOS</text>
    <text x="290" y="88" text-anchor="middle" font-size="8.5" fill="#9b1c1c">O que procurar</text>
    <text x="290" y="103" text-anchor="middle" font-size="8" fill="#9b1c1c">ISO 9001, POs,</text>
    <text x="290" y="115" text-anchor="middle" font-size="8" fill="#9b1c1c">legislacao, contratos</text>
    <ellipse cx="210" cy="100" rx="28" ry="40" fill="#16a34a" opacity="0.25" stroke="#16a34a" stroke-width="1.5"/>
    <text x="210" y="96" text-anchor="middle" font-size="8" fill="#14532d" font-weight="bold">FOCO</text>
    <text x="210" y="109" text-anchor="middle" font-size="8" fill="#14532d">da</text>
    <text x="210" y="120" text-anchor="middle" font-size="8" fill="#14532d">auditoria</text>
    <text x="210" y="162" text-anchor="middle" font-size="9" fill="#64748b">A intersecao define onde e o que o auditor vai verificar</text>
  </svg>
  <figcaption>Escopo define onde olhar; criterios definem o que procurar; a intersecao e o foco da auditoria</figcaption>
</div>

<div class="example"><strong>Escopo bem definido:</strong> "Auditoria do processo de recebimento e armazenagem de materias-primas na unidade de Caxias do Sul, cobrindo o periodo de janeiro a junho de 2025, nos turnos A e B."</div>

<div class="example"><strong>Escopo mal definido:</strong> "Auditoria da producao." -- Qual unidade? Quais etapas? Qual periodo? Isso e vago demais.</div>

<h3>Criterios de auditoria</h3>
<p>Os criterios sao as <strong>referencias</strong> contra as quais as evidencias serao comparadas. Os criterios mais comuns sao:</p>

<table>
<tr><th>Tipo de criterio</th><th>Exemplo</th></tr>
<tr><td>Norma de referencia</td><td>ISO 9001:2015 clausulas 8.4 e 8.5</td></tr>
<tr><td>Procedimentos internos</td><td>PO-015 Controle de recebimento, IT-008 Armazenagem</td></tr>
<tr><td>Legislacao/regulamentacao</td><td>Portaria INMETRO 587, RDC Anvisa 275</td></tr>
<tr><td>Requisitos contratuais</td><td>Especificacao do cliente XYZ para lote minimo</td></tr>
<tr><td>Historico/metas</td><td>Meta de indice de rejeicao &lt; 2%</td></tr>
</table>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Normas externas</button><button class="tab-btn">Documentos internos</button><button class="tab-btn">Requisitos legais</button></div>
  <div class="tab-panel active"><p><strong>Normas externas</strong> sao documentos de organismos de normalizacao (ISO, ABNT, IEC). Exemplos: ISO 9001:2015, ABNT NBR 16001, ISO 14001. O auditor verifica se a organizacao atende os requisitos da clausula referenciada no escopo.</p></div>
  <div class="tab-panel"><p><strong>Documentos internos</strong> sao os proprios procedimentos, instrucoes de trabalho e formularios da organizacao. Exemplos: PO-015 Controle de recebimento, IT-008 Armazenagem, Plano de Qualidade PQ-03. O auditor verifica se o que esta escrito e o que realmente acontece.</p></div>
  <div class="tab-panel"><p><strong>Requisitos legais e regulamentares</strong> sao obrigacoes impostas por lei ou orgaos reguladores. Exemplos: NR-12 (seguranca em maquinas), RDC Anvisa 275 (alimentos), Portaria INMETRO 587. Descumprimento pode gerar NC maior e ate embargo.</p></div>
</div>

<div class="callout"><strong>Regra de ouro:</strong> Se nao ha criterio, nao ha constatacao. O auditor so pode apontar nao conformidade se existir um requisito claro que nao foi atendido.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> A regra de ouro protege tanto o auditado quanto o auditor. Ela impede que opinioes pessoais virem nao conformidades e torna o processo objetivo, auditavel e defensavel perante organismos certificadores. Sem criterio documentado = sem NC.</div></div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Sem um requisito documentado, o auditor so pode registrar uma oportunidade de melhoria — nunca uma NC." data-fb-nok="Revise a regra de ouro: sem criterio claro e documentado, nao ha base para uma nao conformidade.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O auditor percebe que os colaboradores organizam o estoque de forma que ele considera ineficiente. Nao existe procedimento interno nem requisito normativo sobre organizacao de estoque. O auditor deve:</div>
  <button class="qi-option" data-key="a">A -- Registrar como nao conformidade maior</button>
  <button class="qi-option" data-key="b">B -- Registrar como nao conformidade menor</button>
  <button class="qi-option" data-key="c">C -- Registrar como oportunidade de melhoria no maximo, pois nao ha criterio</button>
  <div class="qi-feedback"></div>
</div>

<h3>Relacao entre escopo e criterios</h3>
<p>O escopo define <strong>onde</strong> olhar. O criterio define <strong>o que</strong> procurar. Juntos, eles direcionam o trabalho do auditor e garantem foco.</p>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Carlos, gestor de qualidade de uma distribuidora farmaceutica em Sao Paulo, precisava definir o escopo de uma auditoria urgente apos reclamacao critica de cliente. Em vez de auditar toda a empresa, delimitou: processo de separacao e expedicao de pedidos, filial da Zona Leste, ultimos 3 meses. Criterios: ISO 9001 clausula 8.5.4, procedimento PO-007 e requisito contratual do cliente. Em 6 horas de auditoria encontrou a raiz do problema: o checklist de conferencia final nao estava sendo assinado em 3 dos 5 turnos. Escopo focado = resultado em tempo recorde.</p>
</div>

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

  (${m2.id}, '2-2-3-competência-auditores', 'Competência e avaliação de auditores', '20 min', 3, ${`
<h2>Competência e avaliação de auditores</h2>
<p>A cláusula 7 da ISO 19011:2018 e a cláusula 9.2 da ISO 9001:2015 exigem que os auditores internos sejam <strong>competentes</strong>. Mas o que significa "competente" neste contexto?</p>

<h3>Conhecimentos e habilidades necessarios</h3>
<p>A ISO 19011 divide a competencia do auditor em duas categorias:</p>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="16" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Modelo de Competencia do Auditor ISO 19011</text>
    <rect x="140" y="25" width="140" height="48" rx="8" fill="#0b1730"/>
    <text x="210" y="46" text-anchor="middle" font-size="10" fill="white" font-weight="bold">COMPETENCIA</text>
    <text x="210" y="62" text-anchor="middle" font-size="8.5" fill="#94a3b8">Auditores internos ISO 9001</text>
    <defs><marker id="arr223" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>
    <line x1="170" y1="73" x2="100" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr223)"/>
    <line x1="210" y1="73" x2="210" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr223)"/>
    <line x1="250" y1="73" x2="320" y2="100" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr223)"/>
    <rect x="20" y="100" width="120" height="52" rx="6" fill="#2563eb"/>
    <text x="80" y="120" text-anchor="middle" font-size="9" fill="white" font-weight="bold">Conhecimento</text>
    <text x="80" y="133" text-anchor="middle" font-size="8" fill="#bfdbfe">Principios, ISO 9001,</text>
    <text x="80" y="144" text-anchor="middle" font-size="8" fill="#bfdbfe">tecnicas, setor</text>
    <rect x="150" y="100" width="120" height="52" rx="6" fill="#16a34a"/>
    <text x="210" y="120" text-anchor="middle" font-size="9" fill="white" font-weight="bold">Habilidades</text>
    <text x="210" y="133" text-anchor="middle" font-size="8" fill="#bbf7d0">Entrevista, analise,</text>
    <text x="210" y="144" text-anchor="middle" font-size="8" fill="#bbf7d0">relatorio, amostragem</text>
    <rect x="280" y="100" width="120" height="52" rx="6" fill="#eab308"/>
    <text x="340" y="120" text-anchor="middle" font-size="9" fill="#0b1730" font-weight="bold">Atributos</text>
    <text x="340" y="133" text-anchor="middle" font-size="8" fill="#0b1730">Etico, diplomatico,</text>
    <text x="340" y="144" text-anchor="middle" font-size="8" fill="#0b1730">observador, persistente</text>
    <text x="210" y="170" text-anchor="middle" font-size="9" fill="#64748b">Os tres pilares sao igualmente necessarios — nenhum substitui o outro</text>
  </svg>
  <figcaption>Os tres pilares da competencia: conhecimento + habilidades + atributos pessoais</figcaption>
</div>

<table>
<tr><th>Categoria</th><th>Exemplos</th></tr>
<tr><td><strong>Conhecimentos genericos</strong></td><td>Principios de auditoria, norma ISO 19011, tecnicas de entrevista, elaboracao de relatorio, amostragem</td></tr>
<tr><td><strong>Conhecimentos especificos do setor</strong></td><td>Processos de usinagem (metalurgica), APPCC (alimentos), NRs aplicaveis (construcao civil), normas tecnicas do produto</td></tr>
</table>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Conhecimento generico</button><button class="tab-btn">Conhecimento setorial</button></div>
  <div class="tab-panel active"><p><strong>Conhecimento generico</strong> e o que qualquer auditor de sistema de gestao precisa, independente do setor: principios de auditoria (ISO 19011), a propria norma auditada (ISO 9001), tecnicas de entrevista, elaboracao de checklist, coleta de evidencias, redacao de relatorio, amostragem estatistica. Este conhecimento e transferivel entre setores.</p></div>
  <div class="tab-panel"><p><strong>Conhecimento setorial</strong> e especifico do setor da organizacao auditada. Uma industria alimenticia exige APPCC e legislacao sanitaria. Uma metalurgica exige NRs de seguranca e normas de solda. Um hospital exige RDC Anvisa e protocolos clinicos. O auditor precisa de ambos para fazer perguntas relevantes e reconhecer desvios.</p></div>
</div>

<h3>Atributos pessoais do auditor</h3>
<p>Alem de conhecimento tecnico, o auditor precisa de atributos comportamentais:</p>
<ul>
<li><strong>Etico:</strong> Justo, verdadeiro, sincero, honesto e discreto</li>
<li><strong>Mente aberta:</strong> Disposto a considerar pontos de vista e ideias alternativas</li>
<li><strong>Diplomatico:</strong> Tato ao lidar com pessoas</li>
<li><strong>Observador:</strong> Atento ao ambiente e as atividades</li>
<li><strong>Perceptivo:</strong> Capaz de entender situacoes e contextos</li>
<li><strong>Versatil:</strong> Adapta-se a diferentes situacoes</li>
<li><strong>Persistente:</strong> Focado em alcancar os objetivos</li>
<li><strong>Decidido:</strong> Capaz de chegar a conclusoes em tempo habil</li>
<li><strong>Autoconfiante:</strong> Age de forma independente ao interagir com outros</li>
</ul>

<ul class="checklist">
  <li><span class="ck-box"></span>Conhece os principios de auditoria (ISO 19011)</li>
  <li><span class="ck-box"></span>Domina a norma auditada (ISO 9001:2015)</li>
  <li><span class="ck-box"></span>Sabe conduzir entrevistas e coletar evidencias</li>
  <li><span class="ck-box"></span>Conhece o setor/processos da organizacao auditada</li>
  <li><span class="ck-box"></span>Demonstra postura etica e imparcialidade</li>
  <li><span class="ck-box"></span>Comunica-se com tato (diplomatico, nao intimidador)</li>
  <li><span class="ck-box"></span>Participou de pelo menos 1 auditoria como observador</li>
</ul>

<div class="callout"><strong>Reflexao:</strong> Um auditor excelente tecnicamente mas arrogante e inflexivel vai gerar resistencia e conflitos. Um auditor diplomatico mas sem conhecimento tecnico vai perder constatacoes importantes. E preciso equilibrio.</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Auditor ineficaz</h4><ul><li>Arrogante e intimidador</li><li>Faz perguntas genericas</li><li>Aceita a primeira resposta sem verificar</li><li>Parcial — ja decidiu antes de ver</li><li>Nao conhece o setor auditado</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Auditor eficaz</h4><ul><li>Diplomatico e respeitoso</li><li>Perguntas abertas e especificas</li><li>Sempre busca evidencia objetiva</li><li>Imparcial — segue o criterio</li><li>Conhece o contexto do setor</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! O auditor nao pode ser parcial. Deve seguir criterios objetivos e evidencias, nao opiniao pessoal sobre o gestor ou o processo." data-fb-nok="Revise o conceito de imparcialidade: o auditor deve avaliar evidencias, nao julgar pessoas ou ter preferencias.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O auditor tem uma opiniao negativa sobre o gestor do setor que vai auditar, formada em interacoes anteriores. Como deve agir durante a auditoria?</div>
  <button class="qi-option" data-key="a">A -- Ser mais rigoroso para compensar sua opinioa negativa</button>
  <button class="qi-option" data-key="b">B -- Manter imparcialidade, avaliando apenas evidencias contra os criterios definidos</button>
  <button class="qi-option" data-key="c">C -- Solicitar substituicao imediata do gestor antes de iniciar</button>
  <div class="qi-feedback"></div>
</div>

<h3>Como avaliar a competencia</h3>
<p>A organizacao deve definir criterios para avaliar seus auditores internos. Metodos comuns:</p>
<ul>
<li><strong>Formacao:</strong> Curso de auditor interno (como este!) com avaliacao</li>
<li><strong>Experiencia:</strong> Participacao em auditorias como observador ou membro da equipe</li>
<li><strong>Avaliacao de desempenho:</strong> Feedback pos-auditoria pelo auditor-lider ou gestor do programa</li>
<li><strong>Atualizacao:</strong> Participacao em treinamentos continuos</li>
</ul>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Formacao basica</strong><br>Curso de auditor interno (minimo 16h) com avaliacao teorica e pratica</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Auditoria como observador</strong><br>Participar de pelo menos 1 auditoria acompanhando um auditor experiente</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Auditoria como membro da equipe</strong><br>Conduzir partes da auditoria sob supervisao do auditor-lider</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Avaliacao de desempenho</strong><br>Feedback do auditor-lider ou gestor do programa sobre postura e tecnica</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Auditor qualificado ativo</strong><br>Atuacao autonoma com reciclagem periodica e atualizacao normativa</div></div>
</div>

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
`}, 'Matriz de competência de auditores'),

  (${m2.id}, '2-2-4-monitoramento-melhoria', 'Monitoramento e melhoria do programa', '15 min', 4, ${`
<h2>Monitoramento e melhoria do programa de auditoria</h2>
<p>Um programa de auditoria não e"defina e esqueca". Assim como qualquer processo do SGQ, ele segue o ciclo PDCA: planejar, executar, verificar e melhorar. O gestor do programa deve monitorar sua implementação e buscar melhorias continuamente.</p>

<h3>O que monitorar</h3>

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="14" text-anchor="middle" font-size="11" fill="#0b1730" font-weight="bold">Ciclo PDCA aplicado ao Programa de Auditoria</text>
    <circle cx="210" cy="108" r="48" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3"/>
    <rect x="120" y="24" width="80" height="52" rx="8" fill="#2563eb"/>
    <text x="160" y="46" text-anchor="middle" font-size="12" fill="white" font-weight="bold">P</text>
    <text x="160" y="60" text-anchor="middle" font-size="9" fill="#bfdbfe">Planejar</text>
    <text x="160" y="71" text-anchor="middle" font-size="7.5" fill="#bfdbfe">Objetivos, cronograma,</text>
    <text x="160" y="81" text-anchor="middle" font-size="7.5" fill="#bfdbfe">auditores, criterios</text>
    <rect x="295" y="72" width="80" height="52" rx="8" fill="#16a34a"/>
    <text x="335" y="94" text-anchor="middle" font-size="12" fill="white" font-weight="bold">D</text>
    <text x="335" y="108" text-anchor="middle" font-size="9" fill="#bbf7d0">Executar</text>
    <text x="335" y="119" text-anchor="middle" font-size="7.5" fill="#bbf7d0">Realizar auditorias</text>
    <text x="335" y="129" text-anchor="middle" font-size="7.5" fill="#bbf7d0">conforme planejado</text>
    <rect x="220" y="148" width="80" height="52" rx="8" fill="#eab308"/>
    <text x="260" y="170" text-anchor="middle" font-size="12" fill="#0b1730" font-weight="bold">C</text>
    <text x="260" y="184" text-anchor="middle" font-size="9" fill="#0b1730">Verificar</text>
    <text x="260" y="195" text-anchor="middle" font-size="7.5" fill="#0b1730">Monitorar indicadores</text>
    <rect x="45" y="72" width="80" height="52" rx="8" fill="#c5383c"/>
    <text x="85" y="94" text-anchor="middle" font-size="12" fill="white" font-weight="bold">A</text>
    <text x="85" y="108" text-anchor="middle" font-size="9" fill="#fecaca">Melhorar</text>
    <text x="85" y="119" text-anchor="middle" font-size="7.5" fill="#fecaca">Ajustar para o</text>
    <text x="85" y="129" text-anchor="middle" font-size="7.5" fill="#fecaca">proximo ciclo</text>
    <defs><marker id="arr224" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/></marker></defs>
    <path d="M200,76 C240,60 280,65 295,90" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr224)"/>
    <path d="M335,124 C340,150 310,168 295,172" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr224)"/>
    <path d="M220,185 C180,195 110,165 105,148" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr224)"/>
    <path d="M85,72 C80,50 120,30 155,38" fill="none" stroke="#64748b" stroke-width="1.5" marker-end="url(#arr224)"/>
  </svg>
  <figcaption>O ciclo PDCA se aplica ao proprio programa de auditoria: planejar, executar, verificar e melhorar continuamente</figcaption>
</div>

<table>
<tr><th>Indicador</th><th>O que mede</th><th>Meta tipica</th></tr>
<tr><td>Taxa de execucao do programa</td><td>% de auditorias planejadas que foram realizadas</td><td>100% (sem cancelamentos)</td></tr>
<tr><td>Cumprimento do cronograma</td><td>% de auditorias realizadas na data prevista</td><td>&gt;= 90%</td></tr>
<tr><td>NCs identificadas por auditoria</td><td>Quantidade media de nao conformidades</td><td>Acompanhar tendencia</td></tr>
<tr><td>Eficacia das acoes corretivas</td><td>% de NCs efetivamente fechadas no prazo</td><td>&gt;= 80%</td></tr>
<tr><td>Satisfacao dos auditados</td><td>Feedback sobre a conduta e utilidade da auditoria</td><td>Favoravel</td></tr>
<tr><td>Desenvolvimento de auditores</td><td>Numero de auditores qualificados ativos</td><td>Conforme necessidade</td></tr>
</table>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">100%</div><div class="kpi-label">Taxa de execucao ideal do programa</div></div>
  <div class="kpi-card"><div class="kpi-value">&gt;= 90%</div><div class="kpi-label">Auditorias realizadas no prazo previsto</div></div>
  <div class="kpi-card"><div class="kpi-value">&gt;= 80%</div><div class="kpi-label">NCs fechadas no prazo (acoes eficazes)</div></div>
  <div class="kpi-card"><div class="kpi-value">3-5</div><div class="kpi-label">Auditores ativos minimos recomendados</div></div>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A taxa de execucao deve ser 100% — cancelamentos sem replanejamento comprometem a cobertura do SGQ e podem ser questionados em auditorias de certificacao." data-fb-nok="Reveja: a meta de execucao do programa e 100%. Qualquer cancelamento deve ser justificado e replanejado.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual e a meta tipica para a taxa de execucao do programa de auditoria?</div>
  <button class="qi-option" data-key="a">A -- 100% (todas as auditorias planejadas devem ser realizadas)</button>
  <button class="qi-option" data-key="b">B -- 80% (e aceitavel cancelar ate 20%)</button>
  <button class="qi-option" data-key="c">C -- 70% (cancelamentos por operacao sao comuns e tolerados)</button>
  <div class="qi-feedback"></div>
</div>

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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Consolidar resultados</strong><br>Totalizar NCs por processo, tipo e tendencia temporal</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Avaliar auditores</strong><br>Desempenho, postura, precisao das constatacoes, feedback dos auditados</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Revisar cronograma</strong><br>O programa cobriu todos os processos? Houve cancelamentos? Por que?</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Mapear melhorias</strong><br>Ajustar frequencia, rotacionar auditores, atualizar criterios</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Aprovar novo programa</strong><br>Validar com a direcao e comunicar as areas envolvidas</div></div>
</div>

<div class="example"><strong>Exemplo -- construtora:</strong> Na analise critica do programa 2024, o gestor identificou que 60% das NCs estavam no processo de compras (3 auditorias seguidas). Acao: aumentar a frequencia de auditoria de compras de anual para semestral em 2025, e incluir um auditor com experiencia em supply chain na equipe.</div>

<h3>Melhorias tipicas no programa</h3>
<ul>
<li><strong>Ajustar frequencia:</strong> Processos com mais NCs ou maior risco recebem mais auditorias</li>
<li><strong>Rotacionar auditores:</strong> Evitar que o mesmo auditor audite o mesmo processo sempre (perde a "visao fresca")</li>
<li><strong>Incluir auditorias nao planejadas:</strong> Em caso de mudancas significativas, reclamacoes criticas ou incidentes</li>
<li><strong>Atualizar criterios:</strong> Incorporar novos requisitos legais, normativos ou de clientes</li>
<li><strong>Investir em capacitacao:</strong> Treinar novos auditores e reciclar os existentes</li>
</ul>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Patricia, gestora do programa de auditoria de uma rede logistica com 4 unidades, percebeu que o programa de 2023 tinha executado apenas 75% das auditorias planejadas. Motivo: auditores sempre indisponiveis por demanda operacional. Em 2024, ela tomou duas acoes: (1) formou 3 novos auditores para ter reserva; (2) inseriu no cronograma janelas de 15 dias para cada auditoria, com datas alternativas ja aprovadas. Resultado: 100% de execucao em 2024. Uma auditoria de certificacao em dezembro nao encontrou nenhum processo sem evidencia de auditoria interna recente.</p>
</div>

<div class="callout"><strong>Ciclo PDCA do programa:</strong> <strong>P</strong> = definir objetivos, cronograma, auditores. <strong>D</strong> = executar as auditorias conforme planejado. <strong>C</strong> = monitorar indicadores e analisar resultados. <strong>A</strong> = ajustar o programa para o proximo ciclo.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight — melhoria continua real:</strong> O programa de auditoria nao e um documento estatico. Cada ciclo deve alimentar o proximo: NCs recorrentes levam a mais auditorias naquele processo; auditores com feedback negativo recebem capacitacao adicional. O programa que nao muda nao esta sendo monitorado.</div></div>
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

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="70" width="110" height="60" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="65" y="94" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Documentos</text>
    <text x="65" y="108" text-anchor="middle" fill="#94a3b8" font-size="9">Políticas, POs,</text>
    <text x="65" y="121" text-anchor="middle" fill="#94a3b8" font-size="9">ITs, Registros</text>
    <polygon points="125,100 140,93 140,107" fill="#2563eb"/>
    <rect x="145" y="70" width="120" height="60" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="205" y="91" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Análise</text>
    <text x="205" y="105" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Documental</text>
    <text x="205" y="120" text-anchor="middle" fill="#94a3b8" font-size="9">Lacunas, versões</text>
    <polygon points="270,100 285,93 285,107" fill="#eab308"/>
    <rect x="290" y="70" width="120" height="60" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="350" y="91" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Insumos para</text>
    <text x="350" y="105" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Auditoria</text>
    <text x="350" y="120" text-anchor="middle" fill="#94a3b8" font-size="9">Pontos de atenção</text>
    <text x="65" y="155" text-anchor="middle" fill="#2563eb" font-size="8">ENTRADA</text>
    <text x="205" y="155" text-anchor="middle" fill="#eab308" font-size="8">PROCESSAMENTO</text>
    <text x="350" y="155" text-anchor="middle" fill="#16a34a" font-size="8">SAÍDA</text>
    <text x="205" y="28" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Fluxo da Análise Documental</text>
  </svg>
  <figcaption>Da documentação recebida aos insumos que orientam a auditoria em campo</figcaption>
</div>

<div class="callout"><strong>Regra prática:</strong> Leia os documentos com uma pergunta na mente: "O que a organização disse que faz?" Na auditoria em campo, a pergunta muda para: "A organização realmente faz o que disse?"</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> A pergunta central da análise documental é "O que a organização diz que faz?". Só com essa resposta clara você saberá o que checar em campo — e o que esperar encontrar.</div></div>

<h3>Sinais de atenção na análise documental</h3>
<p>Durante a análise, fique atento a:</p>
<ul>
<li><strong>Procedimentos desatualizados:</strong> Ultima revisao ha mais de 2 anos sem justificativa</li>
<li><strong>Lacunas:</strong> Requisitos da norma sem procedimento ou registro correspondente</li>
<li><strong>Complexidade excessiva:</strong> Procedimentos tao detalhados que ninguem consegue seguir</li>
<li><strong>NCs anteriores não fechadas:</strong> Ações corretivas pendentes ou atrasadas</li>
<li><strong>Indicadores sem análise:</strong> Dados coletados mas sem evidência de ação sobre desvios</li>
</ul>

<h4>Documentos essenciais — verifique antes de começar:</h4>
<ul class="checklist">
  <li><span class="ck-box"></span>Política da qualidade e objetivos do processo auditado</li>
  <li><span class="ck-box"></span>Procedimentos operacionais (POs) e instruções de trabalho (ITs) do escopo</li>
  <li><span class="ck-box"></span>Registros das últimas 3 ocorrências do processo</li>
  <li><span class="ck-box"></span>Relatório da última auditoria interna do mesmo processo</li>
  <li><span class="ck-box"></span>Status de ações corretivas abertas relacionadas ao processo</li>
  <li><span class="ck-box"></span>Indicadores de desempenho do período auditado</li>
  <li><span class="ck-box"></span>Reclamações de clientes associadas ao processo (últimos 6 meses)</li>
</ul>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Solicitar documentação</strong><br>Peça ao auditado os documentos do escopo com pelo menos 3 dias de antecedência</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Ler procedimentos</strong><br>Entenda o que a organização declara que faz — é a linha de base da comparação</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Revisar auditorias anteriores</strong><br>Identifique NCs recorrentes e verifique se as ações foram efetivamente fechadas</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Anotar pontos de atenção</strong><br>Liste os itens que exigem verificação em campo e os registros que deve solicitar</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Construir o checklist</strong><br>Use os insumos da análise para montar perguntas e trilhas de verificação específicas</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Uma auditora experiente recebeu os documentos do processo de manutenção 48 horas antes. Ao revisar os procedimentos, percebeu que o PO-045 (Manutenção preventiva) havia sido revisado há 4 anos e ainda citava um equipamento já desativado. Chegou à auditoria com a pergunta pronta: "Como vocês gerenciam a manutenção preventiva dos equipamentos adicionados desde 2021?" — e obteve uma não conformidade maior logo na primeira entrevista.</p>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! A análise documental revela o que a organização declara fazer — a base para comparar com a prática em campo." data-fb-nok="Não exatamente. O principal objetivo é entender o que a organização declara que faz, para depois comparar com a prática real.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual é o principal objetivo de analisar os procedimentos operacionais antes da auditoria?</div>
  <button class="qi-option" data-key="a">A) Verificar se estão escritos em linguagem clara</button>
  <button class="qi-option" data-key="b">B) Confirmar que a organização possui procedimentos documentados</button>
  <button class="qi-option" data-key="c">C) Entender o que a organização diz que faz, para depois comparar com a prática real</button>
  <div class="qi-feedback"></div>
</div>

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

<div class="diagram">
  <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="22" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Estrutura do Plano de Auditoria</text>
    <rect x="10" y="35" width="400" height="40" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="210" y="52" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Cabeçalho</text>
    <text x="210" y="66" text-anchor="middle" fill="#94a3b8" font-size="9">Objetivo · Escopo · Critérios · Equipe auditora</text>
    <rect x="10" y="85" width="190" height="40" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="105" y="102" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Agenda</text>
    <text x="105" y="116" text-anchor="middle" fill="#94a3b8" font-size="9">Horários e atividades</text>
    <rect x="220" y="85" width="190" height="40" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="315" y="102" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Entrevistados</text>
    <text x="315" y="116" text-anchor="middle" fill="#94a3b8" font-size="9">Quem e quando</text>
    <rect x="10" y="135" width="190" height="40" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="105" y="152" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Recursos</text>
    <text x="105" y="166" text-anchor="middle" fill="#94a3b8" font-size="9">Sala, EPI, acesso a sistemas</text>
    <rect x="220" y="135" width="190" height="40" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="315" y="152" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">Comunicação</text>
    <text x="315" y="166" text-anchor="middle" fill="#94a3b8" font-size="9">Enviado com 1 semana de antecedência</text>
    <rect x="10" y="185" width="400" height="30" rx="6" fill="#c5383c" opacity="0.2" stroke="#c5383c" stroke-width="1"/>
    <text x="210" y="205" text-anchor="middle" fill="#c5383c" font-size="9">Reunião abertura → Entrevistas → Consolidação → Reunião encerramento</text>
  </svg>
  <figcaption>Componentes essenciais do plano de auditoria</figcaption>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Plano Realista</button><button class="tab-btn">Plano Problemático</button></div>
  <div class="tab-panel active">
    <p><strong>Características de um bom plano:</strong></p>
    <ul>
      <li>Tempo realista por entrevista (45-60 min cada)</li>
      <li>Intervalo entre blocos para anotações</li>
      <li>1 hora de consolidação antes do encerramento</li>
      <li>Comunicado ao auditado com 1 semana de antecedência</li>
      <li>Flexível: pode ser ajustado no dia se necessário</li>
    </ul>
  </div>
  <div class="tab-panel">
    <p><strong>Sinais de um plano problemático:</strong></p>
    <ul>
      <li>6 entrevistas de 30 min seguidas sem intervalo</li>
      <li>Nenhum tempo de consolidação antes do encerramento</li>
      <li>Comunicado ao auditado no dia anterior</li>
      <li>Auditados-chave não identificados no plano</li>
      <li>Sem margem para imprevistos</li>
    </ul>
  </div>
</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>08:00 — Reunião de abertura</strong><br>Apresentar equipe, confirmar escopo e agenda (15-20 min)</div></div>
  <div class="step-item"><div class="step-content"><strong>08:20 — Entrevistas</strong><br>Entrevistar responsáveis, coletar registros, observar atividades</div></div>
  <div class="step-item"><div class="step-content"><strong>13:00 — Consolidação</strong><br>Equipe auditora classifica constatações: C, NC, OM</div></div>
  <div class="step-item"><div class="step-content"><strong>14:00 — Reunião de encerramento</strong><br>Apresentar constatações, obter reconhecimento do auditado</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Maria, auditora-líder experiente, recebeu o escopo de uma auditoria de compras na sexta-feira para realizar na quarta seguinte. Em vez de improvisar, elaborou o plano no final do dia e enviou ao gerente de compras ainda na sexta. Ao chegar na quarta, todos os entrevistados já sabiam seu horário, a sala estava reservada e o acesso ao ERP estava liberado. A auditoria terminou 20 minutos antes do previsto.</p>
</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Agenda Irrealista</h4><ul><li>08:00 Abertura (10 min)</li><li>08:10 Entrevista 1 (20 min)</li><li>08:30 Entrevista 2 (20 min)</li><li>08:50 Entrevista 3 (20 min)</li><li>09:10 Encerramento</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Agenda Realista</h4><ul><li>08:00 Abertura (20 min)</li><li>08:20 Entrevista 1 (60 min)</li><li>09:20 Entrevista 2 (60 min)</li><li>10:30 Revisão de registros (60 min)</li><li>11:30 Consolidação (60 min)</li><li>13:00 Encerramento (30 min)</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A ISO 19011 recomenda que o plano seja comunicado com antecedência suficiente para que o auditado possa se organizar." data-fb-nok="Não exatamente. O plano deve ser enviado com pelo menos 1 semana de antecedência para garantir a disponibilidade dos entrevistados e recursos.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Com que antecedência mínima o plano de auditoria deve ser comunicado ao auditado?</div>
  <button class="qi-option" data-key="a">A) No dia anterior à auditoria</button>
  <button class="qi-option" data-key="b">B) Com pelo menos 1 semana de antecedência</button>
  <button class="qi-option" data-key="c">C) No momento da reunião de abertura</button>
  <div class="qi-feedback"></div>
</div>
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

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="22" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Estrutura do Checklist de Auditoria</text>
    <rect x="5" y="35" width="65" height="130" rx="4" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="37" y="55" text-anchor="middle" fill="#2563eb" font-size="8" font-weight="bold">REF.</text>
    <text x="37" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">8.4.1</text>
    <text x="37" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">8.4.2</text>
    <text x="37" y="94" text-anchor="middle" fill="#94a3b8" font-size="7">8.4.3</text>
    <rect x="78" y="35" width="110" height="130" rx="4" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="133" y="55" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">PERGUNTA</text>
    <text x="133" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">Aberta / rastreamento</text>
    <text x="133" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">Mostre-me o registro...</text>
    <rect x="196" y="35" width="90" height="130" rx="4" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="241" y="55" text-anchor="middle" fill="#16a34a" font-size="8" font-weight="bold">EVIDÊNCIA</text>
    <text x="241" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">O que viu/ouviu</text>
    <text x="241" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">em campo</text>
    <rect x="294" y="35" width="120" height="130" rx="4" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/>
    <text x="354" y="55" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">CONSTATAÇÃO</text>
    <text x="354" y="70" text-anchor="middle" fill="#94a3b8" font-size="7">C / NC / OM</text>
    <text x="354" y="82" text-anchor="middle" fill="#94a3b8" font-size="7">+ observações</text>
  </svg>
  <figcaption>Colunas essenciais de um checklist de auditoria eficaz</figcaption>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Perguntas Abertas</button><button class="tab-btn">Verificação</button><button class="tab-btn">Rastreamento</button></div>
  <div class="tab-panel active">
    <p><strong>Perguntas abertas</strong> obrigam o auditado a explicar o processo:</p>
    <ul>
      <li>"Como você avalia os fornecedores?"</li>
      <li>"O que acontece quando um material chega com defeito?"</li>
      <li>"Como é feita a comunicação dos requisitos ao fornecedor?"</li>
    </ul>
    <p>Ideal para entender o processo real antes de pedir evidências.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Perguntas de verificação</strong> confirmam com evidência concreta:</p>
    <ul>
      <li>"Mostre-me o registro de avaliação do fornecedor X"</li>
      <li>"Posso ver a lista de fornecedores aprovados?"</li>
      <li>"Onde está registrada a inspeção de recebimento desse lote?"</li>
    </ul>
    <p>Transforma a resposta verbal em evidência objetiva.</p>
  </div>
  <div class="tab-panel">
    <p><strong>Perguntas de rastreamento</strong> seguem a trilha do processo:</p>
    <ul>
      <li>"Pegue um pedido recente — posso ver desde a requisição até o recebimento?"</li>
      <li>"Esse fornecedor está na lista aprovada? Foi avaliado recentemente?"</li>
      <li>"Houve NC nesse recebimento? O que foi feito?"</li>
    </ul>
    <p>São as mais poderosas — revelam falhas no fluxo completo.</p>
  </div>
</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Checklist Fraco</h4><ul><li>"A organização determina os processos providos externamente?" (texto da norma)</li><li>"Vocês avaliam fornecedores?" (sim/não)</li><li>"Existe inspeção de recebimento?" (sim/não)</li><li>Perguntas genéricas iguais para todos os processos</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Checklist Eficaz</h4><ul><li>"Como vocês definem quais fornecedores precisam de avaliação?"</li><li>"Mostre-me os 3 últimos registros de avaliação de fornecedor crítico"</li><li>"Qual é o critério para aprovação/reprovação no recebimento? Mostre um caso recente"</li><li>Perguntas adaptadas ao processo específico auditado</li></ul></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Em uma auditoria de laboratório, o auditor usou uma pergunta de rastreamento: "Pegue o último resultado fora de especificação registrado. O que foi feito?" O auditado buscou o registro, mas não conseguiu localizar a ação corretiva associada. O checklist tinha o item: "8.7 — NC do produto: verificar tratamento e rastreabilidade." Aquela pergunta de rastreamento revelou uma não conformidade maior que teria passado despercebida com uma pergunta fechada.</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Exato! Perguntas que exigem apenas sim/não não revelam como o processo funciona na prática." data-fb-nok="Pense bem: qual tipo de pergunta não força o auditado a explicar o processo real?">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Por que é inadequado usar apenas perguntas fechadas (sim/não) em um checklist de auditoria?</div>
  <button class="qi-option" data-key="a">A) Porque não revelam como o processo funciona na prática — apenas confirmam que algo existe</button>
  <button class="qi-option" data-key="b">B) Porque são difíceis de preencher no checklist</button>
  <button class="qi-option" data-key="c">C) Porque a ISO 19011 proíbe seu uso</button>
  <div class="qi-feedback"></div>
</div>

<h4>O que faz um bom checklist de auditoria:</h4>
<ul class="checklist">
  <li><span class="ck-box"></span>Perguntas abertas que obrigam o auditado a explicar o processo</li>
  <li><span class="ck-box"></span>Perguntas de verificação que solicitam registros e evidências concretas</li>
  <li><span class="ck-box"></span>Perguntas de rastreamento que seguem a trilha do processo completo</li>
  <li><span class="ck-box"></span>Referências às cláusulas da norma e aos procedimentos internos</li>
  <li><span class="ck-box"></span>Espaço para registrar a evidência encontrada (não só "C" ou "NC")</li>
  <li><span class="ck-box"></span>Adaptado ao processo específico — não genérico</li>
  <li><span class="ck-box"></span>Atualizado com lições aprendidas de auditorias anteriores</li>
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

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="22" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Conceito de Amostragem em Auditoria</text>
    <ellipse cx="130" cy="115" rx="120" ry="70" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="130" y="60" text-anchor="middle" fill="#2563eb" font-size="9">POPULAÇÃO</text>
    <text x="130" y="75" text-anchor="middle" fill="#94a3b8" font-size="8">200 pedidos de compra</text>
    <ellipse cx="130" cy="115" rx="55" ry="35" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="130" y="108" text-anchor="middle" fill="#16a34a" font-size="9" font-weight="bold">AMOSTRA</text>
    <text x="130" y="121" text-anchor="middle" fill="#fff" font-size="8">15 pedidos</text>
    <text x="130" y="133" text-anchor="middle" fill="#94a3b8" font-size="7">selecionados</text>
    <line x1="260" y1="115" x2="310" y2="85" stroke="#eab308" stroke-width="1.5" stroke-dasharray="4"/>
    <rect x="310" y="55" width="100" height="40" rx="4" fill="#0b1730" stroke="#eab308" stroke-width="1"/>
    <text x="360" y="72" text-anchor="middle" fill="#eab308" font-size="8" font-weight="bold">Conclusão</text>
    <text x="360" y="86" text-anchor="middle" fill="#94a3b8" font-size="7">aplicada ao todo</text>
    <line x1="260" y1="115" x2="310" y2="140" stroke="#c5383c" stroke-width="1.5" stroke-dasharray="4"/>
    <rect x="310" y="120" width="100" height="40" rx="4" fill="#0b1730" stroke="#c5383c" stroke-width="1"/>
    <text x="360" y="137" text-anchor="middle" fill="#c5383c" font-size="8" font-weight="bold">NC encontrada</text>
    <text x="360" y="151" text-anchor="middle" fill="#94a3b8" font-size="7">→ ampliar amostra</text>
  </svg>
  <figcaption>A amostra representa a população — se há NC, amplie antes de concluir</figcaption>
</div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">100%</div><div class="kpi-label">Até 10 registros — verifique todos</div></div>
  <div class="kpi-card"><div class="kpi-value">5–8</div><div class="kpi-label">Entre 11 e 50 registros</div></div>
  <div class="kpi-card"><div class="kpi-value">8–15</div><div class="kpi-label">Entre 51 e 200 registros</div></div>
  <div class="kpi-card"><div class="kpi-value">15–25</div><div class="kpi-label">Entre 201 e 500 registros</div></div>
  <div class="kpi-card"><div class="kpi-value">25–40</div><div class="kpi-label">Acima de 500 — foco nos críticos</div></div>
</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Definir o universo</strong><br>Quantos registros existem no período? Qual o volume total da população?</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Identificar variáveis</strong><br>Períodos, turnos, produtos, fornecedores, operadores — inclua diversidade</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Selecionar a amostra</strong><br>Use julgamento: priorize itens de maior risco, criticidade e variação</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Registrar o que foi selecionado</strong><br>Anote números, datas, lotes — garanta rastreabilidade no relatório</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Ampliar se encontrar NC</strong><br>1 NC em 5 pode ser acaso. 3 NCs em 5 é padrão — amplie e investigue</div></div>
</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Em uma indústria alimentícia, o auditor precisava verificar os registros de temperatura das câmaras frias — mais de 400 registros no semestre. Em vez de selecionar os mais recentes (viés comum), escolheu deliberadamente: 3 registros de janeiro (inverno), 3 de julho (verão — maior risco), 2 do turno noturno e 2 de um mês com manutenção registrada no equipamento. Essa estratégia revelou desvios de temperatura no turno noturno em julho que não apareceriam em uma amostra aleatória simples.</p>
</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Amostragem Fraca</h4><ul><li>Selecionar apenas os registros mais recentes</li><li>Pedir ao auditado para escolher os exemplos</li><li>Verificar apenas 1 ou 2 registros para "confirmar"</li><li>Não registrar quais amostras foram verificadas</li><li>Não ampliar a amostra quando encontra NC</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Amostragem Eficaz</h4><ul><li>Cobrir diferentes períodos (não apenas o mais recente)</li><li>Incluir turnos, produtos e fornecedores variados</li><li>Priorizar períodos de maior risco (picos, manutenções)</li><li>Registrar exatamente o que foi verificado</li><li>Ampliar a amostra ao encontrar qualquer não conformidade</li></ul></div>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Encontrar NC em 1 de 5 pode ser acaso. Em 3 de 5 é um padrão — e o auditor deve ampliar a amostra para determinar a extensão do problema." data-fb-nok="Não exatamente. Quando há NC na amostra, o auditor deve ampliar a verificação para determinar se é um problema pontual ou sistemico.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Durante a verificação de uma amostra de 5 registros, o auditor encontra 3 com não conformidade. O que deve fazer?</div>
  <button class="qi-option" data-key="a">A) Concluir que há uma NC sistemica e encerrar a verificação</button>
  <button class="qi-option" data-key="b">B) Ampliar a amostra para determinar se é um problema pontual ou sistemico</button>
  <button class="qi-option" data-key="c">C) Desconsiderar porque 3 de 5 pode ser coincidência</button>
  <div class="qi-feedback"></div>
</div>
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

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="120" height="44" rx="6" fill="#0b1730"/>
    <text x="70" y="29" text-anchor="middle" fill="white" font-size="10" font-weight="bold">1. Apresentacoes</text>
    <text x="70" y="44" text-anchor="middle" fill="#9ca3af" font-size="9">equipe auditora</text>
    <rect x="150" y="10" width="120" height="44" rx="6" fill="#2563eb"/>
    <text x="210" y="29" text-anchor="middle" fill="white" font-size="10" font-weight="bold">2. Escopo/Criterios</text>
    <text x="210" y="44" text-anchor="middle" fill="#bfdbfe" font-size="9">objetivos confirmados</text>
    <rect x="290" y="10" width="120" height="44" rx="6" fill="#16a34a"/>
    <text x="350" y="29" text-anchor="middle" fill="white" font-size="10" font-weight="bold">3. Plano e Metodos</text>
    <text x="350" y="44" text-anchor="middle" fill="#bbf7d0" font-size="9">agenda e logistica</text>
    <rect x="10" y="120" width="120" height="44" rx="6" fill="#eab308"/>
    <text x="70" y="139" text-anchor="middle" fill="#0b1730" font-size="10" font-weight="bold">4. Classificacoes</text>
    <text x="70" y="154" text-anchor="middle" fill="#0b1730" font-size="9">NC maior, menor, OM</text>
    <rect x="150" y="120" width="120" height="44" rx="6" fill="#7c3aed"/>
    <text x="210" y="139" text-anchor="middle" fill="white" font-size="10" font-weight="bold">5. Confidencialidade</text>
    <text x="210" y="154" text-anchor="middle" fill="#ddd6fe" font-size="9">sigilo e comunicacao</text>
    <rect x="290" y="120" width="120" height="44" rx="6" fill="#c5383c"/>
    <text x="350" y="139" text-anchor="middle" fill="white" font-size="10" font-weight="bold">6. Perguntas</text>
    <text x="350" y="154" text-anchor="middle" fill="#fca5a5" font-size="9">abertura ao dialogo</text>
    <line x1="130" y1="32" x2="150" y2="32" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4a)"/>
    <line x1="270" y1="32" x2="290" y2="32" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4a)"/>
    <line x1="350" y1="54" x2="350" y2="82" stroke="#6b7280" stroke-width="1.5"/>
    <line x1="350" y1="82" x2="70" y2="82" stroke="#6b7280" stroke-width="1.5"/>
    <line x1="70" y1="82" x2="70" y2="120" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4a)"/>
    <line x1="130" y1="142" x2="150" y2="142" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4a)"/>
    <line x1="270" y1="142" x2="290" y2="142" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4a)"/>
    <defs><marker id="arr4a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
  </svg>
  <figcaption>Fluxo dos 6 blocos da reuniao de abertura (15-20 minutos)</figcaption>
</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Apresentacao da equipe</strong><br>Nome, papel e organizacao de cada auditor — cria confianca inicial</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Confirmar escopo e objetivos</strong><br>Leia o escopo formal. Pergunte se ha duvidas antes de prosseguir</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Criterios e metodos</strong><br>ISO 9001, procedimentos internos; metodos: entrevista, observacao, analise de registros</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Agenda e logistica</strong><br>Confirme horarios, salas, guia e disponibilidade dos entrevistados</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Classificacao das constatacoes</strong><br>Explique como NCs e OMs serao categorizadas — sem surpresas no encerramento</div></div>
  <div class="step-item"><div class="step-content"><strong>6. Confidencialidade e canais</strong><br>Informe sobre sigilo e como comunicar duvidas durante a auditoria</div></div>
  <div class="step-item"><div class="step-content"><strong>7. Abrir para perguntas</strong><br>Garanta alinhamento total antes de iniciar a execucao</div></div>
</div>

<div class="callout"><strong>Dica importante:</strong> O tom da reunião de abertura define a auditoria. Seja profissional, mas acessível. Deixe claro que o objetivo e ajudar a organização a melhorar — não punir. Evite linguagem intimidadora.</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Tom que gera defensividade</h4><ul><li>"Viemos verificar se voces estao cumprindo a norma."</li><li>"Precisamos que todos fiquem disponíveis — nao aceito ausências."</li><li>"Se encontrarmos NC, a direcao sera informada imediatamente."</li><li>Postura fechada, sem apresentacoes, tom de inspecao</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Tom que gera colaboracao</h4><ul><li>"Estamos aqui para entender como o processo funciona na pratica."</li><li>"Contamos com a colaboracao de todos — suas perspectivas sao valiosas."</li><li>"Pontos fortes tambem serao registrados, nao so problemas."</li><li>Apresentacoes individuais, linguagem acessivel, postura aberta</li></ul></div>
</div>

<div class="example"><strong>Frase de abertura eficaz:</strong> "Bom dia a todos. Nosso objetivo hoje e verificar como o processo de compras esta funcionando na prática, identificar o que esta indo bem e onde podemos melhorar. Não estamos aqui para encontrar culpados — estamos aqui para ajudar o processo a ficar mais robusto."</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Numa auditoria interna em uma distribuidora de alimentos, a auditora-lider Claudia chegou cedo, preparou um slide simples com o escopo e a agenda, e na abertura se apresentou pelo primeiro nome. Destacou dois pontos positivos que notou enquanto esperava: a organizacao do deposito e a sinalizacao de emergencia. Em 15 minutos, o gestor de qualidade ja estava sorrindo. A auditoria rendeu 3 OMs e zero NCs — com o auditado entregando voluntariamente registros que nem estavam no plano original.</p>
</div>

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Tom autoritario gera defensividade e faz os auditados omitir informacoes uteis a auditoria." data-fb-nok="Reveja o proposito da reuniao de abertura. O tom define o nivel de colaboracao que voce recebera.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual e o principal risco de conduzir a reuniao de abertura com tom autoritario?</div>
  <button class="qi-option" data-key="a">A) A reuniao dura mais de 30 minutos e atrasa a auditoria</button>
  <button class="qi-option" data-key="b">B) O auditor perde credibilidade tecnica perante a equipe</button>
  <button class="qi-option" data-key="c">C) Os auditados ficam na defensiva e omitem informacoes relevantes</button>
  <div class="qi-feedback"></div>
</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> O tom da abertura e um ativo estrategico. Auditores que constroem rapport nos primeiros 15 minutos recebem informacoes voluntarias, acesso a registros nao solicitados e colaboracao genuina — o que aumenta significativamente a qualidade das constatacoes.</div></div>

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

<div class="diagram">
  <svg viewBox="0 0 300 240" xmlns="http://www.w3.org/2000/svg">
    <text x="150" y="22" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Tecnica do Funil</text>
    <polygon points="30,40 270,40 230,90 70,90" fill="#2563eb" opacity="0.85"/>
    <text x="150" y="72" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">ABERTO</text>
    <text x="150" y="84" text-anchor="middle" fill="#bfdbfe" font-size="8">"Me conte como funciona..."</text>
    <polygon points="70,95 230,95 200,140 100,140" fill="#eab308" opacity="0.85"/>
    <text x="150" y="120" text-anchor="middle" fill="#0b1730" font-size="10" font-weight="bold">APROFUNDAR</text>
    <text x="150" y="133" text-anchor="middle" fill="#0b1730" font-size="8">"Quem faz? Quais criterios?"</text>
    <polygon points="100,145 200,145 180,190 120,190" fill="#16a34a" opacity="0.85"/>
    <text x="150" y="170" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">VERIFICAR</text>
    <text x="150" y="183" text-anchor="middle" fill="#bbf7d0" font-size="8">"Mostre-me o registro..."</text>
    <polygon points="120,195 180,195 165,230 135,230" fill="#c5383c" opacity="0.85"/>
    <text x="150" y="218" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">SONDAR</text>
  </svg>
  <figcaption>Funil de entrevista: comece aberto e va afunilando ate a evidencia objetiva</figcaption>
</div>

<h3>Tecnica de funil: do geral ao específico</h3>
<p>Comece com perguntas amplas e va afunilando:</p>
<ol>
<li><strong>Abertura:</strong> "Me conte como funciona o processo de recebimento de materiais."</li>
<li><strong>Aprofundamento:</strong> "Quem faz a inspeção? Quais critérios usa?"</li>
<li><strong>Verificação:</strong> "Posso ver o registro de inspeção do ultimo recebimento?"</li>
<li><strong>Sondagem:</strong> "E quando o material chega fora da específicação, o que acontece?"</li>
</ol>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Passo 1: Abrir o contexto</strong><br>Pergunte de forma ampla — "Me descreva como voce faz a inspeção de recebimento."</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 2: Aprofundar o processo</strong><br>Explore quem faz, quando, com quais criterios e quais ferramentas</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 3: Solicitar evidencia</strong><br>"Mostre-me os registros da ultima semana" — transforme relato em prova objetiva</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 4: Sondar desvios</strong><br>"E quando nao ha registro? O que acontece quando chega material fora da especificacao?"</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 5: Rastrear a trilha</strong><br>Siga o fluxo do processo: pedido → recebimento → inspecao → armazenagem</div></div>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Entrevista</button><button class="tab-btn">Observacao</button><button class="tab-btn">Registros</button></div>
  <div class="tab-panel active"><p><strong>Quando usar:</strong> Para entender como o processo funciona na pratica — o que as pessoas fazem, conhecem e decidem.</p><p><strong>Vantagem:</strong> Revela o processo real, nao o documentado. Permite aprofundamento imediato.</p><p><strong>Limite:</strong> O auditado pode relatar o processo como "deveria ser", nao como realmente e. Sempre confirme com evidencia.</p></div>
  <div class="tab-panel"><p><strong>Quando usar:</strong> Para verificar se a pratica corresponde ao documentado — ver o processo acontecendo in loco.</p><p><strong>Vantagem:</strong> Evidencia direta e incontestavel. O auditor ve com os proprios olhos.</p><p><strong>Limite:</strong> O comportamento pode mudar na presenca do auditor (efeito observador). Combinar com registros historicos.</p></div>
  <div class="tab-panel"><p><strong>Quando usar:</strong> Para verificar evidencias objetivas de conformidade — formularios, sistemas, certificados, ordens de producao.</p><p><strong>Vantagem:</strong> Evidencia permanente, rastreavel, verificavel por terceiros.</p><p><strong>Limite:</strong> Registros podem estar completos mas o processo real ser diferente. Combinar com entrevista e observacao.</p></div>
</div>

<h3>Perguntas que funcionam</h3>
<table>
<tr><th>Tipo</th><th>Exemplo</th><th>Por que funciona</th></tr>
<tr><td>Aberta</td><td>"Como você controla..."</td><td>Obriga explicacao, revela o processo real</td></tr>
<tr><td>Mostre-me</td><td>"Mostre-me o registro de..."</td><td>Gera evidência objetiva</td></tr>
<tr><td>Hipotetica</td><td>"Se chegar material fora da específicação, o que você faz?"</td><td>Testa conhecimento do procedimento</td></tr>
<tr><td>Rastreamento</td><td>"Posso ver o pedido que originou essa entrega?"</td><td>Segue a trilha do processo (rastreabilidade)</td></tr>
</table>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Perguntas que nao funcionam</h4><ul><li>"Voce segue o procedimento?" — resposta: "Sim." (revela nada)</li><li>"Voce sempre calibra conforme o plano, certo?" — induz a resposta</li><li>"Como voce faz a inspecao, quem treinou voce e qual a frequencia?" — confunde</li><li>"Tudo certo por aqui?" — resposta monossilabica garantida</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Perguntas que funcionam</h4><ul><li>"Como voce faz a inspecao de recebimento?" — revela o processo real</li><li>"Mostre-me o registro do ultimo recebimento" — gera evidencia objetiva</li><li>"Se o material chega fora da especificacao, o que acontece?" — testa o procedimento</li><li>"Posso ver o pedido que originou essa entrega?" — rastreia a trilha</li></ul></div>
</div>

<h3>Perguntas que NAO funcionam</h3>
<ul>
<li><strong>Sim/não:</strong> "Você segue o procedimento?" — resposta: "Sim". (Não revela nada.)</li>
<li><strong>Indutiva:</strong> "Você sempre calibra os instrumentos conforme o plano, certo?" — induz a resposta.</li>
<li><strong>Multipla:</strong> "Como você faz a inspeção, quem treinou você e qual a frequência?" — confunde o auditado.</li>
</ul>

<div class="example"><strong>Na cooperativa agrícola:</strong> O auditor pergunta ao operador do secador: "Me explique como você controla a temperatura de secagem do milho." O operador explica. O auditor pede: "Posso ver os registros da última semana?" Ao verificar, nota que há 2 dias sem registro. Sondagem: "O que aconteceu nesses dias?" Resposta: "Estava em manutenção." O auditor verifica a ordem de serviço de manutenção. Se não existir, há uma constatação.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Na auditoria de uma cooperativa agricola em Minas Gerais, o auditor Ricardo iniciou a entrevista com o operador do secador de graos de forma ampla: "Me explique como voce controla a secagem do milho." O operador discorreu por 10 minutos. Ricardo foi afunilando: "Voce registra a temperatura a cada quanto tempo?" — "A cada hora." — "Posso ver os registros da ultima semana?" Ao analisar, notou dois dias sem registros. "O que aconteceu nesses dias?" — "Manutenção preventiva." — "Posso ver a ordem de servico de manutencao?" Ela nao existia. Constatacao gerada. Sem a tecnica de funil, Ricardo provavelmente teria saido da entrevista sem nada.</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A tecnica do funil comeca com perguntas abertas (contexto) e vai afunilando ate a evidencia objetiva verificavel." data-fb-nok="Pense na ordem: primeiro entenda o processo, depois aprofunde, depois solicite a evidencia concreta.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual e a ordem correta na tecnica do funil de entrevista?</div>
  <button class="qi-option" data-key="a">A) Solicitar registros → perguntar sobre desvios → perguntar de forma ampla</button>
  <button class="qi-option" data-key="b">B) Perguntar de forma ampla → aprofundar → solicitar evidencia → sondar desvios</button>
  <button class="qi-option" data-key="c">C) Perguntar de forma direta → confirmar com sim/nao → registrar constatacao</button>
  <div class="qi-feedback"></div>
</div>

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

<div class="diagram">
  <svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Fluxo de Avaliacao de Conformidade</text>
    <rect x="10" y="30" width="80" height="50" rx="6" fill="#2563eb"/>
    <text x="50" y="52" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">CRITERIO</text>
    <text x="50" y="66" text-anchor="middle" fill="#bfdbfe" font-size="8">O que a norma</text>
    <text x="50" y="76" text-anchor="middle" fill="#bfdbfe" font-size="8">exige?</text>
    <line x1="90" y1="55" x2="110" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4c)"/>
    <rect x="110" y="30" width="80" height="50" rx="6" fill="#eab308"/>
    <text x="150" y="52" text-anchor="middle" fill="#0b1730" font-size="9" font-weight="bold">EVIDENCIA</text>
    <text x="150" y="66" text-anchor="middle" fill="#0b1730" font-size="8">O que foi</text>
    <text x="150" y="76" text-anchor="middle" fill="#0b1730" font-size="8">encontrado?</text>
    <line x1="190" y1="55" x2="210" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4c)"/>
    <rect x="210" y="30" width="80" height="50" rx="6" fill="#7c3aed"/>
    <text x="250" y="52" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">CONSTATACAO</text>
    <text x="250" y="66" text-anchor="middle" fill="#ddd6fe" font-size="8">C / NC / OM</text>
    <text x="250" y="76" text-anchor="middle" fill="#ddd6fe" font-size="8">classificar</text>
    <line x1="290" y1="55" x2="310" y2="55" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arr4c)"/>
    <rect x="310" y="30" width="100" height="50" rx="6" fill="#16a34a"/>
    <text x="360" y="52" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">CONCLUSAO</text>
    <text x="360" y="66" text-anchor="middle" fill="#bbf7d0" font-size="8">Resultado geral</text>
    <text x="360" y="76" text-anchor="middle" fill="#bbf7d0" font-size="8">da auditoria</text>
    <defs><marker id="arr4c" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker></defs>
  </svg>
  <figcaption>Do criterio a conclusao: o fluxo logico de avaliacao de conformidade</figcaption>
</div>

<h3>O processo de avaliação</h3>
<p>Para cada item do checklist, siga este fluxo mental:</p>
<ol>
<li><strong>Identifique o critério:</strong> O que a norma/procedimento exige?</li>
<li><strong>Verifique a evidência:</strong> O que você efetivamente encontrou?</li>
<li><strong>Compare:</strong> A evidência atende ao critério?</li>
<li><strong>Classifique:</strong> Conforme, NC ou OM?</li>
<li><strong>Registre:</strong> Documente no checklist com detalhes suficientes</li>
</ol>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Identificar o criterio</strong><br>Qual clausula da norma ou item do procedimento se aplica a esta evidencia?</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Verificar a evidencia</strong><br>O que voce efetivamente viu, ouviu ou leu? Anote com especificidade: numeros, datas, codigos</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Comparar</strong><br>A evidencia atende ao criterio? Ha lacuna objetiva entre o exigido e o encontrado?</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Classificar</strong><br>Conforme (C), Nao conformidade (NC) ou Oportunidade de melhoria (OM)?</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Registrar com detalhes</strong><br>Documente no checklist com criterio, evidencia especifica e sua classificacao fundamentada</div></div>
</div>

<div class="callout"><strong>Princípio fundamental:</strong> Uma constatação de NC deve sempre ter tres elementos: (1) o <strong>critério</strong> que não foi atendido, (2) a <strong>evidência</strong> objetiva, e (3) a <strong>explicacao</strong> de por que não atende. Se falta qualquer um dos tres, a constatação e fragil.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> Os 3 elementos de uma NC solida sao criterio, evidencia e declaracao. Sem criterio, nao ha base legal. Sem evidencia, nao ha prova. Sem declaracao, nao ha conexao entre os dois. Qualquer NC que falte um dos tres vai ser contestada — e merecidamente.</div></div>

<h3>Exemplo de constatação bem estruturada</h3>
<div class="template-box">
<p><strong>NC #1</strong></p>
<p><strong>Criterio:</strong> ISO 9001:2015 cl. 8.4.1 — A organização deve avaliar e selecionar provedores externos com base na sua capacidade de fornecer conforme requisitos.</p>
<p><strong>Evidência:</strong> Dos 15 fornecedores classificados como críticos na lista LF-001, 4 (Fornecedores C, F, J, M) não possuem registro de avaliação no periodo jan-jun 2025.</p>
<p><strong>Conclusão:</strong> Não conformidade — a avaliação de fornecedores não esta sendo realizada de forma sistemática conforme definido no PO-010.</p>
</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> NC mal estruturada</h4><ul><li>"O processo de compras esta desorganizado." (sem criterio, sem evidencia)</li><li>"Alguns registros estao incompletos." (evidencia vaga, sem criterio)</li><li>"O fornecedor parece ruim." (opiniao pessoal)</li><li>"Varias pessoas nao seguem o procedimento." (vago, sem especificidade)</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> NC bem estruturada</h4><ul><li>Criterio claro: clausula e procedimento especificados</li><li>Evidencia especifica: numeros, datas, codigos de documentos</li><li>Declaracao objetiva: por que e NC, sem adjetivos subjetivos</li><li>Escopo preciso: quem, o que, quando, onde</li></ul></div>
</div>

<h3>Quando NaO abrir NC</h3>
<ul>
<li><strong>Não ha critério claro:</strong> Se não ha requisito (norma ou procedimento) que exija aquilo, não eNC — pode ser OM</li>
<li><strong>Caso isolado comprovado:</strong> Se 1 registro em 50 tem erro e o auditado demonstra que e um caso pontual ja corrigido</li>
<li><strong>Opiniao pessoal:</strong> "Eu faria diferente" não ebase para NC</li>
</ul>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Numa metalurgica em Caxias do Sul, o auditor Sergio encontrou um operador que nao sabia recitar a politica da qualidade palavra por palavra. Sergio quase abriu uma NC de conscientizacao (clausula 7.3). Antes de registrar, perguntou: "Voce sabe qual e o foco principal da empresa em termos de qualidade?" O operador respondeu sem hesitar: "Zero defeito na entrega para o cliente — se o produto sair com problema, volta e a gente perde o contrato." Sergio verificou se havia treinamentos registrados, avisos vissiveis na area e reunioes de alinhamento. Tudo presente. Conclusao: conforme. A clausula 7.3 exige consciencia, nao decoreba. Sergio evitou uma NC que seria facilmente derrubada no encerramento.</p>
</div>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! Sem um criterio claro (clausula ou procedimento), nao ha base para abrir NC — pode ser no maximo uma OM ou observacao." data-fb-nok="Releia a secao 'Quando NAO abrir NC'. O criterio e o fundamento de qualquer constatacao negativa.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Voce acha que o almoxarifado poderia ser melhor organizado, mas nao ha nenhum procedimento ou requisito da norma que especifique como organiza-lo. O que voce faz?</div>
  <button class="qi-option" data-key="a">A) Registro como OM (oportunidade de melhoria), pois nao ha criterio para abrir NC</button>
  <button class="qi-option" data-key="b">B) Abro NC citando "boas praticas de almoxarifado" como criterio</button>
  <button class="qi-option" data-key="c">C) Nao registro nada, pois o auditor nao deve opinar sobre organizacao</button>
  <div class="qi-feedback"></div>
</div>

<div class="example"><strong>Cuidado:</strong> Na metalúrgica, o auditor encontra um operador que não sabe recitar a política da qualidade palavra por palavra. Isso e NC? Depende. A cláusula 7.3 exige que as pessoas estejam <strong>conscientes</strong> da política — não que a decoram. Se o operador sabe que a empresa busca qualidade e melhoria e entende seu papel, esta conforme.</div>
`}, NULL),

  (${m4.id}, '2-4-4-reunião-encerramento', 'Reuniao de encerramento', '15 min', 4, ${`
<h2>Reuniao de encerramento</h2>
<p>A reunião de encerramento e o momento em que a equipe auditora <strong>apresenta formalmente</strong> as constatações e conclusões da auditoria ao auditado. E uma etapa crítica: as constatações devem ser claras, as evidências devem ser apresentadas, e o auditado deve ter oportunidade de comentar.</p>

<h3>Quem participa</h3>
<p>Os mesmos participantes da reunião de abertura, mais qualquer pessoa que a direção considere relevante. E importante que quem tem autoridade para desencadear ações corretivas esteja presente.</p>

<div class="diagram">
  <svg viewBox="0 0 420 130" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="18" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Estrutura da Reuniao de Encerramento</text>
    <rect x="10" y="28" width="60" height="70" rx="5" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="40" y="50" text-anchor="middle" fill="#93c5fd" font-size="8" font-weight="bold">1. Agra-</text>
    <text x="40" y="62" text-anchor="middle" fill="#93c5fd" font-size="8" font-weight="bold">decimen</text>
    <text x="40" y="74" text-anchor="middle" fill="#93c5fd" font-size="7">to e recap</text>
    <line x1="70" y1="63" x2="82" y2="63" stroke="#6b7280" stroke-width="1" marker-end="url(#arr4e)"/>
    <rect x="82" y="28" width="68" height="70" rx="5" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="116" y="50" text-anchor="middle" fill="#fde68a" font-size="8" font-weight="bold">2. Escopo</text>
    <text x="116" y="62" text-anchor="middle" fill="#fde68a" font-size="8">amostral</text>
    <text x="116" y="74" text-anchor="middle" fill="#94a3b8" font-size="7">sem surpresas</text>
    <line x1="150" y1="63" x2="162" y2="63" stroke="#6b7280" stroke-width="1" marker-end="url(#arr4e)"/>
    <rect x="162" y="28" width="68" height="70" rx="5" fill="#c5383c"/>
    <text x="196" y="50" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">3. Consta-</text>
    <text x="196" y="62" text-anchor="middle" fill="#fff" font-size="8">tacoes</text>
    <text x="196" y="74" text-anchor="middle" fill="#fca5a5" font-size="7">criterio+evidencia</text>
    <line x1="230" y1="63" x2="242" y2="63" stroke="#6b7280" stroke-width="1" marker-end="url(#arr4e)"/>
    <rect x="242" y="28" width="68" height="70" rx="5" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="276" y="50" text-anchor="middle" fill="#86efac" font-size="8" font-weight="bold">4. Conclusao</text>
    <text x="276" y="62" text-anchor="middle" fill="#86efac" font-size="8">+ perguntas</text>
    <text x="276" y="74" text-anchor="middle" fill="#94a3b8" font-size="7">auditado</text>
    <line x1="310" y1="63" x2="322" y2="63" stroke="#6b7280" stroke-width="1" marker-end="url(#arr4e)"/>
    <rect x="322" y="28" width="88" height="70" rx="5" fill="#16a34a"/>
    <text x="366" y="50" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">5. Proximos</text>
    <text x="366" y="62" text-anchor="middle" fill="#fff" font-size="8">passos</text>
    <text x="366" y="74" text-anchor="middle" fill="#bbf7d0" font-size="7">prazos + assinatura</text>
    <defs><marker id="arr4e" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#6b7280"/></marker></defs>
  </svg>
  <figcaption>Os 5 blocos da reuniao de encerramento — sequencia e proposito de cada etapa</figcaption>
</div>

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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Agradeca e recapitule</strong><br>Comece com tom positivo. Reconheca a colaboracao da equipe antes de apresentar qualquer constatacao</div></div>
  <div class="step-item"><div class="step-content"><strong>Lembre o carater amostral</strong><br>Deixe claro que a auditoria nao cobriu 100% dos registros — pode haver outros desvios nao identificados</div></div>
  <div class="step-item"><div class="step-content"><strong>Apresente constatacoes uma a uma</strong><br>Cite criterio e evidencia para cada NC ou OM. Nenhuma surpresa — voce ja comunicou em campo</div></div>
  <div class="step-item"><div class="step-content"><strong>Classifique cada constatacao</strong><br>NC maior, NC menor ou OM. Explique os criterios de classificacao se necessario</div></div>
  <div class="step-item"><div class="step-content"><strong>Abra para perguntas e discordancias</strong><br>O auditado tem direito de questionar. Ouca, reveja se necessario, mantenha se a evidencia for solida</div></div>
  <div class="step-item"><div class="step-content"><strong>Defina proximos passos</strong><br>Prazo para acoes corretivas, responsaveis, formato do relatorio e forma de acompanhamento</div></div>
</div>

<div class="callout"><strong>Regra de ouro:</strong> Nenhuma constatação deve ser "surpresa" na reunião de encerramento. Se você identificou uma NC durante a auditoria, comunique ao auditado no momento — não guarde para o encerramento. Isso e apresentação justa e evita reações defensivas.</div>

<ul class="checklist">
  <li><span class="ck-box"></span>Sala reservada com antecedencia e participantes convocados</li>
  <li><span class="ck-box"></span>Constatacoes consolidadas e revisadas pela equipe auditora</li>
  <li><span class="ck-box"></span>Evidencias organizadas por constatacao (documento, foto, registro)</li>
  <li><span class="ck-box"></span>Classificacao de cada constatacao definida (NC maior, NC menor, OM)</li>
  <li><span class="ck-box"></span>Conclusao geral redigida de forma objetiva</li>
  <li><span class="ck-box"></span>Proximos passos e prazos definidos antes do encerramento</li>
  <li><span class="ck-box"></span>Modelo de ata de encerramento disponivel para assinatura</li>
</ul>

<h3>Lidando com discordancias</h3>
<p>O auditado pode discordar de uma constatação. Como proceder:</p>
<ul>
<li><strong>Ouça:</strong> O auditado pode ter informações que você não viu</li>
<li><strong>Reveja a evidência:</strong> Se o auditado apresentar evidência que refuta a constatação, altere-a</li>
<li><strong>Mantenha se houver base:</strong> Se a evidência e sólida, mantenha a constatação e registre a discordancia</li>
<li><strong>Não negocie:</strong> NC não e"negociável". Se o requisito não foi atendido, e NC — independente da justificativa</li>
</ul>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Como nao lidar com discordancias</h4><ul><li>Ceder a pressao emocional do auditado sem nova evidencia</li><li>"Vamos chamar de OM em vez de NC" — negociar a classificacao</li><li>Ignorar o argumento do auditado sem verificar</li><li>Entrar em disputa verbal ou tom defensivo</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Como lidar corretamente</h4><ul><li>Ouca o argumento do auditado com atencao genuina</li><li>Peca a evidencia que refuta a constatacao — se existir, ajuste</li><li>Se a evidencia e solida, mantenha e registre a discordancia formalmente</li><li>Explique que NC nao e negociavel — e uma avaliacao tecnica com base em requisito</li></ul></div>
</div>

<div class="example"><strong>Situação real na indústria alimentícia:</strong> O auditor aponta NC porque não encontrou registros de higienização das esteiras de quarta-feira. O gerente diz: "Na quarta paramos para manutenção preventiva, a higienização é feita após a manutenção e registrada no formulário de manutenção, não no de higienização." O auditor verifica o formulário de manutenção — realmente consta a higienização. Constatação retirada. O auditor sugere como OM que a rastreabilidade seria melhor se houvesse referência cruzada entre os dois formulários.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Numa auditoria de uma industria de embalagens em Sao Paulo, o auditor-lider Paulo apresentou uma NC sobre calibracao de instrumentos no encerramento. O gerente industrial ficou visivelmente irritado e afirmou que o instrumento citado havia sido calibrado na semana anterior. Paulo manteve a calma: "Se voce tiver o certificado de calibracao disponivel agora, posso revisar a constatacao imediatamente." O gerente buscou o documento — o certificado existia, mas com validade ate dezembro do ano anterior. A NC foi mantida. Paulo explicou: "O problema nao e voces nao calibrarem — e o controle de vencimento que falhou. O certificado precisava ser renovado em dezembro e agora e agosto." O gerente entendeu, concordou e a reuniao terminou com aperto de maos.</p>
</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Se o auditado apresentar evidencia concreta que refuta a constatacao, o auditor deve revisar e, se necessario, alterar ou retirar a NC." data-fb-nok="Lembre-se: o auditor deve ser justo. Se surgir nova evidencia, a constatacao deve ser revisada — isso nao e fraqueza, e integridade.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Durante o encerramento, o auditado apresenta um documento que voce nao havia visto que refuta diretamente a sua constatacao de NC. O que voce deve fazer?</div>
  <button class="qi-option" data-key="a">A) Manter a NC porque ja foi registrada e nao pode ser alterada</button>
  <button class="qi-option" data-key="b">B) Verificar o documento e, se valido, revisar ou retirar a constatacao</button>
  <button class="qi-option" data-key="c">C) Registrar a discordancia e deixar a decisao para o gestor do programa</button>
  <div class="qi-feedback"></div>
</div>

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

<div class="diagram">
  <svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="110" height="80" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="65" y="38" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">CRITÉRIO</text>
    <text x="65" y="56" text-anchor="middle" fill="#93c5fd" font-size="10">Qual requisito</text>
    <text x="65" y="70" text-anchor="middle" fill="#93c5fd" font-size="10">não foi atendido?</text>
    <rect x="145" y="10" width="110" height="80" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="200" y="38" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">EVIDÊNCIA</text>
    <text x="200" y="56" text-anchor="middle" fill="#fde68a" font-size="10">O que foi</text>
    <text x="200" y="70" text-anchor="middle" fill="#fde68a" font-size="10">encontrado?</text>
    <rect x="280" y="10" width="110" height="80" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="335" y="38" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">DECLARAÇÃO</text>
    <text x="335" y="56" text-anchor="middle" fill="#fca5a5" font-size="10">Por que é uma</text>
    <text x="335" y="70" text-anchor="middle" fill="#fca5a5" font-size="10">não conformidade?</text>
    <line x1="120" y1="50" x2="145" y2="50" stroke="#64748b" stroke-width="2" marker-end="url(#arr)"/>
    <line x1="255" y1="50" x2="280" y2="50" stroke="#64748b" stroke-width="2" marker-end="url(#arr)"/>
    <defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#64748b"/></marker></defs>
    <rect x="10" y="110" width="380" height="50" rx="8" fill="#16a34a" opacity="0.15" stroke="#16a34a" stroke-width="1.5"/>
    <text x="200" y="133" text-anchor="middle" fill="#16a34a" font-size="11" font-weight="bold">NC bem redigida = Critério + Evidência + Declaração</text>
    <text x="200" y="152" text-anchor="middle" fill="#16a34a" font-size="10">Qualquer pessoa deve conseguir entender sem ter estado presente</text>
  </svg>
  <figcaption>Os três elementos obrigatórios de toda não conformidade bem redigida</figcaption>
</div>

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

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="180" height="160" rx="10" fill="#0b1730" opacity="0.85"/>
    <text x="100" y="40" text-anchor="middle" fill="#eab308" font-size="13" font-weight="bold">Verbal</text>
    <text x="100" y="62" text-anchor="middle" fill="#fff" font-size="11">Tom de voz</text>
    <text x="100" y="80" text-anchor="middle" fill="#fff" font-size="11">Vocabulário</text>
    <text x="100" y="98" text-anchor="middle" fill="#fff" font-size="11">Perguntas abertas</text>
    <text x="100" y="116" text-anchor="middle" fill="#fff" font-size="11">Reformulação</text>
    <text x="100" y="148" text-anchor="middle" fill="#c5383c" font-size="12" font-weight="bold">~20% do impacto</text>
    <rect x="230" y="10" width="180" height="160" rx="10" fill="#16a34a" opacity="0.85"/>
    <text x="320" y="40" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">Não Verbal</text>
    <text x="320" y="62" text-anchor="middle" fill="#fff" font-size="11">Postura corporal</text>
    <text x="320" y="80" text-anchor="middle" fill="#fff" font-size="11">Contato visual</text>
    <text x="320" y="98" text-anchor="middle" fill="#fff" font-size="11">Expressão facial</text>
    <text x="320" y="116" text-anchor="middle" fill="#fff" font-size="11">Gestos e acenos</text>
    <text x="320" y="148" text-anchor="middle" fill="#eab308" font-size="12" font-weight="bold">~80% do impacto</text>
    <text x="210" y="95" text-anchor="middle" fill="#0b1730" font-size="18" font-weight="bold">+</text>
  </svg>
  <figcaption>Comunicação eficaz do auditor: o impacto não verbal é amplificador do verbal</figcaption>
</div>

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

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Comunicação que fecha portas</h4><ul><li>"Você não esta seguindo o procedimento."</li><li>"Isso e claramente uma não conformidade."</li><li>Chegar sem se apresentar e já perguntar</li><li>Tom acusatório ou de superioridade</li><li>Comparar com outros setores</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Comunicação que abre portas</h4><ul><li>"Pode me mostrar como esse passo e feito?"</li><li>"Notei que o registro esta em branco — o que ocorreu?"</li><li>Apresentar-se antes de qualquer pergunta</li><li>Tom neutro, curioso e respeitoso</li><li>Reconhecer boas práticas quando existem</li></ul></div>
</div>

<h3>Postura profissional no chao de fábrica</h3>
<ul class="checklist">
<li><span class="ck-box"></span>Use os EPIs exigidos — sem exceção. Se você exige que outros sigam as regras, você segue primeiro.</li>
<li><span class="ck-box"></span>Não toque em equipamentos, produtos ou instrumentos sem autorização</li>
<li><span class="ck-box"></span>Não interrompa atividades em andamento — espere um momento adequado</li>
<li><span class="ck-box"></span>Cumprimente as pessoas e se apresente antes de fazer perguntas</li>
<li><span class="ck-box"></span>Não faca "emboscada" — não faca perguntas tipo "pegadinha"</li>
<li><span class="ck-box"></span>Anote evidências enquanto ouve — mostra que você valoriza as informações</li>
</ul>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Perguntas abertas revelam a prática real sem induzir a resposta esperada." data-fb-nok="Não é bem isso. Perguntas de sim/não ou indutivas não revelam como o processo realmente funciona.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Qual abordagem o auditor deve preferir ao verificar um processo com um operador?</div>
  <button class="qi-option" data-key="a">A — "Você segue o procedimento PO-020, correto?"</button>
  <button class="qi-option" data-key="b">B — "Me mostre como você faz o setup desta máquina."</button>
  <button class="qi-option" data-key="c">C — "O procedimento diz X. Por que você não faz X?"</button>
  <div class="qi-feedback"></div>
</div>

<div class="example"><strong>Situação na metalúrgica:</strong> O auditor chega na celula de usinagem CNC. Em vez de ir direto ao operador com o checklist na mao, ele se apresenta: "Oi, meu nome e Marcos, sou do time de qualidade. Você tem uns minutos? Gostaria de entender como funciona o controle de processo aqui." Essa abordagem abre portas.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Em uma metalúrgica de médio porte, o auditor Marcos notou que os operadores do turno da tarde eram visivelmente tensos com a presença da auditoria. Em vez de continuar interrogando, ele parou, pediu para acompanhar o processo por 10 minutos sem fazer perguntas — apenas observando. Os operadores relaxaram. Quando ele voltou a perguntar, as respostas foram muito mais detalhadas e honestas. Ao final, o supervisor disse: "Foi a auditoria menos estressante que já tivemos." O relatório incluiu mais evidências do que auditorias anteriores.</p>
</div>

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

<div class="diagram">
  <svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-cf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c5383c"/></marker>
      <marker id="arr-cf2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#eab308"/></marker>
      <marker id="arr-cf3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/></marker>
    </defs>
    <rect x="10" y="50" width="90" height="60" rx="8" fill="#c5383c" opacity="0.9"/>
    <text x="55" y="76" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Conflito</text>
    <text x="55" y="94" text-anchor="middle" fill="#fff" font-size="10">Resistência</text>
    <line x1="100" y1="80" x2="125" y2="80" stroke="#c5383c" stroke-width="2" marker-end="url(#arr-cf)"/>
    <rect x="125" y="50" width="90" height="60" rx="8" fill="#eab308" opacity="0.9"/>
    <text x="170" y="76" text-anchor="middle" fill="#0b1730" font-size="11" font-weight="bold">Reconhecer</text>
    <text x="170" y="94" text-anchor="middle" fill="#0b1730" font-size="10">Identificar tipo</text>
    <line x1="215" y1="80" x2="240" y2="80" stroke="#eab308" stroke-width="2" marker-end="url(#arr-cf2)"/>
    <rect x="240" y="50" width="90" height="60" rx="8" fill="#2563eb" opacity="0.9"/>
    <text x="285" y="76" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Redirecionar</text>
    <text x="285" y="94" text-anchor="middle" fill="#fff" font-size="10">Técnica certa</text>
    <line x1="330" y1="80" x2="355" y2="80" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-cf3)"/>
    <rect x="355" y="50" width="58" height="60" rx="8" fill="#16a34a" opacity="0.9"/>
    <text x="384" y="76" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Resolução</text>
    <text x="384" y="94" text-anchor="middle" fill="#fff" font-size="10">Colaboração</text>
    <text x="210" y="30" text-anchor="middle" fill="#94a3b8" font-size="12">Fluxo de gestão de conflito na auditoria</text>
  </svg>
  <figcaption>Da resistência à resolução: reconhecer o tipo e escolher a técnica certa</figcaption>
</div>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Hostil</button><button class="tab-btn">Evasivo</button><button class="tab-btn">Ausente</button><button class="tab-btn">Intimidado</button></div>
  <div class="tab-panel active"><p><strong>Comportamento hostil/agressivo:</strong> O auditado ataca verbalmente, questiona a competência do auditor ou se recusa a cooperar abertamente.</p><p><strong>Técnica:</strong> Mantenha a calma e o tom neutro. Reconheça a expertise do auditado ("Entendo que você conhece muito bem esse processo"). Redirecione para as evidências, não para a pessoa. Se necessário, faça uma pausa de 10 minutos.</p></div>
  <div class="tab-panel"><p><strong>Comportamento evasivo:</strong> Respostas vagas, muda de assunto, responde perguntas com perguntas, fornece informações genéricas sem detalhes concretos.</p><p><strong>Técnica:</strong> Reformule a pergunta de forma mais específica. Peça registros concretos: "Pode me mostrar o registro do dia 15?" Em vez de aceitar o vago, ancore na evidência.</p></div>
  <div class="tab-panel"><p><strong>Comportamento ausente/indisponível:</strong> O auditado alega estar ocupado, adia respostas, não aparece nos horários combinados ou delega tudo para subordinados.</p><p><strong>Técnica:</strong> Comunique ao gestor do programa. Se necessário, reagende formalmente com suporte da direção. Documente os atrasos — podem ser evidência de falta de comprometimento com o SGQ.</p></div>
  <div class="tab-panel"><p><strong>Comportamento intimidado/nervoso:</strong> A pessoa trava, dá respostas monossilábicas, parece com medo de errar ou de ser punida por qualquer informação que forneça.</p><p><strong>Técnica:</strong> Tranquilize explicitamente: "Estou aqui para entender o processo, não para avaliar você pessoalmente." Comece com perguntas simples sobre o dia a dia. Deixe a pessoa mostrar o que faz bem antes de entrar em áreas mais sensíveis.</p></div>
</div>

<h3>Tecnicas de desescalada</h3>
<ol>
<li><strong>Reconheça o sentimento:</strong> "Entendo que e desconfortável ser auditado. Estou aqui para ajudar o processo, não para julgar pessoas."</li>
<li><strong>Reformule:</strong> Em vez de "você não fez o registro", diga "notei que o registro deste dia esta em branco. Pode me explicar o que aconteceu?"</li>
<li><strong>Foque em fatos:</strong> Afaste-se de opiniões e volte para evidências documentais.</li>
<li><strong>De tempo:</strong> Se o clima esquentar, sugira uma pausa. "Vamos fazer um intervalo de 10 minutos."</li>
<li><strong>Envolva o guia:</strong> Se o auditado designou um guia/acompanhante, ele pode ajudar a mediar.</li>
</ol>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>1. Reconheça o sentimento</strong><br>"Entendo que é desconfortável ser auditado. Estou aqui para ajudar o processo."</div></div>
  <div class="step-item"><div class="step-content"><strong>2. Reformule a abordagem</strong><br>Troque acusações por perguntas: "Notei que o registro está em branco. O que aconteceu?"</div></div>
  <div class="step-item"><div class="step-content"><strong>3. Foque em fatos</strong><br>Afaste-se de opiniões pessoais. Volte sempre para as evidências documentais.</div></div>
  <div class="step-item"><div class="step-content"><strong>4. Proponha uma pausa</strong><br>Se o clima esquentar: "Vamos fazer um intervalo de 10 minutos?" Reduz a tensão.</div></div>
  <div class="step-item"><div class="step-content"><strong>5. Envolva o guia</strong><br>O acompanhante designado pode mediar e ajudar a restabelecer o diálogo.</div></div>
</div>

<div class="callout"><strong>Limite:</strong> Se a resistencia impedir a auditoria (recusa em mostrar registros, obstrução ativa), registre no relatório e comunique ao gestor do programa e a direção. Isso pode ser uma NC em si mesma (obstrução ao processo de auditoria).</div>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! Reconhecer a expertise do auditado e redirecionar para evidências concretas é a técnica certa para lidar com hostilidade." data-fb-nok="Essa abordagem pode escalar o conflito ou evitar a situação sem resolvê-la. O auditor deve manter a calma e redirecionar para as evidências.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Um auditado diz: "Você não entende nada do meu trabalho!" Qual é a melhor resposta do auditor?</div>
  <button class="qi-option" data-key="a">A — Defender sua competência e explicar suas qualificações como auditor.</button>
  <button class="qi-option" data-key="b">B — "Tem razão, você conhece este processo muito melhor do que eu. É por isso que preciso que você me explique. Pode me mostrar os registros de temperatura?"</button>
  <button class="qi-option" data-key="c">C — Encerrar a entrevista e comunicar ao gestor do programa imediatamente.</button>
  <div class="qi-feedback"></div>
</div>

<div class="example"><strong>Caso real numa indústria alimentícia:</strong> O supervisor de produção ficou visivelmente irritado quando o auditor pediu para ver os registros de temperatura do pasteurizador. Disse: "Todo ano a mesma coisa, vocês só sabem cobrar papel!" O auditor respondeu calmamente: "Entendo a frustração. Os registros são importantes porque protegem o produto e a segurança do consumidor. Se houver uma forma melhor de manter esses registros que facilite o trabalho de vocês, podemos sugerir como oportunidade de melhoria." O supervisor mostrou os registros e, ao final, agradeceu pela sugestão de digitalização dos formulários.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Era terça-feira de manhã na planta de pasteurização da CoopLat quando o auditor Carlos chegou ao setor. O supervisor Jorge cruzou os braços assim que o viu entrar com a prancheta. "Todo ano a mesma coisa", murmurou. Carlos não se abalou. Pousou a prancheta na bancada e disse: "Jorge, você tem anos nesse setor. Quero entender como o processo funciona na prática — você conhece isso melhor do que ninguém." Jorge descruzou os braços. Trinta minutos depois, ele próprio apontava onde o sistema de registro poderia ser melhorado. A auditoria que parecia começar mal terminou com o supervisor defendendo a sugestão de digitalização na reunião de encerramento.</p>
</div>

<h3>Prevenção e a melhor estrategia</h3>
<ul>
<li>Comunique a agenda com antecedencia — surpresas geram resistencia</li>
<li>Explique na reunião de abertura que o foco e o processo, não a pessoa</li>
<li>Mantenha postura neutra e profissional durante toda a auditoria</li>
<li>Reconheca boas práticas — não só aponte problemas</li>
<li>Se possível, alterne auditores (evitar "perseguição" percebida)</li>
</ul>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Insight:</strong> A prevenção de conflitos começa antes mesmo da auditoria. Um e-mail bem redigido, uma reunião de abertura bem conduzida e uma postura consistentemente respeitosa eliminam 80% dos conflitos antes que eles aconteçam. O auditor que nunca precisa "desescalar" é o auditor que construiu confiança desde o início.</div></div>
`}, NULL),

  (${m6.id}, '2-6-3-pensamento-risco', 'Pensamento baseado em risco na auditoria', '15 min', 3, ${`
<h2>Pensamento baseado em risco na auditoria</h2>
<p>A versão 2018 da ISO 19011 incluiu a <strong>abordagem baseada em risco</strong> como setimo princípio. Na prática, isso significa que o auditor deve usar o pensamento baseado em risco para <strong>planejar, conduzir e reportar</strong> a auditoria, priorizando o que tem maior impacto potencial.</p>

<div class="diagram">
  <svg viewBox="0 0 440 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-rk" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/></marker>
    </defs>
    <text x="220" y="20" text-anchor="middle" fill="#94a3b8" font-size="12">Ciclo da auditoria com pensamento baseado em risco</text>
    <!-- boxes -->
    <rect x="5" y="40" width="65" height="50" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="37" y="62" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">Programa</text>
    <text x="37" y="76" text-anchor="middle" fill="#eab308" font-size="8">Priorizar</text>
    <text x="37" y="88" text-anchor="middle" fill="#eab308" font-size="8">processos</text>
    <line x1="70" y1="65" x2="90" y2="65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-rk)"/>
    <rect x="90" y="40" width="65" height="50" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="122" y="62" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">Planejamento</text>
    <text x="122" y="76" text-anchor="middle" fill="#eab308" font-size="8">Alocar mais</text>
    <text x="122" y="88" text-anchor="middle" fill="#eab308" font-size="8">auditores</text>
    <line x1="155" y1="65" x2="175" y2="65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-rk)"/>
    <rect x="175" y="40" width="65" height="50" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="207" y="62" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">Checklist</text>
    <text x="207" y="76" text-anchor="middle" fill="#eab308" font-size="8">+ perguntas</text>
    <text x="207" y="88" text-anchor="middle" fill="#eab308" font-size="8">críticas</text>
    <line x1="240" y1="65" x2="260" y2="65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-rk)"/>
    <rect x="260" y="40" width="65" height="50" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/>
    <text x="292" y="62" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold">Amostragem</text>
    <text x="292" y="76" text-anchor="middle" fill="#eab308" font-size="8">+ itens em</text>
    <text x="292" y="88" text-anchor="middle" fill="#eab308" font-size="8">áreas críticas</text>
    <line x1="325" y1="65" x2="345" y2="65" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-rk)"/>
    <rect x="345" y="40" width="90" height="50" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="390" y="62" text-anchor="middle" fill="#86efac" font-size="9" font-weight="bold">Avaliação/Relatório</text>
    <text x="390" y="76" text-anchor="middle" fill="#eab308" font-size="8">Impacto ao</text>
    <text x="390" y="88" text-anchor="middle" fill="#eab308" font-size="8">classificar NCs</text>
    <text x="220" y="125" text-anchor="middle" fill="#64748b" font-size="10">Risco guia cada etapa do processo de auditoria</text>
  </svg>
  <figcaption>As 6 etapas da auditoria onde o pensamento baseado em risco se aplica</figcaption>
</div>

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

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">🔴</div><div class="kpi-label">Reclamações de clientes recorrentes — sinal de alto risco</div></div>
  <div class="kpi-card"><div class="kpi-value">⚠️</div><div class="kpi-label">NCs recorrentes em auditorias anteriores — área prioritária</div></div>
  <div class="kpi-card"><div class="kpi-value">🔄</div><div class="kpi-label">Mudanças recentes de processo, equipe ou equipamento</div></div>
  <div class="kpi-card"><div class="kpi-value">⚙️</div><div class="kpi-label">Processos especiais — resultado só verificável destrutivamente</div></div>
</div>

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

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! O pensamento baseado em risco significa priorizar onde o impacto potencial é maior — não auditar tudo igualmente, e não apenas onde é mais fácil." data-fb-nok="Essa abordagem não aplica o pensamento baseado em risco. O auditor deve priorizar onde o impacto potencial é maior.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Ao elaborar o programa anual de auditoria, como o pensamento baseado em risco deve ser aplicado?</div>
  <button class="qi-option" data-key="a">A — Auditar todos os processos com a mesma frequência para garantir imparcialidade.</button>
  <button class="qi-option" data-key="b">B — Auditar primeiro os processos mais fáceis e documentados para garantir bons resultados.</button>
  <button class="qi-option" data-key="c">C — Aumentar a frequência e profundidade das auditorias nos processos com maior histórico de NCs, reclamações ou mudanças recentes.</button>
  <div class="qi-feedback"></div>
</div>

<div class="example"><strong>Na metalúrgica:</strong> O programa de auditoria identifica que o processo de tratamento termico e de alto risco: (a) e um processo especial (resultado só verificável destrutivamente); (b) houve 2 NCs em auditorias anteriores; (c) opera no turno noturno com supervisao reduzida. Resultado: o tratamento termico recebe 2 auditorias por ano (ao inves de 1) com auditor que tem experiência em metalurgia.</div>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Programa: frequência proporcional ao risco</strong><br>Processos críticos auditados 2x/ano; processos estáveis e de baixo risco, 1x/ano.</div></div>
  <div class="step-item"><div class="step-content"><strong>Planejamento: alocação de recursos proporcional</strong><br>Auditor com experiência técnica na área de risco + mais tempo de auditoria alocado.</div></div>
  <div class="step-item"><div class="step-content"><strong>Checklist: profundidade nos controles críticos</strong><br>Mais perguntas, mais amostras, mais verificação de registros nos controles de alto risco.</div></div>
  <div class="step-item"><div class="step-content"><strong>Avaliação: impacto como critério de classificação</strong><br>NC em processo especial tende a ser maior; NC administrativa tende a ser menor.</div></div>
</div>

<h3>Riscos DO programa de auditoria</h3>
<p>Alem de considerar riscos NOS processos auditados, o gestor deve considerar riscos no próprio programa:</p>
<ul>
<li><strong>Risco de não executar:</strong> Auditores sobrecarregados, ausências, falta de recursos</li>
<li><strong>Risco de baixa qualidade:</strong> Auditores não qualificados, checklists genericos</li>
<li><strong>Risco de parcialidade:</strong> Auditor auditando área com conflito de interesse</li>
<li><strong>Risco de irrelevancia:</strong> Programa que não cobre processos críticos ou mudancas recentes</li>
</ul>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Auditoria genérica (sem risco)</h4><ul><li>Todos os processos auditados com igual frequência</li><li>Checklist padrão aplicado a todos</li><li>Auditor sem experiência técnica específica</li><li>Não considera histórico de NCs ou reclamações</li><li>Não atualiza o programa quando há mudanças</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Auditoria baseada em risco</h4><ul><li>Processos críticos auditados com maior frequência</li><li>Checklist aprofundado em controles de alto risco</li><li>Auditor com perfil técnico adequado ao processo</li><li>Histórico de NCs e reclamações guia o foco</li><li>Programa revisado sempre que há mudanças significativas</li></ul></div>
</div>

<div class="callout"><strong>Aplicação prática:</strong> Não e preciso uma análise de risco formal (matriz probabilidade x impacto) para cada auditoria interna. O importante e que o auditor <strong>pense</strong> sobre o que e mais crítico e direcione seu tempo e atenção proporcionalmente. Isso ja atende ao princípio.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Na MetalSul, o gestor do programa de auditoria tinha 12 processos para cobrir em um ano com apenas dois auditores internos. Em vez de dividir igualmente — um processo por mês — ele aplicou o pensamento baseado em risco. O tratamento térmico, processo especial com histórico de NCs e operação noturna, recebeu duas auditorias anuais com o auditor mais experiente. A usinagem CNC, com reclamações recentes de clientes, recebeu auditoria no primeiro trimestre com foco em controle dimensional. Os processos administrativos estáveis foram auditados uma vez, no segundo semestre. Ao final do ano, o programa havia identificado mais NCs relevantes com o mesmo esforço — porque foi onde importava.</p>
</div>
`}, NULL),

  (${m6.id}, '2-6-4-ética-confidencialidade', 'Ética e confidencialidade', '15 min', 4, ${`
<h2>Ética e confidencialidade</h2>
<p>A auditoria coloca o auditor numa posição de <strong>poder e confiança</strong>. Ele tem acesso a informações sensíveis, avalia o trabalho de colegas e gera constatações que podem ter consequências significativas. Sem ética e confidencialidade, esse poder se corrompe e o processo perde legitimidade.</p>

<div class="diagram">
  <svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="22" text-anchor="middle" fill="#94a3b8" font-size="12">5 Princípios Éticos do Auditor</text>
    <!-- center -->
    <circle cx="210" cy="115" r="30" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="210" y="111" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">Auditor</text>
    <text x="210" y="125" text-anchor="middle" fill="#eab308" font-size="10" font-weight="bold">Ético</text>
    <!-- nodes -->
    <circle cx="210" cy="45" r="28" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="210" y="41" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">Veracidade</text>
    <text x="210" y="55" text-anchor="middle" fill="#64748b" font-size="8">Relatar o que viu</text>
    <line x1="210" y1="73" x2="210" y2="85" stroke="#2563eb" stroke-width="1.5"/>
    <circle cx="100" cy="80" r="28" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="100" y="76" text-anchor="middle" fill="#86efac" font-size="9" font-weight="bold">Imparcialidade</text>
    <text x="100" y="90" text-anchor="middle" fill="#64748b" font-size="8">Sem favoritismo</text>
    <line x1="124" y1="92" x2="182" y2="108" stroke="#16a34a" stroke-width="1.5"/>
    <circle cx="320" cy="80" r="28" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/>
    <text x="320" y="76" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold">Objetividade</text>
    <text x="320" y="90" text-anchor="middle" fill="#64748b" font-size="8">Evidências, não opinião</text>
    <line x1="297" y1="92" x2="238" y2="108" stroke="#c5383c" stroke-width="1.5"/>
    <circle cx="120" cy="175" r="28" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="120" y="171" text-anchor="middle" fill="#fde68a" font-size="9" font-weight="bold">Responsabilidade</text>
    <text x="120" y="185" text-anchor="middle" fill="#64748b" font-size="8">Qualidade do trabalho</text>
    <line x1="145" y1="162" x2="183" y2="138" stroke="#eab308" stroke-width="1.5"/>
    <circle cx="300" cy="175" r="28" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="300" y="171" text-anchor="middle" fill="#86efac" font-size="9" font-weight="bold">Respeito</text>
    <text x="300" y="185" text-anchor="middle" fill="#64748b" font-size="8">Dignidade de todos</text>
    <line x1="276" y1="162" x2="237" y2="138" stroke="#16a34a" stroke-width="1.5"/>
  </svg>
  <figcaption>Os 5 princípios éticos que sustentam a credibilidade do auditor interno</figcaption>
</div>

<h3>Principios eticos do auditor</h3>
<ul>
<li><strong>Veracidade:</strong> Relatar exatamente o que foi encontrado — sem exagerar, minimizar ou omitir</li>
<li><strong>Imparcialidade:</strong> Não favorecer nem prejudicar nenhum auditado por relações pessoais</li>
<li><strong>Objetividade:</strong> Basear constatações em evidências, não em opiniões ou preconceitos</li>
<li><strong>Responsabilidade:</strong> Assumir a responsabilidade pela qualidade e precisão do trabalho</li>
<li><strong>Respeito:</strong> Tratar todos com dignidade, independente de cargo ou função</li>
</ul>

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Pressão da chefia</button><button class="tab-btn">Amigo auditado</button><button class="tab-btn">Presente/brinde</button></div>
  <div class="tab-panel active"><p><strong>Dilema:</strong> Seu supervisor pede para "pegar leve" com determinado setor porque "a diretoria está de olho nos resultados".</p><p><strong>Resposta ética:</strong> Mantenha a imparcialidade. Audite conforme os critérios definidos, não conforme interesses políticos. Se a pressão persistir, documente e considere comunicar ao gestor do programa de auditoria. A integridade do processo depende da sua independência.</p></div>
  <div class="tab-panel"><p><strong>Dilema:</strong> Você descobre que um amigo próximo não segue o procedimento em sua área — e você está auditando justamente essa área.</p><p><strong>Resposta ética:</strong> Registre a constatação como faria com qualquer outro auditado. Se o relacionamento pessoal comprometer sua objetividade percebida, o correto é solicitar sua substituição nessa auditoria e declarar o conflito de interesse ao gestor do programa.</p></div>
  <div class="tab-panel"><p><strong>Dilema:</strong> O auditado oferece um almoço especial ou brinde ao final da auditoria, como gesto de agradecimento.</p><p><strong>Resposta ética:</strong> Recuse cortesmente. "Obrigado, mas prefiro não aceitar para manter minha independência como auditor." Aceitar presentes — mesmo pequenos — compromete a percepção de independência e pode influenciar futuras auditorias, mesmo que inconscientemente.</p></div>
</div>

<h3>Dilemas eticos comuns</h3>
<table>
<tr><th>Dilema</th><th>Resposta ética</th></tr>
<tr><td>Seu supervisor pede para "pegar leve" com certo setor</td><td>Mantenha a imparcialidade. Audite conforme os critérios, não conforme interesses politicos.</td></tr>
<tr><td>Você descobre que um amigo proximo não segue o procedimento</td><td>Registre a constatação como faria com qualquer outro auditado. Se ha conflito de interesse, solicite substituição.</td></tr>
<tr><td>O auditado oferece um "presente" (almoço especial, brinde)</td><td>Recuse cortesmente. Aceitar pode comprometer sua independencia percebida.</td></tr>
<tr><td>Você encontra evidência de fraude (não apenas NC)</td><td>Registre e comunique ao gestor do programa e a direção. Não tente investigar alem do escopo da auditoria.</td></tr>
<tr><td>A direção quer que você "gere NCs" para justificar demissao de alguem</td><td>Recuse. Auditoria não eferramenta disciplinar. NCs são geradas por evidências, não por agenda política.</td></tr>
</table>

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A NC deve ser registrada da mesma forma que qualquer outra — baseada em evidências. Se há conflito de interesse real, o auditor deve solicitar substituição, não omitir a constatação." data-fb-nok="Essa abordagem compromete a objetividade e a imparcialidade do auditor. A constatação deve ser tratada com os mesmos critérios aplicados a qualquer auditado.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Durante a auditoria, você identifica que um colega próximo não cumpre o procedimento de qualidade. Qual é a conduta ética correta?</div>
  <button class="qi-option" data-key="a">A — Registrar a constatação normalmente, baseada em evidências, como faria com qualquer outro auditado. Se houver conflito de interesse, declarar ao gestor do programa.</button>
  <button class="qi-option" data-key="b">B — Ignorar a constatação para não prejudicar o colega, já que a relação pessoal pode afetar o ambiente de trabalho.</button>
  <button class="qi-option" data-key="c">C — Registrar a NC mas com classificação mais branda (OM em vez de NC menor) para minimizar o impacto.</button>
  <div class="qi-feedback"></div>
</div>

<div class="callout"><strong>Teste de ética:</strong> Antes de agir, pergunte-se: "Se esta decisao fosse publicada no mural da empresa, eu me sentiria confortável?" Se a resposta for não, repense.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Fernanda era auditora interna há dois anos na cooperativa agrícola quando recebeu uma tarefa difícil: auditar o setor de compras, chefiado por um amigo de longa data. Antes de iniciar, ela foi ao gestor do programa. "Tenho relação pessoal com o responsável pelo setor. Prefiro declarar isso formalmente antes de começar." O gestor documentou a situação e confirmou que Fernanda deveria prosseguir — mas com um segundo auditor acompanhando. A auditoria identificou duas NCs. Fernanda as registrou exatamente como encontrou. O amigo ficou desconfortável por um tempo, mas meses depois disse: "Foi você que me ajudou a organizar o processo. Eu precisava daquilo." A ética custou um desconforto momentâneo e construiu uma reputação duradoura.</p>
</div>

<h3>Confidencialidade na prática</h3>
<p>O auditor interno tem obrigação de manter sigilo sobre:</p>
<ul>
<li>Informações de processos e tecnologia da empresa</li>
<li>Dados de fornecedores, precos, contratos</li>
<li>Problemas identificados em setores específicos (não comentar com outros setores)</li>
<li>Informações pessoais dos auditados</li>
<li>Constatações antes de serem formalmente comunicadas</li>
</ul>

<ul class="checklist">
  <li><span class="ck-box"></span>Trabalhei recentemente (menos de 1 ano) na área que vou auditar?</li>
  <li><span class="ck-box"></span>Tenho parentesco ou relação pessoal próxima com o responsável pela área?</li>
  <li><span class="ck-box"></span>Tenho interesse direto no resultado desta auditoria (meta, bônus, cargo)?</li>
  <li><span class="ck-box"></span>Participei da elaboração ou implementação dos controles que vou auditar?</li>
  <li><span class="ck-box"></span>Tenho algum conflito pessoal com o auditado que possa afetar minha objetividade?</li>
</ul>
<p><em>Se marcou qualquer item acima, declare ao gestor do programa antes de iniciar a auditoria.</em></p>

<div class="example"><strong>Situação na cooperativa agrícola:</strong> Durante a auditoria do processo de compras de insumos, o auditor descobre que um fornecedor de sementes prática precos 40% acima do mercado e não ha cotação registrada. Ele registra a NC (falta de cotação conforme procedimento). Mas não comenta com colegas na hora do almoco que "o setor de compras esta pagando 40% a mais" — isso seria quebra de confidencialidade e poderia gerar fofocas e conflitos.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Teste do mural:</strong> Antes de tomar qualquer decisão ética como auditor, pergunte-se: "Se esta decisão fosse publicada no mural da empresa com meu nome, eu me sentiria confortável?" Se a resposta for não — recuse, declare, solicite substituição. A reputação de um auditor é construída em anos e destruída em minutos.</div></div>

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

<div class="diagram">
  <svg viewBox="0 0 440 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-ms" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/></marker>
    </defs>
    <text x="220" y="18" text-anchor="middle" fill="#94a3b8" font-size="12">Fases da auditoria — MetalSul</text>
    <rect x="10" y="35" width="95" height="55" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="57" y="58" text-anchor="middle" fill="#93c5fd" font-size="11" font-weight="bold">Preparação</text>
    <text x="57" y="73" text-anchor="middle" fill="#eab308" font-size="9">Documentos</text>
    <text x="57" y="85" text-anchor="middle" fill="#eab308" font-size="9">Checklist · Plano</text>
    <line x1="105" y1="62" x2="118" y2="62" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-ms)"/>
    <rect x="118" y="35" width="95" height="55" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="165" y="58" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="bold">Execução</text>
    <text x="165" y="73" text-anchor="middle" fill="#eab308" font-size="9">Entrevistas</text>
    <text x="165" y="85" text-anchor="middle" fill="#eab308" font-size="9">Observação · Registros</text>
    <line x1="213" y1="62" x2="226" y2="62" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-ms)"/>
    <rect x="226" y="35" width="95" height="55" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="273" y="58" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="bold">Constatações</text>
    <text x="273" y="73" text-anchor="middle" fill="#eab308" font-size="9">NCs · OMs</text>
    <text x="273" y="85" text-anchor="middle" fill="#eab308" font-size="9">Classificação</text>
    <line x1="321" y1="62" x2="334" y2="62" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-ms)"/>
    <rect x="334" y="35" width="95" height="55" rx="8" fill="#0b1730" stroke="#16a34a" stroke-width="2"/>
    <text x="381" y="58" text-anchor="middle" fill="#86efac" font-size="11" font-weight="bold">Encerramento</text>
    <text x="381" y="73" text-anchor="middle" fill="#eab308" font-size="9">Reunião · Relatório</text>
    <text x="381" y="85" text-anchor="middle" fill="#eab308" font-size="9">Follow-up</text>
  </svg>
  <figcaption>As 4 fases da auditoria interna na MetalSul Usinagem</figcaption>
</div>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Fabricação de peças usinadas de precisão para indústria automotiva e agrícola</li>
<li><strong>Processo auditado:</strong> Usinagem CNC (tornos e centros de usinagem)</li>
<li><strong>Motivo da prioridade:</strong> 3 reclamações de cliente nos ultimos 4 meses por variação dimensional; 1 NC na auditoria anterior (calibração)</li>
<li><strong>Auditor-lider:</strong> Ana (coord. de qualidade — 5 anos de experiência em auditoria)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 (Produção), 7.1.5 (Monitoramento e medição), PO-020 (Usinagem CNC)</li>
</ul>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Fase 1: Preparação</strong><br>Ana revisa documentação, RACs de reclamações, indicadores de refugo e o plano de calibração antes de entrar na fábrica.</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 2: Execução</strong><br>Entrevistas com supervisor e operadores, observação no chão de fábrica, análise dos registros de setup e calibração.</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 3: Constatações</strong><br>3 NCs menores identificadas — registros sem assinatura, frequência de inspeção incorreta, RACs sem causa-raiz.</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 4: Encerramento</strong><br>Reunião de encerramento, supervisor concorda com as NCs, relatório emitido em 3 dias úteis.</div></div>
</div>

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

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">3</div><div class="kpi-label">NCs encontradas na auditoria</div></div>
  <div class="kpi-card"><div class="kpi-value">85%</div><div class="kpi-label">Registros de setup em conformidade</div></div>
  <div class="kpi-card"><div class="kpi-value">3,8%</div><div class="kpi-label">Taxa de refugo (meta: 2%)</div></div>
  <div class="kpi-card"><div class="kpi-value">0</div><div class="kpi-label">RACs com causa-raiz documentada (de 2 analisadas)</div></div>
</div>

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

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A NC foi classificada como menor porque o desvio (frequência 1:50 em vez de 1:20) não comprometeu diretamente a conformidade do produto neste caso — apenas o cumprimento do procedimento. Se houvesse peças fora do dimensional como resultado direto, poderia ser maior." data-fb-nok="Pense no impacto real: a falha de frequência pode contribuir para o problema de refugo, mas sem evidência de produto não conforme liberado por isso, a NC fica na categoria menor.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Por que a NC #2 (frequência de inspeção 1:50 em vez de 1:20) foi classificada como menor e não maior?</div>
  <button class="qi-option" data-key="a">A — Porque desvios em procedimentos operacionais nunca são classificados como maiores.</button>
  <button class="qi-option" data-key="b">B — Porque o desvio afeta o cumprimento do procedimento, mas não há evidência direta de produto não conforme liberado como resultado dessa falha específica.</button>
  <button class="qi-option" data-key="c">C — Porque NCs de operadores são sempre menores; NCs de gestão são maiores.</button>
  <div class="qi-feedback"></div>
</div>

<h3>Fase 4: Encerramento e relatório</h3>
<p>Ana apresenta as constatações na reunião de encerramento. O supervisor concorda com as NCs e se compromete a tratar em 30 dias. Ana emite o relatório em 3 dias uteis.</p>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Foi durante a observação no chão de fábrica que Ana teve o momento decisivo da auditoria. Ela estava acompanhando o operador do torno CNC quando ele fez a inspeção de uma peça. Algo não estava certo: a peça saiu da máquina, o operador a mediu com o paquímetro e a colocou na caixa de aprovadas. Mas Ana havia notado no procedimento que a frequência deveria ser 1 em cada 20 — e aquela era a primeira peça sendo medida em um lote muito maior. Ela não interrompeu, apenas anotou o momento e o número da peça. Mais tarde, ao verificar os registros, confirmou: 1 medição a cada 50 peças, consistentemente. Não era distração — era prática habitual. A constatação mais relevante da auditoria nasceu de um detalhe silencioso, observado com atenção.</p>
</div>
`}, NULL),

  (${m7.id}, '2-7-2-caso-alimenticia', 'Estudo de caso: auditoria numa indústria alimentícia', '25 min', 2, ${`
<h2>Estudo de caso: auditoria interna numa indústria alimentícia</h2>
<p>Acompanhe a auditoria interna na <strong>CoopLat Laticinios</strong>, uma cooperativa de laticinios com 120 colaboradores no interior do Parana, certificada ISO 9001:2015 e com APPCC implementado. O processo auditado sera <strong>Pasteurização e envase</strong>.</p>

<div class="diagram">
  <svg viewBox="0 0 420 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-cl" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/></marker>
      <marker id="arr-ok" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#16a34a"/></marker>
      <marker id="arr-nok" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#c5383c"/></marker>
    </defs>
    <text x="210" y="18" text-anchor="middle" fill="#94a3b8" font-size="12">PCC — Pasteurização: 72°C × 15s</text>
    <rect x="10" y="40" width="100" height="50" rx="8" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="60" y="62" text-anchor="middle" fill="#93c5fd" font-size="10" font-weight="bold">Pasteurização</text>
    <text x="60" y="78" text-anchor="middle" fill="#eab308" font-size="9">72°C × 15s</text>
    <line x1="110" y1="65" x2="130" y2="65" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-cl)"/>
    <rect x="130" y="40" width="80" height="50" rx="8" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="170" y="62" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="bold">Verificação</text>
    <text x="170" y="78" text-anchor="middle" fill="#eab308" font-size="9">Registrar temp.</text>
    <!-- OK path -->
    <line x1="210" y1="55" x2="240" y2="40" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-ok)"/>
    <rect x="240" y="25" width="80" height="40" rx="8" fill="#16a34a" opacity="0.85"/>
    <text x="280" y="43" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">≥72°C ✓</text>
    <text x="280" y="57" text-anchor="middle" fill="#fff" font-size="9">Lote liberado</text>
    <!-- NOK path -->
    <line x1="210" y1="75" x2="240" y2="100" stroke="#c5383c" stroke-width="2" marker-end="url(#arr-nok)"/>
    <rect x="240" y="90" width="80" height="50" rx="8" fill="#c5383c" opacity="0.85"/>
    <text x="280" y="112" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">&lt;72°C ✗</text>
    <text x="280" y="126" text-anchor="middle" fill="#fff" font-size="9">Tratar desvio!</text>
    <!-- CoopLat failure -->
    <rect x="330" y="90" width="85" height="55" rx="8" fill="#0b1730" stroke="#c5383c" stroke-width="2" stroke-dasharray="5,3"/>
    <text x="372" y="112" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold">CoopLat</text>
    <text x="372" y="126" text-anchor="middle" fill="#fca5a5" font-size="9">Sem registro</text>
    <text x="372" y="140" text-anchor="middle" fill="#fca5a5" font-size="9">de desvio → NC#1</text>
    <line x1="320" y1="115" x2="333" y2="115" stroke="#c5383c" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="170" y="155" text-anchor="middle" fill="#64748b" font-size="10">Desvio não tratado = PCC comprometido</text>
  </svg>
  <figcaption>Fluxo de controle do PCC de pasteurização — onde a falha da CoopLat ocorreu</figcaption>
</div>

<h3>Contexto</h3>
<ul>
<li><strong>Empresa:</strong> Produção de leite pasteurizado, iogurte e queijo mussarela</li>
<li><strong>Processo auditado:</strong> Pasteurização e envase de leite</li>
<li><strong>Motivo da prioridade:</strong> Novo equipamento de envase instalado ha 3 meses; mudanca de turno (de 2 para 3 turnos)</li>
<li><strong>Auditor-lider:</strong> Roberto (analista de qualidade — formação em auditoria ISO 19011)</li>
<li><strong>Criterios:</strong> ISO 9001:2015 cl. 8.5 e 8.6, PO-035 (Pasteurização), IT-040 (Envase), IN 76 MAPA (instrução normativa)</li>
</ul>

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Fase 1: Preparação</strong><br>Roberto analisa o PO-035 revisado, identifica pontos críticos do 3º turno e foca nos registros de temperatura do pasteurizador como PCC.</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 2: Execução</strong><br>Entrevista com operador do 3º turno, verificação de registros de temperatura (15 dias amostrados), observação do envase.</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 3: Constatações</strong><br>NC#1 maior (temperatura 71,2°C sem tratamento de desvio), NC#2 menor (versão desatualizada do PO-035), OM#1 (alarme automático).</div></div>
  <div class="step-item"><div class="step-content"><strong>Fase 4: Ações pós-auditoria</strong><br>Recall preventivo do lote afetado, instalação de alarme SCADA, retreinamento do 3º turno, revisão do controle documental.</div></div>
</div>

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

<div class="quiz-inline" data-correct="a" data-fb-ok="Correto! A pasteurização é um PCC — falha aqui pode causar dano direto à saúde do consumidor. A ausência de tratamento do desvio significa que um lote potencialmente inseguro pode ter sido distribuído. Isso é critério clássico de NC maior." data-fb-nok="Lembre-se: a classificação como maior ou menor depende do impacto potencial. Falha em PCC com risco à segurança do consumidor é sempre NC maior.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">Por que a NC #1 da CoopLat foi classificada como maior (e não menor)?</div>
  <button class="qi-option" data-key="a">A — Porque envolve falha em PCC (Ponto Crítico de Controle) com potencial impacto direto na segurança do consumidor, e o lote comprometido foi distribuído sem tratamento do desvio.</button>
  <button class="qi-option" data-key="b">B — Porque a diferença de temperatura (71,2°C vs 72°C) é grande o suficiente para ser considerada crítica por qualquer norma.</button>
  <button class="qi-option" data-key="c">C — Porque a NC foi encontrada no turno noturno, onde a supervisão é reduzida, tornando a falha mais grave automaticamente.</button>
  <div class="qi-feedback"></div>
</div>

<div class="callout"><strong>Por que a NC #1 e maior:</strong> A pasteurização é um PCC — um ponto onde a falha pode causar dano a saúde do consumidor. A ausência de tratamento do desvio significa que um lote potencialmente inseguro pode ter sido liberado. Isso compromete a capacidade do SGQ de garantir segurança do produto — critério clássico de NC maior.</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> O que aconteceu na CoopLat</h4><ul><li>Temperatura de 71,2°C registrada às 03:15h</li><li>Operador não abriu registro de desvio</li><li>Nenhum tratamento do lote foi documentado</li><li>Lote distribuído normalmente</li><li>Desvio detectado apenas na auditoria interna</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Procedimento correto</h4><ul><li>Temperatura abaixo do limite detectada</li><li>Operador abre registro de desvio imediatamente</li><li>Lote segregado e identificado como "em quarentena"</li><li>Supervisor acionado para decisão de disposição</li><li>Alarme automático garante detecção em tempo real</li></ul></div>
</div>

<h3>Fase 4: Ações pos-auditoria</h3>
<p>O gestor de qualidade da CoopLat agiu imediatamente:</p>
<ul>
<li><strong>Correção (NC#1):</strong> Rastreou o lote do dia 12/06 — já havia sido distribuído. Acionou protocolo de recall preventivo.</li>
<li><strong>Ação corretiva (NC#1):</strong> Instalação de alarme automatico no SCADA + retreinamento de operadores do 3o turno sobre procedimento de desvio.</li>
<li><strong>Ação corretiva (NC#2):</strong> Revisao do processo de distribuição de documentos controlados para todos os turnos, com verificação semanal.</li>
</ul>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Lição do PCC:</strong> Em indústrias alimentícias, o auditor deve compreender o conceito de PCC (Ponto Crítico de Controle). Qualquer falha num PCC — como a pasteurização — tem potencial de causar dano direto ao consumidor. Por isso, NCs em PCCs são quase sempre classificadas como maiores, independentemente de quão pequeno parece o desvio numérico.</div></div>

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">2</div><div class="kpi-label">NCs encontradas (1 maior, 1 menor)</div></div>
  <div class="kpi-card"><div class="kpi-value">1</div><div class="kpi-label">Recall preventivo acionado</div></div>
  <div class="kpi-card"><div class="kpi-value">3</div><div class="kpi-label">Turnos agora com controles padronizados</div></div>
  <div class="kpi-card"><div class="kpi-value">0,3%</div><div class="kpi-label">Taxa de devolução (dentro da meta de 0,5%)</div></div>
</div>
`}, NULL),

  (${m7.id}, '2-7-3-erros-comuns', 'Erros comuns do auditor iniciante', '15 min', 3, ${`
<h2>Erros comuns do auditor iniciante</h2>
<p>Todo auditor começa como iniciante, e errar faz parte do aprendizado. Mas conhecer os erros mais frequentes ajuda você a evita-los desde o inicio e a se desenvolver mais rapido. Estes são os erros que vemos com mais frequência em auditores internos de primeira viagem.</p>

<div class="diagram">
  <svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg">
    <text x="210" y="18" text-anchor="middle" fill="#94a3b8" font-size="12">4 categorias de erros do auditor iniciante</text>
    <!-- Quadrant lines -->
    <line x1="210" y1="35" x2="210" y2="195" stroke="#334155" stroke-width="1"/>
    <line x1="10" y1="115" x2="410" y2="115" stroke="#334155" stroke-width="1"/>
    <!-- Q1: Planejamento -->
    <rect x="12" y="37" width="195" height="75" rx="6" fill="#0b1730" stroke="#2563eb" stroke-width="1.5"/>
    <text x="109" y="58" text-anchor="middle" fill="#93c5fd" font-size="11" font-weight="bold">Planejamento</text>
    <text x="109" y="74" text-anchor="middle" fill="#64748b" font-size="9">Não estudar documentação</text>
    <text x="109" y="88" text-anchor="middle" fill="#64748b" font-size="9">Checklist genérico</text>
    <text x="109" y="102" text-anchor="middle" fill="#64748b" font-size="9">Agenda irrealista</text>
    <!-- Q2: Execução -->
    <rect x="213" y="37" width="195" height="75" rx="6" fill="#0b1730" stroke="#c5383c" stroke-width="1.5"/>
    <text x="310" y="58" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="bold">Execução</text>
    <text x="310" y="74" text-anchor="middle" fill="#64748b" font-size="9">Perguntas de sim/não</text>
    <text x="310" y="88" text-anchor="middle" fill="#64748b" font-size="9">Seguir rigidamente o checklist</text>
    <text x="310" y="102" text-anchor="middle" fill="#64748b" font-size="9">Auditar só o "papel"</text>
    <!-- Q3: Comunicação -->
    <rect x="12" y="118" width="195" height="75" rx="6" fill="#0b1730" stroke="#eab308" stroke-width="1.5"/>
    <text x="109" y="139" text-anchor="middle" fill="#fde68a" font-size="11" font-weight="bold">Comunicação</text>
    <text x="109" y="155" text-anchor="middle" fill="#64748b" font-size="9">Tom de "fiscal"</text>
    <text x="109" y="169" text-anchor="middle" fill="#64748b" font-size="9">Guardar surpresas</text>
    <text x="109" y="183" text-anchor="middle" fill="#64748b" font-size="9">Falar no corredor</text>
    <!-- Q4: Relatório -->
    <rect x="213" y="118" width="195" height="75" rx="6" fill="#0b1730" stroke="#16a34a" stroke-width="1.5"/>
    <text x="310" y="139" text-anchor="middle" fill="#86efac" font-size="11" font-weight="bold">Relatório</text>
    <text x="310" y="155" text-anchor="middle" fill="#64748b" font-size="9">NC sem critério</text>
    <text x="310" y="169" text-anchor="middle" fill="#64748b" font-size="9">Baseado em opinião</text>
    <text x="310" y="183" text-anchor="middle" fill="#64748b" font-size="9">Relatório tardio</text>
  </svg>
  <figcaption>Os 4 quadrantes de erros mais comuns em auditores iniciantes</figcaption>
</div>

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

<div class="tabs">
  <div class="tab-btns"><button class="tab-btn active">Planejamento</button><button class="tab-btn">Execução</button><button class="tab-btn">Comunicação</button><button class="tab-btn">Relatório</button></div>
  <div class="tab-panel active"><p><strong>Erros de planejamento mais comuns:</strong></p><ul><li><strong>Não estudar a documentação:</strong> Leva a perguntas genéricas e constatações superficiais. Reserve 2h mínimas de preparação por dia de auditoria.</li><li><strong>Checklist copiado da internet:</strong> Perguntas não se aplicam ao processo real. Construa baseado nos procedimentos da empresa.</li><li><strong>Agenda irrealista:</strong> Entrevistas sempre demoram mais do que parece. Planeje com margem de 30%.</li></ul></div>
  <div class="tab-panel"><p><strong>Erros de execução mais comuns:</strong></p><ul><li><strong>Perguntas de sim/não:</strong> "Você segue o procedimento?" revela nada. "Me mostre como você faz" revela tudo.</li><li><strong>Seguir rigidamente o checklist:</strong> Use-o como guia, não como script. Siga as trilhas que surgem nas respostas.</li><li><strong>Auditar só o papel:</strong> Triangule sempre — documento + entrevista + observação no processo real.</li></ul></div>
  <div class="tab-panel"><p><strong>Erros de comunicação mais comuns:</strong></p><ul><li><strong>Tom de fiscal:</strong> Postura de "pegar" o auditado gera resistência e esconde informações. Seja parceiro.</li><li><strong>Guardar surpresas:</strong> Comunicar NCs só no encerramento parece uma emboscada. Informe ao longo da auditoria.</li><li><strong>Falar no corredor:</strong> Comentar constatações informalmente é quebra de confidencialidade e gera conflitos.</li></ul></div>
  <div class="tab-panel"><p><strong>Erros de relatório mais comuns:</strong></p><ul><li><strong>NC sem critério:</strong> Toda NC precisa citar o requisito violado (cláusula da norma ou item do procedimento).</li><li><strong>Opinião pessoal como NC:</strong> "Achei que poderia ser melhor" não é NC. Evidência vs. critério é NC.</li><li><strong>Relatório tardio:</strong> Mais de 2 semanas e a urgência se perde. Meta: até 5 dias úteis após o encerramento.</li></ul></div>
</div>

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

<div class="quiz-inline" data-correct="c" data-fb-ok="Correto! Uma NC precisa de critério (o que foi violado), evidência (o que foi encontrado) e declaração clara. Sem critério, a NC pode ser contestada e invalidada." data-fb-nok="Pense: o que torna uma NC válida e incontestável? Precisa ser baseada em evidência e ancorada em um requisito específico — não em opinião ou impressão.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Teste seu conhecimento</div>
  <div class="qi-question">O auditor iniciante escreve no relatório: "O setor de manutenção não está organizado e poderia ser mais eficiente." Qual é o problema com essa constatação?</div>
  <button class="qi-option" data-key="a">A — A linguagem é muito informal para um relatório de auditoria.</button>
  <button class="qi-option" data-key="b">B — Deveria ser classificada como NC maior, não como observação.</button>
  <button class="qi-option" data-key="c">C — Não é uma NC válida: não cita critério (requisito violado) nem evidência objetiva — é opinião pessoal do auditor.</button>
  <div class="qi-feedback"></div>
</div>

<div class="comparison">
  <div class="comp-col bad"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> Auditor iniciante</h4><ul><li>Chega sem ter lido os procedimentos</li><li>Usa checklist genérico da internet</li><li>Faz perguntas de sim/não</li><li>Anota impressões gerais, não evidências específicas</li><li>Guarda tudo para o encerramento</li><li>Emite relatório 3 semanas depois</li><li>NCs baseadas em "achei que estava errado"</li></ul></div>
  <div class="comp-col good"><h4><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 12 15 16 10"/></svg> Auditor experiente</h4><ul><li>Revisa documentação e histórico antes da auditoria</li><li>Checklist construído com base nos procedimentos reais</li><li>Usa perguntas abertas e observação direta</li><li>Anota número de documento, data, lote — evidência concreta</li><li>Comunica constatações à medida que surgem</li><li>Relatório em até 5 dias úteis</li><li>NC com critério, evidência e declaração clara</li></ul></div>
</div>

<div class="callout"><strong>Conselho para o auditor iniciante:</strong> Nas primeiras auditorias, va como observador ou membro da equipe (não como lider). Aprenda com auditores mais experientes. Anote o que funciona e o que não funciona. E lembre-se: confiança vem com prática.</div>

<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:25%"></div></div><div class="pv-label">Iniciante (0–25%): Aprende os conceitos, comete erros, observa mais experientes</div></div>
<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:65%"></div></div><div class="pv-label">Praticante (25–65%): Conduz auditorias com supervisão, melhora a comunicação</div></div>
<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:85%"></div></div><div class="pv-label">Proficiente (65–85%): Lidera auditorias, mentora iniciantes, aprimora o relatório</div></div>
<div class="progress-visual"><div class="pv-bar"><div class="pv-fill" style="width:100%"></div></div><div class="pv-label">Experiente (100%): Auditor reconhecido, contribui para o programa e forma novos auditores</div></div>

<div class="example"><strong>Erro clássico e como corrigir:</strong> O auditor iniciante encontra um formulário preenchido a lapis (em vez de caneta) e abre NC por "formulario preenchido a lapis". Mas não existe requisito (nem na norma, nem no procedimento da empresa) que proiba lapis. Isso e opiniao pessoal, nãoNC. Se o procedimento exigir caneta, ai sim — mas cite o procedimento.</div>

<div class="narration">
  <div class="narrator"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Caso real</div>
  <p>Lucas tinha 26 anos e era sua segunda auditoria como membro de equipe. Quando encontrou o formulário preenchido a lápis, sentiu aquela satisfação de "achei um problema". Anotou com entusiasmo. Na reunião de encerramento, quando mencionou a constatação, o auditor-líder Sérgio lhe deu um olhar sereno e, discretamente, passou um bilhetinho: "Qual é o requisito?" Lucas abriu o procedimento. Procurou. Não havia nada sobre caneta ou lápis. Ele mesmo retirou a constatação antes de ser questionado pelo auditado. No caminho de volta, Sérgio disse apenas: "Você vai lembrar disso para sempre." Lucas confirmou — nunca mais escreveu uma NC sem primeiro citar o requisito.</p>
</div>
`}, NULL),

  (${m7.id}, '2-7-4-preparação-quiz', 'Preparação para o quiz final e proximos passos', '15 min', 4, ${`
<h2>Preparação para o quiz final e proximos passos</h2>
<p>Você chegou ao final do curso. Antes do quiz final, vamos consolidar os temas-chave e orientar seus proximos passos como auditor interno.</p>

<div class="diagram">
  <svg viewBox="0 0 440 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr-jrn" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/></marker>
    </defs>
    <text x="220" y="18" text-anchor="middle" fill="#94a3b8" font-size="12">Sua jornada — 7 módulos do curso</text>
    <!-- M1 -->
    <circle cx="35" cy="75" r="22" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="35" y="71" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">M1</text>
    <text x="35" y="83" text-anchor="middle" fill="#64748b" font-size="8">Fundamentos</text>
    <line x1="57" y1="75" x2="70" y2="75" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M2 -->
    <circle cx="95" cy="55" r="22" fill="#0b1730" stroke="#2563eb" stroke-width="2"/>
    <text x="95" y="51" text-anchor="middle" fill="#93c5fd" font-size="9" font-weight="bold">M2</text>
    <text x="95" y="63" text-anchor="middle" fill="#64748b" font-size="8">Programa</text>
    <line x1="117" y1="55" x2="130" y2="55" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M3 -->
    <circle cx="155" cy="40" r="22" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="155" y="36" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold">M3</text>
    <text x="155" y="48" text-anchor="middle" fill="#64748b" font-size="8">Planejamento</text>
    <line x1="177" y1="40" x2="190" y2="40" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M4 -->
    <circle cx="215" cy="40" r="22" fill="#0b1730" stroke="#c5383c" stroke-width="2"/>
    <text x="215" y="36" text-anchor="middle" fill="#fca5a5" font-size="9" font-weight="bold">M4</text>
    <text x="215" y="48" text-anchor="middle" fill="#64748b" font-size="8">Execução</text>
    <line x1="237" y1="40" x2="250" y2="40" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M5 -->
    <circle cx="275" cy="55" r="22" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="275" y="51" text-anchor="middle" fill="#fde68a" font-size="9" font-weight="bold">M5</text>
    <text x="275" y="63" text-anchor="middle" fill="#64748b" font-size="8">Relatório</text>
    <line x1="297" y1="55" x2="310" y2="55" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M6 -->
    <circle cx="335" cy="75" r="22" fill="#0b1730" stroke="#eab308" stroke-width="2"/>
    <text x="335" y="71" text-anchor="middle" fill="#fde68a" font-size="9" font-weight="bold">M6</text>
    <text x="335" y="83" text-anchor="middle" fill="#64748b" font-size="8">Habilidades</text>
    <line x1="357" y1="75" x2="370" y2="75" stroke="#2563eb" stroke-width="1.5" marker-end="url(#arr-jrn)"/>
    <!-- M7 -->
    <circle cx="405" cy="75" r="28" fill="#16a34a" stroke="#16a34a" stroke-width="2"/>
    <text x="405" y="71" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold">M7</text>
    <text x="405" y="83" text-anchor="middle" fill="#fff" font-size="8">Prática</text>
    <text x="220" y="115" text-anchor="middle" fill="#64748b" font-size="10">Você chegou ao fim da jornada — agora é hora do quiz!</text>
  </svg>
  <figcaption>Os 7 módulos do curso de Auditor Interno ISO 9001 — da teoria à prática</figcaption>
</div>

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

<div class="kpi-grid">
  <div class="kpi-card"><div class="kpi-value">7</div><div class="kpi-label">Módulos completos</div></div>
  <div class="kpi-card"><div class="kpi-value">28</div><div class="kpi-label">Aulas assistidas</div></div>
  <div class="kpi-card"><div class="kpi-value">7</div><div class="kpi-label">Princípios ISO 19011 dominados</div></div>
  <div class="kpi-card"><div class="kpi-value">30</div><div class="kpi-label">Questões no quiz final</div></div>
</div>

<h3>Dicas para o quiz final</h3>
<ul>
<li>O quiz tem <strong>30 questões</strong> de múltipla escolha</li>
<li>Cobre todos os 7 modulos proporcionalmente</li>
<li>Foque nos conceitos, não em decorar números de cláusulas</li>
<li>Leia cada pergunta com atenção — muitas alternativas são parecidas</li>
<li>Quando em dúvida, pense no que a ISO 19011 e os princípios de auditoria recomendam</li>
</ul>

<div class="quiz-inline" data-correct="b" data-fb-ok="Correto! A classificação de uma NC como maior ou menor depende do impacto potencial — especialmente se compromete o SGQ como um todo ou apenas um requisito pontual. Uma NC recorrente ou que afeta produto/cliente tende a ser maior." data-fb-nok="Lembre-se: a classificação depende do impacto no SGQ e no cliente/produto, não apenas da natureza administrativa ou operacional da falha.">
  <div class="qi-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Aquecimento para o quiz</div>
  <div class="qi-question">Uma empresa não realiza análise de causa-raiz nas ações corretivas (apenas registra a correção imediata). Isso foi identificado em 3 auditorias seguidas sem tratamento. Como classificar?</div>
  <button class="qi-option" data-key="a">A — NC menor, porque análise de causa-raiz é um requisito procedimental e não afeta diretamente o produto.</button>
  <button class="qi-option" data-key="b">B — NC maior, porque a recorrência sem tratamento demonstra falha sistêmica que compromete a capacidade do SGQ de prevenir problemas.</button>
  <button class="qi-option" data-key="c">C — Apenas uma oportunidade de melhoria, porque a empresa ainda está corrigindo os problemas, mesmo sem análise formal.</button>
  <div class="qi-feedback"></div>
</div>

<h3>Checklist de competências adquiridas</h3>
<div>
<p>Marque cada competência que você sente que adquiriu ao longo do curso:</p>
<ul class="checklist">
  <li><span class="ck-box"></span>Explicar a diferença entre auditoria de 1ª, 2ª e 3ª parte</li>
  <li><span class="ck-box"></span>Listar e aplicar os 7 princípios da auditoria</li>
  <li><span class="ck-box"></span>Elaborar um programa anual de auditoria interna</li>
  <li><span class="ck-box"></span>Definir escopo, critérios e plano para uma auditoria individual</li>
  <li><span class="ck-box"></span>Construir checklists eficazes baseados em norma e procedimentos</li>
  <li><span class="ck-box"></span>Conduzir reuniões de abertura e encerramento</li>
  <li><span class="ck-box"></span>Aplicar técnicas de entrevista e coleta de evidências</li>
  <li><span class="ck-box"></span>Redigir não conformidades com critério, evidência e declaração</li>
  <li><span class="ck-box"></span>Classificar NCs (maior, menor) e OMs</li>
  <li><span class="ck-box"></span>Elaborar relatório de auditoria completo</li>
  <li><span class="ck-box"></span>Acompanhar ações corretivas e verificar eficácia</li>
  <li><span class="ck-box"></span>Gerenciar conflitos e resistências durante a auditoria</li>
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

<div class="step-flow">
  <div class="step-item"><div class="step-content"><strong>Passo 1: Faça o quiz final</strong><br>30 questões cobrindo todos os 7 módulos. Mínimo 70% para aprovação e emissão do certificado.</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 2: Observe uma auditoria real</strong><br>Peça para acompanhar a próxima auditoria interna da sua organização como observador. Veja a teoria em ação.</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 3: Conduza sua primeira auditoria</strong><br>Escolha um processo simples, com suporte de um auditor experiente. Aplique o checklist, faça a entrevista, documente.</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 4: Itere e melhore</strong><br>Após cada auditoria, reflita: o que funcionou? O que poderia ser melhor? A melhoria contínua vale para o auditor também.</div></div>
  <div class="step-item"><div class="step-content"><strong>Passo 5: Busque certificação formal</strong><br>Considere programas de certificação de auditor (IRCA, CQI) para reconhecimento profissional internacional.</div></div>
</div>

<div class="callout"><strong>Lembre-se:</strong> O certificado deste curso atesta sua formação teorica. A competência real vem com a <strong>prática</strong>. Comece a auditar o mais rapido possível, mesmo que em escopo pequeno. Cada auditoria ensinara mais do que qualquer teoria.</div>

<div class="insight-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg><div class="insight-content"><strong>Prática supera teoria:</strong> Um auditor que realizou 5 auditorias reais, mesmo cometendo erros, é mais competente do que alguém que estudou 100 horas sem nunca entrar numa sala de auditoria. O conhecimento deste curso é o mapa — mas o território só se aprende caminhando. Agende sua primeira auditoria esta semana.</div></div>
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
