'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

import { EmployeeForm } from '@/components/funcionarios/employee-form';
import { Button } from '@/components/ui/button';
import {
  employeeFromForm,
  findEmployee,
  formValuesFromEmployee,
  upsertEmployee,
  type EmployeeFormValues,
} from '@/lib/employee-storage';
import type { FuncionarioCompleto } from '@/types';

export default function EditarFuncionarioPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const [employee, setEmployee] = useState<FuncionarioCompleto>();
  const [loaded, setLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEmployee(findEmployee(id));
    setLoaded(true);
  }, [id]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (!employee) return;
    setIsSubmitting(true);
    try {
      upsertEmployee(employeeFromForm(values, employee));
      toast.success('Alterações salvas com sucesso.');
      router.push(`/funcionarios/${id}`);
    } catch {
      toast.error('Não foi possível salvar as alterações.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loaded) return <div className="p-6 text-muted-foreground">Carregando cadastro...</div>;
  if (!employee) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <h1 className="text-xl font-semibold text-vessel-deep">Colaborador não encontrado</h1>
        <Button className="mt-4" onClick={() => router.push('/funcionarios')}>Voltar para colaboradores</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-vessel-deep">Editar Colaborador</h1>
          <p className="mt-1 text-muted-foreground">Atualize os dados de {employee.nome} e salve as alterações.</p>
        </div>
      </div>

      <EmployeeForm
        initialValues={formValuesFromEmployee(employee)}
        submitLabel="Salvar Alterações"
        isSubmitting={isSubmitting}
        onCancel={() => router.back()}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
