-- Separa Casa e Vice-Presidência em categorias independentes.
ALTER TABLE funcionarios
  DROP CONSTRAINT IF EXISTS funcionarios_categoria_check;

-- Registros antigos da categoria combinada permanecem em Casa e podem ser
-- reclassificados individualmente como Vice-Presidência pela interface.
UPDATE funcionarios
SET categoria = 'casa'
WHERE categoria = 'casa_vice_presidencia';

ALTER TABLE funcionarios
  ADD CONSTRAINT funcionarios_categoria_check
  CHECK (categoria IN ('gabinete', 'casa', 'vice_presidencia', 'pmbv'));
