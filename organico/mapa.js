// ── Mapa de buscas (≥ 5.000 consultas) ──────────────────────────────────────
// Três fontes, gravadas em seo_consultas:
//   1. combinações (cabeça × modificador, requisito × pergunta, tema × setor,
//      PBQP-H × município com dado próprio) — volume marcado como estimativa;
//   2. autocomplete do Google (job em segundo plano, devagar);
//   3. consultas reais do Search Console (quando a API estiver ligada).
// Cada consulta recebe intenção, cluster, tipo de página, isca e prioridade.

import { REQUISITOS } from './normas.js';
import { CLUSTERS } from './taxonomia.js';

export const CABECAS = {
  'iso-9001-2026': ['iso 9001 2026', 'transição iso 9001', 'nova iso 9001', 'iso 9001 2026 mudanças', 'iso 9001 2015 para 2026', 'auditoria de transição iso 9001'],
  'iso-9001': ['iso 9001', 'certificação iso 9001', 'consultoria iso 9001', 'implantação iso 9001', 'sistema de gestão da qualidade', 'manual da qualidade', 'iso 9001 pequena empresa'],
  'auditoria': ['auditoria interna iso 9001', 'auditor interno iso 9001', 'auditoria de certificação iso 9001', 'auditoria de manutenção iso 9001', 'programa de auditoria interna'],
  'riscos': ['riscos e oportunidades iso 9001', 'gestão de riscos iso 9001', 'matriz de riscos iso 9001', 'mentalidade de risco'],
  'nao-conformidade': ['não conformidade iso 9001', 'ação corretiva iso 9001', 'análise de causa raiz', 'relatório de não conformidade', 'produto não conforme'],
  'analise-critica': ['análise crítica pela direção', 'ata de análise crítica', 'entradas da análise crítica'],
  'pbqp-h': ['pbqp-h', 'certificação pbqp-h', 'siac pbqp-h', 'pbqp-h nível a', 'pbqp-h nível b', 'consultoria pbqp-h', 'pbqp-h construtora'],
  'custo': ['quanto custa iso 9001', 'preço certificação iso 9001', 'custo consultoria iso 9001', 'quanto custa pbqp-h', 'prazo certificação iso 9001'],
  'processos': ['mapeamento de processos', 'indicadores de desempenho', '5s', 'kpi de qualidade', 'política da qualidade', 'objetivos da qualidade'],
};

// Modificadores: o que o ICP escreve na busca. [modificador, intenção, tipo de página]
const MODS = [
  ['o que é', 'informacional', 'satelite'], ['como fazer', 'informacional', 'satelite'], ['passo a passo', 'informacional', 'satelite'],
  ['exemplo', 'informacional', 'modelo'], ['modelo', 'informacional', 'modelo'], ['planilha', 'informacional', 'modelo'], ['checklist', 'informacional', 'modelo'],
  ['pdf', 'informacional', 'modelo'], ['grátis', 'informacional', 'modelo'], ['quanto custa', 'comercial', 'satelite'], ['preço', 'comercial', 'satelite'],
  ['prazo', 'informacional', 'satelite'], ['obrigatório', 'informacional', 'satelite'], ['multa', 'informacional', 'satelite'], ['quando', 'informacional', 'satelite'],
  ['qual', 'informacional', 'satelite'], ['vs', 'comparativo', 'comparativo'], ['melhor', 'comercial', 'comparativo'], ['empresa', 'transacional', 'servico'],
  ['consultoria', 'transacional', 'servico'], ['curso', 'transacional', 'curso'], ['requisitos', 'informacional', 'satelite'], ['documentos obrigatórios', 'informacional', 'satelite'],
  ['perguntas de auditoria', 'informacional', 'modelo'], ['erros comuns', 'informacional', 'satelite'],
];

export const SETORES = ['metalúrgica', 'indústria de alimentos', 'construtora', 'cooperativa agrícola', 'indústria moveleira', 'indústria de plásticos', 'transportadora',
  'indústria de máquinas agrícolas', 'autopeças', 'empresa de engenharia', 'laboratório', 'distribuidora', 'gráfica', 'indústria química', 'indústria têxtil',
  'empresa de software', 'prestadora de serviços', 'hospital', 'escola', 'empresa de manutenção industrial'];
const PORTES = ['pequena empresa', 'média empresa', 'microempresa', 'empresa familiar'];
const PERGUNTAS_REQ = ['o que é', 'o que pede', 'exemplo', 'evidências', 'como atender', 'auditoria', 'mudou na 2026'];

export function classificar(consulta) {
  const c = consulta.toLowerCase();
  let cluster = 'iso-9001';
  if (/2026|transi[cç][aã]o|nova iso/.test(c)) cluster = 'iso-9001-2026';
  else if (/pbqp|siac/.test(c)) cluster = 'pbqp-h';
  else if (/auditor/.test(c)) cluster = 'auditoria';
  else if (/risco|oportunidade/.test(c)) cluster = 'riscos';
  else if (/n[aã]o conform|corretiva|causa raiz/.test(c)) cluster = 'nao-conformidade';
  else if (/an[aá]lise cr[ií]tica/.test(c)) cluster = 'analise-critica';
  else if (/quanto custa|pre[cç]o|custo|valor|prazo/.test(c)) cluster = 'custo';
  else if (/processo|indicador|kpi|5s|pol[ií]tica|objetivo/.test(c)) cluster = 'processos';
  else if (/requisito|cl[aá]usula|\b\d{1,2}\.\d/.test(c)) cluster = 'requisitos';
  let intencao = 'informacional', tipo = 'satelite';
  if (/consultoria|empresa de|contratar|perto|em [a-z]+$/.test(c)) { intencao = 'transacional'; tipo = 'servico'; }
  if (/quanto custa|pre[cç]o|valor|or[cç]amento/.test(c)) { intencao = 'comercial'; tipo = 'satelite'; }
  if (/modelo|planilha|checklist|exemplo|pdf|formul[aá]rio/.test(c)) tipo = 'modelo';
  if (/ vs |versus|diferen[cç]a|melhor|alternativa/.test(c)) { intencao = 'comparativo'; tipo = 'comparativo'; }
  if (/\b\d{1,2}\.\d/.test(c) || /requisito/.test(c)) tipo = 'norma';
  if (/curso/.test(c)) { intencao = 'transacional'; tipo = 'curso'; }
  if (/o que [ée] /.test(c) && c.split(' ').length <= 5 && !/iso 9001$/.test(c)) tipo = 'glossario';
  const prioridade = (intencao === 'transacional' ? 40 : intencao === 'comercial' ? 35 : 15) + (cluster === 'iso-9001-2026' ? 25 : 0) + (tipo === 'modelo' ? 10 : 0);
  return { cluster, intencao, tipo_pagina: tipo, isca: (CLUSTERS[cluster] || CLUSTERS['iso-9001']).isca, prioridade };
}

/** Todas as combinações com sentido. `municipios`: [{nome, uf}] com dado próprio. */
export function combinacoes({ municipios = [], termos = [] } = {}) {
  const out = new Set();
  // Glossário: um termo por página (os 83 já publicados e os que vierem).
  for (const t of termos) { const x = String(t).toLowerCase(); out.add(`o que é ${x}`); out.add(`${x} iso 9001`); out.add(`${x} exemplo`); }
  for (const lista of Object.values(CABECAS)) for (const cab of lista) {
    out.add(cab);
    for (const [mod] of MODS) out.add(['o que é', 'como fazer', 'quanto custa', 'qual', 'quando'].includes(mod) ? `${mod} ${cab}` : `${cab} ${mod}`);
    for (const s of SETORES) out.add(`${cab} para ${s}`);
    for (const p of PORTES) out.add(`${cab} ${p}`);
  }
  for (const r of REQUISITOS) {
    out.add(`requisito ${r.n} iso 9001`); out.add(`${r.n} iso 9001`); out.add(`${r.titulo.toLowerCase()} iso 9001`);
    for (const q of PERGUNTAS_REQ) out.add(`${r.titulo.toLowerCase()} iso 9001 ${q}`);
    for (const s of SETORES) out.add(`${r.titulo.toLowerCase()} iso 9001 ${s}`);
  }
  // Modelo × setor (cauda longa de quem procura material pronto para o seu ramo).
  for (const cl of ['iso-9001', 'auditoria', 'riscos', 'nao-conformidade', 'analise-critica']) {
    for (const cab of CABECAS[cl]) for (const s of SETORES) for (const m of ['modelo de', 'checklist de', 'exemplo de']) out.add(`${m} ${cab} para ${s}`);
  }
  for (const m of municipios) {
    out.add(`construtoras com pbqp-h em ${m.nome.toLowerCase()}`);
    out.add(`pbqp-h ${m.nome.toLowerCase()} ${m.uf.toLowerCase()}`);
  }
  return [...out].map(c => c.replace(/\s+/g, ' ').trim()).filter(c => c.length >= 4 && c.length <= 120);
}

export async function gravarConsultas(sql, consultas, fonte) {
  let novas = 0;
  for (let i = 0; i < consultas.length; i += 200) {
    const lote = consultas.slice(i, i + 200).map(c => ({ c, ...classificar(c) }));
    const r = await sql`
      INSERT INTO seo_consultas (consulta, intencao, cluster, tipo_pagina, isca, prioridade, fonte, volume_fonte)
      SELECT x.c, x.intencao, x.cluster, x.tipo_pagina, x.isca, x.prioridade, ${fonte}, 'estimativa'
        FROM jsonb_to_recordset(${JSON.stringify(lote)}::jsonb) AS x(c TEXT, intencao TEXT, cluster TEXT, tipo_pagina TEXT, isca TEXT, prioridade INT)
      ON CONFLICT (consulta) DO NOTHING RETURNING id`;
    novas += r.length;
  }
  return novas;
}

// Autocomplete do Google: devagar (1 requisição a cada 3 s) para não abusar.
const LETRAS = 'abcdefghijlmnopqrstuv'.split('');
export function sementesAutocomplete() {
  const s = [];
  for (const lista of Object.values(CABECAS)) for (const cab of lista) {
    s.push(cab);
    for (const l of LETRAS) s.push(`${cab} ${l}`);
    for (const q of ['como', 'o que é', 'quanto custa', 'qual', 'quando']) s.push(`${q} ${cab}`);
  }
  return s;
}

export async function autocomplete(consulta, { fetchImpl = fetch } = {}) {
  const r = await fetchImpl(`https://suggestqueries.google.com/complete/search?client=firefox&hl=pt-BR&gl=br&q=${encodeURIComponent(consulta)}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) return [];
  const j = JSON.parse(Buffer.from(await r.arrayBuffer()).toString('latin1'));
  return Array.isArray(j[1]) ? j[1].map(String) : [];
}

// Um pedaço da expansão por vez (o job chama de novo até acabar). O progresso
// fica no próprio banco: semente já consultada vira linha com fonte 'semente-ac'.
export async function expandirAutocomplete(sql, { maximo = 40, pausaMs = 3000 } = {}) {
  const feitas = new Set((await sql`SELECT consulta FROM seo_consultas WHERE fonte = 'semente-ac'`).map(r => r.consulta));
  const pendentes = sementesAutocomplete().filter(s => !feitas.has('ac:' + s)).slice(0, maximo);
  let novas = 0;
  for (const s of pendentes) {
    try { novas += await gravarConsultas(sql, (await autocomplete(s)).filter(x => /iso|pbqp|qualidade|auditori|5s|processo|indicador|siac|n[aã]o conform|risco|an[aá]lise cr/i.test(x)), 'autocomplete'); }
    catch { /* rede: tenta na próxima rodada */ }
    await sql`INSERT INTO seo_consultas (consulta, fonte, status) VALUES (${'ac:' + s}, 'semente-ac', 'descartada') ON CONFLICT (consulta) DO NOTHING`;
    await new Promise(r => setTimeout(r, pausaMs));
  }
  return { consultadas: pendentes.length, novas };
}
