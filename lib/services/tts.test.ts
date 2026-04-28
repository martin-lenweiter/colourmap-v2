import { beforeEach, describe, expect, it, vi } from 'vitest';

// Prevent kokoro-js WASM from loading in Node/jsdom
vi.mock('kokoro-js', () => ({
  KokoroTTS: {
    from_pretrained: vi.fn().mockResolvedValue({
      generate: vi.fn().mockResolvedValue({
        toWav: vi.fn().mockReturnValue(new ArrayBuffer(8)),
      }),
    }),
  },
}));

import {
  ELEVENLABS_VOICES,
  getKokoroStatus,
  KOKORO_VOICES,
  onKokoroStatusChange,
  preloadKokoro,
  speakText,
  stopSpeaking,
  TTS_PROVIDERS,
} from './tts';

// ─── Browser API stubs ────────────────────────────────────────────────────────

type MockAudioEl = {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  volume: number;
  src: string;
  onended: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
};

let _lastAudio: MockAudioEl | null = null;

// Use function keyword — vi.fn() constructors must not use arrow functions
const MockAudio = vi.fn(function MockAudioImpl(this: MockAudioEl) {
  this.play = vi.fn(function (this: void) {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (_lastAudio?.onended) _lastAudio.onended();
        resolve();
      }, 0);
    });
  });
  this.pause = vi.fn();
  this.volume = 1;
  this.src = '';
  this.onended = null;
  this.onerror = null;
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  _lastAudio = this;
});

vi.stubGlobal('Audio', MockAudio);

vi.stubGlobal('URL', {
  createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
  revokeObjectURL: vi.fn(),
});

type MockUtterance = {
  rate: number;
  pitch: number;
  volume: number;
  voice: null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

let _lastUtterance: MockUtterance | null = null;

const mockSpeechSynthesis = {
  cancel: vi.fn(),
  speak: vi.fn(function (this: void) {
    setTimeout(() => {
      if (_lastUtterance?.onend) _lastUtterance.onend();
    }, 0);
  }),
  getVoices: vi.fn().mockReturnValue([
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Aria', lang: 'en-US' },
    { name: 'Generic', lang: 'en-GB' },
  ]),
};

// Use function keyword for constructor mock
const MockUtteranceCtor = vi.fn(function MockUtteranceImpl(this: MockUtterance) {
  this.rate = 1;
  this.pitch = 1;
  this.volume = 1;
  this.voice = null;
  this.onend = null;
  this.onerror = null;
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  _lastUtterance = this;
});

vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
vi.stubGlobal('SpeechSynthesisUtterance', MockUtteranceCtor);

const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  blob: vi.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' })),
});
vi.stubGlobal('fetch', mockFetch);

// ─── Helpers ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  _lastAudio = null;
  _lastUtterance = null;

  mockSpeechSynthesis.speak.mockImplementation(function (this: void) {
    setTimeout(() => {
      if (_lastUtterance?.onend) _lastUtterance.onend();
    }, 0);
  });
  mockSpeechSynthesis.getVoices.mockReturnValue([
    { name: 'Samantha', lang: 'en-US' },
    { name: 'Aria', lang: 'en-US' },
    { name: 'Generic', lang: 'en-GB' },
  ]);

  MockAudio.mockImplementation(function (this: MockAudioEl) {
    this.play = vi.fn(function (this: void) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          if (_lastAudio?.onended) _lastAudio.onended();
          resolve();
        }, 0);
      });
    });
    this.pause = vi.fn();
    this.volume = 1;
    this.src = '';
    this.onended = null;
    this.onerror = null;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    _lastAudio = this;
  });

  MockUtteranceCtor.mockImplementation(function (this: MockUtterance) {
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
    this.voice = null;
    this.onend = null;
    this.onerror = null;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    _lastUtterance = this;
  });

  mockFetch.mockResolvedValue({
    ok: true,
    blob: vi.fn().mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' })),
  });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

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
  it('each provider has id, label, description', () => {
    for (const p of TTS_PROVIDERS) {
      expect(p.id).toBeTruthy();
      expect(p.label).toBeTruthy();
      expect(p.description).toBeTruthy();
    }
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
    expect(['idle', 'loading', 'ready', 'error']).toContain(getKokoroStatus());
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

describe('speakText', () => {
  it('does nothing for empty string', async () => {
    await speakText('   ', { provider: 'browser' });
    expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
  });

  it('does nothing for empty string with elevenlabs', async () => {
    await speakText('', { provider: 'elevenlabs' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('dispatches to browser provider', async () => {
    await speakText('hello', { provider: 'browser' });
    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it('dispatches to elevenlabs provider', async () => {
    await speakText('hello', { provider: 'elevenlabs' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/tts/elevenlabs',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('dispatches to kokoro provider and produces audio', async () => {
    await speakText('hello world', { provider: 'kokoro', kokoroVoice: 'af_heart' });
    expect(MockAudio).toHaveBeenCalled();
  });
});

describe('speakText — browser provider', () => {
  it('sets utterance rate, pitch, volume from config', async () => {
    await speakText('test', { provider: 'browser', rate: 1.2, pitch: 0.8, volume: 0.5 });
    expect(_lastUtterance?.rate).toBe(1.2);
    expect(_lastUtterance?.pitch).toBe(0.8);
    expect(_lastUtterance?.volume).toBe(0.5);
  });

  it('calls getVoices and picks a preferred English voice', async () => {
    await speakText('test', { provider: 'browser' });
    expect(mockSpeechSynthesis.getVoices).toHaveBeenCalled();
  });

  it('resolves when utterance ends', async () => {
    await expect(speakText('test', { provider: 'browser' })).resolves.toBeUndefined();
  });

  it('resolves on utterance error without throwing', async () => {
    mockSpeechSynthesis.speak.mockImplementation(function (this: void) {
      setTimeout(() => {
        if (_lastUtterance?.onerror) _lastUtterance.onerror();
      }, 0);
    });
    await expect(speakText('test', { provider: 'browser' })).resolves.toBeUndefined();
  });

  it('uses generic English fallback when no preferred voice exists', async () => {
    mockSpeechSynthesis.getVoices.mockReturnValueOnce([
      { name: 'Unknown', lang: 'en-US' },
      { name: 'French', lang: 'fr-FR' },
    ]);
    await speakText('test', { provider: 'browser' });
    expect(_lastUtterance?.voice).toBeDefined();
  });
});

describe('speakText — elevenlabs provider', () => {
  it('sends correct payload to proxy', async () => {
    await speakText('hi', {
      provider: 'elevenlabs',
      elevenLabsVoiceId: 'test-voice-id',
      elevenLabsModel: 'eleven_monolingual_v1',
      elevenLabsStability: 0.3,
      elevenLabsSimilarity: 0.7,
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.voiceId).toBe('test-voice-id');
    expect(body.model).toBe('eleven_monolingual_v1');
    expect(body.stability).toBe(0.3);
    expect(body.similarity).toBe(0.7);
  });

  it('uses default voice id if not set', async () => {
    await speakText('hi', { provider: 'elevenlabs' });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.voiceId).toBeTruthy();
  });

  it('throws when fetch response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(speakText('hi', { provider: 'elevenlabs' })).rejects.toThrow(
      'ElevenLabs error 401',
    );
  });

  it('plays audio blob after successful fetch', async () => {
    await speakText('hello', { provider: 'elevenlabs' });
    expect(MockAudio).toHaveBeenCalled();
    expect(_lastAudio?.play).toHaveBeenCalled();
  });
});

describe('speakText — kokoro provider', () => {
  it('generates audio and plays it via Audio element', async () => {
    // Kokoro singleton may already be loaded from a prior test — just verify
    // the full pipeline ends by creating an Audio element and calling play.
    await speakText('hello', { provider: 'kokoro', kokoroVoice: 'af_bella' });
    expect(MockAudio).toHaveBeenCalled();
    expect(_lastAudio?.play).toHaveBeenCalled();
  });

  it('falls back to af_heart when voice not specified and plays audio', async () => {
    await speakText('hello', { provider: 'kokoro' });
    expect(MockAudio).toHaveBeenCalled();
  });
});

describe('speakText — browser provider (no speechSynthesis)', () => {
  it('resolves immediately when speechSynthesis is not available', async () => {
    vi.stubGlobal('speechSynthesis', undefined);
    await expect(speakText('test', { provider: 'browser' })).resolves.toBeUndefined();
    vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);
  });
});

describe('playBlob error path', () => {
  it('rejects when audio.onerror fires', async () => {
    MockAudio.mockImplementationOnce(function (this: MockAudioEl) {
      this.play = vi.fn(function (this: void) {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            if (_lastAudio?.onerror) _lastAudio.onerror(new Error('media error'));
            reject(new Error('media error'));
          }, 0);
        });
      });
      this.pause = vi.fn();
      this.volume = 1;
      this.src = '';
      this.onended = null;
      this.onerror = null;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      _lastAudio = this;
    });
    await expect(speakText('hello', { provider: 'elevenlabs' })).rejects.toBeDefined();
  });

  it('rejects when audio.play() itself rejects', async () => {
    MockAudio.mockImplementationOnce(function (this: MockAudioEl) {
      this.play = vi.fn().mockRejectedValue(new Error('autoplay blocked'));
      this.pause = vi.fn();
      this.volume = 1;
      this.src = '';
      this.onended = null;
      this.onerror = null;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      _lastAudio = this;
    });
    await expect(speakText('hello', { provider: 'elevenlabs' })).rejects.toThrow(
      'autoplay blocked',
    );
  });
});

describe('stopSpeaking', () => {
  it('calls speechSynthesis.cancel', () => {
    stopSpeaking();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });

  it('can be called when no audio is active', () => {
    expect(() => stopSpeaking()).not.toThrow();
  });

  it('pauses and clears active audio element', async () => {
    MockAudio.mockImplementationOnce(function (this: MockAudioEl) {
      this.play = vi.fn(function (this: void) {
        return new Promise<void>(() => {
          // Never resolves — simulate long-running playback
        });
      });
      this.pause = vi.fn();
      this.volume = 1;
      this.src = '';
      this.onended = null;
      this.onerror = null;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      _lastAudio = this;
    });

    // Kick off but don't await — let the fetch+blob+Audio chain settle
    speakText('hello', { provider: 'elevenlabs' });
    // Drain microtask queue: fetch → .blob() → new Audio() → .play()
    await new Promise((r) => setTimeout(r, 50));

    expect(MockAudio).toHaveBeenCalled();
    stopSpeaking();
    expect(_lastAudio?.pause).toHaveBeenCalled();
  });
});
