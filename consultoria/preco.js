// ── Preço da consultoria contratada pelo site ──────────────────────────────────
// Regras definidas pelo Anders em 18/11/2026. Regra pura, sem banco e sem rede:
// a mesma função calcula a prévia na tela e o valor que vai para o Asaas, e é
// testada em test/consultoria.test.js.
//
// Preço = horas × R$ 180 × (1 + soma dos acréscimos). Os acréscimos SOMAM
// (decisão do Anders): 60 funcionários (+10%) a 120 km (+15%) com projeto (+20%)
// dá +45%, não 1,10 × 1,15 × 1,20.

export const VALOR_HORA = 180;

// Juros do parcelamento: 2% ao mês, tabela Price, só em 2x ou mais no cartão e
// no boleto. Pix é sempre à vista.
export const JUROS_MES = 0.02;
export const MAX_PARCELAS = 12;

export const FAIXAS_FUNCIONARIOS = [
  { ate: 20, pct: 0, rotulo: 'até 20 funcionários' },
  { ate: 50, pct: 5, rotulo: '21 a 50 funcionários' },
  { ate: 100, pct: 10, rotulo: '51 a 100 funcionários' },
  { ate: Infinity, pct: 15, rotulo: 'mais de 100 funcionários' },
];

// Distância POR ESTRADA a partir de Passo Fundo. Acima de 300 km não atende.
export const FAIXAS_DISTANCIA = [
  { ate: 50, pct: 0, rotulo: 'até 50 km de Passo Fundo' },
  { ate: 100, pct: 5, rotulo: '51 a 100 km de Passo Fundo' },
  { ate: 300, pct: 15, rotulo: '101 a 300 km de Passo Fundo' },
];
export const DISTANCIA_MAXIMA = 300;

// "Tem projeto" = a empresa projeta e desenvolve o produto que vende.
// Só pesa onde o requisito de projeto entra no escopo: ISO 9001 e PBQP-H.
export const PCT_PROJETO = 20;

// tipo 'projeto': preço fechado. tipo 'mensal': horas por mês, contrato de 6 ou
// 12 meses pago em 6 ou 12 parcelas SEM juros (decisão do Anders).
export const SERVICOS = [
  { slug: 'iso-9001', nome: 'Implantação da ISO 9001', horas: 120, tipo: 'projeto', perguntaProjeto: true },
  { slug: 'pbqp-h', nome: 'Implantação do PBQP-H', horas: 120, tipo: 'projeto', perguntaProjeto: true },
  { slug: 'mapeamento-processos', nome: 'Mapeamento e Padronização de Processos', horas: 80, tipo: 'projeto' },
  { slug: 'planejamento-estrategico', nome: 'Planejamento Estratégico', horas: 60, tipo: 'projeto' },
  { slug: 'inovacao', nome: 'Consultoria em Inovação', horas: 60, tipo: 'projeto' },
  { slug: 'presenca-digital', nome: 'Planejamento de Presença Digital', horas: 60, tipo: 'projeto' },
  { slug: '5s', nome: 'Implantação do 5S', horas: 40, tipo: 'projeto' },
  { slug: 'controles-financeiros', nome: 'Controles Financeiros', horas: 40, tipo: 'projeto' },
  { slug: 'indicadores-financeiros', nome: 'Indicadores Econômico-Financeiros', horas: 40, tipo: 'projeto' },
  { slug: 'custos-preco-venda', nome: 'Custos e Formação de Preço de Venda', horas: 40, tipo: 'projeto' },
  { slug: 'planejamento-financeiro', nome: 'Planejamento Financeiro', horas: 40, tipo: 'projeto' },
  { slug: 'compras-estoques', nome: 'Gestão de Compras e Estoques', horas: 40, tipo: 'projeto' },
  { slug: 'plano-de-negocio', nome: 'Plano de Negócio', horas: 40, tipo: 'projeto' },
  { slug: 'rotinas-operacionais', nome: 'Gestão de Rotinas Operacionais', horas: 20, tipo: 'projeto' },
  { slug: 'auditoria-interna', nome: 'Auditoria Interna', horas: 16, tipo: 'projeto' },
  { slug: 'manutencao-sgq', nome: 'Manutenção do Sistema da Qualidade', horas: 16, tipo: 'mensal', prazos: [6, 12] },
];

export const METODOS = ['pix', 'cartao', 'boleto'];

const centavos = (v) => Math.round(v * 100);
const reais = (c) => c / 100;

export function servicoPorSlug(slug) {
  return SERVICOS.find((s) => s.slug === slug) || null;
}

function faixa(faixas, valor) {
  return faixas.find((f) => valor <= f.ate) || null;
}

// Calcula o preço do serviço. Devolve { erro } ou o detalhamento completo.
// km já é a distância por estrada da cidade escolhida (tabela pré-calculada).
export function calculaPreco({ servico: slug, funcionarios, km, temProjeto = false, meses } = {}) {
  const servico = servicoPorSlug(slug);
  if (!servico) return { erro: 'Serviço não encontrado.' };

  const nFunc = Number(funcionarios);
  if (!Number.isInteger(nFunc) || nFunc < 1) return { erro: 'Informe o número de funcionários.' };

  const dist = Math.round(Number(km));
  if (!Number.isFinite(Number(km)) || km === null || km === '' || dist < 0) return { erro: 'Informe a cidade.' };
  if (dist > DISTANCIA_MAXIMA) {
    return { erro: `Atendemos empresas a até ${DISTANCIA_MAXIMA} km de Passo Fundo pela estrada.`, foraDaArea: true };
  }

  let nMeses = null;
  if (servico.tipo === 'mensal') {
    nMeses = Number(meses);
    if (!servico.prazos.includes(nMeses)) return { erro: `Escolha o prazo do contrato: ${servico.prazos.join(' ou ')} meses.` };
  }

  const fFunc = faixa(FAIXAS_FUNCIONARIOS, nFunc);
  const fDist = faixa(FAIXAS_DISTANCIA, dist);
  const acrescimos = [];
  if (fFunc.pct) acrescimos.push({ motivo: fFunc.rotulo, pct: fFunc.pct });
  if (fDist.pct) acrescimos.push({ motivo: fDist.rotulo, pct: fDist.pct });
  if (servico.perguntaProjeto && temProjeto === true) {
    acrescimos.push({ motivo: 'empresa projeta e desenvolve o produto', pct: PCT_PROJETO });
  }
  const pctTotal = acrescimos.reduce((s, a) => s + a.pct, 0);

  // Base em centavos; acréscimo arredondado uma vez só, sobre a base.
  const horasTotais = servico.tipo === 'mensal' ? servico.horas * nMeses : servico.horas;
  const baseC = horasTotais * VALOR_HORA * 100;
  const acrescimoC = Math.round(baseC * pctTotal / 100);
  const totalC = baseC + acrescimoC;

  return {
    servico: servico.slug,
    nome: servico.nome,
    tipo: servico.tipo,
    horas: servico.horas,
    meses: nMeses,
    horasTotais,
    valorHora: VALOR_HORA,
    funcionarios: nFunc,
    km: dist,
    temProjeto: Boolean(servico.perguntaProjeto && temProjeto === true),
    base: reais(baseC),
    acrescimos,
    pctTotal,
    acrescimo: reais(acrescimoC),
    total: reais(totalC),
  };
}

// Opções de pagamento para um preço já calculado. Projeto: Pix à vista;
// cartão e boleto de 1x a 12x, com 2% a.m. (Price) a partir de 2x.
// Mensal: o número de parcelas é o prazo do contrato, sem juros, em qualquer meio.
export function opcoesPagamento(preco) {
  const totalC = centavos(preco.total);
  const opcoes = [];

  if (preco.tipo === 'mensal') {
    const parcelaC = Math.round(totalC / preco.meses);
    for (const metodo of METODOS) {
      opcoes.push({ metodo, parcelas: preco.meses, valorParcela: reais(parcelaC), total: reais(parcelaC * preco.meses), juros: false });
    }
    return opcoes;
  }

  opcoes.push({ metodo: 'pix', parcelas: 1, valorParcela: reais(totalC), total: reais(totalC), juros: false });
  for (const metodo of ['cartao', 'boleto']) {
    for (let n = 1; n <= MAX_PARCELAS; n++) {
      const parcelaC = n === 1 ? totalC : Math.round(totalC * JUROS_MES / (1 - Math.pow(1 + JUROS_MES, -n)));
      opcoes.push({ metodo, parcelas: n, valorParcela: reais(parcelaC), total: reais(parcelaC * n), juros: n > 1 });
    }
  }
  return opcoes;
}

// Escolhe uma opção válida (o servidor nunca confia no valor vindo da tela).
export function opcaoEscolhida(preco, metodo, parcelas) {
  return opcoesPagamento(preco).find((o) => o.metodo === metodo && o.parcelas === Number(parcelas)) || null;
}
