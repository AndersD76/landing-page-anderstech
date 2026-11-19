// ── Rotinas do motor orgânico ────────────────────────────────────────────────
// Diário: mapa (autocomplete), produção (LLM), Search Console/Bing/GA4,
// inspeção, linha de base e alertas. Semanal: onda de publicação, SERP,
// oportunidade/frescor e resumo por e-mail (segunda, 8h). Cada rotina roda uma
// vez por período: a trava é uma linha em seo_anotacoes (chave única), então
// reinício do servidor não repete.

import { combinacoes, gravarConsultas, expandirAutocomplete } from './mapa.js';
import { recarregar, paginasPublicadas, caminho } from './paginas.js';
import { produzirLote, producaoAtiva, fatos } from './producao.js';
import { ingerirGsc, ingerirBing, ingerirGa4, inspecionar, checarSerp, indexNow, enviarSitemapGsc, gscConfigurado } from './fontes.js';
import { gravar as gravarCrawlers, carregarFaixas, errosRecentes } from './crawlers.js';
import { ALVOS_VERIFICADOS, ALVOS_LINK } from './alvos-dados.js';
import { mensagemParceiro } from '../growth/conteudo.js';
import { CLUSTERS, classificarRota, utm } from './taxonomia.js';
import { ISCAS } from './iscas.js';
import { TERMOS } from '../glossario/terms.js';
import { dados as dadosPbqph } from '../pbqph/dados.js';
import { layout, esc } from '../emails.js';
import { EMPRESA } from '../config/empresa.js';

const SITE = 'https://anderstech.net';
const brt = () => new Date(Date.now() - 3 * 3600_000);
const hojeBR = () => brt().toISOString().slice(0, 10);
const semanaBR = () => { const d = brt(); const j = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); return d.getUTCFullYear() + '-S' + Math.ceil(((d - j) / 86400_000 + j.getUTCDay() + 1) / 7); };

async function umaVez(sql, chave, texto = 'rotina') {
  const r = await sql`INSERT INTO seo_anotacoes (tipo, chave, texto) VALUES ('rotina', ${chave}, ${texto}) ON CONFLICT (chave) DO NOTHING RETURNING id`;
  return r.length > 0;
}
export async function anotar(sql, tipo, texto, chave = null) {
  if (!sql) return;
  try { await sql`INSERT INTO seo_anotacoes (tipo, chave, texto) VALUES (${tipo}, ${chave}, ${texto}) ON CONFLICT (chave) DO NOTHING`; } catch { /* ok */ }
}

// ── Fatos de dado próprio do PBQP-H (vão para a produção e para os artigos) ──
export function fatosPbqph() {
  const d = dadosPbqph();
  const porUf = new Map();
  for (const r of d.registros) porUf.set(r.uf, (porUf.get(r.uf) || 0) + 1);
  const rs = d.registros.filter(r => r.uf === 'RS');
  const ranking = [...porUf.entries()].sort((a, b) => b[1] - a[1]);
  return [
    `Pelo SiAC (carga de ${String(d.carregadoEm || '').slice(0, 10)}), ${d.totalVigentes} registros de empresas com PBQP-H vigente no Brasil.`,
    `Estados com mais registros vigentes: ${ranking.slice(0, 5).map(([u, n]) => `${u} ${n}`).join(', ')}.`,
    `No RS são ${rs.length} registros vigentes: ${rs.filter(r => r.nivel === 'A').length} no nível A e ${rs.filter(r => r.nivel === 'B').length} no nível B.`,
  ];
}

// ── Sementes: mapa de buscas, alvos de link, artigos de convidado ──
function mensagemAlvo(a, chave) {
  const link = (cam) => utm(SITE + cam, { origem: 'parceria', meio: 'email', campanha: 'alvos-link', conteudo: chave.slice(0, 40) });
  const ativoUrl = /PBQP/i.test(a.ativo) ? link('/dados/pbqp-h') : /gloss/i.test(a.ativo) ? link('/glossario') : link('/iso-9001-2026');
  const assinatura = '\n\n— Daniel Anders · Anders Tech · (54) 99964-8368\n(Para não receber mais mensagens minhas, é só responder "sair".)';
  if (a.tipo === 'diretorio') {
    return { assunto: 'Texto de cadastro', mensagem: `Anders Tech — consultoria em ISO 9001 e PBQP-H para indústrias e construtoras, com sede em Passo Fundo/RS e atendimento presencial a até 300 km. Preço da consultoria calculado na hora no site, diagnóstico gratuito de transição para a ISO 9001:2026 e panorama público do PBQP-H por cidade. Site: ${link('/')}` };
  }
  if (a.tipo === 'veiculo_regional' || a.tipo === 'portal_nicho') {
    return { assunto: `Pauta: ${/PBQP/i.test(a.ativo) ? 'quantas construtoras têm PBQP-H, cidade a cidade' : 'o prazo da ISO 9001:2026 para as empresas certificadas'}`,
      mensagem: `Olá, equipe do ${a.nome.split(' (')[0]}.\n\n${/PBQP/i.test(a.ativo) ? 'Mantenho um panorama público, atualizado todo mês com os dados oficiais do SiAC, de quantas construtoras têm PBQP-H em cada estado e cidade, com gráficos que podem ser incorporados citando a fonte.' : 'A ISO publicou a ISO 9001:2026 em 16/09/2026, e toda empresa certificada tem até 30/09/2029 para fazer a transição. Preparei um guia com o cronograma oficial e um diagnóstico gratuito.'} Sugestão de encaixe: ${a.onde}.\n\nMaterial: ${ativoUrl}\nPosso enviar números do recorte que interessar e dar entrevista.${assinatura}` };
  }
  return { assunto: 'Material gratuito sobre ISO 9001:2026 e PBQP-H', mensagem: `Olá.\n\nSou Daniel Anders, consultor de qualidade em Passo Fundo. Ofereço sem custo, como ${a.onde.toLowerCase()}: ${a.ativo}.\n\nMaterial: ${ativoUrl}${assinatura}` };
}

export function artigosConvidado() {
  const d = dadosPbqph();
  const porUf = (uf) => d.registros.filter(r => r.uf === uf);
  const artigoUf = (uf, nome, veiculo) => {
    const regs = porUf(uf);
    const cidades = new Map();
    for (const r of regs) cidades.set(r.municipio_titulo, (cidades.get(r.municipio_titulo) || 0) + 1);
    const top = [...cidades.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const venc = regs.filter(r => r.validade && new Date(r.validade) - Date.now() < 365 * 86400_000 && new Date(r.validade) > Date.now()).length;
    return {
      chave: 'pbqph-' + uf.toLowerCase(), veiculo_alvo: veiculo,
      titulo: `PBQP-H em ${nome}: ${regs.length} registros vigentes e onde eles estão`,
      corpo: `O cadastro oficial do SiAC, do Ministério das Cidades, mostra ${regs.length} registros de empresas com PBQP-H vigente em ${nome} (carga de ${String(d.carregadoEm || '').slice(0, 10)}): ${regs.filter(r => r.nivel === 'A').length} no nível A e ${regs.filter(r => r.nivel === 'B').length} no nível B.\n\nAs cidades com mais registros são ${top.map(([c, n]) => `${c} (${n})`).join(', ')}. Nos próximos 12 meses, ${venc} desses certificados chegam ao fim da validade, o que coloca a renovação na agenda dessas construtoras.\n\nPor que isso importa: o PBQP-H é exigido em boa parte do financiamento habitacional, e a renovação é o momento em que o sistema de gestão da obra mostra se funciona ou se existe só no papel. Os dois pontos que mais travam a renovação são a evidência de controle dos serviços no canteiro e a auditoria interna feita às pressas.\n\nO panorama completo, cidade a cidade, com gráficos que podem ser incorporados citando a fonte, está em ${SITE}/dados/pbqp-h.\n\nDaniel Anders é engenheiro eletricista e consultor de ISO 9001 e PBQP-H desde 2004, em Passo Fundo (RS).`,
    };
  };
  const iso = (chave, titulo, veiculo, foco) => ({
    chave, veiculo_alvo: veiculo, titulo,
    corpo: `A ISO publicou a ISO 9001:2026 em 16 de setembro de 2026. Pelo documento oficial de transição da Global ACI, toda empresa certificada pela versão 2015 tem até 30/09/2029 para fazer a auditoria de transição; depois disso, o certificado 2015 perde a validade. A partir de 31/03/2028, certificação inicial só sai pela versão 2026.\n\n${foco}\n\nO que muda, em resumo: a direção passa a promover cultura da qualidade e comportamento ético (5.1.1); a política se liga ao contexto e à direção estratégica (5.2.1); riscos e oportunidades viram três requisitos (6.1.1 a 6.1.3); mudanças no sistema exigem monitorar a eficácia, comunicar e analisar o resultado (6.3); a conscientização inclui cultura e ética (7.3); e as entradas da análise crítica passam a ser obrigatórias, com uma nova sobre mudanças nas necessidades das partes interessadas (9.3.2).\n\nO calendário real de cada empresa depende de quando a certificadora estará acreditada para a versão 2026 — as decisões de acreditação vão até 30/09/2027. A recomendação prática é perguntar isso à certificadora agora e fechar as lacunas antes da auditoria, não durante. Há um diagnóstico gratuito de 10 perguntas em ${SITE}/transicao-iso-9001-2026.\n\nDaniel Anders é engenheiro eletricista e consultor de ISO 9001 e PBQP-H desde 2004, em Passo Fundo (RS).`,
  });
  return [
    artigoUf('RS', 'Rio Grande do Sul', 'Jornal do Comércio / Sinduscon-RS'),
    artigoUf('SC', 'Santa Catarina', 'Sinduscon Oeste / ACIC Chapecó'),
    artigoUf('PR', 'Paraná', 'Sinduscon-PR'),
    artigoUf('SP', 'São Paulo', 'SindusCon-SP'),
    artigoUf('MG', 'Minas Gerais', 'Sinduscon-MG'),
    iso('iso-metalmecanica', 'ISO 9001:2026: o prazo que a indústria metalmecânica da Serra precisa marcar', 'SIMECS / Pioneiro', 'Para a cadeia metalmecânica, em que o cliente grande exige o certificado do fornecedor, perder a validade em 2029 significa sair da lista de fornecedores aprovados.'),
    iso('iso-construcao', 'ISO 9001:2026 e PBQP-H: o que muda para construtoras certificadas', 'Engenharia 360 / AECweb', 'Construtoras que mantêm ISO 9001 junto com o PBQP-H precisam planejar a transição sem atrapalhar a renovação anual do SiAC.'),
    iso('iso-pequena-empresa', 'Pequena empresa certificada: como chegar à ISO 9001:2026 sem parar a produção', 'Sebrae RS / Revista Amanhã', 'Na pequena empresa, a transição costuma cair nas mãos de quem já acumula a qualidade com outras funções; por isso, dividir os ajustes ao longo de 2027 evita a correria de 2029.'),
    iso('iso-gestores', 'O que o gestor precisa decidir agora sobre a ISO 9001:2026', 'CRA-RS / FIERGS', 'A decisão de quando fazer a transição é da direção, não só da área da qualidade: ela afeta orçamento, agenda de auditoria e a relação com clientes que exigem o certificado.'),
    iso('iso-norte-rs', 'Norte do RS: empresas certificadas têm até 2029 para migrar à nova ISO 9001', 'O Nacional / Jornal Bom Dia', 'No norte do Rio Grande do Sul, onde muitas indústrias fornecem para grandes compradores do agronegócio e da construção, o certificado é condição comercial, não enfeite.'),
  ];
}

export async function semear(sql) {
  const municipios = dadosPbqph().publicaveis.map(x => ({ nome: x.titulo, uf: x.uf }));
  const novas = await gravarConsultas(sql, combinacoes({ municipios, termos: TERMOS.map(t => t.termo) }), 'combinacao');
  for (const a of [...ALVOS_VERIFICADOS.map(x => ({ ...x, onde: x.motivo, ativo: 'Palestra ou artigo sobre ISO 9001:2026; panorama do PBQP-H' })), ...ALVOS_LINK]) {
    const chave = (a.nome + '-' + a.cidade).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80);
    const m = ALVOS_VERIFICADOS.includes(a) ? (() => { const x = mensagemParceiro(a); return { assunto: x.assunto, mensagem: x.corpo }; })() : mensagemAlvo(a, chave);
    await sql`
      INSERT INTO alvos_link (chave, nome, tipo, cidade, uf, url, onde_link, ativo, assunto, mensagem)
      VALUES (${chave}, ${a.nome}, ${a.tipo}, ${a.cidade}, ${a.uf}, ${a.url}, ${a.onde || a.motivo || null}, ${a.ativo || null}, ${m.assunto}, ${m.mensagem})
      ON CONFLICT (chave) DO UPDATE SET assunto = EXCLUDED.assunto, mensagem = EXCLUDED.mensagem, onde_link = EXCLUDED.onde_link, ativo = EXCLUDED.ativo`;
  }
  for (const art of artigosConvidado()) {
    await sql`INSERT INTO artigos_convidado (chave, titulo, veiculo_alvo, corpo) VALUES (${art.chave}, ${art.titulo}, ${art.veiculo_alvo}, ${art.corpo})
              ON CONFLICT (chave) DO UPDATE SET titulo = EXCLUDED.titulo, corpo = EXCLUDED.corpo, atualizado_em = NOW()`;
  }
  return { consultas_novas: novas };
}

// ── Distribuição: cada página publicada gera 1 post e 1 roteiro de vídeo ──
export async function enfileirarDistribuicao(sql, paginas) {
  for (const p of paginas) {
    const li = utm(SITE + caminho(p), { origem: 'linkedin', meio: 'social', campanha: 'organico-' + p.cluster, conteudo: p.slug.slice(0, 60) });
    const yt = utm(SITE + caminho(p), { origem: 'youtube', meio: 'social', campanha: 'organico-' + p.cluster, conteudo: p.slug.slice(0, 60) });
    const primeira = String(p.resposta || '').split(/(?<=[.!?])\s+/)[0];
    await sql`INSERT INTO distribuicao (pagina_slug, canal, texto, link) VALUES (${p.slug}, 'linkedin', ${`${p.h1 || p.titulo}\n\n${p.resposta}\n\nDetalhes, exemplo prático e material gratuito:`}, ${li}) ON CONFLICT DO NOTHING`;
    await sql`INSERT INTO distribuicao (pagina_slug, canal, texto, link) VALUES (${p.slug}, 'video', ${`Roteiro (30 s): 1) Pergunta na tela: "${p.consulta}?" 2) Resposta: ${primeira} 3) Um ponto prático da página. 4) "Link na descrição."`}, ${yt}) ON CONFLICT DO NOTHING`;
  }
}

// ── Onda semanal de publicação ──
export async function publicarOnda(sql) {
  const tamanho = parseInt(process.env.ONDA_TAMANHO, 10) || 300;
  const pausados = (await sql`SELECT alvo FROM seo_fila WHERE tipo = 'pausa_tipo' AND status = 'aberta'`).map(r => r.alvo);
  const prontas = await sql`SELECT id, slug, tipo FROM seo_paginas WHERE status = 'aprovada' AND origem = 'llm' AND NOT (tipo = ANY(${pausados})) ORDER BY id LIMIT ${tamanho}`;
  if (!prontas.length) return { publicadas: 0 };
  const porTipo = new Map();
  for (const p of prontas) { if (!porTipo.has(p.tipo)) porTipo.set(p.tipo, []); porTipo.get(p.tipo).push(p); }
  for (const [tipo, lista] of porTipo) {
    const [onda] = await sql`INSERT INTO seo_ondas (tipo, paginas) VALUES (${tipo}, ${lista.length}) RETURNING id`;
    const ids = lista.map(p => p.id);
    await sql`UPDATE seo_paginas SET status = 'publicada', onda = ${onda.id}, publicado_em = NOW() WHERE id = ANY(${ids})`;
  }
  await recarregar(sql);   // portão final com o motor de links; quem cair vai para revisão
  const publicadas = paginasPublicadas().filter(p => prontas.some(x => x.slug === p.slug));
  await enfileirarDistribuicao(sql, publicadas);
  try { await indexNow(publicadas.map(caminho)); } catch (e) { console.error('[onda] indexnow:', e.message); }
  try { await enviarSitemapGsc(); } catch (e) { console.error('[onda] sitemap gsc:', e.message); }
  await anotar(sql, 'publicacao', `Onda: ${publicadas.length} páginas publicadas (${[...porTipo.keys()].join(', ')})`);
  return { publicadas: publicadas.length };
}

// Onda com mais de 21 dias e menos de 50% indexada pausa o tipo.
export async function avaliarOndas(sql) {
  const ondas = await sql`SELECT * FROM seo_ondas WHERE status = 'publicada' AND publicada_em < NOW() - INTERVAL '21 days'`;
  for (const o of ondas) {
    const urls = (await sql`SELECT slug FROM seo_paginas WHERE onda = ${o.id}`).map(r => SITE + '/' + r.slug);
    const idx = urls.length ? (await sql`SELECT COUNT(*)::int AS n FROM seo_indexacao WHERE url = ANY(${urls}) AND verdict = 'PASS'`)[0].n : 0;
    const taxa = urls.length ? idx / urls.length : 0;
    await sql`UPDATE seo_ondas SET indexadas = ${idx}, verificada_em = NOW(), status = ${taxa < 0.5 ? 'abaixo_50' : 'ok'} WHERE id = ${o.id}`;
    if (taxa < 0.5) {
      await sql`INSERT INTO seo_fila (tipo, alvo, motivo) VALUES ('pausa_tipo', ${o.tipo}, ${`onda ${o.id}: ${idx}/${urls.length} indexadas em 21 dias — reforçar o template`}) ON CONFLICT DO NOTHING`;
      await anotar(sql, 'pausa', `Tipo ${o.tipo} pausado: onda ${o.id} com ${Math.round(taxa * 100)}% indexada`);
    }
  }
}

// ── Oportunidade e frescor (Search Console, 28 dias) ──
const CTR_ESPERADO = [0, 0.28, 0.15, 0.10, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02, 0.018];
export async function oportunidades(sql) {
  const pags = await sql`
    SELECT pagina, SUM(impressoes)::int AS imp, SUM(cliques)::int AS cli, AVG(posicao)::float AS pos
      FROM seo_gsc WHERE dia > CURRENT_DATE - 28 GROUP BY 1`;
  for (const p of pags) {
    if (p.pos >= 4 && p.pos <= 15 && p.imp >= 50) await sql`INSERT INTO seo_fila (tipo, alvo, motivo) VALUES ('reforcar', ${p.pagina}, ${`posição ${p.pos.toFixed(1)} com ${p.imp} impressões`}) ON CONFLICT DO NOTHING`;
    const esperado = CTR_ESPERADO[Math.min(10, Math.max(1, Math.round(p.pos)))] || 0.015;
    if (p.imp >= 100 && p.cli / p.imp < esperado * 0.5) await sql`INSERT INTO seo_fila (tipo, alvo, motivo) VALUES ('reescrever_title', ${p.pagina}, ${`CTR ${(100 * p.cli / p.imp).toFixed(1)}% para posição ${p.pos.toFixed(1)}`}) ON CONFLICT DO NOTHING`;
  }
  const queda = await sql`
    SELECT pagina, SUM(cliques) FILTER (WHERE dia > CURRENT_DATE - 28)::int AS agora, SUM(cliques) FILTER (WHERE dia <= CURRENT_DATE - 28 AND dia > CURRENT_DATE - 56)::int AS antes
      FROM seo_gsc WHERE dia > CURRENT_DATE - 56 GROUP BY 1`;
  for (const q of queda) if ((q.antes || 0) >= 20 && (q.agora || 0) < 0.7 * q.antes) {
    await sql`INSERT INTO seo_fila (tipo, alvo, motivo) VALUES ('atualizar', ${q.pagina}, ${`cliques caíram de ${q.antes} para ${q.agora} em 28 dias`}) ON CONFLICT DO NOTHING`;
  }
  // Mapa: consultas reais do Search Console que ainda não estão no mapa.
  const novas = (await sql`SELECT DISTINCT consulta FROM seo_gsc WHERE dia > CURRENT_DATE - 28 AND impressoes > 0 LIMIT 5000`).map(r => r.consulta);
  return { novas_do_gsc: await gravarConsultas(sql, novas, 'gsc') };
}

// ── Linha de base e alertas ──
export async function linhaDeBase(sql) {
  const m = {};
  const g = (await sql`SELECT COALESCE(SUM(cliques),0)::int AS c, COALESCE(SUM(impressoes),0)::int AS i, AVG(posicao)::float AS p FROM seo_gsc WHERE dia > CURRENT_DATE - 9 AND dia <= CURRENT_DATE - 2`)[0];
  m.impressoes_7d = g.i; m.cliques_7d = g.c; m.ctr_7d = g.i ? g.c / g.i : 0; m.posicao_media_7d = g.p || 0;
  m.paginas_indexadas = (await sql`SELECT COUNT(*)::int AS n FROM seo_indexacao WHERE verdict = 'PASS'`)[0].n;
  m.paginas_publicadas_motor = (await sql`SELECT COUNT(*)::int AS n FROM seo_paginas WHERE status = 'publicada'`)[0].n;
  m.consultas_no_mapa = (await sql`SELECT COUNT(*)::int AS n FROM seo_consultas WHERE fonte <> 'semente-ac'`)[0].n;
  m.visitas_organicas_7d = (await sql`SELECT COALESCE(SUM(sessoes),0)::int AS n FROM seo_ga4 WHERE canal ILIKE 'Organic%' AND dia > CURRENT_DATE - 8`)[0].n;
  m.leads_organicos_30d = (await sql`SELECT COUNT(*)::int AS n FROM leads WHERE canal IN ('organico','assistente_ia') AND created_at > NOW() - INTERVAL '30 days'`)[0].n;
  m.vendas_organicas_30d = (await sql`SELECT COUNT(*)::int AS n FROM conversoes WHERE evento = 'payment_succeeded' AND canal IN ('organico','assistente_ia') AND ts > NOW() - INTERVAL '30 days'`)[0].n;
  for (const [k, v] of Object.entries(m)) {
    await sql`INSERT INTO seo_linha_base (dia, metrica, valor) VALUES (CURRENT_DATE, ${k}, ${v}) ON CONFLICT (dia, metrica) DO UPDATE SET valor = EXCLUDED.valor`;
  }
  return m;
}

export async function alertas(sql, enviar) {
  const novos = [];
  const add = async (tipo, chave, msg) => {
    const r = await sql`INSERT INTO seo_alertas (tipo, chave, mensagem) VALUES (${tipo}, ${chave}, ${msg}) ON CONFLICT (tipo, chave) DO NOTHING RETURNING id`;
    if (r.length) novos.push(msg);
  };
  const cl = await sql`
    SELECT pagina, SUM(cliques) FILTER (WHERE dia > CURRENT_DATE - 9)::int AS esta, SUM(cliques) FILTER (WHERE dia <= CURRENT_DATE - 9 AND dia > CURRENT_DATE - 16)::int AS anterior
      FROM seo_gsc WHERE dia > CURRENT_DATE - 16 GROUP BY 1`;
  const porCluster = new Map();
  for (const r of cl) { const c = classificarRota(r.pagina).cluster; const x = porCluster.get(c) || { e: 0, a: 0 }; x.e += r.esta || 0; x.a += r.anterior || 0; porCluster.set(c, x); }
  for (const [c, x] of porCluster) if (x.a >= 10 && x.e < 0.7 * x.a) await add('queda_cluster', `${c}:${semanaBR()}`, `Cluster ${c}: cliques caíram de ${x.a} para ${x.e} (semana contra semana).`);
  const pilares = Object.values(CLUSTERS).map(c => SITE + c.pilar.split('?')[0]);
  for (const r of await sql`SELECT url, coverage FROM seo_indexacao WHERE url = ANY(${pilares}) AND verdict = 'FAIL'`) await add('desindexada', `${r.url}:${hojeBR()}`, `Página prioritária fora do índice: ${r.url} (${r.coverage}).`);
  for (const e of errosRecentes().filter(x => x.dia === hojeBR())) await add('erro_5xx', `${e.pagina}:${e.dia}`, `${e.n} erro(s) 5xx em ${e.pagina} hoje.`);
  const iscas = await sql`
    SELECT props->>'isca_id' AS isca, COUNT(*) FILTER (WHERE event = 'isca_vista')::int AS vistas, COUNT(*) FILTER (WHERE event IN ('isca_concluida','lead_capturado'))::int AS conv
      FROM telemetry_events WHERE event IN ('isca_vista','isca_concluida','lead_capturado') AND ts > NOW() - INTERVAL '7 days' GROUP BY 1`;
  for (const i of iscas) if (i.isca && i.vistas >= 20 && i.conv === 0) await add('isca_zero', `${i.isca}:${semanaBR()}`, `Isca ${i.isca}: ${i.vistas} visualizações e nenhuma conversão em 7 dias.`);
  if (novos.length && enviar) await enviar(`[Anders Tech] ${novos.length} alerta(s) do orgânico`, layout(`<div class="body"><h2>Alertas do orgânico</h2><ul>${novos.map(n => `<li>${esc(n)}</li>`).join('')}</ul><a class="cta" href="${SITE}/admin/organico">Abrir o painel</a></div>`));
  return novos;
}

export async function resumoSemanal(sql, enviar) {
  const pub = (await sql`SELECT COUNT(*)::int AS n FROM seo_paginas WHERE publicado_em > NOW() - INTERVAL '7 days'`)[0].n;
  const mov = await sql`
    SELECT pagina, AVG(posicao) FILTER (WHERE dia > CURRENT_DATE - 9)::float AS agora, AVG(posicao) FILTER (WHERE dia <= CURRENT_DATE - 9 AND dia > CURRENT_DATE - 16)::float AS antes
      FROM seo_gsc WHERE dia > CURRENT_DATE - 16 GROUP BY 1 HAVING COUNT(*) > 3`;
  const comDelta = mov.filter(m => m.agora && m.antes).map(m => ({ ...m, d: m.antes - m.agora }));
  const subiu = comDelta.sort((a, b) => b.d - a.d).slice(0, 5), caiu = [...comDelta].sort((a, b) => a.d - b.d).slice(0, 5);
  const iscas = await sql`
    SELECT props->>'isca_id' AS isca, COUNT(*) FILTER (WHERE event = 'isca_vista')::int AS vistas, COUNT(*) FILTER (WHERE event = 'lead_capturado')::int AS leads
      FROM telemetry_events WHERE event IN ('isca_vista','lead_capturado') AND ts > NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY 3 DESC`;
  const fila = await sql`SELECT tipo, alvo, motivo FROM seo_fila WHERE status = 'aberta' ORDER BY created_at LIMIT 5`;
  const li = (arr, f) => arr.length ? `<ul>${arr.map(x => `<li>${f(x)}</li>`).join('')}</ul>` : '<p>—</p>';
  const html = layout(`<div class="body"><h2>Resumo semanal do orgânico</h2>
<p><b>${pub}</b> página(s) publicada(s) nos últimos 7 dias.</p>
<h3>Subiu</h3>${li(subiu, m => `${esc(m.pagina)}: ${m.antes.toFixed(1)} → ${m.agora.toFixed(1)}`)}
<h3>Caiu</h3>${li(caiu.filter(m => m.d < 0), m => `${esc(m.pagina)}: ${m.antes.toFixed(1)} → ${m.agora.toFixed(1)}`)}
<h3>Iscas</h3>${li(iscas, i => `${esc(i.isca || '—')}: ${i.vistas} vistas, ${i.leads} leads`)}
<h3>5 próximas ações</h3>${li(fila, f => `${esc(f.tipo)}: ${esc(f.alvo)} — ${esc(f.motivo || '')}`)}
<a class="cta" href="${SITE}/admin/organico">Abrir o painel</a></div>`);
  if (enviar) await enviar('[Anders Tech] Resumo semanal do orgânico', html);
  return { publicadas: pub };
}

// ── Agendador ──
export function iniciar(sql, { resend } = {}) {
  // Sem banco (dev, CI): as páginas de requisito saem das sementes em memória.
  if (!sql) { recarregar(null).catch(() => {}); return; }
  const enviar = resend ? (assunto, html) => resend.emails.send({ from: `Anders Tech <${EMPRESA.emailRemetente}>`, to: process.env.NOTIFY_EMAIL || EMPRESA.email, subject: assunto, html }) : null;
  const loga = (n) => (e) => console.error(`[organico] ${n}:`, e.message);
  const sha = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.RAILWAY_DEPLOYMENT_ID || '';
  (async () => {
    if (sha) await anotar(sql, 'deploy', `Deploy ${sha.slice(0, 7)}`, 'deploy:' + sha);
    await semear(sql).catch(loga('semear'));
    await recarregar(sql).catch(loga('recarregar'));
    await carregarFaixas().catch(loga('faixas de IP'));
  })();
  setInterval(() => { gravarCrawlers(sql).catch(loga('crawlers')); }, 5 * 60_000).unref();
  setInterval(async () => {
    const h = brt().getUTCHours(), dow = brt().getUTCDay(), d = hojeBR(), s = semanaBR();
    try {
      if (process.env.MAPA_AUTOCOMPLETE !== 'false') await expandirAutocomplete(sql, { maximo: 20 });
      if (h >= 3 && await umaVez(sql, 'job:diario:' + d, 'rotina diária')) {
        await carregarFaixas().catch(loga('faixas'));
        // Primeira coleta com a tabela vazia puxa 90 dias: sem isso o painel
        // nasce sem histórico e a linha de base compara contra nada.
        const gscVazia = (await sql`SELECT NOT EXISTS (SELECT 1 FROM seo_gsc) AS v`)[0].v;
        const ga4Vazia = (await sql`SELECT NOT EXISTS (SELECT 1 FROM seo_ga4) AS v`)[0].v;
        await ingerirGsc(sql, { dias: gscVazia ? 90 : 5 }).catch(loga('gsc'));
        await ingerirBing(sql).catch(loga('bing'));
        await ingerirGa4(sql, { dias: ga4Vazia ? 90 : 7 }).catch(loga('ga4'));
        if (gscConfigurado()) {
          const amostra = paginasPublicadas().map(p => SITE + caminho(p));
          const verificadas = new Set((await sql`SELECT url FROM seo_indexacao WHERE verificado_em > NOW() - INTERVAL '14 days'`).map(r => r.url));
          await inspecionar(sql, amostra.filter(u => !verificadas.has(u))).catch(loga('inspeção'));
        }
        if (producaoAtiva()) await produzirLote(sql, { fatosLista: fatos(fatosPbqph()) }).catch(loga('produção'));
        await linhaDeBase(sql).catch(loga('linha de base'));
        await alertas(sql, enviar).catch(loga('alertas'));
      }
      if (dow === 1 && h >= 6 && await umaVez(sql, 'job:onda:' + s, 'onda semanal')) {
        await publicarOnda(sql).catch(loga('onda'));
        await avaliarOndas(sql).catch(loga('ondas'));
        await oportunidades(sql).catch(loga('oportunidades'));
        const prioritarias = (await sql`SELECT consulta FROM seo_consultas WHERE fonte <> 'semente-ac' ORDER BY prioridade DESC, id LIMIT 50`).map(r => r.consulta);
        await checarSerp(sql, prioritarias).catch(loga('serp'));
      }
      if (dow === 1 && h >= 8 && await umaVez(sql, 'job:resumo:' + s, 'resumo semanal')) await resumoSemanal(sql, enviar).catch(loga('resumo'));
    } catch (e) { loga('agendador')(e); }
  }, 10 * 60_000).unref();
}

export { ISCAS };
