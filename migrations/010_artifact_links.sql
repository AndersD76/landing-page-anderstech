-- ── Artifact Links (FASE 4) ──────────────────────────────────────────────────
-- Tabela de códigos curtos para artefatos (proposta, case, relatório, certificado).
-- Cada código identifica um artefato enviado a um destinatário específico.
-- A rota GET /r/:codigo consulta aqui, registra artifact_scan e redireciona.

CREATE TABLE IF NOT EXISTS artifact_links (
  id         SERIAL PRIMARY KEY,
  codigo     TEXT NOT NULL UNIQUE,
  tipo       TEXT NOT NULL,
  destino    TEXT NOT NULL,
  label      TEXT,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  criado_por TEXT
);

CREATE INDEX IF NOT EXISTS idx_artifact_links_codigo ON artifact_links (codigo);

-- tipo: p=proposta, c=case, r=relatorio-auditoria, e=certificado-ead, a=apresentação
-- codigo: <tipo><7 chars do alfabeto seguro> — ex.: p7k2m9x4
-- destino: URL de redirecionamento (landing ou página específica)
-- label: texto livre para identificação interna (ex.: "Proposta - Empresa X")
-- criado_por: quem gerou (ex.: "script-python", "admin")
