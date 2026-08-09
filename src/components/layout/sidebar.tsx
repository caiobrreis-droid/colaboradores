'use client';

import React from 'react';
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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
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

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = React.useState(false);

  const isCollapsed = collapsed && !isHovered;

  return (
    <aside
      className={cn(
        'group relative hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out z-20',
        'bg-gradient-to-b from-[#001233] to-[#001A4D] border-r border-white/10 text-white',
        isCollapsed ? 'w-[80px]' : 'w-[280px]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-8 z-30 flex h-6 w-6 items-center justify-center rounded-full bg-[#0057FF] text-white shadow-md hover:bg-[#00D4FF] hover:text-[#001233] transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Top Section / Logo */}
      <div className="flex h-20 items-center justify-center px-4 border-b border-white/10 shrink-0">
        <Link href="/" className="flex items-center gap-3 overflow-hidden w-full px-2">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 overflow-hidden">
            <span className="text-xl font-bold text-[#00D4FF]">V</span>
            {/* If there's an actual image, we can use it, but keeping the stylized V for collapsed state or if image fails */}
            <Image
              src="/logo-vessel.png"
              alt="Logo"
              fill
              sizes="40px"
              className="object-contain opacity-0 transition-opacity"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          <div
            className={cn(
              'flex flex-col whitespace-nowrap transition-all duration-300',
              isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
            )}
          >
            <span className="text-lg font-bold tracking-wider text-white">
              {APP_NAME || 'VESSEL'}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#00D4FF]">
              {APP_SUBTITLE || 'Gestão de Colaboradores'}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group/item flex items-center gap-3 rounded-lg px-3 py-3 transition-all duration-200 relative',
                isActive
                  ? 'bg-[#0057FF]/20 text-[#00D4FF]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )}
              title={isCollapsed ? item.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-md bg-[#00D4FF]" />
              )}
              <item.icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover/item:scale-110', isActive ? 'text-[#00D4FF]' : 'text-slate-400 group-hover/item:text-white')} />
              <span
                className={cn(
                  'whitespace-nowrap font-medium transition-all duration-300',
                  isCollapsed ? 'w-0 opacity-0 hidden' : 'w-full opacity-100'
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section / User */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : '')}>
          <Avatar className="h-10 w-10 border-2 border-white/10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-[#0057FF] text-white">U</AvatarFallback>
          </Avatar>

          <div
            className={cn(
              'flex flex-col whitespace-nowrap overflow-hidden transition-all duration-300',
              isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'
            )}
          >
            <span className="text-sm font-medium text-white">Usuário</span>
            <Badge variant="secondary" className="mt-0.5 h-4 w-fit bg-[#00C853]/20 text-[10px] text-[#00C853] hover:bg-[#00C853]/30">
              Admin
            </Badge>
          </div>

          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
              <LogOut size={16} />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
