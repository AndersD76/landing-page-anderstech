-- ── Cases (FASE 4) ───────────────────────────────────────────────────────────
-- Case de 1 página: problema → solução → resultado → depoimento.
-- Publicação indexável em /cases/<slug>, PDF com identidade de artefato.
-- Trava de fonte: todo número e depoimento precisa de campo `fonte` não-vazio.

CREATE TABLE IF NOT EXISTS cases (
  id               SERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  publicado        BOOLEAN NOT NULL DEFAULT FALSE,
  cliente          TEXT NOT NULL,
  segmento         TEXT NOT NULL,
  servico          TEXT NOT NULL,
  problema         TEXT NOT NULL,
  solucao          TEXT NOT NULL,
  resultado        TEXT NOT NULL,
  resultado_fonte  TEXT NOT NULL,
  depoimento_texto TEXT,
  depoimento_autor TEXT,
  depoimento_cargo TEXT,
  depoimento_fonte TEXT,
  metricas         JSONB NOT NULL DEFAULT '[]',
  artifact_codigo  TEXT,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_slug ON cases (slug);
CREATE INDEX IF NOT EXISTS idx_cases_publicado ON cases (publicado) WHERE publicado = TRUE;

-- metricas: array de {label, valor, fonte} — todos obrigatórios e não-vazios
-- artifact_codigo: preenchido automaticamente ao criar (POST /api/admin/cases)
-- resultado_fonte: ex. "relatório de auditoria interna, mar/2025"
-- depoimento_fonte: ex. "e-mail autorizado por João Silva, 15/04/2025"
