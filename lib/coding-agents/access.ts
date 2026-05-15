import type { User } from '@supabase/supabase-js';

export function canAccessBuildLab(user: User | null | undefined) {
  const email = user?.email?.toLowerCase().trim();
  if (!email) return false;

  if (process.env.NODE_ENV !== 'production' && email === 'dev@localhost') {
    return true;
  }

  const raw = process.env.BUILD_LAB_ALLOWED_EMAILS ?? process.env.BUILDLAB_ALLOWED_EMAILS ?? '';
  const allowed = raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return allowed.includes(email);
}
