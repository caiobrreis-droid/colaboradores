'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  USER_PROFILE_STORAGE_KEY,
  USER_PROFILE_UPDATED_EVENT,
  type StoredUserProfile,
} from '@/lib/profile-storage';

function mapRemoteProfile(user: any): StoredUserProfile {
  return {
    name: user.nome,
    email: user.email,
    role: user.permissao,
    avatarUrl: user.avatarUrl || '',
  };
}

export function useUserProfile() {
  const [profile, setProfile] = useState<StoredUserProfile>(DEFAULT_USER_PROFILE);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/perfil', { cache: 'no-store' });
      if (response.ok) {
        const payload = await response.json();
        setProfile(mapRemoteProfile(payload.user));
        return;
      }
    } catch {
      // O modo local permanece disponível sem PostgreSQL.
    }
    setProfile(loadUserProfile());
  }, []);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<StoredUserProfile>).detail;
      if (detail) setProfile(detail);
      else void refresh();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_PROFILE_STORAGE_KEY) void refresh();
    };

    void refresh();
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refresh]);

  return profile;
}
