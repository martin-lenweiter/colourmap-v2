-- Music recordings — audio files linked to song notebook entries.
--
-- Files are stored in Supabase Storage bucket 'recordings'.
-- storage_path is the path within the bucket; public_url is the
-- resolved public URL cached at upload time so we never need to
-- re-derive it. song_id is a soft FK (no foreign key constraint)
-- pointing at notebook_entries.id so deleting a song doesn't
-- cascade-delete recordings — the link just becomes null.

CREATE TABLE IF NOT EXISTS recordings (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL,
  title         TEXT        NOT NULL,
  storage_path  TEXT        NOT NULL,
  public_url    TEXT        NOT NULL,
  duration_secs INTEGER,
  song_id       UUID,
  category      TEXT        NOT NULL DEFAULT 'solo',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS recordings_user_idx ON recordings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS recordings_song_idx  ON recordings (song_id) WHERE song_id IS NOT NULL;
