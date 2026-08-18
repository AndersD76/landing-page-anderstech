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
  cnpj: '42.073.716/0001-80',
  cidades: 'Passo Fundo · Erechim · RS',
  ga4: process.env.GA4_MEASUREMENT_ID || 'G-7XL5XVE6QZ',
};

export function waLink(texto) {
  return `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`;
}
