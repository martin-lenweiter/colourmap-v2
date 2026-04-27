-- Designer observations — feedback log captured via the triple-tap
-- dev overlay. Each row is one block of typed feedback plus the part
-- of the app it's about (Day, Music, Circles, etc.).
CREATE TABLE IF NOT EXISTS designer_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS designer_observations_user_id_idx
  ON designer_observations (user_id);
