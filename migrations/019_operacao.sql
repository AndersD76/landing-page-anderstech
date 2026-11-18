-- ── Operação de crescimento (18/11/2026) ─────────────────────────────────────
-- Outbound, fila de mensagens com descadastro em 1 clique, supressão,
-- acompanhamento de posts e parceiros-alvo. Tudo que envia mensagem a terceiro
-- fica DESLIGADO por variável de ambiente até o Anders ligar.

-- Contas de prospecção (dado próprio: SiAC/PBQP-H na área de 300 km). Contato
-- vem da base pública do SiAC e fica só aqui no banco, nunca no repositório.
CREATE TABLE IF NOT EXISTS outbound_contas (
  cnpj TEXT PRIMARY KEY,
  empresa TEXT NOT NULL,
  municipio TEXT,
  uf TEXT,
  km INT,
  nivel TEXT,
  subsetor TEXT,
  organismo TEXT,
  validade DATE,
  segmento TEXT,
  score INT,
  motivos TEXT,
  email TEXT,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  nota TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_outbound_status ON outbound_contas (status, score DESC);

-- Quem pediu para não receber. Vale para outbound e régua; não bloqueia
-- mensagem transacional (matrícula, contrato, cobrança pedida pela pessoa).
CREATE TABLE IF NOT EXISTS supressao (
  email TEXT PRIMARY KEY,
  motivo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fila única: e-mail de outbound, régua e tarefas (ligação, LinkedIn). O
-- conteúdo é renderizado na hora do envio, a partir da chave do modelo — assim
-- a condição ("o pedido ainda está pendente?") é conferida no último instante.
CREATE TABLE IF NOT EXISTS mensagens (
  id BIGSERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  chave TEXT NOT NULL,
  ref_tipo TEXT,
  ref_id TEXT,
  email TEXT,
  params JSONB NOT NULL DEFAULT '{}'::jsonb,
  token TEXT UNIQUE NOT NULL,
  agendada_para TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendada',
  enviada_em TIMESTAMPTZ,
  cliques INT NOT NULL DEFAULT 0,
  ultimo_clique_em TIMESTAMPTZ,
  erro TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mensagens_fila ON mensagens (status, agendada_para);
CREATE INDEX IF NOT EXISTS idx_mensagens_ref ON mensagens (ref_tipo, ref_id);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS email_optout BOOLEAN NOT NULL DEFAULT FALSE;

-- Posts e parceiros-alvo: o conteúdo vive no código (growth/conteudo.js);
-- aqui só o que o Anders já fez com cada um.
CREATE TABLE IF NOT EXISTS posts_publicados (
  numero INT PRIMARY KEY,
  publicado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  url TEXT
);

CREATE TABLE IF NOT EXISTS parceiros_alvo_status (
  chave TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'contatado',
  nota TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
