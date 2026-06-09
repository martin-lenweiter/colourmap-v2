'use client';

type Props = {
  active: 'self' | 'world';
  onSwitchToSelf?: () => void;
  onSwitchToWorld?: () => void;
};

export default function EducationModeSwitch({ active, onSwitchToSelf, onSwitchToWorld }: Props) {
  return (
    <div
      data-testid="education-mode-switch"
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '10px 0 4px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          gap: 0,
          border: '1px solid rgba(36,52,82,0.4)',
          borderRadius: 999,
          background: 'rgba(255,248,231,0.78)',
          padding: 3,
          fontFamily: 'var(--font-serif)',
        }}
      >
        <button
          type="button"
          aria-pressed={active === 'self'}
          aria-current={active === 'self' ? 'page' : undefined}
          onClick={onSwitchToSelf}
          disabled={active === 'self'}
          style={pillStyle(active === 'self', 'self')}
        >
          Self
        </button>
        <button
          type="button"
          aria-pressed={active === 'world'}
          aria-current={active === 'world' ? 'page' : undefined}
          onClick={onSwitchToWorld}
          disabled={active === 'world'}
          style={pillStyle(active === 'world', 'world')}
        >
          World
        </button>
      </div>
    </div>
  );
}

function pillStyle(active: boolean, mode: 'self' | 'world') {
  const activeBg = mode === 'self' ? 'rgba(180,108,52,0.92)' : 'rgba(36,52,82,0.92)';
  const activeFg = '#ffe6aa';
  const idleFg = 'rgba(82,58,38,0.82)';
  return {
    border: 0,
    borderRadius: 999,
    cursor: active ? 'default' : 'pointer',
    fontFamily: 'var(--font-serif)',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.1em',
    padding: '7px 22px',
    textTransform: 'uppercase' as const,
    background: active ? activeBg : 'transparent',
    color: active ? activeFg : idleFg,
  };
}
