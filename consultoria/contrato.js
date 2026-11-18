// ── Contrato de prestação de serviços de consultoria ──────────────────────────
// Texto aprovado pelo Anders em 18/11/2026 (revisado no doc "Contrato de
// Consultoria — Anders Tech"). Vale para TODOS os serviços de consultoria
// vendidos no site; não vale para os cursos EAD.
//
// Uma fonte, dois usos:
// - sem dados de pedido: a versão genérica que o cliente lê antes de pagar
//   (/contrato-consultoria);
// - com os dados do pedido pago: o contrato preenchido, em PDF, enviado ao
//   cliente e ao Anders (contratoPDF).
// Mudou o texto? Troque CONTRATO_VERSAO: o pedido guarda a versão aceita.

import PDFDocument from 'pdfkit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { EMPRESA } from '../config/empresa.js';
import {
  VALOR_HORA, JUROS_MES, MAX_PARCELAS, PCT_PROJETO, DISTANCIA_MAXIMA,
  FAIXAS_FUNCIONARIOS, FAIXAS_DISTANCIA,
} from './preco.js';

export const CONTRATO_VERSAO = '2026-11-18';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'assets', 'fonts');

export function moeda(v) {
  return 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function dataHora(d) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(d));
}

const METODO_ROTULO = { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto' };

// Dados da CONTRATADA completos? Sem eles o contrato não pode ser gerado.
export function contratadaCompleta() {
  return Boolean(EMPRESA.razaoSocial && EMPRESA.endereco && EMPRESA.representante && EMPRESA.cpfRepresentante);
}

const pct = (n) => `${n}%`;
const faixaTexto = (f, i, lista, un) => {
  const ini = i === 0 ? (un === 'km' ? 0 : 1) : lista[i - 1].ate + 1;
  if (f.ate === Infinity) return `mais de ${lista[i - 1].ate} ${un}`;
  return i === 0 ? `até ${f.ate} ${un}` : `${ini} a ${f.ate} ${un}`;
};

// Blocos: { t:'p', rotulo?, texto } | { t:'lista', itens } | { t:'tabela', cab, linhas }
// `p` = dados do pedido (null na versão genérica).
export function clausulas(p = null) {
  const c = p?.contratante;
  const ped = p?.pedido;
  const contratada = `${EMPRESA.razaoSocial || '[PREENCHER: razão social]'}, nome fantasia Anders Tech, inscrita no CNPJ ${EMPRESA.cnpj}, com sede em ${EMPRESA.endereco || '[PREENCHER: endereço]'}, Passo Fundo/RS, representada por ${EMPRESA.representante || '[PREENCHER: representante]'}, CPF ${EMPRESA.cpfRepresentante || '[PREENCHER: CPF]'}`;
  const contratante = c
    ? `${c.razaoSocial}, inscrita no CNPJ ${c.cnpj}, com sede em ${c.endereco}, ${c.cidade}/${c.uf}, CEP ${c.cep}, representada por ${c.representante}, ${c.cargo}, CPF ${c.cpf}, e-mail ${c.email}, telefone ${c.telefone}`
    : 'a empresa identificada no resumo do pedido, com os dados de razão social, CNPJ, endereço, representante, e-mail e telefone informados no momento da contratação pelo site';

  const objeto = ped
    ? (ped.tipo === 'mensal'
      ? `A CONTRATADA presta à CONTRATANTE o serviço de consultoria ${ped.servicoNome}, com carga de ${ped.horas} horas por mês, pelo prazo de ${ped.meses} meses (${ped.horasTotais} horas no total), conforme o escopo descrito na página do serviço no site na data do aceite, que integra este contrato.`
      : `A CONTRATADA presta à CONTRATANTE o serviço de consultoria ${ped.servicoNome}, com carga horária de ${ped.horas} horas de trabalho técnico, conforme o escopo descrito na página do serviço no site na data do aceite, que integra este contrato.`)
    : 'A CONTRATADA presta à CONTRATANTE o serviço de consultoria indicado no resumo do pedido, com a carga horária ali informada, conforme o escopo descrito na página do serviço no site na data do aceite, que integra este contrato. Na Manutenção do Sistema da Qualidade, a carga é de 16 horas por mês, pelo prazo de 6 ou 12 meses escolhido no pedido.';

  const precoBlocos = ped
    ? [
      { t: 'p', texto: `O preço é de ${moeda(ped.total)}, calculado assim:` },
      {
        t: 'tabela', cab: ['Composição', 'Valor'],
        linhas: [
          [`${ped.horasTotais} horas × ${moeda(VALOR_HORA)}`, moeda(ped.base)],
          ...ped.acrescimos.map((a) => [`Acréscimo de ${pct(a.pct)}: ${a.motivo}`, moeda(Math.round(ped.base * a.pct) / 100)]),
          ['Total', moeda(ped.total)],
        ],
      },
      { t: 'p', texto: `Dados declarados pela CONTRATANTE: ${ped.funcionarios} funcionários; sede a ${ped.km} km de Passo Fundo pela estrada${ped.perguntaProjeto ? `; ${ped.temProjeto ? 'projeta' : 'não projeta'} e desenvolve o produto que vende` : ''}.` },
    ]
    : [
      { t: 'p', texto: `O preço é o indicado no resumo do pedido, calculado pela hora técnica de ${moeda(VALOR_HORA)} multiplicada pela carga horária, mais os acréscimos abaixo, que se somam:` },
      {
        t: 'tabela', cab: ['Critério', 'Faixa', 'Acréscimo'],
        linhas: [
          ...FAIXAS_FUNCIONARIOS.map((f, i, l) => ['Funcionários', faixaTexto(f, i, l, 'funcionários'), pct(f.pct)]),
          ...FAIXAS_DISTANCIA.map((f, i, l) => ['Distância de Passo Fundo, por estrada', faixaTexto(f, i, l, 'km'), pct(f.pct)]),
          ['Projeta e desenvolve o produto que vende (só ISO 9001 e PBQP-H)', 'sim', pct(PCT_PROJETO)],
        ],
      },
    ];

  const jurosTxt = `${String(JUROS_MES * 100).replace('.', ',')}% ao mês (tabela Price)`;
  const pagamentoBlocos = ped
    ? [
      { t: 'p', texto: `Forma escolhida: ${METODO_ROTULO[ped.metodo]}, em ${ped.parcelas === 1 ? 'parcela única' : `${ped.parcelas} parcelas`} de ${moeda(ped.valorParcela)}, total de ${moeda(ped.totalPago)}${ped.totalPago > ped.total ? `, já com juros de ${jurosTxt}` : ', sem juros'}. O pagamento é feito pela plataforma Asaas.` },
    ]
    : [
      { t: 'p', texto: 'O pagamento é feito no site, pela plataforma Asaas, na forma escolhida pela CONTRATANTE:' },
      {
        t: 'tabela', cab: ['Forma', 'Parcelas', 'Juros'],
        linhas: [
          ['Pix', 'à vista', 'sem juros'],
          ['Cartão de crédito', `1x a ${MAX_PARCELAS}x`, `1x sem juros; 2x a ${MAX_PARCELAS}x com ${jurosTxt}`],
          ['Boleto', `1x a ${MAX_PARCELAS}x`, `1x sem juros; 2x a ${MAX_PARCELAS}x com ${jurosTxt}`],
          ['Manutenção do Sistema da Qualidade, qualquer forma', '6 ou 12, igual ao prazo do contrato', 'sem juros'],
        ],
      },
    ];

  return [
    {
      titulo: 'Cláusula 1 — Partes',
      blocos: [
        { t: 'p', rotulo: 'CONTRATADA:', texto: contratada + '.' },
        { t: 'p', rotulo: 'CONTRATANTE:', texto: contratante + '.' },
        { t: 'p', texto: 'A CONTRATANTE declara que os dados informados são verdadeiros e que o responsável que aceita este contrato tem poderes para contratar em nome da empresa.' },
      ],
    },
    {
      titulo: 'Cláusula 2 — Objeto',
      blocos: [
        { t: 'p', texto: objeto },
        { t: 'p', texto: 'As horas incluem atividades presenciais na sede da CONTRATANTE e atividades remotas (análise de documentos, elaboração de materiais, reuniões online), na proporção definida no cronograma.' },
        { t: 'p', texto: 'Serviços fora do escopo, como horas adicionais, novas unidades ou outros sistemas de gestão, só são feitos mediante novo orçamento aceito por escrito.' },
      ],
    },
    {
      titulo: 'Cláusula 3 — Preço',
      blocos: [
        ...precoBlocos,
        { t: 'p', texto: `A CONTRATADA não atende empresas a mais de ${DISTANCIA_MAXIMA} km de Passo Fundo pela estrada.` },
        { t: 'p', rotulo: 'Está incluído no preço:', texto: 'o trabalho técnico, o deslocamento, a hospedagem e a alimentação da equipe da CONTRATADA nas visitas.' },
        { t: 'p', rotulo: 'Não está incluído:', texto: 'as taxas do organismo certificador ou de avaliação (auditorias de certificação, manutenção e recertificação), compra de normas técnicas, softwares, equipamentos, calibrações e qualquer adequação física da empresa. Esses custos são contratados e pagos diretamente pela CONTRATANTE.' },
        { t: 'p', texto: 'O número de funcionários e a resposta sobre projeto são declarados pela CONTRATANTE. Se a informação estiver errada, a CONTRATADA pode cobrar a diferença do acréscimo correto.' },
      ],
    },
    {
      titulo: 'Cláusula 4 — Pagamento',
      blocos: [
        ...pagamentoBlocos,
        { t: 'p', texto: 'No boleto e no Pix parcelados, a primeira parcela vence em até 3 dias e as demais, a cada 30 dias. No cartão, as parcelas seguem a fatura da operadora.' },
        { t: 'p', texto: 'Atraso no pagamento gera multa de 2% e juros de mora de 1% ao mês sobre a parcela vencida. Atraso superior a 30 dias permite à CONTRATADA suspender os serviços até a regularização, sem prejuízo da cobrança.' },
        { t: 'p', texto: 'A nota fiscal de serviço é emitida pela CONTRATADA após a confirmação de cada pagamento.' },
      ],
    },
    {
      titulo: 'Cláusula 5 — Início e execução',
      blocos: [
        { t: 'p', texto: 'A CONTRATADA entra em contato com a CONTRATANTE em até 2 dias úteis após a confirmação do primeiro pagamento, para agendar a reunião de início.' },
        { t: 'p', texto: 'Na reunião de início, as partes definem o cronograma das atividades, as datas das visitas e os responsáveis da CONTRATANTE. O cronograma pode ser ajustado por acordo entre as partes, registrado por e-mail ou WhatsApp.' },
        { t: 'p', texto: 'As horas contratadas devem ser utilizadas em até 12 meses a partir do primeiro pagamento. Horas não utilizadas nesse prazo por motivo da CONTRATANTE, como falta de disponibilidade da equipe ou adiamento de visitas, não são devolvidas.' },
        { t: 'p', texto: 'Visita cancelada pela CONTRATANTE com menos de 48 horas de antecedência conta como realizada, quando a equipe da CONTRATADA já tiver se deslocado.' },
      ],
    },
    {
      titulo: 'Cláusula 6 — Obrigações da CONTRATADA',
      blocos: [{
        t: 'lista', itens: [
          'Executar o serviço com técnica e diligência, dentro do escopo e da carga horária contratados.',
          'Cumprir o cronograma combinado e avisar a CONTRATANTE com antecedência de qualquer reagendamento.',
          'Entregar os documentos, modelos e relatórios previstos no escopo.',
          'Informar à CONTRATANTE, ao final de cada visita ou etapa, as horas utilizadas e as pendências.',
          'Manter sigilo sobre as informações da CONTRATANTE, nos termos da Cláusula 10.',
        ],
      }],
    },
    {
      titulo: 'Cláusula 7 — Obrigações da CONTRATANTE',
      blocos: [{
        t: 'lista', itens: [
          'Pagar o preço nas condições da Cláusula 4.',
          'Indicar um responsável interno pelo projeto, com autonomia para decidir e mobilizar a equipe.',
          'Fornecer as informações, os documentos e o acesso às instalações necessários, nos prazos do cronograma.',
          'Garantir a participação das pessoas convocadas nas reuniões, treinamentos e visitas.',
          'Implantar as ações que forem de sua responsabilidade. A execução das rotinas do sistema de gestão é da CONTRATANTE, não da CONTRATADA.',
        ],
      }],
    },
    {
      titulo: 'Cláusula 8 — Natureza do serviço',
      blocos: [
        { t: 'p', texto: 'A consultoria é uma obrigação de meio: a CONTRATADA se compromete a aplicar o método e o trabalho técnico contratados, não a garantir um resultado.' },
        { t: 'p', texto: 'A certificação ISO 9001 ou a qualificação no PBQP-H é concedida exclusivamente pelo organismo certificador ou de avaliação escolhido e contratado pela CONTRATANTE. A CONTRATADA prepara a empresa para a auditoria, mas a decisão de certificar não depende dela.' },
        { t: 'p', texto: 'O resultado dos serviços de gestão, como os financeiros, de processos e de estratégia, depende também da adoção das práticas pela CONTRATANTE.' },
      ],
    },
    {
      titulo: 'Cláusula 9 — Arrependimento, cancelamento e reembolso',
      blocos: [
        { t: 'p', rotulo: 'Arrependimento:', texto: 'a CONTRATANTE pode desistir em até 7 dias após o aceite, com devolução integral do valor pago, desde que nenhuma atividade tenha sido realizada a pedido dela nesse período.' },
        { t: 'p', rotulo: 'Cancelamento pela CONTRATANTE, depois de 7 dias:', texto: 'a CONTRATADA devolve o valor das horas não executadas, descontada uma multa de 20% sobre esse valor. As horas executadas e os juros de parcelamento já incorridos não são devolvidos.' },
        { t: 'p', rotulo: 'Manutenção do Sistema da Qualidade:', texto: 'o cancelamento antes do fim do prazo de 6 ou 12 meses exige aviso de 30 dias e gera multa de 20% sobre as parcelas restantes.' },
        { t: 'p', rotulo: 'Cancelamento pela CONTRATADA:', texto: 'a CONTRATADA pode encerrar o contrato se a CONTRATANTE atrasar o pagamento por mais de 30 dias ou deixar de cumprir a Cláusula 7 depois de avisada por escrito. Se a CONTRATADA encerrar o contrato sem motivo da CONTRATANTE, devolve integralmente o valor das horas não executadas.' },
        { t: 'p', texto: 'Devoluções são feitas em até 10 dias úteis: por estorno no cartão ou por transferência para conta da CONTRATANTE.' },
      ],
    },
    {
      titulo: 'Cláusula 10 — Confidencialidade e proteção de dados',
      blocos: [
        { t: 'p', texto: 'As partes mantêm sigilo sobre as informações técnicas, comerciais e financeiras a que tiverem acesso, durante o contrato e por 2 anos após o seu fim. O sigilo não vale para informação pública ou exigida por lei ou ordem judicial.' },
        { t: 'p', texto: 'Os dados pessoais tratados na contratação (nome, CPF, e-mail, telefone e IP do responsável) servem para executar este contrato, emitir nota fiscal e cumprir obrigações legais, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018) e a Política de Privacidade do site (anderstech.net/politica-de-privacidade).' },
        { t: 'p', texto: 'Quando a CONTRATADA tiver acesso a dados pessoais de funcionários ou clientes da CONTRATANTE durante o serviço, atua como operadora: trata esses dados só para executar o contrato e os elimina ou devolve ao final.' },
      ],
    },
    {
      titulo: 'Cláusula 11 — Documentos produzidos e propriedade intelectual',
      blocos: [
        { t: 'p', texto: 'Os documentos elaborados especificamente para a CONTRATANTE, como manuais, procedimentos, mapas de processo e planilhas preenchidas, passam a ser da CONTRATANTE após a quitação do preço.' },
        { t: 'p', texto: 'A metodologia, os modelos em branco e os materiais de treinamento da CONTRATADA continuam sendo dela. A CONTRATANTE recebe licença de uso interno, sem direito de revenda ou distribuição a terceiros.' },
        { t: 'p', texto: 'A CONTRATADA só usa o nome ou a marca da CONTRATANTE como referência comercial, em site, proposta ou estudo de caso, com autorização por escrito.' },
      ],
    },
    {
      titulo: 'Cláusula 12 — Aceite eletrônico, disposições gerais e foro',
      blocos: [
        { t: 'p', texto: 'Este contrato é aceito eletronicamente no site, ao marcar "Li e aceito o contrato" antes do pagamento. A CONTRATADA registra a versão do contrato, a data, a hora e o IP do aceite, e envia uma cópia para o e-mail da CONTRATANTE. As partes reconhecem esse aceite como válido, nos termos do art. 10, § 2º, da Medida Provisória 2.200-2/2001.' },
        ...(ped ? [{ t: 'p', rotulo: 'Registro do aceite:', texto: `pedido nº ${ped.id}, versão ${ped.versao} do contrato, aceito em ${dataHora(ped.aceiteEm)} (horário de Brasília), IP ${ped.aceiteIp}. Primeiro pagamento confirmado em ${dataHora(ped.pagoEm)}.` }] : []),
        { t: 'p', texto: 'O contrato vigora do aceite até a conclusão do escopo ou o fim do prazo da Cláusula 5, o que vier primeiro. Na Manutenção do Sistema da Qualidade, vigora pelo prazo contratado de 6 ou 12 meses.' },
        { t: 'p', texto: 'As comunicações entre as partes são feitas pelos e-mails e telefones informados na contratação. A tolerância de uma parte com o descumprimento da outra não altera este contrato.' },
        { t: 'p', texto: 'Fica eleito o foro da comarca de Passo Fundo/RS para resolver qualquer questão deste contrato.' },
      ],
    },
  ];
}

// ── HTML (página pública e e-mail) ────────────────────────────────────────────
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function contratoHTML(p = null) {
  return clausulas(p).map((cl) => {
    const corpo = cl.blocos.map((b) => {
      if (b.t === 'lista') return `<ol>${b.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
      if (b.t === 'tabela') {
        return `<div class="tabela"><table><thead><tr>${b.cab.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
          b.linhas.map((l) => `<tr>${l.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
      return `<p>${b.rotulo ? `<strong>${esc(b.rotulo)}</strong> ` : ''}${esc(b.texto)}</p>`;
    }).join('\n');
    return `<section class="clausula"><h2>${esc(cl.titulo)}</h2>\n${corpo}</section>`;
  }).join('\n');
}

// ── PDF do contrato preenchido (identidade de artefato: navy, vermelho, Poppins, diamante) ──
const NAVY = '#0b1730';
const NAVY_SOFT = '#46577a';
const VERMELHO = '#d80a0a';
const FILETE = '#c9d2e0';
const FUNDO = '#f4f6fa';
const MM = 72 / 25.4;
const MARGEM = 20 * MM;

function diamante(doc, x, y, lado, cor) {
  doc.save().translate(x, y).rotate(45).rect(-lado / 2, -lado / 2, lado, lado).fillColor(cor).fill().restore();
}

// Devolve uma Promise<Buffer>: o PDF vai como anexo do e-mail e como download.
export function contratoPDF(p) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: MARGEM, bottom: 24 * MM, left: MARGEM, right: MARGEM }, bufferPages: true, info: {
      Title: `Contrato de Consultoria nº ${p.pedido.id} — Anders Tech`, Author: 'Anders Tech',
    } });
    const partes = [];
    doc.on('data', (b) => partes.push(b));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    doc.registerFont('Poppins', join(FONTS_DIR, 'Poppins-Regular.ttf'));
    doc.registerFont('Poppins-SemiBold', join(FONTS_DIR, 'Poppins-SemiBold.ttf'));
    doc.registerFont('Poppins-Bold', join(FONTS_DIR, 'Poppins-Bold.ttf'));

    const largura = doc.page.width - 2 * MARGEM;

    // Faixa navy do título
    doc.rect(0, 0, doc.page.width, 34 * MM).fill(NAVY);
    diamante(doc, MARGEM + 4, 17 * MM, 7, VERMELHO);
    doc.font('Poppins-Bold').fontSize(15).fillColor('#ffffff')
      .text('Contrato de Prestação de Serviços de Consultoria', MARGEM + 14, 11 * MM, { width: largura - 14 });
    doc.font('Poppins').fontSize(9).fillColor('#b9c8e4')
      .text(`Pedido nº ${p.pedido.id} · ${p.pedido.servicoNome} · versão ${p.pedido.versao}`, MARGEM + 14, 21 * MM, { width: largura - 14 });
    doc.y = 42 * MM;

    for (const cl of clausulas(p)) {
      if (doc.y > doc.page.height - 60 * MM) doc.addPage();
      const y = doc.y + 4;
      diamante(doc, MARGEM + 3, y + 7, 5, VERMELHO);
      doc.font('Poppins-SemiBold').fontSize(11).fillColor(NAVY).text(cl.titulo, MARGEM + 12, y, { width: largura - 12 });
      doc.moveDown(0.3);
      for (const b of cl.blocos) {
        doc.x = MARGEM;
        if (b.t === 'p') {
          doc.fontSize(9.5).fillColor(NAVY_SOFT);
          if (b.rotulo) doc.font('Poppins-SemiBold').fillColor(NAVY).text(b.rotulo + ' ', { continued: true, width: largura, align: 'justify' }).font('Poppins').fillColor(NAVY_SOFT);
          else doc.font('Poppins');
          doc.text(b.texto, { width: largura, align: 'justify', lineGap: 1.5 });
          doc.moveDown(0.45);
        } else if (b.t === 'lista') {
          b.itens.forEach((it, i) => {
            doc.font('Poppins').fontSize(9.5).fillColor(NAVY_SOFT).text(`${i + 1}. ${it}`, MARGEM + 8, doc.y, { width: largura - 8, lineGap: 1.5 });
            doc.moveDown(0.25);
          });
          doc.moveDown(0.2);
        } else if (b.t === 'tabela') {
          const cols = b.cab.length;
          const larguras = cols === 2 ? [largura * 0.72, largura * 0.28] : [largura * 0.46, largura * 0.30, largura * 0.24];
          const linha = (vals, cab, ultima) => {
            const alturas = vals.map((v, i) => doc.font(cab || ultima ? 'Poppins-SemiBold' : 'Poppins').fontSize(8.5).heightOfString(String(v), { width: larguras[i] - 10 }));
            const h = Math.max(...alturas) + 8;
            if (doc.y + h > doc.page.height - 26 * MM) doc.addPage();
            const y0 = doc.y;
            if (cab) doc.rect(MARGEM, y0, largura, h).fill(FUNDO);
            let x = MARGEM;
            vals.forEach((v, i) => {
              doc.font(cab || ultima ? 'Poppins-SemiBold' : 'Poppins').fontSize(8.5).fillColor(cab || ultima ? NAVY : NAVY_SOFT)
                .text(String(v), x + 5, y0 + 4, { width: larguras[i] - 10 });
              x += larguras[i];
            });
            doc.moveTo(MARGEM, y0 + h).lineTo(MARGEM + largura, y0 + h).lineWidth(0.5).strokeColor(FILETE).stroke();
            doc.y = y0 + h;
          };
          linha(b.cab, true, false);
          b.linhas.forEach((l, i) => linha(l, false, cols === 2 && i === b.linhas.length - 1));
          doc.x = MARGEM;
          doc.moveDown(0.6);
        }
      }
      doc.moveDown(0.4);
    }

    // Rodapé em todas as páginas
    const total = doc.bufferedPageRange().count;
    for (let i = 0; i < total; i++) {
      doc.switchToPage(i);
      const salvo = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      const yF = doc.page.height - 16 * MM;
      doc.moveTo(MARGEM, yF - 4).lineTo(doc.page.width - MARGEM, yF - 4).lineWidth(0.5).strokeColor(FILETE).stroke();
      doc.font('Poppins').fontSize(7.5).fillColor(NAVY_SOFT)
        .text(`Anders Tech · CNPJ ${EMPRESA.cnpj} · anderstech.net · Contrato nº ${p.pedido.id} · versão ${p.pedido.versao}`, MARGEM, yF, { width: largura * 0.8, lineBreak: false });
      doc.text(`${i + 1} / ${total}`, MARGEM, yF, { width: largura, align: 'right', lineBreak: false });
      doc.page.margins.bottom = salvo;
    }
    doc.end();
  });
}
