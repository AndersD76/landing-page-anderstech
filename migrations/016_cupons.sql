-- 016_cupons.sql  (cupons de desconto do EAD)
-- Cupom enviado pelo Anders a alunos e leads: percentual sobre o preço do
-- curso, cobrando a diferença pelo Asaas. Cupom de 100% matricula sem cobrança.
--
-- percentual aceita 1–100 no banco; a lista comercial (10/20/50/90/100) vive
-- em ead/cupons.js, para mudar sem migração.
-- course_id nulo = vale para todos os cursos. email preenchido = cupom pessoal.
-- usos conta pedidos APROVADOS: sobe no webhook do Asaas e na matrícula por
-- cupom de 100%. Pedido abandonado não consome cupom.
CREATE TABLE IF NOT EXISTS ead_coupons (
  id SERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  percentual INTEGER NOT NULL CHECK (percentual BETWEEN 1 AND 100),
  course_id INTEGER REFERENCES ead_courses(id) ON DELETE CASCADE,
  email TEXT,
  max_usos INTEGER CHECK (max_usos IS NULL OR max_usos > 0),
  usos INTEGER NOT NULL DEFAULT 0,
  valido_ate TIMESTAMPTZ,
  ativo BOOLEAN NOT NULL DEFAULT true,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ead_orders.valor continua sendo o que foi COBRADO (receita real).
-- valor_original guarda o preço de tabela no momento da compra.
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS cupom_id INTEGER REFERENCES ead_coupons(id);
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS valor_original NUMERIC(10,2);
CREATE INDEX IF NOT EXISTS idx_ead_orders_cupom_id ON ead_orders(cupom_id);
