// ── Neon → PGlite (só para teste de integração) ──────────────────────────────
// Imita o driver HTTP do Neon (sql`...`, sql.query, sql.transaction) sobre um
// Postgres real em memória (PGlite). Um gancho de resolução troca o pacote
// '@neondatabase/serverless' por este arquivo; o servidor inteiro roda igual
// à produção, só que contra o PGlite.
//
// Nasceu de três bugs que os testes de unidade não pegavam (18/11/2026): a
// semeadura do motor orgânico rodando antes das migrações, um lead entrando em
// duas réguas e a origem do WhatsApp cortada na primeira palavra.

import { PGlite } from '@electric-sql/pglite';

const db = globalThis.__pglite || (globalThis.__pglite = new PGlite());

function montar(strings, valores) {
  let texto = strings[0];
  const params = [];
  for (let i = 0; i < valores.length; i++) { params.push(valores[i]); texto += '$' + params.length + strings[i + 1]; }
  return { texto, params };
}
const normaliza = (v) => (v instanceof Date ? v.toISOString() : v);

function consulta(texto, params) {
  const exec = (cli) => cli.query(texto, params.map(normaliza)).then(r => r.rows);
  let prom = null;
  return {
    texto, params, exec,
    then(ok, falha) { prom = prom || exec(db); return prom.then(ok, falha); },
    catch(f) { return this.then(x => x, f); },
  };
}

export function neon() {
  const sql = (strings, ...valores) => { const { texto, params } = montar(strings, valores); return consulta(texto, params); };
  sql.query = (texto, params = []) => consulta(texto, params);
  sql.transaction = async (qs) => db.transaction(async (tx) => {
    const lista = typeof qs === 'function'
      ? qs((strings, ...valores) => { const { texto, params } = montar(strings, valores); return consulta(texto, params); })
      : qs;
    const out = [];
    for (const q of lista) out.push(await q.exec(tx));
    return out;
  });
  return sql;
}
export default { neon };
