// ── Carga da base SiAC / PBQP-H ──────────────────────────────────────────────
// A fonte inteira vem de um GET só, descoberto interceptando a rede do app
// React (scripts/sonda-siac.mjs). Sem sessão, sem token, sem navegador.
//
// Grava dois destinos:
//   1. data/pbqph-siac.json — snapshot versionado. É o que serve as páginas em
//      dev e o que os testes usam. Sem ele o site dependeria de banco para
//      renderizar página pública, e um banco fora do ar viraria 500 no Google.
//   2. tabela pbqph_empresas, quando há DATABASE_URL — é de onde a produção lê.
//
// Uso: node scripts/carrega-siac.mjs
//      DATABASE_URL=... node scripts/carrega-siac.mjs

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { normalizaRegistro, agrupaPorMunicipio, GATE_MUNICIPIO } from '../pbqph/normaliza.js';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const FONTE = 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/?tabela=show';
const DESTINO = join(RAIZ, 'data', 'pbqph-siac.json');

console.log('baixando', FONTE);
const resp = await fetch(FONTE, { headers: { 'User-Agent': 'AndersTechBot/1.0 (+https://anderstech.net)' } });
if (!resp.ok) throw new Error(`fonte respondeu ${resp.status}`);

// A fonte mistura codificação no MESMO arquivo: parte dos acentos vem como
// escape JSON (ó) e parte como byte latin-1 cru. Deixar o fetch decodificar
// como UTF-8 destrói o byte cru — vira U+FFFD e não há como recuperar depois
// ("Edificações" chegava como "Edifica??es"). Decodificando tudo como latin-1,
// nenhum byte se perde: os escapes continuam corretos e o que era UTF-8 vira
// mojibake previsível, que corrigeTexto desfaz.
const bytes = Buffer.from(await resp.arrayBuffer());
const bruto = JSON.parse(bytes.toString('latin1'));
console.log(`  registros na fonte: ${bruto.length}`);

const agora = new Date();
const registros = bruto.map((r) => normalizaRegistro(r, agora)).filter(Boolean);
console.log(`  vigentes e completos: ${registros.length}`);
console.log(`  descartados: ${bruto.length - registros.length} (expirado, suspenso ou sem validade)`);

const municipios = agrupaPorMunicipio(registros);
const publicaveis = municipios.filter((m) => m.publicavel);
console.log(`  municípios: ${municipios.length} · acima do gate (${GATE_MUNICIPIO}): ${publicaveis.length}`);

// Trava de sanidade. A carga é automática e roda sem ninguém olhando: se a
// fonte mudar de formato ou devolver meia base, o certo é ABORTAR e manter o
// snapshot anterior no ar, não publicar 161 páginas esvaziadas. Queda grande
// pode ser real, e aí a carga roda de novo com CARGA_FORCA=1.
try {
  const anterior = JSON.parse(readFileSync(DESTINO, 'utf8'));
  const antes = anterior.total_vigentes || 0;
  if (antes > 0) {
    const queda = (antes - registros.length) / antes;
    console.log(`  carga anterior: ${antes} vigentes · variação: ${(-queda * 100).toFixed(1)}%`);
    if (queda > 0.2 && !process.env.CARGA_FORCA) {
      console.error(`\nABORTADO: queda de ${(queda * 100).toFixed(1)}% em relação à carga anterior (${antes} → ${registros.length}).`);
      console.error('Confira a fonte antes de publicar. Se a queda for real: CARGA_FORCA=1 node scripts/carrega-siac.mjs');
      process.exit(1);
    }
  }
} catch {
  console.log('  carga anterior: nenhuma (primeira execução)');
}

// A data da carga vem do relógio da carga, nunca escrita à mão: é ela que
// aparece no carimbo "Fonte: X — atualizado em ..." de toda página.
const snapshot = {
  fonte: 'SiAC / PBQP-H — Ministério das Cidades',
  fonte_url: 'https://pbqp-h.cidades.gov.br/sistemas/siac/empresas-certificadas/',
  carregado_em: agora.toISOString(),
  gate: GATE_MUNICIPIO,
  total_fonte: bruto.length,
  total_vigentes: registros.length,
  registros,
};

mkdirSync(dirname(DESTINO), { recursive: true });
writeFileSync(DESTINO, JSON.stringify(snapshot));
console.log(`  snapshot: ${DESTINO}`);

if (process.env.DATABASE_URL) {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL);
  // Carga cheia: a fonte é pequena (milhares de linhas) e o estado correto é
  // sempre o último retrato. Diferencial exigiria detectar remoção, que a
  // fonte não sinaliza.
  await sql`DELETE FROM pbqph_empresas`;
  const lote = 200;
  for (let i = 0; i < registros.length; i += lote) {
    const parte = registros.slice(i, i + lote);
    await sql`
      INSERT INTO pbqph_empresas (empresa, cnpj, uf, municipio, municipio_slug, nivel, subsetor, organismo, validade, emissao)
      SELECT * FROM jsonb_to_recordset(${JSON.stringify(parte)}::jsonb)
        AS t(empresa TEXT, cnpj TEXT, uf TEXT, municipio TEXT, municipio_slug TEXT, nivel TEXT, subsetor TEXT, organismo TEXT, validade DATE, emissao DATE)
    `;
  }
  await sql`INSERT INTO pbqph_cargas (carregado_em, total_fonte, total_vigentes) VALUES (${agora.toISOString()}, ${bruto.length}, ${registros.length})`;
  console.log(`  banco: ${registros.length} linhas gravadas`);
} else {
  console.log('  banco: DATABASE_URL ausente — só o snapshot foi gravado');
}

console.log('\ntop 10 municípios:');
for (const m of publicaveis.slice(0, 10)) {
  console.log(`  ${m.titulo}/${m.uf}: ${m.total} (A:${m.nivelA} B:${m.nivelB}) · ${m.vencendo12m} vencem em 12m`);
}
