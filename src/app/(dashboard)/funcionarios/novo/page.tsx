'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { EmployeeForm } from '@/components/funcionarios/employee-form';
import { Button } from '@/components/ui/button';
import { employeeFromForm, formValuesFromEmployee, persistEmployee } from '@/lib/employee-storage';

export default function NovoFuncionarioPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ReturnType<typeof formValuesFromEmployee>) => {
    setIsSubmitting(true);
    try {
      const employee = employeeFromForm(values);
      const saved = await persistEmployee(employee);
      toast.success('Colaborador cadastrado e salvo com sucesso.');
      router.push(`/funcionarios/${saved.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar o colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vessel-deep">Novo Colaborador</h1>
          <p className="mt-1 text-muted-foreground">Preencha os dados, defina a categoria e adicione a foto de perfil.</p>
        </div>
      </div>

      <EmployeeForm
        initialValues={formValuesFromEmployee()}
        submitLabel="Salvar Colaborador"
        isSubmitting={isSubmitting}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
