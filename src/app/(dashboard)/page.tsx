'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, MapPin, Users, XCircle } from 'lucide-react';

import { ChartBairros } from '@/components/dashboard/chart-bairros';
import { ChartRedes } from '@/components/dashboard/chart-redes';
import { RecentUpdates } from '@/components/dashboard/recent-updates';
import { StatCard } from '@/components/dashboard/stat-card';
import { loadEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function DashboardPage() {
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  useEffect(() => setEmployees(loadEmployees()), []);

  const metrics = useMemo(() => {
    const positivados = employees.filter((employee) => employee.status_redes?.[0]?.status === 'positivado').length;
    const negativados = employees.filter((employee) => employee.status_redes?.[0]?.status === 'negativado').length;
    const neutros = employees.length - positivados - negativados;
    const neighborhoods = new Map<string, number>();
    employees.forEach((employee) => {
      const neighborhood = employee.endereco?.bairro?.trim();
      if (neighborhood) neighborhoods.set(neighborhood, (neighborhoods.get(neighborhood) || 0) + 1);
    });
    return {
      positivados,
      negativados,
      neutros,
      neighborhoods: [...neighborhoods.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 10),
    };
  }, [employees]);

  const statusData = [
    { name: 'Positivados', value: metrics.positivados, color: '#10b981' },
    { name: 'Despositivados', value: metrics.negativados, color: '#ef4444' },
    { name: 'Neutros', value: metrics.neutros, color: '#94a3b8' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-8">
      <div><h1 className="text-3xl font-bold tracking-tight text-vessel-deep">Visão Geral</h1><p className="mt-1 text-muted-foreground">Acompanhe os colaboradores e os principais indicadores da gestão.</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Colaboradores" value={employees.length} icon={Users} color="blue" />
        <StatCard title="Positivados" value={metrics.positivados} icon={CheckCircle2} color="green" />
        <StatCard title="Despositivados" value={metrics.negativados} icon={XCircle} color="red" />
        <StatCard title="Neutros" value={metrics.neutros} icon={Clock} color="yellow" />
        <StatCard title="Bairros" value={metrics.neighborhoods.length} icon={MapPin} color="cyan" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5"><ChartBairros data={metrics.neighborhoods} /><ChartRedes data={statusData} /></div>
      <div className="grid grid-cols-1 gap-4"><RecentUpdates /></div>
    </div>
  );
}
