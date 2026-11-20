// ── Rotas de crescimento ─────────────────────────────────────────────────────
// Parceiros (/p/<codigo>, cadastro e painel), feed de conversões para Google e
// Microsoft Ads, painel de canais/custos e relatório D3/D7/D14.
// Montado em server.js com app.use(growthRouter({ adminAuth, sendPage, send404 })).

import { Router } from 'express';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { EMPRESA } from '../config/empresa.js';
import { neon } from '@neondatabase/serverless';
import { criarResend } from '../config/email.js';
import { injectShared } from '../inject.js';
import { codigoParceiroValido } from './atribuicao.js';
import { csvGoogle, csvMicrosoft, despacharMeta, contatoDaConversao, metaConfigurada } from './conversoes.js';
import { registrarLeadDeOrigem, origemDoLead } from './leads.js';
import { METAS, decidir, relatorioMarkdown } from './regras.js';
import { notifyNewLead } from '../emails.js';
import { texto, normalizaEmail, emailValido, telefoneValido } from '../config/contato.js';
import { processarFila, suprimir, sincronizarContas, iniciarSequencia, mudarStatusConta, roteiroLigacao, OBJECOES, outboundAtivo, reguaAtiva } from './mensageria.js';
import { despacharGoogle, despacharMicrosoft, importarCustoGoogleAds, dataManagerConfigurado, uetConfigurado, adsCustoConfigurado } from './integracoes.js';
import { whatsappConfigurado, assinaturaValida, mensagensDoPayload, registrarRecebidas } from './whatsapp.js';
import { POSTS, PARCEIROS_ALVO, mensagemParceiro, FONTES } from './conteudo.js';
import { csvsGoogleAdsEditor } from './midia.js';
import { dados as dadosPbqph } from '../pbqph/dados.js';
import { readFileSync } from 'node:fs';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = criarResend(); // recusa do Resend vira erro (config/email.js)
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';
const ADMIN_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'admin');

export const TIPOS_PARCEIRO = ['contabilidade', 'consultoria', 'engenharia', 'associacao', 'certificadora', 'software', 'outro'];

// ── limite por IP ──
const hits = new Map();
setInterval(() => { const lim = Date.now() - 3600_000; for (const [k, v] of hits) if (v.t < lim) hits.delete(k); }, 600_000).unref();
function limite(max, janelaMs) {
  return (req, res, next) => {
    const k = req.ip + ':' + req.path + ':' + max;
    const agora = Date.now();
    const e = hits.get(k);
    if (e && agora - e.t < janelaMs) {
      if (e.n >= max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
      e.n++;
    } else hits.set(k, { t: agora, n: 1 });
    next();
  };
}

function esc(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Destino do link de parceiro: só caminho interno, sem esquema nem host —
// /p/<codigo>?para=//site-malicioso seria redirecionamento aberto.
export function destinoSeguro(para) {
  const s = String(para || '');
  return /^\/[a-z0-9\-/]{0,120}$/.test(s) && !s.startsWith('//') ? s : '/';
}

export function geraCodigoParceiro(nome) {
  const base = String(nome || 'parceiro')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'parceiro';
  const sufixo = crypto.randomInt(100, 1000);
  return `${base}-${sufixo}`.replace(/^-/, '');
}

// Basic auth do feed de conversões. Fail-closed: sem senha configurada o feed
// não existe (503), porque ele carrega identificador de clique de visitante.
function feedAuth(req, res, next) {
  const u = process.env.CONVERSOES_FEED_USUARIO;
  const p = process.env.CONVERSOES_FEED_SENHA;
  if (!u || !p) return res.status(503).type('text').send('feed desligado');
  const esperado = 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64');
  const a = crypto.createHash('sha256').update(String(req.headers.authorization || '')).digest();
  const b = crypto.createHash('sha256').update(esperado).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    res.set('WWW-Authenticate', 'Basic realm="conversoes"');
    return res.status(401).type('text').send('não autorizado');
  }
  next();
}

const EVENTOS_FEED = ['lead_captured', 'checkout_started', 'payment_succeeded'];

async function conversoesDoFeed() {
  return sql`
    SELECT event_id, evento, ts, valor, atribuicao FROM conversoes
     WHERE consent_marketing = TRUE AND evento = ANY(${EVENTOS_FEED})
       AND ts > NOW() - INTERVAL '89 days'
     ORDER BY ts`;
}

// ── Painel por canal ──
async function dadosCanais(dias) {
  const [leads, pedidos, custos, resposta, porEntrada, porDia] = await Promise.all([
    sql`SELECT COALESCE(canal, 'sem registro') AS canal, COUNT(*)::int AS leads,
               COUNT(*) FILTER (WHERE score >= 40)::int AS qualificados
          FROM leads WHERE created_at > NOW() - (${dias} || ' days')::interval GROUP BY 1`,
    sql`SELECT COALESCE(canal, 'sem registro') AS canal,
               COUNT(*) FILTER (WHERE evento = 'checkout_started')::int AS checkouts,
               COUNT(*) FILTER (WHERE evento = 'payment_succeeded')::int AS vendas,
               COALESCE(SUM(valor) FILTER (WHERE evento = 'payment_succeeded'), 0)::float AS receita
          FROM conversoes WHERE ts > NOW() - (${dias} || ' days')::interval GROUP BY 1`,
    sql`SELECT canal, COALESCE(SUM(custo), 0)::float AS custo, COALESCE(SUM(cliques), 0)::int AS cliques,
               COALESCE(SUM(impressoes), 0)::int AS impressoes
          FROM custos_midia WHERE dia > (NOW() - (${dias} || ' days')::interval)::date GROUP BY 1`,
    sql`SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (primeira_resposta_em - created_at)) / 60)::float AS mediana_min,
               COUNT(*) FILTER (WHERE primeira_resposta_em IS NULL)::int AS sem_resposta
          FROM leads WHERE created_at > NOW() - (${dias} || ' days')::interval`,
    sql`SELECT COALESCE(atribuicao->'ft'->>'landing', '(sem registro)') AS pagina,
               COUNT(*) FILTER (WHERE evento = 'lead_captured')::int AS leads,
               COUNT(*) FILTER (WHERE evento = 'payment_succeeded')::int AS vendas,
               COALESCE(SUM(valor) FILTER (WHERE evento = 'payment_succeeded'), 0)::float AS receita
          FROM conversoes WHERE ts > NOW() - (${dias} || ' days')::interval
         GROUP BY 1 ORDER BY receita DESC, leads DESC LIMIT 25`,
    sql`SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS dia, COALESCE(canal, 'sem registro') AS canal,
               COUNT(*) FILTER (WHERE evento = 'lead_captured')::int AS leads,
               COUNT(*) FILTER (WHERE evento = 'payment_succeeded')::int AS vendas,
               COALESCE(SUM(valor) FILTER (WHERE evento = 'payment_succeeded'), 0)::float AS receita
          FROM conversoes WHERE ts > NOW() - (${dias} || ' days')::interval
         GROUP BY 1, 2 ORDER BY 1, 2`,
  ]);
  const mapa = new Map();
  const linha = (c) => {
    if (!mapa.has(c)) mapa.set(c, { canal: c, leads: 0, qualificados: 0, checkouts: 0, vendas: 0, receita: 0, custo: 0, cliques: 0, impressoes: 0 });
    return mapa.get(c);
  };
  for (const r of leads) Object.assign(linha(r.canal), { leads: r.leads, qualificados: r.qualificados });
  for (const r of pedidos) Object.assign(linha(r.canal), { checkouts: r.checkouts, vendas: r.vendas, receita: r.receita });
  for (const r of custos) Object.assign(linha(r.canal), { custo: r.custo, cliques: r.cliques, impressoes: r.impressoes });
  const canais = [...mapa.values()].map(c => ({
    ...c,
    cpl: c.leads ? Math.round((c.custo / c.leads) * 100) / 100 : null,
    cac: c.vendas ? Math.round((c.custo / c.vendas) * 100) / 100 : null,
  })).sort((a, b) => b.receita - a.receita || b.leads - a.leads);
  return {
    dias, metas: METAS, canais, por_dia: porDia, por_entrada: porEntrada,
    primeira_resposta: resposta[0] || { mediana_min: null, sem_resposta: 0 },
  };
}

// CSV de custo: dia,canal,campanha,custo[,impressoes,cliques]. Aceita vírgula
// decimal brasileira entre aspas e ponto-e-vírgula como separador.
export function parseCustosCsv(textoCsv) {
  const linhas = String(textoCsv || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!linhas.length) return { linhas: [], erros: ['arquivo vazio'] };
  const sep = linhas[0].includes(';') ? ';' : ',';
  const cab = linhas[0].toLowerCase().split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
  const idx = (n) => cab.indexOf(n);
  if (idx('dia') < 0 || idx('canal') < 0 || idx('custo') < 0) {
    return { linhas: [], erros: ['cabeçalho precisa de: dia, canal, custo (opcionais: campanha, impressoes, cliques)'] };
  }
  const num = (v) => {
    if (v === undefined || v === '') return null;
    const s = String(v).replace(/^"|"$/g, '').replace(/R\$\s?/, '').trim();
    const n = Number(s.includes(',') && sep === ';' ? s.replace(/\./g, '').replace(',', '.') : s);
    return Number.isFinite(n) ? n : NaN;
  };
  const out = [], erros = [];
  linhas.slice(1).forEach((l, i) => {
    const c = l.split(sep).map(s => s.trim().replace(/^"|"$/g, ''));
    const dia = c[idx('dia')];
    const canal = (c[idx('canal')] || '').toLowerCase();
    const custo = num(c[idx('custo')]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || !/^[a-z_]{2,30}$/.test(canal) || !Number.isFinite(custo) || custo < 0) {
      erros.push(`linha ${i + 2}: dia AAAA-MM-DD, canal (ex.: google_ads) e custo numérico`);
      return;
    }
    const imp = idx('impressoes') >= 0 ? num(c[idx('impressoes')]) : null;
    const cli = idx('cliques') >= 0 ? num(c[idx('cliques')]) : null;
    out.push({
      dia, canal, campanha: idx('campanha') >= 0 ? String(c[idx('campanha')] || '').slice(0, 120) : '',
      custo, impressoes: Number.isFinite(imp) ? Math.round(imp) : null, cliques: Number.isFinite(cli) ? Math.round(cli) : null,
    });
  });
  return { linhas: out, erros };
}

function paginaParceiro(p, stats) {
  const link = `https://anderstech.net/p/${p.codigo}`;
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel do parceiro — Anders Tech</title><meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="/styles.css">
<style>.pp{max-width:760px;margin:0 auto;padding:110px 20px 60px}.pp h1{font-size:28px;margin:0 0 6px}.pp .k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:24px 0}
.pp .k div{border:1px solid #d9dee8;padding:16px;background:#fff}.pp .k b{display:block;font-size:28px}.pp code{display:block;padding:12px;background:#f4f6fa;border:1px solid #d9dee8;word-break:break-all;margin:8px 0 16px}
.pp table{width:100%;border-collapse:collapse;font-size:14px}.pp td,.pp th{padding:8px;border-bottom:1px solid #e6e9f0;text-align:left}</style></head>
<body><div id="shared-nav"></div><main class="pp">
<h1>Olá, ${esc(p.nome)}</h1><p>Status do cadastro: <b>${esc(p.status)}</b>${p.status !== 'ativo' ? ' — o link passa a contar indicações quando o Daniel aprovar o cadastro.' : ''}</p>
<p>Seu link de indicação:</p><code>${esc(link)}</code>
<p style="font-size:14px">Para mandar direto para uma página: <code>${esc(link)}?para=/iso-9001</code></p>
<div class="k"><div><b>${stats.cliques}</b>cliques no link</div><div><b>${stats.leads}</b>contatos indicados</div><div><b>${stats.vendas}</b>contratações pagas</div></div>
<h2 style="font-size:18px">Indicações</h2>
<p style="font-size:13px;color:#5b6577">Por privacidade, o painel mostra só data e situação — nunca nome ou contato de quem você indicou.</p>
<table><thead><tr><th>Data</th><th>Situação</th></tr></thead><tbody>
${stats.lista.length ? stats.lista.map(l => `<tr><td>${esc(new Date(l.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}</td><td>${esc(l.status === 'ganho' ? 'contratou' : l.status === 'perdido' ? 'não seguiu' : 'em conversa')}</td></tr>`).join('') : '<tr><td colspan="2">Nenhuma indicação ainda.</td></tr>'}
</tbody></table>
<p style="margin-top:28px;font-size:14px">Dúvidas sobre a parceria: fale com o Daniel no <a href="https://wa.me/5554999648368?text=${encodeURIComponent('Olá! Vim pela página Painel do parceiro (' + p.codigo + ')')}">WhatsApp</a>.</p>
</main><div id="shared-footer"></div></body></html>`;
  return injectShared(html, '/parceiro');
}

export function router({ adminAuth, send404 }) {
  const r = Router();

  // ── Link de parceiro ──
  r.get('/p/:codigo', async (req, res) => {
    const codigo = String(req.params.codigo || '').toLowerCase();
    const destino = destinoSeguro(req.query.para);
    if (!codigoParceiroValido(codigo) || !sql) return res.redirect(302, destino);
    try {
      const rows = await sql`SELECT id FROM parceiros WHERE codigo = ${codigo} AND status = 'ativo'`;
      if (!rows.length) return res.redirect(302, destino);
      await sql`INSERT INTO parceiro_cliques (parceiro_id, destino) VALUES (${rows[0].id}, ${destino})`;
      // Cookie funcional: só o código do parceiro, nenhum dado pessoal. É o que
      // permite pagar a indicação (Política de Privacidade, seção de cookies).
      res.cookie('at_parceiro', codigo, { maxAge: 90 * 86400_000, httpOnly: true, sameSite: 'lax', secure: IS_PROD, path: '/' });
      const sep = destino.includes('?') ? '&' : '?';
      return res.redirect(302, `${destino}${sep}utm_source=${codigo}&utm_medium=parceiro&utm_campaign=programa-parceiros`);
    } catch (err) {
      console.error('[parceiro] link:', err.message);
      return res.redirect(302, destino);
    }
  });

  // ── Cadastro de parceiro ──
  r.post('/api/parceiros', limite(5, 3600_000), async (req, res) => {
    const b = req.body || {};
    if (b.website) return res.json({ ok: true });   // honeypot
    const nome = texto(b.nome, 120);
    const email = normalizaEmail(b.email);
    const telefone = texto(b.telefone, 40);
    const tipo = TIPOS_PARCEIRO.includes(b.tipo) ? b.tipo : 'outro';
    if (!nome) return res.status(400).json({ error: 'Informe seu nome.', campo: 'nome' });
    if (!email || !emailValido(email)) return res.status(400).json({ error: 'Informe um e-mail válido.', campo: 'email' });
    if (telefone && !telefoneValido(telefone)) return res.status(400).json({ error: 'Telefone inválido — informe DDD e número.', campo: 'telefone' });
    if (b.aceite !== true) return res.status(400).json({ error: 'É preciso concordar com as regras do programa.', campo: 'aceite' });
    if (!sql) return res.status(503).json({ error: 'Serviço indisponível. Fale pelo WhatsApp.' });
    try {
      const empresa = texto(b.empresa, 160);
      const cidade = texto(b.cidade, 80);
      const mensagem = texto(b.mensagem, 2000);
      let parceiro = null;
      for (let i = 0; i < 3 && !parceiro; i++) {
        const rows = await sql`
          INSERT INTO parceiros (codigo, token, nome, empresa, tipo, email, telefone, cidade, observacao)
          VALUES (${geraCodigoParceiro(empresa || nome)}, ${crypto.randomBytes(24).toString('hex')}, ${nome}, ${empresa}, ${tipo}, ${email}, ${telefone}, ${cidade}, ${mensagem})
          ON CONFLICT (codigo) DO NOTHING RETURNING id, codigo`;
        parceiro = rows[0] || null;
      }
      if (!parceiro) return res.status(500).json({ error: 'Não foi possível concluir. Tente de novo.' });
      const lead = await registrarLeadDeOrigem(sql, {
        req, source: 'parceiro_cadastro', nome, empresa, email, telefone,
        interesse: `Parceria (${tipo})`, mensagem: [cidade && `Cidade: ${cidade}`, mensagem].filter(Boolean).join(' · ') || null,
        refTipo: 'parceiro', refId: parceiro.id,
      });
      if (lead && lead.leadId) await sql`UPDATE parceiros SET lead_id = ${lead.leadId} WHERE id = ${parceiro.id}`;
      if (resend && lead) {
        resend.emails.send({
          from: 'Anders Tech <noreply@anderstech.net>',
          to: process.env.NOTIFY_EMAIL || EMPRESA.email,
          subject: `[Anders Tech] Pedido de parceria: ${nome}${empresa ? ` — ${empresa}` : ''} (${tipo})`,
          html: notifyNewLead({ nome, empresa, email, telefone, interesse: `Parceria (${tipo})`, mensagem, source: 'parceiro_cadastro',
            leadId: lead.leadId, canal: lead.origem.canal, score: lead.score, motivos: lead.motivos, paginas: lead.paginas }),
        }).catch(err => console.error('[parceiro] aviso:', err.message));
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('[parceiro] cadastro:', err.message);
      res.status(500).json({ error: 'Não foi possível concluir. Tente pelo WhatsApp.' });
    }
  });

  // ── Painel do parceiro (link secreto) ──
  r.get('/parceiro/:token', async (req, res) => {
    const token = String(req.params.token || '');
    if (!/^[a-f0-9]{48}$/.test(token) || !sql) return send404(res);
    try {
      const rows = await sql`SELECT id, codigo, nome, status FROM parceiros WHERE token = ${token}`;
      if (!rows.length) return send404(res);
      const p = rows[0];
      const [cl, lista, vendas] = await Promise.all([
        sql`SELECT COUNT(*)::int AS n FROM parceiro_cliques WHERE parceiro_id = ${p.id}`,
        sql`SELECT created_at, status FROM leads WHERE parceiro_codigo = ${p.codigo} AND source <> 'parceiro_cadastro' ORDER BY created_at DESC LIMIT 100`,
        sql`SELECT COUNT(*)::int AS n FROM conversoes WHERE parceiro_codigo = ${p.codigo} AND evento = 'payment_succeeded'`,
      ]);
      res.set('Cache-Control', 'no-store');
      res.set('X-Robots-Tag', 'noindex, nofollow');
      res.type('html').send(paginaParceiro(p, { cliques: cl[0].n, leads: lista.length, vendas: vendas[0].n, lista }));
    } catch (err) {
      console.error('[parceiro] painel:', err.message);
      send404(res);
    }
  });

  // ── Feed de conversões offline ──
  r.get('/conversoes/google.csv', feedAuth, async (req, res) => {
    if (!sql) return res.status(503).end();
    res.set('Cache-Control', 'no-store');
    res.type('text/csv').send(csvGoogle(await conversoesDoFeed()));
  });
  r.get('/conversoes/microsoft.csv', feedAuth, async (req, res) => {
    if (!sql) return res.status(503).end();
    res.set('Cache-Control', 'no-store');
    res.type('text/csv').send(csvMicrosoft(await conversoesDoFeed()));
  });

  // ── Admin ──
  r.get('/admin/crescimento', (req, res) => res.sendFile(join(ADMIN_DIR, 'crescimento.html')));

  r.get('/api/admin/canais', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    const dias = Math.min(Math.max(parseInt(req.query.dias, 10) || 30, 1), 365);
    try {
      res.json({ ...(await dadosCanais(dias)), meta_capi: metaConfigurada(), feed: !!process.env.CONVERSOES_FEED_SENHA });
    } catch (err) {
      console.error('Admin canais error:', err);
      res.status(500).json({ error: 'Erro ao montar o painel' });
    }
  });

  r.post('/api/admin/custos', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    const { linhas, erros } = parseCustosCsv(req.body && req.body.csv);
    if (!linhas.length) return res.status(400).json({ error: 'Nenhuma linha válida', erros });
    try {
      for (const l of linhas) {
        await sql`
          INSERT INTO custos_midia (dia, canal, campanha, custo, impressoes, cliques)
          VALUES (${l.dia}, ${l.canal}, ${l.campanha}, ${l.custo}, ${l.impressoes}, ${l.cliques})
          ON CONFLICT (dia, canal, campanha) DO UPDATE
            SET custo = EXCLUDED.custo, impressoes = EXCLUDED.impressoes, cliques = EXCLUDED.cliques, importado_em = NOW()`;
      }
      res.json({ ok: true, importadas: linhas.length, erros });
    } catch (err) {
      console.error('Admin custos error:', err);
      res.status(500).json({ error: 'Erro ao importar custos' });
    }
  });

  r.get('/api/admin/relatorio', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    const dia = [3, 7, 14, 30].includes(Number(req.query.dia)) ? Number(req.query.dia) : 7;
    try {
      const d = await dadosCanais(dia);
      const camp = await sql`
        SELECT c.canal, c.campanha, SUM(c.custo)::float AS custo, COALESCE(SUM(c.impressoes), 0)::int AS impressoes,
               COALESCE(SUM(c.cliques), 0)::int AS cliques
          FROM custos_midia c WHERE c.dia > (NOW() - (${dia} || ' days')::interval)::date
         GROUP BY 1, 2`;
      const conv = await sql`
        SELECT canal, COALESCE(atribuicao->'lt'->>'utm_campaign', '') AS campanha,
               COUNT(*) FILTER (WHERE evento = 'lead_captured')::int AS leads,
               COUNT(*) FILTER (WHERE evento = 'payment_succeeded')::int AS vendas
          FROM conversoes WHERE ts > NOW() - (${dia} || ' days')::interval GROUP BY 1, 2`;
      const campanhas = camp.map(c => {
        const m = conv.find(x => x.canal === c.canal && x.campanha === c.campanha) || {};
        // A campanha do custo é o ID (utm_campaign={campaignid}). O tipo sai do
        // nome quando houver; ID puro conta como consultoria, que é a maior verba.
        return { ...c, leads: m.leads || 0, vendas: m.vendas || 0, tipo: /ead|curso/i.test(c.campanha) ? 'ead' : 'consultoria' };
      });
      const md = relatorioMarkdown({
        dia, geradoEm: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        campanhas, canais: d.canais, primeiraRespostaMin: d.primeira_resposta.mediana_min,
      });
      res.type('text/markdown').send(md);
    } catch (err) {
      console.error('Admin relatorio error:', err);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  });

  r.get('/api/admin/parceiros', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    try {
      const rows = await sql`
        SELECT p.id, p.codigo, p.token, p.nome, p.empresa, p.tipo, p.email, p.telefone, p.cidade, p.status, p.created_at,
               (SELECT COUNT(*) FROM parceiro_cliques c WHERE c.parceiro_id = p.id)::int AS cliques,
               (SELECT COUNT(*) FROM leads l WHERE l.parceiro_codigo = p.codigo AND l.source <> 'parceiro_cadastro')::int AS leads,
               (SELECT COUNT(*) FROM conversoes v WHERE v.parceiro_codigo = p.codigo AND v.evento = 'payment_succeeded')::int AS vendas,
               (SELECT COALESCE(SUM(valor), 0) FROM conversoes v WHERE v.parceiro_codigo = p.codigo AND v.evento = 'payment_succeeded')::float AS receita
          FROM parceiros p ORDER BY p.created_at DESC LIMIT 300`;
      res.json(rows);
    } catch (err) {
      console.error('Admin parceiros error:', err);
      res.status(500).json({ error: 'Erro ao listar parceiros' });
    }
  });

  r.patch('/api/admin/parceiros/:id', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });
    const id = parseInt(req.params.id, 10);
    const status = String((req.body && req.body.status) || '');
    if (!['pendente', 'ativo', 'inativo'].includes(status)) return res.status(400).json({ error: 'status: pendente, ativo ou inativo' });
    try {
      const rows = await sql`UPDATE parceiros SET status = ${status} WHERE id = ${id} RETURNING id, status`;
      if (!rows.length) return res.status(404).json({ error: 'Parceiro não encontrado' });
      res.json(rows[0]);
    } catch (err) {
      console.error('Admin parceiro update error:', err);
      res.status(500).json({ error: 'Erro ao atualizar parceiro' });
    }
  });

  // Exportação para o cockpit de prospecção (TODO-VALIDAR: esquema do cockpit).
  r.get('/api/admin/leads.csv', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).end();
    try {
      const rows = await sql`
        SELECT id, created_at, nome, empresa, cargo, email, telefone, interesse, source, canal, score,
               prazo, status, landing_page, utm_source, utm_medium, utm_campaign, parceiro_codigo, primeira_resposta_em
          FROM leads ORDER BY created_at DESC LIMIT 5000`;
      const cols = ['id', 'created_at', 'nome', 'empresa', 'cargo', 'email', 'telefone', 'interesse', 'source', 'canal', 'score',
        'prazo', 'status', 'landing_page', 'utm_source', 'utm_medium', 'utm_campaign', 'parceiro_codigo', 'primeira_resposta_em'];
      const campo = (v) => {
        let s = v == null ? '' : (v instanceof Date ? v.toISOString() : String(v));
        // Fórmula em planilha (=, +, -, @) vira texto: CSV injection.
        if (/^[=+\-@]/.test(s)) s = "'" + s;
        return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      res.set('Content-Disposition', 'attachment; filename="leads-anderstech.csv"');
      res.type('text/csv').send([cols.join(','), ...rows.map(r => cols.map(c => campo(r[c])).join(','))].join('\r\n'));
    } catch (err) {
      console.error('Admin leads.csv error:', err);
      res.status(500).end();
    }
  });

  // ── Descadastro em 1 clique (link no rodapé e cabeçalho List-Unsubscribe-Post) ──
  const paginaSimples = (titulo, texto, extra = '') => injectShared(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(titulo)} — Anders Tech</title><meta name="robots" content="noindex, nofollow"><link rel="stylesheet" href="/styles.css"></head><body><div id="shared-nav"></div><main style="max-width:640px;margin:0 auto;padding:120px 20px 80px"><h1 style="font-size:26px;margin-bottom:12px">${esc(titulo)}</h1><p>${texto}</p>${extra}</main><div id="shared-footer"></div></body></html>`, '/sair');

  async function descadastrar(tokenMsg) {
    if (!sql || !/^[a-f0-9]{36}$/.test(tokenMsg)) return false;
    const m = await sql`SELECT email FROM mensagens WHERE token = ${tokenMsg}`;
    if (!m.length || !m[0].email) return false;
    await suprimir(sql, m[0].email, 'descadastro em 1 clique');
    return true;
  }
  r.get('/sair/:token', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.type('html').send(paginaSimples('Não receber mais e-mails', 'Confirme com um clique e você não recebe mais nenhuma mensagem de divulgação da Anders Tech.',
      `<form method="post" action="/sair/${esc(req.params.token)}"><button type="submit" style="background:#d80a0a;color:#fff;border:0;padding:12px 20px;font:inherit;font-weight:700;cursor:pointer">Não quero mais receber</button></form>`));
  });
  r.post('/sair/:token', async (req, res) => {
    const ok = await descadastrar(String(req.params.token || '')).catch(() => false);
    res.set('Cache-Control', 'no-store');
    res.type('html').send(paginaSimples(ok ? 'Pronto' : 'Link inválido', ok ? 'Você não vai receber mais mensagens de divulgação. Se foi engano, é só responder um e-mail nosso.' : 'Este link não é válido. Responda um e-mail nosso pedindo para sair e fazemos à mão.'));
  });

  // ── Clique rastreado em e-mail: /m/<token>?u=<caminho interno> ──
  r.get('/m/:token', async (req, res) => {
    const u = String(req.query.u || '/');
    const destino = /^\/(?!\/)[^\s\\]*$/.test(u) ? u : '/';
    if (sql && /^[a-f0-9]{36}$/.test(req.params.token)) {
      sql`UPDATE mensagens SET cliques = cliques + 1, ultimo_clique_em = NOW() WHERE token = ${req.params.token}`.then(() => {}, () => {});
    }
    res.redirect(302, destino);
  });

  // ── WhatsApp Cloud API (mensagem recebida → lead) ──
  r.get('/api/whatsapp/webhook', (req, res) => {
    if (!whatsappConfigurado()) return res.sendStatus(503);
    const a = Buffer.from(String(req.query['hub.verify_token'] || '')), b = Buffer.from(process.env.WHATSAPP_VERIFY_TOKEN);
    if (req.query['hub.mode'] === 'subscribe' && a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return res.type('text').send(String(req.query['hub.challenge'] || ''));
    }
    res.sendStatus(403);
  });
  r.post('/api/whatsapp/webhook', async (req, res) => {
    if (!whatsappConfigurado()) return res.sendStatus(503);
    if (!assinaturaValida(req.rawBody, req.headers['x-hub-signature-256'])) return res.sendStatus(401);
    try {
      if (sql) await registrarRecebidas(sql, mensagensDoPayload(req.body));
      res.sendStatus(200);
    } catch (err) {
      console.error('[whatsapp] webhook:', err.message);
      res.sendStatus(500);
    }
  });

  // ── Admin: operação (outbound, fila, tarefas, posts, parceiros-alvo, mídia) ──
  r.get('/admin/operacao', (req, res) => res.sendFile(join(ADMIN_DIR, 'operacao.html')));

  r.get('/api/admin/operacao/estado', adminAuth, async (req, res) => {
    const ligado = (n) => !!process.env[n];
    const estado = {
      outbound: outboundAtivo(), regua: reguaAtiva(), whatsapp: whatsappConfigurado(), meta: metaConfigurada(),
      google_data_manager: dataManagerConfigurado(), microsoft_uet: uetConfigurado(), google_ads_custo: adsCustoConfigurado(),
      feed_csv: ligado('CONVERSOES_FEED_SENHA'), resend: ligado('RESEND_API_KEY'),
      objecoes: OBJECOES, fontes_posts: FONTES,
    };
    if (sql) {
      const [f, c] = await Promise.all([
        sql`SELECT tipo, status, COUNT(*)::int AS n FROM mensagens GROUP BY 1, 2`,
        sql`SELECT status, COUNT(*)::int AS n, COUNT(*) FILTER (WHERE email IS NOT NULL)::int AS com_email FROM outbound_contas GROUP BY 1`,
      ]);
      estado.fila = f; estado.contas = c;
    }
    res.json(estado);
  });

  r.get('/api/admin/operacao/contas', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    res.json(await sql`SELECT * FROM outbound_contas ORDER BY (status = 'novo') DESC, score DESC, km LIMIT 500`);
  });
  r.post('/api/admin/operacao/contas/sincronizar', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    try {
      const dist = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'distancias-passo-fundo.json'), 'utf8'));
      res.json(await sincronizarContas(sql, { registros: dadosPbqph().registros, municipios: dist.municipios }));
    } catch (err) {
      console.error('[outbound] sincronizar:', err.message);
      res.status(500).json({ error: 'Falha ao sincronizar: ' + err.message });
    }
  });
  r.post('/api/admin/operacao/contas/iniciar-lote', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const n = Math.min(Math.max(parseInt(req.body && req.body.n, 10) || 15, 1), 50);
    const alvo = await sql`SELECT cnpj FROM outbound_contas WHERE status = 'novo' AND email IS NOT NULL ORDER BY score DESC, km LIMIT ${n}`;
    const out = [];
    for (const a of alvo) out.push({ cnpj: a.cnpj, ...(await iniciarSequencia(sql, a.cnpj)) });
    res.json({ iniciadas: out.filter(o => o.ok).length, detalhes: out });
  });
  r.post('/api/admin/operacao/contas/:cnpj/iniciar', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const r2 = await iniciarSequencia(sql, String(req.params.cnpj));
    res.status(r2.erro ? 400 : 200).json(r2);
  });
  r.patch('/api/admin/operacao/contas/:cnpj', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const r2 = await mudarStatusConta(sql, String(req.params.cnpj), String((req.body || {}).status || ''), texto((req.body || {}).nota, 500));
    res.status(r2.erro ? 400 : 200).json(r2);
  });

  r.get('/api/admin/operacao/mensagens', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const tipo = ['outbound', 'regua', 'tarefa'].includes(req.query.tipo) ? req.query.tipo : null;
    const rows = tipo
      ? await sql`SELECT id, tipo, chave, ref_tipo, ref_id, email, params, agendada_para, status, enviada_em, cliques, erro FROM mensagens WHERE tipo = ${tipo} ORDER BY agendada_para DESC LIMIT 300`
      : await sql`SELECT id, tipo, chave, ref_tipo, ref_id, email, params, agendada_para, status, enviada_em, cliques, erro FROM mensagens ORDER BY agendada_para DESC LIMIT 300`;
    res.json(rows.map(m => (m.tipo === 'tarefa' ? { ...m, roteiro: roteiroLigacao(m.params || {}) } : m)));
  });
  r.post('/api/admin/operacao/mensagens/:id/:acao', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const novo = { cancelar: 'cancelada', feita: 'feita' }[req.params.acao];
    if (!novo) return res.status(400).json({ error: 'ação: cancelar ou feita' });
    const r2 = await sql`UPDATE mensagens SET status = ${novo}, enviada_em = CASE WHEN ${novo} = 'feita' THEN NOW() ELSE enviada_em END WHERE id = ${parseInt(req.params.id, 10)} AND status = 'agendada' RETURNING id`;
    res.json({ ok: r2.length > 0 });
  });

  r.get('/api/admin/operacao/posts', adminAuth, async (req, res) => {
    const pub = sql ? await sql`SELECT numero, publicado_em, url FROM posts_publicados` : [];
    const m = new Map(pub.map(p => [p.numero, p]));
    res.json(POSTS.map(p => ({ ...p, publicado: m.get(p.n) || null })));
  });
  r.post('/api/admin/operacao/posts/:n', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const n = parseInt(req.params.n, 10);
    if (!POSTS.some(p => p.n === n)) return res.status(404).json({ error: 'post não existe' });
    const url = texto((req.body || {}).url, 300);
    await sql`INSERT INTO posts_publicados (numero, url) VALUES (${n}, ${url}) ON CONFLICT (numero) DO UPDATE SET url = EXCLUDED.url, publicado_em = NOW()`;
    res.json({ ok: true });
  });

  r.get('/api/admin/operacao/parceiros-alvo', adminAuth, async (req, res) => {
    const st = sql ? await sql`SELECT chave, status, nota, atualizado_em FROM parceiros_alvo_status` : [];
    const m = new Map(st.map(s => [s.chave, s]));
    res.json(PARCEIROS_ALVO.map(p => ({ ...p, mensagem: mensagemParceiro(p), situacao: m.get(p.chave) || null })));
  });
  r.patch('/api/admin/operacao/parceiros-alvo/:chave', adminAuth, async (req, res) => {
    if (!sql) return res.status(503).json({ error: 'sem banco' });
    const chave = String(req.params.chave);
    const status = String((req.body || {}).status || '');
    if (!PARCEIROS_ALVO.some(p => p.chave === chave)) return res.status(404).json({ error: 'alvo não existe' });
    if (!['contatado', 'respondeu', 'parceiro', 'sem_interesse'].includes(status)) return res.status(400).json({ error: 'status inválido' });
    await sql`INSERT INTO parceiros_alvo_status (chave, status, nota) VALUES (${chave}, ${status}, ${texto((req.body || {}).nota, 500)})
              ON CONFLICT (chave) DO UPDATE SET status = EXCLUDED.status, nota = COALESCE(EXCLUDED.nota, parceiros_alvo_status.nota), atualizado_em = NOW()`;
    res.json({ ok: true });
  });

  r.get('/api/admin/midia/:arquivo', adminAuth, (req, res) => {
    const arquivos = csvsGoogleAdsEditor();
    const conteudo = arquivos[String(req.params.arquivo)];
    if (!conteudo) return res.status(404).json({ error: 'arquivos: ' + Object.keys(arquivos).join(', ') });
    res.set('Content-Disposition', `attachment; filename="${req.params.arquivo}"`);
    res.type('text/csv').send(conteudo);
  });

  return r;
}

// Rotinas em segundo plano. Cada uma só age com a credencial/flag dela.
export function iniciarDespachoConversoes(sqlCli) {
  if (!sqlCli) return;
  const contatoDe = contatoDaConversao(sqlCli);
  const loga = (nome) => (err) => console.error(`[rotina] ${nome}:`, err.message);
  setInterval(() => {
    if (metaConfigurada()) despacharMeta(sqlCli, contatoDe).catch(loga('meta'));
    if (dataManagerConfigurado()) despacharGoogle(sqlCli, contatoDe).catch(loga('google'));
    if (uetConfigurado()) despacharMicrosoft(sqlCli, contatoDe).catch(loga('microsoft'));
  }, 10 * 60_000).unref();
  setInterval(() => { processarFila(sqlCli, resend).catch(loga('fila')); }, 2 * 60_000).unref();
  setInterval(() => { if (adsCustoConfigurado()) importarCustoGoogleAds(sqlCli).catch(loga('custo google ads')); }, 6 * 3600_000).unref();
}

export { origemDoLead, decidir };
