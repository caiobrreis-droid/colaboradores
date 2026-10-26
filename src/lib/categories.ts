import {
  Briefcase,
  BriefcaseBusiness,
  Building,
  Building2,
  Car,
  ClipboardList,
  Crown,
  GraduationCap,
  HandHeart,
  HardHat,
  Headset,
  HeartPulse,
  House,
  Landmark,
  Megaphone,
  Scale,
  Shield,
  Star,
  Store,
  Tag,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { loadEmployees, saveEmployees } from '@/lib/employee-storage';
import type { Categoria } from '@/types';

export const CATEGORY_STORAGE_KEY = 'vessel:categorias:v1';
export const CATEGORY_STORAGE_EVENT = 'vessel:categorias-atualizadas';

export const DEFAULT_CATEGORIES: Categoria[] = [
  { slug: 'gabinete', nome: 'Gabinete', descricao: '', cor: 'blue', icone: 'landmark', ordem: 1, ativo: true },
  { slug: 'casa', nome: 'Casa', descricao: '', cor: 'violet', icone: 'house', ordem: 2, ativo: true },
  { slug: 'vice_presidencia', nome: 'Vice-Presidência', descricao: '', cor: 'amber', icone: 'briefcase', ordem: 3, ativo: true },
  { slug: 'pmbv', nome: 'PMBV', descricao: '', cor: 'emerald', icone: 'building', ordem: 4, ativo: true },
];

// As classes ficam escritas por extenso para o Tailwind encontrá-las no build.
export const CATEGORY_COLORS = {
  blue: { label: 'Azul', chip: 'bg-blue-50 text-blue-700', badge: 'border-blue-100 bg-blue-50 text-blue-700', dot: 'bg-blue-500', print: { border: '#bcd2ff', text: '#0758e3', background: '#f0f5ff' } },
  violet: { label: 'Violeta', chip: 'bg-violet-50 text-violet-700', badge: 'border-violet-100 bg-violet-50 text-violet-700', dot: 'bg-violet-500', print: { border: '#ddd0ff', text: '#6d28d9', background: '#f5f1ff' } },
  amber: { label: 'Âmbar', chip: 'bg-amber-50 text-amber-700', badge: 'border-amber-100 bg-amber-50 text-amber-700', dot: 'bg-amber-500', print: { border: '#fde3a7', text: '#b45309', background: '#fffaeb' } },
  emerald: { label: 'Verde', chip: 'bg-emerald-50 text-emerald-700', badge: 'border-emerald-100 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', print: { border: '#b9ead0', text: '#07934a', background: '#effcf5' } },
  rose: { label: 'Rosa', chip: 'bg-rose-50 text-rose-700', badge: 'border-rose-100 bg-rose-50 text-rose-700', dot: 'bg-rose-500', print: { border: '#fecdd6', text: '#be123c', background: '#fff1f3' } },
  cyan: { label: 'Ciano', chip: 'bg-cyan-50 text-cyan-700', badge: 'border-cyan-100 bg-cyan-50 text-cyan-700', dot: 'bg-cyan-500', print: { border: '#a5f0fc', text: '#0e7490', background: '#ecfeff' } },
  orange: { label: 'Laranja', chip: 'bg-orange-50 text-orange-700', badge: 'border-orange-100 bg-orange-50 text-orange-700', dot: 'bg-orange-500', print: { border: '#fed7aa', text: '#c2410c', background: '#fff7ed' } },
  slate: { label: 'Cinza', chip: 'bg-slate-100 text-slate-700', badge: 'border-slate-200 bg-slate-50 text-slate-700', dot: 'bg-slate-500', print: { border: '#cbd5e1', text: '#334155', background: '#f8fafc' } },
} as const;

export type CategoryColor = keyof typeof CATEGORY_COLORS;

export const CATEGORY_ICONS: Record<string, { label: string; icon: LucideIcon }> = {
  landmark: { label: 'Prédio público', icon: Landmark },
  house: { label: 'Casa', icon: House },
  briefcase: { label: 'Pasta executiva', icon: BriefcaseBusiness },
  building: { label: 'Prédio', icon: Building2 },
  office: { label: 'Escritório', icon: Building },
  work: { label: 'Trabalho', icon: Briefcase },
  star: { label: 'Estrela', icon: Star },
  crown: { label: 'Coroa', icon: Crown },
  users: { label: 'Equipe', icon: Users },
  megaphone: { label: 'Comunicação', icon: Megaphone },
  shield: { label: 'Segurança', icon: Shield },
  scale: { label: 'Jurídico', icon: Scale },
  health: { label: 'Saúde', icon: HeartPulse },
  education: { label: 'Educação', icon: GraduationCap },
  social: { label: 'Ação social', icon: HandHeart },
  support: { label: 'Atendimento', icon: Headset },
  car: { label: 'Transporte', icon: Car },
  tools: { label: 'Manutenção', icon: Wrench },
  works: { label: 'Obras', icon: HardHat },
  commerce: { label: 'Comércio', icon: Store },
  tasks: { label: 'Administrativo', icon: ClipboardList },
  tag: { label: 'Etiqueta', icon: Tag },
};

export function categoryColor(color?: string) {
  return CATEGORY_COLORS[(color as CategoryColor) in CATEGORY_COLORS ? (color as CategoryColor) : 'slate'];
}

export function categoryIcon(icon?: string): LucideIcon {
  return CATEGORY_ICONS[icon || '']?.icon || Tag;
}

export function slugifyCategory(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50) || 'categoria';
}

export function sortCategories(categories: Categoria[]) {
  return [...categories].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR'));
}

function isBrowser() {
  return typeof window !== 'undefined';
}

function loadLocalCategories(): Categoria[] {
  if (!isBrowser()) return DEFAULT_CATEGORIES;
  try {
    const stored = window.localStorage.getItem(CATEGORY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : null;
    return Array.isArray(parsed) && parsed.length ? sortCategories(parsed) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveLocalCategories(categories: Categoria[]) {
  window.localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(sortCategories(categories)));
}

function broadcastCategoryChange() {
  if (isBrowser()) window.dispatchEvent(new CustomEvent(CATEGORY_STORAGE_EVENT));
}

async function responsePayload(response: Response) {
  return response.json().catch(() => ({}));
}

function isLocalFallback(response: Response, payload: { code?: string }) {
  return response.status === 503 && payload.code === 'DATABASE_NOT_CONFIGURED';
}

export async function fetchCategories(): Promise<Categoria[]> {
  const response = await fetch('/api/categorias', { cache: 'no-store' });
  const payload = await responsePayload(response);
  if (response.ok) return payload.categories || [];
  if (isLocalFallback(response, payload)) return loadLocalCategories();
  throw new Error(payload.message || 'Não foi possível carregar as categorias.');
}

export type CategoryInput = Pick<Categoria, 'nome' | 'descricao' | 'cor' | 'icone' | 'ativo'> & { slug?: string };

export async function persistCategory(input: CategoryInput): Promise<Categoria> {
  const isExisting = Boolean(input.slug);
  const response = await fetch('/api/categorias', {
    method: isExisting ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const payload = await responsePayload(response);

  if (isLocalFallback(response, payload)) {
    const categories = loadLocalCategories();
    const nome = input.nome.trim();
    if (categories.some((item) => item.nome.toLowerCase() === nome.toLowerCase() && item.slug !== input.slug)) {
      throw new Error('Já existe uma categoria com este nome.');
    }
    let saved: Categoria;
    if (isExisting) {
      const current = categories.find((item) => item.slug === input.slug);
      if (!current) throw new Error('Categoria não encontrada.');
      saved = { ...current, ...input, nome, slug: current.slug };
      saveLocalCategories(categories.map((item) => item.slug === saved.slug ? saved : item));
    } else {
      const base = slugifyCategory(nome);
      let slug = base;
      for (let suffix = 2; categories.some((item) => item.slug === slug); suffix += 1) slug = `${base}_${suffix}`;
      saved = { ...input, nome, slug, ordem: Math.max(0, ...categories.map((item) => item.ordem)) + 1 };
      saveLocalCategories([...categories, saved]);
    }
    broadcastCategoryChange();
    return saved;
  }

  if (!response.ok) throw new Error(payload.message || 'Não foi possível salvar a categoria.');
  broadcastCategoryChange();
  return payload.category;
}

export async function reorderCategories(slugs: string[]): Promise<void> {
  const response = await fetch('/api/categorias', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordem: slugs }),
  });
  const payload = await responsePayload(response);
  if (isLocalFallback(response, payload)) {
    const categories = loadLocalCategories();
    saveLocalCategories(categories.map((item) => ({ ...item, ordem: slugs.indexOf(item.slug) + 1 || item.ordem })));
    broadcastCategoryChange();
    return;
  }
  if (!response.ok) throw new Error(payload.message || 'Não foi possível reordenar as categorias.');
  broadcastCategoryChange();
}

/** Exclui a categoria. Com `moveTo`, os colaboradores dela são transferidos antes da exclusão. */
export async function removeCategory(slug: string, moveTo?: string): Promise<void> {
  const params = new URLSearchParams({ slug });
  if (moveTo) params.set('moverPara', moveTo);
  const response = await fetch(`/api/categorias?${params}`, { method: 'DELETE' });
  const payload = await responsePayload(response);
  if (isLocalFallback(response, payload)) {
    const employees = loadEmployees();
    if (employees.some((employee) => employee.categoria === slug)) {
      if (!moveTo) throw new Error('Existem colaboradores nesta categoria. Escolha para onde movê-los.');
      saveEmployees(employees.map((employee) => employee.categoria === slug ? { ...employee, categoria: moveTo } : employee));
    }
    saveLocalCategories(loadLocalCategories().filter((item) => item.slug !== slug));
    broadcastCategoryChange();
    return;
  }
  if (!response.ok) throw new Error(payload.message || 'Não foi possível excluir a categoria.');
  broadcastCategoryChange();
}
