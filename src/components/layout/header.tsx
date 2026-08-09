'use client';

import React from 'react';
import { Menu, Search, Bell, Settings, LogOut, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const routeName = pathname.split('/')[1] || '';
  const routeTitles: Record<string, string> = {
    funcionarios: 'Colaboradores',
    mapa: 'Mapa da Equipe',
    bairros: 'Bairros',
    'redes-sociais': 'Redes Sociais',
    publicacoes: 'Publicações',
    relatorios: 'Relatórios',
    usuarios: 'Usuários',
    configuracoes: 'Configurações',
  };
  const title = pathname === '/' ? 'Dashboard' : routeTitles[routeName] || 'VESSEL';

  return (
    <header className="sticky top-0 z-10 flex h-20 shrink-0 items-center gap-x-4 border-b bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="-m-2.5 p-2.5 text-gray-700 md:hidden"
        onClick={onMenuToggle}
      >
        <span className="sr-only">Abrir menu lateral</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-gray-200 md:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        {/* Page Title */}
        <div className="hidden sm:block flex-shrink-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#001233]">{title}</h1>
        </div>

        <div className="flex flex-1 items-center justify-center sm:justify-start px-2 lg:px-6">
          <div className="w-full max-w-md relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <Input
              type="search"
              name="search"
              id="search"
              className="block w-full rounded-full border-0 py-1.5 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#0057FF] sm:text-sm sm:leading-6 bg-gray-50 transition-all hover:bg-gray-100 focus:bg-white"
              placeholder="Pesquisar colaboradores, bairros, Instagram..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-500">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 relative">
            <span className="sr-only">Ver notificações</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0057FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0057FF]"></span>
            </span>
          </Button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="-m-1.5 flex items-center p-1.5 gap-x-3 rounded-full hover:bg-gray-50">
                <span className="sr-only">Abrir menu do usuário</span>
                <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#001233] text-white">U</AvatarFallback>
                </Avatar>
                <span className="hidden lg:flex lg:items-center">
                  <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                    Usuário
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-[#001233]">Usuário Demo</p>
                  <p className="text-xs leading-none text-muted-foreground">usuario@vessel.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-gray-700">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
