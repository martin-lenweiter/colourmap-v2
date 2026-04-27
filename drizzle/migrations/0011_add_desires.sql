-- Desires — shared intentions inside Circles, optionally open to the map.
--
-- Performance notes:
--   * PostGIS is enabled for spatial queries. The functional GIST index on
--     (lng, lat) means ST_DWithin geo queries never do full-table scans.
--   * is_open partial index keeps the "public map" query fast regardless
--     of how many private desires accumulate.
--   * expires_at allows a pg_cron / Supabase scheduled function to flip
--     status to 'expired' nightly without touching application code.

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS desires (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL,
  circle_id     UUID,                              -- nullable: cross-circle desire
  text          VARCHAR(200) NOT NULL,
  category      TEXT        NOT NULL DEFAULT 'fun', -- fun | creative | professional | growth
  time_window   TEXT        NOT NULL DEFAULT 'this_week', -- this_week | this_month | no_rush
  is_open       BOOLEAN     NOT NULL DEFAULT FALSE,
  lat           DOUBLE PRECISION,                  -- set only when is_open = true
  lng           DOUBLE PRECISION,
  zone_label    TEXT,                              -- "Near Canal Saint-Martin" (user-supplied)
  status        TEXT        NOT NULL DEFAULT 'active', -- active | fulfilled | expired
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Functional GIST index — used by ST_DWithin for all "nearby" queries.
-- Only indexes rows that actually have coordinates (is_open desires).
CREATE INDEX IF NOT EXISTS desires_location_gist
  ON desires
  USING GIST (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Fast lookups by user and circle.
CREATE INDEX IF NOT EXISTS desires_user_id_idx     ON desires (user_id);
CREATE INDEX IF NOT EXISTS desires_circle_id_idx   ON desires (circle_id) WHERE circle_id IS NOT NULL;
-- Partial index for the public map — scans only open + active rows.
CREATE INDEX IF NOT EXISTS desires_open_active_idx ON desires (created_at DESC)
  WHERE is_open = TRUE AND status = 'active';

-- ─── Resonances ───────────────────────────────────────────────────────────────
-- A resonance is either a soft "I'm interested" (resonate) or a formal
-- "I want to join" (join_request) from someone outside the Circle.

CREATE TABLE IF NOT EXISTS desire_resonances (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  desire_id  UUID  NOT NULL REFERENCES desires(id) ON DELETE CASCADE,
  user_id    UUID  NOT NULL,
  type       TEXT  NOT NULL DEFAULT 'resonate', -- resonate | join_request
  status     TEXT  NOT NULL DEFAULT 'pending',  -- pending | accepted | ignored
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (desire_id, user_id)
);

CREATE INDEX IF NOT EXISTS desire_resonances_desire_id_idx ON desire_resonances (desire_id);
CREATE INDEX IF NOT EXISTS desire_resonances_user_id_idx   ON desire_resonances (user_id);
