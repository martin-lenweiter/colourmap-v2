import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClient, getUser } = vi.hoisted(() => {
  const getUser = vi.fn();
  const createClient = vi.fn(async () => ({ auth: { getUser } }));
  return { createClient, getUser };
});

vi.mock('@/lib/supabase/server', () => ({ createClient }));

// Mock fetch for upstream ElevenLabs call
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { POST } from './route';

const user = { id: 'user-1', email: 'test@example.com' };

beforeEach(() => {
  vi.clearAllMocks();
  getUser.mockResolvedValue({ data: { user }, error: null });
  process.env.ELEVENLABS_API_KEY = 'test-key';
});

describe('POST /api/tts/elevenlabs', () => {
  it('returns 503 when API key not configured', async () => {
    delete process.env.ELEVENLABS_API_KEY;
    const req = new Request('http://localhost/api/tts/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });

  it('returns 400 when text is missing', async () => {
    const req = new Request('http://localhost/api/tts/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('proxies to ElevenLabs and returns audio', async () => {
    const audioBuffer = new ArrayBuffer(8);
    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => audioBuffer,
    });

    const req = new Request('http://localhost/api/tts/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello world' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('audio/mpeg');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('elevenlabs.io'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('forwards upstream error status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'quota exceeded',
    });

    const req = new Request('http://localhost/api/tts/elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
