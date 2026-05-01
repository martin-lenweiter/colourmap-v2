-- Row-Level Security (RLS) for all user-owned tables.
--
-- Without RLS, the only barrier between one user's data and another's
-- is the Next.js API layer. RLS adds a second lock inside the database
-- itself: a row can only be read or written by the user it belongs to,
-- regardless of how the database is accessed.
--
-- Policy pattern used throughout:
--   USING      (user_id = auth.uid())  →  controls SELECT / UPDATE / DELETE
--   WITH CHECK (user_id = auth.uid())  →  controls INSERT / UPDATE (new row)
--
-- Run once via: bun run db:migrate
-- Safe to re-run — IF NOT EXISTS guards prevent duplicate policies.

-- ─── Enable RLS on every user-owned table ────────────────────────────────────

ALTER TABLE check_ins              ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions               ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlog                ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_scans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_reflections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_scan_answers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cockpit_sections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_trackers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_objectives       ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_blocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE outings                ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tracker_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_observations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_resonances       ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_missions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_decisions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_decision_votes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels               ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;

-- ─── Per-user tables: owner-only access ──────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'check_ins' AND policyname = 'check_ins_owner') THEN
    CREATE POLICY check_ins_owner ON check_ins
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'missions' AND policyname = 'missions_owner') THEN
    CREATE POLICY missions_owner ON missions
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'backlog' AND policyname = 'backlog_owner') THEN
    CREATE POLICY backlog_owner ON backlog
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_scans' AND policyname = 'life_scans_owner') THEN
    CREATE POLICY life_scans_owner ON life_scans
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scan_reflections' AND policyname = 'scan_reflections_owner') THEN
    CREATE POLICY scan_reflections_owner ON scan_reflections
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_scan_answers' AND policyname = 'life_scan_answers_owner') THEN
    CREATE POLICY life_scan_answers_owner ON life_scan_answers
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cockpit_sections' AND policyname = 'cockpit_sections_owner') THEN
    CREATE POLICY cockpit_sections_owner ON cockpit_sections
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notebook_entries' AND policyname = 'notebook_entries_owner') THEN
    CREATE POLICY notebook_entries_owner ON notebook_entries
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_objectives' AND policyname = 'daily_objectives_owner') THEN
    CREATE POLICY daily_objectives_owner ON daily_objectives
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agenda_blocks' AND policyname = 'agenda_blocks_owner') THEN
    CREATE POLICY agenda_blocks_owner ON agenda_blocks
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'life_categories' AND policyname = 'life_categories_owner') THEN
    CREATE POLICY life_categories_owner ON life_categories
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'outings' AND policyname = 'outings_owner') THEN
    CREATE POLICY outings_owner ON outings
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_tracker_entries' AND policyname = 'daily_tracker_entries_owner') THEN
    CREATE POLICY daily_tracker_entries_owner ON daily_tracker_entries
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'designer_observations' AND policyname = 'designer_observations_owner') THEN
    CREATE POLICY designer_observations_owner ON designer_observations
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sparks' AND policyname = 'sparks_owner') THEN
    CREATE POLICY sparks_owner ON sparks
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'spark_resonances' AND policyname = 'spark_resonances_owner') THEN
    CREATE POLICY spark_resonances_owner ON spark_resonances
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recordings' AND policyname = 'recordings_owner') THEN
    CREATE POLICY recordings_owner ON recordings
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ─── section_trackers: accessible if the parent cockpit_section belongs
--     to the caller — no direct user_id column. ────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'section_trackers' AND policyname = 'section_trackers_owner') THEN
    CREATE POLICY section_trackers_owner ON section_trackers
      USING (
        section_id IN (SELECT id FROM cockpit_sections WHERE user_id = auth.uid())
      )
      WITH CHECK (
        section_id IN (SELECT id FROM cockpit_sections WHERE user_id = auth.uid())
      );
  END IF;
END $$;

-- ─── Circles: visible to all members ─────────────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circles' AND policyname = 'circles_member_read') THEN
    CREATE POLICY circles_member_read ON circles
      FOR SELECT USING (
        id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circles' AND policyname = 'circles_creator_write') THEN
    CREATE POLICY circles_creator_write ON circles
      FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_members' AND policyname = 'circle_members_own') THEN
    CREATE POLICY circle_members_own ON circle_members
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_members' AND policyname = 'circle_members_read_peers') THEN
    -- Members can see other members in circles they belong to
    CREATE POLICY circle_members_read_peers ON circle_members
      FOR SELECT USING (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_missions' AND policyname = 'circle_missions_member') THEN
    CREATE POLICY circle_missions_member ON circle_missions
      USING (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      )
      WITH CHECK (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_notes' AND policyname = 'circle_notes_member') THEN
    CREATE POLICY circle_notes_member ON circle_notes
      USING (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      )
      WITH CHECK (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_sessions' AND policyname = 'circle_sessions_member') THEN
    CREATE POLICY circle_sessions_member ON circle_sessions
      USING (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      )
      WITH CHECK (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_decisions' AND policyname = 'circle_decisions_member') THEN
    CREATE POLICY circle_decisions_member ON circle_decisions
      USING (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      )
      WITH CHECK (
        circle_id IN (SELECT circle_id FROM circle_members WHERE user_id = auth.uid())
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_decision_votes' AND policyname = 'circle_decision_votes_member') THEN
    CREATE POLICY circle_decision_votes_member ON circle_decision_votes
      USING (
        decision_id IN (
          SELECT cd.id FROM circle_decisions cd
          JOIN circle_members cm ON cm.circle_id = cd.circle_id
          WHERE cm.user_id = auth.uid()
        )
      )
      WITH CHECK (member_id = auth.uid());
  END IF;
END $$;

-- ─── Chat: accessible to conversation members ─────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_member') THEN
    CREATE POLICY conversations_member ON conversations
      FOR SELECT USING (
        id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
        OR created_by = auth.uid()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'conversations_creator_insert') THEN
    CREATE POLICY conversations_creator_insert ON conversations
      FOR INSERT WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_members' AND policyname = 'conversation_members_own') THEN
    CREATE POLICY conversation_members_own ON conversation_members
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_members' AND policyname = 'conversation_members_read_peers') THEN
    CREATE POLICY conversation_members_read_peers ON conversation_members
      FOR SELECT USING (
        conversation_id IN (
          SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'channels_member') THEN
    CREATE POLICY channels_member ON channels
      USING (
        conversation_id IN (
          SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        conversation_id IN (
          SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'messages_member') THEN
    CREATE POLICY messages_member ON messages
      USING (
        channel_id IN (
          SELECT ch.id FROM channels ch
          JOIN conversation_members cm ON cm.conversation_id = ch.conversation_id
          WHERE cm.user_id = auth.uid()
        )
      )
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
