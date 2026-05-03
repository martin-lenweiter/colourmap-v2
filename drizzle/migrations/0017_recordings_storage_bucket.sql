-- Supabase Storage bucket + policies for music recordings.
--
-- The `recordings` table (0013) and its DB-level RLS (0016) already exist.
-- This migration wires up the companion Storage layer: creates the private
-- bucket and three per-user storage policies so files are isolated by
-- owner (path prefix = auth.uid()).
--
-- Path convention used by MusicRecordings.tsx:
--   {userId}/{timestamp}-{sanitised-title}.{ext}
-- → storage.foldername(name)[1] === auth.uid()::text  ✓
--
-- Run once via: bun scripts/run-migration.ts drizzle/migrations/0017_recordings_storage_bucket.sql
-- Safe to re-run — INSERT … ON CONFLICT DO NOTHING + IF NOT EXISTS guards.

-- ─── Create bucket ────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  false,           -- private: files only accessible via signed URLs
  524288000,       -- 500 MB per file limit
  ARRAY[
    'audio/webm',
    'audio/ogg',
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/flac',
    'audio/x-m4a',
    'audio/aac',
    'video/webm'   -- Chrome records audio as video/webm
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS policies ─────────────────────────────────────────────────────
-- storage.objects already has RLS enabled by Supabase by default.
-- Each policy checks that the first path segment equals the caller's user ID.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'recordings_insert_own'
  ) THEN
    CREATE POLICY recordings_insert_own ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'recordings'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'recordings_select_own'
  ) THEN
    CREATE POLICY recordings_select_own ON storage.objects
      FOR SELECT
      TO authenticated
      USING (
        bucket_id = 'recordings'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'recordings_delete_own'
  ) THEN
    CREATE POLICY recordings_delete_own ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'recordings'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
