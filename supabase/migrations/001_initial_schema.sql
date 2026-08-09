-- Drop existing tables if any
DROP TABLE IF EXISTS historico CASCADE;
DROP TABLE IF EXISTS publicacoes CASCADE;
DROP TABLE IF EXISTS status_redes CASCADE;
DROP TABLE IF EXISTS redes_sociais CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;
DROP TABLE IF EXISTS funcionarios CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Extended User Data)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  permissao VARCHAR(50) DEFAULT 'Visualizador' CHECK (permissao IN ('Administrador', 'Operador', 'Visualizador')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FUNCIONARIOS
CREATE TABLE funcionarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  rg VARCHAR(20),
  data_nascimento DATE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  cargo VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL DEFAULT 'gabinete' CHECK (categoria IN ('gabinete', 'casa', 'vice_presidencia', 'pmbv')),
  foto_url TEXT,
  secao_zona VARCHAR(50),
  indicacao VARCHAR(255),
  situacao VARCHAR(50) DEFAULT 'Pendente' CHECK (situacao IN ('Pendente', 'Positivado', 'Negativado', 'Não Localizado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- ENDERECOS
CREATE TABLE enderecos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  cep VARCHAR(10),
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) DEFAULT 'Boa Vista',
  estado VARCHAR(2) DEFAULT 'RR',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REDES SOCIAIS
CREATE TABLE redes_sociais (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  instagram VARCHAR(100),
  facebook VARCHAR(100),
  tiktok VARCHAR(100),
  twitter VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STATUS REDES SOCIAIS (Metadados do Instagram)
CREATE TABLE status_redes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  seguidores INTEGER DEFAULT 0,
  seguindo INTEGER DEFAULT 0,
  postagens INTEGER DEFAULT 0,
  ultimo_post_data TIMESTAMPTZ,
  engajamento_medio DECIMAL(5,2),
  link_perfil VARCHAR(255),
  foto_perfil VARCHAR(255),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PUBLICACOES (Acompanhamento de Posts)
CREATE TABLE publicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  url VARCHAR(255),
  tipo VARCHAR(50) CHECK (tipo IN ('Feed', 'Reels', 'Story', 'Outro')),
  data_publicacao TIMESTAMPTZ NOT NULL,
  likes INTEGER DEFAULT 0,
  comentarios INTEGER DEFAULT 0,
  conteudo TEXT,
  tem_marcacao BOOLEAN DEFAULT false,
  avaliacao VARCHAR(50) CHECK (avaliacao IN ('Positiva', 'Neutra', 'Negativa')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  registrado_por UUID REFERENCES profiles(id)
);

-- HISTORICO (Audit Log)
CREATE TABLE historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funcionario_id UUID REFERENCES funcionarios(id) ON DELETE CASCADE,
  acao VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  realizado_por UUID REFERENCES profiles(id)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_funcionarios_modtime BEFORE UPDATE ON funcionarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enderecos_modtime BEFORE UPDATE ON enderecos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_redes_sociais_modtime BEFORE UPDATE ON redes_sociais FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_status_redes_modtime BEFORE UPDATE ON status_redes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_publicacoes_modtime BEFORE UPDATE ON publicacoes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, permissao, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Visualizador',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE redes_sociais ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_redes ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Authenticated users can read all, write depends on role)
-- Simplified for this migration, in production you'd use functions to check user role
CREATE POLICY "Enable read access for all authenticated users" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON funcionarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON enderecos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON redes_sociais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON status_redes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON publicacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for all authenticated users" ON historico FOR SELECT TO authenticated USING (true);

-- Allow all operations for authenticated users (Simplified for prototype)
CREATE POLICY "Enable all access for authenticated users" ON funcionarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON enderecos FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON redes_sociais FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON status_redes FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON publicacoes FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON historico FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX idx_funcionarios_nome ON funcionarios(nome);
CREATE INDEX idx_funcionarios_cargo ON funcionarios(cargo);
CREATE INDEX idx_funcionarios_categoria ON funcionarios(categoria);
CREATE INDEX idx_funcionarios_situacao ON funcionarios(situacao);
CREATE INDEX idx_enderecos_bairro ON enderecos(bairro);
CREATE INDEX idx_redes_sociais_instagram ON redes_sociais(instagram);
CREATE INDEX idx_historico_funcionario ON historico(funcionario_id);
CREATE INDEX idx_publicacoes_funcionario ON publicacoes(funcionario_id);

-- SEED DATA (To match the mock data)
-- Assuming we have an admin user, but since we can't get the UUID easily without auth setup,
-- we'll just insert the 15 employees without created_by for now (or it will be null).

DO $$
DECLARE
    f1_id UUID := uuid_generate_v4();
    f2_id UUID := uuid_generate_v4();
    f3_id UUID := uuid_generate_v4();
    f4_id UUID := uuid_generate_v4();
    f5_id UUID := uuid_generate_v4();
    f6_id UUID := uuid_generate_v4();
    f7_id UUID := uuid_generate_v4();
    f8_id UUID := uuid_generate_v4();
    f9_id UUID := uuid_generate_v4();
    f10_id UUID := uuid_generate_v4();
    f11_id UUID := uuid_generate_v4();
    f12_id UUID := uuid_generate_v4();
    f13_id UUID := uuid_generate_v4();
    f14_id UUID := uuid_generate_v4();
    f15_id UUID := uuid_generate_v4();
BEGIN

-- 1. João Silva
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f1_id, 'João Silva', 'Coordenador', '(95) 99123-4567', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f1_id, 'Rua das Flores', 'Centro', 2.81972, -60.67333);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f1_id, 'joaosilva');
INSERT INTO status_redes (funcionario_id, seguidores, postagens) VALUES (f1_id, 1500, 340);

-- 2. Maria Oliveira
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f2_id, 'Maria Oliveira', 'Mobilizador', '(95) 98123-4567', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f2_id, 'Av. Brasil', 'Pintolândia', 2.80211, -60.71022);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f2_id, 'maria.oli');
INSERT INTO status_redes (funcionario_id, seguidores, postagens) VALUES (f2_id, 3200, 150);

-- 3. Carlos Souza
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f3_id, 'Carlos Souza', 'Apoiador', '(95) 99999-1234', 'Pendente');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f3_id, 'Rua Nova', 'Mecejana', 2.82566, -60.68411);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f3_id, 'carlos.sz');
INSERT INTO status_redes (funcionario_id, seguidores, postagens) VALUES (f3_id, 800, 45);

-- 4. Ana Santos
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f4_id, 'Ana Santos', 'Apoiador', '(95) 98888-2222', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f4_id, 'Rua 2', 'Caimbé', 2.81500, -60.69000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f4_id, 'ana.santos');
INSERT INTO status_redes (funcionario_id, seguidores, postagens) VALUES (f4_id, 1200, 80);

-- 5. Pedro Lima
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f5_id, 'Pedro Lima', 'Mobilizador', '(95) 97777-3333', 'Negativado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f5_id, 'Rua 3', 'Asa Branca', 2.83000, -60.70000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f5_id, 'pedro_lima');

-- 6. Fernanda Costa
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f6_id, 'Fernanda Costa', 'Coordenador', '(95) 96666-4444', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f6_id, 'Rua 4', 'São Vicente', 2.81000, -60.68000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f6_id, 'fecosta');

-- 7. Rafael Mendes
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f7_id, 'Rafael Mendes', 'Apoiador', '(95) 95555-5555', 'Pendente');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f7_id, 'Rua 5', 'Liberdade', 2.82000, -60.71000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f7_id, 'rafa.mendes');

-- 8. Juliana Ferreira
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f8_id, 'Juliana Ferreira', 'Liderança', '(95) 94444-6666', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f8_id, 'Rua 6', 'Buritis', 2.80000, -60.70000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f8_id, 'ju_ferreira');

-- 9. Lucas Rodrigues
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f9_id, 'Lucas Rodrigues', 'Apoiador', '(95) 93333-7777', 'Não Localizado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f9_id, 'Rua 7', 'Tancredo Neves', 2.84000, -60.72000);

-- 10. Camila Almeida
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f10_id, 'Camila Almeida', 'Mobilizador', '(95) 92222-8888', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f10_id, 'Rua 8', 'Pricumã', 2.81800, -60.69500);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f10_id, 'camila.alm');

-- 11. Marcos Pereira
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f11_id, 'Marcos Pereira', 'Coordenador', '(95) 91111-9999', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f11_id, 'Rua 9', 'Caranã', 2.83500, -60.71500);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f11_id, 'marcos_p');

-- 12. Patricia Gomes
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f12_id, 'Patricia Gomes', 'Apoiador', '(95) 90000-0000', 'Pendente');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f12_id, 'Rua 10', 'Jardim Floresta', 2.82500, -60.70500);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f12_id, 'paty.gomes');

-- 13. Thiago Nascimento
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f13_id, 'Thiago Nascimento', 'Liderança', '(95) 99888-7777', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f13_id, 'Rua 11', 'Sílvio Botelho', 2.80500, -60.72500);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f13_id, 'thiago.nasc');

-- 14. Larissa Ribeiro
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f14_id, 'Larissa Ribeiro', 'Mobilizador', '(95) 99777-6666', 'Positivado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f14_id, 'Rua 12', 'Paraviana', 2.84500, -60.69000);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f14_id, 'lari_ribeiro');

-- 15. Bruno Carvalho
INSERT INTO funcionarios (id, nome, cargo, telefone, situacao) VALUES (f15_id, 'Bruno Carvalho', 'Apoiador', '(95) 99666-5555', 'Negativado');
INSERT INTO enderecos (funcionario_id, logradouro, bairro, latitude, longitude) VALUES (f15_id, 'Rua 13', 'Bairro dos Estados', 2.83200, -60.68500);
INSERT INTO redes_sociais (funcionario_id, instagram) VALUES (f15_id, 'bruno_carv');

-- Categorias organizacionais dos colaboradores
UPDATE funcionarios SET categoria = 'gabinete' WHERE id IN (f1_id, f2_id, f6_id, f9_id, f11_id);
UPDATE funcionarios SET categoria = 'casa' WHERE id IN (f3_id, f4_id, f8_id);
UPDATE funcionarios SET categoria = 'vice_presidencia' WHERE id IN (f12_id, f14_id);
UPDATE funcionarios SET categoria = 'pmbv' WHERE id IN (f5_id, f7_id, f10_id, f13_id, f15_id);

END $$;
