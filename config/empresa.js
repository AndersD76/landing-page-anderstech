// ── Dados da empresa (achado #51) ─────────────────────────────────────────────
// Estavam replicados literalmente: 46 ocorrências do WhatsApp em 39 arquivos,
// 31 do e-mail, 23 do CNPJ. Trocar o número exigia editar 39 arquivos sem errar
// nenhum. Os três módulos que injetam conteúdo em todas as páginas passam a ler
// daqui; as páginas estáticas migram aos poucos.

export const EMPRESA = {
  nome: 'Anders Tech',
  dominio: process.env.APP_URL || 'https://anderstech.net',
  whatsapp: '5554999648368',
  whatsappFormatado: '(54) 99964-8368',
  email: 'danielanders76@gmail.com',
  emailRemetente: 'noreply@anderstech.net',
  // 20/11/2026: o site publicava este número com 716 no lugar de 416, que nem
  // passa no dígito verificador. Este é o do comprovante de inscrição da Receita
  // (test/empresa.test.js).
  cnpj: '42.073.416/0001-80',
  // Dados da CONTRATADA no contrato de consultoria (consultoria/contrato.js).
  // Enquanto algum estiver vazio, a contratação pelo site fica desligada: um
  // contrato com [PREENCHER] não pode ser gerado para cliente que pagou.
  // Razão social e endereço como no comprovante da Receita (sem complemento).
  razaoSocial: 'ANDERS CONSULTORIA EM GESTAO EMPRESARIAL LTDA',
  endereco: 'Rua Uruguai, 679, Centro, CEP 99010-110', // a cidade (Passo Fundo/RS) o contrato acrescenta
  representante: 'Daniel Anders', // quem assina pela Anders Tech (informado em 20/11/2026)
  // CPF de quem assina: variável no Railway, nunca no código (o repositório é
  // público). Só entra no contrato em PDF de quem pagou; a página pública
  // /contrato-consultoria não mostra (consultoria/contrato.js).
  cpfRepresentante: process.env.CONTRATADA_CPF || '',
  cidades: 'Passo Fundo · Erechim · RS',
  ga4: process.env.GA4_MEASUREMENT_ID || 'G-7XL5XVE6QZ',
  // Propriedade GA4 "AndersTech" (a do fluxo G-7XL5XVE6QZ), conferida na API em 19/11/2026.
  ga4Propriedade: '540470926',
};

export function waLink(texto) {
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`;
}
