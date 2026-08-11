'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Map as MapIcon, Search, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { fetchEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function BairrosPage() {
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { void fetchEmployees().then(setEmployees); }, []);

  const neighborhoods = useMemo(() => {
    const grouped = new Map<string, FuncionarioCompleto[]>();
    employees.forEach((employee) => {
      const neighborhood = employee.endereco?.bairro?.trim();
      if (neighborhood) grouped.set(neighborhood, [...(grouped.get(neighborhood) || []), employee]);
    });
    return [...grouped.entries()].map(([nome, residents]) => ({
      nome,
      total: residents.length,
      positivados: residents.filter((employee) => employee.status_redes?.[0]?.status === 'positivado').length,
      negativados: residents.filter((employee) => employee.status_redes?.[0]?.status === 'negativado').length,
      neutros: residents.filter((employee) => !employee.status_redes?.[0]?.status || employee.status_redes?.[0]?.status === 'nao_avaliado').length,
      redeNaoEncontrada: residents.filter((employee) => employee.status_redes?.[0]?.status === 'rede_nao_encontrada').length,
    })).filter((neighborhood) => neighborhood.nome.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => b.total - a.total);
  }, [employees, searchTerm]);

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-3xl font-bold tracking-tight text-vessel-deep">Bairros</h1><p className="text-muted-foreground">Controle de colaboradores por bairro.</p></div>
      <div className="flex w-full max-w-sm"><div className="relative w-full"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar bairro..." className="pl-8" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {neighborhoods.map((neighborhood) => {
          const positivePercentage = neighborhood.total ? Math.round((neighborhood.positivados / neighborhood.total) * 100) : 0;
          return (
            <Card key={neighborhood.nome} className="transition-shadow hover:shadow-lg">
              <CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-xl text-vessel-deep">{neighborhood.nome}<Users className="h-5 w-5 text-muted-foreground" /></CardTitle><CardDescription>{neighborhood.total} colaboradores registrados</CardDescription></CardHeader>
              <CardContent><div className="space-y-4">
                <div className="grid grid-cols-4 gap-2 text-sm"><div className="flex flex-col"><span className="font-medium text-vessel-green">{neighborhood.positivados}</span><span className="text-xs text-muted-foreground">Positivados</span></div><div className="flex flex-col text-center"><span className="font-medium text-destructive">{neighborhood.negativados}</span><span className="text-xs text-muted-foreground">Despositivados</span></div><div className="flex flex-col text-center"><span className="font-medium text-amber-600">{neighborhood.neutros}</span><span className="text-xs text-muted-foreground">Parciais</span></div><div className="flex flex-col text-right"><span className="font-medium text-violet-600">{neighborhood.redeNaoEncontrada}</span><span className="text-xs text-muted-foreground">Sem rede</span></div></div>
                <div className="space-y-1"><div className="flex justify-between text-xs text-muted-foreground"><span>Positivação</span><span>{positivePercentage}%</span></div><Progress value={positivePercentage} className="h-2" /></div>
                <div className="flex gap-2 pt-2"><Button variant="outline" className="w-full text-xs" asChild><Link href={`/funcionarios?bairro=${encodeURIComponent(neighborhood.nome)}`}>Ver Lista</Link></Button><Button className="w-full bg-vessel-blue text-xs hover:bg-vessel-blue/90" asChild><Link href={`/mapa?bairro=${encodeURIComponent(neighborhood.nome)}`}><MapIcon className="mr-2 h-3.5 w-3.5" />Ver no Mapa</Link></Button></div>
              </div></CardContent>
            </Card>
          );
        })}
      </div>
      {neighborhoods.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-muted-foreground">Nenhum bairro possui colaboradores cadastrados.</div>}
    </div>
  );
}
