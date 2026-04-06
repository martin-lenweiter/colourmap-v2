import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

type RouteSuccess<T> = {
  ok: true;
  value: T;
};

type RouteFailure = {
  ok: false;
  response: Response;
};

export type RouteResult<T> = RouteSuccess<T> | RouteFailure;

type AuthOptions = {
  unauthorizedResponse?: () => Response;
};

type JsonOptions = {
  invalidJsonResponse?: () => Response;
};

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedJsonResponse() {
  return jsonError('Unauthorized', 401);
}

export function unauthorizedTextResponse() {
  return new Response('Unauthorized', { status: 401 });
}

export function invalidJsonBodyResponse() {
  return jsonError('Invalid JSON body', 400);
}

export async function requireAuthenticatedUser(
  options: AuthOptions = {},
): Promise<RouteResult<User>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: (options.unauthorizedResponse ?? unauthorizedJsonResponse)(),
    };
  }

  return { ok: true, value: user };
}

export async function withAuthenticatedUser(
  handler: (user: User) => Promise<Response> | Response,
  options: AuthOptions = {},
) {
  const result = await requireAuthenticatedUser(options);

  if (!result.ok) {
    return result.response;
  }

  return handler(result.value);
}

export async function parseJsonBody(
  request: Request,
  options: JsonOptions = {},
): Promise<RouteResult<unknown>> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: (options.invalidJsonResponse ?? invalidJsonBodyResponse)(),
    };
  }
}
