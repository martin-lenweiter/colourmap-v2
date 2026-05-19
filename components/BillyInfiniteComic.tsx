'use client';

import { useMemo, useState } from 'react';
import { BILLY_QUEST_PANELS } from '@/lib/billy-comic';

const SERIF = 'var(--font-serif)';

function cream(alpha: number) {
  return `rgba(255, 238, 196, ${alpha})`;
}

export default function BillyInfiniteComic() {
  const [index, setIndex] = useState(0);
  const [textStep, setTextStep] = useState(0);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const panel = BILLY_QUEST_PANELS[index];
  const revealed = textStep > 0;
  const complete = index === BILLY_QUEST_PANELS.length - 1 && revealed;

  const earnedMedals = useMemo(
    () =>
      BILLY_QUEST_PANELS.slice(0, index + 1)
        .map((item) => item.medal)
        .filter(Boolean),
    [index],
  );

  function advance() {
    if (!revealed) {
      setTextStep(1);
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

  function choose(choiceId: string) {
    setChosen((existing) => ({ ...existing, [panel.id]: choiceId }));
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        margin: '-40px auto',
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
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 14px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 221, 150, 0.12)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(255, 205, 126, 0.58)',
              }}
            >
              Entertainment
            </div>
            <h1 style={{ margin: '2px 0 0', fontSize: 20, lineHeight: 1 }}>
              Billy & The Quest For Juice
            </h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255, 222, 164, 0.58)' }}>
            {index + 1} / {BILLY_QUEST_PANELS.length}
            <div style={{ marginTop: 3 }}>{earnedMedals.length} medals</div>
          </div>
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
                display: 'block',
                width: '100%',
                border: 0,
                padding: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <img
                src={panel.image}
                alt={`${panel.title} comic panel`}
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                }}
              />
            </button>

            {revealed && (
              <div
                style={{
                  position: 'absolute',
                  left: 12,
                  right: 12,
                  bottom: 12,
                  padding: '13px 14px',
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
                    fontSize: 17,
                    fontWeight: 800,
                    lineHeight: 1.08,
                  }}
                >
                  {panel.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    color: 'rgba(255, 217, 140, 0.9)',
                    fontSize: 13.5,
                    lineHeight: 1.42,
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
                            fontSize: 12,
                            padding: '8px 10px',
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
            onClick={() => {
              if (index === 0) {
                setTextStep(0);
                return;
              }
              setIndex(index - 1);
              setTextStep(0);
            }}
            style={{
              border: 0,
              background: 'transparent',
              color: 'rgba(255, 222, 164, 0.58)',
              fontFamily: SERIF,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            prev
          </button>
          <div
            style={{
              display: 'flex',
              gap: 5,
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: 170,
            }}
          >
            {BILLY_QUEST_PANELS.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Open Billy panel ${itemIndex + 1}`}
                onClick={() => {
                  setIndex(itemIndex);
                  setTextStep(0);
                }}
                style={{
                  width: itemIndex === index ? 18 : 5,
                  height: 5,
                  borderRadius: 999,
                  border: 0,
                  background:
                    itemIndex === index ? 'rgba(255, 205, 126, 0.9)' : 'rgba(255, 205, 126, 0.28)',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={advance}
            style={{
              border: 0,
              background: 'transparent',
              color: 'rgba(255, 222, 164, 0.7)',
              fontFamily: SERIF,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            {!revealed
              ? 'text'
              : textStep < panel.text.length
                ? 'more'
                : complete
                  ? 'done'
                  : 'next'}
          </button>
        </footer>
      </div>
    </main>
  );
}
