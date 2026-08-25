// ── Prova social (FASE 2) ────────────────────────────────────────────────────
// A home publicava 5 cases e 1 depoimento com nome de cliente e números que
// ninguém neste repo consegue verificar. A regra é "nenhum nome real entra até
// o Anders autorizar por escrito", então a prova virou dado, não HTML: liberar
// um case é trocar `publicado: false` por `true` depois de preencher os campos.
//
// O que estava no ar e o que falta para cada item voltar está em PROVA-PENDENTE.md.

const PENDENTE = '[PREENCHER — aguardando autorização do cliente]';

export const CASES = [
  {
    publicado: false,
    slug: '',                    // vira /cases/<slug> na FASE 4
    cliente: PENDENTE,           // nome da empresa, ou "Metalúrgica · RS" se anônimo
    segmento: PENDENTE,          // Metalúrgica · Alimentícia · Construtora · Cooperativa
    servico: PENDENTE,           // ISO 9001 · PBQP-H · Diagnóstico
    problema: PENDENTE,          // o que doía antes — 1 ou 2 frases
    resultado: PENDENTE,         // o que mudou, com a medição e a fonte dela
    imagem: '',                  // /assets/case-0X.jpg — vazio usa fundo da marca
  },
  {
    publicado: false,
    slug: '',
    cliente: PENDENTE,
    segmento: PENDENTE,
    servico: PENDENTE,
    problema: PENDENTE,
    resultado: PENDENTE,
    imagem: '',
  },
  {
    publicado: false,
    slug: '',
    cliente: PENDENTE,
    segmento: PENDENTE,
    servico: PENDENTE,
    problema: PENDENTE,
    resultado: PENDENTE,
    imagem: '',
  },
];

export const DEPOIMENTOS = [
  {
    publicado: false,
    texto: PENDENTE,             // frase literal, não paráfrase
    autor: PENDENTE,             // como o depoente autorizou ser citado
    cargo: PENDENTE,             // cargo · segmento · estado
    imagem: '',
  },
];

// Trava: item com `publicado: true` mas com [PREENCHER] sobrando NÃO vai ao ar.
// Evita publicar meio case por descuido — o custo de um vazamento desses é a
// credibilidade inteira da página.
function completo(item) {
  return Object.entries(item).every(([chave, valor]) => {
    if (chave === 'publicado' || chave === 'imagem' || chave === 'slug') return true;
    return typeof valor === 'string' && valor.trim() && !valor.includes('[PREENCHER');
  });
}

export function casesPublicados() {
  return CASES.filter(c => c.publicado && completo(c));
}

export function depoimentosPublicados() {
  return DEPOIMENTOS.filter(d => d.publicado && completo(d));
}

// Quantos itens existem mas ainda não podem ser publicados — usado no relatório
// de pendências, não na página.
export function pendencias() {
  return {
    cases: CASES.filter(c => !c.publicado || !completo(c)).length,
    depoimentos: DEPOIMENTOS.filter(d => !d.publicado || !completo(d)).length,
  };
}

// ── Readout do hero ──────────────────────────────────────────────────────────
// Mostrava "18 meses analisados · 25.000+ mensagens lidas · retrabalho a 400% da
// meta" rotulado como amostra. São os mesmos números do case 3, que saiu da
// página por não serem verificáveis — manter num lugar e tirar do outro seria
// incoerência. Mesma trava: só volta com número verificado e a fonte registrada.
export const READOUT = {
  publicado: false,
  rotulo: PENDENTE,              // ex.: "Diagnóstico · amostra"
  metricas: [
    { label: PENDENTE, valor: PENDENTE, barra: 0, fonte: PENDENTE },
    { label: PENDENTE, valor: PENDENTE, barra: 0, fonte: PENDENTE },
    { label: PENDENTE, valor: PENDENTE, barra: 0, fonte: PENDENTE },
  ],
};

// `fonte` não aparece na página. Existe para que nenhum número volte ao ar sem
// alguém ter escrito de onde ele saiu — é o que faltava nos que saíram.
export function readoutPublicado() {
  const r = READOUT;
  if (!r.publicado) return null;
  if (typeof r.rotulo !== 'string' || !r.rotulo.trim() || r.rotulo.includes('[PREENCHER')) return null;
  if (!Array.isArray(r.metricas) || !r.metricas.length) return null;
  const ok = r.metricas.every(m =>
    ['label', 'valor', 'fonte'].every(c => typeof m[c] === 'string' && m[c].trim() && !m[c].includes('[PREENCHER'))
    && Number.isFinite(m.barra) && m.barra > 0);
  return ok ? r : null;
}
