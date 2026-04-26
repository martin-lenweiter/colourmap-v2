-- Circle decisions — proposed → decided → archived lifecycle
CREATE TABLE IF NOT EXISTS circle_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'proposed',
  decision TEXT,
  decided_at TIMESTAMPTZ,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS circle_decisions_circle_id_idx ON circle_decisions (circle_id);

-- Per-member votes on a decision (yes / no / unsure)
CREATE TABLE IF NOT EXISTS circle_decision_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID NOT NULL,
  member_id UUID NOT NULL,
  member_name TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS circle_decision_votes_decision_id_idx ON circle_decision_votes (decision_id);

-- One vote per member per decision (replaces on re-vote at the app layer,
-- but uniqueness here protects against any race)
CREATE UNIQUE INDEX IF NOT EXISTS circle_decision_votes_decision_member_unique
  ON circle_decision_votes (decision_id, member_id);
