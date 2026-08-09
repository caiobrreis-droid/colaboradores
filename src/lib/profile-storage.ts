export interface StoredUserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export const USER_PROFILE_STORAGE_KEY = 'vessel:user-profile';
export const USER_PROFILE_UPDATED_EVENT = 'vessel:user-profile-updated';

export const DEFAULT_USER_PROFILE: StoredUserProfile = {
  name: 'Admin User',
  email: 'admin@vessel.com',
  role: 'Administrador',
  avatarUrl: '',
};

export function loadUserProfile(): StoredUserProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;

  try {
    const stored = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!stored) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(stored) as Partial<StoredUserProfile>;
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: StoredUserProfile) {
  window.localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new CustomEvent(USER_PROFILE_UPDATED_EVENT, { detail: profile }));
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });
}

export function getProfileInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
}
