'use client';

import { useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface UseSpeechToTextOptions {
  lang?: string;
}

export interface UseSpeechToTextResult {
  listening: boolean;
  supported: boolean;
  /** Call with current field value. The hook appends transcript to baseText
   *  and calls setValue on every interim + final result. */
  start: (baseText: string, setValue: (v: string) => void) => void;
  stop: () => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextResult {
  const { lang = 'en-US' } = options;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef('');
  const setValueRef = useRef<((v: string) => void) | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
  }, []);

  function start(baseText: string, setValue: (v: string) => void) {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    if (recRef.current) {
      recRef.current.abort();
    }
    baseRef.current = baseText;
    setValueRef.current = setValue;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let transcript = '';
      for (let i = 0; i < ev.results.length; i++) {
        transcript += ev.results[i][0].transcript;
      }
      const base = baseRef.current;
      const joined = base
        ? `${base}${base.endsWith('\n') || base.endsWith(' ') ? '' : ' '}${transcript}`
        : transcript;
      setValueRef.current?.(joined);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch {
      /* already started or permission denied */
    }
  }

  function stop() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  return { listening, supported, start, stop };
}
