import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { validarContato, emailValido, sugestaoEmail, telefoneValido, primeiroNome, identificacao, PRAZOS, STATUS_LEAD } from '../config/contato.js';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));

// ── Por que este arquivo existe ──────────────────────────────────────────────
// O servidor exigia `nome`. A calculadora de ROI e o pop-up de saída mandavam
// só e-mail. Toda submissão dos dois voltava 400, o erro era engolido e a tela
// agradecia — 100% dos leads das duas iscas principais perdidos em silêncio,
// com o GA4 contando conversão.
//
// A trava: para cada formulário que chama /api/contact existe aqui o payload
// EXATO que a tela monta, e o teste exige que o servidor aceite. Formulário
// novo sem fixture quebra a contagem no fim do arquivo.

const PAYLOADS = {
  // app.js — formulário de contato da home
  home: {
    nome: 'Daniel Anders', empresa: 'Anders Tech', email: 'contato@exemplo.com.br',
    telefone: '(54) 99964-8368', interesse: 'ISO 9001 — implantação / manutenção',
    mensagem: 'Quero certificar a fábrica.', cargo: 'socio_diretor', prazo: 'agora', source: 'site_form',
    landing_page: '/', utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '', utm_term: '',
  },

  // app.js — pop-up de saída. `nome` vazio é o caso que derrubava tudo: o campo
  // é opcional na tela de propósito, porque exigir nome antes da entrega mata a
  // conversão.
  exit_intent: {
    nome: '', email: 'lead@exemplo.com', source: 'lead_magnet_checklist',
    interesse: 'ISO 9001 — implantação / manutenção',
    landing_page: '/iso-9001', utm_source: 'google', utm_medium: 'organic',
    utm_campaign: '', utm_content: '', utm_term: '',
  },

  // pages/calculadora-roi-certificacao.html — a isca que vazava 100%
  calculadora_roi: {
    nome: '', email: 'gestor@industria.com.br', telefone: '',
    cargo: 'gerente_qualidade', prazo: '90_dias',
    source: 'calculadora_roi', interesse: 'ISO 9001 — implantação / manutenção',
    landing_page: '/calculadora-roi-certificacao',
    utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '',
    roiData: { faturamento: 5000000, funcionarios: 50, setor: 'metalurgica', motivacao: 'cliente', investMin: 18000, investMax: 32000, savings24: 140000, roi: 337 },
  },

  // pages/checklist-iso-9001.html — único que já mandava `cargo`, descartado
  // pelo servidor até a migration 012 criar a coluna.
  checklist: {
    nome: 'Maria Souza', email: 'maria@construtora.com.br', empresa: 'Construtora Exemplo',
    cargo: 'Gerente da Qualidade', source: 'lead_magnet_checklist', interesse: 'ISO 9001',
    landing_page: '/checklist-iso-9001', utm_source: '', utm_medium: '', utm_campaign: '', utm_content: '',
  },
};

test('todo formulário do site é aceito com o payload que a tela manda', () => {
  for (const [tela, payload] of Object.entries(PAYLOADS)) {
    const r = validarContato(payload);
    assert.equal(r.ok, true, `${tela} foi RECUSADO: ${r.erro || ''}`);
  }
});

test('regressão: lead sem nome é aceito (era o bug de 100% de perda)', () => {
  const r = validarContato({ email: 'so-email@exemplo.com', source: 'calculadora_roi' });
  assert.equal(r.ok, true);
  assert.equal(r.dados.nome, null, 'nome ausente vira null, não string vazia');
});

test('identidade mínima: sem e-mail e sem telefone, recusa', () => {
  const r = validarContato({ nome: 'Fulano', empresa: 'Acme' });
  assert.equal(r.ok, false);
  assert.equal(r.campo, 'email');
});

test('telefone sozinho identifica o lead', () => {
  assert.equal(validarContato({ telefone: '54999648368' }).ok, true);
  assert.equal(validarContato({ telefone: '123' }).ok, false, 'telefone curto não é identidade');
});

test('e-mail sem domínio completo é recusado, com sugestão', () => {
  assert.equal(emailValido('fulano@gmail'), false);
  assert.equal(emailValido('fulano'), false);
  assert.equal(emailValido('fulano@gmail.com'), true);
  assert.equal(sugestaoEmail('fulano@gmail'), 'fulano@gmail.com');
  assert.equal(sugestaoEmail('joao@hotmail.con'), 'joao@hotmail.com');
  assert.equal(sugestaoEmail('joao@empresa-real.com.br'), null, 'domínio válido não recebe sugestão');

  const r = validarContato({ email: 'fulano@gmail' });
  assert.equal(r.ok, false);
  assert.equal(r.sugestao, 'fulano@gmail.com');
  assert.match(r.erro, /gmail\.com/);
});

test('e-mail é normalizado: caixa e espaço não geram lead duplicado', () => {
  const r = validarContato({ email: '  Contato@Exemplo.COM.BR  ' });
  assert.equal(r.ok, true);
  assert.equal(r.dados.email, 'contato@exemplo.com.br');
});

test('campos longos são truncados, não rejeitados', () => {
  const r = validarContato({ email: 'a@b.com', mensagem: 'x'.repeat(9000), nome: 'y'.repeat(500) });
  assert.equal(r.ok, true);
  assert.equal(r.dados.mensagem.length, 4000);
  assert.equal(r.dados.nome.length, 120);
});

test('source tem padrão e atribuição sobrevive à validação', () => {
  const r = validarContato(PAYLOADS.exit_intent);
  assert.equal(r.dados.source, 'lead_magnet_checklist');
  assert.equal(r.dados.landing_page, '/iso-9001');
  assert.equal(r.dados.utm_medium, 'organic');

  assert.equal(validarContato({ email: 'a@b.com' }).dados.source, 'site_form');
});

test('assunto do aviso não quebra sem nome', () => {
  assert.equal(primeiroNome(null), null);
  assert.equal(primeiroNome('Daniel Anders'), 'Daniel');
  assert.equal(identificacao({ nome: null, email: 'x@y.com', telefone: null }), 'x@y.com');
  assert.equal(identificacao({ nome: 'Ana Lima', email: 'x@y.com' }), 'Ana Lima');
  assert.equal(identificacao({ nome: null, email: null, telefone: '5499' }), '5499');
});

test('prazo só aceita a lista fechada — texto livre não ordena fila', () => {
  for (const p of PRAZOS) {
    assert.equal(validarContato({ email: 'a@b.com', prazo: p }).dados.prazo, p);
  }
  assert.equal(validarContato({ email: 'a@b.com', prazo: 'semana que vem' }).dados.prazo, null);
  assert.equal(validarContato({ email: 'a@b.com' }).dados.prazo, null, 'ausente vira null, não string vazia');
});

test('cargo e prazo sobrevivem à validação nas fixtures reais', () => {
  assert.equal(validarContato(PAYLOADS.home).dados.prazo, 'agora');
  assert.equal(validarContato(PAYLOADS.home).dados.cargo, 'socio_diretor');
  assert.equal(validarContato(PAYLOADS.calculadora_roi).dados.prazo, '90_dias');
});

test('honeypot não é campo de dado', () => {
  const r = validarContato({ email: 'a@b.com', website: 'http://spam' });
  assert.equal(r.ok, true);
  assert.equal(r.dados.website, undefined, 'website nunca chega ao INSERT');
});

// ── Trava de cobertura ───────────────────────────────────────────────────────
// Conta os formulários que chamam /api/contact no código do cliente. Se alguém
// criar um formulário novo, este teste falha até existir a fixture dele acima —
// que é exatamente a checagem que faltava quando a calculadora foi escrita.
test('todo chamador de /api/contact tem fixture neste arquivo', () => {
  const arquivos = [
    'app.js',
    ...readdirSync(join(RAIZ, 'pages')).filter(f => f.endsWith('.html')).map(f => join('pages', f)),
  ];

  const chamadores = arquivos.filter(rel => {
    const src = readFileSync(join(RAIZ, rel), 'utf8');
    return /fetch\(\s*["']\/api\/contact["']/.test(src);
  });

  // app.js concentra dois formulários (home e pop-up de saída).
  const esperado = Object.keys(PAYLOADS).length - 1;
  assert.equal(
    chamadores.length,
    esperado,
    `arquivos que chamam /api/contact: ${chamadores.join(', ')} — atualize PAYLOADS ao criar formulário novo`
  );
});

// ── Painel /admin ────────────────────────────────────────────────────────────
// O painel tinha a própria lista de status, com "convertido". O servidor recusava
// com 400, mas a tela usava um fetch que não checava res.ok e dizia "Status
// atualizado" — marcar lead como fechado nunca funcionou. Mesma classe do bug da
// calculadora: a tela confirmava o que o banco recusou.
const ADMIN = readFileSync(join(RAIZ, 'admin', 'index.html'), 'utf8');

test('painel oferece exatamente os status que o servidor aceita', () => {
  const m = /const STATUS_LEAD = (\[[^\]]*\]);/.exec(ADMIN);
  assert.ok(m, 'STATUS_LEAD não declarado no painel');
  const doPainel = JSON.parse(m[1].replace(/'/g, '"'));
  assert.deepEqual(doPainel, STATUS_LEAD, 'painel e servidor divergem');

  const filtro = [...ADMIN.matchAll(/<select id="filter-status">([\s\S]*?)<\/select>/g)][0][1];
  const opcoes = [...filtro.matchAll(/value="([^"]+)"/g)].map((x) => x[1]);
  assert.deepEqual(opcoes, STATUS_LEAD, 'filtro de status do painel diverge do servidor');
});

test('painel não confirma alteração sem checar a resposta do servidor', () => {
  assert.match(ADMIN, /async function patchLead/, 'patchLead sumiu');
  assert.match(ADMIN, /if \(!res\.ok\)/, 'patchLead não confere res.ok');
  // Nenhum PATCH fora de patchLead: apiFetch cru não lança em 400. Só uma
  // ocorrência de method 'PATCH' pode existir — a de dentro do patchLead.
  const patches = ADMIN.match(/method:\s*'PATCH'/g) || [];
  assert.equal(patches.length, 1, `PATCH fora do patchLead (${patches.length} ocorrências)`);
  for (const fn of ['updateStatus', 'saveNote']) {
    const corpo = new RegExp(`async function ${fn}\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`).exec(ADMIN);
    assert.ok(corpo, `${fn} não encontrada`);
    assert.match(corpo[1], /patchLead\(/, `${fn} não usa patchLead`);
  }
});

test('prazos do painel são os mesmos do servidor', () => {
  const m = /const RANK_PRAZO = (\{[^}]*\});/.exec(ADMIN);
  assert.ok(m, 'RANK_PRAZO não declarado no painel');
  const chaves = Object.keys(JSON.parse(m[1].replace(/'/g, '"').replace(/(\w+):/g, '"$1":')));
  assert.deepEqual(chaves.sort(), [...PRAZOS].sort());
});
