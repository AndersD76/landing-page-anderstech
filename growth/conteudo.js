// ── Conteúdo pronto para usar no /admin/operacao ─────────────────────────────
// 30 posts (LinkedIn e vídeo curto) e 50 parceiros-alvo com a primeira mensagem.
// Todo número tem fonte (FONTES abaixo). Todo link sai com UTM (CLAUDE.md, regra 1).
// Textos falam em nome do Daniel: revisar antes de publicar.

import { ALVOS_VERIFICADOS } from '../organico/alvos-dados.js';

const SITE = 'https://anderstech.net';

export function linkPost(caminho, n, rede = 'linkedin') {
  const sep = caminho.includes('?') ? '&' : '?';
  return `${SITE}${caminho}${sep}utm_source=${rede}&utm_medium=social&utm_campaign=posts-2026-11&utm_content=p${String(n).padStart(2, '0')}`;
}

const P = '/iso-9001-2026', D = '/transicao-iso-9001-2026', C = '/contratar', B = '/pbqp-h/construtoras/rs';

// [tipo, texto, caminho do link]. Vídeo: o texto é o roteiro; o link vai na descrição.
const BASE = [
  ['linkedin', 'A ISO 9001:2026 foi publicada em 16 de setembro. Se a sua empresa é certificada pela versão 2015, o prazo para a transição é 30/09/2029. Depois disso, o certificado 2015 perde a validade. Parece longe. Não é: a transição acontece numa auditoria, e as auditorias até lá já estão no calendário. O que muda, requisito a requisito:', P],
  ['video', 'A ISO 9001 mudou. Saiu a versão 2026 em setembro. Três datas: 16/09/2026, publicação. 31/03/2028, certificação nova só pela 2026. 30/09/2029, fim do certificado 2015. Link na descrição. (Tela: as três datas em sequência.)', P],
  ['linkedin', 'Pergunta que mais ouvi esta semana: "a ISO 9001:2026 já tem versão em português?" A ABNT fez a consulta nacional até 28/09/2026. Até hoje não encontrei a publicação da NBR. Isso não muda o prazo da transição, que é da norma ISO. Cronograma completo:', P],
  ['linkedin', 'O que NÃO mudou na ISO 9001:2026: a estrutura do sistema. Quem tem um SGQ funcionando pela 2015 ajusta pontos específicos: cultura da qualidade e ética, política, riscos e oportunidades, gestão de mudanças, conscientização e análise crítica. Fiz um diagnóstico de 10 perguntas que mostra quais desses pontos faltam no seu sistema:', D],
  ['video', 'Risco e oportunidade na ISO 9001:2026 viraram três requisitos: 6.1.1 levantar, 6.1.2 agir nos riscos, 6.1.3 agir nas oportunidades. Oportunidade não é risco positivo: tem plano próprio. Se o seu registro mistura tudo, é o primeiro ajuste.', D],
  ['linkedin', '1.611.729 certificados ISO 9001 válidos no mundo no fim de 2025 (ISO Survey 2025). Todos com o mesmo prazo: 30/09/2029. Certificadora e consultoria têm agenda finita. Quem deixar para 2028 e 2029 vai encontrar fila. Comece pelo diagnóstico:', D],
  ['linkedin', '5.1.1, Liderança: a ISO 9001:2026 pede que a direção promova a cultura da qualidade e o comportamento ético. "Promover" precisa de evidência: comunicado, pauta de reunião, reconhecimento. Em auditoria, intenção sem registro não conta.', P],
  ['linkedin', '6.3, Mudanças: na versão 2026, planejar uma mudança no sistema passa a exigir monitorar a eficácia, comunicar e analisar o resultado. Trocou um processo, mudou a estrutura, lançou produto: mostre o depois, não só o antes.', P],
  ['video', 'Análise crítica na ISO 9001:2026: as entradas viraram obrigatórias, "deve incluir". E entrou uma nova: mudanças nas necessidades das partes interessadas. Atualize a pauta e o modelo de ata antes da auditoria.', P],
  ['linkedin', '7.3, Conscientização: a integração de quem entra na empresa precisa falar de cultura da qualidade e ética, não só de política e objetivos. É um dos ajustes mais baratos da transição e um dos mais fáceis de esquecer.', D],
  ['linkedin', 'A emenda de 2024 sobre mudanças climáticas continua na versão 2026: avaliar se o clima é questão relevante para a empresa (4.1) e se clientes têm requisitos sobre isso (4.2). Para muita indústria a resposta é "pouco relevante", e tudo bem, desde que a avaliação esteja registrada.', P],
  ['video', 'Quando fazer a transição para a ISO 9001:2026? Na auditoria de manutenção, na recertificação ou numa auditoria especial, até 30/09/2029. Pergunte hoje à sua certificadora quando ela estará acreditada para a 2026.', P],
  ['linkedin', '161 empresas do Rio Grande do Sul têm PBQP-H vigente no SiAC (consulta de 20/09/2026): 89 no nível A e 72 no nível B. O RS é o 5º estado em número, atrás de SP, MG, PR e GO. Panorama por cidade, com a lista oficial:', B],
  ['linkedin', 'A até 300 km de Passo Fundo estão 143 empresas com PBQP-H. Porto Alegre lidera com 22; Erechim, Caxias do Sul e Canoas têm 8 cada. Quem tem certificado vigente renova todo ano, e a renovação é onde o sistema mostra se está vivo ou só no papel.', B],
  ['video', 'Como saber quais construtoras da sua cidade têm PBQP-H? Está no cadastro público do SiAC, e eu organizei por município, com nível e validade. (Tela: rolar a página do RS.)', B],
  ['linkedin', 'Construtora que quer financiar pela Caixa costuma esbarrar no PBQP-H. Os dois pontos onde a certificação mais trava: evidência de controle na obra e auditoria interna feita às pressas. Resolver os dois antes da certificadora economiza uma reauditoria.', C],
  ['linkedin', '"Quanto custa o PBQP-H?" Na Anders Tech a conta é aberta: R$ 180 por hora, 120 horas de base, mais acréscimos por porte (de 0% a 15%), por distância (de 0% a 15%) e de 20% quando a empresa projeta o que vende. O preço da sua empresa sai na hora, sem esperar proposta:', C],
  ['video', 'Por que eu mostro o preço da consultoria no site? Porque a primeira pergunta de todo dono de construtora é "quanto custa". Porte, cidade, e o valor aparece. A conversa começa do preço, não termina nele. (Tela: /contratar sendo preenchido.)', C],
  ['linkedin', '"A certificadora já nos orienta." Ela não pode: a regra de imparcialidade impede o organismo de certificação de prestar consultoria para quem ele audita. A certificadora aponta a não conformidade; resolver é com a empresa.', P],
  ['linkedin', '"A transição é só em 2029." O prazo final é 2029, mas a transição precisa caber numa auditoria até lá. Se a sua recertificação for no 2º semestre de 2028, na prática o prazo é 2028. Descubra o seu em 5 minutos:', D],
  ['video', 'Três perguntas para fazer à sua certificadora esta semana: quando vocês estarão acreditados para a ISO 9001:2026? Em qual auditoria fazemos a transição? Ela pode ser remota? A regra oficial permite remota.', P],
  ['linkedin', 'Quem está implantando a ISO 9001 agora pergunta se faz pela 2015 ou pela 2026. A partir de 31/03/2028 a certificação inicial só sai pela 2026. Estruturar o sistema já pelos requisitos novos evita refazer documentação daqui a dois anos.', P],
  ['linkedin', 'Consultoria a R$ 180 por hora pode parecer cara. Mas a conta certa é outra: quantas horas o projeto leva e quem da sua equipe deixa de produzir enquanto isso. O preço na hora mostra as horas:', C],
  ['video', 'Implantação de ISO 9001 que para a fábrica é implantação mal feita. O sistema tem que caber na rotina de produção: evidência coletada no chão, não semana de reunião.', '/iso-9001'],
  ['linkedin', 'O diagnóstico de transição para a ISO 9001:2026 está no ar: 10 perguntas, resultado na hora, com o que falta em cada requisito e quanto tempo você tem até a sua próxima auditoria. Grátis, sem cadastro para ver:', D],
  ['linkedin', 'Atendo indústrias e construtoras a até 300 km de Passo Fundo, presencialmente. O deslocamento já está no preço: o que você vê no site é o que paga.', C],
  ['video', 'Fiz o diagnóstico de transição numa empresa fictícia: 35% pronta, 7 pontos para ajustar. O link do resultado fica salvo; dá para mandar para a diretoria. (Tela: o resultado.)', D],
  ['linkedin', 'Glossário da qualidade com 83 termos explicados sem juridiquês: análise crítica, partes interessadas, controle de mudanças, não conformidade maior e menor. Para mandar à equipe antes da auditoria:', '/glossario'],
  ['linkedin', 'Você é contador, engenheiro ou consultor e atende indústrias do RS? Estou montando uma rede de parceiros para indicações de ISO 9001 e PBQP-H, com link próprio e painel. Me chame aqui.', '/seja-parceiro'],
  ['linkedin', 'Resumo de 10 semanas falando de ISO 9001:2026: publicada em 16/09/2026; certificação inicial só pela 2026 a partir de 31/03/2028; certificado 2015 vale até 30/09/2029. Se ficou alguma dúvida, o guia completo está aqui:', P],
];

// Post 29 (parceiros) só depois de o programa estar valendo.
export const POSTS = BASE.map(([tipo, texto, caminho], i) => {
  const n = i + 1;
  const rede = tipo === 'video' ? 'youtube' : 'linkedin';
  return { n, tipo, semana: Math.floor(i / 3) + 1, texto, link: linkPost(caminho, n, rede), aguarda: n === 29 ? 'programa de parceiros valendo' : null };
});

export const FONTES = [
  'Datas da transição: Global ACI, TECH-3-TR 2029-09-30 (M) v1.1, 04/09/2026; publicação em iso.org/standard/88464.html',
  '1.611.729 certificados: ISO Survey 2025, divulgado pela Global ACI em 12/10/2026',
  'PBQP-H (161 no RS, 89 A / 72 B, ranking por UF, 143 na área): data/pbqph-siac.json (carga de 20/09/2026) e data/distancias-passo-fundo.json',
  'Preço: consultoria/preco.js',
];

// ── Parceiros-alvo ───────────────────────────────────────────────────────────
// 50 organizações reais, cada uma com a URL que confirma existência e cidade
// (pesquisa de 18/11/2026). Só dado da organização: sem nome de pessoa,
// e-mail ou telefone.
const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

export const PARCEIROS_ALVO = ALVOS_VERIFICADOS.map(p => ({ ...p, chave: slug(`${p.nome}-${p.cidade}`) }));

const ASSINATURA = '— Daniel Anders · Anders Tech · (54) 99964-8368\n(Para não receber mais mensagens minhas, é só responder "sair".)';
const utmParceiro = (caminho, chave) => `${SITE}${caminho}?utm_source=parceria&utm_medium=email&utm_campaign=parceiros-alvo&utm_content=${chave.slice(0, 40)}`;

// Primeira mensagem por tipo. Canal: e-mail ou formulário de contato da
// entidade — nunca WhatsApp para quem não pediu.
export function mensagemParceiro(p) {
  const t = p.tipo || '';
  if (/associa|sindicato/.test(t)) {
    return {
      assunto: 'Palestra gratuita para associados: ISO 9001:2026 e o prazo de 2029',
      corpo: `Olá, equipe da ${p.nome.split(' - ')[0]}.\n\nSou Daniel Anders, consultor de ISO 9001 e PBQP-H em Passo Fundo. A ISO publicou a ISO 9001:2026 em 16/09/2026, e toda empresa certificada precisa fazer a transição até 30/09/2029. Ofereço aos associados uma palestra ou um artigo para o boletim, sem custo, sobre o que muda e como se preparar. Posso mandar o roteiro?\n\nMaterial de base: ${utmParceiro('/iso-9001-2026', p.chave)}\n\n${ASSINATURA}`,
    };
  }
  if (/contab|ERP|software/.test(t)) {
    return {
      assunto: 'Parceria para clientes industriais que precisam de certificação',
      corpo: `Olá, equipe da ${p.nome.split(' - ')[0]}.\n\nAtendo indústrias e construtoras com ISO 9001 e PBQP-H, a até 300 km de Passo Fundo. Clientes de vocês às vezes recebem a exigência de certificação de um cliente grande, de licitação ou da Caixa. Montei um programa simples de indicação, com link próprio e painel: ${utmParceiro('/seja-parceiro', p.chave)}\n\nFaz sentido conversarmos 15 minutos?\n\n${ASSINATURA}`,
    };
  }
  return {
    assunto: 'Conteúdo técnico sobre a ISO 9001:2026 para a comunidade',
    corpo: `Olá.\n\nSou Daniel Anders, consultor de qualidade em Passo Fundo. Preparei um guia da transição para a ISO 9001:2026 com o cronograma oficial e as mudanças requisito a requisito: ${utmParceiro('/iso-9001-2026', p.chave)}\n\nPosso apresentar numa reunião técnica ou para as empresas da comunidade, sem custo?\n\n${ASSINATURA}`,
  };
}
