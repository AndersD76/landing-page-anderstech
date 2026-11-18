// ── Iscas: uma por cluster, em toda página ───────────────────────────────────
// Cada isca: parte do resultado na tela sem cadastro (prévia), resultado completo
// por e-mail (PDF gerado aqui), URL própria (/iscas/<id>) e CTA para o produto.
// Opt-in de marketing SEPARADO e DESMARCADO: só quem marca entra na sequência
// de 5 e-mails do cluster (e só com REGUA_ATIVA=true).

import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CLUSTERS } from './taxonomia.js';
import { REQUISITOS } from './normas.js';

const FONTES = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'fonts');
const NAVY = '#0b1730', RED = '#FE0000', CINZA = '#46577a';

// Itens de cada isca. Conteúdo próprio, sem reproduzir texto da norma.
const AUD = REQUISITOS.map(r => [`${r.n} ${r.titulo}`, r.evidencias]);

export const ISCAS = {
  'diagnostico-transicao-2026': { titulo: 'Diagnóstico de transição ISO 9001:2026', cluster: 'iso-9001-2026', url: '/transicao-iso-9001-2026', tipo: 'ferramenta', resumo: '10 perguntas, resultado na hora, com o que falta em cada requisito que mudou.' },
  'checklist-iso-9001': { titulo: 'Checklist ISO 9001: 47 pontos', cluster: 'iso-9001', url: '/checklist-iso-9001', tipo: 'ferramenta', resumo: 'Avalie o sistema requisito a requisito e veja onde agir primeiro.' },
  'calculadora-preco': { titulo: 'Calculadora de preço da consultoria', cluster: 'custo', url: '/contratar', tipo: 'ferramenta', resumo: 'Preço da consultoria na hora, pelo porte e pela cidade da empresa.' },
  'calculadora-roi': { titulo: 'Calculadora de retorno da certificação', cluster: 'custo', url: '/calculadora-roi-certificacao', tipo: 'ferramenta', resumo: 'Quanto a certificação devolve em retrabalho evitado e vendas.' },
  'checklist-auditoria-interna': { titulo: 'Checklist de auditoria interna ISO 9001', cluster: 'auditoria', tipo: 'pdf',
    resumo: 'O que pedir como evidência em cada requisito, para usar na próxima auditoria interna.',
    secoes: AUD.map(([t, itens]) => ({ titulo: t, itens: itens.map(i => '[ ] ' + i) })) },
  'modelo-ata-analise-critica-2026': { titulo: 'Modelo de ata de análise crítica (ISO 9001:2026)', cluster: 'analise-critica', tipo: 'pdf',
    resumo: 'Pauta completa com as entradas obrigatórias da versão 2026, pronta para preencher.',
    secoes: [
      { titulo: 'Identificação', itens: ['Data, participantes e período analisado', 'Situação das ações da análise crítica anterior'] },
      { titulo: 'Entradas (deve incluir)', itens: ['Mudanças nas questões externas e internas', 'Mudanças nas necessidades e expectativas das partes interessadas (nova na 2026)', 'Satisfação do cliente e retorno das partes interessadas', 'Atendimento aos objetivos da qualidade', 'Desempenho dos processos e conformidade dos produtos e serviços', 'Não conformidades e ações corretivas', 'Resultados de monitoramento e medição', 'Resultados de auditorias', 'Desempenho de provedores externos', 'Suficiência de recursos', 'Eficácia das ações para riscos e oportunidades', 'Oportunidades de melhoria'] },
      { titulo: 'Saídas (decisões)', itens: ['Oportunidades de melhoria: o quê, quem, até quando', 'Mudanças necessárias no sistema', 'Recursos aprovados'] },
    ] },
  'planilha-riscos-oportunidades': { titulo: 'Modelo de registro de riscos e oportunidades (6.1.1 a 6.1.3)', cluster: 'riscos', tipo: 'pdf',
    resumo: 'Registro separado de riscos e de oportunidades, como a versão 2026 passou a organizar.',
    secoes: [
      { titulo: '6.1.1 Levantamento', itens: ['Origem: questão do contexto (4.1) ou requisito de parte interessada (4.2)', 'Descrição do risco ou da oportunidade', 'Processo afetado', 'Probabilidade (1 a 3) × impacto (1 a 3) = prioridade'] },
      { titulo: '6.1.2 Ações para riscos', itens: ['Ação proporcional à prioridade', 'Responsável e prazo', 'Como será verificada a eficácia', 'Resultado da verificação'] },
      { titulo: '6.1.3 Ações para oportunidades', itens: ['Benefício esperado', 'Ação, responsável e prazo', 'Indicador que mostra o ganho', 'Resultado'] },
    ] },
  'checklist-renovacao-pbqp-h': { titulo: 'Checklist de renovação do PBQP-H', cluster: 'pbqp-h', tipo: 'pdf',
    resumo: 'O que conferir antes da auditoria de manutenção ou recertificação do SiAC.',
    secoes: [
      { titulo: 'Documentação', itens: ['Manual e procedimentos na revisão vigente', 'Lista de serviços controlados e de materiais controlados atualizada', 'Plano da qualidade de cada obra em andamento'] },
      { titulo: 'Obra', itens: ['Fichas de verificação de serviço preenchidas no canteiro', 'Inspeção de recebimento de materiais controlados', 'Controle de equipamentos de medição da obra', 'Tratamento de não conformidades de obra registrado'] },
      { titulo: 'Gestão', itens: ['Auditoria interna realizada no ciclo', 'Análise crítica pela direção com indicadores', 'Avaliação de fornecedores de materiais e serviços controlados', 'Treinamento das equipes nos serviços controlados'] },
    ] },
  'matriz-transicao-2015-2026': { titulo: 'Matriz de transição ISO 9001 2015 → 2026', cluster: 'requisitos', tipo: 'pdf',
    resumo: 'Os pontos que mudaram na versão 2026, com o que ajustar em cada um.',
    secoes: REQUISITOS.filter(r => r.mudanca2026).map(r => ({ titulo: `${r.n} ${r.titulo}`, itens: [r.mudanca2026, 'Ajuste: ' + r.evidencias[0]] })) },
  'roteiro-conscientizacao-7-3': { titulo: 'Roteiro de integração e conscientização (7.3)', cluster: 'requisitos', tipo: 'pdf',
    resumo: 'Roteiro de 30 minutos que cobre política, objetivos, cultura da qualidade e ética.',
    secoes: [
      { titulo: 'Abertura (5 min)', itens: ['Por que a empresa tem um sistema da qualidade', 'Quem é o cliente e o que ele exige'] },
      { titulo: 'Política e objetivos (10 min)', itens: ['A política em linguagem do dia a dia', 'Os objetivos da área do funcionário e como ele contribui'] },
      { titulo: 'Cultura da qualidade e ética (10 min)', itens: ['O que fazer ao encontrar um problema', 'Por que esconder defeito custa mais caro', 'Canal para relatar problema sem punição'] },
      { titulo: 'Fechamento (5 min)', itens: ['Consequências de não seguir o padrão', 'Registro de presença e verificação de entendimento'] },
    ] },
  'modelo-politica-qualidade': { titulo: 'Modelo de política da qualidade', cluster: 'processos', tipo: 'pdf',
    resumo: 'Estrutura para escrever uma política ligada ao contexto e à estratégia da empresa.',
    secoes: [
      { titulo: 'Estrutura', itens: ['Propósito: o que a empresa entrega e para quem', 'Compromisso com requisitos de cliente e legais', 'Compromisso com melhoria contínua', 'Ligação com a direção estratégica (ex.: crescer em contratos industriais)'] },
      { titulo: 'Teste da boa política', itens: ['Um funcionário consegue explicar em 1 minuto?', 'Cada frase gera ao menos um objetivo mensurável?', 'Ela mudaria se a estratégia mudasse?'] },
    ] },
  'plano-acao-nao-conformidade': { titulo: 'Modelo de tratamento de não conformidade', cluster: 'nao-conformidade', tipo: 'pdf',
    resumo: 'Correção, causa (5 porquês), ação corretiva e verificação de eficácia numa folha.',
    secoes: [
      { titulo: '1. Reação', itens: ['Descrição objetiva do que aconteceu', 'Correção imediata e destino do produto'] },
      { titulo: '2. Causa', itens: ['5 porquês até uma causa que dá para agir', 'Evitar "falha humana" como causa final'] },
      { titulo: '3. Ação corretiva', itens: ['O que muda no processo para não repetir', 'Responsável e prazo'] },
      { titulo: '4. Eficácia', itens: ['Como e quando verificar (não no mesmo dia)', 'Atualizar riscos e documentos se necessário'] },
    ] },
};

export function iscaInfo(id) { return ISCAS[id] ? { id, ...ISCAS[id] } : null; }

// Prévia na tela: metade dos itens; o resto vai no PDF.
export function previa(id) {
  const i = ISCAS[id];
  if (!i || !i.secoes) return [];
  return i.secoes.map((s, k) => ({ titulo: s.titulo, itens: k === 0 ? s.itens : s.itens.slice(0, Math.ceil(s.itens.length / 2)) })).slice(0, Math.max(1, Math.ceil(i.secoes.length / 2)));
}

export function pdfIsca(id) {
  const i = ISCAS[id];
  if (!i || !i.secoes) return Promise.resolve(null);
  return new Promise((ok, falha) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.registerFont('R', join(FONTES, 'Poppins-Regular.ttf'));
    doc.registerFont('B', join(FONTES, 'Poppins-SemiBold.ttf'));
    const partes = [];
    doc.on('data', b => partes.push(b)).on('end', () => ok(Buffer.concat(partes))).on('error', falha);
    doc.rect(0, 0, doc.page.width, 92).fill(NAVY);
    doc.fillColor('#ffffff').font('B').fontSize(17).text(i.titulo, 50, 30, { width: doc.page.width - 100 });
    doc.fillColor('#b9c8e4').font('R').fontSize(9).text('Anders Tech · anderstech.net · consultoria ISO 9001 e PBQP-H', 50, 68);
    doc.moveDown(2.2).fillColor(CINZA).font('R').fontSize(10).text(i.resumo, 50, 112);
    doc.moveDown();
    for (const s of i.secoes) {
      if (doc.y > 720) doc.addPage();
      doc.moveDown(0.6);
      const y = doc.y + 5;
      doc.save().rotate(45, { origin: [56, y] }).rect(52, y - 4, 8, 8).fill(RED).restore();
      doc.fillColor(NAVY).font('B').fontSize(12).text(s.titulo, 70, doc.y);
      doc.font('R').fontSize(10).fillColor('#16233f');
      for (const it of s.itens) { if (doc.y > 760) doc.addPage(); doc.text('•  ' + it, 70, doc.y + 2, { width: doc.page.width - 130 }); }
    }
    doc.moveDown(2).fillColor(CINZA).font('R').fontSize(9)
      .text('Precisa de ajuda para aplicar? O preço da consultoria sai na hora em anderstech.net/contratar. Material gratuito; pode ser compartilhado citando a fonte.', 50, doc.y, { width: doc.page.width - 100 });
    doc.end();
  });
}

// ── Bloco contextual (inline no meio, no fim e barra discreta no celular) ──
function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

export function blocoIsca(id, posicao = 'fim') {
  const i = iscaInfo(id);
  if (!i) return '';
  const href = i.url || `/iscas/${id}`;
  return `<aside class="at-isca" data-isca="${esc(id)}" data-isca-pos="${posicao}" style="border:2px solid #d80a0a;border-radius:8px;padding:18px 20px;margin:28px 0;background:#fff">`
    + `<div style="font-family:var(--ff-mono,monospace);font-size:.72rem;color:#d80a0a;font-weight:700;letter-spacing:.08em">GRÁTIS</div>`
    + `<div style="font-weight:700;color:#0b1730;font-size:1.08rem;margin:4px 0">${esc(i.titulo)}</div>`
    + `<p style="margin:0 0 12px;color:#46577a">${esc(i.resumo)}</p>`
    + `<a href="${esc(href)}" data-isca-cta="${esc(id)}" style="display:inline-block;background:#d80a0a;color:#fff;padding:11px 18px;border-radius:6px;font-weight:700;text-decoration:none">${i.tipo === 'pdf' ? 'Ver e baixar' : 'Usar agora'}</a></aside>`;
}

export function barraIscaCelular(id) {
  const i = iscaInfo(id);
  if (!i) return '';
  return `<a href="${esc(i.url || '/iscas/' + id)}" class="at-isca-barra" data-isca="${esc(id)}" data-isca-pos="barra" style="display:none">${esc(i.titulo)} — grátis →</a>`
    + '<style>@media(max-width:760px){.at-isca-barra{display:block!important;position:fixed;left:0;right:0;bottom:64px;z-index:70;background:#0b1730;color:#fff;text-align:center;padding:9px 12px;font-size:13px;font-weight:600;text-decoration:none;border-top:2px solid #d80a0a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}</style>';
}

// ── Régua do cluster (5 e-mails terminando na oferta) ──
// Só para quem marcou o opt-in de marketing e só com REGUA_ATIVA=true.
export const REGUA_CLUSTER = [
  ['org-1', 1, (c) => `O primeiro passo em ${c.nome.toLowerCase()}`],
  ['org-2', 3, () => 'O erro que mais aparece em auditoria'],
  ['org-3', 6, () => 'Como medir se o ajuste funcionou'],
  ['org-4', 10, () => 'Um exemplo prático, passo a passo'],
  ['org-5', 14, () => 'Quer ajuda para aplicar na sua empresa?'],
];

export async function aoLeadIscaOrganica(sql, { leadId, source, email, nome, optin = false }) {
  if (!sql || !email || !String(source || '').startsWith('isca_') || !optin) return;
  const { reguaAtiva, agendar } = await import('../growth/mensageria.js');
  if (!reguaAtiva()) return;
  const id = String(source).slice(5);
  const isca = ISCAS[id];
  const cluster = CLUSTERS[(isca && isca.cluster) || 'iso-9001'];
  for (const [chave, dias] of REGUA_CLUSTER) {
    await agendar(sql, { tipo: 'regua', chave, refTipo: 'lead', refId: leadId, email, params: { nome, isca: id, cluster: (isca && isca.cluster) || 'iso-9001', pilar: cluster.pilar, comercial: cluster.comercial }, quando: Date.now() + dias * 86400_000 });
  }
}
