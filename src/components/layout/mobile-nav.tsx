'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  MapPin,
  Building2,
  Share2,
  FileText,
  BarChart3,
  UserCog,
  Settings,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Colaboradores', href: '/funcionarios', icon: Users },
  { name: 'Mapa da Equipe', href: '/mapa', icon: MapPin },
  { name: 'Bairros', href: '/bairros', icon: Building2 },
  { name: 'Redes Sociais', href: '/redes-sociais', icon: Share2 },
  { name: 'Publicações', href: '/publicacoes', icon: FileText },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Usuários', href: '/usuarios', icon: UserCog },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-gradient-to-b from-[#001233] to-[#001A4D] border-r-0 text-white flex flex-col">
        <SheetHeader className="p-6 text-left border-b border-white/10 shrink-0">
          <SheetTitle className="text-white flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <span className="text-xl font-bold text-[#00D4FF]">V</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider">{APP_NAME || 'VESSEL'}</span>
              <span className="text-[10px] uppercase tracking-widest text-[#00D4FF] font-normal">
                {APP_SUBTITLE || 'Gestão de Colaboradores'}
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 transition-all relative',
                    isActive
                      ? 'bg-[#0057FF]/20 text-[#00D4FF]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-md bg-[#00D4FF]" />
                  )}
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-[#00D4FF]' : 'text-slate-400')} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
