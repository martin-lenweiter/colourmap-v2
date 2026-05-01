# Speech-to-Text Dot

## Summary

Every writing surface in the app exposes a small speech-to-text trigger — a 9 px ochre dot — that appears inside the text field once the user starts typing. Tapping it listens and appends the spoken transcript to whatever is already in the field. No external API; uses the browser-native Web Speech API.

## Design

- **Trigger visibility**: dot renders only when `value.length > 0` — empty fields stay clean.
- **Placement**: inside the field, bottom-right corner (absolute or fixed depending on context).
- **Color**: `#C4A060` (ochre) — consistent with the primary action color across the app.
- **Active state**: slow pulse animation while listening.
- **Behavior**: continuous mode with interim results; transcript appended to existing value, not replaced.
- **Fallback**: if the browser doesn't support `SpeechRecognition` (`webkitSpeechRecognition`), the dot simply doesn't render — no error state.

## Surfaces

| Component | Field |
|---|---|
| `DailyObjectives` | "Add for today" input, "Push for tomorrow" input |
| `DailyAgenda` | Block title input |
| `ReflectThreeDots` | Journal textarea per level |
| `CheckInForm` | Note textarea |
| `notebook/page.tsx` | Body textarea, Song lyrics textarea |

## Implementation

- **Hook**: `lib/hooks/use-speech-to-text.ts` — wraps `SpeechRecognition`, exposes `{ listening, supported, start, stop }`. `start(baseText, setValue)` captures the base value at listen-start so concurrent state updates don't corrupt the field.
- **Component**: `components/MicDot.tsx` — receives `{ visible, value, onTranscript, lang? }`. Returns `null` when not supported or not visible.

## Browser support

Chrome (desktop + Android), Edge, Safari (iOS 14.5+, macOS). Firefox does not support `SpeechRecognition` as of 2026 — dot is simply hidden.

## Future

Wire into Supabase journal entries once the reflect entries are migrated off localStorage.
