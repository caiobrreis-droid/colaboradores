'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import * as z from 'zod';

import { BrandLogo } from '@/components/shared/brand-logo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
  remember: z.boolean().default(false).optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@vessel.com', password: '123456', remember: true },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Não foi possível entrar.');
      toast.success('Login realizado com sucesso!');
      router.replace('/');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#dce4ee] px-4 py-8 sm:px-8">
      <div className="grid w-full max-w-[1120px] overflow-hidden rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,35,65,0.22)] lg:min-h-[700px] lg:grid-cols-[41%_59%]">
        <section className="relative flex min-h-[380px] flex-col overflow-hidden bg-[#073fc8] p-8 text-white sm:p-11 lg:min-h-full">
          <div className="absolute -bottom-32 -right-28 h-80 w-80 rounded-full bg-blue-950/20 blur-3xl" />
          <div className="relative z-10">
            <BrandLogo className="mx-auto max-w-[380px] rounded-xl shadow-[0_18px_45px_rgba(0,25,95,0.18)]" priority showDetails />
          </div>

          <div className="relative z-10 mt-auto pt-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Painel de gestão integrado</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">Gestão de<br />Colaboradores</h1>
            <p className="mt-6 max-w-sm text-[15px] leading-6 text-blue-50/90">Cadastros, categorias, endereços, relatórios e informações da equipe reunidos em um só lugar.</p>

            <div className="mt-7 rounded-xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#21e27a] text-[#21e27a]"><ShieldCheck className="h-5 w-5" /></span>
                <div><p className="font-semibold">Operação protegida</p><p className="mt-1 text-sm leading-5 text-blue-100">Acesso individual e dados organizados para toda a equipe.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center px-7 py-10 sm:px-14 lg:px-20">
          <div className="mx-auto w-full max-w-[500px]">
            <div className="mb-14 hidden items-center lg:flex">
              <span className="h-3 w-3 rounded-full border-2 border-[#075df0] bg-white" />
              <span className="h-px flex-1 bg-slate-200" />
              <span className="h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
              <span className="h-px flex-1 bg-slate-200" />
              <span className="h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
              <span className="h-px flex-1 bg-slate-200" />
              <span className="h-3 w-3 rounded-full border-2 border-slate-300 bg-white" />
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#075df0]">Acesso seguro</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1220] sm:text-4xl">Entre na sua conta</h2>
              <p className="mt-3 text-slate-500">Bem-vindo de volta ao painel de gestão de colaboradores.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-slate-700">E-mail</FormLabel>
                    <FormControl><div className="relative"><Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input placeholder="seu@email.com" className="h-14 border-slate-200 bg-[#f5f8fc] pl-11 focus-visible:ring-[#075df0]" {...field} /></div></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between"><FormLabel className="font-medium text-slate-700">Senha</FormLabel><a href="#" className="text-sm font-medium text-[#075df0] hover:underline">Esqueci minha senha</a></div>
                    <FormControl>
                      <div className="relative"><Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="h-14 border-slate-200 bg-[#f5f8fc] pl-11 pr-11 focus-visible:ring-[#075df0]" {...field} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="remember" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-1"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:border-[#075df0] data-[state=checked]:bg-[#075df0]" /></FormControl><FormLabel className="text-sm font-normal text-slate-600">Lembrar de mim</FormLabel></FormItem>
                )} />

                <Button type="submit" disabled={isLoading} className="h-14 w-full bg-[#1262e8] text-base font-semibold text-white shadow-[0_12px_28px_rgba(18,98,232,0.25)] hover:bg-[#0751ce]">
                  {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Entrando...</> : <>Entrar no sistema<ArrowRight className="ml-3 h-5 w-5" /></>}
                </Button>
              </form>
            </Form>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400"><Check className="h-4 w-4 text-emerald-500" /><span>Acesso restrito e monitorado</span></div>
            <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-400"><UsersRound className="h-4 w-4" /><span>Gabinete • Casa • Vice-Presidência • PMBV</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
