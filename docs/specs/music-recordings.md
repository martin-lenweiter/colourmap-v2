# Music Recordings

> Connect audio recordings to songs in the notebook — band vs solo, organized by song.

## Context

Martin records song ideas, jams, practice sessions, and band recordings on his phone. Right now those recordings live scattered in voice memos with no link to the songs he's writing. This feature brings recordings into the notebook so each recording can be tagged (Band / Solo / Demo / Live / Jam), linked to a specific song entry, and played back in-app.

## Behavior

- "Recordings" appears as a tab in the Music section of the notebook
- Two entry points: **Record** (mic, in-app) and **Upload** (file from device)
- Category pills: All / Band / Solo / Demo / Live / Jam — filter the list
- Each recording card: play/pause, title, linked song name, duration, date, options menu
- Options: link to song, rename, delete
- When recording is playing: minimal waveform animation on the card
- Link to song: shows a dropdown of song_ideas entries; one recording → one song (nullable)
- Delete removes both DB row and Supabase Storage file

## Data Model

```
recordings
  id            uuid PK
  user_id       uuid NOT NULL
  title         text NOT NULL
  storage_path  text NOT NULL   — path within the 'recordings' bucket
  public_url    text NOT NULL   — Supabase Storage public URL
  duration_secs integer         — filled in after upload
  song_id       uuid nullable   — FK → notebook_entries.id
  category      text NOT NULL DEFAULT 'solo'  — band|solo|demo|live|jam
  notes         text
  created_at    timestamptz
```

## Supabase Storage Setup (one-time)

Create a public bucket named `recordings` in Supabase Dashboard → Storage.
Add an RLS policy that allows authenticated users to upload/read/delete within `{user_id}/` prefix.

## Done When

- User can record from mic or upload a file
- Recordings list with working audio player
- Filter by category, filter by song
- Link recording to song with dropdown
- Rename and delete work
- Mobile-friendly (large tap targets, native file picker)
