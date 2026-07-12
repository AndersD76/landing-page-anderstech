// ── Promoção de lançamento dos cursos EAD ──
// Data parametrizada por env (EAD_PROMO_FIM, ISO 8601). Sem hardcode nas páginas:
// a home usa o token __PROMO_FIM_CURTO__ (substituído no server) e o EAD lê PROMO.
// Para estender a promo: setar EAD_PROMO_FIM no Railway (ver HANDOFF.md).
const FIM_ISO = process.env.EAD_PROMO_FIM || '2026-07-29T23:59:59-03:00';
const fim = new Date(FIM_ISO);

const fmtCurto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' });
const fmtLongo = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });

export const PROMO = {
  ativa: process.env.EAD_PROMO_ATIVA !== 'false',
  fim,
  fimCurto: fmtCurto.format(fim),   // ex.: "29/07"
  fimLongo: fmtLongo.format(fim),   // ex.: "29/07/2026"
  label: 'Lançamento — acesso gratuito',
  get desc() {
    return `Todos os cursos liberados gratuitamente até ${this.fimLongo}. Matricule-se agora e mantenha o acesso permanente.`;
  },
};

export function promoAtiva() {
  return PROMO.ativa && new Date() < PROMO.fim;
}
