// ── Prova social (FASE 2) ────────────────────────────────────────────────────
// A home publicava 5 cases e 1 depoimento com nome de cliente e números que
// ninguém neste repo consegue verificar. A regra é "nenhum nome real entra até
// o Anders autorizar por escrito", então a prova virou dado, não HTML: liberar
// um case é trocar `publicado: false` por `true` depois de preencher os campos.
//
// O que estava no ar e o que falta para cada item voltar está em PROVA-PENDENTE.md.

// Os arrays nascem VAZIOS de proposito. Slot pre-criado com [PREENCHER] parecia
// tarefa pendente no grep, mas nao era: case e depoimento nao dependem de alguem
// sentar e escrever — dependem de um cliente real autorizar por escrito. Ate la
// nao ha o que preencher, e array vazio diz isso com mais honestidade do que
// tres slots fantasma. A secao da home nao fica vazia: `renderProva()` em
// inject.js mostra um bloco proprio quando nao ha nada publicado.
//
// Para publicar um case, adicione um objeto neste formato:
//
//   {
//     publicado: true,
//     slug: 'metalurgica-abc-iso-9001',  // vira /cases/<slug>
//     cliente: 'Metalúrgica ABC',        // ou "Metalúrgica · RS" se anônimo
//     segmento: 'Metalúrgica',           // Alimentícia · Construtora · Cooperativa
//     servico: 'ISO 9001',               // PBQP-H · Diagnóstico
//     problema: 'Perdia 15% por retrabalho.',   // o que doía antes, 1 ou 2 frases
//     resultado: 'Retrabalho a 3% em 6 meses.', // o que mudou, com a medição
//     imagem: '',                        // /assets/case-0X.jpg — vazio usa a marca
//   }
//
// E um depoimento:
//
//   {
//     publicado: true,
//     texto: 'Mudou a forma como trabalhamos.',  // frase literal, não paráfrase
//     autor: 'João Silva',               // como o depoente autorizou ser citado
//     cargo: 'Diretor Industrial · Metalúrgica · RS',
//     imagem: '',
//   }
//
// A trava abaixo continua valendo: campo vazio ou com [PREENCHER] nao publica,
// mesmo com `publicado: true`. O que cada item precisa esta em PROVA-PENDENTE.md.

export const CASES = [];

export const DEPOIMENTOS = [];

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
// Mesma logica dos cases: sem numero verificado nao ha o que preencher, entao
// nasce desligado e sem metrica. Para publicar, preencha assim:
//
//   publicado: true,
//   rotulo: 'Diagnóstico · amostra',
//   metricas: [
//     { label: 'Meses analisados', valor: '18', barra: 80,
//       fonte: 'planilha de produção do cliente X, jan/2025' },
//   ],
//
// `barra` é o preenchimento visual (0–100) e `fonte` nunca aparece na página:
// existe para que nenhum número volte ao ar sem alguém ter escrito de onde saiu.
export const READOUT = {
  publicado: false,
  rotulo: '',
  metricas: [],
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
