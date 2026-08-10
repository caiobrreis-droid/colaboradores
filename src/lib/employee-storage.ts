import type { CategoriaColaborador, FuncionarioCompleto, StatusRede } from '@/types';

export const EMPLOYEE_STORAGE_KEY = 'vessel:colaboradores:v1';
export const EMPLOYEE_STORAGE_EVENT = 'vessel:colaboradores-atualizados';

export interface EmployeeFormValues {
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cargo: string;
  categoria: CategoriaColaborador | '';
  indicacao: string;
  funcao: string;
  matricula: string;
  dataEntrada: string;
  ativo: boolean;
  foto_url: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia: string;
  instagram: string;
  instagramLink: string;
  facebook: string;
  tiktok: string;
}

const EXAMPLE_EMPLOYEE_IDS = new Set(Array.from({ length: 15 }, (_, index) => String(index + 1)));

export const DEFAULT_EMPLOYEES: FuncionarioCompleto[] = [];

function isBrowser() {
  return typeof window !== 'undefined';
}

export function loadEmployees(): FuncionarioCompleto[] {
  if (!isBrowser()) return DEFAULT_EMPLOYEES;
  try {
    const stored = window.localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    if (!stored) {
      window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
      return DEFAULT_EMPLOYEES;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_EMPLOYEES;

    // Remove somente os antigos registros de demonstração (IDs 1 a 15),
    // preservando todos os cadastros reais criados pelo usuário.
    const employees = parsed.filter((employee) => !EXAMPLE_EMPLOYEE_IDS.has(String(employee?.id)));
    if (employees.length !== parsed.length) {
      window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    }
    return employees;
  } catch {
    return DEFAULT_EMPLOYEES;
  }
}

export function saveEmployees(employees: FuncionarioCompleto[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
  window.dispatchEvent(new CustomEvent(EMPLOYEE_STORAGE_EVENT));
}

export function findEmployee(id: string) {
  return loadEmployees().find((employee) => employee.id === id);
}

export function deleteEmployee(id: string) {
  const next = loadEmployees().filter((employee) => employee.id !== id);
  saveEmployees(next);
  return next;
}

export function setEmployeeNetworkStatus(id: string, status: StatusRede['status']) {
  const employees = loadEmployees();
  const timestamp = new Date().toISOString();
  const next = employees.map((employee) => {
    if (employee.id !== id) return employee;
    const currentStatus = employee.status_redes?.[0];
    return {
      ...employee,
      updated_at: timestamp,
      status_redes: [{
        id: currentStatus?.id || `status-${id}`,
        funcionario_id: id,
        status,
        ultima_avaliacao: timestamp,
        observacoes: currentStatus?.observacoes,
      }],
    };
  });
  saveEmployees(next);
  return next.find((employee) => employee.id === id);
}

export function formValuesFromEmployee(employee?: FuncionarioCompleto): EmployeeFormValues {
  const instagram = employee?.redes_sociais?.find((network) =>
    String(network.rede_social || network.plataforma || '').toLowerCase() === 'instagram',
  );
  const facebook = employee?.redes_sociais?.find((network) =>
    String(network.rede_social || network.plataforma || '').toLowerCase() === 'facebook',
  );
  const tiktok = employee?.redes_sociais?.find((network) =>
    String(network.rede_social || network.plataforma || '').toLowerCase() === 'tiktok',
  );

  return {
    nome: employee?.nome || '',
    cpf: employee?.cpf || '',
    dataNascimento: employee?.dataNascimento || '',
    telefone: employee?.telefone || '',
    whatsapp: employee?.whatsapp || '',
    email: employee?.email || '',
    cargo: employee?.cargo || '',
    categoria: employee?.categoria || '',
    indicacao: employee?.indicacao || '',
    funcao: employee?.funcao || '',
    matricula: employee?.matricula || '',
    dataEntrada: employee?.dataEntrada || '',
    ativo: employee?.ativo ?? true,
    foto_url: employee?.foto_url || '',
    cep: employee?.endereco?.cep || '',
    logradouro: employee?.endereco?.logradouro || '',
    numero: employee?.endereco?.numero || '',
    complemento: employee?.endereco?.complemento || '',
    bairro: employee?.endereco?.bairro || '',
    cidade: employee?.endereco?.cidade || 'Boa Vista',
    estado: employee?.endereco?.estado || 'RR',
    referencia: employee?.endereco?.referencia || '',
    instagram: String(instagram?.username || instagram?.handle || '').replace(/^@/, ''),
    instagramLink: instagram?.url || '',
    facebook: facebook?.url || '',
    tiktok: tiktok?.url || '',
  };
}

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function employeeFromForm(values: EmployeeFormValues, existing?: FuncionarioCompleto): FuncionarioCompleto {
  const id = existing?.id || randomId();
  const timestamp = new Date().toISOString();
  const networks = [];
  if (values.instagram || values.instagramLink) {
    const handle = values.instagram ? `@${values.instagram.replace(/^@/, '')}` : '';
    networks.push({
      id: `instagram-${id}`,
      funcionario_id: id,
      rede_social: 'Instagram',
      plataforma: 'Instagram',
      username: handle,
      handle,
      url: values.instagramLink || `https://instagram.com/${values.instagram.replace(/^@/, '')}`,
    });
  }
  if (values.facebook) networks.push({ id: `facebook-${id}`, funcionario_id: id, rede_social: 'Facebook', plataforma: 'Facebook', url: values.facebook });
  if (values.tiktok) networks.push({ id: `tiktok-${id}`, funcionario_id: id, rede_social: 'TikTok', plataforma: 'TikTok', url: values.tiktok });

  return {
    ...existing,
    id,
    nome: values.nome.trim(),
    cpf: values.cpf.trim(),
    dataNascimento: values.dataNascimento,
    telefone: values.telefone.trim(),
    whatsapp: values.whatsapp.trim(),
    email: values.email.trim(),
    cargo: values.cargo,
    categoria: values.categoria as CategoriaColaborador,
    indicacao: values.indicacao.trim(),
    funcao: values.funcao.trim(),
    matricula: values.matricula.trim(),
    dataEntrada: values.dataEntrada,
    ativo: values.ativo,
    foto_url: values.foto_url,
    created_at: existing?.created_at || timestamp,
    updated_at: timestamp,
    endereco: {
      id: existing?.endereco?.id || `endereco-${id}`,
      funcionario_id: id,
      cep: values.cep.trim(),
      logradouro: values.logradouro.trim(),
      numero: values.numero.trim(),
      complemento: values.complemento.trim(),
      bairro: values.bairro.trim(),
      cidade: values.cidade.trim() || 'Boa Vista',
      estado: values.estado.trim() || 'RR',
      referencia: values.referencia.trim(),
    },
    redes_sociais: networks,
    status_redes: existing?.status_redes?.length
      ? existing.status_redes
      : [{ id: `status-${id}`, funcionario_id: id, status: 'nao_avaliado', ultima_avaliacao: timestamp }],
  };
}

export function upsertEmployee(employee: FuncionarioCompleto) {
  const employees = loadEmployees();
  const index = employees.findIndex((item) => item.id === employee.id);
  const next = [...employees];
  if (index >= 0) next[index] = employee;
  else next.unshift(employee);
  saveEmployees(next);
  return employee;
}

async function responsePayload(response: Response) {
  return response.json().catch(() => ({}));
}

function isLocalFallback(response: Response, payload: { code?: string }) {
  return response.status === 503 && payload.code === 'DATABASE_NOT_CONFIGURED';
}

function broadcastEmployeeChange() {
  if (isBrowser()) window.dispatchEvent(new CustomEvent(EMPLOYEE_STORAGE_EVENT));
}

export async function fetchEmployees(): Promise<FuncionarioCompleto[]> {
  const response = await fetch('/api/colaboradores', { cache: 'no-store' });
  const payload = await responsePayload(response);
  if (response.ok) return payload.employees || [];
  if (isLocalFallback(response, payload)) return loadEmployees();
  throw new Error(payload.message || 'Não foi possível carregar os colaboradores.');
}

export async function fetchEmployee(id: string): Promise<FuncionarioCompleto | undefined> {
  const response = await fetch(`/api/colaboradores/${encodeURIComponent(id)}`, { cache: 'no-store' });
  const payload = await responsePayload(response);
  if (response.ok) return payload.employee;
  if (response.status === 404) return undefined;
  if (isLocalFallback(response, payload)) return findEmployee(id);
  throw new Error(payload.message || 'Não foi possível carregar o colaborador.');
}

export async function persistEmployee(employee: FuncionarioCompleto): Promise<FuncionarioCompleto> {
  const existing = await fetch(`/api/colaboradores/${encodeURIComponent(employee.id)}`, { cache: 'no-store' });
  const existingPayload = await responsePayload(existing);
  if (isLocalFallback(existing, existingPayload)) return upsertEmployee(employee);

  const isExisting = existing.ok;
  const response = await fetch(isExisting ? `/api/colaboradores/${encodeURIComponent(employee.id)}` : '/api/colaboradores', {
    method: isExisting ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  const payload = await responsePayload(response);
  if (!response.ok) throw new Error(payload.message || 'Não foi possível salvar o colaborador.');
  broadcastEmployeeChange();
  return payload.employee;
}

export async function removeEmployeeRecord(id: string): Promise<void> {
  const response = await fetch(`/api/colaboradores/${encodeURIComponent(id)}`, { method: 'DELETE' });
  const payload = await responsePayload(response);
  if (isLocalFallback(response, payload)) {
    deleteEmployee(id);
    return;
  }
  if (!response.ok) throw new Error(payload.message || 'Não foi possível excluir o colaborador.');
  broadcastEmployeeChange();
}

export async function changeEmployeeNetworkStatus(id: string, status: StatusRede['status']): Promise<FuncionarioCompleto | undefined> {
  const response = await fetch(`/api/colaboradores/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const payload = await responsePayload(response);
  if (isLocalFallback(response, payload)) return setEmployeeNetworkStatus(id, status);
  if (!response.ok) throw new Error(payload.message || 'Não foi possível alterar a situação do colaborador.');
  broadcastEmployeeChange();
  return payload.employee;
}

export function employeeAddress(employee: FuncionarioCompleto) {
  const address = employee.endereco;
  if (!address) return '';
  return [
    [address.logradouro, address.numero].filter(Boolean).join(', '),
    address.bairro,
    [address.cidade, address.estado].filter(Boolean).join(' - '),
    address.cep,
  ].filter(Boolean).join(', ');
}
