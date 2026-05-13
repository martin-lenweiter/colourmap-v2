'use client';

import { useState } from 'react';
import { getProgramByKey } from '@/lib/programs';
import type { Insight } from './InsightPill';
import LearningProgram from './LearningProgram';

const SERIF = 'var(--font-serif)';
const PT = 'var(--palette-panel-text, rgba(196,160,96,0.88))';
const PM = 'var(--palette-panel-muted, rgba(196,160,96,0.55))';
const PB = 'var(--panel-border, rgba(196,160,96,0.18))';

function todayIndex(len: number) {
  return Math.floor(Date.now() / 86400000) % len;
}

type Props = {
  insights: Insight[];
  coachId?: string;
  coachHeadline?: string;
  coachBody?: string;
  programKey?: string;
  onOpenHub?: () => void;
};

export default function EmotionLearnPill({ insights, programKey, onOpenHub }: Props) {
  const [open, setOpen] = useState(false);
  const [showDeeper, setShowDeeper] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const insight = insights[todayIndex(insights.length)];
  const program = programKey ? getProgramByKey(programKey) : null;

  if (!insight) return null;

  return (
    <>
      <div
        style={{
          borderRadius: 14,
          border: `1px solid var(--panel-border, rgba(196,160,96,0.18))`,
          background: 'var(--palette-l3-bg, rgba(10,6,3,0.6))',
          overflow: 'hidden',
          cursor: open ? 'default' : 'pointer',
          width: '100%',
        }}
        onClick={!open ? () => setOpen(true) : undefined}
      >
        {/* ── Pill / header row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: open ? 'flex-start' : 'center',
            gap: 10,
            padding: open ? '12px 14px 8px' : '9px 18px',
            transition: 'padding 0.18s',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
            <div
              style={{
                fontFamily: SERIF,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--palette-panel-text, #C8A858)',
              }}
            >
              insight
            </div>
            {open && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 15,
                  fontStyle: 'italic',
                  color: PT,
                  lineHeight: 1.45,
                  marginTop: 4,
                }}
              >
                {insight.hook}
              </div>
            )}
          </div>
          {!open && (
            <span style={{ fontFamily: SERIF, fontSize: 11, color: PM, flexShrink: 0 }}>···</span>
          )}
          {open && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                setShowDeeper(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: PM,
                fontSize: 18,
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* ── Expanded body ── */}
        {open && (
          <div
            style={{
              padding: '0 14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              alignItems: 'center',
            }}
          >
            {/* body — short paragraphs */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                width: '100%',
                textAlign: 'center',
              }}
            >
              {insight.body.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  style={{ fontFamily: SERIF, fontSize: 15, color: PT, lineHeight: 1.8, margin: 0 }}
                >
                  {para}
                </p>
              ))}
            </div>

            {insight.deeper && !showDeeper && (
              <button
                type="button"
                onClick={() => setShowDeeper(true)}
                style={{
                  background: 'none',
                  border: `1px solid ${PB}`,
                  borderRadius: 999,
                  padding: '5px 20px',
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: PM,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                }}
              >
                go deeper
              </button>
            )}

            {showDeeper && insight.deeper && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  width: '100%',
                  textAlign: 'center',
                  borderTop: `1px solid ${PB}`,
                  paddingTop: 12,
                }}
              >
                {insight.deeper.split('\n\n').map((para, i) => (
                  <p
                    key={i}
                    style={{
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: PT,
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* action row — program + hub link */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {program && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProgramOpen(true);
                  }}
                  style={{
                    background: 'none',
                    border: `1px solid ${PB}`,
                    borderRadius: 999,
                    padding: '5px 18px',
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: PM,
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                  }}
                >
                  {program.domain}
                </button>
              )}
              {onOpenHub && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenHub();
                  }}
                  style={{
                    background: 'none',
                    border: `1px solid ${PB}`,
                    borderRadius: 999,
                    padding: '5px 18px',
                    fontFamily: SERIF,
                    fontSize: 12,
                    color: PM,
                    cursor: 'pointer',
                    letterSpacing: '0.08em',
                  }}
                >
                  all programs →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {programOpen && program && (
        <LearningProgram program={program} onClose={() => setProgramOpen(false)} />
      )}
    </>
  );
}
