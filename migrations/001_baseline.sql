-- 001_baseline.sql
-- Estado do schema no momento da adocao de migracoes versionadas (2026-08-18).
-- Reproduz literalmente o DDL que rodava no boot em server.js, portal/routes.js e
-- ead/routes.js. Todas as instrucoes sao IF NOT EXISTS: aplicar num banco que ja
-- existe e um no-op, e num banco novo cria tudo do zero.

-- ===== origem: server.js =====
CREATE TABLE IF NOT EXISTS leads ( id SERIAL PRIMARY KEY, nome TEXT NOT NULL, empresa TEXT, email TEXT, telefone TEXT, interesse TEXT, mensagem TEXT, source TEXT DEFAULT 'site_form', utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, status TEXT DEFAULT 'novo', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS lead_events ( id SERIAL PRIMARY KEY, lead_id INTEGER REFERENCES leads(id), event_type TEXT NOT NULL, payload JSONB, created_at TIMESTAMPTZ DEFAULT NOW() );

-- ===== origem: portal/routes.js =====
CREATE TABLE IF NOT EXISTS portal_users ( id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, senha_hash TEXT NOT NULL, nome TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'cliente', empresa TEXT, telefone TEXT, cnpj TEXT, ativo BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS contracts ( id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES portal_users(id), titulo TEXT NOT NULL, arquivo_path TEXT, valor_total NUMERIC(12,2), horas_contratadas NUMERIC(8,2), data_inicio DATE, data_fim DATE, status TEXT DEFAULT 'ativo', created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE INDEX IF NOT EXISTS idx_contracts_client_id ON contracts(client_id);
CREATE TABLE IF NOT EXISTS events ( id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES portal_users(id), contract_id INTEGER REFERENCES contracts(id), data DATE NOT NULL, tipo TEXT NOT NULL, descricao TEXT, horas NUMERIC(6,2) NOT NULL, valor_hora NUMERIC(8,2), observacoes TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE INDEX IF NOT EXISTS idx_events_client_id ON events(client_id);
CREATE INDEX IF NOT EXISTS idx_events_contract_id ON events(contract_id);
CREATE TABLE IF NOT EXISTS payments ( id SERIAL PRIMARY KEY, client_id INTEGER REFERENCES portal_users(id), contract_id INTEGER REFERENCES contracts(id), valor NUMERIC(12,2) NOT NULL, data DATE NOT NULL, metodo TEXT, comprovante_path TEXT, observacoes TEXT, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);
CREATE TABLE IF NOT EXISTS atas ( id SERIAL PRIMARY KEY, event_id INTEGER REFERENCES events(id), client_id INTEGER REFERENCES portal_users(id), titulo TEXT NOT NULL, participantes TEXT, pauta TEXT, discussao TEXT, decisoes TEXT, proximos_passos TEXT, data DATE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE INDEX IF NOT EXISTS idx_atas_event_id ON atas(event_id);
CREATE INDEX IF NOT EXISTS idx_atas_client_id ON atas(client_id);

-- ===== origem: ead/routes.js =====
CREATE TABLE IF NOT EXISTS ead_courses ( id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, titulo TEXT NOT NULL, subtitulo TEXT, descricao TEXT, carga_horaria TEXT, preco NUMERIC(10,2) NOT NULL, preco_original NUMERIC(10,2), imagem TEXT, publico TEXT, prerequisito TEXT, objetivo TEXT, ativo BOOLEAN DEFAULT true, ordem INT DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS ead_modules ( id SERIAL PRIMARY KEY, course_id INTEGER REFERENCES ead_courses(id) ON DELETE CASCADE, titulo TEXT NOT NULL, descricao TEXT, ordem INT NOT NULL DEFAULT 0 );
CREATE INDEX IF NOT EXISTS idx_ead_modules_course_id ON ead_modules(course_id);
CREATE TABLE IF NOT EXISTS ead_lessons ( id SERIAL PRIMARY KEY, module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE, slug TEXT NOT NULL, titulo TEXT NOT NULL, duracao TEXT, conteudo TEXT, entregavel_titulo TEXT, entregavel_url TEXT, ordem INT NOT NULL DEFAULT 0 );
CREATE INDEX IF NOT EXISTS idx_ead_lessons_slug ON ead_lessons(slug);
CREATE INDEX IF NOT EXISTS idx_ead_lessons_module_id ON ead_lessons(module_id);
CREATE TABLE IF NOT EXISTS ead_quiz_questions ( id SERIAL PRIMARY KEY, module_id INTEGER REFERENCES ead_modules(id) ON DELETE CASCADE, course_id INTEGER REFERENCES ead_courses(id) ON DELETE CASCADE, pergunta TEXT NOT NULL, alternativas JSONB NOT NULL, resposta_correta INT NOT NULL, explicacao TEXT, is_final BOOLEAN DEFAULT false );
CREATE INDEX IF NOT EXISTS idx_ead_quiz_questions_module_id ON ead_quiz_questions(module_id);
CREATE INDEX IF NOT EXISTS idx_ead_quiz_questions_course_id ON ead_quiz_questions(course_id);
CREATE TABLE IF NOT EXISTS ead_users ( id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, senha_hash TEXT NOT NULL, nome TEXT NOT NULL, telefone TEXT, empresa TEXT, ativo BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS ead_orders ( id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES ead_users(id), course_id INTEGER REFERENCES ead_courses(id), valor NUMERIC(10,2) NOT NULL, metodo TEXT, status TEXT DEFAULT 'pendente', mp_preference_id TEXT, mp_payment_id TEXT, pix_qr_code TEXT, pix_qr_code_base64 TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), paid_at TIMESTAMPTZ );
CREATE INDEX IF NOT EXISTS idx_ead_orders_user_id ON ead_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ead_orders_course_id ON ead_orders(course_id);
CREATE TABLE IF NOT EXISTS ead_enrollments ( id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES ead_users(id), course_id INTEGER REFERENCES ead_courses(id), order_id INTEGER REFERENCES ead_orders(id), created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, course_id) );
CREATE INDEX IF NOT EXISTS idx_ead_enrollments_user_id ON ead_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_ead_enrollments_course_id ON ead_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_ead_enrollments_order_id ON ead_enrollments(order_id);
CREATE TABLE IF NOT EXISTS ead_progress ( id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES ead_users(id), lesson_id INTEGER REFERENCES ead_lessons(id), completed BOOLEAN DEFAULT false, completed_at TIMESTAMPTZ, UNIQUE(user_id, lesson_id) );
CREATE INDEX IF NOT EXISTS idx_ead_progress_user_id ON ead_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ead_progress_lesson_id ON ead_progress(lesson_id);
CREATE TABLE IF NOT EXISTS ead_quiz_attempts ( id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES ead_users(id), course_id INTEGER REFERENCES ead_courses(id), module_id INTEGER, is_final BOOLEAN DEFAULT false, score NUMERIC(5,2), total_questions INT, correct_answers INT, passed BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE TABLE IF NOT EXISTS ead_certificates ( id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES ead_users(id), course_id INTEGER REFERENCES ead_courses(id), code TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW() );
CREATE INDEX IF NOT EXISTS idx_ead_certificates_user_id ON ead_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_ead_certificates_course_id ON ead_certificates(course_id);
