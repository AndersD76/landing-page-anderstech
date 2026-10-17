// ── IndexNow: avisa Bing e Yandex que as URLs mudaram ────────────────────────
// O Google ignora o IndexNow, mas Bing, Yandex, Seznam e Naver usam — e o Bing
// alimenta o ChatGPT e o Copilot. Para um site novo é a forma mais rápida de
// sair do zero em buscador que não seja o Google.
//
// A chave fica em um .txt na raiz do repositório, com o nome igual ao conteúdo
// (exigência do protocolo). server.js já serve qualquer arquivo /<32 hex>.txt
// da raiz, então a chave não precisa entrar na whitelist ARQUIVOS_PUBLICOS.
//
// Uso:
//   node scripts/indexnow.mjs                      → envia o sitemap inteiro
//   node scripts/indexnow.mjs /pagina-a /pagina-b  → envia só essas URLs
//   DRY_RUN=1 node scripts/indexnow.mjs            → monta e mostra, sem enviar

import { readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSitemap } from '../sitemap.js';
import { urlsIndexaveis } from '../pbqph/dados.js';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const HOST = 'anderstech.net';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

function lerChave() {
  const arquivo = readdirSync(RAIZ).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!arquivo) throw new Error('chave do IndexNow não encontrada na raiz (<32 hex>.txt)');
  const conteudo = readFileSync(join(RAIZ, arquivo), 'utf8').trim();
  const nome = arquivo.replace(/\.txt$/, '');
  // O protocolo exige que o conteúdo do arquivo seja exatamente a chave. Se
  // divergir, o buscador recusa o lote inteiro em silêncio.
  if (conteudo !== nome) throw new Error(`conteúdo de ${arquivo} difere do nome do arquivo`);
  return { chave: nome, local: `https://${HOST}/${arquivo}` };
}

function urlsDoSitemap() {
  const xml = buildSitemap([], urlsIndexaveis());
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const { chave, local } = lerChave();

// O Git Bash no Windows reescreve argumento que começa com "/" como caminho do
// sistema ("C:/Program Files/Git/rota"), e a rota se perdia em silêncio. Por
// isso aceitamos rota SEM barra inicial e URL completa, e avisamos quando o
// shell mangueou o argumento.
function paraUrl(arg) {
  if (arg.includes('://')) return arg;
  if (/^[A-Za-z]:[\\/]/.test(arg)) {
    console.error(`AVISO: o shell converteu "${arg}" em caminho de disco. Passe a rota sem a barra inicial, ou a URL completa.`);
    return null;
  }
  return `https://${HOST}/${arg.replace(/^\/+/, '')}`;
}

const args = process.argv.slice(2).filter(Boolean);
const urls = args.length ? args.map(paraUrl).filter(Boolean) : urlsDoSitemap();

if (!urls.length) {
  console.error('nenhuma URL para enviar');
  process.exit(1);
}

// Limite do protocolo é 10.000 por requisição; hoje estamos longe disso, mas o
// lote evita que uma expansão futura quebre a chamada em silêncio.
const LOTE = 10000;
console.log(`IndexNow · ${urls.length} URLs · chave ${chave.slice(0, 8)}…`);
console.log(`  primeira: ${urls[0]}`);
console.log(`  última  : ${urls[urls.length - 1]}`);

if (process.env.DRY_RUN) {
  console.log('\nDRY_RUN — nada foi enviado.');
  process.exit(0);
}

// Pré-voo: se a chave não estiver no ar, o buscador recusa o lote inteiro com
// 422 e não há como saber depois quais URLs se perderam. Melhor abortar.
const checagem = await fetch(local).catch(() => null);
if (!checagem || !checagem.ok) {
  console.error(`ABORTADO: ${local} respondeu ${checagem ? checagem.status : 'nada'}.`);
  console.error('A chave precisa estar publicada antes do primeiro envio — faça o deploy e rode de novo.');
  process.exit(1);
}
console.log(`  chave validada em ${local}`);

let enviados = 0;
for (let i = 0; i < urls.length; i += LOTE) {
  const parte = urls.slice(i, i + LOTE);
  const resp = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: chave, keyLocation: local, urlList: parte }),
  });
  // 200 e 202 são sucesso. 422 costuma ser chave que o buscador ainda não
  // conseguiu validar — o arquivo precisa estar no ar antes do primeiro envio.
  const corpo = await resp.text().catch(() => '');
  console.log(`  lote ${i / LOTE + 1}: HTTP ${resp.status} ${corpo.slice(0, 120)}`);
  if (resp.status === 200 || resp.status === 202) enviados += parte.length;
  else if (resp.status === 422) console.error('    chave não validada — confira se ' + local + ' responde 200');
}

console.log(`\n${enviados}/${urls.length} URLs aceitas.`);
process.exit(enviados === urls.length ? 0 : 1);
