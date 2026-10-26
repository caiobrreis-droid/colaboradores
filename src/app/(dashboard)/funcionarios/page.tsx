'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import { CategoryDialog } from '@/components/categorias/category-dialog';
import { EmployeeCard } from '@/components/funcionarios/employee-card';
import { EmployeeFilters, type EmployeeFiltersState } from '@/components/funcionarios/employee-filters';
import { EmployeeTable } from '@/components/funcionarios/employee-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/use-categories';
import { categoryColor, categoryIcon } from '@/lib/categories';
import { cn } from '@/lib/utils';
import { changeEmployeeNetworkStatus, fetchEmployees, removeEmployeeRecord } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

const initialFilters: EmployeeFiltersState = {
  search: '',
  categoria: 'all',
  bairro: 'all',
  cargo: 'all',
  situacao: 'all',
  positivacao: 'all',
  instagram: 'all',
};

export default function FuncionariosPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [deleteTarget, setDeleteTarget] = useState<FuncionarioCompleto>();
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const { categories } = useCategories();

  useEffect(() => {
    // Permite abrir a lista já filtrada, ex.: /funcionarios?categoria=casa (link da tela de categorias).
    const categoria = new URLSearchParams(window.location.search).get('categoria');
    if (categoria) setFilters((current) => ({ ...current, categoria }));
  }, []);

  useEffect(() => {
    void fetchEmployees().then(setEmployees).catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os colaboradores.');
    });
  }, []);

  const filteredData = useMemo(() => employees.filter((employee) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const searchable = [employee.nome, employee.telefone, employee.indicacao].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(search)) return false;
    }
    if (filters.categoria !== 'all' && employee.categoria !== filters.categoria) return false;
    if (filters.bairro !== 'all' && employee.endereco?.bairro !== filters.bairro) return false;
    if (filters.cargo !== 'all' && employee.cargo !== filters.cargo) return false;
    if (filters.situacao !== 'all') {
      const situation = employee.ativo === false ? 'inativo' : 'ativo';
      if (situation !== filters.situacao) return false;
    }
    const networkStatus = employee.status_redes?.[0]?.status || 'nao_avaliado';
    if (filters.positivacao !== 'all' && networkStatus !== filters.positivacao) return false;
    if (filters.instagram !== 'all') {
      const hasInstagram = employee.redes_sociais?.some((network) =>
        String(network.rede_social || network.plataforma || '').toLowerCase() === 'instagram' && (network.username || network.handle || network.url),
      );
      if (filters.instagram === 'com' && !hasInstagram) return false;
      if (filters.instagram === 'sem' && hasInstagram) return false;
    }
    return true;
  }), [employees, filters]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeEmployeeRecord(deleteTarget.id);
      setEmployees((current) => current.filter((employee) => employee.id !== deleteTarget.id));
      toast.success(`${deleteTarget.nome} foi excluído do sistema.`);
      setDeleteTarget(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir o colaborador.');
    }
  };

  const handleStatusChange = async (id: string, status: 'positivado' | 'negativado' | 'nao_avaliado' | 'rede_nao_encontrada') => {
    try {
      const updated = await changeEmployeeNetworkStatus(id, status);
      if (updated) setEmployees((current) => current.map((employee) => employee.id === updated.id ? updated : employee));
      const labels = { positivado: 'positivado', negativado: 'despositivado', nao_avaliado: 'parcial', rede_nao_encontrada: 'com a rede não encontrada' };
      toast.success(`${updated?.nome || 'Colaborador'} ficou ${labels[status]}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível alterar a situação.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vessel-deep">Colaboradores</h1>
          <p className="mt-1 text-muted-foreground">Organize as equipes por categoria e acompanhe os cadastros. ({filteredData.length} registros)</p>
        </div>
        <Button onClick={() => router.push('/funcionarios/novo')} className="w-full bg-vessel-blue text-white hover:bg-vessel-blue/90 sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />Novo Colaborador
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-vessel-deep">Categorias</h2>
          <Button variant="ghost" size="sm" className="h-8 text-vessel-blue" onClick={() => router.push('/categorias')}>
            <Settings2 className="mr-1.5 h-4 w-4" />Gerenciar
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categories.filter((category) => category.ativo || employees.some((employee) => employee.categoria === category.slug)).map((category) => {
            const Icon = categoryIcon(category.icone);
            const active = filters.categoria === category.slug;
            const count = employees.filter((employee) => employee.categoria === category.slug).length;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setFilters({ ...filters, categoria: active ? 'all' : category.slug })}
                className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-vessel-blue ring-2 ring-vessel-blue/15' : 'border-vessel-gray-100'}`}
              >
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-lg', categoryColor(category.cor).chip)}><Icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-vessel-deep">{category.nome}</span><span className="text-xs text-muted-foreground">{count} colaborador{count === 1 ? '' : 'es'}</span></span>
                {active && <Badge className="bg-vessel-blue text-white">Ativo</Badge>}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCategoryDialogOpen(true)}
            className="flex items-center gap-3 rounded-xl border-2 border-dashed border-vessel-gray-200 bg-white/60 p-4 text-left text-muted-foreground transition-all hover:border-vessel-blue hover:text-vessel-blue"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-vessel-gray-50"><Plus className="h-5 w-5" /></span>
            <span className="text-sm font-semibold">Nova categoria</span>
          </button>
        </div>
      </div>

      <CategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />

      <EmployeeFilters filters={filters} onFilterChange={setFilters} />

      <div className="hidden md:block">
        <EmployeeTable
          data={filteredData}
          onView={(id) => router.push(`/funcionarios/${id}`)}
          onEdit={(id) => router.push(`/funcionarios/${id}/editar`)}
          onDelete={(id) => setDeleteTarget(employees.find((employee) => employee.id === id))}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="space-y-4 md:hidden">
        {filteredData.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onView={(id) => router.push(`/funcionarios/${id}`)}
            onEdit={(id) => router.push(`/funcionarios/${id}/editar`)}
            onDelete={(id) => setDeleteTarget(employees.find((item) => item.id === id))}
            onStatusChange={handleStatusChange}
          />
        ))}
        {filteredData.length === 0 && <div className="rounded-lg border border-vessel-gray-100 bg-white p-8 text-center text-muted-foreground">Nenhum colaborador encontrado com os filtros atuais.</div>}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador?</AlertDialogTitle>
            <AlertDialogDescription>O cadastro de {deleteTarget?.nome} será removido da lista e dos relatórios. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">Excluir definitivamente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
