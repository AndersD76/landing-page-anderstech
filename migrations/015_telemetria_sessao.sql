-- ── Sessão na telemetria ─────────────────────────────────────────────────────
-- O anonymous_id é identificador de DISPOSITIVO e vive para sempre no
-- localStorage: duas visitas em meses diferentes eram indistinguíveis, então
-- não havia como calcular funil por sessão nem taxa sobre a etapa anterior.
-- A sessão fecha por 30 min de inatividade, gerada no cliente.
ALTER TABLE telemetry_events ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_telemetry_session ON telemetry_events (session_id, ts);
