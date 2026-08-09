'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthenticatedUser {
  id: string;
  nome: string;
  email: string;
  permissao: 'Administrador' | 'Operador' | 'Visualizador';
  ativo: boolean;
  avatarUrl: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', { cache: 'no-store' });
      if (!response.ok) {
        setUser(null);
        return null;
      }
      const payload = await response.json();
      setUser(payload.user);
      return payload.user as AuthenticatedUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Não foi possível entrar.');
    await refreshSession();
    router.replace('/');
    router.refresh();
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.replace('/login');
  };

  return {
    user,
    profile: user,
    loading,
    signIn,
    signOut,
    refreshSession,
    isAdmin: user?.permissao === 'Administrador',
    isOperator: user?.permissao === 'Operador' || user?.permissao === 'Administrador',
    isViewer: Boolean(user),
  };
}
