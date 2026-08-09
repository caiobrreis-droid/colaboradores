'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Command } from 'cmdk';
import { Instagram, MapPin, Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { fetchEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) void fetchEmployees().then(setEmployees);
  }, [open]);

  const neighborhoods = useMemo(() => [...new Set(employees.map((employee) => employee.endereco?.bairro).filter(Boolean) as string[])], [employees]);
  const instagramAccounts = useMemo(() => employees.flatMap((employee) => {
    const instagram = employee.redes_sociais?.find((network) => String(network.rede_social || network.plataforma || '').toLowerCase() === 'instagram');
    const account = instagram?.username || instagram?.handle;
    return account ? [{ employee, account }] : [];
  }), [employees]);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-2 rounded-md border border-transparent bg-gray-100 px-3 py-2 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-200 md:w-64">
        <Search className="h-4 w-4" /><span className="flex-1 text-left">Buscar no sistema...</span><kbd className="hidden h-5 items-center gap-1 rounded border border-gray-300 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500 sm:inline-flex"><span className="text-xs">⌘</span>K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden border-0 bg-transparent p-0 shadow-2xl sm:max-w-[600px]">
          <Command className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500">
            <div className="flex items-center border-b border-gray-200 px-3"><Search className="mr-2 h-5 w-5 shrink-0 text-gray-400" /><Command.Input className="flex h-12 w-full border-0 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400" placeholder="Busque por colaboradores, bairros ou @instagram..." /></div>
            <Command.List className="max-h-[340px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-8 text-center text-sm text-gray-500">Nenhum resultado encontrado.</Command.Empty>

              {employees.length > 0 && <Command.Group heading="Colaboradores" className="py-2">
                {employees.map((employee) => <SearchItem key={`employee-${employee.id}`} icon={<User className="h-4 w-4 text-blue-500" />} title={employee.nome} subtitle={employee.cargo} onSelect={() => runCommand(() => router.push(`/funcionarios/${employee.id}`))} />)}
              </Command.Group>}

              {neighborhoods.length > 0 && <Command.Group heading="Bairros" className="py-2">
                {neighborhoods.map((neighborhood) => <SearchItem key={`neighborhood-${neighborhood}`} icon={<MapPin className="h-4 w-4 text-green-500" />} title={neighborhood} subtitle="Boa Vista" onSelect={() => runCommand(() => router.push(`/mapa?bairro=${encodeURIComponent(neighborhood)}`))} />)}
              </Command.Group>}

              {instagramAccounts.length > 0 && <Command.Group heading="Instagram" className="py-2">
                {instagramAccounts.map(({ employee, account }) => <SearchItem key={`instagram-${employee.id}`} icon={<Instagram className="h-4 w-4 text-pink-500" />} title={account} subtitle={employee.nome} onSelect={() => runCommand(() => router.push(`/funcionarios/${employee.id}`))} />)}
              </Command.Group>}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchItem({ icon, title, subtitle, onSelect }: { icon: React.ReactNode; title: string; subtitle: string; onSelect: () => void }) {
  return <Command.Item value={`${title} ${subtitle}`} onSelect={onSelect} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-3 text-sm transition-colors aria-selected:bg-gray-100 aria-selected:text-gray-900">{icon}<div className="flex flex-col"><span>{title}</span><span className="text-xs text-gray-500">{subtitle}</span></div></Command.Item>;
}
