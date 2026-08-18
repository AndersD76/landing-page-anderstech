// ── Cliente do Asaas ──────────────────────────────────────────────────────────
// Substitui a integracao com o Mercado Pago. Concentrado aqui para nao engordar
// ead/routes.js (achado #55) e para deixar o webhook testavel isoladamente (#63).

const API = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

function requireKey() {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error('ASAAS_API_KEY nao configurada');
  return key;
}

export function asaasConfigurado() {
  return Boolean(process.env.ASAAS_API_KEY);
}

async function call(path, { method = 'GET', body, idempotencyKey } = {}) {
  const headers = { access_token: requireKey() };
  if (body) headers['Content-Type'] = 'application/json';
  // Evita cobranca duplicada quando a mesma requisicao e reenviada (achado #29).
  if (idempotencyKey) headers['access-token-idempotency'] = idempotencyKey;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detalhe = data?.errors?.[0]?.description || `HTTP ${res.status}`;
    const err = new Error(`Asaas ${method} ${path}: ${detalhe}`);
    err.status = res.status;
    err.asaas = data;
    throw err;
  }
  return data;
}

// ── Validacao de CPF/CNPJ (digitos verificadores) ─────────────────────────────
export function normalizaDoc(v) {
  return String(v || '').replace(/\D/g, '');
}

export function docValido(v) {
  const d = normalizaDoc(v);
  if (d.length === 11) return cpfValido(d);
  if (d.length === 14) return cnpjValido(d);
  return false;
}

function cpfValido(c) {
  if (/^(\d)\1{10}$/.test(c)) return false;
  for (const [len, pos] of [[9, 10], [10, 11]]) {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(c[i]) * (pos - i);
    let dig = (soma * 10) % 11;
    if (dig === 10) dig = 0;
    if (dig !== Number(c[len])) return false;
  }
  return true;
}

function cnpjValido(c) {
  if (/^(\d)\1{13}$/.test(c)) return false;
  const calc = (base) => {
    let peso = base.length - 7, soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * peso--;
      if (peso < 2) peso = 9;
    }
    const r = soma % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(c.slice(0, 12)) === Number(c[12]) && calc(c.slice(0, 13)) === Number(c[13]);
}

// ── Operacoes ─────────────────────────────────────────────────────────────────

export async function criarCliente({ nome, email, cpfCnpj, telefone }) {
  return call('/customers', {
    method: 'POST',
    body: {
      name: nome,
      email,
      cpfCnpj: normalizaDoc(cpfCnpj),
      mobilePhone: telefone ? normalizaDoc(telefone) : undefined,
      notificationDisabled: false,
    },
  });
}

// Vencimento: PIX e cartao sao imediatos, mas o Asaas exige dueDate. Damos 3 dias
// de folga para o aluno concluir o pagamento sem a cobranca vencer.
function vencimentoPadrao(diasFrente = 3) {
  const d = new Date(Date.now() + diasFrente * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export async function criarCobranca({ customerId, valor, descricao, orderId, billingType }) {
  return call('/payments', {
    method: 'POST',
    idempotencyKey: `ead-order-${orderId}`,
    body: {
      customer: customerId,
      billingType,                       // 'PIX' | 'CREDIT_CARD' | 'BOLETO'
      value: Number(valor),
      dueDate: vencimentoPadrao(),
      description: descricao,
      externalReference: `ead-order-${orderId}`,
    },
  });
}

export async function obterQrCodePix(paymentId) {
  return call(`/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
}

export async function obterCobranca(paymentId) {
  return call(`/payments/${encodeURIComponent(paymentId)}`);
}

// ── Mapeamento de evento -> estado interno ────────────────────────────────────
// Achado #22: o codigo antigo gravava o status cru do gateway, misturando
// idiomas e deixando entrar valor nao previsto. Aqui a traducao e explicita, e
// evento desconhecido nao vira estado.
const EVENTOS = {
  PAYMENT_CONFIRMED: 'aprovado',
  PAYMENT_RECEIVED: 'aprovado',
  PAYMENT_OVERDUE: 'vencido',
  PAYMENT_DELETED: 'cancelado',
  PAYMENT_REFUND_IN_PROGRESS: 'estorno_em_andamento',
  PAYMENT_REFUNDED: 'estornado',
  PAYMENT_PARTIALLY_REFUNDED: 'estornado_parcial',
  PAYMENT_CHARGEBACK_REQUESTED: 'chargeback',
  PAYMENT_CHARGEBACK_DISPUTE: 'chargeback_disputa',
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL: 'chargeback',
};

// Estados que devem RETIRAR o acesso ao curso (achado #77).
const REVOGAM = new Set(['estornado', 'chargeback', 'cancelado']);

export function traduzEvento(evento) {
  const status = EVENTOS[evento] || null;
  return { status, libera: status === 'aprovado', revoga: REVOGAM.has(status) };
}
