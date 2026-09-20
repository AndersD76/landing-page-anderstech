-- ── Lead sem nome + campos de atribuição ─────────────────────────────────────
-- O servidor exigia `nome` e dois formulários nunca pediam nome: a calculadora
-- de ROI (pages/calculadora-roi-certificacao.html) e o pop-up de saída
-- (app.js). Toda submissão dos dois voltava 400, o erro era engolido e a tela
-- agradecia. Identidade mínima passa a ser e-mail OU telefone, como as telas
-- sempre mandaram — nome vira desejável, nunca bloqueante.
ALTER TABLE leads ALTER COLUMN nome DROP NOT NULL;

-- Atribuição: só utm_source/medium/campaign existiam, e nenhum formulário fora
-- da home enviava UTM. Sem estas duas colunas não há como separar o lead que
-- veio de um anúncio do que veio de um artefato em PDF.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_content TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_term TEXT;

-- A página do checklist já coletava `cargo` e o servidor descartava em
-- silêncio, porque não havia coluna nem destructuring. É o campo que mais
-- ordena a fila comercial depois do prazo: quem preenche define o peso do lead.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cargo TEXT;

-- Página de entrada da sessão. Sem isto não existe forma de saber qual página
-- gera contato: o caminho só vivia dentro do JSONB da telemetria, e apenas
-- quando a pessoa aceitava cookie.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_landing_page ON leads (landing_page);
CREATE INDEX IF NOT EXISTS idx_leads_utm_medium ON leads (utm_medium);
