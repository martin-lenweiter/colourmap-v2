'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ELEVENLABS_VOICES,
  getKokoroStatus,
  KOKORO_VOICES,
  type KokoroStatus,
  type KokoroVoice,
  onKokoroStatusChange,
  preloadKokoro,
  speakText,
  stopSpeaking,
  TTS_PROVIDERS,
  type TTSConfig,
  type TTSProvider,
} from '@/lib/services/tts';

export type { KokoroStatus, KokoroVoice, TTSConfig, TTSProvider };
// Re-export config constants so components can import from lib/hooks
// without crossing the lib/services architecture boundary.
export { ELEVENLABS_VOICES, KOKORO_VOICES, TTS_PROVIDERS };

interface UseTTSReturn {
  provider: TTSProvider;
  setProvider: (p: TTSProvider) => void;
  speaking: boolean;
  kokoroStatus: KokoroStatus;
  speak: (text: string, overrides?: Partial<TTSConfig>) => Promise<void>;
  stop: () => void;
  config: TTSConfig;
  setConfig: (c: Partial<TTSConfig>) => void;
}

const STORAGE_KEY = 'colourmap:tts-provider';

export function useTTS(): UseTTSReturn {
  const [provider, setProviderState] = useState<TTSProvider>(() => {
    if (typeof window === 'undefined') return 'browser';
    return (localStorage.getItem(STORAGE_KEY) as TTSProvider) ?? 'browser';
  });
  const [speaking, setSpeaking] = useState(false);
  const [kokoroStatus, setKokoroStatus] = useState<KokoroStatus>(getKokoroStatus);
  const [config, setConfigState] = useState<TTSConfig>({
    provider,
    rate: 0.85,
    pitch: 1.0,
    volume: 0.85,
    elevenLabsVoiceId: '21m00Tcm4TlvDq8ikWAM',
    elevenLabsModel: 'eleven_multilingual_v2',
    elevenLabsStability: 0.45,
    elevenLabsSimilarity: 0.8,
    kokoroVoice: 'af_heart' as KokoroVoice,
  });
  const abortRef = useRef(false);

  useEffect(() => onKokoroStatusChange(setKokoroStatus), []);

  function setProvider(p: TTSProvider) {
    setProviderState(p);
    setConfigState((prev) => ({ ...prev, provider: p }));
    localStorage.setItem(STORAGE_KEY, p);
    if (p === 'kokoro') preloadKokoro();
  }

  function setConfig(c: Partial<TTSConfig>) {
    setConfigState((prev) => ({ ...prev, ...c }));
  }

  const speak = useCallback(
    async (text: string, overrides?: Partial<TTSConfig>) => {
      abortRef.current = false;
      setSpeaking(true);
      try {
        await speakText(text, { ...config, provider, ...overrides });
      } catch {
        // swallow — user may have stopped or provider unavailable
      } finally {
        if (!abortRef.current) setSpeaking(false);
      }
    },
    [config, provider],
  );

  const stop = useCallback(() => {
    abortRef.current = true;
    setSpeaking(false);
    stopSpeaking();
  }, []);

  return { provider, setProvider, speaking, kokoroStatus, speak, stop, config, setConfig };
}
