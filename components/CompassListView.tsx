'use client';

import { useEffect, useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   COMPASS LIST VIEW — vertical accordion of the three compasses.
   Each compass (Caring / Doing / Sharing) expands to show its
   4 axes, and each axis expands to show its sub-elements and
   their current state (flowing / stuck / quiet).
   Like LifeCategories — but for compass structure.
   ═══════════════════════════════════════════════════════════ */

interface Axis {
  key: string;
  label: string;
  color: string;
  subs: { label: string; color: string }[];
}

interface Compass {
  id: string;
  label: string;
  letter: string;
  color: string;
  axes: Axis[];
  storageKey: string;
}

const COMPASSES: Compass[] = [
  {
    id: 'caring',
    label: 'Caring',
    letter: 'C.A.R.E',
    color: '#D4805A',
    storageKey: 'colourmap:care-values',
    axes: [
      {
        key: 'care',
        label: 'Care',
        color: '#D4805A',
        subs: [
          { label: 'Health', color: '#D4805A' },
          { label: 'Sport', color: '#C87050' },
          { label: 'Energy', color: '#B86840' },
        ],
      },
      {
        key: 'attitude',
        label: 'Attitude',
        color: '#C4A070',
        subs: [
          { label: 'Confidence', color: '#C4A070' },
          { label: 'Openness', color: '#B89060' },
          { label: 'Gratitude', color: '#A88050' },
        ],
      },
      {
        key: 'rest',
        label: 'Rest',
        color: '#C4906A',
        subs: [
          { label: 'Relaxation', color: '#C4906A' },
          { label: 'Awareness', color: '#B48060' },
          { label: 'Grounding', color: '#A47050' },
        ],
      },
      {
        key: 'emotions',
        label: 'Emotions',
        color: '#B07A5A',
        subs: [],
      },
    ],
  },
  {
    id: 'doing',
    label: 'Doing',
    letter: 'S.T.A.R',
    color: '#7AAA58',
    storageKey: 'colourmap:star-values',
    axes: [
      {
        key: 'structure',
        label: 'Structure',
        color: '#6A8A9A',
        subs: [
          { label: 'Routines', color: '#6A8A9A' },
          { label: 'Systems', color: '#5A7A8A' },
          { label: 'Planning', color: '#4A6A7A' },
        ],
      },
      {
        key: 'target',
        label: 'Target',
        color: '#7A9A7A',
        subs: [
          { label: 'Direction', color: '#7A9A7A' },
          { label: 'Clarity', color: '#6A8A6A' },
          { label: 'Purpose', color: '#5A7A5A' },
        ],
      },
      {
        key: 'action',
        label: 'Action',
        color: '#8A8A6A',
        subs: [
          { label: 'Momentum', color: '#8A8A6A' },
          { label: 'Focus', color: '#7A7A5A' },
          { label: 'Discipline', color: '#6A6A4A' },
        ],
      },
      {
        key: 'resources',
        label: 'Resources',
        color: '#5A7A9A',
        subs: [
          { label: 'Time', color: '#5A7A9A' },
          { label: 'Support', color: '#4A6A8A' },
          { label: 'Tools', color: '#3A5A7A' },
        ],
      },
    ],
  },
  {
    id: 'sharing',
    label: 'Sharing',
    letter: 'S.A.R.E',
    color: '#6B7F4E',
    storageKey: 'colourmap:share-values',
    axes: [
      {
        key: 'share',
        label: 'Share',
        color: '#6B7F4E',
        subs: [],
      },
      {
        key: 'authentic',
        label: 'Authentic',
        color: '#8CA46E',
        subs: [],
      },
      {
        key: 'roots',
        label: 'Roots',
        color: '#7B9560',
        subs: [],
      },
      {
        key: 'express',
        label: 'Express',
        color: '#5F7447',
        subs: [],
      },
    ],
  },
];

type State = 'flowing' | 'stuck' | 'quiet';

function stateLabel(v: number | undefined): State {
  if (v === undefined) return 'quiet';
  // Compass values are 0–8 typically, midpoint ~4
  if (v >= 5) return 'flowing';
  if (v <= 3) return 'stuck';
  return 'quiet';
}

function stateIndicator(state: State): { color: string; label: string } {
  if (state === 'flowing') return { color: '#6A9A50', label: 'flowing' };
  if (state === 'stuck') return { color: '#A05A40', label: 'stuck' };
  return { color: '#8A6A4A', label: 'quiet' };
}

export default function CompassListView() {
  const [openCompass, setOpenCompass] = useState<string | null>(null);
  const [openAxis, setOpenAxis] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    const loaded: Record<string, Record<string, number>> = {};
    for (const compass of COMPASSES) {
      try {
        const raw = localStorage.getItem(compass.storageKey);
        if (raw) loaded[compass.id] = JSON.parse(raw);
      } catch {}
    }
    setValues(loaded);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {COMPASSES.map((compass) => {
        const isOpen = openCompass === compass.id;
        const compassValues = values[compass.id] || {};

        return (
          <div
            key={compass.id}
            style={{
              borderRadius: 20,
              border: `1px solid ${compass.color}${isOpen ? '30' : '15'}`,
              background: isOpen ? `${compass.color}06` : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            {/* Compass header */}
            <button
              type="button"
              onClick={() => {
                setOpenCompass(isOpen ? null : compass.id);
                setOpenAxis(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '14px 18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: compass.color,
                  opacity: 0.8,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  textAlign: 'left',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#5C3018',
                }}
              >
                {compass.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  color: compass.color,
                  opacity: 0.6,
                }}
              >
                {compass.letter}
              </span>
              <span
                style={{
                  color: `${compass.color}80`,
                  fontSize: '14px',
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▾
              </span>
            </button>

            {/* Expanded: axes list */}
            {isOpen && (
              <div
                style={{
                  padding: '0 18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
                className="animate-in fade-in duration-150"
              >
                {compass.axes.map((axis) => {
                  const axisOpen = openAxis === `${compass.id}-${axis.key}`;
                  const axisValue = compassValues[axis.key];
                  const state = stateLabel(axisValue);
                  const indicator = stateIndicator(state);

                  return (
                    <div
                      key={axis.key}
                      style={{
                        borderRadius: 14,
                        border: `1px solid ${axis.color}${axisOpen ? '25' : '10'}`,
                        background: axisOpen ? `${axis.color}08` : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      {/* Axis header */}
                      <button
                        type="button"
                        onClick={() => setOpenAxis(axisOpen ? null : `${compass.id}-${axis.key}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '12px 16px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            background: axis.color,
                            opacity: 0.7,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#5C3018',
                          }}
                        >
                          {axis.label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '12px',
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            color: indicator.color,
                            opacity: state === 'quiet' ? 0.5 : 0.85,
                            textTransform: 'uppercase',
                          }}
                        >
                          {indicator.label}
                        </span>
                        <span
                          style={{
                            color: `${axis.color}60`,
                            fontSize: '12px',
                            transition: 'transform 0.2s',
                            transform: axisOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        >
                          ▾
                        </span>
                      </button>

                      {/* Expanded: sub-elements */}
                      {axisOpen && (
                        <div
                          style={{
                            padding: '0 16px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                          }}
                          className="animate-in fade-in duration-150"
                        >
                          {axis.subs.length > 0 ? (
                            axis.subs.map((sub) => (
                              <div
                                key={sub.label}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 10,
                                  paddingLeft: 4,
                                }}
                              >
                                <span
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: sub.color,
                                    opacity: 0.6,
                                    flexShrink: 0,
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: 'var(--font-serif)',
                                    fontSize: '14px',
                                    color: '#5C3018',
                                    opacity: 0.85,
                                  }}
                                >
                                  {sub.label}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: '14px',
                                color: '#8A6A4A',
                                opacity: 0.6,
                                fontStyle: 'italic',
                                paddingLeft: 4,
                              }}
                            >
                              open to explore
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
