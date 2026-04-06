import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  if (process.env.E2E_TEST_AUTH_ENABLED !== 'true') {
    return new Response(null, { status: 404 });
  }

  const body = (await request.json()) as {
    email?: unknown;
    password?: unknown;
  };
  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
