-- ── Telemetria (FASE 1 da máquina de tráfego) ────────────────────────────────
-- Espelha o schema do serviço central de telemetria, que ainda não está no ar.
-- Quando entrar, a migração dos dados é um INSERT ... SELECT direto:
--
--   INSERT INTO <central>.events
--     (ts, app, event, anonymous_id, person_id,
--      utm_source, utm_medium, utm_campaign, utm_content, props)
--   SELECT ts, app, event, anonymous_id, person_id,
--          utm_source, utm_medium, utm_campaign, utm_content, props
--   FROM telemetry_events;
--
-- Nome da tabela: no serviço central ela se chama `events`. Aqui NÃO pode —
-- `events` já existe desde a 001_baseline com outro significado (horas e
-- eventos de consultoria do portal, referenciada por atas.event_id). As colunas
-- são as do serviço central; só o nome local muda, e o INSERT SELECT acima
-- resolve isso com o FROM.

CREATE TABLE IF NOT EXISTS telemetry_events (
  id           BIGSERIAL PRIMARY KEY,
  ts           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  app          TEXT NOT NULL DEFAULT 'anderstech',
  event        TEXT NOT NULL,
  anonymous_id TEXT,
  person_id    TEXT,
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  props        JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Consulta dominante: "quantos <evento> no período". Depois: funil de uma
-- pessoa (person_id) e costura anônimo→identificado (anonymous_id).
CREATE INDEX IF NOT EXISTS idx_telemetry_event_ts ON telemetry_events (event, ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_ts ON telemetry_events (ts DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_anon ON telemetry_events (anonymous_id, ts DESC) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_telemetry_person ON telemetry_events (person_id, ts DESC) WHERE person_id IS NOT NULL;
