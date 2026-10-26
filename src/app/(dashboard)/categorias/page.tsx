'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowDown, ArrowUp, Edit2, Loader2, Plus, Search, Tags, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

import { CategoryDialog } from '@/components/categorias/category-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/hooks/use-categories';
import { categoryColor, categoryIcon, removeCategory, reorderCategories } from '@/lib/categories';
import { EMPLOYEE_STORAGE_EVENT, fetchEmployees } from '@/lib/employee-storage';
import { cn } from '@/lib/utils';
import type { Categoria, FuncionarioCompleto } from '@/types';

export default function CategoriasPage() {
  const { categories, loading } = useCategories();
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Categoria | null>(null);
  const [moveTo, setMoveTo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = () => void fetchEmployees().then(setEmployees).catch(() => undefined);
    load();
    window.addEventListener(EMPLOYEE_STORAGE_EVENT, load);
    return () => window.removeEventListener(EMPLOYEE_STORAGE_EVENT, load);
  }, []);

  const counts = useMemo(() => {
    const totals = new Map<string, number>();
    employees.forEach((employee) => totals.set(employee.categoria, (totals.get(employee.categoria) || 0) + 1));
    return totals;
  }, [employees]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? categories.filter((item) => `${item.nome} ${item.descricao}`.toLowerCase().includes(term)) : categories;
  }, [categories, search]);

  const deleteCount = deleteTarget ? counts.get(deleteTarget.slug) || 0 : 0;

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (category: Categoria) => { setEditing(category); setDialogOpen(true); };

  const move = async (index: number, direction: -1 | 1) => {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await reorderCategories(next.map((item) => item.slug));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível reordenar.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteCount > 0 && !moveTo) {
      toast.error('Escolha para qual categoria os colaboradores serão movidos.');
      return;
    }
    setIsDeleting(true);
    try {
      await removeCategory(deleteTarget.slug, deleteCount > 0 ? moveTo : undefined);
      toast.success(deleteCount > 0
        ? `${deleteTarget.nome} excluída. ${deleteCount} colaborador(es) movido(s).`
        : `${deleteTarget.nome} excluída.`);
      setDeleteTarget(null);
      setMoveTo('');
      void fetchEmployees().then(setEmployees).catch(() => undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir a categoria.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vessel-deep">Categorias</h1>
          <p className="mt-1 text-muted-foreground">Crie e organize as lotações dos colaboradores, como Gabinete, Casa ou novas áreas.</p>
        </div>
        <Button onClick={openNew} className="w-full bg-vessel-blue text-white hover:bg-vessel-blue/90 sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />Nova categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Summary icon={Tags} label="Categorias" value={categories.length} />
        <Summary icon={Tags} label="Disponíveis no cadastro" value={categories.filter((item) => item.ativo).length} />
        <Summary icon={Users} label="Colaboradores classificados" value={employees.length} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar categoria" className="bg-white pl-9" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Carregando categorias...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((category) => {
            const Icon = categoryIcon(category.icone);
            const color = categoryColor(category.cor);
            const index = categories.findIndex((item) => item.slug === category.slug);
            const total = counts.get(category.slug) || 0;
            return (
              <div key={category.slug} className={cn('group flex flex-col rounded-xl border border-vessel-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md', !category.ativo && 'opacity-70')}>
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', color.chip)}><Icon className="h-5 w-5" /></span>
                  <Badge variant="outline" className={category.ativo ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'}>
                    {category.ativo ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
                <h2 className="mt-4 truncate font-semibold text-vessel-deep">{category.nome}</h2>
                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{category.descricao || 'Sem descrição.'}</p>
                <Link href={`/funcionarios?categoria=${encodeURIComponent(category.slug)}`} className="mt-3 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-vessel-blue hover:underline">
                  <Users className="h-4 w-4" />{total} colaborador{total === 1 ? '' : 'es'}
                </Link>
                <div className="mt-4 flex items-center gap-1 border-t border-vessel-gray-100 pt-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" disabled={search !== '' || index === 0} onClick={() => move(index, -1)} aria-label={`Mover ${category.nome} para cima`}><ArrowUp className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500" disabled={search !== '' || index === categories.length - 1} onClick={() => move(index, 1)} aria-label={`Mover ${category.nome} para baixo`}><ArrowDown className="h-4 w-4" /></Button>
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-vessel-blue" onClick={() => openEdit(category)}><Edit2 className="mr-1.5 h-4 w-4" />Editar</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => { setDeleteTarget(category); setMoveTo(''); }} aria-label={`Excluir ${category.nome}`}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            );
          })}

          {!search && (
            <button type="button" onClick={openNew} className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-vessel-gray-200 bg-white/60 p-5 text-muted-foreground transition hover:border-vessel-blue hover:text-vessel-blue">
              <Plus className="h-6 w-6" />
              <span className="font-medium">Adicionar categoria</span>
            </button>
          )}
          {search && visible.length === 0 && (
            <div className="col-span-full rounded-lg border border-vessel-gray-100 bg-white p-8 text-center text-muted-foreground">Nenhuma categoria encontrada.</div>
          )}
        </div>
      )}

      <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Excluir categoria</DialogTitle>
            <DialogDescription>
              {deleteCount > 0
                ? `${deleteTarget?.nome} tem ${deleteCount} colaborador(es). Escolha para onde eles serão movidos antes de excluir.`
                : `Tem certeza que deseja excluir ${deleteTarget?.nome}? Esta ação não pode ser desfeita.`}
            </DialogDescription>
          </DialogHeader>
          {deleteCount > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="mover-para">Mover colaboradores para</Label>
              <Select value={moveTo} onValueChange={setMoveTo}>
                <SelectTrigger id="mover-para"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((item) => item.slug !== deleteTarget?.slug).map((item) => (
                    <SelectItem key={item.slug} value={item.slug}>{item.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Se preferir manter o histórico, edite a categoria e desative-a em vez de excluir.</p>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteCount > 0 ? 'Mover e excluir' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Tags; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-vessel-gray-100 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-vessel-blue"><Icon className="h-5 w-5" /></span>
      <span><span className="block text-xl font-bold text-vessel-deep">{value}</span><span className="text-xs text-muted-foreground">{label}</span></span>
    </div>
  );
}
