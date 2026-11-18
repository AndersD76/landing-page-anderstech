// ── Campanhas de busca paga (Bloco 6) — fonte única dos CSVs ─────────────────
// csvsGoogleAdsEditor() (abaixo) gera os CSVs de importação, servidos no painel
// em /api/admin/midia/<arquivo>.csv, e
// test/crescimento.test.js barra título > 30, descrição > 90, caminho > 15,
// sitelink > 25 e frase de destaque > 25 caracteres (limites conferidos na
// ajuda oficial do Google Ads em 18/11/2026).
//
// Palavras-chave: ESTIMATIVA. Saíram do autocomplete do Google (18/11/2026) e
// das buscas reais do ICP em docs/trafego/contexto.md — sem Keyword Planner
// (não há credencial da API). Volume e CPC: conferir no Planejador antes de subir.
//
// Todo texto de anúncio só promete o que o site entrega HOJE. Ex.: "preço na
// hora" é verdade (/contratar calcula); "pague online" NÃO entra enquanto o
// pagamento da consultoria estiver desligado (faltam os dados da CONTRATADA).

const SITE = 'https://anderstech.net';

export const NEGATIVAS_CONSULTORIA = [
  'grátis', 'gratis', 'gratuito', 'gratuita', 'pdf', 'download', 'baixar', 'apostila', 'tcc', 'monografia', 'wikipedia',
  'emprego', 'vaga', 'vagas', 'salário', 'estágio', 'concurso', 'curso', 'cursos', 'treinamento', 'senai', 'senac',
  'iso 14001', 'iso 45001', 'iso 27001', 'iso 17025', 'iso 22000', 'fssc', 'bpf', 'haccp', 'appcc', 'iso 13485',
  'norma completa', 'comprar norma', 'abnt catálogo', 'draft', 'auditor líder', 'lead auditor',
];

export const NEGATIVAS_EAD = [
  'grátis', 'gratis', 'gratuito', 'gratuita', 'pdf', 'download', 'baixar', 'apostila', 'emprego', 'vaga', 'vagas', 'concurso',
  'consultoria', 'iso 14001', 'iso 45001', 'senai', 'senac',
];

// Correspondência: "Frase" e "Exata" (nada de ampla no início — sem histórico
// de conversão, ampla compra tráfego que não é o ICP).
export const CAMPANHAS = [
  {
    nome: 'consultoria-iso-9001-rs',
    orcamentoDia: 30,
    lance: 'CPC manual',
    status: 'Paused',          // sobe pausada: o Anders liga depois de revisar
    local: 'Raio de 300 km de Passo Fundo/RS',
    idioma: 'Português',
    horario: 'Seg–sex 7h–19h · sáb 8h–12h',
    negativas: NEGATIVAS_CONSULTORIA,
    grupos: [
      {
        nome: 'consultoria-iso-9001', cpcMax: 6,
        url: `${SITE}/iso-9001`,
        palavras: [['consultoria iso 9001', 'Exata'], ['consultoria iso 9001', 'Frase'], ['empresa de consultoria iso 9001', 'Frase'],
          ['consultoria iso 9001 rs', 'Frase'], ['consultoria iso 9001 rio grande do sul', 'Frase'], ['consultoria para certificação iso 9001', 'Frase'],
          ['implantação iso 9001', 'Frase'], ['consultoria iso 9001 online', 'Frase']],
        titulos: ['Consultoria ISO 9001 no RS', 'Preço Calculado na Hora', 'Sem Parar a Produção',
          'Até 300 km de Passo Fundo', 'Consultoria Desde 2004', 'ISO 9001 e PBQP-H', 'Calcule o Preço no Site',
          'Fale com o Consultor', 'Já Pela Versão 2026', 'Indústrias e Construtoras'],
        descricoes: ['Consultoria ISO 9001 para indústrias e construtoras do RS. Calcule o preço no site agora.',
          'Preço por hora, porte e distância: veja o valor antes de falar com alguém. Até 300 km.',
          'Sistema que funciona na fábrica, não só no papel. Implantação já pelos requisitos de 2026.'],
        caminho: ['iso-9001', 'consultoria'],
      },
      {
        nome: 'preco-iso-9001', cpcMax: 6,
        url: `${SITE}/contratar?servico=iso-9001`,
        palavras: [['quanto custa certificação iso 9001', 'Frase'], ['quanto custa iso 9001', 'Frase'], ['preço certificação iso 9001', 'Frase'],
          ['valor consultoria iso 9001', 'Frase'], ['consultoria iso 9001 preço', 'Frase'], ['custo certificação iso 9001', 'Frase'],
          ['quanto custa uma consultoria iso 9001', 'Exata']],
        titulos: ['Quanto Custa a ISO 9001?', 'Preço Calculado na Hora', 'Veja o Valor Antes de Ligar',
          'R$ 180 por Hora de Consultoria', 'Porte e Cidade Definem o Preço', 'Consultoria ISO 9001 no RS',
          'Sem Proposta Escondida', 'Até 300 km de Passo Fundo'],
        descricoes: ['Informe porte e cidade da empresa e veja na hora o preço da consultoria ISO 9001.',
          'Hora a R$ 180, com acréscimos claros por porte e distância. Sem esperar proposta.'],
        caminho: ['preco', 'iso-9001'],
      },
      {
        nome: 'transicao-iso-9001-2026', cpcMax: 4,
        url: `${SITE}/transicao-iso-9001-2026`,
        palavras: [['iso 9001 2026', 'Frase'], ['iso 9001:2026', 'Frase'], ['transição iso 9001', 'Frase'], ['nova iso 9001', 'Frase'],
          ['iso 9001 2026 o que mudou', 'Frase'], ['iso 9001 2026 prazo', 'Frase'], ['migração iso 9001 2026', 'Frase'],
          ['transição iso 9001 2015 para 2026', 'Frase']],
        titulos: ['ISO 9001:2026 Já Saiu', 'Prazo Final: 30/09/2029', 'Diagnóstico de Transição',
          'Grátis e com Resultado na Hora', 'O Que Mudou na ISO 9001', '10 Perguntas, 5 Minutos',
          'Consultoria ISO 9001 no RS', 'Planeje a Transição Agora'],
        descricoes: ['A ISO 9001:2026 saiu em 16/09/2026. Veja na hora o que falta no seu sistema.',
          'Certificado 2015 vale até 30/09/2029. Diagnóstico grátis, resultado sem cadastro.'],
        caminho: ['iso-9001-2026', 'transicao'],
      },
      {
        nome: 'consultoria-iso-9001-cidades', cpcMax: 5,
        url: `${SITE}/iso-9001`,
        urlPorPalavra: {
          'consultoria iso 9001 passo fundo': `${SITE}/consultoria-iso-9001-passo-fundo`,
          'consultoria iso 9001 erechim': `${SITE}/consultoria-iso-9001-erechim`,
          'consultoria iso 9001 caxias do sul': `${SITE}/consultoria-iso-9001-caxias-do-sul`,
          'consultoria iso 9001 carazinho': `${SITE}/consultoria-iso-9001-carazinho`,
          'consultoria iso 9001 marau': `${SITE}/consultoria-iso-9001-marau`,
          'consultoria iso 9001 bento gonçalves': `${SITE}/consultoria-iso-9001-bento-goncalves`,
          'consultoria iso 9001 porto alegre': `${SITE}/consultoria-iso-9001-porto-alegre`,
        },
        palavras: [['consultoria iso 9001 passo fundo', 'Frase'], ['consultoria iso 9001 erechim', 'Frase'],
          ['consultoria iso 9001 caxias do sul', 'Frase'], ['consultoria iso 9001 carazinho', 'Frase'],
          ['consultoria iso 9001 marau', 'Frase'], ['consultoria iso 9001 bento gonçalves', 'Frase'],
          ['consultoria iso 9001 porto alegre', 'Frase']],
        titulos: ['Consultoria ISO 9001 no RS', 'Sede em Passo Fundo', 'Preço Calculado na Hora',
          'Atendimento Presencial', 'Consultoria Desde 2004', 'Indústrias e Construtoras'],
        descricoes: ['Consultor com sede em Passo Fundo, atendimento presencial a até 300 km. Preço na hora.',
          'ISO 9001 e PBQP-H para indústrias e construtoras do RS. Calcule o valor no site.'],
        caminho: ['iso-9001', 'rs'],
      },
    ],
  },
  {
    nome: 'consultoria-pbqp-h-rs',
    orcamentoDia: 10,
    lance: 'CPC manual',
    status: 'Paused',
    local: 'Raio de 300 km de Passo Fundo/RS',
    idioma: 'Português',
    horario: 'Seg–sex 7h–19h · sáb 8h–12h',
    negativas: NEGATIVAS_CONSULTORIA,
    grupos: [
      {
        nome: 'consultoria-pbqp-h', cpcMax: 5,
        url: `${SITE}/pbqp-h`,
        palavras: [['consultoria pbqp-h', 'Exata'], ['consultoria pbqp-h', 'Frase'], ['certificação pbqp-h', 'Frase'],
          ['pbqp-h nível a', 'Frase'], ['como conseguir pbqp-h', 'Frase'], ['pbqp-h construtora', 'Frase'], ['siac pbqp-h consultoria', 'Frase']],
        titulos: ['Consultoria PBQP-H no RS', 'PBQP-H Nível A e B', 'Preço Calculado na Hora',
          'Até 300 km de Passo Fundo', 'Consultoria Desde 2004', 'Construtoras do RS'],
        descricoes: ['PBQP-H para construtoras: implantação e manutenção do SiAC. Calcule o preço no site.',
          'Atendimento presencial a até 300 km de Passo Fundo. Preço por hora com acréscimos claros.'],
        caminho: ['pbqp-h', 'construtoras'],
      },
      {
        nome: 'preco-pbqp-h', cpcMax: 5,
        url: `${SITE}/contratar?servico=pbqp-h`,
        palavras: [['quanto custa pbqp-h', 'Frase'], ['preço pbqp-h', 'Frase'], ['valor certificação pbqp-h', 'Frase'], ['custo pbqp-h', 'Frase']],
        titulos: ['Quanto Custa o PBQP-H?', 'Preço Calculado na Hora', 'Veja o Valor Antes de Ligar',
          'R$ 180 por Hora de Consultoria', 'Consultoria PBQP-H no RS', 'Construtoras do RS'],
        descricoes: ['Informe porte e cidade da construtora e veja na hora o preço da consultoria PBQP-H.',
          'Hora a R$ 180, com acréscimos claros por porte e distância. Sem esperar proposta.'],
        caminho: ['preco', 'pbqp-h'],
      },
    ],
  },
  {
    // EAD: só os cursos que não dependem da versão da norma. Os de ISO 9001
    // (interpretação e auditor interno) são da versão 2015 e ficam FORA da mídia
    // até serem atualizados para a 2026 (LANCAMENTO.md, TODO-VALIDAR).
    nome: 'ead-cursos-brasil',
    orcamentoDia: 10,
    lance: 'CPC manual',
    status: 'Paused',
    local: 'Brasil',
    idioma: 'Português',
    horario: 'Todos os dias',
    negativas: NEGATIVAS_EAD,
    grupos: [
      {
        nome: 'curso-5s', cpcMax: 2,
        url: `${SITE}/ead/curso/5s-pratica-industrial`,
        palavras: [['curso 5s online', 'Frase'], ['curso 5s com certificado', 'Frase'], ['curso 5s', 'Exata'], ['treinamento 5s online', 'Frase']],
        titulos: ['Curso 5S Online', 'Com Certificado', '5S na Prática Industrial', 'Templates Prontos',
          'Acesso Vitalício', 'Pix, Cartão ou Boleto'],
        descricoes: ['Curso online de 5S para a indústria, com templates prontos e certificado de conclusão.',
          'Aprenda a implantar o 5S no chão de fábrica no seu ritmo. Acesso vitalício.'],
        caminho: ['curso', '5s'],
      },
      {
        nome: 'curso-processos-indicadores', cpcMax: 2,
        url: `${SITE}/ead/curso/gestao-processos-indicadores`,
        palavras: [['curso gestão por processos', 'Frase'], ['curso indicadores de desempenho', 'Frase'],
          ['curso kpi online', 'Frase'], ['curso mapeamento de processos online', 'Frase']],
        titulos: ['Curso de Processos e KPIs', 'Gestão por Processos Online', 'Com Certificado',
          'Templates Prontos', 'Acesso Vitalício', 'Pix, Cartão ou Boleto'],
        descricoes: ['Mapeie processos e monte indicadores que a diretoria usa. Curso online com certificado.',
          'Do mapeamento ao painel de indicadores, com templates prontos. Acesso vitalício.'],
        caminho: ['curso', 'processos'],
      },
    ],
  },
];

export const SITELINKS = [
  { texto: 'Preço na Hora', d1: 'Calcule pelo porte e cidade', d2: 'Hora a R$ 180, sem surpresa', url: `${SITE}/contratar` },
  { texto: 'Diagnóstico ISO 2026', d1: '10 perguntas, 5 minutos', d2: 'Resultado na hora, grátis', url: `${SITE}/transicao-iso-9001-2026` },
  { texto: 'O Que Muda na 2026', d1: 'Mudanças requisito a requisito', d2: 'Prazo final: 30/09/2029', url: `${SITE}/iso-9001-2026` },
  { texto: 'Consultoria PBQP-H', d1: 'Nível A e B do SiAC', d2: 'Construtoras do RS', url: `${SITE}/pbqp-h` },
];

export const CALLOUTS = ['Preço na hora no site', 'Até 300 km de Passo Fundo', 'Consultoria desde 2004', 'Diagnóstico 2026 grátis', 'ISO 9001 e PBQP-H'];

export const LIMITES = { titulo: 30, descricao: 90, caminho: 15, sitelink: 25, sitelinkDesc: 35, callout: 25 };

// ── Arquivos de importação do Google Ads Editor (um por tipo de entidade) ──
const csvCampo = (v) => { const s = v == null ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const tabela = (cab, linhas) => [cab.join(','), ...linhas.map(l => l.map(csvCampo).join(','))].join('\r\n') + '\r\n';

export function csvsGoogleAdsEditor() {
  const consultoria = CAMPANHAS.filter(k => !k.nome.startsWith('ead'));
  return {
    '1-campanhas.csv': tabela(['Campaign', 'Campaign Type', 'Campaign Daily Budget', 'Bid Strategy Type', 'Networks', 'Languages', 'Status'],
      CAMPANHAS.map(k => [k.nome, 'Search', k.orcamentoDia.toFixed(2), 'Manual CPC', 'Google search', 'pt', k.status])),
    '2-grupos.csv': tabela(['Campaign', 'Ad Group', 'Max CPC', 'Status'],
      CAMPANHAS.flatMap(k => k.grupos.map(g => [k.nome, g.nome, g.cpcMax.toFixed(2), 'Enabled']))),
    '3-palavras.csv': tabela(['Campaign', 'Ad Group', 'Keyword', 'Criterion Type', 'Final URL', 'Status'],
      CAMPANHAS.flatMap(k => k.grupos.flatMap(g => g.palavras.map(([p, tipo]) => [k.nome, g.nome, p, tipo === 'Exata' ? 'Exact' : 'Phrase', (g.urlPorPalavra && g.urlPorPalavra[p]) || '', 'Enabled'])))),
    '4-negativas.csv': tabela(['Campaign', 'Keyword', 'Criterion Type'],
      CAMPANHAS.flatMap(k => k.negativas.map(n => [k.nome, n, 'Campaign negative phrase']))),
    '5-anuncios-rsa.csv': tabela(['Campaign', 'Ad Group', 'Ad type', ...Array.from({ length: 15 }, (_, i) => 'Headline ' + (i + 1)), ...Array.from({ length: 4 }, (_, i) => 'Description ' + (i + 1)), 'Path 1', 'Path 2', 'Final URL', 'Status'],
      CAMPANHAS.flatMap(k => k.grupos.map(g => [k.nome, g.nome, 'Responsive search ad', ...g.titulos, ...Array(15 - g.titulos.length).fill(''), ...g.descricoes, ...Array(4 - g.descricoes.length).fill(''), g.caminho[0] || '', g.caminho[1] || '', g.url, 'Enabled']))),
    '6-sitelinks.csv': tabela(['Campaign', 'Sitelink text', 'Description line 1', 'Description line 2', 'Final URL'],
      consultoria.flatMap(k => SITELINKS.map(s => [k.nome, s.texto, s.d1, s.d2, s.url]))),
    '7-callouts.csv': tabela(['Campaign', 'Callout text'], consultoria.flatMap(k => CALLOUTS.map(t => [k.nome, t]))),
  };
}
