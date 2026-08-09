'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Cloud, Edit2, HardDrive, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type UserPermission = 'Administrador' | 'Operador' | 'Visualizador';

interface StoredUser {
  id: string;
  nome: string;
  email: string;
  permissao: UserPermission;
  ativo: boolean;
  criadoEm: string;
}

interface UserFormState {
  nome: string;
  email: string;
  senha: string;
  permissao: UserPermission;
  ativo: boolean;
}

const STORAGE_KEY = 'vessel:usuarios:v1';

const DEFAULT_USERS: StoredUser[] = [
  { id: '1', nome: 'Admin User', email: 'admin@vessel.com', permissao: 'Administrador', ativo: true, criadoEm: '01/08/2026' },
  { id: '2', nome: 'Operador User', email: 'operador@vessel.com', permissao: 'Operador', ativo: true, criadoEm: '02/08/2026' },
  { id: '3', nome: 'Viewer User', email: 'viewer@vessel.com', permissao: 'Visualizador', ativo: false, criadoEm: '05/08/2026' },
];

const EMPTY_FORM: UserFormState = {
  nome: '',
  email: '',
  senha: '',
  permissao: 'Visualizador',
  ativo: true,
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [storageMode, setStorageMode] = useState<'local' | 'supabase'>('local');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/usuarios', { cache: 'no-store' });
        if (response.ok) {
          const payload = await response.json();
          setUsers(payload.users);
          setStorageMode('supabase');
          return;
        }

        if (response.status !== 503) {
          throw new Error('Não foi possível consultar os usuários do banco.');
        }

        const saved = window.localStorage.getItem(STORAGE_KEY);
        const initialUsers = saved ? JSON.parse(saved) as StoredUser[] : DEFAULT_USERS;
        setUsers(initialUsers);
        setStorageMode('local');
        if (!saved) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      } catch (error) {
        setUsers(DEFAULT_USERS);
        setStorageMode('local');
        toast.error(error instanceof Error ? error.message : 'Não foi possível carregar os usuários.');
      } finally {
        setIsHydrated(true);
      }
    };

    loadUsers();
  }, []);

  const persistUsers = (nextUsers: StoredUser[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
    setUsers(nextUsers);
  };

  const getRoleBadge = (role: UserPermission) => {
    switch (role) {
      case 'Administrador': return <Badge className="border-none bg-blue-100 text-blue-800 hover:bg-blue-100">Administrador</Badge>;
      case 'Operador': return <Badge className="border-none bg-amber-100 text-amber-800 hover:bg-amber-100">Operador</Badge>;
      default: return <Badge className="border-none bg-gray-100 text-gray-800 hover:bg-gray-100">Visualizador</Badge>;
    }
  };

  const openNewDialog = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: StoredUser) => {
    setEditingUser(user);
    setForm({
      nome: user.nome,
      email: user.email,
      senha: '',
      permissao: user.permissao,
      ativo: user.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();

    if (!nome || !email || (!editingUser && form.senha.length < 6)) {
      toast.error('Informe nome, e-mail e uma senha com pelo menos 6 caracteres.');
      return;
    }

    const duplicatedEmail = users.some((user) => user.email.toLowerCase() === email && user.id !== editingUser?.id);
    if (duplicatedEmail) {
      toast.error('Já existe um usuário cadastrado com este e-mail.');
      return;
    }

    setIsSaving(true);

    try {
      if (storageMode === 'supabase') {
        const response = await fetch('/api/usuarios', {
          method: editingUser ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingUser
            ? { id: editingUser.id, nome, email, permissao: form.permissao, ativo: form.ativo }
            : { nome, email, senha: form.senha, permissao: form.permissao, ativo: form.ativo }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Não foi possível salvar o usuário.');

        setUsers(editingUser
          ? users.map((user) => user.id === editingUser.id ? payload.user : user)
          : [payload.user, ...users]);
      } else if (editingUser) {
        persistUsers(users.map((user) => user.id === editingUser.id
          ? { ...user, nome, email, permissao: form.permissao, ativo: form.ativo }
          : user));
      } else {
        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          nome,
          email,
          permissao: form.permissao,
          ativo: form.ativo,
          criadoEm: new Intl.DateTimeFormat('pt-BR').format(new Date()),
        };
        persistUsers([newUser, ...users]);
      }

      toast.success(editingUser ? 'Usuário atualizado e salvo.' : 'Usuário cadastrado e salvo.');

      setIsDialogOpen(false);
      setEditingUser(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o usuário.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id: string) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      if (storageMode === 'supabase') {
        const response = await fetch(`/api/usuarios?id=${encodeURIComponent(userToDelete)}`, { method: 'DELETE' });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || 'Não foi possível excluir o usuário.');
        setUsers(users.filter((user) => user.id !== userToDelete));
      } else {
        persistUsers(users.filter((user) => user.id !== userToDelete));
      }
      toast.success('Usuário excluído.');
      setIsConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir o usuário.');
    }
  };

  const getInitials = (name: string) => name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Usuários</h1>
          <p className="text-gray-500">Gerencie os acessos ao sistema</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} className="bg-vessel-blue text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Nome completo" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="email@exemplo.com" />
              </div>
              {!editingUser && (
                <div className="grid gap-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input id="senha" type="password" value={form.senha} onChange={(event) => setForm({ ...form, senha: event.target.value })} placeholder="Mínimo de 6 caracteres" />
                  <p className="text-xs text-muted-foreground">A senha não é armazenada localmente. A autenticação será ativada junto com o banco hospedado.</p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="permissao">Permissão</Label>
                <Select value={form.permissao} onValueChange={(value: UserPermission) => setForm({ ...form, permissao: value })}>
                  <SelectTrigger id="permissao">
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                    <SelectItem value="Operador">Operador</SelectItem>
                    <SelectItem value="Visualizador">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="ativo" className="cursor-pointer">Usuário Ativo</Label>
                <Switch id="ativo" checked={form.ativo} onCheckedChange={(ativo) => setForm({ ...form, ativo })} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-vessel-blue text-white hover:bg-blue-700" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingUser ? 'Salvar alterações' : 'Cadastrar usuário'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${storageMode === 'supabase' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
        {storageMode === 'supabase' ? <Cloud className="h-5 w-5 shrink-0" /> : <HardDrive className="h-5 w-5 shrink-0" />}
        <span>
          {storageMode === 'supabase'
            ? 'Banco conectado: usuários e acessos são salvos no Supabase.'
            : 'Modo local: os usuários ficam salvos neste navegador até conectarmos o banco hospedado.'}
        </span>
      </div>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold">Usuário</TableHead>
                  <TableHead className="font-semibold">Permissão</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Criado em</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isHydrated ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">Nenhum usuário cadastrado.</TableCell>
                  </TableRow>
                ) : users.map((user) => (
                  <TableRow key={user.id} className="transition-colors hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 bg-vessel-blue/10">
                          <AvatarFallback className="text-xs font-semibold text-vessel-blue">{getInitials(user.nome)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.nome}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.permissao)}</TableCell>
                    <TableCell>
                      {user.ativo ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />Ativo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Inativo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{user.criadoEm}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-vessel-blue" onClick={() => openEditDialog(user)} aria-label={`Editar ${user.nome}`}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => confirmDelete(user.id)} aria-label={`Excluir ${user.nome}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="h-5 w-5" />Excluir Usuário</DialogTitle>
          </DialogHeader>
          <div className="py-4"><p className="text-gray-600">Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.</p></div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
