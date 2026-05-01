'use client';

import { useEffect } from 'react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app error]', error);
  }, [error]);

  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center"
      role="alert"
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          fontWeight: 600,
          color: '#8A6A4A',
          letterSpacing: '0.06em',
        }}
      >
        Something went wrong
      </span>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          color: '#8A6A4A',
          opacity: 0.6,
          maxWidth: 300,
        }}
      >
        {error.message || 'An unexpected error occurred. Your data is safe.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="cursor-pointer rounded-full px-5 py-1.5 transition-all hover:opacity-80"
        style={{
          background: '#C4A06015',
          border: '1px solid #C4A06040',
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          fontWeight: 700,
          color: '#C4A060',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Try again
      </button>
    </div>
  );
}
