'use client';

import { useEffect, useRef, useState } from 'react';

import { radii, space } from '@/lib/design-tokens';

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
        setError('Could not get location. Allow location access and try again.');
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

  const font = 'var(--font-handwritten)';
  const activeCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div
      style={{
        background: '#FDFAF5',
        border: `1.5px solid ${activeCategory.color}30`,
        borderRadius: radii.xl,
        padding: `${space.lg}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: space.md,
      }}
    >
      {/* Text input */}
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
          fontSize: '20px',
          fontWeight: 700,
          color: '#5C3018',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          lineHeight: 1.35,
        }}
      />

      {/* Category pills */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            style={{
              fontFamily: font,
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              color: cat.color,
              background: category === cat.id ? `${cat.color}18` : 'transparent',
              border: `1px solid ${category === cat.id ? cat.color : `${cat.color}40`}`,
              borderRadius: radii.pill,
              padding: `3px 10px`,
              cursor: 'pointer',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Time window */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TIME_WINDOWS.map((tw) => (
          <button
            key={tw.id}
            type="button"
            onClick={() => setTimeWindow(tw.id)}
            style={{
              fontFamily: font,
              fontSize: '11px',
              color: '#7A5438',
              background: timeWindow === tw.id ? '#C4A06014' : 'transparent',
              border: `1px solid ${timeWindow === tw.id ? '#C4A06050' : '#C4A06020'}`,
              borderRadius: radii.pill,
              padding: `3px 10px`,
              cursor: 'pointer',
              opacity: timeWindow === tw.id ? 1 : 0.6,
            }}
          >
            {tw.label}
          </button>
        ))}
      </div>

      {/* Open to map toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm }}>
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
            fontSize: '11px',
            fontWeight: 600,
            color: isOpen ? '#fff' : '#7A5438',
            background: isOpen ? '#7AAA58' : 'transparent',
            border: `1px solid ${isOpen ? '#7AAA58' : '#C4A06030'}`,
            borderRadius: radii.pill,
            padding: `3px 12px`,
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
              fontSize: '11px',
              color: '#5C3018',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #C4A06030',
              outline: 'none',
              flex: 1,
              paddingBottom: 2,
            }}
          />
        )}
      </div>

      {error && (
        <p style={{ fontFamily: font, fontSize: '12px', color: '#D4605A', fontStyle: 'italic' }}>
          {error}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: space.sm, justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              fontFamily: font,
              fontSize: '12px',
              color: '#8A6A4A',
              opacity: 0.5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
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
            fontSize: '13px',
            fontWeight: 700,
            color: '#fff',
            background: text.trim() ? activeCategory.color : '#C4A06040',
            border: 'none',
            borderRadius: radii.pill,
            padding: `${space.sm}px ${space.lg}px`,
            cursor: posting || !text.trim() ? 'default' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {posting ? 'posting…' : 'post'}
        </button>
      </div>
    </div>
  );
}
