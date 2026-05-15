'use client';

import { useMemo, useState } from 'react';

type Archetype = {
  id: string;
  name: string;
  signal: string;
  stuck: string;
  bridge: string;
};

const archetypes: Archetype[] = [
  {
    id: 'creation',
    name: 'Creation',
    signal: 'ideas, beauty, future worlds, music, visuals',
    stuck: 'Creation becomes relief from practical pressure.',
    bridge: 'Give the vision one container, then choose one practical bridge.',
  },
  {
    id: 'organisation',
    name: 'Organisation',
    signal: 'sorting, planning, folders, priorities, clear next steps',
    stuck: 'Everything stays mental and nothing gets placed.',
    bridge: 'Sort the problem into three visible boxes.',
  },
  {
    id: 'admin',
    name: 'Admin',
    signal: 'bills, papers, money, stability, safety',
    stuck: 'Practical work feels like losing freedom or identity.',
    bridge: 'Map the practical problem before trying to solve it.',
  },
  {
    id: 'builder',
    name: 'Builder',
    signal: 'implementation, commits, tests, tools, shipping',
    stuck: 'Execution becomes narrow and disconnects from meaning.',
    bridge: 'Define the smallest shippable cut.',
  },
  {
    id: 'body',
    name: 'Body / Sport',
    signal: 'sleep, food, movement, sport, breath, pacing',
    stuck: 'The body is ignored until it turns into resistance.',
    bridge: 'Restore enough signal to make the next decision clean.',
  },
  {
    id: 'reflection',
    name: 'Reflection',
    signal: 'meaning, identity, context, long-term truth',
    stuck: 'Meaning expands without becoming one usable action.',
    bridge: 'Turn one insight into one field note or one action.',
  },
  {
    id: 'child',
    name: 'Play',
    signal: 'play, freedom, curiosity, experiments, delight',
    stuck: 'Play is dismissed as unserious or used to avoid structure.',
    bridge: 'Give play a small container, then harvest one useful spark.',
  },
];

function findArchetype(id: string) {
  return archetypes.find((item) => item.id === id) ?? archetypes[0];
}

export default function ArchetypeBridge() {
  const [activeId, setActiveId] = useState('creation');
  const [avoidedId, setAvoidedId] = useState('admin');
  const active = findArchetype(activeId);
  const avoided = findArchetype(avoidedId);

  const reflection = useMemo(() => {
    if (active.id === avoided.id) {
      return `${active.name} is both loud and overloaded. The bridge is to reduce the mode to one small visible move.`;
    }
    return `${active.name} is leading, while ${avoided.name} may be asking for a bridge.`;
  }, [active, avoided]);

  function openArchetypeSun() {
    try {
      window.localStorage.setItem('colourmap:archetype-active', active.id);
      window.localStorage.setItem('colourmap:archetype-avoided', avoided.id);
      window.sessionStorage.setItem('colourmap:geometry-preset', 'Mode Sun');
    } catch {}
    window.location.assign('/geometry-field?preset=Mode%20Sun');
  }

  return (
    <section
      className="rounded-[18px] border p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,248,225,0.9), rgba(239,218,174,0.72))',
        borderColor: 'var(--panel-border, rgba(122,84,56,0.24))',
        boxShadow: '0 10px 30px rgba(92,48,24,0.08)',
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p
            style={{
              color: 'var(--palette-panel-muted, #7A5438)',
              fontFamily: 'var(--font-serif)',
              fontSize: 10,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Mode bridge
          </p>
          <h2
            style={{
              color: 'var(--palette-panel-text, #5C3018)',
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              lineHeight: 1.1,
              marginTop: 4,
            }}
          >
            Move between modes
          </h2>
        </div>
        <span
          style={{
            border: '1px solid rgba(122,84,56,0.22)',
            borderRadius: 999,
            color: 'var(--palette-panel-muted, #7A5438)',
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            padding: '5px 9px',
            textTransform: 'uppercase',
          }}
        >
          In progress
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span
            style={{
              color: 'var(--palette-panel-muted, #7A5438)',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Active mode
          </span>
          <select
            value={activeId}
            onChange={(event) => setActiveId(event.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--panel-border, rgba(122,84,56,0.28))',
              color: 'var(--palette-panel-text, #5C3018)',
            }}
          >
            {archetypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span
            style={{
              color: 'var(--palette-panel-muted, #7A5438)',
              fontFamily: 'var(--font-serif)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Avoided mode
          </span>
          <select
            value={avoidedId}
            onChange={(event) => setAvoidedId(event.target.value)}
            className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2 text-sm"
            style={{
              borderColor: 'var(--panel-border, rgba(122,84,56,0.28))',
              color: 'var(--palette-panel-text, #5C3018)',
            }}
          >
            {archetypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[rgba(122,84,56,0.16)] bg-[rgba(255,253,242,0.58)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A5438]">Signal</p>
          <p className="mt-1 text-sm leading-5 text-[#5C3018]">{active.signal}</p>
        </div>
        <div className="rounded-xl border border-[rgba(122,84,56,0.16)] bg-[rgba(255,253,242,0.58)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A5438]">Stuck loop</p>
          <p className="mt-1 text-sm leading-5 text-[#5C3018]">{active.stuck}</p>
        </div>
        <div className="rounded-xl border border-[rgba(122,84,56,0.16)] bg-[rgba(255,253,242,0.58)] p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7A5438]">Bridge</p>
          <p className="mt-1 text-sm leading-5 text-[#5C3018]">{avoided.bridge}</p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#6F4B2F]">{reflection}</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={openArchetypeSun}
          className="rounded-full border px-4 py-2 text-xs"
          style={{
            borderColor: 'var(--panel-border, rgba(122,84,56,0.28))',
            color: 'var(--palette-panel-text, #5C3018)',
            fontFamily: 'var(--font-serif)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Open Mode Sun
        </button>
      </div>
    </section>
  );
}
