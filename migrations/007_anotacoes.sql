-- 007_anotacoes.sql  (achado #60)
-- O botao dizia "Salvo!" mas gravava so em localStorage: trocar de navegador
-- apagava tudo, num curso vendido com acesso vitalicio.
CREATE TABLE IF NOT EXISTS ead_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES ead_users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES ead_lessons(id) ON DELETE CASCADE,
  idx INT NOT NULL DEFAULT 0,
  conteudo TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, idx)
);
CREATE INDEX IF NOT EXISTS idx_ead_notes_user_lesson ON ead_notes(user_id, lesson_id);
