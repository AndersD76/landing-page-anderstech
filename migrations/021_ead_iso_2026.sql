-- ── EAD: módulo sobre a ISO 9001:2026 nos cursos de norma (18/11/2026) ─────────
-- Os cursos "Interpretação" e "Auditor interno" são da versão 2015. A ISO
-- publicou a 2026 em 16/09/2026 e o prazo de transição vai até 30/09/2029: sem
-- este módulo, o aluno compraria um curso desatualizado sem saber. Fatos da
-- página da ISO e do documento de transição da Global ACI (TECH-3-TR v1.1).
-- Idempotente: só insere se o curso existir e o módulo ainda não existir.
-- (Sem ponto e vírgula no conteúdo: o executor de migrações divide por ele.)

INSERT INTO ead_modules (course_id, titulo, descricao, ordem)
SELECT c.id, 'ISO 9001:2026: o que muda e como fazer a transição',
       'Publicação, prazos oficiais da transição, mudanças requisito a requisito e o que ajustar no sistema antes da auditoria.',
       COALESCE((SELECT MAX(m.ordem) FROM ead_modules m WHERE m.course_id = c.id), 0) + 1
  FROM ead_courses c
 WHERE c.slug IN ('iso-9001-2015-interpretacao', 'auditor-interno-iso-9001')
   AND NOT EXISTS (SELECT 1 FROM ead_modules m WHERE m.course_id = c.id AND m.titulo = 'ISO 9001:2026: o que muda e como fazer a transição');

INSERT INTO ead_lessons (module_id, slug, titulo, duracao, ordem, conteudo)
SELECT m.id, 'iso-9001-2026-transicao', 'ISO 9001:2026: prazos, mudanças e plano de transição', '40 min', 1,
'<h2>ISO 9001:2026: prazos, mudanças e plano de transição</h2>
<p>A ISO publicou a ISO 9001:2026 (6ª edição, 36 páginas) em 16 de setembro de 2026. Ela substitui a ISO 9001:2015 e a emenda de 2024. Tudo o que você aprendeu neste curso continua valendo como base: a estrutura do sistema é a mesma. O que muda são pontos específicos, listados abaixo.</p>
<h3>Os prazos oficiais da transição</h3>
<table><thead><tr><th>Data</th><th>O que acontece</th></tr></thead><tbody>
<tr><td>16/09/2026</td><td>Publicação da norma e início do período de transição de 3 anos</td></tr>
<tr><td>até 31/03/2027</td><td>Organismos de acreditação prontos para acreditar certificadoras na versão 2026</td></tr>
<tr><td>até 30/06/2027</td><td>Prazo para as certificadoras apresentarem a declaração ao acreditador</td></tr>
<tr><td>até 30/09/2027</td><td>Decisões de acreditação das certificadoras</td></tr>
<tr><td>a partir de 31/03/2028</td><td>Certificação inicial só pela versão 2026</td></tr>
<tr><td>até 30/09/2029</td><td>Auditoria de transição feita e certificado 2026 emitido. Depois disso, certificados 2015 perdem a validade</td></tr>
</tbody></table>
<p>A auditoria de transição pode acontecer numa auditoria de manutenção, na recertificação ou numa auditoria especial, e pode ser remota.</p>
<h3>O que muda, requisito a requisito</h3>
<ul>
<li><b>5.1.1 Liderança:</b> nova alínea. A direção promove a cultura da qualidade e o comportamento ético. O termo melhoria passa a ser melhoria contínua.</li>
<li><b>5.2.1 Política:</b> a política da qualidade se liga ao contexto e à direção estratégica da organização.</li>
<li><b>6.1 Riscos e oportunidades:</b> dividido em três requisitos. 6.1.1 determinar riscos e oportunidades, 6.1.2 ações para riscos, 6.1.3 ações para oportunidades.</li>
<li><b>6.3 Planejamento de mudanças:</b> passa a exigir monitorar a eficácia da mudança, comunicar e analisar os resultados.</li>
<li><b>7.3 Conscientização:</b> inclui a cultura da qualidade e o comportamento ético.</li>
<li><b>9.3.2 Análise crítica:</b> as entradas passam a ser obrigatórias (deve incluir) e entra uma nova, as mudanças nas necessidades e expectativas das partes interessadas.</li>
<li><b>Estrutura:</b> termos alinhados à estrutura harmonizada das normas ISO, Anexo A reescrito e Anexo B removido. A avaliação sobre mudança climática, incluída em 2024, foi mantida.</li>
</ul>
<h3>Plano de transição em 6 passos</h3>
<ol>
<li>Pergunte à sua certificadora quando ela estará acreditada para a versão 2026 e em qual auditoria fará a transição.</li>
<li>Revise a política da qualidade junto com o planejamento estratégico.</li>
<li>Separe no registro de riscos o levantamento, as ações para riscos e as ações para oportunidades.</li>
<li>Inclua no controle de mudanças a verificação de eficácia, a comunicação e a análise do resultado.</li>
<li>Atualize o treinamento de integração com cultura da qualidade e ética, e a pauta da análise crítica com todas as entradas.</li>
<li>Faça uma auditoria interna e uma análise crítica já no formato novo antes da auditoria de transição.</li>
</ol>
<h3>Para o auditor interno: o que perguntar nos pontos novos</h3>
<ul>
<li>5.1.1: como a direção promove a cultura da qualidade e o comportamento ético, e onde está a evidência?</li>
<li>6.1.2 e 6.1.3: cada risco relevante tem ação e verificação de eficácia? As oportunidades têm plano próprio?</li>
<li>6.3: na última mudança relevante, como foi monitorada a eficácia e analisado o resultado?</li>
<li>7.3: o funcionário entrevistado sabe o que fazer ao encontrar um problema e por que não deve escondê-lo?</li>
<li>9.3.2: a ata da análise crítica cobre todas as entradas, inclusive mudanças nas necessidades das partes interessadas?</li>
</ul>
<p>Para medir onde o seu sistema está, use o diagnóstico gratuito de transição em <a href="/transicao-iso-9001-2026">anderstech.net/transicao-iso-9001-2026</a>. O guia completo está em <a href="/iso-9001-2026">anderstech.net/iso-9001-2026</a>.</p>
<p><small>Fontes: ISO, página oficial da ISO 9001:2026 (iso.org/standard/88464.html), e Global ACI, documento de transição TECH-3-TR 2029-09-30 (M), versão 1.1, de 04/09/2026. Resumo próprio, não substitui a leitura da norma.</small></p>'
  FROM ead_modules m JOIN ead_courses c ON c.id = m.course_id
 WHERE c.slug IN ('iso-9001-2015-interpretacao', 'auditor-interno-iso-9001')
   AND m.titulo = 'ISO 9001:2026: o que muda e como fazer a transição'
   AND NOT EXISTS (SELECT 1 FROM ead_lessons l WHERE l.module_id = m.id AND l.slug = 'iso-9001-2026-transicao');

UPDATE ead_courses
   SET descricao = descricao || ' Inclui módulo sobre a ISO 9001:2026, publicada em 16/09/2026, e a transição até 30/09/2029.'
 WHERE slug IN ('iso-9001-2015-interpretacao', 'auditor-interno-iso-9001')
   AND descricao NOT LIKE '%ISO 9001:2026%';
