-- ── Motor orgânico: SEO, GEO e produção contínua (18/11/2026) ────────────────
-- Todo dado operacional mora aqui e aparece em /admin/organico: mapa de buscas,
-- páginas (conteúdo no banco), portão de qualidade, ondas de publicação, Search
-- Console, Bing, GA4, crawlers, SERP, anotações, linha de base, alvos de link,
-- fila de distribuição e alertas.

CREATE TABLE IF NOT EXISTS seo_consultas (
  id SERIAL PRIMARY KEY,
  consulta TEXT UNIQUE NOT NULL,
  intencao TEXT,
  cluster TEXT,
  tipo_pagina TEXT,
  isca TEXT,
  volume_est INT,
  volume_fonte TEXT,
  dificuldade_est INT,
  prioridade INT NOT NULL DEFAULT 0,
  fonte TEXT,
  pagina_slug TEXT,
  status TEXT NOT NULL DEFAULT 'nova',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_consultas_fila ON seo_consultas (status, prioridade DESC);
CREATE INDEX IF NOT EXISTS idx_seo_consultas_cluster ON seo_consultas (cluster);

CREATE TABLE IF NOT EXISTS seo_paginas (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  cluster TEXT,
  consulta TEXT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  h1 TEXT,
  resposta TEXT,
  corpo JSONB NOT NULL DEFAULT '{}'::jsonb,
  faq JSONB NOT NULL DEFAULT '[]'::jsonb,
  fontes JSONB NOT NULL DEFAULT '[]'::jsonb,
  valor_proprio TEXT,
  isca TEXT,
  matriz TEXT,
  celula JSONB,
  status TEXT NOT NULL DEFAULT 'rascunho',
  onda INT,
  qualidade JSONB,
  origem TEXT NOT NULL DEFAULT 'manual',
  autor TEXT NOT NULL DEFAULT 'Daniel Anders',
  publicado_em TIMESTAMPTZ,
  revisado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seo_paginas_status ON seo_paginas (status, tipo);

CREATE TABLE IF NOT EXISTS seo_ondas (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  paginas INT NOT NULL DEFAULT 0,
  indexadas INT,
  status TEXT NOT NULL DEFAULT 'publicada',
  publicada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verificada_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS seo_fila (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  alvo TEXT NOT NULL,
  motivo TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tipo, alvo, status)
);

CREATE TABLE IF NOT EXISTS seo_gsc (
  dia DATE NOT NULL,
  pagina TEXT NOT NULL,
  consulta TEXT NOT NULL,
  dispositivo TEXT NOT NULL DEFAULT '',
  cliques INT NOT NULL DEFAULT 0,
  impressoes INT NOT NULL DEFAULT 0,
  ctr REAL,
  posicao REAL,
  PRIMARY KEY (dia, pagina, consulta, dispositivo)
);
CREATE INDEX IF NOT EXISTS idx_seo_gsc_pagina ON seo_gsc (pagina, dia);

CREATE TABLE IF NOT EXISTS seo_bing (
  dia DATE NOT NULL,
  consulta TEXT NOT NULL,
  cliques INT NOT NULL DEFAULT 0,
  impressoes INT NOT NULL DEFAULT 0,
  posicao REAL,
  PRIMARY KEY (dia, consulta)
);

CREATE TABLE IF NOT EXISTS seo_ga4 (
  dia DATE NOT NULL,
  canal TEXT NOT NULL,
  landing TEXT NOT NULL,
  sessoes INT NOT NULL DEFAULT 0,
  eventos_chave INT NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, canal, landing)
);

CREATE TABLE IF NOT EXISTS seo_indexacao (
  url TEXT PRIMARY KEY,
  verdict TEXT,
  coverage TEXT,
  ultimo_rastreio TIMESTAMPTZ,
  verificado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_crawlers (
  dia DATE NOT NULL,
  bot TEXT NOT NULL,
  pagina TEXT NOT NULL,
  validado BOOLEAN NOT NULL DEFAULT FALSE,
  hits INT NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, bot, pagina, validado)
);

CREATE TABLE IF NOT EXISTS seo_serp (
  dia DATE NOT NULL,
  consulta TEXT NOT NULL,
  posicao_nossa INT,
  top3 JSONB,
  ai_overview BOOLEAN,
  citados JSONB,
  PRIMARY KEY (dia, consulta)
);

CREATE TABLE IF NOT EXISTS seo_anotacoes (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo TEXT NOT NULL,
  chave TEXT UNIQUE,
  texto TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS seo_linha_base (
  dia DATE NOT NULL,
  metrica TEXT NOT NULL,
  valor NUMERIC,
  PRIMARY KEY (dia, metrica)
);

CREATE TABLE IF NOT EXISTS seo_alertas (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tipo TEXT NOT NULL,
  chave TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  enviado BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (tipo, chave)
);

CREATE TABLE IF NOT EXISTS alvos_link (
  id SERIAL PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT,
  cidade TEXT,
  uf TEXT,
  url TEXT,
  onde_link TEXT,
  ativo TEXT,
  assunto TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  nota TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS distribuicao (
  id SERIAL PRIMARY KEY,
  pagina_slug TEXT NOT NULL,
  canal TEXT NOT NULL,
  texto TEXT NOT NULL,
  link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pagina_slug, canal)
);

CREATE TABLE IF NOT EXISTS artigos_convidado (
  id SERIAL PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  veiculo_alvo TEXT,
  corpo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pronto',
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS optin_marketing BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS isca TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consulta TEXT;
