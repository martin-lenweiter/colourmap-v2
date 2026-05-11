'use client';

import { useState } from 'react';
import { getProgramByKey } from '@/lib/programs';
import LearningProgram from './LearningProgram';

const SERIF = 'var(--font-serif)';

type Props = {
  programKey: string;
};

export default function LearnMorePill({ programKey }: Props) {
  const [open, setOpen] = useState(false);
  const program = getProgramByKey(programKey);

  if (!program) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 13px 4px 10px',
          borderRadius: 999,
          border: '1px solid var(--palette-panel-muted, rgba(196,160,96,0.3))',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: SERIF,
          fontSize: 11,
          color: 'var(--palette-panel-muted, rgba(196,160,96,0.6))',
          letterSpacing: '0.08em',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            background: 'var(--palette-panel-muted, rgba(196,160,96,0.55))',
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        />
        learn more
      </button>
      {open && <LearningProgram program={program} onClose={() => setOpen(false)} />}
    </>
  );
}
