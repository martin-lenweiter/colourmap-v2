-- Day-sync tables: event log + key-value prefs for all client-side
-- tracking data that was previously localStorage-only.
--
-- Design rationale:
--
--   day_events  — append-only time-series for everything with a timestamp
--                 (axis readings, notes, ritual completions, behavior logs).
--                 The JSONB payload keeps the schema open: new event kinds
--                 never require a migration, just a new `type` string.
--
--   user_prefs  — key-value store for config blobs and preferences
--                 (ritual/behavior definitions, card lists, UI settings).
--                 Again JSONB so each key is free-form.
--
-- Both tables use DEFAULT auth.uid() so browser-side Supabase client
-- inserts never need to specify user_id — the JWT fills it automatically.
-- RLS enforces owner-only access at the database level.

CREATE TABLE IF NOT EXISTS day_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL    DEFAULT auth.uid(),
  date        DATE        NOT NULL    DEFAULT CURRENT_DATE,
  type        TEXT        NOT NULL,
  payload     JSONB       NOT NULL    DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_prefs (
  user_id     UUID        NOT NULL    DEFAULT auth.uid(),
  key         TEXT        NOT NULL,
  value       JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

CREATE INDEX IF NOT EXISTS day_events_user_date_idx ON day_events (user_id, date);

ALTER TABLE day_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_prefs  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'day_events' AND policyname = 'owner'
  ) THEN
    CREATE POLICY "owner" ON day_events
      FOR ALL
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_prefs' AND policyname = 'owner'
  ) THEN
    CREATE POLICY "owner" ON user_prefs
      FOR ALL
      USING      (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
