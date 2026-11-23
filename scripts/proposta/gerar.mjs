#!/usr/bin/env node
// ── Gerador de proposta comercial em PDF ─────────────────────────────────────
// Uso:
//   node scripts/proposta/gerar.mjs <dados.json> [saida.pdf] [--html] [--registrar]
//
// <dados.json> fica FORA do repositório (dados de cliente; o repo é público).
// --html       grava também o HTML ao lado do PDF, para conferir no navegador.
// --registrar  cria o código do QR em https://anderstech.net/api/admin/artifacts
//              (precisa de ADMIN_KEY no ambiente) e grava o código no JSON, para
//              a mesma proposta manter o mesmo QR quando for gerada de novo.
//
// Antes de imprimir, confere o que já saiu errado em proposta feita à mão
// (nov/2026): cronograma com 168 h e investimento cobrando 196 h, e CNPJ da
// Anders Tech digitado errado. Erro aqui para a geração.
//
// Navegador: o Chromium do Playwright; se não estiver baixado, o Edge ou o
// Chrome instalados. QR: módulo `qrcode` do Python (pip install qrcode).

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { htmlProposta, rodapeTemplate, calcular, moeda } from './modelo.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [entrada, saidaArg] = args.filter((a) => !a.startsWith('--'));
if (!entrada) {
  console.error('uso: node scripts/proposta/gerar.mjs <dados.json> [saida.pdf] [--html] [--registrar]');
  process.exit(2);
}
const saida = resolve(saidaArg || entrada.replace(/\.json$/i, '') + '.pdf');
const d = JSON.parse(readFileSync(entrada, 'utf8'));

// ── Conferências ──
function cnpjValido(cnpj) {
  const n = String(cnpj).replace(/\D/g, '');
  if (n.length !== 14 || /^(\d)\1+$/.test(n)) return false;
  const dv = (b, p) => { const r = b.split('').reduce((t, x, i) => t + Number(x) * p[i], 0) % 11; return r < 2 ? 0 : 11 - r; };
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = dv(n.slice(0, 12), p1);
  return n.endsWith(`${d1}${dv(n.slice(0, 12) + d1, [6, ...p1])}`);
}
const erros = [];
const c = calcular(d);
for (const [quem, p] of [['contratado', d.contratado], ['contratante', d.contratante]]) {
  if (!cnpjValido(p.cnpj)) erros.push(`CNPJ do ${quem} não passa no dígito verificador: ${p.cnpj}`);
}
if (d.investimento.totalEsperado != null && Math.abs(c.total - d.investimento.totalEsperado) > 0.009) {
  erros.push(`o cronograma soma ${c.totalHoras} h (${moeda(c.total)}), mas o investimento combinado é ${moeda(d.investimento.totalEsperado)}`);
}
const parc = d.pagamento.parcelado;
if (parc) {
  const soma = parc.parcelas.reduce((s, x) => s + x.valor, 0);
  if (Math.abs(soma - c.total) > 0.009) erros.push(`as parcelas somam ${moeda(soma)}, mas o total é ${moeda(c.total)}`);
  const datas = parc.parcelas.map((x) => x.vencimento);
  if (datas.some((x, i) => i && x <= datas[i - 1])) erros.push('vencimentos das parcelas fora de ordem');
}
if (d.validade < d.data) erros.push('validade anterior à data da proposta');
if (d.pagamento.avista && d.pagamento.avista.ate > d.validade) erros.push('desconto à vista vale além da validade da proposta');
if (JSON.stringify(d).includes('[PREENCHER')) erros.push('ainda há [PREENCHER] nos dados');
if (erros.length) {
  console.error('Proposta NÃO gerada:\n- ' + erros.join('\n- '));
  process.exit(1);
}

// ── Código do QR (SPEC-RODAPE-ARTEFATOS.md) ──
d.artefato = d.artefato || {};
if (!d.artefato.codigo && flags.has('--registrar')) {
  if (!process.env.ADMIN_KEY) { console.error('--registrar precisa de ADMIN_KEY no ambiente'); process.exit(2); }
  const r = await fetch('https://anderstech.net/api/admin/artifacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.ADMIN_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo: 'proposta', destino: d.artefato.destino || 'https://anderstech.net', label: `${d.numero} - ${d.contratante.fantasia || d.contratante.razaoSocial}`, criado_por: 'gerar.mjs' }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.codigo) { console.error('registro do QR falhou:', r.status, j.error || ''); process.exit(1); }
  d.artefato.codigo = j.codigo;
  const original = JSON.parse(readFileSync(entrada, 'utf8'));
  original.artefato = { ...(original.artefato || {}), codigo: j.codigo };
  writeFileSync(entrada, JSON.stringify(original, null, 2) + '\n');
  console.log('QR registrado:', j.url_completa);
}
if (d.artefato.codigo) {
  if (!/^p[abcdefghjkmnpqrstuvwxyz23456789]{7}$/.test(d.artefato.codigo)) { console.error('código de QR inválido:', d.artefato.codigo); process.exit(1); }
  d.artefato.url = `https://anderstech.net/r/${d.artefato.codigo}`;
  d.artefato.legenda = d.artefato.legenda || 'Cases, prazos e como trabalho';
} else {
  // Sem código registrado o scan não é medido; o QR leva ao site, sem UTM.
  console.warn('aviso: proposta sem código de QR registrado (use --registrar com ADMIN_KEY); o QR aponta para anderstech.net e o scan não é medido');
  d.artefato.url = 'https://anderstech.net';
  d.artefato.legenda = 'Conheça a Anders Tech';
}

function qrSvg(url) {
  const py = [
    'import sys, qrcode, qrcode.image.svg',
    'q = qrcode.QRCode(version=3, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=0, image_factory=qrcode.image.svg.SvgPathImage)',
    'q.add_data(sys.argv[1]); q.make(fit=False)',
    'img = q.make_image(fill_color="#0B1730", back_color="white")',
    'sys.stdout.write(img.to_string(encoding="unicode"))',
  ].join('\n');
  const r = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-I', '-c', py, url], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error('QR: ' + (r.stderr || r.error?.message || 'python indisponível'));
  // Navy da spec nos módulos, fundo branco puro; tira tamanho fixo para escalar a 20 mm.
  return r.stdout.replace(/<\?xml[^>]*>/, '').replace(/\swidth="[^"]*"|\sheight="[^"]*"/g, '').replace(/fill="#000000"|fill="black"/g, 'fill="#0B1730"');
}

// ── Recursos embutidos (o PDF não depende de nada instalado em quem abre) ──
const b64 = (p) => readFileSync(join(RAIZ, p)).toString('base64');
const fonte = (peso, arq) => `@font-face{font-family:'Poppins';font-weight:${peso};src:url(data:font/ttf;base64,${b64('assets/fonts/' + arq)}) format('truetype')}`;
const recursos = {
  fontesCss: [fonte(400, 'Poppins-Regular.ttf'), fonte(500, 'Poppins-Medium.ttf'), fonte(600, 'Poppins-SemiBold.ttf'), fonte(700, 'Poppins-Bold.ttf')].join(''),
  fontesCssRodape: [fonte(400, 'Poppins-Regular.ttf'), fonte(500, 'Poppins-Medium.ttf'), fonte(600, 'Poppins-SemiBold.ttf')].join(''),
  logoBranco: 'data:image/png;base64,' + b64('assets/logo-horizontal-white-2x.png'),
  qrSvg: qrSvg(d.artefato.url),
};

const html = htmlProposta(d, recursos);
if (flags.has('--html')) writeFileSync(saida.replace(/\.pdf$/i, '.html'), html);

async function abrirNavegador() {
  for (const opcoes of [{}, { channel: 'msedge' }, { channel: 'chrome' }]) {
    try { return await chromium.launch(opcoes); } catch { /* tenta o próximo */ }
  }
  throw new Error('nenhum navegador Chromium disponível (npx playwright install chromium)');
}
const navegador = await abrirNavegador();
try {
  const pagina = await navegador.newPage();
  await pagina.setContent(html, { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.pdf({
    path: saida, format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: rodapeTemplate(d, recursos),
    margin: { top: '16mm', right: '20mm', bottom: '34mm', left: '20mm' },
  });
} finally {
  await navegador.close();
}
console.log(`PDF: ${saida}`);
console.log(`${c.totalHoras} h · ${moeda(c.total)}${c.avista ? ` · à vista ${moeda(c.avista)}` : ''} · QR → ${d.artefato.url} · ${basename(entrada)}`);
