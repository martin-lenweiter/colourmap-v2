'use client';

import { useState } from 'react';

import {
  ELEVENLABS_VOICES,
  KOKORO_VOICES,
  type KokoroVoice,
  TTS_PROVIDERS,
  type TTSProvider,
  useTTS,
} from '@/lib/hooks/use-tts';

const font = 'var(--font-serif)';

const PROVIDER_COLORS: Record<TTSProvider, string> = {
  browser: '#8A6A4A',
  elevenlabs: '#6890B0',
  kokoro: '#7AAA58',
};

const TEST_PHRASES = [
  'From organisation to clarity.',
  'I am present in this moment.',
  'The pattern is beginning to show.',
  'You are moving. Things have shape. There is a way.',
];

export default function VoiceProviderSelector() {
  const { provider, setProvider, speaking, kokoroStatus, speak, stop, config, setConfig } =
    useTTS();
  const [testPhrase, setTestPhrase] = useState(TEST_PHRASES[0]);
  const [expanded, setExpanded] = useState<TTSProvider | null>(null);

  const color = PROVIDER_COLORS[provider];

  return (
    <div className="space-y-4" style={{ fontFamily: font }}>
      {/* Provider pills */}
      <div className="flex gap-2 flex-wrap">
        {TTS_PROVIDERS.map((p) => {
          const active = provider === p.id;
          const c = PROVIDER_COLORS[p.id];
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProvider(p.id);
                setExpanded(active ? null : p.id);
              }}
              className="flex flex-col items-start rounded-xl px-3 py-2 transition-all"
              style={{
                background: active ? `${c}18` : 'transparent',
                border: `1px solid ${active ? c : '#C4A06030'}`,
                cursor: 'pointer',
                minWidth: 120,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? c : '#8A6A4A',
                }}
              >
                {p.label}
              </span>
              <span style={{ fontSize: 10, color: '#8A6A4A', opacity: 0.6, marginTop: 1 }}>
                {p.id === 'kokoro' && kokoroStatus === 'loading'
                  ? 'loading model…'
                  : p.id === 'kokoro' && kokoroStatus === 'ready'
                    ? 'model ready ✓'
                    : p.id === 'kokoro' && kokoroStatus === 'error'
                      ? 'load failed'
                      : p.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Provider-specific config */}
      {provider === 'browser' && (
        <div className="space-y-3 pl-1">
          <SliderRow
            label="Speed"
            value={config.rate ?? 0.85}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => setConfig({ rate: v })}
            color={color}
          />
          <SliderRow
            label="Pitch"
            value={config.pitch ?? 1.0}
            min={0.5}
            max={2.0}
            step={0.1}
            onChange={(v) => setConfig({ pitch: v })}
            color={color}
          />
        </div>
      )}

      {provider === 'elevenlabs' && (
        <div className="space-y-3 pl-1">
          <div>
            <p
              style={{
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.7,
                marginBottom: 4,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Voice
            </p>
            <div className="flex gap-2 flex-wrap">
              {ELEVENLABS_VOICES.map((v) => {
                const active = config.elevenLabsVoiceId === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setConfig({ elevenLabsVoiceId: v.id })}
                    className="rounded-lg px-2.5 py-1.5 transition-all"
                    style={{
                      background: active ? '#6890B018' : 'transparent',
                      border: `1px solid ${active ? '#6890B0' : '#C4A06025'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        color: active ? '#6890B0' : '#8A6A4A',
                      }}
                    >
                      {v.name}
                    </p>
                    <p style={{ fontSize: 10, color: '#8A6A4A', opacity: 0.55 }}>{v.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
          <SliderRow
            label="Stability"
            value={config.elevenLabsStability ?? 0.45}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setConfig({ elevenLabsStability: v })}
            color={color}
            hint="Lower = more expressive"
          />
          <SliderRow
            label="Clarity"
            value={config.elevenLabsSimilarity ?? 0.8}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => setConfig({ elevenLabsSimilarity: v })}
            color={color}
            hint="How close to original voice"
          />
        </div>
      )}

      {provider === 'kokoro' && (
        <div className="space-y-3 pl-1">
          <div>
            <p
              style={{
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.7,
                marginBottom: 4,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Voice
            </p>
            <div className="flex gap-2 flex-wrap">
              {KOKORO_VOICES.map((v) => {
                const active = config.kokoroVoice === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setConfig({ kokoroVoice: v.id as KokoroVoice })}
                    className="rounded-lg px-2.5 py-1.5 transition-all"
                    style={{
                      background: active ? '#7AAA5818' : 'transparent',
                      border: `1px solid ${active ? '#7AAA58' : '#C4A06025'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        color: active ? '#7AAA58' : '#8A6A4A',
                      }}
                    >
                      {v.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          {kokoroStatus === 'loading' && (
            <p style={{ fontSize: 12, color: '#7AAA58', fontStyle: 'italic' }}>
              downloading model (~80 MB)…
            </p>
          )}
        </div>
      )}

      {/* Volume — shared */}
      <SliderRow
        label="Volume"
        value={config.volume ?? 0.85}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => setConfig({ volume: v })}
        color={color}
      />

      {/* Test */}
      <div className="space-y-2">
        <p
          style={{
            fontSize: 11,
            color: '#8A6A4A',
            opacity: 0.7,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Test phrase
        </p>
        <div className="flex gap-2 flex-wrap mb-2">
          {TEST_PHRASES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setTestPhrase(p)}
              className="rounded-lg px-2.5 py-1.5 transition-all"
              style={{
                background: testPhrase === p ? `${color}18` : 'transparent',
                border: `1px solid ${testPhrase === p ? color : '#C4A06025'}`,
                fontSize: 11,
                color: testPhrase === p ? color : '#8A6A4A',
                cursor: 'pointer',
                fontFamily: font,
              }}
            >
              {p.length > 30 ? `${p.slice(0, 30)}…` : p}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={testPhrase}
            onChange={(e) => setTestPhrase(e.target.value)}
            style={{
              fontFamily: font,
              fontSize: 13,
              color: '#5C3018',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${color}40`,
              outline: 'none',
              flex: 1,
              paddingBottom: 3,
            }}
          />
          {speaking ? (
            <button
              type="button"
              onClick={stop}
              style={{
                fontFamily: font,
                fontSize: 12,
                fontWeight: 700,
                color: '#D4605A',
                background: 'none',
                border: '1px solid #D4605A40',
                borderRadius: 16,
                padding: '4px 14px',
                cursor: 'pointer',
              }}
            >
              stop
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void speak(testPhrase)}
              disabled={provider === 'kokoro' && kokoroStatus === 'loading'}
              style={{
                fontFamily: font,
                fontSize: 12,
                fontWeight: 700,
                color: '#fff',
                background:
                  provider === 'kokoro' && kokoroStatus === 'loading' ? '#C4A06030' : color,
                border: 'none',
                borderRadius: 16,
                padding: '4px 14px',
                cursor: provider === 'kokoro' && kokoroStatus === 'loading' ? 'wait' : 'pointer',
              }}
            >
              play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontSize: 12, color: '#8A6A4A', width: 64, flexShrink: 0 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: color }}
      />
      <span style={{ fontSize: 11, color, fontWeight: 600, width: 32, textAlign: 'right' }}>
        {value.toFixed(2)}
      </span>
      {hint && (
        <span style={{ fontSize: 10, color: '#8A6A4A', opacity: 0.5, width: 120 }}>{hint}</span>
      )}
    </div>
  );
}
