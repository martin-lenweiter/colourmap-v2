'use client';

import { useEffect, useRef, useState } from 'react';

import { radii, space } from '@/lib/design-tokens';

type SparkCategory = 'fun' | 'creative' | 'professional' | 'growth';
type SparkTimeWindow = 'this_week' | 'this_month' | 'no_rush';

interface Spark {
  id: string;
  userId: string;
  text: string;
  category: SparkCategory;
  timeWindow: string;
  isOpen: boolean;
  status: string;
  resonanceCount: number;
  createdAt: string;
}

interface Resonance {
  id: string;
  sparkId: string;
  userId: string;
  type: string;
  status: string;
}

const CATEGORY_COLORS: Record<SparkCategory, string> = {
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

interface CircleSparksProps {
  circleId: string;
  meId: string;
  circleColor: string;
}

export default function CircleSparks({ circleId, meId, circleColor }: CircleSparksProps) {
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [myResonances, setMyResonances] = useState<Set<string>>(new Set());
  const [composing, setComposing] = useState(false);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<SparkCategory>('fun');
  const [timeWindow, setTimeWindow] = useState<SparkTimeWindow>('this_week');
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    try {
      const res = await fetch(`/api/sparks?circleId=${circleId}`);
      if (res.ok) {
        const data: Spark[] = await res.json();
        setSparks(data);
      }
    } catch {
      /* silent */
    }
  }

  async function loadMyResonances() {
    try {
      const res = await fetch('/api/sparks/resonances/mine');
      if (res.ok) {
        const data: Resonance[] = await res.json();
        setMyResonances(new Set(data.map((r) => r.sparkId)));
      }
    } catch {
      /* silent */
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load on mount only
  useEffect(() => {
    void load();
    void loadMyResonances();
  }, [circleId]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  async function post() {
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    try {
      const res = await fetch('/api/sparks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed, category, timeWindow, circleId }),
      });
      if (res.ok) {
        setText('');
        setComposing(false);
        void load();
      }
    } finally {
      setPosting(false);
    }
  }

  async function resonate(sparkId: string) {
    if (myResonances.has(sparkId)) return;
    setMyResonances((prev) => new Set([...prev, sparkId]));
    setSparks((prev) =>
      prev.map((s) => (s.id === sparkId ? { ...s, resonanceCount: s.resonanceCount + 1 } : s)),
    );
    await fetch(`/api/sparks/${sparkId}/resonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'resonate' }),
    });
  }

  async function fulfill(sparkId: string) {
    await fetch(`/api/sparks/${sparkId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fulfill' }),
    });
    setSparks((prev) => prev.filter((s) => s.id !== sparkId));
  }

  const font = 'var(--font-handwritten)';
  const activeCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p
          style={{
            fontFamily: font,
            fontSize: '10px',
            fontWeight: 700,
            color: circleColor,
            opacity: 0.5,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          sparks
        </p>
        {!composing && (
          <button
            type="button"
            onClick={() => {
              setComposing(true);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            style={{
              fontFamily: font,
              fontSize: '11px',
              fontWeight: 600,
              color: circleColor,
              background: `${circleColor}10`,
              border: `1px solid ${circleColor}25`,
              borderRadius: radii.pill,
              padding: `2px 10px`,
              cursor: 'pointer',
            }}
          >
            + spark
          </button>
        )}
      </div>

      {/* Composer */}
      {composing && (
        <div
          style={{
            background: `${activeCategory.color}06`,
            border: `1.5px solid ${activeCategory.color}25`,
            borderRadius: radii.xl,
            padding: `${space.md}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
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
              fontSize: '18px',
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
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  fontWeight: 600,
                  color: cat.color,
                  background: category === cat.id ? `${cat.color}18` : 'transparent',
                  border: `1px solid ${category === cat.id ? cat.color : `${cat.color}35`}`,
                  borderRadius: radii.pill,
                  padding: `2px 8px`,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {TIME_WINDOWS.map((tw) => (
              <button
                key={tw.id}
                type="button"
                onClick={() => setTimeWindow(tw.id)}
                style={{
                  fontFamily: font,
                  fontSize: '10px',
                  color: '#7A5438',
                  background: timeWindow === tw.id ? '#C4A06014' : 'transparent',
                  border: `1px solid ${timeWindow === tw.id ? '#C4A06050' : '#C4A06020'}`,
                  borderRadius: radii.pill,
                  padding: `2px 8px`,
                  cursor: 'pointer',
                  opacity: timeWindow === tw.id ? 1 : 0.55,
                }}
              >
                {tw.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setComposing(false);
                setText('');
              }}
              style={{
                fontFamily: font,
                fontSize: '11px',
                color: '#8A6A4A',
                opacity: 0.45,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              cancel
            </button>
            <button
              type="button"
              onClick={post}
              disabled={posting || !text.trim()}
              style={{
                fontFamily: font,
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                background: text.trim() ? activeCategory.color : '#C4A06040',
                border: 'none',
                borderRadius: radii.pill,
                padding: `4px 14px`,
                cursor: posting || !text.trim() ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {posting ? '…' : 'post'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!composing && sparks.length === 0 && (
        <p
          className="italic text-center"
          style={{ fontFamily: font, fontSize: '12px', color: '#8A6A4A', opacity: 0.35 }}
        >
          no sparks yet — what does the group want to do?
        </p>
      )}

      {/* Spark cards */}
      {sparks.map((s) => {
        const color = CATEGORY_COLORS[s.category] ?? '#C4A060';
        const isMine = s.userId === meId;
        const hasResonated = myResonances.has(s.id);

        return (
          <div
            key={s.id}
            style={{
              background: `${color}06`,
              border: `1px solid ${color}18`,
              borderRadius: radii.xl,
              padding: `${space.md}px`,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
              <p
                style={{
                  fontFamily: font,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#5C3018',
                  lineHeight: 1.3,
                  flex: 1,
                  wordBreak: 'break-word',
                }}
              >
                {s.text}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                paddingLeft: 14,
                flexWrap: 'wrap',
              }}
            >
              <span style={{ fontFamily: font, fontSize: '10px', color, opacity: 0.7 }}>
                {s.category}
              </span>
              <span style={{ fontFamily: font, fontSize: '10px', color: '#8A6A4A', opacity: 0.45 }}>
                {TIME_LABELS[s.timeWindow] ?? s.timeWindow}
              </span>
              {s.resonanceCount > 0 && (
                <span
                  style={{ fontFamily: font, fontSize: '10px', color: '#9B6BA0', opacity: 0.8 }}
                >
                  {s.resonanceCount} resonating
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 5, paddingLeft: 14, marginTop: 2 }}>
              {!isMine && (
                <button
                  type="button"
                  onClick={() => resonate(s.id)}
                  style={{
                    fontFamily: font,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: hasResonated ? '#9B6BA0' : '#7A5438',
                    background: hasResonated ? '#9B6BA010' : 'transparent',
                    border: `1px solid ${hasResonated ? '#9B6BA030' : '#C4A06025'}`,
                    borderRadius: radii.pill,
                    padding: `2px 8px`,
                    cursor: hasResonated ? 'default' : 'pointer',
                  }}
                >
                  {hasResonated ? '✓ resonating' : 'resonate'}
                </button>
              )}
              {isMine && (
                <button
                  type="button"
                  onClick={() => fulfill(s.id)}
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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
