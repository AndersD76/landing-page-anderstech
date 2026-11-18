// ── Metas e regras de corte da mídia paga ────────────────────────────────────
// Escritas ANTES do primeiro real gasto (aquisicao/plano.md), para a decisão de
// pausar ou escalar não ser tomada no calor do resultado. Os números são
// ESTIMATIVA até o Anders validar (TODO-VALIDAR em aquisicao/LANCAMENTO.md);
// mudar aqui muda o painel e o relatório automático juntos.

export const METAS = {
  // Meta de 90 dias por mês (proposta no plano, validar).
  contratos_consultoria_mes: 1,
  servicos_menores_mes: 2,
  vendas_ead_mes: 20,
  leads_qualificados_mes: 10,
  // Teto econômico (payback ≤ 3 meses), ver plano.md §2.
  cpl_max_consultoria: 300,
  cac_max_consultoria: 3000,
  cpa_max_ead: 120,
  // Tempo de primeira resposta ao lead (minutos, horário comercial).
  primeira_resposta_min: 60,
};

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Decide o que fazer com uma campanha/grupo, dado o acumulado desde o início.
 * Entrada: { dia (D desde o início), custo, impressoes, cliques, leads, vendas, tipo }
 *   tipo: 'consultoria' | 'ead'
 * Saída: { acao: 'pausar'|'ajustar'|'manter'|'escalar', motivo, cpl, ctr }
 * Regras (plano.md §6):
 *   D3  — só higiene: CTR < 1% com ≥ 1.000 impressões → ajustar anúncio/termo;
 *         gasto ≥ 2× CPL máx sem lead → pausar o grupo.
 *   D7  — CPL > 1,5× o máximo → pausar; CPL ≤ máx com ≥ 3 leads → manter;
 *         ≥ 40 cliques sem nenhum lead → pausar (problema de página/oferta).
 *   D14 — CPL ≤ 0,7× o máximo com ≥ 5 leads → escalar 20–30% da verba;
 *         CPL entre máx e 1,5× máx → ajustar (negativas, lances, página).
 */
export function decidir({ dia, custo = 0, impressoes = 0, cliques = 0, leads = 0, vendas = 0, tipo = 'consultoria' }) {
  const max = tipo === 'ead' ? METAS.cpa_max_ead : METAS.cpl_max_consultoria;
  const conv = tipo === 'ead' ? vendas : leads;
  const cpl = conv > 0 ? r2(custo / conv) : null;
  const ctr = impressoes > 0 ? r2((cliques / impressoes) * 100) : null;
  const base = { cpl, ctr };

  if (conv === 0 && custo >= 2 * max) {
    return { ...base, acao: 'pausar', motivo: `R$ ${r2(custo)} gastos sem conversão (limite: 2× o máximo de R$ ${max})` };
  }
  if (dia >= 7 && conv === 0 && cliques >= 40) {
    return { ...base, acao: 'pausar', motivo: `${cliques} cliques sem conversão: o problema é a página ou a oferta, não o lance` };
  }
  if (dia >= 7 && cpl !== null && cpl > 1.5 * max) {
    return { ...base, acao: 'pausar', motivo: `custo por conversão R$ ${cpl} acima de 1,5× o máximo (R$ ${max})` };
  }
  if (dia >= 14 && cpl !== null && cpl <= 0.7 * max && conv >= 5) {
    return { ...base, acao: 'escalar', motivo: `custo por conversão R$ ${cpl} com ${conv} conversões: aumentar a verba em 20–30%` };
  }
  if (dia >= 14 && cpl !== null && cpl > max) {
    return { ...base, acao: 'ajustar', motivo: `custo por conversão R$ ${cpl} acima do máximo: revisar negativas, lances e página` };
  }
  if (ctr !== null && impressoes >= 1000 && ctr < 1) {
    return { ...base, acao: 'ajustar', motivo: `CTR de ${ctr}% com ${impressoes} impressões: anúncio ou termo desalinhado da busca` };
  }
  return { ...base, acao: 'manter', motivo: conv ? `custo por conversão R$ ${cpl} dentro do limite` : 'ainda sem volume para decidir' };
}

/** Relatório em Markdown para D3, D7 e D14 a partir das linhas do painel. */
export function relatorioMarkdown({ dia, geradoEm, campanhas = [], canais = [], primeiraRespostaMin = null }) {
  const linhas = [];
  linhas.push(`# Relatório de mídia — D${dia}`, '', `Gerado em ${geradoEm}. Regras em growth/regras.js (escritas antes do gasto).`, '');
  linhas.push('## Por canal', '', '| Canal | Leads | Vendas | Receita (R$) | Custo (R$) | CPL (R$) | CAC (R$) |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const c of canais) {
    linhas.push(`| ${c.canal} | ${c.leads} | ${c.vendas} | ${r2(c.receita)} | ${r2(c.custo)} | ${c.leads ? r2(c.custo / c.leads) : '—'} | ${c.vendas ? r2(c.custo / c.vendas) : '—'} |`);
  }
  linhas.push('', '## Campanhas: o que fazer', '');
  const grupos = { pausar: [], ajustar: [], escalar: [], manter: [] };
  for (const c of campanhas) {
    const d = decidir({ ...c, dia });
    grupos[d.acao].push(`- **${c.canal} · ${c.campanha || '(sem nome)'}** — ${d.motivo}`);
  }
  for (const [acao, itens] of Object.entries(grupos)) {
    linhas.push(`### ${acao[0].toUpperCase() + acao.slice(1)}`, '', ...(itens.length ? itens : ['- nada']), '');
  }
  const verba = grupos.pausar.length && grupos.escalar.length
    ? 'Mover a verba das campanhas pausadas para as marcadas como "escalar".'
    : grupos.pausar.length
      ? 'Verba das pausadas fica parada até a página/oferta ser revista — não redistribuir no escuro.'
      : 'Sem mudança de verba.';
  linhas.push('## Verba', '', verba, '');
  linhas.push('## Resposta ao lead', '', primeiraRespostaMin == null
    ? 'Sem lead respondido no período (a resposta conta quando o status sai de "novo" no /admin).'
    : `Mediana da primeira resposta: ${Math.round(primeiraRespostaMin)} min (meta: ${METAS.primeira_resposta_min} min).`, '');
  return linhas.join('\n');
}
