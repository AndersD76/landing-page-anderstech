-- ── Prazo de decisão do lead ─────────────────────────────────────────────────
-- É o campo que mais ordena a fila comercial: quem decide agora não pode ficar
-- atrás de quem só está avaliando. Nenhum formulário perguntava isso até agora.
-- Opcional de propósito — campo obrigatório antes da entrega derruba conversão.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS prazo TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_prazo ON leads (prazo);
