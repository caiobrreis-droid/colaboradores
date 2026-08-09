export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const hasValidUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)
    && !url.includes('seu-projeto')
    && !url.includes('your-project');
  const hasValidKey = (anonKey.startsWith('eyJ') && anonKey.length > 100)
    || (anonKey.startsWith('sb_publishable_') && anonKey.length > 40);

  return hasValidUrl && hasValidKey;
}

export function isSupabaseAdminConfigured() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const hasServiceRole = (serviceRoleKey.startsWith('eyJ') && serviceRoleKey.length > 100)
    || (serviceRoleKey.startsWith('sb_secret_') && serviceRoleKey.length > 40);

  return isSupabaseConfigured() && hasServiceRole;
}
