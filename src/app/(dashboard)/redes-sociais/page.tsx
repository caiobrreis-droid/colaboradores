'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Facebook, Instagram, MinusCircle, Search, Share2, Video, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { StatusBadge } from '@/components/funcionarios/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { changeEmployeeNetworkStatus, fetchEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

function networkFor(employee: FuncionarioCompleto, name: string) {
  return employee.redes_sociais?.find((network) => String(network.rede_social || network.plataforma || '').toLowerCase() === name.toLowerCase());
}

export default function RedesSociaisPage() {
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { void fetchEmployees().then(setEmployees); }, []);

  const rows = useMemo(() => employees.map((employee) => ({
    employee,
    instagram: networkFor(employee, 'instagram'),
    facebook: networkFor(employee, 'facebook'),
    tiktok: networkFor(employee, 'tiktok'),
  })).filter(({ employee }) => employee.nome.toLowerCase().includes(searchTerm.toLowerCase())), [employees, searchTerm]);

  const totals = {
    instagram: employees.filter((employee) => networkFor(employee, 'instagram')).length,
    facebook: employees.filter((employee) => networkFor(employee, 'facebook')).length,
    tiktok: employees.filter((employee) => networkFor(employee, 'tiktok')).length,
    none: employees.filter((employee) => !employee.redes_sociais?.length).length,
  };

  const updateStatus = async (employee: FuncionarioCompleto, status: 'positivado' | 'negativado' | 'nao_avaliado') => {
    try {
      const updated = await changeEmployeeNetworkStatus(employee.id, status);
      if (updated) setEmployees((current) => current.map((item) => item.id === updated.id ? updated : item));
      const labels = { positivado: 'positivado', negativado: 'despositivado', nao_avaliado: 'neutro' };
      toast.success(`${employee.nome} ficou ${labels[status]}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível alterar a situação.');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div><h1 className="text-3xl font-bold tracking-tight text-vessel-deep">Redes Sociais</h1><p className="text-muted-foreground">Visão geral das redes sociais e situação das postagens da equipe.</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric title="Com Instagram" value={totals.instagram} icon={<Instagram className="h-4 w-4 text-pink-500" />} />
        <Metric title="Com Facebook" value={totals.facebook} icon={<Facebook className="h-4 w-4 text-blue-600" />} />
        <Metric title="Com TikTok" value={totals.tiktok} icon={<Video className="h-4 w-4 text-black" />} />
        <Metric title="Sem Redes" value={totals.none} icon={<Share2 className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <Card>
        <CardHeader className="pb-3"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><CardTitle>Relação de Contas</CardTitle><div className="relative w-full sm:w-64"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar colaborador..." className="pl-8" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div></div></CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Instagram</TableHead><TableHead>Facebook</TableHead><TableHead>TikTok</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Alterar</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(({ employee, instagram, facebook, tiktok }) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium"><Link href={`/funcionarios/${employee.id}`} className="hover:underline">{employee.nome}</Link></TableCell>
                    <NetworkCell network={instagram} />
                    <NetworkCell network={facebook} />
                    <NetworkCell network={tiktok} />
                    <TableCell><StatusBadge status={employee.status_redes?.[0]?.status || 'nao_avaliado'} /></TableCell>
                    <TableCell><div className="flex justify-end gap-1"><Button title="Positivar" variant="ghost" size="icon" onClick={() => updateStatus(employee, 'positivado')} className="text-emerald-600 hover:bg-emerald-50"><CheckCircle2 className="h-4 w-4" /></Button><Button title="Despositivar" variant="ghost" size="icon" onClick={() => updateStatus(employee, 'negativado')} className="text-red-600 hover:bg-red-50"><XCircle className="h-4 w-4" /></Button><Button title="Deixar neutro" variant="ghost" size="icon" onClick={() => updateStatus(employee, 'nao_avaliado')} className="text-slate-500 hover:bg-slate-100"><MinusCircle className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">Nenhum colaborador cadastrado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">{title}</CardTitle>{icon}</CardHeader><CardContent><div className="text-2xl font-bold">{value}</div></CardContent></Card>;
}

function NetworkCell({ network }: { network?: any }) {
  if (!network) return <TableCell><span className="text-sm text-muted-foreground">—</span></TableCell>;
  const label = network.username || network.handle || network.url;
  return <TableCell><a href={network.url || '#'} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{label}</a></TableCell>;
}
