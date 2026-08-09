'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Shield, Settings2, Upload, Database, HardDriveDownload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { loadEmployees } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function ConfiguracoesPage() {
  const timestamp = new Date().toLocaleString('pt-BR');
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  useEffect(() => setEmployees(loadEmployees()), []);
  const neighborhoodCount = useMemo(() => new Set(employees.map((employee) => employee.endereco?.bairro).filter(Boolean)).size, [employees]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações</h1>
        <p className="text-gray-500">Gerencie suas preferências e configurações do sistema</p>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-gray-100 p-1 rounded-lg mb-6">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="sistema" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2">
            <Settings2 className="w-4 h-4 mr-2" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e foto de perfil.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  <AvatarFallback className="text-2xl bg-vessel-blue text-white font-semibold">AD</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar Foto
                  </Button>
                  <p className="text-xs text-gray-500">JPG, GIF ou PNG. Máximo de 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input id="nome" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@vessel.com" readOnly className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nível de Acesso</Label>
                  <div className="mt-1">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none px-3 py-1">Administrador</Badge>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-vessel-blue hover:bg-blue-700 text-white">
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <div className="pt-4">
                <Button className="bg-vessel-blue hover:bg-blue-700 text-white w-full md:w-auto">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Informações e Dados do Sistema</CardTitle>
              <CardDescription>Visão geral e manutenção do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Versão</p>
                  <p className="font-semibold text-lg text-gray-900">1.0.0</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Colaboradores</p>
                  <p className="font-semibold text-lg text-gray-900">{employees.length}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Bairros</p>
                  <p className="font-semibold text-lg text-gray-900">{neighborhoodCount}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Última Atualização</p>
                  <p className="font-semibold text-sm text-gray-900">{timestamp.split(' ')[0]}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-md font-medium">Ações de Manutenção</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    Limpar Cache Local
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <HardDriveDownload className="w-4 h-4 text-vessel-blue" />
                    Exportar Todos os Dados (Backup)
                  </Button>
                </div>
                <p className="text-xs text-gray-500 max-w-2xl">
                  A limpeza de cache pode resolver problemas de exibição, mas você precisará fazer login novamente.
                  O backup exporta um arquivo JSON com todos os dados do sistema para segurança.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
