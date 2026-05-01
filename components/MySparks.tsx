'use client';

import { useEffect, useState } from 'react';

import SparkComposer from './SparkComposer';

type SparkCategory = 'fun' | 'creative' | 'professional' | 'growth';

interface Spark {
  id: string;
  text: string;
  category: SparkCategory;
  timeWindow: string;
  isOpen: boolean;
  zoneLabel: string | null;
  status: string;
  resonanceCount: number;
  createdAt: string;
}

const CATEGORY_META: Record<SparkCategory, { label: string; color: string }> = {
  fun: { label: 'fun', color: '#7AAA58' },
  creative: { label: 'creative', color: '#C4A060' },
  professional: { label: 'work', color: '#6890B0' },
  growth: { label: 'growth', color: '#9B6BA0' },
};

const CATEGORY_ORDER: SparkCategory[] = ['fun', 'creative', 'professional', 'growth'];

const TIME_LABELS: Record<string, string> = {
  this_week: 'this week',
  this_month: 'this month',
  no_rush: 'no rush',
};

interface InboundResonance {
  id: string;
  sparkId: string;
  userId: string;
  type: string;
  status: string;
  createdAt: string;
  sparkText?: string;
}

interface MySparksProps {
  onOpenMap?: () => void;
}

const font = 'var(--font-serif)';

export default function MySparks({ onOpenMap }: MySparksProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [inbound, setInbound] = useState<InboundResonance[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [howOpen, setHowOpen] = useState(false);

  async function load() {
    try {
      const [sparksRes, inboundRes] = await Promise.all([
        fetch('/api/sparks'),
        fetch('/api/sparks/resonances/inbound'),
      ]);
      if (sparksRes.ok) {
        const sparkData: Spark[] = await sparksRes.json();
        setSparks(sparkData);
        if (inboundRes.ok) {
          const resonanceData: InboundResonance[] = await inboundRes.json();
          const sparkMap = Object.fromEntries(sparkData.map((s) => [s.id, s.text]));
          setInbound(resonanceData.map((r) => ({ ...r, sparkText: sparkMap[r.sparkId] })));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load on mount only
  useEffect(() => {
    void load();
  }, []);

  async function respondToResonance(
    sparkId: string,
    userId: string,
    status: 'accepted' | 'ignored',
  ) {
    await fetch(`/api/sparks/${sparkId}/resonate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status }),
    });
    setInbound((prev) => prev.filter((r) => !(r.sparkId === sparkId && r.userId === userId)));
  }

  async function fulfill(id: string) {
    await fetch(`/api/sparks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fulfill' }),
    });
    setSparks((prev) => prev.filter((d) => d.id !== id));
  }

  async function remove(id: string) {
    await fetch(`/api/sparks/${id}`, { method: 'DELETE' });
    setSparks((prev) => prev.filter((d) => d.id !== id));
  }

  async function toggleMap(spark: Spark) {
    if (spark.isOpen) {
      await fetch(`/api/sparks/${spark.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      setSparks((prev) => prev.map((d) => (d.id === spark.id ? { ...d, isOpen: false } : d)));
    } else {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await fetch(`/api/sparks/${spark.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'open',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        setSparks((prev) => prev.map((d) => (d.id === spark.id ? { ...d, isOpen: true } : d)));
      });
    }
  }

  if (loading) {
    return (
      <p
        className="text-center italic"
        style={{ fontFamily: font, fontSize: 14, color: '#8A6A4A', opacity: 0.5 }}
      >
        loading…
      </p>
    );
  }

  // Group active sparks by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: sparks.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0);

  const pendingResonances = inbound.filter(
    (r) => r.type === 'join_request' && r.status === 'pending',
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2
          style={{
            fontFamily: font,
            fontSize: 22,
            fontWeight: 700,
            color: '#5C3018',
            letterSpacing: '0.04em',
          }}
        >
          Sparks
        </h2>
        <div className="flex items-center gap-3">
          {onOpenMap && (
            <button
              type="button"
              onClick={onOpenMap}
              style={{
                fontFamily: font,
                fontSize: 11,
                fontWeight: 700,
                color: '#C47830',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.8,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
              }}
            >
              Map new spark
            </button>
          )}
          <button
            type="button"
            onClick={() => setComposing((s) => !s)}
            style={{
              fontFamily: font,
              fontSize: 13,
              fontWeight: 700,
              color: composing ? '#8A6A4A' : '#fff',
              background: composing ? 'transparent' : '#C47830',
              border: composing ? '1px solid #C4A06030' : 'none',
              borderRadius: 20,
              padding: '5px 16px',
              cursor: 'pointer',
            }}
          >
            {composing ? 'cancel' : '+ new spark'}
          </button>
        </div>
      </div>

      {/* How Sparks works */}
      <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3">
        <button
          type="button"
          onClick={() => setHowOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between"
          style={{ background: 'none', border: 'none', padding: 0 }}
          aria-expanded={howOpen}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#5C3018',
            }}
          >
            How Sparks works
          </span>
          <span
            style={{
              transform: howOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#8A6A4A',
            }}
          >
            ▾
          </span>
        </button>
        {howOpen && (
          <div
            className="mt-4 space-y-3 animate-in fade-in duration-150"
            style={{ fontFamily: font, fontSize: 16, lineHeight: 1.55, color: '#5C3018' }}
          >
            <p>
              A <strong>Spark</strong> is an idea, intention, or energy you want to put out into the
              world.
            </p>
            <p>
              Share it openly or within a Circle. Others can resonate with it — no comments, just a
              signal that it landed.
            </p>
          </div>
        )}
      </div>

      {/* Composer */}
      {composing && (
        <SparkComposer
          onPosted={() => {
            setComposing(false);
            void load();
          }}
          onCancel={() => setComposing(false)}
        />
      )}

      {/* Resonance inbox */}
      {pendingResonances.length > 0 && (
        <div className="space-y-3">
          <p
            style={{
              fontFamily: font,
              fontSize: 11,
              fontWeight: 700,
              color: '#9B6BA0',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            resonances
          </p>
          {pendingResonances.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p style={{ fontFamily: font, fontSize: 15, color: '#5C3018', fontWeight: 600 }}>
                  someone wants to join
                </p>
                {r.sparkText && (
                  <p
                    style={{
                      fontFamily: font,
                      fontSize: 13,
                      color: '#8A6A4A',
                      fontStyle: 'italic',
                      marginTop: 2,
                    }}
                  >
                    "{r.sparkText}"
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => respondToResonance(r.sparkId, r.userId, 'accepted')}
                style={{
                  fontFamily: font,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  background: '#9B6BA0',
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 14px',
                  cursor: 'pointer',
                }}
              >
                yes
              </button>
              <button
                type="button"
                onClick={() => respondToResonance(r.sparkId, r.userId, 'ignored')}
                style={{
                  fontFamily: font,
                  fontSize: 16,
                  color: '#8A6A4A',
                  opacity: 0.4,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
          <div style={{ height: 1, background: '#C4A06018', marginTop: 4 }} />
        </div>
      )}

      {/* Empty state */}
      {!composing && sparks.length === 0 && (
        <div className="py-10 text-center space-y-3">
          <p
            style={{
              fontFamily: font,
              fontSize: 18,
              color: '#5C3018',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            what do you want to do?
          </p>
          <p style={{ fontFamily: font, fontSize: 14, color: '#8A6A4A', opacity: 0.65 }}>
            post a spark — find who's in
          </p>
          <button
            type="button"
            onClick={() => setComposing(true)}
            style={{
              marginTop: 8,
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              color: '#C47830',
              background: 'none',
              border: '1px solid #C4783040',
              borderRadius: 20,
              padding: '6px 20px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            Write something
          </button>
        </div>
      )}

      {/* Grouped spark sections */}
      {grouped.map(({ cat, items }) => {
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} className="space-y-3">
            {/* Section label */}
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: meta.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: font,
                  fontSize: 11,
                  fontWeight: 700,
                  color: meta.color,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                }}
              >
                {meta.label}
              </span>
            </div>

            {/* Spark rows */}
            {items.map((d) => (
              <div
                key={d.id}
                className="space-y-2 pl-4"
                style={{ borderLeft: `2px solid ${meta.color}30` }}
              >
                {/* Spark text */}
                <p
                  style={{
                    fontFamily: font,
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#3C2010',
                    lineHeight: 1.35,
                  }}
                >
                  {d.text}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: font, fontSize: 13, color: '#8A6A4A', opacity: 0.65 }}>
                    {TIME_LABELS[d.timeWindow] ?? d.timeWindow}
                  </span>
                  {d.resonanceCount > 0 && (
                    <span
                      style={{ fontFamily: font, fontSize: 13, color: '#9B6BA0', fontWeight: 600 }}
                    >
                      {d.resonanceCount} interested
                    </span>
                  )}
                  {d.isOpen && (
                    <span
                      style={{ fontFamily: font, fontSize: 13, color: '#7AAA58', opacity: 0.85 }}
                    >
                      on map
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleMap(d)}
                    style={{
                      fontFamily: font,
                      fontSize: 12,
                      fontWeight: 600,
                      color: d.isOpen ? '#D4605A' : '#7AAA58',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {d.isOpen ? 'remove from map' : 'put on map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => fulfill(d.id)}
                    style={{
                      fontFamily: font,
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#C4A060',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    done
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    style={{
                      fontFamily: font,
                      fontSize: 15,
                      color: '#8A6A4A',
                      opacity: 0.25,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
