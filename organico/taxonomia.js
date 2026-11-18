// ── Taxonomia do orgânico (configuração no código) ───────────────────────────
// Clusters, tipo de página por rota, isca de cada cluster, canais orgânicos
// (inclusive assistentes de IA) e padrão de UTM. Usado pelo injectShared (metas
// at-*), pela telemetria (props obrigatórias dos eventos de isca), pelo painel e
// pela produção contínua.

export const CLUSTERS = {
  'iso-9001-2026': { nome: 'ISO 9001:2026 e transição', pilar: '/iso-9001-2026', comercial: '/contratar?servico=iso-9001', isca: 'diagnostico-transicao-2026' },
  'iso-9001': { nome: 'ISO 9001: implantação e certificação', pilar: '/iso-9001', comercial: '/contratar?servico=iso-9001', isca: 'checklist-iso-9001' },
  'requisitos': { nome: 'Requisitos da ISO 9001 explicados', pilar: '/norma-iso-9001', comercial: '/contratar?servico=manutencao-sgq', isca: 'matriz-transicao-2015-2026' },
  'auditoria': { nome: 'Auditoria interna', pilar: '/quanto-custa-auditoria-interna', comercial: '/contratar?servico=auditoria-interna', isca: 'checklist-auditoria-interna' },
  'riscos': { nome: 'Riscos e oportunidades', pilar: '/norma-iso-9001/6-1', comercial: '/contratar?servico=manutencao-sgq', isca: 'planilha-riscos-oportunidades' },
  'nao-conformidade': { nome: 'Não conformidade e ação corretiva', pilar: '/norma-iso-9001/10-2', comercial: '/contratar?servico=manutencao-sgq', isca: 'plano-acao-nao-conformidade' },
  'analise-critica': { nome: 'Análise crítica pela direção', pilar: '/norma-iso-9001/9-3', comercial: '/contratar?servico=manutencao-sgq', isca: 'modelo-ata-analise-critica-2026' },
  'pbqp-h': { nome: 'PBQP-H e SiAC', pilar: '/pbqp-h', comercial: '/contratar?servico=pbqp-h', isca: 'checklist-renovacao-pbqp-h' },
  'custo': { nome: 'Custo e prazo da certificação', pilar: '/quanto-custa-certificacao-iso', comercial: '/contratar', isca: 'calculadora-preco' },
  'processos': { nome: 'Processos, indicadores e 5S', pilar: '/servicos', comercial: '/contratar?servico=mapeamento-processos', isca: 'modelo-politica-qualidade' },
  'glossario': { nome: 'Glossário da qualidade', pilar: '/glossario', comercial: '/contratar', isca: 'checklist-iso-9001' },
};

// Rota → [tipo de página, cluster, consulta-alvo]. Página do banco traz os
// próprios metadados; esta tabela cobre as páginas estáticas existentes.
const ROTAS = [
  [/^\/$/, 'home', 'iso-9001', 'consultoria iso 9001'],
  [/^\/iso-9001-2026$/, 'pilar', 'iso-9001-2026', 'iso 9001 2026'],
  [/^\/transicao-iso-9001-2026$/, 'ferramenta', 'iso-9001-2026', 'transição iso 9001 2026'],
  [/^\/iso-9001$/, 'servico', 'iso-9001', 'consultoria iso 9001'],
  [/^\/pbqp-h$/, 'servico', 'pbqp-h', 'consultoria pbqp-h'],
  [/^\/contratar$/, 'comercial', 'custo', 'preço consultoria iso 9001'],
  [/^\/quanto-custa-auditoria-interna$/, 'satelite', 'auditoria', 'quanto custa auditoria interna'],
  [/^\/quanto-custa/, 'satelite', 'custo', 'quanto custa certificação iso 9001'],
  [/^\/quanto-tempo/, 'satelite', 'custo', 'quanto tempo para implantar iso 9001'],
  [/^\/consultoria-iso-9001-/, 'regional', 'iso-9001', 'consultoria iso 9001'],
  [/^\/iso-9001-/, 'setor', 'iso-9001', 'iso 9001'],
  [/^\/pbqp-h-/, 'setor', 'pbqp-h', 'pbqp-h construtora'],
  [/^\/pbqp-h\/construtoras/, 'programatica', 'pbqp-h', 'construtoras com pbqp-h'],
  [/^\/pbqp-h\/certificadoras/, 'programatica', 'pbqp-h', 'certificadoras pbqp-h'],
  [/^\/dados\//, 'dados', 'pbqp-h', 'empresas com pbqp-h'],
  [/^\/norma-iso-9001/, 'norma', 'requisitos', 'requisitos iso 9001'],
  [/^\/iscas/, 'isca', 'iso-9001', 'modelo iso 9001'],
  [/^\/glossario/, 'glossario', 'glossario', 'glossário qualidade'],
  [/^\/blog\//, 'satelite', 'iso-9001', 'iso 9001'],
  [/^\/checklist-iso-9001$/, 'modelo', 'iso-9001', 'checklist iso 9001'],
  [/^\/calculadora-roi/, 'ferramenta', 'custo', 'calculadora roi iso 9001'],
  [/^\/servicos$/, 'servico', 'processos', 'consultoria em gestão'],
  [/^\/ead\//, 'curso', 'processos', 'curso iso 9001 online'],
];

export function classificarRota(rota) {
  for (const [re, tipo, cluster, consulta] of ROTAS) if (re.test(rota || '/')) return { tipo, cluster, consulta };
  return { tipo: 'outra', cluster: 'iso-9001', consulta: '' };
}

export function iscaDoCluster(cluster) {
  return (CLUSTERS[cluster] || CLUSTERS['iso-9001']).isca;
}

// Canal orgânico, inclusive respostas de IA (mesma regra de growth/atribuicao.js).
export const DOMINIOS_IA = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai'];
export const DOMINIOS_BUSCA = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'ecosia.', 'search.brave.'];

// Padrão de UTM do projeto (CLAUDE.md, regra 1).
export function utm(link, { origem = 'anderstech', meio, campanha, conteudo }) {
  const sep = link.includes('?') ? '&' : '?';
  return `${link}${sep}utm_source=${encodeURIComponent(origem)}&utm_medium=${encodeURIComponent(meio)}&utm_campaign=${encodeURIComponent(campanha)}${conteudo ? `&utm_content=${encodeURIComponent(conteudo)}` : ''}`;
}

export const EVENTOS_ISCA = ['isca_vista', 'isca_iniciada', 'isca_concluida', 'lead_capturado', 'cta_produto_clicado'];
export const PROPS_OBRIGATORIAS = ['page_type', 'cluster', 'consulta_alvo', 'isca_id'];
