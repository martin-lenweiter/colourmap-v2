'use client';

interface Mission {
  id: string;
  text: string;
  claimedBy?: string;
  done: boolean;
  due?: string;
}

/*
 * CircleAgenda — week-strip view of all missions across the
 * circle, on one timeline. Each mission shows as a coloured
 * pill in its owner's column, on its due date.
 *
 * Pure-UI on top of existing missions (no new tables) — turns
 * the Circle from a list into a *plan* the band can see at a
 * glance. Per Martin (2026-04-26): item 1 from the Circles
 * evolution list.
 *
 * v1: 14-day strip (yesterday → 13 days out). Past-due missions
 * sit on the leftmost column with a red glow. v2 ideas: drag-
 * reschedule, month grid toggle, per-member filter.
 */

interface AgendaMember {
  id: string;
  name: string;
  color: string;
}

export default function CircleAgenda({
  missions,
  members,
  onTapMission,
}: {
  missions: Mission[];
  members: AgendaMember[];
  onTapMission?: (id: string) => void;
}) {
  // Build 14 day-columns starting from today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { iso: string; label: string; weekday: string; isToday: boolean }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      iso: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      weekday: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()],
      isToday: i === 0,
    });
  }

  // Bucket missions by ISO date. Past-due bucket is "overdue".
  const buckets = new Map<string, Mission[]>();
  buckets.set('overdue', []);
  for (const day of days) buckets.set(day.iso, []);
  for (const m of missions) {
    if (m.done) continue;
    if (!m.due) continue;
    const due = new Date(m.due);
    due.setHours(0, 0, 0, 0);
    const iso = due.toISOString().slice(0, 10);
    if (due < today) {
      buckets.get('overdue')!.push(m);
    } else if (buckets.has(iso)) {
      buckets.get(iso)!.push(m);
    }
  }

  const overdue = buckets.get('overdue') ?? [];
  const memberById = new Map(members.map((m) => [m.id, m]));
  const totalScheduled = days.reduce((acc, d) => acc + (buckets.get(d.iso)?.length ?? 0), 0);

  if (totalScheduled === 0 && overdue.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl"
      style={{
        background: '#C4A06010',
        border: '1px solid #C4A06028',
        padding: '14px 14px 12px',
      }}
    >
      <p
        className="mb-3 text-center uppercase"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: '#7A5438',
          opacity: 0.85,
        }}
      >
        agenda · next 14 days
      </p>

      {overdue.length > 0 && (
        <div
          className="mb-3 rounded-lg"
          style={{
            background: '#B33A2B10',
            border: '1px solid #B33A2B30',
            padding: '8px 10px',
          }}
        >
          <p
            className="mb-1.5 uppercase"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.18em',
              color: '#B33A2B',
            }}
          >
            overdue · {overdue.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {overdue.map((m) => {
              const owner = m.claimedBy ? memberById.get(m.claimedBy) : null;
              const colour = owner?.color || '#B33A2B';
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onTapMission?.(m.id)}
                  className="cursor-pointer rounded-full px-2.5 py-1 transition-all hover:opacity-85"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: colour,
                    background: `${colour}15`,
                    border: `1px solid ${colour}50`,
                    maxWidth: 200,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                  title={m.text}
                >
                  {m.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="-mx-1 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex gap-1.5 px-1" style={{ minWidth: 'min-content' }}>
          {days.map((day) => {
            const dayMissions = buckets.get(day.iso) ?? [];
            return (
              <div key={day.iso} className="flex shrink-0 flex-col gap-1.5" style={{ width: 86 }}>
                {/* Date header */}
                <div
                  className="rounded-md text-center"
                  style={{
                    background: day.isToday ? '#C4A06028' : 'transparent',
                    padding: '4px 0',
                    border: day.isToday ? '1px solid #C4A06060' : '1px solid transparent',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: day.isToday ? '#5C3018' : '#8A6A4A',
                      letterSpacing: '0.12em',
                      opacity: day.isToday ? 1 : 0.6,
                    }}
                  >
                    {day.weekday}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 11,
                      fontWeight: day.isToday ? 700 : 600,
                      color: day.isToday ? '#5C3018' : '#7A5438',
                      opacity: day.isToday ? 1 : 0.7,
                    }}
                  >
                    {day.label}
                  </p>
                </div>
                {/* Mission pills */}
                <div className="flex flex-col gap-1">
                  {dayMissions.length === 0 ? (
                    <span
                      className="block rounded-full"
                      style={{
                        height: 4,
                        background: '#C4A06022',
                        opacity: 0.5,
                        marginTop: 6,
                      }}
                    />
                  ) : (
                    dayMissions.map((m) => {
                      const owner = m.claimedBy ? memberById.get(m.claimedBy) : null;
                      const colour = owner?.color || '#8A6A4A';
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => onTapMission?.(m.id)}
                          className="cursor-pointer rounded-md px-1.5 py-1 text-left transition-all hover:opacity-85"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: 10,
                            fontWeight: 600,
                            color: colour,
                            background: `${colour}15`,
                            border: `1px solid ${colour}40`,
                            lineHeight: 1.25,
                          }}
                          title={`${m.text}${owner ? ` · ${owner.name}` : ''}`}
                        >
                          <span
                            className="block overflow-hidden"
                            style={{
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {m.text}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p
        className="mt-3 text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 10,
          color: '#8A6A4A',
          opacity: 0.55,
          letterSpacing: '0.04em',
        }}
      >
        scroll the strip · pills coloured by owner
      </p>
    </div>
  );
}
