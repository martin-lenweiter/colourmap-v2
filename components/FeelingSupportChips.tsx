'use client';

const SUPPORT_OPTIONS = ['Confidence', 'Openness', 'Gratitude'] as const;

interface FeelingSupportChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function FeelingSupportChips({ value, onChange }: FeelingSupportChipsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {SUPPORT_OPTIONS.map((option) => {
        const isActive = value.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(isActive ? value.filter((item) => item !== option) : [...value, option])
            }
            aria-pressed={isActive}
            aria-label={`Support ${option}`}
            className="rounded-full px-4 py-2 text-xs font-semibold transition-all"
            style={{
              background: isActive ? '#cf9552' : '#edd7b1',
              color: isActive ? '#fff9f0' : '#8f6a47',
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
