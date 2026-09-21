// ── Validação e normalização do lead ─────────────────────────────────────────
// Nasceu do bug mais caro do repositório: o servidor exigia `nome`, a
// calculadora de ROI e o pop-up de saída mandavam só e-mail, e 100% dos leads
// dessas duas iscas eram recusados com 400 enquanto a tela dizia que deu certo.
//
// Módulo puro de propósito: o teste monta o payload exato de cada tela e checa
// que o servidor aceita, sem subir Express nem banco. Enquanto a validação
// morava dentro do handler, não havia como testar isso.

// Exige domínio completo com TLD: `fulano@gmail` entrava como lead e nunca
// recebia nada, porque o Resend não tem para onde entregar.
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,24}$/;

// Domínios digitados pela metade ou com o erro de digitação clássico. Serve
// para sugerir a correção na tela — nunca para corrigir por conta própria:
// trocar o e-mail de alguém em silêncio é pior que recusar.
const DOMINIOS = {
  gmail: 'gmail.com', gmai: 'gmail.com', gmial: 'gmail.com', 'gmail.con': 'gmail.com',
  hotmail: 'hotmail.com', hotmai: 'hotmail.com', 'hotmail.con': 'hotmail.com',
  outlook: 'outlook.com', 'outlook.con': 'outlook.com',
  yahoo: 'yahoo.com.br', icloud: 'icloud.com', live: 'live.com',
  uol: 'uol.com.br', terra: 'terra.com.br', bol: 'bol.com.br',
};

// Prazo de decisão: lista fechada. Texto livre aqui viraria campo inútil para
// ordenar fila — o que importa é poder filtrar "quem decide agora".
export const PRAZOS = new Set(['agora', '90_dias', 'avaliando']);

// Rótulo legível do prazo, para o assunto do aviso e o painel. O banco guarda a
// chave; humano lê a frase.
export const ROTULO_PRAZO = { agora: 'DECIDE AGORA', '90_dias': 'próximos 90 dias', avaliando: 'só avaliando' };

// Fonte única dos status do lead. Morava só no server.js, e o painel /admin
// tinha a própria lista — com "convertido", que o servidor recusava com 400.
// O painel dizia "Status atualizado" e o banco continuava igual: marcar lead
// como fechado nunca funcionou. test/contato.test.js confere as duas listas.
export const STATUS_LEAD = ['novo', 'contatado', 'qualificado', 'proposta', 'ganho', 'perdido'];

const LIMITES = {
  nome: 120, empresa: 160, email: 190, telefone: 40, cargo: 120, prazo: 40,
  interesse: 160, mensagem: 4000, source: 60, landing_page: 300,
  utm_source: 120, utm_medium: 120, utm_campaign: 120, utm_content: 120, utm_term: 120,
};

export function texto(v, max) {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s+/g, ' ').trim();
  if (!s) return null;
  return max ? s.slice(0, max) : s;
}

// Caixa e espaço normalizados no banco também, não só no hash da telemetria:
// sem isso o mesmo e-mail em caixas diferentes gerava duas linhas em `leads` e
// um único person_id, e o relatório não fechava.
export function normalizaEmail(v) {
  const s = texto(v, LIMITES.email);
  return s ? s.toLowerCase() : null;
}

export function emailValido(v) {
  const s = normalizaEmail(v);
  return !!s && RE_EMAIL.test(s);
}

export function sugestaoEmail(v) {
  const s = normalizaEmail(v);
  if (!s || !s.includes('@')) return null;
  const [local, dominio] = [s.slice(0, s.lastIndexOf('@')), s.slice(s.lastIndexOf('@') + 1)];
  const certo = DOMINIOS[dominio];
  if (!certo || !local) return null;
  return `${local}@${certo}`;
}

// Só dígitos, para o telefone servir de identidade mínima sem depender de como
// a pessoa digitou. Menos de 10 dígitos não é telefone brasileiro utilizável.
export function telefoneValido(v) {
  const d = String(v || '').replace(/\D/g, '');
  return d.length >= 10 && d.length <= 13;
}

/**
 * Valida e normaliza o corpo de POST /api/contact.
 * Identidade mínima: e-mail OU telefone. Nome é desejável e nunca bloqueia.
 * @returns {{ok: true, dados: object} | {ok: false, erro: string, campo: string, sugestao?: string}}
 */
export function validarContato(body) {
  const b = body || {};

  const email = normalizaEmail(b.email);
  const telefone = texto(b.telefone, LIMITES.telefone);

  if (!email && !telefone) {
    return { ok: false, campo: 'email', erro: 'Informe e-mail ou telefone para podermos responder.' };
  }

  if (email && !emailValido(email)) {
    const sugestao = sugestaoEmail(email);
    return {
      ok: false,
      campo: 'email',
      erro: sugestao ? `E-mail incompleto. Você quis dizer ${sugestao}?` : 'E-mail inválido — confira o domínio.',
      ...(sugestao ? { sugestao } : {}),
    };
  }

  if (!email && telefone && !telefoneValido(telefone)) {
    return { ok: false, campo: 'telefone', erro: 'Telefone inválido — informe DDD e número.' };
  }

  return {
    ok: true,
    dados: {
      nome: texto(b.nome, LIMITES.nome),
      empresa: texto(b.empresa, LIMITES.empresa),
      email,
      telefone,
      cargo: texto(b.cargo, LIMITES.cargo),
      prazo: PRAZOS.has(String(b.prazo || '').trim()) ? String(b.prazo).trim() : null,
      interesse: texto(b.interesse, LIMITES.interesse),
      mensagem: texto(b.mensagem, LIMITES.mensagem),
      source: texto(b.source, LIMITES.source) || 'site_form',
      landing_page: texto(b.landing_page, LIMITES.landing_page),
      utm_source: texto(b.utm_source, LIMITES.utm_source),
      utm_medium: texto(b.utm_medium, LIMITES.utm_medium),
      utm_campaign: texto(b.utm_campaign, LIMITES.utm_campaign),
      utm_content: texto(b.utm_content, LIMITES.utm_content),
      utm_term: texto(b.utm_term, LIMITES.utm_term),
    },
  };
}

// Tratamento para o assunto do e-mail. Com `nome` opcional, `nome.split(' ')[0]`
// quebraria o handler inteiro no primeiro lead da calculadora.
export function primeiroNome(nome) {
  const s = texto(nome, LIMITES.nome);
  return s ? s.split(' ')[0] : null;
}

// Identificação do lead no assunto do aviso: nome quando existe, senão o
// e-mail, senão o telefone. O Anders precisa saber quem é antes de abrir.
export function identificacao(dados) {
  return texto(dados.nome) || dados.email || dados.telefone || 'sem identificação';
}
