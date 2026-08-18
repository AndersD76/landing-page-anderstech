-- 006_integridade.sql  (achados #20 e #18 parcial)
-- #20: ead_quiz_attempts.module_id era a unica FK "solta" do sistema. Limpa
-- orfaos antes de criar a constraint, senao a criacao falha.
DELETE FROM ead_quiz_attempts
 WHERE module_id IS NOT NULL
   AND module_id NOT IN (SELECT id FROM ead_modules);

ALTER TABLE ead_quiz_attempts DROP CONSTRAINT IF EXISTS fk_quiz_attempts_module;
ALTER TABLE ead_quiz_attempts
  ADD CONSTRAINT fk_quiz_attempts_module
  FOREIGN KEY (module_id) REFERENCES ead_modules(id) ON DELETE CASCADE;

-- #18 (parte segura): dados operacionais do aluno cascateiam com o titular.
-- Registros financeiros (ead_orders, payments, contracts) NAO entram aqui de
-- proposito — devem sobreviver a exclusao, anonimizados, por obrigacao contabil.
ALTER TABLE ead_progress DROP CONSTRAINT IF EXISTS ead_progress_user_id_fkey;
ALTER TABLE ead_progress ADD CONSTRAINT ead_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES ead_users(id) ON DELETE CASCADE;

ALTER TABLE ead_progress DROP CONSTRAINT IF EXISTS ead_progress_lesson_id_fkey;
ALTER TABLE ead_progress ADD CONSTRAINT ead_progress_lesson_id_fkey
  FOREIGN KEY (lesson_id) REFERENCES ead_lessons(id) ON DELETE CASCADE;

ALTER TABLE ead_quiz_attempts DROP CONSTRAINT IF EXISTS ead_quiz_attempts_user_id_fkey;
ALTER TABLE ead_quiz_attempts ADD CONSTRAINT ead_quiz_attempts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES ead_users(id) ON DELETE CASCADE;

ALTER TABLE ead_enrollments DROP CONSTRAINT IF EXISTS ead_enrollments_user_id_fkey;
ALTER TABLE ead_enrollments ADD CONSTRAINT ead_enrollments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES ead_users(id) ON DELETE CASCADE;

ALTER TABLE lead_events DROP CONSTRAINT IF EXISTS lead_events_lead_id_fkey;
ALTER TABLE lead_events ADD CONSTRAINT lead_events_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
