// ── Consultoria contratada e paga pelo site ───────────────────────────────────
// Decisão do Anders em 18/11/2026: o cliente calcula o preço, aceita o contrato
// e paga (Pix, cartão ou boleto) sem passar pelo WhatsApp. O preço sai SEMPRE de
// consultoria/preco.js no servidor; a tela só mostra.
//
// Rotas
//   GET  /api/consultoria/catalogo           serviços, cidades atendidas, se a venda está ligada
//   POST /api/consultoria/simular            preço + opções de pagamento
//   POST /api/consultoria/pedido             aceite + cobrança no Asaas
//   GET  /api/consultoria/pedido/:id         status (polling do Pix), exige token
//   GET  /contrato-consultoria               texto do contrato (o que o cliente aceita)
//   GET  /contrato-consultoria/:id.pdf       contrato preenchido, só depois do pagamento
// O webhook do Asaas é um só (ead/routes.js) e repassa para tratarWebhookConsultoria.

import { Router } from 'express';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';
import * as asaas from '../ead/asaas.js';
import { calculaPreco, opcoesPagamento, opcaoEscolhida, SERVICOS, DISTANCIA_MAXIMA } from './preco.js';
import { CONTRATO_VERSAO, contratoHTML, contratoPDF, contratadaCompleta } from './contrato.js';
import { injectShared } from '../inject.js';
import { EMPRESA } from '../config/empresa.js';
import { consultoriaNovoPedido, consultoriaPagoAnders, consultoriaPagoCliente, consultoriaStatus } from '../emails.js';
import { registrarConversao } from '../growth/conversoes.js';
import { origemDoLead, registrarLeadDeOrigem, marcarLeadGanho } from '../growth/leads.js';
import { pagamentoConfere } from '../growth/pagamento.js';
import { aoCheckout, aoCobrancaVencida, aoConsultoriaPaga } from '../growth/mensageria.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_URL = process.env.APP_URL || 'https://anderstech.net';
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const DIST = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'distancias-passo-fundo.json'), 'utf8'));
const CIDADES = new Map(DIST.municipios.map((m) => [m.ibge, m]));

// Ligada quando: dados da CONTRATADA preenchidos (sem eles o contrato sai com
// [PREENCHER]), Asaas configurado, e ninguém desligou por env.
export function vendaAtiva() {
  return process.env.CONSULTORIA_VENDA_ATIVA !== 'false' && contratadaCompleta() && asaas.asaasConfigurado();
}

export const router = Router();

// ── Limite por IP (mesmo padrão do EAD) ──
const tentativas = new Map();
setInterval(() => {
  const agora = Date.now();
  for (const [k, v] of tentativas) if (agora - v.start > 60 * 60_000) tentativas.delete(k);
}, 10 * 60_000).unref();
function limite(max) {
  return (req, res, next) => {
    const key = req.ip + ':' + max;
    const now = Date.now();
    const e = tentativas.get(key);
    if (e && now - e.start < 60 * 60_000) {
      if (e.count >= max) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
      e.count++;
    } else {
      tentativas.set(key, { start: now, count: 1 });
    }
    next();
  };
}

function precoDoCorpo(b = {}) {
  const cidade = CIDADES.get(String(b.cidade || ''));
  if (!cidade) {
    return { erro: `Atendemos empresas a até ${DISTANCIA_MAXIMA} km de Passo Fundo pela estrada. Se a sua cidade não aparece na lista, fale com a gente no WhatsApp.`, foraDaArea: true };
  }
  const preco = calculaPreco({
    servico: b.servico, funcionarios: b.funcionarios, km: cidade.km,
    temProjeto: b.temProjeto === true, meses: b.meses,
  });
  return preco.erro ? preco : { ...preco, cidade };
}

router.get('/api/consultoria/catalogo', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({
    ativa: vendaAtiva(),
    contratoVersao: CONTRATO_VERSAO,
    whatsapp: EMPRESA.whatsapp,
    distanciaMaxima: DISTANCIA_MAXIMA,
    servicos: SERVICOS.map(({ slug, nome, horas, tipo, perguntaProjeto, prazos }) => ({ slug, nome, horas, tipo, perguntaProjeto: Boolean(perguntaProjeto), prazos: prazos || null })),
    cidades: DIST.municipios.map(({ ibge, nome, uf }) => ({ ibge, nome, uf })),
  });
});

router.post('/api/consultoria/simular', limite(300), (req, res) => {
  const p = precoDoCorpo(req.body);
  if (p.erro) return res.status(400).json({ error: p.erro, foraDaArea: Boolean(p.foraDaArea) });
  res.json({ preco: p, opcoes: opcoesPagamento(p) });
});

// ── Validação dos dados do contrato ──
const so = (v) => String(v || '').replace(/\D/g, '');
const texto = (v, max = 160) => String(v || '').trim().replace(/\s+/g, ' ').slice(0, max);

export function validaContratante(b = {}) {
  const e = b.empresa || {}, r = b.representante || {};
  const d = {
    razaoSocial: texto(e.razaoSocial), cnpj: so(e.cnpj), endereco: texto(e.endereco, 200), cep: so(e.cep),
    representante: texto(r.nome, 120), cargo: texto(r.cargo, 80), cpf: so(r.cpf),
    email: texto(b.email, 160).toLowerCase(), telefone: so(b.telefone),
  };
  if (d.razaoSocial.length < 3) return { erro: 'Informe a razão social da empresa.' };
  if (d.cnpj.length !== 14 || !asaas.docValido(d.cnpj)) return { erro: 'CNPJ inválido.' };
  if (d.endereco.length < 8) return { erro: 'Informe o endereço da empresa (rua, número e bairro).' };
  if (d.cep.length !== 8) return { erro: 'CEP inválido.' };
  if (d.representante.split(' ').length < 2) return { erro: 'Informe o nome completo de quem assina pela empresa.' };
  if (d.cargo.length < 2) return { erro: 'Informe o cargo de quem assina.' };
  if (d.cpf.length !== 11 || !asaas.docValido(d.cpf)) return { erro: 'CPF de quem assina inválido.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return { erro: 'E-mail inválido.' };
  if (d.telefone.length < 10 || d.telefone.length > 11) return { erro: 'Telefone inválido: use DDD + número.' };
  return d;
}

const fmtCnpj = (c) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
const fmtCpf = (c) => c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
const fmtCep = (c) => c.replace(/^(\d{5})(\d{3})$/, '$1-$2');
const fmtTel = (t) => t.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
const BILLING = { pix: 'PIX', cartao: 'CREDIT_CARD', boleto: 'BOLETO' };

router.post('/api/consultoria/pedido', limite(10), async (req, res) => {
  if (!vendaAtiva()) {
    return res.status(503).json({ error: 'A contratação online ainda não está liberada. Fale com a gente no WhatsApp.' });
  }
  if (!sql) return res.status(503).json({ error: 'Serviço temporariamente indisponível' });

  const b = req.body || {};
  if (b.aceite !== true) return res.status(400).json({ error: 'É preciso aceitar o contrato para contratar.' });
  if (b.contratoVersao !== CONTRATO_VERSAO) return res.status(409).json({ error: 'O contrato foi atualizado. Recarregue a página e leia a versão nova.' });

  const preco = precoDoCorpo(b);
  if (preco.erro) return res.status(400).json({ error: preco.erro });
  const opcao = opcaoEscolhida(preco, b.metodo, b.parcelas);
  if (!opcao) return res.status(400).json({ error: 'Forma de pagamento inválida.' });
  const c = validaContratante(b);
  if (c.erro) return res.status(400).json({ error: c.erro });

  try {
    const token = crypto.randomBytes(24).toString('hex');
    const origem = origemDoLead(req, {});
    const [pedido] = await sql`
      INSERT INTO consultoria_pedidos (
        token, servico, servico_nome, tipo, horas, horas_totais, meses, funcionarios, cidade_ibge, km, tem_projeto,
        base, acrescimos, pct_total, total, metodo, parcelas, valor_parcela, total_pago,
        razao_social, cnpj, endereco, cidade, uf, cep, representante, cargo, cpf, email, telefone,
        contrato_versao, aceite_em, aceite_ip,
        atribuicao, canal, consent_marketing, parceiro_codigo
      ) VALUES (
        ${token}, ${preco.servico}, ${preco.nome}, ${preco.tipo}, ${preco.horas}, ${preco.horasTotais}, ${preco.meses}, ${preco.funcionarios},
        ${preco.cidade.ibge}, ${preco.km}, ${preco.temProjeto}, ${preco.base}, ${JSON.stringify(preco.acrescimos)}, ${preco.pctTotal}, ${preco.total},
        ${opcao.metodo}, ${opcao.parcelas}, ${opcao.valorParcela}, ${opcao.total},
        ${c.razaoSocial}, ${fmtCnpj(c.cnpj)}, ${c.endereco}, ${preco.cidade.nome}, ${preco.cidade.uf}, ${fmtCep(c.cep)},
        ${c.representante}, ${c.cargo}, ${fmtCpf(c.cpf)}, ${c.email}, ${fmtTel(c.telefone)},
        ${CONTRATO_VERSAO}, NOW(), ${req.ip || null},
        ${origem.atribuicao ? JSON.stringify(origem.atribuicao) : null}::jsonb, ${origem.canal}, ${origem.consent_marketing}, ${origem.parceiro_codigo}
      ) RETURNING *
    `;
    // Pedido também é lead (caixa única) e início de checkout (livro de conversões).
    await registrarConversao(sql, { evento: 'checkout_started', refTipo: 'consultoria_pedido', refId: pedido.id, valor: opcao.total, origem });
    await registrarLeadDeOrigem(sql, {
      origem, source: 'contratar_pedido', nome: c.representante, empresa: c.razaoSocial, email: c.email, telefone: c.telefone,
      cargo: c.cargo, interesse: `Consultoria: ${preco.nome}`, mensagem: `Pedido nº ${pedido.id} · ${opcao.metodo} ${opcao.parcelas}x · R$ ${opcao.total}`,
      refTipo: 'consultoria_pedido', refId: pedido.id, funcionarios: preco.funcionarios, valor: opcao.total,
    });

    let cobranca, qr = null;
    try {
      const cliente = await asaas.criarCliente({ nome: c.razaoSocial, email: c.email, cpfCnpj: c.cnpj, telefone: c.telefone });
      cobranca = await asaas.criarCobranca({
        customerId: cliente.id,
        valor: opcao.total,
        parcelas: opcao.parcelas,
        valorParcela: opcao.valorParcela,
        billingType: BILLING[opcao.metodo],
        referencia: `cons-pedido-${pedido.id}`,
        descricao: `Consultoria ${preco.nome} — pedido ${pedido.id}${opcao.parcelas > 1 ? ` (${opcao.parcelas} parcelas)` : ''}`,
      });
      if (opcao.metodo === 'pix') qr = await asaas.obterQrCodePix(cobranca.id);
      await sql`
        UPDATE consultoria_pedidos SET
          asaas_customer_id = ${cliente.id}, asaas_payment_id = ${String(cobranca.id)},
          asaas_installment_id = ${cobranca.installment ? String(cobranca.installment) : null},
          asaas_invoice_url = ${cobranca.invoiceUrl || null},
          pix_qr_code = ${qr?.payload || null}, pix_qr_code_base64 = ${qr?.encodedImage || null}
        WHERE id = ${pedido.id}
      `;
    } catch (err) {
      await sql`UPDATE consultoria_pedidos SET status = 'erro' WHERE id = ${pedido.id}`;
      throw err;
    }

    avisaAnders(`Novo pedido de consultoria nº ${pedido.id} — ${preco.nome} (aguardando pagamento)`, consultoriaNovoPedido(pedido));
    await aoCheckout(sql, { refTipo: 'consultoria_pedido', refId: pedido.id, email: c.email, produto: 'Consultoria ' + preco.nome,
      fatura: cobranca.invoiceUrl || null, voltar: '/contratar' }).catch(e => console.error('[regua] checkout consultoria:', e.message));

    if (opcao.metodo === 'pix') {
      return res.json({ ok: true, status: 'pix_pending', pedidoId: pedido.id, token, qr_code: qr?.payload, qr_code_base64: qr?.encodedImage });
    }
    return res.json({ ok: true, status: 'redirect', pedidoId: pedido.id, token, url: cobranca.invoiceUrl });
  } catch (err) {
    console.error('[consultoria] pedido:', err.message);
    res.status(502).json({ error: 'Não foi possível gerar a cobrança. Tente novamente ou fale com a gente no WhatsApp.' });
  }
});

async function pedidoComToken(id, token) {
  if (!sql || !token) return null;
  const rows = await sql`SELECT * FROM consultoria_pedidos WHERE id = ${parseInt(id, 10) || 0}`;
  const p = rows[0];
  if (!p) return null;
  const a = Buffer.from(String(token)), b2 = Buffer.from(p.token);
  return a.length === b2.length && crypto.timingSafeEqual(a, b2) ? p : null;
}

router.get('/api/consultoria/pedido/:id', async (req, res) => {
  try {
    const p = await pedidoComToken(req.params.id, req.query.t);
    if (!p) return res.status(404).json({ error: 'Pedido não encontrado' });
    res.json({ status: p.status, metodo: p.metodo, invoice_url: p.status === 'pendente' ? p.asaas_invoice_url : null });
  } catch (err) {
    console.error('[consultoria] status:', err.message);
    res.status(500).json({ error: 'Erro ao consultar o pedido' });
  }
});

// ── Contrato ──
const SITE = 'https://anderstech.net';
let paginaContrato = null;
router.get('/contrato-consultoria', (req, res) => {
  if (!paginaContrato) {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Contrato de Prestação de Serviços de Consultoria — Anders Tech</title>
<meta name="description" content="Contrato que o cliente aceita ao contratar consultoria da Anders Tech pelo site: objeto, preço, pagamento, prazos, cancelamento e foro." />
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${SITE}/contrato-consultoria" />
<meta property="og:url" content="${SITE}/contrato-consultoria" />
<link rel="stylesheet" href="/styles.css">
<link rel="icon" href="/assets/favicon.png" type="image/png" />
<style>
.contrato{max-width:860px;margin:0 auto;padding:clamp(28px,5vw,56px) clamp(16px,5vw,48px) 64px;color:#16233f;line-height:1.7}
.contrato h1{font-family:var(--ff-display,system-ui);font-size:clamp(1.5rem,4vw,2.1rem);color:#203864;line-height:1.2;margin-bottom:6px}
.contrato .versao{font-size:.85rem;color:#8190ac;margin-bottom:28px}
.contrato h2{font-size:1.08rem;color:#203864;margin:30px 0 10px;padding-left:16px;position:relative}
.contrato h2::before{content:"";position:absolute;left:0;top:.45em;width:7px;height:7px;background:#FE0000;transform:rotate(45deg)}
.contrato p,.contrato li{font-size:.97rem;color:#46577a;margin-bottom:10px}
.contrato strong{color:#16233f}
.contrato ol{padding-left:22px}
.contrato .tabela{overflow-x:auto;margin:6px 0 14px}
.contrato table{border-collapse:collapse;width:100%;font-size:.9rem;background:#fff}
.contrato th,.contrato td{text-align:left;padding:8px 10px;border-bottom:1px solid rgba(32,56,100,.14);vertical-align:top}
.contrato th{background:#F4F6FA;color:#203864}
</style>
</head>
<body>
<div id="shared-nav"></div>
<main class="contrato">
<h1>Contrato de Prestação de Serviços de Consultoria</h1>
<p class="versao">Versão ${CONTRATO_VERSAO}. Vale para todos os serviços de consultoria contratados pelo site. Os dados da empresa, o serviço, o preço e a forma de pagamento entram a partir do resumo do pedido, e o contrato preenchido é enviado por e-mail depois do pagamento.</p>
${contratoHTML(null)}
</main>
<div id="shared-footer"></div>
</body>
</html>`;
    paginaContrato = injectShared(html, '/contrato-consultoria');
  }
  res.type('html').send(paginaContrato);
});

function dadosContrato(p) {
  return {
    contratante: {
      razaoSocial: p.razao_social, cnpj: p.cnpj, endereco: p.endereco, cidade: p.cidade, uf: p.uf, cep: p.cep,
      representante: p.representante, cargo: p.cargo, cpf: p.cpf, email: p.email, telefone: p.telefone,
    },
    pedido: {
      id: p.id, servicoNome: p.servico_nome, tipo: p.tipo, horas: p.horas, horasTotais: p.horas_totais, meses: p.meses,
      base: Number(p.base), acrescimos: typeof p.acrescimos === 'string' ? JSON.parse(p.acrescimos) : p.acrescimos,
      total: Number(p.total), funcionarios: p.funcionarios, km: p.km,
      perguntaProjeto: Boolean(SERVICOS.find((s) => s.slug === p.servico)?.perguntaProjeto), temProjeto: p.tem_projeto,
      metodo: p.metodo, parcelas: p.parcelas, valorParcela: Number(p.valor_parcela), totalPago: Number(p.total_pago),
      versao: p.contrato_versao, aceiteEm: p.aceite_em, aceiteIp: p.aceite_ip || 'não registrado', pagoEm: p.pago_em,
    },
  };
}

const PAGOS = new Set(['aprovado', 'estornado', 'estornado_parcial', 'chargeback', 'chargeback_disputa', 'estorno_em_andamento']);

router.get('/contrato-consultoria/:id.pdf', async (req, res) => {
  try {
    const p = await pedidoComToken(req.params.id, req.query.t);
    // Contrato preenchido só existe depois do pagamento (decisão do Anders).
    if (!p || !p.pago_em || !PAGOS.has(p.status)) return res.status(404).send('Contrato não encontrado');
    const pdf = await contratoPDF(dadosContrato(p));
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="contrato-anders-tech-${p.id}.pdf"` });
    res.send(pdf);
  } catch (err) {
    console.error('[consultoria] pdf:', err.message);
    res.status(500).send('Erro ao gerar o contrato');
  }
});

// ── E-mails ──
function avisaAnders(assunto, html, anexos) {
  if (!resend) return Promise.resolve();
  return resend.emails.send({
    from: `Anders Tech <${EMPRESA.emailRemetente}>`, to: EMPRESA.email, subject: assunto, html,
    attachments: anexos,
  }).catch((e) => console.error('[consultoria] e-mail Anders:', e.message));
}

async function enviaContrato(p) {
  const pdf = await contratoPDF(dadosContrato(p));
  const anexo = [{ filename: `contrato-anders-tech-${p.id}.pdf`, content: pdf }];
  const link = `${APP_URL}/contrato-consultoria/${p.id}.pdf?t=${p.token}`;
  if (resend) {
    await resend.emails.send({
      from: `Anders Tech <${EMPRESA.emailRemetente}>`, to: p.email, replyTo: EMPRESA.email,
      subject: `Pagamento confirmado — ${p.servico_nome} (pedido nº ${p.id})`,
      html: consultoriaPagoCliente(p, link), attachments: anexo,
    });
  }
  await avisaAnders(`Consultoria paga: pedido nº ${p.id} — ${p.servico_nome}`, consultoriaPagoAnders(p), anexo);
}

// ── Webhook (chamado por ead/routes.js, que já autenticou o token do Asaas) ──
// Devolve true quando o evento era de consultoria.
export async function tratarWebhookConsultoria(event, payment) {
  if (!sql || !payment) return false;
  const ref = String(payment.externalReference || '');
  let rows = [];
  if (ref.startsWith('cons-pedido-')) {
    rows = await sql`SELECT * FROM consultoria_pedidos WHERE id = ${parseInt(ref.slice(12), 10) || 0}`;
  } else if (payment.installment) {
    // Parcela sem referência própria: acha o pedido pelo parcelamento.
    rows = await sql`SELECT * FROM consultoria_pedidos WHERE asaas_installment_id = ${String(payment.installment)}`;
  }
  if (!rows.length) return ref.startsWith('cons-pedido-');
  const p = rows[0];

  const { status, libera, revoga } = asaas.traduzEvento(event);
  if (!status) return true;

  if (libera) {
    // Parcelas seguintes também chegam como pagas: o pedido já está aprovado.
    if (p.status === 'aprovado') return true;
    // Confere na API do Asaas antes de aprovar (growth/pagamento.js).
    const conf = await pagamentoConfere(payment, {
      referencia: `cons-pedido-${p.id}`,
      installment: p.asaas_installment_id,
      valorMinimo: Number(p.parcelas) > 1 ? p.valor_parcela : p.total_pago,
    }, asaas.obterCobranca);
    if (!conf.ok) {
      console.error(`[consultoria] webhook NÃO conferiu, pedido ${p.id}: ${conf.motivo}`);
      await avisaAnders(`ATENÇÃO: pagamento do pedido nº ${p.id} não conferiu`, `<p>O webhook do Asaas avisou pagamento do pedido nº ${p.id}, mas a consulta à API não confirmou: ${conf.motivo}. Nada foi liberado. Confira no painel do Asaas.</p>`);
      return true;
    }
    const [atual] = await sql`
      UPDATE consultoria_pedidos SET status = 'aprovado', pago_em = NOW()
      WHERE id = ${p.id} AND status <> 'aprovado' RETURNING *
    `;
    if (!atual) return true; // outra entrega do mesmo evento chegou antes
    // Venda = webhook conferido. Valor = total contratado (não só a 1ª parcela).
    await registrarConversao(sql, {
      evento: 'payment_succeeded', refTipo: 'consultoria_pedido', refId: p.id, valor: p.total_pago,
      origem: { canal: p.canal, atribuicao: p.atribuicao, parceiro_codigo: p.parceiro_codigo, consent_marketing: p.consent_marketing },
    });
    await marcarLeadGanho(sql, 'consultoria_pedido', p.id);
    await aoConsultoriaPaga(sql, { refId: p.id, email: p.email }).catch(e => console.error('[regua] indicação:', e.message));
    try {
      await enviaContrato(atual);
      await sql`UPDATE consultoria_pedidos SET contrato_enviado_em = NOW() WHERE id = ${p.id}`;
    } catch (e) {
      console.error('[consultoria] envio do contrato:', e.message);
    }
    return true;
  }

  if (revoga) {
    await sql`UPDATE consultoria_pedidos SET status = ${status} WHERE id = ${p.id}`;
    await avisaAnders(`Pedido de consultoria nº ${p.id}: ${status}`, consultoriaStatus(p, status));
    return true;
  }

  // Vencido/estorno em andamento etc.: só muda o status de quem ainda não pagou.
  if (p.status === 'pendente') {
    await sql`UPDATE consultoria_pedidos SET status = ${status} WHERE id = ${p.id}`;
    if (status === 'vencido') {
      await aoCobrancaVencida(sql, { refTipo: 'consultoria_pedido', refId: p.id, email: p.email, produto: 'Consultoria ' + p.servico_nome, fatura: p.asaas_invoice_url })
        .catch(e => console.error('[regua] vencida consultoria:', e.message));
    }
  }
  return true;
}
