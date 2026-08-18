-- 005_reset_senha.sql  (achado #71)
-- Nao existia recuperacao nem troca de senha em nenhum dos dois modulos. No
-- portal a senha e gerada pelo sistema, entao quem perdia o e-mail ficava sem
-- acesso e sem saida. Guardamos o HASH do token, nunca o token.
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  escopo TEXT NOT NULL,
  user_id INTEGER NOT NULL,
  token_hash TEXT NOT NULL,
  expira_em TIMESTAMPTZ NOT NULL,
  usado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_resets_user ON password_resets(escopo, user_id);
