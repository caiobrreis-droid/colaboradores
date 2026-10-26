'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CategoryIcon } from '@/components/categorias/category-chip';
import { CATEGORY_COLORS, CATEGORY_ICONS, categoryColor, persistCategory, type CategoryColor } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Categoria } from '@/types';

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Categoria | null;
  onSaved?: (category: Categoria) => void;
}

const EMPTY_FORM = { nome: '', descricao: '', cor: 'blue', icone: 'building', ativo: true };

export function CategoryDialog({ open, onOpenChange, category, onSaved }: CategoryDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(category
      ? { nome: category.nome, descricao: category.descricao, cor: category.cor, icone: category.icone, ativo: category.ativo }
      : EMPTY_FORM);
  }, [open, category]);

  const previewColor = categoryColor(form.cor);

  const handleSave = async () => {
    if (form.nome.trim().length < 2) {
      toast.error('Informe um nome com pelo menos 2 caracteres.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await persistCategory({ ...form, slug: category?.slug });
      toast.success(category ? 'Categoria atualizada.' : `Categoria ${saved.nome} criada.`);
      onSaved?.(saved);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          <DialogDescription>Categorias organizam os colaboradores por lotação ou área de trabalho.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 rounded-xl border border-vessel-gray-100 bg-vessel-gray-50 p-4">
          <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', previewColor.chip)}><CategoryIcon icon={form.icone} className="h-5 w-5" /></span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-vessel-deep">{form.nome.trim() || 'Nome da categoria'}</span>
            <span className="block truncate text-xs text-muted-foreground">{form.descricao.trim() || 'Prévia de como a categoria vai aparecer'}</span>
          </span>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="categoria-nome">Nome *</Label>
            <Input id="categoria-nome" value={form.nome} maxLength={120} autoFocus onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Ex.: Secretaria de Saúde" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="categoria-descricao">Descrição</Label>
            <Input id="categoria-descricao" value={form.descricao} maxLength={255} onChange={(event) => setForm({ ...form, descricao: event.target.value })} placeholder="Opcional" />
          </div>

          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_COLORS) as CategoryColor[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  title={CATEGORY_COLORS[key].label}
                  aria-label={`Cor ${CATEGORY_COLORS[key].label}`}
                  aria-pressed={form.cor === key}
                  onClick={() => setForm({ ...form, cor: key })}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-full ring-offset-2 transition', CATEGORY_COLORS[key].dot, form.cor === key ? 'ring-2 ring-vessel-blue' : 'hover:scale-110')}
                >
                  {form.cor === key && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
              {Object.entries(CATEGORY_ICONS).map(([key, { label, icon: Icon }]) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  aria-label={`Ícone ${label}`}
                  aria-pressed={form.icone === key}
                  onClick={() => setForm({ ...form, icone: key })}
                  className={cn('flex aspect-square items-center justify-center rounded-lg border transition', form.icone === key ? cn('border-transparent', previewColor.chip, 'ring-2 ring-vessel-blue') : 'border-vessel-gray-100 text-slate-500 hover:bg-vessel-gray-50')}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-vessel-gray-100 px-3 py-2.5">
            <div>
              <Label htmlFor="categoria-ativa" className="cursor-pointer">Disponível para novos cadastros</Label>
              <p className="text-xs text-muted-foreground">Categorias inativas continuam nos relatórios, mas não aparecem no cadastro.</p>
            </div>
            <Switch id="categoria-ativa" checked={form.ativo} onCheckedChange={(ativo) => setForm({ ...form, ativo })} />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button className="bg-vessel-blue text-white hover:bg-vessel-blue/90" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? 'Salvar alterações' : 'Criar categoria'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
