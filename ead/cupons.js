// ── Cupons de desconto do EAD ──────────────────────────────────────────────────
// Regra pura, sem banco: o que vale como cupom, quanto desconta e por que um
// cupom é recusado. Fica fora de ead/routes.js para ser testada isoladamente
// (test/cupom.test.js), como já é feito com ead/asaas.js.

import crypto from 'crypto';

// Percentuais que o painel oferece. O banco aceita 1–100; a restrição a esta
// lista é decisão comercial, então mora aqui e não num CHECK da migração.
export const PERCENTUAIS = [10, 20, 50, 90, 100];

// O Asaas recusa cobrança abaixo de R$ 5,00. Com os preços atuais o menor valor
// possível é R$ 19,70 (90% sobre R$ 197), mas um curso mais barato no futuro
// geraria uma cobrança que o gateway devolve como erro genérico.
export const VALOR_MINIMO_COBRANCA = 5;

export function normalizaCodigo(v) {
  return String(v || '').trim().toUpperCase().replace(/\s+/g, '');
}

export function codigoValido(c) {
  return /^[A-Z0-9-]{4,32}$/.test(c);
}

// Sem 0/O e 1/I/L: o cupom é digitado a partir de um WhatsApp ou e-mail, e
// caractere ambíguo vira "cupom não encontrado" para quem recebeu.
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

// 8 caracteres aleatórios ≈ 8,5 × 10¹¹ combinações: inviável de adivinhar, o
// que importa num cupom de 90% ou 100%. O prefixo só ajuda quem lê.
export function geraCodigo(percentual) {
  let s = '';
  for (let i = 0; i < 8; i++) s += ALFABETO[crypto.randomInt(ALFABETO.length)];
  return `AT${percentual}-${s}`;
}

// Conta em centavos: 20% de R$ 397,00 tem que dar R$ 79,40, não 79,39999.
export function aplicaDesconto(preco, percentual) {
  const original = Math.round(Number(preco) * 100);
  const desconto = Math.round(original * Number(percentual) / 100);
  return {
    valor_original: original / 100,
    desconto: desconto / 100,
    valor_final: (original - desconto) / 100,
  };
}

// Devolve { ok: true } ou { ok: false, erro } com a frase que o aluno vê.
// `jaUsou`: o aluno já tem pedido aprovado com este cupom (um uso por conta).
export function avaliaCupom(cupom, { courseId, email, jaUsou = false, agora = new Date() } = {}) {
  if (!cupom) return { ok: false, erro: 'Cupom não encontrado.' };
  if (!cupom.ativo) return { ok: false, erro: 'Este cupom foi desativado.' };
  if (cupom.valido_ate && agora > new Date(cupom.valido_ate)) {
    return { ok: false, erro: 'Este cupom expirou.' };
  }
  if (cupom.course_id && Number(cupom.course_id) !== Number(courseId)) {
    return { ok: false, erro: 'Este cupom não vale para este curso.' };
  }
  if (cupom.email && cupom.email !== String(email || '').toLowerCase().trim()) {
    return { ok: false, erro: 'Este cupom é pessoal e está vinculado a outro e-mail.' };
  }
  if (cupom.max_usos != null && Number(cupom.usos) >= Number(cupom.max_usos)) {
    return { ok: false, erro: 'Este cupom já atingiu o limite de usos.' };
  }
  if (jaUsou) return { ok: false, erro: 'Você já usou este cupom.' };
  return { ok: true };
}

// Valida o que o painel admin envia para criar um cupom. Devolve os dados
// normalizados ou { erro }.
export function validaNovoCupom(body = {}) {
  const percentual = Number(body.percentual);
  if (!PERCENTUAIS.includes(percentual)) {
    return { erro: `Desconto deve ser um destes: ${PERCENTUAIS.join(', ')}%.` };
  }

  let codigo = normalizaCodigo(body.codigo);
  if (codigo && !codigoValido(codigo)) {
    return { erro: 'Código: de 4 a 32 caracteres, só letras, números e hífen.' };
  }
  if (!codigo) codigo = geraCodigo(percentual);

  let maxUsos = null;
  if (body.max_usos !== undefined && body.max_usos !== null && body.max_usos !== '') {
    maxUsos = Number(body.max_usos);
    if (!Number.isInteger(maxUsos) || maxUsos < 1) return { erro: 'Limite de usos deve ser um número inteiro a partir de 1.' };
  }

  // Data do painel vem como AAAA-MM-DD: vale até o fim do dia em Brasília.
  let validoAte = null;
  if (body.valido_ate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.valido_ate))) return { erro: 'Validade inválida.' };
    validoAte = new Date(`${body.valido_ate}T23:59:59-03:00`);
    if (Number.isNaN(validoAte.getTime())) return { erro: 'Validade inválida.' };
  }

  const email = String(body.email || '').toLowerCase().trim() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'E-mail do destinatário inválido.' };

  const cursoSlug = String(body.curso_slug || '').trim() || null;
  const observacao = String(body.observacao || '').trim().slice(0, 200) || null;

  return { codigo, percentual, maxUsos, validoAte, email, cursoSlug, observacao };
}
