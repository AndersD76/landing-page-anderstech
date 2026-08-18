-- 004_cpf_cnpj_aluno.sql
-- O Asaas exige cpfCnpj para criar o customer que ancora a cobranca.
-- Coletado no checkout (nao no cadastro), para nao adicionar atrito a quem
-- so quer navegar o catalogo. Nullable: alunos antigos seguem validos.
ALTER TABLE ead_users ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
