'use client';

import { useMemo, useState } from 'react';
import { MapPin, Save, Upload, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CARGO_OPTIONS, CATEGORIA_COLABORADOR_OPTIONS } from '@/lib/constants';
import type { EmployeeFormValues } from '@/lib/employee-storage';

interface EmployeeFormProps {
  initialValues: EmployeeFormValues;
  submitLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: EmployeeFormValues) => void | Promise<void>;
}

async function resizeProfilePhoto(file: File) {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = source;
  });

  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext('2d');
  if (!context) return source;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

export function EmployeeForm({ initialValues, submitLabel, isSubmitting = false, onCancel, onSubmit }: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(initialValues);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [photoName, setPhotoName] = useState('');

  const setField = <K extends keyof EmployeeFormValues>(field: K, value: EmployeeFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const mapAddress = useMemo(() => {
    return [
      [values.logradouro, values.numero].filter(Boolean).join(', '),
      values.bairro,
      [values.cidade, values.estado].filter(Boolean).join(' - '),
      values.cep,
    ].filter(Boolean).join(', ');
  }, [values.logradouro, values.numero, values.bairro, values.cidade, values.estado, values.cep]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A foto deve ter no máximo 5 MB.');
      event.target.value = '';
      return;
    }
    try {
      setField('foto_url', await resizeProfilePhoto(file));
      setPhotoName(file.name);
    } catch {
      toast.error('Não foi possível processar essa foto.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!values.nome.trim() || !values.cargo || !values.categoria) {
      setActiveTab('pessoais');
      toast.error('Preencha nome, cargo e categoria.');
      return;
    }
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 rounded-lg border border-vessel-gray-100 bg-white p-1">
          <TabsTrigger value="pessoais">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="endereco">Endereço</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="pessoais">
          <Card className="border-vessel-gray-100 shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                    <AvatarImage src={values.foto_url} alt="Foto do colaborador" />
                    <AvatarFallback className="bg-white text-vessel-blue"><UserRound className="h-9 w-9" /></AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center sm:text-left">
                    <Label htmlFor="foto-perfil" className="text-base font-semibold text-vessel-deep">Foto de perfil</Label>
                    <p className="mt-1 text-sm text-muted-foreground">JPG, PNG ou WebP de até 5 MB. A imagem será otimizada automaticamente.</p>
                    {photoName && <p className="mt-1 truncate text-xs font-medium text-vessel-blue">{photoName}</p>}
                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <label htmlFor="foto-perfil" className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-vessel-blue px-4 text-sm font-medium text-white hover:bg-vessel-blue/90">
                        <Upload className="mr-2 h-4 w-4" />
                        {values.foto_url ? 'Trocar foto' : 'Adicionar foto'}
                      </label>
                      {values.foto_url && (
                        <Button type="button" variant="outline" size="sm" onClick={() => { setField('foto_url', ''); setPhotoName(''); }}>
                          <X className="mr-2 h-4 w-4" />Remover
                        </Button>
                      )}
                    </div>
                    <Input id="foto-perfil" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handlePhotoChange} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="Nome Completo *" id="nome"><Input id="nome" value={values.nome} onChange={(e) => setField('nome', e.target.value)} placeholder="Ex: João da Silva" /></Field>
                <Field label="CPF" id="cpf"><Input id="cpf" value={values.cpf} onChange={(e) => setField('cpf', e.target.value)} placeholder="000.000.000-00" /></Field>
                <Field label="Data de Nascimento" id="nascimento"><Input id="nascimento" type="date" value={values.dataNascimento} onChange={(e) => setField('dataNascimento', e.target.value)} /></Field>
                <Field label="Telefone" id="telefone"><Input id="telefone" value={values.telefone} onChange={(e) => setField('telefone', e.target.value)} placeholder="(00) 00000-0000" /></Field>
                <Field label="WhatsApp" id="whatsapp"><Input id="whatsapp" value={values.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} placeholder="(00) 00000-0000" /></Field>
                <Field label="E-mail" id="email"><Input id="email" type="email" value={values.email} onChange={(e) => setField('email', e.target.value)} placeholder="email@exemplo.com" /></Field>
                <Field label="Cargo *" id="cargo">
                  <Select value={values.cargo} onValueChange={(value) => setField('cargo', value)}>
                    <SelectTrigger id="cargo"><SelectValue placeholder="Selecione um cargo" /></SelectTrigger>
                    <SelectContent>{CARGO_OPTIONS.map((cargo) => <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Categoria *" id="categoria">
                  <Select value={values.categoria} onValueChange={(value) => setField('categoria', value as EmployeeFormValues['categoria'])}>
                    <SelectTrigger id="categoria"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                    <SelectContent>{CATEGORIA_COLABORADOR_OPTIONS.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Função" id="funcao"><Input id="funcao" value={values.funcao} onChange={(e) => setField('funcao', e.target.value)} placeholder="Função específica" /></Field>
                <Field label="Matrícula" id="matricula"><Input id="matricula" value={values.matricula} onChange={(e) => setField('matricula', e.target.value)} placeholder="Ex: 12345" /></Field>
                <Field label="Data de Entrada" id="entrada"><Input id="entrada" type="date" value={values.dataEntrada} onChange={(e) => setField('dataEntrada', e.target.value)} /></Field>
              </div>

              <div className="border-t border-vessel-gray-100 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div><Label className="text-base">Situação do Colaborador</Label><p className="text-sm text-muted-foreground">Define se o colaborador está ativo na equipe.</p></div>
                  <Switch checked={values.ativo} onCheckedChange={(checked) => setField('ativo', checked)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endereco">
          <Card className="border-vessel-gray-100 shadow-sm">
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Field label="CEP" id="cep"><Input id="cep" value={values.cep} onChange={(e) => setField('cep', e.target.value)} placeholder="00000-000" /></Field>
                <Field label="Rua/Avenida" id="logradouro"><Input id="logradouro" value={values.logradouro} onChange={(e) => setField('logradouro', e.target.value)} /></Field>
                <Field label="Número" id="numero"><Input id="numero" value={values.numero} onChange={(e) => setField('numero', e.target.value)} /></Field>
                <Field label="Complemento" id="complemento"><Input id="complemento" value={values.complemento} onChange={(e) => setField('complemento', e.target.value)} /></Field>
                <Field label="Bairro" id="bairro"><Input id="bairro" value={values.bairro} onChange={(e) => setField('bairro', e.target.value)} /></Field>
                <Field label="Cidade" id="cidade"><Input id="cidade" value={values.cidade} onChange={(e) => setField('cidade', e.target.value)} /></Field>
                <Field label="Estado" id="estado"><Input id="estado" value={values.estado} onChange={(e) => setField('estado', e.target.value)} /></Field>
                <Field label="Ponto de Referência" id="referencia"><Input id="referencia" value={values.referencia} onChange={(e) => setField('referencia', e.target.value)} /></Field>
              </div>

              {mapAddress && (values.logradouro || values.bairro) ? (
                <iframe
                  title="Prévia do endereço no Google Maps"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`}
                  className="h-64 w-full rounded-xl border border-vessel-gray-100"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg border border-vessel-gray-100 bg-vessel-gray-50 text-center text-muted-foreground">
                  <div><MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" /><p>Informe a rua ou o bairro para visualizar o mapa.</p></div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redes">
          <Card className="border-vessel-gray-100 shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <Field label="Instagram (usuário)" id="instagram"><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span><Input id="instagram" className="pl-8" value={values.instagram} onChange={(e) => setField('instagram', e.target.value.replace(/^@/, ''))} placeholder="usuario" /></div></Field>
              <Field label="Link do Instagram" id="instagramLink"><Input id="instagramLink" value={values.instagramLink} onChange={(e) => setField('instagramLink', e.target.value)} placeholder="https://instagram.com/..." /></Field>
              <Field label="Link do Facebook" id="facebook"><Input id="facebook" value={values.facebook} onChange={(e) => setField('facebook', e.target.value)} placeholder="https://facebook.com/..." /></Field>
              <Field label="Link do TikTok" id="tiktok"><Input id="tiktok" value={values.tiktok} onChange={(e) => setField('tiktok', e.target.value)} placeholder="https://tiktok.com/@..." /></Field>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end gap-4 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-vessel-green text-white hover:bg-vessel-green/90">
          <Save className="mr-2 h-4 w-4" />{isSubmitting ? 'Salvando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
