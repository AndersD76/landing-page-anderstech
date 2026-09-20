import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizaRegistro, agrupaPorMunicipio, nomeMunicipio, slug, capitaliza, corrigeTexto, parseDataBR, GATE_MUNICIPIO } from '../pbqph/normaliza.js';
import { dados, urlsIndexaveis, organismos, GATE_ORGANISMO } from '../pbqph/dados.js';
import { renderMunicipio, renderUf, renderHub, renderCertificadora } from '../pbqph/render.js';

const FUTURO = '31/12/2030';
const PASSADO = '01/01/2020';

function bruto(over = {}) {
  return { empresa: 'CONSTRUTORA EXEMPLO LTDA', cnpj: '00.000.000/0001-00', uf: 'RS', municipio: 'PASSO FUNDO', nivel: 'A', sub: 'OBRAS DE EDIFICAÇÕES.', oc: 'SAS', validade: FUTURO, emissao: '01/01/2024', ...over };
}

test('registro sem validade não publica — fonte incompleta exclui, não inventa', () => {
  assert.equal(normalizaRegistro(bruto({ validade: '' })), null);
  assert.equal(normalizaRegistro(bruto({ validade: 'sem data' })), null);
});

test('expirado e suspenso ficam de fora', () => {
  assert.equal(normalizaRegistro(bruto({ validade: PASSADO })), null);
  assert.equal(normalizaRegistro(bruto({ suspensao: 'SIM' })), null);
});

test('UF inválida é descartada, não corrigida por adivinhação', () => {
  assert.equal(normalizaRegistro(bruto({ uf: 'XXX' })), null);
  assert.equal(normalizaRegistro(bruto({ uf: '' })), null);
});

test('campos de contato nunca chegam ao registro publicável', () => {
  const r = normalizaRegistro(bruto({ telefone: '54999999999', 'e-mail': 'x@y.com', endereco: 'Rua X', cep: '99000-000' }));
  for (const proibido of ['telefone', 'e-mail', 'endereco', 'cep']) {
    assert.equal(proibido in r, false, `${proibido} vazou para a página`);
  }
});

test('município com e sem UF colada é a mesma cidade', () => {
  assert.equal(nomeMunicipio('CURITIBA'), 'CURITIBA');
  assert.equal(nomeMunicipio('CURITIBA/PR'), 'CURITIBA');
  assert.equal(nomeMunicipio('curitiba - PR'), 'CURITIBA');
});

test('mojibake latin-1 é desfeito', () => {
  // O mojibake é gerado pelo mesmo caminho que a fonte produz — bytes UTF-8
  // lidos como latin-1 — em vez de escrito à mão, que é onde erra.
  const estragado = Buffer.from('OSÓRIO', 'utf8').toString('latin1');
  assert.notEqual(estragado, 'OSÓRIO', 'fixture não ficou corrompida');
  assert.equal(corrigeTexto(estragado), 'OSÓRIO');
  assert.equal(corrigeTexto('SAO PAULO'), 'SAO PAULO');
  assert.equal(corrigeTexto('Osório'), 'Osório', 'texto já correto não é estragado');
});

test('acento sobrevive no título e some no slug', () => {
  const r = normalizaRegistro(bruto({ municipio: 'SÃO LEOPOLDO' }));
  assert.equal(r.municipio_titulo, 'São Leopoldo');
  assert.equal(r.municipio_slug, 'sao-leopoldo');
  assert.equal(slug('Bento Gonçalves'), 'bento-goncalves');
});

test('capitaliza sem gritar e sem maiúscula em preposição', () => {
  assert.equal(capitaliza('OBRAS DE EDIFICAÇÕES'), 'Obras de Edificações');
});

test('parseDataBR rejeita lixo', () => {
  assert.equal(parseDataBR('31/12/2030').getUTCFullYear(), 2030);
  assert.equal(parseDataBR('2030-12-31'), null);
  assert.equal(parseDataBR(''), null);
});

test(`gate: município com menos de ${GATE_MUNICIPIO} não é publicável`, () => {
  const poucos = Array.from({ length: GATE_MUNICIPIO - 1 }, (_, i) => normalizaRegistro(bruto({ empresa: `EMPRESA ${i}` })));
  const bastantes = Array.from({ length: GATE_MUNICIPIO }, (_, i) => normalizaRegistro(bruto({ empresa: `EMPRESA ${i}` })));
  assert.equal(agrupaPorMunicipio(poucos)[0].publicavel, false);
  assert.equal(agrupaPorMunicipio(bastantes)[0].publicavel, true);
});

// ── Dados reais do snapshot versionado ───────────────────────────────────────
test('snapshot carrega e tem municípios acima do gate', () => {
  const d = dados();
  assert.ok(d.totalVigentes > 1000, `poucos registros: ${d.totalVigentes}`);
  assert.ok(d.publicaveis.length >= 50, `poucos municípios: ${d.publicaveis.length}`);
  assert.ok(d.carregadoEm, 'carimbo de data da carga ausente');
});

test('sitemap só oferece município acima do gate', () => {
  const urls = urlsIndexaveis().map(([u]) => u);
  const d = dados();
  const reprovados = d.municipios.filter((m) => !m.publicavel);
  for (const m of reprovados.slice(0, 40)) {
    assert.equal(urls.includes(`/pbqp-h/construtoras/${m.uf.toLowerCase()}/${m.slug}`), false,
      `${m.titulo}/${m.uf} tem ${m.total} e não podia estar no sitemap`);
  }
  assert.ok(urls.includes('/pbqp-h/construtoras'), 'hub fora do sitemap');
});

test('title e meta description são únicos por página', () => {
  const titulos = new Set();
  const descricoes = new Set();
  const amostra = dados().publicaveis.slice(0, 60);
  for (const m of amostra) {
    const html = renderMunicipio(m.uf, m.slug);
    const t = /<title>(.*?)<\/title>/.exec(html)[1];
    const de = /<meta name="description" content="(.*?)"/.exec(html)[1];
    assert.equal(titulos.has(t), false, `title repetido: ${t}`);
    assert.equal(descricoes.has(de), false, `description repetida: ${de}`);
    titulos.add(t);
    descricoes.add(de);
  }
  assert.equal(titulos.size, amostra.length);
});

test('página abaixo do gate sai com noindex', () => {
  const fraco = dados().municipios.find((m) => !m.publicavel);
  const html = renderMunicipio(fraco.uf, fraco.slug);
  assert.match(html, /name="robots" content="noindex, follow"/);
});

test('página acima do gate é indexável e traz canonical, fonte e JSON-LD', () => {
  const forte = dados().publicaveis[0];
  const html = renderMunicipio(forte.uf, forte.slug);
  assert.match(html, /name="robots" content="index, follow"/);
  assert.match(html, new RegExp(`rel="canonical" href="https://anderstech\\.net/pbqp-h/construtoras/${forte.uf.toLowerCase()}/${forte.slug}"`));
  assert.match(html, /Fonte: <a[^>]*>SiAC \/ PBQP-H/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"@type":"Dataset"/);
  assert.equal((html.match(/"@type":"BreadcrumbList"/g) || []).length, 1, 'BreadcrumbList duplicado');
});

test('CTA do WhatsApp carrega a origem da página', () => {
  const m = dados().publicaveis.find((x) => x.uf === 'RS') || dados().publicaveis[0];
  const html = renderMunicipio(m.uf, m.slug);
  assert.match(html, /wa\.me\/5554999648368/);
  assert.match(html, /Vim%20pela%20p[^"]*gina%20de%20construtoras/);
});

test('nenhum contato de empresa vaza para o HTML', () => {
  const html = renderMunicipio(dados().publicaveis[0].uf, dados().publicaveis[0].slug);
  const corpo = html.split('<div id="shared-footer">')[0];
  assert.equal(/@[a-z0-9.-]+\.(com|br|net)\b/i.test(corpo.replace(/anderstech\.net/g, '')), false, 'e-mail de empresa no HTML');
});

test('hub e UF renderizam com número real', () => {
  const hub = renderHub();
  assert.match(hub, /<title>Construtoras com PBQP-H no Brasil: \d+ empresas/);
  const uf = renderUf('RS');
  assert.match(uf, /<title>Construtoras com PBQP-H em Rio Grande do Sul: \d+ empresas em \d+ cidades/);
  assert.equal(renderUf('ZZ'), null);
});

test('rota inexistente devolve null, não página vazia', () => {
  assert.equal(renderMunicipio('rs', 'cidade-que-nao-existe'), null);
});

// ── Eixo de certificadora ────────────────────────────────────────────────────
test('certificadora: gate de 20 separa quem tem página de quem não tem', () => {
  const orgs = organismos();
  assert.ok(orgs.length >= 20, `poucos organismos: ${orgs.length}`);
  for (const o of orgs) {
    assert.equal(o.publicavel, o.total >= GATE_ORGANISMO, `${o.nome} com ${o.total} classificado errado`);
  }
});

test('certificadora: title e description únicos, com números próprios', () => {
  const titulos = new Set();
  for (const o of organismos().filter((x) => x.publicavel)) {
    const html = renderCertificadora(o.slug);
    const t = /<title>(.*?)<\/title>/.exec(html)[1];
    assert.equal(titulos.has(t), false, `title repetido: ${t}`);
    assert.match(t, new RegExp(`${o.total} construtoras`));
    titulos.add(t);
  }
});

test('certificadora: só as publicáveis entram no sitemap', () => {
  const urls = urlsIndexaveis().map(([u]) => u);
  for (const o of organismos().filter((x) => !x.publicavel)) {
    assert.equal(urls.includes(`/pbqp-h/certificadoras/${o.slug}`), false, `${o.nome} não podia estar no sitemap`);
  }
  assert.ok(urls.includes('/pbqp-h/certificadoras'), 'hub de certificadoras fora do sitemap');
});

test('certificadora: cada linha liga para a página do município', () => {
  const o = organismos().find((x) => x.publicavel);
  const html = renderCertificadora(o.slug);
  assert.match(html, /\/pbqp-h\/construtoras\/[a-z]{2}\/[a-z0-9-]+/);
  assert.equal(renderCertificadora('organismo-que-nao-existe'), null);
});
