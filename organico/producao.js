// ── Produção contínua com LLM (liga com ANTHROPIC_API_KEY + PRODUCAO_ATIVA=true) ─
// Lê o mapa de buscas, escolhe as próximas consultas sem página, monta a célula
// (consulta + fatos verificados + páginas para linkar), gera no template certo,
// passa no portão e enfileira na onda semanal. Reprovada vai para revisão.
//
// Modelo padrão claude-opus-5-5 (LLM_MODEL troca), esforço médio (LLM_EFFORT),
// saída estruturada por JSON Schema, prompt de sistema fixo com cache e
// fallback no servidor quando o modelo recusa.

import { CLUSTERS } from './taxonomia.js';
import { REQUISITOS, slugRequisito } from './normas.js';
import { portao, tokens } from './paginas.js';

export const producaoAtiva = () => !!process.env.ANTHROPIC_API_KEY && process.env.PRODUCAO_ATIVA === 'true';

const F = {
  iso: { nome: 'ISO 9001:2026 — página oficial (iso.org)', url: 'https://www.iso.org/standard/88464.html', data: '2026-09-16' },
  aci: { nome: 'Global ACI — TECH-3-TR v1.1 (transição ISO 9001:2026)', url: 'https://sys.global-aci.org/uploads/documents/TECH-3-TR_2029-09-30_(M)_ISO_9001_2026_Transition_v1_12.pdf', data: '2026-09-04' },
  survey: { nome: 'ISO Survey 2025, via Global ACI', url: 'https://global-aci.org/en/news/iso-survey-2025-trusted-data-for-a-global-view-of-accredited-certification/', data: '2026-10-12' },
  siac: { nome: 'SiAC / PBQP-H — Ministério das Cidades', url: 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/', data: '2026-09-20' },
  preco: { nome: 'Tabela de preços da Anders Tech (/contratar)', url: 'https://anderstech.net/contratar', data: '2026-11-18' },
};

// Fatos verificados. O modelo só pode usar número, data ou prazo que estiver aqui.
export function fatos(extraPbqph = []) {
  return [
    { f: 'A ISO publicou a ISO 9001:2026 (6ª edição, 36 páginas) em 16/09/2026; ela substitui a ISO 9001:2015 e a emenda de 2024.', fonte: 'iso' },
    { f: 'O período de transição é de 3 anos: auditoria de transição e certificado 2026 até 30/09/2029; depois disso, certificados 2015 perdem a validade.', fonte: 'aci' },
    { f: 'A partir de 31/03/2028, certificações iniciais só pela ISO 9001:2026.', fonte: 'aci' },
    { f: 'Organismos de acreditação prontos até 31/03/2027; decisões de acreditação das certificadoras até 30/09/2027.', fonte: 'aci' },
    { f: 'A auditoria de transição pode ser feita em vigilância, recertificação ou auditoria especial, e pode ser remota.', fonte: 'aci' },
    { f: 'Mudanças 2026: 5.1.1 cultura da qualidade e comportamento ético; 5.2.1 política ligada ao contexto e à direção estratégica; 6.1 dividido em 6.1.1, 6.1.2 e 6.1.3; 6.3 mudanças com monitoramento da eficácia, comunicação e análise dos resultados; 7.3 conscientização inclui cultura e ética; 9.3.2 entradas obrigatórias e nova entrada sobre mudanças nas necessidades das partes interessadas; Anexo A reescrito, Anexo B removido; tema clima mantido.', fonte: 'aci' },
    { f: 'Em 31/12/2025 havia 1.611.729 certificados ISO 9001 válidos no mundo.', fonte: 'survey' },
    { f: 'Consultoria da Anders Tech: R$ 180 por hora; implantação de ISO 9001 ou PBQP-H com 120 h de base; acréscimos de 0 a 15% por porte, 0 a 15% por distância e 20% quando a empresa projeta o que vende; atendimento presencial a até 300 km de Passo Fundo.', fonte: 'preco' },
    ...extraPbqph.map(f => ({ f, fonte: 'siac' })),
  ];
}

const SISTEMA = `Você escreve páginas de referência em português do Brasil para o site da Anders Tech, consultoria de ISO 9001 e PBQP-H de Passo Fundo/RS, em nome de Daniel Anders (engenheiro eletricista, consultor desde 2004). O leitor é dono, diretor ou responsável pela qualidade de indústria ou construtora, que busca no Google uma resposta prática.

Regras, sem exceção:
1. A resposta direta (campo "resposta") tem entre 40 e 60 palavras e responde a consulta já nas duas primeiras frases, usando os termos da consulta.
2. Número, data, prazo, artigo de lei ou de norma só se estiver em "fatos". Nada de caso, cliente, depoimento ou estatística inventados. Se os fatos não bastam para responder bem, devolva "recusar": true com o motivo.
3. Nunca copie texto de norma ISO ou ABNT: explique com palavras próprias.
4. Toda página traz um elemento prático próprio que o leitor não acha nos primeiros resultados: um exemplo de situação real de indústria ou construtora, um checklist, um passo a passo ou uma tabela de decisão. Descreva qual é em "valor_proprio".
5. "titulo" tem no máximo 60 caracteres e começa pelos termos da consulta. "descricao" tem de 70 a 155 caracteres, com benefício e chamada para ação.
6. De 3 a 6 seções. Use "texto" para parágrafo curto e "lista" para itens; deixe vazio o que não usar.
7. FAQ com 3 a 5 perguntas reais, preferindo as de "perguntas".
8. Tamanho guiado pela intenção: satélite de 500 a 1.400 palavras no total; modelo de 300 a 900; glossário de 200 a 600.
9. "fontes_usadas" lista os índices dos fatos usados.
10. Vocabulário de quem compra (cliente exige, auditoria, certificadora, retrabalho), sem jargão de marketing e sem promessa de resultado.`;

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['recusar', 'motivo_recusa', 'titulo', 'descricao', 'h1', 'resposta', 'secoes', 'faq', 'valor_proprio', 'fontes_usadas'],
  properties: {
    recusar: { type: 'boolean' }, motivo_recusa: { type: 'string' },
    titulo: { type: 'string' }, descricao: { type: 'string' }, h1: { type: 'string' }, resposta: { type: 'string' },
    secoes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['titulo', 'texto', 'lista'], properties: { titulo: { type: 'string' }, texto: { type: 'string' }, lista: { type: 'array', items: { type: 'string' } } } } },
    faq: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['p', 'r'], properties: { p: { type: 'string' }, r: { type: 'string' } } } },
    valor_proprio: { type: 'string' },
    fontes_usadas: { type: 'array', items: { type: 'integer' } },
  },
};

const PREFIXO = { satelite: 'guia', modelo: 'modelo', comparativo: 'comparativo', glossario: 'termo', setor: 'setor', norma: 'guia', servico: 'guia', curso: 'guia' };
export function slugDaConsulta(tipo, consulta) {
  const base = String(consulta).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  return `${PREFIXO[tipo] || 'guia'}/${base}`;
}

// SDK carregado só quando a produção roda: não pesa no boot do site.
let cliente = null, Anthropic = null;
async function claude() {
  if (!cliente) { Anthropic = (await import('@anthropic-ai/sdk')).default; cliente = new Anthropic(); }
  return cliente;
}

/** Gera uma página para a consulta. Devolve { pagina } ou { revisao, motivo }. */
export async function gerarPagina({ consulta, cluster, tipo, isca, perguntas = [], fatosLista }) {
  const c = CLUSTERS[cluster] || CLUSTERS['iso-9001'];
  const req = REQUISITOS.find(r => tokens(consulta).some(t => tokens(r.titulo).includes(t)));
  const celula = {
    consulta, tipo_pagina: tipo, cluster: c.nome, isca,
    fatos: fatosLista.map((x, i) => ({ i, fato: x.f })),
    perguntas: perguntas.slice(0, 8),
    paginas_para_linkar: [c.pilar, c.comercial, ...(req ? ['/norma-iso-9001/' + slugRequisito(req.n)] : [])],
  };
  const resp = await (await claude()).beta.messages.create({
    model: process.env.LLM_MODEL || 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: SISTEMA, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: process.env.LLM_EFFORT || 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify(celula) }],
  });
  if (resp.stop_reason === 'refusal') return { revisao: true, motivo: 'modelo recusou' };
  if (resp.stop_reason === 'max_tokens') return { revisao: true, motivo: 'resposta truncada' };
  const texto = resp.content.filter(b => b.type === 'text').map(b => b.text).join('');
  let j;
  try { j = JSON.parse(texto); } catch { return { revisao: true, motivo: 'JSON inválido' }; }
  if (j.recusar) return { revisao: true, motivo: 'faltam fatos: ' + j.motivo_recusa };
  const fontes = [...new Set((j.fontes_usadas || []).map(i => fatosLista[i] && fatosLista[i].fonte).filter(Boolean))].map(k => F[k]);
  return {
    pagina: {
      slug: slugDaConsulta(tipo, consulta), tipo: tipo === 'servico' || tipo === 'curso' || tipo === 'norma' ? 'satelite' : tipo,
      cluster, consulta, titulo: j.titulo, descricao: j.descricao, h1: j.h1, resposta: j.resposta,
      corpo: { secoes: j.secoes.map(s => ({ titulo: s.titulo, ...(s.texto ? { texto: s.texto } : {}), ...(s.lista && s.lista.length ? { lista: s.lista } : {}) })) },
      faq: j.faq, fontes, valor_proprio: j.valor_proprio, isca, origem: 'llm',
    },
    uso: resp.usage,
  };
}

/** Lote diário. Portão parcial (sem links, que só existem no conjunto). */
export async function produzirLote(sql, { tamanho = parseInt(process.env.PRODUCAO_LOTE, 10) || 50, fatosLista } = {}) {
  if (!sql || !producaoAtiva()) return { geradas: 0, motivo: 'desligada' };
  const pausados = (await sql`SELECT alvo FROM seo_fila WHERE tipo = 'pausa_tipo' AND status = 'aberta'`).map(r => r.alvo);
  const fila = await sql`
    SELECT * FROM seo_consultas
     WHERE status = 'nova' AND tipo_pagina IN ('satelite', 'modelo', 'comparativo', 'glossario')
       AND NOT (tipo_pagina = ANY(${pausados}))
     ORDER BY prioridade DESC, id LIMIT ${tamanho}`;
  let geradas = 0, revisao = 0;
  for (const q of fila) {
    try {
      const vizinhas = (await sql`SELECT consulta FROM seo_consultas WHERE cluster = ${q.cluster} AND id <> ${q.id} AND consulta ILIKE ${'%' + tokens(q.consulta)[0] + '%'} LIMIT 8`).map(r => r.consulta);
      const r = await gerarPagina({ consulta: q.consulta, cluster: q.cluster, tipo: q.tipo_pagina, isca: q.isca, perguntas: vizinhas, fatosLista });
      if (!r.pagina) {
        await sql`UPDATE seo_consultas SET status = 'revisao', atualizado_em = NOW() WHERE id = ${q.id}`;
        await sql`INSERT INTO seo_fila (tipo, alvo, motivo) VALUES ('revisao_conteudo', ${q.consulta}, ${r.motivo}) ON CONFLICT DO NOTHING`;
        revisao++; continue;
      }
      const p = r.pagina;
      const g = portao(p, { saida: 3, entrada: 3, maxSim: 0 });
      await sql`
        INSERT INTO seo_paginas (slug, tipo, cluster, consulta, titulo, descricao, h1, resposta, corpo, faq, fontes, valor_proprio, isca, origem, status, qualidade)
        VALUES (${p.slug}, ${p.tipo}, ${p.cluster}, ${p.consulta}, ${p.titulo}, ${p.descricao}, ${p.h1}, ${p.resposta}, ${JSON.stringify(p.corpo)}::jsonb,
                ${JSON.stringify(p.faq)}::jsonb, ${JSON.stringify(p.fontes)}::jsonb, ${p.valor_proprio}, ${p.isca}, 'llm', ${g.aprovada ? 'aprovada' : 'revisao'}, ${JSON.stringify(g)}::jsonb)
        ON CONFLICT (slug) DO NOTHING`;
      await sql`UPDATE seo_consultas SET status = ${g.aprovada ? 'com_pagina' : 'revisao'}, pagina_slug = ${p.slug}, atualizado_em = NOW() WHERE id = ${q.id}`;
      if (g.aprovada) geradas++; else revisao++;
    } catch (err) {
      console.error('[producao] consulta', q.consulta, err.message);
      if (Anthropic && err instanceof Anthropic.RateLimitError) break;
    }
  }
  return { geradas, revisao };
}
