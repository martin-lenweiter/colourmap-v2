'use client';

import { useEffect, useRef, useState } from 'react';

type SparkCategory = 'fun' | 'creative' | 'professional' | 'growth';
type SparkTimeWindow = 'this_week' | 'this_month' | 'no_rush';

const CATEGORIES: { id: SparkCategory; label: string; color: string }[] = [
  { id: 'fun', label: 'fun', color: '#7AAA58' },
  { id: 'creative', label: 'creative', color: '#C4A060' },
  { id: 'professional', label: 'work', color: '#6890B0' },
  { id: 'growth', label: 'growth', color: '#9B6BA0' },
];

const TIME_WINDOWS: { id: SparkTimeWindow; label: string }[] = [
  { id: 'this_week', label: 'this week' },
  { id: 'this_month', label: 'this month' },
  { id: 'no_rush', label: 'no rush' },
];

interface SparkComposerProps {
  circleId?: string;
  onPosted?: () => void;
  onCancel?: () => void;
}

const font = 'var(--font-serif)';

export default function SparkComposer({ circleId, onPosted, onCancel }: SparkComposerProps) {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<SparkCategory>('fun');
  const [timeWindow, setTimeWindow] = useState<SparkTimeWindow>('this_week');
  const [isOpen, setIsOpen] = useState(false);
  const [zoneLabel, setZoneLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  async function locateMe() {
    if (!navigator.geolocation) {
      setError('Geolocation not available.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsOpen(true);
        setLocating(false);
      },
      () => {
        setError('Could not get location.');
        setLocating(false);
      },
      { timeout: 8000 },
    );
  }

  async function post() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Write what you want to do.');
      return;
    }
    if (isOpen && !coords) {
      setError('Tap "put on map" to share your location first.');
      return;
    }
    setPosting(true);
    setError('');
    try {
      const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          category,
          timeWindow,
          circleId: circleId ?? null,
          isOpen,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          zoneLabel: zoneLabel.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Could not post. Try again.');
        return;
      }
      onPosted?.();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPosting(false);
    }
  }

  const activeCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="space-y-5 py-2">
      {/* Text input — borderless, large */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          autoResize(e.target);
        }}
        placeholder="what do you want to do?"
        rows={1}
        maxLength={200}
        style={{
          fontFamily: font,
          fontSize: 22,
          fontWeight: 700,
          color: '#3C2010',
          background: 'transparent',
          border: 'none',
          borderBottom: `2px solid ${activeCategory.color}40`,
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          lineHeight: 1.35,
          paddingBottom: 6,
        }}
      />

      {/* Category — dots with labels */}
      <div className="flex items-center gap-5">
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 cursor-pointer transition-all"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <span
                style={{
                  width: active ? 18 : 14,
                  height: active ? 18 : 14,
                  borderRadius: '50%',
                  background: cat.color,
                  opacity: active ? 1 : 0.35,
                  display: 'block',
                  transition: 'all 0.15s',
                  boxShadow: active ? `0 3px 10px -2px ${cat.color}` : 'none',
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  color: active ? cat.color : '#8A6A4A',
                  opacity: active ? 1 : 0.55,
                  letterSpacing: '0.04em',
                }}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time window */}
      <div className="flex items-center gap-4">
        {TIME_WINDOWS.map((tw) => {
          const active = timeWindow === tw.id;
          return (
            <button
              key={tw.id}
              type="button"
              onClick={() => setTimeWindow(tw.id)}
              style={{
                fontFamily: font,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? '#5C3018' : '#8A6A4A',
                opacity: active ? 1 : 0.5,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              {tw.label}
            </button>
          );
        })}
      </div>

      {/* Map toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={
            isOpen
              ? () => {
                  setIsOpen(false);
                  setCoords(null);
                }
              : locateMe
          }
          disabled={locating}
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: 600,
            color: isOpen ? '#7AAA58' : '#8A6A4A',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: locating ? 'wait' : 'pointer',
            opacity: locating ? 0.5 : 1,
          }}
        >
          {locating ? 'locating…' : isOpen ? '✓ on map' : 'put on map'}
        </button>
        {isOpen && (
          <input
            type="text"
            value={zoneLabel}
            onChange={(e) => setZoneLabel(e.target.value)}
            placeholder="zone name (optional)"
            maxLength={80}
            style={{
              fontFamily: font,
              fontSize: 13,
              color: '#5C3018',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #C4A06025',
              outline: 'none',
              flex: 1,
              paddingBottom: 2,
            }}
          />
        )}
      </div>

      {error && (
        <p style={{ fontFamily: font, fontSize: 13, color: '#D4605A', fontStyle: 'italic' }}>
          {error}
        </p>
      )}

      {/* Post button */}
      <div className="flex items-center justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              fontFamily: font,
              fontSize: 13,
              color: '#8A6A4A',
              opacity: 0.45,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            cancel
          </button>
        )}
        <button
          type="button"
          onClick={post}
          disabled={posting || !text.trim()}
          style={{
            fontFamily: font,
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            background: text.trim() ? activeCategory.color : '#C4A06035',
            border: 'none',
            borderRadius: 20,
            padding: '7px 24px',
            cursor: posting || !text.trim() ? 'default' : 'pointer',
            transition: 'background 0.15s',
            marginLeft: 'auto',
          }}
        >
          {posting ? 'posting…' : 'post'}
        </button>
      </div>
    </div>
  );
}
