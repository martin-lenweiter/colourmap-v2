'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BILLY_QUEST_PANELS } from '@/lib/billy-comic';

const SERIF = 'var(--font-serif)';
const BILLY_CHAPTERS = [
  { label: '1 Departure', start: 0 },
  { label: '2 New Babylon', start: 13 },
  { label: '3 Underground', start: 65 },
  { label: '4 Desert', start: 112 },
] as const;

function cream(alpha: number) {
  return `rgba(255, 238, 196, ${alpha})`;
}

export default function BillyInfiniteComic() {
  const router = useRouter();
  const [intro, setIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const [textStep, setTextStep] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const panel = BILLY_QUEST_PANELS[index];
  const revealed = textStep > 0;
  const complete = index === BILLY_QUEST_PANELS.length - 1 && revealed;

  function advance() {
    if (!revealed) {
      setTextStep(panel.text.length);
      return;
    }
    if (textStep < panel.text.length) {
      setTextStep(textStep + 1);
      return;
    }
    if (index < BILLY_QUEST_PANELS.length - 1) {
      setIndex(index + 1);
      setTextStep(0);
    }
  }

  function goBack() {
    if (index === 0) {
      setTextStep(0);
      return;
    }
    setIndex(index - 1);
    setTextStep(0);
  }

  function choose(choiceId: string) {
    setChosen((existing) => ({ ...existing, [panel.id]: choiceId }));
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        margin: '0 auto',
        background: '#090704',
        color: cream(0.96),
        fontFamily: SERIF,
      }}
    >
      <div
        style={{
          maxWidth: 430,
          minHeight: '100svh',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          background:
            'radial-gradient(circle at 50% 0%, rgba(214, 162, 74, 0.18), transparent 42%), #090704',
        }}
      >
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '74px minmax(0, 1fr) 92px',
            alignItems: 'center',
            gap: 8,
            padding: '12px 14px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 221, 150, 0.12)',
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 222, 164, 0.58)',
            }}
          >
            {intro ? 'Intro' : `${index + 1} / ${BILLY_QUEST_PANELS.length}`}
          </div>
          <h1
            style={{
              margin: 0,
              minWidth: 0,
              textAlign: 'center',
              fontFamily: SERIF,
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.05,
              color: cream(0.94),
              overflowWrap: 'anywhere',
            }}
          >
            Pineapple Planet
          </h1>
          <button
            type="button"
            onClick={() => router.push('/education')}
            style={{
              justifySelf: 'end',
              minWidth: 82,
              border: '1px solid rgba(255, 205, 126, 0.34)',
              borderRadius: 999,
              background: 'rgba(255, 190, 82, 0.1)',
              color: cream(0.82),
              fontFamily: SERIF,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '7px 10px',
            }}
          >
            Education
          </button>
        </header>

        <section
          style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            alignItems: 'center',
            padding: 12,
          }}
        >
          {intro ? (
            <div>
              <div
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  boxShadow: '0 22px 60px rgba(0,0,0,0.38)',
                  background: '#130d07',
                }}
              >
                <img
                  src="/entertainment/billy/quest-for-juice/panel-9.webp"
                  alt="Pineapple Planet intro"
                  fetchPriority="high"
                  decoding="async"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: '16px 15px',
                  background: 'rgba(39, 22, 11, 0.68)',
                  border: '1px solid rgba(255, 220, 148, 0.22)',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: cream(0.96),
                    fontSize: 25,
                    lineHeight: 1.08,
                  }}
                >
                  Pineapple Planet
                </h2>
                <p
                  style={{
                    margin: '9px 0 0',
                    color: 'rgba(255, 217, 140, 0.86)',
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}
                >
                  Billy is looking for The Juice, a sofa that makes sense, and a world that keeps
                  getting wider than expected.
                </p>
                <button
                  type="button"
                  onClick={() => setIntro(false)}
                  style={{
                    width: '100%',
                    marginTop: 14,
                    border: '1px solid rgba(255, 205, 126, 0.42)',
                    background: 'rgba(255, 190, 82, 0.14)',
                    color: cream(0.92),
                    fontFamily: SERIF,
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '12px 14px',
                  }}
                >
                  Begin the quest
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                borderRadius: 0,
                boxShadow: '0 22px 60px rgba(0,0,0,0.38)',
                background: '#130d07',
              }}
            >
              <img
                src={panel.image}
                alt={`${panel.title} comic panel`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                }}
              />
              <button
                type="button"
                onClick={goBack}
                aria-label="Previous Billy comic panel"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 1,
                  width: '42%',
                  border: 0,
                  padding: 0,
                  background: 'transparent',
                  cursor: index === 0 && !revealed ? 'default' : 'w-resize',
                }}
              />
              <button
                type="button"
                onClick={advance}
                aria-label={
                  !revealed
                    ? 'Reveal Billy comic text'
                    : complete
                      ? 'Finish Billy comic'
                      : 'Next Billy comic beat'
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1,
                  width: '58%',
                  border: 0,
                  padding: 0,
                  background: 'transparent',
                  cursor: 'e-resize',
                }}
              />

              {revealed && (
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 12,
                    zIndex: 2,
                    padding: '15px 15px',
                    background: 'rgba(39, 22, 11, 0.82)',
                    border: '1px solid rgba(255, 220, 148, 0.24)',
                    boxShadow: '0 18px 44px rgba(0,0,0,0.32)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    style={{
                      marginBottom: 7,
                      color: cream(0.96),
                      fontSize: 20,
                      fontWeight: 800,
                      lineHeight: 1.12,
                    }}
                  >
                    {panel.title}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: 'rgba(255, 217, 140, 0.9)',
                      fontSize: 15.5,
                      lineHeight: 1.48,
                    }}
                  >
                    {panel.text.slice(0, textStep).join(' ')}
                  </p>
                  {panel.choices && textStep >= panel.text.length && (
                    <div style={{ display: 'grid', gap: 7, marginTop: 11 }}>
                      {panel.choices.map((choice) => {
                        const active = chosen[panel.id] === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              choose(choice.id);
                            }}
                            style={{
                              border: `1px solid rgba(255, 205, 126, ${active ? 0.62 : 0.24})`,
                              background: active
                                ? 'rgba(255, 190, 82, 0.2)'
                                : 'rgba(255, 238, 196, 0.06)',
                              color: cream(active ? 0.98 : 0.78),
                              fontFamily: SERIF,
                              fontSize: 13.5,
                              padding: '9px 10px',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            {choice.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '10px 14px 14px',
            borderTop: '1px solid rgba(255, 221, 150, 0.1)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={intro ? () => router.push('/education') : goBack}
            style={{
              border: 0,
              background: 'transparent',
              color: 'rgba(255, 222, 164, 0.58)',
              fontFamily: SERIF,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            {intro ? 'Education' : 'prev'}
          </button>
          <div
            style={{
              minWidth: 116,
              textAlign: 'center',
              fontFamily: SERIF,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 222, 164, 0.68)',
            }}
          >
            {intro ? 'Intro' : `Page ${index + 1}`}
            {!intro && <span style={{ opacity: 0.45 }}> / {BILLY_QUEST_PANELS.length}</span>}
          </div>
          <button
            type="button"
            onClick={intro ? () => setIntro(false) : advance}
            style={{
              border: 0,
              background: 'transparent',
              color: 'rgba(255, 222, 164, 0.7)',
              fontFamily: SERIF,
              fontSize: 13,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            {intro
              ? 'begin'
              : !revealed
                ? 'text'
                : textStep < panel.text.length
                  ? 'more'
                  : complete
                    ? 'done'
                    : 'next'}
          </button>
        </footer>
        {!intro && (
          <nav
            aria-label="Pineapple Planet chapters"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
              padding: '0 14px 14px',
              flexShrink: 0,
            }}
          >
            {BILLY_CHAPTERS.map((chapter, chapterIndex) => {
              const active =
                index >= chapter.start &&
                index < (BILLY_CHAPTERS[chapterIndex + 1]?.start ?? BILLY_QUEST_PANELS.length);
              return (
                <button
                  key={chapter.label}
                  type="button"
                  onClick={() => {
                    setIndex(chapter.start);
                    setTextStep(0);
                  }}
                  style={{
                    border: `1px solid rgba(255, 205, 126, ${active ? 0.56 : 0.22})`,
                    borderRadius: 999,
                    background: active ? 'rgba(255, 190, 82, 0.16)' : 'rgba(255, 238, 196, 0.05)',
                    color: cream(active ? 0.94 : 0.72),
                    fontFamily: SERIF,
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: '8px 9px',
                    textAlign: 'center',
                  }}
                >
                  {chapter.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </main>
  );
}
