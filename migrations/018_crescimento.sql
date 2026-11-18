-- ── Atribuição, conversões, parceiros e custo de mídia (18/11/2026) ──────────
-- Antes: o lead guardava utm_* e a página de entrada; os pedidos do EAD e da
-- consultoria não guardavam origem nenhuma. Sem isso não existe CPL nem CAC por
-- canal, e nenhuma venda volta para a plataforma de anúncio.

-- Lead: atribuição completa (primeiro e último toque, com identificador de
-- clique quando houve consentimento de marketing), canal calculado, parceiro,
-- score para ordenar a fila e o instante da primeira resposta do Anders.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS atribuicao JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS canal TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS parceiro_codigo TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_motivos JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS primeira_resposta_em TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ref_tipo TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ref_id INT;
CREATE INDEX IF NOT EXISTS idx_leads_canal ON leads (canal, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_parceiro ON leads (parceiro_codigo) WHERE parceiro_codigo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_ref ON leads (ref_tipo, ref_id) WHERE ref_tipo IS NOT NULL;

ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS atribuicao JSONB;
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS canal TEXT;
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS parceiro_codigo TEXT;

ALTER TABLE consultoria_pedidos ADD COLUMN IF NOT EXISTS atribuicao JSONB;
ALTER TABLE consultoria_pedidos ADD COLUMN IF NOT EXISTS canal TEXT;
ALTER TABLE consultoria_pedidos ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE consultoria_pedidos ADD COLUMN IF NOT EXISTS parceiro_codigo TEXT;

-- Livro de conversões: a cópia local de tudo que vai (ou iria) para Google
-- Ads, Microsoft Ads e Meta. event_id é determinístico (evento:tipo:id), então
-- reprocessar um webhook nunca duplica. As plataformas são destino adicional;
-- esta tabela é a fonte.
CREATE TABLE IF NOT EXISTS conversoes (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  evento TEXT NOT NULL,
  ref_tipo TEXT NOT NULL,
  ref_id INT NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valor NUMERIC(12,2),
  moeda TEXT NOT NULL DEFAULT 'BRL',
  canal TEXT,
  atribuicao JSONB,
  parceiro_codigo TEXT,
  consent_marketing BOOLEAN NOT NULL DEFAULT FALSE,
  envios JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_conversoes_evento_ts ON conversoes (evento, ts DESC);
CREATE INDEX IF NOT EXISTS idx_conversoes_canal ON conversoes (canal, ts DESC);

-- Programa de parceiros: código público no link /p/<codigo>, token secreto no
-- link do painel do parceiro. Status começa pendente: o Anders aprova.
CREATE TABLE IF NOT EXISTS parceiros (
  id SERIAL PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT,
  tipo TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacao TEXT,
  lead_id INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parceiro_cliques (
  id BIGSERIAL PRIMARY KEY,
  parceiro_id INT NOT NULL REFERENCES parceiros(id) ON DELETE CASCADE,
  destino TEXT,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parceiro_cliques ON parceiro_cliques (parceiro_id, ts DESC);

-- Custo de mídia por dia, canal e campanha, importado por CSV no painel (ou
-- por API quando houver credencial). É o denominador do CPL e do CAC.
CREATE TABLE IF NOT EXISTS custos_midia (
  dia DATE NOT NULL,
  canal TEXT NOT NULL,
  campanha TEXT NOT NULL DEFAULT '',
  custo NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressoes INT,
  cliques INT,
  importado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (dia, canal, campanha)
);
