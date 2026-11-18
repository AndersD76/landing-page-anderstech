-- 017_consultoria.sql  (consultoria contratada e paga pelo site)
-- Um pedido = um contrato. Os valores são gravados como foram calculados no
-- momento do aceite (consultoria/preco.js), para o contrato gerado depois do
-- pagamento sair igual ao que o cliente viu, mesmo que a tabela mude.
CREATE TABLE IF NOT EXISTS consultoria_pedidos (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente',
  servico TEXT NOT NULL,
  servico_nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  horas INTEGER NOT NULL,
  horas_totais INTEGER NOT NULL,
  meses INTEGER,
  funcionarios INTEGER NOT NULL,
  cidade_ibge TEXT NOT NULL,
  km INTEGER NOT NULL,
  tem_projeto BOOLEAN NOT NULL DEFAULT false,
  base NUMERIC(12,2) NOT NULL,
  acrescimos JSONB NOT NULL DEFAULT '[]',
  pct_total INTEGER NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  metodo TEXT NOT NULL,
  parcelas INTEGER NOT NULL,
  valor_parcela NUMERIC(12,2) NOT NULL,
  total_pago NUMERIC(12,2) NOT NULL,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  endereco TEXT NOT NULL,
  cidade TEXT NOT NULL,
  uf TEXT NOT NULL,
  cep TEXT NOT NULL,
  representante TEXT NOT NULL,
  cargo TEXT NOT NULL,
  cpf TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  contrato_versao TEXT NOT NULL,
  aceite_em TIMESTAMPTZ NOT NULL,
  aceite_ip TEXT,
  asaas_customer_id TEXT,
  asaas_payment_id TEXT,
  asaas_installment_id TEXT,
  asaas_invoice_url TEXT,
  pix_qr_code TEXT,
  pix_qr_code_base64 TEXT,
  pago_em TIMESTAMPTZ,
  contrato_enviado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultoria_pedidos_status ON consultoria_pedidos(status);
CREATE INDEX IF NOT EXISTS idx_consultoria_pedidos_installment ON consultoria_pedidos(asaas_installment_id);
CREATE INDEX IF NOT EXISTS idx_consultoria_pedidos_payment ON consultoria_pedidos(asaas_payment_id);
