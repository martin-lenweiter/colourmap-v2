# Music Tab — Sound Lab + Guitar Studio

> Martin (2026-05-01): "under one music tab. also make sure the chill
> sounds works when u move to other parts of the app. build all this."

## Overview

The `/music` route becomes a single unified tab with two clearly distinct
sections:

1. **Sound Lab** — emotional self-regulation tools (existing: Chill
   Machine, Groove Machine, Magic Maker, Lo-fi Looper, Visuals). Audio
   persists when the user navigates away.
2. **Guitar Studio** — musician creation and learning tools (new): Songs
   with segment editor, Fretboard scale visualizer, Chord library, Theory
   path, Practice log.

The old `/sounds` route redirects to `/music`.

---

## Persistent Audio

The core architectural change: `SoundLab` is moved from the `/sounds`
page into `AppShell` where it is **always mounted** (never unmounted on
navigation). When not on `/music`, it is hidden with `display: none`.
Since `display: none` does not stop JavaScript execution or Web Audio
nodes, music continues playing uninterrupted when the user navigates to
`/day`, `/notebook`, etc.

The `MiniPlayer` pill (already wired to `SoundSessionProvider`) surfaces
the playing state on every page.

---

## Sound Lab section

Identical to the existing SoundLab component, minus the "Songs" tab
(Songs moves to Guitar Studio). Sub-tabs:

- Chill Machine (BinauralTuner)
- Groove Machine
- Magic Maker
- Lo-fi Looper
- Visuals

---

## Guitar Studio section

Five sub-tabs inside Guitar Studio:

### Songs

A songwriter's notebook. Each song has:
- Title · Key (e.g. Am) · Tempo (BPM) · Genre · Status (wip / rehearsed / ready)
- Ordered list of **segments** — each segment has:
  - Type: intro | verse | pre-chorus | chorus | bridge | solo | outro | note
  - Chord progression (text field: "Am G F E")
  - Lyrics / notes textarea
- Segments can be reordered (up/down arrows on mobile, drag handle on desktop)
- Segments can be duplicated or deleted
- Storage: localStorage V1 (Supabase migration in a follow-up PR)

### Fretboard

Interactive SVG guitar neck. Shows which notes belong to any scale in
any key.

- **Root picker**: 12 chromatic buttons (C C# D D# E F F# G G# A A# B).
  Tap to change root — all dots update instantly.
- **Scale picker**: Major · Minor · Pentatonic Minor · Pentatonic Major ·
  Blues · Dorian · Phrygian · Phrygian Dominant · Harmonic Minor
- **SVG neck**: 12 frets, 6 strings (standard tuning E A D G B e)
  - Nut shown at left
  - Fret markers at 3, 5, 7, 9, 12
  - String labels on left
  - Filled circle at every scale note; root in ochre (#C4A060)
  - Scale degree number inside each dot (1–7)
- Responsive: `width="100%"` with fixed `viewBox`

### Chords

Static chord diagram library, grouped by style.

- Filter rail: All · Open · Soul/7ths · Flamenco
- Grid of chord cards, each showing:
  - Chord name
  - SVG chord box (6 strings × 5 frets, finger dots, X/O markers)
  - Style tag pill

Chord sets included:
- **Open**: Am, E, Em, G, C, D, A
- **Soul / 7ths**: Am7, Dm7, G7, Cmaj7, Em7, Fmaj7, E9, A9, Dsus2
- **Flamenco**: Am (Andalusian root), G, F (barre), E, E7 — plus the
  written-out Andalusian cadence (Am→G→F→E) as a progression card

### Learn (stub)

Seven chapter cards showing the progressive theory path. Chapters 1–2
show a brief description; 3–7 show "coming soon." Full interactive
content is a follow-up build.

Chapters:
1. Your first 5 chords (Am E G C D — the CAGED shapes)
2. The pentatonic box (minor pent, first improvisation)
3. The major scale across the neck
4. Chord families (major / minor / 7th / sus)
5. Modes — the emotional colours
6. The Andalusian world (Phrygian Dominant / flamenco)
7. Soul harmony (extended chords, ii-V-I)

### Practice (stub)

Simple session log:
- What did you work on? (text)
- Duration (minutes)
- Date (auto today)
- Save → appends to list
- Last 7 days shown as a strip (localStorage)

---

## Data model (V1 — localStorage)

```ts
// colourmap:songs
type SongStatus = 'wip' | 'rehearsed' | 'ready';
type SegmentType =
  | 'intro' | 'verse' | 'pre-chorus' | 'chorus'
  | 'bridge' | 'solo' | 'outro' | 'note';

interface SongSegment {
  id: string;
  type: SegmentType;
  chords: string;
  text: string;   // lyrics or playing notes
}

interface Song {
  id: string;
  title: string;
  key: string;     // e.g. "Am", "E"
  tempo: number;   // BPM
  genre: string;
  status: SongStatus;
  segments: SongSegment[];
  createdAt: string;
}
```

Supabase migration (`songs` + `song_segments` tables) is tracked in
`docs/specs/platform-safety.md` watch list.

---

## Navigation

`NavLinks`: href `/sounds` → `/music` (label stays "Music")
`app/(app)/sounds/page.tsx`: `redirect('/music')`

---

## Files changed

| Layer | File |
|-------|------|
| Spec | `docs/specs/music-tab.md` |
| Persistent audio | `app/(app)/AppShell.tsx` — always mount SoundLab |
| Unified page | `app/(app)/music/page.tsx` — Guitar Studio section |
| Redirect | `app/(app)/sounds/page.tsx` — redirect to /music |
| Nav | `components/NavLinks.tsx` — href /sounds → /music |
| SoundLab | `components/SoundLab.tsx` — remove Songs tab |
| Guitar container | `components/GuitarStudio.tsx` |
| Fretboard | `components/GuitarFretboard.tsx` |
| Chords | `components/GuitarChords.tsx` |
| Songs | `components/SongStudio.tsx` |
| Learn stub | `components/GuitarLearn.tsx` |
| Practice stub | `components/GuitarPractice.tsx` |
