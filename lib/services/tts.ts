'use client';

// Universal TTS service — three backends:
//   'browser'     Web Speech API   — zero latency, robotic quality
//   'elevenlabs'  ElevenLabs API   — very natural, 10k chars/month free
//   'kokoro'      Kokoro ONNX      — open-source, natural, runs in browser
//                                    ~80MB model download on first use

export type TTSProvider = 'browser' | 'elevenlabs' | 'kokoro';

export const TTS_PROVIDERS: { id: TTSProvider; label: string; description: string }[] = [
  { id: 'browser', label: 'Browser', description: 'Built-in — instant, robotic' },
  { id: 'elevenlabs', label: 'ElevenLabs', description: 'Natural AI voice — requires API key' },
  { id: 'kokoro', label: 'Kokoro', description: 'Open-source AI — downloads ~80MB once' },
];

export interface TTSConfig {
  provider: TTSProvider;
  rate?: number; // browser: 0.5–1.5
  pitch?: number; // browser: 0.5–2.0
  volume?: number; // 0–1
  // ElevenLabs
  elevenLabsVoiceId?: string;
  elevenLabsModel?: string;
  elevenLabsStability?: number;
  elevenLabsSimilarity?: number;
  // Kokoro
  kokoroVoice?: KokoroVoice;
}

// Best ElevenLabs free-tier voices
export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm · Female · American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Warm · Female · American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Clear · Male · American' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Bright · Female · American' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Warm · Male · American' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep · Male · American' },
] as const;

// Best Kokoro voices
export type KokoroVoice =
  | 'af_heart' // American Female, warm — best overall
  | 'af_bella' // American Female, expressive
  | 'af_nicole' // American Female, clear
  | 'am_adam' // American Male, calm
  | 'am_michael' // American Male, deep
  | 'bf_emma' // British Female, elegant
  | 'bm_george'; // British Male, authoritative

export const KOKORO_VOICES: { id: KokoroVoice; label: string }[] = [
  { id: 'af_heart', label: 'Heart (AF)' },
  { id: 'af_bella', label: 'Bella (AF)' },
  { id: 'af_nicole', label: 'Nicole (AF)' },
  { id: 'am_adam', label: 'Adam (AM)' },
  { id: 'am_michael', label: 'Michael (AM)' },
  { id: 'bf_emma', label: 'Emma (BF)' },
  { id: 'bm_george', label: 'George (BM)' },
];

// ─── Kokoro lazy singleton ────────────────────────────────────────────────────

let kokoroInstance: import('kokoro-js').KokoroTTS | null = null;
let kokoroLoading: Promise<import('kokoro-js').KokoroTTS> | null = null;

export type KokoroStatus = 'idle' | 'loading' | 'ready' | 'error';
let _kokoroStatus: KokoroStatus = 'idle';
const _kokoroListeners: Set<(s: KokoroStatus) => void> = new Set();

function setKokoroStatus(s: KokoroStatus) {
  _kokoroStatus = s;
  /* istanbul ignore next */
  for (const fn of _kokoroListeners) fn(s);
}

export function getKokoroStatus(): KokoroStatus {
  return _kokoroStatus;
}

export function onKokoroStatusChange(fn: (s: KokoroStatus) => void): () => void {
  _kokoroListeners.add(fn);
  return () => _kokoroListeners.delete(fn);
}

async function getKokoro() {
  if (kokoroInstance) return kokoroInstance;
  if (kokoroLoading) return kokoroLoading;
  setKokoroStatus('loading');
  kokoroLoading = import('kokoro-js')
    .then(({ KokoroTTS }) =>
      KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0', { dtype: 'q8' }),
    )
    .then((tts) => {
      kokoroInstance = tts;
      setKokoroStatus('ready');
      return tts;
    })
    .catch(
      /* istanbul ignore next */ (e) => {
        kokoroLoading = null;
        setKokoroStatus('error');
        throw e;
      },
    );
  return kokoroLoading;
}

// Pre-warm Kokoro — call when user selects the Kokoro provider so the
// model is downloading while they configure other settings.
export function preloadKokoro() {
  if (_kokoroStatus === 'idle') void getKokoro();
}

// ─── Active playback tracking ─────────────────────────────────────────────────

let activeAudio: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel();
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = '';
    activeAudio = null;
  }
}

// ─── Main speak function ──────────────────────────────────────────────────────

export async function speakText(text: string, config: TTSConfig): Promise<void> {
  stopSpeaking();
  if (!text.trim()) return;

  switch (config.provider) {
    case 'browser':
      return speakBrowser(text, config);
    case 'elevenlabs':
      return speakElevenLabs(text, config);
    case 'kokoro':
      return speakKokoro(text, config);
  }
}

// ─── Browser (Web Speech API) ─────────────────────────────────────────────────

function speakBrowser(text: string, config: TTSConfig): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = config.rate ?? 0.85;
    utter.pitch = config.pitch ?? 1.0;
    utter.volume = config.volume ?? 0.85;

    // Pick the best available English voice — prefer Samantha (Mac) or Aria (Windows)
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Aria') ||
          v.name.includes('Zira')),
    );
    utter.voice = preferred ?? voices.find((v) => v.lang.startsWith('en')) ?? null;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}

// ─── ElevenLabs (via API proxy) ───────────────────────────────────────────────

async function speakElevenLabs(text: string, config: TTSConfig): Promise<void> {
  const voiceId = config.elevenLabsVoiceId ?? ELEVENLABS_VOICES[0].id;
  const res = await fetch('/api/tts/elevenlabs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voiceId,
      model: config.elevenLabsModel ?? 'eleven_multilingual_v2',
      stability: config.elevenLabsStability ?? 0.45,
      similarity: config.elevenLabsSimilarity ?? 0.8,
    }),
  });

  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}`);

  const blob = await res.blob();
  return playBlob(blob, 'audio/mpeg', config.volume);
}

// ─── Kokoro (ONNX in-browser) ─────────────────────────────────────────────────

async function speakKokoro(text: string, config: TTSConfig): Promise<void> {
  const tts = await getKokoro();
  const voice = config.kokoroVoice ?? 'af_heart';
  const audio = await tts.generate(text, { voice });

  // kokoro-js returns a RawAudio with toWav() → ArrayBuffer
  const wav = (audio as unknown as { toWav: () => ArrayBuffer }).toWav();
  const blob = new Blob([wav], { type: 'audio/wav' });
  return playBlob(blob, 'audio/wav', config.volume);
}

// ─── Shared audio playback ────────────────────────────────────────────────────

function playBlob(blob: Blob, type: string, volume = 0.85): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = volume;
    activeAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      resolve();
    };
    audio.onerror = (e) => {
      URL.revokeObjectURL(url);
      activeAudio = null;
      reject(e);
    };
    audio.play().catch(reject);
  });
}
