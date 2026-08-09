CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  permissao VARCHAR(30) NOT NULL DEFAULT 'Visualizador'
    CHECK (permissao IN ('Administrador', 'Operador', 'Visualizador')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(20),
  cargo VARCHAR(120) NOT NULL,
  categoria VARCHAR(30) NOT NULL
    CHECK (categoria IN ('gabinete', 'casa', 'vice_presidencia', 'pmbv')),
  bairro VARCHAR(120),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  foto_key TEXT,
  dados JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_colaboradores_cpf_unique
  ON colaboradores (cpf)
  WHERE cpf IS NOT NULL AND cpf <> '';
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores (LOWER(nome));
CREATE INDEX IF NOT EXISTS idx_colaboradores_categoria ON colaboradores (categoria);
CREATE INDEX IF NOT EXISTS idx_colaboradores_bairro ON colaboradores (bairro);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario ON sessoes (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_expiracao ON sessoes (expires_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS usuarios_updated_at ON usuarios;
CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS colaboradores_updated_at ON colaboradores;
CREATE TRIGGER colaboradores_updated_at
  BEFORE UPDATE ON colaboradores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
