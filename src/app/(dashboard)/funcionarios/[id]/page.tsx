'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronLeft, Edit, ExternalLink, Facebook, History, Instagram, Link as LinkIcon, MapPin, MinusCircle, Printer, SearchX, Trash2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { StatusBadge } from '@/components/funcionarios/status-badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CATEGORIA_COLABORADOR_LABELS } from '@/lib/constants';
import { changeEmployeeNetworkStatus, employeeAddress, fetchEmployee, removeEmployeeRecord } from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function EmployeeProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [employee, setEmployee] = useState<FuncionarioCompleto>();
  const [loaded, setLoaded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    void fetchEmployee(id)
      .then(setEmployee)
      .finally(() => setLoaded(true));
  }, [id]);

  const address = useMemo(() => employee ? employeeAddress(employee) : '', [employee]);
  const mapEmbedUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : '';
  const mapExternalUrl = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '';

  if (!loaded) return <div className="p-6 text-muted-foreground">Carregando cadastro...</div>;
  if (!employee) {
    return (
      <div className="mx-auto max-w-xl p-10 text-center">
        <h1 className="text-xl font-semibold text-vessel-deep">Colaborador não encontrado</h1>
        <p className="mt-2 text-muted-foreground">Este cadastro pode ter sido excluído.</p>
        <Button className="mt-5" onClick={() => router.push('/funcionarios')}>Voltar para colaboradores</Button>
      </div>
    );
  }

  const initials = employee.nome.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const status = employee.status_redes?.[0]?.status || 'nao_avaliado';

  const confirmDelete = async () => {
    try {
      await removeEmployeeRecord(employee.id);
      toast.success(`${employee.nome} foi excluído do sistema.`);
      router.push('/funcionarios');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível excluir o colaborador.');
    }
  };

  const updateStatus = async (newStatus: 'positivado' | 'negativado' | 'nao_avaliado' | 'rede_nao_encontrada') => {
    try {
      const updated = await changeEmployeeNetworkStatus(employee.id, newStatus);
      if (updated) setEmployee(updated);
      const labels = { positivado: 'positivado', negativado: 'despositivado', nao_avaliado: 'parcial', rede_nao_encontrada: 'com a rede não encontrada' };
      toast.success(`${employee.nome} ficou ${labels[newStatus]}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível alterar a situação.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={() => router.push('/funcionarios')} className="mt-1"><ChevronLeft className="h-5 w-5" /></Button>
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={employee.foto_url} alt={employee.nome} />
            <AvatarFallback className="bg-vessel-gray-100 text-2xl font-bold text-vessel-blue">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-vessel-deep">{employee.nome}</h1>
            <p className="text-lg text-muted-foreground">{employee.cargo}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-700">{CATEGORIA_COLABORADOR_LABELS[employee.categoria]}</Badge>
              <Badge variant="outline" className={employee.ativo === false ? 'border-gray-200 bg-gray-50 text-gray-600' : 'border-green-200 bg-green-50 text-green-700'}>{employee.ativo === false ? 'Inativo' : 'Ativo'}</Badge>
              <StatusBadge status={status as any} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:ml-auto">
          <Button variant="outline" className="bg-white" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Imprimir</Button>
          <Button variant="outline" className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" />Excluir</Button>
          <Button className="bg-vessel-blue text-white hover:bg-vessel-blue/90" onClick={() => router.push(`/funcionarios/${employee.id}/editar`)}><Edit className="mr-2 h-4 w-4" />Editar</Button>
        </div>
      </div>

      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/80 to-white shadow-sm">
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-vessel-deep">Situação das postagens no Instagram</p>
            <p className="mt-1 text-sm text-muted-foreground">Marque o resultado das postagens, deixe como parcial quando a avaliação não estiver concluída ou sinalize quando a rede não for localizada.</p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant={status === 'positivado' ? 'default' : 'outline'} onClick={() => updateStatus('positivado')} className={status === 'positivado' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'}><CheckCircle2 className="mr-2 h-4 w-4" />Positivar</Button>
            <Button variant={status === 'negativado' ? 'default' : 'outline'} onClick={() => updateStatus('negativado')} className={status === 'negativado' ? 'bg-red-600 text-white hover:bg-red-700' : 'border-red-200 text-red-700 hover:bg-red-50'}><XCircle className="mr-2 h-4 w-4" />Despositivar</Button>
            <Button variant={status === 'nao_avaliado' ? 'default' : 'outline'} onClick={() => updateStatus('nao_avaliado')} className={status === 'nao_avaliado' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}><MinusCircle className="mr-2 h-4 w-4" />Parcial</Button>
            <Button variant={status === 'rede_nao_encontrada' ? 'default' : 'outline'} onClick={() => updateStatus('rede_nao_encontrada')} className={status === 'rede_nao_encontrada' ? 'bg-violet-600 text-white hover:bg-violet-700' : 'border-violet-200 text-violet-700 hover:bg-violet-50'}><SearchX className="mr-2 h-4 w-4" />Rede não encontrada</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="flex w-full justify-start overflow-x-auto rounded-lg border border-vessel-gray-100 bg-white p-1 md:w-auto">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="endereco">Endereço e Mapa</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="info">
            <Card className="border-vessel-gray-100 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Dados Pessoais</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Info label="CPF" value={employee.cpf} />
                <Info label="Data de Nascimento" value={formatDate(employee.dataNascimento)} />
                <Info label="E-mail" value={employee.email} />
                <Info label="Telefone" value={employee.telefone} />
                <Info label="WhatsApp" value={employee.whatsapp} />
                <Info label="Categoria" value={CATEGORIA_COLABORADOR_LABELS[employee.categoria]} />
                <Info label="Indicação" value={employee.indicacao} />
                <Info label="Função" value={employee.funcao} />
                <Info label="Matrícula" value={employee.matricula} />
                <Info label="Data de Entrada" value={formatDate(employee.dataEntrada)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endereco">
            <Card className="border-vessel-gray-100 shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-5">
                    <Info label="Rua/Avenida" value={[employee.endereco?.logradouro, employee.endereco?.numero].filter(Boolean).join(', ')} />
                    <Info label="Complemento" value={employee.endereco?.complemento} />
                    <Info label="Bairro" value={employee.endereco?.bairro} />
                    <Info label="Cidade/UF" value={[employee.endereco?.cidade, employee.endereco?.estado].filter(Boolean).join(' - ')} />
                    <Info label="CEP" value={employee.endereco?.cep} />
                    <Info label="Ponto de Referência" value={employee.endereco?.referencia} />
                    {mapExternalUrl && (
                      <Button variant="outline" asChild className="border-blue-100 text-vessel-blue">
                        <a href={mapExternalUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Abrir no Google Maps</a>
                      </Button>
                    )}
                  </div>
                  {mapEmbedUrl && (employee.endereco?.logradouro || employee.endereco?.bairro) ? (
                    <iframe
                      title={`Endereço de ${employee.nome} no Google Maps`}
                      src={mapEmbedUrl}
                      className="h-[360px] w-full rounded-xl border border-vessel-gray-100"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="flex h-[360px] items-center justify-center rounded-xl border border-vessel-gray-100 bg-vessel-gray-50 text-center text-muted-foreground">
                      <div><MapPin className="mx-auto mb-2 h-9 w-9 opacity-40" /><p>Cadastre a rua ou o bairro para exibir o mapa.</p></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redes">
            <Card className="border-vessel-gray-100 shadow-sm">
              <CardContent className="space-y-4 pt-6">
                {employee.redes_sociais?.length ? employee.redes_sociais.map((network, index) => {
                  const name = network.rede_social || network.plataforma || 'Rede social';
                  const Icon = String(name).toLowerCase() === 'instagram' ? Instagram : String(name).toLowerCase() === 'facebook' ? Facebook : LinkIcon;
                  return (
                    <div key={network.id || index} className="flex items-center justify-between gap-4 rounded-lg border border-vessel-gray-100 bg-vessel-gray-50/50 p-4">
                      <div className="flex items-center gap-4"><div className="rounded-md bg-white p-2 shadow-sm"><Icon className="h-6 w-6 text-vessel-blue" /></div><div><p className="font-medium text-vessel-deep">{name}</p><p className="text-sm text-muted-foreground">{network.username || network.handle || network.url}</p></div></div>
                      {network.url && <Button variant="outline" size="sm" asChild><a href={network.url} target="_blank" rel="noopener noreferrer">Abrir<LinkIcon className="ml-2 h-3 w-3" /></a></Button>}
                    </div>
                  );
                }) : <p className="py-10 text-center text-muted-foreground">Nenhuma rede social cadastrada.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card className="border-vessel-gray-100 shadow-sm">
              <CardHeader><CardTitle className="text-lg">Histórico de Alterações</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 rounded-lg border border-vessel-gray-100 p-4"><div className="rounded-full bg-blue-50 p-2 text-vessel-blue"><History className="h-4 w-4" /></div><div><p className="font-medium text-vessel-deep">Cadastro atualizado</p><p className="text-sm text-muted-foreground">Última alteração em {new Date(employee.updated_at).toLocaleString('pt-BR')}.</p></div></div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir colaborador?</AlertDialogTitle><AlertDialogDescription>O cadastro de {employee.nome} será removido da lista e dos relatórios. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">Excluir definitivamente</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div><p className="text-sm text-muted-foreground">{label}</p><p className="font-medium text-vessel-deep">{value || 'Não informado'}</p></div>;
}

function formatDate(value?: string) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}
