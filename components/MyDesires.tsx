'use client';

import { useEffect, useState } from 'react';

import { radii, space } from '@/lib/design-tokens';
import DesireComposer from './DesireComposer';

type DesireCategory = 'fun' | 'creative' | 'professional' | 'growth';

interface Desire {
  id: string;
  text: string;
  category: DesireCategory;
  timeWindow: string;
  isOpen: boolean;
  zoneLabel: string | null;
  status: string;
  resonanceCount: number;
  createdAt: string;
}

const CATEGORY_COLORS: Record<DesireCategory, string> = {
  fun: '#7AAA58',
  creative: '#C4A060',
  professional: '#6890B0',
  growth: '#9B6BA0',
};

const TIME_LABELS: Record<string, string> = {
  this_week: 'this week',
  this_month: 'this month',
  no_rush: 'no rush',
};

interface MyDesiresProps {
  onOpenMap?: () => void;
}

export default function MyDesires({ onOpenMap }: MyDesiresProps) {
  const [desires, setDesires] = useState<Desire[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/desires');
      if (res.ok) setDesires(await res.json());
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load on mount only
  useEffect(() => {
    void load();
  }, []);

  async function fulfill(id: string) {
    await fetch(`/api/desires/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fulfill' }),
    });
    setDesires((prev) => prev.filter((d) => d.id !== id));
  }

  async function remove(id: string) {
    await fetch(`/api/desires/${id}`, { method: 'DELETE' });
    setDesires((prev) => prev.filter((d) => d.id !== id));
  }

  async function toggleMap(desire: Desire) {
    if (desire.isOpen) {
      await fetch(`/api/desires/${desire.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      setDesires((prev) => prev.map((d) => (d.id === desire.id ? { ...d, isOpen: false } : d)));
    } else {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch(`/api/desires/${desire.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'open',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        setDesires((prev) => prev.map((d) => (d.id === desire.id ? { ...d, isOpen: true } : d)));
      });
    }
  }

  const font = 'var(--font-handwritten)';

  if (loading) {
    return (
      <p
        className="text-center italic"
        style={{ fontFamily: font, fontSize: '13px', color: '#8A6A4A', opacity: 0.5 }}
      >
        loading…
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p
          style={{
            fontFamily: font,
            fontSize: '12px',
            color: '#8A6A4A',
            opacity: 0.5,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          your desires
        </p>
        <div style={{ display: 'flex', gap: space.sm }}>
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              style={{
                fontFamily: font,
                fontSize: '11px',
                fontWeight: 600,
                color: '#6890B0',
                background: '#6890B010',
                border: '1px solid #6890B030',
                borderRadius: radii.pill,
                padding: `2px 10px`,
                cursor: 'pointer',
              }}
            >
              see map
            </button>
          )}
          <button
            type="button"
            onClick={() => setComposing(true)}
            style={{
              fontFamily: font,
              fontSize: '11px',
              fontWeight: 600,
              color: '#7AAA58',
              background: '#7AAA5810',
              border: '1px solid #7AAA5825',
              borderRadius: radii.pill,
              padding: `2px 10px`,
              cursor: 'pointer',
            }}
          >
            + new
          </button>
        </div>
      </div>

      {/* Composer */}
      {composing && (
        <DesireComposer
          onPosted={() => {
            setComposing(false);
            void load();
          }}
          onCancel={() => setComposing(false)}
        />
      )}

      {/* Empty state */}
      {!composing && desires.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: `${space.xl}px`,
            border: '1px dashed #C4A06025',
            borderRadius: radii.xl,
          }}
        >
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: '15px', color: '#8A6A4A', lineHeight: 1.55 }}
          >
            what do you want to do?
            <br />
            <span style={{ fontSize: '13px', opacity: 0.6 }}>post a desire and find who's in</span>
          </p>
          <button
            type="button"
            onClick={() => setComposing(true)}
            style={{
              marginTop: space.md,
              fontFamily: font,
              fontSize: '13px',
              fontWeight: 700,
              color: '#7AAA58',
              background: '#7AAA5812',
              border: '1px solid #7AAA5830',
              borderRadius: radii.pill,
              padding: `${space.sm}px ${space.lg}px`,
              cursor: 'pointer',
            }}
          >
            write something
          </button>
        </div>
      )}

      {/* Desire cards */}
      {desires.map((d) => {
        const color = CATEGORY_COLORS[d.category] ?? '#C4A060';
        return (
          <div
            key={d.id}
            style={{
              background: `${color}06`,
              border: `1px solid ${color}20`,
              borderRadius: radii.xl,
              padding: `${space.md}px ${space.lg}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {/* Top row: dot + text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <p
                style={{
                  fontFamily: font,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#5C3018',
                  lineHeight: 1.3,
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {d.text}
              </p>
            </div>

            {/* Meta row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 16,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  color,
                  opacity: 0.8,
                  letterSpacing: '0.06em',
                }}
              >
                {d.category}
              </span>
              <span style={{ fontFamily: font, fontSize: '10px', color: '#8A6A4A', opacity: 0.5 }}>
                {TIME_LABELS[d.timeWindow] ?? d.timeWindow}
              </span>
              {d.resonanceCount > 0 && (
                <span
                  style={{ fontFamily: font, fontSize: '10px', color: '#9B6BA0', opacity: 0.8 }}
                >
                  {d.resonanceCount} interested
                </span>
              )}
              {d.isOpen && (
                <span
                  style={{ fontFamily: font, fontSize: '10px', color: '#7AAA58', opacity: 0.8 }}
                >
                  · on map
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, paddingLeft: 16 }}>
              <button
                type="button"
                onClick={() => toggleMap(d)}
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: d.isOpen ? '#D4605A' : '#7AAA58',
                  background: 'transparent',
                  border: `1px solid ${d.isOpen ? '#D4605A30' : '#7AAA5830'}`,
                  borderRadius: radii.pill,
                  padding: `2px 8px`,
                  cursor: 'pointer',
                }}
              >
                {d.isOpen ? 'remove from map' : 'put on map'}
              </button>
              <button
                type="button"
                onClick={() => fulfill(d.id)}
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#C4A060',
                  background: 'transparent',
                  border: '1px solid #C4A06030',
                  borderRadius: radii.pill,
                  padding: `2px 8px`,
                  cursor: 'pointer',
                }}
              >
                done ✓
              </button>
              <button
                type="button"
                onClick={() => remove(d.id)}
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  color: '#8A6A4A',
                  opacity: 0.3,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
