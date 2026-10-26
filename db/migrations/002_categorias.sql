CREATE TABLE IF NOT EXISTS categorias (
  slug VARCHAR(60) PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  descricao VARCHAR(255) NOT NULL DEFAULT '',
  cor VARCHAR(20) NOT NULL DEFAULT 'blue',
  icone VARCHAR(40) NOT NULL DEFAULT 'building',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categorias_nome_unique ON categorias (LOWER(nome));

INSERT INTO categorias (slug, nome, cor, icone, ordem) VALUES
  ('gabinete', 'Gabinete', 'blue', 'landmark', 1),
  ('casa', 'Casa', 'violet', 'house', 2),
  ('vice_presidencia', 'Vice-Presidência', 'amber', 'briefcase', 3),
  ('pmbv', 'PMBV', 'emerald', 'building', 4)
ON CONFLICT (slug) DO NOTHING;

-- As categorias deixam de ser fixas: o CHECK antigo é removido e o vínculo passa a ser pela tabela.
ALTER TABLE colaboradores DROP CONSTRAINT IF EXISTS colaboradores_categoria_check;
ALTER TABLE colaboradores ALTER COLUMN categoria TYPE VARCHAR(60);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'colaboradores_categoria_fkey') THEN
    ALTER TABLE colaboradores
      ADD CONSTRAINT colaboradores_categoria_fkey
      FOREIGN KEY (categoria) REFERENCES categorias(slug) ON UPDATE CASCADE ON DELETE RESTRICT;
  END IF;
END $$;

DROP TRIGGER IF EXISTS categorias_updated_at ON categorias;
CREATE TRIGGER categorias_updated_at
  BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
