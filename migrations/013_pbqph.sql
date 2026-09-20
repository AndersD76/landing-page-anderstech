-- ── Base PBQP-H / SiAC para as páginas por município ─────────────────────────
-- Carregada por scripts/carrega-siac.mjs a partir do registro público do
-- Ministério das Cidades. Só campos publicáveis: telefone, e-mail e endereço
-- existem na fonte e NÃO entram aqui — publicar contato de ~3.950 empresas
-- transformaria o site em lista de mala direta.
CREATE TABLE IF NOT EXISTS pbqph_empresas (
  id             SERIAL PRIMARY KEY,
  empresa        TEXT NOT NULL,
  cnpj           TEXT,
  uf             TEXT NOT NULL,
  municipio      TEXT NOT NULL,
  municipio_slug TEXT NOT NULL,
  nivel          TEXT,
  subsetor       TEXT,
  organismo      TEXT,
  validade       DATE NOT NULL,
  emissao        DATE
);

CREATE INDEX IF NOT EXISTS idx_pbqph_municipio ON pbqph_empresas (uf, municipio_slug);
CREATE INDEX IF NOT EXISTS idx_pbqph_uf ON pbqph_empresas (uf);
CREATE INDEX IF NOT EXISTS idx_pbqph_validade ON pbqph_empresas (validade);

-- Histórico de cargas. A data do carimbo "Fonte: X — atualizado em ..." de toda
-- página sai daqui, nunca de texto escrito à mão.
CREATE TABLE IF NOT EXISTS pbqph_cargas (
  id             SERIAL PRIMARY KEY,
  carregado_em   TIMESTAMPTZ NOT NULL,
  total_fonte    INTEGER NOT NULL,
  total_vigentes INTEGER NOT NULL
);
