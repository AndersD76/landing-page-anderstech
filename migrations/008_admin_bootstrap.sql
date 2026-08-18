-- 008_admin_bootstrap.sql  (achado #24)
-- Cinco pontos do codigo ramificam por role='admin', mas as duas rotas que criam
-- usuario gravam 'cliente' fixo — o primeiro admin so existia por INSERT manual,
-- procedimento que nao estava registrado em lugar nenhum.
-- Promove o e-mail definido em PORTAL_ADMIN_EMAIL, se a conta ja existir.
-- Idempotente e sem senha embutida.
UPDATE portal_users SET role = 'admin'
 WHERE email = LOWER(COALESCE(NULLIF(CURRENT_SETTING('app.admin_email', true), ''), '@@sem-admin@@'))
   AND role <> 'admin';
