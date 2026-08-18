-- 003_asaas.sql  (migracao de gateway: Mercado Pago -> Asaas)
-- Colunas aditivas e nullable: seguras de aplicar em banco com dados.
-- As colunas mp_* antigas sao mantidas de proposito, para nao perder o historico
-- dos pedidos ja processados pelo Mercado Pago.

-- Asaas exige um customer para criar cobranca. Guardamos o id para nao recriar
-- o cliente a cada compra.
ALTER TABLE ead_users ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_ead_users_asaas_customer_id ON ead_users(asaas_customer_id);

-- Identificadores da cobranca no Asaas.
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;
ALTER TABLE ead_orders ADD COLUMN IF NOT EXISTS asaas_invoice_url TEXT;
CREATE INDEX IF NOT EXISTS idx_ead_orders_asaas_payment_id ON ead_orders(asaas_payment_id);

-- Revogacao de matricula por estorno/chargeback (achado #77).
-- Marcacao em vez de DELETE: preserva historico, permite reverter e mantem o
-- certificado ja emitido verificavel.
ALTER TABLE ead_enrollments ADD COLUMN IF NOT EXISTS revogada_em TIMESTAMPTZ;
ALTER TABLE ead_enrollments ADD COLUMN IF NOT EXISTS revogada_motivo TEXT;
