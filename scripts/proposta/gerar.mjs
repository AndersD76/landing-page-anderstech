#!/usr/bin/env node
// ── Gerador de proposta comercial em PDF ─────────────────────────────────────
// Uso:  node scripts/proposta/gerar.mjs <dados.json> [saida.pdf] [--html]
//
// <dados.json> fica FORA do repositório (dados de cliente; o repo é público).
// --html grava também o HTML ao lado do PDF, para conferir no navegador.
// Versão editável no Word, do mesmo JSON: scripts/proposta/gerar_docx.py.
//
// Antes de imprimir, confere o que já saiu errado em proposta feita à mão
// (nov/2026): cronograma com 168 h e investimento cobrando 196 h, e CNPJ da
// Anders Tech digitado errado. Erro aqui para a geração.
//
// Navegador: o Chromium do Playwright; se não estiver baixado, o Edge ou o
// Chrome instalados.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { htmlProposta, rodapeTemplate, calcular, moeda } from './modelo.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const [entrada, saidaArg] = args.filter((a) => !a.startsWith('--'));
if (!entrada) {
  console.error('uso: node scripts/proposta/gerar.mjs <dados.json> [saida.pdf] [--html]');
  process.exit(2);
}
const saida = resolve(saidaArg || entrada.replace(/\.json$/i, '') + '.pdf');
const d = JSON.parse(readFileSync(entrada, 'utf8'));

// ── Conferências ──
export function cnpjValido(cnpj) {
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

// ── Recursos embutidos (o PDF não depende de nada instalado em quem abre) ──
const b64 = (p) => readFileSync(join(RAIZ, p)).toString('base64');
const fonte = (peso, arq) => `@font-face{font-family:'Poppins';font-weight:${peso};src:url(data:font/ttf;base64,${b64('assets/fonts/' + arq)}) format('truetype')}`;
const recursos = {
  fontesCss: [fonte(400, 'Poppins-Regular.ttf'), fonte(500, 'Poppins-Medium.ttf'), fonte(600, 'Poppins-SemiBold.ttf'), fonte(700, 'Poppins-Bold.ttf')].join(''),
  fontesCssRodape: [fonte(400, 'Poppins-Regular.ttf'), fonte(600, 'Poppins-SemiBold.ttf')].join(''),
  logoBranco: 'data:image/png;base64,' + b64('assets/logo-horizontal-white-2x.png'),
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
    margin: { top: '18mm', right: '20mm', bottom: '24mm', left: '20mm' },
  });
} finally {
  await navegador.close();
}
console.log(`PDF: ${saida}`);
console.log(`${c.totalHoras} h · ${moeda(c.total)}${c.avista ? ` · à vista ${moeda(c.avista)}` : ''} · ${basename(entrada)}`);
