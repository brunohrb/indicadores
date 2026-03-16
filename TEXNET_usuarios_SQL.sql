-- ================================================
-- TEXNET — Sistema de Usuários
-- Cole e execute no Supabase → SQL Editor → Run
-- ================================================

-- 1. Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  senha_hash    TEXT NOT NULL,        -- senha em SHA-256 (gerado no frontend)
  perfil        TEXT NOT NULL DEFAULT 'visualizacao'
                CHECK (perfil IN ('visualizacao', 'edicao')),
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acesso TIMESTAMPTZ
);

-- 2. Índice no email para login rápido
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- 3. Inserir usuário EDITOR (acesso total — troque email e senha)
INSERT INTO usuarios (nome, email, senha_hash, perfil)
VALUES (
  'Administrador',
  'admin@texnet.com.br',
  encode(sha256('admin123'::bytea), 'hex'),
  'edicao'
)
ON CONFLICT (email) DO NOTHING;

-- 4. Inserir usuário VISUALIZADOR (sem ⚙️Parâmetros e sem 📊Power BI — troque email e senha)
INSERT INTO usuarios (nome, email, senha_hash, perfil)
VALUES (
  'Visualizador',
  'view@texnet.com.br',
  encode(sha256('view123'::bytea), 'hex'),
  'visualizacao'
)
ON CONFLICT (email) DO NOTHING;

-- 5. RLS — leitura via anon key (mesma usada pelo dashboard)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leitura_anonima" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "sistema_pode_atualizar" ON usuarios
  FOR UPDATE USING (true);

-- 6. Verificar usuários criados
SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios;

-- ------------------------------------------------
-- COMO ADICIONAR MAIS USUÁRIOS DEPOIS:
-- ------------------------------------------------
-- INSERT INTO usuarios (nome, email, senha_hash, perfil)
-- VALUES (
--   'Nome do Usuário',
--   'email@empresa.com',
--   encode(sha256('SenhaForte123'::bytea), 'hex'),
--   'visualizacao'   -- ou 'edicao'
-- );
