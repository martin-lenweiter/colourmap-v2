'use client';

const STAGES = [
  'Closed off',
  'Warming up',
  'Listening in',
  'Searching for more',
  'Opening up',
  'Finding rhythm',
  'Moving clearly',
  'In balance',
];

interface FeelingStageSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

export default function FeelingStageSelector({ value, onChange }: FeelingStageSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {STAGES.map((stage, index) => {
          const stageNumber = index + 1;
          const isActive = value === stageNumber;
          return (
            <button
              key={stage}
              type="button"
              onClick={() => onChange(stageNumber)}
              aria-label={`Stage ${stageNumber}: ${stage}`}
              className="h-7 w-7 rounded-md transition-all"
              style={{
                background: isActive ? '#c98a43' : '#ead4ae',
                opacity: isActive ? 1 : 0.8,
              }}
            />
          );
        })}
      </div>
      {value ? (
        <p className="text-center text-sm italic text-[#ba7c2d]">{`${value}. ${STAGES[value - 1]}`}</p>
      ) : (
        <p className="text-center text-sm italic text-[#c7aa80]">
          Choose the stage that fits today.
        </p>
      )}
    </div>
  );
}
