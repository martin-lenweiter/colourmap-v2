import { NextResponse } from 'next/server';

import { readGeometryLiveState, writeGeometryLiveState } from '@/lib/geometry-live';

export async function GET() {
  return NextResponse.json(readGeometryLiveState());
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  return NextResponse.json(writeGeometryLiveState(body));
}
