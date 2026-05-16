'use client';

import { useEffect, useRef, useState } from 'react';

interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
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
  autoRestart?: boolean;
}

export interface UseSpeechToTextResult {
  listening: boolean;
  supported: boolean;
  error: string;
  transcript: string;
  /** Call with current field value. The hook appends transcript to baseText
   *  and calls setValue on every interim + final result. */
  start: (baseText: string, setValue: (v: string) => void) => void;
  stop: () => void;
  resetError: () => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextResult {
  const { lang = 'en-US', autoRestart = false } = options;
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef('');
  const finalRef = useRef('');
  const currentValueRef = useRef('');
  const shouldListenRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setValueRef = useRef<((v: string) => void) | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognition() !== null);
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      recRef.current?.abort();
    };
  }, []);

  function clearRestartTimer() {
    if (!restartTimerRef.current) return;
    clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
  }

  function createRecognition(baseText: string, setValue: (v: string) => void) {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    if (recRef.current) {
      recRef.current.abort();
    }
    baseRef.current = baseText;
    currentValueRef.current = baseText;
    setValueRef.current = setValue;
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let interim = '';
      const startIndex = ev.resultIndex ?? 0;
      for (let i = startIndex; i < ev.results.length; i++) {
        const part = ev.results[i][0]?.transcript ?? '';
        if (ev.results[i].isFinal) finalRef.current += part;
        else interim += part;
      }
      const transcript = `${finalRef.current}${interim}`.trim();
      setTranscript(transcript);
      const base = baseRef.current;
      const joined = base
        ? `${base}${base.endsWith('\n') || base.endsWith(' ') ? '' : ' '}${transcript}`
        : transcript;
      currentValueRef.current = joined;
      setValueRef.current?.(joined);
    };
    rec.onerror = (ev) => {
      if (ev.error === 'no-speech' && autoRestart && shouldListenRef.current) {
        setError('');
        return;
      }
      const next =
        ev.error === 'not-allowed'
          ? 'Microphone permission was blocked.'
          : ev.error === 'no-speech'
            ? 'No speech was detected.'
            : ev.message || ev.error || 'Speech recognition stopped.';
      setError(next);
      setListening(false);
    };
    rec.onend = () => {
      recRef.current = null;
      if (autoRestart && shouldListenRef.current) {
        setListening(true);
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          finalRef.current = '';
          createRecognition(currentValueRef.current, setValue);
        }, 180);
        return;
      }
      setListening(false);
    };
    try {
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : 'Could not start recording.');
      setListening(false);
    }
  }

  function start(baseText: string, setValue: (v: string) => void) {
    setError('');
    setTranscript('');
    finalRef.current = '';
    shouldListenRef.current = true;
    clearRestartTimer();
    createRecognition(baseText, setValue);
  }

  function stop() {
    shouldListenRef.current = false;
    clearRestartTimer();
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  function resetError() {
    setError('');
  }

  return { listening, supported, error, transcript, start, stop, resetError };
}
