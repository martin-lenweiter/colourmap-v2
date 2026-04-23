import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { getRequiredEnv } from '@/lib/env';

const DEV_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'dev@localhost',
  aud: 'authenticated',
  role: 'authenticated',
  created_at: new Date().toISOString(),
};

function createDevClient(): SupabaseClient {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEV_USER }, error: null }),
      signOut: async () => ({ error: null }),
    },
  } as unknown as SupabaseClient;
}

function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_BYPASS_AUTH === 'true';
}

/*
 * Production guard: DEV_BYPASS_AUTH must never be true in prod.
 * Today the isDevAuthBypassEnabled() check silently ignores it in
 * prod, but that's too quiet — if it gets set by accident (wrong
 * env var dashboard, a shared .env file, a Vercel env leak), the
 * app still runs against real auth and nobody notices. Fail loudly
 * instead so the deployment breaks visibly at first import.
 */
if (process.env.NODE_ENV === 'production' && process.env.DEV_BYPASS_AUTH === 'true') {
  throw new Error(
    'DEV_BYPASS_AUTH must not be set to "true" in production. ' +
      'Remove it from your hosting provider (Vercel Settings → Environment Variables) ' +
      'before redeploying.',
  );
}

export async function createClient() {
  if (isDevAuthBypassEnabled()) {
    return createDevClient();
  }

  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write response cookies; proxy refresh handles that path.
          }
        },
      },
    },
  );
}
