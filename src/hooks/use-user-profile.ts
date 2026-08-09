'use client';

import { useEffect, useState } from 'react';

import {
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  USER_PROFILE_STORAGE_KEY,
  USER_PROFILE_UPDATED_EVENT,
  type StoredUserProfile,
} from '@/lib/profile-storage';

export function useUserProfile() {
  const [profile, setProfile] = useState<StoredUserProfile>(DEFAULT_USER_PROFILE);

  useEffect(() => {
    const refresh = () => setProfile(loadUserProfile());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_PROFILE_STORAGE_KEY) refresh();
    };

    refresh();
    window.addEventListener(USER_PROFILE_UPDATED_EVENT, refresh);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(USER_PROFILE_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return profile;
}
