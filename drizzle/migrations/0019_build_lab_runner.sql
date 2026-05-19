-- Build Lab durable phone runner queue.
--
-- This migration creates the Supabase-backed shape needed for "phone anywhere":
-- phone creates missions + uploads screenshots, desktop runner claims missions,
-- laptop executes Codex/Claude locally, and both sides read mission events.
--
-- Safe to re-run where possible: tables/bucket/indexes use IF NOT EXISTS and
-- policies are guarded by pg_policies checks.

-- ─── Tables ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS build_lab_runners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Desktop runner',
  machine text,
  platform text,
  working_directory text,
  approved_project_roots text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'offline'
    CHECK (status IN ('offline', 'online', 'busy', 'error')),
  last_seen_at timestamptz,
  current_mission_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS build_lab_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_id text NOT NULL DEFAULT 'general',
  agent_id text NOT NULL DEFAULT 'codex',
  project_path text NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  mode text NOT NULL DEFAULT 'build'
    CHECK (mode IN ('plan', 'build', 'fix', 'review')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('draft', 'queued', 'running', 'complete', 'failed', 'cancelled')),
  requested_from text NOT NULL DEFAULT 'phone',
  claimed_by uuid REFERENCES build_lab_runners(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  completed_at timestamptz,
  error text,
  result jsonb,
  order_key bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS build_lab_events (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  mission_id uuid NOT NULL REFERENCES build_lab_missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  runner_id uuid REFERENCES build_lab_runners(id) ON DELETE SET NULL,
  type text NOT NULL,
  stream text,
  text text NOT NULL DEFAULT '',
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS build_lab_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES build_lab_missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'screenshot'
    CHECK (kind IN ('screenshot', 'image')),
  name text NOT NULL,
  note text,
  mime_type text,
  storage_path text NOT NULL,
  file_size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS build_lab_runners_user_status_idx
  ON build_lab_runners(user_id, status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS build_lab_missions_user_status_order_idx
  ON build_lab_missions(user_id, status, order_key DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS build_lab_missions_claimed_by_idx
  ON build_lab_missions(claimed_by, status);

CREATE INDEX IF NOT EXISTS build_lab_events_mission_created_idx
  ON build_lab_events(mission_id, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS build_lab_attachments_mission_idx
  ON build_lab_attachments(mission_id, created_at ASC);

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE build_lab_runners     ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_lab_missions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_lab_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_lab_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'build_lab_runners' AND policyname = 'build_lab_runners_owner'
  ) THEN
    CREATE POLICY build_lab_runners_owner ON build_lab_runners
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'build_lab_missions' AND policyname = 'build_lab_missions_owner'
  ) THEN
    CREATE POLICY build_lab_missions_owner ON build_lab_missions
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'build_lab_events' AND policyname = 'build_lab_events_owner'
  ) THEN
    CREATE POLICY build_lab_events_owner ON build_lab_events
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'build_lab_attachments' AND policyname = 'build_lab_attachments_owner'
  ) THEN
    CREATE POLICY build_lab_attachments_owner ON build_lab_attachments
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ─── Storage ───────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'build-lab-attachments',
  'build-lab-attachments',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Path convention:
--   {userId}/{missionId}/{attachmentId}-{safe-name}.{ext}
-- Therefore storage.foldername(name)[1] must equal auth.uid()::text.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'build_lab_attachments_insert_own'
  ) THEN
    CREATE POLICY build_lab_attachments_insert_own ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'build-lab-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'build_lab_attachments_select_own'
  ) THEN
    CREATE POLICY build_lab_attachments_select_own ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'build-lab-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'build_lab_attachments_delete_own'
  ) THEN
    CREATE POLICY build_lab_attachments_delete_own ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'build-lab-attachments'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
