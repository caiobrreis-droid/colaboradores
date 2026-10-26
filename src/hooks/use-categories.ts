'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { CATEGORY_STORAGE_EVENT, DEFAULT_CATEGORIES, fetchCategories } from '@/lib/categories';
import type { Categoria } from '@/types';

// Estado compartilhado: todos os componentes usam a mesma lista e uma única requisição.
let snapshot: { categories: Categoria[]; loading: boolean } = { categories: DEFAULT_CATEGORIES, loading: true };
let inflight: Promise<void> | null = null;
let listening = false;
const subscribers = new Set<() => void>();

function publish(next: typeof snapshot) {
  snapshot = next;
  subscribers.forEach((notify) => notify());
}

function reloadCategories() {
  inflight ??= fetchCategories()
    .then((categories) => publish({ categories, loading: false }))
    // Mantém a lista anterior; as telas continuam funcionando com as categorias padrão.
    .catch(() => publish({ ...snapshot, loading: false }))
    .finally(() => { inflight = null; });
  return inflight;
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  if (!listening) {
    listening = true;
    window.addEventListener(CATEGORY_STORAGE_EVENT, () => void reloadCategories());
  }
  return () => { subscribers.delete(notify); };
}

const getSnapshot = () => snapshot;
const initialSnapshot = { categories: DEFAULT_CATEGORIES, loading: true };
const getServerSnapshot = () => initialSnapshot;

export function useCategories() {
  const { categories, loading } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (snapshot.loading) void reloadCategories();
  }, []);

  const bySlug = useMemo(() => new Map(categories.map((category) => [category.slug, category])), [categories]);
  const activeCategories = useMemo(() => categories.filter((category) => category.ativo), [categories]);

  const getCategory = useCallback((slug?: string) => (slug ? bySlug.get(slug) : undefined), [bySlug]);
  const labelOf = useCallback((slug?: string) => (slug ? bySlug.get(slug)?.nome || slug : 'Não informada'), [bySlug]);

  return { categories, activeCategories, loading, reload: reloadCategories, getCategory, labelOf };
}
