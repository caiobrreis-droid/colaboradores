-- Adiciona categoria organizacional e foto aos cadastros já existentes.
ALTER TABLE funcionarios
  ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) NOT NULL DEFAULT 'gabinete'
  CHECK (categoria IN ('gabinete', 'casa', 'vice_presidencia', 'pmbv'));

ALTER TABLE funcionarios
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

CREATE INDEX IF NOT EXISTS idx_funcionarios_categoria ON funcionarios(categoria);
