'use client';

import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';

/* ═══════════════════════════════════════════════════════════
   MicDot — a small round button that appears once the user
   starts typing (visible = true). Tap to begin speech
   recognition; the transcript is appended to the current
   field value via onTranscript. Tap again (or on natural
   end) to stop.

   Usage:
     <div style={{ position: 'relative' }}>
       <input value={v} onChange={...} />
       <MicDot
         visible={v.length > 0}
         value={v}
         onTranscript={setValue}
       />
     </div>
   ═══════════════════════════════════════════════════════════ */

interface MicDotProps {
  /** Controls visibility — show once the field has content */
  visible: boolean;
  /** Current field value — used as the base text for appending */
  value: string;
  /** Called with the updated value (base + transcript) on every interim result */
  onTranscript: (v: string) => void;
  lang?: string;
}

export default function MicDot({ visible, value, onTranscript, lang }: MicDotProps) {
  const { listening, supported, start, stop } = useSpeechToText({ lang });

  if (!supported || !visible) return null;

  return (
    <>
      <style>{`
        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>
      <button
        type="button"
        aria-label={listening ? 'Stop dictation' : 'Start dictation'}
        onClick={() => {
          if (listening) stop();
          else start(value, onTranscript);
        }}
        style={{
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: listening ? '#C4A060' : '#C4A06055',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
          animation: listening ? 'mic-pulse 1s ease-in-out infinite' : 'none',
          transition: 'background 0.2s',
        }}
      />
    </>
  );
}
