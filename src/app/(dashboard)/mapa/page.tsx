'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, MapPin, Search, UserRound } from 'lucide-react';

import { StatusBadge } from '@/components/funcionarios/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories } from '@/hooks/use-categories';
import { employeeAddress, fetchEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function MapaPage() {
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const { labelOf } = useCategories();

  useEffect(() => {
    void fetchEmployees().then((loaded) => {
      setEmployees(loaded);
      setSelectedId(loaded[0]?.id || '');
    });
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('pt-BR');
    if (!query) return employees;
    return employees.filter((employee) => employee.nome.toLocaleLowerCase('pt-BR').includes(query));
  }, [employees, search]);

  useEffect(() => {
    if (!filteredEmployees.some((employee) => employee.id === selectedId)) {
      setSelectedId(filteredEmployees[0]?.id || '');
    }
  }, [filteredEmployees, selectedId]);

  const selectedEmployee = filteredEmployees.find((employee) => employee.id === selectedId);
  const selectedAddress = selectedEmployee ? employeeAddress(selectedEmployee) : '';
  const mapQuery = selectedAddress || 'Boa Vista, Roraima';
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const mapExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#eef3f9] xl:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white p-5 xl:w-[370px] xl:border-b-0 xl:border-r">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vessel-deep">Mapa da Equipe</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pesquise o colaborador e visualize o endereço cadastrado no Google Maps.</p>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            aria-label="Pesquisar colaborador no mapa"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Digite o nome do colaborador"
            className="h-11 bg-slate-50 pl-10"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-vessel-deep">Resultados</p>
          <Badge variant="outline">{filteredEmployees.length}</Badge>
        </div>

        <div className="mt-3 max-h-[calc(100vh-245px)] space-y-2 overflow-y-auto pr-1">
          {filteredEmployees.map((employee) => {
            const address = employeeAddress(employee);
            const selected = employee.id === selectedId;
            const initials = employee.nome.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
            return (
              <button
                key={employee.id}
                type="button"
                onClick={() => setSelectedId(employee.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${selected ? 'border-vessel-blue bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-11 w-11 shrink-0"><AvatarImage src={employee.foto_url} alt={employee.nome} /><AvatarFallback className="bg-blue-100 text-xs font-bold text-vessel-blue">{initials}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-vessel-deep">{employee.nome}</p>
                    <p className="truncate text-sm text-muted-foreground">{employee.cargo} • {labelOf(employee.categoria)}</p>
                    <p className={`mt-1 flex items-start gap-1 text-xs ${address ? 'text-slate-500' : 'font-medium text-amber-600'}`}><MapPin className="mt-0.5 h-3 w-3 shrink-0" />{address || 'Endereço não cadastrado'}</p>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredEmployees.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center text-muted-foreground">
              <UserRound className="mx-auto mb-3 h-9 w-9 opacity-35" />
              <p className="font-medium text-slate-600">Nenhum colaborador encontrado</p>
              <p className="mt-1 text-sm">Cadastre um colaborador ou confira o nome pesquisado.</p>
            </div>
          )}
        </div>
      </aside>

      <section className="relative min-h-[560px] flex-1 p-4 sm:p-6">
        <div className="relative h-full min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <iframe
            key={mapQuery}
            title={selectedEmployee ? `Endereço de ${selectedEmployee.nome} no Google Maps` : 'Google Maps de Boa Vista'}
            src={mapEmbedUrl}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {selectedEmployee && (
            <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-[420px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-vessel-deep">{selectedEmployee.nome}</p>
                  <p className="mt-1 text-sm text-slate-500">{selectedAddress || 'Este colaborador ainda não possui endereço cadastrado.'}</p>
                </div>
                <StatusBadge status={selectedEmployee.status_redes?.[0]?.status || 'nao_avaliado'} />
              </div>
              <Button variant="outline" size="sm" asChild className="mt-3 border-blue-100 text-vessel-blue">
                <a href={mapExternalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Abrir no Google Maps</a>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
