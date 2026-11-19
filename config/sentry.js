// ── Sentry: o que pode sair do servidor ─────────────────────────────────────
// Revisão do PR #4 (19/11/2026), medida contra um coletor local:
//   @sentry/node 10 (o que roda hoje) manda o cookie de sessão connect.sid e o
//   header x-admin-key EM CLARO, mais o corpo (nome, e-mail, telefone do lead)
//   e a query (?t=<token> do contrato).
//   @sentry/node 11 filtra cookie e header, mas passa a mandar o IP do
//   visitante e continua mandando corpo e query.
// Nada disso ajuda a achar bug e tudo é dado pessoal ou segredo (LGPD,
// CLAUDE.md §4.7). `limparEvento` vale nas duas versões; `dataCollection` é a
// chave da 11 (a 10 ignora chave que não conhece).

const semQuery = (u) => (typeof u === 'string' ? u.split('?')[0] : u);

export function limparEvento(ev) {
  if (!ev || typeof ev !== 'object') return ev;
  if (ev.request) {
    delete ev.request.cookies;
    delete ev.request.headers;
    delete ev.request.data;
    delete ev.request.query_string;
    delete ev.request.env;
    if (ev.request.url) ev.request.url = semQuery(ev.request.url);
  }
  if (ev.user) ev.user = ev.user.id ? { id: ev.user.id } : undefined;
  if (Array.isArray(ev.breadcrumbs)) {
    for (const b of ev.breadcrumbs) {
      if (b && b.data && b.data.url) b.data.url = semQuery(b.data.url);
    }
  }
  return ev;
}

export function opcoesSentry(dsn) {
  return {
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    dataCollection: {
      userInfo: false, cookies: false, httpHeaders: false, httpBodies: [],
      urlQueryParams: false, databaseQueryData: false, genAI: { inputs: false, outputs: false },
    },
    beforeSend: limparEvento,
    beforeSendTransaction: limparEvento,
  };
}
