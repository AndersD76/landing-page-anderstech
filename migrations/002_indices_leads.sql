-- 002_indices_leads.sql  (achado #17)
-- leads e lead_events eram as unicas tabelas sem indice algum, apesar de serem
-- filtradas e ordenadas por 6 colunas em /api/admin/stats e /api/admin/leads.
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_interesse ON leads(interesse);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id);
