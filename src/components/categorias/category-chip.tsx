'use client';

import { createElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { categoryColor, categoryIcon } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Categoria } from '@/types';

/** Ícone da categoria a partir da chave salva (ex.: 'landmark'). */
export function CategoryIcon({ icon, className }: { icon?: string; className?: string }) {
  return createElement(categoryIcon(icon), { className });
}

/** Selo colorido com ícone para exibir a categoria de um colaborador. */
export function CategoryBadge({ category, fallback, className }: { category?: Categoria; fallback?: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('gap-1 font-medium', categoryColor(category?.cor).badge, className)}>
      <CategoryIcon icon={category?.icone} className="h-3 w-3" />
      {category?.nome || fallback || 'Não informada'}
    </Badge>
  );
}
