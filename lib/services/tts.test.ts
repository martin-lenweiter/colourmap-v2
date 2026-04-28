import { describe, expect, it, vi } from 'vitest';

// Prevent kokoro-js WASM from loading in Node test environment
vi.mock('kokoro-js', () => ({
  KokoroTTS: { from_pretrained: vi.fn().mockResolvedValue({ generate: vi.fn() }) },
}));

import {
  ELEVENLABS_VOICES,
  getKokoroStatus,
  KOKORO_VOICES,
  onKokoroStatusChange,
  preloadKokoro,
  TTS_PROVIDERS,
} from './tts';

describe('TTS_PROVIDERS', () => {
  it('has three entries', () => {
    expect(TTS_PROVIDERS).toHaveLength(3);
  });

  it('includes browser, elevenlabs, kokoro', () => {
    const ids = TTS_PROVIDERS.map((p) => p.id);
    expect(ids).toContain('browser');
    expect(ids).toContain('elevenlabs');
    expect(ids).toContain('kokoro');
  });
});

describe('ELEVENLABS_VOICES', () => {
  it('has at least one voice', () => {
    expect(ELEVENLABS_VOICES.length).toBeGreaterThan(0);
  });

  it('each voice has id, name, description', () => {
    for (const v of ELEVENLABS_VOICES) {
      expect(v.id).toBeTruthy();
      expect(v.name).toBeTruthy();
      expect(v.description).toBeTruthy();
    }
  });
});

describe('KOKORO_VOICES', () => {
  it('has at least one voice', () => {
    expect(KOKORO_VOICES.length).toBeGreaterThan(0);
  });

  it('each voice has id and label', () => {
    for (const v of KOKORO_VOICES) {
      expect(v.id).toBeTruthy();
      expect(v.label).toBeTruthy();
    }
  });
});

describe('getKokoroStatus', () => {
  it('returns a valid status string', () => {
    const status = getKokoroStatus();
    expect(['idle', 'loading', 'ready', 'error']).toContain(status);
  });
});

describe('onKokoroStatusChange', () => {
  it('returns an unsubscribe function', () => {
    const unsub = onKokoroStatusChange(vi.fn());
    expect(typeof unsub).toBe('function');
    unsub();
  });
});

describe('preloadKokoro', () => {
  it('does not throw synchronously', () => {
    expect(() => preloadKokoro()).not.toThrow();
  });
});
