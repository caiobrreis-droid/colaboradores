'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Building2, House, Landmark, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
import { CATEGORIA_COLABORADOR_LABELS } from '@/lib/constants';
import { deleteEmployee, loadEmployees, setEmployeeNetworkStatus } from '@/lib/employee-storage';
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

  useEffect(() => setEmployees(loadEmployees()), []);

  const filteredData = useMemo(() => employees.filter((employee) => {
    if (filters.search && !employee.nome.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.categoria !== 'all' && employee.categoria !== filters.categoria) return false;
    if (filters.bairro !== 'all' && employee.endereco?.bairro !== filters.bairro) return false;
    if (filters.cargo !== 'all' && employee.cargo !== filters.cargo) return false;
    if (filters.situacao !== 'all') {
      const situation = employee.ativo === false ? 'inativo' : 'ativo';
      if (situation !== filters.situacao) return false;
    }
    if (filters.positivacao !== 'all' && employee.status_redes?.[0]?.status !== filters.positivacao) return false;
    if (filters.instagram !== 'all') {
      const hasInstagram = employee.redes_sociais?.some((network) =>
        String(network.rede_social || network.plataforma || '').toLowerCase() === 'instagram' && (network.username || network.handle || network.url),
      );
      if (filters.instagram === 'com' && !hasInstagram) return false;
      if (filters.instagram === 'sem' && hasInstagram) return false;
    }
    return true;
  }), [employees, filters]);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setEmployees(deleteEmployee(deleteTarget.id));
    toast.success(`${deleteTarget.nome} foi excluído do sistema.`);
    setDeleteTarget(undefined);
  };

  const handleStatusChange = (id: string, status: 'positivado' | 'negativado' | 'nao_avaliado') => {
    const updated = setEmployeeNetworkStatus(id, status);
    setEmployees(loadEmployees());
    const labels = { positivado: 'positivado', negativado: 'despositivado', nao_avaliado: 'neutro' };
    toast.success(`${updated?.nome || 'Colaborador'} ficou ${labels[status]}.`);
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          { value: 'gabinete', icon: Landmark, color: 'text-blue-700 bg-blue-50' },
          { value: 'casa', icon: House, color: 'text-violet-700 bg-violet-50' },
          { value: 'vice_presidencia', icon: BriefcaseBusiness, color: 'text-amber-700 bg-amber-50' },
          { value: 'pmbv', icon: Building2, color: 'text-emerald-700 bg-emerald-50' },
        ] as const).map(({ value, icon: Icon, color }) => {
          const active = filters.categoria === value;
          const count = employees.filter((employee) => employee.categoria === value).length;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilters({ ...filters, categoria: active ? 'all' : value })}
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? 'border-vessel-blue ring-2 ring-vessel-blue/15' : 'border-vessel-gray-100'}`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-vessel-deep">{CATEGORIA_COLABORADOR_LABELS[value]}</span><span className="text-xs text-muted-foreground">{count} colaboradores</span></span>
              {active && <Badge className="bg-vessel-blue text-white">Ativo</Badge>}
            </button>
          );
        })}
      </div>

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
