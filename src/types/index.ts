export type UserRole = 'admin' | 'operator' | 'viewer';
export type CategoriaColaborador = 'gabinete' | 'casa' | 'vice_presidencia' | 'pmbv';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  whatsapp?: string;
  telefone: string;
  email?: string;
  cargo: string;
  categoria: CategoriaColaborador;
  indicacao?: string;
  funcao?: string;
  matricula?: string;
  dataEntrada?: string;
  ativo?: boolean;
  foto_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Endereco {
  id: string;
  funcionario_id: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia?: string;
  lat?: number;
  lng?: number;
}

export interface RedeSocial {
  id: string;
  funcionario_id: string;
  plataforma: string;
  url: string;
  handle?: string;
}

export interface StatusRede {
  id: string;
  funcionario_id: string;
  status: 'positivado' | 'negativado' | 'nao_avaliado' | 'rede_nao_encontrada';
  ultima_avaliacao: string;
  observacoes?: string;
}

export interface Publicacao {
  id: string;
  funcionario_id: string;
  rede_social_id: string;
  url: string;
  tipo: string;
  status: string;
  data_publicacao: string;
  engajamento?: number;
}

export interface Historico {
  id: string;
  funcionario_id: string;
  acao: string;
  detalhes: string;
  data_acao: string;
  usuario_id: string;
}

export interface FuncionarioCompleto extends Funcionario {
  endereco?: Endereco;
  redes_sociais?: any[];
  status_rede?: StatusRede;
  status_redes?: any[];
}

export interface DashboardStats {
  totalFuncionarios: number;
  positivados: number;
  negativados: number;
  naoAvaliados: number;
  recentActivity: ActivityLog[];
}

export interface BairroStats {
  bairro: string;
  count: number;
}

export interface ReportFilter {
  status?: string;
  cargo?: string;
  bairro?: string;
  categoria?: CategoriaColaborador;
  dataInicio?: string;
  dataFim?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}
