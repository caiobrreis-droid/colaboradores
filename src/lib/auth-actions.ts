export async function signOutFromSystem() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } finally {
    window.location.replace('/login');
  }
}
