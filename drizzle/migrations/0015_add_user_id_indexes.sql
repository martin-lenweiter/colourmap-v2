-- Indexes on user_id for every table that is queried per-user but was
-- missing one. Without these the DB does a full table scan to find a
-- user's rows — fine at 10 users, slow at 1 000+.

CREATE INDEX IF NOT EXISTS check_ins_user_id_idx
  ON check_ins (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS missions_user_id_idx
  ON missions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS backlog_user_id_idx
  ON backlog (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notebook_entries_user_id_idx
  ON notebook_entries (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS daily_objectives_user_id_idx
  ON daily_objectives (user_id);

CREATE INDEX IF NOT EXISTS agenda_blocks_user_id_idx
  ON agenda_blocks (user_id, date);

CREATE INDEX IF NOT EXISTS life_categories_user_id_idx
  ON life_categories (user_id, position);

CREATE INDEX IF NOT EXISTS outings_user_id_idx
  ON outings (user_id, date);

CREATE INDEX IF NOT EXISTS cockpit_sections_user_id_idx
  ON cockpit_sections (user_id, position);

CREATE INDEX IF NOT EXISTS section_trackers_section_id_idx
  ON section_trackers (section_id, position);

CREATE INDEX IF NOT EXISTS life_scans_user_id_idx
  ON life_scans (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS life_scan_answers_user_id_idx
  ON life_scan_answers (user_id);

CREATE INDEX IF NOT EXISTS scan_reflections_user_id_idx
  ON scan_reflections (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS daily_tracker_entries_user_id_idx
  ON daily_tracker_entries (user_id, date DESC);

CREATE INDEX IF NOT EXISTS circle_members_user_id_idx
  ON circle_members (user_id);
