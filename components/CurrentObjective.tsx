'use client';

import { useEffect, useState } from 'react';

const LS_KEY = 'colourmap:current-objective';

export default function CurrentObjective() {
  const [objective, setObjective] = useState('');

  useEffect(() => {
    try {
      setObjective(localStorage.getItem(LS_KEY) || '');
    } catch {
      /* silent */
    }
  }, []);

  function save(val: string) {
    setObjective(val);
    try {
      localStorage.setItem(LS_KEY, val);
    } catch {
      /* silent */
    }
  }

  return (
    <div className="space-y-2 px-0 py-1">
      <div className="flex justify-center">
        <div
          className="flex items-center gap-2 rounded-full px-5 py-1.5"
          style={{ background: '#C4A06015', border: '1px solid #C4A06040' }}
        >
          <span
            className="text-center font-bold uppercase tracking-[0.22em]"
            style={{ fontSize: '17px', color: '#C4A060' }}
          >
            Current Objective
          </span>
        </div>
      </div>
      <div className="relative w-full">
        <input
          type="text"
          value={objective}
          onChange={(e) => save(e.target.value)}
          placeholder="set an objective..."
          className="w-full border-b bg-transparent pb-1 text-center outline-none placeholder:text-[#7A5438] placeholder:opacity-50"
          style={{
            color: '#5C3018',
            borderColor: '#C4A06020',
            fontFamily: 'var(--font-handwritten)',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            paddingLeft: '48px',
            paddingRight: '48px',
          }}
        />
        {objective.trim().length > 0 && (
          <button
            type="button"
            onClick={() => save('')}
            title="Mark as done"
            className="absolute right-0 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border transition-all hover:scale-110"
            style={{ borderColor: '#7AAA5860', background: '#7AAA5810' }}
          >
            <span className="text-xs" style={{ color: '#7AAA58' }}>
              ✓
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
