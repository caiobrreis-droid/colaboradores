import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export async function signOutFromSystem() {
  try {
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    }
  } finally {
    document.cookie = 'vessel_demo_auth=; path=/; max-age=0; SameSite=Lax';
    window.location.replace('/login');
  }
}
