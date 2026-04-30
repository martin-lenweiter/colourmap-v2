'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   LifePathDots — three F / D / S dots, each expanding to show
   the four axes for that compass in a gradient swatch row,
   plus the user's life domains (categories) tagged to it.

   Design reference: life-scan sober-degrade squares.
   Four items per dot, bottom item is blue (D) / olive (S) /
   rich warm (F) — not grey.
   ═══════════════════════════════════════════════════════════ */

type Compass = 'feeling' | 'doing' | 'sharing';
type InnerView = 'horizontal' | 'vertical';

interface AxisItem {
  name: string;
  color: string;
}

const AXES: Record<Compass, { label: string; dotColor: string; items: AxisItem[] }> = {
  feeling: {
    label: 'F',
    dotColor: '#D4805A',
    items: [
      { name: 'Care', color: '#D4B088' },
      { name: 'Attitude', color: '#D09060' },
      { name: 'Presence', color: '#C47850' },
      { name: 'Emotions', color: '#B85A30' },
    ],
  },
  doing: {
    label: 'D',
    dotColor: '#6890B0',
    items: [
      { name: 'Clarity', color: '#9AABB8' },
      { name: 'Order', color: '#7A98B0' },
      { name: 'Target', color: '#5A88A8' },
      { name: 'Action', color: '#4878A8' },
    ],
  },
  sharing: {
    label: 'S',
    dotColor: '#6B7F4E',
    items: [
      { name: 'Voice', color: '#9AAF80' },
      { name: 'Listen', color: '#7A9860' },
      { name: 'Bond', color: '#5A8840' },
      { name: 'Express', color: '#4A6A2A' },
    ],
  },
};

const COMPASS_ORDER: Compass[] = ['feeling', 'doing', 'sharing'];

interface LifeCategory {
  id: string;
  name: string;
  color: string;
  compass?: string | null;
}

const CATS_KEY = 'colourmap:life-categories';

export default function LifePathDots() {
  const [open, setOpen] = useState<Compass | null>(null);
  const [innerView, setInnerView] = useState<InnerView>('horizontal');
  const [categories, setCategories] = useState<LifeCategory[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(CATS_KEY);
        if (raw) setCategories(JSON.parse(raw));
      } catch {}
    };
    load();
    fetch('/api/life-categories')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          try {
            localStorage.setItem(CATS_KEY, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (id: Compass) => setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      {/* Three dots row */}
      <div className="flex items-start justify-center gap-8">
        {COMPASS_ORDER.map((id) => {
          const axis = AXES[id];
          const isOpen = open === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="flex flex-col items-center gap-2 cursor-pointer"
              style={{ background: 'none', border: 'none' }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: axis.dotColor,
                  opacity: isOpen ? 1 : 0.5,
                  display: 'block',
                  transition: 'opacity 0.2s, transform 0.2s',
                  transform: isOpen ? 'scale(1.25)' : 'scale(1)',
                  boxShadow: isOpen ? `0 0 8px ${axis.dotColor}60` : 'none',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: isOpen ? 700 : 500,
                  color: isOpen ? axis.dotColor : '#8A6A4A',
                  letterSpacing: '0.1em',
                  opacity: isOpen ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                }}
              >
                {axis.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="animate-in fade-in duration-150 space-y-4">
          {/* H/V toggle */}
          <div className="flex justify-center gap-1">
            {(['horizontal', 'vertical'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setInnerView(v)}
                style={{
                  background: innerView === v ? `${AXES[open].dotColor}18` : 'transparent',
                  border: `1px solid ${innerView === v ? `${AXES[open].dotColor}40` : `${AXES[open].dotColor}18`}`,
                  borderRadius: 20,
                  padding: '2px 10px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: AXES[open].dotColor,
                  opacity: innerView === v ? 1 : 0.45,
                }}
              >
                {v === 'horizontal' ? '—' : '|'}
              </button>
            ))}
          </div>

          {/* Four axis items */}
          <AxisView axis={AXES[open]} view={innerView} />

          {/* Life domains for this compass */}
          <DomainDots compass={open} categories={categories} dotColor={AXES[open].dotColor} />
        </div>
      )}
    </div>
  );
}

function AxisView({
  axis,
  view,
}: {
  axis: { label: string; dotColor: string; items: AxisItem[] };
  view: InnerView;
}) {
  if (view === 'horizontal') {
    return (
      <div className="flex justify-center gap-6">
        {axis.items.map((item, i) => (
          <div key={item.name} className="flex flex-col items-center gap-2">
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                background: item.color,
                display: 'block',
                opacity: 0.85 + i * 0.05,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                fontWeight: 500,
                color: item.color,
                letterSpacing: '0.06em',
                textAlign: 'center',
              }}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {axis.items.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: item.color,
              display: 'block',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '14px',
              fontWeight: 500,
              color: item.color,
              letterSpacing: '0.06em',
            }}
          >
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function DomainDots({
  compass,
  categories,
  dotColor,
}: {
  compass: Compass;
  categories: LifeCategory[];
  dotColor: string;
}) {
  const schemaCompass = compass === 'feeling' ? 'caring' : compass;
  const domains = categories.filter((c) => c.compass === schemaCompass || c.compass === compass);

  if (domains.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 px-2">
      {domains.map((d) => (
        <div key={d.id} className="flex flex-col items-center gap-1.5">
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: d.color,
              display: 'block',
              opacity: 0.75,
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              fontWeight: 500,
              color: dotColor,
              opacity: 0.7,
              letterSpacing: '0.04em',
              textAlign: 'center',
              maxWidth: 56,
            }}
          >
            {d.name}
          </span>
        </div>
      ))}
    </div>
  );
}
